var SteeringHandler = function(){
  this.reset();
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
  }

  var obstacles = this.obstaclesBySceneName[sceneHandler.getActiveSceneName()];
  if (obstacles){
    for (var id in obstacles){
      this.world.insertEntity(obstacles[id]);
    }
  }
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
