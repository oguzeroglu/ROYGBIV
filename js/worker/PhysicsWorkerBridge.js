var PhysicsWorkerBridge = function(){
  this.isPhysicsWorkerBridge = true;
  this.worker = new Worker("./js/worker/PhysicsWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.ready = false;
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.updateBufferAvailibility = "updateBufferAvailibility";
  this.resetVelocityBufferAvailibility = "resetVelocityBufferAvailibility";
  this.collisionListenerRemoveRequestBufferAvailibility = "collisionListenerRemoveRequestBufferAvailibility";
  this.collisionListenerRequestBufferAvailibility = "collisionListenerRequestBufferAvailibility";
  this.setVelocityBufferAvailibility = "setVelocityBufferAvailibility";
  this.setVelocityXBufferAvailibility = "setVelocityXBufferAvailibility";
  this.setVelocityYBufferAvailibility = "setVelocityYBufferAvailibility";
  this.setVelocityZBufferAvailibility = "setVelocityZBufferAvailibility";
  this.applyImpulseBufferAvailibility = "applyImpulseBufferAvailibility";
  this.showBufferAvailibility = "showBufferAvailibility";
  this.hideBufferAvailibility = "hideBufferAvailibility";
  this.setMassBufferAvailibility = "setMassBufferAvailibility"
  this.worker.addEventListener("message", function(msg){
    if (msg.data.isDebug){
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
        physicsWorld.initializeObjectBuffers(obj);
      }
      physicsWorld.ready = true;
    }else{
      for (var i = 0; i<msg.data.length; i++){
        var ary = new Float32Array(msg.data[i]);
        switch(ary[0]){
          case 0:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.updateBuffer = ary;
            obj.updateBufferAvailibility = true;
            obj.isPhysicsDirty = false;
          break;
          case 1:
            physicsWorld.tickBuffer = ary;
            physicsWorld.tickBufferAvailibility = true;
          break;
          case 2:
            if (mode == 0){
              physicsWorld.workerMessageHandler.push(ary.buffer);
              return;
            }
            var obj = physicsWorld.objectsByID[ary[1]];
            if (!obj.isPhysicsDirty && obj.physicsBody.mass > 0){
              obj.physicsBody.position.set(ary[2], ary[3], ary[4]);
              obj.physicsBody.quaternion.set(ary[5], ary[6], ary[7], ary[8]);
            }
            physicsWorld.workerMessageHandler.push(ary.buffer);
          break;
          case 3:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.resetVelocityBuffer = ary;
            obj.resetVelocityBufferAvailibility = true;
          break;
          case 4:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.setVelocityBuffer = ary;
            obj.setVelocityBufferAvailibility = true;
          break;
          case 5:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.setVelocityXBuffer = ary;
            obj.setVelocityXBufferAvailibility = true;
          break;
          case 6:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.setVelocityYBuffer = ary;
            obj.setVelocityYBufferAvailibility = true;
          break;
          case 7:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.setVelocityZBuffer = ary;
            obj.setVelocityZBufferAvailibility = true;
          break;
          case 8:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.applyImpulseBuffer = ary;
            obj.applyImpulseBufferAvailibility = true;
          break;
          case 9:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.showBuffer = ary;
            obj.showBufferAvailibility = true;
          break;
          case 10:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.hideBuffer = ary;
            obj.hideBufferAvailibility = true;
          break;
          case 11:
            var objID = ary[1];
            var obj = physicsWorld.objectsByID[objID];
            obj.setMassBuffer = ary;
            obj.setMassBufferAvailibility = true;
          break;
          case 12:
            var obj = physicsWorld.objectsByID[ary[1]];
            obj.collisionListenerRequestBuffer = ary;
            obj.collisionListenerRequestBufferAvailibility = true;
          break;
          case 13:
            if (mode != 0){
              physicsWorld.fireCollision(ary);
            }
            physicsWorld.workerMessageHandler.push(ary.buffer);
          break;
          case 14:
            var obj = physicsWorld.objectsByID[ary[1]];
            obj.collisionListenerRemoveRequestBuffer = ary;
            obj.collisionListenerRemoveRequestBufferAvailibility = true;
          break;
        }
      }
    }
  });
}

