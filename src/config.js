// Static tuning values for the game. Nothing here changes at runtime.

/** Arena dimensions in cells. */
export const X_LEN = 6;
export const Y_LEN = 12;
export const Z_LEN = 6;

/**
 * Edge length of a single cube in world units. Everything else that has a size
 * is derived from this, so the board can be scaled by changing it alone.
 */
export const CUBE_DIM = 70;

/** World height of the top surface of the arena's floor slab. */
export const FLOOR_TOP = -CUBE_DIM / 2;

/** Marker for an empty arena cell. Occupied cells hold a colour number. */
export const EMPTY = null;

/**
 * Camera presets, cycled with the "a" key. Expressed in cube widths so they
 * keep framing the board if CUBE_DIM changes.
 */
export const CAMERA_VIEWS = [
  // Eye level, aimed at the middle of the stack. The board is turned 45
  // degrees, so its near corner reaches well towards the camera and needs
  // clearance beyond what the column's height alone suggests.
  {
    position: [0, 6.5 * CUBE_DIM, 11.5 * CUBE_DIM],
    target: [0, 4.5 * CUBE_DIM, 0],
  },
  // High and looking down into the well.
  {
    position: [0, 13 * CUBE_DIM, 3 * CUBE_DIM],
    target: [0, 0, -3 * CUBE_DIM],
  },
];

/**
 * Whole-arena rotation, the "q" and "a" keys.
 *
 * The board turns an eighth at a time, so it alternates between resting
 * corner-on to the camera (where the grid axes read as screen diagonals) and
 * face-on (where they line up with the screen). Both give the direction keys an
 * unambiguous meaning; only the control frame, ARENA_STEPS / 2 of these apart,
 * has to stay quantised.
 */
export const ARENA_STEPS = 8;
export const ARENA_STEP_RADIANS = (Math.PI * 2) / ARENA_STEPS;

/** Frames the eased turn runs for. Half the arc as before, and quicker. */
export const ARENA_TURN_FRAMES = 4;

/** Timeline for the line-clear flash, in milliseconds. */
export const CLEAR_FLASH_INTERVAL = 500;
export const CLEAR_FLASH_COUNT = 5;

/**
 * Collapse animation: how long a cube takes to fall one cell into the gap a
 * cleared line left behind. Cubes with further to fall simply take longer.
 */
export const COLLAPSE_MS_PER_CELL = 70;

/** Game-over animation: delay between hiding successive cubes. */
export const GAME_OVER_STEP_MS = 100;

/**
 * Grace period once a piece has nothing left to fall onto, so it can still be
 * slid and turned after touching down. Moving or rotating restarts it.
 */
export const LOCK_DELAY_MS = 1500;

/**
 * How many times that grace period may be restarted before the piece locks
 * regardless. Without a cap, a piece that can keep shuffling along the floor
 * never locks and the game can be stalled forever.
 */
export const MAX_LOCK_RESETS = 10;
