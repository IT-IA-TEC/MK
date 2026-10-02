-- IT.MK 08: visoes de consulta (saldo, atraso, dashboard, fila do dia, pendencias, alertas de dado) e indices dos filtros.
-- Tudo calculado por consulta: nada de saldo ou situacao financeira copiado em coluna.
-- Faixas de atraso: 1 a 7, 8 a 15, 16 a 30, 31 a 60, 61 a 90 e mais de 90 (funcao faixa_atraso).
-- Indicadores que dependem de dado do BL (faturado sem imposto, aliquota fora do padrao, pagador sem responsavel)
-- nao entram aqui: o servidor junta com a leitura das visoes do BL.

-- Saldo da cobranca na data informada (o servidor injeta a data; a visao usa o dia de hoje em Brasilia).
create function public.cobranca_saldo_em(p_hoje date) returns table(
  cobranca_id bigint, pagador_id bigint, competencia_id bigint, tipo text, vencimento date, status text,
  valor_total numeric, pago numeric, abatido numeric, saldo numeric, vencida boolean, dias_atraso integer, faixa text)
language sql stable set search_path = ''
as $$
  select x.id, x.pagador_id, x.competencia_id, x.tipo, x.vencimento, x.status, x.valor_total, x.pago, x.abatido, x.saldo,
         (x.status in ('Em aberto', 'Parcial') and x.vencimento < p_hoje and x.saldo > 0),
         case when x.status in ('Em aberto', 'Parcial') and x.vencimento < p_hoje and x.saldo > 0 then p_hoje - x.vencimento end,
         public.faixa_atraso(case when x.status in ('Em aberto', 'Parcial') and x.vencimento < p_hoje and x.saldo > 0 then p_hoje - x.vencimento end)
  from (
    select c.id, c.pagador_id, c.competencia_id, c.tipo, c.vencimento, c.status, c.valor_total,
           coalesce(p.pago, 0) as pago, coalesce(l.abatido, 0) as abatido,
           c.valor_total - coalesce(p.pago, 0) - coalesce(l.abatido, 0) as saldo
    from public.cobranca c
    left join lateral (select sum(valor) as pago from public.pagamento where cobranca_id = c.id and estado = 'baixado') p on true
    left join lateral (select sum(valor) as abatido from public.lancamento_cobranca where cobranca_id = c.id) l on true
  ) x
$$;

create view public.v_cobranca_saldo as
  select * from public.cobranca_saldo_em((now() at time zone 'America/Sao_Paulo')::date);
comment on view public.v_cobranca_saldo is
  'Saldo = valor total - pagamentos baixados - ajustes e baixas. Vencida = status Em aberto ou Parcial, vencimento anterior a hoje (Brasilia) e saldo maior que zero.';

create view public.v_credito_saldo as
  select pagador_id, sum(case tipo when 'entrada' then valor else -valor end) as saldo
  from public.credito_lancamento group by pagador_id;

-- O que pausa a regua: promessa ativa, acordo ativo ou contestacao ativa.
create view public.v_pausa_cobranca as
  select pagador_id, null::bigint as cobranca_id, 'promessa'::text as motivo from public.promessa where estado = 'ativa'
  union all
  select pagador_id, null::bigint, 'acordo' from public.acordo where estado = 'ativo'
  union all
  select k.pagador_id, k.id, 'contestação' from public.contestacao c join public.cobranca k on k.id = c.cobranca_id
    where c.situacao in ('Aberta', 'Em análise', 'Aguardando cliente');

create view public.v_conversa_nao_lidas as
  select c.id as conversa_id, c.pagador_id, count(m.id) as nao_lidas
  from public.conversa c
  left join public.mensagem m on m.conversa_id = c.id and m.sentido = 'pagador' and m.id > coalesce(c.lida_ate_mensagem_id, 0)
  group by c.id, c.pagador_id;

-- Resumo da competencia fechada: o mes fechado vem desta tabela, nao de recalculo.
create table public.resumo_competencia (
  competencia_id bigint primary key references public.competencia(id) on delete restrict,
  cobrado numeric(14,2) not null,
  qtd_cobrancas integer not null,
  qtd_lojas integer not null,
  fechado_em timestamptz not null default now()
);
select public.itmk_travar_historico('public.resumo_competencia');

