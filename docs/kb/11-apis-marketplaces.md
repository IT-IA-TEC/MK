# 11 · APIs oficiais dos marketplaces (Shein, Mercado Livre, Shopee e Kwai)

Manual de consulta para o P.O. do IT.MK. Consultado em **01/10/2026**. Escrito em português simples.
Serve de base para os itens de Integrações (conectores) do backlog. Hoje tudo no IT.MK é manual. Os conectores virão depois.

## Como ler este manual

| Selo | O que quer dizer |
|---|---|
| **API** | A API oficial entrega o dado. Pode virar campo automático. |
| **Parcial** | A API entrega parte do dado, ou só em alguns casos, ou o sistema precisa calcular. |
| **Calculado** | A API não tem o número pronto, mas dá para somar ou contar a partir de outros dados. |
| **Manual** | Não achei na documentação oficial. Continua preenchido à mão. |
| **Não confirmado** | Não consegui ler a fonte oficial, ou ela não diz. Não vale como regra. |

Como cada fonte foi lida (importante para confiar no que está escrito):
- **Leitura direta**: li a página oficial inteira. Mercado Livre e Shopee entram aqui.
- **Resumo de buscador**: a página oficial da Shein só abre com login/JavaScript. Usei o resumo que o buscador faz dessas páginas. É oficial na origem, mas deve ser reconferido ao abrir a conta de desenvolvedor.
- **Kwai**: não achei documentação oficial aberta para vendedor do Brasil. Quase tudo ficou **Não confirmado**.

Nada neste manual é endpoint inventado. Onde o caminho veio só de resumo, está escrito.

---

## 1. Resumo para decidir (leia primeiro)

1. **Shopee** é a mais fácil e a mais bem documentada. Tem tipo "ERP System", autorização por link, validade de até 365 dias, avisos de vencimento e quase todos os campos da ficha pela API.
2. **Mercado Livre** também é bem documentado. Só pode ter **1 aplicativo por conta no Brasil**. O vendedor precisa autorizar com a conta **administradora** (conta de operador dá erro).
3. **Shein** tem API oficial para pedidos, produtos, devoluções e avisos (webhooks). Mas **não achei** na documentação: desempenho (DSR), violações, penalidades e diagnóstico. Esses ficam **Manual**.
4. **Kwai**: sem documentação oficial acessível. Não dá para prometer conector. Primeiro é preciso pedir acesso ao gerente da conta Kwai.
5. Só a **Shopee** e o **Mercado Livre** passam o dado de **violações** de forma clara (Shopee: pontos e punições; Mercado Livre: infrações de anúncios).
6. **Prazos do protótipo**: Shopee confere (e a Shopee também aceita 7 dias e data livre). Mercado Livre confere, com um detalhe (6 meses é o prazo do "refresh token"). Shein confere. **Kwai 365 dias: não confirmado.**
7. Os números de **limite de chamadas** não estão publicados (Mercado Livre e Shopee) ou só aparecem por endpoint (Shein). Não prometa número ao cliente.
8. **Regra de ouro**: o conector só lê o que o vendedor autorizou. Segredos nunca aparecem na tela (já é assim no protótipo).

---

## 2. O que corrigir no protótipo (diferenças achadas)

| # | Onde no protótipo | O que está | O que a fonte oficial diz | Ação sugerida |
|---|---|---|---|---|
| 1 | Validade Shopee (7/30/90/180/365) | Escolhas 30, 90, 180, 365 no cadastro de exemplo | Vendedor escolhe 7, 30, 90, 180 ou 365 dias, **ou uma data livre até 365 dias**. | Aceitar também 7 e data livre. Quando houver conector, ler `expire_time` da API (não calcular). |
| 2 | Validade Mercado Livre (6 meses) | 6 meses | Confere para o **refresh token** (6 meses). O token de acesso dura **6 horas**. Também cai se ficar **4 meses sem chamada**, se o vendedor trocar a senha ou revogar. | Manter 6 meses. Acrescentar os motivos de queda como "Com erro". |
| 3 | Validade Kwai (365 dias) | 365 dias | **Não confirmado.** Não achei a fonte oficial do Kwai Brasil. | Marcar como "a confirmar" na tela. Não calcular "Vencida" até confirmar. |
| 4 | Validade Shein (sem validade fixa) | Sem validade fixa | Confere. O `openKeyId` hoje não vence. A autorização cai se o vendedor cancelar. Se ele reautorizar, a chave secreta muda. | Manter. Tratar "chave secreta trocada" como "Com erro". |
| 5 | Permissões do Mercado Livre | Pedidos, Reclamações, Promoções, Faturamento, Métricas | Os nomes oficiais são: **Usuários (padrão), Publicação e sincronização, Comunicação pré e pós-venda, Publicidade, Métricas do negócio, Vendas e envios, Promoções/cupons/descontos, Faturamento.** | Trocar a lista. Faltam "Publicação e sincronização" (anúncios) e "Usuários" (reputação). Reclamações e devoluções ficam em "Comunicação pré e pós-venda" e também em "Vendas e envios". |
| 6 | Permissões do Kwai (`user_info`, `merchant_item`, `merchant_order`) | Três permissões | **Não confirmado** para o Kwai Brasil. | Marcar como "a confirmar". |
| 7 | Endereço de retorno | Guarda o endereço inteiro | **Shopee** só confere o **domínio** (teste e produção separados). **Mercado Livre** exige endereço **igual ao cadastrado, em HTTPS, sem parte variável**. | Validar por plataforma. Usar o campo `state` para dados variáveis. |
| 8 | IPs do Mercado Livre (vazio) | Vazio | A lista de IPs do aplicativo só existe para integradores **liberados pelo Mercado Livre**. | Manter vazio. Anotar "não disponível sem liberação". |
| 9 | IPs da Shein "obrigatório em produção" | Obrigatório | **Não confirmado.** Não achei regra de IP na Shein. | Tirar a palavra "obrigatório" ou marcar "a confirmar". |
| 10 | IPs da Shopee | Campo existe | **Obrigatório para todos.** Sem declarar IP, dados do comprador vêm mascarados e, com a lista ligada, só os IPs declarados chamam a API. | Manter. Marcar como obrigatório. |
| 11 | Tipo de app da Shopee "sempre ERP" | Sempre ERP | ERP vale para **empresa de software (ISV)**. Vendedor com app próprio usa "Seller In-house System". | Deixar ERP (IT.MK atende vários vendedores). Anotar a regra. |
| 12 | Shein "Tipo de app" (auto-operada, semi, full) | Está no aplicativo | Auto-operada, semi e full-gerenciada são o **modelo da loja**, não do aplicativo. A API de detalhe de pedido atende auto-operada e semi-gerenciada. | Guardar o modelo na **loja/conexão** (já existe em Conexões). No aplicativo, mostrar só as "soluções" usadas. |
| 13 | Shein "A cota de SKC renova todo mês" | Renova todo mês | **Não confirmado.** A fonte só diz que a cota é por SKC e que auto-operada e semi precisam dela. | Trocar o aviso por "cota por SKC". |
| 14 | Shopee "não tem recurso" | Sem recurso | O recurso existe no Seller Center. A API mostra o efeito (pontos originais x atuais). Não achei endpoint para pedir recurso. | Manter o texto. Acrescentar "efeito aparece como pontos ajustados". |
| 15 | Mercado Livre "Faixa Mercado Líder" | MercadoLíder, Gold, Platinum | A API devolve a medalha **Silver, Gold ou Platinum**. | Conferir se "MercadoLíder" equivale a Silver. |
| 16 | Mercado Livre cor da reputação | 4 cores | A API devolve `level_id` com número e cor (ex.: `5_green`). A lista completa de níveis não apareceu na página lida. | Conferir se há mais de 4 níveis antes de ligar o conector. |
| 17 | Kwai "não existem taxas e comissões" | Sem taxas | **Não confirmado** em fonte oficial. | Marcar "a confirmar". |
| 18 | Shopee "Limites por categoria" | Texto livre | A API `get_item_limit` devolve **regras da categoria** (preço, estoque, tamanho do título, fotos). Não é "quanto ainda posso publicar". | Renomear para "regras de publicação da categoria". |

---

## 3. Comparação rápida das quatro plataformas

| Item | Shein | Mercado Livre | Shopee | Kwai |
|---|---|---|---|---|
| Portal | open.sheincorp.com | developers.mercadolivre.com.br | open.shopee.com (Brasil: open.shopee.com.br) | Não confirmado |
| Quem cria o app | Conta de desenvolvedor aprovada | Dono da conta (de preferência empresa) | Conta de desenvolvedor aprovada | Não confirmado |
| Aprovação | Sim: conta, depois aplicativo | Não há análise para começar. Certificação é opcional | Sim: conta (3 a 10 dias úteis) e depois "Go Live" (24 h) | Não confirmado |
| Limite de apps | Não confirmado | **1 app por conta no Brasil** | Até 10 apps. Lojas por app sem limite | Não confirmado |
| Tipo de app | Não confirmado (existem "soluções") | Não existe tipo. Existem permissões | ERP System, Product Management, Order Management, Accounting and Finance, Marketing, Customer Service, Seller In-house System | Não confirmado |
| Como o vendedor autoriza | Vendedor entra e confirma. A Shein devolve um código temporário (5 min) | Link de autorização. Precisa ser conta **administradora** | Link de autorização gerado pelo desenvolvedor. Vendedor confirma por SMS | Não confirmado |
| Token | `openKeyId` + chave secreta. Sem validade fixa | Token de acesso 6 h. Refresh token 6 meses, uso único | Token de acesso 4 h. Refresh token 30 dias, uso único. Autorização até 365 dias | Não confirmado |
| Endereço de retorno | Não confirmado | Obrigatório, HTTPS, igual ao cadastrado | Teste e produção, só o domínio é conferido | Não confirmado |
| Lista de IPs | Não confirmado | Só integrador liberado | **Obrigatória** | Não confirmado |
| Assinatura | Sim: HMAC-SHA256 por chamada | Não. Usa token no cabeçalho | Sim: HMAC-SHA256 por chamada | Não confirmado |
| Limite de chamadas | Por endpoint (ex.: 300/s em detalhe de pedido) | Existe (erro 429). Número não publicado | Existe (erros próprios). Número não publicado | Não confirmado |
| Avisos (webhooks) | Sim (assinados) | Sim (tópicos) | Sim (Push, por códigos) | Não confirmado |

