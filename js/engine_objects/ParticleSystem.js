var ParticleSystem = function(copyPS, name, particles, x, y, z, vx, vy, vz, ax, ay, az, motionMode, updateFunction){
  this.isParticleSystem = true;
  this.copyPS = copyPS;
  this.name = name;
  this.particles = particles;
  this.x = x;
  this.y = y;
  this.z = z;
  this.motionMode = motionMode;
  this.collisionTimeOffset = 0;
  this.positionHistoryCounter = 0;
  this.positionLine = new THREE.Line3(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y, z));
  this.vx = vx, this.vy = vy, this.vz = vz, this.ax = ax, this.ay = ay, this.az = az;
  this.performanceCounter1 = 0;
  this.performanceCounter2 = 0;
  this.lastUpdatePerformance = 0;
  this.destroyedChildCount = 0;
  this.tick = 0;
  this.updateFunction = updateFunction;
  this.particlesWithCollisionCallbacks = new Map();
  this.REUSABLE_VECTOR = new THREE.Vector3();
  this.REUSABLE_VELOCITY_VECTOR = new THREE.Vector3();
  this.REUSABLE_ACCELERATION_VECTOR = new THREE.Vector3();
  TOTAL_PARTICLE_SYSTEM_COUNT ++;
  if (mode != 0){
    particleSystemPool[name] = this;
  }
  this.statusDescription = {type: PARTICLE_SYSTEM_ACTION_TYPE_NONE, isStartPositionDefined: false, isStartVelocityDefined: false, isStartAccelerationDefined: false, isStartQuaternionDefined: false, startPosition: new THREE.Vector3(), startVelocity: new THREE.Vector3(), startAcceleration: new THREE.Vector3(), startQuaternion: new THREE.Quaternion(), stopDuration: 0};
  if (IS_WORKER_CONTEXT){
    this.mesh = new THREE.Object3D();
    return this;
  }
  this.mesh = particleSystemGenerator.generateParticleSystemMesh(this);

  this.compressGeometry();

  scene.add(this.mesh);
  webglCallbackHandler.registerEngineObject(this);
}

ParticleSystem.prototype.compressGeometry = function(){
  macroHandler.compressAttributes(this.mesh, [
    "position", "velocity", "acceleration", "flags1", "flags3", "flags4", "angularQuaternion",
    "rgbThreshold", "uvCoordinates", "targetColor"
  ]);
}

ParticleSystem.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}

ParticleSystem.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

ParticleSystem.prototype.removeCollisionListener = function(){
  delete particleSystemCollisionCallbackRequests[this.name];
  this.checkForCollisions = false;
  rayCaster.onParticleSystemRemoveCollisionListener(this);
}

ParticleSystem.prototype.setCollisionListener = function(callbackFunction, timeOffset){
  particleSystemCollisionCallbackRequests[this.name] = callbackFunction.bind(this);
  this.checkForCollisions = true;
  if (!(typeof timeOffset == UNDEFINED)){
    this.collisionTimeOffset = timeOffset;
  }
  rayCaster.onParticleSystemSetCollisionListener(this, timeOffset);
}

ParticleSystem.prototype.createCopy = function(newParticleSystemName){
  var copyParticleSystem = new ParticleSystem(this, newParticleSystemName, this.particles, this.x, this.y, this.z, this.vx, this.vy, this.vz, this.ax, this.ay, this.az, this.motionMode, this.updateFunction);
  copyParticleSystem.lifetime = this.lifetime;
  copyParticleSystem.angularVelocity = this.angularVelocity;
  copyParticleSystem.angularAcceleration = this.angularAcceleration;
  copyParticleSystem.angularMotionRadius = this.angularMotionRadius;
  if (this.angularQuaternion){
    copyParticleSystem.angularQuaternionX = this.angularQuaternion.x;
    copyParticleSystem.angularQuaternionY = this.angularQuaternion.y;
    copyParticleSystem.angularQuaternionZ = this.angularQuaternion.z;
    copyParticleSystem.angularQuaternionW = this.angularQuaternion.w;
  }
  copyParticleSystem.initialAngle = this.initialAngle;
  copyParticleSystem.isCollidable = this.isCollidable;
  copyParticleSystem.excludeFromMerge = this.excludeFromMerge;
  copyParticleSystem.setBlending(this.getBlending());
  copyParticleSystem.creationConfigurations = JSON.parse(JSON.stringify(this.creationConfigurations));
  copyParticleSystem.creationConfigurations.name = newParticleSystemName;
  copyParticleSystem.registeredSceneName = this.registeredSceneName;

  copyParticleSystem.mesh.scale.copy(this.mesh.scale);

  return copyParticleSystem;
}

