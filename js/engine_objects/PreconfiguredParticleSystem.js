var PreconfiguredParticleSystem = function(name, type, params){
  this.name = name;
  this.type = type;
  this.params = {}
  for (var key in params){
    this.params[key] = params[key];
  }
}

PreconfiguredParticleSystem.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.type = this.type;
  exportObj.params = this.params;
  return exportObj;
}
