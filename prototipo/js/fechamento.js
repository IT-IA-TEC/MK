/* Tela Fechamento do mês. Uma competência por vez. Dados de exemplo gerados a partir de MK_PAG. */
window.MKFechamento=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,PAGS=window.MK_PAG,el=null,comps=null,atual=null,etapa=1,fConf='todas',selEnv={},prevPid=null,EU='Marina';
var MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function pixCfg(){return (window.MK_CFG&&window.MK_CFG.dados&&window.MK_CFG.dados.cnpj)||'00.000.000/0001-00'}
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
    byGs('55610150000109').fat=null;byGs('55610150000109').imp=null;
    byGs('54967390000100').fat=null;byGs('54967390000100').imp=null;
    byGs('60318742000190').fat=null;byGs('60318742000190').imp=null;
    byGs('42744784000102').fat=0;byGs('42744784000102').imp=0;
    byGs('59837967000175').fat=0;byGs('59837967000175').imp=0;
    byGs('46843469000193').imp=0;
    byGs('50941212000141').aliq=35;
    byGs('37930011000180').ant=Math.round(v40(byGs('37930011000180'))*.4*100)/100;
    byGs('48120356000131').nao=true;
    byGs('52736810000120').saida=true;
    byGs('49962836000166').hist.push({t:'12/09 09:41',q:'Rafael',c:'Imposto',de:'R$ 3.020,00',para:'R$ 3.140,00',m:'Ajuste após nova nota da plataforma'});
  }
  var env={};
  lojas.forEach(function(l){var p=pagador(l.pid);l.conf=null;});
  var c={key:key,rotulo:cap(MESES[mes])+'/'+ano,mes:mes,ano:ano,venc:'20/'+('0'+((mes+1)%12+1)).slice(-2)+'/'+(mes+1>11?ano+1:ano),fechada:!!fechada,fechadaEm:fechada?'22/'+('0'+(mes+2)).slice(-2)+' 10:30 por Rafael':'',lojas:lojas,env:env,importado:false,log:[]};
  lojas.forEach(function(l,idx){
    if(fechada){if(l.fat>0&&!l.nao){l.conf={q:'Rafael',t:'05/'+('0'+(mes+2)).slice(-2)+' 15:20'}}return}
    if(alertas(c,l).length===0&&l.fat>0&&!l.nao&&idx%3!==0)l.conf={q:idx%2?'Marina':'Carlos',t:'01/'+('0'+(mes+2)).slice(-2)+' '+('0'+(9+idx%8)).slice(-2)+':1'+(idx%9)};
  });
  var ids=fechada?PAGS.map(function(p){return p.id}).concat(['x2']):[10,13,14];
  ids.forEach(function(id){var ls=lojas.filter(function(l){return l.pid===id&&l.fat>0&&!l.nao});if(!ls.length)return;ls.forEach(function(l){if(!l.conf)l.conf={q:'Marina',t:'01/09 11:05'}});env[id]={t:fechada?'06/'+('0'+(mes+2)).slice(-2)+' 09:00':'02/09 09:10',ok:!(id===13&&!fechada)}});
  return c;
}
function iniciar(){
  if(comps)return;
  var h=new Date(),m=h.getMonth()-1,a=h.getFullYear();if(m<0){m=11;a--}
  function k(mm,aa){return aa+'-'+('0'+(mm+1)).slice(-2)}
  var m2=m-1,a2=a;if(m2<0){m2=11;a2--}var m3=m2-1,a3=a2;if(m3<0){m3=11;a3--}
  comps={};[[m,a,false],[m2,a2,true],[m3,a3,true]].forEach(function(x){comps[k(x[0],x[1])]=montar(k(x[0],x[1]),x[0],x[1],x[2])});
  atual=Object.keys(comps)[0];
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
function msg(c,g){
  var p=pagador(g.pid),pr=p.nome.split(' ')[0];pr=cap(pr.toLowerCase());
  var ls=g.lojas.filter(function(l){return l.conf}),tot=ls.reduce(function(a,l){return a+v40(l)},0);
  return 'Olá, '+pr+'! Segue o fechamento da competência '+c.rotulo.toLowerCase()+':\n\n'+ls.map(function(l){return '• '+l.n+' (GS '+l.gs+')\n  Faturado '+R(l.fat)+' · Imposto '+R(l.imp)+' · 40%: '+R(v40(l))}).join('\n')+'\n\nTotal a pagar: '+R(tot)+'\nVencimento: '+c.venc+'\nPix (CNPJ da VHSS): '+pixCfg()+'\n\nDepois de pagar, envie o comprovante por aqui.';
}
/* ---------- desenho ---------- */
function chip(t,c){return '<span class="fs '+c+'">'+t+'</span>'}
function topo(c){
  var k=contadores(c),fecha=c.fechada;
  var st=[['1','Faturado',k.acalc===0,k.acalc+(k.acalc===1?' loja a calcular':' lojas a calcular'),'Todas calculadas'],['2','Conferência',k.conf===k.cob,(k.cob-k.conf)+' a conferir','Tudo conferido'],['3','Envio',k.falta===0,k.falta+(k.falta===1?' cobrança falta':' cobranças faltam'),'Tudo enviado']];
  return '<div class="fe-cab"><div><h1>Fechamento do mês</h1><p class="sub">Competência '+esc(c.rotulo.toLowerCase())+' · vencimento '+c.venc+' · '+(fecha?'<b>Fechada em '+esc(c.fechadaEm)+'</b>':'<b>Em fechamento</b>')+'</p></div>'+
   '<div class="fe-acoes"><label class="sel-p"><span>Competência</span><select class="sel" id="fe-comp">'+Object.keys(comps).map(function(x){return '<option value="'+x+'"'+(x===atual?' selected':'')+'>'+esc(comps[x].rotulo)+(comps[x].fechada?' (fechada)':' (em fechamento)')+'</option>'}).join('')+'</select></label>'+
   '<button class="btn sec" data-fe="importar" style="width:auto;padding:0 14px"'+(fecha?' disabled':'')+'>Importar dados</button>'+
   '<button class="btn'+(fecha?' sec':' esc')+'" data-fe="fechar" style="width:auto;padding:0 14px"'+(fecha?' disabled':'')+'>Fechar competência</button></div></div>'+
   (fecha?'<div class="fe-aviso">'+ic('lock')+'<span>Competência fechada. Os valores estão travados. Qualquer alteração exige motivo e fica registrada no histórico da loja.</span></div>':'')+
   '<div class="fe-etapas" role="tablist">'+st.map(function(s,i){var on=etapa===i+1;return '<button role="tab" class="fe-et'+(s[2]?' feita':'')+'" data-etapa="'+(i+1)+'" aria-selected="'+on+'"><span class="fe-n">'+(s[2]?ic('check'):s[0])+'</span><span class="fe-t"><b>'+s[1]+'</b><small>'+(s[2]?s[4]:s[3])+'</small></span></button>'}).join('')+'</div>'+
   '<div class="fe-cont"><div class="fe-k"><small>Lojas a calcular</small><b>'+k.acalc+'</b></div><div class="fe-k"><small>Lojas conferidas</small><b>'+k.conf+' <i>de '+k.cob+'</i></b></div><div class="fe-k"><small>Cobranças enviadas</small><b>'+k.env+' <i>de '+k.pg+'</i></b></div><div class="fe-k"><small>Cobranças que faltam</small><b class="'+(k.falta?'pend':'')+'">'+k.falta+'</b></div></div>';
}
function etapa1(c){
  var linhas=c.lojas.map(function(l){
    var s=sit(c,l),p=pagador(l.pid),sm=l.fat===0||l.nao;
    return '<tr class="'+(sm?'sm':'')+'"><td data-rot="Loja (GS)"><div class="lj-n">'+esc(l.n)+(l.tag?' <span class="fs '+(l.tag==='Nova'?'ok':'at')+'">'+l.tag+'</span>':'')+'</div><div class="lj-gs">'+esc(l.gs)+'</div></td><td data-rot="Responsável" class="rp">'+(semResp(l)?'<i class="sr-r">Sem responsável</i>':esc(p.nome))+'</td>'+
     '<td data-rot="Total faturado" class="n">'+(l.fat===null?'—':R(l.fat))+'</td><td data-rot="Imposto" class="n">'+(l.imp===null?'—':R(l.imp))+'</td><td data-rot="Alíquota %" class="n">'+(l.fat===null?'—':l.aliq+'%')+'</td><td data-rot="40% (valor a pagar)" class="n v40">'+(l.fat>0&&!l.nao?R(v40(l)):'—')+'</td><td data-rot="Situação">'+chip(s[0],s[1])+'</td>'+
     '<td class="ac"><button class="ib" data-fe="editar" data-r="'+l.rid+'" aria-label="Editar '+esc(l.n)+'" title="Editar">'+ic('pencil')+'</button><button class="ib" data-fe="hist" data-r="'+l.rid+'" aria-label="Histórico de '+esc(l.n)+'" title="Histórico">'+ic('history')+(l.hist.length?'<em>'+l.hist.length+'</em>':'')+'</button></td></tr>';
  }).join('');
  return '<div class="fe-nota">O valor da 40% é o imposto vezes o percentual da loja (padrão 40%). Muda faturado, imposto ou percentual, o valor é refeito. Loja sem faturado vira “Sem movimento” e não gera cobrança.</div>'+
   '<div class="tab-cartao"><table class="tab-fe"><colgroup><col style="width:24%"><col style="width:16%"><col style="width:11%"><col style="width:10%"><col style="width:7%"><col style="width:12%"><col style="width:11%"><col style="width:88px"></colgroup><thead><tr><th>Loja (GS)</th><th>Responsável</th><th class="n">Total faturado</th><th class="n">Imposto</th><th class="n">Alíquota %</th><th class="n">40% (valor a pagar)</th><th>Situação</th><th></th></tr></thead><tbody>'+linhas+'</tbody></table></div>';
}
function etapa2(c){
  var cb=cobraveis(c),sem=cb.filter(function(l){return !l.conf&&alertas(c,l).length===0}).length;
  var f={todas:cb,alerta:cb.filter(function(l){return alertas(c,l).length}),semalerta:cb.filter(function(l){return !alertas(c,l).length}),conf:cb.filter(function(l){return l.conf}),aconf:cb.filter(function(l){return !l.conf})};
  var lista=f[fConf],F=[['todas','Todas'],['alerta','Com alerta'],['semalerta','Sem alerta'],['aconf','A conferir'],['conf','Conferidas']];
  return '<div class="fe-barra"><div class="fe-filtros">'+F.map(function(x){return '<button class="chip-f" data-fconf="'+x[0]+'" aria-pressed="'+(fConf===x[0])+'">'+x[1]+' <b>'+f[x[0]].length+'</b></button>'}).join('')+'</div><button class="btn" data-fe="lote" style="width:auto;padding:0 14px"'+(sem&&!c.fechada?'':' disabled')+'>Conferir todas as linhas sem alerta ('+sem+')</button></div>'+
   '<div class="tab-cartao"><table class="tab-fe conf"><colgroup><col style="width:27%"><col style="width:18%"><col style="width:12%"><col style="width:25%"><col style="width:18%"></colgroup><thead><tr><th>Loja (GS)</th><th>Responsável</th><th class="n">40% (valor a pagar)</th><th>Alertas</th><th>Conferência</th></tr></thead><tbody>'+
   (lista.length?lista.map(function(l){var al=alertas(c,l),p=pagador(l.pid);
     return '<tr><td data-rot="Loja (GS)"><div class="lj-n">'+esc(l.n)+'</div><div class="lj-gs">'+esc(l.gs)+'</div></td><td data-rot="Responsável" class="rp">'+(semResp(l)?'<i class="sr-r">Sem responsável</i>':esc(p.nome))+'</td><td data-rot="40%" class="n v40">'+R(v40(l))+'</td>'+
      '<td data-rot="Alertas">'+(al.length?al.map(function(a){return '<span class="fs gr">'+a+'</span>'}).join(' '):'<span class="nt">Sem alertas</span>')+'</td>'+
      '<td data-rot="Conferência">'+(l.conf?'<div class="cf-ok">'+ic('check-circle')+'<span>Conferida por '+esc(l.conf.q)+'<small>'+esc(l.conf.t)+'</small></span></div>':'<button class="btn sec" data-fe="conferir" data-r="'+l.rid+'" style="width:auto;padding:0 14px"'+(c.fechada?' disabled':'')+'>Conferir</button>')+'</td></tr>'}).join(''):'<tr><td colspan="5" class="vazio-t"><b>Nenhuma linha neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
function etapa3(c){
  var g=grupoEnvio(c),pron=g.prontos,fila=pron.filter(function(x){return !c.env[x.pid]}),sel=Object.keys(selEnv).filter(function(k){return selEnv[k]&&fila.some(function(x){return String(x.pid)===k})});
  if(prevPid===null||!pron.some(function(x){return x.pid===prevPid}))prevPid=pron.length?pron[0].pid:null;
  var pg=pron.filter(function(x){return x.pid===prevPid})[0];
  var lista=pron.map(function(x){var p=pagador(x.pid),e=c.env[x.pid];
    return '<div class="ev-lin'+(x.pid===prevPid?' sel':'')+'" data-prev="'+x.pid+'" role="button" tabindex="0">'+(e?'<span class="ev-ck off">'+ic('check')+'</span>':'<label class="ev-ck"><input type="checkbox" data-selenv="'+x.pid+'"'+(selEnv[x.pid]?' checked':'')+' aria-label="Selecionar '+esc(p.nome)+'"></label>')+
     '<div class="ev-t"><b>'+esc(p.nome)+'</b><small>'+(x.conf.length<x.lojas.length?x.conf.length+' de '+x.lojas.length+' lojas conferidas':x.lojas.length+(x.lojas.length===1?' loja':' lojas'))+'</small></div><b class="n">'+R(x.total)+'</b>'+(e?chip('Enviada','vd'):chip('Pronta','ok'))+'</div>'}).join('');
  var outros=g.outros.map(function(o){var p=pagador(o.g.pid);return '<div class="ev-lin sep"><div class="ev-t"><b>'+esc(p.nome)+(o.g.nao?' · '+esc(o.g.lojas[0].n):'')+'</b><small>'+o.m+'</small></div>'+chip('Separado','cn')+'</div>'}).join('');
  var prev=pg?'<div class="pv-cab"><b>Prévia da mensagem</b><span class="nt">'+esc(pagador(pg.pid).nome)+' · '+esc(pagador(pg.pid).fone)+'</span></div><pre class="pv-txt">'+esc(msg(c,pg))+'</pre><div class="pv-pe">'+(c.env[pg.pid]?'<span class="nt">Enviada em '+esc(c.env[pg.pid].t)+'</span>':'<button class="btn" data-fe="enviar1" data-p="'+pg.pid+'" style="width:auto;padding:0 16px">Enviar este</button>')+'</div>':'<div class="fe-vazio">Nenhum pagador pronto para envio. Confira as lojas na etapa 2.</div>';
  return '<div class="fe-barra"><div class="fe-info"><b>'+pron.length+'</b> pagadores prontos · <b>'+fila.length+'</b> ainda não enviados · uma mensagem por pessoa, com todas as lojas e o total</div><div class="fe-filtros"><button class="btn sec" data-fe="envsel" style="width:auto;padding:0 14px"'+(sel.length&&!c.fechada?'':' disabled')+'>Enviar selecionados ('+sel.length+')</button><button class="btn" data-fe="envtodos" style="width:auto;padding:0 14px"'+(fila.length&&!c.fechada?'':' disabled')+'>Enviar todos ('+fila.length+')</button></div></div>'+
   '<div class="ev-grade"><div class="ev-col"><div class="ev-tit">Pagadores</div>'+(lista||'<div class="fe-vazio">Ninguém pronto ainda.</div>')+(outros?'<div class="ev-tit ev-tit2">Separados, não serão enviados</div>'+outros:'')+'</div><div class="ev-col ev-prev">'+prev+'</div></div>';
}
function acomp(c){
  var pg=pagadoresCobr(c),env=pg.filter(function(g){return c.env[g.pid]}),nao=pg.filter(function(g){return !c.env[g.pid]});
  function tot(g){return g.lojas.filter(function(l){return l.conf}).reduce(function(a,l){return a+v40(l)},0)}
  var h1='<div class="grupo-f-cab">'+ic('send')+'<h3>Já enviaram</h3><span class="c">'+env.length+'</span></div>'+(env.length?env.map(function(g){var p=pagador(g.pid),e=c.env[g.pid];return '<div class="ac-lin"><div style="min-width:0"><div class="pg">'+esc(p.nome)+'</div><div class="nt">Enviada em '+esc(e.t)+'</div></div><div class="ac-st">'+(e.ok?chip('Entregue','vd'):chip('Não entregue','gr'))+'</div><b class="din">'+R(tot(g))+'</b><div class="ac-bt">'+(e.ok?'':'<button class="btn sec" data-fe="reenviar" data-p="'+g.pid+'">Reenviar</button>')+'</div></div>'}).join(''):'<div class="fe-vazio">Nenhuma cobrança enviada ainda.</div>');
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
function editar(l){
  var c=C();
  var m=U.modal({titulo:'Editar '+l.n,ok:'Salvar alteração',html:'<div class="f-grade"><div class="campo"><label for="ed-f">Total faturado</label><input id="ed-f" value="'+(l.fat===null?'':String(l.fat).replace('.',','))+'" inputmode="decimal" placeholder="0,00"></div><div class="campo"><label for="ed-i">Imposto</label><input id="ed-i" value="'+(l.imp===null?'':String(l.imp).replace('.',','))+'" inputmode="decimal" placeholder="0,00"></div><div class="campo"><label for="ed-a">Alíquota %</label><input id="ed-a" value="'+l.aliq+'" inputmode="decimal"></div><div class="campo"><label>40% (valor a pagar)</label><div class="ed-calc" id="ed-v">—</div></div></div>'+
    '<label class="lembrar" style="margin-top:12px"><input type="checkbox" id="ed-n"'+(l.nao?' checked':'')+'>Não cobrar esta loja</label>'+
    '<div class="campo" style="margin-top:12px"><label for="ed-m">Motivo da alteração <i class="obr">*</i></label><textarea id="ed-m" rows="3" class="cb-area" placeholder="Explique o que mudou e por quê"></textarea><small class="erro" id="ed-e" hidden>Informe o motivo. Toda alteração fica registrada.</small></div>'+(c.fechada?'<p class="dica-m" style="margin-top:8px">Competência fechada: a alteração ficará marcada como feita após o fechamento.</p>':''),
    onOk:function(mm){
      var f=num(mm.querySelector('#ed-f').value),i=num(mm.querySelector('#ed-i').value),a=num(mm.querySelector('#ed-a').value)||40,n=mm.querySelector('#ed-n').checked,mo=mm.querySelector('#ed-m').value.trim();
      if(!mo){mm.querySelector('#ed-e').hidden=false;mm.querySelector('#ed-m').focus();return false}
      var mud=false;
      if(f!==(l.fat===null?0:l.fat)||(l.fat===null&&mm.querySelector('#ed-f').value.trim()!=='')){log(l,'Faturado',l.fat===null?'—':R(l.fat),R(f),mo);l.fat=f;mud=true}
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
      alt.forEach(function(a){log(a.l,'Importação','Fat. '+(a.l.fat===null?'—':R(a.l.fat))+' / Imp. '+(a.l.imp===null?'—':R(a.l.imp)),'Fat. '+R(a.fat)+' / Imp. '+R(a.imp),'Importação de '+nome);a.l.fat=a.fat;a.l.imp=a.imp;a.l.conf=null});
      novas.forEach(function(n,i){var id='n'+Date.now()+i;c.lojas.push({rid:id,pid:n.pid,ref:{st:'ativa'},gs:n.gs,n:n.n,plat:n.plat,fat:n.fat,imp:n.imp,aliq:40,ant:Math.round(n.imp*.4*100)/100,nao:false,conf:null,tag:'Nova',hist:[{t:agora(),q:EU,c:'Loja nova',de:'—',para:'Entrou pela importação',m:'Importação de '+nome}]})});
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
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b,c=C();
  if((b=t.closest('[data-etapa]'))){etapa=+b.dataset.etapa;render();return}
  if((b=t.closest('[data-fconf]'))){fConf=b.dataset.fconf;refaz();return}
  if((b=t.closest('[data-fe]'))){
    var a=b.dataset.fe;
    if(a==='editar')editar(linha(b.dataset.r));else if(a==='hist')historico(linha(b.dataset.r));else if(a==='importar')importar();else if(a==='fechar')fechar();
    else if(a==='conferir')conferir(linha(b.dataset.r));
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
  if(e.target.id==='fe-comp'){atual=e.target.value;etapa=1;fConf='todas';selEnv={};prevPid=null;render()}
  if(e.target.dataset&&e.target.dataset.selenv){selEnv[e.target.dataset.selenv]=e.target.checked;var y=window.scrollY;render();window.scrollTo(0,y)}
});
document.addEventListener('keydown',function(e){if(noEl(e)&&e.key==='Enter'&&e.target.dataset&&e.target.dataset.prev){var v=e.target.dataset.prev;prevPid=/^x/.test(v)?v:+v;refaz()}});
return {render:render};
})();
