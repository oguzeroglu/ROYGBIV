//  _______________________________________
// |                                       |
// | ROYGBIV Engine scripting API          |
// |_______________________________________|
//
// Function types:
//  * Getter functions
//  * Object manipulation functions
//  * Utility functions
//  * Listener functions
//  * Particle system functions
//  * Motion blur functions
//  * Crosshair functions
//  * Text functions
//  * Control functions
//  * Animation functions
//  * Muzzleflash functions
//  * Lighting functions
//  * Lightning functions
//  * Sprite functions
//  * Container functions
//  * Virtual keyboard functions
//  * Script related functions
//  * Networking functions
//  * AI functions
var Roygbiv = function(){

  this.axes = axes;

  this.rotationModes = rotationModes;

  this.endpoints = {
    PLUS_X: "+x",
    PLUS_Y: "+y",
    PLUS_Z: "+z",
    MINUS_X: "-x",
    MINUS_Y: "-y",
    MINUS_Z: "-z"
  };

  this.functionNames = [
    "getObject",
    "getParticleSystem",
    "getChildObject",
    "getRandomColor",
    "hide",
    "show",
    "vector",
    "distance",
    "sub",
    "add",
    "moveTowards",
    "applyForce",
    "rotate",
    "rotateAroundXYZ",
    "setPosition",
    "color",
    "setMass",
    "translate",
    "getPosition",
    "opacity",
    "getOpacity",
    "setCollisionListener",
    "removeCollisionListener",
    "setParticleSystemRotation",
    "setParticleSystemQuaternion",
    "getMarkedPosition",
    "setExpireListener",
    "removeExpireListener",
    "normalizeVector",
    "computeQuaternionFromVectors",
    "multiplyScalar",
    "getParticleSystemVelocityAtTime",
    "stopParticleSystem",
    "startParticleSystem",
    "hideParticleSystem",
    "getCameraDirection",
    "getCameraPosition",
    "getParticleSystemPool",
    "getParticleSystemFromPool",
    "setVector",
    "quaternion",
    "fadeAway",
    "selectCrosshair",
    "changeCrosshairColor",
    "hideCrosshair",
    "startCrosshairRotation",
    "stopCrosshairRotation",
    "pauseCrosshairRotation",
    "expandCrosshair",
    "shrinkCrosshair",
    "setParticleSystemPosition",
    "startMotionBlur",
    "stopMotionBlur",
    "setObjectVelocity",
    "setObjectClickListener",
    "removeObjectClickListener",
    "setObjectColor",
    "resetObjectColor",
    "setScreenClickListener",
    "removeScreenClickListener",
    "setScreenMouseDownListener",
    "removeScreenMouseDownListener",
    "setScreenMouseUpListener",
    "removeScreenMouseUpListener",
    "setScreenMouseMoveListener",
    "removeScreenMouseMoveListener",
    "requestPointerLock",
    "convertEulerToDegrees",
    "setScreenPointerLockChangeListener",
    "removeScreenPointerLockChangeListener",
    "setParticleSystemPoolConsumedListener",
    "removeParticleSystemPoolConsumedListener",
    "setParticleSystemPoolAvailableListener",
    "removeParticleSystemPoolAvailableListener",
    "isKeyPressed",
    "setCameraPosition",
    "lookAt",
    "applyAxisAngle",
    "trackObjectPosition",
    "untrackObjectPosition",
    "createRotationPivot",
    "setRotationPivot",
    "unsetRotationPivot",
    "rotateCamera",
    "translateCamera",
    "requestFullScreen",
    "setFullScreenChangeCallbackFunction",
    "removeFullScreenChangeCallbackFunction",
    "isMouseDown",
    "intersectionTest",
    "getEndPoint",
    "isMobile",
    "lerp",
    "resetObjectVelocity",
    "setFPSDropCallbackFunction",
    "removeFPSDropCallbackFunction",
    "setPerformanceDropCallbackFunction",
    "removePerformanceDropCallbackFunction",
    "getViewport",
    "setUserInactivityCallbackFunction",
    "removeUserInactivityCallbackFunction",
    "pause",
    "setScreenKeydownListener",
    "removeScreenKeydownListener",
    "setScreenKeyupListener",
    "removeScreenKeyupListener",
    "getText",
    "setText",
    "setTextColor",
    "setTextAlpha",
    "setTextPosition",
    "setTextBackground",
    "removeTextBackground",
    "onTextClick",
    "removeTextClickListener",
    "setTextCenterPosition",
    "hideText",
    "showText",
    "getFPS",
    "executeForEachObject",
    "getRandomInteger",
    "isAnyFingerTouching",
    "getCurrentTouchCount",
    "setScreenMouseWheelListener",
    "removeScreenMouseWheelListener",
    "setScreenPinchListener",
    "removeScreenPinchListener",
    "setObjectMouseOverListener",
    "removeObjectMouseOverListener",
    "setObjectMouseOutListener",
    "removeObjectMouseOutListener",
    "onTextMouseOver",
    "removeTextMouseOverListener",
    "onTextMouseOut",
    "removeTextMouseOutListener",
    "onObjectPositionThresholdExceeded",
    "removeObjectPositionThresholdExceededListener",
    "createFreeControl",
    "createCustomControl",
    "setActiveControl",
    "createFPSControl",
    "setScreenDragListener",
    "removeScreenDragListener",
    "createOrbitControl",
    "isOrientationLandscape",
    "setScreenOrientationChangeListener",
    "removeScreenOrientationChangeListener",
    "executeForEachParticleSystem",
    "startScript",
    "stopScript",
    "startAnimation",
    "stopAnimation",
    "onAnimationFinished",
    "removeAnimationFinishListener",
    "showMuzzleFlash",
    "executeDelayed",
    "stopDelayedExecution",
    "changeScene",
    "getActiveSceneName",
    "freezeAnimationOnFinish",
    "unfreezeAnimation",
    "hideMuzzleFlash",
    "getAnimationState",
    "cancelAnimationRewind",
    "rewindAnimation",
    "getLightning",
    "startLightning",
    "setLightningStartPoint",
    "setLightningEndPoint",
    "stopLightning",
    "onAreaEnter",
    "onAreaExit",
    "removeAreaEnterListener",
    "removeAreaExitListener",
    "getSprite",
    "onSpriteClick",
    "removeSpriteClickListener",
    "onSpriteMouseOver",
    "removeSpriteMouseOverListener",
    "onSpriteMouseOut",
    "removeSpriteMouseOutListener",
    "onSpriteDragStart",
    "onSpriteDragStop",
    "onSpriteDragging",
    "removeSpriteDragStartListener",
    "removeSpriteDragStopListener",
    "removeSpriteDraggingListener",
    "areSpritesIntersected",
    "setSpriteColor",
    "setSpriteAlpha",
    "hideSprite",
    "showSprite",
    "setSpriteMargin",
    "setSpriteRotationAngle",
    "enableSpriteDragging",
    "disableSpriteDragging",
    "degreeToRadian",
    "getContainer",
    "onContainerClick",
    "removeContainerClickListener",
    "onContainerMouseOver",
    "removeContainerMouseOverListener",
    "onContainerMouseOut",
    "removeContainerMouseOutListener",
    "hideContainerBorder",
    "showContainerBorder",
    "setContainerBorderColor",
    "setContainerBackgroundColor",
    "setContainerBackgroundAlpha",
    "hideContainerBackground",
    "showContainerBackground",
    "getVirtualKeyboard",
    "activateVirtualKeyboard",
    "onVirtualKeyboardTextChange",
    "removeVirtualKeyboardTextChangeListener",
    "onVirtualKeyboardFlush",
    "removeVirtualKeyboardFlushListener",
    "hideVirtualKeyboard",
    "showVirtualKeyboard",
    "deactivateVirtualKeyboard",
    "activateTextInputMode",
    "deactivateTextInputMode",
    "mapTextureToSprite",
    "setLocationHash",
    "onLocationHashChange",
    "removeLocationHashChangeListener",
    "storeData",
    "getStoredData",
    "removeStoredData",
    "isDefined",
    "cancelSpriteDrag",
    "getSpriteMarginX",
    "getSpriteMarginY",
    "loadDynamicTextures",
    "connectToServer",
    "clearServerConnection",
    "onDisconnectedFromServer",
    "sendToServer",
    "onReceivedFromServer",
    "onLatencyUpdated",
    "applyCustomVelocity",
    "mapAreaPositionToArea",
    "createVectorPool",
    "getFromVectorPool",
    "getDynamicLight",
    "updateLightStrength",
    "updateLightColor",
    "updateLightDirection",
    "updateLightPosition",
    "attachPointLightToObject",
    "setSteeringBehavior",
    "stopSteerable",
    "setSteerableTargetPosition",
    "unsetSteerableTargetPosition",
    "setSteerableLookTarget",
    "getAStar",
    "findShortestPath",
    "hideFrom",
    "stopHiding",
    "pursue",
    "evade",
    "stopPursuing",
    "stopEvading",
    "getJumpDescriptor",
    "jump",
    "setPathFinishListener",
    "removePathFinishListener",
    "setObjectMouseMoveListener",
    "removeObjectMouseMoveListener",
    "startAllAnimations",
    "setPositionChangeListener",
    "removePositionChangeListener",
    "executeForEachWaypoint",
    "onSceneExit",
    "removeSceneExitListener",
    "setSteerableLookDirection",
    "getSteerableLookDirection",
    "setObjectRotationMode",
    "resetObjectRotation",
    "resetRandomPathBehavior"
  ];

  this.globals = new Object();

}

// GETTER FUNCTIONS ************************************************************

//   Returns the object or glued object having the name given as the parameter,
//   or undefined if no such object or glued object is found.
Roygbiv.prototype.getObject = function(name){
  if (mode == 0){
    return;
  }
  var addedObject = addedObjects[name];
  var objectGroup = objectGroups[name];
  if (addedObject){
    return addedObject;
  }
  if (objectGroup){
    return objectGroup;
  }
}

//  Returns the particle system having the name given as the parameter,
//  or zero if no such particle system is found.
Roygbiv.prototype.getParticleSystem = function(name){
  if (mode == 0){
    return;
  }
  var particleSystem = particleSystemPool[name];
  if (particleSystem){
    return particleSystem;
  }else{
    return 0;
  }
}

//  Returns a child object having the name given as the second parameter
//  of a glued object given as the first parameter, or zero if no such object
//  is found.
Roygbiv.prototype.getChildObject = function(objectGroup, childObjectName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getChildObject, preConditions.objectGroup, objectGroup);
  preConditions.checkIfObjectGroup(ROYGBIV.getChildObject, preConditions.objectGroup, objectGroup);
  var child = objectGroup.childObjectsByName[childObjectName];
  if (child){
    return child;
  }
  return 0;
}

// getRandomColor
//  Returns the HTML name of a random color.
Roygbiv.prototype.getRandomColor = function(){
  if (mode == 0){
    return;
  }
  return ColorNames.generateRandomColor();
}

// getPosition
//  Returns the (x, y, z) coordinates of an object, glued object or a particle system.
//  If a specific axis is specified, only the position on the specified axis is returned.
//  Note that axis should be one of ROYGBIV.axes.X, ROYGBIV.axes.Y or ROYGBIV.axes.Z.
Roygbiv.prototype.getPosition = function(object, targetVector, axis){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getPosition, preConditions.object, object);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.getPosition, preConditions.axis, axis);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getPosition, preConditions.targetVector, targetVector);
  preConditions.checkIfAddedObjectObjectGroupParticleSystem(ROYGBIV.getPosition, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.getPosition, object);
  if (object.isAddedObject){
    if (axis){
      if (object.parentObjectName){
        var parentObject = objectGroups[object.parentObjectName];
        parentObject.graphicsGroup.position.copy(parentObject.mesh.position);
        parentObject.graphicsGroup.quaternion.copy(parentObject.mesh.quaternion);
        parentObject.graphicsGroup.updateMatrix();
        parentObject.graphicsGroup.updateMatrixWorld();
        var child = parentObject.graphicsGroup.children[object.indexInParent];
        child.getWorldPosition(REUSABLE_VECTOR);
        var worldPosition = REUSABLE_VECTOR;
        if (axis == this.axes.X){
          return worldPosition.x;
        }else if (axis == this.axes.Y){
          return worldPosition.y;
        }else if (axis == this.axes.Z){
          return worldPosition.z;
        }
      }
      if (axis == this.axes.X){
        return object.mesh.position.x;
      }else if (axis == this.axes.Y){
        return object.mesh.position.y;
      }else if (axis == this.axes.Z){
        return object.mesh.position.z;
      }
    }else{
      if (object.parentObjectName){
        var parentObject = objectGroups[object.parentObjectName];
        parentObject.graphicsGroup.position.copy(parentObject.mesh.position);
        parentObject.graphicsGroup.quaternion.copy(parentObject.mesh.quaternion);
        parentObject.graphicsGroup.updateMatrix();
        parentObject.graphicsGroup.updateMatrixWorld();
        var child = parentObject.graphicsGroup.children[object.indexInParent];
        child.getWorldPosition(REUSABLE_VECTOR);
        var worldPosition = REUSABLE_VECTOR;
        if (targetVector){
          targetVector.x = worldPosition.x;
          targetVector.y = worldPosition.y;
          targetVector.z = worldPosition.z;
          return targetVector;
        }else{
          return this.vector(worldPosition.x, worldPosition.y, worldPosition.z);
        }
      }
      if (targetVector){
        targetVector.x = object.mesh.position.x;
        targetVector.y = object.mesh.position.y;
        targetVector.z = object.mesh.position.z;
        return targetVector;
      }else{
        return this.vector(
          object.mesh.position.x,
          object.mesh.position.y,
          object.mesh.position.z
        );
      }
    }
  }else if (object.isObjectGroup){
    if (axis){
      if (axis == this.axes.X){
        return object.mesh.position.x;
      }else if (axis == this.axes.Y){
        return object.mesh.position.y;
      }else if (axis == this.axes.Z){
        return object.mesh.position.z;
      }
    }else{
      if (targetVector){
        targetVector.x = object.mesh.position.x;
        targetVector.y = object.mesh.position.y;
        targetVector.z = object.mesh.position.z;
        return targetVector;
      }else{
        return this.vector(
          object.mesh.position.x,
          object.mesh.position.y,
          object.mesh.position.z
        );
      }
    }
  }else if (object.isParticleSystem){
    if (axis){
      if (axis == this.axes.X){
        return object.mesh.position.x;
      }else if (axis == this.axes.Y){
        return object.mesh.position.y;
      }else if (axis == this.axes.Z){
        return object.mesh.position.z;
      }
    }else{
      if (targetVector){
        targetVector.x = object.mesh.position.x;
        targetVector.y = object.mesh.position.y;
        targetVector.z = object.mesh.position.z;
        return targetVector;
      }else{
        return this.vector(
          object.mesh.position.x,
          object.mesh.position.y,
          object.mesh.position.z
        );
      }
    }
  }
}

//  Returns the opacity of given object.
Roygbiv.prototype.getOpacity = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getOpacity, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.getOpacity, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.getOpacity, object);
  if (object.isAddedObject){
    return object.mesh.material.uniforms.alpha.value;
  }
  return object.mesh.material.uniforms.totalAlpha.value;
}

//  Returns (x,y,z) coordinates of a point marked using the mark command.
Roygbiv.prototype.getMarkedPosition = function(markedPointName, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getMarkedPosition, preConditions.markedPointName, markedPointName);
  preConditions.checkIfDefined(ROYGBIV.getMarkedPosition, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getMarkedPosition, preConditions.targetVector, targetVector);
  var markedPoint = markedPoints[markedPointName];
  preConditions.checkIfMarkedPointExists(ROYGBIV.getMarkedPosition, null, markedPoint);
  preConditions.checkIfMarkedPointInsideActiveScene(ROYGBIV.getMarkedPosition, markedPoint);
  targetVector.x = markedPoint.x;
  targetVector.y = markedPoint.y;
  targetVector.z = markedPoint.z;
  return targetVector;
}

// Calcualtes and returns the velocity vector of a particle system at given time.
// For particles with circular motion, this function returns the angular velocity
// at given time.
Roygbiv.prototype.getParticleSystemVelocityAtTime = function(particleSystem, time, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getParticleSystemVelocityAtTime, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.getParticleSystemVelocityAtTime, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.getParticleSystemVelocityAtTime, preConditions.time, time);
  preConditions.checkIfNumber(ROYGBIV.getParticleSystemVelocityAtTime, preConditions.time, time);
  preConditions.checkIfDefined(ROYGBIV.getParticleSystemVelocityAtTime, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getParticleSystemVelocityAtTime, preConditions.targetVector, targetVector);
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.getParticleSystemVelocityAtTime, particleSystem);
  return particleSystem.getVelocityAtTime(time, targetVector);
}

// Returns the direction vector of the camera.
Roygbiv.prototype.getCameraDirection = function(targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getCameraDirection, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getCameraDirection, preConditions.targetVector, targetVector);
  REUSABLE_VECTOR.set(0, 0, -1).applyQuaternion(camera.quaternion);
  targetVector.x = REUSABLE_VECTOR.x;
  targetVector.y = REUSABLE_VECTOR.y;
  targetVector.z = REUSABLE_VECTOR.z;
  return targetVector;
}

// Returns the position of the camera.
Roygbiv.prototype.getCameraPosition = function(targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getCameraPosition, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getCameraPosition, preConditions.targetVector, targetVector);
  targetVector.x = camera.position.x;
  targetVector.y = camera.position.y;
  targetVector.z = camera.position.z;
  return targetVector;
}

// Finds a particle system pool by name and returns it.
Roygbiv.prototype.getParticleSystemPool = function(name){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getParticleSystemPool, preConditions.name, name);
  var psPool = particleSystemPools[name];
  preConditions.checkIfParticleSystemPoolExists(ROYGBIV.getParticleSystemPool, null, psPool);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.getParticleSystemPool, psPool);
  return psPool;
}

// Returns an available particle system from the pool, or false if there is
// not an available particle system inside the pool. The particle systems become
// available when hidden or expired.
Roygbiv.prototype.getParticleSystemFromPool = function(pool){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getParticleSystemFromPool, preConditions.pool, pool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.getParticleSystemFromPool, preConditions.pool, pool);
  preConditions.checkIfPoolDestroyed(ROYGBIV.getParticleSystemFromPool, null, pool);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.getParticleSystemPool, pool);
  return pool.get();
}

// Gets an end point of an object. The axis may be one of:
// ROYGBIV.endpoints.MINUS_X
// ROYGBIV.endpoints.MINUS_Y
// ROYGBIV.endpoints.MINUS_Z
// ROYGBIV.endpoints.PLUS_X
// ROYGBIV.endpoints.PLUS_Y
// ROYGBIV.endpoints.PLUS_Z
//
// Note that object groups do not support this function but child objects do.
// This function may be useful in cases where for example a particle system needs
// to be started from the tip point of an object.
Roygbiv.prototype.getEndPoint = function(object, axis, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getEndPoint, preConditions.object, object);
  preConditions.checkIfAddedObject(ROYGBIV.getEndPoint, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.getEndPoint, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.getEndPoint, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getEndPoint, preConditions.targetVector, targetVector);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.getEndPoint, object);
  preConditions.checkIfEndPointAxis(ROYGBIV.getEndPoint, preConditions.axis, axis);
  var endPoint = object.getEndPoint(axis);
  targetVector.x = endPoint.x;
  targetVector.y = endPoint.y;
  targetVector.z = endPoint.z;
  return targetVector;
}

// Returns the current viewport object having startX, startY, width and height parameters.
// Do not modify the values of the returned object.
Roygbiv.prototype.getViewport = function(){
  if (mode == 0){
    return;
  }
  return currentViewport;
}

// Returns a text object or 0 if the text does not exist.
Roygbiv.prototype.getText = function(textName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getText, preConditions.textName, textName);
  var text = addedTexts[textName];
  if (text){
    preConditions.checkIfTextInsideActiveScene(ROYGBIV.getText, text);
    return text;
  }
  return 0;
}

// Returns the current FPS.
Roygbiv.prototype.getFPS = function(){
  if (mode == 0){
    return;
  }
  return fpsHandler.fps;
}

// Returns the active scene name.
Roygbiv.prototype.getActiveSceneName = function(){
  if (mode == 0){
    return;
  }
  return sceneHandler.getActiveSceneName();
}

// Returns the animation state. The animation state can be these global enums:
// ANIMATION_STATE_NOT_RUNNING (0)
// ANIMATION_STATE_RUNNING (1)
// ANIMATION_STATE_FROZEN (2)
// ANIMATION_STATE_REWINDING (3)
Roygbiv.prototype.getAnimationState = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getAnimationState, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.getAnimationState, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.getAnimationState, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.getAnimationState, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.getAnimationState, object);
  return object.animations[animationName].animationState;
}

// Returns a lightning object or 0 if lightning does not exist.
Roygbiv.prototype.getLightning = function(lightningName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getLightning, preConditions.lightningName, lightningName);
  var lightning = lightnings[lightningName];
  if (lightning){
    preConditions.checkIfLightningInsideActiveScene(ROYGBIV.getLightning, lightning);
    return lightning;
  }
  return 0;
}

// Returns a sprite object or 0 if sprite does not exist.
Roygbiv.prototype.getSprite = function(spriteName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getSprite, preConditions.spriteName, spriteName);
  var sprite = sprites[spriteName];
  if (sprite){
    preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.getSprite, sprite);
    return sprite;
  }
  return 0;
}

// Returns a container or 0 if container does not exist.
Roygbiv.prototype.getContainer = function(containerName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getContainer, preConditions.containerName, containerName);
  var container = containers[containerName];
  if (container){
    preConditions.checkIfContainerInsideActiveScene(ROYGBIV.getContainer, container);
    return container;
  }
  return 0;
}

// Returns a virtual keyboard or 0 if virtual keyboard does not exist.
Roygbiv.prototype.getVirtualKeyboard = function(virtualKeyboardName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getVirtualKeyboard, preConditions.virtualKeyboardName, virtualKeyboardName);
  var virtualKeyboard = virtualKeyboards[virtualKeyboardName];
  if (virtualKeyboard){
    preConditions.checkIfVirtualKeyboardInsideActiveScene(ROYGBIV.getVirtualKeyboard, virtualKeyboard);
    return virtualKeyboard;
  }
  return 0;
}

// Returns the marginX value of given sprite.
Roygbiv.prototype.getSpriteMarginX = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getSpriteMarginX, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.getSpriteMarginX, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.getSpriteMarginX, sprite);
  return sprite.getMarginXPercent();
}

