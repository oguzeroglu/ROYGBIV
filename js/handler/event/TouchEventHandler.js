var TouchEventHandler = function(){
  canvas.ontouchstart = this.onTouchStart;
  canvas.ontouchmove = this.onTouchMove;
  canvas.ontouchcancel = this.onTouchEnd;
  canvas.ontouchend = this.onTouchEnd;
  this.isAnyFingerTouching = false;
  this.touchCount = 0;
  this.touch1 = 0;
  this.touch2 = 0;
  this.touch1Initial = 0;
  this.touch2Initial;
  this.touch1Diff = {
    x: 0, y: 0
  }
  this.touch2Diff = {
    x:0, y: 0
  }
  this.touch1DiffFromInitial = {
    x: 0, y: 0
  }
  this.touch2DiffFromInitial = {
    x:0, y:0
  }
  this.lastTranslateXAmount = 0;
  this.lastTranslateYAmount = 0;
  this.lastTranslateZAmount = 0;
  this.distance = 0;
  this.isTap = true;
}

TouchEventHandler.prototype.onTouchStart = function(event){
  event.preventDefault();
  touchEventHandler.isAnyFingerTouching = true;
  if (event.targetTouches.length == 1){
    touchEventHandler.touch1 = event.targetTouches[0];
    touchEventHandler.touch1Initial = event.targetTouches[0];
    touchEventHandler.touchCount = 1;
    touchEventHandler.isTap = true;
  }else if (event.targetTouches.length == 2){
    touchEventHandler.isTap = false;
    touchEventHandler.touch2 = event.targetTouches[1];
    touchEventHandler.touch2Initial = event.targetTouches[1];
    touchEventHandler.touchCount = 2;
    var rect = boundingClientRect;
    var touch1X = ((touchEventHandler.touch1.clientX - rect.left) / rect.width) * 2 - 1;
    var touch1Y = - ((touchEventHandler.touch1.clientY - rect.top) / rect.height) * 2 + 1;
    var touch2X = ((touchEventHandler.touch2.clientX - rect.left) / rect.width) * 2 - 1;
    var touch2Y = - ((touchEventHandler.touch2.clientY - rect.top) / rect.height) * 2 + 1;
    touchEventHandler.distance = Math.sqrt(((touch2X - touch1X) * (touch2X - touch1X)) + ((touch2Y - touch1Y) * (touch2Y - touch1Y)));
  }
}

TouchEventHandler.prototype.onTouchMove = function(event){
  if (event.targetTouches.length == 1){
    var rect = boundingClientRect;
    var newCoordX = ((event.targetTouches[0].clientX - rect.left) / rect.width) * 2 - 1;
    var newCoordY = - ((event.targetTouches[0].clientY - rect.top) / rect.height) * 2 + 1;
    var oldCoordX = ((touchEventHandler.touch1.clientX - rect.left) / rect.width) * 2 - 1;
    var oldCoordY = - ((touchEventHandler.touch1.clientY - rect.top) / rect.height) * 2 + 1;
    var initialOldCoordX = ((touchEventHandler.touch1Initial.clientX - rect.left) / rect.width) * 2 - 1;
    var initialOldCoordY = - ((touchEventHandler.touch1Initial.clientY - rect.top) / rect.height) * 2 + 1;
    touchEventHandler.touch1Diff.x = newCoordX - oldCoordX;
    touchEventHandler.touch1Diff.y = newCoordY - oldCoordY;
    touchEventHandler.touch1DiffFromInitial.x = newCoordX - initialOldCoordX;
    touchEventHandler.touch1DiffFromInitial.y = newCoordY - initialOldCoordY;
    if (!(mode == 1 && defaultCameraControlsDisabled)){
      var translateXAmount = -350 * touchEventHandler.touch1Diff.x;
      var translateYAmount = -350 * touchEventHandler.touch1Diff.y;
      if (touchEventHandler.touch1Diff.y > 0.004 || touchEventHandler.touch1Diff.y < -0.004){
        camera.translateY(translateYAmount);
        touchEventHandler.lastTranslateYAmount = translateYAmount;
      }
      if (touchEventHandler.touch1Diff.x > 0.004 || touchEventHandler.touch1Diff.x < -0.004){
        camera.translateX(translateXAmount);
        touchEventHandler.lastTranslateXAmount = translateXAmount;
      }
    }
    touchEventHandler.touch1 = event.targetTouches[0];
  }else if (event.targetTouches.length == 2){
    if (event.changedTouches.length == 2){
      var rect = boundingClientRect;
      var touch1 = event.changedTouches[0];
      var touch2 = event.changedTouches[1];
      var touch1X = ((touch1.clientX - rect.left) / rect.width) * 2 - 1;
      var touch1Y = - ((touch1.clientY - rect.top) / rect.height) * 2 + 1;
      var touch2X = ((touch2.clientX - rect.left) / rect.width) * 2 - 1;
      var touch2Y = - ((touch2.clientY - rect.top) / rect.height) * 2 + 1;
      var newDistance = Math.sqrt(((touch2X - touch1X) * (touch2X - touch1X)) + ((touch2Y - touch1Y) * (touch2Y - touch1Y)));
      var translateZAmount = -350 * (newDistance - touchEventHandler.distance);
      touchEventHandler.lastTranslateZAmount = translateZAmount;
      camera.translateZ(translateZAmount);
      touchEventHandler.distance = newDistance;
    }
    for (var i = 0; i<event.changedTouches.length; i++){
      var changedTouch = 0;
      var initTouch = 0;
      var diff = 0, diffFromInitial = 0;
      if (event.changedTouches[i].identifier == touchEventHandler.touch1.identifier){
        changedTouch = touchEventHandler.touch1;
        initTouch = touchEventHandler.touch1Initial;
        diff = touchEventHandler.touch1Diff;
        diffFromInitial = touchEventHandler.touch1DiffFromInitial;
      }else if (event.changedTouches[i].identifier == touchEventHandler.touch2.identifier){
        changedTouch = touchEventHandler.touch2;
        initTouch = touchEventHandler.touch2Initial;
        diff = touchEventHandler.touch2Diff;
        diffFromInitial = touchEventHandler.touch2DiffFromInitial;
      }
      if (changedTouch){
        var rect = boundingClientRect;
        var newCoordX = ((event.changedTouches[i].clientX - rect.left) / rect.width) * 2 - 1;
        var newCoordY = - ((event.changedTouches[i].clientY - rect.top) / rect.height) * 2 + 1;
        var oldCoordX = ((changedTouch.clientX - rect.left) / rect.width) * 2 - 1;
        var oldCoordY = - ((changedTouch.clientY - rect.top) / rect.height) * 2 + 1;
        var initialOldCoordX = ((initTouch.clientX - rect.left) / rect.width) * 2 - 1;
        var initialOldCoordY = - ((initTouch.clientY - rect.top) / rect.height) * 2 + 1;
        diff.x = newCoordX - oldCoordX;
        diff.y = newCoordY - oldCoordY;
        diffFromInitial.x = newCoordX - initialOldCoordX;
        diffFromInitial.y = newCoordY - initialOldCoordY;
        if (changedTouch.identifier == touchEventHandler.touch1.identifier){
          touchEventHandler.touch1 = event.changedTouches[i];
        }else{
          touchEventHandler.touch2 = event.changedTouches[i];
        }
      }
    }
  }
}

