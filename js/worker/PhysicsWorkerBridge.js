var PhysicsWorkerBridge = function(){
  this.isPhysicsWorkerBridge = true;
  this.worker = new Worker("./js/worker/PhysicsWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.physicsWorld = new CANNON.World();
  this.ready = false;
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.updateObjectBufferSize = 10;
  this.resetObjectVelocityBufferSize = 10;
  this.setObjectVelocityBufferSize = 10;
  this.singularObjectVelocityBufferSize = 10;
  this.applyImpulseBufferSize = 10;
  this.hideBufferSize = 10;
  this.showBufferSize = 10;
  this.setMassBufferSize = 10;
  this.tickBufferSize = 1;
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
      physicsWorld.tickBuffer = [];
      physicsWorld.tickBufferAvailibilities = [];
      for (var i = 0; i<physicsWorld.tickBufferSize; i++){
        physicsWorld.tickBuffer.push(new Float32Array(3));
        physicsWorld.tickBufferAvailibilities.push(true);
      }
      physicsWorld.updateObjectBuffer = [];
      physicsWorld.resetObjectVelocityBuffer = [];
      physicsWorld.setObjectVelocityBuffer = [];
      physicsWorld.setObjectVelocityXBuffer = [];
      physicsWorld.setObjectVelocityYBuffer = [];
      physicsWorld.setObjectVelocityZBuffer = [];
      physicsWorld.applyImpulseObjectBuffer = [];
      physicsWorld.hideObjectBuffer = [];
      physicsWorld.showObjectBuffer = [];
      physicsWorld.setObjectMassBuffer = [];
      physicsWorld.updateObjectBufferAvailibilities = [];
      physicsWorld.resetObjectVelocityBufferAvailibilities = [];
      physicsWorld.setObjectVelocityBufferAvailibilities = [];
      physicsWorld.setObjectVelocityXBufferAvailibilities = [];
      physicsWorld.setObjectVelocityYBufferAvailibilities = [];
      physicsWorld.setObjectVelocityZBufferAvailibilities = [];
      physicsWorld.applyImpulseObjectBufferAvailibilities = [];
      physicsWorld.hideObjectBufferAvailibilities = [];
      physicsWorld.showObjectBufferAvailibilities = [];
      physicsWorld.setObjectMassBufferAvailibilities = [];
      physicsWorld.updateBuffer = new Map();
      physicsWorld.velocityUpdateBuffer = new Map();
      physicsWorld.velocityResetBuffer = new Map();
      physicsWorld.velocityXUpdateBuffer = new Map();
      physicsWorld.velocityYUpdateBuffer = new Map();
      physicsWorld.velocityZUpdateBuffer = new Map();
      physicsWorld.applyImpulseBuffer = new Map();
      physicsWorld.hideBuffer = new Map();
      physicsWorld.showBuffer = new Map();
      physicsWorld.setMassBuffer = new Map();
      for (var i = 0; i<msg.data.ids.length; i++){
        var curIDInfo = msg.data.ids[i];
        physicsWorld.idsByObjectName[curIDInfo.name] = curIDInfo.id;
        var obj = addedObjects[curIDInfo.name] || objectGroups[curIDInfo.name];
        if (!obj){
          throw new Error("[!] PhysicsWorkerBridge object not found: "+curIDInfo.name);
        }
        physicsWorld.objectsByID[curIDInfo.id] = obj;
        if (obj.isChangeable){
          for (var i2 = 0; i2<physicsWorld.updateObjectBufferSize; i2++){
            physicsWorld.updateObjectBuffer.push(new Float32Array(10));
            physicsWorld.updateObjectBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.resetObjectVelocityBufferSize; i2++){
            physicsWorld.resetObjectVelocityBuffer.push(new Float32Array(3));
            physicsWorld.resetObjectVelocityBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.setObjectVelocityBufferSize; i2++){
            physicsWorld.setObjectVelocityBuffer.push(new Float32Array(6));
            physicsWorld.setObjectVelocityBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.singularObjectVelocityBufferSize; i2++){
            physicsWorld.setObjectVelocityXBuffer.push(new Float32Array(4));
            physicsWorld.setObjectVelocityYBuffer.push(new Float32Array(4));
            physicsWorld.setObjectVelocityZBuffer.push(new Float32Array(4));
            physicsWorld.setObjectVelocityXBufferAvailibilities.push(true);
            physicsWorld.setObjectVelocityYBufferAvailibilities.push(true);
            physicsWorld.setObjectVelocityZBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.applyImpulseBufferSize; i2++){
            physicsWorld.applyImpulseObjectBuffer.push(new Float32Array(9));
            physicsWorld.applyImpulseObjectBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.hideBufferSize; i2++){
            physicsWorld.hideObjectBuffer.push(new Float32Array(3));
            physicsWorld.hideObjectBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.showBufferSize; i2++){
            physicsWorld.showObjectBuffer.push(new Float32Array(3));
            physicsWorld.showObjectBufferAvailibilities.push(true);
          }
          for (var i2 = 0; i2<physicsWorld.setMassBufferSize; i2++){
            physicsWorld.setObjectMassBuffer.push(new Float32Array(4));
            physicsWorld.setObjectMassBufferAvailibilities.push(true);
          }
        }
      }
      physicsWorld.ready = true;
    }else{
      for (var i = 0; i<msg.data.length; i++){
        var ary = new Float32Array(msg.data[i]);
        switch(ary[0]){
          case 0:
            var bufID = ary[1];
            physicsWorld.updateObjectBuffer[bufID] = ary;
            physicsWorld.updateObjectBufferAvailibilities[bufID] = true;
            var obj = physicsWorld.objectsByID[ary[2]];
            obj.isPhysicsDirty = false;
          break;
          case 1:
            var bufID = ary[1];
            physicsWorld.tickBuffer[bufID] = ary;
            physicsWorld.tickBufferAvailibilities[bufID] = true;
          break;
          case 2:
            if (mode == 0){
              physicsWorld.workerMessageHandler.push(ary.buffer);
              return;
            }
            var obj = physicsWorld.objectsByID[ary[2]];
            if (!obj.isPhysicsDirty){
              obj.physicsBody.position.set(ary[3], ary[4], ary[5]);
              obj.physicsBody.quaternion.set(ary[6], ary[7], ary[8], ary[9]);
            }
            physicsWorld.workerMessageHandler.push(ary.buffer);
          break;
          case 3:
            var bufID = ary[1];
            physicsWorld.resetObjectVelocityBuffer[bufID] = ary;
            physicsWorld.resetObjectVelocityBufferAvailibilities[bufID] = true;
          break;
          case 4:
            var bufID = ary[1];
            physicsWorld.setObjectVelocityBuffer[bufID] = ary;
            physicsWorld.setObjectVelocityBufferAvailibilities[bufID] = true;
          break;
          case 5:
            var bufID = ary[1];
            physicsWorld.setObjectVelocityXBuffer[bufID] = ary;
            physicsWorld.setObjectVelocityXBufferAvailibilities[bufID] = true;
          break;
          case 6:
            var bufID = ary[1];
            physicsWorld.setObjectVelocityYBuffer[bufID] = ary;
            physicsWorld.setObjectVelocityYBufferAvailibilities[bufID] = true;
          break;
          case 7:
            var bufID = ary[1];
            physicsWorld.setObjectVelocityZBuffer[bufID] = ary;
            physicsWorld.setObjectVelocityZBufferAvailibilities[bufID] = true;
          break;
          case 8:
            var bufID = ary[1];
            physicsWorld.applyImpulseObjectBuffer[bufID] = ary;
            physicsWorld.applyImpulseObjectBufferAvailibilities[bufID] = true;
          break;
          case 9:
            var bufID = ary[1];
            physicsWorld.showObjectBuffer[bufID] = ary;
            physicsWorld.showObjectBufferAvailibilities[bufID] = true;
          break;
          case 10:
            var bufID = ary[1];
            physicsWorld.hideObjectBuffer[bufID] = ary;
            physicsWorld.hideObjectBufferAvailibilities[bufID] = true;
          break;
          case 11:
            physicsWorld.setObjectMassBuffer[bufID] = ary;
            physicsWorld.setObjectMassBufferAvailibilities[bufID] = true;
          break;
        }
      }
    }
  });
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
  this.ready = false;
  this.worker.postMessage(new LightweightState());
}

