// Level definitions: drop speed, palette, score threshold and multiplier.

const LEVELS = [
  {
    dropTime: 2000,
    colors: [0xffff99, 0xff3366, 0xcc9966, 0x333366, 0x993366],
    thresholdScore: 199,
    scoreMultiplier: 1,
  },
  {
    dropTime: 1600,
    colors: [0x9397a4, 0xcad0e2, 0xcd97ff, 0x95b9ff, 0x7bddff],
    thresholdScore: 399,
    scoreMultiplier: 1.5,
  },
  {
    dropTime: 1200,
    colors: [0x195037, 0x0c6e38, 0x1fb33c, 0xbb7e27, 0xefbb29],
    thresholdScore: 599,
    scoreMultiplier: 2,
  },
  {
    dropTime: 800,
    colors: [0xd65454, 0xfdf8dc, 0x9c9c9c, 0x5b5867, 0xea6363],
    thresholdScore: 799,
    scoreMultiplier: 2,
  },
  {
    dropTime: 600,
    colors: [0xaaf455, 0xe9fd4a, 0xfbca32, 0xff8100, 0x874400],
    thresholdScore: 999,
    scoreMultiplier: 3,
  },
  {
    dropTime: 400,
    colors: [0xa0d29e, 0x91b09d, 0x729485, 0x487463, 0x225149],
    thresholdScore: 1199,
    scoreMultiplier: 3,
  },
];

const FINAL_LEVEL = {
  dropTime: 200,
  colors: [0xff94e6, 0xff76a0, 0xd6ff7e, 0xc3fb00, 0x9dfb00],
  thresholdScore: Infinity,
  scoreMultiplier: 3,
};

/**
 * Returns the definition for a 1-based level number. Levels past the last
 * defined one all use the final (fastest) configuration.
 */
export function getLevel(level) {
  return LEVELS[level - 1] ?? FINAL_LEVEL;
}

/**
 * Advances past every threshold the score has crossed, not just one.
 * The original only ever incremented a single level per line clear.
 */
export function levelForScore(currentLevel, score) {
  let level = currentLevel;
  while (score > getLevel(level).thresholdScore) {
    level += 1;
  }
  return level;
}
