"""STYLE 06 - Local map explainer (Lemo map-explainer grammar on a hand-drawn schematic, since no boundary data).

A 2.5D camera (true perspective homography) over a schematic Hubballi-Dharwad twin-city sheet: warm dusk
ground, the corridor as the one glowing amber data line, a teal nala, screen-space grotesk labels.
Illustrative map, not to scale: no flood zones, no layout names, no prices, no approval facts.

  python map06.py --probe 0.4,1.8,3.6,4.3,5.6,8.5      -> stills/
  python map06.py --out out/video_noaudio.mp4
"""
import argparse, json, math, pathlib, subprocess, sys
import numpy as np
import skia
from PIL import Image, ImageDraw, ImageFilter

HERE = pathlib.Path(__file__).resolve().parent
FD = HERE.parent / "fonts"
W, H, FPS = 1080, 1920, 30
H0 = 790                      # screen y of the camera target (centre of the 230-1340 safe band)
FOC = 1400.0
TIM = json.loads((HERE / "timing.json").read_text())
DUR = TIM["total"]


def wt(li, word):
    for w in TIM["lines"][li]["words"]:
        if w["w"].lower().strip(",.?").startswith(word):
            return w["s"]
    raise KeyError(word)


def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ramp(t, t0, d): return clamp((t - t0) / d) if d > 0 else float(t >= t0)
def eo3(x): return 1 - (1 - x) ** 3
def eio(x): return x * x * (3 - 2 * x)
def eback(x, s=1.7):
    x -= 1; return 1 + x * x * ((s + 1) * x + s)


# ------------------------------------------------------------------ palette (map-explainer: amber = data)
LAND = (92, 78, 60)
CITY = (150, 136, 114)
CITY_EDGE = (190, 176, 150)
AMBER = (255, 166, 61); AMBER_CORE = (255, 214, 150)
TEAL = (47, 163, 176); TEAL_PALE = (143, 214, 222)
WARMW = (246, 238, 224)
INKD = (24, 20, 16)

# ------------------------------------------------------------------ geography (schematic units; north = -y)
DHARWAD = (-560, -430); HUBBALLI = (600, 420)
PLOT = (220, -115)
CORRIDOR = [(-1300, -930), (-560, -430), (-300, -250), (0, -50), (300, 150), (600, 420), (1350, 900)]
NALA = [(1000, -760), (700, -450), (470, -160), (420, 40), (300, 330), (80, 700), (-250, 1150)]
JUNCTION = (205, 85)
DRAIN_TO = (445, -70)


def blob(cx, cy, r, seed, n=60):
    rng = np.random.default_rng(seed)
    ph = rng.uniform(0, 6.28, 4); amp = [0.10, 0.07, 0.05, 0.03]
    p = skia.Path()
    for i in range(n + 1):
        a = 2 * math.pi * i / n
        k = 1 + sum(amp[j] * math.sin((j + 2) * a + ph[j]) for j in range(4))
        x, y = cx + r * k * math.cos(a) * 1.15, cy + r * k * math.sin(a) * 0.9
        (p.moveTo if i == 0 else p.lineTo)(x, y)
    p.close()
    return p


