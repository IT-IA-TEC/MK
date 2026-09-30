/* Tela Recebimentos: conferir o dinheiro que entrou e ligar a uma cobrança. Dados de exemplo. */
window.MKRecebimentos=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,PAGS=window.MK_PAG,el=null,pronto=false;
var EU='Marina',aba='conferir',q='',pag1=1,PG=25,fSem={per:'todos',min:'',max:''},fConf='todos',lanc=null,nid=1000;
var DB={cobs:[],pags:[],hist:[],fila:[],cred:{}};
var HOJE=new Date();
function R(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(s){return +(''+s).replace(/\./g,'').replace(',','.')||0}
function c100(v){return Math.round(v*100)}
function d2(n){return ('0'+n).slice(-2)}
function fdata(ts){var d=new Date(ts);return d2(d.getDate())+'/'+d2(d.getMonth()+1)+'/'+d.getFullYear()}
function fhora(ts){var d=new Date(ts);return fdata(ts)+' '+d2(d.getHours())+':'+d2(d.getMinutes())}
function so(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function nums(s){return (''+s).replace(/\D/g,'')}
function pagador(id){return PAGS.filter(function(p){return p.id===id})[0]}
function lcg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
/* ---------- cobranças ---------- */
function saldo(c){return c.lojas.reduce(function(a,l){return a+Math.round((l.valor-l.pago)*100)},0)/100}
function total(c){return c.lojas.reduce(function(a,l){return a+Math.round(l.valor*100)},0)/100}
function pagoDe(c){return total(c)-saldo(c)}
function statusC(c){var s=saldo(c);return s<=.02?['Quitada','vd']:pagoDe(c)>.005?['Parcial','at']:['Em aberto','ok']}
function abertas(pid){return DB.cobs.filter(function(c){return c.pid===pid&&saldo(c)>.02}).sort(function(a,b){return a.ord-b.ord})}
function dataOff(off){var d=new Date(HOJE.getFullYear(),HOJE.getMonth(),HOJE.getDate()+off);return d2(d.getDate())+'/'+d2(d.getMonth()+1)+'/'+d.getFullYear()}
function rotDe(off){var d=new Date(HOJE.getFullYear(),HOJE.getMonth(),HOJE.getDate()+off);d.setMonth(d.getMonth()-1);return d2(d.getMonth()+1)+'/'+d.getFullYear()}
function mkCob(p,rot,ord,venc,acordo){
  var ls=acordo?[{n:'Parcela do acordo',gs:'',valor:Math.round((1800+p.id*730)/3*100)/100,pago:0}]:p.lojas.map(function(l,i){return {n:l.n,gs:l.gs,valor:Math.round((1800+p.id*730)*(1+((i*3+p.id)%5)/10)*100)/100,pago:0}});
  var c={id:'c'+(nid++),pid:p.id,rot:rot,ord:ord,venc:venc,lojas:ls,acordo:!!acordo};DB.cobs.push(c);return c;
}
function alocar(c,v){
  var sd=c.lojas.map(function(l){return Math.max(0,Math.round((l.valor-l.pago)*100))}),tot=sd.reduce(function(a,b){return a+b},0),cents=Math.min(c100(v),tot),out=[];
  if(cents>=tot-2){c.lojas.forEach(function(l,i){if(sd[i]>0)out.push({cob:c,i:i,v:sd[i]/100})});return out}
  var sh=sd.map(function(s){return Math.floor(cents*s/tot)}),rem=cents-sh.reduce(function(a,b){return a+b},0),ult=-1;
  sd.forEach(function(s,i){if(s>0)ult=i});sh[ult]+=rem;
  sh.forEach(function(s,i){if(s>0)out.push({cob:c,i:i,v:s/100})});return out;
}
/* plano automático para um valor: [alocações], crédito */
function plano(pid,v,alvo,escolha){
  var ab=abertas(pid),tipo='credito',aloc=[],cred=v,info='';
  if(!ab.length)return {aloc:[],cred:v,tipo:'credito',sobra:v,alvo:null,prox:null};
  var c0=alvo?DB.cobs.filter(function(c){return c.id===alvo})[0]:ab[0],s=saldo(c0);
  if(Math.abs(v-s)<=.02){aloc=alocar(c0,s);cred=0;tipo='igual'}
  else if(v<s){aloc=alocar(c0,v);cred=0;tipo='menor'}
  else{aloc=alocar(c0,s);var sobra=Math.round((v-s)*100)/100;tipo='maior';cred=sobra;
    var outras=ab.filter(function(c){return c!==c0});
    if(escolha==='proxima'&&outras.length){var r=sobra;outras.forEach(function(c){if(r>.005){var pg=Math.min(r,saldo(c));aloc=aloc.concat(alocar(c,pg));r=Math.round((r-pg)*100)/100}});cred=r}}
  return {aloc:aloc,cred:cred,tipo:tipo,sobra:tipo==='maior'?Math.round((v-s)*100)/100:0,alvo:c0,prox:ab.filter(function(c){return c!==c0})[0]||null};
}
function rotulos(al){var m={};al.forEach(function(a){m[a.cob.rot]=1});return Object.keys(m).join(', ')}
/* ---------- dados iniciais ---------- */
function iniciar(){
  if(pronto)return;pronto=true;var r=lcg(77),hojeTs=HOJE.getTime();
  function ts(dias,h,m){var d=new Date(HOJE.getFullYear(),HOJE.getMonth(),HOJE.getDate()-dias,h||10,m||0);return d.getTime()}
  PAGS.forEach(function(p){
    if(p.fin==='atraso'){var k=1+Math.floor((p.dias||1)/31);for(var i=0;i<k;i++){var off=-(p.dias||1)+31*i;mkCob(p,rotDe(off),Date.now()+off,dataOff(off),false)}return}
    var c7=mkCob(p,'07/2026',7,'20/08/2026',false);
    c7.lojas.forEach(function(l){l.pago=l.valor});pagar(p.id,total(c7),c7,ts(40+p.id,9+p.id%6,10+p.id),'Pix','Itaú','E'+(7000+p.id*13));
    if(p.fin==='acordo'){mkCob(p,'Parcela 2 do acordo',8,dataOff(p.id===9?-5:p.id===4?0:5),true);mkCob(p,'Parcela 3 do acordo',9,dataOff(p.id===9?26:p.id===4?31:36),true)}
    else{var c8=mkCob(p,'08/2026',8,p.fin==='avencer'?dataOff(5):'20/09/2026',false);
      if(p.fin==='dia'){c8.lojas.forEach(function(l){l.pago=l.valor});var dh=p.id===5?0:(p.id%3+3);pagar(p.id,total(c8),c8,ts(dh,9+p.id%5,20+p.id),'Pix','Itaú','E'+(9000+p.id*17))}}
  });
  function pagar(pid,v,c,t,forma,banco,tid){var al=c.lojas.map(function(l,i){return {cob:c,i:i,v:l.valor}});DB.pags.push({id:nid++,pid:pid,valor:v,ts:t,forma:forma,banco:banco,tid:tid,aloc:al,estado:'ligado'});DB.hist.push({id:nid++,pgId:nid-2,pid:pid,valor:v,ts:t+3600000,quem:['Marina','Carlos','Rafael','Juliana'][pid%4],comp:c.rot,tipo:'baixa'})}
  /* pagamentos de hoje e do mês (para os contadores) */
  var extra=[[5,3450.8,0,11,32],[8,1980,0,14,5],[12,7210.4,1,9,40],[7,2640,2,15,10],[10,1520,4,16,20]];
  extra.forEach(function(x){DB.pags.push({id:nid++,pid:x[0],valor:x[1],ts:ts(x[2],x[3],x[4]),forma:'Pix',banco:'Itaú',tid:'E'+(5000+x[0]),aloc:[],estado:'ligado'});DB.hist.push({id:nid++,pgId:nid-2,pid:x[0],valor:x[1],ts:ts(x[2],x[3]+1,x[4]),quem:'Marina',comp:'09/2026 (antecipado)',tipo:'baixa'})});
  /* fila de comprovantes */
  var vc=function(pid,f){var p=plano(pid,0,null,'');var ab=abertas(pid)[0];return ab?f(saldo(ab)):100};
  var VHSS='Pix da VHSS · Itaú 4471';
  var fila=[[2,1,0,0,'comprovante-pix-2.pdf',function(s){return s},0,0,9,12],[6,1,0,0,'comprovante-6.jpg',function(s){return Math.round(s/2*100)/100},0,0,10,20],[13,1,0,0,'pix-aline.pdf',function(s){return Math.round((s+540)*100)/100},0,0,8,45],[11,1,0,1,'transferencia-alexandre.jpg',function(s){return Math.round(s/3*100)/100},1,0,9,55],[4,1,0,0,'parcela-adriele.jpg',function(s){return s},0,0,11,20],[9,1,0,0,'boleto-parcela3.pdf',function(s){return s},0,1,9,30],[8,1,0,0,'pix-alana.pdf',function(){return 1500},0,0,7,58],[10,1,0,0,'pix-alessandra.pdf',function(s){return s},0,0,10,3]];
  fila.forEach(function(x,i){
    var p=pagador(x[0]);var ab=abertas(x[0])[0];var v=x[5](ab?saldo(ab):0);
    var f={id:nid++,pid:x[0],ts:ts(0,x[8],x[9]),arq:x[4],valor:v,pagou:i===3?'ALEXANDRE T. GOMES (conta pessoal)':p.nome,ok:!x[6],conta:x[6]?'Conta de terceiro · Nubank 8812':VHSS,dup:!!x[7],alvo:null,tid:'E'+(3000+i*7)};
    if(x[7]){DB.pags.push({id:nid++,pid:x[0],valor:v,ts:f.ts-60000,forma:'Pix',banco:'Itaú',tid:f.tid+'x',aloc:[],estado:'ligado'});DB.hist.push({id:nid++,pgId:nid-2,pid:x[0],valor:v,ts:f.ts,quem:'Carlos',comp:'Parcela 2 do acordo',tipo:'baixa'})}
    DB.fila.push(f);
  });
  /* pagamentos sem cobrança ligada: 1.693 */
  var nomes=['JOSE A. SOUZA','MARIA H. LIMA','CARLOS E. PIRES','ANA C. BORGES','PEDRO L. FARIAS','LUCIANA M. ROCHA','RAFAEL D. CUNHA','FERNANDA S. DIAS'];
  for(var i=0;i<1693;i++){
    var pid=r()<.72?PAGS[Math.floor(r()*PAGS.length)].id:null,dias=Math.floor(r()*540),v=Math.round((150+r()*4200)*100)/100;
    var sug=null;if(pid&&r()<.6){var rot=['06/2026','05/2026','04/2026','03/2026','02/2026'][Math.floor(r()*5)];sug={rot:rot,valor:v}}
    DB.pags.push({id:nid++,pid:pid,nome:pid?null:'PIX RECEBIDO '+nomes[Math.floor(r()*nomes.length)],valor:v,ts:ts(dias,8+Math.floor(r()*10),Math.floor(r()*60)),forma:r()<.8?'Pix':'Transferência',banco:'Itaú',tid:'E'+(100000+i),aloc:[],estado:'pendente',sug:sug});
  }
  DB.pags.sort(function(a,b){return b.ts-a.ts});DB.hist.sort(function(a,b){return b.ts-a.ts});
}
/* ---------- efeitos ---------- */
function aplicar(pid,valor,al,cred,extra){
  var p=pagador(pid),quitou=[];
  al.forEach(function(a){a.cob.lojas[a.i].pago=Math.round((a.cob.lojas[a.i].pago+a.v)*100)/100});
  var alfa=al.map(function(a){return {cob:a.cob,i:a.i,v:a.v}});
  var pg={id:nid++,pid:pid,valor:valor,ts:extra.ts||Date.now(),forma:extra.forma||'Pix',banco:extra.banco||'Itaú',tid:extra.tid||'',aloc:alfa,estado:alfa.length?'ligado':'credito',obs:extra.obs||''};
  DB.pags.unshift(pg);
  if(cred>.004)DB.cred[pid]=Math.round(((DB.cred[pid]||0)+cred)*100)/100;
  DB.hist.unshift({id:nid++,pgId:pg.id,pid:pid,valor:valor,ts:Date.now(),quem:EU,comp:alfa.length?rotulos(al)+(cred>.004?' + crédito '+R(cred):''):'Crédito do pagador',tipo:extra.tipo||(alfa.length?'baixa':'credito')});
  var cobs={};al.forEach(function(a){cobs[a.cob.id]=a.cob});Object.keys(cobs).forEach(function(k){if(saldo(cobs[k])<=.02)quitou.push(cobs[k])});
  var msg=[];
  if(quitou.length){msg.push('Cobrança '+quitou.map(function(c){return c.rot}).join(', ')+' quitada. A fila do Dashboard foi avisada.');
    var bl=p.lojas.filter(function(l){return l.st==='bloqueada'});
    if(bl.length&&!abertas(pid).length&&window.MK_DASH){var d=window.MK_DASH.pend.desbloquear;if(!d.some(function(x){return x.p===p.nome})){d.push({p:p.nome,l:bl.map(function(l){return l.n}).join(', '),q:'Quitou em '+fdata(Date.now()),v:valor});msg.push('Pendência de desbloqueio criada (loja bloqueada).')}}}
  return {pg:pg,msg:msg.join(' ')};
}
function tirarDaFila(f){DB.fila=DB.fila.filter(function(x){return x!==f})}
/* ---------- consultas ---------- */
function pgTotalMes(){var d=HOJE,s=0;DB.pags.forEach(function(p){if(p.estado==='ligado'||p.estado==='credito'||p.estado==='pendente'){var t=new Date(p.ts);if(t.getMonth()===d.getMonth()&&t.getFullYear()===d.getFullYear())s+=p.valor}});return s}
function pgTotalHoje(){var d=fdata(HOJE.getTime()),s=0;DB.pags.forEach(function(p){if((p.estado==='ligado'||p.estado==='credito'||p.estado==='pendente')&&fdata(p.ts)===d)s+=p.valor});return s}
function semLista(){return DB.pags.filter(function(p){return p.estado==='pendente'})}
function casa(txt,pid,valor,gsList,fone,extraNome){
  var t=so(txt.trim());if(!t)return true;var n=nums(txt),p=pid?pagador(pid):null;
  if(p&&so(p.nome).indexOf(t)>-1)return true;if(extraNome&&so(extraNome).indexOf(t)>-1)return true;
  if(n&&p&&nums(p.fone).indexOf(n)>-1)return true;
  if(n&&(gsList||[]).some(function(g){return g.indexOf(n)>-1}))return true;
  if(n.length>=3&&String(c100(valor)).indexOf(n)>-1)return true;
  return p?p.lojas.some(function(l){return so(l.n).indexOf(t)>-1}):false;
}
function gsDe(pid){var p=pid&&pagador(pid);return p?p.lojas.map(function(l){return l.gs}):[]}
function filaFiltrada(){return DB.fila.filter(function(f){return casa(q,f.pid,f.valor,gsDe(f.pid))})}
function semFiltrada(){
  var lim=fSem.per==='todos'?0:{30:30,90:90,180:180,365:365}[fSem.per],min=fSem.min?num(fSem.min):null,max=fSem.max?num(fSem.max):null,corte=lim?Date.now()-lim*86400000:0;
  return semLista().filter(function(p){return p.ts>=corte&&(min===null||p.valor>=min)&&(max===null||p.valor<=max)&&casa(q,p.pid,p.valor,gsDe(p.pid),'',p.nome)});
}
function histFiltrada(){return DB.hist.filter(function(h){return (fConf==='todos'||(fConf==='baixa'&&(h.tipo==='baixa'||h.tipo==='lancado'))||(fConf==='outros'&&['credito','devolvido','descartado','rejeitado'].indexOf(h.tipo)>-1)||(fConf==='desfeita'&&h.tipo==='desfeita'))&&casa(q,h.pid,h.valor,gsDe(h.pid))})}
/* ---------- desenho ---------- */
function nomeDe(pid,fb){var p=pid&&pagador(pid);return p?p.nome:(fb||'Pagador não identificado')}
function chipF(t,c){return '<span class="fs '+c+'">'+t+'</span>'}
function topo(){
  var fila=DB.fila.length,sem=semLista().length;
  return '<div class="pag-topo"><div><h1>Recebimentos</h1><p class="sub">Tudo que chega passa por aqui até estar ligado a uma cobrança.</p></div></div>'+
   '<div class="fe-cont"><div class="fe-k"><small>Comprovantes a conferir</small><b class="'+(fila?'pend':'')+'">'+fila+'</b></div><div class="fe-k"><small>Pagamentos sem cobrança ligada</small><b class="'+(sem?'pend':'')+'">'+sem.toLocaleString('pt-BR')+'</b></div><div class="fe-k"><small>Recebido hoje</small><b>'+R(pgTotalHoje())+'</b></div><div class="fe-k"><small>Recebido no mês</small><b>'+R(pgTotalMes())+'</b></div></div>'+
   '<div class="rc-barra"><label class="busca-p"><span class="sr">Buscar</span>'+ic('search')+'<input id="rc-q" type="search" placeholder="Buscar por nome, telefone, GS ou valor" value="'+esc(q)+'"></label></div>'+
   '<div class="rc-abas" role="tablist">'+[['conferir','A conferir',fila],['sem','Sem cobrança ligada',sem],['conf','Conferidos',DB.hist.length],['lancar','Lançar pagamento',null]].map(function(a){return '<button role="tab" class="rc-aba" data-aba="'+a[0]+'" aria-selected="'+(aba===a[0])+'">'+a[1]+(a[2]!==null?' <b>'+a[2].toLocaleString('pt-BR')+'</b>':'')+'</button>'}).join('')+'</div>';
}
function sugestao(f){
  var pl=plano(f.pid,f.valor,f.alvo,'');
  if(!pl.alvo)return '<div class="rc-sug"><b>Sem cobrança em aberto</b><small>O valor vira crédito do pagador</small></div>';
  var s=saldo(pl.alvo),t=pl.tipo==='igual'?chipF('Igual ao em aberto','vd'):pl.tipo==='menor'?chipF('Parcial · resta '+R(s-f.valor),'at'):chipF('Sobra de '+R(pl.sobra),'ok');
  return '<div class="rc-sug"><b>'+esc(pl.alvo.rot)+'</b><small>Em aberto '+R(s)+'</small>'+t+'</div>';
}
function abaConferir(){
  var l=filaFiltrada();
  return '<div class="tab-cartao"><table class="tab-fe tab-rc"><colgroup><col style="width:9%"><col style="width:20%"><col style="width:11%"><col style="width:20%"><col style="width:20%"><col style="width:20%"></colgroup><thead><tr><th>Data</th><th>Pagador</th><th class="n">Valor lido</th><th>Destino</th><th>Competência sugerida</th><th>Ação</th></tr></thead><tbody>'+
   (l.length?l.map(function(f){
     var al=(!f.ok?'<span class="fs gr">Conta de destino diferente</span>':'')+(f.dup?' <span class="fs at">Possível duplicado</span>':'');
     return '<tr class="'+(!f.ok?'rc-alerta':'')+'"><td data-rot="Data"><div>'+fdata(f.ts)+'</div><small class="nt">'+d2(new Date(f.ts).getHours())+':'+d2(new Date(f.ts).getMinutes())+'</small></td>'+
      '<td data-rot="Pagador"><div class="lj-n">'+esc(nomeDe(f.pid))+'</div><div class="nt">Pago por '+esc(f.pagou)+'</div><div class="nt mono">'+esc(f.arq)+'</div></td>'+
      '<td data-rot="Valor lido" class="n v40">'+R(f.valor)+'</td>'+
      '<td data-rot="Destino"><div>'+esc(f.conta)+'</div>'+(f.ok?chipF('Pix da VHSS','vd'):'')+(al?'<div class="rc-al">'+al+'</div>':'')+'</td>'+
      '<td data-rot="Competência sugerida">'+sugestao(f)+'</td>'+
      '<td data-rot="Ação" class="rc-ac"><button class="btn'+(f.ok?'':' esc')+'" data-rc="'+(f.ok?'confirmar':'decidir')+'" data-f="'+f.id+'" style="width:auto;padding:0 14px">'+(f.ok?'Confirmar':'Registrar decisão')+'</button><button class="btn sec" data-rc="mais" data-f="'+f.id+'" style="width:auto;padding:0 12px" aria-haspopup="menu">Mais ações</button></td></tr>';
   }).join(''):'<tr><td colspan="6" class="vazio-t"><b>'+(DB.fila.length?'Nenhum comprovante nesta busca.':'Nada para conferir.')+'</b><br>'+(DB.fila.length?'Limpe a busca para ver a fila.':'Todos os comprovantes já foram baixados.')+'</td></tr>')+'</tbody></table></div>';
}
function abaSem(){
  var l=semFiltrada(),tot=l.length,pgs=Math.max(1,Math.ceil(tot/PG));if(pag1>pgs)pag1=pgs;var ini=(pag1-1)*PG,vis=l.slice(ini,ini+PG);
  return '<div class="fe-barra"><div class="rc-filtros"><label class="sel-p"><span>Período</span><select class="sel" id="sm-per">'+[['todos','Todo o período'],['30','Últimos 30 dias'],['90','Últimos 90 dias'],['180','Últimos 6 meses'],['365','Últimos 12 meses']].map(function(o){return '<option value="'+o[0]+'"'+(fSem.per===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></label>'+
   '<label class="sel-p"><span>Valor mínimo</span><input class="sel" id="sm-min" inputmode="decimal" placeholder="0,00" value="'+esc(fSem.min)+'"></label><label class="sel-p"><span>Valor máximo</span><input class="sel" id="sm-max" inputmode="decimal" placeholder="sem limite" value="'+esc(fSem.max)+'"></label></div><div class="fe-info"><b>'+tot.toLocaleString('pt-BR')+'</b> pagamentos nesta busca</div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-rc"><colgroup><col style="width:9%"><col style="width:20%"><col style="width:10%"><col style="width:10%"><col style="width:23%"><col style="width:28%"></colgroup><thead><tr><th>Data</th><th>Pagador</th><th class="n">Valor</th><th>Forma</th><th>Cobrança provável</th><th>Ação</th></tr></thead><tbody>'+
   (vis.length?vis.map(function(p){return '<tr><td data-rot="Data">'+fdata(p.ts)+'</td><td data-rot="Pagador"><div class="lj-n">'+esc(nomeDe(p.pid,p.nome))+'</div>'+(p.pid?'':'<div class="nt">Sem pagador identificado</div>')+'</td><td data-rot="Valor" class="n v40">'+R(p.valor)+'</td><td data-rot="Forma">'+esc(p.forma)+'</td>'+
     '<td data-rot="Cobrança provável">'+(p.sug?'<div class="rc-sug"><b>'+esc(p.sug.rot)+'</b><small>Valor e data batem</small></div>':'<span class="nt">Nenhuma sugestão</span>')+'</td>'+
     '<td data-rot="Ação" class="rc-ac"><button class="btn" data-rc="ligar" data-p="'+p.id+'" style="width:auto;padding:0 12px">Ligar a uma cobrança</button><button class="btn sec" data-rc="mais2" data-p="'+p.id+'" style="width:auto;padding:0 12px" aria-haspopup="menu">Mais ações</button></td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t"><b>Nenhum pagamento nesta busca.</b><br>Troque o período, o valor ou a busca.</td></tr>')+'</tbody></table></div>'+
   '<div class="rc-pag"><button class="btn sec" data-pg="-1" style="width:auto;padding:0 14px"'+(pag1<=1?' disabled':'')+'>Anterior</button><span>Página '+pag1+' de '+pgs.toLocaleString('pt-BR')+'</span><button class="btn sec" data-pg="1" style="width:auto;padding:0 14px"'+(pag1>=pgs?' disabled':'')+'>Próxima</button></div>';
}
var TIPO={baixa:['Baixado','vd'],lancado:['Lançado','vd'],credito:['Crédito','ok'],devolvido:['Devolvido','cn'],descartado:['Descartado','cn'],rejeitado:['Rejeitado','gr'],desfeita:['Baixa desfeita','at']};
function abaConf(){
  var l=histFiltrada(),vis=l.slice(0,60);
  return '<div class="fe-barra"><div class="fe-filtros">'+[['todos','Todos'],['baixa','Baixados'],['outros','Crédito, devolvidos, descartados e rejeitados'],['desfeita','Baixas desfeitas']].map(function(x){return '<button class="chip-f" data-fconf="'+x[0]+'" aria-pressed="'+(fConf===x[0])+'">'+x[1]+'</button>'}).join('')+'</div><button class="btn sec" data-rc="exportar" style="width:auto;padding:0 14px">Exportar para planilha</button></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-rc"><colgroup><col style="width:12%"><col style="width:22%"><col style="width:11%"><col style="width:23%"><col style="width:11%"><col style="width:11%"><col style="width:10%"></colgroup><thead><tr><th>Quando</th><th>Pagador</th><th class="n">Valor</th><th>Competência</th><th>Conferido por</th><th>Situação</th><th>Ação</th></tr></thead><tbody>'+
   (vis.length?vis.map(function(h){var t=TIPO[h.tipo];return '<tr><td data-rot="Quando">'+fhora(h.ts)+'</td><td data-rot="Pagador"><div class="lj-n">'+esc(nomeDe(h.pid))+'</div></td><td data-rot="Valor" class="n v40">'+R(h.valor)+'</td><td data-rot="Competência" class="rp">'+esc(h.comp)+(h.motivo?'<div class="nt">Motivo: '+esc(h.motivo)+'</div>':'')+'</td><td data-rot="Conferido por">'+esc(h.quem)+'</td><td data-rot="Situação">'+chipF(t[0],t[1])+'</td><td data-rot="Ação" class="rc-ac">'+((h.tipo==='baixa'||h.tipo==='lancado')?'<button class="btn sec" data-rc="desfazer" data-h="'+h.id+'" style="width:auto;padding:0 12px">Desfazer baixa</button>':'')+'</td></tr>'}).join(''):'<tr><td colspan="7" class="vazio-t"><b>Nada encontrado.</b></td></tr>')+'</tbody></table></div>'+(l.length>60?'<div class="nt">Mostrando 60 de '+l.length+' registros. Use a busca ou o filtro para achar um específico.</div>':'');
}
function abaLancar(){
  var pid=lanc&&lanc.pid,ab=pid?abertas(pid):[];
  var sel=lanc?lanc.sel:{},valor=lanc?num(lanc.valor):0;
  var antes=0;ab.forEach(function(c){if(sel[c.id]!==false)antes+=saldo(c)});antes=Math.round(antes*100)/100;
  var apl=Math.min(valor,antes),depois=Math.round((antes-apl)*100)/100,sobra=Math.round((valor-apl)*100)/100;
  var L=lanc||{valor:'',data:'',forma:'',banco:'',tid:'',obs:''};
  return '<div class="lc-grade"><form id="lc-form" class="lc-form" novalidate><div class="lc-tit">Dados do pagamento</div><div class="f-grade">'+
   '<div class="campo"><label for="lc-pid">Pagador <i class="obr">*</i></label><select class="sel" id="lc-pid"><option value="">Selecione</option>'+PAGS.map(function(p){return '<option value="'+p.id+'"'+(p.id===pid?' selected':'')+'>'+esc(p.nome)+'</option>'}).join('')+'</select><small class="erro" id="lc-pid-e" hidden></small></div>'+
   '<div class="campo"><label for="lc-valor">Valor <i class="obr">*</i></label><input id="lc-valor" inputmode="decimal" placeholder="0,00" value="'+esc(L.valor)+'"><small class="erro" id="lc-valor-e" hidden></small></div>'+
   '<div class="campo"><label for="lc-data">Data do pagamento <i class="obr">*</i></label><input id="lc-data" type="date" value="'+esc(L.data)+'"><small class="erro" id="lc-data-e" hidden></small></div>'+
   '<div class="campo"><label for="lc-forma">Forma <i class="obr">*</i></label><select class="sel" id="lc-forma"><option value="">Selecione</option>'+['Pix','Transferência','Outro'].map(function(o){return '<option'+(L.forma===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select><small class="erro" id="lc-forma-e" hidden></small></div>'+
   '<div class="campo"><label for="lc-banco">Banco</label><input id="lc-banco" value="'+esc(L.banco)+'" placeholder="Banco de origem"></div><div class="campo"><label for="lc-tid">ID da transação</label><input id="lc-tid" value="'+esc(L.tid)+'" placeholder="Código do comprovante"></div></div>'+
   '<div class="campo" style="margin-top:12px"><label for="lc-obs">Observação</label><textarea id="lc-obs" class="cb-area" rows="2">'+esc(L.obs)+'</textarea></div>'+
   '<div class="campo" style="margin-top:12px"><label for="lc-arq">Anexar comprovante</label><input id="lc-arq" type="file" accept=".pdf,.png,.jpg,.jpeg"></div>'+
   '<div class="lc-pe"><button type="button" class="btn sec" data-rc="limpar" style="width:auto;padding:0 16px">Limpar</button><button type="submit" class="btn" style="width:auto;padding:0 18px">Gravar pagamento</button></div></form>'+
   '<div class="lc-lado"><div class="lc-tit">Lojas e competências em aberto</div>'+(pid?(ab.length?ab.map(function(c){return '<label class="lc-cob"><input type="checkbox" data-cob="'+c.id+'"'+(sel[c.id]!==false?' checked':'')+'><span><b>'+esc(c.rot)+'</b><small>'+c.lojas.map(function(l){return esc(l.n)}).join(' · ')+'</small></span><b class="n">'+R(saldo(c))+'</b></label>'}).join(''):'<div class="fe-vazio">Este pagador não tem cobrança em aberto. O valor vira crédito.</div>'):'<div class="fe-vazio">Escolha o pagador para ver o que está em aberto.</div>')+
   '<div class="lc-saldo"><div><small>Saldo antes de gravar</small><b>'+R(antes)+'</b></div><div><small>Saldo depois de gravar</small><b class="'+(depois?'pend':'')+'">'+R(depois)+'</b></div></div>'+(sobra>.004&&valor?'<div class="fe-aviso"><span>Sobra de '+R(sobra)+'. Ela fica como crédito do pagador.</span></div>':'')+'</div></div>';
}
function render(alvo){
  if(alvo)el=alvo;iniciar();
  el.innerHTML='<div class="dash fe-w rc-w">'+topo()+'<section class="bloco"><div class="fe-painel" id="rc-corpo">'+corpo()+'</div></section><div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  U.icones();
}
function corpo(){return aba==='conferir'?abaConferir():aba==='sem'?abaSem():aba==='conf'?abaConf():abaLancar()}
function pintar(){var c=document.getElementById('rc-corpo');if(c){c.innerHTML=corpo();U.icones()}}
function refaz(){var y=window.scrollY;render();window.scrollTo(0,y)}
/* ---------- ações ---------- */
function fila1(id){return DB.fila.filter(function(f){return f.id===id})[0]}
function pg1(id){return DB.pags.filter(function(p){return p.id===id})[0]}
function confirmarBaixa(f,pl,extra){
  var r=aplicar(f.pid,f.valor,pl.aloc,pl.cred,{ts:Date.now(),tid:f.tid,forma:'Pix'});tirarDaFila(f);refaz();
  U.toast('Baixa feita.'+(r.msg?' '+r.msg:'')+(pl.cred>.004?' Crédito de '+R(pl.cred)+' guardado.':''));
}
function confirmar(f){
  function seguir(){
    var pl=plano(f.pid,f.valor,f.alvo,'');
    if(!pl.alvo){U.modal({titulo:'Sem cobrança em aberto',ok:'Guardar como crédito',html:'<p><b>'+esc(nomeDe(f.pid))+'</b> não tem cobrança em aberto. O valor de <b>'+R(f.valor)+'</b> fica como crédito do pagador.</p>',onOk:function(){confirmarBaixa(f,pl)}});return}
    if(pl.tipo==='igual'){confirmarBaixa(f,pl);return}
    if(pl.tipo==='menor'){U.modal({titulo:'Pagamento parcial',ok:'Baixar como parcial',html:'<p>O valor lido é menor que o em aberto de <b>'+esc(pl.alvo.rot)+'</b>.</p><div class="lc-saldo" style="margin-top:12px"><div><small>Em aberto</small><b>'+R(saldo(pl.alvo))+'</b></div><div><small>Pago agora</small><b>'+R(f.valor)+'</b></div><div><small>Saldo restante</small><b class="pend">'+R(saldo(pl.alvo)-f.valor)+'</b></div></div><p class="dica-m" style="margin-top:10px">A cobrança continua em aberto com o saldo restante.</p>',onOk:function(){confirmarBaixa(f,pl)}});return}
    var tem=!!pl.prox;
    U.modal({titulo:'O valor é maior que o em aberto',ok:'Confirmar baixa',html:'<p>Sobra de <b>'+R(pl.sobra)+'</b> depois de quitar <b>'+esc(pl.alvo.rot)+'</b>. O que fazer com a sobra?</p><div class="lc-rad"><label><input type="radio" name="sb" value="proxima"'+(tem?' checked':' disabled')+'><span>Levar para a próxima competência mais antiga em aberto'+(tem?' ('+esc(pl.prox.rot)+', '+R(saldo(pl.prox))+')':' (não há outra em aberto)')+'</span></label><label><input type="radio" name="sb" value="credito"'+(tem?'':' checked')+'><span>Guardar como crédito do pagador</span></label></div>',
      onOk:function(m){var e=m.querySelector('input[name=sb]:checked').value,p2=plano(f.pid,f.valor,f.alvo,e);confirmarBaixa(f,p2)}});
  }
  if(f.dup)U.modal({titulo:'Possível comprovante duplicado',ok:'Baixar mesmo assim',perigo:true,html:'<p>Já existe pagamento com o mesmo valor, data e pagador (ou a mesma transação). Baixar de novo pode contar o dinheiro duas vezes.</p><p class="dica-m" style="margin-top:8px">Se for outro pagamento de verdade, continue. Se for repetido, rejeite este comprovante.</p>',onOk:function(){setTimeout(seguir,230)}});
  else seguir();
}
function decidir(f){
  U.modal({titulo:'Conta de destino diferente',ok:'Registrar decisão',html:'<p>O comprovante foi pago para <b>'+esc(f.conta)+'</b>, que não é o Pix da VHSS. Ele não pode ser baixado sem uma decisão registrada.</p><div class="lc-rad"><label><input type="radio" name="dc" value="aceitar"><span>Aceitar mesmo assim (conta de terceiro autorizada)</span></label><label><input type="radio" name="dc" value="rejeitar" checked><span>Rejeitar o comprovante</span></label></div><div class="campo" style="margin-top:10px"><label for="dc-m">Motivo <i class="obr">*</i></label><textarea id="dc-m" class="cb-area" rows="3"></textarea><small class="erro" id="dc-e" hidden>Informe o motivo da decisão.</small></div>',
    onOk:function(m){var mo=m.querySelector('#dc-m').value.trim(),d=m.querySelector('input[name=dc]:checked').value;if(!mo){m.querySelector('#dc-e').hidden=false;return false}
      if(d==='rejeitar'){DB.hist.unshift({id:nid++,pgId:null,pid:f.pid,valor:f.valor,ts:Date.now(),quem:EU,comp:'Comprovante '+f.arq,tipo:'rejeitado',motivo:'Conta de destino diferente. '+mo});tirarDaFila(f);refaz();U.toast('Comprovante rejeitado.')}
      else{f.ok=true;f.aceito=mo;f.conta+=' · aceito: '+mo;refaz();U.toast('Decisão registrada. Agora o comprovante pode ser confirmado.')}}});
}
function alterar(f){
  var ab=abertas(f.pid);if(!ab.length){U.toast('Este pagador não tem outra cobrança em aberto.');return}
  U.modal({titulo:'Alterar competência',ok:'Usar esta competência',html:'<div class="campo"><label for="al-c">Baixar em</label><select class="sel" id="al-c">'+ab.map(function(c){return '<option value="'+c.id+'"'+(f.alvo===c.id?' selected':'')+'>'+esc(c.rot)+' · em aberto '+R(saldo(c))+'</option>'}).join('')+'</select></div>',onOk:function(m){f.alvo=m.querySelector('#al-c').value;refaz();U.toast('Competência alterada.')}});
}
function dividir(f){
  var ab=abertas(f.pid);
  if(!ab.length){U.toast('Sem cobrança em aberto para dividir. O valor pode ser guardado como crédito.');return}
  var linhas=[];ab.forEach(function(c){c.lojas.forEach(function(l,i){if(l.valor-l.pago>.004)linhas.push({c:c,i:i,l:l})})});
  var m=U.modal({titulo:'Dividir entre competências ou lojas',ok:'Baixar assim',html:'<p class="dica-m">Valor lido: <b>'+R(f.valor)+'</b>. Distribua entre as linhas até fechar o valor.</p><div class="dv-lista">'+linhas.map(function(x,k){return '<div class="dv-lin"><div style="min-width:0"><b>'+esc(x.c.rot)+'</b><small>'+esc(x.l.n)+' · em aberto '+R(x.l.valor-x.l.pago)+'</small></div><input class="sel" data-dv="'+k+'" inputmode="decimal" placeholder="0,00" aria-label="Valor para '+esc(x.l.n)+' em '+esc(x.c.rot)+'"></div>'}).join('')+'</div><div class="lc-saldo" style="margin-top:12px"><div><small>Distribuído</small><b id="dv-s">R$ 0,00</b></div><div><small>Falta distribuir</small><b id="dv-f" class="pend">'+R(f.valor)+'</b></div></div><small class="erro" id="dv-e" hidden></small>',
    onOk:function(mm){
      var al=[],s=0,ruim=false;mm.querySelectorAll('[data-dv]').forEach(function(i){var v=num(i.value);if(v>0){var x=linhas[+i.dataset.dv];if(v>x.l.valor-x.l.pago+.005)ruim=true;al.push({cob:x.c,i:x.i,v:Math.round(v*100)/100});s+=v}});
      var e=mm.querySelector('#dv-e');
      if(ruim){e.textContent='Um dos valores passa do que está em aberto na linha.';e.hidden=false;return false}
      if(Math.abs(s-f.valor)>.02){e.textContent='O total distribuído precisa ser igual ao valor lido ('+R(f.valor)+').';e.hidden=false;return false}
      confirmarBaixa(f,{aloc:al,cred:0,tipo:'dividido'})}});
  m.addEventListener('input',function(){var s=0;m.querySelectorAll('[data-dv]').forEach(function(i){s+=num(i.value)});m.querySelector('#dv-s').textContent=R(s);var fa=Math.round((f.valor-s)*100)/100;var b=m.querySelector('#dv-f');b.textContent=R(fa);b.className=Math.abs(fa)<=.02?'':'pend'});
}
function rejeitar(f){
  U.modal({titulo:'Rejeitar comprovante',ok:'Rejeitar',perigo:true,html:'<div class="campo"><label for="rj-t">Motivo <i class="obr">*</i></label><select class="sel" id="rj-t"><option>Comprovante ilegível</option><option>Valor não confere</option><option>Não é pagamento da VHSS</option><option>Duplicado</option><option>Outro motivo</option></select></div><div class="campo" style="margin-top:10px"><label for="rj-m">Detalhe</label><textarea id="rj-m" class="cb-area" rows="2"></textarea></div>',
    onOk:function(m){var mo=m.querySelector('#rj-t').value+(m.querySelector('#rj-m').value.trim()?'. '+m.querySelector('#rj-m').value.trim():'');DB.hist.unshift({id:nid++,pgId:null,pid:f.pid,valor:f.valor,ts:Date.now(),quem:EU,comp:'Comprovante '+f.arq,tipo:'rejeitado',motivo:mo});tirarDaFila(f);refaz();U.toast('Comprovante rejeitado. Nada foi apagado, ele fica em Conferidos.')}});
}
function ligar(p){
  var ab=p.pid?abertas(p.pid):[];
  var opts=(p.sug?'<option value="sug">Cobrança provável: '+esc(p.sug.rot)+' (histórico)</option>':'')+ab.map(function(c){return '<option value="'+c.id+'">'+esc(c.rot)+' · em aberto '+R(saldo(c))+'</option>'}).join('');
  if(!p.pid){U.toast('Este pagamento não tem pagador identificado. Escolha o pagador em “Lançar pagamento” ou marque como crédito.');return}
  if(!opts){U.toast('Este pagador não tem cobrança em aberto. Marque como crédito.');return}
  U.modal({titulo:'Ligar a uma cobrança',ok:'Ligar pagamento',html:'<p class="dica-m">Pagamento de <b>'+R(p.valor)+'</b> em '+fdata(p.ts)+' · '+esc(nomeDe(p.pid,p.nome))+'</p><div class="campo"><label for="lg-c">Cobrança</label><select class="sel" id="lg-c">'+opts+'</select></div>',
    onOk:function(m){var v=m.querySelector('#lg-c').value,txt,msg='';
      if(v==='sug'){p.estado='ligado';txt=p.sug.rot+' (histórico)'}
      else{var c=DB.cobs.filter(function(x){return x.id===v})[0],pay=Math.min(p.valor,saldo(c)),al=alocar(c,pay);al.forEach(function(a){a.cob.lojas[a.i].pago=Math.round((a.cob.lojas[a.i].pago+a.v)*100)/100});p.aloc=al;p.estado='ligado';txt=c.rot;
        var sob=Math.round((p.valor-pay)*100)/100;if(sob>.004){DB.cred[p.pid]=(DB.cred[p.pid]||0)+sob;txt+=' + crédito '+R(sob)}
        if(saldo(c)<=.02){msg=' Cobrança '+c.rot+' quitada. A fila do Dashboard foi avisada.'}}
      DB.hist.unshift({id:nid++,pgId:p.id,pid:p.pid,valor:p.valor,ts:Date.now(),quem:EU,comp:txt,tipo:'baixa'});refaz();U.toast('Pagamento ligado.'+msg)}});
}
function marcar(p,tipo){
  var t={credito:'Marcar como crédito',devolvido:'Marcar como devolvido ou estornado',descartado:'Descartar pagamento'}[tipo];
  U.modal({titulo:t,ok:tipo==='descartado'?'Descartar':'Confirmar',perigo:tipo==='descartado',html:'<p class="dica-m">'+R(p.valor)+' · '+fdata(p.ts)+' · '+esc(nomeDe(p.pid,p.nome))+'</p><div class="campo"><label for="mk-m">Motivo <i class="obr">*</i></label><textarea id="mk-m" class="cb-area" rows="3"></textarea><small class="erro" id="mk-e" hidden>Informe o motivo. Nada é apagado, tudo fica registrado.</small></div>',
    onOk:function(m){var mo=m.querySelector('#mk-m').value.trim();if(!mo){m.querySelector('#mk-e').hidden=false;return false}
      p.estado=tipo;if(tipo==='credito'&&p.pid)DB.cred[p.pid]=(DB.cred[p.pid]||0)+p.valor;
      DB.hist.unshift({id:nid++,pgId:p.id,pid:p.pid,valor:p.valor,ts:Date.now(),quem:EU,comp:tipo==='credito'?'Crédito do pagador':tipo==='devolvido'?'Devolvido ou estornado':'Descartado',tipo:tipo,motivo:mo});refaz();U.toast('Registrado.')}});
}
function desfazer(h){
  U.modal({titulo:'Desfazer baixa',ok:'Desfazer baixa',perigo:true,html:'<p>O pagamento de <b>'+R(h.valor)+'</b> de <b>'+esc(nomeDe(h.pid))+'</b> será desligado da cobrança <b>'+esc(h.comp)+'</b>. O pagamento não é apagado, ele volta para “Sem cobrança ligada”.</p><div class="campo" style="margin-top:10px"><label for="df-m">Motivo <i class="obr">*</i></label><textarea id="df-m" class="cb-area" rows="3"></textarea><small class="erro" id="df-e" hidden>Informe o motivo. Fica registrado com seu nome e a hora.</small></div>',
    onOk:function(m){var mo=m.querySelector('#df-m').value.trim();if(!mo){m.querySelector('#df-e').hidden=false;return false}
      var p=pg1(h.pgId);if(p){(p.aloc||[]).forEach(function(a){a.cob.lojas[a.i].pago=Math.max(0,Math.round((a.cob.lojas[a.i].pago-a.v)*100)/100)});p.aloc=[];p.estado='pendente';p.sug=null}
      h.tipo='desfeita';h.motivo=mo+' (desfeita por '+EU+' em '+fhora(Date.now())+')';refaz();U.toast('Baixa desfeita. O pagamento voltou para Sem cobrança ligada.')}});
}
function exportar(){
  var l=histFiltrada(),linhas=['Quando;Pagador;Valor;Competência;Conferido por;Situação;Motivo'].concat(l.map(function(h){return [fhora(h.ts),nomeDe(h.pid),String(h.valor).replace('.',','),h.comp,h.quem,TIPO[h.tipo][0],h.motivo||''].map(function(x){return '"'+String(x).replace(/"/g,'""')+'"'}).join(';')}));
  var csv=linhas.join('\n');
  var m=U.modal({titulo:'Exportar para planilha',ok:'Copiar tudo',cancel:'Fechar',html:'<p class="dica-m">'+l.length+' linhas em CSV, separadas por ponto e vírgula. Copie e cole no Excel ou no Google Planilhas.</p><textarea id="ex-t" class="cb-area" rows="9" readonly>'+esc(csv)+'</textarea>',
    onOk:function(mm){var t=mm.querySelector('#ex-t');t.select();try{navigator.clipboard.writeText(csv).then(function(){U.toast('Copiado.')},function(){U.toast('Selecione o texto e copie com Ctrl+C.')})}catch(e){U.toast('Selecione o texto e copie com Ctrl+C.')}return false}});
}
function lerForm(){
  var g=function(i){var x=document.getElementById(i);return x?x.value:''};
  lanc=lanc||{sel:{}};
  lanc.pid=+g('lc-pid')||null;lanc.valor=g('lc-valor');lanc.data=g('lc-data');lanc.forma=g('lc-forma');lanc.banco=g('lc-banco');lanc.tid=g('lc-tid');lanc.obs=g('lc-obs');
}
function gravar(){
  lerForm();var ok=true,primeiro=null;
  function e(id,msg){var s=document.getElementById(id+'-e'),c=document.getElementById(id);s.textContent=msg||'';s.hidden=!msg;c.classList.toggle('inv',!!msg);if(msg){ok=false;if(!primeiro)primeiro=id}}
  e('lc-pid',lanc.pid?'':'Escolha o pagador.');e('lc-valor',num(lanc.valor)>0?'':'Informe o valor pago.');e('lc-data',lanc.data?'':'Informe a data do pagamento.');e('lc-forma',lanc.forma?'':'Escolha a forma de pagamento.');
  if(!ok){document.getElementById(primeiro).focus();return}
  var v=num(lanc.valor),d=lanc.data.split('-'),ts=new Date(+d[0],+d[1]-1,+d[2],12,0).getTime();
  var dup=DB.pags.some(function(p){return (p.pid===lanc.pid&&Math.abs(p.valor-v)<.005&&fdata(p.ts)===fdata(ts))||(lanc.tid&&p.tid===lanc.tid)});
  function fim(){
    var ab=abertas(lanc.pid).filter(function(c){return lanc.sel[c.id]!==false}),rest=v,al=[];
    ab.forEach(function(c){if(rest>.004){var pg=Math.min(rest,saldo(c));al=al.concat(alocar(c,pg));rest=Math.round((rest-pg)*100)/100}});
    var r=aplicar(lanc.pid,v,al,rest,{ts:ts,forma:lanc.forma,banco:lanc.banco,tid:lanc.tid,obs:lanc.obs,tipo:'lancado'});
    lanc=null;aba='conf';fConf='todos';refaz();U.toast('Pagamento lançado.'+(r.msg?' '+r.msg:'')+(rest>.004?' Sobra de '+R(rest)+' como crédito.':''));
  }
  if(dup)U.modal({titulo:'Possível pagamento duplicado',ok:'Gravar mesmo assim',perigo:true,html:'<p>Já existe um pagamento com a mesma transação, ou com o mesmo valor, data e pagador. Gravar de novo pode contar o dinheiro duas vezes.</p>',onOk:function(){setTimeout(fim,230)}});else fim();
}
function menuFila(a,f){
  U.menu(a,[{id:'alterar',t:'Alterar competência',icone:'calendar'},{id:'dividir',t:'Dividir entre competências ou lojas',icone:'split'},{id:'rejeitar',t:'Rejeitar',icone:'x-circle',perigo:true},{sep:1},{id:'conversa',t:'Abrir conversa',icone:'message-circle'}],function(id){
    if(id==='alterar')alterar(f);else if(id==='dividir')dividir(f);else if(id==='rejeitar')rejeitar(f);else U.toast('Abriria a conversa de '+nomeDe(f.pid)+' na tela Conversas. Ainda sem função.')});
}
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)&&el.dataset.modulo==='recebimentos'}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b;
  if((b=t.closest('[data-aba]'))){if(aba==='lancar')lerForm();aba=b.dataset.aba;pag1=1;refaz();return}
  if((b=t.closest('[data-fconf]'))){fConf=b.dataset.fconf;pintar();document.querySelectorAll('[data-fconf]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.fconf===fConf)});return}
  if((b=t.closest('[data-pg]'))){pag1+=+b.dataset.pg;pintar();return}
  if((b=t.closest('[data-rc]'))){
    var a=b.dataset.rc,f=b.dataset.f?fila1(+b.dataset.f):null,p=b.dataset.p?pg1(+b.dataset.p):null;
    if(a==='confirmar')confirmar(f);else if(a==='decidir')decidir(f);else if(a==='mais')menuFila(b,f);
    else if(a==='ligar')ligar(p);
    else if(a==='mais2')U.menu(b,[{id:'credito',t:'Marcar como crédito',icone:'piggy-bank'},{id:'devolvido',t:'Marcar como devolvido ou estornado',icone:'undo-2'},{id:'descartado',t:'Descartar',icone:'trash-2',perigo:true}],function(id){marcar(p,id)});
    else if(a==='desfazer')desfazer(DB.hist.filter(function(h){return h.id===+b.dataset.h})[0]);
    else if(a==='exportar')exportar();else if(a==='limpar'){lanc=null;refaz()}
    return;
  }
  if((b=t.closest('[data-cob]'))){lerForm();lanc.sel[b.dataset.cob]=b.checked;pintar()}
});
document.addEventListener('input',function(e){
  if(!noEl(e))return;
  if(e.target.id==='rc-q'){q=e.target.value;pag1=1;pintar()}
  else if(e.target.id==='sm-min'||e.target.id==='sm-max'){fSem[e.target.id==='sm-min'?'min':'max']=e.target.value;pag1=1;var x=e.target.id,pos=e.target.selectionStart;pintar();var n=document.getElementById(x);if(n){n.focus();n.setSelectionRange(pos,pos)}}
  else if(e.target.id==='lc-valor'){lerForm();var s=document.querySelector('.lc-lado');if(s){var y=window.scrollY;var f2=document.getElementById('lc-valor'),pos2=f2.selectionStart;var lado=document.createElement('div');lado.innerHTML=abaLancar();s.innerHTML=lado.querySelector('.lc-lado').innerHTML;window.scrollTo(0,y)}}
});
document.addEventListener('change',function(e){
  if(!noEl(e))return;
  if(e.target.id==='sm-per'){fSem.per=e.target.value;pag1=1;pintar()}
  if(e.target.id==='lc-pid'){lerForm();lanc.sel={};pintar();var f=document.getElementById('lc-valor');if(f)f.focus()}
});
document.addEventListener('submit',function(e){if(e.target.id==='lc-form'){e.preventDefault();gravar()}});
return {render:render,api:function(){iniciar();return {DB:DB,saldo:saldo,total:total,abertas:abertas,R:R,plano:plano,rotulos:rotulos,fdata:fdata,fhora:fhora,alocar:alocar}}};
})();
