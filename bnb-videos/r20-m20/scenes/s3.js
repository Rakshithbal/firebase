// s3 — GRADE LADDER: generic steps going up (no names, no numbers), arrow "HIGHER GRADE = STRONGER", rupee coin stack grows on "higher cost" (L04)
(function () {
  const A = window.R20A;
  const N = 5, X0 = 110, SW = 122, GAP = 12, BOT = 1210;
  const H = (i) => 150 + i * 122;

  function coin(ctx, x, y, rx, ry, th, top) {
    // side band
    ctx.beginPath(); ctx.moveTo(x - rx, y); ctx.lineTo(x - rx, y + th); ctx.ellipse(x, y + th, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(x + rx, y);
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI, false); ctx.closePath();
    ctx.fillStyle = '#C98A2E'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 3.5; ctx.stroke();
    // ridges
    ctx.strokeStyle = 'rgba(14,42,71,0.25)'; ctx.lineWidth = 2;
    for (let k = -4; k <= 4; k++) { const xx = x + (k / 4.6) * rx, yy = y + ry * Math.sqrt(Math.max(0, 1 - Math.pow(k / 4.6, 2))); ctx.beginPath(); ctx.moveTo(xx, yy + 2); ctx.lineTo(xx, yy + th - 1); ctx.stroke(); }
    // face
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFC261'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, rx * 0.74, ry * 0.7, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(150,90,20,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
    if (top) {
      ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx * 1.5);
      L.text(ctx, '₹', 0, 2, 44, '#8A5410', 800, 'center', 1); ctx.restore();
    }
  }

  SCENES.push({
    id: 's3', start: 15.225, end: 19.597,
    draw(ctx, t, lt, T) {
      const W = (w, n = 0) => A.wt(T, 'L04', w, n);
      const t0 = this.start, tHigher = W('higher'), tNum = W('number'), tStr = W('stronger'), tMix = W('mix');
      const tUs = W('usually'), tHigher2 = W('higher', 1), tCost = W('cost');

      // ---- steps (generic grade steps)
      const climb = L.easeInOut(L.prog(t, tHigher, tStr + 0.2)) * (N - 1);
      for (let i = 0; i < N; i++) {
        const g = L.easeOut(L.prog(t, t0 + 0.05 + i * 0.1, t0 + 0.5 + i * 0.1));
        if (g <= 0) continue;
        const x = X0 + i * (SW + GAP), h = H(i) * g, y = BOT - h;
        ctx.save();
        // concrete body
        const gr = ctx.createLinearGradient(0, y, 0, BOT); gr.addColorStop(0, '#B9C4CF'); gr.addColorStop(1, '#7F8C99');
        ctx.fillStyle = gr; A.rr(ctx, x, y, SW, h, 8); ctx.fill();
        // aggregate denser on higher steps
        const r = L.rng(70 + i); ctx.fillStyle = 'rgba(70,84,100,0.5)';
        const n = Math.round(h * SW / (1500 - i * 180));
        for (let k = 0; k < n; k++) { ctx.beginPath(); ctx.arc(x + 8 + r() * (SW - 16), y + 8 + r() * Math.max(1, h - 16), 2 + r() * 4, 0, Math.PI * 2); ctx.fill(); }
        // green strength cap grows with the step
        const cap = 14 + i * 9;
        ctx.save(); A.rr(ctx, x, y, SW, h, 8); ctx.clip();
        ctx.fillStyle = A.hexA(P.good, 0.85); ctx.fillRect(x, y, SW, cap); ctx.restore();
        // highlight on the step being "climbed"
        const hl = Math.max(0, 1 - Math.abs(climb - i) * 1.2) * L.prog(t, tHigher, tHigher + 0.2) * (1 - L.prog(t, tStr + 0.3, tStr + 0.8));
        ctx.strokeStyle = hl > 0.05 ? P.good : P.line; ctx.lineWidth = 5 + hl * 4; A.rr(ctx, x, y, SW, h, 8); ctx.stroke();
        if (hl > 0.05) { ctx.save(); ctx.globalAlpha *= hl * 0.35; ctx.fillStyle = P.good; A.rr(ctx, x, y, SW, h, 8); ctx.fill(); ctx.restore(); }
        ctx.restore();
      }
      // ground line
      L.drawOn(ctx, [[80, BOT], [1000, BOT]], L.easeOut(L.prog(t, t0 - 0.2, t0 + 0.4)), P.dim, 4);

      // ---- arrow up the steps on "higher"
      const ap = L.easeInOut(L.prog(t, tHigher - 0.05, tNum + 0.35));
      if (ap > 0) {
        const ax0 = X0 + SW * 0.5, ay0 = BOT - H(0) - 70, ax1 = X0 + (N - 1) * (SW + GAP) + SW * 0.5, ay1 = BOT - H(N - 1) - 80;
        const ex = L.lerp(ax0, ax1, ap), ey = L.lerp(ay0, ay1, ap);
        L.drawOn(ctx, [[ax0, ay0], [ex, ey]], 1, P.good, 11);
        const an = Math.atan2(ay1 - ay0, ax1 - ax0);
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(an); ctx.fillStyle = P.good;
        ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-24, -22); ctx.lineTo(-24, 22); ctx.closePath(); ctx.fill(); ctx.restore();
      }

      // ---- headline: HIGHER GRADE = STRONGER
      ctx.save(); ctx.font = `800 58px ${P.font}`;
      const p1 = 'HIGHER GRADE', p2 = ' = ', p3 = 'STRONGER';
      const w1 = ctx.measureText(p1).width, w2 = ctx.measureText(p2).width, w3 = ctx.measureText(p3).width; ctx.restore();
      let hx = 540 - (w1 + w2 + w3) / 2; const hy = 300;
      const a1 = L.easeOut(L.prog(t, tHigher - 0.05, tHigher + 0.3)), a3 = L.easeOut(L.prog(t, tStr - 0.08, tStr + 0.25));
      L.text(ctx, p1, hx, hy + (1 - a1) * 16, 58, P.line, 800, 'left', a1);
      L.text(ctx, p2, hx + w1, hy, 58, P.dim, 800, 'left', a3);
      const s3 = L.lerp(0.7, 1, A.pop(t, tStr - 0.08, 0.4));
      ctx.save(); ctx.translate(hx + w1 + w2 + w3 / 2, hy); ctx.scale(s3, s3); L.text(ctx, p3, 0, 0, 58, P.good, 800, 'center', a3); ctx.restore();
      const ul = L.easeInOut(L.prog(t, tMix - 0.1, tMix + 0.3));
      L.drawOn(ctx, [[hx + w1 + w2, hy + 44], [hx + w1 + w2 + w3, hy + 44]], ul, P.good, 6);

      // ---- coin stack (rupee) grows on "usually a higher cost"
      const cx = 900, rx = 66, ry = 20, th = 16;
      const nC = Math.floor(L.lerp(0, 9.999, L.easeOut(L.prog(t, tUs - 0.1, tCost + 0.2))));
      const base = 1180;
      for (let i = 0; i < nC; i++) {
        const born = tUs - 0.1 + (i / 10) * (tCost + 0.3 - tUs);
        const drop = L.easeOut(L.prog(t, born, born + 0.14));
        const y = base - i * th - (1 - drop) * 60;
        ctx.save(); ctx.globalAlpha *= L.clamp(drop * 2);
        coin(ctx, cx + Math.sin(i * 2.3) * 3, y, rx, ry, th, i === nC - 1);
        ctx.restore();
      }
      const ca = A.pop(t, tCost - 0.05, 0.45);
      if (ca > 0) {
        L.tag(ctx, 'COST', cx, 1262, 38, P.bg, P.accent, Math.min(1, ca * 1.5));
        // small up-arrow
        const y1 = base - nC * th - 70, ar = L.easeOut(L.prog(t, tCost, tCost + 0.35));
        L.drawOn(ctx, [[cx, y1 + 40], [cx, L.lerp(y1 + 40, y1 - 40, ar)]], 1, P.accent, 8);
        const yy = L.lerp(y1 + 40, y1 - 40, ar);
        L.drawOn(ctx, [[cx - 18, yy + 20], [cx, yy], [cx + 18, yy + 20]], ar, P.accent, 8);
      }
    },
  });
})();
