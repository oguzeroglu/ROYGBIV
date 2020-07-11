var SteeringHandler = function(){
  this.reset();

  this.vectorPool = new Kompute.VectorPool(10);

  this.issueUpdate = this.issueUpdate.bind(this);

  this.steeringModes = {
    ALIGN_POSITION: 'ALIGN_POSITION',
    ALIGN_VELOCITY: 'ALIGN_VELOCITY'
  };
}

SteeringHandler.prototype.import = function(exportObj){
  var obstacleInfo = exportObj.obstacleInfo;
  var jumpDescriptorInfo = exportObj.jumpDescriptorInfo;
  var pathInfo = exportObj.pathInfo;
  var pathsByJumpDescriptors = exportObj.pathsByJumpDescriptors;
  var graphsByJumpDescriptors = exportObj.graphsByJumpDescriptors;
  var graphInfo = exportObj.graphInfo;

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
}

SteeringHandler.prototype.export = function(){
  var exportObject = {
    obstacleInfo: {},
    jumpDescriptorInfo: {},
    pathInfo: {},
    pathsByJumpDescriptors: {},
    graphsByJumpDescriptors: {},
    graphInfo: {}
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

  return exportObject;
}

SteeringHandler.prototype.onBeforeSceneChange = function(){
  var graphs = this.graphsBySceneName[sceneHandler.getActiveSceneName()];
  if (graphs){
    for (var id in graphs){
      this.world.removeGraph(graphs[id]);
    }
  }
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

  for (var id in this.graphsBySceneName[sceneHandler.getActiveSceneName()]){
    this.debugHelper.visualiseGraph(this.graphsBySceneName[sceneHandler.getActiveSceneName()][id]);
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

  this.usedGraphIDs = {};
  this.graphsBySceneName = {};

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

  var graphs = this.graphsBySceneName[sceneHandler.getActiveSceneName()];
  if (graphs){
    for (var id in graphs){
      this.world.insertGraph(graphs[id]);
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

  if (entity instanceof Kompute.Steerable){
    delete this.steerablesBySceneName[sceneHandler.getActiveSceneName()][id];
  }else{
    delete this.obstaclesBySceneName[sceneHandler.getActiveSceneName()][id];
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

  var entities = this.obstaclesBySceneName[sceneName] || this.steerablesBySceneName[sceneName];

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
}
