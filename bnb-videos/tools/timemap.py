"""Piecewise-linear map from an old narration timeline to a new one (same script, new voice).
Anchors: every word start, every line end, 0 and the totals. Used to move hand-placed SFX/music cues."""
import json, numpy as np
def make_map(old_path, new_path):
    o, n = json.load(open(old_path)), json.load(open(new_path))
    xs, ys = [0.0], [0.0]
    for lo, ln in zip(o['lines'], n['lines']):
        assert lo['id'] == ln['id'] and len(lo['words']) == len(ln['words'])
        for wo, wn in zip(lo['words'], ln['words']): xs.append(wo['s']); ys.append(wn['s'])
        xs.append(lo['end']); ys.append(ln['end'])
    xs.append(o['total']); ys.append(n['total'])
    xs, ys = np.array(xs), np.array(ys)
    def M(t):
        if t <= xs[-1]: return float(np.interp(t, xs, ys))
        return float(ys[-1] + (t - xs[-1]))
    return M, n['total']
