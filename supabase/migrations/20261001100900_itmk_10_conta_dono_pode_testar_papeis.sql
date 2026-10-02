-- IT.MK 10: a conta dona do banco (postgres) pode assumir cada papel so para rodar os testes de permissao.
-- Nao muda nada do que cada papel pode fazer.
grant itmk_app, itmk_robo, itmk_integracao, itmk_relatorio, itmk_migracao to postgres with inherit false, set true;
