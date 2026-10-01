# CicloDev como P.O. automático: o que o sistema pode fazer sozinho

Pedido do dono (02/10/2026): o CicloDev deve ser o P.O. de qualquer projeto, olhando o que já existe nele (status, critérios, pontos, valor, versões, histórico) e guiando quem usa. Vale para time de uma pessoa só.

## 1. Base desta análise
- **Li:** `README.md`, `PENDENCIAS.md`, `banco/LEIA-ME.md` (partes 1 a 39), a lista dos 40 arquivos de banco e das telas, o assistente DevIT (`supabase/functions/devit`), os nomes das funções do módulo P.O. (`fonte/po.js`) e as visões de números (`banco/05_bi.sql`).
- **Método:** `docs/base-po.md` e os manuais de `docs/kb/` (repositório Agent-s-Conhecimento).
- **Não li:** o código das telas por dentro, o `site/`, os testes, os outros arquivos de `docs/`. Se alguma sugestão abaixo já existe lá, é só marcar como pronta.

## 2. O que o CicloDev já tem (peças para o P.O. automático)
| Peça existente | Para que serve ao P.O. |
|---|---|
| História, MoSCoW, nível 1-5, valor 1-10, pontos | Dá para calcular ordem e tamanho |
| Critérios de aceite com quem marcou e quando | Dá para medir se o item está pronto |
| Situações Criado › Priorizado › Em andamento › Pronto para testar › Aceito / Voltou | Dá para medir fluxo |
| `itens_historico` (toda mudança, antes e depois) | Dá para medir tempo parado e devolução |
| Dependência (`depende`) | Dá para achar bloqueios |
| Versões com data e meta, Metas, Definição de Pronto, P.O. do projeto | Dá para medir prazo e objetivo |
| Velocidade por ciclo, ritmo semanal, itens por situação, SLA (`bi.*`) | Dá para prever |
| Git: branch, commit e PR ligados ao item, publicações | Dá para saber o que entrou no ar |
| Automações por gatilho, lembretes, e-mail, DevIT (assistente em guias) | Já existe o jeito de avisar e de guiar |
| Regra do banco: só o P.O. aceita, item aceito não muda | Já protege o método |

## 3. Princípios
1. **O sistema sugere, a pessoa decide.** Nunca aceita, devolve, apaga nem muda a ordem sozinho (regra que o banco já tem para aceitar).
2. **Todo aviso diz por quê** e cita a regra do método (ex.: "item grande demais: quebre antes de começar").
3. **Só olha o que já existe.** Quase tudo abaixo é visão ou aviso sobre colunas que já existem; pouco precisa de tabela nova.
4. **Time de uma pessoa:** os papéis se acumulam, mas o sistema separa os passos (quem refina, quem faz, quem aceita) e pede a conferência de quem aceita o que ele mesmo fez.

## 4. Automações propostas, por momento do projeto
Prioridade: **D** = deve, **S** = deveria, **P** = poderia. "Olha" = o que o sistema lê. "Faz" = o que mostra ou avisa.

### Começar o projeto
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 1 | **Guia "Montar o projeto"** (DevIT conduz, um passo por vez) | P.O., Definição de Pronto, versões, metas | Passos: visão e meta, partes interessadas, quem é o P.O., Definição de Pronto, versões com data, riscos. Marca o que falta | D |
| 2 | **Definição de Pronto padrão** | Definição de Pronto vazia | Oferece um modelo pronto para escolher e editar (hoje começa em branco) | D |
| 3 | **Termômetro de preparo do projeto** | Tudo acima | Mostra "o projeto está 70% montado" e o próximo passo | S |

### Refinar o backlog
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 4 | **Selo "Preparado"** em cada item | História, critérios, valor, pontos, prioridade, versão, dependências | Marca o item como pronto para começar (INVEST) ou lista o que falta | D |
| 5 | **Item grande demais** | Pontos 13 e 20 | Avisa e oferece "quebrar em itens menores" | D |
| 6 | **Critério fraco** | Texto dos critérios | Avisa critério vazio, sem como conferir ("funciona bem") ou repetido | S |
| 7 | **Épico e versão sem meta** | Metas | Avisa e pede a meta | S |
| 8 | **Possível duplicado** | Títulos parecidos | Avisa antes de criar (hoje só o lote acusa título igual) | P |

