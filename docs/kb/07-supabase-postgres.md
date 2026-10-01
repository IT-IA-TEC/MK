# Manual 07: Supabase + PostgreSQL (banco do IT.MK)

Consulta feita em 01/10/2026 nas páginas oficiais (supabase.com/docs, supabase.com/pricing e postgresql.org/docs, versão 18.6). Escrito em português simples para o P.O. A base de conhecimento do repositório NÃO tem Supabase (ver `docs/kb-mapa.md`), por isso tudo aqui vem da fonte oficial.

Legenda: **[confirmado]** = li na página oficial. **[não confirmado]** = não consegui ver na fonte oficial; é conhecimento geral e precisa ser conferido antes de virar regra. Preços e limites mudam: sempre rever na página no dia da decisão.

Como ler: cada tema tem um resumo curto, depois as regras. No fim: checklist de aceite, armadilhas, decisões do dono e tabela de fontes.

---

## 1. Resumo em 10 linhas

1. Supabase é um Postgres gerenciado, com extras (login, arquivos, funções, tempo real). O IT.MK usa principalmente o Postgres.
2. Dinheiro sempre em `numeric`, nunca em número com vírgula flutuante.
3. Segredos de marketplace ficam no Vault (cofre do Supabase), só de gravação para as telas.
4. Auditoria nunca apaga: tabela só de inserção, com bloqueio por gatilho (trigger), permissões retiradas e RLS.
5. A chave `secret` (antiga `service_role`) pula todas as regras de linha: nunca vai para o computador do usuário.
6. O app Java (JavaFX) conecta por JDBC. Em rede só IPv4, usar o pooler em modo sessão.
7. Toda mudança de tabela vira arquivo de migração versionado no git.
8. Backup diário só nos planos pagos. Para recuperar até o segundo, precisa do PITR (opcional pago).
9. Teste e produção devem ser projetos ou branches separados, nunca o mesmo banco.
10. Rodar os "advisors" (verificadores de segurança) antes de cada entrega.

---

## 2. Projetos e ambientes (teste, produção, branches)

### O que a doc diz
- **Branch** do Supabase é um ambiente isolado que sai do projeto principal. Cada branch tem "sua própria instância Supabase e suas próprias credenciais de API". [confirmado]
- **Preview branch**: temporária, some quando o pull request é fechado ou aceito. **Persistent branch**: fica de pé, serve para staging/QA/desenvolvimento. [confirmado]
- Branch novo nasce **sem os dados de produção** (protege dados sensíveis). Para dados de teste: arquivo de seed (integração GitHub) ou opção "Include data" no painel. [confirmado]
- Ao juntar (merge) um branch na principal, o Supabase roda: checagens de saúde, configuração, migrações de banco e deploy das Edge Functions. [confirmado]
- Dá para usar branching a partir do GitHub em qualquer plano. [confirmado] Custo: um preview branch com computação Micro padrão custa US$ 0,01344 por hora, sem taxa fixa; o uso entra na cota do plano; computação de branch não entra em créditos de computação. [confirmado]
- Plano gratuito pausa projetos após 1 semana sem uso; planos pagos nunca pausam. [confirmado] Isso importa: **produção nunca no plano gratuito**.

### Regras para o IT.MK
- R1. Produção e teste são ambientes separados (dois projetos, ou um projeto + branch persistente de teste). Chaves e senhas diferentes em cada um.
- R2. Nunca copiar dado real de pagador (CPF/CNPJ, e-mail, telefone) para teste. Usar seed com dados fictícios.
- R3. Mudança de banco só entra em produção por migração (seção 5), nunca editando no painel.
- R4. O link de conexão de cada ambiente fica em variável de ambiente do app, nunca no código.
- R5. Dia de entrega: seguir `base-po.md` (nada na sexta-feira), vale também para migração em produção.

Não confirmado: se branching exige plano pago na prática (a página de custo não cita requisito de plano). Conferir na tela do projeto.

---

## 3. Conexão a partir de Java (JDBC), pooler, IPv4/IPv6, limites

### O que a doc diz [confirmado]
| Forma | Endereço (modelo) | Quando usar |
|---|---|---|
| Direta | `db.[REF-DO-PROJETO].supabase.co:5432` | Servidor que fica ligado (VM, contêiner). IPv6 por padrão; IPv4 só com add-on pago |
| Pooler compartilhado, modo sessão | `aws-[N]-[REGIAO].pooler.supabase.com:5432` | Rede só IPv4, ou alternativa à direta |
| Pooler compartilhado, modo transação | `aws-[N]-[REGIAO].pooler.supabase.com:6543` | Funções serverless com muitas conexões curtas |
| Pooler dedicado (planos pagos) | `db.[REF].supabase.co:6543` | Mais rápido, roda junto do banco |

- Pooler compartilhado é só IPv4 em todos os planos. Direta e pooler dedicado são IPv6 por padrão. [confirmado]
- Modo transação **não suporta prepared statements**. Para JDBC a doc manda usar `prepareThreshold=0`. [confirmado]
- Em ambiente serverless, deixar o pool da aplicação com 1 conexão. [confirmado]
- Pgjdbc: porta padrão 5432; `sslmode` aceita disable, allow, prefer (padrão), require, verify-ca, verify-full; `prepareThreshold` padrão 5; `connectTimeout` padrão 10 s; `socketTimeout` padrão 0 (sem limite). Caracteres especiais na senha devem ser codificados na URL (percent-encoding). [confirmado, jdbc.postgresql.org]
- Limites por tamanho de computação (conexões diretas / conexões do pooler) [confirmado, página compute-and-disk]: Nano e Micro 60 / 200; Small 90 / 400; Medium 120 / 600; Large 160 / 800; XL 240 / 1.000; 2XL 380 / 1.500. (Tamanhos maiores existem; ver a página.)
- Guia de uso do pool: se usa muito a API REST (PostgREST), deixar o pool da aplicação em até 40% das conexões máximas; sem PostgREST, até 80%. [confirmado]
- Monitorar conexões com a visão `pg_stat_activity`. [confirmado]

### Regras para o IT.MK
- R6. App JavaFX/Spring de escritório ou servidor com IPv4 apenas: usar **pooler modo sessão (porta 5432 do pooler)**. Funciona com prepared statements.
- R7. Só usar o modo transação (6543) se for necessário; nesse caso, `prepareThreshold=0` na URL JDBC.
- R8. Usar `sslmode=require` no mínimo (`verify-full` se a empresa conseguir instalar o certificado). Nome exato do certificado raiz: não confirmado.
- R9. Pool do Spring (ex.: HikariCP) com tamanho pequeno e fixo. Valor exato recomendado para o HikariCP: não confirmado na doc do Supabase; começar com 5 a 10 e medir.
- R10. Cada app JavaFX no computador do analista NÃO deve abrir conexão direta ao banco com a senha mestre. O desenho seguro é: JavaFX fala com o servidor Spring; só o Spring fala com o banco. (Decisão de arquitetura; ver seção 17.)
- R11. Nome de usuário no pooler tem formato diferente do da conexão direta (inclui o código do projeto). Formato exato: não confirmado nas páginas lidas; copiar da tela "Connect" do painel.

Exemplo de URL (modelo, valores entre colchetes são do painel):
```
jdbc:postgresql://aws-0-[REGIAO].pooler.supabase.com:5432/postgres?sslmode=require
```

---

