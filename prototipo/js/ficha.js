/* Ficha do pagador (gaveta). Será a mesma da coluna 3 da tela Conversas. */
window.MKFicha=(function(){
var FIN={dia:['Em dia','vd'],atraso:['Em atraso','gr'],acordo:['Em acordo','at']};
var ST={ativa:'Ativa',bloqueada:'Bloqueada',inativa:'Inativa'};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function R(v){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function fmtGS(g){return g.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5')}
function historico(p){
  var base=1800+p.id*730,meses=['Abr/2026','Mai/2026','Jun/2026','Jul/2026','Ago/2026','Set/2026'],out=[];
  meses.forEach(function(m,i){
    var v=Math.round(base*(1+((i*7+p.id)%5)/10)),st='Pago em dia';
    if(i===5)st=p.fin==='dia'?'Pago em dia':p.fin==='atraso'?'Vencido':'Em acordo';
    else if((i+p.id)%4===0)st='Pago com atraso';
    out.push([m,v*p.lojas.length,st]);
  });
  return out.reverse();
}
function pessoas(p){
  var primeiro=p.nome.split(' ')[0];
  return [[p.nome,'Responsável',p.fone],['Financeiro '+primeiro.charAt(0)+primeiro.slice(1).toLowerCase(),'Contato financeiro','(11) 3'+(100+p.id*7)+'-'+(4000+p.id*131)]];
}
function tempo(p){
  var e=[['30/09 · 08:12','Cobrança de setembro enviada por WhatsApp']];
  if(p.fin==='atraso')e.unshift(['30/09 · 09:40','Régua: etapa 2 iniciada, lembrete enviado'],['21/09 · 00:00','Cobrança venceu sem pagamento']);
  else if(p.fin==='acordo')e.unshift(['27/09 · 15:22','Parcela do acordo registrada'],['12/09 · 10:05','Acordo fechado em 4 parcelas']);
  else e.unshift(['18/09 · 11:30','Pagamento confirmado e comprovante conferido']);
  e.push(['02/09 · 14:18','Pagador respondeu pedindo segunda via'],['01/09 · 08:00','Cobrança de setembro gerada']);
  return e;
}
var REGRAS=[['Envio da cobrança','Dia 1 do mês, por WhatsApp'],['Vencimento','Dia 20'],['Lembrete antes do vencimento','3 dias antes'],['Cobrança em atraso','Etapas em 1, 5 e 10 dias após o vencimento'],['Bloqueio da loja','Depois de 15 dias de atraso']];
function abrir(p){
  var ant=document.activeElement,f=FIN[p.fin];
  var v=document.createElement('div');v.className='veu';
  var g=document.createElement('aside');g.className='gaveta larga';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Ficha de '+p.nome);
  g.innerHTML='<div class="gaveta-cab"><div style="min-width:0"><h3>'+esc(p.nome)+'</h3><p>'+esc(p.fone)+' · <span class="atraso '+f[1]+'">'+f[0]+'</span></p></div><button class="fechar" aria-label="Fechar">'+ic('x')+'</button></div>'+
  '<div class="gaveta-corpo">'+
   '<section class="f-sec"><h4>Lojas <span>'+p.lojas.length+'</span></h4>'+p.lojas.map(function(l){return '<div class="f-lin"><div style="min-width:0"><div class="pg">'+esc(l.n)+'</div><div class="nt mono">'+esc(l.gs)+'</div></div><div class="f-dir"><span class="nt">'+esc(l.plat)+' · desde '+esc(l.ini)+'</span><span class="selo '+l.st+'">'+ST[l.st]+'</span></div></div>'}).join('')+'</section>'+
   '<section class="f-sec"><h4>Histórico financeiro</h4>'+historico(p).map(function(h){var cl=h[2]==='Vencido'?'gr':(h[2]==='Pago com atraso'||h[2]==='Em acordo')?'at':'vd';return '<div class="f-lin"><div class="pg">'+h[0]+'</div><div class="f-dir"><b class="din">'+R(h[1])+'</b><span class="atraso '+cl+'">'+h[2]+'</span></div></div>'}).join('')+'</section>'+
   '<section class="f-sec"><h4>Regras de cobrança</h4>'+REGRAS.map(function(r){return '<div class="f-lin"><div class="nt">'+r[0]+'</div><div class="pg">'+r[1]+'</div></div>'}).join('')+'</section>'+
   '<section class="f-sec"><h4>Pessoas ligadas</h4>'+pessoas(p).map(function(x){return '<div class="f-lin"><div style="min-width:0"><div class="pg">'+esc(x[0])+'</div><div class="nt">'+esc(x[1])+'</div></div><div class="nt mono">'+esc(x[2])+'</div></div>'}).join('')+'</section>'+
   '<section class="f-sec"><h4>Linha do tempo</h4><ol class="tempo">'+tempo(p).map(function(e){return '<li><span class="nt mono">'+e[0]+'</span><span>'+esc(e[1])+'</span></li>'}).join('')+'</ol></section>'+
  '</div><div class="gaveta-pe">Dados de exemplo.</div>';
  document.body.appendChild(v);document.body.appendChild(g);
  if(window.lucide)lucide.createIcons();
  requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape')fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);var x=g.querySelector('.fechar');x.addEventListener('click',fechar);x.focus();
}
return {abrir:abrir,fmtGS:fmtGS};
})();
