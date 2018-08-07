importScripts("/js/third_party/three.js");
importScripts("/js/engine_objects/WorkerMessage.js");
importScripts("/js/handler/WorldBinHandler.js");
importScripts("/js/engine_objects/ParticleSystem.js");
importScripts("/js/engine_objects/WorkerConstants.js");

// PS COLLISION ARRAY FORMAT
// safetyBit - psID - objectID - x - y - z - fnX - fnY - fnZ - psTime - isObjectGroup
var psCollisionArrays = new Array(10);
var psCollisionArrayIndices = new Array(10);
var maxPSCollisionArrayInd;

var lastSendTime = undefined, lastBinLoopSendTime = undefined;
var tickArray, binLoopArray;
var emptyAry = [];
var MESSAGE_TYPE_BASIC = 0;
var MESSAGE_TYPE_BUFFER = 1;
var transferableBufferArray = new Array(1);
var constants = new WorkerConstants();
var REUSABLE_WORKER_MESSAGE = new WorkerMessage();
var LIMIT_BOUNDING_BOX = new THREE.Box3();
var BIN_SIZE;
var REUSABLE_MATRIX = new THREE.Matrix4();
var REUSABLE_VECTOR = new THREE.Vector3();
var worldBinHandler = new WorldBinHandler(true);
var REUSABLE_VECTOR2 = new THREE.Vector3();
var PS_SEGMENT_COUNT, SEGMENT_IND_COUNT, MAX_PARTICLE_SYSTEM_COUNT;
var MOTION_MODE_NORMAL = 0;
var MOTION_MODE_CIRCULAR = 1;
var REUSABLE_QUATERNION = new THREE.Quaternion();
var INTERSECTION_NORMAL = new THREE.Vector3();

// key: index -> value objName
var indicesObjectNames = new Object();

// key: objName -> value: Array of faces
var objectFaces = new Object();

// key: childName -> value: parentName
var childParentNames = new Object();

// These are used to store binInfo
var addedObjects = new Object();
var objectGroups = new Object();

// key: objName -> value: Array of vertices
var objectNonTransformedVertices = new Object();
var objectTransformedVertices = new Object();

// key: objName -> value: Bounding box
var boundingBoxes = new Object();

// key: objName -> value: Array of triangles
var objectTriangles = new Object();

// key: objName -> value: Array of triangle planes
var objectTrianglePlanes = new Object();

// key: objName -> value: true
var dynamicObjects = new Object();
var dynamicObjectGroups = new Object();

// key: objName -> value: index
var addedObjectIndices = new Object();
var objectGroupIndices = new Object();

// key: index -> value: ParticleSystem
var particleSystems = new Object();

function post(message){
  if (message.type == MESSAGE_TYPE_BASIC){
    postMessage(message);
  }else if (message.type == MESSAGE_TYPE_BUFFER){
    transferableBufferArray[0] = message.content.buffer;
    postMessage(message, transferableBufferArray);
  }
}

