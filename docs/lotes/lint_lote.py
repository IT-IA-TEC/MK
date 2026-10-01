#!/usr/bin/env python3
"""Confere um texto do Criar em lote do CicloDev contra as regras do arquivo de instruções.
Uso: python3 lint_lote.py ARQUIVO [ARQUIVO_ANTERIOR ...]
Os arquivos anteriores só dão os títulos e épicos que já existem (para depende: e nomes repetidos)."""
import re, sys
CAMPOS={'como','quero','para','historia','aceite','prioridade','nivel','valor','pontos','tipo','origem','depende','meta','versão','entrega','pronto'}
LIM={'como':300,'quero':500,'para':500,'aceite':500,'meta':1000,'pronto':300}
PONTOS={1,2,3,5,8,13,20}
def le(path):
    ver,epi,tit=set(),[],[]
    cur=None
    for n,l in enumerate(open(path,encoding='utf-8').read().split('\n'),1):
        s=l.strip()
        if not s: continue
        m=re.match(r'^versão:\s*(\S.*)$',l)
        if m: ver.add(m.group(1).strip()); continue
        if s.startswith('- '):
            t=re.sub(r'\s*(\[[^\]]*\]|\{[^}]*\})\s*$','',s[2:].strip()); t=re.sub(r'\s*(\[[^\]]*\]|\{[^}]*\})\s*$','',t); tit.append((t,n)); continue
        if re.match(r'^\s*[a-zçãé]+:\s',l) or re.match(r'^[a-zçãé]+:$',s):
            if s.split(':')[0] in CAMPOS: continue
        e=re.sub(r'\s*(\[[^\]]*\]|\{[^}]*\})\s*$','',s); e=re.sub(r'\s*(\[[^\]]*\]|\{[^}]*\})\s*$','',e); epi.append((e,n))
    return ver,epi,tit
