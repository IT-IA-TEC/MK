# Manual de consulta 05: Integrações (para o P.O. do IT.MK)

Para quem é: o P.O. que monta planos, épicos, histórias e critérios de aceite da frente **Integrações**. Segue o modelo da seção 10 de `docs/base-po.md`. Linguagem simples; termo técnico sempre vem com explicação curta.

Como ler as marcas deste manual:
- **[BASE]** = vem da base de conhecimento (Spring Integration, versões 7.x da documentação). A fonte está na tabela da seção 10.
- **[PROTÓTIPO]** = já está desenhado em `prototipo/` (o que o dono aprovou até agora).
- **[CONFIRMAR]** = conhecimento geral de mercado, **não está na base** e **não foi verificado**. Precisa ser conferido na documentação oficial do fornecedor antes de virar critério de aceite.

Regra do `CLAUDE.md` que vale aqui: visão única (sem perfis), nada redundante, cores só em `tokens.css`. Tela de integração mostra tudo numa visão só.

---

## 0. Resumo de uma página

1. A base de **Integrações** é a documentação do **Spring Integration** (a parte de Spring que implementa os padrões de integração do livro "Enterprise Integration Patterns", EIP). Ela ensina **como desenhar** fluxos de mensagem (canais, adapters, gateways, roteadores, retry, dead letter, idempotência). Ela **não** traz nada sobre Asaas, Banco Inter, WhatsGW, Shein, Mercado Livre, Shopee, Kwai, Pix, OAuth ou token. Os termos "asaas" e "pix" só aparecem como ruído de OCR em outras categorias (confirmado: nenhum conteúdo real).
2. Dá para planejar tudo isso com um vocabulário só: **chega uma mensagem (evento) -> passa por um endpoint -> vira um formato interno -> decide para onde vai -> chama o sistema externo com proteção (retry, limite, circuit breaker) -> se falhar vai para uma fila de erros que uma pessoa vê**.
3. Cinco ideias resolvem 90% do risco das integrações do IT.MK:
   - **Idempotência**: o mesmo aviso de pagamento pode chegar 2 vezes; só pode dar baixa 1 vez.
   - **Retry com espera crescente** (backoff) e **circuit breaker** (disjuntor): não martelar um sistema que caiu.
   - **Limite de taxa** (rate limit): essencial para WhatsGW (risco de bloqueio do número).
   - **Fila de erros** (dead letter) e **reprocessamento**: nada se perde em silêncio.
   - **Guardar o estado fora da memória** (no banco): senão um reinício esquece o que já foi feito.
4. Para entrega: ambiente de teste, **modo sombra** (o robô só sugere, não envia), segredos fora do código, rollback e teste de integração com sistema externo antes de "entregar" (livros de Entrega Contínua da categoria `devops`).
5. Tudo de Shein, Mercado Livre, Shopee, Kwai, Asaas, Banco Inter e WhatsGW (formato de API, prazos de token, limites reais) tem de ser levantado fora da base. Seção 9 lista o que perguntar.

---

## 1. Mapa dos conceitos (o que cada palavra quer dizer)

Analogia que ajuda: pense numa **empresa de correio interno**. A mensagem é a carta. O canal é a caixa onde a carta fica. O endpoint é o funcionário que pega a carta. O adapter é o tradutor que fala com quem está fora da empresa.

### 1.1 Blocos básicos [BASE: overview, message, channel, endpoint]

| Conceito | Em palavras simples | Exemplo no IT.MK |
|---|---|---|
| **Mensagem** (message) | Pacote com **conteúdo** (payload) + **cabeçalhos** (headers: id, data, de onde veio, chave de correlação, etc.). O sistema trata a mensagem sem precisar saber o tipo de dado. | Um aviso de pagamento do Asaas: conteúdo = dados do pagamento; cabeçalho = id do evento, hora de chegada, origem "asaas". |
| **Canal** (channel) | Tubo por onde a mensagem anda entre duas peças. Quem envia e quem recebe não se conhecem. | "pagamentos-recebidos", "mensagens-a-enviar", "erros". |
| **Endpoint** | Peça que **liga algo a um canal**. Pode só receber, só enviar, ou transformar. | Receptor de webhook, enviador de WhatsApp. |
| **Channel adapter** (adaptador de canal) | Endpoint de **mão única** que conecta um sistema de fora a um canal. *Inbound* traz para dentro; *outbound* leva para fora. | Inbound: receber webhook do Pix. Outbound: gravar no banco. |
| **Gateway** | Endpoint de **mão dupla** (pergunta e resposta). Existem dois sentidos: o **gateway de mensagens** esconde o framework do código de negócio (você chama uma interface simples) e o **gateway HTTP/JDBC** chama um sistema externo e devolve a resposta. | Interface `EnviadorWhatsApp.enviar(msg)` que o código de negócio chama sem saber que por baixo tem canal, retry e limite. |
| **Service activator** | Endpoint que chama um método de uma classe sua quando a mensagem chega. É o "ponto onde o seu código de negócio roda". | Regra "dar baixa na cobrança". |
| **Transformador** (transformer) | Troca o formato: JSON do fornecedor -> modelo interno. | Resposta do Mercado Livre -> "pedido IT.MK". |
| **Filtro** (filter) | Deixa passar ou **descarta** a mensagem. Pode mandar descartadas para um canal de descarte. | Descartar aviso de pagamento duplicado. |
| **Roteador** (router) | Decide **para qual canal** a mensagem vai, por conteúdo, por cabeçalho, por tipo, por lista de destinatários. | Evento "PAGO" -> baixa; "VENCIDO" -> cobrança; erro -> fila de erros. |
| **Splitter / Aggregator** | Splitter quebra uma mensagem em várias; aggregator junta várias numa só (guarda estado, precisa de armazenamento persistente). | Lote de 200 cobranças do mês -> 1 mensagem por pagador; depois juntar o resultado do lote. |
| **Enricher** (enriquecedor) | Completa a mensagem com dado que faltava. | Aviso de pagamento só traz o id; buscar o pagador no banco. |
| **Claim check** | Guarda o conteúdo pesado num lugar e passa só o "recibo". | Guardar o corpo bruto do webhook e passar só o id. |
| **Delayer** | Atrasa uma mensagem por um tempo sem travar quem enviou. | Mandar o lembrete só às 09:00, ou adiar o reenvio. |
| **Wire tap** | "Escuta" o canal e copia a mensagem para auditoria sem atrapalhar. | Copiar todo webhook recebido para a tabela de auditoria. |
| **Control bus** | Mandar comandos de gestão como se fossem mensagens (ligar/desligar peça). Perigoso: tem de ser protegido. | Botão "Pausar robô". |

### 1.2 Tipos de canal [BASE: channel/implementations, special-channels]

| Canal | Como se comporta | Quando usar no IT.MK |
|---|---|---|
| **Direct** (padrão) | Entrega direto, **na mesma linha de execução** de quem enviou. Se der erro, o erro volta para quem enviou. Permite uma **transação** do banco cobrir os dois lados. | Passos curtos e locais (validar -> gravar). |
| **Queue** (fila) | Guarda a mensagem; outro processo busca depois. Um só consumidor recebe cada mensagem. **Por padrão fica só na memória: reiniciou, perdeu.** Dá para ligar um armazenamento persistente (JDBC etc.). | Fila de envio do WhatsApp (precisa ser persistente!). |
| **Publish-subscribe** | Manda para **todos** os assinantes. Serve para "avisos" (eventos). Não dá para "buscar" depois. | Aviso "pagamento recebido" para baixa + auditoria + notificação. |
| **Priority** | Fila com prioridade (cabeçalho `priority`). | Confirmação de pagamento antes de lembrete. |
| **Rendezvous** | Quem envia espera até alguém receber. | Raro. Resposta síncrona. |
| **Executor** | Entrega em outra linha de execução (assíncrono). | Receber webhook e responder rápido. |
| **nullChannel / errorChannel** | `nullChannel` = lixeira. `errorChannel` = canal global onde caem as exceções do trabalho assíncrono. | Ver seção 1.5. |