---

## 4. SHEIN

Fonte: portal open.sheincorp.com (abre só com JavaScript/login), SDK e ferramenta de linha de comando oficiais no GitHub (sheinsight), e resumos de buscador das páginas oficiais. Os pontos marcados "(resumo)" devem ser reconferidos.

### 4.1 Como criar o aplicativo e ser aprovado
O portal descreve 5 passos: (1) pedir a conta de desenvolvedor, (2) criar o aplicativo, (3) análise do aplicativo, (4) integração da autorização, (5) integração das soluções.
- **Soluções de negócio** listadas no portal: Gestão de Produtos; Pedidos cumpridos pela SHEIN (agendamento e etiqueta); Pedidos cumpridos pelo vendedor (código de rastreio e status); Pedidos de reposição de estoque.
- Documentos obrigatórios citados: Termo de Uso do Desenvolvedor, Política de Privacidade e **Contrato de Autorização do Vendedor**.
- Contato oficial: openapi@shein.com.
- Prazo de análise, exigências da empresa e tipo de aplicativo: **Não confirmado**.
- Ferramentas para testar: o portal tem **lojas de teste** e ferramentas de dados de teste (pedido e produto). Há uma ferramenta de linha de comando oficial (`shein-open-cli`, Node 20 ou mais).

### 4.2 Tipo de aplicativo e modelo da loja
- A Shein usa o modelo da **loja**: auto-operada, semi-gerenciada e full-gerenciada.
- A API de **detalhe de pedido** (`POST /open-api/order/order-detail`) atende **auto-operada e semi-gerenciada** (resumo).
- Para full-gerenciada existem as APIs de **pedido de compra/reposição** (`purchase`). Pedidos do consumidor final ficam com a Shein (resumo).
- Publicar produto exige **cota de SKC** para auto-operada e semi-gerenciada (resumo, "a partir de agosto de 2026").

### 4.3 Fluxo de autorização do vendedor
1. O vendedor entra com a conta Shein e confirma a autorização no aplicativo.
2. A Shein devolve um **código temporário (`tempToken`)**. Ele vale **5 minutos** (resumo).
3. O servidor troca o código por credenciais: `POST /open-api/auth/get-by-token`.
4. Resposta: `secretKey` (vem **criptografada**; é preciso abrir com a chave do aplicativo), `openKeyId`, `appid`, `supplierId`, `supplierSource`.
5. Essa chamada é assinada com a chave **do aplicativo** (AppId e AppSecretKey), porque ainda não existem as chaves do vendedor.
- Como o vendedor recebe o link de autorização e o endereço de retorno: **Não confirmado** (parte do "Manual de autorização da loja", que exige login).

### 4.4 Tokens, validade e renovação
- `openKeyId` hoje é **permanente**. Na reautorização ele **não muda**, mas a **chave secreta muda** (resumo).
- Se o vendedor **cancela** a autorização, a chave **expira na hora**.
- Se o vendedor reinicia a chave, quem usa a chave antiga recebe erro de assinatura.
- **Conclusão para o protótipo**: "Sem validade fixa" está certo. Não existe renovação periódica. O risco é a chave ser cancelada ou trocada.

### 4.5 Endereços de retorno (teste e produção)
- Endereços da API: `https://openapi.sheincorp.com` (global) e `https://openapi.sheincorp.cn`.
- Usar a chave de produção com o endereço de teste dá erro de assinatura.
- Endereço de retorno da autorização e ambiente de teste do vendedor: **Não confirmado**. (O código do portal cita `openapi-test01.sheincorp.cn`, mas não está documentado. Não usar.)

### 4.6 Lista de IPs
**Não confirmado.** Não achei regra de IP na Shein. Não afirme "obrigatório".

### 4.7 Assinatura das chamadas
- Cabeçalhos: `x-lt-openKeyId`, `x-lt-timestamp` (milissegundos, vale 5 minutos), `x-lt-signature`, `language` (aceita `pt-br`) e `Content-Type`. Na troca do código usa `x-lt-appid`.
- Montagem do texto a assinar: `OpenKeyId & Timestamp & Caminho` (resumo). Cálculo com HMAC-SHA256 e texto em hexadecimal.
- Há uma "chave aleatória" de 5 caracteres. O passo 3 e o formato final **não ficaram claros** no resumo.
- **Recomendação**: usar o **SDK Java oficial** (`io.github.sheinsight:shein-open-sdk`, versão 0.0.2, licença Apache 2.0). Ele já assina, troca o código e abre a chave secreta e os avisos. Combina com Java + Spring.

### 4.8 Limites de chamadas
Cada endpoint informa seu limite por desenvolvedor (resumo):

| Endpoint | Limite |
|---|---|
| Detalhe de pedido | 300 por segundo |
| Pedido de compra | 50 |
| Informação básica de envio | 50 |
| Devolução de compra (`purchase/return-disposals`) | 50 |
| Enviar rastreio | 100 |
| Depósito (`shipping/warehouse`) | 20 |

Limite geral do aplicativo: **Não confirmado**.

### 4.9 Avisos (webhooks)
- A Shein envia a mudança para o seu endereço. O conteúdo vem **criptografado** em `eventData`.
- Cabeçalhos: `x-lt-openKeyId`, `x-lt-eventCode`, `x-lt-appid`, `x-lt-timestamp`, `x-lt-signature`.
- A assinatura do aviso usa **AppId e AppSecretKey**, não a chave do vendedor.
- O seu endereço deve responder em **1,5 segundo** com código 2xx.
- Reenvio: mensagens que não são de pedido, **1 vez**. Eventos de pedido, **2 vezes**.
- Eventos listados: recebimento de produto, revisão de produto, preço, cota de produto, publicação e retirada, sincronização de pedido, **sincronização de devolução**, nota fiscal, pedido de compra, mudança de entrega, status de devolução de compra.

### 4.10 Endpoints por assunto

| Assunto | Endpoint / fonte | Observação |
|---|---|---|
| Troca de código | `POST /open-api/auth/get-by-token` | Confirmado (SDK e resumo) |
| Pedidos (lista) | `/open-api/order/order-list` | Confirmado (documentação da ferramenta oficial). Páginas de até 200 itens (resumo) |
| Pedido (detalhe) | `POST /open-api/order/order-detail` | Auto-operada e semi. Horário em Pequim (UTC+8) |
| Pedido de compra (full) | "Obtain purchase order information" | Caminho exato não confirmado |
| Produtos (lista) | `POST /open-api/openapi-business-backend/product/query` | Só produtos **aprovados**. Até 50.000 por consulta. Não há API para produtos em revisão ou reprovados |
| Produto (detalhe) | "Query product detail by SPU/SKU (new)" | Caminho exato não confirmado |
| Limite (cota) | `/open-api/goods-publish-quotas/detail` e `/open-api/goods/query-shelf-quota` | Caminhos vindos de resumo |
| Pode publicar? | `/open-api/goods/product/check-publish-permission` | Resumo |
| Violações / penalidades | **Não achei** | Manual |
| Devoluções | Lista, detalhe e recebimento de devolução (`/return-order/list`, `/return-order/details`, `/return-order/sign-return-order`) | Prefixo do caminho não confirmado |
| Desempenho / reputação / DSR | **Não achei** | Manual |
| Financeiro | Detalhe de pedido traz `commissionRate`, `commission`, `serviceCharge`, `performanceServiceCharge`, `estimatedIncome` | São valores **estimados**. Extrato de repasse: **Não confirmado** |
| Notas fiscais | `/order/sync-invoice-info` (enviar nota), `export-address` (Brasil), aviso `invoice_status_notice` | Resumo. Há tratamento específico para o Brasil |

### 4.11 Regras da Shein para o IT.MK
- Guardar por loja: `openKeyId`, chave secreta (aberta), `supplierId` e o **modelo da loja**.
- O código temporário vale 5 minutos. A tela deve concluir a troca sem demora.
- Não prometer desempenho, violações e diagnóstico por API.
- Reautorização do vendedor muda a chave secreta. Deixar a conexão "Com erro" até regravar.

---

## 5. MERCADO LIVRE

Fonte: developers.mercadolivre.com.br (leitura direta, páginas com data de atualização entre 12/2025 e 09/2026).

