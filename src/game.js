// Game rules and state machine. Talks to render.js to mirror state on screen,
// and to ui.js / audio.js for feedback, but owns all the logic itself.

import {
  Y_LEN,
  EMPTY,
  ARENA_TURN_FRAMES,
  CLEAR_FLASH_INTERVAL,
  CLEAR_FLASH_COUNT,
  GAME_OVER_STEP_MS,
} from './config.js';
import {
  createArena,
  areCellsFree,
  findCompletedLines,
  withCellsCleared,
  collapseCells,
} from './arena.js';
import { Piece, SHAPE_NAMES } from './piece.js';
import { getLevel, levelForScore } from './levels.js';
import { scoreForLines } from './scoring.js';
import * as render from './render.js';
import * as ui from './ui.js';

/** Mutually exclusive top-level states. */
const State = {
  FALLING: 'falling',
  CLEARING: 'clearing',
  GAME_OVER: 'gameOver',
};

export const state = {
  phase: State.FALLING,
  paused: false,

  arena: createArena(),
  piece: null,
  ghostCells: [],

  score: 0,
  totalLines: 0,
  level: 1,

  /** Quarter turns applied to the board, 0-3, driven by the "q" key. */
  arenaPos: 0,
  turnFramesLeft: 0,

  lastDropAt: 0,
  clearStartedAt: 0,
  pendingClear: null,

  gameOverIndex: 0,
  gameOverSteppedAt: 0,
};

