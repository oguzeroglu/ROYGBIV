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
  if (this.totalLoadedSkyboxCount == this.stateObj.totalSkyboxCount){
    skyboxHandler.import(this.stateObj.skyboxHandlerInfo);
  }
  this.finalize();
}

StateLoader.prototype.onTexturePackLoaded = function(){
  this.totalLoadedTexturePackCount ++;
  if (this.totalLoadedTexturePackCount == this.stateObj.totalTexturePackCount){
    this.importHandler.importTextureAtlas(this.stateObj, this.onTextureAtlasLoaded.bind(this));
  }
  this.finalize();
}

StateLoader.prototype.onFontLoaded = function(){
  this.totalLoadedFontCount ++;
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
    this.hasFonts = this.stateObj.totalFontCount > 0;
    this.textureAtlasReady = false;

    this.importHandler.importEngineVariables(obj);
    this.importHandler.importGridSystems(obj);
    this.importHandler.importMaterials(obj);
    this.importHandler.importParticleSystems(obj);
    this.importHandler.importAreas(obj);
    this.importHandler.importScripts(obj);
    this.importHandler.importAddedObjects(obj);
    this.importHandler.importTexturePacks(obj, this.onTexturePackLoaded.bind(this));
    this.importHandler.importSkyboxes(obj, this.onSkyboxLoaded.bind(this));
    this.importHandler.importFonts(obj, this.onFontLoaded.bind(this));

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

StateLoader.prototype.shouldFinalize = function(){
  var res =  !(
    (this.hasTextureAtlas && !this.textureAtlasReady) ||
    (this.hasTexturePacks && parseInt(this.totalLoadedTexturePackCount) < parseInt(this.stateObj.totalTexturePackCount)) ||
    (this.hasSkyboxes && parseInt(this.totalLoadedSkyboxCount) < parseInt(this.stateObj.totalSkyboxCount)) ||
    (this.hasFonts && parseInt(this.totalLoadedFontCount) < parseInt(this.stateObj.totalFontCount))
  )
  return res;
}

StateLoader.prototype.onAfterFinalized = function(){
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

StateLoader.prototype.finalize = function(){
  if (!this.shouldFinalize()){
    return;
  }
  this.importHandler.importAddedTexts(this.stateObj);
  this.importHandler.importAddedObjectGraphicsProperties();
  this.importHandler.importObjectGroups(this.stateObj);
  this.importHandler.importFog(this.stateObj);
  this.importHandler.importCrosshairs(this.stateObj);
  this.importHandler.importScenes(this.stateObj);
  projectLoaded = true;
  this.onAfterFinalized();
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
  skyboxHandler.reset();
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
  crosshairs = new Object();
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
  animationHandler.reset();
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
  fogHandler.reset();
  mode = 0; // 0 -> DESIGN, 1-> PREVIEW
  physicsDebugMode = false;
  if (!isDeployment){
    selectionHandler.resetCurrentSelection();
  }
  croppedGridSystemBuffer = 0;
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
    $("#cliDivheader").text("ROYGBIV Scene Creator - CLI (Design mode - "+sceneHandler.getActiveSceneName()+")");
  }
  LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
  BIN_SIZE = 50;
  RAYCASTER_STEP_AMOUNT = 32;
  geometryCache = new Object();
  physicsShapeCache = new Object();
  shaderPrecisionHandler.reset();
  previewSceneRendered = false;
}