// Returns the marginY value of given sprite.
Roygbiv.prototype.getSpriteMarginY = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getSpriteMarginY, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.getSpriteMarginY, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.getSpriteMarginY, sprite);
  return sprite.getMarginYPercent();
}

// Returns a dynamic light or 0 if dynamic light does not exist.
Roygbiv.prototype.getDynamicLight = function(dynamicLightName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getDynamicLight, preConditions.dynamicLightName, dynamicLightName);
  return lightHandler.dynamicLights[dynamicLightName] || 0;
}

// Returns an AStar object or 0 if AStar does not exist.
Roygbiv.prototype.getAStar = function(aStarName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getAStar, preConditions.aStarName, aStarName);
  var aStar = steeringHandler.usedAStarIDs[aStarName];
  if (aStar){
    preConditions.checkIfAStarInActiveScene(ROYGBIV.getAStar, aStarName);
    return aStar;
  }
  return 0;
}

// Returns a JumpDescriptor object or 0 if JumpDescriptor does not exist.
Roygbiv.prototype.getJumpDescriptor = function(jdName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getJumpDescriptor, preConditions.jdName, jdName);
  var jumpDescriptor = steeringHandler.usedJumpDescriptorIDs[jdName];
  if (jumpDescriptor){
    preConditions.checkIfJumpDescriptorInActiveScene(ROYGBIV.getJumpDescriptor, jdName);
    return jumpDescriptor;
  }
  return 0;
}

// OBJECT MANIPULATION FUNCTIONS ***********************************************

//  Hides an object or a glued object, removes it from the scene. Does nothing
//  if the object is already hidden. The additional keepPhysics parameter can
//  be used in order to hide only the graphical representation of the object
//  but keep its physicsal body. The default value of keepPhysics is false.
Roygbiv.prototype.hide = function(object, keepPhysics){
  if (mode == 0){
    return;
  }
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.hide, preConditions.keepPhysics, keepPhysics);
  var keepPhysicsValue = keepPhysics;
  preConditions.checkIfDefined(ROYGBIV.hide, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.hide, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.hide, object);
  if (object.isAddedObject){
    preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.hide, preConditions.object, object);
    if (keepPhysicsValue){
      preConditions.checkIfNoMass(ROYGBIV.hide, preConditions.object, object);
    }
    preConditions.checkIfChangeable(ROYGBIV.hide, preConditions.object, object);
    object.hide(keepPhysicsValue);
  }else if (object.isObjectGroup){
    if (keepPhysicsValue){
      preConditions.checkIfNoMass(ROYGBIV.hide, preConditions.object, object);
    }
    preConditions.checkIfChangeable(ROYGBIV.hide, preConditions.object, object);
    object.hide(keepPhysicsValue);
  }
}

//  Makes a hidden object or glued object visible. Does nothing if the object is
//  already visible.
Roygbiv.prototype.show = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.show, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.show, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.show, object);
  if (object.isAddedObject){
    preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.show, preConditions.object, object);
    preConditions.checkIfChangeable(ROYGBIV.show, preConditions.object, object);
    object.show();
  }else if (object.isObjectGroup){
    preConditions.checkIfChangeable(ROYGBIV.show, preConditions.object, object);
    object.show();
  }
}

// Applies a physical force to an object or a glued object from a given point.
Roygbiv.prototype.applyForce = function(object, force, point){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.applyForce, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.applyForce, preConditions.object, object);
  preConditions.checkIfNoMass(ROYGBIV.applyForce, preConditions.object, object);
  preConditions.checkIfDynamic(ROYGBIV.applyForce, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.applyForce, preConditions.force, force);
  preConditions.checkIfDefined(ROYGBIV.applyForce, preConditions.point, point);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.applyForce, preConditions.force, force);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.applyForce, preConditions.point, point);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.applyForce, object);
  REUSABLE_CANNON_VECTOR.set(force.x, force.y, force.z);
  REUSABLE_CANNON_VECTOR_2.set(point.x, point.y, point.z);
  object.physicsBody.applyImpulse(
    REUSABLE_CANNON_VECTOR,
    REUSABLE_CANNON_VECTOR_2
  );
  physicsWorld.applyImpulse(object, REUSABLE_CANNON_VECTOR, REUSABLE_CANNON_VECTOR_2);
}

//  Rotates an object or a glued object around a given axis by given radians.
//  The parameter axis must be one of ROYGBIV.axes.X, ROYGBIV.axes.Y or ROYGBIV.axes.Z.
//  Objects are rotated around their own centers, so their positions do not change when
//  rotated using this function. If object has a local rotation mode set, the rotation
//  is performed around it's local axis, it's performed around the world axis otherwise.
Roygbiv.prototype.rotate = function(object, axis, radians){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rotate, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.rotate, preConditions.axis, axis);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.rotate, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.rotate, preConditions.radians, radians);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.rotate, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.rotate, object);
  if (object.isAddedObject && object.parentObjectName){
    var parentObject = objectGroups[object.parentObjectName];
    if (parentObject){
      this.rotateAroundXYZ(
        parentObject,
        object.getPositionAtAxis("x"),
        object.getPositionAtAxis("y"),
        object.getPositionAtAxis("z"),
        radians,
        axis
      );
      return;
    }
  }
  preConditions.checkIfChangeable(ROYGBIV.rotate, preConditions.object, object);
  object.handleRotation(axis, radians);
}

//  Rotates an object or a glued object around the given (x, y, z)
//  Unlike the rotate function, the positions of the objects can change when rotated
//  using this function. Note that axis must be one of ROYGBIV.axes.X, ROYGBIV.axes.Y
//  or ROYGBIV.axes.Z.
Roygbiv.prototype.rotateAroundXYZ = function(object, x, y, z, radians, axis){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.rotateAroundXYZ, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.rotateAroundXYZ, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.rotateAroundXYZ, preConditions.z, z);
  preConditions.checkIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.radians, radians);
  preConditions.checkIfNumber(ROYGBIV.rotateAroundXYZ, preConditions.radians, radians);
  preConditions.checkIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.axis, axis);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.rotateAroundXYZ, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.rotateAroundXYZ, object);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.axis, axis);
  var axisVector;
  if (axis == this.axes.X){
    axisVector = THREE_AXIS_VECTOR_X;
  }else if (axis== this.axes.Y){
    axisVector = THREE_AXIS_VECTOR_Y;
  }else if (axis == this.axes.Z){
    axisVector = THREE_AXIS_VECTOR_Z;
  }
  var mesh;
  if (object.isAddedObject){
    if (object.parentObjectName){
      var parentObject = objectGroups[object.parentObjectName];
      if (parentObject){
        this.rotateAroundXYZ(
          parentObject,
          x, y, z,
          radians,
          axis
        );
        return;
      }
    }
    preConditions.checkIfChangeable(ROYGBIV.rotateAroundXYZ, preConditions.object, object);
  }else if (object.isObjectGroup){
    preConditions.checkIfChangeable(ROYGBIV.rotateAroundXYZ, preConditions.object, object);
  }
  object.prevPositionVector.copy(object.mesh.position);
  object.rotateAroundXYZ(x, y, z, axis, axisVector, radians);
  physicsWorld.updateObject(object, false, true);
  if (object.autoInstancedParent){
    object.autoInstancedParent.updateObject(object);
  }
  object.onPositionChange(object.prevPositionVector, object.mesh.position);
}

//  Puts an object or glued object to the specified (x, y, z) coordinate.
Roygbiv.prototype.setPosition = function(obj, x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setPosition, preConditions.obj, obj);
  preConditions.checkIfDefined(ROYGBIV.setPosition, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setPosition, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.setPosition, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.setPosition, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setPosition, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.setPosition, preConditions.z, z);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setPosition, preConditions.obj, obj);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setPosition, obj);
  if (obj.parentObjectName){
    var objGroup = objectGroups[obj.parentObjectName];
    preConditions.checkIfParentExists(ROYGBIV.setPosition, null, objGroup);
    this.setPosition(objGroup, x, y, z);
    return;
  }
  preConditions.checkIfChangeable(ROYGBIV.setPosition, preConditions.obj, obj);
  obj.setPosition(x, y, z);
}

//  Sets the mass property of an object or a glued object. Objects are considered
//  dynamic if and only if their mass is greater than zero.
Roygbiv.prototype.setMass = function(object, mass){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setMass, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setMass, preConditions.mass, mass);
  preConditions.checkIfNumber(ROYGBIV.setMass, preConditions.mass, mass);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setMass, preConditions.object, object);
  preConditions.checkIfChangeable(ROYGBIV.setMass, preConditions.object, object);
  preConditions.checkIfNoMass(ROYGBIV.setMass, preConditions.object, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.setMass, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setMass, object);
  if (typeof object.originalMass == UNDEFINED){
    object.originalMass = object.mass;
  }
  if (typeof object.mass == UNDEFINED){
    object.originalMass = 0;
    object.mass = 0;
  }
  object.setMass(mass);
  physicsWorld.setMass(object, mass);
  if (object.isAddedObject){
    if (mass > 0){
      dynamicObjects.set(object.name,  object);
      sceneHandler.onDynamicObjectAddition(object);
    }else{
      dynamicObjects.delete(object.name);
      sceneHandler.onDynamicObjectDeletion(object);
    }
  }else if (object.isObjectGroup){
    if (mass > 0){
      dynamicObjectGroups.set(object.name, object);
      sceneHandler.onDynamicObjectAddition(object);
    }else{
      dynamicObjectGroups.delete(object.name);
      sceneHandler.onDynamicObjectDeletion(object);
    }
  }
}

//  Translates an object or glued object on the given axis by the given amount.
//  Axis must be one of ROYGBIV.axes.X, ROYGBIV.axes.Y or ROYGBIV.axes.Z.
Roygbiv.prototype.translate = function(object, axis, amount){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.translate, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.translate, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.translate, preConditions.amount, amount);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.translate, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.translate, preConditions.amount, amount);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.translate, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.translate, object);
  if (object.isAddedObject){
    if (object.parentObjectName){
      var parentObject = objectGroups[object.parentObjectName];
      if (parentObject){
        this.translate(parentObject, axis, amount);
        return;
      }
    }
  }
  preConditions.checkIfChangeable(ROYGBIV.translate, preConditions.object, object);
  object.translate(axis, amount, true);
  physicsWorld.updateObject(object, true, false);
  if (object.autoInstancedParent){
    object.autoInstancedParent.updateObject(object);
  }
}

//  Increases/decreases the opacity of given object.
Roygbiv.prototype.opacity = function(object, delta){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.opacity, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.opacity, preConditions.delta, delta);
  preConditions.checkIfNumber(ROYGBIV.opacity, preConditions.delta, delta);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.opacity, preConditions.object, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.opacity, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.opacity, object);
  if (!object.initOpacitySet && (object.isAddedObject)){
    object.initOpacity = object.mesh.material.uniforms.alpha.value;
    object.initOpacitySet = true;
  }else if (!object.initOpacitySet && (object.isObjectGroup)){
    object.initOpacity = object.mesh.material.uniforms.totalAlpha.value;
    object.initOpacitySet = true;
  }
  object.incrementOpacity(delta);
  if (object.isAddedObject){
    if (object.mesh.material.uniforms.alpha.value < 0){
      object.updateOpacity(0);
    }
    if (object.mesh.material.uniforms.alpha.value > 1){
      object.updateOpacity(1);
    }
  }else if (object.isObjectGroup){
    if (object.mesh.material.uniforms.totalAlpha.value < 0){
      object.updateOpacity(0);
    }
    if (object.mesh.material.uniforms.totalAlpha.value > 1){
      object.updateOpacity(1);
    }
  }
}

//  Sets the velocity of an object or a glued object. The object must be a dynamic object
//  (mass > 0) in order to have a velocity. If optional axis parameter is used
//  velocity on only given axis is set. Note that axis must be one of ROYGBIV.axes.X,
//  ROYGBIV.axes.Y or ROYGBIV.axes.Z.
Roygbiv.prototype.setObjectVelocity = function(object, velocityVector, axis){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectVelocity, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectVelocity, preConditions.object, object);
  preConditions.checkIfChangeable(ROYGBIV.setObjectVelocity, preConditions.object, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.setObjectVelocity, preConditions.object, object);
  preConditions.checkIfDynamic(ROYGBIV.setObjectVelocity, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setObjectVelocity, preConditions.velocityVector, velocityVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setObjectVelocity, preConditions.velocityVector, velocityVector);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectVelocity, object);
  if (!(typeof axis == UNDEFINED)){
    preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.setObjectVelocity, preConditions.axis, axis);
    if (axis == this.axes.X){
      object.setVelocityX(velocityVector.x);
    }else if (axis == this.axes.Y){
      object.setVelocityY(velocityVector.y);
    }else if (axis == this.axes.Z){
      object.setVelocityZ(velocityVector.z);
    }
    return;
  }
  object.setVelocity(velocityVector);
}

// Modifies the color and alpha value of an object or an object group.
Roygbiv.prototype.setObjectColor = function(object, colorName, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectColor, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectColor, preConditions.object, object);
  preConditions.checkIfColorizable(ROYGBIV.setObjectColor, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setObjectColor, preConditions.colorName, colorName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectColor, object);
  if (typeof alpha == UNDEFINED){
    alpha = 1;
  }else{
    preConditions.checkIfNumber(ROYGBIV.setObjectColor, preConditions.alpha, alpha);
  }
  REUSABLE_COLOR.set(colorName);
  if (object.autoInstancedParent){
    object.autoInstancedParent.forceColor(object, REUSABLE_COLOR.r, REUSABLE_COLOR.g, REUSABLE_COLOR.b, alpha);
  }
  object.forceColor(REUSABLE_COLOR.r, REUSABLE_COLOR.g, REUSABLE_COLOR.b, alpha);
}

// Resets the color and alpha value of an object or an object group.
Roygbiv.prototype.resetObjectColor = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.resetObjectColor, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.resetObjectColor, preConditions.object, object);
  preConditions.checkIfColorizable(ROYGBIV.resetObjectColor, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.resetObjectColor, object);
  if (object.autoInstancedParent){
    object.autoInstancedParent.resetColor(object);
  }
  object.resetColor();
}

// Sets a rotation pivot for an object created with createRotationPivot API.
Roygbiv.prototype.setRotationPivot = function(rotationPivot){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setRotationPivot, preConditions.rotationPivot, rotationPivot);
  preConditions.checkIfRotationPivot(ROYGBIV.setRotationPivot, preConditions.rotat, rotationPivot);
  var sourceObject = rotationPivot.sourceObject;
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setRotationPivot, sourceObject);
  sourceObject.setRotationPivot(rotationPivot);
}

// Unsets a rotation pivot point for an object set with setRotationPivot API.
Roygbiv.prototype.unsetRotationPivot = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.unsetRotationPivot, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.unsetRotationPivot, preConditions.object, object);
  preConditions.checkIfHavePivotPoint(ROYGBIV.unsetRotationPivot, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.unsetRotationPivot, object);
  object.unsetRotationPivot();
}

// Resets the velocity and angular velocity of an object.
Roygbiv.prototype.resetObjectVelocity = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.resetObjectVelocity, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.resetObjectVelocity, preConditions.object, object);
  preConditions.checkIfChangeable(ROYGBIV.resetObjectVelocity, preConditions.object, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.resetObjectVelocity, preConditions.object, object);
  preConditions.checkIfDynamic(ROYGBIV.resetObjectVelocity, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.resetObjectVelocity, object);
  object.resetVelocity();
}

// Sets the rotation mode of given object. rotationMode parameter may be either
// ROYGBIV.rotationModes.LOCAL or ROYGBIV.rotationModes.WORLD. Local rotation
// mode indicates objects rotating around their own local axis unlike the world
// axis.
Roygbiv.prototype.setObjectRotationMode = function(object, rotationMode){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.setObjectRotationMode, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setObjectRotationMode, preConditions.rotationMode, rotationMode);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectRotationMode, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectRotationMode, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.setObjectRotationMode, preConditions.object, object);
  preConditions.checkIfRotationMode(ROYGBIV.setObjectRotationMode, rotationMode);
  preConditions.checkIfHaveNotPivotPoint(ROYGBIV.setObjectRotationMode, preConditions.object, object);

  object.setRotationMode(rotationMode);
}

// Resets all the rotations applied to given object.
Roygbiv.prototype.resetObjectRotation = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rotate, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.rotate, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.rotate, object);
  preConditions.checkIfChangeable(ROYGBIV.rotate, preConditions.object, object);

  object.resetRotation();
}

// PARTICLE SYSTEM FUNCTIONS ***************************************************

//  Sets the rotation of a particle system around given axis. Note that axis must be
//  one of ROYGBIV.axes.X, ROYGBIV.axes.Y or ROYGBIV.axes.Z.
Roygbiv.prototype.setParticleSystemRotation = function(particleSystem, axis, radians){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.radians, radians);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemRotation, preConditions.radians, radians);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem is not visible", (!particleSystem.mesh.visible));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a collision callback attached. Cannot set rotation.", particleSystem.checkForCollisions);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a collidable particle. Cannot set rotation.", particleSystem.particlesWithCollisionCallbacks.size > 0);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a trailed particle. Cannot set rotation.", particleSystem.hasTrailedParticle);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a defined motion. Cannot set rotation.", (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 || particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0));
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.setParticleSystemRotation, particleSystem);
  if (axis == this.axes.X){
    particleSystem.mesh.rotation.x = radians;
  }else if (axis == this.axes.Y){
    particleSystem.mesh.rotation.y = radians;
  }else if (axis == this.axes.Z){
    particleSystem.mesh.rotation.z = radians;
  }
  particleSystem.hasManualRotationSet = true;
}

//  Sets the quaternion of given particle system.
Roygbiv.prototype.setParticleSystemQuaternion = function(particleSystem, quatX, quatY, quatZ, quatW){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemQuaternion, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.setParticleSystemQuaternion, preConditions.particleSystem, particleSystem);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemQuaternion, preConditions.quatX, quatX);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemQuaternion, preConditions.quatY, quatY);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemQuaternion, preConditions.quatZ, quatZ);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemQuaternion, preConditions.quatW, quatW);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemQuaternion, "particleSystem is not visible.", (!particleSystem.mesh.visible));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemQuaternion, "particleSystem has a collision callback attached. Cannot set quaternion.", (particleSystem.checkForCollisions));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemQuaternion, "particleSystem has a collidable particle. Cannot set quaternion.", (particleSystem.particlesWithCollisionCallbacks.size > 0));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemQuaternion, "particleSystem has a trailed particle. Cannot set quaternion.", (particleSystem.hasTrailedParticle));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemQuaternion, "particleSystem has a defined motion. Cannot set quaternion.", (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 || particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0));
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.setParticleSystemQuaternion, particleSystem);
  particleSystem.mesh.quaternion.set(quatX, quatY, quatZ, quatW);
  particleSystem.hasManualQuaternionSet = true;
}

// Stops the motion of a particle system. This can be useful for smooth after collision
// effects of particle systems as it lets particles to dissapear smoothly. The particle
// system is killed after stopDuration seconds.
Roygbiv.prototype.stopParticleSystem = function(particleSystem, stopDuration){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.stopParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.stopParticleSystem, preConditions.stopDuration, stopDuration);
  preConditions.checkIfNumber(ROYGBIV.stopParticleSystem, preConditions.stopDuration, stopDuration);
  preConditions.checkIfLessThanExclusive(ROYGBIV.stopParticleSystem, preConditions.stopDuration, stopDuration, 0);
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.stopParticleSystem, particleSystem);
  particleSystem.stop(stopDuration);
}

// Starts a particle system after its creation. Configurations are:
// particleSystem: The particle system to start. (mandatory)
// startPosition: The initial position vector of the particle system. (optional)
// startVelocity: The initial velocity vector of the particle system. (optional)
// startAcceleration: The initial acceleration vector of the particle system. (optional)
// startQuaternion: The initial quaternion of the particle system. Use ROYGBIV.computeQuaternionFromVectors (optional)
// maxCameraDistance: This parameter can be used for particle systems being shot from FPS weapons to visually
// adjust their scales. If set, the scale of the particle system is set to [distance_to_camera] / maxCameraDistance
// while the distance to camera is less than maxCameraDistance.
Roygbiv.prototype.startParticleSystem = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startParticleSystem, preConditions.configurations, configurations);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.startParticleSystem, preConditions.particleSystem, configurations.particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.startParticleSystem, preConditions.particleSystem, configurations.particleSystem);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startPosition, configurations.startPosition);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startVelocity, configurations.startVelocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startAcceleration, configurations.startAcceleration);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startQuaternion, configurations.startQuaternion);
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.startParticleSystem, configurations.particleSystem);
  configurations.particleSystem.start(configurations);
}

// Makes a particle system invisible.
Roygbiv.prototype.hideParticleSystem = function(particleSystem){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.hideParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.hideParticleSystem, particleSystem);
  particleSystem.hide();
}

// Makes the particles of given particle system smaller on each frame. Greater
// the coefficient, faster the particles fade away. This can be used for
// smoke like particle systems to make them dissapear smoothly.
Roygbiv.prototype.fadeAway = function(particleSystem, coefficient){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.fadeAway, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.fadeAway, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.fadeAway, preConditions.coefficient, coefficient);
  preConditions.checkIfNumber(ROYGBIV.fadeAway, preConditions.coefficient, coefficient);
  preConditions.checkIfLessThan(ROYGBIV.fadeAway, preConditions.coefficient, coefficient, 0);
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.fadeAway, particleSystem);
  if (!particleSystem.psMerger){
    particleSystem.material.uniforms.dissapearCoef.value = coefficient;
  }else{
    particleSystem.psMerger.material.uniforms.dissapearCoefArray.value[particleSystem.mergedIndex] = coefficient;
  }
}

// Sets the position of a particle system. This function is designed for
// magic circle like particle systems which may follow players. This function
// should not be used for particle systems with collision callbacks or particle systems
// with defined motions in general.
Roygbiv.prototype.setParticleSystemPosition = function(particleSystem, x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPosition, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.setParticleSystemPosition, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPosition, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPosition, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPosition, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemPosition, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemPosition, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemPosition, preConditions.z, z);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemPosition, "particleSystem is not visible", (!particleSystem.mesh.visible));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemPosition, "particleSystem has a collision callback attached.", particleSystem.checkForCollisions);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemPosition, "particleSystem has collidable particles.", (particleSystem.particlesWithCollisionCallbacks.size > 0));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemPosition, "particleSystem has a trailed particle.", particleSystem.hasTrailedParticle);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemPosition, "particleSystem has a defined motion.", (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 || particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0));
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.setParticleSystemPosition, particleSystem);
  particleSystem.mesh.position.set(x, y, z);
  particleSystem.hasManualPositionSet = true;
}

