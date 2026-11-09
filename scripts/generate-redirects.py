#!/usr/bin/env python3
"""Generate Cloudflare Pages public/_redirects + src/data/audit-cuts.json.

Sources:
  - ../../data/thi-redirects.csv  (182 live WP redirects — Redirection REST is 401)
  - data/thi-content-audit-redirects.csv  (85 CUT_301 + locked CPT/legacy)
  - Locked CPT kills: /hoeveel/*, /recepten/*, /recept/*
  - Catch-alls: /category/*, /tag/*, /author/*, /feed/*

Run from thi-astro/:  python3 scripts/generate-redirects.py
"""

from __future__ import annotations

import csv
import json
from collections import OrderedDict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]  # thi/
ASTRO = Path(__file__).resolve().parents[1]  # thi-astro/
CSV_PATH = ROOT / "data" / "thi-redirects.csv"
AUDIT_CSV = ASTRO / "data" / "thi-content-audit-redirects.csv"
OUT_PATH = ASTRO / "public" / "_redirects"
CUTS_JSON = ASTRO / "src" / "data" / "audit-cuts.json"

HOEVEEL = {
    "/hoeveel/magnesium-per-dag/": "/supplementen/hoeveel-magnesium-per-dag/",
    "/hoeveel/creatine-per-dag/": "/voeding/calculators/",
    "/hoeveel/calorieen-per-dag/": "/voeding/calculators/",
    # Destinations that are themselves CUT get remapped via AUDIT_CUTS below.
    "/hoeveel/water-per-dag/": "/gezondheid/te-veel-water-drinken-risicos-en-uitleg/",
    "/hoeveel/stappen-per-dag/": "/training/wandelen-afvallen/",
    "/hoeveel/": "/voeding/calculators/",
}

RECEPTEN = {
    "/recepten/granola-recept/": "/voeding/",
    "/recepten/mueslirepen-zaden-noten/": "/voeding/beste-mueslirepen-recepten/",
    "/recepten/bananenpannenkoeken-recept/": "/voeding/",
    "/recepten/kwarkbrood-recept/": "/voeding/",
    "/recepten/mueslirepen-maken-recept/": "/voeding/beste-mueslirepen-recepten/",
    "/recepten/quinoa-ontbijtbowl/": "/voeding/",
    "/recepten/falafel-recept-oven/": "/voeding/",
    "/recepten/": "/voeding/",
    "/recepten-overzicht/": "/voeding/",
}

LEGACY_PAGES = {
    "/food/": "/voeding/",
    "/leisure/": "/",
    "/lifehacks/": "/gezondheid/",
    "/work-out/": "/training/",
    "/voedingsschema/": "/voeding/",
    "/cbd-olie/": "/supplementen/",
}

ALIASES = [
    ("/privacy-statement/", "/privacybeleid/"),
    ("/privacy/", "/privacybeleid/"),
    ("/disclaimer-en-copyright/", "/disclaimer/"),
    ("/review/", "/reviews/"),
]


def to_path(url: str) -> str:
    u = (url or "").strip()
    if u.startswith("http"):
        p = urlparse(u).path or "/"
    else:
        p = u if u.startswith("/") else "/" + u
    if not p.endswith("/") and "." not in p.rsplit("/", 1)[-1]:
        p += "/"
    while "//" in p:
        p = p.replace("//", "/")
    return p


def load_audit() -> tuple[dict[str, str], list[dict[str, str]]]:
    cuts: dict[str, str] = {}
    locked_rows: list[dict[str, str]] = []
    if not AUDIT_CSV.exists():
        raise SystemExit(f"Missing audit CSV: {AUDIT_CSV}")
    for r in csv.DictReader(AUDIT_CSV.open(encoding="utf-8")):
        decision = (r.get("decision") or "").strip()
        src = to_path(r.get("source") or "")
        dst = to_path(r.get("target") or "/")
        if decision == "CUT_301":
            cuts[src] = dst
        elif decision == "CUT_301_LOCKED":
            locked_rows.append({"source": src, "target": dst, "raw": r.get("source") or ""})
    return cuts, locked_rows


