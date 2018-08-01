var WorkerHandler = function(){

  this.reusableCollisionInfo = new CollisionInfo();
  this.objectIDMAp = new Map();
  this.psIndexMap = new Map();

  this.psTickFunction = (
    function(workerHandlerContext){
      return function(){
        workerHandlerContext.psTickArray.canPSSet = false;
        workerHandlerContext.postMessage(
          workerHandlerContext.psCollisionWorker,
          workerHandlerContext.reusableWorkerMessage.set(
          workerHandlerContext.constants.tick, workerHandlerContext.psTickArray
        ));
      };
    }
  )(this);

  this.psArrayFunction = (
    function(workerHandlerContext){
      return function(){
        workerHandlerContext.postMessage(
          workerHandlerContext.collisionWorker,
          workerHandlerContext.particleSystemsArray
        );
        if (workerHandlerContext.particleStartDelayBufferSize > 0){
          workerHandlerContext.postMessage(
            workerHandlerContext.collisionWorker, workerHandlerContext.reusableWorkerMessage.set(
              workerHandlerContext.constants.startDelayChange,
              JSON.stringify(workerHandlerContext.particleStartDelayBuffer)
            )
          );
          for (var key in workerHandlerContext.particleStartDelayBuffer){
            delete workerHandlerContext.particleStartDelayBuffer[key];
          }
          workerHandlerContext.particleStartDelayBufferSize = 0;
        }
        if (workerHandlerContext.particleRemoveBufferSize > 0){
          workerHandlerContext.postMessage(
            workerHandlerContext.collisionWorker, workerHandlerContext.reusableWorkerMessage.set(
              workerHandlerContext.constants.destroyParticle,
              JSON.stringify(workerHandlerContext.particleRemoveBuffer)
            )
          );
          workerHandlerContext.particleRemoveBuffer = new Object();
          workerHandlerContext.particleRemoveBufferSize = 0;
        }
      };
    }
  )(this);

  this.psBinHandlerLoopFunction = (
    function(workerHandlerContext){
      return function(){
        var selectedWorker = workerHandlerContext.psCollisionWorker;
        var selectedBBDescriptions = workerHandlerContext.objectPSBBDescriptions;
        workerHandlerContext.postMessage(
          selectedWorker,
          workerHandlerContext.reusableWorkerMessage.set(
            workerHandlerContext.constants.binLoop, selectedBBDescriptions
          )
        );
      }
    }
  )(this);

  this.binHandlerLoopFunction = (
    function(workerHandlerContext){
      return function(){
        var selectedWorker = workerHandlerContext.collisionWorker;
        var selectedBBDescriptions = workerHandlerContext.objectBBDescriptions;
        workerHandlerContext.postMessage(
          selectedWorker,
          workerHandlerContext.reusableWorkerMessage.set(
            workerHandlerContext.constants.binLoop, selectedBBDescriptions
          )
        );
      }
    }
  )(this);

  this.physicsWorkerFunction = (
    function(workerHandlerContext){
      return function(){
        workerHandlerContext.postMessage(
          workerHandlerContext.physicsWorker,
          workerHandlerContext.reusableWorkerMessage.set(
            workerHandlerContext.constants.physicsInfo, workerHandlerContext.physicsInformationArray
          )
        );
      }
    }
  )(this);

  this.transferableBufferArray = new Array(1);
  this.constants = new WorkerConstants();
  this.reusableWorkerMessage = new WorkerMessage();

  if (isPhysicsWorkerEnabled()){
    this.physicsWorker = new Worker(PHYSICS_WORKER_PATH);
    this.physicsWorker.name = "physicsWorker";
  }
  if (isCollisionWorkerEnabled()){
    this.collisionWorker = new Worker(COLLISION_WORKER_PATH);
    this.collisionWorker.name = "collisionWorker";
  }
  if (isPSCollisionWorkerEnabled()){
    this.psCollisionWorker = new Worker(PS_COLLISION_WORKER_PATH);
    this.psCollisionWorker.name = "psCollisionWorker";
  }

  this.psCollisionListenBuffer = new Object();
  this.psRemovalBuffer = new Object();

  this.particleStartDelayBuffer = new Object();
  this.particleRemoveBuffer = new Object();
  this.particleRemoveBufferSize = 0;
  this.particleStartDelayBufferSize = 0;

  this.dynamicObjectIndices = [];
  this.dynamicObjects = [];
  this.dynamicObjectGroupIndices = [];
  this.dynamicObjectGroups = [];

  this.dynamicObjectIndicesControlMap = new Object();
  this.dynamicObjectGroupIndicesControlMap = new Object();
  this.dynamicObjectsControlMap = new Object();
  this.dynamicObjectGroupsControlMap = new Object();

  var workerHandlerContext = this;

  if (isPhysicsWorkerEnabled()){
    this.physicsWorker.onmessage = function(event){
      if (event.data.topic && event.data.topic == "physicsCollisionHappened"){
        workerHandlerContext.handlePhysicsCollisionMessage(event.data);
      }else if (event.data.topic && event.data.topic == "massChangeIndex"){
        workerHandlerContext.handleMassChangeIndexMessage(event.data);
      }else{
        workerHandlerContext.handlePhysicsWorkerMessage(event.data);
      }
    };
  }

  if (isCollisionWorkerEnabled()){
    this.collisionWorker.onmessage = function(event){
      if (event.data.topic == "binLoop"){
        workerHandlerContext.objectBBDescriptions = event.data.content;
        workerHandlerContext.binHandlerLoop();
      }else if (event.data.topic == "debug"){
        var binText = event.data.content;
        var binObj = JSON.parse(binText);
        new WorldBinHandler(true).visualize(previewScene, binObj);
      }else if (event.data.topic == "testQuery"){
        var resultText = event.data.content;
        var resultObj = JSON.parse(resultText);
      }else if (!event.data.topic){
        workerHandlerContext.handlePSArrayLoop(event.data);
      }else if (event.data.topic == "pcNotificationArray"){
        var pcArray = event.data.content;
        var iterate = true;
        var pcIndex = 0;
        while (iterate && pcIndex < MAX_PARTICLE_COLLISION_LISTEN_COUNT){
          if (pcArray[pcIndex] > 0){
            var particle = workerHandlerContext.collidableParticleMap.get(pcArray[pcIndex]);
            particle.fireCollisionCallback();
          }else{
            iterate = false;
          }
          pcIndex ++;
        }
        workerHandlerContext.postMessage(workerHandlerContext.collisionWorker, workerHandlerContext.reusableWorkerMessage.set(
          workerHandlerContext.constants.pcNotificationArray, pcArray
        ));
      }
    };
  }

  if (isPSCollisionWorkerEnabled()){
    this.psCollisionWorker.onmessage = function(event){
      if (event.data.topic == "psBinLoop"){
        workerHandlerContext.objectPSBBDescriptions = event.data.content;
        workerHandlerContext.binHandlerLoop(true);
      }else if (event.data.topic == "debug"){
        var binText = event.data.content;
        var binObj = JSON.parse(binText);
        new WorldBinHandler(true).visualize(previewScene, binObj);
      }else if (event.data.topic == "psCollisionArrayLoop"){
        workerHandlerContext.handlePsCollisionArrayLoop(event.data.content);
      }else if (event.data.topic == "tick"){
        workerHandlerContext.handlePSTick(event.data.content);
      }else if (event.data.topic == "psRemovalLoop"){
        workerHandlerContext.handlePSRemovalLoop(event.data.content);
      }else if (event.data.topic == "psCollisionNotification"){
        var collisionArray = event.data.content;
        var iterate = true;
        var caIndex = 1;
        while (iterate){
          var safetyBit = collisionArray[caIndex];
          if (safetyBit > 0){
            var psID = collisionArray[caIndex + 1];
            var objID = collisionArray[caIndex + 2];
            var x = collisionArray[caIndex + 3];
            var y = collisionArray[caIndex + 4];
            var z = collisionArray[caIndex + 5];
            var fnX = collisionArray[caIndex + 6];
            var fnY = collisionArray[caIndex + 7];
            var fnZ = collisionArray[caIndex + 8];
            var psTime = collisionArray[caIndex + 9];
            var isObjectGroupInd = collisionArray[caIndex + 10];
            collisionArray[caIndex] = 0
            collisionArray[caIndex + 1] = 0;
            collisionArray[caIndex + 2] = 0;
            collisionArray[caIndex + 3] = 0;
            collisionArray[caIndex + 4] = 0;
            collisionArray[caIndex + 5] = 0;
            collisionArray[caIndex + 6] = 0;
            collisionArray[caIndex + 7] = 0;
            collisionArray[caIndex + 8] = 0;
            collisionArray[caIndex + 9] = 0;
            collisionArray[caIndex + 10] = 0;
            var objName = workerHandlerContext.objectIDMAp.get(objID);
            var obj;
            var qX = 0, qY = 0, qZ = 0, qW = 0;
            if (isObjectGroupInd == 0){
              obj = addedObjects[objName];
              qX = obj.previewMesh.quaternion.x;
              qY = obj.previewMesh.quaternion.y;
              qZ = obj.previewMesh.quaternion.z;
              qW = obj.previewMesh.quaternion.w;
            }else{
              obj = objectGroups[objName];
              qX = obj.previewGraphicsGroup.quaternion.x;
              qY = obj.previewGraphicsGroup.quaternion.y;
              qZ = obj.previewGraphicsGroup.quaternion.z;
              qW = obj.previewGraphicsGroup.quaternion.w;
            }
            var collisionInfo = workerHandlerContext.reusableCollisionInfo.set(
              objName, x, y, z, null, qX, qY, qZ, qW, REUSABLE_VECTOR.set(fnX, fnY, fnZ), psTime
            );
            var ps = workerHandlerContext.psIndexMap.get(psID);
            ps.fireCollisionCallback(collisionInfo);
            caIndex += 11;
          }else{
            iterate = false;
          }
        }
        workerHandlerContext.postMessage(
          workerHandlerContext.psCollisionWorker, workerHandlerContext.reusableWorkerMessage.set(
            workerHandlerContext.constants.psCollisionNotification, collisionArray
          )
        );
      }
    }
  }

  if (isPhysicsWorkerEnabled()){
    this.initPhysicsWorker();
  }
  if (isCollisionWorkerEnabled()){
    this.collidableParticleMap = new Map();
    this.initCollisionWorker();
    this.initParticleSystemsArray();
  }
  if (isPSCollisionWorkerEnabled()){
    this.initPSTickArray();
    this.initPSCollisionWorker();
    this.psIndexPool = new Object();
    this.postMessage(this.psCollisionWorker, this.reusableWorkerMessage.set(
      this.constants.tick, new Float32Array(MAX_PARTICLE_SYSTEM_COUNT)
    ));
  }

  console.log("[*] Workers initialized.");
}

