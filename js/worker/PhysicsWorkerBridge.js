var PhysicsWorkerBridge = function(){
  this.isPhysicsWorkerBridge = true;
  this.worker = new Worker("./js/worker/PhysicsWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.physicsWorld = new CANNON.World();
  this.ready = false;
  this.idsByObjectName = new Object();
  this.objectsByID = new Object();
  this.updateObjectBufferSize = 10;
  this.tickBufferSize = 10;
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
      physicsWorld.updateObjectBufferAvailibilities = [];
      physicsWorld.updateBuffer = new Map();
      for (var i = 0; i<msg.data.ids.length; i++){
        var curIDInfo = msg.data.ids[i];
        physicsWorld.idsByObjectName[curIDInfo.name] = curIDInfo.id;
        var obj = addedObjects[curIDInfo.name] || objectGroups[curIDInfo.name];
        if (!obj){
          throw new Error("[!] PhysicsWorkerBridge object not found.");
        }
        physicsWorld.objectsByID[curIDInfo.id] = obj;
        if (obj.isChangeable){
          for (var i2 = 0; i2<physicsWorld.updateObjectBufferSize; i2++){
            physicsWorld.updateObjectBuffer.push(new Float32Array(10));
            physicsWorld.updateObjectBufferAvailibilities.push(true);
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
        }else if (ary[0] == 1){
          var bufID = ary[1];
          physicsWorld.tickBuffer[bufID] = ary;
          physicsWorld.tickBufferAvailibilities[bufID] = true;
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
  this.updateBuffer.forEach(this.issueUpdate);
  this.updateBuffer.clear();
  var tickSent = false;
  for (var i = 0; i<this.tickBuffer.length; i++){
    if (this.tickBufferAvailibilities[i]){
      var buf = this.tickBuffer[i];
      buf[0] = 1;
      buf[1] = i;
      buf[2] = stepAmount;
      this.workerMessageHandler.push(buf.buffer);
      this.tickBufferAvailibilities[i] = false;
      tickSent = true;
      break;
    }
  }
  if (!tickSent){
    console.warn("[!] PhysicsWorkerBridge.step tick buffer overflow.");
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

PhysicsWorkerBridge.prototype.updateObject = function(obj){
  this.updateBuffer.set(obj.name, obj);
}
