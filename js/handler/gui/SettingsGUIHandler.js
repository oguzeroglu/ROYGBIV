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

  this.initializeDebugFolder(debugFolder);

  guiHandler.datGuiSettings.add({
    "Done": function(){
      terminal.clear();
      guiHandler.hide(guiHandler.guiTypes.SETTINGS);
      terminal.printInfo(Text.SETTINGS_GUI_CLOSED);
    }
  }, "Done");
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
