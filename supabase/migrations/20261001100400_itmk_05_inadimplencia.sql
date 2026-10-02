-- IT.MK 05: inadimplencia (acordo e parcelas, contestacao, promessa, bloqueio de loja, pedido de saida, baixas e ajustes).

-- Acordo: um so ativo por pagador. Parcelas + entrada fecham no valor total.
create table public.acordo (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  valor_total numeric(14,2) not null check (valor_total > 0),
  entrada numeric(14,2) not null default 0 check (entrada >= 0 and entrada <= valor_total),
  numero_parcelas smallint not null check (numero_parcelas between 1 and 60),
  estado text not null default 'ativo' check (estado in ('ativo', 'quebrado', 'quitado')),
  aprovado_por uuid not null references public.usuario(id) on delete restrict,
  aprovado_em timestamptz not null default now(),
  encerrado_em timestamptz,
  motivo_encerramento text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((estado = 'ativo') = (encerrado_em is null))
);
create unique index acordo_um_ativo_idx on public.acordo (pagador_id) where estado = 'ativo';
create index acordo_pagador_idx on public.acordo (pagador_id, estado);
create index acordo_aprovado_por_idx on public.acordo (aprovado_por);

create function public.tg_acordo_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_max smallint;
begin
  if tg_op = 'INSERT' then
    if public.itmk_ator_tipo() is distinct from 'usuario' then
      raise exception 'Acordo so e aprovado por uma pessoa.' using errcode = '42501';
    end if;
    new.aprovado_por := coalesce(new.aprovado_por, public.itmk_usuario_id());
    select max_parcelas into v_max from public.configuracao_fechamento
      where vigente_desde <= current_date order by vigente_desde desc, versao_regra desc limit 1;
    if new.numero_parcelas > coalesce(v_max, 12) then
      raise exception 'O acordo tem % parcelas e o maximo configurado e %.', new.numero_parcelas, v_max using errcode = '23514';
    end if;
    if new.estado <> 'ativo' then raise exception 'O acordo nasce ativo.'; end if;
    return new;
  end if;
  if new.pagador_id <> old.pagador_id or new.valor_total <> old.valor_total
     or new.entrada <> old.entrada or new.numero_parcelas <> old.numero_parcelas then
    raise exception 'Pagador, valor, entrada e numero de parcelas do acordo nao mudam.' using errcode = '42501';
  end if;
  if old.estado <> 'ativo' and new.estado <> old.estado then
    raise exception 'Acordo % nao volta para outro estado.', old.estado using errcode = '23514';
  end if;
  if old.estado = 'ativo' and new.estado <> 'ativo' then
    new.encerrado_em := coalesce(new.encerrado_em, now());
  end if;
  return new;
end $$;
create trigger tg_acordo_regras before insert or update on public.acordo for each row execute function public.tg_acordo_regras();
create trigger tg_registro before insert or update on public.acordo for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.acordo for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.acordo');

create table public.acordo_cobranca (
  acordo_id bigint not null references public.acordo(id) on delete restrict,
  cobranca_id bigint not null references public.cobranca(id) on delete restrict,
  primary key (acordo_id, cobranca_id)
);
create index acordo_cobranca_cobranca_idx on public.acordo_cobranca (cobranca_id);
select public.itmk_travar_historico('public.acordo_cobranca');

create table public.acordo_parcela (
  id bigint generated always as identity primary key,
  acordo_id bigint not null references public.acordo(id) on delete restrict,
  numero smallint not null check (numero >= 1),
  valor numeric(14,2) not null check (valor > 0),
  vencimento date not null,
  estado text not null default 'aberta' check (estado in ('aberta', 'paga', 'cancelada')),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (acordo_id, numero)
);
create index acordo_parcela_vencimento_idx on public.acordo_parcela (estado, vencimento);

create function public.tg_acordo_parcela_regras() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.valor <> old.valor or new.numero <> old.numero or new.acordo_id <> old.acordo_id then
    raise exception 'Numero, valor e acordo da parcela nao mudam.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger tg_acordo_parcela_regras before update on public.acordo_parcela for each row execute function public.tg_acordo_parcela_regras();
