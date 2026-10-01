# Manual de consulta 06: Frontend, design e equipes (para o P.O. do IT.MK)

Para quem é: o P.O. do IT.MK. Serve para montar planos da frente Frontend (telas, componentes, layout) e para conduzir o time (alinhar, dar feedback, fazer retrospectiva, validar telas) sem reler a base.

Caminho-base dos arquivos citados (somente leitura): `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`
Nas tabelas, "doc NNNNN" quer dizer `<categoria>/documentos/<categoria>__doc_NNNNN.md`. Quase sempre 1 doc = 1 página do livro.

Legenda de confiança (mesma dos outros manuais):
- **[BASE]** = está escrito no material da base.
- **[COMPL.]** = conhecimento geral meu, a base não traz ou só cita pelo nome. Confirmar antes de tratar como regra do dono.
- **[PROTÓTIPO]** = conferido por mim lendo `prototipo/css` e `prototipo/js` (não é da base).

Regra de ouro (já vale no IT.MK): plano segue `docs/base-po.md` seção 10 e o `CLAUDE.md` (visão única, sem espaço vazio, sem barra de rolagem horizontal, texto quebra linha, cores e medidas só em `tokens.css`, publicar prévia a cada mudança visual).

---

## 0. Mapa rápido: o que existe e o que vale ler

A base NÃO tem uma pasta `livros/` nestas categorias: tudo está em `documentos/`. Os textos vêm de PDF lido por OCR, então têm defeitos.

| Categoria | Material | Docs | Vale ler? | Para quê |
|---|---|---|---|---|
| frontend | Eloquent JavaScript (21 capítulos + código) | 00002 a 00023 | Pouco. Só DOM (00016), eventos (00017), assíncrono (00013), formulários/HTTP (00020) | O protótipo é HTML/JS; no final vira JavaFX. Serve para entender o protótipo, não o produto final |
| design | Atomic Design (Brad Frost), site em Markdown, 5 capítulos | cap.1 = 00020, cap.2 = 00021, cap.3 = 00022, cap.4 = 00023, cap.5 = 00024; prefácio 00040; roteiro 00170 | SIM. É o núcleo de design system | Átomos a páginas, inventário de interface, governança do design system |
| padroes-e-design-de-software | Introdução e boas práticas em UX Design (Teixeira) | 1289 a 1513 | SIM | Usabilidade, hierarquia, formulários, microtextos, biblioteca de padrões, teste com usuário |
| padroes-e-design-de-software | UX e Usabilidade aplicados em Mobile e Web (Caelum) | 2328 a 2492 | SIM | 10 heurísticas de Nielsen, C.R.A.P., Lei de Hick, teste com 5 pessoas |
| padroes-e-design-de-software | Web Design Responsivo (Casa do Código) | 2493 a 2640 | SIM | Layout fluido, media queries, pontos de quebra, imagens flexíveis |
| padroes-e-design-de-software | A Web Mobile (Sérgio Lopes) | 1 a 220 | SIM (mobile-first, zoom, viewport) | Mobile-first, zoom do usuário, acessibilidade básica |
| padroes-e-design-de-software | CSS Eficiente (Casa do Código) | 468 a 603 | SIM | Especificidade, OOCSS, SMACSS, BEM, namespaces, ITCSS |
| padroes-e-design-de-software | HTML5 e CSS3 (Casa do Código) | 1085 a 1288 | Pouco | box-sizing, tipos de campo de formulário, semântica |
| empresa-e-cultura-organizacional | Sprint (Jake Knapp) | 1809 a 2014 | SIM | Design sprint de 5 dias para validar telas |
| empresa-e-cultura-organizacional | Agile Retrospectives (Esther Derby) | 169 a 349 | SIM | Retrospectiva em 5 fases |
| empresa-e-cultura-organizacional | A arte de dar feedback (HBR) | 1 a 168 | SIM | Dar feedback sem gerar defesa |
| empresa-e-cultura-organizacional | Coaching Agile Teams (Lyssa Adkins) | 350 a 696 | SIM (cap. 5 e 9) | Como o P.O. age, coaching do P.O., níveis de conflito |
| empresa-e-cultura-organizacional | Lean Enterprise (Casa do Código) | 786 a 1272 | Médio | Backlog como hipóteses, tipos de MVP |
| empresa-e-cultura-organizacional | More Agile Testing (Crispin, Gregory) | 1273 a 1808 | Médio | Quadrantes de teste, "três amigos", teste exploratório |
| empresa-e-cultura-organizacional | Como melhorar o desempenho da equipe de dev (Software House) | 697 a 785 | Pouco | Genérico (etapas de projeto e KPIs). Ver 1.14 |
| lideranca-e-gestao-de-equipe | A Regra é Não Ter Regras (Reed Hastings) | 1 a 259 | Médio | Feedback sincero (4 As), contexto em vez de controle |
| lideranca-e-gestao-de-equipe | Managing for Happiness (Jurgen Appelo) | 260 a 1085 | Médio | 7 níveis de delegação, motivadores |
| lideranca-e-gestao-de-equipe | O Ego é Seu Inimigo (Ryan Holiday) | 1086 a 1212 | Pouco | Postura pessoal do P.O. |
| carreira-e-habilidades | Gestão de Produtos (Joaquim Torres) | 1706 a 2130 | SIM | Papel do P.O., priorização, "dizer não", dados, UX x produto |
| carreira-e-habilidades | Direto ao Ponto (Casa do Código) | 1369 a 1555 | Médio | Receita colaborativa de MVP (visão, personas, jornada, funcionalidades) |
| carreira-e-habilidades | A Startup Enxuta (Eric Ries) | 230 a 439 | Médio | Construir, medir, aprender |
| carreira-e-habilidades | resto da categoria (programador, Linux, SEO, estatística, generalistas...) | vários | NÃO para o P.O. | Ignorado de propósito (ver 1.13) |

Dicas de leitura (economizam tempo):
1. Os livros UX e Responsivo vêm do OCR sem espaços entre palavras ("Simplicidadenãoésimples"). Para buscar, use trechos curtos sem espaço ou procure pelo título do capítulo.
2. Lean Enterprise (docs 786 a 1272) está com a fonte trocada: as letras saem deslocadas ("GFSFODJBNFOUP" quer dizer "gerenciamento"). Para ler, some 31 ao código de cada caractere ASCII (ou procure pelo texto já legível dos títulos). Os capítulos úteis estão em torno de 884 a 960.
3. O Atomic Design em `design/documentos` tem muito lixo (fontes, imagens, layouts do site). Só os docs listados acima têm texto de método.
4. Sprint (Knapp) tem os checklists prontos no fim: docs 1987 a 2014.

---

## 1. Resumo por material

### 1.1 Atomic Design, Brad Frost [BASE] (design, docs 00020 a 00024)
- Cap. 1 (porquê): design de páginas inteiras ficou inviável; interfaces precisam ser sistemas. Guias de estilo e bibliotecas de padrões dão consistência, vocabulário comum, rapidez e testes mais fáceis. Desafios: convencer quem paga, tempo, manutenção e governança, falta de contexto e falta de método.
- Cap. 2 (o quê): cinco etapas. Átomos (elementos que não se dividem: rótulo, campo, botão), moléculas (grupo simples que funciona junto: rótulo + campo + botão = busca), organismos (seção completa da tela: cabeçalho, grade de produtos), templates (a estrutura da página, com o "esqueleto" do conteúdo), páginas (o template com conteúdo real, onde se testa se o sistema aguenta). Vale para qualquer interface, não só web. Não é método de CSS nem de JavaScript. Os nomes podem ser trocados pelos da empresa (exemplo da GE).
- Cap. 3 (ferramentas): Pattern Lab, dados dinâmicos, variações, documentação viva. Pouco útil para nós (é ferramenta web).
- Cap. 4 (processo): "é gente". Quando começar: agora, de carona num projeto. Como vender: "vocês gostam de economizar tempo e dinheiro?". Inventário de interface em 5 passos (reunir todas as áreas, preparar, tirar print de tudo e agrupar, apresentar, definir próximos passos). Também: teste dos 20 segundos, style tiles, element collages, iterar no navegador.
- Cap. 5 (manter): fazer algo, mostrar que é útil, oficializar. Governança: o que acontece quando um padrão não serve, quem aprova, como se retira. Comunicar mudanças (changelog, roadmap, histórias de sucesso, dicas), treinar, ser visível. Cuidado para não virar "faroeste": nem todo capricho vira padrão novo.

### 1.2 Introdução e boas práticas em UX Design, Fabricio Teixeira [BASE] (padroes, docs 1289 a 1513)
- Cap. 4 usabilidade (docs 1374 a 1400): simplicidade não é simples. Quatro jogadas para tirar excesso: remover, organizar, esconder, mover. Informação em doses pequenas, hierarquia (se tudo é importante, nada é), dizer ao usuário o que fazer a seguir, dar retorno do estado do sistema (toda ação tem reação), evitar erro antes de comunicá-lo, simplificar formulários.
- Cap. 5 detalhes (docs 1401 a 1412): evitar elementos em excesso (reaproveitar o que já está na tela), revelar aos poucos, respeitar o tempo do usuário (progresso sem travar), adivinhar a intenção, ser honesto nos pedidos.
- Cap. 6 microtextos: texto curto, na linguagem do usuário, comunicar benefício.
- Cap. 7 biblioteca de padrões (docs 1425 em diante): lista os elementos comuns (texto, estrutura de página, tabelas, navegação, busca, botões primário e secundário...). Ganhos: consistência, agilidade; padronizar não mata criatividade.
- Cap. 8 teste com usuário (doc 1437 em diante): sair da mesa, 3 a 5 pessoas já dão sinais, "testar com 1 é infinitamente melhor que com 0", testar em protótipo ou rabisco, não esperar o produto pronto. Lista de 10 desculpas comuns para não testar.

