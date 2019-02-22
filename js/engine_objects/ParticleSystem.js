var ParticleSystem = function(copyPS, name, particles, x, y, z, vx, vy, vz, ax, ay, az, motionMode, updateFunction, fromWorker){

  this.isParticleSystem = true;

  this.collisionWorkerInfo = new Object();
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

  var textureMerger = 0;

  var texturesObj = new Object();
  var textureCount = 0;
  var mergedTextureHash = "";
  for (var i = 0; i<particles.length; i++){
    if (particles[i].material.texture){
      if (!texturesObj[particles[i].material.texture]){
        mergedTextureHash = particles[i].material.texture + PIPE;
      }
      texturesObj[particles[i].material.texture] = textures[particles[i].material.texture];
      textureCount ++;
    }
  }
  this.texturesObj = texturesObj;

  if (textureCount > 0 && !mergedTextureCache[mergedTextureHash]){
    textureMerger = new TextureMerger(texturesObj);
    mergedTextureCache[mergedTextureHash] = textureMerger;
  }else if (textureCount > 0 && mergedTextureCache[mergedTextureHash]){
    textureMerger = mergedTextureCache[mergedTextureHash];
  }

  this.performanceCounter1 = 0;
  this.performanceCounter2 = 0;
  this.lastUpdatePerformance = 0;

  this.totalParticleCount = 0;

  this.destroyedChildCount = 0;

  this.tick = 0;

  this.updateFunction = updateFunction;

  this.particlesWithCollisionCallbacks = new Map();

  this.gpuMotionUpdateBuffer = [];


  this.REUSABLE_VECTOR = new THREE.Vector3();
  this.REUSABLE_VELOCITY_VECTOR = new THREE.Vector3();
  this.REUSABLE_ACCELERATION_VECTOR = new THREE.Vector3();

  var len = this.particles.length;

  if (fromWorker){
    return this;
  }

  this.geometry = new THREE.BufferGeometry();
  this.expiredFlags = new Float32Array(len); // This is dynamic
  this.flags2 = new Float32Array(len * 4); // sizes - transparencies - textureFlag - times
  if (!this.copyPS){
    this.positions = new Float32Array(len * 3); // This is used to store initialAngle and angularAcceleration info for MOTION_MODE_CIRCULAR
    this.rgbThresholds = new Float32Array(len * 3);
    this.velocities = new Float32Array(len * 3);
    this.accelerations = new Float32Array(len * 3);
    this.flags1 = new Float32Array(len * 4); // respawn - alphaDelta - trailFlag - lifeTimes
    this.flags3 = new Float32Array(len * 4); // alphaVariationMode - motionMode - angularVelocity - angularMotionRadius
    this.flags4 = new Float32Array(len * 4); // color.r - color.g - color.b - useWorldPositionFlag
    this.targetColors = new Float32Array(len * 4);
    this.angularQuaternions = new Float32Array(len * 4);
    this.uvCoordinates = new Float32Array(len * 4); // startU - startV - endU - endV
  }else{
    this.positions = this.copyPS.positions;
    this.rgbThresholds = this.copyPS.rgbThresholds
    this.velocities = this.copyPS.velocities
    this.accelerations = this.copyPS.accelerations
    this.flags1 = this.copyPS.flags1;
    this.flags3 = this.copyPS.flags3;
    this.flags4 = this.copyPS.flags4;
    this.targetColors = this.copyPS.targetColors;
    this.angularQuaternions = this.copyPS.angularQuaternions;
    this.uvCoordinates = this.copyPS.uvCoordinates;
  }

  var i2 = 0;
  var i3 = 0;
  var i4 = 0;
  var i5 = 0;
  var i6 = 0;
  var i7 = 0;
  var i8 = 0;
  var i9 = 0;
  var i10 = 0;

  if (!this.copyPS){
    for (var i = 0; i<particles.length; i++){
      var particle = particles[i];

      particle.parent = this;

      if (particle.trailMode){
        this.hasTrailedParticle = true;
      }

      var rgbFilterX = 0;
      var rgbFilterY = 0;
      var rgbFilterZ = 0;

      if (particle.material.rgbFilter){
        rgbFilterX = particle.material.rgbFilter.x;
        rgbFilterY = particle.material.rgbFilter.y;
        rgbFilterZ = particle.material.rgbFilter.z;
      }

      if (particle.motionMode == MOTION_MODE_NORMAL){
        this.positions[i2] = particle.x;
      }else{
        this.positions[i2] = particle.initialAngle;
      }
      this.rgbThresholds[i2] = rgbFilterX;
      i2++;
      if (particle.motionMode == MOTION_MODE_NORMAL){
        this.positions[i2] = particle.y;
      }else{
        this.positions[i2] = particle.angularAcceleration;
      }
      this.rgbThresholds[i2] = rgbFilterY;
      i2++;
      this.positions[i2] = particle.z;
      this.rgbThresholds[i2] = rgbFilterZ;
      i2++;

      this.targetColors[i4++] = particle.material.targetRed;
      this.targetColors[i4++] = particle.material.targetGreen;
      this.targetColors[i4++] = particle.material.targetBlue;
      this.targetColors[i4++] = particle.material.colorStep;

      this.flags4[i9++] = particle.material.red;
      this.flags4[i9++] = particle.material.green;
      this.flags4[i9++] = particle.material.blue;
      if (particle.useWorldPositionFlag){
        this.flags4[i9++] = 20;
      }else{
        this.flags4[i9++] = 0;
      }

      particle.parent = this;
      particle.index = this.totalParticleCount;
      this.totalParticleCount ++;

      this.flags2[i6++] = particle.material.size;
      this.flags2[i6++] = particle.material.alpha;
      this.expiredFlags[i] = 0;
      if (particle.material.texture){
        this.flags2[i6++] = 10;
        var range = textureMerger.ranges[particle.material.texture];
        this.uvCoordinates[i10++] = range.startU;
        this.uvCoordinates[i10++] = range.startV;
        this.uvCoordinates[i10++] = range.endU;
        this.uvCoordinates[i10++] = range.endV;
      }else{
        this.flags2[i6++] = -10;
        this.uvCoordinates[i10++] = -10;
        this.uvCoordinates[i10++] = -10;
        this.uvCoordinates[i10++] = -10;
        this.uvCoordinates[i10++] = -10;
      }

      var startDelay = 0;
      if (!(typeof particle.startDelay == UNDEFINED)){
        startDelay = particle.startDelay;
      }
      this.flags2[i6++] = startDelay;

      if (particle.respawnSet){
        this.flags1[i5++] = 7;
      }else{
        this.flags1[i5++] = 0;
      }

      if (particle.gpuMotion){
        this.accelerations[i3] = particle.gpuAcceleration.x;
        this.velocities[i3++] = particle.gpuVelocity.x;
        this.accelerations[i3] = particle.gpuAcceleration.y;
        this.velocities[i3++] = particle.gpuVelocity.y;
        this.accelerations[i3] = particle.gpuAcceleration.z;
        this.velocities[i3++] = particle.gpuVelocity.z;
      }else{
        this.accelerations[i3] = 0;
        this.velocities[i3++] = 0;
        this.accelerations[i3] = 0;
        this.velocities[i3++] = 0;
        this.accelerations[i3] = 0;
        this.velocities[i3++] = 0;
      }

      if (!(typeof particle.alphaDelta == UNDEFINED)){
        this.flags1[i5++] = particle.alphaDelta;
      }else{
        this.flags1[i5++] = 0;
      }

      if (!particle.trailFlag){
        this.flags1[i5++] = 0.0;
      }else{
        if (this.motionMode == MOTION_MODE_CIRCULAR){
          this.flags1[i5++] = 0.0;
        }else{
          this.flags1[i5++] = 7.0;
        }
      }

      this.flags1[i5++] = particle.lifetime;

      if (particle.alphaVariationMode == ALPHA_VARIATION_MODE_NORMAL){
        this.flags3[i7++] = 5;
      }else if (particle.alphaVariationMode == ALPHA_VARIATION_MODE_SIN){
        this.flags3[i7++] = 15;
      }else if (particle.alphaVariationMode == ALPHA_VARIATION_MODE_COS){
        this.flags3[i7++] = 25;
      }else{
        this.flags3[i7++] = -20;
      }

      if (particle.motionMode == MOTION_MODE_NORMAL){
        this.flags3[i7++] = 5;
      }else if (particle.motionMode == MOTION_MODE_CIRCULAR){
        this.flags3[i7++] = 15;
      }else{
        this.flags3[i7++] = -20;
      }

      this.flags3[i7++] = particle.angularVelocity;
      this.flags3[i7++] = particle.angularMotionRadius;

      this.angularQuaternions[i8++] = particle.angularQuaternionX;
      this.angularQuaternions[i8++] = particle.angularQuaternionY;
      this.angularQuaternions[i8++] = particle.angularQuaternionZ;
      this.angularQuaternions[i8++] = particle.angularQuaternionW;

      if (particle.checkForCollisions){
        if (!this.hasParticleCollision){
          if (TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS >= MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS){
            throw new Error("Maximum "+MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS+" particles can have collidable particles.");
            return;
          }
          TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS ++;
          this.hasParticleCollision = true;
        }
        this.particlesWithCollisionCallbacks.set(particle.uuid, particle);
        if (isCollisionWorkerEnabled()){
          if (!this.checkForCollisionBuffer){
            this.checkForCollisionBuffer = new Object();
          }
          this.checkForCollisionBuffer[particle.uuid] = particle;
        }
      }

    }
  }else{
    for (var i = 0; i<this.particles.length; i++){
      var particle = this.particles[i];
      this.expiredFlags[i] = 0;
      this.flags2[i6++] = particle.material.size;
      this.flags2[i6++] = particle.material.alpha;
      if (particle.material.texture){
        this.flags2[i6++] = 10;
      }else{
        this.flags2[i6++] = -10;
      }
      this.flags2[i6++] = particle.originalStartDelay;
    }
  }

  if (this.copyPS){

    this.positionBufferAttribute = this.copyPS.positionBufferAttribute;
    this.rgbThresholdBufferAttribute = this.copyPS.rgbThresholdBufferAttribute;
    this.velocityBufferAttribute = this.copyPS.velocityBufferAttribute;
    this.accelerationBufferAttribute = this.copyPS.accelerationBufferAttribute;
    this.targetColorBufferAttribute = this.copyPS.targetColorBufferAttribute;
    this.flags1BufferAttribute = this.copyPS.flags1BufferAttribute;
    this.flags3BufferAttribute = this.copyPS.flags3BufferAttribute;
    this.flags4BufferAttribute = this.copyPS.flags4BufferAttribute;
    this.angularQuaternionsBufferAttribute = this.copyPS.angularQuaternionsBufferAttribute;
    this.uvCoordinatesBufferAttribute = this.copyPS.uvCoordinatesBufferAttribute;

    this.expiredFlagBufferAttribute = new THREE.BufferAttribute(this.expiredFlags, 1);
    this.flags2BufferAttribute = new THREE.BufferAttribute(this.flags2, 4);
    this.expiredFlagBufferAttribute.setDynamic(true);
    this.flags2BufferAttribute.setDynamic(true);
  }else{
    this.positionBufferAttribute = new THREE.BufferAttribute(this.positions, 3);
    this.rgbThresholdBufferAttribute = new THREE.BufferAttribute(this.rgbThresholds, 3);
    this.expiredFlagBufferAttribute = new THREE.BufferAttribute(this.expiredFlags, 1);
    this.velocityBufferAttribute = new THREE.BufferAttribute(this.velocities, 3);
    this.accelerationBufferAttribute = new THREE.BufferAttribute(this.accelerations, 3);
    this.targetColorBufferAttribute = new THREE.BufferAttribute(this.targetColors, 4);
    this.flags1BufferAttribute = new THREE.BufferAttribute(this.flags1, 4);
    this.flags2BufferAttribute = new THREE.BufferAttribute(this.flags2, 4);
    this.flags3BufferAttribute = new THREE.BufferAttribute(this.flags3, 4);
    this.flags4BufferAttribute = new THREE.BufferAttribute(this.flags4, 4);
    this.angularQuaternionsBufferAttribute = new THREE.BufferAttribute(this.angularQuaternions, 4);
    this.uvCoordinatesBufferAttribute = new THREE.BufferAttribute(this.uvCoordinates, 4);

    this.positionBufferAttribute.setDynamic(false);
    this.rgbThresholdBufferAttribute.setDynamic(false);
    this.expiredFlagBufferAttribute.setDynamic(true);
    this.velocityBufferAttribute.setDynamic(false);
    this.accelerationBufferAttribute.setDynamic(false);
    this.targetColorBufferAttribute.setDynamic(false);
    this.flags1BufferAttribute.setDynamic(false);
    this.flags2BufferAttribute.setDynamic(true);
    this.flags3BufferAttribute.setDynamic(false);
    this.flags4BufferAttribute.setDynamic(false);
    this.angularQuaternionsBufferAttribute.setDynamic(false);
    this.uvCoordinatesBufferAttribute.setDynamic(false);

  }

  this.geometry.addAttribute('position', this.positionBufferAttribute);
  this.geometry.addAttribute('rgbThreshold', this.rgbThresholdBufferAttribute);
  this.geometry.addAttribute('expiredFlag', this.expiredFlagBufferAttribute);
  this.geometry.addAttribute('velocity', this.velocityBufferAttribute);
  this.geometry.addAttribute('acceleration', this.accelerationBufferAttribute);
  this.geometry.addAttribute('targetColor', this.targetColorBufferAttribute);
  this.geometry.addAttribute('flags1', this.flags1BufferAttribute);
  this.geometry.addAttribute('flags2', this.flags2BufferAttribute);
  this.geometry.addAttribute('flags3', this.flags3BufferAttribute);
  this.geometry.addAttribute('flags4', this.flags4BufferAttribute);
  this.geometry.addAttribute('angularQuaternion', this.angularQuaternionsBufferAttribute);
  this.geometry.addAttribute('uvCoordinates', this.uvCoordinatesBufferAttribute);
  this.geometry.setDrawRange(0, particles.length);


  this.velocity = new THREE.Vector3(vx, vy, vz);
  this.acceleration = new THREE.Vector3(ax, ay, az);
  var motionModeFlag = -10.0;
  if (this.motionMode == MOTION_MODE_NORMAL){
    motionModeFlag = 5.0;
  }else if (this.motionMode == MOTION_MODE_CIRCULAR){
    motionModeFlag = 20.0;
  }

  var texture;
  if (textureMerger){
    texture = textureMerger.mergedTexture;
  }else{
    texture = nullTexture;
  }

  if (!this.copyPS){
    this.material = new THREE.RawShaderMaterial({
      vertexShader: ShaderContent.particleVertexShader,
      fragmentShader: ShaderContent.particleFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms:{
        modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
        projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
        cameraPosition: GLOBAL_CAMERA_POSITION_UNIFORM,
        worldMatrix: new THREE.Uniform(new THREE.Matrix4()),
        viewMatrix: GLOBAL_VIEW_UNIFORM,
        time: new THREE.Uniform(0.0),
        texture: new THREE.Uniform(texture),
        dissapearCoef: new THREE.Uniform(0.0),
        stopInfo: new THREE.Uniform(new THREE.Vector3(-10, -10, -10)),
        parentMotionMatrix: new THREE.Uniform(new THREE.Matrix3().fromArray([
          x, y, z, vx, vy, vz, ax, ay, az
        ])),
        fogInfo: GLOBAL_FOG_UNIFORM,
        cubeTexture: GLOBAL_CUBE_TEXTURE_UNIFORM
      }
    });
  }else{
    this.material = this.copyPS.material.clone();
    this.material.uniforms.projectionMatrix = GLOBAL_PROJECTION_UNIFORM;
    this.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    this.material.uniforms.viewMatrix = GLOBAL_VIEW_UNIFORM;
    this.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    this.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    this.material.uniforms.skyboxAlpha = GLOBAL_SKYBOX_ALPHA_UNIFORM;
  }

  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.position.set(x, y, z);
  this.mesh.frustumCulled = false;
  this.mesh.visible = false;

  scene.add(this.mesh);
  particleSystemPool[name] = this;

}

