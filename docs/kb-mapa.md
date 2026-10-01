# Mapa da base de conhecimento dos agentes

Repositório: https://github.com/IT-HUB-IA/Agent-s-Conhecimento (pasta `agentes_kb_pronto`). Somente leitura.
Tamanho: 89 mil arquivos, 454 MB, 21 categorias, cerca de 45 mil trechos. Livros e repositórios convertidos em Markdown.
Para usar numa sessão nova: `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/IT-HUB-IA/agent-s-conhecimento /home/user/it-hub-ia/agent-s-conhecimento` (clone demora alguns minutos).

## Como consultar
1. Cada categoria tem `README.md`, `categoria_resumo.md`, `indice.md` (lista de materiais com o caminho real), `documentos/` (arquivos completos) e `livros/<livro>/` (índice e páginas em ordem).
2. Procure por assunto com `grep -rli "termo" <categoria>/documentos` e leia o arquivo achado.
3. Os manuais prontos em `docs/kb/` resumem as partes mais importantes para o IT.MK e dizem onde ler mais.

## Qual categoria usar em cada pedido
| Pedido | Categorias |
|---|---|
| Plano de produto, backlog, histórias, priorização | `p-o-produto`, `desenvolvimento-agil`, `metodologias-ageis-avancadas`, `lideranca-e-gestao-de-equipe`, `empresa-e-cultura-organizacional` |
| Frontend (telas, JavaFX, CSS, design) | `frontend`, `design`, `padroes-e-design-de-software` (UX, web responsivo, CSS) |
| Backend (Java, Spring, regras de negócio) | `backend`, `arquitetura-de-software`, `padroes-e-design-de-software`, `codigo-limpo`, `linguagens-de-programacao`, `seguranca` |
| Database (Supabase/Postgres) | `database`, `bancos-de-dados`, `seguranca`, `backend` |
| Integrações (marketplaces, Pix, WhatsApp) | `integracoes` (Spring Integration), `seguranca`, `devops` |
| Qualidade, testes, entrega | `desenvolvimento-agil` (TDD, BDD, testes), `codigo-limpo`, `devops` |

## O que a base NÃO traz (conferido por busca)
- Supabase: nenhum arquivo. Postgres/PostgREST/RLS: só menções soltas.
- JavaFX: 2 arquivos com menção.
- WhatsGW e Banco Inter: nenhum. Asaas: 6 arquivos.
- Shein, Mercado Livre, Shopee e Kwai (APIs): não conferidos como cobertos; tratar como não cobertos até achar.
Nesses casos o plano deve dizer "não coberto pela base" e apontar a fonte oficial a consultar.

## Categorias (documentos)
algoritmos-e-estruturas-de-dados 2207 · arquitetura-de-software 3472 · backend 15 · bancos-de-dados 782 · carreira-e-habilidades 5796 · codigo-limpo 462 · data-science 642 · database 741 · desenvolvimento-agil 3046 · design 181 · devops 7870 · empresa-e-cultura-organizacional 2014 · entrevistas-e-preparacao 2496 · frontend 273 · integracoes 5013 · lideranca-e-gestao-de-equipe 1212 · linguagens-de-programacao 2612 · metodologias-ageis-avancadas 1377 · p-o-produto 86 · padroes-e-design-de-software 2640 · seguranca 750.
