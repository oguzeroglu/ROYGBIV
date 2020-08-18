var ObjectGroup = function(name, group){
  this.isObjectGroup = true;
  if (IS_WORKER_CONTEXT){
    return this;
  }

  this.name = name;
  this.group = group;

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.gridSystemNames = [];

  this.childObjectsByName = new Object();

  this.prevPositionVector = new THREE.Vector3();

  this.totalVertexCount = 0;
  this.skippedVertexCount = 0;

  this.isTransparent = false;
  for (var objName in this.group){
    var obj = this.group[objName];
    var isObjTransparent = (obj.mesh.material.uniforms.alpha.value < 1);
    if (isObjTransparent){
      this.isTransparent = true;
      break;
    }
  }
  this.isIntersectable = true;
  this.lastUpdatePosition = new THREE.Vector3();
  this.lastUpdateQuaternion = new THREE.Quaternion();

  this.animations = new Object();

  this.matrixCache = new THREE.Matrix4();

  this.rotationMode = rotationModes.WORLD;
}

ObjectGroup.prototype.setRotationMode = function(rotationMode){
  this.rotationMode = rotationMode;
}

ObjectGroup.prototype.makeSteerable = function(mode, maxSpeed, maxAcceleration, jumpSpeed, lookSpeed){
  this.steerableInfo = {
    mode: mode,
    maxSpeed: maxSpeed,
    maxAcceleration: maxAcceleration,
    jumpSpeed: jumpSpeed,
    lookSpeed: lookSpeed,
    behaviorsByID: {}
  };
  this.steerable = steeringHandler.createSteerableFromObject(this);
}

ObjectGroup.prototype.unmakeSteerable = function(){
  delete this.steerableInfo;
  delete this.steerable;
  steeringHandler.removeSteerable(this);
}

ObjectGroup.prototype.addSteeringBehavior = function(id, behavior){
  this.steerableInfo.behaviorsByID[id] = behavior;
}

ObjectGroup.prototype.unUseAsAIEntity = function(){
  steeringHandler.unUseObjectGroupAsAIEntity(this);
  this.usedAsAIEntity = false;
  for (var childName in this.group){
    this.group[childName].usedAsAIEntity = false;
  }
}

ObjectGroup.prototype.useAsAIEntity = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  var res = steeringHandler.useObjectGroupAsAIEntity(this);
  this.usedAsAIEntity = res;
  for (var childName in this.group){
    this.group[childName].usedAsAIEntity = res;
  }
  return res;
}

ObjectGroup.prototype.refreshTextureRange = function(context){
  var childLen = Object.keys(this.group).length;

  if (this[context.checker]()){
    if (this.mesh.geometry.attributes[context.attrName]){
      var i = 0;
      var ary = this.mesh.geometry.attributes[context.attrName].array;

      if (this.isInstanced){
        for (var childName in this.group){
          var i2 = 0;
          var newRange = 0;
          if (this.group[childName][context.checker]()){
            newRange = textureAtlasHandler.getRangesForTexturePack(this.group[childName].tpInfo[context.tpInfoName].texturePack, context.tpInfoName);
          }

          while (i2 < ary.length / childLen){
            ary[i] = newRange? newRange.startU: 0;
            ary[i + 1] = newRange? newRange.startV: 0;
            ary[i + 2] = newRange? newRange.endU: 0;
            ary[i + 3] = newRange? newRange.endV: 0;
            i2 += 4;
            i += 4;
          }
        }
      }else{
        for (var i = 0; i < ary.length; i += 4){
          var obj = this.uvRangeMap[i];
          var newRange = 0;
          if (obj[context.checker]()){
            newRange = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo[context.tpInfoName].texturePack, context.tpInfoName);
          }
          ary[i] = newRange? newRange.startU: 0;
          ary[i + 1] = newRange? newRange.startV: 0;
          ary[i + 2] = newRange? newRange.endU: 0;
          ary[i + 3] = newRange? newRange.endV: 0;
        }
      }

      this.mesh.geometry.attributes[context.attrName].updateRange.set(0, ary.length);
      this.mesh.geometry.attributes[context.attrName].needsUpdate = true;
    }else{
      for (var childName in this.group){
        var newRange = textureAtlasHandler.getRangesForTexturePack(this.group[childName].tpInfo[context.tpInfoName].texturePack, context.tpInfoName);
        macroHandler.replaceCompressedVec4(this.mesh.material, context.attrName, newRange.startU, newRange.startV, newRange.endU, newRange.endV);
        break;
      }
    }
  }
}

ObjectGroup.prototype.onTextureAtlasRefreshed = function(){
  if (!this.hasTexture){
    return;
  }

  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();

  this.refreshTextureRange({checker: "hasDiffuseMap", attrName: "diffuseUV", tpInfoName: "diffuse"});
  this.refreshTextureRange({checker: "hasEmissiveMap", attrName: "emissiveUV", tpInfoName: "emissive"});
  this.refreshTextureRange({checker: "hasAOMap", attrName: "aoUV", tpInfoName: "ao"});
  this.refreshTextureRange({checker: "hasAlphaMap", attrName: "alphaUV", tpInfoName: "alpha"});
  this.refreshTextureRange({checker: "hasDisplacementMap", attrName: "displacementUV", tpInfoName: "height"});
}

ObjectGroup.prototype.updateWorldInverseTranspose = function(){
  var val = this.mesh.material.uniforms.worldInverseTranspose.value;
  val.getInverse(this.mesh.matrixWorld).transpose();
  this.matrixCache.copy(this.mesh.matrixWorld);
}

ObjectGroup.prototype.onBeforeRender = function(){
  if (!this.affectedByLight){
    return;
  }
  if (!this.matrixCache.equals(this.mesh.matrixWorld)){
    this.updateWorldInverseTranspose();
  }
}

ObjectGroup.prototype.setAffectedByLight = function(isAffectedByLight){

  macroHandler.removeMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

  delete this.mesh.material.uniforms.worldInverseTranspose;
  delete this.mesh.material.uniforms.dynamicLightsMatrix;
  delete this.mesh.material.uniforms.worldMatrix;

  if (isAffectedByLight){
    macroHandler.injectMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

    this.mesh.material.uniforms.worldInverseTranspose = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
    this.mesh.material.uniforms.dynamicLightsMatrix = lightHandler.getUniform();
    this.updateWorldInverseTranspose();

    lightHandler.addLightToObject(this);
  }else{
    lightHandler.removeLightFromObject(this);
  }

  this.mesh.material.needsUpdate = true;

  this.affectedByLight = isAffectedByLight;
}

ObjectGroup.prototype.onAfterRotationAnimation = function(){
  if (!(mode == 1 && this.isChangeable)){
    return;
  }
  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  }else{
    this.updateSimplifiedPhysicsBody();
  }
  if (!this.pivotObject && !this.isPhysicsSimplified){
    physicsWorld.updateObject(this, false, true);
  }else{
    physicsWorld.updateObject(this, true, true);
  }
  rayCaster.updateObject(this);
  steeringHandler.updateObject(this);
}

ObjectGroup.prototype.isAnimationSuitable = function(animation){
  var action = animation.description.action;

  if (action == animationHandler.actionTypes.OBJECT.EMISSIVE_INTENSITY){
    return this.hasEmissiveMap();
  }
  if (action == animationHandler.actionTypes.OBJECT.DISPLACEMENT_SCALE){
    return this.hasDisplacementMap();
  }
  if (action == animationHandler.actionTypes.OBJECT.DISPLACEMENT_BIAS){
    return this.hasDisplacementMap();
  }
  if (action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR){
    return this.hasEmissiveMap();
  }
  if (action == animationHandler.actionTypes.OBJECT.TEXTURE_OFFSET_X){
    return this.hasTexture();
  }
  if (action == animationHandler.actionTypes.OBJECT.TEXTURE_OFFSET_Y){
    return this.hasTexture();
  }
  if (action == animationHandler.actionTypes.OBJECT.AO_INTENSITY){
    return this.hasAOMap();
  }
  return true;
}

ObjectGroup.prototype.copyAnimationsFromObject = function(object){
  this.animations = new Object();

  for (var animName in object.animations){
    if (this.isAnimationSuitable(object.animations[animName])){
      this.addAnimation(object.animations[animName].copyWithAnotherObject(this));
    }
  }
}

ObjectGroup.prototype.addAnimation = function(animation){
  this.animations[animation.name] = animation;
}

ObjectGroup.prototype.removeAnimation = function(animation){
  delete this.animations[animation.name];
}

ObjectGroup.prototype.getAOIntensity = function(){
  return this.mesh.material.uniforms.totalAOIntensity.value;
}

ObjectGroup.prototype.setAOIntensity = function(val){
  this.mesh.material.uniforms.totalAOIntensity.value = val;
  for (var objName in this.group){
    if (!(typeof this.group[objName].aoIntensityWhenAttached == UNDEFINED)){
      this.group[objName].setAOIntensity(this.group[objName].aoIntensityWhenAttached * val);
    }
  }
}

ObjectGroup.prototype.getEmissiveColor = function(){
  REUSABLE_COLOR.copy(this.mesh.material.uniforms.totalEmissiveColor.value);
  return REUSABLE_COLOR;
}

ObjectGroup.prototype.setEmissiveColor = function(val){
  this.mesh.material.uniforms.totalEmissiveColor.value.copy(val);
  for (var objName in this.group){
    if (!(typeof this.group[objName].emissiveColorWhenAttached == UNDEFINED)){
      REUSABLE_COLOR.copy(this.group[objName].emissiveColorWhenAttached);
      REUSABLE_COLOR.multiply(this.mesh.material.uniforms.totalEmissiveColor.value);
      this.group[objName].setEmissiveColor(REUSABLE_COLOR);
    }
  }
}

ObjectGroup.prototype.getDisplacementBias = function(){
  return this.mesh.material.uniforms.totalDisplacementInfo.value.y;
}

ObjectGroup.prototype.setDisplacementBias = function(val){
  this.mesh.material.uniforms.totalDisplacementInfo.value.y = val;
  for (var objName in this.group){
    if (!typeof this.group[objName].displacementBiasWhenAttached == UNDEFINED){
      this.group[objName].mesh.material.uniforms.displacementInfo.value.y = this.group[objName].displacementBiasWhenAttached * val;
    }
  }
}

ObjectGroup.prototype.getDisplacementScale = function(){
  return this.mesh.material.uniforms.totalDisplacementInfo.value.x;
}

ObjectGroup.prototype.setDisplacementScale = function(val){
  this.mesh.material.uniforms.totalDisplacementInfo.value.x = val;
  for (var objName in this.group){
    if (!(typeof this.group[objName].displacementScaleWhenAttached == UNDEFINED)){
      this.group[objName].mesh.material.uniforms.displacementInfo.value.x = this.group[objName].displacementScaleWhenAttached * val;
    }
  }
}

ObjectGroup.prototype.getTextureOffsetY = function(){
  return this.mesh.material.uniforms.totalTextureOffset.value.y;
}

ObjectGroup.prototype.setTextureOffsetY = function(val){
  this.mesh.material.uniforms.totalTextureOffset.value.y = val;
  for (var objName in this.group){
    if (!(typeof this.group[objName].textureOffsetYWhenAttached == UNDEFINED)){
      this.group[objName].setTextureOffsetY(this.group[objName].textureOffsetYWhenAttached + val);
    }
  }
}

ObjectGroup.prototype.getTextureOffsetX = function(){
  return this.mesh.material.uniforms.totalTextureOffset.value.x;
}

ObjectGroup.prototype.setTextureOffsetX = function(val){
  this.mesh.material.uniforms.totalTextureOffset.value.x = val;
  for (var objName in this.group){
    if (!(typeof this.group[objName].textureOffsetXWhenAttached == UNDEFINED)){
      this.group[objName].setTextureOffsetX(this.group[objName].textureOffsetXWhenAttached + val);
    }
  }
}

ObjectGroup.prototype.getEmissiveIntensity = function(){
  return this.mesh.material.uniforms.totalEmissiveIntensity.value;
}

ObjectGroup.prototype.setEmissiveIntensity = function(val){
  this.mesh.material.uniforms.totalEmissiveIntensity.value = val;
  for (var objName in this.group){
    if (!(typeof this.group[objName].emissiveIntensityWhenAttached == UNDEFINED)){
      this.group[objName].setEmissiveIntensity(this.group[objName].emissiveIntensityWhenAttached * val);
    }
  }
}

ObjectGroup.prototype.useDefaultPrecision = function(){
  shaderPrecisionHandler.setDefaultPrecisionForObject(this);
  this.hasCustomPrecision = false;
  delete this.customPrecision;
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (obj.softCopyParentName && obj.softCopyParentName == this.name){
      obj.useDefaultPrecision();
    }
  }
}

ObjectGroup.prototype.useCustomShaderPrecision = function(precision){
  shaderPrecisionHandler.setCustomPrecisionForObject(this, precision);
  this.hasCustomPrecision = true;
  this.customPrecision = precision;
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (obj.softCopyParentName && obj.softCopyParentName == this.name){
      obj.useCustomShaderPrecision(precision);
    }
  }
}

ObjectGroup.prototype.removeCollisionListener = function(){
  this.physicsBody.removeEventListener("collide", this.boundCallbackFunction);
  collisionCallbackRequests.delete(this.name);
  physicsWorld.removeCollisionListener(this);
}

ObjectGroup.prototype.setCollisionListener = function(callbackFunction){
  this.physicsBody.addEventListener("collide", this.boundCallbackFunction);
  collisionCallbackRequests.set(this.name, callbackFunction.bind(this));
  physicsWorld.setCollisionListener(this);
}

ObjectGroup.prototype.setPositionThresholdExceededListener = function(axis, threshold, controlMode, callbackFunction){
  if (!this.positionThresholdExceededListenerInfo){
    this.positionThresholdExceededListenerInfo = new Object();
  }
  this.positionThresholdExceededListenerInfo.axis = axis;
  this.positionThresholdExceededListenerInfo.isActive = true;
  this.positionThresholdExceededListenerInfo.threshold = threshold;
  this.positionThresholdExceededListenerInfo.controlMode = controlMode;
  this.positionThresholdExceededListenerInfo.callbackFunction = callbackFunction.bind(this);
}

ObjectGroup.prototype.onFPSWeaponAlignmentUpdate = function(){
  camera.updateMatrix();
  camera.updateMatrixWorld();
  REUSABLE_VECTOR.set(this.fpsWeaponAlignment.x, this.fpsWeaponAlignment.y, this.fpsWeaponAlignment.z);
  REUSABLE_VECTOR.unproject(camera);
  this.mesh.position.copy(REUSABLE_VECTOR);
  this.mesh.quaternion.set(this.fpsWeaponAlignment.qx, this.fpsWeaponAlignment.qy, this.fpsWeaponAlignment.qz, this.fpsWeaponAlignment.qw);
  this.mesh.scale.set(this.fpsWeaponAlignment.scale, this.fpsWeaponAlignment.scale, this.fpsWeaponAlignment.scale);
}

ObjectGroup.prototype.revertPositionAfterFPSWeaponConfigurations = function(){
  this.mesh.position.copy(this.positionWhenUsedAsFPSWeapon);
  this.mesh.quaternion.copy(this.quaternionBeforeFPSWeaponConfigurationPanelOpened);
  this.mesh.scale.set(1, 1, 1);
  delete this.quaternionBeforeFPSWeaponConfigurationPanelOpened;
}

ObjectGroup.prototype.setChangeableStatus = function(val){
  this.isChangeable = val;
}

ObjectGroup.prototype.setIntersectableStatus = function(val){
  this.isIntersectable = val;
}

ObjectGroup.prototype.setNoMass = function(val){
  if (!val){
    physicsWorld.addBody(this.physicsBody);
  }else{
    physicsWorld.remove(this.physicsBody);
  }
  this.noMass = val;
}

ObjectGroup.prototype.resetFPSWeaponProperties = function(){
  this.setNoMass(false);
  this.setIntersectableStatus(true);
  this.setChangeableStatus(false);
  this.isFPSWeapon = false;
  this.mesh.position.copy(this.positionWhenUsedAsFPSWeapon);
  this.mesh.quaternion.copy(this.quaternionWhenUsedAsFPSWeapon);
  this.physicsBody.position.copy(this.physicsPositionWhenUsedAsFPSWeapon);
  this.physicsBody.quaternion.copy(this.physicsQuaternionWhenUsedAsFPSWeapon);
  delete this.positionWhenUsedAsFPSWeapon;
  delete this.quaternionWhenUsedAsFPSWeapon;
  delete this.physicsPositionWhenUsedAsFPSWeapon;
  delete this.physicsQuaternionWhenUsedAsFPSWeapon;
}

ObjectGroup.prototype.useAsFPSWeapon = function(){
  this.setNoMass(true);
  this.setIntersectableStatus(false);
  this.setChangeableStatus(true);
  this.isFPSWeapon = true;
  this.positionWhenUsedAsFPSWeapon = this.mesh.position.clone();
  this.quaternionWhenUsedAsFPSWeapon = this.mesh.quaternion.clone();
  this.physicsPositionWhenUsedAsFPSWeapon = new THREE.Vector3().copy(this.physicsBody.position);
  this.physicsQuaternionWhenUsedAsFPSWeapon = new THREE.Quaternion().copy(this.physicsBody.quaternion);
  this.fpsWeaponAlignment = {x: 0, y: 0, z: 0, scale: 1, qx: 0, qy: 0, qz: 0, qw: 1};
}

