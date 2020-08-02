var PhysicsWorkerBridge = function(){
  this.record = false;
  this.isPhysicsWorkerBridge = true;
  this.worker = new Worker("./js/worker/PhysicsWorker.js");
  this.ready = false;
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.updateBuffer = new Map();
  this.performanceLogs = {
    objectDescriptionBufferSize: 0, collisionDescriptionBufferSize: 0
  }
  this.worker.addEventListener("message", function(msg){
    if (msg.data.isPerformanceLog){
      console.log("%c                    PHYSICS WORKER                    ", "background: black; color: lime");
      console.log("%cStep time: "+msg.data.stepTime+" ms", "background: black; color: magenta");
    }else if (msg.data.isDebug){
      console.log("[*] Debug response received.");
      for (var i = 0; i<msg.data.bodies.length; i++){
        var obj = addedObjects[msg.data.bodies[i].name] || objectGroups[msg.data.bodies[i].name];
        if (!obj){
          console.error("[!] PhysicsWorkerBridge debug: Object not found: "+msg.data.bodies[i].name);
        }else{
          obj.physicsBody.position.copy(msg.data.bodies[i].position);
          obj.physicsBody.quaternion.copy(msg.data.bodies[i].quaternion);
        }
      }
    }else if (msg.data.isIDResponse){
      for (var i = 0; i<msg.data.ids.length; i++){
        var curIDInfo = msg.data.ids[i];
        physicsWorld.idsByObjectName[curIDInfo.name] = curIDInfo.id;
        var obj = addedObjects[curIDInfo.name] || objectGroups[curIDInfo.name];
        if (!obj){
          throw new Error("[!] PhysicsWorkerBridge object not found: "+curIDInfo.name);
        }
        physicsWorld.objectsByID[curIDInfo.id] = obj;
      }
      physicsWorld.initTransferableBody();
      physicsWorld.ready = true;
      sceneHandler.onPhysicsReady();
    }else{
      if (physicsWorld.ready){
        physicsWorld.updateObjects(msg.data);
      }
    }
  });
}

PhysicsWorkerBridge.prototype.startRecording = function(){
  this.record = true;
}

PhysicsWorkerBridge.prototype.dumpPerformanceLogs = function(){
  console.log("%cObject description buffer length: "+this.performanceLogs.objectDescriptionBufferSize, "background: black; color: magenta");
  console.log("%cCollision description buffer length: "+this.performanceLogs.collisionDescriptionBufferSize, "background: black; color: magenta");
}

PhysicsWorkerBridge.prototype.issueUpdate = function(obj){
  var ary = physicsWorld.transferableMessageBody.objDescription;
  var i = obj.indexInPhysicsObjDescriptionArray;
  if (obj.isPositionDirty){
    ary[i+1] = obj.physicsBody.position.x; ary[i+2] = obj.physicsBody.position.y; ary[i+3] = obj.physicsBody.position.z;
    obj.isPositionDirty = false;
  }
  if (obj.isRotationDirty){
    ary[i+4] = obj.physicsBody.quaternion.x; ary[i+5] = obj.physicsBody.quaternion.y; ary[i+6] = obj.physicsBody.quaternion.z; ary[i+7] = obj.physicsBody.quaternion.w;
    obj.isRotationDirty = false;
  }
  ary[i+8] = obj.physicsBody.mass;
  if (obj.isVelocityXDirty){
    ary[i+9] = obj.physicsBody.velocity.x;
    obj.isVelocityXDirty = false;
  }
  if (obj.isVelocityYDirty){
    ary[i+10] = obj.physicsBody.velocity.y;
    obj.isVelocityYDirty = false;
  }
  if (obj.isVelocityZDirty){
    ary[i+11] = obj.physicsBody.velocity.z;
    obj.isVelocityZDirty = false;
  }
  ary[i+12] = obj.impulseVec1.x; ary[i+13] = obj.impulseVec1.y; ary[i+14] = obj.impulseVec1.z;
  ary[i+15] = obj.impulseVec2.x; ary[i+16] = obj.impulseVec2.y; ary[i+17] = obj.impulseVec2.z;
  ary[i+18] = 1;
  if (!obj.isVisibleOnThePreviewScene() && !obj.physicsKeptWhenHidden){
    ary[i+18] = 0;
  }
  if (obj.isVelocityReset){
    ary[i+19] = 1;
    obj.isVelocityReset = false;
  }
}

