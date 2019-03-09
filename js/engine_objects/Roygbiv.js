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
//  * Crosshair functions
//  * Text functions
var Roygbiv = function(){
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
    "applyNoise",
    "sphericalDistribution",
    "boxDistribution",
    "applyForce",
    "rotate",
    "rotateAroundXYZ",
    "setPosition",
    "color",
    "setMass",
    "runScript",
    "isRunning",
    "translate",
    "getPosition",
    "opacity",
    "getOpacity",
    "setCollisionListener",
    "removeCollisionListener",
    "createParticleMaterial",
    "createParticle",
    "createParticleSystem",
    "scale",
    "setBlending",
    "setParticleSystemRotation",
    "setParticleSystemQuaternion",
    "kill",
    "createSmoke",
    "getMarkedPosition",
    "createTrail",
    "createPlasma",
    "setExpireListener",
    "removeExpireListener",
    "normalizeVector",
    "computeQuaternionFromVectors",
    "circularDistribution",
    "multiplyScalar",
    "createFireExplosion",
    "createMagicCircle",
    "createCircularExplosion",
    "createDynamicTrail",
    "createObjectTrail",
    "destroyObjectTrail",
    "generateParticleSystemName",
    "rewindParticle",
    "createLaser",
    "createWaterfall",
    "createSnow",
    "getParticleSystemVelocityAtTime",
    "stopParticleSystem",
    "startParticleSystem",
    "hideParticleSystem",
    "getCameraDirection",
    "getCameraPosition",
    "createParticleSystemPool",
    "getParticleSystemPool",
    "addParticleSystemToPool",
    "getParticleSystemFromPool",
    "removeParticleSystemFromPool",
    "destroyParticleSystemPool",
    "createConfettiExplosion",
    "copyParticleSystem",
    "setVector",
    "quaternion",
    "fadeAway",
    "mergeParticleSystems",
    "createCrosshair",
    "selectCrosshair",
    "changeCrosshairColor",
    "hideCrosshair",
    "startCrosshairRotation",
    "stopCrosshairRotation",
    "pauseCrosshairRotation",
    "expandCrosshair",
    "shrinkCrosshair",
    "setParticleSystemPosition",
    "startObjectTrail",
    "stopObjectTrail",
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
    "disableDefaultControls",
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
    "createInitializedParticleSystemPool",
    "intersectionTest",
    "getEndPoint",
    "isMobile",
    "lerp",
    "resetObjectVelocity",
    "setFPSDropCallbackFunction",
    "removeFPSDropCallbackFunction",
    "setPerformanceDropCallbackFunction",
    "removePerformanceDropCallbackFunction",
    "setBloom",
    "unsetBloom",
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
    "makeParticleSystemsResponsive"
  ];

  this.globals = new Object();

}

// GETTER FUNCTIONS ************************************************************

// getObject
//   Returns the object or glued object having the name given as the parameter,
//   or zero if no such object or glued object is found.
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
  return 0;
}

// getParticleSystem
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

// getChildObject
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
Roygbiv.prototype.getPosition = function(object, targetVector, axis){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getPosition, preConditions.object, object);
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.getPosition, preConditions.axis, axis);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getPosition, preConditions.targetVector, targetVector);
  preConditions.checkIfAddedObjectObjectGroupParticleSystem(ROYGBIV.getPosition, preConditions.object, object);
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
        if (axis.toLowerCase() == "x"){
          return worldPosition.x;
        }else if (axis.toLowerCase() == "y"){
          return worldPosition.y;
        }else if (axis.toLowerCase() == "z"){
          return worldPosition.z;
        }
      }
      if (axis.toLowerCase() == "x"){
        return object.mesh.position.x;
      }else if (axis.toLowerCase() == "y"){
        return object.mesh.position.y;
      }else if (axis.toLowerCase() == "z"){
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
      if (axis.toLowerCase() == "x"){
        return object.mesh.position.x;
      }else if (axis.toLowerCase() == "y"){
        return object.mesh.position.y;
      }else if (axis.toLowerCase() == "z"){
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
      if (axis.toLowerCase() == "x"){
        return object.mesh.position.x;
      }else if (axis.toLowerCase() == "y"){
        return object.mesh.position.y;
      }else if (axis.toLowerCase() == "z"){
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

// getOpacity
//  Returns the opacity of given object.
Roygbiv.prototype.getOpacity = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getOpacity, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.getOpacity, preConditions.object, object);
  if (object.isAddedObject){
    return object.mesh.material.uniforms.alpha.value;
  }
  return object.mesh.material.uniforms.totalAlpha.value;
}

// getMarkedPosition
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
  targetVector.x = markedPoint.x;
  targetVector.y = markedPoint.y;
  targetVector.z = markedPoint.z;
  return targetVector;
}

// getParticleSystemVelocityAtTime
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
  return particleSystem.getVelocityAtTime(time, targetVector);
}

// getCameraDirection
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

// getCameraPosition
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

// getParticleSystemPool
// Finds a particle system pool by name and returns it.
Roygbiv.prototype.getParticleSystemPool = function(name){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getParticleSystemPool, preConditions.name, name);
  var psPool = particleSystemPools[name];
  preConditions.checkIfParticleSystemPoolExists(ROYGBIV.getParticleSystemPool, null, psPool);
  return psPool;
}

// getParticleSystemFromPool
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
  return pool.get();
}

// getEndPoint
// Gets an end point of an object. The axis may be +x,-x,+y,-y,+z or -z. Note that
// object groups do not support this function but child objects do. This function
// may be useful in cases where for example a particle system needs to be started
// from the tip point of an object.
Roygbiv.prototype.getEndPoint = function(object, axis, targetVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getEndPoint, preConditions.object, object);
  preConditions.checkIfAddedObject(ROYGBIV.getEndPoint, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.getEndPoint, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.getEndPoint, preConditions.targetVector, targetVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.getEndPoint, preConditions.targetVector, targetVector);
  axis = axis.toLowerCase();
  preConditions.checkIfEndPointAxis(ROYGBIV.getEndPoint, preConditions.axis, axis);
  var endPoint = object.getEndPoint(axis);
  targetVector.x = endPoint.x;
  targetVector.y = endPoint.y;
  targetVector.z = endPoint.z;
  return targetVector;
}

// getViewport
// Returns the current viewport object having startX, startY, width and height parameters.
// Do not modify the values of the returned object.
Roygbiv.prototype.getViewport = function(){
  if (mode == 0){
    return;
  }
  return currentViewport;
}

// getText
// Returns a text object or 0 if the text does not exist.
Roygbiv.prototype.getText = function(textName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.getText, preConditions.textName, textName);
  var text = addedTexts[textName];
  if (text){
    return text;
  }
  return 0;
}

// getFPS
// Returns the current FPS.
Roygbiv.prototype.getFPS = function(){
  if (mode == 0){
    return;
  }
  return fpsHandler.fps;
}

// OBJECT MANIPULATION FUNCTIONS ***********************************************

// hide
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
  if (object.isAddedObject){
    preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.hide, preConditions.object, object);
    if (keepPhysicsValue){
      preConditions.checkIfNoMass(ROYGBIV.hide, preConditions.object, object);
    }
    preConditions.checkIfChangeable(ROYGBIV.hide, preConditions.object, object);
    if (object.isVisibleOnThePreviewScene()){
      object.mesh.visible = false;
      // The reason we use delayed execution here is that
      // during the collision callback, cannon.js crashes if a body
      // is removed. It is safe to remove the bodies after the
      // physics iteration.
      if (!keepPhysicsValue){
        if (!object.noMass){
          setTimeout(function(){
            physicsWorld.removeBody(object.physicsBody);
            object.physicsKeptWhenHidden = false;
          });
        }
      }else{
        object.physicsKeptWhenHidden = true;
      }
      object.isHidden = true;
      rayCaster.hide(object);
    }
  }else if (object.isObjectGroup){
    if (keepPhysicsValue){
      preConditions.checkIfNoMass(ROYGBIV.hide, preConditions.object, object);
    }
    preConditions.checkIfChangeable(ROYGBIV.hide, preConditions.object, object);
    if (object.isVisibleOnThePreviewScene()){
      object.mesh.visible = false;
      if (!keepPhysicsValue){
        if (!object.noMass){
          setTimeout(function(){
            physicsWorld.removeBody(object.physicsBody);
            object.physicsKeptWhenHidden = false;
          });
        }
      }else{
        object.physicsKeptWhenHidden = true;
      }
      object.isHidden = true;
      rayCaster.hide(object);
    }
  }
}

// show
//  Makes a hidden object or glued object visible. Does nothing if the object is
//  already visible.
Roygbiv.prototype.show = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.show, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.show, preConditions.object, object);
  if (object.isAddedObject){
    preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.show, preConditions.object, object);
    preConditions.checkIfChangeable(ROYGBIV.show, preConditions.object, object);
    if (!object.isVisibleOnThePreviewScene()){
      object.mesh.visible = true;
      if (!object.physicsKeptWhenHidden){
        if (!object.noMass){
          setTimeout(function(){
            physicsWorld.addBody(object.physicsBody);
          });
        }
      }
      object.isHidden = false;
      rayCaster.show(object);
    }
  }else if (object.isObjectGroup){
    preConditions.checkIfChangeable(ROYGBIV.show, preConditions.object, object);
    if (!object.isVisibleOnThePreviewScene()){
      object.mesh.visible = true;
      if (!object.physicsKeptWhenHidden){
        if (!object.noMass){
          setTimeout(function(){
            physicsWorld.addBody(object.physicsBody);
          });
        }
      }
      object.isHidden = false;
      rayCaster.show(object);
    }
  }
}

// applyForce
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
  REUSABLE_CANNON_VECTOR.set(force.x, force.y, force.z);
  REUSABLE_CANNON_VECTOR_2.set(point.x, point.y, point.z);
  object.physicsBody.applyImpulse(
    REUSABLE_CANNON_VECTOR,
    REUSABLE_CANNON_VECTOR_2
  );
}

// rotate
//  Rotates an object or a glued object around a given world axis by given radians.
//  The parameter axis must be one of x, y or z. Objects are rotated around
//  their own centers, so their positions do not change when rotated using this
//  function.
Roygbiv.prototype.rotate = function(object, axis, radians){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rotate, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.rotate, preConditions.axis, axis);
  axis = axis.toLowerCase();
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.rotate, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.rotate, preConditions.radians, radians);
  preConditions.checkIfAddedObjectObjectGroupParticleSystem(ROYGBIV.rotate, preConditions.object, object);
  var isObject = false;
  if ((object.isAddedObject) || (object.isObjectGroup)){
    isObject = true;
  }
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
  if ((object.isAddedObject) || (object.isObjectGroup)){
    preConditions.checkIfChangeable(ROYGBIV.rotate, preConditions.object, object);
  }
  if (object.pivotObject){
    object.rotateAroundPivotObject(axis, radians);
    return;
  }
  object.rotate(axis, radians, true);
}

// rotateAroundXYZ
//  Rotates an object or a glued object around the given (x, y, z)
//  Unlike the rotate function, the positions of the objects can change when rotated
//  using this function. If the optional skipLocalRotation flag is set, the object is
//  not rotated in its local axis system.
Roygbiv.prototype.rotateAroundXYZ = function(object, x, y, z, radians, axis, skipLocalRotation){
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
  axis = axis.toLowerCase();
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.rotateAroundXYZ, preConditions.axis, axis);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.rotateAroundXYZ, preConditions.skipLocalRotation, skipLocalRotation);
  var axisVector;
  if (axis.toLowerCase() == "x"){
    axisVector = THREE_AXIS_VECTOR_X;
  }else if (axis.toLowerCase() == "y"){
    axisVector = THREE_AXIS_VECTOR_Y;
  }else if (axis.toLowerCase() == "z"){
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
          axis,
          skipLocalRotation
        );
        return;
      }
    }
    preConditions.checkIfChangeable(ROYGBIV.rotateAroundXYZ, preConditions.object, object);
    mesh = object.mesh;
  }else if (object.isObjectGroup){
    preConditions.checkIfChangeable(ROYGBIV.rotateAroundXYZ, preConditions.object, object);
    mesh = object.mesh;
  }
  var point = REUSABLE_VECTOR.set(x, y, z);
  mesh.parent.localToWorld(mesh.position);
  mesh.position.sub(point);
  mesh.position.applyAxisAngle(axisVector, radians);
  mesh.position.add(point);
  mesh.parent.worldToLocal(mesh.position);
  if (!skipLocalRotation){
    mesh.rotateOnAxis(axisVector, radians);
  }
  if (object.isAddedObject){
    object.setPhysicsAfterRotationAroundPoint(axis, radians);
    if (object.mesh.visible){
      rayCaster.updateObject(object);
    }
  }else if (object.isObjectGroup){
    object.physicsBody.quaternion.copy(mesh.quaternion);
    object.physicsBody.position.copy(mesh.position);
    if (object.mesh.visible){
      rayCaster.updateObject(object);
    }
  }
}

// setPosition
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
  if (obj.isAddedObject){
    if (obj.parentObjectName){
      var objGroup = objectGroups[obj.parentObjectName];
      preConditions.checkIfParentExists(ROYGBIV.setPosition, null, objGroup);
      this.setPosition(objGroup, x, y, z);
      return;
    }
    preConditions.checkIfChangeable(ROYGBIV.setPosition, preConditions.obj, obj);
    obj.mesh.position.set(x, y, z);
    obj.physicsBody.position.set(x, y, z);
    if (obj.mesh.visible){
      rayCaster.updateObject(obj);
    }
  }else if (obj.isObjectGroup){
    preConditions.checkIfChangeable(ROYGBIV.setPosition, preConditions.obj, obj);
    obj.mesh.position.set(x, y, z);
    obj.graphicsGroup.position.set(x, y, z);
    obj.physicsBody.position.set(x, y, z);
    if (obj.mesh.visible){
      rayCaster.updateObject(obj);
    }
  }
}

// setMass
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
  if (typeof object.originalMass == UNDEFINED){
    object.originalMass = object.mass;
  }
  if (typeof object.mass == UNDEFINED){
    object.originalMass = 0;
    object.mass = 0;
  }
  object.setMass(mass);
  if (object.isAddedObject){
    if (mass > 0){
      dynamicObjects[object.name] = object;
    }else{
      delete dynamicObjects[object.name];
    }
  }else if (object.isObjectGroup){
    if (mass > 0){
      dynamicObjectGroups[object.name] = object;
    }else{
      delete dynamicObjectGroups[object.name];
    }
  }
}

// translate
//  Translates an object or glued object on the given axis by the given amount.
//  Axis must be one of x, y or z.
Roygbiv.prototype.translate = function(object, axis, amount){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.translate, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.translate, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.translate, preConditions.amount, amount);
  axis = axis.toLowerCase();
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.translate, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.translate, preConditions.amount, amount);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.translate, preConditions.object, object);
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
}

// opacity
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
  if (!object.initOpacitySet && (object.isAddedObject)){
    object.initOpacity = object.mesh.material.uniforms.alpha.value;
    object.initOpacitySet = true;
  }else if (!object.initOpacitySet && (object.isObjectGroup)){
    object.initOpacity = object.mesh.material.uniforms.totalAlpha.value;
    object.initOpacitySet = true;
  }
  object.incrementOpacity(delta);
  if (isAddedObject){
    if (object.mesh.material.uniforms.alpha.value < 0){
      object.updateOpacity(0);
    }
    if (object.mesh.material.uniforms.alpha.value > 1){
      object.updateOpacity(1);
    }
  }else if (isObjectGroup){
    if (object.mesh.material.uniforms.totalAlpha.value < 0){
      object.updateOpacity(0);
    }
    if (object.mesh.material.uniforms.totalAlpha.value > 1){
      object.updateOpacity(1);
    }
  }
}

// setObjectVelocity
//  Sets the velocity of an object or a glued object. The object must be a dynamic object
//  (mass > 0) in order to have a velocity.
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
  if (!(typeof axis == UNDEFINED)){
    axis = axis.toLowerCase();
    preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.setObjectVelocity, preConditions.axis, axis);
    if (axis == "x"){
      object.physicsBody.velocity.x = velocityVector.x;
    }else if (axis == "y"){
      object.physicsBody.velocity.y = velocityVector.y;
    }else if (axis == "z"){
      object.physicsBody.velocity.z = velocityVector.z;
    }
    return;
  }
  object.physicsBody.velocity.set(velocityVector.x, velocityVector.y, velocityVector.z);
}

// setObjectColor
// Modifies the color and alpha value of an object or an object group.
Roygbiv.prototype.setObjectColor = function(object, colorName, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectColor, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectColor, preConditions.object, object);
  preConditions.checkIfColorizable(ROYGBIV.setObjectColor, preConditions.object, object);
  preConditions.checkIfDefined(ROYGBIV.setObjectColor, preConditions.colorName, colorName);
  if (typeof alpha == UNDEFINED){
    alpha = 1;
  }else{
    preConditions.checkIfNumber(ROYGBIV.setObjectColor, preConditions.alpha, alpha);
  }
  REUSABLE_COLOR.set(colorName);
  object.forceColor(REUSABLE_COLOR.r, REUSABLE_COLOR.g, REUSABLE_COLOR.b, alpha);
}

// resetObjectColor
// Resets the color and alpha value of an object or an object group.
Roygbiv.prototype.resetObjectColor = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.resetObjectColor, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.resetObjectColor, preConditions.object, object);
  preConditions.checkIfColorizable(ROYGBIV.resetObjectColor, preConditions.object, object);
  object.resetColor();
}

// setRotationPivot
// Sets a rotation pivot for an object created with createRotationPivot API.
Roygbiv.prototype.setRotationPivot = function(rotationPivot){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setRotationPivot, preConditions.rotationPivot, rotationPivot);
  preConditions.checkIfRotationPivot(ROYGBIV.setRotationPivot, preConditions.rotat, rotationPivot);
  var sourceObject = rotationPivot.sourceObject;
  if (sourceObject.pivotObject){
    rotationPivot.position.copy(sourceObject.pivotObject.position);
    rotationPivot.quaternion.copy(sourceObject.pivotObject.quaternion);
    rotationPivot.rotation.copy(sourceObject.pivotObject.rotation);
  }
  sourceObject.pivotObject = rotationPivot;
  sourceObject.pivotOffsetX = rotationPivot.offsetX;
  sourceObject.pivotOffsetY = rotationPivot.offsetY;
  sourceObject.pivotOffsetZ = rotationPivot.offsetZ;
}