## 4. Papéis (roles) e senhas
- Papéis padrão [confirmado]: `postgres` (admin), `anon` (sem login), `authenticator` (troca de papel conforme o token), `authenticated` (com login), `service_role` (pula RLS), `supabase_auth_admin`, `supabase_storage_admin`, `supabase_admin` (interno).
- Criar papel próprio: `create role "nome" with login password '...';`. Senha forte (mínimo 12 caracteres, doc). [confirmado]
- Trocar a senha do `postgres` no painel não derruba o serviço. [confirmado]

Regras:
- R12. Criar um papel só para o servidor do IT.MK (ex.: `itmk_app`) com permissões mínimas, em vez de usar `postgres`. Outro papel só leitura para relatórios.
- R13. Senhas só em cofre de senhas/variável de ambiente.

---

## 5. Esquemas e migrações (CLI, versionamento)

### O que a doc diz [confirmado]
Comandos da CLI `supabase`:
```
supabase migration new criar_tabela_cobranca   # cria arquivo vazio em supabase/migrations
supabase migration up                          # aplica no banco local
supabase db reset                              # recria o local com todas as migrações + seed
supabase db diff -f nome                       # gera migração a partir de mudança feita no painel
supabase db pull                               # traz mudanças do remoto como migração
supabase migration list                        # compara local x remoto
supabase migration repair --status applied|reverted <carimbo>
supabase login
supabase link
supabase db push                               # envia migrações para produção
supabase db push --include-seed
```
- Arquivos de migração são aplicados **na ordem do carimbo de data/hora**. Só uma pessoa deve rodar `db push` por vez. [confirmado]
- Fluxo em equipe: criar e testar local, `git add supabase/migrations`, commit, `git pull`, `supabase db reset`. [confirmado]

### Regras para o IT.MK
- R14. Pasta `supabase/migrations` vai no git. É a única forma de mudar tabela em produção.
- R15. Nome da migração diz o que faz (ex.: `criar_tabela_cobranca`). Uma mudança por arquivo.
- R16. Migração já aplicada em produção **nunca é editada**; correção vira migração nova (mesma lógica de "melhoria vira item novo" do `base-po.md`).
- R17. Antes de `db push`: rodar `supabase db reset` local e os testes.
- R18. Mudança destrutiva (apagar coluna, mudar tipo) exige backup recente e aprovação do dono (seção 17).
- R19. Dados de exemplo ficam em `supabase/seed.sql` e só com dados fictícios.
- Não confirmado: o nome exato do arquivo de configuração e organização de pastas para vários esquemas; ver doc local-development.

---

## 6. Auth (login e usuários)

### O que a doc diz [confirmado]
- Auth usa JWT (token assinado) e se liga ao RLS para controlar linhas. Os usuários ficam em esquema especial (`auth.users`); dá para ligar a tabelas próprias por chave estrangeira e triggers.
- Suporta login social, MFA (TOTP ou telefone) e SSO empresarial (SAML 2.0). Complementos de MFA por telefone têm cobrança à parte.
- Pacotes de servidor citados: supabase-js, @supabase/ssr, @supabase/server (todos JavaScript).

### Pontos para o IT.MK
- O sistema tem "usuários com permissões" mas, pela regra de visão única do `CLAUDE.md`, **as telas não têm perfis**. Então não criar tabela de "perfil" que mude o que a tela mostra. Permissão aqui significa "quem pode gravar/mudar o quê" nos bastidores.
- R20. Decidir (seção 17) se o login do IT.MK usa o Auth do Supabase ou login próprio no Spring. Se usar o Auth, o Java recebe o JWT e o servidor valida. Biblioteca Java oficial para Auth: não confirmado (os pacotes citados são JS).
- R21. Nunca confiar em dados que o próprio usuário pode editar (`user_metadata`) dentro de política. O advisor `0015_rls_references_user_metadata` avisa disso. [confirmado]

---

## 7. RLS, policies, grants e papéis anon/authenticated/service_role

### O que a doc diz [confirmado]
- Policy funciona como um `WHERE` automático. Exemplo oficial:
  `create policy "..." on todos for select to authenticated using ( (select auth.uid()) = user_id );`
- Três papéis: `anon` (sem login), `authenticated` (com login), `service_role` (backend, com `bypassrls`).
- **Grants e policies são duas camadas**: o grant decide se o papel pode executar a operação; a policy decide quais linhas. Sem grant, dá erro `42501` antes de olhar a policy.
- Por padrão, tabelas novas em `public` recebem SELECT/INSERT/UPDATE/DELETE para `anon`, `authenticated` e `service_role`. O Supabase está **mudando o padrão** para que a exposição seja opcional (opt-in). Enquanto isso, a doc manda revogar:
```sql
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;
```
- Recomenda esquema dedicado para a API (ex.: `api`), mantendo tabelas internas em outro esquema. Se o app nunca usa REST/GraphQL, dá para **desligar a Data API** no painel: nenhum endpoint responde, "independentemente de grants ou RLS". [confirmado]
- Postgres puro [confirmado]: com RLS ligado e nenhuma policy, nega tudo. Superusuário e papel com `BYPASSRLS` sempre pulam RLS. Dono da tabela pula, a não ser que se use `ALTER TABLE ... FORCE ROW LEVEL SECURITY`. `USING` filtra linhas visíveis/alteráveis; `WITH CHECK` controla o que pode ser criado/alterado. Policies permissivas somam por OR; restritivas por AND. Checagens de chave estrangeira/única ignoram RLS.
- Desempenho: indexar colunas usadas nas policies e escrever `(select auth.uid())` entre parênteses. [confirmado]

### Regras para o IT.MK
- R22. Como o app Java conecta pelo servidor, o caminho mais seguro é **desligar a Data API** (ninguém acessa o banco pela internet pela API REST) e ainda assim deixar RLS ligado em todas as tabelas (defesa em profundidade).
- R23. Toda tabela nova: `enable row level security` + revogar tudo de `anon` e `authenticated` + conceder só o necessário.
- R24. Tabela com segredo, auditoria e pagamentos: **nenhum** grant para `anon`.
- R25. Nunca usar policy `using (true)` em tabela de dados; o advisor `0024_permissive_rls_policy` marca isso. [confirmado]
- R26. Funções expostas ao público: revogar `execute` (a doc manda revogar o padrão).

---

## 8. Chaves de API (publishable e secret)

### O que a doc diz [confirmado]
| Tipo | Formato | Uso |
|---|---|---|
| Publishable | `sb_publishable_...` | Cliente (navegador, celular, CLI). Pode ficar visível. Respeita RLS. Mapeia para `anon` ou `authenticated` |
| Secret | `sb_secret_...` | Só backend (servidor, Edge Functions). **Pula RLS** via `service_role` |
| Legada `anon` | JWT (começa com `eyJ`) | Substituta antiga da publishable. **Descontinuada** |
| Legada `service_role` | JWT | Substituta antiga da secret. **Descontinuada** |

- O Supabase diz que vai descontinuar `anon` e `service_role` "até o fim de 2026". Os dois sistemas funcionam juntos hoje; criar chave nova não revoga as antigas. [confirmado]
- Chave nova é string curta, não JWT. Se um tutorial manda copiar chave longa começando com `eyJ`, ele é para as chaves legadas. [confirmado]
- Chave secret nunca vai em navegador, documento público, git, pacote de app móvel, chat ou e-mail. Usar chave secret **separada por componente** do backend. [confirmado]
- Vazou? Gerar nova no painel, trocar nos apps, conferir, apagar a vazada (apagar secret é irreversível). [confirmado]
- Edge Functions: dá para aceitar só uma chave secret pelo nome (`auth: 'secret:nome'`), nomeada em Settings > API keys. [confirmado]

