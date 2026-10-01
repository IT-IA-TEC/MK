# Manual de consulta 03: Arquitetura, padrões e código (para o P.O. do IT.MK)

Para quem é: o P.O. que monta planos técnicos das frentes **Backend, Database, Integrações e Frontend**. Segue o modelo da seção 10 de `docs/base-po.md`. Linguagem simples; termo técnico sempre vem com explicação curta.

Como ler as marcas:
- **[BASE]** = está na base de conhecimento (fonte na seção 10, com página).
- **[PROTÓTIPO]** = está desenhado em `prototipo/` (o que o dono aprovou).
- **[LEITURA]** = conclusão deste manual a partir da base (aplicação ao IT.MK). Não é dito pelo livro. Confirmar com o time técnico.
- **[CONFIRMAR]** = conhecimento geral de mercado, **não está na base** e **não foi verificado**.
- **[NÃO COBERTO PELA BASE]** = a base não traz. Buscar na fonte oficial.

Regras do `CLAUDE.md` que valem aqui: visão única (sem perfis), nada redundante, cores e medidas só em `tokens.css`, nenhuma barra de rolagem horizontal, tecnologia final Java + JavaFX + CSS + Spring.

Cobertura desta parte: categorias `arquitetura-de-software`, `padroes-e-design-de-software`, `codigo-limpo`, `linguagens-de-programacao`. Os livros foram lidos pelo índice e pelos capítulos centrais (não linha a linha). O OCR de alguns livros é fraco (Arquitetura Limpa e Refatoração: confiança média 67-70% nas páginas iniciais; Clean Coder: 47% em páginas de abertura). Antes de transformar número, fórmula ou nome em critério de aceite, conferir no original.

---

## 0. Resumo de uma página

1. **Regra mãe** [BASE]: o que muda por motivos de negócio (regras de cobrança) fica no centro; o que é "ferramenta" (tela, banco, Spring, APIs de marketplace, Pix, WhatsApp) fica na borda e **depende** do centro, nunca o contrário. Tudo que a base diz sobre camadas, limites e SOLID são jeitos de cumprir essa regra.
2. **Organize pelo assunto do negócio** (Pagador, Cobrança, Recebimento, Acordo...), não por tipo técnico (controllers, services, repositories). A estrutura de pastas deve "gritar" cobrança, não "Spring" [BASE: Arquitetura Limpa, cap. 21 e 34].
3. **Uma linguagem só** (linguagem ubíqua): o mesmo nome na conversa com o dono, na tela, no código e no banco [BASE: DDD].
4. **Regra de negócio não mora na tela.** No protótipo HTML várias regras estão dentro do JavaScript da tela (ex.: quando a régua pausa, faixas de atraso, cálculo do saldo). Ao refazer em JavaFX, essas regras vão para o domínio Java e ganham teste sem tela e sem banco [PROTÓTIPO + BASE].
5. **Spring é ferramenta, não arquitetura.** A base diz literalmente: não espalhe `@Autowired` nos objetos de negócio; use o Spring para ligar as peças no componente `Main` [BASE: Arquitetura Limpa p. 371].
6. **Teste = critério de aceite que roda sozinho.** "Pronto" significa: todo o código escrito, todos os testes passando, aceito por quem pediu [BASE: Clean Coder cap. 7]. Regra de negócio se testa **sem a tela** (testes pela tela quebram a cada ajuste visual) [BASE: Arquitetura Limpa cap. 28].
7. **Mexer no que já existe**: primeiro cobrir com teste, depois mudar, em passos pequenos; nunca misturar "limpar" com "mudar comportamento" no mesmo passo [BASE: Feathers; Fowler].
8. **Integração com marketplace/Pix/WhatsApp**: o IT.MK escreve a sua própria interface (porta) e traduz a API de fora numa camada anticorrupção; token OAuth tem regras (redirect fixo, `state`, guardar com hash/criptografia) [BASE: DDD; OAuth 2.0].
9. **Começar monolito modular, não microsserviços.** Separar em serviços só quando houver problema real; o custo de serviço é alto [BASE: Arquitetura Limpa, cap. 16 e 27].
10. **JavaFX: a base praticamente não traz nada** (uma menção solta). O que ela traz é o que vale para **qualquer** tela: separar visão burra de apresentador testável (MVC, Presenter, Humble Object). FXML, CSS do JavaFX, binding, MVVM: **[NÃO COBERTO PELA BASE]**.

---

## 1. Mapa: o que a base traz e o que não traz

| Tema | Cobertura | Onde está | Observação |
|---|---|---|---|
| Camadas, limites, regra da dependência, plug-ins | Forte | Arquitetura Limpa (Martin); Princípios de Design (Martin); Intro. arquitetura (Silveira) | Núcleo deste manual |
| SOLID e coesão/acoplamento de pacotes | Forte | Arquitetura Limpa cap. 7-14; Princípios de Design (39 p.) | Livro curto de 2000, exemplos em C++ |
| DDD (linguagem, contextos, agregados, eventos) | Forte | DDD Referência (Evans, 62 p.); DDD Rápido (InfoQ, 106 p.); Silveira cap. 3.6 | "Rápido" tem tradução automática ruim: usar a Referência |
| Padrões de projeto (GoF) | Forte | Padrões de Projetos (360 p.) | Catálogo com exemplos em C++/Smalltalk |
| Refatoração, código legado, código limpo | Forte | Fowler (2ª ed., exemplos em JavaScript); Feathers (C++/Java); Clean Code (Java) | |
| Postura profissional, estimativa, testes de aceite | Média/Forte | Clean Coder; Software Craftsman | Ligam com critérios de aceite |
| Testes (unidade, integração, aceite, pirâmide) | Média | Clean Code cap. 9; Clean Coder cap. 5-8; Silveira cap. 5; Feathers | JUnit/Mockito: ver categorias `desenvolvimento-agil` e `integracoes` |
| Spring Boot, Spring Security, OAuth 2.0 | Média (1 livro, 2017) | OAuth 2.0 com Spring Security OAuth2 (343 p.) | Biblioteca do livro pode estar defasada [CONFIRMAR] |
| REST, SOA, versionamento de contrato, mensagem assíncrona | Média | Silveira cap. 6-7; SOA Aplicado; Desconstruindo a Web | |
| UX, usabilidade, web responsivo, CSS | Média/Forte | UX e Usabilidade (Caelum); Web Design Responsivo; A Web Mobile; CSS Eficiente; Intro. UX | Servem ao protótipo HTML, não ao JavaFX |
| **JavaFX** (cena, FXML, CSS próprio, binding, threads da UI) | **Nenhuma** | 1 menção em Silveira (doc_01558), só como "interface rica" | **[NÃO COBERTO PELA BASE]** |
| **MVVM, binding, ViewModel de framework** | **Nenhuma** | "ViewModel" só no Presenter da Arquitetura Limpa | **[NÃO COBERTO PELA BASE]** |
| Spring Data / JPA / Hibernate (detalhe) | Pouca | Silveira cap. 6.3 (ORM em geral); categoria `integracoes` | Fora desta parte |
| Supabase / Postgres / RLS | Nenhuma nesta parte | Ver `docs/kb/07-supabase-postgres.md` | |
| Linguagens (Lisp, Haskell, JavaScript, Seven Languages) | Não são Java | `linguagens-de-programacao` | Sem Java/Spring/JavaFX (seção 2.14) |

Nota de acesso: na cópia local da base **não existe a pasta `livros/`**; cada página de livro é um arquivo em `<categoria>/documentos/<categoria>__doc_NNNNN.md`. Fórmula do arquivo: `doc = início do livro + página - 1` (tabela da seção 10).

---

## 2. Resumo por livro

### 2.1 Arquitetura Limpa (Robert C. Martin, 489 p.) [BASE]
Livro central. Partes: valores (comportamento x arquitetura), paradigmas, **princípios SOLID**, **princípios de componentes**, **arquitetura**, **detalhes**.
- **Dois valores**: o software tem que funcionar (comportamento) e tem que ser fácil de mudar (arquitetura). Arquitetura é o segundo, é "importante, não urgente" (Matriz de Eisenhower, cap. 2): é o P.O. e o time que precisam brigar por ela.
- **Paradigmas** (cap. 3-6): estruturada disciplina o fluxo; OO dá polimorfismo, que permite inverter dependência; funcional ensina **imutabilidade** (sem variável que muda não há disputa de gravação), **segregar o que muda** do que não muda e **Event Sourcing** (guardar os fatos, não só o estado final; p. 106).
- **SOLID** (p. 111-?): SRP (um módulo, **um ator** que pede mudança), OCP (estender sem editar), LSP (substituível), ISP (não depender do que não usa), DIP (depender de abstração). SRP: classe `Employee` com `calculatePay` (contabilidade), `reportHours` (RH), `save` (DBA) quebra por "duplicação acidental" e "fusões" (p. 113-117).
- **Componentes** (cap. 12-14): quem muda junto fica junto (CCP), quem se reusa junto fica junto (CRP), sem ciclos entre pacotes (ADP), depender na direção da estabilidade (SDP), estável = abstrato (SAP).
- **Arquitetura** (cap. 15-28): arquitetura serve a **casos de uso** e **mantém opções abertas** (adiar decisão de banco, web, framework). Limites separam o que muda em ritmos diferentes; banco e GUI são **plug-ins** do negócio (p. 235-242). Duplicação **verdadeira x acidental**: duas telas parecidas hoje podem divergir amanhã; não unificar à força (p. 219-221). Modos de desacoplamento: fonte, implantação, serviço; "nascer monolito, crescer se precisar" (p. 219-222).
- **Regras de negócio** (cap. 20, p. 260-264): **Entidades** (regras cruciais, valem para a empresa toda) e **Casos de uso** (regras da aplicação; orquestram as entidades; recebem estruturas simples de entrada e devolvem de saída; não conhecem HTML nem SQL).
- **Arquitetura Limpa** (cap. 22, p. 273-): círculos Entidades, Casos de uso, Adaptadores de interface, Frameworks e drivers. **Dependências só apontam para dentro**. Cenário Java web: Controller, InputBoundary, UseCaseInteractor, Entities, DataAccessInterface, OutputBoundary, Presenter, ViewModel, View. Dados que cruzam limite são estruturas simples (nada de entidade nem linha do banco).
- **Apresentadores e Objetos Humble** (cap. 23, p. 286-290): a **View é "humilde"** (só joga dados na tela); o **Presenter** (testável) formata data, moeda e liga/desliga botão num **ViewModel** simples (strings, booleanos). Gateways de banco são interfaces no caso de uso; ORM é "mapeador de dados" na camada de banco.
- **Limites parciais** (cap. 24, p. 291-295): limite completo é caro; alternativas baratas (pular o último passo, limite de uma via/Strategy, Fachada) servem de "lugar reservado", mas **degradam** se o limite nunca for usado.
- **Main** (cap. 26, p. 306): o componente mais sujo e de mais baixo nível; cria fábricas e injeta dependências; pode haver um `Main` por configuração (dev, teste, produção).
- **Serviços** (cap. 27): serviço **não** é, por si, arquitetura; limites cortam os serviços por dentro.
- **Limite de teste** (cap. 28, p. 323-): testes são o círculo mais externo; **testes fortemente ligados à estrutura ou à GUI ficam frágeis** e engessam o sistema; criar uma **API de teste**.
- **Detalhes** (cap. 30-32, p. 355-371): banco, web e frameworks são detalhes. **"Não case com o framework"**: use, mas atrás de limite.
- **Capítulo perdido** (cap. 34, p. 380-): pacote por camada, por recurso, portas e adaptadores, **pacote por componente**; arquitetura em camadas "relaxada" deixa o controller pular o serviço.