// Runs the provided function for each particle system of given particle system pool. The callbackFunction
// is executed with particleSystem and particleSystemName parameters.
Roygbiv.prototype.executeForEachParticleSystem = function(psPool, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.executeForEachParticleSystem, preConditions.psPool, psPool);
  preConditions.checkIfDefined(ROYGBIV.executeForEachParticleSystem, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.executeForEachParticleSystem, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfParticleSystemPool(ROYGBIV.executeForEachParticleSystem, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.executeForEachParticleSystem, psPool);
  for (var psName in psPool.particleSystems){
    callbackFunction(psPool.particleSystems[psName], psName);
  }
}

// MOTION BLUR FUNCTIONS *******************************************************

// Starts the motion blur effect of an object.
Roygbiv.prototype.startMotionBlur = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startMotionBlur, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.startMotionBlur, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.startMotionBlur, object);
  var objectTrail = objectTrails[object.name];
  preConditions.checkIfTrue(ROYGBIV.startMotionBlur, "No effect attached to object.", (!objectTrail));
  objectTrail.start();
}

// Stops the motion blur effect of an object. The effect can be restarted using the startMotionBlur command.
Roygbiv.prototype.stopMotionBlur = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopMotionBlur, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.stopMotionBlur, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.stopMotionBlur, object);
  var objectTrail = objectTrails[object.name];
  preConditions.checkIfTrue(ROYGBIV.stopMotionBlur, "No effect attached to object.", (!objectTrail));
  objectTrail.stop();
}

// CROSSHAIR FUNCTIONS *********************************************************

// Selects a crosshair. Only the selected crosshair is visible on the screen.
Roygbiv.prototype.selectCrosshair = function(crosshairName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.selectCrosshair, preConditions.crosshairName, crosshairName);
  var crosshair = crosshairs[crosshairName];
  preConditions.checkIfTrue(ROYGBIV.selectCrosshair, "No such crosshair.", (!crosshair));
  preConditions.checkIfCrosshairInsideActiveScene(ROYGBIV.selectCrosshair, crosshair);
  crosshairHandler.selectCrosshair(crosshair);
}

// Changes the color of the selected crosshair.
Roygbiv.prototype.changeCrosshairColor = function(colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.changeCrosshairColor, preConditions.colorName, colorName);
  preConditions.checkIfTrue(ROYGBIV.changeCrosshairColor, "No crosshair is selected", (!selectedCrosshair));
  crosshairHandler.changeCrosshairColor(colorName);
}

// Destroys the selected crosshair. selectCrosshair function should be used after this function
// in order to put a crosshair on the screen.
Roygbiv.prototype.hideCrosshair = function(){
  if (mode == 0){
    return;
  }
  crosshairHandler.hideCrosshair();
}

// Starts rotation effect of the selected crosshair.
Roygbiv.prototype.startCrosshairRotation = function(angularSpeed){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.startCrosshairRotation, "No selected crosshair", (!selectedCrosshair));
  preConditions.checkIfDefined(ROYGBIV.startCrosshairRotation, preConditions.angularSpeed, angularSpeed);
  preConditions.checkIfNumber(ROYGBIV.startCrosshairRotation, preConditions.angularSpeed, angularSpeed);
  crosshairHandler.startCrosshairRotation(angularSpeed);
}

// Stops rotation effect of the selected crosshair.
Roygbiv.prototype.stopCrosshairRotation = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.stopCrosshairRotation, "No selectedCrosshair.", (!selectedCrosshair));
  crosshairHandler.stopCrosshairRotation();
}

// Pauses rotation effect of the selected crosshair. startCrosshairRotation function
// can be used to continue the rotation effect.
Roygbiv.prototype.pauseCrosshairRotation = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.pauseCrosshairRotation, "No selectedCrosshair.", (!selectedCrosshair));
  crosshairHandler.pauseCrosshairRotation();
}

// Expands a crosshair. This can be used while shooting or walking for fps games.
// The crosshair expands by delta while its size is less than targetSize on each frame.
// This function is designed to be called inside onmousedown or onkeydown like events.
Roygbiv.prototype.expandCrosshair = function(targetSize, delta){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.expandCrosshair, "No selectedCrosshair.", (!selectedCrosshair));
  preConditions.checkIfDefined(ROYGBIV.expandCrosshair, preConditions.targetSize, targetSize);
  preConditions.checkIfNumber(ROYGBIV.expandCrosshair, preConditions.targetSize, targetSize);
  preConditions.checkIfLessThan(ROYGBIV.expandCrosshair, preConditions.targetSize, targetSize, selectedCrosshair.sizeAmount);
  preConditions.checkIfDefined(ROYGBIV.expandCrosshair, preConditions.delta, delta);
  preConditions.checkIfNumber(ROYGBIV.expandCrosshair, preConditions.delta, delta);
  preConditions.checkIfLessThan(ROYGBIV.expandCrosshair, preConditions.delta, delta, 0);
  crosshairHandler.expandCrosshair(targetSize, delta);
}

// Shrinks a crosshair. This can be used after calling the expandCrosshair function.
// The crosshair shrinks by delta while its size is greater than its initial size. This function
// is designed to be called inside onmouseup or onkeyup like events.
Roygbiv.prototype.shrinkCrosshair = function(delta){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.shrinkCrosshair, preConditions.delta, delta);
  preConditions.checkIfNumber(ROYGBIV.shrinkCrosshair, preConditions.delta, delta);
  preConditions.checkIfLessThan(ROYGBIV.shrinkCrosshair, preConditions.delta, delta, 0);
  preConditions.checkIfTrue(ROYGBIV.shrinkCrosshair, "No selected crosshair.", (!selectedCrosshair));
  crosshairHandler.shrinkCrosshair(delta);
}

// LISTENER FUNCTIONS **********************************************************

//  Sets a collision listener for an object, glued object or a particle system.
//  Callback function given as the second parameter is fired with a CollisionInfo instance when
//  the sourceObject is collided with other objects or glued objects of the scene.
//  The additional timeOffset parameter can be used for particle systems to
//  pre-calculate future collisions. This can help to prevent visual errors of collisions
//  of rather fast particle systems.
Roygbiv.prototype.setCollisionListener = function(sourceObject, callbackFunction, timeOffset){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setCollisionListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectObjectGroupParticleSystem(ROYGBIV.setCollisionListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setCollisionListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setCollisionListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setCollisionListener, preConditions.timeOffset, timeOffset);
  if ((sourceObject.isAddedObject) || (sourceObject.isObjectGroup)){
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Cannot set collision listener for more than "+MAX_OBJECT_COLLISION_LISTENER_COUNT+" objects.", (TOTAL_OBJECT_COLLISION_LISTENER_COUNT >= MAX_OBJECT_COLLISION_LISTENER_COUNT));
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Object used as FPS player body, cannot listen for collisions.", sourceObject.usedAsFPSPlayerBody);
    preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setCollisionListener, sourceObject);
    preConditions.checkIfNoMass(ROYGBIV.setCollisionListener, preConditions.sourceObject, sourceObject);
    if (!collisionCallbackRequests.has(sourceObject.name)){
      TOTAL_OBJECT_COLLISION_LISTENER_COUNT ++;
    }
    sourceObject.setCollisionListener(callbackFunction);
  }else if (sourceObject.isParticleSystem){
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Particle system is not marked as collidable.", (!sourceObject.isCollidable));
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A position is set manually to the particle system. Cannot listen for collisions.", (sourceObject.hasManualPositionSet));
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A rotation is set manually to the particle system. Cannot listen for collisions.", (sourceObject.hasManualRotationSet));
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A quaternion is set manually to the particle system. Cannot listen for collisions.", (sourceObject.hasManualQuaternionSet));
    preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.setCollisionListener, sourceObject);
    var incrCounter = false;
    if (!particleSystemCollisionCallbackRequests[sourceObject.name]){
      incrCounter = true;
    }
    sourceObject.setCollisionListener(callbackFunction, timeOffset);
    if (incrCounter){
      TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT ++;
    }
  }
}

//  Removes collision listeners of an object, glued object or a particle system.
Roygbiv.prototype.removeCollisionListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeCollisionListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectObjectGroupParticleSystemParticle(ROYGBIV.removeCollisionListener, preConditions.sourceObject, sourceObject);
  var curCallbackRequest;
  if ((sourceObject.isAddedObject) || (sourceObject.isObjectGroup)){
    preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeCollisionListener, sourceObject);
    curCallbackRequest = collisionCallbackRequests.get(sourceObject.name);
  }else if (sourceObject.isParticleSystem){
    preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.removeCollisionListener, sourceObject);
    curCallbackRequest = particleSystemCollisionCallbackRequests[sourceObject.name];
  }
  if (curCallbackRequest){
    if ((sourceObject.isAddedObject) || (sourceObject.isObjectGroup)){
      sourceObject.removeCollisionListener();
      TOTAL_OBJECT_COLLISION_LISTENER_COUNT --;
    }else if (sourceObject.isParticleSystem){
      TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT --;
      sourceObject.removeCollisionListener();
    }
  }
}

// Sets an expiration listener for a particle system. The parameter callbackFunction
// is executed when sourceObject is expired. The name of the particle system is passed
// to the callbackFunction as a parameter.
Roygbiv.prototype.setExpireListener = function(sourceObject, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setExpireListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfParticleSystem(ROYGBIV.setExpireListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setExpireListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setExpireListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfTrue(ROYGBIV.setExpireListener, "sourceObject is already expired.", (sourceObject.destroyed));
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.setExpireListener, sourceObject);
  sourceObject.expirationFunction = callbackFunction;
}

// Removes the expiration listener function of a particle system.
Roygbiv.prototype.removeExpireListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeExpireListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfParticleSystem(ROYGBIV.removeExpireListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.removeExpireListener, "sourceObject is already expired", (sourceObject.destroyed));
  preConditions.checkIfParticleSystemInsideActiveScene(ROYGBIV.removeExpireListener, sourceObject);
  delete sourceObject.expirationFunction;
}

// Sets a click listener for an object or an object group. The callbackFunction is executed
// with x, y, z coordinates of the clicked point. The callbackFunction is bound to object (this = object inside the function).
Roygbiv.prototype.setObjectClickListener = function(sourceObject, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setObjectClickListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.setObjectClickListener, "sourceObject marked as unintersectable, cannot be clicked on.", (!sourceObject.isIntersectable));
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setObjectClickListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectClickListener, sourceObject);
  sourceObject.clickCallbackFunction = callbackFunction;
  objectsWithOnClickListeners.set(sourceObject.name, sourceObject);
}

// Removes the click listener of an object or an object group.
Roygbiv.prototype.removeObjectClickListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removeObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.removeObjectClickListener, "sourceObject is marked as unintersectable.", (!sourceObject.isIntersectable));
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeObjectClickListener, sourceObject);
  delete sourceObject.clickCallbackFunction;
  objectsWithOnClickListeners.delete(sourceObject.name);
}

// Sets a click listener for the screen. The callbackFunction is
// executed with x, y coordinates when clicked on the screen.
Roygbiv.prototype.setScreenClickListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenClickListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenClickListener, preConditions.callbackFunction, callbackFunction);
  screenClickCallbackFunction = callbackFunction;
}

// Removes the click listener of screen.
Roygbiv.prototype.removeScreenClickListener = function(){
  if (mode == 0){
    return;
  }
  screenClickCallbackFunction = noop;
}

// Sets a mouse down listener for screen. The callbackFunction is
// executed with x, y coordinates when mouse-downed on the screen.
Roygbiv.prototype.setScreenMouseDownListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenMouseDownListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenMouseDownListener, preConditions.callbackFunction, callbackFunction);
  screenMouseDownCallbackFunction = callbackFunction;
}

// Removes the mouse down listener of screen.
Roygbiv.prototype.removeScreenMouseDownListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseDownCallbackFunction = noop;
}

// Sets mouse up listener for screen. The callbackFunction is
// executed with x, y coordinates when mouse-upped on the screen.
Roygbiv.prototype.setScreenMouseUpListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenMouseUpListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenMouseUpListener, preConditions.callbackFunction, callbackFunction);
  screenMouseUpCallbackFunction = callbackFunction;
}

// Removes mouse up listener for screen.
Roygbiv.prototype.removeScreenMouseUpListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseUpCallbackFunction = noop;
}

// Sets mouse move listener for screen. The callbackFunction is
// executed with x, y coordinates and dX, dY values when mouse moves on the screen.
Roygbiv.prototype.setScreenMouseMoveListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenMouseMoveListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenMouseMoveListener, preConditions.callbackFunction, callbackFunction);
  screenMouseMoveCallbackFunction = callbackFunction;
}

// Removes mouse move listener for screen.
Roygbiv.prototype.removeScreenMouseMoveListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseMoveCallbackFunction = noop;
}

// Sets a callback function for Pointer Lock API status changes. The callbackFunction
// is executed with isPointerLocked parameter.
Roygbiv.prototype.setScreenPointerLockChangeListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenPointerLockChangeListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenPointerLockChangeListener, preConditions.callbackFunction, callbackFunction);
  screenPointerLockChangedCallbackFunction = callbackFunction;
}

// Removes the Pointer Lock change listener for the screen.
Roygbiv.prototype.removeScreenPointerLockChangeListener = function(){
  if (mode == 0){
    return;
  }
  screenPointerLockChangedCallbackFunction = noop;
}

// Sets a listener for particle system pool consumption. The callbackFunction is
// executed wheren there is no available particle system left inside the pool.
Roygbiv.prototype.setParticleSystemPoolConsumedListener = function(psPool, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPoolConsumedListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.setParticleSystemPoolConsumedListener, preConditions.psPool, psPool);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPoolConsumedListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setParticleSystemPoolConsumedListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.setParticleSystemPoolConsumedListener, psPool);
  psPool.consumedCallback = callbackFunction;
}

// Removes the consumption listener of a particle system pool.
Roygbiv.prototype.removeParticleSystemPoolConsumedListener = function(psPool){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeParticleSystemPoolConsumedListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.removeParticleSystemPoolConsumedListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.removeParticleSystemPoolConsumedListener, psPool);
  psPool.consumedCallback = noop;
}

// Sets an availability listener for a particle system pool. The callbackFunction is executed
// when there is at least one available particle system inside the pool again.
Roygbiv.prototype.setParticleSystemPoolAvailableListener = function(psPool, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPoolAvailableListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.setParticleSystemPoolAvailableListener, preConditions.psPool, psPool);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemPoolAvailableListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setParticleSystemPoolAvailableListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.setParticleSystemPoolAvailableListener, psPool);
  psPool.availableCallback = callbackFunction;
}

// Removes the availablity listener for a particle system pool.
Roygbiv.prototype.removeParticleSystemPoolAvailableListener = function(psPool){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeParticleSystemPoolAvailableListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.removeParticleSystemPoolAvailableListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPoolInsideActiveScene(ROYGBIV.removeParticleSystemPoolAvailableListener, psPool);
  psPool.availableCallback = noop;
}

// Sets a callback function for fullscreen change API. The callbackFunction is executed
// with isFullScreenOn boolean parameter when the fullscreen status is changed.
Roygbiv.prototype.setFullScreenChangeCallbackFunction = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setFullScreenChangeCallbackFunction, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setFullScreenChangeCallbackFunction, preConditions.callbackFunction, callbackFunction);
  screenFullScreenChangeCallbackFunction = callbackFunction;
}

// Removes the fullscreen change listener.
Roygbiv.prototype.removeFullScreenChangeCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  screenFullScreenChangeCallbackFunction = noop;
}

// Sets a callback function for FPS drops. The callbackFunction is executed
// with dropAmount parameter if the FPS is less than 60 for given second. The
// dropAmount is calculated using this formula: (60 - [current_fps])
Roygbiv.prototype.setFPSDropCallbackFunction = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setFPSDropCallbackFunction, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setFPSDropCallbackFunction, preConditions.callbackFunction, callbackFunction);
  fpsDropCallbackFunction = callbackFunction;
}

// Removes the callback function for FPS drops.
Roygbiv.prototype.removeFPSDropCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  fpsDropCallbackFunction = noop;
}

// Sets a callback function for performance drops. The callbackFunction is executed
// if the FPS is under [minFPS] for [seconds] seconds. The callbackFunction is automatically
// removed after the execution, so use this function again if needed after the execution
// of the callbackFunction.
Roygbiv.prototype.setPerformanceDropCallbackFunction = function(minFPS, seconds, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.minFPS, minFPS);
  preConditions.checkIfNumber(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.minFPS, minFPS);
  preConditions.checkIfInRangeMinInclusive(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.minFPS, minFPS, 0, 60);
  preConditions.checkIfDefined(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfDefined(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.seconds, seconds);
  preConditions.checkIfNumber(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.seconds, seconds);
  preConditions.checkIfLessThan(ROYGBIV.setPerformanceDropCallbackFunction, preConditions.seconds, seconds, 0);
  performanceDropCallbackFunction = callbackFunction;
  fpsHandler.initiatePerformanceDropMonitoring(minFPS, seconds);
}

// Removes the callback function for performance drops.
Roygbiv.prototype.removePerformanceDropCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  performanceDropCallbackFunction = noop;
  fpsHandler.reset();
}

// Sets a callback function for user inactivity. The callbackFunction is executed
// if the user does not move or press the mouse or press a key for more than maxTimeInSeconds seconds.
// The callbackFunction is reset after the execution so use this function again to create a new
// inactivity listener.
Roygbiv.prototype.setUserInactivityCallbackFunction = function(maxTimeInSeconds, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setUserInactivityCallbackFunction, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setUserInactivityCallbackFunction, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfDefined(ROYGBIV.setUserInactivityCallbackFunction, preConditions.maxTimeInSeconds, maxTimeInSeconds);
  preConditions.checkIfNumber(ROYGBIV.setUserInactivityCallbackFunction, preConditions.maxTimeInSeconds, maxTimeInSeconds);
  preConditions.checkIfLessThan(ROYGBIV.setUserInactivityCallbackFunction, preConditions.maxTimeInSeconds, maxTimeInSeconds, 0);
  inactiveCounter = 0;
  maxInactiveTime = maxTimeInSeconds;
  userInactivityCallbackFunction = callbackFunction;
}

// Removes the user inactivity callback function.
Roygbiv.prototype.removeUserInactivityCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  inactiveCounter = 0;
  userInactivityCallbackFunction = noop;
  maxInactiveTime = 0;
}

// Sets a keydown listener. The callbackFunction is executed with the pressedChar
// parameter. See the values of keyCodeToChar variable for possible pressedChar
// parameters.
Roygbiv.prototype.setScreenKeydownListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenKeydownListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenKeydownListener, preConditions.callbackFunction, callbackFunction);
  screenKeydownCallbackFunction = callbackFunction;
}

// Removes the keydown listener.
Roygbiv.prototype.removeScreenKeydownListener = function(){
  if (mode == 0){
    return;
  }
  screenKeydownCallbackFunction = noop;
}

// Sets a keyup listener. The callbackFunction is executed with the uppedChar
// parameter. See the values of keyCodeToChar variable for possible uppedChar
// parameters.
Roygbiv.prototype.setScreenKeyupListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenKeyupListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenKeyupListener, preConditions.callbackFunction, callbackFunction);
  screenKeyupCallbackFunction = callbackFunction;
}

// Removes the keyup listener.
Roygbiv.prototype.removeScreenKeyupListener = function(){
  if (mode == 0){
    return;
  }
  screenKeyupCallbackFunction = noop;
}

// Sets a click listener for a text object. The callbackFunction is executed
// with textName parameter when the text object is clicked.
Roygbiv.prototype.onTextClick = function(text, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onTextClick, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.onTextClick, preConditions.text, text);
  preConditions.checkIfTextClickable(ROYGBIV.onTextClick, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.onTextClick, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onTextClick, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.onTextClick, text);
  text.clickCallbackFunction = callbackFunction;
  objectsWithOnClickListeners.set(text.name, text);
}

// Removes the click listener of a text object.
Roygbiv.prototype.removeTextClickListener = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeTextClickListener, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.removeTextClickListener, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.removeTextClickListener, text);
  text.clickCallbackFunction = noop;
  objectsWithOnClickListeners.delete(text.name);
}

// Sets a mouse wheel listener. The callbackFunction is executed with deltaX and deltaY parameters
// when a mousewheel event is triggered.
Roygbiv.prototype.setScreenMouseWheelListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenMouseWheelListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenMouseWheelListener, preConditions.callbackFunction, callbackFunction);
  screenMouseWheelCallbackFunction = callbackFunction;
}

// Removes the listener for mousewheel events.
Roygbiv.prototype.removeScreenMouseWheelListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseWheelCallbackFunction = noop;
}

// For mobile devices, sets a pinch zoom gesture listener. The callbackFunction is executed with
// delta parameter that represents the variation of the distance between two fingers.
Roygbiv.prototype.setScreenPinchListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenPinchListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenPinchListener, preConditions.callbackFunction, callbackFunction);
  screenPinchCallbackFunction = callbackFunction;
}

// Removes the listener for pinch gesture.
Roygbiv.prototype.removeScreenPinchListener = function(){
  if (mode == 0){
    return;
  }
  screenPinchCallbackFunction = noop;
}

// Sets a mouseover listener for an object or an object group. The callbackFunction is executed
// with x, y, z coordinates of mouse. The callbackFunction is bound to object (this = object inside the function).
Roygbiv.prototype.setObjectMouseOverListener = function(sourceObject, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectMouseOverListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setObjectMouseOverListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectMouseOverListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.setObjectMouseOverListener, "sourceObject marked as unintersectable, cannot be selected.", (!sourceObject.isIntersectable));
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setObjectMouseOverListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectMouseOverListener, sourceObject);
  sourceObject.mouseOverCallbackFunction = callbackFunction;
  objectsWithMouseOverListeners.set(sourceObject.name, sourceObject);
}

// Removes the mouseover listener of an object or an object group.
Roygbiv.prototype.removeObjectMouseOverListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeObjectMouseOverListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removeObjectMouseOverListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.removeObjectMouseOverListener, "sourceObject is marked as unintersectable.", (!sourceObject.isIntersectable));
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeObjectMouseOverListener, sourceObject);
  delete sourceObject.mouseOverCallbackFunction;
  objectsWithMouseOverListeners.delete(sourceObject.name);
}

