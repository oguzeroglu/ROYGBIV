var Bloom = function(){
  this.configurations = {
    blurAllocationAmount: 5,
    blurAmount: 5,
    texturePassDivisionCoef: 5,
    tapAmount: 13,
    threshold: 1,
    optimized: true,
    texturePassDivisionThresholdCoef: 2
  }
  this.rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.generateDirectPass();
  this.generateBrightPass();
  this.generateBlurPass();
  this.generateTexturePass();
}

Bloom.prototype.setOptimizationMode = function(isOn){
  this.configurations.optimized = isOn;
  if (isOn){
    this.blurPassMaterial.uniforms.isOptimizedFlag.value = 10;
  }else{
    this.blurPassMaterial.uniforms.isOptimizedFlag.value = -10;
  }
}

Bloom.prototype.setThreshold = function(threshold){
  this.configurations.threshold = threshold;
  this.brightPassMaterial.uniforms.threshold.value = threshold;
  this.texturePassMaterial.uniforms.threshold.value = threshold / this.configurations.texturePassDivisionCoef;
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
  throw new Error("[!] setBlurTap error: Undefined tap.");
}

Bloom.prototype.setBlurDirection = function(isX){
  if (isX){
    this.blurPassMaterial.uniforms.direction.value = this.blurPassDirectionX;
  }else{
    this.blurPassMaterial.uniforms.direction.value = this.blurPassDirectionY;
  }
}

Bloom.prototype.texturePass = function(){
  renderer.webglRenderer.render(this.texturePassScene, orthographicCamera, this.texturePassTarget);
  this.blurPassMaterial.uniforms.optimizationTexture.value = this.texturePassTarget.texture;
}

Bloom.prototype.blurPass = function(){
  renderer.webglRenderer.render(this.blurPassScene, orthographicCamera);
  this.blurPassMaterial.uniforms.inputTexture.value = this.brightTarget.texture;
  this.blurPassMaterial.uniforms.resolution.value.set(this.brightTarget.width, this.brightTarget.height);
  for (var i = 0 ; i <this.configurations.blurAmount; i++){
    this.setBlurDirection(true);
    renderer.webglRenderer.render(this.blurPassScene, orthographicCamera, this.horizontalBlurTargets[i]);
    var rt = this.horizontalBlurTargets[i];
    this.blurPassMaterial.uniforms.inputTexture.value = rt.texture;
    this.blurPassMaterial.uniforms.resolution.value.set(rt.width, rt.height);
    this.setBlurDirection(false);
    if (i != this.configurations.blurAmount-1){
      renderer.webglRenderer.render(this.blurPassScene, orthographicCamera, this.verticalBlurTargets[i]);
    }else{
      renderer.webglRenderer.render(this.blurPassScene, orthographicCamera);
    }
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

Bloom.prototype.generateDirectPass = function(){
  this.sceneTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters);
}

Bloom.prototype.generateTexturePass = function(){
  this.texturePassTarget = new THREE.WebGLRenderTarget(window.innerWidth / this.configurations.texturePassDivisionCoef, window.innerHeight / this.configurations.texturePassDivisionCoef);
  this.texturePassMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomTexturePassVertexShader,
    fragmentShader: ShaderContent.bloomTexturePassFragmentShader,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(),
      projectionMatrix: new THREE.Uniform(orthographicCamera.projectionMatrix),
      inputTexture: new THREE.Uniform(),
      threshold: new THREE.Uniform(this.configurations.threshold / this.configurations.texturePassDivisionCoef)
    }
  });
  this.texturePassQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.texturePassMaterial);
  this.texturePassMaterial.uniforms.modelViewMatrix.value = this.texturePassQuad.modelViewMatrix;
  this.texturePassMaterial.uniforms.inputTexture.value = this.sceneTarget.texture;
  this.texturePassScene = new THREE.Scene();
  this.texturePassScene.add(this.texturePassQuad);
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
      optimizationTexture: new THREE.Uniform(),
      isOptimizedFlag: new THREE.Uniform(10),
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
  for (var i = 0; i<this.configurations.blurAllocationAmount; i++){
    this.horizontalBlurTargets.push(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters));
    this.verticalBlurTargets.push(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters));
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
  this.brightTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters);
}

Bloom.prototype.setSize = function(width, height){
  this.sceneTarget.setSize(width, height);
  this.brightTarget.setSize(width, height);
  this.texturePassTarget.setSize(width / this.configurations.texturePassDivisionCoef, height / this.configurations.texturePassDivisionCoef);
  for (var i = 0; i<this.configurations.blurAllocationAmount; i++){
    this.horizontalBlurTargets[i].setSize(width, height);
    this.verticalBlurTargets[i].setSize(width, height);
  }
}

Bloom.prototype.setViewport = function(x, y, z, w){
  this.sceneTarget.viewport.set(x, y, z, w);
  this.brightTarget.viewport.set(x, y, z, w);
  this.texturePassTarget.viewport.set(x, y, z / this.configurations.texturePassDivisionCoef, w / this.configurations.texturePassDivisionCoef);
  for (var i = 0; i<this.configurations.blurAllocationAmount; i++){
    this.horizontalBlurTargets[i].viewport.set(x, y, z, w);
    this.verticalBlurTargets[i].viewport.set(x, y, z, w);
  }
}

Bloom.prototype.setPixelRatio = function(ratio){

}

Bloom.prototype.render = function(){
  this.directPass();
  if (this.configurations.optimized){
    this.texturePass();
  }
  this.brightPass();
  this.blurPass();
}
