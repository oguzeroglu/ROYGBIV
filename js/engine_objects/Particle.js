var Particle = function(x, y, z, material, lifetime){
  this.isParticle = true;
  this.x = x;
  this.y = y;
  this.z = z;
  this.material = material;
  this.lifetime = lifetime;
  this.isExpired = false;
  this.positionHistoryCounter = 0;
  this.readyForCollisionCheckFlag = false;
  this.positionHistoryArray = new Array(PARTICLE_POSITION_HISTORY_SIZE);
  for (var i = 0; i<this.positionHistoryArray.length; i++){
    this.positionHistoryArray[i] = new THREE.Vector3();
  }
  this.collisionTimeOffset = 0;
  if (!(typeof lifetime == "undefined")){
    var vect = this.positionHistoryArray[this.positionHistoryCounter];
    this.getPosition(null, vect);
    this.positionHistoryCounter ++;
  }
}

Particle.prototype.dissapearCollisionCallback = function(){
  var particle = this.obj;
  particle.parent.removeParticle(particle);
}

Particle.prototype.rewindCollisionCallback = function(){
  var particle = this.obj;
  particle.parent.rewindParticle(particle, 0);
}

Particle.prototype.setCollisionListener = function(collisionAction, timeOffset){
  if (typeof this.uuid == UNDEFINED){
    this.assignUUID();
  }
  if (!particleCollisionCallbackRequests[this.uuid]){
    TOTAL_PARTICLE_COLLISION_LISTEN_COUNT ++;
  }
  var callbackFunc = (collisionAction == PARTICLE_REWIND_ON_COLLIDED)? this.rewindCollisionCallback: this.dissapearCollisionCallback;
  particleCollisionCallbackRequests[this.uuid] = callbackFunc.bind({obj: this});
  this.checkForCollisions = true;
  this.collisionTimeOffset = (typeof timeOffset == UNDEFINED)? 0: timeOffset;
}

// WORLD COORDINATES OF THIS PARTICLE
Particle.prototype.getPosition = function(axis, targetVector){
  if (this.isExpired || !this.parent || this.isParticleExpired() || (this.parent && !this.parent.mesh)){
    return;
  }
  var x = this.x;
  var y = this.y;
  var z = this.z;
  var time = this.getTime();
  // CONVERTED FROM THE GPU SHADER CODE
  if (this.useWorldPositionFlag){
    var repeatTime = this.findRepeatTime();
    if (this.lifetime <= 0.0001){
      repeatTime = this.startDelay;
    }

    if (!(typeof this.stopTick == "undefined") && this.parent.stopped && repeatTime > this.stopTick){
      repeatTime = this.stopTick;
    }

    var pix = this.parent.x;
    var piy = this.parent.y;
    var piz = this.parent.z;
    var newX = pix + (this.parent.vx * repeatTime) + (0.5 * repeatTime * repeatTime * this.parent.ax);
    var newY = piy + (this.parent.vy * repeatTime) + (0.5 * repeatTime * repeatTime * this.parent.ay);
    var newZ = piz + (this.parent.vz * repeatTime) + (0.5 * repeatTime * repeatTime * this.parent.az);
    newX = newX + x + (this.gpuVelocity.x * time) + (0.5 * time * time * this.gpuAcceleration.x);
    newY = newY + y + (this.gpuVelocity.y * time) + (0.5 * time * time * this.gpuAcceleration.y);
    newZ = newZ + z + (this.gpuVelocity.z * time) + (0.5 * time * time * this.gpuAcceleration.z);
    REUSABLE_VECTOR.set(newX, newY, newZ);
  }else{
    if (this.motionMode == MOTION_MODE_NORMAL){
      if (!this.trailFlag){
        var dx = (this.gpuVelocity.x * time) + (0.5 * this.gpuAcceleration.x * time * time);
        var dy = (this.gpuVelocity.y * time) + (0.5 * this.gpuAcceleration.y * time * time);
        var dz = (this.gpuVelocity.z * time) + (0.5 * this.gpuAcceleration.z * time * time);
        x += dx;
        y += dy;
        z += dz;
        REUSABLE_VECTOR.set(x, y, z);
      }else{
        var dx = (this.parent.vx * time) + (0.5 * this.parent.ax * time * time);
        var dy = (this.parent.vy * time) + (0.5 * this.parent.ay * time * time);
        var dz = (this.parent.vz * time) + (0.5 * this.parent.az * time * time);
        x += dx;
        y += dy;
        z += dz;
        REUSABLE_VECTOR.set(x, y, z);
      }
    }else if (this.motionMode == MOTION_MODE_CIRCULAR){
      var initialAngle = this.initialAngle;
      var angularAcceleration = this.angularAcceleration;
      var angularVelocity = this.angularVelocity;
      var angularMotionRadius = this.angularMotionRadius;
      REUSABLE_QUATERNION2.set(
        this.angularQuaternionX, this.angularQuaternionY, this.angularQuaternionZ, this.angularQuaternionW
      );
      var angleNow = initialAngle + (
        (angularVelocity * time) + (0.5 * angularAcceleration * time * time)
      );
      var tmpCircularX = angularMotionRadius * Math.cos(angleNow);
      var tmpCircularZ = angularMotionRadius * Math.sin(angleNow);
      REUSABLE_VECTOR.set(tmpCircularX, 0, tmpCircularZ);
      REUSABLE_VECTOR.applyQuaternion(REUSABLE_QUATERNION2);
    }
  }
  if (!this.useWorldPositionFlag){
    this.parent.mesh.updateMatrixWorld();
    REUSABLE_VECTOR.applyMatrix4(this.parent.mesh.matrixWorld);
  }
  if (axis){
    if (axis.toLowerCase() == "x"){
      return REUSABLE_VECTOR.x;
    }else if (axis.toLowerCase() == "y"){
      return REUSABLE_VECTOR.y;
    }else if (axis.toLowerCase() == "z"){
      return REUSABLE_VECTOR.z;
    }
  }else{
    if (!targetVector){
      return REUSABLE_VECTOR.clone();
    }else{
      targetVector.set(REUSABLE_VECTOR.x, REUSABLE_VECTOR.y, REUSABLE_VECTOR.z);
    }
  }
}

