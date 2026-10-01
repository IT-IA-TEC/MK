# Manual de consulta 04: Dados, Backend e Segurança (para montar planos do IT.MK)

Para quem é: o P.O. do IT.MK. Serve para montar plano, backlog e critérios de aceite das frentes **Backend** e **Database** sem reler a base.
Fonte: categorias `backend`, `database`, `bancos-de-dados`, `seguranca` e `data-science` da base de conhecimento (somente leitura).
Caminho-base dos arquivos citados: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`

Legenda de confiança (igual ao manual 01):
- **[BASE]** = está escrito nos materiais da base. Dá para conferir no arquivo citado.
- **[COMPL.]** = prática conhecida que a base não detalha (ou só cita o nome). Expliquei com conhecimento geral. Confirmar com o time técnico.
- **[NÃO COBERTO]** = a base não traz nada útil. O plano deve dizer isso e apontar a fonte oficial.

Regra de ouro (já vale no IT.MK): usar o modelo da seção 10 de `docs/base-po.md` e as regras do `CLAUDE.md` (visão única, sem espaço vazio, sem barra horizontal, cores só em `tokens.css`).

---

## 0. Resumo de 1 minuto

1. A base é forte em **segurança de aplicação** (cheat sheets OWASP completas: segredos, criptografia, webhook, SSRF, deserialização, logs, controle de acesso, lógica de negócio). Dá para escrever critérios de aceite de segurança com confiança.
2. A base é **fraca em modelagem de dados para o IT.MK**. O que ela tem: artigos clássicos de banco (transações, isolamento, log, índices), um livro de MySQL e um de Redis. Nada de Postgres/Supabase.
3. A categoria `backend` **não tem o texto do livro**. Só tem as listas de referências (links e títulos) do livro "Designing Data-Intensive Applications". Serve de mapa de leitura, não de manual.
4. **Supabase: zero arquivos.** PostgREST: zero documento (só nome de arquivo de teste do Spring). RLS (segurança por linha) do Postgres: **1 cheat sheet** (multi-inquilino), com SQL de exemplo. Pix, boleto, conciliação, LGPD: **não coberto**.
5. As melhores regras prontas para o IT.MK vêm de 6 materiais: `Webhook_Security`, `Third_Party_Payment_Gateway`, `Business_Logic_Security`, `Secrets_Management`, `Cryptographic_Storage`, `AML_Sanctions_AI_Agent_Payments` (trilha de auditoria encadeada por hash).

---

## 1. Mapa: o que existe em cada categoria

| Categoria | Documentos | O que é de verdade | Vale ler? |
|---|---|---|---|
| `backend` | 15 | Só **referências** dos 12 capítulos do livro DDIA (títulos e links de artigos). Sem texto do livro. | Só como índice de leituras. |
| `database` | 741 (1 por página) | 31 papers clássicos ("Readings in Databases") + README comentado. Um paper (Architecture of a Database System) tem 119 páginas e é o mais útil. | SIM, 5 ou 6 papers. |
| `bancos-de-dados` | 782 (1 por página) | Livro "High Performance MySQL" 2ª ed. (710 pág.) + "Redis Cookbook" (72 pág.). 11 páginas sem texto. | SIM, capítulos de tipos, índices, transações, backup. Lembrar: é **MySQL antigo**, não Postgres. |
| `seguranca` | 750 | Repositório OWASP Cheat Sheet Series completo (cerca de 130 cheat sheets) + PDFs de palestras + muito ruído (CSS, scripts, imagens). | SIM, uns 30 arquivos. |
| `data-science` | 642 | "Estatística: o que é, para que serve" (Wheelan, em português, 286 pág.) + "Mining the Social Web" (356 pág., redes sociais). | Só os capítulos de estatística descritiva e qualidade de dados. |

Observações práticas:
- Em `database` e `bancos-de-dados`, **cada documento é uma página**. Para achar o capítulo, use o sumário (ver tabela de fontes).
- Em `bancos-de-dados`, o texto de muitas páginas vem **sem espaços entre as palavras** (extração ruim). Para buscar com `grep`, use pedaços curtos de uma palavra só.
- Em `seguranca`, a pasta `materiais/` citada no `indice.md` **não existe** nesta cópia. O texto está em `documentos/seguranca__doc_NNNNN.md` (o nome da cheat sheet está na primeira linha de título).
- Em `data-science`, o texto vem com TAB no lugar de espaço. Para buscar, troque TAB por espaço antes do `grep`.

---

## 2. Resumo por material

### 2.1 `backend`: DDIA (listas de referências) [BASE]
Arquivos: `backend/documentos/backend__doc_00001..00012` (capítulos 1 a 12), `doc_00013` (cartaz, imagem), `doc_00014` (cartaz PDF), `doc_00015` (README).
O que é: bibliografia do livro de Martin Kleppmann. Cada capítulo é uma lista de artigos e papers. **Não explica nada**, só aponta.
Mapa dos capítulos (conteúdo do livro, conforme os títulos listados):

| Cap. | Tema | Referências que interessam ao IT.MK (só os títulos estão na base) |
|---|---|---|
| 1 | Confiabilidade, escala, manutenção | Falhas em produção; "Simple Testing Can Prevent Most Critical Failures". |
| 2-3 | Modelos de dados, armazenamento | Livros e papers de bancos relacionais e índices. |
| 4 | Codificação e evolução de formato | Avro, Protobuf, Thrift, JSON Schema; "Schema Evolution"; **CWE-502 Deserialization of Untrusted Data**; "Designing and Versioning Compatible Web Services"; Stripe "API Upgrades". |
| 5 | Replicação | Replicação, filas altamente disponíveis. |
| 6 | Particionamento | Só importa se o volume crescer muito (não é o caso do IT.MK no início). |
| 7 | **Transações** | System R; "A Critique of ANSI SQL Isolation Levels"; Hermitage ("Testing the I in ACID"); "Serializable Snapshot Isolation in PostgreSQL"; "Enforcing Complex Constraints in Oracle"; "Those Are Not Transactions"; casos de roubo de BTC por falha de concorrência (Poloniex, exchange). |
| 8 | Problemas em sistemas distribuídos | Relógios, falhas parciais. |
| 9 | Consistência e consenso | Linearizabilidade, CAP, Raft/Paxos, "A Better ID Generator for PostgreSQL". |
| 10 | Processamento em lote | MapReduce e correlatos. |
| 11 | **Fluxos/eventos/filas** | "Queues Are Databases" (Jim Gray); "Web Hooks to Revolutionize the Web"; Kafka; CDC (Debezium, Bottled Water para PostgreSQL); **Event Sourcing**, CQRS; **"Accountants Don't Use Erasers"**; **"Immutability Changes Everything"**; "Accounting for Computer Scientists". |
| 12 | Futuro, correção ponta a ponta | **"Life Beyond Distributed Transactions"** (Helland); **"End-to-End Arguments in System Design"**; **"Sagas"**; **"Online Migrations at Scale"** (Stripe); "Feral Concurrency Control"; "Low Latency Web Scale Fraud Prevention". |

Como usar: quando o time técnico discutir idempotência, histórico imutável, migração sem parar o sistema ou filas, **peça que leia o título citado** (a base só tem o link externo). O conteúdo em si **[NÃO COBERTO]** na base.

### 2.2 `database`: Readings in Databases [BASE]
Arquivos: `database/documentos/database__doc_NNNNN.md`, 1 por página. Intervalos na tabela de fontes (seção 10). README comentado em `doc_00741`.
Papers e o que ensinam para o IT.MK:

| Paper | Ideia central | Uso no IT.MK |
|---|---|---|
| **Architecture of a Database System** (Hellerstein, 119 pág.) | Como um banco funciona por dentro: transações (ACID), travas, isolamento, log (WAL), replicação, utilitários de backup. | **O mais útil.** Seção 6 (transações) e 7.4/7.5 (replicação, backup). |
| **ARIES** (Mohan, 69 pág.) | Recuperação após queda com log antecipado (WAL). "Repetir a história" e depois desfazer o que não terminou. Desfazer também é registrado em log. | Entender por que o banco **não perde pagamento confirmado**. Leitura de especialista, não de P.O. |
| **On Optimistic Methods for Concurrency Control** (Kung, 14 pág.) | Controle otimista: deixa rodar e, se houver conflito, refaz a transação. Melhor quando conflito é raro. | Base da ideia de **versão/contador de versão** na linha (atualizar só se ninguém mudou). |
| **A Relational Model of Data** (Codd, 1970) | Independência dos dados; chave primária, chave estrangeira, redundância e consistência. | Fundamento de tabelas, chaves e normalização. |
| **Efficient Locking for B-Trees** e **R*-tree** | Como índices (árvore B) convivem com concorrência. | Só curiosidade. |
| **System R** e **Access Path Selection** | Primeiro banco relacional; como o otimizador escolhe o plano (índice ou varredura). | Por que um índice às vezes **não** é usado. |
| **CAP Twelve Years Later** (Brewer) | "2 de 3" sempre foi simplista. Durante falha de rede, o sistema entra em "modo partição", limita operações, **reconcilia depois e compensa os erros**. Cita o exemplo da companhia aérea com overbooking compensado. | Base da ideia de **compensar** (estornar/ajustar) em vez de apagar. |
| **Dynamo** (Amazon) | Versões divergentes reconciliadas depois (relógios vetoriais); "adicionar ao carrinho nunca falha". | Conceito de **reconciliação**. IT.MK não precisa da arquitetura. |
| **What Goes Around Comes Around** (Stonebraker) | 35 anos de modelos de dados. Lição 1: independência física e lógica dos dados é desejável. Modelos em árvore são restritivos. | Justifica modelo relacional. |
| **Paxos**, **Raft**, **Chord**, **GFS**, **Bigtable**, **MapReduce**, **Spark**, **Shark**, **Dremel**, **C-Store**, **Vertica**, **Column vs Row**, **AlphaSort**, **PatSort**, **5-minute rule**, **Eddies**, **Variant Index**, **Cloud Computing**, **Datacenter as a Computer**, **Trusting Trust** | Sistemas distribuídos, colunar, grande escala. | **Fora do escopo do IT.MK** (um banco Postgres gerenciado). Ignorar, salvo "Reflections on Trusting Trust" (confiança em ferramentas e dependências). |

### 2.3 `bancos-de-dados`: High Performance MySQL, 2ª ed. [BASE]
Páginas do livro: `documento = página do livro + 24` (ex.: livro p.80 = `bancos-de-dados__doc_00104`).
Capítulos úteis:
- **Cap. 1 (p.1-30)**: arquitetura, travas, **transações (ACID), níveis de isolamento, deadlock, MVCC**. Exemplo clássico: transferência entre contas (3 passos dentro de uma transação).
- **Cap. 3 (p.80-150)**: **tipos de dados, índices, normalização, ALTER TABLE**. O capítulo mais útil para Database.
- **Cap. 5 (p.204-264)**: views, chaves estrangeiras (p.252), transações distribuídas XA (p.262), prepared statements (p.225).
- **Cap. 8-9**: replicação, escala e alta disponibilidade.
- **Cap. 11 (p.473-520)**: **backup e recuperação**.
- **Cap. 12 (p.521-554)**: **segurança** (contas, rede, criptografia de dados).
- Cap. 2, 4, 6, 7, 13, 14: medição, otimização de consultas, ajuste de servidor, hardware, monitoramento. Servem ao time técnico mais tarde.
Limites: o livro é de 2008 e é de **MySQL/InnoDB**. Exemplos de senha com MD5/SHA1 estão **ultrapassados** (use o cheat sheet de senhas, seção 2.5). Regras gerais de modelagem valem para Postgres; comandos e detalhes de tuning não.

### 2.4 `bancos-de-dados`: Redis Cookbook [BASE]
Páginas: `documento = página do livro + 724` (livro p.45 = `doc_00769`). Sumário em `doc_00718`.
O que traz: Redis como chave/valor, **fila de tarefas com listas** (p.39), **nonces e tokens com EXPIRE** (p.22, OAuth), pub/sub, **MULTI/EXEC/WATCH** (transação simples no Redis), **persistência RDB x AOF** (p.45), limite de taxa, backups.
Para o IT.MK: Redis **não é necessário** no início (o dono pede Postgres/Supabase). Útil só como ideia: expiração automática de chaves (anti-repetição de webhook por poucos minutos) e fila simples. O exemplo de fila do livro é o básico (RPUSH/LPOP); **não discute perda de tarefa se o worker cair** [COMPL.: por isso a fila de cobrança deve ficar em tabela no banco, com estado e tentativas].

### 2.5 `seguranca`: cheat sheets OWASP [BASE]
Texto completo em `seguranca/documentos/seguranca__doc_NNNNN.md`. Os mais relevantes (resumo curto de cada; regras acionáveis nas seções 3 a 9):

| Cheat sheet (doc) | Em uma frase |
|---|---|
| **Webhook Security Guidelines** (00736) | 14 controles para quem **recebe** webhook: HTTPS, assinatura HMAC com comparação em tempo constante, janela de tempo de 5 min, id do evento para não repetir, fila assíncrona, só POST, sem detalhes de erro, log sem segredo, eventos fora de ordem. Traz lista de testes. |
| **Third-Party Payment Gateway Integration** (00715) | Fluxo de pagamento em 5 passos e o que dá errado em cada um: preço vindo do cliente, callback falso, repetição, condição de corrida. Sempre **confirmar o pagamento consultando a API do provedor**, conferir valor, moeda e pedido, processar uma vez só. |
| **Business Logic Security** (00433) | Recalcular valores no servidor, fluxo como **máquina de estados**, corrida (`SELECT FOR UPDATE`, `UPDATE ... WHERE saldo >= valor`, chave única, **chave de idempotência**), invariantes escritas. Tem tabela "forma da operação x padrão seguro". |
| **Secrets Management** (00676, 65 KB) | Ciclo de vida do segredo (criar, girar, revogar, expirar), acesso mínimo, auditoria, backup e "break-glass", detecção de segredo no código, resposta a vazamento, criptografia. |
| **Cryptographic Storage** (00472) | AES 128/256 em modo autenticado (GCM), nada de algoritmo próprio, chaves separadas dos dados, DEK/KEK, rotação, gerador aleatório seguro, UUID. |
| **Key Management** (00562) | Ciclo de vida de chaves: geração, distribuição, armazenamento, custódia e backup, prestação de contas, comprometimento e recuperação. |
| **Server-Side Request Forgery (SSRF)** (00689) | Dois casos: destinos conhecidos (lista de permitidos) e destinos livres (bloquear faixas privadas). Validar IP e domínio, **desligar redirecionamento**, camada de rede, IMDSv2. |
| **Deserialization** (00481 + PDF 00001-00051) | Evitar formatos nativos (Java `ObjectInputStream`), usar JSON puro com DTO, só desserializar dado assinado, listas de classes permitidas. Tabela de bibliotecas seguras e inseguras. |
| **REST Security** (00672) | Só HTTPS, controle de acesso em cada endpoint, JWT (validar assinatura, `iss`, `aud`, `exp`), lista de métodos HTTP, **ordem de chamadas na API (máquina de estados)**, validar entrada, 413/415/406, endpoints de gestão, logs de auditoria, cabeçalhos, CORS. |
| **Logging** (00573) | O que registrar, quem/quando/onde/o quê, **o que nunca registrar**, injeção de log, onde guardar, conta de banco só para gravar log. |
| **Authorization** (00412) / **Authentication** (00410) / **IDOR** (00556) / **Mass Assignment** (00581) | Negar por padrão, verificar em toda requisição, ABAC/ReBAC melhor que só papéis, IDs adivinháveis não bastam, DTO para não aceitar campo extra. |
| **Input Validation** (00555) / **SQL Injection** (00708) / **Query Parameterization** (00662) / **Injection Prevention in Java** (00554) / **Bean Validation** (00426) | Validar com lista de permitidos (sintática e semântica), consulta parametrizada, Jakarta Bean Validation em Spring. |
| **Database Security** (00473) | Banco isolado, TLS, conta mínima por aplicação, **sem usar root/dono**, ambientes separados, permissão por tabela/coluna/linha/view, senha fora do código, backup protegido. |
| **Multi-Tenant Security** (00590, 50 KB) | Contém **Row-Level Security do PostgreSQL** (`ENABLE/FORCE ROW LEVEL SECURITY`, `current_setting`, `SET LOCAL`, papel sem `BYPASSRLS`). Único texto sobre RLS da base. |
| **AML/Sanctions for AI Agent Payments** (00407) | Seção 4 "Signed Audit Trail": **trilha de auditoria encadeada por hash** e assinada; seção 5 "Fail-Closed": se a checagem falhar, **nega**. Serve de modelo para a auditoria do robô. |
| **Transaction Authorization** (00724) | Autorização de transação sempre no servidor, estados permitidos, dados da transação protegidos contra alteração, credencial única e com validade, checar que **cada execução** foi autorizada (TOCTOU). |
| **Password Storage** (00641), **JWT** (00559), **Session Management** (00700), **MFA** (00591), **OAuth2** (00629) | Se houver login de usuários. Argon2id/scrypt/bcrypt/PBKDF2 com parâmetros listados. |
| **Denial of Service** (00477), **Error Handling** (00502), **File Upload** (00506), **Threat Modeling** (00716), **Attack Surface** (00409), **CI/CD** (00453), **Vulnerable Dependency** (00733), **Software Supply Chain** (00707), **Docker** (00484), **TLS** (00726) | Apoio. Citados nas regras abaixo quando cabem. |
| **IndexTopTen** (00551), **IndexASVS** (00547), **IndexProactiveControls** (00550) | Índices que ligam OWASP Top 10, ASVS e Proactive Controls às cheat sheets. Bom para montar checklist. |

Ruído (ignorar): scripts de build, CSS, `.drawio`, `.svg`, `.png`, cheat sheets de PHP, .NET, Laravel, Rails, Django, Symfony, Kubernetes, C, drone, automotivo, mobile, AI-advertising.
Nota: `Access_Control_Cheat_Sheet` (00403) é só um aviso curto de redirecionamento. O conteúdo está em `Authorization`.

### 2.6 `data-science`: só o que ajuda métricas e relatórios [BASE]
- "Estatística: o que é, para que serve, como funciona" (Charles Wheelan), `data-science__doc_00001..~00286`. Sumário em `doc_00004`.
  - Cap. 2 (docs ~27-46) **estatística descritiva**: média x **mediana** (um valor enorme puxa a média, a mediana não se mexe), desvio padrão, distribuição de frequência.
  - Cap. 3 (docs ~47-67) **descrição enganosa**: **precisão x acurácia** ("3,215 km a leste" é preciso, mas pode estar errado), cuidado com média, porcentagens e valores nominais.
  - Cap. 4 (docs ~68+) correlação não é causa.
  - Cap. 7 (docs 116-~140) **"Entra lixo, sai lixo"**: dado ruim estraga qualquer cálculo; amostra enviesada, mesmo grande, continua ruim.
- "Mining the Social Web" (`doc_00287..00642`): coleta de dados de redes sociais. **Sem uso** para cobrança. Ignorar.

---

## 3. Modelagem de tabelas, chaves e dinheiro

### 3.1 Regras gerais
1. **Cada fato em um só lugar** (normalização). Duplicar dado cria estado inconsistente: o exemplo do livro é trocar o chefe de um departamento e esquecer uma linha. Duplicar só de propósito, para ganhar leitura, e documentar quem mantém a cópia. [BASE: MySQL cap. 3 "Normalization and Denormalization", doc 163-168; Codd]
2. **Toda tabela tem chave primária.** Relações entre tabelas usam chave estrangeira. [BASE: Codd, docs 175-185]
3. **Tipo mínimo e simples; evite NULL sem necessidade.** Colunas `NOT NULL` por padrão. Datas em tipo de data, nunca texto. [BASE: MySQL cap. 3, docs 104-106]
4. **Mesmo tipo nas colunas relacionadas** (chave e chave estrangeira iguais). Tipos diferentes geram conversão escondida e erro tardio. [BASE: doc 118]
5. **Identificadores:** números inteiros são rápidos. Valores aleatórios (UUID, hash) espalham as gravações e deixam o INSERT mais lento no InnoDB. [BASE: docs 118-119]. Para o IT.MK, não expor número sequencial em tela/API (ver IDOR, seção 8.4); usar um identificador público aleatório **além** da chave interna. [BASE: IDOR cheat sheet 00556 sugere coluna com id aleatório ou UUID como defesa extra, mas diz que a verificação de permissão é o que protege]
6. **Listas fixas (status, tipo, marketplace)**: tabela de domínio ou tipo restrito, nunca texto livre. [BASE: doc 118, ENUM só para tabelas de definição] [COMPL.: no Postgres, tabela de domínio + chave estrangeira ou `CHECK` é mais fácil de evoluir que ENUM.]
7. **Restrições no banco, não só no app.** Chave única, `NOT NULL`, `CHECK`, chave estrangeira. O livro de arquitetura diz que a consistência vem de **checagens de integridade em tempo de execução** (SQL integrity constraints): se violar, a transação aborta. [BASE: Architecture of a DB System, seção 6.1, doc 00485] E a cheat sheet de lógica de negócio manda **escrever as invariantes** (ex.: "saldo nunca negativo") e dizer **o que as garante, de forma atômica**. [BASE: 00433]

### 3.2 Dinheiro
1. **Nunca usar ponto flutuante (FLOAT/DOUBLE) para dinheiro.** Use tipo decimal exato. O livro: FLOAT/DOUBLE são cálculos aproximados; DECIMAL é exato (a partir do MySQL 5.0). [BASE: doc 107]
2. [COMPL.] No Postgres: `numeric(15,2)` **ou** inteiro em centavos (`bigint`). Escolher **um** padrão para o sistema todo e registrar. Inteiro em centavos evita erro de arredondamento nas somas; `numeric` é mais legível.
3. [COMPL.] Guardar a **moeda** (`BRL`) em coluna, mesmo que hoje só exista real.
4. [COMPL.] **Arredondar em um único lugar**, com regra escrita (para cima, para baixo ou bancário), e guardar o valor já arredondado **e** o valor de entrada. Soma de parcelas deve fechar com o total (a diferença de centavos vai para uma parcela definida).
5. [COMPL.] Percentuais (a regra de cálculo da consultoria) em `numeric` com casas definidas, ou em pontos-base. Nunca em float.
6. **Valor nunca vem do cliente.** Recalcular preços e totais no servidor com dados confiáveis. [BASE: 00433 "Always re-derive security-relevant values"; 00715 passo 1 "Recalculate totals server-side"]
7. Para relatórios: conferir a **precisão x acurácia** (um número com muitas casas pode estar errado). [BASE: data-science doc 48]

### 3.3 Datas e tempo
- [COMPL.] Guardar instantes em UTC com fuso (`timestamptz`) e datas de negócio (vencimento, competência) em tipo `date`. "Competência" do faturamento = primeiro dia do mês, em coluna própria.
- [BASE] Sincronizar relógios de todos os servidores, porque a auditoria depende de hora correta. (Logging 00573; Secrets 00676 seção 2.6)
- [BASE] O log deve registrar **hora do evento** e **hora do registro** (podem diferir). (Logging 00573, "When")

### 3.4 Dados de tela x dados do banco
- DTOs: o que entra pela API e o que sai **não é a tabela**. Use objetos de transferência só com os campos permitidos. Evita **mass assignment** (usuário preencher campo que não devia, como `valor_pago` ou `estado`). [BASE: 00581 "General Solutions"]
- Bean Validation (Jakarta) nos DTOs de entrada do Spring. [BASE: 00426]

---

## 4. Histórico e auditoria imutável

O IT.MK exige: **robô de cobrança com auditoria que nunca apaga.**

### 4.1 O que a base diz
- **Ideia de fundo**: contador não usa borracha. Erro se corrige com **novo lançamento**. [BASE, só título e link: DDIA cap. 11 "Accountants Don't Use Erasers", "Immutability Changes Everything", "Event Sourcing"; backend__doc_00011. O texto em si não está na base.]
- **Compensar em vez de apagar**: "o coração da correção de erros é criar operações de compensação". [BASE: CAP Twelve Years Later, database `doc_00147..00153`]
- **Trilha à prova de adulteração**: cada registro leva o **hash SHA-256 do anterior** (corrente), tem hora, quem agiu (identidade), o que fez, **hash dos argumentos** (não os dados crus, por privacidade) e o resultado. **Quebra na corrente = alerta.** Guardar em infraestrutura controlada pela empresa, **não** onde o agente (robô) pode mexer. Não confiar só em log de aplicação comum, que pode ser alterado sem rastro. [BASE: AML cheat sheet 00407, seção 4]
- **Retenção**: o exemplo da cheat sheet cita 5 anos para AML nos EUA. **Isso não é regra do Brasil.** Prazo do IT.MK = decisão do dono com apoio jurídico. [NÃO VERIFICADO]
- **Auditoria de segredo**: quem pediu, se foi aprovado, quando usou, quando expirou, tentativa de usar segredo expirado, quem alterou. Auditoria deve resistir a tentativa de apagar ou adulterar. [BASE: 00676 seção 2.6]
- **Separar** log de segurança de trilha de auditoria de negócio: têm objetivos e conteúdo diferentes. [BASE: 00573 "Purpose"]
- **Gravar log em banco**: conta separada, **só para gravar**, com permissões bem restritas. [BASE: 00573 "Where to record event data"]
- **Falha no log não pode derrubar o app nem vazar informação.** [BASE: 00573 "Event collection"]
- REST: gravar log de auditoria **antes e depois** de eventos sensíveis. [BASE: 00672 "Audit logs"]
- Gravar a **tentativa de pagamento**, redirecionamentos e callbacks, com hora e IP, e guardar o **corpo cru** do callback para investigação. [BASE: 00715 "Logging and Monitoring"]

### 4.2 Regras acionáveis para o IT.MK
1. **Tabelas só de acréscimo (append-only)** para: eventos da cobrança, eventos de pagamento, eventos de contestação, ações do robô, mudanças de segredo, mudanças de regra de cálculo. [COMPL.]
2. **Bloquear UPDATE e DELETE no banco** para o usuário do app nessas tabelas (`REVOKE UPDATE, DELETE`), e proteger com gatilho que rejeita alteração. A cheat sheet de banco manda **privilégio mínimo** e permissões por tabela. [BASE: 00473] [COMPL.: o comando exato do Postgres.]
3. **Correção = novo registro** que aponta para o anterior (estorno, ajuste, retificação), com motivo e autor. Nunca editar o valor antigo. [BASE: princípio; COMPL.: modelo]
4. **Corrente de hash** por tabela de auditoria (hash do registro anterior dentro do novo). Rotina diária que **verifica a corrente** e alerta se quebrar. [BASE: 00407 seção 4]
5. Cada evento guarda: **quando** (hora do evento e do registro), **quem** (usuário ou robô ou webhook, com identidade), **o quê** (tipo, objeto, estado de origem e destino), **resultado** (sucesso, falha, adiado) e **motivo**. [BASE: 00573 "Event attributes"]
6. **Robô só tem permissão de inserir** na tabela de auditoria. Não lê o hash para reescrever nem apaga. A conta do robô é **diferente** da conta do app e da conta de migração. [BASE: 00473 "conta usada por um único serviço"; 00407 "não guardar auditoria onde o agente controla"]
7. **Nunca registrar** no log: segredos, tokens, senhas, dados de cartão, chaves, strings de conexão, dados pessoais sensíveis. Registrar um **hash** ou os **últimos dígitos**. [BASE: 00573 "Data to exclude"]
8. **Sanitizar** o que vai para o log (quebra de linha e delimitadores) para evitar injeção de log. [BASE: 00573; 00672]
9. **Falha fechada** (fail closed): se a checagem obrigatória do robô falhar (contestação aberta, acordo vigente, dado ausente), **não cobra**. Registrar a falha com o mesmo detalhe de um sucesso. [BASE: 00407 seção 5, adaptado]
10. Ação do robô deve ser **explicável**: guardar qual **versão da regra** e quais **entradas** o levaram à decisão (ver seção 5). [COMPL.]

---

## 5. Versões de cálculo (faturamento e cobrança)

[BASE parcial] A base não tem receita de "versionar regra de cobrança". Reúne princípios:
- **Não editar o passado**: correção é novo lançamento (seção 4).
- **Valor derivado deve poder ser recalculado e explicado**; guardar a entrada. [BASE: 00433 "re-derive"] 
- **Controle otimista** (versão na linha): atualizar só se a versão lida ainda for a atual. Se não for, refazer. [BASE: OCC, database docs 593-606; Business Logic 00433 "conditional update, check affected rows"]
- **Evolução de formato** com compatibilidade para frente e para trás. [BASE, só títulos: DDIA cap. 4]

Regras acionáveis [COMPL., sobre as ideias acima]:
1. **Tabela de regra de cálculo** com versão, data de início de vigência, parâmetros (percentuais, prazos, juros, multa) e autor. Regra velha **nunca é alterada**; uma regra nova entra com novo número.
2. **A cobrança guarda a versão usada** (`regra_calculo_id`) e as **entradas** (base de faturamento, percentuais) e o **resultado**. Reabrir uma cobrança antiga mostra o cálculo da época.
3. **Recalcular = nova versão da cobrança** (nova linha ligada à anterior), com motivo. A antiga fica como "substituída". Nada de sobrescrever valor.
4. **Base de faturamento fechada fica imutável.** Mudança vira "retificação" com nova versão e vínculo à original.
5. **Teste de regressão do cálculo**: casos fixos (entrada → saída esperada) que rodam a cada mudança de regra.
6. **Arredondamento e ordem das contas** fazem parte da versão da regra.
7. **Quem aprova mudança de regra** = decisão do dono (ver quadro de delegação em `docs/base-po.md`).

---

## 6. Idempotência de pagamentos e webhooks (Pix)

### 6.1 O que a base diz [BASE]
Webhook (00736, seções 5, 6, 8, 12, 14):
- **Idempotência**: usar o **id do evento** da plataforma como chave. **Persistir** os ids já processados e ignorar repetidos. Responder **HTTP 200 imediatamente** para duplicado, para parar a reentrega. Deixar as operações seguintes (gravar, e-mail, pagamento) **idempotentes por padrão**.
- **Repetição maliciosa (replay)**: assinatura sozinha não impede (uma cópia carrega assinatura válida). Colocar **timestamp no material assinado**; rejeitar se diferir **mais de ±5 minutos**; para mais segurança, guardar ids vistos pelo menos pelo tempo da janela.
- **Desacoplar**: aceitar o evento, enfileirar e processar depois, para aguentar picos. Responder 200 **só depois** de aceito (na fila ou processado). 400 para corpo malformado, 401/403 para assinatura inválida.
- **Ordem**: eventos podem chegar fora de ordem. Não assumir ordem. Usar timestamp/sequência. Quando a consistência é crítica, **consultar o estado atual** na API do provedor em vez de confiar só no corpo do evento.
- **Fila de erros** (dead-letter) com alerta para evento que falha sempre.

Pagamento (00715):
- Só o **servidor-a-servidor** vale para confirmar pagamento. Parâmetros que voltam pelo navegador do usuário **não são confiáveis**.
- **Sempre consultar a API do provedor** para confirmar o status antes de liberar. Conferir **valor, moeda e id do pedido**.
- **Idempotência**: processar o pedido **uma única vez**, não importa quantas vezes o callback chegue.
- **Id de transação único com validade** para evitar repetição de callback; rejeitar expirado ou já usado.
- Corrida: vários callbacks ao mesmo tempo. Registrar todos os callbacks, **guardar o corpo cru**.
- Alertar: pedido "Pago" sem confirmação do provedor; muitos callbacks para o mesmo pedido; falha seguida de tentativas repetidas com os mesmos dados.

Lógica de negócio (00433, "Use Idempotency Keys"; "Pattern Reference"):
- Ação externa que não é idempotente (cobrar, enviar dinheiro): aceitar **chave de idempotência**, **guardar com o resultado** e devolver o resultado guardado na repetição.
- Tabela de padrões: leitura-modificação-gravação na mesma linha → `SELECT ... FOR UPDATE` e depois `UPDATE`, na transação; contador condicional → `UPDATE ... SET valor = valor - 1 WHERE valor > 0` e **conferir linhas afetadas**; "um por usuário" → **restrição única** e deixar o banco rejeitar o duplicado; chamada externa → **tabela de chave de idempotência** + gravação transacional do resultado; consistência entre linhas → transação **serializável** com nova tentativa.
- **Não confiar que é "rápido o bastante"**: ferramentas enviam dezenas de requisições simultâneas.

Outros:
- Redis tem **EXPIRE** (chave que some sozinha) útil para guardar ids de evento por poucos minutos (nonces do exemplo OAuth, Redis Cookbook p.22, `doc_00746..00750`). [BASE]
- Para ARIES, a idempotência da recuperação vem da **chave única** ou do número de sequência de log por página. [BASE: ARIES, database `doc_00094-00095`] (interesse técnico, não de plano).
- "End-to-End Arguments", "Sagas", "Life Beyond Distributed Transactions": **só títulos** na base (backend `doc_00012`). [NÃO COBERTO no texto]

### 6.2 Regras acionáveis para o IT.MK (Pix) [BASE onde marcado; o resto COMPL.]
1. **Tabela `webhook_evento_recebido`**: provedor, **id do evento** (`UNIQUE` com o provedor), hora de recebimento, hash do corpo, **corpo cru guardado**, estado (recebido, processado, erro), tentativas. Gravar com "inserir se não existir". Se já existe, **responde 200 e não processa**. [BASE: 00736 seção 6; COMPL.: o `INSERT ... ON CONFLICT` do Postgres]
2. **Persistir de forma durável** (tabela), não só em cache com validade curta: dinheiro não pode depender de memória. [COMPL.; a base sugere "cache com TTL" só para replay; para idempotência fala em "persistir"]
3. **Verificar a assinatura** sobre o **corpo cru**, antes de converter o JSON. Comparação em **tempo constante**. Responder 401 sem dizer o motivo. [BASE: 00736 seção 2]
4. **Janela de tempo** de ±5 min e **segredo por webhook**, com **rotação em duas chaves** (aceita a antiga e a nova durante a troca). [BASE: 00736 seções 3, 5]
5. **Responder rápido** (200 depois de gravar o evento cru) e **processar de forma assíncrona** pela fila. [BASE: 00736 seção 8]
6. **Antes de dar a cobrança como paga**: consultar o provedor, conferir **valor, moeda e identificador da cobrança**; só então mudar o estado. [BASE: 00715]
7. **Pagamento tem chave única do lado do banco**: identificador da transação Pix do provedor `UNIQUE`. Um mesmo pagamento nunca vira dois registros. [COMPL.; a base dá o padrão "restrição única"]
8. **Baixa da cobrança em transação única**: grava o pagamento, muda o estado, grava o evento de auditoria. Tudo ou nada. [BASE: ACID, MySQL cap. 1; Architecture 6.1]
9. **Pagamento a maior, a menor, duplicado ou fora de ordem** têm estados e regras próprios (saldo, crédito, devolução). A base não define. **Decisão do dono.** [NÃO COBERTO]
10. **Estado da cobrança só muda por transições permitidas** (máquina de estados), no servidor. [BASE: 00672; 00433; 00724 seção 2.5]
11. **Reenvio do robô**: cada mensagem/cobrança enviada tem chave de idempotência (cobrança + data + canal) para não cobrar duas vezes quando o robô reinicia. [COMPL.; padrão da base]
12. **Testes obrigatórios** (da base): assinatura inválida/ausente devolve 401; reenvio fora da janela é rejeitado; mesmo evento duas vezes processa uma; corpo grande devolve 400/413; rotação de segredo aceita velho e novo e depois só o novo. [BASE: 00736 "Security Testing"]
13. **Pix em si** (txid, id fim a fim, QR dinâmico, prazos do Banco Central, conciliação, devolução, API do banco): **[NÃO COBERTO]**. Consultar a documentação do provedor escolhido (Banco Inter, Asaas ou outro). Ver `docs/kb/05-integracoes.md` e `kb-mapa.md`.

---

## 7. Consistência, transações e concorrência

### 7.1 O que a base diz [BASE]
- **ACID**: atomicidade (tudo ou nada), consistência (as regras/restrições do app), isolamento (uma transação não vê a outra pela metade), durabilidade (confirmado não se perde). Isolamento e atomicidade vêm de **travas + log**; durabilidade vem de **log e recuperação**. (Architecture of a DB System, seção 6.1, `doc_00485-00486`; MySQL cap. 1, `doc_00031-00033`)
- **Exemplo do livro**: transferir R$ 200 em 3 passos; queda entre o passo 3 e 4 sem transação = cliente perdeu dinheiro. "Quase impossível fazer isso só com lógica de aplicação." (MySQL `doc_00030-00031`)
- **Quatro níveis de isolamento** (SQL): leitura suja, não repetível, fantasma, serializável. No MySQL o padrão é REPEATABLE READ; na maioria dos bancos, READ COMMITTED. (MySQL `doc_00032-00034`; Architecture seção 6.3.1, `doc_00490-00492`)
- **Atualização perdida** (lost update): duas transações leem o saldo, uma soma R$ 100, a outra subtrai R$ 300, e uma sobrescreve a outra. **Cursor stability** e **snapshot isolation** tratam isso de formas diferentes. Em snapshot isolation vale "**o primeiro a confirmar ganha**". (Architecture, `doc_00491-00492`)
- **Deadlock**: duas transações travam as mesmas linhas em **ordem diferente**. Os bancos detectam e abortam uma. **A aplicação deve tentar de novo.** (MySQL `doc_00033-00034`)
- **Regra de ouro da lógica de negócio**: se duas requisições podem correr juntas, assuma que vão. Usar transação, trava de linha ou atualização condicional. (00433)
- **Escrever o log antes da página (WAL)** com 3 regras: log antes do dado; log em ordem; **commit só retorna depois de o log do commit estar gravado**. "Muita gente lembra só da primeira". (Architecture 6.4, `doc_00493`)
- **Controle otimista**: bom quando o conflito é raro; refaz a transação em caso de conflito. (OCC, `doc_00593-00606`)
- **Transações distribuídas** (XA) existem no MySQL (cap. 5 p.262, `doc_00286`). DDIA lista "Life Beyond Distributed Transactions" como alternativa (só título).
- **Consistência eventual e compensação** (CAP): em falha, limitar operações, reconciliar e compensar erros. (`doc_00147-00153`)

### 7.2 Regras acionáveis [COMPL. onde indicado]
1. **Toda operação que mexe em mais de uma linha ou tabela** (baixa de pagamento, abertura de acordo, abertura de contestação, criação de cobrança) roda em **uma transação**. [BASE]
2. **Nunca ler, calcular no app e gravar sem proteção.** Usar uma destas formas (da tabela de padrões, 00433): `SELECT ... FOR UPDATE`; `UPDATE ... WHERE estado = 'emitida'` e **conferir o número de linhas afetadas**; chave única; transação serializável com nova tentativa. [BASE]
3. **Mudança de estado é atualização condicional**: "passar de `emitida` para `paga` **somente se** ainda está `emitida`". Se 0 linhas, outro processo chegou primeiro. [BASE]
4. **Coluna de versão** na linha (contador) para controle otimista nas telas de edição (dois analistas editando o mesmo acordo). [BASE: OCC; COMPL.: o desenho]
5. **Ordem fixa de travas** (sempre pagador, depois cobrança, depois pagamento) para reduzir deadlock; e **nova tentativa limitada** quando ele ocorrer. [BASE: deadlock]
6. **Nível de isolamento**: o padrão do Postgres é READ COMMITTED [COMPL.]. Para regras que dependem de "somar tudo e comparar" (ex.: limite de parcelas, soma de pagamentos x valor da cobrança), usar trava explícita ou SERIALIZABLE com nova tentativa. [BASE: tabela de padrões]
7. **Transação curta.** Nada de chamada a API externa (marketplace, banco, WhatsApp) **dentro** da transação que segura travas. Primeiro grava a intenção (fila/outbox), depois chama fora, depois grava o resultado. [COMPL.; a base cita "Queues Are Databases" e CDC, só títulos]
8. **Chamadas externas pelo robô** passam por tabela de fila no banco, com estado, número de tentativas e próxima tentativa. A mesma tabela serve de trilha. [COMPL.; base: Redis Cookbook mostra fila simples e DDIA cap. 11 lista referências]
9. **Duas partes do sistema nunca escrevem a mesma informação** sem regra de quem manda ("fonte da verdade" por dado). [BASE: princípio de redundância em Codd; COMPL.]
10. **Restrição de integridade é a última defesa**: mesmo com bug no app, o banco recusa duplicado ou valor inválido. [BASE: Architecture 6.1]
11. **Teste de concorrência obrigatório** para pagamento, acordo e contestação: dispare N requisições iguais ao mesmo tempo e confira que só uma vale. [BASE: 00433 "Don't assume fast enough"; 00736 testes]

---

## 8. Índices e desempenho de consulta

### 8.1 Regras da base [BASE, MySQL cap. 3 e cap. 4]
1. **Índice é para consultas que você vai rodar**: projete o esquema e os índices para as consultas reais; estime desempenho antes. Índice acelera leitura e **atrasa gravação**. (`doc_00104`)
2. **Índice em árvore B** serve para: valor inteiro, **prefixo mais à esquerda**, faixa, ordenação. **Não ajuda** se a consulta não começa pela coluna mais à esquerda. (`doc_00124`)
3. **Isolar a coluna**: se a coluna indexada está dentro de função ou conta (`WHERE id + 1 = 5`, `TO_DAYS(data)`), o índice não é usado. Escreva a comparação com a coluna sozinha. (`doc_00130`)
4. **Índice multicoluna**: a ordem das colunas importa; pense na seletividade e nas consultas. **Índice que cobre a consulta** (só o índice responde) é mais rápido. (docs 130-150)
5. **Índices redundantes ou duplicados** só custam gravação e espaço. Revisar de vez em quando. (`doc_00151`)
6. **Chave primária** em ordem crescente no InnoDB insere melhor; chave aleatória (UUID, MD5) causa espalhamento e lentidão. (`doc_00118-00119`) [COMPL.: no Postgres o efeito é diferente, porque a tabela não é agrupada pela chave; ainda assim, UUID aleatório cria índice maior e menos eficiente.]
7. **Manutenção de índice e tabela**: estatísticas, fragmentação, `OPTIMIZE`. (`doc_00160-00162`) Utilitários devem rodar **online**. (Architecture 7.5, `doc_00513-00514`)
8. **Desnormalizar** (copiar dado, guardar totais) acelera leitura mas **complica toda gravação**. Contadores e tabelas-resumo são caros de manter. (`doc_00163-00168`)
9. **Tabelas de resumo** para relatórios (ex.: aging, total por pagador) são úteis. Exigem regra de quem atualiza e quando. [BASE: p.145-146; COMPL.: aplicação]
10. **Otimizador usa estatísticas**: às vezes ignora o índice. Usar `EXPLAIN` para ver o plano (Apêndice B do livro, MySQL). (System R optimizer, `doc_00687-00698`)

### 8.2 Regras acionáveis para o IT.MK [COMPL. sobre a base]
1. **Chaves estrangeiras indexadas** (`pagador_id`, `loja_id`, `cobranca_id`). O Postgres não cria índice na FK sozinho.
2. **Índice único** onde há regra de unicidade: (`pagador`, `competência`, `tipo`) na cobrança, id do evento do webhook, identificador Pix, (`loja`, `marketplace`) na conexão. Serve de **regra de negócio e de índice** ao mesmo tempo. [BASE: "um por usuário = restrição única", 00433]
3. **Índice parcial** para filas e estados ("só `estado = 'pendente'`"). Mantém o índice pequeno.
4. **Listas e telas** com filtro por status, vencimento e pagador pedem índice composto na ordem dos filtros (igualdade primeiro, faixa depois). [BASE: regra do prefixo à esquerda]
5. **Não criar índice "por precaução"**: criar quando a consulta existir e **medir** (`EXPLAIN`). [BASE: "don't forget to benchmark", doc 130]
6. **Paginação** nas listas de cobrança e de auditoria (chave de busca, não `OFFSET` grande). [COMPL.]
7. **Relatórios pesados** (aging, resumo mensal) saem de **tabela-resumo ou visão** atualizada por rotina, não de varredura ao vivo na tela. [BASE: tabelas-resumo; COMPL.]
8. **Tamanho e crescimento**: tabelas de auditoria crescem sem parar. Planejar **partição por mês** ou arquivamento **sem apagar** (mover para armazenamento frio mantendo a corrente de hash). [COMPL.; **atenção:** a base não cobre partição do Postgres]

---

## 9. Migrações e mudança de esquema

### 9.1 O que a base diz [BASE]
- No MySQL, o `ALTER TABLE` **recria a tabela inteira** (cria vazia, copia, apaga a velha). Em tabela grande leva **horas ou dias** e bloqueia. Há atalhos para mudanças que só mexem no arquivo de definição (MySQL p.145-149, `doc_00169-00173`). **Específico de MySQL antigo.**
- **Utilitários online**: backup e reorganização precisam rodar **com o sistema em uso**; "a janela de madrugada" já não existe em sistemas 24x7. (Architecture 7.5, `doc_00513`)
- **Evolução de formato** (Avro/Protobuf/Thrift, "Schema Evolution", "Your API Versioning Is Wrong", Stripe "API Upgrades"). **Só títulos** na base (backend `doc_00004`).
- Stripe **"Online Migrations at Scale"**: só o título (backend `doc_00012`).
- Ambientes **separados** (desenvolvimento, homologação, produção), com bancos e contas diferentes. (Database Security 00473)
- **IaC** (infraestrutura como código) tem cheat sheet própria (00552). Não li a fundo.
- **Staging** (cópia do sistema para testar antes de entregar) já está em `docs/base-po.md` seção 7.

### 9.2 Regras acionáveis [COMPL., em cima do que a base aponta]
1. **Toda mudança de esquema é um arquivo de migração versionado**, no repositório, numerado, revisado e **testado em cópia dos dados** antes de produção. Nada de mudar tabela "na mão".
2. **Passos pequenos e reversíveis**: adicionar coluna nova (aceitando nulo) → código passa a gravar nos dois → copiar dados antigos → código lê só da nova → só depois remover a antiga (**expandir e contrair**). Mesma ideia de "migração online" do título do Stripe.
3. **Nunca apagar coluna ou tabela com dado financeiro**; "aposentar" e manter cópia.
4. **Criar índice sem travar** a tabela (no Postgres existe a forma `CONCURRENTLY`). Conferir na documentação oficial. [NÃO COBERTO]
5. **Migração com dado financeiro** exige **conferência de totais antes e depois** (soma de valores, contagem de linhas) registrada no item.
6. **Plano de volta** escrito para cada migração (como desfazer, ou restaurar backup).
7. **A conta de migração é separada** da conta do app. O app não tem permissão de mudar esquema. [BASE: 00473 e 00590 "reserve privileged connections for migrations"]
8. **Não entregar migração na sexta-feira.** [BASE: `docs/base-po.md` seção 7]
9. **Ferramenta de migração** (Flyway, Liquibase, CLI do Supabase): **[NÃO COBERTO]**. Decisão técnica do time; o P.O. só exige os critérios acima.

---

## 10. Backups e recuperação

### 10.1 O que a base diz [BASE, MySQL cap. 11, `doc_00497-00544`]
- **Quanto você pode perder?** Define a estratégia: basta restaurar o backup da noite anterior, ou precisa de **recuperação até um ponto no tempo**? (Com log binário ligado dá para restaurar o backup e reaplicar o log.) Existe o requisito "mole" (perto o bastante) e o "duro" (nunca perder transação confirmada). (`doc_00501`, `00503`)
- **Motivos para ter backup** além de desastre: **gente que muda de ideia** (cliente apagou e quer de volta), **auditoria** (ver como o dado era), testes com dados reais. (`doc_00501`)
- **Verifique suas suposições**: hospedagem barata muitas vezes **não faz backup**, ou copia arquivo com o banco rodando, gerando backup corrompido. (`doc_00501`)
- **Backup só vale depois de testado** ("Don't consider a backup good until you've tested it"). (`doc_00509`)
- **Lógico (dump) x cru (arquivos)**: o lógico é legível e portátil, o cru é rápido. Escolha pelas necessidades. (`doc_00503-00505`)
- Backup **online** que não interrompe é difícil no MySQL; alternativa: tirar de uma **réplica**. (`doc_00503`)
- Banco: usar **backup "difuso" + log** para não travar tudo. (Architecture 7.5, `doc_00514`)
- **Backups protegidos e, de preferência, criptografados**; **log de transações em disco separado**. (Database Security 00473)
- **Segredos**: backup automático, **restauração testada**, criptografia e acesso restrito ao local do backup; **credenciais de emergência** ("break-glass") guardadas em segundo cofre e testadas. (Secrets 00676 seção 2.9)
- **Redis**: RDB (foto periódica) x AOF (log de comandos). (Redis Cookbook p.45, `doc_00769-00772`)

### 10.2 Regras acionáveis para o IT.MK
1. **Escrever o objetivo de perda**: quantas horas de cobrança/pagamento o negócio aceita perder, e em quanto tempo precisa voltar. Isso é decisão do dono e vira critério de aceite. [BASE: "What can you afford to lose?"]
2. **Backup automático diário** + **recuperação a um ponto no tempo** para dados financeiros. [BASE: conceito; COMPL.: no Supabase isso depende do plano, **[NÃO COBERTO]**: confirmar na documentação oficial]
3. **Teste de restauração mensal** em ambiente separado, com conferência de totais, e **registro do resultado**. [BASE: "testar o backup"]
4. **Backup criptografado**, guardado **fora** do mesmo local do banco, com acesso restrito e monitorado. [BASE: 00473; 00676]
5. **Chaves de criptografia de segredos têm backup à parte**: sem a chave, o segredo guardado cifrado **não volta**. Testar a restauração das chaves também. [BASE: 00676 seção 2.9; 00472 "Separation of Keys and Data"]
6. **Restauração nunca apaga a auditoria**: a trilha tem de sobreviver ou ser restaurada junto, com a corrente de hash íntegra. [COMPL.]
7. **Dados de teste** vindos de produção devem ter **segredos e dados pessoais mascarados**. [BASE: 00573 "Data to exclude"; 00730 privacidade]

---

## 11. Segurança no Backend e no Database

### 11.1 Segredos das conexões com marketplace (**só de gravação**)
Situação IT.MK: cada loja tem **conexões de marketplace com segredos** (chaves/tokens de API).

O que a base diz [BASE]:
- Nunca no código, nem em arquivo de configuração versionado, nem em imagem de contêiner. Guardar em **cofre de segredos**. (Webhook 00736 seção 3; Database Security 00473; Cryptographic Storage 00472)
- **Acesso mínimo**: engenheiros **não** devem ter acesso a todos os segredos. Controle fino por objeto. (Secrets 00676 seção 2.3)
- **Reduzir a interação humana** com o segredo: pipeline, segredos dinâmicos, **rotação automática**. (seção 2.4)
- **Ciclo de vida**: criar (forte, com o mínimo de privilégio), **girar** com regularidade, **revogar** quando não precisa ou se vazou, **expirar**. (seção 2.7)
- **Auditar** quem pediu, usou, alterou, e tentativas de usar segredo expirado. (seção 2.6)
- **Metadados** do segredo: quando e quem criou/usou/girou/apagou, para que serve, tipo, quando girar, **quem contatar**. (seção 2.11)
- **Cifrar em repouso** com **AES** (128, ideal 256) em **modo autenticado (GCM)**; **nunca algoritmo próprio**; ECB não. (00472)
- **Chaves**: gerar com gerador aleatório seguro (em Java, `SecureRandom`; não `Math.random`/`Random`). **Chave separada do dado.** Duas camadas: **DEK** (cifra o dado) e **KEK** (cifra a DEK), guardadas em lugares diferentes. (00472)
- **Rotação**: ou decifrar e recifrar tudo com a nova chave (preferido), ou **marcar cada item com o id da chave** e manter várias chaves para ler os antigos. **Ter o processo de rotação pronto antes de precisar.** (00472, "Key Lifetimes and Rotation")
- **Variáveis de ambiente** podem vazar (`phpinfo`, `/proc/self/environ`). Evitar para chaves. (00472)
- **Memória**: minimizar o tempo do segredo em claro; em Java não usar estruturas imutáveis (String) para segredos quando possível. (00676 seção 2.5)
- **Vazamento**: **revogar, girar, apagar, registrar**. Ter documento de resposta. Detectar segredo no código (pré-commit). (00676 seções 8 e 9)
- **Não registrar segredos em log nem em resposta de erro.** (00573; 00736)
- Ao **girar com janela dupla** (aceitar velho e novo por um tempo). (00736 seção 3)

"**Só de gravação**" (write-only): a base **não usa essa expressão**. É uma regra derivada do acesso mínimo e do "não registrar em log" [COMPL.]:
1. A API e a tela **aceitam** o segredo na criação/troca e **nunca o devolvem**. A tela mostra só "configurado", **últimos 4 caracteres** e data da última troca.
2. A tabela `conexao_segredo` fica **separada** da tabela `conexao_marketplace`. O app **grava** nela; só o **módulo que chama o marketplace** (conta própria) **lê**.
3. Valor guardado **cifrado** (AES-GCM) com `chave_id` e versão; a chave (KEK) fica **fora do banco**.
4. **Toda leitura do segredo gera evento de auditoria** (quem, para quê, quando), sem o valor. (BASE: 00676 seção 2.6)
5. **Troca e revogação** são ações do P.O./dono com registro. Teste de conexão **não exibe** o segredo nem a resposta crua do marketplace.
6. **Cofre ou cifra no app?** **[NÃO COBERTO]** para Supabase (Vault, pgsodium etc.). A base cobre só o princípio. O time técnico decide e registra.

### 11.2 Validação de entrada
[BASE: 00555, 00672, 00662, 00708, 00426, 00736 seção 9]
1. **Nunca confiar** na entrada (API, planilha, webhook, retorno do marketplace). Mesmo **assinado**, o conteúdo pode ser malicioso.
2. **Lista de permitidos**, não de proibidos. Validação **sintática** (formato: CNPJ, data, moeda) **e semântica** (valor dentro do esperado, vencimento depois da emissão).
3. **Tipos fortes** (número, booleano, data) nos parâmetros. Texto limitado por regex que cobre a string inteira (`^...$`), com tamanho mínimo e máximo. Rejeitar o inesperado.
4. **Tamanho máximo** do corpo: rejeitar com 413. **Tipo de conteúdo** inesperado: 415 ou 406. **Não copiar** o `Accept` para o `Content-Type` da resposta. (00672)
5. **Esquema JSON** estrito para webhooks e importações (campos permitidos e tipos). (00736; 00555)
6. **Consulta parametrizada (prepared statement) sempre**. Nunca montar SQL com texto do usuário. Procedure armazenada só se for construída com segurança. Escapar manualmente é **fortemente desencorajado**. (00708; 00662)
7. **Importação de planilha/arquivo** (faturamento por base): validar extensão, **tamanho**, nome gerado pelo servidor, caminho definido pelo servidor, análise de conteúdo; ZIP só após checar caminho e tamanho. (00555 "File Upload", 00506)
8. **Falha de validação é evento de log**; cem por segundo = alguém atacando. (00672)
9. **Bean Validation** (Jakarta) em Spring, com constraints nos DTOs. (00426)
10. **Mass assignment**: DTO só com campos editáveis; nada de ligar o JSON direto na entidade. (00581)

### 11.3 SSRF (o servidor fazendo chamadas para fora)
Onde pode acontecer no IT.MK: **conexão com marketplace**, envio de mensagem (WhatsApp), consulta ao banco/Pix, qualquer **URL cadastrada por usuário** (callback, avatar, anexo).
[BASE: 00689 e 00736 seção 7]
1. **Caso 1: destinos conhecidos** (as APIs oficiais dos marketplaces e do banco): **lista de permitidos** de domínio e IP; protocolo só **HTTPS**.
2. **Caso 2: destino livre**: bloquear faixas privadas, loopback, link-local (`169.254.0.0/16`, inclui o endereço de metadados da nuvem) e nomes internos. Lista de bloqueio é **último recurso**.
3. Validar com **biblioteca confiável**, não regex caseira. Em Java: `InetAddressValidator` e `DomainValidator` do Apache Commons Validator; a base testou e diz que o de IP **não** cai nos truques de hexadecimal, octal e codificação mista. (00689)
4. **Desligar redirecionamento** no cliente HTTP (ou validar cada destino do redirecionamento). **Resolver o nome para IP antes** e **de novo logo antes da chamada** (contra "DNS rebinding"). (00689; 00736)
5. **Defesa em duas camadas**: aplicação **e rede** (firewall/saída restrita). Na nuvem, usar IMDSv2 (AWS) se aplicável. (00689)
6. **Não enviar** o segredo de uma conexão para um destino que veio de entrada do usuário. [COMPL.]
7. Teste: cadastrar `http://169.254.169.254/` como destino deve ser **bloqueado**. (00736 testes)
8. PDFs de apoio na base: "SSRF Bible" e Orange Tsai (em `seguranca/documentos`, páginas de PDF). Leitura para especialista.

