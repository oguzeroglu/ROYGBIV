importScripts("/js/third_party/cannon.min.js");
importScripts("/js/engine_objects/WorkerMessage.js");
importScripts("/js/engine_objects/WorkerConstants.js");

var collisionNotificationArrayIndex = 0;
var collisionNotificationArray;
var hasCollisionNotificationArrayOwnership = true;

var lastSendTime = undefined;
var MESSAGE_TYPE_BASIC = 0;
var MESSAGE_TYPE_BUFFER = 1;
var transferableBufferArray = new Array(1);
var constants = new WorkerConstants();
var REUSABLE_WORKER_MESSAGE = new WorkerMessage();
var physicsWorld;
var physicsSolver;
var physicsStepAmount = (1/60);
var surfacePhysicalThickness = 1;
var dynamicPhysicsBodies = [];
var dynamicObjectGroupPhysicsBodies = [];
var dynamicPhysicsBodiesIndices = [];
var dynamicObjectGroupPhysicsBodiesIndices = [];
var physicsBodiesIDMap = new Object(); // key: ID, value: physics body
var nameIDMap = new Object();          // key: ID, value: name
var idNameMap = new Object();          // key: name, value: id
var idIndexMap = new Object();         // key: ID, value: index
var physicsBodiesWithCollisionRequests = new Object(); // key: name, value: true
var initialized = false;

var REUSABLE_VECTOR_1 = new CANNON.Vec3();
var REUSABLE_VECTOR_2 = new CANNON.Vec3();

function post(message){
  if (message.type == MESSAGE_TYPE_BASIC){
    postMessage(message);
  }else if (message.type == MESSAGE_TYPE_BUFFER){
    transferableBufferArray[0] = message.content.buffer;
    postMessage(message, transferableBufferArray);
  }
}

function sendUpdates(){
  for (var i = 0; i<dynamicPhysicsBodies.length; i++){
    var physicsBody = dynamicPhysicsBodies[i];
    var index = dynamicPhysicsBodiesIndices[i];
    self.physicsInfoBuffer[index + 1] = physicsBody.position.x;
    self.physicsInfoBuffer[index + 2] = physicsBody.position.y;
    self.physicsInfoBuffer[index + 3] = physicsBody.position.z;
    self.physicsInfoBuffer[index + 4] = physicsBody.quaternion.x;
    self.physicsInfoBuffer[index + 5] = physicsBody.quaternion.y;
    self.physicsInfoBuffer[index + 6] = physicsBody.quaternion.z;
    self.physicsInfoBuffer[index + 7] = physicsBody.quaternion.w;
  }
  for (var i = 0; i<dynamicObjectGroupPhysicsBodies.length; i++){
    var objectGroupPhysicsBody = dynamicObjectGroupPhysicsBodies[i];
    var index = dynamicObjectGroupPhysicsBodiesIndices[i];
    self.physicsInfoBuffer[index + 2] = objectGroupPhysicsBody.position.x;
    self.physicsInfoBuffer[index + 3] = objectGroupPhysicsBody.position.y;
    self.physicsInfoBuffer[index + 4] = objectGroupPhysicsBody.position.z;
    self.physicsInfoBuffer[index + 5] = objectGroupPhysicsBody.quaternion.x;
    self.physicsInfoBuffer[index + 6] = objectGroupPhysicsBody.quaternion.y;
    self.physicsInfoBuffer[index + 7] = objectGroupPhysicsBody.quaternion.z;
    self.physicsInfoBuffer[index + 8] = objectGroupPhysicsBody.quaternion.w;
  }
  if (dynamicPhysicsBodies.length > 0 || dynamicObjectGroupPhysicsBodies.length > 0){
    post(REUSABLE_WORKER_MESSAGE.set(constants.update, self.physicsInfoBuffer));
    lastSendTime = Date.now();
  }
  if (collisionNotificationArray[0] > 0){
    post(REUSABLE_WORKER_MESSAGE.set(constants.physicsCollisionHappened, collisionNotificationArray));
    hasCollisionNotificationArrayOwnership = false;
  }
}