### 1.3 UX e Usabilidade aplicados em Mobile e Web, Caelum [BASE] (padroes, docs 2328 a 2492)
- 10 heurísticas de Nielsen (docs 2411 a 2419) e outros princípios de interação (docs 2419 a 2425): navegação clara e compacta, título da página igual ao nome no menu, botão para ação e link para navegação, no máximo 1 ou 2 ações principais por tela, itens relacionados juntos, rapidez, "inove só onde há algo único", "interface incrível é quase invisível".
- Lei de Hick (tempo de decisão cresce com o número de opções) e zonas do polegar (doc 2460).
- C.R.A.P.: contraste, repetição, alinhamento, proximidade (docs 2473 a 2480).
- Teste de usabilidade (docs 2485 a 2490): roteiro, piloto, ajustar o protótipo entre testes, relatório, e plano de ação com o time. Nielsen: 5 pessoas bastam.
- Gamestorming para aplicar as heurísticas em dupla (doc 2453 em diante).

### 1.4 Web Design Responsivo, Casa do Código [BASE] (padroes, docs 2493 a 2640)
- Layout fluido: medidas relativas, "fórmula mágica" alvo/contexto = resultado (doc 2523 em diante), converter layout fixo em fluido.
- Meta tag viewport (doc 2534): `width=device-width, initial-scale=1`.
- Imagens e recursos flexíveis (doc 2554): `img { max-width: 100%; }`.
- Media queries (doc 2581 em diante) e pontos de quebra bem pensados (doc 2591): o ponto de quebra é onde o conteúdo "quebra" (ex.: a barra lateral deve cair abaixo do conteúdo, ou a pessoa precisaria rolar). Não existe lista de pontos "certos" universal, cada projeto tem os seus.
- Uso consciente: arquivo único ou separados, começar do pequeno ou do grande, empilhar regras (doc 2597 em diante).

### 1.5 A Web Mobile, Sérgio Lopes [BASE] (padroes, docs 1 a 220)
- Mobile-first (doc 38): começar pelo mínimo obriga a priorizar conteúdo; o caminho inverso (desktop primeiro, depois espremer) é mais difícil e sai pesado. Tela maior não significa vontade de ver mais coisas.
- Layout fluido, media queries, viewport (todo um capítulo), pixels de CSS x físicos, telas de alta resolução.
- Zoom do usuário (docs 74 e 75): não remover o zoom. Ao dar zoom de 200% o viewport em pixels CSS fica menor (a página se comporta como numa tela mais estreita). Isso é acessibilidade básica: nem todo usuário tem visão perfeita.
- Cap. 16 "media queries também ajudam na acessibilidade" (aparece no sumário do livro, doc 00020 em diante; não li o capítulo).

### 1.6 CSS Eficiente, Casa do Código [BASE] (padroes, docs 468 a 603)
- Especificidade (doc 481): sistema de pesos; `!important` só para o que foi feito (utilitários); não usar ID como seletor de estilo (cap. 2).
- OOCSS (cap. 3): evitar repetição; separar estrutura de aparência.
- SMACSS (cap. 4): Base, Layout, Módulo, Estado, Tema.
- BEM (doc 522): `.bloco__elemento` e `.bloco--modificador`.
- Namespaces (doc 558 em diante): prefixos `o-` objeto, `c-` componente, `u-` utilitário (nunca reatribuir), `t-` tema, `s-` escopo, `is-/has-` estado, `js-` gancho de JavaScript, `qa-` teste, hacks identificados.
- ITCSS (doc 588): camadas do mais genérico ao mais específico: Settings, Tools, Generic, Elements, Objects, Components, Trumps.
- Pré-processadores e task runners: fora do escopo do protótipo.

### 1.7 HTML5 e CSS3, Casa do Código [BASE] (padroes, docs 1085 a 1288)
Útil só em dois pontos: `box-sizing: border-box` (doc 1131), tipos de campo (`email`, `tel`, `number`, `date`...) e atributos `required`, `maxlength`, `pattern`, `label for` (doc 1215 e seguintes). O resto é tutorial de iniciante.

### 1.8 Eloquent JavaScript [BASE] (frontend, 273 docs; úteis 4)
- DOM (doc 00016): o navegador adia o cálculo de layout; alternar "ler medida / mudar DOM" em laço força muitos cálculos e deixa lento. `requestAnimationFrame` para animação. Escolher elementos por consulta de seletor.
- Eventos (doc 00017): o evento "sobe" do elemento até a raiz (propagação); `stopPropagation` e `preventDefault` existem, mas `preventDefault` em excesso atrapalha o que o usuário espera. `focus` e `blur` não sobem. Eventos que disparam muito (scroll, mousemove, digitação) pedem "debouncing" com timer.
- Assíncrono (doc 00013): callbacks rodam depois; erro em código assíncrono não cai no `catch` de fora (use promessas e `async/await`).
- Formulários (doc 00020, seções "Form fields", "Focus", "Disabled fields"): campo desabilitado, foco, formulário como um todo.
- Erros (doc 00010): testes automáticos e asserções ajudam a achar bug cedo.
Tudo isso é JavaScript. No produto final (JavaFX) o que sobra é a ideia, não o código.

### 1.9 Sprint, Jake Knapp [BASE] (empresa, docs 1809 a 2014)
Método do Google Ventures: em 5 dias, resolver um problema grande desenhando, prototipando e testando com clientes reais. Detalhe na seção 5.5.

### 1.10 Agile Retrospectives, Esther Derby [BASE] (empresa, docs 169 a 349)
Estrutura fixa em 5 fases (preparar o clima, reunir dados, gerar insights, decidir o que fazer, fechar). Pode caber em 1 hora ou 3 dias. Atividades prontas para cada fase (lista no sumário, doc 177 em diante). Detalhe na seção 5.4.

### 1.11 A arte de dar feedback, HBR [BASE] (empresa, docs 1 a 168)
Feedback constante (informal, no dia a dia) e formal (avaliação). Pontos centrais (docs 15 a 23): construir relação antes; falar de fatos e comportamento, "ficar do seu lado da rede" (descrever como você se sente com o comportamento, sem adivinhar a intenção do outro); a pergunta "posso dar um feedback?" já ativa o modo luta ou fuga; dar a quantidade certa de emoção. Outros capítulos: más notícias, síndrome do fracasso inevitável (doc 37: o chefe cria o baixo desempenho com expectativa baixa), reconhecer bom trabalho do jeito certo, avaliações (doc 68), metas (doc 82), histórico de desempenho, pessoa na defensiva (doc 106, "atenha-se aos fatos"), alto desempenho (doc 111), priorizar feedback quando falta tempo (doc 117), deixar a equipe falar primeiro (doc 123).

### 1.12 Coaching Agile Teams, Lyssa Adkins [BASE] (empresa, docs 350 a 696; inglês)
O livro é para quem apoia times (Scrum Master, coach), mas o cap. 5 tem um trecho sobre coachar o P.O. (docs 473 a 481) e o cap. 9 sobre conflito (docs 580 a 587). Detalhe na seção 5.7. Também cobre facilitar daily, planejamento, revisão e retrospectiva (cap. 6).

### 1.13 Carreira e habilidades, só o que serve ao P.O. [BASE]
- Gestão de Produtos (Joaquim Torres, ex-Locaweb), docs 1706 a 2130: P.O. e gestor de produto são "dois lados da mesma moeda" (doc 1761 e vizinhos). Liderar sem ser chefe de ninguém (doc 1772). Priorizar roadmap (doc 1890): valor x custo, Kano, árvore de produto, "compre suas funcionalidades", UserVoice. Aprender a dizer NÃO (doc 1901 e 1902). Ser "data geek" (doc 1905). UX e gestão de produtos (docs 1986 a 1995): persona, protótipo, o P.O. equilibra os desejos de UX e de engenharia.
- Direto ao Ponto (docs 1369 a 1555): receita de oficina colaborativa que gera o "canvas MVP": visão do produto, personas, funcionalidades, jornadas do usuário, regras, sequenciador, esforço, tempo e custo. Há exemplo de "inception" em 6 horas no apêndice.
- A Startup Enxuta (docs 230 a 439): ciclo construir-medir-aprender (resumo no doc 236); aprendizado validado (doc 242); decidir perseverar ou pivotar (doc 317).
- Não usado: livros de carreira de programador, Linux, SEO, "Como mentir com estatística" (útil só como lembrete de desconfiar de gráfico, não li a fundo), Range, Learning 3.0, Brooks (a Lei de Brooks já está em `docs/base-po.md`, seção 8).

### 1.14 Lean Enterprise, Casa do Código [BASE] (empresa, docs 786 a 1272)
Trechos úteis: (a) trocar "requisitos" por "hipóteses" no formato "acreditamos que X será valioso para Y; vamos saber que acertamos quando Z" (doc 884); (b) tipos de MVP, do mais barato ao mais caro (docs 925 e 926): esboço/wireframe (rápido, gera entendimento, mas não testa uso), protótipo clicável (testa design e usabilidade), vídeo, "mágico de Oz"/serviço manual; (c) "nosso backlog deveria ser uma lista de hipóteses a testar, não de requisitos a construir" (doc 950); (d) três horizontes de investimento. O que não se aplica: governança financeira de grandes empresas.

### 1.15 More Agile Testing, Crispin e Gregory [BASE] (empresa, docs 1273 a 1808; inglês)
- Qualidade é do time inteiro. Teste é atividade, não fase.
- Quadrantes de teste (doc 1384): Q1 testes de código que guiam o desenvolvimento; Q2 testes de negócio que guiam (histórias, protótipos, UX, teste A/B); Q3 testes de negócio que criticam o produto (exploratório, usabilidade, aceite pelo usuário); Q4 testes técnicos que criticam (desempenho, carga, segurança, atributos de qualidade).
- "Três amigos": cliente (P.O.), programador e testador conversam antes de construir (introdução do livro, docs 1273 a 1290). Teste exploratório com "missões" (charters), personas e "tours". Ambiente de teste (staging) como cópia do real.

