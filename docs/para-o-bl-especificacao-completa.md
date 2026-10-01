# IT.MK e BL: especificação completa do que o BL precisa construir

Versão 1 · 02/10/2026 · Este documento **substitui** `contrato-bl-itmk.md` e `contrato-bl-itmk-calculo.md`. Leia só este.

## 0. Como ler
- **BL** é o banco e o Java do grupo Blanco e Lisboa. **IT.MK** é a empresa "40%" (cobrança de consultoria a clientes que vendem em marketplaces).
- Tudo marcado **a confirmar pelo BL** depende de olhar o que já existe no BL. Tudo marcado **decisão do dono** ainda não foi decidido por ele.
- Foco de construção agora: **Shein**. Shopee, Mercado Livre e Kwai ficam **em espera** (prioridade "Não terá agora" no CicloDev), mas o modelo de dados já nasce para as quatro plataformas, para não refazer depois.
- Os itens de trabalho estão no CicloDev, com título começando por **"BL: "** (tipo Tarefa externa). Este documento é a referência dos campos; os itens têm os critérios de aceite.

## 1. Regra de ouro e divisão de trabalho
**O IT.MK nunca escreve no banco do BL.** Ele só consulta visões (SELECT), escuta eventos e chama portas (API) do Java do BL.

| O BL faz | O IT.MK faz |
|---|---|
| Ficha do cliente (CPF), vínculo com a 40%, pessoas, empresas (CNPJ), lojas, "quem trata" | Cobrança, conferência, fechamento da competência, envio |
| Conexão com os marketplaces, tokens, segredos, renovação, reconexão | Régua, modelos de mensagem, bloqueio e desbloqueio de loja, acordos, parcelas, promessas |
| Análise das lojas (foto imutável, faixa de saúde, selo) | WhatsApp (banco e Java do IT.MK), robô, conversas, opt-out |
| Faturado por loja, base, importação de planilha, pedidos e notas | Inadimplência, contestações, esteira de ex-clientes inadimplentes |
| **Configuração e cálculo**: percentual da 40%, alíquota do imposto, base; imposto e valor da 40% | Recebe o cálculo pronto, confere (valor da 40% = imposto × percentual) e cobra |
| Pix com Asaas e Banco Inter: criar, cancelar, remover, avisos do provedor, reconciliação | Pede o Pix por porta, dá a baixa, trata divergência com uma pessoa |
| Cofre de segredos, credencial de leitura, proteção contra sobrecarga | Dashboard, relatórios, telas |

## 2. Ordem de construção
1. **Pré-requisitos:** credencial de leitura; marcar o vínculo da 40% nos clientes (hoje são **0** vínculos da 40% no BL: sem isso a carteira do IT.MK fica vazia); acesso à VPS (esta é do IT.MK).
2. **Ficha do cliente e lojas** (seção 3) e visões de leitura (seção 10).
3. **Eventos da ficha** (seção 11), para o IT.MK reagir em tempo real.
4. **Configuração e cálculo** (seção 5) e **faturamento** (seção 6).
5. **Shein:** conexão e análise (seções 7 e 8).
6. **Pix com Asaas** e as **portas** (seções 9 e 10). Banco Inter em paralelo (análise do banco demora).
7. Shopee, Mercado Livre e Kwai: só depois (em espera).

## 3. Ficha do cliente
**Chave do pagador: CPF** (11 números, único). **Chave da loja: plataforma + código da loja** (único). CNPJ nunca é chave.

| Bloco | Campos | Obrigatório |
|---|---|---|
| Cliente (pessoa) | CPF, nome, WhatsApp (só números, com DDD), e-mail, ativo | CPF, nome, WhatsApp |
| Vínculo com a 40% | companhia 40, ativo, data de início, data de fim, **motivo de saída** (Inadimplência, Pedido do cliente, Encerramento da loja ou da empresa, Outros), detalhe em texto, quem registrou | companhia, ativo, início |
| Empresa (CNPJ) | CNPJ (texto de 14 posições, aceita letras e números), razão social, regime tributário, representante legal (QSA), "quem trata" (já existe no BL) | CNPJ |
| Pessoas ligadas | nome, papel (responsável, financeiro, sócio), telefone | nome, papel |
| Loja | plataforma (Shein, Mercado Livre, Shopee, Kwai), código na plataforma (texto; na Shein é o GS), nome, **CPF do pagador dono**, empresa (CNPJ) opcional, data de início, situação do cadastro | plataforma, código, nome, CPF dono |
| Quem trata a loja | nome, WhatsApp, e-mail, CPF; opcional | conforme seção 4 |
| Etiquetas do cliente | nome, cor | não |

