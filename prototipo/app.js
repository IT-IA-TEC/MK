(function(){
var D=window.MK_DADOS,$=function(s){return document.querySelector(s)};
var app=$('#app'),ativo='dashboard';
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function icones(){if(window.lucide)lucide.createIcons()}
function guardar(v){try{localStorage.setItem('mk-menu-recolhido',v?'1':'0')}catch(e){}}
function lembrado(){try{return localStorage.getItem('mk-menu-recolhido')==='1'}catch(e){return false}}
function menu(){
  var rec=app.classList.contains('recolhido');
  $('#menu').innerHTML=
   '<div class="menu-topo"><div class="marca"><div class="marca-logo">M</div><div class="marca-nome">IT<span>.</span>MK</div></div>'+
   '<button class="btn-recolher" id="btn-recolher" aria-label="'+(rec?'Expandir menu':'Recolher menu')+'" title="'+(rec?'Expandir menu':'Recolher menu')+'">'+ic('chevrons-left')+'</button></div>'+
   '<div class="menu-lista">'+D.menu.map(function(i){
     return '<button class="item'+(i.id===ativo?' ativo':'')+'" data-id="'+i.id+'" title="'+i.nome+'" aria-label="'+i.nome+'"'+(i.id===ativo?' aria-current="page"':'')+'>'+ic(i.icone)+'<span>'+i.nome+'</span></button>'}).join('')+'</div>';
  icones();
}
function mostrar(){var c=$('#conteudo');if(ativo==='dashboard')MKDashboard.render(c);else if(ativo==='pagadores')MKPagadores.render(c);else if(ativo==='conversas')MKConversas.render(c);else if(ativo==='fechamento')MKFechamento.render(c);else if(ativo==='recebimentos')MKRecebimentos.render(c);else if(ativo==='inadimplencia')MKInadimplencia.render(c);else if(ativo==='configuracoes')MKConfiguracoes.render(c);else c.innerHTML='';window.scrollTo(0,0)}
function alternar(){
  var rec=app.classList.toggle('recolhido');guardar(rec);menu();
}
document.addEventListener('click',function(e){
  if(e.target.closest('#btn-recolher')){alternar();return}
  var b=e.target.closest('.item');
  if(b&&b.dataset.id!==ativo){ativo=b.dataset.id;menu();mostrar()}
});
var senha=$('#senha'),ver=$('#ver-senha');
ver.addEventListener('click',function(){var m=senha.type==='password';senha.type=m?'text':'password';ver.innerHTML=ic(m?'eye-off':'eye');icones()});
$('#form-login').addEventListener('submit',function(e){
  e.preventDefault();$('#login').hidden=true;app.hidden=false;
  if(lembrado()||window.matchMedia('(max-width:1100px)').matches&&!window.matchMedia('(max-width:720px)').matches)app.classList.add('recolhido');
  menu();mostrar();
});
icones();
})();
