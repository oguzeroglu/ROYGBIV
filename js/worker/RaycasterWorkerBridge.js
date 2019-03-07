var RaycasterWorkerBridge = function(){
  this.worker = new Worker("/js/worker/RaycasterWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.updateBuffer = new Map();
  this.hasUpdatedTexts = false;
  this.cameraOrientationUpdateBuffer = [new Float32Array(9), new Float32Array(9)];
  this.cameraOrientationUpdateBufferAvailibilities = [true, true];
  this.worker.addEventListener("message", function(msg){
    if (msg.data.type){
      rayCaster.objectsByWorkerID = new Object();
      rayCaster.idsByObjectNames = new Object();
      rayCaster.addedObjectsUpdateBuffer = [];
      rayCaster.addedObjectsUpdateBufferAvailibilities = [];
      rayCaster.objectGroupsUpdateBuffer = new Object();
      for (var i = 0; i<msg.data.ids.length; i++){
        if (msg.data.ids[i].type == "gridSystem"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = gridSystems[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
        }else if (msg.data.ids[i].type == "addedObject"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = addedObjects[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
          for (var x = 0; x<10; x++){
            rayCaster.addedObjectsUpdateBuffer.push(new Float32Array(19));
            rayCaster.addedObjectsUpdateBufferAvailibilities.push(true);
          }
        }else if (msg.data.ids[i].type == "objectGroup"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = objectGroups[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
          var childCount = Object.keys(objectGroups[msg.data.ids[i].name]).length;
          rayCaster.objectGroupsUpdateBuffer[msg.data.ids[i].name] = {
            buffers: [new Float32Array(19), new Float32Array(19), new Float32Array(19)],
            bufferAvailibilities: [true, true, true]
          }
        }else if (msg.data.ids[i].type == "addedText"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = addedTexts[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
        }else{
          throw new Error("Not implemented.");
        }
      }
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
            rayCaster.intersectionTestCallbackFunctions[ary[0]](intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectedObj);
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
          }
        }
      }
    }
  });
  // initialize buffers ********************************************
  this.intersectionTestBuffers = [];
  this.intersectionTestBufferAvailibilities = [];
  this.intersectionTestCallbackFunctions = [];
  for (var i = 0; i<10; i++){
    this.intersectionTestBuffers.push(new Float32Array(8));
    this.intersectionTestBufferAvailibilities.push(true);
    this.intersectionTestCallbackFunctions.push(function(){});
  }
  // ***************************************************************
  this.onShiftPress = function(isPressed){
    rayCaster.worker.postMessage({
      "shiftPress": {isPressed: isPressed}
    })
  }
}

RaycasterWorkerBridge.prototype.flush = function(){
  this.workerMessageHandler.flush();
}

RaycasterWorkerBridge.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.worker.postMessage(new LightweightState());
}

RaycasterWorkerBridge.prototype.updateObject = function(obj){
  this.updateBuffer.set(obj.name, obj);
  if(obj.isAddedText){
    this.hasUpdatedTexts = true;
  }
}

RaycasterWorkerBridge.prototype.issueUpdate = function(obj){
  if (rayCaster.hasUpdatedTexts){
    var cameraOrientationUpdateBufferSent = false;
    for (var i = 0; i<rayCaster.cameraOrientationUpdateBuffer.length; i++){
      if (rayCaster.cameraOrientationUpdateBufferAvailibilities[i]){
        var buf = rayCaster.cameraOrientationUpdateBuffer[i];
        buf[0] = 2;
        buf[1] = i;
        buf[2] = camera.position.x; buf[3] = camera.position.y; buf[4] = camera.position.z;
        buf[5] = camera.quaternion.x; buf[6] = camera.quaternion.y; buf[7] = camera.quaternion.z; buf[8] = camera.quaternion.w;
        rayCaster.workerMessageHandler.push(buf.buffer);
        rayCaster.cameraOrientationUpdateBufferAvailibilities[i] = false;
        cameraOrientationUpdateBufferSent = true;
        return;
      }
    }
    if (!cameraOrientationUpdateBufferSent){
      console.error("[!] RaycasterWorkerBridge.issueUpdate camera orientation buffer overflow.");
    }
    this.hasUpdatedTexts = false;
  }
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
  console.log("HIDE");
}

RaycasterWorkerBridge.prototype.show = function(object){
  console.log("SHOW");
}

RaycasterWorkerBridge.prototype.query = function(point){
  console.log("QUERY");
}