### 11.4 Deserialização
[BASE: 00481; PDF da palestra "Java Deserialization Attacks" em `seguranca__doc_00001..00051`; DDIA cap. 4 cita CWE-502]
1. **Não usar a serialização nativa do Java** (`ObjectInputStream`, RMI, JMX, JMS com objetos) para dados vindos de fora. A palestra lista o "Spring Service Invokers" (HTTP/JMS/RMI) entre os pontos de ataque. (doc 00005)
2. **Trocar por formato puro de dados** (JSON) com **DTO**: reduz muito o risco. (00481 "Using Alternative Data Formats")
3. **Jackson** (o padrão do Spring) é seguro **se não usar polimorfismo** (sem tipagem padrão ligada). **SnakeYAML**, **json-io**, **XMLDecoder**, **fastjson antigo**, **XStream antigo** e **Kryo antigo** estão na lista de **inseguros**. (00481)
4. Se for inevitável: **lista de classes permitidas** (override de `resolveClass`, biblioteca como SerialKiller, `ValidatingObjectInputStream` do Commons IO). (00481)
5. **Só desserializar dado assinado** quando se sabe de antemão que mensagens serão processadas. (00481)
6. **Objetos de domínio** que implementam `Serializable` por herança: declarar `readObject` que **sempre lança exceção**; marcar campo sensível como `transient`. (00481)
7. Detectar: bytes `AC ED 00 05` (hex) ou `rO0` (Base64) numa requisição = objeto Java serializado. (00481)
8. Registrar **falhas de desserialização** como evento de segurança. (Logging 00573)
9. Atenção a **XML**: usar parser sem XXE; XXE pode virar SSRF. (00689; 00672)

