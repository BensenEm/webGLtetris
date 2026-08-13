// The falling piece: its shapes, its cells, and the pure functions that
// produce moved or rotated versions of it.
//
// Nothing here mutates the arena or the piece in place. Each operation returns
// a candidate list of cells; the caller validates it and commits or discards.
// (The original rotated in place and recursed with the opposite direction to
// undo a bad rotation, which could ping-pong forever.)

import { X_LEN, Y_LEN, Z_LEN } from './config.js';

const HALF_X = Math.floor(X_LEN / 2);
const HALF_Z = Math.floor(Z_LEN / 2);
const TOP = Y_LEN - 1;

/**
 * Spawn layouts. The first cell of each shape is its rotation anchor, matching
 * the original's use of cubeList[0].
 */
export const SHAPES = {
  I: [
    { x: HALF_X - 1, y: TOP, z: HALF_Z },
    { x: HALF_X, y: TOP, z: HALF_Z },
    { x: HALF_X + 1, y: TOP, z: HALF_Z },
    { x: HALF_X + 2, y: TOP, z: HALF_Z },
  ],
  L: [
    { x: HALF_X - 1, y: TOP - 1, z: HALF_Z },
    { x: HALF_X - 1, y: TOP, z: HALF_Z },
    { x: HALF_X, y: TOP, z: HALF_Z },
    { x: HALF_X + 1, y: TOP, z: HALF_Z },
  ],
  S: [
    { x: HALF_X - 1, y: TOP - 1, z: HALF_Z },
    { x: HALF_X, y: TOP - 1, z: HALF_Z },
    { x: HALF_X, y: TOP, z: HALF_Z },
    { x: HALF_X + 1, y: TOP, z: HALF_Z },
  ],
  O: [
    { x: HALF_X - 1, y: TOP - 1, z: HALF_Z },
    { x: HALF_X, y: TOP - 1, z: HALF_Z },
    { x: HALF_X - 1, y: TOP, z: HALF_Z },
    { x: HALF_X, y: TOP, z: HALF_Z },
  ],
  T: [
    { x: HALF_X, y: TOP - 1, z: HALF_Z },
    { x: HALF_X - 1, y: TOP, z: HALF_Z },
    { x: HALF_X, y: TOP, z: HALF_Z },
    { x: HALF_X + 1, y: TOP, z: HALF_Z },
  ],
};

export const SHAPE_NAMES = Object.keys(SHAPES);

/**
 * Rotates an offset a quarter turn about an axis.
 * `positive` picks the direction, matching the original Cube.transform().
 */
function rotateOffset({ x, y, z }, axis, positive) {
  switch (axis) {
    case 'x':
      return positive ? { x, y: z, z: -y } : { x, y: -z, z: y };
    case 'y':
      return positive ? { x: z, y, z: -x } : { x: -z, y, z: x };
    case 'z':
      return positive ? { x: -y, y: x, z } : { x: y, y: -x, z };
    default:
      throw new Error(`Unknown rotation axis: ${axis}`);
  }
}

export class Piece {
  constructor(shapeName, color) {
    this.shape = shapeName;
    this.color = color;
    this.cells = SHAPES[shapeName].map((c) => ({ ...c }));
  }

  /** Cells this piece would occupy after a one-cell step along `axis`. */
  movedBy(axis, delta) {
    return this.cells.map((c) => ({ ...c, [axis]: c[axis] + delta }));
  }

  /** Cells this piece would occupy after a quarter turn about `axis`. */
  rotated(axis, positive) {
    const anchor = this.cells[0];
    return this.cells.map((c) => {
      const offset = rotateOffset(
        { x: c.x - anchor.x, y: c.y - anchor.y, z: c.z - anchor.z },
        axis,
        positive,
      );
      return {
        x: offset.x + anchor.x,
        y: offset.y + anchor.y,
        z: offset.z + anchor.z,
      };
    });
  }

  /** Commits a previously validated set of cells. */
  setCells(cells) {
    this.cells = cells.map((c) => ({ ...c }));
  }
}
