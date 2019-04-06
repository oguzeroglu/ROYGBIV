var Bloom = function(){
  this.rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.generateDirectPass();
  this.generateBrightPass();
  this.generateBlurPass();
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
  throw new Error("[!] setBlurTap error: Undefined tap.");
}

Bloom.prototype.setBlurDirection = function(isX){
  if (isX){
    this.blurPassMaterial.uniforms.direction.value = this.blurPassDirectionX;
  }else{
    this.blurPassMaterial.uniforms.direction.value = this.blurPassDirectionY;
  }
}

Bloom.prototype.blurPass = function(){
  this.setBlurTap(13);
  this.setBlurDirection(true);
  this.blurPassMaterial.uniforms.inputTexture.value = this.brightTarget.texture;
  this.blurPassMaterial.uniforms.resolution.value.set(this.brightTarget.width, this.brightTarget.height);
  renderer.webglRenderer.render(this.blurPassScene, orthographicCamera, this.blurTargetHorizontal1);
  this.setBlurDirection(false);
  this.blurPassMaterial.uniforms.inputTexture.value = this.blurTargetHorizontal1.texture;
  renderer.webglRenderer.render(this.blurPassScene, orthographicCamera);
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
      numberOfTap: new THREE.Uniform(-1),
      resolution: new THREE.Uniform(new THREE.Vector2()),
      direction: new THREE.Uniform(new THREE.Vector2()),
    }
  });
  this.blurPassQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.blurPassMaterial);
  this.blurPassMaterial.uniforms.modelViewMatrix.value = this.blurPassQuad.modelViewMatrix;
  this.blurPassScene = new THREE.Scene();
  this.blurPassScene.add(this.blurPassQuad);
  this.blurTargetHorizontal1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters);
}

Bloom.prototype.generateBrightPass = function(){
  this.brightPassMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomBrightPassVertexShader,
    fragmentShader: ShaderContent.bloomBrightPassFragmentShader,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(),
      projectionMatrix: new THREE.Uniform(orthographicCamera.projectionMatrix),
      sceneTexture: new THREE.Uniform(),
      threshold: new THREE.Uniform(1)
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
  this.blurTargetHorizontal1.setSize(width, height);
}

Bloom.prototype.setViewport = function(x, y, z, w){
  this.sceneTarget.viewport.set(x, y, z, w);
  this.brightTarget.viewport.set(x, y, z, w);
  this.blurTargetHorizontal1.viewport.set(x, y, z, w);
}

Bloom.prototype.setPixelRatio = function(ratio){

}

Bloom.prototype.setThreshold = function(threshold){
  this.brightPassMaterial.uniforms.threshold.value = threshold;
}

Bloom.prototype.render = function(){
  this.directPass();
  this.brightPass();
  this.blurPass();
}
