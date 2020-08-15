var StateLoaderLightweight = function(state){
  this.state = state;
}

StateLoaderLightweight.prototype.loadCamera = function(){
  camera = new THREE.PerspectiveCamera( this.state.camera.fov, this.state.camera.aspect, 1, 10000 );
  camera.position.set(this.state.camera.position.x, this.state.camera.position.y, this.state.camera.position.z);
  camera.quaternion.set(this.state.camera.quaternion.x, this.state.camera.quaternion.y, this.state.camera.quaternion.z, this.state.camera.quaternion.w);
}

StateLoaderLightweight.prototype.loadRenderer = function(){
  renderer = {
    viewport: new THREE.Vector4(this.state.viewport.x, this.state.viewport.y, this.state.viewport.z, this.state.viewport.w),
    getCurrentViewport: function(){
      return this.viewport;
    }
  }
  screenResolution = this.state.screenResolution;
}

StateLoaderLightweight.prototype.loadWorldLimits = function(){
  var octreeLimit = this.state.octreeLimit;
  LIMIT_BOUNDING_BOX.min.set(octreeLimit.minX, octreeLimit.minY, octreeLimit.minZ);
  LIMIT_BOUNDING_BOX.max.set(octreeLimit.maxX, octreeLimit.maxY, octreeLimit.maxZ);
  BIN_SIZE = this.state.binSize;
  RAYCASTER_STEP_AMOUNT = this.state.raycasterStepAmount;
}

StateLoaderLightweight.prototype.loadParticleSystems = function(){
  var psExport = this.state.particleSystems;
  for (var psName in psExport){
    var curPSExport = psExport[psName];
    var particles = [];
    var particlesWithCollisionCallbacks = new Map();
    var hasParticleCollision = false;
    for (var uuid in curPSExport.particles){
      curPSExport.particles[uuid].presetUUID = uuid;
      var particle = particleSystemGenerator.generateParticle(curPSExport.particles[uuid]);
      particles.push(particle);
      particlesWithCollisionCallbacks.set(particle.uuid, particle);
      hasParticleCollision = true;
    }
    curPSExport.particles = particles;
    var ps = particleSystemGenerator.generateParticleSystem(curPSExport);
    ps.particlesWithCollisionCallbacks = particlesWithCollisionCallbacks;
    ps.hasParticleCollision = hasParticleCollision;
    for (var i = 0; i<particles.length; i++){
      particles[i].parent = ps;
    }
  }
}

