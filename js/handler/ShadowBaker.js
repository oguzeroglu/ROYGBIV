var ShadowBaker = function(){
  this.bakeSize = 256;
  this.sizePerObject = 128;
  this.reset();
}

ShadowBaker.prototype.export = function(isBuildingForDeploymentMode){
  var exportObj = {
    intensity: this.intensity,
    textureRangesByObjectName: JSON.parse(JSON.stringify(this.textureRangesByObjectName)),
    blurAmount: this.blurAmount,
    dataURLsByTextureID: {},
    textureIDsByObjName: {},
    lazyLoad: !!this.lazyLoad
  };

  if (!isBuildingForDeploymentMode){
    for (var dataURL in this.canvasTexturesByDataURL){
      exportObj.dataURLsByTextureID[generateUUID()] = dataURL;
    }

    for (var objName in this.texturesByObjName){
      var dataURL = this.texturesByObjName[objName].image.toDataURL();
      for (var textureID in exportObj.dataURLsByTextureID){
        if (exportObj.dataURLsByTextureID[textureID] == dataURL){
          exportObj.textureIDsByObjName[objName] = textureID;
          break;
        }
      }
    }
  }else{
    delete exportObj.dataURLsByTextureID;
    delete exportObj.textureIDsByObjName;
  }

  return exportObj;
}

ShadowBaker.prototype.import = function(exportObj, onReady){
  this.reset();
  this.intensity = exportObj.intensity;
  this.blurAmount = exportObj.blurAmount;
  this.lazyLoad = exportObj.lazyLoad;

  if (Object.keys(exportObj.textureRangesByObjectName).length == 0){
    return;
  }

  this.textureRangesByObjectName = JSON.parse(JSON.stringify(exportObj.textureRangesByObjectName));
  if (isDeployment){

    for (var objName in this.textureRangesByObjectName){
      this.texturesByObjName[objName] = true;
    }

    var textureMerger = new TextureMerger();
    textureMerger.ranges = JSON.parse(JSON.stringify(this.textureRangesByObjectName));
    var atlas = new TexturePack(null, null, {isShadowAtlas: true});

    if (!this.lazyLoad){
      atlas.loadTextures(false, function(){
        var shadowMapUniform = new THREE.Uniform(atlas.diffuseTexture);
        shadowBaker.shadowMapUniform = shadowMapUniform;
        for (var objName in shadowBaker.textureRangesByObjectName){
          var obj = addedObjects[objName];

          if (obj.fromObjectGroup){
            continue;
          }

          if (isDeployment && !isWebGLFriendly && obj.skipShadowsInNonWebGLFriendlyDevices){
            continue;
          }

          var material = obj.mesh.material;
          var uniforms = material.uniforms;

          var range = textureMerger.ranges[objName];

          uniforms.shadowMap = shadowMapUniform;
          macroHandler.injectMacro("HAS_SHADOW_MAP", material, true, true);
          macroHandler.injectMacro("SHADOW_INTENSITY " + shadowBaker.intensity, material, false, true);
          macroHandler.injectMacro("SHADOW_MAP_START_U " + range.startU, material, false, true);
          macroHandler.injectMacro("SHADOW_MAP_START_V " + range.startV, material, false, true);
          macroHandler.injectMacro("SHADOW_MAP_END_U " + range.endU, material, false, true);
          macroHandler.injectMacro("SHADOW_MAP_END_V " + range.endV, material, false, true);
          material.uniformsNeedUpdate = true;
        }

        onReady();
      });
    }else{
      var shadowMapUniform = new THREE.Uniform(DUMMY_TEXTURE);

      atlas.loadTextures(false, function(){
        shadowMapUniform.value = atlas.diffuseTexture;
      });

      shadowBaker.shadowMapUniform = shadowMapUniform;
      for (var objName in shadowBaker.textureRangesByObjectName){
        var obj = addedObjects[objName];

        if (obj.fromObjectGroup){
          continue;
        }

        if (isDeployment && !isWebGLFriendly && obj.skipShadowsInNonWebGLFriendlyDevices){
          continue;
        }

        var material = obj.mesh.material;
        var uniforms = material.uniforms;

        var range = textureMerger.ranges[objName];

        uniforms.shadowMap = shadowMapUniform;
        macroHandler.injectMacro("HAS_SHADOW_MAP", material, true, true);
        macroHandler.injectMacro("SHADOW_INTENSITY " + shadowBaker.intensity, material, false, true);
        macroHandler.injectMacro("SHADOW_MAP_START_U " + range.startU, material, false, true);
        macroHandler.injectMacro("SHADOW_MAP_START_V " + range.startV, material, false, true);
        macroHandler.injectMacro("SHADOW_MAP_END_U " + range.endU, material, false, true);
        macroHandler.injectMacro("SHADOW_MAP_END_V " + range.endV, material, false, true);
        material.uniformsNeedUpdate = true;
      }

      onReady();
    }

    return;
  }

  var curCount = 0;
  var totalCount = Object.keys(exportObj.dataURLsByTextureID).length;

  for (var tid in exportObj.dataURLsByTextureID){
    var dataURL = exportObj.dataURLsByTextureID[tid];
    var tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = this.sizePerObject;
    tmpCanvas.height = tmpCanvas.width;
    var tmpContext = tmpCanvas.getContext("2d");
    var img = new Image();
    img.onload = function(){
      this.ctx.drawImage(this.img, 0, 0);
      shadowBaker.canvasTexturesByDataURL[this.dataURL] = new THREE.CanvasTexture(this.canvas);
      curCount ++;
      if (curCount == totalCount){
        for (var objName in exportObj.textureIDsByObjName){
          var textureID = exportObj.textureIDsByObjName[objName];
          var dataURL = exportObj.dataURLsByTextureID[textureID];
          var canvasTexture = shadowBaker.canvasTexturesByDataURL[dataURL];
          shadowBaker.texturesByObjName[objName] = canvasTexture;
        }

        shadowBaker.refreshTextures(onReady, function(){
          throw new Error("Error happened refreshing shadow textures.");
        });
      }
    }.bind({ctx: tmpContext, img: img, canvas: tmpCanvas, dataURL: dataURL})
    img.src = dataURL;
  }
}

