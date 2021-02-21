var SmartRenderingHandler = function(){
  this.isEnabled = false;
  this.cameraPositionCache = new THREE.Vector3();
  this.cameraQuaternionCache = new THREE.Quaternion();

  this.buffer = 0;
}

SmartRenderingHandler.prototype.onSceneChange = function(){
  this.invalidate();
  if (Object.keys(lightHandler.dynamicLights).length > 0 || renderer.bloomOn){
    this.isEnabled = false;
    return;
  }

  for (var objName in sceneHandler.getAddedObjects()){
    var addedObject = addedObjects[objName];
    if (addedObject.isChangeable){
      this.isEnabled = false;
      return;
    }
    if (addedObject.isColorizable){
      this.isEnabled = false;
      return;
    }
    if (addedObject.isDynamicObject){
      this.isEnabled = false;
      return;
    }
    if (Object.keys(addedObject.animations).length > 0){
      this.isEnabled = false;
      return;
    }
  }

  for (var objName in sceneHandler.getObjectGroups()){
    var objectGroup = objectGroups[objName];
    if (objectGroup.isChangeable){
      this.isEnabled = false;
      return;
    }
    if (objectGroup.isColorizable){
      this.isEnabled = false;
      return;
    }
    if (objectGroup.isDynamicObject){
      this.isEnabled = false;
      return;
    }
    if (Object.keys(objectGroup.animations).length > 0){
      this.isEnabled = false;
      return;
    }
  }

  for (var modelInstanceName in sceneHandler.getModelInstances()){
    var modelInstance = modelInstances[modelInstanceName];

    if (Object.keys(modelInstance.animations).length > 0){
      this.isEnabled = false;
      return;
    }
  }

  if (Object.keys(sceneHandler.getAddedTexts()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getContainers()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getCrosshairs()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getLightnings()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getMuzzleFlashes()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getParticleSystems()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getSprites()).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sceneHandler.getVirtualKeyboards()).length > 0){
    this.isEnabled = false;
    return;
  }

  this.isEnabled = true;
  this.invalidated = false;
  this.firstRenderCount = 0;
  this.buffer = 0;
}

SmartRenderingHandler.prototype.invalidate = function(){
  this.invalidated = true;
}

SmartRenderingHandler.prototype.shouldSkipRender = function(){
  if (mode == 0 || !this.isEnabled){
    return false;
  }

  if (this.firstRenderCount < 3){
    this.firstRenderCount ++;
    return false;
  }

  if (isMobile){
    if (touchEventHandler.isTouching()){
      this.invalidate();
    }
  }

  var result = this.cameraPositionCache.equals(camera.position) && this.cameraQuaternionCache.equals(camera.quaternion);
  this.cameraPositionCache.copy(camera.position);
  this.cameraQuaternionCache.copy(camera.quaternion);

  if (this.invalidated){
    result = false;
    this.invalidated = false;
  }

  if (this.lastResult != result){
    if (this.debug){
      console.log(result? "Sleeping.": "Waking up.");
    }
  }

  this.lastResult = result;

  if (result){
    if (this.buffer < 3){
      this.buffer ++;
      this.antialias = true;
    }
  }else{
    this.buffer = 0;
  }

  return result;
}
