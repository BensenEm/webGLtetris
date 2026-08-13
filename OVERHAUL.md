# 3D Tetris — Overhaul Guide

Rough working document from the initial code review (three.js r80, no build step, all
globals). Ordered roughly by priority. Tick items off as they land; add notes inline.

---

## 0. Baseline

- three.js **r80** (2016), vendored minified at `js/three.min.js`
- No package.json, no build step, no lint, no tests
- 11 scripts loaded via `<script>` tags in `tetris.html`, everything on `window`
- Arena is `6 x 12 x 6`, cube size 40 units, pieces are always 4 cubes (`memberCount`)

---

## 1. Correctness bugs (fix before or during the refactor)

- [ ] **Line-clear collapse off by one** — `js/main.js:402`
  `for (var i = y; i < yLen-2; ++i)` never writes row `yLen-2`, leaving a stale
  duplicate cube in the second-from-top row after a clear. Should be `yLen-1`.

- [ ] **Multi-row clears collapse in the wrong order** — `js/main.js:398-408`
  Shifts one cell at a time over `fullRowsSet`, which `makeSet` sorted by x -> y -> z
  and which is then walked backwards, so within a column the *upper* cleared row is
  collapsed before the lower one. Two cleared rows in one column give a wrong stack.
  Rewrite as: per column, filter out cleared cells and repack downward once.
  Also move `updateArena(arNew, newArena)` out of the inner loop — it currently
  rebuilds all 432 cells per cleared cell.

- [ ] **Game-over animation crashes** — `js/main.js:502`
  `counter3 <= len3` then `arOld.children[counter3].visible` -> TypeError on the last
  iteration. Use `<`.

- [ ] **Game-over detection misses half the spawn area** — `js/main.js:194`
  `checkGameOver()` only tests row `yLen-1`, but pieces spawn into `yLen-1` *and*
  `yLen-2` (`js/stone.js:261+`). A stack topping out at `yLen-2` silently overwrites
  cells instead of ending the game. Test the actual spawn cells of the next piece.

- [ ] **`turn()` can blow the stack** — `js/stone.js:153`
  Recurses with `!direction` on failure; if the reverted state is also blocked the two
  calls ping-pong forever. Replace with: compute candidate cells, validate, commit or
  discard (no mutation-then-revert).

- [ ] **Resize distorts the scene** — `js/main.js:88`
  `windowSize()` calls `renderer.setSize` but never updates `camera.aspect` /
  `camera.updateProjectionMatrix()`. Also `div.style.width = <number>` (`main.js:150`)
  is missing a `px` unit and is a silent no-op.

- [ ] **Deletion-flash timing is partly dead code** — `js/main.js:455-483`
  The final `else if (deltaT2 > 1500)` is only reachable at >2500ms because of the
  earlier chained ranges. Replace the ms magic numbers with a small state/timeline.

---

## 2. three.js upgrade + modularisation  <-- current phase

Prerequisite for all rendering work. Notes:

- [ ] Move to modern three (ESM). Delete the vendored `three.min.js`.
- [ ] APIs used here that no longer exist and must be replaced:
  - `shading: THREE.FlatShading` (`stone.js:161`, `main.js:235`) -> `flatShading: true`
  - `THREE.GeometryUtils` (`font.js`) — removed
  - `overdraw` (`main.js:263`) — removed (CanvasRenderer leftover)
  - `THREE.Geometry`-based `TextGeometry` face/vertex fiddling (`font.js`) — removed
  - `THREE.Math.degToRad` (`main.js:98`) -> `THREE.MathUtils.degToRad`
  - `renderer.setClearColor` still fine; colour management is now sRGB-by-default
- [ ] Delete dead/broken code paths while migrating: `js/font.js` (never called —
  `loadFont()` is commented out at `main.js:116`), `putBckg()` + `loadCloud()` +
  `js/OBJLoader.js`, `js/controllInfo.js` (entirely commented out).
- [ ] Split into ES modules with an explicit game-state object instead of ~40 globals.
  Kill the accidental implicit globals: `div`, `wid`, `mesh`, `floor`, `light`, `now`,
  `deltaT`, `now2`, `deltaT2`, `now3`, `deltaT3`, `counter3`, `len3`, `text2`,
  `textGOdiv`, `textGOpar`, `childrenCount`. Add `"use strict"` / module scope.
- [ ] Suggested module split: `arena.js` (grid + collapse), `piece.js` (shapes,
  rotation), `render.js` (scene/camera/materials), `input.js`, `levels.js`,
  `audio.js`, `ui.js`, `main.js` (loop only).

---

## 3. Rendering / materials  <-- the actual near-term goal

Once on modern three:

- [ ] `MeshStandardMaterial` (or `MeshPhysicalMaterial`) for cubes — real roughness /
  metalness instead of `MeshPhongMaterial` + `specular: 0x009900`.
- [ ] Image-based lighting: an HDR/EXR environment via `PMREMGenerator`, so cubes pick
  up reflections. Biggest single visual win.
- [ ] `renderer.toneMapping = ACESFilmicToneMapping`, correct sRGB output, and
  `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` (currently unset — the whole
  thing renders soft on HiDPI).
- [ ] Shadow map from the key light so the piece reads against the floor; the drop
  ghost currently does that job alone.
- [ ] Real arena surfaces: glass//frosted case walls, a proper floor material instead of
  the flat blue `MeshBasicMaterial` box (`main.js:249`), subtle grid on the floor to
  read x/z position.
- [ ] Ghost/help piece: currently a black wireframe (`matWa`, `main.js:70`) — make it a
  translucent additive material.
- [ ] Post-processing pass (bloom on line clears, slight vignette) — optional, after
  the above.
- [ ] Per-level environment/palette swap driven by `Level` (`js/level.js` already
  carries `colorset`; it also declares unused `backgroundpic` / `floorObj` /
  `gameOverAnimation` slots that were clearly meant for this).

### Performance to fix at the same time

- [ ] `updateArena()` (`main.js:230`) allocates a fresh `MeshPhongMaterial` per cube on
  every rebuild and never `dispose()`s removed meshes — a steady leak over a long game.
  One shared material per level colour.
- [ ] Better: a single `InstancedMesh` for the whole arena, updating instance matrices
  and colours instead of add/remove of ~400 `Mesh` objects per landing.

---

## 4. Input

- [ ] `String.fromCharCode(event.keyCode)` (`js/keyboard.js`) is deprecated and breaks on
  non-QWERTY layouts -> `event.code`.
- [ ] No `preventDefault()`, so Space scrolls the page mid-game.
- [ ] `handleKeys()` (`keyboard.js:193`) is dead code and references an undefined `z`.
- [ ] No key repeat / DAS — held movement keys don't auto-repeat, movement feels stiff.
- [ ] The four-way `switch (arenaPos)` blocks repeat 6 times; collapse into a single
  rotation-mapping table.

---

## 5. Gameplay features

- [ ] Next-piece preview, hold slot.
- [ ] Soft drop, and lock delay on hard drop.
- [ ] Genuinely 3D pieces — all 5 current shapes are flat 4-cube tetrominoes despite the
  3D arena. `memberCount` is a hardcoded global `4` (`main.js:33`); make piece size
  per-shape so pentacubes / 3D S- and T-shapes become possible.
- [ ] Piece colour is currently random and unrelated to shape (`main.js:211-217`) —
  colour by shape so pieces are recognisable.
- [ ] Level-up only fires on a line clear and only advances one level at a time
  (`main.js:340`).
- [ ] Score/game-over are absolutely-positioned divs nudged with negative `top` hacks
  (`main.js:186`, `main.js:171`) — rebuild as a proper HUD overlay.
- [ ] SFX exist but are never played — `playSound(soundAufsetzen)` is commented out at
  `js/stone.js:134`. Wire up landing / rotate / clear / game-over.

---

## 6. Audio

- [ ] Drop the CDN `createjs` dependency (`tetris.html:11`) — it exists to play one mp3.
  Use `<audio>` or Web Audio.
- [ ] `soundinstance.muted` is a deprecated SoundJS property.

---

## 7. Repo hygiene

- [ ] ~10 MB of unused assets committed: `images/controlls.ai` (646 KB),
  `images/swanky_leelo.obj` (236 KB), `images/abstractGeometricShapes.jpg` (1.0 MB),
  `images/psysky.png` (694 KB), `images/surreal_sky_*.jpg`, three tracker modules
  (`.S3M` / `.MOD` / `.XM`), `sounds/ophelia.mp3`, `sounds/getout.ogg`, and ~2.8 MB of
  unused fonts (`fonts/Lato *_Regular.json` are only referenced by the dead `font.js`).
- [ ] Compress what stays: `sounds/music.mp3` is 4.1 MB, `images/background.png` 2.6 MB,
  `sounds/verschwinden.wav` 1.8 MB.
- [ ] Add `package.json`, a `.gitignore`, a README, and a linter.
- [ ] `tetris.html`: invalid `<!DOCTYPE>` (line 1), missing `<html lang>`, inline
  `onresize` / `onload` handlers, malformed Google Fonts URL (spaces in
  `family=Lato:100, 300, 400,900`), no favicon.
- [ ] Mobile is hard-blocked below 800px (`benstyle.css`) with no touch controls;
  `#frame` height is hardcoded to `534px`.
- [ ] Consider a deploy target (GitHub Pages) once there's a build step.