Não ficam no BL (são do IT.MK): bloqueio de cobrança da loja, situação do robô, modo de cobrança, conversas, tudo de cobrança.

## 4. Quem trata (regra única)
- Cada loja tem **uma só pessoa** que trata de tudo com o IT.MK (cobrança, mensagens, dúvidas, comprovantes). Uma pessoa pode tratar **várias** lojas.
- Por padrão, quem trata é o **cliente CPF dono** da loja. Se for outra pessoa, o BL tem o cadastro de **responsável terceiro** (nome, WhatsApp, e-mail, CPF), visível **só dentro da ficha da loja**. Para o IT.MK, quem aparece é sempre "quem trata", venha de onde vier.
- O terceiro **não vira pagador**. O pagador continua sendo o CPF dono da loja.
- A empresa (CNPJ) pode ter mais de um cliente CPF e o "quem trata" da empresa pode ser outra pessoa. **A loja guarda o CPF do dono explicitamente. O BL nunca deduz o dono pela empresa.**
- **Validação no BL:** todas as lojas de um mesmo pagador devem ter o **mesmo** "quem trata", porque a cobrança "um Pix por pagador" e as mensagens vão para uma pessoa só. Se forem diferentes, o BL recusa o cadastro, a menos que o modo de cobrança do pagador seja "um Pix por loja". O modo de cobrança é do IT.MK: o BL precisa lê-lo (campo `modo_cobranca` na visão da seção 10) ou o IT.MK avisa o BL por evento a confirmar. **Decisão do dono pendente: como tratar lojas do mesmo pagador com pessoas diferentes.**

## 5. Configuração e cálculo da cobrança (tudo no BL)
**Campos de configuração no Java do BL:** percentual da 40% (padrão 40), alíquota do imposto, base de cálculo padrão. Cada um pode ter **exceção por loja**. A alteração vale daqui para frente e guarda quem mudou, quando, valor antigo e novo (só inserção).
**Fonte única:** o percentual da 40% fica **só** na regra de cálculo (com exceção por loja). Não repetir o percentual no cadastro da loja.
**Bases (5):** Faturamento total, Valor dos produtos sem frete, Pedidos concluídos, Notas fiscais emitidas, Valor manual. Cada plataforma só aceita as bases que entrega (a Kwai não tem Notas fiscais); loja sem conexão ativa só aceita Valor manual. Por regra no banco, não por condição no código.
**Conta:** valor da 40% = **imposto × percentual da loja**, duas casas, **meio centavo sobe**. Alíquota = imposto ÷ faturado (só para conferir). Teste fixo: imposto R$ 3.140,00 a 40% = R$ 1.256,00; R$ 1.375,50 = R$ 550,20; R$ 3.000,00 a 35% = R$ 1.050,00.
**Estados do faturado:** vazio (a calcular), zero (sem movimento) e valor são três estados distintos, garantidos por `check`. Sem movimento não gera cobrança.
**Versões:** recalcular cria versão nova ligada à anterior, com motivo e autor; a antiga fica Substituída; nunca editada. Cada versão guarda base, faturado, imposto, alíquota, percentual e resultado.
**Histórico de troca de base e de percentual:** tabela só de inserção (quem, quando, antes, depois, alcance: só esta loja, lojas selecionadas ou todas; duração: mês vigente ou para sempre).
**Competência fechada (decisão do dono pendente):** recomendação é o BL **não recalcular** uma competência depois do vencimento (dia 20 do mês seguinte); correção entra como ajuste na competência seguinte. O IT.MK não avisa o BL do fechamento, porque não escreve no BL.

