"""THE ₹5 LAKH NOBODY TOLD YOU ABOUT: a 7-minute BuyNBuild explainer in the studio look.

One light "site board". Row A (y = 0) runs left to right: the cold open, the quote formula, leaks 1-3.
Row B (y = YB) runs back right to left: leaks 4-7, then the six-question checklist. Seven numbered
leak markers sit above the chapters and are joined by a path, so the opening can show the whole hunt.

A LEAK METER is drawn in screen space (top right, clear of the captions) by a small hook on the
renderer: it rolls ₹25,00,000 -> ₹30,24,000 on the narrator's words and then carries a "+ ?" for the
leaks that have no number. Every time comes from the voiceover (doc.L / doc.E / doc.W).
World units are 4K pixels at zoom 1.
"""
import math

import skia

import engine
from engine import (HILITE, WHITE, BigText, Card, Counter, Film, Item, PenMark, Print, Route, Stamp,
                    draw_text, ease_out_back, ease_out_cubic, paint, partial_path, ramp, text_width)

INK = (34, 32, 30)
GREY = (120, 116, 110)
ACC = (206, 64, 36)            # BuyNBuild red-orange: leaks, money, verdicts
YB = 15000                     # row B
TOP_A, TOP_B = -4600, 10400    # marker row of each board row


def inr(v):
    """Indian digit grouping: 3024000 -> 30,24,000."""
    s = str(int(round(v)))
    if len(s) <= 3:
        return s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:]); head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts + [tail])


# ---------------------------------------------------------------- items written for this film
class RupeeCounter(Counter):
    """Counter with Indian grouping (₹25,00,000), clean ink for the light board."""

    def draw(self, c, res, t):
        a = ramp(t, self.t_in, 0.3) * self.fade(t)
        if a <= 0:
            return
        u = ease_out_cubic(ramp(t, self.t_in, self.dur))
        v = self.start + (self.value - self.start) * u
        draw_text(c, res, f"{self.prefix}{inr(v)}{self.suffix}", self.x, self.y, self.size, self.font, self.rgb, a, 0.03, "center")
        if self.caption:
            ca = ramp(t, self.t_in + self.dur * 0.6, 0.4) * self.fade(t)
            draw_text(c, res, self.caption, self.x, self.y + self.size * 0.42, self.size * 0.24, "cond", self.rgb, 0.85 * ca, 0.12, "center")


class ListCard(Item):
    """A paper list: a title and rows, each row arriving (and ticking) on its word.
    rows: [(text, t)] where t is when the row lands; ticks=False draws plain rows (a quote form)."""
    z = 14

    def __init__(self, x, top, w, title, rows, t_in, row_h=400, title_size=230, body_size=170, ticks=True,
                 accent=ACC, t_out=None, sfx=True):
        super().__init__(t_in, t_out, None, sfx)
        self.x, self.top, self.w, self.title, self.rows = x, top, w, title, rows
        self.row_h, self.ts, self.bs, self.ticks, self.accent = row_h, title_size, body_size, ticks, accent
        self.pad = 220
        self.h = self.pad * 2 + self.ts * 1.45 + row_h * len(rows)
        self.y = top + self.h / 2

    def row_y(self, i):
        return self.top + self.pad + self.ts * 1.45 + (i + 0.5) * self.row_h

    def text_x(self):
        return self.x - self.w / 2 + self.pad + (self.bs * 1.5 if self.ticks else 0)

    def span(self, res, i, sub=None):
        """(centre x, centre y, width) of row i's text, or of `sub` inside it: for highlights."""
        txt = self.rows[i][0]
        x0 = self.text_x()
        if sub:
            k = txt.index(sub)
            x0 += text_width(res, txt[:k], self.bs, "labelm")
            txt = sub
        w = text_width(res, txt, self.bs, "labelm")
        return x0 + w / 2, self.row_y(i) - self.bs * 0.33, w

    def bounds(self, res):
        r = max(self.w, self.h) * 0.75 + 300
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        out = [("pop", self.t_in, 0.6, {})]
        if self.ticks:
            out += [("pencil", t, 0.45, {"dur": 0.3}) for _, t in self.rows if t is not None and t > self.t_in + 0.3]
        return out

    def draw(self, c, res, t):
        u = ease_out_back(ramp(t, self.t_in, 0.45), 1.2)
        a = ramp(t, self.t_in, 0.15) * self.fade(t)
        if a <= 0:
            return
        W, H = self.w, self.h
        c.save(); c.translate(self.x, self.y + (1 - u) * 120)
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-W / 2, -H / 2, W, H), 30, 30)
        c.save(); c.translate(0, 26); c.drawRRect(rr, paint((0, 0, 0), 0.28 * a, blur=40)); c.restore()
        c.drawRRect(rr, paint((252, 250, 246), a))
        c.save(); c.clipRRect(rr, skia.ClipOp.kIntersect, True)
        c.drawRect(skia.Rect.MakeXYWH(-W / 2, -H / 2, W, self.pad * 0.35), paint(self.accent, a))
        c.restore()
        ox, oy = -self.x, -self.y
        tx = self.text_x() + ox
        draw_text(c, res, self.title, -W / 2 + self.pad, -H / 2 + self.pad + self.ts * 0.95, self.ts, "label", INK, a)
        ry = -H / 2 + self.pad + self.ts * 1.25
        c.drawLine(-W / 2 + self.pad, ry, W / 2 - self.pad, ry, paint(GREY, 0.35 * a, stroke=6))
        for i, (txt, tt) in enumerate(self.rows):
            t0 = self.t_in + 0.2 + 0.08 * i if tt is None else tt - 0.15
            ra = a * ramp(t, t0, 0.3)
            if ra <= 0:
                continue
            y = self.row_y(i) + oy
            if self.ticks:
                bx, b = -W / 2 + self.pad, self.bs * 0.95
                box = skia.Rect.MakeXYWH(bx, y - b * 0.85, b, b)
                c.drawRect(box, paint(GREY, 0.8 * ra, stroke=8))
                if tt is not None:
                    tu = ease_out_cubic(ramp(t, tt, 0.3))
                    if tu > 0:
                        p = skia.Path(); p.moveTo(bx + b * 0.15, y - b * 0.4); p.lineTo(bx + b * 0.42, y - b * 0.08)
                        p.lineTo(bx + b * 1.05, y - b * 1.05)
                        c.drawPath(partial_path(p, tu), paint(self.accent, ra, stroke=b * 0.2))
            draw_text(c, res, txt, tx, y, self.bs, "labelm", INK, ra * 0.92)
            if i < len(self.rows) - 1:
                ly = y + self.row_h * 0.5 - self.bs * 0.25
                c.drawLine(tx, ly, W / 2 - self.pad, ly, paint(GREY, 0.14 * ra, stroke=4))
        c.restore()