### 5.1 Como criar o aplicativo e ser aprovado
- Entrar no **DevCenter**, "Criar uma aplicação" e preencher os dados. Recebe na hora o **Client_ID** e a **Secret_Key**.
- Dados pedidos: nome único, nome curto, descrição (até **150 caracteres**), logo, **endereços de retorno** (HTTPS), PKCE (opcional, recomendado), escopos e tópicos de aviso.
- **No Brasil só é permitido 1 aplicação por conta**, depois que os dados do titular forem validados. Use a conta da **empresa dona da solução**, de preferência pessoa jurídica.
- Não há análise para começar a usar. Existe o **Developer Partner Program** (certificação, opcional). Para entrar: faturamento mensal dos vendedores de pelo menos **US$ 2,5 milhões no Brasil**, aprovação de **65% ou mais** na avaliação de segurança e iniciativas acompanhadas por um especialista da plataforma.
- O aplicativo pode ser **bloqueado** (motivos: dados da conta, termos, chamadas em excesso, tráfego de dados). O vendedor também perde a integração. Retorna erro 401 `unauthorized_scopes`.
- **Segredo do aplicativo**: pode ser renovado agora ou programado (até 7 dias). Na renovação programada existem dois segredos válidos até a data.

### 5.2 Tipo de aplicativo
Não existe "tipo". O que existe são **permissões funcionais** e escopos:
- Escopos: **Leitura** (GET) e **Escrita** (PUT, POST, DELETE).
- Permissões: Usuários (padrão), Publicação e sincronização, Comunicação pré e pós-venda (perguntas, mensagens, reclamações, devoluções), Publicidade, Métricas do negócio, Vendas e envios (pedidos, envios, reclamações, devoluções), Promoções/cupons/descontos, Faturamento (faturas e cobranças).
- Falta de permissão devolve erro 403 `PA_UNAUTHORIZED_RESULT_FROM_POLICIES`.
- Para o IT.MK (só leitura), pedir **Leitura** e as permissões: Usuários, Publicação e sincronização, Comunicação pré e pós-venda, Vendas e envios, Métricas do negócio, Promoções, Faturamento. Para trabalhar sem o vendedor online, o escopo `offline_access` é necessário (é ele que entrega o refresh token).

### 5.3 Fluxo de autorização do vendedor
1. O IT.MK monta o link: `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=APP_ID&redirect_uri=URL&state=ALEATORIO` (e `code_challenge` se o PKCE estiver ligado).
2. O vendedor entra no Mercado Livre e autoriza. Precisa ser a conta **administradora**. Conta de operador ou colaborador dá o erro `invalid_operator_user_id`.
3. O Mercado Livre volta para o endereço de retorno com `code` e `state`. O Mercado Livre **não valida o `state`**. Quem confere é o IT.MK.
4. O IT.MK troca o `code` por token em `POST https://api.mercadolibre.com/oauth/token` (`grant_type=authorization_code`).
5. Mensagem "o aplicativo não pode conectar à sua conta": confira endereço de retorno, conta principal, dados pendentes ou conta inabilitada.

### 5.4 Tokens, validade e renovação

| Item | Valor | Fonte |
|---|---|---|
| Token de acesso | **6 horas** (`expires_in` 21600) | Leitura direta |
| Refresh token | **6 meses** | Leitura direta |
| Uso do refresh token | **Uso único.** Cada renovação devolve um novo. Só vale o **último** | Leitura direta |
| Cai antes do prazo | Troca de senha, troca do segredo do aplicativo, revogação, **4 meses sem nenhuma chamada** | Leitura direta |
| Se o refresh vence | O vendedor precisa autorizar de novo | Leitura direta |

- Renovar o token **só quando ele vencer** (recomendação oficial).
- A página não diz se os 6 meses recomeçam a cada renovação. **Não confirmado.** Assuma que **não** recomeçam, até testar.
- **Conclusão para o protótipo**: "6 meses" confere para o refresh token. A data de validade da conexão deve ser tratada como "pior caso".

### 5.5 Endereços de retorno
- Um só cadastro no aplicativo, em HTTPS. Não existe ambiente de teste separado como na Shopee. Usa-se um **usuário de teste**.
- Deve ser **idêntico** ao enviado no link. Não pode ter parte variável. Use `state` para levar dados.

### 5.6 Lista de IPs
- Gerenciar IPs permitidos do aplicativo existe, mas **só para integradores liberados** (lista restrita). Aceita IPv4 e IPv6 em formato CIDR, com carga por CSV.
- Para **receber avisos**, o Mercado Livre publica uma lista de **92 IPs** de origem (na página de notificações). Libere no firewall se houver filtro.

### 5.7 Assinatura das requisições
Não há assinatura. O token vai no cabeçalho: `Authorization: Bearer TOKEN`. Tudo em `https://api.mercadolibre.com`.

### 5.8 Limites de chamadas
- Erro `429 local_rate_limited` quando passa do limite. O controle é por **aplicativo (Client ID) e por endpoint**.
- **O número não está publicado.** Aumento só pelo time comercial de integrações, com prova de uso.
- Boas práticas oficiais: pausa crescente com variação (backoff com jitter), poucas chamadas ao mesmo tempo, usar a varredura (`scroll_id`) até o fim.
- Excesso de erros 400 não previstos pode **bloquear o aplicativo** (`EXCESSIVE_API_CALL`).

### 5.9 Avisos (webhooks)
- Escolhidos no cadastro do aplicativo. O Mercado Livre envia um POST com `resource`, `topic`, `user_id`, `application_id`. O IT.MK faz depois um GET no recurso.
- Tópicos: `orders_v2`, `items`, `messages`, `questions`, `payments`, `shipments`, `promotions`, `price_suggestion`, `claims` e `claims_actions` (pós-compra), entre outros.
- **Responder 200 em até 500 ms**, senão o tópico pode ser **desativado** e os avisos do período se perdem.
- Reenvio por até 1 hora. A página fala em 5 tentativas (aviso de 2024) e, em outro trecho, na "oitava tentativa". **Confirmar.**
- Avisos perdidos: `GET /missed_feeds?app_id=...`, guarda **só 2 dias**.

### 5.10 Endpoints por assunto

| Assunto | Endpoint | Observação |
|---|---|---|
| Troca de token | `POST /oauth/token` | |
| Vendedor | `GET /users/{id}` | Traz a reputação (`seller_reputation`) |
| Pedidos | `GET /orders/search?seller={id}` e `GET /orders/{id}` | Filtros por status e datas. Traz `sale_fee` (comissão), pagamentos, envio |
| Anúncios (lista) | `GET /users/{id}/items/search` (filtro `status`, `search_type=scan` para mais de 1.000) | Total vem em `paging.total` |
| Anúncios (detalhe) | `GET /items/{id}` e `GET /items/bulk?ids=` | `/items?ids=` será desligado: migrar até **25/10/2026** |
| Limites de anúncios | `GET /users/{id}/available_listing_types` | `remaining_listings` (vazio = sem limite) |
| Qualidade do anúncio | `GET /item/{id}/performance` | Nota, nível (no Brasil: Básica, Satisfatória, Profissional) |
| Perda de exposição | `users/{id}/items/search?reputation_health_gauge=unhealthy` | também `warning` e `healthy` |
| Violações | `GET /moderations/infractions/{user_id}` e `GET /moderations/last_moderation/{id}` | Motivo e solução em texto. Não há "pontos" |
| Reclamações | `GET /post-purchase/v1/claims/search` e `.../claims/{id}` | Busca exige filtros (não passa de 10.000 resultados) |
| Devoluções | `GET /post-purchase/v2/claims/{id}/returns` | |
| Reputação | `GET /users/{id}` → `seller_reputation` | Cor, medalha, reclamações, cancelamentos, atraso |
| Custos | `GET /sites/MLB/listing_prices` | Calculadora de tarifa |
| Faturamento | `GET /billing/integration/monthly/periods` e `.../periods/key/{key}/summary/details` | Só para conciliação, uma consulta por dia por usuário |
| Notas fiscais | `GET /users/{id}/invoices/orders/{pedido}` e `.../invoices/sites/MLB/batch_request/period/AAAAMM` | Há também anexar e importar nota |
| Dados fiscais do comprador | `GET /orders/billing-info/MLB/{id}` | |

### 5.11 Regras do Mercado Livre para o IT.MK
- 1 aplicativo só. Use a conta da empresa. Guarde a Secret_Key como segredo.
- Registrar quem autorizou. Se não for administrador, a conexão fica "Com erro".
- Gravar o refresh token novo **a cada renovação**, no mesmo instante. Perder o último = pedir nova autorização.
- Avisar a conexão que ficou **4 meses sem chamada**: o sistema deve chamar a API ao menos uma vez por mês.
- Limites de reputação no Brasil (para o analista, não para a API): reclamações até 1% (líder), 2% (verde), 4,5% (amarelo), 8% (laranja); cancelamentos 0,5%, 1,5%, 3,5%, 4%; atraso no despacho 6%, 10%, 18%, 22%.

---

## 6. SHOPEE

Fonte: open.shopee.com (guias e referência de API lidos pela API pública do próprio portal, com data de atualização entre 2025 e 2026). Brasil: open.shopee.com.br.

### 6.1 Como criar o aplicativo e ser aprovado
**Etapa A: conta de desenvolvedor** (cadastro com e-mail; o e-mail não pode ser trocado depois).
- Tipos de conta: **Vendedor Individual** (fechado para o Brasil), **Vendedor Empresa registrada** e **Plataforma parceira de terceiros (ISV)**. No Brasil só valem Empresa registrada e ISV.
- Critérios do ISV: empresa registrada; **produto no ar** com integrações já existentes; endereço do produto em **HTTPS, TLS 1.2 ou mais, nota "A"** de segurança; conta de teste com todos os recursos liberados; sem práticas suspeitas.
- Critério do vendedor no Brasil: empresa registrada, com documentos válidos, **pelo menos 1 pedido nos últimos 30 dias**.
- Prazo de análise: vendedor **3 dias úteis**, ISV **10 dias úteis** (Indonésia 7 e 14).

