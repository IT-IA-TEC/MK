/* Ficha do pagador. Uma só, usada em Pagadores e Lojas (gaveta) e em Conversas (coluna 3). */
window.MKFicha=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic;
var ST={ativa:'Ativa',bloqueada:'Bloqueada',inativa:'Inativa'};
var abertos={resumo:true,lojas:true,robo:true,hist:false,acomp:true,acordo:false,comp:false,tempo:false,pessoas:false,regras:false};
var ouvintes=[],hooks={};
function R(v){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function agora(){var d=new Date();return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' · '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function selo(p){
  var m={dia:['Em dia','vd'],avencer:['A vencer','ok'],atraso:['Em atraso '+(p.dias||1)+(p.dias===1?' dia':' dias'),'gr'],acordo:['Em acordo','at']}[p.fin];
  return '<span class="atraso '+m[1]+'">'+m[0]+'</span>';
}
function base(p){return 1800+p.id*730}
function valorMes(p){return p.lojas.map(function(l,i){return [l.n,Math.round(base(p)*(1+((i*3+p.id)%5)/10))]})}
function cobranca(p){var it=valorMes(p);return {comp:'setembro/2026',itens:it,total:it.reduce(function(a,x){return a+x[1]},0)}}
function dOff(off){var d=new Date();d.setDate(d.getDate()+off);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()}
/* rateio exato em centavos: a soma das parcelas é sempre igual ao total */
function ratear(total,n){var c=Math.round(total*100),b=Math.floor(c/n),r=c-b*n,o=[];for(var i=0;i<n;i++)o.push((b+(i<r?1:0))/100);return o}
function acordoDe(p){
  if(!p.acordo&&p.fin==='acordo'){
    var tt=cobranca(p).total,vs=ratear(tt,5),ps=[],b=p.id===9?-5:p.id===4?0:5;
    for(var i=1;i<=5;i++)ps.push({n:i,venc:dOff(b+(i-2)*30),valor:vs[i-1],st:i<2?'paga':(i===2&&p.id===9)?'atrasada':'aberta'});
    p.acordo={parcelas:ps,estado:'ativo',total:tt};
  }
  return p.acordo;
}
function financeiro(p){
  var c=cobranca(p),ac=acordoDe(p),out={aberto:0,prox:'20/10/2026',comps:[]};
  if(p.fin==='atraso'){out.aberto=c.total;out.comps.push(['Set/2026',c.total]);if((p.dias||0)>20){var a=Math.round(c.total*.9);out.aberto+=a;out.comps.push(['Ago/2026',a])}out.prox='Vencida em '+String(20)+'/09/2026'}
  else if(p.fin==='avencer'){out.aberto=c.total;out.comps.push(['Set/2026',c.total]);out.prox='05/10/2026'}
  else if(p.fin==='acordo'){var rest=ac.parcelas.filter(function(x){return x.st!=='paga'});out.aberto=rest.reduce(function(a,x){return a+x.valor},0);rest.forEach(function(x){out.comps.push(['Parcela '+x.n+' do acordo',x.valor])});out.prox=rest.length?rest[0].venc:'—'}
  return out;
}
function comprovantes(p){
  if(!p.compr)p.compr=[{arq:'comprovante-pix-ago.pdf',data:'21/08',valor:Math.round(base(p)*.98),st:'conferido'}];
  return p.compr;
}
function tempo(p){
  var e=(p.ev||[]).slice();
  var b=[['30/09 · 08:12','Cobrança de setembro enviada por WhatsApp']];
  if(p.fin==='atraso')b.unshift(['21/09 · 00:00','Cobrança venceu sem pagamento']);
  else if(p.fin==='acordo')b.unshift(['12/09 · 10:05','Acordo fechado em parcelas']);
  else b.unshift(['18/09 · 11:30','Pagamento confirmado e comprovante conferido']);
  b.push(['20/08 · 09:10','Troca de número informada pelo pagador'],['02/09 · 14:18','Pagador pediu segunda via'],['01/09 · 08:00','Cobrança de setembro gerada']);
  return e.concat(b);
}
function pessoas(p){
  var pr=p.nome.split(' ')[0];pr=pr.charAt(0)+pr.slice(1).toLowerCase();
  return p.pessoas||[[p.nome,'Responsável, paga por conta própria',p.fone],['Financeiro '+pr,'Contato financeiro','(11) 3'+(100+p.id*7)+'-'+(4000+p.id*131)],['Sócio de '+pr,'Sócio','(11) 9'+(8000+p.id*53)+'-'+(1000+p.id*97)]];
}
function bloco(id,titulo,cnt,corpo){
  return '<section class="fb"><button class="fb-cab" data-bloco="'+id+'" aria-expanded="'+!!abertos[id]+'"><span>'+titulo+(cnt!=null?' <em>'+cnt+'</em>':'')+'</span>'+ic('chevron-down')+'</button><div class="fb-corpo"'+(abertos[id]?'':' hidden')+'>'+corpo+'</div></section>';
}
function html(p,aba){
  aba=aba||'ficha';
  var f=financeiro(p),ac=acordoDe(p),cs=comprovantes(p),pes=pessoas(p),pend=cs.filter(function(c){return c.st==='conferir'}).length;
  var resumo='<div class="f-kv"><span>Total em aberto</span><b class="din">'+R(f.aberto)+'</b></div><div class="f-kv"><span>Próximo vencimento</span><b>'+esc(f.prox)+'</b></div>'+
    '<div class="f-bts"><button class="btn sec" data-fa="memoria">Memória de cálculo</button></div>'+
    (f.comps.length?'<div class="f-sub">Competências em aberto</div>'+f.comps.map(function(c){return '<div class="f-kv"><span>'+esc(c[0])+'</span><b class="din">'+R(c[1])+'</b></div>'}).join(''):'<div class="f-vazio">Nenhuma competência em aberto.</div>');
  var A=window.MKMarketplaces&&MKMarketplaces.api();
  function cnpjF(c){var d=String(c||'').replace(/\D/g,'');return d.length===14?d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5'):esc(c||'')}
  var lojas=p.lojas.map(function(l){return '<div class="fl"><div class="fl-t"><div class="fl-n">'+(A?A.logoI(l.plat):'')+'<b>'+esc(l.n)+'</b></div>'+(A?'<button class="btn sec" style="width:auto;padding:0 12px;height:30px;flex:none" data-fa="loja" data-gs="'+esc(l.gs)+'">Ficha da loja</button>':'')+'</div>'+
    '<div class="fl-id"><span>'+esc(l.plat)+'</span><span class="mono">Código '+esc(l.gs)+'</span></div>'+
    '<div class="fl-g"><div><small>Situação da loja</small><span class="selo '+l.st+'">'+ST[l.st]+'</span></div>'+(A?'<div><small>Conexão</small>'+A.conHtml(l)+'</div><div><small>Análise</small>'+A.seloHtml(l.gs)+'</div>':'')+'</div>'+
    (l.cnpj?'<div class="fl-cn"><small>CNPJ (só informação)</small><span class="mono">'+cnpjF(l.cnpj)+'</span></div>':'')+'</div>'}).join('')+
    '<div class="f-bts"><button class="btn esc" data-fa="bloquear">Bloquear todas e enviar</button><button class="btn sec" data-fa="liberar">Liberar todas e enviar</button></div>';
  var hist=A?A.historicoHtml(p):'';
  var RB=window.MKRobo&&MKRobo.api(),rs=RB?RB.situacao(p.id):null;
  var robo=rs?'<div class="f-robo"><div class="fr-st"><span class="fs '+(rs.st==='Atende'?'vd':rs.st==='Em teste'?'ok':'gr')+'">'+rs.st+'</span><span class="nt">desde '+esc(rs.desde)+' · alterado por '+esc(rs.quem)+'</span></div>'+(rs.motivo?'<div class="nt">Motivo: '+esc(rs.motivo)+'</div>':'')+
    '<div class="f-sub">Mudar a situação do robô</div><div class="f-bts">'+['Atende','Não atende','Em teste'].map(function(s){return '<button class="btn '+(rs.st===s?'esc':'sec')+'" data-fa="robo" data-st="'+s+'"'+(rs.st===s?' disabled':'')+'>'+s+'</button>'}).join('')+'</div>'+
    '<div class="f-sub">O cliente pediu para parar?</div><div class="f-bts"><button class="btn sec" data-fa="optout"'+(rs.optOut?' disabled':'')+' title="O cliente pediu para não receber mais mensagens">'+(rs.optOut?'Pedido registrado':'Registrar pedido para parar')+'</button></div><div class="nt">O robô deixa de enviar mensagens para este pagador.</div>'+
    '<div class="f-sub">Como gerar os Pix</div><div class="f-bts">'+[['','Padrão do sistema'],['pagador','Um Pix por pagador'],['loja','Um Pix por loja']].map(function(m){return '<button class="btn '+((p.modoCob||'')===m[0]?'esc':'sec')+'" data-fa="modocob" data-m="'+m[0]+'">'+m[1]+'</button>'}).join('')+'</div><div class="nt">'+(p.modoCob==='loja'?'Uma cobrança e um Pix para cada loja.':'Uma cobrança e um Pix para todas as lojas do pagador.')+' O padrão é definido em Configurações.</div></div>':'';
  var acomp=p.promessa?'<div class="f-kv"><span>Promessa ativa</span><b>Pagar em '+esc(p.promessa.data)+'</b></div><div class="f-kv"><span>Prazo de retorno</span><b>'+esc(p.retorno||'Sem retorno marcado')+'</b></div>':'<div class="f-vazio">Nenhuma promessa ativa.</div>';
  acomp+='<div class="f-bts"><button class="btn sec" data-fa="resultado">Registrar resultado</button></div>';
  var acordo=ac?ac.parcelas.map(function(x){var cl=x.st==='paga'?'vd':x.st==='atrasada'?'gr':'ok',tx=x.st==='paga'?'Paga':x.st==='atrasada'?'Atrasada':'A vencer';return '<div class="f-lin"><div><div class="pg">Parcela '+x.n+' de '+ac.parcelas.length+'</div><div class="nt">Vence '+esc(x.venc)+'</div></div><div class="f-dir"><b class="din">'+R(x.valor)+'</b><span class="atraso '+cl+'">'+tx+'</span><span class="nt">'+(x.st==='paga'?'Pix pago':'Pix próprio da parcela')+'</span></div></div>'}).join(''):'<div class="f-vazio">Este pagador não tem acordo.</div><div class="f-bts"><button class="btn" data-fa="acordo">Criar acordo</button></div>';
  var comp=cs.map(function(c,i){return '<div class="f-lin"><div style="min-width:0"><div class="pg">'+esc(c.arq)+'</div><div class="nt">Recebido em '+esc(c.data)+(c.valor?' · '+R(c.valor):'')+'</div></div><div class="f-dir">'+(c.st==='conferir'?'<span class="atraso at">A conferir</span><button class="btn sec" style="width:auto;padding:0 12px" data-fa="conferir" data-i="'+i+'">Conferir</button>':'<span class="atraso vd">Conferido</span>')+'</div></div>'}).join('');
  var tl='<ol class="tempo">'+tempo(p).map(function(e){return '<li><span class="nt mono">'+esc(e[0])+'</span><span>'+esc(e[1])+'</span></li>'}).join('')+'</ol>';
  var pe=pes.map(function(x){return '<div class="f-lin"><div style="min-width:0"><div class="pg">'+esc(x[0])+'</div><div class="nt">'+esc(x[1])+'</div></div><div class="nt mono">'+esc(x[2])+'</div></div>'}).join('');
  var regras=[['Régua de cobrança','Etapas em 1, 5 e 10 dias após o vencimento'],['Permite parcelar',p.id%3===0?'Não':'Sim, em até 6 vezes'],['Bloqueio','Último dia do mês do vencimento']].map(function(r){return '<div class="f-kv"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'}).join('');
  var topo='<div class="f-topo"><h3>'+esc(p.nome)+'</h3><div class="f-topo-l"><span><small>WhatsApp</small><span class="mono">'+esc(p.fone)+'</span></span>'+(p.cpf?'<span><small>CPF</small><span class="mono">'+esc(p.cpf)+'</span></span>':'')+'<span><small>Situação</small>'+selo(p)+'</span></div></div>'+
    (A?'<div class="f-abas" role="tablist" aria-label="Seções da ficha"><button role="tab" class="f-aba" data-fatab="ficha" aria-selected="'+(aba==='ficha')+'">Ficha</button><button role="tab" class="f-aba" data-fatab="analise" aria-selected="'+(aba==='analise')+'">Análise</button></div>':'');
  if(aba==='analise'&&A)return topo+'<div class="f-analise">'+A.visaoCliente(p)+'</div>';
  return topo+
    bloco('resumo','Resumo financeiro',null,resumo)+bloco('robo','Robô',rs?rs.st:null,robo)+bloco('lojas','Lojas de marketplace',p.lojas.length,lojas)+(A?bloco('hist','Histórico de análises',A.nAnalises(p),hist):'')+bloco('acomp','Acompanhamento',null,acomp)+bloco('acordo','Acordo',null,acordo)+
    bloco('comp','Comprovantes',pend?pend+' a conferir':cs.length,comp)+bloco('tempo','Linha do tempo',null,tl)+bloco('pessoas','Pessoas ligadas',pes.length,pe)+bloco('regras','Regras',null,regras);
}
function avisar(p){ouvintes.forEach(function(f){f(p)})}
function evento(p,t){(p.ev=p.ev||[]).unshift([agora(),t])}
function mount(el,p){
  el._p=p;el.innerHTML=html(p,el._aba);U.icones();var gv=el.closest('.gaveta');if(gv)gv.classList.toggle('mk-g',el._aba==='analise');
  if(el._w)return;el._w=true;
  el.addEventListener('click',function(e){
    var p=el._p,b=e.target.closest('[data-bloco]');
    if(b){abertos[b.dataset.bloco]=!abertos[b.dataset.bloco];b.setAttribute('aria-expanded',abertos[b.dataset.bloco]);b.nextElementSibling.hidden=!abertos[b.dataset.bloco];return}
    var tb=e.target.closest('[data-fatab]');
    if(tb){el._aba=tb.dataset.fatab;mount(el,p);return}
    var ar=e.target.closest('[data-rel]');
    if(ar){var g0=el.closest('.gaveta');if(g0){var fx=g0.querySelector('.fechar');if(fx)fx.click()}MKMarketplaces.focar(ar.dataset.rel,{modo:'relatorio',snap:ar.dataset.snap});window.MKApp.ir('marketplaces');return}
    var a=e.target.closest('[data-fa]');if(!a)return;
    var acao=a.dataset.fa;
    function refaz(){mount(el,p);avisar(p)}
    if(acao==='optout'){U.modal({titulo:'Cliente pediu para parar?',ok:'Registrar',html:'<p class="dica-m">O robô deixa de enviar qualquer mensagem para '+esc(p.nome)+'. Só uma pessoa pode desfazer.</p>',onOk:function(){MKRobo.api().optOut(p.id);evento(p,'Pediu para parar de receber mensagens do robô');refaz();U.toast('Opt-out registrado.')}});return}
    if(acao==='memoria'){window.MKMemoria&&MKMemoria.abrir(p.id);return}
    if(acao==='modocob'){p.modoCob=a.dataset.m;evento(p,'Modo de cobrança: '+(a.dataset.m==='loja'?'um Pix por loja':a.dataset.m==='pagador'?'um Pix por pagador':'padrão do sistema'));refaz();U.toast('Modo de cobrança salvo.');return}
    if(acao==='robo'){var st=a.dataset.st,RBa=MKRobo.api(),fim=function(mot){RBa.definir(p.id,st,mot);evento(p,'Robô: '+st+(mot?' ('+mot+')':''));refaz();U.toast('Situação do robô salva.')};
      if(st==='Não atende')U.modal({titulo:'Robô não atende este pagador',ok:'Confirmar',html:'<p class="dica-m">O robô deixa de falar com '+esc(p.nome)+'. Escreva o motivo.</p><div class="campo"><label for="rb-m">Motivo <i class="obr">*</i></label><textarea class="cb-area" id="rb-m" rows="3"></textarea><small class="erro" id="rb-me" hidden>Escreva o motivo.</small></div>',onOk:function(m){var v=m.querySelector('#rb-m').value.trim();if(!v){m.querySelector('#rb-me').hidden=false;return false}fim(v)}});
      else fim('');return}
    if(acao==='pdfcliente'){MKMarketplaces.api().pdfCliente(p);return}
    if(acao==='loja'){var g1=el.closest('.gaveta');if(g1){var f1=g1.querySelector('.fechar');if(f1)f1.click()}MKMarketplaces.focar(a.dataset.gs);window.MKApp.ir('marketplaces');return}
    if(acao==='bloquear'||acao==='liberar'){
      var alvo=acao==='bloquear'?'ativa':'bloqueada',novo=acao==='bloquear'?'bloqueada':'ativa',n=p.lojas.filter(function(l){return l.st===alvo}).length;
      if(!n){U.toast(acao==='bloquear'?'Todas as lojas já estão bloqueadas ou inativas.':'Não há lojas bloqueadas para liberar.');return}
      U.modal({titulo:acao==='bloquear'?'Bloquear todas as lojas?':'Liberar todas as lojas?',html:'<p>'+n+(n===1?' loja de ':' lojas de ')+'<b>'+esc(p.nome)+'</b> serão '+(acao==='bloquear'?'bloqueadas':'liberadas')+'. O aviso segue automaticamente para o grupo de bloqueio.</p>',ok:acao==='bloquear'?'Bloquear e enviar':'Liberar e enviar',perigo:acao==='bloquear',
        onOk:function(){p.lojas.forEach(function(l){if(l.st===alvo)l.st=novo});
          var txt=(acao==='bloquear'?'Bloquear':'Liberar')+' todas as lojas de '+p.nome+'.';
          evento(p,(acao==='bloquear'?'Lojas bloqueadas':'Lojas liberadas')+' e aviso enviado ao grupo');
          if(hooks.grupo)hooks.grupo(txt);refaz();U.toast('Enviado ao grupo de bloqueio.')}});
    }else if(acao==='resultado'){
      U.menu(a,[{id:'reagendado',t:'Reagendado'},{id:'naoatendeu',t:'Não atendeu'},{id:'recusou',t:'Recusou'},{id:'numero',t:'Número errado'}],function(id){
        var t={reagendado:'Retorno reagendado',naoatendeu:'Contato sem resposta: não atendeu',recusou:'Pagador recusou pagar',numero:'Número informado está errado'}[id];p.sit={reagendado:'promessa reagendada',naoatendeu:'sem retorno',recusou:'recusou',numero:'número errado'}[id];p.contato=0;
        if(id==='recusou')delete p.promessa;evento(p,t);refaz();U.toast('Resultado registrado.')});
    }else if(acao==='acordo'){
      U.modal({titulo:'Criar acordo',ok:'Criar acordo',html:'<div class="campo"><label for="ac-n">Número de parcelas</label><select class="sel" id="ac-n">'+[2,3,4,5,6].map(function(n){return '<option>'+n+'</option>'}).join('')+'</select></div><div class="campo" style="margin-top:12px"><label for="ac-d">Vencimento da primeira parcela</label><input id="ac-d" type="date"></div><small class="erro" id="ac-e" hidden>Informe o vencimento da primeira parcela.</small>',
        onOk:function(m){var d=m.querySelector('#ac-d').value;if(!d){m.querySelector('#ac-e').hidden=false;return false}
          var n=+m.querySelector('#ac-n').value,tot=financeiro(p).aberto||cobranca(p).total,vs=ratear(tot,n),ps=[],dt=d.split('-');
          for(var i=0;i<n;i++){var mes=((+dt[1]-1+i)%12)+1,ano=+dt[0]+Math.floor((+dt[1]-1+i)/12);ps.push({n:i+1,venc:dt[2]+'/'+('0'+mes).slice(-2)+'/'+ano,valor:vs[i],st:'aberta'})}
          p.acordo={parcelas:ps,estado:'ativo',total:tot};p.fin='acordo';delete p.dias;evento(p,'Acordo criado em '+n+' parcelas');refaz();U.toast('Acordo criado.')}});
    }else if(acao==='conferir'){
      var c=comprovantes(p)[+a.dataset.i];c.st='conferido';evento(p,'Comprovante '+c.arq+' conferido');refaz();U.toast('Comprovante conferido.');
    }
  });
}
function abrir(p){
  var ant=document.activeElement;
  var v=document.createElement('div');v.className='veu';
  var g=document.createElement('aside');g.className='gaveta larga';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Ficha de '+p.nome);
  g.innerHTML='<button class="fechar fechar-abs" aria-label="Fechar">'+ic('x')+'</button><div class="gaveta-corpo ficha-c"></div>';
  document.body.appendChild(v);document.body.appendChild(g);
  var c=g.querySelector('.ficha-c');mount(c,p);
  requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){ouvintes.splice(ouvintes.indexOf(oy),1);v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function oy(q){if(q===p&&c.isConnected)mount(c,p)}
  ouvintes.push(oy);
  function tecla(e){if(e.key==='Escape'&&!document.querySelector('.modal')&&!document.getElementById('pop-ativo'))fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);var x=g.querySelector('.fechar');x.addEventListener('click',fechar);x.focus();
}
return {acordo:acordoDe,financeiro:financeiro,abrir:abrir,mount:mount,selo:selo,cobranca:cobranca,comprovantes:comprovantes,evento:evento,quandoMudar:function(f){ouvintes.push(f)},hooks:hooks,R:R,agora:agora};
})();
