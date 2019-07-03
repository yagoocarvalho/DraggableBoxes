var container, stats;
var camera, scene, renderer, dragControls;
var objects = [];
var pickedObj;
var mode = "default";
var circleEnabled = false;

var raycaster 	= new THREE.Raycaster();
var mouse 		= new THREE.Vector2();

init();
animate();

function init() 
{

    container = document.createElement( 'div' );
	document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.z = 1000;
	camera.position.x = 0;
	camera.position.y = 0;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xf0f0f0 );

	scene.add( new THREE.AmbientLight( 0xeeeeee ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	light.angle = Math.PI / 4;

	light.castShadow = false;

	scene.add( light );

	var geometry = new THREE.BoxBufferGeometry( 40, 40, 40 );

	// Create the boxes
	for ( var i = 0; i < 10; i ++ ) 
	{
		var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

		object.position.x = Math.random() * 1000 - 500;
		object.position.y = Math.random() * 600 - 300;
		object.position.z = Math.random() * 800 - 400;

		object.rotation.x = Math.random() * 2 * Math.PI;
		object.rotation.y = Math.random() * 2 * Math.PI;
		object.rotation.z = Math.random() * 2 * Math.PI;

		let scale = Math.random() * 2 + 1;
		object.scale.x = scale;
		object.scale.y = scale;
		object.scale.z = scale;

		object.castShadow = false;
		object.receiveShadow = false;

		scene.add( object );

		objects.push( object );
	}

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
	dragControls.addEventListener( 'dragstart', function () 
	{
	} );
	dragControls.addEventListener( 'dragend', function () 
	{
	} );

	stats = new Stats();
	container.appendChild( stats.dom );

	// Add event listeners
	window.addEventListener( 'resize', onWindowResize, false);
	window.addEventListener( 'mousedown', onMouseClick, false);
	window.addEventListener( 'dblclick', onDoubleClick, false);
	window.addEventListener( 'wheel', onScroll);
}

function onScroll(event) {
	camera.position.z += event.deltaY;
  }

// Change mode
function onDoubleClick( event )
{
	event.preventDefault();
	let intersected = false;
	let localPickedObj;
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// Check if we are doubleClicking a box or the whole scene
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );
	
	// calculate objects intersecting the picking ray
	let intersects = raycaster.intersectObjects( objects );
	if (intersects.length > 0)
	{
		localPickedObj = intersects[0].object;
		intersected = true;
	}
	
	// if we intersected a box
	if (intersected)
	{
		if (mode != "rotateScene")
		{
			// If we selected the same box, return to default mode
			if (pickedObj == localPickedObj)
			{
				if (mode == "default")
				{
					mode = "rotateBox";
				}
				else
				{
					mode = "default";
				}
			}
			// else, set local pick as global and set mode as rotate
			else
			{
				clearCircle();
	
				pickedObj = localPickedObj;
				mode = "rotateBox";
			}
		}
		else
		{
			pickedObj = localPickedObj;
			mode = "rotateBox";
		}
	}
	// Else, if we are in the default mode or rotateBox mode, change to rotateScene
	else
	{
		if (mode == "default" || mode == "rotateBox")
		{
			mode = "rotateScene";
		}
		else
		{
			mode = "default";
		}
	}
	console.log(mode);
}

function onMouseClick( event ) 
{
	event.preventDefault();

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( objects );
	if (intersects.length > 0)
	{
		if (mode != "default")
		{
			dragControls.enabled = false;
		}
		else
		{
			dragControls.enabled = true;
		}
	}
}

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

// Method to draw a sphere around rotating objects
function drawCircle()
{
	// If we have a selected object, draw a circle around it
	if (pickedObj)
	{
		if(mode == "rotateBox" && !circleEnabled)
		{
			circleEnabled = true;
			pickedObj.geometry.computeBoundingSphere();
	
			let sphereGeometry = new THREE.SphereGeometry(
				pickedObj.geometry.boundingSphere.radius * 2,
				32, 32
			);
	
			let sphereMaterial = new THREE.MeshLambertMaterial({
				color: 0x00ff00,
				transparent: true,
				opacity: 0.4,
				visible: true
			});

			let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    		pickedObj.add(sphere);
		}
		else if (mode != "rotateBox")
		{
			clearCircle();
		}
	}
	else
	{
		if (mode == "rotateScene" && !circleEnabled)
		{
			circleEnabled = true;

			let radius = computeSphereRadius();

			let sphereGeometry = new THREE.SphereGeometry(
				radius,
				32, 32
			);
	
			let sphereMaterial = new THREE.MeshLambertMaterial({
				color: 0x00ff00,
				transparent: true,
				opacity: 0.4,
				visible: true,
			});

			let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
			sphere.name = "MainSphere";
    		scene.add(sphere);
		}
		else if (mode != "rotateScene")
		{
			clearCircle();
		}
	}
}

// Method to clear the sphere drawing
function clearCircle()
{
	circleEnabled = false;

	if (pickedObj)
	{
		for (let i = pickedObj.children.length - 1; i >= 0; i--) {
			pickedObj.remove(pickedObj.children[i]);
		}
		
		pickedObj = undefined;
	}
	else
	{
		var mainSphere = scene.children.find(
			(element) => element.name == "MainSphere"
		);

		if (mainSphere)
		{
			scene.remove(mainSphere);
		}
	}
}

function computeSphereRadius()
{
	let maxPosX = 0;
	let minPosX = 0;
	let maxPosY = 0;
	let minPosY = 0;
	let maxPosZ = 0;
	let minPosZ = 0;

	for (let i = objects.length - 1; i >= 0; i--) {
		let x = objects[i].position.x;
		let y = objects[i].position.y;
		let z = objects[i].position.z;

		if (x < minPosX)
		{
			minPosX = x;
		}
		if (x > maxPosX)
		{
			maxPosX = x;
		}
		if (y < minPosY)
		{
			minPosY = y;
		}
		if (y > maxPosY)
		{
			maxPosY = y;
		}
		if (z < minPosZ)
		{
			minPosZ = z;
		}
		if (z > maxPosZ)
		{
			maxPosZ = z;
		}
	}

	return Math.max(maxPosX-minPosX, maxPosY-minPosY, maxPosZ-minPosZ);
}

function animate() 
{
	requestAnimationFrame( animate );
	drawCircle();
	render();
	stats.update();

}

function render()
{
	renderer.render( scene, camera );
}               