ParticleSystem.prototype.generatePSCollisionInfo = function(){
  var obj = this.collisionWorkerInfo;
  obj.name = this.name;
  obj.psCollisionWorkerIndex = this.psCollisionWorkerIndex;
  obj.psCollisionWorkerSegment = this.psCollisionWorkerSegment;
  obj.x = this.x;
  obj.y = this.y;
  obj.z = this.z;
  obj.vx = this.vx;
  obj.vy = this.vy;
  obj.vz = this.vz;
  obj.ax = this.ax;
  obj.ay = this.ay;
  obj.az = this.az;
  obj.motionMode = this.motionMode;
  obj.angularVelocity = this.angularVelocity;
  obj.angularAcceleration = this.angularAcceleration;
  obj.angularMotionRadius = this.angularMotionRadius;
  obj.angularQuaternionX = this.angularQuaternionX;
  obj.angularQuaternionY = this.angularQuaternionY;
  obj.angularQuaternionZ = this.angularQuaternionZ;
  obj.angularQuaternionW = this.angularQuaternionW;
  obj.initialAngle = this.initialAngle;
  obj.lifetime = this.lifetime;
  obj.collisionTimeOffset = this.collisionTimeOffset;
  return obj;
}

ParticleSystem.prototype.generateNewPSInfo = function(){
  return this.name+","+this.collisionWorkerIndex+","+this.x+","+this.y+","+this.z+","+
         this.vx+","+this.vy+","+this.vz+","+this.ax+","+this.ay+","+this.az;
}