class LeakMarker(Item):
    """A numbered leak disc that pops on, and pulses when it is the leak being talked about."""
    z = 40

    def __init__(self, x, y, num, t_in, r=1000, pulses=(), sfx=True):
        super().__init__(t_in, None, None, sfx)
        self.x, self.y, self.num, self.r, self.pulses = x, y, num, r, pulses

    def bounds(self, res):
        R = self.r * 3
        return skia.Rect.MakeLTRB(self.x - R, self.y - R, self.x + R, self.y + R)

    def cues(self):
        return [("pop", self.t_in, 0.5, {})]

    def draw(self, c, res, t):
        u = ease_out_back(ramp(t, self.t_in, 0.4), 1.6)
        if u <= 0:
            return
        r = self.r * u
        for tp in self.pulses:
            pu = ramp(t, tp, 1.1)
            if 0 < pu < 1:
                c.drawCircle(self.x, self.y, r * (1 + 0.9 * pu), paint(ACC, 0.6 * (1 - pu), stroke=60))
        c.save(); c.translate(0, 22); c.drawCircle(self.x, self.y, r, paint((0, 0, 0), 0.25, blur=30)); c.restore()
        c.drawCircle(self.x, self.y, r, paint(ACC, 1))
        c.drawCircle(self.x, self.y, r * 0.86, paint(WHITE, 0.9, stroke=26))
        draw_text(c, res, str(self.num), self.x, self.y + r * 0.42, r * 1.2, "cond", WHITE, min(1, u), 0, "center")


class LeakMeter:
    """Screen-space LEAK METER (4K screen px, top right). keys: [(t, value or None for '?', roll seconds)];
    flashes: [(t, text)] shown under the panel; plus_t: from then on a pulsing '+ ?' tag."""

    def __init__(self, t_in, keys, flashes, plus_t, plus_pulses=(), hide=()):
        self.t_in, self.keys, self.flashes, self.plus_t, self.plus_pulses = t_in, sorted(keys), flashes, plus_t, plus_pulses
        self.hide = hide

    def text(self, t):
        prev = self.keys[0][1]
        cur = prev
        for kt, v, dur in self.keys:
            if t < kt:
                break
            if v is None:
                cur = None
            else:
                start = prev if prev is not None else v
                cur = start + (v - start) * ease_out_cubic(ramp(t, kt, dur))
            prev = v if v is not None else prev
        return "₹ ?" if cur is None else "₹" + inr(round(cur / 1000) * 1000)

    def draw(self, c, res, t):
        a = ramp(t, self.t_in, 0.4)
        for h0, h1 in self.hide:
            a *= 1 - ramp(t, h0, 0.4) * (1 - ramp(t, h1, 0.4))
        if a <= 0:
            return
        c.save(); c.translate(3840 - 80, 80); c.scale(0.74, 0.74); c.translate(-3840, 0)
        W, H = 1180, 330
        x0, y0 = 3840 - W, 0
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x0, y0, W, H), 26, 26)
        c.save(); c.translate(0, 14); c.drawRRect(rr, paint((0, 0, 0), 0.3 * a, blur=26)); c.restore()
        c.drawRRect(rr, paint((30, 28, 27), 0.9 * a))
        c.save(); c.clipRRect(rr, skia.ClipOp.kIntersect, True)
        c.drawRect(skia.Rect.MakeXYWH(x0, y0, 22, H), paint(ACC, a)); c.restore()
        draw_text(c, res, "LEAK METER", x0 + 70, y0 + 92, 62, "label", ACC, a, 0.12)
        draw_text(c, res, self.text(t), x0 + 70, y0 + 270, 190, "cond", WHITE, a, 0.03)
        if t >= self.plus_t:
            pa = a * ramp(t, self.plus_t, 0.5)
            boost = max([1 - ramp(t, p, 1.2) for p in self.plus_pulses if t >= p] + [0.0])
            draw_text(c, res, "+ ?", x0 + W - 60, y0 + 262, 150 * (1 + 0.25 * boost), "cond", ACC, pa, 0.02, "right")
        for ft, txt in self.flashes:
            fa = ramp(t, ft, 0.25) * (1 - ramp(t, ft + 2.6, 0.6)) * a
            if fa > 0:
                lift = 40 * (1 - ease_out_cubic(ramp(t, ft, 0.5)))
                draw_text(c, res, txt, x0 + W - 40, y0 + H + 150 + lift, 130, "cond", ACC, fa, 0.03, "right")
        c.restore()


