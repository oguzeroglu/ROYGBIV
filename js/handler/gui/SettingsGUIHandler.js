var SettingsGUIHandler = function(){

}

SettingsGUIHandler.prototype.show = function(){
  terminal.clear();
  terminal.printInfo(Text.SHOWING_SETTINGS);
  guiHandler.datGuiSettings = new dat.GUI({hideable: false, width: 450});

  var raycasterFolder = guiHandler.datGuiSettings.addFolder("Raycaster");
  var graphicsFolder = guiHandler.datGuiSettings.addFolder("Graphics");
  var workerFolder = guiHandler.datGuiSettings.addFolder("Worker");
  var websocketFolder = guiHandler.datGuiSettings.addFolder("WebSocket");
  var analyticsFolder = guiHandler.datGuiSettings.addFolder("Analytics");
  var loadingFolder = guiHandler.datGuiSettings.addFolder("Loading");
  var bootscreenFolder = guiHandler.datGuiSettings.addFolder("Bootscreen");
  var debugFolder = guiHandler.datGuiSettings.addFolder("Debug");

  this.initializeRaycasterFolder(raycasterFolder);
  this.initializeGraphicsFolder(graphicsFolder);
  this.initializeWorkerFolder(workerFolder);
  this.initializeWebSocketFolder(websocketFolder);
  this.initializeAnalyticsFolder(analyticsFolder);
  this.initializeLoadingFolder(loadingFolder);
  this.initializeBootscreenFolder(bootscreenFolder);
  this.initializeDebugFolder(debugFolder);

  guiHandler.datGuiSettings.add({
    "Done": function(){
      terminal.clear();
      guiHandler.hide(guiHandler.guiTypes.SETTINGS);
      terminal.printInfo(Text.SETTINGS_GUI_CLOSED);
    }
  }, "Done");
}

SettingsGUIHandler.prototype.initializeBootscreenFolder = function(parentFolder){
  var params = {
    "Bootscreen folder name": bootscreenFolderName || "",
    "Body BG Color": bodyBGColor || ""
  };

  parentFolder.add(params, "Bootscreen folder name").onFinishChange(function(val){
    terminal.clear();

    if (!val){
      bootscreenFolderName = null;
      terminal.printInfo(Text.CUSTOM_BOOTSCREEN_RESET);
      return;
    }

    terminal.printInfo(Text.LOADING);
    canvas.style.visibility = "hidden";
    terminal.disable();

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/checkBootscreenFolder", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4 && xhr.status == 200){
        canvas.style.visibility = "";
        var resp = JSON.parse(xhr.responseText);
        terminal.clear();
        terminal.enable();

        if (resp.error && resp.error.noFolder){
          terminal.printError(Text.NO_SUCH_FOLDER_UNDER_BOOTSCRENS_FOLDER);
        }else if (resp.error && resp.error.notValid){
          terminal.printError(Text.PROVIDED_FOLDER_DOES_NOT_CONTAIN_COMPONENT_HTML);
        }else{
          bootscreenFolderName = this.folderName
          terminal.printError(Text.CUSTOM_BOOTSCREEN_SET);
        }
      }
    }.bind({folderName: val})
    xhr.send(JSON.stringify({folderName: val}));
  });
  parentFolder.add(params, "Body BG Color").onFinishChange(function(val){
    terminal.clear();
    if (!val){
      bodyBGColor = null;
      terminal.printInfo(Text.CUSTOM_BODY_BG_COLOR_RESET);
    }else{
      bodyBGColor = val;
      terminal.printInfo(Text.CUSTOM_BODY_BG_COLOR_SET);
    }
  });
}

SettingsGUIHandler.prototype.initializeAnalyticsFolder = function(parentFolder){
  var params = {
    "Server URL": analyticsHandler.serverURL || "",
    "Dev server URL": analyticsHandler.devServerURL || ""
  };

  parentFolder.add(params, "Server URL").onFinishChange(function(val){
    if (val.endsWith("/")){
      val = val.substring(0, val.length - 1);
    }
    analyticsHandler.serverURL = val;
  });
  parentFolder.add(params, "Dev server URL").onFinishChange(function(val){
    if (val.endsWith("/")){
      val = val.substring(0, val.length - 1);
    }
    analyticsHandler.devServerURL = val;
  });
}