ObjectGroup.prototype.handleRotation = function(axis, radians){
  if (this.pivotObject){
    this.prevPositionVector.copy(this.mesh.position);
    this.rotateAroundPivotObject(axis, radians);
    physicsWorld.updateObject(this, true, true);
    if (this.autoInstancedParent){
      this.autoInstancedParent.updateObject(this);
    }
    this.onPositionChange(this.prevPositionVector, this.mesh.position);
    return;
  }
  this.rotate(axis, radians, true);
  physicsWorld.updateObject(this, false, true);
  if (this.autoInstancedParent){
    this.autoInstancedParent.updateObject(this);
  }
}

ObjectGroup.prototype.untrackObjectPosition = function(){
  delete this.trackedObject;
  sceneHandler.onTrackingObjectDeletion(this);
}

ObjectGroup.prototype.trackObjectPosition = function(targetObject){
  this.trackedObject = targetObject;
  targetObject.isTracked = true;
  targetObject.oldPX = targetObject.physicsBody.position.x;
  targetObject.oldPY = targetObject.physicsBody.position.y;
  targetObject.oldPZ = targetObject.physicsBody.position.z;
  sceneHandler.onTrackingObjectAddition(this);
}

ObjectGroup.prototype.setPosition = function(x, y, z, skipBBUpdate){
  this.prevPositionVector.copy(this.mesh.position);
  this.mesh.position.set(x, y, z);
  this.graphicsGroup.position.set(x, y, z);
  if (!this.isPhysicsSimplified){
    this.physicsBody.position.set(x, y, z);
  }else {
    this.updateSimplifiedPhysicsBody();
  }
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
  physicsWorld.updateObject(this, true, false);
  this.onPositionChange(this.prevPositionVector, this.mesh.position);
  if (mode == 0){
    if (!skipBBUpdate){
      this.mesh.updateMatrixWorld(true);
      this.updateBoundingBoxes();
    }
    this.manualPositionInfo = {
      x: x, y: y, z: z
    };
  }
}

ObjectGroup.prototype.setVelocity = function(velocityVector){
  this.physicsBody.velocity.set(velocityVector.x, velocityVector.y, velocityVector.z);
  physicsWorld.setObjectVelocity(this, velocityVector);
}

ObjectGroup.prototype.setVelocityX = function(velocityX){
  this.physicsBody.velocity.x = velocityX;
  physicsWorld.setObjectVelocityX(this, velocityX);
}

ObjectGroup.prototype.setVelocityY = function(velocityY){
  this.physicsBody.velocity.y = velocityY;
  physicsWorld.setObjectVelocityY(this, velocityY);
}

ObjectGroup.prototype.setVelocityZ = function(velocityZ){
  this.physicsBody.velocity.z = velocityZ;
  physicsWorld.setObjectVelocityZ(this, velocityZ);
}

ObjectGroup.prototype.resetVelocity = function(){
  this.physicsBody.velocity.set(0, 0, 0);
  this.physicsBody.angularVelocity.set(0, 0, 0);
  physicsWorld.resetObjectVelocity(this);
}

ObjectGroup.prototype.show = function(){
  if (!this.isVisibleOnThePreviewScene()){
    this.mesh.visible = true;
    if (!this.physicsKeptWhenHidden){
      if (!this.noMass){
        setTimeout(function(){
          physicsWorld.addBody(this.physicsBody);
        });
        physicsWorld.show(this);
        if (physicsDebugMode){
          debugRenderer.show(this);
        }
      }
    }
    this.isHidden = false;
    rayCaster.show(this);
    steeringHandler.show(this);
  }
}

ObjectGroup.prototype.hideVisually = function(){
  this.mesh.visible = false;
  this.isHidden = true;
}

ObjectGroup.prototype.showVisually = function(){
  this.mesh.visible = true;
  this.isHidden = false;
}

ObjectGroup.prototype.hide = function(keepPhysics){
  if (this.isVisibleOnThePreviewScene()){
    this.mesh.visible = false;
    if (!keepPhysics){
      if (!this.noMass){
        var that = this;
        setTimeout(function(){
          physicsWorld.remove(that.physicsBody);
          that.physicsKeptWhenHidden = false;
        });
        physicsWorld.hide(this);
        if (physicsDebugMode){
          debugRenderer.hide(this);
        }
      }
    }else{
      this.physicsKeptWhenHidden = true;
    }
    this.isHidden = true;
    rayCaster.hide(this);
    steeringHandler.hide(this);
  }
}

ObjectGroup.prototype.onPositionChange = function(from, to){
  if (mode == 0 || this.isHidden){
    return;
  }
  if (this.positionThresholdExceededListenerInfo && this.positionThresholdExceededListenerInfo.isActive){
    var axis = this.positionThresholdExceededListenerInfo.axis;
    var oldPos = from[axis];
    var newPos = to[axis];
    var threshold = this.positionThresholdExceededListenerInfo.threshold;
    if (this.positionThresholdExceededListenerInfo.controlMode == 1){
      if (oldPos <= threshold && newPos > threshold){
        this.positionThresholdExceededListenerInfo.callbackFunction();
      }
    }else{
      if (oldPos >= threshold && newPos < threshold){
        this.positionThresholdExceededListenerInfo.callbackFunction();
      }
    }
  }

  if (this.positionChangeCallbackFunction){
    this.positionChangeCallbackFunction(to.x, to.y, to.z);
  }

  steeringHandler.updateObject(this);
}

ObjectGroup.prototype.forceColor = function(r, g, b, a){
  if (!this.isColorizable){
    return;
  }
  if (a < 0){
    a = 0;
  }
  if (a > 1){
    a = 1;
  }
  this.mesh.material.uniforms.forcedColor.value.set(a, r, g, b);
  if (a < 1){
    this.mesh.material.transparent = true;
  }
}

ObjectGroup.prototype.resetColor = function(){
  if (!this.isColorizable){
    return;
  }
  this.mesh.material.uniforms.forcedColor.value.set(-50, 0, 0, 0);
  this.mesh.material.transparent = this.isTransparent;
}

ObjectGroup.prototype.applyAreaConfiguration = function(areaName){
  if (sceneHandler.getActiveSceneName() != this.registeredSceneName){
    return;
  }
  if (this.isChangeable || this.isDynamicObject){
    return;
  }
  if (this.areaVisibilityConfigurations){
    var configurations = this.areaVisibilityConfigurations[areaName];
    if (!(typeof configurations == UNDEFINED)){
      this.mesh.visible = configurations;
    }else{
      this.mesh.visible = true;
    }
  }
  if (this.areaSideConfigurations){
    var configurations = this.areaSideConfigurations[areaName];
    if (!(typeof configurations == UNDEFINED)){
      if (configurations == SIDE_BOTH){
        this.mesh.material.side = THREE.DoubleSide;
      }else if (configurations == SIDE_FRONT){
        this.mesh.material.side = THREE.FrontSide;
      }else if (configurations == SIDE_BACK){
        this.mesh.material.side = THREE.BackSide;
      }
    }else{
      if (this.defaultSide){
        if (this.defaultSide == SIDE_BOTH){
          this.mesh.material.side = THREE.DoubleSide;
        }else if (this.defaultSide == SIDE_FRONT){
          this.mesh.material.side = THREE.FrontSide;
        }else if (this.defaultSide == SIDE_BACK){
          this.mesh.material.side = THREE.BackSide;
        }
      }else{
        this.mesh.material.side = THREE.DoubleSide;
      }
    }
  }
}

ObjectGroup.prototype.getSideInArea = function(areaName){
  if (this.areaSideConfigurations){
    if (!(typeof this.areaSideConfigurations[areaName] == UNDEFINED)){
      return this.areaSideConfigurations[areaName];
    }
  }
  if (this.defaultSide){
    return this.defaultSide;
  }
  return SIDE_BOTH;
}

ObjectGroup.prototype.setSideInArea = function(areaName, side){
  if (!this.areaSideConfigurations){
    this.areaSideConfigurations = new Object();
  }
  this.areaSideConfigurations[areaName] = side;
}

ObjectGroup.prototype.getVisibilityInArea = function(areaName){
  if (this.areaVisibilityConfigurations){
    if (!(typeof this.areaVisibilityConfigurations[areaName] == UNDEFINED)){
      return this.areaVisibilityConfigurations[areaName];
    }
  }
  return true;
}

ObjectGroup.prototype.setVisibilityInArea = function(areaName, isVisible){
  if (!this.areaVisibilityConfigurations){
    this.areaVisibilityConfigurations = new Object();
  }
  this.areaVisibilityConfigurations[areaName] = isVisible;
}

ObjectGroup.prototype.loadState = function(){
  this.physicsBody.position.set(
    this.state.physicsPX, this.state.physicsPY, this.state.physicsPZ
  );
  this.physicsBody.quaternion.set(
    this.state.physicsQX, this.state.physicsQY, this.state.physicsQZ, this.state.physicsQW
  );
  this.physicsBody.angularVelocity.set(
    this.state.physicsAVX, this.state.physicsAVY, this.state.physicsAVZ
  );
  this.physicsBody.velocity.set(
    this.state.physicsVX, this.state.physicsVY, this.state.physicsVZ
  );
  this.mesh.position.set(
    this.state.positionX, this.state.positionY, this.state.positionZ
  );
  this.mesh.quaternion.set(
    this.state.quaternionX, this.state.quaternionY, this.state.quaternionZ, this.state.quaternionW
  );
  if (this.pivotObject){
    delete this.pivotObject;
    delete this.pivotOffsetX;
    delete this.pivotOffsetY;
    delete this.pivotOffsetZ;
  }
  if (this.originalPivotObject){
    this.pivotObject = this.originalPivotObject;
    this.pivotOffsetX = this.originalPivotOffsetX;
    this.pivotOffsetY = this.originalPivotOffsetY;
    this.pivotOffsetZ = this.originalPivotOffsetZ;
  }

  this.setRotationMode(this.state.rotationMode);
}

ObjectGroup.prototype.saveState = function(){
  this.state = new Object();
  this.state.physicsPX = this.physicsBody.position.x;
  this.state.physicsPY = this.physicsBody.position.y;
  this.state.physicsPZ = this.physicsBody.position.z;
  this.state.physicsQX = this.physicsBody.quaternion.x;
  this.state.physicsQY = this.physicsBody.quaternion.y;
  this.state.physicsQZ = this.physicsBody.quaternion.z;
  this.state.physicsQW = this.physicsBody.quaternion.w;
  this.state.physicsAVX = this.physicsBody.angularVelocity.x;
  this.state.physicsAVY = this.physicsBody.angularVelocity.y;
  this.state.physicsAVZ = this.physicsBody.angularVelocity.z;
  this.state.physicsVX = this.physicsBody.velocity.x;
  this.state.physicsVY = this.physicsBody.velocity.y;
  this.state.physicsVZ = this.physicsBody.velocity.z;
  this.state.positionX = this.mesh.position.x;
  this.state.positionY = this.mesh.position.y;
  this.state.positionZ = this.mesh.position.z;
  this.state.quaternionX = this.mesh.quaternion.x;
  this.state.quaternionY = this.mesh.quaternion.y;
  this.state.quaternionZ = this.mesh.quaternion.z;
  this.state.quaternionW = this.mesh.quaternion.w;
  if (this.pivotObject){
    this.originalPivotObject = this.pivotObject;
    this.originalPivotOffsetX = this.pivotOffsetX;
    this.originalPivotOffsetY = this.pivotOffsetY;
    this.originalPivotOffsetZ = this.pivotOffsetZ;
  }
  this.state.rotationMode = this.rotationMode;
}

ObjectGroup.prototype.areGeometriesIdentical = function(){
  var uuid = 0;
  for (var objName in this.group){
    var obj = this.group[objName];
    if (!uuid){
      uuid = this.group[objName].mesh.geometry.uuid;
    }else{
      if (uuid != this.group[objName].mesh.geometry.uuid){
        return false;
      }
    }
  }
  return true;
}

ObjectGroup.prototype.handleRenderSide = function(val){
  this.renderSide = val;
  if (val == 0){
    this.mesh.material.side = THREE.DoubleSide;
    this.defaultSide = SIDE_BOTH;
  }else if (val == 1){
    this.mesh.material.side = THREE.FrontSide;
    this.defaultSide = SIDE_FRONT;
  }else if (val == 2){
    this.mesh.material.side = THREE.BackSide;
    this.defaultSide = SIDE_BACK;
  }
}

ObjectGroup.prototype.textureCompare = function(txt1, txt2){
  if (txt1.roygbivTexturePackName != txt2.roygbivTexturePackName){
    return false;
  }
  if (txt1.offset.x != txt2.offset.x || txt1.offset.y != txt2.offset.y){
    return false;
  }
  if (txt1.repeat.x != txt2.repeat.x || txt1.repeat.y != txt2.repeat.y){
    return false;
  }
  if (txt1.flipX != txt2.flipX || txt1.flipY != txt2.flipY){
    return false;
  }
  if (txt1.wrapS != txt2.wrapS || txt1.wrapT != txt2.wrapT){
    return false;
  }
  return true;
}

ObjectGroup.prototype.hasDiffuseMap = function(){
  return this.hasDiffuse;
}

ObjectGroup.prototype.hasEmissiveMap = function(){
  return this.hasEmissive;
}

ObjectGroup.prototype.hasAlphaMap = function(){
  return this.hasAlpha;
}

ObjectGroup.prototype.hasAOMap = function(){
  return this.hasAO;
}

ObjectGroup.prototype.hasDisplacementMap = function(){
  return this.hasDisplacement;
}

ObjectGroup.prototype.handleTextures = function(){
  this.hasDiffuse = 0;
  this.hasEmissive = 0;
  this.hasAlpha = 0;
  this.hasAO = 0;
  this.hasDisplacement = 0;
  var totalTextureCount = 0;
  for (var objName in this.group){
    var obj = this.group[objName];
    if (obj.hasDiffuseMap()){
      this.hasDiffuse = true;
    }
    if (obj.hasEmissiveMap()){
      this.hasEmissive = true;
    }
    if (obj.hasAlphaMap()){
      this.hasAlpha = true;
    }
    if (obj.hasAOMap()){
      this.hasAO = true;
    }
    if (obj.hasDisplacementMap() && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
      this.hasDisplacement = true;
    }
  }
  this.hasTexture = this.hasDiffuse || this.hasEmissive || this.hasAlpha || this.hasAO || this.hasDisplacement;
}

ObjectGroup.prototype.push = function(array, value, index, isIndexed){
  if (!isIndexed){
    array.push(value);
  }else{
    array[index] = value;
  }
}

ObjectGroup.prototype.isAttributeRepeating = function(attribute){
  var itemSize = attribute.itemSize;
  var firstItem;
  if (itemSize == 1){
    firstItem = attribute.array[0];
  }
  if (itemSize == 2){
    firstItem = new THREE.Vector2(attribute.array[0], attribute.array[1]);
  }
  if (itemSize == 3){
    firstItem = new THREE.Vector3(attribute.array[0], attribute.array[1], attribute.array[2]);
  }
  if (itemSize == 4){
    firstItem = new THREE.Vector4(attribute.array[0], attribute.array[1], attribute.array[2], attribute.array[3]);
  }

  for (var i = itemSize; i < attribute.array.length; i += itemSize){
    if (itemSize == 1){
      if (attribute.array[i] != firstItem){
        return false;
      }
    }
    if (itemSize == 2){
      if (attribute.array[i] != firstItem.x || attribute.array[i + 1] != firstItem.y){
        return false;
      }
    }
    if (itemSize == 3){
      if (attribute.array[i] != firstItem.x || attribute.array[i + 1] != firstItem.y || attribute.array[i + 2] != firstItem.z){
        return false;
      }
    }
    if (itemSize == 4){
      if (attribute.array[i] != firstItem.x || attribute.array[i + 1] != firstItem.y || attribute.array[i + 2] != firstItem.z || attribute.array[i + 3] != firstItem.w){
        return false;
      }
    }
  }

  return true;
}

ObjectGroup.prototype.compressGeometry = function(){
  var compressableAttributes = [
    "quaternion", "alpha", "textureInfo", "textureMatrixInfo",
    "diffuseUV", "emissiveIntensity", "emissiveColor", "emissiveUV",
    "aoIntensity", "aoUV", "displacementInfo", "displacementUV", "alphaUV",
    "affectedByLight", "textureMirrorInfo", "displacementTextureMatrixInfo"
  ];

  macroHandler.compressAttributes(this.mesh, compressableAttributes);
}

