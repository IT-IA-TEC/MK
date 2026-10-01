# Manual de consulta 02: Ágil e métodos (para montar planos do IT.MK)

Para quem é: o P.O. do IT.MK. Serve para montar plano, backlog, estimativa, versões e critérios de aceite sem reler os livros.
Fonte: categorias `desenvolvimento-agil` (3.046 páginas, 12 livros) e `metodologias-ageis-avancadas` (1.377 páginas, 4 livros).
Caminho-base: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/` (somente leitura).
Não existe pasta `livros/` nesta cópia. Cada página de livro é um arquivo `documentos/<categoria>__doc_NNNNN.md` (o `chunks/` repete o mesmo texto). A tabela da seção 7 diz qual faixa de arquivos é de cada livro.

Legenda de confiança:
- **[BASE]** = está escrito nos livros lidos (cito o livro).
- **[COMPL.]** = conhecimento geral que a base só cita ou não detalha. Confirmar com o dono antes de virar regra.
- **[EXEMPLO]** = exemplo inventado para ilustrar. NÃO é dado do IT.MK. Regras de negócio reais precisam ser confirmadas com o dono.

Regra de ouro (já vale no IT.MK): todo plano segue a seção 10 de `docs/base-po.md` e o `CLAUDE.md` (visão única, sem espaço vazio, sem barra horizontal, cores só em `tokens.css`, publicar a prévia e mandar o link). Este manual só dá os métodos por trás de cada passo.

Aviso sobre a leitura: o texto da base vem de PDF/OCR. Alguns livros têm letras trocadas ou espaços sumidos (Scrum Casa do Código e Scrum 360 são os piores). Conferi o sentido, não copiei trechos. Para citar algo literal, abra o arquivo.

---

## 1. Resumo por livro

Ordem: do mais útil ao P.O. para o menos útil.

### 1.1 Agile Estimating and Planning (Mike Cohn) [BASE]
- O que é: o livro de referência de estimar e planejar em ágil. 23 capítulos.
- Ideias centrais: planejar é buscar valor (o que construir, com quais recursos, até quando), não só produzir um plano. Estimativa antiga é muito incerta ("cone da incerteza": no começo o erro pode ir de 60% a 160%). Plano bom é o confiável o bastante para decidir. Planeja-se em 3 níveis: versão (3 a 6 meses), ciclo (1 a 4 semanas) e dia.
- Estimar: pontos de história (tamanho relativo) ou dias ideais. Cohn prefere pontos. Tempo é derivado: pontos totais ÷ velocidade.
- Priorizar: valor financeiro, custo, aprendizado e risco removido (4 fatores). Análise Kano (obrigatório, linear, encantador). Dividir história grande (por dado, por operação CRUD, por prioridade) e nunca por tarefa técnica.
- Velocidade: regra tudo-ou-nada (história pela metade vale zero). Mostrar como faixa, não número único. Burndown de versão e de ciclo. Colchão (buffer) de escopo e de prazo.
- Vários times: mesma unidade de estimativa, "condições de satisfação" da história, plano de olhar à frente de 2 a 3 ciclos.
- Onde ler: capítulos 1 a 3 (por que planejar), 4 a 8 (estimar), 9 a 12 (valor e divisão), 13 a 17 (versão, ciclo, velocidade, colchão), 19 a 21 (acompanhar e comunicar).

### 1.2 Agile Project Management with Scrum (Ken Schwaber) [BASE]
- O que é: Scrum contado por casos reais de empresas (bancos, energia, fundos). Edição de 2004: ciclo de 30 dias.
- Ideias centrais: Scrum é controle empírico (visibilidade, inspeção, adaptação). "Pronto" tem que significar a mesma coisa para todos, senão a visibilidade é falsa. Product Owner cuida do valor e do backlog. ScrumMaster protege o time e faz cumprir as regras.
- Apêndice A (regras) é a melhor parte para consulta: tempos máximos das reuniões, quem pode falar, o que não pode mudar no meio do ciclo.
- Casos úteis: "estimativa preliminar vista como contrato" (banco), falar a língua do negócio em vez do jargão, relatar progresso por requisito e não por tarefa, retrospectiva que vira item no backlog.
- Onde ler: Apêndice A (regras) e B (definições), capítulo 1 (empírico), capítulos 5 a 7 (PO, planejamento, relatório).

### 1.3 Scrum: Gestão ágil para projetos de sucesso (Rafael Sabbagh, Casa do Código) [BASE]
- O que é: o manual de Scrum mais completo em português da base (355 páginas). Texto de OCR ruim, mas legível.
- Ideias centrais: Product Backlog ordenado, planejável, emergente e detalhado aos poucos. Estimativa com pontos de história e Planning Poker. Definição de Pronto (acordo formal) e Definição de Preparado (acordo para o item entrar no ciclo). História de usuário com 3 C (Cartão, Conversa, Confirmação) e INVEST. Critérios de aceite viram testes de aceite com exemplos.
- Diferencial: explica precisão x acurácia de estimativa, ancoragem no Planning Poker, e diz que os próprios criadores dos pontos hoje preferem itens pequenos (2 a 3 dias) e contar itens.
- Onde ler: capítulos "Product Backlog" (docs 02494 a 02514), "Definição de Pronto" (02534 a 02538), "Definição de Preparado" (02567 a 02572), "Burndown" (02566).

### 1.4 Scrum 360 (Jorge Audy, Casa do Código) [BASE]
- O que é: guia prático de Scrum e agilidade, curto e com muita experiência de campo. 10 capítulos.
- Ideias centrais: duas fases em paralelo, Discovery (visão, histórias, critérios, MVP, mapa de histórias) e Delivery (planejamento, Planning Poker, TDD, quadro, daily, burndown). Review, entrega de pacotes e retrospectiva como melhoria contínua. Kanban e outros métodos em um capítulo.
- Dicas boas: Planning visual (parede, fotos do quadro guardadas), daily como termômetro, burndown por especialidade (não somar tudo), refino de histórias gastando 5 a 10% do tempo do time.
- Onde ler: capítulos 5 e 6 (docs 02261 a 02290) e 7 (02289 a 02300).

### 1.5 Métricas Ágeis (Raphael Albino, Casa do Código) [BASE]
- O que é: métricas de fluxo para equipes ágeis. 7 capítulos: processo, WIP, lead time, vazão (throughput), CFD, burnup e Monte Carlo, e "o que fazer".
- Ideias centrais: medir o processo e a equipe, nunca a pessoa. WIP alto aumenta o tempo de espera (Lei de Little: tempo médio = itens em andamento ÷ vazão média). Previsão deve usar dados históricos, não palpite.
- Aviso: o autor usa "cycle time" como itens por tempo (Ohno) e prefere dizer só "lead time". Outros livros usam "cycle time" como sinônimo de lead time. No IT.MK usar sempre "tempo até ficar pronto" (lead time) e "vazão" para não confundir.
- Onde ler: cap. 2 (docs 02039 a 02060), 3 (02069 a 02100), 4 (02104 a 02128), 5 (02130 a 02160), 6 (02165 a 02180), 7 (02181 a 02193).

### 1.6 Real-World Kanban (Mattias Skarin) [BASE]
- O que é: 4 casos reais de Kanban. O capítulo 5 é sobre uma equipe de retaguarda de banco (fora de TI), parecida com cobrança.
- Ideias centrais: 6 práticas (visualizar, limitar WIP, gerir fluxo, políticas explícitas, ciclos de feedback, melhorar em conjunto). Nenhum defeito conhecido passa para a etapa seguinte. Colunas por tipo de demanda: rotinas, prioridade 1, prioridade 2, suporte, investigações, apoio ao desenvolvimento e "estacionados" (esperando alguém de fora).
- Resultados do caso: medir vazão, lead time e mistura de demanda por semana. Equipe respondia 95% em até 6 dias e 88% em até 2 dias.
- Onde ler: cap. 1 (docs 00457 a 00476) e cap. 5 (doc 00538 a 00549).

### 1.7 Clean Agile: Back to Basics (Robert C. Martin) [BASE]
- O que é: Agile explicado "do básico", pelo autor do Manifesto. Práticas de negócio, de time e técnicas.
- Ideias centrais: ciclo de ferro (escopo, prazo, custo, qualidade), planejamento com pontos, "história dourada" como referência, velocidade não é compromisso, ponto médio do ciclo como checagem, "pronto" = testes de aceite passando, refatorar nunca é história.
- Dica de ouro: é melhor ter 80% das histórias prontas do que todas 80% prontas.
- Onde ler: capítulo 3 "Business Practices" (docs 00090 a 00110), capítulos de práticas técnicas (docs 00114 a 00135).

### 1.8 BDD in Action (John Ferguson Smart) [BASE]
- O que é: BDD (desenvolvimento guiado por comportamento) do começo ao fim. 12 capítulos, 4 partes.
- Ideias centrais: partir do objetivo de negócio, achar as funcionalidades que o entregam (Feature Injection: caçar o valor, injetar funcionalidades, achar os exemplos). Conversa e exemplos concretos viram cenários em Gherkin (Dado, Quando, Então). Cenário bom é declarativo (o quê, não o como), testa uma ação, e serve de documentação viva. "Três amigos" (negócio, dev, testador) escrevem os exemplos juntos.
- Onde ler: cap. 1 (doc 00704), cap. 3 (doc 00755), cap. 4 (docs 00790 a 00805), cap. 5 (docs 00820 a 00835), cap. 11 e 12 (documentação viva e integração contínua).

### 1.9 XP: práticas para o dia a dia (Wildt, Moura, Lacerda e Helm, Casa do Código) [BASE]
- O que é: XP em português, 22 capítulos curtos. O melhor da base sobre histórias de usuário em português.
- Ideias centrais: modelo 3C, "Como / Eu quero / Para que", INVEST, tarefas SMART, personas, catálogo de "cheiros ruins" de história, o Jogo do Planejamento (exploração, comprometimento, direcionamento), spike (experimento para estimar, código jogado fora), ritmo sustentável (sem hora extra constante), integração contínua.
- Onde ler: cap. 7 e 8 (docs 01894 a 01910), cap. 10 e 11 (docs 01914 a 01925), cap. 20 e 21 (docs 01970 a 01982).

### 1.10 Extreme Programming Explained (Kent Beck), na base em ALEMÃO [BASE]
- O que é: o arquivo `extreme-programming-explained-embrace-change` da base é, na verdade, a 1ª edição em alemão ("Extreme Programming: Die revolutionäre Methode"). Lista as 12 práticas originais (jogo do planejamento, versões curtas, metáfora, design simples, testes, refatoração, programação em par, propriedade coletiva, integração contínua, 40 horas, cliente no local, padrão de código).
- Valor para o IT.MK: planejamento em camadas (ano, mês, semana, dia), "negócio decide escopo, prioridade e datas; desenvolvimento decide estimativa e processo", poucas medidas visíveis (3 a 4), teste automático rodando 100%.
- Onde ler: cap. 10 (doc 00308), 12 (doc 00326), 15 (docs 00340 a 00346), 18 (doc 00370).

### 1.11 Crystal Clear (Alistair Cockburn) [BASE]
- O que é: método leve para times pequenos (até uns 8). Foca em propriedades, não em cerimônias.
- Ideias centrais: 7 propriedades (entrega frequente, melhoria reflexiva, comunicação osmótica, segurança pessoal, foco, acesso fácil a usuário especialista, ambiente técnico com teste automático e integração frequente). Esqueleto que anda (Walking Skeleton), vitória cedo, radiadores de informação, oficina de reflexão "manter / problemas / tentar", planejamento relâmpago (Blitz Planning) para até 3 meses.
- Onde ler: cap. 2 (propriedades, doc 01471 em diante), cap. 3 (docs 01528, 01532, 01544, 01547).

### 1.12 Agile: entregas frequentes e foco no valor de negócio (André Faria Gomes, Casa do Código) [BASE]
- O que é: visão geral em português, 6 capítulos, bem alinhada ao P.O.
- Ideias centrais: planejamento e release de curta duração, limitar WIP (e a lei de Little), histórias INVEST, DoD como checklist visível, dívida técnica com backlog próprio, métricas (velocidade, burndown, burnup, CFD; indicadores de antecipação x de resultado; "meça times, não pessoas"), retrospectivas, roadmap como intenção (não promessa de data), manter o backlog pequeno.
- Onde ler: cap. 3 (docs 00046 a 00071), cap. 4 (docs 00080 a 00098), cap. 5 (docs 00106 a 00122).

### 1.13 Testes Automatizados de Software (Maurício Aniche, Casa do Código) [BASE]
- O que é: guia prático de testes em Java (JUnit), unidade, mocks, integração, sistema, serviços web.
- Ideias centrais: um teste por classe de equivalência (não por valor), não buscar 100% de cobertura, equilíbrio entre níveis (muita unidade, integração nos acessos a banco, sistema só nos fluxos críticos), teste manual ainda serve (exploratório), testar o pagamento "com todo tipo de teste".
- Onde ler: cap. 1 (doc 02904, 02926), cap. 4 (testes de integração com banco), cap. 7 (doc 03040).

### 1.14 TDD: Teste e Design no Mundo Real (Maurício Aniche, Casa do Código) [BASE]
- O que é: TDD em Java, passo de bebê, e como o teste ajuda no design (coesão, acoplamento, encapsulamento).
- Ideias centrais: ciclo vermelho, verde, refatorar. Código já "nasce" testado, é mais simples, e o teste avisa quando o design está ruim. Mock só para infraestrutura (banco, serviço externo), não para entidades simples. TDD em testes de integração costuma ser opcional.
- Onde ler: cap. 1 e 3 (docs 02727, 02751), cap. 10 (docs 02844 a 02855).

### 1.15 Código Limpo (Robert C. Martin, em português) [BASE, leitura parcial]
- O que é: o livro Clean Code. Nomes claros, funções pequenas, comentários mínimos, tratamento de erro, testes limpos, cheiros de código.
- Uso para o P.O.: base do critério "código revisado e limpo" na Definição de Pronto. Li só o prefácio e os índices. O conteúdo técnico detalhado fica com o manual de código limpo (categoria `codigo-limpo`).
- Onde ler: docs 01072 (nomes), 01091 (funções), 01154 (erro), 01170 (testes de unidade).

### 1.16 The Cambridge Handbook of the Learning Sciences (R. Keith Sawyer) [BASE, só índice]
- O que é: coletânea acadêmica de ciências da aprendizagem (802 páginas). Não é livro de método ágil.
- Uso possível: treinar usuários e analistas em ferramenta nova (apoio gradual/scaffolding, metacognição, aprendizagem em colaboração, análise de dados de aprendizagem). Só li o sumário. Não usar como regra de planejamento.
- Onde ler: sumário nos docs 00580 a 00590 (partes I a V).

---

## 2. Práticas acionáveis

Para cada prática: o que é, como fazer, regra de bolso, cuidado.

### 2.1 Planejamento em 3 níveis [BASE]
- O que é: versão (3 a 6 meses; no IT.MK até 3 meses, regra do `base-po.md`), ciclo (1 a 4 semanas, 2 é comum) e dia (combinado na reunião diária). Cohn caps. 3 e 13 a 14; Beck cap. 15.
- Como fazer:
  1. Visão e meta mensurável (uma frase cada).
  2. Quebrar em temas/épicos e histórias. Estimar (pontos).
  3. Montar a versão: velocidade esperada x número de ciclos = pontos que cabem. Escolher histórias até encher.
  4. A cada ciclo, escolher as mais valiosas que cabem na velocidade.
  5. Refazer o plano da versão no começo de todo ciclo.
- Regras de bolso:
  - Planejar com detalhe só até o próximo horizonte (próxima versão, próximo ciclo). Além disso, só tópicos (Beck).
  - Se a versão não cabe, mudar uma das 3: escopo, data ou recurso. Nunca "espremer" qualidade (Cohn, ciclo de ferro de Martin).
  - Quem faz o trabalho estima; o negócio decide escopo, prioridade, composição da versão e datas (Beck, Casa do Código XP).
- Cuidado: plano que ninguém atualiza apodrece. Plano é ferramenta de decisão, não contrato.

### 2.2 Plano de versões e roadmap [BASE]
- Versão (release) = entrega que vai para produção. Ciclos (sprints) ficam dentro da versão.
- Para fixar escopo: multiplicar velocidade por número de ciclos e escolher histórias até esse total (Cohn cap. 13).
- Para fixar data: somar pontos das histórias escolhidas e dividir pela velocidade.
- Cada versão deve ter sentido sozinha: não se entrega meia funcionalidade só para encurtar (Beck cap. 10).
- Roadmap serve para mostrar intenção e marcos, não data exata de cada funcionalidade (Gomes 3.11). Depois de 3 meses a incerteza é grande.
- Evite alinhar entregas com o fim do mês/trimestre: Cohn conta um caso em que 1 semana de atraso empurrou receita de um trimestre para o outro. Para o IT.MK: [COMPL.] evitar mexer em produção nos dias de fechamento do mês (ver 5.2).
- Manter o backlog pequeno: com 10 itens já são 3,6 milhões de ordens possíveis (Gomes). Detalhar só o que vai entrar logo; o resto fica como épico.

### 2.3 Estimativa em pontos e Planning Poker [BASE]
- O que é: pontos são tamanho relativo (esforço, complexidade e incerteza juntos), não horas. 10 pontos = o dobro de 5 (Cohn cap. 4).
- Escalas: Fibonacci adaptada (1, 2, 3, 5, 8, 13, 20, 40, 100), potências de 2, ou camisas (P, M, G). O `base-po.md` usa 1, 2, 3, 5, 8, 13, 20.
- Como começar: escolher uma história pequena e bem conhecida como referência (dar 2 ou 3 pontos, para deixar espaço para menores) ou duas referências (uma média, uma pequena ou grande). Escolher uma vez, antes do projeto, não a cada ciclo (Sabbagh). Clean Agile chama a história média de "história dourada" (3 pontos numa escala 1 a 6).
- Passos do Planning Poker (Sabbagh, Audy, Gomes):
  1. Alguém lê o item. O P.O. responde dúvidas, não vota.
  2. Cada dev escolhe uma carta SEM mostrar (evita ancoragem).
  3. Todos mostram ao mesmo tempo.
  4. Se há diferença, quem deu a maior e a menor explica. Roda de novo.
  5. Limite: 2 a 3 rodadas. Sem consenso: ficar com a carta mais alta (Audy) ou combinar regra do time.
  6. 13 ou mais costuma ser sinal de que deve dividir. "Café" = pausa, "?" = não sei (precisa de spike).
- Regras de bolso:
  - Estimar não pode ser demorado. Se estimar precisa de estimativa, algo está errado (Sabbagh).
  - Quem estima é o time que faz. P.O. e Scrum Master facilitam, não votam.
  - Não traduzir pontos em horas ("1 ponto = 1 dia" mata a ideia). Não comparar pontos entre times.
  - Só re-estimar se a opinião sobre o tamanho relativo mudou. Não re-estimar porque o ritmo está lento; a velocidade corrige isso (Cohn cap. 7).
  - Se sempre acerta, desconfie: pode ter folga demais (Audy).
  - Item que não se consegue estimar: fazer spike (ver 2.12).
- Cuidado: Sabbagh avisa que os criadores dos pontos hoje preferem itens pequenos (2 a 3 dias) e contar itens. Ver 2.13 e a armadilha A11.

### 2.4 Velocidade [BASE]
- O que é: pontos de histórias PRONTAS por ciclo. Medida depois do ciclo (Cohn cap. 16).
- Regras:
  - Tudo ou nada: história pela metade não conta nada (Cohn, Martin). Se foi dividida, estimar de novo o que foi feito e o que falta.
  - Sem histórico: (a) usar média de outro período parecido, (b) rodar 2 a 3 ciclos e medir (melhor), (c) quebrar poucas histórias em tarefas e ver quanto cabe.
  - Tratar como faixa (por exemplo, pior e melhor dos últimos 3 ciclos), não número único (Cohn cap. 21). No `base-po.md` a oscilação normal é cerca de 10%.
  - Velocidade NÃO é meta nem compromisso (Martin). Se vira meta, o time infla os pontos (Lei de Goodhart, [COMPL.]).
  - Velocidade pertence ao time. Não é indicador de pessoa.
  - Troca de gente, de tecnologia ou de tipo de trabalho muda a velocidade. Recalibrar.
  - Em XP, subir demais a velocidade sem testes e refatoração costuma esconder dívida (Beck cap. 12).
- Uso: converter plano da versão em número de ciclos e data provável.

### 2.5 Burndown, burnup e quadro de tarefas [BASE]
- Burndown: trabalho que falta (eixo vertical) por dia/ciclo (eixo horizontal). Cai quando termina, sobe se re-estima ou se entra trabalho (Gomes 5.2).
- Burnup: mostra o que foi entregue subindo e o escopo total como outra linha. Melhor quando o escopo muda, porque a mudança aparece (Gomes).
- Dois níveis: ciclo (do time) e versão/produto (do P.O.) (`base-po.md`).
- Dica de Audy: um burndown por especialidade (backend, frontend, teste) para não esconder gargalo; só vale se qualquer pessoa conseguir "ler" o gráfico sozinha.
- Quadro: A fazer, Em andamento, Teste, Pronto, com colunas para bloqueio. Quadro mostra gargalo e fluxo; burndown mostra tendência de sucesso. Um não substitui o outro (Audy).
- Ponto médio do ciclo: no meio, cerca de metade dos pontos deve estar pronta. Se não está, agir (Martin).
- Cuidado: só marcar como feito o que passou nos critérios de aceite. "90% pronto" não existe (Martin).

### 2.6 WIP e Kanban [BASE]
- WIP = trabalho começado e ainda não entregue. Cada item em andamento custa e perde valor com o tempo (Albino).
- Ponto de entrada e de saída têm que estar claros. Exemplo: entra quando está "Refinado"; sai quando o P.O. aceita (Albino 2.2).
- Por que limitar:
  - Lei de Little: tempo médio de espera = itens em andamento ÷ vazão média. Mais coisa começada = tudo demora mais (Albino 4.4, Gomes 3.5).
  - Gargalos aparecem (a coluna de teste enche, por exemplo).
  - Qualidade cai quando entra coisa demais (Anderson, citado por Albino).
- Como limitar: limite por coluna, começando com um pouco mais que o número de pessoas daquela etapa (Gomes), e ajustar por experimento. Skarin usou 3 fichas por pessoa no caso da retaguarda do banco.
- Regras:
  - "Parar de começar, começar a terminar" (Gomes).
  - Se há itens muito velhos, não puxar novo item. Reduzir WIP.
  - Filas curtas entre colunas absorvem variação.
  - Ficar ocioso não é problema: é tempo para ajudar o gargalo (Albino).
  - Nenhum defeito conhecido passa para a etapa seguinte (Skarin).
- Scrum limita WIP de forma indireta (escopo fixo do ciclo); Kanban limita direto, por coluna (Albino).
- Políticas explícitas: escrever na coluna o que significa "pronto para sair dela" (Skarin, prática 4).
- Classes de demanda (Skarin cap. 5): rotinas recorrentes (calendário), urgentes (prioridade 1), normais (prioridade 2), suporte (em blocos de meio dia), investigações (acompanhar longo prazo), apoio ao desenvolvimento, estacionados (esperando alguém de fora, com dono por pessoa para não esquecer).

### 2.7 Definição de Pronto (DoD) e de Preparado (DoR) [BASE]
- DoD: acordo formal entre P.O. e time sobre o que é preciso para dizer que um item está "pronto". Igual para todos os itens (Sabbagh). Itens do critério de aceite são específicos de cada história; a DoD é geral.
- Exemplos de itens (Gomes 4.7, Sabbagh): código refatorado e dentro do padrão, revisado ou feito em par, integrado, testes de unidade e de aceite rodados, testes exploratórios feitos, nenhum defeito conhecido, documentação atualizada, P.O. aceitou.
- Regras:
  - Escrita, visível, revista nas retrospectivas, cada vez mais rígida (Sabbagh).
  - Idealmente "pronto" = pode ir para produção. Trabalho que sobra "para antes da versão" é disfunção e risco (Sabbagh cap. DoD).
  - Se o item não passa, não conta na velocidade, volta ao backlog (`base-po.md`).
  - Clean Agile: "pronto" = testes de aceite passando.
- DoR (Definição de Preparado): o item só entra no ciclo se tiver critérios de aceite combinados, estimativa do time e tamanho pequeno o bastante (Sabbagh, docs 02567 a 02572). Se não estiver, o time recusa. Evita planejamento longo e cansativo.
- Cuidado: DoR rígida demais vira burocracia. Usar só para os itens do topo.

### 2.8 Critérios de aceite, Gherkin e BDD [BASE]
- História (Cartão) + conversa + confirmação (critérios e testes) = modelo 3C (Sabbagh, XP Casa do Código).
- Critério de aceite: frase curta e testável sobre o que a funcionalidade deve fazer. Definido pelo cliente/P.O. ANTES de construir, com ajuda do testador (XP Casa do Código cap. 8, Sabbagh cap. Product Backlog).
- Gherkin (BDD): Dado (situação inicial), Quando (ação), Então (resultado) (Smart cap. 1 e 5). Palavras-chave em português também funcionam: Dado que, Quando, Então, E, Mas.
- Cada exemplo concreto vira um cenário. Um teste por classe de equivalência, não por valor (Aniche).
- Boas práticas de cenário (Smart 5.4):
  - Declarativo, não imperativo: descreva o QUÊ, não "clica no botão X, digita Y".
  - Um cenário testa UMA ação. Evitar Quando-Então-Quando-Então em sequência.
  - Dado = só pré-condições necessárias, no passado ("o fechamento foi aberto").
  - Dados que não importam para a regra não entram.
  - `Contexto` (Background) para passos repetidos em todos os cenários.
  - Tabelas para vários valores.
  - Nome do arquivo = funcionalidade (capacidade), não número de história.
- Como descobrir os exemplos (Smart cap. 3 e 4):
  - Caçar o valor: qual objetivo de negócio? Quem ganha? Injetar funcionalidades a partir das saídas (relatório, cobrança emitida, baixa feita), não das entradas.
  - Oficina de especificação com o time todo, ou "três amigos" (P.O., dev e testador) com uma funcionalidade por vez. O testador acha casos de borda; o dev aponta limites técnicos; o P.O. julga valor.
  - Opções reais: não decidir o que ainda não precisa. Descoberta deliberada: aprender o que não se sabe antes de se comprometer.
- Alguns critérios não viram teste automático (ex.: "o botão é azul"). Ficam para teste exploratório (Sabbagh). No IT.MK: cor, espaçamento e largura de tela viram "checagem visual" dentro do protótipo (ver 5.5).
- Bug é critério de aceite que faltou ou falhou: escrever um critério (ou teste) que falhe diretamente no problema (XP Casa do Código 7.8). Combina com o `base-po.md`.

### 2.9 TDD e pirâmide de testes [BASE]
- TDD: escrever um teste que falha, fazer passar com o mínimo, refatorar (vermelho, verde, refatorar). Passos pequenos (Aniche; Audy cap. 6.3).
- Vantagens citadas (Aniche cap. 3): foco no comportamento, código já nasce testado, mais simples, melhor design (teste é o primeiro cliente da classe), feedback rápido.
- Níveis (Aniche, "TDD" cap. 10 e "Testes" cap. 1 a 7):
  - Unidade: classe isolada, rápido, regras de negócio (muitos "se" e "para"). Maior volume.
  - Integração: classe com banco, serviço externo, SQL (DAO/repositório). Não usar mock aqui.
  - Sistema: simula o usuário (navegador, tela). Lento e frágil. Só nos fluxos críticos (pagamento).
  - Mocks: para infraestrutura difícil de montar (banco, sistema externo). Entidades e utilitários simples não precisam de mock.
- Cobertura de código: usar para achar o que não está testado. Não perseguir 100% (getters e setters não precisam).
- Teste manual continua: exploratório, onde a máquina não consegue (Aniche cap. 7).
- XP (Beck cap. 18): os testes de unidade rodam 100% sempre; teste falhando é prioridade do time; testar o que pode errar, não tudo.
- Quem escreve: dev escreve unidade; cliente/QA escreve aceite; dev que fez a história não escreve o aceite dela (Martin).
- No IT.MK o P.O. não escreve teste, mas cobra: critério de aceite em Gherkin, que o dev transforma em teste, e DoD com "testes passando".

### 2.10 Integração contínua e entrega frequente [BASE]
- IC: integrar o código várias vezes ao dia, com build e testes automáticos a cada commit, para achar erro cedo (XP Casa do Código cap. 20; Gomes 4.8). Não resolve bug, mas deixa fácil achar.
- Entrega frequente: pacotes pequenos em produção, quando o negócio decidir. Audy: não é só ter Jenkins; é ter bateria de testes automatizados. Qualidade é o norte.
- Regras de bolso (Casa do Código XP): integrar pouco e sempre, não deixar build quebrado, branches curtos.
- Ambiente de teste igual ao real (staging) antes de entregar (`base-po.md`).
- No IT.MK: "prévia publicada" é a forma do dono acompanhar. Liberar em produção nunca na sexta e fora de fechamento (ver 5.2).

### 2.11 Refinamento do backlog [BASE]
- O que é: sessões do P.O. com o time para detalhar os itens do topo: conversar, criar critérios de aceite, estimar, dividir (Sabbagh cap. Refinamento; Audy 5.4 "Grooming").
- Tempo: até 10% do tempo do time (Audy e `base-po.md`), de preferência no meio do ciclo.
- Resultado esperado: itens do topo cumprindo a Definição de Preparado.
- O que fazer:
  1. Ordenar o topo por valor, risco, dependência.
  2. Escrever/ajustar história e critérios com quem vai usar.
  3. Estimar (poker) e dividir o que for grande.
  4. Marcar o que precisa de spike ou de decisão do dono.
- Não detalhar itens longe: pode mudar (Gomes 3.6, XP Casa do Código 7.9).

### 2.12 Spike (experimento para estimar) [BASE]
- Spike é um programa pequeno para tirar uma dúvida técnica e conseguir estimar a história (XP Casa do Código cap. 11; Martin: "meta-história").
- Regras: vira item no backlog, estimado e com tempo limitado; o código do spike é jogado fora; é exceção, não regra.
- Exemplo: antes de estimar "emitir boleto/pix em lote", fazer um spike de 1 a 2 dias na API de pagamento. [EXEMPLO]

### 2.13 Métricas de fluxo: lead time, vazão, CFD, previsão [BASE]
- Lead time: dias entre entrar e sair do processo, medido por item (Albino cap. 3). Útil para achar casos extremos e responder "quando fica pronto?" com histórico.
- Vazão (throughput): quantos itens ficaram prontos por período (dia, semana, ciclo) (Albino cap. 4). Escolher o período pelo contexto. Não é igual a velocidade (pontos).
- Lei de Little: lead time médio = WIP médio ÷ vazão média. Alavancas: reduzir WIP, aumentar vazão.
- CFD (diagrama de fluxo acumulado): faixas por etapa ao longo do tempo. Faixa que alarga = gargalo. Linhas paralelas = fluxo saudável (Albino cap. 5; Gomes 5.2).
- Previsão por dados: burnup + histórico de vazão; simulação de Monte Carlo (sortear vazões passadas milhares de vezes e ver a chance de acabar até certa data) (Albino cap. 6).
- Indicadores de antecipação (leading) x de resultado (lagging) (Gomes 5.2): antecipação = cobertura de testes, itens refinados; resultado = defeitos reportados por usuário, atraso. Para cada objetivo, ter pelo menos um de cada.
- Regras de ouro (Albino cap. 7; Gomes 5.2; Beck cap. 12):
  - Medir o processo, nunca a pessoa. Medir times, não indivíduos.
  - Métrica é referência, não cobrança. Não comparar times.
  - Poucas métricas visíveis (Beck: 3 a 4). Trocar a que chegou perto de 100%.
  - Incluir métrica de negócio (receita, uso de funcionalidade, conversão), não só de processo.
  - "No estimates": se a equipe tem itens pequenos e histórico, pode só contar itens. Projetar com dados (Albino 7.5). [BASE; ver armadilha A11]
- Cuidado: se o processo é pequeno (2 ou 3 pessoas), o quadro pode virar peso; Skarin diz que com pouca demanda o quadro é sobrecarga, mas ajuda muito nos picos.

### 2.14 Priorização [BASE + COMPL.]
- Quatro fatores (Cohn cap. 9 e 10): valor financeiro, custo, aprendizado gerado, risco removido. Juntar valor e custo para a ordem inicial; depois subir o que ensina muito ou remove risco.
- Valor/custo: valor (escala relativa, por exemplo 1 a 10) dividido pelo custo (pontos). Maior vai primeiro (Sabbagh). É um dos critérios, não o único (ROI do backlog inteiro não é a soma dos itens).
- Jogo dos quatro quadrantes (Martin): alto valor e baixo custo = fazer agora; alto valor e alto custo = fazer depois; baixo valor e baixo custo = talvez; baixo valor e alto custo = nunca.
- Kano (Cohn cap. 11): pergunta ao usuário como se sentiria com e sem o item. Obrigatório, linear e encantador.
- Em XP: o negócio separa em 3 pilhas (sem isso o sistema não funciona; menos importante com ganho forte; bom ter). O dev separa por risco (estima bem, mais ou menos, não consegue) (Beck cap. 15). Equivale ao MoSCoW do `base-po.md`.
- Pareto: 20% das funções dão 80% do valor (Beck cap. 23).
- [COMPL.] RICE, WSJF: ver manual 01. Não estão neste material.

### 2.15 Dívida técnica [BASE]
- O que é: o que se decide não fazer agora e que atrapalha depois (Cunningham, citado por Gomes 4.11). Inclui refatoração adiada, baixa cobertura de teste, defeito conhecido não resolvido, design velho.
- Efeito: custo e prazo aumentam, defeitos aumentam, o time desanima.
- O que fazer:
  - Backlog próprio de dívida técnica, priorizado pelo time e negociado com o P.O.
  - Ter "pronto" que inclui refatorar (Código Limpo, prefácio).
  - Refatoração, arquitetura e limpeza nunca são história de usuário (Martin). Embutir dentro das histórias que precisam delas (Sabbagh).
  - Ritmo sustentável: hora extra constante não aumenta produção (XP Casa do Código cap. 21).
- Para o P.O.: reservar uma fatia fixa de cada ciclo para dívida [COMPL.] e perguntar ao time o custo de não pagar.

### 2.16 Cerimônias e tempos máximos [BASE]
Os livros divergem. Use esta tabela como ponto de partida e deixe o time ajustar.

| Evento | Schwaber (2004) | Audy / Sabbagh / Martin | Regra do IT.MK (base-po) |
|---|---|---|---|
| Ciclo | 30 dias | 1 a 4 semanas | 1 a 4 semanas, 2 é comum |
| Planejamento | 8 horas (4 + 4) | até 4 h para ciclo de 2 a 4 semanas; Martin: 1/20 do ciclo | Entrada: backlog, capacidade, histórico |
| Reunião diária | 15 min | 15 min, mesmo horário e local | 15 min |
| Revisão | 4 horas, preparar em até 1 hora | 1 a 2 h; Martin: dono opera o sistema | Demonstrar só o que ficou pronto horas antes |
| Retrospectiva | 3 horas | 1 a 2 h, formatos variados | Só o time |
| Refinamento | não existe | 5 a 10% do tempo | Até 10% |

- Regras de Schwaber (Apêndice A): a lista do ciclo não muda no meio. Se o ciclo perde sentido, o ScrumMaster pode cancelar. O time pode negociar tirar ou pôr itens com o P.O. Funcionalidade que não está pronta não pode ser mostrada.
- Daily: três perguntas (o que fiz, o que farei, o que me trava). Sem digressão. Quem tiver assunto vai conversar depois. Se 2 ou 3 dailies passam sem decisão ou impedimento, algo está errado (Audy).

### 2.17 Revisão e retrospectiva [BASE]
- Revisão (demonstração): time mostra o que está pronto, partes interessadas dão opinião, P.O. reordena o backlog. Quem opera é o usuário, para ninguém esconder defeito (Martin, Schwaber).
- Saída da revisão: backlog atualizado, data provável de entrega, próximos passos (`base-po.md`).
- Retrospectiva: construtiva, sem culpado. O que mantemos, o que dói, o que vamos tentar (Crystal: oficina "manter / problemas / tentar", 15 minutos na primeira vez). Schwaber: duas perguntas (o que foi bem, o que melhorar). Plano de ação com dono e data. Item de melhoria entra no backlog como item de alta prioridade, senão a retro é "estéril" (Schwaber).
- Variar o formato e o local para não virar rotina (Audy). Deixar o quadro de ações à vista.
- Kanban (Skarin): retro mensal na frente do quadro, com um "Kanban de melhorias" de duas raias (o que o time controla; o que depende da organização).

### 2.18 Papéis [BASE]
- P.O.: valor, backlog, ordem, aceite. Escreve itens com palavras próprias. Presente para tirar dúvidas.
- Time de desenvolvimento: estima, escolhe o que cabe, decide como fazer. Multidisciplinar.
- ScrumMaster/coach: garante o método, remove impedimentos, facilita. Não manda.
- Cliente/usuário especialista: acesso fácil (Crystal) e "sentar ao lado do usuário" (Skarin: dev com notebook ao lado do analista corrigiu problemas pequenos que nunca entravam no backlog).
- Gerente: com XP/Scrum, mostra o que fazer e mede; não distribui tarefa (Beck cap. 12).
- Nota do IT.MK: não usar rótulos como "diretor", "CEO" ou "colaborador" em telas ou itens. Usar papéis de uso: analista de cobrança, consultor, dono, pagador.

---

## 3. Regras para escrever um item completo

Item completo (`CLAUDE.md`) = história + critérios de aceite + desenho + prioridade + estimativa. Os livros dão as regras abaixo.

### 3.1 Molde do item (BL-xx)
```
BL-xx  [Frente: Frontend | Backend | Database | Integrações]  [Épico: ...]  [Versão: vX]
Título (curto, com verbo, sem número): "Ver contas a receber do mês por marketplace"
História: Como [analista de cobrança | consultor | dono | pagador], quero [o quê], para [por quê / valor].
Valor: (o que ganha o cliente, a empresa, o processo) + como medir.
Critérios de aceite (caixas marcáveis, Gherkin quando houver regra):
  [ ] ...
