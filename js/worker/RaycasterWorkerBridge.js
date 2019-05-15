var RaycasterWorkerBridge = function(){
  this.record = false;
  this.isRaycasterWorkerBridge = true;
  this.worker = new Worker("./js/worker/RaycasterWorker.js");
  this.ready = false;
  this.updateBuffer = new Map();
  this.addedTextScaleUpdateBuffer = new Map();
  this.particleSystemStatusUpdateBuffer = new Map();
  this.hasOwnership = false;
  this.maxIntersectionCountInAFrame = 10;
  this.curIntersectionTestRequestCount = 0;
  this.performanceLogs = {
    intersectableObjDescriptionLen: 0, intersectionTestDescriptionLen: 0,
    flagsDescriptionLen: 0, cameraOrientationDescriptionLen: 0, addedTextScaleDescriptionLen: 0,
    particleCollisionCallbackDescriptionLen: 0, particleSystemCollisionCallbackDescriptionLen: 0,flushTime: 0
  };
  this.intersectionTestBuffer = {
    isActive: false, fromVectors: [] , directionVectors: [],
    intersectGridSystems: [], callbackFunctions: []
  };
  for (var i = 0 ; i < this.maxIntersectionCountInAFrame; i ++){
    this.intersectionTestBuffer.fromVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.directionVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.intersectGridSystems.push(false);
    this.intersectionTestBuffer.callbackFunctions.push(noop);
  }
  this.worker.addEventListener("message", function(msg){
    if (msg.data.isPerformanceLog){
      console.log("%c                    RAYCASTER WORKER                  ", "background: black; color: lime");
      console.log("%cUpdate time: "+msg.data.updateTime+" ms", "background: black; color: magenta");
      console.log("%cBinhandler cache hit count: "+msg.data.binHandlerCacheHitCount, "background: black; color: magenta");
    }else if (msg.data.type){
      rayCaster.objectsByWorkerID = new Object();
      rayCaster.idsByObjectNames = new Object();
      rayCaster.particleSystemsByWorkerID = new Object();
      rayCaster.idsByParticleSystemNames = new Object();
      for (var i = 0; i<msg.data.ids.length; i++){
        if (msg.data.ids[i].type == "gridSystem"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = gridSystems[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
        }else if (msg.data.ids[i].type == "addedObject"){
          var obj = addedObjects[msg.data.ids[i].name];
          var objWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[objWorkerID] = obj;
          rayCaster.idsByObjectNames[obj.name] = objWorkerID;
        }else if (msg.data.ids[i].type == "objectGroup"){
          var obj = objectGroups[msg.data.ids[i].name];
          var objWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[objWorkerID] = obj;
          rayCaster.idsByObjectNames[obj.name] = objWorkerID;
        }else if (msg.data.ids[i].type == "addedText"){
          var text = addedTexts[msg.data.ids[i].name];
          var textWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[textWorkerID] = text;
          rayCaster.idsByObjectNames[text.name] = textWorkerID;
        }else if (msg.data.ids[i].type == "particleSystem"){
          var particleSystem = particleSystemPool[msg.data.ids[i].name];
          var particleSystemWorkerID = msg.data.ids[i].id;
          rayCaster.particleSystemsByWorkerID[particleSystemWorkerID] = particleSystem;
          rayCaster.idsByParticleSystemNames[particleSystem.name] = particleSystemWorkerID;
        }else{
          throw new Error("Not implemented.");
        }
      }
      // GENERATE TRANSFERABLE MESSAGE BODY
      rayCaster.transferableMessageBody = {};
      rayCaster.transferableList = [];
      var intersectablesAry = [];
      var intersectableArrayIndex = 0;
      for (var objName in addedObjects){
        var obj = addedObjects[objName];
        var insertObjectToBuffer = (mode == 0) || (mode == 1 && obj.isIntersectable && (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)));
        if (insertObjectToBuffer){
          obj.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
          intersectablesAry.push(rayCaster.idsByObjectNames[obj.name]);
          intersectablesAry.push(1);
          obj.mesh.updateMatrixWorld();
          for (var i = 0; i<obj.mesh.matrixWorld.elements.length; i++){
            intersectablesAry.push(obj.mesh.matrixWorld.elements[i]);
          }
          intersectableArrayIndex += obj.mesh.matrixWorld.elements.length + 2;
        }
      }
      for (var objName in objectGroups){
        var obj = objectGroups[objName];
        var insertObjectToBuffer = (mode == 0) || (mode == 1 && obj.isIntersectable && (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)));
        if (insertObjectToBuffer){
          obj.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
          intersectablesAry.push(rayCaster.idsByObjectNames[obj.name]);
          intersectablesAry.push(1);
          obj.mesh.updateMatrixWorld();
          for (var i = 0; i<obj.mesh.matrixWorld.elements.length; i++){
            intersectablesAry.push(obj.mesh.matrixWorld.elements[i]);
          }
          intersectableArrayIndex += obj.mesh.matrixWorld.elements.length + 2;
        }
      }
      var addedTextScaleDescriptionArray = [];
      var addedTextScaleDescriptionIndex = 0;
      for (var textName in addedTexts){
        var text = addedTexts[textName];
        var insertTextToBuffer = (!text.is2D) && ((mode == 0) || (mode == 1 && text.isClickable));
        if (insertTextToBuffer){
          text.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
          text.indexInTextScaleDescriptionArray = addedTextScaleDescriptionIndex;
          intersectablesAry.push(rayCaster.idsByObjectNames[text.name]);
          intersectablesAry.push(1);
          addedTextScaleDescriptionArray.push(rayCaster.idsByObjectNames[text.name]);
          text.mesh.updateMatrixWorld();
          for (var i = 0; i<text.mesh.matrixWorld.elements.length; i++){
            intersectablesAry.push(text.mesh.matrixWorld.elements[i]);
          }
          intersectableArrayIndex += text.mesh.matrixWorld.elements.length + 2;
          addedTextScaleDescriptionArray.push(text.characterSize);
          addedTextScaleDescriptionArray.push(text.bottomRight.x); addedTextScaleDescriptionArray.push(text.bottomRight.y); addedTextScaleDescriptionArray.push(text.bottomRight.z);
          addedTextScaleDescriptionArray.push(text.topRight.x); addedTextScaleDescriptionArray.push(text.topRight.y); addedTextScaleDescriptionArray.push(text.topRight.z);
          addedTextScaleDescriptionArray.push(text.bottomLeft.x); addedTextScaleDescriptionArray.push(text.bottomLeft.y); addedTextScaleDescriptionArray.push(text.bottomLeft.z);
          addedTextScaleDescriptionIndex += 11;
        }
      }
      var particleSystemStatusDescriptionArray = [];
      var particleSystemStatusDescriptionIndex = 0;
      for (var psName in particleSystemPool){
        var particleSystem = particleSystemPool[psName];
        if (particleSystem.shouldSendToWorker()){
          particleSystemStatusDescriptionArray.push(rayCaster.idsByParticleSystemNames[particleSystem.name]);
          particleSystemStatusDescriptionArray.push(PARTICLE_SYSTEM_ACTION_TYPE_NONE);
          particleSystemStatusDescriptionArray.push(-1); particleSystemStatusDescriptionArray.push(-1); particleSystemStatusDescriptionArray.push(-1); particleSystemStatusDescriptionArray.push(-1);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0);
          particleSystem.indexInStatusDescriptionArray = particleSystemStatusDescriptionIndex;
          particleSystemStatusDescriptionIndex += 20;
        }
      }
      var particleCollisionCallbackArray = [];
      var particleSystemCollisionCallbackArray = [];
      for (var uuid in particleCollisionCallbackRequests){
        particleCollisionCallbackArray.push(-1);
      }
      for (var psName in particleSystemPool){
        if (particleSystemPool[psName].isCollidable){
          for (var i = 0; i<13; i++){
            particleSystemCollisionCallbackArray.push(-1);
          }
        }
      }
      var intersectableObjectDescriptionArray = new Float32Array(intersectablesAry);
      var intersectionTestDescription = new Float32Array(8 * rayCaster.maxIntersectionCountInAFrame);
      var particleSystemStatusDescription = new Float32Array(particleSystemStatusDescriptionArray);
      var cameraOrientationDescription = new Float32Array(8);
      var flagsDescription = new Float32Array(4);
      var addedTextScaleDescription = new Float32Array(addedTextScaleDescriptionArray);
      var particleCollisionCallbackDescription = new Float32Array(particleCollisionCallbackArray);
      var particleSystemCollisionCallbackDescription = new Float32Array(particleSystemCollisionCallbackArray);
      rayCaster.transferableMessageBody.intersectableObjDescription = intersectableObjectDescriptionArray;
      rayCaster.transferableList.push(intersectableObjectDescriptionArray.buffer);
      rayCaster.transferableMessageBody.intersectionTestDescription = intersectionTestDescription;
      rayCaster.transferableList.push(intersectionTestDescription.buffer);
      rayCaster.transferableMessageBody.flagsDescription = flagsDescription;
      rayCaster.transferableList.push(flagsDescription.buffer);
      rayCaster.transferableMessageBody.cameraOrientationDescription = cameraOrientationDescription;
      rayCaster.transferableList.push(cameraOrientationDescription.buffer);
      rayCaster.transferableMessageBody.addedTextScaleDescription = addedTextScaleDescription;
      rayCaster.transferableList.push(addedTextScaleDescription.buffer);
      rayCaster.transferableMessageBody.particleSystemStatusDescription = particleSystemStatusDescription;
      rayCaster.transferableList.push(particleSystemStatusDescription.buffer);
      rayCaster.transferableMessageBody.particleCollisionCallbackDescription = particleCollisionCallbackDescription;
      rayCaster.transferableList.push(particleCollisionCallbackDescription.buffer);
      rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription = particleSystemCollisionCallbackDescription;
      rayCaster.transferableList.push(particleSystemCollisionCallbackDescription.buffer);
      rayCaster.hasOwnership = true;
      rayCaster.onReady();
    }else{
      rayCaster.transferableMessageBody= msg.data;
      rayCaster.transferableList[0] = rayCaster.transferableMessageBody.intersectableObjDescription.buffer;
      rayCaster.transferableList[1] = rayCaster.transferableMessageBody.intersectionTestDescription.buffer;
      rayCaster.transferableList[2] = rayCaster.transferableMessageBody.flagsDescription.buffer;
      rayCaster.transferableList[3] = rayCaster.transferableMessageBody.cameraOrientationDescription.buffer;
      rayCaster.transferableList[4] = rayCaster.transferableMessageBody.addedTextScaleDescription.buffer;
      rayCaster.transferableList[5] = rayCaster.transferableMessageBody.particleSystemStatusDescription.buffer;
      rayCaster.transferableList[6] = rayCaster.transferableMessageBody.particleCollisionCallbackDescription.buffer;
      rayCaster.transferableList[7] = rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription.buffer;
      var intersectionTestDescription = rayCaster.transferableMessageBody.intersectionTestDescription;
      if (rayCaster.transferableMessageBody.flagsDescription[1] > 0){
        for (var i = 0; i<intersectionTestDescription.length; i+=8){
          if (intersectionTestDescription[i] < 0){
            break;
          }
          var callbackFunc = rayCaster.intersectionTestBuffer.callbackFunctions[intersectionTestDescription[i]];
          if (intersectionTestDescription[i+1] >= 0){
            var objID = intersectionTestDescription[i+1];
            var intersectedObject = rayCaster.objectsByWorkerID[objID];
            intersectionObject = intersectedObject.name;
            REUSABLE_VECTOR.set(intersectionTestDescription[i+2], intersectionTestDescription[i+3], intersectionTestDescription[i+4]);
            intersectionPoint = REUSABLE_VECTOR;
            callbackFunc(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject)
          }else{
            callbackFunc(0, 0, 0, null);
          }
        }
      }
      for (var i = 0; i<rayCaster.transferableMessageBody.particleCollisionCallbackDescription.length; i++){
        var uuid = rayCaster.transferableMessageBody.particleCollisionCallbackDescription[i];
        if (uuid == -1){
          break;
        }
        if (particleCollisionCallbackRequests[uuid]){
          particleCollisionCallbackRequests[uuid]();
        }
        rayCaster.transferableMessageBody.particleCollisionCallbackDescription[i] = -1;
      }
      for (var i = 0; i<rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription.length; i+=13){

      }
      rayCaster.hasOwnership = true;
    }
  });
  this.onShiftPress = function(isPressed){
    if (mode == 0){
      rayCaster.worker.postMessage({
        "shiftPress": {isPressed: isPressed}
      })
    }
  };
  this.issueAddedTextScaleUpdate = function(text){
    var addedTextScaleDescription = rayCaster.transferableMessageBody.addedTextScaleDescription;
    var i = text.indexInTextScaleDescriptionArray;
    addedTextScaleDescription[i+1] = text.characterSize;
    addedTextScaleDescription[i+2] = text.bottomRight.x; addedTextScaleDescription[i+3] = text.bottomRight.y; addedTextScaleDescription[i+4] = text.bottomRight.z;
    addedTextScaleDescription[i+5] = text.topRight.x; addedTextScaleDescription[i+6] = text.topRight.y; addedTextScaleDescription[i+7] = text.topRight.z;
    addedTextScaleDescription[i+8] = text.bottomLeft.x; addedTextScaleDescription[i+9] = text.bottomLeft.y; addedTextScaleDescription[i+10] = text.bottomLeft.z;
  }
  this.startRecording = function(){
    rayCaster.record = true;
  }
  this.dumpPerformanceLogs = function(){
    console.log("%cFlush time: "+this.performanceLogs.flushTime+" ms.", "background: black; color: magenta");
    console.log("%cObject description array length: "+this.performanceLogs.intersectableObjDescriptionLen, "background: black; color: magenta");
    console.log("%cAdded text scale description length: "+this.performanceLogs.addedTextScaleDescriptionLen, "background: black; color: magenta");
    console.log("%cIntersection test description length: "+this.performanceLogs.intersectionTestDescriptionLen, "background: black; color: magenta");
    console.log("%cFlags description length: "+this.performanceLogs.flagsDescriptionLen, "background: black; color: magenta");
    console.log("%cParticle collision callback description length: "+this.performanceLogs.particleCollisionCallbackDescriptionLen, "background: black; color: magenta");
    console.log("%cParticle system collision callback description length: "+this.performanceLogs.particleSystemCollisionCallbackDescriptionLen, "background: black; color: magenta");
    console.log("%cCamera orientation description length: "+this.performanceLogs.cameraOrientationDescriptionLen, "background: black; color: magenta");
  }
}