### 11.5 Controle de acesso (serviço, banco e API)
Lembrete do `CLAUDE.md`: **na tela não há perfis nem níveis**. Isto vale para a **interface**. O Backend ainda precisa de **identidades técnicas separadas** (app, robô, migração, relatório) com poder mínimo. Isso não cria "modo" na tela. Pergunta ao dono/time: o login do analista dá acesso a tudo? [decisão do dono]

[BASE: 00412, 00410, 00556, 00672, 00473, 00590]
1. **Negar por padrão.** Verificar permissão **em toda requisição**, no servidor, perto do dado. Sem exceção para "chamada interna". (00412)
2. **Privilégio mínimo.** Conta do banco **por serviço**, sem root, sem dono do banco, só as permissões necessárias; ambientes com contas e bancos separados. (00473)
3. **IDOR**: não basta esconder o id. Toda busca por id deve ser **dentro do conjunto que a pessoa pode ver** ("`usuario.projetos.find(id)`", não "`Projeto.find(id)`"). Id aleatório é defesa extra, não controle. (00556)
4. **Papéis simples (RBAC) crescem mal** (explosão de papéis); a base recomenda atributos/relações (ABAC/ReBAC) quando as regras ficarem finas. (00412)
5. **Autorização de ação financeira** (baixa manual, acordo, cancelamento, perdão de juros): checar **no servidor**, **estado permitido**, **dados não alterados entre a conferência e a execução** (TOCTOU), e **cada execução** autorizada. "Quem aprova não aprova o próprio pedido" é exemplo de regra contextual. (00724; 00433)
6. **Ordem das chamadas da API** (criar → validar → aprovar → finalizar): o servidor valida a **máquina de estados**; chamar o passo final sem os anteriores deve ser rejeitado. (00672 "Out-of-Order API Execution"; 00433)
7. **JWT**: assinatura obrigatória (nunca `alg: none`), algoritmo definido pelo servidor (não pelo cabeçalho), conferir `iss`, `aud`, `exp`, `nbf`. (00672)
8. **Endpoints de gestão** fora da internet ou com autenticação forte e rede restrita. (00672)
9. **Restringir métodos HTTP** (405). **CORS** desligado se não for preciso. Cabeçalhos de segurança nas respostas. (00672)
10. **Logar falhas de autorização** e **testar** a autorização em automático (testes de regressão de acesso). (00412; cheat sheet de testes de autorização na lista)
11. **Banco**: permissão por tabela/coluna/linha e acesso por **views** são recomendadas para sistemas críticos. (00473)
12. **RLS do Postgres** (base, 00590): `ENABLE` e `FORCE ROW LEVEL SECURITY` + política por linha; **superusuário e papel com `BYPASSRLS` ignoram a política**, então o app **não pode** conectar com esses papéis; definir o contexto com `SET LOCAL`/`set_config(..., true)` **dentro da transação**; se o contexto faltar, **falhar fechado**. O IT.MK tem **visão única** (um só conjunto de dados), então o uso de RLS é para **proteger tabelas contra acesso direto indevido**, não para separar clientes. **[NÃO COBERTO] para Supabase**: como RLS e as chaves públicas/de serviço se comportam lá. Confirmar na documentação oficial.

