/* Dados de exemplo. Na integração com o Java, este arquivo é substituído pelos dados reais. */
window.MK_DADOS={
  vendidoHoje:"R$ 38.420", variacao:"12%",
  kpis:[{t:"A despachar",n:"62",nota:"14 com prazo até 18h"},{t:"Notas do dia",n:"128 /130",nota:"2 travadas por CFOP"},{t:"Anúncios no ar",n:"1.204",nota:"86 pausados"}],
  canais:[{sigla:"ML",nome:"Mercado Livre",pct:44},{sigla:"SH",nome:"Shopee",pct:20},{sigla:"AM",nome:"Amazon",pct:18},{sigla:"MG",nome:"Magalu",pct:18}],
  pedidos:[
    {canal:"ML",titulo:"Fone bluetooth TWS Pro — preto",cod:"#2000418812 · 2 UN",etapa:"Nota pendente",tipo:"atencao",prazo:"hoje, 18h",valor:"R$ 389,80"},
    {canal:"SH",titulo:"Kit 3 camisetas algodão pima",cod:"#SP-77120934 · 1 UN",etapa:"Embalar",tipo:"curso",prazo:"hoje, 20h",valor:"R$ 147,00"},
    {canal:"AM",titulo:"Cafeteira italiana inox 6 doses",cod:"#AMZ-4410-B · 1 UN",etapa:"Coletar",tipo:"curso",prazo:"amanhã",valor:"R$ 219,90"},
    {canal:"MG",titulo:"Luminária de mesa articulada",cod:"#MGL-90231 · 1 UN",etapa:"Travado",tipo:"travado",prazo:"sem CFOP",valor:"R$ 98,50"}
  ],
  menu:[
    {id:"dashboard",nome:"Dashboard",icone:"layout-dashboard"},
    {id:"conversas",nome:"Conversas",icone:"messages-square"},
    {id:"pagadores",nome:"Pagadores e Lojas",icone:"store"},
    {id:"fechamento",nome:"Fechamento do mês",icone:"calendar-check"},
    {id:"recebimentos",nome:"Recebimentos",icone:"wallet"},
    {id:"inadimplencia",nome:"Inadimplência e Acordos",icone:"handshake"},
    {id:"configuracoes",nome:"Configurações",icone:"settings"}
  ]
};