// unsetRotationPivot
// Unsets a rotation pivot point for an object set with setRotationPivot API.
Roygbiv.prototype.unsetRotationPivot = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.unsetRotationPivot, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.unsetRotationPivot, preConditions.object, object);
  preConditions.checkIfHavePivotPoint(ROYGBIV.unsetRotationPivot, preConditions.object, object);
  delete object.pivotObject;
  delete object.pivotOffsetX;
  delete object.pivotOffsetY;
  delete object.pivotOffsetZ;
}

// resetObjectVelocity
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
  object.physicsBody.velocity.set(0, 0, 0);
  object.physicsBody.angularVelocity.set(0, 0, 0);
}

// PARTICLE SYSTEM FUNCTIONS ***************************************************

// createParticleMaterial
// Returns a material for a particle. The configurations are:
// color: The HTML color name of the particle. (mandatory)
// size: The size of the particle. (mandatory)
// alpha: The alpha value of the particle. (mandatory)
// textureName: The texture name of the particle, if the particle has any texture. (optional)
// rgbFilter: A vector containing RGB threshold values. Pixels that have RGB values below the
// rgbFilter values are discarded. This can be used to eliminate texture background colors etc. (optional)
// targetColor: Target color name of the particle. If set, the color of the particle changes between
// the color and the targetColor by colorStep in each frame render. (optional)
// colorStep: A float between [0,1] that represents the variation of color between the color and the
// targetColor. (optional)
Roygbiv.prototype.createParticleMaterial = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createParticleMaterial, preConditions.configurations, configurations);
  var color = configurations.color;
  var size = configurations.size;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var targetColor = configurations.targetColor;
  var colorStep = configurations.colorStep;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleMaterial, preConditions.color, color);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleMaterial, preConditions.size, size);
  preConditions.checkIfNumber(ROYGBIV.createParticleMaterial, preConditions.size, size);
  preConditions.checkIfLessThan(ROYGBIV.createParticleMaterial, preConditions.size, size, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleMaterial, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createParticleMaterial, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createParticleMaterial, preConditions.alpha, alpha, 0, 1);
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createParticleMaterial, null, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createParticleMaterial, null ,texture);
    preConditions.checkIfTextureCompressed(ROYGBIV.createParticleMaterial, null, texture);
  }
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticleMaterial, preConditions.rgbFilter, rgbFilter);
  preConditions.checkIfXExistsOnlyIfYExists(ROYGBIV.createParticleMaterial, preConditions.colorStep, preConditions.targetColor, colorStep, targetColor);
  if (!(typeof colorStep == UNDEFINED) && configurations.colorStep != 0){
    preConditions.checkIfNumber(ROYGBIV.createParticleMaterial, preConditions.colorStep, colorStep);
    preConditions.checkIfInRangeMinInclusive(ROYGBIV.createParticleMaterial, preConditions.colorStep, colorStep, 0, 1);
  }else{
    configurations.colorStep = 0;
  }
  return new ParticleMaterial(configurations);
}

// createParticle
//  Creates and returns a new particle based on following configurations:
//  position: The initial local coordinates of the particle. This is mandatory unless the motionMode is MOTION_MODE_CIRCULAR. (optional)
//  material: The material of the particle created using createParticleMaterial function. (mandatory)
//  lifetime: The expiration time in seconds of the particle. Set this to 0 for unexpirable particles. (mandatory)
//  respawn:  The particle will be respawned to its initial position after its expiration if this parameter is set to true. (mandatory)
//  alphaVariation: The variation of the alpha value of the parameter on each frame. (optional)
//  alphaVariationMode: The alpha variation formula. This can be one of ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_SIN or ALPHA_VARIATION_MODE_COS.
//  For ALPHA_VARIATION_MODE_NORMAL the alpha value changes linearly (t * alphaVariation), for ALPHA_VARIATION_MODE_SIN the alpha changes according to
//  the sine function (sin(alphaVariation * t)) and for ALPHA_VARIATION_MODE_COS the alpha value changes according to the cos function
//  (cos(alphaVariation * t)). Default value is ALPHA_VARIATION_MODE_NORMAL. (optional)
//  startDelay: The amount of delay in seconds before the particle is created. (optional)
//  trailMode: This can be set to true to achieve trail effect. Default is false. The velocity and acceleration of particles are redundant for the trail mode. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)
//  useWorldPosition: If set to true, the particle uses the world coordinates instead of local coordinates of its parent.
//  Circular motion of particles are ignored in this case. (optional)
//  velocity: The velocity vector of the particle.  This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)
//  acceleration: The acceleration vector of the particle.  This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)
//  initialAngle: The initial angle value (radians) of the particle. This is mandatory unless the motionMode is MOTION_MODE_NORMAL. (optional)
//  angularVelocity: The angular velocity (w) value of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
//  angularAcceleration: The angular acceleration value of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
//  angularMotionRadius: The radius value of the angular motion. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
//  angularQuaternion: If set this quaternion value is applied to particles with circular motion (motionMode = MOTION_MODE_CIRCULAR). By
//  default the particles that have MOTION_MODE_CIRCULAR as motionMode are initially created on the XZ plane, so the angularQuaternion parameter
//  is used to change the initial rotation of the circular motion. This value can be calculated this way:
//  angularQuaternion = ROYGBIV.computeQuaternionFromVectors(ROYGBIV.vector(0,1,0), [desired normal value]) (optional)
//  motionMode: The motion mode of the particle. This can be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR. MOTION_MODE_NORMAL represents
//  the motion with uniform acceleration and the MOTION_MODE_CIRCULAR represents the uniform circular motion. The default value is
//  MOTION_MODE_NORMAL. (optional)
Roygbiv.prototype.createParticle = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createParticle, preConditions.configurations, configurations);
  var position = configurations.position;
  var material = configurations.material;
  var lifetime = configurations.lifetime;
  var respawn = configurations.respawn;
  var alphaVariation = configurations.alphaVariation;
  var alphaVariationMode = configurations.alphaVariationMode;
  var startDelay = configurations.startDelay;
  var trailMode = configurations.trailMode;
  var useWorldPosition = configurations.useWorldPosition;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var initialAngle = configurations.initialAngle;
  var angularVelocity = configurations.angularVelocity;
  var angularAcceleration = configurations.angularAcceleration;
  var angularMotionRadius = configurations.angularMotionRadius;
  var angularQuaternion = configurations.angularQuaternion;
  var motionMode = configurations.motionMode;
  preConditions.checkIfMotionModeOnlyIfExists(ROYGBIV.createParticle, preConditions.motionMode, motionMode);
  if (typeof motionMode == UNDEFINED){
    motionMode = MOTION_MODE_NORMAL;
  }
  preConditions.checkIfXExistsOnlyIfYIsZ(ROYGBIV.createParticle, preConditions.position, preConditions.motionMode, preConditions.MOTION_MODE_NORMAL, position, motionMode, MOTION_MODE_NORMAL);
  if (motionMode == MOTION_MODE_NORMAL){
    initialAngle = 0;
    preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticle, preConditions.position, position);
  }
  preConditions.checkIfXExistsOnlyIfYIsZ(ROYGBIV.createParticle, preConditions.initialAngle, preConditions.motionMode, preConditions.MOTION_MODE_CIRCULAR, initialAngle, motionMode, MOTION_MODE_CIRCULAR);
  if (motionMode == MOTION_MODE_CIRCULAR){
    position = this.vector(0, 0, 0);
    preConditions.checkIfNumber(ROYGBIV.createParticle, preConditions.initialAngle, initialAngle);
  }
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticle, preConditions.material, material);
  preConditions.checkIfParticleMaterial(ROYGBIV.createParticle, preConditions.material, material);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticle, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticle, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createParticle, preConditions.lifetime, lifetime);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticle, preConditions.respawn, respawn);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createParticle, preConditions.respawn, respawn);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createParticle, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfAlphaVariationModeOnlyIfExists(ROYGBIV.createParticle, preConditions.alphaVariationMode, alphaVariationMode);
  if (!(typeof startDelay == UNDEFINED)){
    preConditions.checkIfNumber(ROYGBIV.createParticle, preConditions.startDelay, startDelay);
    preConditions.checkIfLessThanExclusive(ROYGBIV.createParticle, preConditions.startDelay, startDelay);
  }else{
    startDelay = 0;
  }
  if (!(typeof trailMode == UNDEFINED)){
    preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createParticle, preConditions.trailMode, trailMode);
    if (trailMode){
      preConditions.checkIfTrue(ROYGBIV.createParticle, "Lifetime must be greater than zero for trail particles.", (lifetime == 0));
      preConditions.checkIfTrue(ROYGBIV.createParticle, "respawn property must be true for trail particles.", (!respawn));
    }
  }else{
    trailMode = false;
  }
  if (!(typeof velocity == UNDEFINED)){
    preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticle, preConditions.velocity, velocity);
  }else{
    velocity = this.vector(0, 0, 0);
  }
  if (!(typeof acceleration == UNDEFINED)){
    preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticle, preConditions.acceleration, acceleration);
  }else{
    acceleration = this.vector(0, 0, 0);
  }
  if (!(typeof angularVelocity == UNDEFINED)){
    preConditions.checkIfNumber(ROYGBIV.createParticle, preConditions.angularVelocity, angularVelocity);
  }else{
    angularVelocity = 0;
  }
  if (!(typeof angularAcceleration == UNDEFINED)){
    preConditions.checkIfNumber(ROYGBIV.createParticle, preConditions.angularAcceleration, angularAcceleration);
  }else{
    angularAcceleration = 0;
  }
  if (!(typeof angularMotionRadius == UNDEFINED)){
    preConditions.checkIfNumber(ROYGBIV.createParticle, preConditions.angularMotionRadius, angularMotionRadius);
  }else{
    angularMotionRadius = 0;
  }
  if (!(typeof angularQuaternion == UNDEFINED)){
    preConditions.checkIfQuaternionOnlyIfDefined(ROYGBIV.createParticle, preConditions.angularQuaternion, angularQuaternion);
  }else{
    angularQuaternion = REUSABLE_QUATERNION.set(0, 0, 0, 1);
  }
  if (!(typeof useWorldPosition == UNDEFINED)){
    preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createParticle, preConditions.useWorldPosition, useWorldPosition);
  }else{
    useWorldPosition = false;
  }

  var particle = new Particle(position.x, position.y, position.z, material, lifetime);
  if (respawn){
    particle.respawnSet = true;
  }
  if (!(typeof alphaVariation == UNDEFINED)){
    particle.alphaDelta = alphaVariation;
  }else{
    particle.alphaDelta = 0;
  }
  if (!(typeof alphaVariationMode == UNDEFINED)){
    particle.alphaVariationMode = alphaVariationMode;
  }else{
    particle.alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL;
  }
  particle.startDelay = startDelay;
  particle.originalStartDelay = startDelay;
  particle.trailFlag = trailMode;
  particle.useWorldPositionFlag = useWorldPosition;

  // There used to be a CPU motion mode which is no longer supported so the
  // gpuMotion flag is true by default.
  particle.gpuMotion = true;
  particle.gpuVelocity = velocity;
  particle.gpuAcceleration = acceleration;
  particle.initialAngle = initialAngle;
  particle.angularVelocity = angularVelocity;
  particle.angularAcceleration = angularAcceleration;
  particle.angularMotionRadius = angularMotionRadius;
  particle.angularQuaternion = angularQuaternion;
  particle.motionMode = motionMode;
  particle.angularQuaternionX = angularQuaternion.x;
  particle.angularQuaternionY = angularQuaternion.y;
  particle.angularQuaternionZ = angularQuaternion.z;
  particle.angularQuaternionW = angularQuaternion.w;

  return particle;
}

// createParticleSystem
// Creates a new particle system based on following configurations:
// name: The unique name of the particle system. (mandatory)
// particles: An array of particles created using createParticle function. (mandatory)
// position: The initial position of the particle system. (mandatory)
// lifetime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems.(mandatory)
// velocity: The velocity vector of the particle system. This is used only if the motionMode is MOTION_MODE_NORMAL. (optional)
// acceleration: The acceleration vector of the particle. This is used only if the motionMode is MOTION_MODE_NORMAL. system (optional)
// angularVelocity: The angular velocity (w) of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
// angularAcceleration: The angular acceleration of the particle. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
// angularMotionRadius: The radius value of the imaginary circlie on which the angular motion is performed. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
// angularQuaternion: If set this quaternion value is applied to the position of this particle system if the motionMode is MOTION_MODE_CIRCULAR. By
// default the particle systems that have MOTION_MODE_CIRCULAR as motionMode are initially created on the XZ plane, so the angularQuaternion parameter
// is used to change the initial rotation of the circular motion. This value can be calculated this way:
// angularQuaternion = ROYGBIV.computeQuaternionFromVectors(ROYGBIV.vector(0,1,0), [desired normal value]) (optional)
// initialAngle: The initial angle of the circular motion. This is used only if the motionMode is MOTION_MODE_CIRCULAR. (optional)
// motionMode: The motion mode of the particle system. This can be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR. MOTION_MODE_NORMAL represents
// the motion with uniform accelerationa and the MOTION_MODE_CIRCULAR represents the circular motion with uniform acceleration. The
// default value is MOTION_MODE_NORMAL. (optional)
// updateFunction: The update function of this particle system that is executed on each render. (optional)
Roygbiv.prototype.createParticleSystem = function(configurations){
  if (mode == 0){
    return;
  }

  preConditions.checkIfTrue(ROYGBIV.createParticleSystem, "Cannot create more than "+MAX_PARTICLE_SYSTEM_COUNT+" particle systems.", (TOTAL_PARTICLE_SYSTEM_COUNT >= MAX_PARTICLE_SYSTEM_COUNT));
  preConditions.checkIfDefined(ROYGBIV.createParticleSystem, preConditions.configurations, configurations);

  var name = configurations.name;
  var particles = configurations.particles;
  var position = configurations.position;
  var lifetime = configurations.lifetime;
  var updateFunction = configurations.updateFunction;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var angularVelocity = configurations.angularVelocity;
  var angularAcceleration = configurations.angularAcceleration;
  var angularMotionRadius = configurations.angularMotionRadius;
  var angularQuaternion = configurations.angularQuaternion;
  var initialAngle = configurations.initialAngle;
  var motionMode = configurations.motionMode;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleSystem, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createParticleSystem, "name cannot contain coma.", (name.indexOf(',') !== -1));
  preConditions.checkIfTrue(ROYGBIV.createParticleSystem, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleSystem, preConditions.particles, particles);
  preConditions.checkIfEmptyArray(ROYGBIV.createParticleSystem, preConditions.particles, particles);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleSystem, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticleSystem, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createParticleSystem, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createParticleSystem, preConditions.lifetime, lifetime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createParticleSystem, preConditions.lifetime, lifetime, 0);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticleSystem, preConditions.velocity, velocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createParticleSystem, preConditions.acceleration, acceleration);
  preConditions.checkIfTrue(ROYGBIV.createParticleSystem, "Maximum allowed particle size "+MAX_VERTICES_ALLOWED_IN_A_PARTICLE_SYSTEM+" exceeded.", (particles.length >= MAX_VERTICES_ALLOWED_IN_A_PARTICLE_SYSTEM));
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createParticleSystem, preConditions.angularVelocity, angularVelocity);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createParticleSystem, preConditions.angularMotionRadius, angularMotionRadius);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createParticleSystem, preConditions.angularAcceleration, angularAcceleration);
  preConditions.checkIfQuaternionOnlyIfDefined(ROYGBIV.createParticleSystem, preConditions.angularQuaternion, angularQuaternion);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createParticleSystem, preConditions.initialAngle ,initialAngle);
  preConditions.checkIfMotionModeOnlyIfExists(ROYGBIV.createParticleSystem, preConditions.motionMode, motionMode);
  if ((typeof angularVelocity == UNDEFINED)){
    angularVelocity = 0;
  }
  if ((typeof angularAcceleration == UNDEFINED)){
    angularAcceleration = 0;
  }
  if ((typeof angularMotionRadius == UNDEFINED)){
    angularMotionRadius = 0;
  }
  if ((typeof angularQuaternion == UNDEFINED)){
    angularQuaternion = REUSABLE_QUATERNION.set(0, 0, 0, 1);
  }
  if ((typeof initialAngle == UNDEFINED)){
    initialAngle = 0;
  }
  if ((typeof motionMode == UNDEFINED)){
    motionMode = MOTION_MODE_NORMAL;
  }
  var vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0;
  if (velocity){
    vx = velocity.x;
    vy = velocity.y;
    vz = velocity.z;
  }
  if (acceleration){
    ax = acceleration.x;
    ay = acceleration.y;
    az = acceleration.z;
  }

  if (!updateFunction){
    updateFunction = null;
  }

  var particleSystem = new ParticleSystem(
    null, name, particles, position.x, position.y, position.z,
    vx, vy, vz, ax, ay, az, motionMode,
    updateFunction
  );

  particleSystem.lifetime = lifetime;
  particleSystem.angularVelocity = angularVelocity;
  particleSystem.angularAcceleration = angularAcceleration;
  particleSystem.angularMotionRadius = angularMotionRadius;
  particleSystem.angularQuaternionX = angularQuaternion.x;
  particleSystem.angularQuaternionY = angularQuaternion.y;
  particleSystem.angularQuaternionZ = angularQuaternion.z;
  particleSystem.angularQuaternionW = angularQuaternion.w;
  particleSystem.initialAngle = initialAngle;
  TOTAL_PARTICLE_SYSTEM_COUNT ++;
  return particleSystem;
}

// scale
//  Modifies the scale of a particle system.
Roygbiv.prototype.scale = function(object, scaleVector){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.scale, preConditions.scaleVector, scaleVector);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.scale, preConditions.scaleVector, scaleVector);
  preConditions.checkIfDefined(ROYGBIV.scale, preConditions.object, object);
  preConditions.checkIfParticleSystem(ROYGBIV.scale, preConditions.object, object);
  object.mesh.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);
}