SettingsGUIHandler.prototype.initializeWebSocketFolder = function(parentFolder){
  var params = {
    "Protocol definition file": protocolDefinitionFileName || "",
    "WS server URL": serverWSURL || "",
    "Development WS server URL": developmentServerWSURL || ""
  };

  parentFolder.add(params, "Protocol definition file").onFinishChange(function(val){
    terminal.clear();
    var fileName = val;

    if (!fileName){
      protocolDefinitionFileName = 0;
      terminal.printInfo(Text.PROTOCOL_DEFINITION_FILE_RESET);
      return;
    }

    terminal.printInfo(Text.LOADING);
    canvas.style.visibility = "hidden";
    terminal.disable();

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/checkProtocolDefinitionFile", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4 && xhr.status == 200){
        canvas.style.visibility = "";
        var resp = JSON.parse(xhr.responseText);
        terminal.clear();
        terminal.enable();
        if (resp.error){
          terminal.printError(Text.PROTOCOL_DEFINITION_FILE_DOES_NOT_EXIST.replace(Text.PARAM1, "/protocol_definitions/"+this.fileName));
        }else{
          protocolDefinitionFileName = this.fileName;
          terminal.printInfo(Text.PROTOCOL_DEFINITION_FILE_SET);
        }
      }
    }.bind({fileName: fileName})
    xhr.send(JSON.stringify({fileName: fileName}));
  });

  parentFolder.add(params, "WS server URL").onFinishChange(function(val){
    terminal.clear();
    if (!val){
      serverWSURL = 0;
      terminal.printInfo(Text.SERVER_WS_URL_RESET);
      return;
    }

    serverWSURL = val;
    terminal.printInfo(Text.SERVER_WS_URL_SET);
  });

  parentFolder.add(params, "Development WS server URL").onFinishChange(function(val){
    terminal.clear();
    if (!val){
      serverWSURL = 0;
      terminal.printInfo(Text.DEV_SERVER_WS_URL_RESET);
      return;
    }

    developmentServerWSURL = val;
    terminal.printInfo(Text.DEV_SERVER_WS_URL_SET);
  });
}

SettingsGUIHandler.prototype.initializeLoadingFolder = function(parentFolder){
  var params = {
    "Lazy load shadows": !!shadowBaker.lazyLoad
  };

  parentFolder.add(params, "Lazy load shadows").onChange(function(val){
    shadowBaker.lazyLoad = val;
    terminal.clear();
    terminal.printInfo(val? Text.SHADOWS_WILL_BE_LAZILY_LOADED: Text.SHADOWS_WONT_BE_LAZILY_LOADED);
  });
}

