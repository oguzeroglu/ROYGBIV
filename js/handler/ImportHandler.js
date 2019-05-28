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

ImportHandler.prototype.importAddedObjects = function(obj){
  var addedObjectsExport = obj.addedObjects;
  for (var grouppedObjectName in obj.objectGroups){
    var curObjectGroupExport = obj.objectGroups[grouppedObjectName];
    var curGroup = curObjectGroupExport.group;
    for (var objectName in curGroup){
      addedObjectsExport[objectName] = curGroup[objectName];
      addedObjectsExport[objectName].fromObjectGroup = true;
    }
  }
  for (var addedObjectName in addedObjectsExport){
    var curAddedObjectExport = addedObjectsExport[addedObjectName];
    var type = curAddedObjectExport.type;
    var roygbivMaterialName = curAddedObjectExport.roygbivMaterialName;
    var destroyedGrids = new Object();
    var destroyedGridsExport = curAddedObjectExport.destroyedGrids;
    var metaData = curAddedObjectExport.metaData;
    var mass = 0;
    if (curAddedObjectExport.mass){
      mass = curAddedObjectExport.mass;
    }
    var isDynamicObject = false;
    if (curAddedObjectExport.isDynamicObject){
      isDynamicObject = curAddedObjectExport.isDynamicObject;
    }
    var gridSystemName = metaData["gridSystemName"];
    var gridSystem = gridSystems[gridSystemName];
    if (gridSystem){
      for (var gridName in destroyedGridsExport){
        var gridExport = destroyedGridsExport[gridName];
        var grid = gridSystem.getGridByColRow(
          gridExport.colNumber,
          gridExport.rowNumber
        );
        if (grid){
          destroyedGrids[gridName] = grid;
        }
      }
    }
    var material = materials[roygbivMaterialName];
    if (!material){
      if (roygbivMaterialName == "NULL_BASIC"){
        material = new BasicMaterial({
          name: roygbivMaterialName,
          color: "white",
          alpha: curAddedObjectExport.opacity,
          aoMapIntensity: curAddedObjectExport.aoMapIntensity,
          emissiveIntensity: curAddedObjectExport.emissiveIntensity,
          emissiveColor: curAddedObjectExport.emissiveColor
        });
      }
    }

    var widthSegments = metaData["widthSegments"];
    var heightSegments = metaData["heightSegments"];
    var depthSegments = metaData["depthSegments"];
    if (!widthSegments){
      widthSegments = 1;
      if (type == "cylinder"){
        widthSegments = 8;
      }else if (type == "sphere"){
        widthSegments = 8;
      }
    }
    if (!heightSegments){
      heightSegments = 1;
      if (type == "sphere"){
        widthSegments = 6;
      }
    }
    if (!depthSegments){
      depthSegments = 1;
    }
    var addedObjectInstance;
    if (type == "box"){
      var boxSizeX = metaData["boxSizeX"];
      var boxSizeY = metaData["boxSizeY"];
      var boxSizeZ = metaData["boxSizeZ"];
      var centerX = metaData["centerX"];
      var centerY = metaData["centerY"];
      var centerZ = metaData["centerZ"];
      if (!metaData.physicsShapeParameterX){
        metaData.physicsShapeParameterX = boxSizeX / 2;
      }
      if (!metaData.physicsShapeParameterY){
        metaData.physicsShapeParameterY = boxSizeY / 2;
      }
      if (!metaData.physicsShapeParameterZ){
        metaData.physicsShapeParameterZ = boxSizeZ / 2;
      }
      var boxPhysicsBody = physicsBodyGenerator.generateBoxBody({
        x: metaData.physicsShapeParameterX, y: metaData.physicsShapeParameterY, z: metaData.physicsShapeParameterZ,
        mass: mass
      });
      var boxMesh;
      var boxClone;
      var axis = metaData["gridSystemAxis"];
      var geomKey = (
        "BoxBufferGeometry" + PIPE +
        boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
        widthSegments + PIPE + heightSegments + PIPE + depthSegments
      );
      var geom = geometryCache[geomKey];
      if (!geom){
        geom = new THREE.BoxBufferGeometry(
          boxSizeX, boxSizeY, boxSizeZ,
          widthSegments, heightSegments, depthSegments
        );
        geometryCache[geomKey] = geom;
      }
      boxMesh = new MeshGenerator(geom, material).generateMesh();
      boxMesh.position.x = centerX;
      boxMesh.position.y = centerY;
      boxMesh.position.z = centerZ;
      scene.add(boxMesh);
      boxPhysicsBody.position.set(
        boxMesh.position.x,
        boxMesh.position.y,
        boxMesh.position.z
      );
      physicsWorld.addBody(boxPhysicsBody);
      addedObjectInstance = new AddedObject(
        addedObjectName, "box", metaData, material,
        boxMesh, boxPhysicsBody, destroyedGrids
      );
      boxMesh.addedObject = addedObjectInstance;
    }else if (type == "surface"){
      var width = metaData["width"];
      var height = metaData["height"];
      var positionX = metaData["positionX"];
      var positionY = metaData["positionY"];
      var positionZ = metaData["positionZ"];
      var quaternionX = metaData["quaternionX"];
      var quaternionY = metaData["quaternionY"];
      var quaternionZ = metaData["quaternionZ"];
      var quaternionW = metaData["quaternionW"];
      var physicsShapeParameterX = metaData["physicsShapeParameterX"];
      var physicsShapeParameterY = metaData["physicsShapeParameterY"];
      var physicsShapeParameterZ = metaData["physicsShapeParameterZ"];

      var geomKey = (
        "PlaneBufferGeometry" + PIPE +
        width + PIPE + height + PIPE +
        widthSegments + PIPE + heightSegments
      );
      var geom = geometryCache[geomKey];
      if (!geom){
        geom = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
        geometryCache[geomKey] = geom;
      }
      var surface = new MeshGenerator(geom, material).generateMesh();

      surface.position.x = positionX;
      surface.position.y = positionY;
      surface.position.z = positionZ;
      surface.quaternion.x = quaternionX;
      surface.quaternion.y = quaternionY;
      surface.quaternion.z = quaternionZ;
      surface.quaternion.w = quaternionW;

      scene.add(surface);

      var surfacePhysicsBody = physicsBodyGenerator.generateBoxBody({
        x: physicsShapeParameterX, y: physicsShapeParameterY, z: physicsShapeParameterZ, mass: mass
      });
      surfacePhysicsBody.position.set(
        positionX,
        positionY,
        positionZ
      );
      physicsWorld.addBody(surfacePhysicsBody);
      addedObjectInstance = new AddedObject(addedObjectName, "surface", metaData, material, surface, surfacePhysicsBody, destroyedGrids);
      surface.addedObject = addedObjectInstance;
    }else if (type == "ramp"){
      var rampHeight = metaData["rampHeight"];
      var rampWidth = metaData["rampWidth"];
      var quaternionX = metaData["quaternionX"];
      var quaternionY = metaData["quaternionY"];
      var quaternionZ = metaData["quaternionZ"];
      var quaternionW = metaData["quaternionW"];
      var centerX = metaData["centerX"];
      var centerY = metaData["centerY"];
      var centerZ = metaData["centerZ"];
      var fromEulerX = metaData["fromEulerX"];
      var fromEulerY = metaData["fromEulerY"];
      var fromEulerZ = metaData["fromEulerZ"];

      var geomKey = (
        "PlaneBufferGeometry" + PIPE +
        rampWidth + PIPE + rampHeight + PIPE +
        widthSegments + PIPE + heightSegments
      );
      var geom = geometryCache[geomKey];
      if (!geom){
        geom = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, widthSegments, heightSegments);
        geometryCache[geomKey] = geom;
      }
      var ramp = new MeshGenerator(geom, material).generateMesh();
      ramp.position.x = centerX;
      ramp.position.y = centerY;
      ramp.position.z = centerZ;
      ramp.quaternion.x = quaternionX;
      ramp.quaternion.y = quaternionY;
      ramp.quaternion.z = quaternionZ;
      ramp.quaternion.w = quaternionW;
      if (!metaData.physicsShapeParameterX){
        metaData.physicsShapeParameterX = metaData.rampWidth / 2;
      }
      if (!metaData.physicsShapeParameterY){
        metaData.physicsShapeParameterY = surfacePhysicalThickness;
      }
      if (!metaData.physicsShapeParameterZ){
        metaData.physicsShapeParameterZ = metaData.rampHeight / 2;
      }
      var rampPhysicsBody = physicsBodyGenerator.generateBoxBody({
        x: metaData.physicsShapeParameterX, y: metaData.physicsShapeParameterY, z: metaData.physicsShapeParameterZ,
        mass: mass
      });
      rampPhysicsBody.position.set(
        ramp.position.x,
        ramp.position.y,
        ramp.position.z
      );
      if (!isNaN(fromEulerX) && !isNaN(fromEulerY) && !isNaN(fromEulerZ)){
        rampPhysicsBody.quaternion.setFromEuler(
          fromEulerX,
          fromEulerY,
          fromEulerZ
        );
      }
      scene.add(ramp);
      physicsWorld.addBody(rampPhysicsBody);
      addedObjectInstance = new AddedObject(
        addedObjectName, "ramp", metaData, material, ramp,
        rampPhysicsBody, new Object()
      );
      ramp.addedObject = addedObjectInstance;
    }else if (type == "sphere"){
      var radius = metaData["radius"];
      var centerX = metaData["centerX"];
      var centerY = metaData["centerY"];
      var centerZ = metaData["centerZ"];
      if (!metaData.physicsShapeParameterRadius){
        metaData.physicsShapeParameterRadius = metaData.radius;
      }
      var spherePhysicsBody = physicsBodyGenerator.generateSphereBody({radius: metaData.physicsShapeParameterRadius, mass: mass});
      var sphereMesh;
      var sphereClone;
      var axis = metaData["gridSystemAxis"];
      var geomKey = (
        "SphereBufferGeometry" + PIPE +
        Math.abs(radius) + PIPE +
        widthSegments + PIPE + heightSegments
      );
      var geom = geometryCache[geomKey];
      if (!geom){
        geom = new THREE.SphereBufferGeometry(Math.abs(radius), widthSegments, heightSegments);
        geometryCache[geomKey] = geom;
      }
      sphereMesh = new MeshGenerator(geom, material).generateMesh();
      sphereMesh.position.x = centerX;
      sphereMesh.position.y = centerY;
      sphereMesh.position.z = centerZ;
      scene.add(sphereMesh);
      spherePhysicsBody.position.set(
        sphereMesh.position.x,
        sphereMesh.position.y,
        sphereMesh.position.z
      );
      physicsWorld.addBody(spherePhysicsBody);
      addedObjectInstance = new AddedObject(
        addedObjectName, "sphere", metaData, material,
        sphereMesh, spherePhysicsBody, destroyedGrids
      );
      sphereMesh.addedObject = addedObjectInstance;
    }else if (type == "cylinder"){
      var cylinderHeight = metaData["height"];
      var topRadius = metaData["topRadius"];
      var bottomRadius = metaData["bottomRadius"];
      var isOpenEnded = metaData["isOpenEnded"];
      var geomKey = "CylinderBufferGeometry" + PIPE + cylinderHeight + PIPE + topRadius + PIPE +
                    bottomRadius + PIPE + widthSegments + PIPE + heightSegments + PIPE + isOpenEnded;
      var cylinderGeometry = geometryCache[geomKey];
      if (!cylinderGeometry){
        cylinderGeometry = new THREE.CylinderBufferGeometry(
          topRadius, bottomRadius, cylinderHeight, widthSegments, heightSegments, isOpenEnded
        );
        geometryCache[geomKey] = cylinderGeometry;
      }
      var cylinderMesh = new MeshGenerator(cylinderGeometry, material).generateMesh();
      var centerX = metaData["centerX"];
      var centerY = metaData["centerY"];
      var centerZ = metaData["centerZ"];
      cylinderMesh.position.set(centerX, centerY, centerZ);
      scene.add(cylinderMesh);
      if (metaData.gridSystemAxis == "XY"){
        cylinderMesh.rotateX(Math.PI/2);
      }else if (metaData.gridSystemAxis == "YZ"){
        cylinderMesh.rotateZ(-Math.PI/2);
      }
      if (!metaData.physicsShapeParameterRadialSegments){
          metaData.physicsShapeParameterRadialSegments = 8;
      }
      var cylinderPhysicsBody = physicsBodyGenerator.generateCylinderBody({
        topRadius: metaData.physicsShapeParameterTopRadius, bottomRadius: metaData.physicsShapeParameterBottomRadius,
        height: metaData.physicsShapeParameterHeight, axis: metaData.physicsShapeParameterAxis,
        radialSegments: metaData.physicsShapeParameterRadialSegments, mass: mass
      })
      cylinderPhysicsBody.position.set(centerX, centerY, centerZ);
      physicsWorld.addBody(cylinderPhysicsBody);
      addedObjectInstance = new AddedObject(
        addedObjectName, "cylinder", metaData, material,
        cylinderMesh, cylinderPhysicsBody, destroyedGrids
      );
      cylinderMesh.addedObject = addedObjectInstance;
    }
    addedObjectInstance.associatedTexturePack = curAddedObjectExport.associatedTexturePack;
    addedObjectInstance.metaData["widthSegments"] = widthSegments;
    addedObjectInstance.metaData["heightSegments"] = heightSegments;
    addedObjectInstance.metaData["depthSegments"] = depthSegments;
    addedObjectInstance.isDynamicObject = isDynamicObject;
    addedObjectInstance.mass = mass;

    addedObjectInstance.metaData["textureRepeatU"] = curAddedObjectExport.textureRepeatU;
    addedObjectInstance.metaData["textureRepeatV"] = curAddedObjectExport.textureRepeatV;

    if (!curAddedObjectExport.fromObjectGroup){

      var rotationX = curAddedObjectExport.rotationX;
      var rotationY = curAddedObjectExport.rotationY;
      var rotationZ = curAddedObjectExport.rotationZ;
      addedObjectInstance.rotationX = rotationX;
      addedObjectInstance.rotationY = rotationY;
      addedObjectInstance.rotationZ = rotationZ;
      addedObjectInstance.mesh.quaternion.set(
        curAddedObjectExport.quaternionX,
        curAddedObjectExport.quaternionY,
        curAddedObjectExport.quaternionZ,
        curAddedObjectExport.quaternionW
      );
      addedObjectInstance.physicsBody.quaternion.set(
        curAddedObjectExport.pQuaternionX,
        curAddedObjectExport.pQuaternionY,
        curAddedObjectExport.pQuaternionZ,
        curAddedObjectExport.pQuaternionW
      );
      addedObjectInstance.initQuaternion.copy(addedObjectInstance.mesh.quaternion);
      addedObjectInstance.physicsBody.initQuaternion.copy(addedObjectInstance.physicsBody.quaternion);
    }else{
      addedObjectInstance.mesh.quaternion.set(
        curAddedObjectExport.quaternionX,
        curAddedObjectExport.quaternionY,
        curAddedObjectExport.quaternionZ,
        curAddedObjectExport.quaternionW
      );
      addedObjectInstance.physicsBody.quaternion.set(
        curAddedObjectExport.pQuaternionX,
        curAddedObjectExport.pQuaternionY,
        curAddedObjectExport.pQuaternionZ,
        curAddedObjectExport.pQuaternionW
      );
    }

    if (curAddedObjectExport.blendingMode == "NO_BLENDING"){
      addedObjectInstance.setBlending(NO_BLENDING);
    }else if (curAddedObjectExport.blendingMode == "ADDITIVE_BLENDING"){
      addedObjectInstance.setBlending(ADDITIVE_BLENDING);
    }else if (curAddedObjectExport.blendingMode == "SUBTRACTIVE_BLENDING"){
      addedObjectInstance.setBlending(SUBTRACTIVE_BLENDING);
    }else if (curAddedObjectExport.blendingMode == "MULTIPLY_BLENDING"){
      addedObjectInstance.setBlending(MULTIPLY_BLENDING);
    }else if (curAddedObjectExport.blending == "NORMAL_BLENDING"){
      addedObjectInstance.setBlending(NORMAL_BLENDING);
    }

    if (curAddedObjectExport.isSlippery){
      addedObjectInstance.setSlippery(true);
    }

    addedObjectInstance.isChangeable = curAddedObjectExport.isChangeable;
    addedObjectInstance.isIntersectable = curAddedObjectExport.isIntersectable;
    if (typeof addedObjectInstance.isIntersectable == UNDEFINED){
      addedObjectInstance.isIntersectable = true;
    }
    addedObjectInstance.isColorizable = curAddedObjectExport.isColorizable;
    if (addedObjectInstance.isColorizable){
      macroHandler.injectMacro("HAS_FORCED_COLOR", addedObjectInstance.mesh.material, false, true);
      addedObjectInstance.mesh.material.uniforms.forcedColor = new THREE.Uniform(new THREE.Vector4(-50, 0, 0, 0));
    }

    if (curAddedObjectExport.noMass){
      addedObjectInstance.noMass = true;
      physicsWorld.remove(addedObjectInstance.physicsBody);
    }

    if (curAddedObjectExport.softCopyParentName){
      addedObjectInstance.softCopyParentName = curAddedObjectExport.softCopyParentName;
    }

    addedObjectInstance.mesh.material.setEmissiveIntensity = curAddedObjectExport.emissiveIntensity;
    addedObjectInstance.mesh.material.setEmissiveColor = curAddedObjectExport.emissiveColor;
    addedObjectInstance.mesh.material.uniforms.setAOIntensity = curAddedObjectExport.aoMapIntensity;

    addedObjects[addedObjectName] = addedObjectInstance;
    if (curAddedObjectExport.isRotationDirty){
      addedObjectInstance.isRotationDirty = true;
    }
    addedObjectInstance.rotationX = curAddedObjectExport.rotationX;
    addedObjectInstance.rotationY = curAddedObjectExport.rotationY;
    addedObjectInstance.rotationZ = curAddedObjectExport.rotationZ;

     if (!(typeof addedObjectInstance.metaData.slicedType == UNDEFINED)){
       addedObjectInstance.sliceInHalf(addedObjectInstance.metaData.slicedType);
     }
     if (addedObjectInstance.metaData.renderSide){
       addedObjectInstance.handleRenderSide(addedObjectInstance.metaData.renderSide);
     }

     addedObjectInstance.areaVisibilityConfigurations = curAddedObjectExport.areaVisibilityConfigurations;
     addedObjectInstance.areaSideConfigurations = curAddedObjectExport.areaSideConfigurations;

     if (curAddedObjectExport.hasPivot){
       var pivot = addedObjectInstance.makePivot(
         curAddedObjectExport.pivotOffsetX,
         curAddedObjectExport.pivotOffsetY,
         curAddedObjectExport.pivotOffsetZ
       );
       pivot.quaternion.set(
         curAddedObjectExport.pivotQX, curAddedObjectExport.pivotQY,
         curAddedObjectExport.pivotQZ, curAddedObjectExport.pivotQW
       );
       pivot.children[0].quaternion.set(
         curAddedObjectExport.insidePivotQX, curAddedObjectExport.insidePivotQY,
         curAddedObjectExport.insidePivotQZ, curAddedObjectExport.insidePivotQW
       );
       addedObjectInstance.pivotObject = pivot;
       addedObjectInstance.pivotOffsetX = curAddedObjectExport.pivotOffsetX;
       addedObjectInstance.pivotOffsetY = curAddedObjectExport.pivotOffsetY;
       addedObjectInstance.pivotOffsetZ = curAddedObjectExport.pivotOffsetZ;
       addedObjectInstance.mesh.position.set(
         curAddedObjectExport.positionX, curAddedObjectExport.positionY, curAddedObjectExport.positionZ
       );
       addedObjectInstance.physicsBody.position.copy(addedObjectInstance.mesh.position);
     }else if (curAddedObjectExport.pivotRemoved){
       addedObjectInstance.mesh.position.set(
         curAddedObjectExport.positionX, curAddedObjectExport.positionY, curAddedObjectExport.positionZ
       );
       addedObjectInstance.physicsBody.position.copy(addedObjectInstance.mesh.position);
       addedObjectInstance.pivotRemoved = true;
     }

     if (curAddedObjectExport.txtMatrix){
       addedObjectInstance.setTxtMatrix = curAddedObjectExport.txtMatrix;
     }
     addedObjectInstance.mesh.material.uniforms.alpha.value = curAddedObjectExport.opacity;
     if (!(typeof curAddedObjectExport.aoMapIntensity == UNDEFINED)){
       addedObjectInstance.setAOIntensity = curAddedObjectExport.aoMapIntensity;
     }
     if (!(typeof curAddedObjectExport.emissiveIntensity == UNDEFINED)){
       addedObjectInstance.setEmissiveIntensity = curAddedObjectExport.emissiveIntensity;
     }
     if (!(typeof curAddedObjectExport.emissiveColor == UNDEFINED)){
       addedObjectInstance.setEmissiveColor = curAddedObjectExport.emissiveColor;
     }
     if (!(typeof curAddedObjectExport.positionWhenUsedAsFPSWeapon == UNDEFINED)){
       addedObjectInstance.isFPSWeapon = true;
       var positionWhenUsedAsFPSWeapon = curAddedObjectExport.positionWhenUsedAsFPSWeapon;
       var quaternionWhenUsedAsFPSWeapon = curAddedObjectExport.quaternionWhenUsedAsFPSWeapon;
       var physicsPositionWhenUsedAsFPSWeapon = curAddedObjectExport.physicsPositionWhenUsedAsFPSWeapon;
       var physicsQuaternionWhenUsedAsFPSWeapon = curAddedObjectExport.physicsQuaternionWhenUsedAsFPSWeapon;
       addedObjectInstance.positionWhenUsedAsFPSWeapon = new THREE.Vector3(positionWhenUsedAsFPSWeapon.x, positionWhenUsedAsFPSWeapon.y, positionWhenUsedAsFPSWeapon.z);
       addedObjectInstance.quaternionWhenUsedAsFPSWeapon = new THREE.Quaternion(quaternionWhenUsedAsFPSWeapon._x, quaternionWhenUsedAsFPSWeapon._y, quaternionWhenUsedAsFPSWeapon._z, quaternionWhenUsedAsFPSWeapon._w);
       addedObjectInstance.physicsPositionWhenUsedAsFPSWeapon = new THREE.Vector3(physicsPositionWhenUsedAsFPSWeapon.x, physicsPositionWhenUsedAsFPSWeapon.y, physicsPositionWhenUsedAsFPSWeapon.z);
       addedObjectInstance.physicsQuaternionWhenUsedAsFPSWeapon = new THREE.Quaternion(physicsQuaternionWhenUsedAsFPSWeapon._x, physicsQuaternionWhenUsedAsFPSWeapon._y, physicsQuaternionWhenUsedAsFPSWeapon._z, physicsQuaternionWhenUsedAsFPSWeapon._w);
       addedObjectInstance.fpsWeaponAlignment = curAddedObjectExport.fpsWeaponAlignment;
     }
     if (curAddedObjectExport.hasCustomPrecision){
       addedObjectInstance.useCustomShaderPrecision(curAddedObjectExport.customPrecision);
     }
     if (curAddedObjectExport.objectTrailConfigurations){
       addedObjectInstance.objectTrailConfigurations = {alpha: curAddedObjectExport.objectTrailConfigurations.alpha, time: curAddedObjectExport.objectTrailConfigurations.time};
     }
     if (curAddedObjectExport.muzzleFlashParameters){
       addedObjectInstance.muzzleFlashParameters = curAddedObjectExport.muzzleFlashParameters;
     }
  }
  for (var objName in addedObjects){
    if (addedObjects[objName].softCopyParentName){
      var softCopyParent = addedObjects[addedObjects[objName].softCopyParentName];
      if (softCopyParent){
        addedObjects[objName].mesh.material = softCopyParent.mesh.material;
      }else{
        for (var objName2 in addedObjects){
          if (objName2 != objName){
            if (addedObjects[objName2].softCopyParentName &&
              addedObjects[objName2].softCopyParentName == addedObjects[objName].softCopyParentName){
              addedObjects[objName].mesh.material = addedObjects[objName2].mesh.material;
            }
          }
        }
      }
    }
  }
}

