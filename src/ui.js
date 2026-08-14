// The HTML overlay: score readout, pause state and the game-over banner.

let scoreBox;
let gameOverBox;
let restartButton;

export function init() {
  scoreBox = document.getElementById('scoreBox');
  gameOverBox = document.getElementById('gameOverBox');
  restartButton = document.getElementById('restartButton');
}

export function updateScore({ score, totalLines, level }) {
  scoreBox.innerHTML = `Score: ${score}<br>Lines: ${totalLines}<br>Level: ${level}`;
}

export function showGameOver() {
  gameOverBox.hidden = false;
  // Focus so the button can be triggered straight from the keyboard, and so
  // it is obvious where the game handed control back to the player.
  restartButton.focus();
}

export function hideGameOver() {
  gameOverBox.hidden = true;
  // Otherwise the still-focused button swallows Space as a click.
  restartButton.blur();
}

export function onRestart(handler) {
  restartButton.addEventListener('click', handler);
}

export function setPaused(paused) {
  document.body.classList.toggle('is-paused', paused);
}
