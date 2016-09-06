var currentlyPressedKeys = {};
    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
        if (String.fromCharCode(event.keyCode) == "R") {
            falling.turn("x", true);
            console.log("R pressed");
        }
        if (String.fromCharCode(event.keyCode) == "E") {
            falling.turn("x", !true);
            console.log("E pressed");
        }
        if (String.fromCharCode(event.keyCode) == "F") {
            falling.turn("y", true);
            console.log("F pressed");
        }
        if (String.fromCharCode(event.keyCode) == "D") {
            falling.turn("y", !true);
            console.log("D pressed");
        }
        if (String.fromCharCode(event.keyCode) == "V") {
            falling.turn("z", true);
            console.log("V pressed");
        }
        if (String.fromCharCode(event.keyCode) == "C") {
            falling.turn("z", !true);
            console.log("C pressed");
        }

        if (String.fromCharCode(event.keyCode) == "I") {
            falling.bewegen("z", !true);
            console.log("I pressed");
        }
        if (String.fromCharCode(event.keyCode) == "K") {
            falling.bewegen("z", true);
            console.log("K pressed");
        }
        if (String.fromCharCode(event.keyCode) == "J") {
            falling.bewegen("x", !true);
            console.log("J pressed");
        }
        if (String.fromCharCode(event.keyCode) == "L") {
            falling.bewegen("x", true);
            console.log("L pressed");
        }
        if (String.fromCharCode(event.keyCode) == " ") {
            falling.drop();
            console.log("SPACE pressed");
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
