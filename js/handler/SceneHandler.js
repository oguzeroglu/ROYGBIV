var SceneHandler = function(){
  this.activeSceneName = "scene1";
  this.scenes = new Object();
  this.scenes[this.activeSceneName] = new Scene("scene1");
  this.entrySceneName = "scene1";
}

SceneHandler.prototype.onSwitchFromDesignToPreview = function(){
  this.sceneNameBeforeSwitchToPreviewMode = this.getActiveSceneName();
  this.changeScene(this.entrySceneName);
}

SceneHandler.prototype.onSwitchFromPreviewToDesign = function(){
  for (var sceneName in this.scenes){
    this.scenes[sceneName].resetAutoInstancedObjects();
  }
  this.changeScene(this.sceneNameBeforeSwitchToPreviewMode);
  delete this.sceneNameBeforeSwitchToPreviewMode;
}

SceneHandler.prototype.onBeforeSave = function(){
  this.scenes[this.getActiveSceneName()].savePostProcessing();
}

SceneHandler.prototype.onDynamicObjectAddition = function(obj){
  this.scenes[obj.registeredSceneName].registerDynamicObject(obj);
}

SceneHandler.prototype.onDynamicObjectDeletion = function(obj) {
  this.scenes[obj.registeredSceneName].unregisterDynamicObject(obj);
}

SceneHandler.prototype.import = function(exportObj){
  this.scenes = new Object();
  for (var sceneName in exportObj.scenes){
    this.scenes[sceneName] = new Scene(sceneName);
    this.scenes[sceneName].import(exportObj.scenes[sceneName]);
  }
  sceneHandler.hideAll();
  sceneHandler.changeScene(exportObj.activeSceneName);
}

SceneHandler.prototype.export = function(){
  var exportObj = new Object();
  exportObj.scenes = new Object();
  for (var sceneName in this.scenes){
    exportObj.scenes[sceneName] = this.scenes[sceneName].export();
  }
  exportObj.activeSceneName = this.activeSceneName;
  return exportObj;
}

SceneHandler.prototype.hideAll = function(){
  skyboxHandler.unmap();
  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (mode == 1){
      if (objectTrails[obj.name]){
        objectTrails[obj.name].stop();
      }
      for (var animName in obj.animations){
        animationHandler.forceFinish(obj.animations[animName]);
      }
    }
    obj.hideVisually();
  }
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (mode == 1){
      if (objectTrails[obj.name]){
        objectTrails[obj.name].stop();
      }
      for (var animName in obj.animations){
        animationHandler.forceFinish(obj.animations[animName]);
      }
    }
    obj.hideVisually();
  }
  for (var textName in addedTexts){
    var text = addedTexts[textName];
    if (mode == 1){
      for (var animName in text.animations){
        animationHandler.forceFinish(text.animations[animName]);
      }
    }
    text.hideVisually();
  }
  if (mode == 0){
    for (var gsName in gridSystems){
      gridSystems[gsName].hide();
    }
    for (var gridName in gridSelections){
      gridSelections[gridName].toggleSelect();
    }
    if (markedPointsVisible){
      for (var markedPointName in markedPoints){
        var markedPoint = markedPoints[markedPointName];
        if (!markedPoint.isHidden){
          markedPoint.hide();
        }
      }
    }
    if (areasVisible){
      for (var areaName in areas){
        areas[areaName].hide();
      }
    }
    gridSelections = new Object();
  }else{
    for (var objName in autoInstancedObjects){
      var obj = autoInstancedObjects[objName];
      obj.hideVisually();
    }
    for (var psName in particleSystemPool){
      var ps = particleSystemPool[psName];
      ps.hide();
    }
  }
}

