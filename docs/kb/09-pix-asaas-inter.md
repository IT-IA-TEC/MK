# Manual 09 · Pix e provedores (Asaas e Banco Inter)

Manual de consulta para o P.O. do IT.MK. Português simples. Pesquisado nas fontes oficiais em **01/10/2026**.
Usado para escrever histórias, critérios de aceite e tirar dúvida com o time de Integrações e Backend.

Como ler as marcas:
- **Confirmado** = li na fonte oficial (URL na tabela de fontes, seção 15).
- **Não confirmado** = não achei na fonte oficial ou não consegui abrir a página. Não use como fato. Peça teste no ambiente de teste ou pergunta ao provedor.
- Nenhuma taxa, limite ou nome de campo abaixo foi inventado. O que não deu para confirmar está marcado.

Base do IT.MK: cobrança mensal da empresa 40%, Pix por pagador (opção por loja), provedor Asaas OU Banco Inter, baixa automática por aviso de pagamento, divergências para uma pessoa. Telas olhadas: `prototipo/js/configuracoes.js`, `recebimentos.js`, `fechamento.js`.

---

## 1. Resumo em 15 linhas

1. O Pix tem uma regra única do Banco Central (BC). Asaas e Inter seguem essa regra, cada um do seu jeito.
2. **Cobrança com vencimento ("cobv")** é o tipo certo para a cobrança mensal: tem data de vencimento, prazo depois do vencimento, juros e multa.
3. **Cobrança imediata ("cob")** vale por segundos a partir da criação (padrão 86.400 s = 1 dia). Serve para pagamento na hora, não para cobrança mensal.
4. No **Inter** o prazo depois do vencimento existe como campo oficial (`calendario.validadeAposVencimento`, em dias corridos). Combina direto com a regra "link vale X dias após o vencimento".
5. No **Asaas** não achei campo igual para Pix. O QR Code do Asaas expira **12 meses após o vencimento**. Para respeitar o prazo do IT.MK, o sistema precisa remover a cobrança no Asaas quando o prazo acabar (a remoção existe; o efeito sobre um Pix já enviado não foi testado).
6. Juros e multa: no BC são campos opcionais. Se não enviar, não cobra. No Asaas, **a conta pode ter juros e multa padrão**; é preciso conferir que está zerado.
7. **Pix de valor fixo não aceita pagamento parcial** (regra do BC: sem o campo de alteração de valor, o pagador não muda o valor). Valor menor só chega por transferência por chave ou QR Code estático, e aí vira divergência.
8. **Aviso de pagamento (webhook)**: Asaas protege com um token no cabeçalho (`asaas-access-token`). Inter protege com certificado nos dois lados (mTLS) e lista de IPs. São jeitos diferentes de validar.
9. Asaas pausa a fila de avisos depois de **15 falhas seguidas** e guarda os eventos por **14 dias**. O Inter tenta **4 vezes** (20, 30, 60 e 120 min) e tem consulta e reenvio de avisos.
10. Asaas só aceita resposta **HTTP 200** (201 ou 204 contam como falha) e dá **10 segundos** para responder.
11. Inter entrega **certificado + chave** (arquivos `.crt` e `.key`) com validade de **1 ano**, mais Client ID e Client Secret. A tela de Configurações do protótipo prevê um certificado com senha; para o Inter isso precisa de ajuste (seção 6).
12. Inter: o acesso à API passa por **análise do banco** ("Em validação"). Em 24/12/2025 a API Pix ficou fechada para novas integrações e foi reaberta em 12/03/2026. Risco de prazo.
13. O aviso do Inter traz o **nome e o CPF/CNPJ de quem pagou** (campo `pagador`; CPF vem mascarado). O aviso padrão do BC só traz texto livre. No Asaas não confirmei se o aviso traz quem pagou.
14. Devolução: o BC permite até **90 dias** depois do Pix. Asaas e Inter têm chamada de devolução.
15. Atenção ao **CNPJ com letras** (CNPJ alfanumérico): a especificação do BC já aceita letras e números nos 14 caracteres.

---

## 2. Regras do Banco Central (base de tudo)

### 2.1 Documentos e versões lidas
| Documento | Versão | Data |
|---|---|---|
| API Pix (arquivo `openapi.yaml`, GitHub do BC) | 2.10.0 | lido em 01/10/2026 |
| Manual de Padrões para Iniciação do Pix | 2.10.0 | 19/08/2026 (consta no histórico do próprio manual) |
| Manual do BR Code (QR Codes) | 2.0.1 | 31/08/2020 (versão mais recente do arquivo) |

### 2.2 BR Code e "copia e cola"
- **BR Code** é o nome do padrão de QR Code de pagamento no Brasil (baseado no padrão internacional EMV).
- **Pix copia e cola** é o mesmo texto do QR Code, para colar no aplicativo do banco. É o mesmo conteúdo, só que em texto.
- O texto é uma sequência de blocos "número do campo, tamanho, valor". Campos importantes (confirmado no manual):
  - Campo 00: versão do formato (sempre "01").
  - Campos 26 a 51: dados do Pix. Dentro deles, o item 00 vale `br.gov.bcb.pix`.
  - Campo 54: valor.
  - Campo 62 (item 05): identificador da transação (txid) no QR estático.
  - No final: CRC (número de conferência). Se o texto for editado, a conferência falha.
- **QR Code estático**: tudo está dentro do QR (chave, e opcionalmente valor, txid e texto). Pode ser reusado e o recebedor não controla quantas vezes é pago.
- **QR Code dinâmico**: o QR guarda só um **link** (URL) para o banco do recebedor. O valor, o txid e o vencimento vêm desse link. Por isso o valor pode ser calculado na hora (juros, multa, desconto).
- Para o IT.MK: usar **sempre dinâmico**. O estático só aparece como risco (pagamento sem cobrança ligada).
- Limite de tamanho do texto completo: não confirmado nos manuais lidos (um resumo automático falou em 512 caracteres, **não confirmado**).

### 2.3 Cobrança imediata (cob) e com vencimento (cobv)
| | cob (imediata) | cobv (com vencimento) |
|---|---|---|
| Para quê | Pagar agora | Pagar até uma data, com juros, multa, desconto |
| Prazo | `calendario.expiracao`, em **segundos** a partir da criação. Padrão 86400. Tem de ser maior que zero | `calendario.dataDeVencimento` (data) + `calendario.validadeAposVencimento` (dias corridos depois do vencimento) |
| Devedor (quem deve) | opcional | **obrigatório** (nome e CPF ou CNPJ) |
| Juros, multa, abatimento, desconto | não se aplica | sim, campos opcionais dentro de `valor` |
| Valor | `valor.original` | `valor.original`; o banco calcula o valor final na hora do pagamento |
| Permissões (escopos) no BC | cob.write, cob.read | cobv.write, cobv.read |
| Chamada de criar | `PUT /cob/{txid}` (você escolhe o txid) ou `POST /cob` (banco escolhe) | `PUT /cobv/{txid}` (você escolhe o txid). Lote: `PUT /lotecobv/{id}` |

Pontos confirmados:
- Em cobv, o devedor é obrigatório e a **chave Pix do recebedor** (`chave`) e o **txid** são obrigatórios.
- Vencimento em fim de semana ou feriado do pagador é **prorrogado para o próximo dia útil**. Isso vale também para o prazo depois do vencimento, descontos, juros e multa.
- O vencimento "pode ser pago em qualquer horário do dia".
- A fórmula do valor final é: **final = original − abatimento − desconto + juros + multa**. Partes com valor zero não aparecem.
- Cada valor em dinheiro vai como texto com 2 casas, ex.: `"123.45"` (formato `\d{1,10}\.\d{2}`).
- Se o banco do pagador abre o link sem informar a data do pagamento pretendida, o banco do recebedor usa: a data do vencimento (se ainda não venceu) ou a data da consulta (se já venceu).
- Fora do prazo (depois de vencimento + validade): "a cobrança não será considerada válida" e não pode ser paga. O banco do recebedor pode responder erro ou mostrar a cobrança só para informar (liberdade do banco).
- Status do registro da cobrança: `ATIVA`, `CONCLUIDA` (já paga, não aceita outro pagamento), `REMOVIDA_PELO_USUARIO_RECEBEDOR`, `REMOVIDA_PELO_PSP`. Importante: o status **não diz** se está vencida ou expirada.

### 2.4 Juros, multa, abatimento, desconto (campos do BC)
Todos dentro de `valor` e só para cobv. Todos opcionais. Cada um tem `modalidade` e `valorPerc` (valor ou percentual, como texto com 2 casas).

| Item | Modalidades (número = significado) |
|---|---|
| `multa` | 1 = valor fixo; 2 = percentual |
| `juros` | 1 valor (dias corridos); 2 % ao dia (corridos); 3 % ao mês (corridos); 4 % ao ano (corridos); 5 valor (dias úteis); 6 % ao dia (úteis); 7 % ao mês (úteis); 8 % ao ano (úteis) |
| `abatimento` | 1 = valor fixo; 2 = percentual |
| `desconto` | 1 valor fixo até data(s); 2 percentual até data(s) (até 3 datas, no campo `descontoDataFixa`); 3 a 6 = por dia de antecipação (valor ou percentual, dias corridos ou úteis) |

- Regras de erro do BC: abatimento ou desconto maior ou igual ao valor original é recusado. Data de desconto depois do vencimento é recusada.
- O cálculo de juros e multa é feito **pelo banco do recebedor** a partir do vencimento (Anexo III do manual). Juros e multa **só incidem depois do vencimento**.
- Se juros e multa estiverem **ausentes**, o valor final é o original. Para o IT.MK ("desligados por padrão") isso é o comportamento padrão no BC e no Inter.