function iterate(){
  physicsWorld.step(physicsStepAmount);
  var waitAmount = (1000 / 70);
  if (!(lastSendTime === undefined)){
    waitAmount = (physicsStepAmount * 1000) - (Date.now() - lastSendTime);
    if (waitAmount < 0){
      waitAmount = 0;
    }
  }
  setTimeout(sendUpdates, waitAmount);
}

function parseMessage(msg){
  // msg: WorkerMessage
  if (msg.topic == "surfacePhysicalThickness"){
    surfacePhysicalThickness = msg.content;
  }else if (msg.topic == "physicsStepAmount"){
    physicsStepAmount = msg.content;
  }else if (msg.topic == "quatNormalizeSkip"){
    self.quatNormalizeSkip = msg.content;
  }else if (msg.topic == "quatNormalizeFast"){
    self.quatNormalizeFast = msg.content;
  }else if (msg.topic == "contactEquationStiffness"){
    self.contactEquationStiffness = msg.content;
  }else if (msg.topic == "contactEquationRelaxation"){
    self.contactEquationRelaxation = msg.content;
  }else if (msg.topic == "friction"){
    self.friction = msg.content;
  }else if (msg.topic == "iterations"){
    self.iterations = msg.content;
  }else if (msg.topic == "tolerance"){
    self.tolerance = msg.content;
  }else if (msg.topic == "gravityY"){
    self.gravityY = msg.content;
    initializePhysicsWorld();
    console.log("[*] Physics initialized.");
  }else if (msg.topic == "hideObject"){
    var physicsBody = physicsBodiesIDMap[msg.content];
    physicsWorld.removeBody(physicsBody);
  }else if (msg.topic == "showObject"){
    var physicsBody = physicsBodiesIDMap[msg.content];
    physicsWorld.addBody(physicsBody);
  }else if (msg.topic == "addedObjectsLength"){
    self.addedObjectsLength = msg.content;
  }else if (msg.topic == "objectNameAndID"){
    var splitted = msg.content.split(",");
    nameIDMap[splitted[1]] = splitted[0];
    idNameMap[splitted[0]] = splitted[1];
  }else if (msg.topic == "applyForce"){
    applyForce(msg);
  }else if (msg.topic == "sync"){
    sync(msg);
  }else if (msg.topic == "massChange"){
    processMassChange(msg);
  }else if (msg.topic == "stopIterating"){
    initializePhysicsWorld();
    dynamicPhysicsBodies = [];
    dynamicObjectGroupPhysicsBodies = [];
    dynamicPhysicsBodiesIndices = [];
    dynamicObjectGroupPhysicsBodiesIndices = [];
    physicsBodiesIDMap = new Object();
    nameIDMap = new Object();
    idIndexMap = new Object();
    initialized = false;
    console.log("[*] Physics worker stopped.");
  }else if (msg.topic == "collisionRequest"){
    physicsBodiesWithCollisionRequests[msg.content] = true;
  }else if (msg.topic == "collisionRemoval"){
    delete physicsBodiesWithCollisionRequests[msg.content];
  }else if (msg.topic == "maxObjectCollisionListenerCount"){
    var maxObjectCollisionListenerCount = parseInt(msg.content);
    // COLLISION NOTIFICATION ARRAY FORMAT:
    // safetyBit, objID, targetObjID, x, y, z, impact, qX, qY, qZ, qW
    collisionNotificationArray = new Float32Array(maxObjectCollisionListenerCount * 11);
  }else if (msg.topic == "physicsCollisionHappened"){
    collisionNotificationArray = msg.content;
    hasCollisionNotificationArrayOwnership = true;
    collisionNotificationArrayIndex = 0;
  }
}

