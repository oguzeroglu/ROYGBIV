var ModelInstance = function(name, model, mesh, physicsBody, destroyedGrids, gsName){
  this.name = name;
  this.mesh = mesh;
  this.model = model;
  this.physicsBody = physicsBody;
  this.gsName = gsName;
  this.destroyedGrids = destroyedGrids;

  for (var gridName in this.destroyedGrids){
    this.destroyedGrids[gridName].destroyedModelInstance = this.name;
  }
}

ModelInstance.prototype.onTextureAtlasRefreshed = function(){
  if (this.model.getUsedTextures().length == 0){
    return;
  }

  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
}

ModelInstance.prototype.export = function(){
  var exportObj = {
    modelName: this.model.name,
    gsName: this.gsName,
    position: {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z
    },
    quaternion: {
      x: this.mesh.quaternion.x,
      y: this.mesh.quaternion.y,
      z: this.mesh.quaternion.z,
      w: this.mesh.quaternion.w
    },
    scale: this.mesh.scale.x
  };

  var destroyedGridsExport = {};
  for (var gridName in this.destroyedGrids){
    destroyedGridsExport[gridName] = this.destroyedGrids[gridName].export();
  }

  exportObj.destroyedGrids = destroyedGridsExport;

  return exportObj;
}