// Sets a mouseout listener for an object or an object group. The callbackFunction is bound to object
// (this = object inside the function).
Roygbiv.prototype.setObjectMouseOutListener = function(sourceObject, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectMouseOutListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setObjectMouseOutListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectMouseOutListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.setObjectMouseOutListener, "sourceObject marked as unintersectable, cannot be selected.", (!sourceObject.isIntersectable));
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setObjectMouseOutListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectMouseOutListener, sourceObject);
  sourceObject.mouseOutCallbackFunction = callbackFunction;
  objectsWithMouseOutListeners.set(sourceObject.name, sourceObject);
}

// Removes the mouseout listener of an object or an object group.
Roygbiv.prototype.removeObjectMouseOutListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeObjectMouseOutListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removeObjectMouseOutListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.removeObjectMouseOutListener, "sourceObject is marked as unintersectable.", (!sourceObject.isIntersectable));
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeObjectMouseOutListener, sourceObject);
  delete sourceObject.mouseOutCallbackFunction;
  objectsWithMouseOutListeners.delete(sourceObject.name);
}

// Sets a mouseover listener for a text. The callbackFunction is bound to text (this = text inside the function).
Roygbiv.prototype.onTextMouseOver = function(text, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onTextMouseOver, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.onTextMouseOver, preConditions.text, text);
  preConditions.checkIfTextClickable(ROYGBIV.onTextMouseOver, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.onTextMouseOver, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onTextMouseOver, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.onTextMouseOver, text);
  text.mouseOverCallbackFunction = callbackFunction;
  objectsWithMouseOverListeners.set(text.name, text);
}

// Removes the mouseover listener of a text.
Roygbiv.prototype.removeTextMouseOverListener = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeTextMouseOverListener, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.removeTextMouseOverListener, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.removeTextMouseOverListener, text);
  delete text.mouseOverCallbackFunction;
  objectsWithMouseOverListeners.delete(text.name);
}

// Sets a mouseout listener for a text. The callbackFunction is bound to text (this = text inside the function).
Roygbiv.prototype.onTextMouseOut = function(text, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onTextMouseOut, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.onTextMouseOut, preConditions.text, text);
  preConditions.checkIfTextClickable(ROYGBIV.onTextMouseOut, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.onTextMouseOut, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onTextMouseOut, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.onTextMouseOut, text);
  text.mouseOutCallbackFunction = callbackFunction;
  objectsWithMouseOutListeners.set(text.name, text);
}

// Removes the mouseout listener of a text.
Roygbiv.prototype.removeTextMouseOutListener = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeTextMouseOutListener, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.removeTextMouseOutListener, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.removeTextMouseOutListener, text);
  delete text.mouseOutCallbackFunction;
  objectsWithMouseOutListeners.delete(text.name);
}

// Sets a listener for an object detecting the position threshold passage for given axis. If controlMode = 1
// the callbackFunction is executed when object.position[axis] > threshold, if controlMode = 2 the callbackFunction
// is executed when object.position[axis] < threshold. The callbackFunction is bound to object (this = object inside the function)
// This API may be used to restart position of objects that went out of bounds of the scene by falling down etc.
Roygbiv.prototype.onObjectPositionThresholdExceeded = function(object, axis, threshold, controlMode, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.threshold, threshold);
  preConditions.checkIfDefined(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfDefined(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.controlMode, controlMode);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.object, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.object, object);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.threshold, threshold);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onObjectPositionThresholdExceeded, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfTrue(ROYGBIV.onObjectPositionThresholdExceeded, "controlMode must be 1 or 2", (controlMode != 1 && controlMode != 2));
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.onObjectPositionThresholdExceeded, object);
  object.setPositionThresholdExceededListener(axis, threshold, controlMode, callbackFunction);
}

// Removes the position threshold passage listener for an object. Does nothing
// if the object does not have such listener.
Roygbiv.prototype.removeObjectPositionThresholdExceededListener = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeObjectPositionThresholdExceededListener, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removeObjectPositionThresholdExceededListener, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeObjectPositionThresholdExceededListener, object);
  if (object.positionThresholdExceededListenerInfo){
    object.positionThresholdExceededListenerInfo.isActive = false;
  }
}

// Sets a mouse drag listener for the screen. The callbackFunction is executed with x, y, movementX and movementY
// parameters.
Roygbiv.prototype.setScreenDragListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenDragListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenDragListener, preConditions.callbackFunction, callbackFunction);
  screenDragCallbackFunction = callbackFunction;
}

// Removes the screen drag listener.
Roygbiv.prototype.removeScreenDragListener = function(){
  if (mode == 0){
    return;
  }
  screenDragCallbackFunction = noop;
}

// Sets a listener for orientation change events. For mobile devices, the callbackFunction is executed with
// isLandscape parameter when the orientation is changed.
Roygbiv.prototype.setScreenOrientationChangeListener = function(callbackFunction){
  if (mode == 0 || !isMobile){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setScreenOrientationChangeListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setScreenOrientationChangeListener, preConditions.callbackFunction, callbackFunction);
  screenOrientationChangeCallbackFunction = callbackFunction;
}

// Removes the listener for orientation change events.
Roygbiv.prototype.removeScreenOrientationChangeListener = function(){
  if (mode == 0 || !isMobile){
    return;
  }
  screenOrientationChangeCallbackFunction = noop;
}

// Sets a finish listener for an animation of given object, object group or text.
// For repeating animations the callbackFunction is executed before each repeat.
// For rewinding animations the callbackFunction is executed when the rewind is finished.
Roygbiv.prototype.onAnimationFinished = function(object, animationName, callbackFunction){
  if (mode ==  0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onAnimationFinished, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.onAnimationFinished, preConditions.animationName, animationName);
  preConditions.checkIfDefined(ROYGBIV.onAnimationFinished, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.onAnimationFinished, preConditions.object, object);
  preConditions.checkIfAnimationExists(ROYGBIV.onAnimationFinished, object, animationName);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onAnimationFinished, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.onAnimationFinished, object);
  object.animations[animationName].setFinishCallbackFunction(callbackFunction);
}

// Removes the finish listener for an animation of given object, object group or text.
Roygbiv.prototype.removeAnimationFinishListener = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeAnimationFinishListener, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.removeAnimationFinishListener, preConditions.animationName, animationName);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.removeAnimationFinishListener, preConditions.object, object);
  preConditions.checkIfAnimationExists(ROYGBIV.removeAnimationFinishListener, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeAnimationFinishListener, object);
  object.animations[animationName].finishCallbackFunction = noop;
}

// Executes the callbackFunction with exitedAreaName parameter when the camera enters
// into given area. The exitedAreaName is the name of the previous area
// that the camera was in.
Roygbiv.prototype.onAreaEnter = function(areaName, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onAreaEnter, preConditions.areaName, areaName);
  preConditions.checkIfDefined(ROYGBIV.onAreaEnter, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAreaExists(ROYGBIV.onAreaEnter, areaName);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onAreaEnter, preConditions.callbackFunction, callbackFunction);
  areaEnterCallbacks[areaName] = callbackFunction;
}

// Executes the callbackFunction with enteredAreaName parameter when the camera exits
// from given area. The enteredAreaName is the name of the area that the
// camera entered into.
Roygbiv.prototype.onAreaExit = function(areaName, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onAreaExit, preConditions.areaName, areaName);
  preConditions.checkIfDefined(ROYGBIV.onAreaExit, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAreaExists(ROYGBIV.onAreaExit, areaName);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onAreaExit, preConditions.callbackFunction, callbackFunction);
  areaExitCallbacks[areaName] = callbackFunction;
}

// Removes the area enter listener for given area name.
Roygbiv.prototype.removeAreaEnterListener = function(areaName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeAreaEnterListener, preConditions.areaName, areaName);
  preConditions.checkIfAreaExists(ROYGBIV.removeAreaEnterListener, areaName);
  delete areaEnterCallbacks[areaName];
}

// Removes the area exit listener for given area name.
Roygbiv.prototype.removeAreaExitListener = function(areaName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeAreaExitListener, preConditions.areaName, areaName);
  preConditions.checkIfAreaExists(ROYGBIV.removeAreaExitListener, areaName);
  delete areaExitCallbacks[areaName];
}

// Sets a sprite click listener. The callbackFunction is executed when the
// sprite is clicked.
Roygbiv.prototype.onSpriteClick = function(sprite, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onSpriteClick, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.onSpriteClick, preConditions.sprite, sprite);
  preConditions.checkIfSpriteClickable(ROYGBIV.onSpriteClick, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.onSpriteClick, sprite);
  preConditions.checkIfDefined(ROYGBIV.onSpriteClick, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSpriteClick, preConditions.callbackFunction, callbackFunction);
  sprite.onClickCallback = callbackFunction;
  objectsWithOnClickListeners.set(sprite.name, sprite);
}

// Removes the click listener of a sprite object.
Roygbiv.prototype.removeSpriteClickListener = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeSpriteClickListener, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.removeSpriteClickListener, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.removeSpriteClickListener, sprite);
  sprite.onClickCallback = noop;
  objectsWithOnClickListeners.delete(sprite.name);
}

// Sets a mouse over listener for a sprite.
Roygbiv.prototype.onSpriteMouseOver = function(sprite, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onSpriteMouseOver, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.onSpriteMouseOver, preConditions.sprite, sprite);
  preConditions.checkIfSpriteClickable(ROYGBIV.onSpriteMouseOver, sprite);
  preConditions.checkIfDefined(ROYGBIV.onSpriteMouseOver, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSpriteMouseOver, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.onSpriteMouseOver, sprite);
  sprite.mouseOverCallbackFunction = callbackFunction;
  objectsWithMouseOverListeners.set(sprite.name, sprite);
}

// Removes the mouseover listener of a sprite.
Roygbiv.prototype.removeSpriteMouseOverListener = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeSpriteMouseOverListener, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.removeSpriteMouseOverListener, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.removeSpriteMouseOverListener, sprite);
  delete sprite.mouseOverCallbackFunction;
  objectsWithMouseOverListeners.delete(sprite.name);
}

// Sets a mouseout listener for a sprite.
Roygbiv.prototype.onSpriteMouseOut = function(sprite, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onSpriteMouseOut, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.onSpriteMouseOut, preConditions.sprite, sprite);
  preConditions.checkIfSpriteClickable(ROYGBIV.onSpriteMouseOut, sprite);
  preConditions.checkIfDefined(ROYGBIV.onSpriteMouseOut, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSpriteMouseOut, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.onSpriteMouseOut, sprite);
  sprite.mouseOutCallbackFunction = callbackFunction;
  objectsWithMouseOutListeners.set(sprite.name, sprite);
}

// Removes the mouseout listener of a sprite.
Roygbiv.prototype.removeSpriteMouseOutListener = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeSpriteMouseOutListener, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.removeSpriteMouseOutListener, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.removeSpriteMouseOutListener, sprite);
  delete sprite.mouseOutCallbackFunction;
  objectsWithMouseOutListeners.delete(sprite.name);
}

// Sets a drag start listener for a sprite. The callbackFunction is executed
// with diffX and diffY parameters when a drag is initiated on a draggable sprite.
Roygbiv.prototype.onSpriteDragStart = function(sprite, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onSpriteDragStart, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.onSpriteDragStart, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.onSpriteDragStart, sprite);
  preConditions.checkIfDefined(ROYGBIV.onSpriteDragStart, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSpriteDragStart, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfSpriteDraggable(ROYGBIV.onSpriteDragStart, sprite);
  sprite.dragStartCallback = callbackFunction;
}

// Sets a drag stop listener for a sprite. The callbackFunction is executed
// when a user stops dragging a sprite (mouseup/touchend).
Roygbiv.prototype.onSpriteDragStop = function(sprite, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onSpriteDragStop, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.onSpriteDragStop, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.onSpriteDragStop, sprite);
  preConditions.checkIfDefined(ROYGBIV.onSpriteDragStop, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSpriteDragStop, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfSpriteDraggable(ROYGBIV.onSpriteDragStop, sprite);
  sprite.dragStopCallback = callbackFunction;
}

// Sets a dragging listener for a sprite. The callbackFunction is executed
// each time a sprite is relocated while being dragged.
Roygbiv.prototype.onSpriteDragging = function(sprite, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.onSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.onSpriteDragging, sprite);
  preConditions.checkIfDefined(ROYGBIV.onSpriteDragging, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSpriteDragging, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfSpriteDraggable(ROYGBIV.onSpriteDragging, sprite);
  sprite.draggingCallback = callbackFunction;
}

// Removes the drag start listener of a sprite.
Roygbiv.prototype.removeSpriteDragStartListener = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeSpriteDragStartListener, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.removeSpriteDragStartListener, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.removeSpriteDragStartListener, sprite);
  preConditions.checkIfSpriteDraggable(ROYGBIV.removeSpriteDragStartListener, sprite);
  sprite.dragStartCallback = noop;
}

// Removes the drag stop listener of a sprite.
Roygbiv.prototype.removeSpriteDragStopListener = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeSpriteDragStopListener, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.removeSpriteDragStopListener, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.removeSpriteDragStopListener, sprite);
  preConditions.checkIfSpriteDraggable(ROYGBIV.removeSpriteDragStopListener, sprite);
  sprite.dragStopCallback = noop;
}

// Removes the dragging listener of a sprite.
Roygbiv.prototype.removeSpriteDraggingListener = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeSpriteDraggingListener, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.removeSpriteDraggingListener, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.removeSpriteDraggingListener, sprite);
  preConditions.checkIfSpriteDraggable(ROYGBIV.removeSpriteDraggingListener, sprite);
  sprite.draggingCallback = noop;
}

// Sets a click listener for a container. The callbackFunction is executed
// when the container is clicked.
Roygbiv.prototype.onContainerClick = function(container, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onContainerClick, preConditions.container, container);
  preConditions.checkIfDefined(ROYGBIV.onContainerClick, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfContainer(ROYGBIV.onContainerClick, container);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onContainerClick, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfContainerClickable(ROYGBIV.onContainerClick, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.onContainerClick, container);
  container.onClickCallback = callbackFunction;
  objectsWithOnClickListeners.set(container.name, container);
}

// Removes the click listener of a container.
Roygbiv.prototype.removeContainerClickListener = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeContainerClickListener, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.removeContainerClickListener, container);
  preConditions.checkIfContainerClickable(ROYGBIV.removeContainerClickListener, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.removeContainerClickListener, container);
  container.onClickCallback = noop;
  objectsWithOnClickListeners.delete(container.name);
}

// Sets a mouse over listener for a container. The callbackFunction is executed
// when the mouse is moved over a container.
Roygbiv.prototype.onContainerMouseOver = function(container, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onContainerMouseOver, preConditions.container, container);
  preConditions.checkIfDefined(ROYGBIV.onContainerMouseOver, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfContainer(ROYGBIV.onContainerMouseOver, container);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onContainerMouseOver, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfContainerClickable(ROYGBIV.onContainerMouseOver, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.onContainerMouseOver, container);
  container.mouseOverCallbackFunction = callbackFunction;
  objectsWithMouseOverListeners.set(container.name, container);
}

// Removes the mouse over listener for a container.
Roygbiv.prototype.removeContainerMouseOverListener = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeContainerMouseOverListener, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.removeContainerMouseOverListener, container);
  preConditions.checkIfContainerClickable(ROYGBIV.removeContainerMouseOverListener, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.removeContainerMouseOverListener, container);
  container.mouseOverCallbackFunction = noop;
  objectsWithMouseOverListeners.delete(container.name);
}

// Sets a mouse out listener for a container. The callbackFunction is executed
// when the mouse is moved out from a container.
Roygbiv.prototype.onContainerMouseOut = function(container, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onContainerMouseOut, preConditions.container, container);
  preConditions.checkIfDefined(ROYGBIV.onContainerMouseOut, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfContainer(ROYGBIV.onContainerMouseOut, container);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onContainerMouseOut, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfContainerClickable(ROYGBIV.onContainerMouseOut, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.onContainerMouseOut, container);
  container.mouseOutCallbackFunction = callbackFunction;
  objectsWithMouseOutListeners.set(container.name, container);
}

// Removes the mouse out listener for a container.
Roygbiv.prototype.removeContainerMouseOutListener = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeContainerMouseOutListener, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.removeContainerMouseOutListener, container);
  preConditions.checkIfContainerClickable(ROYGBIV.removeContainerMouseOutListener, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.removeContainerMouseOutListener, container);
  container.mouseOutCallbackFunction = noop;
  objectsWithMouseOutListeners.delete(container.name);
}

// Sets a text change listener to a virtual keyboard. The callbackFunction is executed with
// newText parameter everytime a text of a virtual keyboard is changed.
Roygbiv.prototype.onVirtualKeyboardTextChange = function(virtualKeyboard, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onVirtualKeyboardTextChange, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.onVirtualKeyboardTextChange, virtualKeyboard);
  preConditions.checkIfDefined(ROYGBIV.onVirtualKeyboardTextChange, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onVirtualKeyboardTextChange, preConditions.callbackFunction, callbackFunction);
  virtualKeyboard.onTextChangeCallback = callbackFunction;
}

// Removes the text change listener from a virtual keyboard.
Roygbiv.prototype.removeVirtualKeyboardTextChangeListener = function(virtualKeyboard){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onVirtualKeyboardTextChange, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.onVirtualKeyboardTextChange, virtualKeyboard);
  virtualKeyboard.onTextChangeCallback = noop;
}

// Sets a flush listener to a virtual keyboard. The callbackFunction is executed
// with flushedText parameter when the user presses on the OK button of a virtual keyboard.
Roygbiv.prototype.onVirtualKeyboardFlush = function(virtualKeyboard, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onVirtualKeyboardTextChange, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.onVirtualKeyboardTextChange, virtualKeyboard);
  preConditions.checkIfDefined(ROYGBIV.onVirtualKeyboardTextChange, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onVirtualKeyboardTextChange, preConditions.callbackFunction, callbackFunction);
  virtualKeyboard.onFlushCallback = callbackFunction;
}

// Removes the flush listener from a virtual keyboard.
Roygbiv.prototype.removeVirtualKeyboardFlushListener = function(virtualKeyboard){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onVirtualKeyboardTextChange, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.onVirtualKeyboardTextChange, virtualKeyboard);
  virtualKeyboard.onFlushCallback = noop;
}

// Sets a location hash change listener. The callbackFunction is executed with
// the newHash parameter when the location hash changes.
Roygbiv.prototype.onLocationHashChange = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onLocationHashChange, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onLocationHashChange, preConditions.callbackFunction, callbackFunction);
  hashChangeCallbackFunction = callbackFunction;
}

// Removes the location hash change listener.
Roygbiv.prototype.removeLocationHashChangeListener = function(){
  if (mode == 0){
    return;
  }
  hashChangeCallbackFunction = noop;
}

// Sets a path finish listener for PathFollowingBehavior of given steerable object.
// The callbackFunction is executed when the path of given PathFollowingBehavior
// is consumed.
Roygbiv.prototype.setPathFinishListener = function(object, behaviorName, callbackFunction){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.setPathFinishListener, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setPathFinishListener, preConditions.behaviorName, behaviorName);
  preConditions.checkIfDefined(ROYGBIV.setPathFinishListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setPathFinishListener, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setPathFinishListener, object);
  preConditions.checkIfSteerable(ROYGBIV.setPathFinishListener, object);
  preConditions.checkIfString(ROYGBIV.setPathFinishListener, preConditions.behaviorName, behaviorName);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setPathFinishListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfObjectHasBehavior(ROYGBIV.setPathFinishListener, object, behaviorName);
  preConditions.checkIfPathFollowingBehavior(ROYGBIV.setPathFinishListener, object, behaviorName);

  steeringHandler.setPathFinishListener(object, behaviorName, callbackFunction);
}

// Removes a path finish listener for PathFollowingBehavior of given steerable object.
Roygbiv.prototype.removePathFinishListener = function(object, behaviorName){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.removePathFinishListener, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.removePathFinishListener, preConditions.behaviorName, behaviorName);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removePathFinishListener, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removePathFinishListener, object);
  preConditions.checkIfSteerable(ROYGBIV.removePathFinishListener, object);
  preConditions.checkIfString(ROYGBIV.removePathFinishListener, preConditions.behaviorName, behaviorName);
  preConditions.checkIfObjectHasBehavior(ROYGBIV.removePathFinishListener, object, behaviorName);
  preConditions.checkIfPathFollowingBehavior(ROYGBIV.removePathFinishListener, object, behaviorName);

  steeringHandler.removePathFinishListener(object, behaviorName);
}

// Sets a mouse move listener for given object. The callbackFunction is executed
// with x, y, z parameters every frame the mouse is on given object.
Roygbiv.prototype.setObjectMouseMoveListener = function(object, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectMouseMoveListener, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setObjectMouseMoveListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectMouseMoveListener, preConditions.object, object);
  preConditions.checkIfTrue(ROYGBIV.setObjectMouseMoveListener, "object marked as unintersectable, cannot be selected.", (!object.isIntersectable));
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setObjectMouseMoveListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setObjectMouseMoveListener, object);

  object.mouseMoveCallbackFunction = callbackFunction;
  objectsWithMouseMoveListeners.set(object.name, object);
}

// Removes the mouse move listener from given object.
Roygbiv.prototype.removeObjectMouseMoveListener = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeObjectMouseMoveListener, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removeObjectMouseMoveListener, preConditions.object, object);
  preConditions.checkIfTrue(ROYGBIV.removeObjectMouseMoveListener, "object marked as unintersectable, cannot be selected.", (!object.isIntersectable));
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removeObjectMouseMoveListener, object);

  delete object.mouseMoveCallbackFunction;
  objectsWithMouseMoveListeners.delete(object.name);
}

// Sets a position change listener to given object or object group. The callbackFunction
// is executed with x, y, z coordinates everytime the position of the object changes.
Roygbiv.prototype.setPositionChangeListener = function(object, callbackFunction){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.setPositionChangeListener, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setPositionChangeListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setPositionChangeListener, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setPositionChangeListener, object);
  preConditions.checkIfPositionChangeable(ROYGBIV.setPositionChangeListener, object);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setPositionChangeListener, preConditions.callbackFunction, callbackFunction);

  object.positionChangeCallbackFunction = callbackFunction;
}