ParticleSystem.prototype.shouldSendToWorker = function(){
  return this.hasParticleCollision || this.isCollidable;
}

ParticleSystem.prototype.destroy = function(){
  if (this.mesh){
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh = 0;
    this.particles = 0;
    this.destroyed = true;
    if (particleSystemCollisionCallbackRequests[this.name]){
      TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT --;
    }
    delete particleSystemCollisionCallbackRequests[this.name];
    this.checkForCollisions = false;
    if (this.psPool){
      particleSystemPools[this.psPool].remove(this);
    }
    if (this.psMerger){
      this.psMerger.removePS(this);
    }
  }
}

ParticleSystem.prototype.hide = function(){
  this.tick = 0;
  this.motionMode = 0;
  this.mesh.visible = false;
  if (!this.psMerger){
    particleSystems.delete(this.name);
  }
  if (!(typeof this.psPool == UNDEFINED)){
    var psPool = particleSystemPools[this.psPool];
    psPool.notifyPSAvailable(this);
  }
  if (this.psMerger){
    this.psMerger.material.uniforms.hiddenArray.value[this.mergedIndex] = (20.0);
    this.psMerger.notifyPSVisibilityChange(this, false);
  }
  rayCaster.onParticleSystemHide(this);
}

ParticleSystem.prototype.start = function(configurations){
  var startPosition = configurations.startPosition;
  var startVelocity = configurations.startVelocity;
  var startAcceleration = configurations.startAcceleration;
  var startQuaternion = configurations.startQuaternion;
  var maxCameraDistance = configurations.maxCameraDistance;
  this.tick = 0;
  this.motionTimer = 0;
  if (!(typeof maxCameraDistance == UNDEFINED)){
    this.hasMaxCameraDistance = true;
    this.maxCameraDistance = maxCameraDistance;
  }else{
    this.hasMaxCameraDistance = false;
  }
  if (!(typeof startVelocity == UNDEFINED)){
    this.vx = startVelocity.x;
    this.vy = startVelocity.y;
    this.vz = startVelocity.z;
    if (!this.velocity){
      this.velocity = new THREE.Vector3(this.vx, this.vy, this.vz);
    }else{
      this.velocity.x = this.vx;
      this.velocity.y = this.vy;
      this.velocity.z = this.vz;
    }
    if (!this.psMerger){
      if (this.material){
        this.material.uniforms.parentMotionMatrix.value.elements[3] = startVelocity.x;
        this.material.uniforms.parentMotionMatrix.value.elements[4] = startVelocity.y;
        this.material.uniforms.parentMotionMatrix.value.elements[5] = startVelocity.z;
      }
    }else{
      var matrix = this.psMerger.material.uniforms.parentMotionMatrixArray.value[this.mergedIndex];
      matrix.elements[3] = startVelocity.x;
      matrix.elements[4] = startVelocity.y;
      matrix.elements[5] = startVelocity.z;
    }
  }
  if (!(typeof startAcceleration == UNDEFINED)){
    this.ax = startAcceleration.x;
    this.ay = startAcceleration.y;
    this.az = startAcceleration.z;
    if (!this.acceleration){
      this.acceleration = new THREE.Vector3(this.ax, this.ay, this.az);
    }else{
      this.acceleration.x = this.ax;
      this.acceleration.y = this.ay;
      this.acceleration.z = this.az;
    }
    if (!this.psMerger){
      if (this.material){
        this.material.uniforms.parentMotionMatrix.value.elements[6] = startAcceleration.x;
        this.material.uniforms.parentMotionMatrix.value.elements[7] = startAcceleration.y;
        this.material.uniforms.parentMotionMatrix.value.elements[8] = startAcceleration.z;
      }
    }else{
      var matrix = this.psMerger.material.uniforms.parentMotionMatrixArray.value[this.mergedIndex];
      matrix.elements[6] = startAcceleration.x;
      matrix.elements[7] = startAcceleration.y;
      matrix.elements[8] = startAcceleration.z;
    }
  }
  if (!(typeof startQuaternion == UNDEFINED)){
    this.mesh.quaternion.set(startQuaternion.x, startQuaternion.y, startQuaternion.z, startQuaternion.w);
  }
  if (!(typeof startPosition == UNDEFINED)){
    this.x = startPosition.x;
    this.y = startPosition.y;
    this.z = startPosition.z;
    this.mesh.position.set(this.x, this.y, this.z);
    if (!this.psMerger){
      if (this.material){
        this.material.uniforms.parentMotionMatrix.value.elements[0] = startPosition.x;
        this.material.uniforms.parentMotionMatrix.value.elements[1] = startPosition.y;
        this.material.uniforms.parentMotionMatrix.value.elements[2] = startPosition.z;
      }
    }else{
      var matrix = this.psMerger.material.uniforms.parentMotionMatrixArray.value[this.mergedIndex];
      matrix.elements[0] = startPosition.x;
      matrix.elements[1] = startPosition.y;
      matrix.elements[2] = startPosition.z;
    }
  }
  if (this.hasMaxCameraDistance){
    var dist = camera.position.distanceTo(this.mesh.position);
    if (dist < this.maxCameraDistance){
      var divis = dist / this.maxCameraDistance;
      this.mesh.scale.set(divis, divis, divis);
    }else{
      this.mesh.scale.set(1, 1, 1);
    }
  }
  if (!this.psMerger){
    if (this.material){
      this.material.uniforms.stopInfo.value.set(-10, -10, -10);
    }
  }else{
    this.psMerger.material.uniforms.hiddenArray.value[this.mergedIndex] = (-20.0);
    this.psMerger.material.uniforms.stopInfoArray.value[this.mergedIndex].set(-10, -10, -10);
  }
  this.stoppedX = undefined;
  this.stoppedY = undefined;
  this.stoppedZ = undefined;
  this.stopped = false;
  if (!(typeof this.originalCheckForCollisions == UNDEFINED)){
    this.checkForCollisions = this.originalCheckForCollisions;
    this.originalCheckForCollisions = undefined;
  }
  if (!(typeof this.originalLifetime == UNDEFINED)){
    this.lifetime = this.originalLifetime;
    this.originalLifetime = undefined;
  }
  if (this.mesh){
    this.mesh.visible = true;
  }
  if (!this.psMerger){
    if (!this.muzzleFlashName){
      particleSystems.set(this.name, this);
    }
    if (this.material){
      this.material.uniforms.dissapearCoef.value = 0;
    }
  }else{
    this.psMerger.notifyPSVisibilityChange(this, true);
    this.psMerger.material.uniforms.dissapearCoefArray.value[this.mergedIndex] = 0;
  }
  if (this.rewindNeededOnNextStart){
    for (var i = 0; i<this.particles.length; i++){
      this.rewindParticle(this.particles[i], 0);
    }
    this.rewindNeededOnNextStart = false;
  }
  if (this.updateExpiredStatusOnNextStart){
    for (var i = 0; i<this.particles.length; i++){
      this.undoRemoveParticle(this.particles[i]);
    }
    this.updateExpiredStatusOnNextStart = false;
  }
  this.positionLine.start.copy(this.mesh.position);
  this.positionLine.end.copy(this.mesh.position);
  rayCaster.onParticleSystemStart(this, configurations);
}

