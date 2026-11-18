// s7 — CTA: bookmark icon on "Save", "Save this before your slab day", soft sign-off
(function () {
  const START = 42.21, END = 45.51;
  const wt = (T, id, word) => L.wordTime(T, id, word);
  const pop = (t, t0, d = 0.45) => L.backOut(L.prog(t, t0, t0 + d));

  function bookmarkPath(ctx, w, h) {
    const hw = w / 2, hh = h / 2;
    ctx.beginPath(); ctx.moveTo(-hw + 18, -hh); ctx.lineTo(hw - 18, -hh); ctx.quadraticCurveTo(hw, -hh, hw, -hh + 18);
    ctx.lineTo(hw, hh); ctx.lineTo(0, hh - 82); ctx.lineTo(-hw, hh); ctx.lineTo(-hw, -hh + 18); ctx.quadraticCurveTo(-hw, -hh, -hw + 18, -hh); ctx.closePath();
  }

  SCENES.push({
    id: 's7', start: START, end: END,
    draw(ctx, t, lt, T) {
      const tSave = wt(T, 'L09', 'save');
      const words = [
        { w: 'Save', t: tSave, line: 0 }, { w: 'this', t: wt(T, 'L09', 'this'), line: 0 }, { w: 'before', t: wt(T, 'L09', 'before'), line: 0 },
        { w: 'your', t: wt(T, 'L09', 'your'), line: 1 }, { w: 'slab', t: wt(T, 'L09', 'slab'), line: 1, c: P.accent }, { w: 'day', t: wt(T, 'L09', 'day'), line: 1, c: P.accent },
      ];

      // ---- bookmark
      const bp = pop(t, tSave - 0.12, 0.5);
      if (bp > 0) {
        const cx = 540, cy = 560 + Math.sin(t * 1.8) * 6;
        // soft glow
        const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260); g.addColorStop(0, 'rgba(79,195,247,0.22)'); g.addColorStop(1, 'rgba(79,195,247,0)');
        ctx.save(); ctx.globalAlpha *= Math.min(1, bp); ctx.fillStyle = g; ctx.fillRect(cx - 280, cy - 280, 560, 560); ctx.restore();
        ctx.save(); ctx.translate(cx, cy); ctx.scale(bp, bp);
        const fill = L.easeOut(L.prog(t, tSave + 0.3, tSave + 0.6));
        const squash = 1 + 0.08 * Math.sin(L.prog(t, tSave + 0.3, tSave + 0.7) * Math.PI);
        ctx.scale(squash, 2 - squash);
        bookmarkPath(ctx, 230, 320);
        if (fill > 0) {
          ctx.save(); ctx.clip(); ctx.fillStyle = P.water; ctx.fillRect(-120, 170 - 340 * fill, 240, 340 * fill); ctx.restore();
          bookmarkPath(ctx, 230, 320);
        }
        ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.strokeStyle = P.line; ctx.stroke();
        ctx.restore();
        // burst lines when it fills
        const bu = L.prog(t, tSave + 0.45, tSave + 0.95);
        if (bu > 0 && bu < 1) {
          ctx.save(); ctx.globalAlpha *= 1 - bu; ctx.strokeStyle = P.water; ctx.lineWidth = 7; ctx.lineCap = 'round';
          for (let i = 0; i < 8; i++) {
            const a = -Math.PI / 2 + (i - 3.5) * 0.42 + (i >= 4 ? Math.PI : 0) * 0;
            const ang = i * Math.PI / 4 + Math.PI / 8;
            const r0 = 200 + bu * 40, r1 = 240 + bu * 70;
            ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 0.95); ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * 0.95); ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ---- headline, word by word on two centred lines
      const sizes = [96, 104], ys = [900, 1024];
      ctx.save();
      for (let ln = 0; ln < 2; ln++) {
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
      // underline under "slab day"
      const tSlab = words[4].t, tDay = words[5].t;
      const ul = L.easeInOut(L.prog(t, tDay + 0.05, tDay + 0.4));
      if (ul > 0) {
        ctx.save(); ctx.font = `800 104px ${P.font}`;
        const sp = 104 * 0.28; const wy = ctx.measureText('your').width, wsd = ctx.measureText('slab').width + sp + ctx.measureText('day').width;
        const tot = wy + sp + wsd; const x0 = 540 - tot / 2 + wy + sp; ctx.restore();
        L.drawOn(ctx, [[x0, 1092], [x0 + wsd, 1092]], ul, P.accent, 8);
      }

      // ---- sign-off
      const so = L.easeOut(L.prog(t, tDay - 0.1, tDay + 0.35));
      if (so > 0) {
        L.drawOn(ctx, [[440, 1196], [640, 1196]], so, 'rgba(143,179,218,0.5)', 3);
        L.text(ctx, 'BUYNBUILD · Buildpedia', 540, 1252 + (1 - so) * 12, 40, P.dim, 800, 'center', so);
      }
    },
  });
})();
