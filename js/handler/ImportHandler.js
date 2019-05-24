var ImportHandler = function(){

}

ImportHandler.prototype.importEngineVariables = function(obj){
  NO_MOBILE = obj.noMobile;
  if (!(typeof obj.viewportMaxWidth == UNDEFINED)){
    viewportMaxWidth = obj.viewportMaxWidth;
  }
  if (!(typeof obj.viewportMaxHeight == UNDEFINED)){
    viewportMaxHeight = obj.viewportMaxHeight;
  }
  if (!(typeof obj.fixedAspect == UNDEFINED)){
    fixedAspect = obj.fixedAspect;
  }
  RAYCASTER_WORKER_ON = (!(typeof obj.RAYCASTER_WORKER_ON == UNDEFINED))? obj.RAYCASTER_WORKER_ON: true;
  PHYSICS_WORKER_ON = (!(typeof obj.PHYSICS_WORKER_ON == UNDEFINED))? obj.PHYSICS_WORKER_ON: true;
  rayCaster = raycasterFactory.get();
  physicsWorld = physicsFactory.get();
  particleSystemRefHeight = obj.particleSystemRefHeight;
  GLOBAL_PS_REF_HEIGHT_UNIFORM.value = ((renderer.getCurrentViewport().w / screenResolution) / particleSystemRefHeight);
  shaderPrecisionHandler.load(obj.shaderPrecisions);
  var octreeLimitInfo = obj.octreeLimit
  var octreeLimitInfoSplitted = octreeLimitInfo.split(",");
  for (var i = 0; i<octreeLimitInfoSplitted.length; i++){
    octreeLimitInfoSplitted[i] = parseInt(octreeLimitInfoSplitted[i]);
  }
  var lowerBound = new THREE.Vector3(
    octreeLimitInfoSplitted[0], octreeLimitInfoSplitted[1], octreeLimitInfoSplitted[2]
  );
  var upperBound = new THREE.Vector3(
    octreeLimitInfoSplitted[3], octreeLimitInfoSplitted[4], octreeLimitInfoSplitted[5]
  );
  LIMIT_BOUNDING_BOX = new THREE.Box3(lowerBound, upperBound);
  BIN_SIZE = parseInt(obj.binSize);
  RAYCASTER_STEP_AMOUNT = parseFloat(obj.raycasterStepAmount);
  if (isNaN(RAYCASTER_STEP_AMOUNT)){
    RAYCASTER_STEP_AMOUNT = 32;
  }
  screenResolution = obj.screenResolution;
  renderer.setPixelRatio(screenResolution);
  defaultMaterialType = obj.defaultMaterialType;
  markedPointsVisible = false;
  for (var markedPointName in obj.markedPointsExport){
    var curMarkedPointExport = obj.markedPointsExport[markedPointName];
    var markedPoint = new MarkedPoint(
      markedPointName,
      curMarkedPointExport["x"],
      curMarkedPointExport["y"],
      curMarkedPointExport["z"],
      curMarkedPointExport["fromX"],
      curMarkedPointExport["fromY"],
      curMarkedPointExport["fromZ"],
      curMarkedPointExport["gridDestroyed"]
    );
    if (!curMarkedPointExport.isHidden && mode == 0){
      markedPointsVisible = true;
    }else{
      markedPoint.hide();
    }
    markedPoint.showAgainOnTheNextModeSwitch = curMarkedPointExport.showAgainOnTheNextModeSwitch;
    if (mode == 0){
      markedPoint.showAgainOnTheNextModeSwitch = false;
    }
    markedPoints[markedPointName] = markedPoint;
  }
}