### 2.5 Identificadores
- **txid**: identifica a cobrança. De 26 a 35 caracteres, só letras e números. É criado por quem recebe. **Único por CNPJ/CPF do recebedor e banco**, e **não pode ser reusado nunca**, nem depois de cancelar ou baixar a cobrança. Não pode existir cob e cobv com o mesmo txid.
- Quem escolhe o txid garante **idempotência**: se a chamada falhar no meio, dá para repetir sem criar duas cobranças (o próprio manual dá essa razão).
- **e2eid** (EndToEndId): identifica **o Pix pago** (cada pagamento). Tem exatamente 32 caracteres, letras e números. Use como chave de "não duplicar baixa".
- **devolução**: tem um `id` escolhido por você (1 a 35 caracteres) e um `rtrId` de 32 caracteres dado pelo banco.
- Pix recebido **sem txid** (QR estático sem txid, por chave) **não gera aviso** no webhook do BC.

### 2.6 Validade e expiração (resumo)
- cob: vale `expiracao` segundos depois de `calendario.criacao`.
- cobv: vale até `dataDeVencimento` + `validadeAposVencimento` dias corridos (ajustado para dia útil se cair em fim de semana ou feriado).
- Cobrança paga (`CONCLUIDA`) não aceita outro pagamento. Isso protege contra pagar duas vezes o mesmo Pix dinâmico.
- Um link "cancelado" ou "removido" continua com registro, só não é mais pagável.

### 2.7 Webhook do banco (aviso de pagamento) segundo o BC
- Cadastro: `PUT /webhook/{chave}`. O aviso está ligado à **chave Pix**, não à cobrança.
- Dispara quando um ou mais Pix com txid são recebidos e também quando uma devolução termina (`DEVOLVIDO` ou `NAO_REALIZADO`).
- O corpo traz uma lista `pix` com `endToEndId`, `txid`, `valor`, `horario`, `infoPagador` (texto livre, até 140 caracteres), `componentesValor` (original, juros, multa, desconto, abatimento) e `devolucoes`.
- Segurança: o canal usa **mTLS** (certificado nos dois lados). Recomenda-se usar os mesmos certificados da API.
- Tentativas e prazo de entrega: **não definidos pelo BC**. Cada banco define o seu "SLA".
- A lista de Pix pode vir **agrupada** (várias linhas num único aviso). O sistema precisa tratar lista, não um item só.

### 2.8 Devolução
- `PUT /pix/{e2eid}/devolucao/{id}` com o valor. Pode ser parcial. A soma das devoluções não pode passar o valor do Pix.
- Janela: **90 dias** desde a liquidação do Pix (texto do BC: "hoje estabelecida como 90 dias").
- Status da devolução: `EM_PROCESSAMENTO`, `DEVOLVIDO`, `NAO_REALIZADO`.
- Texto ao pagador: até 140 caracteres.

### 2.9 Pagamento parcial e valor diferente (pelo BC)
- O campo `valor.modalidadeAlteracao` (só em cob) diz se o pagador pode mudar o valor. **Sem o campo, vale 0: valor fixo, o pagador não altera.**
- Em cobv não existe alteração de valor pelo pagador: o banco calcula o valor final.
- Conclusão: com QR dinâmico fixo, o aplicativo do pagador **não deixa pagar menos**. O pagamento diferente só chega por outro caminho (chave Pix digitada, QR estático, TED). Isso cai na regra de divergência.

---

## 3. Asaas

Fonte: docs.asaas.com (páginas com data de atualização entre julho e setembro de 2026).

### 3.1 Acesso: chave de API e ambientes
- Cada chamada leva o cabeçalho `access_token` com a chave de API. Sem chave ou chave errada: erro 401.
- Também é obrigatório o cabeçalho `User-Agent` (nome do sistema) para contas raiz criadas desde 13/06/2024.
- Ambientes (endereços confirmados):
  - **Teste (Sandbox)**: `https://api-sandbox.asaas.com/v3`
  - **Produção**: `https://api.asaas.com/v3`
- A chave de teste e a de produção são **diferentes**. Produção começa com `$aact_prod_` e teste com `$aact_hmlg_`. Chave no ambiente errado dá erro `invalid_environment`.
- A conta de teste é **outra conta**, criada em sandbox.asaas.com. Nada é copiado do teste para produção.
- A chave é criada **só pela tela web**, por usuário administrador, na área Integrações. **Aparece uma única vez**; se perder, cria outra. Máximo de **10 chaves** por conta.
- A chave pode ter nome, data de expiração, ser desligada ou excluída.
- **Inatividade**: chave sem uso por 3 meses é desligada; com 6 meses expira para sempre. Há avisos por e-mail e por webhook (`ACCESS_TOKEN_DISABLED`, `ACCESS_TOKEN_EXPIRING_SOON`, `ACCESS_TOKEN_EXPIRED`).
- Segurança extra: lista de IPs permitidos (IP fora da lista recebe 403) e confirmação de saques por webhook. Recomendado usar pelo menos um mecanismo extra.
- Guardar a chave em cofre de segredos. Nunca em código, tela pública, log ou chat.
- TLS 1.2 ou 1.3.

### 3.2 Clientes
- Antes de cobrar, cria-se o cliente (`POST /v3/customers`). Campos importantes: `name`, `cpfCnpj`, `email`, `mobilePhone`, `externalReference` (nosso código do pagador), `notificationDisabled`.
- **O Asaas aceita cliente duplicado.** O sistema deve guardar o ID do cliente (ex.: `cus_...`) e consultar antes de criar.
- `notificationDisabled`: o Asaas pode mandar e-mail, SMS ou WhatsApp ao cliente por conta própria. Para não duplicar com os avisos do IT.MK, decidir e desligar (a própria documentação recomenda definir isso antes de criar clientes).

### 3.3 Cobrança com Pix
- Criar: `POST /v3/payments` com `customer`, `billingType` = `PIX`, `value`, `dueDate` (AAAA-MM-DD), `externalReference` (nosso ID da cobrança), `description` (até 500 caracteres).
- Outros valores aceitos de `billingType`: `UNDEFINED`, `BOLETO`, `CREDIT_CARD`.
- Pegar o QR Code: `GET /v3/payments/{id}/pixQrCode`. A resposta traz `encodedImage` (imagem), `payload` (copia e cola) e `expirationDate`.
- O QR Code do Asaas é dinâmico, **pode ser pago uma única vez** e **expira 12 meses depois do vencimento** da cobrança.
- Se o valor ou o vencimento da cobrança mudar, **pegar um novo QR Code**.
- Aviso do Asaas: sem chave Pix cadastrada na conta, o QR é ligado a um banco parceiro e **vale só até 23:59 do mesmo dia**; esse comportamento será descontinuado. **Cadastrar chave Pix na conta Asaas é obrigatório na prática** (cobrar mensal com vencimento exige isso).
- Chave Pix na conta: pela API só dá para criar chave aleatória (limite 5 para pessoa física, 20 para empresa, 1 minuto entre criações). A conta precisa estar 100% aprovada e com prova de vida.
- Tipos de recebimento Pix no Asaas: cobrança com Pix, chave Pix compartilhada, QR Code estático (`POST /v3/pix/qrCodes/static`). Em chave e QR estático, o Asaas **cria cliente e cobrança automaticamente** no recebimento (campos `pixTransaction` ou `pixQrCodeId` identificam a origem).
- Remover cobrança: `DELETE /v3/payments/{id}` (evento `PAYMENT_DELETED`). A documentação diz que serve quando a cobrança "não deve mais permanecer ativa ou disponível para pagamento". Pode ser restaurada com o mesmo ID (`PAYMENT_RESTORED`). **Efeito exato sobre um Pix já enviado ao cliente: não confirmado.**
- Atualizar: `PUT` na cobrança (valor ou vencimento) gera `PAYMENT_UPDATED`.
- Parcelamento: `installmentCount` com `installmentValue` **ou** `totalValue` (nunca os dois). Com `totalValue`, a diferença de arredondamento vai para a **última parcela**. Cada parcela é uma cobrança própria, ligada pelo campo `installment`. Combina com "parcelamento = um Pix por parcela". Parcelamento por Pix: documentação diz que pode ser criado "conforme as regras de cada fluxo"; **exemplo específico com Pix não confirmado**.
- Estados da cobrança (confirmado): `PENDING`, `RECEIVED`, `CONFIRMED`, `OVERDUE`, `REFUNDED`, `RECEIVED_IN_CASH`, `REFUND_REQUESTED`, `REFUND_IN_PROGRESS`, `CHARGEBACK_REQUESTED`, `CHARGEBACK_DISPUTE`, `AWAITING_CHARGEBACK_REVERSAL`, `DUNNING_REQUESTED`, `DUNNING_RECEIVED`, `AWAITING_RISK_ANALYSIS`.

### 3.4 Juros e multa no Asaas
- Campos na criação da cobrança: `interest` (`value` = **percentual ao mês** depois do vencimento), `fine` (`value` + `type` = `FIXED` ou `PERCENTAGE`), `discount` (`value`, `dueDateLimitDays`, `type`).
- **Cuidado com a conta**: "se a conta possui configurações globais de multa e juros e elas devem ser mantidas, não envie `interest` e `fine`. O envio com valores nulos ou vazios pode sobrescrever a configuração". Ou seja: se a conta Asaas tiver juros e multa padrão, **eles entram em toda cobrança nova** que não os sobrescreva. Para "desligado por padrão", conferir a configuração da conta no painel e testar uma cobrança de teste.
- Depois do pagamento: `originalValue` (valor original) e `interestValue` (juros e multa cobrados) mostram a diferença.
- Limite máximo de juros: um resumo de busca disse "até 10%", **não confirmado** (a Central de Ajuda do Asaas não abriu: erro 403 e 404).
- **Sandbox não testa juros, multa e desconto** em boleto ou Pix (a própria tabela "o que pode ser testado" marca como não testável). Risco de homologação (seção 12).

### 3.5 Aviso de pagamento (webhook) no Asaas
Configuração (tela: Menu do usuário > Integrações > Webhooks, ou `POST /v3/webhooks`):

| Campo | Para quê |
|---|---|
| `name` | nome do aviso |
| `url` | endereço público do IT.MK (precisa responder POST) |
| `email` | e-mail para alertas de falha |
| `enabled` | liga e desliga |
| `interrupted` | estado da fila (`true` = pausada) |
| `apiVersion` | versão da API (3) |
| `authToken` | senha do aviso (veja abaixo) |
| `sendType` | `SEQUENTIALLY` (mantém a ordem) ou `NON_SEQUENTIALLY` |
| `events` | lista de eventos escolhidos |

