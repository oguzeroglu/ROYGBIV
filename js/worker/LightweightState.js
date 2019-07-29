var LightweightState = function(){
  this.isLightweightState = true;
  // MODE
  this.mode = mode;
  // OCTREE LIMITS
  this.octreeLimit = {
    minX: LIMIT_BOUNDING_BOX.min.x, minY: LIMIT_BOUNDING_BOX.min.y, minZ: LIMIT_BOUNDING_BOX.min.z,
    maxX: LIMIT_BOUNDING_BOX.max.x, maxY: LIMIT_BOUNDING_BOX.max.y, maxZ: LIMIT_BOUNDING_BOX.max.z
  }
  // BIN SIZE
  this.binSize = BIN_SIZE;
  // RAYCASTER STEP AMOUNT
  this.raycasterStepAmount = RAYCASTER_STEP_AMOUNT;
  // VIEWPORT
  var vp = renderer.getCurrentViewport();
  this.viewport = {x: vp.x, y: vp.y, z: vp.z, w: vp.w}
  this.screenResolution = screenResolution;
  // PHYSICS DATA
  this.quatNormalizeSkip = quatNormalizeSkip;
  this.quatNormalizeFast = quatNormalizeFast;
  this.contactEquationStiffness = contactEquationStiffness;
  this.contactEquationRelaxation = contactEquationRelaxation;
  this.friction = friction;
  this.physicsIterations = physicsIterations;
  this.physicsTolerance = physicsTolerance;
  this.gravityY = gravityY;
  // CAMERA
  this.camera = {
    position: {x: camera.position.x, y: camera.position.y, z: camera.position.z},
    quaternion: {x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w: camera.quaternion.w},
    aspect: camera.aspect,
    fov: camera.fov
  }
  // GRID SYSTEMS
  this.gridSystems = new Object();
  for (var gsName in sceneHandler.getGridSystems()){
    this.gridSystems[gsName] = gridSystems[gsName].exportLightweight();
  }
  // ADDED OBJECTS
  this.addedObjects = new Object();
  for (var objName in sceneHandler.getAddedObjects()){
    this.addedObjects[objName] = addedObjects[objName].exportLightweight();
  }
  // OBJECT GROUPS
  this.childAddedObjects = new Object();
  this.objectGroups = new Object();
  for (var objName in sceneHandler.getObjectGroups()){
    this.objectGroups[objName] = objectGroups[objName].exportLightweight();
    for (var childName in objectGroups[objName].group){
      this.childAddedObjects[childName] = objectGroups[objName].group[childName].exportLightweight();
    }
  }
  // 3D ADDED TEXTS
  this.addedTexts3D = new Object();
  for (var textName in addedTexts){
    if (!addedTexts[textName].is2D){
      this.addedTexts3D[textName] = addedTexts[textName].exportLightweight();
    }
  }
  // PARTICLE SYSTEMS
  this.particleSystems = new Object();
  for (var psName in particleSystemPool){
    var ps = particleSystemPool[psName];
    if (ps.shouldSendToWorker()){
      this.particleSystems[psName] = ps.creationConfigurations;
      var particles = new Object();
      ps.particlesWithCollisionCallbacks.forEach(function(particle, uuid){
        particles[uuid] = particle.creationConfigurations;
      });
      this.particleSystems[psName].particles = particles;
    }
  }
}
