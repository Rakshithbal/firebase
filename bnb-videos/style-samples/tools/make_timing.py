# usage: python make_timing.py <sample_dir> <vo_start_s> <total_s> [display text]
# Reads lines.json + audio/vo/dur.json, times words proportionally to character length
# (speech recognition is blocked), writes timing.json and audio/narration.wav (mono 48 kHz on the timeline).
import json, re, subprocess, sys, os
d, start, total = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
os.chdir(d)
L = json.load(open('lines.json'))[0]
dur = json.load(open('audio/vo/dur.json'))['L01']
disp = sys.argv[4] if len(sys.argv) > 4 else L['text']
words = disp.split()
sp = L['text'].split(); src = sp if len(sp) == len(words) else words
w = [len(re.sub(r'\W', '', x)) + 1.5 for x in src]
# a comma / full stop / question mark adds a little pause weight after the word
w = [x + (2.2 if re.search(r'[.,?!]$', words[i]) and i < len(words) - 1 else 0) for i, x in enumerate(w)]
tot = sum(w); c = start; ws = []
for x, wt in zip(words, w):
    k = dur * wt / tot; ws.append({'w': x, 's': round(c, 3), 'e': round(c + k, 3)}); c += k
json.dump({'total': total, 'fps': 30, 'w': 1080, 'h': 1920, 'vo_start': start, 'vo_end': round(start + dur, 3),
           'text': disp, 'words': ws}, open('timing.json', 'w'), indent=1)
ms = int(start * 1000)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio/vo/L01.wav', '-af',
                f'aresample=48000,adelay={ms}|{ms},apad,atrim=0:{total}', '-ac', '1', 'audio/narration.wav'], check=True)
print(d, 'vo', start, '->', round(start + dur, 3))
