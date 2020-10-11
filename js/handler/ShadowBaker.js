var ShadowBaker = function(){
  this.qualities = {
    "HIGH": "HIGH",
    "MEDIUM": "MEDIUM",
    "LOW": "LOW",
    "LOWER": "LOWER",
    "LOWEST": "LOWEST"
  };

  this.reset();
}

ShadowBaker.prototype.reset = function(){
  this.texturesByObjName = {};
  this.shadowIntensitiesByObjName = {};
  this.textureSizesByObjName = {};
}

ShadowBaker.prototype.getSizeFromQuality = function(quality){
  if (quality == this.qualities.HIGH){
    return 512;
  }else if (quality == this.qualities.MEDIUM){
    return 256;
  }else if (quality == this.qualities.LOW){
    return 128;
  }else if (quality == this.qualities.LOWER){
    return 64;
  }else if (quality == this.qualities.LOWEST){
    return 32;
  }
}

ShadowBaker.prototype.getCanvasFromQuality = function(quality){
  var shadowCanvas = document.createElement("canvas");

  var size = this.getSizeFromQuality(quality);
  shadowCanvas.width = size;
  shadowCanvas.height = size;

  return shadowCanvas;
}

ShadowBaker.prototype.bakeShadow = function(obj, lightInfo, shadowIntensity, quality){
  terminal.clear();
  terminal.disable();
  if (!this.isSupported(obj)){
    terminal.printError(Text.OBJECT_TYPE_NOT_SUPPORTED_FOR_SHADOW_BAKING);
    return false;
  }

  terminal.printInfo(Text.BAKING_SHADOW);

  var oldBinSize = BIN_SIZE;
  var oldRaycasterStep = RAYCASTER_STEP_AMOUNT;

  BIN_SIZE = 20;
  RAYCASTER_STEP_AMOUNT = 10;

  this.rayCaster = new RayCaster();
  this.rayCaster.refresh();

  if (obj.isAddedObject && (obj.type == "surface" || obj.type == "ramp")){
    this.bakeSurfaceShadow(obj, lightInfo, shadowIntensity, quality);
  }

  BIN_SIZE = oldBinSize;
  RAYCASTER_STEP_AMOUNT = oldRaycasterStep;

  delete this.rayCaster;

  this.refreshTextures(function(){
    terminal.enable();
    terminal.clear();
    terminal.printInfo(Text.SHADOW_BAKED);
  }, function(){
    terminal.enable();
    terminal.clear();
    terminal.printError(Text.ERROR_HAPPENED_BAKING_SHADOW);
  });
}

ShadowBaker.prototype.unbakeShadow = function(obj){
  delete this.texturesByObjName[obj.name];
  delete this.shadowIntensitiesByObjName[obj.name];
  delete this.textureSizesByObjName[obj.name];
  this.unbakeFromShader(obj.mesh.material);

  terminal.clear();
  terminal.disable();
  terminal.printInfo(Text.UNBAKING_SHADOW);

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
  var shadowMapSizeVal = macroHandler.getMacroValue("SHADOW_MAP_SIZE", material, false);
  macroHandler.removeMacro("HAS_SHADOW_MAP", material, true, true);
  macroHandler.removeMacro("SHADOW_INTENSITY " + shadowIntensityMacroVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_START_U " + shadowMapStartUVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_END_U " + shadowMapEndUVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_START_V " + shadowMapStartVVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_END_V " + shadowMapEndVVal, material, false, true);
  macroHandler.removeMacro("SHADOW_MAP_SIZE " + shadowMapSizeVal, material, false, true);

  material.uniformsNeedUpdate = true;
}

