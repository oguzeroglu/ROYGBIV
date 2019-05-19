var MuzzleFlash = function(name, refPreconfiguredPS, psCount, psTime){
  this.name = name;
  this.refPreconfiguredPS = refPreconfiguredPS;
  this.psCount = psCount;
  this.psTime = psTime;
  this.tick = 0;
  this.particleIndex = 0;
  this.particleSystems = particleSystemGenerator.generateSimilarCopies(refPreconfiguredPS, psCount);
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].maxPSTime = psTime;
    this.particleSystems[i].mesh.position.set(0, 0, 0);
  }
}

MuzzleFlash.prototype.export = function(){
  var exportObj = new Object();
  exportObj.refPreconfiguredPSName = this.refPreconfiguredPS.name;
  exportObj.psCount = this.psCount;
  exportObj.psTime = this.psTime;
  return exportObj;
}

MuzzleFlash.prototype.init = function(){
  this.tick = 0;
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].tick = 0;
  }
}

MuzzleFlash.prototype.hide = function(){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.visible = false;
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
