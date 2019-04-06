var Bloom = function(){
  this.rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.generateDirectPass();
  this.generateBrightPass();
}

Bloom.prototype.brightPass = function(){
  renderer.webglRenderer.render(this.brightPassScene, orthographicCamera);
}

Bloom.prototype.directPass = function(){
  renderer.webglRenderer.render(scene, camera, this.sceneTarget);
}

Bloom.prototype.generateDirectPass = function(){
  this.sceneTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, this.rtParameters);
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
}

Bloom.prototype.setBrightnessThreshold = function(brightnessThreshold){
  this.blurQuad.material.uniforms.brightnessThreshold.value = brightnessThreshold;
}

Bloom.prototype.setSize = function(width, height){
  this.sceneTarget.setSize(width, height);
}

Bloom.prototype.setViewport = function(x, y, z, w){
  this.sceneTarget.viewport.set(x, y, z, w);
}

Bloom.prototype.setPixelRatio = function(ratio){

}

Bloom.prototype.setThreshold = function(threshold){
  this.brightPassMaterial.uniforms.threshold.value = threshold;
}

Bloom.prototype.render = function(){
  this.directPass();
  this.brightPass();
}