ShadowBaker.prototype.reset = function(){
  this.canvasTexturesByDataURL = {};
  this.texturesByObjName = {};
  this.textureRangesByObjectName = {};
  this.intensity = 0.5;
  this.blurAmount = null;
  this.lazyLoad = false;
}

ShadowBaker.prototype.getBakingCanvas = function(){
  var shadowCanvas = document.createElement("canvas");

  var size = this.bakeSize;
  shadowCanvas.width = size;
  shadowCanvas.height = size;

  return shadowCanvas;
}

ShadowBaker.prototype.batchUnbake = function(objAry){
  terminal.clear();
  terminal.disable();
  terminal.printInfo(Text.UNBAKING_SHADOW);

  for (var i = 0 ; i < objAry.length; i ++){
    shadowBaker.unbakeShadow(objAry[i], true);
  }

  shadowBaker.refreshTextures(function(){
    terminal.enable();
    terminal.clear();
    terminal.printInfo(Text.SHADOW_UNBAKED);
  }, function(){
    terminal.enable();
    terminal.clear();
    terminal.printError(Text.ERROR_HAPPENED_BAKING_SHADOW);
  });
}

ShadowBaker.prototype.onAfterShadowBaked = function(){
  BIN_SIZE = this.oldBinSize;
  RAYCASTER_STEP_AMOUNT = this.oldRaycasterStep;
  RAYCASTER_WORKER_ON = this.oldRaycasterWorkerStatus;
  raycasterFactory.refresh();
  rayCaster = raycasterFactory.get();
  this.isBakingShadow = false;
  if (RAYCASTER_WORKER_ON){
    rayCaster.onReadyCallback = function(){
      terminal.printInfo(Text.SHADOW_BAKED);
      rayCaster.onReadyCallback = noop;

      terminal.printInfo(Text.REFRESHING_SHADOW_MAPS);
      shadowBaker.refreshTextures(function(){
        terminal.enable();
      },function(){
        terminal.enable();
        terminal.printError(Text.ERROR_HAPPENED_REFRESINH_SHADOW_MAPS);
      });
    }
  }else{
    rayCaster.onReadyCallback = noop;
    terminal.printInfo(Text.SHADOW_BAKED);

    terminal.printInfo(Text.REFRESHING_SHADOW_MAPS);
    shadowBaker.refreshTextures(function(){
      terminal.enable();
    },function(){
      terminal.enable();
      terminal.printError(Text.ERROR_HAPPENED_REFRESINH_SHADOW_MAPS);
    });
  }
}

