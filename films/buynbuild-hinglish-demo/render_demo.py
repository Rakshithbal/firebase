"""30-second Hinglish demo of the cold open in the new parchment / stick-figure style.

python3 render_demo.py [--size 2560x1440] [--still 12.5] [--out out/demo.mp4]
Design space is 1920x1080; everything is scaled to the output size.
"""
import argparse, math, subprocess, sys
from pathlib import Path
import numpy as np
import skia

HERE = Path(__file__).parent
FONTS = HERE.parent / "buynbuild-hidden-cost" / "fonts"
FPS = 30
LEAD = 0.6                     # silence before the voice starts
VO_LEN = 34.3
DUR = LEAD + VO_LEN + 2.4

INK = skia.Color(28, 26, 24)
RED = skia.Color(206, 40, 30)
WHITE = skia.Color(255, 253, 248)
HAT = skia.Color(244, 180, 26)          # contractor's hard hat
BLUE = skia.Color(36, 96, 168)          # blueprint blue: water, technical bits
NOTE = skia.Color(255, 226, 120)

TF_B = skia.Typeface.MakeFromFile(str(FONTS / "label.ttf"))   # Montserrat 800
TF_M = skia.Typeface.MakeFromFile(str(FONTS / "labelm.ttf"))  # Montserrat 600
TF_H = skia.Typeface.MakeFromFile(str(FONTS / "hand.ttf"))    # handwriting


def T(x):                      # voice-relative time -> film time
    return LEAD + x


# ---------------------------------------------------------------- timing (from the voice's pauses)
L = [T(v) for v in (0.0, 5.61, 8.33, 12.28, 17.16, 19.11, 22.55, 29.54)]
B = dict(q=T(3.99), lakh25=T(6.81), nobody=T(13.78), ran=T(15.3), total7=T(21.0), notcem=T(23.9),
         paper=T(25.69), loan=T(26.82), six=T(31.2))

CAPS = [  # (voice start, voice end, text with *red* words)
    (0.00, 1.31, "Karnataka ki ek family,"),
    (1.64, 3.55, "contractor se ek *simple sawaal* poochhti hai:"),
    (3.99, 5.15, "hamara ghar *kitne ka* banega?"),
    (5.61, 6.29, "Woh kehta hai,"),
    (6.81, 7.77, "*pachchees lakh* rupaye."),
    (8.33, 11.75, "Atthaarah mahine baad, kharcha ho chuka hai lagbhag *tees lakh*."),
    (12.28, 13.30, "Ab ajeeb baat suniye."),
    (13.78, 16.70, "Kisi ne unse *jhooth nahi* bola. Koi paisa lekar *bhaaga nahi*."),
    (17.16, 18.53, "Toh woh *paanch lakh* rupaye gaye kahaan?"),
    (19.11, 20.38, "Aaj hum *ek-ek rupaya* dhoondhenge."),
    (21.00, 21.94, "Total *saat leaks* hain."),
    (22.55, 23.56, "Aur leak number *saat*,"),
    (23.90, 25.16, "cement ya steel ka *nahi* hai."),
    (25.69, 26.51, "Woh *kaagaz* ka hai,"),
    (26.82, 28.88, "aur woh aapka *bank loan* ek jhatke mein rok sakta hai."),
    (29.54, 32.22, "End tak rukiyega, kyunki hum aapko woh *chhe sawaal* denge,"),
    (32.63, 33.88, "jo har leak *band* kar dete hain."),
]

SFX = []   # (time, kind) collected while building the timeline


def sfx(t, kind):
    SFX.append((t, kind))


# ---------------------------------------------------------------- helpers
def clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))


def ease(u):
    u = clamp(u)
    return u * u * (3 - 2 * u)


def pop(t, t0, d=0.32):
    """0 before t0, overshoots to ~1.12, settles at 1."""
    if t < t0:
        return 0.0
    u = clamp((t - t0) / d)
    c = 2.2
    return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2


def fade(t, t0, d=0.25):
    return ease((t - t0) / d)


def boil(t, seed, amp=1.6):
    """Hand-drawn line boil: a new tiny offset 8 times a second."""
    k = int(t * 8)
    r = np.random.default_rng(abs(hash((seed, k))) % (2 ** 32))
    return r.uniform(-amp, amp), r.uniform(-amp, amp)


def paint(color, w=0.0, fill=False, alpha=1.0, cap=True):
    p = skia.Paint(AntiAlias=True, Color=color)
    p.setAlphaf(alpha * p.getAlphaf())
    if fill:
        p.setStyle(skia.Paint.kFill_Style)
    else:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(w)
        if cap:
            p.setStrokeCap(skia.Paint.kRound_Cap)
            p.setStrokeJoin(skia.Paint.kRound_Join)
    return p


def font(tf, size):
    f = skia.Font(tf, size)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    return f


def text_w(s, f):
    return f.measureText(s)


def draw_text(c, s, x, y, f, color, align="c", alpha=1.0):
    w = text_w(s, f)
    x0 = x - w / 2 if align == "c" else (x - w if align == "r" else x)
    c.drawString(s, x0, y, f, paint(color, fill=True, alpha=alpha))
    return w


class scaled:
    """Context: scale (pop) around a point."""
    def __init__(self, c, x, y, s, rot=0.0):
        self.c, self.x, self.y, self.s, self.rot = c, x, y, s, rot

    def __enter__(self):
        self.c.save()
        self.c.translate(self.x, self.y)
        if self.rot:
            self.c.rotate(self.rot)
        self.c.scale(self.s, self.s)
        self.c.translate(-self.x, -self.y)

    def __exit__(self, *a):
        self.c.restore()