## 6. Faturamento
- Tabela do faturado por competência, loja, base e origem (API, planilha ou manual), `numeric(14,2)`. Chave única por competência, loja e origem; importar o mesmo lote duas vezes não duplica.
- **Importação de planilha** (.xlsx, .xls, .csv) no Java do BL, com prévia de Novas, Alteradas e Sem mudança; nada grava antes de confirmar; guarda arquivo (nome gerado pelo servidor, hash), linhas lidas, aceitas e rejeitadas e o motivo. Loja nova entra com base Valor manual e etiqueta Nova. Soma e contagem conferem com o total do arquivo.
- **Correção à mão** do faturado também no BL.
- **Pedidos e notas:** loja, data, valor, identificador externo (único por plataforma e identificador). Dado pessoal do comprador mascarado pela plataforma não é guardado.

## 7. Conexões com marketplaces (Shein agora)
**Situações:** Sem conexão, Aguardando autorização, Conectada, Com erro, Vencida. Chave única por loja e plataforma. Cada mudança grava evento de auditoria com usuário e motivo. Segredos no **Vault**, só de gravação, nunca lidos de volta, nunca em log.
**Shein**
- Conta de desenvolvedor e aplicativo (cinco passos do portal; Termo do Desenvolvedor, Política de Privacidade e Contrato de Autorização do Vendedor assinados). Prazo de análise, regra de IP e ambiente de teste só abrem com login: **conferir na conta aberta** antes de estimar. Contato oficial: openapi@shein.com.
- Autorização por **link**: o `tempToken` (vale 5 minutos) é trocado na hora por `get-by-token`; guardar `openKeyId`, `supplierId`, `supplierSource` e o **modelo da loja** (auto-operada, semi ou full-gerenciada). A chave `secretKey` vem criptografada e é aberta com a chave do aplicativo.
- Assinatura: `x-lt-openKeyId`, `x-lt-timestamp` (ms, vale 5 min), `x-lt-signature` HMAC-SHA256, `language pt-br`. Decidir entre SDK Java oficial ou assinar à mão.
- Sem validade fixa. Cancelamento pelo vendedor expira a chave na hora; reautorização muda a chave secreta; erro de assinatura depois disso muda a conexão para **Com erro** e avisa para pedir nova autorização.
- Leitura: pedidos e devoluções (horário de Pequim, UTC+8, convertido). **Full-gerenciada: devoluções manuais.** Comissão, taxa e repasse lidos do pedido são **estimados**. Desempenho (DSR), violações, penalidades, avaliações negativas e diagnóstico **ficam Manual** (sem API achada). Revisar a lista a cada 6 meses.
- Avisos (webhook): `eventData` criptografado, cabeçalhos `x-lt-*`, assinatura conferida, responder 2xx em **1,5 segundo** depois de gravar. A Shein reenvia 1 vez (2 vezes para pedido).
- Limites por endpoint respeitados (ex.: 300 por segundo no detalhe de pedido).
**Sincronização:** agenda por loja e plataforma, diária de partida; pula a rodada se o circuito do fornecedor está aberto; leitura completa diária confere avisos perdidos; idempotência por marketplace, loja, id externo e versão.
**Avisos de vencimento:** 30 dias antes (Shein sem validade fixa não gera aviso por data). Erro de autenticação não insiste; a coleta que depende pausa de forma segura.
**Reconexão:** gera novo convite com horário e `state` novos; atualiza data e tokens; registra quem e quando; coleta retoma sozinha.
**Em espera:** Shopee (assinatura, IPs declarados, validade 7 a 365 dias, Push), Mercado Livre (aplicativo único, conta da empresa IT.MK, token de renovação, 6 meses), Kwai (sem documentação por escrito: nada começa).

## 8. Análise de loja
- **Foto imutável** (`analise_loja`): loja, data, autor, número; update e delete bloqueados; corrigir é fazer outra. Salvar análise e campos numa transação.
- **Campos** (`analise_campo`): chave, valor, origem (Manual, API, Calculado, Cadastro); campo com origem API ou Calculado não aceita gravação manual; campo que a plataforma não entrega nasce Manual (na Shein: desempenho e violações). Concorrência e preço de terceiros nunca recebem origem API.
- Indicadores numéricos em colunas `numeric`. **Faixa de saúde única** calculada pelo sistema (Excelente, Boa, Regular, lista final em decisão registrada), com a versão da regra guardada; nunca vem do marketplace.
- **Selo da análise:** Sem análise, Em dia (até 30 dias), Desatualizada (mais de 30 dias), por consulta.
- Violações, devoluções e campanhas guardadas.