Desenho: imagem computador e celular (quando tela). Cores e medidas só de tokens.css.
Prioridade: MoSCoW + nível 1 a 5. Ordem no backlog (valor, dependência, risco, custo).
Estimativa: pontos (do time). Itens de 13 ou mais: dividir.
Dependências / riscos / o que NÃO foi verificado.
Fora do escopo: ...
Estado: criado, priorizado, em andamento, pronto para testar, aceito, volta.
```

### 3.2 História [BASE]
- Forma: "Como [quem], quero [o quê], para [por quê]" (Connextra; Cohn; Sabbagh; XP Casa do Código 7.3).
- "Quem" é papel ou persona de verdade. Evitar "como usuário". Dar nome à persona (ex.: "Ademar, administrador").
- "O quê" expressa o problema do usuário, não a solução. Exemplo do livro: "encontrar um livro cujo nome sei" em vez de "buscar por nome". Abre espaço para soluções melhores (Sabbagh).
- "Para quê" é o valor. Sem valor explícito, não dá para priorizar (XP Casa do Código 7.9).
- Voz ativa; título curto; o cliente (P.O.) escreve ou confirma (XP Casa do Código 7.8).
- História é lembrete de uma conversa. Detalhes ficam para quando o item chegar perto do ciclo (Martin: o detalhe muda, escreva tarde).
- Fatia vertical: atravessa as camadas (tela, regra, banco) e entrega valor completo. "Fatiar o bolo", não por camada (XP Casa do Código 7.8).
- Não é história: tarefa técnica pura ("atualizar o Spring"), "o sistema deve ser rápido" (requisito de fundo). Esses viram critério de aceite (restrição) ou item de dívida técnica (Gomes 3.6, XP Casa do Código).
- INVEST: Independente, Negociável, Valiosa, Estimável, Pequena, Testável (Cohn; Martin; Gomes; Sabbagh).
  - Pequena: caber em um ciclo; ideal poucos dias de trabalho (Sabbagh). Martin: cerca de 6 a 12 histórias por ciclo para 8 devs.
  - Estimável e testável andam juntas: se não dá para testar, não dá para estimar.

### 3.3 Como dividir história grande [BASE]
Cohn cap. 12 (e Martin, Audy, XP Casa do Código):
1. Por tipo de dado (por marketplace, por tipo de cobrança).
2. Por operação (criar, ver, alterar, apagar).
3. Por prioridade interna (parte essencial agora, parte "bom ter" depois).
4. Separar preocupações transversais (segurança, log, erro) e desempenho (uma história a mais, depois).
5. Por caminho (caminho feliz primeiro, exceções depois). Exemplo do Clean Agile: Login → login sem senha, uma tentativa, várias tentativas, esqueci a senha.
6. NÃO dividir em tarefas técnicas (banco, tela, API). Dividir em fatias de valor.
7. Juntar histórias minúsculas (bugs) quando fizer sentido.

### 3.4 Critérios de aceite [BASE]
- 3 a 7 por item. Cada um sim/não, sem ambiguidade, testável.
- Escrever em caixas (`[ ]`). Para regra de negócio, cenário em Gherkin (Dado, Quando, Então) com exemplo de números reais.
- Cobrir: caminho feliz, exceções, bordas (zero, vazio, limite), erro, quem pode ver.
- Restrições (desempenho, segurança, uso) entram aqui (XP Casa do Código 7.8).
- Para tela: incluir sempre os critérios fixos do IT.MK (visão única, sem espaço vazio, sem barra horizontal, texto quebra linha, testado em computador, tablet e celular, cores só do `tokens.css`).
- Critério de aceite x DoD: o critério é do item; a DoD é de todos. O teste final = critérios do item + DoD (Audy).
- Bug depois de aceito: é critério que faltou. Escrever o critério e tratar como item novo, se for ajuste ou mudança (`base-po.md`).

### 3.5 Estimativa do item [BASE]
- Em pontos, na escala do time, comparando com a história de referência (ver 2.3).
- Quem estima: o time. O P.O. responde dúvida.
- Registrar a estimativa no item e a data. Se mudou o entendimento do tamanho relativo, re-estimar.
- Se for 13 ou mais, ou "?": dividir ou fazer spike antes.
- Estimativa de épico: pode ser grosseira (20, 40, 100) enquanto longe. Só refinar quando perto (Cohn cap. 4).
- Opcional: estimar com faixa (melhor, provável, pior; 5%, 50%, 95%) para itens grandes (Martin, Cohn cap. 17).

### 3.6 Prioridade e ordem [BASE + COMPL.]
- MoSCoW + nível 1 a 5 do `base-po.md` (1 = emergência; 5 = ideia sem detalhe).
- Ordem por valor, dependência, risco, custo (Cohn, Sabbagh, Beck).
- Itens do topo: detalhados e estimados. Itens do fundo: só título e ideia.
- Itens "Deve" formam a versão mínima (MVP). MVP não é "o menor possível feito mais rápido"; é o menor que prova valor (Audy 5.5).

### 3.7 Checklist final antes de pôr no ciclo (DoR do IT.MK) [COMPL., baseado em Sabbagh e Gomes]
- [ ] História com papel real, valor e fatia vertical.
- [ ] Critérios de aceite em caixas, testáveis (Gherkin quando há regra).
- [ ] Desenho de computador e celular (se tela).
- [ ] Prioridade e ordem definidas.
- [ ] Estimativa do time (13 ou mais dividido).
- [ ] Dependências e riscos conhecidos. O que não foi verificado está dito.
- [ ] Dono do produto sabe responder dúvidas no ciclo.

---

## 4. Armadilhas (o que os livros avisam)

| # | Armadilha | O que fazer | Fonte |
|---|---|---|---|
| A1 | Tratar estimativa como promessa | Dizer "estimativa" e dar faixa; comunicar que estimar é previsão | Sabbagh; Schwaber (banco) |
| A2 | Transformar velocidade em meta | Medir, usar para planejar, nunca cobrar | Martin; Cohn |
| A3 | Converter pontos em horas | Pontos são relativos; não "1 ponto = 1 dia" | Sabbagh |
| A4 | Comparar times pelas métricas | Cada time se compara só com ele mesmo | Albino 7.2; Gomes |
| A5 | Medir pessoas | Medir processo e time | Albino 7.1; Gomes; Beck |
| A6 | "Quase pronto" (90%) | Só conta o que passou nos critérios e na DoD | Martin; Cohn |
| A7 | Começar tudo ao mesmo tempo | Limitar WIP; terminar antes de começar | Albino; Gomes; Skarin |
| A8 | Detalhar histórias muito cedo | Detalhar só as do topo; o resto muda | Gomes 3.6; XP Casa do Código 7.9 |
| A9 | Escrever detalhes demais no cartão | Cartão curto; detalhe vai para critérios e conversa | Martin; Sabbagh |
| A10 | História técnica disfarçada | Refatorar, arquitetura e limpeza não são história; embutir ou usar backlog de dívida | Martin; Sabbagh |
| A11 | Insistir em pontos quando o time não precisa | Se itens são pequenos e há histórico, contar itens e prever por vazão | Sabbagh; Albino 7.5; XP Casa do Código 7.7 |
| A12 | Planning Poker longo e com influência | Cartas viradas juntas; 2 a 3 rodadas; timebox | Sabbagh; Audy |
| A13 | Planejamento que vira reunião de descoberta | Refinar antes; Definição de Preparado | Sabbagh (Preparado); Audy 6.1 |
| A14 | Mudar o escopo do ciclo no meio | Escopo congelado; novidade vira item novo | Schwaber; `base-po.md` |
| A15 | Pronto significando coisas diferentes | DoD escrita e visível | Schwaber cap. 1; Sabbagh |
| A16 | Teste só no fim | Teste desde o começo; testes de aceite prontos até o meio do ciclo | Martin; Audy |
| A17 | Cenário Gherkin que é roteiro de clique | Declarativo; um cenário, uma ação | Smart 5.4 |
| A18 | Teste de sistema demais | Pirâmide: muita unidade, poucos de sistema | Aniche |
| A19 | Perseguir 100% de cobertura | Cobrir o importante e complicado | Aniche |
| A20 | Hora extra como rotina | Ritmo sustentável; hora extra só uma semana | Beck (40 horas); XP Casa do Código 21 |
| A21 | Entregar na sexta, ou só na véspera da versão | Entrega pequena e frequente; nunca sexta | `base-po.md`; Cohn |
| A22 | Plano longo e detalhado | Detalhe só o próximo horizonte | Beck cap. 15; Gomes 3.10 |
| A23 | Gantt por tarefa como relatório | Relatar por requisito/funcionalidade entregue | Schwaber cap. 7 |
| A24 | Trocar o P.O. por "cliente que não aparece" | P.O. e usuário especialista acessíveis | Crystal; XP Casa do Código cap. 6 |
| A25 | Mudar de método de repente em estresse | Pequenos passos; ajustar o processo na retro | Beck cap. 12 |
| A26 | Backlog gigante | Manter pequeno; o fundo é épico | Gomes 3.10 |
| A27 | Retrospectiva sem ação | Ação com dono e data, entra no backlog | Schwaber; Audy |
| A28 | Quadro importado sem o time entender | Time monta o próprio quadro e regras | Audy 6.4; Skarin |
| A29 | Usar o método à risca sem entender o porquê | Scrum é meio, não fim; adaptar com consciência | Sabbagh (prefácio); Audy |
| A30 | Sem tempo para corrigir bug conhecido e entregar assim mesmo | Bug conhecido = não pronto; corrigir no ciclo seguinte | `base-po.md`; Gomes |

---

## 5. Como aplicar ao IT.MK

Contexto (do `CLAUDE.md` e do `base-po.md`): sistema de cobrança para a consultoria de marketplaces da empresa 40%. Java + JavaFX + CSS + Spring, banco Supabase/Postgres. Trabalho no CicloDev em frentes Frontend, Backend, Database e Integrações, com épicos, itens e versões. Item completo = história + critérios de aceite + desenho + prioridade + estimativa.
Tudo abaixo é [EXEMPLO] ou [COMPL.]. As regras reais de negócio (prazos, multa, juros, canais, textos) precisam do dono. Nada aqui foi verificado no sistema.

### 5.1 Estrutura sugerida do trabalho
- Quadro único do IT.MK (fonte única da verdade, `base-po.md`), com uma raia por frente (Frontend, Backend, Database, Integrações) e colunas: Backlog refinado, Em andamento, Teste (prévia publicada), Aceito. Coluna "Estacionado" para o que espera o dono ou um serviço externo (Skarin).
- Limite de WIP por coluna (começar com poucos itens: um a dois por frente, [COMPL.]) e regra "nada vai para Teste com bug conhecido".
- Ciclo de 2 semanas, com entrega nunca na sexta (`base-po.md`). Evitar publicar em produção nos dias de fechamento do mês [COMPL.].
- Planejamento, revisão e retrospectiva curtos. Refinamento até 10% da capacidade, no meio do ciclo.
- Item que mexe em várias frentes: dividir em fatia vertical. Cada frente tem sua parte, mas o item aceito é o que o usuário vê funcionando de ponta a ponta (ver 5.6).
- Primeiro ciclo: "esqueleto que anda" (Crystal): um fluxo mínimo ligando Database, Backend e uma tela JavaFX, mesmo feio, para validar a arquitetura cedo (ver 5.6).

### 5.2 Fechamento do mês [EXEMPLO]
O módulo reúne o que foi vendido/entregue no mês e fecha o valor a cobrar.

- Épico: "Fechar o mês e gerar a cobrança por loja".
- Histórias (fatias):
  - BL-xx: Como analista de cobrança, quero ver o total do mês por marketplace, para conferir antes de fechar.
  - BL-xx: Como analista de cobrança, quero marcar o mês como fechado, para que os valores não mudem sem aviso.
  - BL-xx: Como dono, quero ver o resultado do fechamento em R$ na visão geral, para saber quanto vai entrar.
  - BL-xx: Como consultor, quero ver o que ficou de fora do fechamento e o motivo, para explicar ao pagador.
- Regras do projeto: tela única e completa (sem "modo" por perfil); valores em R$ e contagens juntos; sem informação repetida.
- Exemplo de critérios em Gherkin:
```
Funcionalidade: Fechar o mês
  Cenário: Fechar um mês sem pendências
    Dado que o mês de [mês/ano] tem todos os lançamentos conferidos
    Quando a analista de cobrança fecha o mês
    Então o mês fica com estado "fechado"
    E os valores a cobrar ficam congelados
    E o fechamento aparece no histórico com data e responsável

  Cenário: Não deixar fechar com pendência
    Dado que o mês tem lançamentos sem conferência
    Quando a analista tenta fechar o mês
    Então o sistema mostra quantos lançamentos faltam
    E o mês continua aberto