_draw_world = engine.Renderer.draw_world


def _draw_world_hud(self, t):
    img = _draw_world(self, t)
    hud = getattr(self.film, "hud", None)
    if not hud:
        return img
    with self.surface as c:
        c.save(); c.scale(self.s, self.s)
        for h in hud:
            h.draw(c, self.res, t)
        c.restore()
    return self.surface.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]


engine.Renderer.draw_world = _draw_world_hud


# ---------------------------------------------------------------- the film
def build_film(doc):
    L, E, W = doc.L, doc.E, doc.W
    res = doc.res()
    film = Film(doc.duration, fps=30, look="studio")
    add, cue = film.add, film.cue

    def S(t, x, y, z, rot=0.0, r=None, s=0.5):
        """Camera + spotlight on a hero at (x, y), framed in the top 74% of the screen (captions below)."""
        film.cam(t, x, y + 110 / z, z, rot)
        film.focus(t, x, y, r or 1500 / z, s)
        last[:] = [x, y, z, rot, r, s]

    last = []

    def H(t):
        """Hold: the camera stays where it last landed until t (the spline otherwise drifts on early)."""
        x, y, z, rot, r, s_ = last
        S(t, x, y, z, rot, r, s_)

    def P(key, x, y, w, t, rot=0.0, **kw):
        return add(Print(key, x, y, w, rot=rot, t_in=t, pin=False, **kw))

    def chapter(n, x, top, sub, t):
        add(BigText(f"LEAK {n}", x, top + 2150, 640, t, bar=ACC, bar_h=0.92, rgb=WHITE, shadow=False, grunge=False, hit=0.45))
        add(BigText(sub, x, top + 2700, 250, t + 0.3, rgb=INK, shadow=False, grunge=False))

    def label(text, x, y, size, t, rgb=INK, **kw):
        return add(BigText(text, x, y, size, t, rgb=rgb, shadow=False, grunge=False, **kw))

    # leak markers and the path between them (revealed on "seven leaks")
    mk = [(20000, TOP_A), (31000, TOP_A), (42000, TOP_A), (42000, TOP_B), (31000, TOP_B), (20000, TOP_B), (9000, TOP_B)]
    t7 = W(6, "seven")
    starts = [L(16), L(21), L(40), L(44), L(57), L(63), L(67)]
    for k, (mx, my) in enumerate(mk):
        pulses = [starts[k]] + ([W(7, "paper")] if k == 6 else [])
        add(LeakMarker(mx, my, k + 1, t7 + 0.1 + 0.13 * k, pulses=pulses))
    for k, (a, b) in enumerate(zip(mk, mk[1:])):
        add(Route((a[0] + (900 if a[1] == b[1] and b[0] > a[0] else -900 if a[1] == b[1] else 0), a[1] + (900 if a[1] != b[1] else 0)),
                  (b[0] - (900 if a[1] == b[1] and b[0] > a[0] else -900 if a[1] == b[1] else 0), b[1] - (900 if a[1] != b[1] else 0)),
                  t_in=t7 + 0.15 + 0.13 * k, dur=0.4, bend=0.04, width=50, rgb=(176, 170, 162), sfx=False))

    # ============================================================ COLD OPEN (1-8)
    house = P("HOUSE", 0, 0, 4400, 0.15, rot=-0.8, label="ILLUSTRATIVE EXAMPLE", label_t=L(1) + 1.0)
    add(RupeeCounter(0, 2750, 620, 2500000, W(2, "twenty") - 0.1, dur=0.9, prefix="₹", caption="THE QUOTE", rgb=INK))
    add(Stamp("NOBODY LIED", 1100, -350, 300, rot=-8, t_in=W(4, "lied") - 0.05))
    q5 = label("₹5,00,000 ?", 0, -1650, 520, W(5, "five") - 0.1, rgb=ACC, hit=0.5, t_out=L(6) + 0.4)
    add(BigText("MADE OF PAPER", 9000, TOP_B + 2000, 380, W(7, "paper") - 0.1, rgb=ACC, shadow=False, grunge=False, t_out=L(8)))
    title_t = L(8) + 0.25
    label("THE ₹5 LAKH", 0, -2300, 760, title_t, hit=0.6)
    label("NOBODY TOLD YOU ABOUT", 0, -1650, 330, title_t + 0.35, rgb=ACC, rules=True)
    cue("boom", title_t, 0.5)

    S(0.0, 0, 100, 0.55)
    S(L(1) + 3.0, 200, 150, 0.6, -0.4)
    S(W(2, "twenty") + 0.3, 0, 2300, 0.78)
    S(L(3) + 0.5, 0, 700, 0.5)
    S(E(3), 0, 600, 0.52)
    S(L(4) + 0.5, 500, -200, 0.7, 0.4)
    S(E(4), 900, -300, 0.8, 0.6)
    S(L(5) + 0.3, 0, -1300, 0.62)
    S(E(5) + 0.1, 0, -1200, 0.6)
    H(t7 - 1.4)
    S(t7 - 0.1, 25500, 2400, 0.076, r=40000, s=0.08)
    S(E(6) + 0.2, 25500, 2400, 0.079, r=40000, s=0.08)
    S(W(7, "paper") - 0.2, 9000, TOP_B + 700, 0.36, r=4000, s=0.45)
    S(E(7) + 0.1, 9000, TOP_B + 900, 0.5)
    S(L(8) + 0.6, 0, -900, 0.42)
    S(E(8) + 1.1, 0, -800, 0.4)

    # ============================================================ THE QUOTE (9-15)
    QX = 10000
    add(Card(QX, -2000, 7200, 2600, L(9) + 0.2, title="HOW A QUOTE IS MADE", accent=ACC, title_size=170, body_size=1))
    f1 = "BUILT-UP AREA  ×  RATE PER SQ FT"
    label(f1, QX, -1950, 330, W(10, "Built") - 0.1, type_on=0.8)
    f2 = "1,000 SQ FT  ×  ₹2,500  =  ₹25,00,000"
    label(f2, QX, -1250, 330, W(11, "thousand") - 0.2, rgb=ACC, type_on=1.4)
    fw, pw = text_width(res, f2, 330, "cond", 0.04), text_width(res, "₹25,00,000", 330, "cond", 0.04)
    add(PenMark("underline", QX + fw / 2 - pw / 2, -1150, pw + 120, 40, t_in=W(11, "Twenty", 0) - 0.1, dur=0.45, width=30, rgb=INK))
    rates = [("BASIC", "₹1,800–2,300 / sq ft", W(12, "Basic") - 0.1), ("STANDARD", "₹2,300–2,900 / sq ft", W(13, "Standard") - 0.1),
             ("PREMIUM", "above ₹2,900 / sq ft", W(13, "Premium") - 0.1)]
    for k, (name, rate, t) in enumerate(rates):
        add(Card(QX + (k - 1) * 2450, 900, 2250, 1500, t, title=name, lines=[rate, "indicative, Oct 2026"], accent=ACC,
                 title_size=210, body_size=135))
    bd = P("BREAKDOWN", QX, 4000, 3600, L(14) + 0.1, rot=0.6)
    label("INSIDE THE RATE", QX, 2500, 260, W(15, "inside") - 0.1, rgb=ACC)
    add(Stamp("WHAT'S OUTSIDE?", QX + 2100, 5100, 230, rot=-7, t_in=W(15, "outside") - 0.05))

    S(L(9) + 0.7, QX, -2100, 0.5)
    S(W(10, "Built") + 0.3, QX, -2000, 0.56)
    S(W(11, "thousand"), QX, -1700, 0.6)
    S(E(11), QX + 300, -1600, 0.64)
    S(W(12, "Basic") + 0.3, QX - 2000, 900, 0.62, -0.3)
    S(W(13, "Standard") + 0.2, QX, 900, 0.62)
    S(W(13, "Premium") + 0.2, QX + 1700, 900, 0.6, 0.3)
    S(E(13) + 0.1, QX, 800, 0.5)
    S(L(14) + 0.5, QX, 3900, 0.62)
    S(E(14), QX, 3800, 0.64)
    S(W(15, "inside"), QX, 3400, 0.56)
    S(W(15, "outside") + 0.3, QX + 800, 4000, 0.52)
    S(E(15) + 0.6, QX + 900, 4000, 0.5)

    # ============================================================ LEAK 1: AREA (16-20)
    AX = 20000
    chapter(1, AX, TOP_A, "THE AREA YOU PAY FOR", L(16) - 0.1)
    cp = P("CARPET", AX - 1100, 900, 3800, L(17) - 0.1, rot=-0.5)
    P("CARPETHERO", AX + 3200, 500, 2300, L(16) + 0.7, rot=2.5)
    ex, ey = doc.on(cp, 0.505, 0.53)
    add(PenMark("ellipse", ex, ey, 2500, 2250, t_in=W(17, "built") - 0.1, dur=0.6, width=34, rgb=ACC, seed=3))
    wx, wy = doc.on(cp, 0.12, 0.69)
    add(PenMark("highlight", wx, wy, 720, 0, t_in=W(17, "walls") - 0.25, dur=0.35, width=110))
    cx_, cy_ = doc.on(cp, 0.13, 0.395)
    add(PenMark("highlight", cx_, cy_, 600, 0, t_in=W(18, "carpet") - 0.25, dur=0.35, width=110, seed=4))
    add(Stamp("WHICH AREA?", AX + 1700, 2500, 300, rot=-6, t_in=W(19, "which") - 0.05))

    S(E(15) + 1.4, AX, -2500, 0.55)
    S(L(16) + 1.2, AX, -2300, 0.58)
    H(L(17) - 0.2)
    S(L(17) + 0.4, AX - 1100, 800, 0.6)
    S(W(17, "walls"), AX - 1500, 1200, 0.66, -0.3)
    S(E(17), AX - 1400, 1100, 0.66)
    S(W(18, "carpet") + 0.2, AX - 1300, 400, 0.7)
    S(E(18), AX - 1100, 500, 0.66)
    S(W(19, "which"), AX + 600, 1700, 0.56)
    S(E(19), AX + 700, 1800, 0.58)
    S(L(20) + 0.4, AX + 600, 700, 0.42, r=4500, s=0.3)
    S(E(20) + 0.6, AX + 600, 700, 0.4, r=4500, s=0.3)

    # ============================================================ LEAK 2: THE LIST (21-38)
    BX = 31000
    chapter(2, BX, TOP_A, "THE LIST OUTSIDE THE RATE", L(21) - 0.1)
    rows = [("Plan approval fees", W(22, "Plan")), ("Soil test & structural design", W(23, "Soil")),
            ("Compound wall & gate", W(24, "Compound")), ("Borewell, sump & overhead tank", W(24, "Borewell")),
            ("Electricity & water connections", W(26, "Electricity")), ("Interiors: kitchen, wardrobes", W(28, "Interiors")),
            ("GST, if not in the quote", W(29, "GST")), ("In our example:  about ₹3,00,000", W(32, "three"))]
    lst = add(ListCard(BX - 1500, -1250, 4300, "NOT IN THE RATE", rows, L(21) + 0.6, row_h=400, body_size=175))
    P("SANCTION", BX + 2900, -500, 2500, W(22, "Plan") + 0.1, rot=1.5)
    P("BOQ", BX + 2900, 1900, 2500, W(23, "Soil") + 0.1, rot=-1.2)
    y3, y4 = lst.row_y(2), lst.row_y(3)
    add(PenMark("ellipse", lst.x - 300, (y3 + y4) / 2 - 60, 4000, 900, t_in=W(25, "rooms") - 0.3, dur=0.6, width=26, rgb=ACC, seed=6,
                t_out=E(27)))
    add(Stamp("NOT TRICKS", lst.x + 700, lst.row_y(7) - 60, 300, rot=-8, t_in=W(30, "tricks") - 0.05, t_out=W(32, "three") - 0.7))
    tx, ty, tw = lst.span(res, 7, "about ₹3,00,000")
    add(PenMark("highlight", tx, ty, tw + 80, 0, t_in=W(32, "three") - 0.2, dur=0.4, width=150))
    label("+₹3,00,000", BX - 1500, lst.top + lst.h + 600, 440, W(32, "three"), rgb=ACC, hit=0.45)
    add(Card(BX + 2900, 4500, 2800, 1600, W(34, "contingency") - 0.15, title="CONTINGENCY",
             lines=["usually 5–10%", "price rises · your changes"], accent=ACC, title_size=230, body_size=150))
    label("+₹2,24,000", BX + 2900, 6100, 440, W(37, "two") - 0.05, rgb=ACC, hit=0.45)
    label("8% OF ₹28,00,000", BX + 2900, 6550, 190, W(37, "two") + 0.5, rgb=INK)
    add(Stamp("₹25 L  BECAME  ₹30 L", BX - 1300, 5300, 300, rot=-5, t_in=W(38, "thirty") - 0.1))

    S(E(20) + 1.4, BX, -2500, 0.55)
    S(L(21) + 1.0, BX, -2300, 0.58)
    H(E(21) - 0.2)
    S(L(22) + 0.3, BX + 700, 300, 0.42, r=4500)
    H(E(23) - 0.1)
    for k, ln in ((3, 24), (4, 26), (5, 28), (6, 29)):
        S(L(ln) + 0.3, lst.x, lst.row_y(k) - 200, 0.58)
        H(E(ln) + (0.0 if ln == 29 else 1.0))
    S(L(30) + 0.3, BX - 1200, 900, 0.44, r=4500)
    S(E(31), BX - 1100, 1000, 0.43, r=4500)
    S(W(32, "three"), BX - 1500, 2800, 0.6)
    S(E(33), BX - 1500, 2900, 0.62)
    H(W(34, "contingency") - 0.6)
    S(W(34, "contingency") + 0.2, BX + 2900, 4400, 0.62)
    S(E(36), BX + 2900, 4500, 0.64)
    S(W(37, "two") + 0.2, BX + 2900, 5700, 0.66)
    S(E(37), BX + 2800, 5600, 0.64)
    S(W(38, "thirty"), BX + 300, 3300, 0.34, r=6500, s=0.3)
    S(E(38) + 0.7, BX + 300, 3200, 0.33, r=6500, s=0.3)

    # ============================================================ LEAK 3: SOIL (39-43)
    CX = 42000
    chapter(3, CX, TOP_A, "THE GROUND UNDER YOUR FEET", L(40) - 0.1)
    add(Card(CX - 2400, 500, 3300, 2100, W(41, "north") - 0.15, title="NORTH KARNATAKA",
             lines=["Kalaburagi · Raichur", "swells when wet", "shrinks when dry"], accent=ACC, title_size=230, body_size=170))
    ft = P("FOOTING", CX + 2300, 500, 3300, L(42) - 0.1, rot=0.8)
    add(Stamp("CRACKS", CX + 1300, 1700, 240, rot=8, t_in=W(42, "cracks") - 0.05))
    fx, fy = doc.on(ft, 0.5, 0.72)
    add(PenMark("ellipse", fx, fy, 2300, 1100, t_in=W(42, "foundation") - 0.2, dur=0.6, width=30, rgb=ACC, seed=8))
    P("SOIL", CX, 3800, 3100, L(43) - 0.1, rot=-1.0)
    add(Stamp("CHEAPEST INSURANCE", CX + 300, 4700, 250, rot=-6, t_in=W(43, "cheapest") - 0.05))

    H(E(39) - 0.3)
    S(E(39) + 0.9, CX, -2500, 0.55)
    S(L(40) + 1.0, CX, -2300, 0.58)
    H(L(41) + 0.2)
    S(W(41, "north") + 0.3, CX - 2400, 500, 0.62)
    S(E(41), CX - 2300, 600, 0.62)
    S(L(42) + 0.4, CX + 2300, 400, 0.62)
    S(W(42, "foundation"), CX + 2300, 700, 0.66)
    S(E(42), CX + 2300, 700, 0.66)
    S(L(43) + 0.4, CX, 3700, 0.6)
    S(W(43, "cheapest"), CX + 100, 3900, 0.62)
    S(E(43) + 0.6, CX + 100, 3800, 0.56)

    # ============================================================ LEAK 4: MATERIALS (44-56)
    DX, R0 = 42000, YB - 1300          # R0: first content row of row B
    chapter(4, DX, TOP_B, "THE BAG AND THE BAR", L(44) - 0.1)
    vq = add(ListCard(DX, R0, 3000, "THE QUOTE", [("Rate: ₹2,500 / sq ft", None), ("Cement", None), ("Steel", None)],
                      L(45) - 0.1, ticks=False, body_size=180))
    P("GRADES", DX - 3700, R0 + 1100, 3000, L(46) + 0.1, rot=-1.0)
    P("PPC", DX - 3700, R0 + 3900, 2600, W(47, "cheaper") - 0.4, rot=1.2)
    P("TMT", DX + 3700, R0 + 1100, 2800, L(48) + 0.1, rot=1.0)
    P("STEELWT", DX + 3700, R0 + 3900, 2400, W(48, "five") - 0.2, rot=-0.8)
    for k, wd in ((1, "cement"), (2, "steel")):
        hx, hy, hw = vq.span(res, k)
        add(PenMark("highlight", hx, hy, hw + 80, 0, t_in=W(49, wd) - 0.2, dur=0.3, width=150, seed=10 + k))
    add(Card(DX, R0 + 3700, 3000, 1700, L(50) + 0.1, title="AND MORE",
             lines=["Tiles · Paint", "Wiring · Plumbing", "cheap and costly versions"], accent=ACC, title_size=230, body_size=160))
    qrows = [("Rate: ₹2,500 / sq ft", None), ("Cement: ________", None), ("Steel: ________", None)]
    qa = add(ListCard(DX - 1450, R0 + 5200, 2700, "QUOTE A", qrows, L(52) - 0.1, ticks=False, body_size=170))
    qb = add(ListCard(DX + 1450, R0 + 5200, 2700, "QUOTE B", qrows, L(52) + 0.2, ticks=False, body_size=170))
    for q, sd in ((qa, 0), (qb, 1)):
        for k in (1, 2):
            hx, hy, hw = q.span(res, k, "________")
            add(PenMark("highlight", hx, hy, hw + 60, 0, t_in=W(52, "brand") - 0.2 + 0.12 * (2 * sd + k - 1), dur=0.3, width=150, seed=20 + k + 2 * sd))
    add(Stamp("SAME PRICE?", DX, qa.top + qa.h + 350, 300, rot=-6, t_in=W(53, "Same") - 0.05))
    irows = [("Cement: brand + grade", W(54, "cement")), ("Steel: brand + grade", W(54, "steel")),
             ("Tiles · paint", W(54, "tiles")), ("Wiring · plumbing", W(54, "wiring"))]
    it = add(ListCard(DX + 5000, R0 + 5200, 3400, "ITEMISED QUOTE", irows, L(54) + 0.3, body_size=170))

    S(E(43) + 1.4, DX, TOP_B + 2100, 0.55)
    S(L(44) + 1.0, DX, TOP_B + 2300, 0.58)
    H(L(45) - 0.1)
    S(L(45) + 0.3, DX, R0 + 900, 0.66)
    S(E(45), DX, R0 + 1000, 0.68)
    S(L(46) + 0.5, DX - 3700, R0 + 1100, 0.62)
    S(E(46), DX - 3600, R0 + 1200, 0.64)
    S(L(47) + 0.2, DX - 3700, R0 + 3900, 0.62)
    S(E(47), DX - 3600, R0 + 3800, 0.64)
    S(L(48) + 0.3, DX + 3700, R0 + 1100, 0.62)
    S(W(48, "five") + 0.3, DX + 3700, R0 + 2500, 0.42)
    S(E(48), DX + 3600, R0 + 2500, 0.42)
    S(W(49, "cement") - 0.3, DX, R0 + 1000, 0.66)
    S(E(49), DX, R0 + 1100, 0.68)
    S(L(50) + 0.3, DX, R0 + 3700, 0.62)
    S(E(51), DX, R0 + 3700, 0.6)
    S(L(52) + 0.4, DX, R0 + 6200, 0.5)
    S(W(52, "brand"), DX, R0 + 6300, 0.55)
    S(E(52), DX, R0 + 6300, 0.55)
    S(L(53) + 0.2, DX, R0 + 6600, 0.5)
    H(L(54) + 0.1)
    S(L(54) + 0.5, DX + 5000, R0 + 6400, 0.6)
    S(E(55), DX + 5000, R0 + 6500, 0.62)
    S(L(56) + 0.3, DX + 600, R0 + 3500, 0.24, r=12000, s=0.15)
    S(E(56) + 0.4, DX + 600, R0 + 3500, 0.23, r=12000, s=0.15)

    # ============================================================ LEAK 5: CONCRETE (57-62)
    EX = 31000
    chapter(5, EX, TOP_B, "THE CONCRETE YOU PAY FOR TWICE", L(57) - 0.1)
    hc = P("HONEY", EX - 2000, R0 + 1600, 3200, L(58) - 0.1, rot=-0.8, label="HONEYCOMBING", label_t=W(58, "honeycombing") - 0.1)
    hx, hy = doc.on(hc, 0.6, 0.5)
    add(PenMark("ellipse", hx, hy, 1350, 1700, t_in=W(58, "gaps") - 0.2, dur=0.55, width=30, rgb=ACC, seed=12))
    P("CURING", EX + 2300, R0 + 900, 2800, L(59) - 0.1, rot=1.0)
    P("CURINGDIA", EX + 2300, R0 + 3300, 2800, L(60) - 0.1, rot=-0.5, label="CURING", label_t=W(60, "cured"))
    label("IS 456 MINIMUM", EX, R0 + 4900, 170, W(61, "code") - 0.2, rgb=GREY)
    add(Counter(EX - 1600, R0 + 5800, 700, 7, W(61, "seven") - 0.1, dur=0.6, suffix=" DAYS", caption="ORDINARY (OPC)", rgb=INK))
    add(Counter(EX + 1600, R0 + 5800, 700, 10, W(61, "ten") - 0.1, dur=0.7, suffix=" DAYS", caption="BLENDED (PPC)", rgb=INK))
    add(Stamp("PAID TWICE", EX - 1800, R0 + 1900, 320, rot=-9, t_in=W(62, "repair") - 0.05))

    S(E(56) + 1.4, EX, TOP_B + 2100, 0.55)
    S(L(57) + 1.2, EX, TOP_B + 2300, 0.58)
    H(L(58) - 0.1)
    S(L(58) + 0.4, EX - 2000, R0 + 1600, 0.62)
    S(W(58, "gaps") + 0.2, EX - 1800, R0 + 1600, 0.7)
    S(E(58), EX - 1900, R0 + 1700, 0.66)
    S(L(59) + 0.3, EX + 2300, R0 + 900, 0.66)
    S(E(59), EX + 2300, R0 + 1000, 0.66)
    S(L(60) + 0.3, EX + 2300, R0 + 3300, 0.68)
    S(E(60), EX + 2300, R0 + 3300, 0.68)
    S(W(61, "code"), EX, R0 + 5300, 0.5)
    S(E(61), EX, R0 + 5400, 0.5)
    S(L(62) + 0.3, EX - 1900, R0 + 1800, 0.6)
    S(E(62) + 0.6, EX - 1900, R0 + 1800, 0.62)

    # ============================================================ LEAK 6: THE WHITE WALL (63-66)
    FX = 20000
    chapter(6, FX, TOP_B, "THE WALL THAT TURNS WHITE", L(63) - 0.1)
    P("EFFLO", FX - 1900, R0 + 1700, 3400, L(64) - 0.1, rot=-0.7, label="EFFLORESCENCE", label_t=W(64, "efflorescence") - 0.1)
    dp = P("DPC", FX + 2300, R0 + 1700, 2700, L(65) - 0.1, rot=0.6, label="DAMP-PROOF COURSE", label_t=W(65, "damp") - 0.1)
    dx, dy = doc.on(dp, 0.5, 0.585)
    add(PenMark("arrow", dx - 900, dy - 80, 1500, 360, t_in=W(65, "plinth") - 0.2, dur=0.5, width=30, rgb=ACC, seed=14))

    S(E(62) + 1.4, FX, TOP_B + 2100, 0.55)
    S(L(63) + 1.0, FX, TOP_B + 2300, 0.58)
    H(L(64) - 0.1)
    S(L(64) + 0.4, FX - 1900, R0 + 1700, 0.62)
    S(E(64), FX - 1800, R0 + 1800, 0.64)
    S(L(65) + 0.3, FX + 2300, R0 + 1700, 0.62)
    S(W(65, "plinth"), FX + 2100, R0 + 1900, 0.7)
    S(E(65), FX + 2100, R0 + 1900, 0.7)
    S(L(66) + 0.4, FX, R0 + 1800, 0.42, r=4500, s=0.3)
    S(E(66) + 0.5, FX, R0 + 1800, 0.41, r=4500, s=0.3)

    # ============================================================ LEAK 7: PAPER (67-74)
    GX = 9000
    chapter(7, GX, TOP_B, "THE PAPER", L(67) - 0.1)
    kh = P("KHATA", GX - 1300, R0 + 1700, 3600, L(68) - 0.1, rot=-0.5)
    ax_, ay_ = doc.on(kh, 0.27, 0.27)
    bx_, by_ = doc.on(kh, 0.74, 0.27)
    add(PenMark("ellipse", ax_, ay_, 1700, 620, t_in=W(69, "A-khata") - 0.2, dur=0.5, width=26, rgb=ACC, seed=15))
    add(PenMark("ellipse", bx_, by_, 1700, 620, t_in=W(69, "B-khata") - 0.2, dur=0.5, width=26, rgb=ACC, seed=16))
    P("EKHATA", GX + 2600, R0 + 600, 2500, L(70) - 0.1, rot=1.2, label="E-KHATA · BENGALURU", label_t=W(70, "register") - 0.2)
    P("SANCTION", GX + 2600, R0 + 3300, 2400, L(71) - 0.1, rot=-1.0, label="SANCTIONED PLAN", label_t=W(71, "plan") - 0.1)
    P("OC", GX + 5700, R0 + 1900, 2200, W(71, "occupancy") - 0.2, rot=1.5, label="OCCUPANCY CERTIFICATE", label_t=W(71, "certificate") - 0.1)
    label("MANY CITIES: BEFORE PERMANENT CONNECTIONS", GX + 5700, R0 + 3700, 150, W(72, "permanent") - 0.3, rgb=INK)
    add(Stamp("LEAK #7: PAPER", GX - 1300, R0 + 2300, 330, rot=-6, t_in=W(73, "wrong") - 0.05))

    S(E(66) + 1.4, GX, TOP_B + 2100, 0.55)
    S(L(67) + 1.0, GX, TOP_B + 2300, 0.58)
    H(L(68) - 0.1)
    S(L(68) + 0.3, GX - 1300, R0 + 1700, 0.6)
    S(W(69, "A-khata"), GX - 1900, R0 + 1200, 0.7)
    S(W(69, "B-khata"), GX - 700, R0 + 1300, 0.68)
    S(E(69), GX - 1100, R0 + 1500, 0.62)
    S(L(70) + 0.3, GX + 2600, R0 + 600, 0.66)
    S(E(70), GX + 2600, R0 + 700, 0.66)
    S(L(71) + 0.3, GX + 2600, R0 + 3300, 0.64)
    S(W(71, "occupancy") + 0.3, GX + 4400, R0 + 2600, 0.52)
    S(E(71), GX + 5300, R0 + 2300, 0.6)
    S(L(72) + 0.2, GX + 5700, R0 + 2500, 0.6)
    S(E(72), GX + 5700, R0 + 2700, 0.6)
    S(L(73) + 0.4, GX + 1200, R0 + 2400, 0.36, r=6500, s=0.3)
    S(W(73, "wrong") + 0.3, GX - 1300, R0 + 2700, 0.46)
    S(E(74) + 0.4, GX - 1300, R0 + 3000, 0.48)

    # ============================================================ THE FIX (75-83)
    HX = -2500
    label("SCREENSHOT THIS", HX, TOP_B + 900, 300, L(75) + 0.5, rgb=INK, bar=HILITE, bar_h=0.92)
    qs = ["Rate on built-up or carpet area?", "What's not included in this rate?", "Has the soil been tested?",
          "Which brand and grade of every material?", "Who checks the concrete and the curing?",
          "Are the khata and the plan sanction clear?"]
    ck = add(ListCard(HX, TOP_B + 1400, 6400, "6 QUESTIONS BEFORE YOU SIGN",
                      [(f"{k + 1}.  {q}", W(76 + k, q.split()[0].rstrip("'?").split("'")[0]) - 0.1) for k, q in enumerate(qs)],
                      L(75) + 0.2, row_h=560, title_size=280, body_size=220))
    label("buynbuild.blog", HX, ck.top + ck.h + 1500, 700, W(83, "buy") - 0.2, rgb=ACC, hit=0.4)
    label("PRICES · CALCULATORS · CHECKLISTS FOR YOUR DISTRICT", HX, ck.top + ck.h + 2000, 170, W(83, "buy") + 0.4, rgb=GREY)

    S(E(74) + 1.4, HX, TOP_B + 1500, 0.46)
    S(L(75) + 0.8, HX, ck.y - 1100, 0.4)
    H(L(76) - 0.1)
    for k in range(6):
        S(L(76 + k) + 0.15, HX, ck.row_y(k) + 250, 0.5)
    S(E(81) + 0.2, HX, ck.y, 0.46)
    S(L(82) + 0.8, 21000, 7800, 0.07, r=60000, s=0.05)
    S(E(82), 20500, 7900, 0.068, r=60000, s=0.05)
    S(W(83, "buy") + 0.4, HX, ck.top + ck.h + 1200, 0.5)
    S(film.duration, HX, ck.top + ck.h + 1300, 0.52)

    # ============================================================ LEAK METER (screen space)
    film.hud = [LeakMeter(
        W(3, "Eighteen") - 0.2,
        keys=[(0, 2500000, 0), (W(3, "months"), 3000000, 2.2), (W(5, "where"), None, 0), (L(9), 2500000, 0),
              (W(32, "three"), 2800000, 1.2), (W(37, "two"), 3024000, 1.4)],
        flashes=[],
        plus_t=W(39, "push"), plus_pulses=[L(40), L(44), L(57), L(63), L(67)],
        hide=[(L(8) + 0.1, L(9) - 0.3)])]
    for t, g in ((W(3, "months"), 0.5), (W(32, "three"), 0.5), (W(37, "two"), 0.5)):
        cue("ticks", t, g)

    film.fade_in, film.fade_out = 0.6, 1.6
    return film
