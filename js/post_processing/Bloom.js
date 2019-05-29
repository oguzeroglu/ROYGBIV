var Bloom = function(){
  this.configurations = {
    blurStepCount: 5,
    threshold: 1,
    bloomStrength: 2,
    exposure: 1,
    gamma: 1,
    tapTypes: [13, 13, 13, 13, 13],
    bloomFactors: [1, 1, 1, 1, 1],
    bloomTintColors: [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1)]
  }
  this.rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.generateDirectPass();
  this.generateBrightPass();
  this.generateBlurPass();
  this.generateCombinerPass();
  this.setBlurStepCount(this.configurations.blurStepCount);
}

Bloom.prototype.getTapTextFromTapType = function(type){
  if (type == 13){
    return "high";
  }
  if (type == 9){
    return "medium";
  }
  if (type == 5){
    return "low";
  }
  throw new Error("Unknown tap type.");
}

Bloom.prototype.reset = function(){
  renderer.bloomOn = false;
  this.setBlurStepCount(5);
  this.setThreshold(1);
  this.setBloomStrength(2);
  this.setExposure(1);
  this.setGamma(1);
  for (var i = 0; i<5; i++){
    this.setTapForLevel(i, 13);
    this.setBloomFactor(i, 1);
    this.setBloomTintColor(i, 1, 1, 1);
  }
}

Bloom.prototype.load = function(configs){
  this.setBlurStepCount(configs.blurStepCount);
  this.setThreshold(configs.threshold);
  this.setBloomStrength(configs.bloomStrength);
  this.setExposure(configs.exposure);
  this.setGamma(configs.gamma);
  for (var i = 0; i<5; i++){
    this.setTapForLevel(i, configs.tapTypes[i]);
    this.setBloomFactor(i, configs.bloomFactors[i]);
    var curBloomTintColor = configs.bloomTintColors[i];
    this.setBloomTintColor(i, curBloomTintColor.x, curBloomTintColor.y, curBloomTintColor.z);
  }
  renderer.bloomOn = configs.isOn;
}

Bloom.prototype.export = function(){
  var exportObj = new Object();
  exportObj.isOn = renderer.bloomOn;
  for (var config in this.configurations){
    exportObj[config] = this.configurations[config];
  }
  return exportObj;
}

Bloom.prototype.showConfigurations = function(){
  guiHandler.show(guiHandler.guiTypes.BLOOM);
  guiHandler.bloomParameters["Active"] = renderer.bloomOn;
  if (typeof guiHandler.bloomParameters["Active"] == UNDEFINED){
    guiHandler.bloomParameters["Active"] = false;
  }
  guiHandler.bloomParameters["Threshold"] = this.configurations.threshold;
  guiHandler.bloomParameters["Strength"] = this.configurations.bloomStrength;
  guiHandler.bloomParameters["Exposure"] = this.configurations.exposure;
  guiHandler.bloomParameters["Gamma"] = this.configurations.gamma;
  guiHandler.bloomParameters["BlurStepAmount"] = this.configurations.blurStepCount;
  for (var i=0; i<5; i++){
    guiHandler.bloomParameters["BlurPass"+(i+1)]["Factor"] = this.configurations.bloomFactors[i];
    guiHandler.bloomParameters["BlurPass"+(i+1)]["Color"] = "#" + (REUSABLE_COLOR.setRGB(this.configurations.bloomTintColors[i].x, this.configurations.bloomTintColors[i].y, this.configurations.bloomTintColors[i].z).getHexString());
    guiHandler.bloomParameters["BlurPass"+(i+1)]["Quality"] = this.getTapTextFromTapType(this.configurations.tapTypes[i]);
    guiHandler.enableController(guiHandler["blurPassFactorController"+(i+1)]);
    guiHandler.enableController(guiHandler["blurPassTintColorController"+(i+1)]);
    guiHandler.enableController(guiHandler["blurPassTapController"+(i+1)]);
  }
  for (var i = this.configurations.blurStepCount; i < 5; i++){
    guiHandler.disableController(guiHandler["blurPassFactorController"+(i+1)]);
    guiHandler.disableController(guiHandler["blurPassTintColorController"+(i+1)]);
    guiHandler.disableController(guiHandler["blurPassTapController"+(i+1)]);
  }
  this.configurationsOpen = true;
}

Bloom.prototype.hideConfigurations = function(){
  guiHandler.hide(guiHandler.guiTypes.BLOOM);
  this.configurationsOpen = false;
}

Bloom.prototype.setBloomTintColor = function(levelIndex, r, g, b){
  this.configurations.bloomTintColors[levelIndex].set(r, g, b);
}

