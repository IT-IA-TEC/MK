# Manual 08: JavaFX, Java e Spring para o IT.MK

Consulta feita em 01/10/2026 nas páginas oficiais (lista na seção 15). Linguagem simples, voltada ao dono do produto.
Regra deste manual: o que não foi lido numa página oficial está marcado como **não confirmado**. Números de versão vêm só das páginas lidas.
Observação: as páginas foram lidas por uma ferramenta que resume o conteúdo. Antes de fechar uma decisão de versão, o time técnico deve conferir o número na própria página.

---

## 1. Resumo em 12 linhas

1. O desenho aprovado (HTML em `prototipo/`) será refeito em JavaFX. Cores e medidas vêm de `tokens.css`; em JavaFX viram "cores nomeadas" num arquivo `.css` (seção 6).
2. Versões atuais: Java 25 (LTS, setembro/2025) é a base recomendada. JavaFX 25 é a versão de longo prazo (LTS) do JavaFX. JavaFX 27 saiu em 15/09/2026 e é a mais nova.
3. O JavaFX 27 trouxe "consultas de mídia" no CSS (largura da janela, tema claro/escuro, movimento reduzido). Isso é o mais parecido com o `@media` do protótipo.
4. Não existe, em JavaFX, o `@container` do protótipo (regra que olha a largura do bloco, não da janela). Faz-se com código que observa a largura e troca uma classe de estilo (seção 5.6).
5. Spring Boot 4.1 (junho/2026) pede Java 17 ou mais e aceita até Java 26 (página lida). Sobre Java 27: **não confirmado**.
6. Spring Boot e JavaFX se juntam assim: a tela (JavaFX) liga primeiro e cria o Spring dentro do `init()`; os controllers são criados pelo Spring (seção 8).
7. Tela só pode ser mexida na "linha da tela" (JavaFX Application Thread). Trabalho demorado (banco, API) roda em `Task` e o resultado volta pela linha da tela (seção 9).
8. Para entregar: `jpackage` gera instalador (.exe/.msi no Windows). Precisa ser gerado em cada sistema (não gera Windows a partir de Linux).
9. Banco: o Supabase tem 3 formas de conectar. Para um programa que fica aberto, a conexão direta (ou a "session pooler") serve; a "transaction pooler" não aceita comandos preparados.
10. Regra de segurança: senha do banco e chaves secretas nunca ficam dentro do aplicativo instalado no computador do usuário (seção 12).
11. A regra de layout do projeto (sem espaço vazio, sem rolagem horizontal) é possível em JavaFX, com disciplina nos painéis (seção 5).
12. Pontos sem equivalente direto: transição por CSS, `@container`, `position: sticky`, `text-align: justify`, hifenização, `text-wrap: balance` (seção 11).

---

## 2. Versões e requisitos (conferidas em 01/10/2026)

### 2.1 Java
| Versão | Tipo | Lançamento | Suporte Oracle (premier) | Fonte |
|---|---|---|---|---|
| Java 17 | LTS | set/2021 | terminou 30/09/2026; estendido até 30/09/2029 | endoflife.date |
| Java 21 | LTS | set/2023 | até 30/09/2028 | endoflife.date |
| **Java 25** | **LTS** | **16/09/2025** | **até 30/09/2030** | openjdk.org/projects/jdk/25 e endoflife.date |
| Java 27 | não LTS | 15/09/2026 | até 31/03/2027 | endoflife.date |

- A página da Oracle (java-se-support-roadmap) devolveu erro 403 e não foi lida. As datas acima vieram do site endoflife.date (fonte de terceiros, não oficial). **Conferir na Oracle antes de citar em contrato.**
- Java 26 existe (Spring Boot 4.1 e JavaFX 26 citam), mas sua data e seu fim de suporte **não foram confirmados**.
- Recomendação: **Java 25 LTS** (é o mínimo do JavaFX 27 e o LTS atual). Java 21 é o plano B.
- Java 25 trouxe, entre outros (openjdk.org): arquivos "compactos" com método main simples (JEP 512), valores com escopo (JEP 506), cabeçalhos de objeto compactos (JEP 519). Nenhum deles é obrigatório para o IT.MK.
- Notícia da comunidade (foojay, setembro/2026): a partir do JDK 27 não é mais preciso ter uma classe `Main` separada para apps JavaFX iniciados por classpath. **Não confirmado** na documentação oficial do JDK. Por isso, a seção 8 mantém as duas classes.

### 2.2 JavaFX
| Versão | Tipo | JDK mínimo para rodar | Observação |
|---|---|---|---|
| JavaFX 17 | LTS | 11 | Gluon: suporte acaba em outubro/2026 |
| JavaFX 21 | LTS | 17 | |
| **JavaFX 25** | **LTS (set/2025)** | **23** | Linux pede GTK 3.20 ou mais |
| JavaFX 26 | não LTS (mar/2026) | 24 | Plataforma "sem tela" (headless) em protótipo |
| **JavaFX 27** | não LTS (15/09/2026) | **25** | Metal padrão no macOS, @media e @import condicional no CSS, controles na barra de título |

- Fontes: openjfx.io/highlights/25, 26, 27 e gluonhq.com/products/javafx.
- O site da Gluon lia "26 é a versão atual" (página possivelmente desatualizada, anterior ao 27). O site openjfx.io confirma o 27 lançado em 15/09/2026.
- Gluon: indica usar "a mais recente ou o último patch de uma LTS". Números de patch citados pela Gluon (ex.: 25.0.4, 21.0.12, 17.0.20): **não confirmados**, mudam todo mês. Sempre pegar o último no Maven Central.
- **Decisão sugerida (a confirmar com o time técnico):** começar em **JavaFX 25 LTS** (estável, suporte longo). Subir para o 27 só se o IT.MK precisar de `@media` no CSS. O 27 exige Java 25, que já é a base recomendada.
- Plataformas com suporte pela Gluon: Windows x64, Linux x64, macOS x64 e aarch64.

### 2.3 Spring
| Peça | Versão lida | Observação |
|---|---|---|
| Spring Boot | **4.1.1** (4.1 lançado em 30/06/2026) | Java 17 a 26; Maven 3.6.3+; Gradle 8.14+ ou 9.x |
| Spring Boot 4.0 | 4.0.8 | Suporte aberto até 31/12/2026 |
| Spring Boot 3.5 | | Suporte aberto terminou; comercial até 30/06/2032 |
| Spring Framework | 7.0.8 na página do projeto; 7.0.9 na página de requisitos | Boot 4.1.1 pede Spring Framework 7.0.9 ou mais. Diferença entre páginas: usar o que o Boot trouxer |
| Spring Data JDBC | 4.1.1 (página de referência) | |
| Spring Security | 7.1.0 | |
| Servidor embutido | Tomcat 11.0.x ou Jetty 12.1.x | Não usado no IT.MK desktop se não houver API web |

- Fonte: spring.io/projects, docs.spring.io/spring-boot/system-requirements, endoflife.date/spring-boot.
- Decisão: **Spring Boot 4.1.x** (mais novo, suporte até 31/07/2027 aberto). Quando o 4.2 sair, planejar a troca (não pesquisado).
- Spring Data JPA: versão e detalhes **não lidos** nesta consulta.

---

## 3. Arquitetura sugerida (para o dono entender)

Duas formas de montar. Esta decisão é do time técnico, mas o dono precisa saber a diferença porque muda custo e segurança:

| | A) Aplicativo conecta direto no banco | B) Aplicativo fala com um servidor Spring |
|---|---|---|
| Como é | JavaFX + Spring dentro do mesmo programa no computador do usuário | JavaFX só mostra telas; um servidor Spring (na nuvem) faz as regras e fala com o Supabase |
| Segurança | Pior: a senha do banco vai no computador de cada usuário | Melhor: segredos ficam só no servidor |
| Robô de cobrança/agendamentos | Só roda com o programa aberto | Roda sempre (24h) |
| Esforço | Menor | Maior (dois programas) |

**Recomendação do manual (a confirmar):** B, porque o sistema cobra clientes e tem robô (cobranças automáticas, WhatsApp, Pix). Isso casa com `@Scheduled` do Spring (seção 10.4), que precisa de um programa sempre ligado. Esta recomendação é do autor deste manual, não de uma fonte oficial.

---

## 4. Estrutura de um projeto JavaFX + Spring

