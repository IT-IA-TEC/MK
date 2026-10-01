# CicloDev: respostas fechadas e guia "Montar o projeto"

Para o agente do CicloDev. O CicloDev serve para qualquer projeto. O IT.MK aparece só como exemplo dentro dos textos.

## 1. Respostas às cinco perguntas

1. **Limites.** 5 dias parado, 3 dias esperando aceite, 13 pontos = grande e ritmo medido em 4 semanas são **valores padrão**, editáveis em Configurações **por projeto**. A base de método não define esses números; são sugestão.
2. **Selo "Preparado".** Exige história, ao menos 1 critério, classe MoSCoW, valor, pontos, **versão** e tamanho dentro do limite de pontos. A **dependência não tira** o selo: o item com dependência ainda não aceita ganha o estado separado **"Bloqueado"** (mostra "depende de ..."). Base: o refinamento avalia incertezas, complexidade, dependências e critérios de aceite, e o topo do backlog tem histórias pequenas e detalhadas.
3. **Decisão.** Tipo próprio **"Decisão"**, com prazo de decisão (como a Tarefa externa). Nunca detectar pelo título, porque o sistema serve a qualquer projeto e idioma.
4. **"O que fazer hoje".** Mostra as 5 de maior peso, nesta ordem de importância:
   1. aceite esperando o P.O.
   2. decisão que trava itens
   3. dependência circular
   4. versão em risco
   5. Definição de Pronto ou P.O. faltando
   6. item parado
   7. item fora de ordem
   8. refinar o topo
   9. metas
   Regra do método: destravar e terminar antes de começar coisa nova.
5. **Guia "Montar o projeto".** Abaixo.

## 2. Guia "Montar o projeto"

Formato igual ao dos guias de banco: `titulo`, `abertura`, `passos` (cada um com `titulo`, `texto`, `nota` opcional, `pergunta` e `abrir` opcional) e `fim`. Botões de cada passo: **Feito, próximo passo**, **Tenho uma dúvida**, **Deu erro**. O botão **Abrir ...** só aparece onde o passo indica `abrir`, e o id da janela é escolhido pelo time do CicloDev.

Regras de escrita: português simples, frases curtas, sem travessão. O guia não pede senha nem dado secreto. A pessoa pode pular um passo e voltar depois. O passo marcado como feito só vale se o sistema confirmar (ver "Confere" em cada passo).

**titulo:** Montar o projeto

**abertura:** Vou te ajudar a montar o projeto do jeito que um Product Owner faria, um passo por vez. São 9 passos curtos. Ao final, o projeto terá meta, versões com data, regras de pronto, itens e riscos. Você pode parar e voltar quando quiser. Vamos começar?

### Passo 1 de 9: Visão e meta
- **texto:** Escreva em uma frase para que serve o projeto e o que ele precisa conseguir. Exemplo: "O analista de cobrança fecha o mês, gera os Pix e confere o dinheiro que entrou sem usar planilha."
- **nota:** A meta precisa dizer o resultado para a pessoa que usa, não a tecnologia.
- **pergunta:** Qual é a visão do projeto em uma frase? Escreva aqui e eu guardo como meta do projeto.
- **abrir:** janela de metas do projeto
- **Confere:** o projeto tem pelo menos uma meta.

### Passo 2 de 9: Partes interessadas e quem é o P.O.
- **texto:** Diga quem usa o sistema, quem decide e quem paga. Escolha também **quem é o P.O.** do projeto, que é a pessoa que aceita ou devolve cada item. Se o time for uma pessoa só, o P.O. é ela mesma e o sistema vai pedir que você confira cada critério antes de aceitar.
- **nota:** Sem P.O. definido, qualquer pessoa do time pode aceitar. Definir o P.O. protege o método.
- **pergunta:** Quem é o P.O. deste projeto, e quem são as outras partes interessadas?
- **abrir:** janela de pessoas e papéis do projeto
- **Confere:** o projeto tem P.O. definido.

### Passo 3 de 9: Valor e como medir o sucesso
- **texto:** Escolha 1 a 3 sinais que mostram que o projeto deu certo. Pode ser dinheiro economizado ou recebido, tempo ganho ou menos erro. Exemplo: "Fechar o mês em 1 dia em vez de 5."
- **nota:** Valor entregue é diferente de quantidade de tarefas feitas.
- **pergunta:** Como você vai saber que o projeto deu certo? Diga até 3 sinais com número, se souber.
- **abrir:** janela de metas do projeto
- **Confere:** a meta tem pelo menos um resultado medido ou uma data para medir.

