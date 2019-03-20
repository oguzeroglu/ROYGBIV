var RaycasterWorkerBridge = function(){
  this.isRaycasterWorkerBridge = true;
  this.worker = new Worker("./js/worker/RaycasterWorker.js");
  this.workerMessageHandler = new WorkerMessageHandler(this.worker);
  this.updateBuffer = new Map();
  this.textScaleUpdateBuffer = new Map();
  this.hasUpdatedTexts = false;
  this.intersectionTestBufferSize = 10;
  this.ready = false;
  this.worker.addEventListener("message", function(msg){
    if (msg.data.type){
      rayCaster.objectsByWorkerID = new Object();
      rayCaster.idsByObjectNames = new Object();
      for (var i = 0; i<msg.data.ids.length; i++){
        if (msg.data.ids[i].type == "gridSystem"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = gridSystems[msg.data.ids[i].name];
          rayCaster.idsByObjectNames[msg.data.ids[i].name] = msg.data.ids[i].id;
        }else if (msg.data.ids[i].type == "addedObject"){
          var obj = addedObjects[msg.data.ids[i].name];
          var objWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[objWorkerID] = obj;
          rayCaster.idsByObjectNames[obj.name] = objWorkerID;
          obj.raycasterUpdateBuffer = new Float32Array(18);
          obj.raycasterUpdateBufferAvailibility = true;
          obj.raycasterUpdateBuffer[0] = 0; obj.raycasterUpdateBuffer[1] = objWorkerID;
          if (mode == 1 && obj.isChangeable){
            obj.raycasterHideBuffer = new Float32Array(2);
            obj.raycasterShowBuffer = new Float32Array(2);
            obj.raycasterHideBuffer[0] = 5;
            obj.raycasterShowBuffer[0] = 6;
            obj.raycasterHideBuffer[1] = objWorkerID;
            obj.raycasterShowBuffer[1] = objWorkerID;
            obj.raycasterHideBufferAvailibility = true;
            obj.raycasterShowBufferAvailibility = true;
          }
          obj.raycasterAvailibilityModifierBuffer = new Map();
        }else if (msg.data.ids[i].type == "objectGroup"){
          var obj = objectGroups[msg.data.ids[i].name];
          var objWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[objWorkerID] = obj;
          rayCaster.idsByObjectNames[obj.name] = objWorkerID;
          obj.raycasterUpdateBuffer = new Float32Array(18);
          obj.raycasterUpdateBufferAvailibility = true;
          obj.raycasterUpdateBuffer[0] = 1; obj.raycasterUpdateBuffer[1] = objWorkerID;
          if (mode == 1 && objectGroups[msg.data.ids[i].name].isChangeable){
            obj.raycasterHideBuffer = new Float32Array(2);
            obj.raycasterShowBuffer = new Float32Array(2);
            obj.raycasterHideBuffer[0] = 5;
            obj.raycasterShowBuffer[0] = 6;
            obj.raycasterHideBuffer[1] = objWorkerID;
            obj.raycasterShowBuffer[1] = objWorkerID;
            obj.raycasterHideBufferAvailibility = true;
            obj.raycasterShowBufferAvailibility = true;
          }
          obj.raycasterAvailibilityModifierBuffer = new Map();
        }else if (msg.data.ids[i].type == "addedText"){
          var text = addedTexts[msg.data.ids[i].name];
          var textWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[textWorkerID] = text;
          rayCaster.idsByObjectNames[text.name] = textWorkerID;
          text.raycasterUpdateBuffer = new Float32Array(5);
          text.raycasterUpdateBufferAvailibility = true;
          text.raycasterUpdateBuffer[0] = 4; text.raycasterUpdateBuffer[1] = textWorkerID;
          text.raycasterScaleUpdateBuffer = new Float32Array(12);
          text.raycasterScaleUpdateBufferAvailibility = true;
          text.raycasterScaleUpdateBuffer[0] = 3; text.raycasterScaleUpdateBuffer[1] = textWorkerID;
          if (mode == 0 || (mode == 1 && addedTexts[msg.data.ids[i].name].isClickable && !addedTexts[msg.data.ids[i].name].is2D)){
            text.raycasterHideBuffer = new Float32Array(2);
            text.raycasterShowBuffer = new Float32Array(2);
            text.raycasterHideBuffer[0] = 5;
            text.raycasterShowBuffer[0] = 6;
            text.raycasterHideBuffer[1] = textWorkerID;
            text.raycasterShowBuffer[1] = textWorkerID;
            text.raycasterHideBufferAvailibility = true;
            text.raycasterShowBufferAvailibility = true;
          }
          text.raycasterAvailibilityModifierBuffer = new Map();
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
            var objID = ary[1];
            var obj = rayCaster.objectsByWorkerID[objID];
            obj.raycasterUpdateBuffer = ary;
            obj.raycasterUpdateBufferAvailibility = true;
          }else if (ary[0] == 1){
            var objID = ary[1];
            var obj = rayCaster.objectsByWorkerID[objID];
            obj.raycasterUpdateBuffer = ary;
            obj.raycasterUpdateBufferAvailibility = true;
          }else if (ary[0] == 2){
            rayCaster.cameraOrientationBuffer = ary;
            rayCaster.cameraOrientationBufferAvailibility = true;
          }else if (ary[0] == 3){
            var objID = ary[1];
            var obj = rayCaster.objectsByWorkerID[objID];
            obj.raycasterScaleUpdateBuffer = ary;
            obj.raycasterScaleUpdateBufferAvailibility = true;
          }else if (ary[0] == 4){
            var textID = ary[1];
            var text = rayCaster.objectsByWorkerID[textID];
            text.raycasterUpdateBuffer = ary;
            text.raycasterUpdateBufferAvailibility = true;
          }else if (ary[0] == 5){
            var id = ary[1];
            var obj = rayCaster.objectsByWorkerID[id];
            obj.raycasterHideBuffer = ary;
            obj.raycasterHideBufferAvailibility = true;
          }else if (ary[0] == 6){
            var id = ary[1];
            var obj = rayCaster.objectsByWorkerID[id];
            obj.raycasterShowBuffer = ary;
            obj.raycasterShowBufferAvailibility = true;
          }
        }
      }
    }
  });
  // initialize buffers ********************************************
  this.intersectionTestBuffers = [];
  this.intersectionTestBufferAvailibilities = [];
  this.intersectionTestCallbackFunctions = [];
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
    if (!addedText.raycasterScaleUpdateBufferAvailibility){
      return;
    }
    var buf = addedText.raycasterScaleUpdateBuffer;
    buf[2] = addedText.characterSize;
    buf[3] = addedText.bottomRight.x; buf[4] = addedText.bottomRight.y; buf[5] = addedText.bottomRight.z;
    buf[6] = addedText.topRight.x; buf[7] = addedText.topRight.y; buf[8] = addedText.topRight.z;
    buf[9] = addedText.bottomLeft.x; buf[10] = addedText.bottomLeft.y; buf[11] = addedText.bottomLeft.z;
    rayCaster.workerMessageHandler.push(buf.buffer);
    addedText.raycasterScaleUpdateBufferAvailibility = false;
  };
  this.raycasterHideBufferAvailibility = "raycasterHideBufferAvailibility";
  this.raycasterShowBufferAvailibility = "raycasterShowBufferAvailibility";
  this.handleBufferAvailibilityUpdate = function(obj, key){
    rayCaster.raycasterAvailibilityModifierBuffer.set(obj.name, obj);
    obj.raycasterAvailibilityModifierBuffer.set(key, obj);
  };
  this.issueAvailibilityBuffers = function(obj, key){
    obj.raycasterAvailibilityModifierBuffer.forEach(rayCaster.issueObjectAvailibilityBuffers);
    obj.raycasterAvailibilityModifierBuffer.clear();
  };
  this.issueObjectAvailibilityBuffers = function(obj, bufferKey){
    obj[bufferKey] = false;
  };
}

