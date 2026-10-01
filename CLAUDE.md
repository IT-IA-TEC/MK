# Regras do projeto IT.MK

## Como se comunicar com o dono do projeto
- O dono não é desenvolvedor. Use linguagem simples, direta e curta. Sem termos técnicos e sem enrolação.
- Faça só o que for pedido. Quando ele mandar algo "só para conhecimento", apenas registre.
- Toda vez que mexer no visual, publique o protótipo e envie o link de preview (é por ele que o dono acompanha).

## Regra máxima de layout (vale para todos os módulos e telas)
1. Nunca deixar espaço vazio. O conteúdo ocupa toda a largura da página, sem limite de largura máxima.
2. Nunca colocar mais coisa do que cabe na área visível. Nada pode gerar barra de rolagem horizontal, em nenhuma largura de tela (computador, tablet e celular).
3. Texto longo quebra linha dentro do seu espaço. Não pode ser cortado nem empurrar a página.
4. Linhas, cartões e colunas se distribuem para preencher a largura, e blocos de tamanhos diferentes se encaixam sem buracos.

## Visão única (vale para todos os módulos)
- Não existem perfis, níveis de acesso nem modo "colaborador" ou "diretor" nas telas. Existe uma única visão geral, sempre completa, com todas as informações (valores em R$, filas, contagens e rankings).
- Nunca usar os nomes "diretor", "CEO" ou "colaborador" na interface. Se chegar algum pedido com esses nomes, descartar a separação e incluir tudo na visão geral.
- Nada redundante: a mesma informação não aparece duas vezes. Uma tela só, contendo tudo.

## Identidade visual
- Segue a identidade IT.MK (cores, fontes, raios e movimento) definida em `prototipo/css/tokens.css`. Só esse arquivo define cores e medidas.

## Tecnologia final
- Java + JavaFX + CSS + Spring. O HTML em `prototipo/` é o desenho aprovado. Depois de fechado, cada tela é refeita em JavaFX com as mesmas cores e medidas.

## Base de método para planos e estrutura
- Todo plano, estrutura, backlog ou roteiro pedido pelo dono segue `docs/base-po.md` (resumo dos 4 materiais de Product Owner enviados pelo dono) e é sempre voltado ao IT.MK.
- Use o modelo da seção 10 desse arquivo: visão e meta, partes interessadas, valor, roadmap com datas, histórias e épicos, critérios de aceite, prioridade, plano de versões, riscos e o que não foi verificado, acompanhamento.

## Base de conhecimento dos agentes
- Mapa em `docs/kb-mapa.md` (repositório IT-HUB-IA/Agent-s-Conhecimento, 89 mil arquivos) e manuais prontos em `docs/kb/`.
- Antes de montar plano de qualquer frente (Frontend, Backend, Database, Integrações), leia o manual da frente em `docs/kb/` e busque no repositório o que faltar. O que a base não cobre (ex.: Supabase, WhatsGW) deve ser dito como "não coberto pela base".
