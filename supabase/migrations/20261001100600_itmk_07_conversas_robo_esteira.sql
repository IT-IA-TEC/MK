-- IT.MK 07: conversas e mensagens, atribuicao, execucoes e acoes do robo (com selo), fila de aprovacao,
-- e a esteira de cobranca de ex-clientes inadimplentes.

-- Conversa: uma por pagador (ou grupo interno). Um responsavel por vez: pessoa ou robo.
create table public.conversa (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  tipo text not null default 'pagador' check (tipo in ('pagador', 'grupo interno')),
  pagador_id bigint references public.pagador(id) on delete restrict,
  grupo_nome text,
  chat_externo text,
  responsavel_tipo text not null default 'robô' check (responsavel_tipo in ('pessoa', 'robô')),
  responsavel_usuario_id uuid references public.usuario(id) on delete restrict,
  robo_ativo boolean not null default true,
  lida_ate_mensagem_id bigint,
  ultima_mensagem_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((tipo = 'pagador' and pagador_id is not null) or (tipo = 'grupo interno' and grupo_nome is not null and pagador_id is null)),
  check ((responsavel_tipo = 'pessoa') = (responsavel_usuario_id is not null))
);
create unique index conversa_uma_por_pagador_idx on public.conversa (pagador_id) where tipo = 'pagador';
create index conversa_ultima_idx on public.conversa (ultima_mensagem_em desc nulls last);
create index conversa_responsavel_idx on public.conversa (responsavel_tipo, responsavel_usuario_id);
create index conversa_responsavel_usuario_idx on public.conversa (responsavel_usuario_id) where responsavel_usuario_id is not null;
create trigger tg_registro before insert or update on public.conversa for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.conversa for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.conversa');

create table public.mensagem (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  conversa_id bigint not null references public.conversa(id) on delete restrict,
  sentido text not null check (sentido in ('pagador', 'equipe')),
  tipo text not null check (tipo in ('texto', 'imagem', 'PDF', 'áudio')),
  conteudo text,
  nota_interna boolean not null default false,
  waid text,
  interno_ref text,
  ocorrido_em timestamptz not null default now(),
  midia_caminho text,
  midia_hash char(64) check (midia_hash is null or midia_hash ~ '^[0-9a-f]{64}$'),
  modelo_id bigint references public.modelo_mensagem(id) on delete restrict,
  modelo_versao integer,
  autor_tipo text not null default 'sistema' check (autor_tipo in ('pagador', 'usuario', 'robo', 'sistema')),
  autor_usuario_id uuid references public.usuario(id) on delete restrict,
  estado_envio text check (estado_envio in ('pendente', 'enviada', 'entregue', 'lida', 'falhou')),
  criado_em timestamptz not null default now(),
  check (not nota_interna or sentido = 'equipe'),
  check (not nota_interna or estado_envio is null),
  check (tipo <> 'texto' or conteudo is not null),
  check (tipo = 'texto' or (midia_caminho is not null and midia_hash is not null)),
  check (autor_tipo <> 'usuario' or autor_usuario_id is not null),
  check (autor_tipo <> 'robo' or nota_interna or modelo_id is not null)
);
create unique index mensagem_waid_unico on public.mensagem (waid) where waid is not null;
create index mensagem_conversa_idx on public.mensagem (conversa_id, ocorrido_em desc);
create index mensagem_nao_lida_idx on public.mensagem (conversa_id, id) where sentido = 'pagador';
create index mensagem_modelo_idx on public.mensagem (modelo_id) where modelo_id is not null;
create index mensagem_autor_idx on public.mensagem (autor_usuario_id) where autor_usuario_id is not null;

