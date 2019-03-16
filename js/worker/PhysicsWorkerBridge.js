var PhysicsWorkerBridge = function(){
  this.isPhysicsWorkerBridge = true;
  this.worker = new Worker("./js/worker/PhysicsWorker.js");
  this.physicsWorld = new CANNON.World();
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
