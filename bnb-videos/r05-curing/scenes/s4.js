// s4 — TOO EARLY: water leaves (sun, wind), strength stalls short of design, surface cracks.
(function () {
  const A = window.R05A;
  const SL = { x0: 70, x1: 770, top: 820, th: 150, wallW: 95, ground: 1170, seed: 33, rebarR: 12, lw: 7 };
  const TARGET = 0.92;

  function fillAt(t, t0) { return A.s3fill(t0) + 0.14 * L.easeOut(L.prog(t, t0, 19.4)); }

  SCENES.push({
    id: 's4', start: 14.94, end: 24.97,
    draw(ctx, t, lt, T) {
      const W4 = (w) => L.wordTime(T, 'L04', w), W5 = (w) => L.wordTime(T, 'L05', w);
      const t0 = this.start, tWater = W4('water'), tSun = W4('sun'), tWind = W4('wind'), tSlows = W4('slows');
      const tCrack = W5('crack'), tWeaker = W5('weaker'), tDesigned = W5('designed');
      const BAR = A.BAR, H = BAR.bot - BAR.top;
      const f = fillAt(t, t0), fy = BAR.bot - H * f, ty = BAR.bot - H * TARGET;

      ctx.save();
      // crack nudge
      if (t > tCrack && t < tCrack + 0.3) { const k = (t - tCrack) / 0.3, a = 11 * (1 - k); ctx.translate(Math.sin(k * 50) * a, Math.cos(k * 37) * a * 0.6); }

      // ---- sun (top-left) ----
      const sa = L.easeOut(L.prog(t, tSun - 0.1, tSun + 0.25));
      const flare = Math.exp(-Math.pow((t - tSun - 0.15) / 0.3, 2));
      const sunFade = 1 - L.easeInOut(L.prog(t, 20.35, 20.7));
      if (sa > 0 && sunFade > 0) {
        const s = L.backOut(L.prog(t, tSun - 0.1, tSun + 0.3));
        ctx.save(); ctx.translate(190, 360); ctx.scale(s * (0.6 + 0.4 * sunFade), s * (0.6 + 0.4 * sunFade)); A.sun(ctx, 0, 0, 62, t, sa * sunFade, flare); ctx.restore();
        // heat shimmer above slab
        ctx.save(); ctx.globalAlpha *= sa * 0.55 * (1 - L.prog(t, 19.6, 20.4)); ctx.strokeStyle = '#FFC261'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
          const x = 150 + i * 120, yb = 790 - ((t * 40 + i * 37) % 60);
          ctx.beginPath();
          for (let k = 0; k <= 14; k++) { const yy = yb - k * 9, xx = x + Math.sin(k * 0.8 + t * 6 + i) * 9; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---- slab with internal water draining ----
      const moist = 1 - L.easeInOut(L.prog(t, tWater + 0.2, 19.4));
      A.slab(ctx, Object.assign({}, SL, { p: L.prog(t, t0, t0 + 0.6), moist, t }));

      // ---- water droplets rising & evaporating ----
      if (t > tWater - 0.1) {
        const rr = L.rng(909);
        for (let k = 0; k < 26; k++) {
          const st = tWater - 0.1 + k * 0.14 + rr() * 0.1, x0 = 100 + rr() * 640, ph = rr() * 6;
          const life = 1.5, q = (t - st) / life;
          if (q <= 0 || q >= 1 || st > 19.0) continue;
          const y = L.lerp(SL.top - 14, SL.top - 270, L.easeOut(q)), x = x0 + Math.sin(q * 6 + ph) * 14;
          const r = 13 * (1 - 0.7 * q) * L.clamp(q * 8);
          A.drop(ctx, x, y, r, P.water, q < 0.6 ? 1 : (1 - q) / 0.4);
          if (q > 0.55) {
            ctx.save(); ctx.globalAlpha *= (1 - q) * 1.6; ctx.strokeStyle = A.hexA(P.water, 0.7); ctx.lineWidth = 3;
            ctx.beginPath(); for (let j = 0; j <= 6; j++) { const yy = y - 22 - j * 6, xx = x + Math.sin(j + t * 8) * 6; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
            ctx.restore();
          }
        }
      }

      // ---- wind lines sweeping across the slab surface ----
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < 4; i++) {
          const st = tWind - 0.1 + pass * 0.55 + i * 0.12, q = L.prog(t, st, st + 0.85);
          if (q <= 0 || q >= 1) continue;
          const yb = 700 + i * 28 + pass * 10, head = L.lerp(-60, 980, L.easeInOut(q)), len = 320;
          const pts = [];
          for (let x = Math.max(0, head - len); x <= head; x += 16) pts.push([x, yb + Math.sin(x * 0.012 + i) * 14]);
          if (pts.length < 2) continue;
          ctx.save(); ctx.globalAlpha *= Math.sin(q * Math.PI) * 0.9;
          L.drawOn(ctx, pts, 1, i % 2 ? P.dim : P.line, 5);
          // curl at the head
          if (i % 2 === 0) {
            const [hx, hy] = pts[pts.length - 1];
            ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(hx, hy - 16, 16, Math.PI / 2, Math.PI * 2.1, true); ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ---- crack across top surface ----
      const cp = L.easeOut(L.prog(t, tCrack - 0.04, tCrack + 0.45));
      if (cp > 0) {
        const r = L.rng(4242), pts = [];
        for (let x = SL.x0 + 30, k = 0; x <= SL.x1 - 30; x += 34, k++) pts.push([x, SL.top + 5 + (k % 2 ? 18 + r() * 14 : r() * 8)]);
        ctx.save(); ctx.shadowColor = 'rgba(255,90,90,0.6)'; ctx.shadowBlur = 12;
        L.drawOn(ctx, pts, cp, P.bad, 7);
        [3, 8, 14].forEach((idx, j) => {
          const b = L.easeOut(L.prog(t, tCrack + 0.15 + j * 0.08, tCrack + 0.45 + j * 0.08));
          const [bx, by] = pts[Math.min(idx, pts.length - 1)];
          L.drawOn(ctx, [[bx, by], [bx + 10, by + 22], [bx - 4, by + 42], [bx + 8, by + 58]], b, P.bad, 5);
        });
        ctx.restore();
      }

      // ---- strength bar, target line ----
      A.bar(ctx, Object.assign({}, BAR, { p: 1, f, t, label: 1 }));
      A.drawTicks(ctx, T, Math.max(t, 14.94), BAR);
      // weak top segment flashes orange
      const wk = L.prog(t, tWeaker - 0.05, tWeaker + 0.1);
      if (wk > 0) {
        const fl = t < tWeaker + 0.75 ? 0.5 + 0.5 * Math.cos((t - tWeaker) * Math.PI * 2 / 0.25) : 0.9 + 0.1 * Math.sin(t * 4);
        const segBot = BAR.bot - H * (A.s3fill(t0) - 0.05);
        ctx.save(); ctx.globalAlpha *= wk * fl; ctx.fillStyle = P.accent;
        A.rr(ctx, BAR.x + 7, fy, BAR.w - 14, segBot - fy, 6); ctx.fill(); ctx.restore();
      }
      // dashed target line + label
      const da = L.easeOut(L.prog(t, t0 + 0.2, t0 + 0.7));
      if (da > 0) {
        const pulse = Math.exp(-Math.pow((t - tDesigned - 0.15) / 0.3, 2));
        ctx.save(); ctx.globalAlpha *= da; ctx.strokeStyle = P.line; ctx.lineWidth = 5 + pulse * 3; ctx.setLineDash([20, 14]);
        ctx.lineDashOffset = -t * 30;
        if (pulse > 0.02) { ctx.shadowColor = 'rgba(234,242,255,0.8)'; ctx.shadowBlur = 18 * pulse; }
        ctx.beginPath(); ctx.moveTo(L.lerp(960, 470, da), ty); ctx.lineTo(960, ty); ctx.stroke(); ctx.restore();
        ctx.save(); const ps = 1 + 0.08 * pulse; ctx.translate(830, ty - 34); ctx.scale(ps, ps);
        L.text(ctx, 'DESIGNED STRENGTH', 0, 0, 36, P.line, 800, 'right', da); ctx.restore();
      }

      // "SLOWS DOWN" marker at fill tip
      const sl = L.prog(t, tSlows - 0.05, tSlows + 0.25) * (1 - L.prog(t, 20.2, 20.6));
      if (sl > 0) {
        const s = L.backOut(L.prog(t, tSlows - 0.05, tSlows + 0.3));
        ctx.save(); ctx.translate(690, fy); ctx.scale(s, s);
        L.tag(ctx, 'SLOWS DOWN', 0, 0, 34, P.bg, P.accent, sl);
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= sl; ctx.strokeStyle = P.accent; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(800, fy); ctx.lineTo(843, fy); ctx.stroke(); ctx.restore();
      }

      // gap bracket + WEAKER THAN DESIGNED tag
      const wa = L.easeOut(L.prog(t, tWeaker - 0.05, tWeaker + 0.3));
      if (wa > 0) {
        const bx = 818;
        L.drawOn(ctx, [[bx, fy - 6], [bx, ty + 6]], wa, P.accent, 5);
        ctx.save(); ctx.globalAlpha *= wa; ctx.strokeStyle = P.accent; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx - 12, ty + 18); ctx.lineTo(bx, ty + 6); ctx.lineTo(bx + 12, ty + 18);
        ctx.moveTo(bx - 12, fy - 18); ctx.lineTo(bx, fy - 6); ctx.lineTo(bx + 12, fy - 18); ctx.stroke(); ctx.restore();
        const s = L.backOut(L.prog(t, tWeaker - 0.05, tWeaker + 0.35)) * (1 + 0.02 * Math.sin(t * 3.5));
        const cy = (fy + ty) / 2 + 4;
        ctx.save(); ctx.globalAlpha *= wa; ctx.translate(585, cy); ctx.scale(s, s);
        ctx.font = `800 42px ${P.font}`; const w = ctx.measureText('WEAKER THAN').width + 60, h = 124;
        ctx.fillStyle = P.accent; A.rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fill();
        // pointer to bracket
        ctx.beginPath(); ctx.moveTo(w / 2 - 2, -16); ctx.lineTo(w / 2 + 26, 0); ctx.lineTo(w / 2 - 2, 16); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.save(); ctx.translate(585, cy); ctx.scale(s, s);
        L.text(ctx, 'WEAKER THAN', 0, -24, 42, P.bg, 800, 'center', wa);
        L.text(ctx, 'DESIGNED', 0, 26, 42, P.bg, 800, 'center', wa);
        ctx.restore();
      }
      ctx.restore();
    },
  });
})();
