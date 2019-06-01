var ScriptsGUIHandler = function(){

}

ScriptsGUIHandler.prototype.commonStartFunction = function(){
  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();
  this.hiddenEngineObjects = [];
  for (var i = 0; i<scene.children.length; i++){
    var child = scene.children[i];
    if (child.visible){
      child.visible = false;
      this.hiddenEngineObjects.push(child);
    }
  }
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  activeControl.onActivated();
}

ScriptsGUIHandler.prototype.addController = function(folder, node, name){
  folder.add(node, name).onChange(function(val){
    scriptsHandler.onConfigurationsRefreshed();
    scriptsGUIHandler.refreshTerminal();
  }).listen();
}

ScriptsGUIHandler.prototype.handleFolder = function(folder, node){
  this.addController(folder, node, "listen");
  for (var key in node){
    if (key.startsWith("/")){
      var newFolder = folder.addFolder(key);
      if (node[key].isFolder){
        this.handleFolder(newFolder, node[key]);
      }else{
        this.addController(newFolder, node[key], "include");
        this.addController(newFolder, node[key], "runAutomatically");
      }
    }
  }
}

ScriptsGUIHandler.prototype.addButtons = function(){
  var buttonConfiturations = {
    "Done": function(){
      terminal.clear();
      terminal.printInfo(Text.OK);
      terminal.enable();
      guiHandler.hideAll();
      if (scriptsGUIHandler.hiddenEngineObjects){
        for (var i = 0; i<scriptsGUIHandler.hiddenEngineObjects.length; i++){
          scriptsGUIHandler.hiddenEngineObjects[i].visible = true;
        }
      }
      activeControl = new FreeControls({});
      activeControl.onActivated();
      camera.quaternion.set(0, 0, 0, 1);
      camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
    },
    "Refresh": function(){
      terminal.clear();
      terminal.printInfo(Text.LOADING);
      scriptsHandler.getFiles(function(scriptDescriptions){
        terminal.clear();
        guiHandler.hide(guiHandler.guiTypes.SCRIPTS);
        scriptsGUIHandler.show(scriptDescriptions);
      });
    },
    "Reset": function(){
      scriptsHandler.reset();
      scriptsGUIHandler.refreshTerminal();
    }
  }
  guiHandler.datGuiScripts.add(buttonConfiturations, "Done");
  guiHandler.datGuiScripts.add(buttonConfiturations, "Refresh");
  guiHandler.datGuiScripts.add(buttonConfiturations, "Reset");
}

ScriptsGUIHandler.prototype.refreshTerminal = function(){
  terminal.clear();
  terminal.printInfo(Text.AFTER_SCRIPT_CREATION);
  var length = scriptsHandler.includedScripts.length;
  terminal.printHeader(Text.INCLUDED_SCRIPTS);
  for (var i = 0; i<scriptsHandler.includedScripts.length; i++){
    var options = true;
    if (i == length - 1){
      options = false;
    }
    terminal.printInfo(Text.TREE.replace(Text.PARAM1, scriptsHandler.includedScripts[i]), options);
  }
  if (length == 0){
    terminal.printError(Text.NO_SCRIPTS_INCLUDED);
  }
}

ScriptsGUIHandler.prototype.show = function(configurations){
  this.commonStartFunction();
  guiHandler.datGuiScripts = new dat.GUI({hideable: false});
  this.addButtons();
  var rootFolder = guiHandler.datGuiScripts.addFolder("/");
  this.handleFolder(rootFolder, configurations["/"]);
  this.refreshTerminal();
}
