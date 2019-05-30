var FontCreatorGUIHandler = function(){

}

FontCreatorGUIHandler.prototype.init = function(){
  this.configurations = {
    "Typeface": "",
    "Test letter": "x",
    "Cancel": function(){
      if (fontCreatorGUIHandler.isLoading){
        return;
      }
    },
    "Done": function(){
      if (fontCreatorGUIHandler.isLoading){
        return;
      }
    }
  };
}

FontCreatorGUIHandler.prototype.commonStartFunctions = function(){
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

FontCreatorGUIHandler.prototype.createGUI = function(fontName, typefaces){
  guiHandler.datGuiFontCreation = new dat.GUI({hideable: false});
  this.typefaceController = guiHandler.datGuiFontCreation.add(this.configurations, "Typeface", typefaces).onChange(function(val){

  }).listen();
  this.testController = guiHandler.datGuiFontCreation.add(this.configurations, "Test letter", supportedFontAtlasChars).onChange(function(val){

  }).listen();
  guiHandler.datGuiFontCreation.add(this.configurations, "Cancel");
  guiHandler.datGuiFontCreation.add(this.configurations, "Done");
}

FontCreatorGUIHandler.prototype.loadFont = function(fontName, typeface){
  terminal.clear();
  terminal.disable();
  terminal.printInfo(Text.COMPRESSING_FONT);
  guiHandler.disableController(this.typefaceController);
  guiHandler.disableController(this.testController);
  this.isLoading = true;
  this.font = new Font(fontName, "fonts/"+typeface, false);
  this.font.load(function(){

  }, function(){
    fontCreatorGUIHandler.close(Text.ERROR_HAPPENED_COMPRESSING_FONT, true);
  });
}

FontCreatorGUIHandler.prototype.close = function(message, isError){
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }
  terminal.clear();
  terminal.enable();
  if (!isError){
    terminal.printInfo(message);
  }else{
    terminal.printError(message);
  }
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
}

FontCreatorGUIHandler.prototype.show = function(fontName, typefaces){
  this.commonStartFunctions();
  this.init();
  this.createGUI(fontName, typefaces);
  this.configurations["Typeface"] = typefaces[0];
  this.loadFont(fontName, typefaces[0]);
}
