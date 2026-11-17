// Shared look + helpers for YT01 hook "20x30 house plan" (BUYNBUILD). Blueprint style, 16:9 1920x1080.
// Adapted from r05-curing/lib.js (landscape canvas, 3D-ish camera projection added).
window.P = {
  bg: '#0E2A47',        // blueprint navy
  bgDeep: '#081B30',
  grid: 'rgba(160,200,255,0.09)',
  gridMajor: 'rgba(160,200,255,0.20)',
  line: '#EAF2FF',      // chalk-white linework
  dim: '#8FB3DA',       // secondary lines / labels
  accent: '#FF9A3D',    // the one warm accent
  floor: 'rgba(120,170,230,0.16)',
  font: '"Inter", "Inter Display", sans-serif',
};
window.L = {
  clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
  prog: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
  easeOut: (x) => 1 - Math.pow(1 - x, 3),
  easeInOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  backOut: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  lerp: (a, b, x) => a + (b - a) * x,
  // first word in a line matching text (punctuation ignored) -> start time (s)
  wordTime: (T, lineId, word, nth = 0) => {
    const l = T.lines.find((x) => x.id === lineId);
    const ws = l.words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word.toLowerCase());
    return ws.length ? ws[Math.min(nth, ws.length - 1)].s : l.start;
  },
  wordEnd: (T, lineId, word) => { const l = T.lines.find((x) => x.id === lineId); const w = l.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word.toLowerCase()); return w ? w.e : l.end; },
  text: (ctx, s, x, y, size, color = P.line, weight = 800, align = 'center', alpha = 1, spacing = 0) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${P.font}`;
    if (spacing) ctx.letterSpacing = spacing + 'px';
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.restore();
  },
  // stroke a polyline partially (draw-on), pts = [[x,y],...], p = 0..1
  drawOn: (ctx, pts, p, color = P.line, width = 6, dash = null) => {
    if (p <= 0) return; let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * p; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i++) { if (rem <= 0) break; const d = seg[i - 1], f = Math.min(1, rem / d);
      ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); rem -= d; }
    ctx.stroke(); ctx.restore();
  },
  // pill tag
  tag: (ctx, s, x, y, size = 38, fg = P.bg, bgc = P.line, alpha = 1, scale = 1) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.font = `800 ${size}px ${P.font}`; const w = ctx.measureText(s).width + size * 1.2, h = size * 1.7;
    ctx.fillStyle = bgc; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore();
  },
  // Camera: world coords in feet (x across the plot front, y toward the back, z up).
  // cam = {s: px per ft, yaw (rad), pitch (rad, 0 = top-down), tx, ty: screen pos of world centre (wx, wy)}
  proj: (cam, x, y, z = 0) => {
    const X = x - cam.wx, Y = y - cam.wy;
    const c = Math.cos(cam.yaw), s = Math.sin(cam.yaw);
    const Xr = X * c - Y * s, Yr = X * s + Y * c;
    const ca = Math.cos(cam.pitch), sa = Math.sin(cam.pitch);
    return [cam.tx + cam.s * Xr, cam.ty - cam.s * (Yr * ca + z * sa), Yr * sa - z * ca]; // [sx, sy, depth(far = bigger)]
  },
};