ImportHandler.prototype.importTexturePacks = function(obj, callback){
  var texturePacksExport = obj.texturePacks;
  for (var texturePackName in texturePacksExport){
    var curTexturePackExport = texturePacksExport[texturePackName];
    var texturePack = new TexturePack(texturePackName, curTexturePackExport.directoryName, curTexturePackExport.textureDescription);
    texturePack.setParticleTextureStatus(curTexturePackExport.isParticleTexture);
    texturePack.loadTextures(function(){
      this.mapLoadedTexturePack(this.texturePackName, obj);
      callback();
    }.bind({texturePackName: texturePackName, mapLoadedTexturePack: this.mapLoadedTexturePack}));
    texturePacks[texturePackName] = texturePack;
  }
}

ImportHandler.prototype.mapLoadedTexturePack = function(texturePackName, exportObj){
  var texturePack = texturePacks[texturePackName];
  for (var objectGroupName in objectGroups){
    var group = objectGroups[objectGroupName].group;
    for (var objectName in group){
      addedObjects[objectName] = group[objectName];
    }
  }
  for (var addedObjectName in addedObjects){
    var addedObject = addedObjects[addedObjectName];
    var material = addedObject.mesh.material;

    var addedObjectExport = exportObj.addedObjects[addedObjectName];
    if (!addedObjectExport){
      return;
    }
    var diffuseRoygbivTexturePackName;
    var alphaRoygbivTexturePackName;
    var aoRoygbivTexturePackName;
    var emissiveRoygbivTexturePackName;
    var displacementRoygbivTexturePackName;

    diffuseRoygbivTexturePackName = addedObjectExport["diffuseRoygbivTexturePackName"];
    alphaRoygbivTexturePackName = addedObjectExport["alphaRoygbivTexturePackName"];
    aoRoygbivTexturePackName = addedObjectExport["aoRoygbivTexturePackName"];
    emissiveRoygbivTexturePackName = addedObjectExport["emissiveRoygbivTexturePackName"];
    displacementRoygbivTexturePackName = addedObjectExport["displacementRoygbivTexturePackName"];

    var textureRepeatU, textureRepeatV;
    if (!(typeof addedObjectExport["textureRepeatU"] == UNDEFINED)){
      textureRepeatU = addedObjectExport["textureRepeatU"];
      addedObject.metaData["textureRepeatU"] = textureRepeatU;
    }
    if (!(typeof addedObjectExport["textureRepeatV"] == UNDEFINED)){
      textureRepeatV = addedObjectExport["textureRepeatV"];
      addedObject.metaData["textureRepeatV"] = textureRepeatV;
    }

    var mirrorS = false;
    var mirrorT = false;
    if (!(typeof addedObjectExport.metaData.mirrorS == UNDEFINED)){
      if (addedObjectExport.metaData.mirrorS == "ON"){
        mirrorS = true;
      }
    }
    if (!(typeof addedObjectExport.metaData.mirrorT == UNDEFINED)){
      if (addedObjectExport.metaData.mirrorT == "ON"){
        mirrorT = true;
      }
    }

    var textureOffsetX, textureOffsetY;
    if (!(typeof addedObjectExport.textureOffsetX == UNDEFINED)){
      textureOffsetX = addedObjectExport.textureOffsetX;
    }else{
      textureOffsetX = 0;
    }
    if (!(typeof addedObjectExport.textureOffsetY == UNDEFINED)){
      textureOffsetY = addedObjectExport.textureOffsetY;
    }else{
      textureOffsetY = 0;
    }

    var displacementScale, displacementBias;
    if (!(typeof addedObjectExport.displacementScale == UNDEFINED)){
      displacementScale = addedObjectExport.displacementScale;
    }
    if (!(typeof addedObjectExport.displacementBias == UNDEFINED)){
      displacementBias = addedObjectExport.displacementBias;
    }
    if (diffuseRoygbivTexturePackName){
      if (diffuseRoygbivTexturePackName == texturePackName){
        if (texturePack.hasDiffuse){
          addedObject.mapDiffuse(texturePack.diffuseTexture);
          material.uniforms.diffuseMap.value.roygbivTexturePackName = texturePackName;
          if (!(typeof textureOffsetX == UNDEFINED)){
            material.uniforms.diffuseMap.value.offset.x = textureOffsetX;
          }
          if (!(typeof textureOffsetY == UNDEFINED)){
            material.uniforms.diffuseMap.value.offset.y = textureOffsetY;
          }
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.uniforms.diffuseMap.value.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.uniforms.diffuseMap.value.repeat.y = textureRepeatV;
          }
          material.uniforms.diffuseMap.value.needsUpdate = true;
          material.uniforms.diffuseMap.value.updateMatrix();
        }
      }
    }
    if (alphaRoygbivTexturePackName){
      if (alphaRoygbivTexturePackName == texturePackName){
        if (texturePack.hasAlpha){
          addedObject.mapAlpha(texturePack.alphaTexture);
          material.uniforms.alphaMap.value.roygbivTexturePackName = texturePackName;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.uniforms.alphaMap.value.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.uniforms.alphaMap.value.repeat.y = textureRepeatV;
          }
          material.uniforms.alphaMap.value.needsUpdate = true;
          material.uniforms.alphaMap.value.updateMatrix();
        }
      }
    }
    if (aoRoygbivTexturePackName){
      if (aoRoygbivTexturePackName == texturePackName){
        if (texturePack.hasAO){
          addedObject.mapAO(texturePack.aoTexture);
          material.uniforms.aoMap.value.roygbivTexturePackName = texturePackName;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.uniforms.aoMap.value.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.uniforms.aoMap.value.repeat.y = textureRepeatV;
          }
          material.uniforms.aoMap.value.needsUpdate = true;
          material.uniforms.aoMap.value.updateMatrix();
        }
      }
    }
    if (emissiveRoygbivTexturePackName){
      if (emissiveRoygbivTexturePackName == texturePackName){
        if (texturePack.hasEmissive){
          addedObject.mapEmissive(texturePack.emissiveTexture);
          material.uniforms.emissiveMap.value.roygbivTexturePackName = texturePackName;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.uniforms.emissiveMap.value.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.uniforms.emissiveMap.value.repeat.y = textureRepeatV;
          }
          material.uniforms.emissiveMap.value.needsUpdate = true;
          material.uniforms.emissiveMap.value.updateMatrix();
        }
      }
    }
    if (displacementRoygbivTexturePackName){
      if (displacementRoygbivTexturePackName == texturePackName){
        if (texturePack.hasHeight){
          addedObject.mapDisplacement(texturePack.heightTexture);
          material.uniforms.displacementMap.value.roygbivTexturePackName = texturePackName;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.uniforms.displacementMap.value.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.uniforms.displacementMap.value.repeat.y = textureRepeatV;
          }
          if (!(typeof displacementScale == UNDEFINED)){
            material.uniforms.displacementInfo.value.x = displacementScale;
          }
          if (!(typeof displacementBias == UNDEFINED)){
            material.uniforms.displacementInfo.value.y = displacementBias;
          }
          material.uniforms.displacementMap.value.needsUpdate = true;
          material.uniforms.displacementMap.value.updateMatrix();
        }
      }
    }
    if (mirrorS || mirrorT){
      if (mirrorS && ! mirrorT){
        addedObject.handleMirror("S", "ON");
      }else if (mirrorT && !mirrorS){
        addedObject.handleMirror("T", "ON");
      }else{
        addedObject.handleMirror("ST", "ON");
      }
    }
  }
  for (var objectGroupName in objectGroups){
    var group = objectGroups[objectGroupName].group;
    for (var objectName in group){
      delete addedObjects[objectName];
    }
  }
}

