// BNB "Engineer's notebook" reel engine (grown from style-samples/04-engineers-notebook).
// Pages of a squared engineer's pad; each scene is one page, drawn in felt marker as the narrator speaks,
// then flipped up out of frame to reveal the next page. Pure renderAt(t): every element is a timed stroke / glyph reveal.
// Needs: ../style-samples/tools/lib.js (L), window.T (timing), window.CFG {series, sub}, IMG_MARK / IMG_LOGO (data URLs).
const W = 1080, H = 1920;
const INK = '#1b1c20', OR = '#EF4B06', BLUE = '#2456d6', PAPER = '#f7f2e6';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const EV = []; window.EV = EV;
const FLIP = .5;

// ---------- word time lookup ----------
function wt(id, word, k = 0) {
  const l = T.lines.find(x => x.id === id); if (!l) throw new Error('no line ' + id);
  const clean = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  const hits = l.words.filter(w => clean(w.w) === clean(word)); if (!hits.length) throw new Error('no word ' + word + ' in ' + id);
  return hits[Math.min(k, hits.length - 1)].s;
}
function ls(id) { return T.lines.find(x => x.id === id).start; }
function le(id) { return T.lines.find(x => x.id === id).end; }

// ---------- paper ----------
let paper;
function bakePaper() {
  paper = document.createElement('canvas'); paper.width = W + 120; paper.height = H + 120;
  const g = paper.getContext('2d'); g.translate(60, 60);
  g.fillStyle = PAPER; g.fillRect(-60, -60, W + 120, H + 120);
  const r = L.rng(41);
  for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H, rr = 60 + r() * 200; const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, `rgba(${r() < .5 ? '150,130,100' : '255,255,250'},${.025 + r() * .02})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  const S = 46, ox = 22, oy = 14;
  for (let i = -2; i * S < W + 60; i++) { g.fillStyle = i % 5 === 0 ? 'rgba(70,110,150,.20)' : 'rgba(70,110,150,.12)'; g.fillRect(ox + i * S, -60, i % 5 === 0 ? 1.6 : 1.1, H + 120); }
  for (let j = -2; j * S < H + 60; j++) { g.fillStyle = j % 5 === 0 ? 'rgba(70,110,150,.20)' : 'rgba(70,110,150,.12)'; g.fillRect(-60, oy + j * S, W + 120, j % 5 === 0 ? 1.6 : 1.1); }
  g.fillStyle = 'rgba(200,70,60,.42)'; g.fillRect(106, -60, 2.2, H + 120); g.fillStyle = 'rgba(200,70,60,.22)'; g.fillRect(111, -60, 1.2, H + 120);
  g.strokeStyle = 'rgba(120,100,80,.10)'; g.lineWidth = 1;
  for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, a = r() * 6.28, l = 4 + r() * 12; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (r() - .5) * 4, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .06; const n = L.noiseCanvas(540, 960, 9, 60, 200); g.drawImage(n, -60, -60, W + 120, H + 120); g.globalAlpha = 1;
  const lamp = g.createRadialGradient(180, 120, 80, 260, 300, 1900);
  lamp.addColorStop(0, 'rgba(255,250,238,1)'); lamp.addColorStop(.5, 'rgba(252,242,222,1)'); lamp.addColorStop(1, 'rgba(226,206,172,1)');
  g.fillStyle = lamp; g.fillRect(-60, -60, W + 120, H + 120);
  g.globalCompositeOperation = 'source-over';
  const warm = g.createRadialGradient(200, 160, 0, 200, 160, 900); warm.addColorStop(0, 'rgba(255,214,150,.12)'); warm.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = warm; g.fillRect(-60, -60, W + 120, H + 120);
}

// ---------- marker ink ----------
function ink(s, upTo, col, b, hl) {
  if (upTo <= 0) return; const w = s.o.w;
  ctx.save(); ctx.lineCap = hl ? 'butt' : 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.globalCompositeOperation = 'multiply';
  if (hl) { ctx.globalAlpha = .34; ctx.lineWidth = w; s.path(ctx, upTo, b); ctx.stroke(); ctx.globalAlpha = .12; ctx.lineWidth = w * 1.06; s.path(ctx, upTo, b); ctx.stroke(); ctx.restore(); return; }
  ctx.globalAlpha = .16; ctx.lineWidth = w * 1.14; s.path(ctx, upTo, b); ctx.stroke();
  ctx.globalAlpha = col === INK ? .88 : .86; ctx.lineWidth = w; s.path(ctx, upTo, b); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#fbf6ea'; ctx.globalAlpha = .10; ctx.lineWidth = Math.max(1.2, w * .16);
  ctx.translate(w * .16, -w * .1); s.path(ctx, upTo, b); ctx.stroke();
  const p0 = s.vars[b % 3][0]; ctx.translate(-w * .16, w * .1); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .25; ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(p0[0], p0[1], w * .55, 0, 6.29); ctx.fill();
  ctx.restore();
}

// ---------- scenes ----------
const SC = []; let cur = null, seed = 100;
const colKey = c => c === OR ? 'o' : c === BLUE ? 'b' : 'k';
function scene(t0, fn, o = {}) { cur = Object.assign({ t0, E: [], cam: [540, 820] }, o); SC.push(cur); fn(); cur = null; }
function S(t0, t1, pts, o = {}) {
  const s = new L.Stroke(pts, Object.assign({ w: 9, seed: seed++ }, o)); const col = o.col || INK;
  cur.E.push({ t0, t1, k: 's', s, col, hl: !!o.hl });
  if (!o.quiet) EV.push({ t: +t0.toFixed(3), d: +(t1 - t0).toFixed(3), kind: o.kind || (o.hl ? 'hl' : 'stroke'), x: +(pts[0][0] / W).toFixed(3), col: colKey(col) });
  return s;
}
function Wr(t0, text, x, y, o = {}) {
  const h = new L.Hand(ctx, text, x, y, Object.assign({ size: 56, seed: seed++ }, o)); const cps = o.cps || 18, col = o.col || INK;
  cur.E.push({ t0, k: 'w', h, cps, col }); EV.push({ t: +t0.toFixed(3), d: +(h.n / cps).toFixed(3), kind: 'write', x: +(h.x0 / W).toFixed(3), col: colKey(col) });
  return h;
}
function fill(t0, d, x, y, w, h, o = {}) { cur.E.push({ t0, t1: t0 + d, k: 'f', x, y, w, h, c: o.c || 'rgba(255,253,246,.92)', rot: o.rot || 0, sh: o.sh !== false }); }
function img(t0, d, im, cx, cy, w, o = {}) { cur.E.push({ t0, t1: t0 + d, k: 'i', im, cx, cy, w, a: o.a ?? 1 }); }
function txt(t0, d, text, x, y, o = {}) { cur.E.push({ t0, t1: t0 + d, k: 't', text, x, y, font: o.font || '500 26px Inter', c: o.c || 'rgba(40,36,30,.7)', align: o.align || 'center', ls: o.ls || '0px' }); }
function stamp(t, text, cx, cy, o = {}) {
  const c = document.createElement('canvas'); const size = o.size || 130; const g = c.getContext('2d');
  g.font = `${size}px Bebas`; g.letterSpacing = '6px'; const tw = g.measureText(text).width; const pw = tw + 90, ph = size * 1.25;
  c.width = pw + 40; c.height = ph + 40; const gg = c.getContext('2d'); gg.translate(20, 20);
  gg.strokeStyle = OR; gg.lineWidth = 11; gg.beginPath(); gg.roundRect(6, 6, pw - 12, ph - 12, 14); gg.stroke();
  gg.lineWidth = 4; gg.beginPath(); gg.roundRect(22, 22, pw - 44, ph - 44, 8); gg.stroke();
  gg.fillStyle = OR; gg.font = `${size}px Bebas`; gg.letterSpacing = '6px'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(text, pw / 2 + 3, ph / 2 + size * .05);
  // distress: knock out speckles so it reads as rubber stamp ink
  gg.globalCompositeOperation = 'destination-out'; const r = L.rng(91);
  for (let i = 0; i < 900; i++) { gg.globalAlpha = .25 + r() * .6; gg.beginPath(); gg.arc(r() * pw, r() * ph, .6 + r() * 2.4, 0, 6.3); gg.fill(); }
  for (let i = 0; i < 9; i++) { gg.globalAlpha = .18; gg.fillRect(r() * pw, 0, 2 + r() * 10, ph); }
  cur.E.push({ t0: t, t1: t + .16, k: 'st', c, cx, cy, rot: o.rot ?? -.06 });
  cur.slam = t; EV.push({ t: +t.toFixed(3), d: .16, kind: 'slam', x: cx / W, col: 'o' });
}

// ---------- drawing vocabulary (all in page coords) ----------
const rectPts = (x, y, w, h) => [[x, y], [x + w, y + 1], [x + w - 1, y + h], [x + 1, y + h + 1], [x - 1, y + 4]];
function rect(t0, d, x, y, w, h, o = {}) { return S(t0, t0 + d, rectPts(x, y, w, h), Object.assign({ smooth: false, w: 7 }, o)); }
function line(t0, d, a, b, o = {}) { return S(t0, t0 + d, [a, b], Object.assign({ smooth: false, w: 6 }, o)); }
function ell(t0, d, cx, cy, rx, ry, o = {}) { return S(t0, t0 + d, L.arcPts(cx, cy, rx, ry, o.a0 ?? -2.9, o.a1 ?? 3.55, 60), Object.assign({ w: 8 }, o)); }
function arrow(t0, d, pts, o = {}) {
  S(t0, t0 + d, pts, Object.assign({ w: 7 }, o)); const a = pts[pts.length - 2], b = pts[pts.length - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = o.head || 26;
  S(t0 + d, t0 + d + .1, [[b[0] + Math.cos(an + 2.6) * hl, b[1] + Math.sin(an + 2.6) * hl], b, [b[0] + Math.cos(an - 2.6) * hl, b[1] + Math.sin(an - 2.6) * hl]], Object.assign({ w: 7, smooth: false }, o, { kind: 'stroke' }));
}
function tick(t0, x, y, s = 1, o = {}) { return S(t0, t0 + .2, [[x - 22 * s, y - 4 * s], [x - 6 * s, y + 14 * s], [x + 4 * s, y + 22 * s], [x + 18 * s, y - 8 * s], [x + 34 * s, y - 34 * s]], Object.assign({ w: 8 * Math.sqrt(s), kind: 'tick' }, o)); }
function cross(t0, x, y, s = 1, o = {}) { S(t0, t0 + .12, [[x - 26 * s, y - 26 * s], [x + 26 * s, y + 26 * s]], Object.assign({ w: 8 * Math.sqrt(s), smooth: false, kind: 'cross' }, o)); S(t0 + .14, t0 + .26, [[x + 26 * s, y - 26 * s], [x - 26 * s, y + 26 * s]], Object.assign({ w: 8 * Math.sqrt(s), smooth: false, kind: 'cross' }, o)); }
function cbox(t0, x, y, s = 34, o = {}) { return S(t0, t0 + .12, [[x, y], [x + s, y - 1], [x + s + 1, y + s], [x + 1, y + s + 1], [x, y + 2]], Object.assign({ w: 5, col: BLUE, smooth: false }, o)); }
function squig(t0, d, x, y, w, o = {}) { // illegible "handwriting" filler (never a number)
  const r = L.rng(seed + 7), p = [], n = Math.max(4, Math.round(w / 14));
  for (let i = 0; i <= n; i++) p.push([x + w * i / n, y + (i % 2 ? -8 : 6) * (o.amp || 1) + (r() - .5) * 6]);
  return S(t0, t0 + d, p, Object.assign({ w: 4.5, kind: 'write' }, o));
}
function dashed(t0, d, a, b, o = {}) { const n = o.n || 8; for (let i = 0; i < n; i++) { const u0 = i / n, u1 = u0 + .55 / n; S(t0 + d * u0, t0 + d * u1 + .02, [[L.lerp(a[0], b[0], u0), L.lerp(a[1], b[1], u0)], [L.lerp(a[0], b[0], u1), L.lerp(a[1], b[1], u1)]], Object.assign({ w: 5, smooth: false, quiet: i > 0 }, o)); } }
function hl(t0, d, x, y, w, h = 44, o = {}) { return S(t0, t0 + d, [[x, y], [x + w * .5, y - 2], [x + w, y + 1]], Object.assign({ w: h, col: OR, hl: true, wob: .8, boil: .3, smooth: false, step: 4 }, o)); }
function sheet(t0, d, x, y, w, h, o = {}) { // a sheet of paper laid on the pad: lighter fill + marker outline + dog-ear
  fill(t0, d * .6, x, y, w, h, { rot: o.rot || 0 });
  S(t0, t0 + d, [[x, y], [x + w - 34, y + 1], [x + w, y + 34], [x + w - 1, y + h], [x + 1, y + h + 1], [x - 1, y + 3]], Object.assign({ smooth: false, w: 7 }, o));
  S(t0 + d, t0 + d + .1, [[x + w - 34, y + 1], [x + w - 32, y + 33], [x + w, y + 34]], Object.assign({ smooth: false, w: 5, quiet: true }, o));
}
function house(t0, d, cx, by, s = 1, o = {}) { // simple elevation: walls, roof, door, window
  const w = 200 * s, h = 130 * s, x = cx - w / 2, y = by - h;
  S(t0, t0 + d * .4, [[x, by], [x, y], [x + w, y], [x + w, by], [x - 10 * s, by + 1]], Object.assign({ smooth: false, w: 7 }, o));
  S(t0 + d * .4, t0 + d * .7, [[x - 24 * s, y + 4], [cx, y - 96 * s], [x + w + 24 * s, y + 4]], Object.assign({ smooth: false, w: 7 }, o));
  S(t0 + d * .7, t0 + d * .85, [[cx - 22 * s, by], [cx - 22 * s, by - 70 * s], [cx + 22 * s, by - 70 * s], [cx + 22 * s, by]], Object.assign({ smooth: false, w: 5, quiet: true }, o));
  if (!o.nowin) S(t0 + d * .85, t0 + d, rectPts(x + 22 * s, y + 26 * s, 40 * s, 34 * s), Object.assign({ smooth: false, w: 5, quiet: true }, o));
}
function cloud(t0, d, cx, cy, rx, ry, o = {}) { // thought cloud: bumpy ellipse
  const p = [], n = 11; for (let i = 0; i <= n * 8; i++) { const a = -Math.PI / 2 + 6.283 * i / (n * 8), bump = 1 + .1 * Math.abs(Math.sin(a * n / 2 * 2)); p.push([cx + rx * bump * Math.cos(a), cy + ry * bump * Math.sin(a)]); }
  return S(t0, t0 + d, p, Object.assign({ w: 7, step: 3 }, o));
}
function phone(t0, d, cx, cy, s = 1, o = {}) {
  const w = 150 * s, h = 270 * s, x = cx - w / 2, y = cy - h / 2, r = 26 * s;
  S(t0, t0 + d * .7, [[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r], [x + r + 2, y - 1]], Object.assign({ w: 8 }, o));
  S(t0 + d * .7, t0 + d * .85, [[cx - 24 * s, y + 22 * s], [cx + 24 * s, y + 22 * s]], Object.assign({ w: 5, smooth: false, quiet: true }, o));
  S(t0 + d * .85, t0 + d, L.arcPts(cx, y + h - 26 * s, 9 * s, 9 * s, 0, 6.3, 14), Object.assign({ w: 4, smooth: false, quiet: true }, o));
}
function bubble(t0, d, cx, cy, rx, ry, tail, o = {}) { // speech bubble with a tail pointing to `tail`
  const a0 = Math.atan2(tail[1] - cy, tail[0] - cx); const p = L.arcPts(cx, cy, rx, ry, a0 + .22, a0 + 6.283 - .22, 56);
  p.push(tail, [cx + rx * Math.cos(a0 + .22) * 1.0, cy + ry * Math.sin(a0 + .22)]);
  return S(t0, t0 + d, p, Object.assign({ w: 7, smooth: false }, o));
}
function handshake(t0, d, cx, cy, s = 1, o = {}) { // two sleeves meeting, clasped hands as rounded mitts (no faces, no detail)
  const q = (x, y) => [cx + x * s, cy + y * s];
  S(t0, t0 + d * .25, [q(-260, 70), q(-110, 10)], Object.assign({ w: 8, smooth: false }, o));                       // left sleeve top
  S(t0, t0 + d * .25, [q(-240, 140), q(-96, 76)], Object.assign({ w: 8, smooth: false, quiet: true }, o));         // left sleeve bottom
  S(t0 + d * .2, t0 + d * .32, [q(-110, 10), q(-96, 76)], Object.assign({ w: 7, smooth: false, quiet: true }, o)); // cuff
  S(t0 + d * .25, t0 + d * .5, [q(260, 70), q(110, 10)], Object.assign({ w: 8, smooth: false }, o));
  S(t0 + d * .25, t0 + d * .5, [q(240, 140), q(96, 76)], Object.assign({ w: 8, smooth: false, quiet: true }, o));
  S(t0 + d * .45, t0 + d * .57, [q(110, 10), q(96, 76)], Object.assign({ w: 7, smooth: false, quiet: true }, o));
  S(t0 + d * .55, t0 + d * .8, [q(-104, 18), q(-40, -24), q(30, -26), q(98, 8), q(96, 70), q(40, 86), q(-30, 84), q(-94, 70)], Object.assign({ w: 8 }, o)); // clasp
  [-40, -8, 24].forEach((fx, i) => S(t0 + d * .8 + i * .04, t0 + d * .84 + i * .04, [q(fx, -18), q(fx + 16, 30)], Object.assign({ w: 5, smooth: false, quiet: true }, o)));
  S(t0 + d * .9, t0 + d, [q(-50, 2), q(-10, -38), q(12, -30)], Object.assign({ w: 6, quiet: true }, o)); // thumb
}
function bricks(t0, d, x, by, cols = 4, rows = 3, o = {}) {
  const bw = 62, bh = 30; let k = 0; const n = cols * rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols - (r % 2 ? 1 : 0); c++) { const bx = x + c * bw + (r % 2 ? bw / 2 : 0), y = by - (r + 1) * bh; const tt = t0 + d * k / n; k++;
    S(tt, tt + d / n, rectPts(bx, y, bw - 6, bh - 5), Object.assign({ w: 5, smooth: false, quiet: k > 1 && k % 3 }, o)); }
}
function plane(t0, d, cx, cy, s = 1, o = {}) {
  const q = (x, y) => [cx + x * s, cy + y * s];
  S(t0, t0 + d * .6, [q(-90, 10), q(90, -40), q(-40, 50), q(-90, 10)], Object.assign({ w: 7, smooth: false }, o));
  S(t0 + d * .6, t0 + d, [q(90, -40), q(-20, 20), q(-40, 50)], Object.assign({ w: 6, smooth: false, quiet: true }, o));
}
function bulb(t0, d, cx, cy, s = 1, o = {}) {
  S(t0, t0 + d * .6, [[cx - 22 * s, cy + 40 * s], [cx - 36 * s, cy + 4 * s], [cx - 44 * s, cy - 30 * s], [cx - 24 * s, cy - 64 * s], [cx, cy - 72 * s], [cx + 24 * s, cy - 64 * s], [cx + 44 * s, cy - 30 * s], [cx + 36 * s, cy + 4 * s], [cx + 22 * s, cy + 40 * s]], Object.assign({ w: 7 }, o));
  S(t0 + d * .6, t0 + d * .8, [[cx - 22 * s, cy + 52 * s], [cx + 22 * s, cy + 52 * s]], Object.assign({ w: 6, smooth: false, quiet: true }, o));
  S(t0 + d * .8, t0 + d, [[cx - 16 * s, cy + 64 * s], [cx + 16 * s, cy + 64 * s]], Object.assign({ w: 6, smooth: false, quiet: true }, o));
  [[-80, -40], [0, -110], [80, -40]].forEach(([dx, dy], i) => S(t0 + d + i * .05, t0 + d + .1 + i * .05, [[cx + dx * s * .78, cy + dy * s * .78], [cx + dx * s, cy + dy * s]], Object.assign({ w: 6, smooth: false, quiet: true }, o)));
}
function plan(t0, d, x, y, w, h, o = {}) { // a floor-plan sketch: outer wall double line, partitions, door swing
  S(t0, t0 + d * .3, rectPts(x, y, w, h), Object.assign({ smooth: false, w: 7 }, o));
  S(t0 + d * .3, t0 + d * .45, rectPts(x + 12, y + 12, w - 24, h - 24), Object.assign({ smooth: false, w: 3.5, quiet: true }, o));
  S(t0 + d * .45, t0 + d * .6, [[x + w * .55, y + 12], [x + w * .55, y + h * .6]], Object.assign({ smooth: false, w: 5, quiet: true }, o));
  S(t0 + d * .6, t0 + d * .75, [[x + 12, y + h * .55], [x + w * .4, y + h * .55]], Object.assign({ smooth: false, w: 5, quiet: true }, o));
  S(t0 + d * .75, t0 + d, L.arcPts(x + w * .4, y + h * .55, 50, 50, Math.PI / 2, Math.PI, 14), Object.assign({ w: 3.5, quiet: true }, o));
}
function magnifier(t0, d, cx, cy, r = 60, o = {}) {
  ell(t0, d * .7, cx, cy, r, r, Object.assign({ a0: -2.4, a1: 3.9 }, o));
  S(t0 + d * .7, t0 + d, [[cx + r * .72, cy + r * .72], [cx + r * 1.7, cy + r * 1.7]], Object.assign({ w: 14, smooth: false, quiet: true }, o));
}
function signature(t0, d, x, y, w = 160, o = {}) { const p = []; for (let i = 0; i <= 30; i++) { const u = i / 30; p.push([x + u * w, y + Math.sin(u * 14) * 18 - u * 10 + (i % 4 === 0 ? -10 : 0)]); } return S(t0, t0 + d, p, Object.assign({ w: 5, kind: 'sign' }, o)); }

// ---------- caption slip (from the style sample) ----------
function wrapWords(words, size, maxW) {
  ctx.font = `700 ${size}px Kalam`; const rows = [[]]; let w = 0; const sp = ctx.measureText(' ').width;
  for (const x of words) { const ww = ctx.measureText(x.w).width; if (w + ww > maxW && rows[rows.length - 1].length) { rows.push([]); w = 0; } rows[rows.length - 1].push(Object.assign({ ww }, x)); w += ww + sp; }
  return { rows, sp };
}
let slip;
function bakeSlip() {
  slip = document.createElement('canvas'); slip.width = 900; slip.height = 190; const g = slip.getContext('2d'); const r = L.rng(77);
  g.beginPath(); g.moveTo(14, 8); g.lineTo(886, 4);
  for (let y = 4; y < 186; y += 9) g.lineTo(880 + r() * 14, y); g.lineTo(888, 186); g.lineTo(10, 184);
  for (let y = 184; y > 8; y -= 9) g.lineTo(4 + r() * 14, y); g.closePath();
  g.shadowColor = 'rgba(60,40,20,.18)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  g.fillStyle = 'rgba(252,249,241,.98)'; g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(60,50,40,.35)'; g.lineWidth = 1; g.stroke();
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = .05; g.drawImage(L.noiseCanvas(450, 95, 3, 80, 128), 0, 0, 900, 190);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.save(); g.translate(60, 10); g.rotate(-.5); g.fillStyle = 'rgba(36,86,214,.20)'; g.fillRect(-46, -14, 92, 28); g.restore();
}
function captions(t) {
  const first = T.lines[0], last = T.lines[T.lines.length - 1];
  if (t < first.start - .15 || t > last.end + .7) return;
  let line = null; for (const l of T.lines) if (t >= l.start - .15) line = l;
  // long lines: show the half being spoken (split at the punctuation nearest the middle)
  let words = line.words;
  if (words.length > 10) { let best = -1, bd = 1e9; words.forEach((w, i) => { if (i > 2 && i < words.length - 3 && /[.,:?]$/.test(w.w) && Math.abs(i - words.length / 2) < bd) { bd = Math.abs(i - words.length / 2); best = i; } });
    if (best < 0) best = Math.floor(words.length / 2) - 1; const A = words.slice(0, best + 1), B = words.slice(best + 1); words = t < B[0].s - .05 ? A : B; }
  const a = Math.min(L.prog(t, first.start - .15, first.start + .05), 1 - L.prog(t, last.end + .5, last.end + .7));
  const y0 = 1376 + (1 - L.eo(a)) * 8;
  ctx.save(); ctx.globalAlpha = a; ctx.drawImage(slip, 70, y0);
  let size = 56; let wr = wrapWords(words, size, 780); if (wr.rows.length > 2) { size = 48; wr = wrapWords(words, size, 790); }
  const { rows, sp } = wr; const lh = size * 1.14, top = y0 + 95 - (rows.length - 1) * lh / 2 + size * .33;
  rows.forEach((row, ri) => {
    const rw = row.reduce((s, x) => s + x.ww, 0) + sp * (row.length - 1); let x = 520 - rw / 2; const y = top + ri * lh;
    for (const wd of row) { const on = t >= wd.s - .04; ctx.fillStyle = INK; ctx.globalAlpha = a * (on ? .95 : .28); ctx.font = `700 ${size}px Kalam`; ctx.fillText(wd.w, x, y); x += wd.ww + sp; }
  });
  ctx.restore();
}

// ---------- page + frame ----------
function drawEls(sc, td, b) {
  for (const e of sc.E) {
    if (e.k === 's') { const p = L.prog(td, e.t0, e.t1); if (p > 0) ink(e.s, p < 1 ? L.eio(p) * .7 + p * .3 : 1, e.col, b, e.hl); }
    else if (e.k === 'w') { const p = L.wp(td, e.t0, e.cps, e.h.n); if (p > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; e.h.draw(ctx, p, e.col, .93); ctx.restore(); } }
    else if (e.k === 'f') { const p = L.prog(td, e.t0, e.t1); if (p > 0) { ctx.save(); ctx.globalAlpha = L.eo(p);
        if (e.sh) { ctx.shadowColor = 'rgba(80,60,30,.16)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; } ctx.fillStyle = e.c; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.restore(); } }
    else if (e.k === 't') { const p = L.prog(td, e.t0, e.t1); if (p > 0) { ctx.save(); ctx.globalAlpha = L.eo(p); ctx.font = e.font; ctx.fillStyle = e.c; ctx.textAlign = e.align; ctx.letterSpacing = e.ls; ctx.fillText(e.text, e.x, e.y); ctx.restore(); } }
    else if (e.k === 'i') { const p = L.prog(td, e.t0, e.t1); if (p > 0) { const w = e.w * L.lerp(.94, 1, L.eo(p)), h = w * e.im.height / e.im.width; ctx.save(); ctx.globalAlpha = e.a * L.eo(p); ctx.drawImage(e.im, e.cx - w / 2, e.cy - h / 2, w, h); ctx.restore(); } }
    else if (e.k === 'st') { const p = L.prog(td, e.t0, e.t1); if (p > 0) { const s = L.lerp(1.9, 1, L.eo(p)); ctx.save(); ctx.translate(e.cx, e.cy); ctx.rotate(e.rot); ctx.scale(s, s);
        ctx.globalAlpha = Math.min(1, p * 1.6) * .92; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(e.c, -e.c.width / 2, -e.c.height / 2); ctx.restore(); } }
  }
}
function drawPage(i, t, td, b, lift) {
  const sc = SC[i], end = i + 1 < SC.length ? SC[i + 1].t0 : T.total;
  const tt = Math.min(t, end), z = 1 + .03 * L.eio(L.prog(tt, sc.t0, end)), [cx, cy] = sc.cam;
  let sx = 0, sy = 0; if (sc.slam != null && t > sc.slam + .12 && t < sc.slam + .5) { const k = (t - sc.slam - .12) / .38, a = (1 - k) * (1 - k) * 14; sx = Math.sin(k * 40) * a; sy = Math.cos(k * 33) * a * .7; }
  ctx.save();
  if (lift > 0) { const e = L.eio(lift); ctx.translate(0, -e * (H + 140)); ctx.translate(540, 0); ctx.rotate(-.05 * e); ctx.translate(-540, 0);
    ctx.shadowColor = 'rgba(40,25,10,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; }
  ctx.fillStyle = PAPER; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.shadowColor = 'transparent';
  ctx.translate(sx, sy); ctx.translate(cx - cx * z, cy - cy * z); ctx.scale(z, z);
  ctx.drawImage(paper, -60, -60);
  drawEls(sc, Math.min(td, end), b);
  ctx.restore();
  if (lift > 0) { // curl shading along the lifting edge
    const e = L.eio(lift), yb = H + 140 - e * (H + 140); const g = ctx.createLinearGradient(0, yb - 60, 0, yb + 40);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.6, 'rgba(60,40,20,.10)'); g.addColorStop(1, 'rgba(60,40,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, yb - 60, W, 100);
  }
}
function binding() { // wire spiral of the pad, top edge
  ctx.save(); ctx.fillStyle = 'rgba(50,40,30,.10)'; ctx.fillRect(0, 0, W, 34);
  for (let x = 36; x < W; x += 52) { ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, 22, 9, 26, .12, Math.PI * .95, Math.PI * 2.05); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x - 2, 20, 6, 22, .12, Math.PI * 1.2, Math.PI * 1.6); ctx.stroke();
    ctx.fillStyle = 'rgba(40,30,20,.55)'; ctx.beginPath(); ctx.arc(x + 2, 46, 6, 0, 6.3); ctx.fill(); }
  ctx.restore();
}
function header(t, endT) {
  const a = L.eo(L.prog(t, .1, .6)) * (1 - L.prog(t, endT - .3, endT));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(40,36,30,.66)'; ctx.font = '600 27px Inter'; ctx.letterSpacing = '4px'; ctx.fillText(CFG.series, 132, 168);
  ctx.fillStyle = 'rgba(40,36,30,.42)'; ctx.font = '500 20px Inter'; ctx.letterSpacing = '3px'; ctx.fillText(CFG.sub, 132, 202);
  const w = 92, h = w * IMG_MARK.height / IMG_MARK.width; ctx.globalAlpha = a * .92; ctx.drawImage(IMG_MARK, 900, 160, w, h);
  ctx.restore();
}
function renderAt(t) {
  const td = Math.floor(t * 15 + 1e-6) / 15, b = Math.floor(t * 12) % 3;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#e9dcc4'; ctx.fillRect(0, 0, W, H);
  let k = 0; for (let i = 0; i < SC.length; i++) if (t >= SC[i].t0) k = i;
  drawPage(k, t, td, b, 0);
  if (k > 0 && t < SC[k].t0 + FLIP) drawPage(k - 1, t, td, b, L.prog(t, SC[k].t0, SC[k].t0 + FLIP));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  binding(); header(t, SC[SC.length - 1].t0 + .2); captions(t);
}
// end card page: logo + small disclaimer
function endCard(t0) {
  scene(t0, () => {
    img(t0 + .35, .7, IMG_LOGO, 540, 760, 560);
    S(t0 + .9, t0 + 1.25, [[330, 1000], [540, 1006], [750, 998]], { w: 7, col: INK });
    txt(t0 + 1.1, .5, 'THE HONEST BUILDER’S GUIDE · HUBBALLI-DHARWAD', 540, 1080, { font: '600 24px Inter', ls: '3px', c: 'rgba(40,36,30,.62)' });
    txt(t0 + 1.3, .5, 'General guidance.', 540, 1230, { font: '500 28px Inter', c: 'rgba(40,36,30,.6)' });
    txt(t0 + 1.3, .5, 'Confirm with your engineer/contractor before you sign.', 540, 1272, { font: '500 28px Inter', c: 'rgba(40,36,30,.6)' });
  });
  EV.push({ t: t0, d: FLIP, kind: 'flip', x: .5, col: 'k' }); EV.push({ t: t0 + .35, d: .7, kind: 'logo', x: .5, col: 'o' });
}
window.boot = async (build) => {
  await document.fonts.load('700 50px Kalam'); await document.fonts.load('600 20px Inter'); await document.fonts.load('100px Bebas');
  await Promise.all([IMG_MARK.decode(), IMG_LOGO.decode()]);
  bakePaper(); bakeSlip(); build();
  for (let i = 1; i < SC.length; i++) if (!EV.some(e => e.kind === 'flip' && Math.abs(e.t - SC[i].t0) < .01)) EV.push({ t: SC[i].t0, d: FLIP, kind: 'flip', x: .5, col: 'k' });
  EV.sort((a, b) => a.t - b.t); renderAt(0);
};
window.renderAt = renderAt;
