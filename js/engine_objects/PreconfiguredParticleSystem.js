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
  exportObj.isCollidable = this.isCollidable;
  return exportObj;
}

PreconfiguredParticleSystem.prototype.getParticleSystem = function(){
  var ps;
  switch(this.type){
    case "MAGIC_CIRCLE": ps = particleSystemGenerator.generateMagicCircle(this.params); break;
    case "PLASMA": ps = particleSystemGenerator.generatePlasma(this.params); break;
    case "SMOKE": ps = particleSystemGenerator.generateSmoke(this.params); break;
    case "CONFETTI": ps = particleSystemGenerator.generateConfettiExplosion(this.params); break;
  }
  if (ps){
    ps.isCollidable = this.isCollidable;
    return ps;
  }
  throw new Error("Unknown type.");
}

PreconfiguredParticleSystem.prototype.setCollidableStatus = function(isCollidable){
  this.isCollidable = isCollidable;
}
