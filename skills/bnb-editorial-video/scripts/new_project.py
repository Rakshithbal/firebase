#!/usr/bin/env python3
"""Scaffold a new BNB editorial HyperFrames project from the skill's template.

usage:  python3 new_project.py <target_dir> --slug r21-plinth --format 9:16|16:9 \
            --series Buildpedia --title "What a plinth is" [--signoff "BuyNBuild · Buildpedia"] [--force]

Copies template/ (assets, fonts, vendored GSAP, bg/chrome compositions, scene + end-card templates, tools/gen.py,
examples/), the design system (references/DESIGN.md -> DESIGN.md, scene-recipes.md) and build.sh into <target_dir>,
then writes project.json with the slug/format/series/title. Next: edit lines.json + project.json "scenes", then
scripts/make_vo.py <target_dir>, then `python3 tools/gen.py` in the project.
"""
import argparse, json, os, shutil, sys

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("target"); ap.add_argument("--slug", required=True)
ap.add_argument("--format", default="9:16", choices=["9:16", "16:9"])
ap.add_argument("--series", default="Buildpedia"); ap.add_argument("--title", required=True)
ap.add_argument("--signoff"); ap.add_argument("--brand", default="BuyNBuild")
ap.add_argument("--no-examples", action="store_true", help="leave out examples/ (R05 reference scenes)")
ap.add_argument("--force", action="store_true", help="write into an existing non-empty directory")
a = ap.parse_args()

dst = os.path.abspath(a.target)
if os.path.exists(dst) and os.listdir(dst) and not a.force:
    sys.exit("new_project: %s exists and is not empty (use --force to copy over it; scene files you wrote are kept)" % dst)
ign = shutil.ignore_patterns("node_modules", "renders", "out", "snapshots", "frames", ".hyperframes", "__pycache__", *(["examples"] if a.no_examples else []))
keep = {}
if os.path.exists(dst):   # never clobber an existing project's scenes/config
    cdir = os.path.join(dst, "compositions")
    scene_files = ["compositions/" + f for f in os.listdir(cdir) if f.startswith("s")] if os.path.isdir(cdir) else []
    for rel in ["project.json", "lines.json", "timing.json", "cues.json"] + scene_files:
        p = os.path.join(dst, rel)
        if os.path.exists(p): keep[rel] = open(p, "rb").read()
shutil.copytree(os.path.join(SKILL, "template"), dst, ignore=ign, dirs_exist_ok=True)
shutil.copy(os.path.join(SKILL, "references", "DESIGN.md"), os.path.join(dst, "DESIGN.md"))
shutil.copy(os.path.join(SKILL, "references", "scene-recipes.md"), os.path.join(dst, "scene-recipes.md"))
shutil.copy(os.path.join(SKILL, "scripts", "build.sh"), os.path.join(dst, "build.sh"))
os.chmod(os.path.join(dst, "build.sh"), 0o755)
for rel, data in keep.items(): open(os.path.join(dst, rel), "wb").write(data)

pj = os.path.join(dst, "project.json")
P = json.load(open(pj))
if "project.json" not in keep:
    P.update(slug=a.slug, format=a.format, series=a.series, title=a.title)
    P["brand"] = {"name": a.brand, "signoff": a.signoff or "%s · %s" % (a.brand, a.series)}
    for s in P["scenes"]:
        if s.get("type") == "endcard": s["tag"] = a.title + "."
    json.dump(P, open(pj, "w"), indent=2, ensure_ascii=False)
pk = os.path.join(dst, "package.json"); K = json.load(open(pk)); K["name"] = a.slug; json.dump(K, open(pk, "w"), indent=2)
print("new project:", dst)
print("  format %s · series %s · title %s" % (P["format"], P["series"], P["title"]))
print("next:\n  1. write lines.json (locked script) and project.json \"scenes\" (id, kicker, lines, headline, figcap, type)\n"
      "  2. python3 %s/scripts/make_vo.py %s\n  3. cd %s && python3 tools/gen.py   (creates missing compositions/sN.html)\n"
      "  4. build scenes, npm run check, snapshot, then bash build.sh" % (SKILL, dst, dst))
