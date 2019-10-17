var RaycasterFactory = function(){
  this.raycaster = new RayCaster();
  if (WORKERS_SUPPORTED && !IS_WORKER_CONTEXT){
    this.raycasterWorkerBridge = new RaycasterWorkerBridge();
  }
  this.init();
}

RaycasterFactory.prototype.turnOffWorker = function(){
  this.workerTurnedOff = true;
  if (this.raycasterWorkerBridge){
    this.raycasterWorkerBridge.worker.terminate();
  }
}

RaycasterFactory.prototype.getNonWorker = function(){
  this.raycaster.refresh();
  return this.raycaster;
}

RaycasterFactory.prototype.refresh = function(){
  var instance = this.get();
  if (instance.isRaycasterWorkerBridge && this.workerTurnedOff){
    instance.onReady();
    return;
  }
  instance.refresh();
}

RaycasterFactory.prototype.test = function(){
  var raycasterMethodCount = (Object.keys(RayCaster.prototype).length);
  var raycasterWorkerBridgeMethodCount = (Object.keys(RaycasterWorkerBridge.prototype).length);
  if (raycasterMethodCount != raycasterWorkerBridgeMethodCount){
    console.error("[!] Method count mismatch between RayCaster and RaycasterWorkerBridge.");
  }
  for (var api in RayCaster.prototype){
    if (!RaycasterWorkerBridge.prototype[api]){
      console.error("[!] API: "+api+" is missing in RaycasterWorkerBridge.");
    }
  }
  for (var api in RaycasterWorkerBridge.prototype){
    if (!RayCaster.prototype[api]){
      console.error("[!] API: "+api+" is missing in RayCaster.");
    }
  }
}

RaycasterFactory.prototype.isWorkerActive = function(){
  return (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && RAYCASTER_WORKER_ON);
}

RaycasterFactory.prototype.init = function(){
  RayCaster.prototype.onParticleSystemStart = noop;
  RayCaster.prototype.onParticleSystemStop = noop;
  RayCaster.prototype.onParticleSystemHide = noop;
  RayCaster.prototype.issueParticleSystemStatusUpdate = noop;
  RayCaster.prototype.onAddedTextResize = noop;
  RayCaster.prototype.onParticleSystemSetCollisionListener = noop;
  RayCaster.prototype.onParticleSystemRemoveCollisionListener = noop;
}

RaycasterFactory.prototype.reset = function(){
  if (WORKERS_SUPPORTED){
    this.raycasterWorkerBridge.worker.terminate();
    this.raycasterWorkerBridge = new RaycasterWorkerBridge();
  }
  this.raycaster = new RayCaster();
}

RaycasterFactory.prototype.get = function(){
  if (IS_WORKER_CONTEXT){
    return this.raycaster;
  }
  if (RAYCASTER_WORKER_ON && WORKERS_SUPPORTED){
    return this.raycasterWorkerBridge;
  }
  return this.raycaster;
}

RaycasterFactory.prototype.startRecording = function(){
  if (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && RAYCASTER_WORKER_ON){
    this.raycasterWorkerBridge.startRecording();
    this.raycasterWorkerBridge.worker.postMessage({startRecording: true});
  }
}

RaycasterFactory.prototype.dumpPerformance = function(){
  if (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && RAYCASTER_WORKER_ON){
    this.raycasterWorkerBridge.worker.postMessage({dumpPerformanceLogs: true});
    console.log("%c                  RAYCASTER WORKER BRIDGE           ", "background: black; color: lime");
    this.raycasterWorkerBridge.dumpPerformanceLogs();
  }
}

RaycasterFactory.prototype.onShiftPress = function(param){
  if (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && RAYCASTER_WORKER_ON){
    this.raycasterWorkerBridge.onShiftPress(param);
  }
}

RaycasterFactory.prototype.onAltPress = function(param){
  if (!IS_WORKER_CONTEXT && WORKERS_SUPPORTED && RAYCASTER_WORKER_ON){
    this.raycasterWorkerBridge.onAltPress(param);
  }
}
