"""R12 render: cinematic-film engine (Skia) world + screen-space overlay (series label, BNB watermark, typed-strip
captions, logo end card). Frames are piped straight into ffmpeg (no frame folder on disk).

  $VENV/bin/python render.py --probe 1.2,6.0,...         -> stills/
  $VENV/bin/python render.py --cues                      -> audio/sfx_cues.json
  $VENV/bin/python render.py --out out/_video.mp4 --workers 3
"""
import argparse, json, os, pathlib, re, subprocess, sys
import multiprocessing as mp

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, "/home/user/firebase/.claude/skills/cinematic-film/scripts")
sys.path.insert(0, str(HERE))
import numpy as np
import skia
from engine import Doc, Renderer, clamp, ease_out_cubic, ramp
import scene

W_, H_ = 1080, 1920
FPS = 30
FONTS = HERE / "fonts"
BRAND = HERE.parent / "brand"
TIM = json.loads((HERE / "timing_michael.json").read_text())
TOTAL = TIM["total"]
END0 = TOTAL - 2.5


def make_chunks():
    """Caption chunks of <= 5 words, breaking after punctuation. (words, start, end)."""
    out = []
    for ln in TIM["lines"]:
        cur = []
        ws = ln["words"]
        for i, w in enumerate(ws):
            cur.append(w)
            if len(cur) >= 5 or re.search(r"[.,?!]$", w["w"]) or i == len(ws) - 1:
                out.append(cur); cur = []
    res = []
    for i, ch in enumerate(out):
        s = ch[0]["s"] - 0.08
        e = ch[-1]["e"] + 0.45
        if i + 1 < len(out):
            e = min(e, out[i + 1][0]["s"] - 0.08)
        res.append((ch, s, e))
    return res


def sk_image(path):
    from PIL import Image
    im = np.ascontiguousarray(np.asarray(Image.open(path).convert("RGBA")))
    return skia.Image.fromarray(im, colorType=skia.ColorType.kRGBA_8888_ColorType)