Regra de decisão da base: comece com Direct; vire fila só onde precisa **amortecer** ou **reduzir velocidade** de entrada; vire publish-subscribe onde precisa **avisar vários** [BASE: channel/implementations].

### 1.3 Polling (perguntar de tempos em tempos) x evento (ser avisado) [BASE: polling-consumer, endpoint]

| | **Polling** (consumidor de consulta) | **Evento** (event-driven) |
|---|---|---|
| Como funciona | Um relógio (poller) pergunta "tem novidade?" a cada X tempo ou por horário (cron). | Quem tem a novidade avisa na hora (webhook, listener). |
| Bom para | Sistemas que **não avisam** (APIs de marketplace sem webhook, arquivos, banco). | Pix pago, mensagem recebida. |
| Riscos | Atraso até a próxima consulta; consultar demais estoura o limite da API; poller sem proteção pode repetir trabalho. | Aviso pode **chegar duplicado, fora de ordem ou nunca**. |
| Ajustes na base | `fixed-delay` (espera depois de terminar), `fixed-rate`, `cron`, `max-messages-per-poll` (padrão 1 em adaptador de fonte), `receive-timeout` (padrão 1 s). Para hora/dia/mês a base recomenda **cron**. Pode-se **pular** uma rodada de poll por condição (`PollSkipAdvice`). | Responder 200 rápido; validar assinatura/segredo; tratar duplicidade. |
| Cuidado | Muitos pollers podem **esgotar linhas de execução** (thread starvation); aumentar o pool [BASE: namespace-taskscheduler]. | Sempre ter um **plano B por consulta** (polling de conferência), pois aviso pode se perder. |

Para o IT.MK: marketplaces = polling (consulta periódica com limite); Pix = evento (webhook) **mais** conferência por consulta; WhatsApp = envio por fila com limite, recebimento por evento/webhook do WhatsGW [CONFIRMAR se o WhatsGW avisa por webhook].

### 1.4 Padrões de proteção [BASE: handler-advice/classes, idempotent-receiver, lock]

Na base, "advice" é uma **capa** que se coloca em volta de um endpoint para dar proteção sem mexer no código de negócio. Capas existentes: retry, circuit breaker, expression (ação após sucesso/falha), rate limiter, cache, lock, contexto, reativo. **A ordem das capas importa**: a primeira é a mais externa [BASE: handler-advice/order].

**Retry (tentar de novo)**
- Padrão: 3 tentativas **além** da original, **sem espera** (todas seguidas). A base avisa: sem espera é ruim; com espera demais pode travar linhas de execução em volume alto.
- Dá para configurar: número de tentativas, atraso inicial, multiplicador (backoff exponencial), atraso máximo.
- Quando esgota: sem plano, a exceção sobe; com **recovery** (recuperador) manda uma mensagem de erro para um canal (`ErrorMessageSendingRecoverer`). Isso é a ponte para a "fila de erros".
- **Retry sem estado** (bloqueia e tenta de novo na hora) x **com estado** (devolve o erro e quem enviou reenvia; bom quando a origem sabe reentregar, como fila de mensagens).
- A partir da 7.0 o retry vem do **Spring Framework** (o antigo `spring-retry` saiu). Planejar versão compatível [BASE: changes-6.5-7.0].
- Regra do P.O.: **só repetir o que é seguro repetir** (consulta, ou escrita idempotente). Nunca repetir cega a "enviar mensagem de cobrança".

**Circuit breaker (disjuntor)**
- Estados: **fechado** (chama normal) -> depois de N falhas seguidas **abre** (falha rápido, nem tenta) -> após um tempo vira **meio-aberto** (deixa 1 passar; se falhar, abre de novo; se passar, fecha).
- Padrão da base: abre com **5** falhas seguidas; tenta de novo após **1000 ms**. Ajustar para cada fornecedor (valores reais [CONFIRMAR]).
- Para o IT.MK: Asaas/Inter fora do ar, marketplace fora do ar, WhatsGW fora do ar -> o disjuntor evita fila de erros enorme e **dispara alerta**.

**Rate limiter (limite de taxa)**
- Impede sobrecarregar o destino: "no máximo N chamadas por período". Quando estoura, a chamada **espera** (fica bloqueada) [BASE: handler-advice/classes, baseado na biblioteca Resilience4j].
- Atenção: bloquear espera ocupa linha de execução; para um limite de **horário e dia** (como o do robô do protótipo) faz mais sentido uma **regra de negócio** (tabela de envios) do que só a capa. Ver seção 3.3.

**Idempotent receiver (receptor idempotente)**
- Idempotente = receber a mesma coisa 2 vezes tem o mesmo efeito de receber 1 vez.
- A base fornece a capa `IdempotentReceiverInterceptor` + `MetadataStoreSelector`: monta uma **chave** a partir da mensagem (ex.: id do evento) e consulta uma **loja de metadados**. Se a chave já existe, a mensagem é marcada como duplicada (`duplicateMessage = true`), ou **descartada**, ou gera erro.
- **Ponto crítico**: a loja padrão é **na memória** e esquece ao reiniciar. Em produção usar loja **persistente** (JDBC/Postgres, Redis...) e que seja **atômica** (`ConcurrentMetadataStore`) se houver mais de uma instância [BASE: meta-data-store, jdbc/metadata-store].
- A base diz: o padrão é "funcional", **a lógica de idempotência é da aplicação**. A capa só ajuda a decidir.
- Além da chave, o próprio banco deve garantir (restrição de unicidade) [CONFIRMAR como boa prática geral, não é texto da base].

**Lock (trava) por chave** [BASE: handler-advice/lock, distributed-locks]
- Garante que duas mensagens da **mesma chave** não rodem juntas (chaves diferentes seguem em paralelo). Existe versão em memória e versões distribuídas (JDBC etc.).
- Uso: duas notificações do mesmo pagamento chegando juntas; dois envios para o mesmo pagador ao mesmo tempo.

**Transação** [BASE: transactions, handler-advice/tx-handle-message]
- Fluxos iniciados por **poller/adaptador** precisam que você ligue a transação (ela não vem sozinha). Existe capa que faz **o fluxo inteiro** ficar na transação.
- Canal Direct permite que o resultado do passo seguinte (ex.: gravar no banco) decida o commit ou rollback de quem enviou.
- Atenção: **chamar API externa não faz parte da transação do banco**. Não existe "desfazer" um WhatsApp enviado. Por isso a idempotência e a fila.

### 1.5 Tratamento de erro e dead letter [BASE: error-handling]

- Erro em fluxo **síncrono** (Direct): a exceção volta para quem chamou.
- Erro em fluxo **assíncrono** (fila, executor, poller): não há a quem devolver. O erro vira uma **mensagem de erro** (`ErrorMessage`) enviada para o `errorChannel` (ou para um canal indicado no cabeçalho `errorChannel` da mensagem). Já vem um assinante que apenas registra em log nível ERROR.
- Dá para assinar um **roteador por tipo de exceção** (`ErrorMessageExceptionTypeRouter`) no `errorChannel` para mandar cada tipo de erro ao seu tratamento (ex.: "sem rede" -> tenta de novo; "dado inválido" -> fila de revisão humana).
- Desde a 5.4.3 o canal de erro exige assinante (`requireSubscribers = true`) para não engolir erro quando não há ninguém ouvindo.
- A base não define "dead letter" como componente próprio no Spring Integration. O conceito aparece ligado a **brokers** (Kafka: tópico de mensagens mortas; RabbitMQ/JMS: redelivery). Para o IT.MK, **dead letter = tabela no Postgres de mensagens que esgotaram as tentativas**, com motivo, quantidade de tentativas, conteúdo e botão "reprocessar". Isso é um desenho nosso, montado com o recuperador do retry + `errorChannel` [decisão de desenho, não texto da base].
- O gateway de mensagens também tem `error-channel` para transformar a falha em resposta que o chamador entende.