- Um projeto Maven (ou Gradle) com módulos: `ui` (JavaFX), `servidor` (Spring), `comum` (modelos).
- Pastas da tela: `src/main/resources/fxml` (telas), `.../css` (estilos), `.../i18n` (textos), `.../fontes` (fontes), `.../icones`.
- Um arquivo CSS só de cores e medidas (`tokens.css` do JavaFX, seção 6.2) e outros por tela, como no protótipo.
- Telas desenhadas no **Scene Builder** (editor visual de FXML). Versão atual: **não confirmada**.
- Plugin Maven para rodar: `javafx-maven-plugin`, versão **0.0.8** lida no GitHub do openjfx (objetivos `javafx:run` e `javafx:jlink`). A versão pode ter mudado: conferir no Maven Central.
- Guia oficial de início: openjfx.io/openjfx-docs (a página lida só trouxe o índice: Maven, Gradle, modular e não modular; detalhes **não confirmados**).

---

## 5. Layout em JavaFX (a regra máxima do projeto)

### 5.1 Como o JavaFX calcula o tamanho (fonte: javadoc `javafx.scene.layout`)
- Cada bloco redimensionável (Region, Control) tem tamanho **mínimo, preferido e máximo**. O painel pai decide o tamanho final dentro dessa faixa.
- Quando algo muda, o JavaFX marca o trecho e recalcula de cima para baixo no próximo quadro.
- Formas (Shape), `Group` e `Text` **não** são redimensionados pelo pai. Evitar `Group` para layout.
- Truques: `setMaxSize(Region.USE_PREF_SIZE, ...)` trava o máximo no preferido; `Region.USE_COMPUTED_SIZE` volta ao cálculo normal.
- Mexer na tela de fora da linha da tela é proibido depois que ela está visível (seção 9).

### 5.2 Painéis e para que servem
| Painel | Uso no IT.MK | Cuidado |
|---|---|---|
| **BorderPane** | Estrutura da janela: menu à esquerda, conteúdo no centro | O centro ocupa todo o resto automaticamente |
| **HBox / VBox** | Linhas e colunas simples | Usar `HBox.setHgrow(no, Priority.ALWAYS)` para o item esticar |
| **GridPane** | Grades de cartões e formulários | `ColumnConstraints` com `percentWidth` ou `hgrow`; **não quebra linha sozinho** |
| **FlowPane** | Chips e cartões que "quebram linha" como `flex-wrap` | Os itens mantêm tamanho próprio, podem sobrar espaço no fim da linha |
| **TilePane** | Cartões todos do mesmo tamanho | Cada "azulejo" tem o mesmo tamanho: pode deixar vazio quando os blocos são diferentes |
| **StackPane** | Camadas: gaveta e modal por cima do conteúdo, selo sobre cartão | Os filhos se sobrepõem |
| **AnchorPane** | Poucos casos (gaveta fixa à direita) | Evitar para o conteúdo principal |
| **ScrollPane** | Rolagem vertical da tela | Ver 5.3 |
| **SplitPane** | Tela de conversas (lista + conversa), se quiser divisor | |

### 5.3 Rolagem: só vertical, nunca horizontal
Regra do projeto: nenhuma barra de rolagem horizontal em largura nenhuma.
- Todo conteúdo de tela entra num `ScrollPane` com `setFitToWidth(true)` e política horizontal `ScrollBarPolicy.NEVER`. Assim o conteúdo acompanha a largura da janela e só rola para baixo. (Propriedades `fitToWidth` e `hbarPolicy`: nomes do ScrollPane, **não lidos** nesta consulta, confirmar no javadoc.)
- Se algo for mais largo que a janela, o JavaFX **não** corta nem quebra sozinho: ele ou empurra ou trunca. Por isso cada painel precisa de largura mínima pequena (`setMinWidth(0)`), parecido com o `minmax(0,1fr)` do protótipo.
- Texto longo: `Label.setWrapText(true)` e largura máxima ligada ao pai. Sem isso o texto vira "…" (cortado). Isso fere a regra 3 do projeto.
- Tabelas: ver seção 7.1.

### 5.4 Preencher a largura e não deixar espaço vazio
- Sem limite de largura máxima: não definir `maxWidth` fixo. Usar `Double.MAX_VALUE` nos blocos que devem esticar.
- Em `GridPane`: dar a cada coluna `percentWidth` (somando 100) ou `hgrow=ALWAYS`; em cada filho `fillWidth=true` (padrão é true).
- Em `FlowPane`: se os cartões devem preencher a linha, é preciso calcular a largura de cada um em código (largura da linha dividida pelo número de colunas que cabem). O `FlowPane` sozinho **deixa sobra** no fim da linha.
- "Blocos de tamanhos diferentes se encaixam sem buracos" (estilo mosaico): **não existe painel pronto**. As saídas: (a) `GridPane` com `rowSpan/colSpan` e planejamento fixo por largura; (b) código próprio. Marcar como limite: o mosaico automático do protótipo não tem equivalente direto.

### 5.5 Equivalente ao "grid de colunas automáticas" do protótipo
O protótipo usa colunas que mudam com a largura. Em JavaFX:
1. Observar `widthProperty()` do painel.
2. Calcular número de colunas = `max(1, floor(largura / larguraMinimaDoCartão))`.
3. Reorganizar os filhos no `GridPane` (ou ajustar `prefTileWidth` do `TilePane`).
4. Fazer isso num componente reutilizável, ex.: `GradeResponsiva`, usado em todas as telas (evita código repetido).

### 5.6 Equivalente a `@media` e `@container`
- **Janela inteira (`@media`)**: no **JavaFX 27**, o CSS aceita `@media` (fonte: cssref do JavaFX 27). Funções lidas: `width`, `height`, `aspect-ratio`, `orientation`, `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-reduced-data`, `prefers-reduced-transparency`, `-fx-platform`, entre outras. `width` e `height` se referem ao **Scene** (a cena), não a um bloco. Exemplo da própria página:
  `@media (width > 600px) { ... }` e `@media (prefers-color-scheme: dark) and (prefers-reduced-motion) { ... }`.
  Também há `@import` condicional (nota de versão 27). No JavaFX 25 e 26 isso **não existe**.
- **Bloco (`@container`)**: **não há equivalente em CSS.** Faz-se em código: um "observador de largura" no bloco que liga/desliga uma classe de estilo ou uma pseudo-classe (`PseudoClass.getPseudoClass("estreito")`) conforme a largura. O CSS então usa `.cartao:estreito { ... }`. Padrão confiável, mas manual. Marcar na história de Frontend.
- Pontos de quebra do protótipo (720px, 860px, 980px, 1300px) passam a ser constantes num lugar só.

### 5.7 Tamanho mínimo da janela
Definir `stage.setMinWidth/Height` para a janela nunca ficar menor que o menor layout previsto. O protótipo vai até celular; um programa de computador não precisa ter largura de celular. **Decisão do dono**: o JavaFX desktop precisa mesmo caber em largura de celular? Se for versão celular, o JavaFX só é indicado via Gluon Mobile (**não pesquisado**). Se for só computador/tablet Windows, a regra "celular" do protótipo fica fora do escopo. Perguntar ao dono.

---

## 6. CSS do JavaFX

Fonte: Guia de referência de CSS (openjfx.io/javadoc/26 e /27 `cssref.html`).

### 6.1 O que muda em relação ao CSS da web
- Propriedades começam com `-fx-`: `-fx-background-color`, `-fx-padding`, `-fx-font-size`, `-fx-border-radius`, `-fx-effect`.
- Seletores: classe (`.cartao`), id (`#menu`), tipo (`.button`), pseudo-classes (`:hover`, `:pressed`, `:focused`, `:disabled`, `:selected`, `:first-child`, `:last-child`).
- **Não existe**: `var(--x)` do CSS moderno, `calc()`, `grid`, `flex`, `transition`, `animation`, `::before/::after`, `position`, `text-align: justify`, `gap` fora de painéis. (Lista da página + experiência; item a item, **não confirmado** exceto "sem calc e sem variáveis além das cores nomeadas", dito na própria página.)
- Modelo de cor é HSB, não HSL.
- Não se mistura forma curta e longa na mesma regra.

