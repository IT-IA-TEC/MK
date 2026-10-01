# Adendo 1 à especificação v3 para o BL

Data 02/10/2026. Acrescenta o que as telas do IT.MK precisam e que a v3 não trazia. A v3 continua valendo; este adendo só soma. Tudo só leitura para o IT.MK, salvo as portas.

## 1. Pix: validade do link, juros e multa ficam no BL (decisão do dono)
O usuário configura no Java do BL, junto com o Pix: validade do link depois do vencimento (padrão 30 dias), juros e multa (desligados por padrão; multa uma vez em %, juros ao mês em %). Cada mudança guarda quem, quando, valor antigo e novo (só inserção) e vale daqui para frente. Ligar exige motivo. A porta de pedir Pix **não recebe** esses valores: o BL aplica o que estiver configurado.

## 2. Visões novas
| Visão | Colunas |
|---|---|
| `v_config_pix` | provedor_ativo (Asaas ou Banco Inter), ambiente (teste ou producao), chave_pix, validade_link_dias, juros_multa_ligado, multa_pct, juros_pct_mes, situacao_aviso (Recebendo ou Não está recebendo), ultimo_pix_recebido_em, ultimo_pix_recebido_valor |
| `v_aplicativo_marketplace` | plataforma, identificador_app, situacao_aprovacao (Não solicitado, Em revisão, Aprovado, Reprovado), endereco_retorno, ips_liberados, tipo_app (Shopee: ERP), criado_em, ultima_troca_segredo_em, lojas_conectadas. **Nunca o segredo** |
| `v_pedido_loja` | plataforma, codigo_loja, data, numero, situacao, valor_produtos, frete, desconto, total |
| `v_nota_loja` | plataforma, codigo_loja, data, numero, serie, chave_acesso, pedido_numero, valor |

## 2.1 Colunas que faltavam nas visões da v3
- `v_conexao_loja`: acrescentar login, nome_publico, id_externo, tipo_loja (Shein: auto-operada, semi ou full-gerenciada), tipo_vendedor (Shopee: CPF ou CNPJ), quem_autorizou, permissoes_concedidas, atualizado_em, atualizado_por.
- `v_faturado_loja`: acrescentar origem_aliquota (loja, regime ou padrao), fonte (de onde veio o número) e periodo_fonte (início e fim do período lido). A memória de cálculo da cobrança usa esses três.
- `v_regra_calculo`: a alíquota passa a vir em três níveis: aliquota_padrao, aliquota_por_regime (regime tributário e alíquota) e excecoes_por_loja (plataforma, codigo_loja, percentual_40, aliquota, base).

## 3. Porta nova
**Testar a conexão do Pix.** Entrada: nenhuma além da credencial do IT.MK. Saída: resultado do teste em texto simples (por exemplo, certificado vencido, chave errada ou escopo faltando), situacao_aviso e ultimo_pix_recebido. Efeito único e sem custo; não gera Pix.

## 4. Decisões do dono já fechadas (resumo)
Vínculo da 40% direto no cliente (CPF); `loja_canal` generalizada por migração; alíquota configurável por loja, em lote, para todas as lojas e por regime (vence o mais específico: loja, regime, padrão); congelamento da competência configurável.
