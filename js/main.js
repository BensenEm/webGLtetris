var xLen = 6;
var yLen = 12;
var zLen = 6;
var oldArena = new Array(xLen);
  for (var i = 0; i < xLen; i++){
    oldArena[i]= new Array(yLen);
    for (var j = 0; j < yLen; j++){
      oldArena[i][j]= new Array(zLen);
        for (var k = 0; k < zLen; k++){
          oldArena[i][j][k] = 1;
        }
      }
    }
var font;
var level =1;
var score = 0;
var scoreStr="";
//var totalLinesStr="";
var totalLines = 0;
var arenaPos =0;
var cubeDim = 40; // size of single Cube
var pause = false;
var scene, camera, renderer;
var diagDistance = 8; // factor for diagonal distance to corner of arena
var camHight = 150; // height of camera
var falling;        // Currently falling Tetris Stone
var geometry, material, mesh;
var timeUnit = 2000;
var currentTime = Date.now();
var currentTime_turning = Date.now();
var turningSteps;//console.log(turningSteps);
var turningCounter =0;
var memberCount = 4;
var cr = new Array() //Holds color values in Hex
  cr[0]= 0x0; //grey
  cr[1]= 0xf8d3ed; //orange
  cr[2]= 0xdbbbe7; //pink
  cr[3]= 0xb3c5e6; //white
  cr[4]= 0xcecbcb; //blue
  cr[5]= 0xd8d7e1; //red
  //cr[6]= 0x0; //green
  //cr[7]= 0x0; //???? /
var stateFalling = true;
var stateDeleting = false;
var statePause = false;
var stateTurning = false;
var midArena, newArena;
//oldArena=arena;
var disToFloor;
var fallingObj = new THREE.Object3D();
var helpObj = new THREE.Object3D();
var arenaObj = new THREE.Object3D();
var arOld =new THREE.Object3D();
var arMid =new THREE.Object3D();
var arNew =new THREE.Object3D();
var arenaCase = new THREE.Object3D();
arOld.name ="arOld";
arMid.name ="arMid";
arNew.name ="arNew";
arMid.visible = false;
arNew.visible = false;

var groundObj = new THREE.Object3D();
var backgroundObj = new THREE.Object3D();
var geo = new THREE.BoxGeometry( cubeDim, cubeDim, cubeDim );
var matWa = new THREE.MeshBasicMaterial( { color: 0x00000, wireframe: true } ); // generic Wireframe of Cube
arenaObj.add(arOld);
arenaObj.add(arMid);
arenaObj.add(arNew);
arenaObj.add(fallingObj);
arenaObj.add(helpObj);
arenaObj.add(groundObj);
arenaCase.add(arenaObj);



start();

function start(){
  init();
  initFalling();
  run();
}
function windowSize(){
  var hei = window.innerHeight;
  hei =hei*0.8;
  wid = hei*2/3;
  renderer.setSize(wid, hei);
}
function init() {
  loadCanvas("frame");
// var canvas = document.getElementById("c");
  // canvas.width = 400;
  // canvas.height = 300;
  turningSteps = ( THREE.Math.degToRad(90) )/20;
  scene = new THREE.Scene();
//	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / (window.innerHeight), 1, 10000 );
	camera = new THREE.PerspectiveCamera( 70,  2/ 3, 1, 10000 );
  camera.position.z = 600;
  //camera.position.z = 5.5*(cubeDim) +diagDistance*cubeDim;
  camera.position.y = 250;
  // camera.position.y = camHight+200;
  // camera.position.x = -cubeDim*diagDistance;
  // var look = new THREE.Vector3(cubeDim *2.5, camHight, cubeDim*2.5);
  // camera.lookAt (look);
	renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x181a20);

	renderer.setSize( window.innerHeight*2/3*0.8, window.innerHeight *0.8);
  console.log(renderer);
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  console.log(screenWidth, screenHeight)
	document.body.appendChild( renderer.domElement );
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  handleKeys();
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 1, 1 ).normalize();
  putFloor();
  scene.add(light);
  scene.add(arenaCase);
//  arenaObj.position.set(cubeDim *2., 0, cubeDim*2.5);
  arenaObj.position.set(-cubeDim *2.5, 0, -cubeDim*2.5);
  arenaCase.rotation.y = Math.PI/4;
  //scene.add(arenaObj);
  //scene.add(groundObj);
  //scene.add(backgroundObj);
  loadFont();
//  initControllInfo();
  //createText();
  // var canvas = document.getElementById("myCanvas");
  // var ctx = canvas.getContext("webgl");
}

function loadCanvas(id) {
  var canvas = document.createElement('cavas');
  div = document.getElementById(id);
  div.appendChild(canvas);
  canvas.id     = "CursorLayer";
  canvas.width  = 900;
  canvas.height = 1350;
  canvas.style.zIndex   = 8;
  canvas.style.position = "absolute";
  canvas.style.border   = "5px solid #ff3366";
  div.style.margin = 20;
  div.style.padding = 0;
}

