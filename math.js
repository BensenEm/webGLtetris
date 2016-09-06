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
