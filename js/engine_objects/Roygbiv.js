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
var Roygbiv = function(){
  this.functionNames = [
    "getObject",
    "getParticleSystem",
    "getChildObject",
    "getRandomColor",
    "hide",
    "show",
    "getLight",
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
    "toggleLight",
    "setMass",
    "runScript",
    "isRunning",
    "translate",
    "getPosition",
    "mapTexturePack",
    "getRotation",
    "intensity",
    "getIntensity",
    "opacity",
    "getOpacity",
    "shininess",
    "getShininess",
    "textureOffsetX",
    "textureOffsetY",
    "textureOffset",
    "heightMapScale",
    "getHeightMapScale",
    "heightMapBias",
    "getHeightMapBias",
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
    "emissiveIntensity",
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
    "unsetRotationPivot"
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
Roygbiv.prototype.getChildObject = function(gluedObject, childObjectName){
  if (mode == 0){
    return;
  }
  if (!gluedObject){
    throw new Error("getChildObject error: glued object is undefined.");
    return;
  }
  if (!(gluedObject instanceof ObjectGroup)){
    throw new Error("getChildObject error: Type not supported.");
    return;
  }
  var child = gluedObject.childObjectsByName[childObjectName];
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

// getLight
//  Returns the light having the name given as parameter or zero if no such
//  light is found.
Roygbiv.prototype.getLight = function(name){

}

// getPosition
//  Returns the (x, y, z) coordinates of an object, glued object, point light
//  or a particle system. If a specific axis is specified, only the position
//  on the specified axis is returned.
Roygbiv.prototype.getPosition = function(object, targetVector, axis){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("getPosition error: Object is undefined.");
    return;
  }
  if (axis){
    if (axis.toLowerCase() != "x" && axis.toLowerCase() != "y" && axis.toLowerCase() != "z"){
      throw new Error("getPosition error: Axis must be one of x, y, or z.");
      return;
    }
  }
  if (!(typeof targetVector == UNDEFINED) && !(targetVector == null)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("getPosition error: Bad targetVector parameter.");
      return;
    }
  }
  if (object instanceof AddedObject){
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
  }else if (object.isPointLight){
    if (axis){
      if (axis.toLowerCase() == "x"){
        return object.position.x;
      }else if (axis.toLowerCase() == "y"){
        return object.position.y;
      }else if (axis.toLowerCase() == "z"){
        return object.position.z;
      }
    }else{
      if (targetVector){
        targetVector.x = object.position.x;
        targetVector.y = object.position.y;
        targetVector.z = object.position.z;
        return targetVector;
      }else{
        return this.vector(
          object.position.x,
          object.position.y,
          object.position.z
        );
      }
    }
  }else if (object instanceof ObjectGroup){
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
  }else if (object instanceof ParticleSystem){
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
  }else{
    throw new Error("getPosition error: Object type not supported.");
    return;
  }
}

// getRotation
//  Returns the rotation of given object, glued object or particle system. If an axis
//  is specified (x, y or z) only the rotation around the specified axis is returned,
//  a vector containing (x, y, z) rotations is returned otherwise.
Roygbiv.prototype.getRotation = function(object, axis){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("getRotation error: Object is not defined.");
    return;
  }
  if (!(typeof axis == UNDEFINED)){
    if (axis.toLowerCase() != "x" && axis.toLowerCase() != "y" && axis.toLowerCase() != "z"){
      throw new Error("getRotation error: Axis must be one of x, y, or z");
      return;
    }
  }
  if (object instanceof AddedObject){
    if (typeof axis == UNDEFINED){
      return this.vector(
        object.mesh.rotation.x,
        object.mesh.rotation.y,
        object.mesh.rotation.z
      );
    }
    if (axis.toLowerCase() == "x"){
      return object.mesh.rotation.x;
    }else if (axis.toLowerCase() == "y"){
      return object.mesh.rotation.y;
    }else if (axis.toLowerCase() == "z"){
      return object.mesh.rotation.z;
    }
  }else if (object instanceof ObjectGroup){
    if (typeof axis == UNDEFINED){
      return this.vector(
        object.graphicsGroup.rotation.x,
        object.graphicsGroup.rotation.y,
        object.graphicsGroup.rotation.z,
      );
    }
    if (axis.toLowerCase() == "x"){
      return object.graphicsGroup.rotation.x;
    }else if (axis.toLowerCase() == "y"){
      return object.graphicsGroup.rotation.y;
    }else if (axis.toLowerCase() == "z"){
      return object.graphicsGroup.rotation.z;
    }
  }else if (object instanceof ParticleSystem){
    if (typeof axis == UNDEFINED){
      return this.vector(
        object.mesh.rotation.x,
        object.mesh.rotation.y,
        object.mesh.rotation.z
      );
    }
    if (axis.toLowerCase() == "x"){
      return object.mesh.rotation.x;
    }else if (axis.toLowerCase() == "y"){
      return object.mesh.rotation.y;
    }else if (axis.toLowerCase() == "z"){
      return object.mesh.rotation.z;
    }
  }else{
    throw new Error("getRotation error: Type not supported.");
    return;
  }
}

// getIntensity
//  Returns the intensity of given ambient light or point light.
Roygbiv.prototype.getIntensity = function(light){
  if (mode == 0){
    return;
  }
  if (!light){
    throw new Error("getIntensity error: Light is not defined.");
    return;
  }
  if (!light.isAmbientLight && !light.isPointLight){
    throw new Error("getIntensity error: Type not supported.");
    return;
  }
  return light.intensity;
}

// getOpacity
//  Returns the opacity of given object.
Roygbiv.prototype.getOpacity = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("getOpacity error: Object is undefined.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("getOpacity error: Type not supported.");
    return;
  }
  return object.mesh.material.uniforms.alpha.value;
}

// getShininess
//  Returns the shininess of an object. Only the objects who have Phong materials
//  have shininess property.
Roygbiv.prototype.getShininess = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("getShininess error: Object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("getShininess error: Type not supported.");
    return;
  }
  if (!object.material.isMeshPhongMaterial){
    throw new Error("getShininess error: Only phong materials have shininess property.");
    return;
  }
  return object.material.shininess;
}

// getHeightMapScale
//  Returns the height map scale of an object. Only the objects that have Phong
//  materials have height maps.
Roygbiv.prototype.getHeightMapScale = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("getHeightMapScale error: Object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("getHeightMapScale error: Type not supported.");
    return;
  }
  if (!object.hasDisplacementMap()){
    throw new Error("getHeightMapScale error: No height texture mapped to the object.");
    return;
  }
  return object.mesh.material.uniforms.displacementInfo.value.x;
}

// getHeightMapBias
//  Returns the height map bias of an object. Only the objects that have Phong
//  materials have height maps.
Roygbiv.prototype.getHeightMapBias = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("getHeightMapBias error: Object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("getHeightMapBias error: Type not supported.");
    return;
  }
  if (!object.hasDisplacementMap()){
    throw new Error("getHeightMapBias error: No height texture mapped to the object.");
    return;
  }
  return object.mesh.material.uniforms.displacementInfo.value.y;
}

// getMarkedPosition
//  Returns (x,y,z) coordinates of a point marked using the mark command.
Roygbiv.prototype.getMarkedPosition = function(markedPointName){
  if (mode == 0){
    return;
  }
  if (typeof markedPointName == UNDEFINED){
    throw new Error("getMarkedPosition error: markedPointName is not defined.");
    return;
  }
  var markedPoint = markedPoints[markedPointName];
  if (!markedPoint){
    throw new Error("getMarkedPosition error: No such marked point.");
    return;
  }
  return this.vector(markedPoint.x, markedPoint.y, markedPoint.z);
}

// getParticleSystemVelocityAtTime
// Calcualtes and returns the velocity vector of a particle system at given time.
// For particles with circular motion, this function returns the angular velocity
// at given time.
Roygbiv.prototype.getParticleSystemVelocityAtTime = function(particleSystem, time, targetVector){
  if (mode == 0){
    return;
  }
  if (!particleSystem){
    throw new Error("getParticleSystemVelocityAtTime error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("getParticleSystemVelocityAtTime error: Unsupported particleSystem type.");
    return;
  }
  if (typeof time == UNDEFINED){
    throw new Error("getParticleSystemVelocityAtTime error: time is not defined.");
    return;
  }
  if (isNaN(time)){
    throw new Error("getParticleSystemVelocityAtTime error: time is not a number.");
    return;
  }
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x ) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("getParticleSystemVelocityAtTime error: Bad targetVector parameter.");
      return;
    }
  }
  return particleSystem.getVelocityAtTime(time, targetVector);
}

// getCameraDirection
// Returns the direction vector of the camera.
Roygbiv.prototype.getCameraDirection = function(targetVector){
  if (mode == 0){
    return;
  }
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("getCameraDirection error: Bad targetVector parameter.");
      return;
    }
  }
  REUSABLE_VECTOR.set(0, 0, -1).applyQuaternion(camera.quaternion);
  if (!targetVector){
    return this.vector(REUSABLE_VECTOR.x, REUSABLE_VECTOR.y, REUSABLE_VECTOR.z);
  }else{
    targetVector.x = REUSABLE_VECTOR.x;
    targetVector.y = REUSABLE_VECTOR.y;
    targetVector.z = REUSABLE_VECTOR.z;
    return targetVector;
  }
}

// getCameraPosition
// Returns the position of the camera.
Roygbiv.prototype.getCameraPosition = function(targetVector){
  if (mode == 0){
    return;
  }
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("getCameraPosition error: Bad targetVector parameter.");
      return;
    }
  }
  if (!targetVector){
    return this.vector(camera.position.x, camera.position.y, camera.position.z);
  }else{
    targetVector.x = camera.position.x;
    targetVector.y = camera.position.y;
    targetVector.z = camera.position.z;
    return targetVector;
  }
}

// getParticleSystemPool
// Finds a particle system pool by name and returns it.
Roygbiv.prototype.getParticleSystemPool = function(name){
  if (mode == 0){
    return;
  }
  if (typeof name == UNDEFINED){
    throw new Error("getParticleSystemPool error: name is not defined.");
    return;
  }
  var psPool = particleSystemPools[name];
  if (!psPool){
    throw new Error("getParticleSystemPool error: No such particle system pool.");
    return;
  }
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
  if (typeof pool == UNDEFINED){
    throw new Error("getParticleSystemFromPool error: pool is not defined.");
    return;
  }
  if (!(pool instanceof ParticleSystemPool)){
    throw new Error("getParticleSystemFromPool error: Type not supported.");
    return;
  }
  if (pool.destroyed){
    throw new Error("getParticleSystemFromPool error: pool is destroyed.");
    return;
  }
  return pool.get();
}

// OBJECT MANIPULATION FUNCTIONS ***********************************************

// hide
//  Hides an object or a glued object, removes it from the scene. Does nothing
//  if the object is already hidden.
Roygbiv.prototype.hide = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("hide error: object is not defined.");
    return;
  }
  if (object instanceof AddedObject){
    if (!addedObjects[object.name]){
      throw new Error("hide error: Cannot hide a child object. Use the parent object instead.");
      return;
    }
    if (!object.isChangeable){
      throw new Error("hide error: Object is not marked as changeable.");
      return;
    }
    if (object.isVisibleOnThePreviewScene()){
      object.mesh.visible = false;
      // The reason we use delayed execution here is that
      // during the collision callback, cannon.js crashes if a body
      // is removed. It is safe to remove the bodies after the
      // physics iteration.
      setTimeout(function(){
        physicsWorld.removeBody(object.physicsBody);
      });
      object.isHidden = true;
      rayCaster.binHandler.hide(object);
    }
  }else if (object instanceof ObjectGroup){
    if (!object.isChangeable){
      throw new Error("hide error: object is not marked as changeable.");
      return;
    }
    if (object.isVisibleOnThePreviewScene()){
      object.mesh.visible = false;
      setTimeout(function(){
        physicsWorld.removeBody(object.physicsBody);
      });
      object.isHidden = true;
      rayCaster.binHandler.hide(object);
    }
  }else{
    throw new Error("hide error: Unsupported type.");
    return;
  }
}

// show
//  Makes a hidden object or glued object visible. Does nothing if the object is
//  already visible.
Roygbiv.prototype.show = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("show error: object is not defined.");
    return;
  }
  if (object instanceof AddedObject){
    if (!addedObjects[object.name]){
      throw new Error("show error: Cannot show a child object. Use the parent object instead.");
      return;
    }
    if (!object.isChangeable){
      throw new Error("show error: object is not marked as changeable.");
      return;
    }
    if (!object.isVisibleOnThePreviewScene()){
      object.mesh.visible = true;
      setTimeout(function(){
        physicsWorld.addBody(object.physicsBody);
      });
      object.isHidden = false;
      rayCaster.binHandler.show(object);
    }
  }else if (object instanceof ObjectGroup){
    if (!object.isChangeable){
      throw new Error("show error: object is not marked as changeable.");
      return;
    }
    if (!object.isVisibleOnThePreviewScene()){
      object.mesh.visible = true;
      setTimeout(function(){
        physicsWorld.addBody(object.physicsBody);
      });
      object.isHidden = false;
      rayCaster.binHandler.show(object);
    }
  }else{
    throw new Error("show error: Unsupported type.");
    return;
  }
}

// applyForce
// Applies a physical force to an object or a glued object from a given point.
Roygbiv.prototype.applyForce = function(object, force, point){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("applyForce error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("applyForce error: object type is not supported.");
    return;
  }
  if (!object.isDynamicObject){
    throw new Error("applyForce error: object is not dynamic.");
    return;
  }
  if (!force){
    throw new Error("applyForce error: force is not defined.");
    return;
  }
  if (!point){
    throw new Error("applyForce error: point is not defined.");
    return;
  }
  if (typeof force.x == UNDEFINED || typeof force.y == UNDEFINED || typeof force.z == UNDEFINED){
    throw new Error("applyForce error: force is not a vector.");
    return;
  }
  if (typeof point.x == UNDEFINED || typeof point.y == UNDEFINED || typeof point.z == UNDEFINED){
    throw new Error("applyForce error: point is not a vector.");
  }
  if (!isPhysicsWorkerEnabled()){
    REUSABLE_CANNON_VECTOR.set(force.x, force.y, force.z);
    REUSABLE_CANNON_VECTOR_2.set(point.x, point.y, point.z);
    object.physicsBody.applyImpulse(
      REUSABLE_CANNON_VECTOR,
      REUSABLE_CANNON_VECTOR_2
    );
  }
}

