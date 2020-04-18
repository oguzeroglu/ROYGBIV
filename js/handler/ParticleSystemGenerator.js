var ParticleSystemGenerator = function(){

}

ParticleSystemGenerator.prototype.generateSimilarCopies = function(refPreconfiguredParticleSystem, copyCount){
  var retAry = [];
  for (var i = 0; i<copyCount; i++){
    retAry.push(refPreconfiguredParticleSystem.getParticleSystem());
  }
  return retAry;
}

ParticleSystemGenerator.prototype.sub = function(vec1, vec2, targetVector){
  if (!(typeof targetVector == UNDEFINED)){
    targetVector.set(vec1.x - vec2.x, vec1.x - vec2.x, vec1.z - vec2.z);
    return targetVector;
  }
  return new THREE.Vector3(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
}

ParticleSystemGenerator.prototype.moveTowards = function(vec1, vec2, amount, targetVector){
  if (!(typeof targetVector == UNDEFINED)){
    var diff = this.sub(vec2, vec1, targetVector);
    targetVector.set(vec1.x + (amount * diff.x), vec1.y + (amount * diff.y), vec1.z + (amount * diff.z));
    return targetVector;
  }
  var diff = this.sub(vec2, vec1);
  return new THREE.Vector3(vec1.x + (amount * diff.x), vec1.y + (amount * diff.y), vec1.z + (amount * diff.z));
}

ParticleSystemGenerator.prototype.handleModeSwitch = function(){
  for (var psName in preConfiguredParticleSystems){
    preConfiguredParticleSystems[psName].getParticleSystem();
  }
  for (var poolName in preConfiguredParticleSystemPools){
    var pool = preConfiguredParticleSystemPools[poolName];
    this.generateInitializedParticleSystemPool(pool.poolName, particleSystemPool[pool.refParticleSystemName], pool.poolSize, pool.registeredSceneName);
  }
  var psMergeSkipList = [];
  for (var psName in particleSystemPool){
    if (particleSystemPool[psName].excludeFromMerge){
      psMergeSkipList.push(particleSystemPool[psName]);
    }
  }
  this.mergeParticleSystems(psMergeSkipList);
}

ParticleSystemGenerator.prototype.multiplyScalar = function(vector, scalar, targetVector){
  if (!targetVector){
    return new THREE.Vector3(vector.x * scalar, vector.y * scalar, vector.z * scalar);
  }else{
    targetVector.set(vector.x * scalar, vector.y * scalar, vector.z * scalar);
    return targetVector;
  }
}

ParticleSystemGenerator.prototype.normalizeVector = function(vector){
  var len = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y) + (vector.z * vector.z));
  vector.x = vector.x / len;
  vector.y = vector.y / len;
  vector.z = vector.z / len;
}

ParticleSystemGenerator.prototype.computeQuaternionFromVectors = function(vec1, vec2, targetQuaternion){
  this.normalizeVector(vec1);
  this.normalizeVector(vec2);
  REUSABLE_VECTOR.set(vec1.x, vec1.y, vec1.z);
  REUSABLE_VECTOR_2.set(vec2.x, vec2.y, vec2.z);
  REUSABLE_QUATERNION.setFromUnitVectors(REUSABLE_VECTOR, REUSABLE_VECTOR_2);
  if (!targetQuaternion){
    return REUSABLE_QUATERNION.clone();
  }else{
    return targetQuaternion.copy(REUSABLE_QUATERNION);
  }
}

ParticleSystemGenerator.prototype.sphericalDistribution = function(radius, targetVector){
  REUSABLE_VECTOR.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
  REUSABLE_VECTOR.normalize();
  REUSABLE_VECTOR.multiplyScalar(radius);
  if (!targetVector){
    return REUSABLE_VECTOR.clone();
  }else{
    targetVector.copy(REUSABLE_VECTOR);
    return targetVector;
  }
}

