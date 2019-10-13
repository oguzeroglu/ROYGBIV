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
        lightningHandler.transferableList[1] = data.nodeDefinitions.buffer;
        lightningHandler.transferableList[2] = data.updateBuffer.buffer;
        lightningHandler.handleWorkerUpdate(data);
      }
    });
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
  var nodeDefinitions = transferableMessageBody.nodeDefinitions;
  for (var i = 0; i<transferableMessageBody.updateBuffer.length; i++){
    var curID = transferableMessageBody.updateBuffer[i];
    if (curID == -1){
      break;
    }else{
      var condition = this.editorLightning && !this.isFPSWeaponGUIOpen;
      var lightningName = condition? this.editorLightning.name: this.lightningNamesByLightningID[curID];
      var lightning = condition? this.editorLightning: lightnings[lightningName];
      var nodeDefinitionIndex = condition? 6: this.nodeDefinitionBufferIndicesByLightningName[lightningName] + 6;
      transferableMessageBody.updateBuffer[i] = -1;
      if (!lightning){
        break;
      }
      for (var nodeID in lightning.renderMap){
        var node = lightning.renderMap[nodeID];
        node.startPoint.set(nodeDefinitions[nodeDefinitionIndex], nodeDefinitions[nodeDefinitionIndex + 1], nodeDefinitions[nodeDefinitionIndex + 2]);
        node.endPoint.set(nodeDefinitions[nodeDefinitionIndex + 3], nodeDefinitions[nodeDefinitionIndex + 4], nodeDefinitions[nodeDefinitionIndex + 5]);
        lightning.updateNodePositionInShader(node, true);
        lightning.updateNodePositionInShader(node, false);
        nodeDefinitionIndex += 6;
      }
      lightning.positionBufferAttribute.updateRange.set(0, lightning.positionsLen);
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
  this.worker.postMessage({invalidateTransferableBody: true});
  this.nodeDefinitionBufferIndicesByLightningName = new Object();
  this.hasOwnership = true;
  this.transferableMessageBody = {};
  this.transferableList = [];
  this.transferableMessageBody.cameraPosition = new Float32Array(3);
  this.transferableList.push(this.transferableMessageBody.cameraPosition.buffer);
  var nodeDefinitionCount = 0, updateBufferCount = 0;
  if (!lightning){
    for (var lightningName in lightnings){
      this.nodeDefinitionBufferIndicesByLightningName[lightningName] = nodeDefinitionCount;
      nodeDefinitionCount += 6 + (6 * Object.keys(lightnings[lightningName].renderMap).length);
      updateBufferCount ++;
    }
  }else{
    this.nodeDefinitionBufferIndicesByLightningName[lightning.name] = nodeDefinitionCount;
    nodeDefinitionCount += 6 + (6 * Object.keys(lightning.renderMap).length);
    updateBufferCount ++;
  }
  this.transferableMessageBody.nodeDefinitions = new Float32Array(nodeDefinitionCount);
  this.transferableList.push(this.transferableMessageBody.nodeDefinitions.buffer);
  this.transferableMessageBody.updateBuffer = new Int16Array(updateBufferCount);
  for (var i = 0; i<this.transferableMessageBody.updateBuffer.length; i++){
    this.transferableMessageBody.updateBuffer[i] = -1;
  }
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
  this.worker.postMessage({onLightningCreation: true, lightning: lightning.export(), isEditorLightning: isEditorLightning});
}

LightningHandler.prototype.onLightningDeletion = function(lightning){
  if (!this.isLightningWorkerActive()){
    return;
  }
  delete this.lightningNamesByLightningID[this.lightningIDsByLightningName[lightning.name]];
  delete this.lightningIDsByLightningName[lightning.name];
  delete this.nodeDefinitionBufferIndicesByLightningName[lightning.name];
  this.worker.postMessage({onLightningDeletion: true, lightningName: lightning.name});
}

LightningHandler.prototype.lightningUpdateFunction = function(lightning, lightningName){
  lightning.update();
}

LightningHandler.prototype.fillUpdateBuffer = function(lightning, lightningName){
  if ((mode == 1 || this.isFPSWeaponGUIOpen) && lightning.attachedToFPSWeapon){
    lightning.handleFPSWeaponStartPosition();
  }
  var transferableMessageBody = lightningHandler.transferableMessageBody;
  transferableMessageBody.updateBuffer[lightningHandler.currentUpdateBufferIndex ++] = lightningHandler.lightningIDsByLightningName[lightningName];
  var indexInNodeBuffer = lightningHandler.nodeDefinitionBufferIndicesByLightningName[lightningName];
  transferableMessageBody.nodeDefinitions[indexInNodeBuffer] = lightning.startPoint.x;
  transferableMessageBody.nodeDefinitions[indexInNodeBuffer + 1] = lightning.startPoint.y;
  transferableMessageBody.nodeDefinitions[indexInNodeBuffer + 2] = lightning.startPoint.z;
  transferableMessageBody.nodeDefinitions[indexInNodeBuffer + 3] = lightning.endPoint.x;
  transferableMessageBody.nodeDefinitions[indexInNodeBuffer + 4] = lightning.endPoint.y;
  transferableMessageBody.nodeDefinitions[indexInNodeBuffer + 5] = lightning.endPoint.z;
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
