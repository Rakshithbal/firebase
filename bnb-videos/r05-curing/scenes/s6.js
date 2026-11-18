// s6 — HOW MANY DAYS? "? DAYS" then a checklist clipboard (no numbers shown)
(function () {
  const START = 32.30, END = 42.21;
  const wt = (T, id, word, n = 0) => {
    const l = T.lines.find((x) => x.id === id); let k = 0;
    for (const w of l.words) if (w.w.toLowerCase().replace(/\W/g, '') === word) { if (k === n) return w.s; k++; }
    return l.start;
  };
  const pop = (t, t0, d = 0.45) => L.backOut(L.prog(t, t0, t0 + d));

  // ---------- icons (centred at 0,0, ~70px) ----------
  function bagIcon(ctx) {
    ctx.beginPath(); ctx.moveTo(-26, -30); ctx.lineTo(26, -30); ctx.lineTo(32, 34); ctx.quadraticCurveTo(0, 40, -32, 34); ctx.closePath();
    ctx.fillStyle = 'rgba(154,167,180,0.35)'; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-26, -30); ctx.lineTo(-30, -40); ctx.moveTo(26, -30); ctx.lineTo(30, -40); ctx.stroke();
    ctx.fillStyle = P.dim; ctx.fillRect(-20, -4, 40, 14);
  }
  function weatherIcon(ctx, t) {
    ctx.save(); ctx.translate(-10, -10); ctx.rotate(t * 0.6);
    ctx.strokeStyle = P.accent; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fillStyle = P.accent; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-14, 34); ctx.lineTo(30, 34); ctx.arc(30, 20, 14, Math.PI / 2, -Math.PI / 2, true);
    ctx.arc(12, 8, 18, -0.2, Math.PI + 0.6, true); ctx.arc(-14, 22, 12, -Math.PI / 2, Math.PI / 2, true); ctx.closePath();
    ctx.fillStyle = P.bg2; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function hatIcon(ctx) {
    ctx.beginPath(); ctx.moveTo(-30, 14); ctx.bezierCurveTo(-30, -36, 30, -36, 30, 14); ctx.closePath();
    ctx.fillStyle = P.accent; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-42, 18); ctx.lineTo(42, 18); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, 12); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(14,42,71,0.6)'; ctx.stroke();
  }
  function canIcon(ctx, tilt, t) {
    ctx.save(); ctx.rotate(tilt);
    ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.roundRect(-26, -18, 44, 42, 6); ctx.fillStyle = 'rgba(79,195,247,0.35)'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, 14); ctx.lineTo(44, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, -20); ctx.lineTo(50, -8); ctx.lineWidth = 7; ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-26, 2, 14, Math.PI / 2, -Math.PI / 2, false); ctx.stroke();
    ctx.restore();
    if (tilt > 0.2) {
      const tipX = Math.cos(tilt) * 46 - Math.sin(tilt) * -14, tipY = Math.sin(tilt) * 46 + Math.cos(tilt) * -14;
      for (let i = 0; i < 4; i++) { const ph = (t * 2.2 + i / 4) % 1; ctx.beginPath(); ctx.arc(tipX + 4 + ph * 6, tipY + ph * 46, 4, 0, Math.PI * 2); ctx.fillStyle = P.water; ctx.globalAlpha *= 1; ctx.fill(); }
    }
  }
  function pen(ctx, x, y) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.75);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(96, -8); ctx.lineTo(96, 8); ctx.lineTo(14, 8); ctx.closePath();
    ctx.fillStyle = P.line; ctx.fill(); ctx.strokeStyle = P.bg; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = P.accent; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.water; ctx.fillRect(78, -8, 18, 16);
    ctx.restore();
  }
  function dropShape(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, -20 * s);
    ctx.bezierCurveTo(6 * s, -10 * s, 13 * s, -3 * s, 13 * s, 5 * s); ctx.arc(0, 5 * s, 13 * s, 0, Math.PI, false);
    ctx.bezierCurveTo(-13 * s, -3 * s, -6 * s, -10 * s, 0, -20 * s); ctx.fillStyle = P.water; ctx.fill(); ctx.restore();
  }

  const BX = 120, BY = 430, BW = 840, BH = 900;
  const ROW_Y = [570, 700, 830, 960];
  const IX = 210, TX = 272, BLANK_END = 900;

  SCENES.push({
    id: 's6', start: START, end: END,
    draw(ctx, t, lt, T) {
      const tHow = wt(T, 'L07', 'how'), tDays = wt(T, 'L07', 'days'), tDep = wt(T, 'L07', 'depends');
      const tCem = wt(T, 'L07', 'cement'), tWea = wt(T, 'L07', 'weather'), tEng = wt(T, 'L07', 'engineer');
      const tNum = wt(T, 'L07', 'number'), tWrite = wt(T, 'L07', 'write');
      const tDec = wt(T, 'L08', 'decide'), tWat = wt(T, 'L08', 'waters'), tEvery = wt(T, 'L08', 'every'), tDay = wt(T, 'L08', 'day');
      const k = L.easeInOut(L.prog(t, tDep - 0.2, tDep + 0.3));

      // ---- "HOW MANY" + "? DAYS"
      const hm = L.easeOut(L.prog(t, tHow, tHow + 0.35)) * (1 - L.prog(t, tDep - 0.2, tDep + 0.05));
      if (hm > 0) L.text(ctx, 'HOW MANY', 540, 520 - (1 - hm) * 20, 64, P.dim, 800, 'center', hm);
      const dp = pop(t, tDays - 0.05, 0.5);
      if (dp > 0) {
        const y = L.lerp(680, 300, k), size = L.lerp(190, 100, k);
        ctx.save(); ctx.font = `800 ${size}px ${P.font}`;
        const wq = ctx.measureText('?').width, gap = size * 0.25, wd = ctx.measureText('DAYS').width;
        const x0 = 540 - (wq + gap + wd) / 2;
        ctx.translate(540, y); ctx.scale(dp, dp); ctx.translate(-540, -y);
        const pulse = 1 + 0.1 * Math.max(0, Math.sin((t - tDays) * 5));
        ctx.save(); ctx.translate(x0 + wq / 2, y); ctx.scale(pulse, pulse); ctx.rotate(Math.sin(t * 2.5) * 0.06);
        L.text(ctx, '?', 0, 0, size, P.accent, 800, 'center'); ctx.restore();
        L.text(ctx, 'DAYS', x0 + wq + gap, y, size, P.line, 800, 'left');
        ctx.restore();
        // dashed underline hint (hero)
        const ul = L.easeOut(L.prog(t, tDays + 0.2, tDays + 0.6)) * (1 - k);
        if (ul > 0) { ctx.save(); ctx.setLineDash([22, 16]); L.drawOn(ctx, [[300, 800], [780, 800]], ul, P.dim, 6); ctx.restore(); }
      }

      // ---- clipboard
      const bp = L.easeInOut(L.prog(t, tDep - 0.05, tDep + 0.7));
      if (bp > 0) {
        const fillA = L.prog(t, tDep + 0.2, tDep + 0.7);
        ctx.save(); ctx.globalAlpha *= fillA; const r = 30;
        const outline = [[540, BY], [BX + BW - r, BY], [BX + BW, BY + r], [BX + BW, BY + BH - r], [BX + BW - r, BY + BH], [BX + r, BY + BH], [BX, BY + BH - r], [BX, BY + r], [BX + r, BY], [540, BY]];
        ctx.beginPath(); outline.forEach((q, qi) => (qi ? ctx.lineTo(...q) : ctx.moveTo(...q))); ctx.fillStyle = 'rgba(8,26,48,0.78)'; ctx.fill(); ctx.restore();
        L.drawOn(ctx, outline, bp, P.line, 6);
        // clip
        const cpp = pop(t, tDep + 0.35, 0.4);
        if (cpp > 0) {
          ctx.save(); ctx.translate(540, BY); ctx.scale(cpp, cpp);
          ctx.beginPath(); ctx.roundRect(-130, -30, 260, 62, 16); ctx.fillStyle = P.concreteDark; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 5; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, -30, 18, Math.PI, 0); ctx.stroke();
          ctx.restore();
        }
      }

      // ---- rows
      const rows = [
        { t: tCem, label: 'Cement type', icon: (c) => bagIcon(c) },
        { t: tWea, label: 'Weather', icon: (c) => weatherIcon(c, t) },
        { t: tEng, label: "Engineer's number:", icon: (c) => hatIcon(c), blank: tNum, pen: tWrite },
        { t: tDec, label: 'Who waters daily:', icon: (c) => canIcon(c, L.easeInOut(L.prog(t, tWat - 0.1, tWat + 0.3)) * 0.55 * (1 - L.prog(t, tEvery + 0.6, tEvery + 1.0)), t), blank: tDec + 0.35, color: P.water },
      ];
      rows.forEach((rw, i) => {
        const y = ROW_Y[i];
        const a = L.prog(t, rw.t - 0.05, rw.t + 0.25); if (a <= 0) return;
        // separator
        ctx.save(); ctx.globalAlpha *= 0.5; ctx.setLineDash([10, 12]); L.drawOn(ctx, [[BX + 50, y + 65], [BX + BW - 50, y + 65]], L.easeOut(a), P.dim, 3); ctx.restore();
        // icon
        const ip = pop(t, rw.t - 0.05, 0.45);
        ctx.save(); ctx.translate(IX, y + Math.sin(t * 2.2 + i) * 3); ctx.scale(ip, ip); rw.icon(ctx); ctx.restore();
        // text
        const tp = L.easeOut(L.prog(t, rw.t, rw.t + 0.35));
        L.text(ctx, rw.label, TX - (1 - tp) * 30, y, 48, rw.color || P.line, 800, 'left', tp);
        if (rw.blank) {
          ctx.save(); ctx.font = `800 48px ${P.font}`; const tw = ctx.measureText(rw.label).width; ctx.restore();
          const bx0 = TX + tw + 22;
          L.drawOn(ctx, [[bx0, y + 26], [BLANK_END, y + 26]], L.easeOut(L.prog(t, rw.blank, rw.blank + 0.4)), P.dim, 5);
          if (rw.pen) {
            const pp = L.easeInOut(L.prog(t, rw.pen, rw.pen + 0.55));
            if (pp > 0) L.drawOn(ctx, [[bx0, y + 38], [L.lerp(bx0, BLANK_END, 1), y + 38]], pp, P.accent, 7);
            const pa = L.prog(t, rw.pen - 0.25, rw.pen) * (1 - L.prog(t, rw.pen + 0.8, rw.pen + 1.1));
            if (pa > 0) { ctx.save(); ctx.globalAlpha *= pa; pen(ctx, L.lerp(bx0, BLANK_END, pp), y + 38 - (1 - L.prog(t, rw.pen - 0.25, rw.pen)) * 30); ctx.restore(); }
          }
        }
      });

      // ---- open-ended day strip: generic squares scroll left past a "watering point"; no fixed count, fades off the right edge
      const ca = L.prog(t, tEvery - 0.35, tEvery);
      if (ca > 0) {
        const sz = 82, step = 104, cy = 1196, DX = 540, speed = 330, X0 = DX + 100, t0s = tEvery - 0.35;
        const clipL = BX + 24, clipR = BX + BW - 24;
        L.text(ctx, 'EVERY DAY', 540, 1072, 38, P.water, 800, 'center', ca);
        const scroll = speed * Math.max(0, t - t0s);
        ctx.save(); ctx.beginPath(); ctx.rect(clipL, cy - 140, clipR - clipL, 240); ctx.clip();
        const jMin = Math.max(0, Math.floor((scroll - (X0 - clipL) - sz) / step));
        for (let j = jMin; j < jMin + 14; j++) {
          const x = X0 + j * step - scroll;
          if (x < clipL - sz || x > clipR + sz) continue;
          const sp = pop(t, tEvery - 0.35 + j * 0.04, 0.35);
          if (sp <= 0) continue;
          const fade = L.clamp(1 - (x - 690) / 200) * L.clamp((x - (clipL + 10)) / 70);
          if (fade <= 0) continue;
          const tj = t0s + (X0 + j * step - DX) / speed; // time this square reaches the watering point
          ctx.save(); ctx.globalAlpha *= fade * ca; ctx.translate(x, cy); ctx.scale(sp, sp);
          const filled = L.easeOut(L.prog(t, tj, tj + 0.15));
          ctx.beginPath(); ctx.roundRect(-sz / 2, -sz / 2, sz, sz, 12);
          ctx.fillStyle = `rgba(79,195,247,${0.08 + 0.35 * filled})`; ctx.fill();
          ctx.strokeStyle = filled > 0.5 ? P.water : P.dim; ctx.lineWidth = 5; ctx.stroke();
          ctx.fillStyle = filled > 0.5 ? P.water : P.dim; ctx.fillRect(-sz / 2, -sz / 2, sz, 14);
          ctx.strokeStyle = P.line; ctx.lineWidth = 4; ctx.lineCap = 'round';
          [-18, 18].forEach((rx) => { ctx.beginPath(); ctx.moveTo(rx, -sz / 2 - 10); ctx.lineTo(rx, -sz / 2 + 6); ctx.stroke(); });
          const ck = L.prog(t, tj + 0.03, tj + 0.2);
          if (ck > 0) L.drawOn(ctx, [[-18, 6], [-5, 20], [20, -8]], ck, P.line, 7);
          ctx.restore();
          // drop falling onto this square as it passes
          const fp = L.prog(t, tj - 0.2, tj);
          if (fp > 0 && fp < 1) dropShape(ctx, DX, L.lerp(cy - 72, cy - 6, fp * fp), 1.0);
          const sp2 = L.prog(t, tj, tj + 0.35);
          if (sp2 > 0 && sp2 < 1) {
            ctx.save(); ctx.globalAlpha *= (1 - sp2) * fade; ctx.strokeStyle = P.water; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.ellipse(x, cy, 30 + sp2 * 24, 10 + sp2 * 8, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          }
        }
        ctx.restore();
        // continuation dots at the right edge
        L.text(ctx, '…', clipR - 40, cy + 6, 70, P.dim, 800, 'center', ca * (0.7 + 0.3 * Math.sin(t * 4)));
      }
    },
  });
})();
