// s5 — HOW TO CURE: "CURING = WET + COVERED", then three methods (ponding / wet sacks / spray)
(function () {
  const START = 24.97, END = 32.30;
  // nth occurrence of a word in a line
  const wt = (T, id, word, n = 0) => {
    const l = T.lines.find((x) => x.id === id); let k = 0;
    for (const w of l.words) if (w.w.toLowerCase().replace(/\W/g, '') === word) { if (k === n) return w.s; k++; }
    return l.start;
  };
  const pop = (t, t0, d = 0.45) => L.backOut(L.prog(t, t0, t0 + d));
  const fitFont = (ctx, s, size, maxW) => { ctx.font = `800 ${size}px ${P.font}`; const w = ctx.measureText(s).width; return w > maxW ? size * maxW / w : size; };

  // ---------- icons ----------
  function dropPath(ctx, s) {
    ctx.beginPath(); ctx.moveTo(0, -78 * s);
    ctx.bezierCurveTo(22 * s, -40 * s, 52 * s, -10 * s, 52 * s, 22 * s);
    ctx.arc(0, 22 * s, 52 * s, 0, Math.PI, false);
    ctx.bezierCurveTo(-52 * s, -10 * s, -22 * s, -40 * s, 0, -78 * s);
    ctx.closePath();
  }
  function dropIcon(ctx, x, y, s, t, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y + Math.sin(t * 3) * 4 * s);
    dropPath(ctx, s); ctx.fillStyle = 'rgba(79,195,247,0.28)'; ctx.fill();
    ctx.lineWidth = 7 * s; ctx.strokeStyle = P.water; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 22 * s, 32 * s, Math.PI * 0.62, Math.PI * 0.95); ctx.strokeStyle = P.line; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s; ctx.stroke();
    ctx.restore();
  }
  function sheetIcon(ctx, x, y, s, t, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
    // slab block underneath
    ctx.fillStyle = 'rgba(154,167,180,0.35)'; ctx.strokeStyle = P.dim; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.rect(-78 * s, 4 * s, 156 * s, 52 * s); ctx.fill(); ctx.stroke();
    // draped sheet with a gentle wave on top
    const pts = []; pts.push([-96 * s, 64 * s]); pts.push([-92 * s, -22 * s]);
    for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([L.lerp(-86, 86, u) * s, (-30 + Math.sin(u * Math.PI * 3 + t * 3) * 6) * s]); }
    pts.push([92 * s, -22 * s]); pts.push([96 * s, 64 * s]);
    ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach((p) => ctx.lineTo(...p));
    ctx.lineTo(80 * s, 64 * s); ctx.lineTo(80 * s, -6 * s); ctx.lineTo(-80 * s, -6 * s); ctx.lineTo(-80 * s, 64 * s); ctx.closePath();
    ctx.fillStyle = 'rgba(234,242,255,0.22)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach((p) => ctx.lineTo(...p));
    ctx.strokeStyle = P.line; ctx.lineWidth = 7 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    // fold lines
    ctx.lineWidth = 3.5 * s; ctx.strokeStyle = 'rgba(234,242,255,0.6)';
    [-40, 10, 55].forEach((fx) => { ctx.beginPath(); ctx.moveTo(fx * s, -22 * s); ctx.lineTo((fx - 8) * s, -6 * s); ctx.stroke(); });
    ctx.restore();
  }

  // ---------- card illustrations (local coords, box 440 x 225) ----------
  function hatch(ctx, x, y, w, h, gap, color, lw, dir = 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = color; ctx.lineWidth = lw;
    for (let k = -h; k < w + h; k += gap) { ctx.beginPath(); if (dir > 0) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); } else { ctx.moveTo(x + k, y); ctx.lineTo(x + k + h, y + h); } ctx.stroke(); }
    ctx.restore();
  }
  function ponding(ctx, t, p) {
    const top = 130, bot = 196;
    // slab
    const d = L.easeOut(L.prog(p, 0, 0.45));
    ctx.save(); ctx.beginPath(); ctx.rect(10, 0, 420 * d, 225); ctx.clip();
    ctx.fillStyle = 'rgba(154,167,180,0.30)'; ctx.fillRect(15, top, 410, bot - top);
    hatch(ctx, 15, top, 410, bot - top, 22, 'rgba(234,242,255,0.22)', 2);
    ctx.restore();
    L.drawOn(ctx, [[15, bot], [15, top], [425, top], [425, bot], [15, bot]], d, P.line, 6);
    // water layer (fills after bunds)
    const fill = L.easeInOut(L.prog(p, 0.45, 1.0));
    const bunds = [30, 160, 290, 410];
    const wl = top - 6 - 26 * fill;
    if (fill > 0) {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(30, top);
      for (let x = 30; x <= 410; x += 6) ctx.lineTo(x, wl + Math.sin(x * 0.05 + t * 4) * 3 * fill);
      ctx.lineTo(410, top); ctx.closePath();
      ctx.fillStyle = 'rgba(79,195,247,0.45)'; ctx.fill();
      ctx.beginPath();
      for (let x = 30; x <= 410; x += 6) { const yy = wl + Math.sin(x * 0.05 + t * 4) * 3 * fill; x === 30 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
      ctx.strokeStyle = P.water; ctx.lineWidth = 5; ctx.stroke();
      // ripples
      [95, 225, 350].forEach((cx, i) => {
        const ph = ((t * 0.8 + i * 0.33) % 1); ctx.globalAlpha = (1 - ph) * fill * 0.9;
        ctx.beginPath(); ctx.ellipse(cx, wl - 2, 10 + ph * 46, 3 + ph * 7, 0, 0, Math.PI * 2); ctx.strokeStyle = P.line; ctx.lineWidth = 3; ctx.stroke();
      });
      ctx.restore();
    }
    // bunds (mortar ridges)
    bunds.forEach((bx, i) => {
      const s = L.backOut(L.prog(p, 0.25 + i * 0.05, 0.5 + i * 0.05)); if (s <= 0) return;
      ctx.save(); ctx.translate(bx, top); ctx.scale(1, s);
      ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-11, -40); ctx.lineTo(11, -40); ctx.lineTo(20, 0); ctx.closePath();
      ctx.fillStyle = '#7d8a97'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.restore();
    });
    // little "bund" callout
    const ca = L.prog(p, 0.9, 1.1);
    if (ca > 0) { ctx.save(); ctx.globalAlpha *= ca; ctx.strokeStyle = P.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(160, top - 46); ctx.lineTo(178, 34); ctx.lineTo(214, 34); ctx.stroke();
      L.text(ctx, 'BUND', 224, 34, 30, P.dim, 800, 'left'); ctx.restore(); }
  }
  function sacks(ctx, t, p) {
    const cx = 220, cw = 92;
    // floor + slab lines
    const d = L.easeOut(L.prog(p, 0, 0.4));
    L.drawOn(ctx, [[40, 212], [400, 212]], d, P.dim, 5);
    L.drawOn(ctx, [[60, 14], [380, 14]], d, P.dim, 5);
    // column
    ctx.save(); ctx.globalAlpha *= d; ctx.fillStyle = 'rgba(154,167,180,0.30)'; ctx.fillRect(cx - cw / 2, 14, cw, 198); ctx.restore();
    L.drawOn(ctx, [[cx - cw / 2, 14], [cx - cw / 2, 212]], d, P.line, 6);
    L.drawOn(ctx, [[cx + cw / 2, 14], [cx + cw / 2, 212]], d, P.line, 6);
    // hessian wrap rolls on top -> bottom
    const w = L.easeInOut(L.prog(p, 0.3, 0.85));
    const sx = cx - cw / 2 - 16, sw = cw + 32, sy = 36, sh = 152 * w;
    if (w > 0) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 8); ctx.fillStyle = 'rgba(79,195,247,0.22)'; ctx.fill();
      hatch(ctx, sx, sy, sw, sh, 13, 'rgba(234,242,255,0.55)', 2.5, 1);
      hatch(ctx, sx, sy, sw, sh, 13, 'rgba(79,195,247,0.85)', 2.5, -1);
      ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, 8); ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.stroke();
      // ties
      ctx.strokeStyle = P.water; ctx.lineWidth = 5;
      [0.18, 0.82].forEach((f) => { if (f * 152 < sh) { ctx.beginPath(); ctx.moveTo(sx - 6, sy + 152 * f); ctx.lineTo(sx + sw + 6, sy + 152 * f); ctx.stroke(); } });
      ctx.restore();
    }
    // drips
    const da = L.prog(p, 0.85, 1.0);
    if (da > 0) {
      ctx.save(); ctx.globalAlpha *= da;
      [sx + 18, cx - 6, sx + sw - 20].forEach((x, i) => {
        const ph = (t * 1.1 + i * 0.37) % 1; const y = 192 + ph * 16;
        ctx.globalAlpha = da * (1 - ph * 0.6);
        ctx.save(); ctx.translate(x, y); dropPath(ctx, 0.13); ctx.fillStyle = P.water; ctx.fill(); ctx.restore();
      });
      ctx.restore();
    }
    // side drops showing wetness
    if (da > 0) { ctx.save(); ctx.globalAlpha *= da; [[sx + sw + 34, 70], [sx - 34, 120]].forEach(([x, y], i) => { ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + i) * 4); dropPath(ctx, 0.22); ctx.fillStyle = 'rgba(79,195,247,0.3)'; ctx.fill(); ctx.strokeStyle = P.water; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }); ctx.restore(); }
  }
  function spray(ctx, t, p) {
    const wx = 262, wy = 12, ww = 160, wh = 200;
    const d = L.easeOut(L.prog(p, 0, 0.4));
    // wall with brick courses
    ctx.save(); ctx.beginPath(); ctx.rect(wx, wy + wh * (1 - d), ww, wh * d); ctx.clip();
    ctx.fillStyle = 'rgba(154,167,180,0.28)'; ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = 'rgba(234,242,255,0.38)'; ctx.lineWidth = 2.5;
    for (let r = 1; r < 8; r++) { const y = wy + r * wh / 8; ctx.beginPath(); ctx.moveTo(wx, y); ctx.lineTo(wx + ww, y); ctx.stroke(); }
    for (let r = 0; r < 8; r++) { const off = r % 2 ? 0 : 40; for (let x = wx + off + 40; x < wx + ww; x += 80) { ctx.beginPath(); ctx.moveTo(x, wy + r * wh / 8); ctx.lineTo(x, wy + (r + 1) * wh / 8); ctx.stroke(); } }
    // wet patch grows
    const wet = L.easeOut(L.prog(p, 0.6, 1.4));
    if (wet > 0) { const g = ctx.createRadialGradient(wx + 10, 112, 5, wx + 10, 112, 130 * wet); g.addColorStop(0, 'rgba(79,195,247,0.55)'); g.addColorStop(1, 'rgba(79,195,247,0)'); ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh); }
    ctx.restore();
    L.drawOn(ctx, [[wx, wy + wh], [wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], d, P.line, 6);
    // hose + nozzle
    const n = L.easeOut(L.prog(p, 0.15, 0.55));
    L.drawOn(ctx, [[10, 214], [40, 200], [62, 160], [74, 128]], n, P.dim, 7);
    if (n > 0) {
      ctx.save(); ctx.globalAlpha *= n; ctx.translate(76, 124); ctx.rotate(-0.12);
      ctx.beginPath(); ctx.moveTo(-10, -16); ctx.lineTo(44, -10); ctx.lineTo(44, 10); ctx.lineTo(-10, 16); ctx.closePath();
      ctx.fillStyle = P.accent; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.restore();
    }
    // spray cone of droplets
    const sa = L.prog(p, 0.45, 0.65);
    if (sa > 0) {
      const ox = 124, oy = 118; const R = L.rng(55);
      ctx.save(); ctx.globalAlpha *= sa;
      // faint cone
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(wx - 2, 40); ctx.lineTo(wx - 2, 196); ctx.closePath(); ctx.fillStyle = 'rgba(79,195,247,0.10)'; ctx.fill();
      for (let i = 0; i < 26; i++) {
        const ang = (R() - 0.5) * 1.05, sp = R(), ph = (t * 1.6 + sp) % 1;
        const dist = ph * (wx - ox) / Math.cos(ang);
        const x = ox + Math.cos(ang) * dist, y = oy + Math.sin(ang) * dist + ph * ph * 10;
        if (x > wx - 6) continue;
        ctx.beginPath(); ctx.arc(x, y, 3.5 + R() * 3.5, 0, Math.PI * 2); ctx.fillStyle = i % 4 ? P.water : P.line; ctx.fill();
      }
      ctx.restore();
    }
  }

  const CARDS = [
    { word: ['ponding', 0], title: 'PONDING', sub: 'on the slab', fn: ponding },
    { word: ['wet', 1], title: 'WET SACKS', sub: 'on columns', fn: sacks },
    { word: ['spraying', 0], title: 'SPRAY', sub: 'on walls', fn: spray },
  ];

  SCENES.push({
    id: 's5', start: START, end: END,
    draw(ctx, t, lt, T) {
      const tCur = wt(T, 'L06', 'curing'), tWet = wt(T, 'L06', 'wet'), tCov = wt(T, 'L06', 'covered'), tPond = wt(T, 'L06', 'ponding');
      // header transition hero -> compact
      const k = L.easeInOut(L.prog(t, tPond - 0.3, tPond + 0.15));
      const lay = (hero, comp) => hero.map((v, i) => L.lerp(v, comp[i], k));

      // "CURING ="
      const cp = pop(t, START + 0.05, 0.5);
      const [tx, ty, ts] = lay([540, 600, 130], [540, 282, 64]);
      if (cp > 0) { ctx.save(); ctx.translate(tx, ty); ctx.scale(cp, cp); L.text(ctx, 'CURING =', 0, 0, ts, P.line, 800, 'center', Math.min(1, cp)); ctx.restore(); }
      // underline accent under CURING (hero only)
      const ul = L.easeOut(L.prog(t, tCur, tCur + 0.5)) * (1 - k);
      if (ul > 0) L.drawOn(ctx, [[300, 690], [780, 690]], ul, P.accent, 7);

      // WET
      const wp = pop(t, tWet - 0.05, 0.45);
      if (wp > 0) {
        const [x, y, s, lx, ly, lsz] = lay([300, 880, 1.25, 300, 1040, 70], [222, 382, 0.62, 282, 384, 52]);
        ctx.save(); ctx.translate(x, y); ctx.scale(wp, wp); dropIcon(ctx, 0, 0, s, t); ctx.restore();
        L.text(ctx, 'WET', lx, ly, lsz, P.water, 800, k > 0.5 ? 'left' : 'center', Math.min(1, wp));
      }
      // +
      const pp = L.prog(t, tCov - 0.25, tCov);
      if (pp > 0) { const [x, y, sz] = lay([540, 890, 96], [455, 384, 56]); L.text(ctx, '+', x, y, sz, P.dim, 800, 'center', pp); }
      // COVERED
      const vp = pop(t, tCov - 0.05, 0.45);
      if (vp > 0) {
        const [x, y, s, lx, ly, lsz] = lay([780, 890, 1.2, 780, 1040, 70], [562, 388, 0.55, 636, 384, 52]);
        ctx.save(); ctx.translate(x, y); ctx.scale(vp, vp); sheetIcon(ctx, 0, 0, s, t); ctx.restore();
        L.text(ctx, 'COVERED', lx, ly, lsz, P.line, 800, k > 0.5 ? 'left' : 'center', Math.min(1, vp));
      }

      // cards
      CARDS.forEach((c, i) => {
        const t0 = wt(T, 'L06', c.word[0], c.word[1]);
        const a = L.prog(t, t0 - 0.05, t0 + 0.2); if (a <= 0) return;
        const s = L.lerp(0.86, 1, L.backOut(L.prog(t, t0 - 0.05, t0 + 0.4)));
        const y0 = 478 + i * 290, h = 266, x0 = 60, w = 960;
        ctx.save(); ctx.globalAlpha *= a;
        ctx.translate(540, y0 + h / 2); ctx.scale(s, s); ctx.translate(-540, -(y0 + h / 2));
        // card
        ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 26); ctx.fillStyle = 'rgba(8,26,48,0.72)'; ctx.fill();
        ctx.strokeStyle = 'rgba(143,179,218,0.55)'; ctx.lineWidth = 3; ctx.stroke();
        // active glow on newest card
        const nextT = i < CARDS.length - 1 ? wt(T, 'L06', CARDS[i + 1].word[0], CARDS[i + 1].word[1]) : 99;
        const act = L.prog(t, t0, t0 + 0.2) * (1 - L.prog(t, nextT, nextT + 0.3));
        if (act > 0) { ctx.save(); ctx.globalAlpha *= act; ctx.strokeStyle = P.water; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 26); ctx.stroke(); ctx.restore(); }
        // illustration
        ctx.save(); ctx.translate(x0 + 30, y0 + 20);
        c.fn(ctx, t, L.prog(t, t0, t0 + 1.1));
        ctx.restore();
        // divider
        ctx.strokeStyle = 'rgba(143,179,218,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 500, y0 + 40); ctx.lineTo(x0 + 500, y0 + h - 40); ctx.stroke();
        // labels
        const lx = x0 + 500 + (w - 500) / 2;
        const fs = fitFont(ctx, c.title, 70, 380);
        const tp = L.easeOut(L.prog(t, t0 + 0.05, t0 + 0.4));
        L.text(ctx, c.title, lx, y0 + 112 - (1 - tp) * 20, fs, P.line, 800, 'center', tp);
        L.text(ctx, c.sub, lx, y0 + 186, 40, P.water, 800, 'center', L.prog(t, t0 + 0.3, t0 + 0.6));
        ctx.restore();
      });
    },
  });
})();