### 6.2 Variáveis de cor ("looked-up colors"): a ponte com `tokens.css`
JavaFX permite dar nome a uma cor e usar em qualquer filho:
```css
.root {
    verde-marca: #026842;
    tinta: #003817;
    pagina: #F1F6F3;
    borda: #DFE8E3;
}
.cartao { -fx-background-color: pagina; -fx-border-color: borda; }
```
- A cor nomeada vale para o nó e todos os filhos dele. Trocar no `.root` troca no app inteiro (é assim que se faz tema claro/escuro).
- **Só cores** podem ser nomeadas. Medidas (raios 12/10/8/6, espaços, durações) **não têm variável**: ficam repetidas no CSS ou em constantes Java. Isso foge da regra "só um arquivo define cores e medidas". Solução prática: manter um `tokens.css` para cores e uma classe Java `Medidas` para o resto, ambos gerados/conferidos a partir do `tokens.css` do protótipo. Marcar como limite.
- O nome de cor pode referir outro (`-fx-base`, derivadas com `derive(cor, 25%)` e `ladder(...)`), exemplos da página.

### 6.3 Mapa dos tokens do protótipo para JavaFX
| Protótipo (tokens.css) | JavaFX |
|---|---|
| `--verde-marca`, `--tinta`, `--pagina`, `--cartao`, `--borda`... | cores nomeadas no `.root` |
| `--raio-cartao:12px` | `-fx-background-radius: 12; -fx-border-radius: 12;` (valor repetido) |
| `--grad-marca` (degradê) | `-fx-background-color: linear-gradient(from 0% 0% to 0% 100%, #0A8A5C 0%, #026842 100%);` (sintaxe de gradiente é do CSS do JavaFX; **exemplo não lido literalmente**, conferir na cssref) |
| `--sombra-2` (2 camadas) | `-fx-effect: dropshadow(gaussian, rgba(0,56,23,0.07), 16, 0, 0, 6);` (**só uma sombra por nó**; ver 6.4) |
| `--sombra-interna` | `-fx-effect: innershadow(...)` (efeito InnerShadow) |
| `--f-display`, `--f-corpo`, `--f-maquina` | Fontes empacotadas no app e carregadas por `Font.loadFont` (**não confirmado**: licença das fontes e carregamento) |
| `--t-rapido: 160ms` | Duração em código (`Duration.millis(160)`) |
| `--anel-foco` | Pseudo-classe `:focused` com `-fx-border-color` / `-fx-effect` |
| `--desfoque` (blur do vidro) | Sem equivalente direto de "blur do fundo" (backdrop-filter). Só dá para borrar o próprio nó (`GaussianBlur`) |
| `rgba(255,255,255,.14)` | `rgba(255,255,255,0.14)` funciona |

### 6.4 Sombras e efeitos
- Sintaxe da cssref: `-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.5), 15, 0.5, 5, 5);` (tipo de desfoque, cor, raio, espalhamento, deslocamento X, Y).
- Efeitos no Java (`javafx.scene.effect`): `DropShadow`, `InnerShadow`, `Glow`, `Bloom`, `BoxBlur`, `GaussianBlur`. Podem ser encadeados pela propriedade `input`.
- **Limite 1:** o protótipo empilha duas sombras (`--sombra-1` e `--relevo` juntos). No JavaFX, `-fx-effect` aceita um efeito; para dois é preciso encadear em código (DropShadow com `input` InnerShadow) ou usar camadas extras. Aceitar uma sombra só por cartão onde der.
- **Limite 2:** custo de desempenho de efeitos em muitos nós: a página dos efeitos não traz nada sobre isso (**não confirmado**). Regra prática: efeitos só em cartões visíveis; evitar sombra em cada linha de tabela.
- **Limite 3:** sombra "cresce ao passar o mouse" (`:hover`): troca de `-fx-effect` em `:hover` funciona, mas **sem transição suave** (seção 6.5).

### 6.5 Transições e movimento
- O CSS do JavaFX **não tem `transition`**. Movimento é feito por código com a API de animação (`javafx.animation`): `Timeline`, `KeyFrame`, `KeyValue`, `FadeTransition`, `TranslateTransition`, `ParallelTransition`, `Interpolator`, `AnimationTimer` (javadoc lido).
- Curva `cubic-bezier(.22,.61,.36,1)` do protótipo: usar `Interpolator.SPLINE(0.22, 0.61, 0.36, 1)`. (Existência do SPLINE: conhecimento geral, **não lido** nesta consulta.)
- JavaFX 26 trouxe funções de suavização lineares por trechos (piecewise linear easing).
- **Movimento reduzido**: JavaFX 27 passou a respeitar a preferência do sistema nas animações e oferece `prefers-reduced-motion` no CSS. O protótipo já respeita (`prefers-reduced-motion`). Em 25/26: ler a preferência em código (**não confirmado** como).
- Regra do projeto: durações 160/200/240 ms são constantes num único lugar.

### 6.6 Temas
- Tema = arquivo `.css` carregado em `scene.getStylesheets()`. Trocar de tema = trocar a lista de arquivos ou o bloco de cores do `.root`.
- JavaFX 27: `@media (prefers-color-scheme: dark)` no CSS liga o escuro automaticamente. Antes do 27: ler a preferência por código.
- O protótipo só tem tema claro. **Visão única**: não criar tema por perfil.
- Cuidado: `node.setStyle("...")` (estilo direto) **sobrepõe** os arquivos CSS (javadoc de Node). Usar só para valores calculados; cores e medidas ficam no CSS.
- Folha padrão (Modena) do JavaFX vem como base. Para restilizar tudo, definir `-fx-base`/`-fx-accent` ou partir de `-fx-background-color` próprio. Bibliotecas de tema (ex.: AtlantaFX 3.0.0, citada em foojay setembro/2026): **não avaliadas**.

---

## 7. Controles

### 7.1 TableView e TreeTableView (colunas proporcionais)
O protótipo tem tabelas que ocupam a largura toda e viram cartões em tela estreita.
- `TableView` mostra só as linhas visíveis (virtualização) e aguenta muitas linhas. Dados vêm de `ObservableList` (`setItems`), a tabela se atualiza sozinha.
- `setFixedCellSize(altura)` melhora o desempenho quando todas as linhas têm a mesma altura. Linha com texto que quebra (altura variável) perde isso.
- `setPlaceholder(no)` = mensagem de "vazio".
- **Políticas de largura (JavaFX 27):** a antiga `CONSTRAINED_RESIZE_POLICY` está **marcada como obsoleta** e foi substituída por `UNCONSTRAINED_RESIZE_POLICY` e as variantes `CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN`, `..._FLEX_NEXT_COLUMN`, `..._ALL_COLUMNS`, `..._LAST_COLUMN`, `..._SUBSEQUENT_COLUMNS`. Para "encher a largura sem barra horizontal", a família "constrained" é a indicada.
- **Colunas proporcionais:** a página `TableColumnBase` (JavaFX 27) **não tem porcentagem de largura**; só `minWidth`, `prefWidth`, `maxWidth` e `resizable`. Padrão da comunidade (**não está na doc oficial**): ligar `prefWidth` da coluna à largura da tabela multiplicada por uma fração (`tabela.widthProperty().multiply(0.25)`). Não ligar `width` (a doc avisa que atrapalha o arrastar do usuário).
- **Texto longo na célula:** a célula padrão não quebra linha. É preciso uma `TableCell` própria com `Label` e `setWrapText(true)`; a altura da linha então varia. Custo: desempenho. Limite real.
- **Tabela que vira cartões em tela estreita** (container query do protótipo): não existe. Duas saídas: (a) duas visões (TableView e uma `ListView` de cartões) e alternar por largura (padrão 5.6); (b) uma só `ListView` com célula que muda de aparência. O manual recomenda (a) para tabelas grandes.
- `TreeTableView`: para dados em árvore (ex.: pagador, lojas, títulos). Mesma regra de colunas. Detalhes de API **não lidos**.
- Formatação de R$ e datas na célula: seção 13.

### 7.2 ListView
- Também virtualizada. Serve para filas (fila de cobrança) e para a lista de conversas. Célula própria (`setCellFactory`) para o visual de cartão.
- Detalhes da API: **não lidos nesta consulta**.

### 7.3 TabPane (abas)
- `TabPane` tem abas com conteúdo. Para abas "chip" do protótipo (`.cv-tab`, `.chip-f`), usar `ToggleButton` num `ToggleGroup` dentro de `FlowPane`, ou estilizar a `TabPane` por CSS (`.tab-pane > .tab-header-area > ...`). Estilo exato: **não confirmado**.
- Abas que quebram de linha (como o `flex-wrap` do protótipo): `TabPane` **não quebra**; com muitas abas ele cria menu de "mais". Para quebra de linha, usar `FlowPane` de `ToggleButton`.