### 1.6 Armazenamento de mensagem e de estado [BASE: message-store, meta-data-store, jdbc/*]

| Peça | Para que serve | Observação |
|---|---|---|
| **Message store** | Guardar mensagens em buffer (fila persistente, aggregator, claim check). | Padrão na memória (perde). Para produção: JDBC, Redis, Mongo, Hazelcast. |
| **JdbcChannelMessageStore** | Fila persistente num banco relacional (ótimo candidato: Postgres do Supabase). | Só guarda o que for **serializável**; cabeçalhos de HTTP podem ser removidos; canais temporários de resposta se perdem. Tabelas vêm de script de exemplo; criar índices. A partir da 6.2 o app **não sobe** se a tabela não existir. |
| **Metadata store** | Guardar "o que já fiz" (último item lido, chaves já processadas). | JDBC disponível. Essencial para idempotência e polling sem repetir. |
| **Message history** | Cabeçalho que registra por quais peças a mensagem passou. | Útil para auditoria/depuração. |

Aviso que vale ouro para o P.O.: **tudo que fica só na memória some quando o sistema reinicia ou faz deploy**. Todo critério de aceite de fila, de idempotência e de token tem de dizer "persistente".

### 1.7 Outros termos úteis

- **Claim check, enricher, delayer, scatter-gather** (perguntar a vários e escolher o melhor): vistos acima/ na base; sem uso óbvio no MVP.
- **Canonical data model** (modelo canônico): formato interno único para todos os marketplaces. A base cita como opção, não como obrigação [BASE: transformer]. Para o IT.MK é a decisão mais importante do conector de marketplace (seção 3.1).
- **Routing slip**: lista de próximos passos viaja na mensagem; para fluxos dinâmicos.
- **Controle de ordem**: fila por chave e resequencer reordenam; a base trata ordem estrita em AMQP; para webhook, **não confie em ordem**.
- **Orderly shutdown** (desligar em ordem): parar as entradas, esperar as mensagens em voo terminarem, depois desligar [BASE: shutdown]. Entra no critério de deploy.
- **Segurança de canal**: a segurança do módulo próprio foi removida na 6.3; usar `spring-security-messaging` e interceptor de autorização [BASE: security].

---

## 2. Como a base se encaixa no stack do IT.MK

| Decisão | Orientação |
|---|---|
| Spring Integration x código "na mão" | A base é toda sobre Spring Integration. Faz sentido **se** o time quiser fluxos declarativos com retry/limite/erro prontos. Alternativa: serviços Spring comuns + as mesmas ideias. **Decisão técnica do time**, não do P.O. O P.O. exige os **comportamentos** (critérios abaixo), não a ferramenta. |
| Onde mora o estado | Postgres (Supabase): filas persistentes, chaves de idempotência, tokens (cifrados), dead letter, auditoria. A base dá suporte JDBC para message store, metadata store e lock registry. |
| Configuração | Java DSL (`IntegrationFlow`) permite desenhar o fluxo em código; testável. |
| Teste | `spring-integration-test`: `@SpringIntegrationTest`, `MockIntegration`, `MockIntegrationContext` (substituir um endpoint real por falso), `noAutoStartup` (não iniciar pollers nos testes). `MockRestServiceServer` do Spring para simular HTTP [BASE: testing]. |
| Métricas | Micrometer (se houver registro de métricas no contexto, as métricas passam a existir) [BASE: metrics]. |
| Versões | A documentação lida é das séries 7.x (Spring Framework 7). Garantir que o Java/Spring Boot do projeto seja compatível antes de prometer prazos. [não verificado] |

---

## 3. Como desenhar cada integração do IT.MK (em passos)

Cada desenho termina com "o que o P.O. precisa decidir".

### 3.1 Conector de marketplace (Shein, Mercado Livre, Shopee, Kwai)

O que o protótipo já mostra [PROTÓTIPO: `prototipo/js/marketplaces.js`]:
- Quatro plataformas. Situações da conexão: **Sem conexão, Aguardando autorização, Conectada, Com erro, Vencida**.
- Validade da autorização no protótipo: **Shein sem validade fixa**; **Mercado Livre 6 meses**; **Kwai 365 dias**; **Shopee configurável (padrão 365 dias)**. A situação "Conectada" vira "Vencida" sozinha quando passa da validade.
- Cada conexão guarda quem autorizou e quando; houve exemplos de erro: "Autorização feita por operador da conta, precisa ser o administrador" (ML) e "Autorização revogada pelo vendedor".
- Cada plataforma tem aplicativo (id), endereço de retorno (callback) e, na Shopee, endereço de teste e de produção.
- **Esses prazos e regras do protótipo são premissas do desenho. Não foram verificados na documentação dos marketplaces.** [CONFIRMAR]

**Passos de desenho (visão do fluxo)**

1. **Registro do aplicativo** em cada marketplace (id, segredo, endereço de retorno, ambiente de teste x produção). Guardar o segredo em cofre/variável de ambiente, nunca no código nem no protótipo.
2. **Autorização** (o dono da loja concorda): fluxo em que o vendedor é levado ao marketplace, autoriza, volta ao endereço de retorno com um código, e o IT.MK troca por **token de acesso** (e normalmente um **token de renovação**) [CONFIRMAR: formato por marketplace]. Tratar os estados: aguardando, concluída, negada, feita por pessoa errada.
3. **Guardar com segurança**: token **cifrado** em banco, com data de emissão e **data de validade**, quem autorizou, escopo, ambiente. Registrar na auditoria quem conectou/revogou.
4. **Renovação**: um **poller com cron** (ex.: diário) procura conexões que vencem em N dias, tenta renovar com o token de renovação; se não conseguir, muda a situação para **Com erro/Vencida** e **alerta** quem cuida da conta (pedido de nova autorização).
5. **Leitura de dados** (pedidos, catálogo, indicadores): poller por loja, com **limite de chamadas**, **retry com espera crescente** só em leituras, **circuit breaker** por marketplace, e **chave de idempotência** (`marketplace + loja + id externo + versão/data de atualização`).
6. **Tradução para o modelo interno**: um **transformador por marketplace** que converte para um único modelo (canônico). Campos sem equivalente ficam em colunas "extras", sem perder o dado original (guardar o bruto, ver claim check).
7. **Roteamento**: por tipo de dado (pedido, catálogo, violação, avaliação) para seu tratamento.
8. **Falhas**: erro de autenticação (token inválido) -> marca conexão "Com erro", **não** insiste (evita bloqueio); erro de rede/limite -> retry; dado estranho -> fila de revisão.
9. **Painel**: situação da conexão, dias para vencer, último sucesso, último erro, quantidade na fila de erros.

**O que o P.O. decide:** quais dados lê primeiro (corte de MVP); frequência de consulta por plataforma; quem é alertado de token a vencer e com quantos dias de antecedência (ex.: 30, 15, 7, 1); o que acontece com a cobrança se a conexão cair.

**Dependência externa:** acesso aos programas de parceiro/desenvolvedor de cada marketplace (aprovação de aplicativo pode demorar) [CONFIRMAR]. Na lista de riscos.

### 3.2 Webhook de Pix (Asaas ou Banco Inter)

O que o protótipo mostra [PROTÓTIPO: `prototipo/js/recebimentos.js`]: aba "Pix automático" (baixa feita pelo banco, com origem "Banco" ou "Asaas/Inter"), aba "Divergentes" com motivos (**valor diferente; quem pagou é diferente do pagador; Pix fora do prazo ou expirado; pagamento duplicado**), "A conferir" (comprovantes), "Sem cobrança ligada". Ou seja: o desenho já prevê que a baixa automática convive com conferência humana.

Vocabulário de Pix com cobrança (geral, [CONFIRMAR]): cobrança com vencimento, juros e multa, identificador da transação, QR Code/copia e cola, aviso por webhook quando paga. A base **não explica nada disso**. O que a base ensina é como **receber o webhook com segurança e sem duplicar**.

