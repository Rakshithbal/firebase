#!/usr/bin/env python3
""""Not Another Party": a 1080x1920 techno promo reel drawn entirely in code (no footage).

  python3 render.py --probe 1.0,3.5,6.0        # stills -> out/probe/
  python3 render.py --out out/reel.mp4 --audio audio/mix.wav --workers 4

Event details are TEMPLATE placeholders in [brackets]: edit PLACEHOLDERS below and re-render.
"""
import argparse
import math
import os
import subprocess
import sys
from multiprocessing import Process

import numpy as np
import skia

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
BPM = 128.0
BEAT = 60.0 / BPM
DROP1, BREAK_T, RISE_T, DROP2 = 5.0, 14.0, 19.0, 24.0
END = DROP1 + 58 * BEAT
TOTAL = END + 0.8

# ---- edit these, then re-render (the voiceover never says them)
PLACEHOLDERS = {
    "event": "[EVENT NAME]",
    "date_city": "[DATE] · [CITY]",
    "sound": "[SOUND SYSTEM]",
    "venue": "[VENUE]",
    "set": "[CLOSING SET LENGTH]",
    "price": "EARLY BIRD [₹PRICE]",
    "until": "until [DATE] or the first [N] tickets",
}

COND = os.path.join(HERE, "..", "wright", "fonts", "cond.ttf")
INTER_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
INTER_SB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
TF = {}


def font(path, size):
    if path not in TF:
        TF[path] = skia.Typeface.MakeFromFile(path)
    return skia.Font(TF[path], size)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def col(r, g, b, a=255):
    return skia.Color(int(r), int(g), int(b), int(clamp(a / 255) * 255))


# ---------- beat helpers
KICKS = [1.8] + [DROP1 + i * BEAT for i in range(58) if not (BREAK_T <= DROP1 + i * BEAT < DROP2)]


def kick_env(t, decay=0.12):
    best = 0.0
    for k in KICKS:
        if k <= t < k + 0.6:
            best = max(best, math.exp(-(t - k) / decay))
    return best


def beat_phase(t):
    return ((t - DROP1) / BEAT) % 1.0


# ---------- drawing primitives
def text_center(c, s, x, y, size, path=COND, color=skia.ColorWHITE, alpha=1.0, track=0.0):
    f = font(path, size)
    p = skia.Paint(AntiAlias=True, Color=color)
    p.setAlphaf(clamp(alpha) * (skia.ColorGetA(color) / 255))
    if track:
        widths = [f.measureText(ch) + track * size for ch in s]
        x0 = x - sum(widths) / 2
        for ch, w in zip(s, widths):
            c.drawString(ch, x0, y, f, p)
            x0 += w
    else:
        c.drawString(s, x - f.measureText(s) / 2, y, f, p)
    return f.measureText(s)


def fit_size(s, path, size, maxw):
    f = font(path, size)
    w = f.measureText(s)
    return size if w <= maxw else size * maxw / w


def person(c, x, yf, h, arms=0.0, bounce=0.0, color=skia.ColorBLACK, sway=0.0, phone=False, phone_glow=None):
    """Silhouette standing at feet (x, yf), height h. arms 0=down .. 1=up."""
    y = yf - bounce * h * 0.04
    p = skia.Paint(AntiAlias=True, Color=color, Style=skia.Paint.kStrokeAndFill_Style)
    lw = h * 0.085
    sp = skia.Paint(AntiAlias=True, Color=color, Style=skia.Paint.kStroke_Style, StrokeWidth=lw,
                    StrokeCap=skia.Paint.kRound_Cap, StrokeJoin=skia.Paint.kRound_Join)
    hx = x + sway * h * 0.05
    # legs
    c.drawLine(x - h * 0.06, y, x - h * 0.03, y - h * 0.45, sp)
    c.drawLine(x + h * 0.06, y, x + h * 0.03, y - h * 0.45, sp)
    # torso
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(hx - h * 0.11, y - h * 0.8, hx + h * 0.11, y - h * 0.42),
                                      h * 0.06, h * 0.06), p)
    # head
    c.drawCircle(hx, y - h * 0.9, h * 0.075, p)
    # arms: shoulder -> elbow -> hand
    for side in (-1, 1):
        sx, sy = hx + side * h * 0.1, y - h * 0.76
        a = clamp(arms * (1.0 if side == 1 else 0.9 + 0.1 * math.sin(sway * 3)))
        # down pose: hanging by the body; up pose: a V above the head
        ex = sx + side * h * (0.03 + 0.07 * a)
        ey = sy + h * (0.17 - 0.33 * a)
        hx2 = ex + side * h * (0.02 + 0.03 * a)
        hy2 = ey + h * (0.16 - 0.34 * a)
        path = skia.Path()
        path.moveTo(sx, sy)
        path.lineTo(ex, ey)
        path.lineTo(hx2, hy2)
        c.drawPath(path, sp)
    if phone:
        px, py = hx + h * 0.06, y - h * 1.08
        r = skia.Rect.MakeXYWH(px - h * 0.035, py - h * 0.06, h * 0.07, h * 0.12)
        glow = phone_glow or col(230, 235, 240)
        gp = skia.Paint(AntiAlias=True, Color=glow)
        gp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, h * 0.05))
        gp.setAlphaf(0.5)
        c.drawRect(r.makeOutset(h * 0.02, h * 0.02), gp)
        c.drawRect(r, skia.Paint(AntiAlias=True, Color=glow))