/* ---- Dashboard: dados de exemplo ---- */
window.MK_DASH={
  periodos:{
    mes:{rotulo:"Setembro de 2026 (mês atual)",cobrado:[412860,186],recebido:[318240,141],avencer:[24300,12],vencido:[70320,33],pont:[82,116,141]},
    ago:{rotulo:"Agosto de 2026",cobrado:[398410,181],recebido:[391870,176],avencer:[0,0],vencido:[6540,5],pont:[88,155,176]},
    jul:{rotulo:"Julho de 2026",cobrado:[376900,177],recebido:[371200,174],avencer:[0,0],vencido:[5700,3],pont:[85,148,174]},
    tri:{rotulo:"Últimos 3 meses",cobrado:[1188170,544],recebido:[1081310,491],avencer:[24300,12],vencido:[82560,41],pont:[85,419,491]}
  },
  cobrancas:[
    {p:"Aurora Utilidades Ltda",l:["Aurora Casa","Aurora Moda"],v:18420,st:"pago",em:"dia 18",d:0},
    {p:"Vértice Comércio ME",l:["Vértice Sul"],v:9870,st:"pago",em:"dia 22",d:2},
    {p:"Marina Costa Magalhães",l:["MC Presentes"],v:4310,st:"vencido",d:11},
    {p:"Grupo Sol Nascente",l:["Sol Bebê","Sol Pet","Sol Fit"],v:26540,st:"vencido",d:24},
    {p:"Fênix Eletro Ltda",l:["Fênix Eletro"],v:12980,st:"avencer",d:-4},
    {p:"Tempero & Cia",l:["Tempero Gourmet"],v:3620,st:"avencer",d:-2},
    {p:"Norte Sports Ltda",l:["Norte Sports","Norte Outlet"],v:15200,st:"pago",em:"dia 20",d:0},
    {p:"Lucas Bittencourt",l:["LB Games"],v:2890,st:"vencido",d:6}
  ],
  envio:{x:174,y:186,falta:["Fênix Eletro Ltda","Tempero & Cia","Lucas Bittencourt","Casa Bela Decor","Pet Mundo Ltda","Grupo Horizonte","Studio Lume","Ana Paula Ribeiro","Bruno Tavares ME","Clínica Vida Fit","Ótica Central","Papelaria Nova Era"]},
  receb:{x:141,y:186},
  comprovantes:{chegaram:19,aguardam:7},
  fila:{
    cobrar:[
      {p:"Fênix Eletro Ltda",l:["Fênix Eletro"],v:12980,d:0,n:"Vence hoje"},
      {p:"Grupo Sol Nascente",l:["Sol Bebê","Sol Pet","Sol Fit"],v:26540,d:24,n:"Entrou na etapa 3 da régua"},
      {p:"Marina Costa Magalhães",l:["MC Presentes"],v:4310,d:11,n:"Entrou na etapa 2 da régua"},
      {p:"Lucas Bittencourt",l:["LB Games"],v:2890,d:6,n:"Entrou na etapa 2 da régua"},
      {p:"Tempero & Cia",l:["Tempero Gourmet"],v:3620,d:0,n:"Vence hoje"}
    ],
    promessas:[
      {p:"Casa Bela Decor",l:["Bela Casa","Bela Kids"],v:8450,d:3,n:"Prometeu pagar em 27/09"},
      {p:"Pet Mundo Ltda",l:["Pet Mundo"],v:5120,d:0,n:"Prometeu pagar hoje"},
      {p:"Studio Lume",l:["Lume Beleza"],v:1980,d:9,n:"Prometeu pagar em 21/09"}
    ],
    retornos:[
      {p:"Grupo Horizonte",l:["Horizonte Tech","Horizonte Home"],v:19300,d:15,n:"Retorno combinado às 14h"},
      {p:"Ana Paula Ribeiro",l:["APR Acessórios"],v:2240,d:4,n:"Retorno combinado às 16h30"}
    ],
    parcelas:[
      {p:"Bruno Tavares ME",l:["BT Ferramentas"],v:2100,d:5,n:"Parcela 3 de 6 do acordo"},
      {p:"Clínica Vida Fit",l:["Vida Fit Loja"],v:1750,d:0,n:"Parcela 2 de 4 vence hoje"},
      {p:"Ótica Central",l:["Ótica Central","Ótica Kids"],v:3400,d:12,n:"Parcela 1 de 5 do acordo"}
    ],
    mensagens:[
      {p:"Marina Costa Magalhães",l:["MC Presentes"],v:4310,d:11,n:"Escreveu há 5h: “já fiz o pix, podem conferir?”"},
      {p:"Papelaria Nova Era",l:["Nova Era"],v:6240,d:0,n:"Escreveu há 2h: “vocês mandaram o boleto errado”"},
      {p:"Norte Sports Ltda",l:["Norte Sports"],v:15200,d:0,n:"Escreveu ontem: “preciso da nota do mês”"},
      {p:"Lucas Bittencourt",l:["LB Games"],v:2890,d:6,n:"Escreveu ontem: “consigo pagar dia 5”"}
    ]
  },
  pend:{
    comprovantes:[
      {p:"Marina Costa Magalhães",v:4310,dest:"Conta principal · Itaú 4471",comp:"09/2026"},
      {p:"Casa Bela Decor",v:8450,dest:"Conta principal · Itaú 4471",comp:"08/2026"},
      {p:"Pet Mundo Ltda",v:5120,dest:"Conta de terceiro · confirmar",comp:"09/2026"},
      {p:"Studio Lume",v:1980,dest:"Conta principal · Itaú 4471",comp:"09/2026"},
      {p:"Ótica Central",v:3400,dest:"Conta principal · Itaú 4471",comp:"Acordo, parcela 1"}
    ],
    bloquear:[
      {p:"Grupo Sol Nascente",l:"Sol Bebê, Sol Pet, Sol Fit",d:24,v:26540},
      {p:"Grupo Horizonte",l:"Horizonte Tech, Horizonte Home",d:15,v:19300},
      {p:"Ótica Central",l:"Ótica Kids",d:12,v:3400}
    ],
    desbloquear:[
      {p:"Norte Sports Ltda",l:"Norte Outlet",q:"Quitou em 19/09",v:6420},
      {p:"Vértice Comércio ME",l:"Vértice Sul",q:"Quitou em 22/09",v:9870}
    ],
    saidas:[
      {p:"Loja Recanto Verde",falta:14800,parc:"3 cobranças em aberto",st:"Aguardando quitação"},
      {p:"Estúdio Pixel Ltda",falta:0,parc:"Tudo quitado",st:"Falta confirmar saída"}
    ]
  },
  alertas:[
    {i:"message-square-off",t:"Conversas sem dono ou invisíveis",n:6,d:"Ninguém responde por elas hoje."},
    {i:"phone-forwarded",t:"Troca de número informada",n:3,d:"O pagador avisou um número novo e o cadastro ainda tem o antigo."},
    {i:"unlink",t:"Pagamento sem cobrança ligada",n:2,d:"Entrou dinheiro que não bate com nenhuma cobrança."},
    {i:"circle-alert",t:"Cobrança do mês com valor estranho",n:4,d:"3 faturadas sem imposto e 1 com alíquota fora do padrão."}
  ],
  rank:{
    devedores:[["Grupo Sol Nascente",26540],["Grupo Horizonte",19300],["Casa Bela Decor",8450],["Papelaria Nova Era",6240],["Pet Mundo Ltda",5120]],
    pagadores:[["Aurora Utilidades Ltda",18420],["Norte Sports Ltda",15200],["Vértice Comércio ME",9870],["Fênix Eletro Ltda",8600],["Tempero & Cia",7410]],
    evolucao:[["Abr",352000,331000],["Mai",361500,349800],["Jun",369200,358100],["Jul",376900,371200],["Ago",398410,391870],["Set",412860,318240]]
  }
};