function initFalling(){
//  console.log(camera.position.z);
  var ranType = getRandomIntInclusive(1,5);
  var ranCol = getRandomIntInclusive(0, 4);
  falling = new Stone(ranType,levelCol[level-1][ranCol]);
  updateHelpstone();
}

// creates a new Cube at the given XYZ Position, Color, in wireframe or filled Look
// function putCubeWire(x, y, z){
//   geometry = new THREE.BoxGeometry( cubeDim, cubeDim, cubeDim );
//   material = new THREE.MeshBasicMaterial( { color: 0x000001, wireframe: true } );
//   //material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: col, specular: 0x555555, shininess: 300 } );
//   mesh = new THREE.Mesh( geometry, material );
//   scene.add( mesh );
//   mesh.position.set(x*cubeDim, y*cubeDim, z*cubeDim);
// }
//
// function putCube(x, y, z, col){
//   geometry = new THREE.BoxGeometry( cubeDim, cubeDim, cubeDim );
//   material = new THREE.MeshBasicMaterial( { color: col, wireframe: false } );
//   //material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: col, specular: 0x555555, shininess: 30 } );
//   mesh = new THREE.Mesh( geometry, material );
//   scene.add( mesh );
//   mesh.position.set(x*cubeDim, y*cubeDim, z*cubeDim);
// }

function updateArena(arObjType, arenaArrayType){
  var childrenCount = arObjType.children.length;
  if (childrenCount !== 0){
    for (var i = childrenCount-1; i >= 0; i--){
      arObjType.remove(arObjType.children[i]);
    }
  }
  for (var i = 0; i < xLen; i++){
    for (var j = 0; j < yLen; j++){
      for (var k = 0; k < zLen; k++){
        if (arenaArrayType[i][j][k]===1) {continue;}
        var fa = arenaArrayType[i][j][k]; // Color at this position in arena
        var mat = new THREE.MeshPhongMaterial( { color: fa, specular: 0x009900, shininess: 30, shading: THREE.SmoothShading } )
    //    var mat = new THREE.MeshNormalMaterial( { color: fa, wireframe: false } );
        mesh = new THREE.Mesh( geo, mat );
      //  meshW = new THREE.Mesh (geo, matWa);
        mesh.position.set(i *cubeDim, j*cubeDim, k*cubeDim);
      //  meshW.position.set(i *cubeDim, j*cubeDim, k*cubeDim);
      //  arObjType.add (meshW);
        arObjType.add (mesh);
      }
    }
  }
}


function putFloor (){
  geometry = new THREE.BoxGeometry( 6*cubeDim, 6, 6*cubeDim );
  //material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: 0x0033ff, specular: 0x555555, shininess: 30 } );
  material = new THREE.MeshBasicMaterial( { color: 0x8000ff, wireframe: true } );
  floor = new THREE.Mesh( geometry, material );
  groundObj.add( floor );
  groundObj.position.set(cubeDim *2.5, -23, cubeDim*2.5);
  //mesh.position.set(x*cubeDim, y*cubeDim, z*cubeDim);
}

