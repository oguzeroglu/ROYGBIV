var FogHandler = function(){
  this.reset();
}

FogHandler.prototype.export = function(){
  var exportObj = new Object();
  exportObj.fogActive = this.isFogActive();
  exportObj.fogColor = this.getFogColorText();
  exportObj.fogDensity = this.getFogDensity();
  exportObj.blendWithSkybox = this.isFogBlendingWithSkybox();
  return exportObj;
}

FogHandler.prototype.import = function(obj){
  this.reset();
  this.setFogColor(obj.fogColor);
  this.setFogDensity(obj.fogDensity);
  this.setBlendWithSkyboxStatus(obj.blendWithSkybox);
  if (obj.fogActive){
    this.setFog();
  }else{
    this.removeFog();
  }
  this.removeFogFromObjects();
}

FogHandler.prototype.reset = function(){
  this.fogActive = false;
  this.fogColor = "#000000";
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
  this.removeFogFromObjects();
  this.setFog();
  this.setFogToObjects();
}

FogHandler.prototype.removeFog = function(){
  GLOBAL_FOG_UNIFORM.value.set(-100.0, 0, 0, 0);
  this.fogActive = false;
}

FogHandler.prototype.setFogColor = function(val){
  this.fogColorRGB.set(val);
  this.fogColor = val;
  GLOBAL_FOG_UNIFORM.value.y = this.fogColorRGB.r;
  GLOBAL_FOG_UNIFORM.value.z = this.fogColorRGB.g;
  GLOBAL_FOG_UNIFORM.value.w = this.fogColorRGB.b;
}

FogHandler.prototype.setFogDensity = function(val){
  GLOBAL_FOG_UNIFORM.value.x = val;
  this.fogDensity = val;
}

FogHandler.prototype.setFog = function(){
  GLOBAL_FOG_UNIFORM.value.set(this.fogDensity, this.fogColorRGB.r, this.fogColorRGB.g, this.fogColorRGB.b);
  if (this.fogBlendWithSkybox){
    GLOBAL_FOG_UNIFORM.value.set(-this.fogDensity, skyboxHandler.getMesh().material.uniforms.color.value.r, skyboxHandler.getMesh().material.uniforms.color.value.g, skyboxHandler.getMesh().material.uniforms.color.value.b);
  }
  this.fogActive = true;
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
  for (var objTrailName in objectTrails){
    objectTrails[objTrailName].setFog();
  }
  for (var lightningName in lightnings){
    lightnings[lightningName].setFog();
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
  for (var objTrailName in objectTrails){
    objectTrails[objTrailName].removeFog();
  }
  for (var lightningName in lightnings){
    lightnings[lightningName].removeFog();
  }
}

FogHandler.prototype.onFromPreviewToDesign = function(){
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

FogHandler.prototype.getFogColorText = function(){
  return this.fogColor;
}

FogHandler.prototype.getFogDensity = function(){
  return this.fogDensity;
}

FogHandler.prototype.isFogActive = function(){
  return this.fogActive;
}
