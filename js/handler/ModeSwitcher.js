var ModeSwitcher = function(){
  this.loadedScriptsCounter = 0;
  this.totalScriptsToLoad = 0;
  var that = this;
  this.scriptReloadSuccessFunction = function(scriptName){
    that.loadedScriptsCounter ++;
    if (that.loadedScriptsCounter == that.totalScriptsToLoad){
      that.enableTerminal();
      that.switchFromDesignToPreview();
    }
  }
  this.scriptReloadErrorFunction = function(scriptName, filePath){
    that.enableTerminal();
    terminal.printError(Text.FAILED_TO_LOAD_SCRIPT.replace(
      Text.PARAM1, scriptName
    ).replace(
      Text.PARAM2, filePath
    ));
  }
  this.scriptReloadCompilationErrorFunction = function(scriptName, errorMessage){
    that.enableTerminal();
    terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, errorMessage).replace(Text.PARAM2, scriptName));
  }
  this.enableTerminal = function(){
    canvas.style.visibility = "";
    terminal.enable();
    terminal.clear();
  }
}

ModeSwitcher.prototype.switchMode = function(){
  lastFPS = 0;
  if (mode == 0){
    this.loadedScriptsCounter = 0;
    if (this.totalScriptsToLoad > 0){
      terminal.clear();
      terminal.printInfo(Text.LOADING_SCRIPTS);
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
  trackingObjects = new Object();
  defaultCameraControlsDisabled = false;
  initBadTV();
  rayCaster.refresh();
}

ModeSwitcher.prototype.switchFromDesignToPreview = function(){
  TOTAL_OBJECT_COLLISION_LISTENER_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COUNT = 0;
  TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS = 0;
  originalBloomConfigurations.bloomStrength = bloomStrength;
  originalBloomConfigurations.bloomRadius = bloomRadius;
  originalBloomConfigurations.bloomThreshold = bloomThreshold;
  originalBloomConfigurations.bloomResolutionScale = bloomResolutionScale;
  originalBloomConfigurations.bloomOn = bloomOn;
  postprocessingParameters["Bloom_strength"] = bloomStrength;
  postprocessingParameters["Bloom_radius"] = bloomRadius;
  postprocessingParameters["Bloom_threshhold"] = bloomThreshold;
  postprocessingParameters["Bloom_resolution_scale"] = bloomResolutionScale;
  postprocessingParameters["Bloom"] = bloomOn;
  for (var gsName in gridSystems){
    scene.remove(gridSystems[gsName].gridSystemRepresentation);
    scene.remove(gridSystems[gsName].boundingPlane);
  }
  for (var gridName in gridSelections){
    scene.remove(gridSelections[gridName].mesh);
    scene.remove(gridSelections[gridName].dot);
  }
  scriptsToRun = new Object();
  for (var gridName in gridSelections){
    var grid = gridSelections[gridName];
    if (grid.divs){
      for (var i = 0; i<grid.divs.length; i++){
        grid.divs[i].style.visibility = "hidden";
      }
    }
  }
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
  dynamicObjects = new Object();
  dynamicObjectGroups = new Object();
  for (var objectName in objectGroups){
    var object = objectGroups[objectName];
    object.mesh.remove(axesHelper);
    if (object.binInfo){
      object.binInfo = new Map();
    }
    object.saveState();
    if (object.isDynamicObject && !object.noMass){
      dynamicObjectGroups[objectName] = object;
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.initAOIntensitySet){
      object.mesh.material.uniforms.totalAOIntensity.value = object.initAOIntensity;
      object.initAOIntensitySet = false;
    }
    if (object.initEmissiveIntensitySet){
      object.mesh.material.uniforms.totalEmissiveIntensity.value = object.initEmissiveIntensity;
      object.initEmissiveIntensitySet = false;
    }
    if (object.initEmissiveColorSet){
      object.mesh.material.uniforms.totalEmissiveColor.value.set("#"+object.initEmissiveColor);
      object.initEmissiveColorSet = false;
    }
  }
  for (var objectName in addedObjects){
    var object = addedObjects[objectName];
    object.mesh.remove(axesHelper);
    if (object.binInfo){
      object.binInfo = new Map();
    }
    if (object.isDynamicObject && !object.noMass){
      dynamicObjects[objectName] = object;
    }
    object.saveState();
    if (object.hasDiffuseMap()){
      if (object.mesh.material.uniforms.diffuseMap.value.initOffsetXSet){
        object.mesh.material.uniforms.diffuseMap.value.offset.x = object.mesh.material.uniforms.diffuseMap.value.initOffsetX;
        object.mesh.material.uniforms.diffuseMap.value.updateMatrix();
        object.mesh.material.uniforms.diffuseMap.value.initOffsetXSet = false;
      }
      if (object.mesh.material.uniforms.diffuseMap.value.initOffsetYSet){
        object.mesh.material.uniforms.diffuseMap.value.offset.y = object.mesh.material.uniforms.diffuseMap.value.initOffsetY;
        object.mesh.material.uniforms.diffuseMap.value.updateMatrix();
        object.mesh.material.uniforms.diffuseMap.value.initOffsetYSet = false;
      }
    }
    if (object.hasDisplacementMap()){
      if (object.initDisplacementScaleSet){
        object.mesh.material.uniforms.displacementInfo.value.x = object.initDisplacementScale;
        object.initDisplacementScaleSet = false;
      }
      if (object.initDisplacementBiasSet){
        object.mesh.material.uniforms.displacementInfo.value.y = object.initDisplacementBias;
        object.initDisplacementBiasSet = false;
      }
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.initEmissiveIntensitySet){
      object.mesh.material.uniforms.emissiveIntensity.value = object.initEmissiveIntensity;
      object.initEmissiveIntensitySet = false;
    }
    if (object.initAOIntensitySet){
      object.mesh.material.uniforms.aoIntensity.value = object.initAOIntensity;
      object.initAOIntensitySet = false;
    }
    if (object.initEmissiveColorSet){
      object.mesh.material.uniforms.emissiveColor.value.set("#"+object.initEmissiveColor);
      object.initEmissiveColorSet = false;
    }
    if (object.material.isMeshPhongMaterial){
      if (object.initShininessSet){
        object.material.shininess = object.initShininess;
        object.material.needsUpdate = true;
        object.initShininessSet = false;
      }
    }
  }
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
  }else{
    GLOBAL_FOG_UNIFORM.value.set(-100.0, 0, 0, 0);
  }
  ROYGBIV.globals = new Object();
  if (!isDeployment){
    $(datGuiObjectManipulation.domElement).attr("hidden", true);
  }
  terminal.printInfo(Text.SWITCHED_TO_PREVIEW_MODE);
  $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Preview mode)");
  mode = 1;
  rayCaster.refresh();
  handleViewport();
  this.commonSwitchFunctions();
}