function initializePhysicsWorld(){
  physicsWorld = new CANNON.World();
  physicsSolver = new CANNON.GSSolver();
  physicsWorld.quatNormalizeSkip = parseFloat(self.quatNormalizeSkip);
  physicsWorld.quatNormalizeFast = self.quatNormalizeFast;
  physicsWorld.defaultContactMaterial.contactEquationStiffness = parseFloat(self.contactEquationStiffness);
  physicsWorld.defaultContactMaterial.contactEquationRelaxation = parseFloat(self.contactEquationRelaxation);
  physicsWorld.defaultContactMaterial.friction = parseInt(self.friction);
  physicsSolver.iterations = parseInt(self.iterations);
  physicsSolver.tolerance = parseFloat(self.tolerance);
  physicsWorld.gravity.set(0, parseFloat(self.gravityY), 0);
  physicsWorld.solver = physicsSolver;
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
}

function setEventListener(physicsBody){
  physicsBody.addEventListener(
    "collide",
    function(collisionEvent){
      if (!physicsBodiesWithCollisionRequests[collisionEvent.body.roygbivName]){
        return;
      }
      if (!hasCollisionNotificationArrayOwnership){
        return;
      }
      var contact = collisionEvent.contact;
      var collisionImpact = contact.getImpactVelocityAlongNormal();
      var srcName = collisionEvent.body.roygbivName;
      var destName = collisionEvent.target.roygbivName;
      var srcID = idNameMap[srcName];
      var destID = idNameMap[destName];
      var pX = (contact.bi.position.x) + (contact.ri.x);
      var pY = (contact.bi.position.y) + (contact.ri.y);
      var pZ = (contact.bi.position.z) + (contact.ri.z);
      var qX = collisionEvent.body.quaternion.x;
      var qY = collisionEvent.body.quaternion.y;
      var qZ = collisionEvent.body.quaternion.z;
      var qW = collisionEvent.body.quaternion.w;
      // safetyBit, objID, targetObjID, x, y, z, impact, qX, qY, qZ, qW
      collisionNotificationArray[collisionNotificationArrayIndex++] = 1;
      collisionNotificationArray[collisionNotificationArrayIndex++] = srcID;
      collisionNotificationArray[collisionNotificationArrayIndex++] = destID;
      collisionNotificationArray[collisionNotificationArrayIndex++] = pX;
      collisionNotificationArray[collisionNotificationArrayIndex++] = pY;
      collisionNotificationArray[collisionNotificationArrayIndex++] = pZ;
      collisionNotificationArray[collisionNotificationArrayIndex++] = collisionImpact;
      collisionNotificationArray[collisionNotificationArrayIndex++] = qX;
      collisionNotificationArray[collisionNotificationArrayIndex++] = qY;
      collisionNotificationArray[collisionNotificationArrayIndex++] = qZ;
      collisionNotificationArray[collisionNotificationArrayIndex++] = qW;
    }
  );
}

function createObjects(){
  var ary = self.physicsInfoBuffer;
  var i = 0;
  var createdObjectCount = 0;
  while (i < ary.length){
    var type = ary[i];
    if (type == 0 || createdObjectCount >= self.addedObjectsLength){
      break;
    }
    if (type == 1){
      // surface: 13 indices
      createObject(ary.subarray(i, i+13), i);
      createdObjectCount ++;
      i += 13;
    }else if (type == 2){
      // ramp: 15 indices
      createObject(ary.subarray(i, i+15), i);
      createdObjectCount ++;
      i += 15;
    }else if (type == 3){
      // box: 13 indices
      createObject(ary.subarray(i, i+13), i);
      createdObjectCount ++;
      i += 13;
    }
  }
  while (i < ary.length){
    var index = i;
    var childrenCount = ary[i];
    if (childrenCount == 0){
      break;
    }
    var id = ary[i + 1];
    var mass =  ary[i + 2];
    var positionX = ary[i + 3];
    var positionY = ary[i + 4];
    var positionZ = ary[i + 5];
    var quaternionX = ary[i + 6];
    var quaternionY = ary[i + 7];
    var quaternionZ = ary[i + 8];
    var quaternionW = ary[i + 9];
    var createdChildrenCount = 0;
    var children = [];
    i += 10;
    while (createdChildrenCount < childrenCount){
      var type = ary[i];
      var childObject;
      if (type == 1){
        childObject = createObject(ary.subarray(i, i+13), i, true);
        children.push(childObject);
        createdChildrenCount++;
        i += 13;
      }else if (type == 2){
        childObject = createObject(ary.subarray(i, i+15), i, true);
        children.push(childObject);
        createdChildrenCount++;
        i += 15;
      }else if (type == 3){
        childObject = createObject(ary.subarray(i, i+13), i, true);
        children.push(childObject);
        createdChildrenCount ++;
        i += 13;
      }
    }
    createObjectGroup(
      children, index, positionX, positionY, positionZ,
      quaternionX, quaternionY, quaternionZ, quaternionW, mass, id
    );
  }
}

