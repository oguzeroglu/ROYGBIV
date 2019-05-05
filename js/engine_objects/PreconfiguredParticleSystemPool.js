var PreconfiguredParticleSystemPool = function(refParticleSystemName, poolName, poolSize){
  this.refParticleSystemName = refParticleSystemName;
  this.poolName = poolName;
  this.poolSize = poolSize;
}

PreconfiguredParticleSystemPool.prototype.destroy = function(){
  delete preConfiguredParticleSystemPools[this.poolName];
  for (var psName in preConfiguredParticleSystems){
    var ps = preConfiguredParticleSystems[psName];
    if (!(typeof ps.preConfiguredParticleSystemPoolName == UNDEFINED) && ps.preConfiguredParticleSystemPoolName == this.poolName){
      delete ps.preConfiguredParticleSystemPoolName;
    }
  }
}

PreconfiguredParticleSystemPool.prototype.export = function(){
  var exportObj = new Object();
  exportObj.refParticleSystemName = this.refParticleSystemName;
  exportObj.poolName = this.poolName;
  exportObj.poolSize = this.poolSize;
  return exportObj;
}
