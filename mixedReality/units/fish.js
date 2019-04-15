function initFish( visiBox )
{
	let flatland = new THREE.Object3D();
	let universeWidth = 1;

	let fish = new THREE.Object3D();
	let fishLength = 0.15;
	let fishMaterial = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		transparent: true,
		clippingPlanes: visiBox.planes
	})
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			fishMaterial ) );
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			fishMaterial ) );
	fish.children[0].position.z = 0.00006;
	fish.children[1].position.z =-0.00006;

	new THREE.TextureLoader().setCrossOrigin(true).load("data/fish.png",function(texture)
	{
		fishMaterial.map = texture
		fishMaterial.needsUpdate = true
	},function(){},function(e){console.error(e)})

	//don't have an octahedron, just have a pair of circles

	{
		let fishEye = new THREE.Object3D();
		let pupilRadius = fishLength / 40;
		let eyeWhite = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius*2, pupilRadius*2, fish.children[0].position.z * 4, 20), new THREE.MeshBasicMaterial({ color:0xFFFFFF, clippingPlanes: visiBox.planes }));
		let fishPupil = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius, pupilRadius, fish.children[0].position.z * 6, 20), new THREE.MeshBasicMaterial({ color:0x000000, clippingPlanes: visiBox.planes }));
		let blickCountdown = 0;
		fishEye.add(eyeWhite);
		fishEye.add(fishPupil);
		fishEye.rotation.x = TAU / 4;
		fishEye.position.x = 0.04 * fishLength / (universeWidth / 8);
		fish.add(fishEye);

	}

	{
		var octagon = new THREE.Mesh(new THREE.CylinderGeometry(fishLength / 2,fishLength / 2, fish.children[0].position.z * 4, 8, 1, false, TAU / 16), new THREE.MeshBasicMaterial({ color:0xFF6A00 }));
		octagon.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
		// flatland.add(octagon)
	}

	let grabbed2DObject = fish

	let pointInHand = new THREE.Vector3(1,0,0)
	updateFunctions.push(function()
	{
		imitationHand.standardVigorousMovement()
		// imitationHand.position.set(0,0,1)
		// imitationHand.rotation.y = 0.8 * Math.sin( frameCount * 0.05 )

		console.assert(flatland.quaternion.equals(new THREE.Quaternion()))
		let universePlane = new THREE.Plane(zUnit.clone(),0).applyMatrix4(flatland.matrix)
		let handProjected = universePlane.projectPoint( imitationHand.position.clone(), new THREE.Vector3() )
		grabbed2DObject.position.copy(handProjected)

		//hand is origin
		let fishRelative = grabbed2DObject.getWorldPosition( new THREE.Vector3() ).sub(imitationHand.position)

		let worldishPointInHand = pointInHand.clone().applyQuaternion(imitationHand.quaternion)
		let worldishPointInHandOnPlane = worldishPointInHand.clone().projectOnPlane(fishRelative).normalize()

		let oldWorldishPointInHand = pointInHand.clone().applyQuaternion(imitationHand.oldQuaternion)
		let oldWorldishPointInHandOnPlane = oldWorldishPointInHand.clone().projectOnPlane(fishRelative).normalize()

		let diff = new THREE.Quaternion().setFromUnitVectors(oldWorldishPointInHandOnPlane,worldishPointInHandOnPlane)
		grabbed2DObject.quaternion.multiply(diff)

		pointInHand.copy(worldishPointInHand).applyQuaternion(imitationHand.quaternion.clone().inverse())

		if(0)
		{
			let focusPosition = new THREE.Vector3(0,0,0);
			fish.updateMatrix();
			fishEye.updateMatrix();
			let invFish = new THREE.Matrix4();
			let invEye = new THREE.Matrix4();
			invFish.getInverse(fish.matrix);
			invEye.getInverse(fishEye.matrix);
			
			//could control the eye with the joystick?
			
			fishPupil.position.copy(focusPosition);
			fishPupil.position.applyMatrix4(invFish);
			fishPupil.position.applyMatrix4(invEye);
			fishPupil.position.setLength(pupilRadius);
			fishPupil.position.y = 0;
			
			//untested
	//			if(Math.random() < 0.01)
	//			{
	//				eyeWhite.material.color.set(0,0,0);
	//				blickCountdown = 0.1;
	//			}
	//			blickCountdown -= delta_t;
	//			if( blickCountdown < 0 )
	//				eyeWhite.material.color.set(1,1,1);
		}
	})
	
	{
		let spacing = 0.07
		let grid = new THREE.LineSegments( new THREE.Geometry(), new THREE.MeshBasicMaterial({
			color:0x333333,
			clippingPlanes: visiBox.planes
		}) )
		let numWide = 36
		let numTall = 20
		let verticalExtent = numTall/2*spacing
		let horizontalExtent = numWide/2*spacing
		for(let i = 0; i < numWide+1; i++)
		{
			let x = (i-numWide/2)*spacing
			grid.geometry.vertices.push(new THREE.Vector3(x,-verticalExtent,0),new THREE.Vector3(x,verticalExtent,0))
		}
		for( let i = 0; i < numTall+1; i++)
		{
			let y = (i-numTall/2)*spacing
			grid.geometry.vertices.push(new THREE.Vector3(-horizontalExtent,y,0),new THREE.Vector3(horizontalExtent,y,0))
		}
		scene.add(grid)
	}

	return fish
}