PhysicsWorkerBridge.prototype.init = function(){

}

PhysicsWorkerBridge.prototype.addContactMaterial = function(mt1, mt2){

}

PhysicsWorkerBridge.prototype.getContactMaterial = function(mt1, mt2){

}

PhysicsWorkerBridge.prototype.remove = function(body){
  this.physicsWorld.remove(body);
}

PhysicsWorkerBridge.prototype.addBody = function(body){
  this.physicsWorld.addBody(body);
}

PhysicsWorkerBridge.prototype.step = function(stepAmount){
  if (!this.ready){
    return;
  }
  if (this.updateBuffer.size > 0){
    this.updateBuffer.forEach(this.issueUpdate);
    this.updateBuffer.clear();
  }
  if (this.velocityUpdateBuffer.size > 0){
    this.velocityUpdateBuffer.forEach(this.issueObjectVelocityUpdate);
    this.velocityUpdateBuffer.clear();
  }
  if (this.velocityResetBuffer.size > 0){
    this.velocityResetBuffer.forEach(this.issueObjectVelocityReset);
    this.velocityResetBuffer.clear();
  }
  if (this.velocityXUpdateBuffer.size > 0){
    this.velocityXUpdateBuffer.forEach(this.issueObjectVelocityXUpdate);
    this.velocityXUpdateBuffer.clear();
  }
  if (this.velocityYUpdateBuffer.size > 0){
    this.velocityYUpdateBuffer.forEach(this.issueObjectVelocityYUpdate);
    this.velocityYUpdateBuffer.clear();
  }
  if (this.velocityZUpdateBuffer.size > 0){
    this.velocityZUpdateBuffer.forEach(this.issueObjectVelocityZUpdate);
    this.velocityZUpdateBuffer.clear();
  }
  if (this.applyImpulseBuffer.size > 0){
    this.applyImpulseBuffer.forEach(this.issueApplyImpulse);
    this.applyImpulseBuffer.clear();
  }
  if (this.showBuffer.size > 0){
    this.showBuffer.forEach(this.issueShow);
    this.showBuffer.clear();
  }
  if (this.hideBuffer.size > 0){
    this.hideBuffer.forEach(this.issueHide);
    this.hideBuffer.clear();
  }
  if (this.setMassBuffer.size > 0){
    this.setMassBuffer.forEach(this.issueSetMass);
    this.setMassBuffer.clear();
  }
  var tickSent = false;
  for (var i = 0; i<this.tickBuffer.length; i++){
    if (this.tickBufferAvailibilities[i]){
      var buf = this.tickBuffer[i];
      buf[0] = 1;
      buf[1] = i;
      buf[2] = stepAmount;
      this.workerMessageHandler.push(buf.buffer);
      this.tickBufferAvailibilities[i] = false;
      break;
    }
  }
  this.workerMessageHandler.flush();
}

