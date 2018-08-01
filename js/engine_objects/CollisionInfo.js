var CollisionInfo = function(targetObjectName, x, y, z, collisionImpact, quaternionX, quaternionY, quaternionZ, quaternionW, faceNormal, time){
  this.set(targetObjectName, x, y, z, collisionImpact, quaternionX, quaternionY, quaternionZ, quaternionW, faceNormal, time);
}

CollisionInfo.prototype.set = function(targetObjectName, x, y, z, collisionImpact, quaternionX, quaternionY, quaternionZ, quaternionW, faceNormal, time){
  this.targetObjectName = targetObjectName;
  this.x = x;
  this.y = y;
  this.z = z;

  // Set only for object collisions
  this.collisionImpact = collisionImpact;

  this.quaternionX = quaternionX;
  this.quaternionY = quaternionY;
  this.quaternionZ = quaternionZ;
  this.quaternionW = quaternionW;

  // Set only for particle collisions
  if (faceNormal){
    this.faceNormalX = faceNormal.x;
    this.faceNormalY = faceNormal.y;
    this.faceNormalZ = faceNormal.z;
  }

  // Set only for particle system collisions
  if (!(typeof time == "undefined")){
    this.particleSystemTime = time;
  }
  return this;
}
