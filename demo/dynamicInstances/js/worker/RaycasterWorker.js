importScripts("./WorkerImport.js");
var IS_WORKER_CONTEXT = true;

// CLASS DEFINITION
var RaycasterWorker = function(){
  this.record = false;
  this.performanceLogs = {isPerformanceLog: true, updateTime: 0}
  this.reusableVector1 = new THREE.Vector3();
  this.reusableVector2 = new THREE.Vector3();
  this.reusableQuaternion = new THREE.Quaternion();
  this.reusableMatrix = new THREE.Matrix4();
  this.reusableArray16 = new Array();
  this.rayCaster = new RayCaster();
}
RaycasterWorker.prototype.refresh = function(state){
  this.transferableMessageBody = {};
  this.transferableList = [];
  var stateLoader = new StateLoaderLightweight(state);
  mode = state.mode;
  stateLoader.reset();
  stateLoader.loadWorldLimits();
  stateLoader.loadCamera();
  stateLoader.loadRenderer();
  stateLoader.loadBoundingBoxes();
  var idCounter = 0;
  var idResponse = [];
  this.workerIDsByObjectName = new Object();
  this.objectsByWorkerID = new Object();
  for (var gsName in gridSystems){
    gridSystems[gsName].workerID = idCounter ++;
    idResponse.push({type: "gridSystem", name: gsName, id: gridSystems[gsName].workerID});
    this.workerIDsByObjectName[gsName] = gridSystems[gsName].workerID;
    this.objectsByWorkerID[gridSystems[gsName].workerID] = gridSystems[gsName];
  }
  for (var objName in addedObjects){
    addedObjects[objName].workerID = idCounter ++;
    idResponse.push({type: "addedObject", name: objName, id: addedObjects[objName].workerID});
    this.workerIDsByObjectName[objName] = addedObjects[objName].workerID;
    this.objectsByWorkerID[addedObjects[objName].workerID] = addedObjects[objName];
  }
  for (var objName in objectGroups){
    objectGroups[objName].workerID = idCounter ++;
    idResponse.push({type: "objectGroup", name: objName, id: objectGroups[objName].workerID});
    this.workerIDsByObjectName[objName] = objectGroups[objName].workerID;
    this.objectsByWorkerID[objectGroups[objName].workerID] = objectGroups[objName];
  }
  for (var textName in addedTexts){
    addedTexts[textName].workerID = idCounter ++;
    idResponse.push({type: "addedText", name: textName, id: addedTexts[textName].workerID});
    this.workerIDsByObjectName[textName] = addedTexts[textName].workerID;
    this.objectsByWorkerID[addedTexts[textName].workerID] = addedTexts[textName];
  }
  this.rayCaster.refresh();
  postMessage({type: "idResponse", ids: idResponse});
}
RaycasterWorker.prototype.startRecording = function(){
  this.record = true;
}
RaycasterWorker.prototype.dumpPerformanceLogs = function(){
  postMessage(this.performanceLogs);
}
RaycasterWorker.prototype.update = function(transferableMessageBody){
  var updateStartTime;
  if (this.record){
    updateStartTime = performance.now();
  }
  var cameraOrientationDescription = transferableMessageBody.cameraOrientationDescription;
  camera.position.set(cameraOrientationDescription[0], cameraOrientationDescription[1], cameraOrientationDescription[2]);
  camera.quaternion.set(cameraOrientationDescription[3], cameraOrientationDescription[4], cameraOrientationDescription[5], cameraOrientationDescription[6]);
  camera.aspect = cameraOrientationDescription[7];
  camera.updateMatrixWorld();
  if (transferableMessageBody.flagsDescription[0] > 0){
    var intersectableObjDescription = transferableMessageBody.intersectableObjDescription;
    for (var i = 0; i<intersectableObjDescription.length; i+=18){
      var obj = this.objectsByWorkerID[intersectableObjDescription[i]];
      if (mode == 0 && obj.isGridSystem){
        continue;
      }
      if (obj.isAddedObject || obj.isObjectGroup){
        for (var i2 = i+2; i2 < (i+18); i2++){
          this.reusableArray16[i2-i-2] = intersectableObjDescription[i2];
        }
        obj.mesh.matrixWorld.fromArray(this.reusableArray16);
        obj.mesh.matrixWorld.decompose(this.reusableVector1, this.reusableQuaternion, this.reusableVector2);
        obj.mesh.position.copy(this.reusableVector1);
        obj.mesh.quaternion.copy(this.reusableQuaternion);
        obj.updateBoundingBoxes();
        this.rayCaster.updateObject(obj, true);
        if (!obj.isHidden && intersectableObjDescription[i+1] < 0){
          this.rayCaster.binHandler.hide(obj);
          obj.isHidden = true;
        }else if (obj.isHidden && intersectableObjDescription[i+1] > 0){
          this.rayCaster.binHandler.show(obj);
          obj.isHidden = false;
        }
      }else if (obj.isAddedText){
        for (var i2 = i+2; i2 < (i+18); i2++){
          this.reusableArray16[i2-i-2] = intersectableObjDescription[i2];
        }
        obj.mesh.matrixWorld.fromArray(this.reusableArray16);
        obj.mesh.matrixWorld.decompose(this.reusableVector1, this.reusableQuaternion, this.reusableVector2);
        obj.mesh.position.copy(this.reusableVector1);
        obj.mesh.quaternion.copy(this.reusableQuaternion);
        REUSABLE_MATRIX_4.copy(obj.mesh.matrixWorld);
        REUSABLE_MATRIX_4.premultiply(camera.matrixWorldInverse);
        obj.mesh.modelViewMatrix.copy(REUSABLE_MATRIX_4);
        obj.handleBoundingBox();
        this.rayCaster.updateObject(obj, true);
      }else{
        throw new Error("Not implemented.");
      }
    }
  }
  if (transferableMessageBody.flagsDescription[2] > 0){
    var addedTextScaleDescription = transferableMessageBody.addedTextScaleDescription;
    for (var i = 0; i<addedTextScaleDescription.length; i+= 11){
      var text = this.objectsByWorkerID[addedTextScaleDescription[i]];
      text.characterSize = addedTextScaleDescription[i+1];
      text.bottomRight.set(addedTextScaleDescription[i+2], addedTextScaleDescription[i+3], addedTextScaleDescription[i+4]);
      text.topRight.set(addedTextScaleDescription[i+5], addedTextScaleDescription[i+6], addedTextScaleDescription[i+7]);
      text.bottomLeft.set(addedTextScaleDescription[i+8], addedTextScaleDescription[i+9], addedTextScaleDescription[i+10]);
      text.mesh.updateMatrixWorld();
      REUSABLE_MATRIX_4.copy(text.mesh.matrixWorld);
      REUSABLE_MATRIX_4.premultiply(camera.matrixWorldInverse);
      text.mesh.modelViewMatrix.copy(REUSABLE_MATRIX_4);
      text.handleBoundingBox();
      this.rayCaster.updateObject(text, true);
    }
  }
  if (transferableMessageBody.flagsDescription[1] > 0){
    var intersectionTestDescription = transferableMessageBody.intersectionTestDescription;
    for (var i = 0; i<intersectionTestDescription.length; i+= 8){
      if (intersectionTestDescription[i] >= 0){
        this.reusableVector1.set(intersectionTestDescription[i+1], intersectionTestDescription[i+2], intersectionTestDescription[i+3]);
        this.reusableVector2.set(intersectionTestDescription[i+4], intersectionTestDescription[i+5], intersectionTestDescription[i+6]);
        var intersectGridSystems = (intersectionTestDescription[i+7] > 0);
        this.rayCaster.findIntersections(this.reusableVector1, this.reusableVector2, intersectGridSystems, noop);
        if (intersectionObject){
          intersectionTestDescription[i+1] = this.workerIDsByObjectName[intersectionObject];
          intersectionTestDescription[i+2] = intersectionPoint.x; intersectionTestDescription[i+3] = intersectionPoint.y; intersectionTestDescription[i+4] = intersectionPoint.z;
        }else{
          intersectionTestDescription[i+1] = -1;
        }
      }
    }
  }
  if (this.record){
    this.performanceLogs.updateTime = performance.now() - updateStartTime;
  }
}

