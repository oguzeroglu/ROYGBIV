var Renderer = function(){
  this.webglRenderer = new THREE.WebGLRenderer({canvas: canvas});
}

Renderer.prototype.render = function(scene, camera){
  this.webglRenderer.render(scene, camera);
}

Renderer.prototype.setViewport = function(x, y, z, w){
  this.webglRenderer.setViewport(x, y, z, w);
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

Renderer.prototype.isDDSSupported = function(){
  return (!(this.webglRenderer.context.getExtension("WEBGL_compressed_texture_s3tc") == null));
}

Renderer.prototype.isVertexShaderTextureFetchSupported = function(){
  return (this.webglRenderer.context.getParameter(this.webglRenderer.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0);
}

Renderer.prototype.getMaxVertexUniformVectors = function(){
  return this.webglRenderer.context.getParameter(this.webglRenderer.context.MAX_VERTEX_UNIFORM_VECTORS);
}

Renderer.prototype.getBoundingClientRect = function(){
  return this.webglRenderer.domElement.getBoundingClientRect();
}

Renderer.prototype.setSize = function(width, height){
  this.webglRenderer.setSize(width, height);
}

Renderer.prototype.setPixelRatio = function(ratio){
  this.webglRenderer.setPixelRatio(ratio);
}

Renderer.prototype.getContext = function(){
  return this.webglRenderer.context;
}