### Regras para o IT.MK
- R27. Usar só chaves novas (`sb_publishable_`/`sb_secret_`). Planejar a saída das legadas antes do fim de 2026.
- R28. A chave secret fica só no servidor Spring (variável de ambiente). **Nunca dentro do app JavaFX instalado no computador do analista** (quem tem o app tem a chave).
- R29. Uma chave secret por componente (servidor de cobrança, robô, webhook), para poder revogar uma sem derrubar as outras.
- R30. Se o Java conecta por JDBC com a senha do banco, não precisa de chave de API para dados; as chaves só importam para Auth, Storage, Edge Functions e Realtime.

---

## 9. Storage (arquivos)

### O que a doc diz [confirmado]
- Controle por RLS e policies nos arquivos. Tipos de bucket: arquivos, analytics (Iceberg), vetores. Compatível com S3, API REST e uploads retomáveis (TUS). Backups do banco **não incluem** objetos do Storage; arquivo apagado depois do backup não volta. [confirmado, página de backups]
- Limite de tamanho de arquivo e distinção público/privado: não confirmado nas páginas lidas.

Regras:
- R31. Comprovantes de pagamento, boletos e contratos de acordo: bucket **privado**. Acesso por link temporário. (Link temporário: recurso conhecido, não confirmado nesta consulta.)
- R32. Como backup não cobre Storage, definir cópia própria dos comprovantes (decisão do dono).
- R33. No banco, guardar só o caminho do arquivo e um hash, nunca o arquivo em coluna.

---

## 10. Edge Functions e webhooks de entrada

### O que a doc diz [confirmado]
- Funções em TypeScript no runtime Deno, rodando perto do usuário. Deploy por painel, CLI ou MCP. Segredos ficam em "project secrets" e são lidos como variáveis de ambiente.
- Recomendadas para receber webhooks (Stripe, GitHub). "Cold starts são possíveis: projete operações curtas e idempotentes." Trabalho longo deve ir para worker de fundo. Conexão ao banco deve usar pooler ou driver adequado.
- JWT é verificado por padrão (`verify_jwt = true`). Para webhook externo, que não tem token do Supabase, desliga-se (`verify_jwt = false` em `config.toml`, ou `--no-verify-jwt` no deploy) e **verifica-se a assinatura do remetente**. [confirmado]
- Limites [confirmado, página limits]: memória 256 MB; tempo de relógio 150 s no gratuito e 400 s nos pagos; CPU 2 s por requisição (sem contar espera de I/O); ociosidade 150 s (depois 504); tamanho da função 20 MB (empacotamento local) ou 5 MB (no servidor); funções por projeto: 100 gratuito, 1.000 Pro, 2.000 Team; segredos: até 100 por projeto, 48 KiB cada; portas 25 e 587 bloqueadas.
- Franquia: 500.000 invocações no gratuito, 2 milhões em Pro/Team (excedente US$ 2 por milhão). [confirmado]

### Webhooks de banco (saída)
- "Database Webhooks" são um atalho de trigger + `pg_net`, assíncronos, só HTTP POST/GET com JSON, histórico em esquema `net`. [confirmado]

### Regras para o IT.MK (Pix, marketplaces, WhatsApp)
- R34. Todo webhook de entrada (aviso de Pix pago, evento de marketplace) tem 4 passos: (1) conferir assinatura/segredo do remetente; (2) gravar o evento cru numa tabela de eventos com `ON CONFLICT DO NOTHING` pela identificação única do evento; (3) responder 200 rápido; (4) processar depois (idempotente).
- R35. Nunca confiar só em "quem chamou" pelo endereço de internet. Sem assinatura válida, responder erro e registrar.
- R36. Como o IT.MK tem servidor Spring, o receptor de webhook pode ser o próprio Spring em vez de Edge Function. Decisão de arquitetura (seção 17).
- Não confirmado: formato exato de assinatura dos provedores (Banco Inter, Asaas etc.); isso é da doc de cada um (ver manual de integrações).

---

## 11. Realtime

### O que a doc diz [confirmado]
- Três recursos: **Broadcast** (mensagens de baixa latência), **Presence** (quem está online), **Postgres Changes** (escuta mudanças em tabela).
- Limites por plano (página realtime/limits), exemplos: conexões simultâneas 200 (gratuito), 500 (Pro), 10.000 (Pro sem teto de gasto e Team); mensagens por segundo 100 / 500 / 2.500; tamanho de payload de Postgres Changes 1.024 KB.
- Como autorizar Realtime com RLS e quando preferir Broadcast em vez de Postgres Changes: **não confirmado** (a página geral não traz).

Regras:
- R37. Uso previsto: atualizar a fila de cobrança e contadores na tela sem recarregar. Não é obrigatório; o JavaFX pode também consultar a cada N segundos. Decisão do dono (seção 17).
- R38. Se usar, nunca enviar segredo, CPF completo ou chave Pix inteira pelo canal.

---

## 12. pg_cron, pg_net e o robô de cobrança

### O que a doc diz [confirmado]
- Cron do Supabase usa `pg_cron`; cria esquema `cron` com `cron.job` e `cron.job_run_details`. Roda de "a cada segundo" até "uma vez por ano". Executa SQL, funções ou chamadas HTTP (ex.: Edge Function).
- Recomendação: **no máximo 8 jobs ao mesmo tempo, cada um com no máximo 10 minutos.**
- `pg_net`: HTTP assíncrono dentro do SQL (`net.http_get/post/delete`); a requisição só começa **depois do commit**; respostas guardadas por 6 horas em `net._http_response`; no máximo 200 requisições por segundo; só corpo JSON no POST; sem PUT/PATCH; tabelas "unlogged" (podem perder dados em queda). [confirmado]

### Regras para o IT.MK
- R39. O robô de cobrança pode ser (a) tarefa agendada no Spring ou (b) pg_cron chamando função SQL. Em ambos: a rodada é **idempotente** (rodar duas vezes não cobra duas vezes) e registra cada ação na tabela de auditoria.
- R40. Para evitar duas rodadas ao mesmo tempo: bloqueio consultivo (`pg_try_advisory_xact_lock`) no início da rodada (seção 15).
- R41. Histórico de `cron.job_run_details` cresce; definir limpeza. Prazo de retenção sugerido: não confirmado na doc; decisão do dono.
- R42. Não depender de `pg_net` para envio crítico (cobrança por WhatsApp): resposta some em 6 h e tabelas são unlogged. Usar fila própria em tabela com tentativas.

---

## 13. Extensões: pgcrypto, Vault, pgsodium