WorkerHandler.prototype.postMessage = function(worker, message){
  if (message.type == MESSAGE_TYPE_BASIC){
    worker.postMessage(message);
  }else if (message.type == MESSAGE_TYPE_BUFFER){
    this.transferableBufferArray[0] = message.content.buffer;
    worker.postMessage(message, this.transferableBufferArray);
  }else if (message instanceof Float32Array){
    this.transferableBufferArray[0] = message.buffer;
    worker.postMessage(message, this.transferableBufferArray);
  }
}

WorkerHandler.prototype.handlePSTick = function(content){
  this.psTickArray= content;
  this.psTickArray.canPSSet = true;
}

WorkerHandler.prototype.initPSTickArray = function(){
  this.psTickArray = new Float32Array(MAX_PARTICLE_SYSTEM_COUNT);
}

WorkerHandler.prototype.notifyPSDeletion = function(index){
  this.psTickArray[index] = 0;
  this.postMessage(this.psCollisionWorker, this.reusableWorkerMessage.set(
    this.constants.psDeletion, index
  ));
}

WorkerHandler.prototype.notifyNewPSCreation = function(ps){
  var info = ps.generatePSCollisionInfo();
  info.type = MESSAGE_TYPE_BASIC;
  info.topic = this.constants.psCreation;
  this.postMessage(this.psCollisionWorker, info);
  this.psIndexMap.set(ps.psCollisionWorkerIndex, ps);
}

