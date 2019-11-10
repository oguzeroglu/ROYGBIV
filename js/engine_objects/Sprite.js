var Sprite = function(name){
  this.isSprite = true;
  this.name = name;
  this.geometry = new THREE.PlaneBufferGeometry(5, 5);
  this.mesh = new MeshGenerator().generateSprite(this);
  scene.add(this.mesh);
}

Sprite.prototype.setScale = function(scaleX, scaleY){
  this.mesh.material.uniforms.scale.value.set(scaleX, scaleY);
}

Sprite.prototype.setRotation = function(angleInDegrees){
  this.mesh.material.uniforms.rotationAngle.value = angleInDegrees;
}

Sprite.prototype.getTextureUniform = function(texture){
  if (textureUniformCache[texture.uuid]){
    return textureUniformCache[texture.uuid];
  }
  var uniform = new THREE.Uniform(texture);
  textureUniformCache[texture.uuid] = uniform;
  return uniform;
}

Sprite.prototype.mapTexture = function(texture){
  if (!this.isTextured){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
  }
  this.mesh.material.uniforms.texture = this.getTextureUniform(texture);
  this.mesh.material.needsUpdate = true;
  this.isTextured = true;
}

Sprite.prototype.removeTexture = function(texture){
  if (!this.isTextured){
    return;
  }
  macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.texture;
  this.mesh.material.needsUpdate = true;
  this.isTextured = false;
}
