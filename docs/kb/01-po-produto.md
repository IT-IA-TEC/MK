# Manual de consulta 01: P.O / Produto (para montar planos do IT.MK)

Para quem é: o P.O. do IT.MK. Serve para montar plano, backlog, roadmap e roteiro sem reler a base.
Fonte: categoria `p-o-produto` da base de conhecimento (189 arquivos). Caminho-base dos arquivos citados:
`/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/p-o-produto/` (somente leitura).

Legenda de confiança:
- **[BASE]** = está escrito nos materiais da base.
- **[COMPL.]** = método conhecido que a base só cita pelo nome (RICE, WSJF, Kano, OKR). Eu expliquei com conhecimento geral. Não está detalhado na base. Confirmar antes de tratar como regra do dono.

Regra de ouro (já vale no IT.MK): usar sempre o modelo da seção 10 de `docs/base-po.md` e as regras do `CLAUDE.md` (visão única, sem espaço vazio, sem barra horizontal, cores só em `tokens.css`).

---

## 0. O que existe na categoria (mapa rápido)

A categoria é pequena em conteúdo útil. Dos 189 arquivos, só uns 12 têm texto de método. O resto é ruído.

| Tipo | Quantidade aproximada | Vale ler? |
|---|---|---|
| Livro "Product Owner's Handbook" (23 páginas de PDF) e o mesmo texto em README | 23 + 1 | SIM. É o núcleo. |
| Guia dwyl "Product Owner Guide" | 1 | SIM. Backlog, item bem escrito, bug x melhoria, entrega. |
| Guia Tiwari "Product Management Guide" | 1 | Pouco. Rotina do PM, listas de ferramentas e cursos. |
| "Product Owner Roadmap" (Ezzelrgal) | 1 | Pouco. Só tópicos, sem explicação. |
| Lista "awesome-product-management" (Den) | 1 grande | Só como lista de leituras e ferramentas. |
| Cheat sheet "Secure Product Design" (OWASP) | 1 | SIM para o robô, dados financeiros e acesso (seção 7). |
| Imagens com texto lido por OCR (quadros do livro) | ~25 | Só para ver o formato dos quadros. Textos repetidos. |
| Licenças, CI (`claude.yml`, `linkchecker.yml`, `makepdf.yml`), código de conduta, política de IA, template de PR, CSS, `.DS_Store`, `.gitignore`, GIFs de ferramentas | ~45 | NÃO. Ignorados de propósito. |

Os documentos `documentos/p-o-produto__doc_000NN.md` têm o texto. Os `chunks/` são cortes do mesmo texto (duplicado). Não há pasta `livros/` nesta cópia: as páginas do livro estão em `documentos/doc_00001` a `doc_00023`.

---

## 1. Resumo por fonte

### 1.1 Product Owner's Handbook (Atacan Demiralp, fev/2018) [BASE]
Arquivos: `documentos/doc_00001..00023.md` (páginas 1 a 23) e `documentos/doc_00066.md` (mesmo texto em README).
O que ensina: um passo a passo de 14 passos para o P.O. de Scrum, do começo ao fim.
1. Conhecer o time (Scrum Master + time de desenvolvimento, no máximo 9 pessoas).
2. Quadro de visão do produto (visão, meta, estratégia) e como validá-lo.
3. Mapa de partes interessadas (interesse x poder).
4. Quadro de delegação (quem decide o quê), no estilo Delegation Poker.
5. Definir o que é valor.
6. Roadmap com versões e datas.
7. Mapa de histórias (histórias, épicos, oficina de escrita).
8. Plano de versões.
9. Backlog (ordem, MoSCoW, valor/custo, Pareto, critérios de aceite com INVEST).
10. Planejamento do ciclo (Planning Poker, Fibonacci, Definição de Pronto).
11. Acompanhamento (burndown, velocidade).
12. Refinamento do backlog (até 10% da capacidade).
13. Revisão do ciclo.
14. Retrospectiva.
Fecha com dívida técnica. É a base do `docs/base-po.md`.

### 1.2 Product Owner Guide (dwyl) [BASE]
Arquivo: `documentos/doc_00064.md` (e `chunks/doc_00064__chunk_0001..0003`).
O que ensina: como o P.O. trabalha no dia a dia com itens de backlog.
- Lista de 12 responsabilidades do P.O.
- Backlog como lista viva, com uma fonte única da verdade.
- Item escrito pelo P.O., com 3 partes: história, critérios de aceite (caixas), desenho de celular e computador.
- 5 níveis de prioridade (1 só para emergência).
- Ciclo de vida do item (criado, priorizado, em andamento, pronto para testar, aceito ou volta).
- Quando é bug e quando é melhoria nova. Como relatar bug.
- Ambiente de teste (staging), tamanhos de tela, hora de demonstrar e entregar, dívida técnica, Lei de Brooks.

### 1.3 Product Management Guide (Rajnish Mani Tiwari) [BASE]
Arquivo: `documentos/doc_00063.md`.
O que ensina: plano de 6 semanas para virar PM (objetivo, fundamentos, mentor, projeto, rede, entrevistas, lançamento). Também: rotina diária do PM, com 5 áreas (estratégia e visão, comunicação, foco no usuário, dados, resolução de problemas), tarefas típicas, fatores de sucesso e de fracasso, trocas e priorização, métricas e testes A/B, ciclo de vida do produto, inteligência emocional, métricas além de usuários (receita, retenção, redução de custo). Lista ferramentas e cursos.
Cuidado: é texto genérico de carreira. Algumas citações de pessoas e cursos parecem imprecisas. Usar só o que também aparece nas outras fontes.

### 1.4 Product Owner Roadmap (Mohamed Ezzelrgal) [BASE]
Arquivo: `documentos/doc_00065.md`.
O que ensina: só índice de estudo em 6 áreas: mentalidade ágil, núcleo do P.O. (histórias, MoSCoW, WSJF, RICE, backlog, roadmap), ferramentas, comunicação com partes interessadas (mapa, entrevistas, prioridades em conflito), métricas (OKR x KPI, indicadores de antecipação x resultado, adoção de funcionalidade, velocidade x valor entregue), IA em produto (analisar feedback, organizar backlog, sugerir testes). Cita os nomes WSJF e RICE sem explicar: ver seção 2.5.

