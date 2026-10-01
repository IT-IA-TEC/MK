/* Tela Marketplaces: conexões, lojas (ficha), faturamento e aplicativos. Tudo preenchido à mão por enquanto. */
window.MKMarketplaces=(function(){
var F=window.MKFiltro,U=window.MKUI,esc=U.esc,ic=U.ic,PAGS=window.MK_PAG,el=null,pronto=false,EU='Marina Costa';
var aba='painel',subC='Todas',subL='Todas',subA='Shein',fq='',fSit='',fResp='',sub='pedidos',fComp='',fLoja='',fMk2='',fResp2='',pg1=1,PG=25;
var MKTS=['Shein','Mercado Livre','Shopee','Kwai'],SITS=['Sem conexão','Aguardando autorização','Conectada','Com erro','Vencida'];
var SITC={'Sem conexão':'cn','Aguardando autorização':'ok','Conectada':'vd','Com erro':'gr','Vencida':'at'};
var LOGO={'Shein':['SH','#000000','#FFFFFF'],'Mercado Livre':['ML','#FFE600','#2D3277'],'Shopee':['SP','#EE4D2D','#FFFFFF'],'Kwai':['KW','#FF5000','#FFFFFF']};
var DB={con:[],lj:{},apps:{},ped:{},nf:{},nid:1};
function R(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(s){return +(''+s).replace(/\./g,'').replace(',','.')||0}
function d2(n){return ('0'+n).slice(-2)}
function fd(d){return d2(d.getDate())+'/'+d2(d.getMonth()+1)+'/'+d.getFullYear()}
function fiso(s){if(!s)return '—';var a=s.split('-');return a[2]+'/'+a[1]+'/'+a[0]}
function iso(d){return d.getFullYear()+'-'+d2(d.getMonth()+1)+'-'+d2(d.getDate())}
function agora(){var d=new Date();return fd(d)+' '+d2(d.getHours())+':'+d2(d.getMinutes())}
function hoje(){return new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())}
function so(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function nums(s){return (''+s).replace(/\D/g,'')}
function lcg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function pagador(id){return PAGS.filter(function(p){return p.id===id})[0]}
function lojas(){var o=[];PAGS.forEach(function(p){p.lojas.forEach(function(l){o.push({l:l,p:p})})});return o}
function lojaPor(gs){return lojas().filter(function(x){return x.l.gs===gs})[0]}
function logo(m){var g=LOGO[m]||['?','#999','#fff'];return '<span class="mk-l"><i style="background:'+g[1]+';color:'+g[2]+'">'+g[0]+'</i>'+esc(m)+'</span>'}
function chip(t,c){return '<span class="fs '+c+'">'+t+'</span>'}
/* ---------- regras de validade e situação ---------- */
function validade(c){
  if(c.mkt==='Shein')return null;if(!c.autEm)return undefined;
  var a=c.autEm.split('-'),d=new Date(+a[0],+a[1]-1,+a[2]);
  if(c.mkt==='Kwai')return null;if(c.mkt==='Shopee'){if(c.validDias==='livre'){if(!c.validData)return undefined;var b=c.validData.split('-');return new Date(+b[0],+b[1]-1,+b[2])}d.setDate(d.getDate()+(+c.validDias||365));return d}d.setMonth(d.getMonth()+6);return d;
}
function sitEf(c){var v=validade(c);if(c.sit==='Conectada'&&v&&v<hoje())return 'Vencida';return c.sit}
function validTxt(c){
  if(c.mkt==='Shein')return '<span class="nt">Sem validade fixa</span>';if(c.mkt==='Kwai')return '<span class="nt">A confirmar</span>';var v=validade(c);if(!v)return '<span class="nt">—</span>';
  var n=Math.round((v-hoje())/86400000);return fd(v)+'<div class="nt">'+(n<0?'venceu há '+(-n)+' dias':'faltam '+n+' dias')+'</div>';
}
function conDe(gs,mkt){return DB.con.filter(function(c){return c.gs===gs&&c.mkt===mkt})[0]}
function sitLoja(x){var c=conDe(x.l.gs,x.l.plat);return c?sitEf(c):'Sem conexão'}
/* ---------- dados iniciais ---------- */
var PERMS_ML=['Usuários (padrão)','Publicação e sincronização','Comunicação pré e pós-venda','Publicidade','Métricas do negócio','Vendas e envios','Promoções, cupons e descontos','Faturamento'],PERMS_KW=['user_info','merchant_item','merchant_order'];
function novaCon(x,mkt,sit,aut){
  var p=x.p,l=x.l,c={id:DB.nid++,gs:l.gs,mkt:mkt||l.plat,sit:sit||'Sem conexão',login:'',publico:'',idExt:'',tipo:'',pais:mkt==='Mercado Livre'||l.plat==='Mercado Livre'?'Brasil (MLB)':'',tipoVend:'',tipoLojaSp:'',validDias:'365',validData:'',quem:'',autEm:'',perms:[],obs:'',seg:{chave:null,token:null},at:null};
  return c;
}
function iniciar(){
  if(pronto)return;pronto=true;var r=lcg(31),L=lojas(),tipos=['Auto-operada','Semi-gerenciada','Full-gerenciada'];
  L.forEach(function(x,i){
    var k=i%8,sit=['Conectada','Conectada','Conectada','Sem conexão','Aguardando autorização','Conectada','Com erro','Conectada'][k];
    if(sit==='Sem conexão')return;
    var c=novaCon(x,null,sit),mk=c.mkt,dias=mk==='Kwai'?(i%3===0?400:90):mk==='Mercado Livre'?(i%2?200:60):mk==='Shopee'?20:120;
    if(sit==='Conectada'&&i%9===0&&mk!=='Shein')dias=mk==='Kwai'?380:210;
    var d=new Date(hoje());d.setDate(d.getDate()-dias);
    c.login=x.l.n.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'').slice(0,24);c.publico=x.l.n;
    c.idExt=mk==='Shein'?'SH'+(100000+Math.floor(r()*899999)):mk==='Mercado Livre'?String(200000000+Math.floor(r()*99999999)):mk==='Shopee'?String(300000000+Math.floor(r()*99999999)):'KW'+(700000+Math.floor(r()*299999));
    if(mk==='Shopee'){c.tipoVend=i%2?'CPF':'CNPJ';c.tipoLojaSp=i%3?'Local':'Cross-border';c.validDias=['30','90','180','365'][i%4]}
    if(mk==='Shein')c.tipo=tipos[i%3];
    if(sit!=='Aguardando autorização'){c.quem=x.p.nome;c.autEm=iso(d)}
    c.perms=mk==='Kwai'?PERMS_KW.slice():mk==='Mercado Livre'?PERMS_ML.slice(0,3).concat(PERMS_ML.slice(4,6)):[];
    if(sit==='Com erro')c.obs=mk==='Mercado Livre'?'Autorização feita por operador da conta. Precisa ser o administrador.':'Autorização revogada pelo vendedor.';
    c.seg.chave={t:agora(),q:'Rafael Lima'};if(sit==='Conectada')c.seg.token={t:agora(),q:'Rafael Lima'};
    c.at={t:fd(new Date(hoje().getTime()-(1+Math.floor(r()*20))*86400000))+' 10:'+d2(Math.floor(r()*60)),q:['Marina Costa','Rafael Lima','Juliana Prado'][i%3]};
    DB.con.push(c);
  });
  DB.apps={
    'Shein':{id:'SHEIN-APP-2208',seg:{t:'12/03/2026 14:10',q:'Rafael Lima'},tipo:'Semi-gerenciada',url:'https://itmk.com.br/marketplaces/shein/retorno',ips:'200.150.10.21\n200.150.10.22',sit:'Aprovado',criado:'10/03/2026',troca:'12/03/2026'},
    'Mercado Livre':{id:'7410025583961204',seg:{t:'05/04/2026 09:35',q:'Rafael Lima'},tipo:'',url:'https://itmk.com.br/marketplaces/ml/retorno',ips:'',sit:'Aprovado',criado:'01/04/2026',troca:'05/04/2026'},
    'Shopee':{id:'SHOPEE-ERP-5102',seg:{t:'02/06/2026 11:20',q:'Rafael Lima'},tipo:'ERP',url:'https://itmk.com.br/marketplaces/shopee/retorno-teste',urlProd:'https://itmk.com.br/marketplaces/shopee/retorno',ips:'200.150.10.21\n200.150.10.22',sit:'Aprovado',criado:'28/05/2026',troca:'02/06/2026'},
    'Kwai':{id:'KWAI-CLI-3301',seg:{t:'20/05/2026 16:00',q:'Marina Costa'},tipo:'',url:'https://itmk.com.br/marketplaces/kwai/retorno',ips:'',sit:'Em revisão',criado:'18/05/2026',troca:'20/05/2026'}
  };
  /* fichas de exemplo: nem toda loja tem análise (Sem análise / Em dia / Desatualizada) */
  var PLANO=[[0,5],[1,40],[2,12],[3,null],[4,60],[5,8],[6,null],[7,3],[8,75],[9,null],[10,20],[11,null],[12,2],[13,48],[14,null],[15,9],[16,33],[17,null],[18,6],[19,null],[20,14],[21,null]];
  var rr=lcg(77),dt=function(n){var x=new Date(hoje());x.setDate(x.getDate()-n);return iso(x)};
  function ini(v,d){return String(Math.round(v*(d||1)))}
  PLANO.forEach(function(pl){
    var x=L[pl[0]];if(!x||pl[1]===null)return;var gs=x.l.gs,o=lj(gs),M=x.l.plat,i=pl[0],d=o.d;
    d['cad.login']='loja.exemplo.'+(i+1);d['cad.publico']=x.l.n;d['cad.link']='https://loja.exemplo/'+gs;d['cad.antiga']='2024-0'+(3+i%6)+'-12';
    d['mkt.camp']=[{nome:'Campanha do mês',tipo:'Desconto',periodo:'01/09 a 15/09'}];d['mkt.cupom']='Sim';d['mkt.cupom_qtd']=String(1+i%3);
    d['dev.lista']=[{data:dt(pl[1]+4),pedido:'GS'+(1000+i),produto:'Vestido midi floral',motivo:'Tamanho errado',status:'Reembolsada'},{data:dt(pl[1]+6),pedido:'GS'+(1100+i),produto:'Blusa manga longa',motivo:'Defeito',status:'Em disputa'}];
    d['fat.pedidos']=String(120+i*17);d['fat.total']=String(9000+i*1330).replace(/\B(?=(\d{3})+$)/g,'.');
    d['p0.titulo']='Vestido midi floral com manga bufante verão 2026';d['p0.fotos']='8';d['p0.preco']='119,90';d['p0.vendas']='180';d['p0.conc']='Loja Alfa: 129,90\nLoja Beta: 134,00';d['p0.estoque']='P:12 M:20 G:8';d['mkt.fonte']='Avant Pro';d['preco.fonte']='Avant Pro';
    if(M==='Shein'){d['cat.limite']='1000';d['cat.publicados']=String(700+i*9);d['cat.ativos']=String(650+i*8);d['cat.esgotados']='34';d['cat.inativos']='18';d['viol.aval_neg']=String(2+i%4);d['diag.boa']=(80+i%15)+'%';d['diag.nota']='4,'+(2+i%7);d['desemp.nq']='4,'+(3+i%6);d['desemp.nl']='4,3';d['desemp.dsr']='4,'+(4+i%5);d['desemp.nivel']='Bom';d['desemp.pont']=(90+i%9)+'%';d['desemp.rank']=(10+i)+'º';d['desemp.faixa']=['Excelente','Boa','Regular'][i%3];d['fin.comissao']=String(800+i*70);d['fin.servico']='120';d['fin.transacao']='95';d['fin.repasse']=String(6000+i*900);
      d['viol.lista']=[{data:dt(pl[1]+2),motivo:'Imagem fora do padrão',pen:'Remoção do produto',pts:'2',sit:'Em análise',rec:'Sim',prazo:dt(-5)}];d['viol.recursos']=[{data:dt(pl[1]+1),viol:'Imagem fora do padrão',res:'Apresentado'}];d['diag.cd']=[{produto:'Blusa manga longa',cls:'C2'}];d['diag.prob']=String(3+i%5)}
    if(M==='Mercado Livre'){d['cat.ativos']=String(300+i*12);d['cat.pausados']='14';d['cat.encerrados']='60';d['cat.rest_classico']='400';d['cat.rest_premium']='250';d['desemp.cor']=['Verde','Amarelo','Verde','Laranja','Vermelho'][i%5];d['desemp.lider']='Sem faixa';d['desemp.recl']=String(1+i%3);d['desemp.canc']='1';d['desemp.atraso']=String(2+i%4);d['fin.comissao']=String(1100+i*60);d['fin.servico']='0';d['fin.transacao']='150';d['fin.repasse']=String(7000+i*800);
      d['viol.lista']=i%2?[]:[{data:dt(pl[1]+3),motivo:'Anúncio com infração',pen:'Pausa',pts:'1',sit:'Ativa',rec:'Sim',prazo:dt(-7)}];d['diag.prob']=String(2+i%4)}
    if(M==='Shopee'){d['cat.sp_normal']=String(260+i*11);d['cat.sp_banido']=String(i%3);d['cat.sp_nlistado']='8';d['cat.sp_rev']=String(2+i%3);d['cat.sp_exc_v']='12';d['cat.sp_exc_s']=String(i%2);d['cat.sp_limites']='Moda feminina: 500\nAcessórios: 200';d['cat.estoque']=String(1800+i*40);
      d['viol.pontos']=String(i%4);d['viol.punicoes']=i%2?[]:[{tipo:'Limite de listagem',inicio:dt(pl[1]+10),fim:dt(-4),lim_list:'50 itens/dia',lim_ped:'—'}];d['viol.itens']=[{item:'Conjunto verão',motivo:'Imagem com marca d\'água',prazo:dt(-6)}];
      d['diag.sp_nivel']=['Melhorar','Qualificado','Excelente'][i%3];d['diag.sp_tipo']='Descrição curta';d['diag.prob']=String(2+i%5);
      d['desemp.sp_nota']=String(2+i%3);d['desemp.sp_nao_cumpre']=String(1+i%3);d['desemp.sp_cancel']=String(1+i%2);d['desemp.sp_devol']=String(2+i%3);d['desemp.sp_atraso']=String(2+i%4);d['desemp.sp_preparo']='1,5';d['desemp.sp_chat']=String(85+i%12);d['desemp.sp_notaloja']='4,'+(5+i%4);
      d['fin.comissao']=String(900+i*50);d['fin.servico']='140';d['fin.transacao']='110';d['fin.repasse']=String(6500+i*700)}
    if(M==='Kwai'){d['cat.rev_em']='4';d['cat.rev_ap']=String(200+i*5);d['cat.rev_rep']='6';d['cat.rev_viol']='2';d['cat.v_fora']='10';d['cat.v_no']=String(180+i*4);d['desemp.faixa']=['Boa','Regular','Excelente'][i%3];d['desemp.nq']='4,'+(1+i%8);
      d['viol.lista']=[];d['diag.prob']=String(1+i%3)}
    Object.keys(d).forEach(function(k){o.m[k]={q:['Marina Costa','Rafael Lima'][i%2],t:fd(new Date(hoje().getTime()-pl[1]*86400000))+' 11:00'}});
    /* análise anterior: um pouco pior/diferente, 45 dias antes da última */
    var ant=JSON.parse(JSON.stringify(d));
    ['cat.ativos','cat.sp_normal','cat.v_no'].forEach(function(k){if(ant[k])ant[k]=String(Math.round(num(ant[k])*0.94))});
    ['fat.pedidos'].forEach(function(k){ant[k]=String(Math.round(num(ant[k])*0.9))});
    ant['fat.total']=String(Math.round(num(d['fat.total'])*0.88)).replace(/\B(?=(\d{3})+$)/g,'.');
    if(ant['viol.lista']&&!ant['viol.lista'].length)ant['viol.lista']=[{data:dt(pl[1]+40),motivo:'Antiga',pen:'Aviso',pts:'1',sit:'Encerrada',rec:'Não',prazo:''}];
    if(M==='Shopee'){ant['desemp.sp_nota']=String(Math.max(1,num(d['desemp.sp_nota'])-(i%2)));ant['desemp.sp_atraso']=String(num(d['desemp.sp_atraso'])+1)}
    if(M==='Mercado Livre')ant['desemp.cor']=i%2?'Amarelo':ant['desemp.cor'];
    if(M==='Shein'){ant['desemp.dsr']='4,1';ant['diag.boa']='78%'}
    ant['dev.lista']=ant['dev.lista'].slice(0,1);
    o.snaps=[{id:DB.nid++,data:dt(pl[1]+45),autor:'Rafael Lima',obs:'Primeira análise',d:ant},{id:DB.nid++,data:dt(pl[1]),autor:'Marina Costa',obs:'Análise mais recente',d:JSON.parse(JSON.stringify(d))}];
  });
}
function mkt(gs){var x=lojaPor(gs);return x?x.l.plat:'Shein'}
function lj(gs){return DB.lj[gs]||(DB.lj[gs]={d:{},m:{},snaps:[]})}
/* ---------- especificação da ficha da loja (muda por marketplace) ---------- */
function N(d,k){return num(d[k]||'')}
function tem(d,k){return String(d[k]||'').trim()!==''}
function top(arr,f,n){var c={};arr.forEach(function(x){var v=f(x);if(v)c[v]=(c[v]||0)+1});return Object.keys(c).sort(function(a,b){return c[b]-c[a]}).slice(0,n).map(function(k){return k+' ('+c[k]+')'}).join('; ')||'—'}
function semanaAnt(d){var h=hoje(),dow=(h.getDay()+6)%7,fim=new Date(h);fim.setDate(h.getDate()-dow-1);var ini=new Date(fim);ini.setDate(fim.getDate()-6);return [ini,fim]}
function blocos(m){
  var S=m==='Shein',M=m==='Mercado Livre',K=m==='Kwai',P=m==='Shopee';
  var NA={na:1,l:'Não se aplica neste marketplace'};
  var out=[];
  out.push({id:'cad',t:'Cadastro',it:[
    {k:'cad.login',l:'Nome de login',t:'txt'},{k:'cad.publico',l:'Nome público',t:'txt'},{fx:'Marketplace',v:function(x){return m}},{fx:'CNPJ da loja (informativo)',v:function(x){var d=String(x.cnpj||'');return d.length===14?d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5'):'—'}},{fx:'GS / ID da loja',v:function(x){var c=conDe(x.gs,m);return x.gs+(c&&c.idExt?' · ID '+c.idExt:'')}},
    {k:'cad.link',l:'Link da loja',t:'txt'},{fx:'Data de início',v:function(x){return x.ini||'—'}},{fx:'Percentual da 40% (vem do BL)',v:function(){return '40%'}},{fx:'Responsável',v:function(x){return x.resp}},
    {k:'cad.antiga',l:'Data da publicação mais antiga (referência de antiguidade)',t:'data',info:'Será calculada quando houver lista de produtos. Manual até lá.'}]});
  if(K)out[0].it.unshift({info:'Kwai: sem documentação oficial acessível. Todos os campos da ficha ficam Manual (a confirmar com a Kwai).'});
  var cat=[];
  if(S){cat=[{info:'A cota é por SKC. A regra de renovação está a confirmar com a Shein.'},{k:'cat.limite',l:'Limite total de SKC',t:'num'},{k:'cat.publicados',l:'SKC publicados',t:'num'},{k:'cat.saldo',l:'Saldo de SKC',t:'calc',f:function(d){return tem(d,'cat.limite')?String(N(d,'cat.limite')-N(d,'cat.publicados')):'—'}},{k:'cat.ativos',l:'Produtos ativos',t:'num'},{k:'cat.esgotados',l:'Produtos esgotados',t:'num'},{k:'cat.inativos',l:'Produtos inativos',t:'num'},{k:'cat.total',l:'Total de produtos',t:'calc',f:function(d){var t=N(d,'cat.ativos')+N(d,'cat.esgotados')+N(d,'cat.inativos');return t?String(t):'—'}}]}
  else if(M){cat=[{k:'cat.ativos',l:'Anúncios ativos',t:'num'},{k:'cat.pausados',l:'Anúncios pausados',t:'num'},{k:'cat.encerrados',l:'Anúncios encerrados',t:'num'},{k:'cat.rest_classico',l:'Anúncios restantes · Clássico',t:'num'},{k:'cat.rest_premium',l:'Anúncios restantes · Premium',t:'num'}]}
  else if(P){cat=[{info:'Situação dos itens e regras de publicação da categoria vêm da Shopee.'},{k:'cat.sp_normal',l:'Itens normais',t:'num'},{k:'cat.sp_banido',l:'Itens banidos',t:'num'},{k:'cat.sp_nlistado',l:'Itens não listados',t:'num'},{k:'cat.sp_rev',l:'Itens em revisão',t:'num'},{k:'cat.sp_exc_v',l:'Itens excluídos pelo vendedor',t:'num'},{k:'cat.sp_exc_s',l:'Itens excluídos pela Shopee',t:'num'},{k:'cat.sp_limites',l:'Regras de publicação da categoria (preço, estoque, título, fotos)',t:'area'},{k:'cat.estoque',l:'Estoque total (soma dos modelos)',t:'num'}]}
  else{cat=[{info:'Limite de publicação da Kwai: a confirmar. Não há fonte oficial.'},{sec:'Situação de revisão'},{k:'cat.rev_em',l:'Em revisão',t:'num'},{k:'cat.rev_ap',l:'Aprovado',t:'num'},{k:'cat.rev_rep',l:'Reprovado',t:'num'},{k:'cat.rev_viol',l:'Reprovado por violação',t:'num'},{sec:'Situação de venda'},{k:'cat.v_fora',l:'Fora do ar',t:'num'},{k:'cat.v_no',l:'No ar',t:'num'},{k:'cat.v_fora_rev',l:'Fora do ar em revisão',t:'num'},{k:'cat.v_ban',l:'Banido',t:'num'},{k:'cat.v_edit',l:'Aguardando edição',t:'num'}]}
  out.push({id:'cat',t:'Catálogo',it:cat});
  var viol=[{lista:1,k:'viol.lista',l:'Violações',add:'Adicionar violação',cols:[{c:'data',l:'Data',t:'data'},{c:'motivo',l:'Motivo',t:'txt'},{c:'pen',l:'Penalidade',t:'txt'},{c:'pts',l:'Pontos',t:'txt'},{c:'sit',l:'Situação',t:'txt'},{c:'rec',l:'Permite recurso',t:'sel',op:['Sim','Não']},{c:'prazo',l:'Prazo do recurso',t:'data'}]},
   {lista:1,k:'viol.recursos',l:'Recursos',add:'Adicionar recurso',cols:[{c:'data',l:'Data',t:'data'},{c:'viol',l:'Violação ligada',t:'violsel'},{c:'res',l:'Resultado',t:'sel',op:['Apresentado','Aprovado','Rejeitado']}]},
   {k:'viol.aval_neg',l:'Avaliações negativas com recurso disponível',t:'num',info:S||K?'Manual na Shein e na Kwai.':M?'Manual no Mercado Livre.':''},
   {sec:'Contadores'},
   {k:'viol.total',l:'Total de violações',t:'calc',f:function(d){return String((d['viol.lista']||[]).length)}},
   {k:'viol.apres',l:'Recursos apresentados',t:'calc',f:function(d){return String((d['viol.recursos']||[]).length)}},
   {k:'viol.aprov',l:'Recursos aprovados',t:'calc',f:function(d){return String((d['viol.recursos']||[]).filter(function(x){return x.res==='Aprovado'}).length)}},
   {k:'viol.rej',l:'Recursos rejeitados',t:'calc',f:function(d){return String((d['viol.recursos']||[]).filter(function(x){return x.res==='Rejeitado'}).length)}},
   {k:'viol.taxa',l:'Taxa de aprovação dos recursos da semana anterior',t:'calc',f:function(d){var w=semanaAnt(d),r=(d['viol.recursos']||[]).filter(function(x){if(!x.data)return false;var a=x.data.split('-'),dt=new Date(+a[0],+a[1]-1,+a[2]);return dt>=w[0]&&dt<=w[1]});if(!r.length)return '—';return Math.round(r.filter(function(x){return x.res==='Aprovado'}).length/r.length*100)+'%'}}];
  if(M)viol.unshift({info:'No Mercado Livre a penalidade vem em texto (motivo e solução), não em pontos. Pontos não existem aqui. O recurso de infração não foi confirmado.'});
  if(S)viol.push({sec:'Penalidade financeira (extrato)'},{k:'viol.debitado',l:'Valor debitado',t:'num',suf:'R$'},{k:'viol.compensado',l:'Valor compensado',t:'num',suf:'R$'});
  else viol.push({na:1,l:'Penalidade financeira: não se aplica neste marketplace'});
  if(P)viol=[{k:'viol.pontos',l:'Pontos de penalidade do trimestre',t:'num'},
   {lista:1,k:'viol.punicoes',l:'Punições (em curso e encerradas)',add:'Adicionar punição',cols:[{c:'tipo',l:'Tipo',t:'txt'},{c:'inicio',l:'Início',t:'data'},{c:'fim',l:'Fim',t:'data'},{c:'lim_list',l:'Limite de listagem',t:'txt'},{c:'lim_ped',l:'Limite de pedidos',t:'txt'}]},
   {lista:1,k:'viol.itens',l:'Itens com problema',add:'Adicionar item',cols:[{c:'item',l:'Item',t:'txt'},{c:'motivo',l:'Motivo',t:'txt'},{c:'prazo',l:'Prazo para corrigir',t:'data'}]},
   {na:1,l:'Recurso: não há recurso por API na Shopee (ele existe no Seller Center). O efeito aparece como pontos ajustados.',txt:'Sem recurso por API'},{sec:'Contadores'},
   {k:'viol.total',l:'Total de punições',t:'calc',f:function(d){return String((d['viol.punicoes']||[]).length)}},
   {k:'viol.curso',l:'Punições em curso',t:'calc',f:function(d){var h=iso(hoje());return String((d['viol.punicoes']||[]).filter(function(x){return !x.fim||x.fim>=h}).length)}},
   {k:'viol.itens_n',l:'Itens com problema',t:'calc',f:function(d){return String((d['viol.itens']||[]).length)}}];
  out.push({id:'viol',t:'Violações e recursos',it:viol});
  out.push({id:'dev',t:'Devoluções e pós-venda',it:[{lista:1,k:'dev.lista',l:'Registros de pós-venda',add:'Adicionar registro',cols:[{c:'data',l:'Data',t:'data'},{c:'pedido',l:'Pedido',t:'txt'},{c:'produto',l:'Produto',t:'txt'},{c:'motivo',l:'Motivo',t:'txt'}]},{sec:'Contadores'},
    {k:'dev.total',l:'Total de registros',t:'calc',f:function(d){return String((d['dev.lista']||[]).length)}},
    {k:'dev.motivos',l:'Motivos mais frequentes',t:'calc',f:function(d){return top(d['dev.lista']||[],function(x){return x.motivo},3)}},
    {k:'dev.produtos',l:'Produtos que mais concentram devoluções e reclamações',t:'calc',f:function(d){return top(d['dev.lista']||[],function(x){return x.produto},3)}}]});
  if(P)out[out.length-1].it[0].cols.push({c:'status',l:'Status',t:'sel',op:['Solicitada','Em disputa','Reembolsada','Compensada']});
  out.push({id:'prod',t:'Produtos analisados',p3:1,it:[
    {k:'titulo',l:'Título',t:'txt'},{k:'chars',l:'Quantidade de caracteres do título',t:'calc',f:function(d,i){var t=d['p'+i+'.titulo']||'';return t?String(t.length):'—'}},
    {k:'desc',l:'Descrição',t:'area'},{k:'attrs',l:'Atributos preenchidos',t:'txt'},{k:'fotos',l:'Fotos',t:'num'},{k:'img_cor',l:'Imagem própria para cada cor',t:'sel',op:['Sim','Não']},{k:'video',l:'Vídeo',t:'sel',op:['Sim','Não']},
    {k:'peso',l:'Peso e dimensões da embalagem por SKU',t:'area'},{k:'med',l:'Tabela de medidas',t:'area'},{k:'var',l:'Variações de cor e tamanho',t:'txt'},{k:'estoque',l:'Estoque por variação',t:'txt'},
    {k:'est_total',l:'Estoque total',t:'calc',f:function(d,i){var s=d['p'+i+'.estoque']||'',n=(s.match(/\d+/g)||[]).map(Number).reduce(function(a,b){return a+b},0);return s?String(n):'—'}}]});
  out.push({id:'preco',t:'Preços e concorrência',p3:1,it:[{k:'fonte',l:'Fonte da amostra',t:'txt',g:1,info:'Por exemplo, Avant Pro.'},
    {k:'vendas',l:'Volume de vendas',t:'num'},{k:'preco',l:'Preço da loja',t:'num',suf:'R$'},{k:'conc',l:'Amostra de concorrentes (nome: preço, um por linha)',t:'area'},
    {k:'media',l:'Média da amostra',t:'calc',f:function(d,i){var v=precos(d['p'+i+'.conc']);return v.length?R(v.reduce(function(a,b){return a+b},0)/v.length):'—'}},
    {k:'dif',l:'Diferença para o preço da loja',t:'calc',f:function(d,i){var v=precos(d['p'+i+'.conc']);if(!v.length||!tem(d,'p'+i+'.preco'))return '—';var m=v.reduce(function(a,b){return a+b},0)/v.length,p=N(d,'p'+i+'.preco'),df=p-m;return (df>=0?'+':'')+R(df)+' ('+(df>=0?'+':'')+(df/m*100).toFixed(1).replace('.',',')+'%)'}}]});
  out.push({id:'mkt',t:'Marketing',it:[{lista:1,k:'mkt.camp',l:'Campanhas aprovadas',add:'Adicionar campanha',cols:[{c:'nome',l:'Nome',t:'txt'},{c:'tipo',l:'Tipo',t:'txt'},{c:'periodo',l:'Período',t:'txt'}]},
    {k:'mkt.ferr',l:'Ferramentas promocionais usadas',t:'area'},{sec:'Cupons'},{k:'mkt.cupom',l:'Existe cupom',t:'sel',op:['Sim','Não']},{k:'mkt.cupom_qtd',l:'Quantidade de cupons',t:'num'},{k:'mkt.cupom_tipos',l:'Tipos de cupom',t:'txt'},{k:'mkt.cupom_desc',l:'Desconto',t:'txt'},{k:'mkt.cupom_datas',l:'Datas',t:'txt'},
    {sec:'Contador'},{k:'mkt.n',l:'Quantidade de campanhas',t:'calc',f:function(d){return String((d['mkt.camp']||[]).length)}}]});
  out.push({id:'diag',t:'Diagnóstico e qualidade',it:[{k:'diag.boa',l:'Taxa de boa qualificação',t:'txt'},{k:'diag.nota',l:'Nota geral',t:'txt'},{k:'diag.prob',l:'Produtos com problemas',t:'num'},{k:'diag.tipos',l:'Tipos de problemas',t:'area'},{k:'diag.data',l:'Data de atualização do diagnóstico',t:'data'},{k:'diag.neg',l:'Taxa geral de avaliações negativas',t:'txt'},
    {sec:'Categorias A e C/D'},{k:'diag.a',l:'Produtos na categoria A',t:'num'},{k:'diag.c',l:'Produtos nas categorias C/D',t:'num'},{k:'diag.tot',l:'Total de produtos avaliados',t:'num'},
    {k:'diag.pa',l:'Proporção em A',t:'calc',f:function(d){return N(d,'diag.tot')?Math.round(N(d,'diag.a')/N(d,'diag.tot')*100)+'%':'—'}},{k:'diag.pc',l:'Proporção em C/D',t:'calc',f:function(d){return N(d,'diag.tot')?Math.round(N(d,'diag.c')/N(d,'diag.tot')*100)+'%':'—'}},
    {lista:1,k:'diag.cd',l:'Produtos classificados como C1, C2, D1 e D2',add:'Adicionar produto',cols:[{c:'produto',l:'Produto',t:'txt'},{c:'cls',l:'Classificação',t:'sel',op:['C1','C2','D1','D2']}]}]});
  if(P)out[out.length-1].it=[{k:'diag.sp_nivel',l:'Nível do diagnóstico de conteúdo',t:'sel',op:['Melhorar','Qualificado','Excelente']},{k:'diag.sp_tipo',l:'Tipo de problema',t:'area'},{k:'diag.prob',l:'Produtos com problemas',t:'num'},{k:'diag.data',l:'Data de atualização do diagnóstico',t:'data'},{k:'diag.neg',l:'Taxa geral de avaliações negativas',t:'txt'}];
  var des=[];
  if(M)des=[{k:'desemp.cor',l:'Nível: cor da reputação',t:'sel',op:['Verde','Amarelo','Laranja','Vermelho'],info:'A API devolve o nível com número e cor (ex.: 5_green). Conferir se há mais de 4 níveis antes de ligar o conector.'},{k:'desemp.lider',l:'Faixa de Mercado Líder',t:'sel',op:['Sem faixa','Silver','Gold','Platinum'],info:'A API devolve a medalha Silver, Gold ou Platinum. A equivalência com MercadoLíder está a confirmar.'},{k:'desemp.recl',l:'Taxa de reclamações',t:'num',suf:'%'},{k:'desemp.canc',l:'Taxa de cancelamentos',t:'num',suf:'%'},{k:'desemp.atraso',l:'Taxa de atraso no despacho',t:'num',suf:'%'},{na:1,l:'DSR e ranking de fulfillment: não se aplicam ao Mercado Livre'}];
  else des=[{k:'desemp.nq',l:'Nota de qualidade',t:'txt'},{k:'desemp.nl',l:'Nota de logística',t:'txt'},{k:'desemp.dsr',l:'Pontuação geral do DSR',t:'txt'},{k:'desemp.nivel',l:'Nível de qualidade da loja',t:'txt'},{lista:1,k:'desemp.nao',l:'Critérios marcados como “Não atende”',add:'Adicionar critério',cols:[{c:'crit',l:'Critério',t:'txt'}]},{k:'desemp.pont',l:'Índice de pontualidade da coleta',t:'txt'},{k:'desemp.rank',l:'Ranking de fulfillment',t:'txt'}];
  if(P)des=[{k:'desemp.sp_nota',l:'Nota da loja (1 a 4)',t:'sel',op:['1','2','3','4']},{k:'desemp.sp_nao_cumpre',l:'Taxa de não cumprimento',t:'num',suf:'%'},{k:'desemp.sp_cancel',l:'Taxa de cancelamento',t:'num',suf:'%'},{k:'desemp.sp_devol',l:'Taxa de devolução',t:'num',suf:'%'},{k:'desemp.sp_atraso',l:'Taxa de atraso de envio',t:'num',suf:'%'},{k:'desemp.sp_preparo',l:'Tempo de preparo',t:'num',suf:'dias'},{k:'desemp.sp_chat',l:'Resposta no chat',t:'num',suf:'%'},{k:'desemp.sp_notaloja',l:'Avaliação dos compradores (nota da loja)',t:'num'},{na:1,l:'Selo “Preferido”: não existe na Shopee'}];
  if(S||K)des.unshift({info:S?'Na Shein, desempenho, violações e diagnóstico ficam Manual (sem API confirmada).':'Na Kwai, tudo fica Manual (a confirmar).'});
  if(M)des.unshift({k:'desemp.faixa',l:'Faixa de saúde da loja',t:'calc',f:function(d){return faixaDeCor(d['desemp.cor'])},info:'Convertida da cor da reputação'});
  else if(P)des.push({k:'desemp.faixa',l:'Faixa de saúde da loja',t:'calc',f:function(d){return faixaDeNota(d['desemp.sp_nota'])},info:'Convertida da nota de 1 a 4'});
  else des.push({k:'desemp.faixa',l:'Faixa de saúde da loja (preenchida por analista)',t:'sel',op:['Excelente','Boa','Regular','Ruim']});
  out.push({id:'desemp',t:'Desempenho',it:des});
  var fin=[{k:'fat.pedidos',l:'Pedidos no mês',t:'num'},{k:'fat.total',l:'Faturamento no mês',t:'num',suf:'R$'}];
  if(K)fin.push({info:'Taxas e comissões da Kwai: a confirmar. Não há fonte oficial.'});
  else fin.push({sec:'Taxas e comissões'},{k:'fin.comissao',l:M?'Tarifa de venda':'Comissão',t:'num',suf:'R$'},{k:'fin.servico',l:'Taxa de serviço',t:'num',suf:'R$'},{k:'fin.transacao',l:'Taxa de transação',t:'num',suf:'R$'},{k:'fin.repasse',l:'Repasse',t:'num',suf:'R$'});
  out.push({id:'fin',t:'Financeiro',it:fin});
  return out;
}
function faixaDeCor(c){return {'Verde':'Excelente','Amarelo':'Boa','Laranja':'Regular','Vermelho':'Ruim'}[c]||'—'}
function faixaDeNota(n){n=num(n);return n>=4?'Excelente':n>=3?'Boa':n>=2?'Regular':n>=1?'Ruim':'—'}
var FX=['Ruim','Regular','Boa','Excelente'],FXC={'Excelente':'vd','Boa':'ok','Regular':'at','Ruim':'gr'};
function faixaLoja(gs){var d=lj(gs).d,m=mkt(gs);return m==='Mercado Livre'?faixaDeCor(d['desemp.cor']):m==='Shopee'?faixaDeNota(d['desemp.sp_nota']):(d['desemp.faixa']||'—')}
function ultimaAn(gs){var s=lj(gs).snaps.slice().sort(function(a,b){return a.data<b.data?1:-1});return s[0]||null}
function seloAn(gs){var u=ultimaAn(gs);if(!u)return {t:'Sem análise',c:'cn',dias:null,data:null};var a=u.data.split('-'),dd=Math.round((hoje()-new Date(+a[0],+a[1]-1,+a[2]))/86400000);return dd<=30?{t:'Em dia',c:'vd',dias:dd,data:u.data}:{t:'Desatualizada',c:'at',dias:dd,data:u.data}}
function seloHtml(gs){var s=seloAn(gs);return '<span class="fs '+s.c+'" title="'+(s.data?'Última análise em '+fiso(s.data)+' ('+s.dias+' dias)':'Nenhuma análise salva')+'">'+s.t+'</span>'}
function pN(s){var t=String(s===undefined||s===null?'':s).replace(/[^0-9,.\-]/g,'');if(!t||t==='-')return null;if(t.indexOf(',')>-1)t=t.replace(/\./g,'').replace(',','.');else if((t.match(/\./g)||[]).length>1||/^-?\d{1,3}\.\d{3}$/.test(t))t=t.replace(/\./g,'');var v=parseFloat(t);return isNaN(v)?null:v}
function nv(d,k){return tem(d,k)?pN(d[k]):null}
function soma(arr){var t=null;arr.forEach(function(v){if(v!==null&&v!==undefined)t=(t||0)+v});return t}
function indic(gs){return indicD(lj(gs).d,mkt(gs))}
function precos(t){return String(t||'').split('\n').map(function(x){var m=x.split(':');return m.length>1?num(m[m.length-1]):0}).filter(function(v){return v>0})}
var ABAS_F=['cad','cat','viol','dev','prod','preco','mkt','diag','desemp','fin','hist'];
var NOMES_F={cad:'Cadastro',cat:'Catálogo',viol:'Violações e recursos',dev:'Devoluções e pós-venda',prod:'Produtos analisados',preco:'Preços e concorrência',mkt:'Marketing',diag:'Diagnóstico e qualidade',desemp:'Desempenho',fin:'Financeiro',hist:'Histórico de análises'};
var fichaModo='preencher',relSnap='',fichaAba='cad',fichaGs=null,cmpA='',cmpB='atual',cmpTodos=false;
/* ---------- desenho da ficha da loja ---------- */
/* origem prevista por API (manual de APIs, tabela campo x API). 'a' = vem por API, 'p' = vem em parte. Até o conector ser ligado o campo segue Manual e editável. */
var VIA={
'Mercado Livre':{a:'cat.ativos cat.pausados cat.encerrados cat.rest_classico cat.rest_premium viol.lista dev.lista desemp.cor desemp.lider desemp.recl desemp.canc desemp.atraso diag.nota diag.prob fin.comissao titulo preco preco_loja',p:'cad.publico cad.link cad.antiga fin.servico fin.transacao mkt.camp'},
'Shopee':{a:'cad.publico cat.sp_normal cat.sp_banido cat.sp_nlistado cat.sp_rev cat.sp_exc_v cat.sp_exc_s cat.sp_limites viol.pontos viol.punicoes viol.itens dev.lista titulo desc attrs fotos video peso preco var estoque mkt.camp mkt.cupom mkt.cupom_qtd mkt.cupom_tipos mkt.cupom_desc mkt.cupom_datas diag.sp_nivel diag.sp_tipo diag.prob desemp.sp_nota desemp.sp_nao_cumpre desemp.sp_cancel desemp.sp_devol desemp.sp_atraso desemp.sp_preparo desemp.sp_chat desemp.sp_notaloja fin.comissao fin.servico fin.transacao fin.repasse',p:'cad.antiga cat.estoque med diag.neg'},
'Shein':{a:'dev.lista',p:'cad.antiga cat.limite cat.publicados cat.ativos cat.esgotados cat.inativos titulo desc attrs fotos peso var estoque preco fin.comissao fin.servico fin.repasse'}};
function via(gs,k){var m=mkt(gs),t=VIA[m];if(!t)return '';var b=k.replace(/^p[0-2]\./,'').replace(/^(preco|prod)\./,function(x){return x}),n=[k,b];
  var ok=function(l){return (' '+l+' ').indexOf(' '+n[0]+' ')>-1||(' '+l+' ').indexOf(' '+n[1]+' ')>-1};
  return ok(t.a)?'Virá por API quando o conector for ligado.':ok(t.p)?'Virá em parte por API quando o conector for ligado.':''}
var VIA_GS=null;
function chipO(o){return '<span class="mo '+o+'" title="'+(o==='manual'?'Preenchido à mão. Quando o motor for ligado, vira API e deixa de ser editável.':o==='calc'?'Calculado pelo sistema.':'Vem da API.')+'">'+(o==='manual'?'Manual':o==='calc'?'Calculado':'API')+'</span>'}
function metaTxt(o,k){var m=o.m[k];return m?'Preenchido por '+esc(m.q)+' em '+esc(m.t.indexOf('/')>-1?m.t:fd(new Date())):'Ainda não preenchido'}
function campoHtml(f,o,key,i){
  var d=o.d,v=d[key]!==undefined?d[key]:'';
  var h='<div class="mf"><label for="mf-'+esc(key)+'">'+esc(f.l)+'</label><div class="mf-v">';
  if(f.t==='calc')return '<div class="mf"><span class="mf-l">'+esc(f.l)+'</span><div class="mf-v"><b class="mf-calc" data-calc="'+esc(key)+'">'+esc(f.f(d,i))+'</b></div>'+chipO('calc')+'<small class="nt">Calculado automaticamente</small></div>';
  if(f.t==='sel')h+='<select class="sel" id="mf-'+esc(key)+'" data-mf="'+esc(key)+'"><option value="">Selecione</option>'+f.op.map(function(x){return '<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>';
  else if(f.t==='area')h+='<textarea class="cb-area" rows="3" id="mf-'+esc(key)+'" data-mf="'+esc(key)+'">'+esc(v)+'</textarea>';
  else if(f.t==='data')h+='<input type="date" id="mf-'+esc(key)+'" data-mf="'+esc(key)+'" value="'+esc(v)+'">';
  else h+='<div class="cf-in"><input id="mf-'+esc(key)+'" data-mf="'+esc(key)+'" value="'+esc(v)+'"'+(f.padrao&&!v?' placeholder="Padrão '+f.padrao+'"':'')+'>'+(f.suf?'<span>'+f.suf+'</span>':'')+'</div>';
  var vi=via(VIA_GS,key);return h+'</div>'+chipO('manual')+'<small class="nt">'+metaTxt(o,key)+(f.info?' · '+esc(f.info):'')+(vi?' · '+vi:'')+'</small></div>';
}
function listaHtml(f,o,ro){
  var arr=o.d[f.k]||[];
  var vl=ro?'':via(VIA_GS,f.k);return '<div class="ml"><div class="ml-cab"><b>'+esc(f.l)+'</b>'+chipO(ro?'api':'manual')+(vl?'<span class="nt">'+vl+'</span>':'')+(ro?'':'<button class="btn sec" data-mk="addlista" data-k="'+f.k+'" style="width:auto;padding:0 12px;height:30px">'+esc(f.add)+'</button>')+'</div>'+
   (arr.length?'<div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr>'+f.cols.map(function(c){return '<th>'+esc(c.l)+'</th>'}).join('')+(ro?'':'<th></th>')+'</tr></thead><tbody>'+arr.map(function(x,i){return '<tr>'+f.cols.map(function(c){var v=x[c.c]||'';return '<td data-rot="'+esc(c.l)+'">'+esc(c.t==='data'?fiso(v):v||'—')+'</td>'}).join('')+(ro?'':'<td class="c"><button class="ib" data-mk="rmlista" data-k="'+f.k+'" data-i="'+i+'" aria-label="Remover linha" title="Remover">'+ic('trash-2')+'</button></td>')+'</tr>'}).join('')+'</tbody></table></div>':'<div class="fe-vazio">Nada registrado.</div>')+'</div>';
}
function tipoShein(gs){var c=conDe(gs,'Shein');return c?c.tipo:''}
function devApi(gs){
  var n=(parseInt(gs.slice(-3),10)||1)%3,d=function(k){var x=new Date(hoje());x.setDate(x.getDate()-k);return iso(x)};
  var L=[{data:d(3),pedido:'SH'+gs.slice(-4)+'01',produto:'Vestido midi floral',motivo:'Tamanho errado'},{data:d(6),pedido:'SH'+gs.slice(-4)+'02',produto:'Blusa manga longa',motivo:'Defeito'},{data:d(9),pedido:'SH'+gs.slice(-4)+'03',produto:'Vestido midi floral',motivo:'Não gostou'},{data:d(14),pedido:'SH'+gs.slice(-4)+'04',produto:'Saia plissada',motivo:'Tamanho errado'}];
  return L.slice(0,2+n);
}
function blocoHtml(b,o,gs){
  var pre='',ro=false;VIA_GS=gs;
  if(b.id==='dev'&&mkt(gs)==='Shein'){
    var tp=tipoShein(gs);ro=tp==='Auto-operada'||tp==='Semi-gerenciada';
    pre='<div class="fe-aviso"><span><b>Origem: '+(ro?'API':'Manual')+'.</b> '+(ro?'Na loja '+tp.toLowerCase()+', a Shein envia as devoluções sozinha. Os registros abaixo vêm da API e não podem ser editados.':tp==='Full-gerenciada'?'Na loja full-gerenciada, a Shein não envia as devoluções. Preencha à mão.':'Esta loja ainda não tem o tipo de loja na conexão. Enquanto isso, preencha à mão. O tipo se informa em Conexões.')+'</span></div>';
    if(ro)o={d:Object.assign({},o.d,{'dev.lista':devApi(gs)}),m:o.m,snaps:o.snaps};
  }
  var h='';
  if(b.p3){
    var itens=b.it.filter(function(f){return !f.g}),glob=b.it.filter(function(f){return f.g});
    h+=glob.map(function(f){return campoHtml(f,o,b.id+'.'+f.k)}).join('');
    h+='<div class="tab-cartao"><table class="tab-fe tab-p3"><thead><tr><th>Campo</th><th>Produto 1</th><th>Produto 2</th><th>Produto 3</th></tr></thead><tbody>'+itens.map(function(f){
      return '<tr><td data-rot="Campo" class="lj-n">'+esc(f.l)+'</td>'+[0,1,2].map(function(i){var key='p'+i+'.'+f.k,v=o.d[key]||'',c;
        if(f.t==='calc')c='<b class="mf-calc" data-calc="'+key+'">'+esc(f.f(o.d,i))+'</b> '+chipO('calc');
        else if(f.t==='sel')c='<select class="sel" data-mf="'+key+'" aria-label="'+esc(f.l)+', produto '+(i+1)+'"><option value="">—</option>'+f.op.map(function(x){return '<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>';
        else if(f.t==='area')c='<textarea class="cb-area" rows="2" data-mf="'+key+'" aria-label="'+esc(f.l)+', produto '+(i+1)+'">'+esc(v)+'</textarea>';
        else c='<input data-mf="'+key+'" value="'+esc(v)+'" title="'+esc(metaTxt(o,key))+'" aria-label="'+esc(f.l)+', produto '+(i+1)+'">';
        return '<td data-rot="Produto '+(i+1)+'">'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div><div class="nt">Campos manuais. '+(VIA[mkt(gs)]?'Os que a API cobre (título, descrição, atributos, fotos, preço, variações e estoque, conforme a plataforma) virão por API quando o conector for ligado.':'Na Kwai todos os campos ficam manuais (a confirmar).')+'</div>';
    return h;
  }
  b.it.forEach(function(f){
    if(f.info&&!f.k&&!f.lista)h+='<div class="fe-aviso"><span>'+esc(f.info)+'</span></div>';
    else if(f.sec)h+='<div class="f-sub" style="margin-top:6px">'+esc(f.sec)+'</div>';
    else if(f.na)h+='<div class="mf na"><span class="mf-l">'+esc(f.l)+'</span><b>'+(f.txt||'Não se aplica')+'</b></div>';
    else if(f.fx)h+='<div class="mf"><span class="mf-l">'+esc(f.fx)+'</span><div class="mf-v"><b>'+esc(f.v({gs:gs,ini:lojaPor(gs).l.ini,cnpj:lojaPor(gs).l.cnpj,resp:lojaPor(gs).p.nome}))+'</b></div><span class="mo cad">Cadastro</span><small class="nt">Vem do cadastro da loja</small></div>';
    else if(f.lista)h+=listaHtml(f,o,ro);
    else h+=campoHtml(f,o,f.k);
  });
  return pre+h;
}
function todosCampos(gs){ /* lista plana para comparar análises */
  var m=mkt(gs),out=[];
  blocos(m).forEach(function(b){
    if(b.p3){b.it.forEach(function(f){if(f.t==='calc')return;for(var i=0;i<3;i++)out.push({k:'p'+i+'.'+f.k,l:NOMES_F[b.id]+' · Produto '+(i+1)+' · '+f.l})})}
    else b.it.forEach(function(f){if(f.k&&f.t!=='calc')out.push({k:f.k,l:NOMES_F[b.id]+' · '+f.l,lista:!!f.lista})});
  });
  return out;
}
function valSnap(d,c){var v=d[c.k];if(c.lista)return (v&&v.length?v.length+(v.length===1?' item':' itens'):'—');return v===undefined||v===''?'—':String(v)}
function histHtml(gs,o){
  var sn=o.snaps.slice().sort(function(a,b){return a.data<b.data?1:-1});
  var opt=function(sel,atual){return (atual?'<option value="atual"'+(sel==='atual'?' selected':'')+'>Análise em andamento (não salva)</option>':'')+sn.map(function(s){return '<option value="'+s.id+'"'+(String(s.id)===String(sel)?' selected':'')+'>'+fiso(s.data)+' · '+esc(s.autor)+'</option>'}).join('')};
  var h='<div class="fe-barra"><div class="fe-info">Cada análise é uma foto da loja, com data e autor. Elas nunca são apagadas. Para ver o relatório ou comparar, use os modos no alto da ficha.</div><button class="btn" data-mk="salvaranalise" style="width:auto;padding:0 14px">Salvar análise</button></div>';
  h+='<div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Data da análise</th><th>Autor</th><th>Observação</th></tr></thead><tbody>'+(sn.length?sn.map(function(s){return '<tr><td data-rot="Data da análise">'+fiso(s.data)+'</td><td data-rot="Autor">'+esc(s.autor)+'</td><td data-rot="Observação">'+esc(s.obs||'—')+'</td></tr>'}).join(''):'<tr><td colspan="3" class="vazio-t">Nenhuma análise salva ainda.</td></tr>')+'</tbody></table></div>';
  return h;
}
/* ---------- indicadores comparáveis (mesma régua em todas as plataformas) ---------- */
var IND=[{id:'ativos',t:'Produtos ativos',dir:'mais'},{id:'viol',t:'Violações e penalidades',dir:'menos'},{id:'dev',t:'Devoluções',dir:'menos'},{id:'faixa',t:'Faixa de saúde',ord:FX},{id:'fat',t:'Faturamento e pedidos',dir:'mais'},{id:'taxas',t:'Taxas e comissões',dir:'neutro'},{id:'camp',t:'Campanhas e cupons',dir:'neutro'}];
var ORD={'desemp.faixa':FX,'desemp.cor':['Vermelho','Laranja','Amarelo','Verde'],'diag.sp_nivel':['Melhorar','Qualificado','Excelente']};
var MENOS=['viol.lista','viol.total','viol.punicoes','viol.itens','viol.itens_n','viol.curso','viol.pontos','viol.aval_neg','viol.rej','viol.debitado','dev.lista','dev.total','desemp.canc','desemp.recl','desemp.atraso','desemp.sp_cancel','desemp.sp_devol','desemp.sp_atraso','desemp.sp_nao_cumpre','desemp.sp_preparo','diag.prob','diag.neg','diag.c','diag.pc','cat.sp_banido','cat.rev_rep','cat.rev_viol','diag.cd'];
var MAIS=['cat.ativos','cat.sp_normal','cat.v_no','cat.rev_ap','fat.pedidos','fat.total','desemp.nq','desemp.nl','desemp.dsr','desemp.pont','desemp.sp_nota','desemp.sp_chat','desemp.sp_notaloja','diag.boa','diag.nota','diag.a','diag.pa','viol.aprov','viol.taxa'];
function dirDe(k){return MENOS.indexOf(k)>-1?'menos':MAIS.indexOf(k)>-1?'mais':'neutro'}
function fmtN(v){return v===null||v===undefined?'—':Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2})}
function dlt(a,b,dir,ord,pct){
  if(a===null||a===undefined||b===null||b===undefined||a===''||b==='')return null;
  var df;if(ord){var ia=ord.indexOf(a),ib=ord.indexOf(b);if(ia<0||ib<0)return null;df=ia-ib;dir='mais'}else df=a-b;
  var seta=df>0?'▲':df<0?'▼':'=',cls=df===0||!dir||dir==='neutro'?'neu':((dir==='mais')===(df>0)?'mel':'pio');
  return {seta:seta,cls:cls,txt:ord?(df===0?'igual':'antes: '+b):(df===0?'sem mudança':(df>0?'+':'−')+fmtN(Math.abs(df))+(pct?'%':''))};
}
function dlHtml(d){return d?'<span class="dl '+d.cls+'"><b aria-hidden="true">'+d.seta+'</b> '+esc(d.txt)+'<span class="sr"> ('+(d.cls==='mel'?'melhorou':d.cls==='pio'?'piorou':'sem julgamento')+')</span></span>':''}
function indicD(d,m){
  var r={};
  r.ativos=m==='Shopee'?nv(d,'cat.sp_normal'):m==='Kwai'?nv(d,'cat.v_no'):nv(d,'cat.ativos');
  r.viol=m==='Shopee'?(d['viol.punicoes']||[]).length:(d['viol.lista']||[]).length;
  r.dev=(d['dev.lista']||[]).length;
  var fx=m==='Mercado Livre'?faixaDeCor(d['desemp.cor']):m==='Shopee'?faixaDeNota(d['desemp.sp_nota']):(d['desemp.faixa']||'—');r.faixa=fx==='—'?null:fx;
  r.pedidos=nv(d,'fat.pedidos');r.fat=nv(d,'fat.total');
  r.taxas=m==='Kwai'?'na':soma([nv(d,'fin.comissao'),nv(d,'fin.servico'),nv(d,'fin.transacao')]);
  r.camp=(d['mkt.camp']||[]).length;r.cupons=nv(d,'mkt.cupom_qtd');
  return r;
}
function indVal(r,id){
  switch(id){
   case 'ativos':return {t:fmtN(r.ativos),n:r.ativos};
   case 'viol':return {t:fmtN(r.viol),n:r.viol};
   case 'dev':return {t:fmtN(r.dev),n:r.dev};
   case 'faixa':return {t:r.faixa||'—',o:r.faixa};
   case 'fat':return {t:r.fat===null?'—':R(r.fat),n:r.fat,sub:r.pedidos===null?'':fmtN(r.pedidos)+' pedidos'};
   case 'taxas':return r.taxas==='na'?{t:'A confirmar',na:1}:{t:r.taxas===null?'—':R(r.taxas),n:r.taxas};
   case 'camp':return {t:fmtN(r.camp)+(r.camp===1?' campanha':' campanhas'),n:r.camp,sub:r.cupons===null?'cupons não informados':fmtN(r.cupons)+(r.cupons===1?' cupom':' cupons')};
  }
}
function indDelta(ind,ra,rb){var a=indVal(ra,ind.id),b=indVal(rb,ind.id);if(a.na||b.na)return null;return ind.ord?dlt(a.o,b.o,null,ind.ord):dlt(a.n,b.n,ind.dir)}
/* ---------- relatório de uma loja (uma página, só leitura) ---------- */
function snapsOrd(gs){return lj(gs).snaps.slice().sort(function(a,b){return a.data<b.data?1:a.data>b.data?-1:b.id-a.id})}
function relDados(gs){
  var sn=snapsOrd(gs),o=lj(gs),i=-1;
  if(relSnap&&relSnap!=='atual')sn.forEach(function(s,k){if(String(s.id)===String(relSnap))i=k});
  if(relSnap==='atual'||(!sn.length)){return {atual:{id:'atual',d:o.d,data:'',autor:'Análise em andamento (não salva)',obs:''},ant:sn[0]||null,sn:sn}}
  if(i<0)i=0;return {atual:sn[i],ant:sn[i+1]||null,sn:sn};
}
function valCampo(d,f,key){if(f.t==='calc')return f.f(d,0);if(f.lista)return (d[key]||[]).length;return d[key]===undefined?'':d[key]}
function listaTxt(f,arr){return arr.map(function(x){return esc(f.cols.map(function(c){var v=x[c.c]||'';return v?(c.t==='data'?fiso(v):v):''}).filter(Boolean).join(' · '))}).join('<br>')||'—'}
function relLinha(f,key,da,db,tmp){
  var va=valCampo(da,f,key),vb=db?valCampo(db,f,key):undefined;
  if((va===''||va==='—')&&(vb===undefined||vb===''||vb==='—'))return '';
  var dl=null,o=ORD[key];
  if(db&&vb!==undefined&&vb!==''&&va!==''){
    if(f.lista)dl=dlt(va,vb,dirDe(key));
    else if(o)dl=dlt(va,vb,null,o);
    else{var x=pN(va),y=pN(vb);if(x!==null&&y!==null)dl=dlt(x,y,dirDe(key),null,String(va).indexOf('%')>-1&&f.t!=='num');else if(String(va)!==String(vb))dl={seta:'●',cls:'neu',txt:'mudou'}}
  }
  var txt=f.lista?listaTxt(f,da[key]||[]):esc(va===''?'—':va+(f.suf&&f.suf!=='R$'&&va!=='—'&&String(va).indexOf(f.suf)<0?' '+f.suf:''));
  if(f.suf==='R$'&&va!==''&&va!=='—'&&!f.lista)txt=esc(R(num(va)));
  return '<div class="rl-l"><span class="rl-k">'+esc(f.l)+'</span><span class="rl-v">'+txt+(dl&&db&&vb!==undefined&&vb!==''&&!f.lista?'<small class="nt">antes: '+esc(f.suf==='R$'?R(num(vb)):vb)+'</small>':'')+'</span><span class="rl-d">'+dlHtml(dl)+'</span></div>';
}
function relSecoes(gs,da,db){
  var m=mkt(gs),h='',nsec=0;
  blocos(m).forEach(function(b){
    if(b.id==='cad')return;var rows='';
    if(b.p3){
      var fs=b.it.filter(function(f){return !f.g}).map(function(f){var vs=[0,1,2].map(function(i){var v=f.t==='calc'?f.f(da,i):(da['p'+i+'.'+f.k]||'');return v===''||v===undefined?'—':String(v)});return vs.some(function(v){return v!=='—'})?'<tr><td data-rot="Campo">'+esc(f.l)+'</td>'+vs.map(function(v,i){return '<td data-rot="Produto '+(i+1)+'">'+esc(v)+'</td>'}).join('')+'</tr>':''}).join('');
      if(fs)rows='<div class="tab-cartao"><table class="tab-fe tab-ml tab-rl"><thead><tr><th>Campo</th><th>Produto 1</th><th>Produto 2</th><th>Produto 3</th></tr></thead><tbody>'+fs+'</tbody></table></div>';
    }else b.it.forEach(function(f){
      if(f.sec||f.na||f.fx||(!f.k&&!f.lista))return;
      if(f.t==='calc'&&(f.k==='desemp.faixa'))return;
      rows+=relLinha(f,f.k,da,db);
    });
    if(rows){h+='<section class="rl-s rs-'+(nsec%5)+'"><h4><i>'+(nsec+1)+'</i>'+esc(b.t)+'</h4><div class="rl-b">'+rows+'</div></section>';nsec++}
  });
  return h||'<div class="fe-vazio">Esta análise ainda não tem nenhum campo preenchido.</div>';
}
function relCorpo(gs,R0){
  var x=lojaPor(gs),m=x.l.plat,r=R0||relDados(gs),A=r.atual,B=r.ant,ia=indicD(A.d,m),ib=B?indicD(B.d,m):null;
  var cards='<div class="rl-ind">'+IND.map(function(ind){var v=indVal(ia,ind.id),d=ib?indDelta(ind,ia,ib):null;
    return '<div class="rl-c"><small>'+ind.t+'</small><b class="'+(ind.id==='faixa'&&v.o?'fx-'+FXC[v.o]:'')+'">'+esc(v.t)+'</b>'+(v.sub?'<span class="nt">'+esc(v.sub)+'</span>':'')+(ib?'<span class="rl-cd">'+(dlHtml(d)||'<span class="nt">—</span>')+'</span>':'')+'</div>'}).join('')+'</div>';
  return '<div class="rl-cab"><div><h3>'+esc(x.l.n)+'</h3><div class="mk-sub">'+logo(m)+'<span class="mono">'+esc(gs)+'</span><span class="nt">Responsável: '+esc(x.p.nome)+'</span></div></div><div class="rl-meta"><div><small>Análise</small><b>'+(A.data?fiso(A.data):'Em andamento')+'</b><span class="nt">'+esc(A.autor)+'</span></div><div><small>Comparada com</small><b>'+(B?fiso(B.data):'—')+'</b><span class="nt">'+(B?esc(B.autor):'Sem análise anterior')+'</span></div></div></div>'+
   (B?'<div class="rl-leg"><span class="dl mel"><b>▲▼</b> verde: melhorou</span><span class="dl pio"><b>▲▼</b> vermelho: piorou</span><span class="dl neu"><b>▲▼</b> cinza: só mostra a variação</span></div>':'<div class="fe-aviso"><span>Esta é a primeira análise da loja. Nada para comparar ainda.</span></div>')+cards+'<div class="rl-cols">'+relSecoes(gs,A.d,B?B.d:null)+'</div>';
}
function relHtml(gs){
  var r=relDados(gs),opt=r.sn.map(function(s){return '<option value="'+s.id+'"'+(String(s.id)===String(r.atual.id)?' selected':'')+'>'+fiso(s.data)+' · '+esc(s.autor)+'</option>'}).join('')+'<option value="atual"'+(r.atual.id==='atual'?' selected':'')+'>Análise em andamento (não salva)</option>';
  return '<div class="mk-corpo"><div class="fe-barra"><label class="sel-p"><span>Análise exibida</span><select class="sel" id="rel-s">'+opt+'</select></label><button class="btn sec" data-mk="pdfloja" style="width:auto;padding:0 14px">'+ic('file-down')+'Exportar PDF</button></div><div class="rl fe-w" id="rel-area">'+relCorpo(gs,r)+'</div></div>';
}
/* ---------- comparar duas análises ---------- */
function cmpHtml(gs,o){
  var sn=snapsOrd(gs);
  if(!sn.length)return '<div class="mk-corpo"><div class="fe-aviso"><span>Salve ao menos uma análise para poder comparar. Use “Salvar análise” no modo Preencher, na aba Histórico de análises.</span></div></div>';
  var opt=function(sel,atual){return (atual?'<option value="atual"'+(sel==='atual'?' selected':'')+'>Análise em andamento (não salva)</option>':'')+sn.map(function(s){return '<option value="'+s.id+'"'+(String(s.id)===String(sel)?' selected':'')+'>'+fiso(s.data)+' · '+esc(s.autor)+'</option>'}).join('')};
  if(!cmpA||!sn.some(function(s){return String(s.id)===String(cmpA)}))cmpA=sn[sn.length>1?1:0].id;
  var A=sn.filter(function(s){return String(s.id)===String(cmpA)})[0],B=cmpB==='atual'?{d:o.d}:sn.filter(function(s){return String(s.id)===String(cmpB)})[0]||{d:o.d};
  var rows=todosCampos(gs).map(function(c){var a=valSnap(A.d,c),b=valSnap(B.d,c),x=pN(a),y=pN(b);return {c:c,a:a,b:b,dl:x!==null&&y!==null?dlt(y,x,dirDe(c.k)):(a!==b&&a!=='—'&&b!=='—'?{seta:'●',cls:'neu',txt:'mudou'}:null)}});
  var dif=rows.filter(function(r){return r.a!==r.b});
  return '<div class="mk-corpo"><div class="cmp-sel"><label class="sel-p"><span>Análise A (antes)</span><select class="sel" id="cmp-a">'+opt(cmpA,false)+'</select></label><label class="sel-p"><span>Análise B (depois)</span><select class="sel" id="cmp-b">'+opt(cmpB,true)+'</select></label><label class="lembrar"><input type="checkbox" id="cmp-t"'+(cmpTodos?' checked':'')+'>Mostrar todos os campos</label></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Campo</th><th>Análise A</th><th>Análise B</th><th>Variação</th></tr></thead><tbody>'+((cmpTodos?rows:dif).length?(cmpTodos?rows:dif).map(function(r){return '<tr class="'+(r.a!==r.b?'dif':'')+'"><td data-rot="Campo">'+esc(r.c.l)+'</td><td data-rot="Análise A">'+esc(r.a)+'</td><td data-rot="Análise B">'+esc(r.b)+'</td><td data-rot="Variação">'+(dlHtml(r.dl)||'<span class="nt">—</span>')+'</td></tr>'}).join(''):'<tr><td colspan="4" class="vazio-t">Nenhuma diferença entre as duas análises.</td></tr>')+'</tbody></table></div></div>';
}
/* ---------- visão do cliente: todas as lojas e plataformas juntas ---------- */
function agregaPlat(p){
  var out={};MKTS.forEach(function(m){
    var ls=p.lojas.filter(function(l){return l.plat===m}),com=ls.filter(function(l){return ultimaAn(l.gs)}),rs=com.map(function(l){return indicD(ultimaAn(l.gs).d,m)});
    var ag={m:m,n:ls.length,com:com.length,lojas:ls};
    if(com.length){
      var sm=function(k){return soma(rs.map(function(r){return r[k]}))};
      ag.r={ativos:sm('ativos'),viol:sm('viol'),dev:sm('dev'),fat:sm('fat'),pedidos:sm('pedidos'),camp:sm('camp'),cupons:sm('cupons'),
        taxas:m==='Kwai'?'na':sm('taxas'),faixa:rs.map(function(r){return r.faixa}).filter(Boolean).sort(function(a,b){return FX.indexOf(a)-FX.indexOf(b)})[0]||null};
    }
    out[m]=ag;
  });
  return out;
}
function melhorPior(ind,ags){
  if(ind.dir==='neutro')return {};
  var vs=[];MKTS.forEach(function(m){var a=ags[m];if(!a.r)return;var v=indVal(a.r,ind.id);var n=ind.ord?FX.indexOf(v.o):v.n;if(v.na||n===null||n===undefined||n<0)return;vs.push({m:m,n:n})});
  if(vs.length<2)return {};var mx=Math.max.apply(null,vs.map(function(x){return x.n})),mn=Math.min.apply(null,vs.map(function(x){return x.n}));if(mx===mn)return {};
  var bom=(ind.dir==='menos')?mn:mx,ruim=(ind.dir==='menos')?mx:mn,r={};vs.forEach(function(x){if(x.n===bom)r[x.m]='mel';else if(x.n===ruim)r[x.m]='pio'});return r;
}
function visaoCliente(p){
  var ags=agregaPlat(p),tem=MKTS.some(function(m){return ags[m].com});
  var lojas='<div class="vc-lojas">'+MKTS.map(function(m){var a=ags[m];return a.n?'<div class="vc-lj"><div class="vc-lj-t">'+logo(m)+'</div>'+a.lojas.map(function(l){return '<div class="vc-lj-l"><span class="vc-n">'+esc(l.n)+'</span><span>'+seloHtml(l.gs)+'</span>'+(ultimaAn(l.gs)?'<button class="btn sec" data-rel="'+esc(l.gs)+'" data-snap="" style="width:auto;padding:0 10px;height:28px">Relatório</button>':'')+'</div>'}).join('')+'</div>':''}).join('')+'</div>';
  var linhas=IND.map(function(ind){
    var mp=melhorPior(ind,ags);
    return '<div class="vc-r"><div class="vc-i">'+esc(ind.t)+'</div>'+MKTS.map(function(m){var a=ags[m],c;
      if(!a.n)c='<span class="nt">Sem loja</span>';else if(!a.r)c='<span class="nt">Sem análise</span>';else{var v=indVal(a.r,ind.id);c='<b>'+esc(v.t)+'</b>'+(v.sub?'<small class="nt">'+esc(v.sub)+'</small>':'')+(mp[m]?'<span class="vc-tag '+mp[m]+'">'+(mp[m]==='mel'?'melhor':'pior')+'</span>':'')}
      return '<div class="vc-c'+(mp[m]?' '+mp[m]:'')+'" data-rot="'+esc(m)+'">'+c+'</div>'}).join('')+'</div>'}).join('');
  var cab='<div class="vc-r vc-h"><div class="vc-i">Indicador</div>'+MKTS.map(function(m){return '<div class="vc-c">'+logo(m)+'<small class="nt">'+ags[m].com+' de '+ags[m].n+(ags[m].n===1?' loja':' lojas')+' com análise</small></div>'}).join('')+'</div>';
  return '<div class="vc-w"><div class="fe-barra"><div class="fe-info">Visão do cliente: usa a análise mais recente de cada loja. Valores somados por plataforma.</div><button class="btn sec" data-fa="pdfcliente" style="width:auto;padding:0 14px">'+ic('file-down')+'Exportar PDF</button></div>'+
   '<div id="vc-area" class="vc-area">'+(tem?'':'<div class="fe-aviso"><span>Nenhuma loja deste cliente tem análise ainda.</span></div>')+'<div class="vc">'+cab+linhas+'</div>'+
   '<div class="vc-leg"><span class="vc-tag mel">melhor</span><span class="vc-tag pio">pior</span><span class="nt">entre as plataformas do cliente. Indicadores sem julgamento não recebem cor.</span></div>'+lojas+'</div></div>';
}
function historicoHtml(p){
  var it=[];p.lojas.forEach(function(l){lj(l.gs).snaps.forEach(function(s){it.push({l:l,s:s})})});
  it.sort(function(a,b){return a.s.data<b.s.data?1:a.s.data>b.s.data?-1:0});
  return it.length?it.map(function(x){return '<div class="f-lin"><div style="min-width:0"><div class="pg">'+logoI(x.l.plat)+' '+esc(x.l.n)+'</div><div class="nt">'+fiso(x.s.data)+' · '+esc(x.s.autor)+(x.s.obs?' · '+esc(x.s.obs):'')+'</div></div><button class="btn sec" style="width:auto;padding:0 10px;height:28px" data-rel="'+esc(x.l.gs)+'" data-snap="'+x.s.id+'">Abrir relatório</button></div>'}).join(''):'<div class="f-vazio">Nenhuma análise salva para este cliente.</div>';
}
function nAnalises(p){var n=0;p.lojas.forEach(function(l){n+=lj(l.gs).snaps.length});return n}
function conHtml(l){var s=sitLoja({l:l});return chip(s,SITC[s])}
/* ---------- exportar PDF (na prévia só mostra o layout de impressão) ---------- */
function pdfPrev(arquivo,corpo){
  var ant=document.activeElement,v=document.createElement('div');v.className='veu';var g=document.createElement('div');g.className='pdf-jan';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Prévia do PDF');
  g.innerHTML='<div class="pdf-cab"><div style="min-width:0"><h3>Prévia do PDF</h3><div class="nt">Arquivo: '+esc(arquivo)+'</div></div><div class="pdf-bt"><button class="btn sec" data-pdf="fechar" style="width:auto;padding:0 14px">Fechar</button><button class="btn" data-pdf="baixar" style="width:auto;padding:0 14px">Baixar PDF</button></div></div><div class="pdf-fundo"><div class="pdf-pag fe-w" id="pdf-area"><div class="pdf-topo"><b>IT.MK</b><span>40% · Consultoria de marketplaces</span><span>Gerado em '+fd(new Date())+' por '+esc(EU)+'</span></div>'+corpo+'</div></div>';
  document.body.appendChild(v);document.body.appendChild(g);requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape'&&!document.querySelector('.modal'))fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);
  g.addEventListener('click',function(e){var b=e.target.closest('[data-pdf]');if(!b)return;if(b.dataset.pdf==='fechar')fechar();else{U.toast('Na prévia o arquivo não é gerado. Na versão final este botão baixa “'+arquivo+'”.');document.body.classList.add('imprimindo');try{window.print()}catch(x){}document.body.classList.remove('imprimindo')}});
  g.querySelector('[data-pdf="fechar"]').focus();
}
function nomeArq(t,dt){return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)+'-'+(dt||iso(hoje()))+'.pdf'}
function pdfCliente(p){
  var h=visaoCliente(p),tmp=document.createElement('div');tmp.innerHTML=h;var a=tmp.querySelector('#vc-area');
  pdfPrev(nomeArq('analise-'+p.nome),'<h3 class="pdf-t">Análise do cliente · '+esc(p.nome)+'</h3>'+(a?a.outerHTML:''));
}
/* ---------- Painel ---------- */
function painel(){
  var L=lojas(),n=L.length,cont=function(f){return L.filter(f).length};
  var sel=L.map(function(x){return {x:x,s:seloAn(x.l.gs),c:sitLoja(x)}});
  var conect=sel.filter(function(r){return r.c==='Conectada'}).length,sem=sel.filter(function(r){return r.s.t==='Sem análise'}).length,des=sel.filter(function(r){return r.s.t==='Desatualizada'}).length;
  var kpis='<div class="fe-cont pn-k">'+[['Lojas',n,''],['Conectadas',conect,''],['Sem análise',sem,sem?'pend':''],['Desatualizadas (mais de 30 dias)',des,des?'pend':'']].map(function(k){return '<div class="fe-k"><small>'+k[0]+'</small><b class="'+k[2]+'">'+k[1]+'</b></div>'}).join('')+'</div>';
  var porPlat='<div class="cx"><div class="cx-cab"><h3>Lojas por plataforma</h3></div><div class="pn-b pn-b4">'+MKTS.map(function(m){var q=cont(function(x){return x.l.plat===m});return '<div class="pn-bl"><span>'+logo(m)+'</span><b>'+q+'</b><div class="pn-bar"><i style="width:'+Math.round(q/n*100)+'%;background:'+LOGO[m][1]+'"></i></div></div>'}).join('')+'</div></div>';
  var conSit='<div class="cx"><div class="cx-cab"><h3>Conexões por situação</h3></div><div class="pn-t"><table class="tab-fe tab-ml"><thead><tr><th>Plataforma</th>'+SITS.map(function(s){return '<th>'+s+'</th>'}).join('')+'</tr></thead><tbody>'+MKTS.map(function(m){return '<tr><td data-rot="Plataforma">'+logo(m)+'</td>'+SITS.map(function(s){var q=sel.filter(function(r){return r.x.l.plat===m&&r.c===s}).length;return '<td data-rot="'+s+'" class="'+(q&&(s==='Com erro'||s==='Vencida')?'pn-alerta':'')+'">'+q+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div></div>';
  var pend=sel.filter(function(r){return r.s.t!=='Em dia'}).sort(function(a,b){return (b.s.dias===null?9999:b.s.dias)-(a.s.dias===null?9999:a.s.dias)});
  var lista='<div class="cx pn-w"><div class="cx-cab"><h3>Lojas sem análise ou desatualizadas</h3><span class="c" style="margin-left:auto">'+pend.length+'</span></div>'+(pend.length?'<table class="tab-fe tab-ml"><thead><tr><th>Loja</th><th>Plataforma</th><th>Responsável</th><th>Situação da análise</th><th>Última análise</th><th></th></tr></thead><tbody>'+pend.map(function(r){return '<tr><td data-rot="Loja"><div class="lj-n">'+esc(r.x.l.n)+'</div><div class="lj-gs">'+esc(r.x.l.gs)+'</div></td><td data-rot="Plataforma">'+logo(r.x.l.plat)+'</td><td data-rot="Responsável" class="rp">'+esc(r.x.p.nome)+'</td><td data-rot="Situação da análise">'+seloHtml(r.x.l.gs)+'</td><td data-rot="Última análise">'+(r.s.data?fiso(r.s.data)+'<div class="nt">há '+r.s.dias+' dias</div>':'<span class="nt">Nunca</span>')+'</td><td class="rc-ac" data-rot="Ação"><button class="btn sec" data-mk="focar" data-gs="'+esc(r.x.l.gs)+'" style="width:auto;padding:0 10px;height:30px">Abrir ficha</button></td></tr>'}).join('')+'</tbody></table>':'<div class="fe-vazio">Todas as lojas estão com a análise em dia.</div>')+'</div>';
  var med=function(m,id){var rs=L.filter(function(x){return x.l.plat===m&&ultimaAn(x.l.gs)}).map(function(x){return indicD(ultimaAn(x.l.gs).d,m)});if(!rs.length)return '<span class="nt">Sem análise</span>';
    var vs=rs.map(function(r){return id==='faixa'?(r.faixa?FX.indexOf(r.faixa):null):id==='taxas'?(r.taxas==='na'?'na':r.taxas):r[id]});if(vs.some(function(v){return v==='na'}))return '<span class="nt">A confirmar</span>';vs=vs.filter(function(v){return v!==null&&v!==undefined});if(!vs.length)return '<span class="nt">—</span>';
    var a=vs.reduce(function(s,v){return s+v},0)/vs.length;return id==='faixa'?FX[Math.round(a)]:(id==='fat'||id==='taxas')?R(a):fmtN(Math.round(a*10)/10)};
  var IM=[['ativos','Produtos ativos'],['viol','Violações e penalidades'],['dev','Devoluções'],['faixa','Faixa de saúde (média)'],['fat','Faturamento no mês'],['taxas','Taxas e comissões']];
  var medias='<div class="cx pn-w"><div class="cx-cab"><h3>Indicadores médios por plataforma</h3><span class="nt" style="margin-left:auto">Média das lojas, pela análise mais recente de cada uma</span></div><table class="tab-fe tab-ml"><thead><tr><th>Indicador</th>'+MKTS.map(function(m){return '<th>'+m+'</th>'}).join('')+'</tr></thead><tbody>'+IM.map(function(i){return '<tr><td data-rot="Indicador"><b>'+i[1]+'</b></td>'+MKTS.map(function(m){return '<td data-rot="'+m+'">'+med(m,i[0])+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
  return kpis+porPlat.replace('class="cx"','class="cx pn-w"')+conSit.replace('class="cx"','class="cx pn-w"')+lista+medias;
}
function abrirFicha(gs,o){fichaGs=gs;fichaAba='cad';fichaModo=(o&&o.modo)||'preencher';relSnap=(o&&o.snap)||'';pintar();window.scrollTo(0,0)}
function focar(gs,o){aba='lojas';fichaGs=gs;fichaAba='cad';fichaModo=(o&&o.modo)||'preencher';relSnap=(o&&o.snap)||'';F.limpar()}
function fichaView(){
  var gs=fichaGs,x=lojaPor(gs),o=lj(gs),m=x.l.plat,c=conDe(gs,m),s=c?sitEf(c):'Sem conexão',bs=blocos(m);
  var an=o.snaps.length?o.snaps.slice().sort(function(a,b){return a.data<b.data?1:-1})[0].data:null;
  var corpo=fichaModo==='relatorio'?relHtml(gs):fichaModo==='comparar'?cmpHtml(gs,o):fichaAba==='hist'?'<div class="mk-corpo">'+histHtml(gs,o)+'</div>':(function(){var b=bs.filter(function(y){return y.id===fichaAba})[0];return '<div class="mk-corpo">'+blocoHtml(b,o,gs)+'</div>'})();
  return '<div class="mk-fv"><div class="mk-cab"><button class="btn sec mk-voltar" data-voltar style="width:auto;padding:0 12px">'+ic('arrow-left')+'Voltar para as lojas</button><div style="min-width:0"><h3>'+esc(x.l.n)+'</h3><div class="mk-sub">'+logo(m)+'<span class="mono">'+esc(gs)+'</span>'+chip(s,SITC[s])+''+seloHtml(gs)+'<span class="nt">Última análise: '+(an?fiso(an):'nunca')+'</span></div></div></div>'+
   '<div class="mk-modos" role="tablist" aria-label="Modo da ficha">'+[['preencher','Preencher','pencil'],['relatorio','Relatório','file-text'],['comparar','Comparar','git-compare']].map(function(a){return '<button role="tab" class="mk-modo" data-fmodo="'+a[0]+'" aria-selected="'+(fichaModo===a[0])+'">'+ic(a[2])+a[1]+'</button>'}).join('')+'</div>'+
   (fichaModo==='preencher'?'<div class="mk-abas" role="tablist" aria-label="Seções da ficha da loja">'+ABAS_F.map(function(a){return '<button role="tab" class="mk-aba" data-faba="'+a+'" aria-selected="'+(fichaAba===a)+'">'+NOMES_F[a]+'</button>'}).join('')+'</div>':'')+corpo+(fichaModo==='preencher'?'<div class="mk-pe">Campo manual guarda quem preencheu e quando. Quando o motor for ligado, o selo muda para API e o campo deixa de ser editável.</div>':'')+'</div>';
}
function paintFicha(){pintar()}
function fichaClique(e){
  var t=e.target,b;
  if((b=t.closest('[data-faba]'))){fichaAba=b.dataset.faba;pintar();return true}
  if((b=t.closest('[data-fmodo]'))){fichaModo=b.dataset.fmodo;pintar();return true}
  if((b=t.closest('[data-mk="pdfloja"]'))){var xx=lojaPor(fichaGs),ad=relDados(fichaGs).atual;pdfPrev(nomeArq('relatorio-'+xx.l.n,ad.data),'<h3 class="pdf-t">Relatório da loja</h3>'+relCorpo(fichaGs));return true}
  if(!(b=t.closest('[data-mk]')))return false;var a=b.dataset.mk,o=lj(fichaGs),m=mkt(fichaGs),f;
  if(a==='addlista'||a==='rmlista'){
    f=null;blocos(m).forEach(function(bl){bl.it.forEach(function(it){if(it.lista&&it.k===b.dataset.k)f=it})});
    if(a==='rmlista'){(o.d[f.k]=o.d[f.k]||[]).splice(+b.dataset.i,1);paintFicha();U.toast('Linha removida.');return true}
    var viols=(o.d['viol.lista']||[]).map(function(x){return x.motivo}).filter(Boolean);
    U.modal({titulo:f.add,ok:'Adicionar',html:'<div class="f-grade">'+f.cols.map(function(c,i){var campo='<div class="campo"><label for="ml-'+i+'">'+esc(c.l)+'</label>';
      if(c.t==='sel')return campo+'<select class="sel" id="ml-'+i+'">'+c.op.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')+'</select></div>';
      if(c.t==='violsel')return campo+(viols.length?'<select class="sel" id="ml-'+i+'">'+viols.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')+'</select>':'<input id="ml-'+i+'" placeholder="Motivo da violação">')+'</div>';
      return campo+'<input id="ml-'+i+'"'+(c.t==='data'?' type="date"':'')+'></div>'}).join('')+'</div>',
      onOk:function(mm){var row={};f.cols.forEach(function(c,i){row[c.c]=mm.querySelector('#ml-'+i).value.trim()});if(!Object.keys(row).some(function(k){return row[k]})){U.toast('Preencha ao menos um campo.');return false}(o.d[f.k]=o.d[f.k]||[]).push(row);o.m[f.k]={q:EU,t:agora()};paintFicha();U.toast('Adicionado.')}});return true}
  if(a==='salvaranalise'){
    U.modal({titulo:'Salvar análise',ok:'Salvar análise',html:'<p class="dica-m">A análise guarda uma foto de todos os campos da loja. Ela nunca é apagada.</p><div class="campo"><label for="an-d">Data da análise <i class="obr">*</i></label><input id="an-d" type="date" value="'+iso(hoje())+'"></div><div class="campo" style="margin-top:10px"><label for="an-o">Observação</label><textarea id="an-o" class="cb-area" rows="3"></textarea></div><small class="erro" id="an-e" hidden>Informe a data da análise.</small>',
      onOk:function(mm){var d=mm.querySelector('#an-d').value;if(!d){mm.querySelector('#an-e').hidden=false;return false}o.snaps.push({id:DB.nid++,data:d,autor:EU,obs:mm.querySelector('#an-o').value.trim(),d:JSON.parse(JSON.stringify(o.d))});paintFicha();U.toast('Análise salva em '+fiso(d)+'.')}});return true
  }
  return false;
}
function fichaMudou(e){
  var t=e.target,o=lj(fichaGs);
  if(t.dataset.mf){var k=t.dataset.mf,v=t.value;if(o.d[k]===v||(o.d[k]===undefined&&v===''))return true;o.d[k]=v;o.m[k]={q:EU,t:agora()};
    var meta=t.closest('.mf');if(meta){var sm=meta.querySelector('small.nt');if(sm)sm.textContent='Preenchido por '+EU+' em '+o.m[k].t}
    blocos(mkt(fichaGs)).forEach(function(b){if(b.id!==fichaAba)return;b.it.forEach(function(f){if(f.t!=='calc')return;if(b.p3){for(var i=0;i<3;i++){var e1=document.querySelector('[data-calc="p'+i+'.'+f.k+'"]');if(e1)e1.textContent=f.f(o.d,i)}}else{var e2=document.querySelector('[data-calc="'+f.k+'"]');if(e2)e2.textContent=f.f(o.d)}})});
    U.toast('Salvo. Preenchido por '+EU+'.');return true}
  if(t.id==='rel-s'){relSnap=t.value;paintFicha();return true}
  if(t.id==='cmp-a'){cmpA=t.value;paintFicha();return true}if(t.id==='cmp-b'){cmpB=t.value;paintFicha();return true}if(t.id==='cmp-t'){cmpTodos=t.checked;paintFicha();return true}
  return false;
}
/* ---------- aba Conexões ---------- */
function subTabs(lista,cur,attr,rotulo){return '<div class="mk-subabas" role="tablist" aria-label="'+rotulo+'">'+lista.map(function(x){return '<button role="tab" class="mk-sub" data-'+attr+'="'+esc(x[0])+'" aria-selected="'+(cur===x[0])+'">'+esc(x[1])+(x[2]!==undefined?' <b>'+x[2]+'</b>':'')+'</button>'}).join('')+'</div>'}
function respOp(){return PAGS.map(function(p){return '<option value="'+p.id+'"'+(String(p.id)===String(fResp)?' selected':'')+'>'+esc(p.nome)+'</option>'}).join('')}
function conLinhas(){
  var L=lojas(),out=[];
  L.forEach(function(x){var c=conDe(x.l.gs,x.l.plat);out.push({x:x,c:c,sit:c?sitEf(c):'Sem conexão',mkt:x.l.plat})});
  DB.con.forEach(function(c){if(c.mkt!==lojaPor(c.gs).l.plat)out.push({x:lojaPor(c.gs),c:c,sit:sitEf(c),mkt:c.mkt})});
  return out.filter(function(r){return F.passa({p:r.x.p,l:r.x.l,plat:r.mkt,con:r.sit})});
}
function SP(){return F.get().plat||'Todas'}
function contC(m){var s=F.get().plat;F.set({plat:m==='Todas'?'':m});var n=conLinhas().length;F.set({plat:s});return n}
function abaConexoes(){
  var all=conLinhas(),cnt={};SITS.forEach(function(s){cnt[s]=all.filter(function(r){return r.sit===s}).length});
  return subTabs([['Todas','Todas',contC('Todas')]].concat(MKTS.map(function(m){return [m,m,contC(m)]})),SP(),'subc','Conexões por marketplace')+'<div class="fe-cont mk-cont">'+SITS.map(function(s){return '<div class="fe-k"><small>'+s+'</small><b class="'+(s==='Com erro'||s==='Vencida'?(cnt[s]?'pend':''):'')+'">'+cnt[s]+'</b></div>'}).join('')+'</div>'+
   F.html({semPlat:true,extra:'<div class="fe-info">As conexões são feitas no Java do BL. Aqui você só vê a situação e pede a reconexão.</div>'})+
   '<div class="tab-cartao"><table class="tab-fe tab-ml"><colgroup><col style="width:21%"><col style="width:15%"><col style="width:11%"><col style="width:12%"><col style="width:9%"><col style="width:11%"><col style="width:10%"><col style="width:11%"></colgroup><thead><tr><th>Loja (GS)</th><th>Responsável</th><th>Marketplace</th><th>Situação</th><th>Autorizada em</th><th>Validade</th><th>Última atualização</th><th></th></tr></thead><tbody>'+
   (all.length?all.map(function(r){var c=r.c;return '<tr><td data-rot="Loja (GS)"><div class="lj-n">'+esc(r.x.l.n)+'</div><div class="lj-gs">'+esc(r.x.l.gs)+'</div></td><td data-rot="Responsável" class="rp">'+esc(r.x.p.nome)+'</td><td data-rot="Marketplace">'+logo(r.mkt)+'</td><td data-rot="Situação">'+chip(r.sit,SITC[r.sit])+'</td><td data-rot="Autorizada em">'+(c&&c.autEm?fiso(c.autEm):'<span class="nt">—</span>')+'</td><td data-rot="Validade">'+(c?validTxt(c):'<span class="nt">—</span>')+'</td><td data-rot="Última atualização">'+(c&&c.at?'<div>'+esc(c.at.t)+'</div><div class="nt">'+esc(c.at.q)+'</div>':'<span class="nt">—</span>')+'</td><td class="rc-ac" data-rot="Ação"><button class="btn sec" data-mk="editar" data-gs="'+r.x.l.gs+'" data-m="'+esc(r.mkt)+'" style="width:auto;padding:0 10px;height:30px">'+(c?'Abrir':'Ver')+'</button></td></tr>'}).join(''):'<tr><td colspan="8" class="vazio-t"><b>Nenhuma conexão neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
function lojaOp(sel){return lojas().map(function(x){return '<option value="'+x.l.gs+'"'+(x.l.gs===sel?' selected':'')+'>'+esc(x.l.n)+' · '+esc(x.l.gs)+'</option>'}).join('')}
var ROT_ID={'Shopee':'Identificador da loja na Shopee','Shein':'ID da loja na Shein','Mercado Livre':'ID do usuário no Mercado Livre','Kwai':'ID do comerciante na Kwai'};
function cadastroCon(gs,m){
  var c=gs?conDe(gs,m):null,x=lojaPor(gs);
  var ant=document.activeElement,v=document.createElement('div');v.className='veu';var g=document.createElement('aside');g.className='gaveta larga';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Conexão da loja');
  function kv(r,t){return '<div class="f-kv"><span>'+r+'</span><b>'+(t||'—')+'</b></div>'}
  var sit=c?sitEf(c):'Sem conexão';
  g.innerHTML='<button class="fechar fechar-abs" aria-label="Fechar">'+ic('x')+'</button><div class="mk-cab"><div><h3>Conexão da loja</h3><div class="mk-sub">'+logo(m)+'<span class="nt">Só leitura. A conexão é feita e mantida no Java do BL.</span></div></div></div>'+
   '<div class="gaveta-corpo" style="padding:16px 20px"><div class="mk-kv3">'+kv('Loja',x?esc(x.l.n):'')+kv('Código da loja',esc(gs||''))+kv('Responsável',x?esc(x.p.nome):'')+kv('Situação',chip(sit,SITC[sit]))+
   kv('Autorizada em',c&&c.autEm?fiso(c.autEm):'')+kv('Validade',c?validTxt(c):'')+kv('Quem autorizou',c?esc(c.quem||''):'')+kv('Nome de login',c?esc(c.login||''):'')+kv('Nome público',c?esc(c.publico||''):'')+kv('Identificador no marketplace',c?esc(c.idExt||''):'')+
   (m==='Shein'?kv('Tipo de loja',c?esc(c.tipo||''):''):'')+kv('Última atualização',c&&c.at?esc(c.at.t)+' · '+esc(c.at.q):'')+'</div>'+
   (c&&c.perms&&c.perms.length?'<div class="f-sub">Permissões concedidas</div><div class="nt">'+c.perms.map(esc).join(', ')+'</div>':'')+
   '<div class="fe-aviso" style="margin-top:14px"><span>Chaves e tokens ficam no BL e nunca aparecem aqui. Para conectar, trocar ou renovar, use o pedido abaixo.</span></div></div>'+
   '<div class="gaveta-pe f-pe"><button class="btn sec" data-cx="cancelar" style="width:auto;padding:0 16px">Fechar</button><button class="btn" data-cx="pedir" style="width:auto;padding:0 18px">'+(c?'Pedir reconexão ao BL':'Pedir conexão ao BL')+'</button></div>';
  document.body.appendChild(v);document.body.appendChild(g);U.icones();
  requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape'&&!document.querySelector('.modal'))fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);
  g.addEventListener('click',function(e){var t=e.target;if(t.closest('.fechar')||t.closest('[data-cx="cancelar"]')){fechar();return}
    if(t.closest('[data-cx="pedir"]')){fechar();U.toast((c?'Pedido de reconexão enviado ao BL.':'Pedido de conexão enviado ao BL.')+' O resultado aparece aqui quando o BL responder.')}});
  var f=g.querySelector('.fechar');if(f)f.focus();
}
function convite(){
  var ant=null;
  var m=U.modal({titulo:'Enviar convite ao cliente',ok:'Enviar em Conversas',html:'<div class="campo"><label for="cv-l">Loja</label><select class="sel" id="cv-l">'+lojaOp('')+'</select></div><div class="campo" style="margin-top:10px"><label for="cv-t">Texto do pedido de autorização</label><textarea id="cv-t" class="cb-area" rows="9"></textarea></div><p class="dica-m" style="margin-top:8px">O link de autorização entra aqui depois, quando o motor for ligado. Por enquanto o texto leva um espaço marcado.</p>',
    onOk:function(mm){var gs=mm.querySelector('#cv-l').value,x=lojaPor(gs),txt=mm.querySelector('#cv-t').value.trim();if(!txt)return false;
      var conv=window.MK_CONV.filter(function(c){return c.pag===x.p.id})[0];if(conv){var d=new Date();conv.msgs.push({de:'e',t:'txt',x:txt,h:d2(d.getHours())+':'+d2(d.getMinutes()),d:'Hoje'});conv.ord=(conv.ord||0)+1000}
      var c=conDe(gs,x.l.plat);if(!c){c=novaCon(x,x.l.plat,'Aguardando autorização');c.at={t:agora(),q:EU};DB.con.push(c)}else if(c.sit==='Sem conexão'){c.sit='Aguardando autorização';c.at={t:agora(),q:EU}}
      refaz();U.toast(conv?'Convite enviado na conversa de '+x.p.nome+'.':'Texto pronto. Este pagador ainda não tem conversa.')}});
  function gera(){var gs=m.querySelector('#cv-l').value,x=lojaPor(gs),mk=x.l.plat,pr=x.p.nome.split(' ')[0];pr=pr.charAt(0)+pr.slice(1).toLowerCase();
    var quem=mk==='Shein'?'o dono da conta principal da loja':mk==='Mercado Livre'?'o administrador da conta (operadores e colaboradores não conseguem autorizar)':'o titular da conta de comerciante';
    m.querySelector('#cv-t').value='Olá, '+pr+'! Para acompanharmos os dados da sua loja '+x.l.n+' na '+mk+', precisamos da sua autorização.\n\nÉ rápido: '+quem+' abre o link abaixo, entra na conta e autoriza.\n\n[link de autorização]\n\nQualquer dúvida é só responder por aqui.'}
  m.querySelector('#cv-l').addEventListener('change',gera);gera();
}
/* ---------- aba Lojas ---------- */
function abaLojas(){
  var L=lojas().filter(function(x){return F.passa(x)});
  var cl=function(m){var s=F.get().plat;F.set({plat:m==='Todas'?'':m});var n=lojas().filter(function(x){return F.passa(x)}).length;F.set({plat:s});return n};
  return subTabs([['Todas','Todas',cl('Todas')]].concat(MKTS.map(function(m){return [m,m,cl(m)]})),SP(),'subl','Lojas por marketplace')+F.html({semPlat:true,extra:'<div class="fe-info"><b>'+L.length+'</b> lojas</div>'})+
   '<div class="tab-cartao"><table class="tab-fe tab-ml tab-click"><colgroup><col style="width:26%"><col style="width:16%"><col style="width:14%"><col style="width:20%"><col style="width:14%"><col style="width:10%"></colgroup><thead><tr><th>Loja</th><th>GS</th><th>Marketplace</th><th>Responsável</th><th>Conexão</th><th>Última análise</th></tr></thead><tbody>'+
   (L.length?L.map(function(x){var o=lj(x.l.gs),an=o.snaps.length?o.snaps.slice().sort(function(a,b){return a.data<b.data?1:-1})[0].data:null,s=sitLoja(x);
     return '<tr class="mk-lin" tabindex="0" data-gs="'+x.l.gs+'"><td data-rot="Loja"><div class="lj-n">'+esc(x.l.n)+'</div></td><td data-rot="GS" class="mono">'+esc(x.l.gs)+'</td><td data-rot="Marketplace">'+logo(x.l.plat)+'</td><td data-rot="Responsável" class="rp">'+esc(x.p.nome)+'</td><td data-rot="Conexão">'+chip(s,SITC[s])+'</td><td data-rot="Última análise">'+seloHtml(x.l.gs)+(an?'<div class="nt">'+fiso(an)+'</div>':'')+'</td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhuma loja neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
/* ---------- aba Faturamento ---------- */
function compsF(){return window.MKFechamento.comps()}
function chaveAl(r){var s='';for(var i=0;i<40;i++)s+=Math.floor(r()*10);return s}
function gerarFat(key){
  if(DB.ped[key])return;var r=lcg(+key.replace('-','')),P=[],N=[],sits=['Entregue','Entregue','Entregue','Enviado','Cancelado','Devolvido'],pv=['Sem ocorrência','Sem ocorrência','Sem ocorrência','Devolução','Reclamação'],ano=+key.split('-')[0],mes=+key.split('-')[1];
  lojas().forEach(function(x){
    for(var i=0;i<4;i++){var dia=1+Math.floor(r()*27),prod=Math.round((60+r()*420)*100)/100,fr=Math.round((8+r()*24)*100)/100,de=r()<.3?Math.round(prod*.08*100)/100:0,tot=Math.round((prod+fr-de)*100)/100,st=sits[Math.floor(r()*sits.length)],num='PED'+key.replace('-','')+(10000+P.length);
      P.push({id:DB.nid++,data:ano+'-'+d2(mes)+'-'+d2(dia),num:num,gs:x.l.gs,sit:st,prod:prod,frete:fr,desc:de,total:tot,pv:st==='Devolvido'?'Devolução':pv[Math.floor(r()*pv.length)]});
      if(st!=='Cancelado'){var dif=r()<.12?Math.round((tot*.02)*100)/100:0;N.push({id:DB.nid++,data:ano+'-'+d2(mes)+'-'+d2(Math.min(28,dia+1)),num:String(5000+N.length),serie:'1',chave:'35'+String(ano).slice(2)+d2(mes)+chaveAl(r),pedido:num,gs:x.l.gs,valor:Math.round((tot-dif)*100)/100})}}
  });
  DB.ped[key]=P;DB.nf[key]=N;
}
function filtrosF(){
  var cs=compsF();if(!fComp||!cs.some(function(c){return c.key===fComp}))fComp=cs[0].key;gerarFat(fComp);
  return '<div class="rc-filtros"><label class="sel-p"><span>Competência</span><select class="sel" id="fa-c">'+cs.map(function(c){return '<option value="'+c.key+'"'+(c.key===fComp?' selected':'')+'>'+esc(c.rotulo)+(c.fechada?' (fechada)':'')+'</option>'}).join('')+'</select></label><label class="sel-p"><span>Loja</span><select class="sel" id="fa-l"><option value="">Todas</option>'+lojas().map(function(x){return '<option value="'+x.l.gs+'"'+(fLoja===x.l.gs?' selected':'')+'>'+esc(x.l.n)+'</option>'}).join('')+'</select></label><label class="sel-p"><span>Marketplace</span><select class="sel" id="fa-m"><option value="">Todos</option>'+MKTS.map(function(m){return '<option'+(fMk2===m?' selected':'')+'>'+m+'</option>'}).join('')+'</select></label><label class="sel-p"><span>Responsável</span><select class="sel" id="fa-r"><option value="">Todos</option>'+PAGS.map(function(p){return '<option value="'+p.id+'"'+(String(p.id)===String(fResp2)?' selected':'')+'>'+esc(p.nome)+'</option>'}).join('')+'</select></label></div>';
}
function passa(gs){var x=lojaPor(gs);return (!fLoja||gs===fLoja)&&(!fMk2||x.l.plat===fMk2)&&(!fResp2||String(x.p.id)===String(fResp2))}
function pagina(tot){var n=Math.max(1,Math.ceil(tot/PG));if(pg1>n)pg1=n;return {n:n,ini:(pg1-1)*PG}}
function pager(n){return '<div class="rc-pag"><button class="btn sec" data-mk="pg" data-v="-1" style="width:auto;padding:0 14px"'+(pg1<=1?' disabled':'')+'>Anterior</button><span>Página '+pg1+' de '+n+'</span><button class="btn sec" data-mk="pg" data-v="1" style="width:auto;padding:0 14px"'+(pg1>=n?' disabled':'')+'>Próxima</button></div>'}
function somaF(a,k){return Math.round(a.reduce(function(t,x){return t+x[k]},0)*100)/100}
function basesTopo(P,N2){
  var nc=P.filter(function(p){return p.sit!=='Cancelado'}),ent=P.filter(function(p){return p.sit==='Entregue'});
  var K=[['Faturamento total',somaF(nc,'total'),nc.length+' pedidos, sem os cancelados'],['Valor dos produtos',somaF(nc,'prod'),'Sem frete e sem desconto · '+nc.length+' pedidos'],['Pedidos concluídos',somaF(ent,'total'),ent.length+' pedidos entregues'],['Notas fiscais emitidas',somaF(N2,'valor'),N2.length+' notas']];
  return '<div class="mk-bases">'+K.map(function(k){return '<div class="fe-k"><small>'+k[0]+'</small><b>'+R(k[1])+'</b><small class="nt">'+k[2]+'</small></div>'}).join('')+'</div>';
}
function quadroBases(){
  var L=lojas().filter(function(x){return passa(x.l.gs)}),F=window.MKFechamento;
  return '<details class="cx mk-bq" open><summary class="cx-cab">'+ic('layers')+'<h3>Base que cada loja usa</h3><span class="c">'+L.length+(L.length===1?' loja':' lojas')+'</span></summary><div class="mk-bq-g">'+
   (L.length?L.map(function(x){var b=F&&F.baseDe?F.baseDe(x.l.gs):null,nm=b?(b.nome||b):'Faturamento total',man=/manual/i.test(nm);
     return '<div class="mk-bq-i"><div class="lj-n">'+esc(x.l.n)+'</div><div class="mk-bq-m">'+logo(x.l.plat)+chip(esc(nm),man?'at':'ok')+'</div></div>'}).join(''):'<div class="fe-vazio">Nenhuma loja neste filtro.</div>')+
   '</div><div class="nt mk-bq-n">A base é escolhida no Fechamento do mês, etapa Faturado. Lojas sem conexão ativa só aceitam valor manual.</div></details>';
}
function abaFat(){
  var fl='<div class="fe-barra">'+filtrosF()+'</div>';
  var P=DB.ped[fComp].filter(function(p){return passa(p.gs)}),N2=DB.nf[fComp].filter(function(p){return passa(p.gs)});
  var h=fl+basesTopo(P,N2)+quadroBases()+subTabs([['pedidos','Pedidos'],['notas','Notas fiscais'],['resumo','Resumo do mês']],sub,'sub','Faturamento');
  if(sub==='pedidos'){var pp=pagina(P.length),v=P.slice(pp.ini,pp.ini+PG);
    h+='<div class="fe-barra"><div class="fe-info"><b>'+P.length+'</b> pedidos</div><button class="btn sec" data-mk="addped" style="width:auto;padding:0 14px">Adicionar pedido</button></div><div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Data</th><th>Nº do pedido</th><th>Loja</th><th>Situação</th><th class="n">Valor dos produtos</th><th class="n">Frete</th><th class="n">Desconto</th><th class="n">Total</th><th>Pós-venda</th></tr></thead><tbody>'+
     (v.length?v.map(function(p){var x=lojaPor(p.gs);return '<tr><td data-rot="Data">'+fiso(p.data)+'</td><td data-rot="Nº do pedido" class="mono">'+esc(p.num)+'</td><td data-rot="Loja" class="rp">'+esc(x.l.n)+'</td><td data-rot="Situação">'+chip(p.sit,p.sit==='Entregue'?'vd':p.sit==='Enviado'?'ok':p.sit==='Cancelado'?'cn':'at')+'</td><td data-rot="Valor dos produtos" class="n">'+R(p.prod)+'</td><td data-rot="Frete" class="n">'+R(p.frete)+'</td><td data-rot="Desconto" class="n">'+(p.desc?R(p.desc):'—')+'</td><td data-rot="Total" class="n v40">'+R(p.total)+'</td><td data-rot="Pós-venda">'+(p.pv==='Sem ocorrência'?'<span class="nt">Sem ocorrência</span>':chip(p.pv,'gr'))+'</td></tr>'}).join(''):'<tr><td colspan="9" class="vazio-t"><b>Nenhum pedido neste filtro.</b></td></tr>')+'</tbody></table></div>'+pager(pp.n);
  }else if(sub==='notas'){var pn=pagina(N2.length),vn=N2.slice(pn.ini,pn.ini+PG);
    h+='<div class="fe-barra"><div class="fe-info"><b>'+N2.length+'</b> notas</div><button class="btn sec" data-mk="addnf" style="width:auto;padding:0 14px">Adicionar nota</button></div><div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Data</th><th>Nº da nota</th><th>Série</th><th>Chave de acesso</th><th>Pedido ligado</th><th>Loja</th><th class="n">Valor</th></tr></thead><tbody>'+
     (vn.length?vn.map(function(p){var x=lojaPor(p.gs);return '<tr><td data-rot="Data">'+fiso(p.data)+'</td><td data-rot="Nº da nota" class="mono">'+esc(p.num)+'</td><td data-rot="Série">'+esc(p.serie)+'</td><td data-rot="Chave de acesso" class="mono chave">'+esc(p.chave)+'</td><td data-rot="Pedido ligado" class="mono">'+esc(p.pedido)+'</td><td data-rot="Loja" class="rp">'+esc(x.l.n)+'</td><td data-rot="Valor" class="n v40">'+R(p.valor)+'</td></tr>'}).join(''):'<tr><td colspan="7" class="vazio-t"><b>Nenhuma nota neste filtro.</b></td></tr>')+'</tbody></table></div>'+pager(pn.n);
  }else{
    var cs=compsF().filter(function(c){return c.key===fComp})[0],rows=lojas().filter(function(x){return passa(x.l.gs)}).map(function(x){var tp=DB.ped[fComp].filter(function(p){return p.gs===x.l.gs&&p.sit!=='Cancelado'}).reduce(function(a,p){return a+p.total},0),tn=DB.nf[fComp].filter(function(p){return p.gs===x.l.gs}).reduce(function(a,p){return a+p.valor},0);return {x:x,tp:Math.round(tp*100)/100,tn:Math.round(tn*100)/100}});
    h+='<div class="fe-info">Pedidos sem os cancelados. '+(cs.fechada?'<b>Competência fechada:</b> o Fechamento não aceita valor novo por aqui.':'O botão leva o valor escolhido para o Fechamento do mês.')+'</div><div class="tab-cartao"><table class="tab-fe tab-ml"><colgroup><col style="width:21%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:9%"><col style="width:37%"></colgroup><thead><tr><th>Loja</th><th>Marketplace</th><th class="n">Total dos pedidos</th><th class="n">Total das notas</th><th class="n">Diferença</th><th>Usar no Fechamento</th></tr></thead><tbody>'+
     (rows.length?rows.map(function(r){var df=Math.round((r.tp-r.tn)*100)/100;return '<tr><td data-rot="Loja"><div class="lj-n">'+esc(r.x.l.n)+'</div><div class="lj-gs">'+esc(r.x.l.gs)+'</div></td><td data-rot="Marketplace">'+logo(r.x.l.plat)+'</td><td data-rot="Total dos pedidos" class="n">'+R(r.tp)+'</td><td data-rot="Total das notas" class="n">'+R(r.tn)+'</td><td data-rot="Diferença" class="n '+(df?'pend':'')+'">'+(df?R(df):'—')+'</td><td data-rot="Usar no Fechamento" class="rc-ac"><select class="sel mk-usar" id="us-'+r.x.l.gs+'" aria-label="Valor a usar, '+esc(r.x.l.n)+'"><option value="'+r.tp+'">Pedidos · '+R(r.tp)+'</option><option value="'+r.tn+'">Notas · '+R(r.tn)+'</option></select><button class="btn" data-mk="usar" data-gs="'+r.x.l.gs+'" style="width:auto;padding:0 12px;height:32px"'+(cs.fechada?' disabled':'')+'>Usar no Fechamento</button></td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhuma loja neste filtro.</b></td></tr>')+'</tbody></table></div>';
  }
  return h;
}
/* ---------- aba Aplicativos ---------- */
var ADR={};
var DICA_URL={'Shein':'Use endereço https. Teste e produção da Shein têm endereços próprios. Dados variáveis vão no campo state.','Mercado Livre':'Deve ser igual ao cadastrado no Mercado Livre, em https, sem parte variável (sem ? e sem #). Dados variáveis vão no campo state.','Shopee':'A Shopee confere só o domínio do endereço. Dados variáveis vão no campo state.','Kwai':'A confirmar com a Kwai. Use https.'};
var DICA_IP={'Shein':'<small class="nt">Regra de IP da Shein: a confirmar com a Shein.</small>','Mercado Livre':'<small class="nt">Não disponível sem liberação do Mercado Livre (a lista de IPs só existe para integradores liberados). Pode ficar vazio.</small>','Shopee':'<small class="nt">Obrigatório. Sem IP declarado, dados do comprador vêm mascarados e, com a lista ligada, só os IPs declarados chamam a API.</small>','Kwai':'<small class="nt">A confirmar com a Kwai.</small>'};
function hostDe(u){var m=/^https:\/\/([^\/?#\s]+)/.exec(u||'');return m?m[1].toLowerCase():''}
function abaApps(){
  return subTabs(MKTS.map(function(m){return [m,m,DB.con.filter(function(c){return c.mkt===m&&sitEf(c)==='Conectada'}).length]}),subA,'suba','Aplicativos por marketplace')+'<div class="mk-apps">'+[subA].map(function(m){
    var a=DB.apps[m],n=DB.con.filter(function(c){return c.mkt===m&&sitEf(c)==='Conectada'}).length;
    function kv(r,t){return '<div class="f-kv"><span>'+r+'</span><b>'+(t||'—')+'</b></div>'}
    return '<div class="cx"><div class="cx-cab">'+logo(m)+'<span class="c" style="margin-left:auto">'+n+(n===1?' loja conectada':' lojas conectadas')+'</span></div><div class="cf-corpo">'+
     '<div class="fe-aviso"><span>O aplicativo é criado e mantido no Java do BL. Aqui você só vê o resultado.</span></div>'+
     '<div class="mk-kv3">'+kv('Identificador do app',esc(a.id))+kv('Segredo','Guardado no BL, nunca aparece aqui')+kv('Situação da aprovação',esc(a.sit))+kv('Endereço de retorno',esc(a.url))+(m==='Shopee'?kv('Tipo de app','ERP'):'')+kv('Data de criação',esc(a.criado))+kv('Última troca do segredo',esc(a.troca))+kv('Lojas conectadas neste app',String(n))+'</div>'+
     '<div class="campo cf-c"><label>IPs liberados</label><div class="ed-calc" style="white-space:pre-line">'+esc(a.ips||'—')+'</div></div>'+
     (m==='Mercado Livre'?'<div class="fe-aviso"><span>O Mercado Livre só permite 1 aplicativo por conta no Brasil. A conta dona do aplicativo é a da empresa IT.MK.</span></div>':'')+
     (m==='Kwai'?'<div class="fe-aviso"><span>Kwai: tipo de aplicativo, permissões, endereços e IPs estão a confirmar. Não há documentação oficial acessível.</span></div>':'')+
     '</div></div>'}).join('')+'</div>';
}
/* ---------- tela ---------- */
function render(alvo){
  if(alvo)el=alvo;iniciar();F.ao(pintar);
  var nc=DB.con.filter(function(c){return sitEf(c)==='Conectada'}).length;
  el.innerHTML='<div class="dash fe-w rc-w"><div class="pag-topo"><div><h1>Marketplaces</h1><p class="sub">Conexões, lojas, faturamento e aplicativos. Tudo é preenchido à mão por enquanto.</p></div><div class="fe-info mk-legenda"><span class="mo manual">Manual</span><span class="mo api">API</span><span class="mo calc">Calculado</span><span class="nt">Selo de origem de cada campo. Quando o motor for ligado, Manual vira API.</span></div></div>'+
   '<div class="rc-abas mk-abas-p" role="tablist">'+[['painel','Painel',null],['conexoes','Conexões',contC('Todas')],['lojas','Lojas',lojas().length],['fat','Faturamento',null],['apps','Aplicativos',null]].map(function(a){return '<button role="tab" class="rc-aba" data-aba="'+a[0]+'" aria-selected="'+(aba===a[0])+'">'+a[1]+(a[2]!==null?' <b>'+a[2]+'</b>':'')+'</button>'}).join('')+'</div>'+
   '<section class="bloco"><div class="fe-painel" id="mk-corpo">'+corpo()+'</div></section><div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  U.icones();
}
function corpo(){return aba==='painel'?painel():aba==='conexoes'?abaConexoes():aba==='lojas'?(fichaGs?fichaView():abaLojas()):aba==='fat'?abaFat():abaApps()}
function pintar(){var c=document.getElementById('mk-corpo');if(c){c.innerHTML=corpo();U.icones()}}
function refaz(){var y=window.scrollY;render();window.scrollTo(0,y)}
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)&&el.dataset.modulo==='marketplaces'}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b;
  if((b=t.closest('[data-aba]'))){aba=b.dataset.aba;pg1=1;fq='';fichaGs=null;refaz();return}
  if((b=t.closest('[data-subc]'))){F.set({plat:b.dataset.subc==='Todas'?'':b.dataset.subc});pintar();return}
  if((b=t.closest('[data-subl]'))){F.set({plat:b.dataset.subl==='Todas'?'':b.dataset.subl});pintar();return}
  if((b=t.closest('[data-suba]'))){subA=b.dataset.suba;pintar();return}
  if((b=t.closest('[data-sub]'))){sub=b.dataset.sub;pg1=1;pintar();return}
  if(fichaGs&&aba==='lojas'){if(t.closest('[data-voltar]')){fichaGs=null;pintar();return}if(fichaClique(e))return}
  if((b=t.closest('tr.mk-lin'))){abrirFicha(b.dataset.gs);return}
  if(!(b=t.closest('[data-mk]')))return;var a=b.dataset.mk;
  if(a==='focar'){focar(b.dataset.gs);refaz();return}
  if(a==='nova')cadastroCon(null,null);else if(a==='editar')cadastroCon(b.dataset.gs,b.dataset.m);else if(a==='convite')convite();
  else if(a==='pg'){pg1+=+b.dataset.v;pintar()}
  else if(a==='usar'){var gs=b.dataset.gs,val=+document.getElementById('us-'+gs).value,orig=document.getElementById('us-'+gs).selectedIndex===0?'pedidos':'notas',msg=window.MKFechamento.usarFaturado(fComp,gs,val,orig);if(msg)U.toast(msg);else U.toast('Valor de '+orig+' ('+R(val)+') levado para o Fechamento. A confirmação da linha volta a ser pedida.')}
  else if(a==='addped'||a==='addnf'){var ped=a==='addped';
    U.modal({titulo:ped?'Adicionar pedido':'Adicionar nota fiscal',ok:'Adicionar',html:'<div class="f-grade"><div class="campo"><label for="ad-l">Loja</label><select class="sel" id="ad-l">'+lojaOp('')+'</select></div><div class="campo"><label for="ad-d">Data</label><input id="ad-d" type="date" value="'+iso(hoje())+'"></div><div class="campo"><label for="ad-n">'+(ped?'Nº do pedido':'Nº da nota')+'</label><input id="ad-n"></div>'+(ped?'<div class="campo"><label for="ad-p">Valor dos produtos</label><input id="ad-p" inputmode="decimal"></div><div class="campo"><label for="ad-f">Frete</label><input id="ad-f" inputmode="decimal"></div><div class="campo"><label for="ad-ds">Desconto</label><input id="ad-ds" inputmode="decimal"></div>':'<div class="campo"><label for="ad-s">Série</label><input id="ad-s" value="1"></div><div class="campo"><label for="ad-k">Chave de acesso</label><input id="ad-k"></div><div class="campo"><label for="ad-pl">Pedido ligado</label><input id="ad-pl"></div><div class="campo"><label for="ad-v">Valor</label><input id="ad-v" inputmode="decimal"></div>')+'</div><small class="erro" id="ad-e" hidden>Informe o número e o valor.</small>',
      onOk:function(mm){var g=function(i){var x=mm.querySelector('#'+i);return x?x.value.trim():''},n=g('ad-n');
        if(ped){var pr=num(g('ad-p')),fr=num(g('ad-f')),ds=num(g('ad-ds'));if(!n||!pr){mm.querySelector('#ad-e').hidden=false;return false}DB.ped[fComp].unshift({id:DB.nid++,data:g('ad-d'),num:n,gs:g('ad-l'),sit:'Enviado',prod:pr,frete:fr,desc:ds,total:Math.round((pr+fr-ds)*100)/100,pv:'Sem ocorrência'})}
        else{var vl=num(g('ad-v'));if(!n||!vl){mm.querySelector('#ad-e').hidden=false;return false}DB.nf[fComp].unshift({id:DB.nid++,data:g('ad-d'),num:n,serie:g('ad-s')||'1',chave:g('ad-k')||'—',pedido:g('ad-pl')||'—',gs:g('ad-l'),valor:vl})}
        pintar();U.toast('Adicionado.')}})}
  else if(a==='trocarsegapp'){ADR[b.dataset.m]=ADR[b.dataset.m]||{};ADR[b.dataset.m].trocar=true;pintar()}
  else if(a==='gravarsegapp'){var m=b.dataset.m,i=document.getElementById('ap-'+m+'-seg');if(!i.value.trim()){U.toast('Cole o novo segredo para gravar.');return}DB.apps[m].seg={t:agora(),q:EU};DB.apps[m].troca=fd(new Date());delete ADR[m].trocar;if(!Object.keys(ADR[m]).length)delete ADR[m];pintar();U.toast('Segredo gravado. O valor não fica visível.')}
  else if(a==='apdesc'){delete ADR[b.dataset.m];pintar()}
  else if(a==='apsalvar'){var mk=b.dataset.m,dr=ADR[mk]||{},er=false;
    if(dr.url!==undefined&&!/^https:\/\/\S+\.\S+/.test(dr.url)){var e2=document.getElementById('ap-'+mk+'-url-e');e2.textContent='Use um endereço começando com https://';e2.hidden=false;er=true}
    if(mk==='Mercado Livre'&&dr.url!==undefined&&/^https:\/\/\S+\.\S+/.test(dr.url)&&/[?#]/.test(dr.url)){var e4=document.getElementById('ap-'+mk+'-url-e');e4.textContent='No Mercado Livre o endereço não pode ter parte variável (? ou #). Use o campo state.';e4.hidden=false;er=true}
    if(mk==='Shopee'){if(dr.urlProd!==undefined&&dr.urlProd!==''&&!/^https:\/\/\S+\.\S+/.test(dr.urlProd)){var e5=document.getElementById('ap-'+mk+'-urlp-e');e5.textContent='Use um endereço começando com https://';e5.hidden=false;er=true}
      var ipv=dr.ips!==undefined?dr.ips:DB.apps[mk].ips;if(!String(ipv||'').trim()){var e6=document.getElementById('ap-'+mk+'-ips-e');e6.textContent='Na Shopee os IPs são obrigatórios.';e6.hidden=false;er=true}}
    if(er)return;Object.keys(dr).forEach(function(k){if(k!=='trocar')DB.apps[mk][k]=dr[k]});delete ADR[mk];pintar();U.toast('Aplicativo salvo. Alterado por '+EU+'.')}
});
document.addEventListener('keydown',function(e){if(noEl(e)&&e.key==='Enter'&&e.target.classList&&e.target.classList.contains('mk-lin'))abrirFicha(e.target.dataset.gs)});
document.addEventListener('input',function(e){
  if(!noEl(e))return;var t=e.target;
  if(t.id==='mk-q'){fq=t.value;var pos=t.selectionStart;pintar();var n=document.getElementById('mk-q');if(n){n.focus();n.setSelectionRange(pos,pos)}}
  else if(t.dataset.ap){var m=t.dataset.ap;ADR[m]=ADR[m]||{};ADR[m][t.dataset.f]=t.value;var has=Object.keys(ADR[m]).filter(function(k){return k!=='trocar'}).length,card=t.closest('.cx');card.querySelector('[data-mk="apsalvar"]').disabled=!has;card.querySelector('[data-mk="apdesc"]').disabled=!has;card.querySelector('.nt[id$="-p"]').textContent=has?'Alteração pendente.':'Nenhuma alteração pendente.'}
});
document.addEventListener('change',function(e){
  if(!noEl(e))return;var t=e.target;
  if(fichaGs&&aba==='lojas'&&fichaMudou(e))return;
  if(t.id==='mk-f2'){fSit=t.value;pintar()}else if(t.id==='mk-f3'){fResp=t.value;pintar()}
  else if(t.id==='fa-c'){fComp=t.value;pg1=1;pintar()}else if(t.id==='fa-l'){fLoja=t.value;pg1=1;pintar()}else if(t.id==='fa-m'){fMk2=t.value;pg1=1;pintar()}else if(t.id==='fa-r'){fResp2=t.value;pg1=1;pintar()}
});
function logoI(m){var g=LOGO[m]||['?','#999','#fff'];return '<span class="mk-l mk-l-i" title="'+esc(m)+'"><i style="background:'+g[1]+';color:'+g[2]+'">'+g[0]+'</i></span>'}
function api(){iniciar();return {visaoCliente:visaoCliente,historicoHtml:historicoHtml,nAnalises:nAnalises,conHtml:conHtml,pdfCliente:pdfCliente,selo:seloAn,seloHtml:seloHtml,sitLoja:function(l){return sitLoja({l:l})},logo:logo,logoI:logoI,indic:indic,faixaLoja:faixaLoja,ultima:ultimaAn,lojaPor:lojaPor,mkts:MKTS}}
return {render:render,api:api,focar:focar};
})();