SettingsGUIHandler.prototype.initializeGraphicsFolder = function(parentFolder){
  var params = {
    "Resolution": "" + screenResolution,
    "Use original resolution": useOriginalResolution,
    "Accepted texture size": "" + ACCEPTED_TEXTURE_SIZE,
    "Texture margin in PX": "" + TEXTURE_BLEEDING_FIX_PIXELS,
    "Disable instancing": INSTANCING_DISABLED,
    "Enable antialias": ENABLE_ANTIALIAS,
    "Shadow intensity": shadowBaker.intensity,
    "Shadow blur in PX": shadowBaker.blurAmount || 0,
    "Skybox distance": "" + skyboxDistance,
    "Camera FOV": "" + camera.fov
  };

  var resolutionController = parentFolder.add(params, "Resolution").onFinishChange(function(val){
    terminal.clear();
    var resolutionParam = parseFloat(val);
    useOriginalResolution = false;
    if (isNaN(resolutionParam)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "resolution"));
      return true;
    }
    if ((resolutionParam <= 0 || resolutionParam > 1)){
      terminal.printError(Text.RESOLUTION_MUST_BE_BETWEEN);
      return true;
    }
    screenResolution = resolutionParam;
    renderer.setPixelRatio(screenResolution);
    resizeEventHandler.onResize();
    refreshRaycaster(Text.RESOLUTION_SET);
  }).listen();

  parentFolder.add(params, "Use original resolution").onChange(function(val){
    terminal.clear();
    var resolutionParam;
    if (val){
      resolutionParam = window.devicePixelRatio;
      useOriginalResolution = true;
      guiHandler.disableController(resolutionController);
    }else{
      resolutionParam = 1;
      useOriginalResolution = false;
      params["Resolution"] = "1";
      guiHandler.enableController(resolutionController);
    }

    screenResolution = resolutionParam;
    renderer.setPixelRatio(screenResolution);
    resizeEventHandler.onResize();
    refreshRaycaster(Text.RESOLUTION_SET);
  });

  if (useOriginalResolution){
    guiHandler.disableController(resolutionController);
  }

  parentFolder.add(params, "Accepted texture size").onFinishChange(function(val){

    if (val == "" + ACCEPTED_TEXTURE_SIZE){
      return;
    }

    terminal.clear();
    if (Object.keys(texturePacks).length){
      terminal.printError(Text.CANNOT_SET_TEXTURE_SIZE_AFTER);
      return;
    }

    for (var modelName in models){
      if (models[modelName].getUsedTextures().length > 0){
        terminal.printError(Text.HAS_MODELS_WITH_TEXTURES);
        return;
      }
    }

    var textureSize = parseInt(val);
    if (isNaN(textureSize)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "textureSize"));
      return;
    }
    if (textureSize <= 0){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "textureSize").replace(Text.PARAM2, "0"));
      return;
    }
    if ((Math.log(textureSize)/Math.log(2)) % 1 != 0){
      terminal.printError(Text.IS_NOT_POWER_OF_TWO.replace(Text.PARAM1, "textureSize"));
      return;
    }
    if (textureSize > MAX_TEXTURE_SIZE){
      terminal.printError(Text.MUST_BE_LESS_THAN.replace(Text.PARAM1, "textureSize").replace(Text.PARAM2, MAX_TEXTURE_SIZE));
      return;
    }
    ACCEPTED_TEXTURE_SIZE = textureSize;
    terminal.printInfo(Text.ACCEPTED_TEXTURE_SIZE_SET);
  });

  parentFolder.add(params, "Texture margin in PX").onFinishChange(function(val){

    if (val == "" + TEXTURE_BLEEDING_FIX_PIXELS){
      return;
    }

    terminal.clear();
    var margin = parseFloat(val);

    if (isNaN(margin)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "margin"));
      return;
    }
    if (margin <= 0){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "margin").replace(Text.PARAM2, "0"));
      return;
    }

    TEXTURE_BLEEDING_FIX_PIXELS = margin;
    terminal.printInfo(Text.REFRESHING_SHADOW_MAPS);
    terminal.disable();
    shadowBaker.refreshTextures(function(){
      if (Object.keys(texturePacks).length > 0){
        terminal.clear();
        terminal.printInfo(Text.GENERATING_TEXTURE_ATLAS);
        textureAtlasHandler.onTexturePackChange(function(){
          terminal.clear();
          terminal.enable();
          terminal.printInfo(Text.TEXTURE_MARGIN_UPDATED);
        }, function(){
          terminal.clear();
          terminal.printError(Text.ERROR_HAPPENED_GENERATING_TEXTURE_ATLAS);
          terminal.enable();
        }, true);
      }else{
        terminal.clear();
        terminal.enable();
        terminal.printInfo(Text.TEXTURE_MARGIN_UPDATED);
      }
    }, function(){
      terminal.clear();
      terminal.printError(Text.ERROR_HAPPENED_REFRESINH_SHADOW_MAPS);
      terminal.enable();
    });
  });

  parentFolder.add(params, "Disable instancing").onChange(function(val){
    terminal.clear();

    if (Object.keys(objectGroups).length > 0){
      params["Disable instancing"] = INSTANCING_DISABLED;
      terminal.printError(Text.THERE_ARE_OBJECT_GROUPS_CANNOT_PERFORM_THIS_OPERATION);
      return;
    }

    INSTANCING_DISABLED = val;
    terminal.printInfo(val? Text.INSTANCING_DISABLED: Text.INSTANCING_ENABLED);
  }).listen();

  parentFolder.add(params, "Enable antialias").onChange(function(val){
    terminal.clear();

    ENABLE_ANTIALIAS = val;

    terminal.printInfo(val? Text.ANTIALIAS_ENABLED: Text.ANTIALIAS_DISABLED);
  }).listen();

  parentFolder.add(params, "Shadow intensity").min(0.05).max(1).step(0.05).onFinishChange(function(val){
    terminal.clear();
    shadowBaker.updateIntensity(val);
    terminal.printInfo(Text.SHADOW_INTENSITY_UPDATED);
  });

  parentFolder.add(params, "Shadow blur in PX").onFinishChange(function(val){

    var existingVal = "" + (shadowBaker.blurAmount || 0);

    if (val == existingVal){
      return;
    }

    terminal.clear();
    var parsed = parseFloat(val);

    if (isNaN(parsed)){
      terminal.printError(Text.INVALID_NUMERICAL_VALUE);
      return;
    }

    if (parsed < 0){
      parsed = 0;
    }

    shadowBaker.blurAmount = parsed;
    terminal.printInfo(Text.REFRESHING_SHADOW_MAPS);
    terminal.disable();
    shadowBaker.refreshTextures(function(){
      terminal.clear();
      terminal.printInfo(Text.BLUR_AMOUNT_SET);
      terminal.enable();
    }, noop);
  });

  parentFolder.add(params, "Skybox distance").onFinishChange(function(val){
    terminal.clear();
    var valParsed = parseFloat(val);

    if (isNaN(valParsed)){
      terminal.printError(Text.INVALID_NUMERICAL_VALUE);
      return;
    }

    if (valParsed <= 0){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "Skybox distance").replace(Text.PARAM2, "0"));
      return;
    }

    skyboxDistance = valParsed;
    if (skyboxHandler.mappedSkyboxName){
      skyboxHandler.map(skyBoxes[skyboxHandler.mappedSkyboxName]);
    }

    terminal.printInfo(Text.SKYBOX_DISTANCE_UPDATED);
  });

  parentFolder.add(params, "Camera FOV").onFinishChange(function(val){
    terminal.clear();
    var valParsed = parseFloat(val);

    if (isNaN(valParsed)){
      terminal.printError(Text.INVALID_NUMERICAL_VALUE);
      return;
    }

    camera.fov = valParsed;
    camera.updateProjectionMatrix();
    terminal.printInfo(Text.FOV_UPDATED);
  });

  var shaderPrecisionFolder = parentFolder.addFolder("Shader precision");

  var shaderPrecisionParameters = {
    "Crosshair": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.CROSSHAIR),
    "Basic material": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.BASIC_MATERIAL),
    "Instanced basic material": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.INSTANCED_BASIC_MATERIAL),
    "Merged basic material": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.MERGED_BASIC_MATERIAL),
    "Object trail": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.OBJECT_TRAIL),
    "Particle": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.PARTICLE),
    "Skybox": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.SKYBOX),
    "Text": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.TEXT),
    "Lightning": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.LIGHTNING),
    "Sprite": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.SPRITE),
    "Model": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.MODEL),
    "PBR Model": shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.PBR_MODEL)
  };

  var precisionAry = ["low", "medium", "high"];

  shaderPrecisionFolder.add(shaderPrecisionParameters, "Crosshair", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.CROSSHAIR, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Basic material", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.BASIC_MATERIAL, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Instanced basic material", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.INSTANCED_BASIC_MATERIAL, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Merged basic material", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.MERGED_BASIC_MATERIAL, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Object trail", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.OBJECT_TRAIL, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Particle", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.PARTICLE, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Skybox", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.SKYBOX, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Text", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.TEXT, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Lightning", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.LIGHTNING, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Sprite", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.SPRITE, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "Model", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.MODEL, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  shaderPrecisionFolder.add(shaderPrecisionParameters, "PBR Model", precisionAry).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.PBR_MODEL, settingsGUIHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
}

