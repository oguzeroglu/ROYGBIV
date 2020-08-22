var SceneHandler = function(){
  this.reset();
}

SceneHandler.prototype.onReady = function(){
  this.ready = true;
  if (mode == 1){
    canvas.style.visibility = "";
    if (!isDeployment){
      terminal.clear();
      terminal.printInfo(Text.SCENE_LOADED);
    }else{
      removeCLIDom();
    }
  }
  if (this.readyCallback){
    this.readyCallback();
  }
  if (this.nextSceneToChange){
    var nextSceneToChange = this.nextSceneToChange;
    var nextReadyCallback = this.nextReadyCallback;
    delete this.nextSceneToChange;
    delete this.nextReadyCallback;
    this.changeScene(nextSceneToChange, nextReadyCallback);
  }
}

SceneHandler.prototype.onPhysicsReady = function(){
  this.physicsReady = true;
  if (this.raycasterReady || raycasterFactory.workerTurnedOff){
    this.onReady();
  }
}

SceneHandler.prototype.onRaycasterReady = function(){
  this.raycasterReady = true;
  if (this.physicsReady || physicsFactory.workerTurnedOff){
    this.onReady();
  }else if (mode == 0){
    this.onReady();
  }
}

SceneHandler.prototype.destroyScene = function(sceneName){
  this.scenes[sceneName].destroy();
  delete this.scenes[sceneName];
}

SceneHandler.prototype.reset = function(){
  this.activeSceneName = "scene1";
  this.scenes = new Object();
  this.scenes[this.activeSceneName] = new Scene("scene1");
  this.draggableSpriteStatusBySceneName = new Object();
  this.entrySceneName = "scene1";
  this.ready = true;
  if (!(typeof this.nextSceneToChange == UNDEFINED)){
    delete this.nextSceneToChange;
  }
}

SceneHandler.prototype.hasDraggableSprite = function(){
  return this.draggableSpriteStatusBySceneName[this.getActiveSceneName()];
}

SceneHandler.prototype.setDraggableSprite = function(sprite){
  this.draggableSpriteStatusBySceneName[sprite.registeredSceneName] = true;
}

SceneHandler.prototype.onSwitchFromDesignToPreview = function(){
  this.sceneNameBeforeSwitchToPreviewMode = this.getActiveSceneName();
  this.changeScene(this.entrySceneName);
}

SceneHandler.prototype.onSwitchFromPreviewToDesign = function(){
  if (!(typeof this.nextSceneToChange == UNDEFINED)){
    delete this.nextSceneToChange;
  }
  this.ready = true;
  for (var sceneName in this.scenes){
    this.scenes[sceneName].resetAutoInstancedObjects();
    this.scenes[sceneName].resetClickableTexts();
    this.scenes[sceneName].resetClickableSprites();
    this.scenes[sceneName].resetClickableContainers();
    this.scenes[sceneName].resetTrackingObjects();
    this.scenes[sceneName].resetDynamicObjects();
  }
  this.draggableSpriteStatusBySceneName = new Object();
  this.readyCallback = noop;
  this.changeScene(this.sceneNameBeforeSwitchToPreviewMode);
  delete this.sceneNameBeforeSwitchToPreviewMode;
}

SceneHandler.prototype.onLightsUpdated = function(){
  this.scenes[this.getActiveSceneName()].saveLights();
}

SceneHandler.prototype.onBeforeSave = function(){
  this.scenes[this.getActiveSceneName()].savePostProcessing();
  this.scenes[this.getActiveSceneName()].saveLights();
}

SceneHandler.prototype.onTrackingObjectAddition = function(obj){
  this.scenes[obj.registeredSceneName].registerTrackingObject(obj);
}

SceneHandler.prototype.onTrackingObjectDeletion = function(obj){
  this.scenes[obj.registeredSceneName].unregisterTrackingObject(obj);
}

SceneHandler.prototype.onClickableAddedTextAddition = function(addedText){
  this.scenes[addedText.registeredSceneName].registerClickableText(addedText);
}

SceneHandler.prototype.onClickableAddedText2DAddition = function(addedText){
  this.scenes[addedText.registeredSceneName].registerClickableText2D(addedText);
}

SceneHandler.prototype.onClickableSpriteAddition = function(sprite){
  this.scenes[sprite.registeredSceneName].registerClickableSprite(sprite);
}

