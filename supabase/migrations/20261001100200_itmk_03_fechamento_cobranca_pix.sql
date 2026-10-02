-- IT.MK 03: regras do fechamento, status da cobranca, competencia, cobranca, itens, memoria de calculo, Pix e agenda.
-- O calculo (imposto, percentual da 40%, base) vem pronto do BL e e guardado como recebido, em numeric(14,2).
-- O IT.MK so registra o Pix que o BL devolveu. Quem cria o Pix no provedor e o BL.

-- Regras do fechamento do IT.MK, versionadas (mudar cria versao nova; a antiga nunca e editada).
create table public.configuracao_fechamento (
  id bigint generated always as identity primary key,
  versao_regra integer not null unique check (versao_regra >= 1),
  vigente_desde date not null default current_date,
  modo_cobranca_padrao text not null default 'um Pix por pagador'
    check (modo_cobranca_padrao in ('um Pix por pagador', 'um Pix por loja')),
  dia_vencimento smallint not null default 20 check (dia_vencimento between 1 and 28),
  tolerancia numeric(14,2) not null default 0.02 check (tolerancia between 0.01 and 1.00),
  max_parcelas smallint not null default 12 check (max_parcelas between 1 and 60),
  motivo text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict
);
select public.itmk_travar_historico('public.configuracao_fechamento');
insert into public.configuracao_fechamento (versao_regra, motivo) values (1, 'Valores iniciais: vencimento dia 20, tolerancia R$ 0,02, ate 12 parcelas, um Pix por pagador');

create view public.v_configuracao_fechamento_vigente as
  select * from public.configuracao_fechamento
  where vigente_desde <= current_date
  order by vigente_desde desc, versao_regra desc
  limit 1;

-- Lista fechada de status da cobranca e transicoes permitidas.
-- Vencida nao e status: e calculada pelo vencimento e pelo saldo.
create table public.status_cobranca (status text primary key);
insert into public.status_cobranca values ('Em aberto'), ('Parcial'), ('Quitada'), ('Cancelada'), ('Substituída');

create table public.transicao_status_cobranca (
  de text not null references public.status_cobranca(status),
  para text not null references public.status_cobranca(status),
  primary key (de, para),
  check (de <> para)
);
insert into public.transicao_status_cobranca values
  ('Em aberto', 'Parcial'), ('Em aberto', 'Quitada'), ('Em aberto', 'Cancelada'), ('Em aberto', 'Substituída'),
  ('Parcial', 'Em aberto'), ('Parcial', 'Quitada'), ('Parcial', 'Cancelada'), ('Parcial', 'Substituída'),
  ('Quitada', 'Parcial'), ('Quitada', 'Em aberto');

