var FXAA = function(){
  this.rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
  this.fxaaCount = 3;

  this.generateDirectPass();
  this.generateFXAAPass();

  this.selectedDevicePixelRatio = window.devicePixelRatio > 2? window.devicePixelRatio: 2;
}

FXAA.prototype.showConfigurations = function(){
  return null;
};
FXAA.prototype.hideConfigurations = function(){
  return null;
};
FXAA.prototype.export = function(){
  return {};
};
FXAA.prototype.load = noop;
FXAA.prototype.reset = noop;

FXAA.prototype.generateDirectPass = function(){
  this.sceneTarget = new THREE.WebGLRenderTarget(renderer.getCurrentViewport().z * this.selectedDevicePixelRatio, renderer.getCurrentViewport().w * this.selectedDevicePixelRatio, this.rtParameters);
  this.sceneTarget.texture.generateMipmaps = false;
}

FXAA.prototype.generateFXAAPass = function(){
  this.fxaaMaterial = new THREE.ShaderMaterial(THREE.FXAAShader);
  this.fxaaMaterial.uniforms.resolution.value.x = 1 / this.sceneTarget.width;
  this.fxaaMaterial.uniforms.resolution.value.y = 1 / this.sceneTarget.height;
  this.fxaaQuad = new THREE.Mesh(REUSABLE_QUAD_GEOMETRY, this.fxaaMaterial);
  this.fxaaScene = new THREE.Scene();
  this.fxaaScene.add(this.fxaaQuad);

  this.fxaaTargets = [];
  for (var i = 0; i < this.fxaaCount; i ++){
    this.fxaaTargets.push(new THREE.WebGLRenderTarget(renderer.getCurrentViewport().z * this.selectedDevicePixelRatio, renderer.getCurrentViewport().w * this.selectedDevicePixelRatio, this.rtParameters));
  }
}

FXAA.prototype.setSize = function(width, height){
  this.sceneTarget.setSize(width * this.selectedDevicePixelRatio, height * this.selectedDevicePixelRatio);
  for (var i = 0; i < this.fxaaCount; i ++){
    this.fxaaTargets[i].setSize(width * this.selectedDevicePixelRatio, height * this.selectedDevicePixelRatio);
  }
  this.fxaaMaterial.uniforms.resolution.value.x = 1 / this.sceneTarget.width;
  this.fxaaMaterial.uniforms.resolution.value.y = 1 / this.sceneTarget.height;
}

FXAA.prototype.setViewport = function(x, y, z, w){
  this.setSize(z, w);
}

FXAA.prototype.setPixelRatio = function(ratio){
  this.setSize(renderer.getCurrentViewport().z, renderer.getCurrentViewport().w);
}

FXAA.prototype.directPass = function(){
  renderer.webglRenderer.render(scene, camera, this.sceneTarget);
}

FXAA.prototype.fxaaPass = function(){
  this.fxaaMaterial.uniforms.tDiffuse.value = this.sceneTarget.texture;
  for (var i = 0; i < smartRenderingHandler.buffer - 1; i ++){
    var fxaaTarget = this.fxaaTargets[i];
    renderer.webglRenderer.render(this.fxaaScene, orthographicCamera, fxaaTarget);
    this.fxaaMaterial.uniforms.tDiffuse.value = fxaaTarget.texture;
  }
  renderer.webglRenderer.render(this.fxaaScene, orthographicCamera);
}

FXAA.prototype.render = function(){
  this.directPass();
  this.fxaaPass();
}
