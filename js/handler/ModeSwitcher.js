var ModeSwitcher = function(){
  this.loadedScriptsCounter = 0;
  this.totalScriptsToLoad = 0;
  var that = this;
  this.scriptReloadSuccessFunction = function(scriptName){
    that.loadedScriptsCounter ++;
    if (that.loadedScriptsCounter == that.totalScriptsToLoad){
      that.switchFromDesignToPreview();
    }
  }
  this.scriptReloadErrorFunction = function(scriptName, filePath){
    that.enableTerminal();
    if (!isDeployment){
      terminal.printError(Text.FAILED_TO_LOAD_SCRIPT.replace(
        Text.PARAM1, scriptName
      ).replace(
        Text.PARAM2, filePath
      ));
    }
  }
  this.scriptReloadCompilationErrorFunction = function(scriptName, errorMessage){
    that.enableTerminal();
    if (!isDeployment){
      terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, errorMessage).replace(Text.PARAM2, scriptName));
    }
  }
  this.enableTerminal = function(){
    canvas.style.visibility = "";
    terminal.enable();
    terminal.clear();
  }
}

ModeSwitcher.prototype.switchMode = function(){
  if (mode == 0){
    this.loadedScriptsCounter = 0;
    if (this.totalScriptsToLoad > 0){
      terminal.clear();
      if (!isDeployment){
        terminal.printInfo(Text.LOADING_SCRIPTS);
      }
      canvas.style.visibility = "hidden";
      terminal.disable();
      for (var scriptName in scripts){
        var script = scripts[scriptName];
        if (script.localFilePath){
          script.reload(
            this.scriptReloadSuccessFunction,
            this.scriptReloadErrorFunction,
            this.scriptReloadCompilationErrorFunction
          );
        }
      }
    }else{
      this.switchFromDesignToPreview();
    }
  }else if (mode == 1){
    this.switchFromPreviewToDesign();
  }
}

ModeSwitcher.prototype.commonSwitchFunctions = function(){
  if (!isDeployment){
    guiHandler.hideAll();
    if (areaConfigurationsVisible){
      guiHandler.hide(guiHandler.guiTypes.AREA);
      areaConfigurationsVisible = false;
    }
    selectionHandler.resetCurrentSelection();
  }
  var oldIsPaused = isPaused;
  isPaused = false;
  maxInactiveTime = 0;
  inactiveCounter = 0;
  particleSystemRefHeight = 0;
  GLOBAL_PS_REF_HEIGHT_UNIFORM.value = 0;
  trackingObjects = new Object();
  objectsWithOnClickListeners = new Map();
  objectsWithMouseOverListeners = new Map();
  objectsWithMouseOutListeners = new Map();
  currentMouseOverObjectName = 0;
  if (activeControl){
    activeControl.onDeactivated();
  }
  activeControl = new FreeControls({});
  rayCaster.refresh();
  physicsWorld.refresh();
  if (oldIsPaused){
    render();
  }
}