### 7.4 Dialog (modais)
- `Dialog` é modal por padrão (`Modality.APPLICATION_MODAL`); `initOwner(janela)` o prende à janela principal; `showAndWait()` espera e devolve `Optional`. `Alert` é o diálogo pronto. Estilo por `getDialogPane().getStylesheets()`.
- Regra: usar `Dialog` para confirmar ações (apagar, enviar cobrança). O "escurecer o fundo" do protótipo (`--veu-cor`) **não vem pronto**: fazer com um `StackPane` por cima do conteúdo (modal "interno") ou aceitar a janela nativa. Escolher uma forma e padronizar.
- Modal interno (no próprio `StackPane`) permite animação e tema iguais ao protótipo; o `Dialog` nativo é mais simples e acessível.

### 7.5 ContextMenu
- Menu do botão direito/de "mais ações". API: **não lida nesta consulta**. Regra: nenhuma ação importante só no menu de contexto (acessibilidade e descoberta).

### 7.6 Menu lateral recolhível
- `BorderPane` com `left` = `VBox` de botões (`ToggleButton` ou `Button`) com ícone + texto.
- Recolher: animar a largura preferida (de 252 para 68) com `Timeline` e esconder o texto (`setVisible(false)` e `setManaged(false)`, ou só o ícone via `ContentDisplay.GRAPHIC_ONLY`).
- Limite: o ícone `lucide` do protótipo é SVG da web. Em JavaFX, usar `SVGPath` (aceita caminho SVG via `-fx-shape`, citado na cssref) ou biblioteca de ícones (ex.: Ikonli, **não avaliada**).
- Menu de rodapé no celular: ver 5.7.

### 7.7 Gaveta lateral (drawer)
- Um painel dentro de `StackPane`, alinhado à direita, com `TranslateTransition` para entrar e sair, e um véu atrás. Não há controle pronto.
- Largura = `min(520, largura da janela)`: ligar `prefWidth` à largura da cena.
- Foco: ao abrir, mover o foco para dentro; ao fechar, devolver (seção 14).

### 7.8 Cartões, chips de situação e gráfico
- **Cartão com sombra:** `VBox` com classe `.cartao` (fundo, raio, `-fx-effect`).
- **Chip de situação:** `Label` com classes `.chip` e `.chip-atencao`, `.chip-travado`, `.chip-curso`, `.chip-cancelado` (cores dos tokens). Não depender só da cor: incluir texto (já é assim no protótipo).
- **Barra de progresso simples** (`.barra`): `ProgressBar` ou dois `Region` (fundo e preenchimento) com largura proporcional.
- **Gráfico de barras:** `BarChart` (pacote `javafx.scene.chart`) com `CategoryAxis` e `NumberAxis`. Estilo por CSS (`.default-color0.chart-bar`). Limite: o `BarChart` é bem diferente do SVG do protótipo (eixos, legenda e espaçamentos próprios); para igualdade visual, desenhar com `Rectangle` ou `Canvas`. Observação da versão 26: foram corrigidos vazamentos de memória em `XYChart`. API detalhada: **não lida**.
- **Filtro único:** uma `HBox`/`FlowPane` com `TextField` (busca) e `ComboBox`/`ChoiceBox` (plataforma, situação, responsável). Filtrar com `FilteredList` e `SortedList` ligados ao `TableView` (padrão do JavaFX; classes **não lidas** nesta consulta, mas são do `javafx.collections`). Ligar o filtro ao `TextField` por `textProperty()`. Normalizar acentos como o protótipo (`normalize('NFD')` equivale a `java.text.Normalizer`).

### 7.9 Texto justificado e hifenização
- O protótipo justifica parágrafos e hifeniza em português. JavaFX **não justifica** `Label` e **não hifeniza**. Alinhar à esquerda. Registrar como diferença aceita. (Conclusão do autor; **não confirmado** em página oficial.)

---

## 8. Spring Boot + JavaFX: como juntar

### 8.1 Padrão de inicialização
Duas classes (padrão visto no guia da BellSoft e no blog do Wim Deblauwe; são fontes da comunidade, não oficiais):
```java
@SpringBootApplication
public class Principal {                       // classe Spring
    public static void main(String[] args) {
        Application.launch(AppFx.class, args); // liga o JavaFX
    }
}

public class AppFx extends Application {
    private ConfigurableApplicationContext contexto;

    @Override public void init() {             // fora da linha da tela: cria o Spring
        contexto = new SpringApplicationBuilder(Principal.class)
                .web(WebApplicationType.NONE)
                .headless(false)
                .run();
    }
    @Override public void start(Stage palco) { // linha da tela: monta a janela
        var tela = contexto.getBean(GerenteDeTelas.class);
        tela.abrir(palco);
    }
    @Override public void stop() { contexto.close(); }  // fecha o Spring ao sair
}
```
- Regras do ciclo de vida (javadoc `Application`, lido): `init()` **não** roda na linha da tela e não pode criar `Scene`/`Stage`; `start()` e `stop()` rodam na linha da tela; `launch()` só pode ser chamado uma vez; classe pública com construtor público sem argumentos; `Platform.exit()` é o jeito indicado de encerrar.
- `SpringApplication.setHeadless(false)` (ou `spring.main.headless=false`): sem isso o Spring pode marcar modo "sem tela" (`java.awt.headless`). Propriedade citada na página SpringApplication (existência lida; **efeito exato em JavaFX não confirmado**, é prática comum).
- `spring.main.web-application-type=none` quando não houver servidor web dentro do app (página SpringApplication: `setWebApplicationType(NONE)`).
- Ordem de eventos do Spring (página lida): `ApplicationStartingEvent` ... `ApplicationReadyEvent`. Pode-se usar `ApplicationReadyEvent` para avisar a tela que o Spring terminou.
- Não usar `@SpringBootApplication` na mesma classe que estende `Application` (guia da BellSoft usa duas classes). Motivo: o carregador do JavaFX pode reclamar de falta de módulos quando a classe principal estende `Application` sem `module-path`. **Não confirmado**; manter duas classes por segurança.

### 8.2 Injeção nos controllers (FXML)
- No `FXMLLoader`, usar `setControllerFactory(contexto::getBean)`. Assim o Spring cria cada controller e injeta serviços (padrão de comunidade; o método `setControllerFactory` existe, a página oficial do FXML o cita sem detalhar).
- Controller anotado com `@Component` e escopo `prototype` (novo controller a cada tela aberta), senão o mesmo objeto é reaproveitado.
- Dentro do controller: injeção por **construtor** (não por campo).
- FXML (página oficial lida): `fx:controller` na raiz, `@FXML` em campos privados, `fx:include` para dividir a tela em partes (o controller filho pode ser injetado no pai por `fx:id`), `%chave` para texto traduzido (ResourceBundle).
- Cada tela do protótipo = um FXML + um controller + um CSS.

### 8.3 MVVM e data binding
- JavaFX tem propriedades observáveis (`StringProperty`, `ObjectProperty`, `ObservableList`) e `bind`/`bindBidirectional`. Padrão MVVM: a tela (FXML) só liga nos `Property` do **ViewModel**; regras ficam no ViewModel/serviço.
- `Bindings` (javadoc lido): `createStringBinding`, `format`, `when(...)`. **Aviso oficial:** ligações bidirecionais podem prender memória; chamar `unbindBidirectional` quando a tela fechar.
- Ligação aponta para o objeto por referência fraca: guardar o objeto vivo em campo, senão ele pode ser coletado e a ligação para (comportamento geral; **não confirmado** nesta consulta).
- Biblioteca mvvmFX: **não avaliada** (versão e manutenção não conferidas).
- Regra: nenhum controller conversa direto com o banco. Controller chama ViewModel; ViewModel chama serviço Spring.

---

## 9. Threads: Platform.runLater, Task e Service