ParticleSystem.prototype.stop = function(newLifetime){
  if (this.velocity){
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
  }
  if (this.acceleration){
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    this.acceleration.z = 0;
  }
  this.originalCheckForCollisions = this.checkForCollisions;
  this.checkForCollisions = false;
  if (!this.psMerger){
    if (this.material){
      this.material.uniforms.stopInfo.value.set(10.0, this.tick, newLifetime);
    }
  }else{
    this.psMerger.material.uniforms.stopInfoArray.value[this.mergedIndex].set(10.0, this.tick, newLifetime);
  }
  this.originalLifetime = this.lifetime;
  this.lifetime = (this.tick + newLifetime);
  this.stopped = true;
  this.stoppedX = this.mesh.position.x;
  this.stoppedY = this.mesh.position.y;
  this.stoppedZ = this.mesh.position.z;
  this.particlesWithCollisionCallbacks.forEach(this.particleIterationStopFunc);
  rayCaster.onParticleSystemStop(this, newLifetime);
}

ParticleSystem.prototype.particleIterationStopFunc = function(value, key){
  var particle = value;
  particle.stopLifetime = particle.parent.lifetime;
  particle.respawnSet = false;
  particle.stopTick = particle.parent.tick;
  particle.lifetime = particle.parent.lifetime;
  if (particle.startDelay > particle.parent.tick){
    particle.startDelay = particle.parent.tick;
  }
}

