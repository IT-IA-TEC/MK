/* Tela Pagadores e Lojas. Dados de exemplo em window.MK_PAG. */
window.MKPagadores=(function(){
var DADOS=window.MK_PAG,el=null,fLoja='',fFin='',fRobo='';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function so(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function nums(s){return s.replace(/\D/g,'')}
function filtrar(){
  var F=MKFiltro,r=[];
  DADOS.forEach(function(d){
    if(fFin&&d.fin!==fFin)return;
    if(fRobo&&(window.MKRobo?MKRobo.api().situacao(d.id).st:'Atende')!==fRobo)return;
    var ls=d.lojas.filter(function(l){return (!fLoja||l.st===fLoja)&&F.passa({p:d,l:l})});
    if(ls.length)r.push({p:d,ls:ls});
  });
  return r;
}
function selo(st){return st==='ativa'?'':'<span class="selo '+st+'">'+(st==='bloqueada'?'Bloqueada':'Inativa')+'</span>'}
function linhas(lista){
  if(!lista.length)return '<tr><td colspan="3" class="vazio-t"><b>Nenhum pagador encontrado.</b><br>Troque a busca ou limpe os filtros.<div><button class="btn sec" id="limpar" style="width:auto;margin-top:12px">Limpar filtros</button></div></td></tr>';
  return lista.map(function(it){var p=it.p;
    return '<tr class="pag-lin" tabindex="0" data-id="'+p.id+'"><td class="c-resp" data-rot="Responsável">'+esc(p.nome)+(window.MKRobo&&MKRobo.api().situacao(p.id).st==='Não atende'?'<div><span class="selo inativa rb-selo" title="'+esc(MKRobo.api().situacao(p.id).motivo)+'">Robô não atende</span></div>':'')+'</td>'+
     '<td class="c-fone" data-rot="WhatsApp"><span class="fone">'+esc(p.fone)+'</span><button class="btn-zap" data-zap="'+p.id+'" aria-label="Abrir conversa de '+esc(p.nome)+'" title="Abrir conversa">'+ic('message-circle')+'</button></td>'+
     '<td class="c-lojas" data-rot="Lojas">'+it.ls.map(function(l){var A=MKMarketplaces.api();return '<div class="loja"><div class="loja-n">'+A.logoI(l.plat)+'<span>'+esc(l.n)+'</span>'+selo(l.st)+'<span class="loja-an">'+A.seloHtml(l.gs)+'</span></div><div class="loja-gs">'+esc(l.gs)+' · '+esc(l.plat)+'</div></div>'}).join('')+'</td></tr>';
  }).join('');
}
function contagem(lista){var l=lista.reduce(function(a,it){return a+it.ls.length},0);return lista.length+(lista.length===1?' pagador, ':' pagadores, ')+l+(l===1?' loja':' lojas')}
function pintar(){
  var lista=filtrar();
  document.getElementById('pag-corpo').innerHTML=linhas(lista);
  document.getElementById('pag-cont').textContent=contagem(lista);
  if(window.lucide)lucide.createIcons();
}
function render(alvo){
  if(alvo)el=alvo;
  el.innerHTML='<div class="dash"><div class="pag-topo"><div><h1>Pagadores e Lojas</h1><p class="sub" id="pag-cont">'+contagem(filtrar())+'</p></div>'+
   '<button class="btn" id="novo" style="width:auto;height:36px;padding:0 16px">Cadastrar na ficha do BL</button></div>'+
   MKFiltro.html({dentro:'<label class="sel-p"><span>Situação da loja</span><select class="sel" id="pag-loja"><option value="">Todas</option><option value="ativa">Ativa</option><option value="bloqueada">Bloqueada</option><option value="inativa">Inativa</option></select></label><label class="sel-p"><span>Situação financeira</span><select class="sel" id="pag-fin"><option value="">Todas</option><option value="dia">Em dia</option><option value="avencer">A vencer</option><option value="atraso">Em atraso</option><option value="acordo">Em acordo</option></select></label><label class="sel-p"><span>Situação do robô</span><select class="sel" id="pag-robo"><option value="">Todas</option><option>Atende</option><option>Não atende</option><option>Em teste</option></select></label>'})+
   '<div class="tab-cartao"><table class="tab-pag"><colgroup><col class="k1"><col class="k2"><col class="k3"></colgroup><thead><tr><th>Responsável</th><th>WhatsApp</th><th>Lojas</th></tr></thead><tbody id="pag-corpo"></tbody></table></div>'+
   '<div class="aviso">A carteira vem da ficha do BL e mostra só os clientes com vínculo da 40%. Dados de exemplo, só para desenhar a tela.</div></div>';
  document.getElementById('pag-loja').value=fLoja;document.getElementById('pag-fin').value=fFin;document.getElementById('pag-robo').value=fRobo;
  MKFiltro.ao(pintar);pintar();
}
/* cadastro */
function campo(id,rot,tipo,ph,extra){return '<div class="campo"><label for="'+id+'">'+rot+' <i class="obr">*</i></label>'+(tipo==='select'?extra:'<input id="'+id+'" type="'+tipo+'" placeholder="'+ph+'" autocomplete="off">')+'<small class="erro" id="'+id+'-e" hidden></small></div>'}
var PLATS=['Shein','Mercado Livre','Shopee','Kwai'];
function blocoLoja(i){
  return '<div class="f-bloco" data-loja="'+i+'"><div class="f-bloco-cab"><b>Loja '+(i+1)+'</b>'+(i>0?'<button type="button" class="link-btn rem" data-rem="'+i+'">Remover</button>':'')+'</div>'+
   '<div class="f-grade">'+campo('ln'+i,'Nome da loja','text','Nome da loja')+campo('lg'+i,'Código da loja na plataforma (GS na Shein)','text','Ex.: GS2405891')+
   campo('lp'+i,'Plataforma','select','','<select class="sel" id="lp'+i+'"><option value="">Selecione</option>'+PLATS.map(function(p){return '<option>'+p+'</option>'}).join('')+'</select>')+campo('ld'+i,'Data de início','date','')+'<div class="campo"><label for="lc'+i+'">CNPJ da loja (só informativo)</label><input id="lc'+i+'" type="text" placeholder="Opcional" autocomplete="off"><small class="erro" id="lc'+i+'-e" hidden></small></div></div></div>';
}
function novo(){
  var ant=document.activeElement;
  var v=document.createElement('div');v.className='veu';
  var g=document.createElement('aside');g.className='gaveta';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Cadastrar na ficha do BL');
  g.innerHTML='<div class="gaveta-cab"><div><h3>Cadastrar na ficha do BL</h3><p>O IT.MK só lê a carteira. O cadastro é feito no BL.</p></div><button type="button" class="fechar" aria-label="Fechar"><i data-lucide="x"></i></button></div>'+
   '<div class="gaveta-corpo" style="padding:16px 20px"><p>Para um cliente aparecer aqui, cadastre a ficha dele no sistema do BL (pessoa com CPF e lojas por plataforma e código) e marque o vínculo com a <b>40%</b>.</p><p style="margin-top:10px">Quando o vínculo for marcado, o cliente entra nesta lista sozinho.</p></div>'+
   '<div class="gaveta-pe f-pe"><button type="button" class="btn sec cancelar" style="width:auto;padding:0 16px">Fechar</button><button type="button" class="btn" id="abrir-bl" style="width:auto;padding:0 18px">Abrir a ficha no BL</button></div>';
  document.body.appendChild(v);document.body.appendChild(g);
  if(window.lucide)lucide.createIcons();
  requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},200)}
  function tecla(e){if(e.key==='Escape')fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);
  g.querySelector('.fechar').addEventListener('click',fechar);g.querySelector('.cancelar').addEventListener('click',fechar);
  g.querySelector('#abrir-bl').addEventListener('click',function(){fechar();aviso('No sistema final, este botão abre a ficha no BL.')});
  g.querySelector('#abrir-bl').focus();
}
function aviso(msg){var t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('on');clearTimeout(aviso.h);aviso.h=setTimeout(function(){t.classList.remove('on')},2600)}
document.addEventListener('change',function(e){if(e.target.id==='pag-loja'){fLoja=e.target.value;pintar()}if(e.target.id==='pag-fin'){fFin=e.target.value;pintar()}if(e.target.id==='pag-robo'){fRobo=e.target.value;pintar()}});
document.addEventListener('click',function(e){
  if(!el||!el.isConnected||!el.contains(e.target)&&el.dataset.modulo==='pagadores')return;
  if(e.target.closest('#novo')){novo();return}
  if(e.target.closest('#limpar')){MKFiltro.limpar();fLoja='';fFin='';fRobo='';render();return}
  var z=e.target.closest('[data-zap]');
  if(z){var p=DADOS.filter(function(x){return String(x.id)===z.dataset.zap})[0];if(window.MKConversas&&MKConversas.abrirPag)MKConversas.abrirPag(p.id);if(window.MKApp)MKApp.ir('conversas');return}
  var l=e.target.closest('.pag-lin');if(l)MKFicha.abrir(DADOS.filter(function(x){return String(x.id)===l.dataset.id})[0]);
});
document.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('pag-lin')){MKFicha.abrir(DADOS.filter(function(x){return String(x.id)===e.target.dataset.id})[0])}
});
return {render:render};
})();