### 1.5 awesome-product-management (Den Delimarsky) [BASE]
Arquivo: `documentos/doc_00067.md` (e `chunks/doc_00067__chunk_0001..0005`).
O que é: lista curada de ferramentas (OneNote, Bear, Obsidian, Notion, Trello, Taiga, Tenzu, Taskade, Balsamiq, Sketch, Figma, Productboard, LogChimp, Hellonext, Screeb, Tability), artigos, livros, podcasts, comunidades e eventos. Sem método próprio.
Leituras que servem ao IT.MK (só pelo título, não li os artigos): "Ruthless Prioritization" (Brandon Chu), "Deadlines" (Brandon Chu), "OKRs and Product Roadmaps" (Roman Pichler), "Product Discovery Basics" (Teresa Torres), "Painless Functional Specifications" (Joel Spolsky), "How to Listen to Customers" (Ken Norton), "Google HEART framework", "AARRR pirate funnel". Livros: Inspired, Escaping the Build Trap, Measure What Matters, The Mom Test, Continuous Discovery Habits, Shape Up, The Mythical Man-Month.
Os outros arquivos do mesmo repositório (`doc_00025` política de IA, `doc_00033` como contribuir, `doc_00062` template de PR, `doc_00031/32` código de conduta, `doc_00040/41/42` licenças, `doc_00043/45/46` CI) são regras do repositório. Sem uso para o IT.MK.

### 1.6 Secure Product Design Cheat Sheet (OWASP) [BASE]
Arquivo: `documentos/doc_00072.md` (e `chunks/doc_00072__chunk_0001..0002`).
O que ensina: desenhar produto seguro desde o começo. 4 princípios: menor privilégio e separação de funções, defesa em camadas, confiança zero, segurança aberta. 5 áreas de foco: contexto, componentes, conexões, código, configuração. Ver seção 7 para o uso no IT.MK.

### 1.7 Quadros do livro lidos por OCR [BASE]
Arquivos `doc_00024` (INVEST), `doc_00026` (pirâmide do backlog), `doc_00027/28` (burndown), `doc_00034` (quadro de delegação), `doc_00059` (backlog), `doc_00068` (plano de versões), `doc_00069` (retrospectiva), `doc_00071` (quadro do ciclo), `doc_00073/74` (backlog do ciclo), `doc_00075` (mapa de partes interessadas), `doc_00076/77` (mapa de histórias, OCR vazio). Os arquivos `doc_00060` (roadmap) e `doc_00061` (quadro de visão) vieram com o texto trocado (mostram o backlog). O desenho certo desses dois está nas páginas `doc_00006` e `doc_00011`. `doc_00039/44/47..58/70/78..86` são capturas de telas de ferramentas (gato de exemplo "Catstagram"). Nada de método.

---

## 2. Técnicas, modelos, quadros e fórmulas

### 2.1 Papel do P.O. [BASE: doc_00005, doc_00064]
- Representa o público, as partes interessadas e o negócio. Meta: maximizar o retorno sobre o investimento.
- Responde por: conteúdo, disponibilidade e ordem do backlog; valor entregue; visão comunicada.
- Dono e autor do backlog. Liga valor de negócio ou de cliente a cada item.
- Descreve a pessoa usuária até a "dor" ficar real (útil quando o time não vê o usuário).
- Conhece concorrentes e mercado. Não refaz o que já existe.
- Aprova ou critica o trabalho antes de liberar. Busca feedback contínuo.
- Confia no time técnico nas decisões técnicas, mas pergunta o porquê.
- Precisa de autoridade e meios para agir. Pode atuar em mais de um time.
- Não é Scrum Master (que cuida do método e dos impedimentos) nem Gerente de Produto.
- Dois olhares ao mesmo tempo: visão de produção (o que o time consegue) e visão das partes interessadas (o que precisam).

### 2.2 Quadro de visão do produto [BASE: doc_00006, doc_00007]
Quadro com 5 caixas, cada uma com uma pergunta:

| Caixa | Pergunta |
|---|---|
| VISÃO | Qual o propósito de criar o produto? (uma frase: o quê e o porquê) |
| PÚBLICO | Qual mercado ou segmento? Quem são clientes e usuários? |
| NECESSIDADES | Por que o cliente precisa? Que benefícios recebe? |
| PRODUTO | Que produto é? O que o destaca? É viável construir? |
| METAS DE NEGÓCIO | Como beneficia a empresa? Quais as metas? |

Pode ganhar colunas: oportunidades de mercado, concorrentes, chegada ao mercado.
Regras:
- Visão = o quê e porquê. Estratégia = como. Roadmap = passos com datas (o P.O. é dono do roadmap).
- Sem frase genérica ("deixar o cliente satisfeito", "criar um app novo").
- Meta mensurável e com prazo (ex.: "aumentar a receita em 40% em um ano").
- Se a visão vier de cima e estiver vaga, o P.O. pede clareza com diplomacia.

**Checklist de validação da visão (4 perguntas sim/não):**
- [ ] É clara, focada e escrita para o público interno?
- [ ] Descreve de forma convincente como atende a necessidade do cliente?
- [ ] Entrega valor alinhado à estratégia e às metas da empresa?
- [ ] A meta é alcançável?
Depois: revisar com partes interessadas e time até todos entenderem. Todos recebem cópia. Quadros ficam visíveis.

### 2.3 Mapa de partes interessadas [BASE: doc_00008, doc_00075]
Grade de 2 eixos: poder (baixo a alto) x interesse (baixo a alto). Quatro quadrantes, lidos da imagem:

| Poder | Interesse | Ação (nome do quadrante) |
|---|---|---|
| Alto | Alto | Gerenciar de perto (Manage Closely) |
| Alto | Baixo | Manter satisfeito (Keep Satisfied) |
| Baixo | Alto | Manter informado (Keep Informed) |
| Baixo | Baixo | Monitorar, esforço mínimo (Monitor) |

Passos: listar todos, pôr cada um na grade, escrever "como vou me engajar" e o canal de comunicação. A forma de falar muda conforme o poder. O patrocinador pode pesar mais que o cliente. O investidor pode ser ouvido primeiro.

### 2.4 Quadro de delegação [BASE: doc_00009, doc_00034]
Para definir quem decide o quê, antes de aparecer conflito. Usa os 7 níveis do Delegation Poker (Management 3.0), lidos do OCR: 1 Dizer (Tell), 2 Vender (Sell), 3 Consultar (Consult), 4 Combinar (Agree), 5 Aconselhar (Advise), 6 Perguntar (Inquire), 7 Delegar (Delegate). Linhas do quadro de exemplo: avaliação de desempenho, novo processo, relatório para partes interessadas, definição de KPIs, metas do time, ferramentas do time, práticas de engenharia, QA, coaching.
As 5 perguntas obrigatórias (quem precisa para...):
1. definir, mudar ou virar a visão do produto?
2. definir, mudar, virar ou remover metas de negócio?
3. incluir, definir, mudar ou remover itens do roadmap?
4. incluir, definir, mudar ou remover itens do backlog?
5. incluir, mudar ou remover pessoas do time?
Uso extra: dá base para dizer "NÃO" a revisões de partes interessadas (doc_00023).