### O que a doc diz
- Ativar extensão: `create extension nome with schema extensions;` (equivale a ligar no painel). O Supabase vem com "mais de 50 extensões". [confirmado]
- **pgsodium: o Supabase NÃO recomenda e vai descontinuar.** Também não recomenda a "Transparent Column Encryption", por complexidade e risco de erro. Recomendação: usar **Vault**, que é independente do pgsodium. Todo projeto já tem criptografia em repouso por padrão (pode bastar para SOC2/HIPAA). [confirmado]
- **Vault** [confirmado]: guarda segredos criptografados no banco. `vault.create_secret('valor', 'nome_unico', 'descricao')` devolve um UUID. Leitura pela visão `vault.decrypted_secrets` (decifra na hora, sem plaintext em disco). `vault.update_secret(uuid, novo, nome, descricao)`. Criptografia AEAD baseada em libsodium; **a chave de criptografia nunca fica no banco**, o Supabase a guarda à parte. Quem tem acesso à visão `decrypted_secrets` lê tudo, então restringir. Ao migrar com `pg_dump`/`pg_restore`, o projeto novo tem outra chave e **não decifra** os segredos antigos sem copiar a chave raiz.
- **pgcrypto** (doc Postgres 18) [confirmado]: `digest()`, `hmac()`, `crypt()`/`gen_salt()` (senha), `pgp_sym_encrypt/decrypt`, `gen_random_bytes()`, `gen_random_uuid()`. Avisos: dados e senhas trafegam em texto claro entre cliente e função (usar SSL); nunca deixar chaves nos logs de consulta; funções devolvem NULL se qualquer argumento for NULL. A página do Supabase específica de pgcrypto não abriu (404): ativação no Supabase é pelo comando acima [não confirmado numa página própria].

### Regras para o IT.MK
- R43. Segredos de conexão de marketplace (tokens, client secret, refresh token): **Vault**, nunca coluna comum, nunca pgcrypto com chave guardada no próprio banco.
- R44. "Só gravação": nenhuma tela, nenhum papel de aplicação e nenhuma API devolve o valor. A tela só mostra "segredo cadastrado em dd/mm/aaaa" e o botão "substituir".
- R45. Quem lê `vault.decrypted_secrets`: somente uma função do servidor do robô/integração, com papel dedicado. Revogar de todos os outros.
- R46. Antes de qualquer migração de projeto: plano para a chave do Vault (ver aviso acima). Procedimento exato: não confirmado; abrir chamado ao suporte antes.
- R47. Não usar pgsodium em coisa nova.
- R48. Para identificar "sem expor", usar hash (`hmac`) ou os últimos 4 caracteres, guardados à parte.

---

## 14. Backups e restauração (PITR)

### O que a doc diz [confirmado, página platform/backups e pricing]
- Backup diário automático nos planos Pro (guarda 7 dias), Team (14 dias) e Enterprise (até 30 dias). **Plano gratuito não tem**: exportar à mão com a CLI.
- **PITR** (restaurar para um ponto no tempo, "com granularidade de segundos") é um add-on que exige pelo menos computação Small; disponível em Pro, Team e Enterprise. Arquivamento de WAL a cada 2 minutos por padrão (pior caso de perda: 2 minutos). Preço do add-on na página: retenção de 7 dias, ~US$ 100/mês; 14 dias, ~US$ 200/mês; 28 dias, ~US$ 400/mês. Usa WAL-G.
- Durante a restauração o projeto fica **indisponível**; o tempo cresce com o tamanho do banco. Senhas de papéis personalizados **não** entram no backup diário. Objetos do Storage não entram.

### Regras para o IT.MK
- R49. Produção em plano pago com backup diário, no mínimo. PITR é recomendado porque o sistema registra pagamentos: perder 1 dia de pagamentos é grave. Valor/prazo = decisão do dono.
- R50. Fazer **ensaio de restauração** a cada trimestre e anotar o tempo gasto (a doc não dá tempo fixo).
- R51. Depois de restaurar: reconferir senhas de papéis personalizados, segredos do Vault e chaves.
- R52. Exportação lógica extra (`pg_dump`) semanal guardada fora do Supabase. Comando e opções: não confirmado nesta consulta.

---

## 15. Limites e preços por plano (consulta de 01/10/2026)

Valores da página supabase.com/pricing e da página de cobrança [confirmado]. Não inventamos nada além disso; câmbio e impostos não calculados.

| Item | Free | Pro | Team |
|---|---|---|---|
| Preço | US$ 0/mês | a partir de US$ 25/mês | a partir de US$ 599/mês |
| Disco do banco | 500 MB | 8 GB por projeto (excedente US$ 0,125/GB) | 8 GB por projeto |
| Egress (saída de dados) | 5 GB | 250 GB (excedente US$ 0,09/GB) | 250 GB |
| Storage | 1 GB | 100 GB (excedente US$ 0,021/GB) | 100 GB |
| Usuários ativos/mês (Auth) | 50.000 | 100.000 | 100.000 |
| Edge Functions | 500.000 | 2 milhões | 2 milhões |
| Realtime (conexões de pico) | 200 | 500 | 500 |
| Backups | não incluído | diários, 7 dias | diários, 14 dias |
| Pausa por inatividade | após 1 semana | nunca | nunca |
| Suporte | comunidade | e-mail | e-mail prioritário + SLAs |

- Computação pode crescer até 64 vCPUs e 256 GB de RAM (add-on). Preço por tamanho de computação, valor do "spend cap" e regras de teto de gasto: não confirmado nas páginas lidas.
- Disco: depois de mudar o disco há espera de cerca de 4 horas para nova alteração. [confirmado]
- Plano Enterprise: valores "personalizados". [confirmado]

Regras:
- R53. Plano mínimo para produção do IT.MK: Pro (backup diário e sem pausa). Escolha final = dono.
- R54. Acompanhar uso mensal (disco, egress) e ter alerta antes de estourar a cota.

---

## 16. Observabilidade e advisors de segurança

### O que a doc diz [confirmado]
- **Advisors**: verificações automáticas de segurança e desempenho. Acesso: painel (Studio), MCP (`get_advisors`), CLI (`supabase db advisors`) e API de gestão.
- Itens importantes: `0013_rls_disabled_in_public` (tabela pública sem RLS), `0008_rls_enabled_no_policy`, `0007_policy_exists_rls_disabled`, `0024_permissive_rls_policy` (policy `using (true)`), `0023_sensitive_columns_exposed`, `0002_auth_users_exposed`, `0015_rls_references_user_metadata`; desempenho: `0001_unindexed_foreign_keys`, `0003_auth_rls_initplan`, `0020_table_bloat`.
- Fluxo: ler achados, priorizar erros e avisos, conferir se bate com o desenho, aplicar a correção, rodar de novo.
- **Logs**: API, Postgres, Auth, Storage, PostgREST, Edge Function, Realtime e pooler. Retenção depende do plano (prazos exatos: não confirmado). Há "log drains" para exportar. Consultas SQL de logs pelo Explorer/API/MCP.
- `pg_stat_statements` já vem instalado em todo projeto. Index Advisor sugere índices, mas pode sugerir índice que não será usado. [confirmado]
- pgaudit: não aparece nas páginas lidas; disponibilidade: não confirmado.

Regras:
- R55. **Antes de cada entrega ao dono**: rodar advisors de segurança e desempenho e anexar o resultado ao item. Nenhum erro de segurança aberto.
- R56. Alerta/monitoramento das tabelas `cron.job_run_details` e de falhas do robô.

---

## 17. PostgreSQL: modelagem para o IT.MK

### 17.1 Dinheiro: `numeric` [confirmado]
- `numeric` faz conta exata em soma, subtração e multiplicação (mais lenta que inteiro/ponto flutuante). `real` e `double precision` são inexatos e a doc manda usar `numeric` para valores monetários.
- Arredondamento: `numeric` arredonda empate para longe do zero (2,5 vira 3); `double precision` arredonda para o par (2,5 vira 2).
- `numeric(precisão, escala)`: ex.: `numeric(14,2)` = até 12 dígitos antes e 2 depois da vírgula.
- Não usar o tipo `money`: a página lida não o cobre; motivo geral (depende de configuração regional): não confirmado nesta consulta.

