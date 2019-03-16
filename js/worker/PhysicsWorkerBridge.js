var PhysicsWorkerBridge = function(){
  this.isPhysicsWorkerBridge = true;
  this.worker = new Worker("./js/worker/PhysicsWorker.js");
  this.physicsWorld = new CANNON.World();
  this.ready = false;
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
    }
  });
}

PhysicsWorkerBridge.prototype.debug = function(){
  this.worker.postMessage({isDebug: true});
}

PhysicsWorkerBridge.prototype.refresh = function(){
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

}
