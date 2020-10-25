var PathFollowingControls = function(params){
  this.isControl = true;

  this.interpolationSpeed = (!(typeof params.interpolationSpeed == UNDEFINED))? params.interpolationSpeed: 0.001;
  this.restart = params.restart || false;
  this.onFinished = params.onFinished || noop;
  this.mouseSpeed = (!(typeof params.mouseDragSpeed == UNDEFINED))? params.mouseSpeed: 0.002;
  this.swipeSpeed = (!(typeof params.swipeSpeed == UNDEFINED))? params.swipeSpeed: 0.002;
  var markedPointNames = params.markedPointNames;

  this.positions = [];
  for (var i = 0; i < markedPointNames.length; i ++){
    var markedPoint = markedPoints[markedPointNames[i]];
    this.positions.push(new THREE.Vector3(markedPoint.x, markedPoint.y, markedPoint.z));
  }
}

PathFollowingControls.prototype.onMouseWheel = noop;
PathFollowingControls.prototype.onMouseMove = noop;
PathFollowingControls.prototype.onMouseDown = noop;
PathFollowingControls.prototype.onMouseUp = noop;
PathFollowingControls.prototype.onPinch = noop;
PathFollowingControls.prototype.onTap = noop;
PathFollowingControls.prototype.onClick = noop;
PathFollowingControls.prototype.onDeactivated = noop;
PathFollowingControls.prototype.onTouchStart = noop;
PathFollowingControls.prototype.onTouchMove = noop;
PathFollowingControls.prototype.onTouchEnd = noop;
PathFollowingControls.prototype.onKeyDown = noop;
PathFollowingControls.prototype.onKeyUp = noop;
PathFollowingControls.prototype.onResize = noop;
PathFollowingControls.prototype.onFullScreenChange = noop;
PathFollowingControls.prototype.onDrag = noop;

PathFollowingControls.prototype.onSwipe = function(x, y, diffX, diffY){
  camera.rotation.y += diffX * activeControl.swipeSpeed;
  camera.rotation.x += diffY * activeControl.swipeSpeed;
}

PathFollowingControls.prototype.onActivated = function(){
  this.curIndex = 0;
  this.curInterpolationCoef = 0;
  this.isFinished = false;

  this.totalXRotation = 0;

  if (!isMobile && !pointerLockEventHandler.isPointerLocked){
    pointerLockRequested = true;
  }
}

PathFollowingControls.prototype.onMouseMove = function(event){
  if (!pointerLockEventHandler.isPointerLocked){
    return;
  }
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  var dx = (-movementX * this.mouseSpeed);
  camera.rotation.y += dx;
  var dy = -movementY * this.mouseSpeed;
  if (!(dy > 0 && (this.totalXRotation + dy >= 1.10)) && !(dy <0 && (this.totalXRotation + dy <= -1.10))){
    camera.rotation.x += dy;
    this.totalXRotation += dy;
  }
}

PathFollowingControls.prototype.update = function(){
  if (!isMobile && !pointerLockEventHandler.isPointerLocked){
    pointerLockRequested = true;
  }
  
  if (this.isFinished){
    return;
  }
  var curPoint = this.positions[this.curIndex];
  var nextPoint = this.positions[this.curIndex + 1];

  camera.position.lerpVectors(curPoint, nextPoint, this.curInterpolationCoef);
  this.curInterpolationCoef += this.interpolationSpeed;

  if (this.curInterpolationCoef > 1){
    this.curInterpolationCoef = 0;
    this.curIndex ++;
    if (this.curIndex == this.positions.length -1){
      if (!this.restart){
        this.isFinished = true;
        this.onFinished();
      }else{
        this.curIndex = 0;
      }
    }
  }
}
