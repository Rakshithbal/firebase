// s1 — HOOK: one big rupee bag ("ONE BIG AMOUNT?") does NOT come down in one go; it splits into smaller packets.
// Exports window.R10.row (packet positions at the end of s1) so s2 can pick the packets up from there.
(function () {
  const START = 0, END = 3.85;
  window.R10 = window.R10 || {};
  const ROW = (window.R10.row = { xs: [195, 425, 655, 885], y: 760, s: 1.25 });

  SCENES.push({
    id: 's1', start: START, end: END,
    draw(ctx, t, lt, T) {
      const W = (w, n) => L.wordTime(T, 'L01', w, n);
      const tLoan = W('loan'), tNot = W('not'), tOne = W('one'), tBig = W('big'), tAmt = W('amount');
      const tSplit = tAmt + 0.12;               // 3.14 — bag bursts into packets
      const bx = 540, by = 710;

      // soft green glow behind the bag
      const ga = L.easeOut(L.prog(t, 0.1, 0.9)) * (1 - 0.5 * L.prog(t, tSplit, tSplit + 0.5));
      if (ga > 0) {
        ctx.save(); ctx.globalAlpha *= ga;
        const g = ctx.createRadialGradient(bx, by, 30, bx, by, 520); g.addColorStop(0, 'rgba(124,224,163,0.20)'); g.addColorStop(1, 'rgba(124,224,163,0)');
        ctx.fillStyle = g; ctx.fillRect(bx - 520, by - 520, 1040, 1040); ctx.restore();
      }

      // "HOME LOAN" label (on "loan")
      const hl = L.pop(t, tLoan - 0.08, 0.4);
      if (hl > 0) { ctx.save(); ctx.translate(540, 340); ctx.scale(hl, hl); L.tag(ctx, 'HOME LOAN', 0, 0, 46, P.bg, P.line, L.clamp(hl)); ctx.restore(); }

      // ---- the big bag
      const bagIn = L.pop(t, 0.3, 0.55);
      const out = L.prog(t, tSplit - 0.02, tSplit + 0.16);
      if (bagIn > 0 && out < 1) {
        const bump = 1 + 0.09 * Math.exp(-Math.pow((t - tBig - 0.12) / 0.12, 2));
        let rot = 0;
        if (t > tAmt - 0.1 && t < tSplit) { const k = L.prog(t, tAmt - 0.1, tSplit); rot = Math.sin(k * 40) * 0.05 * k; }
        const sc = bagIn * bump * (1 + 0.25 * out);
        const bob = Math.sin(t * 2.3) * 6;
        ctx.save(); ctx.translate(bx, by + bob); ctx.scale(sc, sc);
        L.bag(ctx, 0, 0, 205, { alpha: 1 - out, rot });
        // dashed orange "cut" lines that appear on "one" .. "amount"
        const cp = L.easeInOut(L.prog(t, tOne, tAmt + 0.05));
        if (cp > 0 && out < 1) {
          ctx.save(); ctx.rotate(rot); ctx.globalAlpha *= 1 - out; ctx.setLineDash([18, 14]);
          for (const cx of [-95, 0, 95]) {
            const y0 = -150, y1 = 185, yy = L.lerp(y0, y1, cp);
            ctx.strokeStyle = P.accent; ctx.lineWidth = 7; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, yy); ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
      }

      // flash + burst at the split
      const fb = L.prog(t, tSplit, tSplit + 0.4);
      if (fb > 0 && fb < 1) {
        ctx.save(); ctx.globalAlpha *= (1 - fb) * 0.9;
        const g = ctx.createRadialGradient(bx, by, 10, bx, by, 360); g.addColorStop(0, 'rgba(234,242,255,0.55)'); g.addColorStop(1, 'rgba(234,242,255,0)');
        ctx.fillStyle = g; ctx.fillRect(bx - 360, by - 360, 720, 720);
        ctx.strokeStyle = P.good; ctx.lineWidth = 7; ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
          const an = (i / 12) * Math.PI * 2 + 0.2, r1 = 200 + fb * 140, r2 = r1 + 60 * (1 - fb);
          ctx.beginPath(); ctx.moveTo(bx + Math.cos(an) * r1, by + Math.sin(an) * r1); ctx.lineTo(bx + Math.cos(an) * r2, by + Math.sin(an) * r2); ctx.stroke();
        }
        ctx.restore();
      }

      // ---- packets fly out into a row
      ROW.xs.forEach((x, i) => {
        const k = L.prog(t, tSplit + i * 0.05, tSplit + 0.5 + i * 0.05);
        if (k <= 0) return;
        const e = L.backOut(k);
        const px = L.lerp(bx, x, e), py = L.lerp(by + 30, ROW.y, e) - Math.sin(k * Math.PI) * 120;
        const s = L.lerp(0.4, ROW.s, L.easeOut(k));
        L.packet(ctx, px, py, s, { rot: (1 - L.easeOut(k)) * (i - 1.5) * 0.5, glow: 1 - k * 0.6 });
      });

      // ---- "ONE BIG AMOUNT?" label, struck through on "not"
      const la = L.easeOut(L.prog(t, 0.55, 0.95)) * (1 - L.prog(t, tSplit - 0.1, tSplit + 0.25));
      if (la > 0) {
        const ly = 1090 + (1 - L.easeOut(L.prog(t, 0.55, 0.95))) * 30;
        ctx.save(); ctx.font = `800 70px ${P.font}`; const tw = ctx.measureText('ONE BIG AMOUNT?').width; ctx.restore();
        const struck = L.prog(t, tNot - 0.04, tNot + 0.22);
        L.text(ctx, 'ONE BIG AMOUNT?', 540, ly, 70, struck > 0 ? 'rgba(234,242,255,0.6)' : P.line, 800, 'center', la);
        if (struck > 0) {
          ctx.save(); ctx.globalAlpha *= la;
          L.drawOn(ctx, [[540 - tw / 2 - 20, ly + 10], [540 + tw / 2 + 20, ly - 12]], L.easeOut(struck), P.accent, 12);
          ctx.restore();
          const np = L.pop(t, tNot + 0.08, 0.4);
          if (np > 0) { ctx.save(); ctx.translate(540, ly + 110); ctx.scale(np, np); L.tag(ctx, 'NOT IN ONE GO', 0, 0, 44, P.bg, P.accent, L.clamp(np) * la); ctx.restore(); }
        }
      }
    },
  });
})();