### 11.6 Logs e monitoramento
[BASE: 00573, 00576, 00736 seção 13, 00715, 00672]
- **Registrar sempre**: falhas de validação, **sucesso e falha de login**, **falhas de autorização**, falhas de sessão/token, erros e exceções, partida e parada, uso de função de alto risco (**acesso a dado sensível, uso/rotação de chave, importação e exportação de dados**, ação administrativa, conta de emergência), falhas de desserialização, falhas de TLS, **ações fora de ordem ou que excedem limites**.
- **Campos**: quando, onde, quem, o quê (tipo, severidade, descrição); mais ação, objeto, resultado, motivo.
- **Nunca registrar** (ou mascarar/hash): senhas, tokens, ids de sessão, chaves, strings de conexão, dados de cartão/conta, dados pessoais sensíveis, corpo completo de webhook (pode ter PII).
- **Alertar** em: aumento de falha de assinatura; erros 4xx/5xx contínuos; entregas de IPs inesperados; pedido pago sem confirmação; muitos callbacks por pedido; falha na fila de erros.
- Logs **centralizados**, em partição/conta separadas, com **acesso restrito**; log não pode ser usado para derrubar o sistema (disco cheio) nem para bloquear outros usuários.
- Respostas de erro **genéricas** para o cliente; detalhe vai para o log do servidor. (00672; 00736 seção 12; Error Handling 00502)
- "Vocabulário de log" (00576, 40 KB) padroniza nomes de evento. Útil para definir o dicionário de eventos de auditoria do IT.MK.

