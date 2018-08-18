var StateLoader = function(stateObj){
  this.stateObj = stateObj;
  this.reason = "";
}

StateLoader.prototype.handleFogObjDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (diff.kind == "E"){
      if (diff.path[1] == "fogActive"){
        fogActive = diff.rhs;
      }else if (diff.path[1] == "fogColor"){
        fogColor = diff.rhs;
        fogColorRGB = new THREE.Color(fogColor);
      } else if (diff.path[1] == "fogDensity"){
        fogDensity = diff.rhs;
      }
    }
  }
}

StateLoader.prototype.handleParticleSystemCollisionWorkerModeDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      PS_COLLISION_WORKER_ENABLED = diff.rhs;
    }
  }
}

StateLoader.prototype.handleParticleCollisionWorkerModeDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      COLLISION_WORKER_ENABLED = diff.rhs;
    }
  }
}

StateLoader.prototype.handleBinSizeDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      BIN_SIZE = parseInt(diff.rhs);
    }
  }
}

StateLoader.prototype.handleOctreeLimitDiffs = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      var info = diff.rhs;
      var infoSplitted = info.split(",");
      for (var i = 0; i<infoSplitted.length; i++){
        infoSplitted[i] = parseInt(infoSplitted[i]);
      }
      var lowerBound = new THREE.Vector3(infoSplitted[0], infoSplitted[1], infoSplitted[2]);
      var upperBound = new THREE.Vector3(infoSplitted[3], infoSplitted[4], infoSplitted[5]);
      LIMIT_BOUNDING_BOX = new THREE.Box3(lowerBound, upperBound);
    }
  }
}

StateLoader.prototype.resetRoygbivTextureNames = function(obj){
  obj.diffuseRoygbivTextureName = 0;
  obj.alphaRoygbivTextureName = 0;
  obj.aoRoygbivTextureName = 0;
  obj.emissiveRoygbivTextureName = 0;
  obj.normalRoygbivTextureName = 0;
  obj.specularRoygbivTextureName = 0;
  obj.displacementRoygbivTextureName = 0;
}

StateLoader.prototype.handlePhysicsWorkerModeDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      PHYSICS_WORKER_ENABLED = diff.rhs;
    }
  }
}

StateLoader.prototype.handleMarkedPointsExport = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      var markedPoint = markedPoints[diff.path[1]];
      if (markedPoint){
        markedPoint.destroy();
        delete markedPoints[diff.path[1]];
      }
    }else if (kind == "N"){
      var curMarkedPointExport = diff.rhs;
      var markedPoint = new MarkedPoint(
        diff.path[1],
        curMarkedPointExport["x"],
        curMarkedPointExport["y"],
        curMarkedPointExport["z"]
      );
      if (!curMarkedPointExport.isHidden && mode == 0){
        markedPoint.renderToScreen();
      }else{
        markedPoint.isHidden = true;
      }
      markedPoint.showAgainOnTheNextModeSwitch = curMarkedPointExport.showAgainOnTheNextModeSwitch;
      if (mode == 0){
        markedPoint.showAgainOnTheNextModeSwitch = false;
      }
      markedPoints[diff.path[1]] = markedPoint;
    }
  }else if (diff.path.length == 3){
    if (diff.path[2] == "isHidden"){
      var markedPoint = markedPoints[diff.path[1]];
      if (markedPoint){
        if (!diff.rhs){
          markedPoint.show();
        }else{
          markedPoint.hide();
        }
      }
    }
  }
}

StateLoader.prototype.handleScriptsDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      delete scripts[diff.path[1]];
    }else if (kind == "N"){
      var script = new Script(
        diff.rhs.name, diff.rhs.script
      );
      script.runAutomatically = diff.rhs.runAutomatically;
      scripts[diff.rhs.name] = script;
    }
  }else if (diff.path.length == 3){
    if (diff.path[2] == "script"){
      var script = scripts[diff.path[1]];
      if (script){
        script.script = diff.rhs;
      }
    }else if (diff.path[2] == "runAutomatically"){
      var script = scripts[diff.path[1]];
      if (script){
        script.runAutomatically = diff.rhs;
      }
    }
  }
}

StateLoader.prototype.handleObjectGroupsDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      var objectGroup = objectGroups[diff.path[1]];
      if (objectGroup){
        objectGroup.destroy();
        delete objectGroups[diff.path[1]];
      }
    }else if (kind == "N"){
      var groupExports = diff.rhs.group;
      for (var addedObjectName in groupExports){
        var pseudoDiffObj = new Object();
        pseudoDiffObj.kind = "N";
        pseudoDiffObj.path = [];
        pseudoDiffObj.path.push("addedObjects");
        pseudoDiffObj.path.push(addedObjectName);
        pseudoDiffObj.rhs = groupExports[addedObjectName];
        new StateLoader(pseudoDiffObj).handleAddedObjectDiff();
      }
      var curObjectGroupExport = diff.rhs;
      var group = new Object();
      for (var name in curObjectGroupExport.group){
        group[name] = addedObjects[name];
      }
      var objectGroupInstance = new ObjectGroup(diff.path[1], group);
      objectGroups[diff.path[1]] = objectGroupInstance;
      objectGroupInstance.glue();
      if (curObjectGroupExport.mass){
        objectGroupInstance.setMass(curObjectGroupExport.mass);
      }
      objectGroupInstance.initQuaternion = new THREE.Quaternion(
        curObjectGroupExport.quaternionX, curObjectGroupExport.quaternionY,
        curObjectGroupExport.quaternionZ, curObjectGroupExport.quaternionW
      );
      objectGroupInstance.graphicsGroup.quaternion.copy(objectGroupInstance.initQuaternion.clone());
      objectGroupInstance.previewGraphicsGroup.quaternion.copy(objectGroupInstance.initQuaternion.clone());
      objectGroupInstance.physicsBody.quaternion.copy(objectGroupInstance.graphicsGroup.quaternion);
      objectGroupInstance.physicsBody.initQuaternion = objectGroupInstance.graphicsGroup.quaternion;

      var isDynamicObject = false;
      if (curObjectGroupExport.isDynamicObject){
        isDynamicObject = curObjectGroupExport.isDynamicObject;
      }
      objectGroupInstance.isDynamicObject = isDynamicObject;
    }
  }else if (diff.path.length == 3){
    if (diff.path[2] == "quaternionW"){
      if (kind == "E"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          var quatW = diff.rhs;
          objectGroup.setQuaternion("w", quatW);
        }
      }
    }else if (diff.path[2] == "quaternionZ"){
      if (kind == "E"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          var quatZ = diff.rhs;
          objectGroup.setQuaternion("z", quatZ);
        }
      }
    }else if (diff.path[2] == "quaternionY"){
      if (kind == "E"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          var quatY = diff.rhs;
          objectGroup.setQuaternion("y", quatY);
        }
      }
    }else if (diff.path[2] == "quaternionX"){
      if (kind == "E"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          var quatX = diff.rhs;
          objectGroup.setQuaternion("x", quatX);
        }
      }
    }else if (diff.path[2] == "mass"){
      if (kind == "D"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          delete objectGroup.mass;
        }
      }else if (kind == "N" || kind == "E"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          objectGroup.setMass(diff.rhs);
          if (mode == 1 && diff.rhs > 0){
            dynamicObjectGroups[diff.path[1]] = objectGroup;
          }
        }
      }
    }else if (diff.path[2] == "isDynamicObject"){
      if (kind == "D"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          delete objectGroup.isDynamicObject;
          objectGroup.physicsBody.mass = 0;
          objectGroup.physicsBody.updateMassProperties();
          objectGroup.physicsBody.aabbNeedsUpdate = true;
        }
      }else if (kind == "N" || kind == "E"){
        var objectGroup = objectGroups[diff.path[1]];
        if (objectGroup){
          objectGroup.isDynamicObject = diff.rhs;
        }
      }
    }
  }else if (diff.path.length == 5){
    if (diff.path[4] == "blendingMode"){
      var objName = diff.path[3];
      var parentName = diff.path[1];
      var parent = objectGroups[parentName];
      if (parent){
        var child = parent.group[objName];
        if (child){
          var blendingVal = diff.rhs;
          if (blendingVal == "NO_BLENDING"){
            child.setBlending(NO_BLENDING);
          }else if (blendingVal == "NORMAL_BLENDING"){
            child.setBlending(NORMAL_BLENDING);
          }else if (blendingVal == "ADDITIVE_BLENDING"){
            child.setBlending(ADDITIVE_BLENDING);
          }else if (blendingVal == "MULTIPLY_BLENDING"){
            child.setBlending(MULTIPLY_BLENDING);
          }else if (blendingVal == "SUBTRACTIVE_BLENDING"){
            child.setBlending(SUBTRACTIVE_BLENDING);
          }
        }
      }
    }else if (diff.path[4] == "opacity"){
      var objName = diff.path[3];
      var parentName = diff.path[1];
      var parent = objectGroups[parentName];
      if (parent){
        var child = parent.group[objName];
        if (child){
          child.material.opacity = true;
          child.material.opacity = diff.rhs;
          child.material.needsUpdate = true;
        }
      }
    }
  }
}

StateLoader.prototype.handleSkyBoxScales = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "D"){
      skyBoxScale = 1;
      if (skyboxMesh){
        skyboxMesh.scale.x = skyBoxScale;
        skyboxMesh.scale.y = skyBoxScale;
        skyboxMesh.scale.z = skyBoxScale;
      }
      if (skyboxPreviewMesh){
        skyboxPreviewMesh.scale.x = skyBoxScale;
        skyboxPreviewMesh.scale.y = skyBoxScale;
        skyboxPreviewMesh.scale.z = skyBoxScale;
      }
    }else if (kind == "N" || kind == "E"){
      skyBoxScale = diff.rhs;
      if (skyboxMesh){
        skyboxMesh.scale.x = skyBoxScale;
        skyboxMesh.scale.y = skyBoxScale;
        skyboxMesh.scale.z = skyBoxScale;
      }
      if (skyboxPreviewMesh){
        skyboxPreviewMesh.scale.x = skyBoxScale;
        skyboxPreviewMesh.scale.y = skyBoxScale;
        skyboxPreviewMesh.scale.z = skyBoxScale;
      }
    }
  }
}

StateLoader.prototype.handleSkyboxVisible = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      skyboxVisible = diff.rhs;
      if (skyboxVisible){
        if (skyboxMesh){
          scene.add(skyboxMesh);
          previewScene.add(skyboxPreviewMesh);
        }
      }else{
        if (skyboxMesh){
          scene.remove(skyboxMesh);
          previewScene.remove(skyboxPreviewMesh);
        }
      }
    }
  }
}

StateLoader.prototype.handleMappedSkyboxNames = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 1){
    if (kind == "E"){
      mappedSkyboxName = diff.rhs;
      if (!mappedSkyboxName){
        if (skyboxMesh){
          scene.remove(skyboxMesh);
        }
        if (skyboxPreviewMesh){
          previewScene.remove(skyboxPreviewMesh);
        }
      }else{
        if (skyboxMesh){
          scene.remove(skyboxMesh);
        }
        if (skyboxPreviewMesh){
          previewScene.remove(skyboxPreviewMesh);
        }
        var skybox = skyBoxes[mappedSkyboxName];
        if (skybox){
          var materialArray = [];
          var skyboxTextures = [
            skybox.leftTexture,
            skybox.rightTexture,
            skybox.upTexture,
            skybox.downTexture,
            skybox.frontTexture,
            skybox.backTexture
          ];
          for (var i = 0; i<skyboxTextures.length; i++){
            materialArray.push(new THREE.MeshBasicMaterial(
              {
                map: skyboxTextures[i],
                side: THREE.BackSide
              }
            ));
          }
          var skyGeometry = new THREE.CubeGeometry(
            skyboxDistance, skyboxDistance, skyboxDistance
          );
          skyboxMesh = new THREE.Mesh( skyGeometry, materialArray );
          skyboxPreviewMesh = skyboxMesh.clone();
          scene.add(skyboxMesh);
          previewScene.add(skyboxPreviewMesh);
          skyboxVisible = true;
        }
      }
    }
  }
}

StateLoader.prototype.handleSkyboxesDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      var skyboxName = diff.path[1];
      delete skyBoxes[skyboxName];
    }else if (kind == "N"){
      var skyboxName = diff.path[1];
      skyBoxes[skyboxName] = new SkyBox(
        skyboxName,
        diff.rhs.directoryName,
        diff.rhs.fileExtension
      );
    }
  }
}

