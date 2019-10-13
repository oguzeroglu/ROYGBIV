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
        lightningHandler.transferableMessageBody = data;
        lightningHandler.transferableList[0] = data.cameraPosition.buffer;
        lightningHandler.transferableList[1] = data.nodeDefinitions.buffer;
        lightningHandler.transferableList[2] = data.updateBuffer.buffer;
        lightningHandler.handleWorkerUpdate(data);
      }
    });
  }
}

LightningHandler.prototype.isLightningWorkerActive = function(){
  return true;
}

LightningHandler.prototype.handleWorkerUpdate = function(transferableMessageBody){
  var nodeDefinitions = transferableMessageBody.nodeDefinitions;
  for (var i = 0; i<transferableMessageBody.updateBuffer.length; i++){
    var curID = transferableMessageBody.updateBuffer[i];
    if (curID == -1){
      break;
    }else{
      var lightningName = this.lightningNamesByLightningID[curID];
      var lightning = lightnings[lightningName];
      var nodeDefinitionIndex = this.nodeDefinitionBufferIndicesByLightningName[lightningName] + 6;
      transferableMessageBody.updateBuffer[i] = -1;
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
    nodeDefinitionCount += 6 + (6 * Object.keys(lightnings[lightningName].renderMap).length);
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
  delete this.lightningNamesByLightningID[this.lightningIDsByLightningName[lightning.name]];
  delete this.lightningIDsByLightningName[lightning.name];
  delete this.nodeDefinitionBufferIndicesByLightningName[lightning.name];
  this.worker.postMessage({onLightningDeletion: true, lightningName: lightning.name});
  this.initializeTransferableMessageBody();
}

LightningHandler.prototype.lightningUpdateFunction = function(lightning, lightningName){
  lightning.update();
}

LightningHandler.prototype.fillUpdateBuffer = function(lightning, lightningName){
  if (lightning.attachedToFPSWeapon){
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

LightningHandler.prototype.handleActiveLightnings = function(){
  if (!this.isLightningWorkerActive()){
    activeLightnings.forEach(this.lightningUpdateFunction);
  }else if (this.hasOwnership){
    this.currentUpdateBufferIndex = 0;
    this.shouldSend = false;
    activeLightnings.forEach(this.fillUpdateBuffer);
    if (this.shouldSend){
      this.transferableMessageBody.cameraPosition[0] = camera.position.x;
      this.transferableMessageBody.cameraPosition[1] = camera.position.y;
      this.transferableMessageBody.cameraPosition[2] = camera.position.z;
      this.postTransferable();
    }
  }
}
