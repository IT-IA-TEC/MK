-- IT.MK 02: cadastro do IT.MK (usuario, pagador, loja), auditoria com selo, historico de configuracao,
-- politica de guarda, fila de erros do IT.MK e alertas de dado.
-- Nome, WhatsApp, e-mail, pessoas ligadas, empresas e etiquetas do cliente ficam no BL e nunca sao copiados.

-- Usuarios: ligados ao login do Supabase. Nunca apagados, so inativos. Sem perfil/nivel: a visao e unica.
create table public.usuario (
  id uuid primary key references auth.users(id) on delete restrict,
  nome text not null check (length(btrim(nome)) > 0),
  email text not null check (length(btrim(email)) > 0),
  atende boolean not null default true,
  aprova_fila_robo boolean not null default true,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create unique index usuario_email_unico on public.usuario (lower(email));
create trigger tg_registro before insert or update on public.usuario for each row execute function public.tg_registro();
select public.itmk_travar_apagar('public.usuario');

-- Pagador: pessoa com CPF. So o que e do IT.MK (modo de cobranca). O resto vem do BL, por leitura.
create table public.pagador (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  cpf char(11) not null unique check (cpf ~ '^[0-9]{11}$'),
  modo_cobranca text not null default 'padrao do sistema'
    check (modo_cobranca in ('padrao do sistema', 'um Pix por pagador', 'um Pix por loja')),
  ativo boolean not null default true,
  inativado_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (ativo or inativado_em is not null)
);
create trigger tg_registro before insert or update on public.pagador for each row execute function public.tg_registro();
select public.itmk_travar_apagar('public.pagador');

-- Loja: plataforma + codigo (na Shein e o GS). CNPJ nunca entra aqui.
create table public.loja (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  plataforma text not null check (plataforma in ('Shein', 'Mercado Livre', 'Shopee', 'Kwai')),
  codigo_loja text not null check (length(codigo_loja) > 0 and codigo_loja = btrim(codigo_loja)),
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  situacao text not null default 'ativa' check (situacao in ('ativa', 'bloqueada', 'inativa')),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (plataforma, codigo_loja)
);
create index loja_pagador_idx on public.loja (pagador_id);
create index loja_situacao_plataforma_idx on public.loja (situacao, plataforma);
create trigger tg_registro before insert or update on public.loja for each row execute function public.tg_registro();
select public.itmk_travar_apagar('public.loja');

-- Auditoria: so insercao, com selo encadeado (hash SHA-256 da linha anterior e o proprio).
create table public.auditoria (
  id bigint generated always as identity primary key,
  cadeia_pos bigint not null unique,
  ocorrido_em timestamptz not null default now(),
  registrado_em timestamptz not null,
  ator_tipo text not null check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  usuario_id uuid references public.usuario(id) on delete restrict,
  pagador_id bigint references public.pagador(id) on delete restrict,
  acao text not null,
  tabela_nome text,
  registro_id text,
  estado_origem text,
  estado_destino text,
  resultado text not null default 'sucesso' check (resultado in ('sucesso', 'falha', 'ignorado')),
  motivo text,
  antes jsonb,
  depois jsonb,
  hash_anterior text,
  hash_proprio text not null,
  check (ator_tipo <> 'usuario' or usuario_id is not null),
  check (not public.itmk_jsonb_tem_segredo(antes) and not public.itmk_jsonb_tem_segredo(depois))
);
create index auditoria_registro_idx on public.auditoria (tabela_nome, registro_id);
create index auditoria_ocorrido_idx on public.auditoria (ocorrido_em desc);
create index auditoria_usuario_idx on public.auditoria (usuario_id) where usuario_id is not null;
create index auditoria_pagador_idx on public.auditoria (pagador_id) where pagador_id is not null;
create trigger tg_selar before insert on public.auditoria for each row execute function public.tg_selar_linha();
select public.itmk_travar_historico('public.auditoria');

-- Gatilho geral de auditoria: grava quem, quando, antes e depois (so o que mudou).
-- Dado pessoal e texto de mensagem ficam de fora; o pagador aparece so pelo identificador.
create function public.tg_auditar() returns trigger
language plpgsql security definer set search_path = '' set timezone = 'UTC'
as $$
declare
  v_tira text[] := array['cpf', 'telefone', 'destino_telefone', 'conteudo', 'texto', 'corpo', 'copia_cola'];
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

create trigger tg_auditar after insert or update on public.usuario for each row execute function public.tg_auditar();
create trigger tg_auditar after insert or update on public.pagador for each row execute function public.tg_auditar();
create trigger tg_auditar after insert or update on public.loja for each row execute function public.tg_auditar();

-- Historico de configuracao: quem mudou, onde, antes e depois. Segredo nunca entra.
create table public.historico_configuracao (
  id bigint generated always as identity primary key,
  ocorrido_em timestamptz not null default now(),
  tabela_nome text not null,
  linha_id text,
  campo text not null,
  valor_antes jsonb,
  valor_depois jsonb,
  ator_tipo text not null check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  usuario_id uuid references public.usuario(id) on delete restrict,
  motivo text,
  check (ator_tipo <> 'usuario' or usuario_id is not null),
  check (not public.itmk_jsonb_tem_segredo(valor_antes) and not public.itmk_jsonb_tem_segredo(valor_depois))
);
create index historico_configuracao_tabela_idx on public.historico_configuracao (tabela_nome, id desc);
select public.itmk_travar_historico('public.historico_configuracao');

create function public.tg_historico_config() returns trigger
language plpgsql security definer set search_path = '' set timezone = 'UTC'
as $$
declare k text; v_ator text;
begin
  v_ator := coalesce(public.itmk_ator_tipo(), 'sistema');
  for k in select key from jsonb_each(to_jsonb(new))
           where key not in ('atualizado_em', 'versao', 'criado_em', 'criado_por')
  loop
    if (to_jsonb(new) -> k) is distinct from (to_jsonb(old) -> k) then
      insert into public.historico_configuracao
        (tabela_nome, linha_id, campo, valor_antes, valor_depois, ator_tipo, usuario_id, motivo)
      values
        (tg_table_name, to_jsonb(new) ->> 'id', k, to_jsonb(old) -> k, to_jsonb(new) -> k, v_ator,
         case when v_ator = 'usuario' then public.itmk_usuario_id() end, public.itmk_motivo());
    end if;
  end loop;
  return null;
end $$;

-- Politica de guarda da auditoria: vazia ate o parecer; vazia significa guardar para sempre.
create table public.politica_guarda_auditoria (
  id smallint primary key default 1 check (id = 1),
  prazo_guarda_dias integer check (prazo_guarda_dias is null or prazo_guarda_dias > 0),
  parecer_referencia text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
insert into public.politica_guarda_auditoria (id) values (1);
create trigger tg_registro before insert or update on public.politica_guarda_auditoria for each row execute function public.tg_registro();
create trigger tg_historico_config after update on public.politica_guarda_auditoria for each row execute function public.tg_historico_config();
select public.itmk_travar_apagar('public.politica_guarda_auditoria');

-- Fila de erros das integracoes do IT.MK (escuta do BL, WhatsApp, eventos de Pix): nada se perde em silencio.
create table public.fila_erro_integracao (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  origem text not null,
  tipo_erro text not null,
  conteudo jsonb,
  motivo text,
  tentativas integer not null default 0 check (tentativas >= 0),
  situacao text not null default 'pendente' check (situacao in ('pendente', 'reprocessando', 'resolvido', 'descartado')),
  descartado_motivo text,
  descartado_por uuid references public.usuario(id) on delete restrict,
  descartado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (not public.itmk_jsonb_tem_segredo(conteudo)),
  check ((situacao = 'descartado') = (descartado_motivo is not null and descartado_por is not null and descartado_em is not null))
);
create index fila_erro_integracao_situacao_idx on public.fila_erro_integracao (situacao, criado_em);

create function public.tg_fila_erro_regras() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'A fila de erros nao aceita apagar: descarte com motivo.' using errcode = '42501';
  end if;
  if (to_jsonb(new) - array['situacao', 'tentativas', 'atualizado_em', 'descartado_motivo', 'descartado_por', 'descartado_em'])
     is distinct from
     (to_jsonb(old) - array['situacao', 'tentativas', 'atualizado_em', 'descartado_motivo', 'descartado_por', 'descartado_em']) then
    raise exception 'Na fila de erros so podem mudar a situacao, as tentativas e o descarte.' using errcode = '42501';
  end if;
  new.atualizado_em := now();
  return new;
end $$;
create trigger tg_fila_erro_regras before update or delete on public.fila_erro_integracao for each row execute function public.tg_fila_erro_regras();
create trigger tg_fila_erro_vazio before truncate on public.fila_erro_integracao for each statement execute function public.tg_nunca_apagar();
create trigger tg_auditar after insert or update on public.fila_erro_integracao for each row execute function public.tg_auditar();

-- Alertas de dado: CPF que sumiu do BL, corrente de auditoria quebrada, dado inconsistente. Nada e apagado.
create table public.alerta_dado (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('cpf sumiu do BL', 'loja sem dono no BL', 'corrente quebrada', 'dado inconsistente', 'outro')),
  pagador_id bigint references public.pagador(id) on delete restrict,
  loja_id bigint references public.loja(id) on delete restrict,
  detalhe jsonb,
  aberto boolean not null default true,
  criado_em timestamptz not null default now(),
  resolvido_em timestamptz,
  resolvido_por uuid references public.usuario(id) on delete restrict,
  check (not public.itmk_jsonb_tem_segredo(detalhe)),
  check (aberto or resolvido_em is not null)
);
create index alerta_dado_aberto_idx on public.alerta_dado (aberto, tipo);
create index alerta_dado_pagador_idx on public.alerta_dado (pagador_id) where pagador_id is not null;
create index alerta_dado_loja_idx on public.alerta_dado (loja_id) where loja_id is not null;
select public.itmk_travar_apagar('public.alerta_dado');

-- Conferencia diaria das correntes de selo: quebra vira alerta de dado.
create function public.itmk_conferir_cadeias() returns integer
language plpgsql security definer set search_path = ''
as $$
declare t text; r record; n integer := 0;
begin
  foreach t in array array['auditoria', 'robo_execucao', 'robo_acao'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    for r in select * from public.itmk_verificar_cadeia(('public.' || t)::regclass) loop
      if not exists (
        select 1 from public.alerta_dado
        where aberto and tipo = 'corrente quebrada' and detalhe ->> 'tabela' = t and (detalhe ->> 'posicao')::bigint = r.posicao
      ) then
        insert into public.alerta_dado (tipo, detalhe)
        values ('corrente quebrada', jsonb_build_object('tabela', t, 'posicao', r.posicao, 'problema', r.problema));
        n := n + 1;
      end if;
    end loop;
  end loop;
  return n;
end $$;
