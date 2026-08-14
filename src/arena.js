// The arena grid and every operation that reads or rewrites it.
//
// The grid is indexed [x][y][z]; y is up. A cell holds either EMPTY or the
// colour number of the cube occupying it.

import { X_LEN, Y_LEN, Z_LEN, EMPTY } from './config.js';

export function createArena() {
  const arena = new Array(X_LEN);
  for (let x = 0; x < X_LEN; x++) {
    arena[x] = new Array(Y_LEN);
    for (let y = 0; y < Y_LEN; y++) {
      arena[x][y] = new Array(Z_LEN).fill(EMPTY);
    }
  }
  return arena;
}

export function copyArena(arena) {
  const copy = new Array(X_LEN);
  for (let x = 0; x < X_LEN; x++) {
    copy[x] = new Array(Y_LEN);
    for (let y = 0; y < Y_LEN; y++) {
      copy[x][y] = arena[x][y].slice();
    }
  }
  return copy;
}

export function isInside(x, y, z) {
  return x >= 0 && x < X_LEN && y >= 0 && y < Y_LEN && z >= 0 && z < Z_LEN;
}

/** True if the cell is inside the arena and not already occupied. */
export function isFree(arena, x, y, z) {
  return isInside(x, y, z) && arena[x][y][z] === EMPTY;
}

/** True if every one of the given cells is free. */
export function areCellsFree(arena, cells) {
  return cells.every((c) => isFree(arena, c.x, c.y, c.z));
}

/**
 * Finds every cell belonging to a completed line. A line is a full row along
 * x or along z at a single height, so the result is a set of individual cells
 * rather than whole planes.
 *
 * Returns `{ cells, lines }` where `cells` is deduplicated (a cell sitting at
 * the intersection of a completed x-row and a completed z-row appears once)
 * and `lines` is the number of completed rows, used for scoring.
 */
export function findCompletedLines(arena) {
  const cells = new Map(); // key -> {x, y, z}
  let lines = 0;

  const mark = (x, y, z) => {
    cells.set(`${x},${y},${z}`, { x, y, z });
  };

  for (let y = 0; y < Y_LEN; y++) {
    // Rows running along z
    for (let x = 0; x < X_LEN; x++) {
      let filled = 0;
      for (let z = 0; z < Z_LEN; z++) {
        if (arena[x][y][z] !== EMPTY) filled++;
      }
      if (filled === Z_LEN) {
        lines++;
        for (let z = 0; z < Z_LEN; z++) mark(x, y, z);
      }
    }

    // Rows running along x
    for (let z = 0; z < Z_LEN; z++) {
      let filled = 0;
      for (let x = 0; x < X_LEN; x++) {
        if (arena[x][y][z] !== EMPTY) filled++;
      }
      if (filled === X_LEN) {
        lines++;
        for (let x = 0; x < X_LEN; x++) mark(x, y, z);
      }
    }
  }

  return { cells: [...cells.values()], lines };
}

/** Returns a copy of `arena` with the given cells emptied, nothing collapsed. */
export function withCellsCleared(arena, cells) {
  const next = copyArena(arena);
  for (const { x, y, z } of cells) {
    next[x][y][z] = EMPTY;
  }
  return next;
}

/**
 * Returns a copy of `arena` with the given cells removed and everything above
 * them dropped down to close the gaps.
 *
 * Each (x, z) column is repacked in one pass: surviving cubes keep their
 * relative order and settle at the bottom. The original shifted one cell at a
 * time in an order derived from a sorted set, which both skipped the top row
 * (`i < yLen - 2`) and collapsed upper rows before lower ones when a single
 * column contained two completed rows.
 */
/**
 * The same collapse expressed as per-cube movement, for animating it.
 *
 * Returns one entry per surviving cube: `{ x, y, z, color, targetY }`, where
 * `y` is where it sits now and `targetY` where the collapse puts it. Cubes
 * that do not move are included too, since the caller rebuilds the whole
 * arena group from this list.
 */
export function collapseFalls(arena, cells) {
  const clearedByColumn = new Map(); // "x,z" -> Set of y
  for (const { x, y, z } of cells) {
    const key = `${x},${z}`;
    if (!clearedByColumn.has(key)) clearedByColumn.set(key, new Set());
    clearedByColumn.get(key).add(y);
  }

  const falls = [];
  for (let x = 0; x < X_LEN; x++) {
    for (let z = 0; z < Z_LEN; z++) {
      const cleared = clearedByColumn.get(`${x},${z}`);
      let write = 0;
      for (let y = 0; y < Y_LEN; y++) {
        if (cleared?.has(y)) continue;
        // `write` tracks the same repacking collapseCells performs, so a cube
        // falls by however many cleared rows sat below it in its column.
        const targetY = write++;
        const color = arena[x][y][z];
        if (color !== EMPTY) falls.push({ x, y, z, color, targetY });
      }
    }
  }
  return falls;
}

export function collapseCells(arena, cells) {
  const clearedByColumn = new Map(); // "x,z" -> Set of y
  for (const { x, y, z } of cells) {
    const key = `${x},${z}`;
    if (!clearedByColumn.has(key)) clearedByColumn.set(key, new Set());
    clearedByColumn.get(key).add(y);
  }

  const next = createArena();
  for (let x = 0; x < X_LEN; x++) {
    for (let z = 0; z < Z_LEN; z++) {
      const cleared = clearedByColumn.get(`${x},${z}`);
      let write = 0;
      for (let y = 0; y < Y_LEN; y++) {
        if (cleared?.has(y)) continue;
        next[x][write++][z] = arena[x][y][z];
      }
      // Remaining cells above `write` stay EMPTY from createArena().
    }
  }
  return next;
}