### 2.5 Valor e como priorizar

**Definir valor** [BASE: doc_00010]. Pergunte, junto com as partes interessadas: o que é valioso para (a) o produto, (b) o cliente, (c) o processo de desenvolvimento? Exemplos de tipos de valor: funcionalidade (faz algo útil), confiabilidade (nunca perde a conexão), usabilidade (fácil de usar). O valor muda com tecnologia, mercado e comportamento do cliente. Revisar de tempos em tempos.

**Métricas de valor** [BASE: doc_00063, doc_00065]. Não medir só usuários. Medir receita, retenção, redução de custo. Separar indicador de resultado (atrasado) de indicador de antecipação (adiantado). OKR x KPI. Adoção de funcionalidade. Valor entregue x velocidade.

**Ordem do backlog por valor** [BASE: doc_00015]. Sobe quem tiver:
1. retorno financeiro direto (ligado a ROI);
2. necessidade da parte mais importante;
3. dependência (outros itens esperam por ele);
4. grande impacto;
5. risco e incerteza (aprender cedo).
Se o valor empata, sobe quem tem maior valor/custo. Pareto: 80% do valor vem de 20% do produto. Achar esses 20%.

**Prioridade alta/média/baixa ou MoSCoW** [BASE: doc_00015]:
- Deve (Must): mínimo viável. Sem isso a versão não vale.
- Deveria (Should): importante, mas a versão sobrevive sem.
- Poderia (Could): bom ter.
- Não terá agora (Won't): decidido fora desta versão (registrar, não apagar).
Regra do livro: o próximo item do backlog leva N ciclos; se todos os "deve" e "deveria" ficarem prontos, testados e "Pronto", o time segue para o próximo item.

**Níveis 1 a 5 (dwyl)** [BASE: doc_00064]: 1 só para emergência (sistema fora do ar). 2 = normal mais urgente (primeiro quando não há nível 1). 3 e 4 = intermediários. 5 = ideia ainda não detalhada.

**Pirâmide do backlog** [BASE: doc_00026]: topo = histórias pequenas, detalhadas, prontas para o próximo ciclo. Meio = histórias médias e grandes (talvez dividir). Base = épicos, casos de uso, ideias.

**Valor / custo** [BASE: simples]. Fórmula: `valor ÷ custo`. Dar nota de valor e de custo (1 a 5 ou pontos) e ordenar do maior para o menor quando o valor empata.

**RICE** [COMPL., só citado em doc_00065]. Nota = (Alcance × Impacto × Confiança) ÷ Esforço.
- Alcance: quantas pessoas ou casos por período (ex.: pagadores atendidos por mês).
- Impacto: 0,25 mínimo, 0,5 baixo, 1 médio, 2 alto, 3 enorme.
- Confiança: 100% (dados), 80% (alguma evidência), 50% (palpite).
- Esforço: pessoa-mês (ou pontos). Maior nota sobe.

**WSJF** [COMPL., só citado em doc_00065]. Nota = Custo do atraso ÷ Duração do trabalho. Custo do atraso = valor para negócio/usuário + urgência (tempo) + redução de risco ou abertura de oportunidade. Cada parte em escala relativa (1, 2, 3, 5, 8, 13, 20). Útil para decidir o que fazer primeiro quando tudo parece urgente.

**Kano** [COMPL., não aparece na base]. Separar: básico (esperado, não ter irrita: ex.: valor do boleto correto), de desempenho (quanto mais, melhor: ex.: rapidez do fechamento), encantador (surpreende: ex.: robô que sugere o melhor horário). Garantir os básicos antes dos encantadores.

**Valor x custo em quadro 2x2** [COMPL.]: alto valor/baixo custo = fazer já; alto/alto = planejar; baixo/baixo = encaixar; baixo/alto = descartar.

**Como escolher o método (regra prática, minha)**: poucos itens e decisão rápida = MoSCoW + níveis 1 a 5 (é o padrão do `base-po.md`). Muitos itens disputando = valor/custo ou RICE para ordenar dentro de cada nível. Urgência no tempo = WSJF. Não misturar métodos no mesmo plano. Dizer qual foi usado.

### 2.6 Roadmap [BASE: doc_00010, doc_00011]
Quadro com uma coluna por versão e 5 linhas:

| Linha | Conteúdo |
|---|---|
| DATA | Data ou período da versão |
| NOME | Nome ou número da versão |
| META | Por que esta versão existe |
| FUNCIONALIDADES | O que, em alto nível, é preciso para a meta |
| MÉTRICAS | Como saber se a meta foi atingida |

Regras:
- Versões com data: prazo é obrigatório, mesmo sendo ágil.
- Simples, orientado a metas, mensurável.
- Datas pelo histórico de projetos anteriores. Sem histórico, versões de no máximo 3 meses.
- Entregar com mais frequência traz feedback real.
- É a "história de como o produto cresce": cada versão se apoia na anterior.
- Serve para conversar com desenvolvimento, marketing, vendas e outros.

### 2.7 Histórias, épicos e mapa de histórias [BASE: doc_00011..00013, doc_00064]
- **História**: "Como [persona], quero [o quê], para [por quê]". Pequena unidade de trabalho combinada entre partes interessadas e P.O. Qualquer um pode escrever. Só o P.O. confirma.
- **Épico**: história grande cujo valor só aparece com tudo pronto. Agrupa histórias relacionadas (exemplo do livro: "criar conta" + "recuperar senha" = épico "gerenciar conta").
- **Mapa de histórias**: pôr em post-its metas da versão, funcionalidades, épicos e histórias. Estrutura: versão, funcionalidades, épicos, histórias. Dois níveis de visão: uma versão ou todas as versões do roadmap.
- **Oficina de escrita de histórias** com time e partes interessadas.
- **Plano de versões**: tabela simples de qual versão leva quais histórias e quanto tempo. Exemplo do livro (`doc_00068`): colunas = ciclos com datas (Sprint 1: 6 a 19/set, Sprint 2: 20/set a 3/out ...), linhas = épicos E101..E109 agrupados em Release 1, 2, 3, com marcos "Targeted Release" e "Production Deploy". Estimar com a velocidade (2.11).
- **Teste de história boa** (checklist):
  - [ ] Tem quem, o quê e por quê.
  - [ ] Cabe em um ciclo (senão é épico: dividir).
  - [ ] Tem valor visível para quem usa.
  - [ ] Tem critérios de aceite em caixas.

### 2.8 Backlog e item bem escrito [BASE: doc_00014..00016, doc_00064]
- Lista ordenada, viva, nunca completa. Existe enquanto o produto existir. Recebe novidades, ajustes e correções de cada versão.
- Todo item: ID, história, ordem (prioridade), estimativa, "Pronto". Quadro do livro: colunas ID, História, Ordem, Estimativa, Pronto.
- Topo mais claro e detalhado. Itens não validados embaixo.
- Antes do planejamento: o P.O. age como pesquisador de usuário (ou pede ao pesquisador) e deriva itens do roadmap/mapa de histórias com o resultado da pesquisa.
- O P.O. escreve os itens com as próprias palavras. Motivos: sabe o que tem, evita suposição de terceiros, treina a ferramenta, valida tudo de primeira mão.
- **Modelo do item (3 partes + extras)**:
  1. História (quem, o quê, por quê).
  2. Critérios de aceite (caixas que o dev marca).
  3. Desenho ou captura (celular e computador; para bug: tela do erro).
  4. Extras úteis: link ao guia de estilo, dependências, número do item, prioridade, estimativa.
- Exemplo do dwyl: um critério pode apontar para o guia de estilo ("botão apagar segue o padrão do guia"). Serve ao IT.MK com `tokens.css`.
- **Fonte única da verdade**: um só lugar mostra o estado real. Duas listas atrasam e divergem.

### 2.9 Critérios de aceite e INVEST [BASE: doc_00016, doc_00024]
O P.O. define os critérios. Eles tiram a ambiguidade e dão o que será testado.
INVEST (tabela do livro):

| Letra | Significa | Pergunta de checagem |
|---|---|---|
| I | Independente | Dá para fazer sem depender de outra história? |
| N | Negociável | O detalhe pode ser conversado e mudado até entrar no ciclo? |
| V | Valioso | Entrega valor ao usuário final? |
| E | Estimável | O time consegue estimar? |
| S | Pequeno (Small) | Cabe em um ciclo, é possível planejar e priorizar com certeza? |
| T | Testável | Tem informação suficiente para escrever o teste? |

Boas práticas [COMPL., formato comum]: critérios como caixas verificáveis, cada um com resultado sim/não. Dá para usar "Dado... Quando... Então..." quando houver regra de negócio. Evitar palavras vagas ("rápido", "bonito"). Pôr número ("responde em até 2 s").

### 2.10 Definição de Pronto [BASE: doc_00018, doc_00019, doc_00023]
- Feita pelo time. Confirmada pelo P.O. e Scrum Master. Vários times no mesmo produto = uma definição comum.
- Exemplo do livro: compila sem avisos; teste de unidade feito; QA sem bugs; versão subida ao repositório.
- Lição da dívida técnica: se a entrega tem bug conhecido, ela NÃO está pronta. O item fica no backlog e "corrigir os bugs" entra no ciclo seguinte. Por isso a definição inclui "sem bugs".
- Item só recebe "Pronto" se cumprir a definição.

### 2.11 Ciclos, estimativa e acompanhamento [BASE: doc_00016..00021]
**Ciclo (sprint)**: 1 a 4 semanas (dwyl: 1 a 3; 2 semanas é comum). Tem meta e entrega usável e pronta. O P.O. pode cancelar se a meta ficar obsoleta (custo alto: o novo ciclo recomeça). Itens prontos são revisados, incompletos voltam ao backlog reestimados. Pelo menos a cada mês inspecionar e adaptar.

**Planejamento**
- Duração máxima 8 h para ciclo de 1 mês. Duas perguntas: o que pode ser entregue? como?
- Entradas: backlog, última entrega, capacidade prevista, desempenho passado. Saídas: meta do ciclo, pontos, backlog do ciclo.
- Parte 1: o time estima. Parte 2: o time escolhe o que cabe (a meta nasce da escolha) e quebra em tarefas.
- Quadro do ciclo: A fazer, Em andamento, Em QA, Pronto. Linhas = itens com tarefas (t.3.1, t.3.2...).

**Planning Poker**
1. O P.O. lê o item.
2. O time discute.
3. Todos mostram a carta ao mesmo tempo (1, 2, 3, 5, 8, 13, 20). São pontos de história, não horas nem dias.
4. Se diferem, discutir de novo e repetir até igualar.
Quem estima é o time, não o P.O.

**Fórmulas de acompanhamento**
- Velocidade = soma dos pontos "Pronto" no ciclo. Medida depois do ciclo. Oscila cerca de ±10%.
- Burndown do ciclo = pontos restantes ao longo dos dias (acompanha o time). Burndown do produto = pontos restantes do backlog ao longo dos ciclos (acompanha o P.O.).
- Previsão de versão [COMPL., conta direta]: nº de ciclos = pontos do que falta ÷ velocidade média. Dar faixa (±10%).
- O P.O. confere a velocidade a cada revisão, para ajustar o plano de versões.

**Refinamento do backlog** (grooming): editar ordem e estimativa, rever detalhes com o time. No máximo 10% da capacidade do time. Costuma ser no meio do ciclo.

**Revisão do ciclo** (informal, time + partes interessadas, até 4 h para 1 mês): P.O. diz o que ficou Pronto; time conta o que deu certo, problemas e soluções; demonstração; P.O. mostra o backlog atual e fala da data de entrega pelo andamento; todos olham o que fazer a seguir, condições de negócio, prazo, orçamento e mercado. Saída: backlog atualizado.

**Retrospectiva** (só o time, depois da revisão, até 3 h): como foi em pessoas, relações, processo e ferramentas; melhorias possíveis; plano para aplicá-las. Quadro do livro com 4 colunas: Foi bem / Foi mal / Devemos fazer / Não devemos fazer.

### 2.12 Bug x melhoria e ciclo de vida do item [BASE: doc_00064]
- Ciclo: criado pelo P.O., priorizado, em andamento, "pronto para testar", P.O. testa, aceito ou volta.
- **Bug** = critério de aceite não cumprido (ex.: esqueceu o último título; e-mail prometido não saiu).
- **Melhoria** = mudar de ideia, ajustar o desenho, pedir extra. Vira **item novo**, nunca pendurado no antigo.
- Por quê: mudanças pequenas se somam; o título deixa de refletir o conteúdo; a estimativa do dev quebra; o escopo extra empurra outro item para fora sem decisão.
- **Relato de bug**: caminho até o erro; quem estava logado; o que tentava fazer; aparelho e navegador; imagem.
- Bug não é desculpa para esconder mudança de escopo.

### 2.13 Testes, ambiente e entrega [BASE: doc_00064]
- **Staging**: cópia interna do sistema real onde se testa antes de publicar. Não é público.
- **Telas**: testar com tamanhos padrão de aparelhos (celular, tablet, computador) e citar o aparelho no relato ("cortado no iPhone 6").
- **Entrega**: não entregar na sexta. Não começar ciclo de 10 dias na segunda (acabaria na sexta, com demonstração e entrega juntas). Demonstrar só o que ficou pronto até horas antes. P.O. e Scrum Master marcam com antecedência.

### 2.14 Dívida técnica e tamanho do time [BASE: doc_00023, doc_00064]
- Dívida técnica: custo de refazer porque foi feito às pressas (falta de capacidade, falta de experiência, pressão de prazo, desânimo). Cresce com juros. Pode custar mais corrigir depois do que fazer certo.
- Responsabilidade do time técnico (par de programadores, refatoração, integração contínua, testes automáticos). O P.O. ajuda: não lotar o ciclo antes do prazo e saber dizer "não". A estimativa já deve incluir a dívida.
- Diferente de melhoria que só se soube depois (aprendizado), que vira item novo.
- **Lei de Brooks**: gente nova no fim atrasa (aprender, revisar, conflito de código). Melhor momento para o time inteiro começar é a ideação.

### 2.15 Cerimônias (resumo de tempos, ciclo de 1 mês) [BASE]
| Cerimônia | Quem | Duração máxima | Saída |
|---|---|---|---|
| Planejamento | Time scrum | 8 h | Meta, pontos, backlog do ciclo |
| Diário (stand-up) | Time | curto (não detalhado no livro) | Impedimentos aos Scrum Master |
| Refinamento | P.O. + time | ≤ 10% da capacidade | Backlog ordenado e estimado |
| Revisão | Time + partes interessadas | 4 h | Backlog atualizado |
| Retrospectiva | Só o time | 3 h | Plano de melhoria |
Para ciclos menores, os tempos diminuem de forma proporcional.

### 2.16 Comunicação com partes interessadas [BASE + COMPL.]
- Mapa de partes interessadas define o tom e a frequência (2.3).
- Quadro de delegação define quem decide (2.4). Use quando houver pedido que mude visão, meta, roadmap ou backlog.
- Conflito de prioridades [BASE doc_00063/65 só cita]: usar mapa, quadro de delegação, valor e custo.
- Tudo visível: quadros e gráficos à vista de todos.
- Relatório curto, com números e prazos: o que ficou pronto, o que muda, o que depende de decisão.
- Dizer "não" com motivo: fora da visão, fora da meta, custo maior que valor, empurra outro item, quem decide é outro (quadro de delegação). Oferecer o caminho: "vira item novo com prioridade X".

### 2.17 Métricas, OKR e KPI [BASE só cita; COMPL. para o formato]
- **OKR** (objetivo e resultados-chave): 1 objetivo inspirador + 2 a 5 resultados mensuráveis com prazo. Mede resultado, não tarefa. Exemplo: Objetivo "cobrança previsível"; RC1: "reduzir inadimplência de X% para Y% até dezembro".
- **KPI**: número contínuo de saúde (ex.: % recebido no mês). Não tem prazo de entrega.
- **Indicador de resultado** (atrasado): receita recebida. **De antecipação** (adiantado): nº de contatos feitos, promessas de pagamento no prazo.
- **Adoção de funcionalidade**: quantas pessoas usam o recurso novo.
- **Valor entregue x velocidade**: pontos feitos não provam valor. Ligar cada versão a uma métrica da linha MÉTRICAS do roadmap.
- Dados citados na base: Google HEART e funil AARRR (só título na lista, `doc_00067`).

### 2.18 Erros comuns e sinais de fracasso [BASE]
- Visão genérica. Meta sem número ou sem prazo.
- Roadmap sem datas ("somos ágeis"). Prazo grande demais sem feedback.
- Backlog sem dono, sem ordem, ou em dois lugares.
- Item sem critério de aceite, ou com critério ambíguo.
- Melhoria disfarçada de bug. Item que cresce sem parar.
- Estimar pelo P.O. em vez do time. Estimar em horas e não em pontos relativos.
- Lotar o ciclo para "cumprir prazo" (gera dívida técnica).
- Entregar na sexta. Mostrar na demonstração algo feito minutos antes.
- Ignorar feedback e dados. Não saber dizer "não". Não se adaptar.
- Aumentar a equipe no fim do projeto.
- Cancelar ciclo sem necessidade (desperdício).
- Cuidar só do que as partes interessadas pedem e esquecer o que o time consegue (e o contrário).

### 2.19 Rotina e ferramentas do P.O. [BASE: doc_00063, doc_00065]
- Tarefas: análise de concorrência, entrevistas com usuários, roadmap e histórias, critérios de aceite, priorização, desenhos com o designer, testes com o dev, métricas, relatório às partes interessadas.
- Ferramentas citadas: Notion, Trello, Productboard, Jira, ClickUp, GitHub Projects, Miro, Figma, Google Workspace, Hotjar, Google Analytics. Para OKR: Tability. Para feedback: LogChimp, Hellonext, Screeb.
- IA no trabalho do P.O.: analisar feedback de usuários, organizar o backlog, sugerir casos de teste. Sempre revisar o texto antes de usar (a própria política de IA do repositório `doc_00025` pede revisão humana).
- Escolha de ferramenta é detalhe. O que conta é ter uma fonte única da verdade.

---

## 3. Modelos prontos (copiar e preencher)

### 3.1 Item de backlog (BL-xx)
```
BL-xx  Título curto
Épico: ...     Frente: Frontend | Backend | Database | Integrações     Versão: V...
Prioridade: Deve|Deveria|Poderia|Não agora   Nível: 1-5   Estimativa: pontos
História: Como [papel], quero [o quê], para [por quê].
Critérios de aceite:
 [ ] ...
 [ ] ...
 [ ] Visão única, sem espaço vazio, sem barra horizontal, cores só de tokens.css
Desenho: [celular] [computador]  (link da prévia)
Depende de: BL-..    Valor: ...    Risco: ...
Pronto quando: definição de pronto (seção 4)
```

### 3.2 Relato de bug
```
Título: ...
Caminho até o erro: ...
Quem estava logado: ...   O que tentava fazer: ...
Aparelho e navegador (ou largura de tela): ...
Esperado (critério de aceite quebrado: BL-xx): ...
Imagem: ...
```

### 3.3 Roadmap (por versão)
`Data | Nome | Meta | Funcionalidades | Métricas` (seção 2.6).

### 3.4 Registro de decisão com partes interessadas
`Pedido | Quem pediu | Quem decide (quadro de delegação) | Decisão | Item criado (BL-xx) | Data`.

### 3.5 Revisão do ciclo (pauta de 1 página)
Prontos (IDs) / Não prontos e motivo / Demonstração / Backlog atual / Data de entrega prevista / Próximos passos / Mudanças pedidas (viram itens novos).

---

## 4. Definição de Pronto sugerida para o IT.MK (a partir da base + CLAUDE.md)
- [ ] Todos os critérios de aceite marcados.
- [ ] Sem bugs conhecidos.
- [ ] Testado nas larguras de computador, tablet e celular, sem barra horizontal e sem espaço vazio.
- [ ] Cores e medidas só de `prototipo/css/tokens.css`.
- [ ] Visão única: nenhum texto "diretor", "CEO" ou "colaborador"; nada repetido na tela.
- [ ] Texto longo quebra linha dentro do espaço.
- [ ] Prévia publicada e link enviado ao dono.
- [ ] Testado em ambiente de teste (staging) antes de ir para o real.
- [ ] Não entregue na sexta-feira.
Observação: a definição final é do time (base). Esta é proposta para o dono e o time aprovarem.

---

## 5. Como aplicar ao IT.MK (exemplos concretos)

Contexto: sistema de cobrança da consultoria de marketplaces da empresa 40%. Cliente em Java + JavaFX + CSS + Spring. Banco Supabase/Postgres. Frentes do CicloDev: Frontend, Backend, Database, Integrações. O desenho aprovado está em `prototipo/`.
Os exemplos abaixo são sugestões de método. Os números e datas são ilustrativos. Não são dados reais do IT.MK.

### 5.1 Quadro de visão do IT.MK (exemplo)
- Visão: "Cobrar a consultoria dos marketplaces sem perder nenhum recebimento, em uma tela única e clara."
- Público: analista de cobrança, consultor, dono. (Sem perfis separados na tela: visão única.)
- Necessidades: saber quanto cada pagador deve, quando fechar o mês, quem está atrasado, o que o robô já fez.
- Produto: 9 módulos (Dashboard, Conversas, Pagadores e Lojas, Marketplaces, Fechamento do mês, Recebimentos, Inadimplência e Acordos, Robô de cobrança, Configurações).
- Meta de negócio (exemplo para o dono definir): "reduzir a inadimplência de X% para Y% até [data]" e "fechar o mês em até N dias úteis".
- Validar com as 4 perguntas (2.2).

### 5.2 Mapa de partes interessadas (exemplo, a confirmar com o dono)
| Quem | Poder | Interesse | Ação |
|---|---|---|---|
| Dono / empresa 40% | Alto | Alto | Gerenciar de perto: revisão a cada ciclo, prévia sempre publicada |
| Analista de cobrança (usa todo dia) | Médio | Alto | Manter informado e ouvir: entrevista, teste da prévia |
| Consultores | Baixo | Alto | Manter informado: aviso das novidades |
| Pagadores / lojas | Baixo | Baixo (indireto) | Monitorar: efeito do robô e das mensagens |
| Marketplaces (regras de repasse, API) | Alto | Baixo | Manter satisfeito: não quebrar integração |
| Time técnico (JavaFX, Spring, Supabase) | Médio | Alto | Co-decide estimativa e dívida técnica |
Não usar "diretor/CEO/colaborador" na interface. No mapa interno do P.O. pode haver papéis reais, mas a tela é única.

### 5.3 Quadro de delegação (sugestão)
| Decisão | Quem decide | Nível |
|---|---|---|
| Visão e meta do IT.MK | Dono | Dizer/Vender |
| Roadmap e datas | P.O., com o dono | Consultar |
| Ordem do backlog | P.O. | Dizer |
| Como construir (Java/Spring/Supabase) | Time técnico | Delegar |
| Estimativa em pontos | Time | Delegar |
| Identidade visual | `tokens.css` fechado; mudança só com aprovação do dono | Combinar |
| Regra de cobrança (juros, prazos, mensagem do robô) | Dono, após consulta | Consultar |

### 5.4 Valor por módulo (exemplos de métrica)
| Módulo | Valor | Como medir |
|---|---|---|
| Dashboard | Ver tudo de uma vez (R$, filas, contagens, rankings) | Tempo para achar um número; uso por dia |
| Conversas | Histórico único com o pagador | % de conversas com retorno em até N horas |
| Pagadores e Lojas | Cadastro correto | Cadastros sem erro; duplicados |
| Marketplaces | Dados de cada canal ligados | % de lojas ligadas ao marketplace certo |
| Fechamento do mês | Fechar rápido e sem erro | Dias para fechar; diferenças encontradas |
| Recebimentos | Saber o que entrou | % conciliado; tempo para conciliar |
| Inadimplência e Acordos | Recuperar atraso | R$ recuperado; acordos cumpridos |
| Robô de cobrança | Cobrar sem esforço manual | Contatos/dia; promessas obtidas; reclamações |
| Configurações | Ajustar regras sem código | Alterações feitas sem chamar o time |

### 5.5 Roadmap em versões (esqueleto; datas e metas a definir com o dono)
Se não houver histórico de velocidade, versões de no máximo 3 meses.
| Versão | Meta | Funcionalidades | Métrica |
|---|---|---|---|
| V1 "Base" | Cadastro e visão geral confiáveis | Pagadores e Lojas, Marketplaces, Dashboard | Dados batendo com a planilha atual |
| V2 "Fechamento" | Fechar o mês sem planilha | Fechamento do mês, Recebimentos | Dias para fechar |
| V3 "Cobrança" | Tratar atraso | Inadimplência e Acordos, Conversas | R$ recuperado |
| V4 "Robô" | Cobrar sozinho com segurança | Robô de cobrança, Configurações | Contatos automáticos e reclamações |
A ordem acima é hipótese. Depende de dependências reais: Pagadores e Lojas antes de tudo; Fechamento antes de Recebimentos conciliados; Robô por último (risco maior, ver 7).

### 5.6 Épico e histórias (exemplo: Fechamento do mês)
Épico: "Como analista de cobrança, quero fechar o mês, para saber o que cobrar de cada pagador."
Histórias:
- BL-01 Como analista, quero ver a lista de pagadores com valor devido no mês, para conferir antes de fechar. (Deve, nível 2)
- BL-02 Como analista, quero marcar o mês como fechado, para travar os valores. (Deve, nível 2)
- BL-03 Como dono, quero ver o total fechado em R$ na visão geral, para acompanhar a receita. (Deveria, nível 3)
- BL-04 Como analista, quero reabrir um mês com motivo registrado, para corrigir erro. (Poderia, nível 4)
Critérios de aceite de BL-01 (exemplo):
- [ ] Mostra pagador, loja, marketplace, valor em R$ e situação.
- [ ] Texto longo de nome de loja quebra linha dentro da célula.
- [ ] Em 360 px não aparece barra horizontal.
- [ ] Linhas ocupam toda a largura, sem espaço vazio.
- [ ] Cores vêm de `tokens.css`.
- [ ] Desenho de computador e celular anexo.

### 5.7 Priorização (exemplo com valor/custo e RICE)
Itens candidatos: A) importar recebimentos do banco; B) lembrete automático de vencimento; C) ranking de inadimplentes no Dashboard.
| Item | Alcance/mês | Impacto | Confiança | Esforço | RICE |
|---|---|---|---|---|---|
| A | 200 | 2 | 80% | 3 | (200×2×0,8)÷3 = 107 |
| B | 150 | 1 | 80% | 1 | (150×1×0,8)÷1 = 120 |
| C | 50 | 1 | 100% | 0,5 | (50×1×1)÷0,5 = 100 |
(Números inventados só para mostrar a conta.) Ordem: B, A, C. Mesmo assim, aplicar dependência: se B precisa de A, A sobe.
MoSCoW por versão: "Deve" = fechamento correto; "Deveria" = ranking; "Poderia" = exportar; "Não agora" = integração com marketplace X.

