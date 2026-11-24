"""R12 · Paper Trail · "Encumbrance certificate". cinematic-film engine (Skia), document-board look (cork desk).

One continuous camera over a desk of SAMPLE papers. Every document is code-drawn: placeholder fields
(DD/MM/YYYY, SAMPLE OWNER, SITE NO. XX), a SAMPLE watermark, no real formats, seals, emblems, names or numbers.
Beats land on the spoken word via doc.W(line, word) (letter-share estimate of the Kokoro am_michael VO).
"""
import math

import numpy as np
import skia
from engine import (Film, Item, PenMark, Stamp, StringLine, draw_label, draw_pin, draw_text, drop_anim,
                    ease_in_out, ease_out_cubic, paint, paper_fill, ramp, rot_point, text_width, INK, LOOKS)

RED = (168, 26, 22)
ORANGE = (239, 75, 6)          # BNB orange #EF4B06: one idea per beat
GREEN = (28, 112, 58)
GREY = (150, 140, 124)
SUB = (96, 86, 74)
S = 1080 / 3840.0


def tape(c, x, y, w, h, rot, a):
    c.save(); c.translate(x, y); c.rotate(rot)
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 4, -h / 2 + 8, w, h), paint((0, 0, 0), 0.18 * a, blur=8))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), paint((226, 214, 178), 0.78 * a))
    c.restore()


class Sheet(Item):
    """Paper sheet that drops onto the desk; subclasses draw contents in local coords (origin = centre)."""
    z = 12

    def __init__(self, x, y, w, h, rot, t_in, z=None):
        super().__init__(t_in, None, z)
        self.x, self.y, self.w, self.h, self.rot = x, y, w, h, rot

    def bounds(self, res):
        r = max(self.w, self.h) * 0.8 + 300
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("pop", self.t_in, 0.8, {})]

    def world(self, lx, ly):
        return rot_point(self.x, self.y, lx, ly, self.rot)

    def draw(self, c, res, t):
        s, a, lift = drop_anim(t, self.t_in, 0.45)
        if a <= 0:
            return
        W, H = self.w, self.h
        c.save(); c.translate(self.x, self.y); c.rotate(self.rot + 3 * lift); c.scale(s, s)
        off = 18 + 70 * lift
        c.drawRect(skia.Rect.MakeXYWH(-W / 2 + off * 0.4, -H / 2 + off, W, H), paint((0, 0, 0), 0.55 * a, blur=22 + 50 * lift))
        rect = skia.Rect.MakeXYWH(-W / 2, -H / 2, W, H)
        paper_fill(c, res, rect, a, 1.0)
        self.contents(c, res, t, a)
        c.save(); c.clipRect(rect); c.rotate(-32)
        tw = text_width(res, "SAMPLE", W * 0.34, "cond", 0.08)
        draw_text(c, res, "SAMPLE", -tw / 2, W * 0.12, W * 0.34, "cond", RED, 0.11 * a, 0.08)
        c.restore()
        c.restore()

    def contents(self, c, res, t, a):
        pass