/* ---- Pagadores e Lojas: dados de exemplo ---- */
window.MK_PAG=[
  {id:1,nome:"ADRIANO APARECIDO SANTOS PEREIRA",fone:"(11) 98214-3307",fin:"dia",lojas:[{n:"49.962.836 KARINE CONCEICAO PEREIRA",gs:"49962836000166",st:"ativa",plat:"Shein",ini:"12/03/2024"},{n:"ADRIANO APARECIDO SANTOS PEREIRA",gs:"37930011000180",st:"ativa",plat:"Shein",ini:"05/08/2023"},{n:"LOJA KP MODAS LTDA",gs:"56011980000182",st:"inativa",plat:"Mercado Livre",ini:"20/01/2025"}]},
  {id:2,nome:"ADRIANO BESERRA DE MELO",fone:"(21) 99471-0825",fin:"atraso",lojas:[{n:"55.610.150 ADRIANO BESERRA DE MELO",gs:"55610150000109",st:"bloqueada",plat:"Shein",ini:"02/10/2024"}]},
  {id:3,nome:"ADRIANO PEREIRA DA SILVA",fone:"(31) 98833-4172",fin:"avencer",lojas:[{n:"46.843.469 ADRIANO PEREIRA DA SILVA",gs:"46843469000193",st:"ativa",plat:"Shein",ini:"17/06/2024"}]},
  {id:4,nome:"ADRIELE ALVES LOPES",fone:"(41) 99120-6654",fin:"acordo",lojas:[{n:"59.164.241 MARIA LEIDE ALVES DE SAO JOSE PAES",gs:"59164241000119",st:"ativa",plat:"Shein",ini:"08/02/2025"},{n:"50.941.212 ADRIELE ALVES LOPES",gs:"50941212000141",st:"bloqueada",plat:"Shopee",ini:"30/09/2024"}]},
  {id:5,nome:"AGNES RUESCAS",fone:"(11) 97652-2049",fin:"dia",lojas:[{n:"AR MODAS LTDA",gs:"42744784000102",st:"ativa",plat:"Shein",ini:"14/11/2023"}]},
  {id:6,nome:"AIRAM MATOS SOUZA",fone:"(71) 98705-1936",fin:"atraso",lojas:[{n:"AIRAM MATOS SOUZA",gs:"59837967000175",st:"ativa",plat:"Amazon",ini:"25/04/2025"}]},
  {id:7,nome:"ALAN ARRUDA MARQUES OLIVEIRA",fone:"(62) 99388-7410",fin:"dia",lojas:[{n:"REVORA LTDA",gs:"57774714000174",st:"ativa",plat:"Shein",ini:"11/12/2024"},{n:"OLIVEIRA COMERCIO & SERVICOS LTDA",gs:"64678234000175",st:"ativa",plat:"Magalu",ini:"03/07/2025"}]},
  {id:8,nome:"ALANA SOUZA OLIVEIRA",fone:"(85) 98246-5581",fin:"dia",lojas:[{n:"ASO MODAS LTDA",gs:"54967390000100",st:"ativa",plat:"Shein",ini:"19/05/2024"}]},
  {id:9,nome:"ALBERTO NUNES DE CARVALHO",fone:"(19) 99764-3018",fin:"acordo",lojas:[{n:"ANC COMERCIO DE CALCADOS LTDA",gs:"48120356000131",st:"bloqueada",plat:"Shein",ini:"22/08/2023"},{n:"ALBERTO NUNES DE CARVALHO",gs:"33851204000158",st:"inativa",plat:"Shopee",ini:"09/01/2024"}]},
  {id:10,nome:"ALESSANDRA REZENDE PRADO",fone:"(27) 98157-9243",fin:"avencer",lojas:[{n:"ARP BOUTIQUE LTDA",gs:"61094425000147",st:"ativa",plat:"Shein",ini:"28/03/2025"}]},
  {id:11,nome:"ALEXANDRE TEIXEIRA GOMES",fone:"(51) 99602-8837",fin:"atraso",lojas:[{n:"ATG STORE LTDA",gs:"52736810000120",st:"bloqueada",plat:"Shein",ini:"15/07/2024"},{n:"GOMES E TEIXEIRA COMERCIO LTDA",gs:"58204971000166",st:"ativa",plat:"Mercado Livre",ini:"01/02/2025"},{n:"ALEXANDRE TEIXEIRA GOMES",gs:"29417803000112",st:"ativa",plat:"Shein",ini:"10/04/2023"}]},
  {id:12,nome:"ALICE FERNANDES CAMPOS",fone:"(48) 98413-2276",fin:"dia",lojas:[{n:"AFC MODA FEMININA LTDA",gs:"60318742000190",st:"ativa",plat:"Shein",ini:"06/06/2025"}]},
  {id:13,nome:"ALINE BARROS DE ANDRADE",fone:"(81) 99235-6690",fin:"atraso",lojas:[{n:"ABA CONFECCOES LTDA",gs:"47905263000138",st:"ativa",plat:"Shein",ini:"13/09/2023"},{n:"ALINE BARROS DE ANDRADE",gs:"41628359000104",st:"inativa",plat:"Amazon",ini:"27/02/2024"}]},
  {id:14,nome:"ALISSON MOREIRA DUARTE",fone:"(16) 98879-1504",fin:"acordo",lojas:[{n:"AMD IMPORTADOS LTDA",gs:"56482130000177",st:"ativa",plat:"Shein",ini:"21/10/2024"}]}
];

