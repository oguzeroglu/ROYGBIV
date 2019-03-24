importScripts("../worker/StateLoaderLightweight.js");
importScripts("../third_party/cannon.min.js");
importScripts("../handler/PhysicsBodyGenerator.js");
importScripts("../engine_objects/AddedObject.js");
importScripts("../engine_objects/ObjectGroup.js");

var IS_WORKER_CONTEXT = true;

// CLASS DEFINITION
var PhysicsWorker = function(){
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.reusableVec1 = new CANNON.Vec3();
  this.reusableVec2 = new CANNON.Vec3();
}
PhysicsWorker.prototype.refresh = function(state){
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  var stateLoader = new StateLoaderLightweight(state);
  stateLoader.resetPhysics();
  stateLoader.loadPhysicsData();
  this.initPhysics();
  stateLoader.loadPhysics();
  var idCtr = 0;
  var idResponse = {isIDResponse: true, ids: []}
  var dynamicObjCount = 0;
  for (var objName in addedObjects){
    idResponse.ids.push({
      name: objName, id: idCtr
    });
    this.idsByObjectName[objName] = idCtr;
    this.objectsByID[idCtr] = addedObjects[objName];
    if (addedObjects[objName].physicsBody.mass > 0 || addedObjects[objName].isChangeable){
      dynamicObjCount ++;
      dynamicAddedObjects.set(objName, addedObjects[objName]);
    }
    idCtr ++;
  }
  for (var objName in objectGroups){
    idResponse.ids.push({
      name: objName, id: idCtr
    });
    this.idsByObjectName[objName] = idCtr;
    this.objectsByID[idCtr] = objectGroups[objName];
    if (objectGroups[objName].physicsBody.mass > 0 || objectGroups[objName].isChangeable){
      dynamicObjCount ++;
      dynamicObjectGroups.set(objName, objectGroups[objName]);
    }
    idCtr ++;
  }
  postMessage(idResponse);
}
PhysicsWorker.prototype.initPhysics = function(){
  physicsWorld.quatNormalizeSkip = quatNormalizeSkip;
  physicsWorld.quatNormalizeFast = quatNormalizeFast;
  physicsWorld.defaultContactMaterial.contactEquationStiffness = contactEquationStiffness;
  physicsWorld.defaultContactMaterial.contactEquationRelaxation = contactEquationRelaxation;
  physicsWorld.defaultContactMaterial.friction = friction;
  physicsSolver.iterations = physicsIterations;
  physicsSolver.tolerance = physicsTolerance;
  physicsWorld.solver = physicsSolver;
  physicsWorld.gravity.set(0, gravityY, 0);
  physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
}
PhysicsWorker.prototype.debug = function(){
  var response = {isDebug: true, bodies: []};
  for (var i = 0; i<physicsWorld.bodies.length; i++){
    response.bodies.push({
      name: physicsWorld.bodies[i].roygbivName,
      position: {x: physicsWorld.bodies[i].position.x, y: physicsWorld.bodies[i].position.y, z: physicsWorld.bodies[i].position.z},
      quaternion: {x: physicsWorld.bodies[i].quaternion.x, y: physicsWorld.bodies[i].quaternion.y, z: physicsWorld.bodies[i].quaternion.z, w: physicsWorld.bodies[i].quaternion.w}
    });
  }
  postMessage(response);
}
PhysicsWorker.prototype.step = function(data){
  var ary = data.objDescription;
  for (var i = 0; i<ary.length; i+=19){
    var obj = worker.objectsByID[ary[i]];
    obj.physicsBody.position.x = ary[i+1]; obj.physicsBody.position.y = ary[i+2]; obj.physicsBody.position.z = ary[i+3];
    obj.physicsBody.quaternion.x = ary[i+4]; obj.physicsBody.quaternion.y = ary[i+5]; obj.physicsBody.quaternion.z = ary[i+6]; obj.physicsBody.quaternion.w = ary[i+7];
    obj.setMass(ary[i+8]);
    obj.physicsBody.velocity.x = ary[i+9]; obj.physicsBody.velocity.y = ary[i+10]; obj.physicsBody.velocity.z = ary[i+11];
    this.reusableVec1.set(ary[i+12], ary[i+13], ary[i+14]); this.reusableVec2.set(ary[i+15], ary[i+16], ary[i+17]);
    if (this.reusableVec1.x != 0 || this.reusableVec1.y != 0 || this.reusableVec1.z != 0){
      obj.physicsBody.applyImpulse(this.reusableVec1, this.reusableVec2);
    }
    ary[i+12] = 0; ary[i+13] = 0; ary[i+14] = 0; ary[i+15] = 0; ary[i+16] = 0; ary[i+17] = 0;
    if (ary[i+18] == 1){
      if (obj.hidden){
        physicsWorld.addBody(obj.physicsBody);
        obj.hidden = false;
      }
    }else{
      if (!obj.hidden){
        physicsWorld.remove(obj.physicsBody);
        obj.hidden = true;
      }
    }
  }
  physicsWorld.step(1/60);
  for (var i = 0; i<ary.length; i+=19){
    var obj = worker.objectsByID[ary[i]];
    ary[i+1] = obj.physicsBody.position.x; ary[i+2] = obj.physicsBody.position.y; ary[i+3] = obj.physicsBody.position.z;
    ary[i+4] = obj.physicsBody.quaternion.x; ary[i+5] = obj.physicsBody.quaternion.y; ary[i+6] = obj.physicsBody.quaternion.z; ary[i+7] = obj.physicsBody.quaternion.w;
    ary[i+8] = obj.physicsBody.mass;
    ary[i+9] = obj.physicsBody.velocity.x; ary[i+10] = obj.physicsBody.velocity.y; ary[i+11] = obj.physicsBody.velocity.z;
  }
  if (!worker.transferableMessageBody){
    worker.transferableMessageBody = {objDescription: ary}
    worker.transferableList = [ary.buffer];
  }else{
    worker.transferableMessageBody.objDescription = ary;
    worker.transferableList[0] = ary.buffer;
  }
  postMessage(worker.transferableMessageBody, worker.transferableList);
}

PhysicsWorker.prototype.startRecording = function(){

}
PhysicsWorker.prototype.dumpPerformanceLogs = function(){

}
// START
var PIPE = "|";
var UNDEFINED = "undefined";
var physicsShapeCache = new Object();
var dynamicAddedObjects = new Map();
var dynamicObjectGroups = new Map();
var addedObjects = new Object();
var objectGroups = new Object();
var physicsBodyGenerator = new PhysicsBodyGenerator();
var physicsWorld;
var quatNormalizeSkip, quatNormalizeFast, contactEquationStiffness, contactEquationRelaxation, friction;
var physicsIterations, physicsTolerance, physicsSolver, gravityY;
var worker = new PhysicsWorker();
self.onmessage = function(msg){
  if (msg.data.isLightweightState){
    worker.refresh(msg.data);
  }else if (msg.data.isDebug){
    worker.debug();
  }else if (msg.data.startRecording){

  }else if (msg.data.dumpPerformanceLogs){

  }else{
    worker.hasOwnership = true;
    worker.step(msg.data);
  }
}