// setBlending
//  Sets the blending mode of a particle system. Blending mode can be one of
//  NO_BLENDING, NORMAL_BLENDING, ADDITIVE_BLENDING, SUBTRACTIVE_BLENDING or
//  MULTIPLY_BLENDING
Roygbiv.prototype.setBlending = function(particleSystem, blendingMode){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setBlending, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.setBlending, preConditions.blendingMode, blendingMode);
  preConditions.checkIfParticleSystem(ROYGBIV.setBlending, preConditions.particleSystem, particleSystem);
  preConditions.checkIfBlending(ROYGBIV.setBlending, preConditions.blendingMode, blendingMode);
  particleSystem.setBlending(blendingMode);
}

// setParticleSystemRotation
//  Sets the rotation of a particle system around given axis.
Roygbiv.prototype.setParticleSystemRotation = function(particleSystem, axis, radians){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.radians, radians);
  axis = axis.toLowerCase();
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.setParticleSystemRotation, preConditions.axis, axis);
  preConditions.checkIfNumber(ROYGBIV.setParticleSystemRotation, preConditions.radians, radians);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem is not visible", (!particleSystem.mesh.visible));
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a collision callback attached. Cannot set rotation.", particleSystem.checkForCollisions);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a collidable particle. Cannot set rotation.", particleSystem.particlesWithCollisionCallbacks.size > 0);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a trailed particle. Cannot set rotation.", particleSystem.hasTrailedParticle);
  preConditions.checkIfTrue(ROYGBIV.setParticleSystemRotation, "particleSystem has a defined motion. Cannot set rotation.", (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 || particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0));
  if (axis == "x"){
    particleSystem.mesh.rotation.x = radians;
  }else if (axis == "y"){
    particleSystem.mesh.rotation.y = radians;
  }else if (axis == "z"){
    particleSystem.mesh.rotation.z = radians;
  }
  particleSystem.hasManualRotationSet = true;
}

// setParticleSystemQuaternion
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
  particleSystem.mesh.quaternion.set(quatX, quatY, quatZ, quatW);
  particleSystem.hasManualQuaternionSet = true;
}

// kill
//  Destroys a particle or a particle system.
Roygbiv.prototype.kill = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.kill, preConditions.object, object);
  preConditions.checkIfParticleOrParticleSystem(ROYGBIV.kill, preConditions.object, object);
  if (object.isParticle){
    object.isExpired = true;
    if (object.parent){
      object.parent.removeParticle(object);
      object.parent.destroyedChildCount ++;
      if (object.parent.destroyedChildCount == object.parent.particles.length){
        object.parent.destroy();
        delete particleSystems[object.parent.name];
        delete particleSystemPool[object.parent.name];
        TOTAL_PARTICLE_SYSTEM_COUNT --;
      }
    }
  }else if (object.isParticleSystem){
    object.destroy();
    delete particleSystems[object.name];
    delete particleSystemPool[object.name];
    TOTAL_PARTICLE_SYSTEM_COUNT --;
  }
}

// createSmoke
//  Returns a new smoke like particle system based on following configurations:
//  name: The unique name of the particle system (mandatory)
//  position: The initial position of the particle system (mandatory)
//  expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)
//  smokeSize: Size of the smoke source (mandatory)
//  particleSize: The size of each smoke particle (mandatory)
//  particleCount: Count of smoke particles (mandatory)
//  colorName: Color name of each particle (mandatory)
//  textureName: Name of the smoke texture (optional)
//  movementAxis: The axis vector on which the smoke particles move. Default value is (0,1,0) (optional)
//  velocity: The average velocity of particles on the movementAxis (mandatory)
//  acceleration: The average acceleration of particles on the movementAxis (mandatory)
//  randomness: A number representing the turbulence factor of the smoke particles (mandatory)
//  lifetime: The average lifetime of particles (mandatory)
//  alphaVariation: A number between -1 and 0 represents the variaton of alpha of the smoke particles on each frame (mandatory)
//  accelerationDirection: The direction vector of acceleration. If set, the smoke is accelerated
//  along this vector instead of the movementAxis This can be used to achieve
//  realistic smoke movement on inclined surfaces or to simulate winds. (optional)
//  updateFunction: The update function of the particle system that will be executed on each frame render. (optional)
//  startDelay: The average delay in seconds before the particles are visible on the screen. (optional)
//  rgbFilter: This can be used to eliminate texture background colors. (optional)
Roygbiv.prototype.createSmoke = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createSmoke, preConditions.configurations, configurations);
  var smokeSize = configurations.smokeSize;
  var name = configurations.name;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createSmoke, "name must be unique", particleSystemPool[name]);
  var position = configurations.position;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createSmoke, preConditions.position, position);
  var expireTime = configurations.expireTime;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createSmoke, preConditions.expireTime, expireTime, 0);
  var smokeSize = configurations.smokeSize;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.smokeSize, smokeSize);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.smokeSize, smokeSize);
  var particleSize = configurations.particleSize;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.particleSize, particleSize);
  var particleCount = configurations.particleCount;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createSmoke, preConditions.particleCount, particleCount);
  var colorName = configurations.colorName;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.colorName, colorName);
  var textureName = configurations.textureName;
  var isTextured = false;
  var texture;
  if (!(typeof textureName == UNDEFINED)){
    preConditions.checkIfTrue(ROYGBIV.createSmoke, "No such texture", (!textures[textureName]));
    texture = textures[textureName];
    preConditions.checkIfTextureReady(ROYGBIV.createSmoke, preConditions.texture, texture);
    isTextured = true;
  }
  var movementAxis = configurations.movementAxis;
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createSmoke, preConditions.movementAxis, movementAxis);
  if ((typeof movementAxis == UNDEFINED)){
    movementAxis = ROYGBIV.vector(0, 1, 0);
  }
  var velocity = configurations.velocity;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.velocity, velocity);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.velocity, velocity);
  var acceleration = configurations.acceleration;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.acceleration, acceleration);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.acceleration, acceleration);
  var randomness = configurations.randomness;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.randomness, randomness);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.randomness, randomness);
  var lifetime = configurations.lifetime;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.lifetime, lifetime);
  preConditions.checkIfLessThan(ROYGBIV.createSmoke, preConditions.lifetime, lifetime, 0);
  var alphaVariation = configurations.alphaVariation;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSmoke, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfNumber(ROYGBIV.createSmoke, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfInRange(ROYGBIV.createSmoke, preConditions.alphaVariation, alphaVariation, -1, 1);
  var updateFunction = configurations.updateFunction;
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createSmoke, preConditions.updateFunction, updateFunction);
  var startDelay = configurations.startDelay;
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createSmoke, preConditions.startDelay, startDelay);
  if (typeof startDelay == UNDEFINED){
    startDelay = 0;
  }
  var rgbFilter = configurations.rgbFilter;
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createSmoke, preConditions.rgbFilter, rgbFilter);
  var accelerationDirection = configurations.accelerationDirection;
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createSmoke, preConditions.accelerationDirection, accelerationDirection);

  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 1;
  if (isTextured){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }

  var quat = ROYGBIV.computeQuaternionFromVectors(
    ROYGBIV.vector(0, 1, 0),
    movementAxis
  );
  var quaternion2, quaternionInverse;
  var referenceVector = ROYGBIV.vector(0, 1, 0);
  var referenceQuaternion = this.computeQuaternionFromVectors(
    this.vector(0, 0, 1), referenceVector
  );
  if (accelerationDirection){
    quaternion2 = this.computeQuaternionFromVectors(referenceVector, accelerationDirection);
    quaternionInverse = quat.clone().inverse();
  }

  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);

  var particles = [];
  var particleConfigurations = new Object();
  for (var i = 0; i<particleCount; i++){
    particleConfigurations.position = this.applyNoise(this.circularDistribution(smokeSize, referenceQuaternion));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = lifetime * Math.random();
    particleConfigurations.respawn = true;
    particleConfigurations.alphaVariation = alphaVariation;
    particleConfigurations.startDelay = startDelay * Math.random();
    var decidedVelocity = this.vector(0, velocity * Math.random(), 0);
    var decidedAcceleration = this.vector(
      randomness * (Math.random() - 0.5),
      acceleration * Math.random(),
      randomness * (Math.random() - 0.5)
    );
    if (!accelerationDirection){
      particleConfigurations.velocity = decidedVelocity;
      particleConfigurations.acceleration = decidedAcceleration;
    }else{
      REUSABLE_VECTOR_4.set(decidedAcceleration.x, decidedAcceleration.y, decidedAcceleration.z);
      REUSABLE_VECTOR_4.applyQuaternion(quaternionInverse);
      REUSABLE_VECTOR_4.applyQuaternion(quaternion2);
      particleConfigurations.velocity = decidedVelocity;
      particleConfigurations.acceleration = this.vector(
        REUSABLE_VECTOR_4.x, REUSABLE_VECTOR_4.y, REUSABLE_VECTOR_4.z
      );
    }
    particles.push(this.createParticle(particleConfigurations));
  }

  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  if (updateFunction){
    particleSystemConfigurations.updateFunction = updateFunction;
  }

  var smoke = this.createParticleSystem(particleSystemConfigurations);
  smoke.mesh.applyQuaternion(quat);
  return smoke;
}

// createTrail
//  Creates a trail particle system. The configurations are:
//  name: The unique name of the particle system. (mandatory)
//  position: The initial position of the particle system. (mandatory)
//  expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)
//  particleCount: The count of particles in the particle system. (mandatory)
//  velocity: The velocity of the particle system. (mandatory)
//  acceleration: The acceleration of the particle system. (mandatory)
//  lifetime: The average lifetime of the particles. This can be set to zero for infinite particles (mandatory)
//  alphaVariation: The average variation of alpha of particles on each frame. Expected value is between [-1,0] (mandatory)
//  startDelay: The average start delay of particles. (mandatory)
//  colorName: The HTML color name of particles. (mandatory)
//  particleSize: The size of each particle. (mandatory)
//  size: The size of the particle system. (mandatory)
//  textureName: Name of the texture mapped to particles. (optional)
//  rgbFilter: This can be used to eliminate texture background colors. (optional)
//  targetColor: Target color name of the particle. If set, the color of the particle changes
//  between the color and the targetColor by colorStep in each frame render. (optional)
//  colorStep: A float between [0,1] that represents the variation of color between the color and the
//  targetColor. (optional)
//  updateFunction: The update function of the particle system that is executed on each frame render. (optional)
Roygbiv.prototype.createTrail = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createTrail, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var particleCount = configurations.particleCount;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var lifetime = configurations.lifetime;
  var alphaVariation = configurations.alphaVariation;
  var startDelay = configurations.startDelay;
  var colorName = configurations.colorName;
  var particleSize = configurations.particleSize;
  var size = configurations.size;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var targetColor = configurations.targetColor;
  var colorStep = configurations.colorStep;
  var updateFunction = configurations.updateFunction;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createTrail, "name must be unique", particleSystemPool[name]);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createTrail, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createTrail, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createTrail, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.velocity, velocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createTrail, preConditions.velocity, velocity);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.acceleration, acceleration);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createTrail, preConditions.acceleration, acceleration);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.lifetime, lifetime);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfInRange(ROYGBIV.createTrail, preConditions.alphaVariation, alphaVariation, -1, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.startDelay, startDelay);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.startDelay, startDelay);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createTrail, preConditions.startDelay, startDelay);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.colorName, colorName);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createTrail, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createTrail, preConditions.size, size);
  preConditions.checkIfNumber(ROYGBIV.createTrail, preConditions.size, size);
  preConditions.checkIfLessThan(ROYGBIV.createTrail, preConditions.size, size);
  var texture;
  if (!(typeof textureName == UNDEFINED)){
    texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createTrail, preConditions.texture, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createTrail, preConditions.texture, texture);
  }
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createTrail, preConditions.rgbFilter, rgbFilter);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createTrail, preConditions.updateFunction, updateFunction);

  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 1;
  particleMaterialConfigurations.targetColor = targetColor;
  particleMaterialConfigurations.colorStep = colorStep;
  if (textureName){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }

  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);

  var particles = [];
  var particleConfigurations = new Object();
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.applyNoise(this.sphericalDistribution(size));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = lifetime * Math.random();
    particleConfigurations.respawn = true;
    particleConfigurations.alphaVariation = alphaVariation;
    particleConfigurations.startDelay = startDelay * Math.random();
    particleConfigurations.trailMode = true;
    particleConfigurations.useWorldPosition = true;
    particles.push(this.createParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.createParticleSystem(particleSystemConfigurations);
}

// createPlasma
// Returns a plasma like particle system (see Doom 4 - plasma rifle). The configurations are:
// name: The unique name of the particle system. (mandatory)
// position: The initial position of the particle system. (mandatory)
// expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for infinite particle systems. (mandatory)
// velocity: The velocity of the particle system. (mandatory)
// acceleration: The acceleration of the particle system. (mandatory)
// radius: The radius of the plasma. (mandatory)
// avgParticleSpeed: The average circular velocity of particles. (mandatory)
// particleCount: The count of particles. (mandatory)
// particleSize: The size of particles. (mandatory)
// alpha: The alpha value of particles. Default value is 1.(optional)
// colorName: The HTML color name of plasma particles. (mandatory)
// textureName: The texture name of plasma particles. (optional)
// rgbFilter: This can be used to eliminate texture background colors. (optional)
// alphaVariation: If set, the alpha value of particles would change according to the formula: sin(alphaVariation * t) (optional)
Roygbiv.prototype.createPlasma = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createPlasma, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var radius = configurations.radius;
  var avgParticleSpeed = configurations.avgParticleSpeed;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var alpha = configurations.alpha;
  var colorName = configurations.colorName;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var alphaVariation = configurations.alphaVariation;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.name, name);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createPlasma, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createPlasma, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createPlasma, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.velocity, velocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createPlasma, preConditions.velocity, velocity);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.acceleration, acceleration);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createPlasma, preConditions.acceleration, acceleration);
  preConditions.checkIfDefined(ROYGBIV.createPlasma, preConditions.radius, radius);
  preConditions.checkIfNumber(ROYGBIV.createPlasma, preConditions.radius, radius);
  preConditions.checkIfLessThan(ROYGBIV.createPlasma, preConditions.radius, radius, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.avgParticleSpeed, avgParticleSpeed);
  preConditions.checkIfNumber(ROYGBIV.createPlasma, preConditions.avgParticleSpeed, avgParticleSpeed);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createPlasma, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createPlasma, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.colorName, colorName);
  var isTextured = false;
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createPlasma, preConditions.texture, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createPlasma, preConditions.texture, texture);
    isTextured = true;
  }
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createPlasma, preConditions.particleSize, particleSize);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createPlasma, preConditions.alpha, alpha);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.createPlasma, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createPlasma, preConditions.rgbFilter, rgbFilter);
  if (typeof alpha == UNDEFINED){
    alpha = 1;
  }
  var alphaVariationSet = false;
  if (!(typeof alphaVariation == UNDEFINED)){
    preConditions.checkIfNumber(ROYGBIV.createPlasma, preConditions.alphaVariation, alphaVariation);
    alphaVariationSet = true;
  }
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  if (isTextured){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }

  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  if (alphaVariationSet){
    particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_SIN;
    particleConfigurations.alphaVariation = alphaVariation;
  }
  particleConfigurations.motionMode = MOTION_MODE_CIRCULAR;
  particleConfigurations.angularMotionRadius = radius;
  var tmpVec = ROYGBIV.vector(0, 1, 0);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.angularVelocity = avgParticleSpeed * (Math.random() - 0.5);
    particleConfigurations.initialAngle = 360 * Math.random();
    particleConfigurations.angularQuaternion = ROYGBIV.computeQuaternionFromVectors(
      tmpVec, ROYGBIV.vector(
        radius * (Math.random() - 0.5), radius * (Math.random() - 0.5) , radius * (Math.random() - 0.5)
      ));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = 0;
    particleConfigurations.respawn = false;
    particles.push(this.createParticle(particleConfigurations));
  }

  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.lifetime = expireTime;
  return this.createParticleSystem(particleSystemConfigurations);
}

