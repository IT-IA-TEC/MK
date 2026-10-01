# Lições aprendidas (o que o dono precisou corrigir e como não repetir)

Fonte: leitura de toda a conversa. Cada erro tem: o que aconteceu, por que passou despercebido e 5 soluções. A última solução de cada erro já está aplicada em mim (ver "O que já corrigi em mim").

## 1. Espaço vazio, barra de rolagem e colunas desproporcionais
- **O que houve:** o dono mandou prints com vazio e rolagem lateral e criou a "regra máxima de layout"; depois pediu para ajustar a proporção das colunas em todo o sistema.
- **Por que passou:** eu testava poucas larguras e só procurava rolagem. Não olhava a proporção nem o vazio dentro das colunas.
- **5 soluções:**
  1. Testar sempre 1920, 1600, 1360 e 1100 antes de entregar.
  2. Tirar print de cada tela e olhar o print, não só o resultado do teste.
  3. Ter um teste automático de vazio: nenhum bloco com mais de 15% de área sem conteúdo.
  4. Conferir cada coluna e cartão contra a regra "preenche a largura, sem buraco".
  5. Reler as 4 regras de layout do CLAUDE.md antes de cada entrega visual. (aplicado)

## 2. Visual exagerado, "cara de IA", abas confusas, categorias sem diferença, lados e centralização
- **O que houve:** "sem padrões extravagantes"; "inverta os lados"; "precisa ter diferença nos cobelarios"; "e centralize estes"; "abas de relatório bagunçadas, não dá para saber qual é qual".
- **Por que passou:** eu mexia no código sem olhar o resultado como o dono vê. Não perguntava "dá para entender isso em 3 segundos?".
- **5 soluções:**
  1. Olhar o print como se fosse o dono, tela por tela.
  2. Aba ativa, aba inativa e categoria sempre com diferença clara de cor e peso.
  3. Usar só os tokens de `tokens.css`; nenhum efeito novo sem pedido.
  4. Em pedido de alinhamento ("lados", "centralize"), repetir o pedido ao dono em uma linha e conferir no print.
  5. Ao mexer em um componente, procurar todos os iguais no sistema e ajustar juntos. (aplicado)

## 3. Navegação do Marketplaces
- **O que houve:** ao abrir Marketplaces aparecia uma coisa, ao clicar em outra aparecia outra e não dava para navegar. O dono queria abas principais com subabas.
- **Por que passou:** eu testei cada tela sozinha, nunca o caminho completo de clique.
- **5 soluções:**
  1. Teste de fluxo: entrar, clicar em todo item do menu e em toda aba, e voltar.
  2. Perguntar "isso é aba principal ou subaba?" quando o desenho tiver dois níveis.
  3. Usar um só jeito de abas em todos os módulos.
  4. Conferir que o conteúdo nunca fica pendurado de outro módulo.
  5. Rodar o teste de navegação em toda entrega visual. (aplicado)

## 4. Agir quando era "só para conhecimento"
- **O que houve:** o dono mandou algo para eu entender e eu já fui fazendo; ele pediu para desfazer.
- **Por que passou:** tratei um material como ordem de trabalho.
- **5 soluções:**
  1. Ler a frase do dono procurando "para conhecimento", "só ver", "sem fazer nada".
  2. Na dúvida se é ordem ou conhecimento, perguntar antes.
  3. Quando for conhecimento, responder só "registrado" e uma linha do que entendi.
  4. Nunca mexer em arquivo ou publicar antes da ordem clara.
  5. Registrar no CLAUDE.md. (aplicado)

## 5. Explicações que o dono não entendeu
- **O que houve:** "não entendi" várias vezes; e um texto meu para o outro agente que "nem eu entendi".
- **Por que passou:** escrevi com termo técnico e sem exemplo.
- **5 soluções:**
  1. Frases curtas, sem termo técnico.
  2. Sempre um exemplo com o caso do IT.MK.
  3. Dizer primeiro o que já está feito e depois o que falta.
  4. Quando ele disser "não entendi", não repetir: reescrever de outro jeito e mais curto.
  5. Reler o texto como se eu não fosse técnico antes de enviar. (aplicado)

## 6. Celular fora da decisão
- **O que houve:** pedi desenho de celular nos itens; o dono já tinha decidido que não há celular.
- **Por que passou:** supus que "responsivo" era o padrão.
- **5 soluções:**
  1. Não supor padrão do mercado; perguntar quando algo muda escopo.
  2. Antes de montar um texto, reler as decisões do dono no CLAUDE.md.
  3. Manter lista de decisões fechadas à vista.
  4. Se uma decisão nova aparecer, gravar na hora.
  5. Gravada em "Celular" no CLAUDE.md. (aplicado)

## 7. Pedido ao outro agente sem saber se existe ou precisa
- **O que houve:** pedi um recurso (desenho do item) que o dono disse que não precisava; e o dono precisou pedir de novo o `depende`.
- **Por que passou:** pedi sem conferir o que a ferramenta já tinha nem se o dono queria.
- **5 soluções:**
  1. Primeiro conferir o arquivo de instruções, depois pedir.
  2. Só pedir o que o dono confirmou.
  3. Escrever o pedido em texto curto e testável (como saber que ficou certo).
  4. Pedido novo vira lista de "ok / parcial / falta" quando o arquivo voltar.
  5. Não pedir nada a outro agente sem mostrar ao dono antes. (aplicado)