PhysicsWorkerBridge.prototype.initializeObjectBuffers = function(obj){
  obj.availibilityModifierBuffer = new Map();
  var id = physicsWorld.idsByObjectName[obj.name];
  obj.collisionListenerRequestBuffer = new Float32Array(2);
  obj.collisionListenerRequestBufferAvailibility = true;
  obj.collisionListenerRequestBuffer[0] = 12;
  obj.collisionListenerRequestBuffer[1] = id;
  obj.collisionListenerRemoveRequestBuffer = new Float32Array(2);
  obj.collisionListenerRemoveRequestBufferAvailibility = true;
  obj.collisionListenerRemoveRequestBuffer[0] = 14;
  obj.collisionListenerRemoveRequestBuffer[1] = id;
  obj.updateBuffer = new Float32Array(9);
  obj.updateBufferAvailibility = true;
  obj.updateBuffer[0] = 0;
  obj.updateBuffer[1] = id;
  obj.resetVelocityBuffer = new Float32Array(2);
  obj.resetVelocityBufferAvailibility = true;
  obj.resetVelocityBuffer[0] = 3;
  obj.resetVelocityBuffer[1] = id;
  obj.setVelocityBuffer = new Float32Array(5);
  obj.setVelocityBufferAvailibility = true;
  obj.setVelocityBuffer[0] = 4;
  obj.setVelocityBuffer[1] = id;
  obj.setVelocityXBuffer = new Float32Array(3);
  obj.setVelocityXBufferAvailibility = true;
  obj.setVelocityXBuffer[0] = 5;
  obj.setVelocityXBuffer[1] = id;
  obj.setVelocityYBuffer = new Float32Array(3);
  obj.setVelocityYBufferAvailibility = true;
  obj.setVelocityYBuffer[0] = 6;
  obj.setVelocityYBuffer[1] = id;
  obj.setVelocityZBuffer = new Float32Array(3);
  obj.setVelocityZBufferAvailibility = true;
  obj.setVelocityZBuffer[0] = 7;
  obj.setVelocityZBuffer[1] = id;
  obj.applyImpulseBuffer = new Float32Array(8);
  obj.applyImpulseBufferAvailibility = true;
  obj.applyImpulseBuffer[0] = 8;
  obj.applyImpulseBuffer[1] = id;
  obj.showBuffer = new Float32Array(2);
  obj.showBufferAvailibility = true;
  obj.showBuffer[0] = 9;
  obj.showBuffer[1] = id;
  obj.hideBuffer = new Float32Array(2);
  obj.hideBufferAvailibility = true;
  obj.hideBuffer[0] = 10;
  obj.hideBuffer[1] = id;
  obj.setMassBuffer = new Float32Array(3);
  obj.setMassBufferAvailibility = true;
  obj.setMassBuffer[0] = 11;
  obj.setMassBuffer[1] = id;
}

PhysicsWorkerBridge.prototype.debug = function(){
  this.worker.postMessage({isDebug: true});
}

PhysicsWorkerBridge.prototype.refresh = function(){
  if (mode == 0){
    return;
  }
  this.tickBuffer = new Float32Array(2);
  this.tickBuffer[0] = 1;
  this.tickBufferAvailibility = true;
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.availibilityModifierBuffer = new Map();
  this.ready = false;
  this.worker.postMessage(new LightweightState());
}

PhysicsWorkerBridge.prototype.issueObjectAvailibilityBuffers = function(obj, bufferKey){
  obj[bufferKey] = false;
}

PhysicsWorkerBridge.prototype.issueAvailibilityBuffers = function(obj, key){
  obj.availibilityModifierBuffer.forEach(physicsWorld.issueObjectAvailibilityBuffers);
  obj.availibilityModifierBuffer.clear();
}

PhysicsWorkerBridge.prototype.removeCollisionListener = function(obj){
  if (obj.collisionListenerRemoveRequestBufferAvailibility){
    physicsWorld.workerMessageHandler.push(obj.collisionListenerRemoveRequestBuffer.buffer);
    physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.collisionListenerRemoveRequestBufferAvailibility);
  }
}

PhysicsWorkerBridge.prototype.setCollisionListener = function(obj){
  if (obj.collisionListenerRequestBufferAvailibility){
    physicsWorld.workerMessageHandler.push(obj.collisionListenerRequestBuffer.buffer);
    physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.collisionListenerRequestBufferAvailibility);
  }
}

PhysicsWorkerBridge.prototype.fireCollision = function(ary){
  var obj = physicsWorld.objectsByID[ary[1]];
  var curCollisionCallbackRequest = collisionCallbackRequests.get(obj.name);
  if (curCollisionCallbackRequest){
    reusableCollisionInfo.set(physicsWorld.objectsByID[ary[2]].name, ary[3], ary[4], ary[5], ary[6], ary[7], ary[8], ary[9], ary[10]);
    curCollisionCallbackRequest(reusableCollisionInfo);
  }
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
  if (!this.ready){
    return;
  }
  this.tickBuffer[1] = stepAmount;
  this.workerMessageHandler.push(this.tickBuffer.buffer);
  this.tickBufferAvailibility = false;
  if (this.availibilityModifierBuffer.size > 0){
    this.availibilityModifierBuffer.forEach(this.issueAvailibilityBuffers);
    this.availibilityModifierBuffer.clear();
  }
  this.workerMessageHandler.flush();
}