WorkerHandler.prototype.generatePSIndex = function(){
  for (var index in this.psIndexPool){
    delete this.psIndexPool[index];
    return parseInt(index);
  }
  return (TOTAL_PARTICLE_SYSTEM_COUNT - 1);
}

WorkerHandler.prototype.calculatePSSegment = function(index){
  return parseInt(index / 30);
}

WorkerHandler.prototype.initPSCollisionWorker = function(){
  this.postMessage(this.psCollisionWorker, this.reusableWorkerMessage.set(
    this.constants.maxPSCount, MAX_PARTICLE_SYSTEM_COUNT
  ));
  this.initCollisionWorker(true);
}

WorkerHandler.prototype.notifyParticleSystemStop = function(ps, newLifetime, stopTick){
  this.reusableWorkerMessage.set(this.constants.psStopped);
  this.reusableWorkerMessage.id = ps.collisionWorkerIndex;
  this.reusableWorkerMessage.pointX = newLifetime;
  this.reusableWorkerMessage.pointY = stopTick;
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage);
}

WorkerHandler.prototype.notifyParticleStartDelayChange = function(particle){
  this.particleStartDelayBuffer[particle.uuid] = particle.startDelay;
  this.particleStartDelayBufferSize ++;
}

WorkerHandler.prototype.notifyParticleCollisionListenerRemove = function(particle){
  this.particleRemoveBuffer[particle.uuid] = true;
  this.particleRemoveBufferSize ++;
  this.collidableParticleMap.delete(particle.uuid);
}