### 2.2 Princípios de Design e Padrões de Projeto (Martin, 39 p.) [BASE]
Versão curta (2000). **Quatro sintomas de design podre**: rigidez (mudança simples vira cascata), fragilidade (quebra longe do que mexeu), imobilidade (não reaproveita), viscosidade (é mais fácil fazer errado que certo; ambiente lento também conta) (p. 4-6). Causa: dependências novas e não planejadas. Solução: "firewalls de dependência" (p. 6). Depois: OCP (p. 8), LSP com pré e pós-condições (p. 12-16), DIP (p. 16), ISP (p. 18), REP/CCP/CRP (p. 21-22), ADP, SDP, SAP com métricas (instabilidade I = Ae/(Aa+Ae); abstração A = Na/Nc) (p. 23-32), padrões Abstract Server, Adapter, Observer, Bridge, Abstract Factory (p. 33-37). Redesenho total "raramente dá certo" (p. 4).

### 2.3 Refatoração (Martin Fowler, 2ª ed., 480 p., exemplos em JavaScript) [BASE]
- **Definição**: mudar a estrutura interna **sem mudar o comportamento observável**, em passos minúsculos, com o código sempre funcionando (cap. 2, p. 70-73). **Dois chapéus** (Kent Beck): ou acrescenta funcionalidade ou refatora, nunca os dois ao mesmo tempo (p. 73).
- **Quando**: Regra dos Três (na 3ª vez, refatora), **refatoração preparatória** (antes de acrescentar a funcionalidade), de compreensão, de coleta de lixo, em revisão de código (p. 77-). Não refatorar o que não precisa mudar.
- **Arquitetura e Yagni** (p. 94-96): em vez de prever flexibilidade, faça bem o que é necessário agora e refatore quando a necessidade aparecer. Yagni não é "não pensar" em arquitetura. **Mudança em paralelo (expansão-contração)** serve para mudar estrutura de dados sem quebrar quem usa (p. 93-94).
- **Desempenho** (p. 97-102): código bem fatorado é mais fácil de otimizar; **meça com profiler, não adivinhe**.
- **Maus cheiros** (cap. 3, p. 107-125): Nome misterioso, Código duplicado, Função longa, Lista longa de parâmetros, Dados globais, Dados mutáveis, Alteração divergente, Cirurgia com rifle, Inveja de recursos, Agrupamentos de dados, Obsessão por primitivos, Switches repetidos, Laços, Elemento ocioso, Generalidade especulativa, Campo temporário, Cadeias de mensagens, Intermediário, Trocas escusas, Classe grande, Classes alternativas com interfaces diferentes, Classe de dados, Herança recusada, Comentários.
- **Testes** (cap. 4, p. 126-): "refatoração exige testes"; teste **autotestável** (verifica o próprio resultado); testar limites.
- **Catálogo** (cap. 6-12): Extrair função, Introduzir objeto de parâmetros, Combinar funções em classe, Separar em fases, Encapsular registro/coleção, Substituir primitivo por objeto, Extrair classe, Mover função, Substituir condicional por polimorfismo etc.

### 2.4 Trabalho eficaz com código legado (Michael Feathers, 408 p.) [BASE]
- **Código legado = código sem testes** (a ideia atravessa o livro). Quatro razões de mudar: nova função, correção, refatoração, otimização (cap. 1).
- **Editar e Rezar x Cobrir e Modificar** (cap. 2): cobrir com testes é um "torno" que segura o comportamento enquanto muda só o que quer. **Feedback em minutos, não em uma noite** (p. 28-31).
- **Algoritmo de alteração** (cap. 2): 1) identificar pontos de alteração; 2) achar pontos de teste; 3) eliminar dependências; 4) escrever testes; 5) alterar e refatorar. Cada alteração deve trazer mais código para dentro da cobertura ("ilhas viram continentes").
- **Pontos de extensão** (seam; cap. 4): lugar onde se muda o comportamento **sem editar naquele lugar** (ex.: trocar a classe que fala com o sistema externo por uma falsa no teste).
- **Brotar Método/Classe** e **Encapsular Método/Classe** (cap. 6, p. 85-105): como acrescentar funcionalidade com segurança em classe que não consegue entrar em teste; Brotar Classe quando é uma responsabilidade nova.
- **Testes de caracterização** (cap. 13, p. 205-): registrar **o que o sistema faz hoje**, não o que "deveria" fazer: escreva uma asserção que falha, deixe a falha mostrar o comportamento, ajuste o teste.
- **Edição hiperatenta, objetivo único, preservar assinaturas, confiar no compilador** (cap. 23, p. 320-): jeito de fazer as primeiras incisões seguras sem testes.
- **Catálogo de quebra de dependência** (cap. 25): Extrair interface, Parametrizar construtor, Extrair e sobrescrever chamada, Encapsular referências globais, etc.

### 2.5 Domain-Driven Design, Referência (Eric Evans, 62 p.) [BASE]
Resumo oficial dos padrões. Três pontos: foco no **domínio principal**; modelar em colaboração entre quem sabe do negócio e quem programa; falar a **Linguagem Onipresente** dentro de um **Contexto Delimitado** (p. 9). Blocos: **Arquitetura em camadas** (isolar o domínio de UI/infra, p. 18), **Entidades** (identidade), **Objetos de Valor** (só atributos; imutáveis; operações sem efeito colateral), **Eventos de Domínio**, **Serviços**, **Módulos**, **Agregados** (raiz única, invariantes, uma transação por agregado), **Repositórios** (ilusão de coleção em memória; só para raízes), **Fábricas**. **Design flexível**: interfaces que revelam intenção, funções sem efeito colateral, asserções, fechamento de operações, contornos conceituais. **Mapa de contexto**: Parceria, Núcleo Compartilhado, Cliente/Fornecedor, Conformista, **Camada Anticorrupção**, Serviço de Host Aberto, Linguagem Publicada, Caminhos Separados, Grande Bola de Lama (p. 38-47). **Destilação**: Domínio Principal, Subdomínios Genéricos, Declaração da Visão de Domínio, Núcleo Destacado (p. 48-56).
DDD Rápido (InfoQ, 106 p.): resumo mais longo do livro de 2004; tradução automática ruim, usar só como apoio.

### 2.6 Padrões de Projetos (Gamma et al., 360 p.) [BASE]
Catálogo de 23 padrões em **criação, estrutura, comportamento**. Princípios: **programe para uma interface, não para uma implementação** (p. 31). **MVC** explicado como união de Observer (modelo avisa as visões), Composite (visões aninhadas) e Strategy (controlador) (p. 18-19, doc_01531 e 01532). Guia de início: Abstract Factory, Adapter, Composite, Decorator, Factory Method, Observer, Strategy, Template Method.

### 2.7 Clean Code (Robert C. Martin, 462 p., em inglês) [BASE]
Nomes (cap. 2, p. 48), funções pequenas que fazem uma coisa (cap. 3, p. 62), comentários (cap. 4), formatação (cap. 5), objetos e estruturas de dados, Lei de Demeter, DTO (cap. 6, p. 124), erros (cap. 7, p. 134), **limites com código de terceiros** e testes de aprendizado (cap. 8, p. 144), testes de unidade, TDD, F.I.R.S.T. (cap. 9, p. 152), classes e SRP (cap. 10, p. 166), sistemas e injeção de dependência (cap. 11, p. 184), emergência, concorrência, e o catálogo de **cheiros e heurísticas C1-C5, E1-E2, F1-F4, G1-G36, J1-J3, N1-N7, T1-T9** (cap. 17, p. 316).

### 2.8 The Clean Coder (Martin, 247 p., inglês, OCR irregular) [BASE]
Postura profissional. **Dizer não / dizer sim** (cap. 2-3: "tentarei" não é compromisso), **TDD** (três leis, p. 109-114), **Testes de aceite** (cap. 7, p. 133-143): escritos por quem pede **junto** com quem programa, definem "pronto" e **são automatizados**. **Pirâmide de automação de testes** (cap. 8, p. 148-153): unidade (~100%), componente (~50%), integração (~20%), sistema (~10%), exploratório (~5%) e "QA não deve achar nada". **Estimativa** (cap. 10, p. 168-175): PERT com três números (otimista O, normal N, pessimista P; esperado = (O+4N+P)/6). **Pressão** (cap. 11).

### 2.9 OAuth 2.0: proteja suas aplicações com Spring Security OAuth2 (A. Eloy, 343 p., 2017) [BASE]
Caps. 1-2 (p. 11-48): confidencialidade, integridade, disponibilidade; **papéis** (Resource Owner, Client, Resource Server, Authorization Server); registro do client (`client_id`, `client_secret`, **URI de redirecionamento obrigatória**); **OAuth é autorização, não autenticação** (p. 47). Cap. 3 (p. 50-72): projeto Spring Boot (`spring-boot-starter-web`, banco, Lombok). Caps. 4-6: configuração do Resource Server/Authorization Server. **Grant types**, cada um com "quando usar": Password (cap. 7, p. 140: só com altíssima confiança; evitar), **Authorization Code** (cap. 9, p. 170: app web que redireciona; confidencial), Implicit (cap. 10: app público no navegador), **Client Credentials** (cap. 11, p. 199: aplicação acessa recurso em benefício próprio, sem usuário). **Refresh token, escopos e roles** (cap. 12, p. 203-220). **Tokens no banco** (cap. 13), **introspecção** (`check_token`) e **JWT assinado** (cap. 15, p. 258-291): remoto custa rede, JWT evita a ida ao servidor mas precisa de assinatura (`alg: none` é perigoso). **OpenID Connect** para autenticar (cap. 16). **Modelo de ameaças** (cap. 17, p. 324-340): `redirect_uri` e `state`.

