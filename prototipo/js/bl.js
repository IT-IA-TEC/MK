/* Leitura do BL: estado "o BL não respondeu". Só no desenho; no sistema final vem da leitura real. */
window.MKBL=(function(){
var fora=false,ultima='02/10/2026 09:41',MODS={pagadores:1,marketplaces:1,fechamento:1};
var DEP='[data-cx="pedir"],[data-fe="novopix"],[data-fe="envsel"],[data-fe="envtodos"],[data-fe="reenviar"],[data-fe="enviarantes"],[data-fe="agendar"],[data-cf="rctestar"],[data-fa="loja"]';
function cont(){return document.getElementById('conteudo')}
function faixa(){
  var d=document.createElement('div');d.className='fe-aviso bl-faixa';d.setAttribute('role','alert');d.setAttribute('data-bl-faixa','');
  d.innerHTML='<span><b>O BL não respondeu.</b> Você está vendo os dados da última leitura boa ('+ultima+'). Pedidos ao BL (Pix, reconexão e teste) ficam bloqueados até ele voltar. O resto do IT.MK continua funcionando.</span><button class="btn sec" data-bl="tentar" style="width:auto;padding:0 14px;height:32px;flex:none">Tentar de novo</button>';
  return d}
function aplicar(){
  var c=cont();if(!c)return;
  var f=c.querySelector('[data-bl-faixa]'),quer=fora&&MODS[c.dataset.modulo];
  if(quer&&!f){var raiz=c.firstElementChild;if(raiz)raiz.insertBefore(faixa(),raiz.firstChild)}
  else if(!quer&&f)f.remove();
  document.querySelectorAll(DEP).forEach(function(b){
    if(fora){b.classList.add('bl-bloq');b.setAttribute('aria-disabled','true');if(!b.dataset.tit){b.dataset.tit=b.getAttribute('title')||'-';b.setAttribute('title','O BL não respondeu. Tente de novo mais tarde.')}}
    else if(b.classList.contains('bl-bloq')){b.classList.remove('bl-bloq');b.removeAttribute('aria-disabled');if(b.dataset.tit){if(b.dataset.tit==='-')b.removeAttribute('title');else b.setAttribute('title',b.dataset.tit);delete b.dataset.tit}}
  });
  document.querySelectorAll('[data-bl-st]').forEach(function(e){var t=fora?'Não respondeu':'Lendo normalmente';if(e.textContent!==t){e.textContent=t;e.className='fs '+(fora?'gr':'vd')}});
  document.querySelectorAll('[data-bl="simular"]').forEach(function(b){var t=fora?'Voltar ao normal':'Simular queda do BL (só no desenho)';if(b.textContent!==t)b.textContent=t});
}
function toast(m){if(window.MKUI&&MKUI.toast)MKUI.toast(m)}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-bl]');
  if(b){e.preventDefault();e.stopImmediatePropagation();
    if(b.dataset.bl==='simular'){fora=!fora;aplicar();toast(fora?'O BL parou de responder (simulação).':'O BL voltou a responder.')}
    else if(b.dataset.bl==='tentar'){toast('Tentando ler o BL... ainda sem resposta.')}
    return}
  if(fora){var d=e.target.closest(DEP);if(d){e.preventDefault();e.stopImmediatePropagation();toast('O BL não respondeu. Tente de novo mais tarde.')}}
},true);
var c0=cont();if(c0)new MutationObserver(function(){aplicar()}).observe(c0,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',aplicar);
return {aplicar:aplicar,fora:function(){return fora},card:function(){
  return '<div class="cx"><div class="cx-cab"><i data-lucide="database"></i><h3>Leitura do BL</h3></div><div class="cf-corpo"><div class="cf-sw"><div><b>Situação da leitura</b><small>O IT.MK só lê o BL. Última leitura boa: '+ultima+'.</small></div><span class="fs vd" data-bl-st>Lendo normalmente</span></div><div class="fe-aviso"><span>Quando o BL não responde, as telas de Pagadores, Marketplaces e Fechamento mostram o aviso e bloqueiam só os pedidos ao BL.</span></div><button class="btn sec" data-bl="simular" style="width:auto;padding:0 16px;align-self:flex-start">Simular queda do BL (só no desenho)</button></div></div>'}};
})();