### 11.7 Outros itens de segurança úteis
- **TLS 1.2+** em tudo, inclusive **entre app e banco** (TLSv1.2+, verificar o certificado). (00473; 00726; 00736 seção 1)
- **Senhas de usuário** (se houver login próprio): Argon2id, scrypt, bcrypt ou PBKDF2 com os parâmetros da cheat sheet (ex.: PBKDF2-HMAC-SHA256 com 600.000 iterações; Argon2id m=19 MiB, t=2, p=1). (00641) **Não** seguir o exemplo MD5/SHA1 do livro de MySQL.
- **Limitar taxa** e usar fila para absorver pico (429 + `Retry-After`). Validar barato primeiro; degradação graciosa. (00736; 00477)
- **Dependências e CI/CD**: gestão de dependências vulneráveis, SBOM, cadeia de suprimentos, segredos fora do pipeline. (00733, 00480, 00707, 00453) Não aprofundei.
- **Modelagem de ameaças** antes de construir uma funcionalidade nova, partindo do **processo de negócio** ("o que acontece se o usuário agir de má-fé?") e **escrevendo invariantes**. (00716; 00433)
- **LGPD / privacidade** de dados pessoais de pagadores: a base tem só a cheat sheet genérica `User_Privacy_Protection` (00730). **LGPD em si: [NÃO COBERTO]**.
- **Robô com IA** (se um dia usar modelo de linguagem para redigir cobrança): existem `AI_Agent_Security` (00405), `LLM_Prompt_Injection_Prevention` (00571), `Secure_Coding_with_AI` (00686), `MCP_Security` (00582). Não li. Marcar como leitura futura.