class ECert(Sheet):
    """Generic 'ENCUMBRANCE CERTIFICATE (SAMPLE)': field block, a Transaction / Date / Parties table and a
    'period covered' strip with one empty stretch (the gap)."""
    L_, R_ = -880, 880
    FIELDS = [("PROPERTY", "SAMPLE PROPERTY, SITE NO. XX"), ("OWNER", "SAMPLE OWNER"), ("PERIOD", "DD/MM/YYYY  TO  DD/MM/YYYY")]
    F0, FS = -650, 125
    ROWS = [("SALE DEED", ("SAMPLE SELLER", "TO SAMPLE OWNER")), ("MORTGAGE", ("SAMPLE OWNER", "TO SAMPLE LENDER"))]
    T0, TS = -110, 190            # table header y, row step
    STRIP_Y, NSEG, GAP_SEG = 560, 8, 5
    COLS = (0, 610, 1080)         # column x offsets from L_

    def field_y(self, i):
        return self.F0 + i * self.FS

    def row_y(self, i):
        return self.T0 + (i + 1) * self.TS

    def seg_x(self, k):
        return self.L_ + (self.R_ - self.L_) * k / self.NSEG

    def contents(self, c, res, t, a):
        L, R = self.L_, self.R_
        H = self.h
        tape(c, 0, -H / 2 + 10, 520, 120, -3, a)
        draw_text(c, res, "ENCUMBRANCE", L, -H / 2 + 300, 176, "label", INK, a, 0.02)
        draw_text(c, res, "CERTIFICATE", L, -H / 2 + 480, 176, "label", INK, a, 0.02)
        bw = 440
        c.drawRect(skia.Rect.MakeXYWH(R - bw, -H / 2 + 345, bw, 150), paint(RED, 0.85 * a, stroke=10))
        draw_text(c, res, "(SAMPLE)", R - bw / 2, -H / 2 + 460, 120, "cond", RED, 0.85 * a, 0.06, "center")
        draw_text(c, res, "RECORD OF REGISTERED TRANSACTIONS  ·  SAMPLE FORMAT", L, -H / 2 + 580, 46, "mono", SUB, a, 0.03)
        c.drawLine(L, -H / 2 + 630, R, -H / 2 + 630, paint(INK, 0.8 * a, stroke=8))
        c.drawLine(L, -H / 2 + 655, R, -H / 2 + 655, paint(INK, 0.5 * a, stroke=3))
        for i, (lab, val) in enumerate(self.FIELDS):
            y = self.field_y(i)
            draw_text(c, res, lab, L, y, 60, "label", (70, 62, 54), a, 0.03)
            bx = L + 400
            c.drawRect(skia.Rect.MakeLTRB(bx, y - 88, R, y + 30), paint((120, 110, 96), 0.5 * a, stroke=4))
            draw_text(c, res, val, bx + 30, y, 74, "mono", INK, 0.92 * a, 0.0)
        # table
        y0 = self.T0
        c.drawRect(skia.Rect.MakeLTRB(L, y0 - 75, R, y0 + 35), paint(INK, 0.86 * a))
        for k, h in enumerate(("TRANSACTION", "DATE", "PARTIES")):
            draw_text(c, res, h, L + self.COLS[k] + 26, y0 + 2, 52, "label", (244, 238, 224), a, 0.05)
        for i, (kind, parties) in enumerate(self.ROWS):
            y = self.row_y(i)
            draw_text(c, res, kind, L + 26, y, 70, "label", INK, a, 0.02)
            draw_text(c, res, "DD/MM/YYYY", L + self.COLS[1] + 26, y, 60, "mono", INK, 0.9 * a)
            draw_text(c, res, parties[0], L + self.COLS[2] + 20, y - 34, 50, "mono", INK, 0.9 * a)
            draw_text(c, res, parties[1], L + self.COLS[2] + 20, y + 34, 50, "mono", INK, 0.9 * a)
            c.drawLine(L, y + 75, R, y + 75, paint((120, 110, 96), 0.55 * a, stroke=3))
        for x in (L + self.COLS[1], L + self.COLS[2]):
            c.drawLine(x, y0 - 75, x, self.row_y(1) + 75, paint((120, 110, 96), 0.45 * a, stroke=3))
        # period-covered strip with one empty stretch
        sy = self.STRIP_Y
        draw_text(c, res, "PERIOD COVERED", L, sy - 70, 54, "label", (70, 62, 54), a, 0.05)
        for k in range(self.NSEG):
            x0, x1 = self.seg_x(k) + 6, self.seg_x(k + 1) - 6
            r = skia.Rect.MakeLTRB(x0, sy, x1, sy + 90)
            if k == self.GAP_SEG:
                pp = paint((120, 110, 96), 0.7 * a, stroke=4)
                pp.setPathEffect(skia.DashPathEffect.Make([18, 12], 0))
                c.drawRect(r, pp)
            else:
                c.drawRect(r, paint((92, 104, 120), 0.55 * a))
        draw_text(c, res, "FROM", L, sy + 160, 44, "mono", SUB, a)
        draw_text(c, res, "TO", R, sy + 160, 44, "mono", SUB, a, 0, "right")
        # remarks + footer
        draw_text(c, res, "REMARKS", L, 920, 54, "label", (70, 62, 54), a, 0.05)
        for k, ln in enumerate((0.92, 0.7)):
            c.drawLine(L, 1000 + k * 80, L + (R - L) * ln, 1000 + k * 80, paint(GREY, 0.5 * a, stroke=22))
        c.drawLine(L, 1200, R, 1200, paint(INK, 0.5 * a, stroke=3))
        draw_text(c, res, "FOR ILLUSTRATION ONLY  ·  NOT A REAL RECORD", 0, 1290, 48, "mono", (110, 98, 86), a, 0.03, "center")


