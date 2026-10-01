# Decisões aprovadas pelo dono (01/10/2026)
1. Provedor de Pix: começar pelo **Asaas**; pedir o Banco Inter em paralelo (exige análise do banco). As duas opções ficam na tela de Configurações.
2. Titular da conta que recebe: a definir pelo dono (fica como decisão aberta registrada no lote).
3. Servidor na **nuvem**, com **IP fixo**, aceitando certificado de cliente (Inter e Shopee exigem).
4. Login do **Supabase**, com servidor Spring no meio. O app JavaFX nunca guarda chave do banco. A Data API do Supabase fica desligada.
5. Supabase plano **Pro**, dois ambientes separados (teste e produção), cópia diária.
6. Prazo do Pix depois do vencimento: **30 dias**. No Asaas o QR vale 12 meses, então o sistema remove a cobrança ao fim do prazo. No Inter existe o campo validadeAposVencimento.
7. Juros e multa **desligados** por padrão; valores quando ligar são do dono.
8. Divergência de Pix: uma pessoa decide cada caso. **Nunca devolver sozinho.**
9. Comprovante em PDF continua só para quem paga por fora do link. Primeiro mês em **modo paralelo** (Pix automático + conferência manual).
10. WhatsApp do robô: **número exclusivo**, modo QR com limites baixos por pouco tempo, planejar o modo Oficial. A WhatsGW não tem limite diário, horário, feriado nem opt-out: o IT.MK constrói.
11. Ordem dos conectores: Shopee, Mercado Livre, Shein, Kwai (Kwai só depois de ter a documentação).
12. Guarda da auditoria e pedido de apagar dado pessoal: depende de **parecer jurídico**; até lá a auditoria não tem prazo.
Outras já decididas antes: sem versão para celular por enquanto; visão única (sem perfis); valor em R$ exato (numeric no banco, BigDecimal ou centavos em Java); Pix de valor fixo não aceita pagamento parcial e parcelamento usa um Pix por parcela; qualquer usuário aprova a fila do robô; ajuste depois do fechamento está fora do plano; Robô ON/OFF das Conversas não muda.