class Overlay:
    def __init__(self):
        tf = lambda f: skia.Typeface.MakeFromFile(str(f))
        self.f_type = skia.Font(tf(FONTS / "mono.ttf"), 56)
        self.f_lab = skia.Font(tf("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"), 28)
        self.f_sub = skia.Font(tf("/usr/share/fonts/opentype/inter/Inter-Medium.otf"), 23)
        self.f_end = skia.Font(tf("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"), 34)
        for f in (self.f_type, self.f_lab, self.f_sub, self.f_end):
            f.setSubpixel(True); f.setEdging(skia.Font.Edging.kAntiAlias)
        self.chunks = make_chunks()
        self.mark = sk_image(BRAND / "bnb_mark_white.png")
        self.logo = sk_image(BRAND / "bnb_logo_white.png")
        self.surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W_, H_, skia.ColorType.kRGBA_8888_ColorType, skia.AlphaType.kPremul_AlphaType))

    def tw(self, f, s, track=0):
        return sum(f.getWidths(f.textToGlyphs(s))) + track * (len(s) - 1)

    def text(self, c, f, s, x, y, col, track=0):
        cx = x
        p = skia.Paint(AntiAlias=True, Color=col)
        for ch, w in zip(s, f.getWidths(f.textToGlyphs(s))):
            c.drawString(ch, cx, y, f, p); cx += w + track

    def header(self, c, t):
        a = ease_out_cubic(ramp(t, 0.15, 0.5)) * (1 - ramp(t, END0 - 0.2, 0.5))
        if a <= 0:
            return
        lab = "PAPER TRAIL  ·  ENCUMBRANCE CERTIFICATE"
        w = self.tw(self.f_lab, lab, 2.0)
        r = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(56, 140, w + 44, 54), 6, 6)
        c.drawRRect(r, skia.Paint(AntiAlias=True, Color=skia.Color(20, 14, 10, int(200 * a))))
        c.drawRect(skia.Rect.MakeXYWH(56, 140, 8, 54), skia.Paint(Color=skia.Color(239, 75, 6, int(255 * a))))
        self.text(c, self.f_lab, lab, 80, 177, skia.Color(246, 238, 222, int(255 * a)), 2.0)
        sub = "Sample documents for illustration - not real records"
        sw = self.tw(self.f_sub, sub)
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(56, 206, sw + 28, 38), 5, 5),
                    skia.Paint(AntiAlias=True, Color=skia.Color(20, 14, 10, int(150 * a))))
        self.text(c, self.f_sub, sub, 70, 233, skia.Color(244, 236, 220, int(225 * a)))
        # BNB watermark, top right
        wa = 0.85 * a
        mw = 90; mh = mw * self.mark.height() / self.mark.width()
        p = skia.Paint(AntiAlias=True); p.setAlphaf(wa)
        c.drawImageRect(self.mark, skia.Rect.MakeXYWH(900, 150, mw, mh), skia.SamplingOptions(skia.FilterMode.kLinear), p)

    def captions(self, c, t):
        f = self.f_type
        for i, (ws, s, e) in enumerate(self.chunks):
            if not (s <= t < e):
                continue
            u = ease_out_cubic(ramp(t, s, 0.2)); a = min(u, 1 - ramp(t, e - 0.14, 0.14))
            if a <= 0:
                continue
            words = [w["w"] for w in ws]
            sp = self.tw(f, " ")
            wid = [self.tw(f, w) for w in words]
            # one line, or two balanced lines if too wide
            lines = [list(range(len(words)))]
            if sum(wid) + sp * (len(words) - 1) > 900:
                best = None
                for k in range(1, len(words)):
                    m = max(sum(wid[:k]) + sp * (k - 1), sum(wid[k:]) + sp * (len(words) - k - 1))
                    if best is None or m < best[0]:
                        best = (m, [list(range(k)), list(range(k, len(words)))])
                lines = best[1]
            lw = [sum(wid[j] for j in ln) + sp * (len(ln) - 1) for ln in lines]
            lh = 74
            boxw = max(lw) + 72; boxh = lh * len(lines) + 44
            x0 = 540 - boxw / 2; y0 = 1470 - boxh / 2 + (1 - u) * 24
            c.save(); c.translate(540, y0 + boxh / 2); c.rotate(-1.0 + 0.8 * (i % 2)); c.translate(-boxw / 2, -boxh / 2)
            sh = skia.Paint(AntiAlias=True, Color=skia.Color(0, 0, 0, int(150 * a)))
            sh.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 9))
            c.drawRect(skia.Rect.MakeXYWH(6, 12, boxw, boxh), sh)
            p = skia.Path(); rng = np.random.default_rng(10 + i)
            p.moveTo(0, 0)
            for xx in np.linspace(0, boxw, 24)[1:]:
                p.lineTo(xx, rng.uniform(-3, 3))
            for yy in np.linspace(0, boxh, 6)[1:]:
                p.lineTo(boxw + rng.uniform(-5, 5), yy)
            for xx in np.linspace(boxw, 0, 24)[1:]:
                p.lineTo(xx, boxh + rng.uniform(-3, 3))
            p.close()
            c.drawPath(p, skia.Paint(AntiAlias=True, Color=skia.Color(246, 241, 228, int(255 * a))))
            for li, ln in enumerate(lines):
                by = 22 + lh * li + 54
                x = (boxw - lw[li]) / 2
                for j in ln:
                    w = ws[j]
                    on = w["s"] <= t < w["e"] + 0.05
                    said = t >= w["s"]
                    if on:
                        hp = skia.Paint(AntiAlias=True, Color=skia.Color(246, 206, 46, int(220 * a)))
                        c.drawRect(skia.Rect.MakeXYWH(x - 6, by - 42, wid[j] + 12, 54), hp)
                    col = skia.Color(30, 26, 22, int(255 * a * (1.0 if said else 0.45)))
                    self.text(c, f, words[j], x, by, col)
                    x += wid[j] + sp
            c.restore()

    def endcard(self, c, t):
        u = ease_out_cubic(ramp(t, END0, 0.8))
        if u <= 0:
            return
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W_, H_), skia.Paint(Color=skia.Color(14, 10, 8, int(205 * u))))
        w = 560 * (0.92 + 0.08 * u); h = w * self.logo.height() / self.logo.width()
        p = skia.Paint(AntiAlias=True); p.setAlphaf(u)
        c.drawImageRect(self.logo, skia.Rect.MakeXYWH(540 - w / 2, 760 - h / 2 + (1 - u) * 16, w, h),
                        skia.SamplingOptions(skia.FilterMode.kLinear, skia.MipmapMode.kNone), p)
        a2 = ease_out_cubic(ramp(t, END0 + 0.4, 0.6))
        s = "PAPER TRAIL  ·  SAVE BEFORE YOU PAY A TOKEN"
        tw = self.tw(self.f_end, s, 1.5)
        self.text(c, self.f_end, s, 540 - tw / 2, 760 + h / 2 + 80, skia.Color(246, 238, 222, int(230 * a2)), 1.5)
        c.drawRect(skia.Rect.MakeXYWH(540 - 60, 760 + h / 2 + 28, 120 * a2, 6), skia.Paint(Color=skia.Color(239, 75, 6, int(255 * a2))))

    def apply(self, frame, t):
        rgba = np.dstack([frame, np.full(frame.shape[:2], 255, np.uint8)])
        img = skia.Image.fromarray(np.ascontiguousarray(rgba), colorType=skia.ColorType.kRGBA_8888_ColorType)
        with self.surf as c:
            c.drawImage(img, 0, 0)
            self.header(c, t)
            self.endcard(c, t)
            self.captions(c, t)
        return self.surf.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]


def make():
    doc = Doc(HERE)
    film = scene.build_film(doc)
    return film, Renderer(film, W_, H_, doc), Overlay()


def worker(args):
    f0, f1, out = args
    film, r, ov = make()
    ff = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W_}x{H_}", "-r", str(FPS),
                           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", str(out)],
                          stdin=subprocess.PIPE)
    for n in range(f0, f1):
        ff.stdin.write(ov.apply(r.frame(n), n / FPS).tobytes())
    ff.stdin.close(); ff.wait()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe", default="")
    ap.add_argument("--out", default="")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--cues", action="store_true")
    ap.add_argument("--stills", default=str(HERE / "stills"))
    a = ap.parse_args()
    if a.cues:
        film, _, _ = make()
        (HERE / "audio" / "sfx_cues.json").write_text(json.dumps(film.all_cues(), indent=1))
        print(len(film.all_cues()), "cues")
        return
    if a.probe:
        from PIL import Image
        film, r, ov = make()
        sd = pathlib.Path(a.stills); sd.mkdir(exist_ok=True, parents=True)
        for s in a.probe.split(","):
            t = float(s); n = int(round(t * FPS))
            Image.fromarray(ov.apply(r.frame(n), t)).save(sd / f"t{t:05.2f}.jpg", quality=90)
        print("stills ->", sd)
        return
    nfr = int(round(TOTAL * FPS))
    k = a.workers
    parts = [(i * nfr // k, (i + 1) * nfr // k, HERE / f"_chunk{i}.mp4") for i in range(k)]
    with mp.Pool(k) as pool:
        pool.map(worker, parts)
    lst = HERE / "_chunks.txt"
    lst.write_text("".join(f"file '{p[2]}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", a.out], check=True)
    for p in parts:
        os.remove(p[2])
    os.remove(lst)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
