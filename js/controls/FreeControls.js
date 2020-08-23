var FreeControls = function(params){
  this.isControl = true;
  this.rotationYDelta = (!(typeof params.rotationYDelta == UNDEFINED))? params.rotationYDelta: 0.07;
  this.rotationXDelta = (!(typeof params.rotationXDelta == UNDEFINED))? params.rotationXDelta: 0.07;
  this.translateZAmount = (!(typeof params.translateZAmount == UNDEFINED))? params.translateZAmount: 3;
  this.translateXAmount = (!(typeof params.translateXAmount == UNDEFINED))? params.translateXAmount: 3;
  this.translateYAmount = (!(typeof params.translateYAmount == UNDEFINED))? params.translateYAmount: 3;
  this.mouseWheelSpeed = (!(typeof params.mouseWheelSpeed == UNDEFINED))? params.mouseWheelSpeed: 1;
  this.swipeSpeed = (!(typeof params.swipeSpeed == UNDEFINED))? params.swipeSpeed: 0.002;
  this.mouseDragSpeed = (!(typeof params.mouseDragSpeed == UNDEFINED))? params.mouseDragSpeed: 15;
  this.requestFullScreen = (!(typeof params.requestFullScreen == UNDEFINED))? params.requestFullScreen: false;
  this.keyboardActions = [
    {key: "Left", action: this.incrRotationY},
    {key: "Right", action: this.decrRotationY},
    {key: "Up", action: this.incrRotationX},
    {key: "Down", action: this.decrRotationX},
    {key: "W", action: this.translateZNegative},
    {key: "Z", action: this.translateZNegative},
    {key: "S", action: this.translateZ},
    {key: "D", action: this.translateX},
    {key: "A", action: this.translateXNegative},
    {key: "Q", action: this.translateXNegative},
    {key: "E", action: this.translateY},
    {key: "Space", action: this.translateYNegative}
  ];
}

FreeControls.prototype.onMouseMove = noop;
FreeControls.prototype.onMouseUp = noop;
FreeControls.prototype.onMouseDown = noop;
FreeControls.prototype.onClick = noop;
FreeControls.prototype.onTap = noop;
FreeControls.prototype.onDeactivated = noop;
FreeControls.prototype.onTouchStart = noop;
FreeControls.prototype.onTouchMove = noop;
FreeControls.prototype.onTouchEnd = noop;
FreeControls.prototype.onKeyUp = noop;
FreeControls.prototype.onKeyDown = noop;
FreeControls.prototype.onResize = noop;

FreeControls.prototype.onDrag = function(x, y, movementX, movementY){
  camera.rotation.y += (movementX / 10000) * activeControl.mouseDragSpeed;
  camera.rotation.x += (movementY / 10000) * activeControl.mouseDragSpeed;
}

FreeControls.prototype.onActivated = function(){
  if (this.requestFullScreen){
    fullScreenRequested = true;
  }
}

FreeControls.prototype.onFullScreenChange = function(isFullScreen){
  if (!isFullScreen && activeControl.requestFullScreen){
    fullScreenRequested = true;
  }
}

FreeControls.prototype.incrRotationY = function(){
  camera.rotation.y += activeControl.rotationYDelta;
}

FreeControls.prototype.decrRotationY = function(){
  camera.rotation.y -= activeControl.rotationYDelta;
}

FreeControls.prototype.incrRotationX = function(){
  camera.rotation.x += activeControl.rotationXDelta;
}

FreeControls.prototype.decrRotationX = function(){
  camera.rotation.x -= activeControl.rotationXDelta;
}

FreeControls.prototype.translateZNegative = function(){
  camera.translateZ(-1 * activeControl.translateZAmount);
}

FreeControls.prototype.translateZ = function(){
  camera.translateZ(activeControl.translateZAmount);
}

FreeControls.prototype.translateXNegative = function(){
  camera.translateX(-1 * activeControl.translateXAmount);
}

FreeControls.prototype.translateX = function(){
  camera.translateX(activeControl.translateXAmount);
}

FreeControls.prototype.translateY = function(){
  camera.translateY(activeControl.translateYAmount);
}

FreeControls.prototype.translateYNegative = function(){
  camera.translateY(-1 * activeControl.translateYAmount);
}

FreeControls.prototype.onSwipe = function(x, y, diffX, diffY){
  camera.rotation.y += diffX * activeControl.swipeSpeed;
  camera.rotation.x += diffY * activeControl.swipeSpeed;
}

FreeControls.prototype.onPinch = function(diff){
  if (diff > 0){
    camera.translateZ(-1 * activeControl.translateZAmount);
  }else{
    camera.translateZ(activeControl.translateZAmount);
  }
}

FreeControls.prototype.onMouseWheel = function(event){
  var deltaX = event.deltaX;
  var deltaY = event.deltaY;
  if (Math.abs(deltaX) < Math.abs(deltaY)){

    if (deltaY > 290){
      deltaY = 290;
    }

    if (deltaY < -290){
      deltaY = -290;
    }

    camera.translateZ(activeControl.mouseWheelSpeed * deltaY);
  }else{

    if (deltaX > 290){
      deltaX = 290;
    }

    if (deltaX < -290){
      deltaX = -290;
    }

    camera.translateX(activeControl.mouseWheelSpeed * deltaX);
  }
}

FreeControls.prototype.update = function(){
  if (!isMobile){
    var len = this.keyboardActions.length;
    for (var i = 0 ; i<len; i++){
      var curAction = this.keyboardActions[i];
      if (keyboardBuffer[curAction.key]){
        curAction.action();
      }
    }
  }
}
