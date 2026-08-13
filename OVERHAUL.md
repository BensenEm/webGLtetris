# 3D Tetris — Overhaul Guide

Working document from the initial code review of the original three.js r80
codebase. `[x]` items are done; the rest is the remaining backlog.

---

## 0. Baseline (as found)

- three.js **r80** (2016), vendored minified at `js/three.min.js`
- No package.json, no build step, no lint, no tests
- 11 scripts loaded via `<script>` tags in `tetris.html`, everything on `window`
- Arena is `6 x 12 x 6`, pieces are always 4 cubes (`memberCount`)

Now: three **r185** via npm, Vite build, ES modules under `src/`.

---

## 1. Correctness bugs — DONE

- [x] **Line-clear collapse off by one** (was `main.js:402`)
  `for (var i = y; i < yLen-2; ++i)` never wrote row `yLen-2`, leaving a stale
  duplicate cube after a clear.

- [x] **Multi-row clears collapsed in the wrong order** (was `main.js:398-408`)
  Cells were shifted one at a time in an order derived from a sorted set, so a
  column containing two completed rows collapsed the upper one first.
  Now `arena.js:collapseCells` repacks each (x, z) column in a single pass.

- [x] **Game-over animation crashed** (was `main.js:502`) — `counter3 <= len3`
  read one past the end of `arOld.children`.

- [x] **Game-over detection missed half the spawn area** (was `main.js:194`)
  Only the top row was tested, but pieces spawn into the top *two*. Now the
  spawning piece's actual cells are tested.

- [x] **`turn()` could blow the stack** (was `stone.js:153`) — mutate-then-
  recurse-to-undo could ping-pong. Rotation is now build-validate-commit.

- [x] **Resize distorted the scene** (was `main.js:88`) — `camera.aspect` was
  never updated. The missing `px` unit on the container width is fixed too.

- [x] **Deletion-flash timing was partly dead code** (was `main.js:455-483`) —
  replaced with a single timeline driven by `CLEAR_FLASH_*` constants.

---

## 2. three.js upgrade + modularisation — DONE

- [x] Modern three (r185) via npm + Vite. Vendored `three.min.js` deleted.
- [x] All removed APIs replaced (`THREE.FlatShading`, `THREE.GeometryUtils`,
      `overdraw`, `THREE.Math`, Geometry-based `TextGeometry`).
- [x] Dead code deleted: `font.js`, `OBJLoader.js`, `controllInfo.js`,
      `putBckg()`, `loadCloud()`.
- [x] Split into modules; the ~40 globals and all implicit globals are gone.
      `src/`: `config`, `arena`, `piece`, `levels`, `scoring`, `game`,
      `render`, `scenery`, `textures`, `input`, `audio`, `ui`, `main`.

---

## 3. Rendering / materials

- [x] `MeshStandardMaterial` for cubes, floor and sand.
- [x] Image-based lighting — `PMREMGenerator` captures the sky into an
      environment map, so cubes and water carry real sky reflections.
- [x] `ACESFilmicToneMapping`, `setPixelRatio`, sRGB output.
- [x] Shadow map from a key light aimed along the sky's own sun vector.
- [x] Ghost piece is a translucent black wireframe (was opaque black).
- [x] Shared cached materials per colour — the per-cube material leak is gone.
- [ ] Real arena surfaces: glass/frosted case walls, a grid on the floor to
      read x/z position.
- [ ] Post-processing (bloom on line clears, vignette).
- [ ] Per-level environment/palette swap driven by `Level` — `levels.js`
      already carries `colors` per level; the sky/water could shift with it.
- [ ] `InstancedMesh` for the arena instead of add/remove of ~400 meshes per
      landing. Not urgent now that materials are shared, but it is the right
      structure.

### Beach scenery (added this pass)

- Atmospheric `Sky` with a low sun, positioned behind-left of the camera so
  its glare is not aimed at the viewer.
- `Water` object (real planar reflection + refraction distortion) over a
  procedurally generated anisotropic swell normal map.
- Sand: a wide sheet with a meandering shoreline (`SHORE_WAVES`), sloping
  under the sea, with vertex-baked patchiness and wet-sand darkening.
- Anti-tiling: vertex colour variation plus a two-scale rotated texture blend
  patched into the material (`makeNonRepeating`).
- Cloud billboards from generated puff textures, slowly orbiting.
- All textures generated procedurally at load — no new binary assets.

---

## 4. Input

- [x] `event.code` instead of `String.fromCharCode(event.keyCode)`.
- [x] `preventDefault()` so Space no longer scrolls the page.
- [x] Dead `handleKeys()` removed.
- [x] The six repeated four-way `switch (arenaPos)` blocks collapsed into
      per-key mapping tables.
- [ ] Key repeat / DAS — held movement keys still do not auto-repeat.
- [ ] Soft drop.

---

## 5. Gameplay features

- [x] Level-up now advances past every threshold crossed, not just one.
- [ ] Next-piece preview, hold slot.
- [ ] Lock delay on hard drop.
- [ ] Genuinely 3D pieces. All 5 shapes are flat 4-cube tetrominoes despite the
      3D arena. `Piece` no longer assumes a fixed cube count, so pentacubes and
      3D S/T shapes are now a data change in `piece.js` rather than a rewrite.
- [ ] Colour by shape — piece colour is still random and unrelated to shape.
- [ ] SFX: the wav files ship but are never played (landing, rotate, clear,
      game over). `sounds/` has them already.
- [ ] Proper HUD rather than a score div in the corner.

---

## 6. Audio

- [x] CDN `createjs` dependency dropped; music is a plain `Audio` element.
- [ ] SFX wiring (see above).

---

## 7. Repo hygiene

- [x] `package.json`, `.gitignore`, Vite build.
- [x] Valid doctype, `lang`, no inline handlers, fixed Google Fonts URL.
- [ ] ~10 MB of unused assets still committed: `images/controlls.ai`,
      `images/swanky_leelo.obj`, `images/abstractGeometricShapes.jpg`,
      `images/psysky.png`, `images/surreal_sky_*.jpg`, the `.S3M`/`.MOD`/`.XM`
      trackers, `sounds/ophelia.mp3`, `sounds/getout.ogg`, and the `fonts/`
      directory (only the deleted `font.js` ever referenced it).
- [ ] Compress what stays: `sounds/music.mp3` 4.1 MB, `images/background.png`
      2.6 MB, `sounds/verschwinden.wav` 1.8 MB.
- [ ] README, linter.
- [ ] Mobile is hard-blocked below 800px with no touch controls.
- [ ] Deploy to GitHub Pages (`vite build` output is ready; `base: './'` set).
