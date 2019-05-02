var ParticleSystemGenerator = function(){

}

ParticleSystemGenerator.prototype.normalizeVector = function(vector){
  var len = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y) + (vector.z * vector.z));
  vector.x = vector.x / len;
  vector.y = vector.y / len;
  vector.z = vector.z / len;
}

ParticleSystemGenerator.prototype.computeQuaternionFromVectors = function(vec1, vec2){
  this.normalizeVector(vec1);
  this.normalizeVector(vec2);
  REUSABLE_VECTOR.set(vec1.x, vec1.y, vec1.z);
  REUSABLE_VECTOR_2.set(vec2.x, vec2.y, vec2.z);
  REUSABLE_QUATERNION.setFromUnitVectors(REUSABLE_VECTOR, REUSABLE_VECTOR_2);
  return REUSABLE_QUATERNION.clone();
}

ParticleSystemGenerator.prototype.circularDistribution = function(radius, quaternion){
  REUSABLE_VECTOR_3.set(Math.random() - 0.5, Math.random() - 0.5, 0);
  REUSABLE_VECTOR_3.normalize();
  REUSABLE_VECTOR_3.multiplyScalar(radius);
  if (!(typeof quaternion == UNDEFINED)){
    REUSABLE_VECTOR_3.applyQuaternion(quaternion);
  }
  return new THREE.Vector3(REUSABLE_VECTOR_3.x, REUSABLE_VECTOR_3.y, REUSABLE_VECTOR_3.z);
}

ParticleSystemGenerator.prototype.applyNoise = function(vec){
  var toNormalize = REUSABLE_VECTOR.set(vec.x, vec.y, vec.z);
  toNormalize.normalize();
  var noiseAmount = noise.perlin3(toNormalize.x, toNormalize.y, toNormalize.z);
  var vector3 = REUSABLE_VECTOR_2.set(vec.x, vec.y, vec.z);
  var toMultiplyScalar = REUSABLE_VECTOR_3.set(vec.x, vec.y, vec.z);
  toMultiplyScalar.multiplyScalar(noiseAmount);
  vector3.add(toMultiplyScalar);
  return new THREE.Vector3(vector3.x, vector3.y, vector3.z);
}

ParticleSystemGenerator.prototype.generateConfettiExplosion = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var lifetime = configurations.lifetime;
  var verticalSpeed = configurations.verticalSpeed;
  var horizontalSpeed = configurations.horizontalSpeed;
  var verticalAcceleration = configurations.verticalAcceleration;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var collisionMethod = (!(typeof configurations.collisionMethod == UNDEFINED))? configurations.collisionMethod: 0;
  var normal = configurations.normal;
  var collisionTimeOffset= (!(typeof configurations.collisionTimeOffset == UNDEFINED))? configurations.collisionTimeOffset: 0;
  var startDelay = (!(typeof configurations.startDelay == UNDEFINED))? configurations.startDelay: 0;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var alphaVariation = configurations.alphaVariation;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var normalSet = false;
  if (!(typeof normal == UNDEFINED)){
    normalSet = true;
  }
  var particleMaterial = this.generateParticleMaterial({
    color: colorName,
    size: particleSize,
    alpha: alpha,
    textureName: textureName,
    rgbFilter: rgbFilter,
    targetColor: targetColorName,
    colorStep: colorStep
  });
  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.position = new THREE.Vector3(0, 0, 0);
  particleConfigurations.material = particleMaterial;
  particleConfigurations.alphaVariation = alphaVariation;
  if (collisionMethod == PARTICLE_REWIND_ON_COLLIDED){
    particleConfigurations.respawn = true;
  }else{
    particleConfigurations.respawn = false;
  }
  for (var i = 0; i<particleCount; i++){
    particleConfigurations.startDelay = startDelay * Math.random();
    particleConfigurations.lifetime = lifetime;
    var v1 = horizontalSpeed * (Math.random() - 0.5);
    var v2 = horizontalSpeed * (Math.random() - 0.5);
    var v3 = verticalSpeed * Math.random();
    particleConfigurations.velocity = new THREE.Vector3(v1, v3, v2);
    particleConfigurations.acceleration = new THREE.Vector3(0, verticalAcceleration, 0);
    particleConfigurations.collisionAction = collisionMethod;
    particleConfigurations.collisionTimeOffset = collisionTimeOffset;
    var particle = this.generateParticle(particleConfigurations);
    particles.push(particle);
  }
  var ps = this.generateParticleSystem({name: name, particles: particles, position: position, lifetime: expireTime});
  if (normalSet){
    var quat = this.computeQuaternionFromVectors(new THREE.Vector3(0, 1, 0), normal);
    ps.mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  }
  return ps;
}

