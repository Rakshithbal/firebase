"""STYLE 07 - Data editorial (Swiss). Lemo dataviz grammar (the chart is the film; one idea at a time;
every movement is a chart operation) in a Swiss editorial skin: near-white ground, strict 6-column grid,
Inter grotesk, ink black + ONE accent (signal red) used only for the gap. No numbers anywhere.

  python chart07.py --probe 0.2,2.2,4.4,6.5,9.0  -> stills/
  python chart07.py --out out/video_noaudio.mp4
"""
import argparse, json, math, pathlib, subprocess
import numpy as np
import skia
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
W, H, FPS = 1080, 1920, 30
TIM = json.loads((HERE / "timing.json").read_text()); DUR = TIM["total"]
L = TIM["lines"]
def wt(li, w):
    return next(x["s"] for x in L[li]["words"] if x["w"].lower().strip(",.?").startswith(w))

GROUND = (244, 243, 239); INK = (17, 17, 17); GREY = (150, 150, 146); HAIR = (214, 213, 208)
ACC = (226, 35, 26)
FB = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
FS = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
FM = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
FR = "/usr/share/fonts/opentype/inter/Inter-Regular.otf"

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ramp(t, t0, d): return clamp((t - t0) / d) if d > 0 else float(t >= t0)
def expo(x): return 1 - 2 ** (-10 * x) if x < 1 else 1.0
def eio(x): return x * x * (3 - 2 * x)

_fc = {}
def F(name, size):
    k = (name, size)
    if k not in _fc:
        f = skia.Font(skia.Typeface.MakeFromFile(name), size); f.setSubpixel(True); f.setEdging(skia.Font.Edging.kAntiAlias); _fc[k] = f
    return _fc[k]

def paint(rgb, a=1.0, stroke=None, cap=skia.Paint.kButt_Cap):
    p = skia.Paint(AntiAlias=True, Color=skia.Color(*[int(v) for v in rgb], int(255 * clamp(a))))
    if stroke is not None:
        p.setStyle(skia.Paint.kStroke_Style); p.setStrokeWidth(stroke); p.setStrokeCap(cap); p.setStrokeJoin(skia.Paint.kMiter_Join)
    return p

def text(c, s, x, y, fn, size, rgb, a=1.0, track=0.0, align="left"):
    f = F(fn, size); ws = f.getWidths(f.textToGlyphs(s)); tr = track * size
    tot = sum(ws) + tr * (len(s) - 1)
    x0 = x - tot if align == "right" else x - tot / 2 if align == "center" else x
    p = paint(rgb, a); cx = x0
    for ch, w in zip(s, ws):
        c.drawString(ch, cx, y, f, p); cx += w + tr
    return tot

def masked_text(c, s, x, y, fn, size, rgb, u, track=0.0):
    """Swiss reveal: text rises out of a baseline mask."""
    if u <= 0: return
    c.save(); c.clipRect(skia.Rect.MakeLTRB(x - 10, y - size * 1.1, x + 2000, y + size * 0.3))
    text(c, s, x, y + (1 - expo(u)) * size * 1.2, fn, size, rgb, 1, track)
    c.restore()

# ------------------------------------------------------------------ layout (strict grid: 6 columns, 60 px margins)
ML, MR = 60, 960                      # right ~120 px kept clear
COLW = (MR - ML) / 6
PX0, PX1, PY0, PY1 = ML + 70, MR - 10, 600, 1150      # plot box
STAGES = [("Plinth", 0.22), ("Slab", 0.47), ("Walls", 0.71), ("Finishing", 0.93)]
LEVELS = [0.0, 0.30, 0.55, 0.79, 0.97]
def loan(x):
    lv = LEVELS[0]
    for k, (_, sx) in enumerate(STAGES):
        if x >= sx: lv = LEVELS[k + 1]
    return lv
