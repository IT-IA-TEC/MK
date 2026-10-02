-- IT.MK 06: modelos de mensagem, regua, destino da cobranca, limites do robo, feriados, WhatsApp,
-- situacao do robo por pagador, opt-out e opt-in, fila de envio e etiquetas da conversa.
-- Percentual da 40%, aliquota, base, provedor de Pix, juros, multa e validade do link ficam no BL.

-- Variaveis permitidas nos modelos de mensagem (lista fechada, ampliada por dado).
create table public.variavel_mensagem (nome text primary key check (nome ~ '^[a-z_]+$'));
insert into public.variavel_mensagem values
  ('nome'), ('competencia'), ('total'), ('vencimento'), ('pix'), ('loja'), ('saldo'), ('dias_atraso'), ('plataforma'), ('link');

-- Modelos de mensagem: texto aprovado nunca e editado; mudar cria versao nova que precisa de nova aprovacao.
create table public.modelo_mensagem (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  nome text not null check (length(btrim(nome)) > 0),
  versao_modelo integer not null default 1 check (versao_modelo >= 1),
  texto text not null check (length(btrim(texto)) > 0),
  estado text not null default 'rascunho' check (estado in ('rascunho', 'aprovado', 'substituído')),
  aprovado_por uuid references public.usuario(id) on delete restrict,
  aprovado_em timestamptz,
  substitui_modelo_id bigint references public.modelo_mensagem(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (nome, versao_modelo),
  check ((estado = 'rascunho') = (aprovado_por is null and aprovado_em is null)),
  check (versao_modelo = 1 or substitui_modelo_id is not null)
);
create index modelo_mensagem_estado_idx on public.modelo_mensagem (estado, nome);
create index modelo_mensagem_substitui_idx on public.modelo_mensagem (substitui_modelo_id) where substitui_modelo_id is not null;
create index modelo_mensagem_aprovado_por_idx on public.modelo_mensagem (aprovado_por) where aprovado_por is not null;

create function public.tg_modelo_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v text;
begin
  if tg_when = 'AFTER' then
    if new.estado = 'aprovado' and new.substitui_modelo_id is not null then
      update public.modelo_mensagem set estado = 'substituído' where id = new.substitui_modelo_id and estado = 'aprovado';
    end if;
    return null;
  end if;
  for v in select m[1] from regexp_matches(new.texto, '\{\{\s*([A-Za-z0-9_]+)\s*\}\}', 'g') as m loop
    if not exists (select 1 from public.variavel_mensagem where nome = v) then
      raise exception 'A variavel {{%}} nao esta na lista permitida.', v using errcode = '23514';
    end if;
  end loop;
  if tg_op = 'UPDATE' then
    if old.estado <> 'rascunho' and new.texto <> old.texto then
      raise exception 'Texto aprovado nunca e editado: crie uma versao nova.' using errcode = '42501';
    end if;
    if new.nome <> old.nome or new.versao_modelo <> old.versao_modelo then
      raise exception 'Nome e versao do modelo nao mudam.' using errcode = '42501';
    end if;
    if new.estado is distinct from old.estado then
      if not ((old.estado = 'rascunho' and new.estado = 'aprovado') or (old.estado = 'aprovado' and new.estado = 'substituído')) then
        raise exception 'Mudanca de estado do modelo nao permitida: % para %', old.estado, new.estado using errcode = '23514';
      end if;
      if new.estado = 'aprovado' then
        if public.itmk_ator_tipo() is distinct from 'usuario' then
          raise exception 'Modelo so e aprovado por uma pessoa.' using errcode = '42501';
        end if;
        new.aprovado_por := public.itmk_usuario_id();
        new.aprovado_em := now();
      end if;
    end if;
  elsif new.estado <> 'rascunho' then
    raise exception 'O modelo nasce como rascunho e precisa de aprovacao.' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger tg_modelo_antes before insert or update on public.modelo_mensagem for each row execute function public.tg_modelo_regras();
create trigger tg_modelo_depois after update on public.modelo_mensagem for each row execute function public.tg_modelo_regras();
create trigger tg_registro before insert or update on public.modelo_mensagem for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.modelo_mensagem for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.modelo_mensagem');

-- Regua de cobranca como dados validados. As etapas de bloqueio sao regra de calendario
-- (relativas ao ultimo dia do mes do vencimento), nao um numero fixo de dias.
create table public.regua (
  id bigint generated always as identity primary key,
  nome text not null unique,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create trigger tg_registro before insert or update on public.regua for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.regua for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.regua');
insert into public.regua (nome) values ('Padrão');

create table public.etapa_regua (
  id bigint generated always as identity primary key,
  regua_id bigint not null references public.regua(id) on delete restrict,
  nome text not null,
  referencia text not null check (referencia in ('vencimento', 'último dia do mês do vencimento')),
  dias smallint not null check (dias between -60 and 120),
  acao text not null check (acao in ('lembrete', 'cobrança', 'aviso de bloqueio', 'pedir bloqueio')),
  modelo_id bigint references public.modelo_mensagem(id) on delete restrict,
  ativa boolean not null default false,
  condicao text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  unique (regua_id, referencia, dias)
);
create index etapa_regua_modelo_idx on public.etapa_regua (modelo_id) where modelo_id is not null;
create function public.tg_etapa_regua_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.modelo_id is not null and not exists (select 1 from public.modelo_mensagem where id = new.modelo_id and estado = 'aprovado') then
    raise exception 'A etapa so aponta para modelo aprovado.' using errcode = '23514';
  end if;
  if new.ativa and new.acao in ('lembrete', 'cobrança', 'aviso de bloqueio') and new.modelo_id is null then
    raise exception 'Etapa que envia mensagem precisa de modelo aprovado para ficar ativa.' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger tg_etapa_regua_regras before insert or update on public.etapa_regua for each row execute function public.tg_etapa_regua_regras();
create trigger tg_registro before insert or update on public.etapa_regua for each row execute function public.tg_registro();
create trigger tg_historico_config after update on public.etapa_regua for each row execute function public.tg_historico_config();
create trigger tg_auditar after insert on public.etapa_regua for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.etapa_regua');
-- As seis etapas de partida nascem desligadas: nada sai antes de existir modelo aprovado.
insert into public.etapa_regua (regua_id, nome, referencia, dias, acao)
select r.id, e.nome, e.referencia, e.dias, e.acao from public.regua r,
(values
  ('Lembrete', 'vencimento', -2, 'lembrete'),
  ('Vencimento', 'vencimento', 0, 'cobrança'),
  ('Atraso 1', 'vencimento', 3, 'cobrança'),
  ('Atraso 2', 'vencimento', 5, 'cobrança'),
  ('Aviso de bloqueio', 'último dia do mês do vencimento', -3, 'aviso de bloqueio'),
  ('Pedir bloqueio', 'último dia do mês do vencimento', 0, 'pedir bloqueio')
) as e(nome, referencia, dias, acao)
where r.nome = 'Padrão';

create table public.excecao_regua_pagador (
  id bigint generated always as identity primary key,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  tipo text not null check (tipo in ('Não cobrar', 'Régua mais firme', 'Régua mais leve')),
  motivo text not null check (length(btrim(motivo)) > 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create unique index excecao_regua_pagador_ativa_idx on public.excecao_regua_pagador (pagador_id) where ativo;
create trigger tg_registro before insert or update on public.excecao_regua_pagador for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.excecao_regua_pagador for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.excecao_regua_pagador');

-- Destino da cobranca: padrao do sistema (nasce em "nao enviar ate escolher") e escolha por pagador.
create table public.destino_cobranca_padrao (
  id smallint primary key default 1 check (id = 1),
  opcao text not null default 'não enviar até escolher'
    check (opcao in ('cada loja ao seu responsável', 'uma pessoa escolhida', 'todos os responsáveis', 'não enviar até escolher')),
  cpf_pessoa char(11) check (cpf_pessoa is null or cpf_pessoa ~ '^[0-9]{11}$'),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((opcao = 'uma pessoa escolhida') = (cpf_pessoa is not null))
);
insert into public.destino_cobranca_padrao (id) values (1);

create table public.destino_cobranca_pagador (
  id bigint generated always as identity primary key,
  pagador_id bigint not null unique references public.pagador(id) on delete restrict,
  opcao text not null
    check (opcao in ('cada loja ao seu responsável', 'uma pessoa escolhida', 'todos os responsáveis', 'não enviar até escolher')),
  cpf_pessoa char(11) check (cpf_pessoa is null or cpf_pessoa ~ '^[0-9]{11}$'),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((opcao = 'uma pessoa escolhida') = (cpf_pessoa is not null))
);

create table public.destino_cobranca_historico (
  id bigint generated always as identity primary key,
  pagador_id bigint references public.pagador(id) on delete restrict,
  opcao_antiga text,
  cpf_antigo char(11),
  opcao_nova text not null,
  cpf_novo char(11),
  ator_tipo text not null check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  usuario_id uuid references public.usuario(id) on delete restrict,
  ocorrido_em timestamptz not null default now(),
  motivo text,
  check (ator_tipo <> 'usuario' or usuario_id is not null)
);
create index destino_cobranca_historico_pagador_idx on public.destino_cobranca_historico (pagador_id, ocorrido_em desc);
create index destino_cobranca_historico_usuario_idx on public.destino_cobranca_historico (usuario_id) where usuario_id is not null;
select public.itmk_travar_historico('public.destino_cobranca_historico');

create function public.tg_destino_historico() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_ator text; v_pagador bigint;
begin
  v_ator := coalesce(public.itmk_ator_tipo(), 'sistema');
  v_pagador := (to_jsonb(new) ->> 'pagador_id')::bigint;
  if tg_op = 'UPDATE' and new.opcao = old.opcao and new.cpf_pessoa is not distinct from old.cpf_pessoa then
    return null;
  end if;
  insert into public.destino_cobranca_historico
    (pagador_id, opcao_antiga, cpf_antigo, opcao_nova, cpf_novo, ator_tipo, usuario_id, motivo)
  values
    (v_pagador, case when tg_op = 'UPDATE' then old.opcao end, case when tg_op = 'UPDATE' then old.cpf_pessoa end,
     new.opcao, new.cpf_pessoa, v_ator, case when v_ator = 'usuario' then public.itmk_usuario_id() end, public.itmk_motivo());
  return null;
end $$;
create trigger tg_registro before insert or update on public.destino_cobranca_padrao for each row execute function public.tg_registro();
create trigger tg_destino_historico after update on public.destino_cobranca_padrao for each row execute function public.tg_destino_historico();
create trigger tg_registro before insert or update on public.destino_cobranca_pagador for each row execute function public.tg_registro();
create trigger tg_destino_historico after insert or update on public.destino_cobranca_pagador for each row execute function public.tg_destino_historico();
select public.itmk_travar_apagar('public.destino_cobranca_padrao');
select public.itmk_travar_apagar('public.destino_cobranca_pagador');

-- Limites, horarios e feriados do robo: a WhatsGW nao controla isso. O robo nasce pausado e em modo sombra.
create table public.robo_configuracao (
  id smallint primary key default 1 check (id = 1),
  robo_pausado boolean not null default true,
  modo_sombra boolean not null default true,
  limite_dia_total integer not null default 40 check (limite_dia_total > 0),
  limite_pagador_dia integer not null default 1 check (limite_pagador_dia > 0),
  intervalo_minimo_min integer not null default 180 check (intervalo_minimo_min >= 0),
  horario_inicio time not null default '09:00',
  horario_fim time not null default '17:30',
  dias_semana smallint[] not null default '{1,2,3,4,5}'
    check (cardinality(dias_semana) > 0 and dias_semana <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  nao_enviar_feriados boolean not null default true,
  fuso text not null default 'America/Sao_Paulo',
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (horario_fim > horario_inicio)
);
insert into public.robo_configuracao (id) values (1);
create function public.tg_robo_configuracao_regras() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if (new.limite_dia_total > old.limite_dia_total or new.limite_pagador_dia > old.limite_pagador_dia
      or new.intervalo_minimo_min < old.intervalo_minimo_min) and public.itmk_motivo() is null then
    raise exception 'Subir um limite do robo exige informar o motivo.' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger tg_robo_configuracao_regras before update on public.robo_configuracao for each row execute function public.tg_robo_configuracao_regras();
create trigger tg_registro before insert or update on public.robo_configuracao for each row execute function public.tg_registro();
create trigger tg_historico_config after update on public.robo_configuracao for each row execute function public.tg_historico_config();
select public.itmk_travar_apagar('public.robo_configuracao');

create table public.feriado (
  id bigint generated always as identity primary key,
  data date not null unique,
  descricao text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create trigger tg_registro before insert or update on public.feriado for each row execute function public.tg_registro();
create trigger tg_historico_config after update on public.feriado for each row execute function public.tg_historico_config();
select public.itmk_travar_apagar('public.feriado');

-- Conexao do WhatsApp do robo. Desconectado ou restrito pausa o robo; a volta depende de uma pessoa.
create table public.whatsapp_canal (
  id smallint primary key default 1 check (id = 1),
  numero text check (numero is null or numero ~ '^[0-9]{10,15}$'),
  modo text not null default 'QR' check (modo in ('QR', 'Oficial')),
  estado text not null default 'desconectado' check (estado in ('conectado', 'desconectado', 'restrito')),
  conectado_desde timestamptz,
  restricao_ate timestamptz,
  aguardando_confirmacao boolean not null default true,
  confirmado_por uuid references public.usuario(id) on delete restrict,
  confirmado_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
insert into public.whatsapp_canal (id) values (1);

create table public.whatsapp_estado_historico (
  id bigint generated always as identity primary key,
  estado text not null check (estado in ('conectado', 'desconectado', 'restrito')),
  origem text not null check (origem in ('phonestate', 'account_health', 'manual')),
  ocorrido_em timestamptz not null default now(),
  registrado_em timestamptz not null default now(),
  usuario_id uuid references public.usuario(id) on delete restrict
);
create index whatsapp_estado_historico_idx on public.whatsapp_estado_historico (ocorrido_em desc);
create index whatsapp_estado_historico_usuario_idx on public.whatsapp_estado_historico (usuario_id) where usuario_id is not null;
select public.itmk_travar_historico('public.whatsapp_estado_historico');

create function public.tg_whatsapp_canal_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_origem text;
begin
  if tg_when = 'AFTER' then
    v_origem := coalesce(nullif(current_setting('itmk.origem_whatsapp', true), ''), 'manual');
    if v_origem not in ('phonestate', 'account_health', 'manual') then v_origem := 'manual'; end if;
    insert into public.whatsapp_estado_historico (estado, origem, usuario_id)
      values (new.estado, v_origem, case when public.itmk_ator_tipo() = 'usuario' then public.itmk_usuario_id() end);
    return null;
  end if;
  if new.estado is distinct from old.estado then
    if new.estado = 'conectado' then
      if public.itmk_ator_tipo() is distinct from 'usuario' then
        raise exception 'A volta para conectado precisa da confirmacao de uma pessoa.' using errcode = '42501';
      end if;
      if old.estado = 'restrito' and old.restricao_ate is not null and old.restricao_ate > now() then
        raise exception 'O numero ainda esta restrito ate %.', old.restricao_ate using errcode = '23514';
      end if;
      new.conectado_desde := now();
      new.aguardando_confirmacao := false;
      new.confirmado_por := public.itmk_usuario_id();
      new.confirmado_em := now();
      new.restricao_ate := null;
    else
      new.aguardando_confirmacao := true;
      new.conectado_desde := null;
    end if;
  end if;
  return new;
end $$;
create trigger tg_whatsapp_canal_antes before update on public.whatsapp_canal for each row execute function public.tg_whatsapp_canal_regras();
create trigger tg_whatsapp_canal_depois after update on public.whatsapp_canal for each row
  when (old.estado is distinct from new.estado) execute function public.tg_whatsapp_canal_regras();
create trigger tg_registro before insert or update on public.whatsapp_canal for each row execute function public.tg_registro();
create trigger tg_historico_config after update on public.whatsapp_canal for each row execute function public.tg_historico_config();
select public.itmk_travar_apagar('public.whatsapp_canal');

-- Situacao do robo por pagador: Atende, Nao atende (exige motivo) ou Em teste.
create table public.situacao_robo_pagador (
  id bigint generated always as identity primary key,
  pagador_id bigint not null unique references public.pagador(id) on delete restrict,
  situacao text not null default 'Em teste' check (situacao in ('Atende', 'Não atende', 'Em teste')),
  motivo text,
  desde timestamptz not null default now(),
  alterado_por uuid references public.usuario(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (situacao <> 'Não atende' or (motivo is not null and length(btrim(motivo)) > 0))
);
create index situacao_robo_idx on public.situacao_robo_pagador (situacao);
create index situacao_robo_alterado_idx on public.situacao_robo_pagador (alterado_por) where alterado_por is not null;
create function public.tg_situacao_robo_regras() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.situacao is distinct from old.situacao then
    new.desde := now();
    new.alterado_por := public.itmk_usuario_id();
  end if;
  return new;
end $$;
create trigger tg_situacao_robo_regras before insert or update on public.situacao_robo_pagador for each row execute function public.tg_situacao_robo_regras();
create trigger tg_registro before insert or update on public.situacao_robo_pagador for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.situacao_robo_pagador for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.situacao_robo_pagador');

-- Opt-out: pedido de parar respeitado na hora. Quem revoga e uma pessoa.
create table public.opt_out (
  id bigint generated always as identity primary key,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  telefone text not null check (telefone ~ '^[0-9]{10,15}$'),
  palavra_parada text not null,
  mensagem_id bigint,
  ocorrido_em timestamptz not null default now(),
  tratado_por uuid references public.usuario(id) on delete restrict,
  tratado_em timestamptz,
  ativo boolean not null default true,
  revogado_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check (ativo = (revogado_em is null))
);
create unique index opt_out_telefone_ativo_idx on public.opt_out (telefone) where ativo;
create index opt_out_pagador_idx on public.opt_out (pagador_id);
create index opt_out_tratado_idx on public.opt_out (tratado_por) where tratado_por is not null;
create function public.tg_opt_out_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_when = 'AFTER' then
    insert into public.situacao_robo_pagador (pagador_id, situacao, motivo)
      values (new.pagador_id, 'Não atende', 'Pediu para parar (opt-out)')
    on conflict (pagador_id) do update set situacao = 'Não atende', motivo = 'Pediu para parar (opt-out)';
    return null;
  end if;
  if tg_op = 'UPDATE' and old.ativo and not new.ativo then
    if public.itmk_ator_tipo() is distinct from 'usuario' then
      raise exception 'So uma pessoa pode revogar um opt-out.' using errcode = '42501';
    end if;
    new.revogado_em := now();
  end if;
  return new;
end $$;
create trigger tg_opt_out_antes before update on public.opt_out for each row execute function public.tg_opt_out_regras();
create trigger tg_opt_out_depois after insert on public.opt_out for each row execute function public.tg_opt_out_regras();
create trigger tg_registro before insert or update on public.opt_out for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.opt_out for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.opt_out');

create table public.opt_in (
  id bigint generated always as identity primary key,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  telefone text not null check (telefone ~ '^[0-9]{10,15}$'),
  origem text not null check (length(btrim(origem)) > 0),
  registrado_em timestamptz not null default now(),
  registrado_por uuid references public.usuario(id) on delete restrict
);
create index opt_in_pagador_idx on public.opt_in (pagador_id);
create index opt_in_registrado_idx on public.opt_in (registrado_por) where registrado_por is not null;
select public.itmk_travar_historico('public.opt_in');

-- Fila de envio: telefone em opt-out nunca recebe; o modelo precisa estar aprovado; cada envio guarda a versao e o contador.
create table public.fila_envio (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  cobranca_id bigint references public.cobranca(id) on delete restrict,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  canal text not null default 'whatsapp' check (canal = 'whatsapp'),
  destino_telefone text not null check (destino_telefone ~ '^[0-9]{10,15}$'),
  data_ref date not null,
  chave_idempotencia text not null unique,
  modelo_id bigint references public.modelo_mensagem(id) on delete restrict,
  modelo_versao integer,
  estado text not null default 'pendente' check (estado in ('pendente', 'enviando', 'enviado', 'erro', 'cancelado')),
  tentativas integer not null default 0 check (tentativas >= 0),
  proxima_tentativa timestamptz not null default now(),
  contador_dia_total integer,
  contador_pagador_dia integer,
  enviado_em timestamptz,
  ultimo_erro text,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((estado = 'enviado') = (enviado_em is not null))
);
create index fila_envio_pendente_idx on public.fila_envio (estado, proxima_tentativa) where estado in ('pendente', 'erro');
create index fila_envio_pagador_idx on public.fila_envio (pagador_id, data_ref);
create index fila_envio_cobranca_idx on public.fila_envio (cobranca_id) where cobranca_id is not null;
create index fila_envio_modelo_idx on public.fila_envio (modelo_id) where modelo_id is not null;
create function public.tg_fila_envio_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_versao integer;
begin
  if tg_op = 'INSERT' then
    if exists (select 1 from public.opt_out where telefone = new.destino_telefone and ativo) then
      raise exception 'Telefone na lista de nao contatar nunca recebe envio.' using errcode = '23514';
    end if;
    if new.modelo_id is not null then
      select versao_modelo into v_versao from public.modelo_mensagem where id = new.modelo_id and estado = 'aprovado';
      if v_versao is null then
        raise exception 'O envio so usa modelo aprovado.' using errcode = '23514';
      end if;
      new.modelo_versao := v_versao;
    end if;
  else
    if new.destino_telefone <> old.destino_telefone or new.chave_idempotencia <> old.chave_idempotencia
       or new.pagador_id <> old.pagador_id or new.modelo_id is distinct from old.modelo_id then
      raise exception 'Destino, chave, pagador e modelo do envio nao mudam.' using errcode = '42501';
    end if;
    if old.estado in ('enviado', 'cancelado') and new.estado <> old.estado then
      raise exception 'Envio % nao volta para outro estado.', old.estado using errcode = '23514';
    end if;
    if new.estado = 'enviado' and old.estado <> 'enviado' then new.enviado_em := coalesce(new.enviado_em, now()); end if;
  end if;
  return new;
end $$;
create trigger tg_fila_envio_regras before insert or update on public.fila_envio for each row execute function public.tg_fila_envio_regras();
create trigger tg_registro before insert or update on public.fila_envio for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.fila_envio for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.fila_envio');

-- Etiquetas da conversa (as do pagador/cliente vem da ficha do BL). Cor e o nome do token do arquivo de estilo.
create table public.etiqueta (
  id bigint generated always as identity primary key,
  nome text not null check (length(btrim(nome)) > 0),
  cor text not null check (cor in ('verde', 'azul', 'amarelo', 'roxo', 'vermelho')),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create unique index etiqueta_nome_unico on public.etiqueta (lower(nome));
create trigger tg_registro before insert or update on public.etiqueta for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.etiqueta for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.etiqueta');
insert into public.etiqueta (nome, cor) values ('VIP', 'verde'), ('Negociação', 'azul'), ('Reclamação', 'vermelho'), ('Novo cliente', 'amarelo');
