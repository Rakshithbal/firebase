/* ==========================================================================
   BNB editorial illustration + motion helpers (window.BNB)
   Loaded once by index.html after gsap + timing.js. Scenes call these at init
   to BUILD static SVG geometry (deterministic, seeded), then animate the
   returned element refs on their own paused GSAP timeline.
   Rules: no Math.random (use BNB.rng), no timers, no DOM made after init.
   See DESIGN.md §6 for the full API table.
   ========================================================================== */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var B = (window.BNB = {});

  /* ---------------- tokens (mirror assets/bnb.css) ---------------- */
  B.C = {
    ink: "#06162a", ground: "#0b2139", ground2: "#10294a", navy: "#0e2a47",
    chalk: "#eef3fa", chalk2: "rgba(238,243,250,0.74)", chalk3: "rgba(238,243,250,0.44)", chalk4: "rgba(238,243,250,0.16)",
    blue: "#8fb3da", concrete: "#627387", concreteDry: "#a7b3c1", aggregate: "#3e4d60", brick: "#a0624e",
    point: "#ff8a3d", water: "#4fc3f7", green: "#7ce0a3", red: "#ff5a5a", heat: "#f2c08a",
  };
  B.LW = { hair: 1.5, std: 3, heavy: 5 };
  /* Easing tokens — the only eases a scene may use (DESIGN.md §5) */
  B.E = {
    enter: "power3.out",   // type + objects arriving
    land: "expo.out",      // large arrivals, rules, hero landings
    move: "power2.inOut",  // camera moves, colour/state changes
    draw: "power2.inOut",  // line draw-on
    exit: "power2.in",     // leaving (40-50% shorter than entering)
    drift: "sine.inOut",   // slow camera drift
    linear: "none",        // rotation / progress only
  };
  B.D = { tick: 0.25, type: 0.5, obj: 0.7, draw: 0.9, exit: 0.3 };
  B.STAGGER = { word: 0.06, item: 0.08, hatch: 0.012 };

  /* skill-demo · 16:9 (1920 x 1080). Scene slots in film seconds, on the 96 BPM beat grid (beat = 0.625 s). */
  B.W = 1920; B.H = 1080; B.BEAT = 0.625;
  B.SCENES = [
    { id: "s1", start: 0, dur: 3.75, kicker: "A Claude Code skill" },
    { id: "s2", start: 3.75, dur: 4.6875, kicker: "01 — Brief" },
    { id: "s3", start: 8.4375, dur: 4.6875, kicker: "02 — System" },
    { id: "s4", start: 13.125, dur: 9.375, kicker: "03 — Scenes" },
    { id: "s5", start: 22.5, dur: 4.375, kicker: "04 — Theming" },
    { id: "s6", start: 26.875, dur: 3.125, kicker: "" },
  ];
  B.TOTAL = 30;
  /* 12 columns x 122 px, 24 px gutters, 96 px margins: col(i) = 96 + i*146 (i = 0..11), colEnd(i) = col(i) + 122 */
  B.col = function (i) { return 96 + i * 146; };
  B.colEnd = function (i) { return 96 + i * 146 + 122; };
  B.STAGE = {
    m: 96, col: 1728, railY: 56, headTop: 148, figcapY: 962,
    slab: { x0: 972, x1: 1678, top: 610, th: 130, ground: 880 },
    phone: { x: 1104, y: 150, w: 450, h: 800, bezel: 12, r: 46 },
  };

  /* ---------------- timing ---------------- */
  /* seeded PRNG (mulberry32) — the only randomness allowed */
  B.rng = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  B.scene = function (id) { for (var i = 0; i < B.SCENES.length; i++) if (B.SCENES[i].id === id) return B.SCENES[i]; };

  /* ---------------- SVG primitives ---------------- */
  B.el = function (tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  B.g = function (parent, attrs) { return B.el("g", attrs, parent); };
  B.defs = function (svg) { return svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild); };
  B.path = function (parent, d, attrs) {
    var a = Object.assign({ d: d, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, attrs || {});
    return B.el("path", a, parent);
  };
  B.line = function (parent, x1, y1, x2, y2, attrs) { return B.path(parent, "M" + x1 + " " + y1 + "L" + x2 + " " + y2, attrs); };
  B.text = function (parent, x, y, str, cls, attrs) {
    var t = B.el("text", Object.assign({ x: x, y: y, class: cls || "t-label" }, attrs || {}), parent);
    // an explicit fill must beat the .t-* class fill (class CSS outranks the SVG presentation attribute)
    if (attrs && attrs.fill) t.style.fill = attrs.fill;
    t.textContent = str;
    return t;
  };
  var r1 = function (v) { return Math.round(v * 10) / 10; };

  /* Hatch pattern -> returns "url(#id)". angle in deg (45 = /), gap px, color, width.
     The real pattern id is prefixed with the owning <svg>'s id, so every scene gets its own copy
     (url(#id) resolves document-wide: a shared id could resolve into a hidden scene and paint nothing).
     Always use the returned url, never hand-write url(#…) for a hatch. */
  B.hatch = function (svg, o) {
    var defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild);
    var id = (svg.id ? svg.id + "-" : "") + o.id, gap = o.gap || 10;
    if (svg.querySelector("#" + id)) return "url(#" + id + ")";
    var p = B.el("pattern", { id: id, width: gap, height: gap, patternUnits: "userSpaceOnUse", patternTransform: "rotate(" + (o.angle == null ? 45 : o.angle) + ")" }, defs);
    if (o.bg) B.el("rect", { width: gap, height: gap, fill: o.bg }, p);
    B.el("line", { x1: 0, y1: 0, x2: 0, y2: gap, stroke: o.color || B.C.chalk3, "stroke-width": o.width || B.LW.hair }, p);
    return "url(#" + id + ")";
  };

  /* ---------------- illustration builders ---------------- */

  /* Ground line + earth hatch. Returns {g, line, hatch} */
  B.ground = function (parent, o) {
    var g = B.g(parent, { class: "bnb-ground" });
    var line = B.line(g, o.x0, o.y, o.x1, o.y, { stroke: B.C.chalk2, "stroke-width": B.LW.std, pathLength: 1 });
    var d = "", step = o.step || 18, len = o.len || 20;
    for (var x = o.x0 + 10; x <= o.x1; x += step) d += "M" + x + " " + (o.y + 4) + "l" + -len * 0.75 + " " + len;
    var hatch = B.path(g, d, { stroke: B.C.chalk3, "stroke-width": B.LW.hair, pathLength: 1 });
    return { g: g, line: line, hatch: hatch };
  };

  /* Brick support (section). Returns {g, outline, fill, courses} */
  B.brickPier = function (parent, o) {
    var g = B.g(parent, { class: "bnb-pier" });
    var x = o.x, y = o.y, w = o.w, h = o.h, ch = o.course || 24;
    var fill = B.el("rect", { x: x, y: y, width: w, height: h, fill: B.C.brick, "fill-opacity": 0.34 }, g);
    var d = "", row = 0;
    for (var yy = y + ch; yy < y + h - 1; yy += ch) d += "M" + x + " " + yy + "H" + (x + w);
    for (yy = y; yy < y + h - 1; yy += ch, row++) {
      var xs = row % 2 ? [x + w * 0.5] : [x + w * 0.25, x + w * 0.75];
      xs.forEach(function (xm) { d += "M" + r1(xm) + " " + yy + "V" + Math.min(y + h, yy + ch); });
    }
    var courses = B.path(g, d, { stroke: B.C.chalk3, "stroke-width": B.LW.hair, pathLength: 1 });
    var outline = B.path(g, "M" + x + " " + (y + h) + "V" + y + "H" + (x + w) + "V" + (y + h), { stroke: B.C.chalk, "stroke-width": B.LW.std + 0.5, pathLength: 1 });
    return { g: g, outline: outline, fill: fill, courses: courses };
  };

  /* Rebar in section. Returns the <circle> (animate scale with svgOrigin at its centre) */
  B.rebar = function (parent, cx, cy, r) {
    var g = B.g(parent, { class: "bnb-rebar" });
    B.el("circle", { cx: cx, cy: cy, r: r, fill: B.C.ground, stroke: B.C.chalk, "stroke-width": B.LW.std + 1 }, g);
    B.el("circle", { cx: cx - r * 0.28, cy: cy - r * 0.28, r: Math.max(1.5, r * 0.22), fill: B.C.chalk3 }, g);
    g.dataset.cx = cx; g.dataset.cy = cy;
    return g;
  };

  /* RCC slab in section on two brick piers over hatched ground.
     o: {x0,x1,top,th,ground, seed, rebar:{n,r}, pier:{w,inset}, fill, id}
     Returns refs: {g, body, agg, sand, moist[], rebar[], dist, shade, surface, outline, film, piers[], ground, bounds} */
  B.slab = function (svg, parent, o) {
    var S = Object.assign({}, B.STAGE.slab, o || {});
    var x0 = S.x0, x1 = S.x1, top = S.top, th = S.th, bot = top + th, gy = S.ground, id = S.id || "slab";
    var rnd = B.rng(S.seed || 7);
    var g = B.g(parent, { class: "bnb-slab", id: id });
    var defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild);
    var cp = B.el("clipPath", { id: id + "-clip" }, defs);
    B.el("rect", { x: x0, y: top, width: x1 - x0, height: th }, cp);

    var ground = B.ground(g, { x0: x0 - 60, x1: x1 + 60, y: gy });
    var pw = (S.pier && S.pier.w) || 110, inset = (S.pier && S.pier.inset) || 40;
    var piers = [
      B.brickPier(g, { x: x0 + inset, y: bot, w: pw, h: gy - bot }),
      B.brickPier(g, { x: x1 - inset - pw, y: bot, w: pw, h: gy - bot }),
    ];
    // soffit shade: hatch band under the slab between the piers (shading is hatch, never gradient)
    var shadeFill = B.hatch(svg, { id: "bnb-hatch-shade", angle: 45, gap: 8, color: "rgba(238,243,250,0.16)", width: 1.5 });
    var shade = B.el("rect", { x: x0 + inset + pw, y: bot, width: (x1 - x0) - 2 * (inset + pw), height: 22, fill: shadeFill }, g);
    // body
    var inner = B.g(g, { "clip-path": "url(#" + id + "-clip)" });
    var body = B.el("rect", { x: x0, y: top, width: x1 - x0, height: th, fill: S.fill || B.C.concrete }, inner);
    // aggregate: seeded irregular stones, larger toward the bottom (settling)
    var agg = B.g(inner, { fill: B.C.aggregate, class: "bnb-agg" });
    var n = Math.round(((x1 - x0) * th) / 1500);
    for (var i = 0; i < n; i++) {
      var cx = x0 + 6 + rnd() * (x1 - x0 - 12), cy = top + 6 + rnd() * (th - 12);
      var rr = 3 + rnd() * 9 * (0.6 + 0.6 * (cy - top) / th), sides = 5 + Math.floor(rnd() * 3), pd = "";
      for (var k = 0; k < sides; k++) {
        var an = (k / sides) * Math.PI * 2 + rnd() * 0.6, q = rr * (0.7 + rnd() * 0.45);
        pd += (k ? "L" : "M") + r1(cx + Math.cos(an) * q) + " " + r1(cy + Math.sin(an) * q * 0.82);
      }
      B.el("path", { d: pd + "Z", "fill-opacity": (0.55 + rnd() * 0.4).toFixed(2) }, agg);
    }
    // sand: fine light specks
    var sand = B.g(inner, { fill: B.C.chalk, "fill-opacity": 0.22, class: "bnb-sand" });
    for (i = 0; i < n * 1.6; i++) B.el("circle", { cx: r1(x0 + rnd() * (x1 - x0)), cy: r1(top + rnd() * th), r: r1(0.9 + rnd() * 1.3) }, sand);
    // moisture (hidden by default: opacity 0). Reveal with stagger.
    var moist = [], mg = B.g(inner, { class: "bnb-moist" });
    var mr = B.rng((S.seed || 7) + 101), mn = Math.round(((x1 - x0) * th) / 2400);
    for (i = 0; i < mn; i++) {
      var mx = x0 + 18 + mr() * (x1 - x0 - 36), my = top + th * 0.28 + mr() * th * 0.62;
      moist.push(B.el("circle", { cx: r1(mx), cy: r1(my), r: r1(3 + mr() * 3.5), fill: B.C.water, opacity: 0 }, mg));
    }
    moist.sort(function (a, b) { return Math.abs(+a.getAttribute("cx") - (x0 + x1) / 2) - Math.abs(+b.getAttribute("cx") - (x0 + x1) / 2); });
    // rebar: bottom layer at cover
    var nb = (S.rebar && S.rebar.n) || Math.max(5, Math.round((x1 - x0) / 110)), rb = (S.rebar && S.rebar.r) || 11;
    var cover = Math.max(rb + 12, th * 0.24), rebar = [];
    // distribution steel: a hairline bar running along the span just above the main bars
    var dist = B.line(inner, x0 + 26, r1(bot - cover - rb - 4), x1 - 26, r1(bot - cover - rb - 4), { stroke: B.C.chalk, "stroke-width": 2.5, "stroke-opacity": 0.75, pathLength: 1 });
    for (i = 0; i < nb; i++) rebar.push(B.rebar(inner, r1(x0 + 52 + ((x1 - x0 - 104) * i) / (nb - 1)), bot - cover, rb));
    // water film (ponding) sits ON TOP of the slab: height 0 by default; tween attr y/height
    var film = B.el("rect", { x: x0, y: top, width: x1 - x0, height: 0, fill: B.C.water, "fill-opacity": 0.55 }, g);
    // surface line (separately highlightable) + heavy outline
    var surface = B.line(g, x0, top, x1, top, { stroke: B.C.chalk, "stroke-width": B.LW.heavy, pathLength: 1 });
    var outline = B.path(g, "M" + x0 + " " + top + "H" + x1 + "V" + bot + "H" + x0 + "Z", { stroke: B.C.chalk, "stroke-width": B.LW.heavy, pathLength: 1 });
    return { g: g, body: body, agg: agg, sand: sand, moist: moist, rebar: rebar, dist: dist, shade: shade, surface: surface, outline: outline, film: film, piers: piers, ground: ground,
      bounds: { x0: x0, x1: x1, top: top, bot: bot, ground: gy, cx: (x0 + x1) / 2 } };
  };

  /* Dimension line (horizontal if y1==y2, else vertical) with extension lines, 45° ticks, mono label.
     o: {x1,y1,x2,y2,label, ext (px, extension length toward object, signed), color}. Returns {g, line, ticks, ext, label} */
  B.dim = function (parent, o) {
    var g = B.g(parent, { class: "bnb-dim" }), col = o.color || B.C.blue, horiz = o.y1 === o.y2, e = o.ext || 0, ov = e >= 0 ? -14 : 14;
    // extension lines run from 14px past the dim line (ov) toward the object by `ext` px
    var ext = B.path(g, horiz
      ? "M" + o.x1 + " " + (o.y1 + ov) + "V" + (o.y1 + e) + "M" + o.x2 + " " + (o.y2 + ov) + "V" + (o.y2 + e)
      : "M" + (o.x1 + ov) + " " + o.y1 + "H" + (o.x1 + e) + "M" + (o.x2 + ov) + " " + o.y2 + "H" + (o.x2 + e),
      { stroke: col, "stroke-width": B.LW.hair, "stroke-opacity": 0.7, pathLength: 1 });
    var line = B.line(g, o.x1, o.y1, o.x2, o.y2, { stroke: col, "stroke-width": 2, pathLength: 1 });
    var t = 9, ticks = B.path(g, "M" + (o.x1 - t) + " " + (o.y1 + t) + "L" + (o.x1 + t) + " " + (o.y1 - t) + "M" + (o.x2 - t) + " " + (o.y2 + t) + "L" + (o.x2 + t) + " " + (o.y2 - t),
      { stroke: col, "stroke-width": B.LW.std });
    var label = null;
    if (o.label) {
      var mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2, w = o.label.length * 18.5 + 26;
      label = B.g(g, {});
      B.el("rect", { x: horiz ? mx - w / 2 : mx - 16, y: horiz ? my - 16 : my - w / 2, width: horiz ? w : 32, height: horiz ? 32 : w, fill: B.C.ground }, label);
      B.text(label, mx, my + 8.5, o.label, "t-data", { "text-anchor": "middle", fill: col, transform: horiz ? null : "rotate(-90 " + mx + " " + my + ")" });
    }
    return { g: g, line: line, ticks: ticks, ext: ext, label: label };
  };

  /* Leader callout: dot terminal on the subject, leader to a shoulder rule, stacked mono head + sans body.
     o: {ax,ay (anchor on subject), lx,ly (label baseline-left of head), w (shoulder width), side:"left"|"right",
         head, body, color (dot/head colour), bodyColor}
     Text sits ABOVE the shoulder rule; leader runs from rule end to anchor.
     Returns {g, dot, halo, leader, rule, head, body} */
  B.callout = function (parent, o) {
    var g = B.g(parent, { class: "bnb-callout" }), col = o.color || B.C.chalk;
    var w = o.w || 300, right = o.side === "right";
    var rx0 = o.lx, rx1 = o.lx + w, ry = o.ly + (o.body ? 56 : 18);
    var joinX = right ? rx0 : rx1; // leader leaves the rule end nearest the subject
    var rule = B.line(g, right ? rx1 : rx0, ry, right ? rx0 : rx1, ry, { stroke: col, "stroke-width": B.LW.hair + 0.5, pathLength: 1, "stroke-opacity": 0.8 });
    var leader = B.path(g, "M" + joinX + " " + ry + "L" + o.ax + " " + o.ay, { stroke: col, "stroke-width": 2, pathLength: 1 });
    var halo = B.el("circle", { cx: o.ax, cy: o.ay, r: 11, fill: B.C.ground, "fill-opacity": 0.85 }, g);
    var dot = B.el("circle", { cx: o.ax, cy: o.ay, r: 6.5, fill: col }, g);
    var tx = right ? rx1 : rx0, anchor = right ? "end" : "start";
    var head = B.text(g, tx, o.ly, o.head || "", "t-head", { "text-anchor": anchor, fill: col });
    var body = o.body ? B.text(g, tx, o.ly + 42, o.body, "t-body", { "text-anchor": anchor, fill: o.bodyColor || B.C.chalk }) : null;
    return { g: g, dot: dot, halo: halo, leader: leader, rule: rule, head: head, body: body };
  };

  /* Sun: hatched disc + ray ring. Returns {g, disc, rays, ring} */
  B.sun = function (svg, parent, o) {
    var g = B.g(parent, { class: "bnb-sun" }), r = o.r || 44;
    var fill = B.hatch(svg, { id: "bnb-hatch-heat", angle: 45, gap: 7, color: B.C.heat, width: 1.5 });
    var disc = B.el("circle", { cx: o.cx, cy: o.cy, r: r, fill: fill, stroke: B.C.heat, "stroke-width": B.LW.std }, g);
    var ring = B.el("circle", { cx: o.cx, cy: o.cy, r: r * 1.22, fill: "none", stroke: B.C.heat, "stroke-width": B.LW.hair, "stroke-opacity": 0.5 }, g);
    var d = "", n = o.rays || 12;
    for (var i = 0; i < n; i++) {
      var an = (i / n) * Math.PI * 2, a = r * 1.45, b = r * (i % 2 ? 1.8 : 2.05);
      d += "M" + r1(o.cx + Math.cos(an) * a) + " " + r1(o.cy + Math.sin(an) * a) + "L" + r1(o.cx + Math.cos(an) * b) + " " + r1(o.cy + Math.sin(an) * b);
    }
    var rays = B.path(g, d, { stroke: B.C.heat, "stroke-width": B.LW.std, pathLength: 1 });
    return { g: g, disc: disc, rays: rays, ring: ring };
  };

  /* Evaporation wisps: S-curves rising from y. Returns [paths] (draw-on + drift up) */
  B.wisps = function (parent, o) {
    var g = B.g(parent, { class: "bnb-wisps" }), rnd = B.rng(o.seed || 3), out = [];
    for (var i = 0; i < (o.n || 5); i++) {
      var x = o.x0 + ((o.x1 - o.x0) * (i + 0.5)) / (o.n || 5) + (rnd() - 0.5) * 30, y = o.y, h = (o.h || 120) * (0.75 + rnd() * 0.4), a = 14 + rnd() * 8;
      var d = "M" + r1(x) + " " + y + " c" + a + " " + -h * 0.18 + " " + -a + " " + -h * 0.33 + " 0 " + -h * 0.5 + " s" + a + " " + -h * 0.33 + " 0 " + -h * 0.5;
      out.push(B.path(g, d, { stroke: o.color || B.C.water, "stroke-width": B.LW.std - 0.5, "stroke-opacity": 0.8, pathLength: 1 }));
    }
    return out;
  };

  /* Water drop (tip up). Returns <g> */
  B.drop = function (parent, o) {
    var g = B.g(parent, { class: "bnb-drop" }), r = o.r || 12, x = o.cx, y = o.cy;
    g.dataset.cx = x; g.dataset.cy = y - r * 0.4;
    B.path(g, "M" + x + " " + (y - r * 1.9) + "C" + (x + r * 0.5) + " " + (y - r * 1.1) + " " + (x + r) + " " + (y - r * 0.6) + " " + (x + r) + " " + y +
      "A" + r + " " + r + " 0 1 1 " + (x - r) + " " + y + "C" + (x - r) + " " + (y - r * 0.6) + " " + (x - r * 0.5) + " " + (y - r * 1.1) + " " + x + " " + (y - r * 1.9) + "Z",
      { fill: o.color || B.C.water, stroke: "none" });
    return g;
  };

  /* Check mark in a ring. Returns {g, ring, tick} — draw ring + tick with BNB.a.draw */
  B.check = function (parent, o) {
    var g = B.g(parent, { class: "bnb-check" }), r = o.r || 30, x = o.cx, y = o.cy, col = o.color || B.C.green;
    var ring = B.el("circle", { cx: x, cy: y, r: r, fill: "none", stroke: col, "stroke-width": B.LW.std, pathLength: 1, transform: "rotate(-90 " + x + " " + y + ")" }, g);
    var tick = B.path(g, "M" + (x - r * 0.42) + " " + (y + r * 0.02) + "L" + (x - r * 0.1) + " " + (y + r * 0.34) + "L" + (x + r * 0.46) + " " + (y - r * 0.32),
      { stroke: col, "stroke-width": B.LW.heavy, pathLength: 1 });
    return { g: g, ring: ring, tick: tick };
  };

  /* Vertical strength bar (no scale, no numbers). o: {x, top, h, w, target (0-1, optional "designed" line), label}
     Returns {g, outline, fill (rect, grow with scaleY + transformOrigin "50% 100%"), hatch, label, target} */
  B.strengthBar = function (svg, parent, o) {
    var g = B.g(parent, { class: "bnb-bar" }), x = o.x, top = o.top, h = o.h, w = o.w || 56, bot = top + h;
    var hp = B.hatch(svg, { id: "bnb-hatch-strength", angle: -45, gap: 12, color: "rgba(11,33,57,0.35)", width: 3, bg: B.C.green });
    var fill = B.el("rect", { x: x + 6, y: top + 6, width: w - 12, height: h - 12, fill: hp }, g);
    var outline = B.path(g, "M" + x + " " + bot + "V" + top + "H" + (x + w) + "V" + bot + "Z", { stroke: B.C.chalk, "stroke-width": B.LW.std, pathLength: 1 });
    var target = null;
    if (o.target != null) {
      var ty = r1(bot - 6 - (h - 12) * o.target);
      target = B.g(g, {});
      B.line(target, x - 150, ty, x + w + 10, ty, { stroke: B.C.chalk2, "stroke-width": 2, "stroke-dasharray": "8 8" });
      B.text(target, x - 150, ty - 12, o.targetLabel || "Designed strength", "t-data", { fill: B.C.chalk2 });
    }
    var label = B.text(g, x + w / 2, bot + 40, o.label || "Strength", "t-data", { "text-anchor": "middle" });
    return { g: g, fill: fill, outline: outline, label: label, target: target, bounds: { x: x, top: top, bot: bot, w: w } };
  };

  /* ---------------- HTML helpers ---------------- */
  /* Wrap each word of el in <span class="w"> (keeps <em> etc). Returns array of word spans. */
  B.words = function (el) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
            else { var s = document.createElement("span"); s.className = "w"; s.textContent = p; frag.appendChild(s); out.push(s); }
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !c.classList.contains("w")) walk(c);
      });
    })(el);
    return out;
  };

  /* ---------------- motion recipes (all take the scene timeline + scene-local time) ---------------- */
  var a = (B.a = {});
  /* Draw a stroke on (paths built with pathLength=1). */
  a.draw = function (tl, targets, at, dur, ease) {
    tl.fromTo(targets, { strokeDasharray: "1 1", strokeDashoffset: 1, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: dur || B.D.draw, ease: ease || B.E.draw }, at);
    return tl;
  };
  /* Undraw (erase toward the end). */
  a.undraw = function (tl, targets, at, dur) {
    tl.to(targets, { strokeDashoffset: -1, duration: dur || B.D.exit, ease: B.E.exit }, at);
    return tl;
  };
  /* Kicker: wipe on left->right */
  a.kicker = function (tl, el, at) {
    tl.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: B.E.land }, at);
    return tl;
  };
  /* Words: blur + fade in, no translate */
  a.words = function (tl, spans, at, o) {
    o = o || {};
    tl.fromTo(spans, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: o.dur || B.D.type, ease: B.E.enter, stagger: o.stagger || B.STAGGER.word }, at);
    return tl;
  };
  /* Callout from BNB.callout: dot -> leader -> rule -> text */
  a.callout = function (tl, c, at) {
    var cx = +c.dot.getAttribute("cx"), cy = +c.dot.getAttribute("cy");
    tl.fromTo([c.halo, c.dot], { scale: 0, svgOrigin: cx + " " + cy }, { scale: 1, svgOrigin: cx + " " + cy, duration: B.D.tick, ease: B.E.enter }, at);
    a.draw(tl, c.leader, at + 0.1, 0.45);
    a.draw(tl, c.rule, at + 0.4, 0.45, B.E.enter);
    tl.fromTo([c.head, c.body].filter(Boolean), { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.45, ease: B.E.enter, stagger: 0.08 }, at + 0.4);
    return tl;
  };
  /* Figure caption block (.bnb-figcap with .rule and .txt) */
  a.figcap = function (tl, el, at) {
    tl.fromTo(el.querySelector(".rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: B.E.land }, at);
    tl.fromTo(el.querySelector(".txt"), { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: B.E.enter }, at + 0.2);
    return tl;
  };
  /* Slow camera drift over the whole scene (never a creeping zoom) */
  a.drift = function (tl, cam, dur, o) {
    o = o || {};
    tl.fromTo(cam, { y: o.y0 || 0, x: o.x0 || 0 }, { y: o.y1 == null ? -14 : o.y1, x: o.x1 || 0, duration: dur, ease: B.E.drift }, 0);
    return tl;
  };
  /* Standard scene exit: blur swap on one stage */
  a.exit = function (tl, cam, at, dur) {
    tl.to(cam, { opacity: 0, filter: "blur(8px)", duration: dur || 0.22, ease: B.E.exit }, at);
    return tl;
  };
  /* Pop a set of SVG items in place (rebar, drops, moisture circles): scale from their own centre, no overshoot.
     Items need data-cx/data-cy (BNB.rebar/drop set them) or cx/cy attributes. Never uses getBBox (hosts may be hidden at init). */
  a.popIn = function (tl, els, at, o) {
    o = o || {};
    els.forEach(function (e, i) {
      var c = (e.dataset.cx || e.getAttribute("cx")) + " " + (e.dataset.cy || e.getAttribute("cy"));
      tl.fromTo(e, { scale: 0, opacity: 0, svgOrigin: c }, { scale: 1, opacity: 1, svgOrigin: c, duration: o.dur || 0.4, ease: B.E.enter }, at + i * (o.stagger || B.STAGGER.item));
    });
    return tl;
  };
})();