StateLoaderLightweight.prototype.loadBoundingBoxes = function(){
  var gridSystemExports = this.state.gridSystems;
  var addedObjectExports = this.state.addedObjects;
  var childAddedObjectExports = this.state.childAddedObjects;
  var objectGroupExports = this.state.objectGroups;
  var spriteExports = this.state.sprites;
  var containerExports = this.state.containers;
  var virtualKeyboardExports = this.state.virtualKeyboards;
  var addedTextExports = new Object();
  for (var key in this.state.addedTexts3D){
    addedTextExports[key] = this.state.addedTexts3D[key];
  }
  for (var key in this.state.addedTexts2D){
    addedTextExports[key] = this.state.addedTexts2D[key];
  }
  for (var gsName in gridSystemExports){
    var gridSystem = new GridSystem();
    gridSystem.name = gsName;
    gridSystem.boundingBox = new THREE.Box3(gridSystemExports[gsName].bbMin, gridSystemExports[gsName].bbMax);
    gridSystem.triangles = [];
    gridSystem.trianglePlanes = [];
    for (var i = 0; i<gridSystemExports[gsName].triangles.length; i++){
      var curExp = gridSystemExports[gsName].triangles[i];
      var aVec = new THREE.Vector3(curExp.a.x, curExp.a.y, curExp.a.z);
      var bVec = new THREE.Vector3(curExp.b.x, curExp.b.y, curExp.b.z);
      var cVec = new THREE.Vector3(curExp.c.x, curExp.c.y, curExp.c.z);
      var triangle = new THREE.Triangle(aVec, bVec, cVec);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      gridSystem.triangles.push(triangle);
      gridSystem.trianglePlanes.push(plane);
    }
    gridSystems[gsName] = gridSystem;
  }
  var totalAddedObjectExports = new Object();
  for (var objName in addedObjectExports){
    totalAddedObjectExports[objName] = addedObjectExports[objName];
  }
  for (var objName in childAddedObjectExports){
    totalAddedObjectExports[objName] = childAddedObjectExports[objName];
  }
  for (var objName in totalAddedObjectExports){
    var curExport = totalAddedObjectExports[objName];
    var addedObject = new AddedObject();
    addedObject.isChangeable = curExport.isChangeable;
    addedObject.isIntersectable = curExport.isIntersectable;
    addedObject.parentBoundingBoxIndex = curExport.parentBoundingBoxIndex;
    addedObject.lastUpdatePosition = new THREE.Vector3();
    addedObject.lastUpdateQuaternion = new THREE.Quaternion();
    addedObject.reusableVec3 = new THREE.Vector3();
    addedObject.vertices = [];
    addedObject.transformedVertices = [];
    addedObject.triangles = [];
    addedObject.trianglePlanes = [];
    addedObject.pseudoFaces = [];
    addedObject.mesh = new THREE.Object3D();
    addedObject.mesh.matrixWorld.fromArray(curExport.matrixWorld);
    addedObject.mesh.matrixWorld.decompose(addedObject.mesh.position, addedObject.mesh.quaternion, addedObject.mesh.scale);
    addedObject.mesh.position = new THREE.Vector3(curExport.position.x, curExport.position.y, curExport.position.z);
    addedObject.mesh.quaternion = new THREE.Quaternion(curExport.quaternion.x, curExport.quaternion.y, curExport.quaternion.z, curExport.quaternion.w);
    if (childAddedObjectExports[objName]){
      addedObject.mesh.matrixWorld.decompose(addedObject.mesh.position, addedObject.mesh.quaternion, addedObject.mesh.scale);
    }
    addedObject.name = objName;
    if (curExport.positionWhenAttached){
      addedObject.positionWhenAttached = new THREE.Vector3().copy(curExport.positionWhenAttached);
    }
    if (curExport.quaternionWhenAttached){
      addedObject.quaternionWhenAttached = new THREE.Quaternion().set(curExport.quaternionWhenAttached._x, curExport.quaternionWhenAttached._y, curExport.quaternionWhenAttached._z, curExport.quaternionWhenAttached._w);
    }
    var bb = new THREE.Box3();
    bb.roygbivObjectName = objName;
    addedObject.boundingBoxes = [bb];
    for (var i = 0; i<curExport.vertices.length; i++){
      var curVertex = curExport.vertices[i];
      var vect = new THREE.Vector3(curVertex.x, curVertex.y, curVertex.z)
      addedObject.vertices.push(vect.clone());
      addedObject.transformedVertices.push(vect);
      bb.expandByPoint(vect);
    }
    for (var i = 0; i<curExport.triangles.length; i++){
      var curExp = curExport.triangles[i];
      var aVec = new THREE.Vector3(curExp.a.x, curExp.a.y, curExp.a.z);
      var bVec = new THREE.Vector3(curExp.b.x, curExp.b.y, curExp.b.z);
      var cVec = new THREE.Vector3(curExp.c.x, curExp.c.y, curExp.c.z);
      var triangle = new THREE.Triangle(aVec, bVec, cVec);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      addedObject.triangles.push(triangle);
      addedObject.trianglePlanes.push(plane);
    }
    for (var i = 0; i<curExport.pseudoFaces.length; i++){
      var curExp = curExport.pseudoFaces[i];
      var a = curExp.a;
      var b = curExp.b;
      var c = curExp.c;
      var materialIndex = curExp.materialIndex;
      var normal = new THREE.Vector3(curExp.normal.x, curExp.normal.y, curExp.normal.z);
      addedObject.pseudoFaces.push(new THREE.Face3(a, b, c, normal));
    }
    addedObject.updateBoundingBoxes();
    addedObjects[objName] = addedObject;
  }
  for (var objName in objectGroupExports){
    var curExport = objectGroupExports[objName];
    var objectGroup = new ObjectGroup();
    objectGroup.isIntersectable = curExport.isIntersectable;
    objectGroup.isChangeable = curExport.isChangeable;
    objectGroup.lastUpdatePosition = new THREE.Vector3();
    objectGroup.lastUpdateQuaternion = new THREE.Quaternion();
    objectGroup.boundingBoxes = [];
    objectGroup.name = objName;
    objectGroup.graphicsGroup = new THREE.Object3D();
    objectGroup.group = new Object();
    objectGroup.center = new THREE.Vector3(curExport.center.x, curExport.center.y, curExport.center.z);
    objectGroup.childsByChildWorkerId = new Object();
    objectGroup.graphicsGroup.position.copy(objectGroup.center);
    for (var i = 0; i<curExport.childNames.length; i++){
      var childObj = addedObjects[curExport.childNames[i]];
      childObj.mesh.position.copy(childObj.positionWhenAttached);
      childObj.mesh.quaternion.copy(childObj.quaternionWhenAttached);
      childObj.mesh.updateMatrixWorld();
      objectGroup.group[childObj.name] = childObj;
      childObj.mesh.position.sub(objectGroup.center);
      objectGroup.graphicsGroup.add(childObj.mesh);
      objectGroup.graphicsGroup.updateMatrixWorld();
      childObj.mesh.updateMatrixWorld();
      delete addedObjects[childObj.name];
      objectGroup.childsByChildWorkerId[curExport.childWorkerIndices[i]] = childObj;
    }
    objectGroup.graphicsGroup.matrixWorld.fromArray(curExport.matrixWorld);
    objectGroup.graphicsGroup.position.set(curExport.position.x, curExport.position.y, curExport.position.z);
    objectGroup.graphicsGroup.quaternion.set(curExport.quaternion._x, curExport.quaternion._y, curExport.quaternion._z, curExport.quaternion._w);
    objectGroup.mesh = objectGroup.graphicsGroup;
    objectGroup.mesh.updateMatrixWorld();
    for (var i = 0; i<curExport.boundingBoxes.length; i++){
      var curBBExport = curExport.boundingBoxes[i].boundingBox;
      var min = new THREE.Vector3(curBBExport.min.x, curBBExport.min.y, curBBExport.min.z);
      var max = new THREE.Vector3(curBBExport.max.x, curBBExport.max.y, curBBExport.max.z);
      var bb = new THREE.Box3(min.clone(), max.clone());
      bb.roygbivObjectName = curBBExport.roygbivObjectName;
      objectGroup.boundingBoxes.push(bb);
    }
    objectGroup.updateBoundingBoxes();
    objectGroups[objName] = objectGroup;
  }
  for (var textName in addedTextExports){
    var curExport = addedTextExports[textName];
    var addedText = new AddedText();
    addedText.name = curExport.name;
    addedText.bottomLeft = new THREE.Vector3(curExport.bottomLeft.x, curExport.bottomLeft.y, curExport.bottomLeft.z);
    addedText.bottomRight = new THREE.Vector3(curExport.bottomRight.x, curExport.bottomRight.y, curExport.bottomRight.z);
    addedText.topLeft = new THREE.Vector3(curExport.topLeft.x, curExport.topLeft.y, curExport.topLeft.z);
    addedText.topRight = new THREE.Vector3(curExport.topRight.x, curExport.topRight.y, curExport.topRight.z);
    addedText.characterSize = curExport.charSize;
    addedText.mesh = new THREE.Object3D();
    addedText.mesh.position.set(curExport.position.x, curExport.position.y, curExport.position.z);
    addedText.position = new THREE.Vector3(curExport.initPosition.x, curExport.initPosition.y, curExport.initPosition.z);
    addedText.tmpObj = new Object();
    addedText.lastUpdateQuaternion = new THREE.Quaternion();
    addedText.lastUpdatePosition = new THREE.Vector3();
    addedText.lastUpdateCameraPosition = new THREE.Vector3();
    addedText.isClickable = curExport.isClickable;
    addedText.is2D = !!curExport.twoDimensionalSize;
    if (!addedText.is2D){
      addedText.handleBoundingBox();
    }else{
      addedText.twoDimensionalSize = new THREE.Vector4(curExport.twoDimensionalSize.x, curExport.twoDimensionalSize.y, curExport.twoDimensionalSize.z, curExport.twoDimensionalSize.w);
      addedTexts2D[addedText.name] = addedText;
      if (addedText.isClickable){
        clickableAddedTexts2D[addedText.name] = addedText;
      }
    }
    addedTexts[textName] = addedText;
  }
  for (var spriteName in spriteExports){
    sprites[spriteName] = new Sprite(spriteName);
    sprites[spriteName].rectangle = new Rectangle(0, 0, 0, 0).set(
      spriteExports[spriteName].x, spriteExports[spriteName].y,
      spriteExports[spriteName].finalX, spriteExports[spriteName].finalY,
      spriteExports[spriteName].width, spriteExports[spriteName].height
    );
    sprites[spriteName].triangle1.set(spriteExports[spriteName].triangle1.a, spriteExports[spriteName].triangle1.b, spriteExports[spriteName].triangle1.c);
    sprites[spriteName].triangle2.set(spriteExports[spriteName].triangle2.a, spriteExports[spriteName].triangle2.b, spriteExports[spriteName].triangle2.c);
    sprites[spriteName].isClickable = spriteExports[spriteName].clickable;
    if (sprites[spriteName].isClickable){
      clickableSprites[spriteName] = sprites[spriteName];
    }
  }
  for (var containerName in containerExports){
    containers[containerName] = this.containerImportFunc(containerName, containerExports[containerName]);
    if (containers[containerName].isClickable){
      clickableContainers[containerName] = containers[containerName];
    }
  }
  for (var virtualKeyboardName in virtualKeyboardExports){
    this.virtualKeyboardImportFunc(virtualKeyboardName, virtualKeyboardExports[virtualKeyboardName]);
  }
}

