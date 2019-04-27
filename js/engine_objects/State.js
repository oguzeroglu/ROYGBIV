var State = function(projectName, author){
  // PROJECT INFOS *************************************************
  if (!(typeof projectName == UNDEFINED)){
    this.projectName = projectName;
  }
  if (!(typeof author == UNDEFINED)){
    this.author = author;
  }
  this.noMobile = NO_MOBILE;
  // DATE **********************************************************
  this.date = new Date();
  // VIEWPORT ******************************************************
  this.viewportMaxWidth = viewportMaxWidth;
  this.viewportMaxHeight = viewportMaxHeight;
  this.fixedAspect = fixedAspect;
  // SHADER PRECISIONS *********************************************
  this.shaderPrecisions = shaderPrecisionHandler.export();
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
    var curMaterialExport = new Object();
    var curMaterial = materials[materialName];
    var colorHexString = curMaterial.color.toArray();
    var opacity = curMaterial.opacity;
    var aoMapIntensity = curMaterial.aoMapIntensity;
    curMaterialExport["colorHexString"] = colorHexString;
    curMaterialExport["opacity"] = opacity;
    curMaterialExport["aoMapIntensity"] = aoMapIntensity;
    curMaterialExport["textColor"] = curMaterial.textColor;
    if (curMaterial instanceof BasicMaterial){
      curMaterialExport["materialType"] = "BASIC";
    }
    curMaterialExport.roygbivMaterialName = curMaterial.roygbivMaterialName;
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
  // UPLOADED IMAGE SIZES ******************************************
  var uploadedImageSizes = new Object();
  for (var uploadedImageName in uploadedImages){
    var img = uploadedImages[uploadedImageName];
    var size = new Object();
    size.width = img.width;
    size.height = img.height;
    uploadedImageSizes[uploadedImageName] = size;
  }
  this.uploadedImageSizes = uploadedImageSizes;
  // TEXTURE SIZES AND PADDING *************************************
  var textureSizes = new Object();
  var texturePaddings = new Object();
  this.totalTextureCount = 0;
  for (var textureName in textures){
    this.totalTextureCount ++;
    if (textures[textureName].image){
      textureSizes[textureName] = new Object();
      textureSizes[textureName].width = textures[textureName].image.width;
      textureSizes[textureName].height = textures[textureName].image.height;
      if (textures[textureName].hasPadding){
        texturePaddings[textureName] = textures[textureName].paddingInfo;
      }
    }
  }
  this.textureSizes = textureSizes;
  this.texturePaddings = texturePaddings;
  // TEXTURES ******************************************************
  this.textures = JSON.parse(JSON.stringify(textures));
  // TEXTURE URLS **************************************************
  this.textureURLs = Object.assign({}, textureURLs);
  // WALL COLLECTIONS **********************************************
  var wallCollectionsExport = new Object();
  for (var wallCollectionName in wallCollections){
    wallCollectionsExport[wallCollectionName] = wallCollections[wallCollectionName].export();
  }
  this.wallCollections = wallCollectionsExport;
  // UPLOADED IMAGES ***********************************************
  var uploadedImagesExport = new Object();
  for (var imageName in uploadedImages){
    uploadedImagesExport[imageName] = uploadedImages[imageName].src;
  }
  this.uploadedImages = uploadedImagesExport;
  // MODIFIED TEXTURES *********************************************
  var modifiedTexturesExport = new Object();
  for (var textureName in modifiedTextures){
    modifiedTexturesExport[textureName] = modifiedTextures[textureName];
  }
  this.modifiedTextures = modifiedTexturesExport;
  // TEXTURE PACKS *************************************************
  var texturePacksExport = new Object();
  this.totalTexturePackCount = 0;
  for (var texturePackName in texturePacks){
    this.totalTexturePackCount ++;
    texturePacksExport[texturePackName] = texturePacks[texturePackName].export();
  }
  this.texturePacks = texturePacksExport;
  // SKYBOXES ******************************************************
  this.mappedSkyboxName = mappedSkyboxName;
  this.skyboxVisible = skyboxVisible;
  var skyBoxExport = new Object();
  this.totalSkyboxCount = 0;
  for (var skyBoxName in skyBoxes){
    this.totalSkyboxCount ++;
    skyBoxExport[skyBoxName] = skyBoxes[skyBoxName].export();
  }
  this.skyBoxes = skyBoxExport;
  if (skyboxMesh){
    this.skyBoxScale = skyboxMesh.scale.x;
  }
  // ANCHOR GRID ***************************************************
  if (anchorGrid){
    this.anchorGrid = anchorGrid.export();
  }else{
    this.anchorGrid = 0;
  }
  // SCRIPTS *******************************************************
  var scriptsExport = new Object();
  for (var scriptName in scripts){
    scriptsExport[scriptName] = scripts[scriptName].export();
  }
  this.scripts = scriptsExport;
  // OBJECT GROUPS *************************************************
  var objectGroupsExport = new Object();
  for (var objectName in objectGroups){
    objectGroupsExport[objectName] = objectGroups[objectName].export();
  }
  this.objectGroups = objectGroupsExport;
  // MARKED POINTS *************************************************
  var markedPointsExport = new Object();
  for (var markedPointName in markedPoints){
    markedPointsExport[markedPointName] = markedPoints[markedPointName].export();
  }
  this.markedPointsExport = markedPointsExport;
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
  this.fogObj = {
    fogActive: fogActive,
    fogColor: fogColor,
    fogDensity: fogDensity,
    blendWithSkybox: fogBlendWithSkybox
  };
  if (fogActive){
    this.fogObj.r = fogColorRGB.r;
    this.fogObj.g = fogColorRGB.g;
    this.fogObj.b = fogColorRGB.b;
  }
  // AREAS *********************************************************
  this.areasVisible = areasVisible;
  this.areas = new Object();
  for (var areaName in areas){
    this.areas[areaName] = areas[areaName].export();
  }
  // RESOLUTION ****************************************************
  this.screenResolution = screenResolution;
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
  // POST PROCESSING ***********************************************
  this.effects = new Object();
  for (var effectName in renderer.effects){
    this.effects[effectName] = renderer.effects[effectName].export();
  }
  // PRECONFIGURED PARTICLE SYSTEMS ********************************
  this.preConfiguredParticleSystems = new Object();
  for (var psName in preConfiguredParticleSystems){
    this.preConfiguredParticleSystems[psName] = preConfiguredParticleSystems[psName];
  }
}