TouchEventHandler.prototype.onTap = function(touch){
  mouseEventHandler.onClick(touch);
}

TouchEventHandler.prototype.onTouchEnd = function(event){
  if (event.targetTouches.length == 0){
    if (touchEventHandler.touch1 && !touchEventHandler.touch2 && touchEventHandler.isTap){
      touchEventHandler.onTap(touchEventHandler.touch1);
    }
    touchEventHandler.isAnyFingerTouching = false;
    touchEventHandler.touch1 = 0;
    touchEventHandler.touch1Initial = 0;
    touchEventHandler.touch1Diff.x = 0; touchEventHandler.touch1Diff.y = 0;
    touchEventHandler.touch1DiffFromInitial.x = 0; touchEventHandler.touch1DiffFromInitial.y = 0;
    touchEventHandler.touchCount = 0;
    touchEventHandler.distance = 0;
    touchEventHandler.isTap = true;
  }else if (event.targetTouches.length == 1){
    if (event.changedTouches[0].identifier == touchEventHandler.touch1.identifier){
      touchEventHandler.touch1 = touchEventHandler.touch2;
      touchEventHandler.touch1Initial = touchEventHandler.touch2Initial;
      touchEventHandler.touch1Diff.x = touchEventHandler.touch2Diff.x; touchEventHandler.touch1Diff.y = touchEventHandler.touch2Diff.y;
      touchEventHandler.touch1DiffFromInitial.x = touchEventHandler.touch2DiffFromInitial.x; touchEventHandler.touch1DiffFromInitial.y = touchEventHandler.touch2DiffFromInitial.y;
      touchEventHandler.touch2 = 0;
      touchEventHandler.touch2Initial = 0;
      touchEventHandler.touch2Diff.x = 0; touchEventHandler.touch2Diff.y = 0;
      touchEventHandler.touch2DiffFromInitial.x = 0; touchEventHandler.touch2DiffFromInitial.y = 0;
    }else if (event.changedTouches[0].identifier == touchEventHandler.touch2.identifier){
      touchEventHandler.touch2 = 0;
      touchEventHandler.touch2Initial = 0;
      touchEventHandler.touch2Diff.x = 0; touchEventHandler.touch2Diff.y = 0;
      touchEventHandler.touch2DiffFromInitial.x = 0; touchEventHandler.touch2DiffFromInitial.y = 0;
    }
    touchEventHandler.touchCount = 1;
    touchEventHandler.distance = 0;
  }
}