// createFireExplosion
// Returns a fire explosion particle system. The configurations are:
// position: The initial position of the particle system. (mandatory)
// expireTime: The maximum lifetime of the particle system in seconds. This can be set to 0 for
// infinite particle systems. (mandatory)
// name: The unique name of the particle system. (mandatory)
// radius: The radius of the explosion. (mandatory)
// particleSize: The size of each explosion particles. (mandatory)
// particleCount: Count of explosion particles. (mandatory)
// fireColorName: The fire color name of the explosion. Default value is white. (optional)
// smokeColorName: The smoke color name of the explosion. Default value is black. (optional)
// colorStep: The variaton of color between the fire color and the smoke color on each frame.
// The value is expected to be between [0, 1]. (mandatory)
// alphaVariationCoef: The alpha variation coefficient of the particle system. The alpha value
// of the explosion particles vary by sin(alphaVariationCoef * time) on each frame. (mandatory)
// explosionDirection: The direction vector of the explosion. (mandatory)
// explosionSpeed: The speed coefficient of explosion. (mandatory)
// lifetime: The average lifetime of the explosion particles. (mandatory)
// accelerationDirection: The direction vector of acceleration. If set, the explosion is accelerated
// along this vector instead of the explosionDirection. This can be used to achieve
// realistic smoke movement for explosions on inclined surfaces or to simulate winds. (optional)
// textureName: Name of the explosion fire texture. (optional)
// rgbFilter: This can be used to eliminate texture background colors. (optional)
// updateFunction: The update function of the particle system that will be executed on each
// frame render. (optional)
Roygbiv.prototype.createFireExplosion = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createFireExplosion, preConditions.configurations, configurations);
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var name = configurations.name;
  var radius = configurations.radius;
  var particleSize = configurations.particleSize;
  var particleCount = configurations.particleCount;
  var fireColorName = configurations.fireColorName;
  var smokeColorName = configurations.smokeColorName;
  var colorStep = configurations.colorStep;
  var alphaVariationCoef = configurations.alphaVariationCoef;
  var explosionDirection = configurations.explosionDirection;
  var explosionSpeed = configurations.explosionSpeed;
  var lifetime = configurations.lifetime;
  var accelerationDirection = configurations.accelerationDirection;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createFireExplosion, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createFireExplosion, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createFireExplosion, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.radius, radius);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.radius, radius);
  preConditions.checkIfLessThan(ROYGBIV.createFireExplosion, preConditions.radius, radius);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createFireExplosion, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createFireExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.colorStep, colorStep);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.colorStep, colorStep);
  preConditions.checkIfInRange(ROYGBIV.createFireExplosion, preConditions.colorStep, colorStep, 0, 1);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.alphaVariationCoef, alphaVariationCoef);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.alphaVariationCoef, alphaVariationCoef);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.explosionDirection, explosionDirection);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createFireExplosion, preConditions.explosionDirection, explosionDirection);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.explosionSpeed, explosionSpeed);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.explosionSpeed, explosionSpeed);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createFireExplosion, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createFireExplosion, preConditions.lifetime, lifetime);
  preConditions.checkIfLessThan(ROYGBIV.createFireExplosion, preConditions.lifetime, lifetime, 0);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createFireExplosion, preConditions.accelerationDirection, accelerationDirection);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createFireExplosion, preConditions.rgbFilter, rgbFilter);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createFireExplosion, preConditions.updateFunction, updateFunction);
  if (typeof fireColorName == UNDEFINED){
    fireColorName = "white";
  }
  if (typeof smokeColorName == UNDEFINED){
    smokeColorName = "black";
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createFireExplosion, preConditions.texture, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createFireExplosion, preConditions.texture, texture);
  }
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = fireColorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 0;
  particleMaterialConfigurations.targetColor = smokeColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  var defaultNormal = this.vector(0, 1, 0);
  var referenceQuaternion = this.computeQuaternionFromVectors(
    this.vector(0, 0, 1), defaultNormal
  );
  var quaternion = this.computeQuaternionFromVectors(defaultNormal, explosionDirection);
  var quaternionInverse;
  var quaternion2;
  if (accelerationDirection){
    quaternion2 = this.computeQuaternionFromVectors(defaultNormal, accelerationDirection);
    quaternionInverse = quaternion.clone().inverse();
  }
  particleConfigurations.material = particleMaterial;
  particleConfigurations.respawn = true;
  particleConfigurations.alphaVariation = alphaVariationCoef;
  particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_SIN;
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.applyNoise(this.circularDistribution(radius));
    particleConfigurations.lifetime = lifetime * Math.random();
    particleConfigurations.startDelay = (Math.random() / 5);
    var particle = this.createParticle(particleConfigurations);
    particles.push(particle);
    var x = explosionSpeed * (Math.random() - 0.5);
    var y = (explosionSpeed / 2) * Math.random();
    var z = explosionSpeed * (Math.random() - 0.5);
    var velocity = this.vector(x, y, z);
    var acceleration = this.vector((-1 * x / 1.5), (Math.random() * explosionSpeed), (-1 * z / 1.5));
    if (accelerationDirection){
      REUSABLE_VECTOR_4.set(acceleration.x, acceleration.y, acceleration.z);
      REUSABLE_VECTOR_4.applyQuaternion(quaternionInverse);
      REUSABLE_VECTOR_4.applyQuaternion(quaternion2);
      particleConfigurations.velocity = velocity;
      particleConfigurations.acceleration = this.vector(
        REUSABLE_VECTOR_4.x, REUSABLE_VECTOR_4.y, REUSABLE_VECTOR_4.z
      );
    }else{
      particleConfigurations.velocity = velocity;
      particleConfigurations.acceleration = acceleration;
    }
  }

  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.lifetime = expireTime;
  var explosion = this.createParticleSystem(particleSystemConfigurations);
  explosion.mesh.applyQuaternion(quaternion);
  return explosion;
}

// createMagicCircle
// Creates a magic circle effect. Configurations are:
// name: The unique name of the circle. (mandatory)
// position: The center position of the circle. (mandatory)
// particleCount: The count of particles. (mandatory)
// expireTime: The expiration time of the circle. (mandatory)
// speed: The turning speed value of the particles. (mandatory)
// acceleration: The turning acceleration value of the particles. (mandatory)
// radius: The radius of the circle. (mandatory)
// circleNormal: The normal vector of the circle. By default the circle is located on the XZ plane (normal: (0,1,0)). (optional)
// circleDistortionCoefficient: The average distortion value of the circle. If this is not set, the particles form a perfect circle. (optional)
// lifetime: The lifetime of the particles. For the magic circles the respawn flag is always true so the lifetime value can be used to achieve
// color changes from target color to the initial color. In that case the period value of the circular motion can be used:
// T = (2 * PI) / (angular velocity) (optional)
// angleStep: The angular difference between the particles (Math.PI/k). This can be set to zero for randomly distributed particles. Default value is 0.
// angleStep can be useful to achieve circular trail effects. (optional)
// particleSize: The size of particles. (mandatory)
// colorName: The HTML color name of the particles. (mandatory)
// targetColorName: The target color name of the particles. (optional)
// colorStep: The color step value of the particles between [0,1]. (optional)
// alpha: The alpha value of the particles. (mandatory)
// alphaVariation: The variaton of alpha value of the particle on each frame. (optional)
// alphaVariationMode: The alpha variation formula. This can be one of ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_SIN or ALPHA_VARIATION_MODE_COS.
// For ALPHA_VARIATION_MODE_NORMAL the alpha value changes linearly (t * alphaVariation), for ALPHA_VARIATION_MODE_SIN the alpha changes according to
// the sine function (sin(alphaVariation * t)) and for ALPHA_VARIATION_MODE_COS the alpha value changes according to the cos function
// (cos(alphaVariation * t)). Default value is ALPHA_VARIATION_MODE_NORMAL. (optional)
// textureName: The name of texture of the particles. (optional)
// rgbFilter: This can be used to eliminate texture background colors. (optional)
// updateFunction: The update function of the particle system that is executed on each frame render. (optional)
Roygbiv.prototype.createMagicCircle = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createMagicCircle, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var expireTime = configurations.expireTime;
  var speed = configurations.speed;
  var acceleration = configurations.acceleration;
  var radius = configurations.radius;
  var circleNormal = configurations.circleNormal;
  var circleDistortionCoefficient = configurations.circleDistortionCoefficient;
  var lifetime = configurations.lifetime;
  var angleStep = configurations.angleStep;
  var particleSize = configurations.particleSize;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var alpha = configurations.alpha;
  var alphaVariation = configurations.alphaVariation;
  var alphaVariationMode = configurations.alphaVariationMode;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createMagicCircle, "name must be unique.", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createMagicCircle, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createMagicCircle, preConditions.particleCount, particleCount);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createMagicCircle, preConditions.expireTime, expireTime);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.speed, speed);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.speed, speed);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.acceleration, acceleration);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.acceleration, acceleration);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.radius, radius);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.radius, radius);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createMagicCircle, preConditions.circleNormal, circleNormal);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.circleDistortionCoefficient, circleDistortionCoefficient);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.lifetime, lifetime);
  preConditions.checkIfLessThanExclusiveOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.lifetime, lifetime, 0);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.angleStep, angleStep);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createMagicCircle, preConditions.particleSize, particleSize);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.colorName, colorName);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.colorStep, colorStep);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.createMagicCircle, preConditions.colorStep, colorStep, 0, 1);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createMagicCircle, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createMagicCircle, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createMagicCircle, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfAlphaVariationModeOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.alphaVariationMode, alphaVariationMode);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createMagicCircle, preConditions.rgbFilter, rgbFilter);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createMagicCircle, preConditions.updateFunction, updateFunction);
  if (typeof circleNormal == UNDEFINED){
    circleNormal = this.vector(0, 1, 0);
  }
  if (typeof circleDistortionCoefficient == UNDEFINED){
    circleDistortionCoefficient = 1;
  }
  if (typeof lifetime == UNDEFINED){
    lifetime = 0;
  }
  if (typeof angleStep == UNDEFINED){
    angleStep = 0;
  }
  if (typeof alphaVariation == UNDEFINED){
    alphaVariation = 0;
  }
  if (typeof alphaVariationMode == UNDEFINED){
    alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL;
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createMagicCircle, preConditions.texture, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createMagicCircle, preConditions.texture, texture);
  }

  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.angularVelocity = speed;
  particleConfigurations.angularAcceleration = acceleration;
  particleConfigurations.lifetime = lifetime;
  particleConfigurations.respawn = true;
  particleConfigurations.motionMode = MOTION_MODE_CIRCULAR;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.alphaVariationMode = alphaVariationMode;
  var referenceQuaternion = this.computeQuaternionFromVectors(
    this.vector(0, 1, 0), circleNormal
  );
  var angularCounter = 0;
  for (var i = 0; i<particleCount; i++){
    particleConfigurations.angularMotionRadius = radius +
                      (circleDistortionCoefficient * (Math.random() - 0.5));
    if (angleStep == 0){
      particleConfigurations.initialAngle = 1000 * Math.random();
    }else{
      particleConfigurations.initialAngle = angularCounter;
      angularCounter += angleStep;
    }
    particleConfigurations.angularQuaternion = referenceQuaternion;
    particles.push(this.createParticle(particleConfigurations));
  }

  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.createParticleSystem(particleSystemConfigurations);

}

// createCircularExplosion
// Creates a circular explosion effect. The configurations are:
// name: The unique name of the particle system. (mandatory)
// particleCount: The count of particles. (mandatory)
// position: The center position of the explosion. (mandatory)
// radius: The initial radius of the explosion. (mandatory)
// colorName: The color name of the particles. (mandatory)
// targetColorName: The target color name of the particles. (optional)
// colorStep: The variation of color between colorName and targetColorName on each frame.
// The expected value is between [0, 1]. (optional)
// particleSize: The size of particles. (mandatory)
// alpha: The alpha value of particles. (mandatory)
// textureName: The name of texture of the particles. (optional)
// rgbFilter: This can be used to eliminate texture background colors. (optional)
// alphaVariation: The alpha variaton of particles. The expected value is between [-1, 0] (mandatory)
// speed: The speed value of explosion. (mandatory)
// normal: The normal vector of the explosion. The default value is (0, 1, 0) (optional)
// expireTime: The expiration time of the particle system. This can be set 0 for infinite particle systems. (mandatory)
// updateFunction: The update function of the particle system that is executed on each frame render. (optional)
Roygbiv.prototype.createCircularExplosion = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createCircularExplosion, preConditions.configurations, configurations);
  var name = configurations.name;
  var particleCount = configurations.particleCount;
  var position = configurations.position;
  var radius = configurations.radius;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var particleSize = configurations.particleSize;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var alphaVariation = configurations.alphaVariation;
  var speed = configurations.speed;
  var normal = configurations.normal;
  var expireTime = configurations.expireTime;
  var updateFunction = configurations.updateFunction;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createCircularExplosion, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createCircularExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createCircularExplosion, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createCircularExplosion, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.radius, radius);
  preConditions.checkIfNumber(ROYGBIV.createCircularExplosion, preConditions.radius, radius);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.colorName, colorName);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createCircularExplosion, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createCircularExplosion, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createCircularExplosion, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createCircularExplosion, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createCircularExplosion, preConditions.rgbFilter, rgbFilter);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfNumber(ROYGBIV.createCircularExplosion, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfInRange(ROYGBIV.createCircularExplosion, preConditions.alphaVariation, alphaVariation, -1, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.speed, speed);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createCircularExplosion, preConditions.normal, normal);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCircularExplosion, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createCircularExplosion, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createCircularExplosion, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createCircularExplosion, preConditions.updateFunction, updateFunction);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createCircularExplosion, preConditions.colorStep, colorStep);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.createCircularExplosion, preConditions.colorStep, colorStep, 0, 1);
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createCircularExplosion, preConditions.texture, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createCircularExplosion, preConditions.texture, texture);
  }
  if ((typeof normal == UNDEFINED)){
    normal = this.vector(0, 1, 0);
  }
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = 0;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.respawn = false;
  var quat = this.computeQuaternionFromVectors(this.vector(0, 0, 1), normal);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.circularDistribution(radius, quat);
    var velocity = this.moveTowards(position, particleConfigurations.position, 1);
    particleConfigurations.velocity = this.multiplyScalar(velocity, speed);
    particleConfigurations.acceleration = particleConfigurations.velocity;
    particles.push(this.createParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.createParticleSystem(particleSystemConfigurations);
}

// createDynamicTrail
// Creates a dynamic trail effect. Unlike normal trails, the particles of dynamic
// trails may have their unique velocities and accelerations. This may be useful to achieve
// smoke trails and fireballs that follow a linear path. Configurations are:
// name: The unique name of the particle system. (mandatory)
// position: The initial position of the trail. (mandatory)
// expireTime: The maximum lifetime of the trail in seconds. Expected value is greater than zero. (mandatory)
// particleCount: The particle count of the trail. (mandatory)
// size: The size of the trail. (mandatory)
// particleSize: The size of each trail particles. (mandatory)
// startDelay: The average delay of creation of trail particles in seconds. (mandatory)
// lifetime: The time passed in seconds before the particles are respawned. If set to 0 the trail would eventually be disappeared. (mandatory)
// velocity: The velocity vector of the trail. (mandatory)
// acceleration: The acceleration vector of the trail. (mandatory)
// randomness: The randomness of trail particles. (mandatory)
// alphaVariation: The average alpha variaton of trail particles. Expected value is between [-1, 0] (mandatory)
// colorName: The initial color name of trail particles. (mandatory)
// targetColorName: The target color name of trail particles. (optional)
// colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)
// textureName: The texture name of trail particles. (optional)
// rgbFilter: This can be used to eliminate texture background colors. (optional)
// updateFunction: The update function of the particle system that is executed on each frame render. (optional)
Roygbiv.prototype.createDynamicTrail = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createDynamicTrail, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var particleCount = configurations.particleCount;
  var size = configurations.size;
  var particleSize = configurations.particleSize;
  var startDelay = configurations.startDelay;
  var lifetime = configurations.lifetime;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var randomness = configurations.randomness;
  var alphaVariation = configurations.alphaVariation;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createDynamicTrail, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createDynamicTrail, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThan(ROYGBIV.createDynamicTrail, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createDynamicTrail, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.size, size);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.size, size);
  preConditions.checkIfLessThan(ROYGBIV.createDynamicTrail, preConditions.size, size, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createDynamicTrail, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.startDelay, startDelay);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.startDelay, startDelay);
  preConditions.checkIfLessThan(ROYGBIV.createDynamicTrail, preConditions.startDelay, startDelay, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.lifetime, lifetime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createDynamicTrail, preConditions.lifetime, lifetime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.velocity, velocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createDynamicTrail, preConditions.velocity, velocity);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.acceleration, acceleration);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createDynamicTrail, preConditions.acceleration, acceleration);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.randomness, randomness);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.randomness, randomness);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfNumber(ROYGBIV.createDynamicTrail, preConditions.alphaVariation, alphaVariation);
  preConditions.checkIfInRange(ROYGBIV.createDynamicTrail, preConditions.alphaVariation, alphaVariation, -1, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createDynamicTrail, preConditions.colorName, colorName);
  preConditions.checkIfXExistsOnlyIfYExists(ROYGBIV.createDynamicTrail, preConditions.colorStep, preConditions.targetColorName, colorStep, targetColorName);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createDynamicTrail, preConditions.colorStep, colorStep);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.createDynamicTrail, preConditions.colorStep, colorStep, 0, 1);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createDynamicTrail, preConditions.rgbFilter, rgbFilter);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.createDynamicTrail, preConditions.updateFunction, updateFunction);
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    preConditions.checkIfTextureExists(ROYGBIV.createDynamicTrail, preConditions.texture, texture);
    preConditions.checkIfTextureReady(ROYGBIV.createDynamicTrail, preConditions.texture, texture);
  }
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 1;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = lifetime;
  particleConfigurations.respawn = true;
  particleConfigurations.useWorldPosition = true;
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.sphericalDistribution(size);
    particleConfigurations.startDelay = startDelay * Math.random();
    particleConfigurations.velocity = this.vector(
      randomness * (Math.random() - 0.5),
      randomness * (Math.random() - 0.5),
      randomness * (Math.random() - 0.5)
    );
    particleConfigurations.acceleration = this.vector(
      randomness * (Math.random() - 0.5),
      randomness * (Math.random() - 0.5),
      randomness * (Math.random() - 0.5)
    );
    particleConfigurations.alphaVariation = alphaVariation;
    particles.push(this.createParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.createParticleSystem(particleSystemConfigurations);
}

// createObjectTrail
// Creates an object trail effect based on following configurations:
// object: The object or object group to which the trail effect is added. (mandatory)
// alpha: The alpha value of trails between [0,1]. (mandatory)
// maxTimeInSeconds: Maximum trail time in seconds. The default value is 0.25 (optional)
Roygbiv.prototype.createObjectTrail = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createObjectTrail, preConditions.configurations, configurations);
  var object = configurations.object;
  var alpha = configurations.alpha;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createObjectTrail, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.createObjectTrail, preConditions.object, object);
  preConditions.checkIfChildObjectOnlyIfExists(ROYGBIV.createObjectTrail, preConditions.object, object);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createObjectTrail, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createObjectTrail, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createObjectTrail, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfTrue(ROYGBIV.createObjectTrail, "A trail is already added to object.", (objectTrails[object.name]));
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createObjectTrail, preConditions.maxTimeInSeconds, configurations.maxTimeInSeconds);
  preConditions.checkIfLessThanOnlyIfExists(ROYGBIV.createObjectTrail, preConditions.maxTimeInSeconds, configurations.maxTimeInSeconds, 0);
  preConditions.checkIfLessThanExclusiveOnlyIfExists(ROYGBIV.createObjectTrail, preConditions.maxTimeInSeconds, configurations.maxTimeInSeconds, (1/60));
  preConditions.checkIfTrueOnlyIfYExists(ROYGBIV.createObjectTrail, "maxTimeInSeconds must not be greater than one", configurations.maxTimeInSeconds, (configurations.maxTimeInSeconds > 1));
  new ObjectTrail(configurations);
  return;
}

