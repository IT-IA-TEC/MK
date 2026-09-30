/* Tela Marketplaces: conexões, lojas (ficha), faturamento e aplicativos. Tudo preenchido à mão por enquanto. */
window.MKMarketplaces=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,PAGS=window.MK_PAG,el=null,pronto=false,EU='Marina Costa';
var aba='conexoes',subC='Todas',subL='Todas',subA='Shein',fq='',fSit='',fResp='',sub='pedidos',fComp='',fLoja='',fMk2='',fResp2='',pg1=1,PG=25;
var MKTS=['Shein','Mercado Livre','Kwai'],SITS=['Sem conexão','Aguardando autorização','Conectada','Com erro','Vencida'];
var SITC={'Sem conexão':'cn','Aguardando autorização':'ok','Conectada':'vd','Com erro':'gr','Vencida':'at'};
var LOGO={'Shein':['SH','#000000','#FFFFFF'],'Mercado Livre':['ML','#FFE600','#2D3277'],'Kwai':['KW','#FF5000','#FFFFFF']};
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
  if(c.mkt==='Kwai')d.setDate(d.getDate()+365);else d.setMonth(d.getMonth()+6);return d;
}
function sitEf(c){var v=validade(c);if(c.sit==='Conectada'&&v&&v<hoje())return 'Vencida';return c.sit}
function validTxt(c){
  if(c.mkt==='Shein')return '<span class="nt">Sem validade fixa</span>';var v=validade(c);if(!v)return '<span class="nt">—</span>';
  var n=Math.round((v-hoje())/86400000);return fd(v)+'<div class="nt">'+(n<0?'venceu há '+(-n)+' dias':'faltam '+n+' dias')+'</div>';
}
function conDe(gs,mkt){return DB.con.filter(function(c){return c.gs===gs&&c.mkt===mkt})[0]}
function sitLoja(x){var c=conDe(x.l.gs,x.l.plat);return c?sitEf(c):'Sem conexão'}
/* ---------- dados iniciais ---------- */
var PERMS_ML=['Pedidos','Reclamações','Promoções','Faturamento','Métricas'],PERMS_KW=['user_info','merchant_item','merchant_order'];
function novaCon(x,mkt,sit,aut){
  var p=x.p,l=x.l,c={id:DB.nid++,gs:l.gs,mkt:mkt||l.plat,sit:sit||'Sem conexão',login:'',publico:'',idExt:'',tipo:'',pais:mkt==='Mercado Livre'||l.plat==='Mercado Livre'?'Brasil (MLB)':'',quem:'',autEm:'',perms:[],obs:'',seg:{chave:null,token:null},at:null};
  return c;
}
function iniciar(){
  if(pronto)return;pronto=true;var r=lcg(31),L=lojas(),tipos=['Auto-operada','Semi-gerenciada','Full-gerenciada'];
  L.forEach(function(x,i){
    var k=i%8,sit=['Conectada','Conectada','Conectada','Sem conexão','Aguardando autorização','Conectada','Com erro','Conectada'][k];
    if(sit==='Sem conexão')return;
    var c=novaCon(x,null,sit),mk=c.mkt,dias=mk==='Kwai'?(i%3===0?400:90):mk==='Mercado Livre'?(i%2?200:60):120;
    if(sit==='Conectada'&&i%9===0&&mk!=='Shein')dias=mk==='Kwai'?380:210;
    var d=new Date(hoje());d.setDate(d.getDate()-dias);
    c.login=x.l.n.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'').slice(0,24);c.publico=x.l.n;
    c.idExt=mk==='Shein'?'SH'+(100000+Math.floor(r()*899999)):mk==='Mercado Livre'?String(200000000+Math.floor(r()*99999999)):'KW'+(700000+Math.floor(r()*299999));
    if(mk==='Shein')c.tipo=tipos[i%3];
    if(sit!=='Aguardando autorização'){c.quem=x.p.nome;c.autEm=iso(d)}
    c.perms=mk==='Kwai'?PERMS_KW.slice():mk==='Mercado Livre'?PERMS_ML.slice(0,4):[];
    if(sit==='Com erro')c.obs=mk==='Mercado Livre'?'Autorização feita por operador da conta. Precisa ser o administrador.':'Autorização revogada pelo vendedor.';
    c.seg.chave={t:agora(),q:'Rafael Lima'};if(sit==='Conectada')c.seg.token={t:agora(),q:'Rafael Lima'};
    c.at={t:fd(new Date(hoje().getTime()-(1+Math.floor(r()*20))*86400000))+' 10:'+d2(Math.floor(r()*60)),q:['Marina Costa','Rafael Lima','Juliana Prado'][i%3]};
    DB.con.push(c);
  });
  DB.apps={
    'Shein':{id:'SHEIN-APP-2208',seg:{t:'12/03/2026 14:10',q:'Rafael Lima'},tipo:'Semi-gerenciada',url:'https://itmk.com.br/marketplaces/shein/retorno',ips:'200.150.10.21\n200.150.10.22',sit:'Aprovado',criado:'10/03/2026',troca:'12/03/2026'},
    'Mercado Livre':{id:'7410025583961204',seg:{t:'05/04/2026 09:35',q:'Rafael Lima'},tipo:'',url:'https://itmk.com.br/marketplaces/ml/retorno',ips:'',sit:'Aprovado',criado:'01/04/2026',troca:'05/04/2026'},
    'Kwai':{id:'KWAI-CLI-3301',seg:{t:'20/05/2026 16:00',q:'Marina Costa'},tipo:'',url:'https://itmk.com.br/marketplaces/kwai/retorno',ips:'',sit:'Em revisão',criado:'18/05/2026',troca:'20/05/2026'}
  };
  /* ficha de exemplo em duas lojas, com duas análises salvas */
  var a=L[0].l.gs,b=L[5].l.gs;
  [a,b].forEach(function(gs,i){var o=lj(gs);var M=mkt(gs);
    var d=o.d;d['cad.login']='loja.exemplo.'+(i+1);d['cad.publico']=lojaPor(gs).l.n;d['cad.link']='https://'+(M==='Kwai'?'kwai.com':M==='Shein'?'shein.com':'mercadolivre.com.br')+'/loja/'+gs;d['cad.antiga']='2024-0'+(3+i)+'-12';
    if(M==='Shein'){d['cat.limite']='1000';d['cat.publicados']='742';d['cat.ativos']='690';d['cat.esgotados']='34';d['cat.inativos']='18';d['viol.aval_neg']='4';d['diag.boa']='86%';d['diag.nota']='4,4';d['desemp.nq']='4,6';d['desemp.nl']='4,3';d['desemp.dsr']='4,7';d['desemp.nivel']='Bom';d['desemp.pont']='96%';d['desemp.rank']='32º'}
    d['viol.lista']=[{data:'2026-09-02',motivo:'Imagem fora do padrão',pen:'Remoção do produto',pts:'2',sit:'Em análise',rec:'Sim',prazo:'2026-10-05'}];
    d['viol.recursos']=[{data:'2026-09-03',viol:'Imagem fora do padrão',res:'Apresentado'}];
    d['dev.lista']=[{data:'2026-09-10',pedido:'GS2609'+(1000+i),produto:'Vestido midi floral',motivo:'Tamanho errado'},{data:'2026-09-14',pedido:'GS2609'+(1100+i),produto:'Vestido midi floral',motivo:'Tamanho errado'},{data:'2026-09-20',pedido:'GS2609'+(1200+i),produto:'Blusa manga longa',motivo:'Defeito'}];
    d['p0.titulo']='Vestido midi floral com manga bufante verão 2026';d['p0.fotos']='8';d['p0.preco']='119,90';d['p0.vendas']='180';d['p0.conc']='Loja Alfa: 129,90\nLoja Beta: 134,00\nLoja Gama: 124,90';d['p0.estoque']='P:12 M:20 G:8';d['p0.var']='3 cores, 3 tamanhos';
    d['mkt.camp']=[{nome:'Liquida de Verão',tipo:'Clearance',periodo:'01/09 a 15/09'}];d['mkt.cupom']='Sim';d['mkt.cupom_qtd']='2';d['mkt.fonte']='Avant Pro';d['preco.fonte']='Avant Pro';
    d['diag.cd']=[{produto:'Blusa manga longa',cls:'C2'}];
    Object.keys(d).forEach(function(k){o.m[k]={q:['Marina Costa','Rafael Lima'][i],t:'1'+i+'/09/2026 11:0'+i}});
    o.snaps=[{id:DB.nid++,data:'2026-08-12',autor:'Rafael Lima',obs:'Primeira análise',d:JSON.parse(JSON.stringify(d))}];
    o.snaps[0].d['cat.publicados']=M==='Shein'?'701':'';o.snaps[0].d['desemp.dsr']=M==='Shein'?'4,5':'';
    o.snaps.push({id:DB.nid++,data:'2026-09-15',autor:'Marina Costa',obs:'Análise de setembro',d:JSON.parse(JSON.stringify(d))});
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
  var S=m==='Shein',M=m==='Mercado Livre',K=m==='Kwai';
  var NA={na:1,l:'Não se aplica neste marketplace'};
  var out=[];
  out.push({id:'cad',t:'Cadastro',it:[
    {k:'cad.login',l:'Nome de login',t:'txt'},{k:'cad.publico',l:'Nome público',t:'txt'},{fx:'Marketplace',v:function(x){return m}},{fx:'GS / ID da loja',v:function(x){var c=conDe(x.gs,m);return x.gs+(c&&c.idExt?' · ID '+c.idExt:'')}},
    {k:'cad.link',l:'Link da loja',t:'txt'},{fx:'Data de início',v:function(x){return x.ini||'—'}},{k:'cad.pct',l:'Percentual da 40%',t:'num',suf:'%',padrao:'40'},{fx:'Responsável',v:function(x){return x.resp}},
    {k:'cad.antiga',l:'Data da publicação mais antiga (referência de antiguidade)',t:'data',info:'Será calculada quando houver lista de produtos. Manual até lá.'}]});
  var cat=[];
  if(S){cat=[{info:'A cota de SKC da Shein renova todo mês.'},{k:'cat.limite',l:'Limite total de SKC',t:'num'},{k:'cat.publicados',l:'SKC publicados',t:'num'},{k:'cat.saldo',l:'Saldo de SKC',t:'calc',f:function(d){return tem(d,'cat.limite')?String(N(d,'cat.limite')-N(d,'cat.publicados')):'—'}},{k:'cat.ativos',l:'Produtos ativos',t:'num'},{k:'cat.esgotados',l:'Produtos esgotados',t:'num'},{k:'cat.inativos',l:'Produtos inativos',t:'num'},{k:'cat.total',l:'Total de produtos',t:'calc',f:function(d){var t=N(d,'cat.ativos')+N(d,'cat.esgotados')+N(d,'cat.inativos');return t?String(t):'—'}}]}
  else if(M){cat=[{k:'cat.ativos',l:'Anúncios ativos',t:'num'},{k:'cat.pausados',l:'Anúncios pausados',t:'num'},{k:'cat.encerrados',l:'Anúncios encerrados',t:'num'},{k:'cat.rest_classico',l:'Anúncios restantes · Clássico',t:'num'},{k:'cat.rest_premium',l:'Anúncios restantes · Premium',t:'num'}]}
  else{cat=[{info:'A Kwai não tem campo de limite de publicação nesta documentação.'},{sec:'Situação de revisão'},{k:'cat.rev_em',l:'Em revisão',t:'num'},{k:'cat.rev_ap',l:'Aprovado',t:'num'},{k:'cat.rev_rep',l:'Reprovado',t:'num'},{k:'cat.rev_viol',l:'Reprovado por violação',t:'num'},{sec:'Situação de venda'},{k:'cat.v_fora',l:'Fora do ar',t:'num'},{k:'cat.v_no',l:'No ar',t:'num'},{k:'cat.v_fora_rev',l:'Fora do ar em revisão',t:'num'},{k:'cat.v_ban',l:'Banido',t:'num'},{k:'cat.v_edit',l:'Aguardando edição',t:'num'}]}
  out.push({id:'cat',t:'Catálogo',it:cat});
  var viol=[{lista:1,k:'viol.lista',l:'Violações',add:'Adicionar violação',cols:[{c:'data',l:'Data',t:'data'},{c:'motivo',l:'Motivo',t:'txt'},{c:'pen',l:'Penalidade',t:'txt'},{c:'pts',l:'Pontos',t:'txt'},{c:'sit',l:'Situação',t:'txt'},{c:'rec',l:'Permite recurso',t:'sel',op:['Sim','Não']},{c:'prazo',l:'Prazo do recurso',t:'data'}]},
   {lista:1,k:'viol.recursos',l:'Recursos',add:'Adicionar recurso',cols:[{c:'data',l:'Data',t:'data'},{c:'viol',l:'Violação ligada',t:'violsel'},{c:'res',l:'Resultado',t:'sel',op:['Apresentado','Aprovado','Rejeitado']}]},
   {k:'viol.aval_neg',l:'Avaliações negativas com recurso disponível',t:'num',info:S||K?'Manual na Shein e na Kwai.':''},
   {sec:'Contadores'},
   {k:'viol.total',l:'Total de violações',t:'calc',f:function(d){return String((d['viol.lista']||[]).length)}},
   {k:'viol.apres',l:'Recursos apresentados',t:'calc',f:function(d){return String((d['viol.recursos']||[]).length)}},
   {k:'viol.aprov',l:'Recursos aprovados',t:'calc',f:function(d){return String((d['viol.recursos']||[]).filter(function(x){return x.res==='Aprovado'}).length)}},
   {k:'viol.rej',l:'Recursos rejeitados',t:'calc',f:function(d){return String((d['viol.recursos']||[]).filter(function(x){return x.res==='Rejeitado'}).length)}},
   {k:'viol.taxa',l:'Taxa de aprovação dos recursos da semana anterior',t:'calc',f:function(d){var w=semanaAnt(d),r=(d['viol.recursos']||[]).filter(function(x){if(!x.data)return false;var a=x.data.split('-'),dt=new Date(+a[0],+a[1]-1,+a[2]);return dt>=w[0]&&dt<=w[1]});if(!r.length)return '—';return Math.round(r.filter(function(x){return x.res==='Aprovado'}).length/r.length*100)+'%'}}];
  if(S)viol.push({sec:'Penalidade financeira (extrato)'},{k:'viol.debitado',l:'Valor debitado',t:'num',suf:'R$'},{k:'viol.compensado',l:'Valor compensado',t:'num',suf:'R$'});
  else viol.push({na:1,l:'Penalidade financeira: não se aplica neste marketplace'});
  out.push({id:'viol',t:'Violações e recursos',it:viol});
  out.push({id:'dev',t:'Devoluções e pós-venda',it:[{lista:1,k:'dev.lista',l:'Registros de pós-venda',add:'Adicionar registro',cols:[{c:'data',l:'Data',t:'data'},{c:'pedido',l:'Pedido',t:'txt'},{c:'produto',l:'Produto',t:'txt'},{c:'motivo',l:'Motivo',t:'txt'}]},{sec:'Contadores'},
    {k:'dev.total',l:'Total de registros',t:'calc',f:function(d){return String((d['dev.lista']||[]).length)}},
    {k:'dev.motivos',l:'Motivos mais frequentes',t:'calc',f:function(d){return top(d['dev.lista']||[],function(x){return x.motivo},3)}},
    {k:'dev.produtos',l:'Produtos que mais concentram devoluções e reclamações',t:'calc',f:function(d){return top(d['dev.lista']||[],function(x){return x.produto},3)}}]});
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
  var des=[];
  if(M)des=[{k:'desemp.cor',l:'Nível: cor da reputação',t:'sel',op:['Verde','Amarelo','Laranja','Vermelho']},{k:'desemp.lider',l:'Faixa de Mercado Líder',t:'sel',op:['Sem faixa','MercadoLíder','MercadoLíder Gold','MercadoLíder Platinum']},{k:'desemp.recl',l:'Taxa de reclamações',t:'num',suf:'%'},{k:'desemp.canc',l:'Taxa de cancelamentos',t:'num',suf:'%'},{k:'desemp.atraso',l:'Taxa de atraso no despacho',t:'num',suf:'%'},{na:1,l:'DSR e ranking de fulfillment: não se aplicam ao Mercado Livre'}];
  else des=[{k:'desemp.nq',l:'Nota de qualidade',t:'txt'},{k:'desemp.nl',l:'Nota de logística',t:'txt'},{k:'desemp.dsr',l:'Pontuação geral do DSR',t:'txt'},{k:'desemp.nivel',l:'Nível de qualidade da loja',t:'txt'},{lista:1,k:'desemp.nao',l:'Critérios marcados como “Não atende”',add:'Adicionar critério',cols:[{c:'crit',l:'Critério',t:'txt'}]},{k:'desemp.pont',l:'Índice de pontualidade da coleta',t:'txt'},{k:'desemp.rank',l:'Ranking de fulfillment',t:'txt'}];
  out.push({id:'desemp',t:'Desempenho',it:des});
  return out;
}
function precos(t){return String(t||'').split('\n').map(function(x){var m=x.split(':');return m.length>1?num(m[m.length-1]):0}).filter(function(v){return v>0})}
var ABAS_F=['cad','cat','viol','dev','prod','preco','mkt','diag','desemp','hist'];
var NOMES_F={cad:'Cadastro',cat:'Catálogo',viol:'Violações e recursos',dev:'Devoluções e pós-venda',prod:'Produtos analisados',preco:'Preços e concorrência',mkt:'Marketing',diag:'Diagnóstico e qualidade',desemp:'Desempenho',hist:'Histórico de análises'};
var fichaAba='cad',fichaGs=null,cmpA='',cmpB='atual',cmpTodos=false;
/* ---------- desenho da ficha da loja ---------- */
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
  return h+'</div>'+chipO('manual')+'<small class="nt">'+metaTxt(o,key)+(f.info?' · '+esc(f.info):'')+'</small></div>';
}
function listaHtml(f,o){
  var arr=o.d[f.k]||[];
  return '<div class="ml"><div class="ml-cab"><b>'+esc(f.l)+'</b>'+chipO('manual')+'<button class="btn sec" data-mk="addlista" data-k="'+f.k+'" style="width:auto;padding:0 12px;height:30px">'+esc(f.add)+'</button></div>'+
   (arr.length?'<div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr>'+f.cols.map(function(c){return '<th>'+esc(c.l)+'</th>'}).join('')+'<th></th></tr></thead><tbody>'+arr.map(function(x,i){return '<tr>'+f.cols.map(function(c){var v=x[c.c]||'';return '<td data-rot="'+esc(c.l)+'">'+esc(c.t==='data'?fiso(v):v||'—')+'</td>'}).join('')+'<td class="c"><button class="ib" data-mk="rmlista" data-k="'+f.k+'" data-i="'+i+'" aria-label="Remover linha" title="Remover">'+ic('trash-2')+'</button></td></tr>'}).join('')+'</tbody></table></div>':'<div class="fe-vazio">Nada registrado.</div>')+'</div>';
}
function blocoHtml(b,o,gs){
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
        return '<td data-rot="Produto '+(i+1)+'">'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div><div class="nt">Campos manuais. Quando o motor for ligado, os de API passam a mostrar o selo API e deixam de ser editáveis.</div>';
    return h;
  }
  b.it.forEach(function(f){
    if(f.info&&!f.k&&!f.lista)h+='<div class="fe-aviso"><span>'+esc(f.info)+'</span></div>';
    else if(f.sec)h+='<div class="f-sub" style="margin-top:6px">'+esc(f.sec)+'</div>';
    else if(f.na)h+='<div class="mf na"><span class="mf-l">'+esc(f.l)+'</span><b>Não se aplica</b></div>';
    else if(f.fx)h+='<div class="mf"><span class="mf-l">'+esc(f.fx)+'</span><div class="mf-v"><b>'+esc(f.v({gs:gs,ini:lojaPor(gs).l.ini,resp:lojaPor(gs).p.nome}))+'</b></div><span class="mo cad">Cadastro</span><small class="nt">Vem do cadastro da loja</small></div>';
    else if(f.lista)h+=listaHtml(f,o);
    else h+=campoHtml(f,o,f.k);
  });
  return h;
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
  var h='<div class="fe-barra"><div class="fe-info">Cada análise é uma foto da loja, com data e autor. Elas nunca são apagadas.</div><button class="btn" data-mk="salvaranalise" style="width:auto;padding:0 14px">Salvar análise</button></div>';
  h+='<div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Data da análise</th><th>Autor</th><th>Observação</th></tr></thead><tbody>'+(sn.length?sn.map(function(s){return '<tr><td data-rot="Data da análise">'+fiso(s.data)+'</td><td data-rot="Autor">'+esc(s.autor)+'</td><td data-rot="Observação">'+esc(s.obs||'—')+'</td></tr>'}).join(''):'<tr><td colspan="3" class="vazio-t">Nenhuma análise salva ainda.</td></tr>')+'</tbody></table></div>';
  if(sn.length){
    if(!cmpA||!sn.some(function(s){return String(s.id)===String(cmpA)}))cmpA=sn[sn.length>1?1:0].id;
    var A=sn.filter(function(s){return String(s.id)===String(cmpA)})[0],B=cmpB==='atual'?{d:o.d,data:'',autor:''}:sn.filter(function(s){return String(s.id)===String(cmpB)})[0]||{d:o.d};
    var rows=todosCampos(gs).map(function(c){return {c:c,a:valSnap(A.d,c),b:valSnap(B.d,c)}});var dif=rows.filter(function(r){return r.a!==r.b});
    h+='<div class="cx"><div class="cx-cab">'+ic('git-compare')+'<h3>Comparar duas análises</h3></div><div class="cmp-sel"><label class="sel-p"><span>Análise A</span><select class="sel" id="cmp-a">'+opt(cmpA,false)+'</select></label><label class="sel-p"><span>Análise B</span><select class="sel" id="cmp-b">'+opt(cmpB,true)+'</select></label><label class="lembrar"><input type="checkbox" id="cmp-t"'+(cmpTodos?' checked':'')+'>Mostrar todos os campos</label></div>'+
     '<table class="tab-fe tab-ml"><thead><tr><th>Campo</th><th>Análise A</th><th>Análise B</th></tr></thead><tbody>'+((cmpTodos?rows:dif).length?(cmpTodos?rows:dif).map(function(r){return '<tr class="'+(r.a!==r.b?'dif':'')+'"><td data-rot="Campo">'+esc(r.c.l)+'</td><td data-rot="Análise A">'+esc(r.a)+'</td><td data-rot="Análise B">'+esc(r.b)+'</td></tr>'}).join(''):'<tr><td colspan="3" class="vazio-t">Nenhuma diferença entre as duas análises.</td></tr>')+'</tbody></table></div>';
  }
  return h;
}
function abrirFicha(gs){fichaGs=gs;fichaAba='cad';pintar();window.scrollTo(0,0)}
function fichaView(){
  var gs=fichaGs,x=lojaPor(gs),o=lj(gs),m=x.l.plat,c=conDe(gs,m),s=c?sitEf(c):'Sem conexão',bs=blocos(m);
  var an=o.snaps.length?o.snaps.slice().sort(function(a,b){return a.data<b.data?1:-1})[0].data:null;
  var corpo=fichaAba==='hist'?histHtml(gs,o):(function(){var b=bs.filter(function(y){return y.id===fichaAba})[0];return '<div class="mk-corpo">'+blocoHtml(b,o,gs)+'</div>'})();
  return '<div class="mk-fv"><div class="mk-cab"><button class="btn sec mk-voltar" data-voltar style="width:auto;padding:0 12px">'+ic('arrow-left')+'Voltar para as lojas</button><div style="min-width:0"><h3>'+esc(x.l.n)+'</h3><div class="mk-sub">'+logo(m)+'<span class="mono">'+esc(gs)+'</span>'+chip(s,SITC[s])+'<span class="nt">Última análise: '+(an?fiso(an):'nunca')+'</span></div></div></div>'+
   '<div class="mk-abas" role="tablist" aria-label="Seções da ficha da loja">'+ABAS_F.map(function(a){return '<button role="tab" class="mk-aba" data-faba="'+a+'" aria-selected="'+(fichaAba===a)+'">'+NOMES_F[a]+'</button>'}).join('')+'</div>'+corpo+'<div class="mk-pe">Campo manual guarda quem preencheu e quando. Quando o motor for ligado, o selo muda para API e o campo deixa de ser editável.</div></div>';
}
function paintFicha(){pintar()}
function fichaClique(e){
  var t=e.target,b;
  if((b=t.closest('[data-faba]'))){fichaAba=b.dataset.faba;pintar();return true}
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
  var t=so(fq.trim()),n=nums(fq);
  return out.filter(function(r){return (subC==='Todas'||r.mkt===subC)&&(!fSit||r.sit===fSit)&&(!fResp||String(r.x.p.id)===String(fResp))&&(!t||so(r.x.l.n).indexOf(t)>-1||so(r.x.p.nome).indexOf(t)>-1||(n&&r.x.l.gs.indexOf(n)>-1))});
}
function contC(m){var s=subC;subC=m;var n=conLinhas().length;subC=s;return n}
function abaConexoes(){
  var all=conLinhas(),cnt={};SITS.forEach(function(s){cnt[s]=all.filter(function(r){return r.sit===s}).length});
  return subTabs([['Todas','Todas',contC('Todas')]].concat(MKTS.map(function(m){return [m,m,contC(m)]})),subC,'subc','Conexões por marketplace')+'<div class="fe-cont mk-cont">'+SITS.map(function(s){return '<div class="fe-k"><small>'+s+'</small><b class="'+(s==='Com erro'||s==='Vencida'?(cnt[s]?'pend':''):'')+'">'+cnt[s]+'</b></div>'}).join('')+'</div>'+
   '<div class="fe-barra"><div class="rc-filtros"><label class="sel-p"><span>Situação</span><select class="sel" id="mk-f2"><option value="">Todas</option>'+SITS.map(function(s){return '<option'+(fSit===s?' selected':'')+'>'+s+'</option>'}).join('')+'</select></label><label class="sel-p"><span>Responsável</span><select class="sel" id="mk-f3"><option value="">Todos</option>'+respOp()+'</select></label><label class="busca-p mk-busca"><span class="sr">Buscar</span>'+ic('search')+'<input id="mk-q" type="search" placeholder="Buscar por loja, GS ou responsável" value="'+esc(fq)+'"></label></div>'+
   '<div class="fe-filtros"><button class="btn sec" data-mk="convite" style="width:auto;padding:0 14px">Enviar convite ao cliente</button><button class="btn" data-mk="nova" style="width:auto;padding:0 14px">Nova conexão</button></div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ml"><colgroup><col style="width:21%"><col style="width:15%"><col style="width:11%"><col style="width:12%"><col style="width:9%"><col style="width:11%"><col style="width:10%"><col style="width:11%"></colgroup><thead><tr><th>Loja (GS)</th><th>Responsável</th><th>Marketplace</th><th>Situação</th><th>Autorizada em</th><th>Validade</th><th>Última atualização</th><th></th></tr></thead><tbody>'+
   (all.length?all.map(function(r){var c=r.c;return '<tr><td data-rot="Loja (GS)"><div class="lj-n">'+esc(r.x.l.n)+'</div><div class="lj-gs">'+esc(r.x.l.gs)+'</div></td><td data-rot="Responsável" class="rp">'+esc(r.x.p.nome)+'</td><td data-rot="Marketplace">'+logo(r.mkt)+'</td><td data-rot="Situação">'+chip(r.sit,SITC[r.sit])+'</td><td data-rot="Autorizada em">'+(c&&c.autEm?fiso(c.autEm):'<span class="nt">—</span>')+'</td><td data-rot="Validade">'+(c?validTxt(c):'<span class="nt">—</span>')+'</td><td data-rot="Última atualização">'+(c&&c.at?'<div>'+esc(c.at.t)+'</div><div class="nt">'+esc(c.at.q)+'</div>':'<span class="nt">—</span>')+'</td><td class="rc-ac" data-rot="Ação"><button class="btn sec" data-mk="editar" data-gs="'+r.x.l.gs+'" data-m="'+esc(r.mkt)+'" style="width:auto;padding:0 10px;height:30px">'+(c?'Abrir':'Cadastrar')+'</button></td></tr>'}).join(''):'<tr><td colspan="8" class="vazio-t"><b>Nenhuma conexão neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
function lojaOp(sel){return lojas().map(function(x){return '<option value="'+x.l.gs+'"'+(x.l.gs===sel?' selected':'')+'>'+esc(x.l.n)+' · '+esc(x.l.gs)+'</option>'}).join('')}
var ROT_ID={'Shein':'ID da loja na Shein','Mercado Livre':'ID do usuário no Mercado Livre','Kwai':'ID do comerciante na Kwai'};
function cadastroCon(gs,m){
  var c=gs?conDe(gs,m):null,novo=!c;
  var ant=document.activeElement,v=document.createElement('div');v.className='veu';var g=document.createElement('aside');g.className='gaveta larga';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Cadastro da conexão');
  var st=c?JSON.parse(JSON.stringify(c)):{gs:gs||'',mkt:m||'Shein',sit:'Sem conexão',login:'',publico:'',idExt:'',tipo:'',pais:'',quem:'',autEm:'',perms:[],obs:'',seg:{chave:null,token:null}};
  document.body.appendChild(v);document.body.appendChild(g);
  function paint(){
    var mk=st.mkt,ml=mk==='Mercado Livre',kw=mk==='Kwai',sh=mk==='Shein';
    var tmp={mkt:mk,autEm:st.autEm},val=validade(tmp);
    var segs=[['chave','Chave secreta'],['token','Token de acesso']].map(function(s){var x=st.seg[s[0]];return '<div class="mk-seg"><div><b>'+s[1]+'</b><div class="nt">'+(x?'Cadastrado em '+esc(x.t)+' por '+esc(x.q):'Não cadastrado')+'</div></div>'+
      (st.abrir===s[0]||!x?'<div class="mk-seg-in"><input type="password" autocomplete="new-password" id="sg-'+s[0]+'" placeholder="Cole o valor. Ele nunca é exibido" aria-label="'+s[1]+'"><button class="btn sec" data-cx="gravarseg" data-s="'+s[0]+'" style="width:auto;padding:0 12px">Gravar</button></div>':'<button class="btn sec" data-cx="trocar" data-s="'+s[0]+'" style="width:auto;padding:0 12px">Trocar</button>')+'</div>'}).join('');
    g.innerHTML='<button class="fechar fechar-abs" aria-label="Fechar">'+ic('x')+'</button><div class="mk-cab"><div><h3>'+(novo?'Nova conexão':'Cadastro da conexão')+'</h3><div class="mk-sub">'+(st.gs?logo(mk):'')+'<span class="nt">Os campos são preenchidos à mão por enquanto.</span></div></div></div><div class="gaveta-corpo"><form id="cx-form" class="mk-corpo" novalidate>'+
     '<div class="f-grade"><div class="campo"><label for="cx-gs">Loja <i class="obr">*</i></label><select class="sel" id="cx-gs"'+(novo?'':' disabled')+'><option value="">Selecione</option>'+lojaOp(st.gs)+'</select><small class="erro" id="cx-gs-e" hidden></small></div>'+
     '<div class="campo"><label for="cx-mkt">Marketplace <i class="obr">*</i></label><select class="sel" id="cx-mkt"'+(novo?'':' disabled')+'>'+MKTS.map(function(x){return '<option'+(x===mk?' selected':'')+'>'+x+'</option>'}).join('')+'</select></div>'+
     '<div class="campo"><label for="cx-login">Nome de login</label><input id="cx-login" value="'+esc(st.login)+'"></div><div class="campo"><label for="cx-pub">Nome público</label><input id="cx-pub" value="'+esc(st.publico)+'"></div>'+
     '<div class="campo"><label for="cx-id">'+ROT_ID[mk]+'</label><input id="cx-id" value="'+esc(st.idExt)+'"></div>'+
     (sh?'<div class="campo"><label for="cx-tipo">Tipo de loja</label><select class="sel" id="cx-tipo"><option value="">Selecione</option>'+['Auto-operada','Semi-gerenciada','Full-gerenciada'].map(function(x){return '<option'+(st.tipo===x?' selected':'')+'>'+x+'</option>'}).join('')+'</select></div>':'')+
     (ml?'<div class="campo"><label for="cx-pais">País / site</label><select class="sel" id="cx-pais"><option>Brasil (MLB)</option></select></div>':'')+
     '<div class="campo"><label for="cx-sit">Situação</label><select class="sel" id="cx-sit">'+SITS.filter(function(s){return s!=='Vencida'}).map(function(s){return '<option'+(st.sit===s?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'+
     '<div class="campo"><label for="cx-quem">Quem autorizou</label><input id="cx-quem" value="'+esc(st.quem)+'" placeholder="Texto livre"></div><div class="campo"><label for="cx-aut">Data da autorização</label><input id="cx-aut" type="date" value="'+esc(st.autEm)+'"></div>'+
     '<div class="campo"><label>Validade da autorização</label><div class="ed-calc" id="cx-val">'+(sh?'Sem validade fixa':val?fd(val):'Informe a data da autorização')+'</div><small class="nt">'+(kw?'Kwai: 365 dias.':ml?'Mercado Livre: 6 meses.':'Shein: sem validade fixa.')+'</small></div></div>'+
     '<div class="campo" style="margin-top:12px"><label>Permissões concedidas</label>'+(ml?'<div class="cf-multi">'+PERMS_ML.map(function(p){return '<label class="lembrar"><input type="checkbox" data-perm="'+p+'"'+(st.perms.indexOf(p)>-1?' checked':'')+'>'+p+'</label>'}).join('')+'</div>':kw?'<div class="cf-multi">'+PERMS_KW.map(function(p){return '<label class="lembrar"><input type="checkbox" data-perm="'+p+'"'+(st.perms.indexOf(p)>-1?' checked':'')+'><span class="mono">'+p+'</span></label>'}).join('')+'</div>':'<small class="nt">Na Shein, as permissões seguem o tipo do aplicativo. Não há escolha por conexão.</small>')+'</div>'+
     '<div class="campo" style="margin-top:12px"><label for="cx-obs">Observações</label><textarea id="cx-obs" class="cb-area" rows="3">'+esc(st.obs)+'</textarea></div>'+
     '<div class="f-sub" style="margin-top:14px">Chaves e tokens (só gravam, nunca mostram)</div>'+segs+
     '</form></div><div class="gaveta-pe f-pe"><button class="btn sec" data-cx="cancelar" style="width:auto;padding:0 16px">Cancelar</button><button class="btn" data-cx="salvar" style="width:auto;padding:0 18px">Salvar conexão</button></div>';
    U.icones();
  }
  function ler(){
    var q=function(i){var e=g.querySelector('#'+i);return e?e.value:''};
    st.gs=novo?q('cx-gs'):st.gs;st.mkt=novo?q('cx-mkt'):st.mkt;st.login=q('cx-login');st.publico=q('cx-pub');st.idExt=q('cx-id');if(g.querySelector('#cx-tipo'))st.tipo=q('cx-tipo');if(g.querySelector('#cx-pais'))st.pais=q('cx-pais');st.sit=q('cx-sit');st.quem=q('cx-quem');st.autEm=q('cx-aut');st.obs=q('cx-obs');
    st.perms=[].slice.call(g.querySelectorAll('[data-perm]')).filter(function(x){return x.checked}).map(function(x){return x.dataset.perm});
  }
  paint();requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape'&&!document.querySelector('.modal'))fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);
  g.addEventListener('change',function(e){var t=e.target;if(t.id==='cx-mkt'||t.id==='cx-aut'){ler();if(t.id==='cx-mkt'){st.perms=t.value==='Kwai'?PERMS_KW.slice():[];st.tipo='';st.pais=t.value==='Mercado Livre'?'Brasil (MLB)':''}paint()}});
  g.addEventListener('click',function(e){
    var t=e.target;if(t.closest('.fechar')||t.closest('[data-cx="cancelar"]')){fechar();return}
    var b=t.closest('[data-cx]');if(!b)return;var a=b.dataset.cx;
    if(a==='trocar'){ler();st.abrir=b.dataset.s;paint();return}
    if(a==='gravarseg'){var s=b.dataset.s,i=g.querySelector('#sg-'+s);if(!i.value.trim()){U.toast('Cole o valor para gravar.');return}ler();st.seg[s]={t:agora(),q:EU};st.abrir=null;paint();U.toast('Gravado. O valor não fica visível.');return}
    if(a==='salvar'){ler();var er=g.querySelector('#cx-gs-e');
      if(!st.gs){er.textContent='Escolha a loja.';er.hidden=false;return}
      if(novo&&conDe(st.gs,st.mkt)){er.textContent='Esta loja já tem conexão neste marketplace. Abra o cadastro dela.';er.hidden=false;return}
      var r=c||novaCon({l:lojaPor(st.gs).l,p:lojaPor(st.gs).p},st.mkt,st.sit);
      ['gs','mkt','sit','login','publico','idExt','tipo','pais','quem','autEm','perms','obs','seg'].forEach(function(k){r[k]=st[k]});r.at={t:agora(),q:EU};
      if(!c)DB.con.push(r);fechar();refaz();U.toast('Conexão salva. Preenchido por '+EU+'.')}
  });
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
  var t=so(fq.trim()),n=nums(fq),L=lojas().filter(function(x){return (subL==='Todas'||x.l.plat===subL)&&(!fResp||String(x.p.id)===String(fResp))&&(!t||so(x.l.n).indexOf(t)>-1||so(x.p.nome).indexOf(t)>-1||(n&&x.l.gs.indexOf(n)>-1))});
  var cl=function(m){return lojas().filter(function(x){return m==='Todas'||x.l.plat===m}).length};
  return subTabs([['Todas','Todas',cl('Todas')]].concat(MKTS.map(function(m){return [m,m,cl(m)]})),subL,'subl','Lojas por marketplace')+'<div class="fe-barra"><div class="rc-filtros"><label class="sel-p"><span>Responsável</span><select class="sel" id="mk-f3"><option value="">Todos</option>'+respOp()+'</select></label><label class="busca-p mk-busca"><span class="sr">Buscar</span>'+ic('search')+'<input id="mk-q" type="search" placeholder="Buscar por loja, GS ou responsável" value="'+esc(fq)+'"></label></div><div class="fe-info"><b>'+L.length+'</b> lojas</div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ml tab-click"><colgroup><col style="width:26%"><col style="width:16%"><col style="width:14%"><col style="width:20%"><col style="width:14%"><col style="width:10%"></colgroup><thead><tr><th>Loja</th><th>GS</th><th>Marketplace</th><th>Responsável</th><th>Conexão</th><th>Última análise</th></tr></thead><tbody>'+
   (L.length?L.map(function(x){var o=lj(x.l.gs),an=o.snaps.length?o.snaps.slice().sort(function(a,b){return a.data<b.data?1:-1})[0].data:null,s=sitLoja(x);
     return '<tr class="mk-lin" tabindex="0" data-gs="'+x.l.gs+'"><td data-rot="Loja"><div class="lj-n">'+esc(x.l.n)+'</div></td><td data-rot="GS" class="mono">'+esc(x.l.gs)+'</td><td data-rot="Marketplace">'+logo(x.l.plat)+'</td><td data-rot="Responsável" class="rp">'+esc(x.p.nome)+'</td><td data-rot="Conexão">'+chip(s,SITC[s])+'</td><td data-rot="Última análise">'+(an?fiso(an):'<span class="nt">Nunca</span>')+'</td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhuma loja neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
/* ---------- aba Faturamento ---------- */
function compsF(){return window.MKFechamento.comps()}
function gerarFat(key){
  if(DB.ped[key])return;var r=lcg(+key.replace('-','')),P=[],N=[],sits=['Entregue','Entregue','Entregue','Enviado','Cancelado','Devolvido'],pv=['Sem ocorrência','Sem ocorrência','Sem ocorrência','Devolução','Reclamação'],ano=+key.split('-')[0],mes=+key.split('-')[1];
  lojas().forEach(function(x){
    for(var i=0;i<4;i++){var dia=1+Math.floor(r()*27),prod=Math.round((60+r()*420)*100)/100,fr=Math.round((8+r()*24)*100)/100,de=r()<.3?Math.round(prod*.08*100)/100:0,tot=Math.round((prod+fr-de)*100)/100,st=sits[Math.floor(r()*sits.length)],num='PED'+key.replace('-','')+(10000+P.length);
      P.push({id:DB.nid++,data:ano+'-'+d2(mes)+'-'+d2(dia),num:num,gs:x.l.gs,sit:st,prod:prod,frete:fr,desc:de,total:tot,pv:st==='Devolvido'?'Devolução':pv[Math.floor(r()*pv.length)]});
      if(st!=='Cancelado'){var dif=r()<.12?Math.round((tot*.02)*100)/100:0;N.push({id:DB.nid++,data:ano+'-'+d2(mes)+'-'+d2(Math.min(28,dia+1)),num:String(5000+N.length),serie:'1',chave:'35'+String(ano).slice(2)+d2(mes)+String(Math.floor(r()*1e30)).padStart(30,'0')+String(Math.floor(r()*1e10)).padStart(10,'0'),pedido:num,gs:x.l.gs,valor:Math.round((tot-dif)*100)/100})}}
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
function abaFat(){
  var h=subTabs([['pedidos','Pedidos'],['notas','Notas fiscais'],['resumo','Resumo do mês']],sub,'sub','Faturamento')+'<div class="fe-barra">'+filtrosF()+'</div>';
  var P=DB.ped[fComp].filter(function(p){return passa(p.gs)}),N2=DB.nf[fComp].filter(function(p){return passa(p.gs)});
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
function abaApps(){
  return subTabs(MKTS.map(function(m){return [m,m,DB.con.filter(function(c){return c.mkt===m&&sitEf(c)==='Conectada'}).length]}),subA,'suba','Aplicativos por marketplace')+'<div class="mk-apps">'+[subA].map(function(m){
    var a=DB.apps[m],n=DB.con.filter(function(c){return c.mkt===m&&sitEf(c)==='Conectada'}).length,dr=ADR[m]||{};var v=function(k){return dr[k]!==undefined?dr[k]:a[k]};
    return '<div class="cx"><div class="cx-cab">'+logo(m)+'<span class="c" style="margin-left:auto">'+n+(n===1?' loja conectada':' lojas conectadas')+'</span></div><div class="cf-corpo">'+
     '<div class="campo cf-c"><label for="ap-'+m+'-id">Identificador do app</label><input id="ap-'+m+'-id" data-ap="'+m+'" data-f="id" value="'+esc(v('id'))+'"></div>'+
     '<div class="mk-seg"><div><b>Segredo</b><div class="nt">'+(a.seg?'Cadastrado em '+esc(a.seg.t)+' por '+esc(a.seg.q):'Não cadastrado')+'</div></div>'+(ADR[m]&&ADR[m].trocar?'<div class="mk-seg-in"><input type="password" autocomplete="new-password" id="ap-'+m+'-seg" placeholder="Cole o novo segredo. Ele nunca é exibido" aria-label="Segredo do app '+m+'"><button class="btn sec" data-mk="gravarsegapp" data-m="'+esc(m)+'" style="width:auto;padding:0 12px">Gravar</button></div>':'<button class="btn sec" data-mk="trocarsegapp" data-m="'+esc(m)+'" style="width:auto;padding:0 12px">Trocar</button>')+'</div>'+
     (m==='Shein'?'<div class="campo cf-c"><label for="ap-'+m+'-tipo">Tipo de app</label><select class="sel" id="ap-'+m+'-tipo" data-ap="'+m+'" data-f="tipo">'+['Auto-operada','Semi-gerenciada','Full-gerenciada'].map(function(x){return '<option'+(v('tipo')===x?' selected':'')+'>'+x+'</option>'}).join('')+'</select><small class="nt">Na Shein, o tipo do app não muda depois de criado.</small></div>':'')+
     '<div class="campo cf-c"><label for="ap-'+m+'-url">Endereço de retorno da autorização</label><input id="ap-'+m+'-url" data-ap="'+m+'" data-f="url" value="'+esc(v('url'))+'"><small class="erro" id="ap-'+m+'-url-e" hidden></small></div>'+
     '<div class="campo cf-c"><label for="ap-'+m+'-ips">IPs liberados (um por linha)</label><textarea class="cb-area" rows="3" id="ap-'+m+'-ips" data-ap="'+m+'" data-f="ips">'+esc(v('ips'))+'</textarea>'+(m==='Shein'?'<small class="nt">Obrigatório em produção na Shein.</small>':'')+'</div>'+
     '<div class="campo cf-c"><label for="ap-'+m+'-sit">Situação da aprovação pelo marketplace</label><select class="sel" id="ap-'+m+'-sit" data-ap="'+m+'" data-f="sit">'+['Não solicitado','Em revisão','Aprovado','Reprovado'].map(function(x){return '<option'+(v('sit')===x?' selected':'')+'>'+x+'</option>'}).join('')+'</select></div>'+
     '<div class="mk-kv3"><div class="f-kv"><span>Data de criação</span><b>'+esc(a.criado)+'</b></div><div class="f-kv"><span>Última troca do segredo</span><b>'+esc(a.troca)+'</b></div><div class="f-kv"><span>Lojas conectadas neste app</span><b>'+n+'</b></div></div></div>'+
     '<div class="cf-salvar"><span class="nt" id="ap-'+m+'-p">'+(Object.keys(dr).filter(function(k){return k!=='trocar'}).length?'Alteração pendente.':'Nenhuma alteração pendente.')+'</span><div class="cf-sv-b"><button class="btn sec" data-mk="apdesc" data-m="'+esc(m)+'" style="width:auto;padding:0 14px"'+(Object.keys(dr).filter(function(k){return k!=='trocar'}).length?'':' disabled')+'>Descartar</button><button class="btn" data-mk="apsalvar" data-m="'+esc(m)+'" style="width:auto;padding:0 16px"'+(Object.keys(dr).filter(function(k){return k!=='trocar'}).length?'':' disabled')+'>Salvar</button></div></div></div>'}).join('')+'</div>';
}
/* ---------- tela ---------- */
function render(alvo){
  if(alvo)el=alvo;iniciar();
  var nc=DB.con.filter(function(c){return sitEf(c)==='Conectada'}).length;
  el.innerHTML='<div class="dash fe-w rc-w"><div class="pag-topo"><div><h1>Marketplaces</h1><p class="sub">Conexões, lojas, faturamento e aplicativos. Tudo é preenchido à mão por enquanto.</p></div><div class="fe-info mk-legenda"><span class="mo manual">Manual</span><span class="mo api">API</span><span class="mo calc">Calculado</span><span class="nt">Selo de origem de cada campo. Quando o motor for ligado, Manual vira API.</span></div></div>'+
   '<div class="rc-abas mk-abas-p" role="tablist">'+[['conexoes','Conexões',contC('Todas')],['lojas','Lojas',lojas().length],['fat','Faturamento',null],['apps','Aplicativos',null]].map(function(a){return '<button role="tab" class="rc-aba" data-aba="'+a[0]+'" aria-selected="'+(aba===a[0])+'">'+a[1]+(a[2]!==null?' <b>'+a[2]+'</b>':'')+'</button>'}).join('')+'</div>'+
   '<section class="bloco"><div class="fe-painel" id="mk-corpo">'+corpo()+'</div></section><div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  U.icones();
}
function corpo(){return aba==='conexoes'?abaConexoes():aba==='lojas'?(fichaGs?fichaView():abaLojas()):aba==='fat'?abaFat():abaApps()}
function pintar(){var c=document.getElementById('mk-corpo');if(c){c.innerHTML=corpo();U.icones()}}
function refaz(){var y=window.scrollY;render();window.scrollTo(0,y)}
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)&&el.dataset.modulo==='marketplaces'}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b;
  if((b=t.closest('[data-aba]'))){aba=b.dataset.aba;pg1=1;fq='';fichaGs=null;refaz();return}
  if((b=t.closest('[data-subc]'))){subC=b.dataset.subc;pintar();return}
  if((b=t.closest('[data-subl]'))){subL=b.dataset.subl;pintar();return}
  if((b=t.closest('[data-suba]'))){subA=b.dataset.suba;pintar();return}
  if((b=t.closest('[data-sub]'))){sub=b.dataset.sub;pg1=1;pintar();return}
  if(fichaGs&&aba==='lojas'){if(t.closest('[data-voltar]')){fichaGs=null;pintar();return}if(fichaClique(e))return}
  if((b=t.closest('tr.mk-lin'))){abrirFicha(b.dataset.gs);return}
  if(!(b=t.closest('[data-mk]')))return;var a=b.dataset.mk;
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
return {render:render};
})();
