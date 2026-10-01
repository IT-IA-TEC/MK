# Manual 12: API da WhatsGW (especificação OFICIAL, OpenAPI 3.1)

Estudo feito em 01/10/2026 para o P.O. do IT.MK. Linguagem simples. Fonte única: o arquivo enviado pelo dono, `docs/kb/refs/whatsgw-api-openapi.json` (1,1 MB, 88 caminhos, 16 eventos de webhook, 2 schemas). Eu li o arquivo inteiro com Python. Este manual **substitui** a parte técnica "não confirmada" do `docs/kb/10-whatsgw-whatsapp.md`.

Regras deste manual:
- Só entra campo que está no arquivo. O que o arquivo não diz está marcado **NÃO CONFIRMADO**.
- Tudo que é conselho nosso (e não da WhatsGW) está marcado **Recomendação IT.MK**.
- Chaves reais não aparecem. Nos exemplos, `<APIKEY_DA_EMPRESA>` é um espaço a preencher. O arquivo traz uma chave de exemplo falsa; não foi copiada.

O arquivo é uma lista de exemplos mais textos de explicação. Ele quase não tem "schema" de campos: só existem dois (`RespostaPadrao` e `RespostaErro`). Por isso, a lista de campos obrigatórios vem das descrições e dos exemplos, não de uma marcação formal de "required". Onde a descrição diz "obrigatório", eu digo. Onde não diz, escrevo "não marcado".

---

## 1. Visão geral e como autenticar

### 1.1 Endereços (campo `servers`)
| Uso | Endereço |
|---|---|
| Todos os métodos (REST) | `https://app.whatsgw.com.br/api` |
| Só o método GetEvents (busca de eventos) | `https://pooling.whatsgw.com.br/api` |

O caminho completo de cada método é o endereço + `/WhatsGw/<Método>`. Exemplo: `https://app.whatsgw.com.br/api/WhatsGw/Send`. Única exceção: `Tarefa`, que fica em `/Share/Tarefa`.

Atenção: o manual 10 (artigo de 2023) dizia que o GetEvents ficava em `app.whatsgw.com.br`. O arquivo oficial manda usar `pooling.whatsgw.com.br`. Vale o arquivo.

### 1.2 Como autenticar
- A chave `apikey` vai **dentro do corpo** da requisição, em todo método. Não existe cabeçalho de autenticação nem "securitySchemes" no arquivo.
- A chave é **da empresa** (os textos dizem "instância deve pertencer à empresa da apikey" e, nos webhooks, "API Key da empresa"). Não é uma chave por número de telefone.
- Se a chave for inválida, o exemplo de erro do arquivo é `result_message: "apikey inválida."`.
- Os webhooks que a WhatsGW manda para nós também trazem `apikey` no corpo.
- Não há assinatura (HMAC), lista de IPs nem segredo de webhook no arquivo. **NÃO CONFIRMADO** que existam fora do arquivo.
- Não aparece no arquivo: rotação de chave, mais de uma chave por empresa, chave com permissão limitada.

### 1.3 Jeito de chamar
- O texto de introdução diz que todos os métodos aceitam POST e GET, mas o GET tem limite de tamanho. Para mídia o POST é **obrigatório**. Todos os caminhos do arquivo estão descritos como POST.
- Envio aceita corpo JSON ou `form-urlencoded` (texto do exemplo de envio).
- Resposta: um envelope `{ "result": "success" | "fail", "result_message": "..." }`. Alguns métodos devolvem campos a mais (`total`, `data`, `d_template_id`, `tarefa_id`, `base64`, `ref` e outros, citados nos próprios métodos).
- Em falha, `result = "fail"` e `result_message` traz o motivo. O arquivo documenta só duas respostas por método: 200 (sucesso ou assíncrono) e "4XX" (falha de validação ou de negócio). Não há tabela de códigos de erro nem lista de mensagens de erro (exceto poucas citadas em templates). **Recomendação IT.MK:** sempre ler o campo `result`, não confiar só no código HTTP.
- **Retorno assíncrono:** "alguns métodos retornam a mensagem `wait result on event`". O resultado vem depois, por webhook. O arquivo não diz quais métodos fazem isso. Pelos eventos existentes, são: `GetAllGroups`, `GetAllChats`, `CheckExistNumbers`, a criação de instância (QR) e o status de cada mensagem.
- **Limites de uso por minuto:** só estão escritos para os métodos de IA (60 por minuto por empresa; playground 10; melhorar prompt 5; excedeu = HTTP 429). Para `Send`, `SendBulk`, `PhoneState` e os demais, **não há limite escrito: NÃO CONFIRMADO**.

### 1.4 Três modos de ligar o número (o arquivo mostra os três)
| Modo | Como liga | Onde o arquivo fala |
|---|---|---|
| Instância tipo 1, QRCode | QR Code ou código de pareamento (pairing code). O arquivo chama de "conexão não-oficial" | `NewInstance` |
| Instância tipo 3, Oficial (Meta / WhatsApp Cloud) | Cadastro na Meta por link (`direct_link`). Não gera QR | `NewInstance`, `SendTemplateToProvider` |
| Extensão WhatsGW | Extensão de navegador (WhatsApp Web) | Só aparece em `SendChatState*` ("disponível somente pela Extensão") |

Tipo 2 ou outros tipos: o arquivo não descreve (**NÃO CONFIRMADO**).

---

## 2. Todos os endpoints, por assunto

São 88 caminhos: **62 métodos reais** (61 em `/WhatsGw/...` e 1 em `/Share/Tarefa`) e **26 caminhos "de exemplo"** em `/exemplos/...`. Os de exemplo não existem de verdade: o próprio arquivo diz que a chamada real é sempre `POST /WhatsGw/Send` (ver 2.12).

### 2.1 Envio e gestão de mensagens (6)
| Método | Para que serve | Observação importante |
|---|---|---|
| Send | Envia uma mensagem: texto, mídia, botões, template oficial, enquete, contato, localização, reação, resposta, edição | Tipo definido no corpo (`message_type` e campos extras) |
| SendBulk | Envia até 1000 mensagens numa chamada, podendo misturar tipos | Corpo é uma lista; resposta também é uma lista |
| Cancel | Cancela mensagem ainda pendente na fila | Só pendente. Usa `message_id` |
| DeleteMessage | Apaga mensagem já enviada ao destinatário | Segue as regras de tempo do app do WhatsApp |
| ClearChatMessages | Limpa as mensagens de uma conversa | Usa `phone_number` e `contact_phone_number` |
| GetBase64 | Baixa um arquivo de uma URL e devolve em base64 | Resposta `{ result, base64 }` |

### 2.2 Templates, Oficial/Meta (8)
| Método | Para que serve |
|---|---|
| GetTemplates | Lista templates da empresa (pode filtrar por instância) |
| GetTemplate | Detalhe de um template, com estado de sincronização com a Meta |
| NewTemplate | Cria template (nasce "Pendente") |
| SendTemplateToProvider | Manda o template para aprovação na Meta (instância precisa ser tipo 3) |
| SyncTemplateStatus | Consulta o estado atual na Meta e atualiza o registro local |
| UpdateTemplate | Edita template (só "Pendente" ou "Reprovado") |
| InactivateTemplate | Inativa ou reativa só dentro da WhatsGW (não apaga na Meta) |
| ChangeTemplateInstance | Move template (ou todos) para outra instância oficial, quando a oficial foi reconectada |

### 2.3 Grupos (12)
CreateGroup, GetAllGroups, GroupMetadata, GroupParticipantsUpdate (adicionar ou remover), GroupUpdateSubject (nome), GroupUpdateDescription, GroupSettingUpdate (ex.: só admins enviam), GroupInviteCode, GroupRevokeInvite, GroupAcceptInvite, GroupRequestParticipantsList (pedidos pendentes), GroupLeave. O robô de cobrança **não usa** grupos de clientes; as telas de grupo do protótipo são grupos internos da equipe.

### 2.4 Perfil (4)
GetProfile (nome e imagem do número conectado), SetProfileName, SetProfileStatus, SetProfilePic (imagem maior que 640x640).

### 2.5 Chat (5)
GetAllChats (lista de conversas e contatos; resposta vem por evento `chats`), ChatMetadata, SendChatStateComposing ("digitando"), SendChatStateRecording ("gravando"), SendChatStatePaused. Os três últimos só funcionam pela **Extensão WhatsGW**.

### 2.6 Instância (5)
| Método | Para que serve |
|---|---|
| NewInstance | Cria instância: tipo 1 (QR ou pairing code) ou tipo 3 (oficial) |
| GetInstance | Detalhes: status, número, tipo, link, código de pareamento, passkey, configurações |
| InstanceUpdate | Muda configurações da instância |
| RestartInstance | Reinicia instância desconectada; pode gerar novo QR |
| RemoveInstance | Remove, ou só desconecta (`disconnect_only`) |

### 2.7 Telefone (3)
PhoneList (lista telefones), PhoneState (estado: conectado ou não), PhoneUpdate (descrição, endereço do webhook, `interval`).

