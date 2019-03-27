var RaycasterWorkerBridge = function(){
  this.isRaycasterWorkerBridge = true;
  this.worker = new Worker("./js/worker/RaycasterWorker.js");
  this.ready = false;
  this.updateBuffer = new Map();
  this.addedTextScaleUpdateBuffer = new Map();
  this.hasOwnership = false;
  this.intersectionTestBuffer = {
    isActive: false, fromVector: new THREE.Vector3(), directionVector: new THREE.Vector3(),
    intersectGridSystems: false, callbackFunction: noop
  }
  this.worker.addEventListener("message", function(msg){
    if (msg.data.isPerformanceLog){

    }else if (msg.data.type){
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
        var insertObjectToBuffer = (mode == 0) || (mode == 1 && obj.isIntersectable && obj.isChangeable);
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
        var insertObjectToBuffer = (mode == 0) || (mode == 1 && obj.isIntersectable && obj.isChangeable);
        if (insertObjectToBuffer){
          obj.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
          intersectablesAry.push(rayCaster.idsByObjectNames[obj.name]);
          intersectablesAry.push(1);
          obj.mesh.updateMatrixWorld();
          for (var i = 0; i<obj.mesh.matrixWorld.elements.length; i++){
            intersectablesAry.push(obj.mesh.matrixWorld.elements[i]);
          }
          intersectableArrayIndex += obj.mesh.matrixWorld.elements.length + 1;
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
          intersectableArrayIndex += text.mesh.matrixWorld.elements.length + 1;
          addedTextScaleDescriptionArray.push(text.characterSize);
          addedTextScaleDescriptionArray.push(text.bottomRight.x); addedTextScaleDescriptionArray.push(text.bottomRight.y); addedTextScaleDescriptionArray.push(text.bottomRight.z);
          addedTextScaleDescriptionArray.push(text.topRight.x); addedTextScaleDescriptionArray.push(text.topRight.y); addedTextScaleDescriptionArray.push(text.topRight.z);
          addedTextScaleDescriptionArray.push(text.bottomLeft.x); addedTextScaleDescriptionArray.push(text.bottomLeft.y); addedTextScaleDescriptionArray.push(text.bottomLeft.z);
          addedTextScaleDescriptionIndex += 11;
        }
      }
      var intersectableObjectDescriptionArray = new Float32Array(intersectablesAry);
      var intersectionTestDescription = new Float32Array(7);
      var cameraOrientationDescription = new Float32Array(8);
      var flagsDescription = new Float32Array(3);
      var addedTextScaleDescription = new Float32Array(addedTextScaleDescriptionArray);
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
      rayCaster.hasOwnership = true;
      rayCaster.onReady();
    }else{
      rayCaster.transferableMessageBody= msg.data;
      rayCaster.transferableList[0] = rayCaster.transferableMessageBody.intersectableObjDescription.buffer;
      rayCaster.transferableList[1] = rayCaster.transferableMessageBody.intersectionTestDescription.buffer;
      rayCaster.transferableList[2] = rayCaster.transferableMessageBody.flagsDescription.buffer;
      rayCaster.transferableList[3] = rayCaster.transferableMessageBody.cameraOrientationDescription.buffer;
      rayCaster.transferableList[4] = rayCaster.transferableMessageBody.addedTextScaleDescription.buffer;
      var intersectionTestDescription = rayCaster.transferableMessageBody.intersectionTestDescription;
      if (rayCaster.transferableMessageBody.flagsDescription[1] > 0){
        if (intersectionTestDescription[0] >= 0){
          var objID = intersectionTestDescription[0];
          var intersectedObject = rayCaster.objectsByWorkerID[objID];
          intersectionObject = intersectedObject.name;
          REUSABLE_VECTOR.set(intersectionTestDescription[1], intersectionTestDescription[2], intersectionTestDescription[3]);
          intersectionPoint = REUSABLE_VECTOR;
          rayCaster.intersectionTestBuffer.callbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject)
        }else{
          rayCaster.intersectionTestBuffer.callbackFunction(0, 0, 0, null);
        }
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
}

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
  var sendMessage = false;
  if (this.updateBuffer.size > 0){
    this.updateBuffer.forEach(this.issueUpdate);
    this.updateBuffer.clear();
    sendMessage = true;
    this.transferableMessageBody.flagsDescription[0] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[0] = -1;
  }
  if (this.addedTextScaleUpdateBuffer.size > 0){
    this.addedTextScaleUpdateBuffer.forEach(this.issueAddedTextScaleUpdate);
    this.addedTextScaleUpdateBuffer.clear();
    sendMessage = true;
    this.transferableMessageBody.flagsDescription[2] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[2] = -1;
  }
  if (this.intersectionTestBuffer.isActive){
    sendMessage = true;
    this.transferableMessageBody.flagsDescription[1] = 1;
    var intersectionTestDescription = this.transferableMessageBody.intersectionTestDescription;
    intersectionTestDescription[0] = this.intersectionTestBuffer.fromVector.x; intersectionTestDescription[1] = this.intersectionTestBuffer.fromVector.y; intersectionTestDescription[2] = this.intersectionTestBuffer.fromVector.z;
    intersectionTestDescription[3] = this.intersectionTestBuffer.directionVector.x; intersectionTestDescription[4] = this.intersectionTestBuffer.directionVector.y; intersectionTestDescription[5] = this.intersectionTestBuffer.directionVector.z;
    intersectionTestDescription[6] = (this.intersectionTestBuffer.intersectGridSystems? 1: -1)
    this.intersectionTestBuffer.isActive = false;
  }else{
    this.transferableMessageBody.flagsDescription[1] = -1;
  }
  if (sendMessage){
    var cameraOrientationDescription = this.transferableMessageBody.cameraOrientationDescription;
    cameraOrientationDescription[0] = camera.position.x; cameraOrientationDescription[1] = camera.position.y; cameraOrientationDescription[2] = camera.position.z;
    cameraOrientationDescription[3] = camera.quaternion.x; cameraOrientationDescription[4] = camera.quaternion.y; cameraOrientationDescription[5] = camera.quaternion.z; cameraOrientationDescription[6] = camera.quaternion.w;
    cameraOrientationDescription[7] = camera.aspect;
    this.worker.postMessage(this.transferableMessageBody, this.transferableList);
    this.hasOwnership = false;
  }
}

RaycasterWorkerBridge.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.ready = false;
  this.hasOwnership = false;
  this.updateBuffer = new Map();
  this.intersectionTestBuffer = {
    isActive: false, fromVector: new THREE.Vector3(), directionVector: new THREE.Vector3(),
    intersectGridSystems: false, callbackFunction: noop
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
  this.intersectionTestBuffer.isActive = true;
  this.intersectionTestBuffer.fromVector.copy(from);
  this.intersectionTestBuffer.directionVector.copy(direction);
  this.intersectionTestBuffer.intersectGridSystems = intersectGridSystems;
  this.intersectionTestBuffer.callbackFunction = callbackFunction;
}

RaycasterWorkerBridge.prototype.hide = function(object){
  this.updateBuffer.set(object.name, object);
}

RaycasterWorkerBridge.prototype.show = function(object){
  this.updateBuffer.set(object.name, object);
}

RaycasterWorkerBridge.prototype.query = function(point){
  throw new Error("not implemented.");
}
