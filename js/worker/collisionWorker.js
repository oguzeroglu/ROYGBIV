importScripts("/js/third_party/three.js");
importScripts("/js/handler/WorldBinHandler.js");
importScripts("/js/engine_objects/WorkerMessage.js");
importScripts("/js/engine_objects/Particle.js");
importScripts("/js/engine_objects/WorkerConstants.js");

var MESSAGE_TYPE_BASIC = 0;
var MESSAGE_TYPE_BUFFER = 1;
var transferableBufferArray = new Array(0);
var constants = new WorkerConstants();
var REUSABLE_WORKER_MESSAGE = new WorkerMessage();
var particleCollisionInfoSendCount = 0;
var particleCollisionBuffer = new Object();
var PARTICLE_POSITION_HISTORY_SIZE;
var INTERSECTION_NORMAL = new THREE.Vector3();
var REUSABLE_QUATERNION2 = new THREE.Quaternion();
var REUSABLE_LINE = new THREE.Line3();
var MOTION_MODE_NORMAL = 0;
var MOTION_MODE_CIRCULAR = 1;
var worldBinHandler = new WorldBinHandler(true);
var LIMIT_BOUNDING_BOX = new THREE.Box3();
var BIN_SIZE;
var REUSABLE_MATRIX = new THREE.Matrix4();
var REUSABLE_VECTOR = new THREE.Vector3();
var REUSABLE_VECTOR2 = new THREE.Vector3();

// key: index, value: particle count
var particleSystemIndicesWithCollisionParticles = new Object();

// key: uuid, value: particle
var particles = new Object();

// key: particleSystemIndex, value: particle system acceleration
var particleSystemAccelerations = new Object();

// key: particleSystemIndex, value: particle system velocity
var particleSystemVelocities = new Object();

// key: particleSystemIndex, value: particle system initial position
var particleSystemInitialPositions = new Object();

// key: particleSystemIndex, value: particle system tick value
var particleSystemIndexTicks = new Object();

// key: particleSystemIndex, value: particleSystemName
var particleSystemIndexNames = new Object();

// key: particleSystemIndex, value: particle system transformation matrix
var particleSystemMatrices = new Object();

// These are used to store binInfo
var addedObjects = new Object();
var objectGroups = new Object();

// key: objName -> value: index
var addedObjectIndices = new Object();
var objectGroupIndices = new Object();

// key: index -> value objName
var indicesObjectNames = new Object();

// key: objName -> value: true
var dynamicObjects = new Object();
var dynamicObjectGroups = new Object();

// key: objName -> value: Array of vertices
var objectNonTransformedVertices = new Object();
var objectTransformedVertices = new Object();

// key: objName -> value: Array of faces
var objectFaces = new Object();

// key: objName -> value: Array of triangles
var objectTriangles = new Object();

// key: objName -> value: Array of triangle planes
var objectTrianglePlanes = new Object();

// key: objName -> value: Bounding box
var boundingBoxes = new Object();

// key: childName -> value: parentName
var childParentNames = new Object();

// key: parentIndex -> value: Object of particles
var parentIndexChilds = new Object();

