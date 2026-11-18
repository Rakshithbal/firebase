// s3 — L04+L05: bills keep coming (orange, continuous) while the bank releases in steps (green).
// Where bills run ahead of releases, the area shades orange: THE GAP.
(function () {
  const START = 15.2, END = 23.75;
  const X0 = 150, X1 = 960, YB = 1190, VH = 500;
  const xf = (f) => L.lerp(X0, X1, f), yv = (v) => YB - v * VH;
  const bills = (f) => f + 0.012 * Math.sin(f * 26);
  const rel = (f) => (f >= 1 ? 1 : Math.floor(f * 4 + 1e-9) / 4);
  const CUR0 = 16.0, CUR1 = 19.3;
  const fAt = (t) => L.prog(t, CUR0, CUR1);
  const tAt = (f) => CUR0 + f * (CUR1 - CUR0);
  const BILLS = Array.from({ length: 12 }, (_, j) => 0.04 + j * 0.083);
  const SRC = { con: [290, 430], mat: [770, 430] };
  const NAMES = ['PLINTH', 'SLAB', 'WALLS', 'FINISHING'];

  function hat(ctx, x, y, s, a) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-46, 18); ctx.bezierCurveTo(-46, -52, 46, -52, 46, 18); ctx.closePath();
    ctx.fillStyle = '#FFB547'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-64, 22); ctx.lineTo(64, 22); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 14); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(14,42,71,0.55)'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22, -26); ctx.lineTo(-26, 14); ctx.moveTo(22, -26); ctx.lineTo(26, 14); ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
  }
  function bricks(ctx, x, y, s, a) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
    const B = [[-54, 4], [0, 4], [54, 4], [-27, -28], [27, -28], [0, -60]];
    for (const [bx, by] of B) { ctx.fillStyle = '#C47A57'; L.rr(ctx, bx - 26, by - 14, 52, 28, 4); ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 4.5; ctx.stroke(); }
    // cement bag beside
    ctx.beginPath(); ctx.roundRect(66, -36, 44, 58, 8); ctx.fillStyle = '#9AA7B4'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.fillStyle = P.bg; ctx.fillRect(74, -14, 28, 10);
    ctx.restore();
  }

  SCENES.push({
    id: 's3', start: START, end: END,
    draw(ctx, t, lt, T) {
      const W4 = (w) => L.wordTime(T, 'L04', w), W5 = (w) => L.wordTime(T, 'L05', w);
      const tCon = W4('contractor'), tMat = W4('material'), tNot = W4('not');
      const tBetween = W5('between'), tRel = W5('releases'), tCover = W5('cover'), tGap = W5('gap'), tYou = W5('yourself');
      const fc = fAt(t);

      // ---- legend
      const lg = L.easeOut(L.prog(t, START + 0.1, START + 0.5));
      L.tag(ctx, 'BANK RELEASES', 300, 300, 32, P.bg, P.good, lg);
      L.tag(ctx, 'YOUR BILLS', 770, 300, 32, P.bg, P.accent, L.easeOut(L.prog(t, START + 0.25, START + 0.65)));

      // ---- bill sources
      const hc = L.pop(t, tCon - 0.08, 0.45), mc = L.pop(t, tMat - 0.08, 0.45);
      hat(ctx, SRC.con[0], SRC.con[1], hc, L.clamp(hc));
      L.text(ctx, 'CONTRACTOR', SRC.con[0], 515, 32, P.line, 800, 'center', L.clamp(hc));
      bricks(ctx, SRC.mat[0] - 20, SRC.mat[1] + 10, mc, L.clamp(mc));
      L.text(ctx, 'MATERIAL', SRC.mat[0], 515, 32, P.line, 800, 'center', L.clamp(mc));

      // ---- axes
      const ax = L.easeOut(L.prog(t, START + 0.2, START + 0.8));
      L.drawOn(ctx, [[X0, YB], [X1 + 20, YB]], ax, P.dim, 4);
      L.drawOn(ctx, [[X0, YB], [X0, 630]], ax, P.dim, 4);
      if (ax > 0) {
        ctx.save(); ctx.globalAlpha *= ax; ctx.fillStyle = P.dim;
        ctx.beginPath(); ctx.moveTo(X0, 612); ctx.lineTo(X0 - 12, 634); ctx.lineTo(X0 + 12, 634); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(X1 + 38, YB); ctx.lineTo(X1 + 16, YB - 12); ctx.lineTo(X1 + 16, YB + 12); ctx.closePath(); ctx.fill();
        ctx.restore();
        L.text(ctx, 'MONEY', X0 + 22, 618, 26, P.dim, 800, 'left', ax);
        L.text(ctx, 'BUILD TIME', X1 + 30, YB + 62, 26, P.dim, 800, 'right', ax);
        for (let k = 0; k < 4; k++) {
          L.text(ctx, NAMES[k], xf((k + 0.5) / 4), YB + 28, 25, P.dim, 800, 'center', ax);
          if (k > 0) { ctx.save(); ctx.globalAlpha *= ax * 0.6; ctx.strokeStyle = P.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xf(k / 4), YB - 8); ctx.lineTo(xf(k / 4), YB + 8); ctx.stroke(); ctx.restore(); }
        }
      }

      // ---- the gap shading (L05)
      const hiA = L.easeOut(L.prog(t, tRel - 0.1, tRel + 0.4));         // highlighted gap (between release 1 and 2)
      const allA = L.easeOut(L.prog(t, tCover - 0.1, tCover + 0.5));     // all gaps
      if ((hiA > 0 || allA > 0) && fc > 0) {
        for (let k = 0; k < 4; k++) {
          const a = k === 1 ? Math.max(hiA, allA) : allA; if (a <= 0) continue;
          const f0 = k / 4, f1 = Math.min(fc, (k + 1) / 4); if (f1 <= f0) continue;
          ctx.save(); ctx.beginPath(); ctx.moveTo(xf(f0), yv(rel(f0)));
          for (let f = f0; f <= f1 + 1e-6; f += 0.004) ctx.lineTo(xf(f), yv(bills(f)));
          ctx.lineTo(xf(f1), yv(rel(f0))); ctx.closePath();
          ctx.fillStyle = L.hexA(P.accent, (k === 1 ? 0.55 : 0.32) * a); ctx.fill();
          ctx.clip(); ctx.strokeStyle = L.hexA('#FFFFFF', 0.18 * a); ctx.lineWidth = 3;
          for (let d = -400; d < 400; d += 18) { ctx.beginPath(); ctx.moveTo(xf(f0) + d, YB); ctx.lineTo(xf(f0) + d + 400, YB - 400); ctx.stroke(); }
          ctx.restore();
        }
      }

      // ---- between two releases: guides + bracket
      const gA = L.easeOut(L.prog(t, tBetween - 0.05, tBetween + 0.35)) * (1 - 0.6 * L.prog(t, tGap, tGap + 0.4));
      if (gA > 0) {
        ctx.save(); ctx.globalAlpha *= gA; ctx.setLineDash([10, 9]); ctx.strokeStyle = P.good; ctx.lineWidth = 3;
        for (const f of [0.25, 0.5]) { ctx.beginPath(); ctx.moveTo(xf(f), YB); ctx.lineTo(xf(f), 690); ctx.stroke(); }
        ctx.setLineDash([]); ctx.lineWidth = 5; ctx.strokeStyle = P.line;
        ctx.beginPath(); ctx.moveTo(xf(0.25), 700); ctx.lineTo(xf(0.25), 680); ctx.lineTo(xf(0.5), 680); ctx.lineTo(xf(0.5), 700); ctx.stroke();
        ctx.restore();
        L.text(ctx, 'BETWEEN TWO RELEASES', (xf(0.25) + xf(0.5)) / 2 + 40, 648, 28, P.line, 800, 'center', gA);
      }

      // ---- green release steps
      if (fc > 0) {
        const pts = [[xf(0), yv(0)]];
        for (let k = 1; k <= 4; k++) {
          const fb = k / 4;
          if (fc < fb) { pts.push([xf(fc), yv((k - 1) / 4)]); break; }
          pts.push([xf(fb), yv((k - 1) / 4)], [xf(fb), yv(k / 4)]);
        }
        L.drawOn(ctx, pts, 1, P.good, 9);
        // release packets at each step
        for (let k = 1; k <= 4; k++) {
          const tk = tAt(k / 4), pp = L.pop(t, tk - 0.02, 0.4);
          if (pp <= 0) continue;
          L.packet(ctx, xf(k / 4) - 46, yv(k / 4) - 34, 0.42 * pp, { glow: 1 - L.prog(t, tk, tk + 0.6) });
        }
      }
      // ---- orange bills line
      if (fc > 0) {
        const pts = []; for (let f = 0; f <= fc + 1e-6; f += 0.005) pts.push([xf(f), yv(bills(f))]);
        if (pts.length > 1) L.drawOn(ctx, pts, 1, P.accent, 9);
        const hx = xf(fc), hy = yv(bills(fc));
        if (fc < 1) { ctx.save(); ctx.fillStyle = P.accent; ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      }
      // ---- bills flying from the sources onto the line
      BILLS.forEach((f, j) => {
        const ta = tAt(f); const from = (ta < tMat + 0.3 || j % 2 === 0) ? SRC.con : SRC.mat;
        const k = L.prog(t, ta - 0.55, ta);
        if (k <= 0 || t > ta + 0.6) return;
        const e = L.easeInOut(k), tx = xf(f), ty = yv(bills(f)) - 50;
        const x = L.lerp(from[0], tx, e), y = L.lerp(from[1] + 30, ty, e) - Math.sin(k * Math.PI) * 60;
        const fade = 1 - L.prog(t, ta + 0.1, ta + 0.6);
        L.bill(ctx, x, y, 0.55, fade * L.clamp(k * 3), (1 - e) * (j % 2 ? 0.5 : -0.5));
      });

      // ---- "BILLS DON'T WAIT"
      const dw = L.pop(t, tNot - 0.05, 0.45) * (1 - L.prog(t, tBetween - 0.3, tBetween));
      if (dw > 0) { ctx.save(); ctx.translate(410, 760); ctx.scale(dw, dw); L.tag(ctx, "BILLS DON'T WAIT", 0, 0, 40, P.bg, P.accent, L.clamp(dw)); ctx.restore(); }

      // ---- THE GAP tag + leader, "YOU COVER IT"
      const gp = L.pop(t, tGap - 0.06, 0.5);
      if (gp > 0) {
        const cx = xf(0.46), cy = yv(0.36);
        L.drawOn(ctx, [[495, 800], [cx, cy]], L.easeOut(L.prog(t, tGap, tGap + 0.3)), P.line, 4);
        ctx.save(); ctx.fillStyle = P.line; ctx.globalAlpha *= L.prog(t, tGap + 0.2, tGap + 0.3); ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(300, 760); ctx.rotate(-0.04); ctx.scale(gp, gp); L.tag(ctx, 'THE GAP', 0, 0, 64, P.bg, P.accent, L.clamp(gp)); ctx.restore();
      }
      const yc = L.easeOut(L.prog(t, tYou - 0.05, tYou + 0.35));
      L.text(ctx, 'YOU COVER THIS', 255, 850 + (1 - yc) * 16, 34, P.line, 800, 'center', yc);
    },
  });
})();
