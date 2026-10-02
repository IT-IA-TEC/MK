-- IT.MK 13: consulta para o teste automatico de entrega: lista tabela sem acesso por linha, sem politica
-- ou com permissao para anon ou authenticated. A entrega falha se esta consulta devolver alguma linha.
create function public.itmk_tabelas_sem_protecao() returns table(tabela text, problema text)
language sql stable set search_path = ''
as $$
  select c.relname::text, 'sem row level security'
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  union all
  select c.relname::text, 'row level security nao forcado'
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity and not c.relforcerowsecurity
  union all
  select t.tablename::text, 'sem politica'
    from pg_tables t where t.schemaname = 'public'
      and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = t.tablename)
  union all
  select g.table_name::text, 'permissao para ' || g.grantee
    from information_schema.role_table_grants g
    where g.table_schema = 'public' and g.grantee in ('anon', 'authenticated', 'PUBLIC')
  union all
  select p.tablename::text, 'politica com using (true) fora da excecao da auditoria'
    from pg_policies p
    where p.schemaname = 'public' and (p.qual = 'true' or p.with_check = 'true')
      and not (p.tablename = 'auditoria' and p.cmd = 'INSERT')
$$;
grant execute on function public.itmk_tabelas_sem_protecao() to itmk_app;
