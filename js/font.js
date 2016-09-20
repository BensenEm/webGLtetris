var textMesh1, textMesh2, textGeo, textMeshGameOver, material;
var centerOffset= -200;
var mirror = false
var matFont = new THREE.MeshPhongMaterial( { color: 0xb83163, wireframe: false} );
var fontType = "fonts/Lato Semibold_Regular.json";

var text = "Score: 0", textL = "Lines:  0", textGameOver = "Game Over",
			height = 20,
			size = 20,
			hover = 680,
			curveSegments = 1,

			bevelThickness = 0,
			bevelSize = 0,
			bevelSegments = 1,
			bevelEnabled = !false;


function loadFont() {

	var loader = new THREE.FontLoader();
//	loader.load( '/fonts/Nixie/ One_Regular.json', function ( response ) {
	loader.load( fontType, function ( response ) {

		font = response;

		refreshText();

	} );

}

function createText() {

	textGeo = new THREE.TextGeometry( text, {

		font: font,

		 size: 25,
		 height: 0,
		 curveSegments: 8,

		 bevelThickness: 2,
		 bevelSize: 1.5,
	   bevelSegments: 3,
		 bevelEnabled: false,
		//
		 material: 1,
		 extrudeMaterial: 0

	});

	textGeoL = new THREE.TextGeometry( textL, {

		font: font,

		 size: 25,
		 height: 0,
		 curveSegments: 8,

		 bevelThickness: 2,
		 bevelSize: 1.5,
	   bevelSegments: 3,
		 bevelEnabled: false,
		//
		 material: 1,
		 extrudeMaterial: 0

	});

	textGeoGameOver = new THREE.TextGeometry( textGameOver, {

		font: font,

		 size: 60,
		 height: 0,
		 curveSegments: 8,

		 bevelThickness: 2,
		 bevelSize: 1.5,
		 bevelSegments: 3,
		 bevelEnabled: false,
		//
		 material: 1,
		 extrudeMaterial: 0

	});

	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();

	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

	if ( ! bevelEnabled ) {

		var triangleAreaHeuristics = 0.1 * ( height * size );

		for ( var i = 0; i < textGeo.faces.length; i ++ ) {

			var face = textGeo.faces[ i ];

			if ( face.materialIndex == 1 ) {

				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();

				}

				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];

				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

				if ( s > triangleAreaHeuristics ) {

					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

						face.vertexNormals[ j ].copy( face.normal );

					}

				}

			}

		}

	}

	//var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

	textMesh1 = new THREE.Mesh( textGeo, matFont);
	textMesh2 = new THREE.Mesh( textGeoL, matFont);
	textMeshGameOver = new THREE.Mesh( textGeoGameOver, matFont);

	textMesh1.position.x = -270;
	textMesh2.position.x = -270;
	textMesh1.position.y = hover-50;
	textMesh2.position.y = hover -90;
	textMesh1.position.z = 0;

	textMeshGameOver.position.x = -200;
	textMeshGameOver.position.y = 300;
	textMeshGameOver.position.z = 100;
	textMeshGameOver.visible = false;


	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;

	textMesh1.scale.z = 1;
	textMesh2.scale.z = 1;
	// textMesh1.scale.x = 0.4;
	// textMesh2.scale.x = 0.4;
	// textMesh1.scale.y = 0.4;
	// textMesh2.scale.y = 0.4;
//	textMesh1.rotation.y = Math.PI * 2;

	scene.add( textMesh1 );
	scene.add( textMesh2 );
	scene.add( textMeshGameOver);

	if ( mirror ) {

		textMesh2 = new THREE.Mesh( textGeo, material );

		textMesh2.position.x = centerOffset;
		textMesh2.position.y = -hover;
		textMesh2.position.z = height;

		textMesh2.rotation.x = Math.PI;
		textMesh2.rotation.y = Math.PI * 2;

		scene.add( textMesh2 );

	}

}

function refreshText() {

	//updatePermalink();

	scene.remove( textMesh1 );
	scene.remove ( textMesh2);
	if ( mirror ) scene.remove( textMesh2 );

	if ( !text ) return;

	createText();

}