create function public.tg_resumo_competencia() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.estado = 'fechada' and old.estado = 'aberta' then
    insert into public.resumo_competencia (competencia_id, cobrado, qtd_cobrancas, qtd_lojas)
    select new.id,
           coalesce(sum(c.valor_total), 0),
           count(*),
           (select count(distinct i.loja_id) from public.cobranca_item i join public.cobranca c2 on c2.id = i.cobranca_id
              where c2.competencia_id = new.id and c2.status not in ('Cancelada', 'Substituída'))
    from public.cobranca c where c.competencia_id = new.id and c.status not in ('Cancelada', 'Substituída');
  end if;
  return null;
end $$;
create trigger tg_resumo_competencia after update on public.competencia for each row execute function public.tg_resumo_competencia();

create view public.v_cobrado_recebido_mes as
  select k.id as competencia_id, k.mes, k.estado,
         case when k.estado = 'fechada' then r.cobrado else coalesce(vivo.cobrado, 0) end as cobrado,
         coalesce(rec.recebido, 0) as recebido
  from public.competencia k
  left join public.resumo_competencia r on r.competencia_id = k.id
  left join lateral (select sum(valor_total) as cobrado from public.cobranca
                     where competencia_id = k.id and status not in ('Cancelada', 'Substituída')) vivo on true
  left join lateral (select sum(p.valor) as recebido from public.pagamento p join public.cobranca c on c.id = p.cobranca_id
                     where c.competencia_id = k.id and p.estado = 'baixado') rec on true;
comment on view public.v_cobrado_recebido_mes is
  'Cobrado = soma do valor total das cobrancas que nao estao Canceladas ou Substituidas (mes fechado usa o resumo gravado no fechamento). Recebido = soma dos pagamentos baixados nas cobrancas da competencia.';

create view public.v_dashboard_indicadores as
  select
    (select count(*) from public.v_cobranca_saldo where status in ('Em aberto', 'Parcial') and saldo > 0 and not vencida) as a_vencer_qtd,
    (select coalesce(sum(saldo), 0) from public.v_cobranca_saldo where status in ('Em aberto', 'Parcial') and saldo > 0 and not vencida) as a_vencer_valor,
    (select count(*) from public.v_cobranca_saldo where vencida) as vencido_qtd,
    (select coalesce(sum(saldo), 0) from public.v_cobranca_saldo where vencida) as vencido_valor,
    (select coalesce(sum(valor), 0) from public.pagamento
       where estado = 'baixado'
         and (pago_em at time zone 'America/Sao_Paulo')::date >= date_trunc('month', now() at time zone 'America/Sao_Paulo')::date) as recebido_mes,
    (select count(*) from public.acordo where estado = 'ativo') as em_acordo_qtd,
    (select count(*) from public.loja where situacao = 'bloqueada') as lojas_bloqueadas_qtd,
    (select count(*) from public.contestacao where situacao in ('Aberta', 'Em análise', 'Aguardando cliente')) as em_contestacao_qtd;
comment on view public.v_dashboard_indicadores is
  'A vencer = cobrancas Em aberto ou Parcial com saldo e vencimento de hoje em diante. Vencido = idem com vencimento anterior a hoje. Recebido do mes = pagamentos baixados cujo pagamento caiu no mes atual (Brasilia). Em acordo = acordos ativos. Bloqueadas = lojas com situacao bloqueada. Em contestacao = Aberta, Em analise ou Aguardando cliente.';

create view public.v_ranking_pagadores_vencido as
  select pagador_id, count(*) as qtd_vencidas, sum(saldo) as valor_vencido, max(dias_atraso) as maior_atraso,
         rank() over (order by sum(saldo) desc) as posicao
  from public.v_cobranca_saldo where vencida group by pagador_id;

create view public.v_ranking_lojas_valor as
  select c.competencia_id, i.loja_id, sum(i.valor) as valor,
         rank() over (partition by c.competencia_id order by sum(i.valor) desc) as posicao
  from public.cobranca_item i join public.cobranca c on c.id = i.cobranca_id
  where c.status not in ('Cancelada', 'Substituída')
  group by c.competencia_id, i.loja_id;

-- Mediana junto da media (valor por loja e atraso por pagador).
create view public.v_estatistica_atraso as
  select count(*) as qtd, avg(dias_atraso) as media_dias, percentile_cont(0.5) within group (order by dias_atraso) as mediana_dias
  from public.v_cobranca_saldo where vencida;