self.onmessage = function(msg){
  var content = msg.data.content;
  var topic = msg.data.topic;
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
  }else if (topic == "worldLimits"){
    var splitted = content.split(",");
    var minX = parseFloat(splitted[0]), minY = parseFloat(splitted[1]), minZ = parseFloat(splitted[2]);
    var maxX = parseFloat(splitted[3]), maxY = parseFloat(splitted[4]), maxZ = parseFloat(splitted[5]);
    LIMIT_BOUNDING_BOX.set(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));
  }else if (topic == "binSize"){
    BIN_SIZE = parseFloat(content);
  }else if (topic == "bbDescriptions"){
    var ary = parseBBDescriptions(content);
    post(REUSABLE_WORKER_MESSAGE.set(constants.psBinLoop, ary));
  }else if (topic == "binLoop"){
    binLoopArray = handleBinLoop(content);
    var hasPSCollisionArrayOwnership = false;
    for (var i = 0; i<psCollisionArrays.length; i++){
      if (psCollisionArrays[i]){
        hasPSCollisionArrayOwnership = true;
        break;
      }
    }
    if (hasPSCollisionArrayOwnership){
      handleCollisions();
      for (var i = 0; i<psCollisionArrays.length; i++){
        if(psCollisionArrayIndices[i] > 1){
          post(REUSABLE_WORKER_MESSAGE.set(constants.psCollisionNotification, psCollisionArrays[i]));
          psCollisionArrays[i] = false;
          psCollisionArrayIndices[i] = 1;
        }
      }
    }
    var waitAmount = (1000 / 70);
    if (!(lastBinLoopSendTime === undefined)){
      waitAmount = ((1/60) * 1000) - (Date.now() - lastBinLoopSendTime);
      if (waitAmount < 0){
        waitAmount = 0;
      }
    }
    setTimeout(sendBinLoopMessage, waitAmount);
  }else if (topic == "debug"){
    var binText = JSON.stringify(worldBinHandler.bin);
    post(REUSABLE_WORKER_MESSAGE.set(constants.debug, binText));
  }else if (topic == "dynamicObjectNotification"){
    dynamicObjects[content] = true;
  }else if (topic == "dynamicObjectGroupNotification"){
    dynamicObjectGroups[content] = true;
  }else if (topic == "hideObject"){
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
  }else if (topic == "updateObject"){
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
  }else if (topic == "updateObjectGroup"){
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
  }else if (topic == "objectMassChange"){
    var objName = msg.data.id;
    var newMass = msg.data.pointX;
    if (newMass > 0){
      dynamicObjects[objName] = true;
    }else{
      delete dynamicObjects[objName];
    }
  }else if (topic == "objectGroupMassChange"){
    var objName = msg.data.id;
    var newMass = msg.data.pointX;
    if (newMass > 0){
      dynamicObjectGroups[objName] = true;
    }else{
      delete dynamicObjectGroups[objName];
    }
  }else if (topic == "psCreation"){
    var psObj = msg.data;
    var ps = new ParticleSystem(
      null, psObj.name, emptyAry, psObj.x, psObj.y, psObj.z, psObj.vx, psObj.vy, psObj.vz,
      psObj.ax, psObj.ay, psObj.az, psObj.motionMode, null, true
    );
    ps.angularVelocity = psObj.angularVelocity;
    ps.angularAcceleration = psObj.angularAcceleration;
    ps.angularMotionRadius = psObj.angularMotionRadius;
    ps.angularQuaternionX = psObj.angularQuaternionX;
    ps.angularQuaternionY = psObj.angularQuaternionY;
    ps.angularQuaternionZ = psObj.angularQuaternionZ;
    ps.angularQuaternionW = psObj.angularQuaternionW;
    ps.initialAngle = psObj.initialAngle;
    ps.lifetime = psObj.lifetime;
    ps.psCollisionWorkerIndex = psObj.psCollisionWorkerIndex;
    ps.psCollisionWorkerSegment = psObj.psCollisionWorkerSegment;
    ps.collisionTimeOffset = psObj.collisionTimeOffset;
    particleSystems[ps.psCollisionWorkerIndex] = ps;
    ps.mesh = new Object();
    ps.mesh.position = new THREE.Vector3();

  }else if (topic == "psDeletion"){
    delete particleSystems[content];
  }else if (topic == "tick"){
      tickArray = content;
      for (var index in particleSystems){
        var ps = particleSystems[index];
        ps.tick = tickArray[ps.psCollisionWorkerIndex];
      }
      var waitAmount = (1000 / 70);
      if (!(lastSendTime === undefined)){
        waitAmount = ((1/60) * 1000) - (Date.now() - lastSendTime);
        if (waitAmount < 0){
          waitAmount = 0;
        }
      }
      setTimeout(sendTickMsg, waitAmount);
  }else if (topic == "maxPSCount"){
    MAX_PARTICLE_SYSTEM_COUNT = parseInt(content);
    for (var i = 0; i<10; i++){
      psCollisionArrays[i] = new Float32Array(((MAX_PARTICLE_SYSTEM_COUNT * 11) / 10) + 1);
      psCollisionArrays[i][0] = i;
      psCollisionArrayIndices[i] = 1;
    }
    maxPSCollisionArrayInd = (MAX_PARTICLE_SYSTEM_COUNT * 11 / 10);
  }else if (topic == "psCollisionNotification"){
    var ind = content[0];
    psCollisionArrays[ind] = content;
    psCollisionArrayIndices[ind] = 1;
  }else{
    if (topic != "particlePositionHistorySize"){
      console.error("psCollisionWorker error: "+topic+" not implemented.");
    }
  }
}

function sendBinLoopMessage(){
  lastBinLoopSendTime = Date.now();
  post(REUSABLE_WORKER_MESSAGE.set(constants.psBinLoop, binLoopArray));
}

function sendTickMsg(){
  lastSendTime = Date.now();
  post(REUSABLE_WORKER_MESSAGE.set(constants.tick, tickArray));
}

function handleCollisions(){
  for (var index in particleSystems){
    var ps = particleSystems[index];
    updatePSPosition(ps);
    ps.handleCollisions(true);
  }
}

