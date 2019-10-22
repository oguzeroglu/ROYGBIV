var Preconditions = function(){
  this.object = "object";
  this.objectGroup = "objectGroup";
  this.childObjectName = "childObjectName";
  this.targetVector = "targetVector";
  this.axis = "axis";
  this.markedPointName = "markedPointName";
  this.targetVector = "targetVector";
  this.particleSystem = "particleSystem";
  this.time = "time";
  this.name = "name";
  this.pool = "pool";
  this.textName = "textName";
  this.keepPhysics = "keepPhysics";
  this.force = "force";
  this.point = "point";
  this.radians = "radians";
  this.x = "x";
  this.y = "y";
  this.z = "z";
  this.skipLocalRotation = "skipLocalRotation";
  this.obj = "obj";
  this.mass = "mass";
  this.velocityVector = "velocityVector";
  this.velocity = "velocity";
  this.acceleration = "acceleration";
  this.colorName = "colorName";
  this.alpha = "alpha";
  this.rotationPivot = "rotationPivot";
  this.color = "color";
  this.size = "size";
  this.texture = "texture";
  this.rgbFilter = "rgbFilter";
  this.targetColor = "targetColor";
  this.targetColorName = "targetColorName";
  this.colorStep = "colorStep";
  this.configurations = "configurations";
  this.motionMode = "motionMode";
  this.position = "position";
  this.initialAngle = "initialAngle";
  this.MOTION_MODE_NORMAL = "MOTION_MODE_NORMAL";
  this.MOTION_MODE_CIRCULAR = "MOTION_MODE_CIRCULAR";
  this.material = "material";
  this.lifetime = "lifetime";
  this.respawn = "respawn";
  this.alphaVariation = "alphaVariation";
  this.alphaVariationMode = "alphaVariationMode";
  this.startDelay = "startDelay";
  this.trailMode = "trailMode";
  this.angularVelocity = "angularVelocity";
  this.angularAcceleration = "angularAcceleration";
  this.angularMotionRadius = "angularMotionRadius";
  this.angularQuaternion = "angularQuaternion";
  this.useWorldPosition = "useWorldPosition";
  this.particles = "particles";
  this.scaleVector = "scaleVector";
  this.blendingMode = "blendingMode";
  this.quatX = "quatX";
  this.quatY = "quatY";
  this.quatZ = "quatZ";
  this.quatW = "quatW";
  this.expiretime = "expireTime";
  this.smokeSize = "smokeSize";
  this.particleSize = "particleSize";
  this.particleCount = "particleCount";
  this.movementAxis = "movementAxis";
  this.randomness = "randomness";
  this.updateFunction = "updateFunction";
  this.accelerationDirection = "accelerationDirection";
  this.radius = "radius";
  this.avgParticleSpeed = "avgParticleSpeed";
  this.alphaVariationCoef = "alphaVariationCoef";
  this.explosionDirection = "explosionDirection";
  this.explosionSpeed = "explosionSpeed";
  this.speed = "speed";
  this.circleNormal = "circleNormal";
  this.circleDistortionCoefficient = "circleDistortionCoefficient";
  this.angleStep = "angleStep";
  this.normal = "normal";
  this.maxTimeInSeconds = "maxTimeInSeconds";
  this.particle = "particle";
  this.delay = "delay";
  this.direction = "direction";
  this.timediff = "timeDiff";
  this.particleExpireTime = "particleExpireTime";
  this.rewindOnCollided = "rewindOnCollided";
  this.collisionTimeOffset = "collisionTimeOffset";
  this.sizeX = "sizeX";
  this.sizeY = "sizeY";
  this.sizeZ = "sizeZ";
  this.avgStartDelay = "avgStartDelay";
  this.stopDuration = "stopDuration";
  this.startPosition = "startPosition";
  this.startVelocity = "startVelocity";
  this.startAcceleration = "startAcceleration";
  this.startQuaternion = "startQuaternion";
  this.verticalSpeed = "verticalSpeed";
  this.horizontalSpeed = "horizontalSpeed";
  this.verticalAcceleration = "verticalAcceleration";
  this.collisionMethod = "collisionMethod";
  this.newParticleSystemName = "newParticleSystemName";
  this.coefficient = "coefficient";
  this.refParticleSystem = "refParticleSystem";
  this.poolName = "poolName";
  this.poolSize = "poolSize";
  this.referenceHeight = "referenceHeight";
  this.textureName = "textureName";
  this.maxWidthPercent = "maxWidthPercent";
  this.maxHeightPercent = "maxHeightPercent";
  this.crosshairName = "crosshairName";
  this.angularSpeed = "angularSpeed";
  this.targetSize = "targetSize";
  this.delta = "delta";
  this.sourceObject = "sourceObject";
  this.targetObject = "targetObject";
  this.callbackFunction = "callbackFunction";
  this.timeOffset = "timeOffset";
  this.psPool = "psPool";
  this.minFPS = "minFPS";
  this.seconds = "seconds";
  this.maxTimeInSeconds = "maxTimeInSeconds";
  this.text = "text";
  this.textObject = "textObject";
  this.vec = "vec";
  this.vec1 = "vec1";
  this.vec2 = "vec2";
  this.amount = "amount";
  this.vector = "vector";
  this.targetQuaternion = "targetQuaternion";
  this.quaternion = "quaternion";
  this.scalar = "scalar";
  this.eulerAngle = "eulerAngle";
  this.isDisabled = "isDisabled";
  this.key = "key";
  this.axisVector = "axisVector";
  this.angle = "angle";
  this.offsetX = "offsetX";
  this.offsetY = "offsetY";
  this.offsetZ = "offsetZ";
  this.fromVector = "fromVector";
  this.directionVector = "directionVector";
  this.targetResultObject = "targetResultObject";
  this.vector1 = "vector1";
  this.vector2 = "vector2";
  this.params = "params";
  this.strength = "strength";
  this.threshold = "threshold";
  this.resolutionScale = "resolutionScale";
  this.paused = "paused";
  this.onComplete = "onComplete";
  this.func = "func";
  this.minInclusive = "minInclusive";
  this.maxInclusive = "maxInclusive";
  this.controlMode = "controlMode";
  this.rotationYDelta = "rotationYDelta";
  this.rotationXDelta = "rotationXDelta";
  this.translateZAmount = "translateZAmount";
  this.translateXAmount = "translateXAmount";
  this.translateYAmount = "translateYAmount";
  this.mouseWheelSpeed = "mouseWheelSpeed";
  this.swipeSpeed = "swipeSpeed";
  this.parameters = "parameters";
  this.onClick = "onClick";
  this.onTap = "onTap";
  this.onSwipe = "onSwipe";
  this.onPinch = "onPinch";
  this.onMouseWheel = "onMouseWheel";
  this.onMouseMove = "onMouseMove";
  this.onMouseDown = "onMouseDown";
  this.onMouseUp = "onMouseUp";
  this.onUpdate = "onUpdate";
  this.control = "control";
  this.onTouchStart = "onTouchStart";
  this.onTouchMove = "onTouchMove";
  this.onTouchEnd = "onTouchEnd";
  this.onKeyDown = "onKeyDown";
  this.onKeyUp = "onKeyUp";
  this.onResize = "onResize";
  this.onFullScreenChange = "onFullScreenChange";
  this.requestFullScreen = "requestFullScreen";
  this.playerBodyObject = "playerBodyObject";
  this.mouseSpeed = "mouseSpeed";
  this.touchLookSpeed = "touchLookSpeed";
  this.jumpSpeed = "jumpSpeed";
  this.jumpableVelocityCoefficient = "jumpableVelocityCoefficient";
  this.touchJoystickThreshold = "touchJoystickThreshold";
  this.touchJoystickDegreeInterval = "touchJoystickDegreeInterval";
  this.crosshairExpandSize = "crosshairExpandSize";
  this.crosshairAnimationDelta = "crosshairAnimationDelta";
  this.hasDoubleJump = "hasDoubleJump";
  this.doubleJumpTimeThresholdInMs = "doubleJumpTimeThresholdInMs";
  this.weaponObject1 = "weaponObject1";
  this.weaponObject2 = "weaponObject2";
  this.hasIdleGunAnimation = "hasIdleGunAnimation";
  this.idleGunAnimationSpeed = "idleGunAnimationSpeed";
  this.weaponRotationRandomnessOn = "weaponRotationRandomnessOn";
  this.onLook = "onLook";
  this.onShoot = "onShoot";
  this.onStoppedShooting = "onStoppedShooting";
  this.shootableObjects = "shootableObjects";
  this.onPause = "onPause";
  this.onResume = "onResume";
  this.skipList = "skipList";
  this.onDrag = "onDrag";
  this.mouseDragSpeed = "mouseDragSpeed";
  this.lookPosition = "lookPosition";
  this.maxRadius = "maxRadius";
  this.minRadius = "minRadius";
  this.zoomDelta = "zoomDelta";
  this.mouseWheelRotationSpeed = "mouseWheelRotationSpeed";
  this.mouseDragRotationSpeed = "mouseDragRotationSpeed";
  this.fingerSwipeRotationSpeed = "fingerSwipeRotationSpeed";
  this.keyboardRotationSpeed = "keyboardRotationSpeed";
  this.collisionAction = "collisionAction";
  this.scriptName = "scriptName";
  this.animationName = "animationName";
  this.muzzleflashName = "muzzleflashName";
  this.delayInMS = "delayInMS";
  this.repeat = "repeat";
  this.delayedExecutionID = "delayedExecutionID";
  this.sceneName = "sceneName";
  this.readyCallback = "readyCallback";
  this.animationTimeInMS = "animationTimeInMS";
  this.lightningName = "lightningName";
  this.lightning = "lightning";
  this.areaName = "areaName";
}

