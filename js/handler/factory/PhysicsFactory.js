var PhysicsFactory = function(){
  this.cannonWorld = new CANNON.World();
  if (WORKERS_SUPPORTED && !IS_WORKER_CONTEXT){
    this.bridge = new PhysicsWorkerBridge();
  }
  this.init();
}

PhysicsFactory.prototype.turnOffWorker = function(){
  this.workerTurnedOff = true;
  if (this.bridge){
    this.bridge.worker.terminate();
  }
}

PhysicsFactory.prototype.refresh = function(){
  this.cannonWorld = new CANNON.World();
  this.init();
  var elem = this.get();
  if (elem instanceof CANNON.World){
    physicsWorld = this.cannonWorld;
    for (var objName in sceneHandler.getAddedObjects()){
      if (!addedObjects[objName].noMass){
        elem.add(addedObjects[objName].physicsBody);
      }
    }
    for (var objName in sceneHandler.getObjectGroups()){
      if (!objectGroups[objName].noMass){
        elem.add(objectGroups[objName].physicsBody);
      }
    }

    var masses = sceneHandler.getMasses();
    for (var massName in masses){
      elem.add(masses[massName].physicsBody);
    }
    
    sceneHandler.onPhysicsReady();
  }else if (!this.workerTurnedOff){
    elem.refresh();
  }
}

PhysicsFactory.prototype.initPhysics = function(){
  if (this.bridge){
    this.bridge.init();
  }
  this.cannonWorld.quatNormalizeSkip = quatNormalizeSkip;
  this.cannonWorld.quatNormalizeFast = quatNormalizeFast;
  this.cannonWorld.defaultContactMaterial.contactEquationStiffness = contactEquationStiffness;
  this.cannonWorld.defaultContactMaterial.contactEquationRelaxation = contactEquationRelaxation;
  this.cannonWorld.defaultContactMaterial.friction = friction;
  this.cannonWorld.iterations = physicsIterations;
  this.cannonWorld.tolerance = physicsTolerance;
  this.cannonWorld.solver = physicsSolver;
  this.cannonWorld.gravity.set(0, gravityY, 0);
  this.cannonWorld.broadphase = new CANNON.SAPBroadphase(this.cannonWorld);
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
  this.initPhysics();
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
