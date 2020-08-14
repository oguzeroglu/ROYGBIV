var ImportHandler = function(){

}

ImportHandler.prototype.importSteeringHandler = function(obj){
  steeringHandler.import(obj.steeringHandler);

  for (var objName in obj.addedObjects){
    var steerableInfo = obj.addedObjects[objName].steerableInfo;
    if (steerableInfo){
      var addedObject = addedObjects[objName];
      addedObject.makeSteerable(steerableInfo.mode, steerableInfo.maxSpeed, steerableInfo.maxAcceleration, steerableInfo.jumpSpeed, steerableInfo.lookSpeed);
      for (var i = 0; i < steerableInfo.behaviorIDs.length; i ++){
        addedObject.steerableInfo.behaviorsByID[steerableInfo.behaviorIDs[i]] = steeringHandler.usedBehaviorIDs[steerableInfo.behaviorIDs[i]];
      }
    }
  }

  for (var objName in obj.objectGroups){
    var steerableInfo = obj.objectGroups[objName].steerableInfo;
    if (steerableInfo){
      var objectGroup = objectGroups[objName];
      objectGroup.makeSteerable(steerableInfo.mode, steerableInfo.maxSpeed, steerableInfo.maxAcceleration, steerableInfo.jumpSpeed, steerableInfo.lookSpeed);
      for (var i = 0; i < steerableInfo.behaviorIDs.length; i ++){
        objectGroup.steerableInfo.behaviorsByID[steerableInfo.behaviorIDs[i]] = steeringHandler.usedBehaviorIDs[steerableInfo.behaviorIDs[i]];
      }
    }
  }
}

ImportHandler.prototype.importScenes = function(obj){
  sceneHandler.import(obj.scenes);
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
  LIGHTNING_WORKER_ON = (!(typeof obj.LIGHTNING_WORKER_ON == UNDEFINED))? obj.LIGHTNING_WORKER_ON: true;
  rayCaster = raycasterFactory.get();
  physicsWorld = physicsFactory.get();
  particleSystemRefHeight = obj.particleSystemRefHeight;
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

  ACCEPTED_TEXTURE_SIZE = obj.ACCEPTED_TEXTURE_SIZE;

  LIMIT_BOUNDING_BOX = new THREE.Box3(lowerBound, upperBound);
  BIN_SIZE = parseInt(obj.binSize);
  RAYCASTER_STEP_AMOUNT = parseFloat(obj.raycasterStepAmount);
  if (isNaN(RAYCASTER_STEP_AMOUNT)){
    RAYCASTER_STEP_AMOUNT = 32;
  }
  screenResolution = obj.screenResolution;
  if (obj.useOriginalResolution){
    screenResolution = window.devicePixelRatio;
    useOriginalResolution = true;
  }else{
    useOriginalResolution = false;
  }
  renderer.setPixelRatio(screenResolution);
  GLOBAL_PS_REF_HEIGHT_UNIFORM.value = ((renderer.getCurrentViewport().w / screenResolution) / particleSystemRefHeight);
  defaultMaterialType = obj.defaultMaterialType;
  markedPointsVisible = obj.markedPointsVisible;
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
    if (!(markedPointsVisible && mode == 0)){
      markedPoint.hide();
    }
    markedPoint.showAgainOnTheNextModeSwitch = curMarkedPointExport.showAgainOnTheNextModeSwitch;
    if (mode == 0){
      markedPoint.showAgainOnTheNextModeSwitch = false;
    }
    markedPoints[markedPointName] = markedPoint;
  }
  protocolDefinitionFileName = obj.protocolDefinitionFileName;
  serverWSURL = obj.serverWSURL;
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
    preConfiguredParticleSystemPools[poolName] = new PreconfiguredParticleSystemPool(curExport.refParticleSystemName, curExport.poolName, curExport.poolSize);
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
    if (areasVisible){
      areas[areaName].renderToScreen();
    }
  }
}

ImportHandler.prototype.importScripts = function(obj){
  scriptsHandler.import(obj);
}

