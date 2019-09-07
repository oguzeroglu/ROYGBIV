var ParticleSystemPool = function(name){
  this.isParticleSystemPool = true;
  this.name = name;
  this.particleSystems = new Object();
  this.availableParticleSystems = new Map();
}

ParticleSystemPool.prototype.add = function(particleSystem){
  this.particleSystems[particleSystem.name] = particleSystem;
  if (!particleSystem.mesh.visible){
    this.availableParticleSystems.set(particleSystem.name, particleSystem);
  }
  particleSystem.psPool = this.name;
}

ParticleSystemPool.prototype.get = function(){
  if (this.availableParticleSystems.size == 0 || this.registeredSceneName != sceneHandler.getActiveSceneName()){
    return false;
  }
  var ps = this.availableParticleSystems.values().next().value;
  this.availableParticleSystems.delete(ps.name);
  if (this.consumedCallback && this.availableParticleSystems.size == 0){
    this.consumedCallback();
  }
  return ps;
}

ParticleSystemPool.prototype.remove = function(particleSystem){
  delete this.particleSystems[particleSystem.name];
  this.availableParticleSystems.delete(particleSystem.name);
  delete particleSystem.psPool;
}

ParticleSystemPool.prototype.destroy = function(){
  for (var psName in this.particleSystems){
    delete this.particleSystems[psName].psPool;
    delete this.particleSystems[psName];
    this.availableParticleSystems.delete(psName);
  }
  delete particleSystemPools[this.name];
  this.destroyed = true;
}

ParticleSystemPool.prototype.notifyPSAvailable = function(particleSystem){
  this.availableParticleSystems.set(particleSystem.name, particleSystem);
  if (this.availableCallback && this.availableParticleSystems.size == 1){
    this.availableCallback();
  }
}
