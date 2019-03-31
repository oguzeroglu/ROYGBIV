var MouseEventHandler = function(){
  if (isMobile){
    return;
  }
  canvas.addEventListener("click", this.onClick);
  canvas.addEventListener("mousedown", this.onMouseDown);
  canvas.addEventListener("mouseup", this.onMouseUp);
  canvas.addEventListener("mousemove", this.onMouseMove);
  canvas.addEventListener('mousewheel', this.onMouseWheel, false);
  if (typeof InstallTrigger !== 'undefined') {
    // M O Z I L L A
    window.addEventListener('wheel', this.onMouseWheel, false);
  }
  if (!isDeployment){
    terminalDiv.addEventListener("mousewheel", this.onTerminalMouseWheel);
    if (typeof InstallTrigger !== 'undefined') {
      // M O Z I L L A
      terminalDiv.addEventListener("wheel", this.onTerminalMouseWheel);
    }
    dragElement(cliDiv);
    cliDiv.addEventListener("click", this.onCliDivClick);
    cliDiv.addEventListener("mousemove", this.onCliDivMouseMove);
  }
}

MouseEventHandler.prototype.onCliDivMouseMove = function(event){
  inactiveCounter = 0;
}

MouseEventHandler.prototype.onCliDivClick = function(event){
  cliFocused = true;
  omGUIFocused = false;
  tmGUIFocused = false;
  inactiveCounter = 0;
  if (keyboardBuffer["Shift"] && mode == 0){
    keyboardBuffer["Shift"] = false;
    for (var objName in addedObjects){
      addedObjects[objName].mesh.visible = true;
    }
    for (var objName in objectGroups){
      objectGroups[objName].mesh.visible = true;
    }
    for (var textName in addedTexts){
      addedTexts[textName].show();
    }
    if (WORKERS_SUPPORTED){
      rayCaster.onShiftPress(false);
    }
  }
}

MouseEventHandler.prototype.onTerminalMouseWheel = function(event){
  event.preventDefault();
  event.stopPropagation();
}

MouseEventHandler.prototype.onMouseWheel = function(event){
  if (mode == 1 && isPaused){
    return;
  }
  event.preventDefault();
  if (!windowLoaded){
    return;
  }
  var deltaX = event.deltaX;
  var deltaY = event.deltaY;
  if((typeof deltaX == UNDEFINED) || (typeof deltaY == UNDEFINED)){
    return;
  }
  if (mode == 1){
    if (screenMouseWheelCallbackFunction){
      screenMouseWheelCallbackFunction(deltaX, deltaY);
    }
    if (defaultCameraControlsDisabled){
      return;
    }
  }
  if (Math.abs(deltaX) < Math.abs(deltaY)){
    camera.translateZ(deltaY * defaultAspect / camera.aspect);
  }else{
    camera.translateX(deltaX * defaultAspect / camera.aspect);
  }
}

MouseEventHandler.prototype.handleObjectMouseEvents = function(){
  if (typeof this.coordX == UNDEFINED){
    return;
  }
  var objectsWithMouseOverListenersSize = objectsWithMouseOverListeners.size;
  var objectsWithMouseOutListenerSize = objectsWithMouseOutListeners.size;
  if (mode == 1 && (screenMouseMoveCallbackFunction || objectsWithMouseOverListenersSize > 0 || objectsWithMouseOutListenerSize)){
    if (screenMouseMoveCallbackFunction){
      screenMouseMoveCallbackFunction(this.coordX, this.coordY, this.movementX, this.movementY);
    }
    if (objectsWithMouseOverListenersSize > 0 || objectsWithMouseOutListenerSize){
      // TRY TO PICK 2D OBJECTS FIRST
      objectPicker2D.find(this.clientX, this.clientY);
      if (!intersectionPoint){
        REUSABLE_VECTOR.setFromMatrixPosition(camera.matrixWorld);
        REUSABLE_VECTOR_2.set(this.coordX, this.coordY, 0.5).unproject(camera).sub(REUSABLE_VECTOR).normalize();
        rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, false, onRaycasterMouseMoveIntersection);
      }else{
        onRaycasterMouseMoveIntersection();
      }
    }
  }
}

MouseEventHandler.prototype.onMouseMove = function(event){
  inactiveCounter = 0;
  var rect = boundingClientRect;
  mouseEventHandler.coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseEventHandler.coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
  mouseEventHandler.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  mouseEventHandler.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
}

MouseEventHandler.prototype.onMouseUp = function(event){
  inactiveCounter = 0;
  if (mode == 1 && screenMouseUpCallbackFunction){
    var rect = boundingClientRect;
    var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    screenMouseUpCallbackFunction(coordX, coordY);
  }
  isMouseDown = false;
}

MouseEventHandler.prototype.onMouseDown = function(event){
  inactiveCounter = 0;
  if (mode == 1 && screenMouseDownCallbackFunction){
    var rect = boundingClientRect;
    var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    screenMouseDownCallbackFunction(coordX, coordY);
  }
  isMouseDown = true;
}

MouseEventHandler.prototype.onClick = function(event){
  inactiveCounter = 0;
  cliFocused = false;
  omGUIFocused = false;
  tmGUIFocused = false;
  if (windowLoaded){
    var rect = renderer.getCurrentViewport();
    var rectX = rect.x, rectY = rect.y, rectZ = rect.z, rectW = rect.w;
    if (screenResolution != 1){
      rectX = rectX / screenResolution;
      rectY = rectY / screenResolution;
      rectZ = rectZ / screenResolution;
      rectW = rectW / screenResolution;
    }
    var coordX = ((event.clientX - rectX) / rectZ) * 2 - 1;
    var coordY = - ((event.clientY - rectY) / rectW) * 2 + 1;
    if (mode == 1 && screenClickCallbackFunction){
      screenClickCallbackFunction(coordX, coordY);
    }
    if (mode == 1 && pointerLockSupported && pointerLockRequested){
      canvas.requestPointerLock();
      pointerLockRequested = false;
    }
    if (mode == 1 && fullScreenRequested){
      if (canvas.requestFullscreen){
        canvas.requestFullscreen();
      } else if (canvas.mozRequestFullScreen){
        canvas.mozRequestFullScreen();
      } else if (canvas.webkitRequestFullscreen){
        canvas.webkitRequestFullscreen();
      } else if (canvas.msRequestFullscreen){
        canvas.msRequestFullscreen();
      }
      fullScreenRequested = false;
    }
    if (mode == 1 && isPaused){
      return;
    }
    if (event.clientX < rectX || event.clientX > rectX + rectZ || event.clientY < rectY || event.clientY > rectY + rectW){
      return;
    }
    if (mode == 1 && objectsWithOnClickListeners.size == 0){
      return;
    }
    // TRY TO PICK 2D OBJECTS FIRST
    objectPicker2D.find(event.clientX, event.clientY);
    if (!intersectionPoint){
      REUSABLE_VECTOR.setFromMatrixPosition(camera.matrixWorld);
      REUSABLE_VECTOR_2.set(coordX, coordY, 0.5).unproject(camera).sub(REUSABLE_VECTOR).normalize();
      rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, (mode == 0), onRaycasterIntersection);
    }else{
      onRaycasterIntersection();
    }
  }
}