-- Competencia: primeiro dia do mes (date). Fechada fica congelada.
create table public.competencia (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  mes date not null unique check (extract(day from mes) = 1),
  vencimento date not null,
  estado text not null default 'aberta' check (estado in ('aberta', 'fechada')),
  fechada_em timestamptz,
  fechada_por uuid references public.usuario(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (vencimento > mes),
  check ((estado = 'fechada') = (fechada_em is not null and fechada_por is not null))
);
create function public.tg_competencia_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_dia smallint;
begin
  if tg_op = 'INSERT' then
    if new.estado <> 'aberta' then raise exception 'A competencia nasce aberta.'; end if;
    if new.vencimento is null then
      select dia_vencimento into v_dia from public.configuracao_fechamento
        where vigente_desde <= current_date order by vigente_desde desc, versao_regra desc limit 1;
      new.vencimento := (new.mes + interval '1 month')::date + (coalesce(v_dia, 20) - 1);
    end if;
    return new;
  end if;
  if old.estado = 'fechada' then
    raise exception 'Competencia fechada nao aceita mudanca.' using errcode = '42501';
  end if;
  if new.mes <> old.mes then raise exception 'O mes da competencia nao muda.'; end if;
  if new.estado = 'fechada' then
    new.fechada_em := now();
    new.fechada_por := coalesce(new.fechada_por, public.itmk_usuario_id());
  end if;
  return new;
end $$;
create trigger tg_competencia_regras before insert or update on public.competencia for each row execute function public.tg_competencia_regras();
create trigger tg_registro before insert or update on public.competencia for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.competencia for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.competencia');

-- Cobranca: uma por pagador, competencia, tipo e versao. Valor total nunca e editado.
create table public.cobranca (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  competencia_id bigint not null references public.competencia(id) on delete restrict,
  tipo text not null default 'mensal' check (tipo in ('mensal', 'ajuste')),
  numero_versao integer not null default 1 check (numero_versao >= 1),
  vencimento date not null,
  status text not null default 'Em aberto' references public.status_cobranca(status),
  valor_total numeric(14,2) not null check (valor_total >= 0),
  configuracao_fechamento_id bigint references public.configuracao_fechamento(id) on delete restrict,
  substitui_cobranca_id bigint references public.cobranca(id) on delete restrict,
  motivo_substituicao text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (pagador_id, competencia_id, tipo, numero_versao),
  check (numero_versao = 1 or (substitui_cobranca_id is not null and motivo_substituicao is not null))
);
create unique index cobranca_uma_vigente_idx on public.cobranca (pagador_id, competencia_id, tipo)
  where status not in ('Substituída', 'Cancelada');
create index cobranca_status_vencimento_idx on public.cobranca (status, vencimento);
create index cobranca_pagador_idx on public.cobranca (pagador_id, competencia_id);
create index cobranca_competencia_idx on public.cobranca (competencia_id);
create index cobranca_substitui_idx on public.cobranca (substitui_cobranca_id) where substitui_cobranca_id is not null;
create index cobranca_configuracao_idx on public.cobranca (configuracao_fechamento_id);

create function public.tg_cobranca_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'Em aberto' then raise exception 'A cobranca nasce Em aberto.'; end if;
    if new.configuracao_fechamento_id is null then
      select id into new.configuracao_fechamento_id from public.configuracao_fechamento
        where vigente_desde <= current_date order by vigente_desde desc, versao_regra desc limit 1;
    end if;
    return new;
  end if;
  if new.pagador_id <> old.pagador_id or new.competencia_id <> old.competencia_id or new.tipo <> old.tipo
     or new.numero_versao <> old.numero_versao or new.valor_total <> old.valor_total then
    raise exception 'Pagador, competencia, tipo, versao e valor total da cobranca nao mudam: corrigir e criar nova versao ou lancar ajuste.'
      using errcode = '42501';
  end if;
  if new.status is distinct from old.status
     and not exists (select 1 from public.transicao_status_cobranca where de = old.status and para = new.status) then
    raise exception 'Transicao de status nao permitida: % para %', old.status, new.status using errcode = '23514';
  end if;
  return new;
end $$;
create trigger tg_cobranca_regras before insert or update on public.cobranca for each row execute function public.tg_cobranca_regras();
create trigger tg_registro before insert or update on public.cobranca for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.cobranca for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.cobranca');

-- Memoria de calculo: o que o BL calculou, guardado como recebido. Versao velha nunca e editada.
create table public.calculo_cobranca (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  competencia_id bigint not null references public.competencia(id) on delete restrict,
  loja_id bigint not null references public.loja(id) on delete restrict,
  numero_versao integer not null default 1 check (numero_versao >= 1),
  versao_regra_bl text not null,
  base text not null check (base in ('Faturamento total', 'Valor dos produtos sem frete', 'Pedidos concluídos', 'Notas fiscais emitidas', 'Valor manual')),
  faturado numeric(14,2) not null check (faturado >= 0),
  imposto numeric(14,2) not null check (imposto >= 0),
  aliquota numeric(9,6) not null check (aliquota > 0),
  percentual_40 numeric(9,6) not null check (percentual_40 >= 0 and percentual_40 <= 100),
  resultado numeric(14,2) not null check (resultado >= 0),
  fonte text not null check (fonte in ('API', 'planilha', 'manual')),
  periodo_fonte_inicio date,
  periodo_fonte_fim date,
  conferido_por uuid references public.usuario(id) on delete restrict,
  conferido_em timestamptz,
  substitui_calculo_id bigint references public.calculo_cobranca(id) on delete restrict,
  motivo text,
  autor_id uuid references public.usuario(id) on delete restrict,
  recebido_em timestamptz not null default now(),
  unique (competencia_id, loja_id, numero_versao),
  check (resultado = public.arredondar_centavos(imposto * percentual_40 / 100)),
  check (numero_versao = 1 or (substitui_calculo_id is not null and motivo is not null)),
  check ((conferido_por is null) = (conferido_em is null)),
  check (periodo_fonte_inicio is null or periodo_fonte_fim is null or periodo_fonte_fim >= periodo_fonte_inicio)
);
create index calculo_loja_idx on public.calculo_cobranca (loja_id, competencia_id, numero_versao desc);
create index calculo_substitui_idx on public.calculo_cobranca (substitui_calculo_id) where substitui_calculo_id is not null;
create index calculo_conferido_idx on public.calculo_cobranca (conferido_por) where conferido_por is not null;
create index calculo_autor_idx on public.calculo_cobranca (autor_id) where autor_id is not null;
select public.itmk_travar_historico('public.calculo_cobranca');

-- Itens da cobranca: um por loja, com o valor igual ao resultado do calculo recebido do BL.
create table public.cobranca_item (
  id bigint generated always as identity primary key,
  cobranca_id bigint not null references public.cobranca(id) on delete restrict,
  loja_id bigint not null references public.loja(id) on delete restrict,
  calculo_id bigint not null references public.calculo_cobranca(id) on delete restrict,
  valor numeric(14,2) not null check (valor >= 0),
  criado_em timestamptz not null default now(),
  unique (cobranca_id, loja_id)
);
create index cobranca_item_loja_idx on public.cobranca_item (loja_id);
create index cobranca_item_calculo_idx on public.cobranca_item (calculo_id);

create function public.tg_cobranca_item_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare c record; k record;
begin
  select * into c from public.calculo_cobranca where id = new.calculo_id;
  select * into k from public.cobranca where id = new.cobranca_id;
  if c.loja_id <> new.loja_id or c.competencia_id <> k.competencia_id then
    raise exception 'O calculo nao e da mesma loja e competencia do item.' using errcode = '23514';
  end if;
  if new.valor <> c.resultado then
    raise exception 'O valor do item (%) precisa ser igual ao resultado do calculo (%).', new.valor, c.resultado using errcode = '23514';
  end if;
  return new;
end $$;
create trigger tg_cobranca_item_regras before insert on public.cobranca_item for each row execute function public.tg_cobranca_item_regras();
select public.itmk_travar_historico('public.cobranca_item');

-- O total da cobranca e igual a soma dos itens, conferido ao fechar a transacao.
create function public.tg_cobranca_soma() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_id bigint; v_total numeric; v_soma numeric;
begin
  v_id := case when tg_table_name = 'cobranca' then new.id else new.cobranca_id end;
  select valor_total into v_total from public.cobranca where id = v_id;
  select coalesce(sum(valor), 0) into v_soma from public.cobranca_item where cobranca_id = v_id;
  if v_total is not null and v_soma <> v_total then
    raise exception 'A soma dos itens (%) e diferente do total da cobranca (%).', v_soma, v_total using errcode = '23514';
  end if;
  return null;
end $$;
create constraint trigger tg_cobranca_soma after insert on public.cobranca
  deferrable initially deferred for each row execute function public.tg_cobranca_soma();
create constraint trigger tg_cobranca_item_soma after insert on public.cobranca_item
  deferrable initially deferred for each row execute function public.tg_cobranca_soma();

-- Pix: o IT.MK registra o que o BL devolveu. Pix pago nao volta. Valor nao muda.
create table public.pix (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  cobranca_id bigint references public.cobranca(id) on delete restrict,
  acordo_parcela_id bigint,
  loja_id bigint references public.loja(id) on delete restrict,
  numero_parcela smallint check (numero_parcela is null or numero_parcela >= 1),
  provedor text not null check (provedor in ('Asaas', 'Banco Inter')),
  identificador_nosso text not null unique,
  identificador_provedor text unique,
  copia_cola text,
  link text,
  vencimento date not null,
  prazo_final date not null,
  valor numeric(14,2) not null check (valor > 0),
  estado text not null default 'Gerado' check (estado in ('Gerado', 'Enviado', 'Pago', 'Expirado', 'Cancelado')),
  enviado_em timestamptz,
  pago_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (cobranca_id is not null or acordo_parcela_id is not null),
  check (prazo_final >= vencimento),
  check ((estado = 'Pago') = (pago_em is not null)),
  check (
    (provedor = 'Banco Inter' and identificador_nosso ~ '^[A-Za-z0-9]{26,35}$')
    or (provedor = 'Asaas' and identificador_nosso ~ '^[A-Za-z0-9_-]{1,100}$')
  )
);
create index pix_cobranca_idx on public.pix (cobranca_id) where cobranca_id is not null;
create index pix_parcela_idx on public.pix (acordo_parcela_id) where acordo_parcela_id is not null;
create index pix_loja_idx on public.pix (loja_id) where loja_id is not null;
create index pix_estado_prazo_idx on public.pix (estado, prazo_final);
-- Um Pix por pagador: um por cobranca. Um Pix por loja: um por loja. Parcela: um por parcela.
create unique index pix_um_por_cobranca_idx on public.pix (cobranca_id)
  where loja_id is null and acordo_parcela_id is null and estado not in ('Cancelado', 'Expirado');
create unique index pix_um_por_loja_idx on public.pix (cobranca_id, loja_id)
  where loja_id is not null and acordo_parcela_id is null and estado not in ('Cancelado', 'Expirado');
create unique index pix_um_por_parcela_idx on public.pix (acordo_parcela_id, loja_id) nulls not distinct
  where acordo_parcela_id is not null and estado not in ('Cancelado', 'Expirado');

create function public.tg_pix_regras() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.valor <> old.valor or new.vencimento <> old.vencimento or new.identificador_nosso <> old.identificador_nosso
       or new.provedor <> old.provedor or new.cobranca_id is distinct from old.cobranca_id
       or new.acordo_parcela_id is distinct from old.acordo_parcela_id or new.loja_id is distinct from old.loja_id then
      raise exception 'Valor, vencimento, identificador, provedor e ligacoes do Pix nao mudam.' using errcode = '42501';
    end if;
    if new.estado is distinct from old.estado then
      if old.estado in ('Pago', 'Expirado', 'Cancelado') then
        raise exception 'Pix % nao volta para outro estado.', old.estado using errcode = '23514';
      end if;
      if old.estado = 'Enviado' and new.estado = 'Gerado' then
        raise exception 'Pix Enviado nao volta para Gerado.' using errcode = '23514';
      end if;
      if new.estado = 'Pago' then new.pago_em := coalesce(new.pago_em, now()); end if;
      if new.estado = 'Enviado' then new.enviado_em := coalesce(new.enviado_em, now()); end if;
    end if;
  end if;
  return new;
end $$;
create trigger tg_pix_regras before update on public.pix for each row execute function public.tg_pix_regras();
create trigger tg_registro before insert or update on public.pix for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.pix for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.pix');

-- Agenda do envio da cobranca do mes.
create table public.agenda_envio (
  id bigint generated always as identity primary key,
  competencia_id bigint not null references public.competencia(id) on delete restrict,
  enviar_em timestamptz not null,
  estado text not null default 'agendado' check (estado in ('agendado', 'enviado', 'cancelado')),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create index agenda_envio_estado_idx on public.agenda_envio (estado, enviar_em);
create index agenda_envio_competencia_idx on public.agenda_envio (competencia_id);
create trigger tg_registro before insert or update on public.agenda_envio for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.agenda_envio for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.agenda_envio');
