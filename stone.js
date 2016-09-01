var stone = function (type, col){
  this.cubeList = new Array();
  this.col = col;
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
