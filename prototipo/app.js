(function(){
var D=window.MK_DADOS,$=function(s){return document.querySelector(s)};
var cor={ML:["--ml-t","--ml-f"],SH:["--sh-t","--sh-f"],AM:["--am-t","--am-f"],MG:["--mg-t","--mg-f"]};
var tipo={atencao:["--atencao-t","--atencao-f"],curso:["--curso-t","--curso-f"],travado:["--travado-t","--travado-f"]};
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function menu(id){
  $('#menu').innerHTML='<div class="marca"><div class="marca-logo">M</div><div class="marca-nome">IT<span>.</span>MK</div></div>'+
  D.menu.map(function(g){return '<div class="grupo"><div class="grupo-titulo">'+g.grupo+'</div>'+g.itens.map(function(i){
    return '<button class="item'+(i.id===id?' ativo':'')+'" data-id="'+i.id+'" aria-label="'+i.nome+'">'+ic(i.icone)+'<span>'+i.nome+'</span>'+(i.cnt?'<b class="contador">'+i.cnt+'</b>':'')+'</button>'}).join('')+'</div>'}).join('');
}
function painel(){
  return '<div><h1>Bom dia, Marina</h1><p class="sub">Pedidos para hoje nos 4 canais.</p></div>'+
  '<div class="grade"><div class="heroi"><small><span class="ponto"></span>Vendido hoje, nos 4 canais</small><div class="num">'+D.vendidoHoje+'</div><span class="sobe">'+ic('arrow-up-right')+D.variacao+'</span> <span style="color:var(--apoio-claro);font-size:13.5px;margin-left:6px">acima de ontem</span></div>'+
  '<div class="cartao canais"><h2>Participação por canal</h2>'+D.canais.map(function(c){var k=cor[c.sigla];return '<div class="barra-linha"><span>'+c.nome+'</span><div class="barra"><i style="width:'+c.pct+'%"></i></div><b>'+c.pct+'%</b></div>'}).join('')+'</div></div>'+
  '<div class="kpis">'+D.kpis.map(function(k){return '<div class="cartao kpi"><small>'+k.t+'</small><div class="num">'+k.n+'</div><div class="nota">'+k.nota+'</div></div>'}).join('')+'</div>'+
  '<div class="cartao"><div class="lista-topo"><h2>Pedidos para hoje</h2><span class="cnt">62 · 4 canais</span></div>'+
  D.pedidos.map(function(p){var c=cor[p.canal],t=tipo[p.tipo];return '<div class="pedido"><span class="chip-canal" style="color:var('+c[0]+');background:var('+c[1]+')">'+p.canal+'</span><div style="min-width:0"><div class="tit">'+p.titulo+'</div><div class="cod">'+p.cod+'</div></div><div class="col-etapa"><span class="etapa" style="color:var('+t[0]+');background:var('+t[1]+')">'+p.etapa+'</span><span class="prazo">'+p.prazo+'</span></div><div class="valor">'+p.valor+'</div></div>'}).join('')+
  '<div class="rodape-lista">58 outros pedidos em prazo normal · total da fila R$ 18.904,20</div></div>'+
  '<div class="aviso-proto">Dados de exemplo. Servem só para desenhar a tela.</div>';
}
function vazio(nome){return '<div class="cartao vazio">'+ic('hammer')+'<h2>'+nome+'</h2><p>Esta tela ainda não foi desenhada. Me diga o que ela precisa ter e eu monto aqui.</p></div>'}
function ir(id){
  var nome=''; D.menu.forEach(function(g){g.itens.forEach(function(i){if(i.id===id)nome=i.nome})});
  menu(id); $('#tela').innerHTML=id==='painel'?painel():'<div><h1>'+nome+'</h1></div>'+vazio(nome);
  if(window.lucide)lucide.createIcons();
  try{history.replaceState(null,'','#'+id)}catch(e){}
}
document.addEventListener('click',function(e){var b=e.target.closest('.item');if(b)ir(b.dataset.id)});
var h=(location.hash||'').slice(1);ir(h||'painel');
})();
