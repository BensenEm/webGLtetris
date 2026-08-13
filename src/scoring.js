// Score awarded for clearing `lines` rows at once, scaled by the level.

function bonusFor(lines) {
  if (lines <= 1) return 1;
  if (lines <= 3) return 1.5;
  if (lines <= 7) return 2;
  return 3;
}

export function scoreForLines(lines, scoreMultiplier) {
  return 10 * bonusFor(lines) * lines * scoreMultiplier;
}
