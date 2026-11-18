// s8 — CTA: paper plane (share) flies in on "Send", "Send this to someone who is building", soft sign-off (L09)
(function () {
  const A = window.R20A;

  function plane(ctx, s, fillA) {
    ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round';
    // simple share paper plane, pointing right-up
    ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(130, -90); ctx.lineTo(40, 110); ctx.lineTo(10, 30); ctx.closePath();
    if (fillA > 0) { ctx.fillStyle = A.hexA(P.water, fillA); ctx.fill(); }
    ctx.strokeStyle = P.line; ctx.lineWidth = 12; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 30); ctx.lineTo(130, -90); ctx.lineWidth = 9; ctx.stroke();
    ctx.restore();
  }

  SCENES.push({
    id: 's8', start: 40.572, end: 44.41,
    draw(ctx, t, lt, T) {
      const W = (w) => L.wordTime(T, 'L09', w);
      const tSend = W('send'), tBuild = W('building');
      const words = [
        { w: 'Send', t: tSend, line: 0 }, { w: 'this', t: W('this'), line: 0 }, { w: 'to', t: W('to'), line: 0 },
        { w: 'someone', t: W('someone'), line: 1 }, { w: 'who', t: W('who'), line: 1 },
        { w: 'is', t: W('is'), line: 2 }, { w: 'building', t: tBuild, line: 2, c: P.accent },
      ];

      // ---- plane flies in along a dashed loop trail, then floats
      const fp = L.easeOut(L.prog(t, tSend - 0.25, tSend + 0.45));
      if (fp > 0) {
        const path = (u) => [L.lerp(150, 540, u) + Math.sin(u * Math.PI) * -40, L.lerp(760, 540, u) - Math.sin(u * Math.PI) * 90];
        const pts = []; for (let k = 0; k <= 30; k++) pts.push(path((k / 30) * fp));
        ctx.save(); ctx.setLineDash([14, 14]); L.drawOn(ctx, pts, 1, A.hexA(P.dim, 0.6 * (1 - L.prog(t, tSend + 0.6, tSend + 1.2))), 5); ctx.restore();
        const [x, y] = path(fp); const bob = fp >= 1 ? Math.sin((t - tSend) * 2) * 8 : 0;
        // glow
        const g = ctx.createRadialGradient(x, y, 20, x, y, 260); g.addColorStop(0, 'rgba(79,195,247,0.22)'); g.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.save(); ctx.globalAlpha *= fp; ctx.fillStyle = g; ctx.fillRect(x - 280, y - 280, 560, 560); ctx.restore();
        ctx.save(); ctx.translate(x, y + bob); ctx.rotate(L.lerp(-0.5, 0, fp) + 0.03 * Math.sin(t * 2));
        plane(ctx, L.lerp(0.5, 1, fp), L.easeOut(L.prog(t, tSend + 0.3, tSend + 0.6)) * 0.9);
        ctx.restore();
        // burst on arrival
        const bu = L.prog(t, tSend + 0.4, tSend + 0.9);
        if (bu > 0 && bu < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - bu; ctx.strokeStyle = P.water; ctx.lineWidth = 7; ctx.lineCap = 'round';
          for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + Math.PI / 8, r0 = 190 + bu * 40, r1 = 230 + bu * 70;
            ctx.beginPath(); ctx.moveTo(540 + Math.cos(an) * r0, 540 + Math.sin(an) * r0); ctx.lineTo(540 + Math.cos(an) * r1, 540 + Math.sin(an) * r1); ctx.stroke(); }
          ctx.restore();
        }
      }

      // ---- headline word by word, three centred lines
      const sizes = [92, 92, 104], ys = [830, 940, 1060];
      ctx.save();
      for (let ln = 0; ln < 3; ln++) {
        const ws = words.filter((w) => w.line === ln);
        ctx.font = `800 ${sizes[ln]}px ${P.font}`;
        const sp = sizes[ln] * 0.28; const widths = ws.map((w) => ctx.measureText(w.w).width);
        const tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
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
      ctx.restore();
      // underline under "building"
      const ul = L.easeInOut(L.prog(t, tBuild + 0.1, tBuild + 0.45));
      if (ul > 0) {
        ctx.save(); ctx.font = `800 104px ${P.font}`;
        const sp = 104 * 0.28, wi = ctx.measureText('is').width, wb = ctx.measureText('building').width;
        const x0 = 540 - (wi + sp + wb) / 2 + wi + sp; ctx.restore();
        L.drawOn(ctx, [[x0, 1128], [x0 + wb, 1128]], ul, P.accent, 8);
      }

      // ---- sign-off
      const so = L.easeOut(L.prog(t, tBuild - 0.05, tBuild + 0.4));
      if (so > 0) {
        L.drawOn(ctx, [[440, 1206], [640, 1206]], so, 'rgba(143,179,218,0.5)', 3);
        L.text(ctx, 'BUYNBUILD · Buildpedia', 540, 1262 + (1 - so) * 12, 40, P.dim, 800, 'center', so);
      }
    },
  });
})();