class Agreement(Sheet):
    """Generic sale-agreement page with SELLER / PROPERTY rows to compare against the EC."""
    L_ = -700

    def row_y(self, i):
        return (-560, -380, -150)[i]

    def contents(self, c, res, t, a):
        W, H = self.w, self.h
        L, R = self.L_, W / 2 - 120
        draw_pin(c, 0, -H / 2 + 70, r=40, a=a)
        draw_text(c, res, "AGREEMENT FOR SALE", 0, -H / 2 + 280, 118, "serif", INK, a, 0.03, "center")
        draw_text(c, res, "SAMPLE PAGE  ·  FOR ILLUSTRATION ONLY", 0, -H / 2 + 380, 50, "mono", (110, 98, 86), a, 0.04, "center")
        c.drawLine(L, -H / 2 + 440, R, -H / 2 + 440, paint(INK, 0.6 * a, stroke=4))
        y = self.row_y(0)
        draw_text(c, res, "SELLER :", L, y, 62, "label", INK, a, 0.02)
        draw_text(c, res, "SAMPLE OWNER", L + 360, y, 74, "mono", INK, 0.95 * a)
        y = self.row_y(1)
        draw_text(c, res, "PROPERTY :", L, y, 62, "label", INK, a, 0.02)
        draw_text(c, res, "SAMPLE PROPERTY,", L + 360, y, 74, "mono", INK, 0.95 * a)
        draw_text(c, res, "SITE NO. XX", L + 360, y + 92, 74, "mono", INK, 0.95 * a)
        y = self.row_y(2) + 60
        draw_text(c, res, "BUYER :", L, y, 62, "label", INK, a, 0.02)
        c.drawLine(L + 360, y + 10, R, y + 10, paint((120, 110, 96), 0.7 * a, stroke=4))
        rng = np.random.default_rng(5)
        for i in range(8):
            yy = 120 + i * 105
            c.drawLine(L, yy, L + (R - L) * rng.uniform(0.6, 0.98), yy, paint(GREY, 0.5 * a, stroke=22))
        ys = H / 2 - 200
        for k, lab in enumerate(("SELLER", "BUYER")):
            x0 = L + k * 760
            c.drawLine(x0, ys, x0 + 560, ys, paint(INK, 0.6 * a, stroke=4))
            draw_text(c, res, lab, x0, ys + 66, 46, "mono", (110, 98, 86), a, 0.04)