ShadowBaker.prototype.onMessageReceived = function(data){
  var payload = data.payload;
  terminal.printInfo(Text.SHADOW_BAKE_DONE.replace(Text.PARAM1, performance.now() - this.startTime), true);

  var shadowCanvas = this.intermediateCanvasesByObjName[payload.objName];
  var ctx = shadowCanvas.getContext("2d");

  delete this.intermediateCanvasesByObjName[payload.objName];

  var imageData = ctx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
  imageData.data.set(new Uint8ClampedArray(payload.pixels));

  ctx.putImageData(imageData, 0, 0);

  var scaleCanvas = document.createElement("canvas");
  scaleCanvas.width = this.sizePerObject;
  scaleCanvas.height = this.sizePerObject;
  var scaleCtx = scaleCanvas.getContext("2d");
  scaleCtx.drawImage(shadowCanvas, 0, 0, this.bakeSize, this.bakeSize, 0, 0, this.sizePerObject, this.sizePerObject);

  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = this.sizePerObject;
  tmpCanvas.height = this.sizePerObject;
  var tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.clearRect(0, 0, this.sizePerObject, this.sizePerObject);
  tmpCtx.translate(this.sizePerObject / 2, this.sizePerObject / 2);
  tmpCtx.rotate(-Math.PI/2);
  tmpCtx.drawImage(scaleCanvas, -this.sizePerObject / 2, -this.sizePerObject / 2);

  var dataURL = tmpCanvas.toDataURL();
  var canvasTexture = this.canvasTexturesByDataURL[dataURL];

  if (!canvasTexture){
    canvasTexture = new THREE.CanvasTexture(tmpCanvas);
    this.canvasTexturesByDataURL[dataURL] = canvasTexture;
  }

  this.texturesByObjName[payload.objName] = canvasTexture;

  this.bakeShadow();
}

ShadowBaker.prototype.bakeShadow = function(){
  if (this.ctr == this.objAry.length){
    this.onAfterShadowBaked();
    return;
  }

  var obj = this.objAry[this.ctr ++];
  var indicatorText = (this.ctr) + "/" + this.objAry.length;
  terminal.printInfo(Text.BAKING_SHADOW_FOR.replace(Text.PARAM1, obj.name).replace(Text.PARAM2, indicatorText), true);

  if (!this.isSupported(obj)){
    terminal.printError(Text.TYPE_NOT_SUPPORTED, true);
    this.bakeShadow();
    return;
  }

  if (!(typeof obj.softCopyParentName == UNDEFINED) && !obj.parentObjectName){
    terminal.printError(Text.CANNOT_BAKE_SHADOW_ON_SOFT_COPIES, true);
    this.bakeShadow();
    return;
  }

  if (obj.parentObjectName){
    objectGroups[obj.parentObjectName].hasShadowMap = true;
  }

  this.startTime = performance.now();

  var payload = this.generateWorkerPayloadForSurface(obj, this.lightInfo);

  rayCaster.worker.postMessage({
    isBakeShadow: true,
    payload: payload
  }, [payload.pixels]);
}

ShadowBaker.prototype.batchBake = function(objAry, lightInfo){
  this.isBakingShadow = true;

  terminal.disable();
  terminal.printInfo(Text.BAKING_SHADOW, true);

  var objAryExpanded = [];
  for (var i = 0; i < objAry.length; i ++){
    if (objAry[i].isObjectGroup){
      for (var childName in objAry[i].group){
        objAryExpanded.push(objAry[i].group[childName]);
      }
    }else{
      objAryExpanded.push(objAry[i]);
    }
  }

  this.lightInfo = lightInfo;
  this.objAry = objAryExpanded;
  this.ctr = 0;

  this.oldBinSize = BIN_SIZE;
  this.oldRaycasterStep = RAYCASTER_STEP_AMOUNT;
  this.oldRaycasterWorkerStatus = RAYCASTER_WORKER_ON;

  RAYCASTER_WORKER_ON = true;
  BIN_SIZE = 20;
  RAYCASTER_STEP_AMOUNT = 10;

  this.intermediateCanvasesByObjName = {};

  raycasterFactory.refresh();
  rayCaster = raycasterFactory.get();
  rayCaster.onReadyCallback = function(){
    shadowBaker.bakeShadow(lightInfo);
  };
}

