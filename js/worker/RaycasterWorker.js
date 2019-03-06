importScripts("../handler/RayCaster.js");
importScripts("../handler/WorldBinHandler.js");
importScripts("../third_party/three.min.js");
importScripts("../worker/StateLoaderLightweight.js");
importScripts("../engine_objects/GridSystem.js");
importScripts("../engine_objects/AddedObject.js");
importScripts("../engine_objects/ObjectGroup.js");
importScripts("../engine_objects/AddedText.js");

var IS_WORKER_CONTEXT = true;

// CLASS DEFINITION
var RaycasterWorker = function(){
  this.reusableVector1 = new THREE.Vector3();
  this.reusableVector2 = new THREE.Vector3();
  this.reusableQuaternion = new THREE.Quaternion();
  this.reusableMatrix = new THREE.Matrix4();
  this.reusableArray16 = new Array();
  this.rayCaster = new RayCaster();
}
RaycasterWorker.prototype.refresh = function(state){
  gridSystems = new Object();
  var stateLoader = new StateLoaderLightweight(state);
  mode = state.mode;
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
  postMessage(data, [data.buffer]);
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
  var objID = data[1];
  var obj = this.objectsByWorkerID[objID];
  for (var i = 2; i<18; i++){
    this.reusableArray16[i - 2] = data[i];
  }
  obj.mesh.matrixWorld.fromArray(this.reusableArray16);
  obj.mesh.matrixWorld.decompose(this.reusableVector1, this.reusableQuaternion, this.reusableVector2);
  obj.mesh.position.copy(this.reusableVector1);
  obj.mesh.quaternion.copy(this.reusableQuaternion);
  postMessage(data, [data.buffer]);
  obj.updateBoundingBoxes();
  this.rayCaster.updateObject(obj, true);
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
    switch(msg.data.length){
      case 8:
        worker.findIntersections(msg.data);
      return;
      case 18:
        worker.updateAddedObject(msg.data);
      return;
    }
  }
}
