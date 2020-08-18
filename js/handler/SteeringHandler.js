var SteeringHandler = function(){
  this.reset();

  this.vectorPool = new Kompute.VectorPool(10);

  this.issueUpdate = this.issueUpdate.bind(this);

  this.steeringModes = {
    TRACK_POSITION: "Track position",
    TRACK_VELOCITY: "Track velocity"
  };

  this.steeringBehaviorTypes = {
    ALIGN: "AlignBehavior",
    ARRIVE: "ArriveBehavior",
    AVOID: "AvoidBehavior",
    BLENDED: "BlendedSteeringBehavior",
    COHESIION: "CohesionBehavior",
    EVADE: "EvadeBehavior",
    FLEE: "FleeBehavior",
    HIDE: "HideBehavior",
    LOOK_WHERE_YOU_ARE_GOING: "LookWhereYouAreGoingBehavior",
    PATH_FOLLOWING: "PathFollowingBehavior",
    PRIORITY: "PrioritySteeringBehavior",
    PURSUE: "PursueBehavior",
    RANDOM_PATH: "RandomPathBehavior",
    RANDOM_WAYPOINT: "RandomWaypointBehavior",
    SEEK: "SeekBehavior",
    SEPARATION: "SeparationBehavior",
    WANDER_TWO: "Wander2DBehavior",
    WANDER_THREE: "Wander3DBehavior"
  };
}

SteeringHandler.prototype.onSceneDeletion = function(sceneName){

  var behaviorsInScene = this.behaviorsBySceneName[sceneName] || {};
  for (var bid in behaviorsInScene){
    delete this.usedBehaviorIDs[bid];
  }

  var obstaclesInScene = this.obstaclesBySceneName[sceneName] || {};
  for (var obsID in obstaclesInScene){
    delete this.usedEntityIDs[obsID];
  }

  var graphsInScene = this.graphsBySceneName[sceneName] || {};
  for (var gid in graphsInScene){
    delete this.usedGraphIDs[gid];
  }

  var pathsInScene = this.pathsBySceneName[sceneName] || {};
  for (var pid in pathsInScene){
    delete this.usedPathIDs[pid];
  }

  var aStarsInScene = this.astarsBySceneName[sceneName] || {};
  for (var asid in aStarsInScene){
    delete this.usedAStarIDs[asid];
  }

  var jumpDescriptorsInScene = this.jumpDescriptorsBySceneName[sceneName] || {};
  for (var jdid in jumpDescriptorsInScene){
    delete this.usedJumpDescriptorIDs[jdid];
    delete this.graphsByJumpDescriptors[jdid];
    delete this.pathsByJumpDescriptors[jdid];
  }

  delete this.obstaclesBySceneName[sceneName];
  delete this.steerablesBySceneName[sceneName];
  delete this.jumpDescriptorsBySceneName[sceneName];
  delete this.pathsBySceneName[sceneName];
  delete this.graphsBySceneName[sceneName];
  delete this.astarsBySceneName[sceneName];
  delete this.behaviorsBySceneName[sceneName];
}

SteeringHandler.prototype.setBehavior = function(object, behaviorName){
  var constructedBehavior = object.constructedSteeringBehaviors[behaviorName];
  var steerable = object.steerable;
  steerable.setBehavior(constructedBehavior);
  this.activeSteerablesMap.set(object.name, object);
}

SteeringHandler.prototype.stopSteerable = function(object){

  if (!this.activeSteerablesMap.has(object.name)){
    return;
  }

  this.activeSteerablesMap.delete(object.name);
  object.steerable.velocity.set(0, 0, 0);
  if (object.steerableInfo.mode == this.steeringModes.TRACK_VELOCITY){
    object.resetVelocity();
  }
}

SteeringHandler.prototype.onModeSwitch = function(){
  this.activeSteerablesMap = new Map();
  this.clonedGraphsBySceneName = new Object();

  for (var id in this.usedAStarIDs){
    var aStar = this.usedAStarIDs[id];

    aStar.path.length = 0;
    if (aStar.onPathConstructed){
      aStar.onPathConstructed();
    }
  }
}