self.onmessage = function(msg){
  var content = msg.data.content;
  if (msg.data.topic == "objectIndex"){
    var splitted = content.split(",");
    var index = parseInt(splitted[splitted.length - 1]);
    var objName = splitted[0];
    if (splitted.length == 2){
      addedObjectIndices[objName] = index;
      indicesObjectNames[index] = objName;
    }else if (splitted.length == 3){
      var childName = splitted[1];
      if (!objectGroupIndices[objName]){
        objectGroupIndices[objName] = new Object();
      }
      childParentNames[childName] = objName;
      objectGroupIndices[objName][childName] = index;
      indicesObjectNames[index] = childName;
    }
  }else if (msg.data.topic == "dynamicObjectNotification"){
    dynamicObjects[content] = true;
  }else if (msg.data.topic == "dynamicObjectGroupNotification"){
    dynamicObjectGroups[content] = true;
  }else if (msg.data.topic == "bbDescriptions"){
    var ary = parseBBDescriptions(content);
    post(REUSABLE_WORKER_MESSAGE.set(constants.binLoop, ary));
  }else if (msg.data.topic == "worldLimits"){
    var splitted = content.split(",");
    var minX = parseFloat(splitted[0]), minY = parseFloat(splitted[1]), minZ = parseFloat(splitted[2]);
    var maxX = parseFloat(splitted[3]), maxY = parseFloat(splitted[4]), maxZ = parseFloat(splitted[5]);
    LIMIT_BOUNDING_BOX.set(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));
  }else if (msg.data.topic == "binSize"){
    BIN_SIZE = parseFloat(content);
  }else if (msg.data.topic == "binLoop"){
    var ary = handleBinLoop(content);
    post(REUSABLE_WORKER_MESSAGE.set(constants.binLoop, ary));
  }else if (msg.data.topic == "debug"){
    var binText = JSON.stringify(worldBinHandler.bin);
    post(REUSABLE_WORKER_MESSAGE.set(constants.debug, binText));
  }else if (msg.data.topic == "objectMassChange"){
    var objName = msg.data.id;
    var newMass = msg.data.pointX;
    if (newMass > 0){
      dynamicObjects[objName] = true;
    }else{
      delete dynamicObjects[objName];
    }
  }else if (msg.data.topic == "objectGroupMassChange"){
    var objName = msg.data.id;
    var newMass = msg.data.pointX;
    if (newMass > 0){
      dynamicObjectGroups[objName] = true;
    }else{
      delete dynamicObjectGroups[objName];
    }
  }else if (msg.data.topic == "hideObject"){
    worldBinHandler.deleteObjectFromBin(addedObjects[content].binInfo, content);
  }else if (msg.data.topic == "hideObjectGroup"){
    worldBinHandler.deleteObjectFromBin(objectGroups[content].binInfo, content);
  }else if (msg.data.topic == "showObject"){
    worldBinHandler.insert(boundingBoxes[content], content, childParentNames[content]);
  }else if (msg.data.topic == "showObjectGroup"){
    var indices = objectGroupIndices[content];
    for (var childName in indices){
      worldBinHandler.insert(boundingBoxes[childName], childName, content);
    }
  }else if (msg.data.topic == "updateObject"){
    var ary = content;
    var objIndex = ary[0];
    var e11 = ary[1], e21 = ary[2], e31 = ary[3], e41 = ary[4], e12 = ary[5];
    var e22 = ary[6], e32 = ary[7], e42 = ary[8], e13 = ary[9], e23 = ary[10];
    var e33 = ary[11], e43 = ary[12], e14 = ary[13], e24 = ary[14], e34 = ary[15], e44 = ary[16];
    REUSABLE_MATRIX.set(e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44);
    var objName = indicesObjectNames[objIndex];
    updateObject(objName);
    worldBinHandler.deleteObjectFromBin(addedObjects[objName].binInfo, objName);
    worldBinHandler.insert(boundingBoxes[objName], objName, childParentNames[objName]);
  }else if (msg.data.topic == "updateObjectGroup"){
    var ary = content;
    var firstIteration = true;
    for (var i = 0; i<ary.length; i+=17){
      var objIndex = ary[i];
      var e11 = ary[i+1], e21 = ary[i+2], e31 = ary[i+3], e41 = ary[i+4], e12 = ary[i+5];
      var e22 = ary[i+6], e32 = ary[i+7], e42 = ary[i+8], e13 = ary[i+9], e23 = ary[i+10];
      var e33 = ary[i+11], e43 = ary[i+12], e14 = ary[i+13], e24 = ary[i+14], e34 = ary[i+15], e44 = ary[i+16];
      REUSABLE_MATRIX.set(e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44);
      var objName = indicesObjectNames[objIndex];
      updateObject(objName);
      var parentName = childParentNames[objName];
      if (firstIteration){
        worldBinHandler.deleteObjectFromBin(objectGroups[parentName].binInfo, parentName);
      }
      worldBinHandler.insert(boundingBoxes[objName], objName, parentName);
      firstIteration = false;
    }
  }else if (msg.data.topic == "testQuery"){
    var splitted = content.split(",");
    var queryPosition = REUSABLE_VECTOR.set(
      parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2])
    );
    var results = worldBinHandler.query(queryPosition);
    post(REUSABLE_WORKER_MESSAGE.set(constants.testQuery, JSON.stringify(results)));
  }else if (msg.data.topic == "newPS"){
    var splitted = content.split(",");
    var indexInt = parseInt(splitted[1]);
    particleSystemIndexNames[indexInt] = splitted[0];
    particleSystemMatrices[indexInt] = new THREE.Matrix4();
    particleSystemInitialPositions[indexInt] = new THREE.Vector3(
      parseFloat(splitted[2]), parseFloat(splitted[3]), parseFloat(splitted[4])
    );
    particleSystemVelocities[indexInt] = new THREE.Vector3(
      parseFloat(splitted[5]), parseFloat(splitted[6]), parseFloat(splitted[7])
    );
    particleSystemAccelerations[indexInt] = new THREE.Vector3(
      parseFloat(splitted[8]), parseFloat(splitted[9]), parseFloat(splitted[10])
    );
  }else if (msg.data.topic == "psRemoval"){
    var index = parseInt(content);
    delete particleSystemIndexNames[index];
    delete particleSystemMatrices[index];
    delete particleSystemIndexTicks[index];
    delete particleSystemInitialPositions[index];
    delete particleSystemVelocities[index];
    delete particleSystemAccelerations[index];
    delete particleSystemIndicesWithCollisionParticles[index];
    delete parentIndexChilds[index];
  }else if (!(msg.data.topic)){
    var ary = msg.data;
    for (var index in particleSystemIndicesWithCollisionParticles){
      var i = parseInt(index);
      particleSystemIndexTicks[index] = ary[i];
      var matrix = particleSystemMatrices[index];
      if (!matrix){
        return;
      }
      var e11 = ary[i+1], e21 = ary[i + 2], e31 = ary[i + 3], e41 = ary[i + 4], e12 = ary[i + 5];
      var e22 = ary[i + 6], e32 = ary[i + 7], e42 = ary[i + 8], e13 = ary[i + 9], e23 = ary[i + 10];
      var e33 = ary[i + 11], e43 = ary[i + 12], e14 = ary[i + 13], e24 = ary[i + 14], e34 = ary[i + 15], e44 = ary[i + 16];
      matrix.set(e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44);
    }
    for (var uuid in particles){
      var particle = particles[uuid];
      var tick = particleSystemIndexTicks[particle.parentCollisionWorkerIndex];
      particle.parent.tick = tick;
      if (particle.parent.tick > 0){
        particle.handleCollisions(true);
      }
    }
    post(ary);
    if (particleCollisionInfoSendCount > 0){
      post(REUSABLE_WORKER_MESSAGE.set(
        constants.particleCollided, JSON.stringify(particleCollisionBuffer)
      ));
      particleCollisionInfoSendCount = 0;
      for (var key in particleCollisionBuffer){
        delete particleCollisionBuffer[key];
      }
    }
  }else if (msg.data.topic == "testPSPositionQuery"){
    var matrix = particleSystemMatrices[parseInt(content)];
    console.log(new THREE.Vector3().setFromMatrixPosition(matrix));
  }else if (msg.data.topic == "newParticle"){
    var pseudoParticle = JSON.parse(content);
    var particle = new Particle();
    particle.setFromPseudoObject(pseudoParticle);
    particles[particle.uuid] = particle;
    if (!particleSystemIndicesWithCollisionParticles[particle.parentCollisionWorkerIndex]){
      particleSystemIndicesWithCollisionParticles[particle.parentCollisionWorkerIndex] = 1;
    }else{
      particleSystemIndicesWithCollisionParticles[particle.parentCollisionWorkerIndex] ++;
    }
    if (!parentIndexChilds[particle.parentCollisionWorkerIndex]){
      parentIndexChilds[particle.parentCollisionWorkerIndex] = new Object();
    }
    parentIndexChilds[particle.parentCollisionWorkerIndex][particle.uuid] = true;
  }else if (msg.data.topic == "destroyParticle"){
    var infoOBj = JSON.parse(content);
    for (var uuid in infoOBj){
      var particle = particles[uuid];
      if (!particle){
        return;
      }
      particleSystemIndicesWithCollisionParticles[particle.parentCollisionWorkerIndex] --;
      if (particleSystemIndicesWithCollisionParticles[particle.parentCollisionWorkerIndex] == 0){
        delete particleSystemIndicesWithCollisionParticles[particle.parentCollisionWorkerIndex];
      }
      delete particles[uuid];
    }
    if (parentIndexChilds[particle.parentCollisionWorkerIndex]){
      delete parentIndexChilds[particle.parentCollisionWorkerIndex][particle.uuid];
    }
  }else if (msg.data.topic == "particlePositionHistorySize"){
    PARTICLE_POSITION_HISTORY_SIZE = parseInt(content);
  }else if (msg.data.topic == "startDelayChange"){
    var infoObj = JSON.parse(content);
    for (var uuid in infoObj){
      var particle = particles[uuid];
      if (particle){
        particle.startDelay = infoObj[uuid];
      }
    }
  }else if (msg.data.topic == "psStopped"){
    var psIndex = msg.data.id;
    var newLifetime = msg.data.pointX;
    var stopTick = msg.data.pointY;
    var particlesOfStoppedPS = particleSystemIndicesWithCollisionParticles[psIndex];
    var pobj = parentIndexChilds[psIndex];
    for (var uuid in pobj){
      var particle = particles[uuid];
      particle.parent.stopped = true;
      particle.stopLifetime = newLifetime;
      particle.respawnSet = false;
      particle.stopTick = stopTick;
      particle.lifetime = newLifetime;
      if (particle.startDelay > stopTick){
        particle.startDelay = stopTick;
      }
    }
  }
}

