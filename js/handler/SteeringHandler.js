var SteeringHandler = function(){
  this.reset();

  this.vectorPool = new Kompute.VectorPool(10);

  this.issueUpdate = this.issueUpdate.bind(this);
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

  this.updateBuffer = new Map();

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

SteeringHandler.prototype.updateObject = function(obj){
  if (!obj.usedAsAIEntity){
    return;
  }

  this.updateBuffer.set(obj.name, obj);
}

SteeringHandler.prototype.hide = function(obj){
  if (!obj.usedAsAIEntity){
    return;
  }

  if (obj.isObjectGroup){
    for (var childName in obj.group){
      this.hide(obj.group[childName]);
    }
    return;
  }

  var sceneName = obj.registeredSceneName;
  if (!sceneName){
    sceneName = objectGroups[obj.parentObjectName].registeredSceneName;
  }

  var obstacles = this.obstaclesBySceneName[sceneName];
  var entity = obstacles[obj.name];

  this.world.hideEntity(entity);
}

SteeringHandler.prototype.show = function(obj){
  if (!obj.usedAsAIEntity){
    return;
  }

  if (obj.isObjectGroup){
    for (var childName in obj.group){
      this.show(obj.group[childName]);
    }
    return;
  }

  var sceneName = obj.registeredSceneName;
  if (!sceneName){
    sceneName = objectGroups[obj.parentObjectName].registeredSceneName;
  }

  var obstacles = this.obstaclesBySceneName[sceneName];
  var entity = obstacles[obj.name];

  this.world.showEntity(entity);
  if (typeof obj.parentObjectName === UNDEFINED){
    this.updateObject(obj);
  }else{
    this.updateObject(objectGroups[obj.parentObjectName]);
  }
}

SteeringHandler.prototype.issueUpdate = function(obj){

  var sceneName = obj.registeredSceneName;
  if (!sceneName){
    sceneName = objectGroups[obj.parentObjectName].registeredSceneName;
  }

  if (!sceneName){
    return;
  }

  var obstacles = this.obstaclesBySceneName[sceneName];

  if (!obstacles){
    return;
  }

  var entity = obstacles[obj.name];

  if (obj.isAddedObject){

    if (!entity){
      return;
    }

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
      this.issueUpdate(obj.group[childname]);
    }
  }
}

SteeringHandler.prototype.update = function(){
  this.updateBuffer.forEach(this.issueUpdate);
  this.updateBuffer.clear();
}
