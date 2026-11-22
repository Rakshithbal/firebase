"""STYLE 01 - Document board. cinematic-film engine (Skia), "wall" look (dark cork evidence board).

VO  L1 "Before you pay an advance, ask for the e-khata,"
    L2 "and check that the owner's name matches the seller."
Every document is a code-drawn SAMPLE: placeholder fields, a SAMPLE watermark, no real names,
no real numbers, no emblems or logos.
"""
import math

import numpy as np
import skia
from engine import (Film, Item, PenMark, Stamp, StringLine, draw_label, draw_pin, draw_text, drop_anim,
                    ease_in_out, ease_out_cubic, paint, paper_fill, ramp, rot_point, text_width, INK, LOOKS)

RED = (168, 26, 22)
GREY = (150, 140, 124)
S = 1080 / 3840.0          # render scale at zoom 1 (1080-wide frame)


def tape(c, x, y, w, h, rot, a):
    c.save(); c.translate(x, y); c.rotate(rot)
    c.drawRect(skia.Rect.MakeXYWH(-w / 2 + 4, -h / 2 + 8, w, h), paint((0, 0, 0), 0.18 * a, blur=8))
    c.drawRect(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), paint((226, 214, 178), 0.78 * a))
    c.restore()


class Sheet(Item):
    """Paper sheet that drops onto the board with a shadow; subclasses draw the contents in local coords."""
    z = 12

    def __init__(self, x, y, w, h, rot, t_in, z=None, tint=None):
        super().__init__(t_in, None, z)
        self.x, self.y, self.w, self.h, self.rot, self.tint = x, y, w, h, rot, tint

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
        if self.tint:
            c.drawRect(rect, paint(self.tint, 0.22 * a))
        self.contents(c, res, t, a)
        # SAMPLE watermark, printed diagonally across the sheet
        c.save(); c.clipRect(rect); c.rotate(-32)
        wp = paint(RED, 0.13 * a)
        f = res.font("cond", W * 0.36)
        tw = text_width(res, "SAMPLE", W * 0.36, "cond", 0.08)
        draw_text(c, res, "SAMPLE", -tw / 2, W * 0.12, W * 0.36, "cond", RED, 0.13 * a, 0.08)
        c.restore()
        c.restore()

    def contents(self, c, res, t, a):
        pass


class EKhata(Sheet):
    """A generic 'E-KHATA - SAMPLE' property-record form with placeholder fields."""
    ROW0, STEP = 820, 260
    FIELDS = [("PROPERTY ID", "XXXX - XXXX - XXXX"), ("OWNER'S NAME", "SAMPLE OWNER"), ("ADDRESS", None),
              ("PROPERTY TYPE", "-  -  -"), ("SITE AREA", "-  -  -"), ("ISSUED ON", "DD / MM / YYYY")]

    def row_y(self, i):
        return -self.h / 2 + self.ROW0 + i * self.STEP

    def contents(self, c, res, t, a):
        W, H = self.w, self.h
        L, R = -W / 2 + 120, W / 2 - 120
        tape(c, 0, -H / 2 + 10, 520, 120, -3, a)
        draw_text(c, res, "E-KHATA", L, -H / 2 + 330, 210, "label", INK, a, 0.02)
        draw_text(c, res, "PROPERTY RECORD  ·  SAMPLE FORMAT", L, -H / 2 + 440, 58, "mono", (90, 80, 70), a, 0.04)
        # printed SAMPLE box, top right
        bw = 470
        c.drawRect(skia.Rect.MakeXYWH(R - bw, -H / 2 + 175, bw, 175), paint(RED, 0.85 * a, stroke=10))
        draw_text(c, res, "SAMPLE", R - bw / 2, -H / 2 + 315, 150, "cond", RED, 0.85 * a, 0.08, "center")
        c.drawLine(L, -H / 2 + 520, R, -H / 2 + 520, paint(INK, 0.8 * a, stroke=8))
        c.drawLine(L, -H / 2 + 548, R, -H / 2 + 548, paint(INK, 0.5 * a, stroke=3))
        for i, (lab, val) in enumerate(self.FIELDS):
            y = self.row_y(i)
            draw_text(c, res, lab, L, y, 62, "label", (70, 62, 54), a, 0.03)
            bx = L + 620
            c.drawRect(skia.Rect.MakeLTRB(bx, y - 105, R, y + 40), paint((120, 110, 96), 0.55 * a, stroke=4))
            if val:
                draw_text(c, res, val, bx + 40, y, 84, "mono", INK, 0.92 * a, 0.02)
            else:
                for k, ln in enumerate((0.78, 0.5)):
                    c.drawLine(bx + 40, y - 60 + k * 0 , bx + 40 + (R - bx - 80) * ln, y - 60, paint(GREY, 0.55 * a, stroke=22))
        yb = self.row_y(len(self.FIELDS)) + 40
        c.drawLine(L, yb, R, yb, paint(INK, 0.5 * a, stroke=3))
        draw_text(c, res, "FOR ILLUSTRATION ONLY  ·  NOT A REAL RECORD", 0, yb + 110, 52, "mono", (110, 98, 86), a, 0.03, "center")

    def name_row(self):
        """(world centre, width) of the whole OWNER'S NAME row, for the highlighter swipe."""
        y = self.row_y(1) - 32
        return self.world(-15, y), self.w - 190

    def name_end(self):
        return self.world(self.w / 2 - 230, self.row_y(1) - 32)