**Etapa B: criar o aplicativo** (Console > Criar App). Recebe **Partner ID e Partner Key de teste**.
- A **categoria do app não muda depois**, e **não existem permissões extras**. A categoria define as APIs. Para outra categoria, cria-se outro app.
- Até **10 apps** por conta. Um app pode autorizar lojas de vários mercados e **sem limite de lojas**.

**Etapa C: "Go Live"** (publicar).
- Preencher: endereço do produto, usuário e senha de teste, descrição, imagem da tela, **domínio de retorno de teste e de produção**, **lista de IPs** e declaração de infraestrutura (banco de dados e outros servidores).
- Análise em **24 horas** (não dá para acelerar). Depois aparecem **Partner ID e Partner Key de produção**.
- Estados do app: Desenvolvendo, No ar, Novas autorizações restritas, Chamadas restritas, Suspenso. Suspenso **remove as autorizações existentes**.
- A **Partner Key pode expirar** (erro `error_partner_key_expired`) e pode ser reiniciada no Console. Periodicidade: **Não confirmado.**

### 6.2 Tipos de aplicativo
Tipos: **ERP System**, Product Management, Order Management, Accounting and Finance, Marketing, Customer Service, Seller In-house System.
- **ERP System**: empresa de software (ISV). Acessa **todas as APIs, menos Chat e Anúncios (Ads)**.
- **Seller In-house System**: vendedor com app próprio. Acessa tudo, inclusive Chat. É o único que tem botão "Authorize" no console.
- Customer Service: novos pedidos de terceiros foram encerrados em 18/11/2024.
- Para o IT.MK: **ERP System**, conta **ISV**.

### 6.3 Fluxo de autorização do vendedor
1. O IT.MK gera o **link de autorização** (ERP não tem botão no console). Endereço fixo no Brasil: `https://open.shopee.com.br/auth`. Parâmetros: `partner_id`, `auth_type=seller`, `redirect_uri`, `response_type=code` e `state` (opcional) mais a assinatura e o horário.
2. O horário e a assinatura do link valem **5 minutos**. Depois disso gera-se outro link.
3. O vendedor entra, digita o **código recebido por SMS** e confirma. Conta de **loja** autoriza uma loja. Conta **principal** autoriza várias lojas. **Subconta não consegue.** Vendedor de fora do Brasil precisa marcar "Auth Merchant" para a API de comerciante.
4. O vendedor escolhe a validade: **7, 30, 90, 180 ou 365 dias**, ou data livre até 365 dias.
5. A Shopee volta ao endereço de retorno com `code` (uso único, **10 minutos**) e `shop_id` (ou `main_account_id`).
6. O IT.MK troca o código por token: `POST /api/v2/auth/token/get`.

### 6.4 Tokens, validade e renovação

| Item | Valor |
|---|---|
| Token de acesso | **4 horas** (reutilizável). O anterior segue valendo **5 minutos** depois de gerar um novo |
| Refresh token | **30 dias**, uso único, devolve um novo a cada renovação |
| Autorização do vendedor | **No máximo 365 dias** (escolha do vendedor). Depois, o vendedor autoriza de novo |
| Renovar | `POST /api/v2/auth/access_token/get`, **dentro da validade da autorização** |
| Guardar | Um par de tokens **separado por loja** (e por comerciante) |
| Reautorizar | Renova os dois tokens |

- **Aviso antecipado**: o Push **código 12** avisa **7 dias antes** de uma autorização vencer. Os códigos 1 e 2 avisam autorização e cancelamento.
- A API `get_shop_info` devolve `auth_time` e `expire_time` (data de vencimento da autorização). **Use isso no campo "Validade"** em vez de calcular.
- **Conclusão para o protótipo**: 7/30/90/180/365 confere. Falta o 7 e a data livre.

### 6.5 Endereços de retorno (teste e produção)
- Autorização: produção Brasil `https://open.shopee.com.br/auth`; teste Brasil `https://open.sandbox.test-stable.shopee.com.br/auth`.
- **Só o domínio** do endereço de retorno é conferido. Teste e produção são cadastrados **separados** no Console. Domínio diferente dá erro "The domain of redirect_uri is not consistent...".
- Chamadas da API: três domínios por **localização do servidor** (`partner.shopeemobile.com`, `openplatform.shopee.com.br`, `openplatform.shopee.cn`). Teste: `openplatform.sandbox.test-stable.shopee.sg`. Qual domínio usar para lojas do Brasil: **escolher conforme onde o servidor do IT.MK fica**; a regra específica do Brasil **não está confirmada**.

### 6.5.1 Teste (sandbox)
Existe sandbox (V2) com **loja de teste, pedido de teste e Push de teste**. Não replica 100% a produção.

### 6.6 Lista de IPs
- **Obrigatório para todos**: declarar os IPs dos servidores e ligar "IP Address Whitelist".
- Com a lista ligada, **só os IPs declarados** chamam a API. Erro `source_ip_undeclared` se vier de outro.
- IP dinâmico: pode marcar "IP não disponível" e justificar, mas a Shopee **recomenda IP fixo** e pode pedir declaração periódica.
- Dados do comprador (nome, telefone, e-mail, endereço) vêm **mascarados** por padrão. Para ver, é preciso lista de IPs. ISV de alguns países também envia **relatório de teste de invasão** (Tailândia, Malásia, Singapura, Filipinas, China e Hong Kong cross-border). O Brasil não está nessa lista.
- Para **liberar a Shopee** no seu firewall: `v2.public.get_shopee_ip_ranges`.

### 6.7 Assinatura das requisições
- Cada chamada leva `partner_id`, `timestamp` (vale **5 minutos**), `sign`, e, para dados da loja, `access_token` e `shop_id`.
- Texto a assinar, nesta ordem, sem separador: **loja**: `partner_id + caminho + timestamp + access_token + shop_id`; **comerciante**: troca `shop_id` por `merchant_id`; **pública**: `partner_id + caminho + timestamp`.
- Cálculo: **HMAC-SHA256** com a Partner Key. Resultado em hexadecimal minúsculo.
- Só **GET e POST**. Resposta com `request_id` (guardar para suporte), `error`, `message`.

### 6.8 Limites de chamadas
- Existem dois erros: `error_rate_limit` ("muitas chamadas") e `error_limit` (limite **diário** por aplicativo, volta às 00:00 UTC+8).
- **Números não publicados.** A documentação de cada API traz um campo de limite vazio ou zerado.

### 6.9 Avisos (Push Mechanism)
- Configurar no Console ou por `v2.push.set_app_push_config`. O endereço é testado com um POST.
- Responder **2xx com corpo vazio**.
- Cada aviso vem assinado no cabeçalho `Authorization` (HMAC-SHA256 de `endereço|corpo`, com a Partner Key).
- Códigos: 1 autorização, 2 autorização cancelada, **12 vencimento em 7 dias**, 5 novidades da Shopee, 3 status do pedido, 4 rastreio, 15 documento de envio, 6 **item banido**, 7 e 9 promoções, 8 estoque reservado, 11 vídeo, 13 marca, 10 chat.
- Para app **ERP**: todos, menos o Chat (10).
- Alerta: mais de 600 avisos em 6 horas com sucesso abaixo de **70%** gera e-mail a cada 30 min. Abaixo de **30%** a assinatura é **desligada** e os avisos do período se perdem. Há `v2.push.get_lost_push_message` para recuperar.

### 6.10 Endpoints por assunto

| Assunto | Endpoint | Observação |
|---|---|---|
| Troca de token | `POST /api/v2/auth/token/get` | |
| Renovar token | `POST /api/v2/auth/access_token/get` | |
| Dados da loja e vencimento | `v2.shop.get_shop_info` | `status` (NORMAL, BANNED, FROZEN), `auth_time`, `expire_time`, `is_cb` |
| Pedidos | `v2.order.get_order_list`, `v2.order.get_order_detail` | Lista por data e status. Paginação por cursor |
| Itens (lista e status) | `v2.product.get_item_list` | Status: NORMAL, BANNED, UNLIST, REVIEWING, SELLER_DELETE, SHOPEE_DELETE. Total em `total_count` |
| Itens (detalhe) | `v2.product.get_item_base_info` | Até 50 itens por chamada |
| Regras da categoria | `v2.product.get_item_limit` | Preço, estoque, título, fotos por categoria |
| Violações dos itens | `v2.product.get_item_violation_info`, `v2.account_health.get_listings_with_issues` | |
| Pontos de penalidade | `v2.account_health.get_penalty_point_history` | Trimestre atual. Traz pontos originais e atuais (efeito do recurso) |
| Punições | `v2.account_health.get_punishment_history` | Ativa/encerrada, início, fim, limite de listagem, limite de pedidos |
| Desempenho | `v2.account_health.get_shop_performance` | Nota geral 1 a 4 e lista de métricas |
| Pedidos atrasados | `v2.account_health.get_late_orders` | |
| Diagnóstico de conteúdo | `v2.product.get_item_content_diagnosis_result`, `...get_item_list_by_content_diagnosis` | Nível 1 a 3 e problemas |
| Devoluções | `v2.returns.get_return_list`, `v2.returns.get_return_detail` | Motivo, valor, status, prazo |
| Financeiro (por pedido) | `v2.payment.get_escrow_detail` | Comissão, serviço, transação, repasse esperado |
| Financeiro (lista) | `v2.payment.get_escrow_list`, `v2.payment.get_income_overview`, `get_income_detail` | |
| Extrato | `v2.payment.generate_income_statement`, `get_income_statement` | Semanal ou mensal |
| Marketing | `v2.discount.*`, `v2.voucher.*` | Campanhas e cupons |
| Notas fiscais (Brasil) | `v2.order.upload_invoice_doc`, `v2.order.get_order_detail` com `invoice_data`, pedidos em `INVOICE_PENDING` | Veja regras abaixo |
| IPs da Shopee | `v2.public.get_shopee_ip_ranges` | |

