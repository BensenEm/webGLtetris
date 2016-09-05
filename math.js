function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeIterator (array){
  var nextIndex = 0;
  return {
    next: function(){
      return nextIndex < array.length ?
        {value: array[nextIndex++], done:false} :
        {done: true};
    }
  }
}

function printArena(slice){
  var line;
  for (var i = 11; i >= 0; i--){
    line ="";
    for (var j = 0; j < xLen; j ++){
      if (arena[j][i][slice] == 1){
        line += "T ";
      }
      else {
         line += arena[j][i][slice];
         line += " ";
     }
    }
    console.log(line);
  }
}
