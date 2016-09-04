

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
  this.setX = function(value){
    this.x= value;
  }
  this.setY = function(value){
    this.y= value;
  }
  this.setZ = function(value){
    this.z = value;
  }
  console.log('Instance created');
}