StateLoaderLightweight.prototype.virtualKeyboardImportFunc = function(virtualKeyboardName, curExport){
  var params = curExport.parameters;
  virtualKeyboards[virtualKeyboardName] = new VirtualKeyboard(params);
  for (var containerName in curExport.keyContainers){
    var container = this.containerImportFunc(containerName, curExport.keyContainers[containerName]);
    childContainers[container.name] = virtualKeyboards[virtualKeyboardName];
    virtualKeyboards[virtualKeyboardName].childContainersByContainerName[containerName] = container;
    virtualKeyboards[virtualKeyboardName].keyContainers.push(container);
  }
}

StateLoaderLightweight.prototype.containerImportFunc = function(containerName, curExport){
  var container =  new Container2D(containerName);
  container.rectangle = new Rectangle();
  container.rectangle.set(curExport.x, curExport.y, curExport.x2, curExport.y2, curExport.width, curExport.height);
  container.isClickable = curExport.isClickable;
  return container;
}

StateLoaderLightweight.prototype.loadPhysics = function(){
  var addedObjectExports = this.state.addedObjects;
  var childAddedObjectExports = this.state.childAddedObjects;
  var objectGroupExports = this.state.objectGroups;
  var massExports = this.state.masses;
  var totalAddedObjectExports = new Object();
  var childBodies = new Object();
  for (var objName in addedObjectExports){
    totalAddedObjectExports[objName] = addedObjectExports[objName];
  }
  for (var objName in childAddedObjectExports){
    totalAddedObjectExports[objName] = childAddedObjectExports[objName];
  }
  for (var objName in totalAddedObjectExports){
    var curAddedObjectExport = totalAddedObjectExports[objName];
    var physicsBody;
    switch (curAddedObjectExport.type){
      case "surface":
        physicsBody = physicsBodyGenerator.generateBoxBody({
          x: curAddedObjectExport.metaData.physicsShapeParameterX, y: curAddedObjectExport.metaData.physicsShapeParameterY,
          z: curAddedObjectExport.metaData.physicsShapeParameterZ, mass: curAddedObjectExport.mass
        });
      break;
      case "ramp":
        physicsBody = physicsBodyGenerator.generateBoxBody({
          x: curAddedObjectExport.metaData.physicsShapeParameterX, y: curAddedObjectExport.metaData.physicsShapeParameterY,
          z: curAddedObjectExport.metaData.physicsShapeParameterZ, mass: curAddedObjectExport.mass
        });
      break;
      case "box":
        physicsBody = physicsBodyGenerator.generateBoxBody({
          x: curAddedObjectExport.metaData.physicsShapeParameterX, y: curAddedObjectExport.metaData.physicsShapeParameterY,
          z: curAddedObjectExport.metaData.physicsShapeParameterZ, mass: curAddedObjectExport.mass
        });
      break;
      case "sphere":
        physicsBody = physicsBodyGenerator.generateSphereBody({
          radius: curAddedObjectExport.metaData.physicsShapeParameterRadius, mass: curAddedObjectExport.mass
        });
      break;
      case "cylinder":
        physicsBody = physicsBodyGenerator.generateCylinderBody({
          topRadius: curAddedObjectExport.metaData.physicsShapeParameterTopRadius,
          bottomRadius: curAddedObjectExport.metaData.physicsShapeParameterBottomRadius,
          height: curAddedObjectExport.metaData.physicsShapeParameterHeight,
          radialSegments: curAddedObjectExport.metaData.physicsShapeParameterRadialSegments,
          axis: curAddedObjectExport.metaData.physicsShapeParameterAxis, mass: curAddedObjectExport.mass
        });
      break;
      default:
        throw new Error("Not implemented.");
      break;
    }
    physicsBody.position.copy(curAddedObjectExport.physicsPosition);
    physicsBody.quaternion.copy(curAddedObjectExport.physicsQuaternion);
    physicsBody.roygbivName = objName;
    var addedObject = new AddedObject();
    if (curAddedObjectExport.noPhysicsContributionWhenGlued){
      addedObject.noPhysicsContributionWhenGlued = true;
    }
    addedObject.name = objName;
    addedObject.physicsBody = physicsBody;
    addedObject.isSlippery = curAddedObjectExport.isSlippery;
    addedObject.metaData = new Object();
    addedObjects[objName] = addedObject;
    addedObject.isChangeable = curAddedObjectExport.isChangeable;
    addedObject.noMass = curAddedObjectExport.noMass;
    if (!curAddedObjectExport.noMass){
      physicsWorld.addBody(physicsBody);
    }
    if (curAddedObjectExport.hasParent){
      childBodies[objName] = physicsBody;
    }else{
      if (physicsBody.mass > 0){
        dynamicAddedObjects.set(objName, addedObject);
      }
    }
  }
  for (var objName in objectGroupExports){
    var curExport = objectGroupExports[objName];
    var physicsBody;
    if (!curExport.isPhysicsSimplified){
      physicsBody = physicsBodyGenerator.generateEmptyBody();
    }else{
      physicsBody = physicsBodyGenerator.generateBoxBody({x: curExport.physicsSimplificationParameters.sizeX, y: curExport.physicsSimplificationParameters.sizeY, z: curExport.physicsSimplificationParameters.sizeZ});
    }
    physicsBody.roygbivName = objName;
    var hasAnyPhysicsShape = false;
    physicsBody.position.copy(curExport.initialPhysicsPositionWhenGlued);
    for (var i = 0; i<curExport.childNames.length; i++){
      var childBody = childBodies[curExport.childNames[i]];
      var childNoPhysicsContributionWhenGlued = addedObjects[curExport.childNames[i]].noPhysicsContributionWhenGlued;
      physicsWorld.removeBody(childBody);
      delete childBodies[curExport.childNames[i]];
      delete addedObjects[curExport.childNames[i]];
      if (!curExport.isPhysicsSimplified && !childNoPhysicsContributionWhenGlued){
        var shape = childBody.shapes[0];
        physicsBody.addShape(shape, childBody.position.vsub(physicsBody.position), childBody.quaternion);
      }
      if (curExport.isPhysicsSimplified || !childNoPhysicsContributionWhenGlued){
        hasAnyPhysicsShape = true;
      }
    }
    if (curExport.simplifiedChildrenPhysicsBodyDescriptions){
      for (var i = 0; i<curExport.simplifiedChildrenPhysicsBodyDescriptions.length; i++){
        var curDescription = curExport.simplifiedChildrenPhysicsBodyDescriptions[i];
        var simplifiedBody = physicsBodyGenerator.generateBoxBody({x: curDescription.sizeX, y: curDescription.sizeY, z: curDescription.sizeZ});
        simplifiedBody.position.set(curDescription.pbodyPosition.x, curDescription.pbodyPosition.y, curDescription.pbodyPosition.z);
        simplifiedBody.quaternion.set(curDescription.pbodyQuaternion.x, curDescription.pbodyQuaternion.y, curDescription.pbodyQuaternion.z, curDescription.pbodyQuaternion.w);
        physicsBody.addShape(simplifiedBody.shapes[0], simplifiedBody.position.vsub(physicsBody.position), simplifiedBody.quaternion);
        hasAnyPhysicsShape = true;
      }
    }
    var objGroup = new ObjectGroup();
    objGroup.name = objName;
    objGroup.isChangeable = curExport.isChangeable;
    objGroup.physicsBody = physicsBody;
    objGroup.setMass(curExport.mass);
    objGroup.isSlippery = curExport.isSlippery;
    objectGroups[objName] = objGroup;
    objGroup.noMass = curExport.noMass;
    objGroup.cannotSetMass = curExport.cannotSetMass;
    if (hasAnyPhysicsShape && !(curExport.noMass || curExport.cannotSetMass)){
      physicsBody.position.copy(curExport.physicsPosition);
      physicsBody.quaternion.copy(curExport.physicsQuaternion);
      physicsWorld.addBody(physicsBody);
      if (!curExport.noMass && physicsBody.mass > 0){
        dynamicObjectGroups.set(objName, objGroup);
      }
    }
  }
  for (var objName in addedObjects){
    if (addedObjects[objName].isSlippery){
      addedObjects[objName].setSlippery(true);
    }
  }
  for (var objName in objectGroups){
    if (objectGroups[objName].isSlippery){
      objectGroups[objName].setSlippery(true);
    }
  }

  for (var massName in massExports){
    var curMassExport = massExports[massName];
    var mass = new Mass(massName, new CANNON.Vec3(), new CANNON.Vec3());
    mass.import(curMassExport);
    physicsWorld.addBody(mass.physicsBody);
  }
}

