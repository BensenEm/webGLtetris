function stone (type, col){
  this.cubeList = new Array();
  this.farbe = col;
  this.bewegen = function (axis, direction){
      if (direction === true){
        for (var i = 0; i <4; i++){
          var x= this.cubeList[i].x;
          var y= this.cubeList[i].y;
          var z= this.cubeList[i].z;

          switch(axis){
           case("x"):
            this.cubeList[i].setX (x+ 1);
            break;
           case("y"):
            this.cubeList[i].setY (y+1);
            break;
           case("z"):
            this.cubeList[i].setZ(z+1);
            break;
          }
        }
      }
      else {
        for(var i=0;i<4;i++){
          var x= this.cubeList[i].getX();
          var y= this.cubeList[i].getY();
          var z= this.cubeList[i].getZ();

          switch(axis){
           case("x"):
            this.cubeList[i].setX (x-1);
            break;
           case("y"):
            this.cubeList[i].setY (y-1);
            break;
           case("z"):
            this.cubeList[i].setZ (z-1);
            break;
          }
        }
      }

      console.log(this.cubeFree());

      if (!this.cubeFree()){
        for (var i =0; i <4; i++){
          if (direction == true){
            switch(axis){
              case("x"):
                this.cubeList[i].x-=1;
                break;
              case("y"):
                this.cubeList[i].y-=1;
                break;
              case("z"):
                this.cubeList[i].z-=1;
                break;
            }
          }
          else{
            switch(axis){
              case("x"):
                this.cubeList[i].x+=1;
                break;
              case("y"):
                this.cubeList[i].y+=1;
                break;
              case("z"):
                this.cubeList[i].z+=1;
                break;
            }
          }
        }
      }


  }
  this.copyInArena = function (){
    for (var i = 0; i < 4; i++){
      //arena[this.cubeList[i].x][this.cubeList[i].y][this.cubeList[i].z] = this.farbe;
      var a = this.cubeList[i].x;
      var b = this.cubeList[i].y;
      var c = this.cubeList[i].z;
      arena[a][b][c]= this.farbe;
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
    if (!this.insideArena()) return false;
    var cubeFree = true;
    for (var i = 0; i < 4; i++){
      var x= this.cubeList[i].x;
      var y= this.cubeList[i].y;
      var z= this.cubeList[i].z;
      if (arena[x][y][z] !== 1){
        cubeFree = false;
      }
    }
    return cubeFree;
  }
  this.drop = function (){
    for (var i=0; i < 4; i++){
      this.cubeList[i].y -=1;
    }
    if (!this.cubeFree()){
      for( var i= 0; i < 4; i++){
         this.cubeList[i].y +=1;
      }
    }
    console.log("dropped");
  }
  this.turn = function (axis, direction){
    var anker = new cube(this.cubeList[0].x, this.cubeList[0].y, this.cubeList[0].z, this.farbe);
    console.log(anker);
    for (var i=0; i<4; i++){
      var diff = this.cubeList[i].transform(axis, direction, anker); //MACHE TRANSFORM
      this.cubeList[i].x = diff.x + anker.x;
      this.cubeList[i].y = diff.y + anker.y;
      this.cubeList[i].z = diff.z + anker.z;
    }
    if (this.cubeFree() == false){
      this.turn(axis, !direction);
    }
  }
  //this.prototype = function(){
    switch (type){
    case (1):
      this.cubeList.push(new cube(xLen/2 - 1, yLen-1, zLen-1 , col));
      this.cubeList.push(new cube(xLen/2, yLen-1, zLen-1, col));
			this.cubeList.push(new cube(xLen/2 + 1, yLen-1, zLen-1, col));
			this.cubeList.push(new cube(xLen/2 + 2, yLen-1, zLen-1, col));
      break;

    case (2):
      this.cubeList.push(new cube((xLen / 2) - 1, yLen - 2, zLen-1 , col));
			this.cubeList.push(new cube((xLen / 2) - 1, yLen-1, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen-1, col));
			break;

    case (3):
      this.cubeList.push(new cube((xLen / 2) - 1, yLen - 2, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2), yLen - 2, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen-1, col));
			break;

    case (4):
      this.cubeList.push(new cube((xLen / 2) - 1, yLen - 2, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2), yLen - 2, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2) - 1, yLen-1, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen-1, col));
			break;

    case (5):
      this.cubeList.push(new cube((xLen / 2), yLen - 2, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2) - 1, yLen-1, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2), yLen-1, zLen-1, col));
			this.cubeList.push(new cube((xLen / 2) + 1, yLen-1, zLen-1, col));
      break;

    default:
  }
  //}
}
