-- IT.MK 09: regra de acesso por linha em toda tabela e permissoes minimas de cada conta.
-- anon e authenticated nao recebem nada. Nenhuma politica usa using (true), exceto a insercao da auditoria
-- (excecao documentada: a gravacao da auditoria nunca pode depender do contexto, senao a acao deixaria de ser registrada).
-- As politicas exigem que o servidor tenha informado quem esta agindo (itmk.ator_tipo) na transacao.
-- Ninguem apaga: nenhuma conta tem permissao de delete (unica excecao: tirar etiqueta de uma conversa).

-- Funcao para toda tabela nova: liga RLS (forcado), revoga anon e authenticated e cria a politica de contexto.
create function public.itmk_proteger_tabela(p_tabela regclass, p_com_politica boolean default true) returns void
language plpgsql set search_path = ''
as $$
begin
  execute format('alter table %s enable row level security', p_tabela);
  execute format('alter table %s force row level security', p_tabela);
  execute format('revoke all on table %s from anon, authenticated, public', p_tabela);
  if p_com_politica then
    execute format('create policy p_ator on %s for all to itmk_app, itmk_robo, itmk_integracao using (public.itmk_ator_tipo() is not null) with check (public.itmk_ator_tipo() is not null)', p_tabela);
  end if;
end $$;

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    perform public.itmk_proteger_tabela(('public.' || quote_ident(t))::regclass, t <> 'auditoria');
  end loop;
  for t in select viewname from pg_views where schemaname = 'public' loop
    execute format('revoke all on public.%I from anon, authenticated, public', t);
  end loop;
end $$;

-- Auditoria: a insercao e a excecao documentada (check true); a leitura segue o contexto.
create policy p_inserir on public.auditoria for insert to itmk_app, itmk_robo, itmk_integracao with check (true);
create policy p_ler on public.auditoria for select to itmk_app using (public.itmk_ator_tipo() is not null);

-- Conta do app (o servidor atendendo a tela): le tudo e escreve so onde precisa.
do $$
declare
  t text;
  so_inserir text[] := array['configuracao_fechamento', 'calculo_cobranca', 'cobranca_item', 'decisao_divergencia', 'credito_lancamento',
    'acordo_cobranca', 'contestacao_evento', 'lancamento_cobranca', 'promessa_resultado', 'pedido_saida_loja', 'opt_in',
    'conversa_atribuicao', 'auditoria'];
  so_ler text[] := array['historico_configuracao', 'destino_cobranca_historico', 'whatsapp_estado_historico', 'contestacao_calculo',
    'bloqueio_historico', 'resumo_competencia', 'robo_execucao', 'robo_acao', 'status_cobranca', 'transicao_status_cobranca',
    'transicao_situacao_contestacao', 'variavel_mensagem', 'etapa_ex_cliente_passo', 'caso_ex_cliente_movimento'];
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('grant select on public.%I to itmk_app', t);
    if t = any (so_inserir) then
      execute format('grant insert on public.%I to itmk_app', t);
    elsif not (t = any (so_ler)) then
      execute format('grant insert, update on public.%I to itmk_app', t);
    end if;
  end loop;
end $$;
grant delete on public.etiqueta_conversa to itmk_app;

-- Conta do robo: le o necessario e so insere o que o robo produz. Execucoes e acoes: so insercao.
do $$
declare t text;
begin
  foreach t in array array['pagador', 'loja', 'competencia', 'cobranca', 'cobranca_item', 'pix', 'pagamento', 'acordo', 'acordo_parcela',
    'promessa', 'contestacao', 'bloqueio_loja', 'pedido_saida', 'modelo_mensagem', 'regua', 'etapa_regua', 'excecao_regua_pagador',
    'destino_cobranca_padrao', 'destino_cobranca_pagador', 'robo_configuracao', 'feriado', 'whatsapp_canal', 'situacao_robo_pagador',
    'opt_out', 'fila_envio', 'conversa', 'mensagem', 'etiqueta', 'etiqueta_conversa', 'robo_fila_aprovacao', 'agenda_envio',
    'configuracao_fechamento', 'caso_ex_cliente', 'etapa_ex_cliente', 'status_cobranca', 'transicao_status_cobranca',
    'variavel_mensagem']
  loop
    execute format('grant select on public.%I to itmk_robo', t);
  end loop;
  foreach t in array array['auditoria', 'robo_execucao', 'robo_acao', 'mensagem', 'fila_envio', 'robo_fila_aprovacao', 'opt_out',
    'conversa_atribuicao', 'bloqueio_loja', 'situacao_robo_pagador']
  loop
    execute format('grant insert on public.%I to itmk_robo', t);
  end loop;
  foreach t in array array['fila_envio', 'situacao_robo_pagador', 'conversa', 'agenda_envio', 'bloqueio_loja']
  loop
    execute format('grant update on public.%I to itmk_robo', t);
  end loop;
