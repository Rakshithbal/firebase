// Shared look + helpers for R20 "What M20 means" (BNB Buildpedia). Blueprint style — identical palette to R05 (series look).
// Canvas is 1080x1920. Scenes draw in the SAFE area y 200..1320 (captions live at y 1380..1560; IG UI covers the bottom ~340px and right edge).
window.P = {
  bg: '#0E2A47',        // blueprint navy
  bg2: '#12355A',
  grid: 'rgba(160,200,255,0.10)',
  gridMajor: 'rgba(160,200,255,0.18)',
  line: '#EAF2FF',      // chalk-white linework
  dim: '#8FB3DA',       // secondary lines / labels
  water: '#4FC3F7',     // water / curing
  accent: '#FF8A3D',    // warning / emphasis (orange)
  good: '#7CE0A3',      // strength / ok (green)
  bad: '#FF5A5A',       // crack
  concrete: '#9AA7B4',  // concrete fill
  concreteDark: '#6E7B88',
  font: '"Inter", "Inter Display", sans-serif',
};
window.SCENES = [];
window.L = {
  clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
  // progress of t between a and b, clamped 0..1
  prog: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
  easeOut: (x) => 1 - Math.pow(1 - x, 3),
  easeInOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  backOut: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  lerp: (a, b, x) => a + (b - a) * x,
  // seeded random (deterministic renders)
  rng: (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); },
  // time of word index i of line id (from timing.json) — use to land visuals on the spoken word
  wordAt: (T, lineId, i) => { const l = T.lines.find((x) => x.id === lineId); return l.words[Math.min(i, l.words.length - 1)].s; },
  // scene cut before a line: midpoint of the breath between the previous line's end and this line's start
  cut: (T, lineId) => { const i = T.lines.findIndex((x) => x.id === lineId); return +((T.lines[i - 1].end + T.lines[i].start) / 2).toFixed(3); },
  // find first word matching text in a line (case-insensitive, punctuation ignored)
  wordTime: (T, lineId, word) => { const l = T.lines.find((x) => x.id === lineId); const w = l.words.find((x) => x.w.toLowerCase().replace(/\W/g, '') === word.toLowerCase()); return w ? w.s : l.start; },
  text: (ctx, s, x, y, size, color = P.line, weight = 800, align = 'center', alpha = 1) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${P.font}`;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.restore();
  },
  // stroke a polyline partially (draw-on), pts = [[x,y],...], p = 0..1
  drawOn: (ctx, pts, p, color = P.line, width = 6) => {
    if (p <= 0) return; let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * p; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i++) { if (rem <= 0) break; const d = seg[i - 1], f = Math.min(1, rem / d);
      ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); rem -= d; }
    ctx.stroke(); ctx.restore();
  },
  // dimension-style label tag (rounded rect + text)
  tag: (ctx, s, x, y, size = 38, fg = P.bg, bgc = P.line, alpha = 1) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `800 ${size}px ${P.font}`; const w = ctx.measureText(s).width + size * 1.1, h = size * 1.6;
    ctx.fillStyle = bgc; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 2); ctx.restore();
  },
};
