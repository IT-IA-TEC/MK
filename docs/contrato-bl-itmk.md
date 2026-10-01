# Contrato entre o BL e o IT.MK: o que o BL precisa construir e devolver

Fonte: decisões do dono (02/10/2026) e itens dos lotes. Regra: o IT.MK só lê (consulta) e pede por portas. Nunca escreve no banco do BL. Nomes de tabelas, visões e portas abaixo são **propostos**; o que for "a confirmar" depende do time do BL.

## 1. Ficha do cliente no BL (o que precisa existir)
Chave do pagador: **CPF** (11 números, único). Chave da loja: **plataforma + código da loja** (único).

| Bloco | Campos | Obrigatório |
|---|---|---|
| Cliente (pessoa) | CPF, nome, WhatsApp (só números, com DDD), e-mail, ativo | CPF, nome, WhatsApp |
| Vínculo com a 40% | companhia 40, ativo, data de início, data de fim, motivo de saída (lista: Inadimplência, Pedido do cliente, Encerramento da loja ou da empresa, Outros), detalhe do motivo em texto, quem registrou | companhia, ativo, data de início |
| Pessoas ligadas | nome, papel (responsável, financeiro, sócio), telefone; um só responsável por cliente | nome, papel |
| Empresas do cliente | CNPJ (só informação; aceita letras e números), razão social, regime tributário | CNPJ |
| Lojas | plataforma (Shein, Mercado Livre, Shopee, Kwai), código da loja na plataforma (texto; na Shein é o GS), nome da loja, CPF do cliente dono, CNPJ informativo (opcional), data de início, percentual da 40% (padrão 40) | plataforma, código, nome, CPF dono |
| Etiquetas do cliente | nome, cor | não |

O que **não** fica no BL (é do IT.MK): situação de bloqueio de cobrança da loja, situação do robô, modo de cobrança, tudo de cobrança, conversa e WhatsApp.
Tabelas candidatas já existentes no BL (a confirmar): `cliente`, `empresa`, `cliente_empresa`, `vinculo_companhia`, `loja_canal`, `outbox_evento`.

## 2. Visões de leitura (só consulta)
| Visão (proposta) | Colunas |
|---|---|
| `v_carteira_40` | cpf, nome, whatsapp, email, ativo, vinculo_ativo, vinculo_inicio, vinculo_fim, motivo_saida, motivo_detalhe |
| `v_loja` | plataforma, codigo_loja, nome_loja, cpf_dono, cnpj_informativo, inicio, percentual_40 |
| `v_pessoa_ligada` | cpf_cliente, nome, papel, telefone |
| `v_conexao_loja` | plataforma, codigo_loja, situacao (Sem conexão, Aguardando autorização, Conectada, Com erro, Vencida), autorizada_em, validade, ultima_chamada_ok, ultimo_erro |
| `v_analise_loja` | analise_id, plataforma, codigo_loja, data, faixa_saude, selo, faturado, pedidos, devolucoes, violacoes (numéricos), origem de cada campo (Manual, API, Calculado, Cadastro) |
| `v_faturado_loja` | competencia, plataforma, codigo_loja, base, valor (duas casas), origem; e pedidos e notas com id externo, data e valor |
| `v_erro_integracao` | id, plataforma, codigo_loja, tipo, motivo, ocorrido_em, acao_sugerida, resolvido |

Regras: dinheiro com duas casas exatas; datas no fuso de São Paulo; paginação por chave; só o usuário de leitura do IT.MK consulta.

## 3. Portas do Java do BL (o IT.MK pede)
Todas por HTTPS, com credencial própria do IT.MK, tempo limite de 10 segundos e **efeito único** (repetir o mesmo pedido devolve o mesmo resultado).

**Pedir um Pix** · entrada: `pedido_id` (identificador da cobrança no IT.MK), `cpf`, `plataforma`, `codigo_loja`, `valor_centavos` (inteiro), `vencimento`, `parcela` e `total_parcelas`, `modo` (pagador, loja ou parcela). Saída: `pix_id`, `identificador_provedor`, `copia_e_cola`, `link`, `validade`, `estado`. Erros do negócio: valor inválido, provedor indisponível, pedido repetido com dados diferentes.
**Cancelar ou remover um Pix** · entrada: `pix_id`. Saída: `estado` (Cancelado ou Expirado). Erro: Pix já pago não cancela.
**Pedir reconexão de uma loja** · entrada: `plataforma`, `codigo_loja`. Saída: `situacao` e, quando houver, o link de autorização para o vendedor.

## 4. Evento de pagamento (o IT.MK escuta)
Campos: `evento_id` (único), `pix_id`, `pedido_id`, `valor_centavos`, `pago_em`, `provedor`, `pagador_nome`, `pagador_documento_mascarado`. Entrega pelo menos uma vez; evento repetido tem o mesmo `evento_id`; o IT.MK pode reler eventos por intervalo de datas.

## 5. Evento de mudança da ficha
Campos: `evento_id` (único), `tipo` (vinculo_entrou, vinculo_saiu, cliente_alterado, loja_alterada), `cpf`, `plataforma`/`codigo_loja` quando for de loja, `ocorrido_em`, `motivo_saida` e `motivo_detalhe` quando for saída. Mesma garantia do evento de pagamento.

## 6. Acesso e segurança
- Usuário só de leitura (SELECT) nas visões acima, sem acesso a nenhuma outra tabela. Um teste prova que escrever, alterar ou apagar é recusado.
- Credenciais entregues por canal seguro, fora do repositório e do log, com data de troca combinada.
- Limite de pedidos por segundo e corte automático quando o BL demora, para o IT.MK nunca sobrecarregar o BL.

## 7. VPS do IT.MK
Acesso por chave (SSH) com usuário comum (não root) com permissão de administrar; sistema operacional e versão; IP fixo; endereço HTTPS com certificado; porta 443 aberta e a do banco fechada; cópia de segurança. Tamanho mínimo (CPU, memória, disco) a definir pelo time técnico.

## 8. Pontos a confirmar pelo BL
Nome real das tabelas e visões; se `loja_canal` serve para as lojas; se `outbox_evento` serve para os eventos; como o BL registra o motivo de saída hoje; limites de pedidos por minuto aceitos.
