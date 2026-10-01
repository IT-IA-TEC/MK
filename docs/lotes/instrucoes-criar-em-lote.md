# Criar em lote no CicloDev: instruções para um agente de IA

## Formato do Criar em lote do CicloDev

O CicloDev cria vários itens de uma vez a partir de um texto simples. O CicloDev segue o método de Product Owner: cada item pode ter história, critérios de aceite, prioridade, valor, estimativa e tipo. Siga as regras exatamente: o texto é lido linha por linha.

### Linhas de estrutura

1. **Linha sem traço** vira um **épico** (uma entrega grande).
2. **Linha que começa com `- `** vira um **item** dentro do épico da linha de cima.
3. **Linha em branco** separa um épico do outro (opcional, só deixa mais fácil de ler).
4. **`[Nome da frente]` no fim da linha** diz em qual frente de trabalho fica. O item herda a frente do épico quando não diz outra.
5. **`{Nome da versão}` no fim da linha** diz em qual versão entra. O item herda a versão do épico. Uma versão que ainda não existe precisa ser declarada no texto, com a data de entrega (veja Versões, abaixo).

### Linhas de detalhe (opcionais)

Logo abaixo da linha do item, uma linha por campo, no formato `campo: valor`. Recue com dois espaços para ficar fácil de ler (o recuo é opcional). Os detalhes valem para o item da linha `- ` mais próxima acima.

| Campo | O que é | Valores aceitos | Exemplo |
|---|---|---|---|
| `como` | História: quem usa | texto curto (até 300 letras) | `como: lojista` |
| `quero` | História: o que a pessoa quer | texto curto (até 500 letras) | `quero: ver o saldo de anúncios` |
| `para` | História: por que isso importa | texto curto (até 500 letras) | `para: saber quantos ainda posso publicar` |
| `historia` | A história inteira numa linha (no lugar de como, quero e para) | `Como [quem], quero [o quê], para [por quê]` | `historia: Como lojista, quero ver o saldo, para decidir` |
| `aceite` | Um critério de aceite. Repita a linha para cada critério, na ordem | texto (até 500 letras) | `aceite: Mostra o saldo atualizado` |
| `prioridade` | Classe MoSCoW e, depois, o nível | `Deve`, `Deveria`, `Poderia` ou `Não terá agora`, seguido do nível de 1 a 5 | `prioridade: Deve 2` |
| `nivel` | Só o nível, se não vier junto da prioridade | 1 a 5 | `nivel: 3` |
| `valor` | Valor de negócio, e por que importa | número de 1 a 10, e depois o motivo | `valor: 8 reduz as ligações ao suporte` |
| `pontos` | Estimativa | 1, 2, 3, 5, 8, 13 ou 20 | `pontos: 5` |
| `tipo` | Tipo do item | `Item`, `Bug` ou `Melhoria` | `tipo: Bug` |
| `origem` | O item de origem (obrigatório no Bug) | a chave de um item que já existe (BL-12), o título de um item (que já existe ou que está neste mesmo texto) ou a posição do item neste texto (`#3` é o 3º item, contando de cima) | `origem: BL-12`, `origem: Cadastro do cliente`, `origem: #1` |
| `meta` | **Do épico**: a meta da entrega. Logo abaixo da linha do épico, sem traço. **Da versão**: logo abaixo da linha `versão:` | texto (até 1000 letras) | `meta: o lojista publica sem ligar para o suporte` |
| `versão` | Declara uma versão (linha sem recuo, em qualquer lugar do texto) | o nome da versão | `versão: v1.3` |
| `entrega` | **Da versão**: a data de entrega, logo abaixo da linha `versão:`. Obrigatória em versão nova | dia/mês/ano ou ano-mês-dia | `entrega: 15/11/2026` |
| `pronto` | Uma regra da Definição de Pronto do projeto (repita a linha para cada regra; sem recuo, em qualquer lugar) | texto (até 300 letras) | `pronto: Testado no computador e no celular` |

**O nível de prioridade:** 1 só para emergência; 2 é o mais urgente do dia a dia; 3 é o ritmo normal; 4 pode esperar; 5 é ideia ainda sem detalhe.