ObjectGroup.prototype.mergeInstanced = function(){
  this.isInstanced = true;
  var refGeometry;
  for (var objName in this.group){
    refGeometry = this.group[objName].mesh.geometry;
    break;
  }
  this.geometry = new THREE.InstancedBufferGeometry();

  this.geometry.setIndex(refGeometry.index);

  var positionOffsets = [], quaternions = [], alphas = [], colors = [], textureInfos = [],
      emissiveIntensities = [], emissiveColors = [], aoIntensities = [], displacementInfos = [],
      textureMatrixInfos = [], displacementTextureMatrixInfos = [];

  var diffuseUVs = [], emissiveUVs = [], alphaUVs = [], aoUVs = [], displacementUVs = [];

  var textureMirrorInfos = [];

  var count = 0;

  for (var objName in this.group){
    var obj = this.group[objName];
    positionOffsets.push(obj.mesh.position.x);
    positionOffsets.push(obj.mesh.position.y);
    positionOffsets.push(obj.mesh.position.z);
    quaternions.push(obj.mesh.quaternion.x);
    quaternions.push(obj.mesh.quaternion.y);
    quaternions.push(obj.mesh.quaternion.z);
    quaternions.push(obj.mesh.quaternion.w);
    alphas.push(obj.mesh.material.uniforms.alpha.value);
    colors.push(obj.material.color.r);
    colors.push(obj.material.color.g);
    colors.push(obj.material.color.b);
    if (this.hasEmissiveMap()){
      if (obj.hasEmissiveMap()){
        emissiveIntensities.push(obj.getEmissiveIntensity());
        emissiveColors.push(obj.getEmissiveColor().r);
        emissiveColors.push(obj.getEmissiveColor().g);
        emissiveColors.push(obj.getEmissiveColor().b);
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.emissive.texturePack, "emissive");
        emissiveUVs.push(ranges.startU);
        emissiveUVs.push(ranges.startV);
        emissiveUVs.push(ranges.endU);
        emissiveUVs.push(ranges.endV);
      }else{
        emissiveIntensities.push(1);
        emissiveColors.push(1);
        emissiveColors.push(1);
        emissiveColors.push(1);
        emissiveUVs.push(0);
        emissiveUVs.push(0);
        emissiveUVs.push(0);
        emissiveUVs.push(0);
      }
    }
    if (this.hasAOMap()){
      if (obj.hasAOMap()){
        aoIntensities.push(obj.getAOIntensity());
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.ao.texturePack, "ao");
        aoUVs.push(ranges.startU);
        aoUVs.push(ranges.startV);
        aoUVs.push(ranges.endU);
        aoUVs.push(ranges.endV);
      }else{
        aoIntensities.push(1);
        aoUVs.push(0);
        aoUVs.push(0);
        aoUVs.push(0);
        aoUVs.push(0);
      }
    }
    if (this.hasAlphaMap()){
      if (obj.hasAlphaMap()){
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.alpha.texturePack, "alpha");
        alphaUVs.push(ranges.startU);
        alphaUVs.push(ranges.startV);
        alphaUVs.push(ranges.endU);
        alphaUVs.push(ranges.endV);
      }else{
        alphaUVs.push(0);
        alphaUVs.push(0);
        alphaUVs.push(0);
        alphaUVs.push(0);
      }
    }
    if (this.hasDisplacementMap()){
      if (obj.hasDisplacementMap()){
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.height.texturePack, "height");
        displacementUVs.push(ranges.startU);
        displacementUVs.push(ranges.startV);
        displacementUVs.push(ranges.endU);
        displacementUVs.push(ranges.endV);
      }else{
        displacementUVs.push(0);
        displacementUVs.push(0);
        displacementUVs.push(0);
        displacementUVs.push(0);
      }
      if (obj.customDisplacementTextureMatrixInfo){
        displacementTextureMatrixInfos.push(obj.customDisplacementTextureMatrixInfo.offsetX);
        displacementTextureMatrixInfos.push(obj.customDisplacementTextureMatrixInfo.offsetY);
        displacementTextureMatrixInfos.push(obj.customDisplacementTextureMatrixInfo.repeatU);
        displacementTextureMatrixInfos.push(obj.customDisplacementTextureMatrixInfo.repeatV);
      }else{
        displacementTextureMatrixInfos.push(-100);
        displacementTextureMatrixInfos.push(-100);
        displacementTextureMatrixInfos.push(-100);
        displacementTextureMatrixInfos.push(-100);
      }
    }
    if (this.hasTexture){
      if (obj.hasTexture()){
        textureMatrixInfos.push(obj.getTextureOffsetX());
        textureMatrixInfos.push(obj.getTextureOffsetY());
        textureMatrixInfos.push(obj.getTextureRepeatX());
        textureMatrixInfos.push(obj.getTextureRepeatY());
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.diffuse.texturePack, "diffuse");
        diffuseUVs.push(ranges.startU);
        diffuseUVs.push(ranges.startV);
        diffuseUVs.push(ranges.endU);
        diffuseUVs.push(ranges.endV);
        if (obj.hasMirrorS()){
          textureMirrorInfos.push(100);
        }else{
          textureMirrorInfos.push(-100);
        }
        if (obj.hasMirrorT()){
          textureMirrorInfos.push(100);
        }else{
          textureMirrorInfos.push(-100);
        }
      }else{
        textureMatrixInfos.push(0);
        textureMatrixInfos.push(0);
        textureMatrixInfos.push(0);
        textureMatrixInfos.push(0);
        diffuseUVs.push(0);
        diffuseUVs.push(0);
        diffuseUVs.push(0);
        diffuseUVs.push(0);
        textureMirrorInfos.push(0);
        textureMirrorInfos.push(0);
      }
      if (obj.hasDiffuseMap()){
        textureInfos.push(10);
      }else{
        textureInfos.push(-10);
      }
      if (obj.hasEmissiveMap()){
        textureInfos.push(10);
      }else{
        textureInfos.push(-10);
      }
      if (obj.hasAlphaMap()){
        textureInfos.push(10);
      }else{
        textureInfos.push(-10);
      }
      if (obj.hasAOMap()){
        textureInfos.push(10);
      }else{
        textureInfos.push(-10);
      }
      if (obj.hasDisplacementMap()){
        displacementInfos.push(obj.getDisplacementScale());
        displacementInfos.push(obj.getDisplacementBias());
      }else{
        displacementInfos.push(-100);
        displacementInfos.push(-100);
      }
    }
    count ++;
  }

  this.geometry.maxInstancedCount = count;

  var positionOffsetBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(positionOffsets), 3
  );
  var quaternionsBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(quaternions), 4
  );
  var alphaBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(alphas), 1
  );
  var colorBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(colors) , 3
  );
  var textureInfoBufferAttribute;
  var textureMatrixInfosBufferAttribute;
  var displacementTextureMatrixInfosBufferAttribute;
  var emissiveIntensityBufferAttribute;
  var emissiveColorBufferAttribute;
  var aoIntensityBufferAttribute;
  var displacementInfoBufferAttribute;
  var textureMirrorInfoBufferAttribute
  if (this.hasTexture){
    textureInfoBufferAttribute = new THREE.InstancedBufferAttribute(new Int16Array(textureInfos), 4);
    textureMatrixInfosBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(textureMatrixInfos), 4);
    textureMirrorInfoBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(textureMirrorInfos), 2);
    textureInfoBufferAttribute.setDynamic(false);
    textureMatrixInfosBufferAttribute.setDynamic(false);
    textureMirrorInfoBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("textureInfo", textureInfoBufferAttribute);
    this.geometry.addAttribute("textureMatrixInfo", textureMatrixInfosBufferAttribute);
    this.geometry.addAttribute("uv", refGeometry.attributes.uv);
    this.geometry.addAttribute("textureMirrorInfo", textureMirrorInfoBufferAttribute);

    var diffuseUVsBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(diffuseUVs), 4);
    diffuseUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("diffuseUV", diffuseUVsBufferAttribute);

    if (this.hasDisplacementMap()){
      displacementTextureMatrixInfosBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(displacementTextureMatrixInfos), 4);
      displacementTextureMatrixInfosBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("displacementTextureMatrixInfo", displacementTextureMatrixInfosBufferAttribute);
    }
  }
  if (this.hasEmissiveMap()){
    emissiveIntensityBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(emissiveIntensities), 1
    );
    emissiveColorBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(emissiveColors), 3
    );
    emissiveIntensityBufferAttribute.setDynamic(false);
    emissiveColorBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("emissiveIntensity", emissiveIntensityBufferAttribute);
    this.geometry.addAttribute("emissiveColor", emissiveColorBufferAttribute);

    var emissiveUVsBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(emissiveUVs), 4);
    emissiveUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("emissiveUV", emissiveUVsBufferAttribute);
  }
  if (this.hasAOMap()){
    aoIntensityBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(aoIntensities), 1
    );
    aoIntensityBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("aoIntensity", aoIntensityBufferAttribute);

    var aoUVsBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(aoUVs), 4);
    aoUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("aoUV", aoUVsBufferAttribute);
  }
  if (this.hasDisplacementMap()){
    displacementInfoBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(displacementInfos), 2
    );
    displacementInfoBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("displacementInfo", displacementInfoBufferAttribute);

    var displacementUVsBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(displacementUVs), 4);
    displacementUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("displacementUV", displacementUVsBufferAttribute);
  }

  if (this.hasAlphaMap()){
    var alphaUVsBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(alphaUVs), 4);
    alphaUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("alphaUV", alphaUVsBufferAttribute);
  }

  positionOffsetBufferAttribute.setDynamic(false);
  quaternionsBufferAttribute.setDynamic(false);
  alphaBufferAttribute.setDynamic(false);
  colorBufferAttribute.setDynamic(false);

  this.geometry.addAttribute("positionOffset", positionOffsetBufferAttribute);
  this.geometry.addAttribute("quaternion", quaternionsBufferAttribute);
  this.geometry.addAttribute("alpha", alphaBufferAttribute);
  this.geometry.addAttribute("color", colorBufferAttribute);
  this.geometry.addAttribute("position", refGeometry.attributes.position);

  this.geometry.addAttribute("normal", refGeometry.attributes.normal);
}

