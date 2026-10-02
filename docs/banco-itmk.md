# Banco do IT.MK (Supabase "MK - Cobranças")

Situação em 02/10/2026. Projeto `uhrddcfyxedqfkoifyqc`, região São Paulo, Postgres 17.
O banco do BL (`wfqcoocfastgsfgegpcm`) **não foi tocado**: o IT.MK só lê dele, por visões, eventos e portas.

## 1. O que existe agora

- **66 tabelas, 14 visões, 54 funções**, criadas por 15 migrações em `supabase/migrations/` (a 03b corrige a 03 e a 12 ajusta a 08; migração aplicada nunca é editada).
- **5 contas do banco**, todas sem login e sem poder de administrador: `itmk_app`, `itmk_robo`, `itmk_integracao`, `itmk_migracao`, `itmk_relatorio`. A senha e o login de cada uma são definidos pelo dono, fora do repositório.
- **Acesso por linha ligado e forçado nas 66 tabelas.** `anon` e `authenticated` não têm nenhuma permissão. Nenhuma conta tem permissão de apagar (única exceção: tirar etiqueta de uma conversa).
- **Auditoria só de inserção, com selo encadeado** (SHA-256, ordem garantida por trava). Também com selo: execuções e ações do robô. Conferência diária às 06:00 de Brasília (pg_cron): corrente quebrada vira alerta de dado.
- Dinheiro sempre `numeric(14,2)`, percentuais `numeric(9,6)`, competência = `date` (dia 1), instantes = `timestamptz`.
- Regra única de arredondamento: `arredondar_centavos()` (centavo mais próximo, meio centavo sobe).
- Faixas de atraso: `faixa_atraso()` (1 a 7, 8 a 15, 16 a 30, 31 a 60, 61 a 90, mais de 90).
- Bucket privado `comprovantes` no Storage (PDF, JPG e PNG, até 10 MB).
- Verificador de segurança do Supabase: **0 avisos**. Verificador de desempenho: só avisos de nível informativo (seção 7).

## 2. Como o servidor Spring deve falar com o banco

Conexão direta no Postgres, com a conta certa de cada componente (app, robô, conector, relatório). **A Data API do Supabase deve ficar desligada** (o dono desliga no painel: Project Settings, API).

Toda transação precisa informar quem está agindo, senão o banco devolve zero linhas e recusa gravar:

```sql
select set_config('itmk.ator_tipo', 'usuario', true);   -- usuario | robo | sistema | webhook
select set_config('itmk.usuario_id', '<uuid do usuario>', true);  -- só quando for usuario
select set_config('itmk.motivo', 'texto', true);         -- quando a ação pede motivo
```

Regras que o banco já faz sozinho (o servidor não precisa repetir, mas precisa tratar o erro):

- Alteração com concorrência: gravar com `update ... where id = ? and versao = ?`; zero linhas = conflito.
- Cobrança: total igual à soma dos itens (conferido ao fechar a transação), valor do item igual ao resultado do cálculo recebido do BL, valor nunca editado, status só pelas transições permitidas.
- Pix: um por cobrança (ou por loja, ou por parcela), Pix pago não volta, valor não muda.
- Pagamento: o mesmo identificador do provedor nunca entra duas vezes (`on conflict do nothing`).
- Divergência, contestação, aprovação do robô, acordo e modelo de mensagem só passam por uma pessoa (`itmk.ator_tipo = usuario`).
- Loja só vira bloqueada (ou volta a ativa) pelo pedido de bloqueio ou desbloqueio confirmado.
- Robô: registrar execução e ação pelas funções `robo_registrar_execucao` e `robo_registrar_acao` (o robô só insere e não lê essas tabelas). Uma rodada por vez: `itmk_robo_travar_rodada()` no começo da transação.
- Mudança de etapa da régua, limites do robô, feriados e WhatsApp gravam o histórico de configuração sozinhos.

## 3. Mapa do CicloDev para o banco

