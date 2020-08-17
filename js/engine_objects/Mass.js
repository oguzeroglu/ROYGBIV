var Mass = function(name, center, size){
  this.name = name;
  this.center = center.clone();
  this.size= size.clone();

  if (!(this.size.x == 0 && this.size.y == 0 && this.size.z == 0)){
    this.constructPhysicsBody();
  }
}

Mass.prototype.export = function(){
  return {
    name: this.name,
    centerX: this.center.x,
    centerY: this.center.y,
    centerZ: this.center.z,
    sizeX: this.size.x,
    sizeY: this.size.y,
    sizeZ: this.size.z
  };
}

Mass.prototype.import = function(exportObj){
  this.center.set(exportObj.centerX, exportObj.centerY, exportObj.centerZ);
  this.size.set(exportObj.sizeX, exportObj.sizeY, exportObj.sizeZ);

  this.constructPhysicsBody();
}

Mass.prototype.constructPhysicsBody = function(){
  this.physicsBody = physicsBodyGenerator.generateBoxBody({
    x: this.size.x / 2,
    y: this.size.y / 2,
    z: this.size.z / 2
  });

  this.physicsBody.position.set(this.center.x, this.center.y, this.center.z);
}
