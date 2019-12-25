var CustomControls = function(params){
  this.isControl = true;
  this.onClickFunc = params.onClick || noop;
  this.onTapFunc = params.onTap || noop;
  this.onSwipeFunc = params.onSwipe || noop;
  this.onPinchFunc = params.onPinch || noop;
  this.onMouseWheelFunc = params.onMouseWheel || noop;
  this.onUpdateFunc = params.onUpdate || noop;
  this.onMouseMoveFunc = params.onMouseMove || noop;
  this.onMouseDownFunc = params.onMouseDown || noop;
  this.onMouseUpFunc = params.onMouseUp || noop;
  this.onTouchStartFunc = params.onTouchStart || noop;
  this.onTouchMoveFunc = params.onTouchMove || noop;
  this.onTouchEndFunc = params.onTouchEnd || noop;
  this.onKeyUpFunc = params.onKeyUp || noop;
  this.onKeyDownFunc = params.onKeyDown || noop;
  this.onResizeFunc = params.onResize || noop;
  this.onFullScreenChangeFunc = params.onFullScreenChange || noop;
  this.onDragFunc = params.onDrag || noop;
}

CustomControls.prototype.onActivated = noop;
CustomControls.prototype.onDeactivated = noop;

CustomControls.prototype.onDrag = function(x, y, movementX, movementY){
  this.onDragFunc(x, y, movementX, movementY);
}

CustomControls.prototype.onFullScreenChange = function(isFullScreen){
  this.onFullScreenChangeFunc(isFullScreen);
}

CustomControls.prototype.onResize = function(){
  this.onResizeFunc();
}

CustomControls.prototype.onClick = function(event){
  this.onClickFunc(event);
}

CustomControls.prototype.onTap = function(event){
  this.onTapFunc(event);
}

CustomControls.prototype.onSwipe = function(x, y, diffX, diffY){
  this.onSwipeFunc(x, y, diffX, diffY);
}

CustomControls.prototype.onPinch = function(diff){
  this.onPinchFunc(diff);
}

CustomControls.prototype.onMouseWheel = function(event){
  this.onMouseWheelFunc(event);
}

CustomControls.prototype.onMouseMove = function(event){
  this.onMouseMoveFunc(event);
}

CustomControls.prototype.onMouseDown = function(event){
  this.onMouseDownFunc(event);
}

CustomControls.prototype.onMouseUp = function(event){
  this.onMouseUpFunc(event);
}

CustomControls.prototype.onTouchStart = function(event){
  this.onTouchStartFunc(event);
}

CustomControls.prototype.onTouchMove = function(event){
  this.onTouchMoveFunc(event);
}

CustomControls.prototype.onTouchEnd = function(event){
  this.onTouchEndFunc(event);
}

CustomControls.prototype.onKeyUp = function(event){
  this.onKeyUpFunc(event);
}

CustomControls.prototype.onKeyDown = function(event){
  this.onKeyDownFunc(event);
}

CustomControls.prototype.update = function(){
  this.onUpdateFunc();
}