Regras:
- R57. Todo valor em R$ é `numeric(14,2)` (ou maior, se o dono decidir), com `check (valor >= 0)` onde fizer sentido. Percentuais/juros: `numeric(9,6)`.
- R58. No Java, usar `BigDecimal`. Nunca `double` nem `float`.
- R59. Regra de arredondamento de juros/multa/desconto é decisão do dono e fica escrita (ex.: arredondar a cada parcela ou só no total).
- R60. Valor nunca é "sobrescrito sem rastro": mudança de valor gera linha de auditoria.

### 17.2 Constraints [confirmado]
- `CHECK` passa também com NULL; para barrar vazio use `NOT NULL`. `UNIQUE` trata NULLs como diferentes (a menos que `NULLS NOT DISTINCT`). `PRIMARY KEY` = único + not null. `FOREIGN KEY` com `ON DELETE`: `NO ACTION` (padrão), `RESTRICT`, `CASCADE`, `SET NULL`, `SET DEFAULT`. `EXCLUDE` para impedir sobreposição.

Regras:
- R61. Chaves estrangeiras em dinheiro e auditoria usam `ON DELETE RESTRICT`. **Nunca `CASCADE`** em cobrança, pagamento, contestação, acordo ou auditoria (apagar um pagador não pode levar o histórico junto).
- R62. Status como `text` com `check (status in (...))` (ou tipo `enum`). Lista de status é decisão do dono.
- R63. Documento do pagador (CPF/CNPJ): único, guardado só com números, com `check` de tamanho.
- R64. Pix: identificador do Pix (txid/endToEndId) com `unique`, para não registrar o mesmo pagamento duas vezes.

### 17.3 Índices [confirmado]
- `create index` bloqueia escrita na tabela; `create index concurrently` não bloqueia, mas demora mais. Índice parcial (`where ...`) economiza espaço. Reconstruir com `reindex index concurrently`.
- Postgres **não cria índice automático em chave estrangeira** (o advisor `0001` avisa); a chave primária e `unique` criam índice sozinhas.

Regras:
- R65. Indexar: chaves estrangeiras, `status` + `vencimento` (fila de cobrança), colunas usadas em policies.
- R66. Em tabela já grande, sempre `concurrently` (e fora de bloco de transação). Obs.: "concurrently" não pode rodar dentro de transação [conhecimento geral, não confirmado nesta consulta].

### 17.4 Transações e isolamento [confirmado]
- Padrão: **Read Committed** (cada comando vê um retrato novo). Repeatable Read e Serializable podem falhar com SQLSTATE `40001` e **exigem repetir a transação**. Serializable detecta anomalias sem bloquear mais que o Repeatable Read.
- Sequências (`serial`/`identity`) não voltam atrás em rollback: **buracos na numeração são normais**.

Regras:
- R67. Baixa de pagamento: uma transação só (grava pagamento + atualiza cobrança + grava auditoria). Tudo ou nada.
- R68. Operações que somam/conferem saldo (acordo, baixa parcial): `select ... for update` na cobrança, ou Serializable com repetição automática no Java.
- R69. Código Java trata `40001` e deadlock (`40P01`) com nova tentativa limitada. (Código `40P01`: conhecimento geral, não confirmado nesta consulta.)
- R70. Não usar sequência como número fiscal/boleto sem buracos.

### 17.5 Bloqueios [confirmado]
- `FOR UPDATE` bloqueia a linha contra alteração/exclusão/outros locks. `FOR NO KEY UPDATE` é mais fraco. Existem `NOWAIT` e `SKIP LOCKED` [citados em conhecimento geral; a página lida não os detalhou: não confirmado].
- **Advisory locks**: bloqueios definidos pela aplicação, liberados no fim da sessão (nível sessão) ou da transação (nível transação). Cuidado com `LIMIT` junto de `pg_advisory_lock` (use subconsulta).
- Deadlock: acontece quando duas transações se esperam. Prevenção: **mesma ordem de bloqueio sempre**, transações curtas, repetir quando abortar, nunca segurar transação aberta esperando o usuário.

Regras:
- R71. Fila do robô: cada instância pega itens com `for update skip locked` (não confirmado na página lida; ver nota acima) ou usa lock consultivo por transação.
- R72. Com pooler em modo transação, **lock de sessão não funciona** (a conexão muda entre comandos); usar lock de transação (`pg_advisory_xact_lock`). [raciocínio a partir das duas docs; não confirmado em página única]

### 17.6 Idempotência com `ON CONFLICT` [confirmado]
- `ON CONFLICT ... DO NOTHING` ou `DO UPDATE` é **atômico e determinístico**: ocorre exatamente um entre inserir e atualizar, mesmo sob concorrência. `EXCLUDED` = linha proposta. Em `DO NOTHING`, `RETURNING` não devolve a linha conflitante. Exige `unique`/exclusão correspondente. Permissões: INSERT, UPDATE (se DO UPDATE) e SELECT nas colunas citadas.

Regras:
- R73. Todo evento externo (webhook Pix, evento de marketplace, lote de faturamento) entra com uma **chave de idempotência** única e `ON CONFLICT DO NOTHING`.
- R74. Importação de faturamento por base: `unique (loja_id, competencia)` e `ON CONFLICT DO UPDATE` só se o dono aceitar sobrescrever; senão `DO NOTHING` e relatório de divergência.

### 17.7 Triggers e auditoria imutável [confirmado]
- `BEFORE`/`AFTER`, por linha ou por comando, eventos INSERT/UPDATE/DELETE/TRUNCATE. Disparar `raise exception` dentro da função bloqueia a operação. Exige privilégio `TRIGGER` na tabela e `EXECUTE` na função.
- Superusuário e donos podem **desligar triggers** ou usar `DROP`; por isso o bloqueio por trigger vem junto com revogação de permissões e papéis sem dono (ver SQL abaixo). A afirmação "dono pode desligar trigger": conhecimento geral, não confirmado nesta consulta.

### 17.8 Particionamento [confirmado]
- Tipos: faixa (range), lista, hash. Chave primária/única precisa **incluir a coluna de partição**. Ajuda quando consultas pegam poucas partições e para descartar dados antigos rapidamente; regra prática: vale quando a tabela passa da memória do servidor. Remover partição: `DETACH PARTITION ... CONCURRENTLY` é mais leve que `DROP`.
- Regras:
  - R75. Não particionar no começo. Auditoria pode ser particionada por mês **quando crescer** (decisão com dados reais).
  - R76. Como a auditoria nunca apaga, "descartar partição" só pode ser feito para **arquivar** (mover para armazenamento frio), nunca para eliminar.

### 17.9 JSONB [confirmado]
- `jsonb` é binário, indexável (GIN), não preserva ordem de chaves nem espaços, guarda só a última chave repetida. Operadores `@>` (contém) e `?` (existe chave). GIN padrão ou `jsonb_path_ops`. Números viram `numeric`. Qualquer UPDATE trava a linha inteira; manter documentos pequenos.
- Regras:
  - R77. JSONB para dados que mudam de forma (resposta crua do marketplace, antes/depois na auditoria). **Nunca para valor em R$, status ou datas** que o negócio consulta: esses são colunas.
  - R78. Valores monetários dentro de JSON viajam como texto (`"123.45"`) para não perder precisão no Java/JavaScript.

