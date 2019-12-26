var TouchEventHandler = function(){
  if (!isMobile){
    return;
  }
  canvas.addEventListener('touchstart', this.onTouchStart, false);
  canvas.addEventListener('touchmove', this.onTouchMove, false);
  canvas.addEventListener('touchcancel', this.onTouchEnd, false);
  canvas.addEventListener('touchend', this.onTouchEnd, false);
  this.distance = 0;
  this.isZooming = false;
  this.isSwiping = false;
  this.isTapping = false;
  this.lastSwipeCoordinates = {x: 0, y: 0, isInitiated: false};
  this.tapStartTime = 0;
  this.isThereFingerTouched = false;
  this.currentTouchCount = 0;
  this.tapThreshold = 310;
  this.touchTrack = new Map();
}

TouchEventHandler.prototype.onTouchStart = function(event){
  event.preventDefault();
  activeControl.onTouchStart(event);
  for (var i = 0; i<event.changedTouches.length; i++){
    var curTouch = event.changedTouches[i];
    touchEventHandler.touchTrack.set(curTouch.identifier, curTouch);
  }
  touchEventHandler.isZooming = false;
  touchEventHandler.isSwiping = false;
  touchEventHandler.isTapping = false;
  touchEventHandler.isThereFingerTouched = true;
  touchEventHandler.currentTouchCount = event.targetTouches.length;
  if (event.targetTouches.length == 1){
    touchEventHandler.isSwiping = true;
    touchEventHandler.isTapping = true;
  }
  if (event.targetTouches.length == 2){
    touchEventHandler.isZooming = true;
    touchEventHandler.isTapping = true;
  }
  if (!touchEventHandler.isZooming){
    touchEventHandler.distance = 0;
  }
  if (!touchEventHandler.isSwiping){
    touchEventHandler.lastSwipeCoordinates.isInitiated = false;
  }
  if (touchEventHandler.isTapping){
    touchEventHandler.tapStartTime = performance.now();
  }else{
    touchEventHandler.tapStartTime = 0;
  }

  if (event.changedTouches.length == 1 && mode == 1 && sceneHandler.hasDraggableSprite()){
    var touch = event.changedTouches[0];
    var rect = boundingClientRect;
    var coordX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    var coordY = - ((touch.clientY - rect.top) / rect.height) * 2 + 1;
    REUSABLE_VECTOR.setFromMatrixPosition(camera.matrixWorld);
    REUSABLE_VECTOR_2.set(coordX, coordY, 0.5).unproject(camera).sub(REUSABLE_VECTOR).normalize();
    rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, (mode == 0), onRaycasterMouseDownIntersection, touch.clientX, touch.clientY);
  }
}

TouchEventHandler.prototype.onTouchMove = function(event){
  event.preventDefault();
  event.stopPropagation();
  activeControl.onTouchMove(event);
  for (var i = 0; i<event.changedTouches.length; i++){
    var curTouch = event.changedTouches[i];
    touchEventHandler.touchTrack.set(curTouch.identifier, curTouch);
  }
  if (touchEventHandler.isZooming){
    if (event.changedTouches.length == 2){
      var t1 = event.changedTouches[0];
      var t2 = event.changedTouches[1];
      var xs = (t1.pageX - t2.pageX) * (t1.pageX - t2.pageX);
      var ys = (t1.pageY - t2.pageY) * (t1.pageY - t2.pageY);
      var dist = Math.sqrt(xs + ys);
      if (touchEventHandler.distance){
        touchEventHandler.onPinch(dist - touchEventHandler.distance);
      }
      touchEventHandler.distance = dist;
    }
  }
  if (touchEventHandler.isSwiping){
    if (event.changedTouches.length == 1){
      var t1 = event.changedTouches[0];
      if (touchEventHandler.lastSwipeCoordinates.isInitiated){
        var diffX = t1.clientX - touchEventHandler.lastSwipeCoordinates.x;
        var diffY = t1.clientY - touchEventHandler.lastSwipeCoordinates.y;
        if (mode ==1 && dragCandidate){
          draggingSprite = dragCandidate;
          dragCandidate = false;
          draggingSprite.onDragStarted(diffX, diffY);
        }
        activeControl.onSwipe(t1.clientX, t1.clientY, diffX, diffY);
        if (draggingSprite){
          draggingSprite.onDrag(diffX * 1.7, diffY * 1.7);
        }
      }
      touchEventHandler.lastSwipeCoordinates.x = t1.clientX;
      touchEventHandler.lastSwipeCoordinates.y = t1.clientY;
      touchEventHandler.lastSwipeCoordinates.isInitiated = true;
    }
  }
}

TouchEventHandler.prototype.onPinch = function(diff){
  if (mode == 1 && screenPinchCallbackFunction){
    screenPinchCallbackFunction(diff);
  }
  activeControl.onPinch(diff);
}

TouchEventHandler.prototype.onTap = function(touch){
  mouseEventHandler.onClick(touch, true);
  activeControl.onTap(touch);
  if (mode == 0 && !isDeployment){
    virtualKeyboardCreatorGUIHandler.onClick(touch.clientX, touch.clientY);
  }
}

TouchEventHandler.prototype.onTouchEnd = function(event){
  event.preventDefault();
  activeControl.onTouchEnd(event);
  for (var i = 0; i<event.changedTouches.length; i++){
    touchEventHandler.touchTrack.delete(event.changedTouches[i].identifier);
  }
  if (touchEventHandler.isTapping){
    if(performance.now() - touchEventHandler.tapStartTime < touchEventHandler.tapThreshold){
      touchEventHandler.onTap(event.changedTouches[0]);
    }
  }
  touchEventHandler.isZooming = false;
  touchEventHandler.isSwiping = false;
  touchEventHandler.isTapping = false;
  touchEventHandler.distance = 0;
  touchEventHandler.lastSwipeCoordinates.isInitiated = false;
  touchEventHandler.tapStartTime = 0;
  touchEventHandler.currentTouchCount = event.targetTouches.length;
  if (touchEventHandler.currentTouchCount == 0){
    touchEventHandler.isThereFingerTouched = false;
  }
  if (mode == 1 && event.changedTouches.length == 1 && draggingSprite){
    draggingSprite.onDragStopped();
  }
}
