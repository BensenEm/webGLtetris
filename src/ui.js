// The HTML overlay: score readout, pause state and the game-over banner.

let scoreBox;
let gameOverText;

export function init() {
  scoreBox = document.getElementById('scoreBox');
  gameOverText = document.getElementById('gameOverText');
}

export function updateScore({ score, totalLines, level }) {
  scoreBox.innerHTML = `Score: ${score}<br>Lines: ${totalLines}<br>Level: ${level}`;
}

export function showGameOver() {
  gameOverText.hidden = false;
}

export function setPaused(paused) {
  document.body.classList.toggle('is-paused', paused);
}
