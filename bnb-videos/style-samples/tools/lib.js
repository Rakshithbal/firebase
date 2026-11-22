// Shared helpers for the BNB style samples: seeded RNG, easing, resampled wobbly strokes drawn up to a length,
// glyph-by-glyph handwriting. Deterministic: every random number comes from a fixed seed, consumed the same way at any progress.
const L = {};
L.rng = seed => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
L.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
L.prog = (t, t0, t1) => L.clamp((t - t0) / (t1 - t0));
L.eo = x => 1 - Math.pow(1 - x, 3);
L.eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
L.eback = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
L.lerp = (a, b, k) => a + (b - a) * k;

// Catmull-Rom through control points -> dense polyline
L.smooth = (pts, seg = 10) => {
  if (pts.length < 3) return pts.slice();
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < seg; k++) { const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
  }
  out.push(pts[pts.length - 1]); return out;
};
L.resample = (pts, step = 4) => {
  const out = [pts[0]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let [ax, ay] = pts[i - 1]; const [bx, by] = pts[i]; let d = Math.hypot(bx - ax, by - ay);
    while (acc + d >= step) { const k = (step - acc) / d; ax += (bx - ax) * k; ay += (by - ay) * k; out.push([ax, ay]); d = Math.hypot(bx - ax, by - ay); acc = 0; }
    acc += d;
  }
  const l = pts[pts.length - 1], o = out[out.length - 1]; if (Math.hypot(l[0] - o[0], l[1] - o[1]) > .5) out.push(l); return out;
};
// shapes -> control polylines
L.arcPts = (cx, cy, rx, ry, a0, a1, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return o; };
L.linePts = (a, b) => [a, b];

// A stroke: control polyline -> smoothed, resampled, wobbled (3 boil variants). draw(ctx, upTo 0..1, boil)
L.Stroke = class {
  constructor(pts, o = {}) {
    this.o = Object.assign({ w: 10, wob: 1.6, trem: .5, boil: .7, seed: 1, smooth: true, step: 3 }, o);
    const r = L.rng(this.o.seed);
    let p = this.o.smooth && pts.length > 2 ? L.smooth(pts, 8) : pts; p = L.resample(p, this.o.step);
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28], fr = [.006 + r() * .004, .03 + r() * .02, .11 + r() * .05];
    const tr = p.map(() => r() - .5);
    this.vars = [0, 1, 2].map(b => {
      let s = 0; return p.map((q, i) => {
        const a = p[Math.max(0, i - 1)], c = p[Math.min(p.length - 1, i + 1)]; let nx = -(c[1] - a[1]), ny = c[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        if (i) s += Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]);
        const off = this.o.wob * Math.sin(s * fr[0] + ph[0]) + this.o.wob * .5 * Math.sin(s * fr[1] + ph[1]) + this.o.trem * tr[i] + this.o.boil * Math.sin(s * fr[2] + ph[2] + b * 2.1);
        return [q[0] + nx * off, q[1] + ny * off];
      });
    });
    this.len = []; let s = 0; for (let i = 0; i < p.length; i++) { if (i) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); this.len.push(s); }
    this.total = s;
  }
  path(ctx, upTo = 1, b = 0) {
    const P = this.vars[b % 3], lim = this.total * L.clamp(upTo); ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < P.length; i++) {
      if (this.len[i] > lim) { const k = (lim - this.len[i - 1]) / (this.len[i] - this.len[i - 1] || 1); ctx.lineTo(L.lerp(P[i - 1][0], P[i][0], k), L.lerp(P[i - 1][1], P[i][1], k)); break; }
      ctx.lineTo(P[i][0], P[i][1]);
    }
  }
  head(upTo = 1, b = 0) { const P = this.vars[b % 3], lim = this.total * L.clamp(upTo); for (let i = 1; i < P.length; i++) if (this.len[i] >= lim) return P[i]; return P[P.length - 1]; }
};

// Handwriting: lay out once (fixed per-glyph tilt / baseline / size drift), reveal glyph by glyph.
L.Hand = class {
  constructor(ctx, text, x, y, o = {}) {
    this.o = Object.assign({ font: 'Kalam', size: 80, weight: 700, tilt: 1.3, drift: .017, bob: .02, seed: 7, align: 'left', track: 0 }, o);
    const r = L.rng(this.o.seed); ctx.save(); ctx.font = `${this.o.weight} ${this.o.size}px ${this.o.font}`;
    const tw = ctx.measureText(text).width + this.o.track * text.length;
    let cx = this.o.align === 'center' ? x - tw / 2 : this.o.align === 'right' ? x - tw : x;
    this.g = [...text].map(ch => { const w = ctx.measureText(ch).width; const gl = { ch, x: cx, w, rot: (r() - .5) * 2 * this.o.tilt * Math.PI / 180, dy: (r() - .5) * 2 * this.o.bob * this.o.size, sc: 1 + (r() - .5) * 2 * this.o.drift }; cx += w + this.o.track; return gl; });
    ctx.restore(); this.y = y; this.width = tw; this.x0 = this.g.length ? this.g[0].x : x; this.n = this.g.filter(g => g.ch.trim()).length;
  }
  // p in glyphs (float). Each glyph sweeps in with a slanted mask (written, not faded).
  draw(ctx, p, style = '#1b1c20', alpha = 1) {
    ctx.save(); ctx.font = `${this.o.weight} ${this.o.size}px ${this.o.font}`; ctx.fillStyle = style; ctx.textBaseline = 'alphabetic';
    let k = 0;
    for (const g of this.g) {
      if (!g.ch.trim()) continue; const q = L.clamp(p - k); k++; if (q <= 0) break;
      ctx.save(); ctx.translate(g.x + g.w / 2, this.y + g.dy); ctx.rotate(g.rot); ctx.scale(g.sc, g.sc);
      if (q < 1) { const s = this.o.size; ctx.beginPath(); const xr = -g.w / 2 - s * .3 + (g.w + s * .8) * q; ctx.moveTo(-g.w, -s * 1.2); ctx.lineTo(xr + s * .25, -s * 1.2); ctx.lineTo(xr - s * .25, s * .5); ctx.lineTo(-g.w, s * .5); ctx.closePath(); ctx.clip(); }
      ctx.globalAlpha = alpha; ctx.fillText(g.ch, -g.w / 2, 0); ctx.restore();
    }
    ctx.restore();
  }
};
// timed writing helper: returns glyph progress for chars/sec
L.wp = (t, t0, cps, n) => L.clamp((t - t0) * cps, 0, n);

// caption word helper: given timing lines, returns {line, words:[{w,s,e}], idx}
L.capAt = (T, t, hold = .5) => { for (const l of T.lines) if (t >= l.start - .08 && t < l.end + hold) return l; return null; };
L.noiseCanvas = (w, h, seed, amp = 10, base = 128) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const im = x.createImageData(w, h); const r = L.rng(seed);
  for (let i = 0; i < w * h; i++) { const v = base + (r() - .5) * 2 * amp; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  x.putImageData(im, 0, 0); return c;
};
window.L = L;