Bloom.prototype.setBloomFactor = function(levelIndex, factor){
  this.configurations.bloomFactors[levelIndex] = factor;
}

Bloom.prototype.setGamma = function(gamma){
  this.configurations.gamma = gamma;
  this.combinerMaterial.uniforms.gamma.value = gamma;
}

Bloom.prototype.setExposure = function(exposure){
  this.configurations.exposure = exposure;
  this.combinerMaterial.uniforms.exposure.value = exposure;
}

Bloom.prototype.setBlurStepCount = function(stepCount){
  if (stepCount > 5){
    throw new Error("[!] Bloom.setBlurStepCount error: Max alloed stepCount is 5.");
  }
  if (stepCount < 1){
    stepCount = 1
  }
  this.configurations.blurStepCount = stepCount;
  for (var i = 0; i<5; i++){
    var macro = "BLUR_STEP_"+(i+1)+"_ACTIVE";
    macroHandler.removeMacro(macro, this.combinerMaterial, false, true);
  }
  for (var i = 0; i<stepCount; i++){
    var macro = "BLUR_STEP_"+(i+1)+"_ACTIVE";
    macroHandler.injectMacro(macro, this.combinerMaterial, false, true);
  }
}

Bloom.prototype.setBloomStrength = function(strength){
  this.combinerMaterial.uniforms.bloomStrength.value = strength;
  this.configurations.bloomStrength = strength;
}

Bloom.prototype.setThreshold = function(threshold){
  this.configurations.threshold = threshold;
  this.brightPassMaterial.uniforms.threshold.value = threshold;
}

Bloom.prototype.setTapForLevel = function(levelIndex, tap){
  this.configurations.tapTypes[levelIndex] = tap;
}

Bloom.prototype.setBlurTap = function(tap){
  if (tap == 5){
    this.blurPassMaterial.uniforms.numberOfTap.value = -10;
    return;
  }
  if (tap == 9){
    this.blurPassMaterial.uniforms.numberOfTap.value = 5;
    return;
  }
  if (tap == 13){
    this.blurPassMaterial.uniforms.numberOfTap.value = 20;
    return;
  }
  throw new Error("[!] Bloom.setBlurTap error: Undefined tap.");
}

Bloom.prototype.setBlurDirection = function(isX){
  if (isX){
    this.blurPassMaterial.uniforms.direction.value = this.blurPassDirectionX;
  }else{
    this.blurPassMaterial.uniforms.direction.value = this.blurPassDirectionY;
  }
}

Bloom.prototype.combinerPass = function(){
  renderer.webglRenderer.render(this.combinerScene, orthographicCamera);
}

Bloom.prototype.blurPass = function(){
  this.blurPassMaterial.uniforms.inputTexture.value = this.brightTarget.texture;
  this.blurPassMaterial.uniforms.resolution.value.set(this.brightTarget.width, this.brightTarget.height);
  for (var i = 0; i <this.configurations.blurStepCount; i++){
    this.setBlurTap(this.configurations.tapTypes[i]);
    this.setBlurDirection(true);
    renderer.webglRenderer.render(this.blurPassScene, orthographicCamera, this.horizontalBlurTargets[i]);
    var rt = this.horizontalBlurTargets[i];
    this.blurPassMaterial.uniforms.inputTexture.value = rt.texture;
    this.blurPassMaterial.uniforms.resolution.value.set(rt.width, rt.height);
    this.setBlurDirection(false);
    renderer.webglRenderer.render(this.blurPassScene, orthographicCamera, this.verticalBlurTargets[i]);
    rt = this.verticalBlurTargets[i];
    this.blurPassMaterial.uniforms.inputTexture.value = rt.texture;
    this.blurPassMaterial.uniforms.resolution.value.set(rt.width, rt.height);
  }
}

Bloom.prototype.brightPass = function(){
  renderer.webglRenderer.render(this.brightPassScene, orthographicCamera, this.brightTarget);
}

Bloom.prototype.directPass = function(){
  renderer.webglRenderer.render(scene, camera, this.sceneTarget);
}