ObjectGroup.prototype.merge = function(){

  this.handleTextures();

  if (this.areGeometriesIdentical() && INSTANCING_SUPPORTED){
    this.mergeInstanced();
    return;
  }

  this.uvAttrMap = [];

  this.geometry = new THREE.BufferGeometry();
  var pseudoGeometry = new THREE.Geometry();

  var isIndexed = true;

  var miMap = new Object();
  var mi = 0;
  for (var childName in this.group){
    var childObj = this.group[childName];
    if (childObj.type == "box" || childObj.type == "sphere" || childObj.type == "cylinder"){
      isIndexed = false;
    }
    var childGeom = childObj.getNormalGeometry();
    miMap[mi] = childObj.name;
    for (var i = 0; i<childGeom.faces.length; i++){
      childGeom.faces[i].materialIndex = mi;
    }
    mi++;
    childObj.mesh.updateMatrix();
    pseudoGeometry.merge(childGeom, childObj.mesh.matrix);
  }

  this.isIndexed = isIndexed;

  var max = 0;
  var indexCache;
  var faces = pseudoGeometry.faces;
  var indexCache;
  if (isIndexed){
    indexCache = new Object();
    for (var i = 0; i<faces.length; i++){
      var face = faces[i];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      if (a > max){
        max = a;
      }
      if (b > max){
        max = b;
      }
      if (c > max){
        max = c;
      }
    }
  }

  var indices = [];
  var vertices = pseudoGeometry.vertices;
  var faceVertexUVs = pseudoGeometry.faceVertexUvs[0];
  var positions, normals, colors, uvs, alphas, emissiveIntensities, emissiveColors, aoIntensities,
            displacementInfos, textureInfos, textureMatrixInfos, displacementTextureMatrixInfos;

  var diffuseUVs, emissiveUVs, alphaUVs, aoUVs, displacementUVs;

  var textureMirrorInfos;

  this.uvRangeMap = [];

  if (max > 0){
    positions = new Array((max + 1) * 3);
    colors = new Array((max + 1) * 3);
    alphas = new Array(max + 1);
    normals = new Array((max + 1) * 3);
    if (this.hasDisplacement){
      displacementInfos = new Array((max + 1) * 2);
      displacementUVs = new Array((max + 1) * 4);
      displacementTextureMatrixInfos = new Array((max + 1) * 4);
    }
    if (this.hasTexture){
      uvs = new Array((max + 1) * 2);
      textureInfos = new Array((max + 1) * 4);
      textureMatrixInfos = new Array((max + 1) * 4);
      diffuseUVs = new Array((max + 1) * 4);
      textureMirrorInfos = new Array((max + 1) * 2);
      this.uvRangeMap = new Array((max + 1) * 4);
    }
    if (this.hasEmissive){
      emissiveIntensities = new Array(max + 1);
      emissiveColors = new Array((max + 1) * 3);
      emissiveUVs = new Array((max + 1) * 4);
    }
    if (this.hasAO){
      aoIntensities = new Array(max + 1);
      aoUVs = new Array((max + 1) * 4);
    }
    if (this.hasAlpha){
      alphaUVs = new Array((max + 1) * 4);
    }
  }else{
    positions = [];
    colors = [];
    alphas = [];
    normals = [];
    if (this.hasDisplacement){
      displacementInfos = [];
      displacementUVs = [];
      displacementTextureMatrixInfos = [];
    }
    if (this.hasTexture){
      uvs = [];
      textureInfos = [];
      textureMatrixInfos = [];
      diffuseUVs = [];
      textureMirrorInfos = [];
      this.uvRangeMap = [];
    }
    if (this.hasEmissive){
      emissiveIntensities = [];
      emissiveColors = [];
      emissiveUVs = [];
    }
    if (this.hasAO){
      aoIntensities = [];
      aoUVs = [];
    }
    if (this.hasAlpha){
      alphaUVs = [];
    }
  }
  for (var i = 0; i<faces.length; i++){
    var face = faces[i];
    var addedObject = addedObjects[miMap[face.materialIndex]];
    var a = face.a;
    var b = face.b;
    var c = face.c;

    var aSkipped = false;
    var bSkipped = false;
    var cSkipped = false;
    if (isIndexed){
      indices.push(a);
      indices.push(b);
      indices.push(c);
      if (indexCache[a]){
        aSkipped = true;
        this.skippedVertexCount ++;
      }else{
        indexCache[a] = true;
      }
      if (indexCache[b]){
        bSkipped = true;
        this.skippedVertexCount ++;
      }else{
        indexCache[b] = true;
      }
      if (indexCache[c]){
        cSkipped = true;
        this.skippedVertexCount ++;
      }else{
        indexCache[c] = true;
      }
    }

    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];
    var vertexNormals = face.vertexNormals;
    var vertexNormal1 = vertexNormals[0];
    var vertexNormal2 = vertexNormals[1];
    var vertexNormal3 = vertexNormals[2];
    var color = addedObject.material.color;
    var uv1 = faceVertexUVs[i][0];
    var uv2 = faceVertexUVs[i][1];
    var uv3 = faceVertexUVs[i][2];
    var mirrorSInfo = addedObject.hasMirrorS()? 100: -100;
    var mirrorTInfo = addedObject.hasMirrorT()? 100: -100;

    // POSITIONS
    if (!aSkipped){
      this.push(positions, vertex1.x, (3*a), isIndexed);
      this.push(positions, vertex1.y, ((3*a) + 1), isIndexed);
      this.push(positions, vertex1.z, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(positions, vertex2.x, (3*b), isIndexed);
      this.push(positions, vertex2.y, ((3*b) + 1), isIndexed);
      this.push(positions, vertex2.z, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(positions, vertex3.x, (3*c), isIndexed);
      this.push(positions, vertex3.y, ((3*c) + 1), isIndexed);
      this.push(positions, vertex3.z, ((3*c) + 2), isIndexed);
    }
    if (!aSkipped){
      this.push(normals, vertexNormal1.x, (3*a), isIndexed);
      this.push(normals, vertexNormal1.y, ((3*a) + 1), isIndexed);
      this.push(normals, vertexNormal1.z, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(normals, vertexNormal2.x, (3*b), isIndexed);
      this.push(normals, vertexNormal2.y, ((3*b) + 1), isIndexed);
      this.push(normals, vertexNormal2.z, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(normals, vertexNormal3.x, (3*c), isIndexed);
      this.push(normals, vertexNormal3.y, ((3*c) + 1), isIndexed);
      this.push(normals, vertexNormal3.z, ((3*c) + 2), isIndexed);
    }
    // COLORS
    if (!aSkipped){
      this.push(colors, color.r, (3*a), isIndexed);
      this.push(colors, color.g, ((3*a) + 1), isIndexed);
      this.push(colors, color.b, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(colors, color.r, (3*b), isIndexed);
      this.push(colors, color.g, ((3*b) + 1), isIndexed);
      this.push(colors, color.b, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(colors, color.r, (3*c), isIndexed);
      this.push(colors, color.g, ((3*c) + 1), isIndexed);
      this.push(colors, color.b, ((3*c) + 2), isIndexed);
    }
    // UV
    if (this.hasTexture){
      if (!aSkipped){
        this.push(uvs, uv1.x, (2*a), isIndexed);
        this.push(uvs, uv1.y, ((2*a) + 1), isIndexed);
        this.push(textureMirrorInfos, mirrorSInfo, (2*a), isIndexed);
        this.push(textureMirrorInfos, mirrorTInfo, ((2*a) + 1), isIndexed);
      }
      if (!bSkipped){
        this.push(uvs, uv2.x, (2*b), isIndexed);
        this.push(uvs, uv2.y, ((2*b) + 1), isIndexed);
        this.push(textureMirrorInfos, mirrorSInfo, (2*b), isIndexed);
        this.push(textureMirrorInfos, mirrorTInfo, ((2*b) + 1), isIndexed);
      }
      if (!cSkipped){
        this.push(uvs, uv3.x, (2*c), isIndexed);
        this.push(uvs, uv3.y, ((2*c) + 1), isIndexed);
        this.push(textureMirrorInfos, mirrorSInfo, (2*c), isIndexed);
        this.push(textureMirrorInfos, mirrorTInfo, ((2*c) + 1), isIndexed);
      }
    }
    // DIFFUSE UVS
    if (this.hasTexture){
      if (!aSkipped){
        if (addedObject.hasDiffuseMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.diffuse.texturePack, "diffuse");
          this.push(diffuseUVs, ranges.startU, ((2*a)), isIndexed);
          this.push(diffuseUVs, ranges.startV, ((2*a) + 1), isIndexed);
          this.push(diffuseUVs, ranges.endU, ((2*a) + 2), isIndexed);
          this.push(diffuseUVs, ranges.endV, ((2*a) + 3), isIndexed);

          this.push(this.uvRangeMap, addedObject, ((2*a)), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*a) + 1), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*a) + 2), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*a) + 3), isIndexed);
        }else{
          this.push(diffuseUVs, 0, ((2*a)), isIndexed);
          this.push(diffuseUVs, 0, ((2*a) + 1), isIndexed);
          this.push(diffuseUVs, 0, ((2*a) + 2), isIndexed);
          this.push(diffuseUVs, 0, ((2*a) + 3), isIndexed);

          this.push(this.uvRangeMap, addedObject, ((2*a)), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*a) + 1), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*a) + 2), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasDiffuseMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.diffuse.texturePack, "diffuse");
          this.push(diffuseUVs, ranges.startU, ((2*b)), isIndexed);
          this.push(diffuseUVs, ranges.startV, ((2*b) + 1), isIndexed);
          this.push(diffuseUVs, ranges.endU, ((2*b) + 2), isIndexed);
          this.push(diffuseUVs, ranges.endV, ((2*b) + 3), isIndexed);

          this.push(this.uvRangeMap, addedObject, ((2*b)), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*b) + 1), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*b) + 2), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*b) + 3), isIndexed);
        }else{
          this.push(diffuseUVs, 0, ((2*b)), isIndexed);
          this.push(diffuseUVs, 0, ((2*b) + 1), isIndexed);
          this.push(diffuseUVs, 0, ((2*b) + 2), isIndexed);
          this.push(diffuseUVs, 0, ((2*b) + 3), isIndexed);

          this.push(this.uvRangeMap, addedObject, ((2*b)), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*b) + 1), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*b) + 2), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasDiffuseMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.diffuse.texturePack, "diffuse");
          this.push(diffuseUVs, ranges.startU, ((2*c)), isIndexed);
          this.push(diffuseUVs, ranges.startV, ((2*c) + 1), isIndexed);
          this.push(diffuseUVs, ranges.endU, ((2*c) + 2), isIndexed);
          this.push(diffuseUVs, ranges.endV, ((2*c) + 3), isIndexed);

          this.push(this.uvRangeMap, addedObject, ((2*c)), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*c) + 1), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*c) + 2), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*c) + 3), isIndexed);
        }else{
          this.push(diffuseUVs, 0, ((2*c)), isIndexed);
          this.push(diffuseUVs, 0, ((2*c) + 1), isIndexed);
          this.push(diffuseUVs, 0, ((2*c) + 2), isIndexed);
          this.push(diffuseUVs, 0, ((2*c) + 3), isIndexed);

          this.push(this.uvRangeMap, addedObject, ((2*c)), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*c) + 1), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*c) + 2), isIndexed);
          this.push(this.uvRangeMap, addedObject, ((2*c) + 3), isIndexed);
        }
      }
    }
    // ALPHA UVS
    if (this.hasAlpha){
      if (!aSkipped){
        if (addedObject.hasAlphaMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.alpha.texturePack, "alpha");
          this.push(alphaUVs, ranges.startU, ((2*a)), isIndexed);
          this.push(alphaUVs, ranges.startV, ((2*a) + 1), isIndexed);
          this.push(alphaUVs, ranges.endU, ((2*a) + 2), isIndexed);
          this.push(alphaUVs, ranges.endV, ((2*a) + 3), isIndexed);
        }else{
          this.push(alphaUVs, 0, ((2*a)), isIndexed);
          this.push(alphaUVs, 0, ((2*a) + 1), isIndexed);
          this.push(alphaUVs, 0, ((2*a) + 2), isIndexed);
          this.push(alphaUVs, 0, ((2*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasAlphaMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.alpha.texturePack, "alpha");
          this.push(alphaUVs, ranges.startU, ((2*b)), isIndexed);
          this.push(alphaUVs, ranges.startV, ((2*b) + 1), isIndexed);
          this.push(alphaUVs, ranges.endU, ((2*b) + 2), isIndexed);
          this.push(alphaUVs, ranges.endV, ((2*b) + 3), isIndexed);
        }else{
          this.push(alphaUVs, 0, ((2*b)), isIndexed);
          this.push(alphaUVs, 0, ((2*b) + 1), isIndexed);
          this.push(alphaUVs, 0, ((2*b) + 2), isIndexed);
          this.push(alphaUVs, 0, ((2*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasAlphaMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.alpha.texturePack, "alpha");
          this.push(alphaUVs, ranges.startU, ((2*c)), isIndexed);
          this.push(alphaUVs, ranges.startV, ((2*c) + 1), isIndexed);
          this.push(alphaUVs, ranges.endU, ((2*c) + 2), isIndexed);
          this.push(alphaUVs, ranges.endV, ((2*c) + 3), isIndexed);
        }else{
          this.push(alphaUVs, 0, ((2*c)), isIndexed);
          this.push(alphaUVs, 0, ((2*c) + 1), isIndexed);
          this.push(alphaUVs, 0, ((2*c) + 2), isIndexed);
          this.push(alphaUVs, 0, ((2*c) + 3), isIndexed);
        }
      }
    }
    // DISPLACEMENT INFOS
    if (this.hasDisplacement){
      if (!aSkipped){
        if (addedObject.hasDisplacementMap()){
          this.push(
            displacementInfos,
            addedObject.getDisplacementScale(),
            (2*a),
            isIndexed
          );
          this.push(
            displacementInfos,
            addedObject.getDisplacementBias(),
            ((2*a) + 1),
            isIndexed
          );
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.height.texturePack, "height");
          this.push(displacementUVs, ranges.startU, ((2*a)), isIndexed);
          this.push(displacementUVs, ranges.startV, ((2*a) + 1), isIndexed);
          this.push(displacementUVs, ranges.endU, ((2*a) + 2), isIndexed);
          this.push(displacementUVs, ranges.endV, ((2*a) + 3), isIndexed);
        }else{
          this.push(displacementInfos, -100, (2*a), isIndexed);
          this.push(displacementInfos, -100, ((2*a) + 1), isIndexed);
          this.push(displacementUVs, 0, ((2*a)), isIndexed);
          this.push(displacementUVs, 0, ((2*a) + 1), isIndexed);
          this.push(displacementUVs, 0, ((2*a) + 2), isIndexed);
          this.push(displacementUVs, 0, ((2*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasDisplacementMap()){
          this.push(
            displacementInfos,
            addedObject.getDisplacementScale(),
            (2*b),
            isIndexed
          );
          this.push(
            displacementInfos,
            addedObject.getDisplacementBias(),
            ((2*b) + 1),
            isIndexed
          );
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.height.texturePack, "height");
          this.push(displacementUVs, ranges.startU, ((2*b)), isIndexed);
          this.push(displacementUVs, ranges.startV, ((2*b) + 1), isIndexed);
          this.push(displacementUVs, ranges.endU, ((2*b) + 2), isIndexed);
          this.push(displacementUVs, ranges.endV, ((2*b) + 3), isIndexed);
        }else{
          this.push(displacementInfos, -100, (2*b), isIndexed);
          this.push(displacementInfos, -100, ((2*b) + 1), isIndexed);
          this.push(displacementUVs, 0, ((2*b)), isIndexed);
          this.push(displacementUVs, 0, ((2*b) + 1), isIndexed);
          this.push(displacementUVs, 0, ((2*b) + 2), isIndexed);
          this.push(displacementUVs, 0, ((2*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasDisplacementMap()){
          this.push(
            displacementInfos,
            addedObject.getDisplacementScale(),
            (2*c),
            isIndexed
          );
          this.push(
            displacementInfos,
            addedObject.getDisplacementBias(),
            ((2*c) + 1),
            isIndexed
          );
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.height.texturePack, "height");
          this.push(displacementUVs, ranges.startU, ((2*c)), isIndexed);
          this.push(displacementUVs, ranges.startV, ((2*c) + 1), isIndexed);
          this.push(displacementUVs, ranges.endU, ((2*c) + 2), isIndexed);
          this.push(displacementUVs, ranges.endV, ((2*c) + 3), isIndexed);
        }else{
          this.push(displacementInfos, -100, (2*c), isIndexed);
          this.push(displacementInfos, -100, ((2*c) + 1), isIndexed);
          this.push(displacementUVs, 0, ((2*c)), isIndexed);
          this.push(displacementUVs, 0, ((2*c) + 1), isIndexed);
          this.push(displacementUVs, 0, ((2*c) + 2), isIndexed);
          this.push(displacementUVs, 0, ((2*c) + 3), isIndexed);
        }
      }
    }
    // ALPHA
    var alpha = addedObject.mesh.material.uniforms.alpha.value;
    if (!aSkipped){
      this.push(alphas, alpha, a, isIndexed);
    }
    if (!bSkipped){
      this.push(alphas, alpha, b, isIndexed);
    }
    if (!cSkipped){
      this.push(alphas, alpha, c, isIndexed);
    }
    // EMISSIVE UVS
    if (this.hasEmissive){
      if (!aSkipped){
        if (addedObject.hasEmissiveMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.emissive.texturePack, "emissive");
          this.push(emissiveUVs, ranges.startU, ((2*a)), isIndexed);
          this.push(emissiveUVs, ranges.startV, ((2*a) + 1), isIndexed);
          this.push(emissiveUVs, ranges.endU, ((2*a) + 2), isIndexed);
          this.push(emissiveUVs, ranges.endV, ((2*a) + 3), isIndexed);
        }else{
          this.push(emissiveUVs, 0, ((2*a)), isIndexed);
          this.push(emissiveUVs, 0, ((2*a) + 1), isIndexed);
          this.push(emissiveUVs, 0, ((2*a) + 2), isIndexed);
          this.push(emissiveUVs, 0, ((2*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasEmissiveMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.emissive.texturePack, "emissive");
          this.push(emissiveUVs, ranges.startU, ((2*b)), isIndexed);
          this.push(emissiveUVs, ranges.startV, ((2*b) + 1), isIndexed);
          this.push(emissiveUVs, ranges.endU, ((2*b) + 2), isIndexed);
          this.push(emissiveUVs, ranges.endV, ((2*b) + 3), isIndexed);
        }else{
          this.push(emissiveUVs, 0, ((2*b)), isIndexed);
          this.push(emissiveUVs, 0, ((2*b) + 1), isIndexed);
          this.push(emissiveUVs, 0, ((2*b) + 2), isIndexed);
          this.push(emissiveUVs, 0, ((2*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasEmissiveMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.emissive.texturePack, "emissive");
          this.push(emissiveUVs, ranges.startU, ((2*c)), isIndexed);
          this.push(emissiveUVs, ranges.startV, ((2*c) + 1), isIndexed);
          this.push(emissiveUVs, ranges.endU, ((2*c) + 2), isIndexed);
          this.push(emissiveUVs, ranges.endV, ((2*c) + 3), isIndexed);
        }else{
          this.push(emissiveUVs, 0, ((2*c)), isIndexed);
          this.push(emissiveUVs, 0, ((2*c) + 1), isIndexed);
          this.push(emissiveUVs, 0, ((2*c) + 2), isIndexed);
          this.push(emissiveUVs, 0, ((2*c) + 3), isIndexed);
        }
      }
    }
    // EMISSIVE INTENSITY AND EMISSIVE COLOR
    if (this.hasEmissive){
      var emissiveIntensity;
      if (addedObject.hasEmissiveMap()){
        emissiveIntensity = addedObject.getEmissiveIntensity();
      }else{
        emissiveIntensity = 0;
      }
      if (!aSkipped){
        this.push(emissiveIntensities, emissiveIntensity, a, isIndexed);
      }
      if (!bSkipped){
        this.push(emissiveIntensities, emissiveIntensity, b, isIndexed);
      }
      if (!cSkipped){
        this.push(emissiveIntensities, emissiveIntensity, c, isIndexed);
      }
      var emissiveColor;
      if (addedObject.hasEmissiveMap()){
        emissiveColor = addedObject.getEmissiveColor();
      }else{
        emissiveColor = WHITE_COLOR;
      }
      if (!aSkipped){
        this.push(emissiveColors, emissiveColor.r, (3*a), isIndexed);
        this.push(emissiveColors, emissiveColor.g, ((3*a) + 1), isIndexed);
        this.push(emissiveColors, emissiveColor.b, ((3*a) + 2), isIndexed);
      }
      if (!bSkipped){
        this.push(emissiveColors, emissiveColor.r, (3*b), isIndexed);
        this.push(emissiveColors, emissiveColor.g, ((3*b) + 1), isIndexed);
        this.push(emissiveColors, emissiveColor.b, ((3*b) + 2), isIndexed);
      }
      if (!cSkipped){
        this.push(emissiveColors, emissiveColor.r, (3*c), isIndexed);
        this.push(emissiveColors, emissiveColor.g, ((3*c) + 1), isIndexed);
        this.push(emissiveColors, emissiveColor.b, ((3*c) + 2), isIndexed);
      }
    }
    // AO UVS
    if (this.hasAO){
      if (!aSkipped){
        if (addedObject.hasAOMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.ao.texturePack, "ao");
          this.push(aoUVs, ranges.startU, ((2*a)), isIndexed);
          this.push(aoUVs, ranges.startV, ((2*a) + 1), isIndexed);
          this.push(aoUVs, ranges.endU, ((2*a) + 2), isIndexed);
          this.push(aoUVs, ranges.endV, ((2*a) + 3), isIndexed);
        }else{
          this.push(aoUVs, 0, ((2*a)), isIndexed);
          this.push(aoUVs, 0, ((2*a) + 1), isIndexed);
          this.push(aoUVs, 0, ((2*a) + 2), isIndexed);
          this.push(aoUVs, 0, ((2*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasAOMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.ao.texturePack, "ao");
          this.push(aoUVs, ranges.startU, ((2*b)), isIndexed);
          this.push(aoUVs, ranges.startV, ((2*b) + 1), isIndexed);
          this.push(aoUVs, ranges.endU, ((2*b) + 2), isIndexed);
          this.push(aoUVs, ranges.endV, ((2*b) + 3), isIndexed);
        }else{
          this.push(aoUVs, 0, ((2*b)), isIndexed);
          this.push(aoUVs, 0, ((2*b) + 1), isIndexed);
          this.push(aoUVs, 0, ((2*b) + 2), isIndexed);
          this.push(aoUVs, 0, ((2*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasAOMap()){
          var ranges = textureAtlasHandler.getRangesForTexturePack(addedObject.tpInfo.ao.texturePack, "ao");
          this.push(aoUVs, ranges.startU, ((2*c)), isIndexed);
          this.push(aoUVs, ranges.startV, ((2*c) + 1), isIndexed);
          this.push(aoUVs, ranges.endU, ((2*c) + 2), isIndexed);
          this.push(aoUVs, ranges.endV, ((2*c) + 3), isIndexed);
        }else{
          this.push(aoUVs, 0, ((2*c)), isIndexed);
          this.push(aoUVs, 0, ((2*c) + 1), isIndexed);
          this.push(aoUVs, 0, ((2*c) + 2), isIndexed);
          this.push(aoUVs, 0, ((2*c) + 3), isIndexed);
        }
      }
    }
    // AO INTENSITY
    if (this.hasAO){
      var aoIntensity;
      if (addedObject.hasAOMap()){
        aoIntensity = addedObject.getAOIntensity();
      }else{
        aoIntensity = 0;
      }
      if (!aSkipped){
        this.push(aoIntensities, aoIntensity, a, isIndexed);
      }
      if (!bSkipped){
        this.push(aoIntensities, aoIntensity, b, isIndexed);
      }
      if (!cSkipped){
        this.push(aoIntensities, aoIntensity, c, isIndexed);
      }
    }
    // TEXTURE INFOS AND TEXTURE MATRIX INFOS
    if (this.hasTexture){
      if (!aSkipped){
        if (addedObject.hasDiffuseMap()){
          this.push(textureInfos, 10, (4*a), isIndexed);
        }else{
          this.push(textureInfos, -10, (4*a), isIndexed);
        }
        if (addedObject.hasEmissiveMap()){
          this.push(textureInfos, 10, ((4*a) + 1), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*a) + 1), isIndexed);
        }
        if (addedObject.hasAlphaMap()){
          this.push(textureInfos, 10, ((4*a) + 2), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*a) + 2), isIndexed);
        }
        if (addedObject.hasAOMap()){
          this.push(textureInfos, 10, ((4*a) + 3), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasDiffuseMap()){
          this.push(textureInfos, 10, (4*b), isIndexed);
        }else{
          this.push(textureInfos, -10, (4*b), isIndexed);
        }
        if (addedObject.hasEmissiveMap()){
          this.push(textureInfos, 10, ((4*b) + 1), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*b) + 1), isIndexed);
        }
        if (addedObject.hasAlphaMap()){
          this.push(textureInfos, 10, ((4*b) + 2), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*b) + 2), isIndexed);
        }
        if (addedObject.hasAOMap()){
          this.push(textureInfos, 10, ((4*b) + 3), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasDiffuseMap()){
          this.push(textureInfos, 10, (4*c), isIndexed);
        }else{
          this.push(textureInfos, -10, (4*c), isIndexed);
        }
        if (addedObject.hasEmissiveMap()){
          this.push(textureInfos, 10, ((4*c) + 1), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*c) + 1), isIndexed);
        }
        if (addedObject.hasAlphaMap()){
          this.push(textureInfos, 10, ((4*c) + 2), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*c) + 2), isIndexed);
        }
        if (addedObject.hasAOMap()){
          this.push(textureInfos, 10, ((4*c) + 3), isIndexed);
        }else{
          this.push(textureInfos, -10, ((4*c) + 3), isIndexed);
        }
      }
      if (!aSkipped){
        if (addedObject.hasTexture()){
          this.push(textureMatrixInfos, addedObject.getTextureOffsetX(), (4*a), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureOffsetY(), ((4*a) + 1), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatX(), ((4*a) + 2), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatY(), ((4*a) + 3), isIndexed);

          if (this.hasDisplacement){
            if (addedObject.customDisplacementTextureMatrixInfo){
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.offsetX, (4*a), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.offsetY, ((4*a) + 1), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.repeatU, ((4*a) + 2), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.repeatV, ((4*a) + 3), isIndexed);
            }else{
              this.push(displacementTextureMatrixInfos, -100, (4*a), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*a) + 1), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*a) + 2), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*a) + 3), isIndexed);
            }
          }
        }else{
          this.push(textureMatrixInfos, 0, (4*a), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*a) + 1), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*a) + 2), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*a) + 3), isIndexed);

          if (this.hasDisplacement){
            this.push(displacementTextureMatrixInfos, -100, (4*a), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*a) + 1), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*a) + 2), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*a) + 3), isIndexed);
          }
        }
      }
      if (!bSkipped){
        if (addedObject.hasTexture()){
          this.push(textureMatrixInfos, addedObject.getTextureOffsetX(), (4*b), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureOffsetY(), ((4*b) + 1), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatX(), ((4*b) + 2), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatY(), ((4*b) + 3), isIndexed);

          if (this.hasDisplacement){
            if (addedObject.customDisplacementTextureMatrixInfo){
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.offsetX, (4*b), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.offsetY, ((4*b) + 1), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.repeatU, ((4*b) + 2), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.repeatV, ((4*b) + 3), isIndexed);
            }else{
              this.push(displacementTextureMatrixInfos, -100, (4*b), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*b) + 1), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*b) + 2), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*b) + 3), isIndexed);
            }
          }
        }else{
          this.push(textureMatrixInfos, 0, (4*b), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*b) + 1), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*b) + 2), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*b) + 3), isIndexed);

          if (this.hasDisplacement){
            this.push(displacementTextureMatrixInfos, -100, (4*b), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*b) + 1), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*b) + 2), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*b) + 3), isIndexed);
          }
        }
      }
      if (!cSkipped){
        if (addedObject.hasTexture()){
          this.push(textureMatrixInfos, addedObject.getTextureOffsetX(), (4*c), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureOffsetY(), ((4*c) + 1), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatX(), ((4*c) + 2), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatY(), ((4*c) + 3), isIndexed);

          if (this.hasDisplacement){
            if (addedObject.customDisplacementTextureMatrixInfo){
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.offsetX, (4*c), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.offsetY, ((4*c) + 1), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.repeatU, ((4*c) + 2), isIndexed);
              this.push(displacementTextureMatrixInfos, addedObject.customDisplacementTextureMatrixInfo.repeatV, ((4*c) + 3), isIndexed);
            }else{
              this.push(displacementTextureMatrixInfos, -100, (4*c), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*c) + 1), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*c) + 2), isIndexed);
              this.push(displacementTextureMatrixInfos, -100, ((4*c) + 3), isIndexed);
            }
          }
        }else{
          this.push(textureMatrixInfos, 0, (4*c), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*c) + 1), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*c) + 2), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*c) + 3), isIndexed);

          if (this.hasDisplacement){
            this.push(displacementTextureMatrixInfos, -100, (4*c), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*c) + 1), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*c) + 2), isIndexed);
            this.push(displacementTextureMatrixInfos, -100, ((4*c) + 3), isIndexed);
          }
        }
      }
    }
  }

  var positionsTypedArray = new Float32Array(positions);
  var colorsTypedArray = new Float32Array(colors);
  var alphasTypedArray = new Float32Array(alphas);
  var normalsTypedArray = new Float32Array(normals);

  if (this.hasDisplacement){
    var displacementInfosTypedArray = new Float32Array(displacementInfos);
    var displacementUVsTypedArray = new Float32Array(displacementUVs);
    var displacementTextureMatrixInfosTypedArray = new Float32Array(displacementTextureMatrixInfos);
    var displacementInfosBufferAttribute = new THREE.BufferAttribute(displacementInfosTypedArray, 2);
    var displacementUVsBufferAttribute = new THREE.BufferAttribute(displacementUVsTypedArray, 4);
    var displacementTextureMatrixInfosBufferAttribute = new THREE.BufferAttribute(displacementTextureMatrixInfosTypedArray, 4);
    displacementInfosBufferAttribute.setDynamic(false);
    displacementUVsBufferAttribute.setDynamic(false);
    displacementTextureMatrixInfosBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('displacementInfo', displacementInfosBufferAttribute);
    this.geometry.addAttribute("displacementUV", displacementUVsBufferAttribute);
    this.geometry.addAttribute("displacementTextureMatrixInfo", displacementTextureMatrixInfosBufferAttribute);
  }
  if (this.hasTexture){
    var uvsTypedArray = new Float32Array(uvs);
    var textureInfosTypedArray = new Int8Array(textureInfos);
    var textureMatrixInfosTypedArray = new Float32Array(textureMatrixInfos);
    var diffuseUVsTypedArray = new Float32Array(diffuseUVs);
    var textureMirrorInfosTypedArray = new Float32Array(textureMirrorInfos);
    var uvsBufferAttribute = new THREE.BufferAttribute(uvsTypedArray, 2);
    var textureInfosBufferAttribute = new THREE.BufferAttribute(textureInfosTypedArray, 4);
    var textureMatrixInfosBufferAttribute = new THREE.BufferAttribute(textureMatrixInfosTypedArray, 4);
    var diffuseUVsBufferAttribute = new THREE.BufferAttribute(diffuseUVsTypedArray, 4);
    var textureMirrorInfoBufferAttribute = new THREE.BufferAttribute(textureMirrorInfosTypedArray, 2);
    uvsBufferAttribute.setDynamic(false);
    textureInfosBufferAttribute.setDynamic(false);
    textureMatrixInfosBufferAttribute.setDynamic(false);
    diffuseUVsBufferAttribute.setDynamic(false);
    textureMirrorInfoBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('uv', uvsBufferAttribute);
    this.geometry.addAttribute('textureInfo', textureInfosBufferAttribute);
    this.geometry.addAttribute('textureMatrixInfo', textureMatrixInfosBufferAttribute);
    this.geometry.addAttribute("diffuseUV", diffuseUVsBufferAttribute);
    this.geometry.addAttribute("textureMirrorInfo", textureMirrorInfoBufferAttribute);
  }
  if (this.hasEmissive){
    var emissiveIntensitiesTypedArray = new Float32Array(emissiveIntensities);
    var emissiveColorsTypedArray = new Float32Array(emissiveColors);
    var emissiveUVsTypedArray = new Float32Array(emissiveUVs);
    var emissiveIntensitiesBufferAttribute = new THREE.BufferAttribute(emissiveIntensitiesTypedArray, 1);
    var emissiveColorsBufferAttribute = new THREE.BufferAttribute(emissiveColorsTypedArray, 3);
    var emissiveUVsBufferAttribute = new THREE.BufferAttribute(emissiveUVsTypedArray, 4);
    emissiveIntensitiesBufferAttribute.setDynamic(false);
    emissiveColorsBufferAttribute.setDynamic(false);
    emissiveUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('emissiveIntensity', emissiveIntensitiesBufferAttribute);
    this.geometry.addAttribute('emissiveColor', emissiveColorsBufferAttribute);
    this.geometry.addAttribute("emissiveUV", emissiveUVsBufferAttribute);
  }
  if (this.hasAO){
    var aoIntensitiesTypedArray = new Float32Array(aoIntensities);
    var aoUVsTypedArray = new Float32Array(aoUVs);
    var aoIntensitiesBufferAttribute = new THREE.BufferAttribute(aoIntensitiesTypedArray, 1);
    var aoUVsBufferAttribute = new THREE.BufferAttribute(aoUVsTypedArray, 4);
    aoIntensitiesBufferAttribute.setDynamic(false);
    aoUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('aoIntensity', aoIntensitiesBufferAttribute);
    this.geometry.addAttribute("aoUV", aoUVsBufferAttribute);
  }
  if (this.hasAlpha){
    var alphaUVsTypedArray = new Float32Array(alphaUVs);
    var alphaUVsBufferAttribute = new THREE.BufferAttribute(alphaUVsTypedArray, 4);
    alphaUVsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("alphaUV", alphaUVsBufferAttribute);
  }

  var positionsBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
  var colorsBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
  var alphasBufferAttribute = new THREE.BufferAttribute(alphasTypedArray, 1);
  var normalsBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);

  positionsBufferAttribute.setDynamic(false);
  colorsBufferAttribute.setDynamic(false);
  alphasBufferAttribute.setDynamic(false);
  normalsBufferAttribute.setDynamic(false);

  if (isIndexed){
    var indicesTypedArray = new Uint16Array(indices);
    var indicesBufferAttribute = new THREE.BufferAttribute(indicesTypedArray, 1);
    indicesBufferAttribute.setDynamic(false);
    this.geometry.setIndex(indicesBufferAttribute);
  }

  this.geometry.addAttribute('position', positionsBufferAttribute);
  this.geometry.addAttribute('color', colorsBufferAttribute);
  this.geometry.addAttribute('alpha', alphasBufferAttribute);
  this.geometry.addAttribute('normal', normalsBufferAttribute);

  pseudoGeometry = null;
}