- Regra de ouro (javadoc de `Node`, lido): um nó que já está numa janela visível só pode ser mexido na **linha da tela** (JavaFX Application Thread).
- `Task` (javadoc lido): `call()` roda em outra linha. Dentro dele: `updateProgress`, `updateMessage` (seguros e "juntam" atualizações para não entupir). Resultado em `setOnSucceeded` / `setOnFailed` / `setOnCancelled`, que rodam na linha da tela. Cancelar = o código precisa conferir `isCancelled()`.
- `Service` reaproveita `Task` (reiniciável); `Platform.runLater(...)` joga um trecho para a linha da tela (uso só quando não há `Task`).
- Linhas de segundo plano: marcar como **daemon** (`setDaemon(true)`) senão o programa não fecha depois de fechar a janela.
- Receita para o IT.MK: toda chamada ao banco ou API roda num `Task`. Enquanto isso: mostrar carregando e desligar o botão. Ao falhar: mostrar mensagem simples (sem texto técnico).
- Nunca esperar (`get()`, `join()`, `Thread.sleep`) na linha da tela: a janela trava.
- Spring `@Async` (seção 10.4) é para serviços do servidor; no desktop, preferir `Task`. Se um serviço Spring for chamado por `Task`, ele roda na linha do `Task`.
- Transações Spring (`@Transactional`) ficam no serviço, nunca na tela.

---

## 10. Spring: peças que o IT.MK vai usar

### 10.1 Spring Boot (visão geral)
- Starters (conjuntos de dependências), configuração automática, propriedades em `application.yml`, perfis (`dev`, `prod`).
- Segredos: variáveis de ambiente, não arquivo no repositório.
- Encerramento limpo: o Spring registra um gancho de desligamento; em JavaFX fechar o contexto no `stop()`.

### 10.2 Dados: Spring Data JDBC e JPA
- Spring Data JDBC (referência 4.1.1, lida): trabalha com **agregados** (um objeto raiz com seus filhos), **não tem carregamento preguiçoso** (lazy), é mais próximo do SQL, tem `@Table`, `@Id`, `@Query`, `@Modifying`, `@Transactional`, PostgreSQL suportado, auditoria e eventos.
- Spring Data JPA (Hibernate): ORM completo com lazy. Detalhes **não lidos** nesta consulta.
- Sugestão: **Spring Data JDBC** para telas simples e `JdbcClient` (cliente fluente, página SQL do Boot) para consultas de relatório (somas por mês, ranking, fila). SQL escrito à mão, fácil de revisar. JPA só se o time já tiver experiência. (Sugestão do autor.)
- Pool: HikariCP é o padrão do Boot (`spring-boot-starter-jdbc`).
- Migrações de banco: Flyway ou Liquibase são aceitos pelo Boot (página lida). Qual usar e como conviver com as migrações do Supabase: **decisão pendente**.
- Dinheiro: sempre `BigDecimal` e coluna `numeric` (seção 13).

### 10.3 Conexão com o Supabase
Fonte: docs oficiais do Supabase (lida).
| Forma | Porta | Comandos preparados | Quando usar |
|---|---|---|---|
| Direta | 5432 | sim | Programa que fica ligado (servidor). Por padrão é IPv6; IPv4 só com complemento pago |
| Session pooler (compartilhado) | 5432 | sim | Redes só com IPv4 e ferramentas de terceiros |
| Transaction pooler (compartilhado) | 6543 | **não** | Funções curtas (serverless) |
| Pooler dedicado | 6543 | não | Só plano pago |
- Para um servidor Spring sempre ligado: conexão **direta**; se a rede não tiver IPv6, **session pooler**. Evitar a transaction pooler (ou desligar comandos preparados no driver). Número exato da propriedade do driver PostgreSQL para isso: **não confirmado**.
- Exigir SSL.
- Políticas de acesso (RLS) e papéis do Supabase: outro manual (banco). Aqui: o servidor Spring usa um usuário de banco com o mínimo de permissão, não o "dono" do banco.

### 10.4 Agendamento (robô de cobrança)
Fonte: Spring Framework, "Task Execution and Scheduling" (lida).
- `@EnableScheduling` + `@Scheduled`. Formas: `fixedDelay` (espera depois de terminar), `fixedRate` (a cada intervalo), `cron` (6 campos: segundo minuto hora dia mês dia-da-semana) e `zone` para o fuso.
- **Fuso:** usar `zone = "America/Sao_Paulo"` em toda tarefa por horário (cobrança às 9h é 9h de Brasília).
- Exemplo da página: `0 0 9-17 * * MON-FRI` = de hora em hora, das 9h às 17h, em dia útil.
- Cuidado: tarefas podem **sobrepor** (rodar de novo antes de terminar), em especial com mais de um gatilho. Para cobrança, isso pode **enviar mensagem em dobro**. Regra: marcar a cobrança como "em envio" no banco antes de enviar (idempotência).
- Vários servidores ligados ao mesmo tempo rodam a mesma tarefa em todos. A página do Spring **não trata disso** (cita nada de ShedLock). Se houver mais de um servidor, é preciso uma trava (ex.: trava no próprio Postgres). Biblioteca ShedLock: **não avaliada**.
- `@Async` + `@EnableAsync` para tirar trabalho da linha principal; executor com linhas virtuais (Java 21+) disponível (`SimpleAsyncTaskExecutor` com `setVirtualThreads(true)`, ou `spring.threads.virtual.enabled=true`, página SpringApplication).
- Feriados e dia útil: o `cron` não sabe. Calcular em código (regra de negócio).

### 10.5 Chamar APIs externas: RestClient e WebClient
Fonte: Spring Framework 7.0.9, "REST Clients" (lida).
- **RestClient** é o cliente síncrono recomendado. **WebClient** é o reativo (só se precisar). **RestTemplate está marcado como obsoleto no Spring 7** e será removido: não usar em código novo.
- Uso: `restClient.get().uri(...).retrieve().body(Classe.class)`; tratar erros com `onStatus(...)` ou `defaultStatusHandler(...)`.
- **Tempos limite (timeout):** configurados na fábrica de requisição (ex.: `setConnectTimeout(Duration.ofSeconds(5))`, `setReadTimeout(...)`). **Sem isso, uma API lenta (marketplace, WhatsApp, banco) trava o robô.** Regra obrigatória.
- Clientes por interface: `@HttpExchange` + `HttpServiceProxyFactory`, limpam o código de cada integração (Mercado Livre, Shopee, Asaas, etc.).
- Repetição de chamada (retry), limite de requisições e regras específicas de cada API: **fora desta consulta**.
- Chamada de API vinda da tela: sempre via `Task` (seção 9).

### 10.6 Spring Security
Fonte: Spring Boot, "Spring Security" (lida) e spring.io (versão 7.1.0).
- A configuração automática do Boot é pensada para **aplicação web**. Em aplicação **não web** (desktop) a página diz que precisa configuração manual (usar as APIs principais).
- Num servidor web: bean `SecurityFilterChain`; senha com `PasswordEncoder` (nunca guardar senha pura); `@EnableMethodSecurity` com `@PreAuthorize` para proteger métodos.
- **Atenção:** o exemplo de código da página lida usa `authorizeRequests()` e `antMatchers`, que são estilo antigo. O estilo atual é `authorizeHttpRequests` com `requestMatchers`. **Não confirmado** nesta consulta; conferir no guia do Spring Security 7 antes de copiar.
- **Visão única do projeto:** não existem perfis (diretor/colaborador). Segurança aqui é só "quem pode entrar" (login) e proteção de segredos, não "quem vê o quê". Não criar papéis.
- Login: senha com hash (BCrypt ou o padrão do Spring Security; detalhe **não lido**), bloqueio após tentativas, sessão com prazo. Armazenar o token no sistema operacional (cofre do Windows), não em arquivo aberto. Como fazer isso em Java: **não pesquisado**.

### 10.7 Testes do Spring Boot
Fonte: Spring Boot 4.1.1, "Testing" (lida).
- `spring-boot-starter-test` traz JUnit Jupiter, AssertJ, Hamcrest.
- `@SpringBootTest` (contexto completo) e fatias: `@DataJdbcTest`, `@WebMvcTest`, `@RestClientTest`.
- **No Boot 4, `@MockitoBean` substitui `@MockBean`.** Código antigo com `@MockBean` não vale.
- **Testcontainers** com `@ServiceConnection`: sobe um PostgreSQL de verdade num contêiner para o teste. Preferir ao banco em memória (H2) porque o Supabase é Postgres e o SQL pode diferir. Exige Docker na máquina de teste/CI (**não confirmado** o requisito exato).
- Teste de regra de cobrança (juros, multa, vencimento): teste de unidade puro, sem Spring, com datas fixas (`Clock` injetado).

---

## 11. Padrões do protótipo: como se faz em JavaFX e o limite

