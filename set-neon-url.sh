#!/usr/bin/env bash
# Writes your Neon Data API URL into assets/js/config.js.
# Run this in your own terminal:  ./set-neon-url.sh
# (or pass it as an argument:     ./set-neon-url.sh https://ep-xxxx...)
set -euo pipefail
cd "$(dirname "$0")"

if [[ $# -ge 1 ]]; then
  url="$1"
else
  read -rp "Paste your Neon Data API URL: " url
fi

url="${url%/}" # strip trailing slash

if [[ ! "$url" =~ ^https:// ]]; then
  echo "Error: that doesn't look like an https:// URL." >&2
  exit 1
fi

sed -i '' -E "s|^export const DATA_API_URL = .*;$|export const DATA_API_URL = \"$url\";|" assets/js/config.js

if grep -q '__NEON_DATA_API_URL__' assets/js/config.js; then
  echo "Error: replacement failed — config.js still has the placeholder." >&2
  exit 1
fi

echo "Done. assets/js/config.js is configured."
