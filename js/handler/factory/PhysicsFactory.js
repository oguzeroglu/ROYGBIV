var PhysicsFactory = function(){
  this.cannonWorld = new CANNON.World();
  if (WORKERS_SUPPORTED && !IS_WORKER_CONTEXT){
    this.bridge = new PhysicsWorkerBridge();
  }
  this.init();
}

PhysicsFactory.prototype.init = function(){
  this.cannonWorld.refresh = noop;
  this.cannonWorld.updateObject = noop;
  this.cannonWorld.resetObjectVelocity = noop;
  this.cannonWorld.setObjectVelocity = noop;
  this.cannonWorld.setObjectVelocityX = noop;
  this.cannonWorld.setObjectVelocityY = noop;
  this.cannonWorld.setObjectVelocityZ = noop;
  this.cannonWorld.applyImpulse = noop;
  this.cannonWorld.show = noop;
  this.cannonWorld.hide = noop;
  this.cannonWorld.setMass = noop;
  this.cannonWorld.setCollisionListener = noop;
  this.cannonWorld.removeCollisionListener = noop;
  this.cannonWorld.ready = true;
}

PhysicsFactory.prototype.reset = function(){
  if (WORKERS_SUPPORTED){
    this.bridge.worker.terminate();
    this.bridge = new PhysicsWorkerBridge();
  }
}

PhysicsFactory.prototype.get = function(){
  if (IS_WORKER_CONTEXT){
    return this.cannonWorld;
  }
  if (PHYSICS_WORKER_ON && WORKERS_SUPPORTED){
    return this.bridge;
  }
  return this.cannonWorld;
}

PhysicsFactory.prototype.startRecording = function(){
  if (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && PHYSICS_WORKER_ON){
    this.bridge.startRecording();
    this.bridge.worker.postMessage({startRecording: true});
  }
}

PhysicsFactory.prototype.dumpPerformance = function(){
  if (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && PHYSICS_WORKER_ON){
    this.bridge.worker.postMessage({dumpPerformanceLogs: true});
    console.log("%c                  PHYSICS WORKER BRIDGE             ", "background: black; color: lime");
    this.bridge.dumpPerformanceLogs();
  }
}