| Padrão do protótipo | Como fazer em JavaFX | Limite / sem equivalente direto |
|---|---|---|
| Menu lateral recolhível | `BorderPane.left` + `VBox`; animar `prefWidth` 252 para 68 com `Timeline`; só ícone ao recolher | Ícones SVG precisam virar `SVGPath`; no celular o protótipo vira barra inferior: só com troca de layout por código |
| Abas | `ToggleButton` + `ToggleGroup` em `FlowPane`, ou `TabPane` estilizado | `TabPane` não quebra linha; estilo por CSS exige conhecer os nomes internos (**não confirmado**) |
| Cartões com sombra | `VBox` + classe CSS + `-fx-effect: dropshadow(...)` | Uma sombra por nó; relevo duplo (sombra + brilho) exige efeito encadeado |
| Salto ao passar o mouse (`translateY(-2px)`) | `:hover` + `TranslateTransition` em código | CSS não anima; sem transição por CSS |
| Tabelas que viram cartões no celular | Duas visões (`TableView` e lista de cartões) trocadas por largura | Não existe `@container`; troca é por código (seção 5.6) |
| Gaveta lateral | `StackPane` + painel à direita + `TranslateTransition` + véu | Sem controle pronto; cuidar do foco |
| Modais | `Dialog`/`Alert` nativos ou painel interno no `StackPane` | Escurecer o fundo só no painel interno |
| Chips de situação | `Label` com classes `.chip-*` (cores dos tokens) | Nenhum |
| Gráfico de barras | `BarChart` ou desenho em `Canvas`/`Rectangle` | `BarChart` não é igual ao SVG; igualdade exata pede desenho próprio |
| Filtro único | `TextField` + `ComboBox` + `FilteredList` | Nenhum |
| Degradês | `linear-gradient(...)` no CSS do JavaFX | Sintaxe própria; testar cada um |
| Blur de fundo (vidro) | Só `GaussianBlur` no próprio nó | `backdrop-filter` não existe |
| Texto justificado + hifenização | Não há | Alinhar à esquerda (diferença aceita) |
| `text-wrap: balance/pretty` | Não há | Não há |
| Barra de rolagem fina e colorida | CSS dos `.scroll-bar` | Estilo por nomes internos (**não confirmado**) |
| Fontes Bricolage, Public Sans, IBM Plex Mono | Empacotar os arquivos de fonte e carregar por código | Licença/tamanho: **não confirmado**; fonte da web (Google Fonts) não é usada pelo JavaFX |
| Entrada animada de tela (`sobe`) | `FadeTransition` + `TranslateTransition` por filho | Atraso em escada = `PauseTransition` por filho |
| Sticky (menu fixo, cabeçalho fixo) | Painel fora do `ScrollPane` | `position: sticky` não existe |
| Foco visível (`:focus-visible`) | `:focused` no CSS | JavaFX não separa foco por teclado e mouse (**não confirmado**) |

---

## 12. Empacotamento e distribuição

### 12.1 jlink (runtime enxuto)
Fonte: manual do `jlink` do Java 25 (lido).
- Monta um Java mínimo só com os módulos que o app usa (`--add-modules`, `--module-path`), com `--strip-debug`, `--compress`, `--no-header-files`, `--no-man-pages`.
- `jlink` trabalha com **módulos explícitos**. Aplicativo Spring Boot usa muitas bibliotecas "sem módulo" (automáticas): o `jlink` direto costuma falhar. O `jpackage` com JAR comum (não modular) é o caminho mais simples. (Conclusão a partir da página lida; **não confirmado** como tratar caso a caso.)

### 12.2 jpackage (instalador)
Fonte: guia do `jpackage` do Java 25 (lido).
- Gera instalador nativo sem exigir Java instalado: **Windows `.exe` e `.msi`** (precisa do **WiX 3.0 ou mais novo**), macOS `.pkg`/`.dmg`, Linux `.deb`/`.rpm`.
- Por padrão ele mesmo usa o `jlink` para criar o runtime. Opções úteis: `--type app-image` (só testar sem instalador), `--runtime-image`, `--icon`, `--win-menu`, `--win-shortcut`, `--win-upgrade-uuid` (para atualizações MSI funcionarem), `--add-modules`, `--mac-sign`.
- **Limite oficial:** o pacote precisa ser gerado **no próprio sistema** de destino (Windows para Windows). Sem compilação cruzada. Para entregar a Windows: máquina Windows ou CI com Windows.
- Atualização automática do aplicativo (auto-update): **o jpackage não faz**. Não pesquisado o que usar (ex.: Conveyor, JPackage + serviço próprio): **lacuna**.
- Assinatura do instalador do Windows (para não aparecer aviso de "editor desconhecido"): **não pesquisado**.
- Plugin Maven do OpenJFX tem o objetivo `javafx:jlink` (opções `launcher`, `jlinkImageName`, `jlinkZipName`); para Spring Boot, o plugin do Boot (`spring-boot-maven-plugin`, que gera JAR executável) mais `jpackage`. Combinação: **não confirmada** nesta consulta.
- Imagens nativas (GraalVM): Boot 4.1 cita GraalVM Community 25 e Native Build Tools 1.1.8 (página lida). JavaFX com GraalVM exige bibliotecas extras da Gluon: **não pesquisado**; não recomendado para começar.

---

## 13. Idioma, moeda e datas (pt-BR)

- **Textos:** arquivos `ResourceBundle` (`mensagens_pt_BR.properties`) e `%chave` no FXML (página FXML lida). Todas as frases da tela ficam nesses arquivos, nunca dentro do código.
- **Locale:** `Locale.forLanguageTag("pt-BR")` em tudo (formato de número, data, ordenação).
- **Moeda:** `NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR"))` mostra `R$ 1.000,50`. Detalhes da página (lida):
  - O espaço entre `R$` e o número é um espaço **que não quebra** (não é o espaço comum). Cuidado em comparações de texto em testes.
  - `NumberFormat` **não é seguro entre linhas** (thread). Criar uma instância por uso ou por linha, nunca uma estática compartilhada.
  - Com `BigDecimal` pode haver perda de precisão no `NumberFormat`; a página sugere `DecimalFormat` para precisão. Cálculos sempre em `BigDecimal` (com `RoundingMode.HALF_EVEN` ou a regra de arredondamento que o dono definir). Regra de arredondamento do IT.MK: **a definir pelo dono**.
- Datas: `java.time` (`LocalDate`, `ZonedDateTime`) com fuso `America/Sao_Paulo`; formato `dd/MM/yyyy`. Nunca guardar data como texto.
- Campos de valor: o usuário digita `1.234,56`; ler com o mesmo formato e rejeitar texto inválido com mensagem simples.
- `nodeOrientation` (esquerda-direita ou o inverso) existe no JavaFX (javadoc de `Node`), sem necessidade para pt-BR.

---

## 14. Acessibilidade

Fonte: javadoc de `Node` (propriedades lidas). A página de guia de acessibilidade do JavaFX respondeu 404 (**não lida**).
- Propriedades de leitor de tela em todo nó: `accessibleRole`, `accessibleRoleDescription`, `accessibleText`, `accessibleHelp`.
- Regras acionáveis:
  1. Todo botão só com ícone leva `accessibleText` ("Mostrar senha", "Fechar").
  2. Todo campo tem rótulo ligado (`Label.setLabelFor(campo)`; método **não lido**, conferir).
  3. Ordem de Tab igual à ordem visual; foco visível sempre (a cor do foco é do `tokens.css`).
  4. Contraste: usar as combinações texto/fundo do `tokens.css` (as verificações de contraste feitas no protótipo valem); chips com **texto**, não só cor.
  5. Gaveta e modal: ao abrir, foco vai para dentro; Esc fecha; ao fechar, foco volta ao botão que abriu.
  6. Respeitar movimento reduzido (seção 6.5).
- Leitores de tela suportados por sistema (NVDA, JAWS, VoiceOver): **não confirmado** nesta consulta. Testar com NVDA no Windows (a verificar).
- JavaFX 27 melhorou a acessibilidade no macOS (texto estático navegável, links). Para Windows: **não confirmado**.

---

## 15. Testes de interface (TestFX)

