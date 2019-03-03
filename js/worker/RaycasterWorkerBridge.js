// WHAT HAPPENS IN INIT:
// 1) When the worker mode is active the rayCaster variable is initiated using RaycasterWorkerBridge constructor
// 2) RaycasterWorkerBridge and Raycaster classes need to implement same methods. There are tests on startup to check that.
// 3) RaycasterWorkerBridge creates a new Worker instance inside the constructor and does nothing else
// 4) Everytime rayCaster.refresh() is called RaycasterWorkerBridge takes a new LightweightState object and sends it to the worker
// 5) Worker loads the current state using StateLoader and sends back the RaycasterWorkerBridge a list of object-id map.
// 6) RaycasterWorkerBridge creates the objectsByWorkerID map using the info sent from RaycasterWorker.
//
// WHAT HAPPENS WHEN FINDING INTERSECTIONS:
// 1) Since the rayCaster is a RaycasterWorkerBridge, the findIntersections method is called
// 2) RaycasterWorkerBridge checks if there is any available buffer to send to the worker
// 3) If there is any available buffer, bufferID, from, direction, intersectGridSystems infos are put inside the buffer
// 4) The buffer is sent to the RaycasterWorker using transferables
// 5) The RaycasterWorker does an intersection check using its RayCaster object.
// 6) If there is an intersection the shared ID is filled with bufferID, object workerID and intersection coordinates
// 7) If there is no intersection RaycasterWorker puts an -1 to the 2nd element of the buffer
// 8) RaycasterWorker sends back the buffer.
// 9) RaycasterWorkerBridge checks if the 2nd element of the buffer is -1. If not the rayCaster callbackFunction is fired.
// 10)The buffer is marked as available again (intersectionTestBufferAvailibilities)
var RaycasterWorkerBridge = function(){
  this.worker = new Worker("../js/worker/RaycasterWorker.js");
  this.worker.addEventListener("message", function(msg){
    if (msg.data.type){
      rayCaster.objectsByWorkerID = new Object();
      for (var i = 0; i<msg.data.ids.length; i++){
        if (msg.data.ids[i].type == "gridSystem"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = gridSystems[msg.data.ids[i].name];
        }else if (msg.data.ids[i].type == "addedObject"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = addedObjects[msg.data.ids[i].name];
        }
      }
    }else{
      rayCaster.intersectionTestBuffers[msg.data[0]] = msg.data;
      rayCaster.intersectionTestBufferAvailibilities[msg.data[0]] = true;
      if (msg.data[1] > -1){
        var intersectedObj = rayCaster.objectsByWorkerID[msg.data[1]];
        intersectionObject = intersectedObj.name;
        REUSABLE_VECTOR.set(msg.data[2], msg.data[3], msg.data[4]);
        intersectionPoint = REUSABLE_VECTOR;
      }
      rayCaster.intersectionTestCallbackFunctions[msg.data[0]]();
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

RaycasterWorkerBridge.prototype.refresh = function(){
  console.log("REFRESH");
  this.worker.postMessage(new LightweightState());
}

RaycasterWorkerBridge.prototype.update = function(){
  console.log("UPDATE");
}

RaycasterWorkerBridge.prototype.updateObject = function(){
  console.log("UPDATE OBJECT");
}

RaycasterWorkerBridge.prototype.findIntersections = function(from, direction, intersectGridSystems, callbackFunction){
  console.log("FIND INTERSECTIONS");
  var len = this.intersectionTestBuffers.length;
  var sent = false;
  for (var i = 0; i<len; i++){
    if (this.intersectionTestBufferAvailibilities[i]){
      var ary = this.intersectionTestBuffers[i];
      ary[0] = i; ary[1] = from.x; ary[2] = from.y; ary[3] = from.z;
      ary[4] = direction.x; ary[5] = direction.y; ary[6] = direction.z;
      ary[7] = (intersectGridSystems? 1: 0)
      var buf = ary.buffer;
      this.worker.postMessage(ary, [buf]);
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