ImportHandler.prototype.importGridSystems = function(obj){
  var gridSystemsExport = obj.gridSystems;
  for (var gridSystemName in gridSystemsExport){
    var exportObject = gridSystemsExport[gridSystemName];
    var name = exportObject.name;
    var sizeX = exportObject.sizeX;
    var sizeZ = exportObject.sizeZ;
    var centerX = exportObject.centerX;
    var centerY = exportObject.centerY;
    var centerZ = exportObject.centerZ;
    var outlineColor = exportObject.outlineColor;
    var cellSize = exportObject.cellSize;
    var axis = exportObject.axis;
    var gs = new GridSystem(name, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, axis);
    var selectedGridsExport = exportObject.selectedGridsExport;
    var slicedGridsExport = exportObject.slicedGridsExport;
    var slicedGridSystemNamesExport = exportObject.slicedGridSystemNamesExport;
    for (var i = 0; i<selectedGridsExport.length; i++){
      var gridNumber = selectedGridsExport[i];
      gs.grids[gridNumber].toggleSelect(false, false, true, false);
    }
    for (var i = 0; i<slicedGridsExport.length; i++){
      var gridNumber = slicedGridsExport[i];
      gs.grids[gridNumber].sliced = true;
      gs.grids[gridNumber].slicedGridSystemName = slicedGridSystemNamesExport[i];
      if (!gs.slicedGrids){
        gs.slicedGrids = new Object();
      }
      gs.slicedGrids[gs.grids[gridNumber].name] = gs.grids[gridNumber];
    }
    gs.markedPointNames = exportObject.markedPointNames;
  }
  for (var gridSystemName in gridSystems){
    var grids = gridSystems[gridSystemName].grids;
    for (var gridNumber in grids){
      var grid = grids[gridNumber];
      if (grid.sliced){
        var slicedGridSystemName = grid.slicedGridSystemName;
        var gridSystem = gridSystems[slicedGridSystemName];
        if (gridSystem){
          gridSystem.slicedGrid = grid;
        }
      }
    }
  }
  var wallCollectionsExport = obj.wallCollections;
  for (var wallCollectionName in wallCollectionsExport){
    var curWallCollectionExport = wallCollectionsExport[wallCollectionName];
    var name = curWallCollectionExport.name;
    var height = curWallCollectionExport.height;
    var outlineColor = curWallCollectionExport.outlineColor;
    new WallCollection(name, height, outlineColor, 0, 0, true, curWallCollectionExport);
  }
  if (obj.croppedGridSystemBuffer){
    croppedGridSystemBuffer = new CroppedGridSystem(
      obj.croppedGridSystemBuffer.sizeX,
      obj.croppedGridSystemBuffer.sizeZ,
      obj.croppedGridSystemBuffer.centerX,
      obj.croppedGridSystemBuffer.centerY,
      obj.croppedGridSystemBuffer.centerZ,
      obj.croppedGridSystemBuffer.axis
    )
  }
  anchorGrid = 0;
  var anchorGridExport = obj.anchorGrid;
  if (anchorGridExport){
    var parentName = anchorGridExport.parentName;
    var gridSystem = gridSystems[parentName];
    if (gridSystem){
      for (var gridNumber in gridSystem.grids){
        var grid = gridSystem.grids[gridNumber];
        if (grid.startX == anchorGridExport.startX && grid.startY == anchorGridExport.startY && grid.startZ == anchorGridExport.startZ){
          anchorGrid = grid;
          break;
        }
      }
    }
  }
}

ImportHandler.prototype.importMaterials = function(obj){
  var materialsExport = obj.materials;
  for (var materialName in materialsExport){
    var material;
    var curMaterialExport = materialsExport[materialName];
    var color = curMaterialExport.textColor;
    var opacity = curMaterialExport.opacity;
    var aoMapIntensity = curMaterialExport.aoMapIntensity;
    if (curMaterialExport.materialType == "BASIC"){
      material = new BasicMaterial(
        {
          name: curMaterialExport.roygbivMaterialName,
          color: color,
          alpha: opacity,
          aoMapIntensity: aoMapIntensity
        }
      );
    }
    material.roygbivMaterialName = curMaterialExport.roygbivMaterialName;
    material.textColor = color;
    materials[materialName] = material;
  }
}