ImportHandler.prototype.importTextureAtlas = function(obj, callback){
  if (obj.textureAtlas && obj.textureAtlas.hasTextureAtlas){
    textureAtlasHandler.import(obj.textureAtlas, callback);
    if (!isDeployment){
      terminal.printInfo(Text.GENERATING_TEXTURE_ATLAS);
    }
  }
}

ImportHandler.prototype.importSkyboxes = function(obj, callback){
  var skyBoxScale = obj.skyBoxScale;
  var skyboxExports = obj.skyBoxes;
  skyboxVisible = obj.skyboxVisible;
  mappedSkyboxName = obj.mappedSkyboxName;
  for (var skyboxName in skyboxExports){
    var skyboxExport = skyboxExports[skyboxName];
    var skybox = new SkyBox(skyboxExport.name, skyboxExport.directoryName, skyboxExport.color);
    skyBoxes[skyboxExport.name] = skybox;
    skybox.loadTextures(function(){
      if (!(typeof mappedSkyboxName == UNDEFINED) && (this.skyboxName == mappedSkyboxName)){
        if (skyboxMesh){
          scene.remove(skyboxMesh);
        }else{
          var geomKey = ("BoxBufferGeometry" + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE + "1" + PIPE + "1" + PIPE + "1");
          var skyboxBufferGeometry = geometryCache[geomKey];
          if (!skyboxBufferGeometry){
            skyboxBufferGeometry = new THREE.BoxBufferGeometry(skyboxDistance, skyboxDistance, skyboxDistance);
            geometryCache[geomKey] = skyboxBufferGeometry;
          }
          skyboxMesh = new MeshGenerator(skyboxBufferGeometry, null).generateSkybox(skyBoxes[this.skyboxName], false);
          skyboxMesh.renderOrder = renderOrders.SKYBOX;
        }
        if (skyboxVisible){
          scene.add(skyboxMesh);
        }
        if (this.skyBoxScale){
          skyboxMesh.scale.x = this.skyBoxScale;
          skyboxMesh.scale.y = this.skyBoxScale;
          skyboxMesh.scale.z = this.skyBoxScale;
        }
      }
      callback();
    }.bind({skyboxName: skyboxName, skyBoxScale: skyBoxScale}));
  }
}
