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
var scene, camera, renderer;
var diagDistance = 8; // factor for diagonal distance to corner of arena
var camHight = 250; // height of camera
var falling;        // Currently falling Tetris Stone
var geometry, material, mesh;
var cr = new Array() //Holds color values in Hex
  cr[0]= 0x404040; //grey
  cr[1]= 0xff8000; //orange
  cr[2]= 0xff00ff; //pink
  cr[3]= 0xffffff; //white
  cr[4]= 0x0000ff; //blue
  cr[5]= 0xff0000; //red
  cr[6]= 0x00ff00; //green
  cr[7]= 0xff8888; //???? /






init();
initFalling();
run();

function init() {
  scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / (window.innerHeight), 1, 10000 );
  camera.position.z = 5.5*(cubeDim) +diagDistance*cubeDim;
  camera.position.y = camHight+100;
  camera.position.x = -cubeDim*diagDistance;
  var look = new THREE.Vector3(cubeDim *2.5, camHight, cubeDim*2.5);
  camera.lookAt (look);
	renderer = new THREE.WebGLRenderer();
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

function drawCubes(){
  //clear();
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
        if( ( i === falling.cubeList[0].x && j === falling.cubeList[0].y && k == falling.cubeList[0].z)||
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


function run(){
  requestAnimationFrame(function(){run();});
  renderer.render( scene, camera );
  drawCubes();

}
