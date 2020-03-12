var RaycasterWorkerBridge = function(){
  this.record = false;
  this.isRaycasterWorkerBridge = true;
  this.worker = new Worker("./js/worker/RaycasterWorker.js");
  this.ready = false;
  this.updateBuffer = new Map();
  this.addedTextScaleUpdateBuffer = new Map();
  this.particleSystemStatusUpdateBuffer = new Map();
  this.hasOwnership = false;
  this.maxIntersectionCountInAFrame = 10;
  this.curIntersectionTestRequestCount = 0;
  this.performanceLogs = {
    intersectableObjDescriptionLen: 0, intersectionTestDescriptionLen: 0,
    flagsDescriptionLen: 0, cameraOrientationDescriptionLen: 0, addedTextScaleDescriptionLen: 0,
    particleCollisionCallbackDescriptionLen: 0, particleSystemCollisionCallbackDescriptionLen: 0,flushTime: 0
  };
  this.intersectionTestBuffer = {
    isActive: false, fromVectors: [] , directionVectors: [],
    intersectGridSystems: [], callbackFunctions: [], test2D: []
  };
  for (var i = 0 ; i < this.maxIntersectionCountInAFrame; i ++){
    this.intersectionTestBuffer.fromVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.directionVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.intersectGridSystems.push(false);
    this.intersectionTestBuffer.callbackFunctions.push(noop);
    this.intersectionTestBuffer.test2D.push({test: false, x: null, y: null});
  }
  this.worker.addEventListener("message", function(msg){
    if (msg.data.isPerformanceLog){
      console.log("%c                    RAYCASTER WORKER                  ", "background: black; color: lime");
      console.log("%cUpdate time: "+msg.data.updateTime+" ms", "background: black; color: magenta");
      console.log("%cBinhandler cache hit count: "+msg.data.binHandlerCacheHitCount, "background: black; color: magenta");
    }else if (msg.data.type){
      rayCaster.objectsByWorkerID = new Object();
      rayCaster.idsByObjectNames = new Object();
      rayCaster.particleSystemsByWorkerID = new Object();
      rayCaster.idsByParticleSystemNames = new Object();
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
        }else if (msg.data.ids[i].type == "sprite"){
          var sprite = sprites[msg.data.ids[i].name];
          var spriteWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[spriteWorkerID] = sprite;
          rayCaster.idsByObjectNames[sprite.name] = spriteWorkerID;
        }else if (msg.data.ids[i].type == "container"){
          var container = containers[msg.data.ids[i].name];
          if (!container){
            container = childContainers[msg.data.ids[i].name].childContainersByContainerName[msg.data.ids[i].name];
          }
          var containerWorkerID = msg.data.ids[i].id;
          rayCaster.objectsByWorkerID[containerWorkerID] = container;
          rayCaster.idsByObjectNames[container.name] = containerWorkerID;
        }else if (msg.data.ids[i].type == "particleSystem"){
          var particleSystem = particleSystemPool[msg.data.ids[i].name];
          var particleSystemWorkerID = msg.data.ids[i].id;
          rayCaster.particleSystemsByWorkerID[particleSystemWorkerID] = particleSystem;
          rayCaster.idsByParticleSystemNames[particleSystem.name] = particleSystemWorkerID;
        }else{
          throw new Error("Not implemented.");
        }
      }
      // GENERATE TRANSFERABLE MESSAGE BODY
      rayCaster.transferableMessageBody = {};
      rayCaster.transferableList = [];
      var intersectablesAry = [];
      var intersectableArrayIndex = 0;
      for (var objName in sceneHandler.getAddedObjects()){
        var obj = addedObjects[objName];
        var insertObjectToBuffer = (mode == 0) || (mode == 1 && obj.isIntersectable && (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)));
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
      for (var objName in sceneHandler.getObjectGroups()){
        var obj = objectGroups[objName];
        var insertObjectToBuffer = (mode == 0) || (mode == 1 && obj.isIntersectable && (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)));
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
      var addedTextScaleDescriptionArray = [];
      var addedTextScaleDescriptionIndex = 0;
      for (var textName in sceneHandler.getAddedTexts()){
        var text = addedTexts[textName];
        var insertTextToBuffer = ((mode == 0) || (mode == 1 && text.isClickable));
        if (insertTextToBuffer){
          text.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
          text.indexInTextScaleDescriptionArray = addedTextScaleDescriptionIndex;
          intersectablesAry.push(rayCaster.idsByObjectNames[text.name]);
          intersectablesAry.push(1);
          addedTextScaleDescriptionArray.push(rayCaster.idsByObjectNames[text.name]);
          if (!text.is2D){
            text.mesh.updateMatrixWorld();
            for (var i = 0; i<text.mesh.matrixWorld.elements.length; i++){
              intersectablesAry.push(text.mesh.matrixWorld.elements[i]);
            }
          }else{
            text.handleResize();
            intersectablesAry.push(text.twoDimensionalSize.x);
            intersectablesAry.push(text.twoDimensionalSize.y);
            intersectablesAry.push(text.twoDimensionalSize.z);
            intersectablesAry.push(text.twoDimensionalSize.w);
            for (var i = 0; i<12; i++){
              intersectablesAry.push(-1);
            }
          }
          intersectableArrayIndex += text.mesh.matrixWorld.elements.length + 2;
          addedTextScaleDescriptionArray.push(text.characterSize);
          addedTextScaleDescriptionArray.push(text.bottomRight.x); addedTextScaleDescriptionArray.push(text.bottomRight.y); addedTextScaleDescriptionArray.push(text.bottomRight.z);
          addedTextScaleDescriptionArray.push(text.topRight.x); addedTextScaleDescriptionArray.push(text.topRight.y); addedTextScaleDescriptionArray.push(text.topRight.z);
          addedTextScaleDescriptionArray.push(text.bottomLeft.x); addedTextScaleDescriptionArray.push(text.bottomLeft.y); addedTextScaleDescriptionArray.push(text.bottomLeft.z);
          addedTextScaleDescriptionIndex += 11;
        }
      }
      for (var spriteName in sceneHandler.getSprites()){
        var sprite = sprites[spriteName];
        var insertSpriteToBuffer = ((mode == 0) || (mode == 1 && sprite.isClickable));
        if (insertSpriteToBuffer){
          sprite.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
          intersectablesAry.push(rayCaster.idsByObjectNames[sprite.name]);
          intersectablesAry.push(1);
          sprite.handleRectangle();
          intersectablesAry.push(sprite.rectangle.x);
          intersectablesAry.push(sprite.rectangle.y);
          intersectablesAry.push(sprite.rectangle.finalX);
          intersectablesAry.push(sprite.rectangle.finalY);
          intersectablesAry.push(sprite.rectangle.width);
          intersectablesAry.push(sprite.rectangle.height);
          intersectablesAry.push(sprite.reusableVector1.x);
          intersectablesAry.push(sprite.reusableVector1.y);
          intersectablesAry.push(sprite.reusableVector2.x);
          intersectablesAry.push(sprite.reusableVector2.y);
          intersectablesAry.push(sprite.reusableVector3.x);
          intersectablesAry.push(sprite.reusableVector3.y);
          intersectablesAry.push(sprite.reusableVector4.x);
          intersectablesAry.push(sprite.reusableVector4.y);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectableArrayIndex += sprite.mesh.matrixWorld.elements.length + 2;
        }
      }
      var allContainers = new Object();
      for (var containerName in sceneHandler.getContainers()){
        allContainers[containerName] = sceneHandler.getContainers()[containerName];
      }
      for (var vkName in sceneHandler.getVirtualKeyboards()){
        for (var containerName in sceneHandler.getVirtualKeyboards()[vkName].childContainersByContainerName){
          allContainers[containerName] = sceneHandler.getVirtualKeyboards()[vkName].childContainersByContainerName[containerName];
        }
      }
      for (var containerName in allContainers){
        var container = containers[containerName];
        if (!container){
          container = childContainers[containerName].childContainersByContainerName[containerName];
        }
        container.indexInIntersectableObjDescriptionArray = intersectableArrayIndex;
        var insertContainerToBuffer = ((mode == 0) || (mode == 1 && container.isClickable));
        if (insertContainerToBuffer){
          intersectablesAry.push(rayCaster.idsByObjectNames[container.name]);
          intersectablesAry.push(1);
          container.handleRectangle();
          intersectablesAry.push(container.rectangle.x);
          intersectablesAry.push(container.rectangle.y);
          intersectablesAry.push(container.rectangle.finalX);
          intersectablesAry.push(container.rectangle.finalY);
          intersectablesAry.push(container.rectangle.width);
          intersectablesAry.push(container.rectangle.height);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectablesAry.push(-1);
          intersectableArrayIndex += 18;
        }
      }
      var particleSystemStatusDescriptionArray = [];
      var particleSystemStatusDescriptionIndex = 0;
      for (var psName in particleSystemPool){
        var particleSystem = particleSystemPool[psName];
        if (particleSystem.shouldSendToWorker()){
          particleSystemStatusDescriptionArray.push(rayCaster.idsByParticleSystemNames[particleSystem.name]);
          particleSystemStatusDescriptionArray.push(PARTICLE_SYSTEM_ACTION_TYPE_NONE);
          particleSystemStatusDescriptionArray.push(-1); particleSystemStatusDescriptionArray.push(-1); particleSystemStatusDescriptionArray.push(-1); particleSystemStatusDescriptionArray.push(-1);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0); particleSystemStatusDescriptionArray.push(0);
          particleSystemStatusDescriptionArray.push(0);
          particleSystem.indexInStatusDescriptionArray = particleSystemStatusDescriptionIndex;
          particleSystemStatusDescriptionIndex += 20;
        }
      }
      var particleCollisionCallbackArray = [];
      var particleSystemCollisionCallbackArray = [];
      for (var uuid in particleCollisionCallbackRequests){
        particleCollisionCallbackArray.push(-1);
      }
      for (var psName in particleSystemPool){
        if (particleSystemPool[psName].isCollidable){
          for (var i = 0; i<13; i++){
            particleSystemCollisionCallbackArray.push(-1);
          }
        }
      }
      var intersectableObjectDescriptionArray = new Float32Array(intersectablesAry);
      var intersectionTestDescription = new Float32Array(11 * rayCaster.maxIntersectionCountInAFrame);
      var particleSystemStatusDescription = new Float32Array(particleSystemStatusDescriptionArray);
      var cameraOrientationDescription = new Float32Array(8);
      var flagsDescription = new Float32Array(4);
      var addedTextScaleDescription = new Float32Array(addedTextScaleDescriptionArray);
      var particleCollisionCallbackDescription = new Float32Array(particleCollisionCallbackArray);
      var particleSystemCollisionCallbackDescription = new Float32Array(particleSystemCollisionCallbackArray);
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
      rayCaster.transferableMessageBody.particleSystemStatusDescription = particleSystemStatusDescription;
      rayCaster.transferableList.push(particleSystemStatusDescription.buffer);
      rayCaster.transferableMessageBody.particleCollisionCallbackDescription = particleCollisionCallbackDescription;
      rayCaster.transferableList.push(particleCollisionCallbackDescription.buffer);
      rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription = particleSystemCollisionCallbackDescription;
      rayCaster.transferableList.push(particleSystemCollisionCallbackDescription.buffer);
      rayCaster.hasOwnership = true;
      rayCaster.onReady();
    }else{
      rayCaster.transferableMessageBody= msg.data;
      rayCaster.transferableList[0] = rayCaster.transferableMessageBody.intersectableObjDescription.buffer;
      rayCaster.transferableList[1] = rayCaster.transferableMessageBody.intersectionTestDescription.buffer;
      rayCaster.transferableList[2] = rayCaster.transferableMessageBody.flagsDescription.buffer;
      rayCaster.transferableList[3] = rayCaster.transferableMessageBody.cameraOrientationDescription.buffer;
      rayCaster.transferableList[4] = rayCaster.transferableMessageBody.addedTextScaleDescription.buffer;
      rayCaster.transferableList[5] = rayCaster.transferableMessageBody.particleSystemStatusDescription.buffer;
      rayCaster.transferableList[6] = rayCaster.transferableMessageBody.particleCollisionCallbackDescription.buffer;
      rayCaster.transferableList[7] = rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription.buffer;
      var intersectionTestDescription = rayCaster.transferableMessageBody.intersectionTestDescription;
      if (rayCaster.transferableMessageBody.flagsDescription[1] > 0){
        for (var i = 0; i<intersectionTestDescription.length; i+=11){
          if (intersectionTestDescription[i] < 0){
            break;
          }
          var callbackFunc = rayCaster.intersectionTestBuffer.callbackFunctions[intersectionTestDescription[i]];
          if (intersectionTestDescription[i+1] >= 0){
            var objID = intersectionTestDescription[i+1];
            var intersectedObject = rayCaster.objectsByWorkerID[objID];
            intersectionObject = intersectedObject.name;
            REUSABLE_VECTOR.set(intersectionTestDescription[i+2], intersectionTestDescription[i+3], intersectionTestDescription[i+4]);
            intersectionPoint = REUSABLE_VECTOR;
            callbackFunc(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, intersectionObject)
          }else{
            intersectionPoint = 0;
            callbackFunc(0, 0, 0, null);
          }
        }
      }
      for (var i = 0; i<rayCaster.transferableMessageBody.particleCollisionCallbackDescription.length; i++){
        var uuid = rayCaster.transferableMessageBody.particleCollisionCallbackDescription[i];
        if (uuid == -1){
          break;
        }
        if (particleCollisionCallbackRequests[uuid]){
          particleCollisionCallbackRequests[uuid]();
        }
        rayCaster.transferableMessageBody.particleCollisionCallbackDescription[i] = -1;
      }
      for (var i = 0; i<rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription.length; i+=13){
        var psID = rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription[i];
        if (psID < 0){
          break;
        }
        var buf = rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription;
        var particleSystem = rayCaster.particleSystemsByWorkerID[psID];
        var targetObjectName = rayCaster.objectsByWorkerID[buf[i+1]].name;
        reusableCollisionInfo.set(targetObjectName, buf[i+2], buf[i+3], buf[i+4], 0, buf[i+5], buf[i+6], buf[i+7], buf[i+8], REUSABLE_VECTOR.set(buf[i+9], buf[i+10], buf[i+11]), buf[i+12]);
        particleSystem.fireCollisionCallback(reusableCollisionInfo);
        rayCaster.transferableMessageBody.particleSystemCollisionCallbackDescription[i] = -1;
      }
      rayCaster.hasOwnership = true;
    }
  });
  this.onShiftPress = function(isPressed){
    if (mode == 0){
      rayCaster.worker.postMessage({
        "shiftPress": {isPressed: isPressed}
      });
    }
  };
  this.onAltPress = function(isPressed){
    if (mode == 0){
      rayCaster.worker.postMessage({
        "altPress": {isPressed: isPressed}
      });
    }
  }
  this.issueAddedTextScaleUpdate = function(text){
    var addedTextScaleDescription = rayCaster.transferableMessageBody.addedTextScaleDescription;
    var i = text.indexInTextScaleDescriptionArray;
    addedTextScaleDescription[i+1] = text.characterSize;
    addedTextScaleDescription[i+2] = text.bottomRight.x; addedTextScaleDescription[i+3] = text.bottomRight.y; addedTextScaleDescription[i+4] = text.bottomRight.z;
    addedTextScaleDescription[i+5] = text.topRight.x; addedTextScaleDescription[i+6] = text.topRight.y; addedTextScaleDescription[i+7] = text.topRight.z;
    addedTextScaleDescription[i+8] = text.bottomLeft.x; addedTextScaleDescription[i+9] = text.bottomLeft.y; addedTextScaleDescription[i+10] = text.bottomLeft.z;
  }
  this.startRecording = function(){
    rayCaster.record = true;
  }
  this.dumpPerformanceLogs = function(){
    console.log("%cFlush time: "+this.performanceLogs.flushTime+" ms.", "background: black; color: magenta");
    console.log("%cObject description array length: "+this.performanceLogs.intersectableObjDescriptionLen, "background: black; color: magenta");
    console.log("%cAdded text scale description length: "+this.performanceLogs.addedTextScaleDescriptionLen, "background: black; color: magenta");
    console.log("%cIntersection test description length: "+this.performanceLogs.intersectionTestDescriptionLen, "background: black; color: magenta");
    console.log("%cFlags description length: "+this.performanceLogs.flagsDescriptionLen, "background: black; color: magenta");
    console.log("%cParticle collision callback description length: "+this.performanceLogs.particleCollisionCallbackDescriptionLen, "background: black; color: magenta");
    console.log("%cParticle system collision callback description length: "+this.performanceLogs.particleSystemCollisionCallbackDescriptionLen, "background: black; color: magenta");
    console.log("%cCamera orientation description length: "+this.performanceLogs.cameraOrientationDescriptionLen, "background: black; color: magenta");
  }
}

