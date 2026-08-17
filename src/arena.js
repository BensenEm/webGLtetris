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
 * Groups the occupied cells into 6-connected clusters, returning a label per
 * cell (-1 where empty) and the cluster count.
 *
 * Clusters are what settleFloating treats as rigid: cubes that touch face to
 * face came from the same piece or have since been welded to one by a
 * collapse, and they fall together rather than crumbling apart.
 */
function findClusters(arena) {
  const labels = new Int32Array(X_LEN * Y_LEN * Z_LEN).fill(-1);
  const at = (x, y, z) => (x * Y_LEN + y) * Z_LEN + z;
  const NEIGHBOURS = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];

  let count = 0;
  for (let x = 0; x < X_LEN; x++) {
    for (let y = 0; y < Y_LEN; y++) {
      for (let z = 0; z < Z_LEN; z++) {
        if (arena[x][y][z] === EMPTY || labels[at(x, y, z)] !== -1) continue;

        const label = count++;
        const stack = [[x, y, z]];
        labels[at(x, y, z)] = label;
        while (stack.length > 0) {
          const [cx, cy, cz] = stack.pop();
          for (const [dx, dy, dz] of NEIGHBOURS) {
            const nx = cx + dx;
            const ny = cy + dy;
            const nz = cz + dz;
            if (!isInside(nx, ny, nz)) continue;
            if (arena[nx][ny][nz] === EMPTY) continue;
            if (labels[at(nx, ny, nz)] !== -1) continue;
            labels[at(nx, ny, nz)] = label;
            stack.push([nx, ny, nz]);
          }
        }
      }
    }
  }
  return { labels, at, count };
}

/**
 * Drops every cluster that nothing holds up, repeating until the board is
 * stable, and returns the settled arena.
 *
 * A cluster is supported if it touches the floor or rests on a cluster that is
 * itself supported, so an overhang welded to the main stack stays where it is
 * and only genuinely floating clumps fall. Those clumps exist because a piece
 * locks as a rigid whole the moment any one of its cubes is blocked, which
 * leaves its other cubes hanging over empty columns; clearing a line can then
 * take away the stack they were attached to.
 */
export function settleFloating(arena) {
  let current = arena;

  // Every pass drops the floating clusters one cell, so the board cannot need
  // more passes than it is tall.
  for (let pass = 0; pass < Y_LEN; pass++) {
    const { labels, at, count } = findClusters(current);
    if (count === 0) return current;

    const supported = new Array(count).fill(false);
    // cluster -> clusters resting directly on it.
    const carries = Array.from({ length: count }, () => new Set());
    const queue = [];

    for (let x = 0; x < X_LEN; x++) {
      for (let y = 0; y < Y_LEN; y++) {
        for (let z = 0; z < Z_LEN; z++) {
          const label = labels[at(x, y, z)];
          if (label === -1) continue;
          if (y === 0) {
            if (!supported[label]) {
              supported[label] = true;
              queue.push(label);
            }
            continue;
          }
          const below = labels[at(x, y - 1, z)];
          // A cube of the same cluster below is not support, it is just the
          // cluster's own body.
          if (below !== -1 && below !== label) carries[below].add(label);
        }
      }
    }

    // Support spreads upwards from the grounded clusters.
    for (let i = 0; i < queue.length; i++) {
      for (const above of carries[queue[i]]) {
        if (supported[above]) continue;
        supported[above] = true;
        queue.push(above);
      }
    }

    if (supported.every(Boolean)) return current;

    // Moving a floating cluster down one cell is always safe: the cell below
    // each of its cubes is either empty or holds another floating cluster,
    // which this same pass moves down too. Anything solid down there would
    // have made the cluster supported.
    const next = createArena();
    for (let x = 0; x < X_LEN; x++) {
      for (let y = 0; y < Y_LEN; y++) {
        for (let z = 0; z < Z_LEN; z++) {
          const label = labels[at(x, y, z)];
          if (label === -1) continue;
          next[x][supported[label] ? y : y - 1][z] = current[x][y][z];
        }
      }
    }
    current = next;
  }
  return current;
}

/**
 * Per-cube movement between two states of the arena, for animating it.
 *
 * Returns one entry per surviving cube: `{ x, y, z, color, targetY }`, where
 * `y` is where it sits in `before` and `targetY` where it ends up in `after`.
 * Cubes that do not move are included too, since the caller rebuilds the whole
 * arena group from this list.
 *
 * Every move a collapse makes is straight down within one column and preserves
 * the cubes' order, so pairing the two columns off index by index identifies
 * each cube without having to track it through the transformation.
 */
export function fallsBetween(before, after) {
  const falls = [];
  for (let x = 0; x < X_LEN; x++) {
    for (let z = 0; z < Z_LEN; z++) {
      const from = [];
      const to = [];
      for (let y = 0; y < Y_LEN; y++) {
        if (before[x][y][z] !== EMPTY) from.push(y);
        if (after[x][y][z] !== EMPTY) to.push(y);
      }
      for (let i = 0; i < from.length && i < to.length; i++) {
        falls.push({
          x,
          y: from[i],
          z,
          color: before[x][from[i]][z],
          targetY: to[i],
        });
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