class Sticky(Item):
    z = 14

    def __init__(self, x, y, size, rot, t_in, lines):
        super().__init__(t_in)
        self.x, self.y, self.size, self.rot, self.lines = x, y, size, rot, lines

    def bounds(self, res):
        r = self.size
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("pop", self.t_in, 0.7, {})]

    def draw(self, c, res, t):
        s, a, lift = drop_anim(t, self.t_in, 0.4)
        if a <= 0:
            return
        S_ = self.size
        c.save(); c.translate(self.x, self.y); c.rotate(self.rot + 4 * lift); c.scale(s, s)
        c.drawRect(skia.Rect.MakeXYWH(-S_ / 2 + 14, -S_ / 2 + 30 + 60 * lift, S_, S_), paint((0, 0, 0), 0.5 * a, blur=26))
        r = skia.Rect.MakeXYWH(-S_ / 2, -S_ / 2, S_, S_)
        paper_fill(c, res, r, a)
        c.drawRect(r, paint((246, 214, 92), 0.82 * a))
        c.drawRect(skia.Rect.MakeXYWH(-S_ / 2, -S_ / 2, S_, S_ * 0.12), paint((222, 186, 70), 0.5 * a))
        draw_pin(c, 0, -S_ / 2 + 70, r=40, a=a)
        for txt, yy, size in self.lines:
            draw_text(c, res, txt, 0, yy, size, "marker", (30, 28, 34), 0.92 * a, 0.01, "center")
        c.restore()


class Advocate(Item):
    """Kraft card: YOUR ADVOCATE with a simple balance-scale glyph (no person, no face, no emblem)."""
    z = 13

    def __init__(self, x, y, w, h, rot, t_in):
        super().__init__(t_in)
        self.x, self.y, self.w, self.h, self.rot = x, y, w, h, rot

    def bounds(self, res):
        r = max(self.w, self.h) + 200
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("pop", self.t_in, 0.8, {})]

    def draw(self, c, res, t):
        s, a, lift = drop_anim(t, self.t_in, 0.45)
        if a <= 0:
            return
        W, H = self.w, self.h
        c.save(); c.translate(self.x, self.y); c.rotate(self.rot + 3 * lift); c.scale(s, s)
        r = skia.Rect.MakeXYWH(-W / 2, -H / 2, W, H)
        c.drawRect(r.makeOffset(16, 30 + 60 * lift), paint((0, 0, 0), 0.5 * a, blur=24))
        paper_fill(c, res, r, a)
        c.drawRect(r, paint((176, 136, 86), 0.62 * a))
        draw_pin(c, -W / 2 + 80, -H / 2 + 80, r=38, rgb=(40, 80, 140), a=a)
        # balance scale glyph
        gx, gy, k = -W / 2 + 330, 40, 1.15
        ink = paint((52, 36, 22), 0.9 * a, stroke=22)
        ink.setStrokeCap(skia.Paint.kRound_Cap)
        c.drawLine(gx, gy - 200 * k, gx, gy + 190 * k, ink)
        c.drawLine(gx - 190 * k, gy - 150 * k, gx + 190 * k, gy - 150 * k, ink)
        c.drawLine(gx - 120 * k, gy + 190 * k, gx + 120 * k, gy + 190 * k, ink)
        thin = paint((52, 36, 22), 0.9 * a, stroke=9)
        for sx in (-1, 1):
            px = gx + sx * 175 * k
            c.drawLine(px, gy - 150 * k, px - 80 * k, gy + 20 * k, thin)
            c.drawLine(px, gy - 150 * k, px + 80 * k, gy + 20 * k, thin)
            p = skia.Path(); p.moveTo(px - 100 * k, gy + 20 * k); p.quadTo(px, gy + 110 * k, px + 100 * k, gy + 20 * k); p.close()
            c.drawPath(p, paint((52, 36, 22), 0.9 * a))
        c.drawCircle(gx, gy - 215 * k, 26, paint((52, 36, 22), 0.9 * a))
        tx = -W / 2 + 640
        draw_text(c, res, "YOUR", tx, -60, 150, "cond", (52, 36, 22), 0.92 * a, 0.06)
        draw_text(c, res, "ADVOCATE", tx, 110, 150, "cond", (52, 36, 22), 0.92 * a, 0.06)
        draw_text(c, res, "SHOW THE EC FIRST", tx, 230, 56, "mono", (70, 50, 32), 0.85 * a, 0.04)
        c.restore()


