var Sprite = function(name){
  this.isSprite = true;
  this.name = name;
  this.geometry = new THREE.PlaneBufferGeometry(5, 5);
  this.mesh = new MeshGenerator().generateSprite(this);
  this.reusableVector1 = new THREE.Vector2();
  this.reusableVector2 = new THREE.Vector2();
  this.reusableVector3 = new THREE.Vector2();
  this.reusableVector4 = new THREE.Vector2();
  this.reusableVector5 = new THREE.Vector2();
  this.handleRectangle();
  scene.add(this.mesh);
}

Sprite.prototype.getCornerPoint = function(point){
  // CONVERTED FROM GLSL SHADER CODE
  var scaledX = this.mesh.material.uniforms.scale.value.x * point.x;
  var scaledY = this.mesh.material.uniforms.scale.value.y * point.y;
  var rotationAngle = this.mesh.material.uniforms.rotationAngle.value;
  rotationAngle = 360 - rotationAngle;
  var rotationInRadians = rotationAngle * Math.PI / 180;
  this.reusableVector5.set(scaledX * Math.cos(rotationInRadians) + scaledY * Math.sin(rotationInRadians), scaledY * Math.cos(rotationInRadians) - scaledX * Math.sin(rotationInRadians));
  var rotated = this.reusableVector5;
  var currentViewport = this.mesh.material.uniforms.currentViewport.value;
  var oldPosX = ((currentViewport.z - currentViewport.x) / 2.0) + currentViewport.x + rotated.x;
  var oldPosY = ((currentViewport.w - currentViewport.y) / 2.0) + currentViewport.y + rotated.y;
  var x = (((oldPosX - currentViewport.x) * 2.0) / currentViewport.z) - 1.0;
  var y = (((oldPosY - currentViewport.y) * 2.0) / currentViewport.w) - 1.0;
  point.x = x;
  point.y = y;
}

Sprite.prototype.handleRectangle = function(){
  if (!this.rectangle){
    this.rectangle = new Rectangle(0, 0, 0, 0);
  }
  var points = this.mesh.geometry.attributes.position.array;
  this.reusableVector1.set(points[0], points[1]);
  this.reusableVector2.set(points[3], points[4]);
  this.reusableVector3.set(points[6], points[7]);
  this.reusableVector4.set(points[9], points[10]);
  this.getCornerPoint(this.reusableVector1);
  this.getCornerPoint(this.reusableVector2);
  this.getCornerPoint(this.reusableVector3);
  this.getCornerPoint(this.reusableVector4);
  var minX = Math.min(this.reusableVector1.x, this.reusableVector2.x, this.reusableVector3.x, this.reusableVector4.x);
  var minY = Math.min(this.reusableVector1.y, this.reusableVector2.y, this.reusableVector3.y, this.reusableVector4.y);
  var maxX = Math.max(this.reusableVector1.x, this.reusableVector2.x, this.reusableVector3.x, this.reusableVector4.x);
  var maxY = Math.max(this.reusableVector1.y, this.reusableVector2.y, this.reusableVector3.y, this.reusableVector4.y);
  this.rectangle = this.rectangle.set(minX, minY, maxX, maxY, maxX - minX, maxY - minY);
  this.rectangle.updateMesh(0.005);
}

Sprite.prototype.setScale = function(scaleX, scaleY){
  this.mesh.material.uniforms.scale.value.set(scaleX, scaleY);
  this.handleRectangle();
}

Sprite.prototype.setRotation = function(angleInDegrees){
  this.mesh.material.uniforms.rotationAngle.value = angleInDegrees;
  this.handleRectangle();
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