Bloom.prototype.generateCombinerPass = function(){
  this.combinerMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomCombinerVertexShader,
    fragmentShader: ShaderContent.bloomCombinerFragmentShader,
    uniforms:{
      modelViewMatrix: new THREE.Uniform(),
      projectionMatrix: new THREE.Uniform(orthographicCamera.projectionMatrix),
      sceneTexture: new THREE.Uniform(this.sceneTarget.texture),
      blurTexture1: new THREE.Uniform(this.verticalBlurTargets[0].texture),
      blurTexture2: new THREE.Uniform(this.verticalBlurTargets[1].texture),
      blurTexture3: new THREE.Uniform(this.verticalBlurTargets[2].texture),
      blurTexture4: new THREE.Uniform(this.verticalBlurTargets[3].texture),
      blurTexture5: new THREE.Uniform(this.verticalBlurTargets[4].texture),
      bloomStrength: new THREE.Uniform(this.configurations.bloomStrength),
      exposure: new THREE.Uniform(this.configurations.exposure),
      gamma: new THREE.Uniform(this.configurations.gamma),
      bloomFactors: new THREE.Uniform(this.configurations.bloomFactors),
      bloomTintColors: new THREE.Uniform(this.configurations.bloomTintColors)
    }
  });
  this.combinerQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.combinerMaterial);
  this.combinerMaterial.uniforms.modelViewMatrix.value = this.combinerQuad.modelViewMatrix;
  this.combinerScene = new THREE.Scene();
  this.combinerScene.add(this.combinerQuad);
}

Bloom.prototype.generateDirectPass = function(){
  this.sceneTarget = new THREE.WebGLRenderTarget(renderer.getCurrentViewport().z, renderer.getCurrentViewport().w, this.rtParameters);
  this.sceneTarget.texture.generateMipmaps = false;
}

Bloom.prototype.generateBlurPass = function(){
  this.blurPassDirectionX = new THREE.Vector2(1, 0);
  this.blurPassDirectionY = new THREE.Vector2(0, 1);
  this.blurPassMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomBlurPassVertexShader,
    fragmentShader: ShaderContent.bloomBlurPassFragmentShader,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(),
      projectionMatrix: new THREE.Uniform(orthographicCamera.projectionMatrix),
      inputTexture: new THREE.Uniform(),
      numberOfTap: new THREE.Uniform(20),
      resolution: new THREE.Uniform(new THREE.Vector2()),
      direction: new THREE.Uniform(new THREE.Vector2()),
    }
  });
  this.blurPassQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.blurPassMaterial);
  this.blurPassMaterial.uniforms.modelViewMatrix.value = this.blurPassQuad.modelViewMatrix;
  this.blurPassScene = new THREE.Scene();
  this.blurPassScene.add(this.blurPassQuad);
  this.horizontalBlurTargets = [], this.verticalBlurTargets = [];
  var coef = 2;
  for (var i = 0; i<this.configurations.blurStepCount; i++){
    var rt1 = new THREE.WebGLRenderTarget(renderer.getCurrentViewport().z / coef, renderer.getCurrentViewport().w / coef, this.rtParameters);
    var rt2 = new THREE.WebGLRenderTarget(renderer.getCurrentViewport().z / coef, renderer.getCurrentViewport().w / coef, this.rtParameters);
    rt1.texture.generateMipmaps = false;
    rt2.texture.generateMipmaps = false;
    this.horizontalBlurTargets.push(rt1);
    this.verticalBlurTargets.push(rt2);
    coef = coef * 2;
  }
}

Bloom.prototype.generateBrightPass = function(){
  this.brightPassMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomBrightPassVertexShader,
    fragmentShader: ShaderContent.bloomBrightPassFragmentShader,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(),
      projectionMatrix: new THREE.Uniform(orthographicCamera.projectionMatrix),
      sceneTexture: new THREE.Uniform(),
      threshold: new THREE.Uniform(this.configurations.threshold)
    }
  });
  this.brightPassQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.brightPassMaterial);
  this.brightPassMaterial.uniforms.modelViewMatrix.value = this.brightPassQuad.modelViewMatrix;
  this.brightPassMaterial.uniforms.sceneTexture.value = this.sceneTarget.texture;
  this.brightPassScene = new THREE.Scene();
  this.brightPassScene.add(this.brightPassQuad);
  this.brightTarget = new THREE.WebGLRenderTarget(renderer.getCurrentViewport().z / 2, renderer.getCurrentViewport().w / 2, this.rtParameters);
  this.brightTarget.texture.generateMipmaps = false;
}

Bloom.prototype.setSize = function(width, height){
  this.sceneTarget.setSize(width, height);
  this.brightTarget.setSize(width / 2, height / 2);
  var coef = 2;
  for (var i = 0; i<this.configurations.blurStepCount; i++){
    this.horizontalBlurTargets[i].setSize(width/coef, height/coef);
    this.verticalBlurTargets[i].setSize(width/coef, height/coef);
    coef = coef * 2;
  }
}

Bloom.prototype.setViewport = function(x, y, z, w){
  this.setSize(z, w);
}

Bloom.prototype.setPixelRatio = function(ratio){
  this.setSize(renderer.getCurrentViewport().z, renderer.getCurrentViewport().w);
}

Bloom.prototype.render = function(){
  this.directPass();
  this.brightPass();
  this.blurPass();
  this.combinerPass();
}
