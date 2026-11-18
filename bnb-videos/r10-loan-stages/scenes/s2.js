// s2 — L02+L03: the bank releases the loan in stages as the house goes up.
// Left: house builds floor by floor (plinth, slab, walls, finishing). Right: stage track; each stage gets a check
// (inspection lens) and only then a packet leaves the bank and lands in that stage's slot.
(function () {
  const START = 3.85, END = 15.2;
  const BANK = { x: 820, y: 500, s: 1.0 };
  const VAULT = { xs: [690, 776, 862, 948], y: 585, s: 0.5 };
  const RAIL_X = 650, SLOT_X = 963;
  const ROWS = [ // bottom to top
    { name: 'PLINTH', y: 1190, word: 'plinth', lens: [250, 1235] },
    { name: 'SLAB', y: 1040, word: 'slab', lens: [455, 950] },
    { name: 'WALLS', y: 890, word: 'walls', lens: [240, 1150] },
    { name: 'FINISHING', y: 740, word: 'finishing', lens: [430, 1110] },
  ];
  const CHECK = [11.46, 12.2, 12.95, 13.7];   // check -> release cycle per stage (last packet lands on "released")
  const GROUND = 1265, HX0 = 110, HX1 = 570;
  const COLS = [152, 340, 528];

  function bricks(ctx, x0, x1, y0, y1, a) {
    ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    ctx.fillStyle = 'rgba(190,120,90,0.30)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = 'rgba(143,179,218,0.55)'; ctx.lineWidth = 2; const bh = 24; let row = 0;
    for (let y = y1; y > y0; y -= bh, row++) {
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let x = x0 + (row % 2 ? 0 : 26); x < x1; x += 52) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - bh); ctx.stroke(); }
    }
    ctx.restore();
  }

  function house(ctx, t, T) {
    const W = (w) => L.wordTime(T, 'L03', w);
    const tB = L.wordTime(T, 'L02', 'building'), tUp = L.wordTime(T, 'L02', 'goes');
    // ground
    L.drawOn(ctx, [[80, GROUND], [600, GROUND]], L.easeOut(L.prog(t, tB - 0.2, tB + 0.3)), P.dim, 5);
    const ha = L.prog(t, tB, tB + 0.4);
    if (ha > 0) { ctx.save(); ctx.globalAlpha *= ha * 0.55; ctx.strokeStyle = P.dim; ctx.lineWidth = 2.5;
      for (let x = 92; x < 600; x += 26) { ctx.beginPath(); ctx.moveTo(x, GROUND + 4); ctx.lineTo(x - 18, GROUND + 24); ctx.stroke(); } ctx.restore(); }
    // ghost outline of the planned house (dashed), drawn bottom-up on "goes up"
    const gp = L.easeInOut(L.prog(t, tUp - 0.1, tUp + 0.7));
    if (gp > 0) {
      ctx.save(); ctx.setLineDash([14, 12]); ctx.globalAlpha *= 0.7;
      L.drawOn(ctx, [[HX0, GROUND], [HX0, 900], [HX1, 900], [HX1, GROUND]], gp, P.dim, 3);
      ctx.restore();
    }
    // PLINTH
    const pP = L.easeOut(L.prog(t, W('plinth') - 0.05, W('plinth') + 0.35));
    if (pP > 0) {
      const top = GROUND - 60 * pP;
      ctx.fillStyle = '#7F8C99'; ctx.fillRect(HX0 + 10, top, HX1 - HX0 - 20, GROUND - top);
      ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.strokeRect(HX0 + 10, top, HX1 - HX0 - 20, GROUND - top);
    }
    // SLAB: columns rise, slab lands
    const sP = L.prog(t, W('slab') - 0.05, W('slab') + 0.4);
    if (sP > 0) {
      const ch = 240 * L.easeOut(L.prog(sP, 0, 0.6));
      for (const cx of COLS) { ctx.fillStyle = '#9AA7B4'; ctx.fillRect(cx - 12, 1205 - ch, 24, ch); ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.strokeRect(cx - 12, 1205 - ch, 24, ch); }
      const sl = L.backOut(L.prog(sP, 0.5, 1));
      if (sl > 0) {
        const y = L.lerp(900, 935, sl);
        ctx.save(); ctx.globalAlpha *= L.clamp(sl * 2);
        const g = ctx.createLinearGradient(0, y, 0, y + 30); g.addColorStop(0, '#B9C4CF'); g.addColorStop(1, '#8592A0');
        ctx.fillStyle = g; ctx.fillRect(HX0, y, HX1 - HX0, 30); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.strokeRect(HX0, y, HX1 - HX0, 30);
        ctx.restore();
      }
    }
    // WALLS: brick infill rising, with openings
    const wP = L.easeOut(L.prog(t, W('walls') - 0.05, W('walls') + 0.4));
    if (wP > 0) {
      const top = L.lerp(1205, 965, wP);
      const bays = [[COLS[0] + 12, COLS[1] - 12], [COLS[1] + 12, COLS[2] - 12]];
      for (const [a, b] of bays) bricks(ctx, a, b, top, 1205, 1);
      // openings (window bay 1, door bay 2)
      const oa = L.prog(wP, 0.7, 1);
      if (oa > 0) { ctx.save(); ctx.globalAlpha *= oa; ctx.fillStyle = P.bg;
        ctx.fillRect(195, 1020, 100, 85); ctx.fillRect(395, 1060, 80, 145);
        ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.strokeRect(195, 1020, 100, 85); ctx.strokeRect(395, 1060, 80, 145); ctx.restore(); }
    }
    // FINISHING: plaster/paint, window glass, door, parapet
    const fP = L.easeOut(L.prog(t, W('finishing') - 0.05, W('finishing') + 0.45));
    if (fP > 0) {
      ctx.save(); ctx.globalAlpha *= fP;
      // plaster over walls + columns
      ctx.fillStyle = '#E9DDC7'; ctx.fillRect(HX0 + 10, 965, HX1 - HX0 - 20, 240);
      ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.strokeRect(HX0 + 10, 965, HX1 - HX0 - 20, 240);
      // window
      ctx.fillStyle = 'rgba(79,195,247,0.55)'; ctx.fillRect(195, 1020, 100, 85);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.strokeRect(195, 1020, 100, 85);
      ctx.beginPath(); ctx.moveTo(245, 1020); ctx.lineTo(245, 1105); ctx.moveTo(195, 1062); ctx.lineTo(295, 1062); ctx.stroke();
      // door
      ctx.fillStyle = '#B5754A'; ctx.fillRect(395, 1060, 80, 145); ctx.strokeStyle = P.ink; ctx.strokeRect(395, 1060, 80, 145);
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(462, 1135, 5, 0, Math.PI * 2); ctx.fill();
      // sunshade over window
      ctx.fillStyle = '#9AA7B4'; ctx.fillRect(183, 1005, 124, 12);
      ctx.restore();
      // parapet rises
      const pr = L.easeOut(L.prog(fP, 0.3, 1));
      if (pr > 0) { const h = 36 * pr; ctx.fillStyle = '#E9DDC7'; ctx.fillRect(HX0, 935 - h, HX1 - HX0, h); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.strokeRect(HX0, 935 - h, HX1 - HX0, h); }
    }
  }

  function lens(ctx, x, y, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
    ctx.fillStyle = 'rgba(124,224,163,0.16)'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.line; ctx.lineWidth = 9; ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(82, 82); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 36, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
    ctx.restore();
  }

  SCENES.push({
    id: 's2', start: START, end: END,
    draw(ctx, t, lt, T) {
      const W2 = (w) => L.wordTime(T, 'L02', w), W3 = (w) => L.wordTime(T, 'L03', w);
      const tCons = W2('construction'), tBank = W2('bank'), tRel = W2('releases'), tStg = W2('stages');

      // ---- title (left)
      const a1 = L.easeOut(L.prog(t, tCons - 0.05, tCons + 0.35));
      L.text(ctx, 'CONSTRUCTION LOAN', 90 - (1 - a1) * 30, 290, 38, P.dim, 800, 'left', a1);
      const a2 = L.easeOut(L.prog(t, tRel - 0.05, tRel + 0.35));
      L.text(ctx, 'RELEASED', 90 - (1 - a2) * 30, 370, 74, P.line, 800, 'left', a2);
      const a3 = L.easeOut(L.prog(t, tStg - 0.05, tStg + 0.35));
      L.text(ctx, 'IN STAGES', 90 - (1 - a3) * 30, 452, 74, P.good, 800, 'left', a3);

      // ---- bank (top right)
      const bp = L.easeOut(L.prog(t, START + 0.05, START + 0.9));
      const glow = Math.exp(-Math.pow((t - tBank - 0.2) / 0.3, 2)) + 0.6 * Math.exp(-Math.pow((t - tRel - 0.3) / 0.35, 2));
      L.bank(ctx, BANK.x, BANK.y, BANK.s, bp, { glow });

      // ---- stage track (right)
      const railP = L.easeInOut(L.prog(t, tStg - 0.1, tStg + 0.6));
      L.drawOn(ctx, [[RAIL_X, ROWS[0].y], [RAIL_X, ROWS[3].y - 40]], railP, P.dim, 5);
      if (railP >= 1) { ctx.save(); ctx.fillStyle = P.dim; ctx.beginPath(); ctx.moveTo(RAIL_X, ROWS[3].y - 62); ctx.lineTo(RAIL_X - 14, ROWS[3].y - 38); ctx.lineTo(RAIL_X + 14, ROWS[3].y - 38); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ROWS.forEach((r, i) => {
        const ap = L.easeOut(L.prog(t, tStg + i * 0.12, tStg + 0.35 + i * 0.12));
        if (ap <= 0) return;
        const lit = L.prog(t, W3(r.word) - 0.05, W3(r.word) + 0.2);
        const ck = L.prog(t, CHECK[i] - 0.05, CHECK[i] + 0.4);
        // node
        ctx.save(); ctx.globalAlpha *= ap;
        ctx.fillStyle = lit > 0 ? L.hexA('#EAF2FF', 0.15 + 0.85 * lit) : P.bg; ctx.beginPath(); ctx.arc(RAIL_X, r.y, 24, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = lit > 0 ? P.line : P.dim; ctx.lineWidth = 5; ctx.stroke();
        ctx.restore();
        if (ck > 0) L.badge(ctx, RAIL_X, r.y, 27, ck);
        // label
        const col = ck > 0.5 ? P.good : (lit > 0 ? P.line : P.dim);
        const sc = 1 + 0.12 * Math.sin(lit * Math.PI);
        ctx.save(); ctx.translate(692, r.y); ctx.scale(sc, sc); L.text(ctx, r.name, 0, 2, 38, col, 800, 'left', ap); ctx.restore();
        // packet slot (dashed)
        ctx.save(); ctx.globalAlpha *= ap * (lit > 0 ? 0.9 : 0.5); ctx.setLineDash([8, 7]); ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
        L.rr(ctx, SLOT_X - 40, r.y - 26, 80, 52, 8); ctx.stroke(); ctx.restore();
      });

      // ---- house (left)
      ctx.save(); ctx.translate(340, GROUND); ctx.scale(1.15, 1.15); ctx.translate(-340, -GROUND);
      house(ctx, t, T);

      // ---- inspection lens hops between stages
      const lensA = L.prog(t, CHECK[0] - 0.45, CHECK[0] - 0.2) * (1 - L.prog(t, CHECK[3] + 0.5, CHECK[3] + 0.8));
      if (lensA > 0) {
        let lx = ROWS[0].lens[0], ly = ROWS[0].lens[1];
        for (let i = 1; i < 4; i++) {
          const k = L.easeInOut(L.prog(t, CHECK[i] - 0.4, CHECK[i] - 0.08));
          lx = L.lerp(lx, ROWS[i].lens[0], k); ly = L.lerp(ly, ROWS[i].lens[1], k);
        }
        lens(ctx, lx - 10, ly - 10 + Math.sin(t * 6) * 3, lensA);
      }
      ctx.restore();

      // ---- packets: from s1 row -> vault under the bank -> released one by one into their stage slot
      const R = window.R10.row;
      VAULT.xs.forEach((vx, i) => {
        const k = L.easeInOut(L.prog(t, START - 0.05 + i * 0.07, START + 0.75 + i * 0.07));
        let x = L.lerp(R.xs[i], vx, k), y = L.lerp(R.y, VAULT.y, k) - Math.sin(k * Math.PI) * 60, s = L.lerp(R.s, VAULT.s, k);
        // jiggle on "releases"
        y += -10 * Math.exp(-Math.pow((t - (tRel + 0.1 + i * 0.13)) / 0.07, 2));
        // flight to slot, after the check
        const f = L.prog(t, CHECK[i] + 0.18, CHECK[i] + 0.72);
        let glow = 0;
        if (f > 0) {
          const e = L.easeInOut(f), ty = ROWS[i].y, cx = 990, cy = Math.min(VAULT.y, ty) + 30;
          const u = 1 - e; x = u * u * vx + 2 * u * e * cx + e * e * SLOT_X; y = u * u * VAULT.y + 2 * u * e * cy + e * e * ty;
          glow = Math.sin(f * Math.PI) * 0.8;
        }
        const land = L.prog(t, CHECK[i] + 0.72, CHECK[i] + 1.1);
        if (land > 0 && land < 1) { glow = 1 - land; s *= 1 + 0.15 * Math.sin(land * Math.PI); }
        L.packet(ctx, x, y, s, { glow });
        if (land > 0 && land < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - land; ctx.strokeStyle = P.good; ctx.lineWidth = 5; ctx.lineCap = 'round';
          for (let j = 0; j < 6; j++) { const an = j * Math.PI / 3 + 0.5, r1 = 50 + land * 30, r2 = r1 + 18; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1 * 0.75); ctx.lineTo(x + Math.cos(an) * r2, y + Math.sin(an) * r2 * 0.75); ctx.stroke(); }
          ctx.restore();
        }
      });
      // "only after a check" label on "checked"
      const tChk = W3('checked');
      const cl = L.pop(t, tChk - 0.05, 0.4) * (1 - L.prog(t, END - 0.1, END + 0.2));
      if (cl > 0) { ctx.save(); ctx.translate(300, 590); ctx.scale(cl, cl); L.tag(ctx, 'CHECK, THEN RELEASE', 0, 0, 34, P.bg, P.good, L.clamp(cl)); ctx.restore(); }
    },
  });
})();