```
- Estimativa: referência = "listar contas do mês" (3 pontos). "Marcar como fechado com congelamento de valores" costuma ser maior por mexer em Database e Backend (5 ou 8). Se 13, dividir (congelar valores x histórico).
- WIP: no fechamento mensal há uma "rotina" que volta todo mês (Skarin: coluna de rotinas em calendário). Pôr no quadro como item recorrente. Não deixar entrar item novo na semana de fechamento sem acordo (classe de demanda urgente).
- Métricas: lead time do item "fechar mês" ao longo dos meses; número de itens fechados por semana; defeitos achados depois do fechamento (indicador de resultado).
- Risco: mudança de regra depois do fechamento. Resposta: mudança vira item novo (`base-po.md`).

### 5.3 Recebimentos [EXEMPLO]
Entrada de pagamentos e baixa das cobranças.

- Épico: "Registrar e conferir recebimentos".
- Histórias:
  - Como analista de cobrança, quero ver os recebimentos do dia e o que ainda está em aberto, para saber quem cobrar.
  - Como analista de cobrança, quero dar baixa em um recebimento, para atualizar o saldo da cobrança.
  - Como dono, quero ver o total recebido x a receber no mês, para acompanhar o caixa.
  - Como pagador, quero receber confirmação do pagamento, para ter certeza de que está quitado. [depende de Integrações]
- Exemplos em Gherkin (valores inventados):
```
Cenário: Baixa total
  Dado uma cobrança de R$ 1.000,00 em aberto
  Quando o recebimento de R$ 1.000,00 é registrado
  Então a cobrança passa a "quitada"
  E o saldo em aberto é R$ 0,00

