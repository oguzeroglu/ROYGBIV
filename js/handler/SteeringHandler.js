var SteeringHandler = function(){
  this.reset();

  this.vectorPool = new Kompute.VectorPool(10);
}

SteeringHandler.prototype.onAfterSceneChange = function(){
  this.resetWorld();
}

SteeringHandler.prototype.switchDebugMode = function(){
  if (this.debugHelper){
    this.debugHelper.deactivate();
    delete this.debugHelper;
    return false;
  }

  this.debugHelper = new Kompute.DebugHelper(this.world, THREE, scene);
  this.debugHelper.activate();
  return true;
}

SteeringHandler.prototype.reset = function(){
  this.obstaclesBySceneName = {};
  this.usedEntityIDs = {};

  this.resetWorld();
}

SteeringHandler.prototype.resetWorld = function(){
  var limitBBSize = LIMIT_BOUNDING_BOX.getSize(REUSABLE_VECTOR);
  this.world = new Kompute.World(limitBBSize.x, limitBBSize.y, limitBBSize.z, BIN_SIZE);
  this.world.setGravity(-900);

  if (this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
  }

  var obstacles = this.obstaclesBySceneName[sceneHandler.getActiveSceneName()];
  if (obstacles){
    for (var id in obstacles){
      this.world.insertEntity(obstacles[id]);
    }
  }
}

SteeringHandler.prototype.unUseObjectGroupAsAIEntity = function(objectGroup){
  for (var childName in objectGroup.group){
    this.unUseAddedObjectAsAIEntity(objectGroup.group[childName]);
  }
}

SteeringHandler.prototype.useObjectGroupAsAIEntity = function(objectGroup){
  for (var childName in objectGroup.group){
    if (this.usedEntityIDs[childName]){
      return false;
    }
  }

  for (var childName in objectGroup.group){
    this.useAddedObjectAsAIEntity(objectGroup.group[childName]);
  }

  return true;
}

SteeringHandler.prototype.unUseAddedObjectAsAIEntity = function(addedObject){
  this.removeObstacle(addedObject.name);
}

SteeringHandler.prototype.useAddedObjectAsAIEntity = function(addedObject){
  var id = addedObject.name;
  var bb = addedObject.boundingBoxes[0];

  var center = bb.getCenter(REUSABLE_VECTOR);
  var size = bb.getSize(REUSABLE_VECTOR_2);

  return this.addObstacle(id, new Kompute.Vector3D(center.x, center.y, center.z), new Kompute.Vector3D(size.x, size.y, size.z));
}

SteeringHandler.prototype.addObstacle = function(id, position, size){
  if (this.usedEntityIDs[id]){
    return false;
  }

  var entity = new Kompute.Entity(id, position, size);

  this.world.insertEntity(entity);

  var obstacles = this.obstaclesBySceneName[sceneHandler.getActiveSceneName()];
  if (!obstacles){
    obstacles = {};
    this.obstaclesBySceneName[sceneHandler.getActiveSceneName()] = obstacles;
  }

  obstacles[id] = entity;
  this.usedEntityIDs[id] = entity;
  return true;
}

SteeringHandler.prototype.removeObstacle = function(id){
  var entity = this.usedEntityIDs[id];
  if (!entity){
    return false;
  }

  this.world.removeEntity(entity);

  delete this.obstaclesBySceneName[sceneHandler.getActiveSceneName()][id];
  delete this.usedEntityIDs[id];
}

SteeringHandler.prototype.updateObject = function(obj, sceneName){
  if (!obj.usedAsAIEntity){
    return;
  }

  var obstacles = this.obstaclesBySceneName[sceneName || obj.registeredSceneName];
  var entity = obstacles[obj.name];

  if (obj.isAddedObject){
    if (typeof obj.parentObjectName === UNDEFINED){
      obj.mesh.updateMatrixWorld(true);
      obj.updateBoundingBoxes();
    }
    var bb = obj.boundingBoxes[0];
    var center = bb.getCenter(REUSABLE_VECTOR);
    var size = bb.getSize(REUSABLE_VECTOR_2);
    var centerKomputeVector = this.vectorPool.get().set(center.x, center.y, center.z);
    var sizeKomputeVector = this.vectorPool.get().set(size.x, size.y, size.z);
    entity.setPositionAndSize(centerKomputeVector, sizeKomputeVector);
  }else if (obj.isObjectGroup){
    obj.mesh.updateMatrixWorld(true);
    obj.updateBoundingBoxes();
    for (var childname in obj.group){
      this.updateObject(obj.group[childname], obj.registeredSceneName);
    }
  }
}