**Passos de desenho**

1. **Criar a cobrança** no provedor: o IT.MK gera um identificador próprio (**chave de referência externa**) e manda junto, para depois casar o aviso com a cobrança. Guardar o id do provedor e o nosso.
2. **Endpoint de recebimento** (adapter inbound HTTP): endereço público HTTPS. Responsabilidades, em ordem:
   1. Verificar autenticidade (segredo/token do webhook configurado no provedor, e, se houver, assinatura e lista de IPs) [CONFIRMAR como cada provedor faz].
   2. **Gravar o aviso bruto** numa tabela `webhook_recebido` (dado + cabeçalhos + hora). Isso é a "caixa de entrada".
   3. **Responder rápido** (2xx). Provedores costumam **pausar a fila de webhooks se o endereço responder erro muitas vezes** [CONFIRMAR]. Por isso responder depois de gravar, não depois de processar tudo.
3. **Processamento assíncrono**: um consumidor lê da caixa de entrada (fila persistente) e executa:
   1. **Idempotência**: chave = id do evento do provedor (ou id do pagamento + tipo de evento). Se já processado, descarta e registra.
   2. **Conferir no provedor** (consulta da cobrança pela API) para não confiar só no corpo do aviso. [boa prática, CONFIRMAR]
   3. **Casar** com a cobrança do IT.MK pelo identificador.
   4. **Regras de negócio**: valor igual? pagou antes/depois do vencimento? juros e multa aplicados corretamente? pagador esperado? duplicado? -> se algo não bate, vira **divergente** (já existe no protótipo), nunca baixa errada.
   5. **Dar baixa** em transação do banco, junto com o registro na auditoria e a marca "processado".
   6. **Disparar efeitos**: avisar o robô para enviar "confirmação de pagamento", pausar cobranças ("pagamento feito" é uma das pausas automáticas do protótipo).
4. **Falha**: erro temporário -> retry com espera; esgotou -> **dead letter** (tabela) + alerta + botão **reprocessar**. Erro de dado -> fila de divergentes para uma pessoa.
5. **Conciliação por consulta (rede de segurança)**: um **poller diário** (cron) pede ao provedor os pagamentos do período e compara com o que o IT.MK baixou. Pega webhook perdido ou fora de ordem. Resultado vira lista de "diferenças" com o mesmo fluxo de divergentes.
6. **Reprocessamento seguro**: reprocessar o mesmo aviso 10 vezes tem de dar o mesmo resultado (idempotência).
7. **Expiração**: cobrança vencida/expirada -> estado próprio; se o cliente pagar um Pix expirado, cai em "Pix fora do prazo ou expirado".

**Pontos de atenção (todos [CONFIRMAR] com o provedor escolhido):**
- Eventos podem chegar **fora de ordem** (pago antes de "criado"?) e **mais de uma vez**.
- Valores de juros e multa: quem calcula (provedor ou IT.MK)? O valor pago pode diferir do valor original por causa disso. Precisa de regra escrita.
- Diferença entre "confirmado" e "recebido/liquidado": só dar baixa no estado final correto.
- Ambiente de teste (sandbox) do provedor, com chave e endereço diferentes.
- Asaas x Banco Inter: decisão ainda aberta. O desenho acima serve aos dois. Criar uma **interface própria** "ProvedorPix" (adapter) para poder trocar de provedor sem mexer no restante (padrão adapter/gateway da base).

**O que o P.O. decide:** provedor; regras de juros/multa; limite de tempo para considerar "divergente"; quem trata divergência e em quanto tempo; se baixa parcial é aceita.

### 3.3 Envio de WhatsApp com limites (canal WhatsGW) e robô de cobrança

O que o protótipo já define [PROTÓTIPO: `prototipo/js/robo.js`]:
- Abas: Painel, **Fila de aprovação**, Atendimento humano, Pagadores, **Regras e limites**, **Modo teste**, Auditoria.
- **Só sai texto de modelo aprovado.** Mensagem livre de cliente vai para atendimento humano.
- Estado do canal: "WhatsApp conectado/desconectado", com **alerta** "Nenhuma mensagem sai até reconectar. Abra a WhatsGW e leia o QR novamente" e botão de teste de conexão.
- **Limites iniciais baixos de propósito**: 40 por dia no total, 1 por pagador por dia, intervalo mínimo de 180 min entre mensagens. Aviso: envio em massa pode bloquear o número.
- Horário permitido: 09:00 a 17:30, segunda a sexta, sem feriados (lista editável).
- **Pausas automáticas**: promessa de pagamento ativa, acordo em andamento, contestação aberta, pagamento feito.
- Regras fixas: só cobra competência conferida e pagador que "atende" (situações do pagador: Atende, Não atende, **Em teste**: só sugere, não envia).
- **Modo sombra** ligado: o robô só sugere; mostra taxa de "aprovada sem edição".
- Simulador: "Enviaria agora?" com checklist de condições.
- Ações do robô: lembrete antes do vencimento, cobrança do mês com Pix, aviso de atraso, comprovante, confirmação, extrato, 2ª via.

A base **não cobre** WhatsGW nem WhatsApp. O que serve da base: fila persistente, limite de taxa, atraso, retry, circuit breaker, idempotência, lock por chave.

**Passos de desenho**

1. **Fila de saída persistente** (tabela no Postgres, ou canal fila com armazenamento JDBC). Cada item: pagador, modelo, variáveis, motivo/origem, **chave de idempotência** (`pagador + competência + tipo de ação + data`), estado (pendente, aguardando aprovação, aprovado, enviando, enviado, falhou, cancelado), tentativas, agendado para.
2. **Portão de decisão** (rodado ao **enfileirar** e de novo **na hora de enviar**, pois o mundo muda entre os dois): é o checklist que o simulador do protótipo já mostra:
   - robô não está pausado e canal conectado;
   - pagador "atende" (ou "em teste": só sugere);
   - competência conferida; cobrança ainda em aberto;
   - sem pausa ativa (promessa, acordo, contestação, pagamento);
   - dentro do horário/dia/feriado;
   - **dentro dos limites** (total do dia, por pagador, intervalo mínimo);
   - modelo aprovado.
   Se falhar, a mensagem **fica na fila** com o motivo, não se perde e não "fura" a regra.
3. **Modo sombra** (ligado por padrão no início): o item vira **sugestão** e **não** chama o WhatsGW. Registra o que o robô teria feito; o humano marca "aprovada sem edição / editada / recusada". A taxa de aprovação sem edição é o **indicador de entrada em produção**.
4. **Fila de aprovação** (ver 3.4) para o que o robô não faz sozinho.
5. **Disparo** (adapter/gateway HTTP outbound para o WhatsGW) por **um único consumidor** por número (evita enviar em paralelo e furar o intervalo): usar lock por chave ou 1 thread por número. Aplicar:
   - **rate limiter** + **intervalo mínimo** com variação aleatória pequena [CONFIRMAR se ajuda contra bloqueio];
   - **timeout** de conexão e de leitura bem definidos [BASE: http/timeout];
   - **retry só para falhas claramente não entregues** (ex.: erro de conexão antes de enviar). **Falha ambígua (timeout depois de enviar) não repete sozinha**: marca "a conferir", pois repetir pode mandar a cobrança 2 vezes. A idempotência do lado do WhatsGW pode não existir [CONFIRMAR].
   - **circuit breaker**: se o canal está desconectado ou o WhatsGW responde erro N vezes seguidas, **abre**, pausa automática do robô e **alerta**.