def main():
    arq=sys.argv[1]; antes=sys.argv[2:]
    errs=[]; avisos=[]
    prev_t=set(); prev_e=set()
    for a in antes:
        v,e,t=le(a); prev_t|={x for x,_ in t}; prev_e|={x for x,_ in e}
    linhas=open(arq,encoding='utf-8').read().split('\n')
    versoes=set(); epicos={}; itens={}; ordem=[]
    cur_item=None; cur_epico=None; ult='';  crit={} ; n_itens=0; n_epicos=0
    detalhes={}
    pend_ver=None
    for n,l in enumerate(linhas,1):
        s=l.strip()
        if not s: continue
        if '\t' in l: errs.append(f'{n}: tabulação')
        m=re.match(r'^versão:\s*(.+)$',l)
        if m:
            pend_ver=m.group(1).strip(); versoes.add(pend_ver); detalhes[pend_ver]={}; cur_item=None; ult='versao'; continue
        if re.match(r'^pronto:\s',l): 
            if len(l[len('pronto:'):].strip())>300: errs.append(f'{n}: pronto acima de 300')
            ult='pronto'; continue
        if s.startswith('- '):
            t=s[2:].strip(); fr=re.findall(r'\[([^\]]*)\]',t); vr=re.findall(r'\{([^}]*)\}',t)
            tit=re.sub(r'\s*(\[[^\]]*\]|\{[^}]*\})','',t).strip()
            if len(tit)>300: errs.append(f'{n}: título acima de 300')
            if tit in itens: errs.append(f'{n}: título repetido neste texto: {tit} (linha {itens[tit]["n"]})')
            for f in fr:
                if f not in ('Frontend','Backend','Database','Integrações'): errs.append(f'{n}: frente inválida {f}')
            for v in vr: ordem.append(('vr',v,n))
            itens[tit]={'n':n,'ep':cur_epico,'campos':{},'aceites':[]}; cur_item=tit; n_itens+=1; ult='item'; continue
        mm=re.match(r'^\s*([a-zçãé]+):\s*(.*)$',l)
        if mm and mm.group(1) in CAMPOS:
            c,v=mm.group(1),mm.group(2).strip()
            if re.match(r'^\s',l) and cur_item is None and ult not in ('versao',): pass
            if ult=='versao' or (cur_item is None and pend_ver and c in ('entrega','meta') and cur_epico is None):
                detalhes[pend_ver][c]=v; continue
            if c=='meta' and (ult=='epico'): epicos[cur_epico]['meta']=v; 
            elif cur_item is not None and ult in ('item','detalhe'):
                it=itens[cur_item]
                if c=='aceite':
                    k=re.sub(r'\W+','',v.lower())
                    if k in it['aceites']: errs.append(f'{n}: aceite repetido no item {cur_item}')
                    it['aceites'].append(k)
                elif c in it['campos'] and c not in ('aceite',): errs.append(f'{n}: campo repetido {c} em {cur_item}')
                it['campos'][c]=v
                ult='detalhe'
                if c in LIM and len(v)>LIM[c]: errs.append(f'{n}: {c} acima de {LIM[c]} letras')
                if re.search(r'[\[\]{}]',v): errs.append(f'{n}: colchete ou chave dentro do texto de {c}')
                if c=='prioridade' and not re.match(r'^(Deve|Deveria|Poderia|Não terá agora)\s+[1-5]$',v): errs.append(f'{n}: prioridade inválida: {v}')
                if c=='nivel' and v not in list('12345'): errs.append(f'{n}: nível inválido')
                if c=='valor' and not re.match(r'^(10|[1-9])(\s+\S.*)?$',v): errs.append(f'{n}: valor inválido: {v}')
                if c=='pontos' and (not v.isdigit() or int(v) not in PONTOS): errs.append(f'{n}: pontos inválido: {v}')
                if c=='tipo' and v not in ('Item','Bug','Melhoria'): errs.append(f'{n}: tipo inválido')
                if c=='tipo' and v=='Bug' : pass
            else:
                errs.append(f'{n}: campo {c} fora de lugar')
            continue
        if mm and mm.group(1) not in CAMPOS and not s.startswith('- ') and re.match(r'^\s+',l):
            errs.append(f'{n}: campo que não existe: {mm.group(1)}'); continue
        # épico
        if l.startswith(' '):
            errs.append(f'{n}: linha recuada que não é campo: {s[:50]}'); continue
        fr=re.findall(r'\[([^\]]*)\]',s); vr=re.findall(r'\{([^}]*)\}',s)
        nome=re.sub(r'\s*(\[[^\]]*\]|\{[^}]*\})','',s).strip()
        if nome in epicos or nome in prev_e: errs.append(f'{n}: épico repetido: {nome}')
        for f in fr:
            if f not in ('Frontend','Backend','Database','Integrações'): errs.append(f'{n}: frente inválida {f}')
        for v in vr: ordem.append(('vr',v,n))
        epicos[nome]={'n':n,'meta':None}; cur_epico=nome; cur_item=None; ult='epico'; n_epicos+=1
    for _,v,n in ordem:
        if v not in versoes: avisos.append(f'{n}: versão {v} não declarada neste texto (precisa já existir)')
    for v,d in detalhes.items():
        if 'entrega' not in d: errs.append(f'versão {v} sem entrega')
    todos=set(itens)|prev_t
    for t,it in itens.items():
        c=it['campos']
        if 'depende' in c:
            for d in [x.strip() for x in c['depende'].split(';') if x.strip()]:
                if d.startswith('#') or re.match(r'^BL-\d+$',d): continue
                if d not in todos: errs.append(f"{it['n']}: depende aponta para item que não existe: {d}")
                if d==t: errs.append(f"{it['n']}: item depende de si mesmo")
        if not ({'historia'}<=set(c) or {'como','quero','para'}<=set(c)) and c.get('prioridade','').split(' ')[-1]!='5':
            errs.append(f"{it['n']}: item sem história: {t}")
        if not it['aceites'] and c.get('prioridade','').split(' ')[-1]!='5': errs.append(f"{it['n']}: item sem critério de aceite: {t}")
        for k in ('prioridade','valor','pontos'):
            if k not in c: errs.append(f"{it['n']}: falta {k}: {t}")
    print(f'épicos: {n_epicos} · itens: {n_itens} · versões declaradas: {sorted(versoes)}')
    for a in avisos: print('AVISO',a)
    for e in errs: print('ERRO',e)
    print('OK' if not errs else f'{len(errs)} erros')
    sys.exit(1 if errs else 0)
main()
