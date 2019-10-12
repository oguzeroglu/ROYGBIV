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
      }else{

      }
    });
  }
}

LightningHandler.prototype.isLightningWorkerActive = function(){
  return true;
}

LightningHandler.prototype.postTransferable = function(){
  if (!this.hasOwnership){
    return;
  }
  this.worker.postMessage(this.transferableMessageBody, this.transferableList);
  this.hasOwnership = false;
}

LightningHandler.prototype.initializeTransferableMessageBody = function(){
  this.nodeDefinitionBufferIndicesByLightningName = new Object();
  this.hasOwnership = true;
  this.transferableMessageBody = {};
  this.transferableList = [];
  this.transferableMessageBody.cameraPosition = new Float32Array(3);
  this.transferableList.push(this.transferableMessageBody.cameraPosition.buffer);
  var nodeDefinitionCount = 0, updateBufferCount = 0;
  for (var lightningName in lightnings){
    this.nodeDefinitionBufferIndicesByLightningName[lightningName] = nodeDefinitionCount;
    nodeDefinitionCount += (6 * Object.keys(lightnings[lightningName].renderMap).length);
    updateBufferCount ++;
  }
  this.transferableMessageBody.nodeDefinitionCount = new Float32Array(nodeDefinitionCount);
  this.transferableList.push(this.transferableMessageBody.nodeDefinitionCount.buffer);
  this.transferableMessageBody.updateBuffer = new Uint32Array(updateBufferCount);
  this.transferableList.push(this.transferableMessageBody.updateBuffer.buffer);
  this.worker.postMessage({isNodeDefinitionBufferIndices: true, payload: this.nodeDefinitionBufferIndicesByLightningName});
}

LightningHandler.prototype.reset = function(){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.lightningIDsByLightningName = new Object();
  this.lightningNamesByLightningID = new Object();
  this.worker.postMessage({reset: true});
  this.initializeTransferableMessageBody();
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
  this.initializeTransferableMessageBody();
}

LightningHandler.prototype.onLightningDeletion = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.worker.postMessage({onLightningDeletion: true, lightningName: lightning.name});
  this.initializeTransferableMessageBody();
}

LightningHandler.prototype.lightningUpdateFunction = function(lightning, lightningName){
  lightning.update();
}

LightningHandler.prototype.handleActiveLightnings = function(){
  activeLightnings.forEach(this.lightningUpdateFunction);
}
