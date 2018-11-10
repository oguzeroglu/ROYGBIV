var Particle = function(x, y, z, material, lifetime){
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

Particle.prototype.setFromPseudoObject = function(pseudoObject){
  this.angularAcceleration = pseudoObject.angularAcceleration;
  this.angularMotionRadius = pseudoObject.angularMotionRadius;
  this.angularQuaternionW = pseudoObject.angularQuaternionW;
  this.angularQuaternionX = pseudoObject.angularQuaternionX;
  this.angularQuaternionY = pseudoObject.angularQuaternionY;
  this.angularQuaternionZ = pseudoObject.angularQuaternionZ;
  this.angularVelocity = pseudoObject.angularVelocity;
  this.gpuAcceleration = new THREE.Vector3(pseudoObject.ax, pseudoObject.ay, pseudoObject.az);
  this.initialAngle = pseudoObject.initialAngle;
  this.lifetime = pseudoObject.lifetime;
  this.motionMode = pseudoObject.motionMode;
  this.respawnSet = pseudoObject.respawnSet;
  this.startDelay = pseudoObject.startDelay;
  this.trailFlag = pseudoObject.trailFlag;
  this.useWorldPositionFlag = pseudoObject.useWorldPositionFlag;
  this.uuid = parseInt(pseudoObject.uuid);
  this.gpuVelocity = new THREE.Vector3(pseudoObject.vx, pseudoObject.vy, pseudoObject.vz);
  this.x = pseudoObject.x;
  this.y = pseudoObject.y;
  this.z = pseudoObject.z;
  this.parentCollisionWorkerIndex = pseudoObject.parentCollisionWorkerIndex;
  this.fromPseudoObject = true;
  this.parent = new Object();
  var parentInitPosition = particleSystemInitialPositions[this.parentCollisionWorkerIndex];
  this.parent.x = parentInitPosition.x;
  this.parent.y = parentInitPosition.y;
  this.parent.z = parentInitPosition.z;
  var parentVelocity = particleSystemVelocities[this.parentCollisionWorkerIndex];
  this.parent.vx = parentVelocity.x;
  this.parent.vy = parentVelocity.y;
  this.parent.vz = parentVelocity.z;
  var parentAcceleration = particleSystemAccelerations[this.parentCollisionWorkerIndex];
  this.parent.ax = parentAcceleration.x;
  this.parent.ay = parentAcceleration.y;
  this.parent.az = parentAcceleration.z;
  this.parent.mesh = new Object();
  this.parent.mesh.matrixWorld = particleSystemMatrices[this.parentCollisionWorkerIndex];
  this.parent.name = pseudoObject.parentName;
  this.index = pseudoObject.index;
  this.collisionTimeOffset = pseudoObject.collisionTimeOffset;

  var vect = this.positionHistoryArray[this.positionHistoryCounter];
  this.getPosition(null, vect);
  this.positionHistoryCounter ++;
}

Particle.prototype.generateCollisionWorkerInfo = function(){
  var collisionWorkerInfo = new Object();
  collisionWorkerInfo.uuid = this.uuid;
  collisionWorkerInfo.parentCollisionWorkerIndex = this.parent.collisionWorkerIndex;
  collisionWorkerInfo.x = this.x;
  collisionWorkerInfo.y = this.y;
  collisionWorkerInfo.z = this.z;
  collisionWorkerInfo.startDelay = this.startDelay;
  collisionWorkerInfo.lifetime = this.lifetime;
  collisionWorkerInfo.respawnSet = this.respawnSet;
  collisionWorkerInfo.trailFlag = this.trailFlag;
  collisionWorkerInfo.useWorldPositionFlag = this.useWorldPositionFlag;
  collisionWorkerInfo.vx = this.gpuVelocity.x;
  collisionWorkerInfo.vy = this.gpuVelocity.y;
  collisionWorkerInfo.vz = this.gpuVelocity.z;
  collisionWorkerInfo.ax = this.gpuAcceleration.x;
  collisionWorkerInfo.ay = this.gpuAcceleration.y;
  collisionWorkerInfo.az = this.gpuAcceleration.z;
  collisionWorkerInfo.motionMode = this.motionMode;
  collisionWorkerInfo.initialAngle = this.initialAngle;
  collisionWorkerInfo.angularAcceleration = this.angularAcceleration;
  collisionWorkerInfo.angularVelocity = this.angularVelocity;
  collisionWorkerInfo.angularMotionRadius = this.angularMotionRadius;
  collisionWorkerInfo.angularQuaternionX = this.angularQuaternionX;
  collisionWorkerInfo.angularQuaternionY = this.angularQuaternionY;
  collisionWorkerInfo.angularQuaternionZ = this.angularQuaternionZ;
  collisionWorkerInfo.angularQuaternionW = this.angularQuaternionW;
  collisionWorkerInfo.parentName = this.parent.name;
  collisionWorkerInfo.index = this.index;
  collisionWorkerInfo.collisionTimeOffset = this.collisionTimeOffset;
  return JSON.stringify(collisionWorkerInfo);
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
}

Particle.prototype.updatePositionHistory = function(){
  if (this.readyForCollisionCheckFlagNextIteration){
    this.readyForCollisionCheckFlag = true;
  }
  var vect = this.positionHistoryArray[this.positionHistoryCounter];
  var tmp = this.parent.tick;
  this.parent.tick += (this.collisionTimeOffset * (1/60));
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

Particle.prototype.handleCollisions = function(fromWorker){
  var timer1 = performance.now();
  this.updatePositionHistory();
  if (!this.readyForCollisionCheckFlag){
    return;
  }
  var rIndex = this.positionHistoryCounter - 1;
  if (rIndex < 0){
    rIndex = PARTICLE_POSITION_HISTORY_SIZE - 1;
  }
  var results;
  if (fromWorker){
    results = worldBinHandler.query(this.positionHistoryArray[rIndex]);
  }else{
    results = rayCaster.binHandler.query(this.positionHistoryArray[rIndex]);
  }
  for (var objName in results){
    var result = results[objName];
    if (result == 5){
      var obj = addedObjects[objName];
      if (!obj){
        return;
      }
      this.generateLine();
      var intersectionPoint;
      if (!fromWorker){
        intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
      }else{
        intersectsLine(objName, this);
        continue;
      }
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
        if (!fromWorker){
          obj = parent.group[childName];
        }else{
          obj = true;
        }
        if (!obj){
          return;
        }
        this.generateLine();
        if (!fromWorker){
          var intersectionPoint = obj.intersectsLine(REUSABLE_LINE);
        }else{
          if (intersectsLine(objName, this, childName)){
            continue;
          }
        }
        if (intersectionPoint){
          this.fireCollisionCallback();
          return;
        }
      }
    }
  }
  this.lastUpdatetime = performance.now() - timer1;
}


Particle.prototype.assignUUID = function(){
  this.uuid = TOTAL_PARTICLE_COLLISION_LISTEN_COUNT;
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
