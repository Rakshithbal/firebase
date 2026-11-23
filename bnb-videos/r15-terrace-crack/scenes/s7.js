// s7 — (L09) CTA: bookmark on "Save", "Save this for your pre-monsoon check", sign-off.
(function () {
  const A = window.R15A;
  SCENES.push({
    id: 's7', start: RT(35.24), end: RT(38.95),
    draw(ctx, t, lt, T) {
      const wt = (w) => L.wordTime(T, 'L09', w);
      const tSave = wt('save');
      const words = [
        { w: 'Save', t: tSave, line: 0 }, { w: 'this', t: wt('this'), line: 0 }, { w: 'for', t: wt('for'), line: 0 }, { w: 'your', t: wt('your'), line: 0 },
        { w: 'pre-monsoon', t: wt('premonsoon'), line: 1, c: P.water }, { w: 'check', t: wt('check'), line: 1, c: P.water },
      ];

      // bookmark
      const bp = A.pop(t, tSave - 0.12, 0.5);
      if (bp > 0) {
        const cx = 540, cy = 560 + Math.sin(t * 1.8) * 6;
        const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260); g.addColorStop(0, 'rgba(79,195,247,0.22)'); g.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.save(); ctx.globalAlpha *= Math.min(1, bp); ctx.fillStyle = g; ctx.fillRect(cx - 280, cy - 280, 560, 560); ctx.restore();
        ctx.save(); ctx.translate(cx, cy); ctx.scale(bp, bp);
        const fill = L.easeOut(L.prog(t, tSave + 0.3, tSave + 0.6));
        const squash = 1 + 0.08 * Math.sin(L.prog(t, tSave + 0.3, tSave + 0.7) * Math.PI);
        ctx.scale(squash, 2 - squash);
        A.bookmarkPath(ctx, 230, 320);
        if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = P.water; ctx.fillRect(-120, 170 - 340 * fill, 240, 340 * fill); ctx.restore(); A.bookmarkPath(ctx, 230, 320); }
        ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.strokeStyle = P.line; ctx.stroke();
        // small check inside once filled
        A.check(ctx, 0, -30, 90, L.prog(t, tSave + 0.55, tSave + 0.85), P.bg, 14);
        ctx.restore();
        const bu = L.prog(t, tSave + 0.45, tSave + 0.95);
        if (bu > 0 && bu < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - bu; ctx.strokeStyle = P.water; ctx.lineWidth = 7; ctx.lineCap = 'round';
          for (let i = 0; i < 8; i++) {
            const ang = i * Math.PI / 4 + Math.PI / 8, r0 = 200 + bu * 40, r1 = 240 + bu * 70;
            ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 0.95); ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * 0.95); ctx.stroke();
          }
          ctx.restore();
        }
      }

      // headline, word by word on two centred lines
      const sizes = [92, 92], ys = [900, 1020];
      for (let ln = 0; ln < 2; ln++) {
        const ws = words.filter((w) => w.line === ln);
        ctx.save(); ctx.font = `800 ${sizes[ln]}px ${P.font}`;
        const sp = sizes[ln] * 0.28, widths = ws.map((w) => ctx.measureText(w.w).width);
        ctx.restore();
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
        if (ln === 1) {
          const ul = L.easeInOut(L.prog(t, words[5].t + 0.05, words[5].t + 0.4));
          if (ul > 0) L.drawOn(ctx, [[540 - tot / 2, ys[1] + 64], [540 + tot / 2, ys[1] + 64]], ul, P.water, 8);
        }
      }

      // sign-off
      const so = L.easeOut(L.prog(t, words[5].t - 0.1, words[5].t + 0.35));
      if (so > 0 && window.BRAND) { // logo end card replaces the BUYNBUILD sign-off; keep the series name small
        L.text(ctx, 'FIX IT BEFORE IT SPREADS', 540, 1495, 32, P.dim, 800, 'center', L.easeOut(L.prog(t, T.lines[T.lines.length - 1].end + 0.6, T.lines[T.lines.length - 1].end + 1.2)));
      } else if (so > 0) {
        L.drawOn(ctx, [[440, 1176], [640, 1176]], so, 'rgba(143,179,218,0.5)', 3);
        L.text(ctx, 'BUYNBUILD · Fix It Before It Spreads', 540, 1232 + (1 - so) * 12, 38, P.dim, 800, 'center', so);
      }
    },
  });
})();
