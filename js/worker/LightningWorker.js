importScripts("../third_party/three.min.js");
importScripts("../engine_objects/Lightning.js");

var IS_WORKER_CONTEXT = true;
var camera = {
  position: {
    x: 0, y: 0, z: 0
  }
};
var REUSABLE_VECTOR = new THREE.Vector3();

var LightningWorker = function(){
  this.reset();
}

LightningWorker.prototype.invalidateTransferableBody = function(){
  if (this.transferableMessageBody){
    delete this.transferableMessageBody;
    delete this.transferableList;
  }
}

LightningWorker.prototype.reset = function(){
  this.lightnings = new Object();
  this.lightningIDsByLightningName = new Object();
  this.idCtr = 0;
  this.nodeDefinitionBufferIndicesByLightningName = new Object();
}

LightningWorker.prototype.onLightningCreation = function(lightningDescription){
  var lightning = new Lightning(lightningDescription.name, lightningDescription.detailThreshold, lightningDescription.maxDisplacement, lightningDescription.count, lightningDescription.colorName, lightningDescription.radius, lightningDescription.roughness);
  lightning.init(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0));
  this.lightnings[this.idCtr ++] = lightning;
  this.lightningIDsByLightningName[lightning.name] = this.idCtr - 1;
  postMessage({idResponse: true, lightningName: lightning.name, id: this.idCtr - 1});
}

LightningWorker.prototype.onLightningDeletion = function(lightningName){
  var id = this.lightningIDsByLightningName[lightningName];
  delete this.lightnings[id];
}

LightningWorker.prototype.onSetCorrectionProperties = function(lightningName, correctionRefDistance, correctionRefLength){
  var lightningID = this.lightningIDsByLightningName[lightningName];
  var lightning = this.lightnings[lightningID];
  lightning.setCorrectionProperties(correctionRefDistance, correctionRefLength);
}

LightningWorker.prototype.onDisableCorrection = function(lightningName){
  var lightningID = this.lightningIDsByLightningName[lightningName];
  var lightning = this.lightnings[lightningID];
  lightning.disableCorrection();
}

LightningWorker.prototype.saveNodeDefinitionBufferIndices = function(payload){
  for (var lightningName in payload){
    this.nodeDefinitionBufferIndicesByLightningName[lightningName] = payload[lightningName];
  }
}

LightningWorker.prototype.update = function(transferableMessageBody){
  camera.position.x = transferableMessageBody.cameraPosition[0];
  camera.position.y = transferableMessageBody.cameraPosition[1];
  camera.position.z = transferableMessageBody.cameraPosition[2];
  for (var i = 0; i<transferableMessageBody.updateBuffer.length; i++){
    var id = transferableMessageBody.updateBuffer[i];
    if (id == -1){
      break;
    }else{
      var lightning = this.lightnings[id];
      var curNodeDefinitionIndex = this.nodeDefinitionBufferIndicesByLightningName[lightning.name];
      lightning.startPoint.set(worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex], worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex + 1], worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex + 2]);
      lightning.endPoint.set(worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex + 3], worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex + 4], worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex + 5]);
      curNodeDefinitionIndex += 6;
      lightning.update();
      for (var nodeID in lightning.renderMap){
        var node = lightning.renderMap[nodeID];
        worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex ++] = node.startPoint.x;
        worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex ++] = node.startPoint.y;
        worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex ++] = node.startPoint.z;
        worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex ++] = node.startPoint.x;
        worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex ++] = node.endPoint.y;
        worker.transferableMessageBody.nodeDefinitions[curNodeDefinitionIndex ++] = node.endPoint.z;
      }
    }
  }
  postMessage(this.transferableMessageBody, this.transferableList);
}

var worker = new LightningWorker();

self.onmessage = function(msg){
  var data = msg.data;
  if (data.onLightningCreation){
    worker.onLightningCreation(data.lightning);
  }else if (data.onLightningDeletion){
    worker.onLightningDeletion(data.lightningName);
  }else if (data.reset){
    worker.reset();
  }else if (data.onSetCorrectionProperties){
    worker.onSetCorrectionProperties(data.lightningName, data.correctionRefDistance, data.correctionRefLength);
  }else if (data.onDisableCorrection){
    worker.onDisableCorrection(data.lightningName);
  }else if (data.isNodeDefinitionBufferIndices){
    worker.saveNodeDefinitionBufferIndices(data.payload);
  }else{
    if (!worker.transferableMessageBody){
      worker.transferableMessageBody = {
        cameraPosition: data.cameraPosition,
        nodeDefinitions: data.nodeDefinitions,
        updateBuffer: data.updateBuffer
      };
      worker.transferableList = [data.cameraPosition.buffer, data.nodeDefinitions.buffer, data.updateBuffer.buffer];
    }else{
      worker.transferableMessageBody.cameraPosition = data.cameraPosition;
      worker.transferableMessageBody.nodeDefinitions = data.nodeDefinitions;
      worker.transferableMessageBody.updateBuffer = data.updateBuffer;
      worker.transferableList[0] = data.cameraPosition.buffer;
      worker.transferableList[1] = data.nodeDefinitions.buffer;
      worker.transferableList[2] = data.updateBuffer.buffer;
    }
    worker.update(data);
  }
}
