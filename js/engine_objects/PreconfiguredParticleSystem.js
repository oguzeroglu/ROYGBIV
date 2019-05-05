var PreconfiguredParticleSystem = function(name, type, params){
  this.name = name;
  this.type = type;
  this.params = {}
  for (var key in params){
    this.params[key] = params[key];
  }
  this.setMaxPSTime(params.maxPSTime);
}

PreconfiguredParticleSystem.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.type = this.type;
  exportObj.params = this.params;
  exportObj.isCollidable = this.isCollidable;
  exportObj.maxPSTime = this.maxPSTime;
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
    ps.maxPSTime = (!(typeof this.maxPSTime == UNDEFINED))? this.maxPSTime: DEFAULT_MAX_PS_TIME;
    if (ps.creationConfigurations){
      ps.creationConfigurations.maxPSTime = ps.maxPSTime;
    }
    return ps;
  }
  throw new Error("Unknown type.");
}

PreconfiguredParticleSystem.prototype.setMaxPSTime = function(maxPSTime){
  this.maxPSTime = isNaN(maxPSTime)? DEFAULT_MAX_PS_TIME: maxPSTime;
  this.params.maxPSTime = this.maxPSTime;
}

PreconfiguredParticleSystem.prototype.setCollidableStatus = function(isCollidable){
  this.isCollidable = isCollidable;
}