StateLoaderLightweight.prototype.loadPhysicsData = function(){
  quatNormalizeSkip = this.state.quatNormalizeSkip;
  quatNormalizeFast = this.state.quatNormalizeFast;
  contactEquationStiffness = this.state.contactEquationStiffness;
  contactEquationRelaxation = this.state.contactEquationRelaxation;
  friction = this.state.friction;
  physicsIterations = this.state.physicsIterations;
  physicsTolerance = this.state.physicsTolerance;
  physicsSolver = new CANNON.GSSolver();
  gravityY = this.state.gravityY;
}

StateLoaderLightweight.prototype.resetPhysics = function(){
  physicsWorld = new CANNON.World();
  dynamicAddedObjects = new Map()
  dynamicObjectGroups = new Map();
  addedObjects = new Object();
  objectGroups = new Object();
}

StateLoaderLightweight.prototype.reset = function(){
  addedObjects = new Object();
  objectGroups = new Object();
  gridSystems = new Object();
  addedTexts = new Object();
  addedTexts2D = new Object();
  clickableAddedTexts2D = new Object();
  clickableSprites = new Object();
  clickableContainers = new Object();
  sprites = new Object();
  particleSystemPool = new Object();
  particleSystems = new Map();
  particlesWithCollisionCallbacks = new Object();
  containers = new Object();
  childContainers = new Object();
  virtualKeyboards = new Object();
  TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
  TOTAL_PARTICLE_SYSTEM_COUNT = 0;
}