WorkerHandler.prototype.notifyParticleCollisionListenerSet = function(particle){
  var particleInfo = particle.generateCollisionWorkerInfo();
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
    this.constants.newParticle, particleInfo
  ));
  this.collidableParticleMap.set(particle.uuid, particle);
}

WorkerHandler.prototype.testPSPositionQuery = function(index){
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
    this.constants.testPSPositionQuery, index
  ));
}

WorkerHandler.prototype.handlePSArrayLoop = function(content){
  this.particleSystemsArray = content;
  this.particleSystemsArray.canParticleSet = true;
}

WorkerHandler.prototype.notifyParticleSystemRemoval = function(index){
  this.availablePSIndices[index] = true;
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
    this.constants.psRemoval, index
  ));
}

WorkerHandler.prototype.notifyNewParticleSystem = function(particleSystem){
  var newPSInfo = particleSystem.generateNewPSInfo();
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
    this.constants.newPS, newPSInfo
  ));
}

WorkerHandler.prototype.initParticleSystemsArray = function(){
  this.particleSystemsArray = new Float32Array(MAX_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS * 17);
  this.particleSystemsArray.fill(-1);
  this.availablePSIndices = new Array();
  this.currentPSIndex = 0;
  this.postMessage(this.collisionWorker, this.particleSystemsArray);
}

WorkerHandler.prototype.testQuery = function(x, y, z){
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
    this.constants.testQuery, x+","+y+","+z
  ));
}

WorkerHandler.prototype.updateObject = function(object, isPS){
  var selectedWorker = this.collisionWorker;
  if (isPS){
    selectedWorker = this.psCollisionWorker;
  }
  if (object instanceof AddedObject){
    object.previewMesh.updateMatrixWorld();
    var ary = new Float32Array(object.previewMesh.matrixWorld.elements.length + 1);
    ary[0] = object.collisionWorkerIndex;
    for (var i = 0; i<object.previewMesh.matrixWorld.elements.length; i++){
      ary[i + 1] = object.previewMesh.matrixWorld.elements[i];
    }
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.updateObject, ary
    ));
  }else if (object instanceof ObjectGroup){
    object.previewGraphicsGroup.updateMatrixWorld();
    var childCount = Object.keys(object.group).length;
    var ary = new Float32Array(childCount * (object.previewGraphicsGroup.matrixWorld.elements.length + 1));
    var totalIndex = 0;
    for (var childName in object.group){
      var childObj = object.group[childName];
      ary[totalIndex] = childObj.collisionWorkerIndex;;
      totalIndex ++;
      childObj.previewMesh.updateMatrixWorld();
      for (var i = 0; i<childObj.previewMesh.matrixWorld.elements.length; i++){
        ary[totalIndex] = childObj.previewMesh.matrixWorld.elements[i];
        totalIndex ++;
      }
    }
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.updateObjectGroup, ary
    ));
  }
}