---

## 12. Redis: quando entra
[BASE: Redis Cookbook] [COMPL. a recomendação]
- Útil para: expiração automática (EXPIRE), limitação de taxa, pub/sub, cache, fila simples.
- **Não usar como fonte única de dinheiro, cobrança ou auditoria.** Persistência RDB (foto) pode perder o que veio depois; AOF reduz a perda. (p.45)
- `MULTI/EXEC` dá execução em bloco; resposta só aparece no fim; para usar o valor lido dentro do bloco precisa de `WATCH`. (p.757, `doc_00757`)
- Para o IT.MK, **começar sem Redis**: fila e idempotência em tabelas do Postgres. Reavaliar se a carga exigir.

---

## 13. Métricas e relatórios (aproveitando `data-science`)
[BASE: Wheelan] + [COMPL. para as fórmulas do IT.MK]

Regras para o Backend/Database prepararem **dados de relatório** corretos:
1. **Média engana com valores extremos; mediana não.** Em ticket médio, atraso médio e valor por loja, mostrar **mediana junto com a média**. Um pagador gigante distorce tudo. (doc ~30-33)
2. **Precisão não é acurácia.** Não exibir centavos de um número estimado. Dizer a margem. (doc 48)
3. **Descrição enganosa**: toda porcentagem precisa mostrar **o total (denominador)**. Ex.: "inadimplência de 20%" de quê? Do faturado, do vencido ou do número de pagadores? Definir cada indicador com **fórmula escrita**. (cap. 3; COMPL.)
4. **Entra lixo, sai lixo.** A qualidade do relatório começa nas **restrições do banco** (seção 3). Amostra enviesada continua ruim mesmo grande. (cap. 7, docs 116-119)
5. **Correlação não é causa.** Se o robô cobrou mais e entrou mais dinheiro, não prova que foi o robô. Comparar com grupo de controle antes de afirmar. (cap. 4)
6. Indicadores sugeridos [COMPL., não estão na base]: **valor em aberto por faixa de atraso (aging)**, **taxa de recuperação** (recebido ÷ vencido no período), **tempo médio até o pagamento (mediana)**, **promessas cumpridas** nos acordos, **contestações abertas e tempo de resolução**, **mensagens do robô por pagador**. Definir fórmula e fonte de cada um no item do backlog.
7. **Congelar o número do fechamento do mês**: relatório de mês fechado vem de **tabela fechada** (seção 5), não de recálculo ao vivo.

---

## 14. Como aplicar ao IT.MK: tabelas candidatas e regras por assunto

**Aviso:** é desenho candidato para o P.O. pedir e validar. Nomes e campos são **sugestão [COMPL.]**. Decisão final do time técnico. Cada regra marcada com [BASE] tem origem nas seções anteriores.
Convenções comuns a **todas** as tabelas:
- Chave primária interna + `id_publico` aleatório quando aparecer fora do banco.
- `criado_em`, `criado_por` (usuário, robô ou sistema); tabelas editáveis também têm `atualizado_em` e `versao` (controle otimista).
- Dinheiro: padrão único (centavos `bigint` ou `numeric(15,2)`), coluna de moeda.
- Estados: tabela de domínio ou `CHECK`. Transições só pelas permitidas.
- **Nunca `DELETE`** em dado financeiro: usar estado ("cancelada", "arquivada") ou evento de correção.

### 14.1 Pagador, Loja e Base de faturamento
| Tabela | Campos principais | Regras |
|---|---|---|
| `pagador` | id, nome/razão social, documento, contatos, ativo | `documento` único. Dado pessoal: mascarar em logs. |
| `loja` | id, pagador_id (FK), nome, marketplace, identificador externo | (`marketplace`, `identificador externo`) único. |
| `faturamento_base` | id, loja_id, **competência (date)**, marketplace, valor_bruto, origem (API/planilha), importação_id, **versão**, estado (rascunho, fechada, retificada), hash do arquivo | (`loja`, `competência`, `origem`, `versão`) único. **Fechada = imutável.** Retificação = nova versão ligada à anterior. |
| `importacao` | id, tipo, arquivo (nome gerado, hash), usuário, linhas lidas/aceitas/rejeitadas, hora | Valida arquivo (seção 11.2 item 7). Guarda o motivo de cada linha rejeitada. |
Sobre "Base de faturamento": a cobrança nasce **do faturamento por base**; guardar de qual versão da base nasceu. Conferir totais da importação (soma e contagem) antes de fechar. [COMPL.]

### 14.2 Regra de cálculo e Cobrança
| Tabela | Campos | Regras |
|---|---|---|
| `regra_calculo` | id, **versão**, vigência_início, parâmetros (percentuais, prazo, juros, multa), arredondamento, autor | **Nunca editada.** Nova regra = novo registro. |
| `cobranca` | id, pagador_id, competência, tipo, valor, vencimento, estado, regra_calculo_id, base(s) de origem, substitui_cobranca_id | **Única** (`pagador`, `competência`, `tipo`, `versão`) para o robô não gerar duplicata. Recalcular = **nova linha** que substitui. |
| `cobranca_evento` | id, cobranca_id, tipo, estado_de→estado_para, ator, motivo, dados (sem segredo), hora, hash_anterior, hash | **Append-only** + corrente de hash. |
Estados sugeridos [COMPL.]: rascunho → emitida → vencida → (parcial/paga | em contestação | em acordo | cancelada). Transição só pela **tabela de transições permitidas**, no servidor. [BASE: 00672, 00433, 00724]
Mudança de estado = `UPDATE ... WHERE estado = <esperado>` + conferir linhas afetadas + inserir evento, **na mesma transação**. [BASE]

### 14.3 Pagamento Pix
| Tabela | Campos | Regras |
|---|---|---|
| `pagamento` | id, cobranca_id, meio (Pix), valor, moeda, identificador do provedor (**único**), status, pago_em, evento_id_origem | Identificador único do provedor. Valor e moeda **conferidos** com a API do provedor antes de confirmar. [BASE: 00715] |
| `webhook_evento_recebido` | id, provedor, **event_id (único com provedor)**, recebido_em, assinatura_ok, corpo cru, hash do corpo, estado, tentativas, processado_em | Gravar antes de processar. Duplicado → 200 e fim. [BASE: 00736] |
| `idempotencia` | chave, escopo, hash do pedido, resposta guardada, criado_em, expira_em | Para ações externas do robô e chamadas da API que criam dinheiro. [BASE: 00433] |
| `fila_tarefa` | id, tipo, payload (sem segredo), estado, tentativas, próxima_tentativa, travado_por | Fila no banco. Um worker pega com trava de linha. Falha repetida → fila de erros + alerta. [COMPL.; BASE: 00736 fila de erros] |
Regras: seção 6.2 inteira. Pagamento a maior/menor/duplicado: **decisão do dono**. Detalhes do Pix: **[NÃO COBERTO]**.

### 14.4 Contestação
| Tabela | Campos | Regras |
|---|---|---|
| `contestacao` | id, cobranca_id, motivo, aberta_por, aberta_em, estado, prazo, resolução, valor_contestado | Uma contestação aberta **pausa o robô** para aquela cobrança (**falha fechada**). [BASE: 00407 seção 5, adaptado] |
| `contestacao_evento` | id, contestacao_id, tipo, autor, texto, anexos (hash), hora, hash_anterior, hash | **Append-only.** Anexos: validar tipo/tamanho, nome gerado pelo servidor. [BASE: 00506] |
Regras [COMPL.]: abrir contestação grava evento na cobrança **na mesma transação**; resolução (procedente/improcedente) gera **ajuste** (novo lançamento), nunca edição do valor antigo; prazo e responsável vêm de regra escrita pelo dono.

### 14.5 Acordo
| Tabela | Campos | Regras |
|---|---|---|
| `acordo` | id, pagador_id, cobrancas incluídas, valor total, desconto/juros, entrada, nº de parcelas, estado | Aprovação **autorizada no servidor**, dados protegidos entre conferência e execução. [BASE: 00724] |
| `acordo_parcela` | id, acordo_id, número, valor, vencimento, estado | Soma das parcelas **fecha** com o total (regra de centavos). |
Regras [COMPL.]: acordo vigente **pausa** a cobrança normal dessas cobranças; quebra de acordo gera evento e reativa.

