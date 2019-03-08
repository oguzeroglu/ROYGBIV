var TouchEventHandler = function(){
  canvas.ontouchstart = this.onTouchStart;
  canvas.ontouchmove = this.onTouchMove;
  canvas.ontouchcancel = this.onTouchEnd;
  canvas.ontouchend = this.onTouchEnd;
}

TouchEventHandler.prototype.onTouchStart = function(event){
  console.log("touchstart");
}

TouchEventHandler.prototype.onTouchMove = function(event){
  console.log("touchmove");
}

TouchEventHandler.prototype.onTouchEnd = function(event){
  console.log("touchend");
}