function updatePSPosition(ps){
  if (ps.motionMode == MOTION_MODE_NORMAL){
    var dx = (ps.vx * ps.tick) + (0.5 * ps.ax * ps.tick * ps.tick);
    var dy = (ps.vy * ps.tick) + (0.5 * ps.ay * ps.tick * ps.tick);
    var dz = (ps.vz * ps.tick) + (0.5 * ps.az * ps.tick * ps.tick);
    ps.mesh.position.set((ps.x + dx), (ps.y + dy), (ps.z + dz));
  }else if (ps.motionMode == MOTION_MODE_CIRCULAR){
    var angleNow = ps.initialAngle;
    angleNow += (ps.angularVelocity * ps.tick) + (0.5 * ps.angularAcceleration * ps.tick * ps.tick);
    ps.mesh.position.set(
      (ps.angularMotionRadius * Math.cos(angleNow)), ps.y, (ps.angularMotionRadius * Math.sin(angleNow))
    );
    if (!(ps.angularQuaternionX == 0 && ps.angularQuaternionY == 0 && ps.angularQuaternionZ == 0 && ps.angularQuaternionW == 1)){
      ps.mesh.position.applyQuaternion(REUSABLE_QUATERNION.set(
        ps.angularQuaternionX, ps.angularQuaternionY, ps.angularQuaternionZ, ps.angularQuaternionW
      ));
    }
    ps.mesh.position.set(ps.mesh.position.x + ps.x, ps.mesh.position.y + ps.y, ps.mesh.position.z + ps.z);
  }
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
      pseudoGeom = new THREE.PlaneGeometry(Math.abs(size1), Math.abs(size2), 1, 1);
    }else if (type == 1){
      pseudoGeom = new THREE.PlaneGeometry(Math.abs(size1), Math.abs(size2), 1, 1);
    }else if (type == 2){
      pseudoGeom = new THREE.BoxGeometry(Math.abs(size1), Math.abs(size2), Math.abs(size3), 1, 1, 1);
    }else if (type == 3){
      pseudoGeom = new THREE.SphereGeometry(Math.abs(size1), 8, 6);
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

function fireCollisionCallback(objName, ps, isObjectGroup, childName){
  // safetyBit - psID - objectID - x - y - z - fnX - fnY - fnZ - psTime - isObjectGroup
  var curAryIndex = 0;
  for (var i = 0; i< 10; i++){
    var ind = psCollisionArrayIndices[i];
    if (ind < maxPSCollisionArrayInd && psCollisionArrays[i]){
      curAryIndex = i;
      break;
    }
  }
  var psCollisionArray = psCollisionArrays[curAryIndex];
  var psCollisionArrayIndex = psCollisionArrayIndices[curAryIndex];
  psCollisionArray[psCollisionArrayIndex++] = 1;
  psCollisionArray[psCollisionArrayIndex++] = ps.psCollisionWorkerIndex;
  if (isObjectGroup){
    psCollisionArray[psCollisionArrayIndex++] = objectGroupIndices[objName][childName];
  }else{
    psCollisionArray[psCollisionArrayIndex++] = addedObjectIndices[objName];
  }
  psCollisionArray[psCollisionArrayIndex++] = REUSABLE_VECTOR2.x;
  psCollisionArray[psCollisionArrayIndex++] = REUSABLE_VECTOR2.y;
  psCollisionArray[psCollisionArrayIndex++] = REUSABLE_VECTOR2.z;
  psCollisionArray[psCollisionArrayIndex++] = INTERSECTION_NORMAL.x;
  psCollisionArray[psCollisionArrayIndex++] = INTERSECTION_NORMAL.y;
  psCollisionArray[psCollisionArrayIndex++] = INTERSECTION_NORMAL.z;
  psCollisionArray[psCollisionArrayIndex++] = ps.tick;
  var isObjectGroupInd = 0;
  if (isObjectGroup){
    isObjectGroupInd = 1;
  }
  psCollisionArray[psCollisionArrayIndex++] = isObjectGroupInd;
  psCollisionArrayIndices[curAryIndex] = psCollisionArrayIndex;
}

function intersectsLine(objName, ps, childName){
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
    if (plane.intersectLine(ps.positionLine, REUSABLE_VECTOR2)){
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
        fireCollisionCallback(objName, ps, isObjectGroup, childName);
        return true;
      }else if (triangle2.containsPoint(REUSABLE_VECTOR2)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        fireCollisionCallback(objName, ps, isObjectGroup, childName);
        return true;
      }
    }
  }
  return false;
}