### 2.8 Base de conhecimento da IA (4)
KbUpsert (insere ou atualiza documento), KbReplaceAll (troca a base inteira), KbList, KbDelete (por `ref` ou limpa tudo com `clear_all`).

### 2.9 Agentes de IA, prompts, logs e playground (10)
IaIntegracaoList, IaPromptList, IaPromptGet, IaPromptUpdateSessoes (edita com versão automática), IaPromptVersoes, IaPromptRestaurarVersao (volta versão), IaPromptMelhorar (só sugere), IaLogsList, IaMetricas, IaPlaygroundEnviar (conversa de teste sem WhatsApp). Único grupo com limite por minuto escrito.

### 2.10 Conta e utilidades (5)
| Método | Para que serve |
|---|---|
| Balance | Consulta saldo (só `apikey`) |
| GetEvents | Busca eventos pendentes (alternativa ao webhook), em servidor próprio |
| Report | Pede relatório (o resultado vem como tarefa) |
| CheckExistNumbers | Diz quais números têm WhatsApp |
| Tarefa (`/Share/Tarefa`) | Acompanha e baixa o resultado de tarefas assíncronas, como o Report |

### 2.11 Os 16 eventos de webhook
Ver seção 4.

### 2.12 Os 26 caminhos de exemplo (não são métodos)
Todos chamam `POST /WhatsGw/Send`; só mudam o corpo.
- **Texto e mídia (15):** texto; editar mensagem; texto para grupo; PDF; PDF por URL; áudio PTT; áudio PTT por URL; vídeo; imagem; enquete; contato (vCard); localização; reação; resposta (citação); menções.
- **Botões (7):** lista, resposta rápida, URL, copiar, ligar, misto, carrossel.
- **Oficial/Meta com template (4):** texto, vídeo, documento PDF, imagem.

---

## 3. Detalhe dos métodos que o robô do IT.MK usa

Em todos os exemplos, troque `<APIKEY_DA_EMPRESA>` pela chave guardada no cofre (regra R10 do manual 10). Número no formato `5511999999999` (país + DDD + número, só dígitos).

### 3.1 Enviar texto (`Send`)
Endereço: `POST https://app.whatsgw.com.br/api/WhatsGw/Send`

Corpo mínimo (copiado e adaptado do arquivo):
```json
{
  "apikey": "<APIKEY_DA_EMPRESA>",
  "phone_number": "5511999999999",
  "contact_phone_number": "5511988888888",
  "message_custom_id": "itmk-cobranca-000123",
  "message_type": "text",
  "message_body": "Olá, Maria! Sua cobrança de setembro/2026 está pronta."
}
```

Campos (todos descritos no arquivo):
| Campo | O que é | Obrigatório? |
|---|---|---|
| `apikey` | Chave da empresa | Sim |
| `phone_number` | Número da WhatsGW que envia (origem). Pode ficar em branco se enviar `w_instancia_id` | Sim, ou `w_instancia_id` no lugar |
| `contact_phone_number` | Número de destino (ou id do grupo) | Sim |
| `message_type` | `text`, `image`, `document`, `video`, `audio`, `ptt` (e `poll`/outros nos exemplos) | Sim |
| `message_body` | Texto, ou URL, ou base64 da mídia | Sim |
| `message_custom_id` | "Id para uso livre": a WhatsGW recomenda usar um id do nosso sistema | Opcional, mas **Recomendação IT.MK: sempre usar** |
| `check_status` | `0`: se o número estiver desconectado, a WhatsGW aceita e envia quando reconectar. Padrão `1`. O padrão pode ser mudado em Administração, Telefones | Opcional |
| `schedule` | Data e hora para enviar. Formato do exemplo: `2021/04/01 21:00:00`. Fuso: **NÃO CONFIRMADO** | Opcional |
| `message_to_group` | `1` trata o destino como grupo (padrão 0) | Opcional |
| `w_instancia_id` | Envia pelo id da instância | Opcional |
| `simule_typing` | `1` simula "digitando" antes de enviar (padrão 1) | Opcional |
| `message_chat_type` | `user`, `group`, `lid`, `newsletter` | Opcional |

Regras escritas na descrição:
- Formatação: `\n` quebra linha, `_itálico_`, `*negrito*`, `~tachado~`, três crases para monoespaçado. Emoji unicode vale.
- O arquivo **não traz exemplo da resposta de sucesso** do `Send`. O texto do `Cancel` diz que o `message_id` é "retornado pelo método Send", então a resposta carrega um id de mensagem. O nome exato do campo na resposta: **NÃO CONFIRMADO** (provável `message_id`). Teste real obrigatório antes de programar.
- O arquivo não informa limite de tamanho do texto nem espaçamento automático entre envios (**NÃO CONFIRMADO**).

**Cuidado com `check_status`.** Para cobrança, o robô deve usar `check_status` igual a `1` (o padrão). Com `0`, uma mensagem pode ficar guardada e sair horas depois, quando o número voltar, talvez fora do horário permitido. **Recomendação IT.MK:** nunca enviar `check_status: 0`. O que o `1` faz exatamente quando o número está caído (recusa na hora?) o arquivo não diz: **NÃO CONFIRMADO**, testar.

Enviar PDF do "Extrato da cobrança" por URL (copiado e adaptado do exemplo "PDF via URL"):
```json
{
  "apikey": "<APIKEY_DA_EMPRESA>",
  "phone_number": "5511999999999",
  "contact_phone_number": "5511988888888",
  "message_custom_id": "itmk-extrato-000123",
  "message_type": "document",
  "message_body_mimetype": "application/pdf",
  "message_body_filename": "extrato.pdf",
  "message_caption": "Extrato da cobrança",
  "message_body": "https://exemplo.itmk.com.br/extrato/000123.pdf",
  "download": 1
}
```
Regras de mídia (descrição): `message_type` de mídia é `image`, `document`, `video`, `audio` ou `ptt` (áudio de voz). `message_body` é a URL **ou** o arquivo em base64. Em base64, `message_body_mimetype` e `message_body_filename` são **obrigatórios** e o envio deve ser POST. `download: 1` faz a API baixar o link. A WhatsGW "não adequa o arquivo": ele precisa estar num formato que o WhatsApp Web aceita. Para áudio, a sugestão é opus, 1 canal, 48000 Hz (a WhatsGW não converte). Tamanho máximo de arquivo: **NÃO CONFIRMADO**.

Só por instância QR (tipo 1): botões, lista, enquete, contato, localização, reação, resposta com citação e menções estão marcados "disponível somente quando conectado via instância". O arquivo avisa que os botões "voltaram em 15/02/2025" e que atualizações do WhatsApp podem mudar o comportamento.

Editar mensagem enviada: o mesmo `Send` com `"edit": {"key": {"id": "<id da mensagem no WhatsApp>"}}` e o novo texto. Regra de tempo para editar: **NÃO CONFIRMADO**.

### 3.2 Enviar com template oficial (instância tipo 3)
Exemplo do arquivo, adaptado (texto com 1 variável no corpo):
```json
{
  "apikey": "<APIKEY_DA_EMPRESA>",
  "phone_number": "5511999999999",
  "contact_phone_number": "5511988888888",
  "message_custom_id": "itmk-cobranca-000123",
  "message_type": "text",
  "message_body": "Olá, essa é uma mensagem de teste",
  "template": {
    "id": 22,
    "components": [
      { "type": "body", "parameters": [ { "type": "text", "text": "Maria" } ] }
    ]
  }
}
```
Regras escritas no arquivo:
- Fora da janela de 24 horas, **só** template aprovado pela Meta. Dentro da janela, texto livre.
- Cada componente (`header`, `body`, `footer`, `button`) é um item separado em `template.components`. Mídia no cabeçalho (`document`, `image`, `video`) vai no componente `header`, por `link`.
- Os parâmetros são **por posição** (`{{1}}`, `{{2}}`...), na ordem em que aparecem no texto.
- **Validações recusadas na hora**, com `result: fail` e o motivo em `result_message`:
  1. O número de parâmetros do `body` tem que ser igual ao número de variáveis do template aprovado. Antes isso era aceito e falhava depois, na entrega (erro `#132000` da Meta).
  2. `contact_phone_number` não pode ser igual ao `phone_number` da instância (erro `#100` da Meta).
- O `template.id` do exemplo é um número (22). Que esse número é o `d_template_id` devolvido por `GetTemplates`: **NÃO CONFIRMADO** (provável).
- O exemplo traz `message_body` preenchido mesmo com template. Se o texto de `message_body` é ignorado, usado como reserva ou usado no registro: **NÃO CONFIRMADO**.
- Se a WhatsGW bloqueia texto livre fora da janela de 24 h na instância tipo 3, ou se só a Meta recusa na entrega: **NÃO CONFIRMADO**.
- Botões de template (`QUICK_REPLY`, etc.) são definidos em `NewTemplate`; como a resposta do cliente a um botão chega ao webhook: **NÃO CONFIRMADO**.