def limb(c, pts, w=11, alpha=1.0):
    """White-filled limb with a black outline (the stick-figure look)."""
    path = skia.Path()
    path.moveTo(*pts[0])
    for p in pts[1:]:
        path.lineTo(*p)
    c.drawPath(path, paint(INK, w + 7, alpha=alpha))
    c.drawPath(path, paint(WHITE, w, alpha=alpha))


def trim_path(path, frac):
    """First `frac` of the path's total length (all contours), for draw-on animation."""
    if frac >= 1:
        return path
    pm = skia.PathMeasure(path, False)
    lens = []
    while True:
        lens.append(pm.getLength())
        if not pm.nextContour():
            break
    total = sum(lens) * max(0.0, frac)
    out = skia.Path()
    pm = skia.PathMeasure(path, False)
    for ln in lens:
        if total <= 0:
            break
        seg = min(ln, total)
        pm.getSegment(0, seg, out, True)
        total -= seg
        pm.nextContour()
    return out


# ---------------------------------------------------------------- characters
def figure(c, x, feet, h, t, seed, pose="idle", face="smile", kind="man", alpha=1.0, flip=1):
    """Our own stick figures: white-filled limbs, black outline, small accessories per character."""
    dx, dy = boil(t, seed, 1.2)
    x += dx
    feet += dy
    r = h * 0.14
    hy = feet - h + r
    neck = (x, hy + r)
    hip = (x, feet - h * 0.42)
    sh = (x, hy + r + h * 0.07)
    lw = max(7.0, h * 0.045)
    # legs
    step = 0.0
    if pose == "run":
        step = math.sin(t * 14) * h * 0.14
    limb(c, [hip, (x - h * 0.11 + step, feet)], lw, alpha)
    limb(c, [hip, (x + h * 0.11 - step, feet)], lw, alpha)
    limb(c, [neck, hip], lw, alpha)
    # arms
    a = h * 0.3
    sway = math.sin(t * 2.4 + seed) * h * 0.015
    if pose == "idle":
        L_ = [(x - a * 0.55, sh[1] + a * 0.85 + sway)]
        R_ = [(x + a * 0.55, sh[1] + a * 0.85 - sway)]
    elif pose == "ask":          # one hand raised, palm up
        L_ = [(x - a * 0.55, sh[1] + a * 0.85)]
        R_ = [(x + a * 0.6 * flip, sh[1] + a * 0.35), (x + a * 0.95 * flip, sh[1] + a * 0.05 + sway)]
    elif pose == "point":
        L_ = [(x - a * 0.5 * flip, sh[1] + a * 0.85)]
        R_ = [(x + a * 1.05 * flip, sh[1] - a * 0.1 + sway)]
    elif pose == "shrug":
        L_ = [(x - a * 0.55, sh[1] + a * 0.15), (x - a * 0.85, sh[1] - a * 0.25 + sway)]
        R_ = [(x + a * 0.55, sh[1] + a * 0.15), (x + a * 0.85, sh[1] - a * 0.25 - sway)]
    elif pose == "scratch":
        L_ = [(x - a * 0.55, sh[1] + a * 0.85)]
        R_ = [(x + a * 0.55, sh[1] + a * 0.05), (x + r * 0.9, hy - r * 0.5 + abs(sway) * 2)]
    elif pose == "run":
        L_ = [(x - a * 0.7, sh[1] + a * 0.5 + step * 0.5)]
        R_ = [(x + a * 0.7, sh[1] + a * 0.2 - step * 0.5)]
    else:
        L_ = [(x - a * 0.55, sh[1] + a * 0.85)]
        R_ = [(x + a * 0.55, sh[1] + a * 0.85)]
    limb(c, [sh] + L_, lw * 0.9, alpha)
    limb(c, [sh] + R_, lw * 0.9, alpha)
    hand_R = R_[-1]
    # hair / accessories behind head
    if kind == "woman":
        c.drawCircle(x - r * 0.75 * flip, hy - r * 0.55, r * 0.45, paint(INK, fill=True, alpha=alpha))
    # head
    c.drawCircle(x, hy, r, paint(WHITE, fill=True, alpha=alpha))
    c.drawCircle(x, hy, r, paint(INK, lw * 0.55, alpha=alpha))
    # face (looks toward flip)
    ex = r * 0.28
    fx = x + r * 0.12 * flip
    for s in (-1, 1):
        c.drawCircle(fx + s * ex, hy - r * 0.12, max(2.5, r * 0.09), paint(INK, fill=True, alpha=alpha))
    m = skia.Path()
    if face == "smile":
        m.moveTo(fx - r * 0.32, hy + r * 0.25); m.quadTo(fx, hy + r * 0.55, fx + r * 0.32, hy + r * 0.25)
    elif face == "frown":
        m.moveTo(fx - r * 0.3, hy + r * 0.48); m.quadTo(fx, hy + r * 0.22, fx + r * 0.3, hy + r * 0.48)
    elif face == "o":
        c.drawCircle(fx, hy + r * 0.38, r * 0.13, paint(INK, lw * 0.35, alpha=alpha))
    else:
        m.moveTo(fx - r * 0.28, hy + r * 0.38); m.lineTo(fx + r * 0.28, hy + r * 0.38)
    c.drawPath(m, paint(INK, lw * 0.4, alpha=alpha))
    if kind == "woman":
        c.drawCircle(fx, hy - r * 0.42, max(2.5, r * 0.08), paint(RED, fill=True, alpha=alpha))   # bindi
    if kind == "man":
        hp = skia.Path()
        for k in (-0.45, -0.1, 0.25):
            hp.moveTo(x + r * k, hy - r * 0.95); hp.lineTo(x + r * (k + 0.22), hy - r * 1.35)
        c.drawPath(hp, paint(INK, lw * 0.45, alpha=alpha))
        c.drawLine(x - r * 0.4, hy + r * 0.62, x + r * 0.4, hy + r * 0.62, paint(INK, 0.1, alpha=0))
    if kind == "contractor":
        hat = skia.Path()
        hat.addArc(skia.Rect(x - r * 1.02, hy - r * 1.15, x + r * 1.02, hy + r * 0.75), 180, 180)
        hat.close()
        c.drawPath(hat, paint(HAT, fill=True, alpha=alpha))
        c.drawPath(hat, paint(INK, lw * 0.5, alpha=alpha))
        c.drawLine(x - r * 1.3, hy - r * 0.2, x + r * 1.3, hy - r * 0.2, paint(INK, lw * 0.6, alpha=alpha))
        # clipboard in the free hand
        cx, cy = L_[-1]
        rr = skia.Rect(cx - r * 0.9, cy - r * 1.1, cx + r * 0.5, cy + r * 0.6)
        c.drawRect(rr, paint(skia.Color(196, 160, 110), fill=True, alpha=alpha))
        c.drawRect(rr, paint(INK, lw * 0.4, alpha=alpha))
        for i in range(3):
            yy = rr.top() + r * 0.45 + i * r * 0.35
            c.drawLine(rr.left() + r * 0.25, yy, rr.right() - r * 0.25, yy, paint(INK, 2.5, alpha=alpha))
    return dict(head=(x, hy), r=r, hand=hand_R)