RaycasterWorkerBridge.prototype.onReady = function(){
  this.ready = true;
  if (this.onReadyCallback){
    this.onReadyCallback();
  }
}

RaycasterWorkerBridge.prototype.flush = function(){
  if (this.raycasterAvailibilityModifierBuffer.size > 0){
    this.raycasterAvailibilityModifierBuffer.forEach(this.issueAvailibilityBuffers);
    this.raycasterAvailibilityModifierBuffer.clear();
  }
  this.workerMessageHandler.flush();
}

RaycasterWorkerBridge.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.ready = false;
  this.addedTextPositionUpdateCache = new Object();
  this.cameraOrientationBuffer = new Float32Array(9);
  this.cameraOrientationBufferAvailibility = true;
  this.cameraOrientationBuffer[0] = 2;
  this.raycasterAvailibilityModifierBuffer = new Map();
  this.updateBuffer = new Map();
  this.textScaleUpdateBuffer = new Map();
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
      rayCaster.textScaleUpdateBuffer.set(addedText.name, addedText);
    }
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
  if(obj.isAddedText){
    this.hasUpdatedTexts = true;
  }
}

RaycasterWorkerBridge.prototype.onBeforeUpdate = function(){
  rayCaster.textScaleUpdateBuffer.forEach(rayCaster.updateAddedTextScale);
  rayCaster.textScaleUpdateBuffer.clear();
  if (rayCaster.hasUpdatedTexts){
    if (rayCaster.cameraOrientationBufferAvailibility){
      var buf = rayCaster.cameraOrientationBuffer;
      buf[1] = camera.position.x; buf[2] = camera.position.y; buf[3] = camera.position.z;
      buf[4] = camera.quaternion.x; buf[5] = camera.quaternion.y; buf[6] = camera.quaternion.z; buf[7] = camera.quaternion.w;
      buf[8] = camera.aspect;
      rayCaster.workerMessageHandler.push(buf.buffer);
      rayCaster.cameraOrientationBufferAvailibility = false;
      rayCaster.hasUpdatedTexts = false;
    }
  }
  rayCaster.workerMessageHandler.flush();
}

