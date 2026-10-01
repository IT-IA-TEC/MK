/* Memória de cálculo: mostra de onde veio o valor de uma cobrança. Abre pelo Fechamento, pela ficha do pagador e por Conversas.
   A versão curta é o "Extrato da cobrança", o texto que o robô envia ao cliente. Dados de exemplo. */
window.MKMemoria=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic;
function R(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function pct(v){return String(v).replace('.',',')+'%'}
function d2(n){return ('0'+n).slice(-2)}
function pag(id){return window.MK_PAG.filter(function(p){return p.id===id})[0]}
var BASES={faturamento_total:'Faturamento total',produtos:'Valor dos produtos (sem frete)',pedidos:'Pedidos concluídos',notas:'Notas fiscais emitidas',manual:'Valor manual'};
/* usa os dados do Fechamento quando existirem; senão monta um cálculo coerente de exemplo */
function calculo(pid,gs){
  var p=pag(pid),l=p.lojas.filter(function(x){return !gs||x.gs===gs})[0]||p.lojas[0];
  if(window.MKFechamento&&MKFechamento.dadosCalculo){try{var d=MKFechamento.dadosCalculo(pid,l.gs);if(d)return d}catch(e){}}
  var i=p.lojas.indexOf(l),fat=Math.round((9000+(p.id*2310)+i*1700)*100)/100,aliq=[6,7.3,8.2][(p.id+i)%3],imp=Math.round(fat*aliq)/100,pc=40,v40=Math.round(imp*pc)/100;
  var h=new Date();
  return {competencia:'setembro/2026',loja:l.n,gs:l.gs,plataforma:l.plat,base:{id:'faturamento_total',nome:BASES.faturamento_total},fonte:l.plat==='Shein'||l.plat==='Kwai'?'Lançado à mão a partir do painel da plataforma':'API da plataforma',periodo:'01/09/2026 a 30/09/2026',faturado:fat,aliquota:aliq,origemAliquota:'Regime tributário do cadastro do pagador',imposto:imp,pct40:pc,valor40:v40,vencimento:'20/10/2026',conferidoPor:'Marina Costa',conferidoEm:'01/10/2026 09:40',
   versoes:[{v:2,quando:'01/10/2026 09:40',quem:'Marina Costa',motivo:'Conferência final do faturamento'},{v:1,quando:'30/09/2026 18:05',quem:'Sistema',motivo:'Cálculo inicial com os dados da plataforma'}]};
}
function todas(pid){return pag(pid).lojas.map(function(l){return calculo(pid,l.gs)})}
function extratoTexto(pid){
  var p=pag(pid),c=todas(pid),n=p.nome.split(' ')[0];n=n.charAt(0)+n.slice(1).toLowerCase();
  var tot=c.reduce(function(a,x){return a+x.valor40},0);
  return 'Extrato da cobrança · '+c[0].competencia+'\n'+c.map(function(x){return x.loja+': faturado '+R(x.faturado)+' · imposto '+R(x.imposto)+' × '+pct(x.pct40)+' = '+R(x.valor40)}).join('\n')+'\nTotal: '+R(tot)+' · vence em '+c[0].vencimento+'.\nQualquer dúvida, responda esta mensagem, '+n+'.';
}
function kv(a,b,cl){return '<div class="mm-kv'+(cl?' '+cl:'')+'"><span>'+a+'</span><b>'+b+'</b></div>'}
function bloco(c){
  return '<section class="mm-loja"><div class="mm-cab"><div style="min-width:0"><h4>'+esc(c.loja)+'</h4><div class="nt mono">'+esc(c.gs)+(c.plataforma?' · '+esc(c.plataforma):'')+'</div></div><span class="fs vd">Conferido</span></div>'+
   '<div class="mm-grade">'+
   kv('Competência',esc(c.competencia))+kv('Base usada',esc(c.base.nome))+kv('Fonte do dado',esc(c.fonte))+kv('Período da fonte',esc(c.periodo))+
   kv('Faturado na base',R(c.faturado))+kv('Alíquota',pct(c.aliquota))+kv('Origem da alíquota',esc(c.origemAliquota))+kv('Imposto',R(c.imposto))+
   kv('Percentual da 40%',pct(c.pct40))+kv('Valor da 40%',R(c.valor40),'mm-destaque')+kv('Vencimento',esc(c.vencimento))+kv('Conferido por',esc(c.conferidoPor)+' em '+esc(c.conferidoEm))+'</div>'+
   '<div class="mm-conta"><span class="nt">Conta</span><code>imposto '+R(c.imposto)+' × '+pct(c.pct40)+' = '+R(c.valor40)+'</code></div>'+
   '<details class="mm-vs"><summary>Versões do cálculo ('+c.versoes.length+')</summary>'+c.versoes.map(function(v){return '<div class="f-lin"><div style="min-width:0"><div class="pg">Versão '+v.v+(v===c.versoes[0]?' (atual)':'')+'</div><div class="nt">'+esc(v.motivo)+'</div></div><div class="nt mono">'+esc(v.quando)+' · '+esc(v.quem)+'</div></div>'}).join('')+'</details></section>';
}
function abrir(pid,gs){
  var p=pag(pid);if(!p)return;var L=gs?[calculo(pid,gs)]:todas(pid),tot=L.reduce(function(a,x){return a+x.valor40},0);
  var ant=document.activeElement,v=document.createElement('div');v.className='veu';var g=document.createElement('aside');g.className='gaveta larga mk-g';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Memória de cálculo de '+p.nome);
  g.innerHTML='<button class="fechar fechar-abs" aria-label="Fechar">'+ic('x')+'</button><div class="gaveta-corpo mm"><div class="f-topo"><h3>Memória de cálculo</h3><div class="f-topo-l"><span>'+esc(p.nome)+'</span><span class="mono">'+esc(L[0].competencia)+'</span></div></div>'+
   '<div class="mm-topo">'+kv('Total da cobrança',R(tot),'mm-destaque')+kv('Lojas',String(L.length))+kv('Vencimento',esc(L[0].vencimento))+'</div>'+
   '<div class="mm-corpo">'+L.map(bloco).join('')+
   '<section class="mm-ext"><div class="cx-cab">'+ic('file-text')+'<h3>Extrato da cobrança</h3><span class="nt" style="margin-left:auto">É o que o robô envia ao cliente</span></div><pre class="mm-txt" id="mm-txt">'+esc(extratoTexto(pid))+'</pre><div class="f-bts"><button class="btn sec" data-mm="copiar">Copiar texto</button></div></section></div></div>';
  document.body.appendChild(v);document.body.appendChild(g);U.icones();requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape'&&!document.querySelector('.modal'))fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);g.querySelector('.fechar').addEventListener('click',fechar);g.querySelector('.fechar').focus();
  g.addEventListener('click',function(e){if(e.target.closest('[data-mm="copiar"]')){try{navigator.clipboard.writeText(document.getElementById('mm-txt').textContent)}catch(x){}U.toast('Texto copiado.')}});
}
return {abrir:abrir,extratoTexto:extratoTexto,calculo:calculo};
})();
