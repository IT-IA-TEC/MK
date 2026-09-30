/* Pequenos componentes comuns: aviso, janela de confirmação e menu suspenso. */
window.MKUI=(function(){
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function icones(){if(window.lucide)lucide.createIcons()}
function toast(msg){
  var t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},2800);
}
function modal(o){
  var ant=document.activeElement;
  var v=document.createElement('div');v.className='veu';v.style.zIndex=70;
  var m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',o.titulo);
  m.innerHTML='<div class="modal-cab"><h3>'+esc(o.titulo)+'</h3><button class="fechar" type="button" aria-label="Fechar">'+ic('x')+'</button></div><div class="modal-corpo">'+o.html+'</div>'+
    '<div class="modal-pe"><button type="button" class="btn sec m-cancel" style="width:auto;padding:0 16px">'+(o.cancel||'Cancelar')+'</button><button type="button" class="btn m-ok'+(o.perigo?' esc':'')+'" style="width:auto;padding:0 18px">'+(o.ok||'Confirmar')+'</button></div>';
  document.body.appendChild(v);document.body.appendChild(m);icones();
  requestAnimationFrame(function(){v.classList.add('aberto');m.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');m.classList.remove('aberto');document.removeEventListener('keydown',tecla,true);setTimeout(function(){v.remove();m.remove();if(ant&&ant.focus)ant.focus()},200)}
  function tecla(e){if(e.key==='Escape'){e.stopPropagation();fechar()}}
  document.addEventListener('keydown',tecla,true);
  v.addEventListener('click',fechar);m.querySelector('.fechar').addEventListener('click',fechar);m.querySelector('.m-cancel').addEventListener('click',fechar);
  m.querySelector('.m-ok').addEventListener('click',function(){if(!o.onOk||o.onOk(m)!==false)fechar()});
  var f=m.querySelector('input,textarea,select');(f||m.querySelector('.m-ok')).focus();
  return m;
}
function menu(ancora,itens,escolher){
  fechar();
  var m=document.createElement('div');m.className='pop';m.id='pop-ativo';m.setAttribute('role','menu');
  m.innerHTML=itens.map(function(i){return i.sep?'<div class="pop-sep"></div>':'<button role="menuitem" class="pop-i'+(i.perigo?' perigo':'')+'" data-id="'+i.id+'">'+(i.icone?ic(i.icone):'')+'<span>'+esc(i.t)+'</span>'+(i.marca?'<b class="pop-ok">'+ic('check')+'</b>':'')+'</button>'}).join('');
  document.body.appendChild(m);icones();
  var r=ancora.getBoundingClientRect(),w=m.offsetWidth,h=m.offsetHeight;
  var x=Math.min(Math.max(8,r.right-w),window.innerWidth-w-8),y=r.bottom+4;if(y+h>window.innerHeight-8)y=Math.max(8,r.top-h-4);
  m.style.left=x+'px';m.style.top=y+'px';
  var primeiro=m.querySelector('.pop-i');if(primeiro)primeiro.focus();
  function fora(e){if(!m.contains(e.target)&&!ancora.contains(e.target))fechar()}
  function tecla(e){if(e.key==='Escape'){fechar();if(ancora.focus)ancora.focus()}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var l=[].slice.call(m.querySelectorAll('.pop-i')),i=l.indexOf(document.activeElement);l[(i+(e.key==='ArrowDown'?1:-1)+l.length)%l.length].focus()}}
  m.addEventListener('click',function(e){var b=e.target.closest('.pop-i');if(b){var id=b.dataset.id;fechar();escolher(id)}});
  setTimeout(function(){document.addEventListener('mousedown',fora);document.addEventListener('keydown',tecla)},0);
  m._fim=function(){document.removeEventListener('mousedown',fora);document.removeEventListener('keydown',tecla)};
  function fechar(){var a=document.getElementById('pop-ativo');if(a){a._fim&&a._fim();a.remove()}}
  return fechar;
}
return {toast:toast,modal:modal,menu:menu,esc:esc,ic:ic,icones:icones};
})();
