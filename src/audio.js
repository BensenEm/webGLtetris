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

/** Toggles music. Must be called from a user gesture the first time. */
export function toggleMusic() {
  ensureLoaded();
  if (playing) {
    music.pause();
    playing = false;
    return false;
  }
  music.play().catch(() => {
    // Autoplay policies can still refuse; leave the state consistent.
    playing = false;
  });
  playing = true;
  return true;
}

export function init() {
  const button = document.getElementById('soundButton');
  button?.addEventListener('click', () => {
    const on = toggleMusic();
    button.classList.toggle('is-on', on);
  });
}
