var soundinstance= "null";
function loadSound(){
	bckgMusic="music";
	createjs.Sound.registerSound("sounds/music.mp3", bckgMusic);
}


function playSound() {
		if (soundinstance==="null"){
			soundinstance= createjs.Sound.play("music", {offset: 4000, loop: 10});
			soundinstance.volume=0.5;
			stateMusicOn= true;
			return;
		}
		if(stateMusicOn){
			soundinstance.muted=true;
			stateMusicOn=false;
			return;
		}
		if (!stateMusicOn){
			soundinstance.muted=false;
			stateMusicOn=true;
			return;
		}
		// createjs.Sound.play("music");

}
function muteSound(){

}
