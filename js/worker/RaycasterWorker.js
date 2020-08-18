importScripts("../third_party/three.min.js");
importScripts("../third_party/cannon.min.js");
importScripts("../core/globalVariables.js");
importScripts("../handler/RayCaster.js");
importScripts("../handler/WorldBinHandler.js");
importScripts("../worker/StateLoaderLightweight.js");
importScripts("../engine_objects/GridSystem.js");
importScripts("../engine_objects/AddedObject.js");
importScripts("../engine_objects/ObjectGroup.js");
importScripts("../engine_objects/AddedText.js");
importScripts("../engine_objects/PreconfiguredParticleSystem.js");
importScripts("../handler/ParticleSystemGenerator.js");
importScripts("../engine_objects/Particle.js");
importScripts("../engine_objects/ParticleSystem.js");
importScripts("../handler/factory/RaycasterFactory.js");
importScripts("../engine_objects/CollisionInfo.js");
importScripts("../handler/WorldBinHandler2D.js");
importScripts("../handler/ObjectPicker2D.js");
importScripts("../engine_objects/Rectangle.js");
importScripts("../engine_objects/Sprite.js");
importScripts("../engine_objects/Container2D.js");
importScripts("../engine_objects/VirtualKeyboard.js");

var IS_WORKER_CONTEXT = true;
var objectPicker2D = new ObjectPicker2D();