function createObjectGroup(children, index, px, py, pz, qx, qy, qz, qw, mass, id){
  var referenceVector = new CANNON.Vec3(
    px, py, pz
  );
  var physicsMaterial = new CANNON.Material();
  physicsMaterial.friction = 1;
  var physicsBody = new CANNON.Body({mass: mass, material: physicsMaterial});
  physicsBody.position = referenceVector;
  for (var i = 0; i<children.length; i++){
    var shape = children[i].shapes[0];
    physicsBody.addShape(shape, children[i].position.vsub(referenceVector), children[i].quaternion);
  }
  physicsBody.quaternion.set(qx, qy, qz, qw);
  if (mass > 0){
    dynamicObjectGroupPhysicsBodies.push(physicsBody);
    dynamicObjectGroupPhysicsBodiesIndices.push(index);
    physicsBody.type = CANNON.Body.DYNAMIC;
  }
  idIndexMap[id] = index;
  physicsWorld.add(physicsBody);
  physicsBodiesIDMap[id] = physicsBody;
  var name = nameIDMap[id];
  physicsBody.roygbivName = name;
  setEventListener(physicsBody);
}

function createObject(buffer, index, memberOfAGroup){
  var type;
  if (buffer[0] == 1){
    type = "surface";
  }else if (buffer[0] == 2){
    type = "ramp";
  }else if (buffer[0] == 3){
    type = "box";
  }
  var positionX = parseFloat(buffer[1]);
  var positionY = parseFloat(buffer[2]);
  var positionZ = parseFloat(buffer[3]);
  var quaternionX = parseFloat(buffer[4]);
  var quaternionY = parseFloat(buffer[5]);
  var quaternionZ = parseFloat(buffer[6]);
  var quaternionW = parseFloat(buffer[7]);
  var physicsBody;
  var mass;
  var id;
  if (type == "surface"){
    var physicsShapeParameterX = parseFloat(buffer[8]);
    var physicsShapeParameterY = parseFloat(buffer[9]);
    var physicsShapeParameterZ = parseFloat(buffer[10]);
    mass = parseFloat(buffer[11]);
    id = parseFloat(buffer[12]);
    var surfacePhysicsShape = new CANNON.Box(new CANNON.Vec3(
      physicsShapeParameterX,
      physicsShapeParameterY,
      physicsShapeParameterZ
    ));
    var physicsMaterial = new CANNON.Material();
    physicsMaterial.friction = 1;
    physicsBody = new CANNON.Body({
      mass: mass,
      shape: surfacePhysicsShape,
      material: physicsMaterial
    });
    physicsBody.mass = mass;
  }else if (type == "box"){
    var boxSizeX = parseFloat(buffer[8]);
    var boxSizeY = parseFloat(buffer[9]);
    var boxSizeZ = parseFloat(buffer[10]);
    mass = parseFloat(buffer[11]);
    id = parseFloat(buffer[12]);
    var boxPhysicsShape = new CANNON.Box(new CANNON.Vec3(
      boxSizeX / 2,
      boxSizeY / 2,
      boxSizeZ / 2
    ));
    var physicsMaterial = new CANNON.Material();
    physicsMaterial.friction = 1;
    physicsBody = new CANNON.Body({
      mass: mass,
      shape: boxPhysicsShape,
      material: physicsMaterial
    });
    physicsBody.mass = mass;
  }else if (type == "ramp"){
    var rampWidth = parseFloat(buffer[8]);
    var rampHeight = parseFloat(buffer[9]);
    var fromEulerX = parseFloat(buffer[10]);
    var fromEulerY = parseFloat(buffer[11]);
    var fromEulerZ = parseFloat(buffer[12]);
    mass = parseFloat(buffer[13]);
    id = parseFloat(buffer[14]);
    var rampPhysicsShape = new CANNON.Box(new CANNON.Vec3(
      rampWidth/2,
      surfacePhysicalThickness,
      rampHeight/2
    ));
    var physicsMaterial = new CANNON.Material();
    physicsMaterial.friction = 1;
    physicsBody = new CANNON.Body({
      mass: mass,
      shape: rampPhysicsShape,
      material: physicsMaterial
    });
    physicsBody.mass = mass;
    physicsBody.quaternion.setFromEuler(fromEulerX, fromEulerY, fromEulerZ);
  }
  physicsBody.position.set(positionX, positionY, positionZ);
  if (type != "ramp"){
    physicsBody.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
  }
  if (!memberOfAGroup){
    physicsWorld.add(physicsBody);
    physicsBodiesIDMap[id] = physicsBody;
    idIndexMap[id] = index;
    var name = nameIDMap[id];
    physicsBody.roygbivName = name;
  }else{
    return physicsBody;
  }
  if (mass > 0){
    dynamicPhysicsBodies.push(physicsBody);
    dynamicPhysicsBodiesIndices.push(index);
    physicsBody.type = CANNON.Body.DYNAMIC;
  }
  setEventListener(physicsBody);
}

