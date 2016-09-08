function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// paints black over everything
function clear(){
  for (var i = 0; i < xLen; i++){
    for (var j = 0; j < yLen; j++){
      for (var k = 0; k < zLen; k++){
        putCube(i,j,k, 0, true);
      }
    }
  }
}
function returnSmaller(one, two){
  if (one.x < two.x) return -1;
  if (one.x > two.x) return 1;
  if (one.y < two.y) return -1;
  if (one.y > two.y) return 1;
  if (one.z < two.z) return -1;
  if (one.z > two.z) return 1;
  return 0;
}

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
