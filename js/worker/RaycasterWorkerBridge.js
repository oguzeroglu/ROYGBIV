var RaycasterWorkerBridge = function(){
  this.isRaycasterWorkerBridge = true;
  this.worker = new Worker("/js/worker/RaycasterWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.updateBuffer = new Map();
  this.hasUpdatedTexts = false;
  this.objectBufferSize = 10;
  this.textBufferSize = 10;
  this.intersectionTestBufferSize = 10;
  this.cameraOrientationAndViewportBufferSize = 10;
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
            rayCaster.addedTextsUpdateBuffer.push(new Float32Array(39));
            rayCaster.addedTextsUpdateBufferAvailibilities.push(true);
          }
          if (mode == 1 && addedTexts[msg.data.ids[i].name].isClickable && !addedTexts[msg.data.ids[i].name].is2D){
            for (var x = 0; x<rayCaster.hideShowBufferSize; x++){
              rayCaster.hideShowBuffer.push(new Float32Array(3));
              rayCaster.hideShowBufferAvailibilities.push(true);
            }
          }else if (mode == 0){
            for (var x = 0; x<rayCaster.hideShowBufferSize; x++){
              rayCaster.hideShowBuffer.push(new Float32Array(3));
              rayCaster.hideShowBufferAvailibilities.push(true);
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
            rayCaster.viewportUpdateBuffer[bufID] = ary;
            rayCaster.viewportUpdateBufferAvailibilities[bufID] = true;
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
  this.viewportUpdateBuffer = [];
  this.viewportUpdateBufferAvailibilities = [];
  for (var i = 0; i<this.intersectionTestBufferSize; i++){
    this.intersectionTestBuffers.push(new Float32Array(8));
    this.intersectionTestBufferAvailibilities.push(true);
    this.intersectionTestCallbackFunctions.push(function(){});
  }
  for (var i = 0; i<this.cameraOrientationAndViewportBufferSize; i++){
    this.cameraOrientationUpdateBuffer.push(new Float32Array(10));
    this.cameraOrientationUpdateBufferAvailibilities.push(true);
    this.viewportUpdateBuffer.push(new Float32Array(7));
    this.viewportUpdateBufferAvailibilities.push(true);
  }
  // ***************************************************************
  this.onShiftPress = function(isPressed){
    rayCaster.worker.postMessage({
      "shiftPress": {isPressed: isPressed}
    })
  }
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
  if (rayCaster.hasUpdatedTexts){
    var cameraOrientationUpdateBufferSent = false;
    var viewportUpdateBufferSent = false;
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
    for (var i = 0; i<rayCaster.viewportUpdateBuffer.length; i++){
      if (rayCaster.viewportUpdateBufferAvailibilities[i]){
        var buf = rayCaster.viewportUpdateBuffer[i];
        var vp = renderer.getCurrentViewport();
        buf[0] = 3;
        buf[1] = i;
        buf[2] = vp.x; buf[3] = vp.y; buf[4] = vp.z; buf[5] = vp.w;
        buf[6] = screenResolution;
        rayCaster.workerMessageHandler.push(buf.buffer);
        rayCaster.viewportUpdateBufferAvailibilities[i] = false;
        viewportUpdateBufferSent = true;
        break;
      }
    }
    if (!cameraOrientationUpdateBufferSent){
      console.error("[!] RaycasterWorkerBridge.issueUpdate camera orientation buffer overflow.");
    }
    if (!viewportUpdateBufferSent){
      console.error("[!] RaycasterWorkerBridge.issueUpdate viewport buffer overflow.");
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
    console.error("[!] RaycasterWorkerBridge.issueUpdate added object buffer overflow.");
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
    console.error("[!] RaycasterWorkerBridge.issueUpdate object group buffer overflow.");
  }else if (obj.isAddedText){
    if (!rayCaster.addedTextsUpdateBuffer){
      return;
    }
    var len = rayCaster.addedTextsUpdateBuffer.length;
    for (var i = 0; i<len; i++){
      if (rayCaster.addedTextsUpdateBufferAvailibilities[i]){
        var buf = rayCaster.addedTextsUpdateBuffer[i];
        buf[0] = 4;
        buf[1] = i;
        buf[2] = rayCaster.idsByObjectNames[obj.name];
        var mesh = obj.mesh;
        buf[3] = mesh.position.x; buf[4] = mesh.position.y; buf[5] = mesh.position.z;
        buf[6] = mesh.quaternion.x; buf[7] = mesh.quaternion.y; buf[8] = mesh.quaternion.z; buf[9] = mesh.quaternion.w;
        buf.set(mesh.modelViewMatrix.elements, 10);
        buf[26] = obj.characterSize;
        buf[27] = obj.topLeft.x; buf[28] = obj.topLeft.y; buf[29] = obj.topLeft.z;
        buf[30] = obj.bottomRight.x; buf[31] = obj.bottomRight.y; buf[32] = obj.bottomRight.z;
        buf[33] = obj.topRight.x; buf[34] = obj.topRight.y; buf[35] = obj.topRight.z;
        buf[36] = obj.bottomLeft.x; buf[37] = obj.bottomLeft.y; buf[38] = obj.bottomLeft.z;
        rayCaster.workerMessageHandler.push(buf.buffer);
        rayCaster.addedTextsUpdateBufferAvailibilities[i] = false;
        return;
      }
    }
    console.error("[!] RaycasterWorkerBridge.issueUpdate added text buffer overflow.");
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
    console.error("[!] RaycasterWorkerBridge.findIntersections buffer overflow.");
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
  console.error("[!] RaycasterWorkerBridge.hide buffer overflow.");
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
  console.error("[!] RaycasterWorkerBridge.show buffer overflow.");
}


RaycasterWorkerBridge.prototype.query = function(point){
  throw new Error("not implemented.");
}