// destroyObjectTrail
// Destroys the trail effect of an object created using the createObjectTrail function.
Roygbiv.prototype.destroyObjectTrail = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.destroyObjectTrail, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.destroyObjectTrail, preConditions.object, object);
  preConditions.checkIfTrue(ROYGBIV.destroyObjectTrail, "No trail effect is added to object", (!objectTrails[object.name]));
  var objectTrail = objectTrails[object.name];
  objectTrail.destroy();
  delete objectTrails[object.name];
  delete activeObjectTrails[object.name];
  return;
}

// generateParticleSystemName
// Generates a unique name for a particle system.
Roygbiv.prototype.generateParticleSystemName = function(){
  if (mode == 0){
    return;
  }
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while (nameFound){
    nameFound = !(typeof particleSystemPool[generatedName] == UNDEFINED);
    if (nameFound){
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

// rewindParticle
// Rewinds a particle and restarts its motion. Particles using this functionality
// must have respawn = true and lifetime != 0 as configuration. The additional
// delay parameter may be used to delay the rewind process in seconds.
Roygbiv.prototype.rewindParticle = function(particle, delay){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rewindParticle, preConditions.particle, particle);
  preConditions.checkIfTrue(ROYGBIV.rewindParticle, "particle is not a Particle.", (!particle.isParticle));
  preConditions.checkIfTrue(ROYGBIV.rewindParticle, "Particles using this API must have respawn = true as configuration.", (!particle.respawnSet));
  preConditions.checkIfTrue(ROYGBIV.rewindParticle, "Particles using this API must have lifetime != 0 as configuration.", (particle.lifetime == 0));
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.rewindParticle, preConditions.delay, delay);
  if ((typeof delay == UNDEFINED)){
    delay = 0;
  }
  if (!particle.parent){
    return;
  }
  particle.parent.rewindParticle(particle, delay);
}

// createLaser
// Creates a laser like particle system. Configurations are:
// name: The unique name of the particle system. (mandatory)
// position: The initial position of the particle system. (mandatory)
// particleCount: The count of laser particles. (mandatory)
// particleSize: The size of laser particles. (mandatory)
// direction: The direction vector of the laser. (mandatory)
// timeDiff: The difference between startDelay attribute of each laser particles in seconds. Expected value is greater than zero. (mandatory)
// expireTime: The maximum lifetime of the laser. Set this 0 for infinite laser. (mandatory)
// velocity: The velocity vector of the laser. (mandatory)
// acceleration: The acceleration vector of the laser. (mandatory)
// alpha: The opacity of laser particles. Expected value is between [0, 1]. (mandatory)
// colorName: The color name of laser particles. (mandatory)
// targetColorName: The target color name of trail particles. (optional)
// colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)
// textureName: The name of texture of laser particles. (optional)
// rgbFilter: This can be used to eliminate texture background colors. (optional)
// updateFunction: The update function of the particle system that is executed on each frame render. (optional)
Roygbiv.prototype.createLaser = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createLaser, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var direction = configurations.direction;
  var timeDiff = configurations.timeDiff;
  var expireTime = configurations.expireTime;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var alpha = configurations.alpha;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createLaser, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createLaser, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createLaser, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createLaser, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createLaser, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createLaser, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.direction, direction);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createLaser, preConditions.direction, direction);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.timeDiff, timeDiff);
  preConditions.checkIfNumber(ROYGBIV.createLaser, preConditions.timeDiff, timeDiff);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createLaser, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createLaser, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.velocity, velocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createLaser, preConditions.velocity, velocity);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.acceleration, acceleration);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createLaser, preConditions.acceleration, acceleration);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createLaser, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createLaser, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createLaser, preConditions.colorName, colorName);

  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);

  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = 0;
  particleConfigurations.respawn = false;
  var c2 = 0;
  for (var i = 0; i < particleCount; i++){
    var dx = (direction.x * c2);
    var dy = (direction.y * c2);
    var dz = (direction.z * c2);
    particleConfigurations.startDelay = c2;
    particleConfigurations.position = this.vector(dx, dy, dz);
    c2 += timeDiff;
    particles.push(this.createParticle(particleConfigurations));
  }

  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.createParticleSystem(particleSystemConfigurations);
}

// createWaterfall
// Creates a waterfall like particle system. This function initially puts the particles
// on an imaginary line on the X axis. Size and normal of this line are configurable. Configurations are:
// name: The unique name of the particle system. (mandatory)
// position: The initial position of the particle system. (mandatory)
// particleCount: The count of waterfall particles. (mandatory)
// size: The size of the waterfall. (mandatory)
// particleSize: The size of waterfall particles. (mandatory)
// particleExpireTime: The maximum expiration time in seconds of particles. (mandatory)
// speed: A number representing the speed of waterfall particles. (mandatory)
// acceleration: A number representing the acceleration of waterfall particles. (mandatory)
// avgStartDelay: The average start delay of waterfall particles. Expected value is greater than zero.(mandatory)
// colorName: The name of color of particles. (mandatory)
// alpha: The alpha value between [0, 1] of each particle. (mandatory)
// textureName: The name of texture of particles. (optional)
// rewindOnCollided: If true, the particles that are collided are rewinded. This parameter can be a performance issue if web workers are not supported. (optional)
// normal: The normal vector of the waterfall. Default value is (0, 0, 1). (optional)
// randomness: The randomness of waterfall particles. (optional)
// alphaVariation: The alpha variaton of particles. The expected value is between [-1, 0] (optional)
// targetColorName: The target color name of trail particles. (optional)
// colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)
// rgbFilter: This can be used to eliminate the background colors of textures. (optional)
// updateFunction: The update function of the particle system that is executed on each frame render. (optional)
// collisionTimeOffset: This can be used to pre-calculate collisions of particles to prevent visuals errors caused by fast particles. (optional)
Roygbiv.prototype.createWaterfall = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createWaterfall, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var size = configurations.size;
  var particleSize = configurations.particleSize;
  var particleExpireTime = configurations.particleExpireTime;
  var speed = configurations.speed;
  var acceleration = configurations.acceleration;
  var avgStartDelay = configurations.avgStartDelay;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rewindOnCollided = configurations.rewindOnCollided;
  var normal = configurations.normal;
  var randomness = configurations.randomness;
  var alphaVariation = configurations.alphaVariation;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var collisionTimeOffset = configurations.collisionTimeOffset;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createWaterfall, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createWaterfall, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.size, size);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.size, size);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.size, size, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.particleExpireTime, particleExpireTime);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.particleExpireTime, particleExpireTime);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.particleExpireTime, particleExpireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.speed, speed);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.speed, speed);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.speed, speed, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.acceleration, acceleration);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.acceleration, acceleration);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.acceleration, acceleration, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.avgStartDelay, avgStartDelay);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.avgStartDelay, avgStartDelay);
  preConditions.checkIfLessThan(ROYGBIV.createWaterfall, preConditions.avgStartDelay, avgStartDelay, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.colorName, colorName);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createWaterfall, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createWaterfall, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createWaterfall, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createWaterfall, preConditions.rewindOnCollided, rewindOnCollided);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createWaterfall, preConditions.normal, normal);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createWaterfall, preConditions.randomness, randomness);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createWaterfall, preConditions.collisionTimeOffset, collisionTimeOffset);
  if ((typeof rewindOnCollided == UNDEFINED)){
    rewindOnCollided = false;
  }
  if ((typeof normal == UNDEFINED)){
    normal = this.vector(0, 0, 1);
  }
  if ((typeof randomness == UNDEFINED)){
    randomness = 0;
  }
  if ((typeof collisionTimeOffset == UNDEFINED)){
    collisionTimeOffset = 0;
  }

  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);

  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = particleExpireTime;
  particleConfigurations.respawn = true;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.velocity = this.vector(0, -1 * speed, 0);
  var particles = [];
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.boxDistribution(size, 0, 0, 3);
    particleConfigurations.startDelay = avgStartDelay * Math.random();
    particleConfigurations.acceleration = this.vector(0, -1 * acceleration, 0);
    if (randomness != 0){
      particleConfigurations.acceleration.z += randomness * (Math.random() - 0.5);
      particleConfigurations.acceleration.x += randomness * (Math.random() - 0.5);
    }
    var particle = this.createParticle(particleConfigurations);
    if (rewindOnCollided){
      var roygbivContext = this;
      this.setCollisionListener(particle, function(info){
        roygbivContext.rewindParticle(this, Math.random());
      }, collisionTimeOffset);
    }
    particles.push(particle);
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = 0;
  var waterfall = this.createParticleSystem(particleSystemConfigurations);
  var quat = this.computeQuaternionFromVectors(this.vector(0, 0, 1), normal);
  waterfall.mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  return waterfall;
}

// createSnow
// Creates a snow or rain like particle system. Particles are initially created
// on an imaginary rectangle on XZ plane. The normal vector and width/height values
// of this rectangle are configurable. Configurations are:
// name: The unique name of the particle system. (mandatory)
// position: The initial position of the particle system. (mandatory)
// particleCount: The count of snow particles. (mandatory)
// sizeX: The width of the particle system. (mandatory)
// sizeZ: The depth of the particle system. (mandatory)
// particleSize: The size of snow particles. (mandatory)
// particleExpireTime: The maximum expiration time in seconds of particles. (mandatory)
// speed: A number representing the speed of snow particles. (mandatory)
// acceleration: A number representing the acceleration of snow particles. (mandatory)
// avgStartDelay: The average start delay of snow particles. Expected value is greater than zero.(mandatory)
// colorName: The name of color of particles. (mandatory)
// alpha: The alpha value between [0, 1] of each particle. (mandatory)
// textureName: The name of texture of particles. (optional)
// rewindOnCollided: If true, the particles that are collided are rewinded. This parameter can be a performance issue if web workers are not supported. (optional)
// normal: The normal vector of the snow. Default value is (0, -1, 0). (optional)
// randomness: The randomness of snow particles. (optional)
// alphaVariation: The alpha variaton of particles. The expected value is between [-1, 0] (optional)
// targetColorName: The target color name of trail particles. (optional)
// colorStep: A float between [0,1] that represents the variaton of color betwen the initial color and the target color. (optional)
// rgbFilter: This can be used to eliminate the background colors of textures. (optional)
// updateFunction: The update function of the particle system that is executed on each frame render. (optional)
// collisionTimeOffset: This can be used to pre-calculate collisions of particles to prevent visuals errors caused by fast particles. (optional)
Roygbiv.prototype.createSnow = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createSnow, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var sizeX = configurations.sizeX;
  var sizeZ = configurations.sizeZ;
  var particleSize = configurations.particleSize;
  var particleExpireTime = configurations.particleExpireTime;
  var speed = configurations.speed;
  var acceleration = configurations.acceleration;
  var avgStartDelay = configurations.avgStartDelay;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rewindOnCollided = configurations.rewindOnCollided;
  var normal = configurations.normal;
  var randomness = configurations.randomness;
  var alphaVariation = configurations.alphaVariation;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var collisionTimeOffset = configurations.collisionTimeOffset;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createSnow, "name must be unique", (particleSystemPool[name]));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createSnow, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.sizeX, sizeX);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.sizeX, sizeX);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.sizeX, sizeX, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.sizeZ, sizeZ);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.sizeZ, sizeZ);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.sizeZ, sizeZ, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.particleExpireTime ,particleExpireTime);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.particleExpireTime, particleExpireTime);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.particleExpireTime, particleExpireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.speed, speed);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.speed, speed);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.speed, speed, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.acceleration, acceleration);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.acceleration, acceleration);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createSnow, preConditions.acceleration, acceleration, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.avgStartDelay, avgStartDelay);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.avgStartDelay, avgStartDelay);
  preConditions.checkIfLessThan(ROYGBIV.createSnow, preConditions.avgStartDelay, avgStartDelay, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.colorName, colorName);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createSnow, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createSnow, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createSnow, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.createSnow, preConditions.rewindOnCollided, rewindOnCollided);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createSnow, preConditions.normal, normal);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createSnow, preConditions.randomness, randomness);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createSnow, preConditions.collisionTimeOffset, collisionTimeOffset);
  if ((typeof rewindOnCollided == UNDEFINED)){
    rewindOnCollided = false;
  }
  if ((typeof normal == UNDEFINED)){
    normal = this.vector(0, -1, 0);
  }
  if ((typeof randomness == UNDEFINED)){
    randomness = 0;
  }
  if ((typeof collisionTimeOffset == UNDEFINED)){
    collisionTimeOffset = 0;
  }
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.createParticleMaterial(particleMaterialConfigurations);

  var particleConfigurations = new Object();
  var particles = [];
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = particleExpireTime;
  particleConfigurations.respawn = true;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.velocity = this.vector(0, -1 * speed, 0);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.acceleration = this.vector(0, -1 * acceleration, 0);
    particleConfigurations.position = this.boxDistribution(sizeX, 0 ,sizeZ, 2);
    particleConfigurations.startDelay = avgStartDelay * Math.random();
    if (randomness != 0){
      particleConfigurations.acceleration.x = randomness * (Math.random() - 0.5);
      particleConfigurations.acceleration.z = randomness * (Math.random() - 0.5);
    }
    var particle = this.createParticle(particleConfigurations);
    if (rewindOnCollided){
      var roygbivContext = this;
      this.setCollisionListener(particle, function(){
        roygbivContext.rewindParticle(this, Math.random());
      }, collisionTimeOffset);
    }
    particles.push(particle);
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = 0;
  particleSystemConfigurations.updateFunction = updateFunction;
  var snow = this.createParticleSystem(particleSystemConfigurations);
  var quat = this.computeQuaternionFromVectors(this.vector(0, -1, 0), normal);
  snow.mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  return snow;
}

// stopParticleSystem
// Stops the motion of a particle system. This can be useful for smooth after collision
// effects of particle systems as it lets particles to dissapear smoothly. The particle
// system is killed after stopDuration seconds. If particle systems have collision listener
// attached, the collision listener needs to be reset when starting the particle system
// after stopping.
Roygbiv.prototype.stopParticleSystem = function(particleSystem, stopDuration){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.stopParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.stopParticleSystem, preConditions.stopDuration, stopDuration);
  preConditions.checkIfNumber(ROYGBIV.stopParticleSystem, preConditions.stopDuration, stopDuration);
  preConditions.checkIfLessThanExclusive(ROYGBIV.stopParticleSystem, preConditions.stopDuration, stopDuration, 0);
  particleSystem.stop(stopDuration);
}

// startParticleSystem
// Starts a particle system after its creation. Configurations are:
// particleSystem: The particle system to start. (mandatory)
// startPosition: The initial position vector of the particle system. (optional)
// startVelocity: The initial velocity vector of the particle system. (optional)
// startAcceleration: The initial acceleration vector of the particle system. (optional)
// startQuaternion: The initial quaternion of the particle system. Use ROYGBIV.computeQuaternionFromVectors (optional)
Roygbiv.prototype.startParticleSystem = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startParticleSystem, preConditions.configurations, configurations);
  var particleSystem = configurations.particleSystem;
  var startPosition = configurations.startPosition;
  var startVelocity = configurations.startVelocity;
  var startAcceleration = configurations.startAcceleration;
  var startQuaternion = configurations.startQuaternion;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.startParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.startParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startPosition, startPosition);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startVelocity, startVelocity);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startAcceleration, startAcceleration);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.startParticleSystem, preConditions.startQuaternion, startQuaternion);

  var startPositionSet = false, startVelocitySet = false, startAccelerationSet = false, startQuaternionSet = false;
  if (!(typeof startPosition == UNDEFINED)){
    startPositionSet = true;
  }
  if (!(typeof startVelocity == UNDEFINED)){
    startVelocitySet = true;
  }
  if (!(typeof startAcceleration == UNDEFINED)){
    startAccelerationSet = true;
  }
  if (!(typeof startQuaternion == UNDEFINED)){
    startQuaternionSet = true;
  }

  particleSystem.tick = 0;
  particleSystem.motionTimer = 0;
  if (startVelocitySet){
    particleSystem.vx = startVelocity.x;
    particleSystem.vy = startVelocity.y;
    particleSystem.vz = startVelocity.z;
    if (!particleSystem.velocity){
      particleSystem.velocity = this.vector(particleSystem.vx, particleSystem.vy, particleSystem.vz);
    }else{
      particleSystem.velocity.x = particleSystem.vx;
      particleSystem.velocity.y = particleSystem.vy;
      particleSystem.velocity.z = particleSystem.vz;
    }
    if (!particleSystem.psMerger){
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[3] = startVelocity.x;
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[4] = startVelocity.y;
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[5] = startVelocity.z;
    }else{
      var matrix = particleSystem.psMerger.material.uniforms.parentMotionMatrixArray.value[particleSystem.mergedIndex];
      matrix.elements[3] = startVelocity.x;
      matrix.elements[4] = startVelocity.y;
      matrix.elements[5] = startVelocity.z;
    }
  }
  if (startAccelerationSet){
    particleSystem.ax = startAcceleration.x;
    particleSystem.ay = startAcceleration.y;
    particleSystem.az = startAcceleration.z;
    if (!particleSystem.acceleration){
      particleSystem.acceleration = this.vector(particleSystem.ax, particleSystem.ay, particleSystem.az);
    }else{
      particleSystem.acceleration.x = particleSystem.ax;
      particleSystem.acceleration.y = particleSystem.ay;
      particleSystem.acceleration.z = particleSystem.az;
    }
    if (!particleSystem.psMerger){
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[6] = startAcceleration.x;
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[7] = startAcceleration.y;
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[8] = startAcceleration.z;
    }else{
      var matrix = particleSystem.psMerger.material.uniforms.parentMotionMatrixArray.value[particleSystem.mergedIndex];
      matrix.elements[6] = startAcceleration.x;
      matrix.elements[7] = startAcceleration.y;
      matrix.elements[8] = startAcceleration.z;
    }
  }
  if (startQuaternionSet){
    particleSystem.mesh.quaternion.set(startQuaternion.x, startQuaternion.y, startQuaternion.z, startQuaternion.w);
  }
  if (startPositionSet){
    particleSystem.x = startPosition.x;
    particleSystem.y = startPosition.y;
    particleSystem.z = startPosition.z;
    particleSystem.mesh.position.set(particleSystem.x, particleSystem.y, particleSystem.z);
    if (!particleSystem.psMerger){
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[0] = startPosition.x;
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[1] = startPosition.y;
      particleSystem.material.uniforms.parentMotionMatrix.value.elements[2] = startPosition.z;
    }else{
      var matrix = particleSystem.psMerger.material.uniforms.parentMotionMatrixArray.value[particleSystem.mergedIndex];
      matrix.elements[0] = startPosition.x;
      matrix.elements[1] = startPosition.y;
      matrix.elements[2] = startPosition.z;
    }
  }
  if (!particleSystem.psMerger){
    particleSystem.material.uniforms.stopInfo.value.set(-10, -10, -10);
  }else{
    particleSystem.psMerger.material.uniforms.hiddenArray.value[particleSystem.mergedIndex] = (-20.0);
    particleSystem.psMerger.material.uniforms.stopInfoArray.value[particleSystem.mergedIndex].set(-10, -10, -10);
  }
  particleSystem.stoppedX = undefined;
  particleSystem.stoppedY = undefined;
  particleSystem.stoppedZ = undefined;
  particleSystem.stopped = false;
  if (!(typeof particleSystem.originalCheckForCollisions == UNDEFINED)){
    particleSystem.checkForCollisions = particleSystem.originalCheckForCollisions;
    particleSystem.originalCheckForCollisions = undefined;
  }
  if (!(typeof particleSystem.originalLifetime == UNDEFINED)){
    particleSystem.lifetime = particleSystem.originalLifetime;
    particleSystem.originalLifetime = undefined;
  }
  particleSystem.mesh.visible = true;
  if (!particleSystem.psMerger){
    particleSystems[particleSystem.name] = particleSystem;
    particleSystem.material.uniforms.dissapearCoef.value = 0;
  }else{
    particleSystem.psMerger.notifyPSVisibilityChange(particleSystem, true);
    particleSystem.psMerger.material.uniforms.dissapearCoefArray.value[particleSystem.mergedIndex] = 0;
  }
}

