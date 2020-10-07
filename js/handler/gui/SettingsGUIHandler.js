var SettingsGUIHandler = function(){

}

SettingsGUIHandler.prototype.show = function(){
  terminal.clear();
  terminal.printInfo(Text.SHOWING_SETTINGS);
  guiHandler.datGuiSettings = new dat.GUI({hideable: false});

  var raycasterFolder = guiHandler.datGuiSettings.addFolder("Raycaster");
  var graphicsFolder = guiHandler.datGuiSettings.addFolder("Graphics");
  var workerFolder = guiHandler.datGuiSettings.addFolder("Worker");
  var websocketFolder = guiHandler.datGuiSettings.addFolder("WebSocket");
  var debugFolder = guiHandler.datGuiSettings.addFolder("Debug");

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
