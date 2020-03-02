var BasicMaterial = function(parameters){
  this.isBasicMaterial = true;
  // name
  this.roygbivMaterialName = parameters.name;
  // color
  this.textColor = parameters.color;
  this.color = new THREE.Color(parameters.color);
  // alpha
  if (typeof parameters.alpha == UNDEFINED){
    this.alpha = 1;
  }else{
    this.alpha = parameters.alpha;
  }
  // aoMapIntensity
  if (typeof parameters.aoMapIntensity == UNDEFINED){
    this.aoMapIntensity = 1;
  }else{
    this.aoMapIntensity = parameters.aoMapIntensity;
  }
  // emissiveIntensity
  if (typeof parameters.emissiveIntensity == UNDEFINED){
    this.emissiveIntensity = 1;
  }else{
    this.emissiveIntensity = parameters.emissiveIntensity;
  }
  // emissiveColor
  if (typeof parameters.emissiveColor == UNDEFINED){
    this.emissiveColor = "#ffffff";
  }else{
    this.emissiveColor = parameters.emissiveColor;
  }
}

BasicMaterial.prototype.export = function(){
  var exportObj = new Object();
  var colorHexString = this.color.toArray();
  var opacity = this.opacity;
  var aoMapIntensity = this.aoMapIntensity;
  exportObj["colorHexString"] = colorHexString;
  exportObj["opacity"] = opacity;
  exportObj["aoMapIntensity"] = aoMapIntensity;
  exportObj["textColor"] = this.textColor;
  exportObj["materialType"] = "BASIC";

  exportObj.roygbivMaterialName = this.roygbivMaterialName;
  return exportObj;
}