### 2.10 SOA Aplicado (Casa do Código, 286 p.) [BASE]
Web services em Java (SOAP, WSDL, JAXB), **REST** (cap. 5, p. 99-: recursos, métodos HTTP, códigos de status, `409 Conflict` para versão desatualizada, hipermídia), **segurança** (cap. 6, p. 147-: HTTPS, autenticação HTTP, WS-Security), **integração x SOA**, modelo canônico, contract-first, serviços assíncronos (cap. 7, p. 200-). Servidor de aplicação Oracle (cap. 8-9) não interessa ao IT.MK.

### 2.11 DSL: quebre a barreira entre desenvolvimento e negócios (Casa do Código, 184 p.) [BASE]
DSL = linguagem específica de domínio. **Interna** (dentro da linguagem hospedeira, "interface fluente") x **externa** (arquivo próprio). Conceitos: modelo de domínio, **modelo semântico** (a DSL preenche; manter a DSL independente dele). "Devo usar?" (cap. 2.5, p. 49-52): ajuda a aproximar código e especialista do negócio, **mas tem custo alto de construção e pode virar linguagem geral**; só vale com modelo complexo/crescente. Técnicas: encadeamento de métodos, funções aninhadas, closures. Exemplos em Java e Scala.

### 2.12 Introdução à arquitetura de design de software (Paulo Silveira et al., 265 p.) [BASE]
Livro de **Java** (a base mais próxima do IT.MK). Cap. 3 (p. 60-93): programe para interface; **componha em vez de herdar** (p. 69); **imutabilidade** (p. 74); **modelo anêmico** é problema (p. 81); DDD (p. 85). Cap. 4 (p. 94-): baixo acoplamento, alta coesão, **injeção de dependência** (DAO que abre a própria conexão é ruim, p. 97), frameworks de DI, fábricas. Cap. 5 (p. 131-): testes de sistema/aceite, **TDD e ATDD**, **teste de integração do DAO contra banco real** (mock só espelha o que foi digitado, p. 145), integração contínua. Cap. 6 (p. 159-): **layers x tiers**, cliente gordo x magro, **minimizar chamadas remotas (round-trips), tamanho da carga (DTO) e usar cache** (p. 159-164), MVC web, ORM, mensagem assíncrona, nuvem. Cap. 7 (p. 213-): REST, SOAP, **não quebrar compatibilidade de contrato** (p. 224), princípios SOA. **JavaFX aparece uma vez** (doc_01558), só como "interface rica no cliente".

### 2.13 The Software Craftsman (Sandro Mancuso, 112 p. na base) [BASE]
Profissionalismo e pragmatismo. **Dívida técnica**: "lista de dívida técnica" vira justificativa para código ruim; "rápido não é sujo" (p. 47). Qualidade é sempre esperada, não custa tanto quanto se acha (p. 99). **Quatro regras de design simples** (Beck/Rainsberger): passa nos testes, minimiza duplicação, maximiza clareza, tem poucos elementos; na prática: nomes bons, depois tirar duplicação (p. 103). "A melhor linha de código é a que não se escreve." Nem tudo precisa de TDD, mas "como regra, testo tudo" (p. 100).

### 2.14 Outros livros (uso baixo)
- **Desconstruindo a Web** (250 p.): o caminho de uma requisição web (DNS, TCP, TLS, HTTP, cache). Útil só para entender latência e cache.
- **Business Intelligence a custo zero** (210 p.): BI como metodologia de fatos e dimensões; carga (ETL) e dashboard. Possível uso na tela Dashboard, não é prioridade.
- **Big Data** (263 p.): conceitual, sem aplicação ao IT.MK hoje.
- **UX e Usabilidade Aplicados em Mobile e Web (Caelum)** (165 p.): ISO 9241-210 (6 princípios), **10 heurísticas de Nielsen** (p. 79-90 do livro), Leis de Fitts e Hick, zonas do polegar, **C.R.A.P.** (Contraste, Repetição, Alinhamento, Proximidade), teoria das cores, **teste de usabilidade** (apêndice).
- **Introdução e boas práticas em UX Design** (225 p.): processo de UX e arquitetura de informação.
- **Web Design Responsivo** (148 p.): layout fluido (medida relativa: **alvo / contexto = resultado**), `meta viewport`, imagens flexíveis (`max-width: 100%`), media queries, **breakpoints pelo conteúdo** (quando surge rolagem), mobile first.
- **A Web Mobile** (220 p.): "use sempre media queries baseadas no conteúdo da sua página" (cap. 13), formulários mobile, acessibilidade.
- **CSS Eficiente** (136 p.): especificidade, CSS orientado a objetos, SMACSS, BEM, pré-processadores (variáveis), ITCSS.
- **HTML5 e CSS3**, **Progressive Web Apps com React**, **Google Android**: fora do escopo do IT.MK (cliente é JavaFX).
- **Linguagens de programação** (5 livros): Common Lisp (base vazia: só 28 KB de texto), Principles of Programming Languages, Professional JavaScript 3ª ed. (o cap. 24 "Best Practices" traz manutenibilidade: baixo acoplamento entre JS, CSS e HTML; relevante só ao protótipo HTML), Real World Haskell, Seven Languages in Seven Weeks (Scala e Clojure na JVM, imutabilidade). **Nenhum trata de Java, Spring ou JavaFX.**

---

## 3. Princípios e regras acionáveis

Cada regra tem fonte. A coluna "exija" é o que o P.O. pede no plano.

### 3.1 Camadas, limites e dependência [BASE: Arquitetura Limpa]
| # | Regra | O P.O. exige |
|---|---|---|
| R1 | Dependências de código apontam **para dentro** (para as regras de negócio). Nada interno cita nome de coisa externa (classe de framework, tabela, tela). | Diagrama de módulos com setas; revisão que recuse seta para fora. |
| R2 | Centro = **Entidades** (regras de toda a empresa) + **Casos de uso** (regras da aplicação). Fora = adaptadores, banco, web, Spring, APIs. | Lista de casos de uso com nome de negócio (ex.: "Fechar competência"). |
| R3 | Dados que cruzam o limite são **estruturas simples**; **não** passe entidade nem linha do banco para a tela (p. 220, 265, 355). | DTOs/modelos de pedido e resposta separados da entidade. |
| R4 | Fluxo de controle e dependência podem ir em sentidos opostos: o caso de uso chama uma **interface** (porta de saída) e o adaptador de fora a implementa (p. 275). | Interfaces de repositório e de integração **no domínio**, implementação **no adaptador**. |
| R5 | **Banco é detalhe**: regras só conhecem "funções para buscar e salvar"; **todo o SQL fica na camada de banco** (p. 242, 273, 355). | Nenhuma consulta SQL fora do módulo de persistência. |
| R6 | **Web/tela é detalhe**: a regra deve funcionar com outra interface (p. 366). | Caso de uso executável por teste, sem tela. |
| R7 | **Framework é detalhe**: não herdar de classe do framework em entidade; `@Autowired` e anotações do Spring **não** vão em objeto de negócio; Spring liga tudo no `Main` (p. 368-371). | Módulo de domínio sem dependência do Spring (verificável no build). |
| R8 | `Main` é o plug-in sujo que monta o sistema; pode haver um por ambiente (p. 306). | Perfis dev/teste/produção só no `Main`. |
| R9 | Decida **tarde** o que pode ser decidido tarde (banco, serviço, web): "boa arquitetura deixa opções abertas" (cap. 15-16, p. 219). | Registro de decisões com data e motivo; nada de "microsserviços por padrão". |
| R10 | **Limite completo é caro**: use limite parcial só onde há eixo de mudança real; limite parcial sem disciplina degrada (p. 291-295). | Justificativa escrita para cada limite. |
| R11 | **Organize por assunto do negócio** (pacote por componente / por recurso), não só por camada técnica; em camadas "relaxadas" o controller pula o serviço e fura regra (cap. 34, p. 380-). | Estrutura de pastas com nomes do negócio. Regra de revisão: "controller nunca fala com repositório". |
| R12 | **Testabilidade é parte do desenho**: crie uma **API de teste** para regras sem GUI; teste preso à estrutura ou à GUI é frágil (cap. 28, p. 323-). | Testes de regra que não abrem tela. |
| R13 | **Camadas (layers) x níveis físicos (tiers)**: mais camadas lógicas ajudam, mais níveis físicos custam chamadas remotas; reduza distribuição (Silveira cap. 6.1, p. 159-164). | Contagem de chamadas por tela (meta: 1 por tela). |

### 3.2 SOLID e pacotes [BASE: Arquitetura Limpa; Princípios de Design]
- **SRP**: uma razão para mudar = **um ator**. No IT.MK: quem pede mudança na régua (cobrança) não é quem pede mudança no layout do extrato nem na tabela do banco. Separar regra de cobrança, formatação do extrato e persistência.
- **OCP**: acrescentar plataforma (Kwai, nova) ou nova ação da régua **adicionando código**, não editando `if/else` espalhado. Sinal de alerta: `switch` por plataforma em vários lugares (cheiro "Switches repetidos"; solução: polimorfismo/Strategy).
- **LSP**: implementações de uma interface (ex.: cliente Shein, cliente Shopee) devem obedecer ao **mesmo contrato** (pré e pós-condições). Se uma plataforma não suporta algo (Kwai não entrega notas), isso deve estar **no contrato** (capacidades), não como exceção surpresa. [LEITURA]
- **ISP**: interfaces pequenas por tipo de cliente (uma interface para "enviar mensagem", outra para "ler conversas"), não uma interface gorda por serviço.
- **DIP**: dependa de interface; **o dono da interface é quem usa**, não quem implementa (p. 18; Arquitetura Limpa p. 298-300).
- **Pacotes**: sem **ciclos** (ADP); **quem muda junto fica junto** (CCP); depender de pacotes mais estáveis; no início do projeto agrupe para facilitar manutenção (CCP), depois ajuste para reuso (Princípios de Design p. 22).

