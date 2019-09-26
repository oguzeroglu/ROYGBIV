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
    this.particleSystems[i].muzzleFlashName = this.name;
  }
}

MuzzleFlash.prototype.destroy = function(){
  delete muzzleFlashes[this.name];
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].destroy();
    delete this.particleSystems[i].muzzleFlashName;
  }
}

MuzzleFlash.prototype.getUsingWeaponName = function(){
  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (obj.isFPSWeapon && obj.muzzleFlashParameters && obj.muzzleFlashParameters.muzzleFlashName){
      if (obj.muzzleFlashParameters.muzzleFlashName == this.name){
        return objName;
      }
    }
  }
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (obj.isFPSWeapon && obj.muzzleFlashParameters && obj.muzzleFlashParameters.muzzleFlashName){
      if (obj.muzzleFlashParameters.muzzleFlashName == this.name){
        return objName;
      }
    }
  }
  return null;
}

MuzzleFlash.prototype.export = function(){
  var exportObj = new Object();
  exportObj.refPreconfiguredPSName = this.refPreconfiguredPS.name;
  exportObj.psCount = this.psCount;
  exportObj.psTime = this.psTime;
  return exportObj;
}

MuzzleFlash.prototype.setRotation = function(rotX, rotY, rotZ){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.rotation.set(rotX, rotY, rotZ);
  }
}

MuzzleFlash.prototype.getRotationX = function(){
  return this.particleSystems[0].mesh.rotation.x;
}

MuzzleFlash.prototype.getRotationY = function(){
  return this.particleSystems[0].mesh.rotation.y;
}

MuzzleFlash.prototype.getRotationZ = function(){
  return this.particleSystems[0].mesh.rotation.z;
}

MuzzleFlash.prototype.rotateX = function(rotation){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.rotateX(rotation);
  }
}

MuzzleFlash.prototype.rotateY = function(rotation){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.rotateY(rotation);
  }
}

MuzzleFlash.prototype.rotateZ = function(rotation){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.rotateZ(rotation);
  }
}

MuzzleFlash.prototype.getScale = function(){
  return this.particleSystems[0].mesh.scale.x;
}

MuzzleFlash.prototype.setScale = function(scale){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.scale.set(scale, scale, scale);
  }
}

MuzzleFlash.prototype.handlePosition = function(ps){
  var position
  if (this.fpsWeaponConfigurations.weaponObj.isAddedObject){
    position = this.fpsWeaponConfigurations.weaponObj.getEndPoint(this.fpsWeaponConfigurations.endpoint);
  }else{
    position = this.fpsWeaponConfigurations.weaponObj.group[this.fpsWeaponConfigurations.childObjName].getEndPoint(this.fpsWeaponConfigurations.endpoint);
  }
  ps.mesh.position.copy(position);
}

MuzzleFlash.prototype.attachToFPSWeapon = function(weaponObj, childObjName, endpoint){
  this.fpsWeaponConfigurations = {weaponObj: weaponObj, childObjName: childObjName, endpoint: endpoint};
  this.attachedToFPSWeapon = true;
  this.fpsWeaponQuaternion = weaponObj.mesh.quaternion.clone();
}

MuzzleFlash.prototype.init = function(){
  this.tick = 0;
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].tick = 0;
  }
  this.isShown = false;
}

MuzzleFlash.prototype.hide = function(){
  for (var i = 0; i<this.particleSystems.length; i++){
    this.particleSystems[i].mesh.visible = false;
  }
}

MuzzleFlash.prototype.onHide = function(){
  if (!this.isShown){
    return;
  }
  this.isShown = false;
  activeMuzzleFlashes.delete(this.name);
  this.hide();
}

MuzzleFlash.prototype.onShow = function(){
  if (this.isShown){
    return;
  }
  this.tick = 0;
  this.particleIndex = 0;
  this.isShown = true;
  activeMuzzleFlashes.set(this.name, this);
}

MuzzleFlash.prototype.onWeaponDeactivated = function(){
  this.isActivated = false;
  this.hide();
  activeMuzzleFlashes.delete(this.name);
}

MuzzleFlash.prototype.onWeaponActivated = function(weaponObj){
  this.init();
  this.attachToFPSWeapon(weaponObj, weaponObj.muzzleFlashParameters.childObj, weaponObj.muzzleFlashParameters.endpoint);
  this.setScale(weaponObj.muzzleFlashParameters.scale);
  this.setRotation(weaponObj.muzzleFlashParameters.rotationX, weaponObj.muzzleFlashParameters.rotationY, weaponObj.muzzleFlashParameters.rotationZ);
  this.isActivated = true;
}

MuzzleFlash.prototype.update = function(){
  var ps = this.particleSystems[this.particleIndex];
  if (this.attachedToFPSWeapon){
    this.handlePosition(ps);
    REUSABLE_QUATERNION.copy(this.fpsWeaponConfigurations.weaponObj.mesh.quaternion);
    var qDiff = REUSABLE_QUATERNION.multiply(this.fpsWeaponQuaternion.inverse());
    REUSABLE_QUATERNION2.copy(qDiff);
    for (var i = 0; i<this.particleSystems.length; i++){
      qDiff.copy(REUSABLE_QUATERNION2);
      qDiff.multiply(this.particleSystems[i].mesh.quaternion);
      this.particleSystems[i].mesh.quaternion.copy(qDiff);
    }
    this.fpsWeaponQuaternion.copy(this.fpsWeaponConfigurations.weaponObj.mesh.quaternion);
  }
  if (mode == 1 && !this.isShown){
    return;
  }
  ps.mesh.visible = true;
  ps.update();
  this.tick += (STEP);
  if (this.tick > this.psTime){
    this.tick = 0;
    ps.mesh.visible = false;
    this.particleIndex ++;
    if (this.particleIndex >= this.psCount){
      this.particleIndex = 0;
    }
    if (mode == 1){
      this.isShown = false;
      activeMuzzleFlashes.delete(this.name);
    }
  }
}
