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
  var debugFolder = guiHandler.datGuiSettings.addFolder("Debug");

  this.initializeRaycasterFolder(raycasterFolder);
  this.initializeGraphicsFolder(graphicsFolder);
  this.initializeWorkerFolder(workerFolder);
  this.initializeDebugFolder(debugFolder);

  guiHandler.datGuiSettings.add({
    "Done": function(){
      terminal.clear();
      guiHandler.hide(guiHandler.guiTypes.SETTINGS);
      terminal.printInfo(Text.SETTINGS_GUI_CLOSED);
    }
  }, "Done");
}

SettingsGUIHandler.prototype.initializeGraphicsFolder = function(parentFolder){
  var params = {
    "Resolution": "" + screenResolution,
    "Use original resolution": useOriginalResolution,
    "Accepted texture size": "" + ACCEPTED_TEXTURE_SIZE
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
    terminal.clear();
    if (Object.keys(texturePacks).length){
      terminal.printError(Text.CANNOT_SET_TEXTURE_SIZE_AFTER);
      return;
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
      rayCaster.onReadyCallback = function(){};
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