create trigger tg_registro before insert or update on public.acordo_parcela for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.acordo_parcela for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.acordo_parcela');

create function public.tg_acordo_soma() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_id bigint; a record; v_soma numeric; v_qtd integer;
begin
  v_id := (to_jsonb(new) ->> case when tg_table_name = 'acordo' then 'id' else 'acordo_id' end)::bigint;
  select * into a from public.acordo where id = v_id;
  select coalesce(sum(valor), 0), count(*) into v_soma, v_qtd from public.acordo_parcela where acordo_id = v_id;
  if v_soma + a.entrada <> a.valor_total then
    raise exception 'A soma das parcelas (%) mais a entrada (%) e diferente do valor do acordo (%).', v_soma, a.entrada, a.valor_total using errcode = '23514';
  end if;
  if v_qtd <> a.numero_parcelas then
    raise exception 'O acordo tem % parcelas cadastradas e deveria ter %.', v_qtd, a.numero_parcelas using errcode = '23514';
  end if;
  return null;
end $$;
create constraint trigger tg_acordo_soma after insert on public.acordo
  deferrable initially deferred for each row execute function public.tg_acordo_soma();
create constraint trigger tg_acordo_parcela_soma after insert on public.acordo_parcela
  deferrable initially deferred for each row execute function public.tg_acordo_soma();

alter table public.pix
  add constraint pix_acordo_parcela_fk foreign key (acordo_parcela_id) references public.acordo_parcela(id) on delete restrict;

-- Contestacao: situacoes e transicoes fechadas. Robo nunca decide.
create table public.transicao_situacao_contestacao (
  de text not null,
  para text not null,
  primary key (de, para)
);
insert into public.transicao_situacao_contestacao values
  ('Aberta', 'Em análise'), ('Aberta', 'Aguardando cliente'),
  ('Em análise', 'Aguardando cliente'), ('Em análise', 'Procedente'), ('Em análise', 'Improcedente'), ('Em análise', 'Ajustada'),
  ('Aguardando cliente', 'Em análise'),
  ('Procedente', 'Ajustada');

create table public.contestacao (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  cobranca_id bigint not null references public.cobranca(id) on delete restrict,
  motivo text not null check (motivo in ('Valor errado', 'Loja encerrada', 'Pagamento já feito', 'Não reconhece a loja', 'Faturamento diferente', 'Outro')),
  valor_contestado numeric(14,2) not null check (valor_contestado > 0),
  prazo date not null,
  situacao text not null default 'Aberta' check (situacao in ('Aberta', 'Em análise', 'Aguardando cliente', 'Procedente', 'Improcedente', 'Ajustada')),
  aberta_por uuid not null references public.usuario(id) on delete restrict,
  decidida_por uuid references public.usuario(id) on delete restrict,
  decidida_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((situacao in ('Procedente', 'Improcedente', 'Ajustada')) = (decidida_por is not null and decidida_em is not null))
);
create index contestacao_cobranca_idx on public.contestacao (cobranca_id);
create index contestacao_situacao_prazo_idx on public.contestacao (situacao, prazo);
create index contestacao_aberta_por_idx on public.contestacao (aberta_por);
create index contestacao_decidida_por_idx on public.contestacao (decidida_por) where decidida_por is not null;

create table public.contestacao_calculo (
  contestacao_id bigint not null references public.contestacao(id) on delete restrict,
  calculo_id bigint not null references public.calculo_cobranca(id) on delete restrict,
  primary key (contestacao_id, calculo_id)
);
create index contestacao_calculo_calculo_idx on public.contestacao_calculo (calculo_id);
select public.itmk_travar_historico('public.contestacao_calculo');

create table public.contestacao_evento (
  id bigint generated always as identity primary key,
  contestacao_id bigint not null references public.contestacao(id) on delete restrict,
  tipo text not null check (tipo in ('abertura', 'mensagem', 'anexo', 'mudança de situação', 'decisão', 'nota')),
  ator_tipo text not null default 'usuario' check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  autor_id uuid references public.usuario(id) on delete restrict,
  texto text,
  anexos jsonb,
  criado_em timestamptz not null default now(),
  check (ator_tipo <> 'usuario' or autor_id is not null),
  check (tipo <> 'decisão' or ator_tipo = 'usuario')
);
create index contestacao_evento_idx on public.contestacao_evento (contestacao_id, criado_em);
create index contestacao_evento_autor_idx on public.contestacao_evento (autor_id) where autor_id is not null;
select public.itmk_travar_historico('public.contestacao_evento');

