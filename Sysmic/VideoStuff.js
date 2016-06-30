function initVideo()
{	
	// create the video element
	video = document.createElement( 'video' );
	video.src = "http://hamishtodd1.github.io/Sysmic/sintel.mp4"; //http://hamishtodd1.github.io/
	video.crossOrigin = "anonymous";
	
//	 video.id = 'video';
//	 video.type = ' video/ogg; codecs="theora, vorbis" ';
	
	video.load(); // must call after setting/changing source
	video.play();
	
	var videoImage = document.createElement( 'canvas' );
	videoImage.width = 480;
	videoImage.height = 204;

	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var movieGeometry = new THREE.PlaneGeometry( VIEWBOX_WIDTH,VIEWBOX_HEIGHT,4, 4 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,0,0);
	Scene.add(movieScreen);
}

//
//function update()
//{
//	if ( keyboard.pressed("p") )
//		video.play();
//		
//	if ( keyboard.pressed("space") )
//		video.pause();
//
//	if ( keyboard.pressed("s") ) // stop video
//	{
//		video.pause();
//		video.currentTime = 0;
//	}
//	
//	if ( keyboard.pressed("r") ) // rewind video
//		video.currentTime = 0;
//}
	
	