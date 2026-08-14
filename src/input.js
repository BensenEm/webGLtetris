// Keyboard handling.
//
// Because the whole board can be spun a quarter turn at a time, every
// direction key means something different depending on `arenaPos`. The
// original repeated a four-case switch for each of six keys; here each key
// carries one table indexed by arenaPos.

import * as game from './game.js';
import * as render from './render.js';

/** [axis, delta] per arenaPos (0-3). */
const MOVES = {
  KeyI: [
    ['z', -1],
    ['x', +1],
    ['z', +1],
    ['x', -1],
  ],
  KeyK: [
    ['z', +1],
    ['x', -1],
    ['z', -1],
    ['x', +1],
  ],
  KeyJ: [
    ['x', -1],
    ['z', -1],
    ['x', +1],
    ['z', +1],
  ],
  KeyL: [
    ['x', +1],
    ['z', +1],
    ['x', -1],
    ['z', -1],
  ],
};

/** [axis, positive] per arenaPos (0-3). */
const ROTATIONS = {
  KeyR: [
    ['x', true],
    ['z', false],
    ['x', false],
    ['z', true],
  ],
  KeyE: [
    ['x', false],
    ['z', true],
    ['x', true],
    ['z', false],
  ],
  KeyV: [
    ['z', false],
    ['x', false],
    ['z', true],
    ['x', true],
  ],
  KeyC: [
    ['z', true],
    ['x', true],
    ['z', false],
    ['x', false],
  ],
  // Rotation about y is unaffected by spinning the board about y.
  KeyF: [['y', true], ['y', true], ['y', true], ['y', true]],
  KeyD: [['y', false], ['y', false], ['y', false], ['y', false]],
};

/** Keys whose default browser behaviour would disrupt play. */
const SWALLOWED = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

function handleKeyDown(event) {
  if (event.repeat) return;
  if (SWALLOWED.has(event.code)) event.preventDefault();

  // Always available, even once the game is over.
  switch (event.code) {
    case 'KeyP':
      game.togglePause();
      return;
    case 'KeyA':
      render.cycleCameraView();
      return;
    case 'KeyQ':
      game.turnArena();
      return;
  }

  // Once the game is over the only other meaningful action is starting again.
  // Space is swallowed above, so the focused restart button never sees it —
  // handle both it and Enter here instead.
  if (game.state.phase === game.State.GAME_OVER) {
    if (event.code === 'Space' || event.code === 'Enter') game.restart();
    return;
  }

  const { arenaPos } = game.state;

  const movement = MOVES[event.code];
  if (movement) {
    const [axis, delta] = movement[arenaPos];
    game.move(axis, delta);
    return;
  }

  const rotation = ROTATIONS[event.code];
  if (rotation) {
    const [axis, positive] = rotation[arenaPos];
    game.rotate(axis, positive);
    return;
  }

  if (event.code === 'Space') {
    game.hardDrop();
  }
}

export function init() {
  // `event.code` is layout-independent; the original decoded the deprecated
  // `keyCode` through String.fromCharCode, which broke on non-QWERTY layouts.
  document.addEventListener('keydown', handleKeyDown);
}