create function public.tg_contestacao_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_when = 'AFTER' then
    insert into public.contestacao_calculo (contestacao_id, calculo_id)
      select new.id, i.calculo_id from public.cobranca_item i where i.cobranca_id = new.cobranca_id;
    insert into public.contestacao_evento (contestacao_id, tipo, ator_tipo, autor_id, texto)
      values (new.id, 'abertura', 'usuario', new.aberta_por, 'Contestacao aberta: memoria de calculo vigente anexada.');
    return null;
  end if;
  if tg_op = 'INSERT' then
    new.aberta_por := coalesce(new.aberta_por, public.itmk_usuario_id());
    if new.situacao <> 'Aberta' then raise exception 'A contestacao nasce Aberta.'; end if;
    return new;
  end if;
  if new.cobranca_id <> old.cobranca_id or new.motivo <> old.motivo or new.valor_contestado <> old.valor_contestado then
    raise exception 'Cobranca, motivo e valor contestado nao mudam.' using errcode = '42501';
  end if;
  if new.situacao is distinct from old.situacao then
    if not exists (select 1 from public.transicao_situacao_contestacao where de = old.situacao and para = new.situacao) then
      raise exception 'Transicao da contestacao nao permitida: % para %', old.situacao, new.situacao using errcode = '23514';
    end if;
    if new.situacao in ('Procedente', 'Improcedente', 'Ajustada') then
      if public.itmk_ator_tipo() is distinct from 'usuario' then
        raise exception 'Contestacao so e decidida por uma pessoa: o robo nunca decide.' using errcode = '42501';
      end if;
      new.decidida_por := public.itmk_usuario_id();
      new.decidida_em := now();
    end if;
  end if;
  return new;
end $$;
create trigger tg_contestacao_antes before insert or update on public.contestacao for each row execute function public.tg_contestacao_regras();
create trigger tg_contestacao_depois after insert on public.contestacao for each row execute function public.tg_contestacao_regras();
create trigger tg_registro before insert or update on public.contestacao for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.contestacao for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.contestacao');