// hideParticleSystem
// Removes a particle system from the scene. Use this instead of ROYGBIV.kill() for
// reusable particle systems.
Roygbiv.prototype.hideParticleSystem = function(particleSystem){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.hideParticleSystem, preConditions.particleSystem, particleSystem);

  particleSystem.tick = 0;
  particleSystem.motionMode = 0;
  particleSystem.mesh.visible = false;
  if (!particleSystem.psMerger){
    delete particleSystems[particleSystems.name];
  }
  if (!(typeof particleSystem.psPool == UNDEFINED)){
    var psPool = particleSystemPools[particleSystem.psPool];
    psPool.notifyPSAvailable(particleSystem);
  }
  if (particleSystem.psMerger){
    particleSystem.psMerger.material.uniforms.hiddenArray.value[particleSystem.mergedIndex] = (20.0);
    particleSystem.psMerger.notifyPSVisibilityChange(particleSystem, false);
  }
}

// createParticleSystemPool
// Creates a new particle system pool. Particle system pools are used to hold
// and keep track of particle systems. For instance, for a plasma gun it is suggested
// to create the plasma particle systems, put them inside a pool and get them from
// the pool every time the player shoots.
Roygbiv.prototype.createParticleSystemPool = function(name){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createParticleSystemPool, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createParticleSystemPool, "name must be unique", (particleSystemPools[name]));

  var psPool = new ParticleSystemPool(name);
  particleSystemPools[name] = psPool;
  return psPool;
}

// addParticleSystemToPool
// Puts a particle system to a particle system pool.
Roygbiv.prototype.addParticleSystemToPool = function(pool, particleSystem){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.addParticleSystemToPool, preConditions.pool, pool);
  preConditions.checkIfDefined(ROYGBIV.addParticleSystemToPool, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystemPool(ROYGBIV.addParticleSystemToPool, preConditions.pool, pool);
  preConditions.checkIfParticleSystem(ROYGBIV.addParticleSystemToPool, preConditions.particleSystem, particleSystem);
  preConditions.checkIfTrue(ROYGBIV.addParticleSystemToPool, "Particle system belongs to another pool", (!(typeof particleSystem.psPool == UNDEFINED)));
  pool.add(particleSystem);
}

// removeParticleSystemFromPool
// Removes a particle system from its particle system pool.
Roygbiv.prototype.removeParticleSystemFromPool = function(particleSystem){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeParticleSystemFromPool, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.removeParticleSystemFromPool, preConditions.particleSystem, particleSystem);
  preConditions.checkIfTrue(ROYGBIV.removeParticleSystemFromPool, "particleSystem does not belong to any pool", (typeof particleSystem.psPool == UNDEFINED));
  var psPool = particleSystemPools[particleSystem.psPool];
  psPool.remove(particleSystem);
}

// destroyParticleSystemPool
// Destroys a particle system pool.
Roygbiv.prototype.destroyParticleSystemPool = function(pool){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.destroyParticleSystemPool, preConditions.pool, pool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.destroyParticleSystemPool, preConditions.pool, pool);
  pool.destroy();
}

// createConfettiExplosion
// Creates a confetti like explosion. This function initially puts the particles
// to the same position on the XZ plane and defines parabolic motion for each particle.
// The configurations are:
// name: The unique name of the particle system. (mandatory)
// position: The start position of the confetti. (mandatory)
// expireTime: The expiration time of particle system in seconds. This can be set 0 for inifinite particle systems. (mandatory)
// lifetime: The average lifetime of particles in seconds. (mandatory)
// verticalSpeed: The average vertical speed of particles. (mandatory)
// horizontalSpeed: The average horizontal speed of particles. (mandatory)
// verticalAcceleration: The average vertial acceleration (gravity) of particles. Expected value is less than zero. (mandatory)
// particleCount: The count of particles. (mandatory)
// particleSize: The size of particles. (mandatory)
// colorName: The color name of particles. (mandatory)
// alpha: The alpha value of particles. (mandatory)
// collisionMethod: 0 -> Nothing happens when particles are collided with objects.
//                  1 -> Particles are destroyed when collided with objects.
//                  2 -> Particles are respawned when collided with objects.
//                  Default value is 0. (optional)
// normal: The normal vector of the particle system. Default value is (0, 1, 0) (optional)
// collisionTimeOffset: The time offset of collision listener if the collisionMethod is 1 or 2. Default value is 0. (optional)
// startDelay: The average start delay of particles. Default value is 0. (optional)
// targetColorName: The target color name of particles. (optional)
// colorStep: A float between [0, 1] that represents the variation of color between the colorName and targetColorName each frame. (optional)
// alphaVariation: The variation of alpha of particles on each frame. (optional)
// textureName: The name of texture of particles. (optional)
// rgbFilter: This can be used to eliminate background colors of textures. (optional)
Roygbiv.prototype.createConfettiExplosion = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createConfettiExplosion, preConditions.configurations, configurations);
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var lifetime = configurations.lifetime;
  var verticalSpeed = configurations.verticalSpeed;
  var horizontalSpeed = configurations.horizontalSpeed;
  var verticalAcceleration = configurations.verticalAcceleration;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var collisionMethod = configurations.collisionMethod;
  var normal = configurations.normal;
  var collisionTimeOffset= configurations.collisionTimeOffset;
  var startDelay = configurations.startDelay;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var alphaVariation = configurations.alphaVariation;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;

  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createConfettiExplosion, "name must be unique", particleSystemPool[name]);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.position, position);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createConfettiExplosion, preConditions.position, position);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.expireTime, expireTime);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.expireTime, expireTime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createConfettiExplosion, preConditions.expireTime, expireTime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.lifetime, lifetime);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.lifetime, lifetime);
  preConditions.checkIfLessThanExclusive(ROYGBIV.createConfettiExplosion, preConditions.life, lifetime, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.verticalSpeed, verticalSpeed);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.verticalSpeed, verticalSpeed);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.horizontalSpeed, horizontalSpeed);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.horizontalSpeed, horizontalSpeed);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.verticalAcceleration, verticalAcceleration);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.verticalAcceleration, verticalAcceleration);
  preConditions.checkIfTrue(ROYGBIV.createConfettiExplosion, "verticalAcceleration is expected to be less than zero", (verticalAcceleration >= 0));
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.particleCount, particleCount);
  preConditions.checkIfLessThan(ROYGBIV.createConfettiExplosion, preConditions.particleCount, particleCount, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.particleSize, particleSize);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.particleSize, particleSize);
  preConditions.checkIfLessThan(ROYGBIV.createConfettiExplosion, preConditions.particleSize, particleSize, 0);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.colorName, colorName);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createConfettiExplosion, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createConfettiExplosion, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createConfettiExplosion, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createConfettiExplosion, preConditions.collisionTimeOffset, collisionTimeOffset);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createConfettiExplosion, preConditions.startDelay, startDelay);
  preConditions.checkIfLessThanExclusiveOnlyIfExists(ROYGBIV.createConfettiExplosion, preConditions.startDelay, startDelay, 0);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.createConfettiExplosion, preConditions.normal, normal);
  if (!(typeof collisionMethod == UNDEFINED)){
    preConditions.checkIfTrue(ROYGBIV.createConfettiExplosion, "collisionMethod method must be one of 0, 1 or 2", (collisionMethod != 0 && collisionMethod != 1 && collisionMethod != 2));
  }else{
    collisionMethod = 0;
  }
  if ((typeof collisionTimeOffset == UNDEFINED)){
    collisionTimeOffset = 0;
  }
  if ((typeof startDelay == UNDEFINED)){
    startDelay = 0;
  }
  var normalSet = false;
  if (!(typeof normal == UNDEFINED)){
    normalSet = true;
  }

  var particleMaterial = this.createParticleMaterial({
    color: colorName,
    size: particleSize,
    alpha: alpha,
    textureName: textureName,
    rgbFilter: rgbFilter,
    targetColor: targetColorName,
    colorStep: colorStep
  });

  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.position = this.vector(0, 0, 0);
  particleConfigurations.material = particleMaterial;
  particleConfigurations.alphaVariation = alphaVariation;
  if (collisionMethod == 2){
    particleConfigurations.respawn = true;
  }else{
    particleConfigurations.respawn = false;
  }
  for (var i = 0; i<particleCount; i++){
    particleConfigurations.startDelay = startDelay * Math.random();
    particleConfigurations.lifetime = lifetime;
    var v1 = horizontalSpeed * (Math.random() - 0.5);
    var v2 = horizontalSpeed * (Math.random() - 0.5);
    var v3 = verticalSpeed * Math.random();
    particleConfigurations.velocity = this.vector(v1, v3, v2);
    particleConfigurations.acceleration = this.vector(0, verticalAcceleration, 0);
    var particle = this.createParticle(particleConfigurations);
    particles.push(particle);
    if (collisionMethod == 1){
      var roygbivContext = this;
      this.setCollisionListener(particle, function(info){
        roygbivContext.kill(this);
      }, collisionTimeOffset);
    }else if (collisionMethod == 2){
      var roygbivContext = this;
      this.setCollisionListener(particle, function(info){
        roygbivContext.rewindParticle(this, Math.random());
      }, collisionTimeOffset);
    }
  }

  var ps = this.createParticleSystem({
    name: name,
    particles: particles,
    position: position,
    lifetime: expireTime
  });
  if (normalSet){
    var quat = this.computeQuaternionFromVectors(this.vector(0, 1, 0), normal);
    ps.mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  }
  return ps;

}

// copyParticleSystem
// Returns a new copy of given particle system. This function can be used to
// improve memory usage of particle system pools. For instance, given a plasma
// gun with X plasma particle systems it is better to create one plasma particle system
// then create (X-1) copies of it than to create X plasma particle systems.
Roygbiv.prototype.copyParticleSystem = function(particleSystem, newParticleSystemName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.copyParticleSystem, "Cannot create more than "+MAX_PARTICLE_SYSTEM_COUNT+" particle systems.", (TOTAL_PARTICLE_SYSTEM_COUNT >= MAX_PARTICLE_SYSTEM_COUNT));
  preConditions.checkIfDefined(ROYGBIV.copyParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.copyParticleSystem, preConditions.particleSystem, particleSystem);
  preConditions.checkIfDefined(ROYGBIV.copyParticleSystem, preConditions.newParticleSystemName, newParticleSystemName);
  preConditions.checkIfTrue(ROYGBIV.copyParticleSystem, "name must be unique", particleSystemPool[newParticleSystemName]);

  var copyParticleSystem = new ParticleSystem(
    particleSystem, newParticleSystemName, particleSystem.particles,
    particleSystem.x, particleSystem.y, particleSystem.z,
    particleSystem.vx, particleSystem.vy, particleSystem.vz,
    particleSystem.ax, particleSystem.ay, particleSystem.az, particleSystem.motionMode,
    particleSystem.updateFunction
  );

  copyParticleSystem.lifetime = particleSystem.lifetime;

  copyParticleSystem.angularVelocity = particleSystem.angularVelocity;
  copyParticleSystem.angularAcceleration = particleSystem.angularAcceleration;
  copyParticleSystem.angularMotionRadius = particleSystem.angularMotionRadius;
  if (particleSystem.angularQuaternion){
    copyParticleSystem.angularQuaternionX = particleSystem.angularQuaternion.x;
    copyParticleSystem.angularQuaternionY = particleSystem.angularQuaternion.y;
    copyParticleSystem.angularQuaternionZ = particleSystem.angularQuaternion.z;
    copyParticleSystem.angularQuaternionW = particleSystem.angularQuaternion.w;
  }
  copyParticleSystem.initialAngle = particleSystem.initialAngle;

  TOTAL_PARTICLE_SYSTEM_COUNT ++;

  return copyParticleSystem;

}

// fadeAway
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
  if (!particleSystem.psMerger){
    particleSystem.material.uniforms.dissapearCoef.value = coefficient;
  }else{
    particleSystem.psMerger.material.uniforms.dissapearCoefArray.value[particleSystem.mergedIndex] = coefficient;
  }
}

// mergeParticleSystems
// Merges all created particle systems to improve render performance.
Roygbiv.prototype.mergeParticleSystems = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.mergeParticleSystems, "MAX_VERTEX_UNIFORM_VECTORS is not calcualted", (!MAX_VERTEX_UNIFORM_VECTORS));
  preConditions.checkIfTrue(ROYGBIV.mergeParticleSystems, "Mininmum 2 particle systems must be created in order to merge", (Object.keys(particleSystemPool).length < 2));

  var diff = parseInt(4096 / MAX_VERTEX_UNIFORM_VECTORS);
  var chunkSize = parseInt(MAX_PS_COMPRESS_AMOUNT_4096 / diff);
  var mergeObj = new Object();
  var size = 0;
  for (var psName in particleSystemPool){
    var ps = particleSystemPool[psName];
    mergeObj[psName] = ps;
    size ++;
    if (size == chunkSize){
      new ParticleSystemMerger(mergeObj, TOTAL_MERGED_COUNT);
      TOTAL_MERGED_COUNT ++;
      mergeObj = new Object();
      size = 0;
    }
  }
  if (size > 1){
    new ParticleSystemMerger(mergeObj, TOTAL_MERGED_COUNT);
    TOTAL_MERGED_COUNT ++;
  }
}

// setParticleSystemPosition
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
  particleSystem.mesh.position.set(x, y, z);
  particleSystem.hasManualPositionSet = true;
}

// startObjectTrail
// Starts the trail effect of an object create with createObjectTrail command.
Roygbiv.prototype.startObjectTrail = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.startObjectTrail, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.startObjectTrail, preConditions.object, object);
  var objectTrail = objectTrails[object.name];
  preConditions.checkIfTrue(ROYGBIV.startObjectTrail, "No trail attached to object.", (!objectTrail));
  objectTrail.start();
}

// stopObjectTrail
// Stops the trail effect of an object. The effect can be restarted using the startObjectTrail command.
Roygbiv.prototype.stopObjectTrail = function(object){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.stopObjectTrail, preConditions.object, object);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.stopObjectTrail, preConditions.object, object);
  var objectTrail = objectTrails[object.name];
  preConditions.checkIfTrue(ROYGBIV.stopObjectTrail, "No trail attached to object.", (!objectTrail));
  objectTrail.stop();
}

// createInitializedParticleSystemPool
// Creates a particle system pool and fills it with poolSize copies of refParticleSystem.
Roygbiv.prototype.createInitializedParticleSystemPool = function(poolName, refParticleSystem, poolSize){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createInitializedParticleSystemPool, preConditions.refParticleSystem, refParticleSystem);
  preConditions.checkIfParticleSystem(ROYGBIV.createInitializedParticleSystemPool, preConditions.refParticleSystem, refParticleSystem);
  preConditions.checkIfDefined(ROYGBIV.createInitializedParticleSystemPool, preConditions.poolName, poolName);
  preConditions.checkIfTrue(ROYGBIV.createInitializedParticleSystemPool, "poolName must be unique.", particleSystemPools[poolName]);
  preConditions.checkIfDefined(ROYGBIV.createInitializedParticleSystemPool, preConditions.poolSize, poolSize);
  preConditions.checkIfNumber(ROYGBIV.createInitializedParticleSystemPool, preConditions.poolSize, poolSize);
  preConditions.checkIfLessThan(ROYGBIV.createInitializedParticleSystemPool, preConditions.poolSize, poolSize, 1);
  var pool = this.createParticleSystemPool(poolName);
  this.addParticleSystemToPool(pool, refParticleSystem);
  for (var i = 0; i<poolSize - 1; i++){
    this.addParticleSystemToPool(pool, this.copyParticleSystem(refParticleSystem, this.generateParticleSystemName()));
  }
  return pool;
}