// function drawCubes(){
//   scene= new THREE.Scene();
//   putFloor();
//   for (var i = 0; i < xLen; i++){
//     for (var j = 0; j < yLen; j++){
//       for (var k = 0; k < zLen; k++){
//
//         // draws the empty arena
//         if (arena[i][j][k] === 1);// {putCube(i,j,k, 0x404040, true);}
//
//         // draws cubes within the arena that have halted
//         else {
//           var far = arena[i][j][k];
//           putCube(i, j, k, far, false);
//           putCubeWire (i, j, k);
//         }
//
//         //draws the currently falling "FALLING" Stone
//         if (stateFalling === true) {
//           //updates the Helpstone
//           if ( ( i === falling.helpstoneList[0].x && j === falling.helpstoneList[0].y && k == falling.helpstoneList[0].z)||
//               ( i === falling.helpstoneList[1].x && j === falling.helpstoneList[1].y && k === falling.helpstoneList[1].z)||
//               ( i === falling.helpstoneList[2].x && j === falling.helpstoneList[2].y && k === falling.helpstoneList[2].z)||
//               ( i === falling.helpstoneList[3].x && j === falling.helpstoneList[3].y && k === falling.helpstoneList[3].z)){
//                   //scene.remove(mesh);
//                   //putCube(i, j, k, falling.farbe, false);
//                   putCubeWire(i, j, k);
//           }
//           //updates the actual Falling Stone itself
//           if ( ( i === falling.cubeList[0].x && j === falling.cubeList[0].y && k == falling.cubeList[0].z)||
//               ( i === falling.cubeList[1].x && j === falling.cubeList[1].y && k === falling.cubeList[1].z)||
//               ( i === falling.cubeList[2].x && j === falling.cubeList[2].y && k === falling.cubeList[2].z)||
//               ( i === falling.cubeList[3].x && j === falling.cubeList[3].y && k === falling.cubeList[3].z)){
//                   putCube(i, j, k, falling.farbe, false);
//                   putCubeWire(i, j, k);
//           }
//         }
//       }
//     }
//   }
// }

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
  var lines=0;
  var fullRowArray = new Array();
  //Iterate through rows on zAxis
  for (var j=0; j<yLen; j++){
    for (var i = 0; i < xLen; i++){
      var zlines=0;
      for (var k = 0; k < zLen; k++){
        if (oldArena[i][j][k] !== 1){
          zlines += 1;
        }
      }
      if (zlines === zLen){
        totalLines +=1;
        lines+=1;
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
        if (oldArena[i][j][k] !== 1){
          xlines += 1;
        }
      }
      if (xlines === xLen){
        totalLines +=1;
        lines+=1;

        for (var i2=0; i2< xLen; i2++){
          fullRowArray.push(new THREE.Vector3(i2,j,k));
        }
      }
    }
  }
  if (lines!==0) {
    score += calcScore(lines);
    text="Score: "+ score;
    textL="Lines:  " +totalLines;
    refreshText();
  }

  return fullRowArray;

}
function calcScore(lines){
  var multiplyer4 = 2;
  var multiplyer1 = 1;
  var multiplyer2 = 1.5;
  var multiplyer8 = 3;
  switch (lines) {
    case 1: return 10 * multiplyer1 * lines * level;
      break;
    case 2: return 10 * multiplyer2 * lines * level;
      break;
    case 3: return 10 * multiplyer2 * lines * level;
      break;
    case 4: return 10 * multiplyer4 * lines * level;
      break;
    case 5: return 10 * multiplyer4 * lines * level;
      break;
    case 6: return 10 * multiplyer4 * lines * level;
      break;
    case 7: return 10 * multiplyer4 * lines * level;
      break;
    case 8: return 10 * multiplyer8 * lines * level;
      break;

    default:  return 10 * multiplyer8 * lines * level;
  }
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
    //oldArena = copyArena(arena);
    updateArena(arOld, oldArena);
    //turns floor(arena) to a floor without fullRows( = midArena)
    midArena = copyArena(oldArena);
    midArena = eraseFromArena(midArena, fullRowsSet);
    updateArena (arMid, midArena);

    //turns midArena to newArena (Cubes drop down if deleted Spots underneath)
    newArena = copyArena(oldArena);
    var len = fullRowsSet.length;
    for (var j = len-1; j >= 0; j--){
      var x= fullRowsSet[j].x;
      var y= fullRowsSet[j].y;
      var z= fullRowsSet[j].z;
      for (var i = y; i < yLen-2; ++i) {
  			newArena[x][i][z] = newArena[x][i+1][z];
  		}
  		newArena[x][yLen - 1][z] = 1;
      updateArena(arNew, newArena);

    }
    return false;
  }
  else return true;
}
function setArenaVisibility(val){
  switch (val) {
    case "oA":
      arOld.visible=true;
      arMid.visible=false;
      arNew.visible=false;
      break;
    case "mA":
      arOld.visible=false;
      arMid.visible=true;
      arNew.visible=false;
      break;
    case "nA":
      arOld.visible=false;
      arMid.visible=false;
      arNew.visible=true;
      break;
    default:

  }
}
function mainLoop(){
  if (stateFalling === true){
    setArenaVisibility("oA");
    now = Date.now();
    deltaT = now - currentTime;

    if (deltaT > timeUnit){
      falling.drop();
      currentTime = Date.now();
    }
    //updateHelpstone();
  }
  if (stateDeleting === true){
    now2 = Date.now();
    deltaT2 = now2 - currentTime;
    if (deltaT2 <=500){
       setArenaVisibility("mA");
    }
    else if (deltaT2 > 500 && deltaT2 <=1000){
       setArenaVisibility("oA");
    }
    else if (deltaT2 > 1000 && deltaT2 <=1500){
       setArenaVisibility("mA");

    }
    else if (deltaT2 > 1500 && deltaT2 <=2000){
      setArenaVisibility("oA");
    }
    else if (deltaT2 > 2000 && deltaT2 <=2500){
      setArenaVisibility("mA");
    }
    else if (deltaT2>1500){
      oldArena = copyArena(newArena);
      updateArena(arOld, oldArena);
      setArenaVisibility("oA");
      stateDeleting = false;
      stateFalling = true;
      currentTime = Date.now();
      initFalling();
    }
  }
}

function animate(){
  if (stateTurning === true){
    arenaCase.rotation.y += turningSteps;
    ++turningCounter;
    if(turningCounter>=20){
      stateTurning = false;
      turningCounter=0;
    }
  }
}

function run(){
    requestAnimationFrame(function(){run();});
    if(statePause === false){
    renderer.render( scene, camera );
    mainLoop();
    animate();
    //drawCubes();
  }
}