### 6.11 Nota fiscal no Brasil (regras oficiais)
- Vendedor **CNPJ**: a nota é obrigatória no pedido (exceto transportadora sem suporte, como Correios).
- Dados do comprador por tipo de vendedor:
  - **CPF**: só o **endereço**, e só nos status `READY_TO_SHIP`, `PROCESSED` e `RETURN/REFUND`. Nome, telefone e CPF do comprador **nunca** vêm.
  - **CNPJ**: nome, endereço e CPF nos status `INVOICE_PENDING`, `READY_TO_SHIP`, `PROCESSED`, `RETURN/REFUND`. Telefone nunca vem.
- Enviar a nota (XML, tipo de arquivo 4) com `upload_invoice_doc`, **5 minutos depois** de emitir (a nota precisa estar válida na SERPRO).
- O CNPJ, o estado e a inscrição estadual da nota **precisam ser iguais** aos cadastrados na Shopee, senão dá erro.

### 6.12 Regras da Shopee para o IT.MK
- Conta **ISV**, app **ERP System**. Prever 10 dias úteis (conta) + 24 horas (Go Live).
- Declarar IPs fixos do IT.MK **antes** do Go Live.
- Gerar o link com horário novo cada vez (vale 5 minutos).
- Renovar o token **antes de 4 horas** (ideal: renovar de hora em hora). Gravar o refresh token novo a cada renovação.
- Assinar o recebimento dos avisos e responder rápido (2xx, corpo vazio).
- Mostrar "vence em X dias" a partir de `expire_time`. Avisar com o Push 12.

---

## 7. KWAI

### 7.1 O que foi possível confirmar
- A documentação de desenvolvedor do **Kwai Shop Brasil** não abriu no meu acesso (o endereço `open.kwai.com` não respondeu). Não achei página oficial aberta para vendedor.
- O que existe de público:
  - **Kwai for Business Marketing API** (developers.kwai.com): é de **anúncios**, não de loja.
  - Repositório oficial `kwai-apis` no GitHub: só login por OpenID Connect. Nenhuma API de loja.
  - Painel do vendedor: **Kwai Shop Seller Centre** (shop.kwai.com).
  - Portal chinês de comércio (open.kwaixiaodian.com): abre, mas só com JavaScript, sem conteúdo lido.
- ERPs com integração **oficial anunciada**: Olist (parceria anunciada em abril de 2025), Bling e UpSeller. Mostram que **existe API para parceiros**, mas o acesso é por parceria.
- O fluxo que os ERPs mostram é: o vendedor entra no ERP, clica em "Conectar com Kwai", abre uma aba do Kwai, entra e **autoriza**. Isso combina com o protótipo.

### 7.2 Itens do protótipo sem fonte oficial (todos **Não confirmado**)
- Token de 365 dias, permissões `user_info`, `merchant_item`, `merchant_order`, tipo de aplicativo, limite de chamadas, avisos, assinatura, IPs, endereços de retorno teste/produção.
- "Não existem taxas e comissões na Kwai" e "não existe limite de publicação".
- Um resultado de buscador sobre a plataforma chinesa do Kwai cita prazos diferentes (token de acesso de 48 horas e refresh de 180 dias). **É outra plataforma e não vale para o Brasil.** Registrado só como alerta de que 365 pode estar errado.

### 7.3 O que fazer
1. Pedir ao **gerente de conta do Kwai Shop** o acesso à documentação do Kwai Open Platform para vendedores/ERP.
2. Perguntar a um parceiro (Olist, Bling ou UpSeller) qual é o processo de homologação.
3. Até lá, **toda a ficha do Kwai fica Manual**, e o prazo de 365 dias fica marcado "a confirmar".

---

## 8. Campo da ficha x disponível na API?

Legenda: **API**, **Parcial**, **Calculado**, **Manual**, **Não confirmado**. A coluna "Como" mostra o endpoint ou o motivo. Campos de cadastro interno do IT.MK (Percentual da 40%, Responsável, Data de início, Marketplace) **não vêm de marketplace** e ficam como estão.

### 8.1 Shein

| Bloco | Campo da ficha | Selo | Como / observação |
|---|---|---|---|
| Cadastro | Nome de login | Manual | Não achei. Vem da conta do vendedor |
| Cadastro | Nome público | Não confirmado | Possível nas APIs de loja. Manter manual |
| Cadastro | GS / ID da loja | API | `supplierId` e `openKeyId` vêm na troca do código |
| Cadastro | Link da loja | Manual | |
| Cadastro | Data da publicação mais antiga | Parcial | Lista de produtos tem filtro por data de inclusão. Calcular quando houver lista |
| Catálogo | Limite total de SKC | Parcial | `goods-publish-quotas/detail` (caminho de resumo). Confirmar campos |
| Catálogo | SKC publicados | Parcial | Mesma cota, ou contagem da lista de produtos |
| Catálogo | Saldo de SKC | Calculado | Limite menos publicados |
| Catálogo | Produtos ativos / esgotados / inativos | Parcial | Lista só traz produtos **aprovados**. Esgotado exige ler estoque por SKU |
| Catálogo | Total de produtos | Calculado | Soma dos três |
| Violações | Lista de violações | Manual | Não achei API |
| Violações | Recursos e contadores | Manual | Contadores são calculados sobre a lista manual |
| Violações | Avaliações negativas com recurso | Manual | |
| Violações | Penalidade financeira (debitado, compensado) | Manual | Extrato de repasse não confirmado |
| Devoluções | Registros de pós-venda | **API** (auto-operada e semi) | `return-order/list`, `details`. Full-gerenciada: **Manual** |
| Produtos analisados | Título, descrição, atributos, fotos, peso, variações, estoque | Parcial | Detalhe por SPU/SKU. Campo a campo não confirmado |
| Produtos analisados | Tabela de medidas, vídeo, imagem por cor | Não confirmado | |
| Preços e concorrência | Preço da loja | Parcial | Vem do detalhe do produto |
| Preços e concorrência | Volume de vendas | Calculado | Contar pedidos |
| Preços e concorrência | Fonte, amostra de concorrentes, média, diferença | Manual / Calculado | Concorrência nunca vem do marketplace |
| Marketing | Campanhas, ferramentas, cupons | Manual | Não achei API de marketing |
| Diagnóstico | Taxa de boa qualificação, nota geral, tipos de problema | Manual | Não achei API |
| Diagnóstico | Categorias A / C / D e lista C1 a D2 | Manual | |
| Desempenho | Nota de qualidade, de logística, DSR, nível, critérios "não atende" | Manual | Não achei API de desempenho |
| Desempenho | Pontualidade da coleta, ranking de fulfillment | Manual | |
| Desempenho | Faixa de saúde | Manual | Preenchida por analista (já é assim) |
| Financeiro | Pedidos no mês e Faturamento no mês | Calculado | Lista e detalhe de pedidos |
| Financeiro | Comissão | Parcial | `commission` e `commissionRate` por item (valor estimado) |
| Financeiro | Taxa de serviço | Parcial | `serviceCharge` e `performanceServiceCharge`. Conferir a equivalência |
| Financeiro | Taxa de transação | Não confirmado | |
| Financeiro | Repasse | Parcial | `estimatedIncome` é estimado. Extrato real: não confirmado |

### 8.2 Mercado Livre