- Até **10 webhooks** por conta. Sandbox e produção são separados.
- **Token**: o Asaas envia o `authToken` em **todo** aviso, no cabeçalho `asaas-access-token`. O IT.MK deve conferir antes de processar. Regras do token: de **32 a 255 caracteres**, sem espaço, sem sequência simples, **não pode ser uma chave de API**. O valor só aparece **na criação**.
- **Formato do aviso**: `id` (código do evento), `event`, `dateCreated`, `payment` (com `id`, `customer`, `value`, `netValue`, `billingType`, `status`, `dueDate`, `externalReference`, `installment`, `pixTransaction`, `pixQrCodeId`, `originalValue`, `interestValue`, `paymentDate` etc.).
- **Entrega "pelo menos uma vez"**: o mesmo evento pode chegar repetido, com o **mesmo `id`**. Guardar o `id` com restrição de unicidade e não processar de novo.
- **Resposta**: só **HTTP 200** conta como entregue (201, 204, 3xx, 4xx e 5xx são falha). O Asaas espera **10 segundos**. Salvar o evento, responder 200 e processar depois.
- **Falhas e fila**: tentativas com espera crescente (0, 30 s, 1 min, 3,5 min, 5 min, 15 min, 25 min, 1 h até 3 h). E-mails de alerta nas tentativas 5, 10 e 15. **Após 15 falhas seguidas a fila é pausada**: eventos novos continuam sendo guardados, mas não são enviados.
- **Retenção**: eventos ficam **14 dias**. Se a fila ficar pausada mais de 14 dias, os mais antigos são **apagados para sempre**.
- **Reativar fila**: na tela (Integrações > Webhooks) ou `PUT /v3/webhooks/{id}` com `{"interrupted": false}`. Antes, corrigir a causa. Se ainda estiver só em espera (penalizada): botão "Remover penalização" ou `POST /v3/webhooks/{id}/removeBackoff` (limite de uso mais rígido; não automatizar).
- **IPs de origem em produção**: 52.67.12.206, 18.230.8.159, 54.94.136.112 e 54.94.183.101. Teste (sandbox) pode usar outros IPs.
- O Asaas pode **acrescentar campos novos** no aviso. O código não pode falhar com campo desconhecido.
- Logs de avisos na tela (Integrações > Logs de Webhooks): mostram o conteúdo enviado, o horário, o código HTTP e o número de tentativas. Guardados até 14 dias.

Eventos de cobrança úteis para o IT.MK (nomes confirmados):
| Evento | Quando | Uso no IT.MK |
|---|---|---|
| `PAYMENT_CREATED` | cobrança criada | conferência |
| `PAYMENT_UPDATED` | valor ou vencimento mudou | atualizar e gerar novo QR |
| `PAYMENT_RECEIVED` | recebida, valor disponível | **baixa automática** |
| `PAYMENT_CONFIRMED` | pago, saldo ainda não liberado | tratar (veja nota) |
| `PAYMENT_OVERDUE` | cobrança venceu | marcar atraso |
| `PAYMENT_DELETED` e `PAYMENT_RESTORED` | removida e restaurada | refletir no sistema |
| `PAYMENT_REFUNDED`, `PAYMENT_PARTIALLY_REFUNDED`, `PAYMENT_REFUND_IN_PROGRESS` | estorno | refletir devolução |

- Fluxo do Pix no Asaas (confirmado): `PAYMENT_CREATED` → (se vencida, `PAYMENT_OVERDUE`) → `PAYMENT_RECEIVED`. Ou seja, **um Pix pago depois do vencimento ainda gera `PAYMENT_RECEIVED`**.
- Nota sobre `CONFIRMED`: em contas de pessoa física, o Pix pode ficar `CONFIRMED` por até 72 horas em bloqueio cautelar e depois ir para `RECEIVED` ou `REFUNDED`. Para conta de empresa (PJ) isso não foi dito; **não confirmado**.
- Com `SEQUENTIALLY`, a ordem dos eventos é mantida (ex.: perceber que o pagamento foi depois do vencimento). Se um evento falha, os seguintes esperam. Recomendado quando a ordem importa.

### 3.6 Como testar a conexão e o aviso (Asaas)
1. Criar conta sandbox (conta separada) e gerar a chave de teste.
2. Cadastrar chave Pix na conta de teste (sem ela dá erro 404 ao pagar QR e o QR vale só no dia).
3. Cadastrar o webhook de teste (URL pública; para teste local usar túnel tipo ngrok ou Cloudflare Tunnel).
4. Criar cobrança Pix de teste e **confirmar o pagamento pela chamada de teste**: `POST /v3/sandbox/payment/{id}/confirm` (só sandbox).
5. Forçar vencimento para testar atraso: `POST /v3/sandbox/payment/{id}/overdue` (só sandbox).
6. Ver o aviso chegando e o registro em Logs de Webhooks.
7. Teste com pagador real: usar **duas contas sandbox** (uma recebe, outra paga com `POST /v3/pix/qrCodes/pay`).
- "Testar conexão" na tela de Configurações do IT.MK: chamada simples autenticada (ex.: listar clientes com limite 1; **endpoint exato de teste não confirmado**) e checar se o último aviso recebido é recente. O Asaas não tem botão "enviar aviso de teste" na documentação lida (**não confirmado**).

### 3.7 Limites e erros (Asaas)
- Limites (confirmado): **25.000 chamadas por conta a cada 12 horas**; até **50 chamadas GET ao mesmo tempo**; limites próprios em alguns endpoints (cabeçalhos `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`). Passou: **HTTP 429**. Não repetir na hora; esperar.
- Não usar GET repetido para "ver se pagou". Usar o aviso (webhook) e GET só para conferir.
- Erros de autenticação: 401 com `code` = `invalid_environment`, `access_token_not_found`, `invalid_access_token_format`, `invalid_access_token`. Erros de dados: 400 com lista `errors` (cada um com `code` e `description`, ex.: `invalid_customer`).
- **Idempotência na criação**: não achei cabeçalho de idempotência para criar cobrança. A orientação oficial é: usar `externalReference`, guardar os IDs e **consultar de novo antes de repetir a criação** quando houver timeout. **Cabeçalho de idempotência: não confirmado.**

### 3.8 Taxas do Asaas
- Página pública de preços lida em 01/10/2026: Pix **R$ 1,99** por recebimento, com um valor promocional **R$ 0,99** "válido por 3 meses". Texto da página: "As taxas apresentadas são padrão. Para conferir as condições aplicadas ao seu contrato, consulte-as diretamente na sua conta". **Taxa do contrato do IT.MK: não confirmado** (pedir ao Asaas).
- Notificação por WhatsApp pelo Asaas: R$ 0,55 por notificação (mesma página). Só importa se o Asaas for mandar os avisos ao pagador.
- Taxa não é devolvida em estorno: estornar um Pix logo após o recebimento pode dar erro por saldo insuficiente (confirmado na documentação de estorno).

### 3.9 Estorno e devolução no Asaas
- `POST /v3/payments/{id}/refund`, com `value` (parcial) e `description`. Sem valor, estorna tudo.
- Cobrança Pix recebida aceita estorno total ou **vários estornos parciais**, somando no máximo o valor da cobrança.
- Eventos: `PAYMENT_REFUNDED`, `PAYMENT_PARTIALLY_REFUNDED`, `PAYMENT_REFUND_IN_PROGRESS`.
- Janela de 90 dias do BC: o Asaas não repete o prazo nas páginas lidas (**não confirmado**).

### 3.10 Split
- O Asaas tem divisão de valor entre contas (campo `split` na cobrança; eventos `PAYMENT_SPLIT_*`). **O IT.MK não usa.** Não ligar. Só registrar que existe.

---

## 4. Banco Inter

Fonte: developers.inter.co. O portal é montado por JavaScript; li o conteúdo das páginas pelos arquivos do próprio portal (mesmo texto) e as especificações das APIs (arquivos YAML publicados pelo Inter).

### 4.1 Quem pode usar e como criar a integração
- Acesso às APIs **só para conta PJ** (Inter Empresas).
- Passo a passo (confirmado): Internet Banking PJ > menu **Integrar** > **Nova integração** > nome e descrição > escolher **permissões (escopos)** > continuar > formulário (seus clientes, sua empresa, seu negócio) > análise.
- Status da integração: **"Em validação"** (análise do banco; durante a análise não dá para criar outra), depois **"Novo"**, depois **"Ativo"**. Ao final há e-mail.
- Em "Minhas Integrações" > Ações > **"Download chave e certificado"**: gera e mostra **Client ID e Client Secret** (aparecem uma vez; salvar). Leva alguns minutos até "Ativo".
- Recados importantes do changelog do Inter:
  - **24/12/2025**: API Pix e API Banking (menos saldo e extrato) **desabilitadas para novas integrações**, "sem data de retorno".
  - **12/03/2026**: API Pix e API Banking **reabilitadas** para novas integrações, com análise.
  - **10/04/2026**: novo processo de análise (critérios internos e regulatórios) antes de liberar os certificados.
- Se o Client ID e o Secret vazarem, o Inter pode cancelar a integração (e aí precisa criar outra).

### 4.2 Autenticação: OAuth2 + certificado (mTLS)
- Duas camadas:
  1. **mTLS**: cada chamada usa o **certificado (.crt) e a chave privada (.key)** da integração.
  2. **OAuth2**: com Client ID e Client Secret pede-se um **token** (`grant_type=client_credentials`) e o token vai nas chamadas.
