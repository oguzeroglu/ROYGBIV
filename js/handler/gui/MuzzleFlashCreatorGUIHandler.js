var MuzzleFlashCreatorGUIHandler = function(){

}

MuzzleFlashCreatorGUIHandler.prototype.commonInitFunctions = function(muzzleflashName){
  this.hiddenEngineObjects = [];
  for (var i = 0; i<scene.children.length; i++){
    if (scene.children[i].visible){
      scene.children[i].visible = false;
      this.hiddenEngineObjects.push(scene.children[i]);
    }
  }
  this.init(muzzleflashName);
}

MuzzleFlashCreatorGUIHandler.prototype.init = function(muzzleflashName){
  if (!muzzleFlashes[muzzleflashName]){
    this.isEdit = false;
    this.parameters = {psCount: 1, psTime: 0.5};
  }else{
    this.isEdit = true;
    this.parameters = {psCount: muzzleFlashes[muzzleflashName].psCount, psTime: muzzleFlashes[muzzleflashName].psTime};
  }
  this.buttonParameters = {
    "Cancel": function(){
      activeControl = new FreeControls({});
      guiHandler.hideAll();
      terminal.enable();
      terminal.clear();
      terminal.printInfo(Text.OPERATION_CANCELLED);
      muzzleFlashCreatorGUIHandler.muzzleFlash.hide();
      if (muzzleFlashCreatorGUIHandler.hiddenEngineObjects){
        for (var i = 0; i<muzzleFlashCreatorGUIHandler.hiddenEngineObjects.length; i++){
          muzzleFlashCreatorGUIHandler.hiddenEngineObjects[i].visible = true;
        }
        muzzleFlashCreatorGUIHandler.hiddenEngineObjects = [];
      }
      camera.quaternion.set(0, 0, 0, 1);
      camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
      delete muzzleFlashCreatorGUIHandler.muzzleFlash;
    },
    "Done": function(){
      activeControl = new FreeControls({});
      guiHandler.hideAll();
      terminal.enable();
      terminal.clear();
      if (muzzleFlashCreatorGUIHandler.isEdit){
        terminal.printInfo(Text.MUZZLEFLASH_EDITED);
      }else{
        terminal.printInfo(Text.MUZZLEFLASH_CREATED);
      }
      muzzleFlashCreatorGUIHandler.muzzleFlash.hide();
      if (muzzleFlashCreatorGUIHandler.hiddenEngineObjects){
        for (var i = 0; i<muzzleFlashCreatorGUIHandler.hiddenEngineObjects.length; i++){
          muzzleFlashCreatorGUIHandler.hiddenEngineObjects[i].visible = true;
        }
        muzzleFlashCreatorGUIHandler.hiddenEngineObjects = [];
      }
      camera.quaternion.set(0, 0, 0, 1);
      camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
      muzzleFlashes[muzzleflashName] = muzzleFlashCreatorGUIHandler.muzzleFlash;
      sceneHandler.onMuzzleFlashCreation(muzzleFlashes[muzzleflashName]);
      delete muzzleFlashCreatorGUIHandler.muzzleFlash;
    }
  }
}

MuzzleFlashCreatorGUIHandler.prototype.createMuzzleFlash = function(muzzleflashName, refPreconfiguredPS, psCount, psTime){
  if (this.muzzleFlash){
    this.muzzleFlash.destroy();
  }
  this.muzzleFlash = new MuzzleFlash(muzzleflashName, refPreconfiguredPS, psCount, psTime);
  this.muzzleFlash.init();
}

MuzzleFlashCreatorGUIHandler.prototype.show = function(muzzleflashName, refPreconfiguredPS){
  this.commonInitFunctions(muzzleflashName);
  guiHandler.datGuiMuzzleFlashCreator = new dat.GUI({hideable: false});
  guiHandler.datGuiMuzzleFlashCreator.add(this.parameters, "psCount").min(1).max(10).step(1).onFinishChange(function(val){
    muzzleFlashCreatorGUIHandler.createMuzzleFlash(muzzleflashName, refPreconfiguredPS, val, muzzleFlashCreatorGUIHandler.parameters.psTime);
  }).listen();
  guiHandler.datGuiMuzzleFlashCreator.add(this.parameters, "psTime").min(0.02).max(10000).step(0.01).onFinishChange(function(val){
    muzzleFlashCreatorGUIHandler.createMuzzleFlash(muzzleflashName, refPreconfiguredPS, muzzleFlashCreatorGUIHandler.parameters.psCount, val);
  }).listen();
  guiHandler.datGuiMuzzleFlashCreator.add(this.buttonParameters, "Cancel");
  guiHandler.datGuiMuzzleFlashCreator.add(this.buttonParameters, "Done");
  this.createMuzzleFlash(muzzleflashName, refPreconfiguredPS, this.parameters.psCount, this.parameters.psTime);
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  activeControl.onActivated();
}

MuzzleFlashCreatorGUIHandler.prototype.update = function(){
  if (!this.muzzleFlash){
    return;
  }
  this.muzzleFlash.update();
}

MuzzleFlashCreatorGUIHandler.prototype.edit = function(muzzleFlash){
  this.show(muzzleFlash.name, muzzleFlash.refPreconfiguredPS);
}