SteeringHandler.prototype.import = function(exportObj){
  var obstacleInfo = exportObj.obstacleInfo;
  var jumpDescriptorInfo = exportObj.jumpDescriptorInfo;
  var pathInfo = exportObj.pathInfo;
  var pathsByJumpDescriptors = exportObj.pathsByJumpDescriptors;
  var graphsByJumpDescriptors = exportObj.graphsByJumpDescriptors;
  var graphInfo = exportObj.graphInfo;
  var aStarInfo = exportObj.aStarInfo;
  var steeringBehaviorInfo = exportObj.steeringBehaviorInfo;

  for (var sceneName in obstacleInfo){
    for (var id in obstacleInfo[sceneName]){
      var curExport = obstacleInfo[sceneName][id];
      var pos = curExport.position;
      var size = curExport.size;
      this.addObstacle(id, new Kompute.Vector3D(pos.x, pos.y, pos.z), new Kompute.Vector3D(size.x, size.y, size.z), sceneName);
      this.usedEntityIDs[id].excludeFromHide = !!curExport.excludeFromHide;
    }
  }

  for (var sceneName in jumpDescriptorInfo){
    this.jumpDescriptorsBySceneName[sceneName] = {};
    for (var id in jumpDescriptorInfo[sceneName]){
      var curExport = jumpDescriptorInfo[sceneName][id];
      var takeoffPosition = curExport.takeoffPosition;
      var landingPosition = curExport.landingPosition;
      var takeoffPositionSatisfactionRadius = curExport.takeoffPositionSatisfactionRadius;
      var jumpDescriptor = new Kompute.JumpDescriptor({
        takeoffPosition: new Kompute.Vector3D(takeoffPosition.x, takeoffPosition.y, takeoffPosition.z),
        landingPosition: new Kompute.Vector3D(landingPosition.x, landingPosition.y, landingPosition.z),
        takeoffPositionSatisfactionRadius: takeoffPositionSatisfactionRadius
      });
      this.jumpDescriptorsBySceneName[sceneName][id] = jumpDescriptor;
      this.usedJumpDescriptorIDs[id] = jumpDescriptor;
      jumpDescriptor.roygbivName = id;
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

  for (var sceneName in graphInfo){
    this.graphsBySceneName[sceneName] = {};
    for (var id in graphInfo[sceneName]){
      var curExport = graphInfo[sceneName][id];
      var graph = new Kompute.Graph();
      for (var i = 0; i < curExport.vertices.length; i ++){
        var curVertex = curExport.vertices[i];
        graph.addVertex(new Kompute.Vector3D(curVertex.x, curVertex.y, curVertex.z));
      }
      for (var i = 0; i < curExport.edges.length; i ++){
        var curEdge = curExport.edges[i];
        var v1 = new Kompute.Vector3D(curEdge.fromX, curEdge.fromY, curEdge.fromZ);
        var v2 = new Kompute.Vector3D(curEdge.toX, curEdge.toY, curEdge.toZ);
        graph.addEdge(v1, v2);
      }

      this.graphsBySceneName[sceneName][id] = graph;
      this.usedGraphIDs[id] = graph;
    }
  }

  for (var jdID in graphsByJumpDescriptors){
    var graphs = graphsByJumpDescriptors[jdID];
    for (var graphID in graphs){
      this.insertJumpDescriptorToGraph(jdID, graphID);
    }
  }

  var importLaterList = new Object();

  for (var sceneName in steeringBehaviorInfo){
    this.behaviorsBySceneName[sceneName] = {};
    for (var behaviorName in steeringBehaviorInfo[sceneName]){
      var curExport = steeringBehaviorInfo[sceneName][behaviorName];
      if (curExport.type == this.steeringBehaviorTypes.BLENDED || curExport.type == this.steeringBehaviorTypes.PRIORITY){
        var curImportLaters = importLaterList[sceneName] || [];
        curImportLaters.push(curExport);
        importLaterList[sceneName] = curImportLaters;
        continue;
      }
      var behavior = new PreconfiguredSteeringBehavior(curExport);
      this.behaviorsBySceneName[sceneName][behaviorName] = behavior;
      this.usedBehaviorIDs[behaviorName] = behavior;
    }
  }

  for (var sceneName in importLaterList){
    for (var i = 0; i < importLaterList[sceneName].length; i ++){
      var curExport = importLaterList[sceneName][i];
      if (curExport.type == this.steeringBehaviorTypes.BLENDED){
        for (var i2 = 0; i2 < curExport.list.length; i2 ++){
          curExport.list[i2].behavior = this.usedBehaviorIDs[curExport.list[i2].behavior.name];
        }
      }else{
        for (var i2 = 0; i2 < curExport.list.length; i2 ++){
          curExport.list[i2] = this.usedBehaviorIDs[curExport.list[i2].name];
        }
      }
      var behavior = new PreconfiguredSteeringBehavior(curExport);
      this.behaviorsBySceneName[sceneName][curExport.name] = behavior;
      this.usedBehaviorIDs[curExport.name] = behavior;
    }
  }

  for (var sceneName in aStarInfo){
    var aStars = aStarInfo[sceneName];
    for (var id in aStars){
      this.addAStar(id, aStars[id], sceneName);
    }
  }
}

SteeringHandler.prototype.export = function(){
  var exportObject = {
    obstacleInfo: {},
    jumpDescriptorInfo: {},
    pathInfo: {},
    pathsByJumpDescriptors: {},
    graphsByJumpDescriptors: {},
    graphInfo: {},
    aStarInfo: {},
    steeringBehaviorInfo: {}
  };

  for (var sceneName in this.obstaclesBySceneName){
    exportObject.obstacleInfo[sceneName] = {};
    var obstacles = this.obstaclesBySceneName[sceneName];
    for (var id in obstacles){
      var entity = obstacles[id];
      exportObject.obstacleInfo[sceneName][id] = {
        position: {x: entity.position.x, y: entity.position.y, z: entity.position.z},
        size: {x: entity.size.x, y: entity.size.y, z: entity.size.z},
        excludeFromHide: !!entity.excludeFromHide
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
        takeoffPositionSatisfactionRadius: jd.takeoffPositionSatisfactionRadius
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

  for (var jdID in this.graphsByJumpDescriptors){
    exportObject.graphsByJumpDescriptors[jdID] = {};
    var graphs = this.graphsByJumpDescriptors[jdID];
    for (var graphID in graphs){
      exportObject.graphsByJumpDescriptors[jdID][graphID] = true;
    }
  }

  for (var sceneName in this.graphsBySceneName){
    exportObject.graphInfo[sceneName] = {};
    var graphs = this.graphsBySceneName[sceneName];
    for (var id in graphs){
      var graph = graphs[id];
      var obj = {vertices: [], edges: []};
      graph.forEachVertex(function(x, y, z){
        obj.vertices.push({x: x, y: y, z: z});
      });
      graph.forEachEdge(function(edge){
        obj.edges.push({
          fromX: edge.fromVertex.x, fromY: edge.fromVertex.y, fromZ: edge.fromVertex.z,
          toX: edge.toVertex.x, toY: edge.toVertex.y, toZ: edge.toVertex.z
        });
      });

      exportObject.graphInfo[sceneName][id] = obj;
    }
  }

  for (var sceneName in this.behaviorsBySceneName){
    exportObject.steeringBehaviorInfo[sceneName] = {};
    for (var behaviorName in this.behaviorsBySceneName[sceneName]){
      exportObject.steeringBehaviorInfo[sceneName][behaviorName] = this.behaviorsBySceneName[sceneName][behaviorName].export();
    }
  }

  for (var sceneName in this.astarsBySceneName){
    exportObject.aStarInfo[sceneName] = {};
    for (var aStarID in this.astarsBySceneName[sceneName]){
      exportObject.aStarInfo[sceneName][aStarID] = this.graphIDsByAStars[aStarID];
    }
  }

  return exportObject;
}

SteeringHandler.prototype.onAfterSceneChange = function(){
  this.resetWorld();
  if (mode == 1){
    this.activeSteerablesMap = new Map();
  }
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

  for (var id in this.graphsBySceneName[sceneHandler.getActiveSceneName()]){
    this.debugHelper.visualiseGraph(this.graphsBySceneName[sceneHandler.getActiveSceneName()][id]);
  }

  for (var id in this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()]){
    this.debugHelper.visualiseJumpDescriptor(this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()][id]);
  }

  if (mode == 1){
    var aStars = this.astarsBySceneName[sceneHandler.getActiveSceneName()];
    if (aStars){
      for (var asid in aStars){
        this.debugHelper.visualiseAStar(aStars[asid]);
      }
    }

    for (var objName in sceneHandler.getAddedObjects()){
      var obj = addedObjects[objName];
      if (obj.steerableInfo){
        for (var bid in obj.constructedSteeringBehaviors){
          var behavior = obj.constructedSteeringBehaviors[bid];
          if (behavior instanceof Kompute.RandomPathBehavior){
            this.debugHelper.visualiseAStar(behavior.aStar);
          }else if(behavior instanceof Kompute.BlendedSteeringBehavior){
            for (var i = 0; i < behavior.definitions.length; i ++){
              if (behavior.definitions[i].behavior instanceof Kompute.RandomPathBehavior){
                this.debugHelper.visualiseAStar(behavior.definitions[i].behavior.aStar);
              }
            }
          }else if (behavior instanceof Kompute.PrioritySteeringBehavior){
            for (var i = 0; i < behavior.list.length; i ++){
              if (behavior.list[i] instanceof Kompute.RandomPathBehavior){
                this.debugHelper.visualiseAStar(behavior.list[i].aStar);
              }
            }
          }
        }
      }
    }
    for (var objName in sceneHandler.getObjectGroups()){
      var obj = objectGroups[objName];
      if (obj.steerableInfo){
        for (var bid in obj.constructedSteeringBehaviors){
          var behavior = obj.constructedSteeringBehaviors[bid];
          if (behavior instanceof Kompute.RandomPathBehavior){
            this.debugHelper.visualiseAStar(behavior.aStar);
          }else if(behavior instanceof Kompute.BlendedSteeringBehavior){
            for (var i = 0; i < behavior.definitions.length; i ++){
              if (behavior.definitions[i].behavior instanceof Kompute.RandomPathBehavior){
                this.debugHelper.visualiseAStar(behavior.definitions[i].behavior.aStar);
              }
            }
          }else if (behavior instanceof Kompute.PrioritySteeringBehavior){
            for (var i = 0; i < behavior.list.length; i ++){
              if (behavior.list[i] instanceof Kompute.RandomPathBehavior){
                this.debugHelper.visualiseAStar(behavior.list[i].aStar);
              }
            }
          }
        }
      }
    }
  }

  return true;
}

SteeringHandler.prototype.reset = function(){

  if (this.debugHelper){
    this.switchDebugMode();
  }

  this.obstaclesBySceneName = {};
  this.steerablesBySceneName = {};
  this.usedEntityIDs = {};

  this.jumpDescriptorsBySceneName = {};
  this.usedJumpDescriptorIDs = {};

  this.pathsBySceneName = {};
  this.usedPathIDs = {};

  this.pathsByJumpDescriptors = {};
  this.graphsByJumpDescriptors = {};

  this.graphIDsByAStars = {};

  this.usedGraphIDs = {};
  this.graphsBySceneName = {};

  this.usedAStarIDs = {};
  this.astarsBySceneName = {};

  this.behaviorsBySceneName = {};
  this.usedBehaviorIDs = {};

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

  var steerables = this.steerablesBySceneName[sceneHandler.getActiveSceneName()];
  if (steerables){
    for (var id in steerables){
      this.world.insertEntity(steerables[id]);
    }
  }

  var graphs = this.graphsBySceneName[sceneHandler.getActiveSceneName()];
  if (graphs){
    for (var id in graphs){
      var graph = graphs[id];
      if (graph.world){
        graph.world.removeGraph(graph);
      }
      this.world.insertGraph(graph);
    }
  }

  if (mode == 1){
    var clonedGraphs = this.clonedGraphsBySceneName[sceneHandler.getActiveSceneName()];
    if (clonedGraphs){
      for (var i = 0; i < clonedGraphs.length; i++){
        var graph = clonedGraphs[i];
        if (graph.world){
          graph.world.removeGraph(graph);
        }
        this.world.insertGraph(graph);
      }
    }

    var aStars = this.astarsBySceneName[sceneHandler.getActiveSceneName()];
    if (aStars){
      for (var astarID in aStars){
        var aStar = aStars[astarID];
        var graph = aStar.graph;
        if (graph.world){
          graph.world.removeGraph(graph);
        }
        this.world.insertGraph(graph);
      }
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

SteeringHandler.prototype.removeObstacle = function(id, overrideSceneName){
  var entity = this.usedEntityIDs[id];
  if (!entity){
    return false;
  }

  this.world.removeEntity(entity);

  if (entity instanceof Kompute.Steerable){
    delete this.steerablesBySceneName[overrideSceneName || sceneHandler.getActiveSceneName()][id];
  }else{
    delete this.obstaclesBySceneName[overrideSceneName || sceneHandler.getActiveSceneName()][id];
  }

  delete this.usedEntityIDs[id];
}

SteeringHandler.prototype.updateObject = function(obj){
  if (!obj.usedAsAIEntity && !obj.steerableInfo){
    return;
  }

  this.updateBuffer.set(obj.name, obj);
}

SteeringHandler.prototype.hide = function(obj){
  if (!obj.usedAsAIEntity && !obj.steerableInfo){
    return;
  }

  if (!obj.steerableInfo && obj.isObjectGroup){
    for (var childName in obj.group){
      this.hide(obj.group[childName]);
    }
    return;
  }

  var sceneName = obj.registeredSceneName;
  if (!sceneName){
    sceneName = objectGroups[obj.parentObjectName].registeredSceneName;
  }

  var entities = obj.steerableInfo? this.steerablesBySceneName[sceneName]: this.obstaclesBySceneName[sceneName];
  var entity = entities[obj.name];

  this.world.hideEntity(entity);
}

SteeringHandler.prototype.show = function(obj){
  if (!obj.usedAsAIEntity && !obj.steerableInfo){
    return;
  }

  if (!obj.steerableInfo && obj.isObjectGroup){
    for (var childName in obj.group){
      this.show(obj.group[childName]);
    }
    return;
  }

  var sceneName = obj.registeredSceneName;
  if (!sceneName){
    sceneName = objectGroups[obj.parentObjectName].registeredSceneName;
  }

  var entities = obj.steerableInfo? this.steerablesBySceneName[sceneName]: this.obstaclesBySceneName[sceneName];
  var entity = entities[obj.name];

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

  var entities = obj.steerableInfo? this.steerablesBySceneName[sceneName]: this.obstaclesBySceneName[sceneName];

  if (!entities){
    return;
  }

  var entity = entities[obj.name];

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

    if (obj.steerableInfo){
      REUSABLE_BOX3.makeEmpty();
      for (var i = 0; i < obj.boundingBoxes.length; i ++){
        var bb = obj.boundingBoxes[i];
        REUSABLE_BOX3.expandByPoint(bb.min);
        REUSABLE_BOX3.expandByPoint(bb.max);
      }
      var center = REUSABLE_BOX3.getCenter(REUSABLE_VECTOR);
      var size = REUSABLE_BOX3.getSize(REUSABLE_VECTOR_2);
      var centerKomputeVector = this.vectorPool.get().set(center.x, center.y, center.z);
      var sizeKomputeVector = this.vectorPool.get().set(size.x, size.y, size.z);
      entity.setPositionAndSize(centerKomputeVector, sizeKomputeVector);
    }else{
      for (var childname in obj.group){
        this.issueUpdate(obj.group[childname]);
      }
    }
  }
}

SteeringHandler.prototype.issueSteerableUpdate = function(object){
  var steerable = object.steerable;
  steerable.update();

  var mode = object.steerableInfo.mode;
  if (mode == steeringHandler.steeringModes.TRACK_POSITION){
    var pos = steerable.position;
    object.setPosition(pos.x, pos.y, pos.z);
  }else{
    var velocity = steerable.velocity;
    object.setVelocity(velocity);
  }
}

SteeringHandler.prototype.addJumpDescriptor = function(id, takeoffMarkedPoint, landingMarkedPoint, takeoffPositionSatisfactionRadius){
  if (this.usedJumpDescriptorIDs[id]){
    return false;
  }

  var takeoffVector = new Kompute.Vector3D(takeoffMarkedPoint.x, takeoffMarkedPoint.y, takeoffMarkedPoint.z);
  var landingVector = new Kompute.Vector3D(landingMarkedPoint.x, landingMarkedPoint.y, landingMarkedPoint.z);
  var jumpDescriptor = new Kompute.JumpDescriptor({
    takeoffPosition: takeoffVector,
    landingPosition: landingVector,
    takeoffPositionSatisfactionRadius: takeoffPositionSatisfactionRadius
  });

  jumpDescriptor.roygbivName = id;

  this.usedJumpDescriptorIDs[id] = jumpDescriptor;
  var jumpDescriptors = this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()];
  if (!jumpDescriptors){
    jumpDescriptors = {};
    this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()] = jumpDescriptors;
  }

  jumpDescriptors[id] = jumpDescriptor;
  return jumpDescriptor;
}

SteeringHandler.prototype.removeJumpDescriptor = function(id){
  if (!this.usedJumpDescriptorIDs[id]){
    return;
  }

  delete this.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()][id];
  delete this.usedJumpDescriptorIDs[id];
}

SteeringHandler.prototype.addAStar = function(id, graphID, overrideSceneName){
  var usedGraph = this.usedGraphIDs[graphID].clone();

  var aStar = new Kompute.AStar(usedGraph);

  this.usedAStarIDs[id] = aStar;

  var astars = this.astarsBySceneName[overrideSceneName || sceneHandler.getActiveSceneName()] || {};
  astars[id] = aStar;
  this.astarsBySceneName[overrideSceneName || sceneHandler.getActiveSceneName()] = astars;

  this.graphIDsByAStars[id] = graphID;
}

SteeringHandler.prototype.removeAStar = function(id){
  delete this.usedAStarIDs[id];
  delete this.astarsBySceneName[sceneHandler.getActiveSceneName()][id];
  delete this.graphIDsByAStars[id];
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

  if (this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
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

SteeringHandler.prototype.insertJumpDescriptorToGraph = function(jumpDescriptorID, graphID){
  var jumpDescriptor = this.usedJumpDescriptorIDs[jumpDescriptorID];
  var graph = this.usedGraphIDs[graphID];

  var result = graph.addJumpDescriptor(jumpDescriptor);

  if (!result){
    return false;
  }

  if (!this.graphsByJumpDescriptors[jumpDescriptorID]){
    this.graphsByJumpDescriptors[jumpDescriptorID] = {};
  }

  this.graphsByJumpDescriptors[jumpDescriptorID][graphID] = graph;
  return true;
}

SteeringHandler.prototype.registerGraph = function(id, graph){
  this.usedGraphIDs[id] = graph;

  var graphs = this.graphsBySceneName[sceneHandler.getActiveSceneName()];
  if (!graphs){
    graphs = {};
    this.graphsBySceneName[sceneHandler.getActiveSceneName()] = graphs;
  }

  graphs[id] = graph;
}

SteeringHandler.prototype.constructGraph = function(id, grids, offsetX, offsetY, offsetZ){
  if (this.usedGraphIDs[id]){
    return false;
  }

  var graph = new Kompute.Graph();

  var gs;

  for (var gridID in grids){
    var grid = grids[gridID];
    gs = gridSystems[grid.parentName];
    graph.addVertex(new Kompute.Vector3D(grid.centerX + offsetX, grid.centerY + offsetY, grid.centerZ + offsetZ));
  }

  for (var gridID in grids){
    var grid = grids[gridID];
    var neighbours = gs.getNeighbourGridsOfGrid(grid);
    for (var i = 0; i < neighbours.length; i ++){
      var neighbourGrid = neighbours[i];
      if (grids[neighbourGrid.name]){
        var edgeVertex1 = new Kompute.Vector3D(grid.centerX + offsetX, grid.centerY + offsetY, grid.centerZ + offsetZ);
        var edgeVertex2 = new Kompute.Vector3D(neighbourGrid.centerX + offsetX, neighbourGrid.centerY + offsetY, neighbourGrid.centerZ + offsetZ);
        graph.addEdge(edgeVertex1, edgeVertex2);
      }
    }
  }

  this.usedGraphIDs[id] = graph;
  var graphs = this.graphsBySceneName[sceneHandler.getActiveSceneName()];
  if (!graphs){
    graphs = {};
    this.graphsBySceneName[sceneHandler.getActiveSceneName()] = graphs;
  }

  graphs[id] = graph;

  this.world.insertGraph(graph);

  if (this.debugHelper){
    this.debugHelper.visualiseGraph(graph);
  }

  return true;
}

SteeringHandler.prototype.removeGraph = function(id){
  if (!this.usedGraphIDs[id]){
    return;
  }

  this.world.removeGraph(this.usedGraphIDs[id]);

  delete this.usedGraphIDs[id];
  delete this.graphsBySceneName[sceneHandler.getActiveSceneName()][id];

  if (this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
  }

  for (var jdID in this.graphsByJumpDescriptors){
    delete this.graphsByJumpDescriptors[jdID][id];
  }
}

SteeringHandler.prototype.mergeGraphs = function(id, graphIDs){
  var mergedGraph = new Kompute.Graph();

  for (var i = 0; i < graphIDs.length; i ++){
    var graph = this.usedGraphIDs[graphIDs[i]];
    graph.forEachVertex(function(x, y, z){
      mergedGraph.addVertex(new Kompute.Vector3D(x, y, z));
    });

    graph.forEachEdge(function(edge){
      mergedGraph.addEdge(edge.fromVertex, edge.toVertex);
    });
  }

  this.registerGraph(id, mergedGraph);

  for (var i = 0; i < graphIDs.length; i ++){
    for (var jdID in this.graphsByJumpDescriptors){
      var graphs = this.graphsByJumpDescriptors[jdID];
      for (var gid in graphs){
        if (gid == graphIDs[i]){
          this.insertJumpDescriptorToGraph(jdID, id);
        }
      }
    }

    this.removeGraph(graphIDs[i]);
  }

  if (this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
  }
}

SteeringHandler.prototype.createSteerableFromObject = function(object){
  var totalBox = new THREE.Box3();
  if (!object.boundingBoxes){
    object.generateBoundingBoxes();
  }
  for (var i = 0; i < object.boundingBoxes.length; i ++){
    var bb = object.boundingBoxes[i];
    totalBox.expandByPoint(bb.min);
    totalBox.expandByPoint(bb.max);
  }

  var steerableID = object.name;
  var centerPos = totalBox.getCenter(new THREE.Vector3());
  var size = totalBox.getSize(new THREE.Vector3());

  var steerableCenterPosition = new Kompute.Vector3D(centerPos.x, centerPos.y, centerPos.z);
  var steerableSize = new Kompute.Vector3D(size.x, size.y, size.z);

  var steerable = new Kompute.Steerable(steerableID, steerableCenterPosition, steerableSize);
  this.world.insertEntity(steerable);

  steerable.setJumpBehavior(new Kompute.JumpBehavior());

  steerable.maxSpeed = object.steerableInfo.maxSpeed;
  steerable.maxAcceleration = object.steerableInfo.maxAcceleration;
  steerable.jumpSpeed = object.steerableInfo.jumpSpeed;
  steerable.lookSpeed = object.steerableInfo.lookSpeed;

  if (this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
  }

  var steerables = this.steerablesBySceneName[object.registeredSceneName] || {};
  steerables[steerableID] = steerable;

  this.steerablesBySceneName[object.registeredSceneName] = steerables;

  this.usedEntityIDs[steerableID] = steerable;

  return steerable;
}

SteeringHandler.prototype.removeSteerable = function(object){
  this.world.removeEntity(this.usedEntityIDs[object.name]);

  delete this.steerablesBySceneName[object.registeredSceneName][object.name];
  delete this.usedEntityIDs[object.name];

  if (this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
  }
}

SteeringHandler.prototype.update = function(){
  this.updateBuffer.forEach(this.issueUpdate);
  this.updateBuffer.clear();

  if (mode == 1){
    this.activeSteerablesMap.forEach(this.issueSteerableUpdate);
  }
}

SteeringHandler.prototype.addBehavior = function(id, behavior){
  this.usedBehaviorIDs[id] = behavior;
  var behaviors = this.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
  behaviors[id] = behavior;
  this.behaviorsBySceneName[sceneHandler.getActiveSceneName()] = behaviors;
}

SteeringHandler.prototype.removeBehavior = function(id){
  delete this.usedBehaviorIDs[id];
  delete this.behaviorsBySceneName[sceneHandler.getActiveSceneName()][id];
}

SteeringHandler.prototype.setTargetPosition = function(object, position){
  var komputeVector = this.vectorPool.get().set(position.x, position.y, position.z);
  object.steerable.setTargetPosition(komputeVector);
}

SteeringHandler.prototype.unsetTargetPosition = function(object){
  object.steerable.unsetTargetPosition();
}

SteeringHandler.prototype.setLookTarget = function(object, targetVector){
  var komputeVector = this.vectorPool.get().set(targetVector.x, targetVector.y, targetVector.z);
  object.steerable.setLookTarget(komputeVector);
}

SteeringHandler.prototype.calculateShortestPath = function(aStar, fromVector, toVector){
  var graph = aStar.graph;

  var komputeFromVector = this.vectorPool.get().set(fromVector.x, fromVector.y, fromVector.z);
  var komputeToVector = this.vectorPool.get().set(toVector.x, toVector.y, toVector.z);

  var closestFrom = graph.findClosestVertexToPoint(komputeFromVector);
  var closestTo = graph.findClosestVertexToPoint(komputeToVector);

  if (closestFrom){
    komputeFromVector = this.vectorPool.get().set(closestFrom.x, closestFrom.y, closestFrom.z);
  }

  if (closestTo){
    komputeToVector = this.vectorPool.get().set(closestTo.x, closestTo.y, closestTo.z);
  }

  aStar.findShortestPath(komputeFromVector, komputeToVector);
}

SteeringHandler.prototype.makeSteerableHideFromSteerable = function(hidingObject, targetObject){
  hidingObject.steerable.setHideTargetEntity(targetObject.steerable);
}

SteeringHandler.prototype.makeSteerableStopHiding = function(hidingObject){
  hidingObject.steerable.unsetHideTargetEntity();
}

SteeringHandler.prototype.setTargetSteerable = function(sourceObject, targetObject){
  sourceObject.steerable.setTargetEntity(targetObject.steerable);
}

SteeringHandler.prototype.unsetTargetSteerable = function(object){
  object.steerable.unsetTargetEntity();
}

SteeringHandler.prototype.jump = function(object, jumpDescriptor, toTakeoffBehaviorName, completeCallback){
  var toRunupBehavior = object.constructedSteeringBehaviors[toTakeoffBehaviorName];
  var steerable = object.steerable;

  this.setBehavior(object, toTakeoffBehaviorName);

  steerable.jumpCompletionCallback = completeCallback;

  return steerable.jump(toRunupBehavior, jumpDescriptor);
}

SteeringHandler.prototype.setPathFinishListener = function(object, behaviorName, callbackFunction){

  var behavior = object.constructedSteeringBehaviors[behaviorName];

  if (object.pathFinishListenerIDsBySteerableName[behaviorName]){
    behavior.path.removeFinishCallback(object.pathFinishListenerIDsBySteerableName[behaviorName]);
  }

  var callbackID = behavior.path.addFinishCallback(callbackFunction);
  object.pathFinishListenerIDsBySteerableName[behaviorName] = callbackID;
}

SteeringHandler.prototype.removePathFinishListener = function(object, behaviorName){
  if (object.pathFinishListenerIDsBySteerableName[behaviorName]){
    var behavior = object.constructedSteeringBehaviors[behaviorName];
    behavior.path.removeFinishCallback(object.pathFinishListenerIDsBySteerableName[behaviorName]);
    delete object.pathFinishListenerIDsBySteerableName[behaviorName];
  }
}

SteeringHandler.prototype.removeEdgeFromGraph = function(graphID, vertex1, vertex2){
  var graph = this.usedGraphIDs[graphID];

  var res1 =  graph.removeEdge(vertex1, vertex2);
  var res2 = graph.removeEdge(vertex2, vertex1);

  var count = 0;

  if (res1){
    for (var astID in this.graphIDsByAStars){
      var gid = this.graphIDsByAStars[astID];
      if (gid == graphID){
        this.usedAStarIDs[astID].graph.removeEdge(vertex1, vertex2)
      }
    }

    count ++;
  }

  if (res2){
    for (var astID in this.graphIDsByAStars){
      var gid = this.graphIDsByAStars[astID];
      if (gid == graphID){
        this.usedAStarIDs[astID].graph.removeEdge(vertex2, vertex1)
      }
    }

    count ++;
  }

  if (count && this.debugHelper){
    this.switchDebugMode();
    this.switchDebugMode();
  }

  return count;
}

SteeringHandler.prototype.setLookDirection = function(object, lookDirection){
  var komputeVector = this.vectorPool.get().set(lookDirection.x, lookDirection.y, lookDirection.z);
  object.steerable.setLookDirection(komputeVector);
}

SteeringHandler.prototype.getLookDirection = function(object, targetVector){
  var lookDirection = object.steerable.lookDirection;
  targetVector.x = lookDirection.x;
  targetVector.y = lookDirection.y;
  targetVector.z = lookDirection.z;

  return targetVector;
}

SteeringHandler.prototype.resetRandomPathBehavior = function(object, behaviorName){
  var constructedBehavior = object.constructedSteeringBehaviors[behaviorName];

  if (constructedBehavior instanceof Kompute.RandomPathBehavior){
    constructedBehavior.isPathConstructed = false;
  }else if (constructedBehavior instanceof Kompute.PrioritySteeringBehavior){
    for (var i = 0; i < constructedBehavior.list.length; i ++){
      var behavior = constructedBehavior[i];
      if (behavior instanceof Kompute.RandomPathBehavior){
        behavior.isPathConstructed = false;
      }
    }
  }else if (constructedBehavior instanceof Kompute.BlendedSteeringBehavior){
    for (var i = 0; i < constructedBehavior.definitions.length; i ++){
      var behavior = constructedBehavior.definitions[i].behavior;
      if (behavior instanceof Kompute.RandomPathBehavior){
        behavior.isPathConstructed = false;
      }
    }
  }
}
