-- IT.MK 04: recebimentos (pagamento, divergencia, decisao, devolucao, credito, comprovante).
-- O aviso bruto do provedor fica no BL. Aqui entra o pagamento que o IT.MK confere e baixa.

-- A auditoria deixa de fora tambem o nome de quem pagou.
create or replace function public.tg_auditar() returns trigger
language plpgsql security definer set search_path = '' set timezone = 'UTC'
as $$
declare
  v_tira text[] := array['cpf', 'cpf_pessoa', 'telefone', 'destino_telefone', 'conteudo', 'texto', 'corpo', 'copia_cola', 'quem_pagou_nome'];
  v_cheio_ant jsonb; v_cheio_dep jsonb; v_ant jsonb; v_dep jsonb; v_ref jsonb;
  v_pagador bigint; v_ator text;
begin
  if tg_op in ('UPDATE', 'DELETE') then v_cheio_ant := to_jsonb(old) - v_tira; end if;
  if tg_op in ('INSERT', 'UPDATE') then v_cheio_dep := to_jsonb(new) - v_tira; end if;
  v_ref := coalesce(v_cheio_dep, v_cheio_ant);
  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(a.key, a.value), '{}'::jsonb) into v_ant
      from jsonb_each(v_cheio_ant) a
      where a.key not in ('atualizado_em', 'versao') and (v_cheio_dep -> a.key) is distinct from a.value;
    select coalesce(jsonb_object_agg(d.key, d.value), '{}'::jsonb) into v_dep
      from jsonb_each(v_cheio_dep) d
      where d.key not in ('atualizado_em', 'versao') and (v_cheio_ant -> d.key) is distinct from d.value;
    if v_ant = '{}'::jsonb and v_dep = '{}'::jsonb then return null; end if;
  else
    v_ant := v_cheio_ant; v_dep := v_cheio_dep;
  end if;
  if tg_table_name = 'pagador' then v_pagador := (v_ref ->> 'id')::bigint;
  else v_pagador := (v_ref ->> 'pagador_id')::bigint;
  end if;
  v_ator := coalesce(public.itmk_ator_tipo(), 'sistema');
  insert into public.auditoria
    (ator_tipo, usuario_id, pagador_id, acao, tabela_nome, registro_id, estado_origem, estado_destino, motivo, antes, depois)
  values
    (v_ator, case when v_ator = 'usuario' then public.itmk_usuario_id() end, v_pagador,
     tg_table_name || '.' || lower(tg_op), tg_table_name, v_ref ->> 'id',
     coalesce(v_cheio_ant ->> 'status', v_cheio_ant ->> 'estado', v_cheio_ant ->> 'situacao'),
     coalesce(v_cheio_dep ->> 'status', v_cheio_dep ->> 'estado', v_cheio_dep ->> 'situacao'),
     public.itmk_motivo(), v_ant, v_dep);
  return null;
end $$;

-- Pagamento: o mesmo identificador do provedor nunca entra duas vezes.
-- Sem cobranca ligada = pendente. Desfazer a baixa volta para pendente e nunca apaga.
create table public.pagamento (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  cobranca_id bigint references public.cobranca(id) on delete restrict,
  pix_id bigint references public.pix(id) on delete restrict,
  valor numeric(14,2) not null check (valor > 0),
  moeda char(3) not null default 'BRL' check (moeda = 'BRL'),
  meio text not null check (meio in ('Pix', 'comprovante', 'manual')),
  provedor text check (provedor in ('Asaas', 'Banco Inter')),
  id_transacao_provedor text,
  pago_em timestamptz not null,
  recebido_em timestamptz not null default now(),
  quem_pagou_documento_mascarado text,
  quem_pagou_nome text,
  estado text not null default 'pendente' check (estado in ('pendente', 'baixado')),
  baixado_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (provedor, id_transacao_provedor),
  check ((estado = 'baixado') = (cobranca_id is not null)),
  check ((estado = 'baixado') = (baixado_em is not null)),
  check (meio <> 'Pix' or id_transacao_provedor is not null)
);
create index pagamento_cobranca_idx on public.pagamento (cobranca_id) where cobranca_id is not null;
create index pagamento_pix_idx on public.pagamento (pix_id) where pix_id is not null;
create index pagamento_estado_pago_idx on public.pagamento (estado, pago_em desc);
create index pagamento_sem_cobranca_idx on public.pagamento (pago_em, valor) where estado = 'pendente';