Cenário: Baixa parcial
  Dado uma cobrança de R$ 1.000,00 em aberto
  Quando o recebimento de R$ 400,00 é registrado
  Então a cobrança continua "em aberto"
  E o saldo em aberto é R$ 600,00
```
- Divisão sugerida: por tipo de baixa (total, parcial, a maior), por origem (manual, automática por integração), por operação (ver, registrar, desfazer). Nunca por camada.
- Classes de demanda: recebimento do dia (prioridade 1, rotina), conferência (prioridade 2), diferenças e estornos (investigação, estacionado até o banco responder).
- Testes: regras de baixa em teste de unidade (muitos casos, rápido); acesso ao banco em teste de integração; só o fluxo "receber e quitar" em teste de sistema, por ser crítico (Aniche, "testar o pagamento com todo tipo de teste").
- Métricas: vazão de baixas por dia, tempo médio até conciliar, diferença entre previsto e recebido.
- Dependência: integração com banco/Pix/WhatsApp. A base só cobre parte (ver `docs/kb-mapa.md`): avisar "não coberto pela base" quando for o caso.

### 5.4 Robô [EXEMPLO]
O robô (automação de cobrança: lembretes, envio, regras de régua) é o módulo mais incerto.

- Épico: "Régua de cobrança automática".
- Por que ele pede spike: depende de serviço externo (WhatsApp, e-mail), limites de envio, regras do dono. Antes de estimar, spike com tempo curto (2 a 3 dias), código jogado fora (XP Casa do Código cap. 11).
- Esqueleto que anda (Crystal): primeiro um robô que lê uma cobrança vencida e registra "quem seria avisado" sem enviar nada. Depois liga o envio real.
- Histórias (fatias por caminho):
  - Como analista de cobrança, quero ver quais cobranças o robô vai avisar hoje, para aprovar antes do envio.
  - Como analista de cobrança, quero definir a régua (quantos dias depois do vencimento avisar), para adaptar ao cliente.
  - Como dono, quero ver o que o robô fez (enviou, falhou, parou), para confiar nele.
  - Como pagador, quero receber um aviso claro com o valor e como pagar, para quitar sem dúvida.
- Gherkin:
```
Cenário: Robô não envia fora do horário combinado
  Dado que a régua só permite envio entre 09:00 e 18:00
  Quando o robô encontra uma cobrança vencida às 20:00
  Então a cobrança entra na fila para o próximo horário permitido
  E nenhuma mensagem é enviada agora
