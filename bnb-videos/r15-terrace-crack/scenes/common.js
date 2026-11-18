// common — shared drawing helpers for R15 scenes (namespaced as window.R15A).
(function () {
  const A = (window.R15A = {});
  const TAU = Math.PI * 2;

  A.hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  A.easeIn = (x) => x * x * x;
  A.rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  A.pop = (t, t0, d = 0.4) => L.backOut(L.prog(t, t0, t0 + d));
  A.fade = (t, t0, d = 0.25) => L.easeOut(L.prog(t, t0, t0 + d));
  // gaussian pulse around t0 (0..1)
  A.pulse = (t, t0, w = 0.25) => Math.exp(-Math.pow((t - t0) / w, 2));

  // Teardrop (tip up). r = radius of the round part.
  A.drop = (ctx, x, y, r, color = P.water, alpha = 1) => {
    if (alpha <= 0 || r <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    const k = 0.982;
    ctx.beginPath(); ctx.moveTo(x, y - 1.8 * r);
    ctx.arc(x, y, r, -Math.PI / 2 + k, -Math.PI / 2 - k + TAU);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(2, r * 0.16); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r * 0.6, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
    ctx.restore();
  };

  // Sun icon with rays. flare 0..1
  A.sun = (ctx, x, y, r, t, alpha = 1, flare = 0) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    const gl = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (3 + flare * 1.5));
    gl.addColorStop(0, `rgba(255,190,90,${0.45 + 0.25 * flare})`); gl.addColorStop(0.4, 'rgba(255,150,60,0.14)'); gl.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * (3 + flare * 1.5), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#FFC261'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(4, r * 0.13);
    const n = 10;
    for (let i = 0; i < n; i++) {
      const an = (i / n) * TAU + t * 0.4, l1 = r * 1.3, l2 = r * (1.75 + 0.18 * Math.sin(t * 5 + i * 1.7) + 0.3 * flare);
      ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * l1, y + Math.sin(an) * l1); ctx.lineTo(x + Math.cos(an) * l2, y + Math.sin(an) * l2); ctx.stroke();
    }
    ctx.fillStyle = '#FFB547'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#FFE1A6'; ctx.lineWidth = Math.max(3, r * 0.1); ctx.stroke();
    ctx.restore();
  };

  // Puffy cloud. dark 0..1 blends light->storm colour.
  A.cloud = (ctx, x, y, s, alpha = 1, dark = 0) => {
    if (alpha <= 0 || s <= 0) return;
    const off = A._cloudCv || (A._cloudCv = document.createElement('canvas'));
    off.width = 420; off.height = 300;
    const outer = ctx; ctx = off.getContext('2d'); ctx.save(); ctx.translate(210, 150);
    const puffs = [[-92, 18, 50], [-40, -22, 66], [30, -34, 72], [92, 4, 54], [10, 26, 56], [-60, 34, 40], [70, 34, 40]];
    const path = () => { ctx.beginPath(); puffs.forEach(([px, py, r]) => { ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, TAU); }); };
    const c0 = [201, 214, 230], c1 = [52, 72, 98];
    const c = c0.map((v, i) => Math.round(L.lerp(v, c1[i], dark)));
    path(); ctx.lineWidth = Math.min(22, 10 / s); ctx.strokeStyle = P.line; ctx.lineJoin = 'round'; ctx.stroke();
    path(); ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; ctx.fill();
    // soft underside shade
    ctx.save(); path(); ctx.clip();
    const g = ctx.createLinearGradient(0, -40, 0, 80); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,20,35,${0.18 + 0.3 * dark})`);
    ctx.fillStyle = g; ctx.fillRect(-170, -120, 340, 220); ctx.restore();
    ctx.restore();
    outer.save(); outer.globalAlpha *= alpha; outer.translate(x, y); outer.scale(s, s); outer.drawImage(off, -210, -150); outer.restore();
  };

  // Rain streaks in a box. dens 0..1, deterministic from t + seed.
  A.rain = (ctx, t, x0, x1, y0, y1, n, alpha, seed = 7, slant = 0.22, color = P.water) => {
    if (alpha <= 0) return;
    const r = L.rng(seed); ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineCap = 'round';
    const H = y1 - y0;
    for (let i = 0; i < n; i++) {
      const bx = x0 + r() * (x1 - x0), sp = 1100 + r() * 700, ph = r() * H, len = 34 + r() * 30, w = 2 + r() * 2.5;
      const y = y0 + ((t * sp + ph) % H), x = bx - (y - y0) * slant;
      ctx.lineWidth = w; ctx.globalAlpha = alpha * (0.35 + 0.5 * r());
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * slant, y - len); ctx.stroke();
    }
    ctx.restore();
  };

  // Jagged crack polyline from (x0,y0) to (x1,y1). amp = sideways jitter.
  A.crackPts = (seed, x0, y0, x1, y1, n, amp) => {
    const r = L.rng(seed), pts = [];
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    for (let i = 0; i <= n; i++) {
      const f = i / n, j = (i === 0 || i === n) ? 0 : (r() - 0.5) * 2 * amp;
      pts.push([x0 + dx * f + nx * j, y0 + dy * f + ny * j]);
    }
    return pts;
  };

  // Rough chalk loop around an ellipse, draw-on p (0..1).
  A.chalkLoop = (ctx, cx, cy, rx, ry, p, seed = 3, color = P.line, w = 7, rot = 0) => {
    if (p <= 0) return;
    const r = L.rng(seed), pts = [], a0 = -2.3 + r() * 0.4, sweep = TAU + 0.55, N = 64;
    const ph1 = r() * 6, ph2 = r() * 6;
    for (let i = 0; i <= N; i++) {
      const f = i / N, a = a0 + sweep * f;
      const k = 1 + 0.05 * Math.sin(a * 3 + ph1) + 0.03 * Math.sin(a * 7 + ph2) + 0.06 * f; // spiral out a touch so ends don't meet
      const ex = Math.cos(a) * rx * k, ey = Math.sin(a) * ry * k;
      pts.push([cx + ex * Math.cos(rot) - ey * Math.sin(rot), cy + ex * Math.sin(rot) + ey * Math.cos(rot)]);
    }
    ctx.save();
    ctx.globalAlpha *= 0.92; L.drawOn(ctx, pts, p, color, w);
    ctx.globalAlpha *= 0.45; L.drawOn(ctx, pts.map(([x, y], i) => [x + Math.sin(i * 1.3) * 3, y + 3]), p, color, w * 0.55);
    ctx.restore();
    return pts;
  };
  // point on a polyline at fraction p (for the chalk tip)
  A.pointAt = (pts, p) => {
    let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * L.clamp(p);
    for (let i = 1; i < pts.length; i++) { if (rem <= seg[i - 1]) { const f = rem / seg[i - 1]; return [L.lerp(pts[i - 1][0], pts[i][0], f), L.lerp(pts[i - 1][1], pts[i][1], f)]; } rem -= seg[i - 1]; }
    return pts[pts.length - 1];
  };

  // Chalk stick
  A.chalkStick = (ctx, x, y, alpha = 1, rot = -0.7) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = '#F4F7FB'; A.rr(ctx, 0, -11, 96, 22, 8); ctx.fill();
    ctx.fillStyle = 'rgba(14,42,71,0.22)'; ctx.fillRect(0, 3, 96, 8);
    ctx.strokeStyle = P.bg; ctx.lineWidth = 3; A.rr(ctx, 0, -11, 96, 22, 8); ctx.stroke();
    ctx.restore();
  };

  // Magnifier; inner(ctx) draws the zoomed content (already clipped to the lens).
  A.magnifier = (ctx, x, y, r, alpha, inner) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    // handle
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = P.line; A.rr(ctx, r + 4, -15, r * 1.05, 30, 15); ctx.fill();
    ctx.fillStyle = P.accent; A.rr(ctx, r + 4 + r * 0.42, -17, r * 0.63, 34, 16); ctx.fill();
    ctx.restore();
    // lens content
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    ctx.fillStyle = '#123A62'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (inner) inner(ctx);
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0.03)'); g.addColorStop(1, 'rgba(255,255,255,0.10)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
    ctx.strokeStyle = P.line; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r * 0.78, Math.PI * 1.1, Math.PI * 1.38); ctx.stroke();
    ctx.restore();
  };

  // Engineer icon: hard hat + plain head + shoulders. No face.
  A.engineer = (ctx, x, y, s, alpha = 1) => {
    if (alpha <= 0 || s <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s);
    // shoulders
    ctx.beginPath(); ctx.moveTo(-120, 190); ctx.bezierCurveTo(-120, 90, -70, 72, 0, 72); ctx.bezierCurveTo(70, 72, 120, 90, 120, 190); ctx.closePath();
    ctx.fillStyle = '#1C4673'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.stroke();
    // safety vest stripes
    ctx.save(); ctx.clip();
    ctx.strokeStyle = P.accent; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(-58, 78); ctx.lineTo(-40, 200); ctx.moveTo(58, 78); ctx.lineTo(40, 200); ctx.stroke();
    ctx.strokeStyle = '#FFE1A6'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-120, 150); ctx.lineTo(120, 150); ctx.stroke();
    ctx.restore();
    // head (plain, no features)
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, TAU); ctx.fillStyle = '#8FB3DA'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 8; ctx.stroke();
    // hard hat
    ctx.beginPath(); ctx.moveTo(-66, -14); ctx.bezierCurveTo(-66, -92, 66, -92, 66, -14); ctx.closePath();
    ctx.fillStyle = '#FFC261'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#FFC261'; A.rr(ctx, -88, -20, 176, 20, 10); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(14,42,71,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(0, -22); ctx.stroke();
    ctx.restore();
  };

  // Phone outline (centre x,y). Returns screen rect.
  A.phoneRect = (x, y, w, h) => ({ x: x - w / 2 + 16, y: y - h / 2 + 52, w: w - 32, h: h - 104 });
  A.phone = (ctx, x, y, w, h, alpha = 1) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.strokeStyle = P.line; ctx.lineWidth = 12; A.rr(ctx, x - w / 2, y - h / 2, w, h, 54); ctx.stroke();
    const s = A.phoneRect(x, y, w, h);
    ctx.strokeStyle = A.hexA(P.line, 0.5); ctx.lineWidth = 3; A.rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.stroke();
    ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(x, y - h / 2 + 27, 8, 0, TAU); ctx.fill();
    A.rr(ctx, x - 50, y + h / 2 - 32, 100, 10, 5); ctx.fill();
    ctx.restore();
  };

  // Bookmark outline path centred at 0,0
  A.bookmarkPath = (ctx, w, h) => {
    const hw = w / 2, hh = h / 2;
    ctx.beginPath(); ctx.moveTo(-hw + 18, -hh); ctx.lineTo(hw - 18, -hh); ctx.quadraticCurveTo(hw, -hh, hw, -hh + 18);
    ctx.lineTo(hw, hh); ctx.lineTo(0, hh - 82); ctx.lineTo(-hw, hh); ctx.lineTo(-hw, -hh + 18); ctx.quadraticCurveTo(-hw, -hh, -hw + 18, -hh); ctx.closePath();
  };

  // Highlight ring that pops in, with an expanding echo ring.
  A.ring = (ctx, t, t0, x, y, r, color = P.accent, w = 8) => {
    const s = A.pop(t, t0 - 0.06, 0.4); if (s <= 0) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.globalAlpha *= Math.min(1, s);
    ctx.beginPath(); ctx.arc(x, y, r * s * (1 + 0.025 * Math.sin(t * 4 + x)), 0, TAU); ctx.stroke();
    const e = L.prog(t, t0, t0 + 0.6);
    if (e > 0 && e < 1) { ctx.globalAlpha *= (1 - e); ctx.lineWidth = w * 0.6; ctx.beginPath(); ctx.arc(x, y, r * (1 + 0.45 * L.easeOut(e)), 0, TAU); ctx.stroke(); }
    ctx.restore();
  };

  // Tag that pops (scale) at time t0.
  A.popTag = (ctx, t, t0, s, x, y, size, fg, bgc, alphaMul = 1) => {
    const k = A.pop(t, t0 - 0.05, 0.38); if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    L.tag(ctx, s, 0, 0, size, fg, bgc, Math.min(1, k * 1.5) * alphaMul); ctx.restore();
  };

  // Irregular blob (stain / puddle) path.
  A.blob = (ctx, cx, cy, R, ry, seed, ph = 0) => {
    const r = L.rng(seed), a1 = r() * 6, a2 = r() * 6, a3 = r() * 6;
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * TAU;
      const k = 1 + 0.16 * Math.sin(3 * a + a1 + ph) + 0.09 * Math.sin(5 * a + a2 - ph * 0.7) + 0.05 * Math.sin(9 * a + a3);
      const x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * ry * k;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  };

  // Check mark
  A.check = (ctx, x, y, s, p, color, w) => {
    L.drawOn(ctx, [[x - s * 0.5, y + s * 0.02], [x - s * 0.15, y + s * 0.36], [x + s * 0.52, y - s * 0.34]], p, color, w);
  };
})();