### 14.6 Conexão com marketplace (segredo)
| Tabela | Campos | Regras |
|---|---|---|
| `conexao_marketplace` | id, loja_id, marketplace, estado, **últimos 4 do segredo**, última troca, último teste, resultado do teste | Sem o segredo. Aparece na tela. |
| `conexao_segredo` | id, conexao_id, **valor cifrado**, **chave_id**, versão, criado_em, revogado_em | **Só gravação** para o app. Leitura só pelo módulo conector (conta própria). Cada leitura gera auditoria. |
Regras: seção 11.1 inteira; SSRF (11.3) nas chamadas; **rotação** com janela dupla; revogação registrada.

### 14.7 Auditoria do robô
| Tabela | Campos | Regras |
|---|---|---|
| `robo_execucao` | id, início, fim, versão do robô, versão da regra, parâmetros, resultado | Uma linha por rodada. |
| `robo_acao` | id, execucao_id, cobranca_id, pagador_id, ação (mensagem, pausa, ignorou), motivo/regra aplicada, canal, **chave de idempotência**, resultado, hash_anterior, hash | **Append-only**, corrente de hash. Registra também **o que o robô decidiu NÃO fazer** e por quê. |
Regras: seção 4.2 inteira. **O robô só insere.** Verificação diária da corrente. Mensagens enviadas guardam **conteúdo** (ou hash + cópia em local controlado) para provar o que foi dito ao pagador. Retenção: decisão do dono. [NÃO VERIFICADO]

### 14.8 Contas do banco (privilégio mínimo)
| Conta | Pode | Não pode |
|---|---|---|
| App (API) | Ler e escrever nas tabelas de negócio; **inserir** em auditoria | `UPDATE`/`DELETE` em auditoria; mudar esquema; ler `conexao_segredo` |
| Robô | Ler o que precisa; **inserir** em `robo_*` e em `cobranca_evento` | Apagar; mudar esquema; ler segredo |
| Conector de marketplace | Ler `conexao_segredo` | Qualquer outra coisa |
| Migração | Mudar esquema | Uso em produção no dia a dia |
| Relatório | Só leitura em visões/resumos | Escrita |
[BASE: 00473 "uma conta por aplicação, mínimo de permissão, sem root, ambientes separados"] [COMPL.: o desenho das 5 contas]

---

## 15. Checklist de critérios de aceite (copiar para os itens BL-xx)

Marcar só o que se aplica ao item. Cada caixa deve ser **testável**.

### 15.1 Database (todo item que mexe em tabela)
- [ ] Tabela tem chave primária e chaves estrangeiras declaradas.
- [ ] Colunas `NOT NULL` por padrão; tipos mínimos e iguais entre chave e chave estrangeira.
- [ ] Dinheiro em tipo exato (decimal ou inteiro em centavos), com coluna de moeda. **Nenhum float.**
- [ ] Regras de unicidade no banco (chave única), não só no app.
- [ ] Estados em tabela de domínio ou `CHECK`; transições permitidas definidas.
- [ ] Índices criados para as consultas reais do item, com `EXPLAIN` anexado; FKs indexadas.
- [ ] Tabelas de histórico/auditoria são **append-only** (permissão de `UPDATE`/`DELETE` retirada e teste que prova o bloqueio).
- [ ] Corrente de hash nas tabelas de auditoria, com rotina de verificação e alerta.
- [ ] Nenhum segredo ou dado sensível em coluna legível; segredos cifrados com `chave_id`.
- [ ] Migração versionada, testada em cópia, com **plano de volta** e **conferência de totais** antes/depois.
- [ ] Contas do banco separadas (app, robô, conector, migração, relatório) com privilégio mínimo.
- [ ] Conexão do app ao banco com **TLS** e certificado verificado.
- [ ] RLS ligado nas tabelas expostas, se houver acesso direto de API ao banco; app **não** usa papel que ignora RLS. (decidir com o time; ver 11.5 item 12)
- [ ] Backup diário ativo, **restauração testada** com totais conferidos e resultado registrado.
- [ ] Tabela cresce sem parar? Há plano de partição/arquivamento **sem apagar**.

### 15.2 Backend (todo item que cria ou muda serviço/API)
- [ ] Toda operação de várias linhas roda em **uma transação**.
- [ ] Mudança de estado usa **atualização condicional** e confere linhas afetadas.
- [ ] **Teste de concorrência**: N chamadas iguais ao mesmo tempo produzem **um** efeito.
- [ ] Ações externas que criam dinheiro/mensagem usam **chave de idempotência** guardada com o resultado.
- [ ] **Webhook**: assinatura sobre o corpo cru, comparação em tempo constante, janela de ±5 min, id do evento único, responde 200 para duplicado, processa por fila, só POST.
- [ ] **Pagamento** só é confirmado após **consulta à API do provedor** com valor, moeda e id conferidos.
- [ ] Valores e permissões **recalculados no servidor**; nenhum valor financeiro aceito do cliente.
- [ ] **DTOs** de entrada com campos permitidos; **Bean Validation**; sem ligar JSON direto à entidade.
- [ ] Todas as consultas **parametrizadas**; nenhum SQL montado com texto externo.
- [ ] Entrada: tamanho máximo (413), tipo de conteúdo (415), esquema JSON estrito, listas de permitidos.
- [ ] **Sem serialização nativa Java** para dados externos; Jackson sem polimorfismo; sem formatos da lista de inseguros.
- [ ] Chamadas externas com **lista de permitidos**, HTTPS, sem redirecionamento, IP validado; **teste de SSRF** (`169.254.169.254`) bloqueado.
- [ ] **Segredos**: nunca no código, nem em log, nem em resposta; API **não devolve** segredo; leitura do segredo gera auditoria.
- [ ] **Negar por padrão**; permissão checada em toda requisição; busca por id dentro do conjunto permitido; **teste automático de acesso**.
- [ ] Ordem das chamadas validada por **máquina de estados** (passo final sem os anteriores é rejeitado).
- [ ] **Falha fechada**: se a checagem obrigatória falhar, a ação não acontece e a falha é registrada.
- [ ] Logs com quando/quem/onde/o quê; **sem segredo, sem dado sensível, sem corpo completo de webhook**; sanitizados contra injeção.
- [ ] Respostas de erro **genéricas** ao cliente; detalhe só no log do servidor.
- [ ] Alertas definidos (falha de assinatura, 5xx contínuo, fila de erros, pedido pago sem confirmação).
- [ ] Limite de taxa e fila de entrada para absorver pico.
- [ ] Nenhuma chamada externa **dentro** de transação que segura trava.
- [ ] Conta técnica do serviço com **privilégio mínimo**; endpoints de gestão fora da internet.
- [ ] Testes de regressão do **cálculo** (entrada → saída) para a versão de regra usada.
- [ ] Sem bugs conhecidos; testado em larguras de tela quando houver tela; prévia publicada (Definição de Pronto do `docs/base-po.md`).

### 15.3 Item de segurança dedicado (exemplos de histórias)
- "Como **dono**, quero que as chaves das lojas nunca apareçam para ninguém depois de salvas, para evitar vazamento." Critérios: seção 11.1.
- "Como **analista de cobrança**, quero que o mesmo pagamento Pix nunca seja lançado duas vezes, para não errar o saldo." Critérios: seção 6.2.
- "Como **dono**, quero uma trilha que prove o que o robô fez e que ninguém consiga apagar, para me defender em contestação." Critérios: seção 4.2.

---

## 16. Armadilhas (o que costuma dar errado)

1. **Usar float para dinheiro.** Soma não fecha. [BASE]
2. **Confiar no retorno do navegador ou no corpo do webhook** como prova de pagamento. [BASE: 00715]
3. **Processar webhook sem guardar o id do evento**: pagamento lançado duas vezes na reentrega. [BASE: 00736]
4. **Validar a assinatura depois de converter o JSON**: reformatar muda os bytes e a assinatura quebra (ou passa errado). [BASE: 00736]
5. **Comparar assinatura com `==`**: ataque de tempo. [BASE: 00736]
6. **Ler saldo, calcular no app, gravar**: duas requisições juntas = duas baixas. [BASE: 00433]
7. **Achar que "é rápido o bastante"** para não haver corrida. [BASE: 00433]
8. **Responder 200 antes de gravar o evento**: se cair, o provedor não reenvia e o evento se perde. [BASE: 00736 seção 12]
9. **Assumir ordem dos eventos** (pago antes de criado). [BASE: 00736 seção 14]
10. **Apagar ou editar o histórico** para "corrigir". Perde a prova e quebra a auditoria. [BASE: princípio; seção 4]
11. **Auditoria guardada onde o robô consegue mexer** ou só em log comum. [BASE: 00407]
12. **Segredo em log, em erro, em variável de ambiente, no repositório ou devolvido pela API.** [BASE: 00472; 00573; 00676]
13. **Segredo e chave de cifra no mesmo lugar** (banco). [BASE: 00472]
14. **Sem processo de rotação pronto** quando o vazamento acontece. [BASE: 00472]
15. **Backup nunca testado** ou feito copiando arquivo com o banco rodando. [BASE: MySQL cap. 11]
16. **Conta do app com poderes de dono do banco** (muda esquema, apaga auditoria). [BASE: 00473]
17. **RLS ligado mas app conecta com papel que ignora RLS** (`service_role` no Supabase, superusuário, `BYPASSRLS`). [BASE: 00590; Supabase [NÃO COBERTO]]
18. **Contexto de RLS com `SET` comum** em pool de conexões: vaza para a próxima requisição. Use `SET LOCAL` dentro da transação. [BASE: 00590]
19. **SSRF por redirecionamento ou DNS**: validar o destino e deixar o cliente seguir redirecionamentos. [BASE: 00689; 00736]
20. **Desserializar objeto Java vindo de fora**; ou ligar tipagem polimórfica no Jackson. [BASE: 00481]
21. **Aceitar campo extra no JSON** e gravar na entidade (mass assignment). [BASE: 00581]
22. **IDs sequenciais expostos sem checar dono.** [BASE: 00556]
23. **Mudar esquema "na mão" em produção**; migração que trava tabela grande. [BASE: MySQL p.145; COMPL.]
24. **Índice demais** (gravação lenta) ou **função em cima da coluna** (índice ignorado). [BASE: MySQL cap. 3]
25. **UUID aleatório como chave de tabela muito grande** (inserção espalhada). [BASE: MySQL doc 118]
26. **Chamada externa dentro da transação**: trava presa e fila parada. [COMPL.]
27. **Fila só em memória** (Redis sem persistência, lista simples): tarefa some se o processo cair. [COMPL.; base: Redis persistência p.45]
28. **Média sem mediana nos relatórios**; porcentagem sem o total. [BASE: Wheelan]
29. **Mudar regra de cálculo sobrescrevendo a antiga**: cobrança antiga deixa de ser explicável. [COMPL.]
30. **Seguir o livro de MySQL em tudo**: é de 2008, MySQL, e usa MD5/SHA1 para senha (ultrapassado). [BASE: limites do livro]
31. **Esperar da base o que ela não tem**: Supabase, Pix, boleto, LGPD, conciliação bancária, Spring Data/JPA (só `Injection_Prevention_in_Java`), JavaFX. Marcar **[NÃO COBERTO]** no plano.
32. **Prazo de retenção da auditoria copiado de exemplo americano** (5 anos AML). Definir com o jurídico. [BASE: aviso; decisão do dono]

---

## 17. Não coberto pela base (declarar no plano)