create function public.tg_pagamento_regras() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.valor <> old.valor or new.pago_em <> old.pago_em or new.meio <> old.meio
       or new.provedor is distinct from old.provedor or new.id_transacao_provedor is distinct from old.id_transacao_provedor
       or new.pix_id is distinct from old.pix_id or new.moeda <> old.moeda then
      raise exception 'Valor, data, meio e identificador do pagamento nao mudam.' using errcode = '42501';
    end if;
    if new.estado = 'baixado' and old.estado = 'pendente' then new.baixado_em := coalesce(new.baixado_em, now()); end if;
    if new.estado = 'pendente' and old.estado = 'baixado' then new.baixado_em := null; end if;
  elsif tg_op = 'INSERT' and new.estado = 'baixado' then
    new.baixado_em := coalesce(new.baixado_em, now());
  end if;
  return new;
end $$;
create trigger tg_pagamento_regras before insert or update on public.pagamento for each row execute function public.tg_pagamento_regras();
create trigger tg_registro before insert or update on public.pagamento for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.pagamento for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.pagamento');

-- Divergencia: todo Pix que nao bate vai para uma pessoa decidir. Nada se resolve sozinho.
create table public.divergencia (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagamento_id bigint not null unique references public.pagamento(id) on delete restrict,
  cobranca_esperada_id bigint references public.cobranca(id) on delete restrict,
  valor_esperado numeric(14,2) check (valor_esperado is null or valor_esperado >= 0),
  valor_recebido numeric(14,2) not null check (valor_recebido > 0),
  quem_pagou_documento_mascarado text,
  ocorrido_em timestamptz not null,
  provedor text check (provedor in ('Asaas', 'Banco Inter')),
  identificador text,
  motivo text not null check (motivo in ('Valor diferente', 'Quem pagou é diferente do pagador', 'Pix fora do prazo ou expirado', 'Pagamento duplicado')),
  estado text not null default 'aberta' check (estado in ('aberta', 'decidida')),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create index divergencia_estado_idx on public.divergencia (estado, ocorrido_em);
create index divergencia_cobranca_idx on public.divergencia (cobranca_esperada_id) where cobranca_esperada_id is not null;
create trigger tg_registro before insert or update on public.divergencia for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.divergencia for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.divergencia');

-- Decisao da divergencia: so inserir, so uma pessoa, uma por divergencia.
create table public.decisao_divergencia (
  id bigint generated always as identity primary key,
  divergencia_id bigint not null unique references public.divergencia(id) on delete restrict,
  decisao text not null check (decisao in ('aceitar', 'devolver', 'ligar a outra cobrança', 'guardar como crédito')),
  decidido_por uuid not null references public.usuario(id) on delete restrict,
  decidido_em timestamptz not null default now(),
  motivo text not null check (length(btrim(motivo)) > 0),
  cobranca_destino_id bigint references public.cobranca(id) on delete restrict,
  check (decisao <> 'ligar a outra cobrança' or cobranca_destino_id is not null)
);
create index decisao_divergencia_destino_idx on public.decisao_divergencia (cobranca_destino_id) where cobranca_destino_id is not null;
create index decisao_divergencia_usuario_idx on public.decisao_divergencia (decidido_por);

create function public.tg_decisao_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_pago timestamptz;
begin
  if tg_when = 'BEFORE' then
    if public.itmk_ator_tipo() is distinct from 'usuario' then
      raise exception 'Divergencia so e decidida por uma pessoa: o robo e o sistema nao decidem.' using errcode = '42501';
    end if;
    new.decidido_por := coalesce(new.decidido_por, public.itmk_usuario_id());
    if new.decidido_por is distinct from public.itmk_usuario_id() then
      raise exception 'A decisao precisa ser da pessoa que esta logada.' using errcode = '42501';
    end if;
    if new.decisao = 'devolver' then
      select p.pago_em into v_pago from public.divergencia d join public.pagamento p on p.id = d.pagamento_id where d.id = new.divergencia_id;
      if v_pago is null or now() > v_pago + interval '90 days' then
        raise exception 'Devolucao so vale dentro de 90 dias do Pix.' using errcode = '23514';
      end if;
    end if;
    return new;
  end if;
  update public.divergencia set estado = 'decidida' where id = new.divergencia_id and estado = 'aberta';
  return null;
end $$;
create trigger tg_decisao_antes before insert on public.decisao_divergencia for each row execute function public.tg_decisao_regras();
create trigger tg_decisao_depois after insert on public.decisao_divergencia for each row execute function public.tg_decisao_regras();
create trigger tg_auditar after insert on public.decisao_divergencia for each row execute function public.tg_auditar();
select public.itmk_travar_historico('public.decisao_divergencia');

-- Devolucao: so nasce de uma decisao de devolver e so fecha ao receber o aviso final do provedor.
create table public.devolucao (
  id bigint generated always as identity primary key,
  decisao_id bigint not null unique references public.decisao_divergencia(id) on delete restrict,
  valor numeric(14,2) not null check (valor > 0),
  estado text not null default 'solicitada' check (estado in ('solicitada', 'concluida', 'falhou')),
  concluida_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  criado_por uuid references public.usuario(id) on delete restrict,
  check ((estado = 'concluida') = (concluida_em is not null))
);
create function public.tg_devolucao_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and not exists (select 1 from public.decisao_divergencia where id = new.decisao_id and decisao = 'devolver') then
    raise exception 'Devolucao so nasce de uma decisao de devolver.' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' then
    if new.valor <> old.valor or new.decisao_id <> old.decisao_id then
      raise exception 'Valor e decisao da devolucao nao mudam.' using errcode = '42501';
    end if;
    if old.estado <> 'solicitada' then
      raise exception 'Devolucao % nao muda mais.', old.estado using errcode = '23514';
    end if;
  end if;
  return new;
end $$;
create trigger tg_devolucao_regras before insert or update on public.devolucao for each row execute function public.tg_devolucao_regras();
create trigger tg_registro before insert or update on public.devolucao for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.devolucao for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.devolucao');

-- Credito do pagador: lancamentos de entrada e saida. O saldo e a soma, sem coluna editavel.
create table public.credito_lancamento (
  id bigint generated always as identity primary key,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  tipo text not null check (tipo in ('entrada', 'saida')),
  valor numeric(14,2) not null check (valor > 0),
  motivo text not null check (length(btrim(motivo)) > 0),
  decisao_id bigint references public.decisao_divergencia(id) on delete restrict,
  cobranca_id bigint references public.cobranca(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict
);
create index credito_pagador_idx on public.credito_lancamento (pagador_id);
create index credito_decisao_idx on public.credito_lancamento (decisao_id) where decisao_id is not null;
create index credito_cobranca_idx on public.credito_lancamento (cobranca_id) where cobranca_id is not null;
create function public.tg_credito_saldo() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_saldo numeric;
begin
  new.criado_por := coalesce(new.criado_por, public.itmk_usuario_id());
  if new.tipo = 'saida' then
    perform pg_advisory_xact_lock(hashtextextended('itmk_credito_' || new.pagador_id, 0));
    select coalesce(sum(case tipo when 'entrada' then valor else -valor end), 0) into v_saldo
      from public.credito_lancamento where pagador_id = new.pagador_id;
    if v_saldo < new.valor then
      raise exception 'Saldo de credito insuficiente (% disponivel).', v_saldo using errcode = '23514';
    end if;
  end if;
  return new;
end $$;
create trigger tg_credito_saldo before insert on public.credito_lancamento for each row execute function public.tg_credito_saldo();
create trigger tg_auditar after insert on public.credito_lancamento for each row execute function public.tg_auditar();
select public.itmk_travar_historico('public.credito_lancamento');

-- Comprovante: o arquivo fica no Storage privado; no banco ficam so o caminho e o hash.
create table public.comprovante (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  pagamento_id bigint references public.pagamento(id) on delete restrict,
  arquivo_nome text not null,
  arquivo_hash char(64) not null check (arquivo_hash ~ '^[0-9a-f]{64}$'),
  storage_caminho text not null,
  tipo_arquivo text not null check (tipo_arquivo in ('application/pdf', 'image/jpeg', 'image/png')),
  tamanho_bytes integer not null check (tamanho_bytes between 1 and 10485760),
  valor numeric(14,2) check (valor is null or valor > 0),
  quem_pagou_nome text,
  estado text not null default 'a conferir' check (estado in ('a conferir', 'conferido')),
  conferido_por uuid references public.usuario(id) on delete restrict,
  conferido_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (pagador_id, arquivo_hash),
  check ((estado = 'conferido') = (conferido_por is not null and conferido_em is not null))
);
create index comprovante_estado_idx on public.comprovante (estado, criado_em);
create index comprovante_pagamento_idx on public.comprovante (pagamento_id) where pagamento_id is not null;
create index comprovante_conferido_idx on public.comprovante (conferido_por) where conferido_por is not null;
create trigger tg_registro before insert or update on public.comprovante for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.comprovante for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.comprovante');

-- Bucket privado dos comprovantes (acesso so por link temporario, gerado pelo servidor).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprovantes', 'comprovantes', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;