Fonte: GitHub do TestFX (lido).
- Versão lida: **4.0.18**. Requisito: Java 8 ou mais; a partir do Java 11 o JavaFX vem à parte (OpenJFX). Compatibilidade exata com JavaFX 25/27: **não confirmada**.
- Com JUnit 5: artefato `testfx-junit5`, `@ExtendWith(ApplicationExtension.class)`, injeção de `FxRobot` nos testes. Verificações com Hamcrest ou AssertJ.
- Sem tela (CI): TestFX documenta o Monocle (`org.testfx:openjfx-monocle`). O JavaFX 26 trouxe plataforma "headless" em protótipo (`-Dglass.platform=headless`), ainda não definitiva. Qual usar no CI: **a decidir**.
- Testes de tela só nos fluxos principais (login, filtro, abrir ficha, cobrança). O resto é teste de ViewModel (sem tela, rápido).
- Teste visual por captura de tela (comparar com o protótipo): **não pesquisado**.

---

## 16. Desempenho

- Tabelas e listas são virtualizadas (só desenham o visível). Evitar `VBox` com milhares de filhos; usar `ListView`/`TableView`.
- `setFixedCellSize` quando a altura é igual (javadoc lido).
- Efeitos (sombra, blur) em muitos nós custam; usar em cartões, não em cada célula (aviso do autor; a doc dos efeitos não trata disso).
- Nunca consulta ao banco na linha da tela (seção 9). Paginar no servidor (`limit/offset` ou por chave) e carregar sob demanda.
- Fechar ligações (`unbind`) ao sair de uma tela (aviso do javadoc de `Bindings`).
- Cache simples de listas fixas (marketplaces, situações).
- Início do app: iniciar o Spring em segundo plano com uma tela de carregamento (`init()` já roda fora da linha da tela). `spring.main.lazy-initialization=true` acelera a partida (página SpringApplication), com o custo de falhar tarde se algo estiver errado: **testar antes de adotar**.
- Medir antes de otimizar. Ferramentas de medição do JavaFX (por exemplo, `-Djavafx.pulseLogger=true`): **não confirmado**.
- Nota JavaFX 27: no macOS o desenho passou de OpenGL para **Metal** (padrão). Sem impacto no Windows.

---

## 17. Checklist de critérios de aceite

### 17.1 Frontend em JavaFX (item "pronto" só se tudo for verdadeiro)
- [ ] Tela feita em FXML + controller + ViewModel; sem regra de negócio no controller.
- [ ] Cores vindas só do `tokens.css` do JavaFX (cores nomeadas); nenhuma cor escrita no código Java ou no FXML.
- [ ] Medidas (raios 12/10/8/6, espaços, durações 160/200/240 ms) iguais às do protótipo.
- [ ] Fontes iguais às do protótipo (display, corpo, máquina) carregadas do pacote do app.
- [ ] **Sem espaço vazio:** conteúdo ocupa toda a largura; nenhum `maxWidth` fixo.
- [ ] **Sem rolagem horizontal** em nenhuma largura de janela (testar do menor tamanho ao 4K).
- [ ] Texto longo quebra linha dentro do espaço (`wrapText`), sem corte com "…" e sem empurrar a tela.
- [ ] Cartões e colunas se distribuem pela largura; sem buracos (ou diferença registrada com aprovação do dono).
- [ ] Tabela: colunas proporcionais; texto que quebra; célula de ação visível sem rolar para o lado.
- [ ] Comportamento em tela estreita igual ao protótipo (tabela vira cartões, menu vira barra, se previsto no escopo).
- [ ] **Visão única:** nenhuma menção a "diretor", "CEO" ou "colaborador"; nenhum modo por perfil; informação não repetida na tela.
- [ ] Carregando, vazio e erro com mensagens simples (sem termo técnico).
- [ ] Nenhuma chamada ao banco/API na linha da tela; botão desligado enquanto processa.
- [ ] Teclado: Tab em ordem, foco visível, Esc fecha gaveta e modal, foco volta.
- [ ] Leitor de tela: botões de ícone com `accessibleText`; campos com rótulo.
- [ ] Respeita movimento reduzido.
- [ ] Textos em `mensagens_pt_BR.properties`; R$ e datas no formato pt-BR.
- [ ] Teste de ViewModel feito; fluxo principal coberto por TestFX quando crítico.
- [ ] Captura da tela comparada com o protótipo; diferenças listadas e aprovadas.
- [ ] Funciona no instalador gerado (não só no IDE).

### 17.2 Backend em Spring
- [ ] Java 25 LTS e Spring Boot 4.1.x (ou a decisão registrada); sem API marcada como obsoleta (ex.: sem `RestTemplate`, sem `@MockBean`).
- [ ] Segredos fora do código e do repositório (variáveis de ambiente/cofre); nunca no aplicativo do usuário.
- [ ] Conexão ao Supabase pela forma certa (direta ou session pooler); SSL ligado; usuário de banco com o mínimo de permissão.
- [ ] Dinheiro em `BigDecimal` / `numeric`; arredondamento definido pelo dono e coberto por teste.
- [ ] Datas com fuso `America/Sao_Paulo`; `Clock` injetado nas regras de prazo.
- [ ] Toda chamada externa com tempo limite de conexão e de leitura; erro tratado com mensagem clara.
- [ ] Tarefas `@Scheduled` com `zone`, sem enviar duas vezes (marcação "em envio" no banco) e com registro (log) de cada rodada.
- [ ] Transação (`@Transactional`) no serviço, nunca na tela.
- [ ] Sem lógica de perfil/nível de acesso; login e proteção do servidor sem "papéis" de negócio.
- [ ] Teste de unidade das regras de cobrança (juros, multa, vencimento, rateio).
- [ ] Teste de integração com PostgreSQL real em contêiner (Testcontainers) nas consultas e migrações.
- [ ] Migração de banco versionada e reversível; aplicada num ambiente de teste antes do real.
- [ ] Logs sem dados pessoais e sem segredos; erros com código de rastreio.
- [ ] Desligamento limpo (`stop()` fecha o contexto; tarefas em andamento terminam).
- [ ] Número de versão de cada biblioteca registrado no projeto (um arquivo só).

---

## 18. Armadilhas

1. **Mexer na tela de outra linha** (erro `Not on FX application thread`). Sempre `Task` + resultado na linha da tela.
2. **Spring sobe dentro do `start()`**: a janela congela. Subir em `init()` ou em segundo plano.
3. **Controller criado pelo FXML sem o Spring**: serviços chegam nulos. Usar `setControllerFactory`.
4. **Controller `@Component` com escopo único (singleton)**: tela reaberta mostra estado antigo. Usar escopo `prototype`.
5. **Texto cortado com "…"** em `Label` sem `wrapText`. Fere a regra 3 de layout.
6. **`GridPane` sem restrições de coluna**: colunas se ajustam ao maior conteúdo e podem passar da largura. Definir `percentWidth` ou `hgrow` e `minWidth(0)`.
7. **`TilePane` e `FlowPane` não fazem mosaico sem buracos**: sobra espaço. Exige código.
8. **Ligar `width` da coluna da tabela**: impede o usuário de arrastar (aviso do javadoc). Ligar `prefWidth`.
9. **`setStyle` espalhado**: sobrepõe o CSS e quebra o tema. Só para valores dinâmicos.
10. **Esperar que o CSS tenha `var()`, `calc()`, `transition`**: não tem. Cores nomeadas sim (só cores).
11. **Sombras em tudo**: custo de desenho. Medir.
12. **Ligações bidirecionais não desfeitas**: vazamento de memória (aviso do javadoc). `unbind` ao fechar a tela.
13. **`NumberFormat` compartilhado entre linhas**: não é seguro (página lida). Criar uma instância por uso.
14. **Espaço não quebrável no `R$ 1.000,50`**: testes de texto falham se comparar com espaço comum.
15. **`Number` como `double` para dinheiro**: erro de centavos. `BigDecimal`.
16. **`@Scheduled` sem `zone`**: roda no fuso do servidor, não no de Brasília.
17. **Tarefa de cobrança que sobrepõe ou roda em dois servidores**: cobrança em dobro. Idempotência e trava.
18. **Transaction pooler do Supabase com comandos preparados**: erro (página lida). Usar direta ou session.
19. **IPv6 por padrão na conexão direta do Supabase**: rede só IPv4 não conecta. Usar session pooler ou o complemento IPv4.
20. **`RestTemplate`, `@MockBean`, `antMatchers`** em exemplos antigos da internet: obsoletos no Spring 7/Boot 4. Conferir a data do exemplo.
21. **`jpackage` não cruza sistemas** (página lida): precisa gerar o instalador no próprio Windows.
22. **`jlink` com bibliotecas sem módulo**: falha. Usar o `jpackage` com JAR comum.
23. **JavaFX 27 exige Java 25**; JavaFX 26 exige 24; JavaFX 25 exige 23. Versão de Java incompatível: o app não abre.
24. **Linux com GTK abaixo de 3.20** não roda JavaFX 25 ou mais (nota de versão 25).
25. **Fontes e ícones da internet**: o protótipo carrega do Google Fonts e do unpkg; o app instalado não deve depender de internet para a interface.
26. **Tela de celular**: JavaFX desktop não é feito para celular. Confirmar o escopo com o dono (seção 5.7).
27. **Exemplo da comunidade tratado como regra oficial.** Os padrões de integração Spring+JavaFX (seção 8) vêm de blogs, não da documentação do Spring ou do OpenJFX.