def smooth_path(pts):
    p = skia.Path(); p.moveTo(*pts[0])
    for i in range(1, len(pts) - 1):
        mx, my = (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2
        p.quadTo(pts[i][0], pts[i][1], mx, my)
    p.lineTo(*pts[-1])
    return p


def partial(path, u):
    if u >= 1: return path
    pm = skia.PathMeasure(path, False); out = skia.Path()
    pm.getSegment(0, pm.getLength() * clamp(u), out, True)
    return out


def paint(rgb, a=1.0, stroke=None, blur=None, cap=True):
    p = skia.Paint(AntiAlias=True, Color=skia.Color(int(rgb[0]), int(rgb[1]), int(rgb[2]), int(255 * clamp(a))))
    if stroke is not None:
        p.setStyle(skia.Paint.kStroke_Style); p.setStrokeWidth(stroke)
        if cap: p.setStrokeCap(skia.Paint.kRound_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur: p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


def font(name, size):
    f = skia.Font(skia.Typeface.MakeFromFile(str(name)), size)
    f.setSubpixel(True); f.setEdging(skia.Font.Edging.kAntiAlias)
    return f


F_CITY = FD / "BarlowCondensed-SemiBold.ttf"
F_MED = FD / "BarlowCondensed-Medium.ttf"
F_BOLD = FD / "BarlowCondensed-Bold.ttf"
F_INTER = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_INTERM = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
_fc = {}
def F(name, size):
    k = (str(name), size)
    if k not in _fc: _fc[k] = font(name, size)
    return _fc[k]


def text(c, s, x, y, fname, size, rgb, a=1.0, track=0.0, align="left"):
    f = F(fname, size); ws = f.getWidths(f.textToGlyphs(s)); tr = track * size
    tot = sum(ws) + tr * (len(s) - 1)
    x0 = x - tot / 2 if align == "center" else x - tot if align == "right" else x
    p = paint(rgb, a); cx = x0
    for ch, w in zip(s, ws):
        c.drawString(ch, cx, y, f, p); cx += w + tr
    return tot


def twidth(s, fname, size, track=0.0):
    f = F(fname, size); return sum(f.getWidths(f.textToGlyphs(s))) + track * size * (len(s) - 1)


# ------------------------------------------------------------------ ground texture (generic dry plateau fields)
EXT = (-2200, -2200, 2200, 1500)
def ground_image():
    cache = HERE / "_ground.png"
    if not cache.exists():
        x0, y0, x1, y1 = EXT; S = 1.0           # 1 unit per px
        w, h = int((x1 - x0) / S), int((y1 - y0) / S)
        rng = np.random.default_rng(6)
        im = Image.new("RGB", (w, h), LAND); d = ImageDraw.Draw(im)
        # field patchwork: rotated quads with small tone shifts, darker bunds between
        for _ in range(5200):
            cx, cy = rng.uniform(0, w), rng.uniform(0, h); fw, fh = rng.uniform(40, 130), rng.uniform(30, 110)
            a = math.radians(rng.normal(-28, 10)); k = rng.uniform(-0.09, 0.07); tone = tuple(int(v * (1 + k)) for v in LAND)
            pts = [(cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a))
                   for dx, dy in ((-fw / 2, -fh / 2), (fw / 2, -fh / 2), (fw / 2, fh / 2), (-fw / 2, fh / 2))]
            d.polygon(pts, fill=tone, outline=tuple(int(v * 0.86) for v in LAND))
        im = im.filter(ImageFilter.GaussianBlur(0.8))
        # low-frequency mottling
        n = rng.standard_normal((h // 64 + 2, w // 64 + 2)).astype(np.float32)
        n = np.asarray(Image.fromarray(((n * 0.5 + 0.5).clip(0, 1) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255 - 0.5
        arr = np.asarray(im, np.float32) * (1 + 0.16 * n[..., None])
        arr += rng.normal(0, 3, arr.shape[:2])[..., None]
        Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(cache)
    arr = np.asarray(Image.open(cache).convert("RGBA"))
    return skia.Image.fromarray(np.ascontiguousarray(arr), colorType=skia.ColorType.kRGBA_8888_ColorType).withDefaultMipmaps()


# ------------------------------------------------------------------ camera
T_PLOT = wt(0, "plot"); T_HUB = wt(0, "hubballi")
T_ROAD = wt(1, "road"); T_DRAIN = wt(1, "drain"); T_APPR = wt(1, "approvals"); T_BEFORE = wt(1, "before")
L2_END = TIM["lines"][1]["end"]
# (t, tx, ty, px-per-unit, tilt deg, heading deg)
KEYS = [(0.0, 20, -20, 0.50, 18, -6), (1.3, 40, -40, 0.53, 21, -5), (T_HUB + 0.6, 90, -60, 0.58, 25, -2),
        (T_ROAD - 0.25, 255, -40, 1.45, 36, 8), (T_APPR + 0.2, 275, -40, 1.5, 38, 10),
        (L2_END + 0.35, 140, -20, 0.62, 26, 2), (DUR, 120, -20, 0.58, 24, 0)]


def catmull(t, idx, log=False):
    ts = [k[0] for k in KEYS]; vs = [math.log(k[idx]) if log else k[idx] for k in KEYS]
    if t <= ts[0]: v = vs[0]
    elif t >= ts[-1]: v = vs[-1]
    else:
        i = max(j for j in range(len(ts) - 1) if ts[j] <= t)
        u = (t - ts[i]) / (ts[i + 1] - ts[i]); u = eio(u) * 0.75 + u * 0.25
        p0 = vs[max(0, i - 1)]; p1, p2 = vs[i], vs[i + 1]; p3 = vs[min(len(vs) - 1, i + 2)]
        # monotone-ish: clamp tangents
        m1 = (p2 - p0) / 2 * 0.6; m2 = (p3 - p1) / 2 * 0.6
        h00 = 2 * u ** 3 - 3 * u ** 2 + 1; h10 = u ** 3 - 2 * u ** 2 + u; h01 = -2 * u ** 3 + 3 * u ** 2; h11 = u ** 3 - u ** 2
        v = h00 * p1 + h10 * m1 + h01 * p2 + h11 * m2
    return math.exp(v) if log else v


def camera(t):
    tx, ty = catmull(t, 1), catmull(t, 2); sc = catmull(t, 3, log=True)
    tilt, head = catmull(t, 4), catmull(t, 5)
    # slow drift so holds never stop dead
    tx += 6 * math.sin(t * 0.7); ty += 4 * math.sin(t * 0.53 + 1)
    return tx, ty, sc, math.radians(tilt), math.radians(head)


class Cam:
    def __init__(self, t):
        self.tx, self.ty, self.sc, self.th, self.hd = camera(t)
        self.d = FOC / self.sc
        st, ct = math.sin(self.th), math.cos(self.th); d = self.d
        M = skia.Matrix.MakeAll(FOC / d, -W / 2 * st / d, W / 2, 0, (FOC * ct - H0 * st) / d, H0, 0, -st / d, 1)
        R = skia.Matrix.RotateDeg(-math.degrees(self.hd))
        Tm = skia.Matrix.Translate(-self.tx, -self.ty)
        self.M = skia.Matrix.Concat(M, skia.Matrix.Concat(R, Tm))

    def p(self, x, y):
        X, Y = x - self.tx, y - self.ty
        ch, sh = math.cos(-self.hd), math.sin(-self.hd)
        X, Y = X * ch - Y * sh, X * sh + Y * ch
        w = self.d - Y * math.sin(self.th)
        return W / 2 + FOC * X / w, H0 + FOC * Y * math.cos(self.th) / w

    def px_per_unit(self, x, y):
        a = self.p(x, y); b = self.p(x + 1, y)
        return math.hypot(b[0] - a[0], b[1] - a[1])


# ------------------------------------------------------------------ scene
class Scene:
    def __init__(self):
        self.ground = ground_image()
        self.surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W, H, skia.ColorType.kRGBA_8888_ColorType, skia.AlphaType.kPremul_AlphaType))
        self.dh = blob(*DHARWAD, 210, 3); self.hb = blob(*HUBBALLI, 300, 8)
        self.corr = smooth_path(CORRIDOR); self.nala = smooth_path(NALA)
        self.grid = self.street_grid()
        self.access = smooth_path([(PLOT[0] - 10, PLOT[1] + 45), (212, 20), JUNCTION])
        self.drain = smooth_path([(PLOT[0] + 70, PLOT[1] + 10), (350, -95), DRAIN_TO])
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        dd = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H0) / (H * 0.55)) ** 2)
        self.vig = (1 - 0.55 * np.clip(dd - 0.45, 0, 1) ** 1.4).clip(0.3, 1)[..., None].astype(np.float32)
        rng = np.random.default_rng(9)
        self.grain = [rng.normal(0, 5.0, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]
        self.caps = self.caption_chunks()

    def street_grid(self):
        p = skia.Path()
        for (cx, cy), r, ang in ((DHARWAD, 260, -12), (HUBBALLI, 360, 18)):
            a = math.radians(ang)
            for k in range(-int(r * 1.3), int(r * 1.3), 26):
                for sgn in (0, 1):
                    dx, dy = (math.cos(a), math.sin(a)) if sgn == 0 else (-math.sin(a), math.cos(a))
                    ox, oy = -dy * k, dx * k
                    p.moveTo(cx + ox - dx * r * 1.4, cy + oy - dy * r * 1.4); p.lineTo(cx + ox + dx * r * 1.4, cy + oy + dy * r * 1.4)
        return p

    # -------------------------------------------------------- map layer (under perspective)
    def draw_map(self, c, t, cam):
        c.save(); c.concat(cam.M)
        x0, y0, x1, y1 = EXT
        c.drawImageRect(self.ground, skia.Rect.MakeLTRB(x0, y0, x1, y1), skia.SamplingOptions(skia.FilterMode.kLinear, skia.MipmapMode.kLinear))
        k = 1 / max(cam.px_per_unit(*PLOT), 1e-3)     # units per screen px near the action
        # cities: built-up blobs with a street grid
        for b in (self.dh, self.hb):
            c.drawPath(b, paint((0, 0, 0), 0.25, blur=14))
            c.drawPath(b, paint(CITY, 0.92))
            c.save(); c.clipPath(b, skia.ClipOp.kIntersect, True)
            c.drawPath(self.grid, paint(CITY_EDGE, 0.35, stroke=2.2 * max(1, k * 0.8)))
            c.restore()
            c.drawPath(b, paint(CITY_EDGE, 0.7, stroke=max(2.5, 1.6 * k)))
        # nala: teal band, draws on
        un = 0.15 + 0.85 * eo3(ramp(t, 0.1, 1.3))
        seg = partial(self.nala, un)
        c.drawPath(seg, paint((20, 40, 44), 0.6, stroke=max(14, 6 * k)))
        c.drawPath(seg, paint(TEAL, 0.95, stroke=max(9, 3.6 * k)))
        c.drawPath(seg, paint(TEAL_PALE, 0.45, stroke=max(3, 1.2 * k)))
        # corridor: cased line + glowing amber, draws on from Dharwad to Hubballi
        uc = 0.3 + 0.7 * eo3(ramp(t, 0.0, 1.0))
        seg = partial(self.corr, uc)
        c.drawPath(seg, paint((18, 14, 10), 0.75, stroke=max(20, 8.5 * k)))
        gl = paint(AMBER, 0.55, stroke=max(30, 12 * k), blur=max(10, 5 * k)); gl.setBlendMode(skia.BlendMode.kPlus)
        c.drawPath(seg, gl)
        c.drawPath(seg, paint(AMBER, 1, stroke=max(10, 4.2 * k)))
        c.drawPath(seg, paint(AMBER_CORE, 0.9, stroke=max(3.5, 1.4 * k)))
        # plot parcel (dashed outline) after the pin lands
        ua = ramp(t, T_PLOT + 0.35, 0.4)
        if ua > 0:
            c.save(); c.translate(*PLOT); c.rotate(8)
            r = skia.Rect.MakeXYWH(-62, -45, 124, 90)
            c.drawRect(r, paint(WARMW, 0.16 * ua))
            dp = paint(WARMW, 0.95 * ua, stroke=max(3, 1.4 * k)); dp.setPathEffect(skia.DashPathEffect.Make([14, 9], 0))
            c.drawRect(r, dp)
            c.restore()
        # check 1: access road from plot to corridor
        u1 = eo3(ramp(t, T_ROAD - 0.1, 0.45))
        if u1 > 0:
            seg = partial(self.access, u1)
            c.drawPath(seg, paint((18, 14, 10), 0.7, stroke=max(12, 5 * k)))
            c.drawPath(seg, paint(AMBER_CORE, 1, stroke=max(6, 2.6 * k)))
        # check 2: drainage flow toward the nala (teal arrow)
        u2 = eo3(ramp(t, T_DRAIN - 0.1, 0.45))
        if u2 > 0:
            seg = partial(self.drain, u2)
            dp = paint(TEAL_PALE, 1, stroke=max(6, 2.6 * k)); dp.setPathEffect(skia.DashPathEffect.Make([16, 10], -t * 60))
            c.drawPath(seg, dp)
            if u2 > 0.95:
                ax, ay = DRAIN_TO; ang = math.atan2(DRAIN_TO[1] - (-95), DRAIN_TO[0] - 350)
                ah = skia.Path(); L = 26
                ah.moveTo(ax + math.cos(ang) * 6, ay + math.sin(ang) * 6)
                ah.lineTo(ax - L * math.cos(ang - 0.5), ay - L * math.sin(ang - 0.5))
                ah.lineTo(ax - L * math.cos(ang + 0.5), ay - L * math.sin(ang + 0.5)); ah.close()
                c.drawPath(ah, paint(TEAL_PALE, 1))
        # rings in map space (they lie on the ground, so they foreshorten with the tilt)
        for tt, (cx, cy), rad, col in ((T_ROAD, JUNCTION, 42, AMBER), (T_DRAIN, DRAIN_TO, 42, TEAL_PALE), (T_APPR, PLOT, 100, WARMW)):
            ur = ramp(t, tt, 0.4)
            if ur <= 0: continue
            s = eback(ur, 2.2)
            c.drawCircle(cx, cy, rad * s, paint(col, 0.95, stroke=max(5, 2.4 * k)))
            pu = ramp(t, tt, 0.9)                     # one expanding pulse
            if pu < 1:
                c.drawCircle(cx, cy, rad * (1 + 1.4 * pu), paint(col, 0.6 * (1 - pu), stroke=max(3, 1.5 * k)))
        # pin landing pulse on the ground
        up = ramp(t, T_PLOT + 0.18, 1.0)
        if 0 < up < 1:
            c.drawCircle(*PLOT, 30 + 160 * eo3(up), paint(WARMW, 0.8 * (1 - up), stroke=max(4, 2 * k)))
        c.restore()

    # -------------------------------------------------------- screen-space layer
    def draw_labels(self, c, t, cam):
        far = clamp((0.9 - cam.sc) / 0.35)            # far labels fade as we dive (map-explainer LOD hand-over)
        for name, (x, y), tt in (("DHARWAD", DHARWAD, -1), ("HUBBALLI", HUBBALLI, -1)):
            sx, sy = cam.p(x, y)
            a = ramp(t, tt, 0.5) * max(far, 0.0)
            if a <= 0: continue
            hit = ramp(t, T_HUB + (0.0 if name == "HUBBALLI" else 0.55), 0.35)
            sz = 46
            tw = text(c, name, sx, sy + 16, F_CITY, sz, WARMW, a, 0.3, "center")
            ul = eo3(hit)
            if ul > 0:
                c.drawLine(sx - tw / 2, sy + 30, sx - tw / 2 + tw * ul, sy + 30, paint(AMBER, a, stroke=4))
        # corridor + nala labels
        a = ramp(t, 0.5, 0.5) * far
        if a > 0:
            sx, sy = cam.p(-170, -170)
            c.save(); c.translate(sx, sy)
            ax, ay = cam.p(-300, -250); bx, by = cam.p(0, -50)
            c.rotate(math.degrees(math.atan2(by - ay, bx - ax)))
            text(c, "HIGHWAY CORRIDOR", 0, -16, F_MED, 26, AMBER_CORE, a, 0.22, "center")
            c.restore()
            sx, sy = cam.p(560, -300)
            text(c, "nala", sx + 26, sy, F_MED, 28, TEAL_PALE, a, 0.12)
        # plot pin (screen-space glyph that drops onto the projected plot point)
        if t >= T_PLOT - 0.05:
            sx, sy = cam.p(*PLOT)
            u = ramp(t, T_PLOT - 0.05, 0.45)
            drop = (1 - eback(u, 1.6)) * 260 if u < 1 else 0
            sc = 1.0
            c.drawOval(skia.Rect.MakeXYWH(sx - 22, sy - 7, 44, 14), paint((0, 0, 0), 0.45 * min(1, u * 2), blur=5))
            c.save(); c.translate(sx, sy - drop); c.scale(sc, sc)
            pin = skia.Path(); pin.moveTo(0, 0)
            pin.cubicTo(-12, -22, -34, -40, -34, -66); pin.arcTo(skia.Rect.MakeXYWH(-34, -100, 68, 68), 180, 180, False)
            pin.cubicTo(34, -40, 12, -22, 0, 0); pin.close()
            c.drawPath(pin, paint((0, 0, 0), 0.35, blur=6))
            c.drawPath(pin, paint(AMBER, 1)); c.drawPath(pin, paint(INKD, 0.8, stroke=3))
            c.drawCircle(0, -66, 13, paint(INKD, 0.9))
            c.restore()
            la = ramp(t, T_PLOT + 0.3, 0.3) * (1 - ramp(t, T_ROAD - 0.6, 0.3) * 0.0)
            if la > 0 and t < T_ROAD - 0.3:
                text(c, "PLOT", sx + 46, sy - 60, F_BOLD, 38, WARMW, la, 0.2)
                text(c, "example location", sx + 46, sy - 26, F_MED, 24, WARMW, la * 0.75, 0.05)
        # check chips: ring + tick + label, with a leader to the ring
        chips = [(T_ROAD, JUNCTION, "ROAD ACCESS", AMBER, (-330, 150)), (T_DRAIN, DRAIN_TO, "DRAINAGE", TEAL_PALE, (150, 200)),
                 (T_APPR, PLOT, "APPROVALS", WARMW, (150, -250))]
        for i, (tt, pt, lab, col, off) in enumerate(chips):
            u = ramp(t, tt + 0.08, 0.35)
            if u <= 0: continue
            sx, sy = cam.p(*pt)
            if cam.sc < 1.0:   # pulled back: chips line up as a checklist at the side
                pass
            cx, cy = sx + off[0], sy + off[1]
            cx = clamp(cx, 70, 960 - 280); cy = clamp(cy, 280, 1290)
            a = clamp(u * 2) * (1 - ramp(t, L2_END + 0.1, 0.3))
            if a > 0:
                s = eback(u, 2.0)
                w = twidth(lab, F_BOLD, 40, 0.12) + 108
                lx = cx + (0 if off[0] > 0 else w); ly = cy + 32
                c.drawLine(sx, sy, lx, ly, paint(col, 0.8 * a, stroke=2.5))
                c.drawCircle(sx, sy, 6, paint(col, a))
                c.save(); c.translate(cx + w / 2, cy + 32); c.scale(s, s); c.translate(-w / 2, -32)
                rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(0, 0, w, 64), 32, 32)
                c.drawRRect(rr, paint((14, 12, 10), 0.82 * a))
                c.drawRRect(rr, paint(col, 0.9 * a, stroke=2.5))
                c.drawCircle(34, 32, 19, paint(col, a))
                tk = skia.Path(); tk.moveTo(25, 33); tk.lineTo(32, 40); tk.lineTo(44, 25)
                tp = paint(INKD, a, stroke=5); c.drawPath(partial(tk, eo3(ramp(t, tt + 0.2, 0.25))), tp)
                text(c, lab, 66, 45, F_BOLD, 40, WARMW, a, 0.12)
                c.restore()
        # end state: a compact checklist under the map
        ue = ramp(t, L2_END + 0.25, 0.45)
        if ue > 0:
            items = [("ROAD ACCESS", AMBER), ("DRAINAGE", TEAL_PALE), ("APPROVALS", WARMW)]
            y0 = 1130
            text(c, "BEFORE YOU PAY, CHECK", 76, y0 - 26, F_MED, 30, WARMW, ue * 0.85, 0.22)
            x = 76
            for j, (lab, col) in enumerate(items):
                uj = eback(ramp(t, L2_END + 0.3 + j * 0.12, 0.35), 2.0)
                if uj <= 0: continue
                w = twidth(lab, F_BOLD, 34, 0.1) + 84
                c.save(); c.translate(x + w / 2, y0 + 28); c.scale(uj, uj); c.translate(-w / 2, -28)
                rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(0, 0, w, 56), 28, 28)
                c.drawRRect(rr, paint((14, 12, 10), 0.85)); c.drawRRect(rr, paint(col, 0.9, stroke=2.5))
                c.drawCircle(28, 28, 15, paint(col))
                tk = skia.Path(); tk.moveTo(21, 29); tk.lineTo(27, 35); tk.lineTo(36, 22)
                c.drawPath(tk, paint(INKD, 1, stroke=4))
                text(c, lab, 52, 40, F_BOLD, 34, WARMW, 1, 0.1)
                c.restore()
                x += w + 14

    def draw_chrome(self, c, t):
        # style label + map furniture (top area)
        lab = "STYLE 06  ·  LOCAL MAP EXPLAINER"
        w = twidth(lab, F_INTER, 26, 0.08)
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(56, 116, w + 44, 52), 6, 6), paint((12, 10, 8), 0.72))
        c.drawRect(skia.Rect.MakeXYWH(56, 116, 6, 52), paint(AMBER))
        text(c, lab, 78, 151, F_INTER, 26, WARMW, 1, 0.08)
        text(c, "Illustrative map, not to scale", 60, 206, F_INTERM, 23, WARMW, 0.85)
        # north arrow (top right, inside x<=960)
        nx, ny = 905, 150
        c.drawCircle(nx, ny, 30, paint((12, 10, 8), 0.6))
        ar = skia.Path(); ar.moveTo(nx, ny - 22); ar.lineTo(nx + 10, ny + 8); ar.lineTo(nx, ny + 2); ar.lineTo(nx - 10, ny + 8); ar.close()
        c.save(); c.rotate(-math.degrees(camera(t)[4]), nx, ny); c.drawPath(ar, paint(WARMW, 0.95)); c.restore()
        text(c, "N", nx, ny + 52, F_BOLD, 22, WARMW, 0.9, 0, "center")
        # legend-shelf subtitles (bottom-left, amber rule), y 1390-1540
        g = skia.GradientShader.MakeLinear([skia.Point(0, 1300), skia.Point(0, 1920)],
                                           [skia.Color(0, 0, 0, 0), skia.Color(8, 6, 4, 165), skia.Color(8, 6, 4, 200)], [0, 0.5, 1])
        p = skia.Paint(); p.setShader(g); c.drawRect(skia.Rect.MakeXYWH(0, 1300, W, 620), p)
        for (s, e, lines, kw) in self.caps:
            if not (s - 0.01 <= t < e): continue
            a = ramp(t, s, 0.18) * (1 - ramp(t, e - 0.12, 0.12))
            if a <= 0: continue
            dy = (1 - eo3(ramp(t, s, 0.25))) * 14
            c.drawRect(skia.Rect.MakeXYWH(60, 1392 + dy, 6, 60 * len(lines) + 12), paint(AMBER, a))
            for i, ln in enumerate(lines):
                x = 86; y = 1446 + i * 62 + dy
                for wd in ln.split(" "):
                    key = wd.strip(",.?").lower() in kw
                    tw = text(c, wd + " ", x, y, F_CITY, 54, AMBER_CORE if key else WARMW, a, 0.02)
                    x += tw

    def caption_chunks(self):
        L1, L2 = TIM["lines"]
        w2 = L2["words"]
        return [(L1["start"] - 0.05, L2["start"] - 0.1, ["Buying a plot in", "Hubballi-Dharwad?"], {"plot"}),
                (L2["start"] - 0.05, w2[5]["s"] - 0.05, ["Check the road,", "the drain,"], {"road", "drain"}),
                (w2[5]["s"] - 0.05, L2["end"] + 0.35, ["and the approvals", "before you pay."], {"approvals"})]

    def frame(self, n):
        t = n / FPS
        cam = Cam(t)
        with self.surf as c:
            c.clear(skia.Color(*LAND))
            self.draw_map(c, t, cam)
            self.draw_labels(c, t, cam)
        arr = self.surf.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3].astype(np.float32)
        # warm grade + vignette + light grain (labels and chrome are drawn after, clean)
        arr *= self.vig
        g = self.grain[(n // 2) % len(self.grain)]
        arr += np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]
        arr = arr.clip(0, 255).astype(np.uint8)
        img = skia.Image.fromarray(np.dstack([arr, np.full(arr.shape[:2], 255, np.uint8)]), colorType=skia.ColorType.kRGBA_8888_ColorType)
        with self.surf as c:
            c.drawImage(img, 0, 0)
            self.draw_chrome(c, t)
            fo = ramp(t, DUR - 0.45, 0.45)
            if fo > 0: c.drawRect(skia.Rect.MakeWH(W, H), paint((0, 0, 0), fo))
        return self.surf.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--probe", default=""); ap.add_argument("--out", default="")
    a = ap.parse_args()
    sc = Scene()
    if a.probe:
        (HERE / "stills").mkdir(exist_ok=True)
        for s in a.probe.split(","):
            t = float(s); Image.fromarray(sc.frame(int(round(t * FPS)))).save(HERE / "stills" / f"t{t:05.2f}.png")
        return
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    for n in range(int(round(DUR * FPS))):
        ff.stdin.write(sc.frame(n).tobytes())
    ff.stdin.close(); ff.wait(); print("wrote", a.out)


if __name__ == "__main__":
    main()
