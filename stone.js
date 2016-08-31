var stone = function (type, color){
  var cubeList = new Array();
  switch (type){
    case (1):
      cubeList.push(new cube((xLen/2) - 1, yLen, zLen / 2, col));
      cubeList.push(new cube((xLen / 2), yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) + 1, yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) + 2, yLen, zLen / 2, col));
      break;

    case (2):
      cubeList.push(new cube((xLen / 2) - 1, yLen - 1, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) - 1, yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2), yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) + 1, yLen, zLen / 2, col));
			break;

    case (3):
      cubeList.push(new cube((xLen / 2) - 1, yLen - 1, zLen / 2, col));
			cubeList.push(new cube((xLen / 2), yLen - 1, zLen / 2, col));
			cubeList.push(new cube((xLen / 2), yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) + 1, yLen, zLen / 2, col));
			break;

    case (4):
      cubeList.push(new cube((xLen / 2) - 1, yLen - 1, zLen / 2, col));
			cubeList.push(new cube((xLen / 2), yLen - 1, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) - 1, yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2), yLen, zLen / 2, col));
			break;

    case (5):
      cubeList.push(new cube((xLen / 2), yLen - 1, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) - 1, yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2), yLen, zLen / 2, col));
			cubeList.push(new cube((xLen / 2) + 1, yLen, zLen / 2, col));
      break;

    default:
  }
}