### 1.16 Como melhorar o desempenho da equipe de dev, Software House [BASE] (empresa, docs 697 a 785)
Livreto de 2023, genérico e em sequência de fases (planejamento, análise, design, implementação, testes, implantação, manutenção) com listas de KPIs. Pouco aproveitável: segue lógica de cascata, sem método de ágil. Usar só como lista de ideias de indicador (progresso, qualidade, satisfação do cliente, prazo). Não adotar o fluxo.

### 1.17 A Regra é Não Ter Regras, Reed Hastings [BASE] (lideranca, docs 1 a 259)
Cultura Netflix: densidade de talento primeiro, depois franqueza, depois tirar controles. "4 As" do feedback (docs 45 e 46): Alvo a alcançar (intenção de ajudar), Ação específica (algo que a pessoa pode mudar), Agradecer (ao receber), Aceitar ou descartar (decide quem recebe). Feedback "a qualquer hora e em qualquer lugar". Liderar com contexto em vez de controle (cap. 9). Cuidado: o livro é de uma empresa gigante, nem tudo cabe num time pequeno do IT.MK.

### 1.18 Managing for Happiness, Jurgen Appelo [BASE] (lideranca, docs 260 a 1085; inglês)
Jogos e práticas de gestão. Úteis: 7 níveis de delegação e Delegation Poker (docs 482 a 492), 10 motivadores (curiosidade, honra, aceitação, domínio, poder, liberdade, relação, ordem, objetivo, status; docs 815 a 842), caixa de elogios (kudo box), mapas pessoais, métricas. O Delegation Poker já aparece em `docs/base-po.md` (seção 3).

### 1.19 O Ego é Seu Inimigo, Ryan Holiday [BASE] (lideranca, docs 1086 a 1212)
Três partes: aspiração, sucesso, fracasso. Ideias úteis para o P.O.: ser sempre aprendiz, não contar história para si mesmo, controlar o ego quando o produto der certo, ter critérios próprios de avaliação. Postura pessoal, não método.

---

## 2. Regras acionáveis de interface

Cada regra tem um código (FE-xx) para citar nos itens do backlog.

### 2.1 Design atômico (átomos, moléculas, organismos, templates, páginas) [BASE: Atomic Design cap. 2]
- FE-01. Toda tela nova é desenhada em 5 níveis: átomos (botão, campo, chip, ícone), moléculas (rótulo + campo; número + legenda), organismos (cartão, tabela, barra de filtro, modal), template (estrutura da tela com o esqueleto do conteúdo) e página (o mesmo template com dados reais do IT.MK).
- FE-02. Antes de criar um componente novo, procurar se já existe um igual ou parecido (inventário). Só cria novo se for caso recorrente, não capricho de uma tela (cap. 5: "se toda vontade vira padrão novo, vira faroeste").
- FE-03. Molécula faz uma coisa só ("responsabilidade única"). Se o componente faz duas coisas, quebrar em dois.
- FE-04. O template mostra a estrutura do conteúdo: tamanho de imagem, número de caracteres de título, quantidade de colunas. Texto longo e valor grande em R$ precisam caber (regra de layout 3 do `CLAUDE.md`).
- FE-05. A "página" (com dados reais) é o teste do sistema: testar com o pior caso (nome de loja com 80 letras, 0 itens, 1 item, 500 itens, valor de 7 dígitos). O livro dá o exemplo: 1 item no carrinho x 10; título de 40 x 340 caracteres.
- FE-06. Dar nomes simples e iguais para todos. Se o time chama a mesma coisa de três nomes, escolher um e usar em tela, código e backlog. Pode trocar os nomes "átomo, molécula..." por nomes da empresa; o que importa é o vocabulário comum (exemplo da GE).
- FE-07. Átomo, molécula e organismo são "abstratos"; mostrar sempre em contexto (template). O cliente (dono) olha a página; o time olha o sistema. O P.O. precisa ver os dois.

### 2.2 Sistema de design e tokens [BASE: Atomic Design cap. 1 e 5; COMPL. para "tokens"]
- FE-10. Só existe uma fonte para cor, fonte, raio, sombra e tempo: `prototipo/css/tokens.css` [PROTÓTIPO, já é regra do `CLAUDE.md`]. Nenhum valor solto (hex, rgba, px de cor) em outro arquivo. Nos capítulos do Atomic Design a palavra "token" não aparece (só no anúncio de um curso, doc 00178); o conceito deles é "style guide / pattern library". Chamar de token é [COMPL.].
- FE-11. Um design system é produto: precisa de dono, roteiro e governança (cap. 5). Perguntas que o dono (P.O.) precisa responder por escrito: o que fazer quando um padrão não serve; como pedir um padrão novo; como retirar um padrão velho; quem aprova; quem atualiza a documentação; como a mudança chega nas telas.
- FE-12. Três tipos de mudança em um padrão: modificar, adicionar, remover. Cada tipo vira item de backlog separado (alinhado a "mudança de ideia = item novo", `docs/base-po.md` seção 6).
- FE-13. Comunicar mudança: manter um registro de mudanças (o que mudou no sistema de design neste mês), um roteiro (o que vem) e dicas de uso. Pode ser um arquivo em `docs/` ou o próprio protótipo publicado.
- FE-14. Treinar quem usa: sessão em dupla (pair) é a melhor forma de aprender e de achar falha do sistema (cap. 5).
- FE-15. A biblioteca de padrões também é entregável do projeto (UX book cap. 7): deve existir uma tela ou arquivo "catálogo" listando botões, chips, abas, cartões, tabelas, modais, cada um com o estado normal, foco, desabilitado, erro e vazio.
- FE-16. Priorizar o design system em ordem: fazer algo, mostrar que é útil, oficializar. Para o IT.MK isso já aconteceu (tokens + componentes); o que falta é oficializar (catálogo e governança), ver seção 3.

### 2.3 Usabilidade e heurísticas [BASE: UX book cap. 4 a 8; Caelum cap. 8 a 10]
- FE-20. Cada tela tem 1 ação principal (no máximo 2). Ações secundárias com peso visual menor (botão `.btn.sec`). Botão é para ação, link é para navegação.
- FE-21. Cada tela diz onde o usuário está (título igual ao nome do item de menu) e o que fazer a seguir.
- FE-22. Estado do sistema sempre visível: toda ação tem resposta (aviso/toast, botão desabilitado enquanto processa, indicador de carregamento, estado vazio com texto). Evita clique duplo e lançamento repetido de cobrança (exemplo do livro: duplicidade de compra).
- FE-23. Prevenir erro antes de avisar: desabilitar o que não pode, confirmar ações perigosas (excluir, enviar cobrança em massa, mudar status), pedir confirmação com consequência escrita no botão ("Enviar 12 cobranças", não "OK").
- FE-24. Mensagem de erro clara, junto do campo, dizendo como resolver.
- FE-25. Reconhecer em vez de lembrar: mostrar o caminho (de onde veio), rótulos completos, filtros aplicados visíveis (chips).
- FE-26. Consistência: o mesmo elemento com a mesma função tem o mesmo visual e o mesmo texto em todas as telas (botão de salvar sempre igual).
- FE-27. Hierarquia: poucos tamanhos de fonte; cor forte só para a ação principal e para o que é crítico (atraso, travado). "Quando tudo é importante, nada é."
- FE-28. Decisão: menos opções, decisão mais rápida (Lei de Hick). Filtros e menus em grupos lógicos, não em lista de 15 itens soltos.
- FE-29. Formulário: pedir só o necessário; campo com rótulo visível (`label for`); tipo certo de campo (`email`, `date`, `number`, `tel`); validar no ato e mostrar o erro no lugar. Não usar texto de exemplo (placeholder) como única explicação.
- FE-30. Microtexto: curto, na linguagem do usuário do IT.MK (analista de cobrança, consultor), benefício antes de função. Sem jargão técnico na tela.
- FE-31. Revelar aos poucos: o que é raro fica atrás de um clique (gaveta, aba, "ver mais"), mas a regra do IT.MK de "visão única e completa" continua valendo: nada é escondido por perfil. Esconder aqui é só organizar a mesma visão em camadas, sem tirar dado.
- FE-32. Zonas do polegar no celular: ações frequentes ao alcance (parte de baixo); o protótipo já usa menu inferior abaixo de 720 px [PROTÓTIPO].
- FE-33. C.R.A.P.: contraste real entre o que importa e o resto; repetição do mesmo estilo; alinhamento a uma grade; itens relacionados próximos.
- FE-34. Testar com gente: 3 a 5 pessoas do perfil (analistas de cobrança, consultores) já mostram a maioria dos problemas. Testar com protótipo, não esperar a tela pronta (UX book cap. 8).