| Bloco | Campo da ficha | Selo | Como / observação |
|---|---|---|---|
| Cadastro | GS / ID da loja | API | `user_id` vem na troca do token |
| Cadastro | Nome público, link da loja | Parcial | `GET /users/{id}` (campos exatos não conferidos) |
| Cadastro | País (MLB) | API | Código do site (MLB) |
| Cadastro | Data da publicação mais antiga | Parcial | Calcular pela lista de itens. Manual até lá |
| Catálogo | Anúncios ativos / pausados / encerrados | API | `users/{id}/items/search` com filtro `status`. Total em `paging.total`. Exemplos oficiais: `active`, `pending`. Conferir `paused` e `closed` |
| Catálogo | Anúncios restantes Clássico / Premium | API | `available_listing_types` (`remaining_listings`). Clássico = `gold_special`, Premium = `gold_pro` nos exemplos oficiais. Vazio quer dizer sem limite |
| Violações | Lista de violações | API | `moderations/infractions/{user_id}` (data, motivo, solução, item) |
| Violações | Penalidade | Parcial | Vem em texto (`reason` e `remedy`). Não é ponto |
| Violações | Pontos | Manual | Não existe no Mercado Livre |
| Violações | Recursos e prazo | Não confirmado | Não achei endpoint de recurso de infração |
| Violações | Avaliações negativas com recurso | Manual | |
| Violações | Penalidade financeira | Não se aplica | Como no protótipo |
| Devoluções | Registros de pós-venda | **API** | `post-purchase/v1/claims/search`, `v2/claims/{id}/returns`. Motivo vem como código (PNR, PDD, CS) |
| Devoluções | Produto | Parcial | Ligar a reclamação ao pedido e ao item |
| Produtos analisados | Título, preço, estoque, status | API | `GET /items/{id}` (exemplo oficial traz título, preço, quantidade, vendidos, status) |
| Produtos analisados | Descrição, atributos, fotos, vídeo, variações, peso e dimensões | Não confirmado | A API de itens tem esses dados, mas não conferi campo a campo |
| Produtos analisados | Estoque total | Parcial | Quantidade disponível (pode vir em faixas em consulta pública) |
| Preços e concorrência | Preço da loja | API | Preço do item |
| Preços e concorrência | Amostra de concorrentes | Manual | Existe "preço para ganhar" em catálogo, não confirmado |
| Marketing | Campanhas e cupons | Parcial | Permissão "Promoções, cupons e descontos". Endpoints não detalhados nesta leitura |
| Diagnóstico | Nota geral | API | `item/{id}/performance` (nota e nível por anúncio). Média da loja é calculada |
| Diagnóstico | Produtos com problemas | API | Itens "sem boa saúde" (`reputation_health_gauge`) e moderações |
| Diagnóstico | Categorias A / C / D | Manual | Classificação própria do IT.MK |
| Desempenho | Cor da reputação | API | `seller_reputation.level_id` |
| Desempenho | Faixa de Mercado Líder | API | `power_seller_status` (silver, gold, platinum) |
| Desempenho | Taxa de reclamações / cancelamentos / atraso no despacho | API | `seller_reputation.metrics`. Vendedor protegido mostra o valor real em `excluded` |
| Desempenho | Faixa de saúde | Calculado | Convertida da cor (já é assim) |
| Financeiro | Pedidos e faturamento do mês | Calculado | `orders/search` por datas |
| Financeiro | Tarifa de venda | API | `sale_fee` no item do pedido |
| Financeiro | Taxa de serviço e de transação | Parcial | `fixed_fee` (taxa fixa por vender) e cobranças do relatório de faturamento. Mapeamento a confirmar |
| Financeiro | Repasse | Não confirmado | Fica na conta de pagamentos. Relatório de faturamento cobre cobranças, não o repasse |
| Notas fiscais | Notas emitidas | API | `users/{id}/invoices/...` |

### 8.3 Shopee

| Bloco | Campo da ficha | Selo | Como / observação |
|---|---|---|---|
| Cadastro | GS / ID da loja | API | `shop_id` |
| Cadastro | Nome público | API | `shop_name` |
| Cadastro | Tipo da loja (Local / Cross-border) | API | `is_cb` |
| Cadastro | Tipo do vendedor (CPF / CNPJ) | Não confirmado | Não achei campo direto. Importa para mascaramento de dados |
| Cadastro | Data de autorização e vencimento | API | `auth_time` e `expire_time` |
| Cadastro | Data da publicação mais antiga | Parcial | `get_item_base_info` traz `create_time`. Calcular |
| Catálogo | Itens normais, banidos, não listados, em revisão, excluídos (vendedor / Shopee) | **API** | `get_item_list` por status. Total em `total_count` |
| Catálogo | Limites por categoria | API | `get_item_limit` (regras da categoria) |
| Catálogo | Estoque total | Parcial | Estoque por modelo (`get_model_list`). Somar |
| Violações | Pontos de penalidade do trimestre | **API** | `get_penalty_point_history` |
| Violações | Punições (tipo, início, fim, limites) | **API** | `get_punishment_history` |
| Violações | Itens com problema e prazo | **API** | `get_listings_with_issues`, `get_item_violation_info`. Prazo para corrigir: não confirmado |
| Violações | Recurso | Não se aplica na API | Efeito aparece como pontos ajustados |
| Devoluções | Registros de pós-venda | **API** | `get_return_list`, `get_return_detail` (motivo, status, valor, prazo) |
| Produtos analisados | Título, descrição, atributos, fotos, vídeo, peso e dimensões, preço | **API** | `get_item_base_info` |
| Produtos analisados | Variações e estoque por variação | **API** | `get_model_list`, `get_variations` |
| Produtos analisados | Tabela de medidas | Parcial | `get_size_chart_list`, `get_size_chart_detail` |
| Produtos analisados | Imagem própria para cada cor | Não confirmado | |
| Preços e concorrência | Preço da loja | API | `price_info` do item |
| Preços e concorrência | Volume de vendas | Calculado | Contar pedidos |
| Preços e concorrência | Concorrentes | Manual | |
| Marketing | Campanhas | API | `v2.discount.*`, bundle, add-on, flash sale |
| Marketing | Cupons | API | `v2.voucher.*` |
| Diagnóstico | Nível do diagnóstico de conteúdo | **API** | `get_item_content_diagnosis_result` (1 a 3: melhorar, qualificado, excelente) |
| Diagnóstico | Tipo de problema, produtos com problemas | **API** | Mesma API (problemas e sugestão) e `get_item_list_by_content_diagnosis` |
| Diagnóstico | Taxa de avaliações negativas | Calculado | `v2.product.get_comment` |
| Desempenho | Nota da loja (1 a 4) | **API** | `get_shop_performance` (`overall_performance.rating`: 1 Ruim, 2 Melhorar, 3 Bom, 4 Excelente) |
| Desempenho | Não cumprimento, cancelamento, devolução, atraso de envio | **API** | Métricas na mesma API (`non_fulfillment_rate`, `cancellation_rate`, `return_refund_rate`, `late_shipment_rate`) |
| Desempenho | Tempo de preparo, resposta no chat, avaliação dos compradores | **API** | `preparation_time`, `response_rate`, `shop_rating` |
| Desempenho | Faixa de saúde | Calculado | Da nota 1 a 4 |
| Financeiro | Pedidos e faturamento do mês | Calculado | Pedidos e detalhes |
| Financeiro | Comissão | **API** | `commission_fee` em `get_escrow_detail` |
| Financeiro | Taxa de serviço | **API** | `service_fee` |
| Financeiro | Taxa de transação | **API** | `seller_transaction_fee` |
| Financeiro | Repasse | **API** | `escrow_amount` (esperado) e `get_escrow_list` (`payout_amount`) |
| Notas fiscais | Nota do pedido | **API** | `invoice_data` e `upload_invoice_doc` |

Observação: vários campos financeiros dependem do mercado. Confirmar com uma loja real do Brasil quais deles vêm preenchidos.

### 8.4 Kwai

| Bloco | Campo da ficha | Selo |
|---|---|---|
| Cadastro, Catálogo (revisão e venda), Violações, Devoluções, Produtos, Preços, Marketing, Diagnóstico, Desempenho, Financeiro | Todos os campos | **Manual** (Não confirmado em fonte oficial) |
| Conexão | Validade de 365 dias, permissões | Não confirmado |

Quando houver acesso à documentação, reavaliar campo a campo. Os grupos de situação do protótipo (revisão: em revisão, aprovado, reprovado, reprovado por violação; venda: fora do ar, no ar, banido, aguardando edição) vieram do material do dono e **não foram reconferidos**.

---

## 9. Regras acionáveis (para Integrações)

1. **Um aplicativo por marketplace** no IT.MK. No Mercado Livre é obrigatório (só 1 no Brasil). Na Shopee é o desenho mais simples.
2. **Segredos** (Secret_Key, Partner Key, chave secreta Shein, tokens) só gravam e nunca aparecem. Guardar criptografado. Quem trocou e quando fica registrado.
3. **Sempre gravar o token novo** no mesmo instante da renovação (Mercado Livre e Shopee entregam um refresh token novo e invalidam o antigo). Falha ao gravar = pedir nova autorização.
4. **Renovação automática** a cada: Shopee antes de 4 horas; Mercado Livre antes de 6 horas (só quando vencer). Shein não renova.
5. **Validade da conexão** por plataforma: Shopee = `expire_time` da API; Mercado Livre = 6 meses (pior caso) e chamar a API ao menos 1 vez por mês; Shein = sem validade; Kwai = a confirmar.
6. **Situação "Vencida"** só quando a data é conhecida. Kwai não calcula até confirmar.
7. **Situação "Com erro"** deve nascer destes sinais: ML `invalid_grant`, `invalid_operator_user_id`, 401 `unauthorized_scopes`; Shopee `error_auth`, `source_ip_undeclared`, Push código 2; Shein erro de assinatura depois de o vendedor reautorizar ou cancelar.
8. **Shopee**: usar o Push 12 (7 dias antes) para avisar o consultor e o cliente. Mostrar "vence em X dias".
9. **Mercado Livre**: o vendedor precisa autorizar com a conta **administradora**. Mostrar essa regra na tela de convite.
10. **Endereços de retorno**: Mercado Livre idêntico ao cadastrado, HTTPS, sem parte variável. Shopee só o domínio, teste e produção separados. Dados variáveis vão em `state`.
11. **IPs**: Shopee, declarar IPs fixos e ligar a lista antes do Go Live. Mercado Livre, só com liberação. Shein, a confirmar.
12. **Limite de chamadas**: usar pausa crescente com variação em todos. Registrar toda resposta de limite (429 no Mercado Livre; `error_rate_limit` e `error_limit` na Shopee). Não prometer números.
13. **Avisos (webhooks)**: responder rápido e depois buscar o dado. Mercado Livre em até 500 ms. Shein em 1,5 s. Shopee com 2xx e corpo vazio. Guardar o aviso e processar em fila.
14. **Recuperar avisos perdidos**: Mercado Livre `missed_feeds` (2 dias). Shopee `get_lost_push_message`. Fazer também uma leitura diária de conferência, pois avisos podem se perder.
15. **Conferir assinatura** dos avisos da Shopee e da Shein antes de confiar.
16. **Ler apenas** (só permissões de leitura) no início. Escrita só quando houver item próprio no backlog.
17. **Dados pessoais do comprador**: não guardar o que a plataforma mascara. Seguir a LGPD. Só pedir o que a nota fiscal exigir.
18. **Campo vem da API = campo não editável** (o protótipo já descreve isso com os selos Manual e API). Quando o conector for ligado, o campo passa para "API" e deixa de ser editado à mão.
19. **Calculado** (saldo de SKC, faixa de saúde, totais) continua calculado pelo sistema, não vem do marketplace.
20. **Concorrência e preços de terceiros** nunca vêm do marketplace. Ficam manuais.
21. **Tipo de loja Shein** (auto, semi, full) fica na conexão, porque muda de onde vêm pedidos e devoluções.
22. **Shopee CPF x CNPJ**: guardar na conexão. Muda o que vem mascarado e a obrigatoriedade da nota.
23. **Guardar `request_id`** de cada chamada da Shopee e o equivalente nas demais, para abrir chamado no suporte.
24. **Mercado Livre**: migrar `items?ids=` e `users?ids=` para `items/bulk` e `users/bulk` até **25/10/2026**.
25. **Cada vez que o vendedor reautorizar**, atualizar a data de autorização e os tokens, e registrar no histórico.

