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

var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight), 1, 10000 );
	camera.position.z = 1000;

	geometry = new THREE.BoxGeometry( 100, 100, 100 );
	geometry2 = new THREE.BoxGeometry( 100, 500, 500 );
	material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
	material2 = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } );

	mesh = new THREE.Mesh( geometry, material );
  mesh2 = new THREE.Mesh(geometry, material2);
	scene.add( mesh );
	scene.add( mesh2 );
  mesh2.position.set(0, 500, 0);

  //mesh.translateZ(4);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

}

function animate() {

	//requestAnimationFrame( animate );

	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}

document.getElementById("test").innerHTML = arena[5][11][5];