class SaleAgreement(Sheet):
    """A generic sale-agreement page: typeset header, grey body rows, SELLER / BUYER lines."""
    ROW0, STEP = 620, 112

    def row_y(self, i):
        return -self.h / 2 + self.ROW0 + i * self.STEP

    def contents(self, c, res, t, a):
        W, H = self.w, self.h
        L, R = -W / 2 + 150, W / 2 - 150
        draw_pin(c, 0, -H / 2 + 70, r=40, a=a)
        draw_text(c, res, "AGREEMENT FOR SALE", 0, -H / 2 + 300, 128, "serif", INK, a, 0.03, "center")
        draw_text(c, res, "SAMPLE PAGE  ·  FOR ILLUSTRATION ONLY", 0, -H / 2 + 410, 54, "mono", (110, 98, 86), a, 0.04, "center")
        c.drawLine(L, -H / 2 + 470, R, -H / 2 + 470, paint(INK, 0.6 * a, stroke=4))
        rng = np.random.default_rng(5)
        for i in range(16):
            y = self.row_y(i)
            if i == 2:
                draw_text(c, res, "SELLER :", L, y + 22, 66, "label", INK, a, 0.02)
                draw_text(c, res, "SAMPLE OWNER", L + 400, y + 26, 84, "mono", INK, 0.95 * a, 0.02)
                continue
            if i == 4:
                draw_text(c, res, "BUYER :", L, y + 22, 66, "label", INK, a, 0.02)
                c.drawLine(L + 400, y + 30, L + 1150, y + 30, paint((120, 110, 96), 0.7 * a, stroke=4))
                continue
            if i in (1, 3, 5):
                continue
            ln = rng.uniform(0.6, 0.98)
            c.drawLine(L, y, L + (R - L) * ln, y, paint(GREY, 0.5 * a, stroke=24))
        ys = H / 2 - 230
        for k, lab in enumerate(("SELLER", "BUYER")):
            x0 = L + k * 900
            c.drawLine(x0, ys, x0 + 640, ys, paint(INK, 0.6 * a, stroke=4))
            draw_text(c, res, lab, x0, ys + 70, 50, "mono", (110, 98, 86), a, 0.04)

    def seller_row(self):
        y = self.row_y(2) - 6
        return self.world(-self.w / 2 + 150 + 520, y), 1080

    def seller_start(self):
        return self.world(-self.w / 2 + 150 + 370, self.row_y(2) - 6)


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


class Card(Item):
    """Small kraft label card (secondary layer)."""
    z = 9

    def __init__(self, x, y, w, h, rot, t_in, text, sub):
        super().__init__(t_in)
        self.x, self.y, self.w, self.h, self.rot, self.text, self.sub = x, y, w, h, rot, text, sub

    def bounds(self, res):
        r = max(self.w, self.h)
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def draw(self, c, res, t):
        a = 1.0
        c.save(); c.translate(self.x, self.y); c.rotate(self.rot)
        r = skia.Rect.MakeXYWH(-self.w / 2, -self.h / 2, self.w, self.h)
        c.drawRect(r.makeOffset(16, 30), paint((0, 0, 0), 0.5, blur=24))
        paper_fill(c, res, r, 1.0)
        c.drawRect(r, paint((176, 136, 86), 0.62))
        draw_text(c, res, self.text, 0, -10, 130, "cond", (52, 36, 22), 0.9, 0.06, "center")
        draw_text(c, res, self.sub, 0, 110, 52, "mono", (70, 50, 32), 0.85, 0.04, "center")
        draw_pin(c, -self.w / 2 + 70, -self.h / 2 + 70, r=34, rgb=(40, 80, 140))
        c.restore()


