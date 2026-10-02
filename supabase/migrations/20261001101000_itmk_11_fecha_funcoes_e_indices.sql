-- IT.MK 11: fecha o acesso as funcoes para quem nao e conta do IT.MK e cobre as chaves estrangeiras uteis.
-- O verificador de seguranca do Supabase mostrou funcoes chamaveis por anon e authenticated (herdadas do padrao global).
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges for role postgres revoke execute on functions from public;

-- As contas do IT.MK continuam com as funcoes de apoio que as regras e as politicas usam.
grant execute on function
  public.itmk_ator_tipo(), public.itmk_usuario_id(), public.itmk_motivo(),
  public.arredondar_centavos(numeric), public.faixa_atraso(integer),
  public.itmk_hash_linha(text, jsonb), public.itmk_jsonb_tem_segredo(jsonb)
to itmk_app, itmk_robo, itmk_integracao, itmk_relatorio;
grant execute on function public.cobranca_saldo_em(date) to itmk_app, itmk_relatorio;
grant execute on function public.itmk_verificar_cadeia(regclass) to itmk_app;
grant execute on function public.itmk_robo_travar_rodada() to itmk_robo;
grant execute on function public.robo_registrar_execucao(timestamptz, timestamptz, text, integer, text) to itmk_robo;
grant execute on function public.robo_registrar_acao(bigint, bigint, bigint, text, text, text, text, text, text, boolean) to itmk_robo;

-- Chaves estrangeiras que aparecem em consultas ou em apagar/atualizar usuario ou estado.
create index historico_configuracao_usuario_idx on public.historico_configuracao (usuario_id) where usuario_id is not null;
create index competencia_fechada_por_idx on public.competencia (fechada_por) where fechada_por is not null;
create index alerta_dado_resolvido_por_idx on public.alerta_dado (resolvido_por) where resolvido_por is not null;
create index fila_erro_descartado_por_idx on public.fila_erro_integracao (descartado_por) where descartado_por is not null;
create index transicao_status_cobranca_para_idx on public.transicao_status_cobranca (para);