RNG = np.random.default_rng(3)
CROWD = [dict(x=RNG.uniform(-60, W + 60), d=RNG.uniform(0, 1), ph=RNG.uniform(0, 1), up=RNG.uniform(0.3, 1.0),
              phone=RNG.uniform() < 0.55) for _ in range(70)]
CROWD.sort(key=lambda p: p["d"])  # far first


def crowd(c, t, base_y, scale, color_far, color_near, mode="dance", speed=1.0, rim=None):
    for m in CROWD:
        d = m["d"]
        h = scale * (0.45 + 0.75 * d)
        yf = base_y + d * scale * 0.55
        k = kick_env(t * speed if speed != 1 else t)
        if mode == "dance":
            bounce = k * (0.6 + m["ph"] * 0.8)
            arms = m["up"] * (0.7 + 0.3 * math.sin(t * 2.1 * speed + m["ph"] * 6))
            sway = math.sin(t * 2.0 * speed + m["ph"] * 9)
        else:  # bored club
            bounce, arms, sway = 0.0, 0.0, 0.2 * math.sin(t * 0.7 + m["ph"] * 9)
        cc = [color_far[i] + (color_near[i] - color_far[i]) * d for i in range(3)]
        if rim and d > 0.4:
            person(c, m["x"] + 2, yf, h * 1.01, arms, bounce, col(*rim, 140), sway)
        person(c, m["x"], yf, h, arms, bounce, col(*cc), sway,
               phone=(mode == "club" and m["phone"]))


def haze(c, t, colors, strength=1.0):
    for i, (r, g, b) in enumerate(colors):
        cx = W * (0.3 + 0.4 * math.sin(t * 0.35 + i * 2.1))
        cy = H * (0.35 + 0.15 * math.cos(t * 0.27 + i * 1.3))
        rad = W * (0.9 + 0.2 * math.sin(t * 0.5 + i))
        shader = skia.GradientShader.MakeRadial(skia.Point(cx, cy), rad,
                                                [col(r, g, b, 170 * strength), col(r, g, b, 0)])
        c.drawPaint(skia.Paint(Shader=shader, BlendMode=skia.BlendMode.kPlus))


def lasers(c, t, n=9, ox=W / 2, oy=-40, color=(255, 40, 70), intensity=1.0, spread=1.0):
    k = kick_env(t, 0.18)
    for i in range(n):
        a = math.radians(90 + spread * (i - (n - 1) / 2) * 9 + 14 * math.sin(t * 0.9 + i * 0.6))
        x2, y2 = ox + math.cos(a) * 3000, oy + math.sin(a) * 3000
        for wdt, al in ((26, 0.10), (9, 0.25), (2.5, 0.9)):
            p = skia.Paint(AntiAlias=True, Color=col(*color), StrokeWidth=wdt, BlendMode=skia.BlendMode.kPlus)
            p.setAlphaf(clamp(al * intensity * (0.45 + 0.55 * k)))
            c.drawLine(ox, oy, x2, y2, p)


def card(c, s, x, y, size, alpha, bg=(255, 255, 255), fg=(0, 0, 0), path=COND, pad=0.35):
    f = font(path, size)
    w = f.measureText(s)
    r = skia.Rect.MakeLTRB(x - w / 2 - size * pad, y - size * 0.9, x + w / 2 + size * pad, y + size * 0.28)
    bp = skia.Paint(AntiAlias=True, Color=col(*bg))
    bp.setAlphaf(clamp(alpha))
    c.drawRect(r, bp)
    text_center(c, s, x, y, size, path, col(*fg), alpha)


