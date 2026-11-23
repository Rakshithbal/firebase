// s3 — (L05) "CHECK IT NOW" — timeline from dry season (sun) to monsoon (cloud); pin on NOW; "WHILE IT'S DRY".
(function () {
  const A = window.R15A;
  SCENES.push({
    id: 's3', start: RT(17.07), end: RT(19.64),
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L05', w);
      const tCheck = W('check'), tIt = W('it'), tNow = W('now'), tDry = W('dry');

      // big headline, word by word
      const words = [{ w: 'CHECK', t: tCheck, x: 0 }, { w: 'IT', t: tIt, x: 0 }, { w: 'NOW', t: tNow, x: 0, c: P.accent }];
      ctx.save(); ctx.font = `800 116px ${P.font}`;
      const sp = 36, ws = words.map((o) => ctx.measureText(o.w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * 2;
      let x = 540 - tot / 2; ctx.restore();
      words.forEach((o, i) => {
        const p = L.easeOut(L.prog(t, o.t - 0.08, o.t + 0.22));
        if (p > 0) {
          const s = L.lerp(0.75, 1, L.backOut(L.prog(t, o.t - 0.08, o.t + 0.3)));
          ctx.save(); ctx.translate(x + ws[i] / 2, 540 + (1 - p) * 30); ctx.scale(s, s);
          L.text(ctx, o.w, 0, 0, 116, o.c || P.line, 800, 'center', p); ctx.restore();
        }
        x += ws[i] + sp;
      });
      // underline under NOW
      const ul = L.easeInOut(L.prog(t, tNow + 0.15, tNow + 0.45));
      if (ul > 0) { const x1 = 540 + tot / 2, x0 = x1 - ws[2]; L.drawOn(ctx, [[x0, 614], [x1, 614]], ul, P.accent, 10); }

      // timeline: sun (now) -> cloud (monsoon)
      const tl = L.easeInOut(L.prog(t, this.start - 0.1, this.start + 0.6));
      const y = 940;
      L.drawOn(ctx, [[220, y], [860, y]], tl, P.dim, 6);
      if (tl > 0.95) {
        ctx.save(); ctx.strokeStyle = P.dim; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(840, y - 18); ctx.lineTo(862, y); ctx.lineTo(840, y + 18); ctx.stroke(); ctx.restore();
      }
      // dashes for time passing
      ctx.save(); ctx.globalAlpha *= tl * 0.6; ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
      for (let k = 0; k < 9; k++) { const xx = 300 + k * 60; ctx.beginPath(); ctx.moveTo(xx, y - 10); ctx.lineTo(xx, y + 10); ctx.stroke(); }
      ctx.restore();
      const sunS = A.pop(t, this.start, 0.5), fl = A.pulse(t, tDry + 0.15, 0.3);
      if (sunS > 0) { ctx.save(); ctx.translate(220, y - 130); ctx.scale(sunS, sunS); A.sun(ctx, 0, 0, 50, t, 1, fl); ctx.restore(); }
      const cs = A.pop(t, this.start + 0.15, 0.5);
      if (cs > 0) {
        A.cloud(ctx, 860, y - 140, 0.72 * cs, 1, 0.85);
        A.rain(ctx, t, 790, 950, y - 90, y - 20, 14, 0.8 * cs, 5, 0.2);
      }
      L.text(ctx, 'DRY DAYS', 220, y + 62, 34, P.dim, 800, 'center', A.fade(t, this.start + 0.2, 0.3));
      L.text(ctx, 'MONSOON', 860, y + 62, 34, P.dim, 800, 'center', A.fade(t, this.start + 0.3, 0.3));

      // pin drops on NOW
      const pp = L.prog(t, tNow - 0.1, tNow + 0.25);
      if (pp > 0) {
        const px = 370, py = L.lerp(y - 260, y - 8, L.easeOut(pp));
        ctx.save(); ctx.globalAlpha *= Math.min(1, pp * 3);
        ctx.fillStyle = P.accent; ctx.beginPath(); ctx.arc(px, py - 62, 34, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(px, py); ctx.closePath(); ctx.fill();
        ctx.fillStyle = P.bg; ctx.beginPath(); ctx.arc(px, py - 64, 13, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        const rp = L.prog(t, tNow + 0.15, tNow + 0.6);
        if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha *= 1 - rp; ctx.strokeStyle = P.accent; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(px, y, 20 + rp * 60, (20 + rp * 60) * 0.3, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }

      // WHILE IT'S DRY
      A.popTag(ctx, t, tDry - 0.05, "WHILE IT'S DRY", 540, 1160, 52, P.bg, P.good);
      const ck = L.prog(t, tDry + 0.2, tDry + 0.5);
      if (ck > 0) {
        ctx.save(); ctx.font = `800 52px ${P.font}`; const w = ctx.measureText("WHILE IT'S DRY").width; ctx.restore();
        const cx = 540 + w / 2 + 100;
        ctx.save(); ctx.fillStyle = P.good; ctx.globalAlpha *= Math.min(1, ck * 2); ctx.beginPath(); ctx.arc(cx, 1160, 44 * L.backOut(ck), 0, Math.PI * 2); ctx.fill(); ctx.restore();
        A.check(ctx, cx, 1162, 52, L.prog(ck, 0.3, 1), P.bg, 10);
      }
    },
  });
})();