WorkerHandler.prototype.notifyBinShow = function(object, isPS){
  var selectedWorker = this.collisionWorker;
  if (isPS){
    selectedWorker = this.psCollisionWorker;
  }
  if (object instanceof AddedObject){
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.showObject, object.name
    ));
  }else if (object instanceof ObjectGroup){
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.showObjectGroup, object.name
    ));
  }
}

WorkerHandler.prototype.notifyBinHide = function(object, isPS){
  var selectedWorker = this.collisionWorker;
  if (isPS){
    selectedWorker = this.psCollisionWorker;
  }
  if (object instanceof AddedObject){
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.hideObject, object.name
    ));
  }else if (object instanceof ObjectGroup){
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.hideObjectGroup, object.name
    ));
  }
}

WorkerHandler.prototype.notifyCollisionMassChange = function(object, mass, isPS){
  var selectedWorker = this.collisionWorker;
  if (isPS){
    selectedWorker = this.psCollisionWorker;
  }
  if (object instanceof AddedObject){
    this.reusableWorkerMessage.set(this.constants.objectMassChange);
    this.reusableWorkerMessage.id = object.name;
    this.reusableWorkerMessage.pointX = mass;
    this.postMessage(selectedWorker, this.reusableWorkerMessage);
  }else if (object instanceof ObjectGroup){
    this.reusableWorkerMessage.set(this.constants.objectGroupMassChange);
    this.reusableWorkerMessage.id = object.name;
    this.reusableWorkerMessage.pointX = mass;
    this.postMessage(selectedWorker, this.reusableWorkerMessage);
  }
}

WorkerHandler.prototype.debugCollisionWorker = function(){
  this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
    this.constants.debug, ""
  ));
}

WorkerHandler.prototype.debugPSCollisionWorker = function(){
  this.postMessage(this.psCollisionWorker, this.reusableWorkerMessage.set(
    this.constants.debug, ""
  ));
}

WorkerHandler.prototype.stopBinHandlerLoop = function(isPS){
  var selectedWorker = this.collisionWorker;
  if (isPS){
    selectedWorker = this.psCollisionWorker;
  }
  selectedWorker.terminate();
}

WorkerHandler.prototype.binHandlerLoop = function(isPS){
  var selectedBBDescriptions = this.objectBBDescriptions;
  if (isPS){
    selectedBBDescriptions = this.objectPSBBDescriptions;
  }
  for (var objName in dynamicObjects){
    dynamicObjects[objName].updateCollisionWorkerInfo(selectedBBDescriptions);
  }
  for (var objName in dynamicObjectGroups){
    for (var childName in dynamicObjectGroups[objName].group){
      dynamicObjectGroups[objName].group[childName].updateCollisionWorkerInfo(selectedBBDescriptions);
    }
  }
  if (isPS){
    this.sendBinHandlerMessage_PS = true;
  }else{
    this.sendBinHandlerMessage = true;
  }
}