## 9. Pix (Asaas primeiro; Banco Inter em paralelo)
**Configuração:** provedor, ambiente (teste ou produção), chave Pix, titular da conta ("Agente Titular conta"). Segredos no cofre. Tarifas por escrito antes de usar qualquer valor de taxa.
**Pix:** estados Gerado, Enviado, Pago, Expirado, Cancelado (Pago não volta). **Pix de valor fixo não aceita pagamento parcial.** Identificador nosso no provedor (`externalReference` no Asaas, `txid` de 26 a 35 letras e números no Inter) gerado e guardado **antes** da chamada, único, nunca reaproveitado. Parcelamento: **um Pix por parcela**; soma das parcelas igual ao total, diferença de centavos na última.
**Validade:** 30 dias depois do vencimento. No Asaas o QR vale 12 meses, então uma rotina diária **remove** a cobrança vencida há mais de 30 dias; no Inter existe campo próprio (`validadeAposVencimento`). Pix que chegar depois do prazo **não baixa sozinho**: o evento sai marcado "fora do prazo".
**Juros e multa:** desligados por padrão; não enviar `interest` nem `fine`; conferir a configuração global da conta Asaas zerada.
**Asaas:** cliente sem duplicar (consulta antes, aceita CNPJ alfanumérico); QR com chave Pix na conta; `PAYMENT_UPDATED` anula QR anterior; aviso com `authToken` de 32 a 255 caracteres (nunca a chave de API), cabeçalho `asaas-access-token`, responder **HTTP 200** em até 10 segundos, `SEQUENTIALLY`; eventos RECEIVED, OVERDUE, DELETED, RESTORED, REFUNDED, PARTIALLY_REFUNDED; fila pausada após 15 falhas é alertada (reativar não é automático; Asaas guarda 14 dias); alertas de chave (ACCESS_TOKEN_*; sem uso 2 meses desliga em 3); reconciliação diária (25.000 chamadas por 12 h; 50 GET simultâneos). Sandbox: chave `aact_hmlg_`, recusada em produção; sandbox não testa juros e multa.
**Inter:** OAuth com certificado (.crt e .key) e client credentials, escopos cob.write/read, cobv.write/read, pix.write/read, webhook.write/read; token de 1 hora reaproveitado (máx. 5 pedidos de token por minuto); certificado vale 1 ano, alerta aos 90 e 30 dias; `cobv` por `PUT` com `validadeAposVencimento`; aviso por `PUT webhook` com `webhookUrl` https e **mTLS** (arquivo `ca.crt`, só IPs do Inter); lista `pix` com vários itens; baixa por `endToEndId`; CPF do pagador vem **mascarado** (comparar só a parte visível e marcar para conferência); Inter tenta 4 vezes (20, 30, 60, 120 min) e há consulta e reenvio (máx. 5 por minuto, até 50 txid); sandbox só das 8h às 20h em dias úteis, 10 pedidos por minuto. **A API Pix do Inter passa por análise do banco; sem prazo garantido.**
**Divergências:** o BL **não decide nada**. Ele registra o aviso bruto (provedor, id do evento único com o provedor, assinatura conferida, corpo cru, hash, estado, tentativas) e publica o evento. Quem pagou diferente, valor diferente, Pix fora do prazo e Pix sem cobrança são tratados pelo IT.MK com uma pessoa. **Nunca devolver sozinho.**

## 10. Portas (o IT.MK chama) e leituras (o IT.MK consulta)
**Portas:** HTTPS, credencial própria do IT.MK, tempo limite de 10 segundos, **efeito único** (mesmo `pedido_id` com os mesmos dados devolve o mesmo resultado; com dados diferentes, erro do negócio). **Uma chamada cria um Pix.** O IT.MK já manda o valor total daquele Pix (por pagador, por loja ou por parcela) e o `modo`.

| Porta | Entrada | Saída | Erros |
|---|---|---|---|
| Pedir um Pix | `pedido_id`, `cpf`, `plataforma`, `codigo_loja`, `valor_centavos` (inteiro), `vencimento`, `parcela`, `total_parcelas`, `modo` | `pix_id`, `identificador_provedor`, `copia_e_cola`, `link`, `validade`, `estado` | valor inválido, provedor indisponível, pedido repetido com dados diferentes |
| Cancelar ou remover um Pix | `pix_id` | `estado` (Cancelado ou Expirado) | Pix pago não cancela |
| Pedir reconexão | `plataforma`, `codigo_loja` | `situacao` e, se houver, link de autorização | loja inexistente |

