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

ScriptsGUIHandler.prototype.show = function(configurations){
  this.commonStartFunction();
  guiHandler.datGuiScripts = new dat.GUI({hideable: false});
  var rootFolder = guiHandler.datGuiScripts.addFolder("root");
  this.handleFolder(rootFolder, configurations.root);
}
