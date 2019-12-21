var LightningCreatorGUIHandler = function(){

}

LightningCreatorGUIHandler.prototype.close = function(isCancel, isEdit, msg){
  lightningHandler.onEditorClose();
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
    lightningHandler.handleActiveLightnings(this.lightning);
  }
}

LightningCreatorGUIHandler.prototype.handleMesh = function(lightningName){
  var prevAttachedToFPSWeapon, prevFPSWeaponConfigurations, prevIsCorrected, prevCorrectionRefDistance, prevCorrectionRefLength;
  if (this.lightning){
    prevAttachedToFPSWeapon = this.lightning.attachedToFPSWeapon;
    prevFPSWeaponConfigurations = this.lightning.fpsWeaponConfigurations;
    prevIsCorrected = this.lightning.isCorrected;
    prevCorrectionRefDistance = this.lightning.correctionRefDistance;
    prevCorrectionRefLength = this.lightning.correctionRefLength;
    this.lightning.destroy();
  }else if (lightnings[lightningName]){
    prevAttachedToFPSWeapon = lightnings[lightningName].attachedToFPSWeapon;
    prevFPSWeaponConfigurations = lightnings[lightningName].fpsWeaponConfigurations;
    prevIsCorrected = lightnings[lightningName].isCorrected;
    prevCorrectionRefDistance = lightnings[lightningName].correctionRefDistance;
    prevCorrectionRefLength = lightnings[lightningName].correctionRefLength;
  }
  this.lightning = new Lightning(lightningName, 1/this.parameters["Detail"], 1/this.parameters["Mobile detail"], this.parameters["Displacement"], this.parameters["Count"], this.parameters["Color"], this.parameters["Radius"], this.parameters["Roughness"]);
  this.lightning.init(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0));
  lightningHandler.onEditorLightningCreation(this.lightning);
  if (prevAttachedToFPSWeapon){
    this.lightning.attachedToFPSWeapon = true;
    this.lightning.fpsWeaponConfigurations = prevFPSWeaponConfigurations;
  }
  if (prevIsCorrected){
    this.lightning.setCorrectionProperties(prevCorrectionRefDistance, prevCorrectionRefLength);
  }
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
  guiHandler.datGuiLightningCreation.add(this.parameters, "Detail").min(0.001).max(10).step(0.001).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Mobile detail").min(0.001).max(10).step(0.001).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Displacement").min(0).max(500).step(0.5).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Count").min(1).max(10).step(1).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Radius").min(0.1).max(20).step(0.1).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Roughness").min(0.01).max(10).step(0.01).onChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Color").onFinishChange(function(val){
    lightningCreatorGUIHandler.handleMesh(lightningName);
  }).listen();
  guiHandler.datGuiLightningCreation.add(this.parameters, "Cancel");
  guiHandler.datGuiLightningCreation.add(this.parameters, "Done");
}

LightningCreatorGUIHandler.prototype.init = function(lightningName, isEdit){
  this.parameters = {
    "Detail": isEdit? (1/lightnings[lightningName].desktopDetailThreshold): 0.5,
    "Mobile detail": isEdit? (1/lightnings[lightningName].mobileDetailThreshold): 0.5,
    "Displacement": isEdit? lightnings[lightningName].maxDisplacement: 80,
    "Count": isEdit? lightnings[lightningName].count: 1,
    "Radius": isEdit? lightnings[lightningName].radius: 5,
    "Roughness": isEdit? lightnings[lightningName].roughness: 0.2,
    "Color": isEdit? "#" + REUSABLE_COLOR.set(lightnings[lightningName].colorName).getHexString(): "#ffffff",
    "Cancel": function(){
      lightningCreatorGUIHandler.close(true, isEdit, Text.OPERATION_CANCELLED);
    },
    "Done": function(){
      if (lightnings[lightningName]){
        var lightning = lightnings[lightningName];
        lightning.destroy();
        delete lightnings[lightningName];
        lightningHandler.onLightningDeletion(lightning);
      }
      lightnings[lightningName] = lightningCreatorGUIHandler.lightning.clone();
      lightningHandler.onLightningCreation(lightnings[lightningName]);
      if (lightnings[lightningName].isCorrected){
        lightningHandler.onSetCorrectionProperties(lightnings[lightningName]);
      }
      sceneHandler.onLightningCreation(lightnings[lightningName]);
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