RaycasterWorkerBridge.prototype.query = noop;

RaycasterWorkerBridge.prototype.onReady = function(){
  this.ready = true;
  if (this.onReadyCallback){
    this.onReadyCallback();
  }
}

RaycasterWorkerBridge.prototype.flush = function(){
  if (!this.hasOwnership){
    return;
  }
  var flushStartTime;
  if (this.record){
    flushStartTime = performance.now();
    this.performanceLogs.intersectableObjDescriptionLen = this.transferableMessageBody.intersectableObjDescription.length;
    this.performanceLogs.intersectionTestDescriptionLen = this.transferableMessageBody.intersectionTestDescription.length;
    this.performanceLogs.flagsDescriptionLen = this.transferableMessageBody.flagsDescription.length;
    this.performanceLogs.cameraOrientationDescriptionLen = this.transferableMessageBody.cameraOrientationDescription.length;
    this.performanceLogs.addedTextScaleDescriptionLen = this.transferableMessageBody.addedTextScaleDescription.length;
    this.performanceLogs.particleSystemStatusDescriptionLen = this.transferableMessageBody.particleSystemStatusDescription.length;
    this.performanceLogs.particleCollisionCallbackDescriptionLen = this.transferableMessageBody.particleCollisionCallbackDescription.length;
    this.performanceLogs.particleSystemCollisionCallbackDescriptionLen = this.transferableMessageBody.particleSystemCollisionCallbackDescription.length;
  }
  if (this.updateBuffer.size > 0){
    this.updateBuffer.forEach(this.issueUpdate);
    this.updateBuffer.clear();
    this.transferableMessageBody.flagsDescription[0] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[0] = -1;
  }
  if (this.addedTextScaleUpdateBuffer.size > 0){
    this.addedTextScaleUpdateBuffer.forEach(this.issueAddedTextScaleUpdate);
    this.addedTextScaleUpdateBuffer.clear();
    this.transferableMessageBody.flagsDescription[2] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[2] = -1;
  }
  if (this.particleSystemStatusUpdateBuffer.size > 0){
    this.particleSystemStatusUpdateBuffer.forEach(this.issueParticleSystemStatusUpdate);
    this.particleSystemStatusUpdateBuffer.clear();
    this.transferableMessageBody.flagsDescription[3] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[3] = -1;
  }
  if (this.intersectionTestBuffer.isActive){
    var intersectionTestDescription = this.transferableMessageBody.intersectionTestDescription;
    this.transferableMessageBody.flagsDescription[1] = 1;
    var i2 = 0;
    for (var i = 0; i<this.maxIntersectionCountInAFrame; i++){
      if (i < this.curIntersectionTestRequestCount){
        intersectionTestDescription[i2++] = i;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.fromVectors[i].x;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.fromVectors[i].y;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.fromVectors[i].z;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.directionVectors[i].x;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.directionVectors[i].y;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.directionVectors[i].z;
        intersectionTestDescription[i2++] = (this.intersectionTestBuffer.intersectGridSystems[i]? 1: -1)
      }else{
        intersectionTestDescription[i2] = -1;
        i2+=8;
      }
    }
    this.intersectionTestBuffer.isActive = false;
    this.curIntersectionTestRequestCount = 0;
  }else{
    this.transferableMessageBody.flagsDescription[1] = -1;
  }
  var cameraOrientationDescription = this.transferableMessageBody.cameraOrientationDescription;
  cameraOrientationDescription[0] = camera.position.x; cameraOrientationDescription[1] = camera.position.y; cameraOrientationDescription[2] = camera.position.z;
  cameraOrientationDescription[3] = camera.quaternion.x; cameraOrientationDescription[4] = camera.quaternion.y; cameraOrientationDescription[5] = camera.quaternion.z; cameraOrientationDescription[6] = camera.quaternion.w;
  cameraOrientationDescription[7] = camera.aspect;
  this.worker.postMessage(this.transferableMessageBody, this.transferableList);
  this.hasOwnership = false;
  if (this.record){
    this.performanceLogs.flushTime = performance.now() - flushStartTime;
  }
}