class Envelope(Item):
    """Plain paper envelope 'TOKEN' with an orange HOLD band that wraps on at t_band."""
    z = 13

    def __init__(self, x, y, w, h, rot, t_in, t_band):
        super().__init__(t_in)
        self.x, self.y, self.w, self.h, self.rot, self.t_band = x, y, w, h, rot, t_band

    def bounds(self, res):
        r = max(self.w, self.h) + 200
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("pop", self.t_in, 0.7, {}), ("slide", self.t_band, 0.8, {})]

    def draw(self, c, res, t):
        s, a, lift = drop_anim(t, self.t_in, 0.45)
        if a <= 0:
            return
        W, H = self.w, self.h
        c.save(); c.translate(self.x, self.y); c.rotate(self.rot + 3 * lift); c.scale(s, s)
        r = skia.Rect.MakeXYWH(-W / 2, -H / 2, W, H)
        c.drawRect(r.makeOffset(16, 30 + 60 * lift), paint((0, 0, 0), 0.5 * a, blur=24))
        paper_fill(c, res, r, a)
        c.drawRect(r, paint((214, 196, 160), 0.55 * a))
        fl = skia.Path(); fl.moveTo(-W / 2, -H / 2); fl.lineTo(0, 40); fl.lineTo(W / 2, -H / 2)
        c.drawPath(fl, paint((120, 100, 70), 0.6 * a, stroke=8))
        draw_text(c, res, "TOKEN", 0, H / 2 - 120, 150, "cond", (60, 44, 30), 0.9 * a, 0.1, "center")
        u = ease_out_cubic(ramp(t, self.t_band, 0.35))
        if u > 0:
            bh = 190
            c.save(); c.rotate(-8)
            c.drawRect(skia.Rect.MakeXYWH(-W * 0.62 + 10, -bh / 2 + 16, W * 1.24 * u, bh), paint((0, 0, 0), 0.35 * a, blur=10))
            c.drawRect(skia.Rect.MakeXYWH(-W * 0.62, -bh / 2, W * 1.24 * u, bh), paint(ORANGE, 0.96 * a))
            c.clipRect(skia.Rect.MakeXYWH(-W * 0.62, -bh / 2, W * 1.24 * u, bh))
            draw_text(c, res, "HOLD", 0, 52, 150, "cond", (255, 246, 236), a, 0.18, "center")
            c.restore()
        c.restore()


class IndexCard(Item):
    """White ruled index card with typed lines (the on-screen disclaimer)."""
    z = 15

    def __init__(self, x, y, w, h, rot, t_in, lines, size=104):
        super().__init__(t_in)
        self.x, self.y, self.w, self.h, self.rot, self.lines, self.size = x, y, w, h, rot, lines, size

    def bounds(self, res):
        r = max(self.w, self.h) + 200
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("pop", self.t_in, 0.7, {})]

    def draw(self, c, res, t):
        s, a, lift = drop_anim(t, self.t_in, 0.45)
        if a <= 0:
            return
        W, H = self.w, self.h
        c.save(); c.translate(self.x, self.y); c.rotate(self.rot + 3 * lift); c.scale(s, s)
        r = skia.Rect.MakeXYWH(-W / 2, -H / 2, W, H)
        c.drawRect(r.makeOffset(16, 30 + 60 * lift), paint((0, 0, 0), 0.5 * a, blur=24))
        paper_fill(c, res, r, a)
        c.drawRect(r, paint((255, 255, 255), 0.35 * a))
        c.drawLine(-W / 2, -H / 2 + 170, W / 2, -H / 2 + 170, paint(RED, 0.55 * a, stroke=5))
        for k in range(1, 6):
            yy = -H / 2 + 170 + k * 150
            if yy < H / 2 - 40:
                c.drawLine(-W / 2, yy, W / 2, yy, paint((90, 130, 190), 0.35 * a, stroke=3))
        tape(c, -W / 2 + 120, -H / 2 + 10, 300, 100, -12, a)
        tape(c, W / 2 - 120, -H / 2 + 10, 300, 100, 10, a)
        draw_text(c, res, "PLEASE NOTE", -W / 2 + 120, -H / 2 + 130, 64, "label", SUB, a, 0.08)
        for i, ln in enumerate(self.lines):
            reveal = len(ln) * ramp(t, self.t_in + 0.35 + 0.55 * i, 0.55)
            draw_text(c, res, ln, -W / 2 + 120, -H / 2 + 300 + i * 150, self.size, "mono", INK, 0.95 * a, 0.0, "left", reveal)
        c.restore()