Criar e aprovar um template (resumo do ciclo, tudo no arquivo):
1. `NewTemplate` com `apikey`, `w_instancia_id`, `nome` (não pode repetir na mesma instância), `d_template_categoria_id` (`1=MARKETING`, `2=UTILITY`, `3=AUTHENTICATION`), `w_mensagem_tipo` (`1=texto`, `2=imagem`, `3=vídeo`, `4=documento`, `9=localização`) e `dados_json` (`language` e `components`: `HEADER`, `BODY`, `FOOTER`, `BUTTONS`). Nasce "Pendente". Resposta: `d_template_id`.
2. `SendTemplateToProvider` (`d_template_id`): envia para a Meta. Depois disso o conteúdo **não muda**. Instância precisa ser tipo 3.
3. `SyncTemplateStatus` (`d_template_id`): pergunta à Meta o estado atual. Resposta traz `provider_sync` com `provider_status` (ex.: `PENDING`, `APPROVED`), `provider_category`, `provider_quality` (ex.: `GREEN`).
4. `GetTemplates` mostra `status` (ex.: "Aprovado") e `categoria` (ex.: `UTILITY`). `UpdateTemplate` só edita "Pendente" ou "Reprovado".
Aviso: a categoria final quem decide é a Meta (manual 10, seção 3.3). O arquivo só mostra a categoria que a Meta devolveu em `provider_category`.

### 3.3 Enviar em lote (`SendBulk`)
Endereço: `POST /WhatsGw/SendBulk`. Regra da descrição: "até 1000 mensagens" por chamada, podendo misturar texto, mídia e botões. **A resposta é uma lista** ("fique atento ao retorno, pois será um array").

Corpo: uma lista de corpos de `Send`, cada um com sua `apikey`:
```json
[
  {
    "apikey": "<APIKEY_DA_EMPRESA>",
    "phone_number": "5511999999999",
    "contact_phone_number": "5511988888888",
    "message_custom_id": "itmk-000123",
    "message_type": "text",
    "message_body": "Texto 1",
    "check_status": "1"
  },
  {
    "apikey": "<APIKEY_DA_EMPRESA>",
    "phone_number": "5511999999999",
    "contact_phone_number": "5511977777777",
    "message_custom_id": "itmk-000124",
    "message_type": "text",
    "message_body": "Texto 2",
    "check_status": "1"
  }
]
```
Não consta no arquivo: se a WhatsGW espaça os envios do lote, em que ordem e a que ritmo saem, se uma falha derruba o lote inteiro, formato exato de cada item da resposta. Tudo **NÃO CONFIRMADO**.

**Recomendação IT.MK:** o robô deve enviar **um por vez, a partir da fila do próprio IT.MK**, porque cada envio precisa passar pela verificação do protótipo (horário, limite, intervalo). Lote de 1000 de uma vez é o oposto do que reduz risco de banimento. Só usar `SendBulk` com lotes pequenos e depois de a WhatsGW confirmar o ritmo (pergunta W4 na seção 9).

### 3.4 Cancelar (`Cancel`)
Regra do arquivo: cancela mensagem **que ainda está pendente de envio, na fila**. "Só é possível enquanto a mensagem não foi processada/enviada."
```json
{ "apikey": "<APIKEY_DA_EMPRESA>", "message_id": "1234" }
```
`message_id` é o id "retornado no método Send". Se a mensagem já saiu, o `Cancel` falha; aí a única saída é `DeleteMessage` (que respeita as regras de tempo do WhatsApp). Mensagem com `schedule` conta como "pendente na fila"? **NÃO CONFIRMADO**. Cancelar um item de `SendBulk` por item: **NÃO CONFIRMADO**.

Uso no IT.MK: quando uma pausa geral ou "assumir conversa" acontecer, mensagens que já foram entregues à WhatsGW mas não saíram podem ser canceladas. Isso só funciona se guardarmos o id devolvido pelo `Send`.

### 3.5 Checar números (`CheckExistNumbers`)
```json
{
  "apikey": "<APIKEY_DA_EMPRESA>",
  "phone_number": "5511999999999",
  "numbers": "5511999999991,5511999999992,5511999999993"
}
```
- `numbers` é uma **lista separada por vírgula, dentro de um texto**.
- Resposta assíncrona: o resultado vem pelo evento `check_exists`, com `phone_number`, `w_instancia_id`, `exists` (lista dos que têm WhatsApp) e `nexists` (lista dos que não têm). O exemplo do arquivo repete os mesmos números nas duas listas: é só amostra.
- Não consta: limite de quantidade por chamada, se funciona com instância oficial (tipo 3), prazo da resposta.
- Uso: validar o telefone do pagador antes da primeira cobrança e reduzir "número sem WhatsApp" (que o painel do protótipo já mostra como erro de envio). Como `nexists` tem que ser guardado, o IT.MK deve marcar o pagador "sem WhatsApp" e não tentar de novo.

### 3.6 Saber o estado do telefone ou da instância
**PhoneState** (estado do telefone):
```json
{ "apikey": "<APIKEY_DA_EMPRESA>", "phone_number": "5511999999999", "w_instancia_id": "0" }
```
Pode usar `phone_number` ou `w_instancia_id` (nesse caso o número pode ir em branco). O arquivo **não traz o formato da resposta**; o evento `phonestate` (seção 4) usa `state` com `connected` ou `disconnected`. Se a resposta do método usa o mesmo campo: **NÃO CONFIRMADO**.

**PhoneList:** `{ "apikey": "<APIKEY_DA_EMPRESA>" }` lista os telefones da empresa. Resposta: **NÃO CONFIRMADO** (formato).

**GetInstance:** `{ "apikey": "<APIKEY_DA_EMPRESA>", "w_instancia_id": 131645 }`. A descrição lista os campos devolvidos dentro de `data`:
- `status` (estado atual), `number` (número conectado), `type` (tipo da instância), `direct_link` (link direto para o QR, quando houver), `pairing_code` (só no modo pareamento, enquanto espera conectar), `passkey_url` e `passkey_code` (quando o WhatsApp pede passkey), `config` (objeto de configurações).
- Os valores possíveis de `status` não estão no arquivo (só se vê o texto "Configurando na Meta" para a instância oficial antes de concluir). **NÃO CONFIRMADO** a lista.

**Recomendação IT.MK:** o botão "Testar conexão" do protótipo deve chamar `PhoneState` (ou `GetInstance`) de verdade e mostrar o que voltou. Frequência de consulta: o arquivo não dá limite; manter baixa (ex.: a cada alguns minutos) até a WhatsGW responder (pergunta W5).

### 3.7 Reconectar
Situação 1, instância caiu e só precisa subir de novo:
```json
{ "apikey": "<APIKEY_DA_EMPRESA>", "w_instancia_id": "123", "type": "1" }
```
`RestartInstance`: "caso sua instância esteja desconectada, você pode tentar reiniciar ela". Com `type = 1`, **se for necessário**, ela envia um evento de QR Code para nova leitura. (Com `type = 0` apenas reinicia.)

Situação 2, QR Code novo: o QR chega pelo evento `qrcode` (seção 4), como imagem em base64 (`data:image/png;base64,...`). O evento **não traz `phone_number`**, só `w_instancia_id`. Quem lê o QR é uma pessoa, com o celular do número.

Situação 3, código de pareamento (alternativa ao QR): `NewInstance` com `pairing_mode: 1` e `pairing_phone` (número com DDI). O código sai pelo evento `pairing` (campo `pairing_code`, por exemplo `ABCD-1234`) e também em `GetInstance`. A pessoa digita no WhatsApp: Configurações, Dispositivos conectados, Conectar com número de telefone. O evento se repete "a cada novo ciclo até esgotar as tentativas" (quantas tentativas: **NÃO CONFIRMADO**).

Situação 4, passkey: o WhatsApp passou a exigir passkey (WebAuthn) ao vincular alguns aparelhos. Então chega o evento `passkey` com `passkey_url` (link de uso único). O IT.MK **repassa o link à pessoa**, que abre e aprova no celular. Não precisa programar WebAuthn. Pode vir também `passkey_code` (formato `XXXX-XXXX`) para conferir. Quando termina, o texto diz que "a instância conecta normalmente (evento `connection`)". Esse evento `connection` **não tem exemplo nem campos no arquivo**: **NÃO CONFIRMADO** o formato. Use o `phonestate` e o `GetInstance` para saber que reconectou.

Criar instância nova (`NewInstance`): `type` (ou `tipo`) `1` QR (padrão) ou `3` oficial. Resposta traz `w_instancia_id`, `tipo` e `direct_link`. Na tipo 3 não há QR: abre-se o `direct_link` (`W-{uid}.aspx`) para o cadastro na Meta (Embedded Signup). O número fica "Configurando na Meta" até confirmar. Aviso do arquivo: "só é possível fazer a leitura de uma instância por vez".

`RemoveInstance` com `disconnect_only: 1` só desconecta; sem isso, remove. **Cuidado:** o protótipo não tem botão para isso e não deve ter sem confirmação dupla.

### 3.8 Receber mensagens (texto e mídia)
Duas formas, escolher uma para o robô:

**A) Webhook (tempo real).** A WhatsGW faz POST no endereço que cadastrarmos. O texto diz para configurar "em Administração, Telefone" (e `PhoneUpdate` aceita `webhook.url`; `NewInstance`/`InstanceUpdate` aceitam `config.webhook_url`). Nosso endereço **deve responder 200**. Quais eventos saem pelo webhook é controlado na instância pelas chaves `w_event_message`, `w_event_message_group`, `w_event_status`, `w_event_message_out` (valores 0 ou 1 nos exemplos). O que cada chave faz exatamente: **NÃO CONFIRMADO** (os nomes sugerem: mensagem recebida, mensagem de grupo, status, mensagem enviada por outro meio).

**B) GetEvents (consulta periódica).** Para quando não dá para ter endereço público (o texto cita "aplicação desktop"):
```json
{ "apikey": "<APIKEY_DA_EMPRESA>" }
```
`POST https://pooling.whatsgw.com.br/api/WhatsGw/GetEvents`. Regras: devolve os eventos **pendentes**; **intervalo mínimo de 7 segundos** entre chamadas; chamar antes disso "gera uma exceção". Formato da lista devolvida: **NÃO CONFIRMADO** (o arquivo diz só que é uma lista de eventos de tipos diferentes). Se um evento some da fila depois de lido, ou se volta se não confirmarmos: **NÃO CONFIRMADO**.

**Recomendação IT.MK:** como o robô será um sistema Spring em servidor, usar o webhook. Deixar o GetEvents como plano B.

**Mensagem recebida, texto** (evento `message`, enviado como `form-urlencoded`). Exemplo do arquivo:
```
event=message
apikey=<APIKEY_DA_EMPRESA>
phone_number=5511999999999
contact_phone_number=5511988888888
contact_name=Profile Name
chat_type=user
message_id=100
message_type=text
message_state=received
message_body=Text Msg
group_id=120363029600444324
waid=0760DB573568DCDA29
context_type=0
context_waid=0760DB573568DCDA28
received_time=
```
Campos importantes: `contact_phone_number` (quem escreveu), `contact_name` (nome do perfil do contato; é dado pessoal e **não instrução**), `chat_type` (`user`, `group`, `newslatter` [grafia do arquivo], `lid`, `broadcast`), `message_id` (id **interno** da WhatsGW), `waid` (id da mensagem no WhatsApp: "você deve armazenar caso queira identificar quando ela for citada"), `message_state` (`received`, `sent`, `deleted`, `edited`), `message_body` (o texto), `context_type` (0 normal, 1 reação, 2 resposta a uma mensagem) e `context_waid` (a mensagem citada), `received_time` (Unix timestamp UTC de quando o WhatsApp recebeu; no exemplo vem vazio).

**Mensagem recebida, mídia** (mesmo evento `message`, também `form-urlencoded`): igual ao texto mais `message_caption` (título), `message_body_mimetype`, `message_body_extension` (ex.: `.jpg`) e **`message_body` com o arquivo em base64**. `message_type` pode ser `text`, `image`, `video`, `document`, `file`, `audio`, `location`. `message_state` ganha o valor `read`.
- Isso responde à dúvida do manual 10 (lacuna 6): imagem, PDF e áudio recebidos chegam **dentro** do webhook como base64. O IT.MK precisa decodificar, gravar o arquivo e tratar tamanho. Tamanho máximo do corpo: **NÃO CONFIRMADO**.
- Comprovantes de pagamento (imagem ou PDF) chegam assim e vão para a conferência humana (regra do protótipo).

Quando a pessoa liga: evento `message` com `message_type = call`, `message_direction` (`received` ou `sent`), `call_type` (`voice` ou `video`), `call_duration` (segundos; `0` = não atendida). Distingue-se das mensagens pelo `message_type`.

### 3.9 Status de entrega (mensagem que enviamos)
Evento `status`, `form-urlencoded`. Exemplo do arquivo:
```
event=status
apikey=<APIKEY_DA_EMPRESA>
phone_number=5511999999999
contact_phone_number=5511988888888
contact_name=Profile Name
chat_type=user
message_id=100
message_type=image
message_state=read
waid=0760DB573568DCDA29
```
`message_state`:
| Valor | Significado (texto do arquivo só lista os nomes; o sentido é leitura nossa) |
|---|---|
| `delivered2server` | Chegou ao servidor do WhatsApp |
| `delivered2user` | Chegou ao aparelho do cliente |
| `read` | Cliente leu |
| `notwa` | Número **não tem WhatsApp** |
| `notsent` | Não foi enviada |

- O arquivo não explica cada valor; a leitura acima é **Recomendação IT.MK** (interpretação pelos nomes), confirmar na prática (pergunta W6).
- **Importante:** o evento `status` **não traz `message_custom_id`** nem a hora. Para ligar o status à nossa cobrança, é preciso guardar o id que o `Send` devolveu (`message_id`). Se o `message_custom_id` aparece em algum evento: **NÃO CONFIRMADO**.
- O motivo do `notsent` (e se há código de erro da Meta no oficial, como `#132000`): **NÃO CONFIRMADO**.
- Marcação de "lida" depende de o cliente ter recibo de leitura ligado; o arquivo não fala disso.

### 3.10 Saúde da conta (`account_health`)
Evento JSON. Envelope:
```json
{
  "event": "account_health",
  "apikey": "<APIKEY_DA_EMPRESA>",
  "phone_number": "5511999999999",
  "w_instancia_id": 123,
  "data": {
    "status": "ok",
    "enforcementType": null,
    "endsAt": null,
    "source": "daily_check",
    "checkedAt": "2025-05-19T08:00:00.000Z",
    "messageCapping": {
      "cappingStatus": "NONE",
      "totalQuota": 1000,
      "usedQuota": 320,
      "cycleStart": "2025-05-01T00:00:00.000Z",
      "cycleEnd": "2025-05-31T23:59:59.000Z",
      "oteStatus": "ENABLED",
      "mvStatus": "VERIFIED"
    },
    "lastDisconnect": null
  }
}
```
(O campo `raw` também vem; o arquivo diz que é só para "debug avançado".)

`data.status` e o que fazer (tabela do próprio arquivo):
| `status` | O que significa | Ação |
|---|---|---|
| `ok` | Tudo certo | Nada. Olhar `messageCapping.cappingStatus` |
| `restricted` | Conta restrita (campos `enforcementType`, `endsAt`) | **PARAR os envios na hora.** "Cada nova tentativa piora a restrição." Esperar até `endsAt`. Não há contestação pela API; só pelo app do WhatsApp |
| `critical` | Instância foi desautenticada | Reconectar por QR Code. Não há recuperação automática. Códigos em `lastDisconnect.statusCode`: 401 = loggedOut, 403 = forbidden, 411 = multideviceMismatch |

`messageCapping.cappingStatus`: `NONE` (normal), `FIRST_WARNING` (perto do limite), `SECOND_WARNING` (muito perto), `CAPPED` (limite atingido: **novas conversas iniciadas pela empresa ficam bloqueadas**; respostas em conversas existentes continuam).

Quando o evento é disparado (`data.source`): `connection_update`, `open_check` (cerca de 6 s depois de reconectar), `ack_463` (primeira mensagem com código 463 do dia), `daily_check` (1 vez a cada 24 h), `capping_update`, `critical_disconnect` (desconexão com 401, 403 ou 411), `local_threshold_80`, `local_threshold_90`, `local_threshold_100` (contador **local** da WhatsGW passou de 80%, 90% e 100% da cota; sem chamar a API).

Deduplicação (do próprio arquivo): só dispara de novo se mudar `status`, `enforcementType`, `cappingStatus` ou o código de desconexão. Cada limite local (80, 90, 100) dispara no máximo 1 vez por dia UTC.

Pontos que o arquivo **não** esclarece:
- Fala em "conta WhatsApp Business associada à instância" e em cota/ciclo (`totalQuota`, `cycleStart`). Se esse evento vale também para instância QR tipo 1 com WhatsApp comum: **NÃO CONFIRMADO**. O exemplo (cota 1000, ciclo mensal) lembra os limites de mensagens da Meta, que no manual 10 (seção 3.5) eram por 24 horas. A relação com o limite da Meta: **NÃO CONFIRMADO**.
- Significado de `oteStatus` e `mvStatus`: o arquivo só mostra `ENABLED` e `VERIFIED` como exemplo. **NÃO CONFIRMADO**.
- De onde vem a "cota" (`totalQuota`) de uma instância QR: **NÃO CONFIRMADO**.

### 3.11 Relatórios (`Report` e `Tarefa`)
Passo 1, pedir:
```json
{
  "apikey": "<APIKEY_DA_EMPRESA>",
  "tipo_relatorio": "ANALÍTICO",
  "inicio": "2026-09-30 00:00:00",
  "fim": "2026-09-30 23:59:59",
  "filtro": "w_mensagem_id=1234"
}
```
Passo 2: a resposta traz `tarefa_id` (número na fila de processamento). Passo 3: `POST /Share/Tarefa` com `{ "apikey": "...", "tarefa_id": 4088 }` para acompanhar e, quando concluído, baixar o arquivo.