def bubble(c, x, y, w, h, tail, t0, t, text, f, color=INK, seed=0):
    s = pop(t, t0)
    if s <= 0:
        return
    dx, dy = boil(t, seed, 1.0)
    with scaled(c, tail[0], tail[1], s):
        rr = skia.RRect.MakeRectXY(skia.Rect(x - w / 2 + dx, y - h / 2 + dy, x + w / 2 + dx, y + h / 2 + dy), 34, 34)
        tp = skia.Path()
        bx = clamp(tail[0], x - w / 2 + 60, x + w / 2 - 60)
        tp.moveTo(bx - 26, y + h / 2 - 4); tp.lineTo(tail[0], tail[1]); tp.lineTo(bx + 26, y + h / 2 - 4); tp.close()
        c.drawRRect(rr, paint(WHITE, fill=True)); c.drawPath(tp, paint(WHITE, fill=True))
        c.drawRRect(rr, paint(INK, 6)); c.drawPath(tp, paint(INK, 6))
        c.drawLine(bx - 22, y + h / 2 - 3, bx + 22, y + h / 2 - 3, paint(WHITE, 9))
        draw_text(c, text, x + dx, y + dy + f.getSize() * 0.36, f, color)


def stamp(c, x, y, text, t0, t, size=86, rot=-8, color=RED):
    if t < t0:
        return
    u = clamp((t - t0) / 0.18)
    s = 1.7 - 0.7 * ease(u)
    a = ease(u)
    f = font(TF_B, size)
    w = text_w(text, f) + size * 0.9
    h = size * 1.45
    with scaled(c, x, y, s, rot):
        rr = skia.RRect.MakeRectXY(skia.Rect(x - w / 2, y - h / 2, x + w / 2, y + h / 2), 14, 14)
        c.drawRRect(rr, paint(color, 9, alpha=a))
        rr2 = skia.RRect.MakeRectXY(skia.Rect(x - w / 2 + 12, y - h / 2 + 12, x + w / 2 - 12, y + h / 2 - 12), 8, 8)
        c.drawRRect(rr2, paint(color, 3, alpha=a))
        draw_text(c, text, x, y + size * 0.36, f, color, alpha=a)


# ---------------------------------------------------------------- props
def house(c, x, y, s, t, t0, seed):
    frac = ease((t - t0) / 1.4)
    if frac <= 0:
        return
    dx, dy = boil(t, seed, 1.3)
    p = skia.Path()
    w, h = 300 * s, 210 * s
    x0, y0 = x - w / 2 + dx, y + dy
    p.moveTo(x0, y0 + h); p.lineTo(x0, y0); p.lineTo(x0 + w / 2, y0 - h * 0.62); p.lineTo(x0 + w, y0); p.lineTo(x0 + w, y0 + h); p.close()
    p.moveTo(x0 + w * 0.42, y0 + h); p.lineTo(x0 + w * 0.42, y0 + h * 0.5); p.lineTo(x0 + w * 0.6, y0 + h * 0.5); p.lineTo(x0 + w * 0.6, y0 + h)
    p.addRect(skia.Rect(x0 + w * 0.12, y0 + h * 0.25, x0 + w * 0.3, y0 + h * 0.48))
    p.addRect(skia.Rect(x0 + w * 0.72, y0 + h * 0.25, x0 + w * 0.9, y0 + h * 0.48))
    if frac >= 1:
        c.drawPath(p, paint(WHITE, fill=True))
    c.drawPath(trim_path(p, frac), paint(INK, 7))