WorkerHandler.prototype.initCollisionWorker = function(isPS){

  if (!isPS){
    this.postMessage(this.collisionWorker, this.reusableWorkerMessage.set(
      this.constants.maxParticleCollisionCount, MAX_PARTICLE_COLLISION_LISTEN_COUNT
    ));
  }

  var selectedWorker = this.collisionWorker;
  if (isPS){
    selectedWorker = this.psCollisionWorker;
  }
  this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
    this.constants.worldLimits,
    LIMIT_BOUNDING_BOX.min.x+","+LIMIT_BOUNDING_BOX.min.y+","+LIMIT_BOUNDING_BOX.min.z+","+
    LIMIT_BOUNDING_BOX.max.x+","+LIMIT_BOUNDING_BOX.max.y+","+LIMIT_BOUNDING_BOX.max.z
  ));
  this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
    this.constants.particlePositionHistorySize, PARTICLE_POSITION_HISTORY_SIZE
  ));
  this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
    this.constants.binSize, BIN_SIZE
  ));
  var totalObjectCount = Object.keys(addedObjects).length;
  for (var objName in objectGroups){
    var group = objectGroups[objName].group;
    totalObjectCount += Object.keys(group).length;
  }
  var objectBBDescriptions = new Float32Array(totalObjectCount * 20);
  var index = 0;
  for (var objName in addedObjects){
    addedObjects[objName].generateCollisionWorkerInfo(index, objectBBDescriptions);
    this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
      this.constants.objectIndex, objName+","+index)
    );
    this.objectIDMAp.set(index, objName);
    if (addedObjects[objName].isDynamicObject){
      this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
        this.constants.dynamicObjectNotification, objName
      ));
    }
    index += 20;
  }
  for (var objName in objectGroups){
    objectGroups[objName].previewGraphicsGroup.updateMatrixWorld();
    var group = objectGroups[objName].group;
    for (var childName in group){
      group[childName].generateCollisionWorkerInfo(index, objectBBDescriptions);
      this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
        this.constants.objectIndex, objName+","+childName+","+index
      ));
      this.objectIDMAp.set(index, objName);
      index += 20;
    }
    if (objectGroups[objName].isDynamicObject){
      this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
        this.constants.dynamicObjectGroupNotification, objName
      ));
    }
  }
  this.objectBBDescriptions = objectBBDescriptions;
  this.postMessage(selectedWorker, this.reusableWorkerMessage.set(
    this.constants.bbDescriptions, this.objectBBDescriptions
  ));
}

WorkerHandler.prototype.handleMassChangeIndexMessage = function(msg){
  var index = msg.id;
  var type = msg.pointX;
  if (type == 0){
    if (typeof this.dynamicObjectIndicesControlMap[index] == UNDEFINED){
      this.dynamicObjectIndices.push(index);
      this.dynamicObjectIndicesControlMap[index] = true;
    }
  }else if (type == 1){
    if (typeof this.dynamicObjectGroupIndicesControlMap[index] == UNDEFINED){
      this.dynamicObjectGroupIndices.push(index);
      this.dynamicObjectGroupIndicesControlMap[index] = true;
    }
  }
}

WorkerHandler.prototype.handlePhysicsCollisionMessage = function(msg){
  var sourceName = msg.id;
  var targetName = msg.forceY;
  var collisionPositionX = msg.pointX;
  var collisionPositionY = msg.pointY;
  var collisionPositionZ = msg.pointZ;
  var collisionImpact = msg.forceX;
  var quaternionX = msg.qx;
  var quaternionY = msg.qy;
  var quaternionZ = msg.qz;
  var quaternionW = msg.qw;
  var curCollisionCallbackRequest = collisionCallbackRequests[sourceName];
  if (curCollisionCallbackRequest){
    var collisionInfo = new CollisionInfo(
      targetName, collisionPositionX, collisionPositionY, collisionPositionZ,
      collisionImpact, quaternionX, quaternionY, quaternionZ, quaternionW
    );
    var sourceObject = addedObjects[sourceName] || objectGroups[sourceName];
    curCollisionCallbackRequest.bind(sourceObject)(collisionInfo);
  }
}