Regras do texto:
- `tipo_relatorio` citados: ANALÍTICO, POR STATUS, ANALÍTICO ATENDIDAS. A lista completa está na tela da plataforma (Monitoração, Relatórios, campo Tipo). Não está no arquivo.
- `inicio` e `fim`: período. `filtro`: filtra pelos campos do resultado (exemplo `w_mensagem_id=1234`). `rotas`: lista de ids de rota (Administração, Rotas).
- "Especialmente para relatórios ANALÍTICOS com períodos maiores, recomendamos fazer a requisição após as 22 h ou em períodos menores."
- Os campos de cada linha do relatório, o formato do arquivo baixado e o prazo para ficar pronto: **NÃO CONFIRMADO**.
- Uso no IT.MK: **conferência diária** (nossa fila contra o que a WhatsGW diz que enviou), depois das 22 h. Não serve para tempo real.

### 3.12 Saldo (`Balance`)
`{ "apikey": "<APIKEY_DA_EMPRESA>" }`. Texto do arquivo: só "Endpoint Balance da API WhatsGW" e o campo da chave. Formato da resposta (valor, moeda, mensagens restantes): **NÃO CONFIRMADO**. Útil para o plano "por mensagem" (manual 10, seção 2.3): alerta de saldo baixo.

### 3.13 Configurar o endereço do webhook
`PhoneUpdate`:
```json
{
  "apikey": "<APIKEY_DA_EMPRESA>",
  "phone_number": "5511999999999",
  "w_instancia_id": 0,
  "description": "robo-cobranca",
  "webhook": { "url": "https://robo.itmk.com.br/webhooks/whatsgw/<SEGREDO_NA_URL>" },
  "interval": 0
}
```
- `interval`: aparece no exemplo com valor `0` e **sem nenhuma explicação**. Pode ser um intervalo entre envios do telefone, mas o arquivo não diz. **NÃO CONFIRMADO** (pergunta W3: é a única pista de "controle de ritmo" da API).
- `InstanceUpdate`: muda `description`, `use_store`, `auto_chats`, `auto_groups`, `mark_read`, `webhook_url` e os `w_event_*` (explicação dos campos de sincronização: só os nomes; **NÃO CONFIRMADO** o efeito).
- O texto do segredo na URL é **Recomendação IT.MK** (ver seção 4.3).

---

## 4. Eventos de webhook

### 4.1 Os 16 eventos
Seu endereço deve responder **200** a todos. O arquivo diz isso em todos os 16.

"Formato" é o tipo de corpo do exemplo do arquivo. O robô precisa aceitar os dois.

| Evento (`event`) | Quando acontece | Formato | Campos importantes |
|---|---|---|---|
| `message` (texto recebido) | Chega mensagem de texto (e variações: apagada, editada, enviada por outro meio) | form-urlencoded | `phone_number`, `contact_phone_number`, `contact_name`, `chat_type`, `message_id`, `waid`, `message_type`, `message_state` (received, sent, deleted, edited), `message_body`, `group_id`, `context_type`, `context_waid`, `received_time` |
| `message` (mídia recebida) | Chega imagem, vídeo, documento, áudio, localização | form-urlencoded | Os de cima mais `message_caption`, `message_body_mimetype`, `message_body_extension`, `message_body` (base64). `message_state` também `read` |
| `status` | Mudança de estado de uma mensagem que enviamos | form-urlencoded | `message_id`, `waid`, `message_state` (delivered2server, delivered2user, read, notwa, notsent), `contact_phone_number` |
| `phonestate` | Telefone conectou ou desconectou | form-urlencoded | `phone_number`, `state` (connected, disconnected), `w_instancia_id` |
| `qrcode` | Novo QR para ler (depois de `NewInstance` ou `RestartInstance`) | JSON | `w_instancia_id`, `qrcode` (imagem base64). **Sem `phone_number`** |
| `pairing` | Código de pareamento (alternativa ao QR) | JSON | `w_instancia_id`, `pairing_code`, `pairing_phone`. Sem `phone_number` |
| `passkey` | WhatsApp exigiu passkey no vínculo | JSON | `w_instancia_id`, `passkey_url`, `passkey_code` (opcional), `skip_handoff_ux` (opcional; `true` = confirmação do código é automática) |
| `message` (chamada recebida) | Número recebeu chamada de voz ou vídeo | form-urlencoded | `message_type = call`, `message_direction = received`, `call_type`, `call_duration` (0 = não atendida), `waid`, `received_time` |
| `message` (chamada feita) | Número fez chamada | form-urlencoded | Igual, com `message_direction = sent` |
| `presence_update` | Presença do contato mudou (digitando, gravando, online) | JSON | `phone_number`, `data.id`, `data.presences.<id>.lastKnownPresence` (`available`/`online`, `composing`, `recording`, `paused`, `unavailable`) |
| `groups` | Resposta de `GetAllGroups` | JSON | `groups[]` com `id`, `name`, `participants` |
| `chats` | Resposta de `GetAllChats` | JSON | `chats[]` com `id` e `contact` (`pushname`, `formattedName`, `isBusiness`, `type`, `profilePicThumbObj`) |
| `check_exists` | Resposta de `CheckExistNumbers` | JSON | `w_instancia_id`, `exists[]`, `nexists[]` |
| `account_health` | Saúde da conta mudou ou checagem diária | JSON | `data.status` (ok, restricted, critical), `data.enforcementType`, `data.endsAt`, `data.source`, `data.messageCapping.*`, `data.lastDisconnect.*` |
| `history_progress` | Progresso de sincronização do histórico após ler QR ou reconectar | JSON | `data.progress` (0 a 100), `data.done` (true só no final, 1 vez), `data.total.*`, `data.syncType` |
| `message_replay_done` | Fim do reenvio (replay) de mensagens do histórico | JSON | `w_instancia_id`, `data.sync_type` (`initial` ou `partial`) |

Notas:
- A tabela tem as 16 entradas do arquivo. Quatro delas (texto, mídia, chamada recebida, chamada feita) usam o mesmo valor `event = message`: diferencie por `message_type` (`call` para chamadas) e `message_direction`.
- Há **mais um evento citado no texto e sem exemplo**: `connection` (citado em `passkey`). **NÃO CONFIRMADO** o formato.
- O evento `message` aparece com `chat_type` de `user`, `group`, `newslatter`, `lid` e `broadcast`. **Recomendação IT.MK:** o robô de cobrança só trata `chat_type = user` ligado a um pagador conhecido; grupo, canal e `broadcast` não disparam cobrança.
- Chat do tipo `lid` (identificador interno do WhatsApp): o arquivo não diz se `contact_phone_number` traz telefone nesse caso. **NÃO CONFIRMADO.** Risco de não conseguir ligar a resposta ao pagador (seção 8).
- `history_progress`: pode vir "dezenas ou centenas de vezes". O handler deve ser leve. Descartar progresso menor que o anterior. A WhatsGW "não reprocessa" esse evento.
- `message_replay_done`: depois de reconectar, a WhatsGW pode reenviar mensagens do histórico ou perdidas. Esses reenvios podem trazer **mensagens antigas** pelo webhook (ver 4.3).

### 4.2 Estados da mensagem (resumo)
- Recebida: `received`, `sent` (enviada pelo nosso aplicativo ou por outro meio, no evento de mídia), `read`, `deleted`, `edited`.
- Enviada (evento `status`): `delivered2server`, `delivered2user`, `read`, `notwa`, `notsent`.

### 4.3 Como validar e deduplicar
O arquivo **não** traz assinatura, segredo, lista de IPs, política de reenvio, tempo de espera (timeout) nem garantia de ordem ou de "uma vez só" para a maioria dos eventos. Tudo isso é **NÃO CONFIRMADO**. As únicas garantias escritas: `account_health` é deduplicado no backend; `history_progress` não é reprocessado; o endereço deve responder 200.

**Recomendação IT.MK (nossa, não da WhatsGW):**
1. **Validar origem.** (a) Comparar o `apikey` do corpo com a nossa chave (comparação segura). (b) Colocar um segredo longo no caminho do endereço cadastrado (`.../webhooks/whatsgw/<segredo>`). (c) Só HTTPS. (d) Se a WhatsGW informar os IPs de saída, liberar só eles (pergunta W7). (e) Guardar o corpo bruto para auditoria (com cuidado com dado pessoal; base64 de mídia vai para arquivo, não para o log).
2. **Responder 200 rápido e processar depois** (regra R11 do manual 10): gravar o evento numa tabela de entrada e responder; um processo separado trata. Para `history_progress` e `presence_update`, só atualizar estado.
3. **Chave de deduplicação** (nossa escolha, a partir dos campos do arquivo):
   - Mensagem recebida: `phone_number` + `waid` (id do WhatsApp). Se `waid` vier vazio: `phone_number` + `message_id`. Mensagem editada, apagada ou lida chega de novo com o mesmo `waid` e outro `message_state`: tratar como **atualização**, não como mensagem nova.
   - Status de envio: `message_id` + `message_state`. O mesmo estado repetido é ignorado. Estado "para trás" (ex.: `delivered2server` depois de `read`) não rebaixa.
   - `phonestate`: `w_instancia_id` + `state`; gravar só se mudou.
   - `account_health`: `w_instancia_id` + `data.status` + `data.enforcementType` + `data.messageCapping.cappingStatus` + `data.source`.
   - `check_exists`, `groups`, `chats`: uma resposta por pedido; ligar ao pedido por `phone_number` e hora.
