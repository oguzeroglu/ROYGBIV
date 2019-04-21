var FullScreenEventHandler = function(){
  canvas.onfullscreenchange = this.onFullScreenChange;
}

FullScreenEventHandler.prototype.onFullScreenChange = function(event){
  if (document.fullscreenElement == canvas){
    onFullScreen = true;
    activeControl.onFullScreenChange(true);
    if (mode == 1 && screenFullScreenChangeCallbackFunction){
      screenFullScreenChangeCallbackFunction(true);
    }
  }else{
    onFullScreen = false;
    activeControl.onFullScreenChange(false);
    if (mode == 1 && screenFullScreenChangeCallbackFunction){
      screenFullScreenChangeCallbackFunction(false);
    }
  }
}
