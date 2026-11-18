// Shared look + helpers for R10 "Construction loans pay in stages" (BNB Loan Lens). Blueprint style, same as R05.
// Canvas is 1080x1920. Scenes draw in the SAFE area x 60..1020, y 230..1340 (captions live at y 1420..1520; IG UI covers the bottom ~340px and right edge).
window.P = {
  bg: '#0E2A47',        // blueprint navy
  bg2: '#12355A',
  grid: 'rgba(160,200,255,0.10)',
  gridMajor: 'rgba(160,200,255,0.18)',
  line: '#EAF2FF',      // chalk-white linework
  dim: '#8FB3DA',       // secondary lines / labels
  water: '#4FC3F7',
  accent: '#FF8A3D',    // money OUT / bills / the gap (orange)
  good: '#7CE0A3',      // money IN / releases / checks (green)
  bad: '#FF5A5A',
  concrete: '#9AA7B4',
  concreteDark: '#6E7B88',
  ink: '#1C4673',
  font: '"Inter", "Inter Display", sans-serif',
};
window.SCENES = [];
window.L = {
  clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
  prog: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
  easeOut: (x) => 1 - Math.pow(1 - x, 3),
  easeIn: (x) => x * x * x,
  easeInOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  backOut: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  lerp: (a, b, x) => a + (b - a) * x,
  rng: (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); },
  wordAt: (T, lineId, i) => { const l = T.lines.find((x) => x.id === lineId); return l.words[Math.min(i, l.words.length - 1)].s; },
  // first (or n-th) word matching text in a line (case-insensitive, punctuation ignored)
  wordTime: (T, lineId, word, n = 0) => {
    const l = T.lines.find((x) => x.id === lineId); let k = 0;
    for (const w of l.words) if (w.w.toLowerCase().replace(/\W/g, '') === word.toLowerCase()) { if (k === n) return w.s; k++; }
    return l.start;
  },
  text: (ctx, s, x, y, size, color = P.line, weight = 800, align = 'center', alpha = 1) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${P.font}`;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.restore();
  },
  drawOn: (ctx, pts, p, color = P.line, width = 6) => {
    if (p <= 0) return; let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * p; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i++) { if (rem <= 0) break; const d = seg[i - 1], f = Math.min(1, rem / d);
      ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); rem -= d; }
    ctx.stroke(); ctx.restore();
  },
  tag: (ctx, s, x, y, size = 38, fg = P.bg, bgc = P.line, alpha = 1) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `800 ${size}px ${P.font}`; const w = ctx.measureText(s).width + size * 1.1, h = size * 1.6;
    ctx.fillStyle = bgc; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 2); ctx.restore();
  },
  hexA: (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; },
  rr: (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); },
  check: (ctx, x, y, s, p, color, w) => {
    L.drawOn(ctx, [[x - s * 0.5, y + s * 0.02], [x - s * 0.15, y + s * 0.36], [x + s * 0.52, y - s * 0.34]], p, color, w);
  },
  // pop-in helper: backOut progress over d seconds starting at t0
  pop: (t, t0, d = 0.45) => L.backOut(L.prog(t, t0, t0 + d)),

  // ---------- icons ----------
  // Rupee money bag centred at (x,y); r = body radius. o: {alpha, fill, rupee, wob}
  bag: (ctx, x, y, r, o = {}) => {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    const path = () => {
      ctx.beginPath(); ctx.moveTo(-0.3 * r, -0.78 * r);
      ctx.bezierCurveTo(-0.55 * r, -0.55 * r, -1.0 * r, -0.2 * r, -1.0 * r, 0.32 * r);
      ctx.bezierCurveTo(-1.0 * r, 0.86 * r, -0.55 * r, 1.0 * r, 0, 1.0 * r);
      ctx.bezierCurveTo(0.55 * r, 1.0 * r, 1.0 * r, 0.86 * r, 1.0 * r, 0.32 * r);
      ctx.bezierCurveTo(1.0 * r, -0.2 * r, 0.55 * r, -0.55 * r, 0.3 * r, -0.78 * r); ctx.closePath();
    };
    path(); const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#24557F'); g.addColorStop(1, '#173E63');
    ctx.fillStyle = o.fill || g; ctx.fill();
    ctx.lineWidth = Math.max(4, r * 0.05); ctx.lineJoin = 'round'; ctx.strokeStyle = P.line; ctx.stroke();
    // top flaps
    ctx.beginPath(); ctx.moveTo(-0.3 * r, -0.8 * r); ctx.lineTo(-0.5 * r, -1.18 * r); ctx.quadraticCurveTo(-0.2 * r, -1.0 * r, 0, -1.12 * r);
    ctx.quadraticCurveTo(0.2 * r, -1.0 * r, 0.5 * r, -1.18 * r); ctx.lineTo(0.3 * r, -0.8 * r); ctx.closePath();
    ctx.fillStyle = '#2A6190'; ctx.fill(); ctx.stroke();
    // tie band
    ctx.beginPath(); ctx.roundRect(-0.4 * r, -0.86 * r, 0.8 * r, 0.16 * r, 0.08 * r); ctx.fillStyle = P.good; ctx.fill(); ctx.stroke();
    // rupee mark
    if (o.rupee !== false) L.text(ctx, '₹', 0, 0.3 * r, r * 0.95, P.good, 800, 'center', 1);
    ctx.restore();
  },
  // Cash bundle ("packet") centred at (x,y); s = scale (1 => 130x78). color = accent color of band.
  packet: (ctx, x, y, s, o = {}) => {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0 || s <= 0) return;
    const c = o.color || P.good;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, s);
    if (o.glow) { const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 120); g.addColorStop(0, L.hexA(c, 0.45 * o.glow)); g.addColorStop(1, L.hexA(c, 0));
      ctx.fillStyle = g; ctx.fillRect(-130, -130, 260, 260); }
    // back sheets
    ctx.fillStyle = L.hexA(c, 0.16); ctx.strokeStyle = L.hexA(c, 0.7); ctx.lineWidth = 3;
    L.rr(ctx, -61, -33, 130, 78, 10); ctx.fill(); ctx.stroke();
    L.rr(ctx, -65, -39, 130, 78, 10); ctx.fillStyle = '#1A4A70'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.stroke();
    // inner border
    ctx.strokeStyle = L.hexA(c, 0.45); ctx.lineWidth = 2.5; L.rr(ctx, -55, -29, 110, 58, 6); ctx.stroke();
    // band
    ctx.fillStyle = c; ctx.fillRect(-18, -39, 36, 78);
    L.text(ctx, '₹', 0, 1, 38, P.bg, 800, 'center', 1);
    ctx.restore();
  },
  // Bank building (generic, no name/logo). centred at x, base at y; s scale (1 => ~240 wide, ~210 tall)
  bank: (ctx, x, y, s, p = 1, o = {}) => {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const lw = 6, c = o.color || P.line;
    // glow
    if (o.glow) { const g = ctx.createRadialGradient(0, -100, 20, 0, -100, 220); g.addColorStop(0, L.hexA(P.good, 0.28 * o.glow)); g.addColorStop(1, L.hexA(P.good, 0));
      ctx.fillStyle = g; ctx.fillRect(-240, -330, 480, 460); }
    const fa = L.prog(p, 0.4, 1);
    if (fa > 0) { ctx.save(); ctx.globalAlpha *= fa; ctx.fillStyle = 'rgba(18,53,90,0.9)';
      ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(0, -215); ctx.lineTo(120, -150); ctx.closePath(); ctx.fill();
      ctx.fillRect(-112, -150, 224, 150); ctx.restore(); }
    L.drawOn(ctx, [[-120, -150], [0, -215], [120, -150], [-120, -150]], L.prog(p, 0, 0.5), c, lw);
    L.drawOn(ctx, [[-108, -132], [108, -132]], L.prog(p, 0.2, 0.6), c, lw);
    for (let i = 0; i < 4; i++) { const cx = -78 + i * 52; L.drawOn(ctx, [[cx, -118], [cx, -22]], L.prog(p, 0.3 + i * 0.08, 0.7 + i * 0.08), c, lw + 2); }
    L.drawOn(ctx, [[-118, -14], [118, -14]], L.prog(p, 0.5, 0.85), c, lw);
    L.drawOn(ctx, [[-132, 0], [132, 0]], L.prog(p, 0.55, 0.95), c, lw);
    // pediment circle (plain)
    const ca = L.prog(p, 0.6, 1); if (ca > 0) { ctx.save(); ctx.globalAlpha *= ca; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -172, 14, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  },
  // Bill / receipt centred at x,y; s scale (1 => 70x90)
  bill: (ctx, x, y, s, alpha = 1, rot = 0, c = P.accent) => {
    if (alpha <= 0 || s <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-35, -45); ctx.lineTo(35, -45); ctx.lineTo(35, 38);
    for (let i = 0; i < 7; i++) { const xx = 35 - (i + 0.5) * 10; ctx.lineTo(xx, i % 2 ? 38 : 46); }
    ctx.lineTo(-35, 38); ctx.closePath();
    ctx.fillStyle = '#F4F7FC'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = c; ctx.fillRect(-22, -30, 44, 8);
    ctx.fillStyle = 'rgba(14,42,71,0.45)'; ctx.fillRect(-22, -12, 44, 5); ctx.fillRect(-22, 2, 30, 5); ctx.fillRect(-22, 16, 38, 5);
    ctx.restore();
  },
  // round check badge (green), p = draw progress
  badge: (ctx, x, y, r, p, alpha = 1) => {
    if (p <= 0 || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    const s = L.backOut(L.clamp(p * 1.6));
    ctx.fillStyle = P.good; ctx.beginPath(); ctx.arc(x, y, r * s, 0, Math.PI * 2); ctx.fill();
    L.check(ctx, x, y + r * 0.04, r * 1.15, L.prog(p, 0.35, 1), P.bg, Math.max(4, r * 0.22));
    ctx.restore();
  },
};