Preconditions.prototype.errorHeader = function(callerFunc){
  return callerFunc.roygbivFuncName+" error: ";
}

Preconditions.prototype.throw = function(callerFunc, errorMsg){
  throw new Error(this.errorHeader(callerFunc)+" ["+errorMsg+"]");
}

Preconditions.prototype.checkIfSceneExists = function(callerFunc, sceneName){
  if (!sceneHandler.scenes[sceneName]){
    this.throw(callerFunc, "No such scene.");
  }
}

Preconditions.prototype.checkIfAreaExists = function(callerFunc, areaName){
  if (!areas[areaName]){
    this.throw(callerFunc, "Area does not exist.");
  }
}

Preconditions.prototype.checkIfLightningStartable = function(callerFunc, lightning){
  if (lightning.attachedToFPSWeapon){
    var fpsWeaponObj = lightning.fpsWeaponConfigurations.weaponObj;
    if (!activeControl.isFPSControls){
      this.throw(callerFunc, "Lightning attached to FPS weapon but FPS control is not active.");
    }else{
      var found = false;
      if (activeControl.hasWeapon1 && activeControl.weaponObject1 == fpsWeaponObj){
        found = true;
      }else if (activeControl.hasWeapon2 && activeControl.weaponObject2 == fpsWeaponObj){
        found = true;
      }
      if (!found){
        this.throw(callerFunc, "Lightning attached to FPS weapon but FPS weapon is not active.");
      }
    }
  }
}