6. **Monitorar a conexão do número**: verificação periódica (poller) do estado da sessão; se desconectar, mudar o estado do painel e **alertar** (o protótipo já exibe o aviso). [CONFIRMAR: como o WhatsGW informa desconexão — consulta ou webhook].
7. **Receber respostas** (evento): cada mensagem do cliente vira evento com idempotência; classificar (confirmação, pedido de parcelamento, contestação, áudio, outro). O que não for tratado por modelo vai para **Atendimento humano**; pedidos como parcelamento/prazo vão para a **fila de aprovação**.
8. **Registro**: cada decisão e cada envio na **auditoria** (quem aprovou, texto final, hora, resultado, id da mensagem no provedor).
9. **Parada de emergência**: botão "Pausar robô" com motivo e quem pausou (já no protótipo). A pausa tem de ser **imediata e checada no envio**, não só no enfileiramento.

**Riscos específicos (todos [CONFIRMAR] com o WhatsGW e com as regras do WhatsApp):**
- **Bloqueio do número** por volume, repetição, reclamações ou conteúdo. Mitigação: limites baixos, só quem tem relação de cobrança, texto de modelo, opção de parar, aumento gradual.
- Número desconectado (QR expirou) = nada sai.
- Canal não oficial pode mudar sem aviso. Plano B: interface própria "CanalMensagem" (adapter) para trocar de canal sem refazer o robô.
- Privacidade/LGPD: base legal e opção de descadastro [fora do escopo desta base].

**O que o P.O. decide:** limites iniciais e rampa de aumento; horário; quais ações entram no robô e em que ordem; critério para sair do modo sombra (ex.: X% aprovadas sem edição em Y dias); quem é avisado quando desconecta.

### 3.4 Fila de aprovação (humano no meio)

Padrão de desenho (combinação de itens da base: canal fila persistente, roteador, filtro, delayer, error handling) [desenho do IT.MK]:

1. **Quando entra na fila**: regra do roteador: "se for pedido fora de modelo (parcelamento, prazo novo, bloqueio, resposta a contestação) -> fila de aprovação". Protótipo: tipos como Parcelamento, Prazo novo, Bloqueio, Resposta a contestação.
2. **O que o item traz**: pagador, pedido do cliente, proposta do robô, há quanto tempo está esperando, histórico.
3. **Ações**: Aprovar, Editar e aprovar, Recusar. Todas gravam **quem, quando, antes/depois** na auditoria (visão única: qualquer usuário aprova; personalização depois em Configurações).
4. **Efeito da aprovação**: gera a ação (mensagem, novo Pix, parcelas) **pela mesma fila de saída com a mesma idempotência e os mesmos limites** (aprovar não fura limite nem horário; vira "agendado").
5. **Tempo limite**: item parado há mais de X horas gera aviso; depois de Y vence e volta para atendimento humano (o delayer da base serve para agendar esse vencimento).
6. **Concorrência**: dois usuários abrindo o mesmo item; usar lock/versão para que só uma decisão valha.
7. **Medir**: tempo médio de resposta da fila e % de aprovados sem edição.

### 3.5 Fio condutor: o que todo fluxo de integração deve ter

1. Entrada (adapter) -> grava bruto -> responde/ack.
2. Fila persistente.
3. Idempotência.
4. Transformação para modelo interno.
5. Regra de negócio.
6. Efeito com proteção (retry/limite/disjuntor).
7. Falhou? dead letter + alerta + reprocessar.
8. Auditoria e métricas.

---

## 4. Checklist de critérios de aceite para itens de Integrações

Copie as caixas relevantes para cada item BL-xx. Marque `N/A` com motivo quando não se aplicar. Cada caixa é testável (INVEST).

### 4.1 Segredos e acesso
- [ ] Nenhuma chave, senha, token ou segredo está no código, no repositório, no protótipo ou em log. (Livro Entrega Contínua: "não guarde senhas no controle de versões" [BASE: devops doc_06125].)
- [ ] Segredos ficam em local próprio do ambiente (variável de ambiente/cofre), **separados** entre teste e produção.
- [ ] Tokens guardados no banco estão **cifrados**; a tela só mostra os últimos caracteres.
- [ ] Existe forma de **trocar** um segredo sem refazer o sistema, e o procedimento está escrito.
- [ ] Quem conectou, trocou ou revogou uma credencial fica registrado na auditoria.
- [ ] O endereço que recebe webhook valida o segredo/assinatura e rejeita o que não bate (resposta e log claros, sem vazar o motivo exato ao remetente).
- [ ] Logs **mascaram** CPF/CNPJ, telefone, token e chave Pix.

### 4.2 Expiração de token e autorização
- [ ] Cada conexão guarda: emitido em, **vale até**, quem autorizou, ambiente.
- [ ] O sistema mostra "faltam N dias" e muda sozinho para **Vencida** ao passar da data.
- [ ] Há aviso **antes** de vencer, nos prazos combinados (ex.: 30/15/7/1 dias) e para as pessoas combinadas.
- [ ] Renovação automática testada: sucesso (nova data gravada) e falha (situação "Com erro", alerta, **sem loop** de tentativas).
- [ ] Autorização revogada pelo vendedor ou feita por pessoa sem permissão gera mensagem clara e passo seguinte.
- [ ] O que depende da conexão (coleta, cobrança) **pausa** de forma segura quando vence, e **retoma** sozinho quando reconectar, **sem duplicar** o que já foi lido.

### 4.3 Idempotência e duplicidade
- [ ] A mesma mensagem recebida 2 vezes (ou 20) produz **1 só efeito** (1 baixa, 1 envio).
- [ ] A chave de idempotência está definida por escrito (de quais campos é feita) e guardada **no banco**, não em memória.
- [ ] Teste automático: enviar o mesmo webhook em paralelo; resultado único.
- [ ] Reiniciar o sistema no meio do processamento não perde nem duplica mensagens.
- [ ] Evento fora de ordem não corrompe o estado (regras de transição de estado definidas).

### 4.4 Tentativas, limites e proteção
- [ ] Tentativas de novo têm **número máximo e espera crescente**; valores documentados.
- [ ] Só se repete o que é seguro repetir; ações não idempotentes (enviar mensagem) têm regra própria para falha ambígua.
- [ ] Disjuntor configurado para cada fornecedor, com limite de falhas e tempo de reabertura documentados, e **alerta quando abre**.
- [ ] Limites de taxa respeitam o limite do fornecedor (valor registrado) e, para WhatsApp, os limites do robô (dia, por pagador, intervalo, horário).
- [ ] Tempos limite (timeout) de conexão e de resposta definidos; sem espera infinita.
- [ ] Estourar limite **adia** (fica na fila com motivo), não descarta.

### 4.5 Reprocessamento e fila de erros
- [ ] Mensagem que esgota tentativas vai para a **fila de erros** com: conteúdo, motivo, tentativas, hora, origem.
- [ ] Tela/lista mostra a fila de erros; há ação **reprocessar** (um e em lote) e **descartar com motivo**.
- [ ] Reprocessar é seguro (idempotente) e fica registrado.
- [ ] Há **conciliação por consulta** diária para pegar aviso perdido (Pix) ou leitura incompleta (marketplace).
- [ ] Tamanho da fila de erros e idade do item mais antigo estão visíveis.

### 4.6 Logs, rastreio e auditoria
- [ ] Cada mensagem tem **id de correlação** que atravessa entrada, processamento e saída.
- [ ] O histórico de caminho da mensagem pode ser consultado (message history) [BASE].
- [ ] Log de erro traz **onde** falhou (componente/fluxo) e **qual** mensagem; sem dado sensível.
- [ ] Auditoria registra quem aprovou, editou, recusou, pausou, reprocessou.
- [ ] Retenção de logs e do bruto do webhook definida.

### 4.7 Alertas
- [ ] Alerta (e-mail/painel/WhatsApp interno) para: token vencendo, conexão com erro, disjuntor aberto, WhatsApp desconectado, fila de erros acima do limite, webhook sem receber nada por X horas, taxa de falha acima de Y%.
- [ ] Cada alerta diz **o que aconteceu, o impacto e o que fazer**; vai para quem pode agir.
- [ ] Alertas não se repetem sem parar (agrupar e silenciar até resolver).

