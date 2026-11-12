# The Mind Behind — confere a narração gerada contra o texto (transcrição local, sem IA paga).
# Uso: python conferir-narracao.py <pasta-do-episodio> [--palavras]
#   --palavras  também salva <episodio>/montagem/transcricao-palavras.json (palavras com tempo, usado pelo plano da montagem)
# Precisa de: pip install faster-whisper numpy  (e ffmpeg no PATH ou em _esteiras/cortes-redes-sociais/bin)
# Gera <episodio>/audio/CONFERENCIA.md com: duração, palavras por minuto, diferenças e palavras de baixa confiança.
import sys, re, json, difflib, subprocess, shutil, wave, os
from pathlib import Path
import numpy as np
try:
    from num2words import num2words
except ImportError:
    num2words = None
from faster_whisper import WhisperModel

pasta = Path(sys.argv[1])
txt = (pasta / 'NARRACAO-ELEVENLABS.txt').read_text(encoding='utf-8-sig').replace('\r\n', '\n')
blocos = re.findall(r'BLOCO (\S+)[^\n]*\n=====\n(.*?)\n=====', txt, re.S)
ff = shutil.which('ffmpeg') or str(Path(__file__).resolve().parents[2] / '_esteiras/cortes-redes-sociais/bin/ffmpeg.exe')
NUM = {'%': ' percent'}
def numeros(t):
    if not num2words: return t
    t = re.sub(r'(\d+)(st|nd|rd|th)\b', lambda m: num2words(int(m.group(1)), to='ordinal'), t)
    t = re.sub(r'\b(1[0-9]{3}|20[0-9]{2})\b', lambda m: num2words(int(m.group(1)), to='year'), t)
    t = re.sub(r'(\d+)%', lambda m: num2words(int(m.group(1))) + ' percent', t)
    return re.sub(r'\d+', lambda m: num2words(int(m.group(0))), t)
def norm(t):
    t = numeros(re.sub(r'\[[^\]]*\]', ' ', t)).lower().replace('-', ' ').replace(',', ' ')
    return re.sub(r"[^a-z0-9' ]", ' ', t).split()

def carregar(mp3):
    tmp = mp3.with_suffix('.conferencia.wav')
    subprocess.run([ff, '-v', 'error', '-y', '-i', str(mp3), '-ar', '16000', '-ac', '1', str(tmp)], check=True)
    w = wave.open(str(tmp)); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    w.close(); tmp.unlink()
    return a

modelo = WhisperModel('small.en', device='cpu', compute_type='int8')
linhas = ['# Conferência da narração', '', '| Bloco | Duração | Palavras/min | Diferenças | Baixa confiança |', '|---|---|---|---|---|']
detalhes = []
PALAVRAS = {}
for bid, texto in blocos:
    mp3 = pasta / 'audio' / f'{bid}.mp3'
    if not mp3.exists():
        linhas.append(f'| {bid} | — | — | arquivo ausente | — |'); continue
    a = carregar(mp3); dur = len(a) / 16000
    segs, _ = modelo.transcribe(a, word_timestamps=True, language='en')
    palavras, falado = [], ''
    for s in segs:
        falado += s.text
        palavras += [(w.word.strip(), w.probability) for w in s.words]
        PALAVRAS.setdefault(bid, {'dur': dur, 'words': []})['words'] += [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for w in s.words]
    # números escritos por extenso no texto podem voltar como dígitos na transcrição: comparar sem eles
    ref = [w for w in norm(texto) if w != 'and']
    hip = [w for w in norm(falado) if w != 'and']
    dif = [d for d in difflib.ndiff(ref, hip) if d[0] in '+-']
    baixa = [f'{w} ({p:.2f})' for w, p in palavras if p < 0.6]
    linhas.append(f'| {bid} | {dur:.0f} s | {len(palavras) / dur * 60:.0f} | {len(dif)} | {len(baixa)} |')
    detalhes += [f'## {bid}', '', f'- Diferenças (− faltou no áudio, + sobrou no áudio): {", ".join(dif) or "nenhuma"}',
                 f'- Palavras de baixa confiança: {", ".join(baixa) or "nenhuma"}', '', '<details><summary>Transcrição</summary>', '', falado.strip(), '', '</details>', '']
if '--palavras' in sys.argv:
    (pasta / 'montagem').mkdir(exist_ok=True)
    (pasta / 'montagem' / 'transcricao-palavras.json').write_text(json.dumps(PALAVRAS, ensure_ascii=False), encoding='utf-8')
out = pasta / 'audio' / 'CONFERENCIA.md'
out.write_text('\n'.join(linhas + [''] + detalhes), encoding='utf-8')
print('\n'.join(linhas))
print('Relatório:', out)