StateLoader.prototype.handleTexturePacksDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var rhs = diff.rhs;
  if (diff.path.length == 2){
    if (kind == "D"){
      texturePacks[diff.path[1]].destroy();
    }else if (kind == "N"){
      var refTexturePackName = rhs.refTexturePackName;
      var refTexturePack = null;
      if (!(typeof refTexturePackName == "undefined")){
        if(!(typeof texturePacks[refTexturePackName] == "undefined")){
          refTexturePack = texturePacks[refTexturePackName];
        }
      }
      var scaleFactor = rhs.scaleFactor;
      var texturePack = new TexturePack(
        diff.path[1],
        rhs.directoryName,
        rhs.fileExtension,
        function(){},
        true,
        refTexturePack,
        scaleFactor,
        refTexturePackName
      );
      if (!(typeof refTexturePack == "undefined") && scaleFactor){
        texturePack.rescale(scaleFactor);
      }
      texturePacks[diff.path[1]] = texturePack;
    }
  }
}

StateLoader.prototype.handlePointLightRepresentationsDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 3){
    if (diff.path[2] == "positionZ"){
      if (kind == "E"){
        var pointLightRepresentation = pointLightRepresentations[diff.path[1]];
        if (pointLightRepresentation){
          pointLightRepresentation.position.z = diff.rhs;
        }
      }
    }else if (diff.path[2] == "positionY"){
      if (kind == "E"){
        var pointLightRepresentation = pointLightRepresentations[diff.path[1]];
        if (pointLightRepresentation){
          pointLightRepresentation.position.y = diff.rhs;
        }
      }
    }else if (diff.path[2] == "positionX"){
      if (kind == "E"){
        var pointLightRepresentation = pointLightRepresentations[diff.path[1]];
        if (pointLightRepresentation){
          pointLightRepresentation.position.x = diff.rhs;
        }
      }
    }
  }else if (diff.path.length == 2){
    if (kind == "D"){
      scene.remove(pointLightRepresentations[diff.path[1]]);
      delete pointLightRepresentations[diff.path[1]];
    }else if (kind == "N"){
      var curLightExport = diff.rhs;
      var lightColor;
      colorTextVal = "white";
      if (lights[diff.path[1]]){
        colorTextVal = lights[diff.path[1]].colorTextVal;
      }
      lightColor = new THREE.Color(colorTextVal);
      var pointLightRepresentation = new THREE.Mesh(
        new THREE.SphereGeometry(5),
        new THREE.MeshBasicMaterial({color: lightColor})
      );
      pointLightRepresentation.position.x = curLightExport.positionX;
      pointLightRepresentation.position.y = curLightExport.positionY;
      pointLightRepresentation.position.z = curLightExport.positionZ;
      scene.add(pointLightRepresentation);
      pointLightRepresentations[diff.path[1]] = pointLightRepresentation;
      pointLightRepresentation.lightName = diff.path[1];
      pointLightRepresentation.isPointLightRepresentation = true;
    }
  }
}

StateLoader.prototype.handleLightPreviewSceneDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 3){
    if (diff.path[2] == "positionZ"){
      if (kind == "E"){
        var light = light_previewScene[diff.path[1]];
        if (light){
          light.position.z = diff.rhs;
        }
      }
    }else if (diff.path[2] == "positionY"){
      if (kind == "E"){
        var light = light_previewScene[diff.path[1]];
        if (light){
          light.position.y = diff.rhs;
        }
      }
    }else if (diff.path[2] == "positionX"){
      if (kind == "E"){
        var light = light_previewScene[diff.path[1]];
        if (light){
          light.position.x = diff.rhs;
        }
      }
    }else if (diff.path[2] == "intensity"){
      var light = light_previewScene[diff.path[1]];
      if (light){
        light.intensity = diff.rhs;
      }
    }
  }else if (diff.path.length == 2){
    if (kind == "D"){
      var light = light_previewScene[diff.path[1]];
      previewScene.remove(light);
      for (var objectName in addedObjects){
        var addedObject = addedObjects[objectName];
        addedObject.mesh.material.needsUpdate = true;
      }
      delete light_previewScene[diff.path[1]];
      selectedLightName = 0;
    }else if (kind == "N"){
      var curLightExport = diff.rhs;
      var lightColor = curLightExport["colorTextVal"];
      var lightIntensity = curLightExport.intensity;
      if (curLightExport.type == "AMBIENT"){
        var previewSceneLight = new THREE.AmbientLight(lightColor);
        previewSceneLight.intensity = lightIntensity;
        previewScene.add(previewSceneLight);
        light_previewScene[diff.path[1]] = previewSceneLight;
        previewSceneLight.colorTextVal = lightColor;
      }else if (curLightExport.type == "POINT"){
        var pointLight = new THREE.PointLight(lightColor);
        pointLight.colorTextVal = lightColor
        pointLight.position.x = curLightExport.positionX;
        pointLight.position.y = curLightExport.positionY;
        pointLight.position.z = curLightExport.positionZ;
        pointLight.intensity = lightIntensity;
        light_previewScene[diff.path[1]] = pointLight;
        previewScene.add(pointLight);
      }
    }
  }
}

StateLoader.prototype.handleLightsDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var rhs = diff.rhs;
  var lhs = diff.lhs;
  if (diff.path.length == 3){
    if (diff.path[2] == "positionZ"){
      if (kind == "E"){
        var light = lights[diff.path[1]];
        if (light){
          light.position.z = diff.rhs;
        }
      }
    }else if (diff.path[2] == "positionY"){
      if (kind == "E"){
        var light = lights[diff.path[1]];
        if (light){
          light.position.y = diff.rhs;
        }
      }
    }else if (diff.path[2] == "positionX"){
      if (kind == "E"){
        var light = lights[diff.path[1]];
        if (light){
          light.position.x = diff.rhs;
        }
      }
    }else if (diff.path[2] == "intensity"){
      var light = lights[diff.path[1]];
      if (light){
        light.intensity = diff.rhs;
      }
    }
  }else if (diff.path.length == 2){
    if (kind == "D"){
      var light = lights[diff.path[1]];
      scene.remove(light);
      for (var objectName in addedObjects){
        var addedObject = addedObjects[objectName];
        addedObject.mesh.material.needsUpdate = true;
      }
      delete lights[diff.path[1]];
      selectedLightName = 0;
    }else if (kind == "N"){
      var curLightExport = rhs;
      var lightColor = curLightExport["colorTextVal"];
      var lightIntensity = curLightExport.intensity;
      if (curLightExport.type == "AMBIENT"){
        var light = new THREE.AmbientLight(lightColor);
        light.intensity = lightIntensity;
        scene.add(light);
        lights[diff.path[1]] = light;
        light.colorTextVal = lightColor;
      }else if (curLightExport.type == "POINT"){
        var pointLight = new THREE.PointLight(lightColor);
        pointLight.colorTextVal = lightColor
        pointLight.position.x = curLightExport.positionX;
        pointLight.position.y = curLightExport.positionY;
        pointLight.position.z = curLightExport.positionZ;
        pointLight.intensity = lightIntensity;
        lights[diff.path[1]] = pointLight;
        scene.add(pointLight);
      }
    }
  }
}

StateLoader.prototype.handleDefaultMaterialType = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var rhs = diff.rhs;
  if (diff.path.length == 1){
    if (kind == "E"){
      defaultMaterialType = rhs;
    }
  }
}

StateLoader.prototype.handleUploadedImages = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var rhs = diff.rhs;
  if (diff.path.length == 2){
    if (kind == "D"){
      delete uploadedImages[diff.path[1]];
    }else if (kind == "N"){
      var src = rhs;
      var imageDom = document.createElement("img");
      imageDom.src = src;
      uploadedImages[diff.path[1]] = imageDom;
    }
  }
}

StateLoader.prototype.handleWallCollectionsDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var rhs = diff.rhs;
  if (diff.path.length == 2){
    if (kind == "D"){
      delete wallCollections[diff.path[1]];
    }else if (kind == "N"){
      var name = rhs.name;
      var height = rhs.height;
      var outlineColor = rhs.outlineColor;
      var isSuperposed = rhs.isSuperposed;
      new WallCollection(
        name, height, outlineColor, 0, 0, isSuperposed, true, rhs
      );
    }
  }
}

StateLoader.prototype.handleAnchorGridDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var rhs = diff.rhs;
  var lhs = diff.lhs;
  if (diff.path.length == 1){
    if (kind == "E"){
      if (rhs){
        var parentName = rhs.parentName;
        var gridSystem = gridSystems[parentName];
        if (gridSystem){
          var splitted = rhs.name.split("_");
          var gridNumber = parseInt(splitted[splitted.length -1]);
          anchorGrid = gridSystem.grids[gridNumber];
        }
      }else{
        anchorGrid = 0;
      }
    }
  }else if (diff.path.length == 2){
    if (diff.path[1] == "name"){
      var splitted = rhs.split("_");
      var parentName = splitted[0];
      var gridNumber = parseInt(splitted[splitted.length -1]);
      var gridSystem = gridSystems[parentName];
      if (gridSystem){
        anchorGrid = gridSystem.grids[gridNumber];
      }
    }
  }
}

StateLoader.prototype.handleTexturesDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      delete textures[diff.path[1]];
    }else if (kind == "N"){
      var textureName = diff.path[1];
      var texture = textureCache[textureName];
      if (texture){
        if (texture == 1 || texture == 2 || texture == 3){
          textures[textureName] = texture;
        }else{
          textures[textureName] = texture.clone();
          textures[textureName].needsUpdate = true;
          textures[textureName].isLoaded = true;
        }
      }
    }
  }
}

StateLoader.prototype.handleModifiedTexturesDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var textureName = diff.path[1];
  if (kind == "D"){
    delete modifiedTextures[textureName];
  }else if (kind == "N"){
    modifiedTextures[textureName] = diff.rhs;
  }
}

StateLoader.prototype.handleTextureURLsDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      delete textureURLs[diff.path[1]];
    }else if (kind == "N"){
      textureURLs[diff.path[1]] = diff.rhs;
    }
  }
}