| Item do CicloDev | Onde está no banco |
|---|---|
| BL-284 migrações | pasta `supabase/migrations/` |
| BL-285 contas | 5 contas (seção 1) |
| BL-286 acesso por linha | todas as tabelas; função `itmk_proteger_tabela()` para tabela nova; consulta `itmk_tabelas_sem_protecao()` para o teste de entrega |
| BL-287, 288, 289, 290, 291 | tipos, datas, nomes do glossário, `id_publico`, `on delete restrict`, `versao` |
| BL-293 pagador, BL-294 loja | `pagador` (CPF único, modo de cobrança), `loja` (plataforma + código) |
| BL-295 usuários | `usuario` (liga ao login do Supabase) |
| BL-297 pessoas ligadas | nada no IT.MK, de propósito (vem do BL) |
| BL-298 etiquetas da conversa | `etiqueta`, `etiqueta_conversa` |
| BL-299 a 303 auditoria | `auditoria`, `historico_configuracao`, `politica_guarda_auditoria` |
| BL-315 competências | `competencia`, `resumo_competencia` |
| BL-320 cobrança e itens | `cobranca`, `cobranca_item`, `status_cobranca`, `transicao_status_cobranca` |
| BL-321 memória de cálculo | `calculo_cobranca` (recebido do BL, nunca editado) |
| BL-323 Pix | `pix` (o que o BL devolveu) |
| BL-325 agendar envio | `agenda_envio`, `fila_envio` |
| BL-326 a 331 recebimentos | `pagamento`, `divergencia`, `decisao_divergencia`, `devolucao`, `credito_lancamento`, `comprovante` |
| BL-334 regras do fechamento | `configuracao_fechamento` (versionada) |
| BL-335 modelos, BL-336 régua | `modelo_mensagem`, `variavel_mensagem`, `regua`, `etapa_regua`, `excecao_regua_pagador` |
| BL-337 a 342 inadimplência | `acordo`, `acordo_cobranca`, `acordo_parcela`, `contestacao` (+ evento e cálculo anexado), `lancamento_cobranca`, `promessa`, `bloqueio_loja` (+ história), `pedido_saida` |
| BL-343 a 350 conversas e robô | `conversa`, `mensagem`, `conversa_atribuicao`, `robo_execucao`, `robo_acao`, `robo_fila_aprovacao`, `situacao_robo_pagador`, `robo_configuracao`, `feriado`, `opt_out`, `opt_in`, `whatsapp_canal` |
| BL-352 a 354 consultas | 14 visões (`v_dashboard_indicadores`, `v_fila_do_dia`, `v_pendencias`, `v_alertas_dado` e outras) e os índices |
| BL-598 esteira de ex-clientes | `etapa_ex_cliente`, `etapa_ex_cliente_passo`, `caso_ex_cliente`, `caso_ex_cliente_movimento` |
| BL-632 destino da cobrança | `destino_cobranca_padrao`, `destino_cobranca_pagador`, `destino_cobranca_historico` |
| Fila de erros do IT.MK | `fila_erro_integracao` (a do BL é item "BL:") |

## 4. O que não foi feito e por quê

- **Itens "BL:"** (conexões, segredos, análise de loja, faturado, pedidos e notas, provedor de Pix, juros e multa, aviso bruto do provedor): são do banco do BL.
- **BL-351 Limite semanal** e **BL-355 Realtime**: são "Poderia", sem critérios de aceite.
- **Itens de decisão e de infraestrutura** que não se resolvem com tabela: plano Pro e PITR (BL-274, 356), projeto de teste separado (BL-275, 283), backup extra fora do Supabase (BL-281, 359), cópia dos comprovantes (BL-360), troca de chaves (BL-361), parecer sobre guarda da auditoria (BL-278), particionar auditoria (BL-282, hoje não se particiona).
- Não existe segredo nenhum guardado neste banco (as chaves dos provedores ficam no BL).
- Não foi possível criar gatilho automático para "toda tabela nova nasce protegida" (a conta do banco não é superusuário). Em vez disso: usar `itmk_proteger_tabela()` em toda tabela nova e rodar `supabase/tests/04_protecao_das_tabelas.sql` em toda entrega (precisa devolver zero linhas).

## 5. Escolhas minhas que o dono ainda não decidiu (confirmar)

