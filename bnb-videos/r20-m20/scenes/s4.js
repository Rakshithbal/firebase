// s4 — ENGINEER PICKS: simple house section, callout tags to FOOTING / COLUMN / SLAB, each "GRADE: AS DESIGNED" (L05)
(function () {
  const A = window.R20A;
  const GROUND = 1075, SLAB_T = 600, SLAB_B = 650, CL = 470, CR = 880, CW = 46;

  function callout(ctx, title, x, y, ax, ay, p, t, hl) {
    if (p <= 0) return;
    const w = 320, h = 104;
    L.drawOn(ctx, [[x + w / 2, y], [ax - 10, y], [ax, ay]], L.prog(p, 0, 0.6), P.line, 3);
    ctx.save(); ctx.globalAlpha *= L.prog(p, 0, 0.3); ctx.fillStyle = P.line; ctx.beginPath(); ctx.arc(ax, ay, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const s = L.backOut(L.prog(p, 0.1, 1));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= L.clamp(p * 2);
    ctx.fillStyle = 'rgba(6,20,36,0.82)'; A.rr(ctx, -w / 2, -h / 2, w, h, 20); ctx.fill();
    ctx.strokeStyle = hl > 0 ? P.good : P.line; ctx.lineWidth = 4; A.rr(ctx, -w / 2, -h / 2, w, h, 20); ctx.stroke();
    L.text(ctx, title, 0, -20, 40, P.line, 800, 'center');
    L.text(ctx, 'GRADE: AS DESIGNED', 0, 26, 27, P.good, 800, 'center');
    ctx.restore();
  }

  function house(ctx, p, t) {
    // ground + hatching
    L.drawOn(ctx, [[360, GROUND], [1000, GROUND]], L.prog(p, 0, 0.4), P.dim, 5);
    const ha = L.prog(p, 0.2, 0.6);
    if (ha > 0) {
      ctx.save(); ctx.globalAlpha *= ha * 0.5; ctx.strokeStyle = P.dim; ctx.lineWidth = 2.5;
      for (let x = 370; x < 1000; x += 26) { ctx.beginPath(); ctx.moveTo(x, GROUND + 4); ctx.lineTo(x - 18, GROUND + 24); ctx.stroke(); }
      ctx.restore();
      // soil tint below ground
      ctx.save(); ctx.globalAlpha *= ha; ctx.fillStyle = 'rgba(120,90,60,0.12)'; ctx.fillRect(360, GROUND + 2, 640, 210); ctx.restore();
    }
    const fa = L.prog(p, 0.3, 0.8);
    const concrete = (x, y, w, h) => {
      if (fa <= 0) return;
      ctx.save(); ctx.globalAlpha *= fa;
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#B9C4CF'); g.addColorStop(1, '#8592A0');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
    };
    // footings (pads below ground)
    for (const cx of [CL, CR]) {
      concrete(cx - 85, 1180, 170, 60);
      L.drawOn(ctx, [[cx - 85, 1180], [cx + 85, 1180], [cx + 85, 1240], [cx - 85, 1240], [cx - 85, 1180]], L.prog(p, 0.2, 0.7), P.line, 5);
    }
    // columns
    for (const cx of [CL, CR]) {
      concrete(cx - CW / 2, SLAB_B, CW, 1180 - SLAB_B);
      L.drawOn(ctx, [[cx - CW / 2, 1180], [cx - CW / 2, SLAB_B]], L.prog(p, 0.3, 0.8), P.line, 5);
      L.drawOn(ctx, [[cx + CW / 2, 1180], [cx + CW / 2, SLAB_B]], L.prog(p, 0.3, 0.8), P.line, 5);
    }
    // brick infill (light) + window/door
    const ia = L.prog(p, 0.5, 0.9);
    if (ia > 0) {
      ctx.save(); ctx.globalAlpha *= ia;
      ctx.fillStyle = 'rgba(190,120,90,0.16)'; ctx.fillRect(CL + CW / 2, SLAB_B, CR - CL - CW, GROUND - SLAB_B);
      ctx.strokeStyle = A.hexA(P.dim, 0.35); ctx.lineWidth = 2;
      for (let y = SLAB_B + 34; y < GROUND; y += 34) { ctx.beginPath(); ctx.moveTo(CL + CW / 2, y); ctx.lineTo(CR - CW / 2, y); ctx.stroke(); }
      // door
      ctx.fillStyle = P.bg; ctx.fillRect(560, 860, 110, GROUND - 860);
      ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.strokeRect(560, 860, 110, GROUND - 860);
      // window
      ctx.fillStyle = 'rgba(79,195,247,0.25)'; ctx.fillRect(730, 760, 100, 100); ctx.strokeRect(730, 760, 100, 100);
      ctx.beginPath(); ctx.moveTo(780, 760); ctx.lineTo(780, 860); ctx.moveTo(730, 810); ctx.lineTo(830, 810); ctx.stroke();
      ctx.restore();
    }
    // slab + parapet
    concrete(420, SLAB_T, 510, SLAB_B - SLAB_T);
    L.drawOn(ctx, [[420, SLAB_T], [930, SLAB_T], [930, SLAB_B], [420, SLAB_B], [420, SLAB_T]], L.prog(p, 0.4, 0.9), P.line, 5);
    L.drawOn(ctx, [[430, SLAB_T], [430, 540], [452, 540], [452, SLAB_T]], L.prog(p, 0.6, 1), P.dim, 4);
    L.drawOn(ctx, [[920, SLAB_T], [920, 540], [898, 540], [898, SLAB_T]], L.prog(p, 0.6, 1), P.dim, 4);
    // rebar dots in slab
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha *= fa; ctx.fillStyle = '#26384C'; ctx.strokeStyle = P.line; ctx.lineWidth = 2.5;
      for (let x = 460; x < 920; x += 52) { ctx.beginPath(); ctx.arc(x, SLAB_B - 13, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
  }

  function sheet(ctx, x, y, s, a, t) {
    if (a <= 0 || s <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(0.06); ctx.scale(s, s);
    ctx.fillStyle = '#1C4673'; A.rr(ctx, -70, -88, 140, 176, 10); ctx.fill();
    ctx.strokeStyle = P.line; ctx.lineWidth = 5; A.rr(ctx, -70, -88, 140, 176, 10); ctx.stroke();
    // tiny blueprint: house outline + lines
    ctx.lineWidth = 3; ctx.strokeStyle = P.water;
    ctx.beginPath(); ctx.moveTo(-42, 4); ctx.lineTo(-42, -40); ctx.lineTo(42, -40); ctx.lineTo(42, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-50, -48); ctx.lineTo(50, -48); ctx.stroke();
    ctx.strokeStyle = P.dim;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-42, 28 + k * 18); ctx.lineTo(k === 2 ? 10 : 42, 28 + k * 18); ctx.stroke(); }
    ctx.restore();
  }

  SCENES.push({
    id: 's4', start: 19.597, end: 24.407,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L05', w);
      const t0 = this.start, tEng = W('engineer'), tPicks = W('picks'), tGrade = W('grade'), tEach = W('each'), tPart = W('part');
      const tHouse = W('house'), tBased = W('based'), tDesign = W('design');

      // header: hat + "YOUR ENGINEER PICKS"
      const hp = A.pop(t, tEng - 0.1, 0.45);
      A.hat(ctx, 175, 300, 1.15 * hp, Math.min(1, hp * 1.5));
      const a1 = L.easeOut(L.prog(t, tEng - 0.05, tEng + 0.3));
      L.text(ctx, 'ENGINEER', 250, 300, 46, P.line, 800, 'left', a1);
      const a2 = L.easeOut(L.prog(t, tPicks - 0.05, tPicks + 0.3));
      ctx.save(); ctx.font = `800 46px ${P.font}`; const wE = ctx.measureText('ENGINEER ').width; ctx.restore();
      L.text(ctx, 'PICKS THE GRADE', 250 + wE, 300, 46, P.accent, 800, 'left', a2);

      // house section
      house(ctx, L.easeOut(L.prog(t, t0 - 0.15, t0 + 1.0)), t);

      // callouts bottom-up on "each" / "part" / "house"
      const hl = L.prog(t, tDesign, tDesign + 0.2);
      callout(ctx, 'FOOTING', 222, 1210, CL - 85, 1210, L.prog(t, tEach - 0.12, tEach + 0.4), t, hl);
      callout(ctx, 'COLUMN', 222, 880, CL - CW / 2, 880, L.prog(t, tPart - 0.1, tPart + 0.4), t, hl);
      callout(ctx, 'SLAB', 222, 560, 420, 625, L.prog(t, tHouse - 0.15, tHouse + 0.4), t, hl);

      // "based on the design": blueprint sheet pops top-right, dashed links to each callout
      const sp = A.pop(t, tDesign - 0.15, 0.45);
      sheet(ctx, 905, 430, sp * 0.95, Math.min(1, sp * 1.5), t);
      const la = L.easeOut(L.prog(t, tBased - 0.05, tBased + 0.3));
      L.text(ctx, 'AS PER DESIGN', 760, 430, 32, P.water, 800, 'right', L.easeOut(L.prog(t, tDesign - 0.05, tDesign + 0.3)));
      // gentle green pulse on the callouts when "design" lands
      if (hl > 0 && la > 0) {
        const g = Math.exp(-Math.pow((t - tDesign - 0.25) / 0.25, 2));
        ctx.save(); ctx.globalAlpha *= g * 0.6; ctx.strokeStyle = P.good; ctx.lineWidth = 8;
        for (const y of [560, 880, 1210]) { A.rr(ctx, 222 - 168, y - 60, 336, 120, 26); ctx.stroke(); }
        ctx.restore();
      }
    },
  });
})();
