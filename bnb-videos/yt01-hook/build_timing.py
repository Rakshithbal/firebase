# Builds timing.json: places VO lines on the timeline and estimates word times.
# Speech recognition is unavailable offline, so: (1) find speech segments in each wav by RMS energy,
# (2) split the line text at punctuation into phrases, (3) if the phrase count matches the segment count,
# map phrase->segment, else treat the whole line as one segment; (4) inside a segment, time words
# proportionally to character length.
import json, re, sys, numpy as np, soundfile as sf
D = 'audio/vo'; FPS = 30
lines = json.load(open('lines.json'))
START = {'H1': 0.25, 'H2': 3.30, 'H3': 6.35}   # line start offsets on the timeline (s)
TAIL = 1.40                                     # hold after last line (title card)
def segments(x, sr):
    hop = int(sr*0.01); n = len(x)//hop
    rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])
    thr = max(rms.max()*0.06, 1e-4); on = rms > thr
    segs=[]; i=0
    while i<n:
        if on[i]:
            j=i
            while j<n and on[j]: j+=1
            segs.append([i*0.01, j*0.01]); i=j
        else: i+=1
    merged=[]                       # merge gaps shorter than 140 ms (consonant closures)
    for s in segs:
        if merged and s[0]-merged[-1][1] < 0.14: merged[-1][1]=s[1]
        else: merged.append(s)
    return [s for s in merged if s[1]-s[0] > 0.05]
out={'fps':FPS,'w':1920,'h':1080,'lines':[]}
for L in lines:
    x, sr = sf.read(f"{D}/{L['id']}.wav"); x = x if x.ndim==1 else x.mean(1)
    segs = segments(x, sr)
    phrases = [p.strip() for p in re.findall(r'[^.,?!]+[.,?!]?', L['text']) if p.strip()]
    if len(segs) != len(phrases): segs = [[segs[0][0], segs[-1][1]]]; phrases=[L['text']]
    off = START[L['id']]; words=[]
    for (a,b),ph in zip(segs, phrases):
        ws = ph.split(); w8 = [len(re.sub(r'\W','',w))+1.5 for w in ws]; tot=sum(w8); t=a
        for w,k in zip(ws,w8):
            d=(b-a)*k/tot; words.append({'w':w,'s':round(off+t,3),'e':round(off+t+d,3)}); t+=d
    print(L['id'], 'segments', [[round(a,2),round(b,2)] for a,b in segs], 'phrases', len(phrases), file=sys.stderr)
    out['lines'].append({'id':L['id'],'text':L['text'],'start':words[0]['s'],'end':words[-1]['e'],
                         'wavStart':off,'wavDur':round(len(x)/sr,3),'words':words})
out['total'] = round(out['lines'][-1]['wavStart'] + out['lines'][-1]['wavDur'] + TAIL, 3)
json.dump(out, open('timing.json','w'), indent=1)
print('total', out['total'])
for l in out['lines']: print(l['id'], ' '.join(f"{w['w']}@{w['s']}" for w in l['words']))