// rotate
//  Rotates an object or a glued object around a given axis by given radians.
//  The parameter axis must be one of x, y or z. Objects are rotated around
//  their own centers, so their positions do not change when rotated using this
//  function.
Roygbiv.prototype.rotate = function(object, axis, radians){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("rotate error: Object undefined.");
    return;
  }
  if (typeof axis == "UNDEFINED"){
    throw new Error("rotate error: axis is not defined.");
    return;
  }
  axis = axis.toLowerCase();
  if (axis != "x" && axis != "y" && axis != "z"){
    throw new Error("rotate error: Axis must be one of x, y, or z.");
    return;
  }
  if (isNaN(radians)){
    throw new Error("rotate error: Radians value is not a number.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup) && !(object instanceof ParticleSystem)){
    throw new Error("rotate error: Type not supported.");
    return;
  }
  var isObject = false;
  if ((object instanceof AddedObject) || (object instanceof ObjectGroup)){
    isObject = true;
    if (object.isHidden){
      throw new Error("rotate error: Object is not visible.");
      return;
    }
  }
  if (object instanceof AddedObject && object.parentObjectName){
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
  if ((object instanceof AddedObject) || (object instanceof ObjectGroup)){
    if (!object.isChangeable){
      throw new Error("rotate error: object is not marked as changeable.");
      return;
    }
  }
  if (object.pivotObject){
    object.rotateAroundPivotObject(axis, radians);
    return;
  }
  object.rotate(axis, radians, true);
}

// rotateAroundXYZ
//  Rotates an object, a glued object or a point light around the given (x, y, z)
//  Unlike the rotate function, the positions of the objects can change when rotated
//  using this function. If the optional skipLocalRotation flag is set, the object is
//  not rotated in its local axis system.
Roygbiv.prototype.rotateAroundXYZ = function(object, x, y, z, radians, axis, skipLocalRotation){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("rotateAroundXYZ error: Object is undefined.");
    return;
  }
  if (isNaN(x)){
    throw new Error("rotateAroundXYZ error: X is not a number.");
    return;
  }
  if (isNaN(y)){
    throw new Error("rotateAroundXYZ error: Y is not a number.");
    return;
  }
  if (isNaN(z)){
    throw new Error("rotateAroundXYZ error: Z is not a number.");
    return;
  }
  if (isNaN(radians)){
    throw new Error("rotateAroundXYZ error: Radian value is not a number.");
    return;
  }
  if (typeof axis == UNDEFINED){
    throw new Error("rotateAroundXYZ error: axis is not defined.");
  }
  if (axis.toLowerCase() != "x" && axis.toLowerCase() != "y" && axis.toLowerCase() != "z"){
    throw new Error("rotateAroundXYZ error: Axis must be one of x,y or z");
    return;
  }
  if (!(typeof skipLocalRotation == UNDEFINED)){
    if (!(typeof skipLocalRotation == "boolean")){
      throw new Error("rotateAroundXYZ error: skipLocalRotation must be a boolean.");
    }
  }
  var axisVector;
  if (axis.toLowerCase() == "x"){
    axisVector = THREE_AXIS_VECTOR_X;
  }else if (axis.toLowerCase() == "y"){
    axisVector = THREE_AXIS_VECTOR_Y;
  }else if (axis.toLowerCase() == "z"){
    axisVector = THREE_AXIS_VECTOR_Z;
  }
  var mesh;
  if (object instanceof AddedObject){
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
    if (!object.isChangeable){
      throw new Error("rotateAroundXYZ error: object is not marked as changeable.");
      return;
    }
    mesh = object.mesh;
  }else if (object instanceof ObjectGroup){
    if (!object.isChangeable){
      throw new Error("rotateAroundXYZ error: object is not marked as changeable.");
      return;
    }
    mesh = object.mesh;
  }else if (object.isPointLight){
    mesh = object;
  }else{
    throw new Error("rotateAroundXYZ error: Type not supported.");
    return;
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
  if (object instanceof AddedObject){
    object.setPhysicsAfterRotationAroundPoint(axis, radians);
    rayCaster.updateObject(object);
  }else if (object instanceof ObjectGroup){
    object.physicsBody.quaternion.copy(mesh.quaternion);
    object.physicsBody.position.copy(mesh.position);
    rayCaster.updateObject(object);
  }
}

// setPosition
//  Puts an object, glued object or point light to
//  the specified (x, y, z) coordinate.
Roygbiv.prototype.setPosition = function(obj, x, y, z){
  if (mode == 0){
    return;
  }
  if (!obj){
    throw new Error("setPosition error: Object is undefined");
    return;
  }
  if (isNaN(x)){
    throw new Error("setPosition error: X is not a number.");
    return;
  }
  if (isNaN(y)){
    throw new Error("setPosition error: Y is not a number.");
    return;
  }
  if (isNaN(z)){
    throw new Error("setPosition error: Z is not a number.");
    return;
  }
  if (obj instanceof AddedObject){
    if (obj.isHidden){
      throw new Error("setPosition error: Object is not visible.");
      return;
    }

    if (obj.parentObjectName){
      var objGroup = objectGroups[obj.parentObjectName];
      if (objGroup){
        this.setPosition(objGroup, x, y, z);
        return;
      }else{
        throw new Error("setPosition error: Parent not defined.");
        return;
      }
    }
    if (!obj.isChangeable){
      throw new Error("setPosition error: object is not marked as changeable.");
      return;
    }
    obj.mesh.position.set(x, y, z);
    obj.physicsBody.position.set(x, y, z);
    rayCaster.updateObject(obj);
  }else if (obj instanceof ObjectGroup){
    if (obj.isHidden){
      throw new Error("setPosition error: Object is not visible.");
      return;
    }
    if (!obj.isChangeable){
      throw new Error("setPosition error: object is not marked as changeable.");
      return;
    }
    obj.mesh.position.set(x, y, z);
    obj.graphicsGroup.position.set(x, y, z);
    obj.physicsBody.position.set(x, y, z);
    rayCaster.updateObject(obj);
  }else if (obj.isPointLight){
    obj.position.set(x, y, z);
  }else{
    throw new Error("setPosition error: Type not supported.");
    return;
  }
}

// toggleLight
//  Turns on/off a light.
Roygbiv.prototype.toggleLight = function(light){
  if (mode == 0){
    return;
  }
  if (!light){
    throw new Error("toggleLight error: Parameter is undefined.");
    return;
  }
  if (!light.isPointLight && !light.isAmbientLight){
    throw new Error("toggleLight error: Parameter is not a light object.");
    return;
  }
  if (!light.turnedOff){
    light.oldIntensity = light.intensity;
    light.intensity = 0;
    light.turnedOff = true;
  }else{
    light.intensity = light.oldIntensity;
    light.turnedOff = false;
  }
}

// setMass
//  Sets the mass property of an object or a glued object. Objects are considered
//  dynamic if and only if their mass is greater than zero.
Roygbiv.prototype.setMass = function(object, mass){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("setMass error: Object is undefined.");
    return;
  }
  if (typeof mass == UNDEFINED){
    throw new Error("setMass error: mass is undefined.");
    return;
  }
  if (isNaN(mass)){
    throw new Error("setMass error: mass is not a number.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("setMass error: Unsupported type.");
    return;
  }
  if (!object.isChangeable){
    throw new Error("setMass error: object is not marked as changeable.");
    return;
  }
  if ((object instanceof AddedObject) && !(addedObjects[object.name])){
    throw new Error("setMass error: Cannot set mass of child objects. Use the parent object instead.");
    return;
  }
  if (typeof object.originalMass == UNDEFINED){
    object.originalMass = object.mass;
  }
  if (typeof object.mass == UNDEFINED){
    object.originalMass = 0;
    object.mass = 0;
  }
  object.setMass(mass);
  if (object instanceof AddedObject){
    if (mass > 0){
      dynamicObjects[object.name] = object;
    }else{
      delete dynamicObjects[object.name];
    }
  }else if (object instanceof ObjectGroup){
    if (mass > 0){
      dynamicObjectGroups[object.name] = object;
    }else{
      delete dynamicObjectGroups[object.name];
    }
  }
}

// translate
//  Translates an object, glued object or point light on
//  the given axis by the given amount. Axis must be one of x, y or z.
Roygbiv.prototype.translate = function(object, axis, amount){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("translate error: Object not defined.");
    return;
  }
  axis = axis.toLowerCase();
  if (axis != "x" && axis!= "y" && axis != "z"){
    throw new Error("translate error: Axis must be one of x, y, or z.");
    return;
  }
  if (isNaN(amount)){
    throw new Error("translate error: Amount is not a number.");
    return;
  }
  if (object instanceof AddedObject){
    if (object.parentObjectName){
      var parentObject = objectGroups[object.parentObjectName];
      if (parentObject){
        this.translate(parentObject, axis, amount);
        return;
      }
    }
    if (!object.isChangeable){
      throw new Error("translate error: object is not marked as changeable.");
      return;
    }
    object.translate(axis, amount, true);
  }else if (object instanceof ObjectGroup){
    if (!object.isChangeable){
      throw new Error("translate error: object is not marked as changeable.");
      return;
    }
    object.translate(axis, amount, true);
  }else if (object.isPointLight){
    if (axis.toLowerCase() == "x"){
      object.position.x += amount;
    }else if (axis.toLowerCase() == "y"){
      object.position.y += amount;
    }else if (axis.toLowerCase() == "z"){
      object.position.z += amount;
    }
  }else {
    throw new Error("translate error: Type not supported.");
    return;
  }
}

// mapTexturePack
//  Maps a texture pack of given name to an object. Calling this function
//  repeatedly may cause performance issues.
Roygbiv.prototype.mapTexturePack = function(object, texturePackName){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("mapTexturePack error: Object is undefined.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("mapTexturePack error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("mapTexturePack error: Cannot map texture packs to child objects.");
    return;
  }

  var texturePack = texturePacks[texturePackName];
  if (!texturePack){
    throw new Error("mapTexturePack error: No such texture pack.");
    return;
  }
  if (!texturePack.isUsable()){
    throw new Error("mapTexturePack error: Texture pack not usable.");
    return;
  }
  object.mapTexturePack(texturePack, true);
}

