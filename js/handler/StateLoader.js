var StateLoader = function(stateObj){
  this.stateObj = stateObj;
  this.reason = "";
  this.totalLoadedTextureCount = 0;
  this.totalLoadedTexturePackCount = 0;
  this.totalLoadedSkyboxCount = 0;
  this.totalLoadedFontCount = 0;
  this.importHandler = new ImportHandler();
}

StateLoader.prototype.onTextureAtlasLoaded = function(){
  this.textureAtlasReady = true;
  this.finalize();
}

StateLoader.prototype.onSkyboxLoaded = function(){
  this.totalLoadedSkyboxCount ++;
  this.finalize();
}

StateLoader.prototype.onTexturePackLoaded = function(){
  this.totalLoadedTexturePackCount ++;
  if (this.totalLoadedTexturePackCount == this.stateObj.totalTexturePackCount){
    this.importHandler.importTextureAtlas(this.stateObj, this.onTextureAtlasLoaded.bind(this));
  }
  this.finalize();
}

StateLoader.prototype.load = function(){
  try{
    projectLoaded = false;
    this.resetProject();
    var obj = this.stateObj;
    this.hasTexturePacks = this.stateObj.totalTexturePackCount > 0;
    this.hasTextureAtlas = this.stateObj.textureAtlas? this.stateObj.textureAtlas.hasTextureAtlas: false;
    this.hasSkyboxes = this.stateObj.totalSkyboxCount > 0;
    this.textureAtlasReady = false;

    this.importHandler.importEngineVariables(obj);
    this.importHandler.importGridSystems(obj);
    this.importHandler.importMaterials(obj);
    this.importHandler.importParticleSystems(obj);
    this.importHandler.importAreas(obj);
    this.importHandler.importScripts(obj);
    this.importHandler.importFog(obj);
    this.importHandler.importAddedObjects(obj);
    this.importHandler.importTexturePacks(obj, this.onTexturePackLoaded.bind(this));
    this.importHandler.importSkyboxes(obj, this.onSkyboxLoaded.bind(this));

    // FONTS *******************************************************
    this.hasFonts = false;
    var that = this;
    for (var fontName in obj.fonts){
      this.hasFonts = true;
      var curFontExport = obj.fonts[fontName];
      var font = new Font(curFontExport.name, curFontExport.path, function(fontInstance){
        fonts[fontInstance.name] = fontInstance;
        that.totalLoadedFontCount ++;
        that.finalize();
      }, function(fontName){
        console.error("Error loading font: "+fontName);
        terminal.printError("Error loading font: "+fontName);
      });
      font.load();
    }
    if (!this.hasTexturePacks && !this.hasSkyboxes && !this.hasFonts && !this.hasTextureAtlas){
      this.finalize();
    }
    return true;
  }catch (err){
    projectLoaded = true;
    throw err;
    this.reason = err;
    return false;
  }
}

