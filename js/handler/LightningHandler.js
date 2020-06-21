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
      }else if (data.performance){
        console.log("%c                    LIGHTNING WORKER                  ", "background: black; color: lime");
        console.log("%cUpdate time: "+data.performance+" ms", "background: black; color: magenta");
      }else{
        lightningHandler.transferableMessageBody = data;
        lightningHandler.transferableList[0] = data.cameraPosition.buffer;
        var i = 1;
        for (var key in data.buffer){
          lightningHandler.transferableList[i++] = data.buffer[key].buffer;
        }
        lightningHandler.transferableList[i] = data.startEndPoints.buffer;
        lightningHandler.transferableList[i+1] = data.updateBuffer.buffer;
        lightningHandler.handleWorkerUpdate(data);
      }
    });
  }
}

LightningHandler.prototype.turnOff = function(){
  if (this.isLightningWorkerActive() || (isDeployment && WORKERS_SUPPORTED && !LIGHTNING_WORKER_ON)){
    this.worker.terminate();
  }
}

LightningHandler.prototype.startRecording = function(){
  if (this.isLightningWorkerActive()){
    this.worker.postMessage({startRecording: true});
  }
}

LightningHandler.prototype.dumpPerformance = function(){
  if (this.isLightningWorkerActive()){
    this.worker.postMessage({dumpPerformance: true});
  }
}

LightningHandler.prototype.isLightningWorkerActive = function(){
  return LIGHTNING_WORKER_ON && WORKERS_SUPPORTED;
}

LightningHandler.prototype.onSwitchToPreviewMode = function(){
  if (this.isLightningWorkerActive()){
    this.initializeTransferableMessageBody();
  }
}

LightningHandler.prototype.handleWorkerUpdate = function(transferableMessageBody){
  for (var i = 0; i<transferableMessageBody.updateBuffer.length; i++){
    var curID = transferableMessageBody.updateBuffer[i];
    if (curID == -1){
      break;
    }else{
      var condition = this.editorLightning && !this.isFPSWeaponGUIOpen;
      var lightningName = condition? this.editorLightning.name: this.lightningNamesByLightningID[curID];
      var lightning = condition? this.editorLightning: lightnings[lightningName];
      transferableMessageBody.updateBuffer[i] = -1;
      if (!lightning){
        break;
      }
      var buf = transferableMessageBody.buffer[lightning.name];
      if (buf.length == lightning.positionBufferAttribute.array.length){
        lightning.positionBufferAttribute.array.set(buf);
        lightning.positionBufferAttribute.updateRange.set(0, lightning.positionsLen);
        lightning.positionBufferAttribute.needsUpdate = true;
      }
    }
  }
  this.hasOwnership = true;
}

LightningHandler.prototype.postTransferable = function(){
  if (!this.hasOwnership){
    return;
  }
  this.worker.postMessage(this.transferableMessageBody, this.transferableList);
  this.hasOwnership = false;
}

LightningHandler.prototype.initializeTransferableMessageBody = function(lightning){
  this.isInitialized = true;
  this.worker.postMessage({invalidateTransferableBody: true});
  this.startEndPointBufferIndicesByLightningName = new Object();
  this.hasOwnership = true;
  this.transferableMessageBody = {buffer: {}};
  this.transferableList = [];
  this.transferableMessageBody.cameraPosition = new Float32Array(3);
  this.transferableList.push(this.transferableMessageBody.cameraPosition.buffer);
  var startEndPointCount = 0, updateBufferCount = 0;
  if (!lightning){
    for (var lightningName in lightnings){
      this.startEndPointBufferIndicesByLightningName[lightningName] = startEndPointCount;
      startEndPointCount += 6;
      updateBufferCount ++;
      this.transferableMessageBody.buffer[lightningName] = lightnings[lightningName].positionsTypedAray.slice();
      this.transferableList.push(this.transferableMessageBody.buffer[lightningName].buffer);
    }
  }else{
    this.startEndPointBufferIndicesByLightningName[lightning.name] = startEndPointCount;
    startEndPointCount += 6;
    updateBufferCount ++;
    this.transferableMessageBody.buffer[lightning.name] = lightning.positionsTypedAray.slice();
    this.transferableList.push(this.transferableMessageBody.buffer[lightning.name].buffer);
  }
  this.transferableMessageBody.startEndPoints = new Float32Array(startEndPointCount);
  this.transferableList.push(this.transferableMessageBody.startEndPoints.buffer);
  this.transferableMessageBody.updateBuffer = new Int16Array(updateBufferCount);
  for (var i = 0; i<this.transferableMessageBody.updateBuffer.length; i++){
    this.transferableMessageBody.updateBuffer[i] = -1;
  }
  this.transferableList.push(this.transferableMessageBody.updateBuffer.buffer);
  this.worker.postMessage({isStartEndPointBufferIndices: true, payload: this.startEndPointBufferIndicesByLightningName});
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

LightningHandler.prototype.onEditorClose = function(){
  if (!this.isLightningWorkerActive()){
    return;
  }
  delete this.isFPSWeaponGUIOpen;
  delete this.editorLightning;
  this.worker.postMessage({onEditorClose: true});
}

LightningHandler.prototype.onFPSWeaponGUIOpened = function(){
  if (this.isLightningWorkerActive()){
    this.isFPSWeaponGUIOpen = true;
    this.initializeTransferableMessageBody();
  }
}

LightningHandler.prototype.onEditorLightningCreation = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  this.onLightningCreation(lightning, true);
  this.initializeTransferableMessageBody(lightning);
}

