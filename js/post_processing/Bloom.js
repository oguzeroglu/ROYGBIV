var Bloom = function(){
  var rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.blurTargetScaleCoef = 4;
  this.sceneTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
  this.blurTarget = new THREE.WebGLRenderTarget(window.innerWidth / this.blurTargetScaleCoef, window.innerHeight / this.blurTargetScaleCoef);
  var blurMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.bloomBlurVertexShader,
    fragmentShader: ShaderContent.bloomBlurFragmentShader,
    uniforms: {modelViewMatrix: new THREE.Uniform(), projectionMatrix: new THREE.Uniform(), sceneTexture: new THREE.Uniform()}
  });
  this.blurQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, blurMaterial);
  blurMaterial.uniforms.projectionMatrix.value = orthographicCamera.projectionMatrix;
  blurMaterial.uniforms.modelViewMatrix.value = this.blurQuad.modelViewMatrix;
  blurMaterial.uniforms.sceneTexture.value = this.sceneTarget.texture;
  this.blurScene = new THREE.Scene();
  this.blurScene.add(this.blurQuad);
}

Bloom.prototype.setSize = function(width, height){
  this.sceneTarget.setSize(width, height);
  this.blurTarget.setSize(width / this.blurTargetScaleCoef, height / this.blurTargetScaleCoef);
}

Bloom.prototype.setViewport = function(x, y, z, w){
  this.sceneTarget.viewport.set(x, y, z, w);
  this.blurTarget.viewport.set(x, y, z / this.blurTargetScaleCoef, w / this.blurTargetScaleCoef);
}

Bloom.prototype.setPixelRatio = function(ratio){

}

Bloom.prototype.render = function(){
  renderer.webglRenderer.render(scene, camera, this.sceneTarget);
  renderer.webglRenderer.render(this.blurScene, orthographicCamera, this.blurTarget);
}