### 3.3 DDD: o que fazer [BASE: Evans; Silveira 3.6]
1. **Linguagem ubíqua**: glossário único (seção 7.1). "Uma mudança na linguagem é uma mudança no modelo": se o dono mudar o termo, renomeia-se classe, método, tabela e tela (p. 12).
2. **Contexto delimitado**: onde um termo tem um só significado. "Pagador" para Cadastro não é o mesmo que "devedor" em Inadimplência; se for, dizer. Limites por equipe, parte do app e **esquema do banco** (p. 10).
3. **Entidade x Objeto de Valor**: o que tem identidade ao longo do tempo (Pagador, Loja, Cobrança, Acordo) é entidade; o que só vale pelo conteúdo (Dinheiro, Competência, Faixa de atraso, Chave Pix) é objeto de valor: **imutável**, com operações sem efeito colateral (p. 19-20; Silveira p. 74).
4. **Agregado**: grupo com **uma raiz**; de fora só se referencia a raiz; **regras (invariantes) do agregado valem sempre dentro de uma transação**; entre agregados, consistência pode ser **eventual** (p. 25).
5. **Repositório** só para **raiz de agregado**, com métodos na linguagem do negócio ("cobranças vencidas de um pagador") (p. 26).
6. **Serviço de domínio** quando a operação não pertence a uma entidade (ex.: conciliar pagamento com cobranças) (p. 23).
7. **Evento de domínio**: fato imutável que o negócio quer rastrear (PagamentoRecebido, AcordoQuebrado) (p. 21).
8. **Camada anticorrupção** na fronteira com sistema de fora (p. 43); **Conformista** quando aceitar o modelo do fornecedor é mais barato (p. 42).
9. **Domínio principal**: gaste o melhor time no que diferencia o IT.MK (régua, conciliação, acordos), e use solução pronta para o genérico (p. 49-50).
10. **Anti-modelo anêmico**: classe só com getter/setter + "serviço" com toda a regra é código procedural; pergunte "quem é o dono desta regra?" (Silveira p. 81-85). **Tell, Don't Ask**: mande o objeto agir (`acordo.registrarPagamento(parcela)`), não leia o estado para decidir fora.

### 3.4 Padrões úteis e onde cabem no IT.MK [BASE: GoF; Princípios de Design; Evans]
| Padrão | Para quê (base) | Onde no IT.MK [LEITURA] |
|---|---|---|
| **Strategy** | Família de algoritmos intercambiáveis | Base de cálculo do faturado (total, produtos, pedidos, notas, manual); cálculo de multa/juros (se houver) |
| **Adapter** | Converte interface de terceiros na interface esperada | Clientes de Shein, Mercado Livre, Shopee, Kwai, Asaas, WhatsApp |
| **Facade** | Interface unificada para subsistema | Entrada simples para o módulo de Fechamento |
| **Observer** | Quem muda avisa quem depende, sem acoplar | Tela atualiza quando o modelo muda; eventos internos |
| **Template Method** | Esqueleto fixo, passos variáveis | Fluxo comum de "sincronizar plataforma" com passos por plataforma |
| **State** | Comportamento muda com o estado | Ciclo da cobrança, do acordo, da contestação, da conexão com a loja |
| **Command** | Pedido como objeto (fila, log, desfazer) | Ações do robô (enviar lembrete, bloquear loja) registradas e reprocessáveis |
| **Chain of Responsibility** | Cadeia de tratadores | Régua escalando: robô, depois pessoa |
| **Factory / Abstract Factory** | Esconde a criação concreta | Criar o cliente certo por plataforma; criar Cobrança completa respeitando regras |
| **Composite** | Trata grupo como unidade | Grupo de lojas de um pagador (valor total = soma) |
| **Memento** | Guarda estado para restaurar | Memória de cálculo / histórico da contestação |
| **Mediator** | Centraliza a interação | Coordenação entre telas (uso cuidadoso) |
| **Singleton** | Instância única | **Evitar**: use injeção de dependência (cap. 4 Silveira) [LEITURA] |

### 3.5 Refatoração e código legado: como o P.O. conduz [BASE: Fowler; Feathers]
- Refatoração entra no plano **como parte do item** que pede a mudança (refatoração preparatória), com estimativa já incluindo isso. Não vira item "limpar código" solto (base-po §8: "estimativas já incluem a dívida").
- Se o código existente **não tem teste**, o primeiro item é o **teste de caracterização**; só depois a mudança (Feathers cap. 13; algoritmo de alteração, cap. 2).
- Passo único por commit: ou muda comportamento ou limpa (Fowler p. 73; Feathers "objetivo único", cap. 23).
- Mudança de estrutura de dados em produção: **expansão e contração** (acrescenta o campo novo, grava nos dois, migra as leituras, remove o antigo) (Fowler p. 93-94). Vale para a frente Database [LEITURA].
- Reescrita total é arriscada: "redesenhos raramente têm sucesso" (Princípios de Design p. 4).
- **Otimização**: pedir **medição** antes (profiler) (Fowler p. 97-102).
- **Dívida técnica**: Mancuso alerta que "backlog de dívida" vira desculpa (p. 47). Combina com base-po §8: se há bug conhecido, não cumpre a Definição de Pronto.

### 3.6 Nomes e código limpo [BASE: Clean Code; Fowler]
- Nome revela intenção, evita desinformação, sem distinções vazias, pronunciável, buscável, **sem prefixos/encodings**, **uma palavra por conceito**, **nomes do domínio do problema** (cap. 2, p. 48-60; N1-N7, p. 316-).
- Classe é substantivo; método é verbo; **boolean/consulta não muda estado** (Command Query Separation, cap. 3).
- Função pequena, **faz uma coisa**, **um nível de abstração**, poucos argumentos, sem **argumento de flag** (cap. 3, F1-F4).
- **Comentário não conserta código ruim**; apague código comentado e código morto (cap. 4; C5, G9).
- Erros: exceção em vez de código de retorno; **não retorne null, não passe null** (cap. 7, p. 134-143).
- Classes pequenas, coesas, SRP (cap. 10). Lei de Demeter: sem "cadeias de trem" `a.b().c().d()` (cap. 6).
- Duplicação: **verdadeira** elimina; **acidental** deixa quieta (Arquitetura Limpa p. 219-221; Mancuso p. 103).
- Escoteiro: "deixe o acampamento mais limpo do que encontrou" (Clean Code cap. 1).
- Nome ruim é pista de problema de desenho: "quando não consegue um bom nome, há problema mais fundo" (Fowler p. 108).

### 3.7 Testes [BASE: Clean Code cap. 9; Clean Coder cap. 5-8; Silveira cap. 5; Arquitetura Limpa cap. 28]
- **Três leis do TDD** (teste que falha antes; só o necessário para falhar; só o código necessário para passar) (Clean Code p. 153).
- **F.I.R.S.T.**: Rápido, Independente, Repetível (qualquer ambiente, sem rede), Autovalidável (passou/falhou), Oportuno (escrito junto) (p. 163-164).
- **Um conceito por teste**; teste limpo como código de produção (p. 154-163).
- **Pirâmide**: muita unidade, menos componente, pouca integração, pouquíssima por tela; exploratório manual por último (Clean Coder p. 148-153).
- **Teste de aceite** = especificação executável escrita com quem pede; "a única definição de pronto" (Clean Coder p. 133-143). Silveira: **ATDD**, teste de aceite escrito **antes** de implementar (p. 145).
- **Não testar regra pela tela** (Arquitetura Limpa p. 324-326): tela muda, teste quebra.
- **Teste de mock que repete o código não prova nada** (Silveira p. 145-149); use **teste de integração com banco de teste** para repositório.
- **Testes de aprendizado** para API de terceiros: escrever testes que exploram a API real/falsa antes de depender dela (Clean Code cap. 8, p. 147-149). Servem para Shein, Shopee etc.
- Quem testa a tela? Teste de interface **fino**, só para ligação tela-caso de uso (Silveira p. 131-134).

### 3.8 Segurança e OAuth [BASE: OAuth 2.0 com Spring Security]
- Três princípios: **confidencialidade** (TLS, criptografia de dados em repouso), **integridade** (assinatura), **disponibilidade** (limitar taxa; proteger endpoint de autenticação contra força bruta com rate limit, Captcha ou limite de tentativas, p. 11-12 e 36).
- **OAuth autoriza, não autentica**; para saber **quem é** o usuário, use OpenID Connect (p. 47, cap. 16).
- **Registro do client com `redirect_uri` fixa**; sem isso, token pode ser entregue ao site errado. Mandar e validar **`state`** (contra CSRF) (cap. 17, p. 327-340).
- **Escolha do grant type** (p. 140, 170, 188, 199): Authorization Code para integração em que o dono da loja autoriza o IT.MK a acessar os dados dele; Client Credentials quando o IT.MK age em nome próprio; **evitar** Password e Implicit.
- **Guardar token**: no servidor do OAuth, aplicar **hash** antes de gravar; no client, criptografar (p. 141). **Expiração curta** e **refresh token** onde faz sentido; **validar escopos** (cap. 12).
- **JWT**: assinado (nunca `alg: none`); mais rápido que perguntar ao servidor a cada chamada, mas difícil de revogar [LEITURA do trade-off exposto em cap. 15].
- **Separar Authorization Server e Resource Server** reduz superfície de ataque (p. 33).
- A biblioteca do livro (Spring Security OAuth2) é de 2017. **[CONFIRMAR]**: conferir na documentação oficial do Spring Security qual é a forma atual de configurar client OAuth2 e resource server antes de planejar.

### 3.9 Serviços, REST, integração, concorrência [BASE: Silveira cap. 6-7; SOA Aplicado]
- **REST**: URL por recurso, métodos HTTP com sentido (GET lê, POST cria, PUT atualiza, DELETE apaga), **códigos de status** corretos, `Accept`/`Content-Type` (SOA Aplicado cap. 5, p. 99-113).
- **Concorrência otimista**: o servidor guarda **versão** do recurso; quem edita com versão velha recebe **409 Conflict** e precisa recarregar (SOA Aplicado p. 112-115, Optimistic Offline Lock). No IT.MK, com visão única e várias pessoas na mesma cobrança/acordo, isso evita sobrescrever o trabalho do colega [LEITURA].
- **Compatibilidade de contrato**: ler só o que usa, **ignorar campo novo**, versionar quando quebrar (MustIgnore; novas URLs por versão incompatível) (Silveira p. 224-228).
- **Minimizar viagens, payload e usar cache** entre cliente JavaFX e servidor (Silveira p. 159-164).
- **Assíncrono com mensagem** (store-and-forward) para tarefas sem espera de resposta e para serviços que podem cair (Silveira p. 198-202). Detalhe de Spring Integration: ver `docs/kb/05-integracoes.md`.
- Orquestração de vários serviços exige tratar falha e desfazer (ex.: reservar hotel e voo) (Silveira p. 229-235). Para o IT.MK: bloquear loja em plataforma + marcar no banco precisa de plano de desfazer [LEITURA].

