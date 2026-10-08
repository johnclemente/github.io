# johnclemente.com

My portfolio: a static page on GitHub Pages, in the style of
[ascii.rest](https://ascii.rest), plain monospace text with animated ascii pieces
where the pictures would be. No build step; open `index.html`.

## Layout

- `index.html`, `404.html`: the pages. Every picture is an `<ascii-art piece="...">` tag. The hero
  is one of seven full-colour scenes, picked per visit (`data-scenes`); the landscape in About is drawn
  for the reader's local hour and tonight's moon.
- `assets/css/styles.css`: one stylesheet. Light and dark follow the system, with a `[dark]` switch.
- `assets/js/main.js`: theme, reduced-motion override, the `[mono]` switch for the logos,
  the sidebar following the scroll, and a hidden gem.
- `assets/js/formHandler.js`, `analytics.js`, `neon.js`, `config.js`: the contact form and
  privacy-friendly page views, both written to Neon through its Data API (insert-only anonymous role).
- `assets/art/`: the card pictures (screenshots and the old card images) drawn as halftone pieces
  in the library's own piece contract, in colour on a canvas. `art-src/` holds the originals and
  `./tools/make-art.sh` redraws them all with `tools/image-piece.py` (Pillow + NumPy).
- `assets/vendor/ascii/`: [ascii.rest](https://github.com/bas3line/ascii) by @bas3line (MIT),
  self-hosted so the site never depends on another site being up. Only the pieces the pages use are
  included. `./tools/update-ascii.sh` pulls the latest and re-vendors them.
- `resumes/`: the résumé source and its PDF build.

## Local analytics

`npm run stats` prints views, referrers and contact messages from Neon. It reads `DATABASE_URL`
from `.env` (gitignored).

## Hidden gems

Sometimes there's more than meets the eye. If you're curious and enjoy exploring, you might
stumble upon something interesting.
