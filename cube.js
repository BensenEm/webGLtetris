

var cube = function (x, y, z, color){
  // if (x == undefined){
  //   this.x = 0;
  //   this.y = 0;
  //   this.z = 0;
  //   this.color = "transparent";
  // }
  //else {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
  //}

  this.getX = function(){
    return this.x;
  }
  this.getY = function(){
    return this.y;
  }
  this.getZ = function(){
    return this.z;
  }
  console.log('Instance created');
}