### 5.8 Níveis 1 a 5 no IT.MK
- 1: sistema fora do ar, cobrança errada saindo para pagador, robô mandando mensagem errada, dado financeiro exposto.
- 2: próximo item do ciclo atual.
- 3 e 4: versão seguinte.
- 5: ideia ainda sem desenho (ex.: "robô por voz").
Quando houver nível 1, para tudo e trata.

### 5.9 Bug x melhoria no IT.MK
- Bug: tela do Fechamento tem barra horizontal em 360 px (critério "sem barra horizontal" quebrado) → volta para o mesmo item.
- Melhoria: "trocar a cor do botão" ou "colocar mais uma coluna" depois do aceite → item novo BL-xx, com prioridade própria, mesmo se pequeno.
- Cada ajuste visual: nova prévia publicada e link enviado ao dono (regra do CLAUDE.md).

### 5.10 CicloDev e itens completos
- Item completo no CicloDev = história + critérios de aceite + desenho + prioridade + estimativa (igual ao modelo 3.1).
- Um item pode ter partes em frentes diferentes. Exemplo "Importar recebimentos": Frontend (tela), Backend (Spring, regra de conciliação), Database (tabela no Supabase), Integrações (arquivo ou API do banco). Criar um item pai (épico) e filhos por frente, cada um com critério próprio. Assim cada filho é pequeno (INVEST) e dá para estimar.
- Ciclo de 2 semanas é comum. Meta do ciclo em uma frase ("fechar o mês 1 ponta a ponta na tela").
- Planejamento: time estima em pontos (Planning Poker). Escolhe o que cabe pela velocidade dos últimos ciclos. Sem histórico nos primeiros ciclos: começar pequeno e medir.
- Refinamento no meio do ciclo, até 10% da capacidade.
- Revisão: mostrar a prévia (`prototipo/`) e o que está pronto. Retrospectiva: só o time.
- Não entregar na sexta; não começar ciclo de 10 dias na segunda.