### Passo 4 de 9: Versões com data e meta
- **texto:** Divida a entrega em versões. Cada versão precisa de **data de entrega** e de uma **meta** de uma frase. Comece pequeno: a primeira versão deve entregar algo que já dá para usar. Evite data na sexta-feira.
- **nota:** Versão nova sem data não é aceita pelo sistema.
- **pergunta:** Quais são as versões, a data de cada uma e a meta de cada uma?
- **abrir:** janela de versões
- **Confere:** existe ao menos uma versão com data e meta.

### Passo 5 de 9: Definição de Pronto
- **texto:** Escolha as regras que todo item precisa cumprir para ser aceito. O sistema oferece um modelo para você marcar o que vale para o seu projeto. Exemplos: "testado por quem pediu", "sem bug conhecido", "documentação atualizada".
- **nota:** Pronto é uma lista combinada com o time. Ela aparece como lembrete em todo item.
- **pergunta:** Quais regras de pronto valem para este projeto? Quer começar pelo modelo padrão?
- **abrir:** janela da Definição de Pronto
- **Confere:** a Definição de Pronto tem pelo menos 3 regras.

### Passo 6 de 9: Épicos e itens
- **texto:** Liste as entregas grandes (épicos) e, dentro de cada uma, os itens. Dê a cada item um título curto que comece com um verbo. Você pode digitar um por um ou colar vários de uma vez no Criar em lote.
- **nota:** Item muito grande deve ser quebrado. O sistema avisa quando passa de 13 pontos, e o limite é editável.
- **pergunta:** Quais são as entregas grandes do projeto e quais itens entram em cada uma?
- **abrir:** Criar em lote
- **Confere:** existe ao menos um épico com itens.

### Passo 7 de 9: História, critérios de aceite e prioridade
- **texto:** Para os itens do topo, escreva: "Como [quem], quero [o quê], para [por quê]". Depois escreva os critérios, cada um com resposta sim ou não ("Salva nome e CPF"). Por fim, escolha a prioridade (Deve, Deveria, Poderia ou Não terá agora), o valor de 1 a 10 e os pontos.
- **nota:** O item só ganha o selo **Preparado** quando tem tudo isso, mais versão e tamanho dentro do limite. Deixe pronto primeiro o que vai ser feito primeiro.
- **pergunta:** Quer que eu mostre os itens do topo que ainda não estão preparados e o que falta em cada um?
- **abrir:** lista de itens filtrada por não preparados
- **Confere:** os itens do topo da fila têm selo Preparado.

### Passo 8 de 9: Riscos e o que ainda não foi verificado
- **texto:** Liste o que pode dar errado e o que você ainda não confirmou. Para cada risco, diga quem cuida e quando revisar. Decisões que ainda estão abertas viram itens do tipo **Decisão**, com prazo.
- **nota:** O sistema avisa quando uma decisão aberta trava itens.
- **pergunta:** Quais são os maiores riscos e quais decisões ainda estão abertas?
- **abrir:** janela de decisões
- **Confere:** existe ao menos um risco ou uma decisão registrada, ou a pessoa confirmou que não há.

### Passo 9 de 9: Rotina de acompanhamento
- **texto:** Combine uma rotina simples. Todo dia, olhe a lista **O que fazer hoje**. Toda semana, olhe o resumo da versão. Ao fechar uma versão, faça a revisão do ciclo: o que entregou, o que foi devolvido e o que aprendeu.
- **nota:** O sistema sugere e você decide. Ele nunca aceita, devolve nem muda a ordem sozinho.
- **pergunta:** Em que dia e horário você quer receber o resumo da semana?
- **abrir:** janela de preferências de avisos
- **Confere:** a pessoa tem preferência de resumo definida.

**fim:** Pronto! O projeto está montado: tem meta, P.O., versões com data, Definição de Pronto, itens e riscos. A partir de agora, comece o dia pela lista **O que fazer hoje**. Se algo mudar, você pode voltar a qualquer passo deste guia.

## 3. Perguntas frequentes sugeridas (para as respostas sem IA)
- **O que é o selo Preparado?** O item está bem escrito e pode começar: tem história, critério, prioridade, valor, pontos, versão e tamanho dentro do limite.
- **O que é Bloqueado?** O item depende de outro que ainda não foi aceito. Ele pode estar Preparado e mesmo assim esperar.
- **Sou uma pessoa só. Preciso de P.O.?** Sim, o papel existe. Você acumula os dois, e o sistema pede que confira os critérios um a um antes de aceitar.
- **Por que meu item é "grande demais"?** Tem mais pontos que o limite do projeto. Quebre em itens menores para a estimativa ficar confiável.
- **Posso mudar os limites?** Sim, em Configurações do projeto.