StateLoader.prototype.handleAddedObjectDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  var lhs = diff.lhs;
  var rhs = diff.rhs;
  if (diff.path.length == 4){
    if (diff.path[3] == "heightSegments"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.segmentGeometry(true, parseInt(diff.rhs));
        }
      }
    }else if (diff.path[3] == "depthSegments"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.segmentGeometry(true, parseInt(diff.rhs));
        }
      }
    }else if (diff.path[3] == "widthSegments"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.segmentGeometry(true, parseInt(diff.rhs));
        }
      }
    }else if (diff.path[3] == "mirrorT"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.handleMirror("T", "OFF");
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.handleMirror("T", rhs);
        }
      }else if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.handleMirror("T", rhs);
        }
      }
    }else if (diff.path[3] == "mirrorS"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.handleMirror("S", "OFF");
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.handleMirror("S", rhs);
        }
      }else if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.handleMirror("S", rhs);
        }
      }
    }else if (diff.path[3] == "textureRepeatU"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          if (typeof addedObject.textureRepeatVBuffer == "undefined"){
            addedObject.textureRepeatUBuffer = rhs;
          }else{
            if (addedObject.isTextured()){
              addedObject.adjustTextureRepeat(rhs, addedObject.textureRepeatVBuffer);
              delete addedObject.textureRepeatVBuffer;
              delete addedObject.textureRepeatUBuffer;
            }
          }
        }
      }
    }else if (diff.path[3] == "textureRepeatV"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          if (typeof addedObject.textureRepeatUBuffer == "undefined"){
            addedObject.textureRepeatVBuffer = rhs;
          }else{
            if (addedObject.isTextured()){
              addedObject.adjustTextureRepeat(addedObject.textureRepeatUBuffer, rhs);
              delete addedObject.textureRepeatUBuffer;
              delete addedObject.textureRepeatVBuffer;
            }
          }
        }
      }
    }
  }else if (diff.path.length == 3){
    if (diff.path[2] == "blendingMode"){
      var addedObject = addedObjects[diff.path[1]];
      if (addedObject){
        if (kind == "E"){
          if (diff.rhs == "NO_BLENDING"){
            addedObject.setBlending(NO_BLENDING);
          }else if (diff.rhs == "NORMAL_BLENDING"){
            addedObject.setBlending(NORMAL_BLENDING);
          }else if (diff.rhs == "ADDITIVE_BLENDING"){
            addedObject.setBlending(ADDITIVE_BLENDING);
          }else if (diff.rhs == "SUBTRACTIVE_BLENDING"){
            addedObject.setBlending(SUBTRACTIVE_BLENDING);
          }else if (diff.rhs == "MULTIPLY_BLENDING"){
            addedObject.setBlending(MULTIPLY_BLENDING);
          }
        }
      }
    }else if (diff.path[2] == "shininess"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.material.shininess = diff.rhs;
          addedObject.material.needsUpdate = true;
        }
      }
    }else if (diff.path[2] == "emissiveIntensity"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.material.emissiveIntensity = diff.rhs;
          addedObject.material.needsUpdate = true;
        }
      }
    }else if (diff.path[2] == "opacity"){
      if (kind == "E"){
        var newVal = diff.rhs;
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.material.transparent = true;
          addedObject.material.opacity = newVal;
          addedObject.material.needsUpdate = true;
        }
      }
    }else if (diff.path[2] == "aoMapIntensity"){
      if (kind == "E"){
        var newVal = diff.rhs;
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.material.aoMapIntensity = newVal;
          addedObject.material.needsUpdate = true;
        }
      }
    }else if (diff.path[2] == "rotationZ"){
      if (kind == "E"){
        var rotDiff = diff.rhs - diff.lhs;
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.rotate("z", rotDiff);
        }
      }
    }else if (diff.path[2] == "rotationY"){
      if (kind == "E"){
        var rotDiff = diff.rhs - diff.lhs;
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.rotate("y", rotDiff);
        }
      }
    }else if (diff.path[2] == "rotationX"){
      if (kind == "E"){
        var rotDiff = diff.rhs - diff.lhs;
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.rotate("x", rotDiff);
        }
      }
    }else if (diff.path[2] == "isDynamicObject"){
      var addedObject = addedObjects[diff.path[1]];
      if (kind == "D"){
        if (addedObject){
          delete addedObject.isDynamicObject;
          addedObject.physicsBody.mass = 0;
          addedObject.physicsBody.updateMassProperties();
          addedObject.physicsBody.aabbNeedsUpdate = true;
        }
      }else if (kind == "N" || kind == "E"){
        if (addedObject){
          addedObject.isDynamicObject = diff.rhs;
        }
      }
    }else if (diff.path[2] == "mass"){
      var addedObject = addedObjects[diff.path[1]];
      if (kind == "D"){
        if (addedObject){
          delete addedObject.mass;
        }
      }else if (kind == "N" || kind == "E"){
        if (addedObject){
          addedObject.setMass(diff.rhs);
          if (mode == 1 && diff.rhs > 0){
            dynamicObjects[addedObject.name] = addedObject;
          }
        }
      }
    }else if (diff.path[2] == "displacementBias"){
      if (kind == "N" || kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          if (addedObject.material.isMeshPhongMaterial){
            if (addedObject.material.displacementMap){
              addedObject.material.displacementBias = parseFloat(diff.rhs);
              addedObject.material.needsUpdate = true;
            }
          }
        }
      }else if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          delete addedObject.displacementBias;
        }
      }
    }else if (diff.path[2] == "displacementScale"){
      if (kind == "N" || kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          if (addedObject.material.isMeshPhongMaterial){
            if (addedObject.material.displacementMap){
              addedObject.material.displacementScale = parseFloat(diff.rhs);
              addedObject.material.needsUpdate = true;
            }
          }
        }
      }else if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          delete addedObject.displacementScale;
        }
      }
    }else if (diff.path[2] == "textureRepeatV"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.textureRepeatVOnTexturePackMap = diff.rhs;
          if (addedObject.textureRepeatUOnTexturePackMap){
            addedObject.adjustTextureRepeat(
              addedObject.textureRepeatUOnTexturePackMap,
              addedObject.textureRepeatVOnTexturePackMap
            );
          }
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.textureRepeatV = diff.rhs;
          if (addedObject.textureRepeatU){
            var repeatU = addedObject.textureRepeatU;
            var repeatV = addedObject.textureRepeatV;
            setTimeout(function(){
              addedObject.adjustTextureRepeat(repeatU, repeatV);
            })
          }
        }
      }
    }else if (diff.path[2] == "textureRepeatU"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.textureRepeatUOnTexturePackMap = diff.rhs;
          if (addedObject.textureRepeatVOnTexturePackMap){
            addedObject.adjustTextureRepeat(
              addedObject.textureRepeatUOnTexturePackMap,
              addedObject.textureRepeatVOnTexturePackMap
            );
          }
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.textureRepeatU = diff.rhs;
        }
      }
    }else if (diff.path[2] == "textureOffsetY"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.adjustTextureOffsetYOnTexturePackMap = diff.rhs;
          if (addedObject.material.map){
            addedObject.material.map.offset.y = diff.rhs;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.textureOffsetY_TMP = diff.rhs;
          if (typeof addedObject.textureOffsetX_TMP != "undefined"){
            setTimeout(function(){
              if (addedObject.material.map){
                addedObject.material.map.offset.x = addedObject.textureOffsetX_TMP;
                addedObject.material.map.offset.y = addedObject.textureOffsetY_TMP;
                delete addedObject.textureOffsetX_TMP;
                delete addedObject.textureOffsetY_TMP;
                addedObject.material.needsUpdate = true;
                addedObject.material.map.needsUpdate = true;
              }
            });
          }
        }
      }
    }else if (diff.path[2] == "textureOffsetX"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.adjustTextureOffsetXOnTexturePackMap = diff.rhs;
          if (addedObject.material.map){
            addedObject.material.map.offset.x = diff.rhs;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.textureOffsetX_TMP = diff.rhs;
          if (typeof addedObject.textureOffsetY_TMP != "undefined"){
            setTimeout(function(){
              if (addedObject.material.map){
                addedObject.material.map.offsetX = addedObject.textureOffsetX_TMP;
                addedObject.material.map.offsetY = addedObject.textureOffsetY_TMP;
                delete addedObject.textureOffsetX_TMP;
                delete addedObject.textureOffsetY_TMP;
                addedObject.material.needsUpdate = true;
                addedObject.material.map.needsUpdate = true;
              }
            });
          }
        }
      }
    }else if (diff.path[2] == "specularRoygbivTexturePackName"){
      if (kind == "D"){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            addedObject.specularRoygbivTexturePackName = 0;
            addedObject.material.specularMap = null;
            addedObject.material.needsUpdate = true;
          }
        }else if (kind == "N"){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            addedObject.specularRoygbivTexturePackName = diff.rhs;
          }
        }
    }if (diff.path[2] == "normalRoygbivTexturePackName"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.normalRoygbivTexturePackName = 0;
          addedObject.material.normalMap = null;
          addedObject.material.needsUpdate = true;
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.normalRoygbivTexturePackName = diff.rhs;
        }
      }
    }else if (diff.path[2] == "displacementRoygbivTexturePackName"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.displacementRoygbivTexturePackName = 0;
          addedObject.material.displacementMap = null;
          addedObject.material.needsUpdate = true;
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.displacementRoygbivTexturePackName = diff.rhs;
        }
      }
    }else if (diff.path[2] == "emissiveRoygbivTexturePackName"){
        if (kind == "D"){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            addedObject.emissiveRoygbivTexturePackName = 0;
            addedObject.material.emissiveMap = null;
            addedObject.material.needsUpdate = true;
          }
        }else if (kind == "N"){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            addedObject.emissiveRoygbivTexturePackName = diff.rhs;
          }
        }
    }else if (diff.path[2] == "aoRoygbivTexturePackName"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.aoRoygbivTexturePackName = 0;
          addedObject.material.aoMap = null;
          addedObject.material.needsUpdate = true;
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.aoRoygbivTexturePackName = diff.rhs;
        }
      }
    }else if (diff.path[2] == "alphaRoygbivTexturePackName"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.alphaRoygbivTexturePackName = 0;
          addedObject.material.alphaMap = null;
          addedObject.material.needsUpdate = true;
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.alphaRoygbivTexturePackName = diff.rhs;
        }
      }
    }else if (diff.path[2] == "diffuseRoygbivTexturePackName"){
      if (kind == "D"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.diffuseRoygbivTexturePackName = 0;
          addedObject.material.map = null;
          addedObject.material.needsUpdate = true;
        }
      }else if (kind == "N"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.diffuseRoygbivTexturePackName = diff.rhs;
        }
      }
    }else if (diff.path[2] == "associatedTexturePack"){
      if (kind == "E"){
        var addedObject = addedObjects[diff.path[1]];
        if (addedObject){
          addedObject.associatedTexturePack = rhs;
          if (rhs){
            var texturePack = texturePacks[rhs];
            if (texturePack){
              addedObject.mapTexturePack(texturePack);
            }
          }
        }
      }
    }else if (diff.path[2] == "diffuseRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.map = null;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(0);
            addedObject.diffuseRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }else if (diff.path[2] == "alphaRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.alphaMap = null;
            addedObject.material.transparent = false;
            addedObject.material.alphaTest = 0;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.alphaRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }else if (diff.path[2] == "aoRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.aoMap = null;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.aoRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }else if (diff.path[2] == "emissiveRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.emissiveMap = null;
            addedObject.material.emissive = new THREE.Color( 0x000000 );
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.emissiveRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }else if (diff.path[2] == "displacementRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.displacementMap = null;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.displacementRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }else if (diff.path[2] == "normalRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.normalMap = null;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.normalRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }else if (diff.path[2] == "specularRoygbivTextureName"){
      if (kind == "D"){
        if (lhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.material.specularMap = null;
            addedObject.material.needsUpdate = true;
          }
        }
      }else if (kind == "N" || kind == "E"){
        if (rhs != 0){
          var addedObject = addedObjects[diff.path[1]];
          if (addedObject){
            this.resetRoygbivTextureNames(addedObject);
            addedObject.specularRoygbivTextureName = rhs;
            this.mapTextureToSingleObject(addedObject, true);
          }
        }
      }
    }
  }else if (diff.path.length == 2){
    if (kind == "D"){
      var object = addedObjects[diff.path[1]];
      object.destroy();
      delete addedObjects[diff.path[1]];
    }else if (kind == "N"){
      var curAddedObjectExport = diff.rhs;
      var addedObjectName = diff.path[1];
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
          material = new THREE.MeshBasicMaterial({
            color: "white",
            side: THREE.DoubleSide,
            wireframe: false
          });
          material.roygbivMaterialName = roygbivMaterialName;
          material.transparent = true;
          material.opacity = curAddedObjectExport.opacity;
          material.aoMapIntensity = curAddedObjectExport.aoMapIntensity;
          material.needsUpdate = true;
        }else if (roygbivMaterialName == "NULL_PHONG"){
          material = new THREE.MeshPhongMaterial({
            color: "white",
            side: THREE.DoubleSide,
            wireframe: false
          });
          material.roygbivMaterialName = roygbivMaterialName;
          material.transparent = true;
          material.opacity = curAddedObjectExport.opacity;
          material.aoMapIntensity = curAddedObjectExport.aoMapIntensity;
          material.shininess = curAddedObjectExport.shininess;
          material.emissiveIntensity = curAddedObjectExport.emissiveIntensity;
          material.needsUpdate = true;
        }else{
          material = new THREE.MeshBasicMaterial({color: "white", side: THREE.DoubleSide});
          material.roygbivMaterialName = roygbivMaterialName;
        }
      }

      var widthSegments = metaData["widthSegments"];
      var heightSegments = metaData["heightSegments"];
      var depthSegments = metaData["depthSegments"];
      if (!widthSegments){
        widthSegments = 1;
      }
      if (!heightSegments){
        heightSegments = 1;
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
        var boxPhysicsShape = new CANNON.Box(new CANNON.Vec3(
          boxSizeX / 2,
          boxSizeY / 2,
          boxSizeZ / 2
        ));
        var boxPhysicsBody = new CANNON.Body({
          mass: mass,
          shape: boxPhysicsShape
        });
        var boxMesh;
        var boxClone;
        var axis = metaData["gridSystemAxis"];
        boxMesh = new THREE.Mesh(
          new THREE.BoxGeometry(
            boxSizeX, boxSizeY, boxSizeZ,
            widthSegments, heightSegments, depthSegments
          ),
          material
        );
        boxMesh.position.x = centerX;
        boxMesh.position.y = centerY;
        boxMesh.position.z = centerZ;
        boxClone = boxMesh.clone();
        scene.add(boxMesh);
        previewScene.add(boxClone);
        boxPhysicsBody.position.set(
          boxMesh.position.x,
          boxMesh.position.y,
          boxMesh.position.z
        );
        physicsWorld.add(boxPhysicsBody);
        addedObjectInstance = new AddedObject(
          addedObjectName, "box", metaData, material,
          boxMesh, boxClone, boxPhysicsBody, destroyedGrids
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

        var surface = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height, widthSegments, heightSegments),
          material
        );

        surface.position.x = positionX;
        surface.position.y = positionY;
        surface.position.z = positionZ;
        surface.quaternion.x = quaternionX;
        surface.quaternion.y = quaternionY;
        surface.quaternion.z = quaternionZ;
        surface.quaternion.w = quaternionW;

        var surfaceClone = surface.clone();
        scene.add(surface);
        previewScene.add(surfaceClone);

        var surfacePhysicsShape = new CANNON.Box(new CANNON.Vec3(
            physicsShapeParameterX,
            physicsShapeParameterY,
            physicsShapeParameterZ
        ));

        var surfacePhysicsBody = new CANNON.Body({
          mass: mass,
          shape: surfacePhysicsShape
        });
        surfacePhysicsBody.position.set(
          positionX,
          positionY,
          positionZ
        );
        physicsWorld.add(surfacePhysicsBody);
        addedObjectInstance = new AddedObject(addedObjectName, "surface", metaData, material,
                                    surface, surfaceClone, surfacePhysicsBody, destroyedGrids);
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
        var ramp = new THREE.Mesh(
          new THREE.PlaneGeometry(rampWidth, rampHeight, widthSegments, heightSegments),
          material
        );
        ramp.position.x = centerX;
        ramp.position.y = centerY;
        ramp.position.z = centerZ;
        ramp.quaternion.x = quaternionX;
        ramp.quaternion.y = quaternionY;
        ramp.quaternion.z = quaternionZ;
        ramp.quaternion.w = quaternionW;

        var rampClone = ramp.clone();
        var rampPhysicsShape = new CANNON.Box(new CANNON.Vec3(
          rampWidth/2,
          surfacePhysicalThickness,
          rampHeight/2
        ));
        var rampPhysicsBody = new CANNON.Body({
          mass: mass,
          shape: rampPhysicsShape
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
        previewScene.add(rampClone);
        physicsWorld.add(rampPhysicsBody);
        addedObjectInstance = new AddedObject(
          addedObjectName, "ramp", metaData, material, ramp, rampClone,
          rampPhysicsBody, new Object()
        );
        ramp.addedObject = addedObjectInstance;
      }else if (type == "sphere"){
        var radius = metaData["radius"];
        var centerX = metaData["centerX"];
        var centerY = metaData["centerY"];
        var centerZ = metaData["centerZ"];
        var spherePhysicsShape = new CANNON.Sphere(Math.abs(radius));
        var spherePhysicsBody = new CANNON.Body({
          mass: mass,
          shape: spherePhysicsShape
        });
        var sphereMesh;
        var sphereClone;
        var axis = metaData["gridSystemAxis"];
        sphereMesh = new THREE.Mesh(
          new THREE.SphereGeometry(Math.abs(radius), widthSegments, heightSegments), material
        );
        sphereMesh.position.x = centerX;
        sphereMesh.position.y = centerY;
        sphereMesh.position.z = centerZ;
        sphereClone = sphereMesh.clone();
        scene.add(sphereMesh);
        previewScene.add(sphereClone);
        spherePhysicsBody.position.set(
          sphereMesh.position.x,
          sphereMesh.position.y,
          sphereMesh.position.z
        );
        physicsWorld.add(spherePhysicsBody);
        addedObjectInstance = new AddedObject(
          addedObjectName, "sphere", metaData, material,
          sphereMesh, sphereClone, spherePhysicsBody, destroyedGrids
        );
        sphereMesh.addedObject = addedObjectInstance;
      }
      addedObjectInstance.associatedTexturePack = curAddedObjectExport.associatedTexturePack;
      addedObjectInstance.metaData["widthSegments"] = widthSegments;
      addedObjectInstance.metaData["heightSegments"] = heightSegments;
      addedObjectInstance.metaData["depthSegments"] = depthSegments;
      addedObjectInstance.isDynamicObject = isDynamicObject;
      addedObjectInstance.mass = mass;

      if (!curAddedObjectExport.fromObjectGroup){

        if (curAddedObjectExport.recentlyDetached){
          var quaternionX = curAddedObjectExport.worldQuaternionX;
          var quaternionY = curAddedObjectExport.worldQuaternionY;
          var quaternionZ = curAddedObjectExport.worldQuaternionZ;
          var quaternionW = curAddedObjectExport.worldQuaternionW;
          var physicsQuaternionX = curAddedObjectExport.physicsQuaternionX;
          var physicsQuaternionY = curAddedObjectExport.physicsQuaternionY;
          var physicsQuaternionZ = curAddedObjectExport.physicsQuaternionZ;
          var physicsQuaternionW = curAddedObjectExport.physicsQuaternionW;
          addedObjectInstance.mesh.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
          addedObjectInstance.previewMesh.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
          addedObjectInstance.physicsBody.quaternion.set(physicsQuaternionX, physicsQuaternionY, physicsQuaternionZ, physicsQuaternionW);
          addedObjectInstance.physicsBody.initQuaternion.copy(addedObjectInstance.physicsBody.quaternion);
          addedObjectInstance.initQuaternion = addedObjectInstance.mesh.quaternion.clone();
          addedObjectInstance.recentlyDetached = true;
          addedObjectInstance.worldQuaternionX = quaternionX;
          addedObjectInstance.worldQuaternionY = quaternionY;
          addedObjectInstance.worldQuaternionZ = quaternionZ;
          addedObjectInstance.worldQuaternionW = quaternionW;
          addedObjectInstance.physicsQuaternionX = physicsQuaternionX;
          addedObjectInstance.physicsQuaternionY = physicsQuaternionY;
          addedObjectInstance.physicsQuaternionZ = physicsQuaternionZ;
          addedObjectInstance.physicsQuaternionW = physicsQuaternionW;
        }

        var rotationX = curAddedObjectExport.rotationX;
        var rotationY = curAddedObjectExport.rotationY;
        var rotationZ = curAddedObjectExport.rotationZ;
        if (rotationX != 0){
          addedObjectInstance.rotate("x", rotationX);
        }
        if (rotationY != 0){
          addedObjectInstance.rotate("y", rotationY);
        }
        if (rotationZ != 0){
          addedObjectInstance.rotate("z", rotationZ);
        }
      }

      addedObjects[addedObjectName] = addedObjectInstance;
      this.mapTexturePackToSingleObject(diff);
      this.mapTextureToSingleObject(diff);
    }
  }
}

