/* Tela Conversas: 3 colunas (lista, conversa, ficha). Um só WhatsApp (o da 40%). Dados de exemplo. */
window.MKConversas=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,F=window.MKFicha;
var CONV=window.MK_CONV,PAGS=window.MK_PAG,el=null,sel=null,aba='todas',busca='',modo='resp',resp=null,edit=null,iniciado=false,seq=100;
var ABAS=[['todas','Todas'],['semresp','Sem resposta'],['comp','Comprovantes'],['atraso','Em atraso'],['promessa','Promessa'],['bloq','Bloqueados'],['semdono','Sem dono'],['grupos','Grupos']];
var QR=[['comprovante','Recebemos seu comprovante. Vamos conferir e confirmar o pagamento em breve.'],['lembrete','Olá! Passando para lembrar que a cobrança vence dia 20. Se já pagou, envie o comprovante por aqui.'],['bloqueio','Aviso: sua loja será bloqueada por falta de pagamento. Para evitar o bloqueio, envie o comprovante ou fale com a gente hoje.'],['pix','Dados para pagamento por Pix. Chave (CNPJ): 00.000.000/0001-00. Favorecido: IT.MK Serviços. Depois de pagar, envie o comprovante por aqui.']];
function so(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function nums(s){return s.replace(/\D/g,'')}
function pag(c){return c.pag?PAGS.filter(function(p){return p.id===c.pag})[0]:null}
function nome(c){return c.grupo||pag(c).nome}
function agora(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function vis(c){return c.msgs.filter(function(m){return m.de!=='n'})}
function ultima(c){return c.msgs[c.msgs.length-1]}
function semResp(c){var v=vis(c);return !c.grupo&&v.length&&v[v.length-1].de==='p'}
function compPend(c){var p=pag(c);return !!p&&F.comprovantes(p).some(function(x){return x.st==='conferir'})}
function bloqueado(c){var p=pag(c);return !!p&&p.lojas.some(function(l){return l.st==='bloqueada'})}
var FIL={todas:function(){return true},semresp:semResp,comp:compPend,atraso:function(c){var p=pag(c);return !!p&&p.fin==='atraso'},promessa:function(c){var p=pag(c);return !!p&&!!p.promessa},bloq:bloqueado,semdono:function(c){return !c.dono},grupos:function(c){return !!c.grupo}};
function ativas(){return CONV.filter(function(c){return !c.arq})}
function preview(m){
  if(m.apagada)return 'Mensagem apagada';
  var t=m.t==='txt'?m.x:m.t==='aud'?'Áudio '+m.x:m.t==='img'?'Imagem':'PDF · '+m.x;
  return (m.de==='e'?'Você: ':m.de==='n'?'Nota: ':'')+t;
}
function iniciais(s){var w=s.replace(/[^A-Za-zÀ-ú ]/g,'').trim().split(/\s+/);return (w[0][0]+(w[1]?w[1][0]:'')).toUpperCase()}
function iniciar(){
  if(iniciado)return;iniciado=true;
  CONV.forEach(function(c,i){c.ord=CONV.length-i;c.robo=true;
    var p=pag(c);if(!p)return;var lista=F.comprovantes(p);
    c.msgs.forEach(function(m){if(m.de==='p'&&(m.t==='img'||m.t==='pdf')){if(m.comp)lista.push({arq:m.x,data:'Ontem',st:'conferido',comp:m.comp});else lista.push({arq:m.x,data:'Hoje, '+m.h,st:'conferir',ref:m})}});
  });
  F.hooks.grupo=function(txt){var g=CONV.filter(function(c){return c.id===101})[0];g.msgs.push({de:'e',t:'txt',x:txt,h:agora(),d:'Hoje'});g.ord=++seq;pintarLista();if(sel===g)pintarMsgs()};
  F.quandoMudar(function(p){var c=sel&&pag(sel);pintarLista();if(c===p){pintarTopo();var fc=document.getElementById('cv-ficha');if(fc&&fc.isConnected)F.mount(fc,p)}});
}
/* lista */
function filtradas(){
  var t=so(busca.trim()),n=nums(busca);
  return ativas().filter(FIL[aba]).filter(function(c){
    if(!t)return true;
    if(so(nome(c)).indexOf(t)>-1)return true;
    var p=pag(c);if(!p)return false;
    if(n&&(nums(p.fone).indexOf(n)>-1||p.lojas.some(function(l){return l.gs.indexOf(n)>-1})))return true;
    return p.lojas.some(function(l){return so(l.n).indexOf(t)>-1});
  }).sort(function(a,b){return (b.fixa?1:0)-(a.fixa?1:0)||b.ord-a.ord});
}
function chipsC(c){
  var p=pag(c),h='';
  if(p)h+=F.selo(p);
  if(!c.dono)h+='<span class="cv-tag sd">Sem dono</span>';
  return h+c.etq.map(function(e){return '<span class="cv-tag">'+esc(e)+'</span>'}).join('');
}
function item(c){
  var m=ultima(c),h=m.d==='Ontem'?'Ontem':m.h;
  return '<div class="cv-item'+(sel===c?' sel':'')+'" data-c="'+c.id+'" role="button" tabindex="0"><span class="cv-av'+(c.grupo?' g':'')+'">'+(c.grupo?ic('users'):esc(iniciais(nome(c))))+'</span>'+
   '<div class="cv-mid"><div class="cv-l1"><b>'+esc(nome(c))+'</b><time>'+h+'</time></div>'+
   '<div class="cv-l2"><span class="cv-prev">'+esc(preview(m))+'</span>'+(c.fixa?'<span class="cv-pin" title="Fixada">'+ic('pin')+'</span>':'')+(c.un?'<span class="cv-un" aria-label="'+c.un+' não lidas">'+c.un+'</span>':'')+'</div>'+
   '<div class="cv-l3">'+chipsC(c)+'</div></div><button class="cv-mn" data-mn="'+c.id+'" aria-label="Mais opções" title="Mais opções">'+ic('more-vertical')+'</button></div>';
}
function pintarLista(){
  var a=ativas(),tabs=document.getElementById('cv-tabs');if(!tabs)return;
  tabs.innerHTML=ABAS.map(function(x){var n=a.filter(FIL[x[0]]).length;return '<button class="cv-tab" data-aba="'+x[0]+'" aria-pressed="'+(aba===x[0])+'">'+x[1]+' <b>'+n+'</b></button>'}).join('');
  var l=filtradas();
  document.getElementById('cv-lista').innerHTML=l.length?l.map(item).join(''):'<div class="cv-vazio"><b>Nenhuma conversa aqui.</b><br>Troque a aba ou a busca.</div>';
  U.icones();
}
/* conversa */
function topoHtml(c){
  var p=pag(c);
  return '<button class="btn-voltar" data-voltar aria-label="Voltar para a lista">'+ic('arrow-left')+'</button><span class="cv-av'+(c.grupo?' g':'')+'">'+(c.grupo?ic('users'):esc(iniciais(nome(c))))+'</span>'+
   '<div class="ch-nome"><b>'+esc(nome(c))+'</b><div class="ch-sub">'+(p?'<span class="mono">'+esc(p.fone)+'</span>'+F.selo(p):'<span>Grupo · '+(c.id===101?'4':'6')+' participantes</span>')+(c.dono?'<span class="ch-dono">Atendente: '+esc(c.dono)+'</span>':'<span class="cv-tag sd">Sem dono</span>')+'</div></div>'+
   '<div class="ch-acoes">'+(p?'<button class="btn sec btn-ficha" data-ficha style="width:auto;padding:0 12px">Ficha</button><button class="btn sec" data-robo aria-pressed="'+c.robo+'" title="Só quem tem permissão liga ou desliga o robô" style="width:auto;padding:0 12px"><span class="robo-p '+(c.robo?'on':'')+'"></span>Robô '+(c.robo?'ON':'OFF')+'</button><button class="btn" data-cobrar style="width:auto;padding:0 14px">Enviar cobrança</button>':'')+'</div>';
}
function pintarTopo(){var c=sel,t=document.getElementById('ch-topo');if(c&&t){t.innerHTML=topoHtml(c);U.icones()}}
function msgHtml(c,m,i){
  var cls=m.de==='p'?'m-p':m.de==='e'?'m-e':'m-n',corpo;
  if(m.apagada)corpo='<i class="m-ap">Mensagem apagada</i>';
  else if(m.t==='txt')corpo='<span>'+esc(m.x).replace(/\n/g,'<br>')+'</span>';
  else if(m.t==='aud')corpo='<div class="aud"><span class="aud-p">'+ic('play')+'</span><span class="aud-b"><i></i></span><span class="mono">'+esc(m.x)+'</span></div>';
  else if(m.t==='img')corpo='<div class="anexo img">'+ic('image')+'<span>'+esc(m.x)+'</span></div>';
  else corpo='<div class="anexo">'+ic('file-text')+'<span>'+esc(m.x)+'</span></div>';
  var p=pag(c),tags='';
  if(m.de==='p'&&(m.t==='img'||m.t==='pdf')&&p){var e=F.comprovantes(p).filter(function(x){return x.ref===m||x.arq===m.x})[0];tags=e&&e.st==='conferido'?'<span class="m-tag ok">Comprovante conferido</span>':(m.att?'<span class="m-tag">Comprovante · '+esc(m.att)+' · a conferir</span>':'<span class="m-tag at">A conferir</span>')}
  if(m.feita)tags+='<span class="m-tag">Cobrança feita</span>';
  return '<div class="m '+cls+'" data-i="'+i+'">'+(m.de==='n'?'<div class="m-nota">Nota interna · só a equipe vê</div>':'')+(m.q?'<div class="m-q">'+esc(m.q)+'</div>':'')+corpo+(tags?'<div class="m-tags">'+tags+'</div>':'')+
    '<div class="m-meta"><span>'+m.h+(m.ed?' · editada':'')+'</span>'+(m.apagada?'':'<button class="m-mn" data-mm="'+i+'" aria-label="Ações da mensagem">'+ic('chevron-down')+'</button>')+'</div></div>';
}
function pintarMsgs(){
  var c=sel,box=document.getElementById('ch-msgs');if(!c||!box)return;
  var d=null,h='';
  c.msgs.forEach(function(m,i){if(m.d!==d){d=m.d;h+='<div class="m-dia"><span>'+esc(d)+'</span></div>'}h+=msgHtml(c,m,i)});
  box.innerHTML=h;U.icones();box.scrollTop=box.scrollHeight;
}
function compHtml(c){
  var grupo=!!c.grupo;
  return '<div class="ch-compor">'+
   '<div class="ch-modo" role="group" aria-label="Tipo de envio"><button data-modo="resp" aria-pressed="'+(modo==='resp')+'">Responder</button><button data-modo="nota" aria-pressed="'+(modo==='nota')+'">Nota interna</button><span class="ch-dica">Digite / para respostas rápidas</span></div>'+
   '<div id="ch-ctx"></div><div id="qr" class="qr" hidden></div>'+
   '<div class="ch-linha"><button class="btn sec ch-ic" data-anexo aria-label="Anexar arquivo" title="Anexar arquivo">'+ic('paperclip')+'</button><button class="btn sec ch-ic" data-qr aria-label="Respostas rápidas" title="Respostas rápidas">'+ic('zap')+'</button>'+
   '<textarea id="ch-txt" rows="1" placeholder="'+(modo==='nota'?'Escreva uma nota interna. O pagador não vê.':'Escreva uma mensagem')+'"></textarea><button class="btn" data-enviar style="width:auto;padding:0 16px">'+(modo==='nota'?'Salvar nota':'Enviar')+'</button></div></div>';
}
function ctxHtml(){
  if(edit)return '<div class="ch-ctx">'+ic('pencil')+'<span>Editando mensagem</span><button data-cancelctx aria-label="Cancelar edição">'+ic('x')+'</button></div>';
  if(resp)return '<div class="ch-ctx">'+ic('corner-up-left')+'<span>Respondendo: '+esc(resp.x)+'</span><button data-cancelctx aria-label="Cancelar resposta">'+ic('x')+'</button></div>';
  return '';
}
function pintarCtx(){var x=document.getElementById('ch-ctx');if(x){x.innerHTML=ctxHtml();U.icones()}}
function abrirConversa(c,mobile){
  sel=c;resp=null;edit=null;modo='resp';c.un=0;
  var cv=document.getElementById('conv');if(mobile)cv.classList.add('chat');
  document.getElementById('cv-chat').innerHTML='<div class="ch-topo" id="ch-topo">'+topoHtml(c)+'</div><div class="ch-msgs" id="ch-msgs"></div>'+compHtml(c);
  pintarMsgs();pintarLista();pintarFicha();U.icones();
}
function pintarFicha(){
  var c=sel,f=document.getElementById('cv-ficha');if(!f||!c)return;
  var p=pag(c);
  if(p)F.mount(f,p);
  else f.innerHTML='<div class="f-topo"><h3>'+esc(c.grupo)+'</h3><div class="f-topo-l"><span>Grupo interno da equipe</span></div></div><section class="fb"><div class="fb-corpo"><div class="f-sub">Participantes</div>'+['Marina','Rafael','Juliana','Carlos'].slice(0,c.id===101?4:4).map(function(n){return '<div class="f-lin"><div class="pg">'+n+'</div><div class="nt">Atendente</div></div>'}).join('')+'<div class="f-vazio">Grupos não têm ficha de pagador.</div></div></section>';
}
function enviar(){
  var c=sel,t=document.getElementById('ch-txt'),x=t.value.trim();if(!x)return;
  if(edit){edit.x=x;edit.ed=true;edit=null;t.value='';pintarCtx();pintarMsgs();pintarLista();U.toast('Mensagem editada.');return}
  var m={de:modo==='nota'?'n':'e',t:'txt',x:x,h:agora(),d:'Hoje'};if(resp&&modo!=='nota')m.q=resp.x;
  c.msgs.push(m);c.ord=++seq;resp=null;t.value='';t.style.height='';pintarCtx();
  if(modo!=='nota'&&c.robo)c.robo=c.robo;
  pintarMsgs();pintarLista();qrFechar();
}
function qrAbrir(filtro){
  var lista=QR.filter(function(q){return !filtro||q[0].indexOf(filtro)===0}),b=document.getElementById('qr');
  if(!lista.length){qrFechar();return}
  b.innerHTML=lista.map(function(q){return '<button data-qri="'+q[0]+'"><b>/'+q[0]+'</b><span>'+esc(q[1])+'</span></button>'}).join('');b.hidden=false;
}
function qrFechar(){var b=document.getElementById('qr');if(b)b.hidden=true}
function usarQR(id){var q=QR.filter(function(x){return x[0]===id})[0],t=document.getElementById('ch-txt');t.value=q[1];qrFechar();t.focus()}
function cobrancaDialog(c){
  var p=pag(c),cb=F.cobranca(p),pr=p.nome.split(' ')[0];pr=pr.charAt(0)+pr.slice(1).toLowerCase();
  var txt='Olá, '+pr+'! Segue a cobrança de '+cb.comp+':\n\n'+cb.itens.map(function(i){return '• '+i[0]+': '+F.R(i[1])}).join('\n')+'\n\nTotal: '+F.R(cb.total)+'\nVencimento: dia 20\n\nQualquer dúvida é só responder por aqui.';
  U.modal({titulo:'Enviar cobrança de '+cb.comp,ok:'Enviar cobrança',html:'<p class="dica-m">Mensagem montada com '+cb.itens.length+(cb.itens.length===1?' loja':' lojas')+' e o total. Revise e envie.</p><textarea id="cb-txt" class="cb-area" rows="11">'+esc(txt)+'</textarea>',
    onOk:function(m){var x=m.querySelector('#cb-txt').value.trim();if(!x)return false;c.msgs.push({de:'e',t:'txt',x:x,h:agora(),d:'Hoje',feita:true});c.ord=++seq;F.evento(p,'Cobrança de setembro enviada por WhatsApp');pintarMsgs();pintarLista();pintarFicha();U.toast('Cobrança enviada.')}});
}
function acaoMsg(c,m,id){
  var p=pag(c);
  if(id==='responder'){resp=m;edit=null;pintarCtx();document.getElementById('ch-txt').focus()}
  else if(id==='editar'){edit=m;resp=null;pintarCtx();var t=document.getElementById('ch-txt');t.value=m.x;t.focus()}
  else if(id==='apagar'){U.modal({titulo:'Apagar mensagem?',html:'<p>A mensagem some da conversa para todos.</p>',ok:'Apagar',perigo:true,onOk:function(){m.apagada=true;pintarMsgs();pintarLista();U.toast('Mensagem apagada.')}})}
  else if(id==='encaminhar'){
    var op=ativas().filter(function(x){return x!==c}).map(function(x){return '<option value="'+x.id+'">'+esc(nome(x))+'</option>'}).join('');
    U.modal({titulo:'Encaminhar mensagem',ok:'Encaminhar',html:'<div class="campo"><label for="en-p">Encaminhar para</label><select class="sel" id="en-p">'+op+'</select></div>',onOk:function(mm){var d=CONV.filter(function(x){return String(x.id)===mm.querySelector('#en-p').value})[0];d.msgs.push({de:'e',t:m.t,x:m.x,h:agora(),d:'Hoje',q:'Encaminhada'});d.ord=++seq;pintarLista();U.toast('Encaminhada para '+nome(d)+'.')}});
  }
  else if(id==='comprovante'){
    var sug=p.fin==='acordo'?'Parcela do acordo':'09/2026';
    U.modal({titulo:'Anexar como comprovante',ok:'Anexar',html:'<p class="dica-m">Competência sugerida: <b>'+sug+'</b>.</p><div class="campo"><label for="cp-c">Competência</label><select class="sel" id="cp-c"><option>'+sug+'</option><option>08/2026</option><option>07/2026</option></select></div>',
      onOk:function(mm){var comp=mm.querySelector('#cp-c').value;m.att=comp;var e=F.comprovantes(p).filter(function(x){return x.ref===m})[0];if(!e){F.comprovantes(p).push({arq:m.x,data:'Hoje, '+m.h,st:'conferir',ref:m})}
        F.comprovantes(p).filter(function(x){return x.ref===m})[0].comp=comp;F.evento(p,'Comprovante '+m.x+' anexado à competência '+comp);pintarMsgs();pintarLista();pintarFicha();U.toast('Comprovante anexado à competência '+comp+'.')}});
  }
  else if(id==='promessa'){
    U.modal({titulo:'Registrar promessa de pagamento',ok:'Registrar promessa',html:'<div class="campo"><label for="pr-d">Data prometida</label><input id="pr-d" type="date"></div><small class="erro" id="pr-e" hidden>Informe a data da promessa.</small>',
      onOk:function(mm){var d=mm.querySelector('#pr-d').value;if(!d){mm.querySelector('#pr-e').hidden=false;return false}var a=d.split('-'),tx=a[2]+'/'+a[1]+'/'+a[0];p.promessa={data:tx};p.retorno=a[2]+'/'+a[1]+' às 10h';F.evento(p,'Promessa registrada para '+tx);pintarFicha();pintarLista();U.toast('Promessa registrada.')}});
  }
  else if(id==='feita'){m.feita=true;F.evento(p,'Cobrança marcada como feita');pintarMsgs();pintarFicha();U.toast('Marcada como cobrança feita.')}
  else if(id==='saida'){
    U.modal({titulo:'Registrar pedido de saída',ok:'Registrar pedido',html:'<div class="campo"><label for="sa-m">Motivo</label><select class="sel" id="sa-m"><option>Encerrou a loja</option><option>Mudou de plataforma</option><option>Insatisfeito com o serviço</option><option>Outro motivo</option></select></div>',
      onOk:function(mm){var mo=mm.querySelector('#sa-m').value;F.evento(p,'Pedido de saída registrado: '+mo);pintarFicha();U.toast('Pedido de saída registrado.')}});
  }
}
function menuMsg(a,i){
  var c=sel,m=c.msgs[i],p=pag(c),it=[{id:'responder',t:'Responder',icone:'corner-up-left'},{id:'encaminhar',t:'Encaminhar',icone:'forward'}];
  if(m.de!=='p'&&m.t==='txt')it.push({id:'editar',t:'Editar',icone:'pencil'});
  if(m.de!=='p')it.push({id:'apagar',t:'Apagar',icone:'trash-2',perigo:true});
  if(p){it.push({sep:1});
    if(m.de==='p'&&(m.t==='img'||m.t==='pdf'))it.push({id:'comprovante',t:'Anexar como comprovante',icone:'paperclip'});
    it.push({id:'promessa',t:'Registrar promessa',icone:'calendar-clock'},{id:'feita',t:'Marcar como cobrança feita',icone:'check-circle'},{id:'saida',t:'Registrar pedido de saída',icone:'log-out'})}
  U.menu(a,it,function(id){acaoMsg(c,m,id)});
}
function menuConv(a,id){
  var c=CONV.filter(function(x){return x.id===id})[0];
  function principal(){U.menu(a,[{id:'atribuir',t:'Atribuir a um atendente',icone:'user-plus'},{id:'etiquetar',t:'Etiquetar',icone:'tag'},{id:'fixar',t:c.fixa?'Desafixar':'Fixar',icone:'pin'},{id:'arquivar',t:'Arquivar',icone:'archive'},{id:'naolida',t:'Marcar como não lida',icone:'mail'}],function(x){
    if(x==='atribuir')U.menu(a,MK_ATEND.map(function(n){return {id:n,t:n,marca:c.dono===n}}).concat([{sep:1},{id:'_nenhum',t:'Sem dono',marca:!c.dono}]),function(n){c.dono=n==='_nenhum'?null:n;pintarLista();if(sel===c)pintarTopo();U.toast(c.dono?'Atribuída a '+c.dono+'.':'Conversa sem dono.')});
    else if(x==='etiquetar')U.menu(a,MK_ETQ.map(function(n){return {id:n,t:n,marca:c.etq.indexOf(n)>-1}}),function(n){var i=c.etq.indexOf(n);if(i>-1)c.etq.splice(i,1);else c.etq.push(n);pintarLista()});
    else if(x==='fixar'){c.fixa=!c.fixa;pintarLista()}
    else if(x==='arquivar'){c.arq=true;if(sel===c){sel=null;document.getElementById('cv-chat').innerHTML=vazioChat();document.getElementById('cv-ficha').innerHTML='';document.getElementById('conv').classList.remove('chat')}pintarLista();U.toast('Conversa arquivada.')}
    else if(x==='naolida'){c.un=Math.max(1,c.un);pintarLista();U.toast('Marcada como não lida.')}
  })}
  principal();
}
function vazioChat(){return '<div class="cv-vazio grande">'+ic('message-square')+'<b>Selecione uma conversa</b><span>Escolha uma conversa da lista para ver as mensagens.</span></div>'}
function render(alvo){
  if(alvo)el=alvo;iniciar();
  el.innerHTML='<div class="conv-w"><div class="conv" id="conv"><section class="cv-col1"><div class="cv-cab"><h1>Conversas</h1><span class="sub" id="cv-total"></span></div>'+
   '<label class="busca-p cv-busca"><span class="sr">Buscar</span>'+ic('search')+'<input id="cv-q" type="search" placeholder="Buscar por nome, telefone, GS ou loja" value="'+esc(busca)+'"></label>'+
   '<div class="cv-tabs" id="cv-tabs"></div><div class="cv-lista" id="cv-lista"></div></section>'+
   '<section class="cv-col2" id="cv-chat"></section><aside class="cv-col3" id="cv-ficha" aria-label="Ficha do pagador"></aside></div></div>';
  document.getElementById('cv-total').textContent=ativas().length+' conversas do WhatsApp';
  pintarLista();
  if(sel&&!sel.arq){var s=sel;abrirConversa(s,false)}else{sel=null;document.getElementById('cv-chat').innerHTML=vazioChat();
    var lf=filtradas(),primeiro=lf.filter(function(c){return !c.grupo&&c.un>0})[0]||lf[0];if(primeiro&&window.matchMedia('(min-width:641px)').matches)abrirConversa(primeiro,false)}
}
/* eventos */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target;var b;
  if((b=t.closest('[data-mn]'))){e.stopPropagation();menuConv(b,+b.dataset.mn);return}
  if((b=t.closest('[data-c]'))){abrirConversa(CONV.filter(function(c){return String(c.id)===b.dataset.c})[0],true);return}
  if((b=t.closest('[data-aba]'))){aba=b.dataset.aba;pintarLista();return}
  if(t.closest('[data-voltar]')){document.getElementById('conv').classList.remove('chat');return}
  if(t.closest('[data-ficha]')){var p=pag(sel);if(p)F.abrir(p);return}
  if((b=t.closest('[data-robo]'))){sel.robo=!sel.robo;pintarTopo();U.toast('Robô '+(sel.robo?'ligado':'desligado')+' nesta conversa.');return}
  if(t.closest('[data-cobrar]')){cobrancaDialog(sel);return}
  if((b=t.closest('[data-mm]'))){menuMsg(b,+b.dataset.mm);return}
  if((b=t.closest('[data-modo]'))){modo=b.dataset.modo;edit=null;resp=null;var cx=document.getElementById('cv-chat'),v=document.getElementById('ch-txt').value;cx.querySelector('.ch-compor').outerHTML=compHtml(sel);document.getElementById('ch-txt').value=v;U.icones();return}
  if(t.closest('[data-enviar]')){enviar();return}
  if(t.closest('[data-cancelctx]')){edit=null;resp=null;document.getElementById('ch-txt').value='';pintarCtx();return}
  if(t.closest('[data-anexo]')){U.toast('Anexar arquivo: exemplo, ainda sem função.');return}
  if(t.closest('[data-qr]')){var q=document.getElementById('qr');if(q.hidden)qrAbrir('');else qrFechar();return}
  if((b=t.closest('[data-qri]'))){usarQR(b.dataset.qri)}
});
document.addEventListener('input',function(e){
  if(!noEl(e))return;
  if(e.target.id==='cv-q'){busca=e.target.value;pintarLista()}
  if(e.target.id==='ch-txt'){var t=e.target;t.style.height='auto';t.style.height=Math.min(t.scrollHeight,120)+'px';if(t.value.charAt(0)==='/')qrAbrir(t.value.slice(1).toLowerCase());else qrFechar()}
});
document.addEventListener('keydown',function(e){
  if(!noEl(e))return;
  if(e.target.id==='ch-txt'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();var q=document.getElementById('qr');if(!q.hidden){var f=q.querySelector('[data-qri]');if(f){usarQR(f.dataset.qri);return}}enviar()}
  if(e.target.id==='ch-txt'&&e.key==='Escape')qrFechar();
  if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('cv-item')){abrirConversa(CONV.filter(function(c){return String(c.id)===e.target.dataset.c})[0],true)}
});
return {render:render};
})();
