-- IT.MK 03b: corrige a conferencia da soma dos itens (a 03 lia um campo que nao existe na tabela da cobranca).
create or replace function public.tg_cobranca_soma() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_id bigint; v_total numeric; v_soma numeric;
begin
  v_id := (to_jsonb(new) ->> case when tg_table_name = 'cobranca' then 'id' else 'cobranca_id' end)::bigint;
  select valor_total into v_total from public.cobranca where id = v_id;
  select coalesce(sum(valor), 0) into v_soma from public.cobranca_item where cobranca_id = v_id;
  if v_total is not null and v_soma <> v_total then
    raise exception 'A soma dos itens (%) e diferente do total da cobranca (%).', v_soma, v_total using errcode = '23514';
  end if;
  return null;
end $$;