create view public.v_estatistica_valor_loja as
  select c.competencia_id, count(*) as qtd, avg(i.valor) as media, percentile_cont(0.5) within group (order by i.valor) as mediana
  from public.cobranca_item i join public.cobranca c on c.id = i.cobranca_id
  where c.status not in ('Cancelada', 'Substituída')
  group by c.competencia_id;

create view public.v_fila_do_dia as
  select s.cobranca_id, s.pagador_id, s.vencimento, s.status, s.saldo, s.vencida, s.dias_atraso, s.faixa,
         exists (select 1 from public.v_pausa_cobranca p where p.pagador_id = s.pagador_id or p.cobranca_id = s.cobranca_id) as pausada
  from public.v_cobranca_saldo s
  where s.status in ('Em aberto', 'Parcial') and s.saldo > 0
  order by s.vencimento, s.cobranca_id;

-- Pendencias: cada coisa conta uma vez so.
create view public.v_pendencias as
  select
    (select count(*) from public.comprovante where estado = 'a conferir') as comprovantes_a_conferir,
    (select count(*) from public.divergencia where estado = 'aberta') as divergencias_abertas,
    (select count(*) from public.pedido_saida where situacao = 'pendente') as pedidos_saida_pendentes,
    (select count(*) from public.robo_fila_aprovacao where estado = 'pendente' and not modo_sombra) as aprovacoes_robo_pendentes,
    (select count(*) from public.bloqueio_loja where situacao in ('a pedir', 'desbloqueio a pedir')) as bloqueios_a_pedir;

-- Alertas de dado que o banco do IT.MK consegue ver sozinho.
create view public.v_alertas_dado as
  select 'valor com diferença maior que 35% do mês anterior'::text as tipo, null::bigint as pagador_id, atual.loja_id,
         jsonb_build_object('competencia_id', atual.competencia_id, 'valor', atual.resultado, 'valor_mes_anterior', ant.resultado) as detalhe
  from (select distinct on (competencia_id, loja_id) competencia_id, loja_id, resultado
          from public.calculo_cobranca order by competencia_id, loja_id, numero_versao desc) atual
  join public.competencia ck on ck.id = atual.competencia_id
  join public.competencia ca on ca.mes = (ck.mes - interval '1 month')::date
  join (select distinct on (competencia_id, loja_id) competencia_id, loja_id, resultado
          from public.calculo_cobranca order by competencia_id, loja_id, numero_versao desc) ant
    on ant.competencia_id = ca.id and ant.loja_id = atual.loja_id
  where ant.resultado > 0 and abs(atual.resultado - ant.resultado) / ant.resultado > 0.35
  union all
  select 'loja bloqueada', l.pagador_id, l.id, null from public.loja l where l.situacao = 'bloqueada'
  union all
  select 'loja em saída', l.pagador_id, l.id, null
    from public.pedido_saida_loja s join public.pedido_saida p on p.id = s.pedido_saida_id and p.situacao = 'pendente'
    join public.loja l on l.id = s.loja_id
  union all
  select a.tipo, a.pagador_id, a.loja_id, a.detalhe from public.alerta_dado a where a.aberto;

-- Indices dos filtros reais das telas (os demais ja foram criados junto das tabelas, cada um por uma consulta).
-- fila do dia: cobrancas em aberto ordenadas por vencimento
create index cobranca_em_aberto_idx on public.cobranca (vencimento, id) where status in ('Em aberto', 'Parcial');
-- divergencias, comprovantes e aprovacoes pendentes (contagens do painel)
create index divergencia_abertas_idx on public.divergencia (ocorrido_em) where estado = 'aberta';
create index pedido_saida_pendente_idx on public.pedido_saida (data_pedido) where situacao = 'pendente';
-- contestacao ativa (pausa da regua e contagem)
create index contestacao_ativa_idx on public.contestacao (cobranca_id) where situacao in ('Aberta', 'Em análise', 'Aguardando cliente');
-- pagamentos do mes (recebido do mes)
create index pagamento_baixado_pago_idx on public.pagamento (pago_em) where estado = 'baixado';
-- lojas bloqueadas
create index loja_bloqueada_idx on public.loja (pagador_id) where situacao = 'bloqueada';