/* estado extra dos pagadores (atraso, promessa, retorno) */
(function(){
  var dias={2:11,6:6,11:24,13:15},prom={2:"03/10/2026",11:"05/10/2026",13:"02/10/2026"},ret={2:"02/10 às 14h",13:"01/10 às 10h30"};
  window.MK_PAG.forEach(function(p){if(dias[p.id])p.dias=dias[p.id];if(prom[p.id])p.promessa={data:prom[p.id]};if(ret[p.id])p.retorno=ret[p.id]});
})();

/* ---- Conversas: dados de exemplo ---- */
window.MK_ATEND=["Marina","Rafael","Juliana","Carlos"];
window.MK_ETQ=["VIP","Negociação","Reclamação","Novo cliente"];
window.MK_CONV=[
  {id:1,pag:1,dono:"Marina",etq:["VIP"],un:2,msgs:[
    {de:"p",t:"txt",x:"Boa tarde! Já recebi a cobrança de setembro.",h:"16:40",d:"Ontem"},
    {de:"e",t:"txt",x:"Boa tarde, Adriano! Qualquer dúvida sobre as lojas é só chamar.",h:"16:52",d:"Ontem"},
    {de:"p",t:"txt",x:"Consegue me mandar o total das três lojas separado?",h:"09:10",d:"Hoje"},
    {de:"p",t:"aud",x:"0:12",h:"09:11",d:"Hoje"}]},
  {id:2,pag:2,dono:"Rafael",etq:["Negociação"],un:0,msgs:[
    {de:"e",t:"txt",x:"Bom dia! Sua cobrança de setembro está com 11 dias de atraso. Conseguimos regularizar hoje?",h:"08:00",d:"Hoje"},
    {de:"p",t:"txt",x:"Vou pagar dia 3, pode liberar a loja hoje?",h:"08:45",d:"Hoje"},
    {de:"e",t:"txt",x:"A loja só é liberada depois do pagamento. Fica combinado dia 3?",h:"08:50",d:"Hoje"},
    {de:"n",t:"txt",x:"Prometeu pagar em 03/10. Retorno agendado para 02/10 às 14h.",h:"08:52",d:"Hoje"},
    {de:"p",t:"txt",x:"Combinado.",h:"08:53",d:"Hoje"},
    {de:"e",t:"txt",x:"Anotado, obrigado.",h:"08:55",d:"Hoje"}]},
  {id:3,pag:3,dono:"Juliana",etq:[],un:0,msgs:[
    {de:"e",t:"txt",x:"Olá! Segue a cobrança de setembro, com vencimento no dia 5 do próximo mês.",h:"10:00",d:"Ontem"},
    {de:"p",t:"txt",x:"Recebido, obrigado!",h:"10:25",d:"Ontem"},
    {de:"e",t:"txt",x:"Por nada. Bom trabalho!",h:"10:30",d:"Ontem"}]},
  {id:4,pag:4,dono:null,etq:["Negociação"],un:1,msgs:[
    {de:"e",t:"txt",x:"Adriele, a parcela 2 do acordo vence hoje.",h:"09:00",d:"Hoje"},
    {de:"p",t:"img",x:"comprovante-parcela2.jpg",h:"11:20",d:"Hoje"}]},
  {id:5,pag:5,dono:"Carlos",etq:[],un:0,msgs:[
    {de:"p",t:"txt",x:"Pagamento feito.",h:"14:02",d:"Ontem"},
    {de:"p",t:"pdf",x:"comprovante-set.pdf",h:"14:03",d:"Ontem",comp:"09/2026"},
    {de:"e",t:"txt",x:"Recebido e conferido, obrigada!",h:"14:40",d:"Ontem"}]},
  {id:6,pag:6,dono:"Marina",etq:[],un:1,msgs:[
    {de:"e",t:"txt",x:"Olá, Airam! A cobrança de setembro está com 6 dias de atraso.",h:"08:00",d:"Hoje"},
    {de:"p",t:"txt",x:"Posso pagar só metade agora e o resto na semana que vem?",h:"10:15",d:"Hoje"}]},
  {id:7,pag:7,dono:null,etq:["Novo cliente"],un:1,msgs:[
    {de:"p",t:"txt",x:"Bom dia, preciso da nota fiscal do mês.",h:"07:55",d:"Hoje"}]},
  {id:8,pag:8,dono:"Juliana",etq:[],un:0,msgs:[
    {de:"e",t:"txt",x:"Alana, seu pagamento de setembro foi confirmado. Obrigada!",h:"15:10",d:"Ontem"},
    {de:"p",t:"txt",x:"Show, obrigada!",h:"15:12",d:"Ontem"},
    {de:"e",t:"txt",x:"Tudo certo por aqui.",h:"15:14",d:"Ontem"}]},
  {id:9,pag:9,dono:"Rafael",etq:["Negociação"],un:1,msgs:[
    {de:"e",t:"txt",x:"Alberto, lembrando da parcela 3 do acordo.",h:"09:05",d:"Hoje"},
    {de:"p",t:"pdf",x:"boleto-parcela3.pdf",h:"09:30",d:"Hoje"}]},
  {id:10,pag:10,dono:"Carlos",etq:[],un:0,msgs:[
    {de:"e",t:"txt",x:"Alessandra, a cobrança de setembro já está disponível.",h:"09:20",d:"Ontem"},
    {de:"p",t:"txt",x:"Vi sim, pago até o vencimento.",h:"09:45",d:"Ontem"},
    {de:"e",t:"txt",x:"Perfeito, obrigado.",h:"09:50",d:"Ontem"}]},
  {id:11,pag:11,dono:null,etq:["Reclamação"],un:3,msgs:[
    {de:"e",t:"txt",x:"Alexandre, sua cobrança está com 24 dias de atraso e as lojas serão bloqueadas.",h:"09:00",d:"Ontem"},
    {de:"p",t:"txt",x:"Eu já paguei metade, vocês não conferiram?",h:"19:20",d:"Ontem"},
    {de:"p",t:"txt",x:"Tô esperando resposta desde ontem.",h:"08:10",d:"Hoje"},
    {de:"p",t:"txt",x:"Alguém pode me atender?",h:"08:11",d:"Hoje"}]},
  {id:12,pag:12,dono:"Marina",etq:[],un:0,msgs:[
    {de:"e",t:"txt",x:"Alice, seu pagamento foi confirmado. Obrigada!",h:"16:00",d:"Ontem"},
    {de:"p",t:"txt",x:"Obrigada!",h:"16:05",d:"Ontem"},
    {de:"e",t:"txt",x:"Sempre à disposição.",h:"16:06",d:"Ontem"}]},
  {id:13,pag:13,dono:"Juliana",etq:["Negociação"],un:1,msgs:[
    {de:"e",t:"txt",x:"Aline, a cobrança está com 15 dias de atraso. Quando consegue pagar?",h:"08:00",d:"Hoje"},
    {de:"p",t:"txt",x:"Prometo pagar até 02/10, pode ficar tranquilo.",h:"08:40",d:"Hoje"}]},
  {id:14,pag:14,dono:"Carlos",etq:[],un:0,msgs:[
    {de:"e",t:"txt",x:"Alisson, a parcela do acordo vence dia 05/10.",h:"10:00",d:"Ontem"},
    {de:"p",t:"txt",x:"Ok, obrigado pelo aviso.",h:"10:10",d:"Ontem"},
    {de:"e",t:"txt",x:"Por nada.",h:"10:12",d:"Ontem"}]},
  {id:101,grupo:"Grupo de bloqueio",dono:"Rafael",etq:[],un:0,fixa:true,msgs:[
    {de:"e",t:"txt",x:"Bloquear todas as lojas de ALEXANDRE TEIXEIRA GOMES (24 dias de atraso).",h:"09:35",d:"Ontem"},
    {de:"e",t:"txt",x:"Bloqueio confirmado pela plataforma.",h:"09:52",d:"Ontem"}]},
  {id:102,grupo:"Equipe de cobrança",dono:"Marina",etq:[],un:0,msgs:[
    {de:"e",t:"txt",x:"Lembrete: hoje é o último dia para fechar as promessas do mês.",h:"08:30",d:"Hoje"}]}
];
