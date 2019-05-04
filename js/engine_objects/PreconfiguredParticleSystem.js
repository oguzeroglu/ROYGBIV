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

PreconfiguredParticleSystem.prototype.getParticleSystem = function(){
  switch(this.type){
    case "MAGIC_CIRCLE": return particleSystemGenerator.generateMagicCircle(this.params);
    case "PLASMA": return particleSystemGenerator.generatePlasma(this.params);
    case "SMOKE": return particleSystemGenerator.generateSmoke(this.params);
    case "CONFETTI": return particleSystemGenerator.generateConfettiExplosion(this.params);
  }
  throw new Error("Unknown type.");
}