| Tema | Situação | O que fazer |
|---|---|---|
| **Supabase** (projeto, auth, storage, edge functions, Vault, chaves `anon`/`service_role`, PITR, limites do plano) | **0 arquivos** | Consultar a documentação oficial do Supabase. Registrar o que foi verificado e quando. |
| **PostgREST** | 0 documentos (só nomes de arquivos de teste do Spring em `integracoes`) | Idem. Decidir se a API automática ficará desligada (o Spring será a única porta). |
| **PostgreSQL específico** (tipos, `numeric`, `timestamptz`, `ON CONFLICT`, `SKIP LOCKED`, índices parciais, `CONCURRENTLY`, partição, `pg_dump`, WAL/PITR, extensões) | Só menções soltas e o trecho de RLS. As regras gerais valem; os comandos vêm de [COMPL.] | Time técnico confirma na documentação oficial do Postgres. |
| **Row-Level Security no Supabase** | Base tem RLS genérico do Postgres (00590) | Confirmar como o Supabase aplica; testar com papéis reais. |
| **Pix** (txid, id fim a fim, QR, prazos, devolução, conciliação), **boleto**, **Banco Inter**, **WhatsGW** | Não coberto (Asaas: 6 arquivos em outra categoria) | Documentação do provedor. Ver `docs/kb/05-integracoes.md`. |
| **APIs de marketplace** (Shein, Mercado Livre, Shopee, Kwai) | Não coberto | Documentação oficial; limites de taxa e autenticação de cada uma. |
| **Spring** (Data, Security, Transaction, JPA/Hibernate) | Quase nada (Spring Integration em `integracoes`; Bean Validation e injeção em Java em `seguranca`) | Documentação do Spring. |
| **JavaFX** | Quase nada | Fora desta frente. |
| **LGPD** e prazos legais (retenção, direito ao apagamento x auditoria que "nunca apaga") | Não coberto | Consultar jurídico. **Conflito possível**: auditoria imutável x pedido de apagamento de dado pessoal. Decidir antes (ex.: guardar hash/identificador, dado pessoal fora da trilha). |
| **Padrão contábil / fiscal** (nota, retenção de imposto, conciliação) | Não coberto | Contabilidade da empresa. |
| **Texto do livro DDIA** | Só as referências (links) | Livro original ou artigos citados. |
| **Particionamento, replicação, escala do Postgres** | Só conceitos gerais (DDIA refs, Architecture, MySQL cap. 8-9) | Só se o volume exigir. |
| **Observabilidade** (métricas, traces, painéis) | Só log (OWASP) | Ver categoria `devops` (não lida nesta parte). |
| **Outbox, event sourcing, sagas** | `arquitetura-de-software` tem 1 arquivo com "outbox" (`doc_03408`) e muito texto de entrevistas sobre event sourcing; **não li** (fora da minha parte) | Se o time quiser, ler a categoria `arquitetura-de-software`. |
| **Valores de prazos de segurança** (ex.: 5 minutos de janela, 600.000 iterações) | Estão na base como exemplos e valem como ponto de partida | Time técnico confirma contra a versão atual das cheat sheets. |

**O que NÃO foi verificado (para a seção "riscos" do plano):**
- Não rodei nada; só li texto. Nenhuma regra foi testada num banco real.
- Os números de página de documento no Redis e MySQL foram calculados por deslocamento (livro + 24; Redis + 724). Conferi por amostra.
- Cheat sheets citadas só pelo título (Authentication, MFA, OAuth2, JWT, Session, DoS, CI/CD, Docker, Supply Chain, AI) **não foram lidas por inteiro**. As regras tiradas delas são de seus índices ou cabeçalhos.
- Os papers "Eddies", "Dremel", "Raft", etc. foram só catalogados (README), não lidos.
- Ao aplicar ao IT.MK, tudo marcado [COMPL.] é recomendação de método, não afirmação da base.

---

## 18. Como usar este manual para montar um plano (Backend/Database)

Seguir a seção 10 de `docs/base-po.md`. Em cada passo, buscar aqui:
1. **Visão e meta**: ex. "Ter uma base de dados em que nenhum pagamento é lançado duas vezes e toda ação do robô pode ser provada, até <data>". Meta mensurável: **0 duplicidades** em teste de concorrência; **100% das ações do robô** com evento de auditoria; **restauração testada** a cada mês.
2. **Quem decide o quê**: regras de cálculo, retenção da auditoria, tratamento de pagamento a maior/menor, quem aprova acordo, objetivo de perda do backup → **dono** (itens "decisão do dono" acima).
3. **Valor**: confiabilidade (cobrança certa), segurança (segredo protegido), defesa (prova do robô). Medir: duplicidades, falhas de assinatura detectadas, tempo de restauração, ações sem evento.
4. **Roadmap sugerido (ordem por dependência e risco)** [COMPL.]:
   - V1: modelo base (pagador, loja, conexão e segredo, base de faturamento), contas do banco, migrações, backup e teste de restauração.
   - V2: cobrança com máquina de estados, regra de cálculo versionada, auditoria append-only com hash.
   - V3: pagamento Pix com webhook, idempotência e fila; contestação e acordo.
   - V4: robô com auditoria completa, falha fechada, relatórios (aging, recuperação).
5. **Épicos e histórias**: usar os exemplos da seção 15.3.
6. **Critérios de aceite**: copiar da seção 15 (só o que se aplica).
7. **Prioridade**: **deve** (MoSCoW) = segredo protegido, idempotência de pagamento, auditoria append-only, backup testado. **Deveria** = corrente de hash, tabelas-resumo. **Poderia** = partição, cofre externo.
8. **Definição de Pronto**: sem bugs conhecidos + testes de concorrência e de segurança da seção 15 rodando + prévia publicada (para tela).
9. **Riscos**: seção 17 (lacunas) e armadilhas (seção 16). Lembrar: **melhoria pedida depois vira item novo**.
10. **Acompanhamento**: fonte única da verdade = o backlog; indicadores = duplicidades (alvo 0), ações do robô sem evento (alvo 0), restaurações testadas por mês, falhas de assinatura por dia.

---

## 19. Tabela de fontes (caminhos)

Base: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`

### 19.1 `backend`
| Material | Caminho |
|---|---|
| DDIA referências cap. 1 a 12 | `backend/documentos/backend__doc_00001.md` ... `backend__doc_00012.md` |
| Cartaz DDIA (imagem e PDF) | `backend/documentos/backend__doc_00013.md`, `backend__doc_00014.md` |
| README | `backend/documentos/backend__doc_00015.md` |
| Cap. 4 (formatos, desserialização, versionamento de API) | `backend__doc_00004.md` |
| Cap. 7 (transações) | `backend__doc_00007.md` |
| Cap. 11 (fluxos, filas, event sourcing, imutabilidade) | `backend__doc_00011.md` |
| Cap. 12 (ponta a ponta, sagas, migração online) | `backend__doc_00012.md` |

### 19.2 `database` (1 documento por página)
Pasta: `database/documentos/database__doc_NNNNN.md`
| Paper | Documentos |
|---|---|
| 5-minute rule | 00001-00007 |
| AlphaSort | 00008-00037 |
| **ARIES** | 00038-00106 |
| Bigtable | 00107-00120 |
| B-tree (travas) | 00121-00141 |
| **CAP Twelve Years Later** | 00142-00153 |
| Chord | 00154-00165 |
| Cloud Computing | 00166-00174 |
| **Codd (modelo relacional)** | 00175-00185 |
| Column vs Row | 00186-00199 |
| C-Store | 00200-00211 |
| Datacenter as a Computer | 00212-00367 |
| Dremel | 00368-00377 |
| **Dynamo** | 00378-00393 |
| Eddies | 00394-00405 |
| **Architecture of a Database System** | 00406-00524 (ACID 00485; isolamento 00490-00492; log/WAL 00493-00494; locking em índices 00498-00499; replicação 00511-00512; backup/utilitários 00513-00514) |
| GFS | 00525-00539 |
| What Goes Around Comes Around | 00540-00579 |
| MapReduce | 00580-00592 |
| **OCC (controle otimista)** | 00593-00606 |
| PatSort | 00607-00618 |
| Paxos | 00619-00632 |
| Raft | 00633-00650 |
| R*-tree | 00651-00660 |
| Shark | 00661-00672 |
| Spark | 00673-00686 |
| System R (optimizer) | 00687-00698 |
| System R (história) | 00699-00713 |
| Reflections on Trusting Trust | 00714-00716 |
| Variant Index | 00717-00728 |
| Vertica 7 anos | 00729-00740 |
| README (lista comentada) | 00741 |

### 19.3 `bancos-de-dados` (1 documento por página)
Pasta: `bancos-de-dados/documentos/bancos-de-dados__doc_NNNNN.md`
| Material | Documentos |
|---|---|
| High Performance MySQL, sumário | 00007-00011 |
| Cap. 1 Arquitetura (travas, transações, isolamento, deadlock, MVCC) | 00025-00055 (transações 00030-00036) |
| Cap. 3 Esquema e índices (tipos 00104-00119; índices 00119-00160; normalização 00163-00168; ALTER TABLE 00169-00173) | 00104-00175 |
| Cap. 5 (FK 00276; XA 00286) | 00228-00288 |
| Cap. 8 Replicação | ~00367-00430 |
| Cap. 11 Backup e recuperação (considerações 00501-00509; fazendo backup 00512-00521; restaurando 00523-00533) | 00497-00544 |
| Cap. 12 Segurança (contas 00546-00563; criptografia 00574-00577) | 00545-00578 |
| Redis Cookbook, sumário | 00718 |
| Redis: OAuth/nonces com EXPIRE | 00746-00750 |
| Redis: MULTI/EXEC | 00756-00757 |
| Redis: fila de tarefas | 00763-00768 |
| Redis: persistência (RDB/AOF) | 00769-00772 |

### 19.4 `seguranca` (pasta `seguranca/documentos/seguranca__doc_NNNNN.md`)
| Cheat sheet | Doc |
|---|---|
| Webhook Security Guidelines | 00736 |
| Third-Party Payment Gateway Integration | 00715 |
| Business Logic Security | 00433 |
| Secrets Management | 00676 |
| Cryptographic Storage | 00472 |
| Key Management | 00562 |
| Server-Side Request Forgery Prevention | 00689 |
| Deserialization (texto) / PDF da palestra | 00481 / 00001-00051 |
| REST Security | 00672 |
| Logging / Logging Vocabulary | 00573 / 00576 |
| Input Validation | 00555 |
| Authorization / Authentication / Access Control (stub) | 00412 / 00410 / 00403 |
| IDOR / Mass Assignment | 00556 / 00581 |
| SQL Injection / Query Parameterization / Injection Prevention in Java / Bean Validation | 00708 / 00662 / 00554 / 00426 |
| Database Security | 00473 |
| Multi-Tenant (inclui RLS) | 00590 |
| AML/Sanctions AI Agent Payments (trilha com hash) | 00407 |
| Transaction Authorization | 00724 |
| Password Storage / JWT / Session / MFA / OAuth2 | 00641 / 00559 / 00700 / 00591 / 00629 |
| DoS / Error Handling / File Upload | 00477 / 00502 / 00506 |
| Threat Modeling / Attack Surface / Abuse Case | 00716 / 00409 / 00400 |
| OWASP Top 10 / ASVS / Proactive Controls (índices) | 00551 / 00547 / 00550 |
| TLS / CI-CD / Docker / Supply Chain / Vulnerable Dependency / SBOM | 00726 / 00453 / 00484 / 00707 / 00733 / 00480 |
| User Privacy / Zero Trust / Microservices Security / Web Service Security | 00730 / 00750 / 00586 / 00735 |
| AI Agent / LLM Prompt Injection / Secure Coding with AI / MCP | 00405 / 00571 / 00686 / 00582 |

### 19.5 `data-science` (`data-science/documentos/data-science__doc_NNNNN.md`)
| Material | Documentos |
|---|---|
| Estatística (Wheelan), sumário | 00004-00005 |
| Cap. 2 Estatística descritiva (média x mediana: ~00030-00033) | ~00027-00046 |
| Cap. 3 Descrição enganosa (precisão x acurácia: 00048) | ~00047-00067 |
| Cap. 7 "Entra lixo, sai lixo" (amostra e viés: 00118-00119) | 00116-~00140 |
| Mining the Social Web (sem uso) | 00287-00642 |

### 19.6 Arquivos do projeto citados
- `/home/user/MK/CLAUDE.md` (regras do projeto)
- `/home/user/MK/docs/base-po.md` (modelo de plano, seção 10)
- `/home/user/MK/docs/kb-mapa.md` (mapa da base e lacunas)
- `/home/user/MK/docs/kb/01-po-produto.md`, `05-integracoes.md` (manuais irmãos)

### 19.7 Como achar mais
- Busca por assunto: `grep -rli "termo" /home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/seguranca/documentos`
- Para `bancos-de-dados` (sem espaços no texto): buscar por palavra curta única (`DECIMAL`, `FLUSH`, `START TRANSACTION`).
- Para `data-science`: `tr '\t' ' ' < arquivo | grep ...`