StateLoader.prototype.handleMaterialDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (diff.path.length == 2){
    if (kind == "D"){
      delete materials[diff.path[1]];
    }else if (kind == "N"){
      var rhs = diff.rhs;
      var material;
      var color = rhs.textColor;
      var opacity = rhs.opacity;
      var aoMapIntensity = rhs.aoMapIntensity;
      if (rhs.materialType == "BASIC"){
        var isWireFramed = rhs.isWireFramed;
        material = new THREE.MeshBasicMaterial(
          {
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: opacity,
            wireframe: isWireFramed,
            aoMapIntensity: aoMapIntensity
          }
        );
      }else if (rhs.materialType == "PHONG"){
        var shininess = rhs.shininess;
        var emissiveIntensity = rhs.emissiveIntensity;
        material = new THREE.MeshPhongMaterial(
          {
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: opacity,
            shininess: shininess,
            emissiveIntensity: emissiveIntensity,
            aoMapIntensity: aoMapIntensity
          }
        );
      }
      material.roygbivMaterialName = rhs.roygbivMaterialName;
      material.textColor = color;
      materials[diff.path[1]] = material;
    }
  }
}

StateLoader.prototype.handleCroppedGridSystemBufferDiff = function(){
  var diff = this.stateObj;
  var kind = diff.kind;
  if (kind == "D"){
    croppedGridSystemBuffer = 0;
  }else if (kind == "N"){
    var rhs = diff.rhs;
    croppedGridSystemBuffer = new CroppedGridSystem(
      rhs.sizeX, rhs.sizeZ, rhs.centerX, rhs.centerY, rhs.centerZ, rhs.axis
    );
  }else if (kind == "E"){
    if (croppedGridSystemBuffer && diff.path.length == 2){
      croppedGridSystemBuffer[diff.path[1]] = diff.rhs;
    }
  }
}

StateLoader.prototype.handleGridSystemDiff = function(){
  var diff = this.stateObj;
  var path = diff.path;
  if (path.length == 2){
    if (diff.kind == "D"){
      gridSystems[path[1]].destroy();
    }else if (diff.kind == "N"){
      var name = diff.rhs.name;
      var sizeX = diff.rhs.sizeX;
      var sizeZ = diff.rhs.sizeZ;
      var centerX = diff.rhs.centerX;
      var centerY = diff.rhs.centerY;
      var centerZ = diff.rhs.centerZ;
      var outlineColor = diff.rhs.outlineColor;
      var cellSize = diff.rhs.cellSize;
      var axis = diff.rhs.axis;
      var isSuperposed = diff.rhs.isSuperposed;
      var gs = new GridSystem(name, sizeX, sizeZ, centerX, centerY, centerZ,
                                              outlineColor, cellSize, axis);
      var selectedGridsExport = diff.rhs.selectedGridsExport;
      var slicedGridsExport = diff.rhs.slicedGridsExport;
      var slicedGridSystemNamesExport = diff.rhs.slicedGridSystemNamesExport;
      for (var i = 0; i<selectedGridsExport.length; i++){
        var gridNumber = selectedGridsExport[i];
        gs.grids[gridNumber].toggleSelect(false, false, true, false);
      }
      for (var i = 0; i<slicedGridsExport.length; i++){
        var gridNumber = slicedGridsExport[i];
        gs.grids[gridNumber].sliced = true;
        gs.grids[gridNumber].slicedGridSystemName = slicedGridSystemNamesExport[i];
      }
      gs.isSuperposed = isSuperposed;
      for (var gridNumber in gs.grids){
        var grid = gs.grids[gridNumber];
        if (grid.sliced){
          var slicedGridSystemName = grid.slicedGridSystemName;
          var gridSystem = gridSystems[slicedGridSystemName];
          if (gridSystem){
            gridSystem.slicedGrid = grid;
          }
        }
      }
    }
  }else if (path.length == 3){
    if (path[2] == "selectedGridsExport"){
      var gridSystem = gridSystems[path[1]];
      var item = diff.item;
      var gridNumber;
      if (item.kind == "D"){
        gridNumber = item.lhs;
      } else if (item.kind == "N"){
        gridNumber = item.rhs;
      }
      if (gridNumber){
        gridSystem.grids[gridNumber].toggleSelect();
      }
    }else if (path[2] == "slicedGridsExport"){
      var gridSystem = gridSystems[path[1]];
      var item = diff.item;
      if (diff.kind == "A"){
        if (item.kind == "D"){
          var index = diff.index;
          if (gridSystem){
            var gridName = gridSystem.name+"_"+"grid_"+diff.item.lhs;
            delete gridSystem.slicedGrids[gridName];
            var grid = gridSystem.grids[diff.item.lhs];
            delete grid.sliced;
            delete grid.slicedGridSystemName;
            delete gridSystem.slicedGrid;
          }
        }else if (item.kind == "N"){
          var index = diff.index;
          if (gridSystem){
            var gridName = gridSystem.name+"_"+"grid_"+diff.item.rhs;
            var grid = gridSystem.grids[diff.item.rhs];
            gridSystem.slicedGrids[gridName] = grid;
            grid.sliced = true;
            //grid.slicedGridSystemName= gridSystem.name;
            tempSlicedGridExport = grid;
          }
        }
      }
    }else if (path[2] == "slicedGridSystemNamesExport"){
      var kind = diff.kind;
      if (kind == "A"){
        if (diff.item.kind == "N"){
          var gridSystemName = diff.item.rhs;
          if (tempSlicedGridExport){
            var grid = tempSlicedGridExport;
            setTimeout(function(){
              var gs = gridSystems[gridSystemName];
              if (gs){
                gs.slicedGrid = grid;
                grid.slicedGridSystemName = gridSystemName;
              }
            });
          }
        }
      }
    }
  }
}