def subtitle(c, s, alpha=1.0, y=1440):
    if not s:
        return
    size = fit_size(s, INTER_B, 54, W - 160)
    f = font(INTER_B, size)
    w = f.measureText(s)
    bg = skia.Paint(AntiAlias=True, Color=col(0, 0, 0))
    bg.setAlphaf(0.55 * alpha)
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(W / 2 - w / 2 - 28, y - size - 10, W / 2 + w / 2 + 28, y + 22), 14, 14), bg)
    text_center(c, s, W / 2, y, size, INTER_B, skia.ColorWHITE, alpha)


# voiceover subtitles (times match music.py placement)
SUBS = [(7.05, 8.75, "Hours of unbroken techno."), (8.75, 10.3, "No commercial hits."),
        (10.3, 12.3, "Just one sound system…"), (12.3, 14.7, "…and a room that came to dance."),
        (19.3, 21.15, "If you know, you know."), (21.15, 22.85, "And if you're still reading this…"),
        (22.85, 23.75, "…you know."),
        (29.35, 30.4, "Link in bio."), (30.4, 32.19, "See you on the floor.")]


def sub_at(t):
    for a, b, s in SUBS:
        if a <= t < b:
            return s, clamp((t - a) / 0.12) * clamp((b - t) / 0.12)
    return None, 0


# ---------- scenes
def scene_hook(c, t):
    c.clear(skia.ColorBLACK)
    flash = 0.0
    for ft, amt in ((0.55, 0.35), (1.8, 1.0)):
        if ft <= t < ft + 0.25:
            flash = max(flash, amt * math.exp(-(t - ft) / 0.06))
    if flash > 0.02:
        c.clear(col(255 * flash, 255 * flash, 255 * flash))
        person(c, W / 2, 1500, 900, arms=1.0, color=skia.ColorBLACK)
    words = [("YOU DON'T GO OUT", 0.1), ("FOR THE MUSIC", 0.6), ("ANYMORE.", 1.1)]
    dark = flash > 0.5
    for i, (wd, at) in enumerate(words):
        a = ease((t - at) / 0.18)
        if a <= 0:
            continue
        size = 150 if i < 2 else 190
        color = skia.ColorBLACK if dark else (col(255, 40, 70) if i == 2 else skia.ColorWHITE)
        text_center(c, wd, W / 2, 620 + i * 170 + (1 - a) * 30, size, COND, color, a)


def scene_club(c, t):
    lt = t - 2.0
    g = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, H)], [col(78, 78, 80), col(40, 40, 42)])
    c.drawPaint(skia.Paint(Shader=g))
    # flat ceiling lights
    for i in range(5):
        c.drawRect(skia.Rect.MakeXYWH(80 + i * 210, 120, 120, 14), skia.Paint(Color=col(170, 170, 170)))
    crowd(c, t, 1180, 820, (95, 95, 98), (22, 22, 24), mode="club")
    lines = [("BAD SOUND.", 0.15), ("PHONES UP.", 0.95), ("NOBODY DANCING.", 1.75)]
    for i, (s, at) in enumerate(lines):
        a = ease((lt - at) / 0.15)
        if a > 0:
            card(c, s, W / 2, 470 + i * 150, 110, a, bg=(240, 240, 240), fg=(30, 30, 30))


def warehouse_bg(c, t, strength=1.0):
    c.clear(col(6, 4, 10))
    haze(c, t, [(200, 20, 50), (30, 60, 230)], strength)


def scene_drop(c, t):
    warehouse_bg(c, t)
    lasers(c, t, n=11)
    crowd(c, t, 1300, 760, (40, 10, 30), (0, 0, 0), rim=(255, 60, 90))
    lt = t - DROP1
    s = 1.0 + 0.25 * math.exp(-lt / 0.12)
    c.save()
    c.translate(W / 2, 640)
    c.scale(s, s)
    text_center(c, "THIS IS THE", 0, -10, 140, COND, skia.ColorWHITE)
    text_center(c, "OTHER THING.", 0, 160, 200, COND, col(255, 50, 80))
    c.restore()


