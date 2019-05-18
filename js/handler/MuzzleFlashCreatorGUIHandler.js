var MuzzleFlashCreatorGUIHandler = function(){

}

MuzzleFlashCreatorGUIHandler.prototype.init = function(muzzleflashName){
  this.parameters = {psCount: 1, psTime: 0.5}
  this.buttonParameters = {
    "Cancel": function(){

    },
    "Done": function(){
      muzzleFlashes[muzzleflashName] = muzzleFlashCreatorGUIHandler.muzzleFlash;
    }
  }
}

MuzzleFlashCreatorGUIHandler.prototype.createMuzzleFlash = function(refPreconfiguredPS, psCount, psTime){
  if (this.muzzleFlash){
    this.muzzleFlash.destroy();
  }
  this.muzzleFlash = new MuzzleFlash(refPreconfiguredPS, psCount, psTime);
}

MuzzleFlashCreatorGUIHandler.prototype.show = function(muzzleflashName, refPreconfiguredPS){
  this.init(muzzleflashName);
  guiHandler.datGuiMuzzleFlashCreator = new dat.GUI({hideable: false});
  guiHandler.datGuiMuzzleFlashCreator.add(this.parameters, "psCount").min(1).max(10).step(1).onFinishChange(function(val){
    muzzleFlashCreatorGUIHandler.createMuzzleFlash(refPreconfiguredPS, val, muzzleFlashCreatorGUIHandler.parameters.psTime);
  }).listen();
  guiHandler.datGuiMuzzleFlashCreator.add(this.parameters, "psTime").min(0.02).max(4).step(0.01).onFinishChange(function(val){
    muzzleFlashCreatorGUIHandler.createMuzzleFlash(refPreconfiguredPS, muzzleFlashCreatorGUIHandler.parameters.psCount, val);
  }).listen();
  guiHandler.datGuiMuzzleFlashCreator.add(this.buttonParameters, "Cancel");
  guiHandler.datGuiMuzzleFlashCreator.add(this.buttonParameters, "Done");
  this.createMuzzleFlash(refPreconfiguredPS, this.parameters.psCount, this.parameters.psTime);
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  activeControl.onActivated();
}

MuzzleFlashCreatorGUIHandler.prototype.update = function(){
  if (!this.muzzleFlash){
    return;
  }
  this.muzzleFlash.update();
}