function applyForce(msg){
  var physicsBody = physicsBodiesIDMap[msg.id];
  REUSABLE_VECTOR_1.set(msg.forceX, msg.forceY, msg.forceZ); // FORCE
  REUSABLE_VECTOR_2.set(msg.pointX, msg.pointY, msg.pointZ); // POINT
  physicsBody.applyImpulse(
    REUSABLE_VECTOR_1, REUSABLE_VECTOR_2
  );
}

function sync(msg){
  var px = msg.pointX;
  var py = msg.pointY;
  var pz = msg.pointZ;
  var qx = msg.qx;
  var qy = msg.qy;
  var qz = msg.qz;
  var qw = msg.qw;
  var object = physicsBodiesIDMap[msg.id];
  object.position.set(px, py, pz);
  object.quaternion.set(qx, qy, qz, qw);
}

function processMassChange(msg){
  var id = msg.id;
  var mass = msg.pointX;
  var type = msg.pointY;
  var physicsBody = physicsBodiesIDMap[id];
  if (mass > 0){
    physicsBody.type = CANNON.Body.DYNAMIC;
  }else{
    physicsBody.type = CANNON.Body.STATIC;
  }
  physicsBody.mass = mass;
  physicsBody.updateMassProperties();
  physicsBody.aabbNeedsUpdate = true;
  if (mass > 0){
    if (type == 0){
      dynamicPhysicsBodies.push(physicsBody);
      dynamicPhysicsBodiesIndices.push(idIndexMap[id]);
      REUSABLE_WORKER_MESSAGE.set(constants.massChangeIndex);
      REUSABLE_WORKER_MESSAGE.id = idIndexMap[id];
      REUSABLE_WORKER_MESSAGE.pointX = type;
      post(REUSABLE_WORKER_MESSAGE);
    }else if (type == 1){
      dynamicObjectGroupPhysicsBodies.push(physicsBody);
      dynamicObjectGroupPhysicsBodiesIndices.push(idIndexMap[id]);
      REUSABLE_WORKER_MESSAGE.set(constants.massChangeIndex);
      REUSABLE_WORKER_MESSAGE.id = idIndexMap[id];
      REUSABLE_WORKER_MESSAGE.pointX = type;
      post(REUSABLE_WORKER_MESSAGE);
    }
    if (dynamicPhysicsBodies.length + dynamicObjectGroupPhysicsBodies.length == 1){
      iterate();
    }
  }
}

self.onmessage = function(msg){
  if (msg.data.topic == "physicsInfo"){
    var ary = msg.data.content;
    self.physicsInfoBuffer = ary;
    if (!initialized){
      createObjects();
      initialized = true;
    }
    iterate();
  }else{
    parseMessage(msg.data);
  }
}