Preconditions.prototype.checkIfLightning = function(callerFunc, lightning){
  if (!lightning.isLightning){
    this.throw(callerFunc, "Object is not a lightning.");
  }
}

Preconditions.prototype.checkIfLightningInsideActiveScene = function(callerFunc, lightning){
  if (lightning.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Lightning not inside active scene.");
  }
}

Preconditions.prototype.checkIfMuzzleFlashInsideActiveScene = function(callerFunc, muzzleFlash){
  if (muzzleFlash.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Muzzleflash not inside the active scene.");
  }
}

Preconditions.prototype.checkIfCrosshairInsideActiveSceneOnlyIfNameExists = function(callerFunc, crosshairName){
  if (crosshairName){
    this.checkIfCrosshairInsideActiveScene(callerFunc, crosshairs[crosshairName]);
  }
}

Preconditions.prototype.checkIfCrosshairInsideActiveScene = function(callerFunc, crosshair){
  if (crosshair.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Crosshair not inside the active scene.");
  }
}

Preconditions.prototype.checkIfTextInsideActiveScene = function(callerFunc, text){
  if (text.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Text not inside the active scene.");
  }
}

Preconditions.prototype.checkIfParticleSystemPoolInsideActiveScene = function(callerFunc, psPool){
  if (psPool.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Particlesystem pool not inside the active scene.");
  }
}

Preconditions.prototype.checkIfParticleSystemInsideActiveScene = function(callerFunc, ps){
  if (ps.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Particlesystem not inside the active scene.");
  }
}

