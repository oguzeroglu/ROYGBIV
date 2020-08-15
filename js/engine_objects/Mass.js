var Mass = function(name, center, size){
  this.name = name;
  this.center = center.clone();
  this.size= size.cline();
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
}
