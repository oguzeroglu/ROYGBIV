var SteeringHandler = function(){
  this.reset();

  this.vectorPool = new Kompute.VectorPool(10);

  this.issueUpdate = this.issueUpdate.bind(this);
}

SteeringHandler.prototype.import = function(exportObj){
  var obstacleInfo = exportObj.obstacleInfo;
  var jumpDescriptorInfo = exportObj.jumpDescriptorInfo;
  var pathInfo = exportObj.pathInfo;
  var pathsByJumpDescriptors = exportObj.pathsByJumpDescriptors;

  for (var sceneName in obstacleInfo){
    for (var id in obstacleInfo[sceneName]){
      var curExport = obstacleInfo[sceneName][id];
      var pos = curExport.position;
      var size = curExport.size;
      this.addObstacle(id, new Kompute.Vector3D(pos.x, pos.y, pos.z), new Kompute.Vector3D(size.x, size.y, size.z), sceneName);
    }
  }

  for (var sceneName in jumpDescriptorInfo){
    this.jumpDescriptorsBySceneName[sceneName] = {};
    for (var id in jumpDescriptorInfo[sceneName]){
      var curExport = jumpDescriptorInfo[sceneName][id];
      var takeoffPosition = curExport.takeoffPosition;
      var landingPosition = curExport.landingPosition;
      var runupSatisfactionRadius = curExport.runupSatisfactionRadius;
      var takeoffPositionSatisfactionRadius = curExport.takeoffPositionSatisfactionRadius;
      var takeoffVelocitySatisfactionRadius = curExport.takeoffVelocitySatisfactionRadius;
      var jumpDescriptor = new Kompute.JumpDescriptor({
        takeoffPosition: new Kompute.Vector3D(takeoffPosition.x, takeoffPosition.y, takeoffPosition.z),
        landingPosition: new Kompute.Vector3D(landingPosition.x, landingPosition.y, landingPosition.z),
        runupSatisfactionRadius: runupSatisfactionRadius,
        takeoffPositionSatisfactionRadius: takeoffPositionSatisfactionRadius,
        takeoffVelocitySatisfactionRadius: takeoffVelocitySatisfactionRadius
      });
      this.jumpDescriptorsBySceneName[sceneName][id] = jumpDescriptor;
      this.usedJumpDescriptorIDs[id] = jumpDescriptor;
    }
  }

  for (var sceneName in pathInfo){
    this.pathsBySceneName[sceneName] = {};
    for (var id in pathInfo[sceneName]){
      var curExport = pathInfo[sceneName][id];
      var path = new Kompute.Path({loop: curExport.loop, rewind: curExport.rewind});
      for (var i = 0; i < curExport.waypoints.length; i ++){
        var wp = curExport.waypoints[i];
        path.addWaypoint(new Kompute.Vector3D(wp.x, wp.y, wp.z));
      }
      this.pathsBySceneName[sceneName][id] = path;
      this.usedPathIDs[id] = path;
    }
  }

  for (var jdID in pathsByJumpDescriptors){
    var paths = pathsByJumpDescriptors[jdID];
    for (var pathID in paths){
      this.insertJumpDescriptorToPath(jdID, pathID);
    }
  }
}

SteeringHandler.prototype.export = function(){
  var exportObject = {
    obstacleInfo: {},
    jumpDescriptorInfo: {},
    pathInfo: {},
    pathsByJumpDescriptors: {}
  };

  for (var sceneName in this.obstaclesBySceneName){
    exportObject.obstacleInfo[sceneName] = {};
    var obstacles = this.obstaclesBySceneName[sceneName];
    for (var id in obstacles){
      var entity = obstacles[id];
      exportObject.obstacleInfo[sceneName][id] = {
        position: {x: entity.position.x, y: entity.position.y, z: entity.position.z},
        size: {x: entity.size.x, y: entity.size.y, z: entity.size.z}
      };
    }
  }

  for (var sceneName in this.jumpDescriptorsBySceneName){
    exportObject.jumpDescriptorInfo[sceneName] = {};
    var jumpDescriptors = this.jumpDescriptorsBySceneName[sceneName];
    for (var id in jumpDescriptors){
      var jd = jumpDescriptors[id];
      exportObject.jumpDescriptorInfo[sceneName][id] = {
        takeoffPosition: {x: jd.takeoffPosition.x, y: jd.takeoffPosition.y, z: jd.takeoffPosition.z},
        landingPosition: {x: jd.landingPosition.x, y: jd.landingPosition.y, z: jd.landingPosition.z},
        runupSatisfactionRadius: jd.runupSatisfactionRadius,
        takeoffPositionSatisfactionRadius: jd.takeoffPositionSatisfactionRadius,
        takeoffVelocitySatisfactionRadius: jd.takeoffVelocitySatisfactionRadius
      };
    }
  }

  for (var sceneName in this.pathsBySceneName){
    exportObject.pathInfo[sceneName] = {};
    var paths = this.pathsBySceneName[sceneName];
    for (var id in paths){
      var path = paths[id];
      exportObject.pathInfo[sceneName][id] = {
        rewind: path.rewind,
        loop: path.loop,
        waypoints: []
      };
      for (var i = 0; i < path.waypoints.length; i ++){
        var wp = path.waypoints[i];
        exportObject.pathInfo[sceneName][id].waypoints.push({x: wp.x, y: wp.y, z: wp.z});
      }
    }
  }

  for (var jdID in this.pathsByJumpDescriptors){
    exportObject.pathsByJumpDescriptors[jdID] = {};
    var paths = this.pathsByJumpDescriptors[jdID];
    for (var pathID in paths){
      exportObject.pathsByJumpDescriptors[jdID][pathID] = true;
    }
  }

  return exportObject;
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

  for (var id in this.pathsBySceneName[sceneHandler.getActiveSceneName()]){
    this.debugHelper.visualisePath(this.pathsBySceneName[sceneHandler.getActiveSceneName()][id]);
  }

  return true;
}