### 5.11 Dívida técnica no IT.MK (pontos de atenção)
- Cada tela do protótipo HTML será refeita em JavaFX com as mesmas cores e medidas. Pular teste ou copiar CSS sem passar por `tokens.css` gera dívida.
- Se uma tela sair com bug conhecido, ela não está pronta: fica no backlog, "corrigir bugs" entra no ciclo seguinte.
- Estimar já considerando migração HTML para JavaFX. Evitar encher o ciclo perto de prazo.
- Evitar colocar gente nova no meio de uma versão (Lei de Brooks).

### 5.12 Como acompanhar (fonte única)
- Escolher UM lugar para o estado real do backlog (por exemplo o repositório do projeto ou a ferramenta do CicloDev). Não manter duas listas.
- Painel mínimo: itens por status (criado, priorizado, em andamento, pronto para testar, aceito), burndown do ciclo, burndown do produto, velocidade, bugs abertos, próxima data de entrega.
- Marcos do roadmap com data visível para o dono.

---

## 6. Plano de versões, riscos e o que não foi verificado (modelo para cada plano)

Checklist para fechar qualquer plano (resumo do `base-po.md` seção 10):
1. Visão e meta (frase, número, prazo).
2. Quem é afetado e quem decide.
3. Valor (cliente, empresa, processo) e como medir.
4. Roadmap em versões com data.
5. Épicos e histórias.
6. Critérios de aceite + desenho de computador e celular.
7. Prioridade (MoSCoW, níveis 1 a 5) e ordem (valor, dependência, risco, custo).
8. Plano de versões e Definição de Pronto.
9. Riscos, dívida técnica, o que não foi verificado.
10. Como acompanhar.