ParticleSystem.prototype.notifyParticleCollisionCallbackChange = function(particle){
  if (particle.checkForCollisions){
    this.particlesWithCollisionCallbacks.set(particle.uuid, particle);
  }else{
    this.particlesWithCollisionCallbacks.delete(particle.uuid);
  }
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

ParticleSystem.prototype.stop = function(newLifetime){
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.velocity.z = 0;
  this.acceleration.x = 0;
  this.acceleration.y = 0;
  this.acceleration.z = 0;
  this.originalCheckForCollisions = this.checkForCollisions;
  this.checkForCollisions = false;
  if (!this.psMerger){
    this.material.uniforms.stopInfo.value.set(10.0, this.tick, newLifetime);
  }else{
    this.psMerger.material.uniforms.stopInfoArray.value[this.mergedIndex].set(10.0, this.tick, newLifetime);
  }
  this.originalLifetime = this.lifetime;
  this.lifetime = (this.tick + newLifetime);
  this.stopped = true;
  this.stoppedX = this.mesh.position.x;
  this.stoppedY = this.mesh.position.y;
  this.stoppedZ = this.mesh.position.z;
  if(!isCollisionWorkerEnabled()){
    this.particlesWithCollisionCallbacks.forEach(this.particleIterationStopFunc);
  }
}

ParticleSystem.prototype.particleIterationStopFunc = function(value, key){
  var particle = value;
  particle.stopLifetime = newLifetime;
  particle.respawnSet = false;
  particle.stopTick = this.tick;
  particle.lifetime = newLifetime;
  if (particle.startDelay > this.tick){
    particle.startDelay = this.tick;
  }
}

ParticleSystem.prototype.setBlending = function(mode){
  this.material.blending = mode;
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
  selectedGeometry.attributes.expiredFlag.updateRange.push({
    offset: selectedOffset, count: 1
  });
  selectedGeometry.attributes.expiredFlag.array[particle.index] = 7;
  selectedGeometry.attributes.expiredFlag.needsUpdate = true;
  particle.isExpired = true;
  if (particle.uuid){
    this.particlesWithCollisionCallbacks.delete(particle.uuid);
  }
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
  selectedGeometry.attributes.flags2.updateRange.push({
    offset: sIndex, count: 1
  });
  particle.startDelay = this.tick + delay;
  selectedGeometry.attributes.flags2.array[sIndex] = particle.startDelay;
  selectedGeometry.attributes.flags2.needsUpdate = true;
}

ParticleSystem.prototype.calculatePseudoPosition = function(fromWorker){
  var pseudoTick = this.tick + (this.collisionTimeOffset * (1/60));
  var vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0;
  if (!fromWorker){
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
  }else{
    vx = this.vx;
    vy = this.vy;
    vz = this.vz;
    ax = this.ax;
    ay = this.ay;
    az = this.az;
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

  this.tick += (1/60);

  if (this.tick > MAX_PS_TIME){
    this.tick = 0;
  }

  if (!this.psMerger){
    this.material.uniforms.time.value = this.tick;
    this.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;
    this.material.uniforms.worldMatrix.value = this.mesh.matrixWorld;
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

  if (!isCollisionWorkerEnabled()){
    this.particlesWithCollisionCallbacks.forEach(this.particleIterationCollisionFunc);
  }

  if (this.gpuMotionUpdateBuffer.length > 0){
    var firstIndex = this.gpuMotionUpdateBuffer[0].index;
    for (var i = 0; i<this.gpuMotionUpdateBuffer.length; i++){
      this.updateGPUMotion(this.gpuMotionUpdateBuffer[i]);
      if (this.gpuMotionUpdateBuffer[i].index < firstIndex){
        firstIndex = this.gpuMotionUpdateBuffer[i].index;
      }
    }
    this.partialGPUMotionBufferUpdate(firstIndex);
    this.gpuMotionUpdateBuffer = [];
  }

  if (this.tick >= this.lifetime && this.lifetime > 0){
    if (this.expirationFunction){
      this.expirationFunction(this.name);
    }
    if (!this.psMerger){
      delete particleSystems[this.name];
    }else{
      this.psMerger.material.uniforms.hiddenArray.value[this.mergedIndex] = 20.0;
      this.psMerger.notifyPSVisibilityChange(this, false);
    }
    this.mesh.visible = false;
    if (!(typeof this.psPool == UNDEFINED)){
      particleSystemPools[this.psPool].notifyPSAvailable(this);
    }
  }

  if (this.checkForCollisions && !isPSCollisionWorkerEnabled() && this.mesh && this.mesh.visible){
    this.handleCollisions();
  }
}

ParticleSystem.prototype.particleIterationCollisionFunc = function(value){
  var particle = value;
  if (!particle.isExpired){
    particle.handleCollisions();
  }
}

ParticleSystem.prototype.partialGPUMotionBufferUpdate = function(firstIndex){
  this.geometry.attributes.velocity.updateRange.offset = 3 * firstIndex;
  this.geometry.attributes.velocity.updateRange.count = this.particles.length * 3;
  this.geometry.attributes.acceleration.updateRange.offset = 3 * firstIndex;
  this.geometry.attributes.acceleration.updateRange.count = this.particles.length * 3;
  this.geometry.attributes.velocity.needsUpdate = true;
  this.geometry.attributes.acceleration.needsUpdate = true;
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
}

ParticleSystem.prototype.handleCollisions = function(fromWorker){
  var results;
  var pseudoPosition;
  if (this.collisionTimeOffset == 0){
    if (fromWorker){
      results = worldBinHandler.query(this.mesh.position);
    }else{
      results = rayCaster.binHandler.query(this.mesh.position);
    }
  }else{
    pseudoPosition = this.calculatePseudoPosition(fromWorker);
    if (fromWorker){
      results = worldBinHandler.query(pseudoPosition);
    }else{
      results = rayCaster.binHandler.query(pseudoPosition);
    }
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
      var intersectionPoint;
      if (!fromWorker){
        intersectionPoint = obj.intersectsLine(this.positionLine);
      }else{
        var res = intersectsLine(objName, this);
        if (res){
          return;
        }
        continue;
      }
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
        if (!fromWorker){
          obj = parent.group[childName];
        }else{
          obj = true;
        }
        if (!obj){
          return;
        }
        if (!fromWorker){
          var intersectionPoint = obj.intersectsLine(this.positionLine);
        }else{
          if (intersectsLine(objName, this, childName)){
            return;
          }
        }
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
