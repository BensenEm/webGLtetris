// Bootstrap and the animation loop.

import * as render from './render.js';
import * as game from './game.js';
import * as ui from './ui.js';
import * as input from './input.js';
import * as audio from './audio.js';

function loop(now) {
  requestAnimationFrame(loop);
  game.update(now);
  render.render(now);
}

function main() {
  render.init('frame');
  ui.init();
  input.init();
  audio.init();
  ui.onRestart(game.restart);
  game.start();
  requestAnimationFrame(loop);
}

main();
