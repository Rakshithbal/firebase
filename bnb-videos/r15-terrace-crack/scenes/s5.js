// s5 — (L07) close-up terrace tiles: chalk loops drawn around each crack, then a phone frames one and takes a photo.
(function () {
  const A = window.R15A;
  const CRACKS = [
    { c: [260, 480], pts: A.crackPts(1511, 170, 520, 350, 440, 9, 12), br: [[260, 480], [280, 520], [272, 548]], lp: [150, 92, -0.42], seed: 11 },
    { c: [560, 780], pts: A.crackPts(1512, 450, 740, 680, 820, 11, 14), br: [[560, 778], [548, 820], [566, 852]], lp: [175, 100, 0.33], seed: 12 },
    { c: [820, 1110], pts: A.crackPts(1513, 730, 1150, 905, 1075, 9, 11), br: [[820, 1112], [840, 1078], [834, 1052]], lp: [140, 88, -0.4], seed: 13 },
  ];
  const PH = { x: 560, y: 790, w: 440, h: 820 };

  function tiles(ctx, a) {
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(70,104,140,0.6)'; ctx.fillRect(60, 240, 960, 1100);
    const r = L.rng(515); ctx.fillStyle = 'rgba(14,30,50,0.28)';
    for (let i = 0; i < 420; i++) ctx.fillRect(60 + r() * 960, 240 + r() * 1100, 3, 3);
    ctx.strokeStyle = 'rgba(234,242,255,0.25)'; ctx.lineWidth = 4;
    for (let x = 60 + 240; x < 1020; x += 240) { ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x, 1340); ctx.stroke(); }
    for (let y = 240 + 240; y < 1340; y += 240) { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(1020, y); ctx.stroke(); }
    ctx.restore();
  }
  function cracks(ctx, a, glow = 6) {
    ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = P.bad; ctx.shadowBlur = glow;
    CRACKS.forEach((k) => { L.drawOn(ctx, k.pts, 1, P.bad, 4); L.drawOn(ctx, k.br, 1, P.bad, 3); });
    ctx.restore();
  }

  SCENES.push({
    id: 's5', start: 25.71, end: 29.0,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L07', w);
      const tMark = W('mark'), tChalk = W('chalk'), tTake = W('take'), tPhoto = W('photo');
      const sched = [[tMark - 0.05, tMark + 0.32], [tMark + 0.38, tMark + 0.72], [tMark + 0.78, tMark + 1.12]];

      ctx.save(); ctx.beginPath(); ctx.roundRect(60, 240, 960, 1100, 28); ctx.clip();
      const z = L.lerp(1.06, 1, L.easeOut(L.prog(t, this.start - 0.3, this.start + 0.8)));
      ctx.translate(540, 790); ctx.scale(z, z); ctx.translate(-540, -790);
      tiles(ctx, 1);
      cracks(ctx, 1);
      // chalk loops
      const glow = A.pulse(t, tChalk + 0.1, 0.25);
      let tip = null;
      CRACKS.forEach((k, i) => {
        const p = L.easeInOut(L.prog(t, sched[i][0], sched[i][1]));
        if (glow > 0.02) { ctx.save(); ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 18 * glow; }
        const pts = A.chalkLoop(ctx, k.c[0], k.c[1], k.lp[0], k.lp[1], p, k.seed, '#F4F7FB', 8, k.lp[2]);
        if (glow > 0.02) ctx.restore();
        if (p > 0 && p < 1 && pts) tip = A.pointAt(pts, p);
      });
      ctx.restore();
      // chalk stick follows the tip, then rests at the side
      const rest = [860, 330];
      const endT = sched[2][1];
      if (tip) A.chalkStick(ctx, tip[0] + 4, tip[1] - 4, 1, -0.7);
      else if (t < sched[0][0]) { const a = L.prog(t, sched[0][0] - 0.35, sched[0][0]); A.chalkStick(ctx, L.lerp(1000, CRACKS[0].c[0] + 120, a), L.lerp(300, 420, a), a, -0.7); }
      else if (t >= endT) { const q = L.easeOut(L.prog(t, endT, endT + 0.35)); const wig = Math.sin((t - tChalk) * 22) * 0.12 * A.pulse(t, tChalk + 0.1, 0.2);
        A.chalkStick(ctx, L.lerp(CRACKS[2].c[0] + 140, rest[0], q), L.lerp(CRACKS[2].c[1] - 20, rest[1], q), 1 - L.prog(t, tTake - 0.3, tTake), -0.7 + wig); }
      A.popTag(ctx, t, tChalk, 'CHALK', 900, 420, 34, P.bg, P.line, 1 - L.prog(t, tTake - 0.3, tTake));

      // phone frames the middle crack
      const ph = L.easeOut(L.prog(t, tTake - 0.4, tTake + 0.05));
      if (ph > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(40, 230, 1000, 1112); ctx.clip();
        const py = L.lerp(1750, PH.y, ph);
        // dim everything outside the phone
        ctx.save(); ctx.beginPath(); ctx.rect(60, 240, 960, 1100); ctx.roundRect(PH.x - PH.w / 2, py - PH.h / 2, PH.w, PH.h, 54);
        ctx.fillStyle = `rgba(4,12,26,${0.55 * ph})`; ctx.fill('evenodd'); ctx.restore();
        A.phone(ctx, PH.x, py, PH.w, PH.h, 1);
        const s = A.phoneRect(PH.x, py, PH.w, PH.h);
        // viewfinder corners
        ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.lineCap = 'round';
        const vx0 = s.x + 30, vx1 = s.x + s.w - 30, vy0 = py - 210, vy1 = py + 170, c = 40;
        for (const [x, y, dx, dy] of [[vx0, vy0, 1, 1], [vx1, vy0, -1, 1], [vx0, vy1, 1, -1], [vx1, vy1, -1, -1]]) {
          ctx.beginPath(); ctx.moveTo(x, y + dy * c); ctx.lineTo(x, y); ctx.lineTo(x + dx * c, y); ctx.stroke();
        }
        ctx.restore();
        // shutter button
        const press = A.pulse(t, tPhoto, 0.08);
        ctx.save(); ctx.translate(PH.x, s.y + s.h - 62); ctx.scale(1 - 0.18 * press, 1 - 0.18 * press);
        ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        // camera glyph in the top of the screen
        ctx.save(); ctx.globalAlpha *= 0.85; ctx.strokeStyle = P.line; ctx.lineWidth = 4;
        A.rr(ctx, PH.x - 30, s.y + 22, 60, 40, 8); ctx.stroke(); ctx.beginPath(); ctx.arc(PH.x, s.y + 42, 11, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        // flash
        const fl = L.prog(t, tPhoto, tPhoto + 0.4);
        if (fl > 0 && fl < 1) { ctx.save(); ctx.globalAlpha *= 0.9 * Math.pow(1 - fl, 1.6); ctx.fillStyle = '#FFFFFF'; A.rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill(); ctx.restore(); }
        // thumbnail pops into the corner
        const th = A.pop(t, tPhoto + 0.18, 0.35);
        if (th > 0) {
          ctx.save(); ctx.translate(s.x + 62, s.y + s.h - 62); ctx.scale(th, th);
          ctx.fillStyle = '#46688C'; A.rr(ctx, -38, -38, 76, 76, 12); ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.stroke();
          L.drawOn(ctx, [[-26, 8], [-10, -2], [4, 6], [24, -8]], 1, P.bad, 3);
          ctx.strokeStyle = '#F4F7FB'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 30, 18, 0.2, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
      A.popTag(ctx, t, tPhoto + 0.1, 'PHOTO', 560, 300, 40, P.bg, P.water);
    },
  });
})();
