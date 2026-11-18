// s2 — DRYING vs CURING
(function () {
  const A = window.R05A;
  // small continuity slab (same geometry used at the start of s3)
  const SMALL = { x0: 150, x1: 930, top: 1150, th: 70, wallW: 60, ground: 1290, seed: 21, rebarR: 7, lw: 5 };
  A.SMALL = SMALL;

  function card(ctx, y, h, appear, solid, color, fillA) {
    if (appear <= 0) return;
    const x = 100, w = 880, s = L.lerp(0.9, 1, L.backOut(appear));
    ctx.save(); ctx.globalAlpha *= L.clamp(appear * 1.5);
    ctx.translate(540, y + h / 2); ctx.scale(s, s); ctx.translate(-540, -(y + h / 2));
    if (fillA > 0) { ctx.fillStyle = A.hexA(color, fillA); A.rr(ctx, x, y, w, h, 36); ctx.fill(); }
    ctx.lineWidth = 5; ctx.strokeStyle = solid > 0 ? color : A.hexA(P.dim, 0.8);
    if (solid <= 0) ctx.setLineDash([18, 14]);
    A.rr(ctx, x, y, w, h, 36); ctx.stroke();
    ctx.restore();
  }

  function question(ctx, x, y, a, t, ph) {
    if (a <= 0) return;
    const s = 1 + 0.06 * Math.sin(t * 5 + ph);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    L.text(ctx, '?', 0, 0, 110, P.dim, 800, 'center', a * 0.85);
    ctx.restore();
  }

  SCENES.push({
    id: 's2', start: 4.41, end: 8.84,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L02', w);
      const t0 = this.start, tDrying = W('drying'), tCuring = W('curing'), tGets = W('gets');
      const tStrong2 = L.wordAt(T, 'L02', 9);

      // heading
      const hA = L.easeOut(L.prog(t, t0 + 0.05, t0 + 0.45));
      const hp = 1 + 0.05 * Math.exp(-Math.pow((t - tStrong2 - 0.1) / 0.18, 2));
      ctx.save(); ctx.translate(540, 300 - (1 - hA) * 30); ctx.scale(hp, hp);
      L.text(ctx, 'WHAT MAKES IT STRONG?', 0, 0, 52, P.line, 800, 'center', hA);
      ctx.restore();

      // ---- card 1: DRYING ----
      const c1y = 390, c1h = 240, c1c = c1y + c1h / 2;
      const ap1 = L.prog(t, t0 + 0.2, t0 + 0.6);
      const on1 = L.prog(t, tDrying - 0.05, tDrying + 0.3);
      const strike = L.easeOut(L.prog(t, tDrying + 0.3, tDrying + 0.55));
      const dim1 = 1 - 0.45 * L.prog(t, tDrying + 0.55, tDrying + 0.9);
      card(ctx, c1y, c1h, ap1, on1, strike > 0 ? A.hexA(P.bad, 0.85) : P.line, 0);
      question(ctx, 540, c1c, ap1 * (1 - on1), t, 0);
      if (on1 > 0) {
        const s = L.lerp(0.55, 1, L.backOut(on1));
        ctx.save(); ctx.translate(560, c1c + 4); ctx.scale(s, s);
        L.text(ctx, 'DRYING', 0, 0, 124, P.line, 800, 'center', on1 * dim1);
        ctx.restore();
        // evaporation icon (left)
        ctx.save(); ctx.globalAlpha *= on1 * dim1; ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const x = 175 + i * 30, ph = t * 3 + i;
          ctx.beginPath();
          for (let k = 0; k <= 12; k++) { const yy = c1c + 55 - k * 9 - ((t * 30 + i * 13) % 18); const xx = x + Math.sin(k * 0.7 + ph) * 8; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        }
        ctx.restore();
        // strike
        if (strike > 0) {
          ctx.font = `800 124px ${P.font}`; const ww = ctx.measureText('DRYING').width;
          L.drawOn(ctx, [[560 - ww / 2 - 26, c1c + 14], [560 + ww / 2 + 26, c1c - 10]], strike, P.bad, 13);
          // X badge (right)
          const xb = L.backOut(L.prog(t, tDrying + 0.5, tDrying + 0.8));
          if (xb > 0) {
            ctx.save(); ctx.translate(905, c1c); ctx.scale(xb, xb);
            ctx.strokeStyle = P.bad; ctx.lineWidth = 9; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-22, -22); ctx.lineTo(22, 22); ctx.moveTo(22, -22); ctx.lineTo(-22, 22); ctx.stroke();
            ctx.restore();
          }
        }
      }

      // ---- card 2: CURING ----
      const c2y = 690, c2h = 260, c2c = c2y + c2h / 2;
      const ap2 = L.prog(t, t0 + 0.35, t0 + 0.75);
      const on2 = L.prog(t, tCuring - 0.08, tCuring + 0.25);
      const glow = on2 > 0 ? 0.12 + 0.05 * Math.sin(t * 4) : 0;
      card(ctx, c2y, c2h, ap2, on2, P.water, glow * on2);
      // anticipation pulse on "gets strong"
      const ant = Math.exp(-Math.pow((t - tGets - 0.2) / 0.3, 2)) * (1 - on2);
      question(ctx, 540, c2c, ap2 * (1 - on2) * (1 + ant * 0.3), t, 1.5);
      if (on2 > 0) {
        const s = L.lerp(0.4, 1, L.backOut(on2));
        ctx.save(); ctx.translate(555, c2c + 4); ctx.scale(s, s);
        L.text(ctx, 'CURING', 0, 0, 128, P.water, 800, 'center', on2);
        ctx.restore();
        // water drop icon (left), bobbing
        const db = L.backOut(L.prog(t, tCuring + 0.05, tCuring + 0.35));
        A.drop(ctx, 200, c2c + 20 + Math.sin(t * 3.2) * 6, 36 * db, P.water, 1);
        // thin strength arrow up (right)
        const ar = L.easeOut(L.prog(t, tCuring + 0.15, tCuring + 0.6));
        if (ar > 0) {
          const ax = 905, yb = c2y + c2h - 40, yt = L.lerp(yb, c2y + 38, ar);
          L.drawOn(ctx, [[ax, yb], [ax, yt]], 1, P.good, 7);
          L.drawOn(ctx, [[ax - 22, yt + 24], [ax, yt], [ax + 22, yt + 24]], 1, P.good, 7);
        }
      }

      // ---- small slab (continuity) ----
      const sp = L.prog(t, t0 - 0.1, t0 + 0.6);
      const film = L.easeOut(L.prog(t, tCuring + 0.2, tCuring + 0.8));
      A.slab(ctx, Object.assign({}, SMALL, { p: sp, film, t }));
      // drops falling onto slab after CURING
      if (t > tCuring) {
        for (let k = 0; k < 7; k++) {
          const per = 0.7, ph = (t - tCuring - k * 0.11) / per;
          if (ph < 0) continue;
          const f = ph % 1, x = 220 + k * 105 + (Math.floor(ph) % 2) * 30;
          const y = L.lerp(1010, 1140, f * f);
          A.drop(ctx, x, y, 10, P.water, f < 0.9 ? 1 : (1 - f) * 10);
          if (f > 0.85) {
            const rr = (f - 0.85) / 0.15;
            ctx.save(); ctx.globalAlpha *= 1 - rr; ctx.strokeStyle = P.water; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.ellipse(x, 1142, 10 + rr * 26, 4 + rr * 6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          }
        }
      }
    },
  });
})();
