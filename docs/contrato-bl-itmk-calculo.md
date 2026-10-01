# Complemento do contrato BL e IT.MK: o cálculo da cobrança fica no BL

Decisão do dono (02/10/2026). Este arquivo complementa `contrato-bl-itmk.md` (que não foi alterado).

## O que o BL passa a fazer
1. Guardar o **faturado** por loja, base e competência (inclusive importar planilha e corrigir à mão).
2. Ter no Java do BL os campos de **configuração**: percentual da 40% (padrão 40, com exceção por loja), **alíquota do imposto** e **base de cálculo** (padrão e por loja).
3. **Calcular** o imposto e o valor da 40% a pagar: valor da 40% = imposto × percentual da loja, duas casas, regra única de arredondamento. Alíquota = imposto ÷ faturado (só para conferir).
4. Guardar o **histórico** de troca de base e de percentual (só inserção) e a **versão** de cada cálculo (recalcular cria versão nova; a antiga fica Substituída).

## O que o IT.MK passa a fazer
Só **lê** o resultado, **confere** (valor da 40% = imposto × percentual) e **cobra**. Não edita faturado, base, percentual nem importa planilha.

## Visões de leitura (acrescentam ou ampliam as do contrato)
| Visão | Colunas |
|---|---|
| `v_faturado_loja` (ampliada) | competencia, plataforma, codigo_loja, base, faturado, imposto, aliquota, percentual_40, valor_40 (duas casas), versao_calculo, origem |
| `v_regra_calculo` (nova) | percentual_40_padrao, base_padrao, excecoes_por_loja (plataforma, codigo_loja, percentual_40, base), vigente_desde |
| `v_historico_base` (nova) | plataforma, codigo_loja, quem, quando, base_antiga, base_nova, alcance, duracao, competencia |

## O que continua no IT.MK
Dia do vencimento, tolerância do comprovante, parcelamento, prazo de bloqueio (último dia do mês do vencimento), régua, modelos de mensagem, conferência de cada linha, fechamento da competência e envio da cobrança.

## Pontos a confirmar pelo BL
Nomes reais das tabelas e visões; como o BL guarda hoje o percentual e a alíquota; se já existe importação de planilha.