ShadowBaker.prototype.unbakeShadow = function(obj, skipRefresh){
  delete this.texturesByObjName[obj.name];
  delete this.textureRangesByObjectName[obj.name];

  this.unbakeFromShader(obj.mesh.material);

  if (obj.isObjectGroup){
    for (var childName in obj.group){
      this.unbakeShadow(obj.group[childName], skipRefresh);
    }
    obj.mesh.geometry.removeAttribute("shadowMapUV");
  }

  for (var dataURL in this.canvasTexturesByDataURL){
    var canvasTexture = this.canvasTexturesByDataURL[dataURL];
    var isUsed = false;
    for (var objName in this.texturesByObjName){
      if (this.texturesByObjName[objName] == canvasTexture){
        isUsed = true;
        break;
      }
    }

    if (!isUsed){
      delete this.canvasTexturesByDataURL[dataURL];
    }
  }

  if (!skipRefresh){
    this.refreshTextures(function(){
      terminal.enable();
      terminal.clear();
      terminal.printInfo(Text.SHADOW_UNBAKED);
    }, function(){
      terminal.enable();
      terminal.clear();
      terminal.printError(Text.ERROR_HAPPENED_BAKING_SHADOW);
    });
  }
}

ShadowBaker.prototype.unbakeFromShader = function(material){
  var uniforms = material.uniforms;
  if (!uniforms.shadowMap){
    return;
  }

  delete uniforms.shadowMap;
  var shadowIntensityMacroVal = macroHandler.getMacroValue("SHADOW_INTENSITY", material, false);
  var shadowMapStartUVal = macroHandler.getMacroValue("SHADOW_MAP_START_U", material, false);
  var shadowMapStartVVal = macroHandler.getMacroValue("SHADOW_MAP_START_V", material, false);
  var shadowMapEndUVal = macroHandler.getMacroValue("SHADOW_MAP_END_U", material, false);
  var shadowMapEndVVal = macroHandler.getMacroValue("SHADOW_MAP_END_V", material, false);
  macroHandler.removeMacro("HAS_SHADOW_MAP", material, true, true);
  macroHandler.removeMacro("SHADOW_INTENSITY " + shadowIntensityMacroVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_START_U " + shadowMapStartUVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_END_U " + shadowMapEndUVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_START_V " + shadowMapStartVVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_END_V " + shadowMapEndVVal, material, false, true);

  material.uniformsNeedUpdate = true;
}