PhysicsWorkerBridge.prototype.issueUpdate = function(obj){
  for (var i = 0; i<physicsWorld.updateObjectBuffer.length; i++){
    if(physicsWorld.updateObjectBufferAvailibilities[i]){
      var buf = physicsWorld.updateObjectBuffer[i];
      buf[0] = 0;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.position.x; buf[4] = obj.physicsBody.position.y; buf[5] = obj.physicsBody.position.z;
      buf[6] = obj.physicsBody.quaternion.x; buf[7] = obj.physicsBody.quaternion.y; buf[8] = obj.physicsBody.quaternion.z; buf[9] = obj.physicsBody.quaternion.w;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.updateObjectBufferAvailibilities[i] = false;
      return;
    }
  }
  console.warn("[!] PhysicsWorkerBridge.issueUpdate updateObjectBuffer overflow.");
}

PhysicsWorkerBridge.prototype.issueObjectVelocityUpdate = function(obj){
  for (var i = 0 ; i<physicsWorld.setObjectVelocityBuffer.length; i++){
    if (physicsWorld.setObjectVelocityBufferAvailibilities[i]){
      var buf = physicsWorld.setObjectVelocityBuffer[i];
      var velocityVector = obj.physicsBody.velocity;
      buf[0] = 4;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = velocityVector.x; buf[4] = velocityVector.y; buf[5] = velocityVector.z;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.setObjectVelocityBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueObjectVelocityUpdate buffer overflow.");
}

PhysicsWorkerBridge.prototype.issueObjectVelocityReset = function(obj){
  for (var i = 0 ; i<physicsWorld.resetObjectVelocityBuffer.length; i++){
    if (physicsWorld.resetObjectVelocityBufferAvailibilities[i]){
      var buf = physicsWorld.resetObjectVelocityBuffer[i];
      buf[0] = 3;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.resetObjectVelocityBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.resetObjectVelocity buffer overflow.");
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

PhysicsWorkerBridge.prototype.issueApplyImpulse = function(obj){
  for (var i = 0; i<physicsWorld.applyImpulseObjectBuffer.length; i++){
    if (physicsWorld.applyImpulseObjectBufferAvailibilities[i]){
      var buf = physicsWorld.applyImpulseObjectBuffer[i];
      buf[0] = 8;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.impulseVec1.x; buf[4] = obj.physicsBody.impulseVec1.y; buf[5] = obj.physicsBody.impulseVec1.z;
      buf[6] = obj.physicsBody.impulseVec2.x; buf[7] = obj.physicsBody.impulseVec2.y; buf[8] = obj.physicsBody.impulseVec2.z;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.applyImpulseObjectBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueApplyImpulse buffer overflow.");
}

PhysicsWorkerBridge.prototype.issueShow = function(obj){
  for (var i = 0; i<physicsWorld.showObjectBuffer.length; i++){
    if (physicsWorld.showObjectBufferAvailibilities[i]){
      var buf = physicsWorld.showObjectBuffer[i];
      buf[0] = 9;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.showObjectBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueShow buffer overflow.");
}

PhysicsWorkerBridge.prototype.issueHide = function(obj){
  for (var i = 0; i<physicsWorld.hideObjectBuffer.length; i++){
    if (physicsWorld.hideObjectBufferAvailibilities[i]){
      var buf = physicsWorld.hideObjectBuffer[i];
      buf[0] = 10;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.hideObjectBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueHide buffer overflow.");
}

PhysicsWorkerBridge.prototype.issueSetMass = function(obj){
  for (var i = 0; i<physicsWorld.setObjectMassBuffer.length; i++){
    if (physicsWorld.setObjectMassBufferAvailibilities[i]){
      var buf = physicsWorld.setObjectMassBuffer[i];
      buf[0] = 11;
      buf[1] = i;
      buf[2] = physicsWorld.idsByObjectName[obj.name];
      buf[3] = obj.physicsBody.mass;
      physicsWorld.workerMessageHandler.push(buf.buffer);
      physicsWorld.setObjectMassBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.issueSetMass buffer overflow.");
}

PhysicsWorkerBridge.prototype.updateObject = function(obj){
  obj.isPhysicsDirty = true;
  this.updateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setObjectVelocity = function(obj, velocityVector){
  obj.physicsBody.velocity.copy(velocityVector);
  this.velocityUpdateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setObjectVelocityX = function(obj, vx){
  obj.physicsBody.velocity.x = vx;
  this.velocityXUpdateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setObjectVelocityY = function(obj, vy){
  obj.physicsBody.velocity.y = vy;
  this.velocityYUpdateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setObjectVelocityZ = function(obj, vz){
  obj.physicsBody.velocity.z = vz;
  this.velocityZUpdateBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.resetObjectVelocity = function(obj){
  this.velocityResetBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.applyImpulse = function(obj, vec1, vec2){
  obj.physicsBody.impulseVec1.copy(vec1);
  obj.physicsBody.impulseVec2.copy(vec2);
  this.applyImpulseBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.hide = function(obj){
  this.hideBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.show = function(obj){
  this.showBuffer.set(obj.name, obj);
}

PhysicsWorkerBridge.prototype.setMass = function(obj, mass){
  this.setMassBuffer.set(obj.name, obj);
}
