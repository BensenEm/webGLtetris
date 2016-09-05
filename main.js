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
var cubeDim = 40;
var scene, camera, renderer;
var diagDistance =5;
var camHight =200;
var falling, test;
var geometry, material, mesh;
var cr = new Array()
  cr[0]= 0x404040; //grey
  cr[1]= 0xff8000; //orange
  cr[2]= 0xff00ff; //pink
  cr[3]= 0xffffff; //white
  cr[4]= 0x0000ff; //blue
  cr[5]= 0xff0000; //red
  cr[6]= 0x00ff00; //green
  cr[7]= 0xff8888; //????






init();
initFalling();
animate();

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / (window.innerHeight), 1, 10000 );
   camera.position.z = 5.5*(cubeDim) +diagDistance*cubeDim;
   camera.position.y = camHight+200;
   camera.position.x = -cubeDim*diagDistance;
   var look = new THREE.Vector3(cubeDim *2.5, camHight, cubeDim*2.5);
   camera.lookAt (look);
  //mesh.translateZ(4);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

}

function initFalling(){
//  console.log();
  var ranType = getRandomIntInclusive(1,5);
  var ranCol = getRandomIntInclusive(1, (Object.keys(cr).length) -1);
  falling = new stone(5,cr[2]);

  drawCubes();
}

function putCube(x, y, z, col, fill){

  geometry = new THREE.BoxGeometry( cubeDim, cubeDim, cubeDim );
  material = new THREE.MeshBasicMaterial( { color: col, wireframe: fill } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  mesh.position.set(x*cubeDim, y*cubeDim, z*cubeDim);
}

function drawCubes(){
  for (var i = 0; i < xLen; i++){
    for (var j = 0; j < yLen; j++){
        for (var k = 0; k < zLen; k++){
          if (arena[i][j][k] === 1){putCube(i,j,k, 0x404040, true);}
          else {
            var far = arena[i][j][k];
            putCube(i, j, k, far, true);
          }

          if( ( i == falling.cubeList[0].x && j == falling.cubeList[0].y && k == falling.cubeList[0].z)||
              ( i === falling.cubeList[1].x && j === falling.cubeList[1].y && k === falling.cubeList[1].z)||
              ( i === falling.cubeList[2].x && j === falling.cubeList[2].y && k === falling.cubeList[2].z)||
              ( i === falling.cubeList[3].x && j === falling.cubeList[3].y && k === falling.cubeList[3].z)){
                  putCube(i, j, k, falling.farbe, true);
                }
          }
        }
    }
}
function animate() {

	// requestAnimationFrame( animate );
  //
	// mesh.rotation.x += 0.01;
	// mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}

//document.getElementById("test").innerHTML = arena[5][11][5];
