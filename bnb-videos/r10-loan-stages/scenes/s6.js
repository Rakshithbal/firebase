// s6 — CTA (L09): paper plane flies in on "Send", headline word by word, BUYNBUILD · Loan Lens sign-off.
(function () {
  const START = 37.95, END = 41.93;

  function plane(ctx, s) {
    ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-120, 10); ctx.lineTo(130, -80); ctx.lineTo(10, 90); ctx.lineTo(-10, 30); ctx.closePath();
    ctx.fillStyle = '#F4F7FC'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, 30); ctx.lineTo(130, -80); ctx.lineTo(-40, 48); ctx.lineTo(-30, 96); ctx.closePath();
    ctx.fillStyle = '#C9D8EC'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, 30); ctx.lineTo(130, -80); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
  }

  SCENES.push({
    id: 's6', start: START, end: END,
    draw(ctx, t, lt, T) {
      const W = (w, n) => L.wordTime(T, 'L09', w, n);
      const tSend = W('send');
      const words = [
        { w: 'Send', t: tSend, line: 0, c: P.good }, { w: 'this', t: W('this'), line: 0 }, { w: 'to', t: W('to'), line: 0 },
        { w: 'someone', t: W('someone'), line: 1 }, { w: 'building', t: W('building'), line: 1, c: P.good },
        { w: 'this', t: W('this', 1), line: 2, c: P.good }, { w: 'year', t: W('year'), line: 2, c: P.good },
      ];

      // ---- paper plane along a curved dashed trail
      const fp = L.prog(t, tSend - 0.35, tSend + 0.45);
      const path = (u) => { const x = L.lerp(120, 600, u), y = 640 - Math.sin(u * Math.PI) * 120 + (1 - u) * 80; return [x, y]; };
      if (fp > 0) {
        const e = L.easeOut(fp);
        // trail
        ctx.save(); ctx.setLineDash([16, 14]); ctx.strokeStyle = 'rgba(143,179,218,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); for (let u = 0; u <= e - 0.08; u += 0.01) { const [x, y] = path(u); u === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore();
        const [px, py] = path(e); const bob = fp >= 1 ? Math.sin((t - tSend) * 2.4) * 8 : 0;
        // glow
        const g = ctx.createRadialGradient(px, py, 20, px, py, 260); g.addColorStop(0, 'rgba(124,224,163,0.22)'); g.addColorStop(1, 'rgba(124,224,163,0)');
        ctx.save(); ctx.fillStyle = g; ctx.fillRect(px - 260, py - 260, 520, 520); ctx.restore();
        ctx.save(); ctx.translate(px + 40, py + bob); ctx.rotate(-0.12 + (1 - e) * 0.3); plane(ctx, L.lerp(0.6, 1.25, e)); ctx.restore();
        // whoosh lines when it lands
        const wl = L.prog(t, tSend + 0.4, tSend + 0.9);
        if (wl > 0 && wl < 1) { ctx.save(); ctx.globalAlpha *= 1 - wl; ctx.strokeStyle = P.good; ctx.lineWidth = 6; ctx.lineCap = 'round';
          for (let i = 0; i < 3; i++) { const yy = py - 30 + i * 40, xx = px - 150 - wl * 60; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 70, yy); ctx.stroke(); } ctx.restore(); }
      }

      // ---- headline
      const sizes = [96, 96, 96], ys = [880, 1000, 1120];
      for (let ln = 0; ln < 3; ln++) {
        const ws = words.filter((w) => w.line === ln);
        ctx.save(); ctx.font = `800 ${sizes[ln]}px ${P.font}`;
        const sp = sizes[ln] * 0.28, widths = ws.map((w) => ctx.measureText(w.w).width);
        const tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); ctx.restore();
        let x = 540 - tot / 2;
        ws.forEach((w, i) => {
          const p = L.easeOut(L.prog(t, w.t - 0.06, w.t + 0.3));
          if (p > 0) {
            const s = L.lerp(0.8, 1, L.backOut(L.prog(t, w.t - 0.06, w.t + 0.36)));
            ctx.save(); ctx.translate(x + widths[i] / 2, ys[ln] + (1 - p) * 24); ctx.scale(s, s);
            L.text(ctx, w.w, 0, 0, sizes[ln], w.c || P.line, 800, 'center', p); ctx.restore();
          }
          x += widths[i] + sp;
        });
      }

      // ---- sign-off
      const so = L.easeOut(L.prog(t, W('year') + 0.2, W('year') + 0.7));
      if (so > 0) {
        L.drawOn(ctx, [[540, 1240], [300, 1240]], so, 'rgba(143,179,218,0.6)', 3);
        L.drawOn(ctx, [[540, 1240], [780, 1240]], so, 'rgba(143,179,218,0.6)', 3);
        L.text(ctx, 'BUYNBUILD · Loan Lens', 540, 1290, 40, P.line, 800, 'center', so);
      }
    },
  });
})();
