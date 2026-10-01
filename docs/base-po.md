# Base de método do IT.MK (Product Owner)

Resumo em português dos 4 materiais enviados pelo dono. Todo plano, estrutura, backlog ou roteiro pedido daqui para frente segue esta base e é sempre voltado ao IT.MK.

Fontes: (1) Product Owner's Handbook (Atacan Demiralp, guia de Scrum), (2) Product Owner Guide (dwyl), (3) Product Owner Roadmap (Mohamed Ezzelrgal), (4) Product Management Guide (Rajnish Mani Tiwari).

## 1. O papel do dono do produto
- Representa o público-alvo, as partes interessadas e o negócio. Comunica a visão do produto ao time. É a ponte entre cliente e time de desenvolvimento.
- Dono e criador do backlog: escreve os itens com as próprias palavras, valida tudo, mantém e reordena depois de cada ciclo.
- Liga um valor de negócio ou de cliente a cada item. Só se constrói o que é realmente necessário.
- Descreve a pessoa que usa o produto com detalhe, até a "dor" ficar real.
- Conhece concorrentes e mercado. Não refaz o que já existe. Foca no que os outros não fazem ou fazem mal.
- Aprova ou critica o trabalho antes de liberar. Busca feedback contínuo de usuários.
- Confia no time técnico nas decisões técnicas e pergunta o porquê quando não entende.
- Precisa ter autoridade e meios para cumprir o papel. Um PO pode atuar em mais de um time.
- Objetivo: maximizar o retorno sobre o investimento. Mantém a visão do time e a visão das partes interessadas.
- PO não é Gerente de Produto nem Scrum Master. O Scrum Master garante que o método seja aplicado e remove impedimentos.

## 2. Visão, estratégia e roadmap
- **Visão**: o propósito do produto em uma frase (o quê e o porquê). Sem generalidades como "deixar o cliente satisfeito". Se a visão vier de cima e não estiver clara, o PO pede clareza com diplomacia.
- **Meta**: mensurável e com prazo (ex.: "aumentar a receita em 40% em um ano").
- **Estratégia**: como realizar a visão. **Roadmap**: passos com datas. O roadmap é do PO.
- Quadro de visão: visão, meta, estratégia. Pode ganhar colunas (oportunidades de mercado, concorrentes, chegada ao mercado).
- Validar a visão com 4 perguntas: é clara e focada? mostra como atende o cliente? entrega valor alinhado à estratégia da empresa? a meta é alcançável?
- O roadmap tem **versões com data** (prazo é obrigatório, mesmo sendo ágil), é simples, orientado a metas e mensurável. Sem histórico para estimar, versões de no máximo 3 meses. Liberar com frequência traz feedback real.
- Quadros e gráficos ficam visíveis para todos.

## 3. Partes interessadas e mandato
- **Mapa de partes interessadas**: interesse x poder. Define quem precisa de mais cuidado e como falar com cada um.
- **Quadro de delegação** (Delegation Poker): define quem decide o quê. Perguntas: quem muda a visão? as metas? o roadmap? o backlog? a composição do time? Isso evita conflito e dá base para dizer "não" a pedidos.
- Envolver as partes certas na visão, no roadmap e no valor.

## 4. Valor
- Decidir com as partes interessadas: o que é valioso para o produto, para o cliente e para o processo de desenvolvimento. Valor muda com o tempo.
- Tipos: funcionalidade, confiabilidade, usabilidade.
- Métricas além de usuários: receita, retenção, redução de custo. Indicadores de resultado x indicadores de antecipação. OKR x KPI. Adoção de funcionalidade. Valor entregue, não só velocidade.

## 5. Histórias, épicos e mapa
- **História**: "Como [quem], quero [o quê], para [por quê]". Pequena unidade de trabalho, combinada entre partes interessadas e PO. Qualquer um pode escrever, só o PO confirma.
- **Épico**: história grande cujo valor só aparece quando tudo está pronto. Agrupa histórias relacionadas.
- **Mapa de histórias**: versão → funcionalidades → épicos → histórias. **Plano de versões**: qual versão leva quais histórias e em quanto tempo.
- Oficina de escrita de histórias com o time e as partes interessadas.

## 6. Backlog
- Lista ordenada e sempre viva. Todo item tem número (ID), história, prioridade, estimativa e "Pronto".
- O PO responde por conteúdo, disponibilidade e ordem. Itens do topo são mais claros e detalhados. Itens não validados ficam embaixo.
- **Item bem escrito tem 3 partes**: (1) história, (2) critérios de aceite (caixas que o dev marca), (3) imagem ou desenho (computador; celular fora do escopo por enquanto). Mais o que for útil. Siga o guia de estilo existente.
- **Critérios de aceite**: claros, sem ambiguidade, testáveis. Use INVEST (independente, negociável, valioso, estimável, pequeno, testável).
- **Prioridade**: alta/média/baixa ou MoSCoW (deve, deveria, poderia, não terá). Os "deve" formam o mínimo viável. Cinco níveis: 1 só para emergência (sistema fora do ar); 2 é o normal mais urgente; 5 é ideia ainda não detalhada.
- **Ordem por valor**: retorno direto, necessidade da parte mais importante, dependências, grande impacto, risco e incerteza. Valor igual: maior valor/custo sobe. Pareto: 80% do valor vem de 20% do produto.
- **Ciclo de vida do item**: criado pelo PO → priorizado → em andamento → "pronto para testar" → PO testa → aceito ou volta.
- **Bug x melhoria**: bug é critério de aceite não cumprido. Mudar de ideia, ajustar desenho ou pedir extra é **novo item**, nunca pendurado no antigo. Motivos: mudanças pequenas se acumulam, o título deixa de refletir o conteúdo, a estimativa do dev quebra e o escopo empurra outro item para fora.
- Relato de bug: caminho até o erro, quem estava logado, o que tentava fazer, aparelho e navegador, imagem. Bug não é desculpa para esconder mudança de escopo.
- **Refinamento** do backlog: até 10% da capacidade do time, geralmente no meio do ciclo.
- Fonte única da verdade: um só lugar mostra o estado real do projeto (evita registro duplicado e atraso).