RaycasterWorkerBridge.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.ready = false;
  this.hasOwnership = false;
  this.updateBuffer = new Map();
  this.addedTextScaleUpdateBuffer = new Map();
  this.particleSystemStatusUpdateBuffer = new Map();
  this.intersectionTestBuffer = {
    isActive: false, fromVectors: [] , directionVectors: [],
    intersectGridSystems: [], callbackFunctions: []
  };
  for (var i = 0 ; i < this.maxIntersectionCountInAFrame; i ++){
    this.intersectionTestBuffer.fromVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.directionVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.intersectGridSystems.push(false);
    this.intersectionTestBuffer.callbackFunctions.push(noop);
  }
  this.worker.postMessage(new LightweightState());
}

RaycasterWorkerBridge.prototype.onAddedTextResize = function(addedText){
  if (!rayCaster.ready){
    return;
  }
  if (addedText.isEditorHelper){
    return;
  }
  if (!addedText.is2D){
    if (mode == 0 || (mode == 1 && addedText.isClickable)){
      rayCaster.addedTextScaleUpdateBuffer.set(addedText.name, addedText);
    }
  }
}

RaycasterWorkerBridge.prototype.issueParticleSystemStatusUpdate = function(ps){
  var descriptionBuffer = rayCaster.transferableMessageBody.particleSystemStatusDescription;
  var statusDescription = ps.statusDescription;
  var index = ps.indexInStatusDescriptionArray;
  descriptionBuffer[index+1] = statusDescription.type;
  if (statusDescription.type == PARTICLE_SYSTEM_ACTION_TYPE_STOP){
    descriptionBuffer[index+19] = statusDescription.stopDuration;
  }else if (statusDescription.type == PARTICLE_SYSTEM_ACTION_TYPE_START){
    if (statusDescription.isStartPositionDefined){
      descriptionBuffer[index+2] = 1;
      descriptionBuffer[index+6] = statusDescription.startPosition.x;
      descriptionBuffer[index+7] = statusDescription.startPosition.y;
      descriptionBuffer[index+8] = statusDescription.startPosition.z;
    }else{
      descriptionBuffer[index+2] = -1;
    }
    if (statusDescription.isStartVelocityDefined){
      descriptionBuffer[index+3] = 1;
      descriptionBuffer[index+9] = statusDescription.startVelocity.x;
      descriptionBuffer[index+10] = statusDescription.startVelocity.y;
      descriptionBuffer[index+11] = statusDescription.startVelocity.z;
    }else{
      descriptionBuffer[index+3] = -1;
    }
    if (statusDescription.isStartAccelerationDefined){
      descriptionBuffer[index+4] = 1;
      descriptionBuffer[index+12] = statusDescription.startAcceleration.x;
      descriptionBuffer[index+13] = statusDescription.startAcceleration.y;
      descriptionBuffer[index+14] = statusDescription.startAcceleration.z;
    }else{
      descriptionBuffer[index+4] = -1;
    }
    if (statusDescription.isStartQuaternionDefined){
      descriptionBuffer[index+5] = 1;
      descriptionBuffer[index+15] = statusDescription.startQuaternion.x;
      descriptionBuffer[index+16] = statusDescription.startQuaternion.y;
      descriptionBuffer[index+17] = statusDescription.startQuaternion.z;
      descriptionBuffer[index+18] = statusDescription.startQuaternion.z;
    }else{
      descriptionBuffer[index+5] = -1;
    }
  }
}

