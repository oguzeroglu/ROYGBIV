var State = function(){
  // DATE **********************************************************
  this.date = new Date();
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
    curMaterialExport["colorHexString"] = colorHexString;
    curMaterialExport["opacity"] = opacity;
    curMaterialExport["textColor"] = curMaterial.textColor;
    if (curMaterial.isMeshBasicMaterial){
      curMaterialExport["materialType"] = "BASIC";
      var isWireFramed = curMaterial.wireframe;
      curMaterialExport["isWireFramed"] = isWireFramed;
    }else if (curMaterial.isMeshPhongMaterial){
      curMaterialExport["materialType"] = "PHONG";
      var shininess = curMaterial.shininess;
      curMaterialExport["shininess"] = shininess;
    }else if (curMaterial.isMeshLambertMaterial){
      curMaterialExport["materialType"] = "LAMBERT";
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
  // TEXTURE SIZES *************************************************
  var textureSizes = new Object();
  for (var textureName in textures){
    if (textures[textureName].image){
      textureSizes[textureName] = new Object();
      textureSizes[textureName].width = textures[textureName].image.width;
      textureSizes[textureName].height = textures[textureName].image.height;
    }
  }
  this.textureSizes = textureSizes;
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
  // LIGHTS ********************************************************
  var lightsExport = new Object();
  for (var lightName in lights){
    var curLightExport = new Object();
    var light = lights[lightName];
    curLightExport["color"] = light.color.toArray(); // load via setRGB(ary[0], ary[1], ary[2])
    curLightExport["intensity"] = light.intensity;
    curLightExport["colorTextVal"] = light.colorTextVal;
    if (light.isAmbientLight){
      curLightExport["type"] = "AMBIENT";
    }else if (light.isPointLight){
      curLightExport["type"] = "POINT";
      curLightExport["positionX"] = light.position.x;
      curLightExport["positionY"] = light.position.y;
      curLightExport["positionZ"] = light.position.z;
    }
    lightsExport[lightName] = curLightExport;
  }
  this.lights = lightsExport;
  // LIGHT_PREVIEWSCENE ********************************************
  this.light_previewScene = JSON.parse(JSON.stringify(lightsExport));
  // POINTLIGHT REPRESENTATIONS ************************************
  var pointLightRepresentationsExport = new Object();
  for (var lightName in pointLightRepresentations){
    var curRepresentation = new Object();
    var mesh = pointLightRepresentations[lightName];
    curRepresentation["positionX"] = mesh.position.x;
    curRepresentation["positionY"] = mesh.position.y;
    curRepresentation["positionZ"] = mesh.position.z;
    pointLightRepresentationsExport[lightName] = curRepresentation;
  }
  this.pointLightRepresentations = pointLightRepresentationsExport;
  // TEXTURE PACKS *************************************************
  var texturePacksExport = new Object();
  for (var texturePackName in texturePacks){
    texturePacksExport[texturePackName] = texturePacks[texturePackName].export();
  }
  this.texturePacks = texturePacksExport;
  // SKYBOXES ******************************************************
  this.mappedSkyboxName = mappedSkyboxName;
  this.skyboxVisible = skyboxVisible;
  var skyBoxExport = new Object();
  for (var skyBoxName in skyBoxes){
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
  // FOG ***********************************************************
  this.fogNear = previewScene.fog.near;
  this.fogFar = previewScene.fog.far;
  this.fogHexColor = previewScene.fog.color.getHex();
  // OBJECT GROUPS *************************************************
  var objectGroupsExport = new Object();
  for (var objectName in objectGroups){
    objectGroupsExport[objectName] = objectGroups[objectName].export();
  }
  this.objectGroups = objectGroupsExport;
  // MARKED POINTS
  var markedPointsExport = new Object();
  for (var markedPointName in markedPoints){
    markedPointsExport[markedPointName] = markedPoints[markedPointName].export();
  }
  this.markedPointsExport = markedPointsExport;
  // POST PROCESSING ***********************************************
  this.scanlineCount = scanlineCount;
  this.scanlineSIntensity = scanlineSIntensity;
  this.scanlineNIntensity = scanlineNIntensity;
  this.staticAmount = staticAmount;
  this.staticSize = staticSize;
  this.rgbAmount = rgbAmount;
  this.rgbAngle = rgbAngle;
  this.badtvThick = badtvThick;
  this.badtvFine = badtvFine;
  this.badtvDistortSpeed = badtvDistortSpeed;
  this.badtvRollSpeed = badtvRollSpeed;
  this.bloomStrength = bloomStrength;
  this.bloomRadius = bloomRadius;
  this.bloomThreshold = bloomThreshold;
  this.bloomResolutionScale = bloomResolutionScale;
  this.scanlineOn = scanlineOn;
  this.rgbOn = rgbOn;
  this.badTvOn = badTvOn;
  this.staticOn = staticOn;
  this.bloomOn = bloomOn;
  // PHYSICS WORKER MODE *******************************************
  this.physicsWorkerMode = PHYSICS_WORKER_ENABLED;
  // PARTICLE COLLISION WORKER MODE ********************************
  this.particleCollisionWorkerMode = COLLISION_WORKER_ENABLED;
  // PARTICLE SYSTME COLLISION WORKER MODE *************************
  this.particleSystemCollisionWorkerMode = PS_COLLISION_WORKER_ENABLED;
  // OCTREE LIMITS *************************************************
  var octreeMinX = LIMIT_BOUNDING_BOX.min.x;
  var octreeMinY = LIMIT_BOUNDING_BOX.min.y;
  var octreeMinZ = LIMIT_BOUNDING_BOX.min.z;
  var octreeMaxX = LIMIT_BOUNDING_BOX.max.x;
  var octreeMaxY = LIMIT_BOUNDING_BOX.max.y;
  var octreeMaxZ = LIMIT_BOUNDING_BOX.max.z;
  this.octreeLimit = octreeMinX+","+octreeMinY+","+octreeMinZ+","+
                     octreeMaxX+","+octreeMaxY+","+octreeMaxZ;
  // BIN SIZE ******************************************************
  this.binSize = BIN_SIZE;
}
