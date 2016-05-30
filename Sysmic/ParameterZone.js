//probably needs a square grid

var ParameterZone;
var ParameterControlCursor;

var MAX_Infectiousness = 5; //or whatever
var MAX_RecoveryTime = 5;
var MIN_Infectiousness = -MAX_Infectiousness; //or whatever
var MIN_RecoveryTime = -MAX_RecoveryTime;

//no, the best thing to do is have the point stay with you, but be as close as possible to your finger!

function init_parameterzone()
{
	ParameterZone = new THREE.Object3D();
	
	ParameterZone.add(boundingbox.clone());
	
	ParameterControlCursor = new THREE.Mesh( 
			new THREE.CircleGeometry( 0.08, 32 ), 
			new THREE.MeshBasicMaterial( { color: 0xAAAAFF } ) );
	ParameterZone.add(ParameterControlCursor);
	
	update_Infectiousness_and_RecoveryTime();
	
	ParameterZone.position.x = (VIEWBOX_WIDTH + VIEWBOX_SPACING);
	Scene.add(ParameterZone)
	
	ParameterControlCursor.grabbed = 0;
	
	var proportionalposition = ParameterControlCursor.position.clone();
//	proportionalposition.x += VIEWBOX_WIDTH / 2; //it's fun to experiment with them being negative
//	proportionalposition.y += VIEWBOX_HEIGHT/ 2;
	
	proportionalposition.x /= VIEWBOX_WIDTH / 2;
	proportionalposition.y /= VIEWBOX_HEIGHT / 2;
	
	Infectiousness = MAX_Infectiousness * proportionalposition.y;
	RecoveryTime = MAX_RecoveryTime * proportionalposition.x; //because we think of time as going to the right
}

function update_parameterzone()
{
	var ParameterSpaceMousePosition = MousePosition.clone();
	ParameterSpaceMousePosition.sub(ParameterZone.position);
	
	if( Math.abs(ParameterSpaceMousePosition.x) < VIEWBOX_WIDTH / 2
		&& Math.abs(ParameterSpaceMousePosition.y) < VIEWBOX_HEIGHT / 2 
		&& isMouseDown && !isMouseDown_previously)
	{
		ParameterControlCursor.grabbed = 1;
	}

	if(!isMouseDown)
		ParameterControlCursor.grabbed = 0;
	
	if( ParameterControlCursor.grabbed )
	{
		ParameterControlCursor.position.copy(ParameterSpaceMousePosition);
		
		update_Infectiousness_and_RecoveryTime()
		
		//Do viruses drastically change parameters while infecting a population?
		//Probably no, so you should comment this out, taking away the line, and even clear the graph. But it's fun!
//		for(var i = 0; i < PhaseLine.geometry.vertices.length; i++)
//			PhaseLine.geometry.vertices[i].copy(PhaseControlCursor.position);
		
		//also reset vector field
		set_vector_field();
	}
}

function update_Infectiousness_and_RecoveryTime()
{
	var proportionalposition = ParameterControlCursor.position.clone();
	proportionalposition.x += VIEWBOX_WIDTH / 2;
	proportionalposition.y += VIEWBOX_HEIGHT/ 2;
	
	proportionalposition.x /= VIEWBOX_WIDTH;
	proportionalposition.y /= VIEWBOX_HEIGHT;
	
	if(proportionalposition.x < 0)
		proportionalposition.x = 0;
	if(proportionalposition.x > 1)
		proportionalposition.x = 1;
	if(proportionalposition.y < 0)
		proportionalposition.y = 0;
	if(proportionalposition.y > 1)
		proportionalposition.y = 1;
	
	Infectiousness =MIN_Infectiousness+ (MAX_Infectiousness - MIN_Infectiousness ) * proportionalposition.y;
	RecoveryTime = 	MIN_RecoveryTime  + (MAX_RecoveryTime   - MIN_RecoveryTime   ) * proportionalposition.x; //because we think of time as going to the right
	
	proportionalposition.x *= VIEWBOX_WIDTH;
	proportionalposition.y *= VIEWBOX_HEIGHT;
	
	proportionalposition.x -= VIEWBOX_WIDTH / 2;
	proportionalposition.y -= VIEWBOX_HEIGHT / 2;
	
	ParameterControlCursor.position.copy(proportionalposition);
}

function set_vector_field()
{
	var where_youd_go = new THREE.Vector3();
	
	for(var i = 0; i < PhaseZoneArrows.length; i++)
	{
		var our_represented_state = get_specified_state(PhaseZoneArrows[i].position);
		where_youd_go.copy(get_phasezone_position(
				GetNextInfected(our_represented_state.specifiedInfected),
				GetNextResistant(our_represented_state.specifiedResistant) ) );
		
		set_arrow(where_youd_go,PhaseZoneArrows[i]);
		
		PhaseZoneArrows[i].geometry.verticesNeedUpdate = true;
	}
}