create function public.tg_mensagem_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_versao integer;
begin
  if tg_when = 'AFTER' then
    update public.conversa set ultima_mensagem_em = greatest(coalesce(ultima_mensagem_em, new.ocorrido_em), new.ocorrido_em)
      where id = new.conversa_id;
    return null;
  end if;
  if tg_op = 'INSERT' then
    if new.modelo_id is not null then
      select versao_modelo into v_versao from public.modelo_mensagem where id = new.modelo_id and estado = 'aprovado';
      if v_versao is null then
        raise exception 'A mensagem so usa modelo aprovado.' using errcode = '23514';
      end if;
      new.modelo_versao := v_versao;
    end if;
    return new;
  end if;
  if (to_jsonb(new) - array['estado_envio']) is distinct from (to_jsonb(old) - array['estado_envio']) then
    raise exception 'Na mensagem so pode mudar o estado do envio.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger tg_mensagem_antes before insert or update on public.mensagem for each row execute function public.tg_mensagem_regras();
create trigger tg_mensagem_depois after insert on public.mensagem for each row execute function public.tg_mensagem_regras();
select public.itmk_travar_apagar('public.mensagem');

alter table public.opt_out
  add constraint opt_out_mensagem_fk foreign key (mensagem_id) references public.mensagem(id) on delete restrict;
create index opt_out_mensagem_idx on public.opt_out (mensagem_id) where mensagem_id is not null;