StateLoader.prototype.finalize = function(){
  var obj = this.stateObj;
  if ((this.hasTextureAtlas && !this.textureAtlasReady) ||
      parseInt(this.totalLoadedTexturePackCount) < parseInt(this.stateObj.totalTexturePackCount) ||
        parseInt(this.totalLoadedSkyboxCount) < parseInt(obj.totalSkyboxCount) ||
          parseInt(this.totalLoadedFontCount) < parseInt(obj.totalFontCount)){
      return;
  }

  // ADDED TEXTS ***************************************************
  for (var textName in obj.texts){
    var curTextExport = obj.texts[textName];
    var addedTextInstance = new AddedText(
      textName, fonts[curTextExport.fontName], curTextExport.text,
      new THREE.Vector3(curTextExport.positionX, curTextExport.positionY, curTextExport.positionZ),
      new THREE.Color(curTextExport.colorR, curTextExport.colorG, curTextExport.colorB),
      curTextExport.alpha, curTextExport.charSize, curTextExport.strlen
    );
    addedTextInstance.isClickable = curTextExport.isClickable;
    addedTextInstance.setAffectedByFog(curTextExport.isAffectedByFog);
    if (curTextExport.hasBackground){
      addedTextInstance.setBackground(
        "#" + new THREE.Color(curTextExport.backgroundColorR, curTextExport.backgroundColorG, curTextExport.backgroundColorB).getHexString(),
        curTextExport.backgroundAlpha
      );
    }
    addedTextInstance.setMarginBetweenChars(curTextExport.offsetBetweenChars);
    addedTextInstance.setMarginBetweenLines(curTextExport.offsetBetweenLines);
    addedTextInstance.refCharSize = curTextExport.refCharSize;
    addedTextInstance.refInnerHeight = curTextExport.refInnerHeight;
    if (!(typeof curTextExport.refCharOffset == UNDEFINED)){
      addedTextInstance.refCharOffset = curTextExport.refCharOffset;
    }
    if (!(typeof curTextExport.refLineOffset == UNDEFINED)){
      addedTextInstance.refLineOffset = curTextExport.refLineOffset;
    }
    addedTextInstance.handleBoundingBox();
    addedTextInstance.gsName = curTextExport.gsName;
    addedTextInstance.is2D = curTextExport.is2D;
    if (addedTextInstance.is2D){
      macroHandler.injectMacro("IS_TWO_DIMENSIONAL", addedTextInstance.material, true, false);
    }
    if (!(typeof curTextExport.marginMode == UNDEFINED)){
      addedTextInstance.marginMode = curTextExport.marginMode;
      addedTextInstance.marginPercentWidth = curTextExport.marginPercentWidth;
      addedTextInstance.marginPercentHeight = curTextExport.marginPercentHeight;
      if (addedTextInstance.is2D){
          addedTextInstance.set2DCoordinates(addedTextInstance.marginPercentWidth,addedTextInstance.marginPercentHeight);
      }
    }
    addedTextInstance.maxWidthPercent = curTextExport.maxWidthPercent;
    addedTextInstance.maxHeightPercent = curTextExport.maxHeightPercent;
    var gridSystem = gridSystems[addedTextInstance.gsName];
    if (gridSystem){
      for (var gridName in curTextExport.destroyedGrids){
        var gridExport = curTextExport.destroyedGrids[gridName];
        var grid = gridSystem.getGridByColRow(gridExport.colNumber, gridExport.rowNumber);
        if (grid){
          addedTextInstance.destroyedGrids[gridName] = grid;
          grid.createdAddedTextName = addedTextInstance.name;
        }
      }
    }
    addedTexts[textName] = addedTextInstance;
    addedTextInstance.handleResize();
    if (addedTextInstance.is2D){
      addedTexts2D[addedTextInstance.name] = addedTextInstance;
    }
    if (curTextExport.hasCustomPrecision){
      addedTextInstance.useCustomShaderPrecision(curTextExport.customPrecision);
    }
  }

  // ADDED OBJECTS EMISSIVE INTENSITY, EMISSIVE COLOR, AO INTENSITY, TEXTURE PROPERTIES
  for (var objName in addedObjects){
    var addedObject = addedObjects[objName];
    if (addedObject.setTxtMatrix && addedObject.mesh.material.uniforms.textureMatrix){
      for (var ix = 0; ix<addedObject.setTxtMatrix.length; ix++){
        addedObject.mesh.material.uniforms.textureMatrix.value.elements[ix] = addedObject.setTxtMatrix[ix];
      }
      delete addedObject.setTxtMatrix;
    }
    if (addedObject.hasEmissiveMap()){
      if (!(typeof addedObject.setEmissiveIntensity == UNDEFINED)){
        addedObject.mesh.material.uniforms.emissiveIntensity.value = addedObject.setEmissiveIntensity;
        delete addedObject.setEmissiveIntensity;
      }
      if (!(typeof addedObject.setEmissiveColor == UNDEFINED)){
        addedObject.mesh.material.uniforms.emissiveColor.value.set(addedObject.setEmissiveColor);
        delete addedObject.setEmissiveColor;
      }
    }
    if (addedObject.hasAOMap()){
      if (!(typeof addedObject.setAOIntensity == UNDEFINED)){
        addedObject.mesh.material.uniforms.aoIntensity.value = addedObject.setAOIntensity;
        delete addedObject.setAOIntensity;
      }
    }
  }

  // OBJECT GROUPS *************************************************
  for (var objectName in obj.objectGroups){
    var curObjectGroupExport = obj.objectGroups[objectName];
    var group = new Object();
    for (var name in curObjectGroupExport.group){
      group[name] = addedObjects[name];
    }
    var objectGroupInstance = new ObjectGroup(objectName, group);
    objectGroups[objectName] = objectGroupInstance;
    if (curObjectGroupExport.isRotationDirty){
      objectGroupInstance.isRotationDirty = true;
    }
    objectGroupInstance.glue();
    if (curObjectGroupExport.mass){
      objectGroupInstance.setMass(curObjectGroupExport.mass);
    }
    objectGroupInstance.initQuaternion = new THREE.Quaternion(
      curObjectGroupExport.quaternionX, curObjectGroupExport.quaternionY,
      curObjectGroupExport.quaternionZ, curObjectGroupExport.quaternionW
    );
    objectGroupInstance.mesh.quaternion.copy(objectGroupInstance.initQuaternion.clone());
    objectGroupInstance.graphicsGroup.quaternion.copy(objectGroupInstance.initQuaternion.clone());
    objectGroupInstance.physicsBody.quaternion.copy(objectGroupInstance.graphicsGroup.quaternion);
    objectGroupInstance.physicsBody.initQuaternion = new CANNON.Quaternion().copy(
      objectGroupInstance.graphicsGroup.quaternion
    );

    var isDynamicObject = false;
    if (curObjectGroupExport.isDynamicObject){
      isDynamicObject = curObjectGroupExport.isDynamicObject;
    }
    if (curObjectGroupExport.isSlippery){
      objectGroupInstance.setSlippery(true);
    }

    objectGroupInstance.isChangeable = curObjectGroupExport.isChangeable;
    objectGroupInstance.isIntersectable = curObjectGroupExport.isIntersectable;
    if (typeof objectGroupInstance.isIntersectable == UNDEFINED){
      objectGroupInstance.isIntersectable = true;
    }
    objectGroupInstance.isColorizable = curObjectGroupExport.isColorizable;
    if (objectGroupInstance.isColorizable){
      macroHandler.injectMacro("HAS_FORCED_COLOR", objectGroupInstance.mesh.material, false, true);
      objectGroupInstance.mesh.material.uniforms.forcedColor = new THREE.Uniform(new THREE.Vector4(-50, 0, 0, 0));
    }

    objectGroupInstance.isDynamicObject = isDynamicObject;
    objectGroupInstance.isBasicMaterial = curObjectGroupExport.isBasicMaterial;

    if (curObjectGroupExport.blendingMode == "NO_BLENDING"){
      objectGroupInstance.setBlending(NO_BLENDING);
    }else if (curObjectGroupExport.blendingMode == "ADDITIVE_BLENDING"){
      objectGroupInstance.setBlending(ADDITIVE_BLENDING);
    }else if (curObjectGroupExport.blendingMode == "SUBTRACTIVE_BLENDING"){
      objectGroupInstance.setBlending(SUBTRACTIVE_BLENDING);
    }else if (curObjectGroupExport.blendingMode == "MULTIPLY_BLENDING"){
      objectGroupInstance.setBlending(MULTIPLY_BLENDING);
    }else if (curObjectGroupExport.blending == "NORMAL_BLENDING"){
      objectGroupInstance.setBlending(NORMAL_BLENDING);
    }

    objectGroupInstance.areaVisibilityConfigurations = curObjectGroupExport.areaVisibilityConfigurations;
    objectGroupInstance.areaSideConfigurations = curObjectGroupExport.areaSideConfigurations;

    if (curObjectGroupExport.renderSide){
      objectGroupInstance.handleRenderSide(curObjectGroupExport.renderSide);
    }

    if (curObjectGroupExport.hasPivot){
      var pivot = objectGroupInstance.makePivot(
        curObjectGroupExport.pivotOffsetX,
        curObjectGroupExport.pivotOffsetY,
        curObjectGroupExport.pivotOffsetZ
      );
      pivot.quaternion.set(
        curObjectGroupExport.pivotQX, curObjectGroupExport.pivotQY,
        curObjectGroupExport.pivotQZ, curObjectGroupExport.pivotQW
      );
      pivot.children[0].quaternion.set(
        curObjectGroupExport.insidePivotQX, curObjectGroupExport.insidePivotQY,
        curObjectGroupExport.insidePivotQZ, curObjectGroupExport.insidePivotQW
      );
      objectGroupInstance.pivotObject = pivot;
      objectGroupInstance.pivotOffsetX = curObjectGroupExport.pivotOffsetX;
      objectGroupInstance.pivotOffsetY = curObjectGroupExport.pivotOffsetY;
      objectGroupInstance.pivotOffsetZ = curObjectGroupExport.pivotOffsetZ;
      objectGroupInstance.mesh.position.set(
        curObjectGroupExport.positionX, curObjectGroupExport.positionY, curObjectGroupExport.positionZ
      );
      objectGroupInstance.physicsBody.position.copy(objectGroupInstance.mesh.position);
    }else if (curObjectGroupExport.pivotRemoved){
      objectGroupInstance.mesh.position.set(
        curObjectGroupExport.positionX, curObjectGroupExport.positionY, curObjectGroupExport.positionZ
      );
      objectGroupInstance.physicsBody.position.copy(objectGroupInstance.mesh.position);
    }

    if (curObjectGroupExport.softCopyParentName){
      objectGroupInstance.softCopyParentName = curObjectGroupExport.softCopyParentName;
    }

    objectGroupInstance.updateOpacity(curObjectGroupExport.totalAlpha);
    for (var childName in objectGroupInstance.group){
      objectGroupInstance.group[childName].updateOpacity(curObjectGroupExport.totalAlpha * objectGroupInstance.group[childName].opacityWhenAttached);
    }
    if (objectGroupInstance.mesh.material.uniforms.totalAOIntensity){
      objectGroupInstance.mesh.material.uniforms.totalAOIntensity.value = curObjectGroupExport.totalAOIntensity;
      for (var childName in objectGroupInstance.group){
        if (!(typeof objectGroupInstance.group[childName].aoIntensityWhenAttached == UNDEFINED)){
          objectGroupInstance.group[childName].mesh.material.uniforms.aoIntensity.value = objectGroupInstance.group[childName].aoIntensityWhenAttached * curObjectGroupExport.totalAOIntensity;
        }
      }
    }
    if (objectGroupInstance.mesh.material.uniforms.totalEmissiveIntensity){
      objectGroupInstance.mesh.material.uniforms.totalEmissiveIntensity.value = curObjectGroupExport.totalEmissiveIntensity;
      for (var childName in objectGroupInstance.group){
        if (!(typeof objectGroupInstance.group[childName].emissiveIntensityWhenAttached == UNDEFINED)){
          objectGroupInstance.group[childName].mesh.material.uniforms.emissiveIntensity.value = objectGroupInstance.group[childName].emissiveIntensityWhenAttached * curObjectGroupExport.totalEmissiveIntensity;
        }
      }
    }
    if (objectGroupInstance.mesh.material.uniforms.totalEmissiveColor){
      objectGroupInstance.mesh.material.uniforms.totalEmissiveColor.value.set(curObjectGroupExport.totalEmissiveColor);
      for (var childName in objectGroupInstance.group){
        if (!(typeof objectGroupInstance.group[childName].emissiveColorWhenAttached == UNDEFINED)){
          REUSABLE_COLOR.set(objectGroupInstance.group[childName].emissiveColorWhenAttached);
          REUSABLE_COLOR.multiply(objectGroupInstance.mesh.material.uniforms.totalEmissiveColor.value);
          objectGroupInstance.group[childName].mesh.material.uniforms.emissiveColor.value.copy(REUSABLE_COLOR);
        }
      }
    }
    if (curObjectGroupExport.isPhysicsSimplified){
      var params = curObjectGroupExport.physicsSimplificationParameters;
      objectGroupInstance.simplifyPhysics(params.sizeX, params.sizeY, params.sizeZ);
      objectGroupInstance.physicsBody.position.copy(params.pbodyPosition);
      objectGroupInstance.physicsBody.quaternion.copy(params.pbodyQuaternion);
      objectGroupInstance.physicsSimplificationObject3D.position.copy(params.physicsSimplificationObject3DPosition);
      objectGroupInstance.physicsSimplificationObject3D.quaternion.copy(params.physicsSimplificationObject3DQuaternion);
      objectGroupInstance.physicsSimplificationObject3DContainer.position.copy(params.physicsSimplificationObject3DContainerPosition);
      objectGroupInstance.physicsSimplificationObject3DContainer.quaternion.copy(params.physicsSimplificationObject3DContainerQuaternion);
    }
    if (curObjectGroupExport.noMass){
      objectGroupInstance.noMass = true;
      physicsWorld.remove(objectGroupInstance.physicsBody);
    }
    if (!(typeof curObjectGroupExport.positionWhenUsedAsFPSWeapon == UNDEFINED)){
      objectGroupInstance.isFPSWeapon = true;
      var positionWhenUsedAsFPSWeapon = curObjectGroupExport.positionWhenUsedAsFPSWeapon;
      var quaternionWhenUsedAsFPSWeapon = curObjectGroupExport.quaternionWhenUsedAsFPSWeapon;
      var physicsPositionWhenUsedAsFPSWeapon = curObjectGroupExport.physicsPositionWhenUsedAsFPSWeapon;
      var physicsQuaternionWhenUsedAsFPSWeapon = curObjectGroupExport.physicsQuaternionWhenUsedAsFPSWeapon;
      objectGroupInstance.positionWhenUsedAsFPSWeapon = new THREE.Vector3(positionWhenUsedAsFPSWeapon.x, positionWhenUsedAsFPSWeapon.y, positionWhenUsedAsFPSWeapon.z);
      objectGroupInstance.quaternionWhenUsedAsFPSWeapon = new THREE.Quaternion(quaternionWhenUsedAsFPSWeapon._x, quaternionWhenUsedAsFPSWeapon._y, quaternionWhenUsedAsFPSWeapon._z, quaternionWhenUsedAsFPSWeapon._w);
      objectGroupInstance.physicsPositionWhenUsedAsFPSWeapon = new THREE.Vector3(physicsPositionWhenUsedAsFPSWeapon.x, physicsPositionWhenUsedAsFPSWeapon.y, physicsPositionWhenUsedAsFPSWeapon.z);
      objectGroupInstance.physicsQuaternionWhenUsedAsFPSWeapon = new THREE.Quaternion(physicsQuaternionWhenUsedAsFPSWeapon._x, physicsQuaternionWhenUsedAsFPSWeapon._y, physicsQuaternionWhenUsedAsFPSWeapon._z, physicsQuaternionWhenUsedAsFPSWeapon._w);
      objectGroupInstance.fpsWeaponAlignment = curObjectGroupExport.fpsWeaponAlignment;
    }
    if (curObjectGroupExport.hasCustomPrecision){
      curObjectGroupExport.useCustomShaderPrecision(curObjectGroupExport.customPrecision);
    }
    if (curObjectGroupExport.objectTrailConfigurations){
      objectGroupInstance.objectTrailConfigurations = {alpha: curObjectGroupExport.objectTrailConfigurations.alpha, time: curObjectGroupExport.objectTrailConfigurations.time};
    }
    if (curObjectGroupExport.muzzleFlashParameters){
      objectGroupInstance.muzzleFlashParameters = curObjectGroupExport.muzzleFlashParameters;
    }
  }
  for (var objName in objectGroups){
    if (objectGroups[objName].softCopyParentName){
      var softCopyParent = objectGroups[objectGroups[objName].softCopyParentName];
      if (softCopyParent){
        objectGroups[objName].mesh.material = softCopyParent.mesh.material;
      }else{
        for (var objName2 in objectGroups){
          if (objName2 != objName){
            if (objectGroups[objName2].softCopyParentName &&
              objectGroups[objName2].softCopyParentName == objectGroups[objName].softCopyParentName){
              objectGroups[objName].mesh.material = objectGroups[objName2].mesh.material;
            }
          }
        }
      }
    }
  }
  // EFFECTS *******************************************************
  for (var effecName in obj.effects){
    renderer.effects[effecName].load(obj.effects[effecName]);
  }
  projectLoaded = true;
  if (!isDeployment){
    terminal.printInfo("Initializing workers.");
    rayCaster.onReadyCallback = function(){
      canvas.style.visibility = "";
      terminal.enable();
      terminal.clear();
      terminal.printInfo("Project loaded.");
    }
    rayCaster.refresh();
  }else{
    appendtoDeploymentConsole("Initializing workers.");
    modeSwitcher.switchMode();
  }
}