def tank(c, x, y, t, level, label_val, red, drips_from, seed):
    """LEAK METER: an overhead water tank whose water is the budget."""
    dx, dy = boil(t, seed, 1.0)
    x += dx; y += dy
    w, h = 430, 330
    # stand
    for lx in (x - w * 0.36, x + w * 0.36):
        c.drawLine(lx, y + h / 2, lx - (8 if lx < x else -8), y + h / 2 + 170, paint(INK, 10))
    c.drawLine(x - w * 0.42, y + h / 2 + 95, x + w * 0.42, y + h / 2 + 95, paint(INK, 7))
    body = skia.RRect.MakeRectXY(skia.Rect(x - w / 2, y - h / 2, x + w / 2, y + h / 2), 30, 30)
    c.drawRRect(body, paint(WHITE, fill=True))
    # water
    c.save()
    c.clipRRect(body, doAntiAlias=True)
    top = y + h / 2 - h * level
    wave = skia.Path()
    wave.moveTo(x - w / 2, y + h / 2 + 5)
    for i in range(0, 41):
        xx = x - w / 2 + w * i / 40
        wave.lineTo(xx, top + math.sin(i * 0.6 + t * 4) * 5)
    wave.lineTo(x + w / 2, y + h / 2 + 5); wave.close()
    c.drawPath(wave, paint(BLUE, fill=True, alpha=0.82))
    c.restore()
    c.drawRRect(body, paint(INK, 8))
    c.drawLine(x - w * 0.3, y - h / 2 - 22, x + w * 0.3, y - h / 2 - 22, paint(INK, 9))   # lid
    # label plate
    f = font(TF_B, 62)
    s = label_val
    pw = text_w(s, f) + 50
    plate = skia.RRect.MakeRectXY(skia.Rect(x - pw / 2, y - 48, x + pw / 2, y + 48), 14, 14)
    c.drawRRect(plate, paint(WHITE, fill=True))
    c.drawRRect(plate, paint(RED if red else INK, 6))
    draw_text(c, s, x, y + 22, f, RED if red else INK)
    draw_text(c, "LEAK METER", x, y - h / 2 - 48, font(TF_B, 34), RED)
    # leaks: drips from cracks at the bottom
    if t > drips_from:
        for k, cx in enumerate((x - w * 0.18, x + w * 0.22)):
            c.drawLine(cx - 10, y + h / 2 - 2, cx + 6, y + h / 2 - 16, paint(INK, 4))
            for j in range(3):
                ph = ((t - drips_from) * 1.4 + j / 3 + k * 0.17) % 1.0
                dyy = y + h / 2 + 12 + ph * ph * 200
                drop(c, cx, dyy, 13, alpha=1 - ph * 0.6)


def drop(c, x, y, r, color=BLUE, alpha=1.0, outline=True):
    p = skia.Path()
    p.moveTo(x, y - r * 2.1)
    p.cubicTo(x + r * 0.4, y - r * 1.2, x + r, y - r * 0.6, x + r, y)
    p.arcTo(skia.Rect(x - r, y - r, x + r, y + r), 0, 180, False)
    p.cubicTo(x - r, y - r * 0.6, x - r * 0.4, y - r * 1.2, x, y - r * 2.1)
    p.close()
    c.drawPath(p, paint(color, fill=True, alpha=alpha))
    if outline:
        c.drawPath(p, paint(INK, max(2.5, r * 0.22), alpha=alpha))


def calendar(c, x, y, s, t, t0, seed):
    sc = pop(t, t0)
    if sc <= 0:
        return
    dx, dy = boil(t, seed, 1.0)
    with scaled(c, x, y, sc * s):
        x += dx; y += dy
        rr = skia.RRect.MakeRectXY(skia.Rect(x - 120, y - 120, x + 120, y + 130), 18, 18)
        c.drawRRect(rr, paint(WHITE, fill=True))
        c.save(); c.clipRRect(rr, doAntiAlias=True)
        c.drawRect(skia.Rect(x - 120, y - 120, x + 120, y - 55), paint(RED, fill=True))
        c.restore()
        c.drawRRect(rr, paint(INK, 7))
        for rx in (x - 60, x + 60):
            c.drawLine(rx, y - 140, rx, y - 100, paint(INK, 9))
        draw_text(c, "18", x, y + 55, font(TF_B, 118), INK)
        draw_text(c, "MONTHS", x, y + 108, font(TF_B, 34), INK)


def magnifier(c, x, y, r, t, t0, seed):
    sc = pop(t, t0)
    if sc <= 0:
        return
    dx, dy = boil(t, seed, 1.0)
    with scaled(c, x, y, sc):
        x += dx; y += dy
        c.drawCircle(x, y, r, paint(WHITE, fill=True, alpha=0.55))
        c.drawCircle(x, y, r, paint(INK, 10))
        c.drawLine(x + r * 0.72, y + r * 0.72, x + r * 1.5, y + r * 1.5, paint(INK, 22))
        c.drawLine(x - r * 0.45, y - r * 0.35, x - r * 0.2, y - r * 0.6, paint(WHITE, 8))


def coin(c, x, y, r, t, t0, seed, mark="₹"):
    sc = pop(t, t0)
    if sc <= 0:
        return
    dx, dy = boil(t, seed, 1.2)
    with scaled(c, x, y, sc):
        x += dx; y += dy + math.sin(t * 3 + seed) * 6
        c.drawCircle(x, y, r, paint(HAT, fill=True))
        c.drawCircle(x, y, r, paint(INK, 6))
        c.drawCircle(x, y, r * 0.75, paint(INK, 3, alpha=0.5))
        draw_text(c, mark, x, y + r * 0.36, font(TF_B, r * 1.0), INK)


def pipe(c, y, x0, x1, t, seed):
    dx, dy = boil(t, seed, 0.9)
    y += dy
    c.drawRect(skia.Rect(x0, y - 26, x1, y + 26), paint(WHITE, fill=True))
    c.drawLine(x0, y - 26, x1, y - 26, paint(INK, 7))
    c.drawLine(x0, y + 26, x1, y + 26, paint(INK, 7))
    for jx in np.linspace(x0, x1, 5):
        rr = skia.Rect(jx - 18, y - 36, jx + 18, y + 36)
        c.drawRect(rr, paint(WHITE, fill=True)); c.drawRect(rr, paint(INK, 6))