// Removes a position change listener from given object.
Roygbiv.prototype.removePositionChangeListener = function(object){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.removePositionChangeListener, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removePositionChangeListener, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.removePositionChangeListener, object);
  preConditions.checkIfPositionChangeable(ROYGBIV.removePositionChangeListener, object);

  object.positionChangeCallbackFunction = noop;
}

// Sets an exit callback function for given scene. The callback function is
// executed before the scene changes.
Roygbiv.prototype.onSceneExit = function(sceneName, callbackFunction){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.onSceneExit, preConditions.sceneName, sceneName);
  preConditions.checkIfDefined(ROYGBIV.onSceneExit, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfSceneExists(ROYGBIV.onSceneExit, sceneName);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onSceneExit, preConditions.callbackFunction, callbackFunction);

  sceneHandler.scenes[sceneName].beforeExitCallback = callbackFunction;
}

// Removes a scene exit listener for given scene.
Roygbiv.prototype.removeSceneExitListener = function(sceneName){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.removeSceneExitListener, preConditions.sceneName, sceneName);
  preConditions.checkIfSceneExists(ROYGBIV.removeSceneExitListener, sceneName);

  sceneHandler.scenes[sceneName].beforeExitCallback = noop;
}

// TEXT FUNCTIONS **************************************************************

// Sets a text to a text object.
Roygbiv.prototype.setText = function(textObject, text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setText, preConditions.textObject, textObject);
  preConditions.checkIfAddedText(ROYGBIV.setText, preConditions.textObject, textObject);
  preConditions.checkIfDefined(ROYGBIV.setText, preConditions.text, text);
  preConditions.checkIfString(ROYGBIV.setText, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setText, textObject);
  textObject.setText(text, true);
  if (textObject.containerParent){
    textObject.containerParent.insertAddedText(textObject);
  }
}

// Sets the color of a text. colorName can be a color name like red or an hex string
// like #afef54.
Roygbiv.prototype.setTextColor = function(text, colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextColor, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextColor, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextColor, preConditions.colorName, colorName);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setTextColor, text);
  text.setColor(colorName, true);
}

// Sets the alpha of a text.
Roygbiv.prototype.setTextAlpha = function(text, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextAlpha, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextAlpha, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextAlpha, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.setTextAlpha, preConditions.alpha, alpha);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setTextAlpha, text);
  text.setAlpha(alpha, true);
}

// Sets the position of a text object. If text is 2D only x and y parameters are
// necessary representing the marginX and marginY.
Roygbiv.prototype.setTextPosition = function(text, x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextPosition, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.y, y);
  preConditions.checkIfDefinedOnlyIfYTrue(ROYGBIV.setTextPosition, "z is mandatory parameter for 3D texts.", !text.is2D, z);
  preConditions.checkIfNumber(ROYGBIV.setTextPosition, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setTextPosition, preConditions.y, y);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setTextPosition, preConditions.z, z);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setTextPosition, text);
  preConditions.checkIfTextContained(ROYGBIV.setTextPosition, text);
  text.setPosition(x, y, z);
}

// Sets the background color/alpha of a text object.
Roygbiv.prototype.setTextBackground = function(text, colorName, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextBackground, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextBackground, preConditions.text, text);
  preConditions.checkIfTrue(ROYGBIV.setTextBackground, "text has no background", (!text.hasBackground));
  preConditions.checkIfDefined(ROYGBIV.setTextBackground, preConditions.colorName, colorName);
  preConditions.checkIfString(ROYGBIV.setTextBackground, preConditions.colorName, colorName);
  preConditions.checkIfDefined(ROYGBIV.setTextBackground, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.setTextBackground, preConditions.alpha, alpha);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setTextBackground, text);
  text.setBackground(colorName, alpha, true);
}

// Removes the background of a text object.
Roygbiv.prototype.removeTextBackground = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeTextBackground, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.removeTextBackground, preConditions.text, text);
  preConditions.checkIfTrue(ROYGBIV.setTextBackground, "text has no background", (!text.hasBackground));
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setTextBackground, text);
  text.removeBackground(true);
}

// Puts the center of the given text object to given x, y, z coordinates.
Roygbiv.prototype.setTextCenterPosition = function(text, x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextCenterPosition, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextCenterPosition, preConditions.text, text);
  preConditions.checkIfText2D(ROYGBIV.setTextCenterPosition, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextCenterPosition, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setTextCenterPosition, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.setTextCenterPosition, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.setTextCenterPosition, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setTextCenterPosition, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.setTextCenterPosition, preConditions.z, z);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.setTextCenterPosition, text);
  var centerPos = text.getCenterCoordinates();
  text.mesh.position.set(text.mesh.position.x + (x - centerPos.x), text.mesh.position.y + (y - centerPos.y), text.mesh.position.z + (z - centerPos.z));
}

// Makes the given text object invisible. Does nothing if the text is already
// invisible.
Roygbiv.prototype.hideText = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideText, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.hideText, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.hideText, text);
  if (text.mesh.visible){
    text.hide();
  }
}

// Makes the given text object visible. Does nothing if the text is already
// visible.
Roygbiv.prototype.showText = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showText, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.showText, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.showText, text);
  if (!text.mesh.visible){
    text.show();
  }
}

// Activates the input mode for a 2D text. Does nothing if the text is already in
// input mode. The optional cursorSizePercent parameter can be used to adjust the
// cursor size (cursorSize = charSize * cursorSizePercent / 100)
Roygbiv.prototype.activateTextInputMode = function(text, cursorSizePercent){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.activateTextInputMode, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.activateTextInputMode, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.activateTextInputMode, text);
  preConditions.checkIfText3D(ROYGBIV.activateTextInputMode, preConditions.text, text);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.activateTextInputMode, preConditions.cursorSizePercent, cursorSizePercent);
  text.activateInputMode(cursorSizePercent);
}

// Deactivates the input mode for a 2D text. Does nothing if the text is already
// deactivated from input mode.
Roygbiv.prototype.deactivateTextInputMode = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.activateTextInputMode, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.activateTextInputMode, preConditions.text, text);
  preConditions.checkIfTextInsideActiveScene(ROYGBIV.activateTextInputMode, text);
  preConditions.checkIfText3D(ROYGBIV.activateTextInputMode, preConditions.text, text);
  text.deactivateInputMode();
}

// CONTROL FUNCTIONS ***********************************************************

// Creates a new FreeControl implementation where the camera can freely move
// inside the scene for both desktop and mobile devices. The controls are:
// WSAD or ZQSD (French keyboard): Translate on plane XZ
// E - Space: Translate on axis Y
// Arrow keys or touch (mobile): Look around
// Finger pinch (mobile) - Mouse wheel (desktop): Translate on axis Z
// The configurations are:
// rotationYDelta (optional): Camera rotation amount for left-right keys. Default is 0.07.
// rotationXDelta (optional): Camera rotation amount for up-down keys. Default is 0.07.
// translateZAmount (optional): Translation amount on Z axis for WS or ZS keys or finger pinch events. Default is 3.
// translateXAmount (optional): Translation amount on X axis for DA or DQ keys. Default is 3.
// translateYAmount (optional): Translation amount on Y axis for E-Space keys. Default is 3.
// mouseWheelSpeed (optional): Translation speed for mousewheel zoom in/out. Default is 1.
// swipeSpeed (optional): Rotation speed for look with touch events on mobile. Default is 0.002.
// mouseDragSpeed (optional): Rotation speed for mouse drag events on desktop devices. Default is 15.
// requestFullScreen (optional): If true, fullscreen mode is requested automatically. Default is false.
Roygbiv.prototype.createFreeControl = function(parameters){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createFreeControl, preConditions.parameters, parameters);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.rotationYDelta, parameters.rotationYDelta);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.rotationXDelta, parameters.rotationXDelta);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.translateZAmount, parameters.translateZAmount);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.translateXAmount, parameters.translateXAmount);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.translateYAmount, parameters.translateYAmount);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.mouseWheelSpeed, parameters.mouseWheelSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.swipeSpeed, parameters.swipeSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFreeControl, preConditions.mouseDragSpeed, parameters.mouseDragSpeed);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createFreeControl, preConditions.requestFullScreen, parameters.requestFullScreen);
  return new FreeControls(params);
}

// Creates a CustomControl implementation. This API may be used to create custom
// controls by filling the related event handlers. Parameters are:
// onClick (optional): Function to be executed with the click event when the user clicks. Default value is noop.
// onTap (optional): Function to be executed with the touch event when the user taps (mobile). Default value is noop.
// onSwipe (optional): Function to be executed with x, y, diffX and diffY parameters when the user moves their finger
// on the screen (mobile). Default value is noop.
// onPinch (optional): Function to be executed with diff parameter when the user performs a pinch zoom (mobile).
// Default value is noop.
// onMouseWheel (optional): Function to be executed with the mouse wheel event when the user performs a mouse wheel.
// Default value is noop.
// onMouseMove (optional): Function to be executed with the mouse move event when the user performs a mouse move.
// Default value is noop.
// onMouseDown (optional): Function to be executed with the mouse down event when the user performs a mouse down.
// Default vaue is noop.
// onMouseUp (optional): Function to be executed with the mouse up event when the user performs a mouse up. Default
// value is noop.
// onTouchStart (optional): Function to be executed with the TouchEvent when the user performs a touch start. Default
// value is noop.
// onTouchMove (optional): Function to be executed with the TouchEvent when the user performs a touch move. Default
// value is noop.
// onTouchEnd (optional): Function to be executed with the TouchEvent when the user performs a touch end. Default
// value is noop.
// onKeyDown (optional): Function to be executed with the key down event when the user performs a key down. Default
// value is noop.
// onKeyUp (optional): Function to be executed with the key up event when the user performs a key up. Default
// value is noop.
// onResize (optional): Function to be executed when the screen is resized. Default value is noop.
// onFullScreenChange (optional): Function to be executed with the isFullScreen parameter when the
// fullscreen status of the screen is changed. Default value is noop.
// onDrag (optional): Function to be executed with x, y, movementX, movementY parameters when the user performs
// a moue drag operation. Default value is noop.
// onUpdate (optional): Function to be executed on each frame. Default value is noop.
Roygbiv.prototype.createCustomControl = function(parameters){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createCustomControl, preConditions.parameters, parameters);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onClick, parameters.onClick);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onTap, parameters.onTap);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onSwipe, parameters.onSwipe);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onPinch, parameters.onPinch);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onMouseWheel, parameters.onMouseWheel);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onMouseMove, parameters.onMouseMove);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onMouseDown, parameters.onMouseDown);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onMouseUp, parameters.onMouseUp);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onTouchStart, parameters.onTouchStart);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onTouchMove, parameters.onTouchMove);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onTouchEnd, parameters.onTouchEnd);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onUpdate, parameters.onUpdate);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onKeyDown, parameters.onKeyDown);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onResize, parameters.onResize);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onFullScreenChange, parameters.onFullScreenChange);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onKeyUp, parameters.onKeyUp);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCustomControl, preConditions.onDrag, parameters.onDrag);
  return new CustomControls(parameters);
}

// Sets the active control.
Roygbiv.prototype.setActiveControl = function(control){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setActiveControl, preConditions.control, control);
  preConditions.checkIfTrue(ROYGBIV.setActiveControl, "control is not a Control object.", !control.isControl);
  var callOnActivated = false;
  if (activeControl !== control){
    callOnActivated = true;
    activeControl.onDeactivated();
  }
  activeControl = control;
  if (callOnActivated){
    control.onActivated();
  }
}

// Creates a new FPSControls object to be used in First Person Shooter games for
// both desktop and mobile devices. FPSControls automatically handles the PointerLock
// as well. The controls are:
// For desktop:
// WSAD/ZQSD (French keyboard) / Arrow Keys: Move
// Mouse: Look
// Click: Shoot
// Space: Jump
// For mobile:
// Left side of the screen: Move
// Right side of the screen: Look around
// Tap on the right side of the screen: Jump
// For mobile devices controls are automatically paused for portrait orientation.
// Configurations are:
// playerBodyObject (mandatory): A dummy sphere type object to physically represent the player.
// The camera is placed on the center of the playerBodyObject. The playerBodyObject is graphically hidden
// when the FPSControls object is activated, shown again when deactivated. The playerBodyObject must be a
// dynamic object (mass > 0) and must be marked as changeable in order to be used by FPSControls class.
// initialPosition (mandatory): The initial position of playerBodyObject.
// mouseSpeed (optional): The speed of mouse based camera look-around event. Default value is 0.002.
// touchLookSpeed (optional): The speed of touch based camera look*around event. Default value is 0.01.
// speed (optional): The speed of motion. Default value is 200.
// jumpSpeed (optional): The jump speed. Default value is 500.
// touchJoystickThreshold (optional): For the left hand move controls on mobile devices, this
// parameter is used in order to filter out negligible TouchEvents on finger move, thus preventing
// flickering moves. The TouchEvents are filtered if the length between the previous and the current
// (pageX, pageY) is less than or equals to touchJoystickThreshold. Default value is 1.5.
// crosshairName (optional): The name of the Crosshair.
// crosshairExpandSize (optional): The target size of the crosshair in order to be used for expand animation
// when the player is moving or shooting. Default value is 9.
// crosshairAnimationDelta (optional): The delta value of the crosshair expand animation. Default value is 0.2.
// hasDoubleJump (optional): If true, the user may double jump by pressing Space or tapping twice. Default value is true.
// doubleJumpTimeThresholdInMs (optional): This parameter define the max time in milliseconds between two Space key hits or
// taps in order to perform a double jump. Default value is 500.
// weaponObject1 (optional): The first weapon object. This might be any object or object group marked as FPS Weapon.
// weaponObject2 (optional): The second weapon object. This might be any object or object group marked as FPS Weapon.
// hasIdleGunAnimation (optional): If true weapon objects are animated in order to give the FPS controls a realistic
// feeling. Default value is true.
// idleGunAnimationSpeed (optional): The speed of the idle gun animation. Default value is 0.05.
// weaponRotationRandomnessOn (optional): If true the weapons rotate a bit more than the camera in order to
// give the FPS view more realistic view. Default value is true.
// onLook (optional): A callback function executed each frame with x, y, z and objName parameters
// representing the intersected object from the FPS camera. If there is no intersected object
// the objName is set to null. Default value is noop.
// onShoot (optional): A callback function executed with x, y, z and objName parameters representing the intersected
// object from the FPS camera while the mouse is down for Desktop devices. For mobile devices due to lack of mouse device
// this function is executed when the camera is looking at one of the shootable objects defined with the shootableObjects
// parameter in order to help implementing the auto-shoot functionality. Default value is noop.
// onStoppedShooting (optional): A callback function executed without any parameter when the mouse is not down
// for the first time after it was down.
// shootableObjects (optional): An array of objects representing the objects that can be shot. This parameter is
// used inside the onShoot event for mobile devices in order to decide if the object being looked at should
// trigger the onShoot function or not. Default value is an empty array.
// onPause (optional): A callback function to be executed when the FPS controls are paused on mobile devices
// due to switching to Portrait orientation. Default value is noop.
// onResume (optional): A callback function to be executed on mobile devices when the FPS controls are resumed
// after switching back to the Landscape orientation. Default value is noop.
// requestFullScreen (optional): If true the FullScreen mode is requested if the screen is not on full screen. FPS Controls
// API also automatically re-requests the FullScreen mode every time after the user cancels the FullScreen. Default value
// is true.
Roygbiv.prototype.createFPSControl = function(parameters){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createFPSControl, preConditions.parameters, parameters);
  preConditions.checkIfDefined(ROYGBIV.createFPSControl, preConditions.playerBodyObject, parameters.playerBodyObject);
  preConditions.checkIfAddedObject(ROYGBIV.createFPSControl, preConditions.playerBodyObject, parameters.playerBodyObject);
  preConditions.checkIfSphere(ROYGBIV.createFPSControl, preConditions.playerBodyObject, parameters.playerBodyObject);
  preConditions.checkIfDynamic(ROYGBIV.createFPSControl, preConditions.playerBodyObject, parameters.playerBodyObject);
  preConditions.checkIfChangeable(ROYGBIV.createFPSControl, preConditions.playerBodyObject, parameters.playerBodyObject);
  preConditions.checkIfTrue(ROYGBIV.createFPSControl, "Player body object must be unintersectable", parameters.playerBodyObject.isIntersectable);
  preConditions.checkIfDefined(ROYGBIV.createFPSControl, preConditions.initialPosition, parameters.initialPosition);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createFPSControl, preConditions.initialPosition, parameters.initialPosition);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.mouseSpeed, parameters.mouseSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.touchLookSpeed, parameters.touchLookSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.speed, parameters.speed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.jumpSpeed, parameters.jumpSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.touchJoystickThreshold, parameters.touchJoystickThreshold);
  preConditions.checkIfTrueOnlyIfYExists(ROYGBIV.createFPSControl, "No such crosshair.", parameters.crosshairName, !crosshairs[parameters.crosshairName]);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.crosshairExpandSize, parameters.crosshairExpandSize);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.crosshairAnimationDelta, parameters.crosshairAnimationDelta);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createFPSControl, preConditions.hasDoubleJump, parameters.hasDoubleJump);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.doubleJumpTimeThresholdInMs, parameters.doubleJumpTimeThresholdInMs);
  preConditions.checkIfAddedObjectOrObjectGroupOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponObject1, parameters.weaponObject1);
  preConditions.checkIfFPSWeaponOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponObject1, parameters.weaponObject1);
  preConditions.checkIfAddedObjectOrObjectGroupOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponObject2, parameters.weaponObject2);
  preConditions.checkIfFPSWeaponOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponObject2, parameters.weaponObject2);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createFPSControl, preConditions.hasIdleGunAnimation, parameters.hasIdleGunAnimation);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createFPSControl, preConditions.idleGunAnimationSpeed, parameters.idleGunAnimationSpeed);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponRotationRandomnessOn, parameters.weaponRotationRandomnessOn);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createFPSControl, preConditions.onLook, parameters.onLook);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createFPSControl, preConditions.onShoot, parameters.onShoot);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createFPSControl, preConditions.onStoppedShooting, parameters.onStoppedShooting);
  preConditions.checkIfArrayOnlyIfExists(ROYGBIV.createFPSControl, preConditions.shootableObjects, parameters.shootableObjects);
  preConditions.checkIfArrayOfObjectsOnlyIfExists(ROYGBIV.createFPSControl, preConditions.shootableObjects, parameters.shootableObjects);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createFPSControl, preConditions.onPause, parameters.onPause);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createFPSControl, preConditions.onResume, parameters.onResume);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createFPSControl, preConditions.requestFullScreen, parameters.requestFullScreen);
  preConditions.checkIfTrueOnlyIfYAndZExists(ROYGBIV.createFPSControl, "Weapon objects are the same.", parameters.weaponObject1, parameters.weaponObject2, (parameters.weaponObject1 == parameters.weaponObject2));
  preConditions.checkIfAlreadyUsedAsFPSWeaponOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponObject1, parameters.weaponObject1);
  preConditions.checkIfAlreadyUsedAsFPSWeaponOnlyIfExists(ROYGBIV.createFPSControl, preConditions.weaponObject2, parameters.weaponObject2);
  preConditions.checkIfTrue(ROYGBIV.createFPSControl, "Player body object cannot have set colllision listener.", collisionCallbackRequests.has(parameters.playerBodyObject.name));
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.createFPSControl, parameters.playerBodyObject);
  preConditions.checkIfObjectInsideActiveSceneOnlyIfExists(ROYGBIV.createFPSControl, parameters.weaponObject1);
  preConditions.checkIfObjectInsideActiveSceneOnlyIfExists(ROYGBIV.createFPSControl, parameters.weaponObject2);
  preConditions.checkIfCrosshairInsideActiveSceneOnlyIfNameExists(ROYGBIV.createFPSControl, parameters.crosshairName);
  return new FPSControls(parameters);
}

// Creates a new OrbitControl object. Using the OrbitControl, camera can orbit
// around a specified point by looking at it on each frame. Camera can move freely
// around the surface of an imaginary sphere. Controls are:
// For desktop:
// Mouse wheel/Mouse drag: Rotate
// Right/Left/D/A/Q: Rotate
// Up/Down/W/S/Z: Zoom in/out
// Space: Zoom in/out
// For mobile:
// Finger pinch zoom: Zoom in/out
// Finger touch: Rotate
// Configurations are:
// lookPosition (optional): A vector defining the look position and the center of the imaginary sphere. Default value is (0, 0, 0).
// maxRadius (optional): The maximum radius of the imaginary sphere that the camera can zoom out to. Default
// value is 150.
// minRadius (optional): The minimum radius of the imaginary sphere that the camera can zoom in to. Default
// value is 50.
// zoomDelta (optional): The difference of radius when the user performs a zoom in/out. Default value is 1.
// mouseWheelRotationSpeed (optional): The speed of mouse wheel rotation. Default value is 3.
// mouseDragRotationSpeed (optional): The speed of mouse drag rotation. Default value is 20.
// fingerSwipeRotationSpeed (optional): The speed of finger touch rotation for mobile devices. Default value is 20.
// keyboardRotationSpeed (optional): The speed of rotation using keyboard events. Default value is 10.
// requestFullScreen (optional): If true the FullScreen mode is requested if the screen is not on full screen. Orbit Controls
// API also automatically re-requests the FullScreen mode every time after the user cancels the FullScreen. Default value
// is false.
Roygbiv.prototype.createOrbitControl = function(parameters){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createOrbitControl, preConditions.parameters, parameters);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createOrbitControl, preConditions.lookPosition, parameters.lookPosition);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.maxRadius, parameters.maxRadius);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.minRadius, parameters.minRadius);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.zoomDelta, parameters.zoomDelta);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.mouseWheelRotationSpeed, parameters.mouseWheelRotationSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.mouseDragRotationSpeed, parameters.mouseDragRotationSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.fingerSwipeRotationSpeed, parameters.fingerSwipeRotationSpeed);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.keyboardRotationSpeed, parameters.keyboardRotationSpeed);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createOrbitControl, preConditions.requestFullScreen, parameters.requestFullScreen);
  return new OrbitControls(parameters);
}

// ANIMATION FUNCTIONS *********************************************************

// Starts an animation of given object, object group, text or sprite.
Roygbiv.prototype.startAnimation = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startAnimation, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.startAnimation, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.startAnimation, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.startAnimation, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.startAnimation, object);
  var animation = object.animations[animationName];
  animationHandler.forceFinish(animation);
  animationHandler.startAnimation(animation);
}

