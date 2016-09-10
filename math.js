//Radom Int Generator
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//takes in an Array and returns as ordered Set
function makeSet(myList){
  var newSet = myList.sort(returnSmaller);
  for (var i=0; i< newSet.length-1; i++){
    if (returnSmaller(newSet[i], newSet[i+1]) === 0){
      newSet.splice(i+1,1);
      i=i-1;
    }
  }
  return newSet;
}
  //indicates order of parameters (Cubes/ Vector3)
  function returnSmaller(one, two){
    if (one.x < two.x) return -1;
    if (one.x > two.x) return 1;
    if (one.y < two.y) return -1;
    if (one.y > two.y) return 1;
    if (one.z < two.z) return -1;
    if (one.z > two.z) return 1;
    return 0;
  }

// returns CopyByValue of a
function copyArena(a){
  var newArena = new Array(xLen);
  for (var i = 0; i < xLen; i++){
    newArena[i]= new Array(yLen);
    for (var j = 0; j < yLen; j++){
      newArena[i][j]= new Array(zLen);
      for (var k = 0; k < zLen; k++){
        newArena[i][j][k] = a[i][j][k];
      }
    }
  }
  return newArena;
}

//updates the Helpstones Coordinates
function updateHelpstone(){
  falling.helpstoneList.length = 0;
  disToFloor = yLen-1;
  for (var i= 0; i < 4; i++){

    var x = falling.cubeList[i].x;
    var y = falling.cubeList[i].y;
    var z = falling.cubeList[i].z;
  //  console.log(x,y,z);
    falling.helpstoneList.push(new Cube(x, y, z, 0xffffff));
  }
  distanceToFloor();
  for (var i = 0; i < 4; i++) {
    falling.helpstoneList[i].y -= disToFloor;
  }
}
  //updates distance between FALLING and lowest possible position
  function distanceToFloor() {
    for (var i= 0; i<4; i++){
      var f = 0;
      var x = falling.cubeList[i].x;
      var z = falling.cubeList[i].z;
      var y = falling.cubeList[i].y;
      for (var j = y-1 ; j >= 0; j--) {
        if (arena[x][j][z] === 1) {
          f++;
        }
        else break;
      }
      if (f < disToFloor) {
        disToFloor = f;
      }
    }
  }