ModeSwitcher.prototype.switchFromDesignToPreview = function(){
  TOTAL_OBJECT_COLLISION_LISTENER_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COUNT = 0;
  TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS = 0;
  if (fpsWeaponAlignmentConfigurationObject){
    fpsWeaponAlignmentConfigurationObject.revertPositionAfterFPSWeaponConfigurations();
    fpsWeaponAlignmentConfigurationObject = 0;
  }
  for (var gsName in gridSystems){
    scene.remove(gridSystems[gsName].gridSystemRepresentation);
    scene.remove(gridSystems[gsName].boundingPlane);
  }
  for (var gridName in gridSelections){
    gridSelections[gridName].removeCornerHelpers();
    scene.remove(gridSelections[gridName].mesh);
    scene.remove(gridSelections[gridName].dot);
  }
  scriptsToRun = new Object();
  for (var markedPointName in markedPoints){
    markedPoints[markedPointName].hide(true);
  }
  if (areasVisible){
    for (var areaName in areas){
      areas[areaName].hide();
    }
  }
  for (var scriptName in scripts){
    var script = scripts[scriptName];
    if (script.runAutomatically){
      var script2 = new Script(scriptName, script.script);
      script2.localFilePath = script.localFilePath;
      script2.start();
      scripts[scriptName] = script2;
      script2.runAutomatically = true;
    }
  }
  for (var textName in addedTexts){
    var addedText = addedTexts[textName];
    if (addedText.bbHelper){
      scene.remove(addedText.bbHelper);
    }
    if (addedText.rectangle){
      scene.remove(addedText.rectangle.mesh);
    }
  }
  if (selectedAddedObject){
    selectedAddedObject.removeBoundingBoxesFromScene();
  }
  if (selectedObjectGroup){
    selectedObjectGroup.removeBoundingBoxesFromScene();
  }
  dynamicObjects = new Map();
  dynamicObjectGroups = new Map();
  for (var objectName in objectGroups){
    var object = objectGroups[objectName];
    object.mesh.remove(axesHelper);
    object.removeBoundingBoxesFromScene();
    if (object.binInfo){
      object.binInfo = new Map();
    }
    object.saveState();
    if (object.isDynamicObject && !object.noMass){
      dynamicObjectGroups.set(objectName, object);
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
  }
  for (var objectName in addedObjects){
    var object = addedObjects[objectName];
    object.mesh.remove(axesHelper);
    object.removeBoundingBoxesFromScene();
    if (object.binInfo){
      object.binInfo = new Map();
    }
    if (object.isDynamicObject && !object.noMass){
      dynamicObjects.set(objectName, object);
    }
    object.saveState();
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
  }
  autoInstancingHandler.handle();
  if (fogActive){
    GLOBAL_FOG_UNIFORM.value.set(fogDensity, fogColorRGB.r, fogColorRGB.g, fogColorRGB.b);
    if (fogBlendWithSkybox){
      GLOBAL_FOG_UNIFORM.value.set(
        -fogDensity,
        skyboxMesh.material.uniforms.color.value.r,
        skyboxMesh.material.uniforms.color.value.g,
        skyboxMesh.material.uniforms.color.value.b
      );
    }
    for (var objName in addedObjects){
      addedObjects[objName].setFog();
    }
    for (var objName in objectGroups){
      objectGroups[objName].setFog();
    }
    for (var textName in addedTexts){
      addedTexts[textName].setFog();
    }
    for (var objName in autoInstancedObjects){
      autoInstancedObjects[objName].setFog();
    }
  }else{
    GLOBAL_FOG_UNIFORM.value.set(-100.0, 0, 0, 0);
  }
  ROYGBIV.globals = new Object();
  $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Preview mode)");
  mode = 1;
  var that = this;
  if (!canvas.ready && !isDeployment){
    terminal.printInfo(Text.INITIALIZING_WORKERS);
  }
  rayCaster.onReadyCallback = function(){
    if (!isDeployment){
      that.enableTerminal();
      terminal.printInfo(Text.SWITCHED_TO_PREVIEW_MODE);
    }else{
      removeCLIDom();
      if (screenResolution != 1){
        canvas.style.oldPosition = canvas.style.position;
        canvas.style.position = "absolute";
      }
    }
  }
  this.commonSwitchFunctions();
  handleViewport();
  for (var txtName in addedTexts){
    addedTexts[txtName].handleResize();
    if (addedTexts[txtName].isClickable){
      if (!addedTexts[txtName].is2D){
        clickableAddedTexts[txtName] = addedTexts[txtName];
      }else{
        clickableAddedTexts2D[txtName] = addedTexts[txtName];
      }
    }
  }
}