---

## 18. SQL de exemplo para o IT.MK (válido em Postgres 14+; testar com `supabase db reset` antes)

Nomes são ilustrativos; os nomes finais dependem do desenho aprovado.

### 18.1 Tabela de cobrança com valor `numeric`
```sql
create schema if not exists app;

create table app.cobranca (
  id            uuid primary key default gen_random_uuid(),
  pagador_id    uuid not null references app.pagador(id) on delete restrict,
  loja_id       uuid not null references app.loja(id)    on delete restrict,
  competencia   date not null,                       -- 1o dia do mês de referência
  valor_base    numeric(14,2) not null check (valor_base >= 0),
  percentual    numeric(9,6)  not null check (percentual between 0 and 100),
  valor_cobrado numeric(14,2) not null check (valor_cobrado >= 0),
  vencimento    date not null,
  status        text not null default 'aberta'
                check (status in ('aberta','paga','contestada','em_acordo','cancelada')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (loja_id, competencia)                      -- idempotência da importação
);

create index cobranca_pagador_idx on app.cobranca (pagador_id);
create index cobranca_loja_idx    on app.cobranca (loja_id);
create index cobranca_fila_idx    on app.cobranca (status, vencimento)
  where status in ('aberta','contestada');

alter table app.cobranca enable row level security;
revoke all on app.cobranca from anon, authenticated;
```
(Pressupõe as tabelas `app.pagador` e `app.loja` já criadas. A lista de status e o cálculo do valor são decisões do dono.)

### 18.2 Pagamento Pix idempotente
```sql
create table app.pagamento (
  id            uuid primary key default gen_random_uuid(),
  cobranca_id   uuid not null references app.cobranca(id) on delete restrict,
  valor_pago    numeric(14,2) not null check (valor_pago > 0),
  pix_end_to_end text not null unique,               -- mesma chave = mesmo pagamento
  pago_em       timestamptz not null,
  recebido_em   timestamptz not null default now()
);
alter table app.pagamento enable row level security;
revoke all on app.pagamento from anon, authenticated;

-- webhook repetido não duplica
insert into app.pagamento (cobranca_id, valor_pago, pix_end_to_end, pago_em)
values ($1, $2, $3, $4)
on conflict (pix_end_to_end) do nothing
returning id;     -- vazio = já existia
```

### 18.3 Auditoria só-inserção, com RLS e bloqueio
```sql
create table app.auditoria (
  id          bigint generated always as identity primary key,
  ocorrido_em timestamptz not null default now(),
  ator        text not null,            -- 'robo', 'sistema' ou id do usuário
  acao        text not null,            -- ex.: 'cobranca.enviada'
  tabela      text not null,
  registro_id text not null,
  antes       jsonb,
  depois      jsonb
);

-- 1) ninguém altera nem apaga: função que sempre recusa
create or replace function app.auditoria_bloquear()
returns trigger
language plpgsql
as $$
begin
  raise exception 'auditoria é somente inserção (% proibido)', tg_op;
end;
$$;

create trigger auditoria_sem_update_delete
  before update or delete on app.auditoria
  for each row execute function app.auditoria_bloquear();

create trigger auditoria_sem_truncate
  before truncate on app.auditoria
  for each statement execute function app.auditoria_bloquear();

-- 2) RLS ligado e permissões mínimas
alter table app.auditoria enable row level security;
alter table app.auditoria force row level security;
revoke all on app.auditoria from public, anon, authenticated;
grant insert, select on app.auditoria to itmk_app;   -- papel do servidor

create policy auditoria_inserir on app.auditoria
  for insert to itmk_app with check (true);
create policy auditoria_ler on app.auditoria
  for select to itmk_app using (true);
-- sem policy de update/delete = negado por padrão
```
Notas:
- O papel `itmk_app` precisa existir antes (`create role itmk_app with login password '...';`) e **não pode ser dono** da tabela (donos podem desligar trigger; ver 17.7). A tabela é criada pelo papel de migração.
- Tabela e funções de auditoria: o trigger sozinho não basta; o conjunto trigger + `revoke` + papel sem dono é que garante.
- `using (true)` aqui é intencional e restrito ao papel do servidor; o advisor `0024` pode avisar. Documentar a exceção no item.
- Para registrar mudanças de cobrança automaticamente, criar um trigger `after insert or update on app.cobranca` que insere em `app.auditoria` o `to_jsonb(old)` e `to_jsonb(new)` (função de gravação com `security definer`: ver armadilhas).

### 18.4 Segredo de marketplace no Vault (só gravação)
```sql
create extension if not exists supabase_vault;   -- já vem ativo na maioria dos projetos [não confirmado]

create table app.conexao_marketplace (
  id              uuid primary key default gen_random_uuid(),
  loja_id         uuid not null references app.loja(id) on delete restrict,
  marketplace     text not null,
  segredo_id      uuid,                  -- aponta para vault.secrets; nunca o valor
  segredo_em      timestamptz,           -- quando foi gravado (a tela mostra só isto)
  unique (loja_id, marketplace)
);
alter table app.conexao_marketplace enable row level security;
revoke all on app.conexao_marketplace from anon, authenticated;

-- única porta de entrada: grava, nunca devolve o valor
create or replace function app.gravar_segredo_conexao(p_conexao uuid, p_valor text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  v_id := vault.create_secret(
            p_valor,
            'conexao_' || p_conexao::text || '_' || extract(epoch from now())::bigint::text,
            'segredo de conexao de marketplace');
  update app.conexao_marketplace
     set segredo_id = v_id, segredo_em = now()
   where id = p_conexao;
end;
$$;

revoke all on function app.gravar_segredo_conexao(uuid, text) from public, anon, authenticated;
grant execute on function app.gravar_segredo_conexao(uuid, text) to itmk_app;

-- leitura: só a função usada pelo robô de integração, nunca exposta à tela
create or replace function app.ler_segredo_conexao(p_conexao uuid)
returns text
language sql
security definer
set search_path = ''
as $$
  select s.decrypted_secret
    from app.conexao_marketplace c
    join vault.decrypted_secrets s on s.id = c.segredo_id
   where c.id = p_conexao;
$$;
revoke all on function app.ler_segredo_conexao(uuid) from public, anon, authenticated;
grant execute on function app.ler_segredo_conexao(uuid) to itmk_integracao;  -- papel só do robô
```
Notas:
- `vault.create_secret(valor, nome, descricao)` e a visão `vault.decrypted_secrets` são da doc oficial [confirmado]. O nome de coluna `decrypted_secret` e o acesso por `security definer` dentro de função: conferir no projeto de teste [não confirmado].
- Trocar o segredo = nova gravação (e apagar/atualizar o antigo com `vault.update_secret`). Guardar o histórico de "quem trocou e quando" na auditoria, **sem o valor**.
- O papel `itmk_integracao` precisa ser criado e ter permissão de `usage` no esquema `app`; a permissão de leitura do esquema `vault` para funções `security definer` depende de quem é o dono da função: testar no ambiente de teste antes de produção [não confirmado].

