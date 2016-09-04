var xLen = 6;
var yLen = 12;
var zLen = 6;
var arena = new Array(xLen);
  for (var i = 0; i < xLen; i++){
    arena[i]= new Array(yLen);
    for (var j = 0; j < yLen; j++){
      arena[i][j]= new Array(zLen);
        for (var k = 0; k < zLen; k++){
          arena[i][j][k] = "transparent";
        }
      }
    }
var cubeDim = 40;
var scene, camera, renderer;
var geometry, material, mesh;
var cr = new Array()
  cr[0]= 0x0000ff; //blue
  cr[1]= 0xff8000; //orange
  cr[2]= 0xff00ff; //pink
  cr[3]= 0xffffff; //white
  cr[4]= 0x404040; //grey
  cr[5]= 0xff0000; //red
  cr[6]= 0x00ff00; //green
  cr[7]= 0xffff00; //yellow





init();
initFalling();
animate();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight), 1, 10000 );
	camera.position.z = 1000;

//  drawCubes();


  //mesh.translateZ(4);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

}

function initFalling(){
//  console.log();
  var ranType = getRandomIntInclusive(1,5);
  var ranCol = getRandomIntInclusive(0, Object.keys(cr).length);
  console.log(ranType);
  console.log(ranCol);
  falling = new stone(ranType, ranCol);

  falling.bewegen("x", true);
  falling.bewegen("x", true);
  falling.bewegen("x", true);
  falling.bewegen("x", true);
  falling.bewegen("x", true);
  falling.bewegen("x", true);
  falling.bewegen("x", true);


  //falling.cubeList.get
  //console.log(Object.keys(falling);
  // console.log(falling.cubeList[0].x, falling.cubeList[0].y, falling.cubeList[0].z);
  // falling.cubeList[0].x = 1;
  // falling.cubeList[0].y = 1;
  // falling.cubeList[0].z = 1;
  for (var i = 0; i < 4; i++){
     console.log(falling.cubeList[i].x, falling.cubeList[i].y, falling.cubeList[i].z );
   }
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
          if (arena[i][j][k] == "transparent") putCube(i,j,k, cr[4], true);
          else putCube(i, j, k, cr[arena[i][j][k]], true);

          if( ( i == falling.cubeList[0].x && j == falling.cubeList[0].y && k == falling.cubeList[0].z)||
              ( i === falling.cubeList[1].x && j === falling.cubeList[1].y && k === falling.cubeList[1].z)||
              ( i === falling.cubeList[2].x && j === falling.cubeList[2].y && k === falling.cubeList[2].z)||
              ( i === falling.cubeList[3].x && j === falling.cubeList[3].y && k === falling.cubeList[3].z)){
                  putCube(i, j, k, cr[falling.col], true);
                }
          // for (var i = 0; i < 4; i++){
          //    console.log(falling.cubeList[i].x);
          //   if (i == bx.x && j==bx.y && k==bx.z) putCube(i, j, k, falling.col, true);
          // }
        }
      }
    }
}
function animate() {

	//requestAnimationFrame( animate );

	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}

//document.getElementById("test").innerHTML = arena[5][11][5];