// CLASS DEFINITION
var RaycasterWorker = function(){
  this.record = false;
  this.performanceLogs = {isPerformanceLog: true, updateTime: 0, binHandlerCacheHitCount: 0}
  this.reusableVector1 = new THREE.Vector3();
  this.reusableVector2 = new THREE.Vector3();
  this.reusableQuaternion = new THREE.Quaternion();
  this.reusableMatrix = new THREE.Matrix4();
  this.reusableArray16 = new Array();
  this.rayCaster = raycasterFactory.get();
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
  stateLoader.loadParticleSystems();
  var idCounter = 0;
  var psIDCounter = 0;
  var idResponse = [];
  this.workerIDsByObjectName = new Object();
  this.workerIDsByParticleSystemName = new Object();
  this.objectsByWorkerID = new Object();
  this.particleSystemsByWorkerID = new Object();
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
  for (var spriteName in sprites){
    sprites[spriteName].workerID = idCounter ++;
    idResponse.push({type: "sprite", name: spriteName, id: sprites[spriteName].workerID});
    this.workerIDsByObjectName[spriteName] = sprites[spriteName].workerID;
    this.objectsByWorkerID[sprites[spriteName].workerID] = sprites[spriteName];
  }
  for (var containerName in containers){
    containers[containerName].workerID = idCounter ++;
    idResponse.push({type: "container", name: containerName, id: containers[containerName].workerID});
    this.workerIDsByObjectName[containerName] = containers[containerName].workerID;
    this.objectsByWorkerID[containers[containerName].workerID] = containers[containerName];
  }
  for (var vkName in virtualKeyboards){
    for (var containerName in virtualKeyboards[vkName].childContainersByContainerName){
      var container = virtualKeyboards[vkName].childContainersByContainerName[containerName];
      container.workerID = idCounter ++;
      idResponse.push({type: "container", name: containerName, id: container.workerID});
      this.workerIDsByObjectName[containerName] = container.workerID;
      this.objectsByWorkerID[container.workerID] = container;
    }
  }
  for (var psName in particleSystemPool){
    particleSystemPool[psName].workerID = psIDCounter ++;
    idResponse.push({type: "particleSystem", name: psName, id: particleSystemPool[psName].workerID});
    this.workerIDsByParticleSystemName[psName] = particleSystemPool[psName].workerID;
    this.particleSystemsByWorkerID[particleSystemPool[psName].workerID] = particleSystemPool[psName];
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
        if (!obj.isHidden){
          this.rayCaster.updateObject(obj, true);
        }
        if (!obj.isHidden && intersectableObjDescription[i+1] < 0){
          this.rayCaster.hide(obj);
          obj.isHidden = true;
        }else if (obj.isHidden && intersectableObjDescription[i+1] > 0){
          this.rayCaster.show(obj);
          obj.isHidden = false;
        }
      }else if (obj.isAddedText){
        if (obj.is2D){
          obj.twoDimensionalSize.x = intersectableObjDescription[i + 2];
          obj.twoDimensionalSize.y = intersectableObjDescription[i + 3];
          obj.twoDimensionalSize.z = intersectableObjDescription[i + 4];
          obj.twoDimensionalSize.w = intersectableObjDescription[i + 5];
        }else{
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
        }
        if (!obj.isHidden){
          this.rayCaster.updateObject(obj, true);
        }
        if (!obj.isHidden && intersectableObjDescription[i+1] < 0){
          this.rayCaster.hide(obj);
          obj.isHidden = true;
        }else if (obj.isHidden && intersectableObjDescription[i+1] > 0){
          this.rayCaster.show(obj);
          obj.isHidden = false;
        }
      }else if (obj.isSprite){
        obj.rectangle.set(
          intersectableObjDescription[i + 2], intersectableObjDescription[i + 3],
          intersectableObjDescription[i + 4], intersectableObjDescription[i + 5],
          intersectableObjDescription[i + 6], intersectableObjDescription[i + 7]
        );
        obj.reusableVector1.set(intersectableObjDescription[i + 8], intersectableObjDescription[i + 9], 0);
        obj.reusableVector2.set(intersectableObjDescription[i + 10], intersectableObjDescription[i + 11], 0);
        obj.reusableVector3.set(intersectableObjDescription[i + 12], intersectableObjDescription[i + 13], 0);
        obj.reusableVector4.set(intersectableObjDescription[i + 14], intersectableObjDescription[i + 15], 0);
        obj.triangle1.set(obj.reusableVector1, obj.reusableVector3, obj.reusableVector2);
        obj.triangle2.set(obj.reusableVector3, obj.reusableVector4, obj.reusableVector2);
        if (!obj.isHidden){
          this.rayCaster.updateObject(obj, true);
        }
        if (!obj.isHidden && intersectableObjDescription[i+1] < 0){
          this.rayCaster.hide(obj);
          obj.isHidden = true;
        }else if (obj.isHidden && intersectableObjDescription[i+1] > 0){
          this.rayCaster.show(obj);
          obj.isHidden = false;
        }
      }else if (obj.isContainer){
        obj.rectangle.set(
          intersectableObjDescription[i + 2], intersectableObjDescription[i + 3],
          intersectableObjDescription[i + 4], intersectableObjDescription[i + 5],
          intersectableObjDescription[i + 6], intersectableObjDescription[i + 7]
        );
        if (!obj.isHidden){
          this.rayCaster.updateObject(obj, true);
        }
        if (!obj.isHidden && intersectableObjDescription[i+1] < 0){
          this.rayCaster.hide(obj);
          obj.isHidden = true;
        }else if (obj.isHidden && intersectableObjDescription[i+1] > 0){
          this.rayCaster.show(obj);
          obj.isHidden = false;
        }
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
  if (transferableMessageBody.flagsDescription[3] > 0){
    var particleSystemStatusDescription = transferableMessageBody.particleSystemStatusDescription;
    for (var i = 0; i<particleSystemStatusDescription.length; i+= 20){
      var particleSystem = this.particleSystemsByWorkerID[particleSystemStatusDescription[i]];
      var statusType = particleSystemStatusDescription[i+1];
      switch (statusType){
        case PARTICLE_SYSTEM_ACTION_TYPE_START:
          var isStartPositionDefined = (particleSystemStatusDescription[i+2] > 0);
          var isStartVelocityDefined = (particleSystemStatusDescription[i+3] > 0);
          var isStartAccelerationDefined = (particleSystemStatusDescription[i+4] > 0);
          var isStartQuaternionDefined = (particleSystemStatusDescription[i+5] > 0);
          if (isStartPositionDefined){
            var startPositionX = particleSystemStatusDescription[i+6]; var startPositionY = particleSystemStatusDescription[i+7]; var startPositionZ = particleSystemStatusDescription[i+8];
            REUSABLE_VECTOR.set(startPositionX, startPositionY, startPositionZ);
            reusableParticleSystemStartConfiguration.startPosition = REUSABLE_VECTOR;
          }else{
            reusableParticleSystemStartConfiguration.startPosition = undefined;
          }
          if (isStartVelocityDefined){
            var startVelocityX = particleSystemStatusDescription[i+9]; var startVelocityY = particleSystemStatusDescription[i+10]; var startVelocityZ = particleSystemStatusDescription[i+11];
            REUSABLE_VECTOR_2.set(startVelocityX, startVelocityY, startVelocityZ);
            reusableParticleSystemStartConfiguration.startVelocity = REUSABLE_VECTOR_2;
          }else{
            reusableParticleSystemStartConfiguration.startVelocity = undefined;
          }
          if (isStartAccelerationDefined){
            var startAccelerationX = particleSystemStatusDescription[i+12]; var startAccelerationY = particleSystemStatusDescription[i+13]; var startAccelerationZ = particleSystemStatusDescription[i+14];
            REUSABLE_VECTOR_3.set(startAccelerationX, startAccelerationY, startAccelerationZ);
            reusableParticleSystemStartConfiguration.startAcceleration = REUSABLE_VECTOR_3;
          }else{
            reusableParticleSystemStartConfiguration.startAcceleration = undefined;
          }
          if (isStartQuaternionDefined){
            var startQuaternionX = particleSystemStatusDescription[i+15]; var startQuaternionY = particleSystemStatusDescription[i+16]; var startQuaternionZ = particleSystemStatusDescription[i+17]; var startQuaternionW = particleSystemStatusDescription[i+18];
            REUSABLE_QUATERNION.set(startQuaternionX, startQuaternionY, startQuaternionZ, startQuaternionW);
            reusableParticleSystemStartConfiguration.startQuaternion = REUSABLE_QUATERNION;
          }else{
            reusableParticleSystemStartConfiguration.startQuaternion = undefined;
          }
          particleSystem.start(reusableParticleSystemStartConfiguration);
        break;
        case PARTICLE_SYSTEM_ACTION_TYPE_HIDE:
          particleSystem.hide();
        break;
        case PARTICLE_SYSTEM_ACTION_TYPE_STOP:
          var stopDuration = particleSystemStatusDescription[i+19];
          particleSystem.stop(stopDuration);
        break;
      }
      particleSystemStatusDescription[i+1] = PARTICLE_SYSTEM_ACTION_TYPE_NONE;
    }
  }
  if (transferableMessageBody.flagsDescription[1] > 0){
    var intersectionTestDescription = transferableMessageBody.intersectionTestDescription;
    for (var i = 0; i<intersectionTestDescription.length; i+= 11){
      intersectionObject = 0, intersectionPoint = 0;
      if (intersectionTestDescription[i] >= 0){
        var test2D = intersectionTestDescription[i + 8] > 0;
        if (test2D && !(mode == 0 && keyboardBuffer["Shift"])){
          objectPicker2D.find(intersectionTestDescription[i + 9], intersectionTestDescription[i + 10]);
        }
        if (!intersectionPoint){
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
        }else{
          intersectionTestDescription[i+1] = this.workerIDsByObjectName[intersectionObject];
          intersectionTestDescription[i+2] = intersectionPoint.x; intersectionTestDescription[i+3] = intersectionPoint.y; intersectionTestDescription[i+4] = intersectionPoint.z;
        }
      }
    }
  }
  worker.particleSystemCollisionBufferIndex = 0;
  worker.particleCollisionBufferIndex = 0;
  worker.particleSystemCollisionBuffer = transferableMessageBody.particleSystemCollisionCallbackDescription;
  worker.particleCollisionBuffer = transferableMessageBody.particleCollisionCallbackDescription;
  particleSystems.forEach(worker.psCollisionHandlerFunc);
  if (this.record){
    this.performanceLogs.updateTime = performance.now() - updateStartTime;
    this.performanceLogs.binHandlerCacheHitCount = rayCaster.binHandler.cacheHitCount;
  }
}

RaycasterWorker.prototype.psCollisionHandlerFunc = function(particleSystem, psName){
  if (particleSystem && !particleSystem.destroyed){
    particleSystem.update();
  }
}

RaycasterWorker.prototype.onParticleSystemCollision = function(particleSystem, collisionInfo){
  var index = worker.particleSystemCollisionBufferIndex;
  worker.particleSystemCollisionBuffer[index++] = worker.workerIDsByParticleSystemName[particleSystem.name];
  worker.particleSystemCollisionBuffer[index++] = worker.workerIDsByObjectName[collisionInfo.targetObjectName];
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.x;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.y;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.z;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.quaternionX;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.quaternionY;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.quaternionZ;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.quaternionW;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.faceNormalX;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.faceNormalY;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.faceNormalZ;
  worker.particleSystemCollisionBuffer[index++] = collisionInfo.particleSystemTime;
  worker.particleSystemCollisionBufferIndex += 13;
}

RaycasterWorker.prototype.onParticleCollision = function(particle){
  worker.particleCollisionBuffer[worker.particleCollisionBufferIndex++] = particle.uuid;
}

RaycasterWorker.prototype.onParticleSystemSetCollisionListener = function(data){
  var particleSystem = particleSystemPool[data.psName];
  particleSystem.setCollisionListener(noop, data.collisionTimeOffset);
}

RaycasterWorker.prototype.onParticleSystemRemoveCollisionListener = function(data){
  var particleSystem = particleSystemPool[data.psName];
  particleSystem.removeCollisionListener();
}

RaycasterWorker.prototype.set2DTextSizes = function(data){
  if (!renderer.viewport){
    return;
  }
  screenResolution = data.screenResolution;
  renderer.viewport.x = data.vp.x;
  renderer.viewport.y = data.vp.y;
  renderer.viewport.z = data.vp.z;
  renderer.viewport.w = data.vp.w;
  var msgBody = data.body;
  for (var textName in msgBody.texts){
    addedTexts[textName].twoDimensionalSize.set(msgBody.texts[textName].x, msgBody.texts[textName].y, msgBody.texts[textName].z, msgBody.texts[textName].w);
  }
  for (var spriteName in msgBody.sprites){
    var sprite = sprites[spriteName];
    var spriteExport = msgBody.sprites[spriteName];
    sprite.rectangle = new Rectangle(0, 0, 0, 0).set(
      spriteExport.x, spriteExport.y,
      spriteExport.finalX, spriteExport.finalY,
      spriteExport.width, spriteExport.height
    );
    sprite.triangle1.set(spriteExport.triangle1.a, spriteExport.triangle1.b, spriteExport.triangle1.c);
    sprite.triangle2.set(spriteExport.triangle2.a, spriteExport.triangle2.b, spriteExport.triangle2.c);
  }
  var stateLoader = new StateLoaderLightweight();
  for (var containerName in msgBody.containers){
    var wid;
    if (containers[containerName]){
      wid = containers[containerName].workerID;
    }
    containers[containerName] = stateLoader.containerImportFunc(containerName, msgBody.containers[containerName]);
    if (containers[containerName].isClickable){
      clickableContainers[containerName] = containers[containerName];
    }
    if (!(typeof wid == UNDEFINED)){
      containers[containerName].workerID = wid;
      this.objectsByWorkerID[wid] = containers[containerName];
    }
  }
  for (var virtualKeyboardName in msgBody.virtualKeyboards){
    stateLoader.virtualKeyboardImportFunc(virtualKeyboardName, msgBody.virtualKeyboards[virtualKeyboardName]);
  }
  this.rayCaster.refresh2D();
}

// START
raycasterFactory = new RaycasterFactory();
var particleSystemGenerator = new ParticleSystemGenerator();
var renderer = new Object();
var camera = new Object();
var worker = new RaycasterWorker();
rayCaster = raycasterFactory.get();
var reusableParticleSystemStartConfiguration = {};
reusableCollisionInfo = new CollisionInfo();

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
  }else if (msg.data.altPress){
    if (msg.data.altPress.isPressed){
      keyboardBuffer["Alt"] = true;
    }else{
      keyboardBuffer["Alt"] = false;
    }
  }else if (msg.data.particleSystemSetCollisionListener){
    worker.onParticleSystemSetCollisionListener(msg.data.particleSystemSetCollisionListener);
  }else if (msg.data.particleSystemRemoveCollisionListener){
    worker.onParticleSystemRemoveCollisionListener(msg.data.particleSystemRemoveCollisionListener);
  }else if (msg.data.refresh2D){
    worker.set2DTextSizes(msg.data);
  }else{
    worker.update(msg.data);
    worker.transferableMessageBody = msg.data;
    worker.transferableList[0] = worker.transferableMessageBody.intersectableObjDescription.buffer;
    worker.transferableList[1] = worker.transferableMessageBody.intersectionTestDescription.buffer;
    worker.transferableList[2] = worker.transferableMessageBody.flagsDescription.buffer;
    worker.transferableList[3] = worker.transferableMessageBody.cameraOrientationDescription.buffer;
    worker.transferableList[4] = worker.transferableMessageBody.addedTextScaleDescription.buffer;
    worker.transferableList[5] = worker.transferableMessageBody.particleSystemStatusDescription.buffer;
    worker.transferableList[6] = worker.transferableMessageBody.particleCollisionCallbackDescription.buffer;
    worker.transferableList[7] = worker.transferableMessageBody.particleSystemCollisionCallbackDescription.buffer;
    postMessage(worker.transferableMessageBody);
  }
}