### 3.10 Frontend e UX (valem para o protótipo e para a tela final) [BASE: Caelum; Web Design Responsivo; A Web Mobile]
- **Heurísticas de Nielsen**: visibilidade do estado do sistema, correspondência com o mundo real, liberdade e controle, consistência e padrões, **prevenção de erros**, reconhecer em vez de lembrar, flexibilidade, design minimalista, ajudar a recuperar de erros, ajuda.
- **C.R.A.P.**: Contraste, Repetição (= consistência), Alinhamento, Proximidade.
- Mobile/touch: Lei de Fitts (alvo grande e perto), Lei de Hick (menos opções), zonas do polegar.
- **Layout fluido**: medidas relativas (`%`, `em`); fórmula **alvo / contexto = resultado** para converter px em relativo; **imagem com `max-width: 100%`**; `meta viewport width=device-width`; **breakpoint nasce do conteúdo** (onde passa a precisar de rolagem), não de aparelho; media queries baseadas no conteúdo (A Web Mobile cap. 13).
- Isso apoia as regras 1-4 de layout do `CLAUDE.md` (sem espaço vazio, sem barra horizontal em nenhuma largura) no **HTML aprovado**. Para o **JavaFX** a base **não** ensina como obter o mesmo efeito: **[NÃO COBERTO PELA BASE]**.
- **Teste de usabilidade**: o que medir, quem envolver, preparação (Caelum, apêndice). Útil antes de "fechar" uma tela.

---

## 4. Do protótipo ao modelo (tela virando plano técnico)

### 4.1 Receita em 8 passos (aplicar a cada tela do protótipo) [LEITURA, apoiada na base]
1. **Liste o que a pessoa faz na tela** (verbos): "Cobrar", "Assumir conversa", "Contestar", "Dar baixa". Cada verbo é candidato a **caso de uso** com nome de negócio (Arquitetura Limpa cap. 20).
2. **Para cada caso de uso, escreva entrada e saída** em palavras do negócio (pedido e resposta, sem tela, sem SQL).
3. **Ache as regras escondidas na tela** (seção 4.4) e leve-as para o domínio como regra testável.
4. **Nomeie os conceitos**: entidade, objeto de valor, evento, serviço (seção 7.1). Conferir com o dono o significado de cada termo.
5. **Defina os agregados** e o que garante consistência (seção 7.3).
6. **Defina as portas** (interfaces) que o caso de uso precisa do mundo de fora: repositórios (buscar/salvar), envio de mensagem, geração de Pix, consulta a marketplace.
7. **Defina o modelo da tela**: o que o apresentador entrega à tela já pronto (textos formatados, valores em R$, cores/estado como "tipo", botões habilitados ou não). A tela só mostra (Humble View).
8. **Escreva os critérios de aceite** como "dado/quando/então" ligados ao caso de uso (seção 5), mais o desenho de computador e celular.

### 4.2 MVC, Presenter, ViewModel e JavaFX: o que a base diz e o que não diz
- **MVC** [BASE: GoF p. 18-19]: **Modelo** (objeto da aplicação), **Visão** (apresentação), **Controlador** (como a interface reage à entrada). Modelo avisa as visões quando muda (Observer). Isso separa para dar flexibilidade e reuso.
- **Presenter / Humble Object / ViewModel** [BASE: Arquitetura Limpa p. 286-290]: o Presenter converte `Date` e `Currency` em texto, decide cor negativa e botão cinza por **flag booleana**; a View **só move dados**. Toda a regra de formatação fica **testável sem janela**.
- **Camadas do DDD**: UI, Aplicação (fina, coordena), Domínio, Infraestrutura (Silveira p. 85-93; Evans p. 18).
- **Cliente gordo** (JavaFX chamando servidor Spring) [BASE: Silveira cap. 6.1]: custo é chamada remota; **uma chamada por tela**, DTO enxuto, cache. Segurança e atualização do cliente exigem cuidado (cliente desatualizado).
- **MVVM, binding de propriedades, FXML, Scene Builder, CSS do JavaFX, thread da interface (`Platform.runLater`), componentes JavaFX, empacotamento do aplicativo**: **[NÃO COBERTO PELA BASE]**. O P.O. deve pedir ao time uma **decisão registrada** sobre como o padrão de tela será feito e como o `tokens.css` será respeitado no JavaFX (as medidas e cores "as mesmas" que o `CLAUDE.md` exige). Ver seção 9.

### 4.3 Tabela módulo, conceitos de domínio, camadas [LEITURA]
| Módulo (protótipo) | Casos de uso (exemplos) | Conceitos de domínio | Portas de fora |
|---|---|---|---|
| Dashboard | Ver resumo do mês; ver fila do dia; ver pendências | Consultas de leitura (sem regra nova) | Repositórios de leitura |
| Conversas | Assumir/devolver conversa; enviar cobrança; contestar; abrir memória de cálculo; ligar/desligar robô | Conversa, Mensagem, Atribuição (pessoa x robô), Escalação | WhatsApp |
| Pagadores e Lojas | Cadastrar/editar pagador; vincular loja; consultar ficha | Pagador, Loja, Plataforma, Situação financeira | Repositório de pagadores |
| Marketplaces | Conectar loja; sincronizar faturado; ver estado da conexão | Conexão, Faturado por loja | APIs Shein, ML, Shopee, Kwai |
| Fechamento do mês | Abrir competência; escolher base de cálculo por loja; conferir; gerar cobranças e Pix; enviar | Competência, Base de cálculo (Strategy), Cobrança, Pix | Marketplaces, PSP/Pix, WhatsApp |
| Recebimentos | Conferir Pix; ligar comprovante a cobrança; resolver divergência | Pagamento, Comprovante, Divergência (valor, terceiro, prazo, duplicado) | PSP/Pix, repositório |
| Inadimplência e Acordos | Cobrar atraso; propor acordo; registrar promessa; bloquear/desbloquear; abrir/decidir contestação | Acordo, Parcela, Promessa, Bloqueio, Contestação, Faixa de atraso | Marketplaces (bloqueio), WhatsApp |
| Robô de cobrança | Executar ação da régua; escalar para pessoa; modo sombra | Régua, Ação, Política de escalação | WhatsApp, agendador |
| Configurações | Editar régua, modelos de mensagem, contas, base padrão | Configuração (régua, base padrão, contas) | Repositório de configuração |

### 4.4 Regras escondidas no JavaScript do protótipo (levar ao domínio) [PROTÓTIPO]
Estas regras estão hoje em `prototipo/js/`. No sistema final cada uma vira regra de domínio com teste:
| Regra no protótipo | Arquivo | Vira |
|---|---|---|
| **Régua pausa** se há promessa, acordo ativo ou contestação ativa (`reguaPausada`) | `js/inadimplencia.js` | Política "Régua pode agir?" no domínio (Cobrança/Inadimplência); teste com cada combinação |
| **Acordo ativo** = existe acordo, não está "quebrado" e há parcela não paga (`acordoAtivo`) | `js/inadimplencia.js` | Método do agregado Acordo |
| **Faixas de atraso**: até 30, 31-60, 61-90, acima de 90 dias (`faixaDe`) | `js/inadimplencia.js` | Objeto de valor "Faixa de atraso" |
| **Saldo e total da cobrança** em **centavos inteiros** (`Math.round(v*100)`) | `js/recebimentos.js` | Objeto de valor "Dinheiro" (tipo exato a decidir [CONFIRMAR]: centavos inteiros ou `BigDecimal`; a base só diz que objeto de valor é imutável) |
| **Base de cálculo do faturado** (faturamento total, produtos, pedidos, notas, manual); Kwai não entrega notas; loja sem conexão só aceita manual | `js/fechamento.js` | Estratégia por plataforma + **capacidades da plataforma** no contrato |
| **Motivos de divergência de Pix** (valor diferente, terceiro, fora do prazo, duplicado) | `js/recebimentos.js` | Tipo de divergência no domínio de Recebimento |
| **Estados do Pix** (gerado, enviado, pago, expirado, cancelado) | `js/fechamento.js` | Máquina de estados (State) |
| **Ações do robô** (lembrete 2 dias antes; cobrança; atraso em 1, 5 e 10 dias; pedido de comprovante; confirmação; extrato; 2ª via) | `js/robo.js` | Régua configurável (dados) + política |
| **"Quem decide é uma pessoa"** na contestação; o robô só abre e anexa memória | `js/robo.js` | Regra de escalação explícita |
| Filtro de busca por nome, telefone, CNPJ, nome da loja (`casa`) | `js/inadimplencia.js` | Consulta no repositório (não regra de tela) |
Datas e "hoje" estão fixos no protótipo; no sistema o relógio deve ser **injetado** (para testar atraso sem esperar) [LEITURA, base: dependência injetada].

### 4.5 Exemplo completo: botão "Cobrar" da tela Inadimplência [LEITURA]
- **Caso de uso**: "Cobrar pagador em atraso". Entrada: id do pagador, quem pediu. Saída: resultado (enviado, bloqueado por contestação, pagador sem telefone).
- **Domínio**: o pagador/cobrança respondem se **pode** cobrar (régua pausada? contestação ativa?). O protótipo desabilita o botão com a mensagem "Contestação em andamento. A cobrança fica parada." Esse texto vem do **Presenter**; a **regra** vem do domínio.
- **Portas**: repositório de cobranças; envio de mensagem (WhatsApp) atrás de interface; registro de histórico (evento "CobrancaEnviada").
- **Tela**: recebe do Presenter `botaoCobrarHabilitado=false` e `motivo="Contestação em andamento..."`.
- **Teste de aceite** (sem tela): dado pagador com contestação aberta, quando pedir cobrar, então nada é enviado e o motivo é "contestação em andamento".

---

## 5. Critérios de aceite técnicos (o que o P.O. exige)

Formato: caixas que o dev marca (base-po §6). Cada item tem fonte.

