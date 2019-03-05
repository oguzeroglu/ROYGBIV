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
        }else if (msg.data.ids[i].type == "objectGroup"){
          rayCaster.objectsByWorkerID[msg.data.ids[i].id] = objectGroups[msg.data.ids[i].name];
        }else{
          throw new Error("Not implemented.");
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
        rayCaster.intersectionTestCallbackFunctions[msg.data[0]](intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectedObj);
      }else{
        rayCaster.intersectionTestCallbackFunctions[msg.data[0]](0, 0, 0, null);
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

RaycasterWorkerBridge.prototype.refresh = function(){
  console.log("REFRESH");
  this.worker.postMessage(new LightweightState());
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