PhysicsWorkerBridge.prototype.issueObjectVelocityXUpdate = function(obj){
  for (var i = 0 ; i<physicsWorld.setObjectVelocityXBuffer.length; i++){
    if (physicsWorld.setObjectVelocityXBufferAvailibilities[i]){
      var buf = physicsWorld.setObjectVelocityXBuffer[i];
      buf[0] = 5;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.velocity.x;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.setObjectVelocityXBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueObjectVelocityXUpdate buffer overflow.");
}

PhysicsWorkerBridge.prototype.issueObjectVelocityYUpdate = function(obj){
  for (var i = 0 ; i<physicsWorld.setObjectVelocityYBuffer.length; i++){
    if (physicsWorld.setObjectVelocityYBufferAvailibilities[i]){
      var buf = physicsWorld.setObjectVelocityYBuffer[i];
      buf[0] = 6;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.velocity.y;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.setObjectVelocityYBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueObjectVelocityYUpdate buffer overflow.");
}

PhysicsWorkerBridge.prototype.issueObjectVelocityZUpdate = function(obj){
  for (var i = 0 ; i<physicsWorld.setObjectVelocityZBuffer.length; i++){
    if (physicsWorld.setObjectVelocityZBufferAvailibilities[i]){
      var buf = physicsWorld.setObjectVelocityZBuffer[i];
      buf[0] = 7;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.velocity.z;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.setObjectVelocityZBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueObjectVelocityZUpdate buffer overflow.");
}

PhysicsWorkerBridge.prototype.handleBufferAvailibilityUpdate = function(obj, key){
  physicsWorld.availibilityModifierBuffer.set(obj.name, obj);
  obj.availibilityModifierBuffer.set(key, obj);
}

PhysicsWorkerBridge.prototype.updateObject = function(obj){
  if (!obj.updateBufferAvailibility){
    return;
  }
  obj.isPhysicsDirty = true;
  var buf = obj.updateBuffer;
  buf[2] = obj.physicsBody.position.x; buf[3] = obj.physicsBody.position.y; buf[4] = obj.physicsBody.position.z;
  buf[5] = obj.physicsBody.quaternion.x; buf[6] = obj.physicsBody.quaternion.y; buf[7] = obj.physicsBody.quaternion.z;
  buf[8] = obj.physicsBody.quaternion.w;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.updateBufferAvailibility);
}

PhysicsWorkerBridge.prototype.setObjectVelocity = function(obj, velocityVector){
  if (!obj.setVelocityBufferAvailibility){
    return;
  }
  var buf = obj.setVelocityBuffer;
  buf[2] = obj.physicsBody.velocity.x;
  buf[3] = obj.physicsBody.velocity.y;
  buf[4] = obj.physicsBody.velocity.z;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.setVelocityBufferAvailibility);
}

PhysicsWorkerBridge.prototype.setObjectVelocityX = function(obj, vx){
  if (!obj.setVelocityXBufferAvailibility){
    return;
  }
  var buf = obj.setVelocityXBuffer;
  buf[2] = vx;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.setVelocityXBufferAvailibility);
}

PhysicsWorkerBridge.prototype.setObjectVelocityY = function(obj, vy){
  if (!obj.setVelocityYBufferAvailibility){
    return;
  }
  var buf = obj.setVelocityYBuffer;
  buf[2] = vy;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.setVelocityYBufferAvailibility);
}

PhysicsWorkerBridge.prototype.setObjectVelocityZ = function(obj, vz){
  if (!obj.setVelocityZBufferAvailibility){
    return;
  }
  var buf = obj.setVelocityZBuffer;
  buf[2] = vz;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.setVelocityZBufferAvailibility);
}

PhysicsWorkerBridge.prototype.resetObjectVelocity = function(obj){
  if (!obj.resetVelocityBufferAvailibility){
    return;
  }
  var buf = obj.resetVelocityBuffer;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.resetVelocityBufferAvailibility);
}

PhysicsWorkerBridge.prototype.applyImpulse = function(obj, vec1, vec2){
  if (!obj.applyImpulseBufferAvailibility){
    return;
  }
  var buf = obj.applyImpulseBuffer;
  buf[2] = vec1.x; buf[3] = vec1.y; buf[4] = vec1.z; buf[5] = vec2.x; buf[6] = vec2.y; buf[7] = vec2.z;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.applyImpulseBufferAvailibility);
}

PhysicsWorkerBridge.prototype.hide = function(obj){
  if (!obj.hideBufferAvailibility){
    return;
  }
  var buf = obj.hideBuffer;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.hideBufferAvailibility);
}

PhysicsWorkerBridge.prototype.show = function(obj){
  if (!obj.showBufferAvailibility){
    return;
  }
  var buf = obj.showBuffer;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.showBufferAvailibility);
}

PhysicsWorkerBridge.prototype.setMass = function(obj, mass){
  if (!obj.setMassBufferAvailibility){
    return;
  }
  var buf = obj.setMassBuffer;
  buf[2] = mass;
  physicsWorld.workerMessageHandler.push(buf.buffer);
  physicsWorld.handleBufferAvailibilityUpdate(obj, physicsWorld.setMassBufferAvailibility);
}