SceneHandler.prototype.changeScene = function(sceneName){
  this.hideAll();
  if (mode == 0){
    this.scenes[this.getActiveSceneName()].savePostProcessing();
    this.scenes[sceneName].loadPostProcessing();
    croppedGridSystemBuffer = 0;
    anchorGrid = 0;
    if (this.scenes[sceneName].isSkyboxMapped){
      skyboxHandler.map(skyBoxes[this.scenes[sceneName].mappedSkyboxName]);
    }
    if (this.scenes[sceneName].fogConfigurations){
      fogHandler.import(this.scenes[sceneName].fogConfigurations);
    }else{
      fogHandler.reset();
    }
    fogHandler.removeFogFromObjects();
    for (var gsName in this.scenes[sceneName].gridSystems){
      var gs = this.scenes[sceneName].gridSystems[gsName];
      gs.show();
    }
    for (var objName in this.scenes[sceneName].addedObjects){
      var obj = this.scenes[sceneName].addedObjects[objName];
      obj.showVisually();
    }
    for (var objName in this.scenes[sceneName].objectGroups){
      var obj = this.scenes[sceneName].objectGroups[objName];
      obj.showVisually();
    }
    for (var textName in this.scenes[sceneName].addedTexts){
      var text = this.scenes[sceneName].addedTexts[textName];
      text.showVisually();
    }
    if (markedPointsVisible){
      for (var markedPointName in this.scenes[sceneName].markedPoints){
        var markedPoint = this.scenes[sceneName].markedPoints[markedPointName];
        if (markedPoint.isHidden){
          markedPoint.show();
        }
      }
    }
    if (areasVisible){
      for (var areaName in this.scenes[sceneName].areas){
        this.scenes[sceneName].areas[areaName].renderToScreen();
      }
    }
    this.activeSceneName = sceneName;
    areaConfigurationsHandler.onAfterSceneChange();
  }else{
    activeControl.onDeactivated();
    activeControl = new FreeControls({});
    activeControl.onActivated();
    for (var objName in this.scenes[sceneName].addedObjects){
      var obj = this.scenes[sceneName].addedObjects[objName];
      obj.showVisually();
    }
    for (var objName in this.scenes[sceneName].objectGroups){
      var obj = this.scenes[sceneName].objectGroups[objName];
      obj.showVisually();
    }
    for (var textName in this.scenes[sceneName].addedTexts){
      var text = this.scenes[sceneName].addedTexts[textName];
      text.showVisually();
    }
    for (var objName in this.scenes[sceneName].autoInstancedObjects){
      var obj = this.scenes[sceneName].autoInstancedObjects[objName];
      obj.showVisually();
    }
    this.activeSceneName = sceneName;
    rayCaster.onReadyCallback = noop;
    raycasterFactory.refresh();
    physicsFactory.refresh();
  }
  if (mode == 0){
    $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode - "+sceneHandler.getActiveSceneName()+")");
  }
}

SceneHandler.prototype.createScene = function(sceneName){
  this.scenes[sceneName] = new Scene(sceneName);
}

SceneHandler.prototype.onAutoInstancedObjectCreation = function(autoInstancedObject){
  this.scenes[autoInstancedObject.getRegisteredSceneName()].registerAutoInstancedObject(autoInstancedObject);
}

SceneHandler.prototype.onCrosshairCreation = function(crosshair){
  this.scenes[this.activeSceneName].registerCrosshair(crosshair);
}

SceneHandler.prototype.onCrosshairDeletion = function(crosshair){
  this.scenes[crosshair.registeredSceneName].unregisterCrosshair(crosshair);
}

SceneHandler.prototype.onMuzzleFlashCreation = function(muzzleFlash){
  this.scenes[this.activeSceneName].registerMuzzleFlash(muzzleFlash);
}

SceneHandler.prototype.onMuzzleFlashDeletion = function(muzzleFlash){
  this.scenes[muzzleFlash.registeredSceneName].unregisterMuzzleFlash(muzzleFlash);
}

SceneHandler.prototype.onParticleSystemPoolCreation = function(preConfiguredParticleSystemPool){
  this.scenes[this.activeSceneName].registerParticleSystemPool(preConfiguredParticleSystemPool);
}

SceneHandler.prototype.onParticleSystemPoolDeletion = function(preConfiguredParticleSystemPool){
  this.scenes[preConfiguredParticleSystemPool.registeredSceneName].unregisterParticleSystemPool(preConfiguredParticleSystemPool);
}

SceneHandler.prototype.onParticleSystemDeletion = function(preConfiguredParticleSystem){
  this.scenes[preConfiguredParticleSystem.registeredSceneName].unregisterParticleSystem(preConfiguredParticleSystem);
}

SceneHandler.prototype.onParticleSystemCreation = function(preConfiguredParticleSystem){
  this.scenes[this.activeSceneName].registerParticleSystem(preConfiguredParticleSystem);
}

SceneHandler.prototype.onWorldLimitsChange = function(){
  for (var sceneName in this.scenes){
    this.scenes[sceneName].refreshAreaBinHandler();
  }
}

SceneHandler.prototype.onBinSizeChange = function(){
  for (var sceneName in this.scenes){
    this.scenes[sceneName].refreshAreaBinHandler();
  }
}

SceneHandler.prototype.onFogChange = function(){
  this.scenes[this.activeSceneName].registerFog(fogHandler.export());
}

SceneHandler.prototype.onMapSkybox = function(skybox){
  this.scenes[this.activeSceneName].mapSkybox(skybox);
}

SceneHandler.prototype.onUnmapSkybox = function(){
  this.scenes[this.activeSceneName].unmapSkybox();
}