// START
var noop = function(){}
var keyboardBuffer = new Object();
var renderer = new Object();
var screenResolution = 1;
var camera = new Object();
var LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
var BIN_SIZE = 50;
var RAYCASTER_STEP_AMOUNT = 32;
var REUSABLE_LINE = new THREE.Line3();
var REUSABLE_VECTOR = new THREE.Vector3();
var REUSABLE_VECTOR_2 = new THREE.Vector3();
var REUSABLE_VECTOR_3 = new THREE.Vector3();
var REUSABLE_VECTOR_4 = new THREE.Vector3();
var INTERSECTION_NORMAL = new THREE.Vector3();
var REUSABLE_MATRIX_4 = new THREE.Matrix4();
var mode = 0;
var projectLoaded = true;
var addedObjects = new Object();
var objectGroups = new Object();
var gridSystems = new Object();
var addedTexts = new Object();
var worker = new RaycasterWorker();

self.onmessage = function(msg){
  if (msg.data.startRecording){
    worker.startRecording();
  }else if (msg.data.dumpPerformanceLogs){
    worker.dumpPerformanceLogs();
  }else if (msg.data.isLightweightState){
    worker.refresh(msg.data);
  }else if (msg.data.shiftPress){
    if (msg.data.shiftPress.isPressed){
      keyboardBuffer["Shift"] = true;
    }else{
      keyboardBuffer["Shift"] = false;
    }
  }else{
    worker.update(msg.data);
    worker.transferableMessageBody = msg.data;
    worker.transferableList[0] = worker.transferableMessageBody.intersectableObjDescription.buffer;
    worker.transferableList[1] = worker.transferableMessageBody.intersectionTestDescription.buffer;
    worker.transferableList[2] = worker.transferableMessageBody.flagsDescription.buffer;
    worker.transferableList[3] = worker.transferableMessageBody.cameraOrientationDescription.buffer;
    worker.transferableList[4] = worker.transferableMessageBody.addedTextScaleDescription.buffer;
    postMessage(worker.transferableMessageBody);
  }
}