function post(message){
  if (message.type == MESSAGE_TYPE_BASIC){
    postMessage(message);
  }else if (message.type == MESSAGE_TYPE_BUFFER){
    transferableBufferArray[0] = message.content.buffer;
    postMessage(message, transferableBufferArray);
  }else if (message instanceof Float32Array){
    transferableBufferArray[0] = message.buffer;
    postMessage(message, transferableBufferArray);
  }
}

function fireCollisionCallback(objName, particle, isObjectGroup){
  var collisionInfo = new Object();
  collisionInfo.parentName = particle.parent.name;
  collisionInfo.index = particle.index;
  collisionInfo.objName = objName;
  collisionInfo.normalX = INTERSECTION_NORMAL.x;
  collisionInfo.normalY = INTERSECTION_NORMAL.y;
  collisionInfo.normalZ = INTERSECTION_NORMAL.z;
  collisionInfo.pointX = REUSABLE_VECTOR2.x;
  collisionInfo.pointY = REUSABLE_VECTOR2.y;
  collisionInfo.pointZ = REUSABLE_VECTOR2.z;
  collisionInfo.isObjectGroup = isObjectGroup;
  collisionInfo.parentTick = particle.parent.tick;
  particleCollisionBuffer[particle.uuid] = collisionInfo;
  particleCollisionInfoSendCount ++;
  if (particleCollisionInfoSendCount == 500){
    post(REUSABLE_WORKER_MESSAGE.set(constants.particleCollided, JSON.stringify(particleCollisionBuffer)));
    particleCollisionInfoSendCount = 0;
    particleCollisionBuffer = new Object();
  }
}

