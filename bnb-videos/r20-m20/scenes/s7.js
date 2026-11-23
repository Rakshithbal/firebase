// s7 — CHECKLIST: "ASK YOUR ENGINEER:" card, two questions tick off on "where" and "site" (L08)
(function () {
  const A = window.R20A;
  const BX = 110, BY = 360, BW = 860, BH = 860;

  function pen(ctx, x, y, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(-0.75);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(96, -8); ctx.lineTo(96, 8); ctx.lineTo(14, 8); ctx.closePath();
    ctx.fillStyle = P.line; ctx.fill(); ctx.strokeStyle = P.bg; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = P.accent; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.water; ctx.fillRect(78, -8, 18, 16);
    ctx.restore();
  }

  // segments [[text,color],...] left-aligned at x
  function seg(ctx, parts, x, y, size, a, dy = 0) {
    if (a <= 0) return;
    ctx.save(); ctx.font = `800 ${size}px ${P.font}`;
    let xx = x;
    for (const [s, c] of parts) { L.text(ctx, s, xx, y + dy, size, c, 800, 'left', a); xx += ctx.measureText(s).width; }
    ctx.restore();
  }

  function box(ctx, x, y, a, tick) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = tick > 0 ? A.hexA(P.good, Math.min(1, tick * 2)) : 'rgba(255,255,255,0.04)';
    A.rr(ctx, x - 32, y - 32, 64, 64, 12); ctx.fill();
    ctx.strokeStyle = tick > 0 ? P.good : P.line; ctx.lineWidth = 5; A.rr(ctx, x - 32, y - 32, 64, 64, 12); ctx.stroke();
    ctx.restore();
    if (tick > 0) A.check(ctx, x, y + 2, 44, tick, P.bg, 9);
  }

  SCENES.push({
    id: 's7', start: L.cut(window.T, 'L08'), end: L.cut(window.T, 'L09'),
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L08', w);
      const t0 = this.start, tAsk = W('ask'), tEng = W('engineer'), tWhich = W('which'), tGrade = W('grade'), tWhere = W('where');
      const tHow = W('how'), tMix = W('mix'), tChecked = W('checked'), tSite = W('site');

      // card
      const cp = L.backOut(L.prog(t, t0 - 0.05, t0 + 0.45));
      if (cp > 0) {
        ctx.save(); ctx.globalAlpha *= L.clamp(cp * 1.5);
        ctx.translate(540, BY + BH / 2); ctx.scale(L.lerp(0.92, 1, cp), L.lerp(0.92, 1, cp)); ctx.translate(-540, -(BY + BH / 2));
        ctx.fillStyle = 'rgba(6,20,36,0.72)'; A.rr(ctx, BX, BY, BW, BH, 36); ctx.fill();
        ctx.strokeStyle = P.line; ctx.lineWidth = 5; A.rr(ctx, BX, BY, BW, BH, 36); ctx.stroke();
        // clip
        ctx.fillStyle = '#9DB4CF'; A.rr(ctx, 440, BY - 26, 200, 50, 14); ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 4; A.rr(ctx, 440, BY - 26, 200, 50, 14); ctx.stroke();
        ctx.restore();
      }

      // header: hat + ASK YOUR ENGINEER:
      const ha = A.pop(t, tAsk - 0.1, 0.45);
      A.hat(ctx, 205, 468, 1.05 * ha, Math.min(1, ha * 1.5));
      const h1 = L.easeOut(L.prog(t, tAsk - 0.05, tAsk + 0.3)), h2 = L.easeOut(L.prog(t, tEng - 0.1, tEng + 0.25));
      seg(ctx, [['ASK ', P.line]], 270, 470, 52, h1);
      ctx.save(); ctx.font = `800 52px ${P.font}`; const wA = ctx.measureText('ASK ').width; ctx.restore();
      seg(ctx, [['YOUR ENGINEER:', P.accent]], 270 + wA, 470, 52, h2);
      L.drawOn(ctx, [[160, 540], [920, 540]], L.easeOut(L.prog(t, tAsk, tEng + 0.3)), 'rgba(143,179,218,0.5)', 3);

      // row 1
      const r1 = L.easeOut(L.prog(t, tWhich - 0.08, tWhich + 0.3));
      const tick1 = L.easeOut(L.prog(t, tWhere + 0.05, tWhere + 0.35));
      box(ctx, 195, 650, r1, tick1);
      seg(ctx, [['Which ', P.line], ['grade', P.accent], [' goes', P.line]], 255, 630, 50, r1, (1 - r1) * 14);
      const r1b = L.easeOut(L.prog(t, tWhere - 0.1, tWhere + 0.2));
      seg(ctx, [['where?', P.line]], 255, 692, 50, r1b);
      // mini part chips (callback to the house section)
      const ch = L.easeOut(L.prog(t, tWhere + 0.1, tWhere + 0.45));
      ['FOOTING', 'COLUMN', 'SLAB'].forEach((s, i) => {
        const a = L.easeOut(L.prog(t, tWhere + 0.1 + i * 0.08, tWhere + 0.4 + i * 0.08));
        if (a > 0) A.pill(ctx, s, 330 + i * 200, 780, 26, P.dim, L.lerp(0.8, 1, a), a, 'rgba(28,70,115,0.6)');
      });
      L.drawOn(ctx, [[160, 850], [920, 850]], ch, 'rgba(143,179,218,0.35)', 3);

      // row 2
      const r2 = L.easeOut(L.prog(t, tHow - 0.08, tHow + 0.3));
      const tick2 = L.easeOut(L.prog(t, tSite + 0.05, tSite + 0.35));
      box(ctx, 195, 960, r2, tick2);
      seg(ctx, [['How will the ', P.line], ['mix', P.accent], [' be', P.line]], 255, 940, 50, r2, (1 - r2) * 14);
      const r2b = L.easeOut(L.prog(t, tChecked - 0.1, tChecked + 0.2));
      seg(ctx, [['checked on site?', P.line]], 255, 1002, 50, r2b);
      // small cube + magnifier hint under row 2
      const cu = L.easeOut(L.prog(t, tChecked, tChecked + 0.35));
      if (cu > 0) {
        A.cube(ctx, 262, 1150, 60, { alpha: cu, seed: 44, lw: 3 });
        ctx.save(); ctx.globalAlpha *= cu; ctx.strokeStyle = P.water; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(370, 1100, 30, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(392, 1122); ctx.lineTo(420, 1150); ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
        L.drawOn(ctx, [[460, 1120], [880, 1120]], cu, 'rgba(143,179,218,0.45)', 3);
        L.text(ctx, 'ON-SITE CHECKS', 460, 1092, 26, P.dim, 800, 'left', cu);
      }

      // pen visits each box just before the tick
      const pv1 = L.prog(t, tWhere - 0.35, tWhere + 0.05), pv2 = L.prog(t, tSite - 0.35, tSite + 0.05);
      let px = null, py = null, pa = 0;
      if (t < tWhere + 0.6) { px = L.lerp(330, 205, L.easeOut(pv1)); py = L.lerp(760, 650, L.easeOut(pv1)); pa = L.prog(t, tWhere - 0.4, tWhere - 0.25) * (1 - L.prog(t, tWhere + 0.4, tWhere + 0.6)); }
      else { px = L.lerp(330, 205, L.easeOut(pv2)); py = L.lerp(1070, 960, L.easeOut(pv2)); pa = L.prog(t, tSite - 0.4, tSite - 0.25); }
      pen(ctx, px + 20, py + 6, pa);
    },
  });
})();