function levelConfig() {
  return getLevel(state.level);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- spawning ---------------------------------------------------------------

function spawnPiece() {
  const shape = SHAPE_NAMES[randomInt(0, SHAPE_NAMES.length - 1)];
  const colors = levelConfig().colors;
  const color = colors[randomInt(0, colors.length - 1)];
  const piece = new Piece(shape, color);

  // Game over when the new piece cannot physically be placed. The original
  // only checked the top row, but pieces spawn into the top *two* rows, so a
  // stack topping out one row down silently overwrote settled cubes.
  if (!areCellsFree(state.arena, piece.cells)) {
    enterGameOver();
    return;
  }

  state.piece = piece;
  updateGhost();
  render.syncPiece(piece.cells, piece.color);
}

// --- ghost piece ------------------------------------------------------------

/** How far the piece can fall before something stops it. */
function dropDistance(cells) {
  let distance = Y_LEN;
  for (const c of cells) {
    let free = 0;
    for (let y = c.y - 1; y >= 0; y--) {
      if (state.arena[c.x][y][c.z] !== EMPTY) break;
      free++;
    }
    distance = Math.min(distance, free);
  }
  return distance;
}

function updateGhost() {
  if (!state.piece) return;
  const distance = dropDistance(state.piece.cells);
  state.ghostCells = state.piece.cells.map((c) => ({ ...c, y: c.y - distance }));
  render.syncGhost(state.ghostCells);
}

// --- moving and rotating ----------------------------------------------------

function commit(cells) {
  state.piece.setCells(cells);
  updateGhost();
  render.syncPiece(state.piece.cells, state.piece.color);
}

/** Attempts a one-cell move. Returns whether it happened. */
export function move(axis, delta) {
  if (!canAct()) return false;
  const candidate = state.piece.movedBy(axis, delta);
  if (!areCellsFree(state.arena, candidate)) return false;
  commit(candidate);
  return true;
}

/** Attempts a quarter turn. A blocked rotation is simply discarded. */
export function rotate(axis, positive) {
  if (!canAct()) return false;
  const candidate = state.piece.rotated(axis, positive);
  if (!areCellsFree(state.arena, candidate)) return false;
  commit(candidate);
  return true;
}

function canAct() {
  return state.phase === State.FALLING && !state.paused && state.piece;
}

// --- falling and locking ----------------------------------------------------

/** One gravity step. Locks the piece if it cannot fall further. */
export function stepDown() {
  if (!canAct()) return;
  if (move('y', -1)) return;
  lockPiece();
}

/** Hard drop: fall as far as possible, then lock. */
export function hardDrop() {
  if (!canAct()) return;
  const distance = dropDistance(state.piece.cells);
  if (distance > 0) {
    commit(state.piece.movedBy('y', -distance));
  }
  lockPiece();
}

function lockPiece() {
  for (const c of state.piece.cells) {
    state.arena[c.x][c.y][c.z] = state.piece.color;
  }
  state.piece = null;
  render.clearPiece();
  render.syncArena(render.groups.solid, state.arena);

  const { cells, lines } = findCompletedLines(state.arena);
  if (lines > 0) {
    beginClear(cells, lines);
  } else {
    spawnPiece();
  }
}

// --- clearing lines ---------------------------------------------------------

function beginClear(cells, lines) {
  state.totalLines += lines;
  state.score += scoreForLines(lines, levelConfig().scoreMultiplier);
  state.level = levelForScore(state.level, state.score);
  ui.updateScore(state);

  // Pre-build both frames of the flash: the board as-is, and the board with
  // the completed cells removed.
  render.syncArena(render.groups.cleared, withCellsCleared(state.arena, cells));

  state.pendingClear = collapseCells(state.arena, cells);
  state.clearStartedAt = performance.now();
  state.phase = State.CLEARING;
}

function updateClearing(now) {
  const elapsed = now - state.clearStartedAt;
  const stepsDone = Math.floor(elapsed / CLEAR_FLASH_INTERVAL);

  if (stepsDone >= CLEAR_FLASH_COUNT) {
    state.arena = state.pendingClear;
    state.pendingClear = null;
    render.syncArena(render.groups.solid, state.arena);
    render.showArenaVariant('solid');
    state.phase = State.FALLING;
    state.lastDropAt = now;
    spawnPiece();
    return;
  }

  render.showArenaVariant(stepsDone % 2 === 0 ? 'cleared' : 'solid');
}

// --- game over --------------------------------------------------------------

function enterGameOver() {
  state.phase = State.GAME_OVER;
  state.piece = null;
  render.clearPiece();
  render.showArenaVariant('solid');
  ui.showGameOver();

  // Hide the settled cubes one by one, in random order.
  shuffle(render.solidCubes());
  state.gameOverIndex = 0;
  state.gameOverSteppedAt = performance.now();
}

function updateGameOver(now) {
  const cubes = render.solidCubes();
  if (state.gameOverIndex >= cubes.length) return;
  if (now - state.gameOverSteppedAt < GAME_OVER_STEP_MS) return;

  // The original used `counter3 <= len3` and read one past the end.
  cubes[state.gameOverIndex].visible = false;
  state.gameOverIndex++;
  state.gameOverSteppedAt = now;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- board rotation ---------------------------------------------------------

export function turnArena() {
  if (state.turnFramesLeft > 0) return;
  state.turnFramesLeft = ARENA_TURN_FRAMES;
  state.arenaPos = (state.arenaPos + 1) % 4;
}

function updateArenaTurn() {
  if (state.turnFramesLeft <= 0) return;
  render.stepArenaTurn();
  state.turnFramesLeft--;
  if (state.turnFramesLeft === 0) {
    render.settleArenaTurn(state.arenaPos);
  }
}

// --- lifecycle --------------------------------------------------------------

export function togglePause() {
  state.paused = !state.paused;
  ui.setPaused(state.paused);
}

export function start() {
  render.syncArena(render.groups.solid, state.arena);
  ui.updateScore(state);
  state.lastDropAt = performance.now();
  spawnPiece();
}

/** Back to a fresh board. The board rotation and camera view are left alone. */
export function restart() {
  state.phase = State.FALLING;
  state.paused = false;
  state.arena = createArena();
  state.piece = null;
  state.ghostCells = [];
  state.score = 0;
  state.totalLines = 0;
  state.level = 1;
  state.clearStartedAt = 0;
  state.pendingClear = null;
  state.gameOverIndex = 0;
  state.gameOverSteppedAt = 0;

  ui.hideGameOver();
  ui.setPaused(false);
  render.clearPiece();
  render.syncArena(render.groups.cleared, state.arena);
  render.showArenaVariant('solid');
  start();
}

export function update(now) {
  if (state.paused) return;

  updateArenaTurn();

  switch (state.phase) {
    case State.FALLING:
      if (now - state.lastDropAt > levelConfig().dropTime) {
        stepDown();
        state.lastDropAt = now;
      }
      break;
    case State.CLEARING:
      updateClearing(now);
      break;
    case State.GAME_OVER:
      updateGameOver(now);
      break;
  }
}

export { State };
