importScripts("../handler/RayCaster.js");
importScripts("../handler/WorldBinHandler.js");
importScripts("../third_party/three.min.js");
importScripts("../worker/StateLoaderLightweight.js");
importScripts("../engine_objects/GridSystem.js");
importScripts("../engine_objects/AddedObject.js");
importScripts("../engine_objects/ObjectGroup.js");
importScripts("../engine_objects/AddedText.js");
importScripts("../worker/WorkerMessageHandler.js");

var IS_WORKER_CONTEXT = true;

// CLASS DEFINITION
var RaycasterWorker = function(){
  this.reusableVector1 = new THREE.Vector3();
  this.reusableVector2 = new THREE.Vector3();
  this.reusableQuaternion = new THREE.Quaternion();
  this.reusableMatrix = new THREE.Matrix4();
  this.reusableArray16 = new Array();
  this.rayCaster = new RayCaster();
  this.workerMessageHandler = new WorkerMessageHandler();
}
RaycasterWorker.prototype.refresh = function(state){
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
RaycasterWorker.prototype.findIntersections = function(data){
  var bufferId = data[0];
  this.reusableVector1.set(data[1], data[2], data[3]);
  this.reusableVector2.set(data[4], data[5], data[6]);
  var intersectGridSystems = (data[7] == 1)? true: false;
  this.rayCaster.findIntersections(this.reusableVector1, this.reusableVector2, intersectGridSystems, this.onRaycasterCompleted);
  if (intersectionObject){
    data[1] = this.workerIDsByObjectName[intersectionObject];
    data[2] = intersectionPoint.x; data[3] = intersectionPoint.y; data[4] = intersectionPoint.z;
  }else{
    data[1] = -1;
  }
  this.workerMessageHandler.push(data.buffer);
}
RaycasterWorker.prototype.hideObjects = function(){
  for (var objName in addedObjects){
    this.rayCaster.hide(addedObjects[objName]);
  }
  for (var objName in objectGroups){
    this.rayCaster.hide(objectGroups[objName]);
  }
}
RaycasterWorker.prototype.showObjects = function(){
  for (var objName in addedObjects){
    this.rayCaster.show(addedObjects[objName]);
  }
  for (var objName in objectGroups){
    this.rayCaster.show(objectGroups[objName]);
  }
}
RaycasterWorker.prototype.updateAddedObject = function(data){
  var objID = data[2];
  var obj = this.objectsByWorkerID[objID];
  for (var i = 3; i<19; i++){
    this.reusableArray16[i - 3] = data[i];
  }
  obj.mesh.matrixWorld.fromArray(this.reusableArray16);
  obj.mesh.matrixWorld.decompose(this.reusableVector1, this.reusableQuaternion, this.reusableVector2);
  obj.mesh.position.copy(this.reusableVector1);
  obj.mesh.quaternion.copy(this.reusableQuaternion);
  obj.updateBoundingBoxes();
  this.rayCaster.updateObject(obj, true);
}
RaycasterWorker.prototype.updateObjectGroup = function(data){
  var objID = data[2];
  var obj = this.objectsByWorkerID[objID];
  for (var i = 3; i<19; i++){
    this.reusableArray16[i - 3] = data[i];
  }
  obj.mesh.matrixWorld.fromArray(this.reusableArray16);
  obj.mesh.matrixWorld.decompose(this.reusableVector1, this.reusableQuaternion, this.reusableVector2);
  obj.mesh.position.copy(this.reusableVector1);
  obj.mesh.quaternion.copy(this.reusableQuaternion);
  obj.updateBoundingBoxes();
  this.rayCaster.updateObject(obj, true);
}
RaycasterWorker.prototype.updateAddedText = function(data){
  var text = this.objectsByWorkerID[data[2]];
  text.mesh.position.set(data[3], data[4], data[5]);
  text.mesh.quaternion.set(data[6], data[7], data[8], data[9]);
  for (var i = 10; i<26; i++){
    this.reusableArray16[i-10] = data[i];
  }
  text.mesh.modelViewMatrix.fromArray(this.reusableArray16);
  text.characterSize = data[26];
  text.topLeft.set(data[27], data[28], data[29]);
  text.bottomRight.set(data[30], data[31], data[32]);
  text.topRight.set(data[33], data[34], data[35]);
  text.bottomLeft.set(data[36], data[37], data[38]);
  this.workerMessageHandler.push(data.buffer);
  text.handleBoundingBox();
  this.rayCaster.updateObject(text, true);
}
RaycasterWorker.prototype.updateCameraOrientation = function(data){
  camera.position.set(data[2], data[3], data[4]);
  camera.quaternion.set(data[5], data[6], data[7], data[8]);
  camera.aspect = data[9];
}
RaycasterWorker.prototype.updateViewport = function(data){
  renderer.viewport.set(data[2], data[3], data[4], data[5]);
  screenResolution = data[6];
}
RaycasterWorker.prototype.hide = function(data){
  var object = this.objectsByWorkerID[data[2]];
  this.rayCaster.binHandler.hide(object);
}
RaycasterWorker.prototype.show = function(data){
  var object = this.objectsByWorkerID[data[2]];
  this.rayCaster.binHandler.show(object);
}
// A dummy function
RaycasterWorker.prototype.onRaycasterCompleted = function(){
}

// START
var keyboardBuffer = new Object();
var renderer = new Object();
var screenResolution = 1;
var camera = new Object();
var LIMIT_BOUNDING_BOX = new THREE.Box3(new THREE.Vector3(-4000, -4000, -4000), new THREE.Vector3(4000, 4000, 4000));
var BIN_SIZE = 50;
var REUSABLE_LINE = new THREE.Line3();
var REUSABLE_VECTOR = new THREE.Vector3();
var REUSABLE_VECTOR_2 = new THREE.Vector3();
var REUSABLE_VECTOR_3 = new THREE.Vector3();
var REUSABLE_VECTOR_4 = new THREE.Vector3();
var INTERSECTION_NORMAL = new THREE.Vector3();
var mode = 0;
var projectLoaded = true;
var addedObjects = new Object();
var objectGroups = new Object();
var gridSystems = new Object();
var addedTexts = new Object();
var worker = new RaycasterWorker();

self.onmessage = function(msg){
  if (msg.data.isLightweightState){
    worker.refresh(msg.data);
  }else if (msg.data.shiftPress){
    if (msg.data.shiftPress.isPressed){
      worker.hideObjects();
    }else{
      worker.showObjects();
    }
  }else{
    for (var i = 0; i<msg.data.length; i++){
      var ary = new Float32Array(msg.data[i]);
      if (ary.length == 8){
        worker.findIntersections(ary);
      }else{
        if (ary[0] == 0){
          worker.updateAddedObject(ary);
        }else if (ary[0] == 1){
          worker.updateObjectGroup(ary);
        }else if (ary[0] == 2){
          worker.updateCameraOrientation(ary);
        }else if (ary[0] == 3){
          worker.updateViewport(ary);
        }else if (ary[0] == 4){
          worker.updateAddedText(ary);
        }else if (ary[0] == 5){
          worker.hide(ary);
        }else if (ary[0] == 6){
          worker.show(ary);
        }
        worker.workerMessageHandler.push(ary.buffer);
      }
    }
    worker.workerMessageHandler.flush();
  }
}