---

## 10. Checklist de critérios de aceite (para itens de Integrações)

Modelo para colar em cada item BL. Marque as caixas que valem para o conector em questão.

**A. Aplicativo e credenciais**
- [ ] O aplicativo está criado e **Aprovado** no marketplace (Aplicativos mostra a situação).
- [ ] Identificador e segredo gravados, nunca mostrados. Data da última troca registrada.
- [ ] Shopee: conta ISV aprovada, app ERP System, Go Live aprovado, Partner Key de produção gravada.
- [ ] Mercado Livre: 1 app da empresa, escopos e permissões conferidos, PKCE decidido.
- [ ] Shein: conta de desenvolvedor e aplicativo aprovados, soluções corretas.
- [ ] Kwai: acesso à documentação oficial obtido por escrito (senão o item não começa).

**B. Autorização do vendedor**
- [ ] A tela gera o link de convite, com horário válido e `state` aleatório.
- [ ] O retorno confere o `state` e troca o código dentro do prazo (Shein 5 min, Shopee 10 min).
- [ ] O sistema grava quem autorizou, data e validade.
- [ ] Mercado Livre: conta de operador é recusada com mensagem clara.
- [ ] Shopee: subconta é recusada com mensagem clara. Lojas de conta principal são todas gravadas.
- [ ] Cancelamento pelo vendedor deixa a conexão "Com erro".

**C. Tokens e validade**
- [ ] Renovação automática testada (Shopee 4 h, Mercado Livre 6 h).
- [ ] Token novo gravado antes de usar. Falha de gravação gera alerta.
- [ ] Validade exibida pela regra de cada plataforma. "Vencida" só com data conhecida.
- [ ] Aviso antecipado ao consultor (Shopee Push 12; demais: 30 dias antes pela data gravada).
- [ ] Mercado Livre: rotina mensal para não passar 4 meses sem chamada.

**D. Segurança de rede**
- [ ] Endereços de retorno de teste e produção cadastrados e testados.
- [ ] IPs do IT.MK declarados (Shopee) e liberação dos IPs do Mercado Livre para avisos, se houver filtro.
- [ ] Assinatura das chamadas e dos avisos verificada (Shopee, Shein).
- [ ] Nenhum segredo em log, na tela ou no repositório.

**E. Limites e erros**
- [ ] Pausa crescente com variação nos erros de limite.
- [ ] Erros de limite e de assinatura aparecem na conexão como "Com erro", com texto simples.
- [ ] Nenhuma chamada em excesso de erros 400 (risco de bloqueio no Mercado Livre).

**F. Avisos**
- [ ] Endereço de avisos público, em HTTPS, responde dentro do prazo.
- [ ] Fila de processamento e reprocesso de avisos perdidos.
- [ ] Conferência diária por leitura completa.

**G. Dados da ficha**
- [ ] Cada campo da seção 8 com selo correto na tela (API, Calculado, Manual).
- [ ] Campos de API ficam somente leitura e mostram data da última leitura.
- [ ] Campos **Não confirmado** continuam manuais.
- [ ] Visão única: sem perfis, sem "diretor", "CEO" ou "colaborador" (regra do projeto).
- [ ] Teste com uma loja real de cada plataforma, comparando 10 campos com o painel do vendedor.

**H. Layout e entrega (regras do projeto)**
- [ ] Tela sem espaço vazio e sem barra horizontal em computador, tablet e celular.
- [ ] Cores e medidas só de `tokens.css`.
- [ ] Prévia publicada e link enviado ao dono.
- [ ] Sem entrega na sexta-feira.

---

## 11. Riscos

| # | Risco | Efeito | Como reduzir |
|---|---|---|---|
| 1 | Kwai sem documentação aberta | Conector do Kwai não tem prazo | Pedir acesso ao gerente da conta; pesquisar via parceiros |
| 2 | Shein sem dados de desempenho, violações e diagnóstico | Esses blocos seguem manuais | Manter manual. Rever a cada seis meses |
| 3 | Página da Shein só abre com login | Parte do que está aqui vem de resumo | Confirmar tudo ao abrir a conta de desenvolvedor, antes de estimar |
| 4 | Refresh token perdido (ML, Shopee) | Vendedor precisa autorizar de novo | Gravar com cuidado. Alertar |
| 5 | Mercado Livre limita a 1 app por conta | Se a conta for bloqueada, todas as lojas caem | Conta da empresa. Seguir regras. Evitar erros 400 |
| 6 | Vendedor de outra conta autoriza com operador (ML) | Erro na conexão | Texto claro no convite |
| 7 | Aplicativo suspenso (Shopee) | Todas as autorizações removidas | Cumprir a Política de Parceiros. Acompanhar e-mails |
| 8 | Partner Key da Shopee expira | Chamadas param | Alarme. Conhecer o prazo (não confirmado) |
| 9 | Avisos perdidos | Dado atrasado | Conferência diária |
| 10 | Mudança de API sem aviso | Quebra de conector | Acompanhar anúncios; testes diários de saúde (exemplo: `items?ids=` muda em 25/10/2026) |
| 11 | Dados pessoais de comprador | Risco legal | Gravar o mínimo. Seguir a LGPD |
| 12 | Limites de chamadas desconhecidos | Lentidão ou bloqueio com muitas lojas | Começar com poucas lojas; medir; pedir aumento |
| 13 | Endereço de IP do IT.MK mudar (Shopee) | Chamadas bloqueadas | IP fixo; atualizar o Console antes de mudar |
| 14 | Análise do ISV (Shopee) pode negar | Atraso | Preparar endereço HTTPS com nota "A" e conta de teste antes |

---

## 12. Decisões que dependem do dono

1. **Shopee**: o IT.MK se cadastra como **ISV** (precisa de produto no ar, com endereço HTTPS, TLS 1.2 e nota "A", e conta de teste)? Ou cada cliente cria o próprio app (não recomendado)?
2. **Mercado Livre**: usar a conta da empresa da 40% ou do IT.MK? A conta é dona do aplicativo e **não pode mudar de dono** depois.
3. **Mercado Livre**: aceita buscar a certificação do Developer Partner Program? (Exige faturamento mensal alto e teste de segurança. Só vale se for crescer.)
4. **Shein**: confirmar com a Shein o processo de conta de desenvolvedor para consultoria (um app para várias lojas?). Quem pede, a empresa ou o cliente?
5. **Kwai**: quem na empresa fala com o gerente de conta para pedir o acesso?
6. **Prazo de validade e avisos**: com quantos dias de antecedência o consultor deve ser avisado (sugestão: 30 dias, e 7 dias na Shopee)?
7. **IPs**: hospedagem com IP fixo (Shopee exige declarar). Qual será?
8. **Endereços de retorno** definitivos por plataforma e ambiente (teste e produção).
9. **Dados pessoais**: o IT.MK precisa mesmo de nome e endereço do comprador? (Pela regra de campos, não precisa.) Recomendação: não pedir acesso a dados sensíveis.
10. **Ordem dos conectores**: sugestão por facilidade e valor: Shopee, depois Mercado Livre, depois Shein, por último Kwai.
11. **Quais campos "Parcial"** valem o trabalho de ligar agora, e quais ficam manuais.

---

## 13. O que NÃO foi verificado

