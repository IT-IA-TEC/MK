/* Tela Fechamento do mês. Uma competência por vez. Dados de exemplo gerados a partir de MK_PAG. */
window.MKFechamento=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,PAGS=window.MK_PAG,el=null,comps=null,atual=null,etapa=1,fConf='todas',selEnv={},prevPid=null,EU='Marina',selLote={},hbAberto=false,HB=[],BASE_LOJA={};
/* bases de cálculo do faturado: de onde vem o número que entra no fechamento */
var BASES=[{id:'faturamento_total',nome:'Faturamento total'},{id:'produtos',nome:'Valor dos produtos (sem frete)'},{id:'pedidos',nome:'Pedidos concluídos'},{id:'notas',nome:'Notas fiscais emitidas'},{id:'manual',nome:'Valor manual'}];
var PIXCOR={'Pix gerado':'ok2','Enviado':'ok','Pago':'vd','Expirado':'at','Cancelado':'cn'};
var MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function recCfg(){return (window.MK_CFG&&window.MK_CFG.recebimento)||{}}
function baseNome(id){var b=BASES.filter(function(x){return x.id===id})[0];return b?b.nome:'Faturamento total'}
function basePadrao(){var b=recCfg().basePadrao;return BASES.some(function(x){return x.id===b})?b:'faturamento_total'}
function pidVal(v){return /^x/.test(''+v)?v:+v}
function pad(n){return ('0'+n).slice(-2)}
function temApi(l){try{if(!(window.MKMarketplaces&&MKMarketplaces.api))return true;return MKMarketplaces.api().sitLoja({gs:l.gs,plat:l.plat})==='Conectada'}catch(e){return true}}
/* o que cada loja pode usar: a Kwai não entrega notas; loja sem conexão ativa só aceita valor manual */
function opcoes(l){var o=[];BASES.forEach(function(b){if(b.id==='notas'&&l.plat==='Kwai')return;o.push({id:b.id,nome:b.nome,ok:l.api||b.id==='manual'})});return o}
function suporta(l,id){return opcoes(l).some(function(o){return o.id===id&&o.ok})}
function dicaBase(l){return !l.api?'Sem conexão ativa com a plataforma: só o valor manual.':l.plat==='Kwai'?'A Kwai não entrega notas fiscais.':''}
function derivar(l,r){
  l.bs={faturamento_total:l.fat,produtos:null,pedidos:null,notas:null,manual:null};
  if(l.fat===null)return;
  if(l.fat===0){l.bs.produtos=0;l.bs.pedidos=0;l.bs.notas=0;return}
  var rd=function(v){return Math.round(v/10)*10};
  l.bs.produtos=rd(l.fat*(.84+r()*.08));l.bs.pedidos=rd(l.fat*(.88+r()*.08));l.bs.notas=rd(l.fat*(.92+r()*.07));
}
function baseInicial(l){if(!l.api)return 'manual';var b=BASE_LOJA[l.gs]||basePadrao();return suporta(l,b)?b:'faturamento_total'}
function setBase(l,id){
  var ant=l.fat;if(id==='manual'&&l.bs.manual==null)l.bs.manual=ant;
  var nv=l.bs[id];if(nv===undefined)nv=null;
  l.base=id;
  if(ant!==null&&nv!==null&&ant>0&&l.imp>0)l.imp=Math.round(l.imp/ant*nv*100)/100;
  l.fat=nv;
}
function R(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(s){return +(''+s).replace(/\./g,'').replace(',','.')||0}
function agora(){var d=new Date();return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function v40(l){return Math.round((l.imp||0)*l.aliq)/100}
/* ---------- dados ---------- */
var EXTRA=[{id:'x1',nome:'SEM RESPONSÁVEL',fone:''},{id:'x2',nome:'PATRICIA LEMOS VIANA',fone:'(21) 98866-2031'},{id:'x3',nome:'CLAUDIO ANDRADE ROCHA',fone:''}];
function pagador(id){return PAGS.concat(EXTRA).filter(function(p){return p.id===id})[0]||null}
function lcg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function montar(key,mes,ano,fechada){
  var r=lcg(ano*12+mes),lojas=[],i=0;
  PAGS.forEach(function(p){p.lojas.forEach(function(l){
    var fat=Math.round((12000+r()*78000)/10)*10,imp=Math.round(fat*(.055+r()*.03)*100)/100;
    lojas.push({rid:'r'+(i++),pid:p.id,ref:l,gs:l.gs,n:l.n,plat:l.plat,fat:fat,imp:imp,aliq:40,ant:0,nao:false,conf:null,tag:'',hist:[]});
  })});
  lojas.push({rid:'r'+(i++),pid:'x1',ref:{st:'ativa'},gs:'62410587000131',n:'LOJA NOVA PORTAL LTDA',plat:'Shein',fat:28400,imp:1988,aliq:40,ant:0,nao:false,conf:null,tag:'Nova',hist:[]});
  lojas.push({rid:'r'+(i++),pid:'x2',ref:{st:'ativa'},gs:'58309174000162',n:'VIANA E LEMOS COMERCIO LTDA',plat:'Mercado Livre',fat:19650,imp:1375.5,aliq:40,ant:0,nao:false,conf:null,tag:'Reativada',hist:[]});
  lojas.push({rid:'r'+(i++),pid:'x3',ref:{st:'ativa'},gs:'59830417000107',n:'CAR IMPORTADOS LTDA',plat:'Shein',fat:17200,imp:1204,aliq:40,ant:0,nao:false,conf:null,tag:'',hist:[]});
  lojas.forEach(function(l){l.ant=Math.round(v40(l)*(.9+r()*.2)*100)/100});
  if(fechada)lojas.forEach(function(l){if(l.pid==='x1'||l.pid==='x3'){l.fat=0;l.imp=0}});
  if(!fechada){
    var byGs=function(g){return lojas.filter(function(l){return l.gs===g})[0]};
    byGs('GS5561015').fat=null;byGs('GS5561015').imp=null;
    byGs('GS5496739').fat=null;byGs('GS5496739').imp=null;
    byGs('KW187420').fat=null;byGs('KW187420').imp=null;
    byGs('GS4274478').fat=0;byGs('GS4274478').imp=0;
    byGs('983796700').fat=0;byGs('983796700').imp=0;
    byGs('GS4684346').imp=0;
    byGs('941212000').aliq=35;
    byGs('GS3793001').ant=Math.round(v40(byGs('GS3793001'))*.4*100)/100;
    byGs('GS4812035').nao=true;
    byGs('GS5273681').saida=true;
    byGs('GS4996283').hist.push({t:'12/09 09:41',q:'Rafael',c:'Imposto',de:'R$ 3.020,00',para:'R$ 3.140,00',m:'Ajuste após nova nota da plataforma'});
  }
  var rb=lcg(ano*12+mes+7);
  lojas.forEach(function(l){l.api=temApi(l);derivar(l,rb);l.base='faturamento_total';var b=baseInicial(l);if(b!=='faturamento_total')setBase(l,b)});
  var env={};
  lojas.forEach(function(l){var p=pagador(l.pid);l.conf=null;});
  var c={pix:{},agenda:null,key:key,rotulo:cap(MESES[mes])+'/'+ano,mes:mes,ano:ano,venc:'20/'+('0'+((mes+1)%12+1)).slice(-2)+'/'+(mes+1>11?ano+1:ano),fechada:!!fechada,fechadaEm:fechada?'22/'+('0'+(mes+2)).slice(-2)+' 10:30 por Rafael':'',lojas:lojas,env:env,importado:false,log:[]};
  lojas.forEach(function(l,idx){
    if(fechada){if(l.fat>0&&!l.nao){l.conf={q:'Rafael',t:'05/'+('0'+(mes+2)).slice(-2)+' 15:20'}}return}
    if(alertas(c,l).length===0&&l.fat>0&&!l.nao&&idx%3!==0)l.conf={q:idx%2?'Marina':'Carlos',t:'01/'+('0'+(mes+2)).slice(-2)+' '+('0'+(9+idx%8)).slice(-2)+':1'+(idx%9)};
  });
  var ids=fechada?PAGS.map(function(p){return p.id}).concat(['x2']):[10,13,14];
  ids.forEach(function(id){var ls=lojas.filter(function(l){return l.pid===id&&l.fat>0&&!l.nao});if(!ls.length)return;ls.forEach(function(l){if(!l.conf)l.conf={q:'Marina',t:'01/09 11:05'}});env[id]={t:fechada?'06/'+('0'+(mes+2)).slice(-2)+' 09:00':'02/09 09:10',ok:!(id===13&&!fechada)};
    if(fechada){var k=+String(id).replace(/\D/g,'');c.pix[id]=k%9===4?'Expirado':k%11===7?'Cancelado':'Pago'}else if(id===14)c.pix[id]='Pago'});
  return c;
}
function iniciar(){
  if(comps)return;
  var h=new Date(),m=h.getMonth()-1,a=h.getFullYear();if(m<0){m=11;a--}
  function k(mm,aa){return aa+'-'+('0'+(mm+1)).slice(-2)}
  var m2=m-1,a2=a;if(m2<0){m2=11;a2--}var m3=m2-1,a3=a2;if(m3<0){m3=11;a3--}
  comps={};[[m,a,false],[m2,a2,true],[m3,a3,true]].forEach(function(x){comps[k(x[0],x[1])]=montar(k(x[0],x[1]),x[0],x[1],x[2])});
  atual=Object.keys(comps)[0];
  var c0=comps[atual],cand=c0.lojas.filter(function(l){return l.api&&l.fat>0&&!l.nao&&!l.saida&&suporta(l,'pedidos')});
  if(cand[0]){var a=cand[0],de=baseNome(a.base);setBase(a,'pedidos');a.hist.unshift({t:'04/09 09:20',q:'Rafael',c:'Base',de:de,para:baseNome('pedidos'),m:'Mudança de base (só esta loja, só no mês vigente)'});
    HB.push({t:'04/09 09:20',q:'Rafael',comp:c0.rotulo,alc:'Só esta loja · '+a.n,de:de,para:baseNome('pedidos'),dur:'Somente no mês vigente'})}
  if(cand[1]){var b=cand[1],de2=baseNome(b.base);BASE_LOJA[b.gs]='produtos';setBase(b,'produtos');b.hist.unshift({t:'28/08 16:05',q:'Marina',c:'Base',de:de2,para:baseNome('produtos'),m:'Mudança de base (só esta loja, para sempre)'});
    HB.push({t:'28/08 16:05',q:'Marina',comp:c0.rotulo,alc:'Só esta loja · '+b.n,de:de2,para:baseNome('produtos'),dur:'Para sempre'})}
}
function C(){return comps[atual]}
function semResp(l){return l.pid==='x1'}
/* ---------- regras ---------- */
function alertas(c,l){
  var a=[];if(!(l.fat>0))return a;
  if(!(l.imp>0))a.push('Faturado sem imposto');
  if(l.aliq!==40)a.push('Alíquota fora do padrão');
  var v=v40(l);if(l.ant>0&&v>0&&Math.abs(v-l.ant)/l.ant>.35)a.push('Valor muito diferente do mês anterior');
  if(l.ref.st==='bloqueada')a.push('Loja bloqueada');if(l.saida)a.push('Loja em saída');
  if(semResp(l))a.push('Sem responsável');
  return a;
}
function sit(c,l){
  if(l.nao)return ['Não cobrar','cn'];
  if(l.fat===null)return ['A calcular','at'];
  if(l.fat===0)return ['Sem movimento','cn'];
  if(c.env[l.pid])return ['Enviada','vd'];
  if(l.conf)return ['Conferida','ok'];
  return ['Calculada','ok2'];
}
function cobraveis(c){return c.lojas.filter(function(l){return !l.nao&&l.fat>0})}
function pagadoresCobr(c){var m={},o=[];cobraveis(c).forEach(function(l){if(!m[l.pid]){m[l.pid]={pid:l.pid,lojas:[]};o.push(m[l.pid])}m[l.pid].lojas.push(l)});return o.sort(function(a,b){return pagador(a.pid).nome.localeCompare(pagador(b.pid).nome)})}
function grupoEnvio(c){
  var prontos=[],outros=[];
  pagadoresCobr(c).forEach(function(g){
    var p=pagador(g.pid),conf=g.lojas.filter(function(l){return l.conf}),ok=/\(\d{2}\)\s?\d{4,5}-\d{4}/.test(p.fone||'');
    g.total=conf.reduce(function(a,l){return a+v40(l)},0);g.conf=conf;
    if(c.env[g.pid])prontos.push(g);
    else if(g.pid==='x1')outros.push({g:g,m:'Loja sem responsável cadastrado'});
    else if(!ok)outros.push({g:g,m:'Sem WhatsApp válido'});
    else if(!conf.length)outros.push({g:g,m:'Aguardando conferência das lojas'});
    else prontos.push(g);
  });
  c.lojas.filter(function(l){return l.nao}).forEach(function(l){outros.push({g:{pid:l.pid,lojas:[l],total:0,nao:true},m:'Loja marcada como “Não cobrar”'})});
  return {prontos:prontos,outros:outros};
}
function contadores(c){
  var acalc=c.lojas.filter(function(l){return l.fat===null&&!l.nao}).length,cb=cobraveis(c),cf=cb.filter(function(l){return l.conf}).length;
  var pg=pagadoresCobr(c),env=pg.filter(function(g){return c.env[g.pid]}).length;
  return {acalc:acalc,conf:cf,cob:cb.length,env:env,pg:pg.length,falta:pg.length-env};
}
function tok(t){var h=7;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))>>>0;return h.toString(36)}
function pixLink(c,pid,gs){return 'https://pix.itmk.com.br/c/'+tok(pid+'|'+(gs||'')+'|'+c.key)}
function pixCopia(c,pid,gs,valor){
  var t=(tok(pid+'|'+(gs||'')+'|'+c.key)+tok(c.key+(gs||pid))+tok('itmk')).toUpperCase(),u=(t+t+t).slice(0,32);
  return '00020126580014BR.GOV.BCB.PIX0136'+u.slice(0,8)+'-'+u.slice(8,12)+'-'+u.slice(12,16)+'-'+u.slice(16,20)+'-'+u.slice(20,32)+'5204000053039865406'+String(Math.round(valor*100))+'5802BR5909VHSS STORE6009SAO PAULO62070503***6304'+tok(u).toUpperCase().slice(0,4)
}
function validadeLink(c){var p=c.venc.split('/'),d=new Date(+p[2],+p[1]-1,+p[0]+(+recCfg().validadeLinkDias||30));return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()}
function pixSit(c,pid){return c.pix[pid]||(c.env[pid]?'Enviado':'Pix gerado')}
function msg(c,g){
  var p=pagador(g.pid),pr=p.nome.split(' ')[0];pr=cap(pr.toLowerCase());
  var ls=g.lojas.filter(function(l){return l.conf}),tot=ls.reduce(function(a,l){return a+v40(l)},0),r=recCfg(),porLoja=r.modoPix==='loja';
  var corpo=ls.map(function(l){return '• '+l.n+' (GS '+l.gs+')\n  Faturado '+R(l.fat)+' · Imposto '+R(l.imp)+' · 40%: '+R(v40(l))+(porLoja?'\n  Pix desta loja: '+pixLink(c,g.pid,l.gs)+'\n  Copia e cola: '+pixCopia(c,g.pid,l.gs,v40(l)):'')}).join('\n');
  var pix=porLoja?'':'\n\nPague pelo Pix: '+pixLink(c,g.pid)+'\nPix copia e cola:\n'+pixCopia(c,g.pid,'',tot);
  return 'Olá, '+pr+'! Segue o fechamento da competência '+c.rotulo.toLowerCase()+':\n\n'+corpo+'\n\nTotal a pagar: '+R(tot)+'\nVencimento: '+c.venc+pix+'\nO link vale até '+validadeLink(c)+'.'+(r.jurosMultaLigado?'\nApós o vencimento: multa de '+String(r.multaPct||2).replace('.',',')+'% e juros de '+String(r.jurosPct||1).replace('.',',')+'% ao mês.':'')+'\n\nDepois de pagar, a baixa é automática. Se preferir, envie o comprovante por aqui.';
}
/* ---------- desenho ---------- */
function chip(t,c){return '<span class="fs '+c+'">'+t+'</span>'}
function topo(c){
  var k=contadores(c),fecha=c.fechada;
  var st=[['1','Faturado',k.acalc===0,k.acalc+(k.acalc===1?' loja a calcular':' lojas a calcular'),'Todas calculadas'],['2','Conferência',k.conf===k.cob,(k.cob-k.conf)+' a conferir','Tudo conferido'],['3','Envio',k.falta===0,k.falta+(k.falta===1?' cobrança falta':' cobranças faltam'),'Tudo enviado']];
  return '<div class="fe-cab"><div><h1>Fechamento do mês</h1><p class="sub">Competência '+esc(c.rotulo.toLowerCase())+' · vencimento '+c.venc+' · '+(fecha?'<b>Fechada em '+esc(c.fechadaEm)+'</b>':'<b>Em fechamento</b>')+'</p></div>'+
   '<div class="fe-acoes"><label class="sel-p"><span>Competência</span><select class="sel" id="fe-comp">'+Object.keys(comps).map(function(x){return '<option value="'+x+'"'+(x===atual?' selected':'')+'>'+esc(comps[x].rotulo)+(comps[x].fechada?' (fechada)':' (em fechamento)')+'</option>'}).join('')+'</select></label>'+
   '<button class="btn'+(fecha?' sec':' esc')+'" data-fe="fechar" style="width:auto;padding:0 14px"'+(fecha?' disabled':'')+'>Fechar competência</button></div></div>'+
   (fecha?'<div class="fe-aviso">'+ic('lock')+'<span>Competência fechada. Os valores estão travados. Qualquer alteração exige motivo e fica registrada no histórico da loja.</span></div>':'')+
   '<div class="fe-etapas" role="tablist">'+st.map(function(s,i){var on=etapa===i+1;return '<button role="tab" class="fe-et'+(s[2]?' feita':'')+'" data-etapa="'+(i+1)+'" aria-selected="'+on+'"><span class="fe-n">'+(s[2]?ic('check'):s[0])+'</span><span class="fe-t"><b>'+s[1]+'</b><small>'+(s[2]?s[4]:s[3])+'</small></span></button>'}).join('')+'</div>'+
   '<div class="fe-cont"><div class="fe-k"><small>Lojas a calcular</small><b>'+k.acalc+'</b></div><div class="fe-k"><small>Lojas conferidas</small><b>'+k.conf+' <i>de '+k.cob+'</i></b></div><div class="fe-k"><small>Cobranças enviadas</small><b>'+k.env+' <i>de '+k.pg+'</i></b></div><div class="fe-k"><small>Cobranças que faltam</small><b class="'+(k.falta?'pend':'')+'">'+k.falta+'</b></div></div>';
}
function btnMem(l,pid,gs){return '<button class="ib" data-fe="memoria" data-p="'+pid+'"'+(gs?' data-g="'+gs+'"':'')+' aria-label="Memória de cálculo de '+esc(l)+'" title="Memória de cálculo">'+ic('calculator')+'</button>'}
function celulaBase(c,l){
  var d=dicaBase(l);
  return '<div class="bs-w off"><span class="bs-t">'+esc(baseNome(l.base))+'</span></div>'+(d?'<div class="nt bs-d">'+d+'</div>':'');
}
function painelHB(){
  return '<div class="cx fe-hb"><button type="button" class="cx-cab fe-hb-b" data-fe="hbtoggle" aria-expanded="'+hbAberto+'" aria-controls="fe-hb-c">'+ic('history')+'<h3>Histórico de mudança de base</h3><span class="c">'+HB.length+'</span>'+ic('chevron-down')+'</button>'+
   '<div id="fe-hb-c" class="fe-hb-c"'+(hbAberto?'':' hidden')+'>'+(HB.length?HB.map(function(h){return '<div class="h-lin"><div><b>'+esc(h.de)+' → '+esc(h.para)+'</b> · '+esc(h.alc)+'</div><div class="nt">'+esc(h.q)+' · '+esc(h.t)+' · '+esc(h.comp)+' · '+esc(h.dur)+'</div></div>'}).join(''):'<div class="fe-vazio">Nenhuma mudança de base registrada.</div>')+'</div></div>';
}
function etapa1(c){
  var marc=Object.keys(selLote).filter(function(k){return selLote[k]&&linha(k)}).length;
  var linhas=c.lojas.map(function(l){
    var s=sit(c,l),p=pagador(l.pid),sm=l.fat===0||l.nao;
    return '<tr class="'+(sm?'sm':'')+'"><td data-rot="Loja (GS)"><div class="lj-n">'+esc(l.n)+(l.tag?' <span class="fs '+(l.tag==='Nova'?'ok':'at')+'">'+l.tag+'</span>':'')+'</div><div class="lj-gs">'+esc(l.gs)+'</div><div class="rp">'+(semResp(l)?'<i class="sr-r">Sem responsável</i>':esc(p.nome))+'</div></td>'+
     '<td data-rot="Base" class="bs">'+celulaBase(c,l)+'</td>'+
     '<td data-rot="Total faturado" class="n">'+(l.fat===null?'—':R(l.fat))+(l.origem?'<div class="nt">'+esc(l.origem)+'</div>':'')+'</td><td data-rot="Imposto" class="n">'+(l.imp===null?'—':R(l.imp))+'</td><td data-rot="Alíquota %" class="n">'+(l.fat===null?'—':l.aliq+'%')+'</td><td data-rot="40% (valor a pagar)" class="n v40">'+(l.fat>0&&!l.nao?R(v40(l)):'—')+'</td><td data-rot="Situação">'+chip(s[0],s[1])+'</td>'+
     '<td class="ac"><button class="ib" data-fe="hist" data-r="'+l.rid+'" aria-label="Histórico de '+esc(l.n)+'" title="Histórico">'+ic('history')+(l.hist.length?'<em>'+l.hist.length+'</em>':'')+'</button>'+(l.fat>0&&!l.nao?btnMem(l.n,l.pid,l.gs):'')+'</td></tr>';
  }).join('');
  return '<div class="fe-barra"><div class="fe-nota">Faturado, base, imposto, percentual e valor da 40% vêm calculados do Java do BL, só para ver. Para mudar base, percentual ou faturado, use o Java do BL. Loja sem faturado vira “Sem movimento” e não gera cobrança.</div></div>'+
   '<div class="tab-cartao"><table class="tab-fe fe-t1"><thead><tr><th>Loja (GS) e responsável</th><th>Base</th><th class="n">Total faturado</th><th class="n">Imposto</th><th class="n">Alíquota %</th><th class="n">40% (valor a pagar)</th><th>Situação</th><th></th></tr></thead><tbody>'+linhas+'</tbody></table></div>'+painelHB();
}
function etapa2(c){
  var cb=cobraveis(c),sem=cb.filter(function(l){return !l.conf&&alertas(c,l).length===0}).length;
  var f={todas:cb,alerta:cb.filter(function(l){return alertas(c,l).length}),semalerta:cb.filter(function(l){return !alertas(c,l).length}),conf:cb.filter(function(l){return l.conf}),aconf:cb.filter(function(l){return !l.conf})};
  var lista=f[fConf],F=[['todas','Todas'],['alerta','Com alerta'],['semalerta','Sem alerta'],['aconf','A conferir'],['conf','Conferidas']];
  return '<div class="fe-barra"><div class="fe-filtros">'+F.map(function(x){return '<button class="chip-f" data-fconf="'+x[0]+'" aria-pressed="'+(fConf===x[0])+'">'+x[1]+' <b>'+f[x[0]].length+'</b></button>'}).join('')+'</div><button class="btn" data-fe="lote" style="width:auto;padding:0 14px"'+(sem&&!c.fechada?'':' disabled')+'>Conferir todas as linhas sem alerta ('+sem+')</button></div>'+
   '<div class="tab-cartao"><table class="tab-fe conf"><colgroup><col style="width:26%"><col style="width:17%"><col style="width:12%"><col style="width:24%"><col style="width:16%"><col style="width:48px"></colgroup><thead><tr><th>Loja (GS)</th><th>Responsável</th><th class="n">40% (valor a pagar)</th><th>Alertas</th><th>Conferência</th><th></th></tr></thead><tbody>'+
   (lista.length?lista.map(function(l){var al=alertas(c,l),p=pagador(l.pid);
     return '<tr><td data-rot="Loja (GS)"><div class="lj-n">'+esc(l.n)+'</div><div class="lj-gs">'+esc(l.gs)+'</div></td><td data-rot="Responsável" class="rp">'+(semResp(l)?'<i class="sr-r">Sem responsável</i>':esc(p.nome))+'</td><td data-rot="40%" class="n v40">'+R(v40(l))+'</td>'+
      '<td data-rot="Alertas">'+(al.length?al.map(function(a){return '<span class="fs gr">'+a+'</span>'}).join(' '):'<span class="nt">Sem alertas</span>')+'</td>'+
      '<td data-rot="Conferência">'+(l.conf?'<div class="cf-ok">'+ic('check-circle')+'<span>Conferida por '+esc(l.conf.q)+'<small>'+esc(l.conf.t)+'</small></span></div>':'<button class="btn sec" data-fe="conferir" data-r="'+l.rid+'" style="width:auto;padding:0 14px"'+(c.fechada?' disabled':'')+'>Conferir</button>')+'</td><td class="ac">'+btnMem(l.n,l.pid,l.gs)+'</td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhuma linha neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
function dataBr(iso){var a=iso.split('-');return a[2]+'/'+a[1]}
function agendaHtml(c,fila){
  var a=c.agenda,am=new Date(Date.now()+864e5),pd=am.getFullYear()+'-'+pad(am.getMonth()+1)+'-'+pad(am.getDate());
  return '<div class="cx fe-ag"><div class="cx-cab">'+ic('calendar-clock')+'<h3>Envio automático</h3>'+(a?'<span class="fs ok">Agendado para '+dataBr(a.d)+' às '+a.h+'</span>':'<span class="fs ok2">Sem agendamento</span>')+'</div><div class="fe-ag-c">'+
   '<label class="sel-p"><span>Data do envio</span><input type="date" class="sel" id="ag-d" value="'+(a?a.d:pd)+'"'+(c.fechada?' disabled':'')+'></label><label class="sel-p"><span>Hora</span><input type="time" class="sel" id="ag-h" value="'+(a?a.h:'09:00')+'"'+(c.fechada?' disabled':'')+'></label>'+
   '<div class="fe-ag-b"><button class="btn" data-fe="agendar" style="width:auto;padding:0 14px"'+(c.fechada?' disabled':'')+'>'+(a?'Trocar horário':'Agendar envio')+'</button>'+(a?'<button class="btn sec" data-fe="enviarantes" style="width:auto;padding:0 14px"'+(fila.length?'':' disabled')+'>Enviar antes, agora ('+fila.length+')</button><button class="btn sec" data-fe="cancagenda" style="width:auto;padding:0 14px">Cancelar agendamento</button>':'')+'</div>'+
   '<p class="nt fe-ag-n">No horário combinado, o sistema envia sozinho todas as cobranças prontas, uma mensagem por pagador, com o link do Pix e o código copia e cola. “Enviar antes” dispara na hora e encerra o agendamento.</p></div></div>';
}
function etapa3(c){
  var g=grupoEnvio(c),pron=g.prontos,fila=pron.filter(function(x){return !c.env[x.pid]}),sel=Object.keys(selEnv).filter(function(k){return selEnv[k]&&fila.some(function(x){return String(x.pid)===k})});
  if(prevPid===null||!pron.some(function(x){return x.pid===prevPid}))prevPid=pron.length?pron[0].pid:null;
  var pg=pron.filter(function(x){return x.pid===prevPid})[0];
  var lista=pron.map(function(x){var p=pagador(x.pid),e=c.env[x.pid];
    return '<div class="ev-lin'+(x.pid===prevPid?' sel':'')+'" data-prev="'+x.pid+'" role="button" tabindex="0">'+(e?'<span class="ev-ck off">'+ic('check')+'</span>':'<label class="ev-ck"><input type="checkbox" data-selenv="'+x.pid+'"'+(selEnv[x.pid]?' checked':'')+' aria-label="Selecionar '+esc(p.nome)+'"></label>')+
     '<div class="ev-t"><b>'+esc(p.nome)+'</b><small>'+(x.conf.length<x.lojas.length?x.conf.length+' de '+x.lojas.length+' lojas conferidas':x.lojas.length+(x.lojas.length===1?' loja':' lojas'))+'</small></div><b class="n">'+R(x.total)+'</b>'+chip(pixSit(c,x.pid),PIXCOR[pixSit(c,x.pid)])+btnMem(p.nome,x.pid,'')+'</div>'}).join('');
  var outros=g.outros.map(function(o){var p=pagador(o.g.pid);return '<div class="ev-lin sep"><div class="ev-t"><b>'+esc(p.nome)+(o.g.nao?' · '+esc(o.g.lojas[0].n):'')+'</b><small>'+o.m+'</small></div>'+chip('Separado','cn')+'</div>'}).join('');
  var ps=pg?pixSit(c,pg.pid):'';
  var prev=pg?'<div class="pv-cab"><div class="pv-l1"><b>Prévia da mensagem</b>'+chip('Pix: '+ps.toLowerCase(),PIXCOR[ps])+'</div><span class="nt">'+esc(pagador(pg.pid).nome)+' · '+esc(pagador(pg.pid).fone)+'</span></div><pre class="pv-txt">'+esc(msg(c,pg))+'</pre><div class="pv-pe">'+(c.env[pg.pid]?'<span class="nt pv-em">Enviada em '+esc(c.env[pg.pid].t)+'</span>':'')+'<button class="btn sec" data-fe="memoria" data-p="'+pg.pid+'" style="width:auto;padding:0 14px">Memória de cálculo</button>'+((ps==='Expirado'||ps==='Cancelado')&&!c.fechada?'<button class="btn sec" data-fe="novopix" data-p="'+pg.pid+'" style="width:auto;padding:0 14px">Gerar novo Pix</button>':'')+(c.env[pg.pid]?'':'<button class="btn" data-fe="enviar1" data-p="'+pg.pid+'" style="width:auto;padding:0 16px">Enviar este</button>')+'</div>':'<div class="fe-vazio">Nenhum pagador pronto para envio. Confira as lojas na etapa 2.</div>';
  return '<div class="fe-barra"><div class="fe-info"><b>'+pron.length+'</b> pagadores prontos · <b>'+fila.length+'</b> ainda não enviados · uma mensagem por pessoa, com todas as lojas e o total</div><div class="fe-filtros"><button class="btn sec" data-fe="envsel" style="width:auto;padding:0 14px"'+(sel.length&&!c.fechada?'':' disabled')+'>Enviar selecionados ('+sel.length+')</button><button class="btn" data-fe="envtodos" style="width:auto;padding:0 14px"'+(fila.length&&!c.fechada?'':' disabled')+'>Enviar todos ('+fila.length+')</button></div></div>'+
   agendaHtml(c,fila)+'<div class="ev-grade"><div class="ev-col"><div class="ev-tit">Pagadores</div>'+(lista||'<div class="fe-vazio">Ninguém pronto ainda.</div>')+(outros?'<div class="ev-tit ev-tit2">Separados, não serão enviados</div>'+outros:'')+'</div><div class="ev-col ev-prev">'+prev+'</div></div>';
}
function acomp(c){
  var pg=pagadoresCobr(c),env=pg.filter(function(g){return c.env[g.pid]}),nao=pg.filter(function(g){return !c.env[g.pid]});
  function tot(g){return g.lojas.filter(function(l){return l.conf}).reduce(function(a,l){return a+v40(l)},0)}
  var h1='<div class="grupo-f-cab">'+ic('send')+'<h3>Já enviaram</h3><span class="c">'+env.length+'</span></div>'+(env.length?env.map(function(g){var p=pagador(g.pid),e=c.env[g.pid];return '<div class="ac-lin"><div style="min-width:0"><div class="pg">'+esc(p.nome)+'</div><div class="nt">Enviada em '+esc(e.t)+'</div></div><div class="ac-st">'+(e.ok?chip('Entregue','vd'):chip('Não entregue','gr'))+' '+chip('Pix: '+pixSit(c,g.pid).toLowerCase(),PIXCOR[pixSit(c,g.pid)])+'</div><b class="din">'+R(tot(g))+'</b><div class="ac-bt">'+(e.ok?'':'<button class="btn sec" data-fe="reenviar" data-p="'+g.pid+'">Reenviar</button>')+'</div></div>'}).join(''):'<div class="fe-vazio">Nenhuma cobrança enviada ainda.</div>');
  var h2='<div class="grupo-f-cab">'+ic('clock')+'<h3>Ainda não enviaram</h3><span class="c">'+nao.length+'</span></div>'+(nao.length?nao.map(function(g){var p=pagador(g.pid),ok=/\(\d{2}\)\s?\d{4,5}-\d{4}/.test(p.fone||''),cf=g.lojas.filter(function(l){return l.conf}).length,m=g.pid==='x1'?'Loja sem responsável cadastrado':!ok?'Sem WhatsApp válido':cf===0?'Aguardando conferência':cf<g.lojas.length?'Conferidas '+cf+' de '+g.lojas.length+' lojas':'Pronta para envio';return '<div class="ac-lin"><div style="min-width:0"><div class="pg">'+esc(p.nome)+'</div><div class="nt">'+g.lojas.length+(g.lojas.length===1?' loja':' lojas')+'</div></div><div class="ac-st">'+chip(m,cf&&ok?'ok':'at')+'</div><b class="din">'+R(tot(g))+'</b><div class="ac-bt"></div></div>'}).join(''):'<div class="fe-vazio">Todos já receberam a cobrança.</div>');
  return '<section class="bloco"><div class="bloco-cab"><h2>Acompanhamento do fechamento</h2></div><div class="fila">'+h1+h2+'</div></section>';
}
function render(alvo){
  if(alvo)el=alvo;iniciar();var c=C();
  var corpo=etapa===1?etapa1(c):etapa===2?etapa2(c):etapa3(c);
  el.innerHTML='<div class="dash fe-w"><div class="fe-topo">'+topo(c)+'</div><section class="bloco"><div class="fe-painel" role="tabpanel">'+corpo+'</div></section>'+acomp(c)+'<div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  U.icones();
}
function refaz(){var y=window.scrollY;render();window.scrollTo(0,y)}
/* ---------- ações ---------- */
function linha(rid){return C().lojas.filter(function(l){return l.rid===rid})[0]}
function log(l,campo,de,para,m){l.hist.unshift({t:agora(),q:EU,c:campo,de:de,para:para,m:m+(C().fechada?' (após o fechamento)':'')})}
function paraManual(l,valor,motivo){
  l.bs.manual=valor;if(l.base==='manual')return;
  var de=baseNome(l.base);l.base='manual';log(l,'Base',de,baseNome('manual'),motivo);
  HB.unshift({t:agora(),q:EU,comp:C().rotulo,alc:'Só esta loja · '+l.n,de:de,para:baseNome('manual'),dur:'Somente no mês vigente'});
}
function editar(l){
  var c=C();
  var m=U.modal({titulo:'Editar '+l.n,ok:'Salvar alteração',html:'<div class="f-grade"><div class="campo"><label for="ed-f">Total faturado</label><input id="ed-f" value="'+(l.fat===null?'':String(l.fat).replace('.',','))+'" inputmode="decimal" placeholder="0,00"></div><div class="campo"><label for="ed-i">Imposto</label><input id="ed-i" value="'+(l.imp===null?'':String(l.imp).replace('.',','))+'" inputmode="decimal" placeholder="0,00"></div><div class="campo"><label for="ed-a">Alíquota %</label><input id="ed-a" value="'+l.aliq+'" inputmode="decimal"></div><div class="campo"><label>40% (valor a pagar)</label><div class="ed-calc" id="ed-v">—</div></div></div>'+
    '<label class="lembrar" style="margin-top:12px"><input type="checkbox" id="ed-n"'+(l.nao?' checked':'')+'>Não cobrar esta loja</label>'+
    '<div class="campo" style="margin-top:12px"><label for="ed-m">Motivo da alteração <i class="obr">*</i></label><textarea id="ed-m" rows="3" class="cb-area" placeholder="Explique o que mudou e por quê"></textarea><small class="erro" id="ed-e" hidden>Informe o motivo. Toda alteração fica registrada.</small></div>'+(c.fechada?'<p class="dica-m" style="margin-top:8px">Competência fechada: a alteração ficará marcada como feita após o fechamento.</p>':''),
    onOk:function(mm){
      var f=num(mm.querySelector('#ed-f').value),i=num(mm.querySelector('#ed-i').value),a=num(mm.querySelector('#ed-a').value)||40,n=mm.querySelector('#ed-n').checked,mo=mm.querySelector('#ed-m').value.trim();
      if(!mo){mm.querySelector('#ed-e').hidden=false;mm.querySelector('#ed-m').focus();return false}
      var mud=false;
      if(f!==(l.fat===null?0:l.fat)||(l.fat===null&&mm.querySelector('#ed-f').value.trim()!=='')){log(l,'Faturado',l.fat===null?'—':R(l.fat),R(f),mo);l.fat=f;paraManual(l,f,'Faturado alterado à mão');mud=true}
      if(i!==(l.imp===null?0:l.imp)||(l.imp===null&&mm.querySelector('#ed-i').value.trim()!=='')){log(l,'Imposto',l.imp===null?'—':R(l.imp),R(i),mo);l.imp=i;mud=true}
      if(a!==l.aliq){log(l,'Alíquota',l.aliq+'%',a+'%',mo);l.aliq=a;mud=true}
      if(n!==l.nao){log(l,'Cobrança',l.nao?'Não cobrar':'Cobrar',n?'Não cobrar':'Cobrar',mo);l.nao=n;mud=true}
      if(!mud){U.toast('Nada mudou.');return}
      if(l.conf){l.conf=null}
      var av=C().env[l.pid]?' A cobrança já tinha sido enviada. Reenvie depois.':'';
      render();U.toast('Alteração salva e registrada.'+(l.conf===null?' A linha volta para conferência.':'')+av);
    }});
  function calc(){var i=num(m.querySelector('#ed-i').value),a=num(m.querySelector('#ed-a').value)||40;m.querySelector('#ed-v').textContent=R(Math.round(i*a)/100)}
  m.addEventListener('input',calc);calc();
}
function historico(l){
  U.modal({titulo:'Histórico de '+l.n,ok:'Fechar',cancel:'Fechar',html:l.hist.length?'<div class="hist">'+l.hist.map(function(h){return '<div class="h-lin"><div><b>'+esc(h.c)+'</b> · '+esc(h.de)+' → '+esc(h.para)+'</div><div class="nt">'+esc(h.q)+' · '+esc(h.t)+' · '+esc(h.m)+'</div></div>'}).join('')+'</div>':'<p class="dica-m">Nenhuma alteração nesta loja desde o cálculo.</p>'});
}
function importar(){
  var c=C();
  U.modal({titulo:'Importar dados do mês',ok:'Ver prévia',html:'<p class="dica-m">Traga o faturado e o imposto de '+esc(c.rotulo.toLowerCase())+' por planilha. Você vê o que muda antes de gravar.</p><div class="campo"><label for="im-a">Arquivo (planilha)</label><input id="im-a" type="file" accept=".xlsx,.xls,.csv"></div><p class="nt" style="margin-top:8px">Sem arquivo, a prévia usa um exemplo do formato atual.</p>',
    onOk:function(m){var f=m.querySelector('#im-a').files[0];setTimeout(function(){previa(f?f.name:'exemplo-faturamento.xlsx')},230)}});
}
function previa(nome){
  var c=C();
  var alt=[];
  c.lojas.filter(function(l){return l.fat===null&&!l.nao}).forEach(function(l,i){alt.push({l:l,fat:Math.round((15000+i*9500+l.n.length*90)/10)*10,imp:0})});
  alt.forEach(function(a){a.imp=Math.round(a.fat*.071*100)/100});
  c.lojas.filter(function(l){return l.fat>0&&l.imp>0&&!l.conf}).slice(0,2).forEach(function(l){alt.push({l:l,fat:l.fat,imp:Math.round(l.imp*1.04*100)/100})});
  var novas=c.importado?[]:[{n:'RIO CLARO MODAS LTDA',gs:'63150284000119',plat:'Shein',pid:5,fat:38400,imp:2688},{n:'BELLA VITA COMERCIO LTDA',gs:'64207813000158',plat:'Amazon',pid:10,fat:22150,imp:1550.5}];
  if(c.importado)alt=[];
  var sem=c.lojas.length-alt.length;
  U.modal({titulo:'Prévia da importação',ok:'Gravar importação',html:'<p class="dica-m">Arquivo: <b>'+esc(nome)+'</b></p><div class="pr-k"><div><b>'+novas.length+'</b><small>Novas</small></div><div><b>'+alt.length+'</b><small>Alteradas</small></div><div><b>'+sem+'</b><small>Sem mudança</small></div></div>'+
    ((novas.length||alt.length)?'<div class="hist">'+novas.map(function(n){return '<div class="h-lin"><div><b>Nova</b> · '+esc(n.n)+'</div><div class="nt">Faturado '+R(n.fat)+' · Imposto '+R(n.imp)+'</div></div>'}).join('')+alt.map(function(a){return '<div class="h-lin"><div><b>Alterada</b> · '+esc(a.l.n)+'</div><div class="nt">Faturado '+(a.l.fat===null?'—':R(a.l.fat))+' → '+R(a.fat)+' · Imposto '+(a.l.imp===null?'—':R(a.l.imp))+' → '+R(a.imp)+'</div></div>'}).join('')+'</div>':'<p class="dica-m">Nada novo neste arquivo. Os dados já estão gravados.</p>'),
    onOk:function(){
      if(!novas.length&&!alt.length){return}
      alt.forEach(function(a){log(a.l,'Importação','Fat. '+(a.l.fat===null?'—':R(a.l.fat))+' / Imp. '+(a.l.imp===null?'—':R(a.l.imp)),'Fat. '+R(a.fat)+' / Imp. '+R(a.imp),'Importação de '+nome);a.l.fat=a.fat;a.l.imp=a.imp;paraManual(a.l,a.fat,'Importação de '+nome);a.l.conf=null});
      novas.forEach(function(n,i){var id='n'+Date.now()+i;c.lojas.push({rid:id,pid:n.pid,ref:{st:'ativa'},api:false,base:'manual',bs:{faturamento_total:null,produtos:null,pedidos:null,notas:null,manual:n.fat},gs:n.gs,n:n.n,plat:n.plat,fat:n.fat,imp:n.imp,aliq:40,ant:Math.round(n.imp*.4*100)/100,nao:false,conf:null,tag:'Nova',hist:[{t:agora(),q:EU,c:'Loja nova',de:'—',para:'Entrou pela importação',m:'Importação de '+nome}]})});
      c.importado=true;render();U.toast('Importação gravada: '+novas.length+' novas e '+alt.length+' alteradas.');
    }});
}
function conferir(l){
  var c=C(),al=alertas(c,l);
  function ok(){l.conf={q:EU,t:agora()};render();U.toast('Linha conferida.')}
  if(al.length)U.modal({titulo:'Conferir com alerta?',ok:'Conferir mesmo assim',html:'<p>Esta linha tem alerta:</p><p style="margin-top:6px">'+al.map(function(a){return '<span class="fs gr">'+a+'</span>'}).join(' ')+'</p><p class="dica-m" style="margin-top:10px">Se estiver certo, confirme. Fica registrado que foi você.</p>',onOk:ok});else ok();
}
function enviarPagadores(ids){
  var c=C(),n=0;ids.forEach(function(id){if(!c.env[id]){c.env[id]={t:agora(),ok:true};n++}});selEnv={};render();
  U.toast(n+(n===1?' cobrança enviada.':' cobranças enviadas.')+' Elas passam para Enviada em Recebimentos e na fila do Dashboard.');
}
function fechar(){
  var c=C(),k=contadores(c);
  U.modal({titulo:'Fechar competência '+c.rotulo.toLowerCase()+'?',ok:'Fechar competência',perigo:true,html:'<p>Ao fechar, os valores ficam travados. Depois disso, qualquer alteração exige motivo e fica registrada.</p>'+((k.falta||k.acalc||k.conf<k.cob)?'<div class="fe-aviso" style="margin-top:12px"><span>'+(k.acalc?k.acalc+' lojas a calcular. ':'')+(k.cob-k.conf?(k.cob-k.conf)+' linhas a conferir. ':'')+(k.falta?k.falta+' cobranças ainda não enviadas.':'')+'</span></div>':'<p class="dica-m" style="margin-top:10px">Tudo calculado, conferido e enviado.</p>'),
    onOk:function(){c.fechada=true;c.fechadaEm=agora()+' por '+EU;render();U.toast('Competência fechada.')}});
}
/* ---------- mudança de base ---------- */
var DURTXT={sempre:'Para sempre',mes:'Somente no mês vigente'};
function aplicarBase(lista,id,dur,alc){
  var c=C(),mud=[],ign=0,de={},alvo=0;
  lista.forEach(function(l){
    if(!suporta(l,id)){ign++;return}
    alvo++;
    if(dur==='sempre')BASE_LOJA[l.gs]=id;
    if(l.base===id)return;
    var d=baseNome(l.base);de[d]=1;setBase(l,id);
    log(l,'Base',d,baseNome(id),'Mudança de base ('+alc.toLowerCase()+', '+DURTXT[dur].toLowerCase()+')');
    if(l.conf)l.conf=null;mud.push(l);
  });
  if(dur==='sempre')Object.keys(comps).forEach(function(k){
    if(k===atual||comps[k].fechada)return;
    comps[k].lojas.forEach(function(x){if(lista.some(function(l){return l.gs===x.gs})&&suporta(x,id)&&x.base!==id)setBase(x,id)});
  });
  if(!mud.length){render();U.toast(alvo?'Nada mudou: as lojas já usam essa base.':'Nenhuma dessas lojas entrega essa base.');return}
  HB.unshift({t:agora(),q:EU,comp:c.rotulo,alc:alc,de:Object.keys(de).join(' / '),para:baseNome(id),dur:DURTXT[dur]});
  selLote={};render();
  U.toast(mud.length+(mud.length===1?' loja passou':' lojas passaram')+' a usar “'+baseNome(id)+'”. '+(mud.length===1?'A linha volta':'As linhas voltam')+' para conferência.'+(ign?' '+ign+(ign===1?' loja não entrega':' lojas não entregam')+' essa base e ficou como estava.':'')+(dur==='mes'?'':' Vale também para os próximos meses.'));
}
function alterarBase(pre){
  var c=C(),marc=c.lojas.filter(function(l){return selLote[l.rid]});
  var ini=marc.length?'lote':'loja';
  var html='<div class="campo"><label for="ab-b">Nova base</label><select class="sel" id="ab-b">'+BASES.map(function(b){return '<option value="'+b.id+'">'+esc(b.nome)+'</option>'}).join('')+'</select></div>'+
   '<div class="f-sub" style="margin-top:14px">Alcance</div><div class="ab-op">'+
   '<label class="lembrar"><input type="radio" name="ab-a" value="loja"'+(ini==='loja'?' checked':'')+'>Só esta loja</label><div class="campo ab-l"><select class="sel" id="ab-l" aria-label="Loja">'+c.lojas.map(function(l){return '<option value="'+l.rid+'"'+(l.rid===pre?' selected':'')+'>'+esc(l.n)+'</option>'}).join('')+'</select></div>'+
   '<label class="lembrar"><input type="radio" name="ab-a" value="lote"'+(ini==='lote'?' checked':'')+(marc.length?'':' disabled')+'>Lojas selecionadas (em lote) · '+marc.length+(marc.length===1?' marcada':' marcadas')+(marc.length?'':' na tabela')+'</label>'+
   '<label class="lembrar"><input type="radio" name="ab-a" value="todas">Todas as lojas · '+c.lojas.length+'</label></div>'+
   '<div class="f-sub" style="margin-top:14px">Por quanto tempo</div><div class="ab-op"><label class="lembrar"><input type="radio" name="ab-d" value="mes" checked>Somente no mês vigente ('+esc(c.rotulo.toLowerCase())+')</label><label class="lembrar"><input type="radio" name="ab-d" value="sempre">Para sempre (vale também para os próximos meses)</label></div>'+
   '<p class="dica-m" id="ab-p" style="margin-top:12px"></p><small class="erro" id="ab-e" hidden></small>';
  var m=U.modal({titulo:'Alterar base de cálculo',ok:'Alterar base',html:html,onOk:function(mm){
    var al=alvoBase(mm),id=mm.querySelector('#ab-b').value,dur=mm.querySelector('input[name=ab-d]:checked').value;
    if(!al.lista.length){var e=mm.querySelector('#ab-e');e.textContent='Escolha ao menos uma loja.';e.hidden=false;return false}
    if(!al.lista.some(function(l){return suporta(l,id)})){var e2=mm.querySelector('#ab-e');e2.textContent='Nenhuma das lojas escolhidas entrega essa base.';e2.hidden=false;return false}
    aplicarBase(al.lista,id,dur,al.alc);
  }});
  function alvoBase(mm){
    var a=mm.querySelector('input[name=ab-a]:checked').value,l;
    if(a==='loja'){l=linha(mm.querySelector('#ab-l').value);return {lista:l?[l]:[],alc:'Só esta loja · '+(l?l.n:'')}}
    if(a==='lote'){var x=c.lojas.filter(function(z){return selLote[z.rid]});return {lista:x,alc:'Lojas selecionadas ('+x.length+')'}}
    return {lista:c.lojas.slice(),alc:'Todas as lojas ('+c.lojas.length+')'};
  }
  function prev(){
    var al=alvoBase(m),id=m.querySelector('#ab-b').value,ok=al.lista.filter(function(l){return suporta(l,id)}),no=al.lista.length-ok.length;
    m.querySelector('#ab-l').disabled=m.querySelector('input[name=ab-a]:checked').value!=='loja';
    m.querySelector('#ab-e').hidden=true;
    m.querySelector('#ab-p').textContent='Vai mudar '+ok.length+(ok.length===1?' loja':' lojas')+' para “'+baseNome(id)+'”.'+(no?' '+no+(no===1?' loja não entrega':' lojas não entregam')+' essa base e ficam como estão.':'')+' O faturado, o imposto e o valor da 40% são refeitos, e a mudança fica registrada no histórico.';
  }
  m.addEventListener('change',prev);prev();
}
function memoria(p,g){
  if(window.MKMemoria&&MKMemoria.abrir)MKMemoria.abrir(pidVal(p),g||undefined);else U.toast('A memória de cálculo ainda não está disponível nesta versão.');
}
function agendar(){
  var c=C(),d=document.getElementById('ag-d').value,h=document.getElementById('ag-h').value;
  if(!d||!h){U.toast('Informe a data e a hora do envio.');return}
  var q=new Date(d+'T'+h+':00');if(isNaN(q)||q<new Date()){U.toast('Escolha uma data e uma hora que ainda não passaram.');return}
  c.agenda={d:d,h:h};refaz();U.toast('Envio agendado para '+dataBr(d)+' às '+h+'. Só vai quem estiver pronto nessa hora.');
}
/* ---------- dados para a Memória de cálculo ---------- */
function periodoDe(c){var u=new Date(c.ano,c.mes+1,0).getDate();return '01/'+pad(c.mes+1)+'/'+c.ano+' a '+pad(u)+'/'+pad(c.mes+1)+'/'+c.ano}
function fonteDe(l){
  if(l.origem)return l.origem;
  if(l.base==='manual')return 'Valor informado à mão (importação ou edição)';
  return 'API de '+l.plat+' · '+baseNome(l.base);
}
function versoes(c,l){
  var ini='01/'+pad((c.mes+1)%12+1)+' 08:00',v=[{v:1,quando:ini,quem:'Sistema',motivo:'Cálculo inicial do mês'}];
  l.hist.slice().reverse().forEach(function(h,i){v.push({v:i+2,quando:h.t,quem:h.q,motivo:h.c+': '+h.de+' → '+h.para+(h.m?' · '+h.m:'')})});
  return v;
}
function umaLoja(c,l){
  var f=l.fat===null?0:l.fat,i=l.imp===null?0:l.imp;
  return {competencia:c.rotulo,loja:l.n,gs:l.gs,base:{id:l.base,nome:baseNome(l.base)},fonte:fonteDe(l),periodo:periodoDe(c),faturado:f,
    aliquota:f>0?Math.round(i/f*10000)/100:0,origemAliquota:l.origem?'Imposto refeito sobre o valor vindo de Marketplaces':'Imposto do mês informado na importação, dividido pelo faturado',
    imposto:i,pct40:l.aliq,valor40:f>0&&!l.nao?v40(l):0,vencimento:c.venc,conferidoPor:l.conf?l.conf.q:'',conferidoEm:l.conf?l.conf.t:'',versoes:versoes(c,l)};
}
function dadosCalculo(pid,lojaGs,chave){
  iniciar();var c=(chave&&comps[chave])||C(),id=pidVal(pid);
  var ls=c.lojas.filter(function(l){return l.pid===id});
  var l=(lojaGs&&ls.filter(function(x){return x.gs===lojaGs})[0])||ls.filter(function(x){return x.fat>0&&!x.nao})[0]||ls[0];
  if(!l)return null;
  var d=umaLoja(c,l);d.lojas=ls.map(function(x){return umaLoja(c,x)});
  d.totalPagador=ls.filter(function(x){return x.fat>0&&!x.nao}).reduce(function(a,x){return a+v40(x)},0);
  return d;
}
function basesApi(){return BASES.map(function(b){return {id:b.id,nome:b.nome}})}
function baseDe(gs){
  iniciar();var k=Object.keys(comps).filter(function(x){return !comps[x].fechada})[0]||atual,l=comps[k].lojas.filter(function(x){return x.gs===gs})[0];
  var id=l?l.base:(BASE_LOJA[gs]||basePadrao());
  return {id:id,nome:baseNome(id),duracao:BASE_LOJA[gs]===id?'sempre':'mes'};
}
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)&&el.dataset.modulo==='fechamento'}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b,c=C();
  if((b=t.closest('[data-etapa]'))){etapa=+b.dataset.etapa;render();return}
  if((b=t.closest('[data-fconf]'))){fConf=b.dataset.fconf;refaz();return}
  if((b=t.closest('[data-fe]'))){
    var a=b.dataset.fe;
    if(a==='editar')editar(linha(b.dataset.r));else if(a==='hist')historico(linha(b.dataset.r));else if(a==='importar')importar();else if(a==='fechar')fechar();
    else if(a==='conferir')conferir(linha(b.dataset.r));
    else if(a==='alterarbase')alterarBase(null);
    else if(a==='hbtoggle'){hbAberto=!hbAberto;var cc=document.getElementById('fe-hb-c');if(cc){cc.hidden=!hbAberto;b.setAttribute('aria-expanded',hbAberto)}}
    else if(a==='memoria')memoria(b.dataset.p,b.dataset.g);
    else if(a==='agendar')agendar();
    else if(a==='cancagenda'){c.agenda=null;refaz();U.toast('Agendamento cancelado.')}
    else if(a==='enviarantes'){c.agenda=null;enviarPagadores(grupoEnvio(c).prontos.filter(function(x){return !c.env[x.pid]}).map(function(x){return x.pid}))}
    else if(a==='novopix'){var pp=pidVal(b.dataset.p);c.pix[pp]='Pix gerado';refaz();U.toast('Novo Pix gerado. Envie a cobrança de novo para o pagador receber o link.')}
    else if(a==='lote'){var n=0;cobraveis(c).forEach(function(l){if(!l.conf&&!alertas(c,l).length){l.conf={q:EU,t:agora()};n++}});refaz();U.toast(n+(n===1?' linha conferida.':' linhas conferidas.'))}
    else if(a==='enviar1')enviarPagadores([b.dataset.p==='x1'||b.dataset.p==='x2'?b.dataset.p:+b.dataset.p]);
    else if(a==='envsel')enviarPagadores(Object.keys(selEnv).filter(function(k){return selEnv[k]}).map(function(k){return /^x/.test(k)?k:+k}));
    else if(a==='envtodos')enviarPagadores(grupoEnvio(c).prontos.filter(function(x){return !c.env[x.pid]}).map(function(x){return x.pid}));
    else if(a==='reenviar'){var id=/^x/.test(b.dataset.p)?b.dataset.p:+b.dataset.p;c.env[id]={t:agora(),ok:true};refaz();U.toast('Cobrança reenviada.')}
    return;
  }
  if(t.closest('.ev-ck'))return;
  if((b=t.closest('[data-prev]'))){var v=b.dataset.prev;prevPid=/^x/.test(v)?v:+v;refaz()}
});
document.addEventListener('change',function(e){
  if(!noEl(e))return;
  if(e.target.id==='fe-comp'){atual=e.target.value;etapa=1;fConf='todas';selEnv={};selLote={};prevPid=null;render()}
  if(e.target.dataset&&e.target.dataset.basesel){var lj=linha(e.target.dataset.basesel),nb=e.target.value;if(lj&&nb!==lj.base){var y0=window.scrollY;aplicarBase([lj],nb,'mes','Só esta loja · '+lj.n);window.scrollTo(0,y0)}return}
  if(e.target.dataset&&e.target.dataset.lojasel!==undefined){selLote[e.target.dataset.lojasel]=e.target.checked;refaz();return}
  if(e.target.dataset&&e.target.dataset.lojaall!==undefined){C().lojas.forEach(function(l){selLote[l.rid]=e.target.checked});refaz();return}
  if(e.target.dataset&&e.target.dataset.selenv){selEnv[e.target.dataset.selenv]=e.target.checked;var y=window.scrollY;render();window.scrollTo(0,y)}
});
document.addEventListener('keydown',function(e){if(noEl(e)&&e.key==='Enter'&&e.target.dataset&&e.target.dataset.prev){var v=e.target.dataset.prev;prevPid=/^x/.test(v)?v:+v;refaz()}});
function usarFaturado(key,gs,valor,orig){
  iniciar();var c=comps[key];if(!c)return 'Competência não encontrada no Fechamento.';
  if(c.fechada)return 'A competência '+c.rotulo.toLowerCase()+' está fechada. Altere pelo Fechamento, com motivo.';
  var l=c.lojas.filter(function(x){return x.gs===gs})[0];if(!l)return 'Esta loja não está no Fechamento desta competência.';
  var de=l.fat===null?'—':R(l.fat);l.hist.unshift({t:agora(),q:EU,c:'Faturado',de:de,para:R(valor),m:'Vindo de Marketplaces ('+orig+')'});
  l.fat=valor;paraManual(l,valor,'Valor vindo de Marketplaces');l.origem='Marketplaces · '+orig;l.conf=null;return '';
}
function compsApi(){iniciar();return Object.keys(comps).map(function(k){return {key:k,rotulo:comps[k].rotulo,fechada:comps[k].fechada}})}
return {render:render,usarFaturado:usarFaturado,comps:compsApi,dadosCalculo:dadosCalculo,bases:basesApi,baseDe:baseDe};
})();
