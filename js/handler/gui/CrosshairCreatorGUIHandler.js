var CrosshairCreatorGUIHandler = function(){

}

CrosshairCreatorGUIHandler.prototype.handleTestCrosshair = function(crosshairName){
  if (this.crosshair){
    this.crosshair.destroy();
    this.crosshair = 0;
  }
  REUSABLE_COLOR.set(this.configurations["Color"]);
  this.crosshair = new Crosshair({
    name: crosshairName,
    texture: this.configurations["Texture"],
    colorR: REUSABLE_COLOR.r,
    colorG: REUSABLE_COLOR.g,
    colorB: REUSABLE_COLOR.b,
    alpha: this.configurations["Alpha"],
    size: this.configurations["Size"],
    maxWidthPercent: this.configurations["maxWidthPercent"],
    maxHeightPercent: this.configurations["maxHeightPercent"]
  });
  this.crosshair.mesh.visible = true;
}

CrosshairCreatorGUIHandler.prototype.init = function(crosshairName){
  this.configurations = {
    "Texture": "",
    "Color": "#ffffff",
    "Alpha": 1,
    "Size": 5,
    "maxWidthPercent": 100,
    "maxHeightPercent": 100,
    "Cancel": function(){
      crosshairCreatorGUIHandler.close(Text.OPERATION_CANCELLED);
    },
    "Done": function(){
      crosshairs[crosshairName] = crosshairCreatorGUIHandler.crosshair.clone();
      crosshairCreatorGUIHandler.close(Text.CROSSHAIR_CREATED);
    }
  };
}

CrosshairCreatorGUIHandler.prototype.close = function(msg){
  this.crosshair.destroy();
  this.crosshair = 0;
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }
  terminal.clear();
  terminal.enable();
  terminal.printInfo(msg);
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
}

CrosshairCreatorGUIHandler.prototype.commonStartFunctions = function(){
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
  activeControl = new CustomControls({});
  activeControl.onActivated();
}

CrosshairCreatorGUIHandler.prototype.createGUI = function(crosshairName, texturePackNames){
  guiHandler.datGuiCrosshairCreation = new dat.GUI({hideable: false});
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "Texture", texturePackNames).onChange(function(val){
    crosshairCreatorGUIHandler.handleTestCrosshair();
  }).listen();
  guiHandler.datGuiCrosshairCreation.addColor(this.configurations, "Color").onChange(function(val){
    crosshairCreatorGUIHandler.handleTestCrosshair();
  }).listen();
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "Alpha").min(0.01).max(1).step(0.01).onChange(function(val){
    crosshairCreatorGUIHandler.handleTestCrosshair();
  }).listen();
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "Size").min(0.01).max(100).step(0.01).onChange(function(val){
    crosshairCreatorGUIHandler.handleTestCrosshair();
  }).listen();
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "maxWidthPercent").min(0.01).max(100).step(0.01).onChange(function(val){
    crosshairCreatorGUIHandler.handleTestCrosshair();
  }).listen();
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "maxHeightPercent").min(0.01).max(100).step(0.01).onChange(function(val){
    crosshairCreatorGUIHandler.handleTestCrosshair();
  }).listen();
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "Cancel");
  guiHandler.datGuiCrosshairCreation.add(this.configurations, "Done");
}

CrosshairCreatorGUIHandler.prototype.show = function(crosshairName, texturePackNames){
  this.commonStartFunctions();
  this.init(crosshairName);
  this.createGUI(crosshairName, texturePackNames);
  this.configurations["Texture"] = texturePackNames[0];
  this.handleTestCrosshair(crosshairName);
}
