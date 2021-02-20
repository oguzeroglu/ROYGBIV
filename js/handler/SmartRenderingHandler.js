var SmartRenderingHandler = function(){
  this.isEnabled = false;
}

SmartRenderingHandler.prototype.onSwitchToPreviewMode = function(){
  for (var objName in addedObjects){
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

  for (var objName in objectGroups){
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

  for (var modelInstanceName in modelInstances){
    var modelInstance = modelInstances[modelInstanceName];

    if (Object.keys(modelInstance.animations).length > 0){
      this.isEnabled = false;
      return;
    }
  }

  if (Object.keys(addedTexts).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(containers).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(crosshairs).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(lightnings).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(muzzleFlashes).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(preConfiguredParticleSystems).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(sprites).length > 0){
    this.isEnabled = false;
    return;
  }
  if (Object.keys(virtualKeyboards).length > 0){
    this.isEnabled = false;
    return;
  }

  this.isEnabled = true;
}

SmartRenderingHandler.prototype.shouldSkipRender = function(){
  if (mode == 0 || !this.isEnabled){
    return false;
  }

  return true;
}
