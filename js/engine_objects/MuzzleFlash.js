var MuzzleFlash = function(refPreconfiguredPS, psCount, psTime){
  this.refPreconfiguredPS = refPreconfiguredPS;
  this.psCount = psCount;
  this.psTime = psTime;
  this.tick = 0;
  this.particleIndex = 0;
  this.particleSystems = particleSystemGenerator.generateSimilarCopies(refPreconfiguredPS, psCount);
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].maxPSTime = psTime;
  }
}

MuzzleFlash.prototype.destroy = function(){
  for (var i = 0 ;i<this.particleSystems.length; i++){
    this.particleSystems[i].destroy();
  }
}

MuzzleFlash.prototype.update = function(){
  var ps = this.particleSystems[this.particleIndex];
  ps.mesh.visible = true;
  ps.update();
  this.tick += (1/60);
  if (this.tick > this.psTime){
    this.tick = 0;
    ps.mesh.visible = false;
    this.particleIndex ++;
    if (this.particleIndex >= this.psCount){
      this.particleIndex = 0;
    }
  }
}
