var MouseEventHandler = function(){
  canvas.addEventListener("click", this.onClick);
  canvas.addEventListener("mousedown", this.onMouseDown);
  canvas.addEventListener("mouseup", this.onMouseUp);
  canvas.addEventListener("mousemove", this.onMouseMove);
  window.addEventListener('mousewheel', this.onMouseWheel, false);
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
  if (mode == 1 && defaultCameraControlsDisabled){
    return;
  }
  if (!windowLoaded){
    return;
  }
  var deltaX = event.deltaX;
  var deltaY = event.deltaY;
  if((typeof deltaX == "undefined") || (typeof deltaY == "undefined")){
    return;
  }
  if (Math.abs(deltaX) < Math.abs(deltaY)){
    camera.translateZ(deltaY * defaultAspect / camera.aspect);
  }else{
    camera.translateX(deltaX * defaultAspect / camera.aspect);
  }
}

MouseEventHandler.prototype.onMouseMove = function(event){
  inactiveCounter = 0;
  if (mode == 1 && screenMouseMoveCallbackFunction){
    var rect = boundingClientRect;
    var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    var movementX = event.movementX || event.mozMovementX ||
                    event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY ||
                    event.webkitMovementY || 0;
    screenMouseMoveCallbackFunction(coordX, coordY, movementX, movementY);
  }
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