ParticleSystem.prototype.getBlending = function(){
  return this.material.blending;
}

ParticleSystem.prototype.setBlending = function(mode){
  this.material.blending = mode;
}

ParticleSystem.prototype.undoRemoveParticle = function(particle){
  var selectedGeometry;
  var selectedOffset = particle.index;
  if (this.psMerger){
    selectedOffset += this.expiredFlagOffset;
    selectedGeometry = this.psMerger.geometry;
  }else{
    selectedGeometry = this.geometry;
  }
  if (selectedGeometry){
    selectedGeometry.attributes.expiredFlag.updateRange.set(selectedOffset, 1);
    selectedGeometry.attributes.expiredFlag.array[particle.index] = 0;
    selectedGeometry.attributes.expiredFlag.needsUpdate = true;
  }
  particle.isExpired = false;
  if (particle.checkForCollisions){
    if (typeof particle.uuid == UNDEFINED){
      particle.assignUUID();
    }
    this.particlesWithCollisionCallbacks.set(particle.uuid, particle);
  }
  this.destroyedChildCount --;
}

ParticleSystem.prototype.removeParticle = function(particle){
  var selectedGeometry;
  var selectedOffset = particle.index;
  if (this.psMerger){
    selectedOffset += this.expiredFlagOffset;
    selectedGeometry = this.psMerger.geometry;
  }else{
    selectedGeometry = this.geometry;
  }
  if (selectedGeometry){
    selectedGeometry.attributes.expiredFlag.updateRange.set(selectedOffset, 1);
    selectedGeometry.attributes.expiredFlag.array[particle.index] = 7;
    selectedGeometry.attributes.expiredFlag.needsUpdate = true;
  }
  particle.isExpired = true;
  if (!(typeof particle.uuid == UNDEFINED)){
    this.particlesWithCollisionCallbacks.delete(particle.uuid);
  }
  this.destroyedChildCount ++;
  this.updateExpiredStatusOnNextStart = true;
}

ParticleSystem.prototype.rewindParticle = function(particle, delay){
  var selectedGeometry;
  var sIndex = (particle.index * 4) + 3;
  if (this.psMerger){
    selectedGeometry = this.psMerger.geometry;
    sIndex += this.flags2Offset;
  }else{
    selectedGeometry = this.geometry;
  }
  var val = this.tick + delay + particle.originalStartDelay;
  if (selectedGeometry){
    selectedGeometry.attributes.flags2.updateRange.set(sIndex, 1);
    selectedGeometry.attributes.flags2.array[sIndex] = val;
    selectedGeometry.attributes.flags2.needsUpdate = true;
  }
  particle.startDelay = val;
  this.rewindNeededOnNextStart = true;
}

ParticleSystem.prototype.calculatePseudoPosition = function(){
  var pseudoTick = this.tick + (this.collisionTimeOffset * (STEP));
  var vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0;
  if (this.velocity){
    vx = this.velocity.x;
    vy = this.velocity.y;
    vz = this.velocity.z;
  }
  if (this.acceleration){
    ax = this.acceleration.x;
    ay = this.acceleration.y;
    az = this.acceleration.z;
  }
  if (this.motionMode == MOTION_MODE_NORMAL){
    var dx = (vx * pseudoTick) + (0.5 * ax * pseudoTick * pseudoTick);
    var dy = (vy * pseudoTick) + (0.5 * ay * pseudoTick * pseudoTick);
    var dz = (vz * pseudoTick) + (0.5 * az * pseudoTick * pseudoTick);
    REUSABLE_VECTOR.set(this.x + dx, this.y + dy, this.z + dz);
    return REUSABLE_VECTOR;
  }else if (this.motionMode == MOTION_MODE_CIRCULAR){
    var angleNow = this.initialAngle +
        (this.angularVelocity * pseudoTick) +
          (0.5 * this.angularAcceleration * pseudoTick * pseudoTick);
    REUSABLE_VECTOR.set(
          (this.angularMotionRadius * Math.cos(angleNow)),
          this.y,
          (this.angularMotionRadius * Math.sin(angleNow))
    );
    if (!(this.angularQuaternionX == 0 && this.angularQuaternionY == 0 && this.angularQuaternionZ == 0 && this.angularQuaternionW == 1)){
      REUSABLE_VECTOR.applyQuaternion(REUSABLE_QUATERNION.set(
        this.angularQuaternionX, this.angularQuaternionY, this.angularQuaternionZ, this.angularQuaternionW
      ));
    }
    REUSABLE_VECTOR.x += this.x;
    REUSABLE_VECTOR.y += this.y;
    REUSABLE_VECTOR.z += this.z;
    return REUSABLE_VECTOR;
  }
}

