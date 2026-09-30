/* Tela Dashboard. Dados vêm de window.MK_DASH (exemplo). Na integração, virão do Java. */
window.MKDashboard=(function(){
var D=window.MK_DASH,el=null,periodo='mes',filtro='todos',ultimoFoco=null;
var META=[
  {k:'cobrar',c:'Cobrar hoje',t:'Cobrar hoje',i:'send',b:'Cobrar agora'},
  {k:'promessas',c:'Promessas',t:'Promessas de pagamento',i:'calendar-clock',b:'Cobrar promessa'},
  {k:'retornos',c:'Retornos',t:'Retornos combinados para hoje',i:'phone-call',b:'Retornar contato'},
  {k:'parcelas',c:'Parcelas',t:'Parcelas de acordo',i:'handshake',b:'Cobrar parcela'},
  {k:'mensagens',c:'Sem resposta',t:'Mensagens sem resposta',i:'message-circle',b:'Responder'}
];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function R(v){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function R0(v){return 'R$ '+v.toLocaleString('pt-BR',{maximumFractionDigits:0})}
function din(v,cls){return '<div class="din '+(cls||'')+'">'+R(v)+'</div>'}
function dias(d){
  if(d<=0)return '<span class="atraso ok">'+(d===0?'Vence hoje':'A vencer')+'</span>';
  return '<span class="atraso '+(d>7?'gr':'at')+'">'+d+(d===1?' dia':' dias')+' de atraso</span>';
}
function lojas(l){return '<div class="lojas">'+l.map(function(x){return '<span class="tag">'+esc(x)+'</span>'}).join('')+'</div>'}
function botao(txt,p,cls){return '<button class="btn '+(cls||'')+'" data-acao="'+esc(txt)+'" data-pg="'+esc(p)+'">'+esc(txt)+'</button>'}

function numeros(){
  var d=D.periodos[periodo];
  function card(id,rot,v,nota,cls){return '<button class="num-card '+(cls||'')+'" data-lista="'+id+'"><small>'+rot+ic('arrow-up-right')+'</small><span class="n">'+v+'</span><span class="nota">'+nota+'</span></button>'}
  return '<section class="bloco"><div class="bloco-cab"><h2>Números do período</h2>'+
   '<label class="leg" for="sel-periodo" style="display:flex;align-items:center;gap:10px">Período <select class="sel" id="sel-periodo">'+
   Object.keys(D.periodos).map(function(k){return '<option value="'+k+'"'+(k===periodo?' selected':'')+'>'+D.periodos[k].rotulo+'</option>'}).join('')+'</select></label></div>'+
   '<div class="numeros">'+
   card('cobrado','Cobrado no mês',R0(d.cobrado[0]),d.cobrado[1]+' cobranças geradas')+
   card('recebido','Recebido no mês',R0(d.recebido[0]),d.recebido[1]+' pagamentos confirmados')+
   card('avencer','A vencer',R0(d.avencer[0]),d.avencer[1]+' cobranças enviadas')+
   card('vencido','Vencido',R0(d.vencido[0]),d.vencido[1]+' em atraso · sem passivo baixado','perigo')+
   card('pont','Pontualidade',d.pont[0]+'%',d.pont[1]+' de '+d.pont[2]+' pagos em dia')+
   '</div></section>';
}
function andamento(){
  var hoje=new Date(),dim=new Date(hoje.getFullYear(),hoje.getMonth()+1,0).getDate(),dia=hoje.getDate();
  var pct=Math.round(dia/dim*100),marca=Math.round(20/dim*100);
  var txt=dia<20?('Faltam '+(20-dia)+(20-dia===1?' dia':' dias')+' para o vencimento'):dia===20?'Hoje é o dia do vencimento':('O vencimento passou há '+(dia-20)+(dia-20===1?' dia':' dias'));
  var e=D.envio,r=D.receb,c=D.comprovantes;
  return '<section class="bloco"><div class="bloco-cab"><h2>Andamento do mês</h2><span class="leg">'+txt+'</span></div><div class="andamento">'+
   '<div class="mes-barra"><div class="mes-trilho"><div class="mes-fill" style="width:'+pct+'%"></div><div class="mes-marca" style="left:'+marca+'%"><span class="mes-marca-t">Vencimento dia 20</span></div></div>'+
   '<div class="mes-pes"><span>Dia 1</span><span>Hoje, dia '+dia+'</span><span>Dia '+dim+'</span></div></div>'+
   '<div class="and-grade">'+
    '<div class="and-item"><span class="rot">Envio da cobrança</span><div class="val">'+e.x+' <span>de '+e.y+' pagadores</span></div><div class="barra"><i style="width:'+Math.round(e.x/e.y*100)+'%"></i></div><span class="leg" style="font-size:13px;color:var(--apoio)">já receberam a cobrança</span></div>'+
    '<div class="and-item"><span class="rot">Recebimento</span><div class="val">'+r.x+' <span>de '+r.y+' pagadores</span></div><div class="barra"><i style="width:'+Math.round(r.x/r.y*100)+'%"></i></div><span style="font-size:13px;color:var(--apoio)">já pagaram</span></div>'+
    '<div class="and-item"><span class="rot">Comprovantes</span><div class="val">'+c.chegaram+' <span>chegaram</span></div><div class="barra"><i style="width:'+Math.round((c.chegaram-c.aguardam)/c.chegaram*100)+'%"></i></div><span style="font-size:13px;color:var(--apoio)">'+c.aguardam+' aguardam conferência</span></div>'+
   '</div><div class="and-rodape"><div><button class="link-btn" id="btn-falta" aria-expanded="false" aria-controls="falta">Ver quem falta receber a cobrança ('+e.falta.length+')'+ic('chevron-down')+'</button></div><div class="falta" id="falta" hidden>'+e.falta.map(function(x){return '<span class="tag">'+esc(x)+'</span>'}).join('')+'</div></div></div></section>';
}
function fila(){
  var tot=0,cont={};
  META.forEach(function(m){cont[m.k]=D.fila[m.k].length;tot+=cont[m.k]});
  var chips='<button class="chip-f" id="f-todos" data-filtro="todos" aria-pressed="'+(filtro==='todos')+'">Tudo <b>'+tot+'</b></button>'+
    META.filter(function(m){return cont[m.k]>0}).map(function(m){return '<button class="chip-f" id="f-'+m.k+'" data-filtro="'+m.k+'" aria-pressed="'+(filtro===m.k)+'">'+m.c+' <b>'+cont[m.k]+'</b></button>'}).join('');
  var corpo=META.filter(function(m){return cont[m.k]>0&&(filtro==='todos'||filtro===m.k)}).map(function(m){
    return '<div class="grupo-f-cab">'+ic(m.i)+'<h3>'+m.t+'</h3><span class="c">'+cont[m.k]+'</span></div>'+
    D.fila[m.k].map(function(x){return '<div class="linha"><div style="min-width:0"><div class="pg">'+esc(x.p)+'</div><div class="nt">'+esc(x.n)+'</div></div>'+lojas(x.l)+dias(x.d)+din(x.v)+botao(m.b,x.p)+'</div>'}).join('');
  }).join('');
  return '<section class="bloco"><div class="bloco-cab"><h2>Fila do dia</h2><span class="leg">Sempre de hoje</span></div><div class="fila">'+
    (tot?'<div class="filtros">'+chips+'</div><div class="cab-col"><span>Pagador</span><span>Lojas</span><span>Situação</span><span class="d">Valor</span><span></span></div>'+corpo:'<div class="nada">Nada para hoje.</div>')+'</div></section>';
}
function pendencias(){
  var P=D.pend,g=[];
  function grupo(t,i,arr,linha){
    if(!arr.length)return;
    g.push('<div class="grupo-f-cab">'+ic(i)+'<h3>'+t+'</h3><span class="c">'+arr.length+'</span></div>'+arr.map(linha).join(''));
  }
  function lin(p,c2,c3,v,b){return '<div class="comp-lin"><div class="pg">'+esc(p)+'</div><div class="nt">'+c2+'</div><div class="nt">'+c3+'</div>'+din(v)+b+'</div>'}
  grupo('Comprovantes para conferir','receipt-text',P.comprovantes,function(x){return lin(x.p,esc(x.dest),'Competência sugerida: <b>'+esc(x.comp)+'</b>',x.v,botao('Conferir',x.p,'sec'))});
  grupo('Bloqueios a pedir','lock',P.bloquear,function(x){return lin(x.p,esc(x.l),dias(x.d),x.v,botao('Pedir bloqueio',x.p,'esc'))});
  grupo('Desbloqueios a pedir','lock-open',P.desbloquear,function(x){return lin(x.p,esc(x.l),esc(x.q)+', loja ainda bloqueada',x.v,botao('Pedir desbloqueio',x.p))});
  grupo('Pedidos de saída em andamento','log-out',P.saidas,function(x){return lin(x.p,esc(x.parc),'<span class="est">'+esc(x.st)+'</span>',x.falta,botao('Abrir pedido',x.p,'sec'))});
  if(!g.length)return '';
  return '<section class="bloco"><div class="bloco-cab"><h2>Pendências de decisão</h2></div><div class="fila"><div class="cab-col"><span>Pagador</span><span>Detalhe</span><span>Situação</span><span class="d">Valor</span><span></span></div>'+g.join('')+'</div></section>';
}
function alertas(){
  if(!D.alertas.length)return '';
  return '<section class="bloco"><div class="bloco-cab"><h2>Alertas de dado</h2></div><div class="alertas">'+D.alertas.map(function(a){
    return '<div class="alerta"><span class="ico">'+ic(a.i)+'</span><div style="min-width:0"><h4>'+esc(a.t)+'</h4><p>'+esc(a.d)+'</p></div><div class="fim"><span class="cnt">'+a.n+'</span>'+botao('Ver',a.t,'sec')+'</div></div>'}).join('')+'</div></section>';
}
function desenhar(){
  var box=document.getElementById('graf');if(!box)return;
  var ev=D.rank.evolucao,W=Math.max(280,box.clientWidth-32),H=240,L=48,T=10,B=26,Rr=4,pw=W-L-Rr,ph=H-T-B,mx=500000,g=pw/ev.length,bw=Math.min(30,g*.26);
  var s='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Cobrado e recebido nos últimos 6 meses">';
  for(var v=0;v<=mx;v+=100000){var y=Math.round(T+ph*(1-v/mx))+.5;s+='<line x1="'+L+'" x2="'+(W-Rr)+'" y1="'+y+'" y2="'+y+'" style="stroke:var(--borda)" stroke-width="1"/><text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end">'+(v===0?'0':(v/1000)+' mil')+'</text>'}
  ev.forEach(function(m,i){
    var cx=L+g*i+g/2,h1=ph*m[1]/mx,h2=ph*m[2]/mx;
    s+='<rect x="'+(cx-bw-1.5)+'" y="'+(T+ph-h1)+'" width="'+bw+'" height="'+h1+'" rx="2" style="fill:var(--apoio-claro)"><title>Cobrado '+m[0]+': '+R0(m[1])+'</title></rect>'+
       '<rect x="'+(cx+1.5)+'" y="'+(T+ph-h2)+'" width="'+bw+'" height="'+h2+'" rx="2" style="fill:var(--verde-vivo)"><title>Recebido '+m[0]+': '+R0(m[2])+'</title></rect>'+
       '<text x="'+cx+'" y="'+(H-8)+'" text-anchor="middle">'+m[0]+'</text>';
  });
  box.innerHTML=s+'</svg>';
}
window.addEventListener('resize',function(){clearTimeout(desenhar.h);desenhar.h=setTimeout(desenhar,120)});
function rankings(){
  function lista(tit,ico,arr,dev){var mx=arr[0][1];return '<div class="cx"><div class="cx-cab">'+ic(ico)+'<h3>'+tit+'</h3></div>'+arr.map(function(x,i){
    return '<div class="rank-l"><span class="pos">'+(i+1)+'</span><span class="pg">'+esc(x[0])+'</span><b class="din" style="font-variant-numeric:tabular-nums">'+R(x[1])+'</b><div class="barra"><i class="'+(dev?'dev':'')+'" style="width:'+Math.round(x[1]/mx*100)+'%"></i></div></div>'}).join('')+'</div>'}
  return '<section class="bloco"><div class="bloco-cab"><h2>Rankings</h2></div><div class="rank-grade">'+
    lista('Maiores devedores','trending-down',D.rank.devedores,true)+lista('Maiores pagadores','trending-up',D.rank.pagadores,false)+
    '<div class="cx gtotal"><div class="cx-cab">'+ic('bar-chart-3')+'<h3>Cobrado x recebido, últimos 6 meses</h3></div><div class="legenda"><span><i style="background:var(--apoio-claro)"></i>Cobrado</span><span><i style="background:var(--verde-vivo)"></i>Recebido</span></div><div class="grafico" id="graf"></div></div>'+
  '</div></section>';
}
function render(alvo){
  if(alvo)el=alvo;
  var foco=document.activeElement&&document.activeElement.id;
  var hoje=new Date(),mes=hoje.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}),dt=hoje.toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
  el.innerHTML='<div class="dash"><div class="dash-topo"><div><h1>Dashboard</h1><p class="sub">'+mes.charAt(0).toUpperCase()+mes.slice(1)+' · hoje, '+dt+'</p></div>'+
   '</div>'+
   numeros()+andamento()+fila()+pendencias()+alertas()+rankings()+
   '<div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  desenhar();
  if(window.lucide)lucide.createIcons();
  if(foco){var f=document.getElementById(foco);if(f)f.focus()}
}
/* gaveta com a lista de cada cartão */
function gaveta(id){
  var d=D.periodos[periodo],c=D.cobrancas,titulo,sub,linhas,tot;
  var mapa={
    cobrado:['Cobrado no mês','Todas as cobranças geradas na competência',c,d.cobrado[1]],
    recebido:['Recebido no mês','Pagamentos confirmados',c.filter(function(x){return x.st==='pago'}),d.recebido[1]],
    avencer:['A vencer','Cobranças enviadas que ainda não venceram',c.filter(function(x){return x.st==='avencer'}),d.avencer[1]],
    vencido:['Vencido','Em atraso, sem contar o passivo baixado',c.filter(function(x){return x.st==='vencido'}),d.vencido[1]],
    pont:['Pontualidade','Pagamentos do mês e se chegaram em dia',c.filter(function(x){return x.st==='pago'}),d.pont[2]]
  }[id];
  titulo=mapa[0];sub=mapa[1];linhas=mapa[2];tot=mapa[3];
  function status(x){
    if(x.st==='pago')return 'Pago '+x.em+(x.d>0?' · '+x.d+' dias depois do vencimento':' · em dia');
    if(x.st==='avencer')return 'Vence em '+(-x.d)+(-x.d===1?' dia':' dias');
    return x.d+' dias de atraso';
  }
  var ant=document.activeElement;
  var v=document.createElement('div');v.className='veu';v.id='veu';
  var g=document.createElement('aside');g.className='gaveta';g.id='gaveta';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label',titulo);
  g.innerHTML='<div class="gaveta-cab"><div><h3>'+titulo+'</h3><p>'+sub+'</p></div><button class="fechar" id="fechar" aria-label="Fechar">'+ic('x')+'</button></div>'+
   '<div class="gaveta-corpo">'+(linhas.length?linhas.map(function(x){return '<div class="g-lin"><div style="min-width:0"><div class="pg">'+esc(x.p)+'</div><div class="nt">'+esc(x.l.join(', '))+'</div></div>'+'<div class="din">'+R(x.v)+'</div>'+'<div class="nt" style="grid-column:1 / -1">'+status(x)+'</div></div>'}).join(''):'<div class="nada">Nada neste período.</div>')+'</div>'+
   '<div class="gaveta-pe">Mostrando '+linhas.length+' de '+tot+'. Lista de exemplo.</div>';
  document.body.appendChild(v);document.body.appendChild(g);
  if(window.lucide)lucide.createIcons();
  requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape')fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);g.querySelector('#fechar').addEventListener('click',fechar);g.querySelector('#fechar').focus();
}
function aviso(msg){
  var t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('on');clearTimeout(aviso.h);aviso.h=setTimeout(function(){t.classList.remove('on')},2600);
}
document.addEventListener('click',function(e){
  if(!el||!el.isConnected||!el.contains(e.target))return;
  var t=e.target;
  var b=t.closest('[data-filtro]');if(b){filtro=b.dataset.filtro;render();return}
  b=t.closest('[data-lista]');if(b){gaveta(b.dataset.lista);return}
  b=t.closest('#btn-falta');if(b){var f=document.getElementById('falta'),abre=f.hidden;f.hidden=!abre;b.setAttribute('aria-expanded',abre);return}
  b=t.closest('[data-acao]');if(b){aviso('Exemplo: "'+b.dataset.acao+'" para '+b.dataset.pg+'. Ainda sem função.')}
});
document.addEventListener('change',function(e){if(e.target.id==='sel-periodo'){periodo=e.target.value;render()}});
return {render:render};
})();
