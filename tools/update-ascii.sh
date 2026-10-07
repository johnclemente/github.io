#!/usr/bin/env bash
# Re-vendors ascii.rest (github.com/bas3line/ascii, MIT) into assets/vendor/ascii:
# the <ascii-art> element, mount, the loader, and only the pieces the pages use.
#
#   ./tools/update-ascii.sh
#
# To add a piece, put its <ascii-art piece="..."> in the HTML and run this again.
# Needs git, node and npm. The library has no runtime dependencies, so all the
# build needs is TypeScript: the clone's own if npm ci works, else whatever
# `npx tsc` finds. Its React component fails to compile without react installed;
# the rest of the library still compiles, which is all we need.
set -euo pipefail
cd "$(dirname "$0")/.."

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

git clone --quiet --depth 1 https://github.com/bas3line/ascii.git "$tmp/ascii"
(
  cd "$tmp/ascii"
  npm ci --ignore-scripts --no-audit --no-fund --silent 2>/dev/null || echo "npm ci failed; using the tsc npx finds"
  npx tsc -p tsconfig.build.json >/dev/null || true
)
[[ -f "$tmp/ascii/dist/ascii.js" ]] || { echo "build failed: no dist/ascii.js" >&2; exit 1; }

out=assets/vendor/ascii
rm -rf "$out"
mkdir -p "$out/pieces"
cp "$tmp/ascii/dist/"{ascii,mount,library}.js "$out/"
cp "$tmp/ascii/LICENSE" "$out/LICENSE"
# The 3 KB cut of JetBrains Mono (OFL) the art falls back to where the system
# monospace face lacks box drawing and block glyphs, as on Android.
mkdir -p "$out/fonts"
cp "$tmp/ascii/site/public/fonts/"{ascii-rest-mono.woff2,OFL.txt} "$out/fonts/"
git -C "$tmp/ascii" rev-parse HEAD > "$out/VERSION"

# Every piece named in the pages: each piece="...", the scenes the hero picks
# from (data-scenes), and the one party mode swaps in (data-party).
grep -ohE '(piece|data-party|data-scenes)="[a-z0-9 -]+"' index.html 404.html | cut -d'"' -f2 | tr ' ' '\n' | sort -u |
  while read -r piece; do
    cp "$tmp/ascii/dist/pieces/$piece.js" "$out/pieces/"
  done

echo "vendored $(ls "$out/pieces" | wc -l | tr -d ' ') pieces at $(cat "$out/VERSION" | cut -c1-7) into $out"