### 4.8 Ambiente de teste e modo sombra
- [ ] Existe ambiente de teste do fornecedor (sandbox) configurado e **separado** de produção; chaves, endereços e banco distintos.
- [ ] Testes automáticos usam **substitutos** (mock) do sistema externo para simular: sucesso, erro 4xx/5xx, lentidão, resposta duplicada, resposta fora de ordem, token expirado [BASE: testing; devops doc_06261 sobre stubs].
- [ ] Pelo menos um teste de **integração real** com o ambiente de teste do fornecedor antes de entregar (o livro avisa: a entrega não pode ser a primeira vez que o sistema fala com o externo [BASE: devops doc_06339]).
- [ ] **Modo sombra**: o fluxo roda de ponta a ponta mas **não faz o efeito externo** (não envia, não baixa); registra o que faria. Critério de saída definido (taxa e período).
- [ ] Existe forma de ligar a integração para **um grupo pequeno** (ex.: um pagador/loja de teste) antes de todos (ideia de "canary", livro Continuous Delivery [BASE: devops doc_05382]).
- [ ] Desligar a integração (chave geral / botão de pausa) funciona sem deploy.

### 4.9 Entrega e operação
- [ ] Plano de **volta atrás** (rollback) escrito; cuidado com dados já gravados [BASE: devops doc_06411].
- [ ] Desligamento ordenado: ao reiniciar, termina o que está em voo antes de parar [BASE: shutdown].
- [ ] Migração de banco (tabelas de fila, chaves, auditoria) revisada e aplicada primeiro em teste.
- [ ] Verificação rápida pós-entrega (smoke test): receber um webhook de teste, enviar uma mensagem de teste em modo sombra, ler token.
- [ ] Nada de entrega na sexta-feira (regra do `base-po.md`).
- [ ] Métricas mínimas expostas: recebidos, processados, duplicados descartados, falhas, tempo de processamento, fila pendente.

### 4.10 Tela (quando houver)
- [ ] Segue regra máxima de layout do `CLAUDE.md`: sem espaço vazio, sem barra horizontal em nenhuma largura, texto longo quebra linha, cores só de `tokens.css`.
- [ ] Visão única: nada de modo por perfil; tudo visível numa tela.
- [ ] Prévia publicada e link enviado ao dono.

---

## 5. Modelo de item de backlog (exemplo preenchido, estilo `base-po.md`)

**BL-xx Receber aviso de Pix pago e dar baixa automática**
- História: Como **analista de cobrança**, quero que o pagamento Pix seja baixado sozinho quando o banco avisar, para não precisar conferir comprovante um por um.
- Critérios de aceite:
  - [ ] Aviso válido gera 1 baixa e 1 registro de auditoria.
  - [ ] Aviso repetido não gera 2ª baixa (idempotência por id do evento).
  - [ ] Valor diferente, pagador diferente, fora do prazo ou duplicado vai para "Divergentes", sem baixar.
  - [ ] Falha de processamento tenta de novo com espera crescente e, ao esgotar, vai para a fila de erros com alerta.
  - [ ] Existe conciliação diária por consulta; diferença aparece na tela.
  - [ ] Funciona no ambiente de teste do provedor; teste com aviso duplicado e fora de ordem.
  - [ ] Segredo do webhook fora do código; aviso sem segredo correto é rejeitado.
- Desenho: aba "Pix automático" do protótipo (computador e celular).
- Prioridade: Deve (MoSCoW), nível 2. Depende de: decisão do provedor (Asaas ou Inter), cadastro de cobrança.
- Riscos: formato real do aviso e regra de juros/multa ainda não verificados.

---

## 6. Sugestão de ordem do roadmap de Integrações (para discutir; datas são do P.O.)

Ordem por **dependência e risco** (critérios do `base-po.md`, seção 6):

1. **Base comum** (versão 1): fila persistente, chaves de idempotência, fila de erros, auditoria, cofre de segredos, alertas básicos, ambiente de teste. Sem isso, tudo abaixo é frágil.
2. **Pix com webhook** (versão 2): maior valor direto (receber), risco médio. Primeiro em **modo sombra** (só registra e compara com a baixa manual), depois baixa real.
3. **WhatsApp em modo sombra** (versão 2 ou 3): robô sugere; fila de aprovação; limites baixos; alerta de desconexão. Só depois enviar de verdade para um grupo pequeno, e então ampliar.
4. **Um marketplace piloto** (versão 3): escolher o de **autorização mais simples ou o que tem mais lojas**. Depois os outros. Cada marketplace é um **épico** próprio.
5. **Renovação automática de token e alertas de validade** (junto do primeiro marketplace).
6. **Conciliações e relatórios de saúde das integrações** (versão 4).

Cada versão com no máximo 3 meses (regra de `base-po.md`) e com data. Aprovar com o dono antes de fixar.

---

## 7. Armadilhas (as mais comuns, com origem)

| # | Armadilha | Por que dói | Antídoto |
|---|---|---|---|
| 1 | Fila e estado **só em memória** | Reiniciar/deploy apaga fila, chaves de idempotência e retry [BASE: message-store, channel/implementations] | Persistir em Postgres; critério "sobrevive a reinício". |
| 2 | Retry **sem espera** (padrão da base) ou com espera demais | Martela o fornecedor; trava linhas de execução [BASE: classes] | Backoff exponencial com teto e tentativas máximas. |
| 3 | Repetir ação **não idempotente** (enviar mensagem, criar cobrança) | Cliente recebe 2 cobranças | Chave de idempotência; falha ambígua vai para "a conferir". |
| 4 | Confiar na **ordem** e na **unicidade** do webhook | Chega duplicado, atrasado ou nunca | Idempotência, máquina de estados, conciliação por consulta. |
| 5 | Responder o webhook **só depois de processar tudo** | Timeout, o fornecedor reenvia ou suspende o envio [CONFIRMAR] | Gravar bruto, responder, processar depois. |
| 6 | Erro **assíncrono some** | Exceção em fila/poller não volta a ninguém [BASE: error-handling] | `errorChannel` com assinante real, dead letter e alerta. |
| 7 | Canal de erro sem assinante | Mensagens engolidas (por isso a base passou a exigir assinante) | Manter `requireSubscribers` ativo e testar. |
| 8 | **Transação não cobre API externa** | Banco confirmou, WhatsApp falhou (ou o contrário) | Gravar intenção primeiro, efeito depois; estado "enviando"; reconciliar. |
| 9 | Poller sem proteção | Repete leitura, estoura limite, esgota linhas de execução [BASE: polling, taskscheduler] | `fixed-delay`/cron, metadata store, limite de mensagens por rodada, pular rodada quando o destino está fora. |
| 10 | Pollers com várias instâncias do sistema | Duas instâncias fazem o mesmo trabalho | Lock distribuído / loja atômica [BASE: distributed-locks]. |
| 11 | Persistir mensagem com cabeçalhos **não serializáveis** | Cabeçalhos somem ou o canal de resposta se perde [BASE: message-store] | Guardar só dados simples; converter cabeçalhos em texto. |
| 12 | Misturar **teste e produção** (chaves, endereços, banco) | Cobrança real no teste | Configuração por ambiente; teste de sanidade no início. |
| 13 | Segredo no código ou em log | Vazamento [BASE: devops doc_06125] | Cofre/variável; mascarar logs. |
| 14 | Token vence **em silêncio** | Integração para sem aviso | Data de validade + alerta antecipado + situação "Vencida" automática. |
| 15 | Renovar token em **loop** quando falha | Bloqueio da conta | Máximo de tentativas; "Com erro" e aviso humano. |
| 16 | WhatsApp: **volume alto de uma vez** | Bloqueio do número (risco já anotado no protótipo) | Limites baixos, rampa gradual, modo sombra primeiro. |
| 17 | Limites checados só **ao enfileirar** | Fila vira rajada na hora de enviar | Checar de novo no envio; um único consumidor por número. |
| 18 | Pausa do robô que **não vale** para o que já está na fila | Cobra quem já pagou/prometeu | Checar pausas e pagamento **no momento do envio**. |
| 19 | Aprovação que **fura** limite/horário | Regra de aprovação vira atalho | Aprovado entra na mesma fila com os mesmos portões. |
| 20 | Dado do marketplace gravado "do jeito do fornecedor" | Quatro modelos diferentes espalhados | Um modelo interno (canônico) + guardar o bruto. |
| 21 | Acoplar o negócio ao fornecedor (Asaas/Inter, WhatsGW) | Trocar vira reescrever | Interface própria + adapter por fornecedor [BASE: gateway/adapter]. |
| 22 | Alerta demais ou de menos | Ninguém olha / ninguém sabe | Poucos alertas, com ação clara, para quem pode agir. |
| 23 | Usar a "base de teste" só no final | Primeira conversa real com o externo é em produção [BASE: devops doc_06339] | Teste de integração real e modo sombra cedo. |
| 24 | Pedido de melhoria pendurado no item antigo | Escopo estoura (regra do `base-po.md`) | Item novo. |
| 25 | Control bus/comando de gestão sem proteção | Qualquer um liga/desliga integração [BASE: control-bus] | Proteger com autorização e auditar. |