StateLoader.prototype.load = function(undo){
  try{

    if (undo){
      this.resetProject(true);
    }else{
      this.resetProject(false);
    }

    this.isUndo = undo;

    var obj = this.stateObj;
    // GRID SYSTEMS ************************************************
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
      var isSuperposed = exportObject.isSuperposed;
      var gs = new GridSystem(name, sizeX, sizeZ, centerX, centerY, centerZ,
                                              outlineColor, cellSize, axis);
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
      }
      gs.isSuperposed = isSuperposed;
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
    // WALL COLLECTIONS ********************************************
    var wallCollectionsExport = obj.wallCollections;
    for (var wallCollectionName in wallCollectionsExport){
      var curWallCollectionExport = wallCollectionsExport[wallCollectionName];
      var name = curWallCollectionExport.name;
      var height = curWallCollectionExport.height;
      var outlineColor = curWallCollectionExport.outlineColor;
      var isSuperposed = curWallCollectionExport.isSuperposed;
      new WallCollection(
        name, height, outlineColor, 0, 0, isSuperposed, true,
        curWallCollectionExport
      );
    }
    // MATERIALS ***************************************************
    var materialsExport = obj.materials;
    for (var materialName in materialsExport){
      var material;
      var curMaterialExport = materialsExport[materialName];
      var color = curMaterialExport.textColor;
      var opacity = curMaterialExport.opacity;
      var aoMapIntensity = curMaterialExport.aoMapIntensity;
      if (curMaterialExport.materialType == "BASIC"){
        var isWireFramed = curMaterialExport.isWireFramed;
        material = new THREE.MeshBasicMaterial(
          {
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: opacity,
            aoMapIntensity: aoMapIntensity,
            wireframe: isWireFramed
          }
        );
      }else if (curMaterialExport.materialType == "PHONG"){
        var shininess = curMaterialExport.shininess;
        var emissiveIntensity = curMaterialExport.emissiveIntensity;
        material = new THREE.MeshPhongMaterial(
          {
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: opacity,
            aoMapIntensity: aoMapIntensity,
            shininess: shininess,
            emissiveIntensity: emissiveIntensity
          }
        );
      }
      material.roygbivMaterialName = curMaterialExport.roygbivMaterialName;
      material.textColor = color;
      materials[materialName] = material;
    }
    // DEFAULT MATERIAL ********************************************
    defaultMaterialType = obj.defaultMaterialType;
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
          material = new THREE.MeshBasicMaterial({
            color: "white",
            side: THREE.DoubleSide,
            wireframe: false
          });
          material.roygbivMaterialName = roygbivMaterialName;
          material.transparent = true;
          material.opacity = curAddedObjectExport.opacity;
          material.aoMapIntensity = curAddedObjectExport.aoMapIntensity;
          material.needsUpdate = true;
        }else if (roygbivMaterialName == "NULL_PHONG"){
          material = new THREE.MeshPhongMaterial({
            color: "white",
            side: THREE.DoubleSide,
            wireframe: false
          });
          material.roygbivMaterialName = roygbivMaterialName;
          material.transparent = true;
          material.opacity = curAddedObjectExport.opacity;
          material.aoMapIntensity = curAddedObjectExport.aoMapIntensity;
          material.shininess = curAddedObjectExport.shininess;
          material.emissiveIntensity = curAddedObjectExport.emissiveIntensity;
          material.needsUpdate = true;
        }else{
          material = new THREE.MeshBasicMaterial({color: "white", side: THREE.DoubleSide});
          material.roygbivMaterialName = roygbivMaterialName;
        }
      }

      var widthSegments = metaData["widthSegments"];
      var heightSegments = metaData["heightSegments"];
      var depthSegments = metaData["depthSegments"];
      if (!widthSegments){
        widthSegments = 1;
      }
      if (!heightSegments){
        heightSegments = 1;
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
        var boxPhysicsShape = new CANNON.Box(new CANNON.Vec3(
          boxSizeX / 2,
          boxSizeY / 2,
          boxSizeZ / 2
        ));
        var boxPhysicsBody = new CANNON.Body({
          mass: mass,
          shape: boxPhysicsShape
        });
        var boxMesh;
        var boxClone;
        var axis = metaData["gridSystemAxis"];
        boxMesh = new THREE.Mesh(
          new THREE.BoxGeometry(
            boxSizeX, boxSizeY, boxSizeZ,
            widthSegments, heightSegments, depthSegments
          ),
          material
        );
        boxMesh.position.x = centerX;
        boxMesh.position.y = centerY;
        boxMesh.position.z = centerZ;
        boxClone = boxMesh.clone();
        scene.add(boxMesh);
        previewScene.add(boxClone);
        boxPhysicsBody.position.set(
          boxMesh.position.x,
          boxMesh.position.y,
          boxMesh.position.z
        );
        physicsWorld.add(boxPhysicsBody);
        addedObjectInstance = new AddedObject(
          addedObjectName, "box", metaData, material,
          boxMesh, boxClone, boxPhysicsBody, destroyedGrids
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

        var surface = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height, widthSegments, heightSegments),
          material
        );

        surface.position.x = positionX;
        surface.position.y = positionY;
        surface.position.z = positionZ;
        surface.quaternion.x = quaternionX;
        surface.quaternion.y = quaternionY;
        surface.quaternion.z = quaternionZ;
        surface.quaternion.w = quaternionW;

        var surfaceClone = surface.clone();
        scene.add(surface);
        previewScene.add(surfaceClone);

        var surfacePhysicsShape = new CANNON.Box(new CANNON.Vec3(
            physicsShapeParameterX,
            physicsShapeParameterY,
            physicsShapeParameterZ
        ));

        var surfacePhysicsBody = new CANNON.Body({
          mass: mass,
          shape: surfacePhysicsShape
        });
        surfacePhysicsBody.position.set(
          positionX,
          positionY,
          positionZ
        );
        physicsWorld.add(surfacePhysicsBody);
        addedObjectInstance = new AddedObject(addedObjectName, "surface", metaData, material,
                                    surface, surfaceClone, surfacePhysicsBody, destroyedGrids);
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
        var ramp = new THREE.Mesh(
          new THREE.PlaneGeometry(rampWidth, rampHeight, widthSegments, heightSegments),
          material
        );
        ramp.position.x = centerX;
        ramp.position.y = centerY;
        ramp.position.z = centerZ;
        ramp.quaternion.x = quaternionX;
        ramp.quaternion.y = quaternionY;
        ramp.quaternion.z = quaternionZ;
        ramp.quaternion.w = quaternionW;

        var rampClone = ramp.clone();
        var rampPhysicsShape = new CANNON.Box(new CANNON.Vec3(
          rampWidth/2,
          surfacePhysicalThickness,
          rampHeight/2
        ));
        var rampPhysicsBody = new CANNON.Body({
          mass: mass,
          shape: rampPhysicsShape
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
        previewScene.add(rampClone);
        physicsWorld.add(rampPhysicsBody);
        addedObjectInstance = new AddedObject(
          addedObjectName, "ramp", metaData, material, ramp, rampClone,
          rampPhysicsBody, new Object()
        );
        ramp.addedObject = addedObjectInstance;
      }else if (type == "sphere"){
        var radius = metaData["radius"];
        var centerX = metaData["centerX"];
        var centerY = metaData["centerY"];
        var centerZ = metaData["centerZ"];
        var spherePhysicsShape = new CANNON.Sphere(Math.abs(radius));
        var spherePhysicsBody = new CANNON.Body({
          mass: mass,
          shape: spherePhysicsShape
        });
        var sphereMesh;
        var sphereClone;
        var axis = metaData["gridSystemAxis"];
        sphereMesh = new THREE.Mesh(
          new THREE.SphereGeometry(Math.abs(radius), widthSegments, heightSegments), material
        );
        sphereMesh.position.x = centerX;
        sphereMesh.position.y = centerY;
        sphereMesh.position.z = centerZ;
        sphereClone = sphereMesh.clone();
        scene.add(sphereMesh);
        previewScene.add(sphereClone);
        spherePhysicsBody.position.set(
          sphereMesh.position.x,
          sphereMesh.position.y,
          sphereMesh.position.z
        );
        physicsWorld.add(spherePhysicsBody);
        addedObjectInstance = new AddedObject(
          addedObjectName, "sphere", metaData, material,
          sphereMesh, sphereClone, spherePhysicsBody, destroyedGrids
        );
        sphereMesh.addedObject = addedObjectInstance;
      }
      addedObjectInstance.associatedTexturePack = curAddedObjectExport.associatedTexturePack;
      addedObjectInstance.metaData["widthSegments"] = widthSegments;
      addedObjectInstance.metaData["heightSegments"] = heightSegments;
      addedObjectInstance.metaData["depthSegments"] = depthSegments;
      addedObjectInstance.isDynamicObject = isDynamicObject;
      addedObjectInstance.mass = mass;

      if (!curAddedObjectExport.fromObjectGroup){

        if (curAddedObjectExport.recentlyDetached){
          var quaternionX = curAddedObjectExport.worldQuaternionX;
          var quaternionY = curAddedObjectExport.worldQuaternionY;
          var quaternionZ = curAddedObjectExport.worldQuaternionZ;
          var quaternionW = curAddedObjectExport.worldQuaternionW;
          var physicsQuaternionX = curAddedObjectExport.physicsQuaternionX;
          var physicsQuaternionY = curAddedObjectExport.physicsQuaternionY;
          var physicsQuaternionZ = curAddedObjectExport.physicsQuaternionZ;
          var physicsQuaternionW = curAddedObjectExport.physicsQuaternionW;
          addedObjectInstance.mesh.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
          addedObjectInstance.previewMesh.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
          addedObjectInstance.physicsBody.quaternion.set(physicsQuaternionX, physicsQuaternionY, physicsQuaternionZ, physicsQuaternionW);
          addedObjectInstance.physicsBody.initQuaternion.copy(addedObjectInstance.physicsBody.quaternion);
          addedObjectInstance.initQuaternion = addedObjectInstance.mesh.quaternion.clone();
          addedObjectInstance.recentlyDetached = true;
          addedObjectInstance.worldQuaternionX = quaternionX;
          addedObjectInstance.worldQuaternionY = quaternionY;
          addedObjectInstance.worldQuaternionZ = quaternionZ;
          addedObjectInstance.worldQuaternionW = quaternionW;
          addedObjectInstance.physicsQuaternionX = physicsQuaternionX;
          addedObjectInstance.physicsQuaternionY = physicsQuaternionY;
          addedObjectInstance.physicsQuaternionZ = physicsQuaternionZ;
          addedObjectInstance.physicsQuaternionW = physicsQuaternionW;
        }

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
        addedObjectInstance.previewMesh.quaternion.set(
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

      addedObjects[addedObjectName] = addedObjectInstance;

    }
    // TEXTURE URLS ************************************************
    textureURLs = Object.assign({}, obj.textureURLs);
    // UPLOADED IMAGES *********************************************
    var uploadedImagesExport = obj.uploadedImages;
    for (var imgName in uploadedImagesExport){
      var src = uploadedImagesExport[imgName];
      var imageDom = document.createElement("img");
      imageDom.src = src;
      if (obj.uploadedImageSizes && obj.uploadedImageSizes[imgName]){
        imageDom.width = obj.uploadedImageSizes[imgName].width;
        imageDom.height = obj.uploadedImageSizes[imgName].height;
      }
      uploadedImages[imgName] = imageDom;
    }
    // TEXTURES ****************************************************
    this.loaders = new Object();
    var uploadedTextures = obj.textures;
    for (var textureName in uploadedTextures){
      var curTexture = uploadedTextures[textureName];
      if (curTexture == 1 || curTexture == 2 || curTexture == 3){
        textures[textureName] = curTexture;
        textureCache[textureName] = curTexture;
        continue;
      }
      var offsetX = curTexture.offset[0];
      var offsetY = curTexture.offset[1];
      var repeatU = curTexture.repeat[0];
      var repeatV = curTexture.repeat[1];
      var textureURL = textureURLs[textureName];
      if (obj.modifiedTextures[textureName]){
        var img = new Image();
        img.src = obj.modifiedTextures[textureName];
        var texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.repeat.set(repeatU, repeatV);
        texture.offset.x = offsetX;
        texture.offset.y = offsetY;
        texture.isLoaded = true;
        modifiedTextures[textureName] = obj.modifiedTextures[textureName];
        var that = this;
        texture.image.onload = function(){
          textures[this.textureNameX] = this.textureX;
          this.textureX.needsUpdate = true;
          textureCache[this.textureNameX] = this.textureX.clone();
          that.mapLoadedTexture(this.textureX, this.textureNameX);
        }.bind({textureX: texture, textureNameX: textureName});
      }else if (uploadedImages[textureURL]){
        var texture = new THREE.Texture(uploadedImages[textureURL]);
        texture.repeat.set(repeatU, repeatV);
        texture.offset.x = offsetX;
        texture.offset.y = offsetY;
        texture.isLoaded = true;
        texture.fromUploadedImage = true;
        if (texture.image.width && texture.image.height){
          if (obj.textureSizes && obj.textureSizes[textureName]){
            var imgW = texture.image.width;
            var imgH = texture.image.height;
            var newW = obj.textureSizes[textureName].width;
            var newH = obj.textureSizes[textureName].height;
            if (imgW != newW || imgH != newH){
              var that = this;
              texture.image.onload = function(){
                var imgW = this.textureX.image.width;
                var imgH = this.textureX.image.height;
                var newW = obj.textureSizes[this.textureNameX].width;
                var newH = obj.textureSizes[this.textureNameX].height;
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = newW;
                tmpCanvas.height = newH;
                tmpCanvas.getContext("2d").drawImage(this.textureX.image, 0, 0, imgW, imgH, 0, 0, newW, newH);
                this.textureX.image = tmpCanvas;
                this.textureX.needsUpdate = true;
                textures[this.textureNameX] = this.textureX;
                textureCache[this.textureNameX] = this.textureX.clone();
                that.mapLoadedTexture(this.textureX, this.textureNameX);
              }.bind({textureX: texture, textureNameX: textureName})
            }
          }
        }
        textures[textureName] = texture;
        textureCache[textureName] = texture.clone();
        texture.needsUpdate = true;
        this.mapLoadedTexture(texture, textureName);
      }else{
        if (textureURL.toUpperCase().endsWith("TGA")){
          this.loaders[textureName] = new THREE.TGALoader();
        }else{
          this.loaders[textureName] = new THREE.TextureLoader();
        }
        textures[textureName] = 1;
        textureCache[textureName] = 1;
        var that = this;
        this.loaders[textureName].load(textureURL,
          function(textureData){
            var textureNameX = this.textureNameX;
            textures[textureNameX] = textureData;
            var hasPadding = (obj.texturePaddings[textureNameX] !== undefined);
            if (obj.textureSizes && obj.textureSizes[textureNameX]){
              var size = obj.textureSizes[textureNameX];
              if (size.width != textureData.image.width || size.height != textureData.image.height){
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = size.width;
                tmpCanvas.height = size.height;
                tmpCanvas.getContext("2d").drawImage(textureData.image, 0, 0, textureData.image.width, textureData.image.height, 0, 0, size.width, size.height);
                textureData.image = tmpCanvas;
                textureData.needsUpdate = true;
              }
            }
            textures[textureNameX].needsUpdate = true;
            textures[textureNameX].isLoaded = true;
            textures[textureNameX].repeat.set(this.repeatUU, this.repeatVV);
            textures[textureNameX].offset.x = this.offsetXX;
            textures[textureNameX].offset.y = this.offsetYY;
            textureCache[textureNameX] = textureData.clone();
            that.mapLoadedTexture(textures[textureNameX], textureNameX);
          }.bind({textureNameX: textureName, offsetXX: offsetX, offsetYY: offsetY, repeatUU: repeatU, repeatVV: repeatV}), function(xhr){
            textureCache[this.textureNameX] = 2;
            textures[this.textureNameX] = 2;
          }.bind({textureNameX: textureName}), function(xhr){
            textureCache[this.textureNameX] = 3;
            textures[this.textureNameX] = 3;
          }.bind({textureNameX: textureName})
        );
      }
      this.hasTextures = true;
    }
    // LIGHTS - LIGHT_PREVIEWSCENE - POINT LIGHT REPRESENTATIONS ***
    var lightsExport = obj.lights;
    for (var lightName in lightsExport){
      var curLightExport = lightsExport[lightName];
      var lightColor = curLightExport["colorTextVal"];
      var lightIntensity = curLightExport.intensity;
      if (curLightExport.type == "AMBIENT"){
        var light = new THREE.AmbientLight(lightColor);
        var previewSceneLight = light.clone();
        light.intensity = lightIntensity;
        previewSceneLight.intensity = lightIntensity;
        scene.add(light);
        previewScene.add(previewSceneLight);
        lights[lightName] = light;
        light_previewScene[lightName] = previewSceneLight;
        light.colorTextVal = lightColor;
        previewSceneLight.colorTextVal = lightColor;
      }else if (curLightExport.type == "POINT"){
        var pointLight = new THREE.PointLight(lightColor);
        var pointLightClone = pointLight.clone();
        pointLight.colorTextVal = lightColor
        pointLightClone.colorTextVal = lightColor;
        pointLight.position.x = curLightExport.positionX;
        pointLight.position.y = curLightExport.positionY;
        pointLight.position.z = curLightExport.positionZ;
        pointLightClone.position.x = curLightExport.positionX;
        pointLightClone.position.y = curLightExport.positionY;
        pointLightClone.position.z = curLightExport.positionZ;
        pointLight.initialPositionX = curLightExport.initialPositionX;
        pointLight.initialPositionY = curLightExport.initialPositionY;
        pointLight.initialPositionZ = curLightExport.initialPositionZ;
        pointLightClone.initialPositionX = curLightExport.initialPositionX;
        pointLightClone.initialPositionY = curLightExport.initialPositionY;
        pointLightClone.initialPositionZ = curLightExport.initialPositionZ;
        pointLight.intensity = lightIntensity;
        pointLightClone.intensity = lightIntensity;
        lights[lightName] = pointLight;
        light_previewScene[lightName] = pointLightClone;
        scene.add(pointLight);
        previewScene.add(pointLightClone);
        var pointLightRepresentation = new THREE.Mesh(
          new THREE.SphereGeometry(5),
          new THREE.MeshBasicMaterial({color: lightColor})
        );
        pointLightRepresentation.position.x = curLightExport.positionX;
        pointLightRepresentation.position.y = curLightExport.positionY;
        pointLightRepresentation.position.z = curLightExport.positionZ;
        scene.add(pointLightRepresentation);
        pointLightRepresentations[lightName] = pointLightRepresentation;
        pointLightRepresentation.lightName = lightName;
        pointLightRepresentation.isPointLightRepresentation = true;
      }
    }
    // TEXTURE PACKS ***********************************************
    var texturePacksExport = obj.texturePacks;
    for (var texturePackName in texturePacksExport){
      var curTexturePackExport = texturePacksExport[texturePackName];
      var scaleFactor = curTexturePackExport.scaleFactor;
      var refTexturePackName = curTexturePackExport.refTexturePackName;
      var texturePack = new TexturePack(
        texturePackName,
        curTexturePackExport.directoryName,
        curTexturePackExport.fileExtension,
        function(){
          this.that.mapLoadedTexturePack(this.texturePackName, this.objj);
        }.bind({texturePackName: texturePackName, that: this, objj: obj, scaleFactorX: scaleFactor}),
        true,
        null,
        scaleFactor,
        refTexturePackName
      );
      texturePacks[texturePackName] = texturePack;
      this.hasTexturePacks = true;
    }
    // SKYBOXES ****************************************************
    var skyBoxScale = obj.skyBoxScale;
    var skyboxExports = obj.skyBoxes;
    skyboxVisible = obj.skyboxVisible;
    mappedSkyboxName = obj.mappedSkyboxName;
    for (var skyboxName in skyboxExports){
      var skyboxExport = skyboxExports[skyboxName];
      var skybox;
      if (!mappedSkyboxName){
        skybox = new SkyBox(
          skyboxExport.name,
          skyboxExport.directoryName,
          skyboxExport.fileExtension
        );
      }else{
        skybox = new SkyBox(
          skyboxExport.name,
          skyboxExport.directoryName,
          skyboxExport.fileExtension,
          function(){
            if (this.skyboxName == mappedSkyboxName){
              var skybox = skyBoxes[this.skyboxName];
              var materialArray = [];
              var skyboxTextures = [
                skybox.leftTexture,
                skybox.rightTexture,
                skybox.upTexture,
                skybox.downTexture,
                skybox.frontTexture,
                skybox.backTexture
              ];
              for (var i = 0; i<skyboxTextures.length; i++){
                materialArray.push(new THREE.MeshBasicMaterial(
                  {
                    map: skyboxTextures[i],
                    side: THREE.BackSide
                  }
                ));
              }
              if (skyboxMesh){
                scene.remove(skyboxMesh);
              }
              if (skyboxPreviewMesh){
                previewScene.remove(skyboxPreviewMesh);
              }
              var skyGeometry = new THREE.CubeGeometry(
                skyboxDistance, skyboxDistance, skyboxDistance
              );
              skyboxMesh = new THREE.Mesh( skyGeometry, materialArray );
              skyboxPreviewMesh = skyboxMesh.clone();
              if (skyboxVisible){
                scene.add(skyboxMesh);
                previewScene.add(skyboxPreviewMesh);
              }
              if (this.skyBoxScale){
                skyboxMesh.scale.x = this.skyBoxScale;
                skyboxMesh.scale.y = this.skyBoxScale;
                skyboxMesh.scale.z = this.skyBoxScale;
                skyboxPreviewMesh.scale.x = this.skyBoxScale;
                skyboxPreviewMesh.scale.y = this.skyBoxScale;
                skyboxPreviewMesh.scale.z = this.skyBoxScale;
              }
            }
          }.bind({skyboxName: skyboxName, skyBoxScale: skyBoxScale})
        );
      }
      skyBoxes[skyboxName] = skybox;
    }
    // ANCHOR GRID *************************************************
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
    // CROPPED GRID SYSTEM BUFFER **********************************
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
    // SCRIPTS *****************************************************
    for (var scriptName in obj.scripts){
      var curScriptExport = obj.scripts[scriptName];
      scripts[scriptName] = new Script(
        curScriptExport.name, curScriptExport.script
      );
      if (curScriptExport.runAutomatically){
        scripts[scriptName].runAutomatically = true;
      }else{
        scripts[scriptName].runAutomatically = false;
      }
      if (curScriptExport.localFilePath){
        scripts[scriptName].localFilePath = curScriptExport.localFilePath;
      }
    }

    // OBJECT GROUPS ***********************************************
    for (var objectName in obj.objectGroups){
      var curObjectGroupExport = obj.objectGroups[objectName];
      var group = new Object();
      for (var name in curObjectGroupExport.group){
        group[name] = addedObjects[name];
      }
      var objectGroupInstance = new ObjectGroup(objectName, group);
      objectGroups[objectName] = objectGroupInstance;
      objectGroupInstance.glue();
      if (curObjectGroupExport.mass){
        objectGroupInstance.setMass(curObjectGroupExport.mass);
      }
      objectGroupInstance.initQuaternion = new THREE.Quaternion(
        curObjectGroupExport.quaternionX, curObjectGroupExport.quaternionY,
        curObjectGroupExport.quaternionZ, curObjectGroupExport.quaternionW
      );
      objectGroupInstance.graphicsGroup.quaternion.copy(objectGroupInstance.initQuaternion.clone());
      objectGroupInstance.previewGraphicsGroup.quaternion.copy(objectGroupInstance.initQuaternion.clone());
      objectGroupInstance.physicsBody.quaternion.copy(objectGroupInstance.graphicsGroup.quaternion);
      objectGroupInstance.physicsBody.initQuaternion = objectGroupInstance.graphicsGroup.quaternion;

      var isDynamicObject = false;
      if (curObjectGroupExport.isDynamicObject){
        isDynamicObject = curObjectGroupExport.isDynamicObject;
      }
      objectGroupInstance.isDynamicObject = isDynamicObject;
    }
    // MARKED PONTS ************************************************
    for (var markedPointName in obj.markedPointsExport){
      var curMarkedPointExport = obj.markedPointsExport[markedPointName];
      var markedPoint = new MarkedPoint(
        markedPointName,
        curMarkedPointExport["x"],
        curMarkedPointExport["y"],
        curMarkedPointExport["z"]
      );
      if (!curMarkedPointExport.isHidden && mode == 0){
        markedPoint.renderToScreen();
      }else{
        markedPoint.isHidden = true;
      }
      markedPoint.showAgainOnTheNextModeSwitch = curMarkedPointExport.showAgainOnTheNextModeSwitch;
      if (mode == 0){
        markedPoint.showAgainOnTheNextModeSwitch = false;
      }
      markedPoints[markedPointName] = markedPoint;
    }
    // PHYSICS WORKER MODE *****************************************
    PHYSICS_WORKER_ENABLED = obj.physicsWorkerMode;
    // PARTICLE COLLISION WORKER MODE ******************************
    COLLISION_WORKER_ENABLED = obj.particleCollisionWorkerMode;
    // PARTICLE SYSTEM COLLISION WORKER MODE ***********************
    PS_COLLISION_WORKER_ENABLED = obj.particleSystemCollisionWorkerMode;
    // OCTREE LIMIT ************************************************
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
    // BIN SIZE ****************************************************
    BIN_SIZE = parseInt(obj.binSize);
    // FOG *********************************************************
    var fogObj = obj.fogObj;
    fogActive = fogObj.fogActive;
    fogColor = fogObj.fogColor;
    fogDensity = fogObj.fogDensity;
    fogColorRGB = new THREE.Color(fogColor);
    // POST PROCESSING *********************************************
    scanlineCount = obj.scanlineCount;
    scanlineSIntensity = obj.scanlineSIntensity;
    scanlineNIntensity = obj.scanlineNIntensity;
    staticAmount = obj.staticAmount;
    staticSize = obj.staticSize;
    rgbAmount = obj.rgbAmount;
    rgbAngle = obj.rgbAngle;
    badtvThick = obj.badtvThick;
    badtvFine = obj.badtvFine;
    badtvDistortSpeed = obj.badtvDistortSpeed ;
    badtvRollSpeed = obj.badtvRollSpeed;
    bloomStrength = obj.bloomStrength;
    bloomRadius = obj.bloomRadius;
    bloomThreshold = obj.bloomThreshold;
    bloomResolutionScale = obj.bloomResolutionScale;
    scanlineOn = obj.scanlineOn;
    rgbOn = obj.rgbOn;
    badTvOn = obj.badTvOn;
    staticOn = obj.staticOn;
    bloomOn = obj.bloomOn;
    postprocessingParameters = {
      "Scanlines_count": scanlineCount,
      "Scanlines_sIntensity": scanlineSIntensity,
      "Scanlines_nIntensity": scanlineNIntensity,
      "Static_amount": staticAmount,
      "Static_size": staticSize,
      "RGBShift_amount": rgbAmount,
      "RGBShift_angle": rgbAngle,
      "BadTV_thickDistort": badtvThick,
      "BadTV_fineDistort": badtvFine,
      "BadTV_distortSpeed": badtvDistortSpeed,
      "BadTV_rollSpeed": badtvRollSpeed,
      "Bloom_strength": bloomStrength,
      "Bloom_radius": bloomRadius,
      "Bloom_threshhold": bloomThreshold,
      "Bloom_resolution_scale": bloomResolutionScale,
      "Scanlines": scanlineOn,
      "RGB": rgbOn,
      "Bad TV": badTvOn,
      "Static": staticOn,
      "Bloom": bloomOn
    };
    datGui = new dat.GUI();
    datGui.add(postprocessingParameters, "Scanlines_count").min(0).max(1000).step(1).onChange(function(val){
      adjustPostProcessing(0, val);
    });
    datGui.add(postprocessingParameters, "Scanlines_sIntensity").min(0.0).max(2.0).step(0.1).onChange(function(val){
      adjustPostProcessing(1, val);
    });
    datGui.add(postprocessingParameters, "Scanlines_nIntensity").min(0.0).max(2.0).step(0.1).onChange(function(val){
      adjustPostProcessing(2, val);
    });
    datGui.add(postprocessingParameters, "Static_amount").min(0.0).max(1.0).step(0.01).onChange(function(val){
      adjustPostProcessing(3, val);
    });
    datGui.add(postprocessingParameters, "Static_size").min(0.0).max(100.0).step(1.0).onChange(function(val){
      adjustPostProcessing(4, val);
    });
    datGui.add(postprocessingParameters, "RGBShift_amount").min(0.0).max(0.1).step(0.01).onChange(function(val){
      adjustPostProcessing(5, val);
    });
    datGui.add(postprocessingParameters, "RGBShift_angle").min(0.0).max(2.0).step(0.1).onChange(function(val){
      adjustPostProcessing(6, val);
    });
    datGui.add(postprocessingParameters, "BadTV_thickDistort").min(0.1).max(20).step(0.1).onChange(function(val){
      adjustPostProcessing(7, val);
    });
    datGui.add(postprocessingParameters, "BadTV_fineDistort").min(0.1).max(20).step(0.1).onChange(function(val){
      adjustPostProcessing(8, val);
    });
    datGui.add(postprocessingParameters, "BadTV_distortSpeed").min(0.0).max(1.0).step(0.01).onChange(function(val){
      adjustPostProcessing(9, val);
    });
    datGui.add(postprocessingParameters, "BadTV_rollSpeed").min(0.0).max(1.0).step(0.01).onChange(function(val){
      adjustPostProcessing(10, val);
    });
    datGui.add(postprocessingParameters, "Bloom_strength").min(0.0).max(3.0).step(0.01).onChange(function(val){
      adjustPostProcessing(11, val);
    });
    datGui.add(postprocessingParameters, "Bloom_radius").min(0.0).max(1.0).step(0.01).onChange(function(val){
      adjustPostProcessing(12, val);
    });
    datGui.add(postprocessingParameters, "Bloom_threshhold").min(0.0).max(1.0).step(0.01).onChange(function(val){
      adjustPostProcessing(13, val);
    });
    datGui.add(postprocessingParameters, "Bloom_resolution_scale").min(0.1).max(1.0).step(0.001).onChange(function(val){
      adjustPostProcessing(19, val);
    });
    datGui.add(postprocessingParameters, "Scanlines").onChange(function(val){
      adjustPostProcessing(14, val);
    });
    datGui.add(postprocessingParameters, "RGB").onChange(function(val){
      adjustPostProcessing(15, val);
    });
    datGui.add(postprocessingParameters, "Bad TV").onChange(function(val){
      adjustPostProcessing(16, val);
    });
    datGui.add(postprocessingParameters, "Bloom").onChange(function(val){
      adjustPostProcessing(17, val);
    });
    datGui.add(postprocessingParameters, "Static").onChange(function(val){
      adjustPostProcessing(18, val);
    });
    $(datGui.domElement).attr("hidden", true);

    if (!this.hasTextures && !this.hasTexturePacks && !undo){
      undoRedoHandler.push();
    }

    if (this.oldPhysicsDebugMode){
      if (this.oldPhysicsDebugMode != "NONE"){
        debugRenderer = new THREE.CannonDebugRenderer(previewScene, physicsWorld);
        physicsDebugMode = this.oldPhysicsDebugMode;
      }
    }

    return true;
  }catch (err){
    throw err;
    this.reason = err;
    return false;
  }
}