ParticleSystemGenerator.prototype.boxDistribution = function(sizeX, sizeY, sizeZ, side, targetVector){
  var randomSide = Math.floor(Math.random() * 6) + 1;
  if (typeof side != UNDEFINED && !isNaN(side) && side <= 6 && side >= 1){
    randomSide = side;
  }
  var x, y, z;
  var maxX = sizeX / 2, minX = -1 * sizeX / 2;
  var maxY = sizeY / 2, minY = -1 * sizeY / 2;
  var maxZ = sizeZ / 2, minZ = -1 * sizeZ / 2;
  switch (randomSide){
    case 1:
      y = sizeY / 2;
    break;
    case 2:
      y = -1 * sizeY / 2;
    break;
    case 3:
      z = sizeZ / 2;
    break;
    case 4:
      z = -1 * sizeZ / 2;
    break;
    case 5:
      x = sizeX / 2;
    break;
    case 6:
      x = -1 * sizeX / 2;
    break;
  }
  if (typeof x == UNDEFINED){
    x = Math.random () * (maxX - minX) + minX;
  }
  if (typeof y == UNDEFINED){
    y = Math.random () * (maxY - minY) + minY;
  }
  if (typeof z == UNDEFINED){
    z = Math.random () * (maxZ - minZ) + minZ;
  }
  if (!targetVector){
    return new THREE.Vector3(x, y, z);
  }else{
    return targetVector.set(x, y, z);
  }
}

ParticleSystemGenerator.prototype.circularDistribution = function(radius, quaternion, targetVector){
  REUSABLE_VECTOR_3.set(Math.random() - 0.5, Math.random() - 0.5, 0);
  REUSABLE_VECTOR_3.normalize();
  REUSABLE_VECTOR_3.multiplyScalar(radius);
  if (!(typeof quaternion == UNDEFINED)){
    REUSABLE_VECTOR_3.applyQuaternion(quaternion);
  }
  if (!targetVector){
    return REUSABLE_VECTOR_3.clone();
  }else{
    return targetVector.copy(REUSABLE_VECTOR_3);
  }
}

ParticleSystemGenerator.prototype.applyNoise = function(vec, targetVector){
  var toNormalize = REUSABLE_VECTOR.set(vec.x, vec.y, vec.z);
  toNormalize.normalize();
  var noiseAmount = noise.perlin3(toNormalize.x, toNormalize.y, toNormalize.z);
  var vector3 = REUSABLE_VECTOR_2.set(vec.x, vec.y, vec.z);
  var toMultiplyScalar = REUSABLE_VECTOR_3.set(vec.x, vec.y, vec.z);
  toMultiplyScalar.multiplyScalar(noiseAmount);
  vector3.add(toMultiplyScalar);
  if (!targetVector){
    return new THREE.Vector3(vector3.x, vector3.y, vector3.z);
  }else{
    return targetVector.copy(vector3);
  }
}

ParticleSystemGenerator.prototype.mergeParticleSystems = function(skipList){
  if ((Object.keys(particleSystemPool).length < 2) || (!MAX_VERTEX_UNIFORM_VECTORS)){
    return;
  }
  var diff = parseInt(4096 / MAX_VERTEX_UNIFORM_VECTORS);
  var chunkSize = parseInt(MAX_PS_COMPRESS_AMOUNT_4096 / diff);
  var mergeObj = new Object();
  var size = 0;
  for (var psName in particleSystemPool){
    var ps = particleSystemPool[psName];
    if (ps.psMerger){
      continue;
    }
    var skip = false;
    if (skipList){
      for (var i = 0; i<skipList.length; i++){
        if (skipList[i].name == ps.name){
          skip = true;
          break;
        }
      }
    }
    if (skip){
      continue;
    }
    mergeObj[psName] = ps;
    size ++;
    if (size == chunkSize){
      new ParticleSystemMerger(mergeObj, TOTAL_MERGED_COUNT);
      TOTAL_MERGED_COUNT ++;
      mergeObj = new Object();
      size = 0;
    }
  }
  if (size > 1){
    new ParticleSystemMerger(mergeObj, TOTAL_MERGED_COUNT);
    TOTAL_MERGED_COUNT ++;
  }
}