---

## 8. Perguntas-guia para o P.O. montar um plano de integração

1. Que **evento de negócio** esta integração serve (pagou, venceu, autorizou, respondeu)?
2. Quem **começa** a conversa: o outro sistema (evento) ou nós (consulta)?
3. O que acontece se a mensagem chegar **duas vezes**? E **nunca**? E **fora de ordem**?
4. O que acontece se o outro sistema ficar **fora do ar por 1 hora/1 dia**?
5. Quem é **avisado** e **como** em cada falha? Quem **resolve**?
6. Como a pessoa vê o que deu errado e **refaz** sem pedir ao time técnico?
7. Qual o **limite** do fornecedor e qual o **limite nosso** (mais baixo, por segurança)?
8. Como testamos **sem mexer em dinheiro real nem em cliente real**? Qual o critério para sair do modo sombra?
9. Onde ficam os **segredos** e quem os troca?
10. Qual o **plano de volta** se o deploy der errado?
11. Que **indicador** prova que a integração entregou valor (ex.: % de Pix baixados sozinho, tempo da baixa, % de mensagens aprovadas sem edição, dias de token vencido = 0)?

---

## 9. Não coberto pela base (confirmar fora, antes de planejar prazo)

Pesquisa feita na base inteira (todas as categorias) por: asaas, pix, banco inter, whatsgw, whatsapp, shopee, shein, kwai, mercado livre, oauth, bearer/access token. Resultado:

| Tema | O que a base tem | Situação |
|---|---|---|
| **Asaas** | Nada. Os 6 arquivos com "asaas" são ruído de OCR (palavras como "baseasaas..."), em `desenvolvimento-agil` e `carreira-e-habilidades`. | **Não coberto.** |
| **Banco Inter** | Nada. | **Não coberto.** |
| **Pix** (regras, cobrança com vencimento, juros e multa, webhook) | Só ruído. | **Não coberto.** O desenho da seção 3.2 usa só padrões genéricos de webhook/idempotência da base. |
| **WhatsGW / WhatsApp** | Nenhum material sobre WhatsGW. Há menções a WhatsApp/Twilio em `arquitetura-de-software` (livros gerais), não aprofundadas aqui. | **Não coberto.** Limites reais e política de bloqueio têm de vir do fornecedor e da política do WhatsApp. |
| **Shein, Shopee** | Nada. | **Não coberto.** |
| **Mercado Livre, Kwai** | Só menções soltas em livros de carreira / ruído. | **Não coberto** (como API). |
| **OAuth, token de acesso, refresh token, escopos** | Nenhuma ocorrência na base de integrações. A base de segurança (outra categoria) pode ter conceitos, mas não foi lida nesta parte. | **Não coberto.** |
| **Assinatura de webhook (HMAC)** | Nada específico. | **Não coberto.** |
| **Dead letter como componente** | Só como conceito de broker (Kafka, JMS/AMQP). No Spring Integration o equivalente é o recuperador de retry + `errorChannel`. | Parcial. |
| **Observabilidade/alertas** | Só métricas Micrometer, message history e log. Alertas são de ferramenta de monitoramento (outra escolha). Em `devops` há livros de Jenkins, Docker, Kubernetes, AWS, Humble, sem foco em alertas de integração. | Parcial. |
| **Segredos/cofre** | Só a regra geral "não guarde senhas no controle de versões" (livro Entrega Contínua, p. 72). | Parcial. |
| **Supabase/Postgres como fila** | A base mostra JDBC message store/metadata store/lock registry (aplicável a Postgres). Nada sobre Supabase em si. | Parcial. |

**O que levantar com o dono/fornecedores (lista de perguntas externas):**
- Para cada marketplace: tipo de autorização, validade real do token e do token de renovação, limites de chamadas, ambiente de teste, aprovação de aplicativo, eventos/avisos disponíveis, quem pode autorizar (ex.: só administrador da conta no ML, como no protótipo).
- Asaas e Banco Inter: eventos de aviso, formato de segurança do webhook, política de reenvio/pausa, ambiente de teste, juros/multa (quem calcula), tarifas, conciliação por consulta, limite de chamadas.
- WhatsGW: limites, estado de conexão (consulta ou aviso), recebimento de respostas, política de bloqueio, formato de mensagem com link/Pix, custo, estabilidade e plano B.
- Jurídico/LGPD: base legal da cobrança por WhatsApp, descadastro, retenção de conversas.

---

## 10. Tabela de fontes (caminhos)