// makeParticleSystemsResponsive
// Makes the particle systems responsive for different screens. This function
// should be used before any particle system creation. The referenceHeight can
// be calculated by dividing the design screen viewport height by the screen resolution
// (renderer.getCurrentViewport().w / screenResolution). The referenceHeight should
// be a constant (not to be calculated during runtime).
Roygbiv.prototype.makeParticleSystemsResponsive = function(referenceHeight){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.makeParticleSystemsResponsive, preConditions.referenceHeight, referenceHeight);
  preConditions.checkIfNumber(ROYGBIV.makeParticleSystemsResponsive, preConditions.referenceHeight, referenceHeight);
  preConditions.checkIfLessThan(ROYGBIV.makeParticleSystemsResponsive, preConditions.referenceHeight, referenceHeight, 0);
  preConditions.checkIfTrue(ROYGBIV.makeParticleSystemsResponsive, "This API should be used before any particle system creation.", (TOTAL_PARTICLE_SYSTEM_COUNT > 0));
  particleSystemRefHeight = referenceHeight;
  GLOBAL_PS_REF_HEIGHT_UNIFORM.value = ((renderer.getCurrentViewport().w / screenResolution) / particleSystemRefHeight);
}

// CROSSHAIR FUNCTIONS *********************************************************

// createCrosshair
// Creates a new crosshair. Configurations are:
// name: The unique name of the crosshair. (mandatory)
// textureName: The texture name of the crosshair. (mandatory)
// colorName: The color name of the crosshair. (mandatory)
// alpha: The alpha value of the crosshair. (mandatory)
// size: The size of the crosshair. (mandatory)
// maxWidthPercent: If set the crosshair width cannot be more than maxWidthPercent% of the screen width. (optional)
// maxHeightPercent: If set the crosshair height cannot be more than maxHeightPercent% of the screen height. (optional)
Roygbiv.prototype.createCrosshair = function(configurations){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.createCrosshair, preConditions.configurations, configurations);
  var name = configurations.name;
  var textureName = configurations.textureName;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var size = configurations.size;
  var maxWidthPercent = configurations.maxWidthPercent;
  var maxHeightPercent = configurations.maxHeightPercent;
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCrosshair, preConditions.name, name);
  preConditions.checkIfTrue(ROYGBIV.createCrosshair, "name must be unique", crosshairs[name]);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCrosshair, preConditions.textureName, textureName);
  var texture = textures[textureName];
  preConditions.checkIfTextureExists(ROYGBIV.createCrosshair, preConditions.texture, texture);
  preConditions.checkIfTextureReady(ROYGBIV.createCrosshair, preConditions.texture, texture);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCrosshair, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.createCrosshair, preConditions.alpha, alpha);
  preConditions.checkIfInRange(ROYGBIV.createCrosshair, preConditions.alpha, alpha, 0, 1);
  preConditions.checkIfMandatoryParameterExists(ROYGBIV.createCrosshair, preConditions.size, size);
  preConditions.checkIfNumber(ROYGBIV.createCrosshair, preConditions.size, size);
  preConditions.checkIfLessThan(ROYGBIV.createCrosshair, preConditions.size, size, 0);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createCrosshair, preConditions.maxWidthPercent, maxWidthPercent);
  preConditions.checkIfLessThanOnlyIfExists(ROYGBIV.createCrosshair, preConditions.maxWidthPercent, maxWidthPercent);
  preConditions.checkIfTrueOnlyIfYExists(ROYGBIV.createCrosshair, "maxWidthPercent must be less than 100", (maxWidthPercent), (maxWidthPercent > 100));
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.createCrosshair, preConditions.maxHeightPercent, maxHeightPercent);
  preConditions.checkIfLessThanOnlyIfExists(ROYGBIV.createCrosshair, preConditions.maxHeightPercent, maxHeightPercent);
  preConditions.checkIfTrueOnlyIfYExists(ROYGBIV.createCrosshair, "maxHeightPercent must be less than 100", (maxHeightPercent), (maxHeightPercent > 100));
  var color = new THREE.Color(colorName);
  new Crosshair({
    name: name,
    texture: texture,
    colorR: color.r,
    colorB: color.b,
    colorG: color.g,
    alpha: alpha,
    size: size,
    maxWidthPercent: maxWidthPercent,
    maxHeightPercent: maxHeightPercent
  });
}

// selectCrosshair
// Selects a crosshair. Only the selected crosshair is visible on the screen.
Roygbiv.prototype.selectCrosshair = function(crosshairName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.selectCrosshair, preConditions.crosshairName, crosshairName);
  var crosshair = crosshairs[crosshairName];
  preConditions.checkIfTrue(ROYGBIV.selectCrosshair, "No such crosshair.", (!crosshair));
  if (selectedCrosshair){
    selectedCrosshair.mesh.visible = false;
  }
  crosshair.mesh.visible = true;
  crosshair.handleResize();
  selectedCrosshair = crosshair;
}

// changeCrosshairColor
// Changes the color of the selected crosshair.
Roygbiv.prototype.changeCrosshairColor = function(colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.changeCrosshairColor, preConditions.colorName, colorName);
  preConditions.checkIfTrue(ROYGBIV.changeCrosshairColor, "No crosshair is selected", (!selectedCrosshair));
  REUSABLE_COLOR.set(colorName);
  selectedCrosshair.material.uniforms.color.value.x = REUSABLE_COLOR.r;
  selectedCrosshair.material.uniforms.color.value.y = REUSABLE_COLOR.g;
  selectedCrosshair.material.uniforms.color.value.z = REUSABLE_COLOR.b;
}

// hideCrosshair
// Destroys the selected crosshair. selectCrosshair function should be used after this function
// in order to put a crosshair on the screen.
Roygbiv.prototype.hideCrosshair = function(){
  if (mode == 0){
    return;
  }
  if (selectedCrosshair){
    selectedCrosshair.mesh.visible = false;
    selectedCrosshair = 0;
  }
}

// startCrosshairRotation
// Starts rotation effect of the selected crosshair.
Roygbiv.prototype.startCrosshairRotation = function(angularSpeed){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.startCrosshairRotation, "No selected crosshair", (!selectedCrosshair));
  preConditions.checkIfDefined(ROYGBIV.startCrosshairRotation, preConditions.angularSpeed, angularSpeed);
  preConditions.checkIfNumber(ROYGBIV.startCrosshairRotation, preConditions.angularSpeed, angularSpeed);
  selectedCrosshair.angularSpeed = angularSpeed;
}

// stopCrosshairRotation
// Stops rotation effect of the selected crosshair.
Roygbiv.prototype.stopCrosshairRotation = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.stopCrosshairRotation, "No selectedCrosshair.", (!selectedCrosshair));
  selectedCrosshair.rotationTime = 0;
  selectedCrosshair.angularSpeed = 0;
  selectedCrosshair.resetRotation();
}

// pauseCrosshairRotation
// Pauses rotation effect of the selected crosshair. startCrosshairRotation function
// can be used to continue the rotation effect.
Roygbiv.prototype.pauseCrosshairRotation = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.pauseCrosshairRotation, "No selectedCrosshair.", (!selectedCrosshair));
  selectedCrosshair.angularSpeed = 0;
}

// expandCrosshair
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
  selectedCrosshair.expandTick = 0;
  selectedCrosshair.expandTargetSize = targetSize;
  selectedCrosshair.expandDelta = delta;
  selectedCrosshair.expand = true;
  selectedCrosshair.shrink = false;
}

// shrinkCrosshair
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
  selectedCrosshair.shrinkTick = 0;
  selectedCrosshair.expandDelta = delta;
  selectedCrosshair.material.uniforms.shrinkStartSize.value = selectedCrosshair.curSize;
  selectedCrosshair.expand = false;
  selectedCrosshair.shrink = true;
}

// LISTENER FUNCTIONS **********************************************************

// setCollisionListener
//  Sets a collision listener for an object, glued object, particle or a particle system. Using
//  this with loads of particles may cause performance issues if web worker usage is not enabled or supported.
//  Callback function given as the second parameter is fired with a CollisionInfo instance (except for particle collisions) when
//  the sourceObject is collided with other objects or glued objects of the scene.
//  The additional timeOffset parameter can be used for particles/particle systems to
//  pre-calculate future collisions. This can help to prevent visual errors of collisions
//  of rather fast particles/particle systems.
Roygbiv.prototype.setCollisionListener = function(sourceObject, callbackFunction, timeOffset){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setCollisionListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectObjectGroupParticleSystemParticle(ROYGBIV.setCollisionListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setCollisionListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setCollisionListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setCollisionListener, preConditions.timeOffset, timeOffset);
  if ((sourceObject.isAddedObject) || (sourceObject.isObjectGroup)){
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Cannot set collision listener for more than "+MAX_OBJECT_COLLISION_LISTENER_COUNT+" objects.", (TOTAL_OBJECT_COLLISION_LISTENER_COUNT >= MAX_OBJECT_COLLISION_LISTENER_COUNT));
    preConditions.checkIfNoMass(ROYGBIV.setCollisionListener, preConditions.sourceObject, sourceObject);
    collisionCallbackRequests[sourceObject.name] = callbackFunction.bind(sourceObject);
    TOTAL_OBJECT_COLLISION_LISTENER_COUNT ++;
  }else if (sourceObject.isParticle){
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Particle system is stopped.", (sourceObject.parent && sourceObject.parent.isStopped));
    if (sourceObject.uuid && !particleCollisionCallbackRequests[sourceObject.uuid]){
      preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Cannot set collision lsitener for more than "+MAX_PARTICLE_COLLISION_LISTEN_COUNT+" particles.", (TOTAL_PARTICLE_COLLISION_LISTEN_COUNT >= MAX_PARTICLE_COLLISION_LISTEN_COUNT));
    }
    if (sourceObject.parent){
      preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A position is manually set to the parent particle system. Cannot listen for collisions.", (sourceObject.parent.hasManualPositionSet));
      preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A rotation is manually set to the parent particle system. Cannot listen for collisions.", (sourceObject.parent.hasManualRotationSet));
      preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A quaternion is manually set to the parent particle system. Cannot listen for collisions.", (sourceObject.parent.hasManualQuaternionSet));
      if (!sourceObject.parent.hasParticleCollision){
        preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Maximum "+MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS+" can have collisions particles.", (TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS >= MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS));
        TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS ++;
      }
    }
    if (!sourceObject.uuid){
      sourceObject.assignUUID();
    }
    var incrCounter = false;
    if (!particleCollisionCallbackRequests[sourceObject.uuid]){
      incrCounter = true;
    }
    particleCollisionCallbackRequests[sourceObject.uuid] = callbackFunction.bind(sourceObject);
    if (incrCounter){
      TOTAL_PARTICLE_COLLISION_LISTEN_COUNT ++;
    }
    sourceObject.checkForCollisions = true;
    if (!(typeof timeOffset == UNDEFINED)){
      sourceObject.collisionTimeOffset = timeOffset;
    }
    if (sourceObject.parent){
      sourceObject.parent.hasParticleCollision = true;
      sourceObject.parent.notifyParticleCollisionCallbackChange(sourceObject);
    }
  }else if (sourceObject.isParticleSystem){
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A position is set manually to the particle system. Cannot listen for collisions.", (sourceObject.hasManualPositionSet));
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A rotation is set manually to the particle system. Cannot listen for collisions.", (sourceObject.hasManualRotationSet));
    preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "A quaternion is set manually to the particle system. Cannot listen for collisions.", (sourceObject.hasManualQuaternionSet));
    var incrCounter = false;
    if (!particleSystemCollisionCallbackRequests[sourceObject.name]){
      preConditions.checkIfTrue(ROYGBIV.setCollisionListener, "Cannot set collision listener for more than "+MAX_PARTICLE_SYSTEM_COUNT+" particle systems.", (TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT >= MAX_PARTICLE_SYSTEM_COUNT));
      incrCounter = true;
    }
    particleSystemCollisionCallbackRequests[sourceObject.name] = callbackFunction.bind(sourceObject);
    sourceObject.checkForCollisions = true;
    if (!(typeof timeOffset == UNDEFINED)){
      sourceObject.collisionTimeOffset = timeOffset;
    }
    if (incrCounter){
      TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT ++;
    }
  }
}

// removeCollisionListener
//  Removes collision listeners of an object, glued object, particle or a particle system.. Use this
//  for performance improvements if collision callbacks are no longer necessary
//  for particles or particle systems.
Roygbiv.prototype.removeCollisionListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeCollisionListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectObjectGroupParticleSystemParticle(ROYGBIV.removeCollisionListener, preConditions.sourceObject, sourceObject);
  var curCallbackRequest;
  if ((sourceObject.isAddedObject) || (sourceObject.isObjectGroup)){
    curCallbackRequest = collisionCallbackRequests[sourceObject.name];
  }else if (sourceObject.isParticle){
    curCallbackRequest = particleCollisionCallbackRequests[sourceObject.uuid];
  }else if (sourceObject.isParticleSystem){
    curCallbackRequest = particleSystemCollisionCallbackRequests[sourceObject.name];
  }
  if (curCallbackRequest){
    if ((sourceObject.isAddedObject) || (sourceObject.isObjectGroup)){
      delete collisionCallbackRequests[sourceObject.name];
      TOTAL_OBJECT_COLLISION_LISTENER_COUNT --;
    }else if (sourceObject.isParticle){
      delete particleCollisionCallbackRequests[sourceObject.uuid];
      TOTAL_PARTICLE_COLLISION_LISTEN_COUNT --;
      sourceObject.checkForCollisions = false;
      if (sourceObject.parent){
        sourceObject.parent.notifyParticleCollisionCallbackChange(sourceObject);
      }
    }else if (sourceObject.isParticleSystem){
      TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT --;
      delete particleSystemCollisionCallbackRequests[sourceObject.name];
      sourceObject.checkForCollisions = false;
    }
  }
}

// setExpireListener
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
  sourceObject.expirationFunction = callbackFunction;
}

// removeExpireListener
// Removes the expiration listener function of a particle system.
Roygbiv.prototype.removeExpireListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeExpireListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfParticleSystem(ROYGBIV.removeExpireListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.removeExpireListener, "sourceObject is already expired", (sourceObject.destroyed));
  delete sourceObject.expirationFunction;
}

// setObjectClickListener
// Sets a click listener for an object or an object group. The callbackFunction is executed
// with x, y, z coordinates of the clicked point.
Roygbiv.prototype.setObjectClickListener = function(sourceObject, callbackFunction){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfDefined(ROYGBIV.setObjectClickListener, preConditions.callbackFunction, callbackFunction);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.setObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.setObjectClickListener, "sourceObject marked as unintersectable, cannot be clicked on.", (!sourceObject.isIntersectable));
  preConditions.checkIfFunctionOnlyIfExists(ROYGBIV.setObjectClickListener, preConditions.callbackFunction, callbackFunction);
  sourceObject.clickCallbackFunction = callbackFunction;
}

// removeObjectClickListener
// Removes the click listener of an object or an object group.
Roygbiv.prototype.removeObjectClickListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.removeObjectClickListener, preConditions.sourceObject, sourceObject);
  preConditions.checkIfTrue(ROYGBIV.removeObjectClickListener, "sourceObject is marked as unintersectable.", (!sourceObject.isIntersectable));
  delete sourceObject.clickCallbackFunction;
}

// setScreenClickListener
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

// removeScreenClickListener
// Removes the click listener of screen.
Roygbiv.prototype.removeScreenClickListener = function(){
  if (mode == 0){
    return;
  }
  screenClickCallbackFunction = 0;
}

// setScreenMouseDownListener
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

// removeScreenMouseDownListener
// Removes the mouse down listener of screen.
Roygbiv.prototype.removeScreenMouseDownListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseDownCallbackFunction = 0;
}

// setScreenMouseUpListener
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

// removeScreenMouseUpListener
// Removes mouse up listener for screen.
Roygbiv.prototype.removeScreenMouseUpListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseUpCallbackFunction = 0;
}

// setScreenMouseMoveListener
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

// removeScreenMouseMoveListener
// Removes mouse move listener for screen.
Roygbiv.prototype.removeScreenMouseMoveListener = function(){
  if (mode == 0){
    return;
  }
  screenMouseMoveCallbackFunction = 0;
}

// setScreenPointerLockChangeListener
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

// removeScreenPointerLockChangeListener
// Removes the Pointer Lock change listener for the screen.
Roygbiv.prototype.removeScreenPointerLockChangeListener = function(){
  if (mode == 0){
    return;
  }
  screenPointerLockChangedCallbackFunction = 0;
}

// setParticleSystemPoolConsumedListener
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
  psPool.consumedCallback = callbackFunction;
}

// removeParticleSystemPoolConsumedListener
// Removes the consumption listener of a particle system pool.
Roygbiv.prototype.removeParticleSystemPoolConsumedListener = function(psPool){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeParticleSystemPoolConsumedListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.removeParticleSystemPoolConsumedListener, preConditions.psPool, psPool);
  psPool.consumedCallback = 0;
}

// setParticleSystemPoolAvailableListener
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
  psPool.availableCallback = callbackFunction;
}

// removeParticleSystemPoolAvailableListener
// Removes the availablity listener for a particle system pool.
Roygbiv.prototype.removeParticleSystemPoolAvailableListener = function(psPool){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeParticleSystemPoolAvailableListener, preConditions.psPool, psPool);
  preConditions.checkIfParticleSystemPool(ROYGBIV.removeParticleSystemPoolAvailableListener, preConditions.psPool, psPool);
  psPool.availableCallback = 0;
}

// setFullScreenChangeCallbackFunction
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

// removeFullScreenChangeCallbackFunction
// Removes the fullscreen change listener.
Roygbiv.prototype.removeFullScreenChangeCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  screenFullScreenChangeCallbackFunction = 0;
}

// setFPSDropCallbackFunction
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

// removeFPSDropCallbackFunction
// Removes the callback function for FPS drops.
Roygbiv.prototype.removeFPSDropCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  fpsDropCallbackFunction = 0;
}

// setPerformanceDropCallbackFunction
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

// removePerformanceDropCallbackFunction
// Removes the callback function for performance drops.
Roygbiv.prototype.removePerformanceDropCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  performanceDropCallbackFunction = 0;
  fpsHandler.reset();
}

// setUserInactivityCallbackFunction
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

// removeUserInactivityCallbackFunction
// Removes the user inactivity callback function.
Roygbiv.prototype.removeUserInactivityCallbackFunction = function(){
  if (mode == 0){
    return;
  }
  inactiveCounter = 0;
  userInactivityCallbackFunction = 0;
  maxInactiveTime = 0;
}

