// Device capability flags.
//
// iOS Safari and iOS Chrome are both WebKit, so a problem in one appears in
// the other; the flag below is about the engine, not the browser.

/**
 * iPhone/iPad, including iPadOS, which reports itself as a Mac and is only
 * distinguishable by having a touchscreen.
 */
export const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isMobile =
  isIOS || /Android/.test(navigator.userAgent) || navigator.maxTouchPoints > 1;

/**
 * `?env=on` / `?env=off` forces the image-based lighting path on or off, so the
 * iOS workaround can be checked against the real device rather than guessed at.
 * Returns null when unset, meaning "decide automatically".
 */
export function envOverride() {
  const value = new URLSearchParams(location.search).get('env');
  if (value === 'on') return true;
  if (value === 'off') return false;
  return null;
}