RaycasterWorkerBridge.prototype.issueUpdate = function(obj){
  obj.mesh.updateMatrixWorld();
  var description = rayCaster.transferableMessageBody.intersectableObjDescription;
  for (var i = obj.indexInIntersectableObjDescriptionArray + 2; i < obj.indexInIntersectableObjDescriptionArray + 18; i++){
    description[i] = obj.mesh.matrixWorld.elements[i - obj.indexInIntersectableObjDescriptionArray - 2]
  }
  if (obj.isHidden){
    description[obj.indexInIntersectableObjDescriptionArray+1] = -1;
  }else{
    description[obj.indexInIntersectableObjDescriptionArray+1] = 1;
  }
}

RaycasterWorkerBridge.prototype.updateObject = function(obj){
  if (mode == 1 && (obj.isAddedObject || obj.isObjectGroup) && !obj.isIntersectable){
    return;
  }
  if (obj.isAddedText && obj.isEditorHelper){
    return;
  }
  this.updateBuffer.set(obj.name, obj);
}

RaycasterWorkerBridge.prototype.findIntersections = function(from, direction, intersectGridSystems, callbackFunction){
  if (this.curIntersectionTestRequestCount < this.maxIntersectionCountInAFrame){
    var i = this.curIntersectionTestRequestCount;
    this.intersectionTestBuffer.isActive = true;
    this.intersectionTestBuffer.fromVectors[i].copy(from);
    this.intersectionTestBuffer.directionVectors[i].copy(direction);
    this.intersectionTestBuffer.intersectGridSystems[i] = intersectGridSystems;
    this.intersectionTestBuffer.callbackFunctions[i] = callbackFunction;
    this.curIntersectionTestRequestCount ++;
  }
}

