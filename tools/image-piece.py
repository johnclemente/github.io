#!/usr/bin/env python3
"""
Turns a picture into an ascii.rest piece: a JS module following the piece
contract (meta + default function returning frame(t, env)), drawn the way the
library's scenes are. Each cell is a dot sized by how far its colour is from
the ground, ordered-dithered so gradients read as texture, in the nearest of
up to 64 palette colours. On a canvas it is in colour; in a <pre> it is dots in
one ink. A scan line passes down it now and then, scrambling what it crosses.

  python3 tools/image-piece.py IMAGE assets/art/NAME.js --name "all that we have"
      [--cols 96 --rows 72] [--colors 48] [--ground auto|none|#rrggbb] [--scan 7]

Cells are square (cell: 1), so --cols x --rows is also the picture's aspect;
the image is fitted inside and the rest is ground. "auto" takes the ground from
the image's edges; "none" leaves it transparent, for an icon on a clear
background, so the page's own colour shows through. Needs Pillow and NumPy.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Dots by size, the same glyphs the scenes use; all in the fallback font.
RAMP = " ·•●"
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16


def lum(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def edge_colour(im):
    """The most common colour round the picture's edge: its background."""
    a = np.asarray(im.convert("RGB"))
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    q = (edge // 8) * 8
    vals, counts = np.unique(q.reshape(-1, 3), axis=0, return_counts=True)
    return tuple(int(v) for v in vals[counts.argmax()])


def main():
    p = argparse.ArgumentParser()
    p.add_argument("image")
    p.add_argument("out")
    p.add_argument("--name", required=True, help="lowercase display name")
    p.add_argument("--note", default="", help="one line saying what you see")
    p.add_argument("--cols", type=int, default=128)
    p.add_argument("--rows", type=int, default=96)
    p.add_argument("--colors", type=int, default=48)
    p.add_argument("--ground", default="auto")
    p.add_argument("--scan", type=float, default=7, help="seconds between scans, 0 for none")
    p.add_argument("--fit", choices=["contain", "cover"], default="contain")
    p.add_argument("--gamma", type=float, default=0.65, help="below 1 lifts faint detail")
    args = p.parse_args()

    cols, rows = args.cols, args.rows
    SS = 3  # each cell is sampled SSxSS times: its colour is their mean, its dot their strongest
    im = Image.open(args.image).convert("RGBA")

    # The ground: the image's own background, none, or as given.
    if args.ground == "none":
        ground = None
    elif args.ground == "auto":
        ground = edge_colour(im) if im.getextrema()[3][0] == 255 else None
    else:
        ground = tuple(int(args.ground.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))

    # Fit the picture into the grid, the rest ground (or clear), supersampled.
    W, H = cols * SS, rows * SS
    scale = (min if args.fit == "contain" else max)(W / im.width, H / im.height)
    w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    small = im.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (*ground, 255) if ground else (0, 0, 0, 0))
    canvas.paste(small, ((W - w) // 2, (H - h) // 2), small)

    fine = np.asarray(canvas).astype(float)
    falpha = fine[..., 3] / 255
    frgb = fine[..., :3]

    # How much each sample stands out from the ground: by luminance against it, or
    # by opacity where there is no ground.
    if ground:
        g = np.array(ground, float)
        contrast = np.abs(lum(frgb) - lum(g)) / 255
        # Colour difference counts too, so a red on a grey of equal brightness still shows.
        chroma = np.sqrt(((frgb - g) ** 2).sum(-1)) / 441
        fsize = np.clip(np.maximum(contrast * 1.6, chroma * 1.3), 0, 1)
    else:
        fsize = falpha
    fsize[falpha < 0.08] = 0

    # Down to cells: the strongest sample sets the dot, so thin text and lines
    # survive; the colour is the mean of the samples that stand out, so the dot
    # takes the line's colour and not the ground's.
    blocks = lambda a: a.reshape(rows, SS, cols, SS, *a.shape[2:]).swapaxes(1, 2)
    size = np.clip(blocks(fsize).max(axis=(2, 3)) ** args.gamma, 0, 1)
    alpha = blocks(falpha).max(axis=(2, 3))
    weight = blocks(fsize)[..., None]
    rgb = (blocks(frgb) * weight).sum(axis=(2, 3)) / np.maximum(weight.sum(axis=(2, 3)), 1e-6)
    rgb = np.where(weight.sum(axis=(2, 3)) > 1e-6, rgb, blocks(frgb).mean(axis=(2, 3)))

    # The palette: the opaque, non-ground cells quantized.
    mask = size > 0.02
    opaque = Image.fromarray(np.where(mask[..., None], rgb, 0).astype(np.uint8), "RGB")
    pal_im = opaque.quantize(colors=min(64, args.colors), method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    used = len(set(pal_im.get_flattened_data() if hasattr(pal_im, "get_flattened_data") else pal_im.getdata()))
    pal = np.array(pal_im.getpalette()[: 3 * used]).reshape(-1, 3)
    # Nearest palette entry for every cell (pixels, not the quantizer's own indexes, which include black).
    flat = rgb.reshape(-1, 3)
    d = ((flat[:, None, :] - pal[None, :, :]) ** 2).sum(-1)
    idx = d.argmin(1).reshape(rows, cols)

    # The still: a dot per cell, dithered, and its colour.
    dither = np.tile(BAYER, (rows // 4 + 1, cols // 4 + 1))[:rows, :cols]
    level = np.clip(np.floor(size * (len(RAMP) - 1) + dither * 0.999), 0, len(RAMP) - 1).astype(int)
    level[~mask] = 0
    lines = ["".join(RAMP[level[y, x]] for x in range(cols)) for y in range(rows)]
    colours = [int(idx[y, x]) if mask[y, x] else 0 for y in range(rows) for x in range(cols)]
    # Colour indexes as a base-64 string, one char a cell, so the module stays small.
    B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    ink = "".join(B64[c] for c in colours)

    palette = ["#%02x%02x%02x" % tuple(int(v) for v in c) for c in pal]
    meta = {
        "name": args.name,
        "category": "scenes",
        "note": args.note or f"{args.name}, as a halftone",
        "cols": cols,
        "rows": rows,
        "fps": 12 if args.scan else 0,
        "cell": 1,
        "palette": palette,
        "options": {"scan": args.scan},
    }
    if ground:
        meta["ground"] = "#%02x%02x%02x" % ground

    js = f"""/*
 * {args.name}: a picture from johnclemente.com drawn as a halftone, the way
 * ascii.rest's scenes are, by tools/image-piece.py. Each cell is a dot sized
 * by how far it stands from the ground, in the nearest palette colour; a scan
 * line passes down it now and then. Follows the ascii.rest piece contract.
 */
export const meta = {json.dumps(meta, indent=2)};

const STILL = {json.dumps(lines)};
const INK = {json.dumps(ink)};
const B64 = "{B64}";
const NOISE = "·•●°";
const PASS = 1.6; // seconds a scan takes, top to bottom
const HEAD = 2; // rows the line scrambles

function hash(x, y, k) {{
  let h = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(k, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}}

export default function picture({{ scan = meta.options.scan }} = {{}}) {{
  const {{ cols, rows, fps }} = meta;
  const every = scan > 0 ? Math.max(scan, PASS + 1) : 0;
  const span = rows + HEAD;
  return (t, {{ color }} = {{}}) => {{
    if (color) for (let i = 0; i < cols * rows; i++) color[i] = B64.indexOf(INK[i]);
    const at = every ? 0.5 + (span * ((t + every - 0.5) % every)) / PASS : -Infinity;
    if (at > span) return STILL.join("\\n");
    const tick = Math.floor((t * fps) / 2);
    const out = [];
    for (let y = 0; y < rows; y++) {{
      const d = at - y;
      if (d < 0 || d >= HEAD) {{
        out.push(STILL[y]);
        continue;
      }}
      let line = "";
      for (let x = 0; x < cols; x++) {{
        const ch = STILL[y][x];
        if (ch === " ") line += " ";
        else {{
          const h = hash(x, y, tick);
          line += h % 3 ? NOISE[(h >>> 2) % NOISE.length] : ch;
        }}
      }}
      out.push(line);
    }}
    return out.join("\\n");
  }};
}}
"""
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(js)
    print(f"{args.out}: {cols}x{rows}, {len(palette)} colours, ground {meta.get('ground', 'none')}, {len(js) // 1024} kB")


if __name__ == "__main__":
    sys.exit(main())
