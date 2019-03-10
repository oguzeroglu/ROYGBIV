var RaycasterWorkerBridge = function(){
  this.isRaycasterWorkerBridge = true;
  this.worker = new Worker("./js/worker/RaycasterWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.updateBuffer = new Map();
  this.textScaleUpdateBuffer = new Map();
  this.hasUpdatedTexts = false;
  this.objectBufferSize = 10;
  this.textBufferSize = 10;
  this.textScaleBufferSize = 10;
  this.intersectionTestBufferSize = 10;
  this.cameraOrientationBufferSize = 10;
  this.hideShowBufferSize = 10;
  this.ready = false;
  this.worker.addEventListener("message", function(msg){
    if (msg.data.type){
      rayCaster.objectsByWorkerID = new Object();
      rayCaster.idsByObjectNames = new Object();
      rayCaster.addedObjectsUpdateBuffer = [];
      rayCaster.addedObjectsUpdateBufferAvailibilities = [];
      rayCaster.objectGroupsUpdateBuffer = new Object();
      rayCaster.addedTextsUpdateBuffer = [];
      rayCaster.addedTextsUpdateBufferAvailibilities = [];
      rayCaster.addedTextsScaleUpdateBuffer = [];
      rayCaster.addedTextsScaleUpdateBufferAvailibilities = [];
      rayCaster.hideShowBuffer = [];
      rayCaster.hideShowBufferAvailibilities = [];
      for (var i = 0; i<msg.data.ids.length; i++){
        if (msg.data.ids[i].type == "gridSystem"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = gridSystems[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
        }else if (msg.data.ids[i].type == "addedObject"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = addedObjects[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
          for (var x = 0; x<rayCaster.objectBufferSize; x++){
            rayCaster.addedObjectsUpdateBuffer.push(new Float32Array(19));
            rayCaster.addedObjectsUpdateBufferAvailibilities.push(true);
          }
          if (mode == 1 && addedObjects[msg.data.ids[i].name].isChangeable){
            for (var x = 0; x<rayCaster.hideShowBufferSize; x++){
              rayCaster.hideShowBuffer.push(new Float32Array(3));
              rayCaster.hideShowBufferAvailibilities.push(true);
            }
          }
        }else if (msg.data.ids[i].type == "objectGroup"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = objectGroups[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
          rayCaster.objectGroupsUpdateBuffer[msg.data.ids[i].name] = {
            buffers: [],
            bufferAvailibilities: []
          }
          for (var x = 0; x<rayCaster.objectBufferSize; x++){
            rayCaster.objectGroupsUpdateBuffer[msg.data.ids[i].name].buffers.push(new Float32Array(19));
            rayCaster.objectGroupsUpdateBuffer[msg.data.ids[i].name].bufferAvailibilities.push(true);
          }
          if (mode == 1 && objectGroups[msg.data.ids[i].name].isChangeable){
            for (var x = 0; x<rayCaster.hideShowBufferSize; x++){
              rayCaster.hideShowBuffer.push(new Float32Array(3));
              rayCaster.hideShowBufferAvailibilities.push(true);
            }
          }
        }else if (msg.data.ids[i].type == "addedText"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = addedTexts[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
          for (var x = 0; x<rayCaster.textBufferSize; x++){
            rayCaster.addedTextsUpdateBuffer.push(new Float32Array(6));
            rayCaster.addedTextsUpdateBufferAvailibilities.push(true);
          }
          if (mode == 0 || (mode == 1 && addedTexts[msg.data.ids[i].name].isClickable && !addedTexts[msg.data.ids[i].name].is2D)){
            for (var x = 0; x<rayCaster.hideShowBufferSize; x++){
              rayCaster.hideShowBuffer.push(new Float32Array(3));
              rayCaster.hideShowBufferAvailibilities.push(true);
            }
            for (var x = 0; x<rayCaster.cameraOrientationBufferSize; x++){
              rayCaster.cameraOrientationUpdateBuffer.push(new Float32Array(10));
              rayCaster.cameraOrientationUpdateBufferAvailibilities.push(true);
            }
            for (var x = 0; x<rayCaster.textScaleBufferSize; x++){
              rayCaster.addedTextsScaleUpdateBuffer.push(new Float32Array(13));
              rayCaster.addedTextsScaleUpdateBufferAvailibilities.push(true);
            }
          }
        }else{
          throw new Error("Not implemented.");
        }
      }
      rayCaster.onReady();
    }else{
      for (var i = 0; i<msg.data.length; i++){
        var ary = new Float32Array(msg.data[i]);
        if (ary.length == 8){
          rayCaster.intersectionTestBuffers[ary[0]] = ary;
          rayCaster.intersectionTestBufferAvailibilities[ary[0]] = true;
          if (ary[1] > -1){
            var intersectedObj = rayCaster.objectsByWorkerID[ary[1]];
            intersectionObject = intersectedObj.name;
            REUSABLE_VECTOR.set(ary[2], ary[3], ary[4]);
            intersectionPoint = REUSABLE_VECTOR;
            rayCaster.intersectionTestCallbackFunctions[ary[0]](intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject);
          }else{
            rayCaster.intersectionTestCallbackFunctions[ary[0]](0, 0, 0, null);
          }
        }else{
          if (ary[0] == 0){
            var bufID = ary[1];
            rayCaster.addedObjectsUpdateBuffer[bufID] = ary;
            rayCaster.addedObjectsUpdateBufferAvailibilities[bufID] = true;
          }else if (ary[0] == 1){
            var obj = rayCaster.objectsByWorkerID[ary[2]];
            var bufID = ary[1];
            rayCaster.objectGroupsUpdateBuffer[obj.name].buffers[bufID] = ary;
            rayCaster.objectGroupsUpdateBuffer[obj.name].bufferAvailibilities[bufID] = true;
          }else if (ary[0] == 2){
            var bufID = ary[1];
            rayCaster.cameraOrientationUpdateBuffer[bufID] = ary;
            rayCaster.cameraOrientationUpdateBufferAvailibilities[bufID] = true;
          }else if (ary[0] == 3){
            var bufID = ary[1];
            rayCaster.addedTextsScaleUpdateBuffer[bufID] = ary;
            rayCaster.addedTextsScaleUpdateBufferAvailibilities[bufID] = true;
          }else if (ary[0] == 4){
            var bufID = ary[1];
            rayCaster.addedTextsUpdateBuffer[bufID] = ary;
            rayCaster.addedTextsUpdateBufferAvailibilities[bufID] = true;
          }else if (ary[0] == 5 || ary[0] == 6){
            var bufID = ary[1];
            rayCaster.hideShowBuffer[bufID] = ary;
            rayCaster.hideShowBufferAvailibilities[bufID] = true;
          }
        }
      }
    }
  });
  // initialize buffers ********************************************
  this.intersectionTestBuffers = [];
  this.intersectionTestBufferAvailibilities = [];
  this.intersectionTestCallbackFunctions = [];
  this.cameraOrientationUpdateBuffer = [];
  this.cameraOrientationUpdateBufferAvailibilities = [];
  for (var i = 0; i<this.intersectionTestBufferSize; i++){
    this.intersectionTestBuffers.push(new Float32Array(8));
    this.intersectionTestBufferAvailibilities.push(true);
    this.intersectionTestCallbackFunctions.push(function(){});
  }
  // ***************************************************************
  this.onShiftPress = function(isPressed){
    if (mode == 0){
      rayCaster.worker.postMessage({
        "shiftPress": {isPressed: isPressed}
      })
    }
  };
  this.updateAddedTextScale = function(addedText){
    var scaleBufferSent = false;
    var len = rayCaster.addedTextsScaleUpdateBuffer.length;
    for (var i = 0; i<len; i++){
      if (rayCaster.addedTextsScaleUpdateBufferAvailibilities[i]){
        var buf = rayCaster.addedTextsScaleUpdateBuffer[i];
        buf[0] = 3;
        buf[1] = i;
        buf[2] = rayCaster.idsByObjectNames[addedText.name];
        buf[3] = addedText.characterSize;
        buf[4] = addedText.bottomRight.x; buf[5] = addedText.bottomRight.y; buf[6] = addedText.bottomRight.z;
        buf[7] = addedText.topRight.x; buf[8] = addedText.topRight.y; buf[9] = addedText.topRight.z;
        buf[10] = addedText.bottomLeft.x; buf[11] = addedText.bottomLeft.y; buf[12] = addedText.bottomLeft.z;
        rayCaster.workerMessageHandler.push(buf.buffer);
        rayCaster.addedTextsScaleUpdateBufferAvailibilities[i] = false;
        rayCaster.workerMessageHandler.flush();
        scaleBufferSent = true;
        return;
      }
    }
    if (!scaleBufferSent){
      console.warn("[!] RaycasterWorkerBridge.issueUpdate text scale buffer overflow.");
    }
  };
}

RaycasterWorkerBridge.prototype.onReady = function(){
  this.ready = true;
  if (this.onReadyCallback){
    this.onReadyCallback();
  }
}

RaycasterWorkerBridge.prototype.flush = function(){
  this.workerMessageHandler.flush();
}

RaycasterWorkerBridge.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.ready = false;
  this.worker.postMessage(new LightweightState());
}

RaycasterWorkerBridge.prototype.onAddedTextResize = function(addedText){
  if (!addedText.is2D){
    if (mode == 0 || (mode == 1 && addedText.isClickable)){
      rayCaster.textScaleUpdateBuffer.set(addedText.name, addedText);
    }
  }
}

RaycasterWorkerBridge.prototype.updateObject = function(obj){
  if (mode == 1 && (obj.isAddedObject || obj.isObjectGroup) && !obj.isIntersectable){
    return;
  }
  this.updateBuffer.set(obj.name, obj);
  if(obj.isAddedText){
    this.hasUpdatedTexts = true;
  }
}

RaycasterWorkerBridge.prototype.onBeforeUpdate = function(){
  rayCaster.textScaleUpdateBuffer.forEach(rayCaster.updateAddedTextScale);
  rayCaster.textScaleUpdateBuffer.clear();
  if (rayCaster.hasUpdatedTexts){
    var cameraOrientationUpdateBufferSent = false;
    for (var i = 0; i<rayCaster.cameraOrientationUpdateBuffer.length; i++){
      if (rayCaster.cameraOrientationUpdateBufferAvailibilities[i]){
        var buf = rayCaster.cameraOrientationUpdateBuffer[i];
        buf[0] = 2;
        buf[1] = i;
        buf[2] = camera.position.x; buf[3] = camera.position.y; buf[4] = camera.position.z;
        buf[5] = camera.quaternion.x; buf[6] = camera.quaternion.y; buf[7] = camera.quaternion.z; buf[8] = camera.quaternion.w;
        buf[9] = camera.aspect;
        rayCaster.workerMessageHandler.push(buf.buffer);
        rayCaster.cameraOrientationUpdateBufferAvailibilities[i] = false;
        cameraOrientationUpdateBufferSent = true;
        break;
      }
    }
    if (!cameraOrientationUpdateBufferSent){
      console.warn("[!] RaycasterWorkerBridge.issueUpdate camera orientation buffer overflow.");
    }
    this.hasUpdatedTexts = false;
  }
}

RaycasterWorkerBridge.prototype.issueUpdate = function(obj){
  if (obj.isAddedObject){
    var len = rayCaster.addedObjectsUpdateBuffer.length;
    for (var i = 0; i < len; i++){
      if (rayCaster.addedObjectsUpdateBufferAvailibilities[i]){
        var buf = rayCaster.addedObjectsUpdateBuffer[i];
        buf[0] = 0;
        buf[1] = i;
        buf[2] = rayCaster.idsByObjectNames[obj.name];
        buf.set(obj.mesh.matrixWorld.elements, 3);
        rayCaster.workerMessageHandler.push(buf.buffer);
        rayCaster.addedObjectsUpdateBufferAvailibilities[i] = false;
        return;
      }
    }
    console.warn("[!] RaycasterWorkerBridge.issueUpdate added object buffer overflow.");
  }else if (obj.isObjectGroup){
    var objectGroupUpdateBuffer = rayCaster.objectGroupsUpdateBuffer[obj.name];
    var len = objectGroupUpdateBuffer.buffers.length;
    for (var i = 0; i<len; i++){
      if (objectGroupUpdateBuffer.bufferAvailibilities[i]){
        var buf = objectGroupUpdateBuffer.buffers[i];
        buf[0] = 1;
        buf[1] = i;
        buf[2] = rayCaster.idsByObjectNames[obj.name];
        buf.set(obj.mesh.matrixWorld.elements, 3);
        rayCaster.workerMessageHandler.push(buf.buffer);
        objectGroupUpdateBuffer.bufferAvailibilities[i] = false;
        return;
      }
    }
    console.warn("[!] RaycasterWorkerBridge.issueUpdate object group buffer overflow.");
  }else if (obj.isAddedText){
    if (!rayCaster.addedTextsUpdateBuffer){
      return;
    }
    var updateAddedTextPosition = false;
    if (!rayCaster.addedTextPositionUpdateCache){
      rayCaster.addedTextPositionUpdateCache = new Object();
      rayCaster.addedTextPositionUpdateCache[obj.name] = new THREE.Vector3();
      updateAddedTextPosition = true;
    }else if (!rayCaster.addedTextPositionUpdateCache[obj.name]){
      rayCaster.addedTextPositionUpdateCache[obj.name] = new THREE.Vector3();
      updateAddedTextPosition = true;
    }else{
      var cache = rayCaster.addedTextPositionUpdateCache[obj.name]
      updateAddedTextPosition = ((cache.x != obj.mesh.position.x) || (cache.y != obj.mesh.position.y) || (cache.z != obj.mesh.position.z));
    }
    if (updateAddedTextPosition){
      var len = rayCaster.addedTextsUpdateBuffer.length;
      for (var i = 0; i<len; i++){
        if (rayCaster.addedTextsUpdateBufferAvailibilities[i]){
          var buf = rayCaster.addedTextsUpdateBuffer[i];
          buf[0] = 4;
          buf[1] = i;
          buf[2] = rayCaster.idsByObjectNames[obj.name];
          buf[3] = obj.mesh.position.x; buf[4] = obj.mesh.position.y; buf[5] = obj.mesh.position.z;
          rayCaster.workerMessageHandler.push(buf.buffer);
          rayCaster.addedTextsUpdateBufferAvailibilities[i] = false;
          rayCaster.addedTextPositionUpdateCache[obj.name].set(obj.mesh.position.x, obj.mesh.position.y, obj.mesh.position.z);
          return;
        }
      }
      console.warn("[!] RaycasterWorkerBridge.issueUpdate added text buffer overflow.");
    }
  }
}


RaycasterWorkerBridge.prototype.findIntersections = function(from, direction, intersectGridSystems, callbackFunction){
  var len = this.intersectionTestBuffers.length;
  var sent = false;
  for (var i = 0; i<len; i++){
    if (this.intersectionTestBufferAvailibilities[i]){
      var ary = this.intersectionTestBuffers[i];
      ary[0] = i; ary[1] = from.x; ary[2] = from.y; ary[3] = from.z;
      ary[4] = direction.x; ary[5] = direction.y; ary[6] = direction.z;
      ary[7] = (intersectGridSystems? 1: 0)
      var buf = ary.buffer;
      rayCaster.workerMessageHandler.push(buf);
      this.intersectionTestBufferAvailibilities[i] = false;
      this.intersectionTestCallbackFunctions[i] = callbackFunction;
      sent = true;
      break;
    }
  }
  if (!sent){
    console.warn("[!] RaycasterWorkerBridge.findIntersections buffer overflow.");
  }
}

RaycasterWorkerBridge.prototype.hide = function(object){
  var len = this.hideShowBuffer.length;
  for (var i = 0; i<len; i++){
    if (this.hideShowBufferAvailibilities[i]){
      var ary = this.hideShowBuffer[i];
      ary[0] = 5;
      ary[1] = i;
      ary[2] = this.idsByObjectNames[object.name];
      this.workerMessageHandler.push(ary.buffer);
      this.hideShowBufferAvailibilities[i] = false;
      return;
    }
  }
  console.warn("[!] RaycasterWorkerBridge.hide buffer overflow.");
}

RaycasterWorkerBridge.prototype.show = function(object){
  var len = this.hideShowBuffer.length;
  for (var i = 0; i<len; i++){
    if (this.hideShowBufferAvailibilities[i]){
      var ary = this.hideShowBuffer[i];
      ary[0] = 6;
      ary[1] = i;
      ary[2] = this.idsByObjectNames[object.name];
      this.workerMessageHandler.push(ary.buffer);
      this.hideShowBufferAvailibilities[i] = false;
      return;
    }
  }
  console.warn("[!] RaycasterWorkerBridge.show buffer overflow.");
}


RaycasterWorkerBridge.prototype.query = function(point){
  throw new Error("not implemented.");
}