**Visões de leitura** (`SELECT` só pelo usuário do IT.MK; dinheiro em duas casas; datas no fuso de São Paulo; paginação por chave):

| Visão | Colunas |
|---|---|
| `v_carteira_40` | cpf, nome, whatsapp, email, ativo, vinculo_ativo, vinculo_inicio, vinculo_fim, motivo_saida, motivo_detalhe |
| `v_loja` | plataforma, codigo_loja, nome_loja, cpf_dono, cnpj_informativo, inicio, quem_trata_nome, quem_trata_whatsapp, quem_trata_email, quem_trata_cpf, modo_cobranca |
| `v_pessoa_ligada` | cpf_cliente, nome, papel, telefone |
| `v_conexao_loja` | plataforma, codigo_loja, situacao, autorizada_em, validade, ultima_chamada_ok, ultimo_erro |
| `v_analise_loja` | analise_id, plataforma, codigo_loja, data, faixa_saude, selo, faturado, pedidos, devolucoes, violacoes, origem de cada campo |
| `v_faturado_loja` | competencia, plataforma, codigo_loja, base, faturado, imposto, aliquota, percentual_40, valor_40, versao_calculo, origem; e pedidos e notas |
| `v_regra_calculo` | percentual_40_padrao, aliquota, base_padrao, excecoes_por_loja, vigente_desde |
| `v_historico_base` | plataforma, codigo_loja, quem, quando, base_antiga, base_nova, alcance, duracao, competencia |
| `v_erro_integracao` | id, plataforma, codigo_loja, tipo, motivo, ocorrido_em, acao_sugerida, resolvido, fila (tamanho e idade do mais antigo) |

## 11. Eventos (o IT.MK escuta, só leitura)
- **Mudança da ficha:** `evento_id` (único), `tipo` (vinculo_entrou, vinculo_saiu, cliente_alterado, loja_alterada), `cpf`, `plataforma` e `codigo_loja` quando for de loja, `ocorrido_em`, `motivo_saida` e `motivo_detalhe` na saída.
- **Pagamento do Pix:** `evento_id`, `pix_id`, `pedido_id`, `valor_centavos`, `pago_em`, `provedor`, `pagador_nome`, `pagador_documento_mascarado`, marca "fora do prazo" quando for o caso.
- **Garantia:** entrega pelo menos uma vez, `evento_id` repetido para o mesmo fato, releitura por intervalo de datas depois de queda. Sugestão: tabela de eventos (outbox) do BL.

## 12. Acesso, segurança e sobrecarga
- Usuário **só de leitura** com acesso apenas às visões acima (nenhuma outra tabela). Teste prova que escrever, alterar e apagar são recusados. Dados de outras companhias do grupo (a YOU e as demais) **nunca** aparecem nas visões.
- Credenciais entregues por canal seguro, fora do repositório, do log e dos lotes, com data de troca.
- Limite de pedidos por segundo e **corte automático** quando o BL demora, para o IT.MK nunca derrubar o BL; medir pedidos por minuto e alertar.
- Logs sem segredo, sem token, sem chave Pix e com CPF, CNPJ, telefone e `apikey` mascarados; teste procura esses padrões.

## 13. Base das integrações (comum)
Tempo limite de 10 segundos e até 3 tentativas com espera crescente; circuito que abre quando o fornecedor cai; **fila de erros** com reprocesso manual e alerta; efeito único em aviso repetido; relógio injetado nos prazos; modo teste e modo sombra; **chave geral** para desligar cada integração sem nova versão; segredo lido só pela função da integração. Os erros ficam em `v_erro_integracao`.

