// s2 — (L03) cross-section: water seeps down the crack, through the slab, damp patch on the ceiling below.
//      (L04) camera pushes into the slab: moisture reaches a steel bar, a rust ring slowly grows. "REPAIRS GET BIGGER".
(function () {
  const A = window.R15A;
  const X0 = 80, X1 = 1000, FT = 470, ST = 494, SB = 674, GROUND = 1250, WALL = 90;
  const REBAR = [-3, -2, -1, 0, 1, 2, 3].map((k) => 522 + k * 112), RY = 634, RR = 12;
  const F = [522, 634];
  const C = A.crackPts(1502, 468, FT, 500, 594, 7, 7);
  const CW = C.map((_, i) => L.lerp(15, 0.5, Math.pow(i / (C.length - 1), 0.8)));
  const PATH = [[500, 594], [514, 606], [520, 618], [522, 634], [534, 648], [540, 662], [548, SB]];
  const STAIN_X = 548;

  function crackPoly(ctx) {
    ctx.beginPath();
    C.forEach(([x, y], i) => (i ? ctx.lineTo(x - CW[i], y) : ctx.moveTo(x - CW[i], y)));
    for (let i = C.length - 1; i >= 0; i--) ctx.lineTo(C[i][0] + CW[i], C[i][1]);
    ctx.closePath();
  }

  function world(ctx, t, T, o) {
    const p = o.p;
    // ground + room walls
    L.drawOn(ctx, [[X0 - 20, GROUND], [X1 + 20, GROUND]], L.prog(p, 0, 0.5), P.dim, 4);
    const ha = L.prog(p, 0.3, 0.8);
    if (ha > 0) {
      ctx.save(); ctx.globalAlpha *= ha * 0.6; ctx.strokeStyle = P.dim; ctx.lineWidth = 2.5;
      for (let x = X0; x < X1 + 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, GROUND + 4); ctx.lineTo(x - 18, GROUND + 24); ctx.stroke(); }
      ctx.restore();
    }
    for (const [a, b] of [[X0, X0 + WALL], [X1 - WALL, X1]]) {
      ctx.save(); ctx.globalAlpha *= ha;
      ctx.fillStyle = 'rgba(190,120,90,0.25)'; ctx.fillRect(a, SB, b - a, GROUND - SB);
      ctx.strokeStyle = A.hexA(P.dim, 0.5); ctx.lineWidth = 2; const bh = 48; let row = 0;
      for (let y = SB + bh; y < GROUND; y += bh) { ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.stroke(); }
      for (let y = SB; y < GROUND - 2; y += bh, row++) { const xm = a + (b - a) * (row % 2 ? 0.33 : 0.66); ctx.beginPath(); ctx.moveTo(xm, y); ctx.lineTo(xm, Math.min(GROUND, y + bh)); ctx.stroke(); }
      ctx.restore();
      L.drawOn(ctx, [[a, GROUND], [a, SB], [b, SB], [b, GROUND]], L.prog(p, 0.1, 0.6), P.line, 6);
    }
    // pendant lamp (room context)
    const la = L.prog(p, 0.5, 1) * o.calloutA;
    if (la > 0) {
      ctx.save(); ctx.globalAlpha *= la; ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(800, SB); ctx.lineTo(800, 760); ctx.stroke();
      ctx.fillStyle = 'rgba(255,194,97,0.85)'; ctx.beginPath(); ctx.moveTo(770, 800); ctx.lineTo(830, 800); ctx.lineTo(814, 760); ctx.lineTo(786, 760); ctx.closePath(); ctx.fill();
      ctx.restore();
      L.text(ctx, 'ROOM BELOW', 790, 1110, 30, P.dim, 800, 'center', la);
    }

    // slab body
    const fa = L.prog(p, 0.2, 0.7);
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha *= fa;
      const g = ctx.createLinearGradient(0, ST, 0, SB); g.addColorStop(0, '#B9C4CF'); g.addColorStop(1, '#8592A0');
      ctx.fillStyle = g; ctx.fillRect(X0, ST, X1 - X0, SB - ST);
      // finish layer (terrace screed / tiles)
      ctx.fillStyle = '#D6DEE7'; ctx.fillRect(X0, FT, X1 - X0, ST - FT);
      ctx.strokeStyle = 'rgba(14,42,71,0.35)'; ctx.lineWidth = 2;
      for (let x = X0 + 92; x < X1; x += 92) { ctx.beginPath(); ctx.moveTo(x, FT); ctx.lineTo(x, ST); ctx.stroke(); }
      // aggregate
      const rnd = L.rng(17), n = Math.round(((X1 - X0) * (SB - ST)) / 1300);
      ctx.fillStyle = 'rgba(80,94,110,0.45)';
      for (let i = 0; i < n; i++) {
        const cx = X0 + 8 + rnd() * (X1 - X0 - 16), cy = ST + 6 + rnd() * (SB - ST - 12), r = 2 + rnd() * 8;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) { const an = (k / 5) * Math.PI * 2 + rnd(), rr = r * (0.7 + rnd() * 0.5); ctx[k ? 'lineTo' : 'moveTo'](cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // wet zone inside slab (clipped)
    if (o.wet > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(X0, FT, X1 - X0, SB - FT); ctx.clip();
      const segs = PATH.length;
      PATH.forEach(([x, y], i) => {
        const k = L.clamp(o.wet * segs - i * 0.7);
        if (k <= 0) return;
        const R = 30 + 70 * k * (0.6 + 0.4 * o.wet);
        const g = ctx.createRadialGradient(x, y, 2, x, y, R);
        g.addColorStop(0, 'rgba(40,120,190,0.55)'); g.addColorStop(1, 'rgba(40,120,190,0)');
        ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
      });
      ctx.restore();
      // water path line
      ctx.save(); ctx.shadowColor = P.water; ctx.shadowBlur = 10;
      L.drawOn(ctx, PATH, L.clamp(o.wet * 1.4), P.water, 6); ctx.restore();
    }

    // rebar dots
    REBAR.forEach((bx, i) => {
      const s = L.backOut(L.prog(p, 0.45 + i * 0.05, 0.75 + i * 0.05)); if (s <= 0) return;
      const main = bx === F[0];
      ctx.save();
      if (main && o.rust > 0) {
        const R = RR + 3 + 16 * o.rust;
        const g = ctx.createRadialGradient(bx, RY, RR * 0.6, bx, RY, R + 10);
        g.addColorStop(0, 'rgba(200,99,42,0.95)'); g.addColorStop(0.7, `rgba(255,138,61,${0.55 * o.rust + 0.25})`); g.addColorStop(1, 'rgba(255,138,61,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, RY, R + 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.accent; ctx.lineWidth = 2.2; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(bx, RY, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      const rc = main ? o.rust : 0;
      ctx.fillStyle = `rgb(${Math.round(L.lerp(38, 140, rc))},${Math.round(L.lerp(56, 74, rc))},${Math.round(L.lerp(76, 34, rc))})`;
      ctx.strokeStyle = P.line; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.arc(bx, RY, RR * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    });
    // hairline from rust toward the underside (late, subtle)
    const hl = L.prog(o.rust, 0.65, 1);
    if (hl > 0) L.drawOn(ctx, [[F[0] + 10, RY + 12], [F[0] + 16, RY + 22], [F[0] + 13, RY + 31], [F[0] + 19, SB]], hl, P.bad, 1.6);

    // the crack (on top of slab + finish)
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha *= fa;
      crackPoly(ctx); ctx.fillStyle = '#0B2038'; ctx.fill();
      if (o.fill > 0) {
        ctx.save(); crackPoly(ctx); ctx.clip();
        const yl = L.lerp(FT - 4, C[C.length - 1][1] + 2, o.fill);
        ctx.fillStyle = P.water; ctx.fillRect(400, FT - 10, 200, yl - FT + 10); ctx.restore();
      }
      crackPoly(ctx); ctx.strokeStyle = P.bad; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.restore();
    }

    // water film on top
    if (o.film > 0) {
      const fh = 12 * o.film;
      ctx.save(); ctx.globalAlpha *= 0.85; ctx.fillStyle = A.hexA(P.water, 0.7);
      ctx.beginPath(); ctx.moveTo(X0, FT);
      for (let x = X0; x <= X1; x += 10) ctx.lineTo(x, FT - fh + Math.sin(x * 0.04 + t * 3) * fh * 0.2);
      ctx.lineTo(X1, FT); ctx.closePath(); ctx.fill(); ctx.restore();
    }

    // slab outline
    L.drawOn(ctx, [[X0, FT], [X1, FT], [X1, SB], [X0, SB], [X0, FT]], L.prog(p, 0, 0.6), P.line, 6);
    if (fa > 0) { ctx.save(); ctx.globalAlpha *= fa; ctx.strokeStyle = A.hexA(P.line, 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0, ST); ctx.lineTo(X1, ST); ctx.stroke(); ctx.restore(); }

    // damp stain on the underside (section view: a soft band hanging under the ceiling line)
    if (o.stain > 0) {
      const w = 30 + 190 * o.stain;
      ctx.save(); ctx.beginPath(); ctx.rect(X0 + WALL, SB, X1 - X0 - 2 * WALL, 40); ctx.clip();
      const g = ctx.createRadialGradient(STAIN_X, SB, 4, STAIN_X, SB, w);
      g.addColorStop(0, 'rgba(79,195,247,0.65)'); g.addColorStop(1, 'rgba(79,195,247,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(STAIN_X, SB, w, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // hanging drip (on "ceiling")
    if (o.drip > 0) {
      const q = o.drip, y = SB + 6 + (q > 0.7 ? Math.pow((q - 0.7) / 0.3, 2) * 80 : 0), r = 6 + 6 * Math.min(1, q / 0.7);
      A.drop(ctx, STAIN_X, y + r * 0.8, r, P.water, q > 0.95 ? (1 - q) / 0.05 : 1);
    }
  }

  function callout(ctx, t, a, stain) {
    if (a <= 0) return;
    const cx = 540, cy = 965, R = 168;
    ctx.save(); ctx.globalAlpha *= a;
    L.drawOn(ctx, [[STAIN_X, SB + 18], [cx, cy - R]], L.prog(a, 0, 0.6), P.line, 4);
    ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(STAIN_X, SB + 18, 7, 0, Math.PI * 2); ctx.fill();
    const s = L.backOut(L.clamp(a));
    ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = '#C9D3DE'; ctx.fill();
    ctx.save(); ctx.clip();
    // plaster texture
    const r = L.rng(5); ctx.fillStyle = 'rgba(80,100,120,0.12)';
    for (let i = 0; i < 120; i++) ctx.fillRect(-R + r() * 2 * R, -R + r() * 2 * R, 3, 3);
    if (stain > 0) {
      const Rs = 14 + 112 * stain, ph = t * 0.15;
      A.blob(ctx, 6, 8, Rs, Rs * 0.82, 77, ph); ctx.fillStyle = 'rgba(96,120,140,0.38)'; ctx.fill();
      A.blob(ctx, 6, 8, Rs * 0.72, Rs * 0.6, 78, ph); ctx.fillStyle = 'rgba(70,100,128,0.35)'; ctx.fill();
      A.blob(ctx, 6, 8, Rs, Rs * 0.82, 77, ph); ctx.strokeStyle = 'rgba(110,90,60,0.7)'; ctx.lineWidth = 5; ctx.stroke();
      A.blob(ctx, 6, 8, Rs * 0.72, Rs * 0.6, 78, ph); ctx.strokeStyle = 'rgba(110,90,60,0.45)'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = P.line; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    L.text(ctx, 'CEILING', 0, -R + 40, 28, '#3A5675', 800, 'center', 1);
    ctx.restore();
  }

  SCENES.push({
    id: 's2', start: 5.95, end: 17.07,
    draw(ctx, t, lt, T) {
      const W3 = (w) => L.wordTime(T, 'L03', w), W4 = (w) => L.wordTime(T, 'L04', w);
      const tSeeps = W3('seeps'), tReaches = W3('reaches'), tSlab = W3('slab'), tDamp = W3('damp'), tCeiling = W3('ceiling'), tBelow = W3('below');
      const tOver = W4('over'), tMoist = W4('moisture'), tSteel = W4('steel'), tRepairs = W4('repairs');
      const zp = L.easeInOut(L.prog(t, tOver - 0.15, tOver + 0.75));
      const o = {
        p: L.prog(t, this.start - 0.2, this.start + 0.55),
        film: 1 - 0.5 * L.prog(t, 10, 12),
        fill: L.easeInOut(L.prog(t, tSeeps - 0.05, tReaches + 0.1)),
        wet: L.easeInOut(L.prog(t, tReaches, tBelow)) * 0.75 + 0.25 * L.easeInOut(L.prog(t, tMoist - 0.1, tSteel + 0.2)),
        stain: L.easeOut(L.prog(t, tDamp - 0.1, tBelow + 0.6)),
        drip: L.prog(t, tCeiling, tCeiling + 1.1),
        rust: L.easeInOut(L.prog(t, tSteel + 0.15, 16.9)),
        calloutA: 1 - L.prog(t, tOver - 0.3, tOver + 0.05),
      };

      ctx.save();
      // frame clip (keeps the zoomed shot inside the safe area)
      ctx.beginPath(); ctx.roundRect(60, 232, 960, 1108, 28); ctx.clip();
      // rain above the slab, easing off
      const ra = (1 - L.prog(t, 9.5, 11.6)) * L.prog(t, this.start - 0.3, this.start + 0.2);
      ctx.save();
      const zs = L.lerp(1, 2.2, zp);
      ctx.translate(L.lerp(F[0], 540, zp), L.lerp(F[1], 760, zp)); ctx.scale(zs, zs); ctx.translate(-F[0], -F[1]);
      A.rain(ctx, t, 60, 1100, 240, FT - 6, 70, ra * 0.8, 33, 0.18);
      world(ctx, t, T, o);
      ctx.restore();

      // moisture particles flowing to the steel (screen space, zoomed shot)
      if (zp > 0.6) {
        const pa = L.prog(t, tMoist - 0.1, tMoist + 0.3) * (1 - 0.6 * L.prog(t, 16, 16.9));
        const map = ([x, y]) => [540 + (x - F[0]) * zs, 760 + (y - F[1]) * zs];
        const pts = PATH.slice(0, 4).map(map);
        for (let k = 0; k < 9; k++) {
          const q = ((t - tMoist) * 0.55 + k / 9) % 1; if (q < 0 || pa <= 0) continue;
          const [x, y] = A.pointAt(pts, q);
          ctx.save(); ctx.globalAlpha *= pa * Math.sin(q * Math.PI); ctx.fillStyle = P.water;
          ctx.beginPath(); ctx.arc(x + Math.sin(k * 2.1 + t * 3) * 8, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
      }
      // frame outline when zoomed
      if (zp > 0) {
        ctx.save(); ctx.globalAlpha *= zp * 0.7; ctx.strokeStyle = A.hexA(P.line, 0.6); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(62, 234, 956, 1104, 28); ctx.stroke(); ctx.restore();
      }
      ctx.restore();

      // callout of the ceiling seen from below
      const ca = L.easeOut(L.prog(t, tDamp - 0.2, tDamp + 0.25)) * o.calloutA;
      callout(ctx, t, ca, o.stain);

      // tags
      const fadeA = o.calloutA;
      if (fadeA > 0) {
        ctx.save(); ctx.globalAlpha *= fadeA;
        A.popTag(ctx, t, tSeeps, 'WATER SEEPS IN', 300, 330, 36, P.bg, P.water);
        A.popTag(ctx, t, tSlab, 'SLAB', 860, 584, 36, P.line, '#1C4673');
        A.popTag(ctx, t, tDamp + 0.1, 'DAMP PATCH', 540, 1190, 42, P.bg, P.line);
        ctx.restore();
      }
      if (zp > 0.8) {
        // STEEL label with leader
        const sa = A.fade(t, tSteel - 0.05, 0.3);
        if (sa > 0) {
          L.drawOn(ctx, [[575, 742], [700, 620]], sa, P.line, 4);
          A.popTag(ctx, t, tSteel, 'STEEL INSIDE', 790, 590, 38, P.bg, P.line);
        }
        A.popTag(ctx, t, tSteel + 0.6, 'RUST', 540, 910, 36, P.bg, P.accent, L.prog(t, tSteel + 0.5, tSteel + 0.8));
        A.popTag(ctx, t, tRepairs, 'REPAIRS GET BIGGER', 540, 1200, 50, P.bg, P.accent);
      }
    },
  });
})();