Particle.prototype.fireCollisionCallback = function(){
  var request = particleCollisionCallbackRequests[this.uuid];
  if (!request){
    return;
  }
  request();
  if (IS_WORKER_CONTEXT){
    worker.onParticleCollision(this);
  }
}

Particle.prototype.updatePositionHistory = function(){
  if (this.readyForCollisionCheckFlagNextIteration){
    this.readyForCollisionCheckFlag = true;
  }
  var vect = this.positionHistoryArray[this.positionHistoryCounter];
  var tmp = this.parent.tick;
  this.parent.tick += (this.collisionTimeOffset * (STEP));
  this.getPosition(null, vect);
  this.parent.tick = tmp;
  this.positionHistoryCounter ++;
  if (this.positionHistoryCounter == PARTICLE_POSITION_HISTORY_SIZE){
    this.readyForCollisionCheckFlagNextIteration = true;
    this.positionHistoryCounter = 0;
  }
  return;
}

Particle.prototype.generateLine = function(){
  var index1 = this.positionHistoryCounter - 1;
  if (index1 < 0){
    index1 = PARTICLE_POSITION_HISTORY_SIZE - 1;
  }
  var index2 = this.positionHistoryCounter;
  REUSABLE_LINE.set(this.positionHistoryArray[index1], this.positionHistoryArray[index2]);
}

Particle.prototype.handleCollisions = function(){
  this.updatePositionHistory();
  if (!this.readyForCollisionCheckFlag){
    return;
  }
  var rIndex = this.positionHistoryCounter - 1;
  if (rIndex < 0){
    rIndex = PARTICLE_POSITION_HISTORY_SIZE - 1;
  }
  var results = rayCaster.query(this.positionHistoryArray[rIndex]);
  for (var objName in results){
    var result = results[objName];
    if (result == 5){
      var obj = addedObjects[objName];
      if (!obj){
        return;
      }
      this.generateLine();
      var intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
      if (intersectionPoint){
        this.fireCollisionCallback();
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
        this.generateLine();
        var intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
        if (intersectionPoint){
          this.fireCollisionCallback();
          return;
        }
      }
    }
  }
}


Particle.prototype.assignUUID = function(uuid){
  if (typeof uuid == UNDEFINED){
    this.uuid = TOTAL_PARTICLE_COLLISION_LISTEN_COUNT;
  }else{
    this.uuid = uuid;
  }
}

// CONVERTED FROM THE GPU GLSL CODE
Particle.prototype.isParticleExpired = function(){
  if (this.parent.tick < this.startDelay){
    return false;
  }
  if (this.lifetime > 0.0 && this.parent.tick >= (this.lifetime + this.startDelay) && !this.respawnSet){
    return true;
  }
  return false;
}

// CONVERTED FROM THE GPU GLSL CODE
Particle.prototype.isRecentlyRespawned = function(timeNow){
  var respawnFlag = this.respawnSet;
  var lifetime = this.lifetime;

  if (this.parent.stopped){
    lifetime = this.stopLifetime;
  }

  if (!respawnFlag){
    return false;
  }
  var timeThen = (timeNow - 0.01666666666);
  var timeNowModulated = timeNow - (lifetime * Math.floor(timeNow/lifetime));
  var timeThenModulated = timeThen - (lifetime * Math.floor(timeThen/lifetime));
  if (timeNowModulated < timeThenModulated){
    return true;
  }
  return false;
}
// CONVERTED FROM THE GPU GLSL CODE
Particle.prototype.findRepeatTime = function(){
  var startTime = this.startDelay;
  var respawnFlag = this.respawnSet;
  var time = this.parent.tick;
  if (!time){
    time = 0;
  }
  if (!respawnFlag){
    return startTime;
  }
  var x = time;
  for (var i = 0.0; i<10000000.0; i += 0.0000000001){
    var recentlyRespawnedFlag = this.isRecentlyRespawned((x - startTime));
    if (recentlyRespawnedFlag){
      return x;
    }
    x = x - 0.01666666666;
    if (x < startTime || x < 0.0){
      break;
    }
  }
  return time;
}
// CONVERTED FROM THE GPU GLSL CODE
Particle.prototype.getTime = function(){
  var startDelay = this.startDelay;
  var parentTime = this.parent.tick;
  if (this.lifetime > 0 && parentTime >= (startDelay + this.lifetime) && !this.respawnSet){
    return 0;
  }

  if (this.trailFlag){
    var trailTime = this.findRepeatTime();
    var diff = parentTime - trailTime;
    return (trailTime - diff);
  }

  if (parentTime >= startDelay){
    var timeOfThis = (parentTime - startDelay);
    if (this.respawnSet && this.lifetime > 0){
      timeOfThis = timeOfThis - (this.lifetime * Math.floor(timeOfThis/this.lifetime));
    }
    return timeOfThis;
  }else{
    return 0;
  }
}
