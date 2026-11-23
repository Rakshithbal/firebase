// s4 — L06+L07: "Before you sign" → ASK YOUR BANK card; three questions pop in on their words.
(function () {
  const START = RT(23.75), END = RT(32.35);
  const CX0 = 90, CX1 = 990, CY0 = 370, CY1 = 1320;
  const ROWY = [680, 900, 1130], ICX = 185, TX = 268;

  function iconStages(ctx, p, t) { // rising steps with a flag
    for (let i = 0; i < 3; i++) {
      const s = L.backOut(L.prog(p, i * 0.2, 0.5 + i * 0.2)); if (s <= 0) continue;
      ctx.save(); ctx.translate(-22 + i * 22, 20 - i * 13); ctx.scale(1, s);
      ctx.fillStyle = i === 2 ? P.good : P.line; ctx.fillRect(-10, -8, 20, 8 + i * 13 + 8); ctx.restore();
    }
  }
  function iconProof(ctx, p) { // document with a check
    const a = L.prog(p, 0, 0.4); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = '#F4F7FC'; L.rr(ctx, -22, -28, 44, 56, 5); ctx.fill();
    ctx.fillStyle = 'rgba(14,42,71,0.5)'; ctx.fillRect(-13, -16, 26, 4); ctx.fillRect(-13, -6, 20, 4);
    ctx.restore();
    L.check(ctx, 4, 12, 26, L.prog(p, 0.4, 1), P.good, 6);
  }
  function iconClock(ctx, p, t) {
    const a = L.prog(p, 0, 0.4); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = P.line; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.lineCap = 'round'; const an = t * 2.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(an) * 18, -Math.cos(an) * 18); ctx.stroke();
    ctx.strokeStyle = P.accent; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(an / 12) * 12, -Math.cos(an / 12) * 12); ctx.stroke();
    ctx.restore();
  }
  function pen(ctx, x, y, s, a) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(-0.75); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(96, -8); ctx.lineTo(96, 8); ctx.lineTo(14, 8); ctx.closePath();
    ctx.fillStyle = P.line; ctx.fill(); ctx.fillStyle = P.accent; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  SCENES.push({
    id: 's4', start: START, end: END,
    draw(ctx, t, lt, T) {
      const W6 = (w) => L.wordTime(T, 'L06', w), W7 = (w, n) => L.wordTime(T, 'L07', w, n);
      const tBefore = W6('before'), tSign = W6('sign'), tAsk = W6('ask'), tBank = W6('bank'), tThree = W6('three');
      const Q = [
        { t: W7('what', 0), lines: ['What are the', 'stages?'], hi: [[1, 'stages?', W7('stages')]], icon: iconStages },
        { t: W7('what', 1), lines: ['What proof do you need', 'before each release?'], hi: [[1, 'before each release?', W7('before')]], icon: iconProof },
        { t: W7('and'), lines: ['How long does a', 'release take?'], hi: [[0, 'How long', W7('how')]], icon: iconClock },
      ];

      // ---- "BEFORE YOU SIGN" + pen squiggle
      const ba = L.easeOut(L.prog(t, tBefore - 0.05, tBefore + 0.35));
      L.text(ctx, 'BEFORE YOU SIGN', 90, 290, 40, P.dim, 800, 'left', ba);
      const sq = L.prog(t, tSign - 0.1, tSign + 0.55);
      if (sq > 0) {
        const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([560 + u * 330, 300 + Math.sin(u * 19) * 16 * (1 - u * 0.4) - u * 10]); }
        L.drawOn(ctx, [[540, 322], [960, 322]], L.easeOut(L.prog(t, tSign - 0.3, tSign)), P.dim, 3);
        L.drawOn(ctx, pts, L.easeInOut(sq), P.line, 5);
        const k = L.easeInOut(sq), u = Math.min(1, k);
        pen(ctx, 560 + u * 330, 300 + Math.sin(u * 19) * 16 * (1 - u * 0.4) - u * 10, 0.8, 1 - L.prog(t, tSign + 0.55, tSign + 0.8));
      }

      // ---- card
      const cp = L.easeOut(L.prog(t, tAsk - 0.35, tAsk + 0.15));
      if (cp > 0) {
        ctx.save(); ctx.globalAlpha *= cp; ctx.translate(0, (1 - cp) * 60);
        ctx.fillStyle = 'rgba(18,53,90,0.92)'; L.rr(ctx, CX0, CY0, CX1 - CX0, CY1 - CY0, 36); ctx.fill();
        ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.stroke();
        // header
        L.bank(ctx, 175, 520, 0.38, 1, {});
        L.text(ctx, 'ASK YOUR', 265, 470, 64, P.line, 800, 'left', 1);
        ctx.save(); ctx.font = `800 64px ${P.font}`; const wa = ctx.measureText('ASK YOUR ').width; ctx.restore();
        const bk = L.prog(t, tBank - 0.05, tBank + 0.2);
        L.text(ctx, 'BANK', 265 + wa, 470, 64, bk > 0 ? P.good : P.line, 800, 'left', 1);
        // three-things pips
        for (let i = 0; i < 3; i++) {
          const pp = L.pop(t, tThree + i * 0.1, 0.35); if (pp <= 0) continue;
          ctx.save(); ctx.translate(278 + i * 44, 540); ctx.scale(pp, pp); ctx.fillStyle = i < Q.filter((q) => t >= q.t).length ? P.good : P.dim;
          ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        L.text(ctx, 'THINGS', 278 + 3 * 44, 541, 30, P.dim, 800, 'left', L.prog(t, tThree + 0.2, tThree + 0.5));
        ctx.strokeStyle = 'rgba(143,179,218,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX0 + 40, 585); ctx.lineTo(CX1 - 40, 585); ctx.stroke();
        // empty question slots appear on "three"
        const sl = L.easeOut(L.prog(t, tThree, tThree + 0.4));
        Q.forEach((q, i) => {
          const y = ROWY[i];
          const qa = L.easeOut(L.prog(t, q.t - 0.06, q.t + 0.3));
          // slot
          ctx.save(); ctx.globalAlpha *= sl * (1 - qa); ctx.setLineDash([10, 9]); ctx.strokeStyle = P.dim; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(ICX, y, 56, 0, Math.PI * 2); ctx.stroke();
          L.rr(ctx, TX, y - 22, 560, 44, 22); ctx.stroke(); ctx.restore();
          if (qa <= 0) return;
          // icon circle
          const ip = L.pop(t, q.t - 0.06, 0.45);
          ctx.save(); ctx.translate(ICX, y); ctx.scale(ip, ip);
          ctx.fillStyle = '#0E2A47'; ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = P.good; ctx.lineWidth = 6; ctx.stroke();
          q.icon(ctx, L.prog(t, q.t + 0.05, q.t + 0.7), t);
          ctx.restore();
          // question text, 2 lines
          q.lines.forEach((s, li) => {
            const ly = y - 34 + li * 68 + (1 - qa) * 20;
            L.text(ctx, s, TX, ly, 50, P.line, 800, 'left', qa);
            for (const [hl, sub, th] of q.hi) {
              if (hl !== li) continue; const h = L.prog(t, th - 0.05, th + 0.25); if (h <= 0) continue;
              ctx.save(); ctx.font = `800 50px ${P.font}`; const off = ctx.measureText(s.slice(0, s.indexOf(sub))).width; const sw = ctx.measureText(sub).width; ctx.restore();
              L.text(ctx, sub, TX + off, ly, 50, P.good, 800, 'left', qa * h);
              L.drawOn(ctx, [[TX + off, ly + 34], [TX + off + sw, ly + 34]], L.easeOut(h), P.good, 5);
            }
          });
        });
        ctx.restore();
      }
    },
  });
})();
