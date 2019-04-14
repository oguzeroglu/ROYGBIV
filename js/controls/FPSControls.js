var FPSControls = function(params){
  this.isControl = true;
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
FPSControls.prototype.update = noop;
FPSControls.prototype.onActivated = noop;
