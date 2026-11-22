# usage: python vo_timing.py <sample_dir> L01=0.9 L02=3.3 ...  -> timing.json + audio/narration.wav (mono 48k, 10 s)
# Speech recognition is unavailable offline: words are timed proportionally to character length (as make_vo.py).
import json, re, subprocess, sys, os
d = sys.argv[1]; os.chdir(d); TOTAL = 10.0
starts = dict(a.split('=') for a in sys.argv[2:])
L = json.load(open('lines.json')); dur = json.load(open('audio/vo/dur.json'))
out = []; inp = []; flt = []
for k, x in enumerate(L):
    i = x['id']; s = float(starts[i]); dd = dur[i]; words = x.get('caption', x['text']).split()
    w = [len(re.sub(r'\W', '', y)) + 1.5 for y in words]; tot = sum(w); c = s; ws = []
    for y, wt in zip(words, w):
        kk = dd * wt / tot; ws.append({'w': y, 's': round(c, 3), 'e': round(c + kk, 3)}); c += kk
    out.append({'id': i, 'text': x.get('caption', x['text']), 'start': s, 'end': round(s + dd, 3), 'words': ws})
    inp += ['-i', f'audio/vo/{i}.wav']; ms = int(s * 1000); flt.append(f'[{k}:a]aresample=48000,adelay={ms}|{ms}[a{k}]')
flt.append(''.join(f'[a{k}]' for k in range(len(L))) + f'amix=inputs={len(L)}:normalize=0,apad,atrim=0:{TOTAL}[o]')
subprocess.run(['/root/.local/bin/ffmpeg', '-y', '-loglevel', 'error', *inp, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ac', '1', '-ar', '48000', 'audio/narration.wav'], check=True)
json.dump({'total': TOTAL, 'fps': 30, 'w': 1080, 'h': 1920, 'lines': out}, open('timing.json', 'w'), indent=1)
for o in out: print(o['id'], o['start'], o['end'], [(w['w'], w['s']) for w in o['words']])