ShadowBaker.prototype.refreshTextures = function(onSuccess, onErr){
  if (Object.keys(this.texturesByObjName).length == 0){
    onSuccess();
    return;
  }

  var textureMerger;
  if (this.blurAmount == null){
    textureMerger = new TextureMerger(this.texturesByObjName);
  }else{
    var blurredTexturesByObjName = {};
    for (var objName in this.texturesByObjName){
      var textureCanvas = this.texturesByObjName[objName].image;
      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = textureCanvas.width;
      tmpCanvas.height = textureCanvas.height;
      var tmpContext = tmpCanvas.getContext("2d");
      tmpContext.filter = "blur(@@1px)".replace("@@1", this.blurAmount);
      tmpContext.drawImage(textureCanvas, 0, 0);
      blurredTexturesByObjName[objName] = new THREE.CanvasTexture(tmpCanvas);
    }

    textureMerger = new TextureMerger(blurredTexturesByObjName);
  }


  this.textureRangesByObjectName = {};
  var texturesByObjName = this.texturesByObjName;
  this.compressTexture(textureMerger.mergedTexture.image.toDataURL(), function(atlas){
    var shadowMapUniform = new THREE.Uniform(atlas.diffuseTexture);

    shadowBaker.shadowMapUniform = shadowMapUniform;

    for (var objName in texturesByObjName){
      var obj = addedObjects[objName];
      if (!obj){
        for (var objGroupName in objectGroups){
          obj = objectGroups[objGroupName].group[objName];
          if (obj){
            break;
          }
        }
      }

      var material = obj.mesh.material;
      var uniforms = material.uniforms;
      shadowBaker.unbakeFromShader(material);

      var range = textureMerger.ranges[objName];
      shadowBaker.textureRangesByObjectName[objName] = range;

      uniforms.shadowMap = shadowMapUniform;
      macroHandler.injectMacro("HAS_SHADOW_MAP", material, true, true);
      macroHandler.injectMacro("SHADOW_INTENSITY " + shadowBaker.intensity, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_START_U " + range.startU, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_START_V " + range.startV, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_END_U " + range.endU, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_END_V " + range.endV, material, false, true);
      material.uniformsNeedUpdate = true;
    }

    for (var objName in objectGroups){
      var objectGroup = objectGroups[objName];
      if (!objectGroup.hasShadowMap){
        continue;
      }

      shadowBaker.unbakeFromShader(objectGroup.mesh.material);
      macroHandler.injectMacro("HAS_SHADOW_MAP", objectGroup.mesh.material, true, true);
      macroHandler.injectMacro("SHADOW_INTENSITY " + shadowBaker.intensity, objectGroup.mesh.material, false, true);

      if (!objectGroup.isInstanced){
        objectGroup.mesh.geometry.removeAttribute("shadowMapUV");
        var ary = [];

        for (var i = 0; i < objectGroup.faceNames.length; i ++){
          var childName = objectGroup.faceNames[i];
          var range = shadowBaker.textureRangesByObjectName[childName] || {startU: -100, startV: -100, endU: -100, endV: -100};
          for (var i2 = 0; i2 < 3; i2 ++){
            ary.push(range.startU);
            ary.push(range.startV);
            ary.push(range.endU);
            ary.push(range.endV);
          }
        }

        var shadowMapUVsAry = new Float32Array(ary);
        var shadowMapUVsBufferAttribute = new THREE.BufferAttribute(shadowMapUVsAry, 4);
        shadowMapUVsBufferAttribute.setDynamic(false);
        objectGroup.mesh.geometry.addAttribute("shadowMapUV", shadowMapUVsBufferAttribute);
      }else{
        objectGroup.mesh.geometry.removeAttribute("shadowMapUV");
        var ary = [];
        var index = 0;
        for (var childName in objectGroup.group){
          var range = shadowBaker.textureRangesByObjectName[childName] || {startU: -100, startV: -100, endU: -100, endV: -100};
          ary.push(range.startU);
          ary.push(range.startV);
          ary.push(range.endU);
          ary.push(range.endV);
        }

        var shadowUVsBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(ary), 4);
        shadowUVsBufferAttribute.setDynamic(false);
        objectGroup.geometry.addAttribute("shadowMapUV", shadowUVsBufferAttribute);
      }

      objectGroup.mesh.material.uniforms.shadowMap = shadowMapUniform;
      objectGroup.mesh.material.uniformsNeedUpdate = true;
    }

    onSuccess();
  }, function(){
    onErr();
  });
}

ShadowBaker.prototype.isSupported = function(obj){
  if (obj.isAddedObject && (obj.type == "surface" || obj.type == "ramp")){
    return true;
  }

  if (obj.isObjectGroup){
    return true;
  }

  return false;
}