### Priorizar
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 9 | **Ordem sugerida** | Valor por ponto, dependências, prioridade | Mostra a ordem que o método indica, com "por que está aqui", e um botão Aplicar | D |
| 10 | **Dependência fora de ordem** | Fila e `depende` | Avisa item na frente que depende de item mais atrás, e dependência circular | D |
| 11 | **Decisão que trava itens** | Itens do tipo "Decidir..." e quem depende deles | Mostra "esta decisão trava N itens e vence em X" | D |
| 12 | **Versão carregada de "Deve"** | MoSCoW por versão | Avisa quando quase tudo é "Deve" (limite configurável) | S |

### Planejar a versão
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 13 | **Previsão por velocidade** | Pontos da versão, velocidade medida, data de entrega | Diz "no ritmo atual sai em tal data" contra a data prometida; tarefa externa não conta | D |
| 14 | **Sugestão de corte** | Prioridade e valor | Se não cabe, lista o que tirar (menor valor por ponto, "Poderia") | S |
| 15 | **Item fora da meta** | Meta da versão | Avisa item que não ajuda a meta | P |

### Executar
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 16 | **Item parado** | Histórico de situação | Avisa "em andamento há N dias sem mudança" | D |
| 17 | **Começou sem estar preparado** | Selo Preparado | Avisa ao mover para Em andamento | S |
| 18 | **Esperando aceite** | Pronto para testar há dias | Lembra o P.O. de aceitar ou devolver | D |

### Aceitar e entregar
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 19 | **Aceite guiado** | Critérios, desenho, Definição de Pronto | Mostra tudo numa tela; devolver exige motivo; no time de uma pessoa pede conferir um a um | D |
| 20 | **Notas da versão automáticas** | Itens aceitos, bugs, melhorias | Monta o texto da nota ao fechar a versão; a pessoa só confirma | S |
| 21 | **Fechar versão com "o que não foi verificado"** | Versão | Pede essa lista antes de fechar (regra do plano) | S |

### Acompanhar
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 22 | **"O que fazer hoje"** | Tudo | Lista as 5 ações mais úteis: aceitar, refinar, decidir, destravar | D |
| 23 | **Semáforo da versão** | Prazo × velocidade, preparados, devolvidos, bugs | Verde, amarelo ou vermelho com o motivo | D |
| 24 | **Burndown do ciclo e do produto** | Histórico e ritmo | Gráfico automático | S |
| 25 | **Limpeza do backlog** | Idade e uso | Sugere arquivar itens antigos sem movimento (nada é apagado) | P |
| 26 | **Revisão do ciclo** (retrospectiva de uma pessoa) | Entregue, devolvido, estimado × real | Ao fechar a versão, mostra os números e guarda 3 respostas como decisão | S |
| 27 | **Resumo semanal** | Itens 22 e 23 | Já existe o e-mail da semana; passa a trazer essas ações | S |

### Riscos e mudanças
| # | Automação | Olha | Faz | Pri |
|---|---|---|---|---|
| 28 | **Registro de riscos com revisão** | Decisões e riscos | Cada risco com dono, plano e data de revisão; avisa quando vence | S |
| 29 | **Mudança depois de aceito vira Melhoria** | Edição de item aceito | Em vez de só recusar, oferece criar a Melhoria já ligada ao item | S |
| 30 | **Por quê embutido** | Base de método | O DevIT explica cada aviso com a regra do método em linguagem simples | P |

## 5. Ordem sugerida para construir
- **Onda 1 (já muda o dia a dia):** 4, 5, 10, 11, 13, 16, 18, 22.
- **Onda 2 (guiar do zero):** 1, 2, 9, 19, 23.
- **Onda 3 (o resto):** 3, 6, 7, 12, 14, 17, 20, 21, 24, 26, 27, 28, 29; depois os "poderia".

## 6. Cuidados
- **Aviso demais cansa.** Cada aviso precisa de botão Silenciar e de limite por dia; o resumo da manhã junta os avisos de baixa importância.
- **Regras em Configurações, não no código:** limites de dias parado, de pontos grandes e de "Deve" por projeto.
- **Nada disso pode gravar sozinho** na situação, na ordem ou no aceite do item.
- **Não verificado:** quanto disso já existe nas telas; se o banco aguenta as contas para vários projetos ao mesmo tempo (hoje há dados de exemplo e um projeto real).
