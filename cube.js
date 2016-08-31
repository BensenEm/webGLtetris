

var cube = function (x, y, z, color){
  var x, y, z;
  if (x == undefined){
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.color = "transparent";
  }
  else {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
  }
  console.log('Instance created');
}