def shot_mixer(c, t):
    c.clear(col(12, 12, 16))
    haze(c, t, [(150, 20, 60)], 0.5)
    k = kick_env(t)
    panel = skia.Rect.MakeXYWH(90, 420, 900, 1080)
    c.drawRRect(skia.RRect.MakeRectXY(panel, 30, 30), skia.Paint(AntiAlias=True, Color=col(26, 26, 32)))
    for row in range(4):
        for i in range(4):
            cx, cy = 230 + i * 205, 560 + row * 150
            c.drawCircle(cx, cy, 52, skia.Paint(AntiAlias=True, Color=col(50, 50, 58)))
            ang = math.radians(-220 + 260 * (0.5 + 0.45 * math.sin(t * (0.6 + 0.2 * i) + row)))
            c.drawLine(cx, cy, cx + math.cos(ang) * 44, cy + math.sin(ang) * 44,
                       skia.Paint(AntiAlias=True, Color=col(255, 60, 90), StrokeWidth=8, StrokeCap=skia.Paint.kRound_Cap))
    for i in range(4):
        x = 230 + i * 205
        c.drawRect(skia.Rect.MakeXYWH(x - 6, 1140, 12, 300), skia.Paint(Color=col(70, 70, 80)))
        fy = 1170 + 240 * (0.5 + 0.4 * math.sin(t * 0.8 + i * 1.7))
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x - 45, fy - 22, 90, 44), 8, 8),
                    skia.Paint(AntiAlias=True, Color=col(210, 210, 220)))
        lvl = int(10 * (0.35 + 0.6 * k * (0.7 + 0.3 * math.sin(i * 2.3 + t * 5))))
        for j in range(10):
            on = j < lvl
            cc = (255, 50, 70) if j > 7 else (60, 255, 140)
            c.drawRect(skia.Rect.MakeXYWH(x + 70, 1420 - j * 26, 26, 18),
                       skia.Paint(Color=col(*cc, 255 if on else 40)))


def shot_speakers(c, t):
    c.clear(col(8, 6, 10))
    haze(c, t, [(30, 50, 220), (180, 20, 60)], 0.6)
    k = kick_env(t, 0.1)
    for r in range(3):
        for i in range(2):
            x, y = 130 + i * 430, 300 + r * 430
            c.drawRect(skia.Rect.MakeXYWH(x, y, 390, 400), skia.Paint(AntiAlias=True, Color=col(20, 20, 24)))
            cx, cy = x + 195, y + 200
            rad = 150 * (1 + 0.06 * k)
            c.drawCircle(cx, cy, rad, skia.Paint(AntiAlias=True, Color=col(35, 35, 40)))
            c.drawCircle(cx, cy, rad * 0.75, skia.Paint(AntiAlias=True, Color=col(14, 14, 16)))
            c.drawCircle(cx, cy, rad * 0.25, skia.Paint(AntiAlias=True, Color=col(50, 50, 56)))
            ring = skia.Paint(AntiAlias=True, Color=col(255, 60, 90), Style=skia.Paint.kStroke_Style, StrokeWidth=6)
            ring.setAlphaf(0.25 + 0.6 * k)
            c.drawCircle(cx, cy, rad * 1.02, ring)
    c.translate(math.sin(t * 90) * 4 * k, 0)


def shot_lasers(c, t):
    warehouse_bg(c, t, 0.7)
    lasers(c, t, n=15, oy=H * 0.18, color=(80, 255, 140), intensity=1.2, spread=1.6)
    lasers(c, t + 0.3, n=9, ox=W * 0.2, oy=-60, color=(255, 40, 70), intensity=0.8)


def shot_faces(c, t):
    warehouse_bg(c, t, 0.9)
    lasers(c, t, n=7, intensity=0.6)
    k = kick_env(t)
    for i, (x, hh) in enumerate(((250, 1250), (830, 1150), (540, 1450))):
        person(c, x, 2080, hh, arms=0.9, bounce=k, color=col(0, 0, 0),
               sway=math.sin(t * 1.7 + i))


def scene_close(c, t):
    lt = t - 7.0
    shots = [shot_mixer, shot_speakers, shot_lasers, shot_faces]
    i = min(3, int(lt / 1.75))
    shots[i](c, t)


