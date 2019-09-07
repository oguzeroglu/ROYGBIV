var PreconfiguredParticleSystem = function(name, type, params){
  this.name = name;
  this.type = type;
  this.params = JSON.parse(JSON.stringify(params));
  this.setMaxPSTime(params.maxPSTime);
  this.hasParticleCollision = this.hasCollidableParticles();
}

PreconfiguredParticleSystem.prototype.getUsedTextureName = function(){
  if (this.type == "CUSTOM"){
    if (this.params.material.textureName != ""){
      return this.params.material.textureName;
    }
    return null;
  }
  if (this.params.textureName != ""){
    return this.params.textureName;
  }
  return null;
}

PreconfiguredParticleSystem.prototype.hasCollidableParticles = function(){
  switch(this.type){
    case "SMOKE": return false;
    case "TRAIL": return false;
    case "PLASMA": return false;
    case "FIRE_EXPLOSION": return false;
    case "MAGIC_CIRCLE": return false;
    case "CIRC_EXPLOSION": return false;
    case "DYNAMIC_TRAIL": return false;
    case "LASER": return false;
    case "CUSTOM": return this.params.collision.type != "NONE";
    case "WATERFALL": return this.params.rewindOnCollided;
    case "SNOW": return this.params.rewindOnCollided;
    case "CONFETTI": return this.params.hasParticleCollision;
    default: throw new Error("Not implemented.");
  }
}

PreconfiguredParticleSystem.prototype.destroy = function(){
  delete preConfiguredParticleSystems[this.name];
}

PreconfiguredParticleSystem.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.type = this.type;
  exportObj.params = this.params;
  exportObj.isCollidable = this.isCollidable;
  exportObj.excludeFromMerge = this.excludeFromMerge;
  exportObj.scale = this.scale;
  exportObj.maxPSTime = this.maxPSTime;
  exportObj.preConfiguredParticleSystemPoolName = this.preConfiguredParticleSystemPoolName;
  exportObj.blendingIntVal = this.blendingIntVal;
  exportObj.blendingStrVal = this.blendingStrVal;
  return exportObj;
}

PreconfiguredParticleSystem.prototype.getParticleSystem = function(){
  var ps;
  switch(this.type){
    case "CUSTOM": ps = particleSystemGenerator.generateCustomParticleSystem(this.params); break;
    case "MAGIC_CIRCLE": ps = particleSystemGenerator.generateMagicCircle(this.params); break;
    case "PLASMA": ps = particleSystemGenerator.generatePlasma(this.params); break;
    case "SMOKE": ps = particleSystemGenerator.generateSmoke(this.params); break;
    case "CONFETTI": ps = particleSystemGenerator.generateConfettiExplosion(this.params); break;
    case "WATERFALL": ps = particleSystemGenerator.generateWaterfall(this.params); break;
    case "SNOW": ps = particleSystemGenerator.generateSnow(this.params); break;
    case "FIRE_EXPLOSION": ps = particleSystemGenerator.generateFireExplosion(this.params); break;
    case "TRAIL": ps = particleSystemGenerator.generateTrail(this.params); break;
    case "CIRC_EXPLOSION": ps = particleSystemGenerator.generateCircularExplosion(this.params); break;
    case "DYNAMIC_TRAIL": ps = particleSystemGenerator.generateDynamicTrail(this.params); break;
    case "LASER": ps = particleSystemGenerator.generateLaser(this.params); break;
  }
  if (ps){
    ps.isCollidable = this.isCollidable;
    ps.excludeFromMerge = this.excludeFromMerge;
    ps.maxPSTime = (!(typeof this.maxPSTime == UNDEFINED))? this.maxPSTime: DEFAULT_MAX_PS_TIME;
    if (ps.creationConfigurations){
      ps.creationConfigurations.maxPSTime = ps.maxPSTime;
    }
    if (!(typeof this.blendingIntVal == UNDEFINED)){
      ps.setBlending(this.blendingIntVal);
    }
    if (!(typeof this.scale == UNDEFINED)){
      ps.mesh.scale.set(this.scale, this.scale, this.scale);
    }
    if (this.getUsedTextureName() != null){
      ps.textureName = this.getUsedTextureName();
    }
    ps.registeredSceneName = this.registeredSceneName;
    return ps;
  }
  throw new Error("Unknown type.");
}

PreconfiguredParticleSystem.prototype.setBlending = function(intVal, strVal){
  this.blendingIntVal = intVal;
  this.blendingStrVal = strVal;
}

PreconfiguredParticleSystem.prototype.setMaxPSTime = function(maxPSTime){
  this.maxPSTime = isNaN(maxPSTime)? DEFAULT_MAX_PS_TIME: maxPSTime;
  this.params.maxPSTime = this.maxPSTime;
}

PreconfiguredParticleSystem.prototype.setCollidableStatus = function(isCollidable){
  this.isCollidable = isCollidable;
}

PreconfiguredParticleSystem.prototype.setExcludeFromMergeStatus = function(excludeFromMerge){
  this.excludeFromMerge = excludeFromMerge;
}

PreconfiguredParticleSystem.prototype.setScale = function(scale){
  this.scale = (typeof scale == UNDEFINED)? 1: scale;
}