- Pedir o token: `POST https://cdpj.partners.bancointer.com.br/oauth/v2/token` (produção) e `https://cdpj-sandbox.partners.uatinter.co/oauth/v2/token` (teste). Campos: `client_id`, `client_secret`, `grant_type`, `scope` (formato de formulário `application/x-www-form-urlencoded`). Vários escopos separados por espaço.
- Resposta: `access_token`, `token_type`, `expires_in`, `scope`. O token vale **1 hora** e deve ser **reaproveitado**. Limite de pedir token: **5 por minuto** (produção e teste).
- **Certificado vale 1 ano** (teste: **30 dias**). Renovação disponível a partir de **90 dias antes** de vencer, em Minhas integrações > Renovar. Na renovação vêm novos `.crt` e `.key`; **Client ID, Client Secret e escopos continuam iguais**. Integração vencida fica "Expirado" e pode parar. Prazo para renovar depois de expirar: até **90 dias** (changelog de 24/12/2025). Integração cancelada não volta.
- Escopos da API Pix de cobrança (confirmado): `cob.write`, `cob.read`, `cobv.write`, `cobv.read`, `lotecobv.write`, `lotecobv.read`, `pix.write`, `pix.read`, `payloadlocation.write`, `payloadlocation.read`, `webhook.write`, `webhook.read`. Boleto com Pix: `boleto-cobranca.read`, `boleto-cobranca.write`.
- Se a integração tem mais de uma conta, enviar o cabeçalho `x-conta-corrente` (só números, com dígito, sem zeros à esquerda).

### 4.3 Endereços da API Pix
- Produção: `https://cdpj.partners.bancointer.com.br/pix/v2`
- Teste: `https://cdpj-sandbox.partners.uatinter.co/pix/v2`
- Chamadas confirmadas: criar cobrança com vencimento `PUT /cobv/{txid}`; revisar `PATCH /cobv/{txid}`; consultar `GET /cobv/{txid}` e `GET /cobv`; lote `PUT /lotecobv/{id}`; consultar Pix `GET /pix/{e2eId}` e `GET /pix`; devolução `PUT /pix/{e2eId}/devolucao/{id}`; webhook `PUT|GET|DELETE /webhook/{chave}`; consultar avisos `GET /webhook/callbacks`; reenviar `POST /webhook/callbacks/retry`.
- Limites por minuto confirmados nas especificações: cobv (criar, consultar) **120 por minuto em produção e 10 em teste**; webhook (criar, ver, excluir, consultar callbacks) **10 por minuto**; reenviar callbacks **5 por minuto** em produção; token **5 por minuto**. (A tabela completa por chamada está nas especificações; conferir antes de usar volume.)

### 4.4 Cobrança com vencimento (Pix cobv) no Inter
- O Inter segue o desenho do BC: `calendario.dataDeVencimento`, `calendario.validadeAposVencimento`, `devedor` (nome e CPF ou CNPJ), `valor.original`, `valor.multa`, `valor.juros`, `valor.abatimento`, `valor.desconto`, `chave`, `solicitacaoPagador`, `infoAdicionais`. Modalidades iguais às da seção 2.4.
- O texto do Inter diz que a cobv aceita "juros, multas, outros acréscimos, descontos e abatimentos, semelhante ao boleto".
- **Juros e multa ausentes = não cobra.** Atende "desligado por padrão" sem configuração extra.
- Valores no formato texto com duas casas (`"123.45"`), percentual também (`"2.00"`).
- O IT.MK escolhe o **txid** (26 a 35 letras e números) e **guarda antes de chamar**. Repetir a chamada com o mesmo txid evita duplicar; **comportamento exato do Inter ao repetir o mesmo `PUT` não verificado**.
- Lote (`/lotecobv`): permite criar várias cobv de uma vez (pode servir para "um Pix por parcela"). Não aprofundado; **não confirmado** o limite de itens por lote.
- O QR Code (copia e cola) vem na resposta da criação (campo de "pixCopiaECola" no padrão do BC); **nome exato do campo na resposta do Inter: não confirmado** (conferir no teste).
- Cobrança também pode ser **boleto com Pix** (API Cobranças V3, `POST /cobrancas`). Campos: `seuNumero` (até 15), `valorNominal` (mínimo 2,50), `dataVencimento`, `numDiasAgenda`, `pagador`, `multa` (`PERCENTUAL` ou `VALORFIXO`), `mora` (`TAXAMENSAL` ou `VALORDIA`), `desconto`, `formasRecebimento` (boleto, Pix ou ambos). A V2 (boletos) foi **descontinuada em 18/05/2026**. Não é o caminho decidido (Pix puro), mas existe como alternativa ("cobrança híbrida").

### 4.5 Aviso de pagamento (webhook) no Inter
Como cadastrar:
1. No Internet Banking: Soluções para sua empresa > Minhas integrações > **"Certificado Webhook"**: baixar o arquivo compactado com a chave pública do Inter (`ca.crt`).
2. Subir um servidor **HTTPS** que receba POST e **confira o certificado do Inter** com o `ca.crt` (mTLS: o Inter se apresenta com certificado e o servidor confere).
3. Cadastrar a URL com `PUT /webhook/{chave}` (corpo: `webhookUrl`; **tem de começar com `https://`**). Precisa de token OAuth com escopo `webhook.write`.
4. Liberar no firewall a lista de IPs do Inter (há uma lista longa de blocos, publicada na página "Como configurar webhooks"; conferir a lista atual na hora de configurar).

Características (confirmado):
- O aviso é por **chave Pix**. Vale para Pix de cobrança cob e cobv (recebimento do valor cobrado).
- **Não há token em cabeçalho** na documentação. A autenticidade vem do **certificado (mTLS)** e da lista de IPs.
- **Tentativas**: se o servidor devolver erro, até **4 tentativas** com intervalos de **20, 30, 60 e 120 minutos**.
- **Consultar avisos enviados e erros**: `GET /webhook/callbacks`.
- **Reenviar**: `POST /webhook/callbacks/retry` com `txId` (lista de até **50**) e `chavePix`; limite de **5 por minuto**.
- **Conteúdo do aviso**: lista `pix` com `endToEndId`, `txid`, `valor`, `horario`, `componentesValor`, `chave`, `infoPagador`, `devolucoes` e, no Inter, também `pagador` com `nome` e `cpfCnpj` (**CPF de pessoa física vem mascarado**, ex.: `***853226**`).
- O aviso também sai quando acontece **devolução**.
- Código de resposta esperado: o Inter mostra "sucesso com código 200" no validador; **se outros 2xx contam como sucesso: não confirmado** (usar 200).
- **Validar URL antes de cadastrar**: no portal, na tela do cadastro de webhook, botão **"Validar webhook"**: o portal envia uma mensagem de exemplo para a URL (precisa ser `https://`) e mostra o código devolvido e a resposta.
- Limite por minuto do cadastro e consulta de webhook: 10.

### 4.6 Sandbox (teste) do Inter
- Disponível **das 8h às 20h, de segunda a sexta** (confirmado).
- Cria-se integração de teste na própria tela do sandbox (sem escolher escopos; já vêm todos). Certificado do sandbox vale **30 dias**. Credenciais ficam "Ativas" em alguns minutos.
- Usar as URLs marcadas "SANDBOX".
- Chamadas feitas só para teste: **pagar Pix de cobrança imediata** (`POST /cob/pagar/{txid}`), **pagar Pix de cobrança com vencimento** (`POST /cobv/pagar/{txid}`), e pagar cobrança com código de barras ou QR Code. Escopo `pix.write`; 10 por minuto.
- Limites no teste são menores (10 por minuto na maioria).
- Se o sandbox testa juros, multa e o prazo depois do vencimento: **não confirmado**.
- Webhook no teste: a página lida não diz se o Inter envia aviso real ao pagar pelas chamadas de teste. **Não confirmado**; testar.

### 4.7 Taxas do Inter
- Em página oficial: a página de gestão de cobrança fala em "zero taxa na liquidação de boletos" e conta "100% gratuita", sem tabela de tarifas de Pix cobrança. A página de tarifas não abriu (404).
- Um resumo de buscas (fonte não oficial, **não confirmado**) citou tarifa da API Pix desde 01/03/2024. **Não usar valor nenhum**. Pedir tabela escrita ao Inter.

---

## 5. Tabela comparativa Asaas x Inter

| Tema | Asaas | Banco Inter |
|---|---|---|
| Modelo | Plataforma de cobrança: você cria cliente e cobrança; ele gera o Pix | Banco: você cria a cobrança Pix (cobv) direto na API Pix do BC |
| Como entra o Pix | Dinheiro cai na conta Asaas | Dinheiro cai na conta PJ do Inter |
| Credencial | **Chave de API** (um texto) | **Client ID + Client Secret + certificado (.crt) + chave privada (.key)** |
| Segurança da chamada | Cabeçalho `access_token` | mTLS + OAuth2 (token de 1 hora) |
| Ambientes | Sandbox e Produção (endereços e chaves diferentes) | Sandbox e Produção (endereços e credenciais diferentes) |
| Disponibilidade do teste | Sempre (não achei janela) | **8h às 20h, segunda a sexta** |
| Validade da credencial | Chave sem uso: desliga em 3 meses, expira em 6 | **Certificado: 1 ano** (teste 30 dias); renovar a partir de 90 dias antes |
| Como obter | Tela web, administrador, instantâneo | Internet Banking PJ + formulário + **análise do banco** ("Em validação") |
| Risco de prazo para obter | Baixo (conta precisa estar aprovada, prova de vida) | **Maior**: análise; API Pix já foi fechada a novas integrações (24/12/2025 a 12/03/2026) |
| Vencimento | `dueDate` (data) | `calendario.dataDeVencimento` |
| Prazo depois do vencimento | Sem campo para Pix (QR expira **12 meses** depois do vencimento); precisa o sistema remover a cobrança | **Campo oficial** `validadeAposVencimento` (dias corridos) |
| Juros e multa | `interest` (% ao mês), `fine`; **a conta pode ter padrão global** | `valor.juros` e `valor.multa` com modalidades do BC; ausente = não cobra |
| Parcelamento por Pix | `installmentCount` + `installmentValue` ou `totalValue`; uma cobrança por parcela | Uma cobv por parcela (txid próprio); existe lote |
| Identificador nosso | `externalReference` + ID da cobrança (`pay_...`) | **txid** escolhido por nós (26 a 35) |
| Identificador do Pix pago | `pixTransaction` (se é o e2eid: não confirmado) | `endToEndId` (e2eid) no aviso |
| Idempotência da criação | Sem cabeçalho achado; consultar antes de repetir | txid fixo evita duplicar (repetição exata: não confirmado) |
| Como validar o aviso | Token no cabeçalho `asaas-access-token` + lista de IPs | **Certificado (mTLS)** com `ca.crt` do Inter + lista de IPs; sem token |
| Resposta esperada | Só HTTP 200, em até 10 s | 200 (outros 2xx: não confirmado) |
| Tentativas do aviso | Até 15, com espera crescente; depois **fila pausada** | **4 tentativas** (20, 30, 60, 120 min) |
| Guarda de eventos | **14 dias** (depois apagados) | não confirmado |
| Reenvio manual | Reativar fila (tela ou API) | `POST /webhook/callbacks/retry` (até 50 txid) + consulta `GET /webhook/callbacks` |
| Duplicados | Mesmo `id` do evento; guardar e ignorar | Mesmo `endToEndId`; guardar e ignorar |
| Quem pagou no aviso | Não confirmado | `pagador.nome` e `pagador.cpfCnpj` (PF mascarado) |
| Devolução | `POST /v3/payments/{id}/refund`, parcial e várias vezes | `PUT /pix/{e2eId}/devolucao/{id}`; 90 dias (BC) |
| Limite de chamadas | 25.000 por 12 h; 50 GET simultâneos; 429 | 120/min cobv em produção, 10/min teste; token 5/min; webhook 10/min |
| Taxas | Página pública: Pix R$ 1,99 (promo R$ 0,99 por 3 meses); contrato manda | Não confirmado (sem tabela oficial lida) |
| Certificado e senha | Não usa | `.crt` + `.key`; **senha não mencionada** na documentação |
| Boleto e híbrida | Boleto, cartão, link | Boleto com Pix (Cobranças V3) |
| Split | Existe (não usado) | Não vi |
| Funcionalidade extra | Notificações próprias ao pagador | Nenhuma relevante ao caso |