def bag(c, x, y, s, label, t, seed, alpha=1.0):
    dx, dy = boil(t, seed, 1.0)
    x += dx; y += dy
    p = skia.Path()
    p.moveTo(x - 90 * s, y - 100 * s); p.lineTo(x + 90 * s, y - 100 * s)
    p.lineTo(x + 105 * s, y + 100 * s); p.lineTo(x - 105 * s, y + 100 * s); p.close()
    c.drawPath(p, paint(skia.Color(214, 208, 196), fill=True, alpha=alpha))
    c.drawPath(p, paint(INK, 7, alpha=alpha))
    draw_text(c, label, x, y + 14 * s, font(TF_B, 40 * s), INK, alpha=alpha)
    draw_text(c, "50 KG", x, y + 60 * s, font(TF_M, 26 * s), INK, alpha=alpha)


def bars(c, x, y, s, t, seed, alpha=1.0):
    dx, dy = boil(t, seed, 1.0)
    x += dx; y += dy
    for i in range(3):
        yy = y - 50 * s + i * 50 * s
        c.drawLine(x - 130 * s, yy + 25 * s, x + 130 * s, yy - 25 * s, paint(INK, 22 * s, alpha=alpha))
        c.drawLine(x - 130 * s, yy + 25 * s, x + 130 * s, yy - 25 * s, paint(skia.Color(150, 150, 156), 12 * s, alpha=alpha))
    draw_text(c, "STEEL", x, y + 120 * s, font(TF_B, 40 * s), INK, alpha=alpha)


def cross(c, x, y, r, t, t0):
    u = ease((t - t0) / 0.22)
    if u <= 0:
        return
    pp = paint(RED, 16)
    c.drawLine(x - r, y - r, x - r + 2 * r * u, y - r + 2 * r * u, pp)
    u2 = ease((t - t0 - 0.12) / 0.22)
    if u2 > 0:
        c.drawLine(x + r, y - r, x + r - 2 * r * u2, y - r + 2 * r * u2, pp)


def document(c, x, y, s, t, seed, glow=0.0):
    dx, dy = boil(t, seed, 1.0)
    x += dx; y += dy
    w, h = 220 * s, 280 * s
    if glow > 0:
        c.drawCircle(x, y, 230 * s, paint(RED, fill=True, alpha=0.12 * glow))
    p = skia.Path()
    p.moveTo(x - w / 2, y - h / 2); p.lineTo(x + w / 2 - 50 * s, y - h / 2); p.lineTo(x + w / 2, y - h / 2 + 50 * s)
    p.lineTo(x + w / 2, y + h / 2); p.lineTo(x - w / 2, y + h / 2); p.close()
    c.drawPath(p, paint(WHITE, fill=True)); c.drawPath(p, paint(INK, 7))
    c.drawLine(x + w / 2 - 50 * s, y - h / 2, x + w / 2 - 50 * s, y - h / 2 + 50 * s, paint(INK, 5))
    c.drawLine(x + w / 2 - 50 * s, y - h / 2 + 50 * s, x + w / 2, y - h / 2 + 50 * s, paint(INK, 5))
    for i in range(5):
        yy = y - h / 2 + 90 * s + i * 30 * s
        c.drawLine(x - w / 2 + 30 * s, yy, x + w / 2 - (30 + (i % 2) * 40) * s, yy, paint(INK, 5))
    c.drawCircle(x + w / 2 - 55 * s, y + h / 2 - 50 * s, 30 * s, paint(RED, 6))
    draw_text(c, "KHATA", x - 20 * s, y - h / 2 + 62 * s, font(TF_B, 30 * s), INK)


def bank(c, x, y, s, t, seed):
    dx, dy = boil(t, seed, 1.0)
    x += dx; y += dy
    p = skia.Path()
    p.moveTo(x - 170 * s, y - 70 * s); p.lineTo(x, y - 160 * s); p.lineTo(x + 170 * s, y - 70 * s); p.close()
    c.drawPath(p, paint(WHITE, fill=True)); c.drawPath(p, paint(INK, 7))
    draw_text(c, "BANK", x, y - 88 * s, font(TF_B, 36 * s), INK)
    for i in range(4):
        cx = x - 120 * s + i * 80 * s
        rr = skia.Rect(cx - 16 * s, y - 60 * s, cx + 16 * s, y + 90 * s)
        c.drawRect(rr, paint(WHITE, fill=True)); c.drawRect(rr, paint(INK, 6))
    base = skia.Rect(x - 185 * s, y + 90 * s, x + 185 * s, y + 120 * s)
    c.drawRect(base, paint(WHITE, fill=True)); c.drawRect(base, paint(INK, 7))


def lock(c, x, y, s, t, t0):
    sc = pop(t, t0)
    if sc <= 0:
        return
    with scaled(c, x, y, sc * s):
        sh = skia.Path(); sh.addArc(skia.Rect(x - 52, y - 120, x + 52, y - 10), 180, 180)
        c.drawPath(sh, paint(INK, 18))
        body = skia.RRect.MakeRectXY(skia.Rect(x - 80, y - 60, x + 80, y + 70), 16, 16)
        c.drawRRect(body, paint(RED, fill=True)); c.drawRRect(body, paint(INK, 7))
        c.drawCircle(x, y, 14, paint(INK, fill=True))
        c.drawLine(x, y, x, y + 34, paint(INK, 10))