### 5.1 Para toda história técnica (todas as frentes)
- [ ] A regra de negócio está em classes do **domínio**, que **não importam** Spring, JavaFX, SQL nem HTTP (Arquitetura Limpa R1, R7).
- [ ] Existe **teste automatizado da regra** que roda **sem tela, sem banco e sem rede**, em segundos, e passa em qualquer máquina (F.I.R.S.T.).
- [ ] Os critérios de aceite da história estão escritos como **dado/quando/então** e **viraram teste de aceite automatizado** (Clean Coder cap. 7; Silveira ATDD).
- [ ] Nomes de classes, métodos, telas e tabelas usam os **termos do glossário** (seção 7.1) (Evans: linguagem ubíqua).
- [ ] Nenhum teste depende de ordem, de data atual ou de dado de outro teste (Independente, Repetível); o relógio é injetado.
- [ ] Sem código comentado, sem código morto, sem `TODO` sem dono (Clean Code C5, G9).
- [ ] Nenhum bug conhecido aberto (Definição de Pronto, base-po §7).
- [ ] Mudança em código existente sem teste: antes veio **teste de caracterização** (Feathers cap. 13).
- [ ] Commit/mudança **ou** refatora **ou** muda comportamento (Fowler "dois chapéus").
- [ ] Decisão de arquitetura nova registrada (o quê, por quê, o que ficou em aberto) (R9).

### 5.2 Backend (Java + Spring) [BASE + LEITURA]
- [ ] Cada **caso de uso** é uma classe com nome de negócio; recebe **pedido simples** e devolve **resposta simples** (sem entidade, sem `HttpRequest`) (Arquitetura Limpa p. 263-265).
- [ ] **Controller só traduz** e chama o caso de uso; sem regra nem acesso direto a repositório (p. 380-).
- [ ] **Repositório** é interface no domínio; implementação no adaptador; **nenhum SQL fora do adaptador** (R4, R5).
- [ ] Dependências entram **pelo construtor**; `@Autowired` e anotações do Spring **fora** das entidades e regras; Spring configurado no `Main`/módulo de configuração (p. 371).
- [ ] **Entidades com comportamento** (não só getter/setter); sem `setSaldo` solto (Silveira p. 81-85).
- [ ] **Dinheiro e datas** como objetos de valor imutáveis; **nunca `double`** [CONFIRMAR: tipo exato].
- [ ] Erros do negócio como **exceção com mensagem do negócio**; **nenhum método devolve ou aceita `null`** de propósito (Clean Code cap. 7).
- [ ] **Edição concorrente**: versão no registro; conflito devolve `409` e a tela pede recarregar (SOA Aplicado p. 112-115).
- [ ] Operação repetida (reenvio de aviso de pagamento) **não duplica efeito** (idempotência: ver `docs/kb/05-integracoes.md`).
- [ ] Segurança: token com **expiração**, escopos conferidos, endpoint de login com **limite de tentativas** (OAuth cap. 12 e p. 36). Forma atual de configurar no Spring: [CONFIRMAR].
- [ ] **Relógio injetado** para regras de atraso/vencimento.

### 5.3 Database [BASE parcial + LEITURA]
- [ ] **Esquema não vaza** para casos de uso nem para a tela: o domínio não conhece tabela nem coluna (Arquitetura Limpa p. 242, 355).
- [ ] Mudança de estrutura em produção em **passos de expansão e contração** (campo novo, gravar nos dois, migrar leitura, remover o antigo), sem parar o sistema (Fowler p. 93-94).
- [ ] **Teste de integração do repositório** contra um banco de teste real, não só com dublê (Silveira p. 145-149).
- [ ] **Uma transação = um agregado**; regra entre agregados aceita atraso (Evans p. 25).
- [ ] Decisão explícita sobre **regra em stored procedure x regra em Java** (Silveira p. 160-162 mostra o dilema: ganha segurança e velocidade, perde separação, portabilidade e testabilidade) [LEITURA: sugerir manter regra no Java].
- [ ] Colunas e tabelas com **termos do glossário**; a mesma palavra para o mesmo conceito no banco e no código.
- [ ] Supabase/Postgres (RLS, migrações, chaves): **[NÃO COBERTO POR ESTA PARTE DA BASE]**; ver `docs/kb/07-supabase-postgres.md`.

### 5.4 Integrações (marketplaces, Pix, WhatsApp) [BASE + LEITURA]
- [ ] O IT.MK tem **sua própria interface** ("porta") por integração; o código de cada fornecedor fica **atrás dela**, em adaptador (Clean Code cap. 8: "código que ainda não existe"; Evans: camada anticorrupção).
- [ ] **Nenhum tipo de dado do fornecedor** (campos da API) aparece no domínio; há **tradução** na borda (Evans p. 43).
- [ ] **Testes de aprendizado** da API de cada fornecedor e **teste do adaptador** com fornecedor falso; pelo menos um teste contra o ambiente de testes do fornecedor, se existir (Clean Code p. 147-149).
- [ ] Contrato: lê **só o que usa**, **ignora campo novo**; mudança incompatível = nova versão (Silveira p. 224-228).
- [ ] OAuth: `redirect_uri` registrada e fixa, `state` validado, token guardado com hash/criptografia, expiração e renovação tratadas, escopo mínimo (OAuth cap. 2, 12, 17).
- [ ] Capacidades por plataforma **declaradas no contrato** (ex.: Kwai sem notas) em vez de tratadas por `if` espalhado (Princípios: OCP, LSP).
- [ ] Falha de fornecedor **não derruba** o IT.MK: tempo-limite, nova tentativa limitada, fila de erros (ver `docs/kb/05-integracoes.md`).
- [ ] Regras e formatos reais (Shein, ML, Shopee, Kwai, Asaas, WhatsGW): **[NÃO COBERTO PELA BASE]**; fonte oficial de cada um.

### 5.5 Frontend (HTML aprovado e JavaFX final) [BASE + LEITURA]
- [ ] **Tela burra**: nenhuma regra de negócio na tela; o **Presenter** devolve texto já formatado, "tipo/estado" e botões habilitados (Humble Object).
- [ ] Os valores em R$, datas e estados vêm **do apresentador**, testado sem janela.
- [ ] **Uma chamada ao servidor por tela** sempre que possível; carga enxuta (DTO); cache onde couber (Silveira p. 159-164).
- [ ] Layout **fluido**, sem barra de rolagem horizontal em nenhuma largura; **breakpoint** onde o conteúdo começa a pedir rolagem; imagens com `max-width: 100%` (Web Design Responsivo; A Web Mobile) no HTML.
- [ ] Texto longo **quebra dentro do espaço** e não corta (regra do `CLAUDE.md`).
- [ ] Cores, fontes e medidas **só de `tokens.css`** (ou do equivalente decidido para o JavaFX: **[NÃO COBERTO PELA BASE]**).
- [ ] Teste de heurísticas de Nielsen (prevenção de erros, estado do sistema, consistência) e teste de usabilidade com 3-5 pessoas antes de fechar a tela (Caelum).
- [ ] **JavaFX**: forma de ligar tela e apresentador, uso de FXML ou código, thread da interface, testes de tela, empacotamento: decisão do time, **[NÃO COBERTO PELA BASE]**.

---

## 6. Armadilhas (o que costuma dar errado)

1. **Deixar o framework mandar na estrutura** (pastas "controllers/services/repositories", anotações do Spring nas entidades). "O Spring não é a arquitetura" (Arquitetura Limpa cap. 21, 32).
2. **Regra de negócio na tela** (hoje no JS do protótipo; amanhã no controller do JavaFX). Vira "transaction script" e modelo anêmico (Silveira p. 81-85).
3. **Entidade = linha da tabela**, passada direto para a tela. "É um erro arquitetural" (Arquitetura Limpa p. 355; p. 220).
4. **Unificar telas só porque se parecem** (duplicação acidental): a Inadimplência e os Recebimentos parecem tabela com filtro, mas mudam por motivos diferentes (p. 219-221).
5. **Microsserviços cedo.** O custo de serviço é alto e engrossa o desacoplamento (p. 221; Silveira cap. 6.1 sobre tiers).
6. **Teste pela tela para validar regra.** Quebra a cada ajuste visual e trava a mudança ("Problema dos Testes Frágeis", p. 324-326).
7. **Mock que repete o código.** Passa mas não prova comportamento (Silveira p. 145-149).
8. **Refatorar sem teste** ou **misturar refatoração e funcionalidade** (Fowler p. 73; Feathers cap. 23).
9. **Reescrever do zero.** "Redesigns raramente são bem sucedidos" (Princípios p. 4).
10. **Otimizar por palpite** (Fowler p. 100: meça).
11. **Yagni virar desculpa** para não pensar; ou **flexibilidade especulativa** que complica (Fowler p. 94-96; cheiro "Generalidade especulativa").
12. **"Dívida técnica" como depósito.** "Adicionar item ao backlog de dívida é jeito de justificar código ruim" (Mancuso p. 47).
13. **Compartilhar entidades do servidor com o cliente JavaFX.** É um "Núcleo Compartilhado": acoplamento forte (Evans p. 40). Compartilhe apenas **contratos (DTO)**, e decida isso conscientemente [LEITURA].
14. **Muitas chamadas remotas por tela** (Silveira p. 159-164).
15. **Dois nomes para a mesma coisa** (cobrança/fatura/boleto; pagador/cliente/devedor). Quebra a linguagem ubíqua (Evans p. 11-12; Clean Code "uma palavra por conceito").
16. **Dinheiro em `double`**, soma de centavos errada, arredondar em lugar diferente [CONFIRMAR: não está na base; o protótipo já usa centavos].
17. **OAuth**: usar para autenticar; `redirect_uri` livre; sem `state`; token em texto puro; Password grant por comodidade; JWT sem assinatura (OAuth p. 47, 140, 275, 327-340).
18. **Dependência do relógio** (testes que passam hoje e falham amanhã): injetar a data (Repetível).
19. **Singleton e estáticos** escondem dependência e impedem teste; prefira injeção (Silveira cap. 4; Feathers "Encapsular referências globais").
20. **Estimativa sem faixa** ("fica pronto sexta"). Peça os três números (PERT) e **compromisso explícito** ("vou entregar") em vez de "vou tentar" (Clean Coder cap. 3 e 10).
21. **Camadas "relaxadas"**: controller que pula o caso de uso e acessa o repositório. "Controladores web nunca devem acessar repositórios diretamente" precisa de verificação automática (p. 383-386).
22. **Limite parcial esquecido**: separação "reservada" que ninguém respeita acaba apodrecendo (p. 291-295).