**Diferenças reais que mudam o desenho:**
1. Prazo depois do vencimento: nativo no Inter; manual no Asaas.
2. Credencial: um texto no Asaas; arquivos e senhas no Inter (e renovação anual).
3. Validação do aviso: token (Asaas) contra certificado (Inter). A hospedagem do sistema precisa aceitar certificado de cliente para o Inter (**não verificado** se a hospedagem escolhida suporta).
4. Fila: o Asaas **pausa** e guarda 14 dias; o Inter tenta 4 vezes e depois só reenvio manual ou consulta.
5. Quem pagou: o Inter traz no aviso; no Asaas não está confirmado.
6. Entrada: Asaas é rápido de abrir; Inter exige análise do banco.

---

## 6. Campos de conexão da tela Configurações

Hoje o protótipo (`configuracoes.js`) tem: Provedor (Asaas ou Banco Inter), Ambiente (Teste ou Produção), Chave de acesso (escondida, com data e quem cadastrou), Certificado (só Inter, arquivo `.pfx`, `.p12` ou `.pem`), Senha do certificado (só Inter), Chave Pix recebedora, Validade do link após o vencimento (dias), Juros e multa (ligar, multa %, juros % ao mês), Modo do Pix (por pagador ou por loja), Situação do aviso automático e Último Pix recebido.

### 6.1 Campos por provedor
| Campo da tela | Asaas | Inter | Situação no protótipo |
|---|---|---|---|
| Provedor | sim | sim | existe |
| Ambiente (teste e produção) | sim; troca endereço e chave | sim; troca endereço e certificado | existe |
| Chave de acesso | **chave de API** | **Client ID** e **Client Secret** (são dois valores) | protótipo tem só um campo de "chave de acesso": **falta o segundo valor no Inter** |
| Certificado | não usa | **certificado `.crt` e chave privada `.key`** (dois arquivos) | protótipo aceita `.pfx`, `.p12`, `.pem`: **ajustar para `.crt` e `.key`** |
| Senha do certificado | não usa | **não confirmado** que exista senha nos arquivos entregues pelo Inter | pode ficar opcional; só serve se o time juntar tudo num `.pfx` |
| Validade do certificado | não usa | **mostrar data de vencimento** (1 ano) e aviso 90 dias antes | **falta** |
| Chave Pix recebedora | **chave Pix da conta Asaas** (cadastrar na conta) | **chave Pix da conta Inter** (o aviso é ligado a ela) | existe |
| Token do aviso | **gerar pelo sistema** (32 a 255 caracteres) e guardar | não se aplica (certificado) | **falta** (pode ser interno, sem campo na tela) |
| Certificado do webhook (`ca.crt`) | não usa | **arquivo `ca.crt` do Inter** para conferir o aviso | **falta** (pode ser interno) |
| Endereço do aviso (URL) | mostrar a URL que o IT.MK entrega ao provedor | idem, com `https` | **falta mostrar** |
| Conta (`x-conta-corrente`) | não usa | só se a integração tiver mais de uma conta | opcional |
| Situação do aviso e último Pix | sim | sim | existe |

### 6.2 Regras para a tela (sem mexer no visual agora)
- A chave e o certificado nunca aparecem depois de salvos (o protótipo já mostra "valor não exibido": manter).
- Trocar de **Teste para Produção** exige nova chave (Asaas) ou novas credenciais (Inter). A tela deve **limpar** o que for do outro ambiente e avisar.
- Guardar **separado por provedor e por ambiente** (4 combinações). O protótipo guarda por provedor; falta por ambiente.
- Para o Inter, o botão de teste deve falhar com mensagem clara em três casos: certificado vencido, Client ID ou Secret errados, escopo faltando.
- Mensagens da tela em linguagem simples ("A chave não é desse ambiente. Use a chave de teste no ambiente de teste.").
- Visão única: nenhum campo some por perfil.

### 6.3 Perguntas rápidas sobre o protótipo
- O campo "Validade do link após o vencimento" (30 dias no protótipo) vira o `validadeAposVencimento` no Inter e uma **regra do sistema** no Asaas (seção 8).
- O texto "Juros e multa: desligado por padrão" é cumprido nativamente no Inter; no Asaas depende da configuração da conta (seção 3.4).

---

## 7. Como testar a conexão e validar o aviso (resumo)

### 7.1 Botão "Testar conexão" (proposta de critério)
| Passo | Asaas | Inter |
|---|---|---|
| 1. Credencial aceita | uma chamada simples autenticada responde sem 401 | pedir token (`/oauth/v2/token`) com Client ID, Secret, certificado e chave e escopos; devolve `access_token` |
| 2. Ambiente certo | endereço e chave combinam (`$aact_hmlg_` no teste) | endereço de teste ou produção combina com a integração |
| 3. Chave Pix | a conta tem chave Pix cadastrada | a chave informada pertence à conta (o aviso é cadastrado nela) |
| 4. Aviso cadastrado | existe webhook ativo, não pausado (`interrupted` falso), com os eventos escolhidos | `GET /webhook/{chave}` devolve a URL do IT.MK |
| 5. Aviso chegando | último aviso recente | consultar `GET /webhook/callbacks` sem erros |
| 6. Validade | chave não expirada nem desligada | **certificado com mais de 30 dias para vencer** |

### 7.2 Validar o aviso recebido (regras para o Backend)
| Verificação | Asaas | Inter |
|---|---|---|
| Quem enviou | cabeçalho `asaas-access-token` igual ao token guardado; (opcional) IP na lista | certificado de cliente válido na conexão (mTLS) com `ca.crt`; (opcional) IP na lista |
| Repetido? | `id` do evento já existe: responder 200 e ignorar | `endToEndId` já existe: responder 200 e ignorar |
| Encontrar a cobrança | `payment.externalReference` (nosso ID) ou `payment.id` | `txid` (nosso, escolhido por nós) |
| Conferir valor | `payment.value` contra o esperado; `originalValue` e `interestValue` se houver | `valor` do aviso contra o esperado; `componentesValor` explica juros, multa, desconto |
| Conferir quem pagou | **não confirmado** no aviso | `pagador.cpfCnpj` e `pagador.nome` contra o pagador da cobrança |
| Conferir prazo | data do pagamento (`paymentDate`) contra vencimento + prazo do IT.MK | `horario` contra vencimento + `validadeAposVencimento` |
| Responder | HTTP 200 em até 10 s, depois processar | HTTP 200 (usar sempre 200) |
| Se não confiar | não dar baixa; mandar para Divergências | idem |

Regra de ouro: **o aviso só avisa; antes de dar baixa, confirmar na API** (consultar a cobrança) quando houver dúvida. Evita baixa por aviso falso.

---

## 8. O que acontece depois do vencimento

| Situação | Banco Central e Inter | Asaas |
|---|---|---|
| No dia do vencimento | Pago em qualquer horário do dia | Pago normalmente |
| Depois do vencimento, dentro do prazo | Pode pagar até vencimento + `validadeAposVencimento` (dia útil ajustado). Se tiver juros e multa, o banco calcula na hora. Sem juros e multa: valor original | O QR continua pagável (até 12 meses). Evento `PAYMENT_OVERDUE`; depois `PAYMENT_RECEIVED` se pagar. Sem juros e multa configurados: valor original |
| Depois do prazo | Cobrança **não é mais válida**: não aceita pagamento | Pelo Asaas **continua pagável até 12 meses**. O IT.MK precisa **remover a cobrança** ao fim do prazo (ou aceitar e tratar como divergência "fora do prazo") |
| Quem controla o prazo | O banco (campo oficial) | O IT.MK (regra do sistema) |

Regras do IT.MK sobre isso:
- O prazo "link vale N dias após o vencimento" (hoje 30, configurável) vale igual nas duas opções **do ponto de vista do cliente**. A implementação é diferente.
- No Inter: enviar `validadeAposVencimento` = N. Vencimento em dia não útil move a data (explicar na mensagem ao cliente).
- No Asaas: rotina diária que remove (`DELETE`) as cobranças que passaram do prazo e ainda estão em aberto; registrar no histórico. **Testar** o efeito no QR Code já enviado.
- Qualquer Pix que chegue **depois do prazo** (por atraso do aviso, por QR estático, por TED) vai para Divergências com o motivo "Pix fora do prazo ou expirado".
- Juros e multa **desligados por padrão**: não enviar campos de juros e multa. Quando ligados na tela, enviar os dois (multa uma vez e juros ao mês). No Inter, converter para as modalidades do BC (multa percentual = 2; juros % ao mês em dias corridos = 3). No Asaas, `fine` do tipo `PERCENTAGE` e `interest` percentual ao mês.
- Mensagem ao cliente (WhatsApp) deve mostrar o valor certo para a data. Se houver juros e multa, o valor final do Pix **muda por dia**. Por isso, nesse caso, **não prometer valor fixo no texto**; deixar o banco calcular.