// Stops an animation of given object, object group or text.
Roygbiv.prototype.stopAnimation = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopAnimation, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.stopAnimation, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.stopAnimation, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.stopAnimation, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.stopAnimation, object);
  var animation = object.animations[animationName];
  animationHandler.forceFinish(animation);
}

// Makes an animation freeze on finish. This can be used for certain weapon
// animations where the weapon starts shooting after going to a certain position/rotation.
// Use unfreezeAnimation API to undo this. Note that this function should be used
// after starting an animation.
Roygbiv.prototype.freezeAnimationOnFinish = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.freezeAnimationOnFinish, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.freezeAnimationOnFinish, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.freezeAnimationOnFinish, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.freezeAnimationOnFinish, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.freezeAnimationOnFinish, object);
  var animation = object.animations[animationName];
  animationHandler.freezeOnFinish(animation);
}

// Unfreezes an animation started with freezeOnFinish parameter set to true.
Roygbiv.prototype.unfreezeAnimation = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.unfreezeAnimation, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.unfreezeAnimation, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.unfreezeAnimation, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.unfreezeAnimation, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.unfreezeAnimation, object);
  var animation = object.animations[animationName];
  animationHandler.unfreeze(animation);
}

// Sets the state of an animation to ANIMATION_STATE_RUNNING for animations
// that are in ANIMATION_STATE_REWINDING state.
Roygbiv.prototype.cancelAnimationRewind = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.cancelAnimationRewind, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.cancelAnimationRewind, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.cancelAnimationRewind, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.cancelAnimationRewind, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.cancelAnimationRewind, object);
  animationHandler.cancelRewind(object.animations[animationName]);
}

// Sets the state of an animation to ANIMATION_STATE_REWINDING for animations
// that are in ANIMATION_STATE_RUNNING state. For animations in ANIMATION_STATE_FROZEN
// state, use unfreezeAnimation API instead of this.
Roygbiv.prototype.rewindAnimation = function(object, animationName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rewindAnimation, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.rewindAnimation, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.rewindAnimation, preConditions.animationName, animationName);
  preConditions.checkIfAnimationExists(ROYGBIV.rewindAnimation, object, animationName);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.rewindAnimation, object);
  animationHandler.forceRewind(object.animations[animationName]);
}

// Starts all animations of given object, object group, text or sprite.
Roygbiv.prototype.startAllAnimations = function(object) {
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startAllAnimations, preConditions.object, object);
  preConditions.checkIfAddedObjectObjectGroupAddedTextSprite(ROYGBIV.startAllAnimations, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.startAllAnimations, object);
  animationHandler.startAllAnimations(object);
}

// MUZZLEFLASH FUNCTIONS *******************************************************

// Shows a muzzle flash. This function may be called each time a FPS weapon
// is shooting. The optional animationTimeInMS parameter can be used to
// start the muzzle flash with a scale animation. This can be useful for
// flame-like muzzle flashes.
Roygbiv.prototype.showMuzzleFlash = function(muzzleflashName, animationTimeInMS){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showMuzzleFlash, preConditions.muzzleflashName, muzzleflashName);
  var muzzleFlash = muzzleFlashes[muzzleflashName];
  preConditions.checkIfMuzzleFlashExists(ROYGBIV.showMuzzleFlash, muzzleFlash);
  preConditions.checkIfMuzzleFlashAttached(ROYGBIV.showMuzzleFlash, muzzleFlash);
  preConditions.checkIfMuzzleFlashActivated(ROYGBIV.showMuzzleFlash, muzzleFlash);
  preConditions.checkIfMuzzleFlashInsideActiveScene(ROYGBIV.showMuzzleFlash, muzzleFlash);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.showMuzzleFlash, preConditions.animationTimeInMS, animationTimeInMS);
  muzzleFlash.onShow(animationTimeInMS);
}

// Hides a muzzle flash. This function may be called inside onStoppedShooting callback
// of a FPS control. The optional animationTimeInMS parameter can be used to
// hide the muzzle flash with a scale animation. This can be useful for
// flame-like muzzle flashes.
Roygbiv.prototype.hideMuzzleFlash = function(muzzleflashName, animationTimeInMS){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideMuzzleFlash, preConditions.muzzleflashName, muzzleflashName);
  var muzzleFlash = muzzleFlashes[muzzleflashName];
  preConditions.checkIfMuzzleFlashExists(ROYGBIV.hideMuzzleFlash, muzzleFlash);
  preConditions.checkIfMuzzleFlashAttached(ROYGBIV.hideMuzzleFlash, muzzleFlash);
  preConditions.checkIfMuzzleFlashActivated(ROYGBIV.hideMuzzleFlash, muzzleFlash);
  preConditions.checkIfMuzzleFlashInsideActiveScene(ROYGBIV.hideMuzzleFlash, muzzleFlash);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.hideMuzzleFlash, preConditions.animationTimeInMS, animationTimeInMS);
  muzzleFlash.onHide(animationTimeInMS);
}

// LIGHTING FUNCTIONS **********************************************************

// Updates the strength of a dynamic light.
Roygbiv.prototype.updateLightStrength = function(light, newStrength){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.updateLightStrength, preConditions.light, light);
  preConditions.checkIfDefined(ROYGBIV.updateLightStrength, preConditions.newStrength, newStrength);
  preConditions.checkIfNumber(ROYGBIV.updateLightStrength, preConditions.newStrength, newStrength);
  preConditions.checkIfDynamicLight(ROYGBIV.updateLightStrength, light);
  preConditions.checkIfLightInActiveScene(ROYGBIV.updateLightStrength, light);
  preConditions.checkIfLightSuitableForStrengthUpdate(ROYGBIV.updateLightStrength, light);
  light.dynamicInfo.strength = newStrength;
  lightHandler.updateDynamicLight(light);
}

// Updates the color of a dynamic light.
Roygbiv.prototype.updateLightColor = function(light, newR, newG, newB){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.updateLightColor, preConditions.light, light);
  preConditions.checkIfDefined(ROYGBIV.updateLightColor, preConditions.newR, newR);
  preConditions.checkIfDefined(ROYGBIV.updateLightColor, preConditions.newG, newG);
  preConditions.checkIfDefined(ROYGBIV.updateLightColor, preConditions.newB, newB);
  preConditions.checkIfNumber(ROYGBIV.updateLightColor, preConditions.newR, newR);
  preConditions.checkIfNumber(ROYGBIV.updateLightColor, preConditions.newG, newG);
  preConditions.checkIfNumber(ROYGBIV.updateLightColor, preConditions.newB, newB);
  preConditions.checkIfDynamicLight(ROYGBIV.updateLightColor, light);
  preConditions.checkIfLightInActiveScene(ROYGBIV.updateLightColor, light);
  preConditions.checkIfLightSuitableForColorUpdate(ROYGBIV.updateLightColor, light);
  light.dynamicInfo.colorR = newR;
  light.dynamicInfo.colorG = newG;
  light.dynamicInfo.colorB = newB;
  lightHandler.updateDynamicLight(light);
}

// Updates the direction of a dynamic light.
Roygbiv.prototype.updateLightDirection = function(light, newDirX, newDirY, newDirZ){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.updateLightDirection, preConditions.light, light);
  preConditions.checkIfDefined(ROYGBIV.updateLightDirection, preConditions.newDirX, newDirX);
  preConditions.checkIfDefined(ROYGBIV.updateLightDirection, preConditions.newDirY, newDirY);
  preConditions.checkIfDefined(ROYGBIV.updateLightDirection, preConditions.newDirZ, newDirZ);
  preConditions.checkIfNumber(ROYGBIV.updateLightDirection, preConditions.newDirX, newDirX);
  preConditions.checkIfNumber(ROYGBIV.updateLightDirection, preConditions.newDirY, newDirY);
  preConditions.checkIfNumber(ROYGBIV.updateLightDirection, preConditions.newDirZ, newDirZ);
  preConditions.checkIfDynamicLight(ROYGBIV.updateLightDirection, light);
  preConditions.checkIfLightInActiveScene(ROYGBIV.updateLightDirection, light);
  preConditions.checkIfLightSuitableForDirectionUpdate(ROYGBIV.updateLightDirection, light);
  light.dynamicInfo.dirX = newDirX;
  light.dynamicInfo.dirY = newDirY;
  light.dynamicInfo.dirZ = newDirZ;
  lightHandler.updateDynamicLight(light);
}

// Updates the position of a dynamic light.
Roygbiv.prototype.updateLightPosition = function(light, newPosX, newPosY, newPosZ){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.updateLightPosition, preConditions.light, light);
  preConditions.checkIfDefined(ROYGBIV.updateLightPosition, preConditions.newPosX, newPosX);
  preConditions.checkIfDefined(ROYGBIV.updateLightPosition, preConditions.newPosY, newPosY);
  preConditions.checkIfDefined(ROYGBIV.updateLightPosition, preConditions.newPosZ, newPosZ);
  preConditions.checkIfNumber(ROYGBIV.updateLightPosition, preConditions.newPosX, newPosX);
  preConditions.checkIfNumber(ROYGBIV.updateLightPosition, preConditions.newPosY, newPosY);
  preConditions.checkIfNumber(ROYGBIV.updateLightPosition, preConditions.newPosZ, newPosZ);
  preConditions.checkIfDynamicLight(ROYGBIV.updateLightPosition, light);
  preConditions.checkIfLightInActiveScene(ROYGBIV.updateLightPosition, light);
  preConditions.checkIfLightSuitableForPositionUpdate(ROYGBIV.updateLightPosition, light);
  light.dynamicInfo.positionX = newPosX;
  light.dynamicInfo.positionY = newPosY;
  light.dynamicInfo.positionZ = newPosZ;
  lightHandler.updateDynamicLight(light);
}

// Places a point light into the position of given object each frame.
Roygbiv.prototype.attachPointLightToObject = function(object, light){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.attachPointLightToObject, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.attachPointLightToObject, preConditions.light, light);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.attachPointLightToObject, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.attachPointLightToObject, object);
  preConditions.checkIfObjectMoveable(ROYGBIV.attachPointLightToObject, object);
  preConditions.checkIfDynamicLight(ROYGBIV.attachPointLightToObject, light);
  preConditions.checkIfLightInActiveScene(ROYGBIV.attachPointLightToObject, light);
  preConditions.checkIfLightSuitableForPositionUpdate(ROYGBIV.attachPointLightToObject, light);

  lightHandler.attachLightToObject(light, object);
}

// LIGHTNING FUNCTIONS *********************************************************

// Starts a lightning. Does nothing if the lightning is already started.
Roygbiv.prototype.startLightning = function(lightning){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startLightning, preConditions.lightning, lightning);
  preConditions.checkIfLightning(ROYGBIV.startLightning, lightning);
  preConditions.checkIfLightningInsideActiveScene(ROYGBIV.startLightning, lightning);
  preConditions.checkIfLightningStartable(ROYGBIV.startLightning, lightning);
  lightning.start();
}

// Sets the start point of a lightning.
Roygbiv.prototype.setLightningStartPoint = function(lightning, position){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setLightningStartPoint, preConditions.lightning, lightning);
  preConditions.checkIfDefined(ROYGBIV.setLightningStartPoint, preConditions.position, position);
  preConditions.checkIfLightning(ROYGBIV.setLightningStartPoint, lightning);
  preConditions.checkIfLightningInsideActiveScene(ROYGBIV.setLightningStartPoint, lightning);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setLightningStartPoint, preConditions.position, position);
  preConditions.checkIfTrue(ROYGBIV.setLightningStartPoint, "Lightning is attached to a FPS weapon, cannot set start point.", lightning.attachedToFPSWeapon);
  lightning.startPoint.set(position.x, position.y, position.z);
}

// Sets the end point of a lightning.
Roygbiv.prototype.setLightningEndPoint = function(lightning, position){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setLightningEndPoint, preConditions.lightning, lightning);
  preConditions.checkIfDefined(ROYGBIV.setLightningEndPoint, preConditions.position, position);
  preConditions.checkIfLightning(ROYGBIV.setLightningEndPoint, lightning);
  preConditions.checkIfLightningInsideActiveScene(ROYGBIV.setLightningEndPoint, lightning);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setLightningEndPoint, preConditions.position, position);
  lightning.endPoint.set(position.x, position.y, position.z);
}

// Stops a lightning. Does nothing if the lightning is already stopped.
Roygbiv.prototype.stopLightning = function(lightning){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopLightning, preConditions.lightning, lightning);
  preConditions.checkIfLightning(ROYGBIV.stopLightning, lightning);
  preConditions.checkIfLightningInsideActiveScene(ROYGBIV.stopLightning, lightning);
  lightning.stop();
}

// SPRITE FUNCTIONS ************************************************************

// Returns if two sprites are intersected.
Roygbiv.prototype.areSpritesIntersected = function(sprite1, sprite2){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.areSpritesIntersected, preConditions.sprite1, sprite1);
  preConditions.checkIfDefined(ROYGBIV.areSpritesIntersected, preConditions.sprite2, sprite2);
  preConditions.checkIfSprite(ROYGBIV.areSpritesIntersected, preConditions.sprite1, sprite1);
  preConditions.checkIfSprite(ROYGBIV.areSpritesIntersected, preConditions.sprite2, sprite2);
  return sprite1.intersectionTest(sprite2);
}

// Sets the color of a sprite.
Roygbiv.prototype.setSpriteColor = function(sprite, colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSpriteColor, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.setSpriteColor, preConditions.sprite, sprite);
  preConditions.checkIfDefined(ROYGBIV.setSpriteColor, preConditions.colorName, colorName);
  preConditions.checkIfString(ROYGBIV.setSpriteColor, preConditions.colorName, colorName);
  sprite.setColor(colorName);
}

// Sets the alpha of a sprite.
Roygbiv.prototype.setSpriteAlpha = function(sprite, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSpriteAlpha, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.setSpriteAlpha, preConditions.sprite, sprite);
  preConditions.checkIfDefined(ROYGBIV.setSpriteAlpha, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.setSpriteAlpha, preConditions.alpha, alpha);
  sprite.setAlpha(alpha);
}

// Hides a sprite. Does nothing if the sprite is already hidden.
Roygbiv.prototype.hideSprite = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideSprite, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.hideSprite, preConditions.sprite, sprite);
  sprite.hide();
}

// Shows a sprite. Does nothing if the sprite is already visible.
Roygbiv.prototype.showSprite = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showSprite, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.showSprite, preConditions.sprite, sprite);
  sprite.show();
}

// Sets the margin of a sprite.
Roygbiv.prototype.setSpriteMargin = function(sprite, marginPercentX, marginPercentY){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSpriteMargin, preConditions.sprite, sprite);
  preConditions.checkIfDefined(ROYGBIV.setSpriteMargin, preConditions.marginPercentX, marginPercentX);
  preConditions.checkIfDefined(ROYGBIV.setSpriteMargin, preConditions.marginPercentY, marginPercentY);
  preConditions.checkIfSprite(ROYGBIV.setSpriteMargin, preConditions.sprite, sprite);
  preConditions.checkIfNumber(ROYGBIV.setSpriteMargin, preConditions.marginPercentX, marginPercentX);
  preConditions.checkIfNumber(ROYGBIV.setSpriteMargin, preConditions.marginPercentY, marginPercentY);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.setSpriteMargin, sprite);
  preConditions.checkIfSpriteContained(ROYGBIV.setSpriteMargin, sprite);
  sprite.set2DCoordinates(marginPercentX, marginPercentY);
}

// Sets the rotation of a sprite. Angle is expected to be between [0, 360].
Roygbiv.prototype.setSpriteRotationAngle = function(sprite, angle){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSpriteRotationAngle, preConditions.sprite, sprite);
  preConditions.checkIfDefined(ROYGBIV.setSpriteRotationAngle, preConditions.angle, angle);
  preConditions.checkIfSprite(ROYGBIV.setSpriteRotationAngle, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.setSpriteRotationAngle, sprite);
  preConditions.checkIfNumber(ROYGBIV.setSpriteRotationAngle, preConditions.angle, angle);
  preConditions.checkIfSpriteContained(ROYGBIV.setSpriteRotationAngle, sprite);
  sprite.setRotation(angle);
}

// Enables dragging for draggable sprites. Dragging is initially enabled
// for draggable sprites.
Roygbiv.prototype.enableSpriteDragging = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.enableSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.enableSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSpriteDraggable(ROYGBIV.enableSpriteDragging, sprite);
  sprite.draggingDisabled = false;
}

// Disables dragging for draggable sprites. Dragging is initially enabled
// for draggable sprites.
Roygbiv.prototype.disableSpriteDragging = function(sprite){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.disableSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSprite(ROYGBIV.disableSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSpriteDraggable(ROYGBIV.disableSpriteDragging, sprite);
  sprite.draggingDisabled = true;
}

// Maps a texture pack to given sprite. The texturePackOrName parameter
// can be the name of a tetxure pack or the texture pack itself if loaded
// with loadDynamicTextures API.
Roygbiv.prototype.mapTextureToSprite = function(sprite, texturePackOrName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.mapTextureToSprite, preConditions.sprite, sprite);
  preConditions.checkIfDefined(ROYGBIV.mapTextureToSprite, preConditions.texturePackOrName, texturePackOrName);
  preConditions.checkIfSprite(ROYGBIV.disableSpriteDragging, preConditions.sprite, sprite);
  preConditions.checkIfSpriteInsideActiveScene(ROYGBIV.disableSpriteDragging, sprite);
  if (texturePackOrName.isTexturePack){
    sprite.mapTexture(texturePackOrName);
  }else{
    preConditions.checkIfTexturePackExists(ROYGBIV.disableSpriteDragging, texturePackOrName);
    sprite.mapTexture(texturePacks[texturePackOrName]);
  }
}

// CONTAINER FUNCTIONS *********************************************************

// Hides the border of a container.
Roygbiv.prototype.hideContainerBorder = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideContainerBorder, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.hideContainerBorder, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.hideContainerBorder, container);
  preConditions.checkIfContainerHasBorder(ROYGBIV.hideContainerBorder, container);
  container.rectangle.mesh.visible = false;
}

// Shows the border of a container.
Roygbiv.prototype.showContainerBorder = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showContainerBorder, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.showContainerBorder, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.showContainerBorder, container);
  preConditions.checkIfContainerHasBorder(ROYGBIV.showContainerBorder, container);
  container.rectangle.mesh.visible = true;
}

// Sets the border color of a container.
Roygbiv.prototype.setContainerBorderColor = function(container, colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setContainerBorderColor, preConditions.container, container);
  preConditions.checkIfDefined(ROYGBIV.setContainerBorderColor, preConditions.colorName, colorName);
  preConditions.checkIfContainer(ROYGBIV.setContainerBorderColor, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.setContainerBorderColor, container);
  preConditions.checkIfContainerHasBorder(ROYGBIV.setContainerBorderColor, container);
  container.rectangle.mesh.material.uniforms.color.value.set(colorName);
}

// Sets the background color of a container.
Roygbiv.prototype.setContainerBackgroundColor = function(container, colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setContainerBackgroundColor, preConditions.container, container);
  preConditions.checkIfDefined(ROYGBIV.setContainerBackgroundColor, preConditions.colorName, colorName);
  preConditions.checkIfContainer(ROYGBIV.setContainerBackgroundColor, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.setContainerBackgroundColor, container);
  preConditions.checkIfContainerHasBackground(ROYGBIV.setContainerBackgroundColor, container);
  container.backgroundSprite.setColor(colorName);
}

// Sets the alpha value of the background of a container.
Roygbiv.prototype.setContainerBackgroundAlpha = function(container, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setContainerBackgroundAlpha, preConditions.container, container);
  preConditions.checkIfDefined(ROYGBIV.setContainerBackgroundAlpha, preConditions.colorName, alpha);
  preConditions.checkIfContainer(ROYGBIV.setContainerBackgroundAlpha, container);
  preConditions.checkIfNumber(ROYGBIV.setContainerBackgroundAlpha, preConditions.alpha, alpha);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.setContainerBackgroundAlpha, container);
  preConditions.checkIfContainerHasBackground(ROYGBIV.setContainerBackgroundAlpha, container);
  container.backgroundSprite.setAlpha(alpha);
}

// Hides the background of a container.
Roygbiv.prototype.hideContainerBackground = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideContainerBackground, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.hideContainerBackground, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.hideContainerBackground, container);
  preConditions.checkIfContainerHasBackground(ROYGBIV.hideContainerBackground, container);
  container.backgroundSprite.mesh.visible = false;
}

// Shows the background of a container.
Roygbiv.prototype.showContainerBackground = function(container){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showContainerBackground, preConditions.container, container);
  preConditions.checkIfContainer(ROYGBIV.showContainerBackground, container);
  preConditions.checkIfContainerInsideActiveScene(ROYGBIV.showContainerBackground, container);
  preConditions.checkIfContainerHasBackground(ROYGBIV.showContainerBackground, container);
  container.backgroundSprite.mesh.visible = true;
}

// VIRTUAL KEYBOARD FUNCTIONS **************************************************

// Activates a virtual keyboard.
Roygbiv.prototype.activateVirtualKeyboard = function(virtualKeyboard){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.activateVirtualKeyboard, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.activateVirtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboardInsideActiveScene(ROYGBIV.activateVirtualKeyboard, virtualKeyboard);
  virtualKeyboard.activate();
}

// Hides a virtual keyboard. Does nothing if the virtual keyboard if already hidden.
Roygbiv.prototype.hideVirtualKeyboard = function(virtualKeyboard){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideVirtualKeyboard, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.hideVirtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboardInsideActiveScene(ROYGBIV.hideVirtualKeyboard, virtualKeyboard);
  if (virtualKeyboard.isHidden){
    return;
  }
  virtualKeyboard.hideVisually();
}

// Shows a virtual keyboard. Does nothing if the virtual keyboard is already visible.
Roygbiv.prototype.showVirtualKeyboard = function(virtualKeyboard){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showVirtualKeyboard, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.showVirtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboardInsideActiveScene(ROYGBIV.showVirtualKeyboard, virtualKeyboard);
  if (!virtualKeyboard.isHidden){
    return;
  }
  virtualKeyboard.showVisually();
}

// Deactivates a virtual keyboard. Does nothing if the virtual keyboard is already
// not active.
Roygbiv.prototype.deactivateVirtualKeyboard = function(virtualKeyboard){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.deactivateVirtualKeyboard, preConditions.virtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboard(ROYGBIV.deactivateVirtualKeyboard, virtualKeyboard);
  preConditions.checkIfVirtualKeyboardInsideActiveScene(ROYGBIV.deactivateVirtualKeyboard, virtualKeyboard);
  virtualKeyboard.deactivate();
}

