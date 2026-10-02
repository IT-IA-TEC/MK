-- IT.MK 12: a funcao de saldo roda com a permissao do dono das visoes, para a conta de relatorio ler so as visoes
-- (sem permissao nas tabelas) em qualquer visao que use a funcao.
alter function public.cobranca_saldo_em(date) security definer;
