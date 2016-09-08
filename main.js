var xLen = 6;
var yLen = 12;
var zLen = 6;
var arena = new Array(xLen);
  for (var i = 0; i < xLen; i++){
    arena[i]= new Array(yLen);
    for (var j = 0; j < yLen; j++){
      arena[i][j]= new Array(zLen);
        for (var k = 0; k < zLen; k++){
          arena[i][j][k] = 1;
        }
      }
    }
var cubeDim = 40; // size of single Cube
var pause = false;
var scene, camera, renderer;
var diagDistance = 8; // factor for diagonal distance to corner of arena
var camHight = 150; // height of camera
var falling;        // Currently falling Tetris Stone
var geometry, material, mesh;
var timeUnit = 1000;
var currentTime = Date.now();
var cr = new Array() //Holds color values in Hex
  cr[0]= 0x404040; //grey
  cr[1]= 0xff8000; //orange
  cr[2]= 0xff00ff; //pink
  cr[3]= 0xffffff; //white
  cr[4]= 0x0000ff; //blue
  cr[5]= 0xff0000; //red
  cr[6]= 0x00ff00; //green
  cr[7]= 0xff8888; //???? /
var stateFalling = true;
var stateDeleting = false;
var statePause = false;
var oldArena, midArena, newArena;




init();
initFalling();
run();

function init() {
  scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / (window.innerHeight), 1, 10000 );
  camera.position.z = 5.5*(cubeDim) +diagDistance*cubeDim;
  camera.position.y = camHight+200;
  camera.position.x = -cubeDim*diagDistance;
  var look = new THREE.Vector3(cubeDim *2.5, camHight, cubeDim*2.5);
  camera.lookAt (look);
	renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x181a20);
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  handleKeys();

}

function initFalling(){
  var ranType = getRandomIntInclusive(1,5);
  var ranCol = getRandomIntInclusive(1, (Object.keys(cr).length) -1);
  falling = new Stone(ranType,cr[ranCol]);
}

// creates a new Cube at the given XYZ Position, Color, in wireframe or filled Look

function putCube(x, y, z, col, fill){
  geometry = new THREE.BoxGeometry( cubeDim, cubeDim, cubeDim );
  material = new THREE.MeshBasicMaterial( { color: col, wireframe: fill } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  mesh.position.set(x*cubeDim, y*cubeDim, z*cubeDim);
}
function putFloor (){
  geometry = new THREE.BoxGeometry( 6*cubeDim, 6, 6*cubeDim );
  material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: 0x0033ff, specular: 0x555555, shininess: 30 } );
  //material = new THREE.MeshBasicMaterial( { color: 0x8000ff, wireframe: true } );
  floor = new THREE.Mesh( geometry, material );
  scene.add( floor );
  floor.position.set(cubeDim *2.5, -23, cubeDim*2.5);
  //mesh.position.set(x*cubeDim, y*cubeDim, z*cubeDim);
}

function drawCubes(){
  scene= new THREE.Scene();
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 1, 1 ).normalize();
  scene.add(light);
  putFloor();
  for (var i = 0; i < xLen; i++){
    for (var j = 0; j < yLen; j++){
      for (var k = 0; k < zLen; k++){

        // draws the empty arena
        if (arena[i][j][k] === 1);// {putCube(i,j,k, 0x404040, true);}

        // draws cubes within the arena that have halted
        else {
          var far = arena[i][j][k];
          putCube(i, j, k, far, true);
        }

        //draws the currently falling "FALLING" Stone
        if (stateFalling === true) {
          if ( ( i === falling.cubeList[0].x && j === falling.cubeList[0].y && k == falling.cubeList[0].z)||
              ( i === falling.cubeList[1].x && j === falling.cubeList[1].y && k === falling.cubeList[1].z)||
              ( i === falling.cubeList[2].x && j === falling.cubeList[2].y && k === falling.cubeList[2].z)||
              ( i === falling.cubeList[3].x && j === falling.cubeList[3].y && k === falling.cubeList[3].z)){
                  //scene.remove(mesh);
                  putCube(i, j, k, falling.farbe, true);
          }
        }
      }
    }
  }
}