class Verdict(Item):
    z = 75

    def __init__(self, text, x, y, size, rot, t_in):
        super().__init__(t_in)
        self.text, self.x, self.y, self.size, self.rot = text, x, y, size, rot

    def bounds(self, res):
        r = len(self.text) * self.size
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("slide", self.t_in, 0.7, {})]

    def draw(self, c, res, t):
        u = ramp(t, self.t_in, 0.45)
        if u <= 0:
            return
        draw_label(c, res, self.text, self.x, self.y, 1.0, self.size, self.rot, u)


def build_film(doc):
    L, E, W = doc.L, doc.E, doc.W
    look = dict(LOOKS["wall"]); look["board"] = "cork.png"; look["vignette"] = 0.6; look["dim"] = (8, 5, 3)
    film = Film(doc.duration, fps=30, look=look)
    film.fade_in, film.fade_out = 0.0, 0.5
    res = doc.res()

    note = film.add(Sticky(-250, -2750, 1250, -4, 0.12, [("PAYING AN", -40, 190), ("ADVANCE?", 200, 220)]))
    film.add(Card(1500, -2550, 1150, 520, 7, -1, "PROPERTY FILE", "SAMPLE  ·  EDUCATION ONLY"))
    film.add(PenMark("ellipse", -250 + 20, -2750 + 135, 1020, 330, t_in=W(1, "advance") - 0.05, dur=0.5, width=26, rot=-4, seed=3))

    ek = film.add(EKhata(-650, -300, 1900, 2500, -2.5, W(1, "ask") + 0.05))
    film.add(PenMark("underline", *ek.world(-ek.w / 2 + 120 + 430, -ek.h / 2 + 370), 860, 30, t_in=W(1, "khata") - 0.1, dur=0.4,
                     width=22, rot=-2.5, seed=4))
    sa = film.add(SaleAgreement(880, 1550, 1900, 2500, 2.5, L(2) + 0.12, z=16))

    (hx, hy), hw = ek.name_row()
    film.add(PenMark("highlight", hx, hy, hw, t_in=W(2, "owner") - 0.12, dur=0.45, width=150, rot=-2.5, seed=6, z=13))
    t_str = W(2, "name") - 0.12
    film.add(StringLine(ek.name_end(), sa.seller_start(), t_str, dur=0.5, sag=0.06, width=14, persist=True))
    st_xy = sa.world(330, sa.row_y(6) - 20)
    film.add(Stamp("MATCHES", *st_xy, size=230, rot=-9, t_in=W(2, "matches") + 0.06))
    (sx, sy), sw = sa.seller_row()
    film.add(PenMark("highlight", sx, sy, sw, t_in=W(2, "seller") - 0.1, dur=0.4, width=130, rot=2.5, seed=8, z=17))
    t_v = E(2) + 0.55
    film.add(Verdict("CHECK BEFORE YOU PAY", -760, 1800, 190, -3, t_v))

    # camera (screen-safe: subjects sit at y~790 of 1920, inside the 230-1340 band)
    def shot(t, x, y, z, rad=None, st=0.5, rot=0.0):
        film.cam(t, x, y + 170 / (z * S), z, rot)
        film.focus(t, x, y, rad or 1500 / z, st)

    shot(0.0, -250, -2700, 1.75, st=0.45, rot=-0.6)
    shot(1.4, -250, -2680, 1.95, st=0.5)
    shot(W(1, "advance") + 0.55, -230, -2660, 2.0, st=0.5)
    shot(W(1, "ask") + 0.55, -560, -700, 1.35, st=0.5, rot=0.4)
    shot(E(1), -600, -650, 1.45, st=0.5)
    shot(L(2) + 0.4, 100, 450, 0.95, st=0.35)
    shot(W(2, "owner") + 0.05, hx - 100, hy + 50, 1.7, st=0.55, rot=-0.5)
    shot(W(2, "matches") + 0.2, (hx + sx) / 2 + 250, (hy + sy) / 2 + 250, 1.2, st=0.45)
    shot(W(2, "seller") + 0.15, sx + 80, sy + 150, 1.55, st=0.5, rot=0.5)
    shot(E(2) + 0.7, 150, 250, 1.0, rad=3800, st=0.22)
    shot(doc.duration, 150, 240, 1.04, rad=3800, st=0.2)
    return film