// intensity
//  Increases/decreases the intensity of given ambient light or point light.
Roygbiv.prototype.intensity = function(light, delta){
  if (mode == 0){
    return;
  }
  if (!light){
    throw new Error("intensity error: Light is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("intensity error: Delta is not a number.");
    return;
  }
  if (!light.isAmbientLight && !light.isPointLight){
    throw new Error("intensity error: Type not supported.");
    return;
  }
  light.intensity += delta;
}

// opacity
//  Increases/decreases the opacity of given object.
Roygbiv.prototype.opacity = function(object, delta){
  if (mode == 0){
    return;
  }
  if(!object){
    throw new Error("opacity error: Object is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("opacity error: Delta is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("opacity error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("opacity error: Cannot set opacity to child objects.");
    return;
  }
  if (!object.initOpacitySet){
    object.initOpacity = object.mesh.material.uniforms.alpha.value;
    object.initOpacitySet = true;
  }

  object.incrementOpacity(delta);

  if (object.mesh.material.uniforms.alpha.value < 0){
    object.updateOpacity(0);
  }
  if (object.mesh.material.uniforms.alpha.value > 1){
    object.updateOpacity(1);
  }

}

// shininess
//  Increases/decreases the opacity of given object. Only the objects that have
//  Phong materials have shininess property.
Roygbiv.prototype.shininess = function(object, delta){
  if (mode == 0){
    return;
  }
  if(!object){
    throw new Error("shininess error: Object is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("shininess error: Delta is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("shininess error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("shininess error: Cannot set shininess to child objects.");
    return;
  }
  if (!object.material.isMeshPhongMaterial){
    throw new Error("shininess error: Only phong materials have shininess property.");
    return;
  }
  if (!object.initShininessSet){
    object.initShininess = object.material.shininess;
    object.initShininessSet = true;
  }
  object.material.shininess += delta;
}

// textureOffsetX
//  Adjusts the x coordinate of texture offset of given object.
Roygbiv.prototype.textureOffsetX = function(object, dx){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("textureOffsetX error: Object is undefined.");
    return;
  }
  if (isNaN(dx)){
    throw new Error("textureOffsetX error: dx is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("textureOffsetX error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("textureOffsetX error: Cannot set texture offset to child objects.");
    return;
  }
  var texture;
  if (object.hasDiffuseMap()){
    texture = object.mesh.material.uniforms.diffuseMap.value;
  }
  if (texture){
    if (!texture.initOffsetXSet){
      texture.initOffsetX = texture.offset.x;
      texture.initOffsetXSet = true;
    }
    texture.offset.x += dx;
    texture.updateMatrix();
  }
}

// textureOffsetY
//  Adjusts the y coordinate of texture offset of given object.
Roygbiv.prototype.textureOffsetY = function(object, dy){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("textureOffsetY error: Object is not defined.");
    return;
  }
  if (isNaN(dy)){
    throw new Error("textureOffsetY error: dy is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("textureOffsetY error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("textureOffsetY error: Cannot set texture offset of child objects.");
    return;
  }
  var texture;
  if (object.hasDiffuseMap()){
    texture = object.mesh.material.uniforms.diffuseMap.value;
  }
  if (texture){
    if (!texture.initOffsetYSet){
      texture.initOffsetY = texture.offset.y;
      texture.initOffsetYSet = true;
    }
    texture.offset.y += dy;
    texture.updateMatrix();
  }
}

// textureOffset
//  Adjusts the texture offset of given object.
Roygbiv.prototype.textureOffset = function(object, dx, dy){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("textureOffset error: Object is not defined.");
    return;
  }
  if (isNaN(dx)){
    throw new Error("textureOffset error: dx is not a number.");
    return;
  }
  if (isNaN(dy)){
    throw new Error("textureOffset error: dy is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("textureOffset error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("textureOffset error: Cannot set texture offset to child objects.");
    return;
  }
  var texture;
  if (object.hasDiffuseMap()){
    texture = object.mesh.material.uniforms.diffuseMap.value;
  }
  if (texture){
    if (!texture.initOffsetXSet){
      texture.initOffsetX = texture.offset.x;
      texture.initOffsetXSet = true;
    }
    if (!texture.initOffsetYSet){
      texture.initOffsetY = texture.offset.y;
      texture.initOffsetYSet = true;
    }
    texture.offset.x += dx;
    texture.offset.y += dy;
    texture.updateMatrix();
  }
}

// heightMapScale
//  Modifies the height map scale of an object. Only the objects that have Phong
//  materials can have height maps.
Roygbiv.prototype.heightMapScale = function(object, delta){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("heightMapScale error: Object is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("heightMapScale error: Delta is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("heightMapScale error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("heightMapScale error: Cannot set height map scale to child objects.");
    return;
  }
  if (!object.hasDisplacementMap()){
    throw new Error("heightMapScale error: No height texture mapped to object.");
    return;
  }
  if (!object.initDisplacementScaleSet){
    object.initDisplacementScale = object.mesh.material.uniforms.displacementInfo.value.x;
    object.initDisplacementScaleSet = true;
  }
  object.mesh.material.uniforms.displacementInfo.value.x += delta;
}

// heightMapBias
//  Modifies the height map bias of an object. Only the objects that have Phong
//  materials can have height maps.
Roygbiv.prototype.heightMapBias = function(object, delta){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("heightMapBias error: Object is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("heightMapBias error: Delta is not a number.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("heightMapBias error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("heightMapBias error: Cannot set height map bias to child objects.");
    return;
  }
  if (!object.hasDisplacementMap()){
    throw new Error("heightMapBias error: No height texture mapped to object.");
    return;
  }
  if (!object.initDisplacementBiasSet){
    object.initDisplacementBias = object.mesh.material.uniforms.displacementInfo.value.y;
    object.initDisplacementBiasSet = true;
  }
  object.mesh.material.uniforms.displacementInfo.value.y += delta;
}

// emissiveIntensity
// Modifies the emissive intensity of given object by given amount
Roygbiv.prototype.emissiveIntensity = function(object, delta){
  if (mode == 0){
    return;
  }
  if (typeof object == UNDEFINED){
    throw new Error("emissiveIntensity error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject)){
    throw new Error("emissiveIntensity error: Type not supported.");
    return;
  }
  if (!addedObjects[object.name]){
    throw new Error("emissiveIntensity error: Cannot set emissive intensity to child objects.");
    return;
  }
  if (typeof delta == UNDEFINED){
    throw new Error("emissiveIntensity error: delta is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("emissiveIntensity error: delta is not a number.");
    return;
  }
  if (!object.initEmissiveIntensitySet){
    object.initEmissiveIntensity = object.mesh.material.uniforms.emissiveIntensity.value;
    object.initEmissiveIntensitySet = true;
  }
  object.mesh.material.uniforms.emissiveIntensity.value += delta;
}

// setObjectVelocity
//  Sets the velocity of an object or a glued object. The object must be a dynamic object
//  (mass > 0) in order to have a velocity.
Roygbiv.prototype.setObjectVelocity = function(object, velocityVector, axis){
  if (mode == 0){
    return;
  }
  if (typeof object == UNDEFINED){
    throw new Error("setObjectVelocity error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("setObjectVelocity error: Type not supported.");
    return;
  }
  if (!object.isChangeable){
    throw new Error("setObjectVelocity error: object is not marked as changeable.");
    return;
  }
  if ((object instanceof AddedObject) && !addedObjects[object.name]){
    throw new Error("setObjectVelocity error: Cannot set velocity to child objects. Use parent object instead.");
    return;
  }
  if (!object.isDynamicObject){
    throw new Error("setObjectVelocity error: Object must have a mass greater than zero.");
    return;
  }
  if (typeof velocityVector == UNDEFINED){
    throw new Error("setObjectVelocity error: velocityVector is not defined.");
    return;
  }
  if (isNaN(velocityVector.x) || isNaN(velocityVector.y) || isNaN(velocityVector.z)){
    throw new Error("setObjectVelocity error: Bad velocityVector parameter.");
    return;
  }
  if (!(typeof axis == UNDEFINED)){
    if (axis != "X" && axis != "x" && axis != "y" && axis != "Y" && axis != "z" && axis != "Z"){
      throw new Error("setObjectVelocity error: Bad axis parameter.");
      return;
    }
    if (axis == "x" || axis == "X"){
      object.physicsBody.velocity.x = velocityVector.x;
    }else if (axis == "y" || axis == "Y"){
      object.physicsBody.velocity.y = velocityVector.y;
    }else if (axis == "z" || axis == "Z"){
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
  if (typeof object == UNDEFINED){
    throw new Error("setObjectColor error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("setObjectColor error: Type not supported.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("setObjectColor error: colorName is not defined.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    alpha = 1;
  }else{
    if (isNaN(alpha)){
      throw new Error("setObjectColor error: alpha is not a number.");
      return;
    }
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
  if (typeof object == UNDEFINED){
    throw new Error("resetObjectColor error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("resetObjectColor error: Type not supported.");
    return;
  }
  object.resetColor();
}

// setRotationPivot
// Sets a rotation pivot for an object created with createRotationPivot API.
Roygbiv.prototype.setRotationPivot = function(rotationPivot){
  if (mode == 0){
    return;
  }
  if (typeof rotationPivot == UNDEFINED){
    throw new Error("setRotationPivot error: rotationPivot is not defined.");
    return;
  }
  if (!(rotationPivot instanceof THREE.Object3D)){
    throw new Error("setRotationPivot error: Bad rotationPivot type.");
    return;
  }
  var sourceObject = rotationPivot.sourceObject;
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
  if (typeof object == UNDEFINED){
    throw new Error("unsetRotationPivot error: object is not defined.");
    return;
  }
  if (!((object instanceof AddedObject) || (object instanceof ObjectGroup))){
    throw new Error("unsetRotationPivot error: Type not supported.");
    return;
  }
  if (!object.pivotObject){
    throw new Error("unsetRotationPivot error: Object does not have a pivot point.");
    return;
  }
  delete object.pivotObject;
  delete object.pivotOffsetX;
  delete object.pivotOffsetY;
  delete object.pivotOffsetZ;
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
  var color = configurations.color;
  var size = configurations.size;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var targetColor = configurations.targetColor;
  var colorStep = configurations.colorStep;

  if (typeof color == UNDEFINED){
    throw new Error("createParticleMaterial error: color is a mandatory parameter.");
    return;
  }
  if (typeof size == UNDEFINED){
    throw new Error("createParticleMaterial error: size is a mandatory parameter.");
    return;
  }
  if (isNaN(size)){
    throw new Error("createParticleMaterial error: Bad size parameter.");
    return;
  }
  if (size <= 0){
    throw new Error("createParticleMaterial error: size must be greater than zero.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createParticleMaterial error: alpha is a mandatory parameter.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createParticleMaterial error: Bad alpha parameter.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createParticleMaterial error: alpha must be between [0,1]");
    return;
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    if (typeof texture == UNDEFINED){
      throw new Error("createParticleMaterial error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createParticleMaterial error: Texture not ready.");
      return;
    }
    if (texture instanceof THREE.CompressedTexture){
      throw new Error("createParticleMaterial error: Compressed textures are not supported for particle systems.");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createParticleMaterial error: Bad rgbFilter parameter.");
      return;
    }
  }
  if (!(typeof targetColor == UNDEFINED)){
    if (typeof colorStep == UNDEFINED){
      throw new Error("createParticleMaterial error: colorStep is mandatory if targetColor is specified.");
      return;
    }
  }
  if (!(typeof colorStep == UNDEFINED) && configurations.colorStep != 0){
    if (isNaN(colorStep)){
      throw new Error("createParticleMaterial error: Bad colorStep parameter.");
      return;
    }
    if (colorStep > 1 || colorStep <= 0){
      throw new Error("createParticleMaterial error: colorStep must be between ]0,1]");
      return;
    }
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

  if (!configurations){
    throw new Error("createParticle error: configurations are not defined.");
    return;
  }

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

  if (!(typeof motionMode == UNDEFINED)){
    if  (motionMode != MOTION_MODE_NORMAL && motionMode != MOTION_MODE_CIRCULAR){
      throw new Error("createParticle error: motionMode must be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR.");
      return;
    }
  }else{
    motionMode = MOTION_MODE_NORMAL;
  }

  if (typeof position == UNDEFINED && motionMode == MOTION_MODE_NORMAL){
    throw new Error("createParticle error: position is a mandatory parameter for MOTION_MODE_NORMAL.");
    return;
  }
  if (motionMode == MOTION_MODE_NORMAL){
    initialAngle = 0;
    if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
      throw new Error("createParticle error: position is not a vector.");
      return;
    }
  }
  if (typeof initialAngle == UNDEFINED && motionMode == MOTION_MODE_CIRCULAR){
    throw new Error("createParticle error: initialAngle is a mandatory for MOTION_MODE_CIRCULAR.");
    return;
  }
  if (motionMode == MOTION_MODE_CIRCULAR){
    position = this.vector(0, 0, 0);
    if (isNaN(initialAngle)){
      throw new Error("createParticle error: Bad initialAngle parameter.");
      return;
    }
  }
  if (!material){
    throw new Error("createParticle error: material is a mandatory parameter.");
    return;
  }
  if (!(material instanceof ParticleMaterial)){
    throw new Error("createParticle error: Material type not supported.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createParticle error: position is not a vector.");
    return;
  }
  if (typeof lifetime == UNDEFINED){
    throw new Error("createParticle error: lifetime is a mandatory parameter.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createParticle error: lifetime is not a number.");
    return;
  }
  if (typeof respawn == UNDEFINED){
    throw new Error("createParticle error: respawn is a mandatory parameter.");
    return;
  }
  if (!(typeof(respawn) == typeof(true))){
    throw new Error("createParticle error: respawn is not a boolean.");
    return;
  }
  if (!(typeof alphaVariation == UNDEFINED)){
    if (isNaN(alphaVariation)){
      throw new Error("createParticle error: Bad alphaVariation parameter.");
      return;
    }
  }
  if (!(typeof alphaVariationMode == UNDEFINED)){
    if (isNaN(alphaVariationMode)){
      throw new Error("createParticle error: Bad alphaVariationMode parameter.");
      return;
    }
    if (alphaVariationMode != ALPHA_VARIATION_MODE_NORMAL &&
              alphaVariationMode != ALPHA_VARIATION_MODE_SIN &&
                  alphaVariationMode != ALPHA_VARIATION_MODE_COS){
          throw new Error("createParticle error: alphaVariationMode must be one of ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_SIN or ALPHA_VARIATION_MODE_COS.");
          return;
        }
  }

  if (!(typeof startDelay == UNDEFINED)){
    if (isNaN(startDelay)){
      throw new Error("createParticle error: Bad startDelay parameter.");
      return;
    }
    if (startDelay < 0){
      throw new Error("createParticle error: startDelay must be a positive number.");
      return;
    }
  }else{
    startDelay = 0;
  }

  if (!(typeof trailMode == UNDEFINED)){
    if (typeof trailMode != typeof(true)){
      throw new Error("createParticle error: Bad trailMode parameter.");
      return;
    }
    if (trailMode){
      if(lifetime == 0){
        throw new Error("createParticle error: Lifetime must be greater than zero for trail particles.");
        return;
      }
      if (!respawn){
        throw new Error("createParticle error: respawn property must be true for trail particles.");
        return;
      }
    }
  }else{
    trailMode = false;
  }
  if (!(typeof velocity == UNDEFINED)){
    if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(velocity.z)){
      throw new Error("createParticle error: Bad velocity parameter.");
      return;
    }
  }else{
    velocity = this.vector(0, 0, 0);
  }
  if (!(typeof acceleration == UNDEFINED)){
    if (isNaN(acceleration.x) || isNaN(acceleration.y) || isNaN(acceleration.z)){
      throw new Error("createParticle error: Bad acceleration parameter.");
      return;
    }
  }else{
    acceleration = this.vector(0, 0, 0);
  }
  if (!(typeof angularVelocity == UNDEFINED)){
    if (isNaN(angularVelocity)){
      throw new Error("createParticle error: Bad angularVelocity parameter.");
      return;
    }
  }else{
    angularVelocity = 0;
  }
  if (!(typeof angularAcceleration == UNDEFINED)){
    if (isNaN(angularAcceleration)){
      throw new Error("createParticle error: Bad angularAcceleration parameter.");
      return;
    }
  }else{
    angularAcceleration = 0;
  }
  if (!(typeof angularMotionRadius == UNDEFINED)){
    if (isNaN(angularMotionRadius)){
      throw new Error("createParticle error: Bad angularMotionRadius parameter.");
      return;
    }
  }else{
    angularMotionRadius = 0;
  }
  if (!(typeof angularQuaternion == UNDEFINED)){
    if (isNaN(angularQuaternion.x) || isNaN(angularQuaternion.y)
                    || isNaN(angularQuaternion.z) || isNaN(angularQuaternion.w)){
      throw new Error("createParticle error: Bad angularQuaternion parameter.");
      return;
    }
  }else{
    angularQuaternion = REUSABLE_QUATERNION.set(0, 0, 0, 1);
  }
  if (!(typeof useWorldPosition == UNDEFINED)){
    if (typeof useWorldPosition != typeof(true)){
      throw new Error("createParticle error: useWorldPosition is not a boolean.");
      return;
    }
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

  if (TOTAL_PARTICLE_SYSTEM_COUNT >= MAX_PARTICLE_SYSTEM_COUNT){
    throw new Error("createParticleSystem error: Cannot create more than "+MAX_PARTICLE_SYSTEM_COUNT+" particle systems.");
    return;
  }

  if (!configurations){
    throw new Error("createParticleSystem error: configurations is not defined.");
    return;
  }

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

  if (!name){
    throw new Error("createParticleSystem error: name is a mandatory configuration.");
    return;
  }
  if (name.indexOf(',') !== -1){
    throw new Error("createParticleSystem error: name cannot contain coma.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createParticleSystem error: name must be unique.");
    return;
  }
  if (!particles){
    throw new Error("createParticleSystem error: particles is a mandatory configuration.");
    return;
  }
  if (particles.length == 0){
    throw new Error("createParticleSystem error: particles array is empty.");
    return;
  }
  if (!position){
    throw new Error("createParticleSystem error: position is a mandatory configuration.");
    return;
  }
  if (typeof position.x == UNDEFINED || typeof position.y == UNDEFINED || typeof position.z == UNDEFINED){
    throw new Error("createParticleSystem error: position is not a vector.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createParticleSystem error: position is not a vector.");
    return;
  }
  if (typeof lifetime == UNDEFINED){
    throw new Error("createParticleSystem error: lifetime is a mandatory parameter.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createParticleSystem error: Bad lifetime parameter.");
    return;
  }
  if (lifetime < 0){
    throw new Error("createParticleSystem error: lifetime must be a positive number.");
    return;
  }

  if (!(typeof velocity == UNDEFINED)){
    if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(velocity.z)){
      throw new Error("createParticleSystem error: Bad velocity parameter.");
      return;
    }
  }

  if (!(typeof acceleration == UNDEFINED)){
    if (isNaN(acceleration.x) || isNaN(acceleration.y) || isNaN(acceleration.z)){
      throw new Error("createParticleSystem error: Bad acceleration parameter.");
      return;
    }
  }

  if (particles.length >= MAX_VERTICES_ALLOWED_IN_A_PARTICLE_SYSTEM){
    throw new Error("createParticleSystem error: Maximum allowed particle size "+MAX_VERTICES_ALLOWED_IN_A_PARTICLE_SYSTEM+" exceeded.");
    return;
  }

  if (!(typeof angularVelocity == UNDEFINED)){
    if (isNaN(angularVelocity)){
      throw new Error("createParticleSystem error: Bad angularVelocity parameter.");
      return;
    }
  }else{
    angularVelocity = 0;
  }

  if (!(typeof angularAcceleration == UNDEFINED)){
    if (isNaN(angularAcceleration)){
      throw new Error("createParticleSystem error: Bad angularAcceleration parameter.");
      return;
    }
  }else{
    angularAcceleration = 0;
  }

  if (!(typeof angularMotionRadius == UNDEFINED)){
    if (isNaN(angularMotionRadius)){
      throw new Error("createParticleSystem error: Bad angularMotionRadius parameter.");
      return;
    }
  }else{
    angularMotionRadius = 0;
  }

  if (!(typeof angularQuaternion == UNDEFINED)){
    if (isNaN(angularQuaternion.x) || isNaN(angularQuaternion.y) || isNaN(angularQuaternion.z) || isNaN(angularQuaternion.w)){
      throw new Error("createParticleSystem error: Bad angularQuaternion parameter.");
    }
  }else{
    angularQuaternion = REUSABLE_QUATERNION.set(0, 0, 0, 1);
  }

  if (!(typeof initialAngle == UNDEFINED)){
    if (isNaN(initialAngle)){
      throw new Error("createParticleSystem error: Bad initialAngle parameter.");
      return;
    }
  }else{
    initialAngle = 0;
  }

  if (!(typeof motionMode == UNDEFINED)){
    if (motionMode != MOTION_MODE_NORMAL && motionMode != MOTION_MODE_CIRCULAR){
      throw new Error("createParticleSystem error: motionMode must be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR.");
      return;
    }
  }else{
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
  if (!scaleVector){
    throw new Error("scale error: scaleVector is not defined.");
    return;
  }
  if (typeof scaleVector.x == UNDEFINED || typeof scaleVector.y == UNDEFINED || typeof scaleVector.z == UNDEFINED){
    throw new Error("scal error: scaleVector is not a vector.");
    return;
  }
  if (isNaN(scaleVector.x) || isNaN(scaleVector.y) || isNaN(scaleVector.z)){
    throw new Error("scale error: scaleVector is not a vector.");
    return;
  }
  if (!object){
    throw new Error("scale error: object is undefined.");
    return;
  }
  if (!(object instanceof ParticleSystem)){
    throw new Error("scale error: Type not supported.");
    return;
  }

  object.mesh.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);
}

// setBlending
//  Sets the blending mode of a particle system. Blending mode can be one of
//  NO_BLENDING, NORMAL_BLENDING, ADDITIVE_BLENDING, SUBTRACTIVE_BLENDING or
//  MULTIPLY_BLENDING
Roygbiv.prototype.setBlending = function(particleSystem, mode){
  if (mode == 0){
    return;
  }
  if (!particleSystem){
    throw new Error("setBlending error: particleSystem is not defined.");
    return;
  }
  if (typeof mode == UNDEFINED){
    throw new Error("setBlending error: mode is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("setBlending error: Unsupported type.");
    return;
  }
  if (mode != NO_BLENDING && mode != NORMAL_BLENDING && mode != ADDITIVE_BLENDING && mode != SUBTRACTIVE_BLENDING && mode != MULTIPLY_BLENDING){
    throw new Error("setBlending error: Bad mode parameter.");
    return;
  }
  particleSystem.setBlending(mode);
}

// setParticleSystemRotation
//  Sets the rotation of a particle system around given axis.
Roygbiv.prototype.setParticleSystemRotation = function(particleSystem, axis, rad){
  if (mode == 0){
    return;
  }
  if (!particleSystem){
    throw new Error("setParticleSystemRotation error: particleSystem is not defined.");
    return;
  }
  if (!axis){
    throw new Error("setParticleSystemRotation error: axis is not defined.");
    return;
  }
  if (typeof rad == UNDEFINED){
    throw new Error("setParticleSystemRotation error: rad is not defined.");
    return;
  }
  axis = axis.toLowerCase();
  if (axis != "x" && axis != "y" && axis != "z"){
    throw new Error("setParticleSystemRotation error: axis should be one of x, y and z");
    return;
  }
  if (isNaN(rad)){
    throw new Error("setParticleSystemRotation error: Bad parameters.");
    return;
  }
  if (!particleSystem.mesh.visible){
    throw new Error("setParticleSystemRotation error: particleSystem is not visible.");
    return;
  }
  if (particleSystem.checkForCollisions){
    throw new Error("setParticleSystemRotation error: particleSystem has a collision callback attached. Cannot set rotation.");
    return;
  }
  if (particleSystem.particlesWithCollisionCallbacks.size > 0){
    throw new Error("setParticleSystemRotation error: particleSystem has a collidable particle. Cannot set rotation.");
    return;
  }
  if (particleSystem.hasTrailedParticle){
    throw new Error("setParticleSystemRotation error: particleSystem has a trailed particle. Cannot set rotation.");
    return;
  }
  if (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 ||
          particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0){

      throw new Error("setParticleSystemRotation error: particleSystem has a defined motion. Cannot set rotation.");
      return;
  }

  if (axis == "x"){
    particleSystem.mesh.rotation.x = rad;
  }else if (axis == "y"){
    particleSystem.mesh.rotation.y = rad;
  }else if (axis == "z"){
    particleSystem.mesh.rotation.z = rad;
  }

  particleSystem.hasManualRotationSet = true;

}

// setParticleSystemQuaternion
//  Sets the quaternion of given particle system.
Roygbiv.prototype.setParticleSystemQuaternion = function(particleSystem, quatX, quatY, quatZ, quatW){
  if (mode == 0){
    return;
  }
  if (!particleSystem){
    throw new Error("setParticleSystemQuaternion error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("setParticleSystemQuaternion error: Unsupported type.");
    return;
  }
  if (isNaN(quatX) || isNaN(quatY) || isNaN(quatZ) || isNaN(quatW)){
    throw new Error("setParticleSystemQuaternion error: Bad parameters.");
    return;
  }

  if (!particleSystem.mesh.visible){
    throw new Error("setParticleSystemQuaternion error: particleSystem is not visible.");
    return;
  }
  if (particleSystem.checkForCollisions){
    throw new Error("setParticleSystemQuaternion error: particleSystem has a collision callback attached. Cannot set quaternion.");
    return;
  }
  if (particleSystem.particlesWithCollisionCallbacks.size > 0){
    throw new Error("setParticleSystemQuaternion error: particleSystem has a collidable particle. Cannot set quaternion.");
    return;
  }
  if (particleSystem.hasTrailedParticle){
    throw new Error("setParticleSystemQuaternion error: particleSystem has a trailed particle. Cannot set quaternion.");
    return;
  }
  if (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 ||
          particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0){

      throw new Error("setParticleSystemQuaternion error: particleSystem has a defined motion. Cannot set quaternion.");
      return;
  }

  particleSystem.mesh.quaternion.set(quatX, quatY, quatZ, quatW);
  particleSystem.hasManualQuaternionSet = true;
}

// kill
//  Destroys a particle or a particle system.
Roygbiv.prototype.kill = function(object){
  if (mode == 0){
    return;
  }
  if (!object){
    throw new Error("kill error: object is not defined.");
    return;
  }
  if (!(object instanceof Particle) && !(object instanceof ParticleSystem)){
    throw new Error("kill error: Unsupported type.");
    return;
  }
  if (object instanceof Particle){
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
  }else if (object instanceof ParticleSystem){
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

  if (!configurations){
    throw new Error("createSmoke error: configurations is not defined.");
    return;
  }

  var smokeSize = configurations.smokeSize;
  var name = configurations.name;
  if (typeof name == UNDEFINED){
    throw new Error("createSmoke error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createSmoke error: name must be unique.");
    return;
  }

  var position = configurations.position;
  if (typeof position == UNDEFINED){
    throw new Error("createSmoke error: position is a mandatory parameter.");
    return;
  }else{
    if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
      throw new Error("createSmoke error: Bad position parameter.");
      return;
    }
  }
  var expireTime = configurations.expireTime;
  if (typeof expireTime == UNDEFINED){
    throw new Error("createSmoke error: expireTime is a mandatory parameter.");
    return;
  }else{
    if (isNaN(expireTime)){
      throw new Error("createSmoke error: Bad expireTime parameter.");
      return;
    }else{
      if (expireTime < 0){
        throw new Error("createSmoke error: expireTime must be greater than zero.");
        return;
      }
    }
  }

  if (typeof smokeSize == UNDEFINED){
    throw new Error("createSmoke error: smokeSize is a mandatory configuration.");
    return;
  }
  if (isNaN(smokeSize)){
    throw new Error("createSmoke error: Bad smokeSize parameter");
    return;
  }
  var particleSize = configurations.particleSize;
  if (typeof particleSize == UNDEFINED){
    throw new Error("createSmoke error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createSmoke error: Bad particleSize parameter.");
    return;
  }
  var particleCount = configurations.particleCount;
  if (typeof particleCount == UNDEFINED){
    throw new Error("createSmoke error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createSmoke error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createSmoke error: particleCount must be greater than zero.");
    return;
  }
  var colorName = configurations.colorName;
  if (typeof colorName == UNDEFINED){
    throw new Error("createSmoke error: colorName is a mandatory configuration.");
    return;
  }
  var textureName = configurations.textureName;
  var isTextured = false;
  var texture;
  if (!(typeof textureName == UNDEFINED)){
    if (!textures[textureName]){
      throw new Error("createSmoke error: No such texture.");
      return;
    }
    texture = textures[textureName];
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createSmoke error: Texture not ready.");
      return;
    }
    isTextured = true;
  }
  var movementAxis = configurations.movementAxis;
  if (!(typeof movementAxis == UNDEFINED)){
    if (isNaN(movementAxis.x) || isNaN(movementAxis.y) || isNaN(movementAxis.z)){
      throw new Error("createSmoke error: Bad movementAxis parameter.");
    }
  }else{
    movementAxis = ROYGBIV.vector(0, 1, 0);
  }
  var velocity = configurations.velocity;
  if (typeof velocity == UNDEFINED){
    throw new Error("createSmoke error: velocity is a mandatory configuration.");
    return;
  }
  if (isNaN(velocity)){
    throw new Error("createSmoke error: Bad velocity parameter.");
    return;
  }
  var acceleration = configurations.acceleration;
  if (typeof acceleration == UNDEFINED){
    throw new Error("createSmoke error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration)){
    throw new Error("createSmoke error: Bad acceleration parameter.");
    return;
  }
  var randomness = configurations.randomness;
  if (typeof randomness == UNDEFINED){
    throw new Error("createSmoke error: randomness is a mandatory configuration.");
    return;
  }
  if (isNaN(randomness)){
    throw new Error("createSmoke error: Bad randomness parameter.");
    return;
  }
  var lifetime = configurations.lifetime;
  if (typeof lifetime == UNDEFINED){
    throw new Error("createSmoke error: lifetime is a mandatory configuration.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createSmoke error: Bad lifetime parameter.");
    return;
  }
  if (lifetime <= 0){
    throw new Error("createSmoke error: lifetime must be greater than zero.");
    return;
  }
  var alphaVariation = configurations.alphaVariation;
  if (typeof alphaVariation == UNDEFINED){
    throw new Error("createSmoke error: alphaVariation is a mandatory configuration.");
    return;
  }
  if (isNaN(alphaVariation)){
    throw new Error("createSmoke error: Bad alphaVariation parameter.");
    return;
  }
  if (alphaVariation < -1 || alphaVariation > 1){
    throw new Error("createSmoke error: alphaVariation must be between [-1,1]");
    return;
  }

  var updateFunction = configurations.updateFunction;
  if (updateFunction){
    if (!(updateFunction instanceof Function)){
      throw new Error("createSmoke error: updateFunction must be a function.");
      return;
    }
  }

  var startDelay = configurations.startDelay;
  if (typeof startDelay == UNDEFINED){
    startDelay = 0;
  }else{
    if (isNaN(startDelay)){
      throw new Error("createSmoke error: Bad startDelay parameter.");
      return;
    }
  }

  var rgbFilter = configurations.rgbFilter;
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createSmoke error: Bad rgbFilter parameter.");
      return;
    }
  }

  var accelerationDirection = configurations.accelerationDirection;
  if (!(typeof accelerationDirection == UNDEFINED)){
    if (isNaN(accelerationDirection.x) || isNaN(accelerationDirection.y) || isNaN(accelerationDirection.z)){
      throw new Error("createSmoke error: Bad accelerationDirection parameter.");
      return;
    }
  }

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

  if (typeof name == UNDEFINED){
    throw new Error("createTrail error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createTrail error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createTrail error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createTrail error: Bad position parameter.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createTrail error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createTrail error: Bad expireTime parameter.");
    return;
  }
  if (expireTime < 0){
    throw new Error("createTrail error: expireTime must be greater than zero.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createTrail error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createTrail error: Bad particleCount configuration.");
    return;
  }
  if (particleCount == 0){
    throw new Error("createTrail error: particleCount must be greater than zero.");
    return;
  }
  if (typeof velocity == UNDEFINED){
    throw new Error("createTrail error: velocity is a mandatory configuration.");
    return;
  }
  if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(velocity.z)){
    throw new Error("createTrail error: Bad velocity parameter.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createTrail error: acceleration is a mandatory parameter.");
    return;
  }
  if (isNaN(acceleration.x) || isNaN(acceleration.y) || isNaN(acceleration.z)){
    throw new Error("createTrail error: Bad acceleration parameter.");
    return;
  }
  if (typeof lifetime == UNDEFINED){
    throw new Error("createTrail error: lifetime is a mandatory parameter.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createTrail error: Bad lifetime parameter.");
    return;
  }
  if (typeof alphaVariation == UNDEFINED){
    throw new Error("createTrail error: alphaVariation is a mandatory configuration.");
    return;
  }
  if (isNaN(alphaVariation)){
    throw new Error("createTrail error: Bad alphaVariation parameter.");
    return;
  }
  if (alphaVariation > 0 || alphaVariation < -1){
    throw new Error("createTrail error: alphaVariation must be between [-1,0]");
    return;
  }
  if (typeof startDelay == UNDEFINED){
    throw new Error("createTrail error: startDelay is a mandatory configuration.");
    return;
  }
  if (isNaN(startDelay)){
    throw new Error("createTrail error: Bad startDelay parameter.");
    return;
  }
  if (startDelay < 0){
    throw new Error("createTrail error: startDelay must be greater than zero.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createTrail error: colorName is a mandatory configuration.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createTrail error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createTrail error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createTrail error: particleSize must be greater than zero.");
    return;
  }
  if (typeof size == UNDEFINED){
    throw new Error("createTrail error: size is a mandatory configuration.");
    return;
  }
  if (isNaN(size)){
    throw new Error("createTrail error: Bad size parameter.");
    return;
  }
  if (size <= 0){
    throw new Error("createTrail error: size must be greater than zero.");
    return;
  }
  var texture;
  if (!(typeof textureName == UNDEFINED)){
    texture = textures[textureName];
    if (!texture){
      throw new Error("createTrail error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createTrail error: Texture not ready.");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createSmoke error: Bad rgbFilter parameter.");
      return;
    }
  }
  if (!(typeof updateFunction == UNDEFINED)){
    if (!(updateFunction instanceof Function)){
      throw new Error("createSmoke error: updateFunction is not a function.");
      return;
    }
  }

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
  if (typeof name == UNDEFINED){
    throw new Error("createPlasma error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createPlasma error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createPlasma error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createPlasma error: Bad position parameter.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createPlasma error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createPlasma error: Bad expireTime parameter.");
    return;
  }
  if (expireTime < 0){
    throw new Error("createPlasma error: expireTime must be greater than zero.");
    return;
  }
  if (typeof velocity == UNDEFINED){
    throw new Error("createPlasma error: velocity is a mandatory configuration.");
    return;
  }
  if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(velocity.z)){
    throw new Error("createPlasma error: Bad velocity parameter.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createPlasma error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration.x) || isNaN(acceleration.y) || isNaN(acceleration.z)){
    throw new Error("createPlasma error: Bad acceleration parameter.");
    return;
  }
  if (typeof radius == UNDEFINED){
    throw new Error("createPlasma error: radius is a mandatory parameter.");
    return;
  }
  if (isNaN(radius)){
    throw new Error("createPlasma error: Bad radius parameter.");
    return;
  }
  if (radius <= 0){
    throw new Error("createPlasma error: radius must be greater than zero.");
    return;
  }
  if (typeof avgParticleSpeed == UNDEFINED){
    throw new Error("createPlasma error: avgParticleSpeed is a mandatory configuration.");
    return;
  }
  if (isNaN(avgParticleSpeed)){
    throw new Error("createPlasma error: Bad avgParticleSpeed parameter.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createPlasma error: particleCount is a mandatory parameter.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createPlasma error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createPlasma error: particleCount must be greater than zero.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createPlasma error: colorName is a mandatory configuration.");
    return;
  }
  var isTextured = false;
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    if (!texture){
      throw new Error("createPlasma error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createPlasma error: Texture not ready.");
      return;
    }
    isTextured = true;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createPlasma error: particleSize is a mandatory parameter.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createPlasma error: Bad particleSize parameter.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    alpha = 1;
  }else{
    if (isNaN(alpha)){
      throw new Error("createPlasma error: Bad alpha parameter.");
      return;
    }
    if (alpha > 1 || alpha < 0){
      throw new Error("createPlasma error: alpha must be between [0, 1]");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createPlasma error: Bad rgbFilter parameter.");
      return;
    }
  }
  var alphaVariationSet = false;
  if (!(typeof alphaVariation == UNDEFINED)){
    if (isNaN(alphaVariation)){
      throw new Error("createPlasma error: Bad alphaVariation parameter.");
      return;
    }
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
  if (typeof position == UNDEFINED){
    throw new Error("createFireExplosion error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createFireExplosion error: Bad position configuration.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createFireExplosion error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createFireExplosion error: Bad expireTime parameter.");
    return;
  }
  if (expireTime < 0){
    throw new Error("createFireExplosion error: expireTime cannot be negative.");
    return;
  }
  if (typeof name == UNDEFINED){
    throw new Error("createFireExplosion error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createFireExplosion error: name must be unique.");
    return;
  }
  if (typeof radius == UNDEFINED){
    throw new Error("createFireExplosion error: radius is a mandatory configuration.");
    return;
  }
  if (isNaN(radius)){
    throw new Error("createFireExplosion error: Bad radius parameter.");
    return;
  }
  if (radius <= 0){
    throw new Error("createFireExplosion error: radius must be greater than zero.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createFireExplosion error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createFireExplosion error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createFireExplosion error: particleSize must be greater than zero.");;
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createFireExplosion error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createFireExplosion error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createFireExplosion error: particleCount must be greater than zero.");
    return;
  }
  if (typeof fireColorName == UNDEFINED){
    fireColorName = "white";
  }
  if (typeof smokeColorName == UNDEFINED){
    smokeColorName = "black";
  }
  if (typeof colorStep == UNDEFINED){
    throw new Error("createFireExplosion error: colorStep is a mandatory configuration.");
    return;
  }
  if (isNaN(colorStep)){
    throw new Error("createFireExplosion error: Bad colorStep parameter.");
    return;
  }
  if (colorStep < 0 || colorStep > 1){
    throw new Error("createFireExplosion error: colorStep is expected to be between [0,1].");
    return;
  }
  if (typeof alphaVariationCoef == UNDEFINED){
    throw new Error("createFireExplosion error: alphaVariationCoef is a mandatory configuration.");
    return;
  }
  if (isNaN(alphaVariationCoef)){
    throw new Error("createFireExplosion error: Bad alphaVariationCoef parameter.");
    return;
  }
  if (typeof explosionDirection == UNDEFINED){
    throw new Error("createFireExplosion error: explosionDirection is a mandatory configuration.");
    return;
  }
  if (isNaN(explosionDirection.x) || isNaN(explosionDirection.y) || isNaN(explosionDirection.z)){
    throw new Error("createFireExplosion error: Bad explosionDirection parameter.");
    return;
  }
  if (typeof explosionSpeed == UNDEFINED){
    throw new Error("createFireExplosion error: explosionSpeed is a mandatory configuration.");
    return;
  }
  if (isNaN(explosionSpeed)){
    throw new Error("createFireExplosion error: Bad explosionSpeed parameter.");
    return;
  }
  if (typeof lifetime == UNDEFINED){
    throw new Error("createFireExplosion error: lifetime is a mandatory configuration.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createFireExplosion error: Bad lifetime parameter.");
    return;
  }
  if (lifetime <= 0){
    throw new Error("createFireExplosion error: lifetime must be greater than zero.");
    return;
  }
  if (!(typeof accelerationDirection == UNDEFINED)){
    if (isNaN(accelerationDirection.x) || isNaN(accelerationDirection.y) || isNaN(accelerationDirection.z)){
      throw new Error("createFireExplosion error: Bad accelerationDirection parameter.");
      return;
    }
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    if (typeof texture == UNDEFINED){
      throw new Error("createFireExplosion error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createFireExplosion error: Texture not ready.");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createFireExplosion error: Bad rgbFilter parameter.");
      return;
    }
  }
  if (!(typeof updateFunction == UNDEFINED)){
    if (!(updateFunction instanceof Function)){
      throw new Error("createFireExplosion error: updateFunction is not a function.");
      return;
    }
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

  if (typeof name == UNDEFINED){
    throw new Error("createMagicCircle error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createMagicCircle error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createMagicCircle error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createMagicCircle error: Bad position parameter.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createMagicCircle error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createMagicCircle error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createMagicCircle error: particleCount must be greater than zero.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createMagicCircle error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createMagicCircle error: Bad expireTime parameter.");
    return;
  }
  if (expireTime < 0){
    throw new Error("createMagicCircle error: expireTime must be greater than zero.");
    return;
  }
  if (typeof speed == UNDEFINED){
    throw new Error("createMagicCircle error: speed is a mandatory configuration.");
    return;
  }
  if (isNaN(speed)){
    throw new Error("createMagicCircle error: Bad speed parameter.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createMagicCircle error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration)){
    throw new Error("createMagicCircle error: Bad acceleration parameter.");
    return;
  }
  if (typeof radius == UNDEFINED){
    throw new Error("createMagicCircle error: radius is a mandatory configuration.");
    return;
  }
  if (isNaN(radius)){
    throw new Error("createMagicCircle error: Bad radius parameter.");
    return;
  }
  if (typeof circleNormal == UNDEFINED){
    circleNormal = this.vector(0, 1, 0);
  }else{
    if (isNaN(circleNormal.x) || isNaN(circleNormal.y) || isNaN(circleNormal.z)){
      throw new Error("createMagicCircle error: Bad circleNormal parameter.");
      return;
    }
  }
  if (typeof circleDistortionCoefficient == UNDEFINED){
    circleDistortionCoefficient = 1;
  }else{
    if (isNaN(circleDistortionCoefficient)){
      throw new Error("createMagicCircle error: Bad circleDistortionCoefficient parameter.");
      return;
    }
    if (circleDistortionCoefficient == 0){
      circleDistortionCoefficient = 1;
    }
  }
  if (typeof lifetime == UNDEFINED){
    lifetime = 0;
  }else{
    if (isNaN(lifetime)){
      throw new Error("createMagicCircle error: Bad lifetime parameter.");
      return;
    }
    if (lifetime < 0){
      throw new Error("createMagicCircle error: lifetime cannot be smaller than zero.");
      return;
    }
  }
  if (typeof angleStep == UNDEFINED){
    angleStep = 0;
  }else{
    if (isNaN(angleStep)){
      throw new Error("createMagicCircle error: Bad angleStep parameter.");
      return;
    }
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createMagicCircle error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createMagicCircle error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createMagicCircle error: particleSize must be a positive number.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createMagicCircle error: colorName is a mandatory configuration.");
    return;
  }
  if(!(typeof colorStep == UNDEFINED)){
    if (isNaN(colorStep)){
      throw new Error("createMagicCircle error: Bad colorStep parameter.");
      return;
    }
    if (colorStep < 0 || colorStep > 1){
      throw new Error("createMagicCircle error: colorStep should be between [0,1].");
      return;
    }
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createMagicCircle error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createMagicCircle error: Bad alpha parameter.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createMagicCircle error: alpha must be between [0,1].");
    return;
  }
  if (typeof alphaVariation == UNDEFINED){
    alphaVariation = 0;
  }else{
    if (isNaN(alphaVariation)){
      throw new Error("createMagicCircle error: Bad alphaVariation parameter.");
      return;
    }
  }
  if (typeof alphaVariationMode == UNDEFINED){
    alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL;
  }else{
    if (alphaVariationMode != ALPHA_VARIATION_MODE_NORMAL && alphaVariationMode != ALPHA_VARIATION_MODE_COS && alphaVariationMode != ALPHA_VARIATION_MODE_SIN){
      throw new Error("createMagicCircle error: alphaVariationMode must be ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_COS or ALPHA_VARIATION_MODE_SIN.");
      return;
    }
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    if (typeof texture == UNDEFINED){
      throw new Error("createMagicCircle error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createMagicCircle error: Texture not ready.");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createMagicCircle error: Bad rgbFilter parameter.");
      return;
    }
  }
  if (!(typeof updateFunction == UNDEFINED)){
    if (!(updateFunction instanceof Function)){
      throw new Error("createMagicCircle error: updateFunction is not a function.");
      return;
    }
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

  if (typeof name == UNDEFINED){
    throw new Error("createCircularExplosion error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createCircularExplosion error: name must be unique.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createCircularExplosion error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createCircularExplosion error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createCircularExplosion error: particleCount must be greater than zero.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createCircularExplosion error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.y)){
    throw new Error("createCircularExplosion error: Bad position parameter.");
    return;
  }
  if (typeof radius == UNDEFINED){
    throw new Error("createCircularExplosion error: radius is a mandatory configuration.");
    return;
  }
  if (isNaN(radius)){
    throw new Error("createCircularExplosion error: Bad radius parameter.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createCircularExplosion error: colorName is a mandatory configuration.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createCircularExplosion error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createCircularExplosion error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createCircularExplosion error: particleSize must be greater than zero.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createCircularExplosion error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createCircularExplosion error: Bad alpha parameter.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createCircularExplosion error: alpha must be between [0,1].");
    return;
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    if (!texture){
      throw new Error("createCircularExplosion error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createCircularExplosion error: Texture not ready.");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createCircularExplosion error: Bad rgbFilter parameter.");
      return;
    }
  }
  if ((typeof alphaVariation == UNDEFINED)){
    throw new Error("createCircularExplosion error: alphaVariation is a mandatory configuration.");
    return;
  }
  if (isNaN(alphaVariation)){
    throw new Error("createCircularExplosion error: Bad alphaVariation parameter.");
    return;
  }
  if (alphaVariation < -1 || alphaVariation > 0){
    throw new Error("createCircularExplosion error: alphaVariation is expected to be between [-1,0].");
    return;
  }
  if (typeof speed == UNDEFINED){
    throw new Error("createCircularExplosion error: speed is a mandatory parameter.");
    return;
  }
  if (!(typeof normal == UNDEFINED)){
    if (isNaN(normal.x) || isNaN(normal.y) || isNaN(normal.z)){
      throw new Error("createCircularExplosion error: Bad normal parameter.");
      return;
    }
  }else{
    normal = this.vector(0, 1, 0);
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createCircularExplosion error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createCircularExplosion error: Bad expireTime parameter.");
    return;
  }
  if (expireTime < 0){
    throw new Error("createCircularExplosion error: expireTime must be a positive number.");
    return;
  }
  if (!(typeof updateFunction == UNDEFINED)){
    if (!(updateFunction instanceof Function)){
      throw new Error("createCircularExplosion error: updateFunction is not a function.");
      return;
    }
  }
  if (!(typeof colorStep == UNDEFINED)){
    if (isNaN(colorStep)){
      throw new Error("createCircularExplosion error: Bad colorStep parameter.");
      return;
    }
    if (colorStep < 0 || colorStep > 1){
      throw new Error("createCircularExplosion error: colorStep is expected to be between [0,1].");
      return;
    }
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

  if (particleSystemPool[name]){
    throw new Error("createDynamicTrail error: Name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createDynamicTrail error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createDynamicTrail error: Bad position configuration.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createDynamicTrail error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createDynamicTrail error: Bad expireTime parameter.");
    return;
  }
  if (expireTime <= 0){
    throw new Error("createDynamicTrail error: expireTime is expected to be greater than zero.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createDynamicTrail error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createDynamicTrail error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createDynamicTrail error: particleCount is expected to be greater than zero.");
    return;
  }
  if (typeof size == UNDEFINED){
    throw new Error("createDynamicTrail error: size is a mandatory configuration.");
    return;
  }
  if (isNaN(size)){
    throw new Error("createDynamicTrail error: Bad size parameter.");
    return;
  }
  if (size <= 0){
    throw new Error("createDynamicTrail error: size is expected to be greater than zero.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createDynamicTrail error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createDynamicTrail error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createDynamicTrail error: particleSize is expected to be greater than zero.");
    return;
  }
  if (typeof startDelay == UNDEFINED){
    throw new Error("createDynamicTrail error: startDelay is a mandatory configuration.");
    return;
  }
  if (isNaN(startDelay)){
    throw new Error("createDynamicTrail error: Bad startDelay parameter.");
    return;
  }
  if (startDelay <= 0){
    throw new Error("createDynamicTrail error: startDelay is expected to be greater than zero.");
    return;
  }
  if (typeof lifetime == UNDEFINED){
    throw new Error("createDynamicTrail error: lifetime is a mandatory configuration.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createDynamicTrail error: Bad lifetime parameter.");
    return;
  }
  if (lifetime < 0){
    lifetime = 0;
  }
  if (typeof velocity == UNDEFINED){
    throw new Error("createDynamicTrail error: velocity is a mandatory configuration.");
    return;
  }
  if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(velocity.z)){
    throw new Error("createDynamicTrail error: Bad velocity parameter.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createDynamicTrail error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration.x) || isNaN(acceleration.y) || isNaN(acceleration.z)){
    throw new Error("createDynamicTrail error: Bad acceleration parameter.");
    return;
  }
  if (typeof randomness == UNDEFINED){
    throw new Error("createDynamicTrail error: randomness is a mandatory configuration.");
    return;
  }
  if (isNaN(randomness)){
    throw new Error("createDynamicTrail error: Bad randomness parameter.");
    return;
  }
  if (typeof alphaVariation == UNDEFINED){
    throw new Error("createDynamicTrail error: alphaVariation is a mandatory configuration.");
    return;
  }
  if (isNaN(alphaVariation)){
    throw new Error("createDynamicTrail error: Bad alphaVariation parameter.");
    return;
  }
  if (alphaVariation < -1 || alphaVariation > 0){
    throw new Error("createDynamicTrail error: alphaVariation is expected to be between [-1,0]");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createDynamicTrail error: colorName is a mandatory configuration.");
    return;
  }
  if (!(typeof targetColorName == UNDEFINED)){
    if (typeof colorStep == UNDEFINED){
      throw new Error("createDynamicTrail error: colorStep is mandatory if targetColorName is specified.");
      return;
    }
    if (isNaN(colorStep)){
      throw new Error("createDynamicTrail error: Bad colorStep parameter.");
      return;
    }
    if (colorStep < 0 || colorStep > 1){
      throw new Error("createDynamicTrail error: colorStep is expected to be betwen [0,1].");
      return;
    }
  }
  if (!(typeof textureName == UNDEFINED)){
    var texture = textures[textureName];
    if (typeof texture == UNDEFINED){
      throw new Error("createDynamicTrail error: No such texture.");
      return;
    }
    if (!(texture instanceof THREE.Texture)){
      throw new Error("createDynamicTrail error: Texture not ready.");
      return;
    }
  }
  if (!(typeof rgbFilter == UNDEFINED)){
    if (isNaN(rgbFilter.x) || isNaN(rgbFilter.y) || isNaN(rgbFilter.z)){
      throw new Error("createDynamicTrail error: Bad rgbFilter parameter.");
      return;
    }
  }
  if (!(typeof updateFunction == UNDEFINED)){
    if (!(updateFunction instanceof Function)){
      throw new Error("createDynamicTrail error: updateFunction is not a function.");
      return;
    }
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
  var object = configurations.object;
  var alpha = configurations.alpha;

  if (typeof object == UNDEFINED){
    throw new Error("createObjectTrail error: object is a mandatory configuration.");
    return;
  }
  if (!object){
    throw new Error("createObjectTrail error: No such object.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("createObjectTrail error: Bad object parameter.");
    return;
  }
  if ((object instanceof AddedObject) && (!addedObjects[object.name])){
    throw new Error("createObjectTrail error: Cannot create object trails for child objects. Use parent object instead.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createObjectTrail error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createObjectTrail error: Bad alpha parameter.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createObjectTrail error: alpha is expected to be between [0,1].");
  }
  if (objectTrails[object.name]){
    throw new Error("createObjectTrail error: A trail is already added to object.");
    return;
  }
  if (!(typeof configurations.maxTimeInSeconds == UNDEFINED)){
    if (isNaN(configurations.maxTimeInSeconds)){
      throw new Error("createObjectTrail error: maxTimeInSeconds is not a number.");
      return;
    }
    if (configurations.maxTimeInSeconds <= 0){
      throw new Error("createObjectTrail error: maxTimeInSeconds must be greater than zero.");
      return;
    }
    if (configurations.maxTimeInSeconds > 1){
      throw new Error("createObjectTrail error: maxTimeInSeconds must not be greater than zero.");
      return;
    }
    if (configurations.maxTimeInSeconds < (1/60)){
      throw new Error("createObjectTrail error: maxTimeInSeconds must not be less than 0.01666666666 (1/60).");
      return;
    }
  }
  new ObjectTrail(configurations);
  return;
}

// destroyObjectTrail
// Destroys the trail effect of an object created using the createObjectTrail function.
Roygbiv.prototype.destroyObjectTrail = function(object){
  if (mode == 0){
    return;
  }
  if (typeof object == UNDEFINED){
    throw new Error("destroyObjectTrail error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("destroyObjectTrail error: Type not supported.");
    return;
  }
  var objectTrail = objectTrails[object.name];
  if (!objectTrail){
    throw new Error("destroyObjectTrail error: No trail effect is added to object.");
    return;
  }
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
  if (!particle){
    throw new Error("rewindParticle error: particle is not defined.");
    return;
  }
  if (!(particle instanceof Particle)){
    throw new Error("rewindParticle error: Bad particle parameter.");
    return;
  }
  if (!particle.respawnSet){
    throw new Error("rewindParticle error: Particles using this functionality must have respawn = true as configuration.");
    return;
  }
  if (particle.lifetime == 0){
    throw new Error("rewindParticle error: Particles using this functionality must have lifetime != 0 as configuration.");
    return;
  }
  if (!(typeof delay == UNDEFINED)){
    if (isNaN(delay)){
      throw new Error("rewindParticle error: delay must be a number.");
    }
  }else{
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
  if (typeof name == UNDEFINED){
    throw new Error("createLaser error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createLaser error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createLaser error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createLaser error: Bad position parameter.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createLaser error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createLaser error: particleCount must be a number.");
    return;
  }else if (particleCount <= 0){
    throw new Error("createLaser error: particleCount must be greater than zero.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createLaser error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createLaser error: particleSize must be a number.");
    return;
  }else if (particleSize <= 0){
    throw new Error("createLaser error: particleSize must be greater than zero.");
    return;
  }
  if (typeof direction == UNDEFINED){
    throw new Error("createLaser error: direction is a mandatory configuration.");
    return;
  }
  if (isNaN(direction.x) || isNaN(direction.y) || isNaN(direction.z)){
    throw new Error("createLaser error: Bad direction parameter.");
    return;
  }
  if (typeof timeDiff == UNDEFINED){
    throw new Error("createLaser error: timeDiff is a mandatory configuration.");
    return;
  }
  if (isNaN(timeDiff)){
    throw new Error("createLaser error: timeDiff must be a number.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createLaser error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createLaser error: expireTime must be a number.");
    return;
  }else if (expireTime < 0){
    throw new Error("createLaser error: expireTime cannot be a negative number.");
    return;
  }
  if (typeof velocity == UNDEFINED){
    throw new Error("createLaser error: velocity is a mandatory configuration.");
    return;
  }
  if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(velocity.z)){
    throw new Error("createLaser error: Bad velocity parameter.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createLaser error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration.x) || isNaN(acceleration.y) || isNaN(acceleration.z)){
    throw new Error("createLaser error: Bad acceleration parameter.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createLaser error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createLaser error: alpha must be a number.");
    return;
  }
  if (alpha > 1 || alpha < 0){
    throw new Error("createLaser error: alpha must be between [0, 1].");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createLaser error: colorName is a mandatory configuration.");
    return;
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

  if (typeof name == UNDEFINED){
    throw new Error("createWaterfall error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createWaterfall error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createWaterfall error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createWaterfall error: Bad position parameter.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createWaterfall error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createWaterfall error: particleCount must be a number.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createWaterfall error: particleCount must be greater than zero.");
    return;
  }
  if (typeof size == UNDEFINED){
    throw new Error("createWaterfall error: size is a mandatory configuration.");
    return;
  }
  if (isNaN(size)){
    throw new Error("createWaterfall error: Bad size parameter.");
    return;
  }
  if (size <= 0){
    throw new Error("createWaterfall error: size must be greater than zero.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createWaterfall error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createWaterfall error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createWaterfall error: particleSize must be greater than zero.");
    return;
  }
  if (typeof particleExpireTime == UNDEFINED){
    throw new Error("createWaterfall error: particleExpireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(particleExpireTime)){
    throw new Error("createWaterfall error: particleExpireTime must be a number.");
    return;
  }
  if (particleExpireTime <= 0){
    throw new Error("createWaterfall error: particleExpireTime must be greater than zero.");
    return;
  }
  if (typeof speed == UNDEFINED){
    throw new Error("createWaterfall error: speed is a mandatory configuration.");
    return;
  }
  if (isNaN(speed)){
    throw new Error("createWaterfall error: speed must be a number.");
    return;
  }
  if (speed <= 0){
    throw new Error("createWaterfall error: speed must be greater than zero.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createWaterfall error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration)){
    throw new Error("createWaterfall error: acceleration must be a number.");
    return;
  }
  if (acceleration <= 0){
    throw new Error("createWaterfall error: acceleration must be greater than zero.");
    return;
  }
  if (typeof avgStartDelay == UNDEFINED){
    throw new Error("createWaterfall error: avgStartDelay is a mandatory configuration.");
    return;
  }
  if (isNaN(avgStartDelay)){
    throw new Error("createWaterfall error: avgStartDelay must be a number.");
    return;
  }
  if (avgStartDelay <= 0){
    throw new Error("createWaterfall error: avgStartDelay must be greater than zero.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createWaterfall error: colorName is a mandatory configuration.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createWaterfall error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createWaterfall error: alpha must be a number.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createWaterfall error: alpha must be between [0, 1].");
    return;
  }
  if (!(typeof rewindOnCollided == UNDEFINED)){
    if (!(typeof rewindOnCollided == typeof(true))){
      throw new Error("createWaterfall error: rewindOnCollided must be a boolean.");
    }
  }else{
    rewindOnCollided = true;
  }
  if (!(typeof normal == UNDEFINED)){
    if (isNaN(normal.x) || isNaN(normal.y) || isNaN(normal.z)){
      throw new Error("createWaterfall error: Bad normal parameter.");
      return;
    }
  }else{
    normal = this.vector(0, 0, 1);
  }
  if (!(typeof randomness == UNDEFINED)){
    if (isNaN(randomness)){
      throw new Error("createWaterfall error: randomness must be a number.");
      return;
    }
  }else{
    randomness = 0;
  }
  if (!(typeof collisionTimeOffset == UNDEFINED)){
    if (isNaN(collisionTimeOffset)){
      throw new Error("createWaterfall error: collisionTimeOffset must be a number.");
      return;
    }
  }else{
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

  if (typeof name == UNDEFINED){
    throw new Error("createSnow error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createSnow error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createSnow error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createSnow error: Bad position parameter.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createSnow error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createSnow error: particleCount must be a number.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createSnow error: particleCount must be greater than zero.");
    return;
  }
  if (typeof sizeX == UNDEFINED){
    throw new Error("createSnow error: sizeX is a mandatory configuration.");
    return;
  }
  if (isNaN(sizeX)){
    throw new Error("createSnow error: sizeX must be a number.");
    return;
  }
  if (sizeX <= 0){
    throw new Error("createSnow error: sizeX must be greater than zero.");
    return;
  }
  if (typeof sizeZ == UNDEFINED){
    throw new Error("createSnow error: sizeZ is a mandatory configuration.");
    return;
  }
  if (isNaN(sizeZ)){
    throw new Error("createSnow error: sizeZ must be a number.");
    return;
  }
  if (sizeZ <= 0){
    throw new Error("createSnow error: sizeZ must be greater than zero.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createSnow error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createSnow error: particleSize must be a number.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createSnow error: particleSize must be greater than zero.");
    return;
  }
  if (typeof particleExpireTime == UNDEFINED){
    throw new Error("createSnow error: particleExpireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(particleExpireTime)){
    throw new Error("createSnow error: particleExpireTime is a mandatory configuration.");
    return;
  }
  if (particleExpireTime <= 0){
    throw new Error("createSnow error: particleExpireTime must be greater than zero.");
    return;
  }
  if (typeof speed == UNDEFINED){
    throw new Error("createSnow error: speed is a mandatory configuration.");
    return;
  }
  if (isNaN(speed)){
    throw new Error("createSnow error: speed must be a number.");
    return;
  }
  if (speed <= 0){
    throw new Error("createSnow error: speed must be greater than zero.");
    return;
  }
  if (typeof acceleration == UNDEFINED){
    throw new Error("createSnow error: acceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(acceleration)){
    throw new Error("createSnow error: acceleration must be a number.");
    return;
  }
  if (acceleration < 0){
    throw new Error("createSnow error: acceleration cannot be a negative number.");
    return;
  }
  if (typeof avgStartDelay == UNDEFINED){
    throw new Error("createSnow error: avgStartDelay is a mandatory configuration.");
    return;
  }
  if (isNaN(avgStartDelay)){
    throw new Error("createSnow error: avgStartDelay must be a number.");
    return;
  }
  if (avgStartDelay <= 0){
    throw new Error("createSnow error: avgStartDelay must be greater than zero.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createSnow error: colorName is a mandatory configuration.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createSnow error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createSnow error: alpha must be a number.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createSnow error: alpha must be between [0, 1].");
    return;
  }
  if (!(typeof rewindOnCollided == UNDEFINED)){
    if (!(typeof rewindOnCollided == typeof(true))){
      throw new Error("createSnow error: rewindOnCollided must be a boolean.");
      return;
    }
  }else{
    rewindOnCollided = true;
  }
  if (!(typeof normal == UNDEFINED)){
    if (isNaN(normal.x) || isNaN(normal.y) || isNaN(normal.z)){
      throw new Error("createSnow error: Bad normal parameter.");
      return;
    }
  }else{
    normal = this.vector(0, -1, 0);
  }
  if (!(typeof randomness == UNDEFINED)){
    if (isNaN(randomness)){
      throw new Error("createSnow error: randomness must be a number.");
      return;
    }
  }else{
    randomness = 0;
  }
  if (!(typeof collisionTimeOffset == UNDEFINED)){
    if (isNaN(collisionTimeOffset)){
      throw new Error("createSnow error: collisionTimeOffset must be a number.");
      return;
    }
  }else{
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
  if (typeof particleSystem == UNDEFINED){
    throw new Error("stopParticleSystem error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("stopParticleSystem error: Type not supported.");
    return;
  }
  if (typeof stopDuration == UNDEFINED){
    throw new Error("stopParticleSystem error: stopDuration is not defined.");
    return;
  }
  if (isNaN(stopDuration)){
    throw new Error("stopParticleSystem error: stopDuration is not defined.");
    return;
  }
  if (stopDuration < 0){
    throw new Error("stopParticleSystem error: stopDuration must be a positive number.");
    return;
  }
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
  var particleSystem = configurations.particleSystem;
  var startPosition = configurations.startPosition;
  var startVelocity = configurations.startVelocity;
  var startAcceleration = configurations.startAcceleration;
  var startQuaternion = configurations.startQuaternion;

  if (!particleSystem){
    throw new Error("startParticleSystem error: particleSystem is a mandatory configuration.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("startParticleSystem error: Type not supported.");
    return;
  }
  var startPositionSet = false, startVelocitySet = false, startAccelerationSet = false, startQuaternionSet = false;
  if (!(typeof startPosition == UNDEFINED)){
    if (isNaN(startPosition.x) || isNaN(startPosition.y) || isNaN(startPosition.z)){
      throw new Error("startParticleSystem error: Bad startPosition parameter.");
      return;
    }
    startPositionSet = true;
  }
  if (!(typeof startVelocity == UNDEFINED)){
    if (isNaN(startVelocity.x) || isNaN(startVelocity.y) || isNaN(startVelocity.z)){
      throw new Error("startParticleSystem error: Bad startVelocity parameter.");
      return;
    }
    startVelocitySet = true;
  }
  if (!(typeof startAcceleration == UNDEFINED)){
    if (isNaN(startAcceleration.x) || isNaN(startAcceleration.y) || isNaN(startAcceleration.z)){
      throw new Error("startParticleSystem error: Bad startAcceleration parameter.");
      return;
    }
    startAccelerationSet = true;
  }
  if (!(typeof startQuaternion == UNDEFINED)){
    if (isNaN(startQuaternion.x) || isNaN(startQuaternion.y) || isNaN(startQuaternion.z) || isNaN(startQuaternion.w)){
      throw new Error("startParticleSystem error: Bad startQuaternion parameter.");
      return;
    }
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
  if (typeof particleSystem == UNDEFINED){
    throw new Error("hideParticleSystem error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("hideParticleSystem error: Type not supported.");
    return;
  }
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
  if (typeof name == UNDEFINED){
    throw new Error("createParticleSystemPool error: name is not defined.");
    return;
  }
  if (particleSystemPools[name]){
    throw new Error("createParticleSystemPool error: name must be unique.");
    return;
  }
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
  if (typeof pool == UNDEFINED){
    throw new Error("addParticleSystemToPool error: pool is not defined.");
    return;
  }
  if (typeof particleSystem == UNDEFINED){
    throw new Error("addParticleSystemToPool error: particleSystem is not defined.");
    return;
  }
  if (!(pool instanceof ParticleSystemPool)){
    throw new Error("addParticleSystemToPool error: Pool type not supoorted.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("addParticleSystemToPool error: Particle system type not supported.");
    return;
  }
  if (!(typeof particleSystem.psPool == UNDEFINED)){
    throw new Error("addParticleSystemToPool error: Particle system belongs to another pool.");
    return;
  }
  pool.add(particleSystem);
}

// removeParticleSystemFromPool
// Removes a particle system from its particle system pool.
Roygbiv.prototype.removeParticleSystemFromPool = function(particleSystem){
  if (mode == 0){
    return;
  }
  if (typeof particleSystem == UNDEFINED){
    throw new Error("removeParticleSystemFromPool error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("removeParticleSystemFromPool error: Type not supported.");
    return;
  }
  if (typeof particleSystem.psPool == UNDEFINED){
    throw new Error("removeParticleSystemFromPool error: particleSystem does not belong to any pool.");
    return;
  }
  var psPool = particleSystemPools[particleSystem.psPool];
  psPool.remove(particleSystem);
}

// destroyParticleSystemPool
// Destroys a particle system pool.
Roygbiv.prototype.destroyParticleSystemPool = function(pool){
  if (mode == 0){
    return;
  }
  if (typeof pool == UNDEFINED){
    throw new Error("destroyParticleSystemPool error: pool is not defined.");
    return;
  }
  if (!(pool instanceof ParticleSystemPool)){
    throw new Error("destroyParticleSystemPool error: Type not supported.");
    return;
  }
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

  if (typeof name == UNDEFINED){
    throw new Error("createConfettiExplosion error: name is a mandatory configuration.");
    return;
  }
  if (particleSystemPool[name]){
    throw new Error("createConfettiExplosion error: name must be unique.");
    return;
  }
  if (typeof position == UNDEFINED){
    throw new Error("createConfettiExplosion error: position is a mandatory configuration.");
    return;
  }
  if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z)){
    throw new Error("createConfettiExplosion error: Bad position parameter.");
    return;
  }
  if (typeof expireTime == UNDEFINED){
    throw new Error("createConfettiExplosion error: expireTime is a mandatory configuration.");
    return;
  }
  if (isNaN(expireTime)){
    throw new Error("createConfettiExplosion error: Bad expireTime parameter.");
    return;
  }
  if (expireTime < 0){
    throw new Error("createConfettiExplosion error: expireTime cannot be a negative number.");
    return;
  }
  if (typeof lifetime == UNDEFINED){
    throw new Error("createConfettiExplosion error: lifetime is a mandatory configuration.");
    return;
  }
  if (isNaN(lifetime)){
    throw new Error("createConfettiExplosion error: Bad lifetime parameter.");
    return;
  }
  if (lifetime < 0){
    throw new Error("createConfettiExplosion error: lifetime cannot be a negative number.");
    return;
  }
  if (typeof verticalSpeed == UNDEFINED){
    throw new Error("createConfettiExplosion error: verticalSpeed is a mandatory configuration.");
    return;
  }
  if (isNaN(verticalSpeed)){
    throw new Error("createConfettiExplosion error: Bad verticalSpeed parameter.");
    return;
  }
  if (typeof horizontalSpeed == UNDEFINED){
    throw new Error("createConfettiExplosion error: horizontalSpeed is a mandatory configuration.");
    return;
  }
  if (isNaN(horizontalSpeed)){
    throw new Error("createConfettiExplosion error: Bad horizontalSpeed parameter.");
    return;
  }
  if (typeof verticalAcceleration == UNDEFINED){
    throw new Error("createConfettiExplosion error: verticalAcceleration is a mandatory configuration.");
    return;
  }
  if (isNaN(verticalAcceleration)){
    throw new Error("createConfettiExplosion error: Bad verticalAcceleration parameter.");
    return;
  }
  if (verticalAcceleration >= 0){
    throw new Error("createConfettiExplosion error: verticalAcceleration is expected to be less than zero.");
    return;
  }
  if (typeof particleCount == UNDEFINED){
    throw new Error("createConfettiExplosion error: particleCount is a mandatory configuration.");
    return;
  }
  if (isNaN(particleCount)){
    throw new Error("createConfettiExplosion error: Bad particleCount parameter.");
    return;
  }
  if (particleCount <= 0){
    throw new Error("createConfettiExplosion error: particleCount is expected to be greater than zero.");
    return;
  }
  if (typeof particleSize == UNDEFINED){
    throw new Error("createConfettiExplosion error: particleSize is a mandatory configuration.");
    return;
  }
  if (isNaN(particleSize)){
    throw new Error("createConfettiExplosion error: Bad particleSize parameter.");
    return;
  }
  if (particleSize <= 0){
    throw new Error("createConfettiExplosion error: particleSize is expected to be greater than zero.");
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("createConfettiExplosion error: colorName is a mandatory configuration.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createConfettiExplosion error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createConfettiExplosion error: Bad alpha parameter.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createConfettiExplosion error: alpha is expected to be between [0, 1].");
    return;
  }
  if (!(typeof collisionMethod == UNDEFINED)){
    if (collisionMethod != 0 && collisionMethod != 1 && collisionMethod != 2){
      throw new Error("createConfettiExplosion error: collisionMethod must be 0, 1, or 2.");
      return;
    }
  }else{
    collisionMethod = 0;
  }
  if (!(typeof collisionTimeOffset == UNDEFINED)){
    if (isNaN(collisionTimeOffset)){
      throw new Error("createConfettiExplosion error: Bad collisionTimeOffset parameter.");
      return;
    }
  }else{
    collisionTimeOffset = 0;
  }
  if (!(typeof startDelay == UNDEFINED)){
    if (isNaN(startDelay)){
      throw new Error("createConfettiExplosion error: Bad startDelay parameter.");
      return;
    }
    if (startDelay < 0){
      throw new Error("createConfettiExplosion error: startDelay cannot be a negative number.");
      return;
    }
  }else{
    startDelay = 0;
  }
  var normalSet = false;
  if (!(typeof normal == UNDEFINED)){
      if (isNaN(normal.x) || isNaN(normal.y) || isNaN(normal.z)){
        throw new Error("createConfettiExplosion error: Bad normal parameter.");
        return;
      }
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
  if (TOTAL_PARTICLE_SYSTEM_COUNT >= MAX_PARTICLE_SYSTEM_COUNT){
    throw new Error("copyParticleSystem error: Cannot create more than "+MAX_PARTICLE_SYSTEM_COUNT+" particle systems.");
    return;
  }
  if (typeof particleSystem == UNDEFINED){
    throw new Error("copyParticleSystem error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("copyParticleSystem error: Type not supported.");
    return;
  }
  if (typeof newParticleSystemName == UNDEFINED){
    throw new Error("copyParticleSystem error: newParticleSystemName is not defined.");
    return;
  }
  if (particleSystemPool[newParticleSystemName]){
    throw new Error("copyParticleSystem error: Name must be unique.");
    return;
  }

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
  if (typeof particleSystem == UNDEFINED){
    throw new Error("fadeAway error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("fadeAway error: Type not supported.");
    return;
  }
  if (typeof coefficient == UNDEFINED){
    throw new Error("fadeAway error: coefficient is not defined.");
    return;
  }
  if (isNaN(coefficient)){
    throw new Error("fadeAway error: Bad coefficient parameter.");
    return;
  }
  if (coefficient <= 0){
    throw new Error("fadeAway error: coefficient must be greater than zero.");
    return;
  }
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
  if (!MAX_VERTEX_UNIFORM_VECTORS){
    throw new Error("mergeParticleSystems error: MAX_VERTEX_UNIFORM_VECTORS is not calcualted.");
    return;
  }
  if (Object.keys(particleSystemPool).length < 2){
    throw new Error("mergeParticleSystems error: Mininmum 2 particle systems must be created in order to merge.");
    return;
  }
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
  if (typeof particleSystem == UNDEFINED){
    throw new Error("setParticleSystemPosition error: particleSystem is not defined.");
    return;
  }
  if (!(particleSystem instanceof ParticleSystem)){
    throw new Error("setParticleSystemPosition error: Type not supported.");
    return;
  }
  if (typeof x == UNDEFINED){
    throw new Error("setParticleSystemPosition error: x is not defined.");
    return;
  }
  if (typeof y == UNDEFINED){
    throw new Error("setParticleSystemPosition error: y is not defined.");
    return;
  }
  if (typeof z == UNDEFINED){
    throw new Error("setParticleSystemPosition error: z is not defined.");
    return;
  }
  if (isNaN(x)){
    throw new Error("setParticleSystemPosition error: x is not a number.");
    return;
  }
  if (isNaN(y)){
    throw new Error("setParticleSystemPosition error: y is not a number.");
    return;
  }
  if (isNaN(z)){
    throw new Error("setParticleSystemPosition error: z is not a number.");
    return;
  }
  if (!particleSystem.mesh.visible){
    throw new Error("setParticleSystemPosition error: particleSystem is not visible.");
    return;
  }
  if (particleSystem.checkForCollisions){
    throw new Error("setParticleSystemPosition error: particleSystem has a collision callback attached. Cannot set position.");
    return;
  }
  if (particleSystem.particlesWithCollisionCallbacks.size > 0){
    throw new Error("setParticleSystemPosition error: particleSystem has a collidable particle. Cannot set position.");
    return;
  }
  if (particleSystem.hasTrailedParticle){
    throw new Error("setParticleSystemPosition error: particleSystem has a trailed particle. Cannot set position.");
    return;
  }
  if (particleSystem.velocity.x != 0 || particleSystem.velocity.y != 0 || particleSystem.velocity.z != 0 ||
          particleSystem.acceleration.x != 0 || particleSystem.acceleration.y != 0 || particleSystem.acceleration.z != 0){

      throw new Error("setParticleSystemPosition error: particleSystem has a defined motion. Cannot set position.");
      return;
  }
  particleSystem.mesh.position.set(x, y, z);
  particleSystem.hasManualPositionSet = true;
}

// startObjectTrail
// Starts the trail effect of an object create with createObjectTrail command.
Roygbiv.prototype.startObjectTrail = function(object){
  if (mode == 0){
    return;
  }
  if (typeof object == UNDEFINED){
    throw new Error("startObjectTrail error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("startObjectTrail error: Type not supported.");
    return;
  }
  var objectTrail = objectTrails[object.name];
  if (!objectTrail){
    throw new Error("startObjectTrail error: No trail attached to object.");
    return;
  }
  objectTrail.start();
}

// stopObjectTrail
// Stops the trail effect of an object. The effect can be restarted using the startObjectTrail command.
Roygbiv.prototype.stopObjectTrail = function(object){
  if (mode == 0){
    return;
  }
  if (typeof object == UNDEFINED){
    throw new Error("stopObjectTrail error: object is not defined.");
    return;
  }
  if (!(object instanceof AddedObject) && !(object instanceof ObjectGroup)){
    throw new Error("stopObjectTrail error: Type not supported.");
    return;
  }
  var objectTrail = objectTrails[object.name];
  if (!objectTrail){
    throw new Error("stopObjectTrail error: No trail attached to object.");
    return;
  }
  objectTrail.stop();
}

// CROSSHAIR FUNCTIONS *********************************************************

// createCrosshair
// Creates a new crosshair. Configurations are:
// name: The unique name of the crosshair. (mandatory)
// textureName: The texture name of the crosshair. (mandatory)
// colorName: The color name of the crosshair. (mandatory)
// alpha: The alpha value of the crosshair. (mandatory)
// size: The size of the crosshair. (mandatory)
Roygbiv.prototype.createCrosshair = function(configurations){
  if (mode == 0){
    return;
  }
  var name = configurations.name;
  var textureName = configurations.textureName;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var size = configurations.size;

  if (typeof name == UNDEFINED){
    throw new Error("createCrosshair error: name is a mandatory configuration.");
    return;
  }
  if (crosshairs[name]){
    throw new Error("createCrosshair error: name must be unique.");
    return;
  }
  if (typeof textureName == UNDEFINED){
    throw new Error("createCrosshair error: textureName is a mandatory configuration.");
    return;
  }
  var texture = textures[textureName];
  if (typeof texture == UNDEFINED){
    throw new Error("createCrosshair error: No such texture.");
    return;
  }
  if (!(texture instanceof THREE.Texture)){
    throw new Error("createCrosshair error: Texture not ready.");
    return;
  }
  if (typeof alpha == UNDEFINED){
    throw new Error("createCrosshair error: alpha is a mandatory configuration.");
    return;
  }
  if (isNaN(alpha)){
    throw new Error("createCrosshair error: Bad alpha parameter.");
    return;
  }
  if (alpha < 0 || alpha > 1){
    throw new Error("createCrosshair error: alpha must be between 0 and 1.");
    return;
  }
  if (typeof size == UNDEFINED){
    throw new Error("createCrosshair error: size is a mandatory configuration.");
    return;
  }
  if (isNaN(size)){
    throw new Error("createCrosshair error: Bad size parameter.");
    return;
  }
  if (size <= 0){
    throw new Error("createCrosshair error: size must be greater than zero.");
    return;
  }

  var color = new THREE.Color(colorName);
  new Crosshair({
    name: name,
    texture: texture,
    colorR: color.r,
    colorB: color.b,
    colorG: color.g,
    alpha: alpha,
    size: size
  });
}

// selectCrosshair
// Selects a crosshair. Only the selected crosshair is visible on the screen.
Roygbiv.prototype.selectCrosshair = function(crosshairName){
  if (mode == 0){
    return;
  }
  if (typeof crosshairName == UNDEFINED){
    throw new Error("selectCrosshair error: crosshairName is not defined.");
    return;
  }
  var crosshair = crosshairs[crosshairName];
  if (!crosshair){
    throw new Error("selectCrosshair error: No such crosshair.");
    return;
  }
  if (selectedCrosshair){
    selectedCrosshair.mesh.visible = false;
  }
  crosshair.mesh.visible = true;
  selectedCrosshair = crosshair;
}

// changeCrosshairColor
// Changes the color of the selected crosshair.
Roygbiv.prototype.changeCrosshairColor = function(colorName){
  if (mode == 0){
    return;
  }
  if (typeof colorName == UNDEFINED){
    throw new Error("changeCrosshairColor error: colorName is not defined.");
    return;
  }
  if (!selectedCrosshair){
    throw new Error("changeCrosshairColor error: No crosshair is selected.");
    return;
  }
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
  if (!selectedCrosshair){
    throw new Error("startCrosshairRotation error: No selected crosshair.");
    return;
  }
  if (typeof angularSpeed == UNDEFINED){
    throw new Error("startCrosshairRotation error: angularSpeed is not defined.");
    return;
  }
  if (isNaN(angularSpeed)){
    throw new Error("startCrosshairRotation error: angularSpeed is not a number.");
    return;
  }
  selectedCrosshair.angularSpeed = angularSpeed;
}

// stopCrosshairRotation
// Stops rotation effect of the selected crosshair.
Roygbiv.prototype.stopCrosshairRotation = function(){
  if (mode == 0){
    return;
  }
  if (!selectedCrosshair){
    throw new Error("stopCrosshairRotation error: No selected crosshair.");
    return;
  }
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
  if (!selectedCrosshair){
    throw new Error("pauseCrosshairRotation error: No selected crosshair.");
    return;
  }
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
  if (!selectedCrosshair){
    throw new Error("expandCrosshair error: No selected crosshair.");
    return;
  }
  if (typeof targetSize == UNDEFINED){
    throw new Error("expandCrosshair error: targetSize is not defined.");
    return;
  }
  if (isNaN(targetSize)){
    throw new Error("expandCrosshair error: Bad targetSize parameter.");
    return;
  }
  if (targetSize <= selectedCrosshair.sizeAmount){
    throw new Error("expandCrosshair error: targetSize must not be less than the size of the crosshair.");
    return;
  }
  if (typeof delta == UNDEFINED){
    throw new Error("expandCrosshair error: delta is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("expandCrosshair error: Bad delta parameter.");
    return;
  }
  if (delta <= 0){
    throw new Error("expandCrosshair error: delta must be greater than zero.");
    return;
  }
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
  if (typeof delta == UNDEFINED){
    throw new Error("shrinkCrosshair error: delta is not defined.");
    return;
  }
  if (isNaN(delta)){
    throw new Error("shrinkCrosshair error: Bad delta parameter.");
    return;
  }
  if (delta <= 0){
    throw new Error("shrinkCrosshair error: delta must be greater than zero.");
    return;
  }
  if (!selectedCrosshair){
    throw new Error("shrinkCrosshair error: No selected crosshair.");
    return;
  }
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
  if (!sourceObject){
    throw new Error("setCollisionListener error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject) && !(sourceObject instanceof ObjectGroup) && !(sourceObject instanceof Particle) && !(sourceObject instanceof ParticleSystem)){
    throw new Error("setCollisionListener error: Type not supported.");
    return;
  }
  if ((sourceObject instanceof AddedObject) || (sourceObject instanceof ObjectGroup)){
    if (TOTAL_OBJECT_COLLISION_LISTENER_COUNT >= MAX_OBJECT_COLLISION_LISTENER_COUNT){
      throw new Error("setCollisionListener error: Cannot set collision listener for more than "+MAX_OBJECT_COLLISION_LISTENER_COUNT+" objects.");
      return;
    }
    collisionCallbackRequests[sourceObject.name] = callbackFunction.bind(sourceObject);
    TOTAL_OBJECT_COLLISION_LISTENER_COUNT ++;
  }else if (sourceObject instanceof Particle){
    if (sourceObject.parent && sourceObject.parent.isStopped){
      throw new Error("setCollisionListener error: Particle system is stopped.");
      return;
    }
    if (sourceObject.uuid && !particleCollisionCallbackRequests[sourceObject.uuid]){
      if (TOTAL_PARTICLE_COLLISION_LISTEN_COUNT >= MAX_PARTICLE_COLLISION_LISTEN_COUNT){
        throw new Error("setCollisionListener error: Cannot set collision listener for more than "+MAX_PARTICLE_COLLISION_LISTEN_COUNT+" particles.");
        return;
      }
    }
    if (sourceObject.parent){
      if (sourceObject.parent.hasManualPositionSet){
        throw new Error("setCollisionListener error: A position is set manually to the parent particle system. Cannot listen for collisions.");
        return;
      }
      if (sourceObject.parent.hasManualRotationSet){
        throw new Error("setCollisionListener error: A rotation is set manually to the parent particle system. Cannot listen for collisions.");
        return;
      }
      if (sourceObject.parent.hasManualQuaternionSet){
        throw new Error("setCollisionListener error: A quaternion is set manually to the parent particle system. Cannot listen for collisions.");
        return;
      }
      if (!sourceObject.parent.hasParticleCollision){
        if (TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS >= MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS){
          throw new Error("setCollisionListener error: Maximum "+MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS+" can have collidable particles.");
          return;
        }
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
  }else if (sourceObject instanceof ParticleSystem){
    if (sourceObject.hasManualPositionSet){
      throw new Error("setCollisionListener error: A position is set manually to the particle system. Cannot listen for collisions.");
      return;
    }
    if (sourceObject.hasManualRotationSet){
      throw new Error("setCollisionListener error: A rotation is set manually to the particle system. Cannot listen for collisions.");
      return;
    }
    if (sourceObject.hasManualQuaternionSet){
      throw new Error("setCollisionListener error: A quaternion is set manually to the particle system. Cannot listen for collisions.");
      return;
    }
    var incrCounter = false;
    if (!particleSystemCollisionCallbackRequests[sourceObject.name]){
      if (TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT >= MAX_PARTICLE_SYSTEM_COUNT){
        throw new Error("setCollisionListener error: Cannot set collision listener for more than "+MAX_PARTICLE_SYSTEM_COUNT+" particle systems.");
        return;
      }
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
  if (!sourceObject){
    throw new Error("removeCollisionListener error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject) && !(sourceObject instanceof ObjectGroup) && !(sourceObject instanceof Particle) && !(sourceObject instanceof ParticleSystem)){
    throw new Error("removeCollisionListener error: Type not supported.");
    return;
  }
  var curCallbackRequest;
  if ((sourceObject instanceof AddedObject) || (sourceObject instanceof ObjectGroup)){
    curCallbackRequest = collisionCallbackRequests[sourceObject.name];
  }else if (sourceObject instanceof Particle){
    curCallbackRequest = particleCollisionCallbackRequests[sourceObject.uuid];
  }else if (sourceObject instanceof ParticleSystem){
    curCallbackRequest = particleSystemCollisionCallbackRequests[sourceObject.name];
  }
  if (curCallbackRequest){
    if ((sourceObject instanceof AddedObject) || (sourceObject instanceof ObjectGroup)){
      delete collisionCallbackRequests[sourceObject.name];
      TOTAL_OBJECT_COLLISION_LISTENER_COUNT --;
    }else if (sourceObject instanceof Particle){
      delete particleCollisionCallbackRequests[sourceObject.uuid];
      TOTAL_PARTICLE_COLLISION_LISTEN_COUNT --;
      sourceObject.checkForCollisions = false;
      if (sourceObject.parent){
        sourceObject.parent.notifyParticleCollisionCallbackChange(sourceObject);
      }
    }else if (sourceObject instanceof ParticleSystem){
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
  if (typeof sourceObject == UNDEFINED){
    throw new Error("setExpireListener error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof ParticleSystem)){
    throw new Error("setExpireListener error: sourceObject is not a particle system.");
    return;
  }
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setExpireListener error: callbackFunction is not defined.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setExpireListener error: callbackFunction is not a function.");
    return;
  }
  if (sourceObject.destroyed){
    throw new Error("setExpireListener error: sourceObject is already expired.");
    return;
  }
  sourceObject.expirationFunction = callbackFunction;
}

// removeExpireListener
// Removes the expiration listener function of a particle system.
Roygbiv.prototype.removeExpireListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  if (typeof sourceObject == UNDEFINED){
    throw new Error("removeExpireListener error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof ParticleSystem)){
    throw new Error("removeExpireListener error: sourceObject is not a particle system.");
    return;
  }
  if (sourceObject.destroyed){
    throw new Error("removeExpireListener error: sourceObject is already expired.");
    return;
  }
  delete sourceObject.expirationFunction;
}

// setObjectClickListener
// Sets a click listener for an object or an object group. The callbackFunction is executed
// with x, y, z coordinates of the clicked point.
Roygbiv.prototype.setObjectClickListener = function(sourceObject, callbackFunction){
  if (mode == 0){
    return;
  }
  if (sourceObject == UNDEFINED){
    throw new Error("setClickListener error: sourceObject is not defined.");
    return;
  }
  if (callbackFunction == UNDEFINED){
    throw new Error("setClickListener error: callbackFunction is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject) && !(sourceObject instanceof ObjectGroup)){
    throw new Error("setClickListener error: Type not supported.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setClickListener error: callbackFunction is not a function.");
    return;
  }
  sourceObject.clickCallbackFunction = callbackFunction;
}

// removeObjectClickListener
// Removes the click listener of an object or an object group.
Roygbiv.prototype.removeObjectClickListener = function(sourceObject){
  if (mode == 0){
    return;
  }
  if (sourceObject == UNDEFINED){
    throw new Error("removeClickListener error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject) && !(sourceObject instanceof ObjectGroup)){
    throw new Error("removeClickListener error: Type not supported.");
    return;
  }
  delete sourceObject.clickCallbackFunction;
}

// setScreenClickListener
// Sets a click listener for the screen. The callbackFunction is
// executed with x, y coordinates when clicked on the screen.
Roygbiv.prototype.setScreenClickListener = function(callbackFunction){
  if (mode == 0){
    return;
  }
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setScreenClickListener error: callbackFunction is not defined.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setScreenClickListener error: callbackFunction is not a function.");
    return;
  }
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
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setScreenMouseDownListener error: callbackFunction is not defined.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setScreenMouseDownListener error: callbackFunction is not a function.");
    return;
  }
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
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setScreenMouseUpListener error: callbackFunction is not defined.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setScreenMouseUpListener error: callbackFunction is not a function.");
    return;
  }
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
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setScreenMouseMoveListener error: callbackFunction is not defined.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setScreenMouseMoveListener error: callbackFunction is not a function.");
    return;
  }
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
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setScreenPointerLockChangeListener error: callbackFunction is not defined.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setScreenPointerLockChangeListener error: callbackFunction is not a function.");
    return;
  }
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
  if (typeof psPool == UNDEFINED){
    throw new Error("setParticleSystemPoolConsumedListener error: psPool is not defined.");
    return;
  }
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setParticleSystemPoolConsumedListener error: callbackFunction is not defined.");
    return;
  }
  if (!(psPool instanceof ParticleSystemPool)){
    throw new Error("setParticleSystemPoolConsumedListener error: psPool is not a ParticleSystemPool.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setParticleSystemPoolConsumedListener error: callbackFunction is not a function.");
    return;
  }
  psPool.consumedCallback = callbackFunction;
}

// removeParticleSystemPoolConsumedListener
// Removes the consumption listener of a particle system pool.
Roygbiv.prototype.removeParticleSystemPoolConsumedListener = function(psPool){
  if (mode == 0){
    return;
  }
  if (typeof psPool == UNDEFINED){
    throw new Error("removeParticleSystemPoolConsumedListener error: psPool is not defined.");
    return;
  }
  if (!(psPool instanceof ParticleSystemPool)){
    throw new Error("removeParticleSystemPoolConsumedListener error: psPool is not a ParticleSystemPool.");
    return;
  }
  psPool.consumedCallback = 0;
}

// setParticleSystemPoolAvailableListener
// Sets an availability listener for a particle system pool. The callbackFunction is executed
// when there is at least one available particle system inside the pool again.
Roygbiv.prototype.setParticleSystemPoolAvailableListener = function(psPool, callbackFunction){
  if (mode == 0){
    return;
  }
  if (typeof psPool == UNDEFINED){
    throw new Error("setParticleSystemPoolAvailableListener error: psPool is not defined.");
    return;
  }
  if (typeof callbackFunction == UNDEFINED){
    throw new Error("setParticleSystemPoolAvailableListener error: callbackFunction is not defined.");
    return;
  }
  if (!(psPool instanceof ParticleSystemPool)){
    throw new Error("setParticleSystemPoolAvailableListener error: psPool is not a ParticleSystemPool.");
    return;
  }
  if (!(callbackFunction instanceof Function)){
    throw new Error("setParticleSystemPoolAvailableListener error: callbackFunction is not a function.");
    return;
  }
  psPool.availableCallback = callbackFunction;
}

// removeParticleSystemPoolAvailableListener
// Removes the availablity listener for a particle system pool.
Roygbiv.prototype.removeParticleSystemPoolAvailableListener = function(psPool){
  if (mode == 0){
    return;
  }
  if (typeof psPool == UNDEFINED){
    throw new Error("removeParticleSystemPoolAvailableListener error: psPool is not defined.");
    return;
  }
  if (!(psPool instanceof ParticleSystemPool)){
    throw new Error("removeParticleSystemPoolAvailableListener error: psPool is not a ParticleSystemPool.");
    return;
  }
  psPool.availableCallback = 0;
}

// UTILITY FUNCTIONS ***********************************************************

// vector
//  Creates a new vector from x, y and z coordinates.
Roygbiv.prototype.vector = function(x, y, z){
  if (mode == 0){
    return;
  }
  if (typeof x == UNDEFINED){
    throw new Error("vector error: x is not defined.");
    return;
  }
  if (typeof y == UNDEFINED){
    throw new Error("vector error: y is not defined.");
    return;
  }
  if (typeof z == UNDEFINED){
    throw new Error("vector error: z is not defined.");
    return;
  }
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
  if (!vec1){
    throw new Error("distance error: vec1 is not defined.");
    return;
  }
  if (!vec2){
    throw new Error("distance error: vec2 is not defined.");
    return;
  }
  if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec1.z)){
    throw new Error("distance error: vec1 is not a vector.");
    return;
  }
  if (isNaN(vec2.x) || isNaN(vec2.y) || isNaN(vec2.z)){
    throw new Error("distance error: vec2 is not a vector.");
    return;
  }
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
  if (!vec1){
    throw new Error("sub error: vec1 is not defined.");
    return;
  }
  if (!vec2){
    throw new Error("sub error: vec2 is not defined.");
    return;
  }
  if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec1.z)){
    throw new Error("sub error: vec1 is not a vector.");
    return;
  }
  if (isNaN(vec2.x) || isNaN(vec2.y) || isNaN(vec2.z)){
    throw new Error("sub error: vec2 is not a vector.");
    return;
  }
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("sub error: Bad targetVector parameter.");
      return;
    }
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
Roygbiv.prototype.add = function(vec1, vec2){
  if (mode == 0){
    return;
  }
  if (!vec1){
    throw new Error("add error: vec1 is not defined.");
    return;
  }
  if (!vec2){
    throw new Error("add error: vec2 is not defined.");
    return;
  }
  if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec1.z)){
    throw new Error("add error: vec1 is not a vector.");
    return;
  }
  if (isNaN(vec2.x) || isNaN(vec2.y) || isNaN(vec2.z)){
    throw new Error("add error: vec2 is not a vector.");
    return;
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
  if (!vec1){
    throw new Error("moveTowards error: vec1 is not defined.");
    return;
  }
  if (!vec2){
    throw new Error("moveTowards error: vec2 is not defined.");
    return;
  }
  if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec1.z)){
    throw new Error("moveTowards error: vec1 is not a vector.");
    return;
  }
  if (isNaN(vec2.x) || isNaN(vec2.y) || isNaN(vec2.z)){
    throw new Error("moveTowards error: vec2 is not a vector.");
    return;
  }
  if (typeof amount == UNDEFINED){
    throw new Error("moveTowards error: amount is not defined.");
    return;
  }
  if (isNaN(amount)){
    throw new Error("moveTowards error: amount is not a number.");
    return;
  }
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("moveTowards error: Bad targetVector parameter.");
    }
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
  if (!vec){
    throw new Error("applyNoise error: vector is not defined.");
    return;
  }
  if (typeof vec.x == UNDEFINED || typeof vec.y == UNDEFINED || typeof vec.z == UNDEFINED){
    throw new Error("applyNoise error: vector format not supported.");
    return;
  }
  if (isNaN(vec.x) || isNaN(vec.y) || isNaN(vec.z)){
    throw new Error("applyNoise error: vector format not supported.");
    return;
  }

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
  if (!radius){
    throw new Error("sphericalDistribution error: radius is not defined.");
    return;
  }
  if (isNaN(radius)){
    throw new Error("sphericalDistribution error: radius is not numerical.");
    return;
  }
  if (radius <= 0){
    throw new Error("sphericalDistribution error: radius is not a positive number.");
    return;
  }

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
  if (typeof sizeX == UNDEFINED || typeof sizeY == UNDEFINED || typeof sizeZ == UNDEFINED){
    throw new Error("boxDistribution error: Bad parameters.");
    return;
  }
  if (isNaN(sizeX) || isNaN(sizeY) || isNaN(sizeZ)){
    throw new Error("boxDistribution error: Bad parameters.");
    return;
  }
  if (sizeX < 0 || sizeY < 0 || sizeZ < 0){
    throw new Error("boxDistribution error: Bad parameters.");
    return;
  }
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
  if (!colorName){
    throw new Error("color error: colorName is not defined.");
    return;
  }
  return new THREE.Color(colorName.toLowerCase());
}

// runScript
//  Starts a script of the given name. If parameters are provided, they may
//  be reached using this.[parameterName] within the newly started script.
Roygbiv.prototype.runScript = function(name, parameters){
  if (mode == 0){
    return;
  }
  var script = scripts[name];
  if (!script){
    throw new Error("runScript error: Script is undefined.");
    return;
  }
  if (parameters){
    for (var key in parameters){
      script[key] = parameters[key];
    }
  }
  if (script.localFilePath){
    script.reloadAndStart();
  }else{
    script.start();
  }
}

// isRunning
//  Returns whether a script of the given name is running or not.
Roygbiv.prototype.isRunning = function(name){
  if (mode == 0){
    return;
  }
  var script = scripts[name];
  if (!script){
    throw new Error("isRunning error: Script is undefined.");
    return;
  }
  return script.status == "STARTED";
}

// normalizeVector
//  Normalizes the vector given in the parameter. Note that this function modifies directly the
//  parameter and returns nothing.
Roygbiv.prototype.normalizeVector = function(vector){
  if (mode == 0){
    return;
  }
  if (typeof vector == UNDEFINED){
    throw new Error("normalizeVector error: vector is not defined.");
    return;
  }
  if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z)){
    throw new Error("normalizeVector error: Bad vector parameter.");
    return;
  }
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
  if (typeof vec1 == UNDEFINED){
    throw new Error("computeQuaternionFromVectors error: vec1 is not defined.");
    return;
  }
  if (typeof vec2 == UNDEFINED){
    throw new Error("computeQuaternionFromVectors error: vec2 is not defined.");
    return;
  }
  if (isNaN(vec1.x) || isNaN(vec1.y) || isNaN(vec1.z)){
    throw new Error("computeQuaternionFromVectors error: Bad vec1 parameter.");
    return;
  }
  if (isNaN(vec2.x) || isNaN(vec2.y) || isNaN(vec2.z)){
    throw new Error("computeQuaternionFromVectors error: Bad vec2 parameter.");
    return;
  }
  if (!(typeof targetQuaternion == UNDEFINED)){
    if (isNaN(targetQuaternion.x) || isNaN(targetQuaternion.y) || isNaN(targetQuaternion.z) || isNaN(targetQuaternion.w)){
      throw new Error("computeQuaternionFromVectors error: Bad targetQuaternion parameter.");
      return;
    }
  }
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
  if (typeof radius == UNDEFINED){
    throw new Error("circularDistribution error: radius is not defined.");
    return;
  }
  if (isNaN(radius)){
    throw new Error("circularDistribution error: Bad radius parameter.");
    return;
  }
  if (radius <= 0){
    throw new Error("circularDistribution error: radius must be greater than zero.");
    return;
  }
  if (!(typeof quaternion == UNDEFINED)){
    if (isNaN(quaternion.x) || isNaN(quaternion.y) || isNaN(quaternion.y) || isNaN(quaternion.w)){
      throw new Error("circularDistribution error: Bad quaternion parameter.");
      return;
    }
  }
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
  if (typeof scalar == UNDEFINED){
    throw new Error("multiplyScalar error: scalar is not defined.");
    return;
  }
  if (isNaN(scalar)){
    throw new Error("multiplyScalar error: Bad scalar parameter.");
    return;
  }
  if (typeof vector == UNDEFINED){
    throw new Error("multiplyScalar error: vector is not defined.");
    return;
  }
  if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z)){
    throw new Error("multiplyScalar error: Bad vector parameter.");
    return;
  }
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("multiplyScalar error: Bad targetVector parameter.");
      return;
    }
  }
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
  if (typeof vector == UNDEFINED){
    throw new Error("setVector error: vector is not defined.");
    return;
  }
  if (typeof x == UNDEFINED){
    throw new Error("setVector error: x is not defined.");
    return;
  }
  if (typeof y == UNDEFINED){
    throw new Error("setVector error: y is not defined.");
    return;
  }
  if (typeof z == UNDEFINED){
    throw new Error("setVector error: z is not defined.");
    return;
  }
  if (isNaN(x) || isNaN(y) || isNaN(y)){
    throw new Error("setVector error: Components must be numerical.");
    return;
  }
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
  if (!pointerLockSupported){
    throw new Error("requestPointerLock error: Pointer Lock API is not supported by this browser.");
    return;
  }
  pointerLockRequested = true;
}

// convertEulerToDegrees
// Returns the degree equivalent of an Euler angle.
Roygbiv.prototype.convertEulerToDegrees = function(eulerAngle){
  if (mode == 0){
    return;
  }
  if (typeof eulerAngle == UNDEFINED){
    throw new Error("convertEulerToDegrees error: eulerAngle is not defined.");
    return;
  }
  return ((eulerAngle * 180) / Math.PI);
}

// disableDefaultControls
// Disables or enables the default WASD camera controls. This function can be used
// before implementing manual camera controls.
Roygbiv.prototype.disableDefaultControls = function(isDisabled){
  if (mode == 0){
    return;
  }
  if (typeof isDisabled == UNDEFINED){
    throw new Error("disableDefaultControls error: isDisabled is not defined.");
    return;
  }
  if (!(typeof isDisabled == "boolean")){
    throw new Error("disableDefaultControls error: isDisabled is not a boolean.");
    return;
  }
  defaultCameraControlsDisabled = isDisabled;
}

// isKeyPressed
// Returns whether the given key is pressed or not. See the keyCodeToChar
// variable for possible key names.
Roygbiv.prototype.isKeyPressed = function(key){
  if (mode == 0){
    return;
  }
  if (typeof key == UNDEFINED){
    throw new Error("isKeyPressed error: key is not defined.");
    return;
  }
  return keyboardBuffer[key];
}

// setCameraPosition
// Sets the position of the camera.
Roygbiv.prototype.setCameraPosition = function(x, y, z){
  if (mode == 0){
    return;
  }
  if (typeof x == UNDEFINED){
    throw new Error("setCameraPosition error: x is not defined.");
    return;
  }
  if (typeof y == UNDEFINED){
    throw new Error("setCameraPosition error: y is not defined.");
    return;
  }
  if (typeof z == UNDEFINED){
    throw new Error("setCameraPosition error: z is not defined.");
    return;
  }
  if (isNaN(x)){
    throw new Error("setCameraPosition error: x is not a number.");
    return;
  }
  if (isNaN(y)){
    throw new Error("setCameraPosition error: y is not a number.");
    return;
  }
  if (isNaN(z)){
    throw new Error("setCameraPosition error: z is not a number.");
    return;
  }
  camera.position.set(x, y, z);
}

// lookAt
// Makes the camera look at specific position.
Roygbiv.prototype.lookAt = function(x, y, z){
  if (mode == 0){
    return;
  }
  if (typeof x == UNDEFINED){
    throw new Error("lookAt error: x is not defined.");
    return;
  }
  if (typeof y == UNDEFINED){
    throw new Error("lookAt error: y is not defined.");
    return;
  }
  if (typeof z == UNDEFINED){
    throw new Error("lookAt error: z is not defined.");
    return;
  }
  if (isNaN(x)){
    throw new Error("lookAt error: x is not a number.");
    return;
  }
  if (isNaN(y)){
    throw new Error("lookAt error: y is not a number.");
    return;
  }
  if (isNaN(z)){
    throw new Error("lookAt error: z is not a number.");
    return;
  }
  camera.lookAt(x, y, z);
}

// applyAxisAngle
// Rotates the vector around an axis by given angle.
Roygbiv.prototype.applyAxisAngle = function(vector, axisVector, angle, targetVector){
  if (mode == 0){
    return;
  }
  if (typeof vector == UNDEFINED){
    throw new Error("applyAxisAngle error: vector is not defined.");
    return;
  }
  if (typeof axisVector == UNDEFINED){
    throw new Error("applyAxisAngle error: axisVector is not defined.");
    return;
  }
  if (typeof angle == UNDEFINED){
    throw new Error("applyAxisAngle error: angle is not defined.");
    return;
  }
  if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z)){
    throw new Error("applyAxisAngle error: Bad vector parameter.");
    return;
  }
  if (isNaN(axisVector.x) || isNaN(axisVector.y) || isNaN(axisVector.z)){
    throw new Error("applyAxisAngle error: Bad axisVector parameter.");
    return;
  }
  if (isNaN(angle)){
    throw new Error("applyAxisAngle error: Bad angle parameter.");
    return;
  }
  REUSABLE_VECTOR.set(vector.x, vector.y, vector.z);
  REUSABLE_VECTOR_2.set(axisVector.x, axisVector.y, axisVector.z);
  REUSABLE_VECTOR.applyAxisAngle(REUSABLE_VECTOR_2, angle);
  if (!(typeof targetVector == UNDEFINED)){
    if (isNaN(targetVector.x) || isNaN(targetVector.y) || isNaN(targetVector.z)){
      throw new Error("applyAxisAngle errorİ Bad targetVector parameter.");
      return;
    }
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
  if (typeof sourceObject == UNDEFINED){
    throw new Error("trackObjectPosition error: sourceObject is not defined.");
    return;
  }
  if (typeof targetObject == UNDEFINED){
    throw new Error("trackObjectPosition error: targetObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject || sourceObject instanceof ObjectGroup)){
    throw new Error("trackObjectPosition error: sourceObject type not supported.");
    return;
  }
  if (!(targetObject instanceof AddedObject || targetObject instanceof ObjectGroup)){
    throw new Error("trackObjectPosition error: targetObject type not supported.");
    return;
  }
  if (targetObject.parentObjectName || sourceObject.parentObjectName){
    throw new Error("trackObjectPosition error: Child objects do not support this function.");
    return;
  }
  if (!targetObject.isDynamicObject){
    throw new Error("trackObjectPosition error: targetObject is not a dynamic object.");
    return;
  }
  if (sourceObject.isDynamicObject){
    throw new Error("trackObjectPosition error: sourceObject is a dynamic object.");
    return;
  }
  if (!sourceObject.isChangeable){
    throw new Error("trackObjectPosition error: sourceObject is not marked as changeable.");
    return;
  }
  sourceObject.trackedObject = targetObject;
  targetObject.isTracked = true;
  trackingObjects[sourceObject.name] = sourceObject;
}

// untrackObjectPosition
// Stops tracking an objects position for an object.
Roygbiv.prototype.untrackObjectPosition = function(sourceObject){
  if (mode == 0){
    return;
  }
  if (typeof sourceObject == UNDEFINED){
    throw new Error("untrackObjectPosition error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject || sourceObject instanceof ObjectGroup)){
    throw new Error("untrackObjectPosition error: sourceObject type not supported.");
    return;
  }
  delete sourceObject.trackedObject;
  delete trackingObjects[sourceObject.name];
}

// createRotationPivot
// Creates and returns a rotation pivot for an object. This function is not
// optimized for the runtime. Use this function before setRotationPivot API on
// initialization.
Roygbiv.prototype.createRotationPivot = function(sourceObject, offsetX, offsetY, offsetZ){
  if (mode == 0){
    return;
  }
  if (typeof sourceObject == UNDEFINED){
    throw new Error("createRotationPivot error: sourceObject is not defined.");
    return;
  }
  if (!(sourceObject instanceof AddedObject || sourceObject instanceof ObjectGroup)){
    throw new Error("createRotationPivot error: Unsupported type.");
    return;
  }
  if (isNaN(offsetX)){
    throw new Error("createRotationPivot error: offsetX is not a number.");
    return;
  }
  if (isNaN(offsetY)){
    throw new Error("createRotationPivot error: offsetY is not a number.");
    return;
  }
  if (isNaN(offsetZ)){
    throw new Error("createRotationPivot error: offsetZ is not a number.");
    return;
  }
  return sourceObject.makePivot(offsetX, offsetY, offsetZ);
}
