var ParticleSystemPool = function(name){
  this.name = name;
  this.particleSystems = new Object();
  this.availableParticleSystems = new Object();
}

ParticleSystemPool.prototype.add = function(particleSystem){
  this.particleSystems[particleSystem.name] = particleSystem;
  if (!particleSystem.mesh.visible){
    this.availableParticleSystems[particleSystem.name] = particleSystem;
  }
  particleSystem.psPool = this.name;
}

ParticleSystemPool.prototype.get = function(){
  for (var psName in this.availableParticleSystems){
    var ps = this.availableParticleSystems[psName];
    delete this.availableParticleSystems[psName];
    return ps;
  }
  return false;
}

ParticleSystemPool.prototype.remove = function(particleSystem){
  delete this.particleSystems[particleSystem.name];
  delete this.availableParticleSystems[particleSystem.name];
  delete particleSystem.psPool;
}

ParticleSystemPool.prototype.destroy = function(){
  for (var psName in this.particleSystems){
    delete this.particleSystems[psName].psPool;
    delete this.particleSystems[psName];
    delete this.availableParticleSystems[psName];
  }
  delete particleSystemPools[this.name];
  this.destroyed = true;
}

ParticleSystemPool.prototype.notifyPSAvailable = function(particleSystem){
  this.availableParticleSystems[particleSystem.name] = particleSystem;
}
