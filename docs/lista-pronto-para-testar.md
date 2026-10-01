# Frontend: o que marcar como "Pronto para testar"

Atualizado em 02/10/2026. Vale para o desenho publicado (versão 27): https://claude.ai/artifact/Jih1qLD6m7uynDak7grpg2

**Importante:** "Pronto para testar" quer dizer que o desenho cumpre o item. Não é "Aceito". Aceitar só depois de testar no sistema final em Java.

**Como conferi:** o desenho foi testado tela por tela e aba por aba nas larguras 1920, 1600, 1360 e 1100, sem erro e sem rolagem lateral. Para esta lista, cruzei os 114 itens do lote do Frontend com o que existe no desenho e separei os 8 que têm um motivo para esperar. **Não reabri os critérios de cada um dos 106 itens agora.** Se um critério não bater quando você olhar, devolva o item com o motivo.

## 1. Pode marcar como "Pronto para testar" (106 itens)


**Base visual e navegação**
- [ ] Identidade visual e padrões de cor
- [ ] Menu lateral com nove módulos
- [ ] Tela de login
- [ ] Cartões, abas e botões padrão
- [ ] Tabelas com colunas proporcionais
- [ ] Janelas, gavetas e avisos
- [ ] Filtro único de busca

**Carteira de clientes**
- [ ] Tela da lista da carteira
- [ ] Ícone da plataforma e selo da análise em cada loja
- [ ] Cadastro de novo pagador (hoje: "Levar o cadastro de novo pagador à ficha do BL")
- [ ] Filtros por situação da loja e financeira
- [ ] Filtro por situação do robô
- [ ] Selo Robô não atende na tabela

**Ficha do pagador**
- [ ] Resumo financeiro da ficha
- [ ] Acompanhamento e promessa
- [ ] Acordo e parcelas
- [ ] Comprovantes
- [ ] Linha do tempo
- [ ] Pessoas ligadas e regras
- [ ] Bloco Lojas de marketplace
- [ ] Bloco Histórico de análises
- [ ] Modo de cobrança por pagador
- [ ] Bloco Robô

**Conexões e aplicativos dos marketplaces**
- [ ] Aba Conexões com subabas por plataforma
- [ ] Segredos só de gravação
- [ ] Convite ao cliente

**Ficha da loja**
- [ ] Aba Lojas com filtro único
- [ ] Ficha da loja em três modos
- [ ] Modo Preencher com abas por assunto
- [ ] Campos manuais com selo de origem
- [ ] Aba de devoluções por tipo de loja da Shein
- [ ] Abas de produtos, preços e marketing
- [ ] Abas de diagnóstico e desempenho
- [ ] Aba Financeiro da loja
- [ ] Salvar análise
- [ ] Selo da análise

**Relatório da análise**
- [ ] Modo Relatório de uma página
- [ ] Comparação com a análise anterior
- [ ] Modo Comparar duas análises
- [ ] Visão do cliente na aba Análise
- [ ] Comparação entre as plataformas
- [ ] Painel geral da carteira

**Faturamento por base**
- [ ] Aba Faturamento com totais por base
- [ ] Quadro da base de cada loja
- [ ] Lista de pedidos e notas
- [ ] Botão Usar no Fechamento

**Fechamento do mês**
- [ ] Etapa de faturamento por loja
- [ ] Alterar base com alcance e duração
- [ ] Histórico de mudança de base
- [ ] Etapa de conferência
- [ ] Etapa de envio com prévia
- [ ] Agendamento do envio automático
- [ ] Situação do Pix por pagador

**Memória de cálculo**
- [ ] Memória de cálculo da cobrança
- [ ] Versões do cálculo
- [ ] Extrato da cobrança

**Recebimentos**
- [ ] Aba Pix automático
- [ ] Aba Divergentes
- [ ] Resolver divergência
- [ ] Aba A conferir
- [ ] Aba Sem cobrança ligada
- [ ] Aba Conferidos
- [ ] Aba Lançar pagamento

**Configurações**
- [ ] Dados de recebimento com Asaas ou Banco Inter
- [ ] Testar conexão do Pix
- [ ] Validade do link, juros e multa
- [ ] Régua de cobrança
- [ ] Modelos de mensagem
- [ ] Usuários e permissões
- [ ] Dados da empresa
- [ ] Etiquetas e bloqueio de lojas
- [ ] Histórico de alterações

**Inadimplência e acordos**
- [ ] Aba Em atraso
- [ ] Aba Acordos
- [ ] Aba Bloqueios
- [ ] Aba Pedidos de saída
- [ ] Aba Baixas
- [ ] Aba Relatórios

**Contestações**
- [ ] Aba Contestações
- [ ] Nova contestação
- [ ] Detalhe da contestação

**Conversas**
- [ ] Tela de três colunas
- [ ] Lista com abas e etiquetas
- [ ] Conversa com texto, áudio e imagem
- [ ] Botão Robô ON/OFF
- [ ] Selo Robô nas mensagens
- [ ] Assumir conversa e devolver ao robô
- [ ] Ficha ao lado, Contestar e Memória de cálculo

**Robô de cobrança**
- [ ] Painel do robô
- [ ] Indicador do WhatsApp conectado
- [ ] Pausar robô geral
- [ ] Fila de aprovação
- [ ] Atendimento humano
- [ ] Pagadores do robô com ações em lote
- [ ] Regras e limites
- [ ] Modo teste com simulador
- [ ] Modo sombra
- [ ] Auditoria

**Dashboard**
- [ ] Números do período
- [ ] Andamento do mês
- [ ] Fila do dia
- [ ] Pendências de decisão
- [ ] Alertas de dado
- [ ] Rankings e gráfico

**Qualidade das telas**
- [ ] Conferência de largura de tela de computador
- [ ] Texto justificado e quebra de linha

## 2. Não marcar ainda (8 itens)

| Item | Por quê |
|---|---|
| Cadastro da conexão (Conexões e aplicativos dos marketplaces) | a validade do Mercado Livre e da Kwai ainda está "a confirmar" |
| Aba Aplicativos (Conexões e aplicativos dos marketplaces) | a conta dona do aplicativo do Mercado Livre e a documentação da Kwai ainda estão "a confirmar" |
| Abas de catálogo e violações (Ficha da loja) | os campos do Mercado Livre e da Kwai ainda estão "a confirmar" |
| Faixa de saúde única (Relatório da análise) | a correspondência de cores do Mercado Livre ainda está "a confirmar" |
| Exportar PDF (Relatório da análise) | o PDF de verdade só existe no sistema final em Java; no desenho há só o botão |
| Coluna Base com seletor (Fechamento do mês) | as bases que a Kwai entrega ainda estão "a confirmar" |
| Regras padrão e base padrão (Configurações) | um critério ainda fala em "dias até bloquear", regra antiga que mudou; precisa de ajuste no item antes |
| Foco e navegação por teclado (Qualidade das telas) | o teste da tecla Tab ainda não foi feito |

## Atualização de 02/10/2026
Teste de teclado feito: Tab percorre os campos sem travar nem cair em elemento invisível, Esc fecha gavetas, janelas e menus, e Enter abre a linha (Pagadores, lojas em Marketplaces e Conversas). Achei e corrigi um defeito: Enter na linha de Pagadores abria a ficha e fechava na hora. O item **Foco e navegação por teclado** pode ir para Pronto para testar (108 itens).
