# Quem constrói o quê: parte do BL ou parte do IT.MK

Regra do dono (02/10/2026): conexões com marketplaces, análise das lojas, faturamento vindo dos marketplaces e Pix (Asaas e Inter) são construídos no banco e no Java do BL. O IT.MK só lê e mostra. O WhatsApp fica no banco e no Java do IT.MK. O IT.MK pede o Pix ao BL por uma porta (API) do Java do BL (opção A, escolhida).

## Como marcar nos itens
- Item da parte do BL: título começa com **"BL: "**, `tipo: Tarefa` (marca "Externa", não conta nos pontos do IT.MK) e `responsavel:` com a pessoa do BL.
- Item da parte do IT.MK: continua como está, ou ganha só o texto "lê do BL".
- Cada item do BL traz, nos critérios: **o que o BL constrói**, **o que devolve ao IT.MK**, **onde** (tabela, visão ou porta) e **em que formato**.

## Parte do BL (vira "BL: ...")
**Integrações:** Pix com Asaas (10), Pix com Banco Inter (9), Conector da Shopee (9), do Mercado Livre (7), da Shein (6), da Kwai (3), Sincronização e avisos de conexão (5), Base das integrações (12, menos o que for do WhatsApp), Decisões de integração (as de Pix e marketplaces), Qualidade das integrações (as de Pix e marketplaces).
**Database:** Conexões e segredos no banco (6), Análise de loja no banco (5), "Guardar pedidos e notas" e "Guardar faturado por loja e base" (faturamento que vem dos marketplaces), "Criar Pix com estados", "Controlar validade após o vencimento", "Guardar aviso bruto do provedor", "Guardar provedor de Pix, ambiente e chave Pix".
**Backend:** Conexões com marketplaces no servidor (6), Análise de loja no servidor (6), Porta única de provedor de Pix, Gerar Pix por cobrança, Validade de 30 dias e remoção, Juros e multa desligados, Endpoint do aviso de pagamento, Baixa automática por aviso, Reconciliação diária, Parcelamento com um Pix por parcela (a parte que fala com o provedor).

## Parte do IT.MK (continua)
WhatsApp com a WhatsGW (13), Robô, Conversas, Inadimplência e acordos, Contestações, Recebimentos (pagamento, divergência, comprovante), Fechamento (cálculo, conferência, envio), Configurações (régua, modelos, usuários), Dashboard, Carteira de clientes (lê a ficha do BL), cobrança e memória de cálculo, auditoria e histórico.

## O que o IT.MK passa a "pedir" e "ler"
| O IT.MK pede ao BL | O BL devolve |
|---|---|
| Gerar o Pix de uma cobrança (CPF, loja, valor, vencimento, parcela) | Código do Pix, copia e cola, link, validade, identificador |
| Cancelar ou remover um Pix | Confirmação |
| Reconectar ou atualizar uma loja | Situação da conexão |

| O IT.MK lê do BL | Formato |
|---|---|
| Situação e validade da conexão de cada loja | Visão de leitura |
| Análise da loja (indicadores, faixa de saúde, selo, violações, devoluções) | Visão de leitura |
| Faturamento por loja, base e competência, pedidos e notas | Visão de leitura |
| Aviso de pagamento do Pix | Evento escutado pelo IT.MK, só leitura |
| Erros das integrações | Visão de leitura |

## Pontos que dependem de decisão do dono
1. Confirmar este quadro (itens de Pix de "Criar cobrança" ficam do BL, regras de cobrança ficam do IT.MK).
2. Aceitar a marcação (título "BL: " + tipo Tarefa).
3. Quem é o responsável dos itens do BL.