RaycasterWorkerBridge.prototype.issueUpdate = function(obj){
  if (obj.isAddedObject){
    if (!obj.raycasterUpdateBufferAvailibility){
      return;
    }
    obj.raycasterUpdateBuffer.set(obj.mesh.matrixWorld.elements, 2);
    rayCaster.workerMessageHandler.push(obj.raycasterUpdateBuffer.buffer);
    obj.raycasterUpdateBufferAvailibility = false;
    return;
  }
  if (obj.isObjectGroup){
    if (!obj.raycasterUpdateBufferAvailibility){
      return;
    }
    obj.raycasterUpdateBuffer.set(obj.mesh.matrixWorld.elements, 2);
    rayCaster.workerMessageHandler.push(obj.raycasterUpdateBuffer.buffer);
    obj.raycasterUpdateBufferAvailibility = false;
    return;
  }else if (obj.isAddedText){
    if (!obj.raycasterUpdateBufferAvailibility){
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
      obj.raycasterUpdateBuffer[2] = obj.mesh.position.x; obj.raycasterUpdateBuffer[3] = obj.mesh.position.y; obj.raycasterUpdateBuffer[4] = obj.mesh.position.z;
      rayCaster.workerMessageHandler.push(obj.raycasterUpdateBuffer.buffer);
      obj.raycasterUpdateBufferAvailibility = false;
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
  if (!object.raycasterHideBufferAvailibility){
    return;
  }
  rayCaster.workerMessageHandler.push(object.raycasterHideBuffer.buffer);
  rayCaster.handleBufferAvailibilityUpdate(object, rayCaster.raycasterHideBufferAvailibility);
}

RaycasterWorkerBridge.prototype.show = function(object){
  if (!object.raycasterShowBufferAvailibility){
    return;
  }
  rayCaster.workerMessageHandler.push(object.raycasterShowBuffer.buffer);
  rayCaster.handleBufferAvailibilityUpdate(object, rayCaster.raycasterShowBufferAvailibility);
}


RaycasterWorkerBridge.prototype.query = function(point){
  throw new Error("not implemented.");
}