---

## 7. Como aplicar ao IT.MK

### 7.1 Linguagem única: glossário de domínio [LEITURA; termos do PROTÓTIPO]
O P.O. deve fechar este glossário **com o dono** antes de qualquer história. Cada termo vira nome de classe, tela e tabela.
| Termo | Significado (como aparece no protótipo) | Tipo DDD | Pontos a confirmar com o dono |
|---|---|---|---|
| **Pagador** | Pessoa ou empresa que paga o IT.MK; tem nome, telefone, situação financeira (em dia, a vencer, atraso, acordo) e **lojas** | Entidade, candidata a raiz de agregado | Chave de negócio (CPF/CNPJ?); um pagador pode ter várias lojas e várias plataformas |
| **Loja** | Loja do pagador numa plataforma (nome, CNPJ, plataforma, situação ativa/bloqueada/inativa, início) | Entidade (dentro do Pagador, ou agregado próprio) | Se bloquear loja exige consistência imediata com o pagador, ficam no mesmo agregado |
| **Plataforma / Marketplace** | Shein, Mercado Livre, Shopee, Kwai (e as que vierem) | Valor + contexto de integração | Capacidades de cada uma |
| **Competência** | Mês de referência do fechamento (ex.: 09/2026) | Objeto de valor | |
| **Faturado** | Valor vendido pela loja na competência, por uma **base de cálculo** | Objeto de valor | Quem escolhe a base e quando |
| **Cobrança** | Valor a receber de um pagador numa competência, com itens por loja, vencimento, saldo | Entidade, raiz de agregado | Estados exatos; juros/multa existem? |
| **Fechamento do mês** | Processo de apurar o faturado e gerar as cobranças da competência | Caso de uso / Serviço de aplicação | Fases (as 3 etapas da tela) |
| **Pix** | Cobrança via Pix: copia e cola, link, validade; estados gerado, enviado, pago, expirado, cancelado | Entidade vinculada à Cobrança; o **provedor** fica atrás de porta | Qual provedor |
| **Recebimento / Pagamento** | Dinheiro que entrou e foi (ou não) ligado a uma cobrança | Entidade | Regra de baixa parcial |
| **Comprovante** | Prova de pagamento enviada pelo pagador | Entidade ou anexo | Quem confere |
| **Divergência** | Pagamento que não bate: valor diferente, terceiro, fora do prazo, duplicado | Valor / Entidade | |
| **Atraso e Faixa de atraso** | Dias após o vencimento; faixas até 30, 31-60, 61-90, +90 | Valor | Faixas fixas ou configuráveis |
| **Promessa** | Data prometida de pagamento; pausa a régua | Valor/Entidade | Prazo máximo |
| **Acordo e Parcela** | Parcelamento negociado; parcelas paga/não paga; estado ativo/quebrado | Agregado (raiz Acordo, filhas Parcelas) | Soma das parcelas = valor negociado? entrada? |
| **Contestação** | Pagador diz que o valor está errado; anexa **memória de cálculo**; régua pausa; **uma pessoa decide** | Agregado (com histórico) | Prazos e resultados possíveis |
| **Memória de cálculo** | Documento que explica como o valor foi calculado | Objeto de valor/documento | |
| **Bloqueio e Desbloqueio** | Suspender/liberar a loja na plataforma por inadimplência | Comando de domínio + integração | Prazo para bloquear; quem autoriza |
| **Régua de cobrança** | Sequência de ações por dia (lembrete antes, cobrança, atraso 1/5/10 dias) | Política configurável | Passos configuráveis em Configurações |
| **Robô** | Executa a régua e responde conversas; pode ser ligado/desligado por conversa; **escala** para pessoa com motivo | Serviço de aplicação + política (não é entidade) | Modo sombra; limites do que pode fazer sozinho |
| **Conversa e Mensagem** | Canal com o pagador (WhatsApp); atribuída a pessoa ou robô | Entidade | Retenção |
| **Extrato da cobrança** | Detalhe do valor enviado ao pagador | Documento gerado | |
| **Baixa / Saída** (abas de Inadimplência) | Termos do protótipo | ? | **Significado a confirmar** |

### 7.2 Contextos delimitados e mapa [LEITURA, base: Evans cap. 4]
Hipótese de partida (a validar com o time):
1. **Cadastro** (Pagadores e Lojas)
2. **Cobrança** (Fechamento, Cobranças, Régua)
3. **Recebimento** (Pix, comprovantes, conciliação)
4. **Inadimplência** (Atraso, Acordos, Bloqueios, Contestações)
5. **Atendimento** (Conversas, Robô)
6. **Marketplaces** (conexões, faturado): **externo**, com camada anticorrupção
7. **Configurações** (régua, modelos, contas): suporte

Relações: Marketplaces **fornece** faturado a Cobrança (**Camada Anticorrupção**; o IT.MK não controla as APIs; **Conformista** só se o modelo do fornecedor for aceitável); Recebimento e Cobrança são **Parceria** (andam juntos); Inadimplência é **cliente** de Cobrança (**Cliente/Fornecedor**); Atendimento só chama casos de uso (nunca mexe em tabela de outro contexto). **Começar tudo como um aplicativo só, com limites no código** ("monolito modular"); virar serviço só com razão (Arquitetura Limpa p. 219-222).

### 7.3 Agregados propostos [LEITURA]
| Raiz | Dentro | Regras que ele protege (hipóteses) |
|---|---|---|
| **Pagador** | Lojas (se bloquear/desbloquear exigir consistência) | Situação financeira consistente com as lojas; não bloquear com contestação ativa (a confirmar) |
| **Cobrança** | Itens por loja, Pix da cobrança | Total = soma dos itens; saldo = total - pago; pagamento não excede saldo sem tratar como divergência |
| **Acordo** | Parcelas | Soma das parcelas = valor negociado; só 1 acordo ativo por pagador (a confirmar); quebrar acordo reabre cobranças |
| **Contestação** | Histórico, anexos | Só uma pessoa decide; enquanto ativa, régua pausada |
| **Conversa** | Mensagens | Atribuída a uma pessoa **ou** ao robô; escalação tem motivo |
Referência entre agregados **por identificador**, não por objeto; atualizações entre agregados podem ser assíncronas (Evans p. 25).

### 7.4 Estrutura em módulos (proposta; nomes são sugestão) [LEITURA, derivada de Arquitetura Limpa cap. 22, 26, 34]
```
itmk-dominio      Java puro: entidades, objetos de valor, regras, eventos de domínio,
                  interfaces (portas) de repositório e de integrações. Sem Spring.
itmk-aplicacao    Casos de uso (Fechar competência, Registrar pagamento, Abrir contestação...),
                  modelos de pedido/resposta. Depende só do domínio.
itmk-adaptadores  Controllers REST, repositórios (banco), clientes de marketplaces/Pix/WhatsApp,
                  apresentadores. Implementam as portas.
itmk-servidor     Main: Spring Boot, injeção de dependência, perfis (dev/teste/produção).
                  Único módulo que "conhece" o Spring.
itmk-cliente-fx   JavaFX: views burras + apresentadores; fala com o servidor por API.
                  Compartilha com o servidor só contratos (DTO), nunca entidades.
```
Dentro de cada módulo, **agrupar por assunto** (cobranca, recebimento, inadimplencia...), não por tipo técnico (R11). A base recomenda decidir "pacote por componente" ou "portas e adaptadores" conscientemente (cap. 34); a escolha é do time.

### 7.5 Eventos de domínio [BASE: Evans p. 21] aplicados [LEITURA]
`PagamentoRecebido`, `CobrancaGerada`, `CobrancaVencida`, `PromessaRegistrada`, `AcordoFechado`, `AcordoQuebrado`, `ContestacaoAberta`, `ContestacaoDecidida`, `LojaBloqueada`, `LojaDesbloqueada`, `ConversaEscalada`. São imutáveis, com data, id da entidade e quem causou. Servem para **histórico/auditoria** (o protótipo já mostra histórico na contestação) e para a régua reagir. Event Sourcing completo (guardar só eventos) é opção de arquitetura citada na base (Arquitetura Limpa p. 106; Evans p. 21), **não precisa** ser adotada.

### 7.6 A régua de cobrança: dados ou DSL? [BASE: DSL cap. 2.5; LEITURA]
O livro de DSL diz que vale quando o modelo **cresce em complexidade** e o especialista precisa **ler** as regras, e que o custo de construir **pode não compensar** em modelo simples (p. 49-52). Hoje a régua do IT.MK é uma lista de ações e dias editável em Configurações. **Recomendação**: tratar a régua como **dados validados** (passos: dia relativo ao vencimento, ação, modelo de mensagem, condição de pausa), com testes, e só avaliar uma DSL se surgirem regras condicionais difíceis de expressar em tabela. A regra de **pausa** (promessa, acordo, contestação) fica **no código do domínio**, não nos dados.

### 7.7 Robô: separar "decidir" de "enviar" [LEITURA, base: Humble Object, DIP]
- **Decidir** (domínio, testável): "para este pagador, hoje, qual a próxima ação da régua?" Entrada: situação do pagador, cobranças, estados que pausam, horário. Saída: ação ou "nada".
- **Executar** (adaptador, difícil de testar): enviar WhatsApp, gerar Pix, bloquear loja.
- **Modo sombra** (só sugere): é apenas uma implementação de "executar" que registra e não envia. Com a interface certa, trocar custa pouco.
- Ligar/desligar por conversa e escalar para pessoa são **regras de Atendimento**, com motivo registrado.

### 7.8 Segurança entre cliente JavaFX, servidor e marketplaces [LEITURA, base: OAuth]
- **IT.MK como Client** das plataformas: loja (Resource Owner) autoriza; fluxo **Authorization Code** com `redirect_uri` fixa e `state`; tokens guardados criptografados; renovação com refresh token; escopo mínimo.
- **Servidor do IT.MK como Resource Server** para o cliente JavaFX: token com expiração curta, escopos/roles (a visão é única, mas é preciso identificar **quem** fez cada ação para auditoria), limite de tentativas no login.
- **Autenticação** (quem é a pessoa): não usar OAuth sozinho; OpenID Connect ou outro método: **decisão aberta** (Supabase Auth etc. **[NÃO COBERTO POR ESTA PARTE DA BASE]**).