---

## 19. Perguntas para o dono decidir

1. O aplicativo é só para computador (Windows)? Precisa funcionar em celular?
2. Arquitetura A (tudo no computador) ou B (servidor Spring na nuvem + aplicativo)? Recomendado: B.
3. Começar em JavaFX 25 LTS (estável) ou já no 27 (mais novo, com `@media` no CSS)?
4. Aceita que o texto não seja justificado/hifenizado e que sombras duplas fiquem simplificadas?
5. Regra de arredondamento de valores (juros, multa).
6. Como o aplicativo recebe atualizações (nova versão)? Ponto em aberto (seção 12.2).

---

## 20. Tabela de fontes (consultadas em 01/10/2026)

| Tema | URL oficial | Situação |
|---|---|---|
| Site do OpenJFX | https://openjfx.io/ | Lida (citou JavaFX 27) |
| Destaques JavaFX 25 | https://openjfx.io/highlights/25/ | Lida |
| Destaques JavaFX 26 | https://openjfx.io/highlights/26/ | Lida |
| Destaques JavaFX 27 | https://openjfx.io/highlights/27/ | Lida |
| Notas de versão JavaFX 27 | https://github.com/openjdk/jfx/blob/master/doc-files/release-notes-27.md | Lida |
| Guia de início OpenJFX | https://openjfx.io/openjfx-docs/ | Só índice, sem detalhes |
| Guia de CSS JavaFX 26 | https://openjfx.io/javadoc/26/javafx.graphics/javafx/scene/doc-files/cssref.html | Lida |
| Guia de CSS JavaFX 27 (@media, cores nomeadas) | https://openjfx.io/javadoc/27/javafx.graphics/javafx/scene/doc-files/cssref.html | Lida |
| Javadoc Application | https://openjfx.io/javadoc/27/javafx.graphics/javafx/application/Application.html | Lida |
| Javadoc pacote layout | https://openjfx.io/javadoc/27/javafx.graphics/javafx/scene/layout/package-summary.html | Lida |
| Javadoc GridPane | https://openjfx.io/javadoc/27/javafx.graphics/javafx/scene/layout/GridPane.html | Lida |
| Javadoc TableView | https://openjfx.io/javadoc/27/javafx.controls/javafx/scene/control/TableView.html | Lida |
| Javadoc TableColumnBase | https://openjfx.io/javadoc/27/javafx.controls/javafx/scene/control/TableColumnBase.html | Lida |
| Javadoc Dialog | https://openjfx.io/javadoc/27/javafx.controls/javafx/scene/control/Dialog.html | Lida |
| Javadoc Task | https://openjfx.io/javadoc/27/javafx.graphics/javafx/concurrent/Task.html | Lida |
| Javadoc Node | https://openjfx.io/javadoc/27/javafx.graphics/javafx/scene/Node.html | Lida |
| Javadoc efeitos | https://openjfx.io/javadoc/27/javafx.graphics/javafx/scene/effect/package-summary.html | Lida |
| Javadoc animação | https://openjfx.io/javadoc/27/javafx.graphics/javafx/animation/package-summary.html | Lida |
| Javadoc Bindings | https://openjfx.io/javadoc/27/javafx.base/javafx/beans/binding/Bindings.html | Lida |
| Introdução ao FXML | https://openjfx.io/javadoc/27/javafx.fxml/javafx/fxml/doc-files/introduction_to_fxml.html | Lida |
| Acessibilidade JavaFX | https://openjfx.io/javadoc/27/javafx.graphics/javafx/scene/doc-files/accessibility.html | **Não encontrada (404)** |
| Releases JavaFX (Gluon) | https://gluonhq.com/products/javafx/ | Lida (pode estar defasada: diz 26 como atual) |
| Plugin Maven OpenJFX | https://github.com/openjfx/javafx-maven-plugin | Lida (0.0.8) |
| Roadmap de suporte Java (Oracle) | https://www.oracle.com/java/technologies/java-se-support-roadmap.html | **Erro 403, não lida** |
| Datas de suporte (terceiro) | https://endoflife.date/oracle-jdk | Lida (não oficial) |
| JDK 25 | https://openjdk.org/projects/jdk/25/ | Lida |
| jpackage Java 25 | https://docs.oracle.com/en/java/javase/25/jpackage/packaging-overview.html | Lida |
| jlink Java 25 | https://docs.oracle.com/en/java/javase/25/docs/specs/man/jlink.html | Lida |
| NumberFormat Java 25 | https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html | Lida |
| Spring Boot (projeto) | https://spring.io/projects/spring-boot | Lida (4.1.1) |
| Requisitos do Spring Boot | https://docs.spring.io/spring-boot/system-requirements.html | Lida |
| Suporte do Spring Boot (terceiro) | https://endoflife.date/spring-boot | Lida (não oficial) |
| SpringApplication | https://docs.spring.io/spring-boot/reference/features/spring-application.html | Lida |
| Spring Framework (projeto) | https://spring.io/projects/spring-framework | Lida (7.0.8) |
| Agendamento Spring | https://docs.spring.io/spring-framework/reference/integration/scheduling.html | Lida |
| Clientes REST Spring | https://docs.spring.io/spring-framework/reference/integration/rest-clients.html | Lida (7.0.9) |
| Spring Data JDBC | https://docs.spring.io/spring-data/relational/reference/jdbc.html | Lida (4.1.1) |
| Boot: bancos SQL | https://docs.spring.io/spring-boot/reference/data/sql.html | Lida |
| Boot: Spring Security | https://docs.spring.io/spring-boot/reference/web/spring-security.html | Lida (exemplo desatualizado) |
| Spring Security (projeto) | https://spring.io/projects/spring-security | Lida (7.1.0) |
| Boot: testes | https://docs.spring.io/spring-boot/reference/testing/index.html | Lida |
| Supabase: conexão ao Postgres | https://supabase.com/docs/guides/database/connecting-to-postgres | Lida |
| TestFX | https://github.com/TestFX/TestFX | Lida (4.0.18) |
| Integração Spring Boot + JavaFX (comunidade) | https://bell-sw.com/blog/creating-modern-desktop-apps-with-javafx-and-spring-boot/ | Lida (não oficial) |
| Integração Spring Boot + JavaFX (comunidade) | https://www.wimdeblauwe.com/blog/2017/2017-09-18-using-spring-boot-with-javafx/ | Só trecho da busca (não oficial; 2017) |
| Resumo mensal JavaFX | https://foojay.io/today/javafx-links-of-september-2026/ | Lida (não oficial) |

## 21. Lacunas (o que não foi verificado)
- Oracle roadmap (403) e acessibilidade do JavaFX (404): não lidas.
- Spring Data JPA, Spring Security 7 (exemplo atual), Spring Boot com Flyway/Liquibase, Scene Builder (versão), mvvmFX, AtlantaFX, Ikonli: não lidos.
- JavaFX: ScrollPane (`fitToWidth`), TabPane, ListView, TreeTableView, ContextMenu, BarChart, FilteredList: usados a partir de conhecimento geral, sem página lida nesta consulta.
- CSS: sintaxe exata de degradês, estilo interno de abas e barra de rolagem: conferir na cssref.
- Compatibilidade do TestFX 4.0.18 com JavaFX 25 e 27; Spring Boot com Java 27; JavaFX 27 com Spring Boot 4.1.
- Atualização automática, assinatura do instalador, cofre de senhas no Windows: não pesquisados.
- Números de patch das versões (ex.: 25.0.x): não confirmados; mudam por mês.