---

## 9. Pagamento parcial, duplicado, valor diferente, quem pagou, fora do prazo

Princípio: **nada resolve sozinho** (decisão fechada). O sistema só dá baixa automática quando **tudo bate**; senão cria um item em Divergências para uma pessoa.

| Caso | O que pode acontecer (fonte) | O que o sistema faz |
|---|---|---|
| **Parcial** | Pix dinâmico de valor fixo **não aceita** valor menor no aplicativo (BC). Valor menor só chega por chave digitada, QR estático ou TED | Não dar baixa. Item em Divergências, motivo "Valor diferente". A pessoa escolhe: aceitar, devolver, ligar a outra cobrança ou guardar como crédito |
| **Duplicado (mesma cobrança paga duas vezes)** | No Pix dinâmico a cobrança concluída não aceita novo pagamento (BC: `CONCLUIDA`; Asaas: "pode ser pago uma única vez"). Um segundo valor pode chegar por chave ou QR estático, e no Asaas vira **cobrança nova automática** | Segundo Pix ou mesmo `e2eid` repetido: ignorar o repetido (não é novo pagamento). Segundo Pix com outro `e2eid`: Divergências, motivo "Pagamento duplicado"; sugerir devolução |
| **Valor diferente (maior)** | Pagamento com juros e multa gera valor maior legítimo (`componentesValor` no Inter; `interestValue` no Asaas) | Se a diferença é explicada por juros e multa **ligados**: baixa automática. Se não: Divergências "Valor diferente" |
| **Quem pagou é diferente** | Inter: `pagador` no aviso (CPF de pessoa física mascarado). Asaas: não confirmado no aviso. BC: só `infoPagador` (texto livre) | Comparar com o pagador. Se não bate ou não dá para comparar: Divergências "Quem pagou é diferente". Para pessoa física mascarada, comparar só a parte visível e marcar para conferência |
| **Fora do prazo ou expirado** | Pelo Inter, cobrança fora do prazo nem aceita pagamento. No Asaas o QR continua até 12 meses | Dentro do sistema, comparar a data do Pix com vencimento + prazo. Fora: Divergências "Pix fora do prazo ou expirado" |
| **Pix sem cobrança ligada** | Pix recebido por chave ou QR estático: no Asaas cria cobrança automática; no Inter/BC sem txid não gera aviso | Aparecer em "Sem cobrança ligada" (tela já existe). Conferência por extrato (fora do aviso) |
| **Devolução** | BC: até 90 dias; parcial permitida | Botão "Devolver" chama a API do provedor. Registrar motivo e quem fez. Esperar o aviso `DEVOLVIDO` (Inter) ou `PAYMENT_REFUNDED` (Asaas) para fechar |

As 4 motivos da tela de Recebimentos (`MOTIVOS`: valor, terceiro, prazo, dup) já cobrem os casos acima.

---

## 10. Regras acionáveis (para virar história e critério)

**Cobrança**
- RA-01. Usar sempre Pix **dinâmico com vencimento** (cobv no Inter; cobrança `PIX` no Asaas). Não usar QR estático na cobrança mensal.
- RA-02. Um Pix por pagador por padrão. Com "por loja", um Pix por loja. O valor do Pix é o **total da cobrança** (ou da loja), nunca editável pelo pagador.
- RA-03. Parcelamento: **um Pix por parcela**, cada um com vencimento e identificador próprios. Soma das parcelas = total; diferença de centavos vai para a **última parcela**.
- RA-04. Guardar, para cada Pix: ID da cobrança no IT.MK, ID no provedor (`pay_...` no Asaas; txid no Inter), texto copia e cola, link, vencimento, prazo final, valor, situação.
- RA-05. Cada cobrança tem **identificador único nosso**: no Inter o **txid de 26 a 35 letras e números**, gerado pelo IT.MK e **guardado antes** de chamar o banco; no Asaas o `externalReference`.
- RA-06. Nunca reusar txid, mesmo de cobrança cancelada (BC).
- RA-07. Se o valor ou o vencimento mudar depois de enviado: gerar **novo** Pix (novo QR no Asaas; revisão `PATCH` ou nova cobrança no Inter), avisar o pagador e anular o anterior.

**Prazo, juros e multa**
- RA-08. Prazo após o vencimento vem da tela de Configurações (hoje 30 dias). Inter: `validadeAposVencimento`. Asaas: rotina que remove a cobrança ao fim do prazo.
- RA-09. Juros e multa **desligados por padrão** e só ligam pela tela. Quando desligados, **nenhum** campo de juros ou multa é enviado e a conta do provedor não pode ter padrão ligado.
- RA-10. Valores em dinheiro com **2 casas** e arredondamento definido (centavo para baixo nos cálculos do banco; o BC manda truncar em 2 casas).

**Aviso de pagamento**
- RA-11. Endereço do aviso exclusivo por provedor e por ambiente.
- RA-12. Asaas: conferir `asaas-access-token`. Inter: conferir certificado (mTLS) e lista de IPs.
- RA-13. **Guardar o aviso inteiro antes de processar**; responder 200 rápido (Asaas: 10 s); processar depois.
- RA-14. **Idempotência**: Asaas pelo `id` do evento; Inter pelo `endToEndId`. Repetido = 200 e ignorar.
- RA-15. Tolerar campos novos no aviso e **lista com vários Pix** no mesmo aviso (Inter e BC).
- RA-16. Antes da baixa, confirmar o pagamento **consultando o provedor** quando faltar dado ou houver divergência de valor.
- RA-17. **Rotina de conferência periódica** (consulta ao provedor) para pegar avisos perdidos: Asaas guarda 14 dias; Inter tem consulta e reenvio. Respeitar limites de chamadas.
- RA-18. Alertas ao time (não ao pagador): aviso sem chegar há mais de X horas (valor a definir), fila pausada (Asaas), erros em `GET /webhook/callbacks` (Inter), certificado a menos de 30 dias de vencer, chave sem uso há 2 meses (Asaas).

**Baixa e divergência**
- RA-19. Baixa automática **só** se: cobrança encontrada, valor igual (ou diferença explicada por juros e multa ligados), dentro do prazo, pagador igual, Pix novo (e2eid inédito).
- RA-20. Qualquer outro caso vai para Divergências, com motivo (valor, quem pagou, prazo, duplicado), valor esperado e recebido, quem pagou, hora e identificador.
- RA-21. Resolver divergência exige escolha registrada (aceitar, devolver, ligar a outra cobrança, crédito), com nome de quem decidiu e hora. Já existe no protótipo.
- RA-22. Devolução: sempre pela API do provedor, com motivo, dentro de 90 dias do Pix, parcial ou total.
- RA-23. Desfazer baixa nunca apaga o pagamento; ele volta para "Sem cobrança ligada" (já no protótipo).

**Segurança e operação**
- RA-24. Chave de API, Client Secret, chave privada e token do aviso ficam **cifrados**, fora do código e fora de logs. A tela não mostra depois de salvar.
- RA-25. Troca de ambiente exige credenciais do ambiente novo.
- RA-26. Registrar quem mudou cada campo de Configurações e quando (já existe `reg(...)` no protótipo).
- RA-27. CNPJ e CPF aceitam **letras e números** (CNPJ alfanumérico) em todos os campos e telas.
- RA-28. Respeitar limites do provedor com fila de envio e espera (nunca repetir na hora após 429).

---

## 11. Checklist de critérios de aceite

Formato "caixas" para cada item (modelo da seção 10 de `docs/base-po.md`). IDs sugeridos, o P.O. ajusta para BL-xx.

### 11.1 Integrações (provedores, aviso, testes)
- [ ] AC-I-01. Na tela de Configurações dá para escolher Asaas ou Banco Inter e Teste ou Produção. A escolha **não mostra** campos do outro provedor.
- [ ] AC-I-02. Asaas: campo "Chave de acesso" aceita a chave de API; a chave de teste (`$aact_hmlg_`) é recusada em Produção e a de produção (`$aact_prod_`) é recusada em Teste, com mensagem simples.
- [ ] AC-I-03. Inter: tela pede Client ID, Client Secret, certificado (`.crt`) e chave privada (`.key`). Mostra data de vencimento do certificado e avisa 90 dias antes.
- [ ] AC-I-04. Nenhum segredo (chave, Secret, chave privada, token do aviso) aparece na tela, no log ou no navegador depois de salvo.
- [ ] AC-I-05. Botão "Testar conexão" diz **funcionou** ou **o que falhou** (credencial, ambiente, certificado vencido, escopo faltando, chave Pix da conta) em linguagem simples.
- [ ] AC-I-06. Criar uma cobrança Pix de teste no provedor de teste devolve o copia e cola e o link, e ficam guardados.
- [ ] AC-I-07. Inter: a cobrança leva `dataDeVencimento`, `validadeAposVencimento` (= prazo da tela), devedor, valor original e a chave Pix; **sem** juros e multa quando desligados.
- [ ] AC-I-08. Asaas: a cobrança leva cliente, `billingType` PIX, valor, vencimento e `externalReference`; **sem** juros e multa quando desligados, e confirmado que a conta não tem padrão ligado.
- [ ] AC-I-09. Um Pix por pagador por padrão; com a opção "por loja", um Pix por loja. Parcelamento gera um Pix por parcela.
- [ ] AC-I-10. O aviso de pagamento é cadastrado pelo sistema no provedor (Asaas com token; Inter na chave Pix, com URL `https`), e a tela mostra "Recebendo" ou "Não está recebendo".
- [ ] AC-I-11. Aviso inválido (token errado no Asaas; sem certificado ou certificado errado no Inter) é recusado e **não** dá baixa.
- [ ] AC-I-12. Aviso repetido (mesmo `id` no Asaas; mesmo `endToEndId` no Inter) responde 200 e **não** duplica a baixa.
- [ ] AC-I-13. Asaas: se a fila pausar, o sistema avisa o time e traz passo a passo para reativar; depois de reativar, os eventos guardados são processados sem duplicar.
- [ ] AC-I-14. Inter: o sistema consulta `GET /webhook/callbacks` e reenvia por `POST /webhook/callbacks/retry` quando achar erro.
- [ ] AC-I-15. Conferência periódica pega pagamento cujo aviso se perdeu, dentro dos limites de chamadas do provedor.
- [ ] AC-I-16. Troca de ambiente limpa credenciais do outro ambiente e pede as novas.
- [ ] AC-I-17. Homologação feita com sandbox: pagamento no prazo, pagamento fora do prazo, valor diferente, duplicado e devolução, **em cada provedor**. Itens que o sandbox não cobre (juros e multa no Asaas) registrados como "testado só em produção com valor mínimo" ou "não testado", com aprovação do dono.
- [ ] AC-I-18. Alerta ao time quando o certificado do Inter faltar 30 dias ou menos, ou a chave do Asaas ficar sem uso por 2 meses.