ObjectGroup.prototype.glue = function(simplifiedChildrenPhysicsBodies){
  var group = this.group;
  var physicsBody = physicsBodyGenerator.generateEmptyBody();
  this.originalPhysicsBody = physicsBody;
  var centerPosition = this.getInitialCenter();
  var graphicsGroup = new THREE.Group();
  var centerX = centerPosition.x;
  var centerY = centerPosition.y;
  var centerZ = centerPosition.z;
  var referenceVector = new CANNON.Vec3(
    centerX, centerY, centerZ
  );
  var referenceVectorTHREE = new THREE.Vector3(
    centerX, centerY, centerZ
  );
  this.initialPhysicsPositionWhenGlued = {x: referenceVector.x, y: referenceVector.y, z: referenceVector.z};
  physicsBody.position = referenceVector;
  graphicsGroup.position.copy(physicsBody.position);

  var gridSystemNamesMap = new Object();

  var hasAnyPhysicsShape = false;
  for (var objectName in group){
    var addedObject = group[objectName];
    if (addedObject.usedAsAIEntity){
      addedObject.unUseAsAIEntity();
    }
    if (addedObject.steerableInfo){
      addedObject.unmakeSteerable();
    }
    addedObject.setAttachedProperties();
    if (addedObject.isFPSWeapon){
      addedObject.resetFPSWeaponProperties();
    }

    this.totalVertexCount += addedObject.mesh.geometry.attributes.position.count;
    // GLUE PHYSICS ************************************************
    if (!addedObject.noMass && !addedObject.noPhysicsContributionWhenGlued){
      var shape = addedObject.physicsBody.shapes[0];
      physicsBody.addShape(shape, addedObject.physicsBody.position.vsub(referenceVector), addedObject.physicsBody.quaternion);
      hasAnyPhysicsShape = true;
    }
    // GLUE GRAPHICS ***********************************************
    addedObject.mesh.position.sub(referenceVectorTHREE);
    graphicsGroup.add(addedObject.mesh);
    // PREPARE GRAPHICS FOR CLICK EVENTS ***************************
    addedObject.mesh.addedObject = 0;
    addedObject.mesh.objectGroupName = this.name;
    // TO MANAGE CLICK EVENTS
    if (addedObject.destroyedGrids){
      for (var gridName in addedObject.destroyedGrids){
        addedObject.destroyedGrids[gridName].destroyedObjectGroup = this.name;
      }
    }
    // THESE ARE USEFUL FOR SCRIPTING
    addedObject.parentObjectName = this.name;
    this.childObjectsByName[addedObject.name] = addedObject;
    // THESE ARE NECESSARY FOR BVHANDLER
    gridSystemNamesMap[addedObject.metaData.gridSystemName] = true;
    addedObjectsInsideGroups[addedObject.name] = addedObject;
    addedObject.indexInParent = graphicsGroup.children.length - 1;

  }

  // GLUE PHYSICS OF CHILDREN WITH SIMPLIFIED BODIES ***************
  if (simplifiedChildrenPhysicsBodies){
    for (var i = 0; i<simplifiedChildrenPhysicsBodies.length; i++){
      var shape = simplifiedChildrenPhysicsBodies[i].shapes[0];
      physicsBody.addShape(shape, simplifiedChildrenPhysicsBodies[i].position.vsub(referenceVector), simplifiedChildrenPhysicsBodies[i].quaternion);
      hasAnyPhysicsShape = true;
    }
  }

  this.simplifiedChildrenPhysicsBodies = simplifiedChildrenPhysicsBodies;

  this.gridSystemNames = Object.keys(gridSystemNamesMap);

  physicsBody.addedObject = this;

  this.merge();
  this.destroyParts();
  var meshGenerator = new MeshGenerator(this.geometry);
  if (!this.isInstanced){
    this.mesh = meshGenerator.generateMergedMesh(graphicsGroup, this);
  }else{
    this.mesh = meshGenerator.generateInstancedMesh(graphicsGroup, this);
    this.mesh.frustumCulled = false;
  }

  this.compressGeometry();

  webglCallbackHandler.registerEngineObject(this);
  if (this.hasAO){
    macroHandler.injectMacro("HAS_AO", this.mesh.material, true, true);
  }
  if (this.hasEmissive){
    macroHandler.injectMacro("HAS_EMISSIVE", this.mesh.material, true, true);
  }
  if (this.hasDiffuse){
    macroHandler.injectMacro("HAS_DIFFUSE", this.mesh.material, true, true);
  }
  if (this.hasAlpha){
    macroHandler.injectMacro("HAS_ALPHA", this.mesh.material, true, true);
  }
  if (this.hasDisplacement && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    macroHandler.injectMacro("HAS_DISPLACEMENT", this.mesh.material, true, false);
  }
  if (this.hasTexture){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    macroHandler.injectMacro("TEXTURE_SIZE " + ACCEPTED_TEXTURE_SIZE, this.mesh.material, true, true);
  }

  this.mesh.objectGroupName = this.name;
  scene.add(this.mesh);
  if (hasAnyPhysicsShape){
    physicsWorld.addBody(physicsBody);
  }else{
    this.noMass = true;
    this.cannotSetMass = true;
  }

  this.graphicsGroup = graphicsGroup;

  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrix();

  this.physicsBody = physicsBody;
  this.initQuaternion = this.graphicsGroup.quaternion.clone();

  this.boundCallbackFunction = this.collisionCallback.bind(this);

  this.gridSystemName = this.group[Object.keys(this.group)[0]].metaData.gridSystemName;
}

ObjectGroup.prototype.collisionCallback = function(collisionEvent){
  if (!collisionEvent.body.addedObject || (!this.isVisibleOnThePreviewScene() && !this.physicsKeptWhenHidden)){
    return;
  }
  var targetObjectName = collisionEvent.body.addedObject.name;
  var contact = collisionEvent.contact;
  var collisionInfo = reusableCollisionInfo.set(
    targetObjectName, contact.bi.position.x + contact.ri.x, contact.bi.position.y + contact.ri.y,
    contact.bi.position.z + contact.ri.z, contact.getImpactVelocityAlongNormal(), this.physicsBody.quaternion.x,
    this.physicsBody.quaternion.y, this.physicsBody.quaternion.z, this.physicsBody.quaternion.w
  );
  var curCollisionCallbackRequest = collisionCallbackRequests.get(this.name);
  if (curCollisionCallbackRequest){
    curCollisionCallbackRequest(collisionInfo);
  }
}

ObjectGroup.prototype.destroyParts = function(){
  for (var objName in this.group){
    var addedObject = addedObjects[objName];
    if (addedObject){
      addedObject.destroy(true);
      delete addedObjects[objName];
      disabledObjectNames[objName] = 1;
    }
  }
}