RaycasterWorkerBridge.prototype.hide = function(object){
  this.updateBuffer.set(object.name, object);
}

RaycasterWorkerBridge.prototype.show = function(object){
  this.updateBuffer.set(object.name, object);
}

RaycasterWorkerBridge.prototype.onParticleSystemStart = function(particleSystem, startConfigurations){
  particleSystem.statusDescription.type = PARTICLE_SYSTEM_ACTION_TYPE_START;
  if (typeof startConfigurations.startPosition == UNDEFINED){
    particleSystem.statusDescription.isStartPositionDefined = false;
  }else{
    particleSystem.statusDescription.isStartPositionDefined = true;
    particleSystem.statusDescription.startPosition.copy(startConfigurations.startPosition);
  }
  if (typeof startConfigurations.startVelocity == UNDEFINED){
    particleSystem.statusDescription.isStartVelocityDefined = false;
  }else{
    particleSystem.statusDescription.isStartVelocityDefined = true;
    particleSystem.statusDescription.startVelocity.copy(startConfigurations.startVelocity);
  }
  if (typeof startConfigurations.startAcceleration == UNDEFINED){
    particleSystem.statusDescription.isStartAccelerationDefined = false;
  }else{
    particleSystem.statusDescription.isStartAccelerationDefined = true;
    particleSystem.statusDescription.startAcceleration.copy(startConfigurations.startAcceleration);
  }
  if (typeof startConfigurations.startQuaternion == UNDEFINED){
    particleSystem.statusDescription.isStartQuaternionDefined = false;
  }else{
    particleSystem.statusDescription.isStartQuaternionDefined = true;
    particleSystem.statusDescription.startQuaternion.copy(startConfigurations.startQuaternion);
  }
  rayCaster.particleSystemStatusUpdateBuffer.set(particleSystem.name, particleSystem);
}

RaycasterWorkerBridge.prototype.onParticleSystemStop = function(particleSystem, stopDuration){
  particleSystem.statusDescription.type = PARTICLE_SYSTEM_ACTION_TYPE_STOP;
  particleSystem.statusDescription.stopDuration = stopDuration;
  rayCaster.particleSystemStatusUpdateBuffer.set(particleSystem.name, particleSystem);
}

RaycasterWorkerBridge.prototype.onParticleSystemHide = function(particleSystem){
  particleSystem.statusDescription.type = PARTICLE_SYSTEM_ACTION_TYPE_HIDE;
  rayCaster.particleSystemStatusUpdateBuffer.set(particleSystem.name, particleSystem);
}