def sticky(c, x, y, t, t0, lines, seed):
    sc = pop(t, t0)
    if sc <= 0:
        return
    dx, dy = boil(t, seed, 1.0)
    with scaled(c, x, y, sc, 4):
        rr = skia.Rect(x - 230 + dx, y - 150 + dy, x + 230 + dx, y + 150 + dy)
        c.drawRect(rr.makeOffset(10, 12), paint(INK, fill=True, alpha=0.18))
        c.drawRect(rr, paint(NOTE, fill=True)); c.drawRect(rr, paint(INK, 5))
        c.drawRect(skia.Rect(x - 80, y - 170, x + 80, y - 135), paint(WHITE, fill=True, alpha=0.7))
        for i, ln in enumerate(lines):
            draw_text(c, ln, x + dx, y - 50 + dy + i * 82, font(TF_B, 54 if i == 0 else 40), RED if i == 0 else INK)


def scribble_underline(c, x0, x1, y, t, t0, color=RED):
    u = ease((t - t0) / 0.5)
    if u <= 0:
        return
    p = skia.Path()
    p.moveTo(x0, y)
    n = 6
    for i in range(1, n + 1):
        xx = x0 + (x1 - x0) * i / n
        p.quadTo(xx - (x1 - x0) / n / 2, y + (10 if i % 2 else -6), xx, y + (4 if i % 2 else -2))
    c.drawPath(trim_path(p, u), paint(color, 12))


def big_line(c, x, y, parts, size, t, t0, seed=0, align="c"):
    """A line of bold text whose parts can be red; pops in at t0."""
    s = pop(t, t0)
    if s <= 0:
        return 0
    f = font(TF_B, size)
    w = sum(text_w(p, f) for p, _ in parts)
    dx, dy = boil(t, seed, 0.8)
    x0 = x - w / 2 if align == "c" else x
    with scaled(c, x, y - size * 0.35, s):
        xx = x0 + dx
        for p, red in parts:
            xx += draw_text(c, p, xx, y + dy, f, RED if red else INK, align="l")
    return w


def tag(c, x, y, text, t, t0):
    a = fade(t, t0)
    if a <= 0:
        return
    f = font(TF_B, 30)
    w = text_w(text, f) + 40
    rr = skia.RRect.MakeRectXY(skia.Rect(x, y - 30, x + w, y + 22), 8, 8)
    c.drawRRect(rr, paint(RED, fill=True, alpha=a))
    draw_text(c, text, x + 20, y + 4, f, WHITE, align="l", alpha=a)


