# usage: python3 make_vo.py <reel_dir>   -> audio/omega/*.wav, timing.json, audio/narration.wav
import json, re, subprocess, sys, os
d = sys.argv[1]; os.chdir(d)
L = json.load(open('lines.json'))
json.dump([dict(x, voice='hm_omega', speed=1.05, lang='en-us') for x in L], open('audio/lines_omega.json', 'w'))
subprocess.run(['/root/lemo-opuscar/.venv/bin/python', 'core/tts/tts.py', os.path.abspath('audio/lines_omega.json'), os.path.abspath('audio/omega')], cwd='/root/lemo-opuscar', check=True, capture_output=True)
dur = json.load(open('audio/omega/dur.json')); txt = {x['id']: x['text'] for x in L}
gap = {'L02': .35, 'L03': .4, 'L04': .45, 'L05': .3, 'L06': .5, 'L07': .35, 'L08': .4, 'L09': .55}
t = .4; out = []; place = []
for i in sorted(dur):
    t += gap.get(i, 0); s = t; dd = dur[i]; words = txt[i].split()
    w = [len(re.sub(r'\W', '', x)) + 1.5 for x in words]; tot = sum(w); c = s; ws = []
    for x, wt in zip(words, w):
        k = dd * wt / tot; ws.append({'w': x, 's': round(c, 3), 'e': round(c + k, 3)}); c += k
    out.append({'id': i, 'text': txt[i], 'start': round(s, 3), 'end': round(s + dd, 3), 'words': ws}); place.append((i, s)); t = s + dd
total = round(t + 1.4, 2)
json.dump({'total': total, 'fps': 30, 'w': 1080, 'h': 1920, 'lines': out}, open('timing.json', 'w'), indent=1)
inp = []; flt = []
for k, (i, s) in enumerate(place):
    inp += ['-i', f'audio/omega/{i}.wav']; flt.append(f'[{k}:a]aresample=48000,adelay={int(s*1000)}|{int(s*1000)}[a{k}]')
flt.append(''.join(f'[a{k}]' for k in range(len(place))) + f'amix=inputs={len(place)}:normalize=0,apad,atrim=0:{total}[o]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inp, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ac', '1', 'audio/narration.wav'], check=True)
print(d, 'total', total)
