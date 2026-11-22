"""Render STYLE 01 with the cinematic-film engine + screen-space overlays (style label, typed-strip captions).

  venv/bin/python render01.py --probe 0.5,2.2,3.4,5.0,5.9,8.5      -> stills/
  venv/bin/python render01.py --out out/video_noaudio.mp4 --workers 2
"""
import argparse, json, math, os, pathlib, subprocess, sys
import multiprocessing as mp

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, "/home/user/firebase/.claude/skills/cinematic-film/scripts")
sys.path.insert(0, str(HERE))
import numpy as np
import skia
from engine import Doc, Renderer, clamp, ease_out_cubic, ramp
import scene

W_, H_ = 1080, 1920
FONTS = HERE / "fonts"
TIM = json.loads((HERE / "timing.json").read_text())

# caption chunks: (text, keyword, line id, first word idx, last word idx)
CHUNKS = [("Before you pay an advance,", "advance", 0, 0, 4),
          ("ask for the e-khata,", "e-khata", 0, 5, 8),
          ("and check that the owner's name", "owner's name", 1, 0, 5),
          ("matches the seller.", "matches", 1, 6, 8)]


def chunk_times():
    out = []
    for i, (txt, kw, li, a, b) in enumerate(CHUNKS):
        ws = TIM["lines"][li]["words"]
        s = ws[a]["s"] - 0.08
        if i + 1 < len(CHUNKS):
            nli, na = CHUNKS[i + 1][2], CHUNKS[i + 1][3]
            e = TIM["lines"][nli]["words"][na]["s"] - 0.08
        else:
            e = ws[b]["e"] + 0.7
        out.append((s, e))
    return out


class Overlay:
    def __init__(self):
        tf = lambda f: skia.Typeface.MakeFromFile(str(f))
        self.f_type = skia.Font(tf(FONTS / "mono.ttf"), 54)
        self.f_lab = skia.Font(tf("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"), 27)
        self.f_sub = skia.Font(tf("/usr/share/fonts/opentype/inter/Inter-Medium.otf"), 22)
        for f in (self.f_type, self.f_lab, self.f_sub):
            f.setSubpixel(True); f.setEdging(skia.Font.Edging.kAntiAlias)
        self.times = chunk_times()
        self.surf = skia.Surface.MakeRaster(skia.ImageInfo.Make(W_, H_, skia.ColorType.kRGBA_8888_ColorType, skia.AlphaType.kPremul_AlphaType))

    def tw(self, f, s, track=0):
        return sum(f.getWidths(f.textToGlyphs(s))) + track * (len(s) - 1)

    def text(self, c, f, s, x, y, col, track=0):
        cx = x
        ws = f.getWidths(f.textToGlyphs(s))
        p = skia.Paint(AntiAlias=True, Color=col)
        for ch, w in zip(s, ws):
            c.drawString(ch, cx, y, f, p); cx += w + track

    def draw(self, c, t):
        # style label (top area)
        lab = "STYLE 01  ·  DOCUMENT BOARD"
        w = self.tw(self.f_lab, lab, 2.2)
        r = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(56, 118, w + 44, 52), 6, 6)
        c.drawRRect(r, skia.Paint(AntiAlias=True, Color=skia.Color(20, 14, 10, 190)))
        c.drawRect(skia.Rect.MakeXYWH(56, 118, 7, 52), skia.Paint(Color=skia.Color(176, 30, 26)))
        self.text(c, self.f_lab, lab, 80, 154, skia.Color(244, 236, 220), 2.2)
        self.text(c, self.f_sub, "Sample documents for illustration - not real records", 60, 205, skia.Color(244, 236, 220, 200))
        # typed paper-strip captions, y ~1390-1540
        for i, (s, e) in enumerate(self.times):
            if not (s <= t < e + 0.25):
                continue
            txt, kw = CHUNKS[i][0], CHUNKS[i][1]
            u = ease_out_cubic(ramp(t, s, 0.22)); a = min(u, 1 - ramp(t, e, 0.18))
            if a <= 0:
                continue
            f = self.f_type
            tw = self.tw(f, txt)
            lines = [txt]
            if tw > 860:
                words = txt.split(); best = None
                for k in range(1, len(words)):
                    l1, l2 = " ".join(words[:k]), " ".join(words[k:])
                    m = max(self.tw(f, l1), self.tw(f, l2))
                    if best is None or m < best[0]:
                        best = (m, [l1, l2])
                lines = best[1]
            lh = 70
            boxw = max(self.tw(f, l) for l in lines) + 70
            boxh = lh * len(lines) + 46
            x0 = 60; y0 = 1470 - boxh / 2 + (1 - u) * 26
            c.save(); c.translate(x0 + boxw / 2, y0 + boxh / 2); c.rotate(-1.2 + 0.6 * (i % 2)); c.translate(-boxw / 2, -boxh / 2)
            sh = skia.Paint(AntiAlias=True, Color=skia.Color(0, 0, 0, int(140 * a)))
            sh.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 9))
            c.drawRect(skia.Rect.MakeXYWH(6, 12, boxw, boxh), sh)
            # torn-edged strip
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
            # keyword highlighter + text
            for li, ln in enumerate(lines):
                by = 23 + lh * li + 52
                k = ln.find(kw)
                if k < 0 and " " in kw:
                    k = -1
                if k >= 0:
                    hx = 35 + self.tw(f, ln[:k]); hw = self.tw(f, kw)
                    hu = ease_out_cubic(ramp(t, s + 0.12, 0.3))
                    hp = skia.Paint(AntiAlias=True, Color=skia.Color(246, 206, 46, int(200 * a)))
                    c.drawRect(skia.Rect.MakeXYWH(hx - 6, by - 40, (hw + 12) * hu, 50), hp)
                self.text(c, f, ln, 35, by, skia.Color(30, 26, 22, int(255 * a)))
            c.restore()

    def apply(self, frame, t):
        rgba = np.dstack([frame, np.full(frame.shape[:2], 255, np.uint8)])
        img = skia.Image.fromarray(np.ascontiguousarray(rgba), colorType=skia.ColorType.kRGBA_8888_ColorType)
        with self.surf as c:
            c.drawImage(img, 0, 0)
            self.draw(c, t)
        return self.surf.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]