SettingsGUIHandler.prototype.initializeRaycasterFolder = function(parentFolder){
  var params = {
    "World limit min.": LIMIT_BOUNDING_BOX.min.x + "," + LIMIT_BOUNDING_BOX.min.y + "," + LIMIT_BOUNDING_BOX.min.z,
    "World limit max.": LIMIT_BOUNDING_BOX.max.x + "," + LIMIT_BOUNDING_BOX.max.y + "," + LIMIT_BOUNDING_BOX.max.z,
    "Bin size": "" + BIN_SIZE,
    "Ray step": "" + RAYCASTER_STEP_AMOUNT
  };

  parentFolder.add(params, "World limit min.").onFinishChange(function(val){
    terminal.clear();

    var splitted = val.split(",");

    if (splitted.length != 3){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
    }

    var minX = parseInt(splitted[0]);
    var minY = parseInt(splitted[1]);
    var minZ = parseInt(splitted[2]);
    var maxX = LIMIT_BOUNDING_BOX.max.x;
    var maxY = LIMIT_BOUNDING_BOX.max.y;
    var maxZ = LIMIT_BOUNDING_BOX.max.z;

    if (isNaN(minX)){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
      return true;
    }
    if (isNaN(minY)){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
      return true;
    }
    if (isNaN(minZ)){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
      return true;
    }

    if (maxX <= minX){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxX").replace(
        Text.PARAM2, "minX"
      ));
      return true;
    }
    if (maxY <= minY){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxY").replace(
        Text.PARAM2, "minY"
      ));
      return true;
    }
    if (maxZ <= minZ){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxZ").replace(
        Text.PARAM2, "minZ"
      ));
      return true;
    }
    if ((minX % BIN_SIZE) || (minY % BIN_SIZE) || (minZ % BIN_SIZE) || (maxX % BIN_SIZE) || (maxY % BIN_SIZE) || (maxZ % BIN_SIZE)){
      terminal.printError(Text.PARAMETERS_MUST_BE_DIVISABLE_BY.replace(Text.PARAM1, BIN_SIZE));
      return true;
    }

    var lowerBound = new THREE.Vector3(minX, minY, minZ);
    var upperBound = new THREE.Vector3(maxX, maxY, maxZ);
    LIMIT_BOUNDING_BOX = new THREE.Box3(lowerBound, upperBound);
    sceneHandler.onWorldLimitsChange();
    steeringHandler.resetWorld();
    refreshRaycaster(Text.OCTREE_LIMIT_SET);
  });

  parentFolder.add(params, "World limit max.").onFinishChange(function(val){
    terminal.clear();

    var splitted = val.split(",");

    if (splitted.length != 3){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
    }

    var maxX = parseInt(splitted[0]);
    var maxY = parseInt(splitted[1]);
    var maxZ = parseInt(splitted[2]);
    var minX = LIMIT_BOUNDING_BOX.min.x;
    var minY = LIMIT_BOUNDING_BOX.min.y;
    var minZ = LIMIT_BOUNDING_BOX.min.z;

    if (isNaN(maxX)){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
      return true;
    }
    if (isNaN(maxY)){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
      return true;
    }
    if (isNaN(maxZ)){
      terminal.printError(Text.INVALID_VECTOR_VALUE);
      return true;
    }

    if (maxX <= minX){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxX").replace(
        Text.PARAM2, "minX"
      ));
      return true;
    }
    if (maxY <= minY){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxY").replace(
        Text.PARAM2, "minY"
      ));
      return true;
    }
    if (maxZ <= minZ){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxZ").replace(
        Text.PARAM2, "minZ"
      ));
      return true;
    }
    if ((minX % BIN_SIZE) || (minY % BIN_SIZE) || (minZ % BIN_SIZE) || (maxX % BIN_SIZE) || (maxY % BIN_SIZE) || (maxZ % BIN_SIZE)){
      terminal.printError(Text.PARAMETERS_MUST_BE_DIVISABLE_BY.replace(Text.PARAM1, BIN_SIZE));
      return true;
    }

    var lowerBound = new THREE.Vector3(minX, minY, minZ);
    var upperBound = new THREE.Vector3(maxX, maxY, maxZ);
    LIMIT_BOUNDING_BOX = new THREE.Box3(lowerBound, upperBound);
    sceneHandler.onWorldLimitsChange();
    steeringHandler.resetWorld();
    refreshRaycaster(Text.OCTREE_LIMIT_SET);
  });

  parentFolder.add(params, "Bin size").onFinishChange(function(val){
    terminal.clear();
    var binSize = parseInt(val);
    if (isNaN(binSize)){
      terminal.printError(Text.BIN_SIZE_MUST_BE_A_NUMBER);
      return;
    }
    if (binSize <= 1){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(
        Text.PARAM1, "Bin size"
      ).replace(
        Text.PARAM2, "1"
      ));
      return;
    }
    var minX = LIMIT_BOUNDING_BOX.min.x;
    var minY = LIMIT_BOUNDING_BOX.min.y;
    var minZ = LIMIT_BOUNDING_BOX.min.z;
    var maxX = LIMIT_BOUNDING_BOX.max.x;
    var maxY = LIMIT_BOUNDING_BOX.max.y;
    var maxZ = LIMIT_BOUNDING_BOX.max.z;
    if ((minX % binSize) || (minY % binSize) || (minZ % binSize) || (maxX % binSize) || (maxY % binSize) || (maxZ % binSize)){
      terminal.printError(Text.WORLD_LIMITS_MUST_BE_DIVISABLE_BY_BIN_SIZE);
      return;
    }
    BIN_SIZE = binSize;
    sceneHandler.onBinSizeChange();
    steeringHandler.resetWorld();
    refreshRaycaster(Text.BIN_SIZE_SET);
  });

  parentFolder.add(params, "Ray step").onFinishChange(function(val){
    terminal.clear();
    var stepAmount = parseFloat(val);
    if (isNaN(stepAmount)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "stepAmount"));
      return;
    }
    if (stepAmount <= 0){
      terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "stepAmount").replace(Text.PARAM2, "0"));
      return;
    }
    RAYCASTER_STEP_AMOUNT = stepAmount;
    refreshRaycaster(Text.RAYCASTER_STEP_AMOUNT_SET_TO.replace(Text.PARAM1, RAYCASTER_STEP_AMOUNT));
  });
}

