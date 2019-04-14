var FPSControls = function(params){
  this.isControl = true;
  this.keyboardActions = [
    {key: "W", action: this.goForward},
    {key: "Z", action: this.goForward},
    {key: "S", action: this.goBackward}
  ]
  this.playerBodyObject = params.playerBodyObject;
}

FPSControls.prototype.onClick = noop;
FPSControls.prototype.onTap = noop;
FPSControls.prototype.onSwipe = noop;
FPSControls.prototype.onPinch = noop;
FPSControls.prototype.onMouseWheel = noop;
FPSControls.prototype.onMouseMove = noop;
FPSControls.prototype.onMouseDown = noop;
FPSControls.prototype.onMouseUp = noop;
FPSControls.prototype.onActivated = noop;

FPSControls.prototype.goForward = function(){

}

FPSControls.prototype.goBackward = function(){

}

FPSControls.prototype.update = function(){
  camera.position.copy(this.playerBodyObject.mesh.position);
}

FPSControls.prototype.onActivated = function(){
  this.playerBodyObject.show();
  this.playerBodyObject.hide(true);
  var len = this.keyboardActions.length;
  for (var i = 0; i<len; i++){
    var curAction = this.keyboardActions[i];
    if (keyboardBuffer[curAction.key]){
      curAction.action();
    }
  }
}