-- Ajustes (contestacao procedente ou ajustada) e baixas de cobranca antiga: lancamento novo, nunca edita o valor antigo.
create table public.lancamento_cobranca (
  id bigint generated always as identity primary key,
  cobranca_id bigint not null references public.cobranca(id) on delete restrict,
  tipo text not null check (tipo in ('ajuste', 'baixa')),
  valor numeric(14,2) not null check (valor > 0),
  motivo text not null check (length(btrim(motivo)) > 0),
  motivo_baixa text check (motivo_baixa in ('Passivo antigo sem chance de cobrança', 'Pagamento não registrado', 'Cobrança lançada por engano')),
  contestacao_id bigint references public.contestacao(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid not null references public.usuario(id) on delete restrict,
  check (tipo <> 'baixa' or motivo_baixa is not null),
  check (tipo <> 'ajuste' or contestacao_id is not null)
);
create index lancamento_cobranca_idx on public.lancamento_cobranca (cobranca_id);
create index lancamento_cobranca_contestacao_idx on public.lancamento_cobranca (contestacao_id) where contestacao_id is not null;
create index lancamento_cobranca_criado_por_idx on public.lancamento_cobranca (criado_por);
create function public.tg_lancamento_autor() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.criado_por := coalesce(new.criado_por, public.itmk_usuario_id());
  return new;
end $$;
create trigger tg_lancamento_autor before insert on public.lancamento_cobranca for each row execute function public.tg_lancamento_autor();
create trigger tg_auditar after insert on public.lancamento_cobranca for each row execute function public.tg_auditar();
select public.itmk_travar_historico('public.lancamento_cobranca');

-- Promessa: uma ativa por pagador. Cada resultado entra na linha do tempo com usuario e hora.
create table public.promessa (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  data_prometida date not null,
  prazo_retorno date not null,
  estado text not null default 'ativa' check (estado in ('ativa', 'encerrada')),
  resultado text check (resultado in ('reagendado', 'não atendeu', 'recusou', 'número errado')),
  registrada_por uuid not null references public.usuario(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (prazo_retorno >= data_prometida),
  check ((estado = 'encerrada') = (resultado is not null))
);
create unique index promessa_uma_ativa_idx on public.promessa (pagador_id) where estado = 'ativa';
create index promessa_registrada_por_idx on public.promessa (registrada_por);
create trigger tg_registro before insert or update on public.promessa for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.promessa for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.promessa');

create table public.promessa_resultado (
  id bigint generated always as identity primary key,
  promessa_id bigint not null references public.promessa(id) on delete restrict,
  resultado text not null check (resultado in ('reagendado', 'não atendeu', 'recusou', 'número errado')),
  observacao text,
  registrado_por uuid not null references public.usuario(id) on delete restrict,
  registrado_em timestamptz not null default now()
);
create index promessa_resultado_idx on public.promessa_resultado (promessa_id, registrado_em);
create index promessa_resultado_usuario_idx on public.promessa_resultado (registrado_por);
create function public.tg_promessa_resultado() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_when = 'BEFORE' then
    new.registrado_por := coalesce(new.registrado_por, public.itmk_usuario_id());
    return new;
  end if;
  update public.promessa set resultado = new.resultado, estado = 'encerrada'
    where id = new.promessa_id and estado = 'ativa';
  return null;
end $$;
create trigger tg_promessa_resultado_antes before insert on public.promessa_resultado for each row execute function public.tg_promessa_resultado();
create trigger tg_promessa_resultado_depois after insert on public.promessa_resultado for each row execute function public.tg_promessa_resultado();
select public.itmk_travar_historico('public.promessa_resultado');

-- Bloqueio e desbloqueio de loja: cada passo fica na historia; a situacao da loja so muda por aqui.
create table public.bloqueio_loja (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  loja_id bigint not null references public.loja(id) on delete restrict,
  tipo text not null check (tipo in ('bloqueio', 'desbloqueio')),
  situacao text not null check (situacao in ('a pedir', 'enviado ao grupo', 'confirmado', 'desbloqueio a pedir')),
  data date not null default current_date,
  motivo text not null check (length(btrim(motivo)) > 0),
  pedido_por uuid references public.usuario(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (
    (tipo = 'bloqueio' and situacao in ('a pedir', 'enviado ao grupo', 'confirmado'))
    or (tipo = 'desbloqueio' and situacao in ('desbloqueio a pedir', 'enviado ao grupo', 'confirmado'))
  )
);
create unique index bloqueio_loja_um_aberto_idx on public.bloqueio_loja (loja_id, tipo) where situacao <> 'confirmado';
create index bloqueio_loja_situacao_idx on public.bloqueio_loja (situacao, data);
create index bloqueio_loja_pedido_por_idx on public.bloqueio_loja (pedido_por) where pedido_por is not null;

create table public.bloqueio_historico (
  id bigint generated always as identity primary key,
  bloqueio_id bigint not null references public.bloqueio_loja(id) on delete restrict,
  situacao text not null,
  ator_tipo text not null check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  usuario_id uuid references public.usuario(id) on delete restrict,
  ocorrido_em timestamptz not null default now(),
  observacao text,
  check (ator_tipo <> 'usuario' or usuario_id is not null)
);
create index bloqueio_historico_idx on public.bloqueio_historico (bloqueio_id, ocorrido_em);
create index bloqueio_historico_usuario_idx on public.bloqueio_historico (usuario_id) where usuario_id is not null;
select public.itmk_travar_historico('public.bloqueio_historico');

create function public.tg_bloqueio_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_pagador bigint; v_ator text; v_confirma boolean;
begin
  v_ator := coalesce(public.itmk_ator_tipo(), 'sistema');
  if tg_when = 'BEFORE' then
    if tg_op = 'INSERT' then
      new.pedido_por := coalesce(new.pedido_por, public.itmk_usuario_id());
      if new.situacao in ('a pedir', 'desbloqueio a pedir') then
        select pagador_id into v_pagador from public.loja where id = new.loja_id;
        if new.tipo = 'bloqueio' and (
             exists (select 1 from public.promessa where pagador_id = v_pagador and estado = 'ativa')
          or exists (select 1 from public.acordo where pagador_id = v_pagador and estado = 'ativo')
          or exists (select 1 from public.contestacao c join public.cobranca k on k.id = c.cobranca_id
                     where k.pagador_id = v_pagador and c.situacao in ('Aberta', 'Em análise', 'Aguardando cliente'))
        ) then
          raise exception 'Loja com promessa, acordo ativo ou contestacao ativa nao entra na lista a pedir.' using errcode = '23514';
        end if;
      end if;
      return new;
    end if;
    if new.loja_id <> old.loja_id or new.tipo <> old.tipo then
      raise exception 'Loja e tipo do pedido nao mudam.' using errcode = '42501';
    end if;
    if new.situacao is distinct from old.situacao and not (
         (old.situacao in ('a pedir', 'desbloqueio a pedir') and new.situacao = 'enviado ao grupo')
      or (old.situacao = 'enviado ao grupo' and new.situacao = 'confirmado')
    ) then
      raise exception 'Passo nao permitido: % para %', old.situacao, new.situacao using errcode = '23514';
    end if;
    return new;
  end if;
  -- depois: grava a historia e, ao confirmar, muda a situacao da loja
  insert into public.bloqueio_historico (bloqueio_id, situacao, ator_tipo, usuario_id, observacao)
    values (new.id, new.situacao, v_ator, case when v_ator = 'usuario' then public.itmk_usuario_id() end, public.itmk_motivo());
  v_confirma := false;
  if new.situacao = 'confirmado' then
    if tg_op = 'INSERT' then v_confirma := true;
    elsif old.situacao is distinct from 'confirmado' then v_confirma := true;
    end if;
  end if;
  if v_confirma then
    perform set_config('itmk.via_bloqueio', '1', true);
    update public.loja set situacao = case new.tipo when 'bloqueio' then 'bloqueada' else 'ativa' end
      where id = new.loja_id and situacao in ('ativa', 'bloqueada');
    perform set_config('itmk.via_bloqueio', '', true);
  end if;
  return null;
end $$;
create trigger tg_bloqueio_antes before insert or update on public.bloqueio_loja for each row execute function public.tg_bloqueio_regras();
create trigger tg_bloqueio_depois after insert or update on public.bloqueio_loja for each row execute function public.tg_bloqueio_regras();
create trigger tg_registro before insert or update on public.bloqueio_loja for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.bloqueio_loja for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.bloqueio_loja');

-- A loja so passa a bloqueada, ou volta de bloqueada para ativa, pelo pedido de bloqueio ou desbloqueio.
create function public.tg_loja_situacao() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.situacao is distinct from old.situacao
     and ((new.situacao = 'bloqueada') or (old.situacao = 'bloqueada' and new.situacao = 'ativa'))
     and coalesce(current_setting('itmk.via_bloqueio', true), '') <> '1' then
    raise exception 'A situacao bloqueada da loja so muda pelo pedido de bloqueio ou desbloqueio confirmado.' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger tg_loja_situacao before update on public.loja for each row execute function public.tg_loja_situacao();

-- Pedido de saida de loja.
create table public.pedido_saida (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  data_pedido date not null default current_date,
  data_efetiva date,
  situacao text not null default 'pendente' check (situacao in ('pendente', 'concluída', 'cancelada')),
  motivo text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (situacao <> 'concluída' or data_efetiva is not null)
);
create index pedido_saida_pagador_idx on public.pedido_saida (pagador_id, situacao);
create trigger tg_registro before insert or update on public.pedido_saida for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.pedido_saida for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.pedido_saida');

create table public.pedido_saida_loja (
  pedido_saida_id bigint not null references public.pedido_saida(id) on delete restrict,
  loja_id bigint not null references public.loja(id) on delete restrict,
  primary key (pedido_saida_id, loja_id)
);
create index pedido_saida_loja_idx on public.pedido_saida_loja (loja_id);
select public.itmk_travar_historico('public.pedido_saida_loja');