SceneHandler.prototype.onClickableContainerAddition = function(container){
  this.scenes[container.registeredSceneName].registerClickableContainer(container);
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
  if (!this.scenes[this.getActiveSceneName()]){
    this.activeSceneName = exportObj.activeSceneName;
  }
  this.entrySceneName = exportObj.entrySceneName;
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
  exportObj.entrySceneName = this.entrySceneName;
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
  for (var spriteName in sprites){
    var sprite = sprites[spriteName];
    if (mode == 1){
      for (var animName in sprite.animations){
        animationHandler.forceFinish(sprite.animations[animName]);
      }
    }
    sprite.hideVisually();
  }
  for (var containerName in containers){
    containers[containerName].makeInvisible();
    if (containers[containerName].hasBackground){
      containers[containerName].backgroundSprite.hideVisually();
    }
  }
  for (var vkName in virtualKeyboards){
    virtualKeyboards[vkName].resetColors();
    virtualKeyboards[vkName].hideVisually();
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
    if (inputText){
      inputText.deactivateInputMode();
    }
    inputText = 0;
    activeVirtualKeyboard = 0;
    for (var objName in autoInstancedObjects){
      var obj = autoInstancedObjects[objName];
      obj.hideVisually();
    }
    for (var psName in particleSystemPool){
      var ps = particleSystemPool[psName];
      ps.hide();
    }
    for (var lightningName in lightnings){
      var lightning = lightnings[lightningName];
      lightning.stop();
    }
  }
}

SceneHandler.prototype.changeScene = function(sceneName, readyCallback){
  if (!this.ready){
    this.nextSceneToChange = sceneName;
    this.nextReadyCallback = readyCallback;
    return;
  }
  if (mode == 1){
    this.readyCallback = readyCallback;
    this.scenes[this.getActiveSceneName()].onBeforeExit();
  }
  this.ready = false;
  this.physicsReady = false;
  this.raycasterReady = false;
  pointerLockRequested = false;
  if (document.exitPointerLock){
    document.exitPointerLock();
  }

  lightHandler.onBeforeSceneChange();
  if (projectLoaded){
    this.scenes[this.getActiveSceneName()].saveLights();
  }
  lightHandler.reset();

  this.hideAll();
  scene.background.set("black");
  if (this.scenes[sceneName].isSkyboxMapped){
    skyboxHandler.map(skyBoxes[this.scenes[sceneName].mappedSkyboxName]);
  }
  this.scenes[this.getActiveSceneName()].savePostProcessing();
  if (mode == 0){
    this.scenes[sceneName].loadPostProcessing();
    croppedGridSystemBuffer = 0;
    anchorGrid = 0;
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
    for (var spriteName in this.scenes[sceneName].sprites){
      var sprite = this.scenes[sceneName].sprites[spriteName];
      sprite.showVisually();
    }
    for (var containerName in this.scenes[sceneName].containers){
      var container = this.scenes[sceneName].containers[containerName];
      container.makeVisible();
      if (container.hasBackground){
        container.backgroundSprite.showVisually();
      }
    }
    for (var vkName in this.scenes[sceneName].virtualKeyboards){
      virtualKeyboards[vkName].resetColors();
      virtualKeyboards[vkName].showVisually();
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
    canvas.style.visibility = "hidden";
    if (!isDeployment){
      terminal.clear();
      terminal.printInfo(Text.LOADING);
    }else{
      addCLIDom();
      clearDeploymentConsole();
      appendtoDeploymentConsole("Loading.");
    }
    this.scenes[sceneName].loadPostProcessing();
    activeControl.onDeactivated(true);
    activeControl = new FreeControls({});
    activeControl.onActivated();
    crosshairHandler.hideCrosshair();
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
    for (var spriteName in this.scenes[sceneName].sprites){
      var sprite = this.scenes[sceneName].sprites[spriteName];
      sprite.showVisually();
    }
    for (var objName in this.scenes[sceneName].autoInstancedObjects){
      var obj = this.scenes[sceneName].autoInstancedObjects[objName];
      obj.showVisually();
    }
    for (var containerName in this.scenes[sceneName].containers){
      var container = this.scenes[sceneName].containers[containerName];
      if (container.hasBorder){
        container.makeVisible();
      }
      if (container.hasBackground){
        container.backgroundSprite.showVisually();
      }
    }
    for (var vkName in this.scenes[sceneName].virtualKeyboards){
      virtualKeyboards[vkName].resetColors();
      virtualKeyboards[vkName].hideVisually();
    }
    this.activeSceneName = sceneName;
    if (!isDeployment){
      rayCaster.onReadyCallback = noop;
    }
    raycasterFactory.refresh();
    physicsFactory.refresh();
    if (this.scenes[sceneName].fogConfigurations){
      fogHandler.import(this.scenes[sceneName].fogConfigurations);
    }else{
      fogHandler.reset();
    }
    fogHandler.removeFogFromObjects();
    if(fogHandler.fogActive){
      fogHandler.setFogToObjects();
    }
  }
  scene.background.set(this.scenes[this.activeSceneName].backgroundColor);

  this.scenes[this.getActiveSceneName()].loadLights();
  lightHandler.onAfterSceneChange();
  steeringHandler.onAfterSceneChange();

  if (mode == 0 && !isDeployment){
    $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode - "+sceneHandler.getActiveSceneName()+")");
  }
}