ParticleSystemGenerator.prototype.generateSmoke = function(configurations){
  var smokeSize = configurations.smokeSize;
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var smokeSize = configurations.smokeSize;
  var particleSize = configurations.particleSize;
  var particleCount = configurations.particleCount;
  var colorName = configurations.colorName;
  var textureName = configurations.textureName;
  var movementAxis = (!(typeof configurations.movementAxis == UNDEFINED))? configurations.movementAxis: new THREE.Vector3(0, 1, 0);
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var randomness = configurations.randomness;
  var lifetime = configurations.lifetime;
  var alphaVariation = configurations.alphaVariation;
  var updateFunction = configurations.updateFunction;
  var startDelay = (!(typeof configurations.startDelay == UNDEFINED))? configurations.startDelay: 0;
  var rgbFilter = configurations.rgbFilter;
  var accelerationDirection = configurations.accelerationDirection;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 1;
  if (!(typeof textureName == UNDEFINED)){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }
  var quat = this.computeQuaternionFromVectors(new THREE.Vector3(0, 1, 0), movementAxis);
  var quaternion2, quaternionInverse;
  var referenceVector = new THREE.Vector3(0, 1, 0);
  var referenceQuaternion = this.computeQuaternionFromVectors(new THREE.Vector3(0, 0, 1), referenceVector);
  if (accelerationDirection){
    quaternion2 = this.computeQuaternionFromVectors(referenceVector, accelerationDirection);
    quaternionInverse = quat.clone().inverse();
  }
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  for (var i = 0; i<particleCount; i++){
    particleConfigurations.position = this.applyNoise(this.circularDistribution(smokeSize, referenceQuaternion));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = lifetime * Math.random();
    particleConfigurations.respawn = true;
    particleConfigurations.alphaVariation = alphaVariation;
    particleConfigurations.startDelay = startDelay * Math.random();
    var decidedVelocity = new THREE.Vector3(0, velocity * Math.random(), 0);
    var decidedAcceleration = new THREE.Vector3(randomness * (Math.random() - 0.5), acceleration * Math.random(), randomness * (Math.random() - 0.5));
    if (!accelerationDirection){
      particleConfigurations.velocity = decidedVelocity;
      particleConfigurations.acceleration = decidedAcceleration;
    }else{
      REUSABLE_VECTOR_4.set(decidedAcceleration.x, decidedAcceleration.y, decidedAcceleration.z);
      REUSABLE_VECTOR_4.applyQuaternion(quaternionInverse);
      REUSABLE_VECTOR_4.applyQuaternion(quaternion2);
      particleConfigurations.velocity = decidedVelocity;
      particleConfigurations.acceleration = new THREE.Vector3(REUSABLE_VECTOR_4.x, REUSABLE_VECTOR_4.y, REUSABLE_VECTOR_4.z);
    }
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  if (updateFunction){
    particleSystemConfigurations.updateFunction = updateFunction;
  }
  var smoke = this.generateParticleSystem(particleSystemConfigurations);
  smoke.mesh.applyQuaternion(quat);
  return smoke;
}

ParticleSystemGenerator.prototype.generateMagicCircle = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var expireTime = configurations.expireTime;
  var speed = configurations.speed;
  var acceleration = configurations.acceleration;
  var radius = configurations.radius;
  var circleNormal = (!(typeof configurations.circleNormal == UNDEFINED))? configurations.circleNormal: new THREE.Vector3(0, 1, 0);
  var circleDistortionCoefficient = (!(typeof configurations.circleDistortionCoefficient == UNDEFINED))? configurations.circleDistortionCoefficient: 1;
  var lifetime = (!(typeof configurations.lifetime == UNDEFINED))? configurations.lifetime: 0;
  var angleStep = (!(typeof configurations.angleStep == UNDEFINED))? configurations.angleStep: 0;
  var particleSize = configurations.particleSize;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var alpha = configurations.alpha;
  var alphaVariation = (!(typeof configurations.alphaVariation == UNDEFINED))? configurations.alphaVariation: 0;
  var alphaVariationMode = (!(typeof configurations.alphaVariationMode == UNDEFINED))? configurations.alphaVariationMode: ALPHA_VARIATION_MODE_NORMAL;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.angularVelocity = speed;
  particleConfigurations.angularAcceleration = acceleration;
  particleConfigurations.lifetime = lifetime;
  particleConfigurations.respawn = true;
  particleConfigurations.motionMode = MOTION_MODE_CIRCULAR;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.alphaVariationMode = alphaVariationMode;
  var referenceQuaternion = this.computeQuaternionFromVectors(new THREE.Vector3(0, 1, 0), circleNormal);
  var angularCounter = 0;
  for (var i = 0; i<particleCount; i++){
    particleConfigurations.angularMotionRadius = radius + (circleDistortionCoefficient * (Math.random() - 0.5));
    if (angleStep == 0){
      particleConfigurations.initialAngle = 1000 * Math.random();
    }else{
      particleConfigurations.initialAngle = angularCounter;
      angularCounter += angleStep;
    }
    particleConfigurations.angularQuaternion = referenceQuaternion;
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generatePlasma = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var radius = configurations.radius;
  var avgParticleSpeed = configurations.avgParticleSpeed;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var alpha = (!(typeof configurations.alpha == UNDEFINED))? configurations.alpha: 1;
  var colorName = configurations.colorName;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var alphaVariation = configurations.alphaVariation;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  if (!(typeof textureName == UNDEFINED)){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  if (!(typeof alphaVariation == UNDEFINED)){
    particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_SIN;
    particleConfigurations.alphaVariation = alphaVariation;
  }
  particleConfigurations.motionMode = MOTION_MODE_CIRCULAR;
  particleConfigurations.angularMotionRadius = radius;
  var tmpVec = new THREE.Vector3(0, 1, 0);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.angularVelocity = avgParticleSpeed * (Math.random() - 0.5);
    particleConfigurations.initialAngle = 360 * Math.random();
    particleConfigurations.angularQuaternion = this.computeQuaternionFromVectors(tmpVec, new THREE.Vector3(radius * (Math.random() - 0.5), radius * (Math.random() - 0.5) , radius * (Math.random() - 0.5)));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = 0;
    particleConfigurations.respawn = false;
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.lifetime = expireTime;
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generateParticleMaterial = function(configurations){
  var color = configurations.color;
  var size = configurations.size;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var targetColor = configurations.targetColor;
  var colorStep = (!(typeof configurations.colorStep == UNDEFINED))? configurations.colorStep: 0;
  return new ParticleMaterial(configurations);
}

ParticleSystemGenerator.prototype.generateParticle = function(configurations){
  var position = configurations.position;
  var material = configurations.material;
  var lifetime = configurations.lifetime;
  var respawn = configurations.respawn;
  var alphaVariation = configurations.alphaVariation;
  var alphaVariationMode = configurations.alphaVariationMode;
  var startDelay = (!(typeof configurations.startDelay == UNDEFINED))? configurations.startDelay: 0;
  var trailMode = (!(typeof configurations.trailMode == UNDEFINED))? configurations.trailMode: false;
  var useWorldPosition = (!(typeof configurations.useWorldPosition == UNDEFINED))? configurations.useWorldPosition: false;
  var velocity = (!(typeof configurations.velocity == UNDEFINED))? configurations.velocity: new THREE.Vector3(0, 0, 0);
  var acceleration = (!(typeof configurations.acceleration == UNDEFINED))? configurations.acceleration: new THREE.Vector3(0, 0, 0);
  var initialAngle = configurations.initialAngle;
  var angularVelocity = (!(typeof configurations.angularVelocity == UNDEFINED))? configurations.angularVelocity: 0;
  var angularAcceleration = (!(typeof configurations.angularAcceleration == UNDEFINED))? configurations.angularAcceleration: 0;
  var angularMotionRadius = (!(typeof configurations.angularMotionRadius == UNDEFINED))? configurations.angularMotionRadius: 0;
  var angularQuaternion = (!(typeof configurations.angularQuaternion == UNDEFINED))? configurations.angularQuaternion: REUSABLE_QUATERNION.set(0, 0, 0, 1);
  var motionMode = (!(typeof configurations.motionMode == UNDEFINED))? configurations.motionMode: MOTION_MODE_NORMAL;
  var collisionAction = configurations.collisionAction;
  var collisionTimeOffset = (!(typeof configurations.collisionTimeOffset == UNDEFINED))? configurations.collisionTimeOffset: 0;
  if (motionMode == MOTION_MODE_NORMAL){
    initialAngle = 0;
  }
  if (motionMode == MOTION_MODE_CIRCULAR){
    position = new THREE.Vector3(0, 0, 0);
  }
  var particle = new Particle(position.x, position.y, position.z, material, lifetime);
  if (respawn){
    particle.respawnSet = true;
  }
  if (!(typeof alphaVariation == UNDEFINED)){
    particle.alphaDelta = alphaVariation;
  }else{
    particle.alphaDelta = 0;
  }
  if (!(typeof alphaVariationMode == UNDEFINED)){
    particle.alphaVariationMode = alphaVariationMode;
  }else{
    particle.alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL;
  }
  particle.startDelay = startDelay;
  particle.originalStartDelay = startDelay;
  particle.trailFlag = trailMode;
  particle.useWorldPositionFlag = useWorldPosition;
  particle.gpuVelocity = velocity;
  particle.gpuAcceleration = acceleration;
  particle.initialAngle = initialAngle;
  particle.angularVelocity = angularVelocity;
  particle.angularAcceleration = angularAcceleration;
  particle.angularMotionRadius = angularMotionRadius;
  particle.angularQuaternion = angularQuaternion;
  particle.motionMode = motionMode;
  particle.angularQuaternionX = angularQuaternion.x;
  particle.angularQuaternionY = angularQuaternion.y;
  particle.angularQuaternionZ = angularQuaternion.z;
  particle.angularQuaternionW = angularQuaternion.w;
  if (!(typeof collisionAction == UNDEFINED)){
    particle.setCollisionListener(collisionAction, collisionTimeOffset);
    particle.creationConfigurations = new Object();
    for (var key in configurations){
      if (key == "material"){
        continue;
      }
      particle.creationConfigurations[key] = configurations[key];
    }
  }
  return particle;
}

ParticleSystemGenerator.prototype.generateParticleSystem = function(configurations){
  var name = configurations.name;
  var particles = configurations.particles;
  var position = configurations.position;
  var lifetime = configurations.lifetime;
  var updateFunction = configurations.updateFunction;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var angularVelocity = (!(typeof configurations.angularVelocity == UNDEFINED))? configurations.angularVelocity: 0;
  var angularAcceleration = (!(typeof configurations.angularAcceleration == UNDEFINED))? configurations.angularAcceleration: 0;
  var angularMotionRadius = (!(typeof configurations.angularMotionRadius == UNDEFINED))? configurations.angularMotionRadius: 0;
  var angularQuaternion = (!(typeof configurations.angularQuaternion == UNDEFINED))? configurations.angularQuaternion: REUSABLE_QUATERNION.set(0, 0, 0, 1);
  var initialAngle = (!(typeof configurations.initialAngle == UNDEFINED))? configurations.initialAngle: 0;
  var motionMode = (!(typeof configurations.motionMode == UNDEFINED))? configurations.motionMode: MOTION_MODE_NORMAL;
  var vx = 0, vy = 0, vz = 0, ax = 0, ay = 0, az = 0;
  if (velocity){
    vx = velocity.x;
    vy = velocity.y;
    vz = velocity.z;
  }
  if (acceleration){
    ax = acceleration.x;
    ay = acceleration.y;
    az = acceleration.z;
  }
  if (!updateFunction){
    updateFunction = null;
  }
  var particleSystem = new ParticleSystem(null, name, particles, position.x, position.y, position.z, vx, vy, vz, ax, ay, az, motionMode, updateFunction);
  particleSystem.lifetime = lifetime;
  particleSystem.angularVelocity = angularVelocity;
  particleSystem.angularAcceleration = angularAcceleration;
  particleSystem.angularMotionRadius = angularMotionRadius;
  particleSystem.angularQuaternionX = angularQuaternion.x;
  particleSystem.angularQuaternionY = angularQuaternion.y;
  particleSystem.angularQuaternionZ = angularQuaternion.z;
  particleSystem.angularQuaternionW = angularQuaternion.w;
  particleSystem.initialAngle = initialAngle;
  TOTAL_PARTICLE_SYSTEM_COUNT ++;
  if (particleSystem.hasParticleCollision){
    particleSystem.creationConfigurations = new Object();
    for (var key in configurations){
      if (key == "particles"){
        continue;
      }
      particleSystem.creationConfigurations[key] = configurations[key];
    }
    rayCaster.onParticleSystemGeneration(particleSystem);
  }
  return particleSystem;
}

ParticleSystemGenerator.prototype.generateParticleSystemMesh = function(ps){
  var textureMerger = 0;
  var texturesObj = new Object();
  var textureCount = 0;
  var mergedTextureHash = "";
  var noTargetColor = true;
  var particles = ps.particles;
  for (var i = 0; i<particles.length; i++){
    if (!particles[i].material.noTargetColor){
      noTargetColor = false;
    }
    if (particles[i].material.texture){
      if (!texturesObj[particles[i].material.texture]){
        mergedTextureHash = particles[i].material.texture + PIPE;
      }
      texturesObj[particles[i].material.texture] = textures[particles[i].material.texture];
      textureCount ++;
    }
  }
  ps.noTargetColor = noTargetColor;
  ps.texturesObj = texturesObj;
  if (textureCount > 0 && !mergedTextureCache[mergedTextureHash]){
    textureMerger = new TextureMerger(texturesObj);
    mergedTextureCache[mergedTextureHash] = textureMerger;
  }else if (textureCount > 0 && mergedTextureCache[mergedTextureHash]){
    textureMerger = mergedTextureCache[mergedTextureHash];
  }
  ps.totalParticleCount = 0;
  var len = ps.particles.length;
  ps.geometry = new THREE.BufferGeometry();
  ps.expiredFlags = new Float32Array(len);
  ps.flags2 = new Float32Array(len * 4);
  if (!ps.copyPS){
    ps.positions = new Float32Array(len * 3);
    if (textureCount > 0){
      ps.rgbThresholds = new Float32Array(len * 3);
      ps.uvCoordinates = new Float32Array(len * 4);
    }
    ps.velocities = new Float32Array(len * 3);
    ps.accelerations = new Float32Array(len * 3);
    ps.flags1 = new Float32Array(len * 4);
    ps.flags3 = new Float32Array(len * 4);
    ps.flags4 = new Float32Array(len * 4);
    if (!noTargetColor){
      ps.targetColors = new Float32Array(len * 4);
    }
    ps.angularQuaternions = new Float32Array(len * 4);
  }else{
    ps.positions = ps.copyPS.positions;
    if (textureCount > 0){
      ps.rgbThresholds = ps.copyPS.rgbThresholds;
      ps.uvCoordinates = ps.copyPS.uvCoordinates;
    }
    ps.velocities = ps.copyPS.velocities
    ps.accelerations = ps.copyPS.accelerations
    ps.flags1 = ps.copyPS.flags1;
    ps.flags3 = ps.copyPS.flags3;
    ps.flags4 = ps.copyPS.flags4;
    if (!noTargetColor){
      ps.targetColors = ps.copyPS.targetColors;
    }
    ps.angularQuaternions = ps.copyPS.angularQuaternions;
  }
  var i2 = 0; var i3 = 0; var i4 = 0; var i5 = 0; var i6 = 0; var i7 = 0; var i8 = 0; var i9 = 0; var i10 = 0;
  if (!ps.copyPS){
    for (var i = 0; i<particles.length; i++){
      var particle = particles[i];
      particle.parent = ps;
      if (particle.trailMode){
        ps.hasTrailedParticle = true;
      }
      var rgbFilterX = 0; var rgbFilterY = 0; var rgbFilterZ = 0;
      if (particle.material.rgbFilter){
        rgbFilterX = particle.material.rgbFilter.x;
        rgbFilterY = particle.material.rgbFilter.y;
        rgbFilterZ = particle.material.rgbFilter.z;
      }
      if (particle.motionMode == MOTION_MODE_NORMAL){
        ps.positions[i2] = particle.x;
      }else{
        ps.positions[i2] = particle.initialAngle;
      }
      if (ps.rgbThresholds){
        ps.rgbThresholds[i2] = rgbFilterX;
      }
      i2++;
      if (particle.motionMode == MOTION_MODE_NORMAL){
        ps.positions[i2] = particle.y;
      }else{
        ps.positions[i2] = particle.angularAcceleration;
      }
      if (ps.rgbThresholds){
        ps.rgbThresholds[i2] = rgbFilterY;
      }
      i2++;
      ps.positions[i2] = particle.z;
      if (ps.rgbThresholds){
        ps.rgbThresholds[i2] = rgbFilterZ;
      }
      i2++;
      if (!noTargetColor){
        ps.targetColors[i4++] = particle.material.targetRed;
        ps.targetColors[i4++] = particle.material.targetGreen;
        ps.targetColors[i4++] = particle.material.targetBlue;
        ps.targetColors[i4++] = particle.material.colorStep;
      }
      ps.flags4[i9++] = particle.material.red;
      ps.flags4[i9++] = particle.material.green;
      ps.flags4[i9++] = particle.material.blue;
      if (particle.useWorldPositionFlag){
        ps.flags4[i9++] = 20;
      }else{
        ps.flags4[i9++] = 0;
      }
      particle.parent = ps;
      particle.index = ps.totalParticleCount;
      ps.totalParticleCount ++;
      ps.flags2[i6++] = particle.material.size;
      ps.flags2[i6++] = particle.material.alpha;
      ps.expiredFlags[i] = 0;
      if (textureCount > 0){
        if (particle.material.texture){
          ps.flags2[i6++] = 10;
          var range = textureMerger.ranges[particle.material.texture];
          ps.uvCoordinates[i10++] = range.startU;
          ps.uvCoordinates[i10++] = range.startV;
          ps.uvCoordinates[i10++] = range.endU;
          ps.uvCoordinates[i10++] = range.endV;
        }else{
          ps.flags2[i6++] = -10;
          ps.uvCoordinates[i10++] = -10;
          ps.uvCoordinates[i10++] = -10;
          ps.uvCoordinates[i10++] = -10;
          ps.uvCoordinates[i10++] = -10;
        }
      }else{
        ps.flags2[i6++] = -10;
      }
      var startDelay = 0;
      if (!(typeof particle.startDelay == UNDEFINED)){
        startDelay = particle.startDelay;
      }
      ps.flags2[i6++] = startDelay;
      if (particle.respawnSet){
        ps.flags1[i5++] = 7;
      }else{
        ps.flags1[i5++] = 0;
      }
      ps.accelerations[i3] = particle.gpuAcceleration.x; ps.velocities[i3++] = particle.gpuVelocity.x;
      ps.accelerations[i3] = particle.gpuAcceleration.y; ps.velocities[i3++] = particle.gpuVelocity.y;
      ps.accelerations[i3] = particle.gpuAcceleration.z; ps.velocities[i3++] = particle.gpuVelocity.z;
      if (!(typeof particle.alphaDelta == UNDEFINED)){
        ps.flags1[i5++] = particle.alphaDelta;
      }else{
        ps.flags1[i5++] = 0;
      }
      if (!particle.trailFlag){
        ps.flags1[i5++] = 0.0;
      }else{
        if (ps.motionMode == MOTION_MODE_CIRCULAR){
          ps.flags1[i5++] = 0.0;
        }else{
          ps.flags1[i5++] = 7.0;
        }
      }
      ps.flags1[i5++] = particle.lifetime;
      if (particle.alphaVariationMode == ALPHA_VARIATION_MODE_NORMAL){
        ps.flags3[i7++] = 5;
      }else if (particle.alphaVariationMode == ALPHA_VARIATION_MODE_SIN){
        ps.flags3[i7++] = 15;
      }else if (particle.alphaVariationMode == ALPHA_VARIATION_MODE_COS){
        ps.flags3[i7++] = 25;
      }else{
        ps.flags3[i7++] = -20;
      }
      if (particle.motionMode == MOTION_MODE_NORMAL){
        ps.flags3[i7++] = 5;
      }else if (particle.motionMode == MOTION_MODE_CIRCULAR){
        ps.flags3[i7++] = 15;
      }else{
        ps.flags3[i7++] = -20;
      }
      ps.flags3[i7++] = particle.angularVelocity;
      ps.flags3[i7++] = particle.angularMotionRadius;
      ps.angularQuaternions[i8++] = particle.angularQuaternionX;
      ps.angularQuaternions[i8++] = particle.angularQuaternionY;
      ps.angularQuaternions[i8++] = particle.angularQuaternionZ;
      ps.angularQuaternions[i8++] = particle.angularQuaternionW;
      if (particle.checkForCollisions){
        ps.hasParticleCollision = true;
        ps.particlesWithCollisionCallbacks.set(particle.uuid, particle);
      }
    }
  }else{
    for (var i = 0; i<ps.particles.length; i++){
      var particle = ps.particles[i];
      ps.expiredFlags[i] = 0;
      ps.flags2[i6++] = particle.material.size;
      ps.flags2[i6++] = particle.material.alpha;
      if (particle.material.texture){
        ps.flags2[i6++] = 10;
      }else{
        ps.flags2[i6++] = -10;
      }
      ps.flags2[i6++] = particle.originalStartDelay;
    }
  }
  if (ps.copyPS){
    ps.positionBufferAttribute = ps.copyPS.positionBufferAttribute;
    if (ps.copyPS.rgbThresholdBufferAttribute){
      ps.rgbThresholdBufferAttribute = ps.copyPS.rgbThresholdBufferAttribute;
    }
    ps.velocityBufferAttribute = ps.copyPS.velocityBufferAttribute;
    ps.accelerationBufferAttribute = ps.copyPS.accelerationBufferAttribute;
    if (!noTargetColor){
      ps.targetColorBufferAttribute = ps.copyPS.targetColorBufferAttribute;
    }
    ps.flags1BufferAttribute = ps.copyPS.flags1BufferAttribute;
    ps.flags3BufferAttribute = ps.copyPS.flags3BufferAttribute;
    ps.flags4BufferAttribute = ps.copyPS.flags4BufferAttribute;
    ps.angularQuaternionsBufferAttribute = ps.copyPS.angularQuaternionsBufferAttribute;
    if (ps.copyPS.uvCoordinatesBufferAttribute){
      ps.uvCoordinatesBufferAttribute = ps.copyPS.uvCoordinatesBufferAttribute;
    }
    ps.expiredFlagBufferAttribute = new THREE.BufferAttribute(ps.expiredFlags, 1);
    ps.flags2BufferAttribute = new THREE.BufferAttribute(ps.flags2, 4);
    ps.expiredFlagBufferAttribute.setDynamic(true);
    ps.flags2BufferAttribute.setDynamic(true);
  }else{
    ps.positionBufferAttribute = new THREE.BufferAttribute(ps.positions, 3);
    if (ps.rgbThresholds){
      ps.rgbThresholdBufferAttribute = new THREE.BufferAttribute(ps.rgbThresholds, 3);
      ps.rgbThresholdBufferAttribute.setDynamic(false);
    }
    ps.expiredFlagBufferAttribute = new THREE.BufferAttribute(ps.expiredFlags, 1);
    ps.velocityBufferAttribute = new THREE.BufferAttribute(ps.velocities, 3);
    ps.accelerationBufferAttribute = new THREE.BufferAttribute(ps.accelerations, 3);
    if (!noTargetColor){
      ps.targetColorBufferAttribute = new THREE.BufferAttribute(ps.targetColors, 4);
      ps.targetColorBufferAttribute.setDynamic(false);
    }
    ps.flags1BufferAttribute = new THREE.BufferAttribute(ps.flags1, 4);
    ps.flags2BufferAttribute = new THREE.BufferAttribute(ps.flags2, 4);
    ps.flags3BufferAttribute = new THREE.BufferAttribute(ps.flags3, 4);
    ps.flags4BufferAttribute = new THREE.BufferAttribute(ps.flags4, 4);
    ps.angularQuaternionsBufferAttribute = new THREE.BufferAttribute(ps.angularQuaternions, 4);
    if (ps.uvCoordinates){
      ps.uvCoordinatesBufferAttribute = new THREE.BufferAttribute(ps.uvCoordinates, 4);
      ps.uvCoordinatesBufferAttribute.setDynamic(false);
    }
    ps.positionBufferAttribute.setDynamic(false);
    ps.expiredFlagBufferAttribute.setDynamic(true);
    ps.velocityBufferAttribute.setDynamic(false);
    ps.accelerationBufferAttribute.setDynamic(false);
    ps.flags1BufferAttribute.setDynamic(false);
    ps.flags2BufferAttribute.setDynamic(true);
    ps.flags3BufferAttribute.setDynamic(false);
    ps.flags4BufferAttribute.setDynamic(false);
    ps.angularQuaternionsBufferAttribute.setDynamic(false);
  }
  ps.geometry.addAttribute('position', ps.positionBufferAttribute);
  if (ps.rgbThresholdBufferAttribute){
    ps.geometry.addAttribute('rgbThreshold', ps.rgbThresholdBufferAttribute);
  }
  ps.geometry.addAttribute('expiredFlag', ps.expiredFlagBufferAttribute);
  ps.geometry.addAttribute('velocity', ps.velocityBufferAttribute);
  ps.geometry.addAttribute('acceleration', ps.accelerationBufferAttribute);
  if (!noTargetColor){
    ps.geometry.addAttribute('targetColor', ps.targetColorBufferAttribute);
  }
  ps.geometry.addAttribute('flags1', ps.flags1BufferAttribute);
  ps.geometry.addAttribute('flags2', ps.flags2BufferAttribute);
  ps.geometry.addAttribute('flags3', ps.flags3BufferAttribute);
  ps.geometry.addAttribute('flags4', ps.flags4BufferAttribute);
  ps.geometry.addAttribute('angularQuaternion', ps.angularQuaternionsBufferAttribute);
  if (ps.uvCoordinatesBufferAttribute){
    ps.geometry.addAttribute('uvCoordinates', ps.uvCoordinatesBufferAttribute);
  }
  ps.geometry.setDrawRange(0, particles.length);
  ps.velocity = new THREE.Vector3(ps.vx, ps.vy, ps.vz);
  ps.acceleration = new THREE.Vector3(ps.ax, ps.ay, ps.az);
  var texture;
  if (textureMerger){
    texture = textureMerger.mergedTexture;
  }else{
    texture = false;
  }
  return new MeshGenerator().generateParticleSystemMesh(ps, texture, noTargetColor);
}
