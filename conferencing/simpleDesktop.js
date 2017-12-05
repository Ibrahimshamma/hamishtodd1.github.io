//moving mouse left and right causes it to rotate. Holding mouse down makes your reticle appear? Yeah, because the 3d effect is the point

initializers.simpleDesktop = function(socket, pdbWebAddress, roomKey, launcher, visiBox, thingsToBeUpdated, renderer, userManager )
{
	camera.rotation.order = "YXZ";

	var mouse = initMouseSystem(renderer);

	var load = initPoiSphereAndButtonMonitorerAndMovementSystem();
	var poiSphere = load.poiSphere;
	var buttonsHeld = load.buttonsHeld;
	var moveCamera = load.moveCamera;

	buttonsHeld.ctrl = false;
	function associateKeyHoldToBoolean(keyCode, buttonKey)
	{
		document.addEventListener( 'keydown', function(event)
		{
			if(event.keyCode === keyCode )
			{
				buttonsHeld[buttonKey] = true;
			}
		});
		document.addEventListener( 'keyup', function(event)
		{
			if(event.keyCode === keyCode )
			{
				buttonsHeld[buttonKey] = false;
			}
		});
	}
	associateKeyHoldToBoolean(17, "ctrl");
	associateKeyHoldToBoolean(87, "forward");
	associateKeyHoldToBoolean(83, "backward");
	associateKeyHoldToBoolean(65, "left");
	associateKeyHoldToBoolean(68, "right");

	var viewPlaneIndicator = new THREE.Mesh(new THREE.PlaneGeometry(0.08,0.08), new THREE.MeshBasicMaterial({color:0xFF0000,transparent:true,opacity:0.4}));
	viewPlaneIndicator.visible = false
	scene.add(viewPlaneIndicator);

	var reticle = new THREE.Mesh(new THREE.CircleBufferGeometry(0.0009,32), new THREE.MeshBasicMaterial({color:0xFFFFFF, side: THREE.DoubleSide}));
	reticle.visible = false;
	scene.add(reticle);

	window.addEventListener( 'resize', function()
	{
	    renderer.setSize( window.innerWidth, window.innerHeight ); //nothing about vr effect?
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	});

	coreLoops.simpleDesktop = function( socket, visiBox, thingsToBeUpdated, userManager, mouse )
	{
		frameDelta = ourClock.getDelta();

		mouse.readFromAsynchronousInput();
		// if(!mouse.clicking)
		{
			// if(!buttonsHeld.ctrl)
			{
				// model.localToWorld(pointOfInterestInModel);
				// camera.worldToLocal(pointOfInterestInModel);
				var pointOfInterestInModel = poiSphere.getPoi(camera);

				camera.rotation.y += -mouse.proportionalDelta.x * 4;
				camera.rotation.x += mouse.proportionalDelta.y*2;
				camera.rotation.y = clamp(camera.rotation.y, -TAU/2, TAU/2);
				camera.rotation.x = clamp(camera.rotation.x, -TAU/4, TAU/4);
				camera.updateMatrixWorld();

				var currentLocationOfPOI = poiSphere.getPoi(camera);
				model.position.sub(pointOfInterestInModel);
				model.position.add(currentLocationOfPOI);

				poiSphere.position.copy(currentLocationOfPOI)
			}
			// else
			// {
			// 	model.position.addScaledVector(mouse.delta,0.1);
			// }
			
			viewPlaneIndicator.position.copy(poiSphere.position)
			viewPlaneIndicator.lookAt(camera.position);
		}
		// else
		// {
		// 	reticle.position.copy(mouse.position);
		// 	reticle.position.lerp(camera.position,0.98)
		// 	reticle.lookAt(camera.position);
		// }
		// reticle.visible = mouse.clicking;
		// viewPlaneIndicator.visible = buttonsHeld.ctrl;

		moveCamera();
		
		for( var thing in thingsToBeUpdated)
		{
			if( thingsToBeUpdated[thing].length !== undefined)
			{
				for(var i = 0, il = thingsToBeUpdated[thing].length; i < il; i++)
				{
					thingsToBeUpdated[thing][i].update();
				}
			}
			else
				thingsToBeUpdated[thing].update();
		}
		
		userManager.sendOurUpdate();
	}

	function render()
	{
		coreLoops.simpleDesktop( socket, visiBox, thingsToBeUpdated, userManager, mouse )

		requestAnimationFrame( render );
		setTimeout(renderer.render( scene, camera ),500);
	}
	launcher.render = render;
}

function clamp(n, min, max)
{
	return Math.max(min, Math.min(n, max))
}

function initMouseSystem(renderer)
{
	var mouse = {
		position: new THREE.Vector3(),
		oldPosition: new THREE.Vector3(),

		delta: new THREE.Vector3(),

		clicking: false,
		oldClicking: false,

		proportionalPosition: new THREE.Vector2(),
		oldProportionalPosition: new THREE.Vector2(),
		proportionalDelta:new THREE.Vector2()
	};

	mouse.readFromAsynchronousInput = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronousInput.clicking;

		this.oldProportionalPosition.copy(this.proportionalPosition);
		this.proportionalPosition.copy(asynchronousInput.proportionalPosition);
		this.proportionalDelta.subVectors(this.proportionalPosition,this.oldProportionalPosition);
		
		this.oldPosition.copy(mouse.position);
		this.position.copy(asynchronousInput.position);
		this.delta.subVectors(this.position, this.oldPosition);
	}

	var asynchronousInput = { //only allowed to use this in this file, and maybe in init
		position: new THREE.Vector3(),
		proportionalPosition: new THREE.Vector2(),
		leftClicking: false,
		rightClicking: false,
	};

	//We assume that you are looking directly at the xy plane, and that the renderer is the view dimensions
	asynchronousInput.updateMousePosition = function(rawX,rawY)
	{
		//center
		var rendererDimensions = renderer.getSize();
		asynchronousInput.proportionalPosition.x = rawX - ( rendererDimensions.width / 2 );
		asynchronousInput.proportionalPosition.y = -rawY+ ( rendererDimensions.height/ 2 ) - document.body.scrollTop;
		
		//scale
		asynchronousInput.proportionalPosition.x /= rendererDimensions.width / 2;
		asynchronousInput.proportionalPosition.y /= rendererDimensions.height / 2;

		if(camera.isOrthographicCamera)
		{
			var centerToFrameVertical = (camera.top - camera.bottom) / 2;
			var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		}
		else
		{
			var centerToFrameVertical = Math.tan( camera.fov * TAU / 360 / 2 );
			var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		}
		
		asynchronousInput.position.z = -1;
		asynchronousInput.position.x = asynchronousInput.proportionalPosition.x * centerToFrameHorizontal;
		asynchronousInput.position.y = asynchronousInput.proportionalPosition.y * centerToFrameVertical;
		
		camera.localToWorld( asynchronousInput.position );
	}

	document.addEventListener( 'mousemove', function(event)
	{
		// console.log(event)
		asynchronousInput.updateMousePosition(event.clientX,event.clientY);
	} );
	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronousInput.leftClicking = true;
	} );
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronousInput.leftClicking = false;
	} );

	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronousInput.clicking = true;
	} );
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronousInput.clicking = false;
	} );

	return mouse;
}