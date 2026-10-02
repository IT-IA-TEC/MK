-- IT.MK 01: base do banco (contas, funcoes comuns, selo encadeado, bloqueio de historico)
-- Banco: projeto "MK - Cobrancas". Nada aqui le ou escreve no banco do BL.

-- 1. Contas do banco: sem login e sem poder de administrador.
--    O dono define a senha e o login de cada conta fora do repositorio.
do $$
declare r text;
begin
  foreach r in array array['itmk_app','itmk_robo','itmk_integracao','itmk_migracao','itmk_relatorio'] loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format('create role %I nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls', r);
    end if;
    execute format('grant usage on schema public to %I', r);
  end loop;
end $$;

-- 2. anon e authenticated nao recebem nada por padrao em tabelas, funcoes e sequencias.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

-- 3. Quem esta agindo: o servidor informa a cada transacao (set_config com is_local = true).
--    itmk.ator_tipo = usuario | robo | sistema | webhook ; itmk.usuario_id = uuid do usuario ; itmk.motivo = texto.
create function public.itmk_ator_tipo() returns text
language sql stable set search_path = ''
as $$
  select case when v in ('usuario','robo','sistema','webhook') then v end
  from (select nullif(current_setting('itmk.ator_tipo', true), '') as v) s
$$;

create function public.itmk_usuario_id() returns uuid
language sql stable set search_path = ''
as $$ select nullif(current_setting('itmk.usuario_id', true), '')::uuid $$;

create function public.itmk_motivo() returns text
language sql stable set search_path = ''
as $$ select nullif(current_setting('itmk.motivo', true), '') $$;

-- 4. Regra unica de arredondamento do projeto: centavo mais proximo, meio centavo sobe.
create function public.arredondar_centavos(v numeric) returns numeric
language sql immutable set search_path = ''
as $$ select round(v, 2) $$;

-- 5. Faixas de atraso (iguais em todas as telas).
create function public.faixa_atraso(dias integer) returns text
language sql immutable set search_path = ''
as $$
  select case
    when dias is null or dias < 1 then null
    when dias <= 7 then '1 a 7'
    when dias <= 15 then '8 a 15'
    when dias <= 30 then '16 a 30'
    when dias <= 60 then '31 a 60'
    when dias <= 90 then '61 a 90'
    else 'mais de 90'
  end
$$;

-- 6. Colunas de controle das tabelas editaveis: criado_em, criado_por, atualizado_em e versao.
--    A gravacao so vale se o servidor mandar "where versao = <lida>"; com versao antiga volta 0 linhas.
create function public.tg_registro() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.criado_em := now();
    new.atualizado_em := new.criado_em;
    new.versao := 1;
    if new.criado_por is null then new.criado_por := public.itmk_usuario_id(); end if;
  else
    new.criado_em := old.criado_em;
    new.criado_por := old.criado_por;
    new.versao := old.versao + 1;
    new.atualizado_em := now();
  end if;
  return new;
end $$;

-- 7. Tabela de historico: so aceita inserir. Editar, apagar e esvaziar falham.
create function public.tg_somente_insercao() returns trigger
language plpgsql set search_path = ''
as $$
begin
  raise exception 'A tabela % so aceita insercao: editar, apagar e esvaziar sao proibidos.', tg_table_name
    using errcode = '42501';
end $$;

create function public.itmk_travar_historico(p_tabela regclass) returns void
language plpgsql set search_path = ''
as $$
begin
  execute format('create trigger tg_historico_linha before update or delete on %s for each row execute function public.tg_somente_insercao()', p_tabela);
  execute format('create trigger tg_historico_tudo before truncate on %s for each statement execute function public.tg_somente_insercao()', p_tabela);
end $$;

-- 8. Dado financeiro nunca e apagado: aviso claro se alguem tentar.
create function public.tg_nunca_apagar() returns trigger
language plpgsql set search_path = ''
as $$
begin
  raise exception 'A tabela % nao aceita apagar: use o estado Cancelada, Arquivada ou inativo.', tg_table_name
    using errcode = '42501';
end $$;