ParticleSystem.prototype.update = function(){
  if (this.destroyed){
    return;
  }
  this.tick += (STEP);
  if (this.tick > this.maxPSTime){
    this.start(EMPTY_OBJECT);
  }
  if (!this.psMerger){
    if (this.material){
      this.material.uniforms.time.value = this.tick;
      this.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;
      this.material.uniforms.worldMatrix.value = this.mesh.matrixWorld;
    }
  }else{
    this.mesh.updateMatrixWorld(true);
    this.mesh.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, this.mesh.matrixWorld);
    this.psMerger.material.uniforms.modelViewMatrixArray.value[this.mergedIndex] = this.mesh.modelViewMatrix;
    this.psMerger.material.uniforms.timeArray.value[this.mergedIndex] = this.tick;
  }
  var vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0;
  if (this.velocity){
    vx = this.velocity.x;
    vy = this.velocity.y;
    vz = this.velocity.z;
  }
  if (this.acceleration){
    ax = this.acceleration.x;
    ay = this.acceleration.y;
    az = this.acceleration.z;
  }
  if (this.motionMode == MOTION_MODE_NORMAL && !this.stopped){
    var dx = (vx * this.tick) + (0.5 * ax * this.tick * this.tick);
    var dy = (vy * this.tick) + (0.5 * ay * this.tick * this.tick);
    var dz = (vz * this.tick) + (0.5 * az * this.tick * this.tick);
    if (dx != 0 || dy != 0 || dz != 0){
      this.mesh.position.set(
        (this.x + dx),
        (this.y + dy),
        (this.z + dz)
      );
    }
  }else if (this.motionMode == MOTION_MODE_CIRCULAR && !this.stopped){
    var angleNow = this.initialAngle +
        (this.angularVelocity * this.tick) +
          (0.5 * this.angularAcceleration * this.tick * this.tick);
    this.mesh.position.set(
      (this.angularMotionRadius * Math.cos(angleNow)),
      this.y,
      (this.angularMotionRadius * Math.sin(angleNow))
    );
    if (!(this.angularQuaternionX == 0 && this.angularQuaternionY == 0 && this.angularQuaternionZ == 0 && this.angularQuaternionW == 1)){
      this.mesh.position.applyQuaternion(REUSABLE_QUATERNION.set(
        this.angularQuaternionX, this.angularQuaternionY, this.angularQuaternionZ, this.angularQuaternionW
      ));
    }
    this.mesh.position.set(
      this.mesh.position.x + this.x,
      this.mesh.position.y + this.y,
      this.mesh.position.z + this.z
    );
  }
  if (this.stopped){
    this.mesh.position.set(this.stoppedX, this.stoppedY, this.stoppedZ);
  }
  if (this.updateFunction){
    this.updateFunction();
  }
  if (!raycasterFactory.isWorkerActive()){
    if (mode == 1){
      this.particlesWithCollisionCallbacks.forEach(this.particleIterationCollisionFunc);
    }
  }
  if (this.tick >= this.lifetime && this.lifetime > 0){
    if (this.expirationFunction){
      this.expirationFunction(this.name);
    }
    if (!this.psMerger){
      particleSystems.delete(this.name);
    }else{
      this.psMerger.material.uniforms.hiddenArray.value[this.mergedIndex] = 20.0;
      this.psMerger.notifyPSVisibilityChange(this, false);
    }
    this.mesh.visible = false;
    if (!(typeof this.psPool == UNDEFINED)){
      particleSystemPools[this.psPool].notifyPSAvailable(this);
    }
  }
  if (this.checkForCollisions && this.mesh && this.mesh.visible && !raycasterFactory.isWorkerActive()){
    if (mode == 1){
      this.handleCollisions();
    }
  }

  if (this.hasMaxCameraDistance){
    var dist = camera.position.distanceTo(this.mesh.position);
    if (dist < this.maxCameraDistance){
      var divis = dist / this.maxCameraDistance;
      this.mesh.scale.set(divis, divis, divis);
    }else{
      this.mesh.scale.set(1, 1, 1);
    }
  }
}