function intersectsLine(objName, particle, childName){
  var trianglePlanes;
  var isObjectGroup = false;
  if (!childName){
    trianglePlanes = objectTrianglePlanes[objName];
  }else{
    trianglePlanes = objectTrianglePlanes[childName];
    isObjectGroup = true;
  }
  for (var i = 0; i<trianglePlanes.length; i+=2){
    var plane = trianglePlanes[i];
    if (plane.intersectLine(REUSABLE_LINE, REUSABLE_VECTOR2)){
      var triangles;
      if (!childName){
        triangles = objectTriangles[objName];
      }else{
        triangles = objectTriangles[childName];
      }
      var triangle1 = triangles[i];
      var triangle2 = triangles[i+1];
      if (triangle1.containsPoint(REUSABLE_VECTOR2)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        fireCollisionCallback(objName, particle, isObjectGroup);
        return true;
      }else if (triangle2.containsPoint(REUSABLE_VECTOR2)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        fireCollisionCallback(objName, particle, isObjectGroup);
        return true;
      }
    }
  }
  return false;
}

function updateObject(objName){
  var bb = boundingBoxes[objName];
  bb.makeEmpty();
  var vertices = objectNonTransformedVertices[objName];
  for (var i = 0; i<vertices.length; i++){
    var vertex = vertices[i];
    REUSABLE_VECTOR.set(vertex.x, vertex.y, vertex.z);
    REUSABLE_VECTOR.applyMatrix4(REUSABLE_MATRIX);
    bb.expandByPoint(REUSABLE_VECTOR);
    objectTransformedVertices[objName][i].set(REUSABLE_VECTOR.x, REUSABLE_VECTOR.y, REUSABLE_VECTOR.z);
  }
  var pseudoFaces = objectFaces[objName];
  var transformedVertices = objectTransformedVertices[objName];
  for (var i = 0; i<pseudoFaces.length; i++){
    var face = pseudoFaces[i];
    var a = face.a, b = face.b, c = face.c;
    var triangle = objectTriangles[objName][i];
    triangle.set(transformedVertices[a], transformedVertices[b], transformedVertices[c]);
    var plane = objectTrianglePlanes[objName][i];
    triangle.getPlane(plane);
  }
}