Riscos típicos para citar nos planos do IT.MK (hipóteses, confirmar):
- Dados de pagamento e contato dos pagadores (sensível, ver 7).
- Integração com marketplaces muda sem aviso (API, regras de repasse).
- Robô cobra errado ou na hora errada.
- Regra de fechamento ainda não escrita por completo.
- Equipe pequena: um desligamento atrasa tudo.
- Estimativa sem histórico: margem larga nos primeiros ciclos.

Sempre escrever: "Não verificado: ..." quando faltar dado. Não inventar número.

---

## 7. Segurança desde o desenho (OWASP) aplicada ao IT.MK [BASE: doc_00072]
Útil porque o IT.MK guarda dados financeiros e fala com pagadores.
- **Menor privilégio e separação de funções**: cada usuário vê só o necessário. Nota: no IT.MK a tela é única e completa para quem entra. A segurança fica no acesso ao sistema (login, banco) e não em perfis diferentes de tela. Decisão do dono: confirmar antes de criar qualquer regra de acesso.
- **Defesa em camadas**: validar no cliente JavaFX, no Spring e no banco (Supabase/Postgres).
- **Confiança zero**: toda chamada ao backend e ao banco é autenticada e autorizada, mesmo vinda de dentro.
- **Cinco áreas de foco** como checklist de item (contexto, componentes, conexões, código, configuração):
  - [ ] Contexto: que dado o módulo guarda e qual o risco? (valor devido, contato do pagador)
  - [ ] Componentes: bibliotecas e serviços externos (licença, manutenção).
  - [ ] Conexões: de onde vem e para onde vai o dado; onde fica guardado.
  - [ ] Código: validar entrada; tratar erro sem expor dado; sem senha ou chave no código; testes; revisão.
  - [ ] Configuração: padrão seguro, dados cifrados em trânsito (HTTPS) e em repouso, backup e retenção, plano de resposta a incidente.