### 7.9 Histórias técnicas de exemplo (o dono escreve; aqui só o formato) [LEITURA]
- "Como **analista de cobrança**, quero que a régua **pare sozinha** quando houver promessa, acordo ativo ou contestação, para **não cobrar quem está negociando**." Aceite: [ ] teste cobre as 8 combinações; [ ] sem tela; [ ] motivo aparece na tela.
- "Como **dono**, quero ver o mesmo valor de **saldo** em todas as telas, para **não ter divergência de centavos**." Aceite: [ ] cálculo em um único objeto de valor; [ ] arredondamento definido e testado.
- "Como **analista**, quero que duas pessoas **não sobrescrevam** o mesmo acordo, para **não perder alteração**." Aceite: [ ] versão no registro; [ ] conflito mostra mensagem e recarrega.
- "Como **consultor**, quero conectar uma nova plataforma **sem mexer** nas regras de cobrança." Aceite: [ ] só adaptador novo e uma entrada de configuração; [ ] contrato de capacidades.

### 7.10 Riscos e dívida técnica a registrar [LEITURA]
- **Regras duplicadas** entre HTML aprovado e Java final (divergência de comportamento): mitigar com os testes de regra da seção 4.4 como "contrato".
- **Tela JavaFX** sem base de apoio: risco de decisões de padrão tomadas tarde (seção 9).
- **Livro de OAuth defasado**: risco de seguir configuração antiga.
- **Entidade grande demais** (Pagador com tudo): revisar agregados após as 2-3 primeiras histórias.
- **Medida de sucesso** (base-po §4): tempo para mudar uma regra da régua; número de bugs por regra de cobrança; % de regras de negócio com teste automático [LEITURA].

---

## 8. O que a base NÃO traz (lacunas)

| Assunto | Situação | O que fazer |
|---|---|---|
| **JavaFX** (cena, `Stage`, FXML, Scene Builder, CSS próprio, binding, `Platform.runLater`, `TableView`, empacotamento `jlink`/`jpackage`) | **Uma única menção** em toda a base (Silveira, doc_01558, como "interface rica"). Swing/AWT só como exemplo (Clean Code, Silveira) | Documentação oficial do OpenJFX. Pedir ao time decisão e protótipo de uma tela em JavaFX antes do plano |
| **MVVM, binding, "ViewModel" de framework** | Só o "ViewModel" simples do Presenter (Arquitetura Limpa); MVVM com menções soltas em outra categoria | Idem |
| **Como aplicar `tokens.css` no JavaFX** (variáveis, medidas, responsividade em janela) | Não coberto | Decisão do time; critério de aceite do P.O. |
| **Spring atual** (Spring Boot 3, Spring Security 6, resource server/JWT moderno) | Só um livro de 2017 com Spring Security OAuth2 | Documentação oficial |
| **Spring Data / JPA / Hibernate em detalhe** | Silveira dá visão geral de ORM; detalhe em `integracoes` | `docs/kb/05-integracoes.md` e fontes oficiais |
| **Supabase, Postgres, RLS, migrações** | Não nesta parte | `docs/kb/07-supabase-postgres.md` |
| **Pix, Asaas, WhatsGW, Shein, ML, Shopee, Kwai** | Não nesta parte | `docs/kb/05-integracoes.md`, `docs/kb/10-whatsgw-whatsapp.md`, docs oficiais |
| **Dinheiro: `BigDecimal` x centavos, arredondamento** | A base só diz que objeto de valor é imutável (cita `BigDecimal` como exemplo de imutável) | Decidir com o time; testar |
| **Teste de interface JavaFX** (TestFX etc.) | Não coberto | Fonte oficial |
| **LGPD / dados pessoais** (telefone, CNPJ, mensagens) | Não nesta parte | Categoria `seguranca` e jurídico |
| **Linguagens**: nada de Java/Spring/JavaFX | Os 5 livros são Lisp, Haskell, JavaScript, PL teoria, Seven Languages | Não usar para decisões de Java |

---

## 9. Perguntas para levar ao time técnico (o P.O. pergunta "por quê", base-po §1)

1. **JavaFX**: qual padrão de tela (MVC, Presenter, MVVM) e por quê? Como o `tokens.css` será respeitado? Quem desenha as telas finais, FXML ou código? Há protótipo de uma tela?
2. **Camadas**: o domínio fica **sem Spring**? Quem decide e como será verificado (teste de arquitetura, módulos separados)?
3. **Agregados**: Pagador contém Lojas ou são separados? Onde mora a regra de bloqueio?
4. **Dinheiro**: centavos inteiros ou `BigDecimal`? Arredondamento? Onde se define?
5. **Régua**: dados em tabela ou DSL? Quem edita e com que validação?
6. **Compartilhamento cliente/servidor**: só DTO ou algo mais? Como versionar o contrato entre os dois?
7. **Concorrência**: bloqueio otimista por versão (409) em quais telas?
8. **Segurança**: como a pessoa se autentica? OAuth/OpenID Connect? Onde ficam os tokens das plataformas?
9. **Testes**: quais níveis, ferramentas (JUnit, Mockito etc.: ver `desenvolvimento-agil`), quanto de cobertura mínima nas **regras**?
10. **Legado**: o que do protótipo vira Java fiel e o que será redesenhado? Quais regras do JS entram primeiro (seção 4.4)?
11. **Decisões em aberto**: onde ficam registradas e quem decide (quadro de delegação, base-po §3)?
12. **Dívida técnica**: política para não virar "backlog de dívida" (seção 3.5).

---

## 10. Fontes (caminhos na base)

Base local: `/home/user/it-hub-ia/agent-s-conhecimento/agentes_kb_pronto/`. Cada página é um arquivo `documentos/<categoria>__doc_NNNNN.md`. **Arquivo da página P = início + P - 1** (ex.: Feathers p. 36 = `arquitetura-de-software__doc_02957.md`). Páginas citadas são as do **PDF/base** (físicas), não as impressas.

| Livro | Categoria | Arquivos (documentos/) | Páginas citadas neste manual |
|---|---|---|---|
| Arquitetura Limpa (Martin) | `arquitetura-de-software` | `..._doc_00001` a `00489` (arquivo = página) | SOLID 111-130; limites 219-250; regras de negócio 260-265; limpa 273-285; humble 286-290; parciais 291-295; camadas 296; main 306; serviços 314-322; teste 323-330; banco 355; web 366; frameworks 368-371; cap. perdido 380-390 |
| Princípios de Design e Padrões (Martin) | `arquitetura-de-software` | `00005`-`02043` (início `02005`) | todas (39 p.) |
| Refatoração (Fowler, 2ª ed.) | `arquitetura-de-software` | início `02044` (fim `02523`) | cap. 2: 70-103; cap. 3: 107-125; cap. 4: 126-140; catálogo 141- |
| Trabalho eficaz com código legado (Feathers) | `arquitetura-de-software` | início `02922` (fim `03329`) | cap. 2: 36-45; cap. 4: 47-60; cap. 6: 85-105; cap. 13: 205-215; cap. 23: 320-330 |
| Domain-Driven Design Referência (Evans) | `padroes-e-design-de-software` | início `00710` (fim `00771`) | 9-62 |
| Domain Driven Design Rápido (InfoQ) | `padroes-e-design-de-software` | início `00604` (fim `00709`) | apoio (tradução automática) |
| Padrões de Projetos (GoF) | `padroes-e-design-de-software` | início `01514` (fim `01873`) | MVC 18-19; catálogo 95-300 |
| Clean Code (Martin) | `codigo-limpo` | `codigo-limpo__doc_00001` a `00462` (arquivo = página; página impressa + 31) | cap. 2: 48; cap. 3: 62; cap. 6: 124; cap. 7: 134; cap. 8: 144-151; cap. 9: 152-164; cap. 10: 166; cap. 17: 316- |
| The Clean Coder (Martin) | `padroes-e-design-de-software` | início `00221` (fim `00467`) | cap. 5: 109-114; cap. 7: 133-143; cap. 8: 148-153; cap. 10: 168-175 |
| OAuth 2.0 com Spring Security OAuth2 | `arquitetura-de-software` | início `01662` (fim `02004`) | 11-48; 57-60; 140; 170; 188; 199; 203-220; 223-233; 258-291; 292-321; 324-340 |
| SOA Aplicado | `arquitetura-de-software` | início `02524` (fim `02809`) | cap. 5: 99-115; cap. 6: 147-; cap. 7: 200- |
| DSL (Casa do Código) | `arquitetura-de-software` | início `01213` (fim `01396`) | cap. 1-2: 14-55 (em especial 49-52) |
| Introdução à arquitetura de design de software (Silveira) | `arquitetura-de-software` | início `01397` (fim `01661`) | 60-93; 94-113; 131-158; 159-174; 198-202; 213-236; JavaFX: `doc_01558` |
| The Software Craftsman (Mancuso) | `arquitetura-de-software` | início `02810` (fim `02921`) | 47; 49; 99-103 |
| UX e Usabilidade em Mobile e Web (Caelum) | `padroes-e-design-de-software` | início `02328` (fim `02492`) | heurísticas ~ 84-90; C.R.A.P. ~ 150-155; apêndice testes ~ 160- |
| Web Design Responsivo | `padroes-e-design-de-software` | início `02493` (fim `02640`) | fórmula 32-33; imagens 62-63; breakpoints 99-101 |
| A Web Mobile | `padroes-e-design-de-software` | início `00001` (fim `00220`) | cap. 13 (media queries pelo conteúdo) |
| CSS Eficiente | `padroes-e-design-de-software` | início `00468` (fim `00603`) | índice |
| Introdução e boas práticas em UX Design | `padroes-e-design-de-software` | início `01289` (fim `01513`) | índice |
| Desconstruindo a Web; BI a custo zero; Big Data | `arquitetura-de-software` | `00963`-`01212`; `00753`-`00962`; `00490`-`00752` | índice (uso baixo) |
| Linguagens (Lisp, PL, JavaScript, Haskell, Seven Languages) | `linguagens-de-programacao` | `00001`-`02612` | índice; JavaScript cap. 24 (início ~ doc_01400) |
| Índice e resumo da categoria | cada categoria | `indice.md`, `categoria_resumo.md` | listas de material |

Observações de qualidade: Arquitetura Limpa e Refatoração têm OCR de confiança média (conferir números e nomes); Silveira tem OCR sem espaços entre palavras (legível); Clean Coder tem páginas de abertura com OCR fraco; DDD Rápido é tradução automática com termos trocados ("Projeto" por "Design"); Common Lisp tem só 28 KB de texto (páginas sem texto extraível).