# ---------------------------------------------------------------- background
def make_paper(W, H):
    rng = np.random.default_rng(7)
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.array([234, 219, 186], np.float32)
    # low-frequency mottling
    small = rng.normal(0, 1, (H // 60 + 2, W // 60 + 2)).astype(np.float32)
    from PIL import Image
    mott = np.array(Image.fromarray(small).resize((W, H), Image.BICUBIC))
    grain = rng.normal(0, 1, (H, W)).astype(np.float32)
    img = base[None, None, :] + mott[..., None] * 7 + grain[..., None] * 4
    # stains
    for _ in range(7):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(W * 0.05, W * 0.16)
        d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r
        ring = np.exp(-((d - 1) ** 2) / 0.004) * 10 + np.exp(-d ** 2 * 1.5) * 6
        img -= ring[..., None] * np.array([0.6, 0.9, 1.4], np.float32)
    # fold creases
    for fx in (W * 0.333, W * 0.667):
        d = np.abs(x - fx + (y - H / 2) * 0.004)
        img -= (np.exp(-d ** 2 / (W * 0.0012) ** 2) * 9)[..., None]
        img += (np.exp(-(d - W * 0.002) ** 2 / (W * 0.0012) ** 2) * 5)[..., None]
    # vignette
    v = ((x / W - 0.5) ** 2 + (y / H - 0.5) ** 2 * 0.8)
    img *= (1 - np.clip(v * 0.9, 0, 0.45))[..., None]
    img = np.clip(img, 0, 255).astype(np.uint8)
    rgba = np.dstack([img, np.full((H, W), 255, np.uint8)])
    return skia.Image.fromarray(rgba, colorType=skia.ColorType.kRGBA_8888_ColorType)


# ---------------------------------------------------------------- captions
def captions(c, t):
    vt = t - LEAD
    for a, b, txt in CAPS:
        if a - 0.05 <= vt <= b + 0.35:
            al = clamp((vt - a + 0.05) / 0.12) * (1 - clamp((vt - b - 0.2) / 0.15))
            parts, red = [], False
            for i, chunk in enumerate(txt.split("*")):
                if chunk:
                    parts.append((chunk, i % 2 == 1))
            f = font(TF_B, 50)
            # wrap into at most 2 lines
            words = []
            for p, r_ in parts:
                for w_ in p.split(" "):
                    if not w_:
                        continue
                    if words and all(ch in ".,?:!" for ch in w_) and not p.startswith(" "):
                        words[-1] = (words[-1][0] + w_, words[-1][1]); continue
                    words.append((w_, r_))
            lines, cur = [], []
            for wd in words:
                trial = cur + [wd]
                if text_w(" ".join(x for x, _ in trial), f) > 1500 and cur:
                    lines.append(cur); cur = [wd]
                else:
                    cur = trial
            lines.append(cur)
            y0 = 975 - (len(lines) - 1) * 62
            for li, ln in enumerate(lines):
                full = " ".join(x for x, _ in ln)
                w = text_w(full, f)
                yy = y0 + li * 62
                rr = skia.RRect.MakeRectXY(skia.Rect(960 - w / 2 - 26, yy - 50, 960 + w / 2 + 26, yy + 16), 12, 12)
                c.drawRRect(rr, paint(WHITE, fill=True, alpha=0.88 * al))
                xx = 960 - w / 2
                for wd, r_ in ln:
                    xx += draw_text(c, wd + " ", xx, yy, f, RED if r_ else INK, align="l", alpha=al)
            break


# ---------------------------------------------------------------- the film
def scene(c, t):
    S = lambda i: L[i] <= t < (L[i + 1] if i + 1 < len(L) else 1e9)

    if S(0) or t < L[0]:                                   # family asks the contractor
        tag(c, 70, 90, "ILLUSTRATIVE EXAMPLE", t, LEAD - 0.4)
        house(c, 960, 330, 1.05, t, LEAD + 0.1, 3)
        figure(c, 330, 790, 400, t, 11, pose="ask" if t > B["q"] else "idle", kind="man", flip=1)
        figure(c, 490, 790, 375, t, 12, pose="idle", kind="woman", flip=1)
        figure(c, 625, 790, 240, t, 13, pose="idle", kind="kid", flip=1)
        figure(c, 1520, 790, 410, t, 14, pose="idle", kind="contractor", flip=-1)
        bubble(c, 520, 230, 560, 120, (420, 400), B["q"], t, "Kitne ka banega?", font(TF_B, 52), seed=5)
        big_line(c, 1520, 330, [("CONTRACTOR", False)], 40, t, T(1.9), seed=4)

    elif S(1):                                            # "25 lakh"
        figure(c, 640, 800, 420, t, 14, pose="ask" if t > B["lakh25"] else "idle", kind="contractor", flip=1)
        bubble(c, 1230, 330, 760, 230, (840, 520), B["lakh25"], t, "₹25,00,000", font(TF_B, 120), seed=6)
        if t > B["lakh25"] + 0.5:
            draw_text(c, "sab kuch included?", 1250, 540, font(TF_H, 64), RED, alpha=fade(t, B["lakh25"] + 0.5))

    elif S(2):                                            # 18 months later, 30 lakh
        calendar(c, 330, 380, 1.0, t, L[2] + 0.05, 21)
        u = ease((t - (L[2] + 1.3)) / 2.0)
        val = 2500000 + int(500000 * u / 10000) * 10000
        lv = 0.55 + 0.33 * u
        tank(c, 1000, 380, t, lv, "₹" + inr(val), u > 0.98, L[2] + 1.3, 22)
        figure(c, 1560, 790, 300, t, 11, pose="scratch" if u > 0.5 else "idle", face="o" if u > 0.5 else "flat", kind="man", flip=-1)
        figure(c, 1700, 790, 280, t, 12, pose="idle", face="frown" if u > 0.5 else "flat", kind="woman", flip=-1)
        if u > 0.98:
            big_line(c, 1000, 160, [("+ ₹5 LAKH", True)], 64, t, L[2] + 3.35, seed=9)

    elif S(3):                                            # nobody lied, nobody ran
        house(c, 960, 300, 0.95, t, L[3] - 5, 3)
        figure(c, 420, 760, 320, t, 11, pose="shrug", face="o", kind="man", flip=1)
        figure(c, 560, 760, 300, t, 12, pose="idle", face="flat", kind="woman", flip=1)
        figure(c, 1450, 760, 330, t, 14, pose="idle", kind="contractor", flip=-1)
        stamp(c, 960, 640, "NOBODY LIED", B["nobody"], t, size=80)
        if t > B["ran"]:
            u = (t - B["ran"])
            rx = 1560 + u * 30
            figure(c, rx, 300, 170, t, 31, pose="run", face="smile", kind="kid", flip=1, alpha=0.75)
            coin(c, rx + 70, 190, 32, t, B["ran"], 32)
            c.drawCircle(rx + 20, 220, 150, paint(RED, 14, alpha=fade(t, B["ran"] + 0.4)))
            if t > B["ran"] + 0.55:
                c.drawLine(rx - 86, 114, rx + 126, 326, paint(RED, 14))

    elif S(4):                                            # where did 5 lakh go?
        big_line(c, 960, 360, [("₹5 LAKH", True)], 210, t, L[4] + 0.05, seed=41)
        big_line(c, 960, 480, [("GAYE KAHAAN?", False)], 74, t, L[4] + 0.6, seed=42)
        figure(c, 400, 830, 300, t, 11, pose="scratch", face="o", kind="man", flip=1)
        for k, (cx, cy) in enumerate(((1380, 650), (1540, 560), (1620, 720), (300, 300))):
            coin(c, cx, cy, 46, t, L[4] + 0.3 + k * 0.15, 50 + k, mark="?")

    elif S(5):                                            # find every rupee; 7 leaks
        mx = 700 + 600 * ease((t - L[5]) / 1.6)
        if t < B["total7"]:
            magnifier(c, mx, 420, 120, t, L[5] + 0.05, 61)
            for k in range(6):
                coin(c, 520 + k * 190, 520 + (k % 2) * 70, 40, t, L[5] + 0.2 + k * 0.12, 70 + k)
        else:
            leaks_row(c, t, n_glow=None)
            big_line(c, 960, 220, [("7 ", True), ("LEAKS", False)], 120, t, B["total7"], seed=63)

    elif S(6):                                            # leak 7 is paper; it can stop the loan
        leaks_row(c, t, n_glow=7, dim=True, y=150)
        if t < B["paper"]:
            bag(c, 700, 530, 1.0, "CEMENT", t, 81)
            bars(c, 1220, 530, 1.0, t, 82)
            cross(c, 700, 530, 120, t, B["notcem"] + 0.2)
            cross(c, 1220, 530, 120, t, B["notcem"] + 0.6)
        else:
            g = fade(t, B["paper"])
            document(c, 640, 530, 1.0, t, 83, glow=g)
            big_line(c, 640, 760, [("LEAK #7: ", False), ("PAPER", True)], 52, t, B["paper"] + 0.15, seed=84)
            if t > B["loan"]:
                bank(c, 1260, 540, 1.0, t, 85)
                lock(c, 1260, 580, 0.9, t, B["loan"] + 0.7)
                big_line(c, 1260, 760, [("LOAN ", False), ("BLOCKED", True)], 52, t, B["loan"] + 0.9, seed=86)

    else:                                                 # title + promise of 6 questions
        big_line(c, 960, 300, [("THE ", False), ("₹5 LAKH", True)], 150, t, L[7] + 0.05, seed=91)
        big_line(c, 960, 430, [("NOBODY TOLD YOU ABOUT", False)], 84, t, L[7] + 0.45, seed=92)
        scribble_underline(c, 760, 1340, 338, t, L[7] + 0.5)
        sticky(c, 1480, 690, t, B["six"], ["6 QUESTIONS", "that plug", "every leak"], 93)
        figure(c, 420, 840, 300, t, 11, pose="point", face="smile", kind="man", flip=1)
        figure(c, 560, 840, 280, t, 12, pose="idle", face="smile", kind="woman", flip=1)
        figure(c, 680, 840, 190, t, 13, pose="idle", face="smile", kind="kid", flip=1)
        draw_text(c, "buynbuild.blog", 1840, 1040, font(TF_M, 30), INK, align="r", alpha=fade(t, L[7] + 1.0))


def leaks_row(c, t, n_glow=None, dim=False, y=470):
    pipe(c, y, 120, 1800, t, 71)
    oy = y - 470
    xs = np.linspace(260, 1660, 7)
    t0 = B["total7"]
    for i, x in enumerate(xs, 1):
        tp = t0 + 0.1 + (i - 1) * 0.12
        if t < tp:
            continue
        s = pop(t, tp, 0.25)
        glow = (n_glow == i)
        a = 0.35 if (dim and not glow) else 1.0
        ph = ((t - tp) * 0.9 + i * 0.13) % 1.0
        with scaled(c, x, 560 + oy, s):
            drop(c, x, 540 + oy + ph * 40, 30 if glow else 24, color=RED if glow else BLUE, alpha=a)
            draw_text(c, str(i), x, 650 + oy, font(TF_B, 54 if glow else 40), RED if glow else INK, alpha=a)
        if glow:
            c.drawCircle(x, 560 + oy, 85 + 6 * math.sin(t * 6), paint(RED, 6, alpha=0.8))


def inr(v):
    s = str(int(v))
    if len(s) <= 3:
        return s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:]); head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts) + "," + tail