AUDIT_CUTS, AUDIT_LOCKED = load_audit()


def apply_audit_cut(path: str) -> str:
    """Follow CUT map until stable (no soft-404 leftovers)."""
    path = to_path(path)
    seen: set[str] = set()
    while path in AUDIT_CUTS and path not in seen:
        seen.add(path)
        path = to_path(AUDIT_CUTS[path])
    return path


def remap_dest(path: str) -> str:
    path = to_path(path)
    if path.startswith("/category/"):
        slug = path[len("/category/") :].strip("/")
        if slug == "recepten":
            return apply_audit_cut("/voeding/")
        return apply_audit_cut(f"/{slug}/" if slug else "/")
    if path in HOEVEEL:
        return apply_audit_cut(HOEVEEL[path])
    if path in RECEPTEN:
        return apply_audit_cut(RECEPTEN[path])
    if path.startswith("/recepten/"):
        return apply_audit_cut("/voeding/")
    if path.startswith("/hoeveel/"):
        return apply_audit_cut("/voeding/calculators/")
    if path == "/recepten-overzicht/":
        return apply_audit_cut("/voeding/")
    return apply_audit_cut(path)


def variants(path: str) -> list[str]:
    path = to_path(path)
    if path == "/":
        return ["/"]
    no = path.rstrip("/")
    return [no + "/", no]