ModeSwitcher.prototype.switchFromPreviewToDesign = function(){
  mode = 0;
  if (!isDeployment){
    $(datGui.domElement).attr("hidden", true);
    $(datGuiObjectManipulation.domElement).attr("hidden", true);
    $(datGuiFog.domElement).attr("hidden", true);
    fogConfigurationsVisible = false;
  }
  terminal.printInfo(Text.SWITCHED_TO_DESIGN_MODE);
  $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode)");
  if (LOG_FRAME_DROP_ON){
    console.log("[*] Frame-drop recording process stopped.");
    LOG_FRAME_DROP_ON = false;
  }
  bloomStrength = originalBloomConfigurations.bloomStrength;
  bloomRadius = originalBloomConfigurations.bloomRadius;
  bloomThreshold = originalBloomConfigurations.bloomThreshold;
  bloomResolutionScale = originalBloomConfigurations.bloomResolutionScale;
  bloomOn = originalBloomConfigurations.bloomOn;
  originalBloomConfigurations = new Object();
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  camera.rotation.order = 'YXZ';
  camera.rotation.set(0, 0, 0);
  screenClickCallbackFunction = 0;
  screenMouseDownCallbackFunction = 0;
  screenMouseUpCallbackFunction = 0;
  screenMouseMoveCallbackFunction = 0;
  screenPointerLockChangedCallbackFunction = 0;
  screenFullScreenChangeCallbackFunction = 0;
  terminalTextInputCallbackFunction = 0;
  fpsDropCallbackFunction = 0;
  performanceDropCallbackFunction = 0;
  performanceDropMinFPS = 0;
  performanceDropSeconds = 0;
  performanceDropCounter = 0;
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
  collisionCallbackRequests = new Object();
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

    delete object.clickCallbackFunction;

    if (!(typeof object.originalMass == "undefined")){
      object.setMass(object.originalMass);
      if (object.originalMass == 0){
        delete dynamicObjectGroups[object.name];
      }
      delete object.originalMass;
    }

    if (object.isHidden){
      object.mesh.visible = true;
      object.isHidden = false;
      if (!object.physicsKeptWhenHidden && !object.noMass){
        physicsWorld.add(object.physicsBody);
      }
    }

    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.initAOIntensitySet){
      object.mesh.material.uniforms.totalAOIntensity.value = object.initAOIntensity;
      object.initAOIntensitySet = false;
    }
    if (object.initEmissiveIntensitySet){
      object.mesh.material.uniforms.totalEmissiveIntensity.value = object.initEmissiveIntensity;
      object.initEmissiveIntensitySet = false;
    }
    if (object.initEmissiveColorSet){
      object.mesh.material.uniforms.totalEmissiveColor.value.set("#"+object.initEmissiveColor);
      object.initEmissiveColorSet = false;
    }
  }
  for (var objectName in addedObjects){
    var object = addedObjects[objectName];

    delete object.clickCallbackFunction;

    object.resetColor();

    if (object.texturePackSetWithScript){
      object.texturePackSetWithScript = false;
      object.resetTexturePackAfterAnimation();
    }

    if (object.isHidden){
      object.mesh.visible = true;
      object.isHidden = false;
      if (!object.physicsKeptWhenHidden && !object.noMass){
        physicsWorld.add(object.physicsBody);
      }
    }

    object.loadState();

    if (object.hasDiffuseMap()){
      if (object.mesh.material.uniforms.diffuseMap.value.initOffsetXSet){
        object.mesh.material.uniforms.diffuseMap.value.offset.x = object.mesh.material.uniforms.diffuseMap.value.initOffsetX;
        object.mesh.material.uniforms.diffuseMap.value.updateMatrix();
        object.mesh.material.uniforms.diffuseMap.value.initOffsetXSet = false;
      }
      if (object.mesh.material.uniforms.diffuseMap.value.initOffsetYSet){
        object.mesh.material.uniforms.diffuseMap.value.offset.y = object.mesh.material.uniforms.diffuseMap.value.initOffsetY;
        object.mesh.material.uniforms.diffuseMap.value.updateMatrix();
        object.mesh.material.uniforms.diffuseMap.value.initOffsetYSet = false;
      }
    }
    if (object.hasDisplacementMap()){
      if (object.initDisplacementScaleSet){
        object.mesh.material.uniforms.displacementInfo.value.x = object.initDisplacementScale;
        object.initDisplacementScaleSet = false;
      }
      if (object.initDisplacementBiasSet){
        object.mesh.material.uniforms.displacementInfo.value.y = object.initDisplacementBias;
        object.initDisplacementBiasSet = false;
      }
    }
    if (object.initOpacitySet){
      object.updateOpacity(object.initOpacity);
      object.initOpacitySet = false;
    }
    if (object.initAOIntensitySet){
      object.mesh.material.uniforms.aoIntensity.value = object.initAOIntensity;
      object.initAOIntensitySet = false;
    }
    if (object.initEmissiveIntensitySet){
      object.mesh.material.uniforms.emissiveIntensity.value = object.initEmissiveIntensity;
      object.initEmissiveIntensitySet = false;
    }
    if (object.initEmissiveColorSet){
      object.mesh.material.uniforms.emissiveColor.value.set("#"+object.initEmissiveColor);
      object.initEmissiveColorSet = false;
    }
    if (!(typeof object.originalMass == "undefined")){
      object.setMass(object.originalMass);
      if (object.originalMass == 0){
        delete dynamicObjects[object.name];
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
  renderer.setViewport(0, 0, canvas.width, canvas.height);
  this.commonSwitchFunctions();
}
