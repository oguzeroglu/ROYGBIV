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
      physicsWorld.updateObjectBufferAvailibilities = [];
      physicsWorld.resetObjectVelocityBufferAvailibilities = [];
      physicsWorld.setObjectVelocityBufferAvailibilities = [];
      physicsWorld.setObjectVelocityXBufferAvailibilities = [];
      physicsWorld.setObjectVelocityYBufferAvailibilities = [];
      physicsWorld.setObjectVelocityZBufferAvailibilities = [];
      physicsWorld.updateBuffer = new Map();
      physicsWorld.velocityUpdateBuffer = new Map();
      physicsWorld.velocityXUpdateBuffer = new Map();
      physicsWorld.velocityYUpdateBuffer = new Map();
      physicsWorld.velocityZUpdateBuffer = new Map();
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
        }
      }
      physicsWorld.ready = true;
    }else{
      for (var i = 0; i<msg.data.length; i++){
        var ary = new Float32Array(msg.data[i]);
        if (ary[0] == 0){
          var bufID = ary[1];
          physicsWorld.updateObjectBuffer[bufID] = ary;
          physicsWorld.updateObjectBufferAvailibilities[bufID] = true;
          var obj = physicsWorld.objectsByID[ary[2]];
          obj.isPhysicsDirty = false;
        }else if (ary[0] == 1){
          var bufID = ary[1];
          physicsWorld.tickBuffer[bufID] = ary;
          physicsWorld.tickBufferAvailibilities[bufID] = true;
        }else if (ary[0] == 2){
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
        }else if (ary[0] == 3){
          var bufID = ary[1];
          physicsWorld.resetObjectVelocityBuffer[bufID] = ary;
          physicsWorld.resetObjectVelocityBufferAvailibilities[bufID] = true;
        }else if (ary[0] == 4){
          var bufID = ary[1];
          physicsWorld.setObjectVelocityBuffer[bufID] = ary;
          physicsWorld.setObjectVelocityBufferAvailibilities[bufID] = true;
        }else if (ary[0] == 5){
          var bufID = ary[1];
          physicsWorld.setObjectVelocityXBuffer[bufID] = ary;
          physicsWorld.setObjectVelocityXBufferAvailibilities[bufID] = true;
        }else if (ary[0] == 6){
          var bufID = ary[1];
          physicsWorld.setObjectVelocityYBuffer[bufID] = ary;
          physicsWorld.setObjectVelocityYBufferAvailibilities[bufID] = true;
        }else if (ary[0] == 7){
          var bufID = ary[1];
          physicsWorld.setObjectVelocityZBuffer[bufID] = ary;
          physicsWorld.setObjectVelocityZBufferAvailibilities[bufID] = true;
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
  for (var i = 0 ; i<this.resetObjectVelocityBuffer.length; i++){
    if (this.resetObjectVelocityBufferAvailibilities[i]){
      var buf = this.resetObjectVelocityBuffer[i];
      buf[0] = 3;
      buf[1] = i;
      buf[2] = this.idsByObjectName[obj.name];
      this.workerMessageHandler.push(buf.buffer);
      this.resetObjectVelocityBufferAvailibilities[i] = false;
      return;
    }
  }
  console.error("[!] PhysicsWorkerBridge.resetObjectVelocity buffer overflow.");
}