### 18.5 Rodada do robô sem duplicar (lock + idempotência)
```sql
-- uma rodada por vez (lock vale até o fim da transação)
select pg_try_advisory_xact_lock(hashtext('robo_cobranca'));   -- false = outra rodada em andamento

-- pegar o próximo lote sem disputar com outra instância
select id from app.cobranca
 where status = 'aberta' and vencimento < current_date
 order by vencimento
 limit 50
 for update skip locked;
```
(`skip locked` é recurso do Postgres; a página de bloqueios lida não o detalhou: não confirmado nesta consulta. Testar.)

---

## 19. Checklist de critérios de aceite para itens de Database (copiar para cada BL-xx)

Marque as caixas; item só é "Pronto" com tudo marcado ou justificativa escrita.

**Estrutura**
- [ ] Mudança feita por arquivo em `supabase/migrations` (nome claro, uma mudança por arquivo), versionada no git.
- [ ] `supabase db reset` local roda sem erro com a migração.
- [ ] Nenhuma migração antiga foi editada.
- [ ] Aplicada primeiro no ambiente de teste, depois em produção, fora da sexta-feira.

**Dados**
- [ ] Valores em R$ são `numeric(precisão,escala)`; no Java são `BigDecimal`.
- [ ] Colunas obrigatórias têm `not null`; regras simples têm `check`.
- [ ] Chaves únicas definidas (documento do pagador, Pix, loja + competência).
- [ ] Chaves estrangeiras em histórico financeiro usam `restrict` (nada de `cascade`).
- [ ] Índices em chaves estrangeiras e em colunas da fila/filtros; criados `concurrently` em tabela grande.
- [ ] JSONB só para dado variável; nada de valor/status/data em JSON.

**Segurança**
- [ ] RLS ligado em toda tabela nova; nenhuma tabela sem policy ou sem decisão registrada.
- [ ] `anon` e `authenticated` sem acesso a pagamentos, auditoria e conexões; permissões padrão revogadas.
- [ ] Nenhuma policy `using (true)` fora da exceção documentada.
- [ ] Chave `secret` só no servidor; nenhuma chave no app JavaFX nem no git.
- [ ] Segredos de marketplace só no Vault; nenhuma tela/consulta devolve o valor; log não contém o valor.
- [ ] Funções `security definer` com `set search_path = ''` e `execute` revogado de quem não deve.
- [ ] Advisors de segurança e desempenho rodados e sem erro aberto (anexar resultado).

**Auditoria**
- [ ] Toda ação do robô e toda mudança em cobrança, pagamento, acordo e contestação gera linha de auditoria.
- [ ] Tentativa de UPDATE, DELETE e TRUNCATE na auditoria falha (teste automático).
- [ ] Papel da aplicação não é dono da tabela de auditoria.

**Concorrência e repetição**
- [ ] Entrada externa (webhook, importação) é idempotente (`on conflict` + chave única), com teste de envio duplicado.
- [ ] Baixa de pagamento em uma transação; teste com duas baixas simultâneas.
- [ ] Java repete com limite em erro `40001`/deadlock.
- [ ] Rodada do robô protegida contra execução dupla.

**Operação**
- [ ] Conexão do app usa o endereço certo (pooler sessão em rede IPv4), SSL ligado, `prepareThreshold=0` se modo transação.
- [ ] Backup/PITR conforme decisão do dono e ensaio de restauração feito na data combinada.
- [ ] Tamanho de pool menor que o limite de conexões do plano.
- [ ] Tela: se o item toca tela, segue regras do `CLAUDE.md` (visão única, sem barra horizontal).

---

## 20. Armadilhas

1. **Tabela criada e esquecida sem RLS.** Qualquer um com a chave pública lê tudo (se a Data API estiver ligada). Advisor `0013` acusa.
2. **Grant aberto por padrão.** RLS sem revogar grants é meia segurança; a doc manda revogar. Mudar de "padrão aberto" para "opt-in" está em andamento na plataforma: **não confie no padrão**, explicite sempre.
3. **Chave `service_role`/`secret` no app instalado.** Quem desmonta o app lê tudo. Só no servidor.
4. **Tutoriais antigos com chave `eyJ...`.** São das chaves legadas, que saem até o fim de 2026.
5. **Pooler modo transação com prepared statements.** Erros estranhos aleatórios. Use modo sessão ou `prepareThreshold=0`.
6. **Rede só IPv4 conectando no endereço direto.** Falha de conexão: direta é IPv6 por padrão.
7. **`float`/`double` para dinheiro.** Centavos somem. `numeric` + `BigDecimal`.
8. **`ON DELETE CASCADE` em histórico financeiro.** Apagar um cadastro leva pagamentos junto.
9. **Auditoria só com trigger.** Dono da tabela pode desligar. Combine com permissões e papel sem dono.
10. **Editar no painel em produção.** A mudança some do git e as migrações divergem; use `db diff`/`db pull` para recuperar.
11. **Branch de teste com dados reais.** Dados de pagador vazam para o ambiente de teste.
12. **Segredo no Vault e migração por `pg_dump`.** O projeto novo não decifra sem a chave raiz.
13. **pgsodium/Transparent Column Encryption em coisa nova.** Descontinuação anunciada.
14. **Confiar em `user_metadata` em policy.** O usuário edita; advisor `0015`.
15. **`pg_net` para envio crítico.** Resposta guardada só 6 h, tabelas unlogged, 200 req/s.
16. **Edge Function longa.** CPU 2 s por requisição e 150/400 s de relógio; trabalho pesado vai para o servidor.
17. **Cron demais.** Recomendação: até 8 jobs simultâneos, até 10 min cada.
18. **Webhook sem assinatura e sem idempotência.** Pagamento duplicado ou falso.
19. **Transação aberta esperando usuário.** Trava linha e gera deadlock.
20. **Buracos na numeração (identity).** Normal; não usar como número sem lacuna.
21. **Backup não cobre Storage.** Comprovantes precisam de cópia própria.
22. **Projeto gratuito pausa em 1 semana parado.** Nunca usar para produção.
23. **Restauração derruba o projeto** durante o processo e não recupera senhas de papéis personalizados.
24. **Senha com caractere especial na URL JDBC** sem codificação.
25. **Índice em tabela grande sem `concurrently`.** Trava escrita.
26. **Partição com chave primária sem a coluna de partição.** Postgres recusa.
27. **Compartilhar a senha mestre `postgres` com todos.** Criar papéis por função.

---

## 21. O que depende de decisão do dono (levar para o P.O. decidir)

1. **Plano e orçamento**: Pro (a partir de US$ 25/mês) ou Team (a partir de US$ 599/mês); computação (tamanho); PITR (7, 14 ou 28 dias; US$ ~100/200/400 por mês pela página consultada); limite de gasto aceito.
2. **Ambientes**: dois projetos separados (teste e produção) ou um projeto com branch persistente de teste; quem pode mexer em produção.
3. **Quem fala com o banco**: confirmar o desenho "JavaFX -> servidor Spring -> banco", sem chave nem senha no app do analista; desligar a Data API.
4. **Login**: Auth do Supabase ou login próprio no Spring; uso de MFA; como "permissões" internas se encaixam sem criar visões diferentes (regra de visão única).
5. **Onde recebe webhook** (Pix e marketplaces): Spring ou Edge Function.
6. **Robô**: roda no Spring ou no `pg_cron`; horário; limite de tentativas; prazo de guarda do histórico de execuções.
7. **Regras de negócio com números**: arredondamento, juros, multa, desconto, tolerância de centavos, lista de status da cobrança, o que acontece com contestação aberta.
8. **Retenção**: por quanto tempo guardar auditoria (hoje: para sempre), onde arquivar quando crescer; política de LGPD para dados do pagador (decisão jurídica, não verificada aqui).
9. **Backup extra** fora do Supabase (dump semanal) e cópia dos comprovantes do Storage.
10. **Realtime** na fila ou atualização por consulta periódica.
11. **Troca de chaves**: data para sair das chaves legadas (limite: fim de 2026) e rotina de troca de segredos.
12. **Particionar auditoria** (só quando houver volume real) e qual o critério de "grande".