end $$;
grant update (estado_envio) on public.mensagem to itmk_robo, itmk_integracao;

-- Conta do conector (avisos do BL e do WhatsApp): grava o que chega de fora.
do $$
declare t text;
begin
  foreach t in array array['pagador', 'loja', 'competencia', 'cobranca', 'cobranca_item', 'calculo_cobranca', 'pix', 'pagamento',
    'divergencia', 'conversa', 'mensagem', 'opt_out', 'whatsapp_canal', 'situacao_robo_pagador', 'alerta_dado', 'fila_erro_integracao',
    'configuracao_fechamento', 'status_cobranca', 'transicao_status_cobranca']
  loop
    execute format('grant select on public.%I to itmk_integracao', t);
  end loop;
  foreach t in array array['auditoria', 'pagador', 'loja', 'calculo_cobranca', 'pix', 'pagamento', 'divergencia', 'conversa', 'mensagem',
    'opt_out', 'alerta_dado', 'fila_erro_integracao']
  loop
    execute format('grant insert on public.%I to itmk_integracao', t);
  end loop;
  foreach t in array array['pagador', 'loja', 'pix', 'pagamento', 'conversa', 'whatsapp_canal', 'alerta_dado', 'fila_erro_integracao']
  loop
    execute format('grant update on public.%I to itmk_integracao', t);
  end loop;
end $$;

-- Conta de relatorio: so le visoes.
do $$
declare t text;
begin
  for t in select viewname from pg_views where schemaname = 'public' loop
    execute format('grant select on public.%I to itmk_relatorio', t);
  end loop;
end $$;

-- Funcoes que cada conta pode chamar.
grant execute on function public.cobranca_saldo_em(date) to itmk_app, itmk_relatorio;
grant execute on function public.itmk_verificar_cadeia(regclass) to itmk_app;

-- Execucao e acao do robo: o robo so insere. Estas funcoes devolvem o id sem dar permissao de leitura.
create function public.robo_registrar_execucao(
  p_inicio timestamptz, p_fim timestamptz, p_versao_robo text, p_versao_regra integer, p_resultado text) returns bigint
language plpgsql security definer set search_path = ''
as $$
declare v bigint;
begin
  if public.itmk_ator_tipo() is distinct from 'robo' then
    raise exception 'So o robo registra execucao.' using errcode = '42501';
  end if;
  insert into public.robo_execucao (inicio, fim, versao_robo, versao_regra, resultado)
    values (p_inicio, p_fim, p_versao_robo, p_versao_regra, p_resultado) returning id into v;
  return v;
end $$;

create function public.robo_registrar_acao(
  p_execucao_id bigint, p_cobranca_id bigint, p_pagador_id bigint, p_acao text, p_regra text, p_canal text,
  p_chave text, p_resultado text, p_motivo text, p_modo_sombra boolean) returns bigint
language plpgsql security definer set search_path = ''
as $$
declare v bigint;
begin
  if public.itmk_ator_tipo() is distinct from 'robo' then
    raise exception 'So o robo registra acao.' using errcode = '42501';
  end if;
  insert into public.robo_acao (execucao_id, cobranca_id, pagador_id, acao, regra_aplicada, canal, chave_idempotencia, resultado, motivo, modo_sombra)
    values (p_execucao_id, p_cobranca_id, p_pagador_id, p_acao, p_regra, p_canal, p_chave, p_resultado, p_motivo, p_modo_sombra)
    on conflict (chave_idempotencia) do nothing
    returning id into v;
  return v;
end $$;
grant execute on function public.robo_registrar_execucao(timestamptz, timestamptz, text, integer, text) to itmk_robo;
grant execute on function public.robo_registrar_acao(bigint, bigint, bigint, text, text, text, text, text, text, boolean) to itmk_robo;