ObjectGroup.prototype.detach = function(childrenNoPhysicsContribution){

  if (this.usedAsAIEntity){
    this.unUseAsAIEntity();
  }

  if (this.steerableInfo){
    this.unmakeSteerable();
  }

  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  var worldQuaternions = new Object();
  var worldPositions = new Object();
  var previewSceneWorldPositions = new Object();
  var previewSceneWorldQuaternions = new Object();
  var physicsQuaternions = new Object();
  for (var objectName in this.group){
    if (mode == 0){
      worldQuaternions[objectName] = this.group[objectName].mesh.getWorldQuaternion(REUSABLE_QUATERNION);
      worldQuaternions[objectName] = REUSABLE_QUATERNION.clone();
      this.group[objectName].mesh.getWorldPosition(REUSABLE_VECTOR);
      worldPositions[objectName] = REUSABLE_VECTOR.clone();
    }else if (mode == 1){
      this.group[objectName].mesh.getWorldQuaternion(REUSABLE_QUATERNION);
      worldQuaternions[objectName] = REUSABLE_QUATERNION.clone();
      this.group[objectName].mesh.getWorldPosition(REUSABLE_VECTOR);
      worldPositions[objectName] = REUSABLE_VECTOR.clone();
    }
    if (this.physicsBody.initQuaternion instanceof THREE.Quaternion){
      this.physicsBody.initQuaternion = new CANNON.Quaternion().copy(this.physicsBody.initQuaternion);
    }
    if (this.physicsBody.initQuaternion.x == 0 && this.physicsBody.initQuaternion.y == 0 &&
              this.physicsBody.initQuaternion.z == 0 && this.physicsBody.initQuaternion.w == 1){
        if (this.group[objectName].type != "ramp"){
          physicsQuaternions[objectName] = this.group[objectName].physicsBody.initQuaternion;
        }else{
          physicsQuaternions[objectName] = this.physicsBody.initQuaternion;
        }
    }else{
      if (this.group[objectName].type != "ramp"){
        var cloneQuaternion = new CANNON.Quaternion().copy(this.physicsBody.initQuaternion);
        physicsQuaternions[objectName] = cloneQuaternion.mult(this.group[objectName].physicsBody.initQuaternion);
      }else{
        physicsQuaternions[objectName] = this.physicsBody.initQuaternion;
      }
    }
  }
  for (var i = this.graphicsGroup.children.length -1; i>=0; i--){
    this.graphicsGroup.remove(this.graphicsGroup.children[i]);
  }

  this.destroy(true);
  for (var objectName in this.group){
    var addedObject = this.group[objectName];

    if (!addedObject.noMass){
      physicsWorld.addBody(addedObject.physicsBody);
    }
    scene.add(addedObject.mesh);

    addedObject.mesh.objectGroupName = 0;
    addedObject.mesh.addedObject = addedObject;

    addedObjects[objectName] = addedObject;

    if (addedObject.destroyedGrids){
      for (var gridName in addedObject.destroyedGrids){
        addedObject.destroyedGrids[gridName].destroyedAddedObject = addedObject.name;
      }
    }
    delete addedObject.parentObjectName;
    delete addedObjectsInsideGroups[addedObject.name];
    delete addedObject.indexInParent;

    addedObject.mesh.position.set(
      addedObject.positionXWhenAttached,
      addedObject.positionYWhenAttached,
      addedObject.positionZWhenAttached
    );
    addedObject.physicsBody.position.set(
      addedObject.positionXWhenAttached,
      addedObject.positionYWhenAttached,
      addedObject.positionZWhenAttached
    );
    addedObject.physicsBody.initPosition.copy(addedObject.physicsBody.position);
    addedObject.mesh.quaternion.set(
      addedObject.qxWhenAttached,
      addedObject.qyWhenAttached,
      addedObject.qzWhenAttached,
      addedObject.qwWhenAttached
    );
    addedObject.physicsBody.quaternion.set(
      addedObject.pqxWhenAttached,
      addedObject.pqyWhenAttached,
      addedObject.pqzWhenAttached,
      addedObject.pqwWhenAttached
    );
    if (addedObject.hasTexture()){
      addedObject.setTextureOffsetX(addedObject.textureOffsetXWhenAttached);
      addedObject.setTextureOffsetY(addedObject.textureOffsetYWhenAttached);
    }
    if (addedObject.hasEmissiveMap()){
      addedObject.setEmissiveIntensity(addedObject.emissiveIntensityWhenAttached);
      REUSABLE_COLOR.set(addedObject.emissiveColorWhenAttached);
      addedObject.setEmissiveColor(REUSABLE_COLOR);
    }
    if (addedObject.hasDisplacementMap()){
      addedObject.setDisplacementScale(addedObject.displacementScaleWhenAttached);
      addedObject.setDisplacementBias(addedObject.displacementBiasWhenAttached);
    }
    if (addedObject.hasAOMap()){
      addedObject.setAOIntensity(addedObject.aoIntensityWhenAttached);
    }
    addedObject.updateOpacity(addedObject.opacityWhenAttached);
    addedObject.physicsBody.initQuaternion.copy(addedObject.physicsBody.quaternion);

    delete addedObject.positionXWhenAttached;
    delete addedObject.positionYWhenAttached;
    delete addedObject.positionZWhenAttached;
    delete addedObject.qxWhenAttached;
    delete addedObject.qyWhenAttached;
    delete addedObject.qzWhenAttached;
    delete addedObject.qwWhenAttached;
    delete addedObject.pqxWhenAttached;
    delete addedObject.pqyWhenAttached;
    delete addedObject.pqzWhenAttached;
    delete addedObject.pqwWhenAttached;
    delete addedObject.opacityWhenAttached;
    delete addedObject.emissiveIntensityWhenAttached;
    delete addedObject.displacementScaleWhenAttached;
    delete addedObject.displacementBiasWhenAttached;
    delete addedObject.emissiveColorWhenAttached;
    delete addedObject.aoIntensityWhenAttached;
    delete addedObject.textureOffsetXWhenAttached;
    delete addedObject.textureOffsetYWhenAttached;

    addedObject.mesh.updateMatrixWorld(true);
    addedObject.updateBoundingBoxes();

    if (addedObject.usedAsAIEntity){
      steeringHandler.updateObject(addedObject);
    }

    if (typeof childrenNoPhysicsContribution == UNDEFINED){
      addedObject.noPhysicsContributionWhenGlued = false;
    }else{
      addedObject.noPhysicsContributionWhenGlued = addedObject.noPhysicsContributionWhenGlued || childrenNoPhysicsContribution;
    }
  }
}

ObjectGroup.prototype.setQuaternion = function(axis, val){
  if (axis == "x"){
    this.graphicsGroup.quaternion.x = val;
    this.physicsBody.quaternion.x = val;
    this.initQuaternion.x = val;
    this.physicsBody.initQuaternion.x = val;
    this.mesh.quaternion.x = val;
  }else if (axis == "y"){
    this.graphicsGroup.quaternion.y = val;

    this.physicsBody.quaternion.y = val;
    this.initQuaternion.y = val;
    this.physicsBody.initQuaternion.y = val;
    this.mesh.quaternion.y = val;
  }else if (axis == "z"){
    this.graphicsGroup.quaternion.z = val;
    this.physicsBody.quaternion.z = val;
    this.initQuaternion.z = val;
    this.physicsBody.initQuaternion.z = val;
    this.mesh.quaternion.z = val;
  }else if (axis == "w"){
    this.graphicsGroup.quaternion.w = val;
    this.physicsBody.quaternion.w = val;
    this.initQuaternion.w = val;
    this.physicsBody.initQuaternion.w = val;
    this.mesh.quaternion.w = val;
  }
}

ObjectGroup.prototype.rotatePivotAroundXYZ = function(x, y, z, axis, axisVector, radians){
  this.updatePivot();
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  var point = REUSABLE_VECTOR.set(x, y, z);
  this.pivotObject.position.sub(point);
  this.pivotObject.position.applyAxisAngle(axisVector, radians);
  this.pivotObject.position.add(point);
  this.pivotObject.rotateOnAxis(axisVector, radians);
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  this.pivotObject.pseudoMesh.updateMatrix();
  this.pivotObject.pseudoMesh.updateMatrixWorld();
  this.pivotObject.pseudoMesh.matrixWorld.decompose(REUSABLE_VECTOR, REUSABLE_QUATERNION, REUSABLE_VECTOR_2);
  this.mesh.position.copy(REUSABLE_VECTOR);
  this.mesh.quaternion.copy(REUSABLE_QUATERNION);
  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.physicsBody.position.copy(this.mesh.position);
  }else{
    this.updateSimplifiedPhysicsBody();
  }

  this.onPositionChange(this.prevPositionVector, this.mesh.position);

  if (this.mesh.visible){
    rayCaster.updateObject(this);
    steeringHandler.updateObject(this);
  }
}

ObjectGroup.prototype.rotateAroundXYZ = function(x, y, z, axis, axisVector, radians){
  REUSABLE_QUATERNION2.copy(this.mesh.quaternion);
  if (this.pivotObject){
    this.rotatePivotAroundXYZ(x, y, z, axis, axisVector, radians);
    return;
  }
  var point = REUSABLE_VECTOR.set(x, y, z);
  this.mesh.parent.localToWorld(this.mesh.position);
  this.mesh.position.sub(point);
  this.mesh.position.applyAxisAngle(axisVector, radians);
  this.mesh.position.add(point);
  this.mesh.parent.worldToLocal(this.mesh.position);
  this.mesh.rotateOnAxis(axisVector, radians);
  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.physicsBody.position.copy(this.mesh.position);
  }else{
    this.updateSimplifiedPhysicsBody();
  }

  this.onPositionChange(this.prevPositionVector, this.mesh.position);

  if (this.mesh.visible){
    rayCaster.updateObject(this);
    steeringHandler.updateObject(this);
  }
}

ObjectGroup.prototype.rotateMesh = function(axisVector, radians){
  if (this.rotationMode == rotationModes.WORLD){
    this.mesh.rotateOnWorldAxis(axisVector, radians);
  }else{
    this.mesh.rotateOnAxis(axisVector, radians);
  }
}

ObjectGroup.prototype.resetRotation = function(){
  this.mesh.quaternion.set(
    this.state.quaternionX, this.state.quaternionY, this.state.quaternionZ, this.state.quaternionW
  );
  this.physicsBody.quaternion.set(
    this.state.physicsQX, this.state.physicsQY, this.state.physicsQZ, this.state.physicsQW
  );

  physicsWorld.updateObject(this, false, true);

  if (this.autoInstancedParent){
    this.autoInstancedParent.updateObject(this);
  }

  if (this.mesh.visible){
    rayCaster.updateObject(this);
    steeringHandler.updateObject(this);
  }
}

ObjectGroup.prototype.rotate = function(axis, radian, fromScript){
  REUSABLE_QUATERNION.copy(this.mesh.quaternion);
  var axisVector
  if (axis == axes.X){
    axisVector = THREE_AXIS_VECTOR_X;
  }else if (axis == axes.Y){
    axisVector = THREE_AXIS_VECTOR_Y;
  }else if (axis == axes.Z){
    axisVector = THREE_AXIS_VECTOR_Z;
  }
  this.rotateMesh(axisVector, radian);
  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  }else{
    this.updateSimplifiedPhysicsBody();
  }
  if (!fromScript){
    this.initQuaternion = this.mesh.quaternion.clone();
    this.physicsBody.initQuaternion.copy(
      this.physicsBody.quaternion
    );
    if (axis == axes.X){
      this.rotationX += radian;
    }else if (axis == axes.Y){
      this.rotationY += radian;
    }else if (axis == axes.Z){
      this.rotationZ += radian;
    }
  }
  if (this.mesh.visible){
    rayCaster.updateObject(this);
    steeringHandler.updateObject(this);
  }
}

ObjectGroup.prototype.updateSimplifiedPhysicsBody = function(){
  if (this.pivotObject){
    this.updatePivot();
    this.pivotObject.updateMatrixWorld();
    this.pivotObject.updateMatrix();
    this.pivotObject.pseudoMesh.updateMatrixWorld();
    this.pivotObject.pseudoMesh.updateMatrix();
  }else{
    this.physicsSimplificationObject3DContainer.position.copy(this.mesh.position);
    this.physicsSimplificationObject3DContainer.quaternion.copy(this.mesh.quaternion);
    this.physicsSimplificationObject3DContainer.updateMatrixWorld();
    this.physicsSimplificationObject3DContainer.updateMatrix();
  }
  this.physicsSimplificationObject3D.getWorldPosition(REUSABLE_VECTOR);
  this.physicsSimplificationObject3D.getWorldQuaternion(REUSABLE_QUATERNION);
  this.physicsBody.position.copy(REUSABLE_VECTOR);
  this.physicsBody.quaternion.copy(REUSABLE_QUATERNION);
}

ObjectGroup.prototype.translate = function(axis, amount, fromScript){
  var physicsBody = this.physicsBody;
  if (axis == axes.X){
    this.mesh.translateX(amount);
  }else if (axis == axes.Y){
    this.mesh.translateY(amount);
  }else if (axis == axes.Z){
    this.mesh.translateZ(amount);
  }
  if (!this.isPhysicsSimplified){
    physicsBody.position.copy(this.mesh.position);
  }else{
    this.updateSimplifiedPhysicsBody();
  }
  this.graphicsGroup.position.copy(this.mesh.position);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
    steeringHandler.updateObject(this);
  }
}

ObjectGroup.prototype.destroy = function(skipRaycasterRefresh){
  this.removeBoundingBoxesFromScene();
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  for (var name in this.group){
    var childObj= this.group[name];
    if (childObj.destroyedGrids){
      for (var gridName in childObj.destroyedGrids){
        delete childObj.destroyedGrids[gridName].destroyedAddedObject;
        delete childObj.destroyedGrids[gridName].destroyedObjectGroup;
      }
    }
    this.group[name].dispose();
    delete disabledObjectNames[name];
    steeringHandler.removeObstacle(name);
  }
  this.mesh.material.dispose();
  this.mesh.geometry.dispose();

  if (!skipRaycasterRefresh){
    rayCaster.refresh();
  }
}

ObjectGroup.prototype.exportLightweight = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  this.updateBoundingBoxes();
  var exportObj = new Object();
  exportObj.isChangeable = this.isChangeable;
  exportObj.isSlippery = this.isSlippery;
  exportObj.isIntersectable = this.isIntersectable;
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  exportObj.matrixWorld = this.graphicsGroup.matrixWorld.elements;
  exportObj.position = this.graphicsGroup.position;
  exportObj.quaternion = new THREE.Quaternion().copy(this.graphicsGroup.quaternion);
  exportObj.childNames = [];
  exportObj.childWorkerIndices = [];
  exportObj.center = this.getInitialCenter();
  exportObj.boundingBoxes = [];
  this.childWorkerIdsByChildNames = new Object();
  var childWorkerIndexCtr = 0;
  for (var objName in this.group){
    exportObj.childNames.push(objName);
    exportObj.childWorkerIndices.push(childWorkerIndexCtr);
    this.childWorkerIdsByChildNames[objName] = childWorkerIndexCtr ++;
  }
  for (var i = 0; i<this.boundingBoxes.length; i++){
    exportObj.boundingBoxes.push({
      roygbivObjectName: this.boundingBoxes[i].roygbivObjectName,
      boundingBox: this.boundingBoxes[i]
    });
  }
  exportObj.mass = this.physicsBody.mass;
  exportObj.noMass = this.noMass;
  exportObj.cannotSetMass = this.cannotSetMass;
  exportObj.physicsPosition = {x: this.physicsBody.position.x, y: this.physicsBody.position.y, z: this.physicsBody.position.z};
  exportObj.physicsQuaternion = {x: this.physicsBody.quaternion.x, y: this.physicsBody.quaternion.y, z: this.physicsBody.quaternion.z, w: this.physicsBody.quaternion.w};
  exportObj.initialPhysicsPositionWhenGlued = this.initialPhysicsPositionWhenGlued;
  exportObj.simplifiedChildrenPhysicsBodyDescriptions = this.simplifiedChildrenPhysicsBodyDescriptions;
  if (this.isPhysicsSimplified){
    exportObj.physicsSimplificationParameters = this.physicsSimplificationParameters;
    exportObj.isPhysicsSimplified = true;
  }
  return exportObj;
}