ParticleSystemGenerator.prototype.generateParticleSystemName = function(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while (nameFound){
    nameFound = !(typeof particleSystemPool[generatedName] == UNDEFINED);
    if (nameFound){
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

ParticleSystemGenerator.prototype.generateInitializedParticleSystemPool = function(poolName, refParticleSystem, poolSize, sceneName){
  var pool = this.generateParticleSystemPool(poolName);
  pool.add(refParticleSystem);
  for (var i = 0; i<poolSize - 1; i++){
    pool.add(refParticleSystem.createCopy(this.generateParticleSystemName()));
  }
  pool.registeredSceneName = sceneName;
  return pool;
}

ParticleSystemGenerator.prototype.generateParticleSystemPool = function(poolName){
  var psPool = new ParticleSystemPool(poolName);
  particleSystemPools[poolName] = psPool;
  return psPool;
}

ParticleSystemGenerator.prototype.generateCustomParticleSystem = function(configurations){
  var particleMaterialConfigurations = {color: configurations.material.color, size: configurations.material.size, alpha: configurations.material.alpha};
  if (configurations.material.hasTexture && configurations.material.textureName != ""){
    particleMaterialConfigurations.textureName = configurations.material.textureName;
    var splitted = configurations.material.rgbFilter.split(",");
    particleMaterialConfigurations.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
  }
  if (configurations.material.hasTargetColor){
    particleMaterialConfigurations.targetColor = configurations.material.targetColor;
    particleMaterialConfigurations.colorStep = configurations.material.colorStep;
  }
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var positionVect = new THREE.Vector3();
  var reusableQuaternion = new THREE.Quaternion();
  var reusableVec1 = new THREE.Vector3();
  var reusableVec2 = new THREE.Vector3();
  var particles = [];
  for (var i = 0; i<configurations.particleCount; i++){
    var particleConfigurations = {material: particleMaterial, startDelay: configurations.motion.startDelay, lifetime: configurations.motion.lifetime, respawn: configurations.motion.respawn, alphaVariation: configurations.alphaVariation.alphaVariation, collisionTimeOffset: configurations.collision.collisionTimeOffset};
    if (configurations.motion.randomizeStartDelay){
      particleConfigurations.startDelay = particleConfigurations.startDelay * Math.random();
    }
    switch(configurations.distribution.type){
      case "SINGLE_POINT":
        var splitted = configurations.distribution.coordinate.split(",");
        particleConfigurations.position = positionVect.set(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
      break;
      case "SPHERICAL":
        particleConfigurations.position = this.sphericalDistribution(configurations.distribution.radius, positionVect);
      break;
      case "BOX":
        var splitted = configurations.distribution.boxSize.split(",");
        var side = -1;
        switch(configurations.distribution.boxSide){
          case "UP": side = 1; break;
          case "DOWN": side = 2; break;
          case "FRONT": side = 3; break;
          case "BACK": side = 4; break;
          case "RIGHT": side = 5; break;
          case "LEFT": side = 6; break;
          case "RANDOM": side = -1; break;
        }
        particleConfigurations.position = this.boxDistribution(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]), side, positionVect);
      break;
      case "CIRCULAR":
        var splitted = configurations.distribution.circleNormal.split(",");
        this.computeQuaternionFromVectors(reusableVec1.set(0, 0, 1), reusableVec2.set(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2])), reusableQuaternion);
        particleConfigurations.position = this.circularDistribution(configurations.distribution.circleRadius, reusableQuaternion, positionVect);
      break;
      case "LINEAR":
        var splitted1 = configurations.distribution.linearPoint1.split(",");
        var splitted2 = configurations.distribution.linearPoint2.split(",");
        reusableVec1.set(parseFloat(splitted1[0]), parseFloat(splitted1[1]), parseFloat(splitted1[2]));
        reusableVec2.set(parseFloat(splitted2[0]), parseFloat(splitted2[1]), parseFloat(splitted2[2]));
        reusableVec1.lerp(reusableVec2, Math.random());
        particleConfigurations.position = positionVect.copy(reusableVec1);
      break;
      default:
        throw new Error("Unknown distribution type.");
      break;
    }
    if (configurations.distribution.applyNoise){
      this.applyNoise(particleConfigurations.position, particleConfigurations.position);
    }
    switch(configurations.motion.type){
      case "NORMAL":
        var velocitySplitted = configurations.motion.velocity.split(",");
        var accelerationSplitted = configurations.motion.acceleration.split(",");
        var velocityRandomnessSplitted = configurations.motion.velocityRandomness.split(",");
        var accelerationRandomnessSplitted = configurations.motion.accelerationRandomness.split(",");
        particleConfigurations.trailMode = configurations.motion.trailMode;
        particleConfigurations.useWorldPosition = configurations.motion.useWorldPosition;
        particleConfigurations.motionMode = MOTION_MODE_NORMAL;
        particleConfigurations.velocity = new THREE.Vector3(parseFloat(velocitySplitted[0]) + (parseFloat(velocityRandomnessSplitted[0]) * (Math.random() - 0.5)), parseFloat(velocitySplitted[1]) + (parseFloat(velocityRandomnessSplitted[1]) * (Math.random() - 0.5)), parseFloat(velocitySplitted[2]) + (parseFloat(velocityRandomnessSplitted[2]) * (Math.random() - 0.5)));
        particleConfigurations.acceleration = new THREE.Vector3(parseFloat(accelerationSplitted[0]) + (parseFloat(accelerationRandomnessSplitted[0]) * (Math.random() - 0.5)), parseFloat(accelerationSplitted[1]) + (parseFloat(accelerationRandomnessSplitted[1]) * (Math.random() - 0.5)), parseFloat(accelerationSplitted[2]) + (parseFloat(accelerationRandomnessSplitted[2]) * (Math.random() - 0.5)));
      break;
      case "CIRCULAR":
        particleConfigurations.motionMode = MOTION_MODE_CIRCULAR;
        particleConfigurations.initialAngle = configurations.motion.initialAngle;
        particleConfigurations.angularMotionRadius = configurations.motion.angularMotionRadius;
        particleConfigurations.angularVelocity = configurations.motion.angularVelocity;
        particleConfigurations.angularAcceleration = configurations.motion.angularAcceleration;
        var circularMotionNormalSplitted = configurations.motion.circularMotionNormal.split(",");
        reusableVec1.set(parseFloat(circularMotionNormalSplitted[0]), parseFloat(circularMotionNormalSplitted[1]), parseFloat(circularMotionNormalSplitted[2]));
        if (configurations.motion.randomizeNormal){
          reusableVec1.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
        }
        reusableVec2.set(0, 1, 0);
        this.computeQuaternionFromVectors(reusableVec2, reusableVec1, reusableQuaternion);
        particleConfigurations.angularQuaternion = reusableQuaternion;
        if (configurations.motion.hasAngleStep){
          particleConfigurations.initialAngle += (i * configurations.motion.angleStep);
        }
      break;
    }
    switch(configurations.alphaVariation.type){
      case "NORMAL": particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL; break;
      case "SIN": particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_SIN; break;
      case "COS": particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_COS; break;
      default: throw new Error("Unknown alphaVariation type."); break;
    }
    if (configurations.collision.type != "NONE"){
      switch(configurations.collision.type){
        case "REWIND": particleConfigurations.collisionAction = PARTICLE_REWIND_ON_COLLIDED; break;
        case "DISSAPEAR": particleConfigurations.collisionAction = PARTICLE_DISSAPEAR_ON_COLLIDED; break;
        default: throw new Error("Unknown collision action."); break;
      }
    }
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = {name: configurations.name, position: configurations.position, particles: particles, lifetime: configurations.motionPS.lifetime};
  switch(configurations.motionPS.type){
    case "NORMAL":
      var velocitySplitted = configurations.motionPS.velocity.split(",");
      var accelerationSplitted = configurations.motionPS.acceleration.split(",");
      var velocityRandomnessSplitted = configurations.motionPS.velocityRandomness.split(",");
      var accelerationRandomnessSplitted = configurations.motionPS.accelerationRandomness.split(",");
      particleSystemConfigurations.motionMode = MOTION_MODE_NORMAL;
      particleSystemConfigurations.velocity = new THREE.Vector3(parseFloat(velocitySplitted[0]) + (parseFloat(velocityRandomnessSplitted[0]) * (Math.random() - 0.5)), parseFloat(velocitySplitted[1]) + (parseFloat(velocityRandomnessSplitted[1]) * (Math.random() - 0.5)), parseFloat(velocitySplitted[2]) + (parseFloat(velocityRandomnessSplitted[2]) * (Math.random() - 0.5)));
      particleSystemConfigurations.acceleration = new THREE.Vector3(parseFloat(accelerationSplitted[0]) + (parseFloat(accelerationRandomnessSplitted[0]) * (Math.random() - 0.5)), parseFloat(accelerationSplitted[1]) + (parseFloat(accelerationRandomnessSplitted[1]) * (Math.random() - 0.5)), parseFloat(accelerationSplitted[2]) + (parseFloat(accelerationRandomnessSplitted[2]) * (Math.random() - 0.5)));
    break;
    case "CIRCULAR":
      particleSystemConfigurations.motionMode = MOTION_MODE_CIRCULAR;
      particleSystemConfigurations.initialAngle = configurations.motionPS.initialAngle;
      particleSystemConfigurations.angularMotionRadius = configurations.motionPS.angularMotionRadius;
      particleSystemConfigurations.angularVelocity = configurations.motionPS.angularVelocity;
      particleSystemConfigurations.angularAcceleration = configurations.motionPS.angularAcceleration;
      var circularMotionNormalSplitted = configurations.motionPS.circularMotionNormal.split(",");
      reusableVec1.set(parseFloat(circularMotionNormalSplitted[0]), parseFloat(circularMotionNormalSplitted[1]), parseFloat(circularMotionNormalSplitted[2]));
      if (configurations.motionPS.randomizeNormal){
        reusableVec1.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
      }
      reusableVec2.set(0, 1, 0);
      this.computeQuaternionFromVectors(reusableVec2, reusableVec1, reusableQuaternion);
      particleSystemConfigurations.angularQuaternion = reusableQuaternion;
    break;
  }
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generateLaser = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var particleSize = configurations.particleSize;
  var timeDiff = configurations.timeDiff;
  var expireTime = configurations.expireTime;
  var velocity = new THREE.Vector3().copy(configurations.velocity);
  var direction = velocity.clone();
  var acceleration = configurations.acceleration;
  var alpha = configurations.alpha;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
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
  particleConfigurations.lifetime = 0;
  particleConfigurations.respawn = false;
  var c2 = 0;
  for (var i = 0; i < particleCount; i++){
    var dx = (direction.x * c2);
    var dy = (direction.y * c2);
    var dz = (direction.z * c2);
    particleConfigurations.startDelay = c2;
    particleConfigurations.position = new THREE.Vector3(dx, dy, dz);
    c2 += timeDiff;
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generateDynamicTrail = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var particleCount = configurations.particleCount;
  var size = configurations.size;
  var particleSize = configurations.particleSize;
  var startDelay = configurations.startDelay;
  var lifetime = configurations.lifetime;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var randomness = configurations.randomness;
  var alphaVariation = configurations.alphaVariation;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 1;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = lifetime;
  particleConfigurations.respawn = true;
  particleConfigurations.useWorldPosition = true;
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.sphericalDistribution(size);
    particleConfigurations.startDelay = startDelay * Math.random();
    particleConfigurations.velocity = new THREE.Vector3(randomness * (Math.random() - 0.5), randomness * (Math.random() - 0.5), randomness * (Math.random() - 0.5));
    particleConfigurations.acceleration = new THREE.Vector3(randomness * (Math.random() - 0.5), randomness * (Math.random() - 0.5), randomness * (Math.random() - 0.5));
    particleConfigurations.alphaVariation = alphaVariation;
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generateCircularExplosion = function(configurations){
  var name = configurations.name;
  var particleCount = configurations.particleCount;
  var position = configurations.position;
  var radius = configurations.radius;
  var colorName = configurations.colorName;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var particleSize = configurations.particleSize;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var alphaVariation = configurations.alphaVariation;
  var speed = configurations.speed;
  var normal = (!(typeof configurations.normal == UNDEFINED))? configurations.normal: new THREE.Vector3(0, 1, 0);
  var expireTime = configurations.expireTime;
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
  particleConfigurations.lifetime = 0;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.respawn = false;
  var quat = this.computeQuaternionFromVectors(new THREE.Vector3(0, 0, 1), normal);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.circularDistribution(radius, quat);
    var velocity = this.moveTowards(position, particleConfigurations.position, 1);
    particleConfigurations.velocity = this.multiplyScalar(velocity, speed);
    particleConfigurations.acceleration = particleConfigurations.velocity;
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

ParticleSystemGenerator.prototype.generateTrail = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var particleCount = configurations.particleCount;
  var velocity = configurations.velocity;
  var acceleration = configurations.acceleration;
  var lifetime = configurations.lifetime;
  var alphaVariation = configurations.alphaVariation;
  var startDelay = configurations.startDelay;
  var colorName = configurations.colorName;
  var particleSize = configurations.particleSize;
  var size = configurations.size;
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var targetColor = configurations.targetColor;
  var colorStep = configurations.colorStep;
  var updateFunction = configurations.updateFunction;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 1;
  particleMaterialConfigurations.targetColor = targetColor;
  particleMaterialConfigurations.colorStep = colorStep;
  if (textureName){
    particleMaterialConfigurations.textureName = textureName;
  }
  if (rgbFilter){
    particleMaterialConfigurations.rgbFilter = rgbFilter;
  }
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.applyNoise(this.sphericalDistribution(size));
    particleConfigurations.material = particleMaterial;
    particleConfigurations.lifetime = lifetime * Math.random();
    particleConfigurations.respawn = true;
    particleConfigurations.alphaVariation = alphaVariation;
    particleConfigurations.startDelay = startDelay * Math.random();
    particleConfigurations.trailMode = true;
    particleConfigurations.useWorldPosition = true;
    particles.push(this.generateParticle(particleConfigurations));
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.velocity = velocity;
  particleSystemConfigurations.acceleration = acceleration;
  particleSystemConfigurations.lifetime = expireTime;
  particleSystemConfigurations.updateFunction = updateFunction;
  return this.generateParticleSystem(particleSystemConfigurations);
}

ParticleSystemGenerator.prototype.generateFireExplosion = function(configurations){
  var position = configurations.position;
  var expireTime = configurations.expireTime;
  var name = configurations.name;
  var radius = configurations.radius;
  var particleSize = configurations.particleSize;
  var particleCount = configurations.particleCount;
  var fireColorName = (!(typeof configurations.fireColorName == UNDEFINED))? configurations.fireColorName: "white";
  var smokeColorName = (!(typeof configurations.smokeColorName == UNDEFINED))? configurations.smokeColorName: "black";
  var colorStep = configurations.colorStep;
  var alphaVariationCoef = configurations.alphaVariationCoef;
  var explosionDirection = (!(typeof configurations.explosionDirection == UNDEFINED))? configurations.explosionDirection: new THREE.Vector3(0, 1, 0);
  var explosionSpeed = configurations.explosionSpeed;
  var lifetime = configurations.lifetime;
  var accelerationDirection = (!(typeof configurations.accelerationDirection == UNDEFINED))? configurations.accelerationDirection: new THREE.Vector3(0, 1, 0);
  var textureName = configurations.textureName;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = fireColorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = 0;
  particleMaterialConfigurations.targetColor = smokeColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particles = [];
  var particleConfigurations = new Object();
  var defaultNormal = new THREE.Vector3(0, 1, 0);
  var referenceQuaternion = this.computeQuaternionFromVectors(new THREE.Vector3(0, 0, 1), defaultNormal);
  var quaternion = this.computeQuaternionFromVectors(defaultNormal, explosionDirection);
  var quaternionInverse;
  var quaternion2;
  if (accelerationDirection){
    quaternion2 = this.computeQuaternionFromVectors(defaultNormal, accelerationDirection);
    quaternionInverse = quaternion.clone().inverse();
  }
  particleConfigurations.material = particleMaterial;
  particleConfigurations.respawn = true;
  particleConfigurations.alphaVariation = alphaVariationCoef;
  particleConfigurations.alphaVariationMode = ALPHA_VARIATION_MODE_SIN;
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.applyNoise(this.circularDistribution(radius));
    particleConfigurations.lifetime = lifetime * Math.random();
    particleConfigurations.startDelay = (Math.random() / 5);
    var particle = this.generateParticle(particleConfigurations);
    particles.push(particle);
    var x = explosionSpeed * (Math.random() - 0.5);
    var y = (explosionSpeed / 2) * Math.random();
    var z = explosionSpeed * (Math.random() - 0.5);
    var velocity = new THREE.Vector3(x, y, z);
    var acceleration = new THREE.Vector3((-1 * x / 1.5), (Math.random() * explosionSpeed), (-1 * z / 1.5));
    if (accelerationDirection){
      REUSABLE_VECTOR_4.set(acceleration.x, acceleration.y, acceleration.z);
      REUSABLE_VECTOR_4.applyQuaternion(quaternionInverse);
      REUSABLE_VECTOR_4.applyQuaternion(quaternion2);
      particleConfigurations.velocity = velocity;
      particleConfigurations.acceleration = new THREE.Vector3(REUSABLE_VECTOR_4.x, REUSABLE_VECTOR_4.y, REUSABLE_VECTOR_4.z);
    }else{
      particleConfigurations.velocity = velocity;
      particleConfigurations.acceleration = acceleration;
    }
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.lifetime = expireTime;
  var explosion = this.generateParticleSystem(particleSystemConfigurations);
  explosion.mesh.applyQuaternion(quaternion);
  return explosion;
}

ParticleSystemGenerator.prototype.generateSnow = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var sizeX = configurations.sizeX;
  var sizeZ = configurations.sizeZ;
  var particleSize = configurations.particleSize;
  var particleExpireTime = configurations.particleExpireTime;
  var speed = configurations.speed;
  var acceleration = configurations.acceleration;
  var avgStartDelay = configurations.avgStartDelay;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rewindOnCollided = (!(typeof configurations.rewindOnCollided == UNDEFINED))? configurations.rewindOnCollided: false;
  var normal = (!(typeof configurations.normal == UNDEFINED))? configurations.normal: new THREE.Vector3(0, -1, 0);
  var randomness = (!(typeof configurations.randomness == UNDEFINED))? configurations.randomness: 0;
  var alphaVariation = configurations.alphaVariation;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var collisionTimeOffset = (!(typeof configurations.collisionTimeOffset == UNDEFINED))? configurations.collisionTimeOffset: 0;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particleConfigurations = new Object();
  var particles = [];
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = particleExpireTime;
  particleConfigurations.respawn = true;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.velocity = new THREE.Vector3(0, -1 * speed, 0);
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.acceleration = new THREE.Vector3(0, -1 * acceleration, 0);
    particleConfigurations.position = this.boxDistribution(sizeX, 0 ,sizeZ, 2);
    particleConfigurations.startDelay = avgStartDelay * Math.random();
    if (randomness != 0){
      particleConfigurations.acceleration.x = randomness * (Math.random() - 0.5);
      particleConfigurations.acceleration.z = randomness * (Math.random() - 0.5);
    }
    if (rewindOnCollided){
      particleConfigurations.collisionAction = PARTICLE_REWIND_ON_COLLIDED;
      particleConfigurations.collisionTimeOffset = collisionTimeOffset;
    }
    var particle = this.generateParticle(particleConfigurations);
    particles.push(particle);
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = 0;
  particleSystemConfigurations.updateFunction = updateFunction;
  var snow = this.generateParticleSystem(particleSystemConfigurations);
  var quat = this.computeQuaternionFromVectors(new THREE.Vector3(0, -1, 0), normal);
  snow.mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  return snow;
}

ParticleSystemGenerator.prototype.generateWaterfall = function(configurations){
  var name = configurations.name;
  var position = configurations.position;
  var particleCount = configurations.particleCount;
  var size = configurations.size;
  var particleSize = configurations.particleSize;
  var particleExpireTime = configurations.particleExpireTime;
  var speed = configurations.speed;
  var acceleration = configurations.acceleration;
  var avgStartDelay = configurations.avgStartDelay;
  var colorName = configurations.colorName;
  var alpha = configurations.alpha;
  var textureName = configurations.textureName;
  var rewindOnCollided = (!(typeof configurations.rewindOnCollided == UNDEFINED))? configurations.rewindOnCollided: false;
  var normal = (!(typeof configurations.normal == UNDEFINED))? configurations.normal: new THREE.Vector3(0, 0, 1);
  var randomness = (!(typeof configurations.randomness == UNDEFINED))? configurations.randomness: 0;
  var alphaVariation = configurations.alphaVariation;
  var targetColorName = configurations.targetColorName;
  var colorStep = configurations.colorStep;
  var rgbFilter = configurations.rgbFilter;
  var updateFunction = configurations.updateFunction;
  var collisionTimeOffset = (!(typeof configurations.collisionTimeOffset == UNDEFINED))? configurations.collisionTimeOffset: 0;
  var particleMaterialConfigurations = new Object();
  particleMaterialConfigurations.color = colorName;
  particleMaterialConfigurations.size = particleSize;
  particleMaterialConfigurations.alpha = alpha;
  particleMaterialConfigurations.textureName = textureName;
  particleMaterialConfigurations.rgbFilter = rgbFilter;
  particleMaterialConfigurations.targetColor = targetColorName;
  particleMaterialConfigurations.colorStep = colorStep;
  var particleMaterial = this.generateParticleMaterial(particleMaterialConfigurations);
  var particleConfigurations = new Object();
  particleConfigurations.material = particleMaterial;
  particleConfigurations.lifetime = particleExpireTime;
  particleConfigurations.respawn = true;
  particleConfigurations.alphaVariation = alphaVariation;
  particleConfigurations.velocity = new THREE.Vector3(0, -1 * speed, 0);
  var particles = [];
  for (var i = 0; i < particleCount; i++){
    particleConfigurations.position = this.boxDistribution(size, 0, 0, 3);
    particleConfigurations.startDelay = avgStartDelay * Math.random();
    particleConfigurations.acceleration = new THREE.Vector3(0, -1 * acceleration, 0);
    if (randomness != 0){
      particleConfigurations.acceleration.z += randomness * (Math.random() - 0.5);
      particleConfigurations.acceleration.x += randomness * (Math.random() - 0.5);
    }
    if (rewindOnCollided){
      particleConfigurations.collisionAction = PARTICLE_REWIND_ON_COLLIDED;
      particleConfigurations.collisionTimeOffset = collisionTimeOffset;
    }
    var particle = this.generateParticle(particleConfigurations);
    particles.push(particle);
  }
  var particleSystemConfigurations = new Object();
  particleSystemConfigurations.name = name;
  particleSystemConfigurations.particles = particles;
  particleSystemConfigurations.position = position;
  particleSystemConfigurations.lifetime = 0;
  var waterfall = this.generateParticleSystem(particleSystemConfigurations);
  var quat = this.computeQuaternionFromVectors(new THREE.Vector3(0, 0, 1), normal);
  waterfall.mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  return waterfall;
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
  var collisionMethod = configurations.collisionMethod;
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
  if (!(typeof configurations.presetUUID == UNDEFINED)){
    particle.assignUUID(configurations.presetUUID);
  }
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
  var maxPSTime = (!(typeof configurations.maxPSTime == UNDEFINED))? configurations.maxPSTime: DEFAULT_MAX_PS_TIME;
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
  particleSystem.maxPSTime = maxPSTime;
  particleSystem.creationConfigurations = new Object();
  for (var key in configurations){
    if (key == "particles"){
      continue;
    }
    particleSystem.creationConfigurations[key] = configurations[key];
  }
  return particleSystem;
}

ParticleSystemGenerator.prototype.generateParticleSystemMesh = function(ps){
  var noTargetColor = true;
  var particles = ps.particles;
  var hasTexture = false;
  var textureName;
  for (var i = 0; i<particles.length; i++){
    if (!particles[i].material.noTargetColor){
      noTargetColor = false;
    }
    if (particles[i].material.texture){
      hasTexture = true;
      textureName = particles[i].material.texture;
    }
  }
  ps.noTargetColor = noTargetColor;
  ps.totalParticleCount = 0;
  var len = ps.particles.length;
  ps.geometry = new THREE.BufferGeometry();
  ps.expiredFlags = new Float32Array(len);
  ps.flags2 = new Float32Array(len * 4);
  if (!ps.copyPS){
    ps.positions = new Float32Array(len * 3);
    if (hasTexture){
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
    if (hasTexture){
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
      if (hasTexture){
        if (particle.material.texture){
          ps.flags2[i6++] = 10;
          var range = textureAtlasHandler.textureMerger.ranges[particle.material.texture + "#diffuse"];
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
  if (hasTexture){
    texture = textureAtlasHandler.atlas.diffuseTexture;
  }else{
    texture = false;
  }
  return new MeshGenerator().generateParticleSystemMesh(ps, texture, noTargetColor);
}