ShadowBaker.prototype.refreshTextures = function(onSuccess, onErr){
  if (Object.keys(this.texturesByObjName).length == 0){
    onSuccess();
    return;
  }
  var textureMerger = new TextureMerger(this.texturesByObjName);
  var texturesByObjName = this.texturesByObjName;
  var shadowIntensitiesByObjName = this.shadowIntensitiesByObjName;
  var textureSizesByObjName = this.textureSizesByObjName;
  this.compressTexture(textureMerger.mergedTexture.image.toDataURL(), function(atlas){
    var shadowMapUniform = new THREE.Uniform(atlas.diffuseTexture);

    for (var objName in texturesByObjName){
      var obj = addedObjects[objName];
      var material = obj.mesh.material;
      var uniforms = material.uniforms;
      shadowBaker.unbakeFromShader(material);
      var range = textureMerger.ranges[objName];
      uniforms.shadowMap = shadowMapUniform;
      macroHandler.injectMacro("HAS_SHADOW_MAP", material, true, true);
      macroHandler.injectMacro("SHADOW_INTENSITY " + shadowIntensitiesByObjName[objName], material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_START_U " + range.startU, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_START_V " + range.startV, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_END_U " + range.endU, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_END_V " + range.endV, material, false, true);
      macroHandler.injectMacro("SHADOW_MAP_SIZE " + textureSizesByObjName[objName], material, false, true);
      material.uniformsNeedUpdate = true;
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

  return false;
}

ShadowBaker.prototype.bakeSurfaceShadow = function(obj, lightInfo, shadowIntensity, quality){
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

  obj.mesh.updateMatrixWorld(true);

  var firstLocal = positionsConstructed[firstIndex].clone();
  var lastLocal = positionsConstructed[lastIndex].clone();

  var shadowCanvas = this.getCanvasFromQuality(quality);
  var ctx = shadowCanvas.getContext('2d');
  ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  var imageData = ctx.getImageData(0, 0, shadowCanvas.width, shadowCanvas.height);
  var pixels = imageData.data;

  var pixelIndex = 0;
  var iterCount = 0;

  var lightPos;
  var lightDirNegative;
  var objPos = obj.mesh.position;
  if (lightInfo.type == "point"){
    var light = lightHandler.staticPointLightsBySlotId[lightInfo.slotID];
    lightPos = new THREE.Vector3(light.positionX, light.positionY, light.positionZ);
  }else{
    var light = lightHandler.staticDiffuseLightsBySlotId[lightInfo.slotID];
    lightDirNegative = new THREE.Vector3(light.directionX, light.directionY, light.directionZ).negate().normalize();
  }

  for (var i1 = 0; i1 < 1; i1 += 1 / shadowCanvas.width){
    for (var i2 = 0; i2 < 1; i2 += 1 / shadowCanvas.height){
      var curLocalX = firstLocal.clone().lerp(lastLocal, i1).x;
      var curLocalY = firstLocal.clone().lerp(lastLocal, i2).y;

      var curWorldPosition = new THREE.Vector3(curLocalX, curLocalY, 0).applyMatrix4(obj.mesh.matrixWorld);

      var curX = curWorldPosition.x;
      var curY = curWorldPosition.y;
      var curZ = curWorldPosition.z;

      if (lightInfo.type == "point"){
        var fromVector = lightPos;
        var directionVector = new THREE.Vector3(curX - lightPos.x, curY - lightPos.y, curZ - lightPos.z).normalize();
        this.rayCaster.findIntersections(fromVector, directionVector, false, function(x, y, z, objName){
          if (objName == obj.name || !objName){
            pixels[pixelIndex ++] = 255;
            pixels[pixelIndex ++] = 255;
            pixels[pixelIndex ++] = 255;
          }else{
            pixels[pixelIndex ++] = 0;
            pixels[pixelIndex ++] = 0;
            pixels[pixelIndex ++] = 0;
          }

          pixels[pixelIndex ++] = 255;
        }, null, null, true);
      }else{
        var fromVector = new THREE.Vector3(curX, curY, curZ);
        this.rayCaster.findIntersections(fromVector, lightDirNegative, false, function(x, y, z, objName){
          if (!objName){
            pixels[pixelIndex ++] = 255;
            pixels[pixelIndex ++] = 255;
            pixels[pixelIndex ++] = 255;
          }else{
            pixels[pixelIndex ++] = 0;
            pixels[pixelIndex ++] = 0;
            pixels[pixelIndex ++] = 0;
          }

          pixels[pixelIndex ++] = 255;
        });
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = shadowCanvas.width;
  tmpCanvas.height = shadowCanvas.height;
  var tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
  tmpCtx.translate(shadowCanvas.width / 2, shadowCanvas.height / 2);
  tmpCtx.rotate(-Math.PI/2);
  tmpCtx.drawImage(shadowCanvas, -shadowCanvas.width / 2, -shadowCanvas.width / 2);

  this.texturesByObjName[obj.name] = new THREE.CanvasTexture(tmpCanvas);
  this.shadowIntensitiesByObjName[obj.name] = shadowIntensity;
  this.textureSizesByObjName[obj.name] = this.getSizeFromQuality(quality);
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