**Os tipos:** Item é algo novo que a pessoa vai ver ou usar. Bug é um critério de aceite que não foi cumprido: sempre com `origem:` apontando o item. Melhoria é mudança pedida depois que um item ficou pronto: é sempre um item novo (pode ter `origem:` com o item antigo), nunca uma mudança no item antigo.

### Versões

Uma versão é declarada com a linha `versão: nome` e, logo abaixo, `entrega:` (a data, obrigatória em versão nova) e `meta:` (opcional). Depois, os épicos e itens entram nela com `{nome}` no fim da linha, como sempre.

- Versão que **já existe**: pode ser usada só com `{nome}`. Se for declarada com `entrega:` ou `meta:`, a data e a meta dela são atualizadas.
- Versão **nova** sem `entrega:` é erro: ela e os itens que apontam para ela ficam de fora até corrigir.
- Na tela, a data de entrega também é obrigatória (Entregas › Nova versão e Editar em tabela), e a meta fica na própria versão, em Entregas.

```
versão: v1.3
  entrega: 15/11/2026
  meta: o lojista cuida da carteira sozinho

Carteira de clientes {v1.3}
- Cadastro do cliente
```

### Ordem do backlog

**A ordem das linhas vira a ordem da fila.** Os itens novos entram no fim da fila do projeto, um depois do outro, na mesma ordem em que aparecem no texto (de cima para baixo). Itens que já existem e só são atualizados **não mudam de lugar**. Por isso, escreva primeiro os mais importantes. Depois, o P.O. ajusta a ordem na tela (arrastando, pela posição no item ou com Ordenar pela prioridade).

### Situação, histórico e Definição de Pronto

- **Situação**: todo item criado pelo lote começa em **Criado** (o épico, em Priorizado). O lote **não muda a situação** de nenhum item: ela muda só na tela. O ciclo é Criado › Priorizado › Em andamento › Pronto para testar › Aceito, e Voltou quando o P.O. devolve. Quem leva até Pronto para testar é qualquer pessoa do time; **Aceitar e Devolver só o P.O. do projeto** (se o projeto não tem P.O., qualquer um do time aceita, como antes). Nada vai para Aceito com critério de aceite desmarcado. Aparece na janela do item (cartão Principal), no Quadro, na Lista e na Fila.
- **Histórico de mudanças**: o próprio sistema grava cada mudança de situação e de critério (criou, marcou, desmarcou, tirou), com quem fez e quando. Ninguém escreve nem apaga o histórico, nem pelo lote. Aparece no fim da janela do item.
- **Definição de Pronto**: um texto por projeto, mostrado como lembrete em todo item (abaixo dos critérios de aceite) e em Entregas. Pelo lote, cada linha `pronto:` acrescenta uma regra; as que já existem não se repetem e nada é apagado. Na tela, quem edita é qualquer pessoa do time, em Entregas ou no item.

### Regras de leitura

1. Um campo por linha. Não junte dois campos na mesma linha.
2. Os critérios de aceite vão com `aceite:`, um por linha. **Não** use `- ` para critério: linha com `- ` vira item.
3. Valor fora do aceito (prioridade que não existe, nível fora de 1 a 5, estimativa fora da sequência, valor fora de 1 a 10, campo que não existe, Bug sem origem) aparece como erro na prévia, com o número da linha, e **aquele item não é criado**. Os outros itens entram normalmente.
4. Um épico com o mesmo nome de um que já existe no projeto **não é duplicado**: os itens entram nele.
5. Um item com o mesmo título dentro de um épico que já existe **não é duplicado**: ele recebe os campos que vieram no texto, e nada do que ele já tem é apagado (os critérios novos se somam aos que já existem).
5b. **Critério de aceite repetido é ignorado**: colar o mesmo texto de novo não duplica critério. Conta como igual o critério com o mesmo texto, sem diferença de maiúscula, acento ou espaço; no mesmo item do texto, a segunda linha igual também é ignorada.
5c. Bug e Melhoria podem apontar para um item do **mesmo texto**, que ainda não tem número: use o título dele (`origem: Cadastro do cliente`) ou a posição dele no texto (`origem: #1`). A ligação é feita depois que todos são criados. Se o item de origem tiver erro, o Bug ou a Melhoria também fica de fora.
6. Item que já foi aceito não muda a história nem os critérios: para mudar, crie um item novo com `tipo: Melhoria`.
7. Títulos curtos e claros (até 300 letras), começando com verbo ou com o nome da coisa (ex.: "Cadastro do cliente", "Validar CPF no cadastro").
8. Prazo e responsável não vão no texto: ajustam-se depois, na tela.
9. O formato antigo, só com títulos, continua valendo: os detalhes são opcionais.

