
function Stone (type, col){
  this.disToFloor;
  this.cubeList = new Array();
  this.Object = fallingObj;
  this.Help =  helpObj;
  this.helpstoneList = new Array();
  this.farbe = col;
  this.bewegen = function (axis, direction){
      if (direction === true){
        for (var i = 0; i <memberCount; i++){
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
        for(var i=0;i<memberCount;i++){
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
      if (!this.cubeFree()){
        for (var i =0; i <memberCount; i++){
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
    this.updateObjPos();
    updateHelpstone();
  }
  this.copyInArena = function (){
    var a, b, c;
    for (var i = 0; i < memberCount; i++){
      a = this.cubeList[i].x;
      b = this.cubeList[i].y;
      c = this.cubeList[i].z;
      oldArena[a][b][c]= this.farbe;
    }
    for (var i = memberCount-1; i>=0; i--){
    fallingObj.remove(fallingObj.children[i]);
    }
  }
  this.insideArena = function (){
    var withinArena = true;
    for (var i = 0; i < memberCount; i++){
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
    for (var i = 0; i < memberCount; i++){
      var x= this.cubeList[i].x;
      var y= this.cubeList[i].y;
      var z= this.cubeList[i].z;
      if (oldArena[x][y][z] !== 1){
        cubeFree = false;
      }
    }
    return cubeFree;
  }
  this.drop = function (){
    for (var i=0; i < memberCount; i++){
      this.cubeList[i].y -=1;
    }
    if (this.cubeFree()){
      this.updateObjPos();
      updateHelpstone();

    }
    else{
      for( var i= 0; i < memberCount; i++){
         this.cubeList[i].y +=1;
      }
      this.copyInArena();
      var init = deleteCompletedLines();
      updateArena(arOld, oldArena);
      console.log("init", init);
      if (init === true){
        initFalling();
      }
    }
  }

  this.turn = function (axis, direction){
    var anker = new Cube(this.cubeList[0].x, this.cubeList[0].y, this.cubeList[0].z, this.farbe);
    for (var i=0; i<memberCount; i++){
      var diff = this.cubeList[i].transform(axis, direction, anker); //MACHE TRANSFORM
      this.cubeList[i].x = diff.x + anker.x;
      this.cubeList[i].y = diff.y + anker.y;
      this.cubeList[i].z = diff.z + anker.z;
    }
    if (this.cubeFree() == false){
      this.turn(axis, !direction);
    }
    this.updateObjPos();
    updateHelpstone();
  }

  //this.mat = new THREE.MeshNormalMaterial( { color: this.farbe, wireframe: false } );
  this.mat = new THREE.MeshPhongMaterial( { color: 0x324575, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } )

  this.makeCube = function (pos){
    mesh = new THREE.Mesh( geo, this.mat );
    //meshW = new THREE.Mesh (geo, matWa);
    //meshW.position.set(this.cubeList[pos].x *cubeDim, this.cubeList[pos].y*cubeDim, this.cubeList[pos].z*cubeDim);
    mesh.position.set(this.cubeList[pos].x *cubeDim, this.cubeList[pos].y*cubeDim, this.cubeList[pos].z*cubeDim);
    //this.Object.add (meshW);
    this.Object.add (mesh);
  }
  this.makeHelpCube = function (pos){
    mesh = new THREE.Mesh( geo, matWa);
    //meshW = new THREE.Mesh (geo, matWa);
    //meshW.position.set(this.cubeList[pos].x *cubeDim, this.cubeList[pos].y*cubeDim, this.cubeList[pos].z*cubeDim);
    mesh.position.set(this.helpstoneList[pos].x *cubeDim, this.helpstoneList[pos].y*cubeDim, this.helpstoneList[pos].z*cubeDim);
    //this.Object.add (meshW);
    this.Help.add (mesh);
  }
  //Turns Fallingstone into Datastructure THREE.Object3D
  this.makeObj = function (){
    var childrenCount= this.Object.children.length;
    if (this.Object.children.length !== 0) {
      this.removeObjs(childrenCount, "fal");
    }
    if (this.Help.children.length!=0){
      this.removeObjs(childrenCount, "hel");
    }
    for(var i=0; i<memberCount; i++){
      this.makeCube(i);
      this.makeHelpCube(i);
    }
  }

  this.removeObjs = function (amount, who){
    for(var i=amount-1; i>=0; i--){
      switch (who) {
        case "fal": this.Object.remove(this.Object.children[i]);
          break;
        case "hel": this.Help.remove(this.Help.children[i]);
          break;
      }
    }
  }

  this.updateObjPos = function (){
    childrenCount= this.Object.children.length;
    console.log(childrenCount);
    for (var i =0; i < childrenCount; i++){
      var x = this.cubeList[i].x;
      var y = this.cubeList[i].y;
      var z = this.cubeList[i].z;
      //var j = 2*i;
      this.Object.children[i].position.set(x*cubeDim, y* cubeDim, z* cubeDim);
      //this.Object.children[j+1].position.set(x*cubeDim, y* cubeDim, z* cubeDim);

    }
  }

  this.updateHelpObjPos = function (){
    console.log("HELPSTONE CHILDREN",this.Help.children);
    childrenCount= this.Help.children.length;
    debugger;
    for (var i =0; i < memberCount; i++){
      var x = this.helpstoneList[i].x;
      var y = this.helpstoneList[i].y;
      var z = this.helpstoneList[i].z;
      //var j = 2*i;
      this.Help.children[i].position.set(x*cubeDim, y* cubeDim, z* cubeDim);
      //this.Object.children[j+1].position.set(x*cubeDim, y* cubeDim, z* cubeDim);

    }
  }
  this.initHelpStoneList = function(){
    if(this.helpstoneList.length!== 0){
      this.helpstoneList.length=0;
      this.Help.remove(4,"hel");}
    //  console.log(helpstoneList.length);
    for (var i = 0; i < memberCount; i++){
      this.helpstoneList.push(new Cube(this.cubeList[i].x, this.cubeList[i].y, this.cubeList[i].z, 1))
    }
  }
  // this.updateObj = function (){
  //   objCount= this.Object.children.length;
  //   for (var i = 0; i <objCount; i+2){
  //     if (this.Object.children[i].uuid === this.UUIDList[i])
  //   }
  // }
  console.log( "CURRENT helpstoneList:  ", this.helpstoneList);
  switch (type){
    case (1):// I Stone
      this.cubeList.push(new Cube(xLen/2 - 1, yLen-1, zLen/2 , col));
      this.cubeList.push(new Cube(xLen/2, yLen-1, zLen/2, col));
			this.cubeList.push(new Cube(xLen/2 + 1, yLen-1, zLen/2, col));
			this.cubeList.push(new Cube(xLen/2 + 2, yLen-1, zLen/2, col));
      this.initHelpStoneList();
      this.makeObj();
      break;

    case (2):// L Stone
      this.cubeList.push(new Cube((xLen / 2) - 1, yLen - 2, zLen/2 , col));
			this.cubeList.push(new Cube((xLen / 2) - 1, yLen-1, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2), yLen-1, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2) + 1, yLen-1, zLen/2, col));
      this.initHelpStoneList();
      this.makeObj();
      break;

    case (3):// S Stone
      this.cubeList.push(new Cube((xLen / 2) - 1, yLen - 2, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2), yLen - 2, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2), yLen-1, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2) + 1, yLen-1, zLen/2, col));
      this.initHelpStoneList();
      this.makeObj();
      break;

    case (4):// O Stone
      this.cubeList.push(new Cube((xLen / 2) - 1, yLen - 2, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2), yLen - 2, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2) - 1, yLen-1, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2), yLen-1, zLen/2, col));
      this.initHelpStoneList();
      this.makeObj();
      break;

    case (5):// T Stone
      this.cubeList.push(new Cube((xLen / 2), yLen - 2, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2) - 1, yLen-1, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2), yLen-1, zLen/2, col));
			this.cubeList.push(new Cube((xLen / 2) + 1, yLen-1, zLen/2, col));
      this.initHelpStoneList();
      this.makeObj();
      break;
  }
}
