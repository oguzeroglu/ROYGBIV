var PointerLockEventHandler = function(){
  if (isMobile){
    return;
  }
  pointerLockSupported = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
  var pointerLockChangeFunction = 0;
  if ("onpointerlockchange" in document){
    pointerLockChangeFunction = "pointerlockchange";
  }else if ("onmozpointerlockchange" in document){
    pointerLockChangeFunction = "mozpointerlockchange";
  }else if ("onwebkitpointerlockchange" in document){
    pointerLockChangeFunction = "webkitpointerlockchange";
  }
  if (pointerLockChangeFunction){
    document.addEventListener(pointerLockChangeFunction, this.onPointerLock);
  }
  this.isPointerLocked = false;
}

PointerLockEventHandler.prototype.onPointerLock = function(event){
  var isPointerLocked = document.pointerLockElement == canvas || document.mozPointerLockElement == canvas || document.webkitPointerLockElement == canvas;
  pointerLockEventHandler.isPointerLocked = isPointerLocked;
  if (mode == 1 && screenPointerLockChangedCallbackFunction){
    if (isPointerLocked){
      screenPointerLockChangedCallbackFunction(true);
    }else{
      screenPointerLockChangedCallbackFunction(false);
    }
  }
  if (activeControl.isFPSControls){
    activeControl.onPointerLockChange(isPointerLocked);
  }
}
