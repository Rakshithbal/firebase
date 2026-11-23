// s2 — CUBE TEST: small cubes -> one goes into a simple press, plates close, gauge needle rises to the DESIGNED mark (L03)
// No figures anywhere on the gauge (ticks only).
(function () {
  const A = window.R20A;
  const BASE_Y = 1040;           // top of the press bottom plate
  const CS = 150;                // cube edge in the press
  const CX = 250;                // cube front-face left x in the press
  const G = { x: 800, y: 660, r: 165 };  // gauge
  const A0 = Math.PI * 0.75, SW = Math.PI * 1.5, DES = 0.72;

  function press(ctx, p, topY, t) {
    // frame: two columns + crosshead + base plate, draw-on p
    const lw = 7;
    // base
    const bp = L.prog(p, 0, 0.5);
    if (bp > 0) {
      ctx.save(); ctx.globalAlpha *= bp; ctx.fillStyle = '#1C4673'; A.rr(ctx, 130, BASE_Y, 420, 46, 8); ctx.fill(); ctx.restore();
    }
    L.drawOn(ctx, [[130, BASE_Y], [550, BASE_Y], [550, BASE_Y + 46], [130, BASE_Y + 46], [130, BASE_Y]], bp, P.line, lw - 2);
    L.drawOn(ctx, [[160, BASE_Y + 46], [160, BASE_Y + 92], [520, BASE_Y + 92], [520, BASE_Y + 46]], L.prog(p, 0.2, 0.6), P.dim, 5);
    // columns
    const cp = L.prog(p, 0.2, 0.8);
    for (const x of [165, 515]) L.drawOn(ctx, [[x, BASE_Y], [x, 380]], cp, P.line, lw);
    // crosshead
    const hp = L.prog(p, 0.5, 1);
    if (hp > 0) { ctx.save(); ctx.globalAlpha *= hp; ctx.fillStyle = '#1C4673'; A.rr(ctx, 130, 340, 420, 60, 10); ctx.fill(); ctx.restore(); }
    L.drawOn(ctx, [[130, 340], [550, 340], [550, 400], [130, 400], [130, 340]], hp, P.line, lw - 2);
    // ram + top plate
    if (hp > 0) {
      ctx.save(); ctx.globalAlpha *= hp;
      ctx.fillStyle = 'rgba(143,179,218,0.35)'; ctx.fillRect(310, 400, 60, topY - 30 - 400);
      ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.strokeRect(310, 400, 60, topY - 30 - 400);
      ctx.fillStyle = '#1C4673'; A.rr(ctx, 215, topY - 30, 250, 30, 6); ctx.fill();
      ctx.lineWidth = 5; A.rr(ctx, 215, topY - 30, 250, 30, 6); ctx.stroke();
      ctx.restore();
    }
  }

  function gauge(ctx, p, v, t, desA, okA) {
    const { x, y, r } = G;
    // dial face
    const fp = L.easeOut(L.prog(p, 0, 1));
    if (fp <= 0) return;
    ctx.save(); ctx.globalAlpha *= fp;
    ctx.fillStyle = 'rgba(6,20,36,0.55)'; ctx.beginPath(); ctx.arc(x, y, r + 24, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // rim
    ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r + 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fp); ctx.stroke(); ctx.restore();
    // track
    ctx.save(); ctx.globalAlpha *= fp; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(143,179,218,0.25)'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(x, y, r - 22, A0, A0 + SW); ctx.stroke();
    // value arc
    if (v > 0.005) { ctx.strokeStyle = P.good; ctx.beginPath(); ctx.arc(x, y, r - 22, A0, A0 + SW * v); ctx.stroke(); }
    // ticks (no numbers)
    ctx.strokeStyle = P.dim; ctx.lineWidth = 4;
    for (let i = 0; i <= 12; i++) {
      const a = A0 + SW * i / 12, r1 = r + 2, r2 = r + (i % 3 === 0 ? -8 : 4) ;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); ctx.stroke();
    }
    ctx.restore();
    // DESIGNED mark
    if (desA > 0) {
      const a = A0 + SW * DES, glow = 1 + 0.5 * okA * (0.5 + 0.5 * Math.sin(t * 6));
      ctx.save(); ctx.globalAlpha *= desA; ctx.strokeStyle = P.accent; ctx.lineWidth = 9 * Math.min(1.4, glow); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r - 52), y + Math.sin(a) * (r - 52)); ctx.lineTo(x + Math.cos(a) * (r + 30), y + Math.sin(a) * (r + 30)); ctx.stroke();
      ctx.restore();
    }
    // needle
    ctx.save(); ctx.globalAlpha *= fp;
    const a = A0 + SW * v;
    ctx.strokeStyle = P.line; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 26, y - Math.sin(a) * 26); ctx.lineTo(x + Math.cos(a) * (r - 40), y + Math.sin(a) * (r - 40)); ctx.stroke();
    ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.bg; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  SCENES.push({
    id: 's2', start: L.cut(window.T, 'L03'), end: L.cut(window.T, 'L04'),
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L03', w);
      const t0 = this.start, tSmall = W('small'), tCubes = W('cubes'), tConc = W('concrete'), tTest = W('tested');
      const tGrade = W('grade'), tStr = W('strength'), tDes = W('designed'), tReach = W('reach');

      // title tag
      const ta = A.pop(t, t0 + 0.05, 0.45);
      A.pill(ctx, 'CUBE TEST', 340, 280, 40, P.line, ta, Math.min(1, ta * 1.5));

      // press + gauge draw-on
      const pp = L.easeOut(L.prog(t, t0 - 0.1, t0 + 0.9));
      // top plate closes on "tested"
      const close = L.easeInOut(L.prog(t, tTest - 0.1, tTest + 0.45));
      const cubeTop = BASE_Y - CS - CS * 0.34 * 0.72; // plate meets the cube's top-back edge
      const squeeze = Math.exp(-Math.pow((t - tTest - 0.5) / 0.12, 2)) * 6;
      const topY = L.lerp(640, cubeTop, close) + squeeze;
      press(ctx, pp, topY, t);

      // three small cubes on a shelf; the left one rises into the press
      const cubesP = [0, 1, 2].map((i) => A.pop(t, tCubes - 0.12 + i * 0.12, 0.42));
      const lift = L.easeInOut(L.prog(t, tConc - 0.1, tConc + 0.55));
      for (let i = 0; i < 3; i++) {
        if (i === 0) continue;
        const s = 92 * cubesP[i];
        A.cube(ctx, 655 + (i - 1) * 165, 1265, s, { alpha: Math.min(1, cubesP[i] * 1.5), seed: 30 + i, lw: 3.5 });
      }
      if (cubesP[0] > 0) {
        const s = L.lerp(92, CS, lift) * cubesP[0];
        const x = L.lerp(655 - 165, CX, lift), yb = L.lerp(1265, BASE_Y, lift) - Math.sin(lift * Math.PI) * 60;
        A.cube(ctx, x, yb, s, { alpha: Math.min(1, cubesP[0] * 1.5), seed: 30, lw: L.lerp(3.5, 5, lift) });
      }
      // shelf line + label under spare cubes
      const sh = L.easeOut(L.prog(t, tCubes - 0.2, tCubes + 0.3));
      L.drawOn(ctx, [[470, 1268], [1000, 1268]], sh, P.dim, 4);
      L.text(ctx, 'SAMPLE CUBES', 745, 1310, 30, P.dim, 800, 'center', sh);

      // compression arrows while the plates are closed
      const ca = L.prog(t, tTest + 0.3, tTest + 0.6) * (1 - L.prog(t, 14.9, 15.2));
      if (ca > 0) {
        ctx.save(); ctx.globalAlpha *= ca; ctx.strokeStyle = P.accent; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const j = Math.sin(t * 14) * 3;
        for (const [x, y, dir] of [[110, cubeTop + 20, 1], [600, cubeTop + 20, 1]]) {
          const yy = y + j;
          ctx.beginPath(); ctx.moveTo(x, yy - 50); ctx.lineTo(x, yy); ctx.moveTo(x - 14, yy - 16); ctx.lineTo(x, yy); ctx.lineTo(x + 14, yy - 16); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, BASE_Y + 50 - j); ctx.lineTo(x, BASE_Y - j); ctx.moveTo(x - 14, BASE_Y + 16 - j); ctx.lineTo(x, BASE_Y - j); ctx.lineTo(x + 14, BASE_Y + 16 - j); ctx.stroke();
        }
        ctx.restore();
      }

      // gauge: needle climbs from "grade" to the DESIGNED mark on "designed", settles on "reach"
      const gp = L.prog(t, t0 + 0.3, t0 + 1.2);
      const r1 = L.easeInOut(L.prog(t, tGrade, tDes));
      const settle = t > tDes ? 0.035 * Math.exp(-(t - tDes) * 4) * Math.sin((t - tDes) * 16) : 0;
      const v = DES * r1 + settle + 0.004 * Math.sin(t * 30) * L.prog(t, tGrade, tDes) * (1 - L.prog(t, tDes, tDes + 0.3));
      const desA = L.easeOut(L.prog(t, tStr - 0.2, tStr + 0.3));
      const okA = L.prog(t, tDes, tDes + 0.2);
      gauge(ctx, gp, Math.max(0, v), t, desA, okA);
      L.text(ctx, 'STRENGTH', G.x, G.y + G.r + 75, 36, P.line, 800, 'center', L.easeOut(gp));
      // DESIGNED label with leader (above-right of the mark)
      if (desA > 0) {
        const a = A0 + SW * DES, mx = G.x + Math.cos(a) * (G.r + 34), my = G.y + Math.sin(a) * (G.r + 34);
        const lx = 880, ly = 400;
        L.drawOn(ctx, [[mx, my], [lx, ly + 26]], desA, P.accent, 3);
        const s = A.pop(t, tStr - 0.1, 0.4) * (1 + 0.08 * okA * Math.exp(-(t - tDes) * 3));
        ctx.save(); ctx.translate(lx, ly); ctx.scale(s, s);
        L.tag(ctx, 'DESIGNED', 0, 0, 36, P.bg, P.accent, desA); ctx.restore();
      }
      // check on "reach"
      const ck = L.prog(t, tReach - 0.05, tReach + 0.3);
      if (ck > 0) {
        const s = L.backOut(L.clamp(ck * 1.4));
        ctx.save(); ctx.translate(G.x, G.y + 82); ctx.scale(s, s);
        ctx.fillStyle = P.good; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
        A.check(ctx, 0, 2, 40, L.prog(ck, 0.3, 1), P.bg, 8); ctx.restore();
      }
    },
  });
})();