def bills(x): return 0.04 + 0.90 * x ** 1.12
def X(x): return PX0 + (PX1 - PX0) * x
def Y(y): return PY1 - (PY1 - PY0) * y

T_STAGES = (wt(0, "loan"), L[0]["end"] - 0.05)       # stepped line draws across L1
T_BILLS = (L[1]["start"], L[1]["end"])
T_GAP = wt(2, "gap"); T_PLAN = wt(2, "plan")


class Chart:
    def __init__(self):
        self.surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W, H, skia.ColorType.kRGBA_8888_ColorType, skia.AlphaType.kPremul_AlphaType))
        xs = np.linspace(0, 1, 601)
        self.xs = xs
        # stepped path (vertical risers at each release)
        p = skia.Path(); p.moveTo(X(0), Y(LEVELS[0]))
        for k, (_, sx) in enumerate(STAGES):
            p.lineTo(X(sx), Y(LEVELS[k])); p.lineTo(X(sx), Y(LEVELS[k + 1]))
        p.lineTo(X(1), Y(LEVELS[-1]))
        self.loan = p
        b = skia.Path(); b.moveTo(X(0), Y(bills(0)))
        for x in xs[1:]: b.lineTo(X(x), Y(bills(x)))
        self.bills = b
        # gap regions: where bills run ahead of the loan released so far
        self.gaps = []
        inside = False
        for x in xs:
            g = bills(x) > loan(x) + 1e-4
            if g and not inside: start = x; inside = True
            if (not g or x == xs[-1]) and inside:
                self.gaps.append((start, x)); inside = False
        self.biggest = max(self.gaps, key=lambda g: (g[1] - g[0]) * 1)

    def partial(self, path, u):
        if u >= 1: return path
        pm = skia.PathMeasure(path, False); out = skia.Path(); pm.getSegment(0, pm.getLength() * clamp(u), out, True); return out

    def draw(self, c, t):
        c.clear(skia.Color(*GROUND))
        # grid: 6 columns, hairlines (drawn on at the start, Swiss scaffolding stays visible)
        ug = expo(ramp(t, 0.0, 0.7))
        for i in range(7):
            x = ML + COLW * i
            c.drawLine(x, 240, x, 240 + (1330 - 240) * ug, paint(HAIR, 0.55, stroke=1))
        # top: style label, index square
        c.drawRect(skia.Rect.MakeXYWH(ML, 128, 26, 26), paint(ACC))
        text(c, "STYLE 07  ·  DATA EDITORIAL", ML + 42, 151, FS, 24, INK, 1, 0.12)
        text(c, "Swiss charts", MR, 151, FM, 24, GREY, 1, 0.02, "right")
        c.drawLine(ML, 186, MR, 186, paint(INK, 1, stroke=2))
        # headline (world space, set on the grid)
        text(c, "Loan vs. bills", ML, 330, FB, 104, INK, 1, -0.02)
        text(c, "How money arrives while you build", ML, 392, FM, 32, INK, 0.8, 0)
        text(c, "Illustrative shape, not real data", ML, 432, FR, 24, GREY, 1, 0)
        # axes: words only, no values
        ua = expo(ramp(t, -0.45, 0.7))
        c.drawLine(PX0, PY1, PX0 + (PX1 - PX0) * ua, PY1, paint(INK, 1, stroke=3))
        c.drawLine(PX0, PY1, PX0, PY1 - (PY1 - PY0 + 40) * ua, paint(INK, 1, stroke=3))
        masked_text(c, "Money", PX0 - 70, PY0 - 70, FS, 30, INK, ramp(t, -0.3, 0.5))
        ar = skia.Path(); ar.moveTo(PX0, PY0 - 52); ar.lineTo(PX0 - 9, PY0 - 34); ar.lineTo(PX0 + 9, PY0 - 34); ar.close()
        if ua > 0.95: c.drawPath(ar, paint(INK))
        masked_text(c, "Build time", PX1 - 150, PY1 + 120, FS, 30, INK, ramp(t, -0.2, 0.5))
        ar2 = skia.Path(); ar2.moveTo(PX1 + 14, PY1); ar2.lineTo(PX1 - 4, PY1 - 9); ar2.lineTo(PX1 - 4, PY1 + 9); ar2.close()
        if ua > 0.95: c.drawPath(ar2, paint(INK))
        # loan: stepped line drawn left -> right across line 1
        ul = eio(ramp(t, T_STAGES[0] - 0.15, T_STAGES[1] - T_STAGES[0] + 0.1))
        xh = ul      # x-progress of the pen
        # stage guides + labels appear as the pen reaches each release
        for k, (name, sx) in enumerate(STAGES):
            us = ramp(t, T_STAGES[0] - 0.15 + (T_STAGES[1] - T_STAGES[0] + 0.1) * self._u_of_x(sx), 0.35)
            if us <= 0: continue
            dp = paint(GREY, 0.8 * us, stroke=1.5); dp.setPathEffect(skia.DashPathEffect.Make([4, 6], 0))
            c.drawLine(X(sx), PY1, X(sx), Y(LEVELS[k + 1]) - 10, dp)
            c.drawLine(X(sx), PY1, X(sx), PY1 + 14, paint(INK, us, stroke=2))
            masked_text(c, name, X(sx) - 4, PY1 + 52, FM, 27, INK, us)
        # bills weekly ticks along the base (every week, no values)
        ub = eio(ramp(t, T_BILLS[0], T_BILLS[1] - T_BILLS[0]))
        for i in range(1, 40):
            x = i / 40
            if x <= ub:
                a = clamp((ub - x) * 30)
                c.drawLine(X(x), PY1 - 3, X(x), PY1 - 15, paint(INK, 0.55 * a, stroke=1.5))
        # gap fill (the only accent), wipes left -> right on "Plan the gap"
        ug2 = expo(ramp(t, T_PLAN, T_GAP - T_PLAN + 0.25))
        if ug2 > 0:
            for (a0, a1) in self.gaps:
                if a0 > ug2: continue
                b1 = min(a1, ug2)
                xs = np.linspace(a0, b1, 60)
                g = skia.Path(); g.moveTo(X(xs[0]), Y(loan(xs[0])))
                for x in xs: g.lineTo(X(x), Y(bills(x)))
                for x in xs[::-1]: g.lineTo(X(x), Y(loan(x) if x < a1 else loan(a1 - 1e-6)))
                g.close()
                c.drawPath(g, paint(ACC, 0.85))
        c.drawPath(self.partial(self.loan, xh), paint(INK, 1, stroke=7, cap=skia.Paint.kSquare_Cap))
        # release markers: solid squares on each step
        for k, (_, sx) in enumerate(STAGES):
            if xh >= self._u_of_x(sx) + 0.035 and ul > 0:
                c.drawRect(skia.Rect.MakeXYWH(X(sx) - 9, Y(LEVELS[k + 1]) - 9, 18, 18), paint(INK))
        # bills: smooth rising line, thinner, ink with white halo for crossings
        if ub > 0:
            seg = self.partial(self.bills, ub)
            c.drawPath(seg, paint(GROUND, 1, stroke=9, cap=skia.Paint.kRound_Cap))
            c.drawPath(seg, paint(INK, 1, stroke=3.5, cap=skia.Paint.kRound_Cap))
            hx, hy = X(ub), Y(bills(ub))
            if ub < 1: c.drawCircle(hx, hy, 7, paint(INK))
        # direct labels (no legend box)
        ul2 = ramp(t, T_STAGES[1] - 0.2, 0.4)
        if ul2 > 0:
            masked_text(c, "Loan releases", X(0.60), Y(LEVELS[4]) - 22, FS, 30, INK, ul2)
        ub2 = ramp(t, T_BILLS[1] - 0.3, 0.4)
        if ub2 > 0:
            c.drawLine(X(0.40), Y(bills(0.40)), X(0.40) - 70 * ub2, Y(bills(0.40)) - 70 * ub2, paint(INK, ub2, stroke=1.5))
            masked_text(c, "Bills", X(0.40) - 140, Y(bills(0.40)) - 80, FS, 30, INK, ub2)
        # "The gap" lands on "gap"
        uL = ramp(t, T_GAP - 0.02, 0.35)
        if uL > 0:
            a0, a1 = self.biggest; xm = (a0 + a1) / 2 + 0.01
            px, py = X(xm), (Y(bills(xm)) + Y(loan(xm))) / 2
            lx, ly = X(0.04), Y(0.80)
            u = expo(uL)
            ex, ey = lx + 60, ly + 122
            c.drawLine(px, py, px + (ex - px) * u, py + (ey - py) * u, paint(ACC, 1, stroke=2.5))
            c.drawCircle(px, py, 6, paint(ACC))
            masked_text(c, "The gap", lx - 10, ly + 62, FB, 64, ACC, ramp(t, T_GAP + 0.08, 0.35))
            masked_text(c, "Money you must have ready", lx - 8, ly + 104, FM, 27, INK, ramp(t, T_GAP + 0.25, 0.4))
        # caption (figure-caption style: hairline rule, left-aligned grotesk, keyword in the accent)
        caps = [(L[0]["start"] - 0.05, L[1]["start"] - 0.1, "Your loan comes in stages.", "stages"),
                (L[1]["start"] - 0.05, L[2]["start"] - 0.1, "Your bills come every week.", "week"),
                (L[2]["start"] - 0.05, DUR - 0.5, "Plan the gap.", "gap")]
        for s, e, ln, kw in caps:
            if not (s <= t < e): continue
            a = ramp(t, s, 0.15) * (1 - ramp(t, e - 0.12, 0.12))
            c.drawLine(ML, 1388, ML + (MR - ML) * expo(ramp(t, s, 0.4)), 1388, paint(INK, a, stroke=2))
            x = ML; y = 1458
            c.save(); c.clipRect(skia.Rect.MakeLTRB(ML - 5, 1395, MR + 100, 1480))
            dy = (1 - expo(ramp(t, s, 0.35))) * 60
            for wd in ln.split(" "):
                key = wd.strip(".,").lower() == kw
                x += text(c, wd + " ", x, y + dy, FB if key else FS, 54, ACC if key else INK, a, -0.01)
            c.restore()
        fo = ramp(t, DUR - 0.4, 0.4)
        if fo > 0: c.drawRect(skia.Rect.MakeWH(W, H), paint(GROUND, fo))

    def _u_of_x(self, sx):
        """pen progress (0..1 of the stepped path's length) at which it reaches x = sx."""
        if not hasattr(self, "_len"):
            pm = skia.PathMeasure(self.loan, False); self._len = pm.getLength()
            self._pm = pm
        # risers come before x advances, so approximate by horizontal share + risers below
        horiz = (PX1 - PX0)
        rise = sum(abs(Y(LEVELS[k + 1]) - Y(LEVELS[k])) for k, (_, s) in enumerate(STAGES) if s < sx)
        return (X(sx) - PX0 + rise) / self._len

    def frame(self, n):
        with self.surf as c:
            self.draw(c, n / FPS)
        return self.surf.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--probe", default=""); ap.add_argument("--out", default="")
    a = ap.parse_args(); ch = Chart()
    if a.probe:
        (HERE / "stills").mkdir(exist_ok=True)
        for s in a.probe.split(","):
            t = float(s); Image.fromarray(ch.frame(int(round(t * FPS)))).save(HERE / "stills" / f"t{t:05.2f}.png")
        return
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    for n in range(int(round(DUR * FPS))):
        ff.stdin.write(ch.frame(n).tobytes())
    ff.stdin.close(); ff.wait(); print("wrote", a.out)


if __name__ == "__main__":
    main()