SettingsGUIHandler.prototype.initializeWorkerFolder = function(parentFolder){
  var params = {
    "Raycaster worker": RAYCASTER_WORKER_ON,
    "Physics worker": PHYSICS_WORKER_ON,
    "Lightning worker": LIGHTNING_WORKER_ON
  };

  parentFolder.add(params, "Raycaster worker").onChange(function(val){
    RAYCASTER_WORKER_ON = val;
    raycasterFactory.refresh();
    rayCaster = raycasterFactory.get();

    terminal.clear();
    terminal.printInfo(val? Text.RAYCASTER_WORKER_TURNED_ON: Text.RAYCASTER_WORKER_TURNED_OFF);

    if (val){
      rayCaster.onReadyCallback = noop;
    }
  });

  parentFolder.add(params, "Physics worker").onChange(function(val){
    PHYSICS_WORKER_ON = val;
    physicsFactory.refresh();
    physicsWorld = physicsFactory.get();

    terminal.clear();
    terminal.printInfo(val? Text.PHYSICS_WORKER_TURNED_ON: Text.PHYSICS_WORKER_TURNED_OFF);
  });

  parentFolder.add(params, "Lightning worker").onChange(function(val){
    LIGHTNING_WORKER_ON = val
    for (var lightningName in lightnings){
      lightnings[lightningName].init(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0));
    }
    if (LIGHTNING_WORKER_ON){
      lightningHandler.reset();
      for (var lightningName in lightnings){
        lightningHandler.onLightningCreation(lightnings[lightningName]);
        if (lightnings[lightningName].isCorrected){
          lightningHandler.onSetCorrectionProperties(lightnings[lightningName]);
        }
      }
    }

    terminal.clear();
    terminal.printInfo(val? Text.LIGHTNING_WORKER_TURNED_ON: Text.LIGHTNING_WORKER_TURNED_OFF);
  });
}

SettingsGUIHandler.prototype.initializeDebugFolder = function(parentFolder){
  var params = {
    "Physics": physicsDebugMode,
    "AI": !!steeringHandler.debugHelper
  };

  parentFolder.add(params, "Physics").onChange(function(){
    terminal.clear();
    parseCommand("switchPhysicsDebugMode");
  });

  parentFolder.add(params, "AI").onChange(function(){
    terminal.clear();
    parseCommand("switchAIDebugMode");
  });
}

SettingsGUIHandler.prototype.getPrecisionType = function(key){
  if (key == "low"){
    return shaderPrecisionHandler.precisionTypes.LOW;
  }
  if (key == "medium"){
    return shaderPrecisionHandler.precisionTypes.MEDIUM;
  }
  if (key == "high"){
    return shaderPrecisionHandler.precisionTypes.HIGH;
  }
  throw new Error("Unknown type.");
}