ObjectGroup.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.group = new Object();
  for (var objectName in this.group){
    exportObj.group[objectName] = this.group[objectName].export();
  }
  exportObj.mass = this.mass;
  if (!this.mass){
    exportObj.mass = 0;
  }

  if (this.isDynamicObject){
    exportObj.isDynamicObject = this.isDynamicObject;
  }

  if (this.isSlippery){
    exportObj.isSlippery = true;
  }else{
    exportObj.isSlippery = false;
  }

  if (this.isChangeable){
    exportObj.isChangeable = true;
  }else{
    exportObj.isChangeable = false;
  }
  if (this.isIntersectable){
    exportObj.isIntersectable = true;
  }else{
    exportObj.isIntersectable = false;
  }
  if (this.isColorizable){
    exportObj.isColorizable = true;
  }else{
    exportObj.isColorizable = false;
  }

  if (this.noMass){
    exportObj.noMass = true;
  }else{
    exportObj.noMass = false;
  }

  exportObj.quaternionX = this.initQuaternion.x;
  exportObj.quaternionY = this.initQuaternion.y;
  exportObj.quaternionZ = this.initQuaternion.z;
  exportObj.quaternionW = this.initQuaternion.w;

  exportObj.isBasicMaterial = this.isBasicMaterial;

  var blendingModeInt = this.mesh.material.blending;
  if (blendingModeInt == NO_BLENDING){
    exportObj.blendingMode = "NO_BLENDING";
  }else if (blendingModeInt == NORMAL_BLENDING){
    exportObj.blendingMode = "NORMAL_BLENDING";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    exportObj.blendingMode = "ADDITIVE_BLENDING";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    exportObj.blendingMode = "SUBTRACTIVE_BLENDING";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    exportObj.blendingMode = "MULTIPLY_BLENDING";
  }

  if (this.renderSide){
    exportObj.renderSide = this.renderSide;
  }

  if (this.areaVisibilityConfigurations){
    exportObj.areaVisibilityConfigurations = this.areaVisibilityConfigurations;
  }
  if (this.areaSideConfigurations){
    exportObj.areaSideConfigurations = this.areaSideConfigurations;
  }

  if (this.pivotObject){
    exportObj.hasPivot = true;
    exportObj.pivotOffsetX = this.pivotOffsetX;
    exportObj.pivotOffsetY = this.pivotOffsetY;
    exportObj.pivotOffsetZ = this.pivotOffsetZ;
    exportObj.positionX = this.mesh.position.x;
    exportObj.positionY = this.mesh.position.y;
    exportObj.positionZ = this.mesh.position.z;
    exportObj.quaternionX = this.mesh.quaternion.x;
    exportObj.quaternionY = this.mesh.quaternion.y;
    exportObj.quaternionZ = this.mesh.quaternion.z;
    exportObj.quaternionW = this.mesh.quaternion.w;
    exportObj.pivotQX = this.pivotObject.quaternion.x;
    exportObj.pivotQY = this.pivotObject.quaternion.y;
    exportObj.pivotQZ = this.pivotObject.quaternion.z;
    exportObj.pivotQW = this.pivotObject.quaternion.w;
    exportObj.insidePivotQX = this.pivotObject.children[0].quaternion.x;
    exportObj.insidePivotQY = this.pivotObject.children[0].quaternion.y;
    exportObj.insidePivotQZ = this.pivotObject.children[0].quaternion.z;
    exportObj.insidePivotQW = this.pivotObject.children[0].quaternion.w;
  }else if (this.pivotRemoved){
    exportObj.pivotRemoved = true;
    exportObj.positionX = this.mesh.position.x;
    exportObj.positionY = this.mesh.position.y;
    exportObj.positionZ = this.mesh.position.z;
    exportObj.quaternionX = this.mesh.quaternion.x;
    exportObj.quaternionY = this.mesh.quaternion.y;
    exportObj.quaternionZ = this.mesh.quaternion.z;
    exportObj.quaternionW = this.mesh.quaternion.w;
  }

  if (this.softCopyParentName){
    exportObj.softCopyParentName = this.softCopyParentName;
  }

  exportObj.totalAlpha = this.getOpacity();
  if (this.mesh.material.uniforms.totalAOIntensity){
    exportObj.totalAOIntensity = this.getAOIntensity();
  }
  if (this.mesh.material.uniforms.totalTextureOffset){
    exportObj.totalTextureOffsetX = this.getTextureOffsetX();
    exportObj.totalTextureOffsetY = this.getTextureOffsetY();
  }
  if (this.mesh.material.uniforms.totalEmissiveIntensity){
    exportObj.totalEmissiveIntensity = this.getEmissiveIntensity();
  }
  if (this.mesh.material.uniforms.totalDisplacementInfo){
    exportObj.totalDisplacementScale = this.getDisplacementScale();
    exportObj.totalDisplacementBias = this.getDisplacementBias();
  }
  if (this.mesh.material.uniforms.totalEmissiveColor){
    exportObj.totalEmissiveColor = "#"+this.getEmissiveColor().getHexString();
  }
  exportObj.isRotationDirty = this.isRotationDirty;
  if (this.isPhysicsSimplified){
    exportObj.isPhysicsSimplified = true;
    this.physicsSimplificationParameters = {
      sizeX: this.physicsSimplificationParameters.sizeX,
      sizeY: this.physicsSimplificationParameters.sizeY,
      sizeZ: this.physicsSimplificationParameters.sizeZ,
      pbodyPosition: this.physicsBody.position, pbodyQuaternion: this.physicsBody.quaternion,
      physicsSimplificationObject3DPosition: this.physicsSimplificationObject3D.position,
      physicsSimplificationObject3DQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3D.quaternion),
      physicsSimplificationObject3DContainerPosition: this.physicsSimplificationObject3DContainer.position,
      physicsSimplificationObject3DContainerQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3DContainer.quaternion)
    };
    exportObj.physicsSimplificationParameters = this.physicsSimplificationParameters;
  }
  if (this.positionWhenUsedAsFPSWeapon){
    exportObj.positionWhenUsedAsFPSWeapon = this.positionWhenUsedAsFPSWeapon;
    exportObj.quaternionWhenUsedAsFPSWeapon = this.quaternionWhenUsedAsFPSWeapon;
    exportObj.physicsPositionWhenUsedAsFPSWeapon = this.physicsPositionWhenUsedAsFPSWeapon;
    exportObj.physicsQuaternionWhenUsedAsFPSWeapon = this.physicsQuaternionWhenUsedAsFPSWeapon;
    exportObj.fpsWeaponAlignment = this.fpsWeaponAlignment;
  }
  if (this.hasCustomPrecision){
    exportObj.hasCustomPrecision = true;
    exportObj.customPrecision = this.customPrecision;
  }
  if (this.objectTrailConfigurations){
    exportObj.objectTrailConfigurations = {alpha: this.objectTrailConfigurations.alpha, time: this.objectTrailConfigurations.time};
  }
  if (this.muzzleFlashParameters){
    exportObj.muzzleFlashParameters = this.muzzleFlashParameters;
  }
  exportObj.simplifiedChildrenPhysicsBodyDescriptions = this.simplifiedChildrenPhysicsBodyDescriptions;
  exportObj.animations = new Object();
  for (var animationName in this.animations){
    exportObj.animations[animationName] = this.animations[animationName].export();
  }
  if (this.manualPositionInfo){
    exportObj.manualPositionInfo = this.manualPositionInfo;
  }

  exportObj.affectedByLight = this.affectedByLight;
  exportObj.usedAsAIEntity = this.usedAsAIEntity;

  if (this.steerableInfo){
    exportObj.steerableInfo = {
      mode: this.steerableInfo.mode,
      maxSpeed: this.steerableInfo.maxSpeed,
      maxAcceleration: this.steerableInfo.maxAcceleration,
      jumpSpeed: this.steerableInfo.jumpSpeed,
      lookSpeed: this.steerableInfo.lookSpeed,
      behaviorIDs: []
    };
    for (var behaviorID in this.steerableInfo.behaviorsByID){
      exportObj.steerableInfo.behaviorIDs.push(behaviorID);
    }
  }

  exportObj.rotationMode = this.rotationMode;

  return exportObj;
}

ObjectGroup.prototype.getInitialCenter = function(){
  if (this.copiedInitialCenter){
    return this.copiedInitialCenter;
  }
  var group = this.group;
  var centerX = 0;
  var centerY = 0;
  var centerZ = 0;
  var count = 0;
  for (var objectName in group){
    var bodyPosition = group[objectName].physicsBody.position;
    count ++;
    centerX += bodyPosition.x;
    centerY += bodyPosition.y;
    centerZ += bodyPosition.z;
  }
  centerX = centerX / count;
  centerY = centerY / count;
  centerZ = centerZ / count;
  var obj = new Object();
  obj.x = centerX;
  obj.y = centerY;
  obj.z = centerZ;
  return obj;
}

ObjectGroup.prototype.setMass = function(mass){
  if (mass != 0){
    this.isDynamicObject = true;
    this.physicsBody.type = CANNON.Body.DYNAMIC;
  }else{
    this.isDynamicObject = false;
    this.physicsBody.type = CANNON.Body.STATIC;
  }
  this.physicsBody.mass = mass;
  this.physicsBody.updateMassProperties();
  this.physicsBody.aabbNeedsUpdate = true;
  this.mass = mass;
}

ObjectGroup.prototype.isVisibleOnThePreviewScene = function(){
  return !(this.isHidden);
}

ObjectGroup.prototype.setBlending = function(blendingModeInt){
  this.mesh.material.blending = blendingModeInt;
  if (blendingModeInt == NO_BLENDING){
    this.blendingMode = "NO_BLENDING";
  }else if (blendingModeInt == NORMAL_BLENDING){
    this.blendingMode = "NORMAL_BLENDING";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    this.blendingMode = "ADDITIVE_BLENDING";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    this.blendingMode = "SUBTRACTIVE_BLENDING";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    this.blendingMode = "MULTIPLY_BLENDING";
  }
}

ObjectGroup.prototype.getBlendingText = function(){
  var blendingModeInt = this.mesh.material.blending;
  if (blendingModeInt == NO_BLENDING){
    return "None";
  }else if (blendingModeInt == NORMAL_BLENDING){
    return "Normal";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    return "Additive";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    return "Subtractive";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    return "Multiply";
  }
}

ObjectGroup.prototype.updateBoundingBoxes = function(){
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  for (var objName in this.group){
    this.group[objName].updateBoundingBoxes(this.boundingBoxes);
  }
  this.lastUpdatePosition.copy(this.mesh.position);
  this.lastUpdateQuaternion.copy(this.mesh.quaternion);
}

ObjectGroup.prototype.boundingBoxesNeedUpdate = function(){
  return !(Math.abs(this.lastUpdatePosition.x - this.mesh.position.x) < 0.1 &&
            Math.abs(this.lastUpdatePosition.y - this.mesh.position.y) < 0.1 &&
              Math.abs(this.lastUpdatePosition.z - this.mesh.position.z) < 0.1 &&
                Math.abs(this.lastUpdateQuaternion.x - this.mesh.quaternion.x) < 0.0001 &&
                  Math.abs(this.lastUpdateQuaternion.y - this.mesh.quaternion.y) < 0.0001 &&
                    Math.abs(this.lastUpdateQuaternion.z - this.mesh.quaternion.z) < 0.0001 &&
                      Math.abs(this.lastUpdateQuaternion.w - this.mesh.quaternion.w) < 0.0001);
}

ObjectGroup.prototype.generateBoundingBoxes = function(){
  if (!this.mesh){
    return;
  }
  this.boundingBoxes = [];
  this.mesh.updateMatrixWorld();
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  for (var objName in this.group){
    this.group[objName].generateBoundingBoxes(this.boundingBoxes);
  }
}

ObjectGroup.prototype.visualiseBoundingBoxes = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  if (this.bbHelper){
    scene.remove(this.bbHelper);
  }
  var box3 = new THREE.Box3();
  for (var objName in this.group){
    var boundingBoxes = this.group[objName].boundingBoxes;
    for (var i = 0; i < boundingBoxes.length; i++){
      box3.expandByPoint(boundingBoxes[i].min);
      box3.expandByPoint(boundingBoxes[i].max);
    }
  }
  if (box3.min.x == box3.max.x){
    box3.max.x += 1;
    box3.min.x -= 1;
  }
  if (box3.min.y == box3.max.y){
    box3.max.y += 1;
    box3.min.y -= 1;
  }
  if (box3.min.z == box3.max.z){
    box3.max.z += 1;
    box3.min.z -= 1;
  }
  this.bbHelper = new THREE.Box3Helper(box3, LIME_COLOR);
  scene.add(this.bbHelper);
}

ObjectGroup.prototype.removeBoundingBoxesFromScene = function(){
  if (this.bbHelper){
    scene.remove(this.bbHelper);
  }
}

ObjectGroup.prototype.setSlippery = function(isSlippery){
  if (isSlippery){
    this.setFriction(0);
    this.isSlippery = true;
  }else{
    this.setFriction(friction);
    this.isSlippery = false;
  }
}

ObjectGroup.prototype.setFriction = function(val){
  var physicsMaterial = this.physicsBody.material;
  for (var objName in addedObjects){
    var otherMaterial = addedObjects[objName].physicsBody.material;
    var contact = physicsWorld.getContactMaterial(physicsMaterial, otherMaterial);
    if (contact){
      contact.friction = val;
    }else{
      contact = new CANNON.ContactMaterial(physicsMaterial,otherMaterial, {
        friction: val,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      });
      physicsWorld.addContactMaterial(contact);
    }
  }
  for (var objName in objectGroups){
    if (objName == this.name){
      continue;
    }
    var otherMaterial = objectGroups[objName].physicsBody.material;
    var contact = physicsWorld.getContactMaterial(physicsMaterial, otherMaterial);
    if (contact){
      contact.friction = val;
    }else{
      contact = new CANNON.ContactMaterial(physicsMaterial, otherMaterial, {
        friction: val,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      });
      physicsWorld.addContactMaterial(contact);
    }
  }
}

ObjectGroup.prototype.unsetRotationPivot = function(){
  delete this.pivotObject;
  delete this.pivotOffsetX;
  delete this.pivotOffsetY;
  delete this.pivotOffsetZ;
}

ObjectGroup.prototype.setRotationPivot = function(rotationPivot){
  if (this.pivotObject){
    rotationPivot.position.copy(this.pivotObject.position);
    rotationPivot.quaternion.copy(this.pivotObject.quaternion);
    rotationPivot.rotation.copy(this.pivotObject.rotation);
  }
  this.pivotObject = rotationPivot;
  this.pivotOffsetX = rotationPivot.offsetX;
  this.pivotOffsetY = rotationPivot.offsetY;
  this.pivotOffsetZ = rotationPivot.offsetZ;
}

ObjectGroup.prototype.makePivot = function(offsetX, offsetY, offsetZ){
  var obj = this;
  var pseudoMesh = new THREE.Mesh(obj.mesh.geometry, obj.mesh.material);
  pseudoMesh.position.copy(obj.mesh.position);
  pseudoMesh.quaternion.copy(obj.mesh.quaternion);
  if (this.isPhysicsSimplified){
    if (this.pivotObject){
      obj.pivotObject.pseudoMesh.remove(obj.physicsSimplificationObject3DContainer);
      obj.physicsSimplificationObject3DContainer.position.copy(obj.mesh.position);
      obj.physicsSimplificationObject3DContainer.quaternion.copy(obj.mesh.quaternion);
      obj.physicsSimplificationObject3DContainer.updateMatrixWorld();
      obj.physicsSimplificationObject3DContainer.updateMatrix();
    }
    pseudoMesh.updateMatrix();
    pseudoMesh.updateMatrixWorld();
    this.updateSimplifiedPhysicsBody();
    this.physicsSimplificationObject3DContainer.quaternion.set(0, 0, 0, 1);
    this.physicsSimplificationObject3DContainer.position.sub(pseudoMesh.position);
    pseudoMesh.add(this.physicsSimplificationObject3DContainer);
  }
  var pivot = new THREE.Object3D();
  pivot.add(pseudoMesh);
  pivot.position.set(
    pseudoMesh.position.x + offsetX,
    pseudoMesh.position.y + offsetY,
    pseudoMesh.position.z + offsetZ
  );
  pseudoMesh.position.x = -offsetX;
  pseudoMesh.position.y = -offsetY;
  pseudoMesh.position.z = -offsetZ;
  pivot.pseudoMesh = pseudoMesh;
  pivot.offsetX = offsetX;
  pivot.offsetY = offsetY;
  pivot.offsetZ = offsetZ;
  pivot.rotation.order = 'YXZ';
  pivot.sourceObject = this;
  return pivot;
}

ObjectGroup.prototype.updateTransformBasedOnPivot = function(){
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  this.pivotObject.pseudoMesh.updateMatrix();
  this.pivotObject.pseudoMesh.updateMatrixWorld();
  this.pivotObject.pseudoMesh.matrixWorld.decompose(REUSABLE_VECTOR, REUSABLE_QUATERNION, REUSABLE_VECTOR_2);
  this.mesh.position.copy(REUSABLE_VECTOR);
  this.mesh.quaternion.copy(REUSABLE_QUATERNION);
}