class Tick(Item):
    """Hand-drawn check mark in green ink, drawn on at t_in."""
    z = 55

    def __init__(self, x, y, size, t_in, rgb=GREEN, width=30):
        super().__init__(t_in)
        self.x, self.y, self.size, self.rgb, self.wd = x, y, size, rgb, width
        s = size
        p = skia.Path(); p.moveTo(-0.5 * s, 0.02 * s); p.lineTo(-0.12 * s, 0.4 * s); p.quadTo(0.1 * s, -0.1 * s, 0.6 * s, -0.5 * s)
        self.p = p

    def cues(self):
        return [("tick", self.t_in, 0.8, {})]

    def draw(self, c, res, t):
        from engine import partial_path
        u = ease_out_cubic(ramp(t, self.t_in, 0.28))
        if u <= 0:
            return
        c.save(); c.translate(self.x, self.y)
        pp = paint(self.rgb, 0.92, stroke=self.wd); pp.setStrokeCap(skia.Paint.kRound_Cap); pp.setStrokeJoin(skia.Paint.kRound_Join)
        c.drawPath(partial_path(self.p, u), pp)
        c.restore()


class Tag(Item):
    """Colour-bar label (draw_label) that wipes in at t_in."""
    z = 75

    def __init__(self, text, x, y, size, rot, t_in, rgb=ORANGE, t_out=None):
        super().__init__(t_in, t_out)
        self.text, self.x, self.y, self.size, self.rot, self.rgb = text, x, y, size, rot, rgb

    def bounds(self, res):
        r = len(self.text) * self.size
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("slide", self.t_in, 0.6, {})]

    def draw(self, c, res, t):
        u = ramp(t, self.t_in, 0.4)
        if u <= 0:
            return
        draw_label(c, res, self.text, self.x, self.y, self.fade(t), self.size, self.rot, u, rgb=self.rgb)