Preconditions.prototype.checkIfMarkedPointInsideActiveScene = function(callerFunc, mp){
  if (mp.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Marked point not inside the active scene.");
  }
}

Preconditions.prototype.checkIfObjectInsideActiveScene = function(callerFunc, obj){
  if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
    this.throw(callerFunc, "Object not inside active scene.");
  }
}

Preconditions.prototype.checkIfObjectInsideActiveSceneOnlyIfExists = function(callerFunc, obj){
  if (obj){
    this.checkIfObjectInsideActiveScene(callerFunc, obj);
  }
}

Preconditions.prototype.checkIfAnimationExists = function(callerFunc, obj, animationName){
  if (!obj.animations[animationName]){
    this.throw(callerFunc, "Object does not have such animation: "+animationName);
  }
}

Preconditions.prototype.checkIfCollisionActionOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (obj !== PARTICLE_REWIND_ON_COLLIDED && obj !== PARTICLE_DISSAPEAR_ON_COLLIDED){
      this.throw(callerFunc, parameterName+" must be one of PARTICLE_REWIND_ON_COLLIDED or PARTICLE_DISSAPEAR_ON_COLLIDED.");
    }
  }
}

Preconditions.prototype.checkIfArrayOfParticleSystemsOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    for (var i = 0; i<obj.length; i++){
      if (!obj[i].isParticleSystem){
        this.throw(callerFunc, parameterName+" is not an Array of ParticleSystems.");
      }
    }
  }
}

Preconditions.prototype.checkIfArrayOfObjectsOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    for (var i = 0; i<obj.length; i++){
      if (!obj[i].isAddedObject && !obj[i].isObjectGroup){
        this.throw(callerFunc, parameterName+" is not an Array of objects.");
      }
    }
  }
}

Preconditions.prototype.checkIfArrayOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (!Array.isArray(obj)){
      this.throw(callerFunc, parameterName+" is not an Array.");
    }
  }
}

Preconditions.prototype.checkIfTrue = function(callerFunc, errorMsg, obj){
  if (obj){
    this.throw(callerFunc, errorMsg);
  }
}

Preconditions.prototype.checkIfTrueOnlyIfYExists = function(callerFunc, errorMsg, y, obj){
  if (!(typeof y == UNDEFINED) && obj){
    this.throw(callerFunc, errorMsg);
  }
}

Preconditions.prototype.checkIfTrueOnlyIfYAndZExists = function(callerFunc, errorMsg, y, z, obj){
  if (!(typeof y == UNDEFINED) && !(typeof z == UNDEFINED) && obj){
    this.throw(callerFunc, errorMsg);
  }
}

Preconditions.prototype.checkIfDefined = function(callerFunc, parameterName, obj){
  if (typeof obj == UNDEFINED || obj == null){
    this.throw(callerFunc, parameterName+" is not defined.");
  }
}

Preconditions.prototype.checkIfDefinedOnlyIfYTrue = function(callerFunc, errorMsg, y, obj){
  if (y){
    if (typeof obj == UNDEFINED){
      this.throw(callerFunc, errorMsg);
    }
  }
}

Preconditions.prototype.checkIfObjectGroup = function(callerFunc, parameterName, obj){
  if (!obj.isObjectGroup){
    this.throw(callerFunc, parameterName+" is not an object group.");
  }
}

Preconditions.prototype.checkIfParticleSystemPool = function(callerFunc, parameterName, obj){
  if (!obj.isParticleSystemPool){
    this.throw(callerFunc, parameterName+" is not a particle system pool.");
  }
}

Preconditions.prototype.checkIfVectorOnlyIfDefined = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED) && obj !== null){
    if (isNaN(obj.x) || isNaN(obj.y) || isNaN(obj.z)){
      this.throw(callerFunc, "Bad "+parameterName+" parameter. Expected a vector.");
    }
  }
}

Preconditions.prototype.checkIfQuaternionOnlyIfDefined = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED) && obj !== null){
    if (isNaN(obj.x) || isNaN(obj.y) || isNaN(obj.z) || isNaN(obj.w)){
      this.throw(callerFunc, "Bad "+parameterName+" parameter. Expected a quaternion.");
    }
  }
}

