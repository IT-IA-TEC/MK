/* Tela Configurações. Tudo que muda o comportamento da 40% fica aqui. Dados de exemplo. */
window.MKConfiguracoes=(function(){
var U=window.MKUI,esc=U.esc,ic=U.ic,el=null,aba='usuarios',pronto=false,EU='Marina Costa';
var MODS=[['dashboard','Dashboard'],['conversas','Conversas'],['pagadores','Pagadores e Lojas'],['marketplaces','Marketplaces'],['fechamento','Fechamento do mês'],['recebimentos','Recebimentos'],['inadimplencia','Inadimplência e Acordos'],['configuracoes','Configurações']];
var MODC={dashboard:'Dashboard',conversas:'Conversas',pagadores:'Pagadores',marketplaces:'Marketplaces',fechamento:'Fechamento',recebimentos:'Recebimentos',inadimplencia:'Inadimplência',configuracoes:'Configurações'};
var CFG=window.MK_CFG=window.MK_CFG||null;
var DRAFT={};
function agora(){var d=new Date();return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function so(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'')}
function fmt(v){if(v===true)return 'Sim';if(v===false)return 'Não';if(Array.isArray(v))return v.length?v.join(', '):'nenhum';return v===''||v===null||v===undefined?'vazio':String(v)}
function reg(onde,de,para){CFG.log.unshift({t:agora(),q:EU,o:onde,de:fmt(de),para:fmt(para)})}
function get(p){return p.split('.').reduce(function(o,k){return o[k]},CFG)}
function set(p,v){var a=p.split('.'),l=a.pop();a.reduce(function(o,k){return o[k]},CFG)[l]=v}
function sincAtend(){window.MK_ATEND=CFG.usuarios.filter(function(u){return u.atende}).map(function(u){return u.nome.split(' ')[0]})}
/* ---------- dados ---------- */
function iniciar(){
  if(pronto)return;pronto=true;
  var todos=MODS.map(function(m){return m[0]});
  CFG=window.MK_CFG={
    usuarios:[
      {id:1,nome:'Marina Costa',email:'marina@itmk.com.br',mods:todos.slice(),valores:true,atende:true},
      {id:2,nome:'Rafael Lima',email:'rafael@itmk.com.br',mods:todos.slice(),valores:true,atende:true},
      {id:3,nome:'Juliana Prado',email:'juliana@itmk.com.br',mods:['dashboard','conversas','pagadores','marketplaces','inadimplencia'],valores:true,atende:true},
      {id:4,nome:'Carlos Nogueira',email:'carlos@itmk.com.br',mods:['dashboard','conversas','pagadores','recebimentos'],valores:true,atende:true},
      {id:5,nome:'Patrícia Alves',email:'patricia@itmk.com.br',mods:['dashboard','fechamento','recebimentos','inadimplencia'],valores:true,atende:false}
    ],
    regras:{pct:40,venc:20,abre:1,ultimo:19,tol:0.02,baixaDias:365,parcela:true,maxParc:12,period:['Mensal','Quinzenal','Datas livres'],semMov:true},
    etapas:[
      {id:1,nome:'Lembrete',dia:-2,acao:'rev',modelo:'lembrete',ativa:true},
      {id:2,nome:'Vencimento',dia:0,acao:'rev',modelo:'lembrete',ativa:true},
      {id:3,nome:'Atraso 1',dia:3,acao:'rev',modelo:'atraso',ativa:true},
      {id:4,nome:'Atraso 2',dia:10,acao:'rev',modelo:'atraso',ativa:true},
      {id:5,nome:'Aviso de bloqueio',dia:20,acao:'auto',modelo:'aviso',ativa:true},
      {id:6,nome:'Pedir bloqueio',dia:25,acao:'equipe',modelo:'solic_bloq',ativa:true}
    ],
    pausas:{promessa:true,acordo:true},
    excecoes:[{id:1,pagador:'ALBERTO NUNES DE CARVALHO',regra:'Não cobrar'},{id:2,pagador:'ALEXANDRE TEIXEIRA GOMES',regra:'Régua mais firme'},{id:3,pagador:'ADRIANO APARECIDO SANTOS PEREIRA',regra:'Régua mais leve'}],
    modelos:[
      {id:'cobranca',nome:'Cobrança do mês',vars:['nome','competencia','lojas','faturado','imposto','quarenta','total','vencimento','pix'],texto:'Olá, {nome}! Segue o fechamento da competência {competencia}:\n\n{lojas}\n\nTotal a pagar: {total}\nVencimento: {vencimento}\nPix: {pix}\n\nDepois de pagar, envie o comprovante por aqui.'},
      {id:'lembrete',nome:'Lembrete de vencimento',vars:['nome','competencia','total','vencimento','pix'],texto:'Olá, {nome}! Passando para lembrar que a cobrança de {competencia} ({total}) vence em {vencimento}. Se já pagou, envie o comprovante por aqui.'},
      {id:'atraso',nome:'Cobrança em atraso',vars:['nome','competencia','total','dias','pix','suporte'],texto:'Olá, {nome}. A cobrança de {competencia} segue em aberto há {dias} dias ({total}). Pix: {pix}. Se precisar de ajuda, fale com {suporte}.'},
      {id:'aviso',nome:'Aviso de bloqueio',vars:['nome','competencia','total','dias','suporte'],texto:'Aviso, {nome}: a cobrança de {competencia} está em aberto há {dias} dias ({total}). Sem o pagamento, suas lojas serão bloqueadas. Fale com {suporte} hoje.'},
      {id:'pedido_comp',nome:'Pedido de comprovante',vars:['nome','total','pix'],texto:'Olá, {nome}! Para confirmar seu pagamento de {total}, envie o comprovante por aqui.'},
      {id:'confirma',nome:'Confirmação de pagamento recebido',vars:['nome','total','competencia'],texto:'Olá, {nome}! Recebemos seu pagamento de {total} referente a {competencia}. Obrigado!'},
      {id:'solic_bloq',nome:'Solicitação de bloqueio ao grupo',vars:['nome','lojas','suporte'],texto:'Bloquear as lojas de {nome}:\n{lojas}'},
      {id:'solic_desb',nome:'Solicitação de desbloqueio ao grupo',vars:['nome','lojas','suporte'],texto:'Liberar as lojas de {nome}:\n{lojas}'},
      {id:'rapidas',nome:'Respostas rápidas da conversa',rapidas:[
        {atalho:'comprovante',texto:'Recebemos seu comprovante. Vamos conferir e confirmar o pagamento em breve.'},
        {atalho:'lembrete',texto:'Olá! Passando para lembrar que a cobrança vence dia 20. Se já pagou, envie o comprovante por aqui.'},
        {atalho:'bloqueio',texto:'Aviso: sua loja será bloqueada por falta de pagamento. Para evitar o bloqueio, envie o comprovante ou fale com a gente hoje.'},
        {atalho:'pix',texto:'Dados para pagamento por Pix. Chave (CNPJ): {pix}. Depois de pagar, envie o comprovante por aqui.'}]}
    ],
    bloqueio:{grupo:'Grupo de bloqueio',prazo:15,nome:true,gs:true,codigo:true,vcard:true,confirmam:['Rafael Lima','Marina Costa']},
    etiquetas:[{id:1,nome:'VIP',cor:'verde'},{id:2,nome:'Negociação',cor:'azul'},{id:3,nome:'Reclamação',cor:'vermelho'},{id:4,nome:'Novo cliente',cor:'amarelo'}],
    papeis:[{id:1,nome:'Pagamento',sub:['Paga pelo pagador','Paga por terceiro']},{id:2,nome:'Tira dúvida',sub:[]},{id:3,nome:'Recebe cobrança',sub:['Financeiro','Sócio']},{id:4,nome:'Envia comprovante',sub:[]},{id:5,nome:'Questiona',sub:['Valor','Prazo']},{id:6,nome:'Problema de plataforma',sub:['Bloqueio','Anúncio','Conta']}],
    plataformas:['Shein','Mercado Livre','TikTok','Kwai','Shopee'],
    motivos:{baixa:['Passivo antigo sem chance de cobrança','Pagamento não registrado','Cobrança lançada por engano'],rejeicao:['Comprovante ilegível','Valor não confere','Não é pagamento da VHSS','Duplicado'],cancelamento:['Pagador desistiu','Pedido feito por engano','Loja continua ativa']},
    dados:{cnpj:'00.000.000/0001-00',recebedor:'VHSS Store',banco:'Itaú',suporteNome:'Atendimento IT.MK',suporteFone:'(11) 4002-8922',suporteEmail:'suporte@itmk.com.br',horario:'Segunda a sexta, das 9h às 18h',contas:[{id:1,banco:'Itaú',ag:'0312',conta:'44710-3',tipo:'Conta principal (Pix)'},{id:2,banco:'Itaú',ag:'0312',conta:'44711-1',tipo:'Conta de reserva'}]},
    recebimento:{provedor:'Asaas',ambiente:'teste',chavePix:'00.000.000/0001-00',validadeLinkDias:30,jurosMultaLigado:false,multaPct:2,jurosPct:1,modoPix:'pagador',basePadrao:'faturamento_total',
      acesso:{'Asaas':{t:'12/08/2026 10:05',q:'Rafael Lima'},'Banco Inter':null},cert:null,certSenha:null,clientId:'',seg:{tokenAviso:{t:'12/08/2026 10:06',q:'Rafael Lima'},key:null},aviso:{sit:'Recebendo',ultimo:{t:'29/09/2026 14:32',v:'R$ 2.478,84'}}},
    log:[{t:'01/09/2026 08:40',q:'Marina Costa',o:'Regras padrão · Tolerância de comprovante',de:'R$ 0,05',para:'R$ 0,02'},{t:'25/08/2026 17:12',q:'Rafael Lima',o:'Régua · Atraso 2 · Dia',de:'7',para:'10'}]
  };
  CFG.usuarios.forEach(function(u){u.aprovaRobo=true});
  CFG.modelos.forEach(function(m){if(m.id==='rapidas'){m.situacao='Não se aplica';return}m.situacao='Aprovado';m.situacaoPor='Marina Costa';m.situacaoEm='01/09/2026 09:15'});
  CFG.modelos.filter(function(m){return m.id==='solic_desb'})[0].situacao='Rascunho';CFG.modelos.filter(function(m){return m.id==='solic_desb'})[0].situacaoPor='';CFG.modelos.filter(function(m){return m.id==='solic_desb'})[0].situacaoEm='';
  sincAtend();
}
/* ---------- componentes ---------- */
function sw(k,on,rot,extra){return '<label class="sw"><input type="checkbox" role="switch" '+(extra||'')+' data-k="'+k+'"'+(on?' checked':'')+' aria-label="'+esc(rot)+'"><span></span></label>'}
function campo(k,l,t,o){
  o=o||{};var v=get(k);if(DRAFT[k]!==undefined)v=DRAFT[k];
  var h='<div class="campo cf-c"><label for="cf-'+k+'">'+l+'</label>';
  if(t==='num')h+='<div class="cf-in"><input id="cf-'+k+'" data-f="'+k+'" inputmode="decimal" value="'+esc(String(v).replace('.',','))+'">'+(o.suf?'<span>'+o.suf+'</span>':'')+'</div>';
  else if(t==='text')h+='<input id="cf-'+k+'" data-f="'+k+'" value="'+esc(v)+'"'+(o.ph?' placeholder="'+o.ph+'"':'')+'>';
  else if(t==='sel')h+='<select class="sel" id="cf-'+k+'" data-f="'+k+'">'+o.op.map(function(x){return '<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>';
  else if(t==='bool')h='<div class="cf-sw"><div><b>'+l+'</b>'+(o.d?'<small>'+o.d+'</small>':'')+'</div>'+sw(k,v,l,'data-f="'+k+'"')+'</div>';
  else if(t==='multi')h+='<div class="cf-multi">'+o.op.map(function(x){return '<label class="lembrar"><input type="checkbox" data-f="'+k+'" data-m="'+esc(x)+'"'+(v.indexOf(x)>-1?' checked':'')+'>'+esc(x)+'</label>'}).join('')+'</div>';
  if(o.d&&t!=='bool')h+='<small class="nt">'+o.d+'</small>';
  return h+(t==='bool'?'':'<small class="erro" id="cf-'+k+'-e" hidden></small></div>');
}
function barraSalvar(){return '<div class="cf-salvar" id="cf-salvar"><span id="cf-pend" class="nt">Nenhuma alteração pendente.</span><div class="cf-sv-b"><button class="btn sec" data-cf="descartar" style="width:auto;padding:0 14px" disabled>Descartar</button><button class="btn" data-cf="salvar" style="width:auto;padding:0 16px" disabled>Salvar alterações</button></div></div>'}
var CAMPOS={
  regras:[['regras.pct','Percentual da 40%','num',{suf:'%',n:[1,100],d:'Padrão para todas as lojas. A exceção de uma loja é feita na ficha dela.'}],['regras.venc','Dia do vencimento','num',{suf:'do mês seguinte',n:[1,28],d:'Vencimento no dia informado, no mês seguinte à competência.'}],['regras.abre','Dia de abertura da competência','num',{suf:'do mês',n:[1,28]}],['regras.ultimo','Último dia para cálculo','num',{suf:'do mês',n:[1,28]}],['regras.tol','Tolerância do comprovante','num',{suf:'R$',n:[0,1]}],['regras.baixaDias','Prazo de baixa sugerida','num',{suf:'dias sem movimento',n:[30,3650],d:'Cobrança sem movimento há mais dias que isso vai para a fila de Baixas.'}],['regras.parcela','Permitir parcelamento','bool',{d:'Liga ou desliga a criação de acordos parcelados.'}],['regras.maxParc','Máximo de parcelas','num',{n:[1,36]}],['regras.period','Periodicidades aceitas','multi',{op:['Mensal','Quinzenal','Datas livres']}],['regras.semMov','Não gerar cobrança de valor 0','bool',{d:'Mês sem movimento não gera cobrança. Ligado por padrão.'}]],
  bloqueio:[['bloqueio.grupo','Grupo oficial de bloqueio','sel',{op:['Grupo de bloqueio','Equipe de cobrança','Bloqueios e liberações'],d:'Grupo do WhatsApp que recebe as solicitações.'}],['bloqueio.prazo','Prazo de atraso para entrar em “A pedir”','num',{suf:'dias',n:[1,180]}],['bloqueio.nome','Incluir o nome da loja','bool'],['bloqueio.gs','Incluir o GS','bool'],['bloqueio.codigo','Incluir o código da loja','bool'],['bloqueio.vcard','Anexar o vCard do contato','bool',{d:'O grupo recebe o contato do pagador junto com a lista.'}],['bloqueio.confirmam','Quem confirma bloqueio e desbloqueio','multi',{op:null}]],
  dados:[['dados.cnpj','CNPJ do Pix','text',{ph:'00.000.000/0000-00'}],['dados.recebedor','Nome do recebedor','text'],['dados.banco','Banco','text'],['dados.suporteNome','Contato de suporte: nome','text'],['dados.suporteFone','Contato de suporte: telefone','text',{ph:'(00) 00000-0000'}],['dados.suporteEmail','Contato de suporte: e-mail','text'],['dados.horario','Horário de atendimento','text']]
};
function campos(ch,filtro){
  return CAMPOS[ch].filter(function(c){return !filtro||filtro.indexOf(c[0])>-1}).map(function(c){
    var o=c[3]||{};if(c[0]==='bloqueio.confirmam')o=Object.assign({},o,{op:CFG.usuarios.map(function(u){return u.nome})});
    return campo(c[0],c[1],c[2],o)}).join('');
}
/* ---------- abas ---------- */
function abaUsuarios(){
  var n={};window.MK_CONV.forEach(function(c){if(!c.arq&&c.dono)n[c.dono]=(n[c.dono]||0)+1});
  var sd=window.MK_CONV.filter(function(c){return !c.arq&&!c.dono}).length;
  var t='<div class="fe-barra"><div class="fe-info">Cada item do menu tem seu próprio controle. Toda conversa fica visível a quem tem o módulo Conversas, com ou sem dono.</div><button class="btn" data-cf="novouser" style="width:auto;padding:0 14px">Adicionar usuário</button></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-cf"><colgroup><col style="width:14%">'+MODS.map(function(){return '<col style="width:6.4%">'}).join('')+'<col style="width:7%"><col style="width:7.4%"><col style="width:9.2%"></colgroup><thead><tr><th>Usuário</th>'+MODS.map(function(m){return '<th class="c">'+MODC[m[0]]+'</th>'}).join('')+'<th class="c">Atende conversas</th><th class="c">Aprova a fila do robô</th><th></th></tr></thead><tbody>'+
   CFG.usuarios.map(function(u){return '<tr><td data-rot="Usuário"><div class="lj-n">'+esc(u.nome)+'</div><div class="nt">'+esc(u.email)+'</div></td>'+MODS.map(function(m){return '<td class="c" data-rot="'+esc(m[1])+'">'+sw('u.'+u.id+'.m.'+m[0],u.mods.indexOf(m[0])>-1,u.nome+': '+m[1])+'</td>'}).join('')+'<td class="c" data-rot="Atende conversas">'+sw('u.'+u.id+'.atende',u.atende,u.nome+': atende conversas')+'</td><td class="c" data-rot="Aprova a fila do robô">'+sw('u.'+u.id+'.aprova',u.aprovaRobo!==false,u.nome+': aprova a fila do robô')+'</td><td class="c"><button class="btn sec" data-cf="rmuser" data-id="'+u.id+'" style="width:auto;padding:0 10px;height:30px">Remover</button></td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('users')+'<h3>Dono das conversas: quem atende quem</h3><span class="c">'+sd+' sem dono</span></div>'+CFG.usuarios.filter(function(u){return u.atende}).map(function(u){var k=u.nome.split(' ')[0];return '<div class="ac-lin cf-dono"><div><div class="pg">'+esc(u.nome)+'</div><div class="nt">'+(n[k]||0)+(n[k]===1?' conversa':' conversas')+'</div></div><div></div><div></div><div class="ac-bt"><button class="btn sec" data-cf="transf" data-id="'+u.id+'">Transferir conversas</button></div></div>'}).join('')+'</div>';
  return t;
}
function abaRegras(){
  function cx(tit,ico,ks,ex){return '<div class="cx"><div class="cx-cab">'+ic(ico)+'<h3>'+tit+'</h3></div><div class="cf-corpo">'+campos('regras',ks)+(ex||'')+'</div></div>'}
  return '<div class="fe-info">Mudança de regra vale daqui para frente. As cobranças já fechadas não são recalculadas.</div><div class="cf-grade2">'+
   cx('Percentual, base e vencimento','percent',['regras.pct','regras.venc'],rcCampo('basePadrao','Base padrão da cobrança',rcSel('basePadrao',BASESL().map(function(b){return [b.id,b.nome]}),CFG.recebimento.basePadrao),'Vale para todas as lojas. No Fechamento do mês, cada loja pode usar outra base.'))+cx('Fechamento e meses sem movimento','calendar-check',['regras.abre','regras.ultimo','regras.semMov'])+cx('Comprovantes e baixas','receipt-text',['regras.tol','regras.baixaDias'])+cx('Parcelamento','handshake',['regras.parcela','regras.maxParc','regras.period'])+'</div>'+barraSalvar();
}
var ACOES={equipe:'Só avisar a equipe',rev:'Enviar mensagem com revisão',auto:'Enviar mensagem sem revisão'};
function quando(d){return d<0?'antes':d===0?'no dia':'depois'}
function abaRegua(){
  var et=CFG.etapas.slice().sort(function(a,b){return a.dia-b.dia}),mods=aprovados();
  return '<div class="fe-barra"><div class="fe-info">Sequência automática por dias em relação ao vencimento. Promessa ativa e acordo em dia pausam a régua.</div><button class="btn" data-cf="novaetapa" style="width:auto;padding:0 14px">Nova etapa</button></div>'+
   '<div class="tab-cartao"><table class="tab-fe tab-cf"><colgroup><col style="width:13%"><col style="width:27%"><col style="width:24%"><col style="width:20%"><col style="width:6%"><col style="width:10%"></colgroup><thead><tr><th>Etapa</th><th>Quando (em relação ao vencimento)</th><th>Ação</th><th>Modelo de mensagem</th><th class="c">Ativa</th><th></th></tr></thead><tbody>'+
   et.map(function(e){return '<tr><td data-rot="Etapa"><div class="lj-n">'+esc(e.nome)+'</div></td><td data-rot="Quando"><div class="cf-quando"><input class="sel" data-et="'+e.id+'" data-ef="dias" inputmode="numeric" value="'+Math.abs(e.dia)+'" '+(e.dia===0?'disabled':'')+' aria-label="Dias da etapa '+esc(e.nome)+'"><select class="sel" data-et="'+e.id+'" data-ef="quando" aria-label="Quando, etapa '+esc(e.nome)+'">'+[['antes','dias antes'],['no dia','no dia'],['depois','dias depois']].map(function(o){return '<option value="'+o[0]+'"'+(quando(e.dia)===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div></td>'+
    '<td data-rot="Ação"><select class="sel" data-et="'+e.id+'" data-ef="acao" aria-label="Ação, etapa '+esc(e.nome)+'">'+Object.keys(ACOES).map(function(k){return '<option value="'+k+'"'+(e.acao===k?' selected':'')+'>'+ACOES[k]+'</option>'}).join('')+'</select></td>'+
    '<td data-rot="Modelo de mensagem"><select class="sel" data-et="'+e.id+'" data-ef="modelo" aria-label="Modelo, etapa '+esc(e.nome)+'">'+modOps(e.modelo,mods)+'</select>'+(modPend(e.modelo)?'<small class="erro cf-pend">Modelo precisa de nova aprovação.</small>':'')+'</td>'+
    '<td class="c" data-rot="Ativa">'+sw('et.'+e.id+'.ativa',e.ativa,'Etapa '+e.nome+' ativa')+'</td><td class="c"><button class="btn sec" data-cf="rmetapa" data-id="'+e.id+'" style="width:auto;padding:0 10px;height:30px">Remover</button></td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="cf-grade2"><div class="cx"><div class="cx-cab">'+ic('pause-circle')+'<h3>Pausas automáticas</h3></div><div class="cf-corpo">'+
    '<div class="cf-sw"><div><b>Promessa ativa pausa a régua</b><small>Enquanto houver promessa com data, nenhuma etapa dispara para o pagador.</small></div>'+sw('pausas.promessa',CFG.pausas.promessa,'Promessa pausa a régua')+'</div>'+
    '<div class="cf-sw"><div><b>Acordo em dia pausa a régua</b><small>Se uma parcela atrasar, a régua volta.</small></div>'+sw('pausas.acordo',CFG.pausas.acordo,'Acordo pausa a régua')+'</div>'+
    '<div class="fe-aviso"><span>O botão Robô ON/OFF do WhatsApp continua sendo o interruptor manual, sem mudança.</span></div></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('user-cog')+'<h3>Exceção por pagador</h3><button class="btn sec cx-bt" data-cf="novaexc" style="width:auto;padding:0 12px;height:30px">Adicionar exceção</button></div><div class="cf-corpo" style="padding-top:0"><p class="nt" style="padding:10px 0">A exceção é definida na ficha do pagador e substitui o tom leve ou forte de antes: Não cobrar, régua mais leve ou régua mais firme.</p>'+
    (CFG.excecoes.length?CFG.excecoes.map(function(x){return '<div class="cf-lin"><div style="min-width:0"><b>'+esc(x.pagador)+'</b></div>'+chipR(x.regra)+'<button class="ib" data-cf="rmexc" data-id="'+x.id+'" aria-label="Remover exceção de '+esc(x.pagador)+'" title="Remover">'+ic('x')+'</button></div>'}).join(''):'<div class="fe-vazio">Nenhuma exceção. Todos seguem a régua padrão.</div>')+'</div></div></div>';
}
function modPend(id){var m=CFG.modelos.filter(function(x){return x.id===id})[0];return !!m&&m.situacao!=='Aprovado'}
function modOps(atual,mods){var o=mods.map(function(m){return '<option value="'+m.id+'"'+(atual===m.id?' selected':'')+'>'+esc(m.nome)+'</option>'}).join('');if(modPend(atual)){var m=CFG.modelos.filter(function(x){return x.id===atual})[0];o='<option value="'+m.id+'" selected>'+esc(m.nome)+' ('+m.situacao.toLowerCase()+')</option>'+o}return o}
function chipR(r){return '<span class="fs '+(r==='Não cobrar'?'cn':r==='Régua mais firme'?'gr':'ok')+'">'+r+'</span>'}
var VARS={nome:'Primeiro nome do pagador',competencia:'Mês da cobrança',lojas:'Lista de lojas',faturado:'Total faturado',imposto:'Imposto',quarenta:'Valor da 40%',total:'Total a pagar',vencimento:'Data de vencimento',pix:'Pix (CNPJ e recebedor)',dias:'Dias de atraso',suporte:'Contato de suporte',valor:'Valor'};
var modeloSel='cobranca';
function amostra(){
  var d=CFG.dados;return {nome:'Adriano',competencia:'agosto/2026',lojas:'• LOJA KP MODAS LTDA (GS 56011980000182)\n  Faturado R$ 62.880,00 · Imposto R$ 5.099,30 · 40%: R$ 2.039,72\n• ADRIANO APARECIDO SANTOS PEREIRA (GS 37930011000180)\n  Faturado R$ 13.250,00 · Imposto R$ 1.097,81 · 40%: R$ 439,12',faturado:'R$ 76.130,00',imposto:'R$ 6.197,11',quarenta:'R$ 2.478,84',total:'R$ 2.478,84',vencimento:'20/09/2026',pix:d.cnpj+' · '+d.recebedor+' · '+d.banco,dias:'11',suporte:d.suporteNome+' '+d.suporteFone,valor:'R$ 1.855,50'};
}
function previa(t){var a=amostra();return t.replace(/\{(\w+)\}/g,function(m,k){return a[k]!==undefined?a[k]:m})}
function chipSit(m){var s=m.situacao;return '<span class="fs '+(s==='Aprovado'?'vd':s==='Reprovado'?'gr':'at')+'">'+s+'</span>'}
function sitTexto(m){return m.situacaoPor?m.situacao+' por '+esc(m.situacaoPor)+' em '+esc(m.situacaoEm)+'.':'Ainda não foi aprovado. Qualquer usuário pode aprovar.'}
function etapasDe(id){return CFG.etapas.filter(function(e){return e.modelo===id})}
function aprovados(){return CFG.modelos.filter(function(m){return m.texto&&m.situacao==='Aprovado'})}
function mudarSit(m,nova,motivo){var ant=m.situacao;m.situacao=nova;if(nova==='Rascunho'){m.situacaoPor='';m.situacaoEm=''}else{m.situacaoPor=EU;m.situacaoEm=agora()}reg('Modelos · '+m.nome+' · Situação',ant,nova+(nova==='Rascunho'?'':' por '+EU)+(motivo?' ('+motivo+')':''))}
function abaModelos(){
  var m=CFG.modelos.filter(function(x){return x.id===modeloSel})[0]||CFG.modelos[0];
  var lista=CFG.modelos.map(function(x){return '<button class="md-i" data-md="'+x.id+'" aria-pressed="'+(x.id===m.id)+'"><span>'+esc(x.nome)+'</span>'+(x.rapidas?'':chipSit(x))+'</button>'}).join('');
  var ed;
  if(m.rapidas){
    ed='<div class="cx-cab">'+ic('zap')+'<h3>'+esc(m.nome)+'</h3><button class="btn sec cx-bt" data-cf="novarapida" style="width:auto;padding:0 12px;height:30px">Nova resposta</button></div><div class="md-corpo">'+m.rapidas.map(function(r,i){return '<div class="md-rap"><div class="campo"><label for="rp-a'+i+'">Atalho</label><div class="cf-in"><span>/</span><input id="rp-a'+i+'" data-rp="'+i+'" data-rf="atalho" value="'+esc(r.atalho)+'"></div></div><div class="campo"><label for="rp-t'+i+'">Texto</label><textarea class="cb-area" rows="3" id="rp-t'+i+'" data-rp="'+i+'" data-rf="texto">'+esc(r.texto)+'</textarea><div class="nt md-pv-r">Prévia: '+esc(previa(r.texto))+'</div></div><button class="ib" data-cf="rmrapida" data-i="'+i+'" aria-label="Remover resposta '+esc(r.atalho)+'" title="Remover">'+ic('trash-2')+'</button></div>'}).join('')+'<div class="cf-salvar"><span class="nt">As respostas são salvas ao sair de cada campo.</span></div></div>';
  }else{
    var d=DRAFT['m.'+m.id];var txt=d!==undefined?d:m.texto;
    ed='<div class="cx-cab">'+ic('message-square-text')+'<h3>'+esc(m.nome)+'</h3></div><div class="md-corpo"><div class="md-sit">'+chipSit(m)+'<span class="nt">'+sitTexto(m)+(m.situacao==='Rascunho'&&etapasDe(m.id).length?' As etapas da régua que usam este modelo estão sem envio até nova aprovação.':'')+'</span><div class="cf-sv-b">'+(m.situacao!=='Aprovado'?'<button class="btn" data-cf="mdaprovar" data-id="'+m.id+'" style="width:auto;padding:0 14px;height:30px"'+(d!==undefined&&d!==m.texto?' disabled title="Salve o texto antes de aprovar"':'')+'>Aprovar</button>':'')+(m.situacao!=='Reprovado'?'<button class="btn sec" data-cf="mdreprovar" data-id="'+m.id+'" style="width:auto;padding:0 14px;height:30px">Reprovar</button>':'')+'</div></div><div class="campo"><label for="md-t">Texto do modelo</label><textarea class="cb-area" id="md-t" rows="9" data-mt="'+m.id+'">'+esc(txt)+'</textarea></div>'+
     '<div class="f-sub">Variáveis (toque para inserir)</div><div class="md-vars">'+m.vars.map(function(v){return '<button type="button" class="tag md-v" data-var="'+v+'" title="'+esc(VARS[v])+'">{'+v+'}</button>'}).join('')+'</div>'+
     '<div class="f-sub">Prévia com dados de exemplo</div><pre class="pv-txt md-pv" id="md-pv">'+esc(previa(txt))+'</pre></div>'+
     '<div class="cf-salvar"><span class="nt" id="md-pend">'+(d!==undefined&&d!==m.texto?'Alteração pendente.':'Nenhuma alteração pendente.')+'</span><div class="cf-sv-b"><button class="btn sec" data-cf="mddescartar" style="width:auto;padding:0 14px"'+(d!==undefined&&d!==m.texto?'':' disabled')+'>Descartar</button><button class="btn" data-cf="mdsalvar" data-id="'+m.id+'" style="width:auto;padding:0 16px"'+(d!==undefined&&d!==m.texto?'':' disabled')+'>Salvar modelo</button></div></div>';
  }
  return '<div class="md-grade"><div class="cx md-lista"><div class="cx-cab">'+ic('list')+'<h3>Modelos</h3></div>'+lista+'</div><div class="cx md-ed">'+ed+'</div></div>';
}
function abaBloqueio(){
  var b=CFG.bloqueio,l=[];if(b.nome)l.push('• NOME DA LOJA');if(b.gs)l.push('  GS 00000000000000');if(b.codigo)l.push('  Código 000');
  return '<div class="cf-grade2"><div class="cx"><div class="cx-cab">'+ic('lock')+'<h3>Grupo e prazo</h3></div><div class="cf-corpo">'+campos('bloqueio',['bloqueio.grupo','bloqueio.prazo'])+'</div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('file-text')+'<h3>Formato da solicitação</h3></div><div class="cf-corpo">'+campos('bloqueio',['bloqueio.nome','bloqueio.gs','bloqueio.codigo','bloqueio.vcard'])+'<div class="f-sub">Como a mensagem chega ao grupo</div><pre class="pv-txt md-pv" id="bl-pv">'+esc(blPrev())+'</pre></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('user-check')+'<h3>Quem confirma</h3></div><div class="cf-corpo">'+campos('bloqueio',['bloqueio.confirmam'])+'</div></div></div>'+barraSalvar();
}
function blPrev(){var b=DRAFT['bloqueio.nome']!==undefined?DRAFT['bloqueio.nome']:CFG.bloqueio.nome,g=DRAFT['bloqueio.gs']!==undefined?DRAFT['bloqueio.gs']:CFG.bloqueio.gs,c=DRAFT['bloqueio.codigo']!==undefined?DRAFT['bloqueio.codigo']:CFG.bloqueio.codigo,v=DRAFT['bloqueio.vcard']!==undefined?DRAFT['bloqueio.vcard']:CFG.bloqueio.vcard;var l=['Bloquear as lojas de ADRIANO APARECIDO:'];if(b)l.push('• LOJA KP MODAS LTDA');if(g)l.push('  GS 56011980000182');if(c)l.push('  Código 4471');if(v)l.push('[vCard do contato anexado]');return l.join('\n')}
var CORES=[['verde','Verde','vd'],['azul','Azul','ok'],['amarelo','Amarelo','at'],['vermelho','Vermelho','gr'],['roxo','Roxo','rx'],['cinza','Cinza','cn']];
function corCls(c){return CORES.filter(function(x){return x[0]===c})[0][2]}
function abaEtiquetas(){
  var mot=CFG.motivos;
  return '<div class="masonry">'+
   '<div class="cx"><div class="cx-cab">'+ic('tag')+'<h3>Etiquetas de conversa</h3><button class="btn sec cx-bt" data-cf="novaetq" style="width:auto;padding:0 12px;height:30px">Nova etiqueta</button></div>'+CFG.etiquetas.map(function(e){return '<div class="cf-lin"><div style="min-width:0"><span class="fs '+corCls(e.cor)+'">'+esc(e.nome)+'</span></div><div class="cf-ac"><button class="ib" data-cf="edetq" data-id="'+e.id+'" aria-label="Editar '+esc(e.nome)+'" title="Editar">'+ic('pencil')+'</button><button class="ib" data-cf="rmetq" data-id="'+e.id+'" aria-label="Excluir '+esc(e.nome)+'" title="Excluir">'+ic('trash-2')+'</button></div></div>'}).join('')+'</div>'+
   '<div class="cx"><div class="cx-cab">'+ic('users')+'<h3>Papéis de contato</h3><button class="btn sec cx-bt" data-cf="novopapel" style="width:auto;padding:0 12px;height:30px">Novo papel</button></div>'+CFG.papeis.map(function(p){return '<div class="cf-lin"><div style="min-width:0"><b>'+esc(p.nome)+'</b>'+(p.sub.length?'<div class="cf-subs">'+p.sub.map(function(s){return '<span class="tag">'+esc(s)+'</span>'}).join('')+'</div>':'')+'</div><div class="cf-ac"><button class="ib" data-cf="edpapel" data-id="'+p.id+'" aria-label="Editar '+esc(p.nome)+'" title="Editar">'+ic('pencil')+'</button><button class="ib" data-cf="rmpapel" data-id="'+p.id+'" aria-label="Excluir '+esc(p.nome)+'" title="Excluir">'+ic('trash-2')+'</button></div></div>'}).join('')+'</div>'+
   '<div class="cx"><div class="cx-cab">'+ic('store')+'<h3>Plataformas</h3><button class="btn sec cx-bt" data-cf="novaplat" style="width:auto;padding:0 12px;height:30px">Nova plataforma</button></div><p class="nt" style="padding:10px 16px 0">Lista única. Não aceita a mesma plataforma com outra grafia.</p>'+CFG.plataformas.map(function(p,i){return '<div class="cf-lin"><b>'+esc(p)+'</b><div class="cf-ac"><button class="ib" data-cf="edplat" data-i="'+i+'" aria-label="Editar '+esc(p)+'" title="Editar">'+ic('pencil')+'</button><button class="ib" data-cf="rmplat" data-i="'+i+'" aria-label="Excluir '+esc(p)+'" title="Excluir">'+ic('trash-2')+'</button></div></div>'}).join('')+'</div>'+
   '<div class="cx"><div class="cx-cab">'+ic('list-checks')+'<h3>Motivos padronizados</h3></div>'+[['baixa','Baixa'],['rejeicao','Rejeição de comprovante'],['cancelamento','Cancelamento']].map(function(g){return '<div class="f-sub" style="padding:10px 16px 0;display:flex;justify-content:space-between;align-items:center">'+g[1]+'<button class="btn sec" data-cf="novomot" data-g="'+g[0]+'" style="width:auto;padding:0 10px;height:26px;font-size:12px">Novo motivo</button></div>'+mot[g[0]].map(function(x,i){return '<div class="cf-lin"><span>'+esc(x)+'</span><div class="cf-ac"><button class="ib" data-cf="edmot" data-g="'+g[0]+'" data-i="'+i+'" aria-label="Editar motivo" title="Editar">'+ic('pencil')+'</button><button class="ib" data-cf="rmmot" data-g="'+g[0]+'" data-i="'+i+'" aria-label="Excluir motivo" title="Excluir">'+ic('trash-2')+'</button></div></div>'}).join('')}).join('')+'</div></div>';
}
/* ---------- recebimento por Pix (grava na hora, sem botão Salvar) ---------- */
var RCUI={};
function mais1ano(){var d=new Date();d.setFullYear(d.getFullYear()+1);return d}
function dt(d){return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()}
function menos90(v){var q=v.split('/');var d=new Date(+q[2],+q[1]-1,+q[0]);d.setDate(d.getDate()-90);return dt(d)}
var REC_NOMES={clientId:'Client ID (Inter)',provedor:'Provedor do Pix',ambiente:'Ambiente',chavePix:'Chave Pix recebedora',validadeLinkDias:'Validade do link após o vencimento',jurosMultaLigado:'Juros e multa',multaPct:'Multa',jurosPct:'Juros ao mês',modoPix:'Modo padrão do Pix',basePadrao:'Base padrão da cobrança'};
var REC_TXT={teste:'Teste',producao:'Produção',pagador:'Um Pix por pagador',loja:'Um Pix por loja'};
function BASESL(){return (window.MKFechamento&&MKFechamento.bases&&MKFechamento.bases())||[{id:'faturamento_total',nome:'Faturamento total'},{id:'produtos',nome:'Valor dos produtos (sem frete)'},{id:'pedidos',nome:'Pedidos concluídos'},{id:'notas',nome:'Notas fiscais emitidas'},{id:'manual',nome:'Valor manual'}]}
function baseNomeC(id){var b=BASESL().filter(function(x){return x.id===id})[0];return b?b.nome:id}
function rcSel(k,ops,v){return '<select class="sel" id="rc-'+k+'" data-rc="'+k+'">'+ops.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===v?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select>'}
function rcCampo(k,l,ctl,d){return '<div class="campo cf-c"><label for="rc-'+k+'">'+l+'</label>'+ctl+(d?'<small class="nt">'+d+'</small>':'')+'</div>'}
function rcNum(k,v,suf){return '<div class="cf-in"><input id="rc-'+k+'" data-rc="'+k+'" inputmode="decimal" value="'+esc(String(v).replace('.',','))+'">'+(suf?'<span>'+suf+'</span>':'')+'</div>'}
function segRow(k,rot,meta,ajuda){
  var abre=RCUI[k]||!meta;
  return '<div class="mk-seg"><div><b>'+rot+'</b><div class="nt">'+(meta?'Cadastrado em '+esc(meta.t)+' por '+esc(meta.q):'Não cadastrado')+'</div>'+(ajuda?'<small class="nt cf-dica">'+ajuda+'</small>':'')+'</div>'+
   (abre?'<div class="mk-seg-in"><input type="password" autocomplete="new-password" id="rc-seg-'+k+'" placeholder="Cole o valor. Ele nunca é exibido" aria-label="'+esc(rot)+'"><button class="btn sec" data-cf="rcgravar" data-s="'+k+'" style="width:auto;padding:0 12px">Gravar</button></div>':'<button class="btn sec" data-cf="rctrocar" data-s="'+k+'" style="width:auto;padding:0 12px">Trocar</button>')+'</div>';
}
function configurado(R){
  if(!R.acesso[R.provedor])return 'Falta cadastrar a chave de acesso.';
  if(R.provedor==='Banco Inter'){if(!R.clientId)return 'Falta informar o Client ID.';if(!R.cert)return 'Falta enviar o certificado .crt.';if(!R.seg.key)return 'Falta enviar a chave .key.'}
  else if(!R.seg.tokenAviso)return 'Falta cadastrar o token do aviso de pagamento.';
  return '';
}
function cardsReceb(){
  var R=CFG.recebimento,inter=R.provedor==='Banco Inter',av=R.aviso,ok=av.sit==='Recebendo';
  var c1='<div class="cx"><div class="cx-cab">'+ic('plug-zap')+'<h3>Provedor do Pix</h3></div><div class="cf-corpo">'+
   rcCampo('provedor','Provedor do Pix',rcSel('provedor',[['Asaas','Asaas'],['Banco Inter','Banco Inter']],R.provedor))+
   rcCampo('ambiente','Ambiente',rcSel('ambiente',[['teste','Teste'],['producao','Produção']],R.ambiente),R.ambiente==='teste'?'No teste nenhum Pix vale de verdade.':'Em produção, os Pix são reais.')+
   (inter?rcCampo('clientId','Client ID','<input id="rc-clientId" data-rc="clientId" autocomplete="off" value="'+esc(R.clientId)+'">','Código público da integração, criado no Internet Banking do Inter.')+
    segRow('acesso','Client Secret',R.acesso[R.provedor],'Só grava. Depois de salvo, não aparece mais.')+
    '<div class="mk-seg"><div><b>Certificado .crt</b><div class="nt">'+(R.cert?esc(R.cert.nome)+' · enviado em '+esc(R.cert.t)+' por '+esc(R.cert.q):'Nenhum arquivo enviado')+'</div>'+
     (R.cert?'<div class="nt cf-val">Válido até <b>'+esc(R.cert.validade)+'</b> (1 ano). Aviso de renovação em '+esc(menos90(R.cert.validade))+', 90 dias antes.</div>':'<small class="nt cf-dica">O certificado vale 1 ano. O sistema avisa 90 dias antes de vencer.</small>')+'</div><input type="file" id="rc-cert" data-rc="cert" accept=".crt" aria-label="Certificado .crt do Banco Inter"></div>'+
    ((R.seg.key&&!RCUI.key)?'<div class="mk-seg"><div><b>Chave privada .key</b><div class="nt">Enviada em '+esc(R.seg.key.t)+' por '+esc(R.seg.key.q)+' · conteúdo não exibido</div></div><button class="btn sec" data-cf="rctrocar" data-s="key" style="width:auto;padding:0 12px">Trocar</button></div>':'<div class="mk-seg"><div><b>Chave privada .key</b><div class="nt">Nenhum arquivo enviado</div><small class="nt cf-dica">Só grava. Depois de enviada, não aparece mais.</small></div><input type="file" id="rc-key" data-rc="keyfile" accept=".key" aria-label="Chave privada .key do Banco Inter"></div>')
   :segRow('acesso','Chave de acesso',R.acesso[R.provedor],'Chave de API da conta Asaas. Só grava.')+segRow('tokenAviso','Token do aviso de pagamento',R.seg.tokenAviso,'De 32 a 255 caracteres. O Asaas manda esse token em cada aviso. Só grava.'))+
   rcCampo('chavePix','Chave Pix recebedora','<input id="rc-chavePix" data-rc="chavePix" value="'+esc(R.chavePix)+'">','Chave que recebe o dinheiro dos Pix.')+'</div></div>';
  var c2='<div class="cx"><div class="cx-cab">'+ic('radio')+'<h3>Aviso automático de pagamento</h3></div><div class="cf-corpo">'+
   '<div class="cf-sw"><div><b>Situação do aviso automático de pagamento</b><small>O provedor avisa o sistema assim que um Pix é pago.</small></div><span class="fs '+(ok?'vd':'gr')+'" id="rc-sit">'+(ok?'Recebendo':'Não está recebendo')+'</span></div>'+
   '<div class="cf-sw"><div><b>Último Pix recebido</b><small>'+esc(av.ultimo.t)+'</small></div><b>'+esc(av.ultimo.v)+'</b></div>'+
   (inter?'<div class="fe-aviso"><span>Aviso do Inter: se o sistema devolver erro, o Inter tenta 4 vezes (20, 30, 60 e 120 minutos). Depois disso só dá para consultar e reenviar.</span></div><div class="cf-dica2"><b>Para o aviso do Inter funcionar (mTLS)</b><ul><li>Endereço do aviso em https: <span class="mono">https://api.itmk.com.br/avisos/inter</span></li><li>Arquivo <span class="mono">ca.crt</span> do Inter, baixado em Minhas integrações, Certificado Webhook (o sistema usa para conferir o aviso).</li><li>Liberar no firewall os blocos de IP do Inter. A lista é longa e muda: conferir na página Como configurar webhooks do Inter na hora de configurar.</li></ul></div>'
   :'<div class="fe-aviso"><span>Aviso do Asaas: o sistema precisa responder HTTP 200 em até 10 segundos. Depois de 15 falhas seguidas a fila é pausada e é preciso reativar.</span></div><div class="cf-dica2"><b>Para o aviso do Asaas funcionar</b><ul><li>Endereço do aviso em https: <span class="mono">https://api.itmk.com.br/avisos/asaas</span></li><li>Token do aviso igual ao cadastrado ao lado.</li><li>Se usar firewall, liberar os IPs do Asaas em produção: <span class="mono">52.67.12.206, 18.230.8.159, 54.94.136.112, 54.94.183.101</span>.</li></ul></div>')+
   '<button class="btn" data-cf="rctestar" style="width:auto;padding:0 16px;align-self:flex-start">Testar conexão</button></div></div>';
  var c3='<div class="cx"><div class="cx-cab">'+ic('timer')+'<h3>Link, juros e multa</h3></div><div class="cf-corpo">'+
   rcCampo('validadeLinkDias','Validade do link após o vencimento (dias)',rcNum('validadeLinkDias',R.validadeLinkDias,'dias'),(inter?'Padrão de 30 dias. No Inter existe campo próprio para esse prazo, e o sistema o envia na cobrança.':'Padrão de 30 dias. No Asaas o QR Code vale 12 meses, então o sistema remove a cobrança ao fim desse prazo.'))+
   '<div class="cf-sw"><div><b>Juros e multa</b><small>Desligado por padrão. Quando ligado, o Pix passa a cobrar os dois depois do vencimento.</small></div><label class="sw"><input type="checkbox" role="switch" data-rc="jurosMultaLigado"'+(R.jurosMultaLigado?' checked':'')+' aria-label="Juros e multa"><span></span></label></div>'+
   (R.jurosMultaLigado?'<div class="f-grade">'+rcCampo('multaPct','Multa (uma vez)',rcNum('multaPct',R.multaPct,'%'))+rcCampo('jurosPct','Juros (ao mês)',rcNum('jurosPct',R.jurosPct,'%'))+'</div>':'')+'</div></div>';
  var c4='<div class="cx"><div class="cx-cab">'+ic('qr-code')+'<h3>Modo padrão do Pix</h3></div><div class="cf-corpo">'+
   '<label class="lembrar"><input type="radio" name="rc-modo" data-rc="modoPix" value="pagador"'+(R.modoPix==='pagador'?' checked':'')+'>Um Pix por pagador (padrão): uma cobrança com o total de todas as lojas.</label>'+
   '<label class="lembrar"><input type="radio" name="rc-modo" data-rc="modoPix" value="loja"'+(R.modoPix==='loja'?' checked':'')+'>Um Pix por loja: cada loja paga o seu valor separado.</label>'+
   '<p class="nt">Na ficha do pagador, dá para escolher outro modo só para ele.</p></div></div>';
  return '<div class="cf-col">'+c1+c4+'</div><div class="cf-col">'+c2+c3+'</div>';
}
function recebChange(t){
  var R=CFG.recebimento,k=t.dataset.rc,v,ant=R[k];
  if(k==='cert'){var f=t.files&&t.files[0];if(!f)return;if(!/\.crt$/i.test(f.name)){U.toast('Envie o arquivo .crt do certificado.');pintar();return}R.cert={nome:f.name,t:agora(),q:EU,validade:dt(mais1ano())};reg('Recebimento · Certificado .crt','—',f.name+' (válido até '+R.cert.validade+')');pintar();U.toast('Certificado enviado. Vale até '+R.cert.validade+'.');return}
  if(k==='keyfile'){var f3=t.files&&t.files[0];if(!f3)return;if(!/\.key$/i.test(f3.name)){U.toast('Envie o arquivo .key da chave privada.');pintar();return}R.seg.key={t:agora(),q:EU};delete RCUI.key;reg('Recebimento · Chave privada .key','—','nova (conteúdo não exibido)');pintar();U.toast('Chave enviada. Ela não fica visível.');return}
  if(t.type==='checkbox')v=t.checked;else if(t.type==='radio')v=t.value;else v=t.value;
  if(k==='validadeLinkDias'||k==='multaPct'||k==='jurosPct'){
    var n=+String(v).replace(',','.');var max=k==='validadeLinkDias'?365:100;
    if(isNaN(n)||n<(k==='validadeLinkDias'?1:0)||n>max||(k==='validadeLinkDias'&&n%1)){U.toast('Informe um número entre '+(k==='validadeLinkDias'?'1 e 365 dias.':'0 e 100.'));pintar();return}v=n}
  if(k==='chavePix'&&!String(v).trim()){U.toast('Informe a chave Pix recebedora.');pintar();return}
  if(v===ant)return;
  R[k]=v;
  var d=function(x){return REC_TXT[x]||(k==='basePadrao'?baseNomeC(x):x)};
  reg('Recebimento · '+REC_NOMES[k],d(ant),d(v));
  if(k==='provedor'){var f2=configurado(R);R.aviso.sit=f2?'Não está recebendo':'Recebendo'}
  if(k==='provedor'||k==='ambiente'||k==='jurosMultaLigado')pintar();
  U.toast('Alteração salva e registrada.'+(k==='provedor'&&configurado(R)?' '+configurado(R):''));
  var h=document.querySelector('[data-cf="historico"]');if(h)h.textContent='Histórico de alterações ('+CFG.log.length+')';
}
function testarConexao(){
  var R=CFG.recebimento,f=configurado(R),antes=R.aviso.sit;
  R.aviso.sit=f?'Não está recebendo':'Recebendo';
  if(!f)R.aviso.testado=agora();
  reg('Recebimento · Teste de conexão',antes,R.aviso.sit);
  pintar();U.toast(f?'A conexão não funcionou. '+f:'Conexão com '+R.provedor+' funcionando ('+REC_TXT[R.ambiente].toLowerCase()+'). O aviso automático está recebendo.');
}
function gravarSeg(k){
  var R=CFG.recebimento,i=document.getElementById('rc-seg-'+k);if(!i||!i.value.trim()){U.toast('Cole o valor para gravar.');return}
  var meta={t:agora(),q:EU};
  if(k==='acesso')R.acesso[R.provedor]=meta;else R.seg[k]=meta;
  i.value='';delete RCUI[k];reg('Recebimento · '+(k==='acesso'?(R.provedor==='Banco Inter'?'Client Secret (Inter)':'Chave de acesso (Asaas)'):'Token do aviso de pagamento (Asaas)'),'—','nova (valor não exibido)');
  pintar();U.toast('Gravado. O valor não fica visível em nenhum lugar.');
}
function abaDados(){
  var d=CFG.dados;
  return '<div class="fe-aviso"><span>Alterar aqui atualiza todos os modelos de mensagem e a conferência de comprovantes ao mesmo tempo.</span></div><div class="cf-grade2">'+cardsReceb()+'<div class="cx"><div class="cx-cab">'+ic('qr-code')+'<h3>Pix</h3></div><div class="cf-corpo">'+campos('dados',['dados.cnpj','dados.recebedor','dados.banco'])+'<div class="f-sub">Como aparece nas mensagens</div><pre class="pv-txt md-pv" id="dd-pv">'+esc(ddPrev())+'</pre></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('headphones')+'<h3>Contato de suporte</h3></div><div class="cf-corpo">'+campos('dados',['dados.suporteNome','dados.suporteFone','dados.suporteEmail','dados.horario'])+'<p class="nt">Aparece nas mensagens de atraso e de aviso de bloqueio.</p></div></div></div>'+
   '<div class="cx"><div class="cx-cab">'+ic('landmark')+'<h3>Contas aceitas como destino do comprovante</h3><button class="btn sec cx-bt" data-cf="novaconta" style="width:auto;padding:0 12px;height:30px">Adicionar conta</button></div>'+
   '<div class="cf-tab"><table class="tab-fe tab-cf"><thead><tr><th>Banco</th><th>Agência</th><th>Conta</th><th>Tipo</th><th></th></tr></thead><tbody>'+d.contas.map(function(c){return '<tr><td data-rot="Banco">'+esc(c.banco)+'</td><td data-rot="Agência" class="mono">'+esc(c.ag)+'</td><td data-rot="Conta" class="mono">'+esc(c.conta)+'</td><td data-rot="Tipo">'+esc(c.tipo)+'</td><td class="c"><button class="btn sec" data-cf="rmconta" data-id="'+c.id+'" style="width:auto;padding:0 10px;height:30px">Remover</button></td></tr>'}).join('')+'</tbody></table></div></div>'+barraSalvar();
}
function ddPrev(){var g=function(k,def){return DRAFT[k]!==undefined?DRAFT[k]:def};return 'Pix: '+g('dados.cnpj',CFG.dados.cnpj)+' · '+g('dados.recebedor',CFG.dados.recebedor)+' · '+g('dados.banco',CFG.dados.banco)}
var ABAS=[['usuarios','Usuários e acessos'],['regras','Regras padrão'],['regua','Régua de cobrança'],['modelos','Modelos de mensagem'],['bloqueio','Bloqueio'],['etiquetas','Etiquetas e papéis'],['dados','Dados de recebimento']];
function render(alvo){
  if(alvo)el=alvo;iniciar();
  el.innerHTML='<div class="dash fe-w rc-w"><div class="fe-cab"><div><h1>Configurações</h1><p class="sub">Tudo que muda o comportamento da 40% fica aqui. Nada é digitado dentro das outras telas.</p></div><button class="btn sec" data-cf="historico" style="width:auto;padding:0 14px">Histórico de alterações ('+CFG.log.length+')</button></div>'+
   '<div class="rc-abas cf-abas" role="tablist">'+ABAS.map(function(a){return '<button role="tab" class="rc-aba" data-aba="'+a[0]+'" aria-selected="'+(aba===a[0])+'">'+a[1]+'</button>'}).join('')+'</div>'+
   '<section class="bloco"><div class="fe-painel" id="cf-corpo">'+corpo()+'</div></section><div class="aviso">Dados de exemplo. Servem só para desenhar a tela.</div></div>';
  U.icones();
}
function corpo(){return aba==='usuarios'?abaUsuarios():aba==='regras'?abaRegras():aba==='regua'?abaRegua():aba==='modelos'?abaModelos():aba==='bloqueio'?abaBloqueio():aba==='etiquetas'?abaEtiquetas():abaDados()}
function pintar(){var c=document.getElementById('cf-corpo');if(c){c.innerHTML=corpo();U.icones()}var h=document.querySelector('[data-cf="historico"]');if(h)h.textContent='Histórico de alterações ('+CFG.log.length+')'}
/* ---------- formulários por aba ---------- */
function lerCampo(i){
  var k=i.dataset.f,m=i.dataset.m;
  if(m!==undefined){var cur=(DRAFT[k]!==undefined?DRAFT[k]:get(k)).slice();var ix=cur.indexOf(m);if(i.checked&&ix<0)cur.push(m);if(!i.checked&&ix>-1)cur.splice(ix,1);return cur}
  if(i.type==='checkbox')return i.checked;
  if(i.tagName==='SELECT'||i.type==='text'||i.id.indexOf('cf-dados')===0)return i.value;
  var atual=get(k);if(typeof atual==='number')return i.value.trim()===''?NaN:+i.value.replace(',','.');return i.value;
}
function igual(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function atualizaBarra(){
  var n=Object.keys(DRAFT).filter(function(k){return !igual(DRAFT[k],get(k))}).length,b=document.getElementById('cf-salvar');if(!b)return;
  document.getElementById('cf-pend').textContent=n?n+(n===1?' alteração pendente.':' alterações pendentes.'):'Nenhuma alteração pendente.';
  b.querySelectorAll('button').forEach(function(x){x.disabled=!n});
}
function validar(){
  var ok=true,metas={};Object.keys(CAMPOS).forEach(function(a){CAMPOS[a].forEach(function(c){metas[c[0]]=c})});
  function erro(k,m){var e=document.getElementById('cf-'+k+'-e');if(e){e.textContent=m||'';e.hidden=!m}var i=document.getElementById('cf-'+k);if(i)i.classList.toggle('inv',!!m);if(m)ok=false}
  Object.keys(DRAFT).forEach(function(k){
    var c=metas[k];if(!c)return;var v=DRAFT[k];
    if(c[2]==='num'){var n=c[3].n;if(isNaN(v)||v<n[0]||v>n[1])erro(k,'Informe um número entre '+String(n[0]).replace('.',',')+' e '+String(n[1]).replace('.',','))}
    else if(c[2]==='text'&&(''+v).trim()==='')erro(k,'Preencha este campo.');
    else if(k==='dados.cnpj'&&(''+v).replace(/\D/g,'').length!==14)erro(k,'O CNPJ precisa ter 14 números.');
    else if(c[2]==='multi'&&k==='regras.period'&&!v.length)erro(k,'Escolha ao menos uma periodicidade.');
    else erro(k,'');
  });
  var g=function(k){return DRAFT[k]!==undefined?DRAFT[k]:get(k)};
  if(g('regras.ultimo')>=g('regras.venc')){erro('regras.ultimo','O último dia de cálculo precisa ser antes do vencimento.')}
  if(g('regras.abre')>=g('regras.ultimo')){erro('regras.abre','A abertura precisa ser antes do último dia de cálculo.')}
  return ok;
}
var NOMES={};Object.keys(CAMPOS).forEach(function(a){CAMPOS[a].forEach(function(c){NOMES[c[0]]=c[1]})});
var ABAN={regras:'Regras padrão',bloqueio:'Bloqueio',dados:'Dados de recebimento'};
function salvar(){
  if(!validar()){U.toast('Corrija os campos em vermelho antes de salvar.');return}
  var n=0;Object.keys(DRAFT).forEach(function(k){if(!igual(DRAFT[k],get(k))){reg(ABAN[aba]+' · '+NOMES[k],get(k),DRAFT[k]);set(k,DRAFT[k]);n++}});
  DRAFT={};render();U.toast(n+(n===1?' alteração salva e registrada.':' alterações salvas e registradas.')+(aba==='regras'?' Vale daqui para frente.':''));
}
/* ---------- listas e janelas ---------- */
function modalNome(tit,lab,val,ok,cb,ph){
  U.modal({titulo:tit,ok:ok,html:'<div class="campo"><label for="nm-v">'+lab+' <i class="obr">*</i></label><input id="nm-v" value="'+esc(val||'')+'" placeholder="'+(ph||'')+'"><small class="erro" id="nm-e" hidden></small></div>',onOk:function(m){var v=m.querySelector('#nm-v').value.trim();var e=m.querySelector('#nm-e');if(!v){e.textContent='Preencha este campo.';e.hidden=false;return false}var r=cb(v);if(r){e.textContent=r;e.hidden=false;return false}}});
}
function corPick(cor){return '<div class="campo" style="margin-top:12px"><label>Cor</label><div class="cf-cores">'+CORES.map(function(c){return '<label class="cf-cor"><input type="radio" name="cor" value="'+c[0]+'"'+(c[0]===cor?' checked':'')+'><span class="fs '+c[2]+'">'+c[1]+'</span></label>'}).join('')+'</div></div>'}
function etiqueta(e){
  U.modal({titulo:e?'Editar etiqueta':'Nova etiqueta',ok:'Salvar',html:'<div class="campo"><label for="et-n">Nome <i class="obr">*</i></label><input id="et-n" value="'+esc(e?e.nome:'')+'"><small class="erro" id="et-e" hidden></small></div>'+corPick(e?e.cor:'verde'),
    onOk:function(m){var n=m.querySelector('#et-n').value.trim(),c=m.querySelector('input[name=cor]:checked').value,er=m.querySelector('#et-e');
      if(!n){er.textContent='Informe o nome da etiqueta.';er.hidden=false;return false}
      if(CFG.etiquetas.some(function(x){return x!==e&&so(x.nome)===so(n)})){er.textContent='Já existe uma etiqueta com esse nome.';er.hidden=false;return false}
      if(e){if(e.nome!==n)reg('Etiquetas · nome',e.nome,n);if(e.cor!==c)reg('Etiquetas · cor de '+n,e.cor,c);e.nome=n;e.cor=c}else{CFG.etiquetas.push({id:Date.now(),nome:n,cor:c});reg('Etiquetas · criada','—',n)}
      window.MK_ETQ=CFG.etiquetas.map(function(x){return x.nome});pintar();U.toast('Etiqueta salva.')}});
}
function papel(p){
  U.modal({titulo:p?'Editar papel':'Novo papel',ok:'Salvar',html:'<div class="campo"><label for="pp-n">Nome do papel <i class="obr">*</i></label><input id="pp-n" value="'+esc(p?p.nome:'')+'"></div><div class="campo" style="margin-top:12px"><label for="pp-s">Subpapéis (um por linha)</label><textarea id="pp-s" class="cb-area" rows="4">'+esc(p?p.sub.join('\n'):'')+'</textarea></div><small class="erro" id="pp-e" hidden></small>',
    onOk:function(m){var n=m.querySelector('#pp-n').value.trim(),s=m.querySelector('#pp-s').value.split('\n').map(function(x){return x.trim()}).filter(Boolean),er=m.querySelector('#pp-e');
      if(!n){er.textContent='Informe o nome do papel.';er.hidden=false;return false}
      if(CFG.papeis.some(function(x){return x!==p&&so(x.nome)===so(n)})){er.textContent='Já existe um papel com esse nome.';er.hidden=false;return false}
      if(p){reg('Papéis · '+p.nome,p.nome+' ['+p.sub.join(', ')+']',n+' ['+s.join(', ')+']');p.nome=n;p.sub=s}else{CFG.papeis.push({id:Date.now(),nome:n,sub:s});reg('Papéis · criado','—',n)}pintar();U.toast('Papel salvo.')}});
}
function confirmarExcluir(tit,txt,fn){U.modal({titulo:tit,ok:'Excluir',perigo:true,html:'<p>'+txt+'</p><p class="dica-m" style="margin-top:8px">A alteração fica registrada no histórico.</p>',onOk:fn})}
function usuarioNovo(){
  U.modal({titulo:'Adicionar usuário',ok:'Adicionar usuário',html:'<div class="f-grade"><div class="campo"><label for="nu-n">Nome <i class="obr">*</i></label><input id="nu-n"></div><div class="campo"><label for="nu-e">E-mail <i class="obr">*</i></label><input id="nu-e" type="email"></div></div><div class="campo" style="margin-top:12px"><label>Módulos que pode abrir</label><div class="cf-multi">'+MODS.map(function(m,i){return '<label class="lembrar"><input type="checkbox" data-nm="'+m[0]+'"'+(i<2?' checked':'')+'>'+m[1]+'</label>'}).join('')+'</div></div><label class="lembrar" style="margin-top:12px"><input type="checkbox" id="nu-a">Atende conversas</label><label class="lembrar" style="margin-top:6px"><input type="checkbox" id="nu-r" checked>Aprova a fila do robô</label><small class="erro" id="nu-er" hidden></small>',
    onOk:function(m){var n=m.querySelector('#nu-n').value.trim(),e=m.querySelector('#nu-e').value.trim(),er=m.querySelector('#nu-er');
      if(!n||!/^\S+@\S+\.\S+$/.test(e)){er.textContent='Informe o nome e um e-mail válido.';er.hidden=false;return false}
      if(CFG.usuarios.some(function(u){return u.email.toLowerCase()===e.toLowerCase()})){er.textContent='Já existe um usuário com esse e-mail.';er.hidden=false;return false}
      var mods=[].slice.call(m.querySelectorAll('[data-nm]')).filter(function(c){return c.checked}).map(function(c){return c.dataset.nm});
      CFG.usuarios.push({id:Date.now(),nome:n,email:e,mods:mods,atende:m.querySelector('#nu-a').checked,aprovaRobo:m.querySelector('#nu-r').checked});sincAtend();reg('Usuários · adicionado','—',n+' ('+mods.map(function(x){return MODC[x]}).join(', ')+')');pintar();U.toast('Usuário adicionado.')}});
}
function transferir(u){
  var outros=CFG.usuarios.filter(function(x){return x!==u&&x.atende});
  U.modal({titulo:'Transferir conversas de '+u.nome,ok:'Transferir',html:'<div class="campo"><label for="tr-d">Passar todas as conversas para</label><select class="sel" id="tr-d">'+outros.map(function(x){return '<option>'+esc(x.nome)+'</option>'}).join('')+'<option value="">Sem dono</option></select></div>',
    onOk:function(m){var d=m.querySelector('#tr-d').value,de=u.nome.split(' ')[0],para=d?d.split(' ')[0]:null,n=0;window.MK_CONV.forEach(function(c){if(c.dono===de){c.dono=para;n++}});reg('Dono das conversas · '+u.nome,n+' conversas',d||'sem dono');pintar();U.toast(n+' conversas transferidas. Elas continuam visíveis a quem tem o módulo.')}});
}
function etapaNova(){
  var mods=aprovados();
  U.modal({titulo:'Nova etapa da régua',ok:'Criar etapa',html:'<div class="campo"><label for="ne-n">Nome da etapa <i class="obr">*</i></label><input id="ne-n"></div><div class="f-grade" style="margin-top:12px"><div class="campo"><label for="ne-d">Dias</label><input id="ne-d" inputmode="numeric" value="5"></div><div class="campo"><label for="ne-q">Quando</label><select class="sel" id="ne-q"><option value="antes">antes do vencimento</option><option value="depois" selected>depois do vencimento</option></select></div><div class="campo"><label for="ne-a">Ação</label><select class="sel" id="ne-a">'+Object.keys(ACOES).map(function(k){return '<option value="'+k+'">'+ACOES[k]+'</option>'}).join('')+'</select></div><div class="campo"><label for="ne-m">Modelo</label><select class="sel" id="ne-m">'+mods.map(function(m){return '<option value="'+m.id+'">'+esc(m.nome)+'</option>'}).join('')+'</select></div></div><small class="erro" id="ne-e" hidden></small>',
    onOk:function(m){var n=m.querySelector('#ne-n').value.trim(),d=parseInt(m.querySelector('#ne-d').value,10),er=m.querySelector('#ne-e');
      if(!n||isNaN(d)||d<0||d>365){er.textContent='Informe o nome e os dias (de 0 a 365).';er.hidden=false;return false}
      var dia=m.querySelector('#ne-q').value==='antes'?-d:d;CFG.etapas.push({id:Date.now(),nome:n,dia:dia,acao:m.querySelector('#ne-a').value,modelo:m.querySelector('#ne-m').value,ativa:true});reg('Régua · etapa criada','—',n+' ('+Math.abs(dia)+' dias '+quando(dia)+')');pintar();U.toast('Etapa criada.')}});
}
function excecaoNova(){
  U.modal({titulo:'Adicionar exceção por pagador',ok:'Adicionar',html:'<div class="campo"><label for="ex-p">Pagador</label><select class="sel" id="ex-p">'+window.MK_PAG.map(function(p){return '<option>'+esc(p.nome)+'</option>'}).join('')+'</select></div><div class="campo" style="margin-top:12px"><label for="ex-r">Regra</label><select class="sel" id="ex-r"><option>Não cobrar</option><option>Régua mais leve</option><option>Régua mais firme</option></select></div><small class="erro" id="ex-e" hidden>Este pagador já tem exceção.</small>',
    onOk:function(m){var p=m.querySelector('#ex-p').value,r=m.querySelector('#ex-r').value;if(CFG.excecoes.some(function(x){return x.pagador===p})){m.querySelector('#ex-e').hidden=false;return false}CFG.excecoes.push({id:Date.now(),pagador:p,regra:r});reg('Régua · exceção','—',p+': '+r);pintar();U.toast('Exceção adicionada.')}});
}
function historico(){
  U.modal({titulo:'Histórico de alterações',ok:'Fechar',cancel:'Fechar',html:CFG.log.length?'<div class="hist">'+CFG.log.map(function(h){return '<div class="h-lin"><b>'+esc(h.o)+'</b><div>'+esc(h.de)+' → '+esc(h.para)+'</div><div class="nt">'+esc(h.q)+' · '+esc(h.t)+'</div></div>'}).join('')+'</div>':'<p class="dica-m">Nenhuma alteração registrada.</p>'});
}
/* ---------- eventos ---------- */
function noEl(e){return el&&el.isConnected&&el.contains(e.target)&&el.dataset.modulo==='configuracoes'}
document.addEventListener('click',function(e){
  if(!noEl(e))return;var t=e.target,b;
  if((b=t.closest('[data-aba]'))){if(aba!==b.dataset.aba){DRAFT={};aba=b.dataset.aba;render()}return}
  if((b=t.closest('[data-md]'))){modeloSel=b.dataset.md;DRAFT={};pintar();return}
  if((b=t.closest('[data-var]'))){var ta=document.getElementById('md-t');if(ta){var s=ta.selectionStart,v=ta.value;ta.value=v.slice(0,s)+'{'+b.dataset.var+'}'+v.slice(ta.selectionEnd);ta.focus();ta.dispatchEvent(new Event('input',{bubbles:true}))}return}
  if(!(b=t.closest('[data-cf]')))return;
  var a=b.dataset.cf,id=b.dataset.id;
  if(a==='rctrocar'){RCUI[b.dataset.s]=true;pintar();return}
  if(a==='rcgravar'){gravarSeg(b.dataset.s);return}
  if(a==='rctestar'){testarConexao();return}
  if(a==='salvar')salvar();else if(a==='descartar'){DRAFT={};pintar()}
  else if(a==='historico')historico();
  else if(a==='novouser')usuarioNovo();
  else if(a==='rmuser'){var u=CFG.usuarios.filter(function(x){return String(x.id)===id})[0];confirmarExcluir('Remover usuário','<b>'+esc(u.nome)+'</b> perde o acesso à empresa.'+(u.atende?' As conversas dele ficam sem dono, mas continuam visíveis.':''),function(){CFG.usuarios=CFG.usuarios.filter(function(x){return x!==u});window.MK_CONV.forEach(function(c){if(c.dono===u.nome.split(' ')[0])c.dono=null});sincAtend();reg('Usuários · removido',u.nome,'—');pintar();U.toast('Usuário removido.')})}
  else if(a==='transf')transferir(CFG.usuarios.filter(function(x){return String(x.id)===id})[0]);
  else if(a==='novaetapa')etapaNova();
  else if(a==='rmetapa'){var et=CFG.etapas.filter(function(x){return String(x.id)===id})[0];confirmarExcluir('Remover etapa','A etapa <b>'+esc(et.nome)+'</b> deixa de disparar.',function(){CFG.etapas=CFG.etapas.filter(function(x){return x!==et});reg('Régua · etapa removida',et.nome,'—');pintar();U.toast('Etapa removida.')})}
  else if(a==='novaexc')excecaoNova();
  else if(a==='rmexc'){var ex=CFG.excecoes.filter(function(x){return String(x.id)===id})[0];CFG.excecoes=CFG.excecoes.filter(function(x){return x!==ex});reg('Régua · exceção removida',ex.pagador+': '+ex.regra,'—');pintar();U.toast('Exceção removida.')}
  else if(a==='mdsalvar'){var m=CFG.modelos.filter(function(x){return x.id===id})[0],novo=DRAFT['m.'+id];if(novo===undefined||novo===m.texto)return;if(!novo.trim()){U.toast('O texto do modelo não pode ficar vazio.');return}reg('Modelos · '+m.nome,m.texto.slice(0,60)+(m.texto.length>60?'…':''),novo.slice(0,60)+(novo.length>60?'…':''));m.texto=novo;delete DRAFT['m.'+id];var volta=m.situacao==='Aprovado'||m.situacao==='Reprovado';if(volta)mudarSit(m,'Rascunho','texto editado');pintar();U.toast(volta?'Modelo salvo e voltou para Rascunho. Precisa de nova aprovação.':'Modelo salvo.')}
  else if(a==='mdaprovar'){var ma=CFG.modelos.filter(function(x){return x.id===id})[0];mudarSit(ma,'Aprovado');pintar();U.toast('Modelo aprovado. Já pode ser usado na régua e pelo robô.')}
  else if(a==='mdreprovar'){var mr=CFG.modelos.filter(function(x){return x.id===id})[0],us=etapasDe(id);mudarSit(mr,'Reprovado');pintar();U.toast('Modelo reprovado.'+(us.length?' '+us.length+' etapa(s) da régua precisam de nova aprovação.':''))}
  else if(a==='mddescartar'){DRAFT={};pintar()}
  else if(a==='novarapida'){var r=CFG.modelos.filter(function(x){return x.id==='rapidas'})[0];r.rapidas.push({atalho:'novo',texto:'Escreva aqui a resposta.'});reg('Respostas rápidas · criada','—','/novo');pintar()}
  else if(a==='rmrapida'){var r2=CFG.modelos.filter(function(x){return x.id==='rapidas'})[0],i=+b.dataset.i;reg('Respostas rápidas · removida','/'+r2.rapidas[i].atalho,'—');r2.rapidas.splice(i,1);pintar();U.toast('Resposta removida.')}
  else if(a==='novaetq')etiqueta(null);else if(a==='edetq')etiqueta(CFG.etiquetas.filter(function(x){return String(x.id)===id})[0]);
  else if(a==='rmetq'){var q=CFG.etiquetas.filter(function(x){return String(x.id)===id})[0];confirmarExcluir('Excluir etiqueta','A etiqueta <b>'+esc(q.nome)+'</b> some das conversas.',function(){CFG.etiquetas=CFG.etiquetas.filter(function(x){return x!==q});reg('Etiquetas · excluída',q.nome,'—');window.MK_ETQ=CFG.etiquetas.map(function(x){return x.nome});window.MK_CONV.forEach(function(c){c.etq=c.etq.filter(function(n){return n!==q.nome})});pintar();U.toast('Etiqueta excluída.')})}
  else if(a==='novopapel')papel(null);else if(a==='edpapel')papel(CFG.papeis.filter(function(x){return String(x.id)===id})[0]);
  else if(a==='rmpapel'){var p=CFG.papeis.filter(function(x){return String(x.id)===id})[0];confirmarExcluir('Excluir papel','O papel <b>'+esc(p.nome)+'</b> e seus subpapéis serão removidos.',function(){CFG.papeis=CFG.papeis.filter(function(x){return x!==p});reg('Papéis · excluído',p.nome,'—');pintar();U.toast('Papel excluído.')})}
  else if(a==='novaplat')modalNome('Nova plataforma','Nome da plataforma','','Adicionar',function(v){if(CFG.plataformas.some(function(x){return so(x)===so(v)}))return 'Já existe uma plataforma com essa grafia: “'+CFG.plataformas.filter(function(x){return so(x)===so(v)})[0]+'”.';CFG.plataformas.push(v);reg('Plataformas · adicionada','—',v);pintar();U.toast('Plataforma adicionada.')});
  else if(a==='edplat'){var ip=+b.dataset.i,ant=CFG.plataformas[ip];modalNome('Editar plataforma','Nome da plataforma',ant,'Salvar',function(v){if(CFG.plataformas.some(function(x,j){return j!==ip&&so(x)===so(v)}))return 'Já existe uma plataforma com essa grafia.';reg('Plataformas · nome',ant,v);CFG.plataformas[ip]=v;pintar();U.toast('Plataforma salva.')})}
  else if(a==='rmplat'){var ir=+b.dataset.i,pl=CFG.plataformas[ir];confirmarExcluir('Excluir plataforma','A plataforma <b>'+esc(pl)+'</b> sai da lista.',function(){CFG.plataformas.splice(ir,1);reg('Plataformas · excluída',pl,'—');pintar();U.toast('Plataforma excluída.')})}
  else if(a==='novomot'){var g=b.dataset.g;modalNome('Novo motivo','Motivo','','Adicionar',function(v){if(CFG.motivos[g].some(function(x){return so(x)===so(v)}))return 'Esse motivo já existe.';CFG.motivos[g].push(v);reg('Motivos · '+g+' · adicionado','—',v);pintar();U.toast('Motivo adicionado.')})}
  else if(a==='edmot'){var g2=b.dataset.g,im=+b.dataset.i,am=CFG.motivos[g2][im];modalNome('Editar motivo','Motivo',am,'Salvar',function(v){if(CFG.motivos[g2].some(function(x,j){return j!==im&&so(x)===so(v)}))return 'Esse motivo já existe.';reg('Motivos · '+g2,am,v);CFG.motivos[g2][im]=v;pintar();U.toast('Motivo salvo.')})}
  else if(a==='rmmot'){var g3=b.dataset.g,i3=+b.dataset.i,m3=CFG.motivos[g3][i3];confirmarExcluir('Excluir motivo','O motivo “'+esc(m3)+'” sai da lista.',function(){CFG.motivos[g3].splice(i3,1);reg('Motivos · '+g3+' · excluído',m3,'—');pintar();U.toast('Motivo excluído.')})}
  else if(a==='novaconta'){
    U.modal({titulo:'Adicionar conta aceita',ok:'Adicionar',html:'<div class="f-grade"><div class="campo"><label for="ct-b">Banco <i class="obr">*</i></label><input id="ct-b"></div><div class="campo"><label for="ct-t">Tipo</label><input id="ct-t" placeholder="Ex.: Conta principal (Pix)"></div><div class="campo"><label for="ct-a">Agência <i class="obr">*</i></label><input id="ct-a"></div><div class="campo"><label for="ct-c">Conta <i class="obr">*</i></label><input id="ct-c"></div></div><small class="erro" id="ct-e" hidden>Informe banco, agência e conta.</small>',
      onOk:function(m){var bk=m.querySelector('#ct-b').value.trim(),ag=m.querySelector('#ct-a').value.trim(),c=m.querySelector('#ct-c').value.trim();if(!bk||!ag||!c){m.querySelector('#ct-e').hidden=false;return false}CFG.dados.contas.push({id:Date.now(),banco:bk,ag:ag,conta:c,tipo:m.querySelector('#ct-t').value.trim()||'Conta aceita'});reg('Dados de recebimento · conta aceita adicionada','—',bk+' ag. '+ag+' conta '+c);pintar();U.toast('Conta adicionada. A conferência de comprovantes já usa a nova lista.')}})}
  else if(a==='rmconta'){var ct=CFG.dados.contas.filter(function(x){return String(x.id)===id})[0];if(CFG.dados.contas.length<2){U.toast('Precisa existir ao menos uma conta aceita.');return}confirmarExcluir('Remover conta aceita','Comprovantes pagos para '+esc(ct.banco)+' conta '+esc(ct.conta)+' passam a cair em alerta vermelho.',function(){CFG.dados.contas=CFG.dados.contas.filter(function(x){return x!==ct});reg('Dados de recebimento · conta aceita removida',ct.banco+' '+ct.conta,'—');pintar();U.toast('Conta removida.')})}
});
document.addEventListener('change',function(e){
  if(!noEl(e))return;var t=e.target;
  if(t.dataset.rc!==undefined){recebChange(t);return}
  if(t.dataset.k&&t.dataset.f===undefined){ /* interruptores imediatos */
    var p=t.dataset.k.split('.');
    if(p[0]==='u'){var u=CFG.usuarios.filter(function(x){return String(x.id)===p[1]})[0];
      if(p[2]==='m'){var i=u.mods.indexOf(p[3]);if(t.checked&&i<0)u.mods.push(p[3]);if(!t.checked&&i>-1)u.mods.splice(i,1);reg('Usuários · '+u.nome+' · '+MODC[p[3]],!t.checked,t.checked)}
      else if(p[2]==='valores'){u.valores=t.checked;reg('Usuários · '+u.nome+' · Ver valores em R$',!t.checked,t.checked)}
      else if(p[2]==='aprova'){u.aprovaRobo=t.checked;reg('Usuários · '+u.nome+' · Aprova a fila do robô',!t.checked,t.checked)}
      else if(p[2]==='atende'){u.atende=t.checked;sincAtend();reg('Usuários · '+u.nome+' · Atende conversas',!t.checked,t.checked);pintar()}}
    else if(p[0]==='et'){var e2=CFG.etapas.filter(function(x){return String(x.id)===p[1]})[0];e2.ativa=t.checked;reg('Régua · '+e2.nome+' · Ativa',!t.checked,t.checked)}
    else if(p[0]==='pausas'){CFG.pausas[p[1]]=t.checked;reg('Régua · Pausa por '+p[1],!t.checked,t.checked)}
    U.toast('Alteração salva e registrada.');document.querySelector('[data-cf="historico"]').textContent='Histórico de alterações ('+CFG.log.length+')';return}
  if(t.dataset.et){var et=CFG.etapas.filter(function(x){return String(x.id)===t.dataset.et})[0],f=t.dataset.ef;
    if(f==='acao'){reg('Régua · '+et.nome+' · Ação',ACOES[et.acao],ACOES[t.value]);et.acao=t.value}
    else if(f==='modelo'){var mn=function(id){return CFG.modelos.filter(function(x){return x.id===id})[0].nome};reg('Régua · '+et.nome+' · Modelo',mn(et.modelo),mn(t.value));et.modelo=t.value}
    else{var n=f==='dias'?parseInt(t.value,10):Math.abs(et.dia),q=f==='quando'?t.value:quando(et.dia);if(isNaN(n)||n<0||n>365){U.toast('Informe dias de 0 a 365.');pintar();return}
      var nd=q==='no dia'?0:q==='antes'?-n:n;if(nd!==et.dia){reg('Régua · '+et.nome+' · Quando',Math.abs(et.dia)+' dias '+quando(et.dia),Math.abs(nd)+' dias '+quando(nd));et.dia=nd}}
    pintar();U.toast('Etapa salva e registrada.');return}
  if(t.dataset.rf!==undefined){var r=CFG.modelos.filter(function(x){return x.id==='rapidas'})[0].rapidas[+t.dataset.rp],f2=t.dataset.rf,v=t.value.trim();if(!v){U.toast('Não pode ficar vazio.');pintar();return}
    if(f2==='atalho'){v=v.replace(/^\//,'').replace(/\s+/g,'').toLowerCase();if(CFG.modelos.filter(function(x){return x.id==='rapidas'})[0].rapidas.some(function(x){return x!==r&&x.atalho===v})){U.toast('Já existe um atalho com esse nome.');pintar();return}}
    if(v!==r[f2]){reg('Respostas rápidas · /'+r.atalho+' · '+f2,r[f2],v);r[f2]=v;U.toast('Resposta salva.')}pintar();return}
  if(t.dataset.f){DRAFT[t.dataset.f]=lerCampo(t);validar();atualizaBarra();
    if(aba==='bloqueio'){var pv=document.getElementById('bl-pv');if(pv)pv.textContent=blPrev()}}
});
document.addEventListener('input',function(e){
  if(!noEl(e))return;var t=e.target;
  if(t.dataset.f&&t.type!=='checkbox'&&t.tagName!=='SELECT'){DRAFT[t.dataset.f]=lerCampo(t);atualizaBarra();if(aba==='dados'){var pv=document.getElementById('dd-pv');if(pv)pv.textContent=ddPrev()}}
  if(t.dataset.mt){var id=t.dataset.mt;DRAFT['m.'+id]=t.value;var m=CFG.modelos.filter(function(x){return x.id===id})[0];document.getElementById('md-pv').textContent=previa(t.value);var dirty=t.value!==m.texto;document.getElementById('md-pend').textContent=dirty?'Alteração pendente.':'Nenhuma alteração pendente.';document.querySelectorAll('[data-cf="mdsalvar"],[data-cf="mddescartar"]').forEach(function(b){b.disabled=!dirty})}
});
iniciar();
return {render:render};
})();