```
- Prioridade: validar a fila e o registro (auditoria) antes do envio real. "Deve" = fila, registro, parar o robô; "Deveria" = régua por cliente; "Poderia" = mensagem personalizada.
- WIP: o robô afeta pagadores reais. Limite de WIP baixo e entrega em passos pequenos. Defeito conhecido nunca passa (Skarin). Teste de integração com banco; mock só do serviço externo (Aniche).
- Segurança e dados financeiros: pedir revisão antes de produção ([COMPL.], ver manual 01 seção de segurança e categoria `seguranca`).
- Métricas: itens enviados x falhos, tempo de resposta do pagador após aviso, % de cobranças quitadas após aviso (métrica de resultado).

### 5.5 Contestações [EXEMPLO]
Pagador discorda de um valor ou cobrança.

- Épico: "Tratar contestações".
- Histórias:
  - Como analista de cobrança, quero registrar uma contestação com motivo e prova, para guardar o histórico.
  - Como analista de cobrança, quero ver a fila de contestações por tempo de espera, para tratar as mais antigas.
  - Como consultor, quero responder a contestação com a decisão, para o pagador saber o que acontece.
  - Como dono, quero ver quantas contestações estão abertas e o valor em disputa (R$), para acompanhar o risco.
- Este módulo combina com Kanban de retaguarda (Skarin cap. 5): fila por prioridade, colunas "Em análise", "Esperando pagador" (estacionado), "Decidida". Cada item estacionado com dono para não ser esquecido.
- Gherkin:
```
Cenário: Contestação suspende a cobrança automática
  Dado uma cobrança com contestação aberta
  Quando o robô procura cobranças vencidas
  Então essa cobrança é ignorada
  E o motivo "contestada" aparece no registro do robô