// takes an Arena and sets slots to 1 that are within eraseArray
function eraseFromArena(typeOfArena, eraseArray){
  var len = eraseArray.length;
  for (var i = 0; i < xLen; i++){
    for (var j = 0; j< yLen; j++){
      for (var k = 0; k< zLen; k++){
        for (var l = 0; l < len; l++){
          if  (eraseArray[l].x == i && eraseArray[l].y == j && eraseArray[l].z == k){
            typeOfArena[i][j][k] = 1;
          }
        }
      }
    }
  }
  return typeOfArena;
}
function findCompletedLines(){
  var fullRowArray = new Array();
  //Iterate through rows on zAxis
  for (var j=0; j<yLen; j++){
    for (var i = 0; i < xLen; i++){
      var zlines=0;
      for (var k = 0; k < zLen; k++){
        if (arena[i][j][k] !== 1){
          zlines += 1;
        }
      }
      if (zlines === zLen){
        for (var k2=0; k2< zLen; k2++){
          fullRowArray.push(new THREE.Vector3(i,j,k2));
        }
      }
    }
  }
  //Iterate through rows on xAxis
  for (var j=0; j<yLen; j++){
    for (var k = 0; k < zLen; k++){
      var xlines=0;
      for (var i = 0; i < xLen; i++){
        if (arena[i][j][k] !== 1){
          xlines += 1;
        }
      }
      if (xlines === xLen){
        for (var i2=0; i2< xLen; i2++){
          fullRowArray.push(new THREE.Vector3(i2,j,k));
        }
      }
    }
  }
  return fullRowArray;
}
function deleteCompletedLines(){

  //finds rows to be deleted
  var fullRows= findCompletedLines();
  if (fullRows.length !== 0){
    stateDeleting = true;
    stateFalling = false;

    // turns fullRows into a Set of UNIQUE Vector3
    var fullRowsSet = makeSet(fullRows);
    //
    oldArena = copyArena(arena);

    //turns floor(arena) to a floor without fullRows( = midArena)
    midArena = copyArena(arena);
    midArena = eraseFromArena(midArena, fullRowsSet);

    //turns midArena to newArena (Cubes drop down if deleted Spots underneath)
    newArena = copyArena(arena);
    var len = fullRowsSet.length;
    for (var j = len-1; j >= 0; j--){
      var x= fullRowsSet[j].x;
      var y= fullRowsSet[j].y;
      var z= fullRowsSet[j].z;
      for (var i = y; i < yLen-2; ++i) {
  			newArena[x][i][z] = newArena[x][i+1][z];
  		}
  		newArena[x][yLen - 1][z] = 1;

    }
    //arena = copyArena(newArena);
  }
}

function mainLoop(){
  if (stateFalling === true){
    now = Date.now();
    deltaT = now - currentTime;
    if (deltaT > timeUnit){
      falling.drop();
      currentTime = Date.now();
    }
  }
  if (stateDeleting === true){
    arena = midArena;
    now2 = Date.now();
    deltaT2 = now2 - currentTime;
    if (deltaT2 > 500 && deltaT2 <=1000){
       arena = oldArena;
    }
    else if (deltaT2 > 1000 && deltaT2 <=1500){
      arena = midArena;
    }
    else if (deltaT2 > 1500 && deltaT2 <=2000){
       arena = oldArena;
    }
    else if (deltaT2 > 2000 && deltaT2 <=2500){
       arena = midArena;
    }
    else if (deltaT2>1500){
       arena = newArena;
       stateDeleting = false;
       stateFalling = true;
       currentTime = Date.now();
    }
  }
}

function run(){
    requestAnimationFrame(function(){run();});
    if(statePause === false){
    renderer.render( scene, camera );
    mainLoop();
    drawCubes();
  }
}