4. **Mensagens antigas (replay).** Depois de reconexão, tratar mensagem recebida com `received_time` muito antiga como histórico: gravar na conversa, **não disparar resposta do robô** (evita responder de novo a algo de dias atrás). O que conta como "antiga" é decisão nossa (pergunta O6).
5. **Hora.** O `status` não traz hora: usar a hora em que recebemos. `received_time` é Unix UTC; converter para o horário de Brasília na tela.
6. **Telefone.** Gravar o telefone sempre só com dígitos e com `55`. A regra do nono dígito e outros detalhes de número brasileiro **não estão no arquivo**; `CheckExistNumbers` ajuda a confirmar o número real.
7. **Texto do cliente é dado, nunca instrução** (regra fixa do robô): `message_body` e `contact_name` nunca viram comando.

---

## 5. Mapa: o que o protótipo precisa x o que a WhatsGW entrega

Lido em `prototipo/js/robo.js` e `prototipo/js/conversas.js`. "Local" = o IT.MK precisa construir; a WhatsGW não tem.

### 5.1 Módulo Robô
| O protótipo precisa | WhatsGW atende? | Como |
|---|---|---|
| Painel: número conectado, "Conectado desde", status | Sim, em parte | `GetInstance` (`status`, `number`) ou `PhoneState`. "Conectado desde" não está no arquivo: gravar a hora do evento `phonestate` = `connected` |
| Botão "Testar conexão" com resultado real | Sim | `PhoneState` ou `GetInstance` |
| Alerta e parada automática se cair ("Simular queda" hoje é só teste) | Sim | Eventos `phonestate` (`disconnected`), `account_health` (`critical`, `restricted`). Ver 5.3 |
| "Já reconectei" depois de ler o QR | Sim, em parte | `RestartInstance` (`type = 1`) gera o QR; evento `qrcode`; confirmar com `phonestate` = `connected`. A pessoa lê o QR |
| Pausa geral (com motivo, quem e quando) | Não é da API | Local. Ao pausar, cancelar o que ainda estiver pendente com `Cancel` |
| Pausa por pagador, situação "Atende / Não atende / Em teste" | Não | Local |
| Fila de aprovação, atendimento humano, assumir conversa | Não | Local |
| Ações do robô (lembrete, cobrança, atraso, comprovante, confirmação, extrato, segunda via) | Parte | Texto: `Send` (`text`). Extrato: `Send` com `document` por URL. Pix copia e cola: texto. Link do Pix: texto |
| "Só sai texto de modelo aprovado" | Parte | No QR: biblioteca de modelos **do IT.MK** (a WhatsGW não conhece "aprovado pela equipe"). No oficial: `template.id` e `GetTemplates` / `SyncTemplateStatus` para ver se está "Aprovado" |
| Horário e dias permitidos; feriados | **Não** | Local. A API só tem `schedule` (agendar), e o fuso não está confirmado |
| Limite por dia, por pagador, intervalo mínimo | **Não** (ver 5.4) | Local |
| Verificação "Número do WhatsApp conectado" antes de enviar | Sim | `PhoneState` ou o último estado gravado pelo `phonestate` |
| Verificação de promessa, acordo, contestação, pagamento | Não | Local |
| Modo sombra e "Em teste" (só sugere) | Não | Local (nunca chamar `Send`). Para teste, só números internos da equipe (regra R14) |
| Simulador | Não | Local; nunca chama a API |
| Painel: cobranças enviadas, erros de envio ("número sem WhatsApp") | Sim | Eventos `status`: `delivered2user`, `read`, `notwa`, `notsent`; resultado `fail` do `Send`. Cruzar com `Report` |
| Painel: respostas dos clientes | Sim | Evento `message` recebido |
| Painel: Pix gerados, pagos, valor recuperado | Não | Vem da cobrança do IT.MK, não do WhatsApp |
| Passadas para uma pessoa | Não | Local |
| Auditoria (mensagem, resultado, regra que liberou) | Parte | Gravar localmente: nosso `message_custom_id`, o id devolvido pelo `Send`, `waid`, estado. `Report` serve de conferência |
| Saldo (plano por mensagem) | Sim | `Balance` (formato da resposta não confirmado) |
| Validar telefone do pagador | Sim | `CheckExistNumbers` |

### 5.2 Módulo Conversas
| O protótipo precisa | WhatsGW atende? | Como |
|---|---|---|
| Lista de conversas, busca, abas (sem resposta, comprovantes, atraso...) | Não | Local: base própria montada com os eventos `message`. `GetAllChats` pode ajudar com nome e foto |
| Receber texto, imagem, PDF, áudio | Sim | Evento `message` (mídia em base64) |
| Enviar texto, anexo, áudio | Sim | `Send` (`text`, `image`, `document`, `video`, `ptt`) |
| Cobrança manual ("Enviar cobrança") | Sim | `Send` |
| Responder citando uma mensagem | Sim, só instância QR | `quoted.key.id` com o `waid` da mensagem |
| Editar mensagem enviada | Sim | `Send` com `edit.key.id`. Limite de tempo: não confirmado |
| Apagar mensagem enviada | Sim | `DeleteMessage` (regras de tempo do WhatsApp). Mensagem apagada pelo cliente chega com `message_state = deleted` |
| Mostrar "editada" pelo cliente | Sim | `message_state = edited` |
| Encaminhar | Não tem método próprio | Novo `Send` com o conteúdo |
| Marcar como lida / contador de não lidas | Parte | Contador é local. A instância tem a chave `mark_read`; efeito exato: não confirmado |
| "Digitando..." do atendente | Só na Extensão | `SendChatStateComposing` e outros. Em instância QR, não |
| Ver que o cliente está digitando | Sim | Evento `presence_update` |
| Respostas rápidas (`/pix`, `/comprovante`...) | Não | Local |
| Nota interna (só equipe vê) | Não | Local; **nunca** enviar |
| Assumir conversa / Robô ON/OFF por conversa / dono / etiqueta / fixar / arquivar | Não | Local |
| Grupos internos da equipe | Sim | `message_to_group`, `group_id`, `chat_type = group`, métodos de grupo |
| Comprovante recebido para conferir | Sim | Evento `message` com mídia; a conferência é local |
| Ligações perdidas | Sim | Evento `message` com `message_type = call` |

### 5.3 Alerta de desconexão (como montar)
O que a WhatsGW dá:
1. `phonestate` com `state = disconnected` (aviso direto).
2. `account_health` com `status = critical` e `lastDisconnect` (401 loggedOut, 403 forbidden, 411 multideviceMismatch), fonte `critical_disconnect`.
3. `account_health` com `status = restricted` (conta restrita até `endsAt`).
4. `qrcode` (a instância pede nova leitura).
5. `PhoneState` e `GetInstance` para checar por conta própria.

O que fica por conta do IT.MK:
- Ao receber qualquer um de 1, 2 ou 3: **gravar o estado, pausar o robô e abrir o alerta** (no topo da tela, como no protótipo, e fora da tela: e-mail ou mensagem; o canal é decisão do dono, pergunta O2).
- Em `restricted`: não basta pausar até a pessoa clicar; o robô só volta depois de `endsAt` **e** de confirmação humana.
- Em `critical`: exige QR (ou pareamento). Não tentar reenviar.
- Plano B: conferir `PhoneState` em intervalo regular (frequência a combinar com a WhatsGW, pergunta W5), porque o arquivo não promete que o evento de queda chegue sempre nem em quanto tempo. O tempo máximo de aviso: **NÃO CONFIRMADO**.
- O texto atual do protótipo ("leia o QR novamente") vale só para o modo QR. No modo oficial não existe QR (ver 5.6).

### 5.4 Limites (a API tem controle próprio?)
Resposta curta: **não tem controle de limite diário, de fila por horário nem de intervalo que possamos configurar**, exceto pistas abaixo.

| Controle | O que o arquivo mostra |
|---|---|
| Limite diário de envios do nosso lado | **Não existe** |
| Limite por destinatário | **Não existe** |
| Horário e dias permitidos, feriados | **Não existe** (só `schedule` para marcar uma data e hora de saída) |
| Fila | Existe uma fila interna (o `Cancel` fala em "pendente na fila"), mas **não há método para listar nem ver tamanho da fila** |
| Ritmo entre mensagens | Só duas pistas: `simule_typing` (simula digitação antes de cada envio, padrão ligado) e `PhoneUpdate.interval` (sem explicação). Intervalo real entre envios: **NÃO CONFIRMADO** |
| Cota de mensagens | `account_health.messageCapping` (`cappingStatus`, `totalQuota`, `usedQuota`) e avisos locais em 80, 90 e 100% da cota. É aviso da conta, não limite configurável. A quem se aplica (QR ou oficial): **NÃO CONFIRMADO** |
| Parada por restrição | `account_health` com `restricted` e `endsAt` |
| Limite de chamadas à API | Só para IA (60 por minuto). Envio: não escrito |
| Tamanho de lote | `SendBulk`: até 1000 |

