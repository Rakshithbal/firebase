// s5 — ON SITE: mixer drum, "the grade holds only if the mix is right", ingredients fly in on their words,
// "in the right amounts" -> balance scale levels out (L06)
(function () {
  const A = window.R20A;
  const D = { x: 565, y: 560, rot: 0.42 };
  const MOUTH = (() => { const c = Math.cos(D.rot), s = Math.sin(D.rot), x = -178, y = 0; return [D.x + x * c - y * s, D.y + x * s + y * c]; })();
  const ICON_Y = 1105, ICON_X = [195, 418, 662, 885];

  function bag(ctx) {
    ctx.beginPath(); ctx.moveTo(-30, -36); ctx.lineTo(30, -36); ctx.lineTo(37, 40); ctx.quadraticCurveTo(0, 47, -37, 40); ctx.closePath();
    ctx.fillStyle = 'rgba(154,167,180,0.45)'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -36); ctx.lineTo(-34, -48); ctx.moveTo(30, -36); ctx.lineTo(34, -48); ctx.stroke();
    ctx.fillStyle = P.dim; ctx.fillRect(-22, -6, 44, 16);
  }
  function sand(ctx) {
    ctx.beginPath(); ctx.moveTo(-48, 34); ctx.quadraticCurveTo(-20, -40, 0, -38); ctx.quadraticCurveTo(20, -40, 48, 34); ctx.closePath();
    ctx.fillStyle = '#D9B77A'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    const r = L.rng(4); ctx.fillStyle = 'rgba(120,85,40,0.6)';
    for (let i = 0; i < 18; i++) { const x = -34 + r() * 68, y = -10 + r() * 40; if (Math.abs(x) < 40 - (y + 38) * 0) { ctx.beginPath(); ctx.arc(x * (0.4 + (y + 12) / 70), y, 2, 0, Math.PI * 2); ctx.fill(); } }
  }
  function stones(ctx) {
    const st = [[-22, 14, 20], [16, 18, 22], [-4, -14, 19], [30, -12, 13], [-36, -12, 12]];
    const r = L.rng(8);
    for (const [x, y, s] of st) {
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + r() * 0.5, rr = s * (0.75 + r() * 0.35); ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fillStyle = '#8E9BA8'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    }
  }
  function water(ctx) { A.drop(ctx, 0, 10, 28, P.water, 1); }
  const ICONS = [bag, sand, stones, water];
  const NAMES = ['CEMENT', 'SAND', 'AGGREGATE', 'WATER'];

  function drum(ctx, p, t, spin, wob) {
    // stand + wheels
    const sp = L.prog(p, 0, 0.6);
    L.drawOn(ctx, [[D.x - 10, D.y + 40], [D.x - 120, 800]], sp, P.line, 7);
    L.drawOn(ctx, [[D.x + 10, D.y + 40], [D.x + 120, 800]], sp, P.line, 7);
    L.drawOn(ctx, [[D.x - 150, 800], [D.x + 150, 800]], sp, P.line, 7);
    L.drawOn(ctx, [[D.x + 150, 800], [D.x + 240, 760]], L.prog(p, 0.3, 0.8), P.dim, 6); // handle
    const wa = L.prog(p, 0.3, 0.8);
    if (wa > 0) {
      for (const wx of [D.x - 120, D.x + 120]) {
        ctx.save(); ctx.globalAlpha *= wa; ctx.fillStyle = '#1C4673'; ctx.strokeStyle = P.line; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(wx, 812, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(wx, 812, 8, 0, Math.PI * 2); ctx.fillStyle = P.line; ctx.fill(); ctx.restore();
      }
    }
    L.drawOn(ctx, [[300, 845], [840, 845]], L.prog(p, 0, 0.5), P.dim, 4);
    // drum body
    const ba = L.prog(p, 0.2, 0.9);
    if (ba <= 0) return;
    ctx.save(); ctx.globalAlpha *= ba; ctx.translate(D.x, D.y); ctx.rotate(D.rot + wob);
    const body = () => {
      ctx.beginPath(); ctx.moveTo(-178, -56); ctx.lineTo(-86, -116); ctx.quadraticCurveTo(10, -136, 96, -112); ctx.lineTo(160, -66);
      ctx.quadraticCurveTo(178, 0, 160, 66); ctx.lineTo(96, 112); ctx.quadraticCurveTo(10, 136, -86, 116); ctx.lineTo(-178, 56); ctx.closePath();
    };
    body(); const g = ctx.createLinearGradient(0, -130, 0, 130); g.addColorStop(0, '#FF9F5C'); g.addColorStop(1, '#C9622A');
    ctx.fillStyle = g; ctx.fill();
    // spinning blade stripes
    ctx.save(); body(); ctx.clip(); ctx.strokeStyle = 'rgba(14,42,71,0.35)'; ctx.lineWidth = 14;
    const off = (spin * 70) % 70;
    for (let x = -260 + off; x < 260; x += 70) { ctx.beginPath(); ctx.moveTo(x, -140); ctx.lineTo(x + 60, 140); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-200, -110, 400, 26);
    ctx.restore();
    body(); ctx.strokeStyle = P.line; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
    // mouth
    ctx.beginPath(); ctx.ellipse(-178, 0, 20, 56, 0, 0, Math.PI * 2); ctx.fillStyle = '#0A1E33'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 6; ctx.stroke();
    ctx.restore();
  }

  function scale(ctx, x, y, ang, a, t, lv) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // pillar + base
    ctx.strokeStyle = P.line; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 128); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 70, y + 132); ctx.lineTo(x + 70, y + 132); ctx.stroke();
    const bl = 220, c = Math.cos(ang), s = Math.sin(ang);
    const ends = [[x - bl * c, y - bl * s], [x + bl * c, y + bl * s]];
    ctx.strokeStyle = lv > 0 ? P.good : P.line; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(...ends[0]); ctx.lineTo(...ends[1]); ctx.stroke();
    ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    // pans
    ends.forEach(([ex, ey], i) => {
      ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 50, ey + 70); ctx.moveTo(ex, ey); ctx.lineTo(ex + 50, ey + 70); ctx.stroke();
      ctx.fillStyle = '#1C4673'; ctx.strokeStyle = P.line; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(ex - 62, ey + 70); ctx.quadraticCurveTo(ex, ey + 112, ex + 62, ey + 70); ctx.closePath(); ctx.fill(); ctx.stroke();
      // contents
      ctx.save(); ctx.translate(ex, ey + 56); ctx.scale(0.45, 0.45);
      if (i === 0) { ctx.translate(-34, 0); bag(ctx); ctx.translate(70, 6); sand(ctx); }
      else { ctx.translate(-36, 0); stones(ctx); ctx.translate(76, -4); water(ctx); }
      ctx.restore();
    });
    ctx.restore();
  }

  SCENES.push({
    id: 's5', start: L.cut(window.T, 'L06'), end: L.cut(window.T, 'L07'),
    draw(ctx, t, lt, T) {
      const W = (w, n = 0) => A.wt(T, 'L06', w, n);
      const t0 = this.start, tSite = W('site'), tGrade = W('grade'), tHolds = W('holds'), tIf = W('if'), tMix = W('mix'), tRight = W('right');
      const tIng = [W('cement'), W('sand'), W('aggregate'), W('water')];
      const tRight2 = W('right', 1), tAmt = W('amounts');

      // ON SITE tag
      const os = A.pop(t, tSite - 0.15, 0.45);
      A.pill(ctx, 'ON SITE', 540, 285, 42, P.line, os, Math.min(1, os * 1.5));

      // drum (spins faster as ingredients go in)
      const spin = t * 1.2 + L.prog(t, tIng[0], tAmt) * 2.5;
      let wob = 0;
      for (let i = 0; i < 4; i++) { const ta = tIng[i] + 0.8; if (t > ta) wob += 0.035 * Math.exp(-(t - ta) * 6) * Math.sin((t - ta) * 30); }
      drum(ctx, L.easeOut(L.prog(t, t0 - 0.1, t0 + 0.9)), t, spin, wob);

      // statement rows, fade before the scale arrives
      const sOut = 1 - L.prog(t, tRight2 - 0.45, tRight2 - 0.15);
      const g1 = L.easeOut(L.prog(t, tGrade - 0.05, tGrade + 0.3)) * sOut;
      ctx.save(); ctx.font = `800 54px ${P.font}`;
      const wa = ctx.measureText('THE GRADE ').width, wb = ctx.measureText('HOLDS').width; ctx.restore();
      const x1 = 540 - (wa + wb) / 2;
      L.text(ctx, 'THE GRADE', x1, 905, 54, P.line, 800, 'left', g1);
      const g2 = A.pop(t, tHolds - 0.08, 0.4);
      ctx.save(); ctx.translate(x1 + wa + wb / 2, 905); ctx.scale(L.lerp(0.7, 1, g2), L.lerp(0.7, 1, g2));
      L.text(ctx, 'HOLDS', 0, 0, 54, P.good, 800, 'center', Math.min(1, g2 * 1.5) * sOut); ctx.restore();
      const g3 = L.easeOut(L.prog(t, tIf - 0.05, tIf + 0.3)) * sOut;
      ctx.save(); ctx.font = `800 46px ${P.font}`;
      const wc = ctx.measureText('ONLY IF THE MIX IS ').width, wd = ctx.measureText('RIGHT').width; ctx.restore();
      const x2 = 540 - (wc + wd) / 2;
      L.text(ctx, 'ONLY IF THE MIX IS', x2, 980, 46, P.dim, 800, 'left', g3);
      const g4 = L.easeOut(L.prog(t, tRight - 0.05, tRight + 0.25)) * sOut;
      L.text(ctx, 'RIGHT', x2 + wc, 980, 46, P.accent, 800, 'left', g4);
      L.drawOn(ctx, [[x2 + wc, 1012], [x2 + wc + wd, 1012]], L.easeInOut(L.prog(t, tRight + 0.05, tRight + 0.35)) * (sOut > 0.01 ? 1 : 0), P.accent, 6);

      // check badge by the drum on "right"
      const ck = L.prog(t, tRight - 0.05, tRight + 0.35);
      if (ck > 0) {
        const s = L.backOut(L.clamp(ck * 1.4));
        ctx.save(); ctx.translate(860, 420); ctx.scale(s, s);
        ctx.fillStyle = P.good; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
        A.check(ctx, 0, 2, 48, L.prog(ck, 0.3, 1), P.bg, 9); ctx.restore();
      }

      // ingredients pop on their words, a copy flies into the drum mouth
      for (let i = 0; i < 4; i++) {
        const p = A.pop(t, tIng[i] - 0.1, 0.42);
        if (p <= 0) continue;
        const x = ICON_X[i];
        ctx.save(); ctx.translate(x, ICON_Y); ctx.scale(p, p); ICONS[i](ctx); ctx.restore();
        L.text(ctx, NAMES[i], x, 1192, 30, i === 3 ? P.water : P.line, 800, 'center', Math.min(1, p * 1.4));
        const f = L.prog(t, tIng[i] + 0.2, tIng[i] + 0.85);
        if (f > 0 && f < 1) {
          const e = L.easeInOut(f), fx = L.lerp(x, MOUTH[0], e), fy = L.lerp(ICON_Y - 20, MOUTH[1], e) - Math.sin(e * Math.PI) * 170;
          const sc = L.lerp(0.65, 0.2, e);
          ctx.save(); ctx.globalAlpha *= 1 - Math.pow(f, 6); ctx.translate(fx, fy); ctx.rotate(e * 2.4 * (i % 2 ? -1 : 1)); ctx.scale(sc, sc); ICONS[i](ctx); ctx.restore();
          // trail
          ctx.save(); ctx.setLineDash([8, 12]); ctx.globalAlpha *= 0.5 * (1 - f);
          const pts = []; for (let k = 0; k <= 12; k++) { const ee = e * k / 12; pts.push([L.lerp(x, MOUTH[0], ee), L.lerp(ICON_Y - 20, MOUTH[1], ee) - Math.sin(ee * Math.PI) * 170]); }
          L.drawOn(ctx, pts, 1, i === 3 ? P.water : P.dim, 3); ctx.restore();
        }
        // puff at the mouth on arrival
        const pf = L.prog(t, tIng[i] + 0.8, tIng[i] + 1.15);
        if (pf > 0 && pf < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - pf; ctx.strokeStyle = i === 3 ? P.water : P.line; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(MOUTH[0], MOUTH[1], 20 + pf * 50, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
      }

      // balance scale on "in the right amounts": tilted -> levels out on "amounts"
      const sa = L.easeOut(L.prog(t, tRight2 - 0.35, tRight2 + 0.05));
      let ang;
      if (t < tAmt) ang = -0.24 + 0.06 * L.prog(t, tRight2, tAmt);
      else ang = -0.18 * Math.exp(-(t - tAmt) * 5) * Math.cos((t - tAmt) * 13);
      const lv = L.prog(t, tAmt + 0.15, tAmt + 0.3);
      scale(ctx, 540, 880, ang, sa, t, lv);
      const tg = A.pop(t, tAmt - 0.05, 0.4);
      L.tag(ctx, 'IN THE RIGHT AMOUNTS', 540, 1275, 34, P.bg, P.good, Math.min(1, tg * 1.5));
    },
  });
})();