WorkerHandler.prototype.handlePhysicsWorkerMessage = function(msg){
  var ary = msg.content;
  this.physicsInformationArray = ary;
  for (var i = 0; i<this.dynamicObjectIndices.length; i++){
    var index = this.dynamicObjectIndices[i];
    var positionX = ary[index + 1];
    var positionY = ary[index + 2];
    var positionZ = ary[index + 3];
    var quaternionX = ary[index + 4];
    var quaternionY = ary[index + 5];
    var quaternionZ = ary[index + 6];
    var quaternionW = ary[index + 7];
    var object = this.dynamicObjects[i];
    object.previewMesh.position.set(positionX, positionY, positionZ);
    object.physicsBody.position.set(positionX, positionY, positionZ);
    object.physicsBody.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
    setTHREEQuaternionFromCANNON(
      object.previewMesh, object.physicsBody, object.metaData.axis,
      object.type, object.metaData.gridSystemAxis
    );
  }
  for (var i = 0; i<this.dynamicObjectGroupIndices.length; i++){
    var index = this.dynamicObjectGroupIndices[i];
    var positionX = ary[index + 2];
    var positionY = ary[index + 3];
    var positionZ = ary[index + 4];
    var quaternionX = ary[index + 5];
    var quaternionY = ary[index + 6];
    var quaternionZ = ary[index + 7];
    var quaternionW = ary[index + 8];
    var object = this.dynamicObjectGroups[i];
    object.previewGraphicsGroup.position.set(positionX, positionY, positionZ);
    object.physicsBody.position.set(positionX, positionY, positionZ);
    object.previewGraphicsGroup.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
    object.physicsBody.quaternion.set(quaternionX, quaternionY, quaternionZ, quaternionW);
  }
  this.physicsWorkerFunction();
}

WorkerHandler.prototype.log = function(worker, msg){
  if (WORKERS_DEBUG_MODE_ENABLED){
    console.log("["+worker.name+"]: "+msg.topic+" -> "+msg.content);
  }
}

WorkerHandler.prototype.initPhysicsWorker = function(){
  var messages = [];
  messages.push(new WorkerMessage("surfacePhysicalThickness", surfacePhysicalThickness));
  messages.push(new WorkerMessage("physicsStepAmount", physicsStepAmount));
  messages.push(new WorkerMessage("quatNormalizeSkip", quatNormalizeSkip));
  messages.push(new WorkerMessage("quatNormalizeFast", quatNormalizeFast));
  messages.push(new WorkerMessage("contactEquationStiffness", contactEquationStiffness));
  messages.push(new WorkerMessage("contactEquationRelaxation", contactEquationRelaxation));
  messages.push(new WorkerMessage("friction", friction));
  messages.push(new WorkerMessage("iterations", physicsIterations));
  messages.push(new WorkerMessage("tolerance", physicsTolerance));
  messages.push(new WorkerMessage("gravityY", gravityY));

  for (var i = 0; i<messages.length; i++){
    this.postMessage(this.physicsWorker, messages[i]);
  }

}

WorkerHandler.prototype.startPhysicsWorkerIteration = function(){
  this.dynamicObjectIndices = [];
  this.dynamicObjects = [];
  this.dynamicObjectGroupIndices = [];
  this.dynamicObjectGroups = [];
  var objectSize = Object.keys(addedObjects).length;
  var objectGroupSize = Object.keys(objectGroups).length;
  this.addedObjectsLength = objectSize;
  for (var objectGroupName in objectGroups){
    var objectGroup = objectGroups[objectGroupName];
    objectSize += Object.keys(objectGroup.group).length;
  }
  this.physicsInformationArray = new Float32Array(
    (objectSize * 15) + (10 * objectGroupSize)
  );
  var index = 0;
  for (var addedObjectName in addedObjects){
    var physicsInfo = addedObjects[addedObjectName].preparePhysicsInfo();
    var splitted = physicsInfo.split(",");
    for (var i = 0; i<splitted.length; i++){
      this.physicsInformationArray[index+i] = splitted[i];
    }
    if (addedObjects[addedObjectName].isDynamicObject){
      this.dynamicObjectIndices.push(index);
      this.dynamicObjects.push(addedObjects[addedObjectName]);
      this.dynamicObjectIndicesControlMap[index] = true;
      this.dynamicObjectsControlMap[addedObjectName] = true;
    }
    index += (splitted.length);
    this.postMessage(
      this.physicsWorker, this.reusableWorkerMessage.set(
        this.constants.objectNameAndID,
        (addedObjectName+","+addedObjects[addedObjectName].physicsBody.id)
      )
    );
  }
  for (var objectGroupName in objectGroups){
    var objectGroup = objectGroups[objectGroupName];
    var info = objectGroup.preparePhysicsInfo();
    var splitted = info.split(",");
    for (var i = 0; i<splitted.length; i++){
      this.physicsInformationArray[index+i] = splitted[i];
    }
    if (objectGroup.isDynamicObject){
      this.dynamicObjectGroupIndices.push(index);
      this.dynamicObjectGroups.push(objectGroup);
      this.dynamicObjectGroupIndicesControlMap[index] = true;
      this.dynamicObjectGroupIndicesControlMap[objectGroupName] = true;
    }
    index += (splitted.length);
    this.postMessage(
      this.physicsWorker, this.reusableWorkerMessage.set(
        this.constants.objectNameAndID,
        (objectGroupName+","+objectGroup.physicsBody.id)
      )
    );
  }
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage.set(
    this.constants.addedObjectsLength, this.addedObjectsLength
  ));
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage.set(
    this.constants.physicsInfo, this.physicsInformationArray
  ));
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage.set(
    this.constants.startIterating, ""
  ));
}