ObjectGroup.prototype.rotateAroundPivotObject = function(axis, radians){
  if (!this.pivotObject){
    return;
  }
  for (var animName in this.animations){
    var anim = this.animations[animName];
    if (!anim.isActive){
      continue;
    }
    var action = anim.description.action;
    if (action == animationHandler.actionTypes.OBJECT.TRANSLATE_X || action == animationHandler.actionTypes.OBJECT.TRANSLATE_Y || action == animationHandler.actionTypes.OBJECT.TRANSLATE_Z){
      animationHandler.onBeforePivotRotation(anim);
    }
  }
  this.updatePivot();
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  var axisVector;
  if (axis == "x"){
    axisVector = THREE_AXIS_VECTOR_X;
    this.pivotObject.rotation.x += radians;
  }else if (axis == "y"){
    axisVector = THREE_AXIS_VECTOR_Y;
    this.pivotObject.rotation.y += radians;
  }else if (axis == "z"){
    axisVector = THREE_AXIS_VECTOR_Z;
    this.pivotObject.rotation.z += radians;
  }
  this.updateTransformBasedOnPivot();
  this.physicsBody.quaternion.copy(this.mesh.quaternion);
  this.physicsBody.position.copy(this.mesh.position);
  if (this.isPhysicsSimplified){
    this.physicsSimplificationObject3D.updateMatrix();
    this.physicsSimplificationObject3D.updateMatrixWorld();
    this.physicsSimplificationObject3D.matrixWorld.decompose(REUSABLE_VECTOR, REUSABLE_QUATERNION, REUSABLE_VECTOR_2);
    this.physicsBody.position.copy(REUSABLE_VECTOR);
    this.physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }

  if (this.mesh.visible){
    rayCaster.updateObject(this);
    steeringHandler.updateObject(this);
  }
  for (var animName in this.animations){
    var anim = this.animations[animName];
    if (!anim.isActive){
      continue;
    }
    var action = anim.description.action;
    if (action == animationHandler.actionTypes.OBJECT.TRANSLATE_X || action == animationHandler.actionTypes.OBJECT.TRANSLATE_Y || action == animationHandler.actionTypes.OBJECT.TRANSLATE_Z){
      animationHandler.onAfterPivotRotation(anim);
    }
  }
}

ObjectGroup.prototype.updatePivot = function(){
  if (!this.pivotObject){
    return;
  }
  this.pivotObject.position.copy(this.mesh.position);
  this.pivotObject.translateX(this.pivotOffsetX);
  this.pivotObject.translateY(this.pivotOffsetY);
  this.pivotObject.translateZ(this.pivotOffsetZ);
}

ObjectGroup.prototype.copy = function(name, isHardCopy, copyPosition, gridSystem){
  var positionBeforeDetached = this.mesh.position.clone();
  var quaternionBeforeDetached = this.mesh.quaternion.clone();
  var physicsPositionBeforeDetached = this.physicsBody.position.clone();
  var physicsQuaternionBeforeDetached = this.physicsBody.quaternion.clone();
  var initQuaternionBeforeDetached = this.initQuaternion.clone();
  var massWhenDetached = this.physicsBody.mass;
  var noMass = this.noMass;
  var slippery = this.isSlippery;
  var isChangeable = this.isChangeable;
  var isIntersectable = this.isIntersectable;
  var isColorizable = this.isColorizable;
  var renderSide = this.renderSide;
  var blending = this.mesh.material.blending;
  var totalAlphaBeforeDetached = this.getOpacity();
  var totalAOIntensityBeforeDetached;
  var totalEmissiveIntensityBeforeDetached;
  var totalDisplacementInfoBeforeDetached;
  var totalTextureOffsetBeforeDetached;
  var totalEmissiveColorBeforeDetached;
  var oldMaterial = this.mesh.material;
  var phsimplObj3DPos;
  var phsimplObj3DQuat;
  var phsimplContPos;
  var phsimplContQuat;
  if (this.isPhysicsSimplified){
    phsimplObj3DPos = this.physicsSimplificationObject3D.position.clone();
    phsimplObj3DQuat = this.physicsSimplificationObject3D.quaternion.clone();
    phsimplContPos = this.physicsSimplificationObject3DContainer.position.clone();
    phsimplContQuat = this.physicsSimplificationObject3DContainer.quaternion.clone();
  }
  if (this.mesh.material.uniforms.totalTextureOffset){
    totalTextureOffsetBeforeDetached = new THREE.Vector2(this.getTextureOffsetX(), this.getTextureOffsetY());
  }
  if (this.mesh.material.uniforms.totalAOIntensity){
    totalAOIntensityBeforeDetached = this.getAOIntensity();
  }
  if (this.mesh.material.uniforms.totalEmissiveIntensity){
    totalEmissiveIntensityBeforeDetached = this.getEmissiveIntensity();
  }
  if (this.mesh.material.uniforms.totalDisplacementInfo){
    totalDisplacementInfoBeforeDetached = new THREE.Vector2(this.getDisplacementScale(), this.getDisplacementBias());
  }
  if (this.mesh.material.uniforms.totalEmissiveColor){
    totalEmissiveColorBeforeDetached = this.getEmissiveColor().clone();
  }
  var isTransparentBeforeDetached = this.mesh.material.transparent;
  this.detach();
  var newGroup = new Object();
  for (var objName in this.group){
    this.group[objName].skipToggleGrid = true;
    var copiedChild = this.group[objName].copy(generateUniqueObjectName(), isHardCopy, REUSABLE_VECTOR.set(0, 0, 0), gridSystem);
    copiedChild.mesh.position.copy(this.group[objName].mesh.position);
    copiedChild.mesh.quaternion.copy(this.group[objName].mesh.quaternion);
    copiedChild.physicsBody.position.copy(this.group[objName].physicsBody.position);
    copiedChild.physicsBody.quaternion.copy(this.group[objName].physicsBody.quaternion);
    copiedChild.metaData["positionX"] = copiedChild.mesh.position.x;
    copiedChild.metaData["positionY"] = copiedChild.mesh.position.y;
    copiedChild.metaData["positionZ"] = copiedChild.mesh.position.z;
    copiedChild.metaData["centerX"] = copiedChild.mesh.position.x;
    copiedChild.metaData["centerY"] = copiedChild.mesh.position.y;
    copiedChild.metaData["centerZ"] = copiedChild.mesh.position.z;
    newGroup[copiedChild.name] = copiedChild;
    addedObjects[copiedChild.name] = copiedChild;
    this.group[objName].skipToggleGrid = false;
  }
  var newObjGroup = new ObjectGroup(name, newGroup);
  newObjGroup.glue();
  if (this.isPhysicsSimplified){
    newObjGroup.simplifyPhysics(this.physicsSimplificationParameters.sizeX, this.physicsSimplificationParameters.sizeY, this.physicsSimplificationParameters.sizeZ);
    newObjGroup.updateSimplifiedPhysicsBody();
  }
  newObjGroup.mesh.position.copy(copyPosition);
  newObjGroup.physicsBody.position.copy(copyPosition);
  newObjGroup.mesh.quaternion.copy(quaternionBeforeDetached);
  newObjGroup.physicsBody.quaternion.copy(physicsQuaternionBeforeDetached);
  newObjGroup.graphicsGroup.position.copy(newObjGroup.mesh.position);
  newObjGroup.graphicsGroup.quaternion.copy(newObjGroup.mesh.quaternion);
  this.glue();
  newObjGroup.isBasicMaterial = this.isBasicMaterial;
  if (this.isPhysicsSimplified){
    this.simplifyPhysics(this.physicsSimplificationParameters.sizeX, this.physicsSimplificationParameters.sizeY, this.physicsSimplificationParameters.sizeZ);
    this.physicsSimplificationObject3D.position.copy(phsimplObj3DPos);
    this.physicsSimplificationObject3D.quaternion.copy(phsimplObj3DQuat);
    this.physicsSimplificationObject3DContainer.position.copy(phsimplContPos);
    this.physicsSimplificationObject3DContainer.quaternion.copy(phsimplContQuat);
  }
  this.physicsBody.position.copy(physicsPositionBeforeDetached);
  this.physicsBody.quaternion.copy(physicsQuaternionBeforeDetached);
  this.mesh.position.copy(positionBeforeDetached);
  this.mesh.quaternion.copy(quaternionBeforeDetached);
  var dx = newObjGroup.mesh.position.x - this.mesh.position.x;
  var dy = newObjGroup.mesh.position.y - this.mesh.position.y;
  var dz = newObjGroup.mesh.position.z - this.mesh.position.z;
  for (var objName in newObjGroup.group){
    newObjGroup.group[objName].positionXWhenAttached += dx;
    newObjGroup.group[objName].positionYWhenAttached += dy;
    newObjGroup.group[objName].positionZWhenAttached += dz;
    newObjGroup.group[objName].metaData["positionX"] += dx;
    newObjGroup.group[objName].metaData["positionY"] += dy;
    newObjGroup.group[objName].metaData["positionZ"] += dz;
    newObjGroup.group[objName].metaData["centerX"] += dx;
    newObjGroup.group[objName].metaData["centerY"] += dy;
    newObjGroup.group[objName].metaData["centerZ"] += dz;
  }
  this.isChangeable = isChangeable;
  this.isIntersectable = isIntersectable;
  this.isColorizable = isColorizable;
  newObjGroup.isChangeable = isChangeable;
  newObjGroup.isIntersectable = isIntersectable;
  newObjGroup.isColorizable = isColorizable;
  if (slippery){
    this.setSlippery(slippery);
    newObjGroup.setSlippery(slippery);
  }
  this.noMass = noMass;
  newObjGroup.noMass = noMass;
  if (noMass){
    physicsWorld.remove(this.physicsBody);
    physicsWorld.remove(newObjGroup.physicsBody);
  }
  newObjGroup.graphicsGroup.position.copy(newObjGroup.mesh.position);
  newObjGroup.graphicsGroup.quaternion.copy(newObjGroup.mesh.quaternion);
  this.initQuaternion.copy(initQuaternionBeforeDetached);
  newObjGroup.initQuaternion.copy(initQuaternionBeforeDetached);
  this.setMass(massWhenDetached);
  newObjGroup.cannotSetMass = this.cannotSetMass;
  if (this.physicsBody.mass != 0){
    newObjGroup.setMass(this.physicsBody.mass);
  }
  if (!(typeof renderSide == UNDEFINED)){
    this.handleRenderSide(renderSide);
    newObjGroup.handleRenderSide(renderSide);
  }

  this.setBlending(blending);
  newObjGroup.setBlending(this.mesh.material.blending);

  this.mesh.material.transparent = isTransparentBeforeDetached;
  newObjGroup.mesh.material.transparent = isTransparentBeforeDetached;
  this.updateOpacity(totalAlphaBeforeDetached);
  if (this.mesh.material.uniforms.totalTextureOffset){
    this.setTextureOffsetX(totalTextureOffsetBeforeDetached.x);
    this.setTextureOffsetY(totalTextureOffsetBeforeDetached.y);
  }
  if (this.mesh.material.uniforms.totalAOIntensity){
    this.setAOIntensity(totalAOIntensityBeforeDetached);
  }
  if (this.mesh.material.uniforms.totalEmissiveIntensity){
    this.setEmissiveIntensity(totalEmissiveIntensityBeforeDetached);
  }
  if (this.mesh.material.uniforms.totalDisplacementInfo){
    this.setDisplacementScale(totalDisplacementInfoBeforeDetached.x);
    this.setDisplacementBias(totalDisplacementInfoBeforeDetached.y);
  }
  if (this.mesh.material.uniforms.totalEmissiveColor){
    this.setEmissiveColor(totalEmissiveColorBeforeDetached);
  }

  this.mesh.material = oldMaterial;

  if (!isHardCopy){
    newObjGroup.mesh.material = this.mesh.material;
    newObjGroup.softCopyParentName = this.name;
  }else{
    newObjGroup.updateOpacity(this.getOpacity());
    if (newObjGroup.mesh.material.uniforms.totalTextureOffset){
      newObjGroup.setTextureOffsetX(this.getTextureOffsetX());
      newObjGroup.setTextureOffsetY(this.getTextureOffsetY());
    }
    if (newObjGroup.mesh.material.uniforms.totalAOIntensity){
      newObjGroup.setAOIntensity(this.getAOIntensity());
    }
    if (newObjGroup.mesh.material.uniforms.totalEmissiveIntensity){
      newObjGroup.setEmissiveIntensity(this.getEmissiveIntensity());
    }
    if (newObjGroup.mesh.material.uniforms.totalDisplacementInfo){
      newObjGroup.setDisplacementScale(this.getDisplacementScale());
      newObjGroup.setDisplacementBias(this.getDisplacementBias());
    }
    if (newObjGroup.mesh.material.uniforms.totalEmissiveColor){
      newObjGroup.setEmissiveColor(this.getEmissiveColor());
    }
  }

  if (this.pivotObject){
    var pivot = newObjGroup.makePivot(this.pivotOffsetX, this.pivotOffsetY, this.pivotOffsetZ);
    newObjGroup.pivotObject = pivot;
    newObjGroup.pivotOffsetX = this.pivotOffsetX;
    newObjGroup.pivotOffsetY = this.pivotOffsetY;
    newObjGroup.pivotOffsetZ = this.pivotOffsetZ;
    newObjGroup.pivotRemoved = false;
  }

  newObjGroup.copiedInitialCenter = {x: newObjGroup.mesh.position.x, y: newObjGroup.mesh.position.y, z: newObjGroup.mesh.position.z};
  if (newObjGroup.isPhysicsSimplified){
    newObjGroup.updateSimplifiedPhysicsBody();
  }
  if (this.hasCustomPrecision){
    newObjGroup.useCustomShaderPrecision(this.customPrecision);
  }

  newObjGroup.setRotationMode(this.rotationMode);

  return newObjGroup;
}

ObjectGroup.prototype.getOpacity = function(){
  return this.mesh.material.uniforms.totalAlpha.value;
}

ObjectGroup.prototype.updateOpacity = function(val){
  this.mesh.material.uniforms.totalAlpha.value = val;
  if (val != 1){
    this.mesh.material.transparent = true;
  }else{
    this.mesh.material.transparent = this.isTransparent;
  }
}
ObjectGroup.prototype.incrementOpacity = function(val){
  this.mesh.material.uniforms.totalAlpha.value += val;
  if (this.mesh.material.uniforms.totalAlpha.value != 1){
    this.mesh.material.transparent = true;
  }else{
    this.mesh.material.transparent = this.isTransparent;
  }
}

ObjectGroup.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
      if (!this.affectedByLight){
        this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
      }
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

ObjectGroup.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  if (!this.affectedByLight){
    delete this.mesh.material.uniforms.worldMatrix;
  }
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}

ObjectGroup.prototype.unsimplifyPhysics = function(){
  physicsWorld.remove(this.physicsBody);
  this.physicsBody = this.originalPhysicsBody;
  physicsWorld.addBody(this.physicsBody);
  this.isPhysicsSimplified = false;
  delete this.physicsSimplificationObject3D;
  delete this.physicsSimplificationObject3DContainer;
  delete this.physicsSimplificationParameters;
  this.physicsBody.position.copy(this.mesh.position);
  this.physicsBody.quaternion.copy(this.mesh.quaternion);
}

ObjectGroup.prototype.simplifyPhysics = function(sizeX, sizeY, sizeZ){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  physicsWorld.remove(this.physicsBody);
  var box3 = new THREE.Box3();
  for (var i = 0; i<this.boundingBoxes.length; i++){
    box3.expandByPoint(this.boundingBoxes[i].min);
    box3.expandByPoint(this.boundingBoxes[i].max);
  }
  box3.getCenter(REUSABLE_VECTOR);
  var newPhysicsBody = physicsBodyGenerator.generateBoxBody({x: sizeX, y: sizeY, z: sizeZ, mass: this.physicsBody.mass, material: this.physicsBody.material});
  newPhysicsBody.position.copy(REUSABLE_VECTOR);
  newPhysicsBody.quaternion.copy(this.physicsBody.quaternion);
  this.physicsBody = newPhysicsBody;
  physicsWorld.addBody(this.physicsBody);
  this.isPhysicsSimplified = true;
  this.physicsSimplificationObject3D = new THREE.Object3D();
  this.physicsSimplificationObject3D.rotation.order = 'YXZ';
  this.physicsSimplificationObject3D.position.copy(this.physicsBody.position);
  this.physicsSimplificationObject3D.quaternion.copy(this.physicsBody.quaternion);
  this.physicsSimplificationObject3D.position.sub(this.mesh.position);
  this.physicsSimplificationObject3DContainer = new THREE.Object3D();
  this.physicsSimplificationObject3DContainer.position.copy(this.mesh.position);
  this.physicsSimplificationObject3DContainer.quaternion.copy(this.mesh.quaternion);
  this.physicsSimplificationObject3DContainer.add(this.physicsSimplificationObject3D);
  if (this.pivotObject){
    this.pivotObject.pseudoMesh.updateMatrix();
    this.pivotObject.pseudoMesh.updateMatrixWorld();
    this.updateSimplifiedPhysicsBody();
    this.pivotObject.pseudoMesh.getWorldPosition(REUSABLE_VECTOR);
    this.physicsSimplificationObject3DContainer.position.sub(REUSABLE_VECTOR);
    this.pivotObject.pseudoMesh.add(this.physicsSimplificationObject3DContainer);
    this.updateSimplifiedPhysicsBody();
  }
  this.physicsSimplificationParameters = {
    sizeX: sizeX, sizeY: sizeY, sizeZ: sizeZ,
    pbodyPosition: this.physicsBody.position, pbodyQuaternion: this.physicsBody.quaternion,
    physicsSimplificationObject3DPosition: this.physicsSimplificationObject3D.position,
    physicsSimplificationObject3DQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3D.quaternion),
    physicsSimplificationObject3DContainerPosition: this.physicsSimplificationObject3DContainer.position,
    physicsSimplificationObject3DContainerQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3DContainer.quaternion)
  };
}