### 11.2 Backend (regras e dados)
- [ ] AC-B-01. Tabela de cobranças Pix guarda: cobrança do IT.MK, parcela (se houver), ID no provedor, txid (Inter), texto copia e cola, link, vencimento, prazo final, valor, situação, criado em, quem.
- [ ] AC-B-02. Tabela de eventos de aviso guarda o conteúdo inteiro, hora, origem e resultado, com **restrição de unicidade** (`id` no Asaas; `endToEndId` no Inter).
- [ ] AC-B-03. Gerar txid (Inter) com 26 a 35 letras e números, único, guardado **antes** da chamada; não reaproveitar.
- [ ] AC-B-04. Cálculo de prazo final: vencimento + dias; considerar prorrogação por dia não útil quando o provedor aplicar (Inter).
- [ ] AC-B-05. Rotina diária (Asaas): remove cobranças em aberto cujo prazo acabou e registra.
- [ ] AC-B-06. Baixa automática só quando valor, prazo, pagador e identificador baterem (RA-19). Todo o resto cria Divergência com motivo.
- [ ] AC-B-07. Cada divergência traz motivo (valor, quem pagou, prazo, duplicado), esperado, recebido, quem pagou, hora, identificador e o provedor.
- [ ] AC-B-08. Valores em reais com 2 casas e arredondamento definido; testes com centavos (ex.: 1/3 em parcelas).
- [ ] AC-B-09. CPF e CNPJ aceitam letras e números; validação não rejeita CNPJ alfanumérico.
- [ ] AC-B-10. Resposta ao aviso em até 5 segundos, processamento assíncrono, falha de processamento não derruba o aviso (guarda e tenta de novo).
- [ ] AC-B-11. Chamadas ao provedor com espera e limite próprios (Asaas: 25.000 por 12 h e 50 GET simultâneos; Inter: limites por minuto da seção 4.3); nunca repetir logo após erro 429.
- [ ] AC-B-12. Token do Inter reaproveitado por até 1 hora (limite de 5 pedidos por minuto).
- [ ] AC-B-13. Devolução: chama o provedor, guarda motivo e quem fez, só fecha ao receber o aviso final; recusa devolução fora de 90 dias com mensagem.
- [ ] AC-B-14. Segredos guardados cifrados; troca de credencial registrada com nome e hora.
- [ ] AC-B-15. Testes automáticos: aviso válido, aviso repetido, aviso inválido, valor diferente, pagador diferente, fora do prazo, duplicado, fila pausada (simulada), certificado vencido (simulado).
- [ ] AC-B-16. Log de auditoria de todas as ações: criar, remover, baixar, devolver, resolver divergência.
- [ ] AC-B-17. Adaptador por provedor com **a mesma interface** (criar cobrança, obter copia e cola, remover, consultar, devolver, validar aviso), para o resto do sistema não saber qual é o provedor.

Definição de Pronto: sem bugs conhecidos, testado nos dois provedores no ambiente de teste, prévia publicada e aprovada pelo dono. Nada de entrega na sexta-feira.

---

## 12. Riscos

| # | Risco | Efeito | O que fazer |
|---|---|---|---|
| R1 | Inter: análise do banco para liberar a integração; API Pix já foi fechada a novas integrações (24/12/2025 a 12/03/2026) | Atraso do projeto; pode ser recusada | Pedir a integração **agora**, em paralelo; manter Asaas como caminho de partida |
| R2 | Asaas: sem campo para prazo após vencimento no Pix; QR vale 12 meses | Pagamento fora do prazo chega e confunde | Rotina de remoção + regra de divergência; testar efeito da remoção |
| R3 | Asaas: juros e multa padrão da conta ligados | Cobra a mais sem o IT.MK saber | Conferir configuração da conta; teste com cobrança real de valor baixo |
| R4 | Sandbox do Asaas não testa juros e multa | Falha só aparece em produção | Plano de teste em produção com valor mínimo; aprovar com o dono |
| R5 | Fila de aviso pausada (Asaas: 15 falhas; eventos apagados em 14 dias) | Pagamentos sem baixa; perda de aviso | Monitor, alerta, conferência periódica, reativação rápida |
| R6 | Inter: aviso com certificado (mTLS) pode não funcionar em qualquer hospedagem | Aviso nunca chega | Decidir a hospedagem do aviso **antes**; teste com o validador do portal |
| R7 | Certificado do Inter vence em 1 ano (teste 30 dias) | Cobrança e aviso param | Alerta aos 90 e 30 dias; procedimento de renovação escrito |
| R8 | Aviso duplicado ou fora de ordem | Baixa duas vezes | Unicidade por `id` ou `e2eid`; Asaas em modo sequencial |
| R9 | Pagamento por chave ou QR estático (sem cobrança) | Dinheiro sem ligação | Aba "Sem cobrança ligada"; conferência por extrato; orientar pagador a usar só o link |
| R10 | Quem pagou não vem no aviso do Asaas (não confirmado) | Não detecta terceiro pagando | Testar; se não vier, consultar o provedor ou aceitar essa lacuna |
| R11 | CPF de pessoa física vem mascarado no aviso do Inter | Comparação de pagador imprecisa | Comparar só a parte visível e marcar para conferência |
| R12 | Valor com juros e multa muda por dia | Texto da cobrança com valor errado | Quando ligar juros e multa, não prometer valor fixo; consultar o valor pelo banco |
| R13 | Taxas não confirmadas (Inter) e promoção do Asaas | Custo surpresa | Pedir tabela por escrito aos dois |
| R14 | Chave de API do Asaas sem uso desliga em 3 meses | Cobrança para sem aviso | Usar a conta ativamente ou alerta; chamada de teste periódica |
| R15 | Asaas e IT.MK mandam aviso ao pagador ao mesmo tempo | Pagador recebe duas mensagens | Desligar notificações do Asaas (`notificationDisabled`) |
| R16 | CNPJ alfanumérico | Rejeitar cadastro válido | Aceitar letras e números nos 14 caracteres |
| R17 | Mudanças nas especificações (BC e provedores mudam sem aviso; BC diz que alterações compatíveis "podem ocorrer a qualquer momento") | Quebra silenciosa | Tolerar campos novos; revisar este manual a cada 3 meses |
| R18 | Cota de chamadas (Asaas 25.000 por 12 h; Inter por minuto) | Bloqueio em fechamento do mês com muitas cobranças | Fila com ritmo controlado; fechar em lotes |
| R19 | Dívida técnica: dois provedores | Dobra o teste | Interface única por trás; testes iguais para os dois |

**Dívida técnica prevista:** dois adaptadores, duas formas de validar o aviso, duas rotinas de conferência. Estimativas do time devem já incluir isso.

---

## 13. Perguntas que dependem de decisão do dono

1. **Qual provedor primeiro?** O Asaas abre mais rápido; o Inter exige análise do banco. Começar por um e deixar o outro como segundo passo?
2. A conta bancária do IT.MK (hoje o protótipo mostra Itaú) é a mesma que vai receber? Com Asaas ou Inter o dinheiro cai na conta do provedor primeiro. **Precisa abrir conta Inter PJ ou conta Asaas?** Quem é o titular (empresa 40% ou VHSS)?
3. O prazo depois do vencimento fica em **30 dias**? E se no Asaas o QR continuar pagável por 12 meses, aceitamos que a **remoção pelo sistema** seja o controle?
4. **Quando ligar juros e multa**, quais valores? (o protótipo traz 2% de multa e 1% ao mês como exemplo; é decisão do dono.) Quem pode ligar?
5. Aceitar **"quem pagou diferente"** como divergência mesmo quando o pagador manda a empresa dele (CNPJ diferente do cadastro)? Existe lista de pagadores autorizados por pagador?
6. Quem é a **pessoa que recebe as divergências**? Uma só, ou fila por dia? Prazo para decidir?
7. Devolução automática de duplicados? (hoje a decisão é manual, uma pessoa.) Confirmar que **nunca** devolve sozinho.
8. **Taxas**: o dono já tem contrato ou tabela do Asaas e do Inter? (Mandar para o time conferir custo por Pix.)
9. As mensagens do Asaas ao pagador (e-mail, SMS, WhatsApp pago) ficam **desligadas**, só o WhatsApp do IT.MK avisa?
10. Onde ficará o sistema (hospedagem)? **Para o Inter, precisa aceitar certificado de cliente** no aviso. Isso muda a escolha.
11. Pagamento por chave Pix digitada (sem link) é aceito como "cobrança ligada" quando o valor e o pagador batem? Ou sempre divergência?
12. Pix por loja: vale também para parcelamento (um Pix por loja e por parcela)? Impacta quantidade de cobranças e custo.
13. Comprovante em PDF continua existindo ao lado do aviso automático (aba "A conferir" do protótipo) ou some quando o Pix automático estiver ligado?
14. Prazo máximo para pedir a integração do Inter e quem na empresa assina o formulário do banco ("seus clientes, sua empresa, seu negócio")?
15. Aceita rodar o primeiro mês em **modo paralelo** (Pix automático liga mas a conferência manual segue por um mês)?