def build_sfx_list():
    SFX.clear()
    for i, t in enumerate(L[1:], 1):
        sfx(t, "rustle")                                  # every cut is a paper turn
    sfx(B["q"], "pop"); sfx(T(1.9), "pop")
    sfx(B["lakh25"], "pop")
    sfx(L[2] + 0.05, "pop"); sfx(L[2] + 1.3, "drip"); sfx(L[2] + 3.35, "pop")
    sfx(B["nobody"], "thump"); sfx(B["ran"] + 0.4, "scratch")
    sfx(L[4] + 0.05, "pop"); sfx(L[4] + 0.6, "pop")
    for k in range(3):
        sfx(L[4] + 0.3 + k * 0.15, "pop")
    sfx(L[5] + 0.05, "pop")
    for k in range(7):
        sfx(B["total7"] + 0.1 + k * 0.12, "tick")
    sfx(B["notcem"] + 0.2, "scratch"); sfx(B["notcem"] + 0.6, "scratch")
    sfx(B["paper"], "pop"); sfx(B["loan"], "pop"); sfx(B["loan"] + 0.7, "thump")
    sfx(L[7] + 0.05, "pop"); sfx(L[7] + 0.45, "pop"); sfx(B["six"], "pop")


def frame(surface, W, H, paper, t):
    with surface as c:
        c.clear(skia.Color(234, 219, 186))
        c.drawImage(paper, 0, 0)
        c.save()
        k = W / 1920
        # slow breathing push so the still frames never feel frozen
        z = 1.0 + 0.012 * math.sin(t * 0.5)
        c.scale(k, k)
        c.translate(960, 540); c.scale(z, z); c.translate(-960, -540)
        scene(c, t)
        c.restore()
        c.save(); c.scale(k, k)
        captions(c, t)
        # fade in/out
        a = 1 - min(clamp(t / 0.4), clamp((DUR - t) / 0.8))
        if a > 0:
            c.drawRect(skia.Rect(0, 0, 1920, 1080), paint(skia.Color(20, 18, 16), fill=True, alpha=a))
        c.restore()
    return surface.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--size", default="2560x1440")
    ap.add_argument("--still", type=float, nargs="*")
    ap.add_argument("--out", default="out/demo_video.mp4")
    a = ap.parse_args()
    W, H = map(int, a.size.split("x"))
    paper = make_paper(W, H)
    surface = skia.Surface(W, H)
    build_sfx_list()
    if a.still:
        from PIL import Image
        for s in a.still:
            Image.fromarray(frame(surface, W, H, paper, s)).save(HERE / f"out/still_{s:05.2f}.png")
        return
    n = int(DUR * FPS)
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", str(HERE / a.out)],
                         stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(frame(surface, W, H, paper, i / FPS).tobytes())
        if i % 150 == 0:
            print(f"{i}/{n}", flush=True)
    p.stdin.close(); p.wait()
    import json
    (HERE / "out/sfx.json").write_text(json.dumps({"dur": DUR, "lead": LEAD, "events": SFX}))
    print("wrote", a.out)


if __name__ == "__main__":
    main()