### Exemplo só com títulos

```
Carteira de clientes [Database]
- Cadastro do cliente
- Cadastro das lojas
- Tela da lista da carteira [Frontend]

Catálogo e limite de publicação [Backend]
- Limite total de anúncios
- Anúncios publicados e saldo
```

### Exemplo completo

```
Carteira de clientes [Database]
meta: o lojista cuida da própria carteira sem ligar para o suporte
- Cadastro do cliente
  como: lojista
  quero: cadastrar meus clientes com CPF e telefone
  para: não perder o contato de quem já comprou
  aceite: Salva nome, CPF e telefone
  aceite: Avisa quando o CPF já está cadastrado
  aceite: Funciona no celular
  prioridade: Deve 2
  valor: 8 é o que mais gera ligação no suporte
  pontos: 5
- Tela da lista da carteira [Frontend]
  historia: Como lojista, quero ver todos os meus clientes numa lista, para achar um cliente rápido
  aceite: Busca pelo nome ou pelo CPF
  prioridade: Deveria 3
  pontos: 3
```

### Exemplo com Bug e Melhoria

```
Carteira de clientes
- Cadastro do cliente
  aceite: Avisa quando o CPF já está cadastrado
- CPF repetido entra no cadastro
  tipo: Bug
  origem: Cadastro do cliente
  aceite: Avisa quando o CPF já está cadastrado
  prioridade: Deve 2
  pontos: 2
- Exportar a carteira em planilha
  tipo: Melhoria
  origem: #1
  como: lojista
  quero: baixar a carteira em planilha
  para: mandar para o meu contador
  prioridade: Poderia 4
  valor: 3
  pontos: 3
```

### Nomes que existem agora (em Frontend)

**Frentes de trabalho** (use exatamente um destes nomes dentro de `[ ]`):
- Frontend
- Backend
- Database
- Integrações

**Versões abertas** (use só o nome dentro de `{ }`; a próxima sugerida é `v0.1`):
- (nenhuma: declare `versão: v0.1` com `entrega:` embaixo)

**Épicos que já existem no projeto** (repetir o nome põe os itens dentro dele):
- (nenhum ainda)

**Definição de Pronto de BL** (hoje):
- (ainda não escrita: pode mandar linhas pronto:)

**P.O. do projeto:** ninguém definido (qualquer um do time aceita)

### Roteiro para o agente

Você vai ajudar a pessoa a organizar o trabalho de "BL" no CicloDev, como um Product Owner faria.

1. Converse com a pessoa para entender o que precisa ser feito. Faça perguntas curtas, uma de cada vez, até entender as entregas (épicos) e os itens de cada uma.
2. Para cada item, descubra a história (quem usa, o que quer e por quê) e os critérios de aceite (o que precisa estar certo para aceitar). Critérios curtos, que dê para conferir com sim ou não.
3. Combine a prioridade (Deve, Deveria, Poderia, Não terá agora e o nível de 1 a 5), o valor de negócio (1 a 10, com o motivo) e, se a pessoa souber, a estimativa em pontos.
4. Escreva os itens na ordem de importância: a ordem das linhas vira a ordem da fila. Os do topo devem ser os mais detalhados. Ideias ainda soltas podem ficar só com o título e `prioridade: Poderia 5`.
5. Se a entrega for numa versão nova, declare a versão com `versão:` e `entrega:` (a data é obrigatória). Agrupe os itens em épicos que façam sentido para quem vai entregar. Reaproveite os épicos que já existem quando o assunto for o mesmo.
6. Use só as frentes da lista acima. Se nenhuma servir, avise a pessoa em vez de inventar.
7. Use só os valores aceitos da tabela. Na dúvida, deixe o campo de fora: ele pode ser preenchido depois, na tela.
8. Mostre um resumo e peça confirmação antes de gerar o texto final.
9. No fim, entregue **só o texto no formato acima, dentro de um bloco de código**, sem comentários no meio, pronto para colar em **Criar em lote**.
