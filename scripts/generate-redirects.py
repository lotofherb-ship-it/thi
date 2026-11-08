#!/usr/bin/env python3
"""Generate Cloudflare Pages public/_redirects from WP inventory.

Sources:
  - ../../data/thi-redirects.csv  (182 live WP redirects — Redirection REST is 401)
  - Locked CPT kills: /hoeveel/*, /recepten/*, /recept/*
  - Catch-alls: /category/*, /tag/*, /author/*, /feed/*

Run from thi-astro/:  python3 scripts/generate-redirects.py
"""

from __future__ import annotations

import csv
from collections import OrderedDict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]  # thi/
ASTRO = Path(__file__).resolve().parents[1]  # thi-astro/
CSV_PATH = ROOT / "data" / "thi-redirects.csv"
OUT_PATH = ASTRO / "public" / "_redirects"

HOEVEEL = {
    "/hoeveel/magnesium-per-dag/": "/supplementen/hoeveel-magnesium-per-dag/",
    "/hoeveel/creatine-per-dag/": "/voeding/calculators/",
    "/hoeveel/calorieen-per-dag/": "/voeding/calculators/",
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


def remap_dest(path: str) -> str:
    path = to_path(path)
    if path.startswith("/category/"):
        slug = path[len("/category/") :].strip("/")
        if slug == "recepten":
            return "/voeding/"
        return f"/{slug}/" if slug else "/"
    if path in HOEVEEL:
        return HOEVEEL[path]
    if path in RECEPTEN:
        return RECEPTEN[path]
    if path.startswith("/recepten/"):
        return "/voeding/"
    if path.startswith("/hoeveel/"):
        return "/voeding/calculators/"
    if path == "/recepten-overzicht/":
        return "/voeding/"
    return path


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
        "skipped_self": 0,
        "skipped_dup": 0,
    }

    def add(src: str, dest: str, code: int = 301, note: str = "") -> None:
        dest_p = remap_dest(remap_dest(dest))
        for s in variants(src):
            if "*" in s or s.endswith("/*"):
                keys = [s]
            else:
                keys = [s]
            for key in keys:
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

    # Cloudflare Pages splats (not Netlify :slug placeholders)
    add_dynamic("/category/*", "/:splat", 301, "catch")
    add_dynamic("/tag/*", "/", 301, "catch")
    add_dynamic("/author/*", "/over-ons/", 301, "catch")
    add_dynamic("/feed/", "/", 301, "catch")
    add_dynamic("/feed/*", "/", 301, "catch")

    static = [(s, v) for s, v in rules.items() if "*" not in s and ":splat" not in s]
    dynamic = [(s, v) for s, v in rules.items() if "*" in s or s in ("/feed/",)]

    lines = [
        "# THI Cloudflare Pages redirects",
        "# Source: thi/data/thi-redirects.csv (WP redirect inventory from live environment)",
        "# Plus locked CPT kills (/hoeveel/, /recepten/) and archive catch-alls",
        "# Generator: python3 scripts/generate-redirects.py",
        "# Note: WP Redirection REST (/wp-json/redirection/v1/redirect) returns 401 — CSV is the checked-in export.",
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
        "# --- WP CSV (paths; /category/→hub; recepten/hoeveel destinations remapped) ---",
        lambda s, n: n == "csv",
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
    c_c = emit(
        "# --- Catch-alls ---",
        lambda s, n: n == "catch" or s.startswith(("/tag", "/author", "/category", "/feed")),
    )
    emit("# --- Other ---", lambda s, n: True)

    OUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    rule_lines = sum(1 for L in lines if L and not L.startswith("#") and "  " in L)

    print(f"Wrote {OUT_PATH}")
    print(
        {
            **stats,
            "section_csv": c_csv,
            "section_hoeveel": c_h,
            "section_recepten": c_r,
            "section_alias": c_a,
            "section_legacy": c_l,
            "section_catch": c_c,
            "total_redirect_lines": rule_lines,
        }
    )


if __name__ == "__main__":
    main()