LightningHandler.prototype.onLightningCreation = function(lightning, isEditorLightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  var descriptionBody = {onLightningCreation: true, lightning: lightning.export(), isEditorLightning: isEditorLightning};
  if (isMobile){
    descriptionBody.lightning.detailThreshold = lightning.mobileDetailThreshold;
  }
  this.worker.postMessage(descriptionBody);
}

LightningHandler.prototype.onLightningDeletion = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  delete this.lightningNamesByLightningID[this.lightningIDsByLightningName[lightning.name]];
  delete this.lightningIDsByLightningName[lightning.name];
  if (this.isInitialized){
    delete this.startEndPointBufferIndicesByLightningName[lightning.name];
  }
  this.worker.postMessage({onLightningDeletion: true, lightningName: lightning.name});
}

LightningHandler.prototype.lightningUpdateFunction = function(lightning, lightningName){
  lightning.update();
}

LightningHandler.prototype.fillUpdateBuffer = function(lightning, lightningName){
  if ((mode == 1 || this.isFPSWeaponGUIOpen) && lightning.attachedToFPSWeapon){
    lightning.handleFPSWeaponStartPosition();
  }
  lightning.mesh.material.uniforms.startPoint.value.copy(lightning.startPoint);
  var transferableMessageBody = lightningHandler.transferableMessageBody;
  transferableMessageBody.updateBuffer[lightningHandler.currentUpdateBufferIndex ++] = lightningHandler.lightningIDsByLightningName[lightningName];
  var indexInNodeBuffer = lightningHandler.startEndPointBufferIndicesByLightningName[lightningName];
  transferableMessageBody.startEndPoints[indexInNodeBuffer] = lightning.startPoint.x;
  transferableMessageBody.startEndPoints[indexInNodeBuffer + 1] = lightning.startPoint.y;
  transferableMessageBody.startEndPoints[indexInNodeBuffer + 2] = lightning.startPoint.z;
  transferableMessageBody.startEndPoints[indexInNodeBuffer + 3] = lightning.endPoint.x;
  transferableMessageBody.startEndPoints[indexInNodeBuffer + 4] = lightning.endPoint.y;
  transferableMessageBody.startEndPoints[indexInNodeBuffer + 5] = lightning.endPoint.z;
  lightningHandler.shouldSend = true;
}

LightningHandler.prototype.handleActiveLightnings = function(lightning){
  this.editorLightning = lightning;
  if (!this.isLightningWorkerActive()){
    if (!lightning){
      activeLightnings.forEach(this.lightningUpdateFunction);
    }else{
      lightning.update();
    }
  }else if (this.hasOwnership){
    this.currentUpdateBufferIndex = 0;
    this.shouldSend = false;
    if (!lightning){
      activeLightnings.forEach(this.fillUpdateBuffer);
    }else{
      this.shouldSend = true;
      this.fillUpdateBuffer(lightning, lightning.name);
    }
    if (this.shouldSend){
      this.transferableMessageBody.cameraPosition[0] = camera.position.x;
      this.transferableMessageBody.cameraPosition[1] = camera.position.y;
      this.transferableMessageBody.cameraPosition[2] = camera.position.z;
      this.postTransferable();
    }
  }
}