// setScreenKeydownListener
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

// removeScreenKeydownListener
// Removes the keydown listener.
Roygbiv.prototype.removeScreenKeydownListener = function(){
  if (mode == 0){
    return;
  }
  screenKeydownCallbackFunction = 0;
}

// setScreenKeyupListener
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

// removeScreenKeyupListener
// Removes the keyup listener.
Roygbiv.prototype.removeScreenKeyupListener = function(){
  if (mode == 0){
    return;
  }
  screenKeyupCallbackFunction = 0;
}

// onTextClick
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
  text.clickCallbackFunction = callbackFunction;
}

// removeTextClickListener
// Removes the click listener of a text object.
Roygbiv.prototype.removeTextClickListener = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeTextClickListener, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.removeTextClickListener, preConditions.text, text);
  text.clickCallbackFunction = 0;
}

// TEXT FUNCTIONS **************************************************************

//setText
// Sets a text to a text object.
Roygbiv.prototype.setText = function(textObject, text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setText, preConditions.textObject, textObject);
  preConditions.checkIfAddedText(ROYGBIV.setText, preConditions.textObject, textObject);
  preConditions.checkIfDefined(ROYGBIV.setText, preConditions.text, text);
  preConditions.checkIfString(ROYGBIV.setText, preConditions.text, text);
  textObject.setText(text, true);
}

// setTextColor
// Sets the color of a text. colorName can be a color name like red or an hex string
// like #afef54.
Roygbiv.prototype.setTextColor = function(text, colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextColor, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextColor, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextColor, preConditions.colorName, colorName);
  text.setColor(colorName, true);
}

// setTextAlpha
// Sets the alpha of a text.
Roygbiv.prototype.setTextAlpha = function(text, alpha){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextAlpha, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextAlpha, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextAlpha, preConditions.alpha, alpha);
  preConditions.checkIfNumber(ROYGBIV.setTextAlpha, preConditions.alpha, alpha);
  text.setAlpha(alpha, true);
}

// setTextPosition
// Sets the position of a text object.
Roygbiv.prototype.setTextPosition = function(text, x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.setTextPosition, preConditions.text, text);
  preConditions.checkIfText2D(ROYGBIV.setTextPosition, preConditions.text, text);
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.setTextPosition, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.setTextPosition, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.setTextPosition, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.setTextPosition, preConditions.z, z);
  text.mesh.position.set(x, y, z);
}

// setTextBackground
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
  text.setBackground(colorName, alpha, true);
}

// removeTextBackground
// Removes the background of a text object.
Roygbiv.prototype.removeTextBackground = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.removeTextBackground, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.removeTextBackground, preConditions.text, text);
  preConditions.checkIfTrue(ROYGBIV.setTextBackground, "text has no background", (!text.hasBackground));
  text.removeBackground(true);
}

// setTextCenterPosition
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
  var centerPos = text.getCenterCoordinates();
  text.mesh.position.set(
    text.mesh.position.x + (x - centerPos.x),
    text.mesh.position.y + (y - centerPos.y),
    text.mesh.position.z + (z - centerPos.z)
  );
}

// hideText
// Makes the given text object invisible. Does nothing if the text is already
// invisible.
Roygbiv.prototype.hideText = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.hideText, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.hideText, preConditions.text, text);
  if (text.mesh.visible){
    text.hide();
  }
}

// showText
// Makes the given text object visible. Does nothing if the text is already
// visible.
Roygbiv.prototype.showText = function(text){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.showText, preConditions.text, text);
  preConditions.checkIfAddedText(ROYGBIV.showText, preConditions.text, text);
  if (!text.mesh.visible){
    text.show();
  }
}

// UTILITY FUNCTIONS ***********************************************************

// vector
//  Creates a new vector from x, y and z coordinates.
Roygbiv.prototype.vector = function(x, y, z){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.vector, preConditions.x, x);
  preConditions.checkIfDefined(ROYGBIV.vector, preConditions.y, y);
  preConditions.checkIfDefined(ROYGBIV.vector, preConditions.z, z);
  preConditions.checkIfNumber(ROYGBIV.vector, preConditions.x, x);
  preConditions.checkIfNumber(ROYGBIV.vector, preConditions.y, y);
  preConditions.checkIfNumber(ROYGBIV.vector, preConditions.z, z);
  var obj = new Object();
  obj.x = x;
  obj.y = y;
  obj.z = z;

  return obj;
}

// distance
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

// sub
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

// add
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

// moveTowards
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

// applyNoise
//  Applies Perlin noise to given vector [amount] times and returns the
//  distorted value. The default amount is 1. Setting the amount too high can
//  cause performance issues.
Roygbiv.prototype.applyNoise = function(vec, amount){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.applyNoise, preConditions.vec, vec);
  preConditions.checkIfVectorOnlyIfDefined(ROYGBIV.applyNoise, preConditions.vec, vec);
  var toNormalize = REUSABLE_VECTOR.set(vec.x, vec.y, vec.z);
  toNormalize.normalize();
  var noiseAmount = noise.perlin3(
    toNormalize.x, toNormalize.y, toNormalize.z
  );
  var vector3 = REUSABLE_VECTOR_2.set(vec.x, vec.y, vec.z);
  var toMultiplyScalar = REUSABLE_VECTOR_3.set(vec.x, vec.y, vec.z);
  toMultiplyScalar.multiplyScalar(noiseAmount);
  vector3.add(toMultiplyScalar);
  if (!amount){
    return this.vector(vector3.x, vector3.y, vector3.z);
  }else if (amount && !isNaN(amount) && amount > 1){
    var noised = this.vector(vector3.x, vector3.y, vector3.z);
    for (var i = 0; i<amount; i++){
      noised = this.applyNoise(noised);
    }
    return noised;
  }
}

// sphericalDistribution
//  Returns a vector sampled around an imaginary sphere of given radius centered
//  at (0, 0, 0)
Roygbiv.prototype.sphericalDistribution = function(radius){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.sphericalDistribution, preConditions.radius, radius);
  preConditions.checkIfNumber(ROYGBIV.sphericalDistribution, preConditions.radius, radius);
  preConditions.checkIfLessThan(ROYGBIV.sphericalDistribution, preConditions.radius, radius, 0);
  REUSABLE_VECTOR.set(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  );
  REUSABLE_VECTOR.normalize();
  REUSABLE_VECTOR.multiplyScalar(radius);
  return this.vector(REUSABLE_VECTOR.x, REUSABLE_VECTOR.y, REUSABLE_VECTOR.z);
}

// boxDistribution
//  Returns a vector sampled on a face of a box centered at (0, 0, 0).
//  The size of the boxis specified with the parameters sizeX, sizeY and sizeZ.
//  The optional parameter side can be used to generate the point on a
//  specific face.
//  side = 1 -> UP
//  side = 2 -> DOWN
//  side = 3 -> FRONT
//  side = 4 -> BACK
//  side = 5 -> RIGHT
//  side = 6 -> LEFT
Roygbiv.prototype.boxDistribution = function(sizeX, sizeY, sizeZ, side){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.boxDistribution, preConditions.sizeX, sizeX);
  preConditions.checkIfDefined(ROYGBIV.boxDistribution, preConditions.sizeY, sizeY);
  preConditions.checkIfDefined(ROYGBIV.boxDistribution, preConditions.sizeZ, sizeZ);
  preConditions.checkIfNumber(ROYGBIV.boxDistribution, preConditions.sizeX, sizeX);
  preConditions.checkIfNumber(ROYGBIV.boxDistribution, preConditions.sizeY, sizeY);
  preConditions.checkIfNumber(ROYGBIV.boxDistribution, preConditions.sizeZ, sizeZ);
  preConditions.checkIfLessThanExclusive(ROYGBIV.boxDistribution, preConditions.sizeX, sizeX, 0);
  preConditions.checkIfLessThanExclusive(ROYGBIV.boxDistribution, preConditions.sizeY, sizeY, 0);
  preConditions.checkIfLessThanExclusive(ROYGBIV.boxDistribution, preConditions.sizeZ, sizeZ, 0);
  var randomSide = Math.floor(Math.random() * 6) + 1;
  if (typeof side != UNDEFINED &&!isNaN(side) && side <= 6 && side >= 1){
    randomSide = side;
  }
  var x, y, z;
  var maxX = sizeX / 2, minX = -1 * sizeX / 2;
  var maxY = sizeY / 2, minY = -1 * sizeY / 2;
  var maxZ = sizeZ / 2, minZ = -1 * sizeZ / 2;
  // 1, 2 -> XZ
  // 3, 4 -> XY
  // 5, 6 -> YZ
  switch (randomSide){
    case 1:
      y = sizeY / 2;
    break;
    case 2:
      y = -1 * sizeY / 2;
    break;
    case 3:
      z = sizeZ / 2;
    break;
    case 4:
      z = -1 * sizeZ / 2;
    break;
    case 5:
      x = sizeX / 2;
    break;
    case 6:
      x = -1 * sizeX / 2;
    break;
  }
  if (typeof x == UNDEFINED){
    x = Math.random () * (maxX - minX) + minX;
  }
  if (typeof y == UNDEFINED){
    y = Math.random () * (maxY - minY) + minY;
  }
  if (typeof z == UNDEFINED){
    z = Math.random () * (maxZ - minZ) + minZ;
  }
  return this.vector(x, y, z);
}

// color
//  Creates a new color object from the given HTML color name.
Roygbiv.prototype.color = function(colorName){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.color, preConditions.colorName, colorName);
  return new THREE.Color(colorName.toLowerCase());
}

// runScript
//  Starts a script of the given name.
Roygbiv.prototype.runScript = function(name){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.runScript, preConditions.name, name);
  var script = scripts[name];
  preConditions.checkIfScriptExists(ROYGBIV.runScript, null, script);
  script.start();
}

// isRunning
//  Returns whether a script of the given name is running or not.
Roygbiv.prototype.isRunning = function(name){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.isRunning, preConditions.name, name);
  var script = scripts[name];
  preConditions.checkIfScriptExists(ROYGBIV.isRunning, null, script);
  return script.isRunning();
}

// normalizeVector
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

// computeQuaternionFromVectors
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

// circularDistribution
//  Returns a random point sampled around an imaginary circle with given radius and given
//  quaternion in 3D space. If no quaternion is specified the circle is sampled on the XY plane.
Roygbiv.prototype.circularDistribution = function(radius, quaternion){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.circularDistribution, preConditions.radius, radius);
  preConditions.checkIfNumber(ROYGBIV.circularDistribution, preConditions.radius, radius);
  preConditions.checkIfLessThan(ROYGBIV.circularDistribution, preConditions.radius, radius, 0);
  preConditions.checkIfQuaternionOnlyIfDefined(ROYGBIV.circularDistribution, preConditions.quaternion, quaternion);
  REUSABLE_VECTOR_3.set(
    Math.random() - 0.5,
    Math.random() - 0.5,
    0
  );
  REUSABLE_VECTOR_3.normalize();
  REUSABLE_VECTOR_3.multiplyScalar(radius);
  if (!(typeof quaternion == UNDEFINED)){
    REUSABLE_VECTOR_3.applyQuaternion(quaternion);
  }
  return this.vector(REUSABLE_VECTOR_3.x, REUSABLE_VECTOR_3.y, REUSABLE_VECTOR_3.z);
}

// multiplyScalar
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

// setVector
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

// quaternion
// Returns a new THREE.Quaternion instance.
Roygbiv.prototype.quaternion = function(){
  return new THREE.Quaternion();
}

// requestPointerLock
// Requests pointer lock from window on the next click.
Roygbiv.prototype.requestPointerLock = function(){
  if (mode == 0){
    return;
  }
  preConditions.checkIfTrue(ROYGBIV.requestPointerLock, "Pointer Lock API is not supported by this browser", (!pointerLockSupported || isMobile));
  pointerLockRequested = true;
}

// convertEulerToDegrees
// Returns the degree equivalent of an Euler angle.
Roygbiv.prototype.convertEulerToDegrees = function(eulerAngle){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.convertEulerToDegrees, preConditions.eulerAngle, eulerAngle);
  preConditions.checkIfNumber(ROYGBIV.convertEulerToDegrees, preConditions.eulerAngle, eulerAngle);
  return ((eulerAngle * 180) / Math.PI);
}

// disableDefaultControls
// Disables or enables the default WASD camera controls. This function can be used
// before implementing manual camera controls.
Roygbiv.prototype.disableDefaultControls = function(isDisabled){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.disableDefaultControls, preConditions.isDisabled, isDisabled);
  preConditions.checkIfBooleanOnlyIfExists(ROYGBIV.disableDefaultControls, preConditions.isDisabled, isDisabled);
  defaultCameraControlsDisabled = isDisabled;
}

// isKeyPressed
// Returns whether the given key is pressed or not. See the keyCodeToChar
// variable for possible key names.
Roygbiv.prototype.isKeyPressed = function(key){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.isKeyPressed, preConditions.key, key);
  return keyboardBuffer[key];
}

// setCameraPosition
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

// lookAt
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

// applyAxisAngle
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

// trackObjectPosition
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
  sourceObject.trackedObject = targetObject;
  targetObject.isTracked = true;
  trackingObjects[sourceObject.name] = sourceObject;
  targetObject.oldPX = targetObject.physicsBody.position.x;
  targetObject.oldPY = targetObject.physicsBody.position.y;
  targetObject.oldPZ = targetObject.physicsBody.position.z;
}

// untrackObjectPosition
// Stops tracking an objects position for an object.
Roygbiv.prototype.untrackObjectPosition = function(sourceObject){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.untrackObjectPosition, preConditions.sourceObject, sourceObject);
  preConditions.checkIfAddedObjectOrObjectGroup(ROYGBIV.untrackObjectPosition, preConditions.sourceObject, sourceObject);
  delete sourceObject.trackedObject;
  delete trackingObjects[sourceObject.name];
}

// createRotationPivot
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
  return sourceObject.makePivot(offsetX, offsetY, offsetZ);
}

// rotateCamera
// Rotates the camera around its axis by given radians.
Roygbiv.prototype.rotateCamera = function(axis, radians){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.rotateCamera, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.rotateCamera, preConditions.radians, radians);
  preConditions.checkIfNumber(ROYGBIV.rotateCamera, preConditions.radians, radians);
  axis = axis.toLowerCase();
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.rotateCamera, preConditions.axis, axis);
  if (axis == "x"){
    cameraRotationBuffer.x += radians;
  }else if (axis == "y"){
    cameraRotationBuffer.y += radians;
  }else if (axis == "z"){
    cameraRotationBuffer.z += radians;
  }
}

// translateCamera
// Translates the camera along given axis by given amount.
Roygbiv.prototype.translateCamera = function(axis, amount){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.translateCamera, preConditions.axis, axis);
  preConditions.checkIfDefined(ROYGBIV.translateCamera, preConditions.amount, amount);
  preConditions.checkIfNumber(ROYGBIV.translateCamera, preConditions.amount, amount);
  axis = axis.toLowerCase();
  preConditions.checkIfAxisOnlyIfDefined(ROYGBIV.translateCamera, preConditions.axis, axis);
  if (axis == "x"){
    camera.translateX(amount * defaultAspect / camera.aspect);
  }else if (axis == "y"){
    camera.translateY(amount * defaultAspect / camera.aspect);
  }else if (axis == "z"){
    camera.translateZ(amount * defaultAspect / camera.aspect);
  }
}

// requestFullScreen
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

// isMouseDown
// Returns true if the mouse is pressed, false otherwise.
Roygbiv.prototype.isMouseDown = function(){
  if (mode == 0){
    return;
  }
  return isMouseDown;
}

// intersectionTest
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
  rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, false, onComplete);
}

// isMobile
// Returns if the current client is a mobile client.
Roygbiv.prototype.isMobile = function(){
  if (mode == 0){
    return;
  }
  return isMobile;
}

// lerp
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

// setBloom
// Sets the Bloom effect properties of the scene. Parameters are:
// strength (optional): The bloom strength between [0, 3]
// radius (optional): The bloom radius between [0, 1]
// threshold (optional): The bloom threshold between [0, 1]
// resolutionScale (optional): The bloom resolution scale between [0.1, 1]
Roygbiv.prototype.setBloom = function(params){
  if (mode == 0){
    return;
  }
  preConditions.checkIfDefined(ROYGBIV.setBloom, preConditions.params, params);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setBloom, preConditions.strength, params.strength);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.setBloom, preConditions.strength, params.strength, 0, 3);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setBloom, preConditions.radius, params.radius);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.setBloom, preConditions.radius, params.radius, 0, 1);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setBloom, preConditions.threshold, params.threshold);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.setBloom, preConditions.threshold, params.threshold, 0, 1);
  preConditions.checkIfNumberOnlyIfExists(ROYGBIV.setBloom, preConditions.resolutionScale, params.resolutionScale);
  preConditions.checkIfInRangeOnlyIfDefined(ROYGBIV.setBloom, preConditions.resolutionScale, params.resolutionScale, 0.1, 1);
  var hasStrength = false, hasRadius = false, hasThreshold = false, hasResolutionScale = false;
  if (!(typeof params.strength == UNDEFINED)){
    hasStrength = true;
  }
  if (!(typeof params.radius == UNDEFINED)){
    hasRadius = true;
  }
  if (!(typeof params.threshold == UNDEFINED)){
    hasThreshold = true;
  }
  if (!(typeof params.resolutionScale == UNDEFINED)){
    hasResolutionScale = true;
  }
  bloomOn = true;
  if (hasStrength){
    bloomStrength = params.strength;
  }
  if (hasRadius){
    bloomRadius = params.radius;
  }
  if (hasThreshold){
    bloomThreshold = params.threshold;
  }
  if (hasResolutionScale){
    adjustPostProcessing(4, params.resolutionScale);
  }else{
    adjustPostProcessing(-1, null);
  }
}

// unsetBloom
// Unsets the Bloom effect.
Roygbiv.prototype.unsetBloom = function(){
  if (mode == 0){
    return;
  }
  adjustPostProcessing(5, false);
  if (!isDeployment){
    postprocessingParameters["Bloom"] = false;
  }
}

// pause
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
