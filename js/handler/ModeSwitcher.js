var ModeSwitcher = function(){
  this.loadedScriptsCounter = 0;
  var that = this;
  this.scriptReloadSuccessFunction = function(scriptName){
    that.loadedScriptsCounter ++;
    if (that.loadedScriptsCounter == that.totalScriptsToLoad){
      canvas.style.visibility = "";
      if (!isDeployment){
        terminal.enable();
      }
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
    this.totalScriptsToLoad = scriptsHandler.getTotalScriptsToLoadCount();
    if (this.totalScriptsToLoad > 0){
      terminal.clear();
      terminal.printInfo(Text.LOADING_SCRIPTS);
      canvas.style.visibility = "hidden";
      terminal.disable();
      scriptsHandler.loadScripts(this.scriptReloadSuccessFunction, this.scriptReloadErrorFunction, this.scriptReloadCompilationErrorFunction);
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
  objectsWithOnClickListeners = new Map();
  objectsWithMouseOverListeners = new Map();
  objectsWithMouseMoveListeners = new Map();
  objectsWithMouseOutListeners = new Map();
  currentMouseOverObjectName = 0;
  draggingSprite = false;
  dragCandidate = false;
  if (activeControl){
    activeControl.onDeactivated();
  }
  activeControl = new FreeControls({});
  raycasterFactory.refresh();
  physicsFactory.refresh();
  if (oldIsPaused){
    render();
  }
}

ModeSwitcher.prototype.switchFromDesignToPreview = function(){
  steeringHandler.onModeSwitch();
  TOTAL_OBJECT_COLLISION_LISTENER_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COUNT = 0;
  TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
  if (particleSystemRefHeight){
    GLOBAL_PS_REF_HEIGHT_UNIFORM.value = ((renderer.getCurrentViewport().w / screenResolution) / particleSystemRefHeight);
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
  for (var containerName in containers){
    containers[containerName].makeInvisible();
    if (containers[containerName].hasBorder){
      containers[containerName].originalBorderColor = containers[containerName].borderColor;
    }
  }
  scriptsToRun = new Map();
  scriptsHandler.onModeSwitch();
  for (var markedPointName in sceneHandler.getMarkedPoints()){
    markedPoints[markedPointName].hide(true);
  }
  if (areasVisible){
    for (var areaName in sceneHandler.getAreas()){
      areas[areaName].hide();
    }
  }
  for (var textName in addedTexts){
    var addedText = addedTexts[textName];
    if (addedText.is2D){
      addedText.originalMarginX = addedText.marginPercentWidth;
      addedText.originalMarginY = addedText.marginPercentHeight;
    }
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
  lightningHandler.onSwitchToPreviewMode();
  dynamicObjects = new Map();
  dynamicObjectGroups = new Map();
  activeMuzzleFlashes = new Map();
  activeLightnings = new Map();
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
      sceneHandler.onDynamicObjectAddition(object);

      object.oldPX = object.physicsBody.position.x;
      object.oldPY = object.physicsBody.position.y;
      object.oldPz = object.physicsBody.position.z;
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.objectTrailConfigurations){
      new ObjectTrail({object: object, alpha: object.objectTrailConfigurations.alpha, maxTimeInSeconds: object.objectTrailConfigurations.time});
    }
    if (object.steerableInfo){
      object.constructedSteeringBehaviors = {};
      for (var behaviorID in object.steerableInfo.behaviorsByID){
        var constructedBehavior = object.steerableInfo.behaviorsByID[behaviorID].getBehavior(object);
        object.constructedSteeringBehaviors[behaviorID] = constructedBehavior;
      }

      object.pathFinishListenerIDsBySteerableName = {};

      object.steerable.lookDirection.set(0, 0, 1);
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
      sceneHandler.onDynamicObjectAddition(object);

      object.oldPX = object.physicsBody.position.x;
      object.oldPY = object.physicsBody.position.y;
      object.oldPz = object.physicsBody.position.z;
    }
    object.saveState();
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.objectTrailConfigurations){
      new ObjectTrail({object: object, alpha: object.objectTrailConfigurations.alpha, maxTimeInSeconds: object.objectTrailConfigurations.time});
    }
    if (object.steerableInfo){
      object.constructedSteeringBehaviors = {};
      for (var behaviorID in object.steerableInfo.behaviorsByID){
        var constructedBehavior = object.steerableInfo.behaviorsByID[behaviorID].getBehavior(object);
        object.constructedSteeringBehaviors[behaviorID] = constructedBehavior;
      }

      object.pathFinishListenerIDsBySteerableName = {};

      object.steerable.lookDirection.set(0, 0, 1);
    }
  }
  autoInstancingHandler.handle();
  fogHandler.onFromDesignToPreview();
  TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COUNT = 0;
  particleCollisionCallbackRequests = new Object();
  ROYGBIV.globals = new Object();
  if (!isDeployment){
    $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Preview mode)");
  }
  mode = 1;
  particleSystemGenerator.handleModeSwitch();
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
  for (var txtName in addedTexts){
    addedTexts[txtName].handleResize();
    if (addedTexts[txtName].isClickable){
      if (!addedTexts[txtName].is2D){
        clickableAddedTexts[txtName] = addedTexts[txtName];
        sceneHandler.onClickableAddedTextAddition(addedTexts[txtName]);
      }else{
        clickableAddedTexts2D[txtName] = addedTexts[txtName];
        sceneHandler.onClickableAddedText2DAddition(addedTexts[txtName]);
      }
    }
  }
  for (var spriteName in sprites){
    sprites[spriteName].originalTextureInfo = {
      isTextured: sprites[spriteName].isTextured,
      mappedTexturePackName: sprites[spriteName].mappedTexturePackName
    };
    sprites[spriteName].originalSizeInfo = {
      x: sprites[spriteName].mesh.material.uniforms.scale.value.x,
      y: sprites[spriteName].mesh.material.uniforms.scale.value.y
    };
    if (sprites[spriteName].isClickable){
      clickableSprites[spriteName] = sprites[spriteName];
      sceneHandler.onClickableSpriteAddition(sprites[spriteName]);
      if (sprites[spriteName].isDraggable){
        sceneHandler.setDraggableSprite(sprites[spriteName]);
      }
    }
    sprites[spriteName].originalMargin = {
      x: sprites[spriteName].marginPercentX,
      y: sprites[spriteName].marginPercentY
    };
    sprites[spriteName].originalRotation = sprites[spriteName].mesh.material.uniforms.rotationAngle.value;
    sprites[spriteName].originalColor = sprites[spriteName].mesh.material.uniforms.color.value.getHex();
    sprites[spriteName].originalAlpha = sprites[spriteName].mesh.material.uniforms.alpha.value;
  }
  for (var containerName in containers){
    if (containers[containerName].isClickable){
      clickableContainers[containerName] = containers[containerName];
      sceneHandler.onClickableContainerAddition(containers[containerName]);
    }
  }
  lightHandler.onSwitchFromDesignToPreview();
  sceneHandler.onSwitchFromDesignToPreview();
  this.commonSwitchFunctions();
  handleViewport();
  renderer.setPixelRatio(screenResolution);
}

ModeSwitcher.prototype.switchFromPreviewToDesign = function(){
  try {
    Rhubarb.destroy();
  } catch(err) {}

  history.replaceState(null, null, ' ');

  if (inputText){
    inputText.deactivateInputMode();
  }

  steeringHandler.onModeSwitch();

  mode = 0;
  autoInstancingHandler.reset();
  var objsToRemove = [];
  for (var i = 0; i<scene.children.length; i++){
    if (scene.children[i].isFPSWeaponAutoInstancedObject){
      objsToRemove.push(scene.children[i]);
    }
  }
  for (var path in dynamicallyLoadedTextures){
    dynamicallyLoadedTextures[path].destroy();
  }
  dynamicallyLoadedTextures = new Object();
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
  screenOrientationChangeCallbackFunction = 0;
  hashChangeCallbackFunction = 0;
  fpsHandler.reset();
  pointerLockRequested = false;
  fullScreenRequested = false;
  activeVirtualKeyboard = 0;
  inputText = 0;
  for (var vkName in virtualKeyboards){
    delete virtualKeyboards[vkName].onTextChangeCallback;
    delete virtualKeyboards[vkName].onFlushCallback;
  }
  for (var lightningName in lightnings){
    lightnings[lightningName].stop();
  }
  for (var gsName in gridSystems){
    scene.add(gridSystems[gsName].gridSystemRepresentation);
    scene.add(gridSystems[gsName].boundingPlane);
  }
  for (var gridName in gridSelections){
    scene.add(gridSelections[gridName].mesh);
    scene.add(gridSelections[gridName].dot);
  }
  for (var containerName in containers){
    containers[containerName].rectangle.mesh.visible = true;
    if (containers[containerName].hasBorder){
      containers[containerName].setBorder(containers[containerName].originalBorderColor, containers[containerName].borderThickness);
      delete containers[containerName].originalBorderColor;
    }
    containers[containerName].makeVisible();
    delete containers[containerName].onClickCallback;
    delete containers[containerName].mouseOverCallbackFunction;
    delete containers[containerName].mouseOutCallbackFunction;
    if (containers[containerName].hasBackground){
      containers[containerName].setBackground(containers[containerName].backgroundColor, containers[containerName].backgroundAlpha, containers[containerName].backgroundTextureName);
      containers[containerName].backgroundSprite.mesh.visible = true;
    }
  }
  for (var textName in sceneHandler.getAddedTexts()){
    var addedText = addedTexts[textName];
    for (var animationName in addedText.animations){
      animationHandler.forceFinish(addedText.animations[animationName]);
      addedText.animations[animationName].finishCallbackFunction = 0;
    }
    addedText.show();
    addedText.handleResize();
    delete addedText.clickCallbackFunction;
    delete addedText.mouseOverCallbackFunction;
    delete addedText.mouseOutCallbackFunction;
  }
  for (var spriteName in sprites){
    if (sprites[spriteName].originalTextureInfo.isTextured){
      sprites[spriteName].mapTexture(texturePacks[sprites[spriteName].originalTextureInfo.mappedTexturePackName]);
    }else{
      sprites[spriteName].removeTexture();
    }
    sprites[spriteName].setScale(sprites[spriteName].originalSizeInfo.x, sprites[spriteName].originalSizeInfo.y);
    delete sprites[spriteName].originalSizeInfo;
    delete sprites[spriteName].originalTextureInfo;
    delete sprites[spriteName].onClickCallback;
    delete sprites[spriteName].mouseOverCallbackFunction;
    delete sprites[spriteName].mouseOutCallbackFunction;
    delete sprites[spriteName].dragStartCallback;
    delete sprites[spriteName].dragStopCallback;
    delete sprites[spriteName].draggingCallback;
    delete sprites[spriteName].draggingDisabled;
    for (var animationName in sprites[spriteName].animations){
      animationHandler.forceFinish(sprites[spriteName].animations[animationName]);
      sprites[spriteName].animations[animationName].finishCallbackFunction = 0;
    }
    sprites[spriteName].set2DCoordinates(sprites[spriteName].originalMargin.x, sprites[spriteName].originalMargin.y);
    delete sprites[spriteName].originalMargin;
    sprites[spriteName].setRotation(sprites[spriteName].originalRotation);
    delete sprites[spriteName].originalRotation;
    sprites[spriteName].setColor(sprites[spriteName].originalColor);
    delete sprites[spriteName].originalColor;
    sprites[spriteName].setAlpha(sprites[spriteName].originalAlpha);
    delete sprites[spriteName].originalAlpha;
  }
  collisionCallbackRequests = new Map();
  particleCollisionCallbackRequests = new Object();
  particleSystemCollisionCallbackRequests = new Object();
  areaEnterCallbacks = new Object();
  areaExitCallbacks = new Object();

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

  for (var markedPointName in sceneHandler.getMarkedPoints()){
    if (markedPoints[markedPointName].showAgainOnTheNextModeSwitch){
      markedPoints[markedPointName].show();
      markedPoints[markedPointName].showAgainOnTheNextModeSwitch = false;
    }
  }

  if (areasVisible){
    for (var areaName in sceneHandler.getAreas()){
      areas[areaName].renderToScreen();
    }
  }

  particleSystems = new Map();
  particleSystemPool = new Object();
  particleSystemPools = new Object();
  objectTrails = new Object();
  activeObjectTrails = new Map();
  mergedParticleSystems = new Object();
  selectedCrosshair = 0;

  delayedExecutionHandler.reset();

  for (var objectName in objectGroups){
    var object = objectGroups[objectName];
    for (var animationName in object.animations){
      animationHandler.forceFinish(object.animations[animationName]);
      object.animations[animationName].finishCallbackFunction = 0;
    }
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
    delete object.positionChangeCallbackFunction;

    delete object.dx;
    delete object.dy;
    delete object.dz;

    object.oldPX = 0;
    object.oldPY = 0;
    object.oldPZ = 0;

    if (object.trackedObject){
      object.untrackObjectPosition();
    }

    if (!(typeof object.originalMass == UNDEFINED)){
      object.setMass(object.originalMass);
      if (object.originalMass == 0){
        dynamicObjectGroups.delete(object.name);
        sceneHandler.onDynamicObjectDeletion(object);
      }
      delete object.originalMass;
    }
    if (object.isHidden){
      object.mesh.visible = true;
      object.isHidden = false;
      if (!object.physicsKeptWhenHidden && !object.noMass){
        physicsWorld.addBody(object.physicsBody);
      }
      steeringHandler.show(object);
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.steerable){

      for (var behaviorName in object.pathFinishListenerIDsBySteerableName){
        var behavior = object.constructedSteeringBehaviors[behaviorName];
        var listenerID = object.pathFinishListenerIDsBySteerableName[behaviorName];

        behavior.path.removeFinishCallback(listenerID);
      }

      delete object.pathFinishListenerIDsBySteerableName;

      object.steerable.cancelJump();
      object.steerable.jumpCompletionCallback = null;
      object.steerable.velocity.set(0, 0, 0);
      object.steerable.unsetTargetPosition();
      object.steerable.unsetTargetEntity();
      object.steerable.unsetHideTargetEntity();

      object.steerable.lookDirection.set(0, 0, 1);
    }
    steeringHandler.updateObject(object);
    delete object.constructedSteeringBehaviors;
  }
  for (var objectName in addedObjects){
    var object = addedObjects[objectName];
    for (var animationName in object.animations){
      animationHandler.forceFinish(object.animations[animationName]);
      object.animations[animationName].finishCallbackFunction = 0;
    }
    if (object.positionThresholdExceededListenerInfo){
      object.positionThresholdExceededListenerInfo.isActive = false;
    }
    object.isUsedInFPSControl = false;
    object.physicsBody.removeEventListener("collide", object.boundCallbackFunction);
    delete object.clickCallbackFunction;
    delete object.mouseOverCallbackFunction;
    delete object.mouseOutCallbackFunction;
    delete object.positionChangeCallbackFunction;

    delete object.dx;
    delete object.dy;
    delete object.dz;

    object.oldPX = 0;
    object.oldPY = 0;
    object.oldPZ = 0;

    if (object.trackedObject){
      object.untrackObjectPosition();
    }

    object.resetColor();
    if (object.isHidden){
      object.mesh.visible = true;
      object.isHidden = false;
      if (!object.physicsKeptWhenHidden && !object.noMass){
        physicsWorld.addBody(object.physicsBody);
      }
      steeringHandler.show(object);
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
        sceneHandler.onDynamicObjectDeletion(object);
      }
      delete object.originalMass;
    }
    if (object.steerable){

      for (var behaviorName in object.pathFinishListenerIDsBySteerableName){
        var behavior = object.constructedSteeringBehaviors[behaviorName];
        var listenerID = object.pathFinishListenerIDsBySteerableName[behaviorName];

        behavior.path.removeFinishCallback(listenerID);
      }

      delete object.pathFinishListenerIDsBySteerableName;

      object.steerable.cancelJump();
      object.steerable.jumpCompletionCallback = null;
      object.steerable.velocity.set(0, 0, 0);
      object.steerable.unsetTargetPosition();
      object.steerable.unsetTargetEntity();
      object.steerable.unsetHideTargetEntity();

      object.steerable.lookDirection.set(0, 0, 1);
    }
    steeringHandler.updateObject(object);
    delete object.constructedSteeringBehaviors;
  }

  for (var sceneName in sceneHandler.scenes){
    delete sceneHandler.scenes[sceneName].beforeExitCallback;
  }

  fogHandler.onFromPreviewToDesign();
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  clickableAddedTexts = new Object();
  clickableAddedTexts2D = new Object();
  clickableSprites = new Object();
  clickableContainers = new Object();
  sceneHandler.onSwitchFromPreviewToDesign();
  this.commonSwitchFunctions();
  for (var txtName in addedTexts){
    var text = addedTexts[txtName];
    text.restore();
    text.handleResize();
  }
  if (!rayCaster.ready){
    terminal.printInfo(Text.INITIALIZING_WORKERS);
    var that = this;
    canvas.style.visibility = "hidden";
    terminal.disable();
    rayCaster.onReadyCallback = function(){
      if (!isDeployment){
        $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode - "+sceneHandler.getActiveSceneName()+")");
      }
      that.enableTerminal();
      canvas.style.visibility = "";
      terminal.printInfo(Text.SWITCHED_TO_DESIGN_MODE);
    }
  }else if (!isDeployment){
    terminal.printInfo(Text.SWITCHED_TO_DESIGN_MODE);
  }

  lightHandler.onSwitchFromPreviewToDesign();
  renderer.setPixelRatio(screenResolution);
}