SteeringHandler.prototype.reset = function(){
  this.obstaclesBySceneName = {};
  this.usedEntityIDs = {};

  this.jumpDescriptorsBySceneName = {};
  this.usedJumpDescriptorIDs = {};

  this.pathsBySceneName = {};
  this.usedPathIDs = {};

  this.pathsByJumpDescriptors = {};

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

SteeringHandler.prototype.addObstacle = function(id, position, size, overrideSceneName){
  if (this.usedEntityIDs[id]){
    return false;
  }

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var entity = new Kompute.Entity(id, position, size);

  if (sceneName == sceneHandler.getActiveSceneName()){
    this.world.insertEntity(entity);
  }

  var obstacles = this.obstaclesBySceneName[sceneName];
  if (!obstacles){
    obstacles = {};
    this.obstaclesBySceneName[sceneName] = obstacles;
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

SteeringHandler.prototype.addJumpDescriptor = function(id, takeoffMarkedPoint, landingMarkedPoint, runupSatisfactionRadius, takeoffPositionSatisfactionRadius, takeoffVelocitySatisfactionRadius){
  if (this.usedJumpDescriptorIDs[id]){
    return false;
  }

  var takeoffVector = new Kompute.Vector3D(takeoffMarkedPoint.x, takeoffMarkedPoint.y, takeoffMarkedPoint.z);
  var landingVector = new Kompute.Vector3D(landingMarkedPoint.x, landingMarkedPoint.y, landingMarkedPoint.z);
  var jumpDescriptor = new Kompute.JumpDescriptor({
    takeoffPosition: takeoffVector,
    landingPosition: landingVector,
    runupSatisfactionRadius: runupSatisfactionRadius,
    takeoffPositionSatisfactionRadius: takeoffPositionSatisfactionRadius,
    takeoffVelocitySatisfactionRadius: takeoffVelocitySatisfactionRadius
  });

  this.usedJumpDescriptorIDs[id] = jumpDescriptor;
  var jumpDescriptors = this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()];
  if (!jumpDescriptors){
    jumpDescriptors = {};
    this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()] = jumpDescriptors;
  }

  jumpDescriptors[id] = jumpDescriptor;
  return true;
}

SteeringHandler.prototype.removeJumpDescriptor = function(id){
  if (!this.usedJumpDescriptorIDs[id]){
    return;
  }

  delete this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()][id];
  delete this.usedJumpDescriptorIDs[id];
}

SteeringHandler.prototype.addPath = function(id, markedPoints, loop, rewind){
  if (this.usedPathIDs[id]){
    return false;
  }

  var path = new Kompute.Path({loop: loop, rewind: rewind});

  for (var i = 0; i < markedPoints.length; i ++){
    var waypoint = new Kompute.Vector3D(markedPoints[i].x, markedPoints[i].y, markedPoints[i].z);
    path.addWaypoint(waypoint);
  }

  this.usedPathIDs[id] = path;
  var paths = this.pathsBySceneName[sceneHandler.getActiveSceneName()];
  if (!paths){
    paths = {};
    this.pathsBySceneName[sceneHandler.getActiveSceneName()] = paths;
  }

  paths[id] = path;

  if (this.debugHelper){
    this.debugHelper.visualisePath(path);
  }

  return true;
}

SteeringHandler.prototype.removePath = function(id){
  if (!this.usedPathIDs[id]){
    return;
  }

  delete this.usedPathIDs[id];
  delete this.pathsBySceneName[sceneHandler.getActiveSceneName()][id];

  for (var jdID in this.pathsByJumpDescriptors){
    delete this.pathsByJumpDescriptors[jdID][id];
  }
}

SteeringHandler.prototype.insertJumpDescriptorToPath = function(jumpDescriptorID, pathID){
  var jumpDescriptor = this.usedJumpDescriptorIDs[jumpDescriptorID];
  var path = this.usedPathIDs[pathID];

  var result = path.addJumpDescriptor(jumpDescriptor);

  if (!result){
    return false;
  }

  if (!this.pathsByJumpDescriptors[jumpDescriptorID]){
    this.pathsByJumpDescriptors[jumpDescriptorID] = {};
  }

  this.pathsByJumpDescriptors[jumpDescriptorID][pathID] = path;
  return true;
}

SteeringHandler.prototype.update = function(){
  this.updateBuffer.forEach(this.issueUpdate);
  this.updateBuffer.clear();
}
