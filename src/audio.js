// Background music toggle. Replaces the CDN SoundJS dependency, which existed
// to play a single mp3.

import musicUrl from '../sounds/music.mp3';

let music;
let playing = false;

function ensureLoaded() {
  if (music) return;
  music = new Audio(musicUrl);
  music.loop = true;
  music.volume = 0.5;
  music.currentTime = 4; // The original skipped the first 4 seconds.
}

/**
 * Toggles music. Must be called from a user gesture the first time, which the
 * "1" key and the on-screen keycap both are.
 */
export function toggleMusic() {
  ensureLoaded();
  if (playing) {
    music.pause();
    playing = false;
  } else {
    music.play().catch(() => {
      // Autoplay policies can still refuse; leave the state consistent.
      playing = false;
      syncButton();
    });
    playing = true;
  }
  syncButton();
  return playing;
}

/** Keeps the keycap's lit state matching whether music is actually on. */
function syncButton() {
  document
    .querySelector('[data-key="Digit0"]')
    ?.classList.toggle('is-active', playing);
}

export function init() {
  // Nothing to wire: the keycap goes through input.dispatch like every other
  // key, so the click and the "1" key share one path.
}