RaycasterWorkerBridge.prototype.query = noop;
RaycasterWorkerBridge.prototype.getGridSystems = noop;
RaycasterWorkerBridge.prototype.getAddedObjects = noop;
RaycasterWorkerBridge.prototype.getObjectGroups = noop;
RaycasterWorkerBridge.prototype.getAddedTexts = noop;
RaycasterWorkerBridge.prototype.update2D = noop;
RaycasterWorkerBridge.prototype.hide2D = noop;
RaycasterWorkerBridge.prototype.show2D = noop;

RaycasterWorkerBridge.prototype.refresh2D = function(){
  var totalTextObj = (mode == 0)? sceneHandler.getAddedTexts2D(): sceneHandler.getClickableAddedTexts2D();
  var totalSpriteObj = (mode == 0)? sceneHandler.getSprites(): sceneHandler.getClickableSprites();
  var totalContainerObj = (mode == 0)? sceneHandler.getContainers(): sceneHandler.getClickableContainers();
  var totalVirtualKeyboardObj = (mode == 0)? {}: sceneHandler.getVirtualKeyboards();
  var msgBody = {texts: {}, sprites: {}, containers:{}, virtualKeyboards: {}};
  for (var textName in totalTextObj){
    var size = totalTextObj[textName].twoDimensionalSize;
    msgBody.texts[textName] = {x: size.x, y: size.y, z: size.z, w: size.w};
  }
  for (var spriteName in totalSpriteObj){
    msgBody.sprites[spriteName] = totalSpriteObj[spriteName].exportLightweight();
  }
  for (var containerName in totalContainerObj){
    msgBody.containers[containerName] = totalContainerObj[containerName].exportLightweight();
  }
  for (var vkName in totalVirtualKeyboardObj){
    msgBody.virtualKeyboards[vkName] = totalVirtualKeyboardObj[vkName].exportLightweight();
  }
  var vp = {x: renderer.getCurrentViewport().x, y: renderer.getCurrentViewport().y, z: renderer.getCurrentViewport().z, w: renderer.getCurrentViewport().w}
  this.worker.postMessage({refresh2D: true, body: msgBody, vp: vp, screenResolution: screenResolution});
}

