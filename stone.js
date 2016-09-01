var stone = function (type, col){
  this.cubeList = new Array();
  this.col = col;
  this.bewegen = function(axis, direction){
    for (var i = 0; i <4; i++){
      if (direction == true){
        this.cubeList[i].axis += 1;
      }
      else {
        this.cubeList[i].axis -= 1;
      }
    }
    //this.cubeList[0].x = 0;
    //this.cubeList[0].y = 0;
    //this.cubeList[0].z = 0;
    //this.cubeList[0].col = this.col
    // falling.cubeList[0].x = 1;
    // falling.cubeList[0].y = 1;
    // falling.cubeList[0].z = 1;
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
