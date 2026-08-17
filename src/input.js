// Keyboard handling.
//
// Because the whole board can be spun a quarter turn at a time, every
// direction key means something different depending on `arenaPos`. The
// original repeated a four-case switch for each of six keys; here each key
// carries one table indexed by arenaPos.

import * as game from './game.js';
import * as render from './render.js';
import * as audio from './audio.js';

/** [axis, delta] per arenaPos (0-3), one table per direction. */
const BACK = [
  ['z', -1],
  ['x', +1],
  ['z', +1],
  ['x', -1],
];
const FRONT = [
  ['z', +1],
  ['x', -1],
  ['z', -1],
  ['x', +1],
];
const LEFT = [
  ['x', -1],
  ['z', -1],
  ['x', +1],
  ['z', +1],
];
const RIGHT = [
  ['x', +1],
  ['z', +1],
  ['x', -1],
  ['z', -1],
];

/**
 * The arrow keys are what the legend shows; i/j/k/l stay bound to the same
 * four directions for anyone already playing with a hand on the home row.
 */
const MOVES = {
  ArrowUp: BACK,
  ArrowDown: FRONT,
  ArrowLeft: LEFT,
  ArrowRight: RIGHT,
  KeyI: BACK,
  KeyK: FRONT,
  KeyJ: LEFT,
  KeyL: RIGHT,
};

/**
 * [axis, positive] per arenaPos (0-3). One key per axis and direction: s/w for
 * x, d/e for y, f/r for z.
 */
const ROTATIONS = {
  KeyS: [
    ['x', true],
    ['z', false],
    ['x', false],
    ['z', true],
  ],
  KeyW: [
    ['x', false],
    ['z', true],
    ['x', true],
    ['z', false],
  ],
  KeyF: [
    ['z', true],
    ['x', true],
    ['z', false],
    ['x', false],
  ],
  KeyR: [
    ['z', false],
    ['x', false],
    ['z', true],
    ['x', true],
  ],
  // Rotation about y is unaffected by spinning the board about y.
  KeyD: [['y', true], ['y', true], ['y', true], ['y', true]],
  KeyE: [['y', false], ['y', false], ['y', false], ['y', false]],
};

/** Keys whose default browser behaviour would disrupt play. */
const SWALLOWED = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/**
 * Runs the action bound to a key code. The on-screen keyboard in controls.js
 * calls this too, so a click and a keypress take exactly the same path.
 */
export function dispatch(code) {
  // Always available, even once the game is over.
  switch (code) {
    case 'KeyP':
      game.togglePause();
      return;
    case 'KeyO':
      render.cycleCameraView();
      return;
    case 'KeyQ':
      game.turnArena(1);
      return;
    case 'KeyA':
      game.turnArena(-1);
      return;
    case 'Digit0':
      audio.toggleMusic();
      return;
  }

  // Once the game is over the only other meaningful action is starting again.
  // Space is swallowed above, so the focused restart button never sees it —
  // handle both it and Enter here instead.
  if (game.state.phase === game.State.GAME_OVER) {
    if (code === 'Space' || code === 'Enter') game.restart();
    return;
  }

  const { arenaPos } = game.state;

  const movement = MOVES[code];
  if (movement) {
    const [axis, delta] = movement[arenaPos];
    game.move(axis, delta);
    return;
  }

  const rotation = ROTATIONS[code];
  if (rotation) {
    const [axis, positive] = rotation[arenaPos];
    game.rotate(axis, positive);
    return;
  }

  if (code === 'Space') {
    game.softDrop();
    return;
  }

  if (code === 'Enter') {
    game.hardDrop();
  }
}

function handleKeyDown(event) {
  // Soft drop is the one action worth auto-repeating: holding Space should
  // walk the piece down rather than needing a press per cell.
  if (event.repeat && event.code !== 'Space') return;
  if (SWALLOWED.has(event.code)) event.preventDefault();
  dispatch(event.code);
}

export function init() {
  // `event.code` is layout-independent; the original decoded the deprecated
  // `keyCode` through String.fromCharCode, which broke on non-QWERTY layouts.
  document.addEventListener('keydown', handleKeyDown);
}