ModeSwitcher.prototype.switchFromPreviewToDesign = function(){
  mode = 0;
  autoInstancingHandler.reset();
  var objsToRemove = [];
  for (var i = 0; i<scene.children.length; i++){
    if (scene.children[i].isFPSWeaponAutoInstancedObject){
      objsToRemove.push(scene.children[i]);
    }
  }
  for (var i = 0; i<objsToRemove.length; i++){
    scene.remove(objsToRemove[i]);
  }
  camera.oldAspect = camera.aspect;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  camera.rotation.order = 'YXZ';
  camera.rotation.set(0, 0, 0);
  screenClickCallbackFunction = 0;
  screenMouseDownCallbackFunction = 0;
  screenMouseUpCallbackFunction = 0;
  screenMouseMoveCallbackFunction = 0;
  screenPointerLockChangedCallbackFunction = 0;
  screenFullScreenChangeCallbackFunction = 0;
  screenKeydownCallbackFunction = 0;
  screenKeyupCallbackFunction = 0;
  screenDragCallbackFunction = 0;
  terminalTextInputCallbackFunction = 0;
  fpsDropCallbackFunction = 0;
  performanceDropCallbackFunction = 0;
  userInactivityCallbackFunction = 0;
  screenMouseWheelCallbackFunction = 0;
  screenPinchCallbackFunction = 0;
  fpsHandler.reset();
  pointerLockRequested = false;
  fullScreenRequested = false;
  for (var gsName in gridSystems){
    scene.add(gridSystems[gsName].gridSystemRepresentation);
    scene.add(gridSystems[gsName].boundingPlane);
  }
  for (var gridName in gridSelections){
    scene.add(gridSelections[gridName].mesh);
    scene.add(gridSelections[gridName].dot);
  }
  for (var textName in addedTexts){
    var addedText = addedTexts[textName];
    addedText.show();
    addedText.handleResize();
    delete addedText.clickCallbackFunction;
    delete addedText.mouseOverCallbackFunction;
    delete addedText.mouseOutCallbackFunction;
  }
  collisionCallbackRequests = new Map();
  particleCollisionCallbackRequests = new Object();
  particleSystemCollisionCallbackRequests = new Object();

  for (var particleSystemName in particleSystemPool){
    particleSystemPool[particleSystemName].destroy();
  }
  for (var objectName in objectTrails){
    objectTrails[objectName].destroy();
  }
  for (var mergedParticleSystemName in mergedParticleSystems){
    mergedParticleSystems[mergedParticleSystemName].destroy();
  }

  for (var crosshairName in crosshairs){
    crosshairs[crosshairName].destroy();
  }

  for (var markedPointName in markedPoints){
    if (markedPoints[markedPointName].showAgainOnTheNextModeSwitch){
      markedPoints[markedPointName].show();
      markedPoints[markedPointName].showAgainOnTheNextModeSwitch = false;
    }
  }

  if (areasVisible){
    for (var areaName in areas){
      areas[areaName].renderToScreen();
    }
  }

  particleSystems = new Object();
  particleSystemPool = new Object();
  particleSystemPools = new Object();
  objectTrails = new Object();
  mergedParticleSystems = new Object();
  crosshairs = new Object();
  selectedCrosshair = 0;

  for (var objectName in objectGroups){
    var object = objectGroups[objectName];
    object.loadState();
    object.resetColor();
    object.isUsedInFPSControl = false;
    object.physicsBody.removeEventListener("collide", object.boundCallbackFunction);
    if (object.positionThresholdExceededListenerInfo){
      object.positionThresholdExceededListenerInfo.isActive = false;
    }
    delete object.clickCallbackFunction;
    delete object.mouseOverCallbackFunction;
    delete object.mouseOutCallbackFunction;
    if (!(typeof object.originalMass == UNDEFINED)){
      object.setMass(object.originalMass);
      if (object.originalMass == 0){
        dynamicObjectGroups.delete(object.name);
      }
      delete object.originalMass;
    }
    if (object.isHidden){
      object.mesh.visible = true;
      object.isHidden = false;
      if (!object.physicsKeptWhenHidden && !object.noMass){
        physicsWorld.addBody(object.physicsBody);
      }
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
  }
  for (var objectName in addedObjects){
    var object = addedObjects[objectName];
    if (object.positionThresholdExceededListenerInfo){
      object.positionThresholdExceededListenerInfo.isActive = false;
    }
    object.isUsedInFPSControl = false;
    object.physicsBody.removeEventListener("collide", object.boundCallbackFunction);
    delete object.clickCallbackFunction;
    delete object.mouseOverCallbackFunction;
    delete object.mouseOutCallbackFunction;
    object.resetColor();
    if (object.isHidden){
      object.mesh.visible = true;
      object.isHidden = false;
      if (!object.physicsKeptWhenHidden && !object.noMass){
        physicsWorld.addBody(object.physicsBody);
      }
    }
    object.loadState();
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (!(typeof object.originalMass == UNDEFINED)){
      object.setMass(object.originalMass);
      if (object.originalMass == 0){
        dynamicObjects.delete(object.name);
      }
      delete object.originalMass;
    }
  }
  var newScripts = new Object();
  for (var scriptName in scripts){
    newScripts[scriptName] = new Script(
      scriptName,
      scripts[scriptName].script
    );
    newScripts[scriptName].runAutomatically = scripts[scriptName].runAutomatically;
    newScripts[scriptName].localFilePath = scripts[scriptName].localFilePath;
  }
  for (var scriptName in newScripts){
    scripts[scriptName] =  newScripts[scriptName];
    scripts[scriptName].runAutomatically = newScripts[scriptName].runAutomatically;
  }
  newScripts = undefined;
  GLOBAL_FOG_UNIFORM.value.set(-100.0, 0, 0, 0);
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  clickableAddedTexts = new Object();
  clickableAddedTexts2D = new Object();
  this.commonSwitchFunctions();
  for (var txtName in addedTexts){
    var text = addedTexts[txtName];
    text.restore();
    text.handleResize();
  }
  for (var objName in addedObjects){
    addedObjects[objName].removeFog();
  }
  for (var objName in objectGroups){
    objectGroups[objName].removeFog();
  }
  for (var textName in addedTexts){
    addedTexts[textName].removeFog();
  }
  if (!rayCaster.ready){
    terminal.printInfo(Text.INITIALIZING_WORKERS);
    var that = this;
    canvas.style.visibility = "hidden";
    terminal.disable();
    rayCaster.onReadyCallback = function(){
      $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode)");
      that.enableTerminal();
      canvas.style.visibility = "";
      terminal.printInfo(Text.SWITCHED_TO_DESIGN_MODE);
    }
  }
}
