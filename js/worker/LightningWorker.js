importScripts("../third_party/three.min.js");
importScripts("../engine_objects/Lightning.js");

var IS_WORKER_CONTEXT = true;

var LightningWorker = function(){
  this.reset();
}

LightningWorker.prototype.reset = function(){
  this.lightnings = new Object();
  this.lightningIDsByLightningName = new Object();
  this.idCtr = 0;
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
  }
}
