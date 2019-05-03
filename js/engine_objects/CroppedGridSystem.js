var CroppedGridSystem = function(sizeX, sizeZ, centerX, centerY, centerZ, axis){
  this.sizeX = sizeX;
  this.sizeZ = sizeZ;
  this.centerX = centerX;
  this.centerY = centerY;
  this.centerZ = centerZ;
  this.axis = axis;
}

CroppedGridSystem.prototype.export = function(){
  var exportObj = new Object();
  exportObj.sizeX = this.sizeX;
  exportObj.sizeZ = this.sizeZ;
  exportObj.centerX = this.centerX;
  exportObj.centerY = this.centerY;
  exportObj.centerZ = this.centerZ;
  exportObj.axis = this.axis;
  return exportObj;
}

CroppedGridSystem.prototype.clone = function(){
  return new CroppedGridSystem(this.sizeX, this.sizeZ, this.centerX, this.centerY, this.centerZ, this.axis);
}
