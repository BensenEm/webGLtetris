var stone = function (type, col){
  this.cubeList = new Array();
  this.col = col;
  this.bewegen = function(axis, direction){
     for (var i = 0; i <4; i++){
       var x= this.cubeList[i].getX();
       var y= this.cubeList[i].getY();
       var z= this.cubeList[i].getZ();
       if (direction == true){
         switch(axis){
           case("x"):
            this.cubeList[i].setX (x+ 1);
            break;
           case("y"):
            this.cubeList[i].setY (y+1);
            break;
           case("z"):
            this.cubeList[i].setZ(z+1);
        }
       }
       else {
         switch(axis){
           case("x"):
            this.cubeList[i].setX (x-1);
            break;
           case("y"):
            this.cubeList[i].setY (y-1);
            break;
           case("z"):
            this.cubeList[i].setZ(z-1);
        }
      }
    }
    if (!this.insideArena() || !this.cubeFree()){
      this.bewegen(axis, !direction);
      //Make Sound here
    }
  }
  this.insideArena = function (){
    var withinArena = true;
    for (var i = 0; i < 4; i++){
      if ((this.cubeList[i].x >= 0 && this.cubeList[i].x < xLen) &&
         (this.cubeList[i].y >= 0 && this.cubeList[i].y < yLen) &&
         (this.cubeList[i].z >= 0 && this.cubeList[i].z < zLen))
         {continue;}
      else withinArena = false;
    }
    return withinArena;
  }
  this.cubeFree = function (){
    var cubeFree = true;
    for (var i = 0; i < 4; i++){
      var x= this.cubeList[i].x;
      var y= this.cubeList[i].y;
      var z= this.cubeList[i].z;
      if (arena[x][y][z] !== "transparent"){
        cubeFree = false;
      }
    }
    return cubeFree;
  }

  switch (type){
    case (1):
      this.cubeList.push(new cube((xLen/2) - 1, yLen-1, zLen / 2, col));
      this.cubeList.push(new cube((xLen / 2), yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) + 2, yLen-1, zLen / 2, col));
      break;

    case (2):
      this.cubeList.push(new cube((xLen / 2) - 1, yLen - 2, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) - 1, yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen / 2, col));
			break;

    case (3):
      this.cubeList.push(new cube((xLen / 2) - 1, yLen - 2, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2), yLen - 2, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen / 2, col));
			break;

    case (4):
      this.cubeList.push(new cube((xLen / 2) - 1, yLen - 2, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2), yLen - 2, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) - 1, yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen / 2, col));
			break;

    case (5):
      this.cubeList.push(new cube((xLen / 2), yLen - 2, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) - 1, yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen / 2, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen / 2, col));
      break;

    default:
  }
}
