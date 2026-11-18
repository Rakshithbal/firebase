// s5 — L08: plan your own cash for each gap (orange gap boxes filled with green "your cash"), then a
// "Confirm with your bank or CA" note card.
(function () {
  const START = 32.35, END = 37.95;
  const XS = [210, 430, 650, 870], BW = 150, BASE = 1010;
  const HS = [340, 430, 300, 390];   // illustrative only, no values
  const NAMES = ['PLINTH', 'SLAB', 'WALLS', 'FINISHING'];

  SCENES.push({
    id: 's5', start: START, end: END,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L08', w);
      const tPlan = W('plan'), tCash = W('cash'), tEach = W('each'), tGap = W('gap'), tConf = W('confirm'), tBank = W('bank'), tCA = W('c');

      // header
      const h1 = L.easeOut(L.prog(t, tPlan - 0.08, tPlan + 0.3));
      L.text(ctx, 'YOUR CASH PLAN', 540, 300 + (1 - h1) * 20, 72, P.line, 800, 'center', h1);
      // legend
      const lg = L.easeOut(L.prog(t, tCash - 0.1, tCash + 0.3));
      if (lg > 0) {
        ctx.save(); ctx.globalAlpha *= lg;
        ctx.setLineDash([8, 6]); ctx.strokeStyle = P.accent; ctx.lineWidth = 4; L.rr(ctx, 250, 388, 44, 34, 6); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = P.good; L.rr(ctx, 560, 388, 44, 34, 6); ctx.fill();
        ctx.restore();
        L.text(ctx, 'GAP', 310, 406, 32, P.accent, 800, 'left', lg);
        L.text(ctx, 'YOUR CASH', 620, 406, 32, P.good, 800, 'left', lg);
      }
      // baseline
      L.drawOn(ctx, [[100, BASE], [980, BASE]], L.easeOut(L.prog(t, START + 0.1, START + 0.6)), P.dim, 4);

      XS.forEach((x, i) => {
        const h = HS[i], top = BASE - h;
        const ga = L.pop(t, tPlan + 0.15 + i * 0.12, 0.45);
        if (ga <= 0) return;
        // gap box (dashed orange outline, faint fill)
        ctx.save(); ctx.globalAlpha *= L.clamp(ga);
        ctx.translate(x, BASE); ctx.scale(1, ga); ctx.translate(-x, -BASE);
        ctx.fillStyle = L.hexA(P.accent, 0.14); L.rr(ctx, x - BW / 2, top, BW, h, 10); ctx.fill();
        ctx.setLineDash([12, 9]); ctx.strokeStyle = P.accent; ctx.lineWidth = 5; ctx.stroke();
        ctx.restore();
        // your-cash fill on "each gap"
        const fp = L.easeInOut(L.prog(t, tEach - 0.05 + i * 0.16, tEach + 0.45 + i * 0.16));
        if (fp > 0) {
          const fy = BASE - h * fp;
          ctx.save(); L.rr(ctx, x - BW / 2 + 7, top + 7, BW - 14, h - 14, 6); ctx.clip();
          const g = ctx.createLinearGradient(x - BW / 2, 0, x + BW / 2, 0); g.addColorStop(0, '#5CC489'); g.addColorStop(0.5, P.good); g.addColorStop(1, '#4FA877');
          ctx.fillStyle = g; ctx.fillRect(x - BW / 2, fy, BW, BASE - fy);
          ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 10; const off = (t * 40) % 40;
          for (let yy = fy - 60 - off + 40; yy < BASE + 60; yy += 40) { ctx.beginPath(); ctx.moveTo(x - BW / 2, yy + 30); ctx.lineTo(x + BW / 2, yy); ctx.stroke(); }
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x - BW / 2, fy, BW, 4);
          ctx.restore();
          L.text(ctx, '₹', x, BASE - h / 2, 64, P.bg, 800, 'center', L.prog(fp, 0.6, 1) * 0.8);
        }
        // covered check
        const ck = L.prog(t, tEach + 0.45 + i * 0.16, tEach + 0.85 + i * 0.16);
        if (ck > 0) L.badge(ctx, x, top - 42, 26, ck);
        L.text(ctx, NAMES[i], x, BASE + 36, 27, P.dim, 800, 'center', L.clamp(ga));
      });
      L.text(ctx, 'ILLUSTRATION ONLY · NOT TO SCALE', 540, BASE + 86, 22, 'rgba(143,179,218,0.7)', 800, 'center', L.easeOut(L.prog(t, tGap, tGap + 0.4)));

      // ---- confirm note card
      const cp = L.easeOut(L.prog(t, tConf - 0.15, tConf + 0.3));
      if (cp > 0) {
        const y = 1215 + (1 - cp) * 40;
        ctx.save(); ctx.globalAlpha *= cp;
        ctx.fillStyle = 'rgba(234,242,255,0.96)'; L.rr(ctx, 100, y - 70, 880, 140, 28); ctx.fill();
        ctx.restore();
        L.badge(ctx, 175, y, 36, L.prog(t, tConf, tConf + 0.5), cp);
        const parts = [['Confirm with your ', P.bg, 0], ['bank', '#1E8A55', tBank], [' or ', P.bg, 0], ['CA', '#1E8A55', tCA]];
        ctx.save(); ctx.font = `800 50px ${P.font}`; let x = 240;
        for (const [s, c, th] of parts) {
          const w = ctx.measureText(s).width;
          const hl = th ? L.prog(t, th - 0.05, th + 0.2) : 0;
          L.text(ctx, s, x, y + 2, 50, P.bg, 800, 'left', cp);
          if (hl > 0) { L.text(ctx, s, x, y + 2, 50, c, 800, 'left', cp * hl); L.drawOn(ctx, [[x, y + 36], [x + w, y + 36]], L.easeOut(hl), c, 5); }
          x += w;
        }
        ctx.restore();
      }
    },
  });
})();
