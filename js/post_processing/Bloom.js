var Bloom = function(){
  var rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.blurSizeCoef = 2;
  this.sceneTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
  this.blurTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  this.blurTarget2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  var blurMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomBlurVertexShader,
    fragmentShader: ShaderContent.bloomBlurFragmentShader,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(), projectionMatrix: new THREE.Uniform(), sceneTexture: new THREE.Uniform(),
      direction: new THREE.Uniform(new THREE.Vector2()), resolution: new THREE.Uniform(new THREE.Vector2()),
      brightnessThreshold: new THREE.Uniform(1), combineTexture: new THREE.Uniform(), combineFlag: new THREE.Uniform(-10.0)
    }
  });
  this.blurQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, blurMaterial);
  blurMaterial.uniforms.projectionMatrix.value = orthographicCamera.projectionMatrix;
  blurMaterial.uniforms.modelViewMatrix.value = this.blurQuad.modelViewMatrix;
  blurMaterial.uniforms.combineTexture.value = this.sceneTarget.texture;
  this.blurScene = new THREE.Scene();
  this.blurScene.add(this.blurQuad);
}

Bloom.prototype.setBrightnessThreshold = function(brightnessThreshold){
  this.blurQuad.material.uniforms.brightnessThreshold.value = brightnessThreshold;
}

Bloom.prototype.setSize = function(width, height){
  this.sceneTarget.setSize(width, height);
  this.blurTarget.setSize(width, height);
  this.blurTarget2.setSize(width, height);
}

Bloom.prototype.setViewport = function(x, y, z, w){
  this.sceneTarget.viewport.set(x, y, z, w);
  this.blurTarget.viewport.set(x, y, z, w);
  this.blurTarget2.viewport.set(x, y, z, w);
}

Bloom.prototype.setPixelRatio = function(ratio){

}

Bloom.prototype.render = function(){
  renderer.webglRenderer.render(scene, camera, this.sceneTarget);
  this.blurQuad.material.uniforms.direction.value.set(1, 0);
  this.blurQuad.material.uniforms.resolution.value.set(this.blurTarget.width / this.blurSizeCoef, this.blurTarget.height / this.blurSizeCoef);
  this.blurQuad.material.uniforms.sceneTexture.value = this.sceneTarget.texture;
  this.blurQuad.material.uniforms.combineFlag.value = -10.0;
  renderer.webglRenderer.render(this.blurScene, orthographicCamera, this.blurTarget);
  this.blurQuad.material.uniforms.direction.value.set(0, 1);
  this.blurQuad.material.uniforms.combineFlag.value = 10.0;
  this.blurQuad.material.uniforms.sceneTexture.value = this.blurTarget.texture;
  renderer.webglRenderer.render(this.blurScene, orthographicCamera);
}