def build_film(doc):
    L, E, W = doc.L, doc.E, doc.W
    look = dict(LOOKS["wall"]); look["board"] = "cork.png"; look["vignette"] = 0.55; look["dim"] = (8, 5, 3)
    film = Film(doc.duration, fps=30, look=look)
    film.fade_in, film.fade_out = 0.0, 0.0

    # ---- L01: the token question, then the EC drops
    film.add(Sticky(-300, -2950, 1250, -4, 0.15, [("PAYING A", -40, 190), ("TOKEN?", 210, 240)]))
    film.add(PenMark("ellipse", -300 + 25, -2950 + 180, 900, 330, t_in=W(1, "token") - 0.05, dur=0.5, width=26, rot=-4,
                     seed=3, rgb=ORANGE))
    ec = film.add(ECert(-450, 0, 2000, 2800, -1.5, W(1, "encumbrance") - 0.25))
    film.add(PenMark("underline", *ec.world(-880 + 560, -1400 + 330), 1150, 30, t_in=W(1, "certificate") + 0.1, dur=0.45,
                     width=22, rot=-1.5, seed=4))

    # ---- L02: what it records
    for i, word in ((0, "sales"), (1, "mortgages")):
        hx, hy = ec.world(0, ec.row_y(i) - 18)
        film.add(PenMark("highlight", hx, hy, 1720, t_in=W(2, word) - 0.1, dur=0.45, width=118, rot=-1.5, seed=6 + i, z=13))
    px, py = ec.world(-880 + 400 + 30 + 640, ec.field_y(2) + 30)
    film.add(PenMark("underline", px, py, 1260, 26, t_in=W(2, "period") - 0.05, dur=0.5, width=20, rot=-1.5, seed=9))

    # ---- L03: mortgaged / sold before (orange findings)
    for i, word, lab, ly in ((1, "mortgaged", "ALREADY MORTGAGED?", 40), (0, "sold", "SOLD BEFORE?", -150)):
        ex, ey = ec.world(-880 + 300, ec.row_y(i) - 10)
        film.add(PenMark("ellipse", ex, ey, 640, 200, t_in=W(3, word) - 0.08, dur=0.45, width=20, rot=-2, seed=11 + i, rgb=ORANGE))
    mx, my = ec.world(330, ec.row_y(1) + 150)
    film.add(Tag("ALREADY MORTGAGED?", mx, my, 100, -3, W(3, "mortgaged") + 0.15, t_out=E(3) + 0.3))
    sx, sy = ec.world(420, ec.row_y(0) - 235)
    film.add(Tag("SOLD BEFORE?", sx, sy, 100, 2, W(3, "sold") + 0.15, t_out=E(3) + 0.3))

    # ---- L04: names and details match the agreement
    ag = film.add(Agreement(1250, -150, 1700, 2300, 2.0, L(4) - 0.15, z=16))
    e_own = ec.world(-880 + 400 + 30 + 300, ec.field_y(1) - 22)
    a_own = ag.world(-700 + 360 + 270, ag.row_y(0) - 22)
    film.add(PenMark("highlight", *e_own, 640, t_in=W(4, "owner") - 0.1, dur=0.4, width=110, rot=-1.5, seed=21, z=13))
    film.add(PenMark("highlight", *a_own, 600, t_in=W(4, "name") - 0.1, dur=0.4, width=110, rot=2, seed=22, z=17))
    film.add(StringLine(ec.world(-880 + 400 + 30 + 640, ec.field_y(1) - 22), ag.world(-700 + 330, ag.row_y(0) - 22),
                        W(4, "name") + 0.05, dur=0.4, sag=0.05, width=12, persist=False, hold=3.2))
    e_pr = ec.world(-880 + 400 + 30 + 640, ec.field_y(0) - 22)
    a_pr = ag.world(-700 + 360 + 320, ag.row_y(1) + 25)
    film.add(PenMark("highlight", *e_pr, 1280, t_in=W(4, "property") - 0.1, dur=0.45, width=110, rot=-1.5, seed=23, z=13))
    film.add(PenMark("highlight", a_pr[0], a_pr[1] - 46, 680, t_in=W(4, "details") - 0.1, dur=0.4, width=100, rot=2, seed=24, z=17))
    film.add(PenMark("highlight", a_pr[0] - 90, a_pr[1] + 46, 500, t_in=W(4, "details"), dur=0.35, width=100, rot=2, seed=25, z=17))
    tm = W(4, "match")
    film.add(Tick(*ag.world(330, ag.row_y(0) - 30), 160, tm))
    film.add(Tick(*ag.world(500, ag.row_y(1) - 30), 160, tm + 0.25))

    # ---- L05: a gap in the record -> STOP, ASK WHY (the one slam)
    gx, gy = ec.world((ec.seg_x(ec.GAP_SEG) + ec.seg_x(ec.GAP_SEG + 1)) / 2, ec.STRIP_Y + 45)
    film.add(PenMark("ellipse", gx, gy, 380, 230, t_in=W(5, "gaps") - 0.1, dur=0.45, width=22, rot=-1.5, seed=31, rgb=ORANGE))
    film.add(Tag("GAP IN THE RECORD", gx - 330, gy - 300, 96, -2, W(5, "gaps") + 0.15, rgb=ORANGE))
    film.add(Stamp("STOP. ASK WHY.", *ec.world(0, 1010), size=190, rot=-7, t_in=W(5, "stop") - 0.04, rgb=RED))

    # ---- L06: hand it to the advocate before money moves
    adv = film.add(Advocate(0, 3350, 1900, 900, -2, W(6, "advocate") - 0.2))
    film.add(StringLine(ec.world(-500, 1300), (0 - 950 + 80, 3350 - 450 + 80), W(6, "show") - 0.05, dur=0.6, sag=0.04, width=12,
                        persist=True))
    film.add(Envelope(1580, 3250, 1100, 700, 5, W(6, "money") - 0.35, W(6, "moves") - 0.05))

    # ---- L07: disclaimer card (on screen for the whole line)
    film.add(IndexCard(250, 4600, 2500, 1040, 1.2, L(7) - 0.1,
                       ["GENERAL GUIDANCE,", "NOT LEGAL ADVICE.", "CONFIRM WITH YOUR ADVOCATE."], size=118))

    # ---- camera (subjects sit at screen y~790: inside the 230-1340 content band)
    def shot(t, x, y, z, rad=None, st=0.5, rot=0.0):
        film.cam(t, x, y + 170 / (z * S), z, rot)
        film.focus(t, x, y, rad or 1500 / z, st)

    shot(0.0, -300, -2900, 1.7, st=0.45, rot=-0.6)
    shot(W(1, "token") + 0.4, -290, -2860, 1.95, st=0.5)
    shot(W(1, "encumbrance") + 0.35, -450, -420, 1.3, st=0.45, rot=0.4)
    shot(E(1) + 0.1, -460, -560, 1.45, st=0.45)
    shot(L(2) + 0.9, -450, -250, 1.55, st=0.45)
    shot(W(2, "sales") + 0.1, -450, ec.row_y(0) + 40, 1.8, st=0.5, rot=-0.4)
    shot(W(2, "mortgages") + 0.2, -450, ec.row_y(1) + 20, 1.85, st=0.5)
    shot(W(2, "period") + 0.1, -330, ec.field_y(2) + 40, 1.75, st=0.5, rot=0.3)
    shot(E(2), -350, ec.field_y(2) + 60, 1.7, st=0.5)
    shot(L(3) + 0.35, -350, ec.row_y(0) + 60, 1.6, st=0.45)
    shot(E(3), -330, ec.row_y(0) + 30, 1.55, st=0.45)
    shot(L(4) + 0.35, 280, -520, 1.12, rad=2800, st=0.4)
    shot(W(4, "details") + 0.1, 300, -420, 1.15, rad=2800, st=0.4, rot=-0.3)
    shot(E(4) + 0.1, 280, -440, 1.12, rad=2800, st=0.4)
    shot(L(5) + 0.4, -450, 700, 1.5, st=0.45)
    shot(W(5, "stop") + 0.3, -450, 820, 1.42, st=0.45, rot=0.4)
    shot(E(5) + 0.1, -430, 830, 1.4, st=0.45)
    shot(L(6) + 0.5, 560, 3250, 1.16, rad=3000, st=0.4)
    shot(E(6), 580, 3280, 1.2, rad=3000, st=0.4)
    shot(L(7) + 0.5, 250, 4450, 1.3, rad=2800, st=0.4, rot=-0.3)
    shot(E(7) - 0.2, 250, 4400, 1.36, rad=2800, st=0.4)
    shot(L(8) + 0.6, 250, 1500, 0.58, rad=9000, st=0.25)
    shot(doc.duration, 250, 1450, 0.55, rad=9000, st=0.25)
    return film