SceneHandler.prototype.onSkyboxDeletion = function(skybox){
  for (var sceneName in this.scenes){
    var scene = this.scenes[sceneName];
    if (scene.isSkyboxMapped && scene.mappedSkyboxName == skybox.name){
      scene.unmapSkybox();
    }
  }
}

SceneHandler.prototype.onAddedTextCreation = function(addedText){
  this.scenes[this.activeSceneName].registerAddedText(addedText);
}

SceneHandler.prototype.onAddedTextDeletion = function(addedText){
  this.scenes[addedText.registeredSceneName].unregisterAddedText(addedText);
}

SceneHandler.prototype.onObjectGroupCreation = function(objectGroup){
  this.scenes[this.activeSceneName].registerObjectGroup(objectGroup);
}

SceneHandler.prototype.onObjectGroupDeletion = function(objectGroup){
  this.scenes[objectGroup.registeredSceneName].unregisterObjectGroup(objectGroup);
}

SceneHandler.prototype.onAddedObjectCreation = function(addedObject){
  this.scenes[this.activeSceneName].registerAddedObject(addedObject);
}

SceneHandler.prototype.onAddedObjectDeletion = function(addedObject){
  var sceneName = addedObject.registeredSceneName;
  if (typeof sceneName == UNDEFINED){
    sceneName = objectGroups[addedObject.parentObjectName].registeredSceneName;
  }
  this.scenes[sceneName].unregisterAddedObject(addedObject);
}

SceneHandler.prototype.onAreaCreation = function(area){
  this.scenes[this.activeSceneName].registerArea(area);
}

SceneHandler.prototype.onAreaDeletion = function(area){
  this.scenes[area.registeredSceneName].unregisterArea(area);
}

SceneHandler.prototype.onGridSystemCreation = function(gridSystem){
  this.scenes[this.activeSceneName].registerGridSystem(gridSystem);
}

SceneHandler.prototype.onGridSystemDeletion = function(gridSystem){
  this.scenes[gridSystem.registeredSceneName].unregisterGridSystem(gridSystem);
}

SceneHandler.prototype.onWallCollectionCreation = function(wallCollection){
  this.scenes[this.activeSceneName].registerWallCollection(wallCollection);
}

SceneHandler.prototype.onWallCollectionDeletion = function(wallCollection){
  this.scenes[wallCollection.registeredSceneName].unregisterWallCollection(wallCollection);
}

SceneHandler.prototype.onMarkedPointCreation = function(markedPoint){
  this.scenes[this.activeSceneName].registerMarkedPoint(markedPoint);
}

SceneHandler.prototype.onMarkedPointDeletion = function(markedPoint){
  this.scenes[markedPoint.registeredSceneName].unregisterMarkedPoint(markedPoint);
}

SceneHandler.prototype.getActiveSceneName = function(){
  return this.activeSceneName;
}

SceneHandler.prototype.getGridSystems = function(){
  return this.scenes[this.activeSceneName].gridSystems;
}

SceneHandler.prototype.getWallCollections = function(){
  return this.scenes[this.activeSceneName].wallCollections;
}

SceneHandler.prototype.getMarkedPoints = function(){
  return this.scenes[this.activeSceneName].markedPoints;
}

SceneHandler.prototype.getAreaBinHandler = function(){
  return this.scenes[this.activeSceneName].areaBinHandler;
}

SceneHandler.prototype.getAreas = function(){
  return this.scenes[this.activeSceneName].areas;
}

SceneHandler.prototype.getAddedObjects = function(){
  return this.scenes[this.activeSceneName].addedObjects;
}

SceneHandler.prototype.getObjectGroups = function(){
  return this.scenes[this.activeSceneName].objectGroups;
}

SceneHandler.prototype.getAddedTexts = function(){
  return this.scenes[this.activeSceneName].addedTexts;
}

SceneHandler.prototype.getMuzzleFlashes = function(){
  return this.scenes[this.activeSceneName].muzzleFlashes;
}

SceneHandler.prototype.getParticleSystems = function(){
  return this.scenes[this.activeSceneName].particleSystems;
}

SceneHandler.prototype.getParticleSystemPools = function(){
  return this.scenes[this.activeSceneName].particleSystemPools;
}

SceneHandler.prototype.getCrosshairs = function(){
  return this.scenes[this.activeSceneName].crosshairs;
}

SceneHandler.prototype.getDynamicObjects = function(){
  return this.scenes[this.activeSceneName].dynamicObjects;
}

SceneHandler.prototype.getDynamicObjectGroups = function(){
  return this.scenes[this.activeSceneName].dynamicObjectGroups;
}
