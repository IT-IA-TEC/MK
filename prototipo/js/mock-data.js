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
