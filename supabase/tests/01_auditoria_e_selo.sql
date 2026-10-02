do $$
declare n int; res text := ''; pid bigint; prob text;
begin
  insert into public.pagador (cpf) values ('12345678901') returning id into pid;
  insert into public.loja (plataforma, codigo_loja, pagador_id) values ('Shein', '12345678', pid);
  update public.pagador set modo_cobranca = 'um Pix por loja' where id = pid;
  update public.loja set situacao = 'inativa' where pagador_id = pid;
  select count(*) into n from public.itmk_verificar_cadeia('public.auditoria'); res := res || 'problemas_corrente=' || n || '; ';
  begin update public.auditoria set motivo = 'x' where cadeia_pos = 1; res := res || 'UPDATE_PASSOU(ERRO); '; exception when others then res := res || 'update_auditoria_bloqueado; '; end;
  begin delete from public.auditoria where cadeia_pos = 1; res := res || 'DELETE_PASSOU(ERRO); '; exception when others then res := res || 'delete_auditoria_bloqueado; '; end;
  begin truncate public.auditoria; res := res || 'TRUNCATE_PASSOU(ERRO); '; exception when others then res := res || 'truncate_auditoria_bloqueado; '; end;
  begin delete from public.pagador where id = pid; res := res || 'DELETE_PAGADOR_PASSOU(ERRO); '; exception when others then res := res || 'delete_pagador_bloqueado; '; end;
  begin insert into public.pagador (cpf) values ('123'); res := res || 'CPF_CURTO_PASSOU(ERRO); '; exception when others then res := res || 'cpf_curto_recusado; '; end;
  -- adulterar uma linha pela conta dona e ver a corrente apontar
  alter table public.auditoria disable trigger tg_historico_linha;
  update public.auditoria set motivo = 'adulterado' where cadeia_pos = 2;
  alter table public.auditoria enable trigger tg_historico_linha;
  select string_agg(posicao || ':' || problema, ',') into prob from public.itmk_verificar_cadeia('public.auditoria');
  res := res || 'corrente_apos_adulterar=' || coalesce(prob, 'NENHUM(ERRO)');
  raise exception 'TESTE_OK_ROLLBACK %', res;
end $$;
