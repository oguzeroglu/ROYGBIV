var LightningCreatorGUIHandler = function(){

}

LightningCreatorGUIHandler.prototype.close = function(isCancel, isEdit, msg){
  this.lightning.stop();
  if (isCancel || (!isCancel && isEdit)){
    this.lightning.destroy();
  }
  this.lightning = 0;
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

LightningCreatorGUIHandler.prototype.update = function(){
  if (this.lightning){
    this.lightning.update();
  }
}

LightningCreatorGUIHandler.prototype.handleMesh = function(lightningName){
  if (this.lightning){
    this.lightning.destroy();
  }
  this.lightning = new Lightning(lightningName, 1/this.parameters["Detail"], this.parameters["Displacement"], this.parameters["Count"], this.parameters["Color"]);
  this.lightning.init(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0));
  this.lightning.start();
}

LightningCreatorGUIHandler.prototype.commonStartFunctions = function(){
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
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5, lookPosition: new THREE.Vector3(0, 50, 0)});
  activeControl.onActivated();
}

LightningCreatorGUIHandler.prototype.createGUI = function(lightningName){
  guiHandler.datGuiLightningCreation = new dat.GUI({hideable: false});
  guiHandler.datGuiLightningCreation.add(this.parameters, "Detail").min(0.01).max(10).step(0.01).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Displacement").min(0).max(500).step(0.5).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Count").min(1).max(10).step(1).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.addColor(this.parameters, "Color").onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Cancel");
  guiHandler.datGuiLightningCreation.add(this.parameters, "Done");
}

LightningCreatorGUIHandler.prototype.init = function(lightningName, isEdit){
  this.parameters = {
    "Detail": 0.5,
    "Displacement": isEdit? lightnings[lightningName].maxDisplacement: 80,
    "Count": isEdit? lightnings[lightningName].count: 1,
    "Color": isEdit? "#" + REUSABLE_COLOR.set(lightnings[lightningName].colorName).getHexString(): "#ffffff",
    "Cancel": function(){
      lightningCreatorGUIHandler.close(true, isEdit, Text.OPERATION_CANCELLED);
    },
    "Done": function(){
      lightnings[lightningName] = lightningCreatorGUIHandler.lightning;
      lightningCreatorGUIHandler.close(false, isEdit, isEdit ? Text.LIGHTNING_EDITED : Text.LIGHTNING_CREATED);
    }
  };
}

LightningCreatorGUIHandler.prototype.show = function(lightningName, isEdit){
  this.commonStartFunctions()
  this.init(lightningName, isEdit);
  this.createGUI(lightningName);
  this.handleMesh(lightningName);
}
