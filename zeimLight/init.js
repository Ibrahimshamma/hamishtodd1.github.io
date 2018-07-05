/*
	Hmm, if it all takes place on a board, and you're moving around on it, well, that's the timeline
	Could be used for navigation / scrollability

	The youtube thing is a colossal perverse incentive
		Subtleties in interactive learning is your raison d'etre, but here we are, making something non-interactive

	Eventually
		-mp3; diffed record.
		-Working on tablets. Phones get embed and maybe message. No need to worry about address bar
		-VR interaction / funkiness in which you move your head and hand around and camera is in right place
		-Would be nice if people could spectate live
		-send to haxiomic/mrdoob/wannerstedt, get "make it nicer looking for free by doing this:"
		-fix lighting
		-editing suite?

	To make
		-Maryam Mirzakhani, 14th of July
		-my favourite 3d patterns/neoshapes
		-Something with bloody puzzles
		-pwg

	You can bring interface bits on and off, less need to think about some great big "game state" thing
*/

// function importScript(scriptName)
// {
// 	var extraScript = document.createElement('script');
// 	extraScript.setAttribute('src',scriptName + '.js');
// 	document.body.appendChild(extraScript);
// 	extraScript.onload = init;
// }
// importScript('variables')

(function init()
{
	var buttonBindings = {};
	bindButton = function( buttonName, ourFunction, functionDescription )
	{
		console.log(buttonName.toUpperCase() + ": " + functionDescription)
		buttonBindings[buttonName] = ourFunction;
	}

	var platform = getPlatform()
	if(platform === "phone" )
	{
		//and a message telling you it's better on desktop
		var iframe = document.createElement("iframe");
	    iframe.setAttribute("src","https://www.youtube.com/embed/agOdP2Bmieg"); 
	    iframe.style.width  = window.innerWidth;
	    iframe.style.height = window.innerHeight;

	    document.body.appendChild(iframe);
	    return;
	}

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor(0x000000) //youtube
	document.body.appendChild( renderer.domElement );

	function render()
	{
		{
			frameDelta = clock.getDelta();
			
			mouse.updateFromAsyncAndCheckClicks();

			for(var i = 0; i < objectsToBeUpdated.length; i++)
			{
				objectsToBeUpdated[i].update();
			}

			frameCount++;
		}

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	initCameraAndRendererResizeSystemAndCameraRepresentation(renderer);

	initMouse();
	initMirzakhani();

	initImagesAndVideos();

	var buttonIndexGivenName = {
		"enter":13,
		"alt":18,
		"shift":16,

		"left":37,
		"up":38,
		"right":39,
		"down":12,
		"space":32
	}
	//don't use ctrl
	document.addEventListener( 'keydown', function(event)
	{
		for( var buttonName in buttonBindings )
		{
			if( event.keyCode === buttonIndexGivenName[buttonName] )
			{
				buttonBindings[buttonName]();
				return
			}
		}
	}, false );

	render();
})();