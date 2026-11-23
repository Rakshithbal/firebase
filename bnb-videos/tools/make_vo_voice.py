# Parametrised copy of make_vo.py (same gap + proportional word-timing logic), for re-voicing a reel.
# usage: python3 make_vo_voice.py <lines.json> <work_dir> <timing_out.json> [--voice am_michael] [--speed 1.0]
#   -> <work_dir>/lines_<voice>.json, <work_dir>/<voice>/*.wav (+dur.json), <work_dir>/narration.wav, <timing_out.json>
import json, re, subprocess, sys, os, argparse
ap = argparse.ArgumentParser()
ap.add_argument('lines'); ap.add_argument('work'); ap.add_argument('timing')
ap.add_argument('--voice', default='am_michael'); ap.add_argument('--speed', type=float, default=1.0)
ap.add_argument('--lang', default='en-us'); ap.add_argument('--skip-tts', action='store_true')
a = ap.parse_args()
work = os.path.abspath(a.work); os.makedirs(work, exist_ok=True)
L = json.load(open(a.lines))
lj = os.path.join(work, f'lines_{a.voice}.json'); vdir = os.path.join(work, a.voice.split('_')[-1])
json.dump([dict(x, voice=a.voice, speed=a.speed, lang=a.lang) for x in L], open(lj, 'w'))
if not a.skip_tts:
    subprocess.run(['/root/lemo-opuscar/.venv/bin/python', 'core/tts/tts.py', lj, vdir], cwd='/root/lemo-opuscar', check=True, capture_output=True)
dur = json.load(open(os.path.join(vdir, 'dur.json'))); txt = {x['id']: x['text'] for x in L}
gap = {'L02': .35, 'L03': .4, 'L04': .45, 'L05': .3, 'L06': .5, 'L07': .35, 'L08': .4, 'L09': .55}
t = .4; out = []; place = []
for i in sorted(dur):
    t += gap.get(i, 0); s = t; dd = dur[i]; words = txt[i].split()
    w = [len(re.sub(r'\W', '', x)) + 1.5 for x in words]; tot = sum(w); c = s; ws = []
    for x, wt in zip(words, w):
        k = dd * wt / tot; ws.append({'w': x, 's': round(c, 3), 'e': round(c + k, 3)}); c += k
    out.append({'id': i, 'text': txt[i], 'start': round(s, 3), 'end': round(s + dd, 3), 'words': ws}); place.append((i, s)); t = s + dd
total = round(t + 1.4, 2)
json.dump({'total': total, 'fps': 30, 'w': 1080, 'h': 1920, 'voice': a.voice, 'speed': a.speed, 'lines': out}, open(a.timing, 'w'), indent=1)
inp = []; flt = []
for k, (i, s) in enumerate(place):
    inp += ['-i', os.path.join(vdir, f'{i}.wav')]; flt.append(f'[{k}:a]aresample=48000,adelay={int(s*1000)}|{int(s*1000)}[a{k}]')
flt.append(''.join(f'[a{k}]' for k in range(len(place))) + f'amix=inputs={len(place)}:normalize=0,apad,atrim=0:{total}[o]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inp, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ac', '1', os.path.join(work, 'narration.wav')], check=True)
print(a.timing, 'total', total)
for o in out: print(o['id'], o['start'], o['end'])
