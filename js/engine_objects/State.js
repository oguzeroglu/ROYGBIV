var State = function(projectName, author, isBuildingForDeploymentMode){
  // PROJECT INFOS *************************************************
  if (!(typeof projectName == UNDEFINED)){
    this.projectName = projectName;
  }
  if (!(typeof author == UNDEFINED)){
    this.author = author;
  }
  // DATE **********************************************************
  this.date = new Date();
  // WORKER STATUS ***********************************************
  this.RAYCASTER_WORKER_ON = RAYCASTER_WORKER_ON;
  this.PHYSICS_WORKER_ON = PHYSICS_WORKER_ON;
  this.LIGHTNING_WORKER_ON = LIGHTNING_WORKER_ON;
  // INSTANCING ****************************************************
  this.INSTANCING_DISABLED = INSTANCING_DISABLED;
  // ANTIALIAS *****************************************************
  this.ENABLE_ANTIALIAS = ENABLE_ANTIALIAS;
  // TEXTURE BLEEDING FIX PIXELS ***********************************
  this.TEXTURE_BLEEDING_FIX_PIXELS = TEXTURE_BLEEDING_FIX_PIXELS;
  // PS REF HEIGHT *************************************************
  this.particleSystemRefHeight = particleSystemRefHeight;
  // TEXTURE ATLAS *************************************************
  this.textureAtlas = textureAtlasHandler.export();
  // SHADER PRECISIONS *********************************************
  this.shaderPrecisions = shaderPrecisionHandler.export();
  // CAMERA FOV ****************************************************
  this.cameraFOV = camera.fov;
  // GRID SYSTEMS **************************************************
  var gridSystemsExport = new Object();
  for (var gridSystemName in gridSystems){
    gridSystemsExport[gridSystemName] = gridSystems[gridSystemName].export();
  }
  this.gridSystems = gridSystemsExport;
  // CROPPED GRID SYSTEM BUFFER ************************************
  if (croppedGridSystemBuffer){
    this.croppedGridSystemBuffer = croppedGridSystemBuffer.export();
  }
  // MATERIALS *****************************************************
  var materialsExport = new Object();
  for (var materialName in materials){
    var curMaterial = materials[materialName];
    var curMaterialExport = curMaterial.export();
    materialsExport[materialName] = curMaterialExport;
  }
  this.materials = materialsExport;
  // DEFAULT MATERIAL **********************************************
  this.defaultMaterialType = defaultMaterialType;
  // ADDED OBJECTS *************************************************
  var addedbObjectsExport = new Object();
  for (var objectName in addedObjects){
    addedbObjectsExport[objectName] = addedObjects[objectName].export();
  }
  this.addedObjects = addedbObjectsExport;
  // WALL COLLECTIONS **********************************************
  var wallCollectionsExport = new Object();
  for (var wallCollectionName in wallCollections){
    wallCollectionsExport[wallCollectionName] = wallCollections[wallCollectionName].export();
  }
  this.wallCollections = wallCollectionsExport;
  // ACCEPTED TEXTURE SIZE *****************************************
  this.ACCEPTED_TEXTURE_SIZE = ACCEPTED_TEXTURE_SIZE;
  // TEXTURE PACKS *************************************************
  var texturePacksExport = new Object();
  this.totalTexturePackCount = 0;
  for (var texturePackName in texturePacks){
    this.totalTexturePackCount ++;
    texturePacksExport[texturePackName] = texturePacks[texturePackName].export();
  }
  this.texturePacks = texturePacksExport;
  // DYNAMIC TEXTURE FOLDERS ***************************************
  var dynamicTextureFoldersExport = new Object();
  for (var folderName in dynamicTextureFolders){
    dynamicTextureFoldersExport[folderName] = {noCompress: dynamicTextureFolders[folderName]};
  }
  this.dynamicTextureFolders = dynamicTextureFoldersExport;
  // SKYBOXES ******************************************************
  var skyBoxExport = new Object();
  this.totalSkyboxCount = 0;
  for (var skyBoxName in skyBoxes){
    this.totalSkyboxCount ++;
    skyBoxExport[skyBoxName] = skyBoxes[skyBoxName].export(isBuildingForDeploymentMode);
  }
  this.skyBoxes = skyBoxExport;
  this.skyboxHandlerInfo = skyboxHandler.export();
  this.skyboxDistance = skyboxDistance;
  // ANCHOR GRID ***************************************************
  if (anchorGrid){
    this.anchorGrid = anchorGrid.export();
  }else{
    this.anchorGrid = 0;
  }
  // SCRIPTS *******************************************************
  this.scripts = scriptsHandler.export();
  // OBJECT GROUPS *************************************************
  var objectGroupsExport = new Object();
  for (var objectName in objectGroups){
    objectGroupsExport[objectName] = objectGroups[objectName].export(isBuildingForDeploymentMode);
  }
  this.objectGroups = objectGroupsExport;
  // MARKED POINTS *************************************************
  var markedPointsExport = new Object();
  for (var markedPointName in markedPoints){
    markedPointsExport[markedPointName] = markedPoints[markedPointName].export();
  }
  this.markedPointsExport = markedPointsExport;
  this.markedPointsVisible = markedPointsVisible;
  // OCTREE LIMITS *************************************************
  var octreeMinX = LIMIT_BOUNDING_BOX.min.x;
  var octreeMinY = LIMIT_BOUNDING_BOX.min.y;
  var octreeMinZ = LIMIT_BOUNDING_BOX.min.z;
  var octreeMaxX = LIMIT_BOUNDING_BOX.max.x;
  var octreeMaxY = LIMIT_BOUNDING_BOX.max.y;
  var octreeMaxZ = LIMIT_BOUNDING_BOX.max.z;
  this.octreeLimit = octreeMinX+","+octreeMinY+","+octreeMinZ+","+
                     octreeMaxX+","+octreeMaxY+","+octreeMaxZ;
  // BIN SIZE AND RAYCASTER STEP AMOUNT*****************************
  this.binSize = BIN_SIZE;
  this.raycasterStepAmount = RAYCASTER_STEP_AMOUNT;
  // FOG ***********************************************************
  this.fog = fogHandler.export();
  // AREAS *********************************************************
  this.areasVisible = areasVisible;
  this.areas = new Object();
  for (var areaName in areas){
    this.areas[areaName] = areas[areaName].export();
  }
  // RESOLUTION ****************************************************
  this.screenResolution = screenResolution;
  this.useOriginalResolution = useOriginalResolution;
  // FONTS *********************************************************
  this.fonts = new Object();
  this.totalFontCount = 0;
  for (var fontName in fonts){
    this.totalFontCount ++;
    this.fonts[fontName] = fonts[fontName].export();
  }
  // TEXTS *********************************************************
  this.texts = new Object();
  for (var textName in addedTexts){
    this.texts[textName] = addedTexts[textName].export();
  }
  // SPRITES *******************************************************
  this.sprites = new Object();
  for (var spriteName in sprites){
    this.sprites[spriteName] = sprites[spriteName].export();
  }
  // CONTAINERS ****************************************************
  this.containers = new Object();
  for (var containerName in containers){
    this.containers[containerName] = containers[containerName].export();
  }
  // VIRTUAL KEYBOARDS *********************************************
  this.virtualKeyboards = new Object();
  for (var vkName in virtualKeyboards){
    this.virtualKeyboards[vkName] = virtualKeyboards[vkName].export();
  }
  // PRECONFIGURED PARTICLE SYSTEMS ********************************
  this.preConfiguredParticleSystems = new Object();
  for (var psName in preConfiguredParticleSystems){
    this.preConfiguredParticleSystems[psName] = preConfiguredParticleSystems[psName].export();
  }
  // PRECONFIGURED PARTICLE SYSTEM POOLS ***************************
  this.preConfiguredParticleSystemPools = new Object();
  for (var poolName in preConfiguredParticleSystemPools){
    this.preConfiguredParticleSystemPools[poolName] = preConfiguredParticleSystemPools[poolName].export();
  }
  // MUZZLE FLASHES ************************************************
  this.muzzleFlashes = new Object();
  for (var muzzleFlashName in muzzleFlashes){
    this.muzzleFlashes[muzzleFlashName] = muzzleFlashes[muzzleFlashName].export();
  }
  // CROSSHAIRS ****************************************************
  this.crosshairs = new Object();
  for (var crosshairName in crosshairs){
    this.crosshairs[crosshairName] = crosshairs[crosshairName].export();
  }
  // LIGHTNINGS ****************************************************
  this.lightnings = new Object();
  for (var lightningName in lightnings){
    this.lightnings[lightningName] = lightnings[lightningName].export();
  }
  // SCENES ********************************************************
  this.scenes = sceneHandler.export();
  // PROTOCOL DEFINITION FILE NAME *********************************
  this.protocolDefinitionFileName = protocolDefinitionFileName;
  // WS SERVER URL *************************************************
  this.serverWSURL = serverWSURL;
  this.developmentServerWSURL = developmentServerWSURL;
  // STEERING HANDLER **********************************************
  this.steeringHandler = steeringHandler.export();
  // DECISION HANDLER **********************************************
  this.decisionHandler = decisionHandler.export();
  // SHADOW BAKER **************************************************
  this.shadowBaker = shadowBaker.export(isBuildingForDeploymentMode);
  // MODULE HANDLER ************************************************
  this.modules = moduleHandler.export();
  // MODELS ********************************************************
  this.models = new Object();
  for (var modelName in models){
    this.models[modelName] = models[modelName].export(isBuildingForDeploymentMode);
  }
  // MODEL INSTANCES ***********************************************
  this.modelInstances = new Object();
  for (var instanceName in modelInstances){
    this.modelInstances[instanceName] = modelInstances[instanceName].export();
  }
  // BOOTSCREEN ****************************************************
  this.bootscreenFolderName = bootscreenFolderName;
  this.bodyBGColor = bodyBGColor;
  // DISABLED SHADERS **********************************************
  if (isBuildingForDeploymentMode){
    this.disabledShaderInfo = ShaderContent.getDisableInfo();
  }
  // ANALYTICS *****************************************************
  this.analytics = {
    serverURL: analyticsHandler.serverURL,
    devServerURL: analyticsHandler.devServerURL
  };
}