Portanto os controles do protótipo (limite por dia = 40, por pagador = 1, intervalo = 180 min, horário 09:00 às 17:30, feriados) **têm que ser feitos no IT.MK**: uma fila própria que só entrega à WhatsGW (`Send`) o que passou na verificação, no momento certo. Use `schedule` só se a WhatsGW confirmar fuso e como cancelar (perguntas W2 e W8). Os avisos de cota (80, 90, 100%) servem de **segundo freio**, não de substituto.

### 5.5 Opt-out ("parar", "sair", "não quero")
- A API **não tem** lista "não contatar", palavra de parada, nem registro de opt-in. Isso é todo do IT.MK (ver seção 6).
- O que a API entrega para o IT.MK montar: o texto do cliente (evento `message`, `message_body`), quem escreveu (`contact_phone_number`) e `waid`.
- Fluxo sugerido (**Recomendação IT.MK**): ao chegar mensagem, comparar com palavras de parada (lista nossa, sem acento e em minúsculas: "parar", "sair", "não quero", "pare"...); se bater, marcar o pagador "Não atende" com motivo "pediu para parar", gravar a mensagem na auditoria, criar item para a equipe, e bloquear toda saída para esse número na fila. Dúvida de frase ambígua vai para humano.
- No modo oficial, botões de resposta rápida no template (por exemplo "Parar") ajudam, mas a forma como o clique chega ao webhook não está no arquivo (**NÃO CONFIRMADO**).

### 5.6 Modo oficial x QR (tipo 3 x tipo 1)
| Ponto | Tipo 1 (QR) | Tipo 3 (Oficial/Meta) |
|---|---|---|
| Como o arquivo descreve | "conexão não-oficial", por QR ou pairing code | "Oficial (Meta / WhatsApp Cloud)", "não gera QRCode" |
| Ligar | Evento `qrcode` ou `pairing`; ainda `passkey` | `direct_link` para cadastro na Meta (Embedded Signup); estado "Configurando na Meta" |
| Reconectar | `RestartInstance` com `type = 1`, QR novo | Não há QR. Como religar uma oficial caída: **NÃO CONFIRMADO**. O arquivo só diz que reconectar (excluir e criar de novo) perde o vínculo local dos templates, e `ChangeTemplateInstance` refaz |
| Texto livre | Sim, a qualquer hora | Só dentro da janela de 24 h; fora, só template aprovado |
| Template | Não se aplica | `NewTemplate`, `SendTemplateToProvider` (exige tipo 3), `template.id` no `Send` |
| Botões, enquete, contato, localização, reação, citação | Sim, "somente por instância" | Botões vêm no template; os demais: **NÃO CONFIRMADO** |
| Digitando / gravando | Não (só Extensão) | Não |
| `account_health` | Aplicável? **NÃO CONFIRMADO** | Provável (fala em conta Business e cota) |
| Status de entrega | `status` com `message_state` | Idem; erros da Meta tipo `#132000` aparecem depois da entrega se não passar nas validações |
| Validações extras na hora do envio | Nenhuma citada | Parâmetros do corpo = variáveis do template; destino diferente do número de origem |

Impacto no protótipo: o aviso "leia o QR novamente" e o botão "Já reconectei" valem só para o tipo 1. Para suportar o tipo 3 o IT.MK precisa de: biblioteca de modelos com `template.id` e variáveis posicionais, estado do template (Aprovado, Pendente, Reprovado), e a regra de janela de 24 h (saber quando o cliente escreveu por último, usando `received_time`).

Observação sobre a política de cobrança de dívidas da Meta: ver D2 no manual 10. O arquivo da WhatsGW não fala nada sobre isso.

---

## 6. O que a API NÃO oferece (o IT.MK precisa construir)

1. **Limite diário nativo** de envios (por empresa, por número ou por destinatário).
2. **Limite semanal** ou por período por pagador.
3. **Horário comercial, dias da semana e feriados** do envio.
4. **Intervalo mínimo configurável** entre mensagens (só há pistas sem explicação: `interval` e `simule_typing`).
5. **Opt-out**: palavra de parada, lista "não contatar", bloqueio de número. Nem o oposto (registro de opt-in, quando e como o pagador aceitou).
6. **Aquecimento do número** (subida gradual de volume).
7. **Indicador de bloqueios e denúncias** (taxa de bloqueio pelos clientes). O mais próximo é `account_health` (`restricted`, `cappingStatus`).
8. **Corte automático** por sinal de problema (falhas em sequência, queda repetida). Só avisa; quem pausa é o IT.MK.
9. **Aprovação humana, modo sombra, "Em teste"**, simulação.
10. **Modelo de mensagem aprovado pela equipe** no modo QR (a WhatsGW só gerencia template oficial da Meta).
11. **Assinatura do webhook** e controle de repetição (dedupe) próprio.
12. **Fila visível**: não há método para listar nem contar mensagens pendentes.
13. **Número separado** do atendimento humano: é decisão de operação (D3 do manual 10), não da API.
14. **Auditoria própria e prazo de guarda** (LGPD, D6).
15. **Registro de pagamento, Pix, competência, promessa, acordo, contestação**: nada disso existe na WhatsGW.
16. **Ligação entre status e cobrança**: o evento `status` não traz o nosso `message_custom_id` (a ligação é por `message_id`).

---

## 7. Checklist de critérios de aceite (Integrações do robô)

Para colar nos itens BL-xx (quem escreve os itens é o dono). Marque em caixa quando pronto. Complementa o checklist do manual 10 (seção 12), agora com os campos reais.

### 7.1 Conexão e estado
- [ ] A chave `apikey` fica só em cofre ou variável secreta; nunca no código, no log, na tela ou na URL.
- [ ] "Testar conexão" chama `PhoneState` ou `GetInstance` e mostra o que a WhatsGW respondeu (conectado ou não), nunca texto fixo.
- [ ] O painel mostra o número (`number`) e a hora da última conexão (hora do evento `phonestate` = `connected`).
- [ ] Evento `phonestate` com `disconnected` muda o painel para "Desconectado", pausa os envios e cria o alerta.
- [ ] Evento `account_health` com `critical` ou `restricted` pausa o robô e cria alerta com o motivo (401, 403, 411 ou `endsAt`).
- [ ] Em `restricted`, nenhum envio sai até passar `endsAt` e uma pessoa liberar.
- [ ] Alerta de desconexão chega à equipe fora da tela (canal definido pelo dono).
- [ ] Reconexão: botão chama `RestartInstance` (`type = 1`), mostra o QR recebido pelo evento `qrcode`, e só libera o robô depois de `phonestate` = `connected` mais confirmação humana.
- [ ] Evento `passkey` mostra o `passkey_url` para a pessoa abrir.
- [ ] Verificação do estado por consulta periódica funciona como plano B (frequência combinada com a WhatsGW).

### 7.2 Envio
- [ ] Todo envio passa pela verificação do protótipo (robô ligado, número conectado, pagador atende, ação liberada, dia e horário, feriado, limite do dia, limite do pagador, intervalo, competência, sem promessa, acordo ou contestação).
- [ ] Os limites do dia, do pagador e o intervalo são **contados de verdade** na fila do IT.MK.
- [ ] Todo `Send` leva `message_custom_id` com o id da nossa cobrança e `check_status` igual a `1` (nunca `0`).
- [ ] O id devolvido pelo `Send` é gravado junto da cobrança e do `message_custom_id`.
- [ ] Resposta com `result = fail` é registrada com o `result_message`, tenta de novo poucas vezes (número a definir) e não duplica a mensagem.
- [ ] Envio é feito um por vez; `SendBulk` só com decisão registrada.
- [ ] No modo QR, só sai texto de modelo aprovado pela equipe; versão do modelo gravada no envio.
- [ ] No modo oficial, o modelo está "Aprovado" (`SyncTemplateStatus`) e o número de parâmetros do corpo bate com o número de variáveis do template.
- [ ] Mensagem ainda pendente é cancelada com `Cancel` quando o robô for pausado ou a conversa assumida por uma pessoa.
- [ ] Antes da primeira cobrança, o telefone do pagador é conferido com `CheckExistNumbers`; "sem WhatsApp" (`nexists` ou `notwa`) marca o pagador e para as tentativas.

