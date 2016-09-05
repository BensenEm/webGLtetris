

var cube = function (x, y, z, cole){
    this.x = x;
    this.y = y;
    this.z = z;
    this.cFarbe = cole ;

  this.getX = function(){
    return this.x;
  }
  this.getY = function(){
    return this.y;
  }
  this.getZ = function(){
    return this.z;
  }
  this.setX = function(value){
    this.x= value;
  }
  this.setY = function(value){
    this.y= value;
  }
  this.setZ = function(value){
    this.z = value;
  }
  this.transform = function(axis, direction, anker){
    var diff = {
      x: this.x - anker.x,
      y: this.y - anker.y,
      z: this.z - anker.z
    }
    var temp = {
      x: this.x - anker.x,
      y: this.y - anker.y,
      z: this.z - anker.z
    }
    if (axis == "x" && direction === true){
      diff.y = diff.z;
      diff.z = temp.y *(-1);
    }
    else if (axis == "x" && direction === false) {
      diff.y = -1* diff.z;
      diff.z = temp.y;
    }
    else if (axis == "y" && direction === true){
      diff.x = diff.z;
      diff.z = -1 * temp.x;
    }
    else if (axis == "y" && direction === false){
      diff.x = -1 * diff.z;
      diff.z = temp.x;
    }
    else if (axis == "z" && direction === true){
      diff.y = diff.x;
      diff.x = -1 * temp.y;
    }
    else {
      diff.y = -1 * diff.x;
      diff.x = temp.y;
    }
    console.log(diff);
    return diff;

  }
  console.log('Instance created');
}
