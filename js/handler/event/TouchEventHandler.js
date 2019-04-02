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
}

TouchEventHandler.prototype.onTouchStart = function(event){
  event.preventDefault();
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
}

TouchEventHandler.prototype.onTouchMove = function(event){
  event.preventDefault();
  event.stopPropagation();
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
        var diffX = t1.pageX - touchEventHandler.lastSwipeCoordinates.x;
        var diffY = t1.pageY - touchEventHandler.lastSwipeCoordinates.y;
        if (!(mode == 1 && defaultCameraControlsDisabled)){
          camera.rotation.y += diffX / 500;
          camera.rotation.x += diffY / 500;
        }
      }
      touchEventHandler.lastSwipeCoordinates.x = t1.pageX;
      touchEventHandler.lastSwipeCoordinates.y = t1.pageY;
      touchEventHandler.lastSwipeCoordinates.isInitiated = true;
    }
  }
}

TouchEventHandler.prototype.onPinch = function(diff){
  if (mode == 1 && screenPinchCallbackFunction){
    screenPinchCallbackFunction(diff);
  }
  if (!(mode == 1 && defaultCameraControlsDisabled)){
    if (diff > 0){
      camera.translateZ(-1 * translateZAmount * defaultAspect / camera.aspect);
    }else{
      camera.translateZ(translateZAmount * defaultAspect / camera.aspect);
    }
  }
}

TouchEventHandler.prototype.onTap = function(touch){
  mouseEventHandler.onClick(touch);
}

TouchEventHandler.prototype.onTouchEnd = function(event){
  event.preventDefault();
  if (touchEventHandler.isTapping){
    if(performance.now() - touchEventHandler.tapStartTime < 250){
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
}