Preconditions.prototype.checkIfAxisOnlyIfDefined = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    var axis = obj.toLowerCase();
    if (axis != "x" && axis != "y" && axis != "z"){
      this.throw(callerFunc, parameterName+" must be x, y, or z.");
    }
  }
}

Preconditions.prototype.checkIfTextClickable = function(callerFunc, parameterName, obj){
  if (!obj.isClickable){
    this.throw(callerFunc, parameterName+" is not marked as clickable.");
  }
}

Preconditions.prototype.checkIfAddedText = function(callerFunc, parameterName, obj){
  if(!obj.isAddedText){
    this.throw(callerFunc, parameterName+" is not a text object.");
  }
}

Preconditions.prototype.checkIfAddedObject = function(callerFunc, parameterName, obj){
  if (!obj.isAddedObject){
    this.throw(callerFunc, parameterName+" is not an AddedObject.");
  }
}

Preconditions.prototype.checkIfAddedObjectOrObjectGroup = function(callerFunc, parameterName, obj){
  if (!obj.isAddedObject && !obj.isObjectGroup){
    this.throw(callerFunc, parameterName+" is not an object or an object group.");
  }
}

Preconditions.prototype.checkIfAddedObjectOrObjectGroupOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (!obj.isAddedObject && !obj.isObjectGroup){
      this.throw(callerFunc, parameterName+" is not an object or an object group.");
    }
  }
}

Preconditions.prototype.checkIfAddedObjectObjectGroupParticleSystem = function(callerFunc, parameterName, obj){
  if (!obj.isAddedObject && !obj.isObjectGroup && !obj.isParticleSystem){
    this.throw(callerFunc, parameterName+" must be an object, object group or a particle system.");
  }
}

Preconditions.prototype.checkIfAddedObjectObjectGroupParticleSystemParticle = function(callerFunc, parameterName, obj){
  if (!(obj.isAddedObject) && !(obj.isObjectGroup) && !(obj.isParticle) && !(obj.isParticleSystem)){
    this.throw(callerFunc, parameterName+" must be an object, object group, particle system or particle.");
  }
}

Preconditions.prototype.checkIfAddedObjectObjectGroupAddedText = function(callerFunc, parameterName, obj){
  if (!(obj.isAddedObject) && !(obj.isObjectGroup) && !(obj.isAddedText)){
    this.throw(callerFunc, parameterName+" must be an object, object group or text.");
  }
}

Preconditions.prototype.checkIfFPSWeaponOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (!obj.isFPSWeapon){
      this.throw(callerFunc, parameterName+" is not marked as a FPS weapon.");
    }
  }
}

Preconditions.prototype.checkIfAlreadyUsedAsFPSWeaponOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (obj.isUsedInFPSControl){
      this.throw(callerFunc, "Object already used as weapon in another FPS control.");
    }
  }
}

Preconditions.prototype.checkIfMuzzleFlashActivated = function(callerFunc, obj){
  if (!obj.isActivated){
    this.throw(callerFunc, "FPS control related to this muzzle flash is not active.");
  }
}

Preconditions.prototype.checkIfMuzzleFlashAttached = function(callerFunc, obj){
  if (!obj.attachedToFPSWeapon){
    this.throw(callerFunc, "Muzzleflash is not attached to any FPS weapon.");
  }
}

Preconditions.prototype.checkIfMuzzleFlashExists = function(callerFunc, obj){
  if (!obj){
    this.throw(callerFunc, "No such muzzleflash.");
  }
}

Preconditions.prototype.checkIfMarkedPointExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "No such marked point.");
  }
}

Preconditions.prototype.checkIfParticleSystemPoolExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "No such particle system pool.");
  }
}

Preconditions.prototype.checkIfParticleSystem = function(callerFunc, parameterName, obj){
  if (!obj.isParticleSystem){
    this.throw(callerFunc, parameterName+" is not a particle system.");
  }
}

Preconditions.prototype.checkIfParticleOrParticleSystem = function(callerFunc, parameterName, obj){
  if (!obj.isParticle && !obj.isParticleSystem){
    this.throw(callerFunc, parameterName+" is not a particle system or a particle.");
  }
}

Preconditions.prototype.checkIfNumber = function(callerFunc, parameterName, obj){
  if (isNaN(obj)){
    this.throw(callerFunc, parameterName+" is not a number.");
  }
}