def booth(c, t, dim=0.0):
    k = kick_env(t)
    bx, by = W / 2, 1160
    glow = skia.Paint(AntiAlias=True, Color=col(255, 60, 90))
    glow.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 40))
    glow.setAlphaf(0.6)
    c.drawRect(skia.Rect.MakeXYWH(bx - 260, by - 20, 520, 60), glow)
    person(c, bx, by + 10, 330, arms=0.25 + 0.15 * math.sin(t * 2), color=col(0, 0, 0), sway=math.sin(t))
    c.drawRect(skia.Rect.MakeXYWH(bx - 260, by - 40, 520, 130), skia.Paint(AntiAlias=True, Color=col(14, 12, 18)))
    edge = skia.Paint(AntiAlias=True, Color=col(255, 60, 90), StrokeWidth=5)
    c.drawLine(bx - 260, by - 40, bx + 260, by - 40, edge)
    for sx in (150, W - 150):  # speaker stacks
        for j in range(3):
            c.drawRect(skia.Rect.MakeXYWH(sx - 90, 760 + j * 150, 180, 140), skia.Paint(Color=col(18, 18, 22)))
            c.drawCircle(sx, 830 + j * 150, 50 * (1 + 0.05 * k), skia.Paint(AntiAlias=True, Color=col(40, 40, 46)))


def scene_wide(c, t):
    lt = t - BREAK_T
    warehouse_bg(c, t, 0.55)
    c.save()
    s = 1.0 + 0.04 * lt
    c.translate(W / 2, H / 2)
    c.scale(s, s)
    c.translate(-W / 2, -H / 2)
    lasers(c, t, n=5, intensity=0.35, color=(60, 90, 255))
    booth(c, t)
    crowd(c, t * 0.6, 1420, 560, (25, 10, 35), (0, 0, 0), rim=(80, 100, 255))
    c.restore()
    dimp = skia.Paint(Color=col(0, 0, 30))
    dimp.setAlphaf(0.25)
    c.drawPaint(dimp)
    items = [(PLACEHOLDERS["sound"], 0.4), (PLACEHOLDERS["venue"], 1.2), (PLACEHOLDERS["set"], 2.0)]
    for i, (s_, at) in enumerate(items):
        a = ease((lt - at) / 0.2)
        if a > 0:
            size = fit_size(s_, COND, 120, W - 200)
            card(c, s_, W / 2, 430 + i * 165, size, a, bg=(255, 255, 255), fg=(0, 0, 0))


def scene_identity(c, t):
    lt = t - RISE_T
    rise = lt / (DROP2 - RISE_T)
    warehouse_bg(c, t, 0.6 + 0.8 * rise)
    lasers(c, t * 0.5, n=7 + int(8 * rise), intensity=0.4 + rise, color=(255, 40, 70))
    crowd(c, t * 0.5, 1260, 760, (45, 10, 30), (0, 0, 0), rim=(255, 80, 110))
    # the one who turns and nods
    nod = math.exp(-((lt - 3.3) / 0.25) ** 2)
    h = 1500 + 120 * ease(lt / 5)
    person(c, W / 2, 2350 + nod * 40, h, arms=0.0, color=col(0, 0, 0))
    wl = skia.Paint(Color=skia.ColorWHITE)
    wl.setAlphaf(clamp((lt - 4.75) / 0.25) * 0.9)
    c.drawPaint(wl)


def scene_title(c, t):
    lt = t - DROP2
    c.clear(skia.ColorBLACK)
    lasers(c, t, n=9, intensity=0.25)
    k = kick_env(t)
    s = 1.0 + 0.05 * k
    ev = PLACEHOLDERS["event"]
    size = fit_size(ev, COND, 210, W - 140)
    c.save()
    c.translate(W / 2, 700)
    c.scale(s, s)
    a = ease(lt / 0.15)
    text_center(c, ev, 0, 0, size, COND, skia.ColorWHITE, a)
    bar = skia.Paint(Color=col(255, 40, 70))
    bar.setAlphaf(a)
    c.drawRect(skia.Rect.MakeXYWH(-260 * a, 40, 520 * a, 12), bar)
    c.restore()
    dc = PLACEHOLDERS["date_city"]
    text_center(c, dc, W / 2, 860, fit_size(dc, COND, 100, W - 160), COND, skia.ColorWHITE, ease((lt - 0.4) / 0.2))
    b = ease((lt - 1.4) / 0.2)
    if b > 0:
        card(c, PLACEHOLDERS["price"], W / 2, 1110, fit_size(PLACEHOLDERS["price"], COND, 110, W - 220), b,
             bg=(255, 40, 70), fg=(255, 255, 255))
        u = PLACEHOLDERS["until"]
        text_center(c, u, W / 2, 1250, fit_size(u, INTER_SB, 46, W - 140), INTER_SB, col(230, 230, 230), b)


