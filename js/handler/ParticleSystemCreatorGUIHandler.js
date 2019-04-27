var ParticleSystemCreatorGUIHandler = function(){
  this.actionsByTypes = {
    "CUSTOM": this.showCustom,
    "SMOKE": this.showSmoke,
    "TRAIL": this.showTrail,
    "PLASMA": this.showPlasma,
    "FIRE_EXPLOSION": this.showFireExplosion,
    "MAGIC_CIRCLE": this.showMagicCircle,
    "CIRC_EXPLOSION": this.showCircularExplosion,
    "DYNAMIC_TRAIL": this.showDynamicTrail,
    "LASER": this.showLaser,
    "WATERFALL": this.showWaterfall,
    "SNOW": this.showSnow,
    "CONFETTI": this.showConfetti
  }
  this.typesAry = [];
  for (var key in this.actionsByTypes){
    this.typesAry.push(key);
  }
  this.typeParam = {"Type": "CUSTOM"};
  this.buttonsParam = {
    "Cancel": function(){
      activeControl = new FreeControls({});
      guiHandler.hideAll();
      terminal.enable();
      terminal.clear();
      terminal.printInfo(Text.OPERATION_CANCELLED);
    },
    "Done": function(){

    },
    "Restart": function(){

    }
  };
}

ParticleSystemCreatorGUIHandler.prototype.update = function(){
  if (!this.particleSystem){
    return;
  }
  this.particleSystem.update();
}

ParticleSystemCreatorGUIHandler.prototype.addButtonsController = function(){
  this.restartController = guiHandler.datGuiPSCreator.add(this.buttonsParam, "Restart");
  this.cancelController = guiHandler.datGuiPSCreator.add(this.buttonsParam, "Cancel");
  this.doneController = guiHandler.datGuiPSCreator.add(this.buttonsParam, "Done");
}

ParticleSystemCreatorGUIHandler.prototype.addTypeController = function(type){
  this.typeParam["Type"] = type;
  this.typeController = guiHandler.datGuiPSCreator.add(this.typeParam, "Type", this.typesAry).onChange(function(val){
    guiHandler.hideAll();
    activeControl = new OrbitControls({});
    activeControl.onActivated();
    particleSystemCreatorGUIHandler.actionsByTypes[val]();
  }).listen();
}

ParticleSystemCreatorGUIHandler.prototype.showConfetti = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CONFETTI");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showSnow = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("SNOW");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showWaterfall = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("WATERFALL");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showLaser = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("LASER");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showDynamicTrail = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("DYNAMIC_TRAIL");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showCircularExplosion = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CIRC_EXPLOSION");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showMagicCircle = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("MAGIC_CIRCLE");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showFireExplosion = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("FIRE_EXPLOSION");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showPlasma = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("PLASMA");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showTrail = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("TRAIL");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showSmoke = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("SMOKE");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showCustom = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CUSTOM");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.show = function(psName){
  this.psName = psName;
  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();
  activeControl = new OrbitControls({});
  activeControl.onActivated();
  this.showCustom();
}