// Cancels sprite dragging if there is an active sprite dragging.
Roygbiv.prototype.cancelSpriteDrag = function(){
  if (mode == 0){
    return;
  }
  if (draggingSprite){
    draggingSprite.onDragStopped();
    draggingSprite = false;
  }
  dragCandidate = false;
}

// NETWORKING FUNCTIONS ********************************************************

// Connects to a game server, the URL of which is set by setWSServerURL CLI
// command. The server and the client interacts through Rhubarb protocol
// definition files, the path of which is set by setProtocolDefinition CLI
// command. onReady callback parameter is executed when the connection is
// established. onError is executed with errorReason parameter in case
// there is an error establishing the connection.
Roygbiv.prototype.connectToServer = function(onReady, onError){
  if (mode == 0){
    return;
  }
  preConditions.checkMultiplayerContext(ROYGBIV.connectToServer);
  preConditions.checkIfDefined(ROYGBIV.connectToServer, preConditions.onReady, onReady);
  preConditions.checkIfDefined(ROYGBIV.connectToServer, preConditions.onError, onError);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.connectToServer, preConditions.onReady, onReady);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.connectToServer, preConditions.onError, onError);
  Rhubarb.init({
    protocolDefinitionPath: "/protocol_definitions/" + protocolDefinitionFileName,
    workerPath: (isDeployment? "./js/worker/RhubarbWorker.min.js": "/js/third_party/RhubarbWorker.min.js"),
    serverAddress: serverWSURL,
    onReady: onReady,
    onError: onError
  });
}

// Disconnects from server and clears Rhubarb context.
// Does nothing if not connected to server.
Roygbiv.prototype.clearServerConnection = function(){
  if (mode == 0){
    return;
  }
  try{
    Rhubarb.destroy();
  }catch(err){}
}

// Sets a listener for server connection status. The callbackFunction
// is executed when the connection between the server and the client is lost.
// If client needs to try reconnecting, ROYGBIV.clearServerConnection API needs
// to be used before ROYGBIV.connectFromServer.
Roygbiv.prototype.onDisconnectedFromServer = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onDisconnectedFromServer, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onDisconnectedFromServer, preConditions.callbackFunction, callbackFunction);
  Rhubarb.onDisconnectedFromServer(callbackFunction);
}

// Sends a message from the server. protocolName is the protocol name defined
// in protocol definition file. valuesByParameterName is an object containing
// values to be send by protocol parameter names. Read
// https://github.com/oguzeroglu/Rhubarb/wiki/API-reference#send for more info.
Roygbiv.prototype.sendToServer = function(protocolName, valuesByParameterName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.sendToServer, preConditions.protocolName, protocolName);
  preConditions.checkIfDefined(ROYGBIV.sendToServer, preConditions.valuesByParameterName, valuesByParameterName);
  Rhubarb.send(protocolName, valuesByParameterName);
}

// Listens to server for given protocol and executes callbackFunction when a message
// received. The callbackFunction is executed with getter parameter. getter is a function
// which expects a protocol parameter name as input and returns received value
// for that parameter. Read https://github.com/oguzeroglu/Rhubarb/wiki/API-reference#onReceived
// for more info.
Roygbiv.prototype.onReceivedFromServer = function(protocolName, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onReceivedFromServer, preConditions.protocolName, protocolName);
  preConditions.checkIfDefined(ROYGBIV.onReceivedFromServer, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onReceivedFromServer, preConditions.callbackFunction, callbackFunction);
  Rhubarb.onReceived(protocolName, callbackFunction);
}

// Listens for latency between the server and the client. The callbackFunction is
// executed with newLatency (in ms) parameter when the latency is updated.
Roygbiv.prototype.onLatencyUpdated = function(callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.onLatencyUpdated, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.onLatencyUpdated, preConditions.callbackFunction, callbackFunction);
  Rhubarb.onLatencyUpdated(callbackFunction);
}

// AI FUNCTIONS ****************************************************************

// Sets the steering behavior of given object.
Roygbiv.prototype.setSteeringBehavior = function(object, behaviorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSteeringBehavior, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setSteeringBehavior, preConditions.behaviorName, behaviorName);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setSteeringBehavior, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setSteeringBehavior, object);
  preConditions.checkIfString(ROYGBIV.setSteeringBehavior, preConditions.behaviorName, behaviorName);
  preConditions.checkIfSteerable(ROYGBIV.setSteeringBehavior, object);
  preConditions.checkIfObjectHasBehavior(ROYGBIV.setSteeringBehavior, object, behaviorName);

  steeringHandler.setBehavior(object, behaviorName);
}

// Stops a steerable.
Roygbiv.prototype.stopSteerable = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSteeringBehavior, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setSteeringBehavior, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setSteeringBehavior, object);
  preConditions.checkIfSteerable(ROYGBIV.setSteeringBehavior, object);

  steeringHandler.stopSteerable(object);
}

// Sets a target position of a steerable. Target position is consumed by these
// steering behaviors:
// * Seek
// * Flee
// * Arrive
Roygbiv.prototype.setSteerableTargetPosition = function(object, positionVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSteerableTargetPosition, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setSteerableTargetPosition, preConditions.positionVector, positionVector);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setSteerableTargetPosition, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setSteerableTargetPosition, object);
  preConditions.checkIfSteerable(ROYGBIV.setSteerableTargetPosition, object);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setSteerableTargetPosition, preConditions.positionVector, positionVector);
  preConditions.checkIfObjectIsJumping(ROYGBIV.setSteerableTargetPosition, object);

  steeringHandler.setTargetPosition(object, positionVector);
}

// Unsets a target position of a steerable set via setSteerableTargetPosition API.
Roygbiv.prototype.unsetSteerableTargetPosition = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.unsetSteerableTargetPosition, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.unsetSteerableTargetPosition, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.unsetSteerableTargetPosition, object);
  preConditions.checkIfSteerable(ROYGBIV.unsetSteerableTargetPosition, object);
  preConditions.checkIfObjectIsJumping(ROYGBIV.unsetSteerableTargetPosition, object);

  steeringHandler.unsetTargetPosition(object);
}

// Makes a steerable gradually look at given target position.
Roygbiv.prototype.setSteerableLookTarget = function(object, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSteerableLookTarget, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setSteerableLookTarget, preConditions.targetVector, targetVector);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setSteerableLookTarget, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setSteerableLookTarget, object);
  preConditions.checkIfSteerable(ROYGBIV.setSteerableLookTarget, object);
  preConditions.checkIfSteerableIsBeingUpdated(ROYGBIV.setSteerableLookTarget, object);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setSteerableLookTarget, preConditions.targetVector, targetVector);

  steeringHandler.setLookTarget(object, targetVector);
}

// Calculates the shortest path between given points. This API returns nothing
// as it automatically pipes the resulting path to the PathFollowingBehavior, if
// the behavior is constructed with given AStar object. So use this API together
// with the PathFollowingBehavior. If there's no nearby graph vertex of given
// vectors, this API does not calculate any path. In that case increasing the world
// bin size might help.
Roygbiv.prototype.findShortestPath = function(aStar, fromVector, toVector){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.findShortestPath, preConditions.aStar, aStar);
  preConditions.checkIfDefined(ROYGBIV.findShortestPath, preConditions.fromVector, fromVector);
  preConditions.checkIfDefined(ROYGBIV.findShortestPath, preConditions.toVector, toVector);
  preConditions.checkIfAStar(ROYGBIV.findShortestPath, aStar);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.findShortestPath, preConditions.fromVector, fromVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.findShortestPath, preConditions.toVector, toVector);

  steeringHandler.calculateShortestPath(aStar, fromVector, toVector);
}

// Makes a steerable represented as hidingObject hide from another steerable
// represented as targetObject. This API should be used with HideBehavior.
Roygbiv.prototype.hideFrom = function(hidingObject, targetObject){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.hideFrom, preConditions.hidingObject, hidingObject);
  preConditions.checkIfDefined(ROYGBIV.hideFrom, preConditions.targetObject, targetObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.hideFrom, preConditions.hidingObject, hidingObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.hideFrom, preConditions.targetObject, targetObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.hideFrom, hidingObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.hideFrom, targetObject);
  preConditions.checkIfSteerable(ROYGBIV.hideFrom, hidingObject);
  preConditions.checkIfSteerable(ROYGBIV.hideFrom, targetObject);
  preConditions.checkIfObjectIsJumping(ROYGBIV.hideFrom, hidingObject);

  steeringHandler.makeSteerableHideFromSteerable(hidingObject, targetObject);
}

// Makes a steerable stop hiding from other entities. It makes sense to use this
// API with HideBehavior, after using hideFrom API.
Roygbiv.prototype.stopHiding = function(hidingObject){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.stopHiding, preConditions.hidingObject, hidingObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.stopHiding, preConditions.hidingObject, hidingObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.stopHiding, hidingObject);
  preConditions.checkIfSteerable(ROYGBIV.stopHiding, hidingObject);
  preConditions.checkIfObjectIsJumping(ROYGBIV.stopHiding, hidingObject);

  steeringHandler.makeSteerableStopHiding(hidingObject);
}

// Makes a steerable represented by pursuingObject chase another steerable
// represented by targetObject. This API should be used with PursueBehavior.
Roygbiv.prototype.pursue = function(pursuingObject, targetObject){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.pursue, preConditions.pursuingObject, pursuingObject);
  preConditions.checkIfDefined(ROYGBIV.pursue, preConditions.targetObject, targetObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.pursue, preConditions.pursuingObject, pursuingObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.pursue, preConditions.targetObject, targetObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.pursue, pursuingObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.pursue, targetObject);
  preConditions.checkIfSteerable(ROYGBIV.pursue, pursuingObject);
  preConditions.checkIfSteerable(ROYGBIV.pursue, targetObject);
  preConditions.checkIfObjectIsJumping(ROYGBIV.pursue, pursuingObject);

  steeringHandler.setTargetSteerable(pursuingObject, targetObject);
}

// Makes a steerable represented by evadingObject evade another steerable
// represented by targetObject. This API should be used with EvadeBehavior.
Roygbiv.prototype.evade = function(evadingObject, targetObject){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.evade, preConditions.evadingObject, evadingObject);
  preConditions.checkIfDefined(ROYGBIV.evade, preConditions.targetObject, targetObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.evade, preConditions.evadingObject, evadingObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.evade, preConditions.targetObject, targetObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.evade, evadingObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.evade, targetObject);
  preConditions.checkIfSteerable(ROYGBIV.evade, evadingObject);
  preConditions.checkIfSteerable(ROYGBIV.evade, targetObject);
  preConditions.checkIfObjectIsJumping(ROYGBIV.evade, evadingObject);

  steeringHandler.setTargetSteerable(evadingObject, targetObject);
}

// Makes a steerable stop pursuing other steerables. It makes sense to use this API
// with PursueBehavior, after using pursue API.
Roygbiv.prototype.stopPursuing = function(pursuingObject){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.stopPursuing, preConditions.pursuingObject, pursuingObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.stopPursuing, preConditions.pursuingObject, pursuingObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.stopPursuing, pursuingObject);
  preConditions.checkIfSteerable(ROYGBIV.stopPursuing, pursuingObject);
  preConditions.checkIfObjectIsJumping(ROYGBIV.stopPursuing, pursuingObject);

  steeringHandler.unsetTargetSteerable(pursuingObject);
}

// Makes a steerable stop evading other steerables. It makes sense to use this API
// with EvadeBehavior, after using evade API.
Roygbiv.prototype.stopEvading = function(evadingObject){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.stopEvading, preConditions.evadingObject, evadingObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.stopEvading, preConditions.evadingObject, evadingObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.stopEvading, evadingObject);
  preConditions.checkIfSteerable(ROYGBIV.stopEvading, evadingObject);
  preConditions.checkIfObjectIsJumping(ROYGBIV.stopEvading, evadingObject);

  steeringHandler.unsetTargetSteerable(evadingObject);
}

// Makes a steerable manually jump. toTakeoffBehaviorName parameter represents the
// steering behavior used until the steerable reaches to the takeoff point.
// completeCallback function is executed when the jump is completed. When a
// jump is completed, a steering behavior needs to be set to the steerable in order
// to continue the movement. Note that this API returns false if the jump described
// by the jumpDescriptor is not achievable by given steerable, true otherwise.
Roygbiv.prototype.jump = function(object, jumpDescriptor, toTakeoffBehaviorName, completeCallback){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.jump, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.jump, preConditions.jumpDescriptor, jumpDescriptor);
  preConditions.checkIfDefined(ROYGBIV.jump, preConditions.toTakeoffBehaviorName, toTakeoffBehaviorName);
  preConditions.checkIfDefined(ROYGBIV.jump, preConditions.completeCallback, completeCallback);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.jump, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.jump, object);
  preConditions.checkIfSteerable(ROYGBIV.jump, object);
  preConditions.checkIfJumpDescriptor(ROYGBIV.jump, jumpDescriptor);
  preConditions.checkIfJumpDescriptorInActiveScene(ROYGBIV.jump, jumpDescriptor.roygbivName);
  preConditions.checkIfString(ROYGBIV.jump, preConditions.toTakeoffBehaviorName, toTakeoffBehaviorName);
  preConditions.checkIfObjectHasBehavior(ROYGBIV.jump, object, toTakeoffBehaviorName);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.jump, preConditions.completeCallback, completeCallback);
  preConditions.checkIfObjectIsJumping(ROYGBIV.jump, object);

  return steeringHandler.jump(object, jumpDescriptor, toTakeoffBehaviorName, completeCallback);
}

// Executes func parameter with x, y, z coordinates for each waypoint of
// the path of given AStar object. Note that paths of AStar objects are
// reconstructed after finding the shortest distance, either manually or
// automatically by RandomPathBehavior.
Roygbiv.prototype.executeForEachWaypoint = function(aStar, func){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.executeForEachWaypoint, preConditions.aStar, aStar);
  preConditions.checkIfDefined(ROYGBIV.executeForEachWaypoint, preConditions.func, func);
  preConditions.checkIfAStar(ROYGBIV.executeForEachWaypoint, aStar);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.executeForEachWaypoint, preConditions.func, func);

  var path = aStar.path;
  for (var i = 0; i < path.length; i ++){
    var wp = path.waypoints[i];
    func(wp.x, wp.y, wp.z);
  }
}

// Sets the look direction of given steerable. Unlike setSteerableLookTarget API which
// eventually makes a steerable gradually look at given target depending on the lookSpeed
// of the steerable, this API immediately modifies the look direction.
Roygbiv.prototype.setSteerableLookDirection = function(object, lookDirectionVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setSteerableLookDirection, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setSteerableLookDirection, preConditions.positionVector, lookDirectionVector);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setSteerableLookDirection, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.setSteerableLookDirection, object);
  preConditions.checkIfSteerable(ROYGBIV.setSteerableLookDirection, object);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setSteerableLookDirection, preConditions.positionVector, lookDirectionVector);

  steeringHandler.setLookDirection(object, lookDirectionVector);
}

// Fills the targetVectot with the look direction of given steerable object and returns it.
Roygbiv.prototype.getSteerableLookDirection = function(object, targetVector){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.getSteerableLookDirection, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.getSteerableLookDirection, preConditions.targetVector, targetVector);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.getSteerableLookDirection, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.getSteerableLookDirection, object);
  preConditions.checkIfSteerable(ROYGBIV.getSteerableLookDirection, object);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getSteerableLookDirection, preConditions.targetVector, targetVector);

  return steeringHandler.getLookDirection(object, targetVector);
}

// Ensures the RandomPathBehavior tries to start from the closest graph vertex
// to given steerable. This API may be useful when the random path behavior of
// object is changed to some other behavior before the object reaches to the
// destination vertex, and then the random path behavior is activated again.
// If given behavior is a blended or a priority steering behavior, the child
// random path behaviors are reset.
Roygbiv.prototype.resetRandomPathBehavior = function(object, behaviorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.resetRandomPathBehavior, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.resetRandomPathBehavior, preConditions.behaviorName, behaviorName);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.resetRandomPathBehavior, preConditions.object, object);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.resetRandomPathBehavior, object);
  preConditions.checkIfString(ROYGBIV.resetRandomPathBehavior, preConditions.behaviorName, behaviorName);
  preConditions.checkIfSteerable(ROYGBIV.resetRandomPathBehavior, object);
  preConditions.checkIfObjectHasBehavior(ROYGBIV.resetRandomPathBehavior, object, behaviorName);
  preConditions.checkIfRandomPathOrBlendedOrPriorityBehavior(Roygbiv.resetRandomPathBehavior, object, behaviorName);

  steeringHandler.resetRandomPathBehavior(object, behaviorName);
}

// SCRIPT RELATED FUNCTIONS ****************************************************

// Starts a script. To get scripts use this format as scriptName:
// parentdir1_parentdir2_....._parentdirX_scriptFileName
// For example in order to get a script under the scripts/ root folder
// example.js, the scriptName parameter should be example. However, to get
// a script under scripts/testFolder/test.js, the scriptName parameter should be
// testFolder_test.
Roygbiv.prototype.startScript = function(scriptName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startScript, preConditions.scriptName, scriptName);
  var script = scripts[scriptName];
  preConditions.checkIfScriptExists(ROYGBIV.startScript, null, script);
  script.start();
}

// Stops a script. The scriptName parameter is explained with startScript API.
Roygbiv.prototype.stopScript = function(scriptName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopScript, preConditions.scriptName, scriptName);
  var script = scripts[scriptName.replace(/-/g, "")];
  preConditions.checkIfScriptExists(ROYGBIV.stopScript, null, script);
  script.stop();
}

// UTILITY FUNCTIONS ***********************************************************

//  Creates a new vector from x, y and z coordinates.
Roygbiv.prototype.vector = function(x, y, z){
  if (mode == 0){
    return;
  }
  var obj = new Object();
  if (typeof x == UNDEFINED){
    obj.x = 0;
  }else{
    preConditions.checkIfNumber(ROYGBIV.vector, preConditions.x, x);
    obj.x = x;
  }
  if (typeof y == UNDEFINED){
    obj.y = 0;
  }else{
    preConditions.checkIfNumber(ROYGBIV.vector, preConditions.y, y);
    obj.y = y;
  }
  if (typeof z == UNDEFINED){
    obj.z = 0;
  }else{
    preConditions.checkIfNumber(ROYGBIV.vector, preConditions.z, z);
    obj.z = z;
  }
  return obj;
}

//  Returns the distance between two vectors.
Roygbiv.prototype.distance = function(vec1, vec2){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.distance, preConditions.vec1, vec1);
  preConditions.checkIfDefined(ROYGBIV.distance, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.distance, preConditions.vec1, vec1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.distance, preConditions.vec2, vec2);
  var dx = vec2.x - vec1.x;
  var dy = vec2.y - vec1.y;
  var dz = vec2.z - vec1.z;
  return Math.sqrt(
    Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2)
  );
}

//  Returns the substraction of two vectors.
Roygbiv.prototype.sub = function(vec1, vec2, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.sub, preConditions.vec1, vec1);
  preConditions.checkIfDefined(ROYGBIV.sub, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.sub, preConditions.vec1, vec1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.sub, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.sub, preConditions.targetVector, targetVector);
  if (!(typeof targetVector == UNDEFINED)){
    targetVector.x = vec1.x - vec2.x;
    targetVector.y = vec1.y - vec2.y;
    targetVector.z = vec1.z - vec2.z;
    return targetVector;
  }
  var obj = new Object();
  obj.x = vec1.x - vec2.x;
  obj.y = vec1.y - vec2.y;
  obj.z = vec1.z - vec2.z;
  return obj;
}

//  Returns the summation of two vectors.
Roygbiv.prototype.add = function(vec1, vec2, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.add, preConditions.vec1, vec1);
  preConditions.checkIfDefined(ROYGBIV.add, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.add, preConditions.vec1, vec1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.add, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.add, preConditions.targetVector, targetVector);
  if (!(typeof targetVector == UNDEFINED)){
    targetVector.x = vec1.x + vec2.x;
    targetVector.y = vec1.y + vec2.y;
    targetVector.z = vec1.z + vec2.z;
    return targetVector;
  }
  var obj = new Object();
  obj.x = vec1.x + vec2.x;
  obj.y = vec1.y + vec2.y;
  obj.z = vec1.z + vec2.z;
  return obj;
}

//  Moves vec1 towards vec2 by given amount and returns the new position of vec1.
//  Amount = 1 means that vec1 goes all the way towards vec2.
Roygbiv.prototype.moveTowards = function(vec1, vec2, amount, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.moveTowards, preConditions.vec1, vec1);
  preConditions.checkIfDefined(ROYGBIV.moveTowards, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.moveTowards, preConditions.vec1, vec1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.moveTowards, preConditions.vec2, vec2);
  preConditions.checkIfDefined(ROYGBIV.moveTowards, preConditions.amount, amount);
  preConditions.checkIfNumber(ROYGBIV.moveTowards, preConditions.amount, amount);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.moveTowards, preConditions.targetVector, targetVector);
  if (!(typeof targetVector == UNDEFINED)){
    var diff = this.sub(vec2, vec1, targetVector);
    targetVector.x = vec1.x + (amount * diff.x);
    targetVector.y = vec1.y + (amount * diff.y);
    targetVector.z = vec1.z + (amount * diff.z);
    return targetVector;
  }
  var diff = this.sub(vec2, vec1);
  var newVec = this.vector(0, 0, 0);
  newVec.x = vec1.x + (amount * diff.x);
  newVec.y = vec1.y + (amount * diff.y);
  newVec.z = vec1.z + (amount * diff.z);
  return newVec;
}

//  Creates a new color object from the given HTML color name.
Roygbiv.prototype.color = function(colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.color, preConditions.colorName, colorName);
  return new THREE.Color(colorName.toLowerCase());
}

//  Normalizes the vector given in the parameter. Note that this function modifies directly the
//  parameter and returns nothing.
Roygbiv.prototype.normalizeVector = function(vector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.normalizeVector, preConditions.vector, vector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.normalizeVector, preConditions.vector, vector);
  var len = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y) + (vector.z * vector.z));
  vector.x = vector.x / len;
  vector.y = vector.y / len;
  vector.z = vector.z / len;
}

