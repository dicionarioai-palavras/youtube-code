# Orçamento de caracteres da narração em português (regra de 05/11/2026, depois do EP01).
# Por quê: a voz clonada fala ~14 caracteres/s em português e o português sai ~15% mais longo que o inglês.
# Acelerar o áudio para caber (EP01: até 15%) deixou a voz metalizada e inutilizável. Então o texto em PT
# é escrito JÁ no tamanho certo, e a aceleração máxima permitida no encaixe é 3%.
#
# Uso (antes de qualquer chamada ao ElevenLabs para o PT, e só depois que Luiz disse que quer a faixa PT-BR):
#   python orcamento_pt_br.py <pasta-do-episodio>
# Lê audio/<bloco>.mp3 (inglês) e NARRACAO-PT-BR.txt; mostra, por bloco, o orçamento e quanto cortar.
# Sai com código 1 se algum bloco passar do orçamento: aí a IA enxuga o texto PT (sem mudar o sentido) e roda de novo.
import re, sys, subprocess as sp, pathlib
CAR_POR_S = 13.5      # medido no EP01: 13,5–14,9 car/s (média 14,2). Usa o mais lento, para sobrar margem
FOLGA = 1.03          # aceleração máxima aceita depois (inaudível)
ep = pathlib.Path(sys.argv[1])
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def blocos(arq):
    t = (ep/arq).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    return dict(re.findall(r'BLOCO (\S+)[^\n]*\n=====\n(.*?)\n=====', t, re.S))
pt = blocos('NARRACAO-PT-BR.txt')
ruim = False
print(f'{"bloco":14} {"EN (s)":>7} {"orçamento":>9} {"PT atual":>8}  situação')
for bid, texto in pt.items():
    en = ep/'audio'/f'{bid}.mp3'
    if not en.exists(): print(bid, 'sem áudio em inglês'); continue
    c = len(re.sub(r'\[[a-z ]+\]\s*', '', texto))
    orc = int(dur(en) * CAR_POR_S * FOLGA)
    ok = c <= orc
    ruim |= not ok
    print(f'{bid:14} {dur(en):7.1f} {orc:9d} {c:8d}  ' + ('ok' if ok else f'CORTAR {c-orc} caracteres ({100*(c-orc)/c:.0f}%)'))
sys.exit(1 if ruim else 0)