## 7. Ciclos (sprints) e cerimônias
- Ciclo de 1 a 4 semanas (2 semanas é comum), com meta do ciclo e entrega usável e "pronta".
- **Planejamento**: o que pode ser entregue? como? Entrada: backlog, última entrega, capacidade e histórico do time. O time estima (Planning Poker com Fibonacci 1, 2, 3, 5, 8, 13, 20 em pontos, não horas) e escolhe o que cabe. A meta do ciclo nasce da escolha.
- **Definição de Pronto**: definida pelo time, confirmada por PO e Scrum Master. Sem bugs conhecidos. Com vários times, uma definição comum.
- **Acompanhamento**: gráfico de burndown do ciclo (time) e do produto (PO). **Velocidade** = pontos prontos por ciclo, medida após o ciclo, oscila cerca de 10%. Usada para estimar o plano de versões.
- **Revisão do ciclo** (feedback informal com partes interessadas): o que está pronto, demonstração, backlog atual, data de entrega, próximos passos. Saída: backlog atualizado.
- **Retrospectiva** (só o time): pessoas, relações, processo e ferramentas; o que melhorar; plano de melhoria.
- PO pode cancelar o ciclo se a meta ficar obsoleta (desperdiça recursos). Itens prontos são revisados, os incompletos voltam ao backlog.
- **Demonstração e entrega**: não entregar na sexta-feira. Não começar ciclos de 10 dias na segunda (terminariam na sexta). Demonstrar só o que ficou pronto horas antes. PO e Scrum Master marcam com antecedência.
- **Ambiente de teste (staging)**: cópia interna do sistema real onde se testa antes de entregar.
- **Testes de tela**: usar tamanhos padrão de larguras de tela de computador e citar o aparelho ao relatar erro.

## 8. Dívida técnica e tamanho do time
- Dívida técnica: custo de refazer porque foi feito às pressas (causas: falta de capacidade ou experiência, pressão de prazo, desânimo). Cresce com juros. Reduzir de forma sistemática.
- Responsabilidade do time técnico, mas o PO evita excesso de itens antes do prazo e sabe dizer "não". Estimativas já incluem a dívida. Se a entrega tem bugs, ela não cumpre a Definição de Pronto: o item fica no backlog e "corrigir bugs" entra no ciclo seguinte.
- **Lei de Brooks**: mais gente no fim do projeto pode atrasar (aprendizado, revisão, conflitos). O melhor momento para o time inteiro começar é a ideação.

## 9. Comunicação e rotina do PO
- Trabalho do dia: estratégia e visão, comunicação, foco no usuário, dados e análise, resolução de problemas. Tarefas: análise de concorrência, entrevistas com usuários, roadmap e histórias, critérios de aceite, priorização, desenhos com o designer, testes com o dev, métricas, relatórios para as partes interessadas.
- Sucesso: boa comunicação, prioridade clara, raciocínio com dados, empatia com o cliente, adaptação, paixão pelo produto. Fracasso: comunicar mal, não priorizar, ignorar feedback ou dados, não ter visão, não se adaptar.
- Conflito de prioridades: usar o mapa de partes interessadas, o quadro de delegação, valor e custo.
- Ferramentas citadas: Notion, Trello, Productboard, Jira, ClickUp, GitHub Projects, Miro, Figma, Google Workspace, Hotjar, Google Analytics. Uso de IA: analisar feedback, organizar backlog, sugerir casos de teste.
- Aprendizado contínuo e inteligência emocional fazem parte do papel.

## 10. Como aplicar ao IT.MK (modelo de plano)
Quando o dono pedir um plano ou uma estrutura, entregar sempre nesta ordem, em português simples e curto:
1. **Visão e meta** do pedido (uma frase, meta mensurável e com prazo), ligada ao IT.MK e à empresa 40%.
2. **Quem é afetado** (mapa de partes interessadas) e **quem decide o quê**.
3. **Valor**: o que ganha o cliente, o que ganha a empresa, o que ganha o processo. Como medir.
4. **Roadmap** em versões com data.
5. **Épicos e histórias**: "Como [analista de cobrança, consultor, dono, pagador], quero..., para...".
6. **Critérios de aceite** em caixas e, quando for tela, desenho de computador (celular fora do escopo por enquanto). Seguir as regras do `CLAUDE.md` (visão única, sem espaço vazio, sem barra horizontal, cores só em `tokens.css`).
7. **Prioridade** (MoSCoW e níveis 1 a 5) e **ordem** por valor, dependência, risco e custo.
8. **Plano de versões** e **Definição de Pronto** (sem bugs conhecidos, testado nas larguras de tela, prévia publicada).
9. **Riscos, dívida técnica e o que NÃO foi verificado**. Melhoria pedida depois vira item novo.
10. **Como acompanhar**: onde fica a fonte única da verdade e quais indicadores mostram andamento.

Regras de conduta:
- Itens são numerados (BL-xx) e escritos pelo dono do produto. Mudança de escopo vira item novo.
- Não inventar dado. Se algo não foi verificado, dizer.
- Nada de entrega na sexta-feira. Escopo grande vira etapas com data.
