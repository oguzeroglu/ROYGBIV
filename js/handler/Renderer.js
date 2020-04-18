var Renderer = function(){
  this.webglRenderer = new THREE.WebGLRenderer({canvas: canvas});
}

Renderer.prototype.initEffects = function(){
  this.effects = {bloom: new Bloom()};
  bloom = this.effects.bloom;
  this.mandatoryEffectMethods = ["setSize", "setViewport", "setPixelRatio", "render", "showConfigurations", "hideConfigurations", "export", "load", "reset"];
  for (var effectName in this.effects){
    for (var i = 0; i<this.mandatoryEffectMethods.length; i++){
      if (!this.effects[effectName][this.mandatoryEffectMethods[i]]){
        console.error("[!] Renderer error: effect "+effectName+" does not have "+this.mandatoryEffectMethods[i]+" implemented.");
      }
    }
  }
}

Renderer.prototype.render = function(scene, camera){
  if (this.bloomOn){
    this.effects.bloom.render();
    return;
  }
  this.webglRenderer.render(scene, camera);
}

Renderer.prototype.setViewport = function(x, y, z, w){
  this.webglRenderer.setViewport(x, y, z, w);
  for (var effectName in this.effects){
    this.effects[effectName].setViewport(x, y, z, w);
  }
}

Renderer.prototype.getCurrentViewport = function(){
  return this.webglRenderer.getCurrentViewport();
}

Renderer.prototype.isHighPrecisionSupported = function(){
  return !(
    this.webglRenderer.context.getShaderPrecisionFormat(this.webglRenderer.context.VERTEX_SHADER, this.webglRenderer.context.HIGH_FLOAT).precision <= 0 ||
    this.webglRenderer.context.getShaderPrecisionFormat(this.webglRenderer.context.FRAGMENT_SHADER, this.webglRenderer.context.HIGH_FLOAT).precision <= 0
  );
}

Renderer.prototype.isInstancingSupported = function(){
  return (!(this.webglRenderer.context.getExtension("ANGLE_instanced_arrays") == null));
}

Renderer.prototype.isASTCSupported = function(){
  return (!(this.webglRenderer.context.getExtension("WEBGL_compressed_texture_astc") == null));
}

Renderer.prototype.isS3TCSupported = function(){
  return (!(this.webglRenderer.context.getExtension("WEBGL_compressed_texture_s3tc") == null));
}

Renderer.prototype.isPVRTCSupported = function(){
  return (!(this.webglRenderer.context.getExtension("WEBGL_compressed_texture_pvrtc") == null));
}

Renderer.prototype.isVertexShaderTextureFetchSupported = function(){
  return (this.webglRenderer.context.getParameter(this.webglRenderer.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0);
}

Renderer.prototype.getMaxVertexAttribs = function(){
  return this.webglRenderer.capabilities.maxAttributes;
}

Renderer.prototype.getMaxVertexUniformVectors = function(){
  return this.webglRenderer.context.getParameter(this.webglRenderer.context.MAX_VERTEX_UNIFORM_VECTORS);
}

Renderer.prototype.getBoundingClientRect = function(){
  return this.webglRenderer.domElement.getBoundingClientRect();
}

Renderer.prototype.setSize = function(width, height){
  this.webglRenderer.setSize(width, height);
  for (var effectName in this.effects){
    this.effects[effectName].setSize(width, height);
  }
}

Renderer.prototype.setPixelRatio = function(ratio){
  this.webglRenderer.setPixelRatio(ratio);
  GLOBAL_SCREEN_RESOLUTION_UNIFORM.value = ratio;
  for (var effectName in this.effects){
    this.effects[effectName].setPixelRatio(ratio);
  }
}

Renderer.prototype.getContext = function(){
  return this.webglRenderer.context;
}
