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
   '<button class="btn" id="novo" style="width:auto;height:36px;padding:0 16px">+ Novo pagador</button></div>'+
   MKFiltro.html({dentro:'<label class="sel-p"><span>Situação da loja</span><select class="sel" id="pag-loja"><option value="">Todas</option><option value="ativa">Ativa</option><option value="bloqueada">Bloqueada</option><option value="inativa">Inativa</option></select></label><label class="sel-p"><span>Situação financeira</span><select class="sel" id="pag-fin"><option value="">Todas</option><option value="dia">Em dia</option><option value="avencer">A vencer</option><option value="atraso">Em atraso</option><option value="acordo">Em acordo</option></select></label><label class="sel-p"><span>Situação do robô</span><select class="sel" id="pag-robo"><option value="">Todas</option><option>Atende</option><option>Não atende</option><option>Em teste</option></select></label>'})+
   '<div class="tab-cartao"><table class="tab-pag"><colgroup><col class="k1"><col class="k2"><col class="k3"></colgroup><thead><tr><th>Responsável</th><th>WhatsApp</th><th>Lojas</th></tr></thead><tbody id="pag-corpo"></tbody></table></div>'+
   '<div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  document.getElementById('pag-loja').value=fLoja;document.getElementById('pag-fin').value=fFin;document.getElementById('pag-robo').value=fRobo;
  MKFiltro.ao(pintar);pintar();
}
/* cadastro */
function campo(id,rot,tipo,ph,extra){return '<div class="campo"><label for="'+id+'">'+rot+' <i class="obr">*</i></label>'+(tipo==='select'?extra:'<input id="'+id+'" type="'+tipo+'" placeholder="'+ph+'" autocomplete="off">')+'<small class="erro" id="'+id+'-e" hidden></small></div>'}
var PLATS=['Shein','Mercado Livre','Shopee','Kwai'];
function blocoLoja(i){
  return '<div class="f-bloco" data-loja="'+i+'"><div class="f-bloco-cab"><b>Loja '+(i+1)+'</b>'+(i>0?'<button type="button" class="link-btn rem" data-rem="'+i+'">Remover</button>':'')+'</div>'+
   '<div class="f-grade">'+campo('ln'+i,'Nome da loja','text','Nome da loja')+campo('lg'+i,'GS','text','Somente números')+
   campo('lp'+i,'Plataforma','select','','<select class="sel" id="lp'+i+'"><option value="">Selecione</option>'+PLATS.map(function(p){return '<option>'+p+'</option>'}).join('')+'</select>')+campo('ld'+i,'Data de início','date','')+'</div></div>';
}
function novo(){
  var ant=document.activeElement,n=1;
  var v=document.createElement('div');v.className='veu';
  var g=document.createElement('aside');g.className='gaveta larga';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-label','Novo pagador');
  g.innerHTML='<form id="f-novo" novalidate style="display:flex;flex-direction:column;min-height:0;flex:1"><div class="gaveta-cab"><div><h3>Novo pagador</h3><p>Todos os campos são obrigatórios.</p></div><button type="button" class="fechar" aria-label="Fechar">'+ic('x')+'</button></div>'+
   '<div class="gaveta-corpo" style="padding:16px 20px"><div class="f-grade">'+campo('pn','Nome do responsável','text','Nome completo')+campo('pw','WhatsApp','tel','(00) 00000-0000')+'</div>'+
   '<h4 class="f-tit">Lojas</h4><div id="f-lojas">'+blocoLoja(0)+'</div><button type="button" class="btn sec" id="mais-loja" style="width:auto;padding:0 14px;margin-top:8px">+ Adicionar outra loja</button></div>'+
   '<div class="gaveta-pe f-pe"><button type="button" class="btn sec cancelar" style="width:auto;padding:0 16px">Cancelar</button><button type="submit" class="btn" style="width:auto;padding:0 18px">Salvar pagador</button></div></form>';
  document.body.appendChild(v);document.body.appendChild(g);
  if(window.lucide)lucide.createIcons();
  requestAnimationFrame(function(){v.classList.add('aberto');g.classList.add('aberto')});
  function fechar(){v.classList.remove('aberto');g.classList.remove('aberto');document.removeEventListener('keydown',tecla);setTimeout(function(){v.remove();g.remove();if(ant&&ant.focus)ant.focus()},240)}
  function tecla(e){if(e.key==='Escape')fechar()}
  document.addEventListener('keydown',tecla);v.addEventListener('click',fechar);
  g.querySelector('.fechar').addEventListener('click',fechar);g.querySelector('.cancelar').addEventListener('click',fechar);
  g.querySelector('#pn').focus();
  function erro(id,msg){var e=g.querySelector('#'+id+'-e'),c=g.querySelector('#'+id);e.textContent=msg||'';e.hidden=!msg;if(c)c.classList.toggle('inv',!!msg);return !!msg}
  g.addEventListener('click',function(e){
    if(e.target.closest('#mais-loja')){g.querySelector('#f-lojas').insertAdjacentHTML('beforeend',blocoLoja(n));n++;g.querySelector('#ln'+(n-1)).focus();return}
    var r=e.target.closest('[data-rem]');if(r){var b=g.querySelector('[data-loja="'+r.dataset.rem+'"]');b.remove()}
  });
  g.querySelector('#f-novo').addEventListener('submit',function(e){
    e.preventDefault();var ruim=false,primeiro=null;
    function ck(id,msg,ok){var m=erro(id,ok?'':msg);if(m&&!primeiro)primeiro=id;ruim=ruim||m}
    ck('pn','Informe o nome do responsável.',g.querySelector('#pn').value.trim().length>2);
    ck('pw','Informe o WhatsApp com DDD.',nums(g.querySelector('#pw').value).length>=10);
    var lojas=[];
    g.querySelectorAll('[data-loja]').forEach(function(b){var i=b.dataset.loja;
      var nome=g.querySelector('#ln'+i).value.trim(),gs=nums(g.querySelector('#lg'+i).value),pl=g.querySelector('#lp'+i).value,dt=g.querySelector('#ld'+i).value;
      ck('ln'+i,'Informe o nome da loja.',nome.length>1);ck('lg'+i,'Informe o GS, somente números.',gs.length>=8);ck('lp'+i,'Escolha a plataforma.',!!pl);ck('ld'+i,'Informe a data de início.',!!dt);
      var d=dt.split('-');lojas.push({n:nome.toUpperCase(),gs:gs,st:'ativa',plat:pl,ini:d.length===3?d[2]+'/'+d[1]+'/'+d[0]:''});
    });
    if(ruim){var f=g.querySelector('#'+primeiro);if(f)f.focus();return}
    DADOS.unshift({id:Date.now(),nome:g.querySelector('#pn').value.trim().toUpperCase(),fone:g.querySelector('#pw').value.trim(),fin:'dia',lojas:lojas});
    fechar();MKFiltro.limpar();fLoja='';fFin='';fRobo='';render();aviso('Pagador cadastrado.');
  });
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
