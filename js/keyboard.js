var currentlyPressedKeys = {};
function handleKeyDown(event) {
  if(!stateGameOver){
  currentlyPressedKeys[event.keyCode] = true;
  if (String.fromCharCode(event.keyCode) == "R") {
    switch (arenaPos) {
      case 0:
      falling.turn("x", true);
      break;
      case 1:
      falling.turn("z", false);
      break;
      case 2:
      falling.turn("x", false);
      break;
      case 3:
      falling.turn("z", true);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "E") {
    switch (arenaPos) {
      case 0:
      falling.turn("x", false);
      break;
      case 1:
      falling.turn("z", true);
      break;
      case 2:
      falling.turn("x", true);
      break;
      case 3:
      falling.turn("z", false);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "F") {
    falling.turn("y", true);
  }
  if (String.fromCharCode(event.keyCode) == "D") {
    falling.turn("y", !true);
  }
  if (String.fromCharCode(event.keyCode) == "V") {
    switch (arenaPos) {
      case 0:
      falling.turn("z", true);
      break;
      case 1:
      falling.turn("x", true);
      break;
      case 2:
      falling.turn("z", false);
      break;
      case 3:
      falling.turn("x", false);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "C") {
    //falling.turn("z", !true);
    switch (arenaPos) {
      case 0:
      falling.turn("z", false);
      break;
      case 1:
      falling.turn("x", false);
      break;
      case 2:
      falling.turn("z", true);
      break;
      case 3:
      falling.turn("x", true);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "I") {
    switch (arenaPos) {
      case 0:
      falling.bewegen("z", false);
      break;
      case 1:
      falling.bewegen("x", true);
      break;
      case 2:
      falling.bewegen("z", true);
      break;
      case 3:
      falling.bewegen("x", false);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "K") {
    switch (arenaPos) {
      case 0:
      falling.bewegen("z", true);
      break;
      case 1:
      falling.bewegen("x", false);
      break;
      case 2:
      falling.bewegen("z", false);
      break;
      case 3:
      falling.bewegen("x", true);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "J") {
    switch (arenaPos) {
      case 0:
      falling.bewegen("x", false);
      break;
      case 1:
      falling.bewegen("z", false);
      break;
      case 2:
      falling.bewegen("x", true);
      break;
      case 3:
      falling.bewegen("z", true);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == "L") {
    switch (arenaPos) {
      case 0:
      falling.bewegen("x", true);
      break;
      case 1:
      falling.bewegen("z", true);
      break;
      case 2:
      falling.bewegen("x", false);
      break;
      case 3:
      falling.bewegen("z", false);
      break;
      default:
    }
  }
  if (String.fromCharCode(event.keyCode) == " ") {
    if(stateDeleting===true){
      return;
    }
    falling.drop();
  }

  if (String.fromCharCode(event.keyCode) == "P") {
    statePause = !statePause;
    console.log("PAUSE");
  }
  if (String.fromCharCode(event.keyCode) == "Q") {
    if (stateTurning==true) {
      return;
    }
    stateTurning=true;
    arenaPos=(arenaPos+1)%4;
    console.log(arenaPos);

  }
  if (String.fromCharCode(event.keyCode) == "A") {
    toggleCameraView();
  }
  if (String.fromCharCode(event.keyCode) == "Y") {
    console.log("Midarena2 ", midArena );
  }
  // if else (String.fromCharCode(event.keyCode) == "???") {
  //     falling.turn("x", !true);
  //     console.log("E pressed");
  // }
  // if else (String.fromCharCode(event.keyCode) == "???") {
  //     falling.turn("x", !true);
  //     console.log("E pressed");
  // }
  // if else (String.fromCharCode(event.keyCode) == "???") {
  //     falling.turn("x", !true);
  //     console.log("E pressed");
  // }
}
}
function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}
function handleKeys() {
  if (currentlyPressedKeys[33]) {
    // Page Up
    z -= 0.05;
  }
  if (currentlyPressedKeys[34]) {
    // Page Down
    z += 0.05;
  }
  if (currentlyPressedKeys[37]) {
    // Left cursor key
    falling.bewegen("x", !true);
  }
  if (currentlyPressedKeys[39]) {
    // Right cursor key
    falling.bewegen("x", true);
  }
  if (currentlyPressedKeys[38]) {
    // Up cursor key
    falling.bewegen("z", !true);
  }
  if (currentlyPressedKeys[40]) {
    // Down cursor key
    falling.bewegen("z", true);
  }
}
