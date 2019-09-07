var SkyboxHandler = function(){
  GLOBAL_CUBE_TEXTURE_UNIFORM = new THREE.Uniform();
  this.visible = false;
}

SkyboxHandler.prototype.import = function(obj){
  if (obj.isVisible){
    this.map(skyBoxes[obj.mappedSkyboxName]);
  }
}

SkyboxHandler.prototype.export = function(){
  return {isVisible: this.isVisible(), mappedSkyboxName: this.mappedSkyboxName};
}

SkyboxHandler.prototype.unmap = function(){
  if (!this.skyboxMesh || typeof this.getMappedSkyboxName() == UNDEFINED){
    return;
  }
  scene.remove(this.skyboxMesh);
  skyBoxes[this.mappedSkyboxName].dispose();
  this.skyboxMesh.geometry.dispose();
  this.skyboxMesh.material.dispose();
  this.visible = false;
  delete this.mappedSkyboxName;
}

SkyboxHandler.prototype.map = function(skybox){
  if (this.isVisible()){
    this.unmap();
  }
  this.generateMesh(skybox);
  scene.add(this.getMesh());
  this.visible = true;
  this.mappedSkyboxName = skybox.name;
}

SkyboxHandler.prototype.generateMesh = function(skybox){
  var geomKey = ("BoxBufferGeometry" + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE + "1" + PIPE + "1" + PIPE + "1");
  var skyboxBufferGeometry = geometryCache[geomKey];
  if (!skyboxBufferGeometry){
    skyboxBufferGeometry = new THREE.BoxBufferGeometry(skyboxDistance, skyboxDistance, skyboxDistance);
    geometryCache[geomKey] = skyboxBufferGeometry;
  }
  this.skyboxMesh = new MeshGenerator(skyboxBufferGeometry, null).generateSkybox(skybox, false);
}

SkyboxHandler.prototype.getMappedSkyboxName = function(){
  return this.mappedSkyboxName;
}

SkyboxHandler.prototype.isVisible = function(){
  return this.visible;
}

SkyboxHandler.prototype.getMesh = function(){
  return this.skyboxMesh;
}

SkyboxHandler.prototype.reset = function(){
  if (this.isVisible()){
    this.unmap();
    delete this.mappedSkyboxName;
  }
}

SkyboxHandler.prototype.update = function(){
  if (this.isVisible()){
    this.getMesh().position.copy(camera.position);
  }
}

SkyboxHandler.prototype.destroySkybox = function(skybox){
  skybox.dispose();
  if (skybox.name == this.getMappedSkyboxName()){
    this.unmap();
  }
  delete skyBoxes[skybox.name];
}
