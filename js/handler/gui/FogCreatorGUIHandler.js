var FogCreatorGUIHandler = function(){

}

FogCreatorGUIHandler.prototype.init = function(){
  this.configurations = {
    "Active": fogHandler.isFogActive(),
    "Density": fogHandler.getFogDensity(),
    "Color": fogHandler.getFogColorText(),
    "Blend w Skybox": fogHandler.isFogBlendingWithSkybox(),
    "Done": function(){
      fogHandler.removeFogFromObjects();
      fogCreatorGUIHandler.hide();
      sceneHandler.onFogChange();
    }
  }
}

FogCreatorGUIHandler.prototype.onFogActivated = function(){
  guiHandler.enableController(this.densityController);
  guiHandler.enableController(this.colorController);
  guiHandler.enableController(this.blendWithSkyboxController);
  if (!skyboxHandler.isVisible()){
    guiHandler.disableController(this.blendWithSkyboxController);
  }
  fogHandler.setFog();
  fogHandler.setFogToObjects();
}

FogCreatorGUIHandler.prototype.onFogDeactivated = function(){
  guiHandler.disableController(this.densityController);
  guiHandler.disableController(this.colorController);
  guiHandler.disableController(this.blendWithSkyboxController);
  fogHandler.removeFog();
  fogHandler.removeFogFromObjects();
}

FogCreatorGUIHandler.prototype.createGUI = function(){
  guiHandler.datGuiFog = new dat.GUI({hideable: false});
  this.activeController = guiHandler.datGuiFog.add(this.configurations, "Active").onChange(function(val){
    if (val){
      fogCreatorGUIHandler.onFogActivated();
    }else{
      fogCreatorGUIHandler.onFogDeactivated();
    }
  }).listen();
  this.densityController = guiHandler.datGuiFog.add(this.configurations, "Density").min(0).max(0.01).step(0.0001).onChange(function(val){
    fogHandler.setFogDensity(val);
  }).listen();
  this.colorController = guiHandler.datGuiFog.add(this.configurations, "Color").onFinishChange(function(val){
    fogHandler.setFogColor(val);
  }).listen();
  this.blendWithSkyboxController = guiHandler.datGuiFog.add(this.configurations, "Blend w Skybox").onChange(function(val){
    if (!skyboxHandler.isVisible() || !fogCreatorGUIHandler.configurations["Active"]){
      fogCreatorGUIHandler.configurations["Blend w Skybox"] = false;
      return;
    }
    if (val){
      guiHandler.disableController(fogCreatorGUIHandler.colorController);
    }else{
      guiHandler.enableController(fogCreatorGUIHandler.colorController);
    }
    fogHandler.setBlendWithSkyboxStatus(val);
  }).listen();
  guiHandler.datGuiFog.add(this.configurations, "Done");
  if (!fogHandler.isFogActive()){
    guiHandler.disableController(this.densityController);
    guiHandler.disableController(this.colorController);
    guiHandler.disableController(this.blendWithSkyboxController);
  }else if (!skyboxHandler.isVisible()){
    guiHandler.disableController(this.blendWithSkyboxController);
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    guiHandler.disableController(this.colorController);
  }
}

FogCreatorGUIHandler.prototype.show = function(){
  this.init();
  this.createGUI();
  if (fogHandler.isFogActive()){
    fogHandler.setFogToObjects();
  }
}

FogCreatorGUIHandler.prototype.hide = function(){
  guiHandler.hide(guiHandler.guiTypes.FOG);
  terminal.clear();
  terminal.enable();
  terminal.printInfo(Text.OK);
}