---

## 14. O que NÃO foi confirmado (resumo)

- Como o Asaas se comporta com **Pix já enviado depois de remover a cobrança** (dentro do prazo ou depois).
- Se o aviso do Asaas traz **quem pagou** (nome e CPF/CNPJ).
- **Limite de juros** do Asaas ("até 10%" vem só de um resumo de busca; a Central de Ajuda deu 403 e 404).
- **Cabeçalho de idempotência** na criação de cobrança do Asaas (não achei).
- Se `pixTransaction` do Asaas é o **e2eid**.
- **Senha** do certificado do Inter (a documentação fala em `.crt` e `.key` e não cita senha).
- Nome do campo do copia e cola na **resposta** do Inter.
- Se o **sandbox do Inter** testa juros, multa e prazo depois do vencimento, e se manda aviso real ao pagar pelo endpoint de teste.
- Quanto tempo o Inter **guarda** avisos para reenvio. Se outros códigos 2xx valem como sucesso.
- **Taxas do Inter** (sem tabela oficial lida) e **taxa do contrato do Asaas** (a página pública mostra valores padrão e promocionais).
- Como a hospedagem escolhida lida com **certificado de cliente** (mTLS) no aviso.
- Limite de itens por **lote** de cobranças do Inter.
- Comportamento do Inter ao repetir o mesmo `PUT /cobv/{txid}`.
- Se o texto do copia e cola tem limite de 512 caracteres (resumo automático, não conferido no manual).
- Pix Automático (outro produto): **não pesquisado a fundo**; os dois provedores têm; fora do escopo decidido.
- Termos de uso, contrato e regras de risco de cada provedor (não lidos).

---

## 15. Tabela de fontes (consultadas em 01/10/2026)

Todas as datas de consulta: **01/10/2026**. "Lida" = lida inteira ou o trecho útil.

### 15.1 Banco Central
| # | Fonte | URL oficial | Versão ou data | Uso |
|---|---|---|---|---|
| 1 | API Pix (OpenAPI, GitHub do BC) | https://github.com/bacen/pix-api (arquivo https://raw.githubusercontent.com/bacen/pix-api/master/openapi.yaml) | 2.10.0 | cob, cobv, calendário, valor, juros, multa, abatimento, desconto, txid, e2eid, webhook, devolução, status, erros |
| 2 | Manual de Padrões para Iniciação do Pix (inclui Anexos I, II e III) | https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf | 2.10.0 (19/08/2026) | QR estático e dinâmico, copia e cola, cobv, cálculo de juros e multa, txid, webhook, mTLS |
| 3 | Manual do BR Code | https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf | 2.0.1 (31/08/2020) | estrutura do BR Code (campos, GUI) |
| 4 | Página do Pix no BC | https://www.bcb.gov.br/estabilidadefinanceira/pix | página-índice | só para localizar documentos |

### 15.2 Asaas (docs.asaas.com)
| # | Fonte | URL oficial | Atualização da página |
|---|---|---|---|
| 5 | Autenticação | https://docs.asaas.com/docs/autenticação-1 | 31/07/2026 |
| 6 | Chaves de API | https://docs.asaas.com/docs/chaves-de-api | 03/08/2026 |
| 7 | Sandbox, FAQ e testes | https://docs.asaas.com/docs/sandbox · https://docs.asaas.com/docs/faq-sandbox · https://docs.asaas.com/docs/o-que-pode-ser-testado · https://docs.asaas.com/docs/testar-pagamento-de-qrcodes-pix | atual |
| 8 | Introdução - Cobranças | https://docs.asaas.com/docs/guia-de-cobrancas | atual |
| 9 | Cadastro de clientes | https://docs.asaas.com/docs/criando-um-cliente | atual |
| 10 | Introdução - Pix | https://docs.asaas.com/docs/pix | atual |
| 11 | Cobranças via Pix / QR Code dinâmico | https://docs.asaas.com/docs/cobrancas-via-pix | atual |
| 12 | QR Code estático | https://docs.asaas.com/docs/o-que-e-qr-code-estatico | atual |
| 13 | Cobrança parcelada | https://docs.asaas.com/docs/criar-uma-cobranca-parcelada | atual |
| 14 | Cobranças via boleto (trecho de juros e multa) | https://docs.asaas.com/docs/cobrancas-via-boleto | atual |
| 15 | Como o Asaas trata receitas na conta | https://docs.asaas.com/docs/como-o-asaas-trata-receitas-na-conta | atual |
| 16 | Webhooks: introdução, criar pela tela, criar pela API, receber eventos | https://docs.asaas.com/docs/sobre-os-webhooks · https://docs.asaas.com/docs/criar-novo-webhook-pela-aplicacao-web · https://docs.asaas.com/docs/criar-novo-webhook-pela-api · https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook | atual |
| 17 | Idempotência em webhooks | https://docs.asaas.com/docs/como-implementar-idempotencia-em-webhooks | atual |
| 18 | Eventos para cobranças | https://docs.asaas.com/docs/webhook-para-cobrancas | atual |
| 19 | Tipos de envio | https://docs.asaas.com/docs/tipos-de-envio | atual |
| 20 | Penalização de filas, fila pausada, reativar fila | https://docs.asaas.com/docs/penalização-de-filas · https://docs.asaas.com/docs/fila-pausada · https://docs.asaas.com/docs/como-reativar-fila-interrompida | atual |
| 21 | Erro 408 (tempo de resposta de 10 s), logs, FAQ de webhooks | https://docs.asaas.com/docs/erro-read-timed-out · https://docs.asaas.com/docs/logs-de-webhooks · https://docs.asaas.com/docs/faq-de-webhooks | atual |
| 22 | IPs oficiais do Asaas | https://docs.asaas.com/docs/ips-oficiais-do-asaas | atual |
| 23 | Limites da API | https://docs.asaas.com/reference/rate-e-quota-limit | atual |
| 24 | Referência: criar cobrança | https://docs.asaas.com/reference/criar-nova-cobranca | 08/09/2026 |
| 25 | Referência: obter QR Code Pix | https://docs.asaas.com/reference/obter-qr-code-para-pagamentos-via-pix | atual |
| 26 | Referência: atualizar, excluir e restaurar cobrança | https://docs.asaas.com/reference/atualizar-cobranca-existente · https://docs.asaas.com/reference/excluir-cobranca · https://docs.asaas.com/reference/restaurar-cobranca-removida | atual |
| 27 | Referência: estornar cobrança | https://docs.asaas.com/reference/estornar-cobranca | atual |
| 28 | Referência: criar webhook | https://docs.asaas.com/reference/criar-novo-webhook | atual |
| 29 | Referência (só sandbox): confirmar pagamento e forçar vencimento | https://docs.asaas.com/reference/confirmar-pagamento · https://docs.asaas.com/reference/forcar-vencimento | atual |
| 30 | Referência: recuperar cobrança e informações de pagamento | https://docs.asaas.com/reference/recuperar-uma-unica-cobranca · https://docs.asaas.com/reference/recuperar-informacoes-de-pagamento-de-uma-cobranca | atual |
| 31 | Preços e taxas (página pública) | https://www.asaas.com/precos-e-taxas | lida em 01/10/2026 |
| 32 | Índice da documentação (para achar páginas) | https://docs.asaas.com/llms.txt | atual |

### 15.3 Banco Inter (developers.inter.co)
| # | Fonte | URL oficial | Observação |
|---|---|---|---|
| 33 | Nossas APIs | https://developers.inter.co/docs/introducao/nossas-apis | lida |
| 34 | Como criar uma integração | https://developers.inter.co/docs/introducao/como-criar-uma-aplicacao | lida |
| 35 | OAuth 2.0 | https://developers.inter.co/docs/introducao/oauth-2.0 | lida |
| 36 | Autenticação mTLS | https://developers.inter.co/docs/introducao/autenticacao-mtls | lida |
| 37 | Como renovar uma integração | https://developers.inter.co/docs/introducao/como-renovar-uma-integracao | lida |
| 38 | Webhooks: o que é, como configurar, exemplo de callback, validar URL | https://developers.inter.co/docs/webhooks/o-que-e-webhooks · https://developers.inter.co/docs/webhooks/como-config-webhooks · https://developers.inter.co/docs/webhooks/callback-webhook · https://developers.inter.co/docs/webhooks/validar-url-do-webhook | lidas |
| 39 | Sandbox: sobre, criar integração, como testar | https://developers.inter.co/docs/sandbox/sobre-este-portal · https://developers.inter.co/docs/sandbox/como-criar-uma-aplicacao · https://developers.inter.co/docs/sandbox/como-testar-aplicacao | lidas |
| 40 | Referência da API Pix (YAML publicado pelo Inter) | https://developers.inter.co/references/pix (arquivo https://developers.inter.co/redocusaurus/swagger-api-pix-yaml.yaml) | lida: escopos, endereços, limites por minuto, webhook, callbacks |
| 41 | Referência do Token OAuth | https://developers.inter.co/references/token (arquivo https://developers.inter.co/redocusaurus/swagger-token-yaml.yaml) | lida |
| 42 | Referência da API Cobrança (boleto com Pix) V3 | https://developers.inter.co/references/cobranca-bolepix (arquivo https://developers.inter.co/redocusaurus/swagger-cobranca-bolepix-yaml.yaml) | lida |
| 43 | Changelog (24/12/2025, 05/12/2025, 14/01/2026, 12/03/2026, 10/04/2026, 18/05/2026) | https://developers.inter.co/changelog | lidos |
| 44 | Gestão de cobranças Inter Empresas (página comercial) | https://inter.co/empresas/gestao-de-cobranca/ | lida; sem tabela de tarifas |

### 15.4 Tentativas que não deram certo
| Fonte | Resultado |
|---|---|
| Central de Ajuda do Asaas (juros, multa, cobrança vencida) | erro 403 e 404; só resumo de busca |
| https://inter.co/empresas/tarifas/ | erro 404 |
| Resumos de busca sobre tarifas do Inter (sites de notícias) | **não oficiais; não usados** |

Fim do manual 09. Próximos manuais sugeridos: WhatsApp e mensagens (mensagens com Pix), e segurança de segredos.
