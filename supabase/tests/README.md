# Testes do banco do IT.MK

Cada arquivo e um bloco `DO` que prepara dados, confere o que o banco deve aceitar e recusar, e termina com
`raise exception 'TESTE_OK_ROLLBACK ...'`. Esse erro final e proposital: ele desfaz tudo e mostra o resultado.

- Linhas escritas em minusculas (ex.: `update_auditoria_bloqueado`) = o banco se comportou como combinado.
- Linhas com `(ERRO)` no fim = o banco deixou passar algo que devia recusar.
- Rodar sempre num banco de teste. Nao rodar em producao com dados reais.
- Nunca rodar `UPDATE` ou `DELETE` sem `WHERE` pela ferramenta do Supabase (ela pode ficar esperando confirmacao).

Ordem: 01 (auditoria e selo), 02 (cobranca e Pix), 03 (permissoes por conta), 04 (consulta de protecao das tabelas).
