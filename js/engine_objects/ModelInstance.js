var ModelInstance = function(name, model, mesh, physicsBody, destroyedGrids){
  this.name = name;
  this.mesh = mesh;
  this.model = model;
  this.physicsBody = physicsBody;
}

ModelInstance.prototype.onTextureAtlasRefreshed = function(){
  if (this.model.getUsedTextures().length == 0){
    return;
  }

  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
}
