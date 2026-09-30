/* Módulo Robô: cobrança automática pelo WhatsApp (canal WhatsGW). Controle separado do botão "Robô ON/OFF" das Conversas.
   Só desenho: nada é enviado. Dados de exemplo. */
window.MKRobo=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,PAGS=window.MK_PAG,el=null,pronto=false,EU='Marina Costa';
var ABAS=[['painel','Painel'],['fila','Fila de aprovação'],['humano','Atendimento humano'],['pag','Pagadores'],['regras','Regras e limites'],['teste','Modo teste'],['audit','Auditoria']];
var aba='painel',fqFila='todos',fqP='',fsP='',sel={},nid=100,ouvintes=[];
var ST={pausa:{on:false,motivo:'',quem:'',quando:''},wa:{numero:'(11) 98800-4040',ok:true,desde:'28/09/2026 08:10'},sombra:true};
var PES={},FILA=[],HUM=[],LOG=[],SOMBRA=[];
var ACOES=[['lembrete','Lembrete antes do vencimento','Avisa 2 dias antes, com o Pix do mês.'],['cobranca','Cobrança do mês com Pix','Envia o Extrato da cobrança, o link e o copia e cola.'],['atraso','Aviso de atraso','Segue a régua: 1, 5 e 10 dias após o vencimento.'],['comprovante','Pedido de comprovante','Pede o comprovante a quem diz que já pagou por fora.'],['confirma','Confirmação de pagamento','Agradece assim que o Pix cai e dá baixa.'],['extrato','Extrato da cobrança','Responde quando o cliente pede o detalhe do valor.'],['via2','Segunda via do Pix','Reenvia o Pix quando o link ainda vale.']];
var REG={acoes:{lembrete:true,cobranca:true,atraso:true,comprovante:true,confirma:true,extrato:true,via2:true},hor:{ini:'09:00',fim:'17:30',dias:[1,2,3,4,5],feriados:true,lista:'01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 25/12'},lim:{dia:40,pag:1,int:180},pausas:{promessa:true,acordo:true,contestacao:true,pagamento:true}};
var DIAS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function d2(n){return ('0'+n).slice(-2)}
function fd(d){return d2(d.getDate())+'/'+d2(d.getMonth()+1)+'/'+d.getFullYear()}
function agora(){var d=new Date();return fd(d)+' '+d2(d.getHours())+':'+d2(d.getMinutes())}
function R(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function so(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function pag(id){return PAGS.filter(function(p){return p.id===id})[0]}
function pr(p){var w=p.nome.split(' ')[0];return w.charAt(0)+w.slice(1).toLowerCase()}
function chip(t,c){return '<span class="fs '+c+'">'+t+'</span>'}
function sitChip(s){return chip(s,s==='Atende'?'vd':s==='Em teste'?'ok':'gr')}
function avisar(){ouvintes.forEach(function(f){f()})}
function log(pid,acao,regra,msg,res){LOG.unshift({t:agora(),pid:pid,acao:acao,regra:regra,msg:msg||'',res:res})}
/* ---------- dados de exemplo ---------- */
function iniciar(){
  if(pronto)return;pronto=true;var h=new Date();
  var mot=['Combinado por telefone','Cliente pediu só contato humano','Em negociação de acordo','Reclamou do robô'];
  PAGS.forEach(function(p){
    var s='Atende',m='',q='';
    if(p.id%5===0){s='Não atende';m=mot[p.id%4];q='Rafael Lima'}else if(p.id%7===3){s='Em teste';m='Primeiros envios acompanhados';q='Marina Costa'}
    PES[p.id]={st:s,motivo:m,desde:fd(new Date(h.getFullYear(),h.getMonth(),h.getDate()-3-p.id)),quem:q||'Padrão do sistema'};
  });
  var tp=[['Parcelamento','Pediu para parcelar a cobrança em 3 vezes.','Propor 3 parcelas, com um Pix por parcela, dentro de um acordo.'],['Prazo novo','Pediu até dia 10 para pagar.','Aceitar a promessa até 10/10 e pausar a régua até lá.'],['Bloqueio','Sem pagamento há 16 dias.','Bloquear as lojas e avisar o grupo de bloqueio.'],['Desbloqueio','Enviou comprovante e diz que já pagou.','Desbloquear as lojas depois da conferência.'],['Resposta a contestação','Disse que o valor está errado.','Abrir contestação e anexar a memória de cálculo. Quem decide é uma pessoa.'],['Mensagem fora do padrão','Mandou um áudio longo com reclamação.','Responder pedindo um momento e passar para uma pessoa.']];
  [2,4,6,7,9,11,12].forEach(function(id,i){var t=tp[i%tp.length],p=pag(id)||PAGS[i];FILA.push({id:nid++,tipo:t[0],pid:p.id,pedido:t[1],proposta:t[2],quando:'há '+(5+i*9)+' min'})});
  [[1,'Cliente pediu o total separado por loja',12],[3,'Contestou o valor da cobrança',47],[5,'Áudio que o robô não entendeu',8],[8,'Pediu parcelamento fora da regra',65],[10,'Reclamação de bloqueio',22]].forEach(function(x,i){var p=pag(x[0])||PAGS[i];HUM.push({pid:p.id,motivo:x[1],espera:x[2],resp:['Marina Costa','Rafael Lima','Juliana Prado','Sem dono','Marina Costa'][i]})});
  var ac=[['Cobrança do mês com Pix','Cobrança do mês com Pix','Olá, {n}! Sua cobrança de setembro/2026 está pronta: {v}. Vence dia 20. Pix: link e copia e cola abaixo.','Enviado'],['Lembrete antes do vencimento','Lembrete antes do vencimento','Olá, {n}! Passando para lembrar: sua cobrança vence em 2 dias.','Enviado'],['Confirmação de pagamento','Confirmação de pagamento','Recebemos seu pagamento de {v}. Obrigado, {n}!','Enviado'],['Aviso de atraso','Aviso de atraso (etapa 1)','Olá, {n}! A cobrança venceu há 1 dia. Se já pagou, envie o comprovante.','Enviado'],['Segunda via do Pix','Segunda via do Pix','Aqui está o Pix novamente, {n}. O link vale até 25/10.','Enviado'],['Aviso de atraso','Aviso de atraso (etapa 2)','Olá, {n}. A cobrança segue em aberto há 6 dias.','Não enviado: fora do horário'],['Cobrança do mês com Pix','Cobrança do mês com Pix','Olá, {n}! Sua cobrança de setembro/2026 está pronta: {v}.','Erro de envio: número sem WhatsApp']];
  PAGS.slice(0,14).forEach(function(p,i){var a=ac[i%ac.length],v=R(1800+p.id*730),d=new Date(h.getTime()-(i*37+12)*60000);LOG.push({t:fd(d)+' '+d2(d.getHours())+':'+d2(d.getMinutes()),pid:p.id,acao:a[0],regra:a[1],msg:a[2].replace('{n}',pr(p)).replace('{v}',v),res:a[3]})});
  var sg=[['Cobrança do mês com Pix','Aprovada sem edição'],['Aviso de atraso','Aprovada sem edição'],['Lembrete','Aprovada sem edição'],['Confirmação de pagamento','Editada'],['Aviso de atraso','Aprovada sem edição'],['Extrato da cobrança','Recusada']];
  sg.forEach(function(x,i){var p=PAGS[(i*2)%PAGS.length];SOMBRA.push({pid:p.id,acao:x[0],res:x[1],t:'hoje, '+d2(9+i)+':1'+i})});
}
/* ---------- regras (o que o robô pode fazer agora) ---------- */
function ligado(pid){iniciar();return !ST.pausa.on&&ST.wa.ok&&PES[pid]&&PES[pid].st==='Atende'}
function verifica(pid,acao){
  iniciar();var p=pag(pid),r=[],ok=true,pe=PES[pid];
  function c(t,v,n){r.push({t:t,ok:v,n:n||''});if(!v)ok=false}
  c('Robô geral ligado',!ST.pausa.on,ST.pausa.on?'Pausado: '+ST.pausa.motivo:'');
  c('Número do WhatsApp conectado',ST.wa.ok);
  c('Pagador atende',pe.st!=='Não atende',pe.st==='Não atende'?pe.motivo:pe.st==='Em teste'?'Em teste: só sugere, não envia':'');
  c('Ação liberada nas regras',!!REG.acoes[acao.k],'');
  var d=new Date(),hm=d2(d.getHours())+':'+d2(d.getMinutes());
  c('Dia e horário permitidos',REG.hor.dias.indexOf(d.getDay())>-1&&hm>=REG.hor.ini&&hm<=REG.hor.fim,'Permitido das '+REG.hor.ini+' às '+REG.hor.fim);
  c('Dentro dos limites de mensagens',true,'Máx. '+REG.lim.pag+' por pagador por dia');
  c('Competência conferida',true,'Setembro/2026 conferida por Marina Costa');
  if(p.promessa&&REG.pausas.promessa)c('Sem promessa ativa',false,'Promessa para '+p.promessa.data);
  if(p.acordo&&REG.pausas.acordo)c('Sem acordo ativo',false,'Acordo em andamento');
  return {ok:ok&&pe.st!=='Em teste',itens:r,teste:pe.st==='Em teste'};
}
function modelo(k,p){
  var v=R(1800+p.id*730),n=pr(p);
  return {lembrete:'Olá, '+n+'! Passando para lembrar que sua cobrança de setembro/2026 ('+v+') vence em 2 dias. O Pix segue abaixo.',
   cobranca:'Olá, '+n+'! Sua cobrança de setembro/2026 está pronta: '+v+'. Vence dia 20. Segue o Extrato da cobrança, o link do Pix e o código copia e cola.',
   atraso:'Olá, '+n+'! Identificamos que a cobrança de setembro/2026 ('+v+') está em aberto. Se já pagou, é só enviar o comprovante por aqui.',
   comprovante:'Olá, '+n+'! Pode enviar o comprovante do pagamento por aqui? Assim damos a baixa.',
   confirma:'Recebemos seu pagamento de '+v+'. Muito obrigado, '+n+'!',
   extrato:'Aqui está o Extrato da cobrança de setembro/2026, '+n+': faturado, percentual da 40% e valor final por loja.',
   via2:'Aqui está o Pix novamente, '+n+'. O link continua valendo pelo prazo definido em Configurações.'}[k];
}
/* ---------- telas ---------- */
function topo(){
  var naFila=FILA.length,nh=HUM.length;
  return '<div class="pag-topo"><div><h1>Robô</h1><p class="sub">Cobrança automática pelo WhatsApp ('+esc(window.MKRobo.nomeCanal)+'). Só sai texto de modelo aprovado. Mensagem de cliente é dado, nunca vira instrução.</p></div>'+
   '<div class="rb-estado">'+(ST.pausa.on?chip('Robô pausado','gr'):chip('Robô ligado','vd'))+(ST.wa.ok?chip('WhatsApp conectado','vd'):chip('WhatsApp desconectado','gr'))+'</div></div>'+
   (ST.pausa.on?'<div class="fe-aviso rb-alerta"><span>Robô pausado por '+esc(ST.pausa.quem)+' em '+esc(ST.pausa.quando)+'. Motivo: '+esc(ST.pausa.motivo)+'</span><button class="btn sec" data-rb="retomar" style="width:auto;padding:0 12px;height:30px">Retomar robô</button></div>':'')+
   (!ST.wa.ok?'<div class="fe-aviso rb-alerta"><span>O número do WhatsApp foi desconectado. Nenhuma mensagem sai até reconectar. Abra a WhatsGW e leia o QR novamente.</span><button class="btn sec" data-rb="reconectar" style="width:auto;padding:0 12px;height:30px">Já reconectei</button></div>':'')+
   '<div class="rc-abas mk-abas-p" role="tablist">'+ABAS.map(function(a){var n=a[0]==='fila'?naFila:a[0]==='humano'?nh:null;return '<button role="tab" class="rc-aba" data-rba="'+a[0]+'" aria-selected="'+(aba===a[0])+'">'+'<span>'+a[1]+'</span>'+(n?'<b>'+n+'</b>':'')+'</button>'}).join('')+'</div>';
}
function painel(){
  var k=[['Cobranças enviadas','174','hoje e ontem'],['Pix gerados','168','1 por pagador'],['Pix pagos','84%','141 de 168'],['Valor recuperado',R(318240),'no mês'],['Respostas dos clientes','96','recebidas pelo robô'],['Passadas para uma pessoa',String(HUM.length),'aguardando atendimento'],['Erros de envio','3','número sem WhatsApp']];
  return '<div class="fe-cont rb-k">'+k.map(function(x,i){return '<div class="fe-k"><small>'+x[0]+'</small><b class="'+(i===6?'pend':'')+'">'+x[1]+'</b><span class="nt">'+x[2]+'</span></div>'}).join('')+'</div>'+
   '<div class="rb-g"><div class="cx"><div class="cx-cab">'+ic('smartphone')+'<h3>Número do WhatsApp conectado</h3>'+(ST.wa.ok?chip('Conectado','vd'):chip('Desconectado','gr'))+'</div><div class="cf-corpo"><div class="f-kv"><span>Número</span><b>'+esc(ST.wa.numero)+'</b></div><div class="f-kv"><span>Canal</span><b>WhatsGW</b></div><div class="f-kv"><span>Conectado desde</span><b>'+esc(ST.wa.desde)+'</b></div><div class="fe-aviso"><span>Se a conexão cair, o robô para sozinho e aparece um alerta no alto desta tela.</span></div><div class="f-bts"><button class="btn sec" data-rb="testar">Testar conexão</button><button class="btn sec" data-rb="simular">Simular queda (teste)</button></div></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('power')+'<h3>Controle geral</h3>'+(ST.pausa.on?chip('Pausado','gr'):chip('Ligado','vd'))+'</div><div class="cf-corpo"><p class="nt">Pausar o robô para todas as cobranças de uma vez. Para pausar só um cliente, use a aba Pagadores. Este controle é separado do botão Robô ON/OFF das Conversas.</p>'+(ST.pausa.on?'<button class="btn" data-rb="retomar">Retomar robô</button>':'<button class="btn esc" data-rb="pausar">Pausar robô</button>')+'</div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('list-checks')+'<h3>O que o robô faz sozinho</h3></div><div class="cf-corpo">'+ACOES.map(function(a){return '<div class="rb-ac"><span>'+esc(a[1])+'</span>'+(REG.acoes[a[0]]?chip('Ligado','vd'):chip('Desligado','cn'))+'</div>'}).join('')+'<button class="btn sec" data-rba="regras" style="width:auto;padding:0 12px;align-self:flex-start">Mudar em Regras e limites</button></div></div></div>';
}
function fila(){
  var tipos=['todos'].concat(FILA.map(function(f){return f.tipo}).filter(function(v,i,a){return a.indexOf(v)===i}));
  var L=FILA.filter(function(f){return fqFila==='todos'||f.tipo===fqFila});
  return '<div class="fe-barra"><div class="fe-info">Coisas que o robô não faz sozinho. <b>Qualquer usuário pode aprovar</b> (dá para personalizar depois em Configurações).</div></div>'+
   '<div class="cv-tabs rb-chips">'+tipos.map(function(t){return '<button class="chip-f" data-rbf="'+esc(t)+'" aria-pressed="'+(fqFila===t)+'">'+(t==='todos'?'Todos':esc(t))+' <b>'+(t==='todos'?FILA.length:FILA.filter(function(f){return f.tipo===t}).length)+'</b></button>'}).join('')+'</div>'+
   (L.length?'<div class="rb-cards">'+L.map(function(f){var p=pag(f.pid);return '<div class="cx rb-it"><div class="cx-cab">'+chip(esc(f.tipo),f.tipo==='Bloqueio'||f.tipo==='Resposta a contestação'?'gr':'ok')+'<h3>'+esc(p.nome)+'</h3><span class="nt" style="margin-left:auto">'+f.quando+'</span></div><div class="cf-corpo"><div class="rb-bl"><small>O que o cliente pediu</small><p>'+esc(f.pedido)+'</p></div><div class="rb-bl rb-bl-r"><small>O que o robô propõe</small><p>'+esc(f.proposta)+'</p></div><div class="f-bts"><button class="btn" data-rb="aprovar" data-id="'+f.id+'">Aprovar</button><button class="btn sec" data-rb="editar" data-id="'+f.id+'">Editar</button><button class="btn sec" data-rb="recusar" data-id="'+f.id+'">Recusar</button></div></div></div>'}).join('')+'</div>':'<div class="fe-vazio">Nada esperando aprovação.</div>');
}
function humano(){
  return '<div class="fe-barra"><div class="fe-info">Conversas que o robô passou para uma pessoa. Quanto mais tempo parada, mais vermelho.</div></div><div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Pagador</th><th>Motivo da passagem</th><th>Tempo de espera</th><th>Responsável</th><th></th></tr></thead><tbody>'+
   (HUM.length?HUM.map(function(h,i){var p=pag(h.pid);return '<tr><td data-rot="Pagador"><b>'+esc(p.nome)+'</b></td><td data-rot="Motivo">'+esc(h.motivo)+'</td><td data-rot="Espera">'+chip(h.espera+' min',h.espera>45?'gr':h.espera>20?'at':'ok')+'</td><td data-rot="Responsável" class="rp">'+esc(h.resp)+'</td><td class="rc-ac" data-rot="Ação"><button class="btn sec" data-rb="assumir" data-i="'+i+'" style="width:auto;padding:0 10px;height:30px">Assumir</button><button class="btn sec" data-rb="conversa" data-i="'+i+'" style="width:auto;padding:0 10px;height:30px">Abrir conversa</button></td></tr>'}).join(''):'<tr><td colspan="5" class="vazio-t">Nenhuma conversa esperando uma pessoa.</td></tr>')+'</tbody></table></div>';
}
function listaP(){var t=so(fqP.trim());return PAGS.filter(function(p){return (!fsP||PES[p.id].st===fsP)&&(!t||so(p.nome).indexOf(t)>-1)})}
function pagadores(){
  var L=listaP(),n=Object.keys(sel).filter(function(k){return sel[k]}).length,todos=L.length&&L.every(function(p){return sel[p.id]});
  var cont={};['Atende','Não atende','Em teste'].forEach(function(s){cont[s]=PAGS.filter(function(p){return PES[p.id].st===s}).length});
  return '<div class="fe-cont rb-k3">'+['Atende','Não atende','Em teste'].map(function(s){return '<div class="fe-k"><small>'+s+'</small><b>'+cont[s]+'</b></div>'}).join('')+'</div>'+
   '<div class="fe-barra"><div class="rc-filtros"><label class="busca-p mk-busca"><span class="sr">Buscar</span>'+ic('search')+'<input id="rb-q" type="search" placeholder="Buscar pagador" value="'+esc(fqP)+'"></label><label class="sel-p"><span>Situação do robô</span><select class="sel" id="rb-fs"><option value="">Todas</option>'+['Atende','Não atende','Em teste'].map(function(s){return '<option'+(fsP===s?' selected':'')+'>'+s+'</option>'}).join('')+'</select></label></div></div>'+
   '<div class="fe-barra rb-lote"><div class="fe-info"><b>'+n+'</b> selecionado'+(n===1?'':'s')+'. Marcar vários de uma vez:</div><div class="fe-filtros"><button class="btn sec" data-rb="lote" data-st="Atende" style="width:auto;padding:0 12px"'+(n?'':' disabled')+'>Atende</button><button class="btn sec" data-rb="lote" data-st="Não atende" style="width:auto;padding:0 12px"'+(n?'':' disabled')+'>Não atende</button><button class="btn sec" data-rb="lote" data-st="Em teste" style="width:auto;padding:0 12px"'+(n?'':' disabled')+'>Em teste</button></div></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th class="c"><input type="checkbox" data-rb="todos" aria-label="Marcar todos"'+(todos?' checked':'')+'></th><th>Pagador</th><th>Situação do robô</th><th>Motivo</th><th>Desde</th><th>Alterado por</th></tr></thead><tbody>'+
   (L.length?L.map(function(p){var e=PES[p.id];return '<tr><td class="c" data-rot="Marcar"><input type="checkbox" data-rbsel="'+p.id+'" aria-label="Marcar '+esc(p.nome)+'"'+(sel[p.id]?' checked':'')+'></td><td data-rot="Pagador"><b>'+esc(p.nome)+'</b><div class="nt">'+p.lojas.length+(p.lojas.length===1?' loja':' lojas')+'</div></td><td data-rot="Situação do robô">'+sitChip(e.st)+'</td><td data-rot="Motivo">'+esc(e.motivo||'—')+'</td><td data-rot="Desde">'+esc(e.desde)+'</td><td data-rot="Alterado por" class="rp">'+esc(e.quem)+'</td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t">Nenhum pagador neste filtro.</td></tr>')+'</tbody></table></div>';
}
function sw(id,on){return '<label class="sw"><input type="checkbox" data-rbr="'+id+'"'+(on?' checked':'')+'><span></span></label>'}
function regras(){
  return '<div class="rb-g rb-g2"><div class="cx"><div class="cx-cab">'+ic('zap')+'<h3>Ações que o robô faz sozinho</h3></div><div class="cf-corpo">'+ACOES.map(function(a){return '<div class="rb-ac"><div><b>'+esc(a[1])+'</b><div class="nt">'+esc(a[2])+'</div></div>'+sw('a.'+a[0],REG.acoes[a[0]])+'</div>'}).join('')+'</div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('clock')+'<h3>Horários e dias permitidos</h3></div><div class="cf-corpo"><div class="f-grade"><div class="campo"><label for="rg-ini">Começa às</label><input id="rg-ini" type="time" data-rbr="h.ini" value="'+REG.hor.ini+'"></div><div class="campo"><label for="rg-fim">Termina às</label><input id="rg-fim" type="time" data-rbr="h.fim" value="'+REG.hor.fim+'"></div></div><div class="rb-dias" role="group" aria-label="Dias permitidos">'+DIAS.map(function(d,i){return '<button class="chip-f" data-rbd="'+i+'" aria-pressed="'+(REG.hor.dias.indexOf(i)>-1)+'">'+d+'</button>'}).join('')+'</div><div class="rb-ac"><div><b>Não enviar em feriados</b><div class="nt">Datas (dia/mês), separadas por vírgula.</div></div>'+sw('h.fer',REG.hor.feriados)+'</div><div class="campo"><textarea class="cb-area" rows="2" data-rbr="h.lista" aria-label="Lista de feriados">'+esc(REG.hor.lista)+'</textarea></div></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('gauge')+'<h3>Limites de mensagens</h3></div><div class="cf-corpo"><div class="f-grade"><div class="campo"><label for="rg-dia">Por dia, no total</label><input id="rg-dia" type="number" min="1" data-rbr="l.dia" value="'+REG.lim.dia+'"></div><div class="campo"><label for="rg-pag">Por pagador, por dia</label><input id="rg-pag" type="number" min="1" data-rbr="l.pag" value="'+REG.lim.pag+'"></div><div class="campo"><label for="rg-int">Intervalo mínimo entre mensagens (min)</label><input id="rg-int" type="number" min="1" data-rbr="l.int" value="'+REG.lim.int+'"></div></div><div class="fe-aviso"><span>Valores iniciais baixos de propósito. O canal é a WhatsGW e envio em massa pode bloquear o número. Aumente aos poucos.</span></div></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('pause-circle')+'<h3>Pausas automáticas</h3></div><div class="cf-corpo">'+[['promessa','Promessa de pagamento ativa'],['acordo','Acordo em andamento'],['contestacao','Contestação aberta'],['pagamento','Pagamento feito']].map(function(x){return '<div class="rb-ac"><span>'+x[1]+'</span>'+sw('p.'+x[0],REG.pausas[x[0]])+'</div>'}).join('')+'<div class="fe-aviso rb-fixo"><span>Regras fixas: o robô só cobra competência conferida e pagador que atende. Só sai texto de modelo aprovado.</span></div></div></div></div>'+
   '<div class="cf-salvar"><span class="nt">As mudanças valem na hora e ficam na Auditoria.</span><button class="btn" data-rb="salvarreg" style="width:auto;padding:0 16px">Registrar mudanças</button></div>';
}
var simP=null,simA='cobranca',simOut=null;
function teste(){
  var p0=simP||PAGS[0].id;
  var taxa=Math.round(SOMBRA.filter(function(s){return s.res==='Aprovada sem edição'}).length/SOMBRA.length*100);
  return '<div class="rb-g rb-g2"><div class="cx"><div class="cx-cab">'+ic('flask-conical')+'<h3>Simulador</h3></div><div class="cf-corpo"><p class="nt">Mostra o que o robô enviaria, sem enviar nada.</p><div class="f-grade"><div class="campo"><label for="sm-p">Pagador</label><select class="sel" id="sm-p">'+PAGS.map(function(p){return '<option value="'+p.id+'"'+(p.id===p0?' selected':'')+'>'+esc(p.nome)+'</option>'}).join('')+'</select></div><div class="campo"><label for="sm-a">Ação</label><select class="sel" id="sm-a">'+ACOES.map(function(a){return '<option value="'+a[0]+'"'+(simA===a[0]?' selected':'')+'>'+esc(a[1])+'</option>'}).join('')+'</select></div></div><button class="btn" data-rb="simulacao" style="width:auto;padding:0 16px;align-self:flex-start">Simular</button>'+
   (simOut?'<div class="rb-sim"><div class="rb-res '+(simOut.ok?'ok':'no')+'">'+(simOut.ok?'Enviaria agora':simOut.teste?'Só sugeriria (pagador em teste)':'Não enviaria agora')+'</div><div class="rb-bolha">'+esc(simOut.txt)+'</div><ul class="rb-chk">'+simOut.itens.map(function(i){return '<li class="'+(i.ok?'ok':'no')+'"><b>'+(i.ok?'Sim':'Não')+'</b> '+esc(i.t)+(i.n?'<span class="nt"> · '+esc(i.n)+'</span>':'')+'</li>'}).join('')+'</ul></div>':'')+'</div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('eye')+'<h3>Modo sombra</h3>'+(ST.sombra?chip('Ligado','vd'):chip('Desligado','cn'))+'</div><div class="cf-corpo"><p class="nt">O robô só sugere o que faria. Uma pessoa aprova ou edita. Serve para medir se dá para confiar antes de soltar.</p><div class="rb-ac"><span>Modo sombra ligado</span>'+sw('sombra',ST.sombra)+'</div><div class="fe-cont rb-k3"><div class="fe-k"><small>Sugestões</small><b>'+SOMBRA.length+'</b></div><div class="fe-k"><small>Aprovadas sem edição</small><b>'+taxa+'%</b></div><div class="fe-k"><small>Editadas ou recusadas</small><b>'+(100-taxa)+'%</b></div></div>'+
   SOMBRA.map(function(s){var p=pag(s.pid);return '<div class="f-lin"><div style="min-width:0"><div class="pg">'+esc(p.nome)+'</div><div class="nt">'+esc(s.acao)+' · '+esc(s.t)+'</div></div>'+chip(esc(s.res),s.res==='Recusada'?'gr':s.res==='Editada'?'at':'vd')+'</div>'}).join('')+'</div></div></div>';
}
var aq='',alim=30;
function audit(){
  var t=so(aq.trim()),L=LOG.filter(function(l){return !t||so(pag(l.pid).nome).indexOf(t)>-1||so(l.acao).indexOf(t)>-1});
  return '<div class="fe-barra"><label class="busca-p mk-busca"><span class="sr">Buscar</span>'+ic('search')+'<input id="rb-aq" type="search" placeholder="Buscar por pagador ou ação" value="'+esc(aq)+'"></label><div class="fe-info"><b>'+L.length+'</b> registros. Nunca se apaga.</div></div><div class="tab-cartao"><table class="tab-fe tab-ml"><thead><tr><th>Data e hora</th><th>Pagador</th><th>Ação</th><th>Regra que permitiu</th><th>Mensagem</th><th>Resultado</th></tr></thead><tbody>'+
   (L.length?L.slice(0,alim).map(function(l){var bad=/^(Erro|Não)/.test(l.res);return '<tr><td data-rot="Data e hora" class="nw mono">'+esc(l.t)+'</td><td data-rot="Pagador">'+esc(pag(l.pid).nome)+'</td><td data-rot="Ação">'+esc(l.acao)+'</td><td data-rot="Regra">'+esc(l.regra)+'</td><td data-rot="Mensagem">'+esc(l.msg||'—')+'</td><td data-rot="Resultado">'+chip(esc(l.res),bad?'gr':'vd')+'</td></tr>'}).join(''):'<tr><td colspan="6" class="vazio-t">Nada encontrado.</td></tr>')+'</tbody></table></div>'+(L.length>alim?'<button class="btn sec" data-rb="mais" style="width:auto;padding:0 14px;align-self:center">Mostrar mais</button>':'');
}
function corpo(){iniciar();return aba==='painel'?painel():aba==='fila'?fila():aba==='humano'?humano():aba==='pag'?pagadores():aba==='regras'?regras():aba==='teste'?teste():audit()}
function render(alvo){
  if(alvo)el=alvo;iniciar();
  el.innerHTML='<div class="dash fe-w rc-w">'+topo()+'<section class="bloco"><div class="fe-painel" id="rb-corpo">'+corpo()+'</div></section><div class="aviso">Dados de exemplo. Servem só para desenhar a tela. Nada é enviado.</div></div>';
  U.icones();
}
function pintar(){var c=document.getElementById('rb-corpo');if(c){c.innerHTML=corpo();U.icones()}}
function refaz(){var y=window.scrollY;render();window.scrollTo(0,y)}
/* ---------- ações ---------- */
function motivoModal(tit,txt,cb){
  U.modal({titulo:tit,ok:'Confirmar',html:'<p class="dica-m">'+txt+'</p><div class="campo"><label for="mt">Motivo <i class="obr">*</i></label><textarea class="cb-area" id="mt" rows="3"></textarea><small class="erro" id="mt-e" hidden>Escreva o motivo.</small></div>',onOk:function(m){var v=m.querySelector('#mt').value.trim();if(!v){m.querySelector('#mt-e').hidden=false;return false}cb(v)}});
}
function definir(pid,st,motivo,quem){
  iniciar();var e=PES[pid];e.st=st;e.motivo=st==='Atende'?'':(motivo||'');e.desde=fd(new Date());e.quem=quem||EU;log(pid,'Situação do robô alterada','Ação de uma pessoa','Agora: '+st+(motivo?'. Motivo: '+motivo:''),'Registrado');avisar();
}
function escalar(pid,motivo){iniciar();if(!HUM.some(function(h){return h.pid===pid}))HUM.unshift({pid:pid,motivo:motivo,espera:1,resp:'Sem dono'});log(pid,'Passou para uma pessoa','Escalação','',motivo);avisar()}
function acao(b){
  var a=b.dataset.rb,id=+b.dataset.id,f;
  if(a==='pausar')motivoModal('Pausar o robô?','Nenhuma cobrança automática sai até retomar. Escreva o motivo.',function(v){ST.pausa={on:true,motivo:v,quem:EU,quando:agora()};log(PAGS[0].id,'Robô geral pausado','Ação de uma pessoa','Motivo: '+v,'Pausado');avisar();refaz();U.toast('Robô pausado.')});
  else if(a==='retomar'){ST.pausa.on=false;log(PAGS[0].id,'Robô geral retomado','Ação de uma pessoa','','Ligado');avisar();refaz();U.toast('Robô ligado de novo.')}
  else if(a==='testar')U.toast(ST.wa.ok?'Conexão com a WhatsGW funcionando.':'Sem conexão. Reconecte o número.');
  else if(a==='simular'){ST.wa.ok=false;refaz();U.toast('Queda simulada. O robô parou.')}
  else if(a==='reconectar'){ST.wa.ok=true;ST.wa.desde=agora();refaz();U.toast('Número reconectado.')}
  else if(a==='aprovar'||a==='recusar'){f=FILA.filter(function(x){return x.id===id})[0];FILA.splice(FILA.indexOf(f),1);log(f.pid,(a==='aprovar'?'Aprovado: ':'Recusado: ')+f.tipo,'Fila de aprovação','Por '+EU+'. '+f.proposta,a==='aprovar'?'Executado':'Recusado');avisar();refaz();U.toast(a==='aprovar'?'Aprovado.':'Recusado.')}
  else if(a==='editar'){f=FILA.filter(function(x){return x.id===id})[0];U.modal({titulo:'Editar proposta',ok:'Salvar e aprovar',html:'<div class="campo"><label for="ed-t">Proposta</label><textarea class="cb-area" id="ed-t" rows="4">'+esc(f.proposta)+'</textarea></div>',onOk:function(m){var v=m.querySelector('#ed-t').value.trim();if(!v)return false;FILA.splice(FILA.indexOf(f),1);log(f.pid,'Editado e aprovado: '+f.tipo,'Fila de aprovação','Por '+EU+'. '+v,'Executado');avisar();refaz();U.toast('Editado e aprovado.')}})}
  else if(a==='assumir'){var h=HUM[+b.dataset.i];h.resp=EU;log(h.pid,'Conversa assumida','Atendimento humano','Por '+EU,'Assumida');pintar();U.toast('Conversa assumida por você.')}
  else if(a==='conversa'){if(window.MKApp)MKApp.ir('conversas')}
  else if(a==='todos'){var L=listaP();L.forEach(function(p){sel[p.id]=b.checked});pintar()}
  else if(a==='lote'){var ids=Object.keys(sel).filter(function(k){return sel[k]}).map(Number),st=b.dataset.st;
    var fazer=function(mot){ids.forEach(function(pid){definir(pid,st,mot)});sel={};refaz();U.toast(ids.length+(ids.length===1?' pagador marcado':' pagadores marcados')+' como “'+st+'”.')};
    if(st==='Não atende')motivoModal('Marcar '+ids.length+' como “Não atende”','O robô deixa de falar com eles. Escreva o motivo.',fazer);else fazer('')}
  else if(a==='salvarreg'){log(PAGS[0].id,'Regras e limites alterados','Ação de uma pessoa','Por '+EU,'Registrado');U.toast('Regras registradas na Auditoria.')}
  else if(a==='simulacao'){var p=pag(+document.getElementById('sm-p').value),k=document.getElementById('sm-a').value,ac=ACOES.filter(function(x){return x[0]===k})[0];simP=p.id;simA=k;var v=verifica(p.id,{k:k});simOut={ok:v.ok,teste:v.teste&&!v.itens.some(function(i){return !i.ok&&i.t!=='Pagador atende'}),itens:v.itens,txt:modelo(k,p)};pintar()}
  else if(a==='mais'){alim+=30;pintar()}
}
function noEl(e){return el&&el.isConnected&&el.contains(e.target)&&el.dataset.modulo==='robo'}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b;
  if((b=t.closest('[data-rba]'))){aba=b.dataset.rba;refaz();return}
  if((b=t.closest('[data-rbf]'))){fqFila=b.dataset.rbf;pintar();return}
  if((b=t.closest('[data-rbd]'))){var d=+b.dataset.rbd,i=REG.hor.dias.indexOf(d);if(i>-1)REG.hor.dias.splice(i,1);else REG.hor.dias.push(d);pintar();return}
  if((b=t.closest('[data-rb]'))&&b.type!=='checkbox'){acao(b)}
});
document.addEventListener('change',function(e){
  if(!noEl(e))return;var t=e.target;
  if(t.dataset.rb==='todos'){acao(t);return}
  if(t.dataset.rbsel){sel[t.dataset.rbsel]=t.checked;pintar();return}
  if(t.id==='rb-fs'){fsP=t.value;pintar();return}
  if(t.dataset.rbr){var k=t.dataset.rbr,v=t.type==='checkbox'?t.checked:t.value,p=k.split('.');
    if(p[0]==='a')REG.acoes[p[1]]=v;else if(p[0]==='p')REG.pausas[p[1]]=v;else if(p[0]==='h'){if(p[1]==='fer')REG.hor.feriados=v;else REG.hor[p[1]]=v}else if(p[0]==='l')REG.lim[p[1]]=+v;else if(k==='sombra')ST.sombra=v;
    if(k==='sombra')pintar();return}
});
document.addEventListener('input',function(e){
  if(!noEl(e))return;var t=e.target;
  if(t.id==='rb-q'){fqP=t.value;var p=t.selectionStart;pintar();var n=document.getElementById('rb-q');if(n){n.focus();n.setSelectionRange(p,p)}}
  if(t.id==='rb-aq'){aq=t.value;var p2=t.selectionStart;pintar();var n2=document.getElementById('rb-aq');if(n2){n2.focus();n2.setSelectionRange(p2,p2)}}
});
function api(){iniciar();return {situacao:function(pid){iniciar();return PES[pid]||{st:'Atende',motivo:'',desde:'',quem:''}},definir:definir,pausado:function(){return ST.pausa.on},ligado:ligado,escalar:escalar,log:log,quandoMudar:function(f){ouvintes.push(f)},modelo:modelo}}
return {render:render,api:api,nomeCanal:'WhatsGW'};
})();
