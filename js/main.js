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
//var scoreStr="";
//var totalLinesStr="";
var totalLines = 0;
var arenaPos =0;
var cubeDim = 40; // size of single Cube
//var pause = false;
var scene, camera, renderer;
var diagDistance = 8; // factor for diagonal distance to corner of arena
var camHight = 150; // height of camera
var falling;        // Currently falling Tetris Stone
var geometry, material, mesh;
var currentLevel;
var currentTime = Date.now();
var currentTime_turning = Date.now();
var turningSteps;//console.log(turningSteps);
var turningCounter =0;
var memberCount = 4;
var cameraView1 =true;
var cameraView2 = false;
// var cr = new Array() //Holds color values in Hex
//   cr[0]= currentLevel.colorset[0]; //grey
//   cr[1]= 0xf8d3ed; //orange
//   cr[2]= 0xdbbbe7; //pink
//   cr[3]= 0xb3c5e6; //white
//   cr[4]= 0xcecbcb; //blue
//   cr[5]= 0xd8d7e1; //red
//   //cr[6]= 0x0; //green
//   //cr[7]= 0x0; //???? /
var stateFalling = true;
var stateDeleting = false;
var statePause = false;
var stateTurning = false;
var stateGameOver = false;
var stateMusicOn = false;
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
var bckgMusic;
var bckgMusicAdr;



  init();
  initFalling();
  run();


function windowSize(){
  var hei = window.innerHeight;
  hei =hei*0.8;
  wid = hei*2/3;
  renderer.setSize(wid, hei);
  posScoreText();
}
function init() {
  loadCanvas("frame");
  turningSteps = ( THREE.Math.degToRad(90) )/20;
  scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70,  2/ 3, 1, 10000 );
  camera.position.z = 600;
  camera.position.y = 250;


  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  handleKeys();
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 1, 1 ).normalize();
  putFloor();
  scene.add(light);
  scene.add(arenaCase);
  arenaObj.position.set(-cubeDim *2.5, 0, -cubeDim*2.5);
  arenaCase.rotation.y = Math.PI/4;
  //loadFont();
  currentLevel = new Level(level);

}

function toggleCameraView(){

  if (cameraView1===true) {
    cameraView1= false;
    cameraView2=true;
    camera.position.z=200;
    camera.position.y= 700;
    camera.lookAt(new THREE.Vector3(0,0,-200))
    return;
  }
  if (cameraView2===true){
    cameraView2 =false;
    cameraView1 = true;
    camera.position.z = 600;
    camera.position.y = 250;
    camera.lookAt(new THREE.Vector3(0,250,0))

    return;
  }
}

function loadCanvas(id) {
  var can = document.createElement('canvas');
  div = document.getElementById(id);
  var t = document.createTextNode('Sorry, your Browser does not support WebGL. Please browse with Chrome (or Firefox).');     // Create a text node
  div.style.margin = "auto";
  div.style.padding = 0;
  div.style.position = "relative";
  div.style.width = window.innerHeight*2/3*0.8;
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x121212);
	renderer.setSize( window.innerHeight*2/3*0.8, window.innerHeight *0.8);
	div.appendChild( renderer.domElement );
  renderer.domElement.appendChild(t);
  text2 = document.createElement('div');
  div.appendChild(text2);
  text2.id="scoreBox";
  text2.style.position = 'relative';
  text2.style.zIndex = 1;
  //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  text2.style.width = 200;
  text2.style.height = 200;
  text2.style.margin = 20;
  //text2.style.backgroundColor = "blue";
  text2.innerHTML = "Score: 0<br>Lines: 0<br>Level: 1";
  posScoreText();

}

function createGameOverText(){
  console.log("yuuup");
  textGOdiv = document.createElement('div');
  console.log(textGOdiv);
  textGOpar = document.getElementById('frame');
  textGOpar.appendChild(textGOdiv);
  textGOdiv.id="gameOverText";
  textGOdiv.style.zIndex =1;
  textGOdiv.innerHTML = "Game Over";
  textGOdiv.style.top = -1*(window.innerHeight*0.8) + 'px';
  textGOdiv.style.left = 0 + 'px';
  textGOdiv.style.position = 'relative';
  textGOdiv.style.textAlign= 'center';
  }

function posScoreText(){
  var text3= document.getElementById("scoreBox");
  text3.style.top = -1*(window.innerHeight*0.8) + 'px';
  text3.style.left = 0 + 'px';

}
function checkGameOver(){

  for (var i = 0; i < xLen; i++){
    for (var j = 0; j< zLen; j++){
      if (oldArena[i][yLen-1][j] !== 1){
        return true;
      }
    }
  }
  return false;
}
function setGameOver(){
  stateGameOver = true;
  setArenaVisibility("allInvisible");
  createGameOverText();
  arOld.children=shuffle(arOld.children);
}
function initFalling(){
//  console.log(camera.position.z);
  var ranType = getRandomIntInclusive(1,5);
  var ranCol = getRandomIntInclusive(0, 4);
  if (checkGameOver()){
    setGameOver();
  }
  else{
    falling = new Stone(ranType, currentLevel.colorset[ranCol]);
    updateHelpstone();
  }
}


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

  //  refreshText();

    if (score > currentLevel.threshholdScore){
      level++;
      currentLevel = new Level(level);

    }
    document.getElementById('scoreBox').innerHTML = "Score: " + score + "<br>Lines: " + totalLines + "<br>Level: "+level;
  }

  return fullRowArray;

}
function calcScore(lines){
  var multiplyer4 = 2;
  var multiplyer1 = 1;
  var multiplyer2 = 1.5;
  var multiplyer8 = 3;
  switch (lines) {
    case 1: return 10 * multiplyer1 * lines * currentLevel.scoreMultiplyer;
      break;
    case 2: return 10 * multiplyer2 * lines * currentLevel.scoreMultiplyer;
      break;
    case 3: return 10 * multiplyer2 * lines * currentLevel.scoreMultiplyer;
      break;
    case 4: return 10 * multiplyer4 * lines * currentLevel.scoreMultiplyer;
      break;
    case 5: return 10 * multiplyer4 * lines * currentLevel.scoreMultiplyer;
      break;
    case 6: return 10 * multiplyer4 * lines * currentLevel.scoreMultiplyer;
      break;
    case 7: return 10 * multiplyer4 * lines * currentLevel.scoreMultiplyer;
      break;
    case 8: return 10 * multiplyer8 * lines * currentLevel.scoreMultiplyer;
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
    case "allInvisible" :
      arOld.visible =true;
      arMid.visible =false;
      arNew.visible =false;
    default:

  }
}
function mainLoop(){
  if (stateGameOver === true){
    if (counter3>=len3){
      statePause=true;
    }
  }
  if (stateFalling === true){
    setArenaVisibility("oA");
    now = Date.now();
    deltaT = now - currentTime;

    if (deltaT > currentLevel.dropTime){
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
counter3=0;
len3=100;
function animate(){
  if (stateTurning === true){
    arenaCase.rotation.y += turningSteps;
    ++turningCounter;
    if(turningCounter>=20){
      stateTurning = false;
      turningCounter=0;
    }
  }
  if (stateGameOver === true){
    len3=arOld.children.length;

      now3 = Date.now();
      deltaT3 = now3-currentTime;
      console.log(deltaT3);
      if(deltaT3>100 && counter3 <=len3){
        console.log("print ",counter3);
        arOld.children[counter3].visible=false;
        currentTime=Date.now();
          counter3++;
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