ImportHandler.prototype.importFog = function(obj){
  fogHandler.import(obj.fog);
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

    addedObjectInstance.setRotationMode(curAddedObjectExport.rotationMode);

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
       addedObjectInstance.setTxtOffsetX = curAddedObjectExport.textureOffsetX;
       addedObjectInstance.setTxtOffsetY = curAddedObjectExport.textureOffsetY;
     }
     addedObjectInstance.mesh.material.uniforms.alpha.value = curAddedObjectExport.opacity;
     if (!(typeof curAddedObjectExport.aoMapIntensity == UNDEFINED)){
       addedObjectInstance.setAOIntensityValue = curAddedObjectExport.aoMapIntensity;
     }
     if (!(typeof curAddedObjectExport.emissiveIntensity == UNDEFINED)){
       addedObjectInstance.setEmissiveIntensityValue = curAddedObjectExport.emissiveIntensity;
     }
     if (!(typeof curAddedObjectExport.emissiveColor == UNDEFINED)){
       addedObjectInstance.setEmissiveColorValue = curAddedObjectExport.emissiveColor;
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
     if (curAddedObjectExport.noPhysicsContributionWhenGlued){
       addedObjectInstance.noPhysicsContributionWhenGlued = true;
     }
     for (var animationName in curAddedObjectExport.animations){
       var curAnimationExport = curAddedObjectExport.animations[animationName];
       addedObjectInstance.addAnimation(new Animation(animationName, curAnimationExport.type, addedObjectInstance, curAnimationExport.description, curAnimationExport.rewind, curAnimationExport.repeat));
     }
     if (curAddedObjectExport.manualPositionInfo){
       addedObjectInstance.setPosition(curAddedObjectExport.manualPositionInfo.x, curAddedObjectExport.manualPositionInfo.y, curAddedObjectExport.manualPositionInfo.z, true);
     }
     addedObjectInstance.setAffectedByLight(curAddedObjectExport.affectedByLight);
     if (curAddedObjectExport.customDisplacementTextureMatrixInfo){
       addedObjectInstance.setCustomDisplacementTextureMatrix();
       addedObjectInstance.setCustomDisplacementTextureRepeat(curAddedObjectExport.customDisplacementTextureMatrixInfo.repeatU, curAddedObjectExport.customDisplacementTextureMatrixInfo.repeatV);
       addedObjectInstance.setCustomDisplacementTextureOffset(curAddedObjectExport.customDisplacementTextureMatrixInfo.offsetX, curAddedObjectExport.customDisplacementTextureMatrixInfo.offsetY);
     }

     addedObjectInstance.usedAsAIEntity = curAddedObjectExport.usedAsAIEntity;
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

ImportHandler.prototype.importTexturePacks = function(obj, callback, skipMapping){
  var texturePacksToMap = [];
  var texturePacksExport = obj.texturePacks;
  for (var texturePackName in texturePacksExport){
    var curTexturePackExport = texturePacksExport[texturePackName];
    var texturePack = new TexturePack(texturePackName, curTexturePackExport.directoryName, curTexturePackExport.textureDescription);
    texturePacks[texturePackName] = texturePack;
    texturePack.loadTextures(true, function(){
      if (!skipMapping){
        texturePacksToMap.push(texturePacks[this.texturePackName]);
      }
      callback(texturePacksToMap);
    }.bind({texturePackName: texturePackName, mapLoadedTexturePack: this.mapLoadedTexturePack}));
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

    var shouldMap = addedObjectExport["diffuseRoygbivTexturePackName"] == texturePackName ||
                    addedObjectExport["alphaRoygbivTexturePackName"] == texturePackName ||
                    addedObjectExport["aoRoygbivTexturePackName"] == texturePackName ||
                    addedObjectExport["emissiveRoygbivTexturePackName"] == texturePackName ||
                    addedObjectExport["displacementRoygbivTexturePackName"] == texturePackName;

    if (!shouldMap) {
      continue;
    }

    addedObject.mapTexturePack(texturePacks[texturePackName]);

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
    var displacementScale, displacementBias;
    if (!(typeof addedObjectExport.displacementScale == UNDEFINED)){
      displacementScale = addedObjectExport.displacementScale;
    }
    if (!(typeof addedObjectExport.displacementBias == UNDEFINED)){
      displacementBias = addedObjectExport.displacementBias;
    }
    if (addedObjectExport["displacementRoygbivTexturePackName"]){
      if (addedObjectExport["displacementRoygbivTexturePackName"] == texturePackName){
        if (texturePack.hasHeight){
          if (!(typeof displacementScale == UNDEFINED)){
            addedObject.setDisplacementScale(displacementScale);
          }
          if (!(typeof displacementBias == UNDEFINED)){
            addedObject.setDisplacementBias(displacementBias);
          }
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

ImportHandler.prototype.importTextureAtlas = function(obj, callback, texturePacksToMap){
  if (obj.textureAtlas && obj.textureAtlas.hasTextureAtlas){
    textureAtlasHandler.import(obj.textureAtlas, function(){
      callback(texturePacksToMap);
    });
    if (!isDeployment){
      terminal.printInfo(Text.GENERATING_TEXTURE_ATLAS);
    }
  }
}

ImportHandler.prototype.importSkyboxes = function(obj, callback){
  var skyboxExports = obj.skyBoxes;
  for (var skyboxName in skyboxExports){
    var skyboxExport = skyboxExports[skyboxName];
    var skybox = new SkyBox(skyboxExport.name, skyboxExport.directoryName, skyboxExport.color);
    skyBoxes[skyboxExport.name] = skybox;
    skybox.loadTextures(callback);
  }
}

ImportHandler.prototype.importAddedTexts = function(obj){
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
      addedTextInstance.setBackground("#" + new THREE.Color(curTextExport.backgroundColorR, curTextExport.backgroundColorG, curTextExport.backgroundColorB).getHexString(), curTextExport.backgroundAlpha);
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
      macroHandler.injectMacro("IS_TWO_DIMENSIONAL", addedTextInstance.material, true, true);
      addedTextInstance.mesh.material.uniforms.inputLineInfo = new THREE.Uniform(new THREE.Vector2(-500, -500));
      addedTextInstance.mesh.material.uniforms.currentViewport = GLOBAL_VIEWPORT_UNIFORM;
      delete addedTextInstance.mesh.material.uniforms.cameraQuaternion;
      delete addedTextInstance.mesh.material.uniforms.modelViewMatrix;
      delete addedTextInstance.mesh.material.uniforms.projectionMatrix;
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
    for (var animationName in curTextExport.animations){
      var curAnimationExport = curTextExport.animations[animationName];
      addedTextInstance.addAnimation(new Animation(animationName, curAnimationExport.type, addedTextInstance, curAnimationExport.description, curAnimationExport.rewind, curAnimationExport.repeat));
    }
  }
}

ImportHandler.prototype.importAddedObjectGraphicsProperties = function(){
  for (var objName in addedObjects){
    var addedObject = addedObjects[objName];
    if (addedObject.setTxtMatrix && addedObject.mesh.material.uniforms.textureMatrix){
      for (var ix = 0; ix<addedObject.setTxtMatrix.length; ix++){
        addedObject.mesh.material.uniforms.textureMatrix.value.elements[ix] = addedObject.setTxtMatrix[ix];
      }
      addedObject.setTextureOffsetX(addedObject.setTxtOffsetX);
      addedObject.setTextureOffsetY(addedObject.setTxtOffsetY);
      delete addedObject.setTxtMatrix;
      delete addedObject.setTxtOffsetX;
      delete addedObject.setTxtOffsetY;
    }
    if (addedObject.hasEmissiveMap()){
      if (!(typeof addedObject.setEmissiveIntensityValue == UNDEFINED)){
        addedObject.setEmissiveIntensity(addedObject.setEmissiveIntensityValue);
        delete addedObject.setEmissiveIntensityValue;
      }
      if (!(typeof addedObject.setEmissiveColorValue == UNDEFINED)){
        REUSABLE_COLOR.set(addedObject.setEmissiveColorValue);
        addedObject.setEmissiveColor(REUSABLE_COLOR);
        delete addedObject.setEmissiveColorValue;
      }
    }
    if (addedObject.hasAOMap()){
      if (!(typeof addedObject.setAOIntensityValue == UNDEFINED)){
        addedObject.setAOIntensity(addedObject.setAOIntensityValue);
        delete addedObject.setAOIntensityValue;
      }
    }
  }
}

ImportHandler.prototype.importObjectGroups = function(obj){
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
    var simplifiedChildrenPhysicsBodies = [];
    if (curObjectGroupExport.simplifiedChildrenPhysicsBodyDescriptions){
      for (var i = 0; i<curObjectGroupExport.simplifiedChildrenPhysicsBodyDescriptions.length; i++){
        var curDescription = curObjectGroupExport.simplifiedChildrenPhysicsBodyDescriptions[i];
        var simplifiedBody = physicsBodyGenerator.generateBoxBody({x: curDescription.sizeX, y: curDescription.sizeY, z: curDescription.sizeZ});
        simplifiedBody.position.set(curDescription.pbodyPosition.x, curDescription.pbodyPosition.y, curDescription.pbodyPosition.z);
        simplifiedBody.quaternion.set(curDescription.pbodyQuaternion.x, curDescription.pbodyQuaternion.y, curDescription.pbodyQuaternion.z, curDescription.pbodyQuaternion.w);
        simplifiedChildrenPhysicsBodies.push(simplifiedBody);
      }
      objectGroupInstance.simplifiedChildrenPhysicsBodyDescriptions = curObjectGroupExport.simplifiedChildrenPhysicsBodyDescriptions;
    }
    objectGroupInstance.glue(simplifiedChildrenPhysicsBodies);
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
    objectGroupInstance.physicsBody.initQuaternion = new CANNON.Quaternion().copy(objectGroupInstance.graphicsGroup.quaternion);

    objectGroupInstance.setRotationMode(curObjectGroupExport.rotationMode);

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
    if (objectGroupInstance.mesh.material.uniforms.totalTextureOffset){
      objectGroupInstance.setTextureOffsetX(curObjectGroupExport.totalTextureOffsetX);
      objectGroupInstance.setTextureOffsetY(curObjectGroupExport.totalTextureOffsetY);
    }
    if (objectGroupInstance.mesh.material.uniforms.totalAOIntensity){
      objectGroupInstance.setAOIntensity(curObjectGroupExport.totalAOIntensity);
    }
    if (objectGroupInstance.mesh.material.uniforms.totalEmissiveIntensity){
      objectGroupInstance.setEmissiveIntensity(curObjectGroupExport.totalEmissiveIntensity);
    }
    if (objectGroupInstance.mesh.material.uniforms.totalEmissiveColor){
      REUSABLE_COLOR.set(curObjectGroupExport.totalEmissiveColor);
      objectGroupInstance.setEmissiveColor(REUSABLE_COLOR);
    }
    if (objectGroupInstance.mesh.material.uniforms.totalDisplacementInfo){
      objectGroupInstance.setDisplacementScale(curObjectGroupExport.totalDisplacementScale);
      objectGroupInstance.setDisplacementBias(curObjectGroupExport.totalDisplacementBias);
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
    for (var animationName in curObjectGroupExport.animations){
      var curAnimationExport = curObjectGroupExport.animations[animationName];
      objectGroupInstance.addAnimation(new Animation(animationName, curAnimationExport.type, objectGroupInstance, curAnimationExport.description, curAnimationExport.rewind, curAnimationExport.repeat));
    }
    if (curObjectGroupExport.manualPositionInfo){
      objectGroupInstance.setPosition(curObjectGroupExport.manualPositionInfo.x, curObjectGroupExport.manualPositionInfo.y, curObjectGroupExport.manualPositionInfo.z, true);
    }
    objectGroupInstance.setAffectedByLight(curObjectGroupExport.affectedByLight);
    objectGroupInstance.usedAsAIEntity = curObjectGroupExport.usedAsAIEntity;
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
}

ImportHandler.prototype.importFonts = function(obj, callbackSuccess, callbackError){
  for (var fontName in obj.fonts){
    var curFontExport = obj.fonts[fontName];
    var font = new Font(curFontExport.name, curFontExport.path, false);
    fonts[font.name] = font;
    font.load(function(){
      callbackSuccess();
    }, function(errFontName){
      throw new Error("Error loading font: "+errFontName);
    });
  }
}

ImportHandler.prototype.importCrosshairs = function(obj){
  for (var crosshairName in obj.crosshairs){
    crosshairs[crosshairName] = new Crosshair(obj.crosshairs[crosshairName]);
  }
}

ImportHandler.prototype.importLightnings = function(obj){
  var noLightningsExist = true;
  for (var lightningName in obj.lightnings){
    noLightningsExist = false;
    var curExport = obj.lightnings[lightningName];
    var lightning = new Lightning(lightningName, curExport.detailThreshold, curExport.mobileDetailThreshold, curExport.maxDisplacement, curExport.count, curExport.colorName, curExport.radius, curExport.roughness);
    lightning.init(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0));
    if (curExport.correctionProperties && curExport.correctionProperties.isCorrected){
      lightning.setCorrectionProperties(curExport.correctionProperties.correctionRefDistance, curExport.correctionProperties.correctionRefLength);
    }else{
      lightning.disableCorrection();
    }
    if (curExport.fpsWeaponConfigurations && curExport.fpsWeaponConfigurations.attachedToFPSWeapon){
      if (curExport.fpsWeaponConfigurations.childObjName){
        lightning.attachToFPSWeapon(objectGroups[curExport.fpsWeaponConfigurations.weaponObjName], curExport.fpsWeaponConfigurations.childObjName, curExport.fpsWeaponConfigurations.endPoint);
      }else{
        lightning.attachToFPSWeapon(addedObjects[curExport.fpsWeaponConfigurations.weaponObjName], null, curExport.fpsWeaponConfigurations.endPoint);
      }
    }else{
      lightning.detachFromFPSWeapon();
    }
    lightnings[lightningName] = lightning;
    lightningHandler.onLightningCreation(lightning);
    if (lightning.isCorrected){
      lightningHandler.onSetCorrectionProperties(lightning);
    }
  }

  if ((noLightningsExist && isDeployment) || (isDeployment && WORKERS_SUPPORTED && !LIGHTNING_WORKER_ON)){
    lightningHandler.turnOff();
  }
}

ImportHandler.prototype.importVirtualKeyboards = function(obj){
  for (var vkName in obj.virtualKeyboards){
    var curExport = obj.virtualKeyboards[vkName];
    var virtualKeyboard = new VirtualKeyboard(curExport);
    virtualKeyboards[vkName] = virtualKeyboard;
  }
}

ImportHandler.prototype.importContainers = function(obj){
  for (var containerName in obj.containers){
    var curExport = obj.containers[containerName];
    var container = new Container2D(containerName, curExport.centerXPercent, curExport.centerYPercent, curExport.widthPercent, curExport.heightPercent);
    containers[containerName] = container;
    container.paddingXContainerSpace = curExport.paddingXContainerSpace;
    container.paddingYContainerSpace = curExport.paddingYContainerSpace;
    if (curExport.isSquare){
      container.isSquare = true;
      container.makeSquare();
    }
    container.isClickable = curExport.isClickable;
    if (!(typeof curExport.spriteName == UNDEFINED)){
      container.insertSprite(sprites[curExport.spriteName]);
    }
    if (!(typeof curExport.addedTextName == UNDEFINED)){
      container.insertAddedText(addedTexts[curExport.addedTextName]);
    }
    if (curExport.hasBorder){
      container.setBorder(curExport.borderColor, curExport.borderThickness);
    }
    if (curExport.hasBackground){
      container.setBackground(curExport.backgroundColor, curExport.backgroundAlpha, curExport.backgroundTextureName);
    }
    container.makeVisible();
  }
  for (var containerName in obj.containers){
    var curExport = obj.containers[containerName];
    for (var key in curExport.alignedContainerInfos){
      var ary = curExport.alignedContainerInfos[key];
      for (var i = 0; i<ary.length; i++){
        var curInfo = ary[i];
        var child = containers[curInfo.containerName];
        containers[containerName].addAlignedContainer({container: child, alignmentType: curInfo.alignmentType, value: curInfo.value});
        child.alignedParent = containers[containerName];
      }
    }
  }
}

ImportHandler.prototype.importSprites = function(obj){
  for (var spriteName in obj.sprites){
    var curExport = obj.sprites[spriteName];
    var sprite = new Sprite(spriteName);
    sprite.refHeight = curExport.refHeight;
    sprite.mesh.material.uniforms.scaleCoef.value = (renderer.getCurrentViewport().w / screenResolution) / sprite.refHeight;
    sprite.setColor(curExport.color);
    sprite.setAlpha(curExport.alpha);
    sprite.setScale(curExport.scaleX, curExport.scaleY);
    sprite.setRotation(curExport.rotation);
    sprite.marginMode = curExport.marginMode;
    sprite.set2DCoordinates(curExport.marginPercentX, curExport.marginPercentY);
    sprite.originalWidth = curExport.originalWidth;
    sprite.originalHeight = curExport.originalHeight;
    sprite.originalWidthReference = curExport.originalWidthReference;
    sprite.originalHeightReference = curExport.originalHeightReference;
    sprite.originalScreenResolution = curExport.originalScreenResolution;
    if (curExport.isTextured){
      sprite.mapTexture(texturePacks[curExport.mappedTexturePackName]);
    }
    sprite.fixedWidth = curExport.fixedWidth;
    sprite.fixedHeight = curExport.fixedHeight;
    sprite.isClickable = curExport.isClickable;
    sprite.isDraggable = curExport.isDraggable;
    sprites[sprite.name] = sprite;
    if (!(typeof curExport.cropCoefficientX == UNDEFINED)){
      sprite.cropCoefficientX = curExport.cropCoefficientX;
    }
    if (!(typeof curExport.cropCoefficientY == UNDEFINED)){
      sprite.cropCoefficientY = curExport.cropCoefficientY;
    }
    for (var animationName in curExport.animations){
      var curAnimationExport = curExport.animations[animationName];
      sprite.addAnimation(new Animation(animationName, curAnimationExport.type, sprite, curAnimationExport.description, curAnimationExport.rewind, curAnimationExport.repeat));
    }
  }
}

ImportHandler.prototype.importDynamicTextureFolders = function(obj){
  for (var folderName in obj.dynamicTextureFolders){
    dynamicTextureFolders[folderName] = true;
  }
}
