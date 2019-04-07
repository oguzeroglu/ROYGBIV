var Bloom = function(){
  this.configurations = {
    blurStepCount: 5,
    tapAmount: 13,
    threshold: 1,
    bloomStrength: 2,
    exposure: 1,
    gamma: 1
  }
  this.rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.generateDirectPass();
  this.generateBrightPass();
  this.generateBlurPass();
  this.generateCombinerPass();
  this.setBlurStepCount(this.configurations.blurStepCount);
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
    this.removeMacro(macro, this.combinerMaterial, false, true);
  }
  for (var i = 0; i<stepCount; i++){
    var macro = "BLUR_STEP_"+(i+1)+"_ACTIVE";
    this.injectMacro(macro, this.combinerMaterial, false, true);
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

Bloom.prototype.setBlurTap = function(tap){
  this.configurations.tapAmount = tap;
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
      gamma: new THREE.Uniform(this.configurations.gamma)
    }
  });
  this.combinerQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.combinerMaterial);
  this.combinerMaterial.uniforms.modelViewMatrix.value = this.combinerQuad.modelViewMatrix;
  this.combinerScene = new THREE.Scene();
  this.combinerScene.add(this.combinerQuad);
}

Bloom.prototype.generateDirectPass = function(){
  this.sceneTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters);
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
    this.horizontalBlurTargets.push(new THREE.WebGLRenderTarget(window.innerWidth / coef, window.innerHeight / coef, this.rtParameters));
    this.verticalBlurTargets.push(new THREE.WebGLRenderTarget(window.innerWidth / coef, window.innerHeight / coef, this.rtParameters));
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
  this.brightTarget = new THREE.WebGLRenderTarget(window.innerWidth / 2, window.innerHeight / 2, this.rtParameters);
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
  this.sceneTarget.viewport.set(x, y, z, w);
  this.brightTarget.viewport.set(x, y, z / 2, w / 2);
  var coef = 2;
  for (var i = 0; i<this.configurations.blurStepCount; i++){
    this.horizontalBlurTargets[i].viewport.set(x, y, z/coef, w/coef);
    this.verticalBlurTargets[i].viewport.set(x, y, z/coef, w/coef);
    coef = coef * 2;
  }
}

Bloom.prototype.setPixelRatio = function(ratio){

}

Bloom.prototype.render = function(){
  this.directPass();
  this.brightPass();
  this.blurPass();
  this.combinerPass();
}

Bloom.prototype.injectMacro = function(macro, material, insertVertexShader, insertFragmentShader){
  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace(
      "#define INSERTION", "#define INSERTION\n#define "+macro
    )
  };
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace(
      "#define INSERTION", "#define INSERTION\n#define "+macro
    )
  };
  material.needsUpdate = true;
}

Bloom.prototype.removeMacro = function(macro, material, removeVertexShader, removeFragmentShader){
  if (removeVertexShader){
    material.vertexShader = material.vertexShader.replace("\n#define "+macro, "");
  }
  if (removeFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n#define "+macro, "");
  }
  material.needsUpdate = true;
}