ShadowBaker.prototype.generateWorkerPayloadForSurface = function(obj, lightInfo){

  var payload = {
    objName: obj.name,
    parentName: obj.parentObjectName,
    intersectionTests: []
  };

  var uvs = obj.mesh.geometry.attributes.uv.array;
  var positions = obj.mesh.geometry.attributes.position.array;
  var uvsConstructed = [];
  var positionsConstructed = [];
  var firstIndex = 0;
  var lastIndex = 0;

  for (var i = 0; i < uvs.length; i += 2){
    var uv = new THREE.Vector2(uvs[i], uvs[i + 1]);
    uvsConstructed.push(uv);

    if (uv.x == 0 && uv.y == 0){
      firstIndex = uvsConstructed.length - 1;
    }
    if (uv.x == 1 && uv.y == 1){
      lastIndex = uvsConstructed.length - 1;
    }
  }

  for (var i = 0; i < positions.length; i += 3){
    var position = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    positionsConstructed.push(position);
  }

  var childMesh;
  if (obj.parentObjectName){
    var parentObject = objectGroups[obj.parentObjectName];
    parentObject.graphicsGroup.position.copy(parentObject.mesh.position);
    parentObject.graphicsGroup.quaternion.copy(parentObject.mesh.quaternion);
    parentObject.graphicsGroup.updateMatrix();
    parentObject.graphicsGroup.updateMatrixWorld(true);
    childMesh = parentObject.graphicsGroup.children[obj.indexInParent];
    childMesh.updateMatrixWorld(true);
  }else{
    obj.mesh.updateMatrixWorld(true);
  }

  var firstLocal = positionsConstructed[firstIndex].clone();
  var lastLocal = positionsConstructed[lastIndex].clone();

  var shadowCanvas = this.getBakingCanvas();
  var ctx = shadowCanvas.getContext('2d');
  ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  var imageData = ctx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
  payload.pixels = imageData.data.buffer;

  this.intermediateCanvasesByObjName[obj.name] = shadowCanvas;

  var lightPos;
  var lightDirNegative;
  var objPos = obj.mesh.position;
  if (lightInfo.type == "point"){
    var light = lightHandler.staticPointLightsBySlotId[lightInfo.slotID];
    lightPos = new THREE.Vector3(light.positionX, light.positionY, light.positionZ);
    payload.isPointLight = true;
    payload.lightPosX = light.positionX;
    payload.lightPosY = light.positionY;
    payload.lightPosZ = light.positionZ;
  }else{
    var light = lightHandler.staticDiffuseLightsBySlotId[lightInfo.slotID];
    lightDirNegative = new THREE.Vector3(light.directionX, light.directionY, light.directionZ).negate().normalize();
  }

  for (var i1 = 0; i1 < 1; i1 += 1 / shadowCanvas.width){
    for (var i2 = 0; i2 < 1; i2 += 1 / shadowCanvas.height){
      var curLocalX = firstLocal.clone().lerp(lastLocal, i1).x;
      var curLocalY = firstLocal.clone().lerp(lastLocal, i2).y;

      var matrixWorld = obj.mesh.matrixWorld;
      if (childMesh){
        matrixWorld = childMesh.matrixWorld;
      }
      var curWorldPosition = new THREE.Vector3(curLocalX, curLocalY, 0).applyMatrix4(matrixWorld);

      var curX = curWorldPosition.x;
      var curY = curWorldPosition.y;
      var curZ = curWorldPosition.z;

      if (lightInfo.type == "point"){
        var fromVector = curWorldPosition;
        var toLight = new THREE.Vector3(lightPos.x - curX, lightPos.y - curY, lightPos.z - curZ);
        var distanceToLight = toLight.length();
        var directionVector = toLight.normalize();

        payload.intersectionTests.push({
          from: fromVector.clone(),
          dir: directionVector.clone(),
          distanceToLight: distanceToLight,
          curX: curX,
          curY: curY,
          curZ: curZ
        });
      }else{
        payload.intersectionTests.push({
          from: new THREE.Vector3(curX, curY, curZ),
          dir: lightDirNegative.clone()
        });
      }
    }
  }

  return payload;
}

ShadowBaker.prototype.compressTexture = function(base64Data, readyCallback, errorCallback){
  var postRequest = new XMLHttpRequest();
  var data = JSON.stringify({image: base64Data});
  postRequest.open("POST", "/compressShadowAtlas", true);
  postRequest.setRequestHeader('Content-Type', 'application/json');
  postRequest.onreadystatechange = function(err){
    if (postRequest.readyState == 4 && postRequest.status == 200){
      var resp = JSON.parse(postRequest.responseText);
      if (resp.error){
        errorCallback();
      }else{
        var atlas = new TexturePack(null, null, {isShadowAtlas: true});
        atlas.loadTextures(false, function(){
          readyCallback(atlas);
        });
      }
    }
  }
  postRequest.onerror = function(){
    errorCallback();
  }
  postRequest.send(data);
}

ShadowBaker.prototype.updateIntensity = function(newIntensity){
  this.intensity = newIntensity;

  for (var objName in this.texturesByObjName){
    var obj = addedObjects[objName];
    if (!obj){
      for (var objGroupName in objectGroups){
        obj = objectGroups[objGroupName].group[objName];
        if (obj){
          break;
        }
      }
    }

    var material = obj.mesh.material;
    var shadowIntensityMacroVal = macroHandler.getMacroValue("SHADOW_INTENSITY", material, false);
    macroHandler.removeMacro("SHADOW_INTENSITY " + shadowIntensityMacroVal, material, false, true);
    macroHandler.injectMacro("SHADOW_INTENSITY " + newIntensity, material, false, true);
    material.needsUpdate = true;
  }

  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (!obj.hasShadowMap){
      continue;
    }

    var material = obj.mesh.material;
    var shadowIntensityMacroVal = macroHandler.getMacroValue("SHADOW_INTENSITY", material, false);
    macroHandler.removeMacro("SHADOW_INTENSITY " + shadowIntensityMacroVal, material, false, true);
    macroHandler.injectMacro("SHADOW_INTENSITY " + newIntensity, material, false, true);
    material.needsUpdate = true;
  }
}