PhysicsWorkerBridge.prototype.handleCollisions = function(collisionDescription){
  if (collisionDescription){
    for (var i = 0; i<collisionDescription.length; i+= 10){
      if (collisionDescription[i] < 0){
        break;
      }
      var sourceObject = physicsWorld.objectsByID[collisionDescription[i]];
      var targetObject = physicsWorld.objectsByID[collisionDescription[i+1]];
      var positionX = collisionDescription[i+2];
      var positionY = collisionDescription[i+3];
      var positionZ = collisionDescription[i+4];
      var collisionImpact = collisionDescription[i+5];
      var quaternionX = collisionDescription[i+6];
      var quaternionY = collisionDescription[i+7];
      var quaternionZ = collisionDescription[i+8];
      var quaternionW = collisionDescription[i+9];
      reusableCollisionInfo.set(targetObject.name, positionX, positionY, positionZ, collisionImpact, quaternionX, quaternionY, quaternionZ, quaternionW);
      var curCollisionCallbackRequest = collisionCallbackRequests.get(sourceObject.name);
      if (curCollisionCallbackRequest){
        curCollisionCallbackRequest(reusableCollisionInfo);
      }
      collisionDescription[i] = -1;
    }
  }
  return collisionDescription;
}

PhysicsWorkerBridge.prototype.updateObjects = function(data){
  if (mode != 1){
    return;
  }
  var ary = data.objDescription;
  var collisionDescription = this.handleCollisions(data.collisionDescription);
  this.transferableMessageBody.objDescription = ary;
  this.transferableList[0] = ary.buffer;
  if (collisionDescription){
    this.transferableMessageBody.collisionDescription = collisionDescription;
    if (this.transferableList.length == 1){
      this.transferableList.push(collisionDescription.buffer);
    }else{
      this.transferableList[1] = collisionDescription.buffer;
    }
  }
  this.hasOwnership = true;
  this.updateBuffer.forEach(this.issueUpdate);
  this.updateBuffer.clear();
  for (var i = 0; i<ary.length; i+=20){
    var obj = this.objectsByID[ary[i]];
    obj.physicsBody.position.x = ary[i+1]; obj.physicsBody.position.y = ary[i+2]; obj.physicsBody.position.z = ary[i+3];
    obj.physicsBody.quaternion.x = ary[i+4]; obj.physicsBody.quaternion.y = ary[i+5]; obj.physicsBody.quaternion.z = ary[i+6]; obj.physicsBody.quaternion.w = ary[i+7];
    obj.physicsBody.velocity.x = ary[i+9]; obj.physicsBody.velocity.y = ary[i+10]; obj.physicsBody.velocity.z = ary[i+11];
    obj.impulseVec1.set(0, 0, 0); obj.impulseVec2.set(0, 0, 0);
  }
}

PhysicsWorkerBridge.prototype.initTransferableBody = function(){
  //objectID, px, py, pz, qx, qy, qz, qw, mass, vx, vy, vz, impulseVec1x, impulseVec1y, impulseVec1xz, impulseVec2x, impulseVec2y, impulseVec2z, isVisible
  var objDescriptionAry = [];
  var index = 0;
  for (var objName in sceneHandler.getAddedObjects()){
    var obj = addedObjects[objName];
    if (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)){
      obj.impulseVec1 = new THREE.Vector3(); obj.impulseVec2 = new THREE.Vector3();
      objDescriptionAry.push(physicsWorld.idsByObjectName[obj.name]);
      objDescriptionAry.push(obj.physicsBody.position.x); objDescriptionAry.push(obj.physicsBody.position.y); objDescriptionAry.push(obj.physicsBody.position.z);
      objDescriptionAry.push(obj.physicsBody.quaternion.x); objDescriptionAry.push(obj.physicsBody.quaternion.y); objDescriptionAry.push(obj.physicsBody.quaternion.z); objDescriptionAry.push(obj.physicsBody.quaternion.w);
      objDescriptionAry.push(obj.physicsBody.mass);
      objDescriptionAry.push(obj.physicsBody.velocity.x); objDescriptionAry.push(obj.physicsBody.velocity.y); objDescriptionAry.push(obj.physicsBody.velocity.z);
      objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0);
      objDescriptionAry.push(1);
      objDescriptionAry.push(0);
      obj.indexInPhysicsObjDescriptionArray = index;
      index += 20;
    }
  }
  for (var objName in sceneHandler.getObjectGroups()){
    var obj = objectGroups[objName];
    if (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)){
      obj.impulseVec1 = new THREE.Vector3(); obj.impulseVec2 = new THREE.Vector3();
      objDescriptionAry.push(physicsWorld.idsByObjectName[obj.name]);
      objDescriptionAry.push(obj.physicsBody.position.x); objDescriptionAry.push(obj.physicsBody.position.y); objDescriptionAry.push(obj.physicsBody.position.z);
      objDescriptionAry.push(obj.physicsBody.quaternion.x); objDescriptionAry.push(obj.physicsBody.quaternion.y); objDescriptionAry.push(obj.physicsBody.quaternion.z); objDescriptionAry.push(obj.physicsBody.quaternion.w);
      objDescriptionAry.push(obj.physicsBody.mass);
      objDescriptionAry.push(obj.physicsBody.velocity.x); objDescriptionAry.push(obj.physicsBody.velocity.y); objDescriptionAry.push(obj.physicsBody.velocity.z);
      objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0); objDescriptionAry.push(0);
      objDescriptionAry.push(1);
      objDescriptionAry.push(0);
      obj.indexInPhysicsObjDescriptionArray = index;
      index += 20;
    }
  }
  var objDescriptionTypedArray = new Float32Array(objDescriptionAry);
  this.transferableMessageBody = {
    objDescription: objDescriptionTypedArray
  }
  this.transferableList = [objDescriptionTypedArray.buffer];
  this.hasOwnership = true;
}

