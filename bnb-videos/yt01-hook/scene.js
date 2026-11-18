// YT01 hook scene. One continuous shot: plot draws -> doubt beat -> rooms snap in -> tilt to 2.5D -> title card.
// Layout is a GENERIC example. No room dimensions are shown on purpose (only names), so nothing has to add up.
(function () {
  // ---- world geometry (feet). Plot 20 x 30. Building footprint inset (setbacks are illustrative only, not labelled).
  const PLOT = { x0: 0, y0: 0, x1: 20, y1: 30 };
  const F = { x0: 1, y0: 3, x1: 19, y1: 29 };
  const ROOMS = [ // order = snap order
    { n: 'LIVING',    r: [1, 3, 12, 13] },
    { n: 'STAIRS',    r: [12, 3, 19, 13], stairs: true },
    { n: 'KITCHEN',   r: [1, 13, 10, 20] },
    { n: 'TOILET',    r: [13, 13, 19, 20] },
    { n: 'BEDROOM 1', r: [1, 20, 11.5, 29] },
    { n: 'BEDROOM 2', r: [11.5, 20, 19, 29] },
  ];
  // wall segments [x0,y0,x1,y1, ownerRoomIndex (-1 = outer shell)]; gaps = door openings
  const W = [
    [1, 3, 4, 3, -1], [7, 3, 19, 3, -1], [19, 3, 19, 29, -1], [19, 29, 1, 29, -1], [1, 29, 1, 3, -1],
    [12, 3, 12, 4.5, 1], [12, 7, 12, 13, 1], [12, 13, 19, 13, 1],
    [1, 13, 5, 13, 2], [8, 13, 10, 13, 2], [10, 13, 10, 20, 2],
    [13, 13, 13, 15, 3], [13, 17.5, 13, 20, 3], [13, 20, 19, 20, 3],
    [1, 20, 10, 20, 4], [11.5, 20, 11.5, 29, 4], [10, 20, 10.3, 20, 4],
    [12.6, 20, 13, 20, 5],
  ];

  window.sceneSetup = function (T) {
    const wt = (id, w, n) => L.wordTime(T, id, w, n);
    const K = {
      draw0: 0.0, draw1: 0.8,
      d20: wt('H1', 'twenty'), d30: wt('H1', 'thirty'),
      six: wt('H1', 'six'), hundred: L.wordEnd(T, 'H1', 'hundred'), sq: wt('H1', 'square'),
      q: wt('H2', 'think'), small: wt('H2', 'too'), h2end: T.lines[1].end,
      h3: T.lines[2].start,
      roomT: [], tilt0: 0, tilt1: 0, title: 0, total: T.total,
    };
    const step = 0.29; for (let i = 0; i < ROOMS.length; i++) K.roomT.push(K.h3 + 0.22 + i * step);
    K.tilt0 = K.roomT[ROOMS.length - 1] + 0.12; K.tilt1 = K.tilt0 + 1.05; K.title = K.tilt0 + 0.8;
    window.K = K;
    return K;
  };

  function camAt(t) {
    // phase 1-2: top-down, plot centred; slow push during the doubt beat; phase 3: tilt + yaw to 2.5D
    const push = L.easeInOut(L.prog(t, K.d30, K.h2end)) * 1.2;
    const tp = L.easeInOut(L.prog(t, K.tilt0, K.tilt1));
    return {
      wx: 10, wy: 16,
      s: L.lerp(25 + push, 25.5, tp),
      yaw: L.lerp(0, -0.62, tp),
      pitch: L.lerp(0, 0.98, tp),
      tx: 960, ty: L.lerp(555, 470, tp),
    };
  }

  function groundGrid(ctx, cam, t) {
    ctx.save(); ctx.lineWidth = 1;
    const span = [-60, 80];
    for (let v = span[0]; v <= span[1]; v += 2) {
      const major = v % 10 === 0;
      ctx.strokeStyle = major ? P.gridMajor : P.grid;
      let a = L.proj(cam, v, span[0]), b = L.proj(cam, v, span[1]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      a = L.proj(cam, span[0], v); b = L.proj(cam, span[1], v);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
  }

  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

  function dimLine(ctx, a, b, p, label, la, off) {
    // a,b screen points; draws from centre outward with end ticks; label in a gap at middle
    if (p <= 0) return;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const ax = L.lerp(mx, a[0], p), ay = L.lerp(my, a[1], p), bx = L.lerp(mx, b[0], p), by = L.lerp(my, b[1], p);
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
    const gap = 62 * L.clamp(la * 2);
    ctx.save(); ctx.strokeStyle = P.dim; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const segA = Math.hypot(ax - mx, ay - my);
    if (segA > gap) {
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(mx - ux * gap, my - uy * gap); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + ux * gap, my + uy * gap); ctx.lineTo(bx, by); ctx.stroke();
    }
    // end ticks (architectural slash) + extension lines
    const tick = (x, y) => { ctx.beginPath(); ctx.moveTo(x - 12, y + 12); ctx.lineTo(x + 12, y - 12); ctx.stroke(); };
    if (p > 0.98) { tick(ax, ay); tick(bx, by);
      ctx.globalAlpha = 0.6; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax - off[0] * 0.8, ay - off[1] * 0.8); ctx.lineTo(ax + off[0] * 0.25, ay + off[1] * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - off[0] * 0.8, by - off[1] * 0.8); ctx.lineTo(bx + off[0] * 0.25, by + off[1] * 0.25); ctx.stroke(); }
    ctx.restore();
    const sc = L.backOut(L.clamp(la));
    if (la > 0) { ctx.save(); ctx.translate(mx, my); ctx.scale(sc, sc); L.text(ctx, label, 0, 2, 44, P.line, 800, 'center', L.clamp(la * 1.5)); ctx.restore(); }
  }

  window.drawScene = function (ctx, t, T) {
    const cam = camAt(t);
    const tp = L.easeInOut(L.prog(t, K.tilt0, K.tilt1));
    // background
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, 1920, 1080);
    groundGrid(ctx, cam, t);
    const g = ctx.createRadialGradient(960, 520, 250, 960, 540, 1150);
    g.addColorStop(0, 'rgba(40,90,150,0.20)'); g.addColorStop(1, 'rgba(4,14,28,0.72)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);

    const pr = (x, y, z) => L.proj(cam, x, y, z);
    const plotPts = [pr(0, 0), pr(20, 0), pr(20, 30), pr(0, 30), pr(0, 0)];
    const roomsOn = L.prog(t, K.h3 - 0.05, K.h3 + 0.35);      // footprint starts drawing at H3
    const fadeDims = 1 - L.prog(t, K.tilt0 - 0.1, K.tilt0 + 0.35);

    // ---- plot: solid draw-on, later turns into a dashed boundary line
    const pDraw = L.easeInOut(L.prog(t, K.draw0, K.draw1));
    ctx.save();
    ctx.globalAlpha = 1 - roomsOn * 0.55;
    // faint plot fill (pulses accent when 600 lands)
    const pulse = Math.exp(-Math.pow((t - K.hundred - 0.08) / 0.22, 2));
    if (pDraw >= 1) { poly(ctx, plotPts.slice(0, 4)); ctx.fillStyle = `rgba(255,154,61,${0.03 + 0.14 * pulse})`; ctx.fill(); }
    // diagonal hatch lines inside the empty plot during the doubt beat
    const hatch = L.prog(t, K.q - 0.1, K.q + 0.4) * (1 - roomsOn);
    if (hatch > 0) {
      ctx.save(); poly(ctx, plotPts.slice(0, 4)); ctx.clip(); ctx.strokeStyle = `rgba(143,179,218,${0.16 * hatch})`; ctx.lineWidth = 2;
      for (let k = -30; k < 50; k += 2.5) { const a = pr(k, 0), b = pr(k + 30, 30); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.restore();
    }
    L.drawOn(ctx, plotPts.map((p) => [p[0], p[1]]), pDraw, P.line, 6 - roomsOn * 3, roomsOn > 0.5 ? [14, 12] : null);
    // corner markers (survey pegs)
    if (pDraw > 0.95) for (const p of plotPts.slice(0, 4)) { ctx.fillStyle = P.accent; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill(); }
    ctx.restore();

    // ---- dimension lines
    ctx.save(); ctx.globalAlpha = fadeDims;
    if (fadeDims > 0) {
      const off = 58;
      dimLine(ctx, [plotPts[0][0], plotPts[0][1] + off], [plotPts[1][0], plotPts[1][1] + off],
        L.easeOut(L.prog(t, K.d20 - 0.15, K.d20 + 0.3)), '20 ft', L.prog(t, K.d20, K.d20 + 0.22), [0, off]);
      dimLine(ctx, [plotPts[1][0] + off, plotPts[1][1]], [plotPts[2][0] + off, plotPts[2][1]],
        L.easeOut(L.prog(t, K.d30 - 0.15, K.d30 + 0.3)), '30 ft', L.prog(t, K.d30, K.d30 + 0.22), [off, 0]);
    }
    ctx.restore();

    // ---- 600 sq ft counter (right side)
    const cntIn = L.prog(t, K.six - 0.05, K.six + 0.15);
    if (cntIn > 0) {
      const fade = 1 - L.prog(t, K.h3 + 0.1, K.h3 + 0.45);
      const v = Math.round(600 * L.easeOut(L.prog(t, K.six, K.hundred)));
      const land = Math.exp(-Math.pow((t - K.hundred) / 0.12, 2));
      const x = 1560, y = 500;
      ctx.save(); ctx.globalAlpha = cntIn * fade;
      ctx.translate(x, y); ctx.scale(1 + land * 0.08, 1 + land * 0.08);
      L.text(ctx, String(v), 0, 0, 168, P.accent, 800, 'center', 1, -4);
      ctx.restore();
      L.text(ctx, 'sq ft', x, y + 118, 52, P.line, 700, 'center', L.prog(t, K.sq - 0.05, K.sq + 0.2) * fade, 2);
      // underline rule
      ctx.save(); ctx.globalAlpha = L.prog(t, K.sq, K.sq + 0.25) * fade; ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 120, y + 78); ctx.lineTo(x + 120, y + 78); ctx.stroke(); ctx.restore();
    }

    // ---- doubt beat: big question mark inside the plot + "too small?" tag (left side)
    const qIn = L.prog(t, K.q - 0.05, K.q + 0.3), qOut = 1 - L.prog(t, K.h3 - 0.05, K.h3 + 0.25);
    if (qIn > 0 && qOut > 0) {
      const c = pr(10, 15); const wob = Math.sin(t * 3.2) * 0.04;
      ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(wob); const sc = L.backOut(qIn);
      ctx.scale(sc, sc); L.text(ctx, '?', 0, 0, 340, 'rgba(234,242,255,0.22)', 800, 'center', qOut); ctx.restore();
      const tg = L.prog(t, K.small - 0.08, K.small + 0.25);
      L.tag(ctx, 'too small?', 420, 520, 60, P.bgDeep, P.accent, tg * qOut, L.backOut(tg));
    }

    // ---- rooms (floors), walls, labels
    const footDraw = L.easeInOut(roomsOn);
    const hWall = 9 * L.easeInOut(L.prog(t, K.tilt0 + 0.15, K.tilt1 + 0.05));
    // floors
    ROOMS.forEach((R, i) => {
      const a = L.prog(t, K.roomT[i] - 0.02, K.roomT[i] + 0.22); if (a <= 0) return;
      const sc = L.lerp(1.18, 1, L.backOut(a)); const [x0, y0, x1, y1] = R.r; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const q = (x, y) => pr(cx + (x - cx) * sc, cy + (y - cy) * sc, 0);
      const flash = Math.exp(-Math.pow((t - K.roomT[i] - 0.12) / 0.16, 2));
      ctx.save(); ctx.globalAlpha = L.clamp(a * 1.6);
      poly(ctx, [q(x0, y0), q(x1, y0), q(x1, y1), q(x0, y1)]);
      ctx.fillStyle = P.floor; ctx.fill();
      if (flash > 0.01) { ctx.fillStyle = `rgba(255,154,61,${0.35 * flash})`; ctx.fill(); }
      if (a < 1) { ctx.strokeStyle = `rgba(255,154,61,${0.9 * (1 - a)})`; ctx.lineWidth = 3; ctx.stroke(); }
      // stairs treads
      if (R.stairs) {
        ctx.strokeStyle = 'rgba(234,242,255,0.55)'; ctx.lineWidth = 2;
        for (let k = 0; k <= 8; k++) { const yy = y0 + 1 + k * 1.0; const A = q(x0 + 0.7, yy), B = q(x1 - 0.7, yy); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); }
        const A = q(cx, y0 + 1.2), B = q(cx, y1 - 1.0); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
        const ah = q(cx - 0.8, y1 - 2.0), ah2 = q(cx + 0.8, y1 - 2.0); ctx.beginPath(); ctx.moveTo(ah[0], ah[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(ah2[0], ah2[1]); ctx.stroke();
      }
      ctx.restore();
    });

    // walls: in plan they are thick lines; as the camera tilts they extrude into translucent quads (painter-sorted)
    const quads = [];
    W.forEach((w) => {
      const [x0, y0, x1, y1, own] = w;
      let a;
      if (own < 0) a = footDraw; else a = L.prog(t, K.roomT[own] + 0.02, K.roomT[own] + 0.2);
      if (a <= 0) return;
      // partial draw for the shell
      const ex = L.lerp(x0, x1, a), ey = L.lerp(y0, y1, a);
      const A0 = pr(x0, y0, 0), B0 = pr(ex, ey, 0), A1 = pr(x0, y0, hWall), B1 = pr(ex, ey, hWall);
      const mid = pr((x0 + ex) / 2, (y0 + ey) / 2, hWall / 2);
      quads.push({ d: mid[2], A0, B0, A1, B1, outer: own < 0 });
    });
    quads.sort((p, q) => q.d - p.d);
    ctx.save(); ctx.lineCap = 'square'; ctx.lineJoin = 'round';
    for (const Q of quads) {
      if (hWall > 0.05) {
        poly(ctx, [Q.A0, Q.B0, Q.B1, Q.A1]);
        ctx.fillStyle = Q.outer ? 'rgba(170,205,245,0.30)' : 'rgba(170,205,245,0.22)'; ctx.fill();
        ctx.strokeStyle = 'rgba(234,242,255,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = P.line; ctx.lineWidth = Q.outer ? 5 : 3.5;
        ctx.beginPath(); ctx.moveTo(Q.A1[0], Q.A1[1]); ctx.lineTo(Q.B1[0], Q.B1[1]); ctx.stroke();
      } else {
        ctx.strokeStyle = P.line; ctx.lineWidth = Q.outer ? 9 : 6;
        ctx.beginPath(); ctx.moveTo(Q.A0[0], Q.A0[1]); ctx.lineTo(Q.B0[0], Q.B0[1]); ctx.stroke();
      }
    }
    ctx.restore();

    // room labels (fade out as the camera tilts)
    const labA = 1 - L.prog(t, K.tilt0 + 0.05, K.tilt0 + 0.45);
    if (labA > 0) ROOMS.forEach((R, i) => {
      const a = L.prog(t, K.roomT[i] + 0.04, K.roomT[i] + 0.24); if (a <= 0) return;
      const [x0, y0, x1, y1] = R.r; const c = pr((x0 + x1) / 2, (y0 + y1) / 2 + (R.stairs ? 0 : 0), 0);
      const size = R.n.length > 7 ? 24 : 26;
      ctx.save(); ctx.font = `800 ${size}px ${P.font}`; ctx.letterSpacing = '2px';
      const w = ctx.measureText(R.n).width + 22;
      ctx.globalAlpha = a * labA; ctx.fillStyle = 'rgba(8,27,48,0.82)';
      ctx.beginPath(); ctx.roundRect(c[0] - w / 2, c[1] - 21, w, 42, 8); ctx.fill(); ctx.restore();
      L.text(ctx, R.n, c[0], c[1] + 1, size, P.line, 800, 'center', a * labA, 2);
    });

    // ---- small corner note (from the moment a layout is on screen)
    const noteA = L.prog(t, K.roomT[0], K.roomT[0] + 0.4);
    if (noteA > 0) {
      ctx.save(); ctx.globalAlpha = noteA; ctx.font = `600 26px ${P.font}`;
      const s = 'Example layout · check setbacks with your local authority'; const w = ctx.measureText(s).width;
      ctx.fillStyle = 'rgba(8,27,48,0.75)'; ctx.beginPath(); ctx.roundRect(48, 1080 - 48 - 50, w + 36, 50, 10); ctx.fill();
      ctx.fillStyle = P.dim; ctx.textBaseline = 'middle'; ctx.fillText(s, 66, 1080 - 48 - 24); ctx.restore();
    }

    // ---- title card
    const ti = L.prog(t, K.title, K.title + 0.4);
    if (ti > 0) {
      const e = L.easeOut(ti);
      const band = ctx.createLinearGradient(0, 760, 0, 1080);
      band.addColorStop(0, 'rgba(8,27,48,0)'); band.addColorStop(0.45, `rgba(8,27,48,${0.85 * e})`); band.addColorStop(1, `rgba(8,27,48,${0.92 * e})`);
      ctx.fillStyle = band; ctx.fillRect(0, 760, 1920, 320);
      L.text(ctx, '20×30 HOUSE PLAN', 960, 880 + (1 - e) * 30, 104, P.line, 800, 'center', e, 2);
      const t2 = L.easeOut(L.prog(t, K.title + 0.15, K.title + 0.55));
      ctx.save(); ctx.globalAlpha = t2; ctx.strokeStyle = P.accent; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(960 - 300 * t2, 948); ctx.lineTo(960 + 300 * t2, 948); ctx.stroke(); ctx.restore();
      L.text(ctx, 'LAYOUT IDEAS', 960, 996 + (1 - t2) * 20, 54, P.accent, 800, 'center', t2, 10);
    }
  };
})();