RaycasterWorkerBridge.prototype.onReady = function(){
  this.ready = true;
  if (this.onReadyCallback){
    this.onReadyCallback();
  }
  sceneHandler.onRaycasterReady();
}

RaycasterWorkerBridge.prototype.flush = function(){
  if (!this.hasOwnership || !this.ready){
    return;
  }
  var flushStartTime;
  if (this.record){
    flushStartTime = performance.now();
    this.performanceLogs.intersectableObjDescriptionLen = this.transferableMessageBody.intersectableObjDescription.length;
    this.performanceLogs.intersectionTestDescriptionLen = this.transferableMessageBody.intersectionTestDescription.length;
    this.performanceLogs.flagsDescriptionLen = this.transferableMessageBody.flagsDescription.length;
    this.performanceLogs.cameraOrientationDescriptionLen = this.transferableMessageBody.cameraOrientationDescription.length;
    this.performanceLogs.addedTextScaleDescriptionLen = this.transferableMessageBody.addedTextScaleDescription.length;
    this.performanceLogs.particleSystemStatusDescriptionLen = this.transferableMessageBody.particleSystemStatusDescription.length;
    this.performanceLogs.particleCollisionCallbackDescriptionLen = this.transferableMessageBody.particleCollisionCallbackDescription.length;
    this.performanceLogs.particleSystemCollisionCallbackDescriptionLen = this.transferableMessageBody.particleSystemCollisionCallbackDescription.length;
  }
  if (this.updateBuffer.size > 0){
    this.updateBuffer.forEach(this.issueUpdate);
    this.updateBuffer.clear();
    this.transferableMessageBody.flagsDescription[0] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[0] = -1;
  }
  if (this.addedTextScaleUpdateBuffer.size > 0){
    this.addedTextScaleUpdateBuffer.forEach(this.issueAddedTextScaleUpdate);
    this.addedTextScaleUpdateBuffer.clear();
    this.transferableMessageBody.flagsDescription[2] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[2] = -1;
  }
  if (this.particleSystemStatusUpdateBuffer.size > 0){
    this.particleSystemStatusUpdateBuffer.forEach(this.issueParticleSystemStatusUpdate);
    this.particleSystemStatusUpdateBuffer.clear();
    this.transferableMessageBody.flagsDescription[3] = 1;
  }else{
    this.transferableMessageBody.flagsDescription[3] = -1;
  }
  if (this.intersectionTestBuffer.isActive){
    var intersectionTestDescription = this.transferableMessageBody.intersectionTestDescription;
    this.transferableMessageBody.flagsDescription[1] = 1;
    var i2 = 0;
    for (var i = 0; i<this.maxIntersectionCountInAFrame; i++){
      if (i < this.curIntersectionTestRequestCount){
        intersectionTestDescription[i2++] = i;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.fromVectors[i].x;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.fromVectors[i].y;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.fromVectors[i].z;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.directionVectors[i].x;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.directionVectors[i].y;
        intersectionTestDescription[i2++] = this.intersectionTestBuffer.directionVectors[i].z;
        intersectionTestDescription[i2++] = (this.intersectionTestBuffer.intersectGridSystems[i]? 1: -1);
        intersectionTestDescription[i2++] = (this.intersectionTestBuffer.test2D.test)? 1: -1;
        intersectionTestDescription[i2++] = (this.intersectionTestBuffer.test2D.test)? this.intersectionTestBuffer.test2D.x: -1;
        intersectionTestDescription[i2++] = (this.intersectionTestBuffer.test2D.test)? this.intersectionTestBuffer.test2D.y: -1;
      }else{
        intersectionTestDescription[i2] = -1;
        i2+=11;
      }
    }
    this.intersectionTestBuffer.isActive = false;
    this.curIntersectionTestRequestCount = 0;
  }else{
    this.transferableMessageBody.flagsDescription[1] = -1;
  }
  var cameraOrientationDescription = this.transferableMessageBody.cameraOrientationDescription;
  cameraOrientationDescription[0] = camera.position.x; cameraOrientationDescription[1] = camera.position.y; cameraOrientationDescription[2] = camera.position.z;
  cameraOrientationDescription[3] = camera.quaternion.x; cameraOrientationDescription[4] = camera.quaternion.y; cameraOrientationDescription[5] = camera.quaternion.z; cameraOrientationDescription[6] = camera.quaternion.w;
  cameraOrientationDescription[7] = camera.aspect;
  this.intersectionTestBuffer.test2D.test = false;
  this.worker.postMessage(this.transferableMessageBody, this.transferableList);
  this.hasOwnership = false;
  if (this.record){
    this.performanceLogs.flushTime = performance.now() - flushStartTime;
  }
}