function handleBinLoop(content){
  var ary = content;
  for (var objName in dynamicObjects){
    var i = addedObjectIndices[objName];
    var e11 = ary[i + 4], e21 = ary[i + 5], e31 = ary[i + 6], e41 = ary[i + 7], e12 = ary[i + 8];
    var e22 = ary[i + 9], e32 = ary[i + 10], e42 = ary[i + 11], e13 = ary[i + 12], e23 = ary[i + 13];
    var e33 = ary[i + 14], e43 = ary[i + 15], e14 = ary[i + 16], e24 = ary[i + 17], e34 = ary[i + 18], e44 = ary[i + 19];
    REUSABLE_MATRIX.set(e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44);
    updateObject(objName);
    worldBinHandler.deleteObjectFromBin(addedObjects[objName].binInfo, objName);
    worldBinHandler.insert(boundingBoxes[objName], objName, childParentNames[objName]);
  }
  for (var objName in dynamicObjectGroups){
    worldBinHandler.deleteObjectFromBin(objectGroups[objName].binInfo, objName);
    var indices = objectGroupIndices[objName];
    for (var childName in indices){
      var i = indices[childName];
      var e11 = ary[i + 4], e21 = ary[i + 5], e31 = ary[i + 6], e41 = ary[i + 7], e12 = ary[i + 8];
      var e22 = ary[i + 9], e32 = ary[i + 10], e42 = ary[i + 11], e13 = ary[i + 12], e23 = ary[i + 13];
      var e33 = ary[i + 14], e43 = ary[i + 15], e14 = ary[i + 16], e24 = ary[i + 17], e34 = ary[i + 18], e44 = ary[i + 19];
      REUSABLE_MATRIX.set(e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44);
      updateObject(childName);
      worldBinHandler.insert(boundingBoxes[childName], childName, objName);
    }
  }
  return ary;
}

function parseBBDescriptions(content){
  var ary = content;
  for (var i = 0; i<ary.length; i+= 20){
    var type = ary[i];
    var size1 = ary[i+1];
    var size2 = ary[i+2];
    var size3 = ary[i+3];
    var e11 = ary[i + 4], e21 = ary[i + 5], e31 = ary[i + 6], e41 = ary[i + 7], e12 = ary[i + 8];
    var e22 = ary[i + 9], e32 = ary[i + 10], e42 = ary[i + 11], e13 = ary[i + 12], e23 = ary[i + 13];
    var e33 = ary[i + 14], e43 = ary[i + 15], e14 = ary[i + 16], e24 = ary[i + 17], e34 = ary[i + 18], e44 = ary[i + 19];
    REUSABLE_MATRIX.set(e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44);
    var pseudoGeom;
    if (type == 0){
      pseudoGeom = new THREE.PlaneGeometry(size1, size2, 1, 1);
    }else if (type == 1){
      pseudoGeom = new THREE.PlaneGeometry(size1, size2, 1, 1);
    }else if (type == 2){
      pseudoGeom = new THREE.BoxGeometry(size1, size2, size3, 1, 1, 1);
    }
    var objName = indicesObjectNames[i];
    objectFaces[objName] = pseudoGeom.faces;
    var bb = new THREE.Box3();
    bb.roygbivObjectName = objName;
    if (childParentNames[objName]){
      bb.roygbivParentObjectName = childParentNames[objName];
      if (!objectGroups[childParentNames[objName]]){
        objectGroups[childParentNames[objName]] = new Object();
      }
    }else{
      if (!addedObjects[objName]){
        addedObjects[objName] = new Object();
      }
    }
    objectNonTransformedVertices[objName] = pseudoGeom.vertices;
    objectTransformedVertices[objName] = [];
    for (var x = 0; x<pseudoGeom.vertices.length; x++){
      var vertex = pseudoGeom.vertices[x].clone();
      vertex.applyMatrix4(REUSABLE_MATRIX);
      objectTransformedVertices[objName].push(vertex);
      bb.expandByPoint(vertex);
      boundingBoxes[objName] = bb;
    }
    worldBinHandler.insert(bb, objName, childParentNames[objName]);
    var triangles = [];
    var trianglePlanes = [];
    for (var x = 0; x<pseudoGeom.faces.length; x++){
      var face = pseudoGeom.faces[x];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      var triangle = new THREE.Triangle(
        objectTransformedVertices[objName][a],
        objectTransformedVertices[objName][b],
        objectTransformedVertices[objName][c]
      );
      triangles.push(triangle);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      trianglePlanes.push(plane);
    }
    objectTriangles[objName] = triangles;
    objectTrianglePlanes[objName] = trianglePlanes;
  }
  return ary;
}