ImportHandler.prototype.importParticleSystems = function(obj){
  for (var psName in obj.preConfiguredParticleSystems){
    var curExport = obj.preConfiguredParticleSystems[psName];
    for (var key in curExport.params){
      var elem = curExport.params[key];
      if (!(typeof elem.x == UNDEFINED) && !(typeof elem.y == UNDEFINED) && !(typeof elem.z == UNDEFINED)){
        curExport.params[key] = new THREE.Vector3(elem.x, elem.y, elem.z);
      }
    }
    preConfiguredParticleSystems[psName] = new PreconfiguredParticleSystem(curExport.name, curExport.type, curExport.params);
    preConfiguredParticleSystems[psName].setCollidableStatus(curExport.isCollidable);
    preConfiguredParticleSystems[psName].setExcludeFromMergeStatus(curExport.excludeFromMerge);
    preConfiguredParticleSystems[psName].setScale(curExport.scale);
    preConfiguredParticleSystems[psName].setMaxPSTime(curExport.maxPSTime);
    preConfiguredParticleSystems[psName].setBlending(curExport.blendingIntVal, curExport.blendingStrVal);
    preConfiguredParticleSystems[psName].preConfiguredParticleSystemPoolName = curExport.preConfiguredParticleSystemPoolName;
  }
  for (var poolName in obj.preConfiguredParticleSystemPools){
    var curExport = obj.preConfiguredParticleSystemPools[poolName];
    preConfiguredParticleSystemPools[poolName] = new PreconfiguredParticleSystemPool(curExport.psName, curExport.poolName, curExport.poolSize);
  }
  for (var muzzleFlashName in obj.muzzleFlashes){
    var curMuzzleFlashExport = obj.muzzleFlashes[muzzleFlashName];
    muzzleFlashes[muzzleFlashName] = new MuzzleFlash(muzzleFlashName, preConfiguredParticleSystems[curMuzzleFlashExport.refPreconfiguredPSName], curMuzzleFlashExport.psCount, curMuzzleFlashExport.psTime);
  }
}

ImportHandler.prototype.importAreas = function(obj){
  areasVisible = obj.areasVisible && !isDeployment;
  for (var areaName in obj.areas){
    var curAreaExport = obj.areas[areaName];
    areas[areaName] = new Area(
      areaName,
      new THREE.Box3(
        new THREE.Vector3(curAreaExport.bbMinX, curAreaExport.bbMinY, curAreaExport.bbMinZ),
        new THREE.Vector3(curAreaExport.bbMaxX, curAreaExport.bbMaxY, curAreaExport.bbMaxZ)
      ),
      curAreaExport.color,
      curAreaExport.gridSize
    );
    areaBinHandler.insert(areas[areaName].boundingBox, areaName);
    if (areasVisible){
      areas[areaName].renderToScreen();
    }
  }
}

ImportHandler.prototype.importScripts = function(obj){
  for (var scriptName in obj.scripts){
    var curScriptExport = obj.scripts[scriptName];
    scripts[scriptName] = new Script(curScriptExport.name, curScriptExport.script);
    if (curScriptExport.runAutomatically){
      scripts[scriptName].runAutomatically = true;
    }else{
      scripts[scriptName].runAutomatically = false;
    }
    if (curScriptExport.localFilePath && !isDeployment){
      modeSwitcher.totalScriptsToLoad ++;
      scripts[scriptName].localFilePath = curScriptExport.localFilePath;
    }
  }
}

ImportHandler.prototype.importFog = function(obj){
  var fogObj = obj.fogObj;
  fogActive = fogObj.fogActive;
  fogColor = fogObj.fogColor;
  fogDensity = fogObj.fogDensity;
  fogColorRGB = new THREE.Color(fogColor);
  fogBlendWithSkybox = fogObj.blendWithSkybox;
  if (fogActive){
    fogColorRGB.setRGB(fogObj.r, fogObj.g, fogObj.b);
  }
}