def scene_cta(c, t):
    lt = t - 29.0
    g = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, H)],
                                       [col(255, 40, 90), col(255, 140, 40)])
    c.drawPaint(skia.Paint(Shader=g))
    k = kick_env(t)
    arms = 0.65 + 0.35 * abs(math.sin(t * math.pi / (BEAT * 2)))
    person(c, W / 2, 1760, 1000, arms=arms, bounce=k * 1.5, color=col(10, 5, 15), sway=math.sin(t * 4.2))
    a = ease(lt / 0.2)
    text_center(c, "LINK IN BIO.", W / 2, 420, 170, COND, skia.ColorWHITE, a)
    text_center(c, "SEE YOU ON THE FLOOR.", W / 2, 560, 110, COND, col(20, 5, 20), ease((lt - 1.2) / 0.2))


GRAIN = [np.clip(np.random.default_rng(i).normal(0, 9, (H // 2, W // 2)), -30, 30).astype(np.int16) for i in range(6)]


def frame(t):
    surf = skia.Surface(W, H)
    c = surf.getCanvas()
    if t < 2.0:
        scene_hook(c, t)
    elif t < DROP1:
        scene_club(c, t)
    elif t < 7.0:
        scene_drop(c, t)
    elif t < BREAK_T:
        scene_close(c, t)
    elif t < RISE_T:
        scene_wide(c, t)
    elif t < DROP2:
        scene_identity(c, t)
    elif t < 29.0:
        scene_title(c, t)
    elif t < END:
        scene_cta(c, t)
    else:
        c.clear(skia.ColorBLACK)
    if 7.0 <= t < BREAK_T or RISE_T <= t < DROP2:
        s, a = sub_at(t)
        subtitle(c, s, a)
    elif 29.0 <= t < END:
        pass  # CTA text already on screen
    # flash on each drop
    for d in (DROP1, DROP2):
        if d <= t < d + 0.2:
            fp = skia.Paint(Color=skia.ColorWHITE)
            fp.setAlphaf(math.exp(-(t - d) / 0.05))
            c.drawPaint(fp)
    # vignette
    v = skia.GradientShader.MakeRadial(skia.Point(W / 2, H / 2), H * 0.75, [col(0, 0, 0, 0), col(0, 0, 0, 150)])
    c.drawPaint(skia.Paint(Shader=v))
    img = surf.makeImageSnapshot().toarray()[:, :, :3].astype(np.int16)  # BGRA -> drop alpha
    if t < END:
        gr = GRAIN[int(t * FPS) % len(GRAIN)].repeat(2, 0).repeat(2, 1)
        img = img + gr[:, :, None]
    return np.clip(img, 0, 255).astype(np.uint8)  # still B,G,R order


def worker(i0, i1, path):
    ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                           "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    for i in range(i0, i1):
        ff.stdin.write(frame(i / FPS).tobytes())
    ff.stdin.close()
    ff.wait()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe")
    ap.add_argument("--out")
    ap.add_argument("--audio")
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    if a.probe:
        from PIL import Image
        os.makedirs(os.path.join(HERE, "out", "probe"), exist_ok=True)
        for s in a.probe.split(","):
            t = float(s)
            Image.fromarray(frame(t)[:, :, ::-1]).save(os.path.join(HERE, "out", "probe", f"t{t:05.2f}.png"))
        return
    n = int(round(TOTAL * FPS))
    k = a.workers
    bounds = [n * j // k for j in range(k + 1)]
    parts = [os.path.join(HERE, "out", f"part{j}.mp4") for j in range(k)]
    procs = [Process(target=worker, args=(bounds[j], bounds[j + 1], parts[j])) for j in range(k)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    lst = os.path.join(HERE, "out", "parts.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{p}'\n" for p in parts)
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst]
    if a.audio:
        cmd += ["-i", a.audio, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest"]
    else:
        cmd += ["-c", "copy"]
    subprocess.run(cmd + ["-movflags", "+faststart", a.out], check=True)
    for p in parts:
        os.remove(p)
    print("wrote", a.out)


if __name__ == "__main__":
    sys.exit(main())
