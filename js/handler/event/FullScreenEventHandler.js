var FullScreenEventHandler = function(){
  canvas.onfullscreenchange = this.onFullScreenChange;
}

FullScreenEventHandler.prototype.onFullScreenChange = function(event){
  if (document.fullscreenElement == canvas){
    onFullScreen = true;
    if (mode == 1 && screenFullScreenChangeCallbackFunction){
      screenFullScreenChangeCallbackFunction(true);
    }
  }else{
    onFullScreen = false;
    if (mode == 1 && screenFullScreenChangeCallbackFunction){
      screenFullScreenChangeCallbackFunction(false);
    }
  }
}