create table public.etiqueta_conversa (
  conversa_id bigint not null references public.conversa(id) on delete restrict,
  etiqueta_id bigint not null references public.etiqueta(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  primary key (conversa_id, etiqueta_id)
);
create index etiqueta_conversa_etiqueta_idx on public.etiqueta_conversa (etiqueta_id);

-- Atribuicao e escalacao: cada troca grava quem, quando e por que. Assumir pausa o robo so nessa conversa.
create table public.conversa_atribuicao (
  id bigint generated always as identity primary key,
  conversa_id bigint not null references public.conversa(id) on delete restrict,
  de_tipo text not null check (de_tipo in ('pessoa', 'robô')),
  de_usuario_id uuid references public.usuario(id) on delete restrict,
  para_tipo text not null check (para_tipo in ('pessoa', 'robô')),
  para_usuario_id uuid references public.usuario(id) on delete restrict,
  motivo text,
  ator_tipo text not null check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  usuario_id uuid references public.usuario(id) on delete restrict,
  ocorrido_em timestamptz not null default now(),
  check ((para_tipo = 'pessoa') = (para_usuario_id is not null)),
  check (not (de_tipo = 'robô' and para_tipo = 'pessoa') or (motivo is not null and length(btrim(motivo)) > 0)),
  check (ator_tipo <> 'usuario' or usuario_id is not null)
);
create index conversa_atribuicao_idx on public.conversa_atribuicao (conversa_id, ocorrido_em desc);
create index conversa_atribuicao_de_idx on public.conversa_atribuicao (de_usuario_id) where de_usuario_id is not null;
create index conversa_atribuicao_para_idx on public.conversa_atribuicao (para_usuario_id) where para_usuario_id is not null;
create index conversa_atribuicao_usuario_idx on public.conversa_atribuicao (usuario_id) where usuario_id is not null;
select public.itmk_travar_historico('public.conversa_atribuicao');

create function public.tg_atribuicao_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_when = 'BEFORE' then
    if new.ator_tipo is null then new.ator_tipo := coalesce(public.itmk_ator_tipo(), 'sistema'); end if;
    if new.ator_tipo = 'usuario' and new.usuario_id is null then new.usuario_id := public.itmk_usuario_id(); end if;
    return new;
  end if;
  update public.conversa
    set responsavel_tipo = new.para_tipo, responsavel_usuario_id = new.para_usuario_id,
        robo_ativo = case when new.para_tipo = 'pessoa' then false else robo_ativo end
    where id = new.conversa_id;
  return null;
end $$;
create trigger tg_atribuicao_antes before insert on public.conversa_atribuicao for each row execute function public.tg_atribuicao_regras();
create trigger tg_atribuicao_depois after insert on public.conversa_atribuicao for each row execute function public.tg_atribuicao_regras();

-- Execucoes e acoes do robo: so insercao, com selo encadeado. Ignorar tambem fica registrado, com o motivo.
create table public.robo_execucao (
  id bigint generated always as identity primary key,
  cadeia_pos bigint not null unique,
  inicio timestamptz not null,
  fim timestamptz not null,
  versao_robo text not null,
  versao_regra integer not null,
  resultado text not null check (resultado in ('concluída', 'parcial', 'erro', 'pulada')),
  registrado_em timestamptz not null,
  hash_anterior text,
  hash_proprio text not null,
  check (fim >= inicio)
);
create trigger tg_selar before insert on public.robo_execucao for each row execute function public.tg_selar_linha();
select public.itmk_travar_historico('public.robo_execucao');

create table public.robo_acao (
  id bigint generated always as identity primary key,
  cadeia_pos bigint not null unique,
  execucao_id bigint not null references public.robo_execucao(id) on delete restrict,
  cobranca_id bigint references public.cobranca(id) on delete restrict,
  pagador_id bigint references public.pagador(id) on delete restrict,
  acao text not null,
  regra_aplicada text,
  canal text,
  chave_idempotencia text not null unique,
  resultado text not null check (resultado in ('enviado', 'ignorado', 'sugerido', 'erro')),
  motivo text,
  modo_sombra boolean not null default false,
  ocorrido_em timestamptz not null default now(),
  registrado_em timestamptz not null,
  hash_anterior text,
  hash_proprio text not null,
  check (resultado <> 'ignorado' or (motivo is not null and length(btrim(motivo)) > 0))
);
create index robo_acao_execucao_idx on public.robo_acao (execucao_id);
create index robo_acao_cobranca_idx on public.robo_acao (cobranca_id) where cobranca_id is not null;
create index robo_acao_pagador_idx on public.robo_acao (pagador_id, ocorrido_em desc) where pagador_id is not null;
create trigger tg_selar before insert on public.robo_acao for each row execute function public.tg_selar_linha();
select public.itmk_travar_historico('public.robo_acao');

-- Uma rodada do robo por vez: o servidor chama esta funcao no inicio da transacao da rodada.
create function public.itmk_robo_travar_rodada() returns boolean
language sql set search_path = ''
as $$ select pg_try_advisory_xact_lock(hashtextextended('itmk_robo_rodada', 0)) $$;
grant execute on function public.itmk_robo_travar_rodada() to itmk_robo;

-- Fila de aprovacao (e modo sombra): so aprova quem tem "Aprova a fila do robo" ligado; vale para uma execucao.
create table public.robo_fila_aprovacao (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  tipo text not null check (tipo in ('parcelamento', 'prazo novo', 'bloqueio', 'desbloqueio', 'resposta a contestação', 'mensagem fora do padrão')),
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  cobranca_id bigint references public.cobranca(id) on delete restrict,
  pedido text,
  proposta jsonb not null check (not public.itmk_jsonb_tem_segredo(proposta)),
  proposta_final jsonb check (not public.itmk_jsonb_tem_segredo(proposta_final)),
  estado text not null default 'pendente' check (estado in ('pendente', 'aprovada', 'editada', 'recusada', 'executada')),
  modo_sombra boolean not null default false,
  decidido_por uuid references public.usuario(id) on delete restrict,
  decidido_em timestamptz,
  executada_em timestamptz,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1,
  check ((estado = 'pendente') = (decidido_por is null and decidido_em is null)),
  check ((estado = 'executada') = (executada_em is not null)),
  check (not modo_sombra or estado <> 'executada'),
  check (estado <> 'editada' or proposta_final is not null)
);
create index robo_fila_estado_idx on public.robo_fila_aprovacao (estado, criado_em);
create index robo_fila_pagador_idx on public.robo_fila_aprovacao (pagador_id);
create index robo_fila_cobranca_idx on public.robo_fila_aprovacao (cobranca_id) where cobranca_id is not null;
create index robo_fila_decidido_idx on public.robo_fila_aprovacao (decidido_por) where decidido_por is not null;
create function public.tg_robo_fila_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_pode boolean;
begin
  if tg_op = 'INSERT' then
    if new.estado <> 'pendente' then raise exception 'O pedido nasce pendente.' using errcode = '23514'; end if;
    return new;
  end if;
  if new.tipo <> old.tipo or new.pagador_id <> old.pagador_id or new.proposta <> old.proposta
     or new.modo_sombra <> old.modo_sombra or new.cobranca_id is distinct from old.cobranca_id then
    raise exception 'Tipo, pagador, proposta e modo do pedido nao mudam.' using errcode = '42501';
  end if;
  if new.estado is distinct from old.estado then
    if not ((old.estado = 'pendente' and new.estado in ('aprovada', 'editada', 'recusada'))
         or (old.estado in ('aprovada', 'editada') and new.estado = 'executada')) then
      raise exception 'Passo nao permitido na fila de aprovacao: % para %', old.estado, new.estado using errcode = '23514';
    end if;
    if old.estado = 'pendente' then
      if public.itmk_ator_tipo() is distinct from 'usuario' then
        raise exception 'Quem aprova a fila do robo e uma pessoa.' using errcode = '42501';
      end if;
      select aprova_fila_robo and ativo into v_pode from public.usuario where id = public.itmk_usuario_id();
      if v_pode is not true then
        raise exception 'Esta pessoa nao tem Aprova a fila do robo ligado.' using errcode = '42501';
      end if;
      new.decidido_por := public.itmk_usuario_id();
      new.decidido_em := now();
    end if;
    if new.estado = 'executada' then new.executada_em := coalesce(new.executada_em, now()); end if;
  end if;
  return new;
end $$;
create trigger tg_robo_fila_regras before insert or update on public.robo_fila_aprovacao for each row execute function public.tg_robo_fila_regras();
create trigger tg_registro before insert or update on public.robo_fila_aprovacao for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.robo_fila_aprovacao for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.robo_fila_aprovacao');

-- Esteira de ex-clientes inadimplentes: etapas sao dados, todas disponiveis para ligar.
create table public.etapa_ex_cliente (
  id bigint generated always as identity primary key,
  nome text not null unique,
  ordem smallint not null unique,
  ligada boolean not null default false,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create trigger tg_registro before insert or update on public.etapa_ex_cliente for each row execute function public.tg_registro();
create trigger tg_historico_config after update on public.etapa_ex_cliente for each row execute function public.tg_historico_config();
select public.itmk_travar_apagar('public.etapa_ex_cliente');
insert into public.etapa_ex_cliente (nome, ordem, ligada) values
  ('cobrança amigável', 1, true), ('negociação e acordo', 2, true), ('notificação formal', 3, false), ('jurídico', 4, false);

create table public.etapa_ex_cliente_passo (
  de_etapa_id bigint not null references public.etapa_ex_cliente(id) on delete restrict,
  para_etapa_id bigint not null references public.etapa_ex_cliente(id) on delete restrict,
  primary key (de_etapa_id, para_etapa_id),
  check (de_etapa_id <> para_etapa_id)
);
create index etapa_ex_cliente_passo_para_idx on public.etapa_ex_cliente_passo (para_etapa_id);
insert into public.etapa_ex_cliente_passo
select a.id, b.id from public.etapa_ex_cliente a join public.etapa_ex_cliente b on b.ordem = a.ordem + 1;

create table public.caso_ex_cliente (
  id bigint generated always as identity primary key,
  id_publico uuid not null default gen_random_uuid() unique,
  pagador_id bigint not null references public.pagador(id) on delete restrict,
  data_saida date not null,
  motivo_saida text not null check (motivo_saida in ('Inadimplência', 'Pedido do cliente', 'Encerramento da loja ou da empresa', 'Outros')),
  valor_devido numeric(14,2) not null check (valor_devido >= 0),
  etapa_id bigint not null references public.etapa_ex_cliente(id) on delete restrict,
  situacao text not null default 'aberto' check (situacao in ('aberto', 'quitado', 'encerrado')),
  criado_em timestamptz not null default now(),
  criado_por uuid references public.usuario(id) on delete restrict,
  atualizado_em timestamptz not null default now(),
  versao integer not null default 1
);
create unique index caso_ex_cliente_um_aberto_idx on public.caso_ex_cliente (pagador_id) where situacao = 'aberto';
create index caso_ex_cliente_etapa_idx on public.caso_ex_cliente (etapa_id, situacao);

create table public.caso_ex_cliente_movimento (
  id bigint generated always as identity primary key,
  caso_id bigint not null references public.caso_ex_cliente(id) on delete restrict,
  etapa_origem_id bigint references public.etapa_ex_cliente(id) on delete restrict,
  etapa_destino_id bigint not null references public.etapa_ex_cliente(id) on delete restrict,
  ator_tipo text not null check (ator_tipo in ('usuario', 'robo', 'sistema', 'webhook')),
  usuario_id uuid references public.usuario(id) on delete restrict,
  motivo text not null check (length(btrim(motivo)) > 0),
  ocorrido_em timestamptz not null default now(),
  check (ator_tipo <> 'usuario' or usuario_id is not null)
);
create index caso_ex_cliente_movimento_idx on public.caso_ex_cliente_movimento (caso_id, ocorrido_em);
create index caso_ex_cliente_movimento_origem_idx on public.caso_ex_cliente_movimento (etapa_origem_id) where etapa_origem_id is not null;
create index caso_ex_cliente_movimento_destino_idx on public.caso_ex_cliente_movimento (etapa_destino_id);
create index caso_ex_cliente_movimento_usuario_idx on public.caso_ex_cliente_movimento (usuario_id) where usuario_id is not null;
select public.itmk_travar_historico('public.caso_ex_cliente_movimento');

create function public.tg_caso_ex_cliente_regras() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_ator text;
begin
  v_ator := coalesce(public.itmk_ator_tipo(), 'sistema');
  if tg_when = 'BEFORE' then
    if tg_op = 'INSERT' then
      if not exists (select 1 from public.etapa_ex_cliente where id = new.etapa_id and ligada) then
        raise exception 'A etapa inicial do caso precisa estar ligada.' using errcode = '23514';
      end if;
      return new;
    end if;
    if new.pagador_id <> old.pagador_id or new.data_saida <> old.data_saida or new.motivo_saida <> old.motivo_saida then
      raise exception 'Pagador, data e motivo da saida nao mudam.' using errcode = '42501';
    end if;
    if new.etapa_id <> old.etapa_id then
      if not exists (select 1 from public.etapa_ex_cliente_passo where de_etapa_id = old.etapa_id and para_etapa_id = new.etapa_id) then
        raise exception 'Passo de etapa nao permitido.' using errcode = '23514';
      end if;
      if not exists (select 1 from public.etapa_ex_cliente where id = new.etapa_id and ligada) then
        raise exception 'A etapa de destino esta desligada.' using errcode = '23514';
      end if;
      if public.itmk_motivo() is null then
        raise exception 'Mudar de etapa exige informar o motivo.' using errcode = '23514';
      end if;
    end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    insert into public.caso_ex_cliente_movimento (caso_id, etapa_origem_id, etapa_destino_id, ator_tipo, usuario_id, motivo)
      values (new.id, null, new.etapa_id, v_ator, case when v_ator = 'usuario' then public.itmk_usuario_id() end, coalesce(public.itmk_motivo(), 'Caso aberto'));
  elsif new.etapa_id <> old.etapa_id then
    insert into public.caso_ex_cliente_movimento (caso_id, etapa_origem_id, etapa_destino_id, ator_tipo, usuario_id, motivo)
      values (new.id, old.etapa_id, new.etapa_id, v_ator, case when v_ator = 'usuario' then public.itmk_usuario_id() end, public.itmk_motivo());
  end if;
  return null;
end $$;
create trigger tg_caso_ex_cliente_antes before insert or update on public.caso_ex_cliente for each row execute function public.tg_caso_ex_cliente_regras();
create trigger tg_caso_ex_cliente_depois after insert or update on public.caso_ex_cliente for each row execute function public.tg_caso_ex_cliente_regras();
create trigger tg_registro before insert or update on public.caso_ex_cliente for each row execute function public.tg_registro();
create trigger tg_auditar after insert or update on public.caso_ex_cliente for each row execute function public.tg_auditar();
select public.itmk_travar_apagar('public.caso_ex_cliente');