def make():
    doc = Doc(HERE)
    film = scene.build_film(doc)
    return film, Renderer(film, W_, H_, doc), Overlay()


def worker(args):
    f0, f1, out = args
    film, r, ov = make()
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W_}x{H_}", "-r", "30",
                           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", str(out)],
                          stdin=subprocess.PIPE)
    for n in range(f0, f1):
        ff.stdin.write(ov.apply(r.frame(n), n / 30).tobytes())
    ff.stdin.close(); ff.wait()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe", default="")
    ap.add_argument("--out", default="")
    ap.add_argument("--workers", type=int, default=2)
    ap.add_argument("--cues", action="store_true")
    a = ap.parse_args()
    if a.cues:
        film, _, _ = make()
        (HERE / "audio" / "sfx_cues.json").write_text(json.dumps(film.all_cues(), indent=1))
        print(json.dumps(film.all_cues()))
        return
    if a.probe:
        from PIL import Image
        film, r, ov = make()
        (HERE / "stills").mkdir(exist_ok=True)
        for s in a.probe.split(","):
            t = float(s); n = int(round(t * 30))
            Image.fromarray(ov.apply(r.frame(n), t)).save(HERE / "stills" / f"t{t:05.2f}.png")
            print("still", t)
        return
    nfr = int(round(TIM["total"] * 30))
    k = a.workers
    parts = [(i * nfr // k, (i + 1) * nfr // k, HERE / f"_chunk{i}.mp4") for i in range(k)]
    with mp.Pool(k) as pool:
        pool.map(worker, parts)
    lst = HERE / "_chunks.txt"
    lst.write_text("".join(f"file '{p[2]}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", a.out], check=True)
    for p in parts:
        os.remove(p[2])
    os.remove(lst)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
