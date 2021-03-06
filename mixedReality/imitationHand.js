function initImitationHand()
{
	imitationHand = new THREE.Group()

	imitationHand.grippingTop = false
	imitationHand.grippingTopOld = imitationHand.grippingTop
	imitationHand.oldPosition = new THREE.Vector3()
	imitationHand.oldQuaternion = new THREE.Quaternion()

	let radius = 0.01
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(radius,radius,radius*7)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(radius,radius,radius*7)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(radius,radius,radius*7)))
	imitationHand.children[0].rotation.x += TAU/4
	imitationHand.children[1].rotation.y += TAU/4
	imitationHand.children[2].rotation.z += TAU/4

	let grippingToggled = false
	bindButton( "space", function()
	{
		grippingToggled = true
	}, "toggle gripping" )

	imitationHand.standardVigorousMovement = function()
	{
		let t = frameCount * 0.9

		imitationHand.position.x = 0.6*Math.sin(t*0.03)
		imitationHand.position.y = 0.3*Math.sin(t*0.02)
		imitationHand.position.z = 0.4

		imitationHand.rotation.x = 0.6*Math.sin(t*0.1)
		imitationHand.rotation.y = 0.5*Math.sin(t*0.13)
		imitationHand.rotation.z = 0.4*Math.sin(t*0.07)

		imitationHand.quaternion.setFromEuler(imitationHand.rotation)

		imitationHand.updateMatrixWorld()
	}

	imitationHand.getDeltaQuaternion = function()
	{
		return new THREE.Quaternion().copy(imitationHand.oldQuaternion).inverse().multiply(imitationHand.quaternion)
	}

	updateImitationHand = function()
	{
		imitationHand.oldPosition.copy(imitationHand.position)
		imitationHand.oldQuaternion.copy(imitationHand.quaternion)

		imitationHand.grippingTopOld = imitationHand.grippingTop
		if( grippingToggled )
		{
			imitationHand.grippingTop = !imitationHand.grippingTop
			grippingToggled = false
		}
	}
}