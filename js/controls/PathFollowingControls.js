var PathFollowingControls = function(params){
  this.isControl = true;

  this.interpolationSpeed = (!(typeof params.interpolationSpeed == UNDEFINED))? params.interpolationSpeed: 0.001;
  this.restart = params.restart || false;
  this.onFinished = params.onFinished || noop;
  this.mouseDragSpeed = (!(typeof params.mouseDragSpeed == UNDEFINED))? params.mouseDragSpeed: 15;
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

PathFollowingControls.prototype.onSwipe = function(x, y, diffX, diffY){
  camera.rotation.y += diffX * activeControl.swipeSpeed;
  camera.rotation.x += diffY * activeControl.swipeSpeed;
}

PathFollowingControls.prototype.onDrag = function(x, y, movementX, movementY){
  camera.rotation.y += (movementX / 10000) * activeControl.mouseDragSpeed;
  camera.rotation.x += (movementY / 10000) * activeControl.mouseDragSpeed;
}

PathFollowingControls.prototype.onActivated = function(){
  this.curIndex = 0;
  this.curInterpolationCoef = 0;
  this.isFinished = false;
}

PathFollowingControls.prototype.update = function(){
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
