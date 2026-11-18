// s3 — INSIDE: magnifier into the slab; cement + water react, crystal links grow; strength bar fills steadily.
(function () {
  const A = window.R05A;
  const BAR = { x: 850, top: 420, bot: 1020, w: 80 };
  A.BAR = BAR;
  const CX = 420, CY = 720, R = 310;

  // grains [dx, dy, r]
  const G = [[-170, -160, 52], [0, -200, 48], [160, -140, 55], [-230, 10, 50], [-60, -40, 56], [110, 10, 50], [250, 40, 46],
    [-160, 160, 54], [30, 150, 52], [190, 180, 48], [-30, 300, 50], [-290, -190, 44], [300, -190, 44], [-290, 230, 44], [300, 270, 44]];
  const rg = L.rng(303);
  const grains = G.map(([dx, dy, r], i) => {
    const vs = []; const n = 9, rot = rg() * 6.28;
    for (let k = 0; k < n; k++) vs.push([(k / n) * Math.PI * 2 + rot + (rg() - 0.5) * 0.4, r * (0.78 + rg() * 0.34)]);
    return { x: CX + dx, y: CY + dy, r, vs, shade: 0.85 + rg() * 0.3, pop: 9.25 + i * 0.04 };
  });
  // neighbour links
  const links = [];
  for (let i = 0; i < grains.length; i++) for (let j = i + 1; j < grains.length; j++) {
    const d = Math.hypot(grains[i].x - grains[j].x, grains[i].y - grains[j].y);
    if (d < 215) links.push([i, j, d]);
  }
  // order links: central first
  links.sort((a, b) => (Math.hypot(grains[a[0]].x - CX, grains[a[0]].y - CY) + Math.hypot(grains[a[1]].x - CX, grains[a[1]].y - CY)) -
    (Math.hypot(grains[b[0]].x - CX, grains[b[0]].y - CY) + Math.hypot(grains[b[1]].x - CX, grains[b[1]].y - CY)));
  const strands = [];
  const rs = L.rng(77);
  links.forEach((lk, m) => {
    [0, -0.3, 0.3].forEach((off, k) => {
      const order = k * links.length + m; // first pass: one strand per link, then denser
      strands.push({ i: lk[0], j: lk[1], off, kink: (rs() - 0.5) * 16, order, jit: rs() });
    });
  });
  const NS = strands.length;
  strands.forEach((s) => { s.t0 = 10.75 + (s.order / NS) * 3.7 + s.jit * 0.15; });

  // drops: one per first-pass link, sitting in the gap; target = edge of grain i
  const rd = L.rng(515);
  const drops = links.slice(0, 12).map((lk, m) => {
    const a = grains[lk[0]], b = grains[lk[1]];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    return { mx: mx + (rd() - 0.5) * 20, my: my + (rd() - 0.5) * 20, ph: rd() * 6, r: 15 + rd() * 5,
      g: lk[0], tx: a.x + Math.cos(ang) * a.r * 0.95, ty: a.y + Math.sin(ang) * a.r * 0.95, ttouch: 10.0 + m * 0.09, tin: 9.7 + m * 0.04 };
  });

  const fillAt = (t) => 0.5 * L.prog(t, 12.2, 14.94);
  A.s3fill = fillAt;

  function grainPath(ctx, g, s) {
    ctx.beginPath();
    g.vs.forEach(([an, rr], k) => { const x = g.x + Math.cos(an) * rr * s, y = g.y + Math.sin(an) * rr * s; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath();
  }

  A.drawTicks = (ctx, T, t, bar) => {
    const tt = [L.wordAt(T, 'L03', 11), L.wordAt(T, 'L03', 12), L.wordAt(T, 'L03', 13)];
    tt.forEach((ti) => {
      const s = L.backOut(L.prog(t, ti, ti + 0.25)); if (s <= 0) return;
      const y = bar.bot - (bar.bot - bar.top) * fillAt(ti + 0.12);
      ctx.save(); ctx.translate(bar.x + bar.w + 8, y); ctx.scale(s, s);
      ctx.strokeStyle = P.good; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, 0); ctx.stroke();
      ctx.fillStyle = P.good; ctx.beginPath(); ctx.arc(36, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  };

  SCENES.push({
    id: 's3', start: 8.84, end: 14.94,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L03', w);
      const t0 = this.start, tCement = W('cement'), tWater = W('water'), tBuilds = W('builds');

      // continuity slab (with water film) at the bottom
      A.slab(ctx, Object.assign({}, A.SMALL, { p: 1, film: 1, t }));

      // magnifier zoom
      const z = L.easeOut(L.prog(t, t0 + 0.02, t0 + 0.55));
      const zb = L.backOut(L.prog(t, t0 + 0.02, t0 + 0.6));
      const sx = 420, sy = 1185;
      const cx = L.lerp(sx, CX, z), cy = L.lerp(sy, CY, z), r = L.lerp(34, R, zb);
      // small focus ring on slab
      ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      // cone lines
      if (z > 0.05) {
        ctx.save(); ctx.globalAlpha *= z; ctx.strokeStyle = A.hexA(P.line, 0.6); ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
        for (const sgn of [-1, 1]) {
          const a = Math.PI / 2 - sgn * 1.15;
          ctx.beginPath(); ctx.moveTo(sx + sgn * 34, sy - 6); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
        }
        ctx.restore();
      }
      // lens body
      ctx.save();
      ctx.fillStyle = '#0B2039'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.clip();
      const sc = r / R;
      ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-CX, -CY);
      // faint paste texture
      ctx.fillStyle = 'rgba(154,167,180,0.10)'; ctx.fillRect(CX - R, CY - R, R * 2, R * 2);

      // crystal strands (behind grains)
      ctx.lineCap = 'round';
      strands.forEach((s) => {
        const p = L.easeOut(L.prog(t, s.t0, s.t0 + 0.7)); if (p <= 0) return;
        const a = grains[s.i], b = grains[s.j];
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const ax = a.x + Math.cos(ang + s.off) * a.r * 0.85, ay = a.y + Math.sin(ang + s.off) * a.r * 0.85;
        const bx = b.x - Math.cos(ang - s.off) * b.r * 0.85, by = b.y - Math.sin(ang - s.off) * b.r * 0.85;
        const mx = (ax + bx) / 2 - Math.sin(ang) * s.kink, my = (ay + by) / 2 + Math.cos(ang) * s.kink;
        ctx.save(); ctx.globalAlpha *= 0.92;
        L.drawOn(ctx, [[ax, ay], [mx, my]], p, P.line, 3.5);
        L.drawOn(ctx, [[bx, by], [mx, my]], p, P.line, 3.5);
        // tiny side needles
        if (p > 0.6) {
          const q = (p - 0.6) / 0.4, nx = -Math.sin(ang) * 14 * q, ny = Math.cos(ang) * 14 * q;
          const px = L.lerp(ax, mx, 0.55), py = L.lerp(ay, my, 0.55);
          ctx.strokeStyle = P.line; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + nx + Math.cos(ang) * 6, py + ny + Math.sin(ang) * 6); ctx.stroke();
        }
        ctx.restore();
      });

      // grains
      grains.forEach((g, i) => {
        const s = L.backOut(L.prog(t, g.pop, g.pop + 0.35)); if (s <= 0) return;
        const v = Math.round(150 * g.shade);
        grainPath(ctx, g, s);
        ctx.fillStyle = `rgb(${v},${v + 12},${v + 25})`; ctx.fill();
        ctx.strokeStyle = '#DDE6EF'; ctx.lineWidth = 4; ctx.stroke();
        // hydration rim when a drop has touched
        const d = drops.find((dd) => dd.g === i);
        if (d) {
          const h = L.prog(t, d.ttouch + 0.35, d.ttouch + 0.7);
          if (h > 0) {
            ctx.save(); ctx.globalAlpha *= h * (0.55 + 0.45 * Math.exp(-(t - d.ttouch - 0.7) * 2));
            grainPath(ctx, g, s * 1.08); ctx.strokeStyle = P.water; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
          }
        }
      });

      // water drops
      drops.forEach((d) => {
        const a = L.easeOut(L.prog(t, d.tin, d.tin + 0.3)); if (a <= 0) return;
        const mv = L.easeInOut(L.prog(t, d.ttouch, d.ttouch + 0.45));
        const fx = d.mx + Math.sin(t * 1.6 + d.ph) * 6, fy = d.my + Math.cos(t * 1.3 + d.ph) * 6;
        const x = L.lerp(fx, d.tx, mv), y = L.lerp(fy, d.ty, mv);
        const absorb = L.prog(t, d.ttouch + 0.45, d.ttouch + 1.1);
        const rr = d.r * a * (1 - 0.75 * absorb);
        ctx.save(); ctx.globalAlpha *= 1 - absorb * 0.85;
        ctx.fillStyle = P.water; ctx.beginPath(); ctx.ellipse(x, y, rr * (1 + absorb * 0.6), rr * (1 - absorb * 0.3), 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x - rr * 0.25, y - rr * 0.25, rr * 0.45, Math.PI, Math.PI * 1.5); ctx.stroke();
        ctx.restore();
        // contact spark
        const sp = L.prog(t, d.ttouch + 0.4, d.ttouch + 0.75);
        if (sp > 0 && sp < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - sp; ctx.strokeStyle = P.line; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(d.tx, d.ty, 8 + sp * 26, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
      });
      ctx.restore(); // clip
      // lens rims
      ctx.strokeStyle = P.line; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = A.hexA(P.dim, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r + 16, 0, Math.PI * 2); ctx.stroke();
      // lens glint
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, r - 26, Math.PI * 1.08, Math.PI * 1.38); ctx.stroke();
      ctx.restore();

      // labels
      const labelTo = (txt, tx, ty, px, py, ta, fg, bgc) => {
        if (ta <= 0) return;
        L.drawOn(ctx, [[tx, ty + 30], [px, py]], ta, bgc, 4);
        ctx.save(); ctx.globalAlpha *= ta; ctx.fillStyle = bgc; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        const s = L.backOut(ta);
        ctx.save(); ctx.translate(tx, ty); ctx.scale(s, s); L.tag(ctx, txt, 0, 0, 40, fg, bgc, ta); ctx.restore();
      };
      const ca = L.easeOut(L.prog(t, tCement - 0.05, tCement + 0.3));
      const g1 = grains[1];
      labelTo('CEMENT', 230, 320, g1.x - 20, g1.y - 10, ca, P.bg, P.line);
      const wa = L.easeOut(L.prog(t, tWater - 0.05, tWater + 0.3));
      let wd = drops[0], best = 1e9;
      drops.forEach((d) => { const dd = Math.hypot(d.mx - 600, d.my - 470); if (dd < best) { best = dd; wd = d; } });
      const wmv = L.easeInOut(L.prog(t, wd.ttouch, wd.ttouch + 0.45));
      const wx = L.lerp(wd.mx + Math.sin(t * 1.6 + wd.ph) * 6, wd.tx, wmv), wy = L.lerp(wd.my + Math.cos(t * 1.3 + wd.ph) * 6, wd.ty, wmv);
      labelTo('WATER', 620, 320, wx, wy - wd.r - 4, wa, P.bg, P.water);

      // strength bar
      const bp = L.easeInOut(L.prog(t, 11.3, 12.0));
      A.bar(ctx, Object.assign({}, BAR, { p: bp, f: fillAt(t), t, label: L.prog(t, 11.6, 12.0) }));
      A.drawTicks(ctx, T, t, BAR);
      // gentle "building" glow at fill top
      const f = fillAt(t);
      if (f > 0) {
        const y = BAR.bot - (BAR.bot - BAR.top) * f;
        ctx.save(); ctx.globalAlpha *= 0.5 + 0.3 * Math.sin(t * 6);
        const gg = ctx.createRadialGradient(BAR.x + BAR.w / 2, y, 2, BAR.x + BAR.w / 2, y, 70);
        gg.addColorStop(0, 'rgba(124,224,163,0.6)'); gg.addColorStop(1, 'rgba(124,224,163,0)');
        ctx.fillStyle = gg; ctx.fillRect(BAR.x - 40, y - 70, BAR.w + 80, 140); ctx.restore();
      }
    },
  });
})();