### 2.4 Responsivo sem rolagem horizontal [BASE: Responsivo, A Web Mobile; regra do CLAUDE.md]
- FE-40. Meta viewport em toda página: `width=device-width, initial-scale=1` (o protótipo já tem [PROTÓTIPO]). Nunca bloquear o zoom do usuário.
- FE-41. Medidas relativas (%, `fr`, `minmax(0,1fr)`, `rem`/`em`) em vez de largura fixa em px. Fórmula: alvo ÷ contexto = resultado.
- FE-42. Imagem, ícone grande e gráfico: `max-width: 100%`.
- FE-43. Todo filho de grade ou `flex` que tenha texto: `min-width: 0` (ou `minmax(0,1fr)`), senão o texto empurra a página. [COMPL., prática padrão; o protótipo usa muito `minmax(0,1fr)`]
- FE-44. Texto longo quebra linha dentro do espaço: `overflow-wrap: break-word` (e `word-break: break-all` só para chave de nota, e-mail, link). Nunca cortar com reticências sem alternativa (regra 3 do `CLAUDE.md`).
- FE-45. Pontos de quebra pelo conteúdo, não por aparelho: quebrar onde o layout deixaria de caber ou forçaria rolagem horizontal (Responsivo cap. 5). O protótipo usa tanto `@media` (720, 860, 900, 1100, 1500 px) quanto `@container` (420 a 1300 px) [PROTÓTIPO].
- FE-46. Mobile-first: pensar primeiro o mínimo que cabe numa coluna e depois ampliar. Serve também para decidir o que é essencial na tela (FE-20).
- FE-47. Blocos de alturas diferentes se encaixam sem buraco: `grid` com `repeat(auto-fit, minmax(...,1fr))`, colunas CSS (`columns` / "masonry" como em `.masonry` da tela de Configurações) ou `grid-auto-flow: dense`. Evitar linhas com altura presa que deixam vazio (regra 4).
- FE-48. Tabela: colunas se distribuem pelo conteúdo e ocupam 100% da largura; em tela estreita, a linha vira bloco (como já faz `.tab-fe` com `@container`). Nunca `overflow-x:auto` como solução [PROTÓTIPO: ver ponto de atenção A1 na seção 3.4].
- FE-49. Teste de largura obrigatório antes de aceitar: ver checklist 4.3.

