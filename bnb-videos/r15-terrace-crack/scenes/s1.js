// s1 — HOOK (L01) sunny terrace, a magnifier finds one hairline crack; (L02) weather flips to monsoon, drops head for the crack.
(function () {
  const A = window.R15A;
  const Y0 = 600, Y1 = 1220;
  const Yv = (v) => Y0 + (Y1 - Y0) * (0.55 * v + 0.45 * v * v);
  const XL = (y) => L.lerp(250, 80, (y - Y0) / (Y1 - Y0)), XR = (y) => L.lerp(830, 1000, (y - Y0) / (Y1 - Y0));
  const PT = (u, v) => { const y = Yv(v); return [L.lerp(XL(y), XR(y), u), y]; };
  const wallH = (y) => L.lerp(56, 112, (y - Y0) / (Y1 - Y0));

  // crack in floor coordinates
  const CR_UV = A.crackPts(1501, 0.33, 0.36, 0.66, 0.66, 11, 0.022);
  const CR = CR_UV.map(([u, v]) => PT(u, v));
  const BR = [CR_UV[5], [CR_UV[5][0] - 0.03, CR_UV[5][1] + 0.06], [CR_UV[5][0] - 0.02, CR_UV[5][1] + 0.1]].map(([u, v]) => PT(u, v));
  const BR2 = [CR_UV[8], [CR_UV[8][0] + 0.045, CR_UV[8][1] - 0.02], [CR_UV[8][0] + 0.07, CR_UV[8][1] - 0.01]].map(([u, v]) => PT(u, v));
  const C = PT(0.5, 0.51);

  function floor(ctx, t, wet, warm, lw = 1) {
    // floor fill
    ctx.save();
    ctx.beginPath(); ctx.moveTo(...PT(0, 0)); ctx.lineTo(...PT(1, 0)); ctx.lineTo(...PT(1, 1)); ctx.lineTo(...PT(0, 1)); ctx.closePath();
    const g = ctx.createLinearGradient(0, Y0, 0, Y1);
    g.addColorStop(0, `rgba(${Math.round(L.lerp(70, 40, wet))},${Math.round(L.lerp(98, 92, wet))},${Math.round(L.lerp(130, 140, wet))},1)`);
    g.addColorStop(1, `rgba(${Math.round(L.lerp(96, 46, wet))},${Math.round(L.lerp(120, 104, wet))},${Math.round(L.lerp(148, 156, wet))},1)`);
    ctx.fillStyle = g; ctx.fill();
    if (warm > 0) { ctx.fillStyle = `rgba(255,185,110,${0.16 * warm})`; ctx.fill(); }
    ctx.save(); ctx.clip();
    // tile joints
    ctx.strokeStyle = 'rgba(234,242,255,0.20)'; ctx.lineWidth = 2 * lw;
    for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.moveTo(...PT(i / 7, 0)); ctx.lineTo(...PT(i / 7, 1)); ctx.stroke(); }
    for (let j = 1; j < 8; j++) { ctx.beginPath(); ctx.moveTo(...PT(0, j / 8)); ctx.lineTo(...PT(1, j / 8)); ctx.stroke(); }
    // speckle texture
    const r = L.rng(77); ctx.fillStyle = 'rgba(14,30,50,0.25)';
    for (let i = 0; i < 160; i++) { const [x, y] = PT(r(), r()); ctx.fillRect(x, y, 3, 3); }
    // wet sheen streaks
    if (wet > 0) {
      ctx.globalAlpha *= wet;
      const s = L.rng(91);
      for (let i = 0; i < 12; i++) {
        const [x, y] = PT(s(), s()); const w = 60 + s() * 120;
        ctx.fillStyle = 'rgba(160,220,255,0.10)'; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
    ctx.restore();
  }

  function walls(ctx, p) {
    // inner faces of parapet: far, left, right
    const far = [PT(0, 0), PT(1, 0)];
    const faceFill = 'rgba(30,70,115,0.95)';
    const N = 14, leftTop = [], rightTop = [], leftBot = [], rightBot = [];
    for (let i = 0; i <= N; i++) { const v = i / N; const l = PT(0, v), rr = PT(1, v); leftBot.push(l); rightBot.push(rr); leftTop.push([l[0], l[1] - wallH(l[1])]); rightTop.push([rr[0], rr[1] - wallH(rr[1])]); }
    ctx.save(); ctx.globalAlpha *= L.prog(p, 0.2, 0.8);
    // far wall face
    ctx.fillStyle = faceFill; ctx.beginPath(); ctx.moveTo(...far[0]); ctx.lineTo(...far[1]); ctx.lineTo(far[1][0], far[1][1] - wallH(Y0)); ctx.lineTo(far[0][0], far[0][1] - wallH(Y0)); ctx.closePath(); ctx.fill();
    // side faces
    for (const [bot, top] of [[leftBot, leftTop], [rightBot, rightTop]]) {
      ctx.beginPath(); bot.forEach((q, i) => (i ? ctx.lineTo(...q) : ctx.moveTo(...q))); top.slice().reverse().forEach((q) => ctx.lineTo(...q)); ctx.closePath();
      ctx.fillStyle = 'rgba(24,60,100,0.95)'; ctx.fill();
    }
    // plaster joint lines on faces
    ctx.strokeStyle = 'rgba(143,179,218,0.25)'; ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const u = i / 6; const b = PT(u, 0); ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0], b[1] - wallH(Y0)); ctx.stroke(); }
    ctx.restore();
    // outlines (draw-on)
    const lw = 6;
    L.drawOn(ctx, [leftTop[N], leftTop[0], [far[0][0], far[0][1] - wallH(Y0)], [far[1][0], far[1][1] - wallH(Y0)], rightTop[0], rightTop[N]], p, P.line, lw);
    L.drawOn(ctx, [PT(0, 1), PT(0, 0), PT(1, 0), PT(1, 1)], p, P.line, lw - 1);
    L.drawOn(ctx, [leftBot[N], leftTop[N]], L.prog(p, 0.5, 1), P.line, lw);
    L.drawOn(ctx, [rightBot[N], rightTop[N]], L.prog(p, 0.5, 1), P.line, lw);
    // slab front edge
    const fe = L.prog(p, 0.4, 1);
    if (fe > 0) {
      ctx.save(); ctx.globalAlpha *= fe;
      const a = PT(0, 1), b = PT(1, 1);
      ctx.fillStyle = '#7D8B99'; ctx.fillRect(a[0], a[1], b[0] - a[0], 44);
      ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.strokeRect(a[0], a[1], b[0] - a[0], 44);
      ctx.restore();
    }
  }

  function crack(ctx, color, w, p = 1, glow = 0) {
    ctx.save();
    if (glow > 0) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
    L.drawOn(ctx, CR, p, color, w);
    L.drawOn(ctx, BR, L.prog(p, 0.5, 1), color, w * 0.7);
    L.drawOn(ctx, BR2, L.prog(p, 0.7, 1), color, w * 0.6);
    ctx.restore();
  }

  SCENES.push({
    id: 's1', start: 0, end: RT(5.95),
    draw(ctx, t, lt, T) {
      const W1 = (w) => L.wordTime(T, 'L01', w), W2 = (w) => L.wordTime(T, 'L02', w);
      const tCrack = W1('crack'), tLooks = W1('looks'), tSummer = W1('summer');
      const tMon = W2('monsoon'), tWater = W2('water'), tFinds = W2('finds'), tIt = W2('it');
      const hits = [tFinds, (tFinds + tIt) / 2, tIt];
      const m = L.easeInOut(L.prog(t, tMon - 0.15, tMon + 0.45));

      ctx.save();
      const z = L.lerp(1.08, 1, L.easeOut(L.prog(t, 0, 1.2)));
      ctx.translate(540, 820); ctx.scale(z, z); ctx.translate(-540, -820);

      // sun (L01) — fades as cloud arrives
      const sa = A.fade(t, 0.05, 0.5) * (1 - m);
      if (sa > 0) {
        const fl = A.pulse(t, tSummer + 0.15, 0.3);
        A.sun(ctx, 870, 360, 58, t, sa, fl);
      }

      const wet = L.easeInOut(L.prog(t, hits[0] - 0.3, hits[2] + 0.3)) * 0.6 + m * 0.4;
      floor(ctx, t, wet, (1 - m) * A.fade(t, 0, 0.6));
      walls(ctx, L.prog(t, 0, 0.7));

      // hairline crack — faint until the lens finds it, then red
      const found = L.easeOut(L.prog(t, tCrack + 0.15, tCrack + 0.5));
      ctx.save(); ctx.globalAlpha *= 0.55 * (1 - found); crack(ctx, P.line, 2.2); ctx.restore();
      if (found > 0) { ctx.save(); ctx.globalAlpha *= found; crack(ctx, P.bad, 3.6, 1, 8); ctx.restore(); }

      // magnifier sweep
      const mi = L.easeInOut(L.prog(t, 0.25, tCrack + 0.05));
      const mo = L.easeInOut(L.prog(t, tLooks - 0.25, tLooks + 0.15));
      if (mi > 0 && mo < 1) {
        const lx = L.lerp(930, C[0], mi), ly = L.lerp(1150, C[1], mi) - Math.sin(mi * Math.PI) * 60;
        const r = 150 * (1 - 0.6 * mo), zz = 2.3;
        A.magnifier(ctx, lx, ly, r, Math.min(1, mi * 3) * (1 - mo), (c) => {
          c.translate(lx, ly); c.scale(zz, zz); c.translate(-lx, -ly);
          floor(c, t, 0, 1, 0.6);
          crack(c, P.bad, 3, 1, 6);
        });
        // little ping when it lands
        const pg = L.prog(t, tCrack + 0.02, tCrack + 0.5);
        if (pg > 0 && pg < 1) { ctx.save(); ctx.globalAlpha *= 1 - pg; ctx.strokeStyle = P.bad; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(lx, ly, r + 10 + pg * 50, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }

      // "LOOKS HARMLESS" tag
      const ha = 1 - L.prog(t, tMon - 0.3, tMon);
      if (ha > 0) {
        ctx.save(); ctx.globalAlpha *= ha;
        A.popTag(ctx, t, tLooks + 0.05, 'LOOKS HARMLESS', 540, 1112, 42, P.bg, P.line);
        ctx.restore();
      }

      // ---- monsoon: darkening, clouds, rain
      if (m > 0) {
        ctx.save(); ctx.fillStyle = `rgba(4,12,26,${0.36 * m})`; ctx.fillRect(-600, -600, 2280, 3200); ctx.restore();
        A.rain(ctx, t, 60, 1100, 470, 1240, 110, m * 0.85, 21, 0.22);
      }
      const c1 = L.easeOut(L.prog(t, tMon - 0.2, tMon + 0.5));
      if (c1 > 0) {
        A.cloud(ctx, 880 - 0 + (1 - c1) * 420, 330, 0.95, c1 * 0.95, m);
        A.cloud(ctx, L.lerp(-260, 470, c1), 405 + Math.sin(t * 1.3) * 4, 1.45, c1, m);
        const ma = A.fade(t, tMon + 0.05, 0.3);
        L.text(ctx, 'MONSOON', L.lerp(-260, 470, c1) + 4, 418, 58, P.line, 800, 'center', ma);
      }

      // three drops that find the crack
      const targets = [CR[3], CR[6], CR[9]];
      hits.forEach((th, i) => {
        const st = th - 0.42 + (i === 0 ? 0 : 0), q = L.prog(t, st, th);
        const [tx, ty] = targets[i];
        if (q > 0 && q < 1) {
          const y = L.lerp(500, ty - 18, A.easeIn(Math.pow(q, 0.8) * 0.6 + q * 0.4)), x = L.lerp(tx + 70, tx, q);
          A.drop(ctx, x, y, 17, P.water, 1);
          // motion trail
          ctx.save(); ctx.globalAlpha *= 0.5; ctx.strokeStyle = P.water; ctx.lineWidth = 5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x + 10, y - 70); ctx.lineTo(x + 2, y - 34); ctx.stroke(); ctx.restore();
        }
        const sp = L.prog(t, th, th + 0.5);
        if (sp > 0 && sp < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - sp; ctx.strokeStyle = P.water; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.ellipse(tx, ty, 20 + sp * 70, (20 + sp * 70) * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
          // droplets
          ctx.fillStyle = P.water;
          for (let k = 0; k < 5; k++) { const a = Math.PI * (1.1 + k * 0.2); ctx.beginPath(); ctx.arc(tx + Math.cos(a) * sp * 60, ty - Math.sin(sp * Math.PI) * 40 + Math.sin(a) * sp * 18, 5, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        }
      });
      // crack fills with water
      const wf = L.easeOut(L.prog(t, hits[0], hits[2] + 0.35));
      if (wf > 0) crack(ctx, P.water, 7, wf, 16);
      ctx.restore();
    },
  });
})();