```
- Métricas: lead time de contestação (abertura até decisão), distribuição (ex.: quantas decididas em até X dias), quantas voltam. Acompanhar por fila, não por pessoa.
- Interdependência: afeta Robô e Recebimentos. Cuidado com dependências entre itens (INVEST: independente). Dividir para que cada item entregue valor sozinho.

### 5.6 Exemplo de "esqueleto que anda" e primeira versão [EXEMPLO]
- Esqueleto (primeiro ciclo): tela JavaFX que lista contas a receber do mês, lendo do Postgres/Supabase por um endpoint Spring. Sem regra complexa. Objetivo: provar o caminho Frontend, Backend e Database funcionando junto e que a prévia publicada mostra a tela.
- Versão 1 (até 3 meses, `base-po.md`): ver o mês, fechar o mês, registrar recebimento. É o "deve".
- Versão 2: contestações e visão do que ficou fora do fechamento.
- Versão 3: robô com envio real (depois do spike e da validação da fila).
- Cada versão com data, meta mensurável e itens listados. A ordem acima é sugestão; o dono decide.

### 5.7 Definição de Pronto do IT.MK (rascunho) [COMPL.]
Combina `base-po.md` (seção 10) e Gomes 4.7:
- [ ] Todos os critérios de aceite do item cumpridos.
- [ ] Nenhum bug conhecido.
- [ ] Testes automáticos do item passando (unidade; integração quando mexe em banco ou serviço externo).
- [ ] Código revisado e dentro do padrão do projeto (nomes claros, funções pequenas).
- [ ] Tela testada nas larguras de computador, tablet e celular, sem barra de rolagem horizontal e sem espaço vazio.
- [ ] Cores e medidas só de `prototipo/css/tokens.css`; visão única (sem modo por perfil).
- [ ] Prévia publicada e link enviado ao dono.
- [ ] Não entregue na sexta-feira.
- [ ] Dono aceitou.

### 5.8 Rotina semanal sugerida do P.O. [COMPL.]
- Segunda: ver o quadro, WIP, bloqueios. Planejar o ciclo (quando começar).
- Quarta (meio do ciclo): refinamento (até 10%). Checagem de metade do ciclo (Martin): metade dos pontos pronta?
- Quinta: preparar demonstração só com o que ficou pronto horas antes.
- Fim do ciclo: revisão com o dono, retrospectiva do time, atualizar versões e burndown.
- Todo dia: 15 minutos de ponto de situação (o que fiz, o que farei, o que trava).

### 5.9 Como acompanhar (fonte única da verdade) [BASE + COMPL.]
- Um só lugar mostra o estado real (`base-po.md`). Radiador de informação (Crystal): painel visível com itens do ciclo, testes passando, itens entregues.
- Poucos números (3 a 4): vazão por semana, tempo até pronto, itens em andamento, defeitos achados depois de aceitos.
- Burndown do ciclo e da versão. Se o escopo muda, usar burnup.
- Não comparar pessoas. Não usar métrica como cobrança.

---

## 6. Como usar este manual no pedido do dono

Quando o dono pedir um plano, estrutura ou backlog:
1. Usar o modelo da seção 10 de `docs/base-po.md` (visão e meta, partes interessadas, valor, roadmap, histórias, critérios de aceite, prioridade, plano de versões, riscos, acompanhamento).
2. Para cada passo, consultar:
   - Histórias e critérios: seção 3 e 2.8.
   - Estimativa, velocidade e data: 2.3 e 2.4.
   - Versões e roadmap: 2.2.
   - Prioridade: 2.14.
   - Pronto: 2.7 e 5.7.
   - Quadro e WIP: 2.6.
   - Métricas: 2.13.
   - Riscos e armadilhas: seção 4.
3. Marcar [BASE] x [COMPL.] x [EXEMPLO] no entregável. Dizer o que não foi verificado.
4. Se mexer em visual: publicar a prévia e mandar o link.
5. Mudança pedida depois vira item novo. Não pendurar no item antigo.
6. Escrever para o dono em frases curtas, sem jargão: trocar "WIP" por "itens em andamento", "lead time" por "tempo até ficar pronto", "throughput" por "itens prontos por semana", "DoD" por "o que é pronto", "spike" por "teste curto para entender".

---

## 7. Tabela de fontes (caminhos)

Caminho-base: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`.
Cada página é um arquivo. Para a página N do livro, o arquivo é o número inicial + N − 1. As faixas abaixo são do `manifest.json`. A coluna "Trechos usados" cita arquivos onde confirmei o conteúdo (números aproximados, ±3).

