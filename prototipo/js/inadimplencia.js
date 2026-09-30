/* Tela Inadimplência e Acordos. O saldo vem de Recebimentos (cobrança menos pagamentos). Dados de exemplo. */
window.MKInadimplencia=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,F=window.MKFicha,PAGS=window.MK_PAG,el=null,pronto=false,EU='Marina';
var aba='atraso',q='',faixa='todas',ext={promessa:false,acordo:false,bloq:false,semcontato:false,n:15},fBl='todos',diaRel=0,nid=1;
var HOJE0=new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
var BL={},SAIDAS=[],BAIXAS=[],BXH=[],LOG=[];
function RC(){return window.MKRecebimentos.api()}
function R(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(s){return +(''+s).replace(/\./g,'').replace(',','.')||0}
function d2(n){return ('0'+n).slice(-2)}
function fd(d){return d2(d.getDate())+'/'+d2(d.getMonth()+1)+'/'+d.getFullYear()}
function pd(s){var a=s.split('/');return new Date(+a[2],+a[1]-1,+a[0])}
function iso(s){var a=s.split('-');return new Date(+a[0],+a[1]-1,+a[2])}
function off(n){var d=new Date(HOJE0);d.setDate(d.getDate()+n);return d}
function dias(s){return Math.round((HOJE0-pd(s))/86400000)}
function agora(){var d=new Date();return fd(d)+' '+d2(d.getHours())+':'+d2(d.getMinutes())}
function so(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function nums(s){return (''+s).replace(/\D/g,'')}
function pagador(id){return PAGS.filter(function(p){return p.id===id})[0]}
function pr(p){var w=p.nome.split(' ')[0];return w.charAt(0)+w.slice(1).toLowerCase()}
function chip(t,c){return '<span class="fs '+c+'">'+t+'</span>'}
function ev(p,t){F.evento(p,t)}
/* ---------- regras ---------- */
function acordoAtivo(p){return !!p.acordo&&p.acordo.estado!=='quebrado'&&p.acordo.parcelas.some(function(x){return x.st!=='paga'})}
function reguaPausada(p){return !!p.promessa||acordoAtivo(p)}
function atrasos(){
  var api=RC(),out=[];
  PAGS.forEach(function(p){
    var cs=api.DB.cobs.filter(function(c){return c.pid===p.id&&api.saldo(c)>.02&&dias(c.venc)>0});
    if(!cs.length)return;
    var lj={},rots=[],val=0,mx=0;
    cs.forEach(function(c){val+=api.saldo(c);mx=Math.max(mx,dias(c.venc));rots.push(c.rot);c.lojas.forEach(function(l){if(l.valor-l.pago>.004)lj[l.n]=1})});
    if(cs.every(function(c){return c.acordo}))lj={};
    var nomes=Object.keys(lj);if(!nomes.length)nomes=p.lojas.map(function(l){return l.n});
    out.push({p:p,cobs:cs,lojas:nomes,rots:rots,dias:mx,valor:Math.round(val*100)/100});
  });
  return out.sort(function(a,b){return b.dias-a.dias||b.valor-a.valor});
}
function sitDe(p){
  if(p.promessa)return ['Promessa até '+p.promessa.data,'ok'];
  if(acordoAtivo(p))return ['Em acordo','at'];
  var m={'sem retorno':['Sem retorno','cn'],'recusou':['Recusou','gr'],'número errado':['Número errado','gr'],'promessa reagendada':['Promessa reagendada','ok']};
  return m[p.sit]||['Sem retorno','cn'];
}
function contato(p){return p.contato!==undefined?p.contato:(p.id*7)%40}
function casa(t,p,extra){
  t=t.trim();if(!t)return true;var s=so(t),n=nums(t);
  if(so(p.nome).indexOf(s)>-1)return true;if(n&&nums(p.fone).indexOf(n)>-1)return true;
  if(n&&p.lojas.some(function(l){return l.gs.indexOf(n)>-1}))return true;
  return p.lojas.some(function(l){return so(l.n).indexOf(s)>-1})||(extra&&so(extra).indexOf(s)>-1);
}
function faixaDe(d){return d<=30?'1':d<=60?'2':d<=90?'3':'4'}
function bloqRows(){
  var rows=[],api=RC();
  PAGS.forEach(function(p){
    var em=atrasos().filter(function(a){return a.p===p})[0],quit=!em;
    p.lojas.forEach(function(l){
      var b=BL[l.gs],sit=null,desde='',motivo='',tipo=null;
      if(l.st==='bloqueada'){
        desde=b&&b.desde||'10/09/2026';motivo=b&&b.motivo||'Atraso de pagamento';
        if(b&&b.sit==='enviado ao grupo'&&b.tipo==='desbloqueio')sit='enviado ao grupo';
        else if(quit&&!(p.fin==='acordo'))sit='desbloqueio a pedir';
        else sit='confirmado';
      }else if(b&&b.sit==='enviado ao grupo'&&b.tipo==='bloqueio'){sit='enviado ao grupo';desde='—';motivo=b.motivo}
      else if(em&&em.dias>15&&l.st==='ativa'&&!reguaPausada(p)){sit='a pedir';desde='—';motivo='Passou do prazo da régua ('+em.dias+' dias de atraso)'}
      if(sit)rows.push({p:p,l:l,sit:sit,desde:desde,motivo:motivo,tipo:b&&b.tipo});
    });
  });
  return rows;
}
function contadores(){
  var a=atrasos(),val=a.reduce(function(s,x){return s+x.valor},0),ac=PAGS.filter(acordoAtivo).length,bl=bloqRows().filter(function(r){return r.sit==='confirmado'||r.sit==='desbloqueio a pedir'}).length,sd=SAIDAS.filter(function(s){return s.sit==='pendente'}).length;
  return {n:a.length,val:val,ac:ac,bl:bl,sd:sd};
}
/* ---------- dados iniciais ---------- */
function iniciar(){
  if(pronto)return;pronto=true;
  PAGS.forEach(function(p){if(p.fin==='acordo')F.acordo(p)});
  BL['55610150000109']={sit:'confirmado',tipo:'bloqueio',desde:'12/09/2026',motivo:'Atraso de 18 dias',hist:[{t:'12/09/2026 09:35',q:'Rafael',x:'Bloqueio pedido ao grupo'},{t:'12/09/2026 09:52',q:'Rafael',x:'Bloqueio confirmado pela plataforma'}]};
  BL['52736810000120']={sit:'confirmado',tipo:'bloqueio',desde:'29/09/2026',motivo:'Atraso de 24 dias',hist:[{t:'29/09/2026 09:35',q:'Rafael',x:'Bloqueio pedido ao grupo'},{t:'29/09/2026 09:52',q:'Rafael',x:'Bloqueio confirmado pela plataforma'}]};
  BL['42744784000102']={sit:'confirmado',tipo:'bloqueio',desde:'10/09/2026',motivo:'Atraso de 18 dias',hist:[{t:'10/09/2026 10:02',q:'Carlos',x:'Bloqueio pedido ao grupo'},{t:'10/09/2026 10:40',q:'Carlos',x:'Bloqueio confirmado pela plataforma'},{t:'30/09/2026 09:10',q:'Sistema',x:'Pagamento quitou a dívida, desbloqueio a pedir'}]};
  BL['48120356000131']={sit:'confirmado',tipo:'bloqueio',desde:'02/09/2026',motivo:'Acordo quebrado',hist:[{t:'02/09/2026 11:00',q:'Rafael',x:'Bloqueio confirmado'}]};
  BL['50941212000141']={sit:'confirmado',tipo:'bloqueio',desde:'15/08/2026',motivo:'Atraso de 45 dias',hist:[{t:'15/08/2026 10:00',q:'Juliana',x:'Bloqueio confirmado'}]};
  SAIDAS=[
    {id:nid++,pid:12,lojas:['AFC MODA FEMININA LTDA'],pedido:'28/09/2026',efetiva:'31/10/2026',sit:'pendente',hist:[{t:'28/09/2026 16:06',q:'Marina',x:'Pedido de saída registrado pela conversa'}]},
    {id:nid++,pid:8,lojas:['ASO MODAS LTDA'],pedido:'14/09/2026',efetiva:'30/09/2026',sit:'pendente',hist:[{t:'14/09/2026 10:20',q:'Juliana',x:'Pedido de saída registrado'}]},
    {id:nid++,pid:3,lojas:['46.843.469 ADRIANO PEREIRA DA SILVA'],pedido:'02/08/2026',efetiva:'31/08/2026',sit:'concluída',hist:[{t:'02/08/2026 11:00',q:'Carlos',x:'Pedido de saída registrado'},{t:'01/09/2026 09:00',q:'Carlos',x:'Saída concluída, em aberto quitado'}]},
    {id:nid++,pid:10,lojas:['ARP BOUTIQUE LTDA'],pedido:'10/08/2026',efetiva:'30/09/2026',sit:'cancelada',hist:[{t:'10/08/2026 15:30',q:'Marina',x:'Pedido de saída registrado'},{t:'25/08/2026 10:10',q:'Marina',x:'Pedido cancelado: pagador desistiu'}]}
  ];
  var ids=[[8,'03/2025',28400],[12,'11/2024',9200],[7,'05/2025',15100],[1,'02/2025',6730],[13,'08/2024',12480],[5,'04/2025',3890],[9,'12/2024',21050],[2,'06/2025',7600],[11,'01/2025',5310],[14,'09/2024',18240],[6,'07/2025',4420],[3,'10/2024',11960]];
  BAIXAS=ids.map(function(x){var p=pagador(x[0]),m=x[1].split('/'),v=new Date(+m[1],+m[0],20);return {id:nid++,pid:x[0],rot:x[1],venc:fd(v),valor:x[2],dias:Math.round((HOJE0-v)/86400000)}}).filter(function(x){return x.dias>365});
}
/* ---------- desenho ---------- */
function topo(){
  var k=contadores();
  var C=[['Pagadores em atraso',k.n,k.n?'pend':''],['Valor vencido',R(k.val),'pend'],['Acordos ativos',k.ac,''],['Lojas bloqueadas',k.bl,''],['Saídas em andamento',k.sd,'']];
  return '<div class="pag-topo"><div><h1>Inadimplência e Acordos</h1><p class="sub">Quem deve, há quanto tempo, o que já foi combinado e o que precisa de decisão.</p></div></div>'+
   '<div class="ia-cont">'+C.map(function(c){return '<div class="fe-k"><small>'+c[0]+'</small><b class="'+c[2]+'">'+c[1]+'</b></div>'}).join('')+'</div>'+
   '<div class="rc-barra"><label class="busca-p"><span class="sr">Buscar</span>'+ic('search')+'<input id="ia-q" type="search" placeholder="Buscar por nome, telefone, loja ou GS" value="'+esc(q)+'"></label></div>'+
   '<div class="rc-abas ia-abas" role="tablist">'+[['atraso','Em atraso',k.n],['acordos','Acordos',PAGS.filter(function(p){return p.acordo}).length],['bloqueios','Bloqueios',bloqRows().length],['saidas','Saídas',SAIDAS.length],['baixas','Baixas',BAIXAS.length],['relatorios','Relatórios',null]].map(function(a){return '<button role="tab" class="rc-aba" data-aba="'+a[0]+'" aria-selected="'+(aba===a[0])+'">'+a[1]+(a[2]!==null?' <b>'+a[2]+'</b>':'')+'</button>'}).join('')+'</div>';
}
function abaAtraso(){
  var todos=atrasos(),lista=todos.filter(function(a){return casa(q,a.p)});
  var cnt={todas:lista.length,'1':0,'2':0,'3':0,'4':0};lista.forEach(function(a){cnt[faixaDe(a.dias)]++});
  var l=lista.filter(function(a){
    if(faixa!=='todas'&&faixaDe(a.dias)!==faixa)return false;
    if(ext.promessa&&!a.p.promessa)return false;if(ext.acordo&&!acordoAtivo(a.p))return false;
    if(ext.bloq&&!a.p.lojas.some(function(x){return x.st==='bloqueada'}))return false;
    if(ext.semcontato&&contato(a.p)<ext.n)return false;return true;
  });
  var F1=[['todas','Todas'],['1','1 a 30 dias'],['2','31 a 60 dias'],['3','61 a 90 dias'],['4','Mais de 90 dias']];
  var X=[['promessa','Com promessa ativa'],['acordo','Com acordo'],['bloq','Bloqueado'],['semcontato','Sem contato há']];
  return '<div class="ia-filtros"><div class="fe-filtros">'+F1.map(function(x){return '<button class="chip-f" data-faixa="'+x[0]+'" aria-pressed="'+(faixa===x[0])+'">'+x[1]+' <b>'+cnt[x[0]]+'</b></button>'}).join('')+'</div>'+
   '<div class="fe-filtros ia-ext">'+X.map(function(x){return '<button class="chip-f" data-ext="'+x[0]+'" aria-pressed="'+ext[x[0]]+'">'+x[1]+(x[0]==='semcontato'?' '+ext.n+' dias':'')+'</button>'}).join('')+'<label class="ia-n"><span class="sr">Dias sem contato</span><input class="sel" id="ia-n" type="number" min="1" max="365" value="'+ext.n+'" title="Dias sem contato"></label></div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ia"><colgroup><col style="width:14%"><col style="width:13%"><col style="width:15%"><col style="width:9%"><col style="width:7%"><col style="width:11%"><col style="width:14%"><col style="width:17%"></colgroup><thead><tr><th>Responsável</th><th>WhatsApp</th><th>Lojas em atraso</th><th>Competências</th><th class="n">Dias de atraso</th><th class="n">Valor em aberto</th><th>Situação</th><th>Ação</th></tr></thead><tbody>'+
   (l.length?l.map(function(a){var s=sitDe(a.p),bl=a.p.lojas.some(function(x){return x.st==='bloqueada'});
     return '<tr><td data-rot="Responsável"><div class="lj-n">'+esc(a.p.nome)+'</div>'+(bl?'<span class="fs gr">Bloqueado</span>':'')+'</td><td data-rot="WhatsApp" class="mono nw">'+esc(a.p.fone)+'</td>'+
      '<td data-rot="Lojas em atraso" class="rp">'+esc(a.lojas.slice(0,2).join(' · '))+(a.lojas.length>2?' <span class="nt">+'+(a.lojas.length-2)+'</span>':'')+'</td><td data-rot="Competências" class="rp">'+esc(a.rots.join(', '))+'</td>'+
      '<td data-rot="Dias de atraso" class="n"><b class="'+(a.dias>60?'pend':'')+'">'+a.dias+'</b></td><td data-rot="Valor em aberto" class="n v40">'+R(a.valor)+'</td>'+
      '<td data-rot="Situação">'+chip(s[0],s[1])+(reguaPausada(a.p)?'<div class="nt">Régua pausada</div>':'')+'<div class="nt">Último contato: '+(contato(a.p)===0?'hoje':'há '+contato(a.p)+' dias')+'</div></td>'+
      '<td data-rot="Ação" class="rc-ac"><button class="btn" data-ia="cobrar" data-p="'+a.p.id+'" style="width:auto;padding:0 14px">Cobrar</button><button class="btn sec" data-ia="mais" data-p="'+a.p.id+'" style="width:auto;padding:0 12px" aria-haspopup="menu">Mais ações</button></td></tr>'}).join(''):'<tr><td colspan="8" class="vazio-t"><b>Nenhum pagador com este filtro.</b><br>Troque a faixa ou os filtros.</td></tr>')+'</tbody></table></div>';
}
function statusAc(p){
  var a=p.acordo;if(a.estado==='quebrado')return ['Quebrado','gr'];
  var pend=a.parcelas.filter(function(x){return x.st!=='paga'});if(!pend.length)return ['Quitado','vd'];
  var at=pend.filter(function(x){return dias(x.venc)>0});
  if(at.length)return ['Parcela atrasada há '+dias(at[0].venc)+(dias(at[0].venc)===1?' dia':' dias'),'gr'];
  return ['Em dia','vd'];
}
function abaAcordos(){
  var l=PAGS.filter(function(p){return p.acordo&&casa(q,p)});
  return '<div class="fe-barra"><div class="fe-info">Pagamento em Recebimentos casa primeiro com a parcela e depois com a cobrança. Acordo e promessa pausam a régua daquele pagador.</div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ia"><colgroup><col style="width:19%"><col style="width:19%"><col style="width:11%"><col style="width:10%"><col style="width:14%"><col style="width:14%"><col style="width:13%"></colgroup><thead><tr><th>Responsável</th><th>Lojas incluídas</th><th class="n">Valor total</th><th>Parcelas (pagas/total)</th><th>Próxima parcela</th><th>Situação</th><th>Ação</th></tr></thead><tbody>'+
   (l.length?l.map(function(p){var a=p.acordo,pg=a.parcelas.filter(function(x){return x.st==='paga'}).length,pen=a.parcelas.filter(function(x){return x.st!=='paga'})[0],s=statusAc(p),tot=a.parcelas.reduce(function(s2,x){return s2+x.valor},0),lj=a.lojas||p.lojas.map(function(x){return x.n});
     return '<tr class="'+(a.estado==='quebrado'?'sm':'')+'"><td data-rot="Responsável"><div class="lj-n">'+esc(p.nome)+'</div></td><td data-rot="Lojas incluídas" class="rp">'+esc(lj.slice(0,2).join(' · '))+(lj.length>2?' <span class="nt">+'+(lj.length-2)+'</span>':'')+'</td><td data-rot="Valor total" class="n v40">'+R(tot)+'</td><td data-rot="Parcelas"><b>'+pg+'</b> de '+a.parcelas.length+'</td>'+
      '<td data-rot="Próxima parcela">'+(pen&&a.estado!=='quebrado'?'<div>'+esc(pen.venc)+'</div><div class="nt">Parcela '+pen.n+' · '+R(pen.valor)+'</div>':'<span class="nt">—</span>')+'</td><td data-rot="Situação">'+chip(s[0],s[1])+'</td>'+
      '<td data-rot="Ação" class="rc-ac"><button class="btn sec" data-ia="cronograma" data-p="'+p.id+'" style="width:auto;padding:0 12px">Ver parcelas</button>'+(a.estado==='quebrado'?'':'<button class="btn sec" data-ia="quebrar" data-p="'+p.id+'" style="width:auto;padding:0 12px">Quebrar acordo</button>')+'</td></tr>'}).join(''):'<tr><td colspan="7" class="vazio-t"><b>Nenhum acordo encontrado.</b></td></tr>')+'</tbody></table></div>';
}
var SITB={'a pedir':'at','enviado ao grupo':'ok','confirmado':'cn','desbloqueio a pedir':'gr'};
function abaBloqueios(){
  var todos=bloqRows().filter(function(r){return casa(q,r.p,r.l.n+' '+r.l.gs)}),cnt={todos:todos.length};
  ['a pedir','enviado ao grupo','confirmado','desbloqueio a pedir'].forEach(function(s){cnt[s]=todos.filter(function(r){return r.sit===s}).length});
  var l=todos.filter(function(r){return fBl==='todos'||r.sit===fBl});
  return '<div class="fe-barra"><div class="fe-filtros">'+[['todos','Todas'],['a pedir','A pedir'],['enviado ao grupo','Enviado ao grupo'],['confirmado','Confirmado'],['desbloqueio a pedir','Desbloqueio a pedir']].map(function(x){return '<button class="chip-f" data-fbl="'+x[0]+'" aria-pressed="'+(fBl===x[0])+'">'+x[1]+' <b>'+cnt[x[0]]+'</b></button>'}).join('')+'</div>'+
   '<div class="fe-filtros"><button class="btn esc" data-ia="blotodas" style="width:auto;padding:0 14px"'+(cnt['a pedir']?'':' disabled')+'>Bloquear todas e enviar ('+cnt['a pedir']+')</button><button class="btn sec" data-ia="libtodas" style="width:auto;padding:0 14px"'+(cnt['desbloqueio a pedir']?'':' disabled')+'>Liberar todas e enviar ('+cnt['desbloqueio a pedir']+')</button></div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ia"><colgroup><col style="width:25%"><col style="width:17%"><col style="width:11%"><col style="width:17%"><col style="width:13%"><col style="width:17%"></colgroup><thead><tr><th>Loja (GS)</th><th>Responsável</th><th>Bloqueada desde</th><th>Motivo</th><th>Situação do pedido</th><th>Ação</th></tr></thead><tbody>'+
   (l.length?l.map(function(r,i){var b=BL[r.l.gs];
     var bt=r.sit==='a pedir'?'<button class="btn esc" data-ia="pedirbl" data-g="'+r.l.gs+'" style="width:auto;padding:0 12px">Pedir bloqueio</button>':r.sit==='desbloqueio a pedir'?'<button class="btn" data-ia="pedirlib" data-g="'+r.l.gs+'" style="width:auto;padding:0 12px">Pedir desbloqueio</button>':r.sit==='enviado ao grupo'?'<button class="btn" data-ia="confirmarbl" data-g="'+r.l.gs+'" style="width:auto;padding:0 12px">'+(r.tipo==='desbloqueio'?'Confirmar desbloqueio':'Confirmar bloqueio')+'</button>':'';
     return '<tr><td data-rot="Loja (GS)"><div class="lj-n">'+esc(r.l.n)+'</div><div class="lj-gs">'+esc(r.l.gs)+'</div></td><td data-rot="Responsável" class="rp">'+esc(r.p.nome)+'</td><td data-rot="Bloqueada desde">'+esc(r.desde)+'</td><td data-rot="Motivo" class="rp">'+esc(r.motivo)+'</td><td data-rot="Situação do pedido">'+chip(r.sit==='enviado ao grupo'?'Enviado ao grupo':r.sit.charAt(0).toUpperCase()+r.sit.slice(1),SITB[r.sit])+'</td><td data-rot="Ação" class="rc-ac">'+bt+'<button class="btn sec" data-ia="histbl" data-g="'+r.l.gs+'" style="width:auto;padding:0 12px">Histórico</button></td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhuma loja neste filtro.</b></td></tr>')+'</tbody></table></div>';
}
function fimMes(s){var d=pd(s);return fd(new Date(d.getFullYear(),d.getMonth()+1,0))}
function abertoSaida(s){var api=RC();return api.abertas(s.pid).reduce(function(a,c){return a+api.saldo(c)},0)}
var SITS={pendente:'at',concluída:'vd',cancelada:'cn'};
function abaSaidas(){
  var l=SAIDAS.filter(function(s){return casa(q,pagador(s.pid),s.lojas.join(' '))});
  return '<div class="fe-barra"><div class="fe-info">O mês inteiro da data efetiva ainda computa. Depois dele não computa, mas a cobrança do mês final ainda é enviada.</div><button class="btn" data-ia="novasaida" style="width:auto;padding:0 14px">Novo pedido de saída</button></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ia"><colgroup><col style="width:19%"><col style="width:19%"><col style="width:11%"><col style="width:17%"><col style="width:12%"><col style="width:9%"><col style="width:13%"></colgroup><thead><tr><th>Responsável</th><th>Lojas</th><th>Data do pedido</th><th>Data efetiva</th><th class="n">Em aberto</th><th>Situação</th><th>Ação</th></tr></thead><tbody>'+
   (l.length?l.map(function(s){var p=pagador(s.pid),ab=abertoSaida(s);
     return '<tr class="'+(s.sit==='cancelada'?'sm':'')+'"><td data-rot="Responsável"><div class="lj-n">'+esc(p.nome)+'</div></td><td data-rot="Lojas" class="rp">'+esc(s.lojas.join(' · '))+'</td><td data-rot="Data do pedido">'+esc(s.pedido)+'</td><td data-rot="Data efetiva"><div>'+esc(s.efetiva)+'</div><div class="nt">Computa até '+fimMes(s.efetiva)+'</div></td><td data-rot="Em aberto" class="n v40">'+(s.sit==='concluída'?'—':R(ab))+'</td><td data-rot="Situação">'+chip(s.sit.charAt(0).toUpperCase()+s.sit.slice(1),SITS[s.sit])+'</td>'+
      '<td data-rot="Ação" class="rc-ac">'+(s.sit==='pendente'?'<button class="btn" data-ia="concluir" data-s="'+s.id+'" style="width:auto;padding:0 12px">Concluir</button><button class="btn sec" data-ia="cancelarsaida" data-s="'+s.id+'" style="width:auto;padding:0 12px">Cancelar</button>':'')+'<button class="btn sec" data-ia="histsaida" data-s="'+s.id+'" style="width:auto;padding:0 12px">Histórico</button></td></tr>'}).join(''):'<tr><td colspan="7" class="vazio-t"><b>Nenhuma saída encontrada.</b></td></tr>')+'</tbody></table></div>';
}
function abaBaixas(){
  var l=BAIXAS.filter(function(b){return casa(q,pagador(b.pid))});
  var tot=l.reduce(function(s,b){return s+b.valor},0);
  return '<div class="fe-barra"><div class="fe-info">Cobranças com mais de 1 ano de atraso, sem promessa, acordo ou contato. A baixa sai do valor vencido do Dashboard, mas continua no histórico e no relatório.</div><div class="fe-info"><b>'+l.length+'</b> cobranças · <b>'+R(tot)+'</b></div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ia"><colgroup><col style="width:22%"><col style="width:10%"><col style="width:11%"><col style="width:10%"><col style="width:12%"><col style="width:35%"></colgroup><thead><tr><th>Responsável</th><th>Competência</th><th>Vencimento</th><th class="n">Dias de atraso</th><th class="n">Valor</th><th>Ação</th></tr></thead><tbody>'+
   (l.length?l.map(function(b){var p=pagador(b.pid);return '<tr><td data-rot="Responsável"><div class="lj-n">'+esc(p.nome)+'</div></td><td data-rot="Competência">'+esc(b.rot)+'</td><td data-rot="Vencimento">'+esc(b.venc)+'</td><td data-rot="Dias de atraso" class="n"><b class="pend">'+b.dias+'</b></td><td data-rot="Valor" class="n v40">'+R(b.valor)+'</td><td data-rot="Ação" class="rc-ac"><button class="btn esc" data-ia="bx" data-t="perdida" data-b="'+b.id+'" style="width:auto;padding:0 12px">Baixar como perdida</button><button class="btn sec" data-ia="bx" data-t="quitada" data-b="'+b.id+'" style="width:auto;padding:0 12px">Baixar como quitada</button><button class="btn sec" data-ia="bx" data-t="manter" data-b="'+b.id+'" style="width:auto;padding:0 12px">Manter em cobrança</button></td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhuma cobrança para baixar.</b></td></tr>')+'</tbody></table></div>'+
   '<div class="bloco-cab" style="margin-top:8px"><h2>Histórico de baixas</h2></div><div class="tab-cartao"><table class="tab-fe tab-ia"><colgroup><col style="width:20%"><col style="width:10%"><col style="width:12%"><col style="width:16%"><col style="width:12%"><col style="width:30%"></colgroup><thead><tr><th>Responsável</th><th>Competência</th><th class="n">Valor</th><th>Decisão</th><th>Quem e quando</th><th>Motivo</th></tr></thead><tbody>'+
   (BXH.length?BXH.map(function(h){var t={perdida:['Baixada como perdida','gr'],quitada:['Baixada como quitada','vd'],manter:['Mantida em cobrança','cn']}[h.t];return '<tr><td data-rot="Responsável"><div class="lj-n">'+esc(pagador(h.pid).nome)+'</div></td><td data-rot="Competência">'+esc(h.rot)+'</td><td data-rot="Valor" class="n">'+R(h.valor)+'</td><td data-rot="Decisão">'+chip(t[0],t[1])+'</td><td data-rot="Quem e quando" class="rp">'+esc(h.q)+'<div class="nt">'+esc(h.quando)+'</div></td><td data-rot="Motivo" class="rp">'+esc(h.m)+'</td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t">Nenhuma baixa registrada ainda.</td></tr>')+'</tbody></table></div>';
}
/* relatórios */
function lcg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function relDia(d){
  var api=RC(),k=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(),r=lcg(k),ds=fd(d);
  var pags=api.DB.pags.filter(function(p){return api.fdata(p.ts)===ds&&(p.estado==='ligado'||p.estado==='credito'||p.estado==='pendente')});
  var rec=pags.reduce(function(s,p){return s+p.valor},0),env=Math.round(4+r()*14);
  var comp=api.DB.fila.filter(function(f){return api.fdata(f.ts)===ds}).length+Math.round(r()*5);
  var cats=[['Cobranças enviadas',env,env*(900+Math.round(r()*900))],['Pagamentos confirmados',pags.length||Math.round(r()*6),rec],['Comprovantes conferidos',comp,0],['Promessas registradas',Math.round(r()*5),0],['Acordos criados',LOG.filter(function(x){return x.d===ds&&x.t==='acordo'}).length+(r()<.3?1:0),0],['Bloqueios pedidos',LOG.filter(function(x){return x.d===ds&&x.t==='bloqueio'}).length+Math.round(r()*3),0],['Desbloqueios pedidos',Math.round(r()*2),0]];
  return {ds:ds,cobrado:cats[0][2],rec:rec,comp:comp,blq:cats[5][1],ac:cats[4][1],cats:cats};
}
function faixas(){
  var a=atrasos(),F1=[['1 a 30 dias',0],['31 a 60 dias',0],['61 a 90 dias',0],['Mais de 90 dias',0]],q1=[0,0,0,0],v1=[0,0,0,0];
  a.forEach(function(x){var i=+faixaDe(x.dias)-1;q1[i]++;v1[i]+=x.valor});
  BAIXAS.forEach(function(b){q1[3]++;v1[3]+=b.valor});
  return F1.map(function(f,i){return [f[0],q1[i],v1[i]]});
}
function abaRel(){
  var d=off(diaRel),r=relDia(d),eh=diaRel===0,mes=window.MK_DASH.periodos.mes,fx=faixas(),tot=fx.reduce(function(s,x){return s+x[2]},0),mx=Math.max.apply(null,fx.map(function(x){return x[2]}))||1;
  var dsem=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'][d.getDay()];
  return '<div class="fe-barra"><div class="fe-info">Relatórios da cobrança. Os números do dia usam os pagamentos reais de Recebimentos.</div><div class="fe-filtros"><button class="btn sec" data-ia="expplan" style="width:auto;padding:0 14px">Exportar para planilha</button><button class="btn sec" data-ia="exppdf" style="width:auto;padding:0 14px">Exportar PDF</button></div></div>'+
   '<div class="rl-grade"><div class="cx rl-dia"><div class="cx-cab">'+ic('calendar-days')+'<h3>Relatório do dia</h3><div class="rl-nav"><button class="btn sec" data-ia="dia" data-v="-1" aria-label="Dia anterior" style="width:auto;padding:0 12px">Anterior</button><button class="btn sec" data-ia="dia" data-v="0" style="width:auto;padding:0 12px"'+(eh?' disabled':'')+'>Hoje</button><button class="btn sec" data-ia="dia" data-v="1" aria-label="Próximo dia" style="width:auto;padding:0 12px"'+(eh?' disabled':'')+'>Próximo</button></div></div>'+
    '<div class="rl-sub">'+esc(dsem)+', '+r.ds+'</div><div class="rl-k"><div><small>Cobrado</small><b>'+R(r.cobrado)+'</b></div><div><small>Recebido</small><b>'+R(r.rec)+'</b></div><div><small>Comprovantes</small><b>'+r.comp+'</b></div><div><small>Bloqueios pedidos</small><b>'+r.blq+'</b></div><div><small>Acordos criados</small><b>'+r.ac+'</b></div></div>'+
    '<table class="tab-fe rl-t"><thead><tr><th>Movimento por categoria</th><th class="n">Quantidade</th><th class="n">Valor</th></tr></thead><tbody>'+r.cats.map(function(c){return '<tr><td data-rot="Categoria">'+esc(c[0])+'</td><td data-rot="Quantidade" class="n">'+c[1]+'</td><td data-rot="Valor" class="n">'+(c[2]?R(c[2]):'—')+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('bar-chart-3')+'<h3>Relatório do mês</h3><span class="c">'+esc(mes.rotulo)+'</span></div><div class="rl-k rl-k2"><div><small>Cobrado</small><b>'+R(mes.cobrado[0])+'</b></div><div><small>Recebido</small><b>'+R(mes.recebido[0])+'</b></div><div><small>Pontualidade</small><b>'+mes.pont[0]+'%</b></div></div>'+
    '<div class="rl-lista"><div class="f-sub">Maiores devedores</div>'+window.MK_DASH.rank.devedores.map(function(x,i){return '<div class="rank-l"><span class="pos">'+(i+1)+'</span><span class="pg">'+esc(x[0])+'</span><b class="din">'+R(x[1])+'</b></div>'}).join('')+'<div class="f-sub">Maiores pagadores</div>'+window.MK_DASH.rank.pagadores.map(function(x,i){return '<div class="rank-l"><span class="pos">'+(i+1)+'</span><span class="pg">'+esc(x[0])+'</span><b class="din">'+R(x[1])+'</b></div>'}).join('')+'</div></div>'+
   '<div class="cx rl-env"><div class="cx-cab">'+ic('layers')+'<h3>Envelhecimento da carteira</h3><span class="c">'+R(tot)+'</span></div>'+fx.map(function(x){return '<div class="rl-f"><div class="rl-f-t"><b>'+x[0]+'</b><span class="nt">'+x[1]+(x[1]===1?' cobrança':' cobranças')+'</span><b class="din">'+R(x[2])+'</b></div><div class="barra"><i class="dev" style="width:'+Math.round(x[2]/mx*100)+'%"></i></div></div>'}).join('')+'</div></div>';
}
function corpo(){return aba==='atraso'?abaAtraso():aba==='acordos'?abaAcordos():aba==='bloqueios'?abaBloqueios():aba==='saidas'?abaSaidas():aba==='baixas'?abaBaixas():abaRel()}
function sincDash(){
  var pf=window.MK_DASH.fila.parcelas;
  PAGS.forEach(function(p){if(!p.acordo||p.acordo.estado==='quebrado')return;p.acordo.parcelas.forEach(function(x){if(x.st!=='paga'&&dias(x.venc)>0){var n='Parcela '+x.n+' de '+p.acordo.parcelas.length+' do acordo';if(!pf.some(function(y){return y.p===p.nome&&y.n===n}))pf.push({p:p.nome,l:p.lojas.slice(0,3).map(function(l){return l.n}),v:x.valor,d:dias(x.venc),n:n})}})});
}
function render(alvo){
  if(alvo)el=alvo;iniciar();sincDash();
  el.innerHTML='<div class="dash fe-w rc-w">'+topo()+'<section class="bloco"><div class="fe-painel" id="ia-corpo">'+corpo()+'</div></section><div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  U.icones();
}
function pintar(){var c=document.getElementById('ia-corpo');if(c){c.innerHTML=corpo();U.icones()}}
function refaz(){var y=window.scrollY;render();window.scrollTo(0,y)}
/* ---------- ações ---------- */
function regua(a){
  var p=a.p,d=a.dias,e=d<=5?1:d<=10?2:3,rot=a.rots.join(', ');
  var t=e===1?'Olá, '+pr(p)+'! Identificamos que a cobrança de '+rot+' venceu há '+d+(d===1?' dia':' dias')+', no valor de '+R(a.valor)+'. Se já pagou, é só enviar o comprovante por aqui. Se precisar de ajuda, responda esta mensagem.'
   :e===2?'Olá, '+pr(p)+'. A cobrança de '+rot+' segue em aberto há '+d+' dias ('+R(a.valor)+'). Precisamos regularizar. Pix (CNPJ da VHSS): '+((window.MK_CFG&&window.MK_CFG.dados&&window.MK_CFG.dados.cnpj)||'00.000.000/0001-00')+'. Envie o comprovante por aqui.'
   :'Aviso, '+pr(p)+': a cobrança de '+rot+' está em aberto há '+d+' dias ('+R(a.valor)+'). Sem o pagamento, suas lojas serão bloqueadas. Fale com a gente hoje para evitar o bloqueio.';
  return {e:e,t:t};
}
function cobrar(a){
  var g=regua(a),p=a.p;
  U.modal({titulo:'Cobrar '+p.nome,ok:'Enviar mensagem',html:'<p class="dica-m">Mensagem da régua, etapa '+g.e+'. Revise antes de enviar.</p>'+(reguaPausada(p)?'<div class="fe-aviso" style="margin-bottom:10px"><span>A régua está pausada para este pagador ('+(p.promessa?'promessa ativa':'acordo ativo')+'). Você está enviando uma cobrança manual.</span></div>':'')+'<textarea id="cb-txt" class="cb-area" rows="8">'+esc(g.t)+'</textarea>',
    onOk:function(m){var x=m.querySelector('#cb-txt').value.trim();if(!x)return false;p.contato=0;ev(p,'Cobrança da régua enviada (etapa '+g.e+')');refaz();U.toast('Mensagem enviada.')}});
}
function promessa(p){
  U.modal({titulo:'Registrar promessa de pagamento',ok:'Registrar promessa',html:'<p class="dica-m">'+esc(p.nome)+'</p><div class="campo"><label for="pr-d">Data prometida <i class="obr">*</i></label><input id="pr-d" type="date"></div><small class="erro" id="pr-e" hidden>Informe a data da promessa.</small><p class="dica-m" style="margin-top:10px">Com promessa ativa, a régua de cobrança fica pausada para este pagador.</p>',
    onOk:function(m){var d=m.querySelector('#pr-d').value;if(!d){m.querySelector('#pr-e').hidden=false;return false}var a=d.split('-'),tx=a[2]+'/'+a[1]+'/'+a[0];p.promessa={data:tx};p.retorno=a[2]+'/'+a[1]+' às 10h';p.sit='promessa reagendada';p.contato=0;ev(p,'Promessa registrada para '+tx+'. Régua pausada');refaz();U.toast('Promessa registrada. A régua ficou pausada.')}});
}
function criarAcordo(p){
  var api=RC(),ab=api.abertas(p.id).filter(function(c){return !c.acordo});
  if(!ab.length){U.toast('Este pagador não tem cobrança em aberto para incluir em acordo.');return}
  var m=U.modal({titulo:'Criar acordo',ok:'Gravar acordo',html:
   '<p class="dica-m">'+esc(p.nome)+'</p><div class="campo"><label>Competências a incluir <i class="obr">*</i></label><div class="ac-cobs">'+ab.map(function(c){return '<label class="lc-cob"><input type="checkbox" data-ac="'+c.id+'" checked><span><b>'+esc(c.rot)+'</b><small>'+c.lojas.map(function(l){return esc(l.n)}).join(' · ')+'</small></span><b class="n">'+R(api.saldo(c))+'</b></label>'}).join('')+'</div></div>'+
   '<div class="f-grade" style="margin-top:12px"><div class="campo"><label for="ac-n">Número de parcelas</label><select class="sel" id="ac-n">'+[2,3,4,5,6,8,10,12].map(function(n){return '<option'+(n===3?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div><div class="campo"><label for="ac-p">Periodicidade</label><select class="sel" id="ac-p"><option value="m">Mensal</option><option value="q">Quinzenal</option><option value="l">Datas livres</option></select></div><div class="campo"><label for="ac-d">Vencimento da primeira parcela <i class="obr">*</i></label><input id="ac-d" type="date" value="'+iso2(off(7))+'"></div></div><div id="ac-livres"></div>'+
   '<div class="f-sub" style="margin-top:14px">Cronograma</div><div class="hist" id="ac-crono"></div><small class="erro" id="ac-e" hidden></small><p class="dica-m" style="margin-top:8px">Rateio entre lojas: o centavo que sobra fica na última loja. Com o acordo ativo, a régua fica pausada.</p>'});
  function total(){var t=0;m.querySelectorAll('[data-ac]').forEach(function(c){if(c.checked)t+=api.saldo(api.DB.cobs.filter(function(x){return x.id===c.dataset.ac})[0])});return Math.round(t*100)/100}
  function datas(){
    var n=+m.querySelector('#ac-n').value,per=m.querySelector('#ac-p').value,ds=[],d0=m.querySelector('#ac-d').value;
    if(per==='l'){for(var i=0;i<n;i++){var e=m.querySelector('#ac-l'+i);ds.push(e&&e.value?iso(e.value):null)}return ds}
    if(!d0)return ds;var b=iso(d0);
    for(var i=0;i<n;i++){var d=new Date(b);if(per==='m')d.setMonth(d.getMonth()+i);else d.setDate(d.getDate()+15*i);ds.push(d)}return ds;
  }
  function desenha(){
    var n=+m.querySelector('#ac-n').value,per=m.querySelector('#ac-p').value,t=total(),cent=Math.round(t*100),base=Math.floor(cent/n),liv=m.querySelector('#ac-livres');
    if(per==='l'){if(!liv.innerHTML||liv.dataset.n!==String(n)){liv.dataset.n=n;var h='<div class="f-grade" style="margin-top:10px">';for(var i=0;i<n;i++)h+='<div class="campo"><label for="ac-l'+i+'">Vencimento da parcela '+(i+1)+'</label><input id="ac-l'+i+'" type="date"></div>';liv.innerHTML=h+'</div>'}}else liv.innerHTML='';
    var ds=datas();
    m.querySelector('#ac-crono').innerHTML=Array.apply(null,Array(n)).map(function(_,i){var v=(i===n-1?cent-base*(n-1):base)/100;return '<div class="h-lin"><b>Parcela '+(i+1)+' de '+n+'</b> · '+(ds[i]?fd(ds[i]):'<i>defina a data</i>')+' · '+R(v)+'</div>'}).join('')+'<div class="h-lin"><b>Total do acordo: '+R(t)+'</b></div>';
  }
  m.addEventListener('input',desenha);m.addEventListener('change',desenha);desenha();
  m.querySelector('.m-ok').onclick=null;
  var ok=m.querySelector('.m-ok'),novo=ok.cloneNode(true);ok.parentNode.replaceChild(novo,ok);
  novo.addEventListener('click',function(){
    var sel=[].slice.call(m.querySelectorAll('[data-ac]')).filter(function(c){return c.checked}),e=m.querySelector('#ac-e');
    if(!sel.length){e.textContent='Escolha ao menos uma competência.';e.hidden=false;return}
    var ds=datas(),n=+m.querySelector('#ac-n').value;
    if(ds.length<n||ds.some(function(d){return !d})){e.textContent='Informe todos os vencimentos.';e.hidden=false;return}
    var t=total(),cent=Math.round(t*100),base=Math.floor(cent/n),ps=[];
    for(var i=0;i<n;i++)ps.push({n:i+1,venc:fd(ds[i]),valor:(i===n-1?cent-base*(n-1):base)/100,st:'aberta'});
    var cobs=sel.map(function(c){return api.DB.cobs.filter(function(x){return x.id===c.dataset.ac})[0]});
    var lj={};cobs.forEach(function(c){c.lojas.forEach(function(l){lj[l.n]=1})});
    p.acordo={parcelas:ps,estado:'ativo',lojas:Object.keys(lj),comps:cobs.map(function(c){return c.rot}),total:t};p.fin='acordo';p.contato=0;p.sit='';
    LOG.push({t:'acordo',d:fd(HOJE0)});ev(p,'Acordo criado em '+n+' parcelas ('+cobs.map(function(c){return c.rot}).join(', ')+'). Régua pausada');
    m.querySelector('.fechar').click();aba='acordos';refaz();U.toast('Acordo gravado. A régua ficou pausada para este pagador.');
  });
}
function iso2(d){return d.getFullYear()+'-'+d2(d.getMonth()+1)+'-'+d2(d.getDate())}
function cronograma(p){
  var a=p.acordo;
  var m=U.modal({titulo:'Parcelas do acordo de '+p.nome,ok:'Fechar',cancel:'Fechar',html:'<div class="hist">'+a.parcelas.map(function(x,i){var at=x.st!=='paga'&&dias(x.venc)>0,c=x.st==='paga'?['Paga','vd']:at?['Atrasada há '+dias(x.venc)+' dias','gr']:['A vencer','ok'];return '<div class="h-lin ac-p"><div><b>Parcela '+x.n+'</b> · '+esc(x.venc)+' · '+R(x.valor)+'</div><div class="ac-pd">'+chip(c[0],c[1])+(x.st!=='paga'&&a.estado!=='quebrado'?'<button class="btn sec" data-edp="'+i+'" style="width:auto;padding:0 10px;height:28px">Editar</button>':'')+'</div></div>'}).join('')+'</div>'+(a.log&&a.log.length?'<div class="f-sub" style="margin-top:12px">Alterações</div><div class="hist">'+a.log.map(function(x){return '<div class="h-lin">'+esc(x)+'</div>'}).join('')+'</div>':'')});
  m.addEventListener('click',function(e){var b=e.target.closest('[data-edp]');if(!b)return;var x=a.parcelas[+b.dataset.edp];
    U.modal({titulo:'Editar parcela '+x.n,ok:'Salvar alteração',html:'<div class="f-grade"><div class="campo"><label for="ep-d">Vencimento</label><input id="ep-d" type="date" value="'+iso2(pd(x.venc))+'"></div><div class="campo"><label for="ep-v">Valor</label><input id="ep-v" inputmode="decimal" value="'+String(x.valor).replace('.',',')+'"></div></div><div class="campo" style="margin-top:10px"><label for="ep-m">Motivo <i class="obr">*</i></label><textarea id="ep-m" class="cb-area" rows="3"></textarea><small class="erro" id="ep-e" hidden>Informe o motivo. Toda alteração fica registrada.</small></div>',
      onOk:function(mm){var mo=mm.querySelector('#ep-m').value.trim();if(!mo){mm.querySelector('#ep-e').hidden=false;return false}
        var nd=fd(iso(mm.querySelector('#ep-d').value)),nv=num(mm.querySelector('#ep-v').value);(a.log=a.log||[]).unshift(agora()+' · '+EU+' · Parcela '+x.n+': '+x.venc+' / '+R(x.valor)+' → '+nd+' / '+R(nv)+' · '+mo);x.venc=nd;x.valor=nv;ev(p,'Parcela '+x.n+' do acordo editada: '+mo);refaz();U.toast('Parcela alterada e registrada.')}})});
}
function quebrar(p){
  U.modal({titulo:'Quebrar acordo',ok:'Quebrar acordo',perigo:true,html:'<p>O acordo de <b>'+esc(p.nome)+'</b> será marcado como quebrado. O saldo volta para a cobrança original e a régua de cobrança volta a rodar. Ele continua no histórico.</p><div class="campo" style="margin-top:10px"><label for="qb-m">Motivo <i class="obr">*</i></label><textarea id="qb-m" class="cb-area" rows="3"></textarea><small class="erro" id="qb-e" hidden>Informe o motivo.</small></div>',
    onOk:function(m){var mo=m.querySelector('#qb-m').value.trim();if(!mo){m.querySelector('#qb-e').hidden=false;return false}
      p.acordo.estado='quebrado';(p.acordo.log=p.acordo.log||[]).unshift(agora()+' · '+EU+' · Acordo quebrado · '+mo);p.fin='atraso';if(!p.dias)p.dias=Math.max(1,atrasos().filter(function(a){return a.p===p})[0]?atrasos().filter(function(a){return a.p===p})[0].dias:5);
      ev(p,'Acordo quebrado: '+mo+'. Saldo voltou para a cobrança original');refaz();U.toast('Acordo quebrado. O saldo voltou para a cobrança original e '+EU+' foi avisada.')}});
}
function pedirBloqueio(a){
  var ls=a.p.lojas.filter(function(l){return l.st==='ativa'&&a.lojas.indexOf(l.n)>-1});
  if(!ls.length){U.toast('Todas as lojas em atraso deste pagador já estão bloqueadas ou com pedido enviado.');return}
  U.modal({titulo:'Pedir bloqueio',ok:'Enviar ao grupo de bloqueio',perigo:true,html:'<p class="dica-m">'+esc(a.p.nome)+' · '+a.dias+' dias de atraso</p><div class="ac-cobs">'+ls.map(function(l){return '<label class="lc-cob"><input type="checkbox" data-lb="'+l.gs+'" checked><span><b>'+esc(l.n)+'</b><small>'+esc(l.gs)+'</small></span></label>'}).join('')+'</div>',
    onOk:function(m){var g=[].slice.call(m.querySelectorAll('[data-lb]')).filter(function(c){return c.checked}).map(function(c){return c.dataset.lb});if(!g.length)return false;enviarGrupo(a.p,g.map(function(x){return ls.filter(function(l){return l.gs===x})[0]}),'bloqueio','Atraso de '+a.dias+' dias');refaz();U.toast('Pedido de bloqueio enviado ao grupo.')}});
}
function enviarGrupo(p,lojas,tipo,motivo){
  var txt=(tipo==='bloqueio'?'Bloquear':'Liberar')+' as lojas de '+p.nome+':\n'+lojas.map(function(l){return '• '+l.n+' (GS '+l.gs+')'}).join('\n')+'\nContato: '+p.nome+' · '+p.fone+' (vCard anexado)';
  lojas.forEach(function(l){var b=BL[l.gs]=BL[l.gs]||{hist:[]};b.sit='enviado ao grupo';b.tipo=tipo;if(tipo==='bloqueio')b.motivo=motivo;b.hist.push({t:agora(),q:EU,x:(tipo==='bloqueio'?'Bloqueio':'Desbloqueio')+' pedido ao grupo'})});
  LOG.push({t:'bloqueio',d:fd(HOJE0)});ev(p,(tipo==='bloqueio'?'Bloqueio':'Desbloqueio')+' pedido ao grupo ('+lojas.length+(lojas.length===1?' loja':' lojas')+')');
  if(F.hooks.grupo)F.hooks.grupo(txt);
}
function enviarLote(tipo){
  var rs=bloqRows().filter(function(r){return r.sit===(tipo==='bloqueio'?'a pedir':'desbloqueio a pedir')});if(!rs.length)return;
  var ags={};rs.forEach(function(r){(ags[r.p.id]=ags[r.p.id]||{p:r.p,ls:[]}).ls.push(r.l)});
  var txt=Object.keys(ags).map(function(k){return (tipo==='bloqueio'?'Bloquear':'Liberar')+' '+ags[k].p.nome+': '+ags[k].ls.map(function(l){return l.n+' (GS '+l.gs+')'}).join(', ')}).join('\n');
  U.modal({titulo:(tipo==='bloqueio'?'Bloquear':'Liberar')+' todas e enviar',ok:'Enviar ao grupo',perigo:tipo==='bloqueio',html:'<p class="dica-m">'+rs.length+(rs.length===1?' loja':' lojas')+' de '+Object.keys(ags).length+' pagadores. O grupo recebe a lista de lojas e o vCard do contato de cada pagador.</p><pre class="pv-txt" style="border-radius:8px;max-height:220px;overflow:auto">'+esc(txt)+'</pre>',
    onOk:function(){Object.keys(ags).forEach(function(k){enviarGrupo(ags[k].p,ags[k].ls,tipo,'Passou do prazo da régua')});refaz();U.toast('Enviado ao grupo de bloqueio.')}});
}
function confirmarBl(gs){
  var r=bloqRows().filter(function(x){return x.l.gs===gs})[0],b=BL[gs];if(!r)return;
  if(b.tipo==='desbloqueio'){r.l.st='ativa';b.sit='liberada';b.hist.push({t:agora(),q:EU,x:'Desbloqueio confirmado pela plataforma'})}
  else{r.l.st='bloqueada';b.sit='confirmado';b.desde=fd(HOJE0);b.hist.push({t:agora(),q:EU,x:'Bloqueio confirmado pela plataforma'})}
  ev(r.p,(b.tipo==='desbloqueio'?'Desbloqueio':'Bloqueio')+' confirmado: '+r.l.n);refaz();U.toast((b.tipo==='desbloqueio'?'Desbloqueio':'Bloqueio')+' confirmado.');
}
function histBl(gs){
  var b=BL[gs],l=null;PAGS.forEach(function(p){p.lojas.forEach(function(x){if(x.gs===gs)l=x})});
  U.modal({titulo:'Histórico de '+(l?l.n:gs),ok:'Fechar',cancel:'Fechar',html:b&&b.hist.length?'<div class="hist">'+b.hist.slice().reverse().map(function(h){return '<div class="h-lin"><b>'+esc(h.x)+'</b><div class="nt">'+esc(h.q)+' · '+esc(h.t)+'</div></div>'}).join('')+'</div>':'<p class="dica-m">Nenhum bloqueio ou desbloqueio registrado para esta loja.</p>'});
}
function concluir(s){
  var p=pagador(s.pid),ab=abertoSaida(s);
  if(ab<=.02)U.modal({titulo:'Concluir saída',ok:'Concluir saída',html:'<p>O em aberto de <b>'+esc(p.nome)+'</b> está quitado. Concluir a saída de '+esc(s.lojas.join(', '))+'?</p>',onOk:function(){s.sit='concluída';s.hist.push({t:agora(),q:EU,x:'Saída concluída, em aberto quitado'});ev(p,'Saída concluída');refaz();U.toast('Saída concluída.')}});
  else U.modal({titulo:'Há valor em aberto',ok:'Concluir com baixa',perigo:true,html:'<p>Ainda há <b>'+R(ab)+'</b> em aberto. A saída só conclui com o em aberto quitado, ou baixado com motivo.</p><div class="campo" style="margin-top:10px"><label for="sd-m">Motivo da baixa do em aberto <i class="obr">*</i></label><textarea id="sd-m" class="cb-area" rows="3"></textarea><small class="erro" id="sd-e" hidden>Informe o motivo para concluir com valor em aberto.</small></div>',
    onOk:function(m){var mo=m.querySelector('#sd-m').value.trim();if(!mo){m.querySelector('#sd-e').hidden=false;return false}s.sit='concluída';s.hist.push({t:agora(),q:EU,x:'Saída concluída com baixa de '+R(ab)+': '+mo});ev(p,'Saída concluída com baixa do em aberto: '+mo);refaz();U.toast('Saída concluída. A baixa ficou registrada.')}});
}
function cancelarSaida(s){
  U.modal({titulo:'Cancelar pedido de saída',ok:'Cancelar pedido',perigo:true,html:'<div class="campo"><label for="cs-m">Motivo <i class="obr">*</i></label><textarea id="cs-m" class="cb-area" rows="3"></textarea><small class="erro" id="cs-e" hidden>Informe o motivo.</small></div>',onOk:function(m){var mo=m.querySelector('#cs-m').value.trim();if(!mo){m.querySelector('#cs-e').hidden=false;return false}s.sit='cancelada';s.hist.push({t:agora(),q:EU,x:'Pedido cancelado: '+mo});ev(pagador(s.pid),'Pedido de saída cancelado');refaz();U.toast('Pedido cancelado. Ele continua no histórico.')}});
}
function histSaida(s){U.modal({titulo:'Histórico da saída',ok:'Fechar',cancel:'Fechar',html:'<div class="hist">'+s.hist.slice().reverse().map(function(h){return '<div class="h-lin"><b>'+esc(h.x)+'</b><div class="nt">'+esc(h.q)+' · '+esc(h.t)+'</div></div>'}).join('')+'</div>'})}
function novaSaida(){
  var m=U.modal({titulo:'Novo pedido de saída',ok:'Registrar pedido',html:'<div class="campo"><label for="ns-p">Pagador <i class="obr">*</i></label><select class="sel" id="ns-p"><option value="">Selecione</option>'+PAGS.map(function(p){return '<option value="'+p.id+'">'+esc(p.nome)+'</option>'}).join('')+'</select></div><div class="campo" style="margin-top:10px"><label>Lojas</label><div class="ac-cobs" id="ns-l"><span class="nt">Escolha o pagador.</span></div></div><div class="campo" style="margin-top:10px"><label for="ns-d">Data efetiva da saída <i class="obr">*</i></label><input id="ns-d" type="date"></div><small class="erro" id="ns-e" hidden></small>',
    onOk:function(mm){var pid=+mm.querySelector('#ns-p').value,d=mm.querySelector('#ns-d').value,e=mm.querySelector('#ns-e'),ls=[].slice.call(mm.querySelectorAll('[data-nl]')).filter(function(c){return c.checked}).map(function(c){return c.dataset.nl});
      if(!pid||!d||!ls.length){e.textContent='Escolha o pagador, ao menos uma loja e a data efetiva.';e.hidden=false;return false}
      SAIDAS.unshift({id:nid++,pid:pid,lojas:ls,pedido:fd(HOJE0),efetiva:fd(iso(d)),sit:'pendente',hist:[{t:agora(),q:EU,x:'Pedido de saída registrado'}]});ev(pagador(pid),'Pedido de saída registrado');refaz();U.toast('Pedido de saída registrado.')}});
  m.addEventListener('change',function(e){if(e.target.id==='ns-p'){var p=pagador(+e.target.value);m.querySelector('#ns-l').innerHTML=p?p.lojas.map(function(l){return '<label class="lc-cob"><input type="checkbox" data-nl="'+esc(l.n)+'" checked><span><b>'+esc(l.n)+'</b><small>'+esc(l.gs)+'</small></span></label>'}).join(''):'<span class="nt">Escolha o pagador.</span>'}});
}
function baixar(b,t){
  var p=pagador(b.pid),tit={perdida:'Baixar como perdida',quitada:'Baixar como quitada (pagamento não registrado)',manter:'Manter em cobrança'}[t];
  U.modal({titulo:tit,ok:tit.split(' (')[0],perigo:t==='perdida',html:'<p class="dica-m">'+esc(p.nome)+' · '+esc(b.rot)+' · '+R(b.valor)+' · '+b.dias+' dias de atraso</p>'+(t==='manter'?'<p>A cobrança continua no passivo e volta a aparecer aqui depois de um novo período.</p>':'<p>A baixa sai do valor vencido do Dashboard, mas continua no histórico e no relatório.</p>')+'<div class="campo" style="margin-top:10px"><label for="bx-m">Motivo <i class="obr">*</i></label><textarea id="bx-m" class="cb-area" rows="3"></textarea><small class="erro" id="bx-e" hidden>Informe o motivo. Toda decisão fica registrada.</small></div>',
    onOk:function(m){var mo=m.querySelector('#bx-m').value.trim();if(!mo){m.querySelector('#bx-e').hidden=false;return false}
      BXH.unshift({pid:b.pid,rot:b.rot,valor:b.valor,t:t,m:mo,q:EU,quando:agora()});BAIXAS=BAIXAS.filter(function(x){return x!==b});
      if(t!=='manter'){[window.MK_DASH.periodos.mes,window.MK_DASH.periodos.tri].forEach(function(pp){pp.vencido[0]=Math.max(0,Math.round((pp.vencido[0]-b.valor)*100)/100);pp.vencido[1]=Math.max(0,pp.vencido[1]-1)})}
      ev(p,'Cobrança '+b.rot+' '+({perdida:'baixada como perdida',quitada:'baixada como quitada',manter:'mantida em cobrança'}[t])+': '+mo);refaz();U.toast(t==='manter'?'Cobrança mantida em cobrança.':'Baixa registrada. O valor saiu do vencido do Dashboard.')}});
}
function csv(){
  var r=relDia(off(diaRel)),l=['Categoria;Quantidade;Valor'].concat(r.cats.map(function(c){return '"'+c[0]+'";'+c[1]+';'+String(c[2]).replace('.',',')})).concat(['','Faixa;Cobranças;Valor']).concat(faixas().map(function(x){return '"'+x[0]+'";'+x[1]+';'+String(x[2]).replace('.',',')}));
  var t=l.join('\n');
  U.modal({titulo:'Exportar para planilha',ok:'Copiar tudo',cancel:'Fechar',html:'<p class="dica-m">Relatório de '+r.ds+' e envelhecimento da carteira, em CSV com ponto e vírgula. Copie e cole no Excel ou no Google Planilhas.</p><textarea id="ex-t" class="cb-area" rows="9" readonly>'+esc(t)+'</textarea>',onOk:function(m){var x=m.querySelector('#ex-t');x.select();try{navigator.clipboard.writeText(t).then(function(){U.toast('Copiado.')},function(){U.toast('Selecione o texto e copie com Ctrl+C.')})}catch(e){U.toast('Selecione o texto e copie com Ctrl+C.')}return false}});
}
function maisMenu(a,p){
  var it=atrasos().filter(function(x){return x.p===p})[0];
  U.menu(a,[{id:'conversa',t:'Abrir conversa',icone:'message-circle'},{id:'promessa',t:'Registrar promessa',icone:'calendar-clock'},{id:'acordo',t:'Criar acordo',icone:'handshake'},{id:'bloqueio',t:'Pedir bloqueio',icone:'lock'},{sep:1},{id:'ficha',t:'Abrir ficha do pagador',icone:'user'}],function(id){
    if(id==='conversa')U.toast('Abriria a conversa de '+p.nome+' na tela Conversas. Ainda sem função.');else if(id==='promessa')promessa(p);else if(id==='acordo')criarAcordo(p);else if(id==='bloqueio')pedirBloqueio(it);else F.abrir(p)});
}
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)}
function P(id){return pagador(+id)}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b;
  if((b=t.closest('[data-aba]'))){aba=b.dataset.aba;refaz();return}
  if((b=t.closest('[data-faixa]'))){faixa=b.dataset.faixa;pintar();return}
  if((b=t.closest('[data-ext]'))){ext[b.dataset.ext]=!ext[b.dataset.ext];pintar();return}
  if((b=t.closest('[data-fbl]'))){fBl=b.dataset.fbl;pintar();return}
  if((b=t.closest('[data-ia]'))){
    var a=b.dataset.ia,it=null;
    if(b.dataset.p)it=atrasos().filter(function(x){return String(x.p.id)===b.dataset.p})[0];
    if(a==='cobrar')cobrar(it);else if(a==='mais')maisMenu(b,P(b.dataset.p));
    else if(a==='cronograma')cronograma(P(b.dataset.p));else if(a==='quebrar')quebrar(P(b.dataset.p));
    else if(a==='pedirbl'||a==='pedirlib'){var r=bloqRows().filter(function(x){return x.l.gs===b.dataset.g})[0];if(a==='pedirbl'){var at=atrasos().filter(function(x){return x.p===r.p})[0];enviarGrupo(r.p,[r.l],'bloqueio','Atraso de '+(at?at.dias:0)+' dias')}else enviarGrupo(r.p,[r.l],'desbloqueio','');refaz();U.toast('Pedido enviado ao grupo de bloqueio.')}
    else if(a==='confirmarbl')confirmarBl(b.dataset.g);else if(a==='histbl')histBl(b.dataset.g);
    else if(a==='blotodas')enviarLote('bloqueio');else if(a==='libtodas')enviarLote('desbloqueio');
    else if(a==='concluir')concluir(SAIDAS.filter(function(s){return s.id===+b.dataset.s})[0]);else if(a==='cancelarsaida')cancelarSaida(SAIDAS.filter(function(s){return s.id===+b.dataset.s})[0]);
    else if(a==='histsaida')histSaida(SAIDAS.filter(function(s){return s.id===+b.dataset.s})[0]);else if(a==='novasaida')novaSaida();
    else if(a==='bx')baixar(BAIXAS.filter(function(x){return x.id===+b.dataset.b})[0],b.dataset.t);
    else if(a==='dia'){var v=+b.dataset.v;diaRel=v===0?0:Math.min(0,diaRel+v);pintar()}
    else if(a==='expplan')csv();else if(a==='exppdf')U.toast('O PDF é gerado no sistema final. Aqui, use a exportação para planilha.');
  }
});
document.addEventListener('input',function(e){
  if(!noEl(e))return;
  if(e.target.id==='ia-q'){q=e.target.value;pintar()}
  if(e.target.id==='ia-n'){ext.n=Math.max(1,+e.target.value||1);var pos=e.target.selectionStart;pintar();var n=document.getElementById('ia-n');if(n){n.focus()}}
});
return {render:render};
})();
