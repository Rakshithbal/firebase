// s4 — (L06) top-down terrace plan. Footsteps walk the terrace; rings pop on parapet, pipes, and where water stands.
(function () {
  const A = window.R15A;
  const OX0 = 110, OX1 = 970, OY0 = 300, OY1 = 1220, TH = 36;
  const IX0 = OX0 + TH, IX1 = OX1 - TH, IY0 = OY0 + TH, IY1 = OY1 - TH;
  const DOOR = [200, 320]; // opening in bottom parapet (stair head)
  const OUTLET = [IX1 - 4, 1120], VENT = [250, 450], PUDDLE = [430, 830];
  const PCRACK = A.crackPts(1504, 560, IY0 + 2, 720, IY0 + 6, 8, 5);
  const PCRACK2 = A.crackPts(1505, 640, IY0 + 4, 662, IY0 + 52, 4, 6);
  const STEPS = (() => {
    const path = [[260, 1200], [290, 1040], [380, 960], [560, 930], [700, 820], [730, 660], [760, 600]];
    const out = []; let acc = 0; const step = 62;
    for (let i = 1; i < path.length; i++) {
      const [ax, ay] = path[i - 1], [bx, by] = path[i]; const d = Math.hypot(bx - ax, by - ay);
      while (acc <= d) { const f = acc / d; out.push({ x: ax + (bx - ax) * f, y: ay + (by - ay) * f, a: Math.atan2(by - ay, bx - ax) }); acc += step; }
      acc -= d;
    }
    return out;
  })();

  function plan(ctx, t, p) {
    // floor + tiles
    const fa = L.prog(p, 0.1, 0.6);
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha *= fa;
      ctx.fillStyle = 'rgba(70,104,140,0.55)'; ctx.fillRect(IX0, IY0, IX1 - IX0, IY1 - IY0);
      ctx.strokeStyle = 'rgba(234,242,255,0.12)'; ctx.lineWidth = 2;
      for (let x = IX0 + 66; x < IX1; x += 66) { ctx.beginPath(); ctx.moveTo(x, IY0); ctx.lineTo(x, IY1); ctx.stroke(); }
      for (let y = IY0 + 66; y < IY1; y += 66) { ctx.beginPath(); ctx.moveTo(IX0, y); ctx.lineTo(IX1, y); ctx.stroke(); }
      // parapet fill (hatched)
      ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OX1 - OX0, OY1 - OY0); ctx.rect(IX1, IY0, IX0 - IX1, IY1 - IY0); ctx.clip('evenodd');
      ctx.fillStyle = '#1C4673'; ctx.fillRect(OX0, OY0, OX1 - OX0, OY1 - OY0);
      ctx.strokeStyle = A.hexA(P.dim, 0.55); ctx.lineWidth = 3;
      for (let k = -OY1; k < OX1; k += 18) { ctx.beginPath(); ctx.moveTo(k, OY1); ctx.lineTo(k + (OY1 - OY0), OY0); ctx.stroke(); }
      ctx.restore();
      // door opening
      ctx.fillStyle = P.bg; ctx.fillRect(DOOR[0], IY1 - 1, DOOR[1] - DOOR[0], TH + 2);
      ctx.restore();
    }
    // outlines
    L.drawOn(ctx, [[DOOR[0], OY1], [OX0, OY1], [OX0, OY0], [OX1, OY0], [OX1, OY1], [DOOR[1], OY1]], L.prog(p, 0, 0.7), P.line, 6);
    L.drawOn(ctx, [[DOOR[0], IY1], [IX0, IY1], [IX0, IY0], [IX1, IY0], [IX1, IY1], [DOOR[1], IY1]], L.prog(p, 0.1, 0.8), P.line, 4);
    const da = L.prog(p, 0.6, 1);
    if (da > 0) {
      ctx.save(); ctx.globalAlpha *= da; ctx.strokeStyle = P.line; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(DOOR[0], IY1); ctx.lineTo(DOOR[0], OY1); ctx.moveTo(DOOR[1], IY1); ctx.lineTo(DOOR[1], OY1); ctx.stroke();
      L.text(ctx, 'STAIR', (DOOR[0] + DOOR[1]) / 2, OY1 + 40, 28, P.dim, 800, 'center', 1);
      // slope arrows toward the outlet (dim)
      ctx.strokeStyle = A.hexA(P.dim, 0.45); ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
      for (const [x, y] of [[420, 520], [600, 700], [760, 900]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 90, y + 110); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.restore();
      // rain-water outlet in parapet (grate)
      ctx.save(); ctx.globalAlpha *= da;
      ctx.fillStyle = '#0B2038'; ctx.beginPath(); ctx.arc(OUTLET[0], OUTLET[1], 30, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.stroke();
      ctx.lineWidth = 3; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(OUTLET[0] + k * 10, OUTLET[1] - 24); ctx.lineTo(OUTLET[0] + k * 10, OUTLET[1] + 24); ctx.stroke(); }
      // pipe through the slab (vent / plumbing)
      ctx.fillStyle = '#26384C'; ctx.beginPath(); ctx.arc(VENT[0], VENT[1], 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(VENT[0], VENT[1], 38, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // hairline cracks at the parapet joint
      ctx.save(); ctx.globalAlpha *= da; L.drawOn(ctx, PCRACK, 1, P.bad, 3); L.drawOn(ctx, PCRACK2, 1, P.bad, 2.5); ctx.restore();
      L.text(ctx, 'TERRACE · TOP VIEW', 290, OY0 - 34, 30, P.dim, 800, 'center', da);
    }
  }

  function puddle(ctx, t, a, rainP) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    A.blob(ctx, PUDDLE[0], PUDDLE[1], 120, 78, 404, t * 0.2); ctx.fillStyle = A.hexA(P.water, 0.45); ctx.fill();
    ctx.strokeStyle = P.water; ctx.lineWidth = 4; ctx.stroke();
    // ripples from rain drops
    if (rainP > 0) {
      const r = L.rng(66);
      for (let k = 0; k < 6; k++) {
        const st = 24.7 + k * 0.17 + r() * 0.1, q = L.prog(t, st, st + 0.7), x = PUDDLE[0] - 70 + r() * 140, y = PUDDLE[1] - 40 + r() * 80;
        if (q <= 0 || q >= 1) continue;
        ctx.save(); ctx.globalAlpha *= (1 - q); ctx.strokeStyle = P.line; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(x, y, 6 + q * 30, (6 + q * 30) * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }
    ctx.restore();
  }

  function foot(ctx, x, y, a, side, alpha) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(a + Math.PI / 2); ctx.translate(side * 16, 0);
    ctx.fillStyle = P.line; ctx.beginPath(); ctx.ellipse(0, -6, 10, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 18, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  SCENES.push({
    id: 's4', start: 19.64, end: 25.71,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L06', w);
      const tWalk = W('walk'), tLook = W('look'), tPar = W('parapet'), tPipes = W('pipes'), tWater = W('water'), tStands = W('stands'), tAfter = W('after');
      plan(ctx, t, L.prog(t, this.start - 0.2, this.start + 0.7));

      // puddle at the low spot (appears faintly, then clearly on "water stands")
      const pa = 0.35 + 0.65 * A.fade(t, tWater - 0.1, 0.4);
      puddle(ctx, t, pa * L.prog(t, this.start, this.start + 0.6), L.prog(t, tAfter - 0.2, tAfter));
      // drops falling in on "after rain"
      for (let k = 0; k < 3; k++) {
        const st = tAfter - 0.25 + k * 0.18, q = L.prog(t, st, st + 0.3);
        if (q > 0 && q < 1) A.drop(ctx, PUDDLE[0] - 50 + k * 50, L.lerp(PUDDLE[1] - 220, PUDDLE[1] - 10, q * q), 11, P.water, 1);
      }

      // footsteps
      const n = STEPS.length, t0 = tWalk - 0.05, t1 = tLook + 0.9;
      STEPS.forEach((s, i) => {
        const ti = L.lerp(t0, t1, i / (n - 1));
        const a = L.prog(t, ti, ti + 0.12) * (1 - 0.75 * L.prog(t, ti + 1.2, ti + 2.6));
        foot(ctx, s.x, s.y, s.a, i % 2 ? 1 : -1, a);
      });

      // highlight rings + labels
      A.ring(ctx, t, tPar, 640, IY0 + 18, 92, P.accent, 8);
      A.popTag(ctx, t, tPar, 'PARAPET JOINT', 640, IY0 + 156, 38, P.bg, P.accent);
      A.ring(ctx, t, tPipes, OUTLET[0] - 6, OUTLET[1], 70, P.accent, 8);
      A.ring(ctx, t, tPipes + 0.12, VENT[0], VENT[1], 64, P.accent, 8);
      A.popTag(ctx, t, tPipes, 'PIPES', 790, 1000, 38, P.bg, P.accent);
      A.popTag(ctx, t, tPipes + 0.12, 'PIPES', 250, 560, 34, P.bg, P.accent);
      A.ring(ctx, t, tWater, PUDDLE[0], PUDDLE[1], 158, P.accent, 8);
      A.popTag(ctx, t, tStands, 'WATER STANDS', PUDDLE[0], PUDDLE[1] + 205, 38, P.bg, P.accent);
    },
  });
})();
