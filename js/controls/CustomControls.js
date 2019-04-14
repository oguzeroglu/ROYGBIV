var CustomControls = function(params){
  this.isControl = true;
  this.onClickFunc = params.onClick;
  this.onTapFunc = params.onTap;
  this.onSwipeFunc = params.onSwipe;
  this.onPinchFunc = params.onPinch;
  this.onMouseWheelFunc = params.onMouseWheel;
  this.onUpdateFunc = params.onUpdate;
  this.onMouseMoveFunc = params.onMouseMove;
  this.onMouseDownFunc = params.onMouseDown;
  this.onMouseUpFunc = params.onMouseUp;
}

CustomControls.prototype.onActivated = noop;

CustomControls.prototype.onClick = function(event){
  this.onClickFunc(event);
}

CustomControls.prototype.onTap = function(event){
  this.onTapFunc(event);
}

CustomControls.prototype.onSwipe = function(diffX, diffY){
  this.onSwipeFunc(diffX, diffY);
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

CustomControls.prototype.update = function(){
  this.onUpdateFunc();
}