//  Returns the quaternion between two vectors.
Roygbiv.prototype.computeQuaternionFromVectors = function(vec1, vec2, targetQuaternion){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.computeQuaternionFromVectors, preConditions.vec1, vec1);
  preConditions.checkIfDefined(ROYGBIV.computeQuaternionFromVectors, preConditions.vec2, vec2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.computeQuaternionFromVectors, preConditions.vec1, vec1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.computeQuaternionFromVectors, preConditions.vec2, vec2);
  preConditions.checkIfQuaternionOnlyIfDefined(ROYGBIV.computeQuaternionFromVectors, preConditions.targetQuaternion, targetQuaternion);
  this.normalizeVector(vec1);
  this.normalizeVector(vec2);
  REUSABLE_VECTOR.set(vec1.x, vec1.y, vec1.z);
  REUSABLE_VECTOR_2.set(vec2.x, vec2.y, vec2.z);
  REUSABLE_QUATERNION.setFromUnitVectors(REUSABLE_VECTOR, REUSABLE_VECTOR_2);
  if (!targetQuaternion){
    return REUSABLE_QUATERNION.clone();
  }else{
    targetQuaternion.set(
      REUSABLE_QUATERNION.x, REUSABLE_QUATERNION.y, REUSABLE_QUATERNION.z, REUSABLE_QUATERNION.w
    );
    return targetQuaternion;
  }
}

//  Multiplies a vector by a scalar.
Roygbiv.prototype.multiplyScalar = function(vector, scalar, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.multiplyScalar, preConditions.scalar, scalar);
  preConditions.checkIfNumber(ROYGBIV.multiplyScalar, preConditions.scalar, scalar);
  preConditions.checkIfDefined(ROYGBIV.multiplyScalar, preConditions.vector, vector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.multiplyScalar, preConditions.vector, vector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.targetVector, preConditions.targetVector, targetVector);
  if (!targetVector){
    return this.vector(vector.x * scalar, vector.y * scalar, vector.z * scalar);
  }else{
    targetVector.x = vector.x * scalar;
    targetVector.y = vector.y * scalar;
    targetVector.z = vector.z * scalar;
    return targetVector;
  }
}

// Set the x, y, z components of a vector.
Roygbiv.prototype.setVector = function(vector, x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setVector, preConditions.vector, vector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.setVector, preConditions.vector, vector);
  preConditions.checkIfDefined(ROYGBIV.setVector, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setVector, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.setVector, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.setVector, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setVector, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.setVector, preConditions.z, z);
  vector.x = x;
  vector.y = y;
  vector.z = z;
  return vector;
}

// Returns a new THREE.Quaternion instance.
Roygbiv.prototype.quaternion = function(){
  if (mode == 0){
    return;
  }
  return new THREE.Quaternion();
}

// Requests pointer lock from window on the next click.
Roygbiv.prototype.requestPointerLock = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.requestPointerLock, "Pointer Lock API is not supported by this browser", (!pointerLockSupported || isMobile));
  pointerLockRequested = true;
}

// Returns the degree equivalent of an Euler angle.
Roygbiv.prototype.convertEulerToDegrees = function(eulerAngle){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.convertEulerToDegrees, preConditions.eulerAngle, eulerAngle);
  preConditions.checkIfNumber(ROYGBIV.convertEulerToDegrees, preConditions.eulerAngle, eulerAngle);
  return ((eulerAngle * 180) / Math.PI);
}

// Returns whether the given key is pressed or not. See the keyCodeToChar
// variable for possible key names.
Roygbiv.prototype.isKeyPressed = function(key){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.isKeyPressed, preConditions.key, key);
  return keyboardBuffer[key];
}

// Sets the position of the camera.
Roygbiv.prototype.setCameraPosition = function(x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setCameraPosition, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setCameraPosition, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.setCameraPosition, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.setCameraPosition, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setCameraPosition, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.setCameraPosition, preConditions.z, z);
  camera.position.set(x, y, z);
}

// Makes the camera look at specific position.
Roygbiv.prototype.lookAt = function(x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.lookAt, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.lookAt, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.lookAt, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.lookAt, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.lookAt, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.lookAt, preConditions.z, z);
  camera.lookAt(x, y, z);
}

// Rotates the vector around an axis by given angle.
Roygbiv.prototype.applyAxisAngle = function(vector, axisVector, angle, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.applyAxisAngle, preConditions.vector, vector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.applyAxisAngle, preConditions.vector, vector);
  preConditions.checkIfDefined(ROYGBIV.applyAxisAngle, preConditions.axisVector, axisVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.applyAxisAngle, preConditions.axisVector, axisVector);
  preConditions.checkIfDefined(ROYGBIV.applyAxisAngle, preConditions.angle, angle);
  preConditions.checkIfNumber(ROYGBIV.applyAxisAngle, preConditions.angle, angle);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.applyAxisAngle, preConditions.targetVector, targetVector);
  REUSABLE_VECTOR.set(vector.x, vector.y, vector.z);
  REUSABLE_VECTOR_2.set(axisVector.x, axisVector.y, axisVector.z);
  REUSABLE_VECTOR.applyAxisAngle(REUSABLE_VECTOR_2, angle);
  if (!(typeof targetVector == UNDEFINED)){
    targetVector.x = REUSABLE_VECTOR.x;
    targetVector.y = REUSABLE_VECTOR.y;
    targetVector.z = REUSABLE_VECTOR.z;
    return targetVector;
  }
  return this.vector(REUSABLE_VECTOR.x, REUSABLE_VECTOR.y, REUSABLE_VECTOR.z);
}

// Makes sourceObject keep its relative position to targetObject.
Roygbiv.prototype.trackObjectPosition = function(sourceObject, targetObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.trackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.trackObjectPosition, preConditions.targetObject, targetObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.trackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.trackObjectPosition, preConditions.targetObject, targetObject);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.trackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.trackObjectPosition, preConditions.targetObject, targetObject);
  preConditions.checkIfDynamic(ROYGBIV.trackObjectPosition, preConditions.targetObject, targetObject);
  preConditions.checkIfNotDynamic(ROYGBIV.trackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfChangeable(ROYGBIV.trackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.trackObjectPosition, sourceObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.trackObjectPosition, targetObject);
  preConditions.checkIfNotFPSWeapon(ROYGBIV.trackObjectPosition, sourceObject);
  preConditions.checkIfNotSteerable(ROYGBIV.trackObjectPosition, sourceObject);
  sourceObject.trackObjectPosition(targetObject);
}

// Stops tracking an objects position for an object.
Roygbiv.prototype.untrackObjectPosition = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.untrackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.untrackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.untrackObjectPosition, sourceObject);
  sourceObject.untrackObjectPosition();
}

// Creates and returns a rotation pivot for an object. This function is not
// optimized for the runtime. Use this function before setRotationPivot API on
// initialization. Instead of ROYGBIV.rotate API that works on world axes, this
// function may be used with 0 offset parameters to achieve local rotation for objects.
Roygbiv.prototype.createRotationPivot = function(sourceObject, offsetX, offsetY, offsetZ){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createRotationPivot, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.createRotationPivot, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.createRotationPivot, preConditions.offsetX, offsetX);
  preConditions.checkIfDefined(ROYGBIV.createRotationPivot, preConditions.offsetY, offsetY);
  preConditions.checkIfDefined(ROYGBIV.createRotationPivot, preConditions.offsetZ, offsetZ);
  preConditions.checkIfNumber(ROYGBIV.createRotationPivot, preConditions.offsetX, offsetX);
  preConditions.checkIfNumber(ROYGBIV.createRotationPivot, preConditions.offsetY, offsetY);
  preConditions.checkIfNumber(ROYGBIV.createRotationPivot, preConditions.offsetZ, offsetZ);
  preConditions.checkIfObjectInsideActiveScene(ROYGBIV.createRotationPivot, sourceObject);
  return sourceObject.makePivot(offsetX, offsetY, offsetZ);
}

// Rotates the camera around its axis by given radians. Note that axis must be
// one of ROYGBIV.axes.X, ROYGBIV.axes.Y or ROYGBIV.axes.Z.
Roygbiv.prototype.rotateCamera = function(axis, radians){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rotateCamera, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.rotateCamera, preConditions.radians, radians);
  preConditions.checkIfNumber(ROYGBIV.rotateCamera, preConditions.radians, radians);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.rotateCamera, preConditions.axis, axis);
  if (axis == this.axes.X){
    cameraRotationBuffer.x += radians;
  }else if (axis == this.axes.Y){
    cameraRotationBuffer.y += radians;
  }else if (axis == this.axes.Z){
    cameraRotationBuffer.z += radians;
  }
}

// Translates the camera along given axis by given amount. Note that axis must be
// one of ROYGBIV.axes.X, ROYGBIV.axes.Y or ROYGBIV.axes.Z.
Roygbiv.prototype.translateCamera = function(axis, amount){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.translateCamera, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.translateCamera, preConditions.amount, amount);
  preConditions.checkIfNumber(ROYGBIV.translateCamera, preConditions.amount, amount);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.translateCamera, preConditions.axis, axis);
  if (axis == this.axes.X){
    camera.translateX(amount);
  }else if (axis == this.axes.Y){
    camera.translateY(amount);
  }else if (axis == this.axes.Z){
    camera.translateZ(amount);
  }
}

// Goes to full screen mode. on the next mouse click. Does nothing if the screen is
// already in full screen mode.
Roygbiv.prototype.requestFullScreen = function(){
  if (mode == 0){
    return;
  }
  if (onFullScreen){
    return;
  }
  fullScreenRequested = true;
}

// Returns true if the mouse is pressed, false otherwise.
Roygbiv.prototype.isMouseDown = function(){
  if (mode == 0){
    return;
  }
  return isMouseDown;
}

// Finds the first intersected object on a ray. The onComplete callback function
// is executed with x, y, z and objectName parameters. If there's no intersection,
// the objectName is set to null. If the web workers not supported, the onComplete
// is executed immediately.
Roygbiv.prototype.intersectionTest = function(fromVector, directionVector, onComplete){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.intersectionTest, preConditions.fromVector, fromVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.intersectionTest, preConditions.fromVector, fromVector);
  preConditions.checkIfDefined(ROYGBIV.intersectionTest, preConditions.directionVector, directionVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.intersectionTest, preConditions.directionVector, directionVector);
  preConditions.checkIfDefined(ROYGBIV.intersectionTest, preConditions.onComplete, onComplete);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.intersectionTest, preConditions.onComplete, onComplete);
  REUSABLE_VECTOR.set(fromVector.x, fromVector.y, fromVector.z);
  REUSABLE_VECTOR_2.set(directionVector.x, directionVector.y, directionVector.z).normalize();
  rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, false, onComplete, null, null);
}

// Returns if the current client is a mobile client.
Roygbiv.prototype.isMobile = function(){
  if (mode == 0){
    return;
  }
  return isMobile;
}

// Linearly interpolate between vector1 and vector2. The result is vector1 if
// amount = 0 and vector2 if amount = 1.
Roygbiv.prototype.lerp = function(vector1, vector2, amount, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.lerp, preConditions.vector1, vector1);
  preConditions.checkIfDefined(ROYGBIV.lerp, preConditions.vector2, vector2);
  preConditions.checkIfDefined(ROYGBIV.lerp, preConditions.amount, amount);
  preConditions.checkIfDefined(ROYGBIV.lerp, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.lerp, preConditions.vector1, vector1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.lerp, preConditions.vector2, vector2);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.lerp, preConditions.targetVector, targetVector);
  preConditions.checkIfNumber(ROYGBIV.lerp, preConditions.amount, amount);
  preConditions.checkIfInRange(ROYGBIV.lerp, preConditions.amount, amount, 0, 1);
  REUSABLE_VECTOR.set(vector1.x, vector1.y, vector1.z);
  REUSABLE_VECTOR_2.set(vector2.x, vector2.y, vector2.z);
  REUSABLE_VECTOR.lerp(REUSABLE_VECTOR_2, amount);
  targetVector.x = REUSABLE_VECTOR.x;
  targetVector.y = REUSABLE_VECTOR.y;
  targetVector.z = REUSABLE_VECTOR.z;
  return targetVector;
}

// Pauses/unpauses rendering. Note that once the rendering is paused the scripts
// also pause so in order to unpause the rendering, use callback functions such
// as ROYGBIV.setScreenClickListener or ROYGBIV.setScreenPointerLockChangeListener.
Roygbiv.prototype.pause = function(paused){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.pause, preConditions.paused, paused);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.pause, preConditions.paused, paused);
  var oldIsPaused = isPaused;
  isPaused = paused;
  if (!paused && oldIsPaused){
    render();
  }
}

// Executes the given function for each object and object group. The func paremter
// is executed with object and objectName parameters.
Roygbiv.prototype.executeForEachObject = function(func){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.executeForEachObject, preConditions.func, func);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.executeForEachObject, preConditions.func, func);
  for (var objName in sceneHandler.getAddedObjects()){
    func(addedObjects[objName], objName)
  }
  for (var objName in sceneHandler.getObjectGroups()){
    func(objectGroups[objName], objName)
  }
}

// Returns a random integer in range [minInclusive, maxInclusive]
Roygbiv.prototype.getRandomInteger = function(minInclusive, maxInclusive){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getRandomInteger, preConditions.minInclusive, minInclusive);
  preConditions.checkIfDefined(ROYGBIV.getRandomInteger, preConditions.maxInclusive, maxInclusive);
  preConditions.checkIfNumber(ROYGBIV.getRandomInteger, preConditions.minInclusive, minInclusive);
  preConditions.checkIfNumber(ROYGBIV.getRandomInteger, preConditions.maxInclusive, maxInclusive);
  preConditions.checkIfTrue(ROYGBIV.getRandomInteger, "minInclusive must be less than maxInclusive", (minInclusive > maxInclusive));
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

// For mobile devices, returns true if there is any finger touching to the screen.
Roygbiv.prototype.isAnyFingerTouching = function(){
  if (mode == 0){
    return;
  }
  return touchEventHandler.isThereFingerTouched;
}

// For mobile devices, returns the amount of fingers touching to the screen.
Roygbiv.prototype.getCurrentTouchCount = function(){
  if (mode == 0){
    return;
  }
  return touchEventHandler.currentTouchCount;
}

// For mobile devices returns if the orientation is landscape for mobile devices. Returns
// false for desktop devices.
Roygbiv.prototype.isOrientationLandscape = function(){
  if (mode == 0){
    return;
  }
  if (!isMobile){
    return false;
  }
  return isOrientationLandscape;
}

// Runs a function after delayInMS milliseconds. If the repeat parameter is set to true runs
// the function in every delayInMS milliseconds. This function returns a delayedExecutionID.
// This ID may provided to stopDelayedExecution API in order to stop a function to get executed.
Roygbiv.prototype.executeDelayed = function(func, delayInMS, repeat){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.executeDelayed, preConditions.func, func);
  preConditions.checkIfDefined(ROYGBIV.executeDelayed, preConditions.delayInMS, delayInMS);
  preConditions.checkIfDefined(ROYGBIV.executeDelayed, preConditions.repeat, repeat);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.executeDelayed, preConditions.func, func);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.executeDelayed, preConditions.delayInMS, delayInMS);
  preConditions.checkIfLessThan(ROYGBIV.executeDelayed, preConditions.delayInMS, delayInMS, 0);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.executeDelayed, preConditions.repeat, repeat);
  return delayedExecutionHandler.requestDelayedExecution(delayInMS, func, repeat);
}

// Stops a function to get executed with executeDelayed API. The delayedExecutionID parameter
// should be the return value of executeDelayed API. This API returns true if a function is
// found associated with the provided delayedExecutionID parameter, returns false otherwise.
Roygbiv.prototype.stopDelayedExecution = function(delayedExecutionID){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopDelayedExecution, preConditions.delayedExecutionID, delayedExecutionID);
  return delayedExecutionHandler.stopDelayedExecution(delayedExecutionID);
}

// Sets a hash to window.location. This can be used to track changes when
// the user presses on back button.
Roygbiv.prototype.setLocationHash = function(hash){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setLocationHash, preConditions.hash, hash);
  window.location.hash = hash;
}

// Changes the active scene. The readyCallback function is executed when
// the new scene is ready.
Roygbiv.prototype.changeScene = function(sceneName, readyCallback){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.changeScene, preConditions.sceneName, sceneName);
  preConditions.checkIfSceneExists(ROYGBIV.changeScene, sceneName);
  preConditions.checkIfDefined(ROYGBIV.changeScene, preConditions.readyCallback, readyCallback);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.changeScene, preConditions.readyCallback, readyCallback);
  preConditions.checkIfTrue(ROYGBIV.changeScene, "Scene is already active.", sceneHandler.getActiveSceneName() == sceneName);
  sceneHandler.changeScene(sceneName, readyCallback);
}

// Converts degrees to radians.
Roygbiv.prototype.degreeToRadian = function(degree){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.degreeToRadian, preConditions.degree, degree);
  preConditions.checkIfNumber(ROYGBIV.degreeToRadian, preConditions.degree, degree);
  return (degree * (Math.PI / 180));
}

// Stores data using localStorage API.
Roygbiv.prototype.storeData = function(key, value){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.storeData, preConditions.key, key);
  preConditions.checkIfDefined(ROYGBIV.storeData, preConditions.value, value);
  localStorage.setItem(key, value);
}

// Gets stored data using localStorage API.
Roygbiv.prototype.getStoredData = function(key){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getStoredData, preConditions.key, key);
  return localStorage.getItem(key);
}

// Removes stored data using localStorage API.
Roygbiv.prototype.removeStoredData = function(key){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeStoredData, preConditions.key, key);
  localStorage.removeItem(key);
}

// Checks if given element is defined.
Roygbiv.prototype.isDefined = function(element){
  if (mode == 0){
    return;
  }
  return !(typeof element == UNDEFINED) && !(element == null);
}

// Loads given textures inside provided dynamic texture folder. onLoadedCallback is executed
// with results parameter when the loading process is finished. This results parameter holds either
// a texture pack object as element if the texture could be loaded, or false if not. The order of
// elements of results parameter and textureNamesArray are the same. ROYGBIV engine automatically takes care of
// caching, so a texture is not loaded twice from the same path.
Roygbiv.prototype.loadDynamicTextures = function(dynamicTextureFolderName, textureNamesArray, onLoadedCallback){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.loadDynamicTextures, preConditions.dynamicTextureFolderName, dynamicTextureFolderName);
  preConditions.checkIfDefined(ROYGBIV.loadDynamicTextures, preConditions.textureNamesArray, textureNamesArray);
  preConditions.checkIfDefined(ROYGBIV.loadDynamicTextures, preConditions.onLoadedCallback, onLoadedCallback);
  preConditions.checkIfDynamicTextureFolderExists(ROYGBIV.loadDynamicTextures, dynamicTextureFolderName);
  preConditions.checkIfArrayOfStrings(ROYGBIV.loadDynamicTextures, preConditions.textureNamesArray, textureNamesArray);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.loadDynamicTextures, preConditions.onLoadedCallback, onLoadedCallback);
  new DynamicTextureLoader().loadDynamicTextures(dynamicTextureFolderName, textureNamesArray, onLoadedCallback);
}

// Applies velocity to FPS controls for given milliseconds. This can be useful for
// Valve Ricochet kind of games where the player is manually accelerated with jump
// pads.
Roygbiv.prototype.applyCustomVelocity = function(axis, velocity, milliseconds){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.applyCustomVelocity, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.applyCustomVelocity, preConditions.velocity, velocity);
  preConditions.checkIfDefined(ROYGBIV.applyCustomVelocity, preConditions.milliseconds, milliseconds);
  preConditions.checkIfNumber(ROYGBIV.applyCustomVelocity, preConditions.velocity, velocity);
  preConditions.checkIfNumber(ROYGBIV.applyCustomVelocity, preConditions.milliseconds, milliseconds);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.applyCustomVelocity, preConditions.axis, axis);
  preConditions.checkIfActiveControlFPS(ROYGBIV.applyCustomVelocity);
  activeControl.applyCustomVelocity(axis, velocity, milliseconds);
}

// Converts a 3D vector within source area into another vector in target area
// maintanining the ratio.
Roygbiv.prototype.mapAreaPositionToArea = function(sourceAreaName, targetAreaName, vector, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.mapAreaPositionToArea, preConditions.sourceAreaName, sourceAreaName);
  preConditions.checkIfDefined(ROYGBIV.mapAreaPositionToArea, preConditions.targetAreaName, targetAreaName);
  preConditions.checkIfDefined(ROYGBIV.mapAreaPositionToArea, preConditions.vector, vector);
  preConditions.checkIfDefined(ROYGBIV.mapAreaPositionToArea, preConditions.targetVector, targetVector);
  preConditions.checkIfAreaExists(ROYGBIV.mapAreaPositionToArea, sourceAreaName);
  preConditions.checkIfAreaExists(ROYGBIV.mapAreaPositionToArea, targetAreaName);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.mapAreaPositionToArea, preConditions.vector, vector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.mapAreaPositionToArea, preConditions.targetVector, targetVector);

  var bbSource = areas[sourceAreaName].boundingBox;
  var bbTarget = areas[targetAreaName].boundingBox;

  targetVector.x = affineTransformation(vector.x, bbSource.max.x, bbSource.min.x, bbTarget.max.x, bbTarget.min.x);
  targetVector.y = affineTransformation(vector.y, bbSource.max.y, bbSource.min.y, bbTarget.max.y, bbTarget.min.y);
  targetVector.z = affineTransformation(vector.z, bbSource.max.z, bbSource.min.z, bbTarget.max.z, bbTarget.min.z);

  return targetVector;
}

// Returns a vector pool to store reusable vectors. Use getFromVectorPool
// API to get the vector object.
Roygbiv.prototype.createVectorPool = function(length){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.createVectorPool, preConditions.length, length);
  preConditions.checkIfNumber(ROYGBIV.createVectorPool, preConditions.length, length);
  preConditions.checkIfLessThan(ROYGBIV.createVectorPool, preConditions.length, length, 0);

  return new VectorPool(this.vector, length);
}

// Returns a vector from a vector pool create with createVectorPool API.
Roygbiv.prototype.getFromVectorPool = function(vectorPool){
  if (mode == 0){
    return;
  }

  preConditions.checkIfDefined(ROYGBIV.getFromVectorPool, preConditions.vectorPool, vectorPool);
  preConditions.checkIfTrue(ROYGBIV.getFromVectorPool, "Object is not a vector pool", !vectorPool.isVectorPool);

  return vectorPool.get();
}
