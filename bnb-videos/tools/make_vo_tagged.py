# Parametrised copy of make_vo.py (same word-timing + gap logic). Used for the R10/R15 am_michael re-voice.
# usage: python3 make_vo_tagged.py <reel_dir> [--voice am_michael] [--speed 1.0] [--tag michael] [--tail 1.4]
#   -> <reel>/audio_<tag>/<id>.wav, audio_<tag>/narration.wav, <reel>/timing_<tag>.json
import json, re, subprocess, sys, os, argparse
ap = argparse.ArgumentParser(); ap.add_argument('reel_dir'); ap.add_argument('--voice', default='am_michael')
ap.add_argument('--speed', type=float, default=1.0); ap.add_argument('--tag', default='michael'); ap.add_argument('--tail', type=float, default=1.4)
ap.add_argument('--skip-tts', action='store_true')
a = ap.parse_args(); os.chdir(a.reel_dir)
AD = f'audio_{a.tag}'; os.makedirs(AD, exist_ok=True)
L = json.load(open('lines.json'))
json.dump([dict(x, voice=a.voice, speed=a.speed, lang='en-us') for x in L], open(f'{AD}/lines_{a.tag}.json', 'w'))
if not a.skip_tts:
    subprocess.run(['/root/lemo-opuscar/.venv/bin/python', 'core/tts/tts.py', os.path.abspath(f'{AD}/lines_{a.tag}.json'), os.path.abspath(AD)], cwd='/root/lemo-opuscar', check=True, capture_output=True)
dur = json.load(open(f'{AD}/dur.json')); txt = {x['id']: x['text'] for x in L}
gap = {'L02': .35, 'L03': .4, 'L04': .45, 'L05': .3, 'L06': .5, 'L07': .35, 'L08': .4, 'L09': .55}
t = .4; out = []; place = []
for i in sorted(dur):
    t += gap.get(i, 0); s = t; dd = dur[i]; words = txt[i].split()
    w = [len(re.sub(r'\W', '', x)) + 1.5 for x in words]; tot = sum(w); c = s; ws = []
    for x, wt in zip(words, w):
        k = dd * wt / tot; ws.append({'w': x, 's': round(c, 3), 'e': round(c + k, 3)}); c += k
    out.append({'id': i, 'text': txt[i], 'start': round(s, 3), 'end': round(s + dd, 3), 'words': ws}); place.append((i, s)); t = s + dd
total = round(t + a.tail, 2)
json.dump({'total': total, 'fps': 30, 'w': 1080, 'h': 1920, 'lines': out}, open(f'timing_{a.tag}.json', 'w'), indent=1)
inp = []; flt = []
for k, (i, s) in enumerate(place):
    inp += ['-i', f'{AD}/{i}.wav']; flt.append(f'[{k}:a]aresample=48000,adelay={int(s*1000)}|{int(s*1000)}[a{k}]')
flt.append(''.join(f'[a{k}]' for k in range(len(place))) + f'amix=inputs={len(place)}:normalize=0,apad,atrim=0:{total}[o]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inp, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ac', '1', f'{AD}/narration.wav'], check=True)
print(a.reel_dir, 'total', total, {o['id']: (o['start'], o['end']) for o in out})