## 14. Regras de dados em todo o BL
Dinheiro `numeric` com duas casas, nunca `float`; centavos inteiros só nas portas, com conversão na borda. **Uma só regra de arredondamento (meio centavo sobe).** Datas e hora com fuso; hora gravada em UTC e exposta em São Paulo; vencimento é data sem hora; Pequim (UTC+8) só na entrada da Shein. Chaves públicas separadas das internas. Versão do registro para edição concorrente. Auditoria **só de inserção** (editar e apagar falham por teste). Toda tabela nova com regra de acesso por linha ligada e testada. Mudança de estrutura por migração versionada, em expansão e contração, testada em cópia dos dados, com plano de volta e conferência de soma e contagem. CNPJ com 14 posições em texto (letras e números).

## 15. Ambientes e VPS (do IT.MK, para o BL saber)
Teste e produção separados (bancos, chaves e endereços diferentes). O servidor do IT.MK roda numa VPS do dono, com IP fixo, HTTPS e certificado; porta 443 aberta e a do banco fechada; o IT.MK precisa do IP fixo para o BL liberar a credencial de leitura e para declarar IPs nos marketplaces.

## 16. Conflitos e situações de risco
| # | Situação | Solução neste documento |
|---|---|---|
| 1 | Percentual da 40% em dois lugares (cadastro da loja e regra de cálculo) | Fonte única na regra de cálculo, com exceção por loja |
| 2 | Empresa com vários CPFs; "quem trata" da empresa pode não ser quem fala das lojas | Loja guarda o CPF dono; BL nunca deduz; terceiro só dentro da ficha da loja |
| 3 | Lojas do mesmo pagador com "quem trata" diferentes e cobrança "um Pix por pagador" | Validação no BL (seção 4). **Decisão do dono pendente** |
| 4 | Recalcular competência já cobrada | Congelar após o vencimento (seção 5). **Decisão do dono pendente** |
| 5 | Dinheiro em centavos nas portas e `numeric` nas visões | Conversão só na borda; uma regra de arredondamento |
| 6 | Pix pago depois dos 30 dias ou depois da remoção no Asaas | Evento "fora do prazo", nunca baixa sozinho |
| 7 | Aviso repetido (entrega pelo menos uma vez) | `evento_id` e `endToEndId` únicos; resposta 200 sem nova baixa |
| 8 | Pedido repetido de Pix | `pedido_id` e identificador do provedor únicos, gerados antes da chamada |
| 9 | Cliente sai do vínculo com cobrança aberta | Evento com motivo; Pix abertos **não** são cancelados pelo BL; o IT.MK pede o cancelamento |
| 10 | Cliente com vínculos em várias companhias | Visões filtram só a 40%; nada de outras empresas vaza |
| 11 | Vínculo da 40% hoje em zero | Primeira tarefa; sem ela nada aparece |
| 12 | `loja_canal` existente (empresa, canal, nome, código GS) | Aproveitar se servir, generalizando "código GS" para código da plataforma, por migração segura (a confirmar) |
| 13 | CNPJ alfanumérico | Texto de 14 posições; não validar só números |
| 14 | CPF mascarado no aviso do Inter | Comparar só a parte visível; marcar para conferência |
| 15 | Dados de teste em produção e chave de teste | Chave `aact_hmlg_` recusada em produção; teste só com dados fictícios |
| 16 | Sobrecarga do BL por leitura em tempo real | Limites, corte automático, eventos em vez de consulta repetida |
| 17 | Shein: documentação só com login, reautorização troca a chave, devoluções manuais na full-gerenciada | Seção 7; estimar prazo só depois de abrir a conta |
| 18 | Prazo de 03/10/2026 para tudo | **Irreal para construção.** As datas do CicloDev são calendário; o risco é do dono |
| 19 | Mudança de telefone ou e-mail de quem trata no BL | Reflete no IT.MK pela visão e pelo evento `cliente_alterado` ou `loja_alterada` |

## 17. Pontos a confirmar pelo BL
Nome real de tabelas e visões; se `loja_canal` e `outbox_evento` servem; como o BL registra hoje o motivo de saída; como o BL guarda hoje percentual e alíquota (e se a alíquota depende do regime tributário); se já existe importação de planilha; limites de pedidos por minuto aceitos; hospedagem do endpoint de aviso com mTLS (Inter).

## 18. Decisões do dono ainda abertas
1. Congelar ou não a competência após o vencimento (seção 5).
2. Lojas do mesmo pagador com pessoas diferentes (seção 4).
3. Tarifas do Pix do Asaas e do Inter (por escrito, antes de usar taxa).
