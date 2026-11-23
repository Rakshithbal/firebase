// s6 — (L08) the photo goes to the engineer (hard hat, no face) before the rains; two outcomes: SEAL IT / CLOSER LOOK.
(function () {
  const A = window.R15A;
  const CR = A.crackPts(1521, -70, 18, 70, -14, 7, 8);

  function photoCard(ctx, x, y, s, rot, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = '#F4F7FB'; A.rr(ctx, -125, -140, 250, 280, 14); ctx.fill();
    ctx.fillStyle = '#46688C'; ctx.fillRect(-105, -120, 210, 200);
    ctx.strokeStyle = 'rgba(234,242,255,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, 80); ctx.moveTo(-105, -20); ctx.lineTo(105, -20); ctx.stroke();
    ctx.save(); ctx.translate(0, -20); L.drawOn(ctx, CR, 1, P.bad, 4);
    ctx.strokeStyle = '#F4F7FB'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 2, 88, 50, -0.15, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    L.text(ctx, 'TERRACE', 0, 112, 26, '#3A5675', 800, 'center', 1);
    ctx.restore();
  }

  function card(ctx, t, t0, cx, cy, label, color, icon) {
    const s = A.pop(t, t0 - 0.08, 0.42); if (s <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.globalAlpha *= Math.min(1, s * 1.5);
    ctx.fillStyle = '#16406A'; A.rr(ctx, -200, -130, 400, 260, 26); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.stroke();
    icon(ctx, L.prog(t, t0, t0 + 0.7));
    L.text(ctx, label, 0, 82, 46, color, 800, 'center', 1);
    ctx.restore();
  }

  SCENES.push({
    id: 's6', start: RT(29.0), end: RT(35.24),
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L08', w);
      const tShow = W('show'), tEng = W('engineer'), tBefore = W('before'), tRains = W('rains'), tAsk = W('ask'), tWhich = W('which');
      const tSeal = W('sealing'), tCloser = W('closer');

      // before the rains (top)
      const ba = A.fade(t, tBefore - 0.05, 0.3);
      if (ba > 0) {
        A.cloud(ctx, 330, 318, 0.42 * A.pop(t, tBefore - 0.05, 0.4), ba, 0.85);
        A.rain(ctx, t, 290, 400, 345, 400, 8, ba * 0.8, 9, 0.2);
        A.popTag(ctx, t, tRains - 0.15, 'BEFORE THE RAINS', 640, 318, 38, P.bg, P.water);
      }

      // photo card flies in to the left, then nudges toward the engineer
      const fly = L.easeOut(L.prog(t, tShow - 0.35, tShow + 0.15));
      const nudge = L.easeInOut(L.prog(t, tEng + 0.1, tEng + 0.5));
      photoCard(ctx, L.lerp(-180, 290, fly) + nudge * 20, 570, 1, L.lerp(-0.5, -0.08, fly), Math.min(1, fly * 2));
      // dashed arrow card -> engineer
      const ar = L.easeInOut(L.prog(t, tEng - 0.05, tEng + 0.35));
      if (ar > 0) {
        ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40; L.drawOn(ctx, [[450, 570], [610, 570]], ar, P.line, 5); ctx.restore();
        if (ar > 0.95) { ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(592, 552); ctx.lineTo(612, 570); ctx.lineTo(592, 588); ctx.stroke(); ctx.restore(); }
      }
      // engineer
      const es = A.pop(t, tEng - 0.12, 0.45);
      A.engineer(ctx, 790, 540 + Math.sin(t * 2) * 3, 0.95 * es, Math.min(1, es * 1.4));
      A.popTag(ctx, t, tEng + 0.15, 'YOUR ENGINEER', 790, 770, 36, P.bg, P.line);
      // question bubble on "ask"
      const qa = A.pop(t, tAsk - 0.05, 0.4);
      if (qa > 0) {
        ctx.save(); ctx.translate(930, 410); ctx.scale(qa, qa);
        ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-30, 30); ctx.lineTo(-58, 62); ctx.lineTo(-8, 42); ctx.closePath(); ctx.fill();
        L.text(ctx, '?', 0, 4, 62, P.bg, 800, 'center', 1); ctx.restore();
      }

      // branch to two outcomes
      const br = L.easeInOut(L.prog(t, tWhich - 0.1, tWhich + 0.5));
      if (br > 0) {
        L.drawOn(ctx, [[790, 808], [790, 880]], L.prog(br, 0, 0.3), P.dim, 5);
        L.drawOn(ctx, [[790, 880], [300, 880], [300, 935]], L.prog(br, 0.3, 1), P.dim, 5);
        L.drawOn(ctx, [[790, 880], [790, 935]], L.prog(br, 0.3, 0.6), P.dim, 5);
        ctx.save(); ctx.globalAlpha *= br; ctx.fillStyle = P.dim; ctx.beginPath(); ctx.arc(790, 880, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      card(ctx, t, tSeal, 300, 1070, 'SEAL IT', P.good, (c, p) => {
        c.save(); c.translate(0, -36);
        L.drawOn(c, CR.map(([x, y]) => [x * 1.2, y]), 1, P.bad, 5);
        c.globalAlpha *= 0.95; L.drawOn(c, [[-92, 8], [-40, -4], [10, 6], [92, -10]], L.easeInOut(L.prog(p, 0.1, 0.8)), P.good, 22);
        c.restore();
      });
      card(ctx, t, tCloser, 790, 1070, 'CLOSER LOOK', P.accent, (c, p) => {
        c.save(); c.translate(0, -36);
        L.drawOn(c, CR.map(([x, y]) => [x * 1.2, y]), 1, P.bad, 5);
        const k = L.easeOut(L.prog(p, 0, 0.6));
        c.translate(L.lerp(60, 6, k), L.lerp(-10, -4, k));
        c.strokeStyle = P.line; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 42, 0, Math.PI * 2); c.stroke();
        c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(30, 30); c.lineTo(62, 58); c.stroke();
        c.restore();
      });
    },
  });
})();
