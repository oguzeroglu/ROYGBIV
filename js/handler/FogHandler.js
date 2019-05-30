var FogHandler = function(){
  this.reset();
}

FogHandler.prototype.reset = function(){
  this.fogActive = false;
  this.fogColor = "black";
  this.fogDensity = 0;
  this.fogColorRGB = new THREE.Color(this.fogColor);
  this.setBlendWithSkyboxStatus(false);
  this.removeFog();
}

FogHandler.prototype.isFogBlendingWithSkybox = function(){
  return this.fogBlendWithSkybox;
}

FogHandler.prototype.setBlendWithSkyboxStatus = function(val){
  this.fogBlendWithSkybox = val;
}

FogHandler.prototype.removeFog = function(){
  GLOBAL_FOG_UNIFORM.value.set(-100.0, 0, 0, 0);
}

FogHandler.prototype.setFog = function(){
  GLOBAL_FOG_UNIFORM.value.set(this.fogDensity, this.fogColorRGB.r, this.fogColorRGB.g, this.fogColorRGB.b);
  if (this.fogBlendWithSkybox){
    GLOBAL_FOG_UNIFORM.value.set(-this.fogDensity, skyboxHandler.getMesh().material.uniforms.color.value.r, skyboxHandler.getMesh().material.uniforms.color.value.g, skyboxHandler.getMesh().material.uniforms.color.value.b);
  }
}

FogHandler.prototype.setFogToObjects = function(){
  for (var objName in addedObjects){
    addedObjects[objName].setFog();
  }
  for (var objName in objectGroups){
    objectGroups[objName].setFog();
  }
  for (var textName in addedTexts){
    addedTexts[textName].setFog();
  }
  for (var objName in autoInstancedObjects){
    autoInstancedObjects[objName].setFog();
  }
}

FogHandler.prototype.removeFogFromObjects = function(){
  for (var objName in addedObjects){
    addedObjects[objName].removeFog();
  }
  for (var objName in objectGroups){
    objectGroups[objName].removeFog();
  }
  for (var textName in addedTexts){
    addedTexts[textName].removeFog();
  }
  for (var objName in autoInstancedObjects){
    autoInstancedObjects[objName].removeFog();
  }
}

FogHandler.prototype.onFromPreviewToDesign = function(){
  this.removeFog();
  this.removeFogFromObjects();
}

FogHandler.prototype.onFromDesignToPreview = function(){
  if (this.isFogActive()){
    this.setFog();
    this.setFogToObjects();
  }else{
    this.removeFog();
  }
}

FogHandler.prototype.import = function(obj){

}

FogHandler.prototype.isFogActive = function(){
  return this.fogActive;
}

FogHandler.prototype.export = function(){
  var exportObj = new Object();
  return exportObj;
}