### 7.1 Categoria `desenvolvimento-agil` (arquivos `desenvolvimento-agil/documentos/desenvolvimento-agil__doc_NNNNN.md`)

| Livro | Faixa de arquivos | Trechos usados |
|---|---|---|
| Agile: entregas frequentes e foco no valor (Gomes) | 00001 a 00162 | planejamento iterativo 00046; WIP 00055; histórias 00056 a 00060; estimativa 00067; releases e roadmap 00068 a 00072; DoD 00091; dívida 00098; métricas 00106 a 00110; retrospectivas 00112; Lean 00122 |
| Agile Estimating and Planning (Cohn) | 00163 a 00474 | cap. 1 em 00169; cap. 3 em 00187; cap. 4 em 00201; cap. 8 em 00235; cap. 9 e 10 em 00245 a 00273; cap. 12 em 00285; cap. 13 em 00297; cap. 14 em 00309; cap. 15 em 00331; cap. 16 em 00341; cap. 17 em 00351; cap. 18 em 00365; cap. 19 a 21 em 00375 a 00419 |
| Agile Project Management with Scrum (Schwaber) | 00475 a 00661 | empírico, "done" 00498; lições de papéis 00504 a 00540; Apêndice A em 00628 a 00635; Apêndice B em 00636 a 00640 |
| BDD in Action (Smart) | 00662 a 01046 | BDD, TDD 00704 a 00708; Feature Injection 00755 a 00760; opções reais e três amigos 00799 a 00803; cenários expressivos 00820 a 00826; arquivos de feature e tags 00826 a 00830; documentação viva e IC (caps. 11 e 12, perto do fim da faixa) |
| Código Limpo (Martin, PT) | 01047 a 01444 | prefácio 01048 a 01055; nomes 01072; funções 01091; erro 01154; testes de unidade 01170 |
| Crystal Clear (Cockburn) | 01445 a 01840 | propriedades 01484; esqueleto que anda 01528; radiadores 01532; oficina de reflexão 01544; planejamento relâmpago 01547 |
| XP: práticas para o dia a dia (Casa do Código) | 01841 a 02001 | histórias e INVEST 01894 a 01906; testes de aceite 01906 a 01910; jogo do planejamento 01914 a 01925; spike 01922; IC 01970; ritmo sustentável 01978 |
| Métricas Ágeis (Albino, Casa do Código) | 02002 a 02193 | WIP 02039 a 02050; lead time 02069 a 02075; vazão e Little 02104 a 02110; CFD 02130; Monte Carlo 02165; cap. 7 em 02181 a 02190 |
| Scrum 360 (Audy, Casa do Código) | 02194 a 02359 | visão e histórias 02261 a 02266; MVP e mapa 02267 a 02270; planejamento 02273; Planning Poker 02275; TDD 02277; quadro e daily 02279 a 02284; burndown 02284 a 02288; revisão 02289; retro 02292; estimativas 02314 |
| Scrum: gestão ágil (Sabbagh, Casa do Código) | 02360 a 02714 | Product Backlog e estimativa 02494 a 02514; história de usuário 02515 a 02525; DoD 02534 a 02538; DoR e burndown 02566 a 02572; eventos 02574 a 02578 |
| TDD: teste e design (Aniche, Casa do Código) | 02715 a 02880 | por que testar 02727; vantagens 02751; tipos de teste 02844; TDD em integração 02852 |
| Testes Automatizados (Aniche, Casa do Código) | 02881 a 03046 | testar o necessário e cobertura 02904 a 02926; "e agora?" 03040 |