- Modelagem de ameaças vira histórias de segurança no ciclo (ex.: "como dono, quero que a chave do banco nunca fique no código, para não vazar").
- Para o robô: caso de abuso ("e se alguém forçar o robô a enviar mensagem a todos?") e limite de envio por hora.

---

## 8. Lacunas e cuidados desta base
- A base não explica RICE, WSJF, Kano, OKR, story points além de Fibonacci, nem faixas de tamanho de time além de "até 9". As explicações dessas técnicas aqui são conhecimento geral [COMPL.]. Validar com o dono.
- Os desenhos (quadros, mapas, burndown) só vieram como OCR com erros. As formas foram reconstruídas pelas páginas do livro e pelo texto do README.
- Os arquivos `doc_00060` e `doc_00061` têm o texto trocado (mostram o backlog em vez do roadmap e da visão). Usar `doc_00006` e `doc_00011`.
- Mapa de histórias (`doc_00076/77`) veio sem texto.
- As leituras da lista awesome (artigos, livros) só foram lidas pelo título.
- Guias Tiwari e Ezzelrgal são superficiais. Não tratar como autoridade.
- Nada na base sobre cobrança, inadimplência ou marketplaces. Exemplos do IT.MK são ilustrações, não dados.
- Não há na categoria método de descoberta de produto (entrevistas, testes de protótipo) além de citações. Se for necessário, buscar em outra categoria.