ParticleSystem.prototype.particleIterationCollisionFunc = function(value){
  var particle = value;
  if (!particle.isExpired){
    particle.handleCollisions();
  }
}

ParticleSystem.prototype.rotate = function(axis, radians, fromScript){
  if (axis.toLowerCase() == "x"){
    this.mesh.rotateX(radians);
  }else if (axis.toLowerCase() == "y"){
    this.mesh.rotateY(radians);
  }else if (axis.toLowerCase() == "z"){
    this.mesh.rotateZ(radians);
  }
}

ParticleSystem.prototype.getVelocityAtTime = function(time, targetVector){
  if (this.motionMode == MOTION_MODE_NORMAL){
    if (!targetVector){
      var vec = ROYGBIV.vector(0, 0, 0);
      vec.x = this.velocity.x + (this.acceleration.x * time);
      vec.y = this.velocity.y + (this.acceleration.y * time);
      vec.z = this.velocity.z + (this.acceleration.z * time);
      return vec;
    }else{
      targetVector.x = this.velocity.x + (this.acceleration.x * time);
      targetVector.y = this.velocity.y + (this.acceleration.y * time);
      targetVector.z = this.velocity.z + (this.acceleration.z * time);
      return targetVector;
    }
  }else if (this.motionMode == MOTION_MODE_CIRCULAR){
    return (this.angularVelocity + (this.angularAcceleration * time));
  }
}

ParticleSystem.prototype.fireCollisionCallback = function(collisionInfo){
  var request = particleSystemCollisionCallbackRequests[this.name];
  if (!request){
    return;
  }
  request(collisionInfo);
  if (IS_WORKER_CONTEXT){
    worker.onParticleSystemCollision(this, collisionInfo);
  }
}

ParticleSystem.prototype.handleCollisions = function(){
  var results;
  var pseudoPosition;
  if (this.collisionTimeOffset == 0){
    results = rayCaster.query(this.mesh.position);
  }else{
    pseudoPosition = this.calculatePseudoPosition();
    results = rayCaster.query(pseudoPosition);
  }
  if (this.positionHistoryCounter == 0){
    var end = this.positionLine.end;
    if (this.collisionTimeOffset == 0){
      this.positionLine.set(this.mesh.position, end);
    }else{
      this.positionLine.set(pseudoPosition, end);
    }
  }else if (this.positionHistoryCounter == 1){
    var start = this.positionLine.start;
    if (this.collisionTimeOffset == 0){
      this.positionLine.set(start, this.mesh.position);
    }else{
      this.positionLine.set(start, pseudoPosition);
    }
  }
  this.positionHistoryCounter ++;
  if (this.positionHistoryCounter == 2){
    this.positionHistoryCounter = 0;
  }
  for (var objName in results){
    var result = results[objName];
    if (result == 5){
      var obj = addedObjects[objName];
      if (!obj){
        return;
      }
      var intersectionPoint = obj.intersectsLine(this.positionLine);
      if (intersectionPoint){
        var collisionInfo = reusableCollisionInfo.set(
          objName, intersectionPoint.x, intersectionPoint.y, intersectionPoint.z,
          0, obj.mesh.quaternion.x, obj.mesh.quaternion.y, obj.mesh.quaternion.z,
          obj.mesh.quaternion.w, INTERSECTION_NORMAL, this.tick
        );
        this.fireCollisionCallback(collisionInfo);
      }
    }else{
      var obj;
      var parent = objectGroups[objName];
      if (!parent){
        return;
      }
      for (var childName in result){
        obj = parent.group[childName];
        if (!obj){
          return;
        }
        var intersectionPoint = obj.intersectsLine(this.positionLine);
        if (intersectionPoint){
          var collisionInfo = reusableCollisionInfo.set(
            objName, intersectionPoint.x, intersectionPoint.y, intersectionPoint.z,
            0, parent.mesh.quaternion.x, parent.mesh.quaternion.y,
            parent.mesh.quaternion.z, parent.mesh.quaternion.w,
            INTERSECTION_NORMAL, this.tick
          );
          this.fireCollisionCallback(collisionInfo);
          return;
        }
      }
    }
  }
}
