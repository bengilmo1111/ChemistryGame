# Mad Flask Lab artwork guide

This repo now includes first-pass SVG artwork under `src/assets/images/`. These files are intentionally lightweight placeholders so the game has a more polished visual direction while remaining easy for designers to replace.

## Current assets

- `logo.svg` — title logo used on the menu.
- `junior-scientist.svg` — mascot character used on the menu and results screen.
- `lab-bench.svg` — classroom-safe fantasy lab background used in the lab scene.
- `reagent-*.svg` — six fictional reagent bottle illustrations used by draggable ingredient cards.

## Style targets

- Rounded, friendly cartoon silhouettes.
- Bright colors with thick dark outlines for readability.
- Clearly fictional lab labels and icons.
- No realistic hazardous chemical labels, recipe measurements, or real-world dangerous setup details.

## Adding or replacing assets

1. Place SVG or future raster artwork under `src/assets/images/`.
2. Register the asset in `src/data/artAssets.js` with a stable Phaser texture key.
3. If it is a reagent bottle, set the matching `artKey` in `src/data/reagents.js`.
4. Run `npm test` to verify that registered assets exist and reagent art references are valid.