SceneHandler.prototype.createScene = function(sceneName){
  this.scenes[sceneName] = new Scene(sceneName);
}

SceneHandler.prototype.setBackgroundColor = function(colorName){
  this.scenes[this.activeSceneName].backgroundColor = colorName;
  scene.background.set(colorName);
}

SceneHandler.prototype.onVirtualKeyboardDeletion = function(virtualKeyboard){
  this.scenes[virtualKeyboard.registeredSceneName].unregisterVirtualKeyboard(virtualKeyboard);
}

SceneHandler.prototype.onVirtualKeyboardCreation = function(virtualKeyboard){
  this.scenes[this.activeSceneName].registerVirtualKeyboard(virtualKeyboard);
}

SceneHandler.prototype.onContainerDeletion = function(container){
  this.scenes[container.registeredSceneName].unregisterContainer(container);
}

SceneHandler.prototype.onContainerCreation = function(container){
  this.scenes[this.activeSceneName].registerContainer(container);
}

SceneHandler.prototype.onSpriteDeletion = function(sprite){
  this.scenes[sprite.registeredSceneName].unregisterSprite(sprite);
}

SceneHandler.prototype.onSpriteCreation = function(sprite){
  this.scenes[this.activeSceneName].registerSprite(sprite);
}

SceneHandler.prototype.onAutoInstancedObjectCreation = function(autoInstancedObject){
  this.scenes[autoInstancedObject.getRegisteredSceneName()].registerAutoInstancedObject(autoInstancedObject);
}

SceneHandler.prototype.onLightningCreation = function(lightning){
  this.scenes[this.activeSceneName].registerLightning(lightning);
}

SceneHandler.prototype.onLightningDeletion = function(lightning){
  this.scenes[lightning.registeredSceneName].unregisterLightning(lightning);
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

SceneHandler.prototype.onMassCreation = function(mass){
  this.scenes[this.activeSceneName].registerMass(mass);
}

SceneHandler.prototype.onMassDeletion = function(mass){
  this.scenes[mass.registeredSceneName].unregisterMass(mass);
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

SceneHandler.prototype.getAutoInstancedObjects = function(){
  return this.scenes[this.activeSceneName].autoInstancedObjects;
}

SceneHandler.prototype.getAddedTexts = function(){
  return this.scenes[this.activeSceneName].addedTexts;
}

SceneHandler.prototype.getAddedTexts2D = function(){
  return this.scenes[this.activeSceneName].addedTexts2D;
}

SceneHandler.prototype.getContainers = function(){
  return this.scenes[this.activeSceneName].containers;
}

SceneHandler.prototype.getVirtualKeyboards = function(){
  return this.scenes[this.activeSceneName].virtualKeyboards;
}

SceneHandler.prototype.getSprites = function(){
  return this.scenes[this.activeSceneName].sprites;
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

SceneHandler.prototype.getClickableAddedTexts = function(){
  return this.scenes[this.activeSceneName].clickableAddedTexts;
}

SceneHandler.prototype.getClickableSprites = function(){
  return this.scenes[this.activeSceneName].clickableSprites;
}

SceneHandler.prototype.getClickableContainers = function(){
  return this.scenes[this.activeSceneName].clickableContainers;
}

SceneHandler.prototype.getClickableAddedTexts2D = function(){
  return this.scenes[this.activeSceneName].clickableAddedTexts2D;
}

SceneHandler.prototype.getTrackingObjects = function(){
  return this.scenes[this.activeSceneName].trackingObjects;
}

SceneHandler.prototype.getLightnings = function(){
  return this.scenes[this.activeSceneName].lightnings;
}

SceneHandler.prototype.getMasses = function(){
  return this.scenes[this.activeSceneName].masses;
}