## 8. Lote com lacunas e envio antes de tirar as dúvidas
- **O que houve:** "se está faltando coisa, não mande o lote ainda". Depois, na sessão atual, mandei arquivos com dúvidas abertas, e o dono disse que já tinha avisado.
- **Por que passou:** tratei minha sugestão como se fosse resposta do dono e fui para o "entregar".
- **5 soluções:**
  1. Antes de gerar qualquer arquivo, listar as dúvidas abertas e perguntar todas.
  2. Só gerar e enviar quando as dúvidas forem zero.
  3. Sugestão minha nunca vira decisão: só vale a resposta do dono.
  4. Se o dono mudar a regra no meio, refazer a lista de dúvidas desde o começo.
  5. O envio é o último passo; antes dele, uma checagem escrita "dúvidas abertas: 0". (aplicado)

## 9. Mudar o jeito de trabalhar e dizer "conferido" sem ter conferido
- **O que houve:** ao receber o arquivo novo, em vez de conferir ponto por ponto como sempre, disse só "cobre o que você pediu". Disse que os dois lotes tinham sido conferidos, mas o 05 não tinha conferidor. Mexi no conferidor sem avisar. Não enviei os arquivos.
- **Por que passou:** usei atalho com um assunto que parecia simples, e escrevi "conferido" no sentido geral.
- **5 soluções:**
  1. Seguir sempre o mesmo ritual (abaixo).
  2. Dizer só o que de fato conferi, e o que não consegui conferir.
  3. Avisar qualquer mudança em ferramenta minha.
  4. Quando chega arquivo novo, responder em três grupos: certo, só em parte, falta.
  5. Ritual fixo gravado no CLAUDE.md. (aplicado)

## 10. Regras do dono que eu contradisse sem perceber
- **O que houve:** a conta do valor da 40% estava em duas telas diferentes; a coluna "Ver valores em R$" contrariava a visão única; um número "9.000" era lido como 9.
- **Por que passou:** eu só encontrei depois, por revisão. Não cruzava a tela com as regras.
- **5 soluções:**
  1. Cruzar cada tela com as regras do CLAUDE.md (visão única, dinheiro exato, sem celular).
  2. Procurar nomes proibidos (diretor, CEO, colaborador) por busca no código.
  3. Teste dos cálculos com valores reais de exemplo.
  4. Uma só fórmula escrita em um lugar.
  5. Rodar a busca de regras em toda entrega. (aplicado)

## 11. Trabalho deixado sem commit
- **O que houve:** o aviso de "arquivos sem commit" apareceu cerca de 20 vezes.
- **Por que passou:** eu terminava o trabalho e só depois lembrava de salvar.
- **5 soluções:**
  1. Commit e push ao fim de cada bloco de trabalho.
  2. Antes de responder ao dono, rodar `git status`.
  3. Arquivos temporários só na pasta de rascunho.
  4. Mensagem de commit curta e clara.
  5. `git status` limpo é o último passo de todo turno. (aplicado)

## 12. Ritmo: "bora, termina isso logo"
- **O que houve:** o dono reclamou da demora.
- **Por que passou:** trabalhei uma frente por vez e com mensagens de progresso longas.
- **5 soluções:**
  1. Dividir em partes e rodar em paralelo quando são independentes.
  2. Menos relatório intermediário.
  3. Entregar a parte pronta enquanto a outra termina.
  4. Estimar e avisar quando algo leva mais tempo.
  5. Paralelizar por padrão. (aplicado)

## 13. Mudei os dados de exemplo e quebrei telas que eu não abri
- **O que houve:** ao trocar os códigos das lojas (GS por plataforma), o Fechamento e a aba Faturamento do Marketplaces pararam de funcionar. O dono só veria ao abrir. Achei na conferência de cartões desalinhados.
- **Por que passou:** testei só as telas que mudei, não todas as que usam aquele dado.
- **5 soluções:**
  1. Ao mudar um dado de exemplo, buscar todo uso dele no código.
  2. Rodar a varredura que abre todo módulo e toda aba e lista erros de tela.
  3. Comparar números e abas com a versão anterior (iguais, salvo o que mudou de propósito).
  4. Rodar a auditoria de alinhamento de cartões nas 4 larguras.
  5. Fazer essa varredura em toda entrega visual. (aplicado)

## 14. Troquei um arquivo que o dono já tinha executado
- **O que houve:** mandei o 21, achei um problema e mandei de novo o 21 corrigido. O dono já tinha executado o primeiro.
- **Por que passou:** validei depois de enviar, não antes.
- **5 soluções:**
  1. Conferir tudo (validador, épico repetido, frente) antes de enviar.
  2. Nunca reenviar com o mesmo número: criar arquivo novo de correção.
  3. Dizer qual arquivo já foi enviado e qual é a correção.
  4. Deixar no repositório o arquivo exatamente como foi enviado.
  5. Registrar a regra no CLAUDE.md. (aplicado)

## O ritual fixo (nunca mudar)
1. Chega arquivo ou regra nova → conferir ponto por ponto → responder certo / só em parte / falta.
2. Listar todas as dúvidas → perguntar todas → esperar.
3. Só com zero dúvidas: montar.
4. Conferir com o validador e dizer o que conferi e o que não deu para conferir.
5. Enviar os arquivos, dizer a ordem de colar, esperar a confirmação do dono.
6. Visual: tirar print, olhar, publicar o link.
7. Fechar: commit, push, `git status` limpo.
