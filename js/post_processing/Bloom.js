var Bloom = function(){
  var rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.sceneTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
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

Bloom.prototype.render = function(){
  renderer.webglRenderer.render(scene, camera, this.sceneTarget);
}
