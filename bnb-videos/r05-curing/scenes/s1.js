// s1 — HOOK: fresh RCC slab looks done... NOT YET.
// Also defines window.R05A: shared drawing helpers for scenes s1–s4 (namespaced to avoid clashes).
(function () {
  const A = (window.R05A = {});

  A.hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  A.easeIn = (x) => x * x * x;

  // Teardrop (tip up). r = radius of the round part.
  A.drop = (ctx, x, y, r, color = P.water, alpha = 1) => {
    if (alpha <= 0 || r <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    const k = 0.982;
    ctx.beginPath(); ctx.moveTo(x, y - 1.8 * r);
    ctx.arc(x, y, r, -Math.PI / 2 + k, -Math.PI / 2 - k + Math.PI * 2);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(2, r * 0.16); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r * 0.6, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
    ctx.restore();
  };

  // Check mark polyline, draw-on p.
  A.check = (ctx, x, y, s, p, color, w) => {
    L.drawOn(ctx, [[x - s * 0.5, y + s * 0.02], [x - s * 0.15, y + s * 0.36], [x + s * 0.52, y - s * 0.34]], p, color, w);
  };

  // Rounded rectangle path helper.
  A.rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

  // Cross-section of an RCC slab on two support walls.
  // o: x0,x1,top,th,wallW,ground,p(draw-on 0..1),seed,rebarR,moist(0..1),film(0..1),lw
  A.slab = (ctx, o) => {
    const { x0, x1, top, th, wallW, ground } = o;
    const p = o.p == null ? 1 : o.p, lw = o.lw || 6, bot = top + th;
    const rnd = L.rng(o.seed || 11);
    ctx.save();
    // ground line + hatching
    const gp = L.prog(p, 0, 0.5);
    L.drawOn(ctx, [[x0 - 40, ground], [x1 + 40, ground]], gp, P.dim, Math.max(3, lw - 2));
    const ha = L.prog(p, 0.3, 0.7);
    if (ha > 0) {
      ctx.save(); ctx.globalAlpha *= ha * 0.6; ctx.strokeStyle = P.dim; ctx.lineWidth = 2.5;
      for (let x = x0 - 30; x < x1 + 40; x += 26) { ctx.beginPath(); ctx.moveTo(x, ground + 4); ctx.lineTo(x - 18, ground + 24); ctx.stroke(); }
      ctx.restore();
    }
    // walls
    const wp = L.prog(p, 0.1, 0.6);
    const walls = [[x0 + 10, x0 + 10 + wallW], [x1 - 10 - wallW, x1 - 10]];
    const fa = L.prog(p, 0.35, 0.8);
    for (const [a, b] of walls) {
      if (fa > 0) {
        ctx.save(); ctx.globalAlpha *= fa;
        ctx.fillStyle = 'rgba(190,120,90,0.28)'; ctx.fillRect(a, bot, b - a, ground - bot);
        ctx.strokeStyle = A.hexA(P.dim, 0.55); ctx.lineWidth = 2;
        const bh = Math.max(16, (ground - bot) / 7); let row = 0;
        for (let y = bot + bh; y < ground; y += bh, row++) { ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.stroke(); }
        row = 0;
        for (let y = bot; y < ground - 2; y += bh, row++) {
          const xm = a + (b - a) * (row % 2 ? 0.33 : 0.66);
          ctx.beginPath(); ctx.moveTo(xm, y); ctx.lineTo(xm, Math.min(ground, y + bh)); ctx.stroke();
        }
        ctx.restore();
      }
      L.drawOn(ctx, [[a, ground], [a, bot], [b, bot], [b, ground]], wp, P.line, lw - 1);
    }
    // slab fill
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha *= fa;
      const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#B9C4CF'); g.addColorStop(1, '#8592A0');
      ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, th);
      // aggregate
      const n = Math.round(((x1 - x0) * th) / 1400);
      ctx.fillStyle = 'rgba(80,94,110,0.45)';
      for (let i = 0; i < n; i++) {
        const cx = x0 + 8 + rnd() * (x1 - x0 - 16), cy = top + 6 + rnd() * (th - 12), r = 2 + rnd() * Math.min(9, th * 0.07), sides = 5;
        ctx.beginPath();
        for (let k = 0; k < sides; k++) { const an = (k / sides) * Math.PI * 2 + rnd(), rr = r * (0.7 + rnd() * 0.5); ctx[k ? 'lineTo' : 'moveTo'](cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // internal moisture
    if (o.moist > 0) {
      const r2 = L.rng((o.seed || 11) + 99), m = Math.round(((x1 - x0) * th) / 2600);
      ctx.save(); ctx.fillStyle = P.water;
      for (let i = 0; i < m; i++) {
        const cx = x0 + 14 + r2() * (x1 - x0 - 28), cy = top + 10 + r2() * (th - 20), thr = r2();
        const a = L.clamp((o.moist - thr * 0.6) / 0.4);
        if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha *= a * 0.9;
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, th * 0.03), 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.restore();
    }
    // rebar
    const rr = o.rebarR || 11, cover = Math.max(rr + 8, th * 0.26);
    const nb = Math.max(4, Math.round((x1 - x0) / 120));
    for (let i = 0; i < nb; i++) {
      const s = L.backOut(L.prog(p, 0.5 + (i / nb) * 0.3, 0.7 + (i / nb) * 0.3));
      if (s <= 0) continue;
      const bx = L.lerp(x0 + 50, x1 - 50, i / (nb - 1)), by = bot - cover;
      ctx.save(); ctx.fillStyle = '#26384C'; ctx.strokeStyle = P.line; ctx.lineWidth = Math.max(2.5, rr * 0.28);
      ctx.beginPath(); ctx.arc(bx, by, rr * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    // water film on top (ponding / curing)
    if (o.film > 0) {
      const fh = Math.max(8, th * 0.12) * o.film;
      ctx.save(); ctx.globalAlpha *= 0.85; ctx.fillStyle = A.hexA(P.water, 0.75);
      ctx.beginPath(); ctx.moveTo(x0, top);
      for (let x = x0; x <= x1; x += 12) ctx.lineTo(x, top - fh + Math.sin(x * 0.045 + (o.t || 0) * 3) * fh * 0.18);
      ctx.lineTo(x1, top); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // slab outline (draw-on, clockwise from top-left)
    L.drawOn(ctx, [[x0, top], [x1, top], [x1, bot], [x0, bot], [x0, top]], L.prog(p, 0, 0.55), P.line, lw);
    ctx.restore();
  };

  // Vertical strength bar. o: x,top,bot,w,f(fill 0..1),p(outline 0..1),t,label(alpha)
  A.bar = (ctx, o) => {
    const { x, top, bot, w } = o, p = o.p == null ? 1 : o.p, f = o.f || 0, H = bot - top;
    ctx.save();
    // fill
    if (f > 0) {
      const fy = bot - H * f;
      ctx.save(); A.rr(ctx, x + 7, fy, w - 14, bot - 7 - fy, 6); ctx.clip();
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#5CC489'); g.addColorStop(0.45, P.good); g.addColorStop(1, '#4FA877');
      ctx.fillStyle = g; ctx.fillRect(x, fy, w, bot - fy);
      // moving diagonal stripes
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 10;
      const off = ((o.t || 0) * 40) % 40;
      for (let yy = fy - 60 - off + 40; yy < bot + 60; yy += 40) { ctx.beginPath(); ctx.moveTo(x, yy + 30); ctx.lineTo(x + w, yy); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x, fy, w, 4);
      ctx.restore();
    }
    // outline
    const r = 14;
    L.drawOn(ctx, [[x + w / 2, bot], [x, bot], [x, top], [x + w, top], [x + w, bot], [x + w / 2, bot]], p, P.line, 6);
    if (o.label) L.text(ctx, 'STRENGTH', x + w / 2, bot + 48, 34, P.line, 800, 'center', o.label);
    ctx.restore();
  };

  // Sun icon with rays. flare 0..1
  A.sun = (ctx, x, y, r, t, alpha = 1, flare = 0) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    const gl = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (3 + flare * 1.5));
    gl.addColorStop(0, `rgba(255,190,90,${0.45 + 0.25 * flare})`); gl.addColorStop(0.4, 'rgba(255,150,60,0.14)'); gl.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * (3 + flare * 1.5), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFC261'; ctx.lineCap = 'round'; ctx.lineWidth = 7;
    const n = 10;
    for (let i = 0; i < n; i++) {
      const an = (i / n) * Math.PI * 2 + t * 0.4, l1 = r * 1.3, l2 = r * (1.75 + 0.18 * Math.sin(t * 5 + i * 1.7) + 0.3 * flare);
      ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * l1, y + Math.sin(an) * l1); ctx.lineTo(x + Math.cos(an) * l2, y + Math.sin(an) * l2); ctx.stroke();
    }
    ctx.fillStyle = '#FFB547'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFE1A6'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  };

  // ---------------- scene 1 ----------------
  function looksDoneTag(ctx, cx, cy, sc, alpha, checkP, strikeP, t) {
    if (alpha <= 0 || sc <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.scale(sc, sc);
    const fs = 74; ctx.font = `800 ${fs}px ${P.font}`;
    const tw = ctx.measureText('LOOKS DONE').width, cs = 96, gap = 28, pad = 46;
    const W = pad * 2 + tw + gap + cs, H = 140;
    ctx.fillStyle = P.line; A.rr(ctx, -W / 2, -H / 2, W, H, H / 2); ctx.fill();
    ctx.fillStyle = P.bg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('LOOKS DONE', -W / 2 + pad, 4);
    const ccx = W / 2 - pad - cs / 2 + 10;
    const cpop = L.backOut(L.clamp(checkP * 1.6));
    const ok = strikeP < 1;
    ctx.fillStyle = ok ? P.good : '#9DB0A6';
    ctx.beginPath(); ctx.arc(ccx, 0, (cs / 2) * cpop, 0, Math.PI * 2); ctx.fill();
    A.check(ctx, ccx, 2, cs * 0.6, L.prog(checkP, 0.3, 1), P.bg, 11);
    // strike through
    if (strikeP > 0) L.drawOn(ctx, [[-W / 2 + 20, 18], [W / 2 - 20, -22]], strikeP, P.accent, 14);
    ctx.restore();
  }

  function stamp(ctx, cx, cy, sc, alpha, rot) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
    const fs = 136; ctx.font = `800 ${fs}px ${P.font}`;
    const tw = ctx.measureText('NOT YET').width, W = tw + 110, H = 220;
    ctx.fillStyle = A.hexA(P.accent, 0.14); A.rr(ctx, -W / 2, -H / 2, W, H, 22); ctx.fill();
    ctx.strokeStyle = P.accent; ctx.lineWidth = 12; A.rr(ctx, -W / 2, -H / 2, W, H, 22); ctx.stroke();
    ctx.lineWidth = 4; A.rr(ctx, -W / 2 + 18, -H / 2 + 18, W - 36, H - 36, 12); ctx.stroke();
    ctx.fillStyle = P.accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NOT YET', 0, 8);
    // ink texture: small knock-out specks
    const r = L.rng(42); ctx.fillStyle = A.hexA(P.bg, 0.55);
    for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(-W / 2 + r() * W, -H / 2 + r() * H, 1.5 + r() * 3.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  SCENES.push({
    id: 's1', start: 0, end: 4.41,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L01', w);
      const tSlab = W('slab'), tDry = W('dry'), tHard = W('hard'), tNot = W('not'), tMean = W('mean'), tDone = W('done');
      const tImp = tDone - 0.03; // stamp impact
      ctx.save();
      // impact shake
      let sx = 0, sy = 0;
      if (t > tImp && t < tImp + 0.4) { const k = (t - tImp) / 0.4, a = 18 * Math.pow(1 - k, 2); sx = Math.sin(k * 60) * a; sy = Math.cos(k * 47) * a * 0.7; }
      // intro push-in
      const z = L.lerp(1.12, 1, L.easeOut(L.prog(t, 0, 1.1)));
      ctx.translate(540 + sx, 780 + sy); ctx.scale(z, z); ctx.translate(-540, -780);

      // warm sun glow, top-right
      const ga = L.easeOut(L.prog(t, 0.05, 0.9));
      const pulse = 1 + 0.06 * Math.sin(t * 2.4) + 0.15 * Math.exp(-Math.pow((t - tDry - 0.2) / 0.35, 2));
      ctx.save(); ctx.globalAlpha *= ga;
      const gx = 985, gy = 290, gr = 460 * pulse;
      const g = ctx.createRadialGradient(gx, gy, 20, gx, gy, gr);
      g.addColorStop(0, 'rgba(255,196,110,0.55)'); g.addColorStop(0.35, 'rgba(255,150,70,0.20)'); g.addColorStop(1, 'rgba(255,140,60,0)');
      ctx.fillStyle = g; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      ctx.restore();
      A.sun(ctx, 985, 290, 54, t, ga * 0.9, 0);

      // slab
      const sp = L.prog(t, 0, 0.85);
      const moist = L.easeInOut(L.prog(t, tMean, tMean + 0.6));
      A.slab(ctx, { x0: 100, x1: 980, top: 790, th: 160, wallW: 104, ground: 1160, p: sp, seed: 7, rebarR: 13, moist, lw: 7 });

      // dimension line above slab
      const dp = L.easeOut(L.prog(t, 0.35, 0.95));
      if (dp > 0) {
        const y = 735;
        L.drawOn(ctx, [[540, y], [100, y]], dp, P.dim, 3);
        L.drawOn(ctx, [[540, y], [980, y]], dp, P.dim, 3);
        ctx.save(); ctx.globalAlpha *= dp; ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
        for (const x of [100, 980]) { ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x, y + 18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y - 10); ctx.stroke(); }
        ctx.restore();
      }

      // "FRESH RCC SLAB" leader label (on "slab")
      const la = L.easeOut(L.prog(t, tSlab - 0.05, tSlab + 0.3));
      if (la > 0) {
        L.drawOn(ctx, [[540, 960], [540, 1020]], la, P.line, 4);
        ctx.save(); ctx.globalAlpha *= la; ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(540, 958, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        const s = L.backOut(la);
        ctx.save(); ctx.translate(540, 1066); ctx.scale(s, s);
        L.tag(ctx, 'FRESH RCC SLAB', 0, 0, 40, P.line, '#1C4673', la);
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= la; ctx.strokeStyle = P.line; ctx.lineWidth = 3; ctx.font = `800 40px ${P.font}`;
        const w = ctx.measureText('FRESH RCC SLAB').width + 44, h = 64; ctx.translate(540, 1066); ctx.scale(s, s);
        A.rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke(); ctx.restore();
      }

      // LOOKS DONE tag
      const tagY = 545 + Math.sin(t * 2.2) * 5;
      const pop = L.backOut(L.prog(t, tDry - 0.05, tDry + 0.3));
      const strikeP = L.easeOut(L.prog(t, tNot, tNot + 0.22));
      const out = L.prog(t, tImp - 0.14, tImp + 0.02);
      const tagA = L.prog(t, tDry - 0.05, tDry + 0.12) * (1 - 0.35 * L.prog(t, tNot + 0.25, tNot + 0.6)) * (1 - out);
      looksDoneTag(ctx, 540, tagY, pop * (1 - 0.12 * out), tagA, L.prog(t, tHard - 0.05, tHard + 0.35), strikeP, t);

      // NOT YET stamp slam
      const sIn = L.prog(t, tImp - 0.16, tImp);
      if (sIn > 0) {
        const sc = t < tImp ? L.lerp(2.6, 1, A.easeIn(sIn)) : 1 + 0.06 * Math.exp(-(t - tImp) * 9) * Math.sin((t - tImp) * 40) + 0.015 * Math.sin(t * 3);
        stamp(ctx, 540, 545, sc, L.clamp(sIn * 1.4), -0.11);
        // impact burst lines
        const b = L.prog(t, tImp, tImp + 0.35);
        if (b > 0 && b < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - b; ctx.strokeStyle = P.accent; ctx.lineWidth = 7; ctx.lineCap = 'round';
          for (let i = 0; i < 10; i++) {
            const an = (i / 10) * Math.PI * 2 + 0.3, r1 = 330 + b * 90, r2 = r1 + 50 * (1 - b);
            const ex = Math.cos(an), ey = Math.sin(an) * 0.45;
            ctx.beginPath(); ctx.moveTo(540 + ex * r1, 545 + ey * r1); ctx.lineTo(540 + ex * r2, 545 + ey * r2); ctx.stroke();
          }
          ctx.restore();
        }
      }
      ctx.restore();
    },
  });
})();