RaycasterWorkerBridge.prototype.refresh = function(){
  if (!projectLoaded){
    return;
  }
  this.ready = false;
  this.hasOwnership = false;
  this.updateBuffer = new Map();
  this.addedTextScaleUpdateBuffer = new Map();
  this.particleSystemStatusUpdateBuffer = new Map();
  this.intersectionTestBuffer = {
    isActive: false, fromVectors: [] , directionVectors: [],
    intersectGridSystems: [], callbackFunctions: [], test2D: []
  };
  for (var i = 0 ; i < this.maxIntersectionCountInAFrame; i ++){
    this.intersectionTestBuffer.fromVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.directionVectors.push(new THREE.Vector3());
    this.intersectionTestBuffer.intersectGridSystems.push(false);
    this.intersectionTestBuffer.callbackFunctions.push(noop);
    this.intersectionTestBuffer.test2D.push({test: false, x: null, y: null});
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

RaycasterWorkerBridge.prototype.issueParticleSystemStatusUpdate = function(ps){
  var descriptionBuffer = rayCaster.transferableMessageBody.particleSystemStatusDescription;
  var statusDescription = ps.statusDescription;
  var index = ps.indexInStatusDescriptionArray;
  descriptionBuffer[index+1] = statusDescription.type;
  if (statusDescription.type == PARTICLE_SYSTEM_ACTION_TYPE_STOP){
    descriptionBuffer[index+19] = statusDescription.stopDuration;
  }else if (statusDescription.type == PARTICLE_SYSTEM_ACTION_TYPE_START){
    if (statusDescription.isStartPositionDefined){
      descriptionBuffer[index+2] = 1;
      descriptionBuffer[index+6] = statusDescription.startPosition.x;
      descriptionBuffer[index+7] = statusDescription.startPosition.y;
      descriptionBuffer[index+8] = statusDescription.startPosition.z;
    }else{
      descriptionBuffer[index+2] = -1;
    }
    if (statusDescription.isStartVelocityDefined){
      descriptionBuffer[index+3] = 1;
      descriptionBuffer[index+9] = statusDescription.startVelocity.x;
      descriptionBuffer[index+10] = statusDescription.startVelocity.y;
      descriptionBuffer[index+11] = statusDescription.startVelocity.z;
    }else{
      descriptionBuffer[index+3] = -1;
    }
    if (statusDescription.isStartAccelerationDefined){
      descriptionBuffer[index+4] = 1;
      descriptionBuffer[index+12] = statusDescription.startAcceleration.x;
      descriptionBuffer[index+13] = statusDescription.startAcceleration.y;
      descriptionBuffer[index+14] = statusDescription.startAcceleration.z;
    }else{
      descriptionBuffer[index+4] = -1;
    }
    if (statusDescription.isStartQuaternionDefined){
      descriptionBuffer[index+5] = 1;
      descriptionBuffer[index+15] = statusDescription.startQuaternion.x;
      descriptionBuffer[index+16] = statusDescription.startQuaternion.y;
      descriptionBuffer[index+17] = statusDescription.startQuaternion.z;
      descriptionBuffer[index+18] = statusDescription.startQuaternion.z;
    }else{
      descriptionBuffer[index+5] = -1;
    }
  }
}

RaycasterWorkerBridge.prototype.issueUpdate = function(obj){
  if (mode == 1){
    if ((obj.isAddedObject || obj.isObjectGroup) && !obj.isIntersectable){
      return;
    }
    if (obj.isAddedText && !obj.isClickable){
      return;
    }
    if (obj.isSprite && !obj.isClickable){
      return;
    }
    if (obj.isContainer && !obj.isClickable){
      return;
    }
  }
  if (obj.mesh){
    obj.mesh.updateMatrixWorld();
  }
  var description = rayCaster.transferableMessageBody.intersectableObjDescription;
  if (obj.isAddedText && obj.is2D){
    description[obj.indexInIntersectableObjDescriptionArray + 2] = obj.twoDimensionalSize.x;
    description[obj.indexInIntersectableObjDescriptionArray + 3] = obj.twoDimensionalSize.y;
    description[obj.indexInIntersectableObjDescriptionArray + 4] = obj.twoDimensionalSize.z;
    description[obj.indexInIntersectableObjDescriptionArray + 5] = obj.twoDimensionalSize.w;
  }else if (obj.isSprite){
    description[obj.indexInIntersectableObjDescriptionArray + 2] = obj.rectangle.x;
    description[obj.indexInIntersectableObjDescriptionArray + 3] = obj.rectangle.y;
    description[obj.indexInIntersectableObjDescriptionArray + 4] = obj.rectangle.finalX;
    description[obj.indexInIntersectableObjDescriptionArray + 5] = obj.rectangle.finalY;
    description[obj.indexInIntersectableObjDescriptionArray + 6] = obj.rectangle.width;
    description[obj.indexInIntersectableObjDescriptionArray + 7] = obj.rectangle.height;
    description[obj.indexInIntersectableObjDescriptionArray + 8] = obj.reusableVector1.x;
    description[obj.indexInIntersectableObjDescriptionArray + 9] = obj.reusableVector1.y;
    description[obj.indexInIntersectableObjDescriptionArray + 10] = obj.reusableVector2.x;
    description[obj.indexInIntersectableObjDescriptionArray + 11] = obj.reusableVector2.y;
    description[obj.indexInIntersectableObjDescriptionArray + 12] = obj.reusableVector3.x;
    description[obj.indexInIntersectableObjDescriptionArray + 13] = obj.reusableVector3.y;
    description[obj.indexInIntersectableObjDescriptionArray + 14] = obj.reusableVector4.x;
    description[obj.indexInIntersectableObjDescriptionArray + 15] = obj.reusableVector4.y;
  }else if (obj.isContainer){
    description[obj.indexInIntersectableObjDescriptionArray + 2] = obj.rectangle.x;
    description[obj.indexInIntersectableObjDescriptionArray + 3] = obj.rectangle.y;
    description[obj.indexInIntersectableObjDescriptionArray + 4] = obj.rectangle.finalX;
    description[obj.indexInIntersectableObjDescriptionArray + 5] = obj.rectangle.finalY;
    description[obj.indexInIntersectableObjDescriptionArray + 6] = obj.rectangle.width;
    description[obj.indexInIntersectableObjDescriptionArray + 7] = obj.rectangle.height;
  }else{
    for (var i = obj.indexInIntersectableObjDescriptionArray + 2; i < obj.indexInIntersectableObjDescriptionArray + 18; i++){
      description[i] = obj.mesh.matrixWorld.elements[i - obj.indexInIntersectableObjDescriptionArray - 2]
    }
  }
  if (obj.isHidden){
    description[obj.indexInIntersectableObjDescriptionArray+1] = -1;
  }else{
    description[obj.indexInIntersectableObjDescriptionArray+1] = 1;
  }
}

RaycasterWorkerBridge.prototype.updateObject = function(obj){
  if (!this.ready){
    return;
  }
  if (mode == 1 && (obj.isAddedObject || obj.isObjectGroup) && !obj.isIntersectable){
    return;
  }
  if (mode == 1 && (obj.isAddedText && obj.is2D && !obj.isClickable)){
    return;
  }
  if (mode == 1 && (obj.isSprite && !obj.isClickable)){
    return;
  }
  if (mode == 1 && (obj.isContainer && !obj.isClickable)){
    return;
  }
  if (obj.isAddedText && obj.isEditorHelper){
    return;
  }

  this.updateBuffer.set(obj.name, obj);
}

RaycasterWorkerBridge.prototype.findIntersections = function(from, direction, intersectGridSystems, callbackFunction, coord2DX, coord2DY){
  if (this.curIntersectionTestRequestCount < this.maxIntersectionCountInAFrame){
    var i = this.curIntersectionTestRequestCount;
    this.intersectionTestBuffer.isActive = true;
    this.intersectionTestBuffer.fromVectors[i].copy(from);
    this.intersectionTestBuffer.directionVectors[i].copy(direction);
    this.intersectionTestBuffer.intersectGridSystems[i] = intersectGridSystems;
    this.intersectionTestBuffer.callbackFunctions[i] = callbackFunction;
    if (coord2DX != null && coord2DY != null){
      this.intersectionTestBuffer.test2D.test = true;
      this.intersectionTestBuffer.test2D.x = coord2DX;
      this.intersectionTestBuffer.test2D.y = coord2DY;
    }
    this.curIntersectionTestRequestCount ++;
  }
}

RaycasterWorkerBridge.prototype.hide = function(object){
  this.updateBuffer.set(object.name, object);
}

RaycasterWorkerBridge.prototype.show = function(object){
  this.updateBuffer.set(object.name, object);
}

RaycasterWorkerBridge.prototype.onParticleSystemRemoveCollisionListener = function(particleSystem){
  this.worker.postMessage({"particleSystemRemoveCollisionListener": {psName: particleSystem.name}});
}

RaycasterWorkerBridge.prototype.onParticleSystemSetCollisionListener = function(particleSystem, collisionTimeOffset){
  if (typeof collisionTimeOffset == UNDEFINED){
    collisionTimeOffset = 0;
  }
  this.worker.postMessage({"particleSystemSetCollisionListener": {psName: particleSystem.name, collisionTimeOffset: collisionTimeOffset}});
}

RaycasterWorkerBridge.prototype.onParticleSystemStart = function(particleSystem, startConfigurations){
  particleSystem.statusDescription.type = PARTICLE_SYSTEM_ACTION_TYPE_START;
  if (typeof startConfigurations.startPosition == UNDEFINED){
    particleSystem.statusDescription.isStartPositionDefined = false;
  }else{
    particleSystem.statusDescription.isStartPositionDefined = true;
    particleSystem.statusDescription.startPosition.copy(startConfigurations.startPosition);
  }
  if (typeof startConfigurations.startVelocity == UNDEFINED){
    particleSystem.statusDescription.isStartVelocityDefined = false;
  }else{
    particleSystem.statusDescription.isStartVelocityDefined = true;
    particleSystem.statusDescription.startVelocity.copy(startConfigurations.startVelocity);
  }
  if (typeof startConfigurations.startAcceleration == UNDEFINED){
    particleSystem.statusDescription.isStartAccelerationDefined = false;
  }else{
    particleSystem.statusDescription.isStartAccelerationDefined = true;
    particleSystem.statusDescription.startAcceleration.copy(startConfigurations.startAcceleration);
  }
  if (typeof startConfigurations.startQuaternion == UNDEFINED){
    particleSystem.statusDescription.isStartQuaternionDefined = false;
  }else{
    particleSystem.statusDescription.isStartQuaternionDefined = true;
    particleSystem.statusDescription.startQuaternion.copy(startConfigurations.startQuaternion);
  }
  rayCaster.particleSystemStatusUpdateBuffer.set(particleSystem.name, particleSystem);
}

RaycasterWorkerBridge.prototype.onParticleSystemStop = function(particleSystem, stopDuration){
  particleSystem.statusDescription.type = PARTICLE_SYSTEM_ACTION_TYPE_STOP;
  particleSystem.statusDescription.stopDuration = stopDuration;
  rayCaster.particleSystemStatusUpdateBuffer.set(particleSystem.name, particleSystem);
}

RaycasterWorkerBridge.prototype.onParticleSystemHide = function(particleSystem){
  particleSystem.statusDescription.type = PARTICLE_SYSTEM_ACTION_TYPE_HIDE;
  rayCaster.particleSystemStatusUpdateBuffer.set(particleSystem.name, particleSystem);
}