---

## 9. Tabela de fontes (caminho relativo a `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/p-o-produto/`)

| Assunto | Caminho | Use para |
|---|---|---|
| Índice e resumo da categoria | `indice.md`, `categoria_resumo.md`, `README.md` | Ver a lista de materiais |
| Livro: capa, índice | `documentos/p-o-produto__doc_00001.md` a `doc_00004.md` | Ver a ordem dos 14 passos |
| Papel do P.O., time | `documentos/p-o-produto__doc_00005.md` | Seção 2.1 |
| Visão, estratégia, validação | `documentos/p-o-produto__doc_00006.md`, `doc_00007.md` | Seção 2.2 |
| Partes interessadas | `documentos/p-o-produto__doc_00008.md`, `doc_00075.md` (OCR da grade) | Seção 2.3 |
| Quadro de delegação | `documentos/p-o-produto__doc_00009.md`, `doc_00034.md` (OCR) | Seção 2.4 |
| Valor, roadmap (início) | `documentos/p-o-produto__doc_00010.md` | Seções 2.5 e 2.6 |
| Roadmap (quadro), histórias | `documentos/p-o-produto__doc_00011.md` | Seções 2.6 e 2.7 |
| Épicos, mapa de histórias | `documentos/p-o-produto__doc_00012.md`, `doc_00013.md`, `doc_00076.md`, `doc_00077.md` | Seção 2.7 |
| Plano de versões (exemplo) | `documentos/p-o-produto__doc_00068.md` | Seção 2.7 |
| Backlog, MoSCoW, valor/custo, Pareto | `documentos/p-o-produto__doc_00014.md`, `doc_00015.md`, `doc_00026.md`, `doc_00059.md` | Seções 2.5 e 2.8 |
| Critérios de aceite, INVEST | `documentos/p-o-produto__doc_00016.md`, `doc_00024.md` | Seção 2.9 |
| Ciclo, planejamento, Planning Poker | `documentos/p-o-produto__doc_00016.md`, `doc_00017.md`, `doc_00018.md`, `doc_00073.md`, `doc_00074.md`, `doc_00071.md` | Seção 2.11 |
| Definição de Pronto | `documentos/p-o-produto__doc_00018.md`, `doc_00019.md` | Seção 2.10 |
| Burndown, velocidade | `documentos/p-o-produto__doc_00019.md`, `doc_00020.md`, `doc_00021.md`, `doc_00027.md`, `doc_00028.md` | Seção 2.11 |
| Refinamento, revisão, retrospectiva | `documentos/p-o-produto__doc_00021.md`, `doc_00022.md`, `doc_00069.md` | Seção 2.11 |
| Dívida técnica | `documentos/p-o-produto__doc_00023.md` | Seção 2.14 |
| Livro completo em um arquivo | `documentos/p-o-produto__doc_00066.md` | Consulta rápida |
| Guia dwyl (backlog, bug x melhoria, entrega, Brooks) | `documentos/p-o-produto__doc_00064.md` | Seções 2.8, 2.12 a 2.14 |
| Guia Tiwari (rotina do PM) | `documentos/p-o-produto__doc_00063.md` | Seção 2.19 |
| Roadmap de estudo do P.O. | `documentos/p-o-produto__doc_00065.md` | Nomes: MoSCoW, WSJF, RICE, OKR |
| Lista awesome (ferramentas, leituras) | `documentos/p-o-produto__doc_00067.md` | Leituras e ferramentas |
| Segurança de produto (OWASP) | `documentos/p-o-produto__doc_00072.md` | Seção 7 |
| Quadro de visão (desenho original) | `documentos/p-o-produto__doc_00006.md` (texto do quadro) | Seção 2.2 |
| Regras do repositório awesome (ignorável) | `doc_00025`, `doc_00031`, `doc_00032`, `doc_00033`, `doc_00062` | Sem uso |
| Licenças, CI, CSS, `.DS_Store`, GIFs de ferramentas (ignorável) | `doc_00029`, `doc_00030`, `doc_00035` a `doc_00038`, `doc_00039`, `doc_00040` a `doc_00058`, `doc_00070`, `doc_00078` a `doc_00086` | Sem uso |

Documentos do projeto relacionados: `/home/user/MK/docs/base-po.md` (resumo de método do dono), `/home/user/MK/CLAUDE.md` (regras), `/home/user/MK/docs/kb-mapa.md` (mapa das bases).