### 7.2 Categoria `metodologias-ageis-avancadas` (arquivos `metodologias-ageis-avancadas/documentos/metodologias-ageis-avancadas__doc_NNNNN.md`)

| Livro | Faixa de arquivos | Trechos usados |
|---|---|---|
| Clean Agile (Martin) | 00001 a 00235 | planejar, histórias, estimar, velocidade 00090 a 00110; práticas técnicas 00114 a 00135 |
| Extreme Programming Explained (Beck, edição alemã) | 00236 a 00442 | 12 práticas 00308; gestão e medidas 00326; planejamento 00340 a 00346; testes 00370; regra 20:80 00404 |
| Real-World Kanban (Skarin) | 00443 a 00575 | capítulo 1 (práticas) 00457 a 00476; cap. 2 a 4 a partir de 00477; capítulo 5 (retaguarda) 00538 a 00549 |
| Cambridge Handbook of the Learning Sciences | 00576 a 01377 | só sumário e partes (00580 a 00590) |

Notas sobre a pasta: o `README` da categoria fala em `livros/<livro>/indice_do_livro.md`. Essa pasta não existe nesta cópia; o `indice.md` de cada categoria lista os livros e o número de páginas.

### 7.3 Outros arquivos de apoio
- `docs/base-po.md` (método do P.O.).
- `docs/kb/01-po-produto.md` (RICE, WSJF, Kano, OKR e segurança de produto).
- `docs/kb-mapa.md` (mapa da base e lacunas).
- `CLAUDE.md` (regras do projeto).

---

## 8. Lacunas e o que NÃO foi verificado

- Nenhum dos livros fala de cobrança, marketplaces, Supabase, JavaFX ou Spring. Todos os exemplos do IT.MK são ilustrativos (seção 5).
- Li de forma completa ou profunda: Scrum 360 (caps. 5 a 8), Sabbagh (backlog, história, DoD, DoR), Schwaber (Apêndices A e B e lições), Cohn (todos os resumos de capítulo e partes de 1 a 3), Albino (caps. 2 a 7), Skarin (cap. 1 e 5), Clean Agile (cap. 3), Smart (caps. 1 a 5, 3 amigos), XP Casa do Código (caps. 7, 8, 10, 11, 20, 21), Gomes (caps. 3 a 5), Beck (caps. 10, 12, 15, 18, 23), Crystal (estratégias e técnicas), Aniche (partes dos dois livros).
- Li só em parte: Código Limpo (prefácio e índices; o conteúdo técnico não foi lido a fundo), Cambridge (só sumário), Crystal (capítulos 4 a 8 não lidos), Clean Agile (capítulos de práticas técnicas e de equipe só pelo índice), Smart (caps. 6 a 12, automação com JBehave/Cucumber e documentação viva, só pelo índice), Skarin (capítulos 2 a 4).
- Os livros em inglês e português foram lidos via OCR; podem ter erros de nome e número. Conferir antes de citar literal.
- O arquivo "Extreme Programming Explained" da base é a 1ª edição em alemão; a 2ª edição (práticas primárias, ciclo semanal e trimestral) NÃO está na base.
- Schwaber (2004) usa ciclo de 30 dias e 8 horas de planejamento. Isso é desatualizado frente aos livros brasileiros. Não adotei como regra do IT.MK.
- Pontos de história: Sabbagh diz que os criadores hoje não recomendam. Cohn e Martin recomendam. O IT.MK segue o `base-po.md` (pontos, Fibonacci), mas fica a opção de contar itens quando houver histórico.
- Monte Carlo e CFD: expliquei o conceito; não detalhei fórmulas nem ferramentas.
- Não coberto pelos livros: Kano a fundo, RICE, WSJF, OKR (estão só citados ou no manual 01), segurança de dados financeiros, testes de interface JavaFX, CI/CD com Spring (ver categorias `devops`, `seguranca`, `frontend`, `backend`).
- Valores de limite de WIP, velocidade inicial e tamanho de ciclo do IT.MK: NÃO verificados. Só dá para definir depois de 2 a 3 ciclos reais.
