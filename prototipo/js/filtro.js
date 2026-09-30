/* Filtro único, igual em Pagadores e Lojas, Conexões e Marketplaces › Lojas.
   Busca (cliente, loja, GS), plataforma, situação da conexão, situação da análise e responsável. */
window.MKFiltro=(function(){
var S={q:'',plat:'',con:'',ana:'',resp:''},cb=null;
var PLATS=['Shein','Mercado Livre','Shopee','Kwai'],CONS=['Sem conexão','Aguardando autorização','Conectada','Com erro','Vencida'],ANAS=['Sem análise','Em dia','Desatualizada'];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function so(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function api(){return window.MKMarketplaces&&window.MKMarketplaces.api()}
function opc(lista,v,todas){return '<option value="">'+todas+'</option>'+lista.map(function(x){var val=x.v!==undefined?x.v:x,t=x.t!==undefined?x.t:x;return '<option value="'+esc(val)+'"'+(String(val)===String(v)?' selected':'')+'>'+esc(t)+'</option>'}).join('')}
/* opts.semPlat: a plataforma já é escolhida nas subabas da tela */
function html(opts){
  opts=opts||{};var resp=(window.MK_PAG||[]).map(function(p){return {v:p.id,t:p.nome}});
  return '<div class="fe-barra flt" data-flt><div class="rc-filtros">'+
   '<label class="busca-p mk-busca"><span class="sr">Buscar</span><i data-lucide="search"></i><input id="flt-q" type="search" placeholder="Buscar por cliente, loja ou GS" value="'+esc(S.q)+'"></label>'+
   (opts.semPlat?'':'<label class="sel-p"><span>Plataforma</span><select class="sel" id="flt-plat">'+opc(PLATS,S.plat,'Todas')+'</select></label>')+
   '<label class="sel-p"><span>Situação da conexão</span><select class="sel" id="flt-con">'+opc(CONS,S.con,'Todas')+'</select></label>'+
   '<label class="sel-p"><span>Situação da análise</span><select class="sel" id="flt-ana">'+opc(ANAS,S.ana,'Todas')+'</select></label>'+
   '<label class="sel-p"><span>Responsável</span><select class="sel" id="flt-resp">'+opc(resp,S.resp,'Todos')+'</select></label>'+
   (opts.dentro||'')+'</div>'+(opts.extra||'')+'</div>';
}
/* x = {p: pagador, l: loja, plat?, con?} */
function passa(x){
  var a=api(),l=x.l,p=x.p,plat=x.plat||l.plat;
  if(S.plat&&plat!==S.plat)return false;
  if(S.resp&&String(p.id)!==String(S.resp))return false;
  if(S.con&&(x.con||(a?a.sitLoja(l):''))!==S.con)return false;
  if(S.ana&&(a?a.selo(l.gs).t:'')!==S.ana)return false;
  var t=so(S.q.trim()),n=S.q.replace(/\D/g,'');
  if(t&&so(l.n).indexOf(t)<0&&so(p.nome).indexOf(t)<0&&!(n&&(l.gs.indexOf(n)>-1||String(p.fone||'').replace(/\D/g,'').indexOf(n)>-1)))return false;
  return true;
}
function ativo(){return !!(S.q||S.plat||S.con||S.ana||S.resp)}
function set(o){for(var k in o)S[k]=o[k]}
function limpar(keep){var p=S.plat;S={q:'',plat:keep?p:'',con:'',ana:'',resp:''}}
function ao(fn){cb=fn}
function mudou(foco,pos){
  if(!cb)return;cb();
  if(foco){var n=document.getElementById(foco);if(n){n.focus();if(pos!==undefined&&n.setSelectionRange)try{n.setSelectionRange(pos,pos)}catch(e){}}}
}
var MAPA={'flt-q':'q','flt-plat':'plat','flt-con':'con','flt-ana':'ana','flt-resp':'resp'};
document.addEventListener('input',function(e){var t=e.target;if(t.id==='flt-q'){S.q=t.value;mudou('flt-q',t.selectionStart)}});
document.addEventListener('change',function(e){var t=e.target;if(t.id&&t.id!=='flt-q'&&MAPA[t.id]){S[MAPA[t.id]]=t.value;mudou(t.id)}});
return {html:html,passa:passa,ativo:ativo,set:set,get:function(){return S},limpar:limpar,ao:ao,PLATS:PLATS};
})();