create function public.itmk_travar_apagar(p_tabela regclass) returns void
language plpgsql set search_path = ''
as $$
begin
  execute format('create trigger tg_nunca_apagar before delete on %s for each row execute function public.tg_nunca_apagar()', p_tabela);
  execute format('create trigger tg_nunca_esvaziar before truncate on %s for each statement execute function public.tg_nunca_apagar()', p_tabela);
end $$;

-- 9. Selo encadeado: cada linha guarda o hash da anterior e o proprio (SHA-256), calculados no banco.
--    A ordem vem de uma trava por tabela, entao dois registros ao mesmo tempo nao quebram a corrente.
create function public.itmk_hash_linha(p_anterior text, p_linha jsonb) returns text
language sql immutable set search_path = '' set timezone = 'UTC'
as $$
  select encode(sha256(convert_to(coalesce(p_anterior, '') || '|' || (p_linha - 'hash_proprio')::text, 'UTF8')), 'hex')
$$;

create function public.tg_selar_linha() returns trigger
language plpgsql security definer set search_path = '' set timezone = 'UTC'
as $$
declare v_ant text; v_pos bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('itmk_cadeia_' || tg_table_name, 0));
  execute format('select hash_proprio, cadeia_pos from %I.%I order by cadeia_pos desc limit 1', tg_table_schema, tg_table_name)
    into v_ant, v_pos;
  new.cadeia_pos := coalesce(v_pos, 0) + 1;
  new.hash_anterior := v_ant;
  new.registrado_em := clock_timestamp();
  new.hash_proprio := '';
  new.hash_proprio := public.itmk_hash_linha(v_ant, to_jsonb(new));
  return new;
end $$;

create function public.itmk_verificar_cadeia(p_tabela regclass) returns table(posicao bigint, problema text)
language plpgsql security definer set search_path = '' set timezone = 'UTC'
as $$
begin
  return query execute format($f$
    with l as (
      select t.cadeia_pos as pos, t.hash_anterior as ant, t.hash_proprio as prop, to_jsonb(t) as j,
             lag(t.hash_proprio) over (order by t.cadeia_pos) as ant_real,
             lag(t.cadeia_pos) over (order by t.cadeia_pos) as pos_ant
      from %s t
    )
    select pos, p from (
      select pos,
        case
          when pos_ant is null and pos <> 1 then 'a primeira linha nao e a posicao 1'
          when pos_ant is not null and pos <> pos_ant + 1 then 'posicao faltando'
          when ant is distinct from ant_real then 'elo anterior diferente'
          when prop <> public.itmk_hash_linha(ant, j) then 'conteudo alterado'
        end as p
      from l
    ) x where p is not null order by pos
  $f$, p_tabela);
end $$;

-- 10. Segredo, token, chave e string de conexao nunca entram na auditoria (nem dentro do jsonb).
create function public.itmk_jsonb_tem_segredo(j jsonb) returns boolean
language plpgsql immutable set search_path = ''
as $$
declare k text; v jsonb; e jsonb;
begin
  if j is null then return false; end if;
  if jsonb_typeof(j) = 'object' then
    for k, v in select key, value from jsonb_each(j) loop
      if lower(k) ~ '(senha|password|passwd|token|secret|segredo|api_?key|apikey|chave_privada|private_?key|authorization|connection_?string)' then
        return true;
      end if;
      if public.itmk_jsonb_tem_segredo(v) then return true; end if;
    end loop;
  elsif jsonb_typeof(j) = 'array' then
    for e in select value from jsonb_array_elements(j) loop
      if public.itmk_jsonb_tem_segredo(e) then return true; end if;
    end loop;
  end if;
  return false;
end $$;

-- 11. As funcoes de apoio podem ser chamadas pelas contas de uso.
grant execute on function
  public.itmk_ator_tipo(), public.itmk_usuario_id(), public.itmk_motivo(),
  public.arredondar_centavos(numeric), public.faixa_atraso(integer),
  public.itmk_hash_linha(text, jsonb), public.itmk_jsonb_tem_segredo(jsonb)
to itmk_app, itmk_robo, itmk_integracao, itmk_relatorio;