1. **Lista de status da cobrança**: Em aberto, Parcial, Quitada, Cancelada, Substituída (a partida que está escrita no item BL-280). Vencida é calculada. Transições: Em aberto vai para qualquer outra; Parcial vai para Em aberto, Quitada, Cancelada ou Substituída; Quitada volta para Parcial ou Em aberto (baixa desfeita); Cancelada e Substituída são finais.
2. **Transições da contestação**: Aberta vai para Em análise ou Aguardando cliente; Em análise vai para Aguardando cliente, Procedente, Improcedente ou Ajustada; Aguardando cliente volta para Em análise; Procedente pode virar Ajustada.
3. **Passos da esteira de ex-clientes**: só para frente (amigável, negociação, notificação formal, jurídico). Notificação formal e jurídico nascem desligadas.
4. **Variáveis permitidas nas mensagens**: nome, competencia, total, vencimento, pix, loja, saldo, dias_atraso, plataforma, link. ("e outras" não estava definido.)
5. **Tudo nasce travado por segurança**: robô pausado e em modo sombra; as 6 etapas da régua desligadas (sem modelo aprovado nada sai); destino padrão "não enviar até escolher"; número do WhatsApp desconectado até uma pessoa confirmar.
6. **Pagador**: chave interna própria e CPF único (em vez de o CPF ser a chave), para o pedido de apagar dado pessoal atuar só na tabela do pagador sem quebrar a auditoria.
7. **Acordo**: parcelas + entrada = valor total (com entrada zero é igual ao que está escrito). Máximo de parcelas vem da regra do fechamento (hoje 12).
8. **Fila de envio**: a chave de idempotência é um texto que o servidor monta e deve incluir o destinatário (cobrança + data + canal + destino), porque "todos os responsáveis" gera mais de uma mensagem por cobrança.
9. **Comprovante**: PDF, JPG ou PNG, até 10 MB; o mesmo arquivo não entra duas vezes para o mesmo pagador.
10. **Vencimento do fechamento**: dia entre 1 e 28; tolerância entre R$ 0,01 e R$ 1,00; parcelas de 1 a 60.
11. **Etiqueta**: a cor é o nome do token do arquivo de estilo (verde, azul, amarelo, roxo, vermelho), não o código da cor.
12. **Opt-out**: só uma pessoa revoga. **Limite do robô**: subir limite exige motivo.

## 6. O que foi testado e o que não foi

Testado (scripts em `supabase/tests/`, rodados como dono e como cada conta, tudo desfeito no fim): auditoria não edita, não apaga, não esvazia e a corrente acusa linha adulterada; cobrança com soma errada, valor editado, transição ruim, Pix duplicado, Pix pago voltando, competência fechada; pagamento duplicado; divergência decidida só por pessoa e só uma decisão; acordo (R$ 100,00 em 3 parcelas) e acordo acima do máximo; contestação decidida só por pessoa; bloqueio de loja passo a passo; modelo de mensagem, régua, limites com motivo, WhatsApp, opt-out, fila de envio, conversa e robô; esteira de ex-clientes; permissões de `anon`, `authenticated`, app, robô, conector e relatório.

**Não conferi:**
- Concorrência de verdade (20 envios iguais ao mesmo tempo, dois registros de selo ao mesmo tempo, duas decisões ao mesmo tempo): as travas e as chaves únicas existem, mas o teste com várias conexões simultâneas ainda precisa ser feito pelo time técnico.
- Plano EXPLAIN das consultas pesadas (não há dados ainda).
- Restauração de backup, PITR e cópia extra.
- Se o plano do projeto é Pro.
- Ambiente de teste separado: não existe; este projeto foi tratado como produção.

## 7. Avisos de desempenho do Supabase (justificativa)

- **Chaves estrangeiras `criado_por` sem índice** (uma por tabela, cerca de 37): usuário nunca é apagado (gatilho bloqueia) e nenhuma tela filtra por quem criou. Índice em todas só deixaria a gravação mais lenta. As demais chaves de usuário que aparecem em consulta ganharam índice.
- **Índices "não usados"** (cerca de 108): o banco está vazio. Cada índice cita a consulta que o justifica; reavaliar com dados reais.
- **Conexões do Auth em número fixo**: é configuração do Supabase, não do IT.MK.

## 8. O que falta do dono

1. Definir senha e login de cada conta (`itmk_app`, `itmk_robo`, `itmk_integracao`, `itmk_relatorio`) e guardar fora do repositório. A conta `itmk_migracao` não é usada no dia a dia.
2. Desligar a Data API do projeto.
3. Confirmar o plano Pro, o backup diário e se contrata PITR.
4. Decidir onde fica a cópia extra semanal e quem guarda a cópia dos comprovantes.
5. Responder as escolhas da seção 5.
