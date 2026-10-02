do $$
declare res text := ''; pid bigint; lid bigint; cid bigint; calc bigint; cob bigint; uid uuid := gen_random_uuid(); n int; pxid bigint; v_venc date;
begin
  insert into auth.users (id, email, instance_id, aud, role) values (uid, 'teste@itmk.test', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');
  insert into public.usuario (id, nome, email) values (uid, 'Teste', 'teste@itmk.test');
  perform set_config('itmk.ator_tipo', 'usuario', true); perform set_config('itmk.usuario_id', uid::text, true);
  insert into public.pagador (cpf) values ('11122233344') returning id into pid;
  insert into public.loja (plataforma, codigo_loja, pagador_id) values ('Shein', '99999999', pid) returning id into lid;
  insert into public.competencia (mes) values ('2026-09-01') returning id, vencimento into cid, v_venc;
  res := res || 'vencimento_auto=' || v_venc || '; ';
  insert into public.calculo_cobranca (competencia_id, loja_id, versao_regra_bl, base, faturado, imposto, aliquota, percentual_40, resultado, fonte)
    values (cid, lid, 'v1', 'Faturamento total', 20000.00, 3140.00, 15.7, 40, 1256.00, 'API') returning id into calc;
  begin insert into public.calculo_cobranca (competencia_id, loja_id, numero_versao, versao_regra_bl, base, faturado, imposto, aliquota, percentual_40, resultado, fonte, substitui_calculo_id, motivo)
    values (cid, lid, 2, 'v1', 'Faturamento total', 20000.00, 1375.50, 6.8, 40, 550.19, 'API', calc, 'x'); res := res || 'CALCULO_ERRADO_PASSOU(ERRO); '; exception when others then res := res || 'calculo_com_centavo_errado_recusado; '; end;
  insert into public.calculo_cobranca (competencia_id, loja_id, numero_versao, versao_regra_bl, base, faturado, imposto, aliquota, percentual_40, resultado, fonte, substitui_calculo_id, motivo)
    values (cid, lid, 2, 'v1', 'Faturamento total', 20000.00, 1375.50, 6.8, 40, 550.20, 'API', calc, 'teste meio centavo');
  res := res || 'calculo_550_20_ok; ';
  begin
    insert into public.cobranca (pagador_id, competencia_id, vencimento, valor_total) values (pid, cid, v_venc, 1000.00) returning id into cob;
    insert into public.cobranca_item (cobranca_id, loja_id, calculo_id, valor) values (cob, lid, calc, 1256.00);
    set constraints all immediate;
    res := res || 'SOMA_ERRADA_PASSOU(ERRO); ';
  exception when others then res := res || 'soma_errada_recusada; '; end;
  set constraints all deferred;
  insert into public.cobranca (pagador_id, competencia_id, vencimento, valor_total) values (pid, cid, v_venc, 1256.00) returning id into cob;
  insert into public.cobranca_item (cobranca_id, loja_id, calculo_id, valor) values (cob, lid, calc, 1256.00);
  set constraints all immediate;
  res := res || 'cobranca_soma_ok; ';
  begin update public.cobranca set valor_total = 1.00 where id = cob; res := res || 'EDITAR_VALOR_PASSOU(ERRO); '; exception when others then res := res || 'editar_valor_recusado; '; end;
  update public.cobranca set status = 'Quitada' where id = cob;
  begin update public.cobranca set status = 'Cancelada' where id = cob; res := res || 'TRANSICAO_RUIM_PASSOU(ERRO); '; exception when others then res := res || 'transicao_Quitada_Cancelada_recusada; '; end;
  update public.cobranca set status = 'Em aberto' where id = cob;
  begin insert into public.pix (cobranca_id, provedor, identificador_nosso, vencimento, prazo_final, valor) values (cob, 'Banco Inter', 'curto', v_venc, v_venc + 30, 1256.00); res := res || 'TXID_CURTO_PASSOU(ERRO); '; exception when others then res := res || 'txid_inter_curto_recusado; '; end;
  insert into public.pix (cobranca_id, provedor, identificador_nosso, vencimento, prazo_final, valor) values (cob, 'Banco Inter', 'abcdefghij0123456789ABCDEF01', v_venc, v_venc + 30, 1256.00) returning id into pxid;
  begin insert into public.pix (cobranca_id, provedor, identificador_nosso, vencimento, prazo_final, valor) values (cob, 'Asaas', 'outro-id', v_venc, v_venc + 30, 1256.00); res := res || 'DOIS_PIX_PASSOU(ERRO); '; exception when others then res := res || 'segundo_pix_na_cobranca_recusado; '; end;
  update public.pix set estado = 'Pago' where id = pxid;
  begin update public.pix set estado = 'Cancelado' where id = pxid; res := res || 'PIX_PAGO_VOLTOU(ERRO); '; exception when others then res := res || 'pix_pago_nao_volta; '; end;
  begin update public.pix set valor = 1 where id = pxid; res := res || 'PIX_VALOR_MUDOU(ERRO); '; exception when others then res := res || 'pix_valor_nao_muda; '; end;
  insert into public.pagamento (valor, meio, provedor, id_transacao_provedor, pago_em) values (1256.00, 'Pix', 'Asaas', 'pay_1', now());
  begin insert into public.pagamento (valor, meio, provedor, id_transacao_provedor, pago_em) values (1256.00, 'Pix', 'Asaas', 'pay_1', now()); res := res || 'PAGAMENTO_DUPLICADO_PASSOU(ERRO); '; exception when unique_violation then res := res || 'pagamento_duplicado_recusado; '; end;
  update public.competencia set estado = 'fechada' where id = cid;
  begin update public.competencia set vencimento = vencimento + 1 where id = cid; res := res || 'FECHADA_EDITOU(ERRO); '; exception when others then res := res || 'competencia_fechada_congelada; '; end;
  select count(*) into n from public.itmk_verificar_cadeia('public.auditoria'); res := res || 'problemas_corrente=' || n;
  raise exception 'TESTE_OK_ROLLBACK %', res;
end $$;
