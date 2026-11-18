// s1 — HOOK + DECODE: engineer's note "USE M20" + "?" -> letters split -> M = MIX, 20 = STRENGTH GRADE (L01 + L02)
// Also defines window.R20A: shared drawing helpers for all R20 scenes (namespaced; several adapted from R05A).
(function () {
  const A = (window.R20A = {});

  A.hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  A.easeIn = (x) => x * x * x;
  A.rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  A.pop = (t, t0, d = 0.45) => L.backOut(L.prog(t, t0, t0 + d));
  // n-th occurrence of a word in a line
  A.wt = (T, id, word, n = 0) => {
    const l = T.lines.find((x) => x.id === id); let k = 0;
    for (const w of l.words) if (w.w.toLowerCase().replace(/\W/g, '') === word) { if (k === n) return w.s; k++; }
    return l.start;
  };

  // Check mark polyline, draw-on p (R05A)
  A.check = (ctx, x, y, s, p, color, w) => {
    L.drawOn(ctx, [[x - s * 0.5, y + s * 0.02], [x - s * 0.15, y + s * 0.36], [x + s * 0.52, y - s * 0.34]], p, color, w);
  };

  // Teardrop (tip up) (R05A)
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

  // Hard hat (no face) ~84px wide, centred (R05 hatIcon)
  A.hat = (ctx, x, y, s = 1, alpha = 1) => {
    if (alpha <= 0 || s <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-30, 14); ctx.bezierCurveTo(-30, -36, 30, -36, 30, 14); ctx.closePath();
    ctx.fillStyle = P.accent; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-42, 18); ctx.lineTo(42, 18); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, 12); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(14,42,71,0.6)'; ctx.stroke();
    ctx.restore();
  };

  // 2.5D concrete cube. (x, yb) = bottom-left of the front face, s = edge. o: alpha, seed, lw, glow
  A.cube = (ctx, x, yb, s, o = {}) => {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0 || s <= 0) return;
    const d = s * 0.34, dx = d, dy = -d * 0.72, lw = o.lw || Math.max(3, s * 0.035);
    const yt = yb - s;
    ctx.save(); ctx.globalAlpha *= a; ctx.lineJoin = 'round';
    // top
    ctx.beginPath(); ctx.moveTo(x, yt); ctx.lineTo(x + s, yt); ctx.lineTo(x + s + dx, yt + dy); ctx.lineTo(x + dx, yt + dy); ctx.closePath();
    ctx.fillStyle = '#C6D0DA'; ctx.fill();
    // side
    ctx.beginPath(); ctx.moveTo(x + s, yb); ctx.lineTo(x + s, yt); ctx.lineTo(x + s + dx, yt + dy); ctx.lineTo(x + s + dx, yb + dy); ctx.closePath();
    ctx.fillStyle = '#6E7B88'; ctx.fill();
    // front
    const g = ctx.createLinearGradient(0, yt, 0, yb); g.addColorStop(0, '#AEB9C4'); g.addColorStop(1, '#87949F');
    ctx.fillStyle = g; ctx.fillRect(x, yt, s, s);
    // aggregate specks (front)
    const r = L.rng(o.seed || 5); ctx.fillStyle = 'rgba(70,84,100,0.5)';
    const n = Math.round(s * s / 700);
    for (let i = 0; i < n; i++) {
      const cx = x + 5 + r() * (s - 10), cy = yt + 5 + r() * (s - 10), rad = 1.5 + r() * s * 0.025;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) { const an = (k / 5) * Math.PI * 2 + r(), rr = rad * (0.7 + r() * 0.5); ctx[k ? 'lineTo' : 'moveTo'](cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
      ctx.closePath(); ctx.fill();
    }
    // outline
    ctx.strokeStyle = P.line; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.rect(x, yt, s, s);
    ctx.moveTo(x, yt); ctx.lineTo(x + dx, yt + dy); ctx.lineTo(x + s + dx, yt + dy); ctx.lineTo(x + s + dx, yb + dy); ctx.lineTo(x + s, yb);
    ctx.moveTo(x + s, yt); ctx.lineTo(x + s + dx, yt + dy); ctx.stroke();
    ctx.restore();
  };

  // Vertical strength bar (R05A.bar) + optional dashed "DESIGNED" line. o: x,top,bot,w,f,p,t,label,designed(0..1 level),dA(alpha),warn(0..1 tints fill orange)
  A.bar = (ctx, o) => {
    const { x, top, bot, w } = o, p = o.p == null ? 1 : o.p, f = o.f || 0, H = bot - top;
    ctx.save();
    if (f > 0) {
      const fy = bot - H * f;
      ctx.save(); A.rr(ctx, x + 7, fy, w - 14, bot - 7 - fy, 6); ctx.clip();
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#5CC489'); g.addColorStop(0.45, P.good); g.addColorStop(1, '#4FA877');
      ctx.fillStyle = g; ctx.fillRect(x, fy, w, bot - fy);
      if (o.warn > 0) { ctx.save(); ctx.globalAlpha *= o.warn * 0.85; ctx.fillStyle = P.accent; ctx.fillRect(x, fy, w, bot - fy); ctx.restore(); }
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 10;
      const off = ((o.t || 0) * 40) % 40;
      for (let yy = fy - 60 - off + 40; yy < bot + 60; yy += 40) { ctx.beginPath(); ctx.moveTo(x, yy + 30); ctx.lineTo(x + w, yy); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x, fy, w, 4);
      ctx.restore();
    }
    L.drawOn(ctx, [[x + w / 2, bot], [x, bot], [x, top], [x + w / 2, top]], p, P.line, 6);
    L.drawOn(ctx, [[x + w / 2, bot], [x + w, bot], [x + w, top], [x + w / 2, top]], p, P.line, 6);
    if (o.designed != null && (o.dA || 0) > 0) {
      const dy = bot - H * o.designed;
      ctx.save(); ctx.globalAlpha *= o.dA; ctx.setLineDash([14, 10]); ctx.strokeStyle = P.line; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - 150, dy); ctx.lineTo(x + w + 14, dy); ctx.stroke(); ctx.restore();
      L.text(ctx, 'DESIGNED', x - 152, dy - 26, 28, P.line, 800, 'left', o.dA);
    }
    if (o.label) L.text(ctx, 'STRENGTH', x + w / 2, bot + 48, 34, P.line, 800, 'center', o.label);
    ctx.restore();
  };

  // outlined pill label (like R05 "FRESH RCC SLAB")
  A.pill = (ctx, s, x, y, size, color, sc = 1, alpha = 1, fill = '#1C4673') => {
    if (alpha <= 0 || sc <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    L.tag(ctx, s, 0, 0, size, color, fill, alpha);
    ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.font = `800 ${size}px ${P.font}`;
    const w = ctx.measureText(s).width + size * 1.1, h = size * 1.6;
    A.rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke();
    ctx.restore();
  };

  // bracket under a word: horizontal line with end ticks + short leader down
  A.bracket = (ctx, x0, x1, y, p, color, leadTo) => {
    if (p <= 0) return;
    const xm = (x0 + x1) / 2;
    L.drawOn(ctx, [[xm, y], [x0, y], [x0, y - 16]], p, color, 4);
    L.drawOn(ctx, [[xm, y], [x1, y], [x1, y - 16]], p, color, 4);
    if (leadTo) L.drawOn(ctx, [[xm, y], [xm, leadTo]], L.prog(p, 0.5, 1), color, 4);
  };

  // ---------------- scene 1 ----------------
  function bubblePath(ctx, x, y, w, h, r, tx, ty) {
    // rounded rect with a tail from the bottom edge (near left) to (tx,ty)
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + 200, y + h); ctx.lineTo(tx, ty); ctx.lineTo(x + 110, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  SCENES.push({
    id: 's1', start: 0, end: 9.165,
    draw(ctx, t, lt, T) {
      const W1 = (w) => L.wordTime(T, 'L01', w), W2 = (w) => L.wordTime(T, 'L02', w);
      const tEng = W1('engineer'), tSays = W1('says'), tUse = W1('use'), tM = W1('m'), t20 = W1('twenty'), tWhat = W1('what'), tMean = W1('mean');
      const tM2 = L.wordAt(T, 'L02', 0), tMix = W2('mix'), tNum = W2('number'), tStr = W2('strength'), tGrade = W2('grade'), tConc = W2('concrete');

      // split progress
      const k = L.easeInOut(L.prog(t, tMean - 0.05, tMean + 0.6));

      // ---- engineer (hat) + label, bottom-left of bubble
      const hp = A.pop(t, tEng - 0.1, 0.45) * (1 - k);
      A.hat(ctx, 215, 905, 1.35 * hp, Math.min(1, hp * 1.5));
      const la = L.easeOut(L.prog(t, tEng, tEng + 0.35)) * (1 - k);
      L.text(ctx, 'YOUR ENGINEER', 300, 912, 44, P.line, 800, 'left', la);

      // ---- bubble (site note)
      const bp = A.pop(t, tSays - 0.12, 0.45);
      const bx = 150, by = 380, bw = 780, bh = 380;
      if (bp > 0 && k < 1) {
        const s = bp * (1 - 0.08 * k);
        ctx.save(); ctx.globalAlpha *= Math.min(1, bp * 1.4) * (1 - k);
        ctx.translate(540, by + bh / 2); ctx.scale(s, s); ctx.translate(-540, -(by + bh / 2));
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
        bubblePath(ctx, bx, by, bw, bh, 36, 235, 850); ctx.fillStyle = P.line; ctx.fill();
        ctx.shadowColor = 'transparent';
        // blueprint ruled lines on the note
        ctx.strokeStyle = 'rgba(14,42,71,0.10)'; ctx.lineWidth = 2;
        for (let y = by + 60; y < by + bh - 20; y += 44) { ctx.beginPath(); ctx.moveTo(bx + 30, y); ctx.lineTo(bx + bw - 30, y); ctx.stroke(); }
        ctx.restore();
        // "USE"
        const ua = L.easeOut(L.prog(t, tUse - 0.08, tUse + 0.2)) * (1 - k);
        L.text(ctx, 'USE', 540, 455 - (1 - ua) * 14, 64, '#3A5A80', 800, 'center', ua * Math.min(1, bp));
      }

      // ---- "M" and "20": inside the note, then fly apart
      ctx.save(); ctx.font = `800 230px ${P.font}`;
      const wM = ctx.measureText('M').width, w20 = ctx.measureText('20').width; ctx.restore();
      const gap = 14, tot = wM + w20 + gap;
      const xM0 = 540 - tot / 2 + wM / 2, x200 = 540 + tot / 2 - w20 / 2, y0 = 610;
      const pulseM = 1 + 0.09 * Math.exp(-Math.pow((t - tM2 - 0.12) / 0.12, 2)) + 0.06 * Math.exp(-Math.pow((t - tMix - 0.1) / 0.14, 2));
      const pulse20 = 1 + 0.09 * Math.exp(-Math.pow((t - tNum - 0.12) / 0.12, 2)) + 0.06 * Math.exp(-Math.pow((t - tStr - 0.1) / 0.14, 2));
      const glyph = (txt, t0, x0, x1, side, pulse) => {
        const ap = A.pop(t, t0 - 0.06, 0.38); if (ap <= 0) return;
        const x = L.lerp(x0, x1, k), y = L.lerp(y0, 600, k) - Math.sin(k * Math.PI) * 50;
        const s = L.lerp(1, 1.17, k) * L.lerp(0.4, 1, ap) * pulse, rot = Math.sin(k * Math.PI) * 0.12 * side;
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
        if (k < 1) L.text(ctx, txt, 0, 0, 230, P.bg, 800, 'center', Math.min(1, ap * 1.5) * (1 - k));
        if (k > 0) L.text(ctx, txt, 0, 0, 230, P.line, 800, 'center', Math.min(1, ap * 1.5) * k);
        ctx.restore();
      };
      glyph('M', tM, xM0, 300, -1, pulseM);
      glyph('20', t20, x200, 765, 1, pulse20);

      // ---- big "?" (orange), wobbling, exits on the split
      const qp = A.pop(t, tWhat - 0.1, 0.5);
      if (qp > 0 && k < 1) {
        const grow = 1 + 0.18 * Math.exp(-Math.pow((t - tMean - 0.05) / 0.16, 2));
        const qx = 905, qy = L.lerp(380, 300, k);
        ctx.save(); ctx.translate(qx, qy); ctx.rotate(0.14 + 0.06 * Math.sin(t * 4.2)); ctx.scale(qp * grow, qp * grow);
        const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 160); g.addColorStop(0, 'rgba(255,138,61,0.30)'); g.addColorStop(1, 'rgba(255,138,61,0)');
        ctx.globalAlpha *= 1 - k; ctx.fillStyle = g; ctx.fillRect(-160, -160, 320, 320);
        L.text(ctx, '?', 0, 6, 250, P.accent, 800, 'center', 1);
        ctx.restore();
      }

      // ---- divider between M and 20 after the split
      const dv = L.easeOut(L.prog(t, tMean + 0.4, tMean + 0.8));
      if (dv > 0) {
        ctx.save(); ctx.setLineDash([16, 14]); L.drawOn(ctx, [[535, 470], [535, 740]], dv, A.hexA(P.dim, 0.7), 4); ctx.restore();
      }

      // ---- M = MIX
      const mx = L.easeOut(L.prog(t, tMix - 0.12, tMix + 0.25));
      A.bracket(ctx, 190, 410, 760, mx, P.water, 805);
      A.pill(ctx, 'MIX', 300, 850, 54, P.water, A.pop(t, tMix - 0.02, 0.4), Math.min(1, mx * 2));

      // ---- 20 = STRENGTH GRADE
      const sg = L.easeOut(L.prog(t, tStr - 0.12, tStr + 0.25));
      A.bracket(ctx, 620, 910, 760, sg, P.good, 805);
      const gp = A.pop(t, tStr - 0.02, 0.4);
      A.pill(ctx, 'STRENGTH', 765, 850, 46, P.good, gp, Math.min(1, sg * 2));
      const gg = A.pop(t, tGrade - 0.05, 0.4);
      A.pill(ctx, 'GRADE', 765, 930, 46, P.good, gg, Math.min(1, gg * 2));
      // small up-arrow beside the 20
      const ar = L.easeOut(L.prog(t, tGrade, tGrade + 0.4));
      if (ar > 0) {
        const ax = 975, yb = 690, yt = L.lerp(yb, 520, ar);
        L.drawOn(ctx, [[ax, yb], [ax, yt]], 1, P.good, 8);
        L.drawOn(ctx, [[ax - 20, yt + 22], [ax, yt], [ax + 20, yt + 22]], 1, P.good, 8);
      }

      // ---- "of the concrete": cube pops, both labels connect to it
      const cp = A.pop(t, tConc - 0.1, 0.45);
      if (cp > 0) {
        const s = 150 * cp;
        A.cube(ctx, 540 - 75 - 25 * cp + (1 - cp) * 75, 1250 - (1 - cp) * 75, s, { alpha: Math.min(1, cp * 1.5), seed: 9 });
        const lp = L.easeOut(L.prog(t, tConc, tConc + 0.4));
        ctx.save(); ctx.setLineDash([10, 10]);
        L.drawOn(ctx, [[300, 895], [300, 1060], [440, 1150]], lp, A.hexA(P.water, 0.8), 3);
        L.drawOn(ctx, [[765, 975], [765, 1060], [650, 1150]], lp, A.hexA(P.good, 0.8), 3);
        ctx.restore();
        L.text(ctx, 'CONCRETE', 540, 1300, 34, P.dim, 800, 'center', lp);
      }
    },
  });
})();
