-- IT.MK 14: conferencia diaria da corrente de selos (auditoria, execucoes e acoes do robo).
-- Roda todo dia as 06:00 de Brasilia (09:00 UTC). Corrente quebrada vira alerta de dado.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('itmk_conferir_cadeias', '0 9 * * *', 'select public.itmk_conferir_cadeias()');