- **Shein**: páginas de documentação só abrem com login. Faltam: regras de IP, prazo de análise, como o vendedor recebe o link, passo 3 da assinatura, endpoints de finanças e desempenho, e se a cota de SKC renova por mês. Caminhos de devolução vêm de resumo de buscador.
- **Mercado Livre**: lista completa de níveis de reputação, se os 6 meses do refresh token recomeçam, valores de `status` de anúncios além de `active` e `pending`, endpoint de recurso de infração, endpoints de promoções e de repasse. Número de limite de chamadas.
- **Shopee**: limites de chamadas (não publicados), prazo de validade da Partner Key, regra de domínio da API para lojas do Brasil, quais campos financeiros vêm preenchidos no Brasil, existência de campo de CPF/CNPJ do vendedor, estoque exato de `get_item_base_info`.
- **Kwai**: tudo. Nenhuma fonte oficial de vendedor lida.
- **Nada foi testado com loja real nem com conta de desenvolvedor.** Tudo vem de leitura de documentação.
- Valores das métricas de exemplo de desempenho da Shopee (metas) são **exemplos da documentação**, não regras.

---

## 14. Tabela de fontes (consultadas em 01/10/2026)

Forma de leitura: **L** = leitura direta da página oficial; **P** = leitura pela API pública do próprio portal (conteúdo oficial); **R** = resumo de buscador sobre página oficial; **T** = terceiro (apenas apoio).

### Mercado Livre
| Fonte | URL | Atualização da página | Leitura |
|---|---|---|---|
| Autenticação e autorização | https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao | 29/12/2025 | L |
| Criar aplicação | https://developers.mercadolivre.com.br/pt_br/crie-uma-aplicacao-no-mercado-livre | 29/12/2025 | L |
| Permissões funcionais | https://developers.mercadolivre.com.br/pt_br/permissoes-funcionais | 21/11/2025 | L |
| Gerenciar IPs | https://developers.mercadolivre.com.br/pt_br/gerenciar-ips-de-um-aplicativo | 30/12/2025 | L |
| Notificações (tópicos, IPs, reenvio) | https://developers.mercadolivre.com.br/pt_br/produto-receba-notificacoes | 14/09/2026 | L |
| Aviso de redução de tentativas | https://developers.mercadolivre.com.br/pt_br/notificacoes | 03/01/2024 | L |
| Rate limit / erro 429 | https://developers.mercadolivre.com.br/pt_br/rate-limit-erro-429 | 05/05/2026 | L |
| Pedidos (orders) | https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas | 21/09/2026 | L |
| Reputação de vendedores | https://developers.mercadolivre.com.br/pt_br/reputacao-de-vendedores | 11/08/2025 | L |
| Reclamações | https://developers.mercadolivre.com.br/pt_br/gerenciar-reclamacoes | 20/08/2026 | L |
| Devoluções | https://developers.mercadolivre.com.br/pt_br/gerenciar-devolucoes | 22/12/2025 | L |
| Moderações e infrações | https://developers.mercadolivre.com.br/pt_br/gerenciar-moderacoes | 30/12/2025 | L |
| Busca de itens | https://developers.mercadolivre.com.br/pt_br/itens-e-buscas | 31/08/2026 | L |
| Categorias e publicações (tipos de anúncio) | https://developers.mercadolivre.com.br/pt_br/categorias-e-publicacoes | 30/12/2025 | L |
| Usuários e aplicativos (limites de anúncios) | https://developers.mercadolivre.com.br/pt_br/usuarios-e-aplicativos | consultada | L |
| Qualidade das publicações | https://developers.mercadolivre.com.br/pt_br/qualidade-das-publicacoes | 31/01/2025 | L |
| Custos por vender | https://developers.mercadolivre.com.br/pt_br/comissao-por-vender | 03/09/2026 | L |
| Dados de faturação | https://developers.mercadolivre.com.br/pt_br/faturamento | 16/06/2026 | L |
| Relatórios de faturamento | https://developers.mercadolivre.com.br/pt_br/boas-praticas-para-o-consumo-das-apis-de-relatorios-de-faturamento | 08/06/2026 | L |
| Notas fiscais (obter, anexar, importar) | https://developers.mercadolivre.com.br/pt_br/obtendo-nota-fiscal (e `anexar-nota-fiscal`, `importar-nota-fiscal`) | 18/08/2026; 07/04/2026; 03/08/2026 | L |
| Developer Partner Program | https://developers.mercadolivre.com.br/pt_br/developer-partner-program | 03/03/2026 | L |
| Bloqueio de aplicativos | https://developers.mercadolivre.com.br/pt_br/bloqueio-de-aplicacoes | 15/04/2026 | L |
| Validações e segurança | https://developers.mercadolivre.com.br/pt_br/validacoes-e-requisitos-de-seguranca | 29/12/2025 | L |
| FAQ | https://developers.mercadolivre.com.br/pt_br/faq-perguntas-frequentes | 01/05/2026 | L |

### Shopee
| Fonte | URL | Atualização | Leitura |
|---|---|---|---|
| Introdução | https://open.shopee.com/developer-guide/4 | 11/2024 | P |
| Cadastro de desenvolvedor | https://open.shopee.com/developer-guide/12 | 09/2026 | P |
| Gestão de aplicativos | https://open.shopee.com/developer-guide/14 | 04/2025 | P |
| Chamadas de API | https://open.shopee.com/developer-guide/16 | 11/2025 | P |
| Push (avisos) | https://open.shopee.com/developer-guide/18 | 01/2023 | P |
| Autorização e autenticação | https://open.shopee.com/developer-guide/20 | 07/2026 | P |
| Sandbox V2 | https://open.shopee.com/developer-guide/644 | 09/2025 | P |
| Dados sensíveis | https://open.shopee.com/developer-guide/718 | 2026 | P |
| Programa de parceiros | https://open.shopee.com/developer-guide/24 | 12/2025 | P |
| Guias Brasil: conta, app, Go Live, autorização, IP, dados sensíveis, FAQ | https://open.shopee.com/developer-guide/738, 740, 741, 739, 742, 743, 735 | 2026 | P |
| Pedidos Brasil, Nota fiscal, Guia SPI | https://open.shopee.com/developer-guide/383, 382, 749 | 2026 | P |
| Devoluções, Pedidos (guias gerais) | https://open.shopee.com/developer-guide/227, 229 | 2025 | P |
| Referência: AccountHealth | https://open.shopee.com/documents (api: `v2.account_health.get_shop_performance`, `get_penalty_point_history`, `get_punishment_history`, `get_listings_with_issues`, `get_late_orders`) | 2024–2025 | P |
| Referência: Produto | `v2.product.get_item_list`, `get_item_limit`, `get_item_base_info`, `get_item_content_diagnosis_result`, `get_item_list_by_content_diagnosis`, `get_item_violation_info` | 2022–2026 | P |
| Referência: Pedidos, Pagamento, Devoluções, Loja, Público | `v2.order.get_order_list`, `v2.payment.get_escrow_detail`, `get_escrow_list`, `get_income_overview`, `get_income_detail`, `generate_income_statement`, `v2.returns.get_return_list`, `v2.shop.get_shop_info`, `v2.public.get_shopee_ip_ranges` | 2023–2026 | P |

Observação: o portal da Shopee só mostra conteúdo com JavaScript. A leitura foi feita pela interface pública do próprio portal (`open.shopee.com/api/v1/...`), que devolve o mesmo texto das páginas.

### Shein
| Fonte | URL | Leitura |
|---|---|---|
| Portal (início, soluções, passos de colaboração) | https://open.sheincorp.com/ e https://open.sheincorp.com/solution | L (texto básico) |
| Troca de código por chave | https://open.sheincorp.com/documents/apidoc/detail/3000771 | R |
| Passos de assinatura | https://open.sheincorp.com/documents/system/passwdrule | L (só o título) e R |
| Instrução de webhook | https://open.sheincorp.com/documents/system/3b13b1c5-525a-4758-a2b1-056bde083e2c | R |
| Detalhe de pedido | https://open.sheincorp.com/documents/apidoc/detail/3001915 e /3001619 | R |
| Lista de produtos | https://open.sheincorp.com/documents/apidoc/detail/3000704-1000001 | R |
| Publicar produto / cota | https://open.sheincorp.com/documents/apidoc/detail/3000905 e /3001812 | R |
| Devolução de compra | https://open.sheincorp.com/documents/apidoc/detail/3001771 e /3001804 | R |
| Pedido de compra | https://open.sheincorp.com/documents/apidoc/detail/3002009 | R |
| Depósito e envio (limites) | https://open.sheincorp.com/documents/apidoc/detail/1000010 e /3001017 | R |
| Endereço de exportação (Brasil) | https://open.sheincorp.com/documents/apidoc/detail/2000134-2000001 | R |
| SDK Java oficial | https://github.com/sheinsight/open-sdk-java (README) | L |
| Ferramenta de linha de comando oficial | https://github.com/sheinsight/Shein-Open-CLI (README) | L |
| Kit para agentes de IA | https://github.com/sheinsight/Shein-Open-AI-Toolkit (README) | L |

### Kwai
| Fonte | URL | Leitura |
|---|---|---|
| Kwai for Business Marketing API (anúncios) | https://developers.kwai.com | L (sem conteúdo útil, é de anúncios) |
| Seller Centre | https://shop.kwai.com | L (painel, sem API) |
| Portal de comércio da Kuaishou (China) | https://open.kwaixiaodian.com | L (só carrega com JavaScript) |
| Repositório oficial `kwai-apis` | https://github.com/kwai-apis | L (só login OpenID Connect) |
| Portal global `open.kwai.com` | https://open.kwai.com | **Não respondeu** |
| Integração Kwai no ERP Olist | https://ajuda.olist.com/marketplaces/como-integrar-o-erp-com-o-kwai | T (atualizado 02/02/2026) |
| Integração Kwai no UpSeller | https://www.upseller.com/pt/help-doc-article-1277 | T |

Fim do manual.