Preconditions.prototype.checkIfString = function(callerFunc, parameterName, obj){
  if(!(typeof obj == "string")){
    this.throw(callerFunc, parameterName+" is not a string.");
  }
}

Preconditions.prototype.checkIfNumberOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED) && isNaN(obj)){
    this.throw(callerFunc, parameterName+" is not a number.");
  }
}


Preconditions.prototype.checkIfPoolDestroyed = function(callerFunc, parameterName, obj){
  if (obj.destroyed){
    this.throw(callerFunc, "Pool is destroyed.");
  }
}

Preconditions.prototype.checkIfEndPointAxis = function(callerFunc, parameterName, obj){
  if (!(obj == "+x" || obj == "-x" || obj == "+y" || obj == "-y" || obj == "+z" || obj == "-z")){
    this.throw(callerFunc, parameterName+" must be one of +x, +y, +z, -x, -y, -z");
  }
}

Preconditions.prototype.checkIfBooleanOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED) && !(typeof obj == "boolean")){
    this.throw(callerFunc, parameterName+" is not a boolean.");
  }
}

Preconditions.prototype.checkIfChildObjectOnlyIfExists = function(callerFunc, parameterName, obj){
  if (obj.isAddedObject && !addedObjects[obj.name]){
    this.throw(callerFunc, parameterName+" is a child object. Cannot use this API for child objects.");
  }
}

Preconditions.prototype.checkIfNoMass = function(callerFunc, parameterName, obj){
  if (obj.noMass){
    this.throw(callerFunc, parameterName+" has no mass.");
  }
}

Preconditions.prototype.checkIfChangeable = function(callerFunc, parameterName, obj){
  if (!obj.isChangeable){
    this.throw(callerFunc, parameterName+" is not marked as changeable.");
  }
}

Preconditions.prototype.checkIfDynamic = function(callerFunc, parameterName, obj){
  if (!obj.isDynamicObject){
    this.throw(callerFunc, parameterName+" is not a dynamic object.");
  }
}

Preconditions.prototype.checkIfNotDynamic = function(callerFunc, parameterName, obj){
  if (obj.isDynamicObject){
    this.throw(callerFunc, parameterName+" is a dynamic object.");
  }
}

Preconditions.prototype.checkIfParentExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "Parent not defined.");
  }
}

Preconditions.prototype.checkIfSphere = function(callerFunc, parameterName, obj){
  if (obj.type != "sphere"){
    this.throw(callerFunc, parameterName+" is not a sphere. Use dummy sphere objects for FPS control bodies.");
  }
}

Preconditions.prototype.checkIfColorizable = function(callerFunc, parameterName, obj){
  if (!obj.isColorizable){
    this.throw(callerFunc, parameterName+" is not marked as colorizable.");
  }
}

Preconditions.prototype.checkIfRotationPivot = function(callerFunc, parameterName, obj){
  if (!obj.isObject3D){
    this.throw(callerFunc, parameterName+" is not a rotation pivot.");
  }
}

Preconditions.prototype.checkIfHavePivotPoint = function(callerFunc, parameterName, obj){
  if (!obj.pivotObject){
    this.throw(callerFunc, parameterName+" does not have a pivot point.");
  }
}

Preconditions.prototype.checkIfMandatoryParameterExists = function(callerFunc, parameterName, obj){
  if ((typeof obj == UNDEFINED) || obj == null){
    this.throw(callerFunc, parameterName+" is a mandatory parameter.");
  }
}

Preconditions.prototype.checkIfLessThanOnlyIfExists = function(callerFunc, parameterName, obj, bound){
  if (!(typeof obj == UNDEFINED) && (obj <= bound)){
    this.throw(callerFunc, parameterName +" must be greater than "+bound);
  }
}

Preconditions.prototype.checkIfLessThan = function(callerFunc, parameterName, obj, bound){
  if (obj <= bound){
    this.throw(callerFunc, parameterName +" must be greater than "+bound);
  }
}

Preconditions.prototype.checkIfLessThanExclusive = function(callerFunc, parameterName, obj, bound){
  if (obj < bound){
    this.throw(callerFunc, parameterName +" must be greater than or equal to "+bound);
  }
}

