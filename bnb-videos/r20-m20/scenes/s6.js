// s6 — EXTRA WATER: bucket tips into the tray, stiff heap slumps into a runny flow, strength bar drops below DESIGNED (L07)
(function () {
  const A = window.R20A;
  const TRAY = { x0: 120, x1: 700, top: 960, bot: 1050 };
  const BAR = { x: 830, top: 470, bot: 1060, w: 92 };
  const DES = 0.78;

  function bucket(ctx, x, y, rot, a, fillA) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
    // body (pivot near the rim, right side)
    ctx.beginPath(); ctx.moveTo(-70, -60); ctx.lineTo(70, -60); ctx.lineTo(54, 70); ctx.lineTo(-54, 70); ctx.closePath();
    ctx.fillStyle = '#1C4673'; ctx.fill();
    // water inside (stays level-ish visually: simple band near the rim)
    ctx.save(); ctx.clip(); ctx.fillStyle = A.hexA(P.water, 0.85); ctx.fillRect(-80, -40 + (1 - fillA) * 110, 160, 130); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-70, -60); ctx.lineTo(70, -60); ctx.lineTo(54, 70); ctx.lineTo(-54, 70); ctx.closePath();
    ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -60, 70, 14, 0, 0, Math.PI * 2); ctx.stroke();
    // handle
    ctx.beginPath(); ctx.arc(0, -60, 76, Math.PI * 1.08, Math.PI * 1.92); ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }

  function mix(ctx, slump, t, flow) {
    // heap profile -> flat runny surface. slump 0..1
    const { x0, x1, top, bot } = TRAY, cx = (x0 + x1) / 2;
    const pts = [];
    for (let x = x0 + 14; x <= x1 - 14; x += 8) {
      const u = (x - cx) / ((x1 - x0) / 2);
      const heap = top - 150 * Math.max(0, 1 - Math.pow(Math.abs(u) / 0.62, 1.6)) + 20;
      const flat = top + 26 + Math.sin(x * 0.04 - t * 5) * 7 * flow + Math.sin(x * 0.017 + t * 3) * 4 * flow;
      pts.push([x, L.lerp(heap, flat, slump)]);
    }
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x0 + 14, bot - 8);
    for (const [x, y] of pts) ctx.lineTo(x, Math.min(bot - 8, y));
    ctx.lineTo(x1 - 14, bot - 8); ctx.closePath();
    const g = ctx.createLinearGradient(0, top - 140, 0, bot); g.addColorStop(0, '#B4BFCB'); g.addColorStop(1, '#7C8996');
    ctx.fillStyle = g; ctx.fill();
    // wet sheen as it gets runny
    if (slump > 0) {
      ctx.save(); ctx.clip(); ctx.globalAlpha *= slump * 0.55; ctx.fillStyle = P.water; ctx.fillRect(x0, top - 160, x1 - x0, 60 + 170 * (1 - slump)); ctx.restore();
    }
    ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, Math.min(bot - 8, y))); ctx.stroke();
    // speckles on heap
    const r = L.rng(61); ctx.fillStyle = 'rgba(70,84,100,0.5)';
    for (let i = 0; i < 40; i++) { const x = x0 + 40 + r() * (x1 - x0 - 80), yy = bot - 18 - r() * L.lerp(120, 40, slump); ctx.beginPath(); ctx.arc(x, yy, 2 + r() * 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  SCENES.push({
    id: 's6', start: 31.994, end: 35.318,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L07', w);
      const t0 = this.start, tExtra = W('extra'), tWater = W('water'), tEasier = W('easier'), tPour = W('pour'), tBut = W('but'), tWeak = W('weaker');

      // tray
      const tp = L.easeOut(L.prog(t, t0 - 0.15, t0 + 0.5));
      const { x0, x1, top, bot } = TRAY;
      L.drawOn(ctx, [[x0 - 20, top - 10], [x0, bot], [x1, bot], [x1 + 20, top - 10]], tp, P.line, 7);
      // mix: heap until "easier", then slumps & flows
      const slump = L.easeInOut(L.prog(t, tWater + 0.5, tPour + 0.2));
      if (tp > 0) { ctx.save(); ctx.globalAlpha *= tp; mix(ctx, slump, t, L.prog(t, tEasier - 0.2, tEasier + 0.3)); ctx.restore(); }
      // flow arrows (easier to pour)
      const fa = L.easeOut(L.prog(t, tEasier - 0.05, tEasier + 0.3));
      if (fa > 0) {
        ctx.save(); ctx.globalAlpha *= fa; ctx.strokeStyle = P.water; ctx.lineWidth = 6; ctx.lineCap = 'round';
        for (const [xa, dir] of [[230, -1], [590, 1]]) {
          const o = ((t * 60) % 40) * dir;
          ctx.beginPath(); ctx.moveTo(xa + o, 1100); ctx.lineTo(xa + o + 70 * dir, 1100); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(xa + o + 52 * dir, 1084); ctx.lineTo(xa + o + 70 * dir, 1100); ctx.lineTo(xa + o + 52 * dir, 1116); ctx.stroke();
        }
        ctx.restore();
      }

      // bucket: appears on "extra", tips on "water", pours
      const ba = A.pop(t, tExtra - 0.12, 0.45);
      const tip = L.easeInOut(L.prog(t, tWater - 0.1, tWater + 0.35)) * (1 - L.easeInOut(L.prog(t, tPour + 0.1, tPour + 0.6)) * 0.6);
      const bx = 300, by = 560;
      const pour = L.prog(t, tWater + 0.15, tWater + 0.3) * (1 - L.prog(t, tPour - 0.1, tPour + 0.2));
      if (pour > 0) {
        // water stream from the rim down into the tray
        const lipX = bx + 80, lipY = by + 86; // lower rim point when tipped
        ctx.save(); ctx.globalAlpha *= pour; ctx.strokeStyle = A.hexA(P.water, 0.9); ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          ctx.lineWidth = 16 - k * 4; ctx.beginPath(); ctx.moveTo(lipX + k * 4, lipY);
          for (let s = 1; s <= 11; s++) { const yy = lipY + s * 28; ctx.lineTo(lipX + 14 + Math.pow(s / 11, 0.5) * 30 + Math.sin(s * 0.9 + t * 14 + k) * 4, yy); }
          ctx.stroke();
        }
        // drops
        for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1; A.drop(ctx, lipX + 40 + (i % 3 - 1) * 26, L.lerp(lipY + 60, top - 10, ph), 9, P.water, 0.9); }
        ctx.restore();
      }
      bucket(ctx, bx, by, tip * 1.9, Math.min(1, ba * 1.5), 1 - pour * 0.5 - L.prog(t, tWater + 0.2, tPour) * 0.4);
      const et = A.pop(t, tExtra - 0.05, 0.4);
      A.pill(ctx, 'EXTRA WATER', 300, 380, 40, P.water, et, Math.min(1, et * 1.5));

      // strength bar drops on "but weaker"
      const bp = L.easeOut(L.prog(t, t0 - 0.1, t0 + 0.6));
      const drop = L.easeInOut(L.prog(t, tBut, tWeak + 0.35));
      const f = L.lerp(DES, 0.44, drop) * L.easeOut(L.prog(t, t0, t0 + 0.6));
      A.bar(ctx, Object.assign({}, BAR, { p: bp, f, t, label: bp, designed: DES, dA: L.easeOut(L.prog(t, t0 + 0.2, t0 + 0.6)), warn: drop }));
      // down arrow
      const da = L.easeOut(L.prog(t, tWeak - 0.05, tWeak + 0.3));
      if (da > 0) {
        const ax = BAR.x + BAR.w + 50, y0 = 560, y1 = L.lerp(560, 760, da);
        L.drawOn(ctx, [[ax, y0], [ax, y1]], 1, P.accent, 9);
        L.drawOn(ctx, [[ax - 20, y1 - 22], [ax, y1], [ax + 20, y1 - 22]], 1, P.accent, 9);
      }

      // EASIER TO POUR, WEAKER
      ctx.save(); ctx.font = `800 50px ${P.font}`;
      const s1 = 'EASIER TO POUR, ', s2 = 'WEAKER';
      const w1 = ctx.measureText(s1).width, w2 = ctx.measureText(s2).width; ctx.restore();
      const xx = 540 - (w1 + w2) / 2, yy = 1250;
      const a1 = L.easeOut(L.prog(t, tEasier - 0.05, tEasier + 0.3)), a2 = A.pop(t, tWeak - 0.06, 0.4);
      if (a1 > 0) {
        ctx.save(); ctx.globalAlpha *= a1; ctx.fillStyle = 'rgba(6,20,36,0.78)'; A.rr(ctx, xx - 34, yy - 46, w1 + w2 + 68, 92, 46); ctx.fill();
        ctx.strokeStyle = a2 > 0 ? P.accent : P.water; ctx.lineWidth = 4; A.rr(ctx, xx - 34, yy - 46, w1 + w2 + 68, 92, 46); ctx.stroke(); ctx.restore();
      }
      L.text(ctx, s1, xx, yy + 2, 50, P.water, 800, 'left', a1);
      ctx.save(); ctx.translate(xx + w1 + w2 / 2, yy + 2); ctx.scale(L.lerp(0.6, 1, a2), L.lerp(0.6, 1, a2));
      L.text(ctx, s2, 0, 0, 50, P.accent, 800, 'center', Math.min(1, a2 * 1.5)); ctx.restore();
    },
  });
})();