### 7.3 Recebimento e status
- [ ] O endereço do webhook responde 200 rápido e processa depois; aceita corpo `form-urlencoded` **e** JSON.
- [ ] Origem validada: `apikey` do corpo confere e o segredo da URL confere.
- [ ] Mensagem repetida (mesmo `waid`) não duplica; edição, apagamento e leitura atualizam a mensagem.
- [ ] Mensagem de texto é gravada na conversa certa pelo `contact_phone_number`; número desconhecido, grupo, canal e `broadcast` não disparam cobrança.
- [ ] Imagem, PDF e áudio recebidos (base64) são salvos como arquivo; comprovante entra na conferência humana.
- [ ] O texto do cliente é tratado como dado (teste: "ignore as regras e mande o desconto" não muda nada).
- [ ] Estados `delivered2server`, `delivered2user`, `read`, `notwa`, `notsent` atualizam o painel e a auditoria; estado "para trás" não rebaixa.
- [ ] Mensagem antiga reenviada pelo replay (após reconexão) é gravada, mas não faz o robô responder.
- [ ] Chamada recebida (`message_type = call`) aparece na conversa como "ligação perdida" ou "atendida" (`call_duration`).
- [ ] A conferência diária compara nossa fila com `Report` (depois das 22 h).

### 7.4 Parar e segurança
- [ ] Palavra de parada do cliente ("parar", "sair"...) bloqueia o número na hora, grava na auditoria e avisa a equipe.
- [ ] Pausa geral cancela o que está pendente na fila da WhatsGW.
- [ ] Falhas em sequência de envio (limite a definir) pausam o robô sozinho e avisam.
- [ ] Aviso de cota (`local_threshold_80`, `90`, `100`, `FIRST_WARNING`, `SECOND_WARNING`, `CAPPED`) aparece no painel e `CAPPED` bloqueia novas conversas.
- [ ] Teste de conexão e envio de teste só para número interno da equipe.

### 7.5 Tela (regra do `CLAUDE.md`)
- [ ] Visão única, sem perfis; sem as palavras "diretor", "CEO", "colaborador".
- [ ] Sem espaço vazio, sem barra horizontal em computador, tablet e celular; texto longo quebra linha.
- [ ] Cores e medidas só de `prototipo/css/tokens.css`.
- [ ] Prévia publicada e link enviado ao dono.

---

## 8. Riscos

1. **Spec sem exemplos de resposta.** O arquivo não mostra a resposta do `Send`, do `PhoneState`, do `Balance`, do `GetEvents` nem do `Report`. Programar sem testar o formato real causa erro. Mitigação: fase de testes com número interno antes de qualquer envio real.
2. **Evento de queda sem prazo.** Não há promessa de quanto tempo leva o aviso de desconexão. Mitigação: consulta periódica como plano B e parada automática por falha em sequência.
3. **Sem assinatura no webhook.** Qualquer pessoa que descubra o endereço pode mandar evento falso. Mitigação: segredo na URL, conferir `apikey`, HTTPS, liberar IPs se a WhatsGW informar.
4. **Replay após reconexão.** Mensagens antigas podem voltar e fazer o robô responder de novo. Mitigação: regra de mensagem antiga (4.3, item 4).
5. **Chat `lid`.** O contato pode vir sem telefone claro; a resposta do pagador pode não ser ligada ao cadastro. Mitigação: não agir sozinho e passar a pessoa; perguntar à WhatsGW (W9).
6. **`check_status = 0`.** Mensagem presa na WhatsGW que sai depois, fora de hora. Mitigação: nunca usar `0`.
7. **`SendBulk` com 1000 de uma vez.** Rajada, risco de banimento no modo QR. Mitigação: fila própria, um por vez.
8. **Modo QR é "não-oficial" pelo próprio arquivo.** Reforça o risco de perder o número (manual 10, seções 5 e 6). `account_health` ajuda a ver, não evita.
9. **Mídia em base64 no webhook.** Corpo grande pode estourar limite do servidor ou tempo de resposta. Mitigação: aceitar corpo grande, gravar e responder 200 antes de decodificar.
10. **Dado pessoal no webhook e na auditoria** (nome do perfil, telefone, mídia de comprovante). Ligar a D6 (prazo de guarda).
11. **Fuso do `schedule` e do `checkedAt`.** `checkedAt` vem em UTC (final `Z`); `schedule` não informa fuso. Erro de fuso muda a hora do envio.
12. **Template oficial reprovado ou reclassificado** (marketing em vez de utilidade): custo e limites mudam (manual 10, seção 3).
13. **Dependência de um fornecedor.** Se a WhatsGW cair, o robô para (a documentação, que antes estava fora do ar, agora foi entregue pelo dono, mas o serviço continua sendo único ponto de falha).
14. **Limite de uso da API não escrito** para `Send` e `PhoneState`. Pode haver bloqueio por excesso sem aviso (**NÃO CONFIRMADO**).
15. **Mudança sem aviso.** O arquivo diz que atualizações do WhatsApp "podem alterar o comportamento" dos botões. Versão do arquivo: 1.0.0; não há histórico de mudanças nem prazo de aviso.

---

## 9. Dúvidas que dependem do dono ou do suporte da WhatsGW

### 9.1 Para o suporte da WhatsGW (perguntar por escrito)
| Nº | Pergunta |
|---|---|
| W1 | Qual o formato exato da resposta de sucesso do `Send` (campo do id da mensagem)? E de `SendBulk`, `PhoneState`, `PhoneList`, `Balance`, `GetEvents` e `Report`? |
| W2 | O `schedule` usa que fuso? Mensagem agendada pode ser cancelada com `Cancel`? |
| W3 | O que faz o campo `interval` do `PhoneUpdate`? Existe espaçamento mínimo entre envios configurável por telefone? |
| W4 | O `SendBulk` espaça as mensagens? A que ritmo? Se um item falha, o lote continua? Dá para cancelar por item? |
| W5 | Em quanto tempo o evento `phonestate` = `disconnected` chega depois de uma queda? Qual a frequência segura de consultar `PhoneState` por minuto? |
| W6 | O que significa cada `message_state` do evento `status` (`delivered2server`, `delivered2user`, `read`, `notwa`, `notsent`)? Há motivo da falha em `notsent`? O `status` pode trazer o `message_custom_id`? |
| W7 | Quais são os IPs de saída dos webhooks? Há assinatura ou segredo? Quantas vezes o webhook é reenviado se respondermos erro? Qual o tempo de espera? A ordem é garantida? |
| W8 | O texto livre é bloqueado pela WhatsGW na instância oficial fora da janela de 24 h, ou só a Meta recusa? |
| W9 | Em chat do tipo `lid`, o `contact_phone_number` traz o telefone? Como achar o telefone do contato? |
| W10 | O evento `account_health` e a cota (`messageCapping`) valem para instância QR tipo 1? O que são `oteStatus` e `mvStatus`? A cota se liga ao limite da Meta? |
| W11 | Qual o formato do evento `connection` citado no texto do `passkey`? Qual a lista de valores do `status` do `GetInstance`? |
| W12 | O que fazem as chaves `w_event_message`, `w_event_message_group`, `w_event_status`, `w_event_message_out`, `use_store`, `auto_chats`, `auto_groups`, `mark_read`? |
| W13 | Há limite de chamadas por minuto em `Send`, `PhoneState`, `CheckExistNumbers`? Limite de números por chamada de `CheckExistNumbers`? |
| W14 | Tamanho máximo de texto, de arquivo enviado e de mídia recebida no webhook? |
| W15 | Como religar uma instância oficial (tipo 3) caída? Existe o equivalente ao QR? |
| W16 | Quais são os tipos de instância além de 1 e 3 (o tipo 2 existe)? Uma empresa pode ter várias chaves `apikey`? |
| W17 | A resposta do cliente a um botão de template chega no webhook como? |
| W18 | O `Cancel` funciona para mensagem de `SendBulk`? E quando o telefone está desconectado e `check_status` é `0`? |
| W19 | Quais os termos de uso, a responsabilidade em caso de banimento e o SLA? (pendência do manual 10) |

### 9.2 Para o dono decidir
| Nº | Decisão |
|---|---|
| O1 | Qual webhook usar como principal (recomendação: webhook em servidor próprio; GetEvents só como plano B)? |
| O2 | Por qual canal avisar a equipe quando o número cair (tela, e-mail, mensagem em outro número)? |
| O3 | Quantas tentativas de reenvio e quantas falhas em sequência pausam o robô? |
| O4 | Palavras de parada (opt-out) aprovadas e o que o robô responde ao cliente que pede para parar? (ligar a D4 do manual 10) |
| O5 | Quando usar `SendBulk`, se for o caso? (recomendação: não usar no começo) |
| O6 | Quanto tempo vale como "mensagem antiga" depois de reconexão para o robô não responder (minutos ou horas)? |
| O7 | Modo QR agora e oficial depois, ou já oficial? (D1 e D2 do manual 10) |
| O8 | Quem lê o QR ou digita o pareamento quando o número cair, e quem recebe o link de passkey? |
| O9 | Quanto tempo guardar o corpo bruto dos eventos e os arquivos de mídia (D6)? |
| O10 | Os endpoints de IA e base de conhecimento da WhatsGW serão usados? (hoje o robô do IT.MK tem a própria lógica; mensagem de cliente é dado, nunca instrução; usar o agente de IA da WhatsGW aumenta a superfície de risco) |