Preconditions.prototype.checkIfLessThanExclusiveOnlyIfExists = function(callerFunc, parameterName, obj, bound){
  if (!(typeof obj == UNDEFINED) && (obj < bound)){
    this.throw(callerFunc, parameterName +" must be greater than or equal to "+bound);
  }
}

Preconditions.prototype.checkIfInRange = function(callerFunc, parameterName, obj, boundMin, boundMax){
  if (obj < boundMin || obj > boundMax){
    this.throw(callerFunc, parameterName+" must be between ["+boundMin+", "+boundMax+"]");
  }
}

Preconditions.prototype.checkIfInRangeOnlyIfDefined = function(callerFunc, parameterName, obj, boundMin, boundMax){
  if (!(typeof obj == UNDEFINED) && (obj < boundMin || obj > boundMax)){
    this.throw(callerFunc, parameterName+" must be between ["+boundMin+", "+boundMax+"]");
  }
}

Preconditions.prototype.checkIfInRangeMinInclusive = function(callerFunc, parameterName, obj, boundMin, boundMax){
  if (obj <= boundMin || obj > boundMax){
    this.throw(callerFunc, parameterName+" must be between ]"+boundMin+", "+boundMax+"]")
  }
}

Preconditions.prototype.checkIfScriptExists = function(callerFunc, parameterName, obj){
  if (!obj){
    this.throw(callerFunc, "No such script.");
  }
}

Preconditions.prototype.checkIfXExistsOnlyIfYExists = function(callerFunc, xName, yName, x, y){
  if (!(typeof y == UNDEFINED)){
    if (typeof x == UNDEFINED){
      this.throw(callerFunc, xName+" must be defined if "+yName+" is defined.");
    }
  }
}

Preconditions.prototype.checkIfMotionModeOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (!(obj == MOTION_MODE_NORMAL || obj == MOTION_MODE_CIRCULAR)){
      this.throw(callerFunc, parameterName+" must be MOTION_MODE_NORMAL or MOTION_MODE_CIRCULAR.");
    }
  }
}

Preconditions.prototype.checkIfXExistsOnlyIfYIsZ = function(callerFunc, xName, yName, zName, x, y, z){
  if (y == z && (typeof x == UNDEFINED)){
    this.throw(callerFunc, xName+" must be defined if "+yName+" is "+zName);
  }
}

Preconditions.prototype.checkIfParticleMaterial = function(callerFunc, parameterName, obj){
  if (!(obj.isParticleMaterial)){
    this.throw(callerFunc, parameterName+" is not a particle material.");
  }
}

Preconditions.prototype.checkIfAlphaVariationModeOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!typeof obj == UNDEFINED){
    if (isNaN(obj) || (obj != ALPHA_VARIATION_MODE_NORMAL && obj != ALPHA_VARIATION_MODE_SIN && obj != ALPHA_VARIATION_MODE_COS)){
      this.throw(callerFunc, parameterName+" must be one of ALPHA_VARIATION_MODE_NORMAL, ALPHA_VARIATION_MODE_SIN or ALPHA_VARIATION_MODE_COS.");
    }
  }
}

Preconditions.prototype.checkIfEmptyArray = function(callerFunc, parameterName, obj){
  if (obj.length == 0){
    this.throw(callerFunc, parameterName+" is an empty array.");
  }
}

Preconditions.prototype.checkIfBlending = function(callerFunc, parameterName, blendingMode){
  if (blendingMode != NO_BLENDING && blendingMode != NORMAL_BLENDING && blendingMode != ADDITIVE_BLENDING && blendingMode != SUBTRACTIVE_BLENDING && blendingMode != MULTIPLY_BLENDING){
    this.throw(callerFunc, parameterName+" must be one of NO_BLENDING, NORMAL_BLENDING, ADDITIVE_BLENDING, SUBTRACTIVE_BLENDING or MULTIPLY_BLENDING.");
  }
}

Preconditions.prototype.checkIfFunctionOnlyIfExists = function(callerFunc, parameterName, obj){
  if (!(typeof obj == UNDEFINED)){
    if (!(obj instanceof Function)){
      this.throw(callerFunc, parameterName+" is not a function.");
    }
  }
}

Preconditions.prototype.checkIfText2D = function(callerFunc, parameterName, obj){
  if (obj.is2D){
    this.throw(callerFunc, "Cannot use this API for 2D texts.");
  }
}
