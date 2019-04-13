var FreeControls = function(params){
  this.isControl = true;
  this.left = "Left";
  this.right = "Right";
  this.up = "Up";
  this.down = "Down";
  this.space = "Space";
  this.w = "W";
  this.s = "S";
  this.d = "D";
  this.a = "A";
  this.e = "E";
  this.z = "Z";
  this.q = "Q";
  this.rotationYDelta = params.rotationYDelta;
  this.rotationXDelta = params.rotationXDelta;
  this.translateZAmount = params.translateZAmount;
  this.translateXAmount = params.translateXAmount;
  this.translateYAmount = params.translateYAmount;
  this.mouseWheelSpeed = params.mouseWheelSpeed;
  this.swipeSpeed = params.swipeSpeed;
  this.keyboardActions = [
    {key: this.left, action: this.incrRotationY},
    {key: this.right, action: this.decrRotationY},
    {key: this.up, action: this.incrRotationX},
    {key: this.down, action: this.decrRotationX},
    {key: this.w, action: this.translateZNegative},
    {key: this.z, action: this.translateZNegative},
    {key: this.s, action: this.translateZ},
    {key: this.d, action: this.translateX},
    {key: this.a, action: this.translateXNegative},
    {key: this.q, action: this.translateXNegative},
    {key: this.e, action: this.translateY},
    {key: this.space, action: this.translateYNegative}
  ];
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

FreeControls.prototype.onClick = function(event){

}

FreeControls.prototype.onTap = function(event){

}

FreeControls.prototype.onSwipe = function(diffX, diffY){
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
    camera.translateZ(activeControl.mouseWheelSpeed * deltaY);
  }else{
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