StateLoader.prototype.mapTextureToSingleObject = function(diff, exported){
  for (var textureName in textures){
    var addedObjectName;
    if (!exported){
      addedObjectName = diff.path[1];
    }else{
      addedObjectName = diff.name;
    }
    var texture = textures[textureName];
    var curAddedObjectExport;
    if (!exported){
      curAddedObjectExport = diff.rhs;
    }else{
      curAddedObjectExport = diff.export();
    }
    if (!curAddedObjectExport){
      break;
    }
    var material = addedObjects[addedObjectName].material;
    var metaData = addedObjects[addedObjectName].metaData;

    var diffuseRoygbivTextureName;
    var alphaRoygbivTextureName;
    var aoRoygbivTextureName;
    var emissiveRoygbivTextureName;
    var normalRoygbivTextureName;
    var specularRoygbivTextureName;
    var displacementRoygbivTextureName;
    var displacementScale;
    var displacementBias;

    if (!exported){
      diffuseRoygbivTextureName = curAddedObjectExport.diffuseRoygbivTextureName;
      alphaRoygbivTextureName = curAddedObjectExport.alphaRoygbivTextureName;
      aoRoygbivTextureName = curAddedObjectExport.aoRoygbivTextureName;
      emissiveRoygbivTextureName = curAddedObjectExport.emissiveRoygbivTextureName;
      normalRoygbivTextureName = curAddedObjectExport.normalRoygbivTextureName;
      specularRoygbivTextureName = curAddedObjectExport.specularRoygbivTextureName;
      displacementRoygbivTextureName = curAddedObjectExport.displacementRoygbivTextureName;
      displacementScale = curAddedObjectExport.displacementScale;
      displacementBias = curAddedObjectExport.displacementBias;
    }else{
      diffuseRoygbivTextureName = diff.diffuseRoygbivTextureName;
      alphaRoygbivTextureName = diff.alphaRoygbivTextureName;
      aoRoygbivTextureName = diff.aoRoygbivTextureName;
      emissiveRoygbivTextureName = diff.emissiveRoygbivTextureName;
      normalRoygbivTextureName = diff.normalRoygbivTextureName;
      specularRoygbivTextureName = diff.specularRoygbivTextureName;
      displacementRoygbivTextureName = diff.displacementRoygbivTextureName;
      displacementScale = diff.displacementScale;
      displacementBias = diff.displacementBias;
    }


    if (diffuseRoygbivTextureName){
      if (textureName == diffuseRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];
        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
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

        material.map = cloneTexture;
        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (alphaRoygbivTextureName){
      if (textureName == alphaRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        material.alphaMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.transparent = true;
        material.alphaTest = 0.5;
        material.needsUpdate = true;
      }
    }
    if (aoRoygbivTextureName){
      if (textureName == aoRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.aoMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (emissiveRoygbivTextureName){
      if (textureName == emissiveRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        material.emissive = new THREE.Color( 0xffffff );
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.emissiveMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (normalRoygbivTextureName){
      if (textureName == normalRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];
        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.normalMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (specularRoygbivTextureName){
      if (textureName == specularRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.specularMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (displacementRoygbivTextureName){
      if (textureName == displacementRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        if (!(typeof displacementScale == UNDEFINED)){
          material.displacementScale = displacementScale;
        }
        if (!(typeof displacementBias == UNDEFINED)){
          material.displacementBias = displacementBias;
        }

        material.displacementMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
  }
}

StateLoader.prototype.mapTexturePackToSingleObject = function(diff){
  for (var texturePackName in texturePacks){
    var texturePack = texturePacks[texturePackName];
    var addedObject = addedObjects[diff.path[1]];
    var material = addedObject.material;

    var addedObjectExport = diff.rhs;
    if (!addedObjectExport){
      return;
    }
    var diffuseRoygbivTexturePackName;
    var alphaRoygbivTexturePackName;
    var aoRoygbivTexturePackName;
    var emissiveRoygbivTexturePackName;
    var normalRoygbivTexturePackName;
    var specularRoygbivTexturePackName;
    var displacementRoygbivTexturePackName;

    diffuseRoygbivTexturePackName = addedObjectExport["diffuseRoygbivTexturePackName"];
    alphaRoygbivTexturePackName = addedObjectExport["alphaRoygbivTexturePackName"];
    aoRoygbivTexturePackName = addedObjectExport["aoRoygbivTexturePackName"];
    emissiveRoygbivTexturePackName = addedObjectExport["emissiveRoygbivTexturePackName"];
    normalRoygbivTexturePackName = addedObjectExport["normalRoygbivTexturePackName"];
    specularRoygbivTexturePackName = addedObjectExport["specularRoygbivTexturePackName"];
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

    var textureOffsetX, textureOffsetY;
    if (!(typeof addedObjectExport.textureOffsetX == UNDEFINED)){
      textureOffsetX = addedObjectExport.textureOffsetX;
    }
    if (!(typeof addedObjectExport.textureOffsetY == UNDEFINED)){
      textureOffsetY = addedObjectExport.textureOffsetY;
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
          material.map = texturePack.diffuseTexture.clone();
          material.map.roygbivTexturePackName = texturePackName;
          material.map.roygbivTextureName = 0;
          if (!(typeof textureOffsetX == UNDEFINED)){
            material.map.offset.x = textureOffsetX;
          }
          if (!(typeof textureOffsetY == UNDEFINED)){
            material.map.offset.y = textureOffsetY;
          }
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.map.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.map.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.map.needsUpdate = true;
        }
      }
    }
    if (alphaRoygbivTexturePackName){
      if (alphaRoygbivTexturePackName == texturePackName){
        if (texturePack.hasAlpha){
          material.alphaMap = texturePack.alphaTexture.clone();
          material.alphaMap.roygbivTexturePackName = texturePackName;
          material.alphaMap.roygbivTextureName = 0;
          material.transparent = false;
          material.alphaTest = 0.5;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.alphaMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.alphaMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.alphaMap.needsUpdate = true;
        }
      }
    }
    if (aoRoygbivTexturePackName){
      if (aoRoygbivTexturePackName == texturePackName){
        if (texturePack.hasAO){
          material.aoMap = texturePack.aoTexture.clone();
          material.aoMap.roygbivTexturePackName = texturePackName;
          material.aoMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.aoMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.aoMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.aoMap.needsUpdate = true;
        }
      }
    }
    if (emissiveRoygbivTexturePackName){
      if (emissiveRoygbivTexturePackName == texturePackName){
        if (texturePack.hasEmissive){
          material.emissive = new THREE.Color(0xffffff);
          material.emissiveMap = texturePack.emissiveTexture.clone();
          material.emissiveMap.roygbivTexturePackName = texturePackName;
          material.emissiveMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.emissiveMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.emissiveMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.emissiveMap.needsUpdate = true;
        }
      }
    }
    if (normalRoygbivTexturePackName){
      if (normalRoygbivTexturePackName == texturePackName){
        if (texturePack.hasNormal){
          material.normalMap = texturePack.normalTexture.clone();
          material.normalMap.roygbivTexturePackName = texturePackName;
          material.normalMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.normalMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.normalMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.normalMap.needsUpdate = true;
        }
      }
    }
    if (specularRoygbivTexturePackName){
      if (specularRoygbivTexturePackName == texturePackName){
        if (texturePack.hasSpecular){
          material.specularMap = texturePack.specularTexture.clone();
          material.specularMap.roygbivTexturePackName = texturePackName;
          material.specularMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.specularMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.specularMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.specularMap.needsUpdate = true;
        }
      }
    }
    if (displacementRoygbivTexturePackName){
      if (displacementRoygbivTexturePackName == texturePackName){
        if (texturePack.hasHeight){
          material.displacementMap = texturePack.heightTexture.clone();
          material.displacementMap.roygbivTexturePackName = texturePackName;
          material.displacementMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.displacementMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.displacementMap.repeat.y = textureRepeatV;
          }
          if (!(typeof displacementScale == UNDEFINED)){
            material.displacementScale = displacementScale;
          }
          if (!(typeof displacementBias == UNDEFINED)){
            material.displacementBias = displacementBias;
          }
          material.needsUpdate = true;
          material.displacementMap.needsUpdate = true;
        }
      }
    }
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
    var material = addedObject.material;

    var addedObjectExport = exportObj.addedObjects[addedObjectName];
    if (!addedObjectExport){
      return;
    }
    var diffuseRoygbivTexturePackName;
    var alphaRoygbivTexturePackName;
    var aoRoygbivTexturePackName;
    var emissiveRoygbivTexturePackName;
    var normalRoygbivTexturePackName;
    var specularRoygbivTexturePackName;
    var displacementRoygbivTexturePackName;

    diffuseRoygbivTexturePackName = addedObjectExport["diffuseRoygbivTexturePackName"];
    alphaRoygbivTexturePackName = addedObjectExport["alphaRoygbivTexturePackName"];
    aoRoygbivTexturePackName = addedObjectExport["aoRoygbivTexturePackName"];
    emissiveRoygbivTexturePackName = addedObjectExport["emissiveRoygbivTexturePackName"];
    normalRoygbivTexturePackName = addedObjectExport["normalRoygbivTexturePackName"];
    specularRoygbivTexturePackName = addedObjectExport["specularRoygbivTexturePackName"];
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
          material.map = texturePack.diffuseTexture.clone();
          material.map.roygbivTexturePackName = texturePackName;
          material.map.roygbivTextureName = 0;
          if (!(typeof textureOffsetX == UNDEFINED)){
            material.map.offset.x = textureOffsetX;
          }
          if (!(typeof textureOffsetY == UNDEFINED)){
            material.map.offset.y = textureOffsetY;
          }
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.map.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.map.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.map.needsUpdate = true;
        }
      }
    }
    if (alphaRoygbivTexturePackName){
      if (alphaRoygbivTexturePackName == texturePackName){
        if (texturePack.hasAlpha){
          material.alphaMap = texturePack.alphaTexture.clone();
          material.alphaMap.roygbivTexturePackName = texturePackName;
          material.alphaMap.roygbivTextureName = 0;
          material.transparent = false;
          material.alphaTest = 0.5;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.alphaMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.alphaMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.alphaMap.needsUpdate = true;
        }
      }
    }
    if (aoRoygbivTexturePackName){
      if (aoRoygbivTexturePackName == texturePackName){
        if (texturePack.hasAO){
          material.aoMap = texturePack.aoTexture.clone();
          material.aoMap.roygbivTexturePackName = texturePackName;
          material.aoMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.aoMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.aoMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.aoMap.needsUpdate = true;
        }
      }
    }
    if (emissiveRoygbivTexturePackName){
      if (emissiveRoygbivTexturePackName == texturePackName){
        if (texturePack.hasEmissive){
          material.emissive = new THREE.Color(0xffffff);
          material.emissiveMap = texturePack.emissiveTexture.clone();
          material.emissiveMap.roygbivTexturePackName = texturePackName;
          material.emissiveMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.emissiveMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.emissiveMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.emissiveMap.needsUpdate = true;
        }
      }
    }
    if (normalRoygbivTexturePackName){
      if (normalRoygbivTexturePackName == texturePackName){
        if (texturePack.hasNormal){
          material.normalMap = texturePack.normalTexture.clone();
          material.normalMap.roygbivTexturePackName = texturePackName;
          material.normalMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.normalMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.normalMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.normalMap.needsUpdate = true;
        }
      }
    }
    if (specularRoygbivTexturePackName){
      if (specularRoygbivTexturePackName == texturePackName){
        if (texturePack.hasSpecular){
          material.specularMap = texturePack.specularTexture.clone();
          material.specularMap.roygbivTexturePackName = texturePackName;
          material.specularMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.specularMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.specularMap.repeat.y = textureRepeatV;
          }
          material.needsUpdate = true;
          material.specularMap.needsUpdate = true;
        }
      }
    }
    if (displacementRoygbivTexturePackName){
      if (displacementRoygbivTexturePackName == texturePackName){
        if (texturePack.hasHeight){
          material.displacementMap = texturePack.heightTexture.clone();
          material.displacementMap.roygbivTexturePackName = texturePackName;
          material.displacementMap.roygbivTextureName = 0;
          if (!(typeof textureRepeatU == UNDEFINED)){
            material.displacementMap.repeat.x = textureRepeatU;
          }
          if (!(typeof textureRepeatV == UNDEFINED)){
            material.displacementMap.repeat.y = textureRepeatV;
          }
          if (!(typeof displacementScale == UNDEFINED)){
            material.displacementScale = displacementScale;
          }
          if (!(typeof displacementBias == UNDEFINED)){
            material.displacementBias = displacementBias;
          }
          material.needsUpdate = true;
          material.displacementMap.needsUpdate = true;
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
  if (!this.isUndo){
    undoRedoHandler.push();
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
    var material = addedObjects[addedObjectName].material;
    var metaData = addedObjects[addedObjectName].metaData;

    var diffuseRoygbivTextureName = curAddedObjectExport.diffuseRoygbivTextureName;
    var alphaRoygbivTextureName = curAddedObjectExport.alphaRoygbivTextureName;
    var aoRoygbivTextureName = curAddedObjectExport.aoRoygbivTextureName;
    var emissiveRoygbivTextureName = curAddedObjectExport.emissiveRoygbivTextureName;
    var normalRoygbivTextureName = curAddedObjectExport.normalRoygbivTextureName;
    var specularRoygbivTextureName = curAddedObjectExport.specularRoygbivTextureName;
    var displacementRoygbivTextureName = curAddedObjectExport.displacementRoygbivTextureName;
    var displacementScale = curAddedObjectExport.displacementScale;
    var displacementBias = curAddedObjectExport.displacementBias;


    if (diffuseRoygbivTextureName){
      if (textureName == diffuseRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];
        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
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

        material.map = cloneTexture;
        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (alphaRoygbivTextureName){
      if (textureName == alphaRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        material.alphaMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.transparent = true;
        material.alphaTest = 0.5;
        material.needsUpdate = true;
      }
    }
    if (aoRoygbivTextureName){
      if (textureName == aoRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.aoMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (emissiveRoygbivTextureName){
      if (textureName == emissiveRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        material.emissive = new THREE.Color( 0xffffff );
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.emissiveMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (normalRoygbivTextureName){
      if (textureName == normalRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];
        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.normalMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (specularRoygbivTextureName){
      if (textureName == specularRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;
        material.specularMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
    if (displacementRoygbivTextureName){
      if (textureName == displacementRoygbivTextureName){
        var repeatU = curAddedObjectExport["textureRepeatU"];
        var repeatV = curAddedObjectExport["textureRepeatV"];

        var cloneTexture = texture.clone();
        cloneTexture.fromUploadedImage = texture.fromUploadedImage;
        cloneTexture.roygbivTextureName = textureName;
        cloneTexture.roygbivTexturePackName = 0;

        if (!(typeof displacementScale == UNDEFINED)){
          material.displacementScale = displacementScale;
        }
        if (!(typeof displacementBias == UNDEFINED)){
          material.displacementBias = displacementBias;
        }

        material.displacementMap = cloneTexture;

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

        cloneTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }
  }
  for (var objectGroupName in objectGroups){
    var group = objectGroups[objectGroupName].group;
    for (var objectName in group){
      delete addedObjects[objectName];
    }
  }
  if (!this.hasTexturePacks && !this.isUndo){
    undoRedoHandler.push();
  }
}

StateLoader.prototype.resetProject = function(undo){

  for (var gridSystemName in gridSystems){
    gridSystems[gridSystemName].destroy();
  }
  for (var addedObjectName in addedObjects){
    addedObjects[addedObjectName].destroy();
  }

  for (var grouppedObjectName in objectGroups){
    objectGroups[grouppedObjectName].destroy();
  }

  for (var lightName in lights){
    scene.remove(lights[lightName]);
  }

  for (var lightName in light_previewScene){
    previewScene.remove(light_previewScene[lightName]);
  }

  for (var lightName in pointLightRepresentations){
    scene.remove(pointLightRepresentations[lightName]);
  }

  if (skyboxMesh){
    scene.remove(skyboxMesh);
  }
  if (skyboxPreviewMesh){
    previewScene.remove(skyboxPreviewMesh);
  }

  if (!undo){
    collisionCallbackRequests = new Object();
    particleCollisionCallbackRequests = new Object();
    for (var particleSystemName in particleSystems){
      particleSystems[particleSystemName].destroy();
    }
    particleSystems = new Object();
    particleSystemPool = new Object();
    particleSystemPools = new Object();
  }

  for (var markedPointName in markedPoints){
    markedPoints[markedPointName].destroy();
  }

  if (!undo){
    undoRedoHandler = new UndoRedoHandler();
  }
  keyboardBuffer = new Object();
  gridSystems = new Object();
  gridSelections = new Object();
  materials = new Object();
  addedObjects = new Object();
  textures = new Object();
  textureURLs = new Object();
  physicsTests = new Object();
  wallCollections = new Object();
  uploadedImages = new Object();
  modifiedTextures = new Object();
  lights = new Object();
  light_previewScene = new Object();
  pointLightRepresentations = new Object();
  texturePacks = new Object();
  skyBoxes = new Object();
  scripts = new Object();
  objectGroups = new Object();
  disabledObjectNames = new Object();
  markedPoints = new Object();
  anchorGrid = 0;

  // FOG
  fogActive = false;
  fogColor = "black";
  fogDensity = 0;
  fogColorRGB = new THREE.Color(fogColor);

  if (!undo){
    mode = 0; // 0 -> DESIGN, 1-> PREVIEW
    this.oldPhysicsDebugMode = "NONE";
  }else{
    this.oldPhysicsDebugMode = physicsDebugMode;
  }
  physicsDebugMode = false;
  selectedAddedObject = 0;
  selectedObjectGroup = 0;
  selectedLightName = 0;
  skyboxVisible = false;
  croppedGridSystemBuffer = 0;

  scriptEditorShowing = false;
  objectSelectedByCommand = false;

  physicsWorld = new CANNON.World();
  physicsSolver = new CANNON.GSSolver();
  initPhysics();

  // PHYSICS DEBUG MODE
  var objectsToRemove = [];
  var children = previewScene.children;
  for (var i = 0; i<children.length; i++){
    var child = children[i];
    if (child.forDebugPurposes){
      objectsToRemove.push(child);
    }
  }
  for (var i = 0; i<objectsToRemove.length; i++){
    previewScene.remove(objectsToRemove[i]);
  }

  if (!undo){
    diffuseTextureCache = new Object();
    heightTextureCache = new Object();
    ambientOcculsionTextureCache = new Object();
    normalTextureCache = new Object();
    specularTextureCache = new Object();
    alphaTextureCache = new Object();
    emissiveTextureCache = new Object();
    skyboxCache = new Object();
  }

  initBadTV();
  $(datGui.domElement).attr("hidden", true);
  $(datGuiObjectManipulation.domElement).attr("hidden", true);
  $("#cliDivheader").text("ROYGBIV Scene Creator - CLI (Design mode)");

  LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
  BIN_SIZE = 50;

  previewSceneRendered = false;

}
