# Base de clientes do grupo BL (projeto Supabase "B&L") — SOMENTE LEITURA

Consultado em 01/10/2026 só pela estrutura (lista de tabelas e colunas) e por uma contagem sem dados pessoais. Nenhum cliente foi lido. Nada foi escrito. Proibido escrever nessa base (ver CLAUDE.md).

## Projetos Supabase visíveis (organização do grupo)
- **B&L** (`wfqcoocfastgsfgegpcm`): base matriz de clientes, empresas, vínculos e muito mais (196 tabelas). SOMENTE LEITURA.
- **MK - Cobranças** (`uhrddcfyxedqfkoifyqc`): banco do IT.MK. Está vazio (0 tabelas em `public`). É onde o Database do IT.MK será criado.
- Outros: Financ-Java, Fiscal-Java's, Societario-Java's (não relacionados a este trabalho; não consultados).

## Como o vínculo funciona na B&L
`holding` → `companhia_grupo` (8 companhias do grupo) → `vinculo_companhia` (empresa ↔ companhia) → `empresa` (CNPJ) ← `cliente_empresa` → `cliente` (CPF).
- `cliente` (737 linhas): id, cpf, nome, whatsapp, email, situacao, ativo, id_origem, sistema_origem, datas.
- `empresa` (1472): id, cnpj, razao_social, nome_fantasia, porte, segmento, **regime_tributario**, situacao, ativo, representante_legal, cod_conexa, conexa_customer_id etc.
- `cliente_empresa` (1444): cliente_id, empresa_id, papel, principal, ativo, vinculado_em, desvinculado_em.
- `vinculo_companhia` (1450): empresa_id, companhia_grupo_id, situacao, codigo_cliente, data_inicio, data_fim, ativo.
- `companhia_grupo` (8): slug, sigla, nome, situacao, ativo. A 40% tem slug `40`, sigla `40`, situação `operante`, ativa.
- `loja_canal` (0 linhas hoje): empresa_id, canal, nome_loja, codigo_gs, ativo. Candidata a guardar as lojas de marketplace no grupo (a decidir).
- `outbox_evento` (0): agregado, tipo_evento, payload, ocorrido_em, publicado_em. Possível fonte de eventos de mudança (a decidir).
- Também existem `contato`, `endereco`, `acesso_externo` (vazias), `whats_*` (infra de WhatsApp do grupo), `fin_*` (cobrança da You), `integracao*`, `mapa_empresa_antiga_companhia_grupo`.

## Achado importante
Hoje existem **1450 vínculos, todos com a YOU Contabilidade**. A **40% tem 0 vínculos**. Enquanto ninguém marcar o vínculo da 40% no sistema Java do BL, a carteira do IT.MK fica vazia.

## Chaves e regras de leitura (proposta)
- Pagador = cliente (CPF) [a confirmar]; empresa = CNPJ [a confirmar]; loja de marketplace ↔ empresa [a confirmar].
- Carteira da 40% = clientes com ao menos uma empresa com `vinculo_companhia.ativo = true` e companhia de slug `40`.
- IT.MK guarda cópia sincronizada somente leitura (ids originais + CPF/CNPJ). Percentual da 40%, base de cálculo, lojas de marketplace e tudo de cobrança são do IT.MK.