WorkerHandler.prototype.stopPhysicsWorkerIteration = function(){
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage.set(
    this.constants.stopIterating, ""
  ));
  clearTimeout(this.physicsTimeoutID);
  this.physicsWorker.terminate();
}

WorkerHandler.prototype.hideObjectPhysics = function(physicsBodyID){
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage.set(
    this.constants.hideObject, physicsBodyID
  ));
}

WorkerHandler.prototype.showObjectPhysics = function(physicsBodyID){
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage.set(
    this.constants.showObject, physicsBodyID
  ));
}

WorkerHandler.prototype.applyForceToObject = function(object, force, point){
  if (object.physicsBody.mass ==  0){
    return;
  }
  this.reusableWorkerMessage.set(this.constants.applyForce);
  this.reusableWorkerMessage.id = object.physicsBody.id;
  this.reusableWorkerMessage.forceX = force.x;
  this.reusableWorkerMessage.forceY = force.y;
  this.reusableWorkerMessage.forceZ = force.z;
  this.reusableWorkerMessage.pointX = point.x;
  this.reusableWorkerMessage.pointY = point.y;
  this.reusableWorkerMessage.pointZ = point.z;
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage);
}

WorkerHandler.prototype.syncPhysics = function(object){
  this.reusableWorkerMessage.set(this.constants.sync);
  this.reusableWorkerMessage.id = object.physicsBody.id;
  this.reusableWorkerMessage.pointX = object.physicsBody.position.x;
  this.reusableWorkerMessage.pointY = object.physicsBody.position.y;
  this.reusableWorkerMessage.pointZ = object.physicsBody.position.z;
  this.reusableWorkerMessage.qx = object.physicsBody.quaternion.x;
  this.reusableWorkerMessage.qy = object.physicsBody.quaternion.y;
  this.reusableWorkerMessage.qz = object.physicsBody.quaternion.z;
  this.reusableWorkerMessage.qw = object.physicsBody.quaternion.w;
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage);
}

WorkerHandler.prototype.notifyMassChange = function(object, mass){
  var type;
  if (object instanceof AddedObject){
    type = 0;
    if (mass > 0){
      if (typeof this.dynamicObjectsControlMap[object.name] == UNDEFINED){
        this.dynamicObjects.push(object);
        this.dynamicObjectsControlMap[object.name] = true;
      }
    }
  }else if (object instanceof ObjectGroup){
    type = 1;
    if (mass > 0){
      if (typeof this.dynamicObjectGroupsControlMap[object.name] == UNDEFINED){
        this.dynamicObjectGroups.push(object);
        this.dynamicObjectGroupsControlMap[object.name] = true;
      }
    }
  }
  this.reusableWorkerMessage.set(this.constants.massChange);
  this.reusableWorkerMessage.id = object.physicsBody.id;
  this.reusableWorkerMessage.pointX = mass;
  this.reusableWorkerMessage.pointY = type;
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage);
}

WorkerHandler.prototype.notifyPhysicsCollisionRequest = function(object){
  this.reusableWorkerMessage.set(this.constants.collisionRequest, object.name);
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage);
}

WorkerHandler.prototype.notifyPhysicsCollisionRemoval = function(object){
  this.reusableWorkerMessage.set(this.constants.collisionRemoval, object.name);
  this.postMessage(this.physicsWorker, this.reusableWorkerMessage);
}