---

## 22. Não confirmado (resumo das lacunas desta consulta)
- Formato exato do usuário do pooler e nome do certificado SSL raiz.
- Valor ideal do pool Hikari para o IT.MK.
- Página própria de pgcrypto no Supabase (404); ativação por `create extension` é padrão geral.
- `NOWAIT`/`SKIP LOCKED`, `40P01`, `concurrently` fora de transação, "dono pode desligar trigger": conhecimento geral, não lido nas páginas.
- Plano exigido para branching; preços de computação por tamanho; regra do teto de gasto (spend cap).
- Limites de tamanho de arquivo do Storage; link temporário (signed URL); retenção de logs por plano; disponibilidade de pgaudit.
- Autorização do Realtime com RLS e comparação Broadcast x Postgres Changes.
- Biblioteca Java oficial para Auth do Supabase.
- Detalhes de acesso a `vault.decrypted_secrets` por função `security definer` (testar no ambiente de teste).
- Procedimento oficial de migração da chave do Vault entre projetos.
- Data exata em que as chaves legadas `anon`/`service_role` deixam de funcionar (a doc diz apenas "até o fim de 2026").
- Prazo de restauração em horas (a doc só diz que cresce com o tamanho).

---

## 23. Tabela de fontes (todas consultadas em 01/10/2026)

| Tema | URL oficial | Data da consulta | Resultado |
|---|---|---|---|
| Conexão (direta, pooler, IPv4/IPv6) | https://supabase.com/docs/guides/database/connecting-to-postgres | 01/10/2026 | lida |
| Gestão de conexões (pool 40%/80%) | https://supabase.com/docs/guides/database/connection-management | 01/10/2026 | lida (sem tabela de limites) |
| Computação e disco (conexões por tamanho) | https://supabase.com/docs/guides/platform/compute-and-disk | 01/10/2026 | lida |
| Chaves de API | https://supabase.com/docs/guides/api/api-keys | 01/10/2026 | lida |
| RLS | https://supabase.com/docs/guides/database/postgres/row-level-security | 01/10/2026 | lida |
| Proteger a Data API (grants) | https://supabase.com/docs/guides/api/securing-your-api | 01/10/2026 | lida |
| Papéis | https://supabase.com/docs/guides/database/postgres/roles | 01/10/2026 | lida |
| Auth | https://supabase.com/docs/guides/auth | 01/10/2026 | lida (visão geral) |
| Backups e PITR | https://supabase.com/docs/guides/platform/backups | 01/10/2026 | lida |
| Branching | https://supabase.com/docs/guides/deployment/branching | 01/10/2026 | lida |
| Custo de branching | https://supabase.com/docs/guides/platform/manage-your-usage/branching | 01/10/2026 | lida |
| Migrações (CLI) | https://supabase.com/docs/guides/deployment/database-migrations | 01/10/2026 | lida |
| Vault | https://supabase.com/docs/guides/database/vault | 01/10/2026 | lida |
| pgsodium | https://supabase.com/docs/guides/database/extensions/pgsodium | 01/10/2026 | lida |
| Extensões (geral) | https://supabase.com/docs/guides/database/extensions | 01/10/2026 | lida (sem lista) |
| pg_net | https://supabase.com/docs/guides/database/extensions/pg_net | 01/10/2026 | lida |
| pgcrypto (Supabase) | https://supabase.com/docs/guides/database/extensions/pgcrypto | 01/10/2026 | não abriu (404) |
| Cron | https://supabase.com/docs/guides/cron | 01/10/2026 | lida |
| Database Webhooks | https://supabase.com/docs/guides/database/webhooks | 01/10/2026 | lida |
| Edge Functions | https://supabase.com/docs/guides/functions | 01/10/2026 | lida |
| Edge Functions: limites | https://supabase.com/docs/guides/functions/limits | 01/10/2026 | lida |
| Edge Functions: autenticação/JWT | https://supabase.com/docs/guides/functions/auth | 01/10/2026 | lida |
| Webhook de entrada (exemplo Stripe) | https://supabase.com/docs/guides/functions/examples/stripe-webhooks | 01/10/2026 | lida (resumo) |
| Realtime | https://supabase.com/docs/guides/realtime | 01/10/2026 | lida |
| Realtime: limites | https://supabase.com/docs/guides/realtime/limits | 01/10/2026 | lida |
| Storage | https://supabase.com/docs/guides/storage | 01/10/2026 | lida (parcial) |
| Advisors | https://supabase.com/docs/guides/database/database-advisors | 01/10/2026 | lida |
| Logs | https://supabase.com/docs/guides/telemetry/logs | 01/10/2026 | lida (parcial) |
| Índices (Supabase) | https://supabase.com/docs/guides/database/postgres/indexes | 01/10/2026 | lida |
| Configuração do Postgres | https://supabase.com/docs/guides/database/postgres/configuration | 01/10/2026 | lida (parcial) |
| Cascata de exclusões | https://supabase.com/docs/guides/database/postgres/cascade-deletes | 01/10/2026 | lida |
| Planos e preços | https://supabase.com/pricing | 01/10/2026 | lida |
| Cobrança (cotas) | https://supabase.com/docs/guides/platform/billing-on-supabase | 01/10/2026 | lida |
| Postgres: tipos numéricos | https://www.postgresql.org/docs/current/datatype-numeric.html | 01/10/2026 | lida (v18.6) |
| Postgres: INSERT / ON CONFLICT | https://www.postgresql.org/docs/current/sql-insert.html | 01/10/2026 | lida (v18.6) |
| Postgres: isolamento de transações | https://www.postgresql.org/docs/current/transaction-iso.html | 01/10/2026 | lida |
| Postgres: bloqueios | https://www.postgresql.org/docs/current/explicit-locking.html | 01/10/2026 | lida |
| Postgres: CREATE TRIGGER | https://www.postgresql.org/docs/current/sql-createtrigger.html | 01/10/2026 | lida |
| Postgres: particionamento | https://www.postgresql.org/docs/current/ddl-partitioning.html | 01/10/2026 | lida (v18.6) |
| Postgres: JSON/JSONB | https://www.postgresql.org/docs/current/datatype-json.html | 01/10/2026 | lida |
| Postgres: constraints | https://www.postgresql.org/docs/current/ddl-constraints.html | 01/10/2026 | lida |
| Postgres: RLS | https://www.postgresql.org/docs/current/ddl-rowsecurity.html | 01/10/2026 | lida |
| Postgres: pgcrypto | https://www.postgresql.org/docs/current/pgcrypto.html | 01/10/2026 | lida |
| Driver JDBC (pgjdbc) | https://jdbc.postgresql.org/documentation/use/ | 01/10/2026 | lida |

Observação de método: as páginas foram lidas por ferramenta que resume o conteúdo; o SQL deste manual foi montado a partir dessas leituras e **não foi executado** num banco. Antes de usar, rodar no ambiente de teste e conferir os advisors.