### 2.5 Acessibilidade [BASE só em parte; COMPL. no restante]
A base trata acessibilidade de forma leve: zoom e fonte relativa (A Web Mobile, docs 74 a 75), `label for` (HTML5 e CSS3), contraste (C.R.A.P.), media queries para acessibilidade (A Web Mobile cap. 16). Não há norma (WCAG) nos materiais.
- FE-50. [BASE] Não bloquear zoom; layout deve funcionar em zoom 200% sem rolagem horizontal.
- FE-51. [BASE] Fonte e espaçamentos relativos para o usuário poder ampliar.
- FE-52. [BASE] Todo campo tem rótulo ligado ao campo.
- FE-53. [BASE/PROTÓTIPO] Contraste forte entre texto e fundo. O protótipo usa texto escuro `--texto` (#003817) sobre fundos claros, e `--verde-claro` com `--tinta` nos ativos.
- FE-54. [COMPL.] Cor nunca é a única pista: situação (atrasado, travado, em curso) precisa de texto ou ícone além da cor. O protótipo faz isso nos chips de situação (`.fs`, texto no próprio chip) [PROTÓTIPO].
- FE-55. [COMPL.] Tudo que se clica funciona com teclado (Tab, Enter, Esc, setas em menu) e mostra foco visível. O protótipo tem `:focus-visible` e `--anel-foco` e trata Esc em modal e menu suspenso (`ui.js`) [PROTÓTIPO].
- FE-56. [COMPL.] Ícones sem texto têm nome (`aria-label`), janela tem `role="dialog"` e devolve o foco ao fechar, aviso tem `role="status"` (já feito em `ui.js`) [PROTÓTIPO].
- FE-57. [COMPL.] Alvo de toque confortável (cerca de 40 px de altura; o protótipo usa 32 a 42 px). Rever os controles de 32 px no celular.
- FE-58. [COMPL.] Respeitar "reduzir movimento" (`prefers-reduced-motion`): o protótipo já tem [PROTÓTIPO].

### 2.6 CSS eficiente [BASE: CSS Eficiente]
- FE-60. Estilo por classe, não por ID. Evitar seletores longos (`.a .b .c .d`) e `!important` (só em utilitários) [BASE].
- FE-61. Organizar em camadas do genérico ao específico (ITCSS): variáveis (tokens) → reset/base → elementos → objetos de layout → componentes → utilitários [BASE].
- FE-62. Nomear de forma previsível: bloco, elemento, modificador (BEM) e/ou prefixos de função (`c-`, `u-`, `is-`, `js-`) [BASE]. O protótipo usa prefixos por módulo (`fe-`, `rc-`, `mk-`, `cf-`, `pag-`...) [PROTÓTIPO]; ver seção 3.
- FE-63. Reuso: se três telas repetem a mesma regra, extrair para um componente (OOCSS) [BASE].
- FE-64. `box-sizing: border-box` global [BASE; o protótipo tem em `app.css`].
- FE-65. Um arquivo de CSS por módulo é aceitável; a camada visual (sombras, degradês) fica separada e só usa tokens [PROTÓTIPO: `visual.css`].
- FE-66. Estado em classe própria (`is-ativo`, `aria-selected`, `aria-pressed`). O protótipo já usa atributos ARIA como gancho de estilo (`[aria-selected="true"]`), que é bom porque alinha estilo e acessibilidade [PROTÓTIPO].

### 2.7 Eventos e DOM (só quando relevante) [BASE: Eloquent JS docs 00016 e 00017]
- FE-70. Um ouvinte no "pai" para muitos filhos (o evento sobe até o pai). O protótipo já faz isso no menu (`app.js`: um `click` no documento) [PROTÓTIPO]. Para o produto final, em JavaFX o mesmo princípio é "filtro/handler no contêiner".
- FE-71. Não usar `preventDefault` ou `stopPropagation` sem necessidade; quebram o que o usuário espera (link, teclado).
- FE-72. Evento que dispara muito (digitar na busca, rolar): usar espera curta (debounce) antes de filtrar lista grande.
- FE-73. Ao montar uma tela inteira, montar em bloco (uma vez) e inserir no DOM, em vez de ler medida e escrever no DOM em laço (evita recalcular layout o tempo todo).
- FE-74. Foco não "sobe" (`focus`/`blur`): quem trata foco em grupo usa `focusin`/`focusout`. [COMPL. no nome desses dois eventos]
- FE-75. Tudo que o protótipo faz em JS para dados (mock) deve virar chamada ao Spring no final; o P.O. não escreve isso, mas precisa saber que `mock-data.js` é provisório [PROTÓTIPO].

### 2.8 Conteúdo e dados na tela
- FE-80. Valores em R$ no formato brasileiro, datas em dd/mm/aaaa, mesma casa decimal em toda a tela. [COMPL.]
- FE-81. Estado vazio, carregando, erro e "sem permissão de ação" são telas: desenhar os quatro para cada lista e cada painel.
- FE-82. Número sem contexto confunde: todo número grande tem rótulo e, se possível, comparação (mês anterior, meta). Dados do IT.MK devem ser conferidos contra a fonte antes de mostrados (Gestão de Produtos: "nos dados nós confiamos", doc 1905).

---

## 3. Como organizar o design system do IT.MK

### 3.1 O que já existe (lido por mim em `prototipo/` [PROTÓTIPO])
- Tamanho: 13 arquivos CSS (cerca de 1.300 linhas, muitas bem longas), 14 arquivos JS em `js/` (cerca de 3.600 linhas, telas e dados de exemplo) mais `app.js`, e `index.html` com login e casca. Telas: Dashboard, Pagadores, Conversas, Fechamento, Recebimentos, Inadimplência, Configurações, Marketplaces, Robô.
- `tokens.css` (43 linhas): cores de marca (`--verde-marca` #026842, `--tinta`, `--verde-claro`, `--verde-vivo`, `--verde-medio`), neutros (`--pagina`, `--cartao`, `--borda`, `--texto`, `--texto-2`, `--apoio`), 4 canais de marketplace (`--ml-*`, `--sh-*`, `--am-*`, `--mg-*`), 4 situações (`--atencao`, `--travado`, `--curso`, `--cancelado`, cada uma com texto e fundo), 5 categorias de fila (`--cat0..4`), raios (cartão 12, bloco 10, controle 8, chip 6 px), degradês, 5 níveis de sombra, anéis de foco, 3 famílias de fonte (Bricolage Grotesque para títulos, Public Sans para texto, IBM Plex Mono para números e códigos), 3 tempos de movimento e uma curva, largura do menu (252 px).
- `ui.js` (`MKUI`): `toast`, `modal` (com foco, Esc e retorno do foco), `menu` (menu suspenso com setas) e `esc` (proteção de texto). `filtro.js` (`MKFiltro`): filtro único usado em Pagadores e Marketplaces. `app.js`: menu lateral recolhível (guarda a escolha no navegador, com proteção de erro).
- Camadas de CSS: `app.css` (casca, menu, login), um arquivo por módulo, `tabelas.css` (regras de tabela) e `visual.css` (sombra, relevo, movimento, só com tokens).

### 3.2 Mapa atômico do que já existe (minha leitura das classes) [PROTÓTIPO]
| Nível | O que já existe no protótipo |
|---|---|
| Átomos | Botões `.btn` (principal), `.btn.sec`, `.btn.esc`, `.btn.perigo`; botão de ícone `.ib`; campos `.campo input`, `.sel`, `textarea`, `.sw` (interruptor); ícones Lucide; chips de situação `.fs` (`.vd`, `.ok`, `.at`, `.gr`, `.cn`), `.selo`, `.atraso`, `.mo`; `.chip-canal`; logo `.marca-logo` |
| Moléculas | `.campo` (rótulo + campo), `.busca-p` (busca), `.num-card` (número + legenda), `.chip-f` (filtro com contador), cabeçalho de cartão `.cx-cab`, item de menu `.pop-i`, linha de lista `.rl-l`, `.fe-k` (indicador) |
| Organismos | Cartão `.cx`, tabela `.tab-cartao` + `.tab-fe`, barra de filtro (`.fe-barra`/`.rc-filtros`), abas (`.rc-abas`/`.rc-aba`, `.mk-aba`, `.mk-sub`, `.f-aba`), `.modal`, `.gaveta` (painel lateral), `.toast`, menu lateral `.menu`, fila `.fila`, andamento `.andamento` |
| Templates | `#conteudo` com `data-modulo`; padrão repetido "topo (título) + faixa de números + grade de cartões" (`.dash`, `.fe-w`, `.conv-w`); contêineres com `container-type: inline-size` (`.fe-w`, `.conv-w`, `.rl`, `.vc-area`) |
| Páginas | Cada módulo (Dashboard, Pagadores, Conversas, Fechamento, Recebimentos, Inadimplência, Configurações, Marketplaces, Robô) com dados de `mock-data.js` |

### 3.3 O que organizar (sugestão de itens de backlog; o P.O. numera como BL-xx)
Ordem sugerida por valor e risco (ver `docs/base-po.md` seção 6):
1. **Catálogo de componentes (página "catálogo" no protótipo)**: lista todos os átomos, moléculas e organismos acima, cada um com normal, foco, desabilitado, erro, vazio, e a regra de uso. Valor: é a "especificação" que o time de JavaFX vai seguir. (Critério de aceite no item 4.2.) [FE-15]
2. **Inventário de interface** (cap. 4 do Atomic Design): rodar o exercício nas 9 telas já prontas. Ver quantas variações de botão, de chip, de aba e de cartão existem. Exemplo concreto que já saltou aos olhos: abas existem em 4 versões (`.rc-aba`, `.mk-aba`, `.mk-sub`, `.f-aba`) e cartões em várias (`.cx`, `.tab-cartao`, `.fe-k`, `.rl-c`, `.rl-s`, `.f-bloco`). Decidir quais ficam, quais se juntam. Tempo estimado: 1 oficina de meio dia mais a lista de decisões.
3. **Nomes**: escolher um vocabulário (ex.: Cartão, Aba, Chip, Gaveta, Janela) e escrever uma tabela "nome na tela, nome no CSS, nome no JavaFX". [FE-06]
4. **Governança** (1 página em `docs/`): quem aprova padrão novo, como pedir, como retirar, registro de mudanças. [FE-11, FE-12, FE-13]
5. **Pontos de atenção do protótipo atual** (itens de correção, não de ideia nova):

### 3.4 Pontos de atenção que encontrei lendo o protótipo (conferir antes de virar item)
- A1. `configuracoes.css` linha 45: `.cf-tab{overflow-x:auto}`. Cria rolagem horizontal dentro da tabela de contas (e a classe é usada nas tabelas `tab-cf`). Choca com a regra 2 do `CLAUDE.md`. Verificar em 360 px.
- A2. Cores soltas fora de `tokens.css` (rgba literais): `app.css` (login, `.lc` e `.lado-rodape`, 2 linhas), `configuracoes.css` (botão do interruptor), `conversas.css` (`.m-q`), `dashboard.css` (`.veu`; `visual.css` sobrescreve com `--veu-cor`), `marketplaces.css` (`.mk-sub b`). São 6 linhas que achei por busca. Hex solto: 0. A regra "só `tokens.css` define cores" precisa de tokens novos para essas.
- A3. Cerca de 360 `style="..."` escritos dentro do JS (medidas de coluna, larguras, margens). Isso atrapalha a reconstrução em JavaFX (o CSS do JavaFX é outro) e foge do "só tokens". Contar e decidir quais viram classe.
- A4. Fontes muito pequenas: `font-size` entre 9 e 11 px em cerca de 14 linhas de CSS (ex.: cabeçalho da tabela de permissões `.tab-cf th.c` com 9,5 px). Difícil de ler e ruim para acessibilidade.
- A5. `.sr` (texto só para leitor de tela) está definido em `pagadores.css`, mas é usado pelo filtro global. Mover para a camada base.
- A6. Nomes de classes por módulo (`fe-`, `rc-`, `mk-`, `cf-`...) com componentes que se repetem entre módulos: risco de arrumar um e esquecer o outro (ex.: `.rc-aba` é retocada em `recebimentos.css`, `visual.css` e `robo.css`).
- A7. As fontes vêm de endereço externo (Google Fonts) e os ícones de `unpkg.com` (Lucide). O protótipo precisa de internet. Na versão JavaFX as fontes terão que ser empacotadas (ver seção 8). [COMPL.]
- Estes pontos são de leitura rápida (busca por texto e leitura de trechos). Não rodei o protótipo no navegador nem medi nada: tudo precisa ser confirmado nas larguras de tela antes de virar item.

### 3.5 Preparar a passagem para JavaFX
- Lista fechada de tokens com nome, valor e uso, mantida em um só arquivo (já é `tokens.css`). Na versão JavaFX os mesmos nomes viram "cores nomeadas" no CSS do JavaFX. [COMPL.]
- O catálogo de componentes (item 1 acima) vira a lista de classes de estilo do JavaFX. Cada componente com medidas (altura, raio, espaçamento) em px já medidos no protótipo.
- O layout responsivo do protótipo (grade, container query) não se traduz literalmente: no JavaFX isso passa a ser decisão de layout de janela. Isso é risco de plano e está em "Não coberto pela base" (seção 8).

---

## 4. Checklist de critérios de aceite para itens de Frontend

Copiar para o item (`BL-xx`) as caixas que se aplicam. Formato do item: história + critérios + desenho de computador e de celular (`docs/base-po.md` seção 6).

### 4.1 Em todo item de tela ou componente
- [ ] A história diz quem usa (analista de cobrança, consultor, dono, pagador), o que quer e por quê.
- [ ] Existe desenho de computador e de celular anexado ao item.
- [ ] Usa só cores, fontes, raios, sombras e tempos de `tokens.css`. Nenhum valor solto. (FE-10)
- [ ] Visão única: nenhuma separação por perfil; os nomes "diretor", "CEO", "colaborador" não aparecem na tela.
- [ ] Nada repetido: a mesma informação não aparece duas vezes na mesma tela.
- [ ] Reaproveita componente existente; se criou um novo, está no catálogo (átomo/molécula/organismo) com justificativa. (FE-02, FE-15)
- [ ] Tem 1 ação principal clara; ações secundárias com menos destaque. (FE-20)
- [ ] O título da tela é igual ao nome no menu. (FE-21)
- [ ] Estados desenhados e testados: normal, carregando, vazio, erro, desabilitado, foco. (FE-22, FE-81)
- [ ] Textos curtos, em português simples, sem jargão. (FE-30)
- [ ] Prévia publicada e link enviado ao dono (regra do `CLAUDE.md`).

### 4.2 Se for componente novo ou alterado
- [ ] Item novo no backlog (não pendurado no antigo); tipo: modificar, adicionar ou remover. (FE-12)
- [ ] Constam o nome, a descrição de uso, as variações e as medidas.
- [ ] Testado com conteúdo extremo (texto de 80 caracteres, valor alto, zero e muitos itens). (FE-05)
- [ ] Funciona com teclado e mostra foco. (FE-55)
- [ ] Todas as telas que usam o componente foram revisadas (lista no item).

### 4.3 Layout e responsivo (regra máxima)
- [ ] Sem barra de rolagem horizontal em 360, 414, 720, 768, 1024, 1280, 1440 e 1920 px de largura. [COMPL. na lista de larguras; escolhidas para cobrir celular, tablet e computador e os pontos de quebra 720/860/900/1100/1500 do protótipo]
- [ ] Sem barra horizontal com zoom do navegador em 200%. (FE-50)
- [ ] Sem espaço vazio: cartões e colunas ocupam a largura toda; blocos de alturas diferentes se encaixam. (FE-47)
- [ ] Texto longo quebra linha dentro do seu espaço; nada cortado nem empurrando a página. (FE-44)
- [ ] Tabela ocupa 100% da largura; em tela estreita vira blocos legíveis. (FE-48)
- [ ] Sem limite de largura máxima no conteúdo (tela larga também é preenchida).
- [ ] Menu lateral recolhe; no celular vira barra inferior (comportamento atual preservado).
- [ ] Relatar bug sempre citando a largura da tela usada. (`docs/base-po.md` seção 7)

### 4.4 Formulários
- [ ] Todo campo tem rótulo visível ligado ao campo. (FE-29)
- [ ] Tipo de campo correto (e-mail, data, número, telefone) e máscara de R$ quando for valor.
- [ ] Erro aparece junto do campo, diz como corrigir, e o formulário não perde o que foi digitado.
- [ ] Botão de enviar mostra processando e não permite clique duplo. (FE-22)
- [ ] Ação perigosa pede confirmação com o texto da consequência. (FE-23)
- [ ] Só pede o necessário. (FE-29)

### 4.5 Tabelas e listas
- [ ] Colunas e ordem decididas pelo uso (o que o analista olha primeiro fica à esquerda).
- [ ] Filtro único e padrão (o mesmo componente em todo lugar). (FE-26)
- [ ] Situação aparece com texto e cor (não só cor). (FE-54)
- [ ] Linha clicável tem foco e resposta ao teclado.
- [ ] Testado com 0, 1 e muitos registros.

### 4.6 Acessibilidade mínima
- [ ] Contraste de texto verificado nos pares de cor usados. [COMPL.: ferramenta de contraste]
- [ ] Ícones sem texto têm nome; janelas devolvem o foco ao fechar. (FE-56)
- [ ] Sem informação só por cor. (FE-54)
- [ ] Respeita "reduzir movimento". (FE-58)

### 4.7 Definição de Pronto de Frontend (junta com a de `docs/base-po.md` seção 7)
- [ ] Sem bug conhecido nos critérios acima.
- [ ] Testado nas larguras do item 4.3 e no ambiente de teste (cópia do real).
- [ ] O P.O. testou a tela como o usuário (aceite) e anotou o que viu.
- [ ] Prévia publicada. Nada entregue na sexta-feira.
- [ ] Para a fase JavaFX: tela redesenhada com os mesmos tokens e medidas; mesma lista de critérios, testada na janela mínima e na janela máxima suportada.

---

## 5. Práticas de liderança do P.O.

### 5.1 O papel, na linguagem do time [BASE: Coaching Agile Teams docs 473 a 481; Gestão de Produtos docs 1761 e 1772]
- Cinco coisas que o time precisa do P.O.: guardar o valor de negócio, guardar a visão, tomar as decisões do dia a dia, "escudo" (protege o time de pedidos e pressões), e responder pelo resultado.
- "Microdefinição de valor": o objetivo de negócio mais próximo, que filtra toda decisão do dia (backlog, reunião, pedido). Ex. IT.MK: "o robô cobrar sozinho a 1ª fase de cobrança" ou "ter o fechamento do mês sem planilha". Se o pedido não ajuda a microdefinição, espera. Exigir que o P.O. saiba responder isso a qualquer momento.
- Valor não é só dinheiro: pesam também risco e conhecimento a ganhar.
- O P.O. lidera sem ser chefe de ninguém (relação matricial): explica o contexto (onde o produto entra na estratégia, o que o cliente espera, por que esta tela), remove impedimento, mostra o resultado depois que a entrega acontece. Dica prática do livro: levar o dev para ver o usuário usando o que ele fez.
- Saber dizer NÃO (Gestão de Produtos, docs 1901 e 1902): sem objetivo do produto, cliente principal e problema claros, não há argumento. Não aceitar pedido só porque "o concorrente tem", "o chefe quer" ou "é só mais uma opção na configuração".
- P.O. vem de uma cultura de comando e controle? É comum. O trabalho é aprender a confiar no time e focar em valor, não em mandar cada passo (Coaching Agile Teams, doc 473).

### 5.2 Alinhar com o time técnico e com o dono [BASE + base-po]
1. Visão e meta em uma frase, escrita e à vista (`docs/base-po.md` seção 2).
2. Quadro de delegação (7 níveis de Appelo, docs 482 a 492): 1 avisar, 2 vender a ideia, 3 consultar antes, 4 decidir junto (consenso), 5 aconselhar, 6 perguntar depois, 7 delegar. Aplicar a "áreas de decisão" (não a tarefa solta). Exemplos para o IT.MK: cores e tokens (dono decide, nível 1 ou 2); biblioteca de componentes do JavaFX (time técnico, nível 6 ou 7); ordem do backlog (P.O., nível 2); definição de pronto (time, com P.O. e dono confirmando, nível 4); mudança de escopo (dono, nível 1).
3. Delegation Poker: cada pessoa vota um número de 1 a 7 em segredo; revelam juntos; quem diverge explica; acorda-se o nível. Serve para acabar com conflito de "quem decide".
4. Contexto, não controle (Netflix cap. 9): dar o contexto (por que, quem usa, que métrica) e deixar o time escolher o como. Combina com "confiar no time técnico nas decisões técnicas".
5. Reunir design, dev e dono no mesmo lugar para as decisões de tela, com a regra do protótipo publicado como assunto da reunião. Em "Atomic Design" cap. 4, o ponto principal é que "tudo se resume a gente conversando"; o inventário de interface só funciona se todas as áreas estiverem na sala.

### 5.3 Feedback (dar e receber) [BASE: HBR docs 10 a 23, 37, 106, 117, 123; Netflix docs 45 e 46]
Para o P.O. dar feedback ao dev, ao designer, e ao dono:
1. Preparar a relação antes (conversa informal, elogio específico quando merecido).
2. Fatos e comportamento, não intenção: "quando a tela de Recebimentos abre com barra horizontal em 360 px, a analista não consegue ver o valor" em vez de "você não se importa com celular".
3. Falar do seu lado da rede: como você é afetado ("fico preocupado com o prazo") e não o que o outro pensa.
4. Evitar "posso dar um feedback?" como abertura fria (aciona defesa); combinar o hábito antes ("às quintas olhamos o que ficou pronto e o que melhorar").
5. 4 As da Netflix: Alvo (a mudança ajuda a pessoa ou o produto, não você), Ação (algo que a pessoa pode fazer), Agradecer (ao receber), Aceitar ou descartar (quem recebe decide).
6. Feedback do P.O. sobre o trabalho entregue: como "aceito ou volta" contra o critério de aceite escrito; bug é critério não cumprido; ideia nova é item novo (`docs/base-po.md` seção 6). Assim a conversa é sobre o critério, não sobre a pessoa.
7. Quando a pessoa fica na defensiva: voltar aos fatos, escutar primeiro (HBR cap. 15, doc 106, e cap. 19, doc 123).
8. Alta performance também recebe feedback; expectativa baixa cria baixo desempenho (síndrome do fracasso inevitável, HBR cap. 5, doc 37).
9. Receber feedback do time e do dono sobre o próprio P.O.: agradecer, não se defender, decidir depois. O coach de time pode (e deve) dar feedback ao P.O. mesmo sendo hierarquicamente "abaixo" (Coaching Agile Teams, docs 473 a 481).

### 5.4 Retrospectiva [BASE: Derby docs 169 a 349]
Quem faz: o time. Em `docs/base-po.md` a retrospectiva é "só o time"; o P.O. segue isso e só entra se o time convidar [regra do IT.MK, não de Derby].
Estrutura (docs 189 a 200):
1. **Preparar o clima** (5 a 10 min): lembrar a meta, quanto tempo dura e como será; todo mundo fala algo curto no início (quem não fala no começo tende a calar o resto); combinar poucos acordos (no máximo cerca de 5; ex.: celular em silêncio).
2. **Reunir dados**: linha do tempo do ciclo, "bravo/triste/feliz", fatos e sentimentos. Sem dados em comum, cada um fala só do que viveu.
3. **Gerar insights**: perguntar "por quê?", causas, padrões (5 porquês, espinha de peixe). Evitar pular direto para a solução.
4. **Decidir o que fazer**: escolher só 1 ou 2 experimentos para o próximo ciclo, com responsável e como medir (metas SMART).
5. **Fechar**: o que foi bom (+/Delta), agradecimentos, nota da reunião (ROTI: retorno do tempo investido).
Adaptação ao IT.MK: usar a retrospectiva também para perguntas de Frontend: "a prévia foi publicada a cada mudança visual?", "algum bug de largura de tela passou?", "os critérios de aceite estavam claros?". Registrar os 1 ou 2 combinados em um lugar só (fonte única).

### 5.5 Design sprint de 5 dias para validar telas [BASE: Sprint, Knapp, docs 1809 a 2014]
Quando usar (Knapp): problema grande, muita coisa em jogo, prazo curto, ou "beco sem saída". Exemplo no IT.MK: decidir como o robô de cobrança e a tela de Conversas funcionam juntos, ou a nova tela de Inadimplência antes de reconstruir em JavaFX.
Papéis: **Definidor** (quem decide de fato; no IT.MK é o dono do projeto, ou o P.O. com mandato dele), **Facilitador** (conduz horário e conversa), equipe de **7 pessoas ou menos**, com habilidades diferentes. Especialistas entram em entrevistas de 15 a 30 min na segunda à tarde.
Tempo: segunda a quinta das 10h às 17h, sexta das 9h às 17h. Só cerca de 6 horas de trabalho por dia, com pausas. Computador e celular desligados na sala (docs 1842 a 1844).
Os 5 dias:
| Dia | O que fazer | Saída |
|---|---|---|
| Segunda (doc 1851) | Começar pelo fim: objetivo de longo prazo; mapear o problema (diagrama do fluxo do usuário); perguntar aos especialistas anotando "Como poderíamos..."; votar em pontos; escolher o alvo | Mapa + alvo da semana |
| Terça (doc 1896) | Reunir ideias antigas e inspiração; esboços individuais (inclui exercício "Crazy 8s": 8 variações em 8 minutos), esboço de solução detalhado | Esboços da solução, 1 por pessoa |
| Quarta (doc 1910) | Decidir sem debate longo: votação silenciosa, o Definidor decide; "batalha" entre ideias concorrentes; roteiro (storyboard) do protótipo | Storyboard |
| Quinta (doc 1939) | "Fingir": construir uma fachada realista, não o produto (o protótipo HTML do IT.MK é exatamente isso); dividir o trabalho entre quem monta, quem escreve texto, quem prepara dados | Protótipo pronto para teste |
| Sexta (doc 1959) | Testar com 5 clientes do perfil, em entrevistas individuais, com a equipe observando; aprender, ver padrões, planejar o próximo passo | Decisão: seguir, ajustar ou parar |
Por que 5 clientes: Nielsen mostrou que 5 pessoas revelam cerca de 85% dos problemas de usabilidade (doc 1961). Por que 5 dias: sprints mais longos perderam o foco e deixaram a equipe apegada às ideias.
Conflito com a regra "não entregar na sexta-feira" (`docs/base-po.md` seção 7): aqui sexta é dia de TESTE do protótipo com pessoas, não de entrega ao ambiente real. Não há conflito, mas deixar isso escrito no plano.
Para o IT.MK (adaptação, [COMPL.]): os "clientes" são analistas de cobrança, consultores e o dono; se não houver 5 pessoas, usar o máximo que houver (1 pessoa já vale mais que 0, UX book cap. 8). O resultado entra no backlog como itens novos, nunca como mudança escondida num item antigo.
Checklists prontos: docs 1987 a 2014.

### 5.6 Decidir com partes interessadas [BASE + base-po]
- Mapa de partes interessadas (interesse x poder) e quadro de delegação (`docs/base-po.md` seção 3).
- Votação por pontos e Definidor (Sprint): evita debate longo e "pensamento de grupo".
- Teste dos 20 segundos (Atomic Design cap. 4): mostrar poucas telas de referência por 20 segundos a cada parte interessada e votar de 1 a 10 "como eu me sentiria se fosse nossa". Em 10 minutos alinha o gosto visual do dono e do time. Combinar com "style tiles" (amostra de cores, fontes e botões; no IT.MK é o próprio `tokens.css` + catálogo).
- Valor x custo, Kano e "compre suas funcionalidades" (Gestão de Produtos, doc 1890): ordenar o backlog de Frontend. Cuidado com "a que você lembrar primeiro" (doc 1890), não use.
- Dados antes de opinião (doc 1905). Para Frontend: onde os usuários travam, cliques, tempo de tarefa; mesmo no protótipo, cronometrar uma tarefa típica (ex.: achar um pagador em atraso e mandar a cobrança) em duas versões.

### 5.7 Coaching do P.O. e conflito [BASE: Coaching Agile Teams docs 473 a 481, 580 a 587]
- Conflito tem 5 níveis: 1 problema a resolver, 2 desacordo (começa a autoproteção), 3 disputa (ganhar), 4 cruzada (ideologia, "eles nunca mudam"), 5 guerra mundial (destruir). O time resolve sozinho até o nível 2 ou 3. Do 4 em diante, o P.O. busca ajuda (Scrum Master, dono).
- Sinais de linguagem: nível 1 fala de fatos ("a tela quebra em 360 px"); nível 3 aparecem generalizações ("você sempre..."); nível 4, "eles nunca..."; nível 5, "ou eu ou ele".
- Colaboração (cap. 10): ideias em excesso são necessárias; construir juntos antes de escolher.
- P.O. e ego (Holiday): quando a tela do P.O. é criticada, a tarefa é aprender, não vencer. A pessoa que se diz "dona" da tela trava o design system (cap. 5 do Atomic Design: "faroeste").

### 5.8 Lean Enterprise e Startup Enxuta aplicados ao Frontend [BASE]
- Escrever cada tela ou mudança grande como hipótese: "Acreditamos que a barra de filtro única reduzirá o tempo de achar um pagador. Saberemos que acertamos quando a tarefa levar menos de X segundos para Y analistas." (Lean Enterprise doc 884)
- Escolher o tipo de MVP pelo que se quer aprender: wireframe (rápido, só entendimento), protótipo clicável (testa design e uso; é o caso do protótipo HTML), serviço manual (testa valor) (docs 925 e 926).
- Backlog = lista de hipóteses a testar, e não só requisitos a construir (doc 950). No IT.MK: cada item de Frontend tem uma linha "como vamos saber que deu certo".
- Construir, medir, aprender; perseverar ou pivotar (Startup Enxuta).

### 5.9 Qualidade de Frontend com o time [BASE: More Agile Testing doc 1384]
- "Três amigos": P.O., dev e testador (ou quem testa) conversam sobre cada tela antes de construir, usando o desenho de computador e de celular e os critérios de aceite.
- Quadrantes: Q2 (histórias, protótipo e teste de UX antes de construir), Q3 (teste exploratório e de usabilidade, o P.O. como "aceite"), Q4 (desempenho, segurança: dados financeiros do IT.MK pedem atenção), Q1 (testes do código, do time técnico).
- Teste exploratório com "missão": ex. "explorar a tela de Fechamento no celular tentando provocar barra horizontal". Usar "personas" (a analista apressada, o consultor que usa só o celular) para variar os testes.
- Ambiente de teste (cópia do real) antes de entregar.

### 5.10 Motivação e retorno (Appelo, HBR)
- Progresso visível é o que mais motiva num dia de trabalho (Gestão de Produtos cita o estudo da HBR, perto do doc 1773): mostrar a prévia cedo e remover impedimentos.
- 10 motivadores (curiosidade, honra, aceitação, domínio, poder, liberdade, relação, ordem, objetivo, status): conversa de 15 minutos individual para saber o que cada pessoa do time valoriza (docs 815 a 842).
- Caixa de elogios (kudo box): registrar "gostei muito de como X resolveu a tabela em tela estreita" no mesmo dia. Barato e liga ao FE-34.

---

## 6. Armadilhas

1. **Virar "faroeste" de componentes**: cada tela inventa a sua aba, o seu cartão. No IT.MK já há 4 tipos de aba. Contra: FE-02, inventário, catálogo, governança.
2. **Design system "intocável"**: tratar tokens e componentes como lei eterna, sem processo de mudança. O livro diz que isso faz o sistema ser abandonado (cap. 5, "faça-o adaptável").
3. **Design system escondido num canto**: sem catálogo, ninguém acha; sem aviso de mudança, ninguém usa.
4. **Tudo importante, nada importante**: pedido do dono de mais um destaque, mais um número, mais um banner. Contra: FE-27 e dizer não com base em objetivo do produto.
5. **Esconder em vez de organizar**: no IT.MK a visão é única e completa; esconder por perfil viola a regra. Organizar em camadas é diferente de tirar.
6. **Rolagem horizontal "disfarçada"**: `overflow-x:auto` em tabela ou em contêiner. É rolagem horizontal do mesmo jeito (ponto A1).
7. **Largura em px fixo e `nowrap` em tudo**: texto longo empurra a página. Usar `min-width:0` e quebra de linha (FE-43, FE-44).
8. **Testar só em uma largura**: o protótipo já usa pontos de quebra e container queries; testar também na largura logo antes e logo depois de cada ponto de quebra (720, 860, 900, 1100).
9. **Valores soltos de cor** (rgba) e estilo dentro do JS: quebram o "só tokens" e atrapalham o JavaFX (A2, A3).
10. **Copiar a ferramenta web para o JavaFX**: container query, `grid auto-fit`, `clamp()` e sombras multicamada do protótipo não têm tradução direta no JavaFX. Risco de prazo e de aprovação visual (seção 8).
11. **Aprovar pela "página" e esquecer o template**: o dono vê a tela com dados bonitos; o problema aparece com dado real. Testar com pior caso (FE-05).
12. **Esperar a tela pronta para testar**: testar no rabisco, no protótipo, com 3 a 5 pessoas (UX book cap. 8; Sprint). Corrigir depois custa muito mais.
13. **Retrospectiva sem decisão**: lista de queixas e nenhum experimento. Escolher só 1 ou 2 e acompanhar (Derby).
14. **Feedback depois de semanas**: vira julgamento. Dar logo, sobre fato e critério (HBR, Netflix).
15. **Design sprint sem Definidor**: decisão não é levada a sério; o resultado é adiado (Knapp). E sem tempo protegido (sala, celulares desligados) vira reunião comum.
16. **Mais gente no fim para "acelerar" o Frontend**: Lei de Brooks (já em `docs/base-po.md`); sair da mesa antes e pôr o time inteiro na ideação.
17. **Tratar o livro de desempenho (1.16) como método**: é genérico e em cascata; usar só ideias de indicador.
18. **Confundir "mudar de ideia" com bug**: mudança de desenho depois de aceito é item novo (`docs/base-po.md` seção 6).
19. **Contar com o OCR**: os textos podem ter erros de leitura; conferir nome, número e fórmula no PDF original antes de citar fora daqui.

---

## 7. Como aplicar ao IT.MK

Usar o modelo de 10 passos de `docs/base-po.md` seção 10, agora com o que este manual acrescenta para a frente Frontend.

1. **Visão e meta (Frontend)**: ex. "Ter todas as telas do IT.MK no protótipo aprovadas, sem barra horizontal, só com tokens, até DD/MM; depois reconstruir em JavaFX com as mesmas cores e medidas". Meta mensurável: nº de telas aprovadas, nº de componentes no catálogo, 0 bugs de largura em 8 larguras de teste.
2. **Quem é afetado e quem decide**: dono (decide visual, nível 1 ou 2), P.O. (backlog e ordem), time técnico (JavaFX e CSS, nível 6 ou 7), usuários (analista de cobrança, consultor, pagador quando houver tela dele). Resolver em Delegation Poker (5.2).
3. **Valor**: cliente (a analista acha o pagador em atraso mais rápido), empresa (menos retrabalho, 40% da operação com mais controle), processo (design system reduz duplicação e acelera a reconstrução). Como medir: tempo de uma tarefa típica; número de variações de componente; bugs de largura por entrega. [indicadores são sugestões COMPL.; dono confirma]
4. **Roadmap em versões com data** (exemplo de forma, sem datas inventadas): V1 catálogo e correções do protótipo (A1 a A6); V2 inventário e unificação de componentes; V3 design sprint das telas críticas; V4 JavaFX do design system (tokens + componentes); V5 telas em JavaFX por módulo. O P.O. coloca datas; sem histórico, versões de até 3 meses.
5. **Épicos e histórias** (exemplos de texto): "Como analista de cobrança, quero abrir qualquer tela no celular sem rolar para o lado, para consultar o pagador em atraso longe da mesa." "Como dono, quero um catálogo de componentes, para aprovar o visual uma vez só e ver a mesma regra em todas as telas." "Como desenvolvedor JavaFX, quero cada componente com medidas e estados, para reproduzir o visual sem adivinhar."
6. **Critérios de aceite**: copiar do capítulo 4 as caixas que se aplicam; anexar desenho de computador e de celular.
7. **Prioridade**: MoSCoW + níveis 1 a 5. Regra prática: "Deve" para tudo que gera barra horizontal, texto cortado, cor solta ou ação perigosa sem confirmação; "Deveria" para catálogo e unificação de componentes; "Poderia" para refinamentos visuais. Ordem por valor, dependência (catálogo antes de JavaFX), risco e custo.
8. **Plano de versões e Definição de Pronto**: itens da seção 4.7.
9. **Riscos, dívida técnica e o que NÃO foi verificado**: ver seções 3.4 e 8; dívida técnica de Frontend = estilo no JS, nomes por módulo, variações de componente. Tudo vira item novo.
10. **Como acompanhar**: fonte única da verdade; indicadores: telas aprovadas, componentes no catálogo, bugs de largura, tempo de tarefa.

Exemplo curto de item bem escrito (modelo, número de verdade o P.O. define):
> **BL-xx Tabela de contas sem rolagem horizontal** (Deve, nível 2)
> História: Como analista de cobrança, quero ver as contas bancárias no celular sem arrastar para o lado, para conferir o banco e a agência rapidamente.
> Critérios: [ ] sem rolagem horizontal em 360 px e em zoom 200% [ ] colunas viram blocos abaixo do ponto de quebra [ ] texto longo quebra linha [ ] usa só tokens [ ] desenhos de computador e de celular anexos [ ] prévia publicada.
> Não verificado ainda: se o problema existe de fato em 360 px (ponto A1).

---

## 8. Não coberto pela base (JavaFX e outros)

Conferido por busca em todas as categorias: a base só tem 1 menção solta a JavaFX (em `arquitetura-de-software/documentos/arquitetura-de-software__doc_01558.md`, numa lista de tecnologias antigas). Nada de FXML, Scene Builder, CSS do JavaFX, `Stage/Scene`, `GridPane`, `CSS looked-up colors`, empacotar fonte, `WebView`, nem de integração JavaFX com Spring.

O P.O. deve tratar como "não coberto pela base" e pedir fonte oficial (nomes que conheço, não verificados nesta pesquisa [COMPL.]):
- Documentação oficial do OpenJFX (`openjfx.io`) e a "JavaFX CSS Reference Guide" (suporta cores nomeadas e degradês; não tem `var()`, `grid` de CSS, container queries, `clamp()`).
- Layouts de janela: `GridPane`, `FlowPane`, `HBox/VBox` com restrições (crescer, encolher, prioridade). O que é "responsivo" no CSS vira decisão de janela mínima e máxima.
- Sombras e degradês do protótipo existem no JavaFX (efeitos e `linear-gradient`) mas com limites. Testar o visual de 1 componente antes de prometer 100% igual.
- Fontes: no JavaFX precisam ser carregadas do pacote do aplicativo (hoje o protótipo usa Google Fonts, fora do ar se não houver internet).
- Ícones: Lucide hoje vem de CDN; no JavaFX serão SVG ou fonte de ícones.
- Acessibilidade em JavaFX (navegação por teclado, leitores de tela): não coberta.
- Padrão de integração Spring + JavaFX (injeção, janelas): não coberto neste manual. Ver manuais de backend e arquitetura.

Outros pontos não cobertos ou fracos:
- **Acessibilidade formal** (WCAG, contraste mínimo em números): a base só traz zoom, fonte relativa e `label`. O restante deste manual (FE-54 a FE-58) é conhecimento geral.
- **Tokens de design** como termo e prática (ex.: arquivo de tokens, nomes padrão): a base chama de "style guide / pattern library"; "token" é conceito meu.
- **Gráficos e tabelas densas** de dados financeiros: a base não trata de visualização de dados (há skill própria no ambiente, não faz parte da base).
- **Testes visuais automáticos** (captura de tela comparada): não cobertos.
- **Pesquisa com usuário em escala**, métricas de adoção, A/B: só citados (More Agile Testing, Lean Enterprise).
- **Cultura brasileira de cobrança** e tom de mensagem: fora do escopo desta categoria.

---

## 9. Tabela de fontes e caminhos

Base: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`

| Assunto | Caminho (a partir da base) | Observação |
|---|---|---|
| Resumo da categoria frontend | `frontend/categoria_resumo.md`, `frontend/indice.md` | Lista os 273 docs |
| Eloquent JS: DOM | `frontend/documentos/frontend__doc_00016.md` | Layout, estilos, seletores, animação |
| Eloquent JS: eventos | `frontend/documentos/frontend__doc_00017.md` | Propagação, foco, debounce, timers |
| Eloquent JS: assíncrono | `frontend/documentos/frontend__doc_00013.md` | Promessas, async/await, event loop |
| Eloquent JS: HTTP e formulários | `frontend/documentos/frontend__doc_00020.md` | Campos, foco, formulário |
| Eloquent JS: erros e módulos | `frontend/documentos/frontend__doc_00010.md`, `frontend__doc_00012.md` | Bugs e testes; módulos |
| Atomic Design cap. 1 a 5 | `design/documentos/design__doc_00020.md` a `design__doc_00024.md` | Em inglês, texto limpo |
| Atomic Design prefácio e roteiro | `design/documentos/design__doc_00040.md`, `design__doc_00170.md` | Roteiro do livro (resumo por capítulo) |
| UX Design (usabilidade, biblioteca, teste) | `padroes-e-design-de-software/documentos/padroes-e-design-de-software__doc_01374.md` a `doc_01400.md` (usabilidade), `doc_01401` a `01412` (detalhes), `doc_01425` em diante (biblioteca), `doc_01437` em diante (testes) | OCR sem espaços entre palavras |
| UX e Usabilidade Mobile e Web | `padroes-e-design-de-software__doc_02411` a `02419` (heurísticas), `02460` (Hick e polegar), `02473` a `02480` (C.R.A.P.), `02485` a `02490` (teste) | OCR com tabulações |
| Web Design Responsivo | `padroes-e-design-de-software__doc_02523` (fórmula), `02534` (viewport), `02554` (imagens), `02581` (media queries), `02591` (pontos de quebra), `02597` (uso consciente) | OCR com números por extenso |
| A Web Mobile | `padroes-e-design-de-software__doc_00038` (mobile-first), `00074` e `00075` (zoom) | OCR sem espaços |
| CSS Eficiente | `padroes-e-design-de-software__doc_00468.md` a `doc_00603.md`; especificidade `doc_00481`, BEM `doc_00522`, namespaces `doc_00558`, ITCSS `doc_00588` | Português; OCR sem espaços entre palavras |
| HTML5 e CSS3 | `padroes-e-design-de-software__doc_01131` (box model), `doc_01215` (formulários) | Só 2 pontos úteis |
| Sprint (Knapp) | `empresa-e-cultura-organizacional/documentos/empresa-e-cultura-organizacional__doc_01809.md` a `doc_02014.md`; dias: 01851, 01896, 01910, 01939, 01959; teste com 5: 01961; resumo: 01985; checklists: 01987 a 02014 | Português |
| Retrospectivas (Derby) | `empresa-e-cultura-organizacional__doc_00169.md` a `doc_00349.md`; estrutura em 00189 a 00200; sumário de atividades 00177 | Inglês |
| Feedback (HBR) | `empresa-e-cultura-organizacional__doc_00001.md` a `doc_00168.md`; como dar feedback eficaz: 00010 a 00023; fracasso inevitável 00037; defensiva 00106; priorizar 00117; falar com a equipe 00123 | Português (o doc 00168 repete o sumário) |
| Coaching Agile Teams | `empresa-e-cultura-organizacional__doc_00350.md` a `doc_00696.md`; coaching do P.O.: 00473 a 00481; conflito: 00580 a 00587 | Inglês |
| Lean Enterprise | `empresa-e-cultura-organizacional__doc_00786.md` a `doc_01272.md`; hipóteses 00884; tipos de MVP 00925 e 00926; backlog como hipóteses 00950 | Fonte trocada, ver dica 2 |
| More Agile Testing | `empresa-e-cultura-organizacional__doc_01273.md` a `doc_01808.md`; quadrantes 01384 | Inglês |
| Desempenho da equipe de dev | `empresa-e-cultura-organizacional__doc_00697.md` a `doc_00785.md` | Genérico |
| Netflix (Hastings) | `lideranca-e-gestao-de-equipe/documentos/lideranca-e-gestao-de-equipe__doc_00001.md` a `doc_00259.md`; 4 As: 00045 e 00046 | Português |
| Managing for Happiness | `lideranca-e-gestao-de-equipe__doc_00260.md` a `doc_01085.md`; 7 níveis de delegação 00482 a 00492; 10 motivadores 00815 a 00842 | Inglês |
| O Ego é Seu Inimigo | `lideranca-e-gestao-de-equipe__doc_01086.md` a `doc_01212.md` | Português |
| Gestão de Produtos | `carreira-e-habilidades/documentos/carreira-e-habilidades__doc_01706.md` a `doc_02130.md`; P.O. x gestor 01761; liderança 01772; roadmap 01872; priorizar 01890; dizer não 01901; dados 01905; UX 01986 | Português |
| Direto ao Ponto | `carreira-e-habilidades__doc_01369.md` a `doc_01555.md` | Receita de MVP |
| A Startup Enxuta | `carreira-e-habilidades__doc_00230.md` a `doc_00439.md` | Construir-medir-aprender |
| JavaFX (única menção) | `arquitetura-de-software/documentos/arquitetura-de-software__doc_01558.md` | Só uma lista de tecnologias |
| Protótipo e regras do IT.MK | `/home/user/MK/prototipo/css/tokens.css`, `app.css`, `visual.css`, `tabelas.css`; `/home/user/MK/prototipo/js/ui.js`, `filtro.js`; `/home/user/MK/CLAUDE.md`; `/home/user/MK/docs/base-po.md` | Fora da base |

Observação: os números de doc citados são os números dos arquivos da categoria (conferi cada um ao ler). Para abrir, use o nome completo com 5 dígitos, por exemplo `padroes-e-design-de-software__doc_01374.md`. Os números de capítulo dentro de cada livro podem diferir do número do doc.

---

## 10. O que não foi verificado

- Não abri o protótipo no navegador nem medi larguras; os pontos de atenção A1 a A7 vêm de leitura de código e busca por texto.
- Não li os livros inteiros: li índices e partes centrais (capítulos citados). O que não aparece aqui pode estar nas partes não lidas (principalmente em Managing for Happiness, Coaching Agile Teams e More Agile Testing, que são muito grandes).
- Livros em OCR podem ter erro de leitura; fórmulas e nomes devem ser conferidos no original.
- As larguras de teste (360 a 1920 px), alvos de toque e as regras de acessibilidade marcadas [COMPL.] não são da base.
- A passagem para JavaFX não tem apoio da base: todo plano com prazo de JavaFX deve dizer isso.
- Os nomes de classes do protótipo no mapa atômico (seção 3.2) são minha leitura; podem ter classes que não vi. Quem montar o catálogo deve confirmar tela por tela.
- Os indicadores sugeridos (tempo de tarefa, nº de variações de componente, bugs de largura) são sugestões; o dono decide quais valem.