PhysicsWorkerBridge.prototype.debug = function(){
  this.worker.postMessage({isDebug: true});
}

PhysicsWorkerBridge.prototype.refresh = function(){
  if (mode == 0){
    return;
  }
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.updateBuffer = new Map();
  this.ready = false;
  this.worker.postMessage(new LightweightState());
}

PhysicsWorkerBridge.prototype.removeCollisionListener = function(obj){
  this.worker.postMessage({
    isRemoveCollisionListener: true, objName: obj.name
  });
}

PhysicsWorkerBridge.prototype.setCollisionListener = function(obj){
  this.worker.postMessage({
    isSetCollisionListener: true, objName: obj.name
  });
}

PhysicsWorkerBridge.prototype.init = function(){

}

PhysicsWorkerBridge.prototype.addContactMaterial = function(mt1, mt2){

}

PhysicsWorkerBridge.prototype.getContactMaterial = function(mt1, mt2){

}

PhysicsWorkerBridge.prototype.remove = function(body){

}

PhysicsWorkerBridge.prototype.addBody = function(body){

}

PhysicsWorkerBridge.prototype.step = function(stepAmount){
  if (!this.ready || !this.hasOwnership){
    return;
  }
  if (this.record){
    this.performanceLogs.objectDescriptionBufferSize = this.transferableMessageBody.objDescription.length;
    if (this.transferableMessageBody.collisionDescription){
      this.performanceLogs.collisionDescriptionBufferSize = this.transferableMessageBody.collisionDescription.length;
    }
  }
  this.worker.postMessage(this.transferableMessageBody, this.transferableList);
  this.hasOwnership = false;
}

PhysicsWorkerBridge.prototype.updateObject = function(obj, isPositionUpdated, isRotationUpdated){
  if (obj.noMass){
    return;
  }
  obj.isPositionDirty = isPositionUpdated || obj.isPositionDirty;
  obj.isRotationDirty = isRotationUpdated || obj.isRotationDirty;
  this.updateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setObjectVelocity = function(obj, velocityVector){
  this.updateBuffer.set(obj.name, obj);
  obj.isVelocityXDirty = true;
  obj.isVelocityYDirty = true;
  obj.isVelocityZDirty = true;
}

PhysicsWorkerBridge.prototype.setObjectVelocityX = function(obj, vx){
  this.updateBuffer.set(obj.name, obj);
  obj.isVelocityXDirty = true;
}

PhysicsWorkerBridge.prototype.setObjectVelocityY = function(obj, vy){
  this.updateBuffer.set(obj.name, obj);
  obj.isVelocityYDirty = true;
}

PhysicsWorkerBridge.prototype.setObjectVelocityZ = function(obj, vz){
  this.updateBuffer.set(obj.name, obj);
  obj.isVelocityZDirty = true;
}

PhysicsWorkerBridge.prototype.resetObjectVelocity = function(obj){
  this.updateBuffer.set(obj.name, obj);
  obj.isVelocityXDirty = true;
  obj.isVelocityYDirty = true;
  obj.isVelocityZDirty = true;
  obj.isVelocityReset = true;
}

PhysicsWorkerBridge.prototype.applyImpulse = function(obj, vec1, vec2){
  obj.impulseVec1.copy(vec1);
  obj.impulseVec2.copy(vec2);
  this.updateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.hide = function(obj){
  this.updateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.show = function(obj){
  this.updateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setMass = function(obj, mass){
  this.updateBuffer.set(obj.name, obj);
}
