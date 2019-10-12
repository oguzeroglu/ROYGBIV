var LightningHandler = function(){
  if (WORKERS_SUPPORTED){
    this.lightningIDsByLightningName = new Object();
    this.lightningNamesByLightningID = new Object();
    this.worker = new Worker("./js/worker/LightningWorker.js");
    this.worker.addEventListener("message", function(msg){
      var data = msg.data;
      if (data.idResponse){
        lightningHandler.lightningIDsByLightningName[data.lightningName] = data.id;
        lightningHandler.lightningNamesByLightningID[data.id] = data.lightningName;
      }
    });
  }
}

LightningHandler.prototype.isLightningWorkerActive = function(){
  return true;
}

LightningHandler.prototype.reset = function(){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.lightningIDsByLightningName = new Object();
  this.lightningNamesByLightningID = new Object();
  this.worker.postMessage({reset: true});
}

LightningHandler.prototype.onDisableCorrection = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.worker.postMessage({onDisableCorrection: true, lightningName: lightning.name});
}

LightningHandler.prototype.onSetCorrectionProperties = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.worker.postMessage({onSetCorrectionProperties: true, lightningName: lightning.name, correctionRefDistance: lightning.correctionRefDistance, correctionRefLength: lightning.correctionRefLength});
}

LightningHandler.prototype.onLightningCreation = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.worker.postMessage({onLightningCreation: true, lightning: lightning.export()});
}

LightningHandler.prototype.onLightningDeletion = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.worker.postMessage({onLightningDeletion: true, lightningName: lightning.name});
}

LightningHandler.prototype.lightningUpdateFunction = function(lightning, lightningName){
  lightning.update();
}

LightningHandler.prototype.handleActiveLightnings = function(){
  activeLightnings.forEach(this.lightningUpdateFunction);
}
