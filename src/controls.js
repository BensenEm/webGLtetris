// The on-screen keyboard in the left column. It is the control legend and a
// working input device at once: each keycap carries the `event.code` it stands
// for in `data-key`, so wiring it is just a lookup table over the DOM.

import * as input from './input.js';

/** event.code -> keycap element. */
const caps = new Map();

/** How long a clicked cap stays lit, since there is no matching keyup. */
const CLICK_FLASH_MS = 120;

function press(code) {
  caps.get(code)?.classList.add('is-down');
}

function release(code) {
  caps.get(code)?.classList.remove('is-down');
}

export function init() {
  // Both the pad beside the board and the session controls in the corner.
  for (const cap of document.querySelectorAll('.key')) {
    const code = cap.dataset.key;
    // A cap held open for an action the game does not have yet carries no
    // code; it is a placeholder, not an input.
    if (!code) continue;
    caps.set(code, cap);

    cap.addEventListener('click', () => {
      input.dispatch(code);
      // Otherwise the cap keeps focus and the next Space press activates it
      // again on top of the game's own Space handling.
      cap.blur();
      press(code);
      setTimeout(() => release(code), CLICK_FLASH_MS);
    });
  }

  // Mirror real key presses onto the caps. These run alongside input.js's own
  // listener rather than through it — highlighting is presentation, and it
  // should light up even for a key the game currently ignores.
  document.addEventListener('keydown', (event) => press(event.code));
  document.addEventListener('keyup', (event) => release(event.code));
  // A key held while the tab loses focus never delivers its keyup.
  window.addEventListener('blur', () => {
    for (const code of caps.keys()) release(code);
  });
}