StateLoader.prototype.resetProject = function(){

  for (var gridSystemName in gridSystems){
    gridSystems[gridSystemName].destroy();
  }
  for (var addedObjectName in addedObjects){
    addedObjects[addedObjectName].destroy();
  }

  for (var grouppedObjectName in objectGroups){
    objectGroups[grouppedObjectName].destroy();
  }

  for (var textName in addedTexts){
    addedTexts[textName].destroy();
  }

  if (skyboxMesh){
    scene.remove(skyboxMesh);
  }

  collisionCallbackRequests = new Map();
  particleCollisionCallbackRequests = new Object();
  particleSystems.forEach(function(ps, psName){
    ps.destroy();
  })
  particleSystems = new Map();
  particleSystemPool = new Object();
  particleSystemPools = new Object();

  for (var markedPointName in markedPoints){
    markedPoints[markedPointName].destroy();
  }
  for (var areaName in areas){
    areas[areaName].destroy();
  }

  isPaused = false;
  maxInactiveTime = 0;
  inactiveCounter = 0;
  isScreenVisible = true;
  viewportMaxWidth = 0;
  viewportMaxHeight = 0;
  currentViewport = new Object();
  keyboardBuffer = new Object();
  gridSystems = new Object();
  gridSelections = new Object();
  materials = new Object();
  addedObjects = new Object();
  addedTexts = new Object();
  addedTexts2D = new Object();
  clickableAddedTexts = new Object();
  clickableAddedTexts2D = new Object();
  physicsTests = new Object();
  wallCollections = new Object();
  texturePacks = new Object();
  skyBoxes = new Object();
  scripts = new Object();
  objectGroups = new Object();
  disabledObjectNames = new Object();
  markedPoints = new Object();
  areas = new Object();
  objectTrails = new Object();
  activeObjectTrails = new Map();
  autoInstancedObjects = new Object();
  preConfiguredParticleSystems = new Object();
  preConfiguredParticleSystemPools = new Object();
  muzzleFlashes = new Object();
  areaBinHandler = new WorldBinHandler(true);
  webglCallbackHandler = new WebGLCallbackHandler();
  textureAtlasHandler.dispose();
  textureAtlasHandler = new TextureAtlasHandler();
  threejsRenderMonitoringHandler = new THREEJSRenderMonitoringHandler();
  objectsWithOnClickListeners = new Map();
  objectsWithMouseOverListeners = new Map();
  objectsWithMouseOutListeners = new Map();
  postProcessiongConfigurationsVisibility = new Object();
  currentMouseOverObjectName = 0;
  raycasterFactory.reset();
  physicsFactory.reset();
  rayCaster = raycasterFactory.get();
  physicsWorld = physicsFactory.get();
  areaBinHandler.isAreaBinHandler = true;
  anchorGrid = 0;
  areasVisible = true;
  areaConfigurationsVisible = false;
  areaConfigurationsHandler = new AreaConfigurationsHandler();
  textureUniformCache = new Object();
  dynamicObjects = new Map();
  dynamicObjectGroups = new Map();
  trackingObjects = new Object();
  screenResolution = 1;
  renderer.setPixelRatio(screenResolution);
  fogConfigurationsVisible = false;
  stopAreaConfigurationsHandler = false;
  screenClickCallbackFunction = 0;
  screenMouseDownCallbackFunction = 0;
  screenMouseUpCallbackFunction = 0;
  screenMouseMoveCallbackFunction = 0;
  screenPointerLockChangedCallbackFunction = 0;
  screenFullScreenChangeCallbackFunction = 0;
  screenKeydownCallbackFunction = 0;
  screenKeyupCallbackFunction = 0;
  screenOrientationChangeCallbackFunction = 0;
  fpsDropCallbackFunction = 0;
  performanceDropCallbackFunction = 0;
  userInactivityCallbackFunction = 0;
  screenMouseWheelCallbackFunction = 0;
  screenPinchCallbackFunction = 0;
  screenDragCallbackFunction = 0;
  fpsHandler.reset();
  fonts = new Object();
  NO_MOBILE = false;
  fixedAspect = 0;
  roygbivAttributeCounter = 1;
  roygbivBufferAttributeCounter = 1;
  roygbivSkippedArrayBufferUpdates = 0;
  roygbivSkippedElementArrayBufferUpdates = 0;
  particleSystemRefHeight = 0;
  GLOBAL_PS_REF_HEIGHT_UNIFORM.value = 0;

  boundingClientRect = renderer.getBoundingClientRect();
  pointerLockRequested = false;
  fullScreenRequested = false;
  isMouseDown = false;
  modeSwitcher = new ModeSwitcher();
  activeControl = new FreeControls({});

  // FOG
  fogActive = false;
  fogColor = "black";
  fogDensity = 0;
  fogColorRGB = new THREE.Color(fogColor);
  fogBlendWithSkybox = false;
  GLOBAL_FOG_UNIFORM.value.set(-100.0, 0, 0, 0);

  mode = 0; // 0 -> DESIGN, 1-> PREVIEW

  physicsDebugMode = false;
  if (!isDeployment){
    selectionHandler.resetCurrentSelection();
  }
  skyboxVisible = false;
  croppedGridSystemBuffer = 0;
  scriptEditorShowing = false;
  physicsSolver = new CANNON.GSSolver();
  // PHYSICS DEBUG MODE
  var objectsToRemove = [];
  var children = scene.children;
  for (var i = 0; i<children.length; i++){
    var child = children[i];
    if (child.forDebugPurposes){
      objectsToRemove.push(child);
    }
  }
  for (var i = 0; i<objectsToRemove.length; i++){
    scene.remove(objectsToRemove[i]);
  }
  for (var effectName in renderer.effects){
    renderer.effects[effectName].reset();
  }

  if (!isDeployment){
    guiHandler.hideAll();
    $("#cliDivheader").text("ROYGBIV Scene Creator - CLI (Design mode)");
  }

  LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
  BIN_SIZE = 50;
  RAYCASTER_STEP_AMOUNT = 32;
  geometryCache = new Object();
  physicsShapeCache = new Object();
  shaderPrecisionHandler.reset();
  previewSceneRendered = false;
}