Raiz: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`. Somente leitura. Na categoria `integracoes`, os documentos vêm de `spring-integration-main.zip`; o arquivo real é `integracoes/documentos/integracoes__doc_NNNNN.md`; o título original é a linha `source_title` do cabeçalho. Em `integracoes` **não existe** pasta `livros/`; `indice.md` lista tudo (≈5.013 documentos; 11 mil contando os chunks).

### 10.1 Documentação de referência Spring Integration (`integracoes/documentos/`)

| Assunto | Arquivo (doc_NNNNN) | Página original (`src/reference/antora/modules/ROOT/pages/...`) |
|---|---|---|
| Visão geral, filosofia (sem ESB central) | 04946 | `overview.adoc` |
| Mensagem e cabeçalhos | 04938 | `message.adoc` |
| Canais (visão) e implementações | 04783, 04777 | `channel.adoc`, `channel/implementations.adoc` |
| Canais especiais, configuração, interceptors, wire tap | 04780, 04776, 04778 | `channel/special-channels.adoc`, `channel/configuration.adoc`, `channel/interceptors.adoc` |
| Endpoints (polling x evento, poller) | 04827 | `endpoint.adoc` |
| Polling consumer, pular poll, ack adiado | 04947 | `polling-consumer.adoc` |
| Task scheduler (starvation) | 04791 | `configuration/namespace-taskscheduler.adoc` |
| Channel adapter | 04782 | `channel-adapter.adoc` |
| Gateway de mensagens e erro | 04855 | `gateway.adoc` |
| Service activator | 04970 | `service-activator.adoc` |
| HTTP entrada (webhook) | 04879 | `http/inbound.adoc` |
| HTTP saída | 04883 | `http/outbound.adoc` |
| HTTP timeouts | 04886 | `http/timeout.adoc` |
| HTTP cabeçalhos | 04878 | `http/header-mapping.adoc` |
| Roteadores (visão, tipos, dinâmicos, routing slip) | 04960, 04958, 04957, 04962 | `router/overview.adoc`, `router/implementations.adoc`, `router/dynamic-routers.adoc`, `router/routing-slip.adoc` |
| Filtro | 04838 | `filter.adoc` |
| Transformador | 04995 | `transformer.adoc` |
| Enricher | 04794 | `content-enrichment.adoc` |
| Splitter, aggregator, scatter-gather, resequencer | 04988, 04728, 04967, 04952 | `splitter.adoc`, `aggregator.adoc`, `scatter-gather.adoc`, `resequencer.adoc` |
| Claim check | 04784 | `claim-check.adoc` |
| Delayer | 04798 | `delayer.adoc` |
| **Tratamento de erro** | **04828** | `error-handling.adoc` |
| **Retry, circuit breaker, rate limiter, cache, expression** | **04864** | `handler-advice/classes.adoc` |
| **Idempotent receiver** | **04868** | `handler-advice/idempotent-receiver.adoc` |
| Advice (visão, ordem, lock, transação, handle message, custom) | 04874, 04870, 04869, 04873, 04867, 04866 | `handler-advice.adoc`, `handler-advice/order.adoc`, `.../lock.adoc`, `.../tx-handle-message.adoc`, `.../handle-message.adoc`, `.../custom.adoc` |
| Message store, metadata store | 04936, 04940 | `message-store.adoc`, `meta-data-store.adoc` |
| JDBC (message store, metadata store, lock registry, gateway) | 04911, 04912, 04909, 04914 | `jdbc/message-store.adoc`, `jdbc/metadata-store.adoc`, `jdbc/lock-registry.adoc`, `jdbc/outbound-gateway.adoc` |
| Locks distribuídos | 04799 | `distributed-locks.adoc` |
| Transações | 04994 | `transactions.adoc` |
| Message history, métricas, control bus | 04933, 04941, 04795 | `message-history.adoc`, `metrics.adoc`, `control-bus.adoc` |
| Segurança | 04969 | `security.adoc` |
| Desligamento ordenado | 04985 | `shutdown.adoc` |
| Testes | 04993 | `testing.adoc` |
| Java DSL (fluxos, pollers, wire tap) | 04808, 04815, 04823 | `dsl/java-flows.adoc`, `dsl/java-pollers.adoc`, `dsl/java-wiretap.adoc` |
| Mudanças 6.5 -> 7.0 (retry vira do Spring Framework) | 04774 | `changes-6.5-7.0.adoc` |

### 10.2 Código e testes de apoio (`integracoes/documentos/`)

| Assunto | doc | Caminho original (`spring-integration-main/...`) |
|---|---|---|
| Retry advice | 00698 | `spring-integration-core/src/main/java/.../handler/advice/RequestHandlerRetryAdvice.java` |
| Circuit breaker | 00697 | `.../handler/advice/RequestHandlerCircuitBreakerAdvice.java` |
| Rate limiter (e teste) | 00695, 01599 | `.../advice/RateLimiterRequestHandlerAdvice.java`, `.../test/.../advice/RateLimiterRequestHandlerAdviceTests.java` |
| Recuperador de erro | 00688 | `.../advice/ErrorMessageSendingRecoverer.java` |
| Seletor de idempotência | 00814 | `.../selector/MetadataStoreSelector.java` |
| Teste de idempotência (Hazelcast) | 02338 | `spring-integration-hazelcast/src/test/.../IdempotentReceiverIntegrationTests.java` |
| Roteador por tipo de erro | 00793 | `.../router/ErrorMessageExceptionTypeRouter.java` |
| Pular poll | 00809 | `.../scheduling/PollSkipAdvice.java` |
| Delay | 00703 | `.../handler/DelayHandler.java` |
| HTTP entrada / saída | 02406, 02421, 02420 | `spring-integration-http/src/main/java/.../inbound/HttpRequestHandlingMessagingGateway.java`, `.../outbound/HttpRequestExecutingMessageHandler.java`, `.../AbstractHttpRequestExecutingMessageHandler.java` |
| Fila e metadados em JDBC | 02756, 02734 | `spring-integration-jdbc/.../store/JdbcChannelMessageStore.java`, `.../metadata/JdbcMetadataStore.java` |
| Mocks para teste | 04212, 04213 | `spring-integration-test/.../mock/MockIntegration.java`, `MockMessageHandler.java` |
| Fluxo em Java | 00563 | `.../dsl/IntegrationFlow.java` |
| CI (exemplo de pipeline com matriz de versões, concorrência, avisos por webhook de chat com segredo) | 00016, 00012, 00013, 00015 | `.github/workflows/ci.yml`, `announce-milestone-planning.yml`, `auto-cherry-pick.yml`, `ci-snapshot.yml` |

(Os "webhook" que aparecem na base de integrações são só os avisos de chat dos fluxos de CI do próprio projeto Spring, com o endereço guardado como **segredo** do GitHub: bom exemplo de como não deixar segredo no arquivo.)

### 10.3 DevOps (`devops/documentos/devops__doc_NNNNN.md`; são páginas de livros em PDF com OCR, confira nomes e números)

Aviso: a categoria `devops` é de **livros** (AWS, Docker, Kubernetes, Jenkins, Entrega Contínua). A pasta `livros/` citada no índice **não existe** no clone; o texto está em `documentos/`. Não há conteúdo específico de integrações; o que serve:

| Assunto | doc | Livro / página |
|---|---|---|
| Segredos: "não guarde senhas no controle de versões"; configuração por ambiente | devops__doc_06125 | Entrega Contínua (Humble), p. 72 |
| Testar integração com sistemas externos antes da entrega; azul-verde, canário, smoke test | devops__doc_06339 | Entrega Contínua, p. 286 |
| Reverter implantação e dados (rollback sem perda de dados) | devops__doc_06411 | Entrega Contínua, p. 358 |
| Stubs/dublês para substituir sistema externo e fila de mensagens | devops__doc_06261 (e 06262, 06263) | Entrega Contínua, p. 208-210 |
| Gerência de mudança e operação | devops__doc_06360 | Entrega Contínua, p. 307 |
| Ambientes de homologação (staging) e integração com sistemas externos | devops__doc_05377 | Continuous Delivery (inglês), p. 292 |
| Canary releasing | devops__doc_05382, 05383 | Continuous Delivery (inglês), p. 297-298 |

### 10.4 Do próprio projeto (não é a base)

| Arquivo | Uso |
|---|---|
| `/home/user/MK/CLAUDE.md` | Regras de layout, visão única, identidade visual. |
| `/home/user/MK/docs/base-po.md` | Modelo de plano e de item (seção 10). |
| `/home/user/MK/prototipo/js/marketplaces.js` | Situações e validade das conexões de marketplace. |
| `/home/user/MK/prototipo/js/robo.js` | Robô, fila de aprovação, limites, pausas, modo sombra, alerta de desconexão. |
| `/home/user/MK/prototipo/js/recebimentos.js` | Pix automático, divergentes, conferência. |

---

## 11. Limites desta pesquisa (o que NÃO foi verificado)

- Li com profundidade as páginas de referência listadas na seção 10.1 (erro, retry/advice, idempotência, canais, endpoint/polling, gateway, HTTP, message/metadata store, transações, testes, segurança, desligamento, delayer, claim check, locks, métricas, control bus). Os **módulos de protocolo** (AMQP, Kafka, JMS, FTP, MongoDB, Redis, XMPP, etc.) foram **só mapeados** (existência e tema), não lidos a fundo: não servem diretamente ao IT.MK.
- Não li os ~3.000 arquivos de código e testes um a um; usei busca por termo (webhook, retry, idempotent, dead letter, rate limit, circuit, backoff, oauth, token) e abri os pontos centrais.
- Os livros de `devops` estão em OCR com qualidade média; consulte o número da página original ao citar.
- As versões descritas são as da documentação do Spring Integration incluída (séries 7.x). Compatibilidade com o Java/Spring Boot do IT.MK **não foi checada**.
- Tudo marcado [CONFIRMAR] é conhecimento geral e **não deve virar critério de aceite sem checar** na documentação oficial do fornecedor.
- Os valores do protótipo (validades, limites do robô, horários) são **premissas do desenho**, não fatos verificados dos fornecedores.