def main() -> None:
    rules: OrderedDict[str, tuple[str, int, str]] = OrderedDict()
    stats = {
        "csv_rows": 0,
        "csv_emitted_sources": 0,
        "csv_dest_remapped": 0,
        "audit_cuts": len(AUDIT_CUTS),
        "skipped_self": 0,
        "skipped_dup": 0,
    }

    def add(src: str, dest: str, code: int = 301, note: str = "") -> None:
        dest_p = remap_dest(dest)
        for key in variants(src):
            if "*" in key:
                continue
            if to_path(key) == to_path(dest_p):
                stats["skipped_self"] += 1
                continue
            if key in rules:
                stats["skipped_dup"] += 1
                continue
            rules[key] = (to_path(dest_p), code, note)

    def add_dynamic(src: str, dest: str, code: int = 301, note: str = "") -> None:
        if src in rules:
            stats["skipped_dup"] += 1
            return
        rules[src] = (dest, code, note)

    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    stats["csv_rows"] = len(rows)
    for r in rows:
        before = to_path(r["Doel URL"])
        after = remap_dest(r["Doel URL"])
        if before != after:
            stats["csv_dest_remapped"] += 1
        n0 = len(rules)
        add(r["Bron URL"], r["Doel URL"], int(r.get("Type redirect") or 301), "csv")
        if len(rules) > n0:
            stats["csv_emitted_sources"] += 1

    # Audit CUT_301 posts — hard 301, never soft-404
    for src, dst in sorted(AUDIT_CUTS.items()):
        add(src, dst, 301, "audit-cut")

    for src, dst in HOEVEEL.items():
        add(src, dst, 301, "locked-hoeveel")
    add_dynamic("/hoeveel/*", "/voeding/calculators/", 301, "locked-hoeveel")

    for src, dst in RECEPTEN.items():
        add(src, dst, 301, "locked-recepten")
    add_dynamic("/recepten/*", "/voeding/", 301, "locked-recepten")
    add_dynamic("/recept/*", "/voeding/", 301, "locked-recepten")

    for s, d in ALIASES:
        add(s, d, 301, "alias")

    for s, d in LEGACY_PAGES.items():
        add(s, d, 301, "legacy-page")

    # Legacy / CPT splats from audit locked rows + archive catch-alls
    add_dynamic("/work-out/*", "/training/", 301, "legacy-splat")
    add_dynamic("/food/*", "/voeding/", 301, "legacy-splat")
    add_dynamic("/cbd-olie/*", "/supplementen/", 301, "legacy-splat")
    add_dynamic("/category/*", "/:splat", 301, "catch")
    add_dynamic("/tag/*", "/", 301, "catch")
    add_dynamic("/author/*", "/over-ons/", 301, "catch")
    add_dynamic("/feed/", "/", 301, "catch")
    add_dynamic("/feed/*", "/", 301, "catch")

    static = [(s, v) for s, v in rules.items() if "*" not in s and ":splat" not in s]
    dynamic = [(s, v) for s, v in rules.items() if "*" in s or s in ("/feed/",)]

    lines = [
        "# THI Cloudflare Pages redirects",
        "# Sources: thi/data/thi-redirects.csv + thi-astro/data/thi-content-audit-redirects.csv",
        "# Plus locked CPT kills (/hoeveel/, /recepten/) and archive catch-alls",
        "# Generator: python3 scripts/generate-redirects.py",
        "# Preview-only cleanup — no DNS flip. CUT posts 301; no soft-404s.",
        "",
    ]

    seen: set[str] = set()

    def emit(title: str, pred) -> int:
        lines.append(title)
        n = 0
        for src, (dest, code, note) in list(static) + list(dynamic):
            if not pred(src, note):
                continue
            if src in seen:
                continue
            seen.add(src)
            lines.append(f"{src}  {dest}  {code}")
            n += 1
        lines.append("")
        return n

    c_csv = emit(
        "# --- WP CSV (paths; /category/→hub; recepten/hoeveel + audit CUT dest remapped) ---",
        lambda s, n: n == "csv",
    )
    c_cut = emit(
        "# --- Content audit CUT_301 (85 posts) ---",
        lambda s, n: n == "audit-cut",
    )
    c_h = emit(
        "# --- Locked /hoeveel/ (nutrient CPT → article or /voeding/calculators/) ---",
        lambda s, n: "hoeveel" in n or s.startswith("/hoeveel"),
    )
    c_r = emit(
        "# --- Locked /recepten/ + /recept/ ---",
        lambda s, n: "recept" in n or s.startswith("/recept"),
    )
    c_a = emit("# --- Aliases ---", lambda s, n: n == "alias")
    c_l = emit("# --- Legacy WP page hubs (not ported) ---", lambda s, n: n == "legacy-page")
    c_s = emit("# --- Legacy splats ---", lambda s, n: n == "legacy-splat")
    c_c = emit(
        "# --- Catch-alls ---",
        lambda s, n: n == "catch" or s.startswith(("/tag", "/author", "/category", "/feed")),
    )
    emit("# --- Other ---", lambda s, n: True)

    OUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    rule_lines = sum(1 for L in lines if L and not L.startswith("#") and "  " in L)

    # Build-time filter list for Astro (exclude CUT from SSG / listings)
    cut_paths = sorted(AUDIT_CUTS.keys())
    CUTS_JSON.parent.mkdir(parents=True, exist_ok=True)
    CUTS_JSON.write_text(
        json.dumps(
            {
                "generatedBy": "scripts/generate-redirects.py",
                "source": "data/thi-content-audit-redirects.csv",
                "cutCount": len(cut_paths),
                "cutPaths": cut_paths,
                "redirects": {src: apply_audit_cut(dst) for src, dst in sorted(AUDIT_CUTS.items())},
                "restore": (
                    "To restore a CUT post on preview: remove its row from "
                    "data/thi-content-audit-redirects.csv (or change decision), "
                    "re-run python3 scripts/generate-redirects.py, rebuild + redeploy. "
                    "Sanity documents and media are NOT deleted."
                ),
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {OUT_PATH}")
    print(f"Wrote {CUTS_JSON}")
    print(
        {
            **stats,
            "section_csv": c_csv,
            "section_audit_cut": c_cut,
            "section_hoeveel": c_h,
            "section_recepten": c_r,
            "section_alias": c_a,
            "section_legacy": c_l,
            "section_legacy_splat": c_s,
            "section_catch": c_c,
            "total_redirect_lines": rule_lines,
        }
    )


if __name__ == "__main__":
    main()
