var StateLoader = function(stateObj){
  this.stateObj = stateObj;
  this.reason = "";
  this.totalLoadedTextureCount = 0;
  this.totalLoadedTexturePackCount = 0;
  this.totalLoadedSkyboxCount = 0;
  this.totalLoadedFontCount = 0;
  this.importHandler = new ImportHandler();
}

StateLoader.prototype.load = function(){
  try{
    projectLoaded = false;
    this.resetProject();
    var obj = this.stateObj;
    this.importHandler.importEngineVariables(obj);
    this.importHandler.importGridSystems(obj);
    this.importHandler.importMaterials(obj);
    this.importHandler.importParticleSystems(obj);
    this.importHandler.importAreas(obj);
    this.importHandler.importScripts(obj);
    this.importHandler.importFog(obj);

    // ADDED OBJECTS ***********************************************
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
    // TEXTURE URLS ************************************************
    textureURLs = Object.assign({}, obj.textureURLs);
    // TEXTURES ****************************************************
    this.loaders = new Object();
    var uploadedTextures = obj.textures;
    for (var textureName in uploadedTextures){
      var curTexture = uploadedTextures[textureName];
      if (curTexture == 1 || curTexture == 2 || curTexture == 3){
        textures[textureName] = curTexture;
        this.totalLoadedTextureCount ++;
        this.finalize();
        continue;
      }
      var offsetX = curTexture.offset[0];
      var offsetY = curTexture.offset[1];
      var repeatU = curTexture.repeat[0];
      var repeatV = curTexture.repeat[1];
      var textureURL = textureURLs[textureName];
      if (textureURL.toUpperCase().endsWith("DDS")){
        if (!DDS_SUPPORTED){
          textureURL = textureURL.replace(
            ".dds", compressedTextureFallbackFormat
          ).replace(
            ".DDS", compressedTextureFallbackFormat
          );
          this.loaders[textureName] = textureLoader;
        }else{
          this.loaders[textureName] = ddsLoader;
        }
      }else if (textureURL.toUpperCase().endsWith("TGA")){
        this.loaders[textureName] = tgaLoader;
      }else{
        this.loaders[textureName] = textureLoader;
      }
      textures[textureName] = 1;
      var that = this;
      this.loaders[textureName].load(textureURL,
        function(textureData){
          var textureNameX = this.textureNameX;
          textures[textureNameX] = textureData;
          that.totalLoadedTextureCount ++;
          textures[textureNameX].needsUpdate = true;
          textures[textureNameX].isLoaded = true;
          textures[textureNameX].repeat.set(this.repeatUU, this.repeatVV);
          textures[textureNameX].offset.x = this.offsetXX;
          textures[textureNameX].offset.y = this.offsetYY;
          that.mapLoadedTexture(textures[textureNameX], textureNameX);
          that.finalize();
        }.bind({textureNameX: textureName, offsetXX: offsetX, offsetYY: offsetY, repeatUU: repeatU, repeatVV: repeatV, isCompressed: (
          this.loaders[textureName] instanceof THREE.DDSLoader
        )}), function(xhr){
          textures[this.textureNameX] = 2;
        }.bind({textureNameX: textureName}), function(xhr){
          textures[this.textureNameX] = 3;
          that.totalLoadedTextureCount ++;
          that.finalize();
        }.bind({textureNameX: textureName})
      );
      this.hasTextures = true;
    }
    // TEXTURE PACKS ***********************************************
    var texturePacksExport = obj.texturePacks;
    for (var texturePackName in texturePacksExport){
      var curTexturePackExport = texturePacksExport[texturePackName];
      var texturePack = new TexturePack(
        texturePackName,
        curTexturePackExport.directoryName,
        curTexturePackExport.fileExtension,
        function(){
          this.that.totalLoadedTexturePackCount ++;
          this.that.mapLoadedTexturePack(this.texturePackName, this.objj);
          this.that.finalize();
        }.bind({texturePackName: texturePackName, that: this, objj: obj}),
        true
      );
      texturePacks[texturePackName] = texturePack;
      this.hasTexturePacks = true;
    }
    // SKYBOXES ****************************************************
    var skyBoxScale = obj.skyBoxScale;
    var skyboxExports = obj.skyBoxes;
    skyboxVisible = obj.skyboxVisible;
    mappedSkyboxName = obj.mappedSkyboxName;
    var that = this;
    for (var skyboxName in skyboxExports){
      this.hasSkyboxes = true;
      var skyboxExport = skyboxExports[skyboxName];
      var skybox;
      if (!mappedSkyboxName){
        skybox = new SkyBox(
          skyboxExport.name,
          skyboxExport.directoryName,
          skyboxExport.fileExtension,
          skyboxExport.color,
          function(){
            that.totalLoadedSkyboxCount ++;
            that.finalize();
          }
        );
      }else{
        skybox = new SkyBox(
          skyboxExport.name,
          skyboxExport.directoryName,
          skyboxExport.fileExtension,
          skyboxExport.color,
          function(){
            that.totalLoadedSkyboxCount ++;
            if (this.skyboxName == mappedSkyboxName){
              var skybox = skyBoxes[this.skyboxName];
              if (skyboxMesh){
                scene.remove(skyboxMesh);
              }else{
                var geomKey = (
                  "BoxBufferGeometry" + PIPE +
                  skyboxDistance + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE +
                  "1" + PIPE + "1" + PIPE + "1"
                );
                var skyboxBufferGeometry = geometryCache[geomKey];
                if (!skyboxBufferGeometry){
                  skyboxBufferGeometry = new THREE.BoxBufferGeometry(skyboxDistance, skyboxDistance, skyboxDistance);
                  geometryCache[geomKey] = skyboxBufferGeometry;
                }
                skyboxMesh = new MeshGenerator(skyboxBufferGeometry, null).generateSkybox(skybox);
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
            that.finalize();
          }.bind({skyboxName: skyboxName, skyBoxScale: skyBoxScale})
        );
      }
      skyBoxes[skyboxName] = skybox;
    }
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

    if (!this.hasTextures && !this.hasTexturePacks && !this.hasSkyboxes && !this.hasFonts){
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
  if (parseInt(this.totalLoadedTextureCount) < parseInt(obj.totalTextureCount) ||
           parseInt(this.totalLoadedTexturePackCount) < parseInt(obj.totalTexturePackCount) ||
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

StateLoader.prototype.mapLoadedTexturePack = function(texturePackName, exportObj){
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
          material.uniforms.diffuseMap.value.roygbivTextureName = 0;
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
          material.uniforms.alphaMap.value.roygbivTextureName = 0;
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
          material.uniforms.aoMap.value.roygbivTextureName = 0;
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
          material.uniforms.emissiveMap.value.roygbivTextureName = 0;
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
          material.uniforms.displacementMap.value.roygbivTextureName = 0;
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

StateLoader.prototype.mapLoadedTexture = function(texture, textureName){
  var addedObjectsExport = this.stateObj.addedObjects;
  for (var objectGroupName in objectGroups){
    var group = objectGroups[objectGroupName].group;
    for (var objectName in group){
      addedObjects[objectName] = group[objectName];
    }
  }
  for (var addedObjectName in addedObjectsExport){

    var curAddedObjectExport = addedObjectsExport[addedObjectName];
    if (!curAddedObjectExport){
      break;
    }
    var objInstance = addedObjects[addedObjectName];
    var material = addedObjects[addedObjectName].material;
    var metaData = addedObjects[addedObjectName].metaData;

    var diffuseRoygbivTextureName = curAddedObjectExport.diffuseRoygbivTextureName;
    var alphaRoygbivTextureName = curAddedObjectExport.alphaRoygbivTextureName;
    var aoRoygbivTextureName = curAddedObjectExport.aoRoygbivTextureName;
    var emissiveRoygbivTextureName = curAddedObjectExport.emissiveRoygbivTextureName;
    var displacementRoygbivTextureName = curAddedObjectExport.displacementRoygbivTextureName;
    var displacementScale = curAddedObjectExport.displacementScale;
    var displacementBias = curAddedObjectExport.displacementBias;


    if (diffuseRoygbivTextureName){
      if (textureName == diffuseRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];
        var cloneTexture = texture;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        cloneTexture.wrapS = THREE.RepeatWrapping;
        cloneTexture.wrapT = THREE.RepeatWrapping;

        if (!(typeof repeatU == UNDEFINED)){
          cloneTexture.repeat.x = repeatU;
        }
        if (!(typeof repeatV == UNDEFINED)){
          cloneTexture.repeat.y = repeatV;
        }

        var mirrorT = metaData["mirrorT"];
        var mirrorS = metaData["mirrorS"];
        if (!(typeof mirrorT == UNDEFINED)){
          if (mirrorT == "ON"){
            cloneTexture.wrapT = THREE.MirroredRepeatWrapping;
          }
        }
        if (!(typeof mirrorS == UNDEFINED)){
          if (mirrorS == "ON"){
            cloneTexture.wrapS = THREE.MirroredRepeatWrapping;
          }
        }

        var textureOffsetX = curAddedObjectExport["textureOffsetX"];
        var textureOffsetY = curAddedObjectExport["textureOffsetY"];
        if (!(typeof textureOffsetX == UNDEFINED)){
          cloneTexture.offset.x = textureOffsetX;
        }
        if (!(typeof textureOffsetY == UNDEFINED)){
          cloneTexture.offset.y = textureOffsetY;
        }

        objInstance.mapDiffuse(cloneTexture);
        cloneTexture.needsUpdate = true;
      }
    }
    if (alphaRoygbivTextureName){
      if (textureName == alphaRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        cloneTexture.wrapS = THREE.RepeatWrapping;
        cloneTexture.wrapT = THREE.RepeatWrapping;
        if (!(typeof repeatU == UNDEFINED)){
          cloneTexture.repeat.x = repeatU;
        }
        if (!(typeof repeatV == UNDEFINED)){
          cloneTexture.repeat.y = repeatV;
        }

        var mirrorT = metaData["mirrorT"];
        var mirrorS = metaData["mirrorS"];
        if (!(typeof mirrorT == UNDEFINED)){
          if (mirrorT == "ON"){
            cloneTexture.wrapT = THREE.MirroredRepeatWrapping;
          }
        }
        if (!(typeof mirrorS == UNDEFINED)){
          if (mirrorS == "ON"){
            cloneTexture.wrapS = THREE.MirroredRepeatWrapping;
          }
        }

        objInstance.mapAlpha(cloneTexture);
        cloneTexture.needsUpdate = true;
      }
    }
    if (aoRoygbivTextureName){
      if (textureName == aoRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        cloneTexture.wrapS = THREE.RepeatWrapping;
        cloneTexture.wrapT = THREE.RepeatWrapping;
        if (!(typeof repeatU == UNDEFINED)){
          cloneTexture.repeat.x = repeatU;
        }
        if (!(typeof repeatV == UNDEFINED)){
          cloneTexture.repeat.y = repeatV;
        }

        var mirrorT = metaData["mirrorT"];
        var mirrorS = metaData["mirrorS"];
        if (!(typeof mirrorT == UNDEFINED)){
          if (mirrorT == "ON"){
            cloneTexture.wrapT = THREE.MirroredRepeatWrapping;
          }
        }
        if (!(typeof mirrorS == UNDEFINED)){
          if (mirrorS == "ON"){
            cloneTexture.wrapS = THREE.MirroredRepeatWrapping;
          }
        }

        objInstance.mapAO(cloneTexture);
        cloneTexture.needsUpdate = true;
      }
    }
    if (emissiveRoygbivTextureName){
      if (textureName == emissiveRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        cloneTexture.wrapS = THREE.RepeatWrapping;
        cloneTexture.wrapT = THREE.RepeatWrapping;
        if (!(typeof repeatU == UNDEFINED)){
          cloneTexture.repeat.x = repeatU;
        }
        if (!(typeof repeatV == UNDEFINED)){
          cloneTexture.repeat.y = repeatV;
        }

        var mirrorT = metaData["mirrorT"];
        var mirrorS = metaData["mirrorS"];
        if (!(typeof mirrorT == UNDEFINED)){
          if (mirrorT == "ON"){
            cloneTexture.wrapT = THREE.MirroredRepeatWrapping;
          }
        }
        if (!(typeof mirrorS == UNDEFINED)){
          if (mirrorS == "ON"){
            cloneTexture.wrapS = THREE.MirroredRepeatWrapping;
          }
        }

        objInstance.mapEmissive(cloneTexture);
        cloneTexture.needsUpdate = true;
      }
    }
    if (displacementRoygbivTextureName){
      if (textureName == displacementRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        if (!(typeof displacementScale == UNDEFINED)){
          objInstance.mesh.material.uniforms.displacementInfo.value.x = displacementScale;
        }
        if (!(typeof displacementBias == UNDEFINED)){
          objInstance.mesh.material.uniforms.displacementInfo.value.y = displacementBias;
        }

        cloneTexture.wrapS = THREE.RepeatWrapping;
        cloneTexture.wrapT = THREE.RepeatWrapping;
        if (!(typeof repeatU == UNDEFINED)){
          cloneTexture.repeat.x = repeatU;
        }
        if (!(typeof repeatV == UNDEFINED)){
          cloneTexture.repeat.y = repeatV;
        }

        var mirrorT = metaData["mirrorT"];
        var mirrorS = metaData["mirrorS"];
        if (!(typeof mirrorT == UNDEFINED)){
          if (mirrorT == "ON"){
            cloneTexture.wrapT = THREE.MirroredRepeatWrapping;
          }
        }
        if (!(typeof mirrorS == UNDEFINED)){
          if (mirrorS == "ON"){
            cloneTexture.wrapS = THREE.MirroredRepeatWrapping;
          }
        }

        objInstance.mapDisplacement(cloneTexture);
        cloneTexture.needsUpdate = true;
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
  textures = new Object();
  textureURLs = new Object();
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
  skyboxConfigurationsVisible = false;
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
