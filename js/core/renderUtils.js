function render(){
  if (webglCallbackHandler.shaderCompilationError){
    return;
  }
  fpsHandler.begin();
  if (!(mode == 1 && isPaused)){
    requestID = requestAnimationFrame(render);
  }

  GLOBAL_CAMERA_POSITION_UNIFORM.value.copy(camera.position);
  GLOBAL_CAMERA_QUATERNION_UNIFORM.value.copy(camera.quaternion);
  GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.set(0, 0, window.innerWidth * screenResolution, window.innerHeight * screenResolution);

  activeControl.update();
  cpuOperationsHandler.handleSkybox();

  if (!stopAreaConfigurationsHandler){
    cpuOperationsHandler.handleAreaConfigurations();
  }

  if (physicsDebugMode){
    debugRenderer.update();
  }

  if (mode == 1){
    cpuOperationsHandler.updateAnimations();
    cpuOperationsHandler.stepPhysics();
    cpuOperationsHandler.updateTrackingObjects();
    cpuOperationsHandler.updateDynamicObjects();
    cpuOperationsHandler.processCameraRotationBuffer();
    cpuOperationsHandler.runScripts();
    cpuOperationsHandler.updateParticleSystems();
    cpuOperationsHandler.updateObjectTrails();
    cpuOperationsHandler.updateCrosshair();
    cpuOperationsHandler.handleObjectMouseEvents();
    cpuOperationsHandler.handleActiveMuzzleFlashes();
    cpuOperationsHandler.handleActiveLightnings();
    delayedExecutionHandler.tick();
  }else{
    if (!isDeployment){
      particleSystemCreatorGUIHandler.update();
      muzzleFlashCreatorGUIHandler.update();
      fpsWeaponGUIHandler.update();
      animationCreatorGUIHandler.update();
    }
    cameraOperationsDone = false;
  }

  cpuOperationsHandler.renderScene();
  cpuOperationsHandler.updateAddedTexts();
  if (mode == 1){
    previewSceneRendered = true;
  }
  cpuOperationsHandler.updateRaycaster();
  if (!isMobile){
    cpuOperationsHandler.flushMouseEventHandler();
  }
  fpsHandler.end();
}


function renderScene(){
  threejsRenderMonitoringHandler.currentRenderCallCountPerFrame = 0;
  renderer.render(scene, camera);
  if (threejsRenderMonitoringHandler.currentRenderCallCountPerFrame > threejsRenderMonitoringHandler.maxRenderCallCountPerFrame){
    threejsRenderMonitoringHandler.maxRenderCallCountPerFrame = threejsRenderMonitoringHandler.currentRenderCallCountPerFrame;
  }
}

function updateRaycaster(){
  if (!rayCaster.ready){
    return;
  }
  rayCaster.flush();
}

function updateAddedTexts(){
  if (mode == 0){
    if (!keyboardBuffer["Shift"]){
      for (var addedTextName in sceneHandler.getAddedTexts()){
        var addedText = addedTexts[addedTextName];
        if (addedText.needsUpdate() && !addedText.is2D){
          addedText.handleBoundingBox();
          rayCaster.updateObject(addedText);
        }
      }
    }
  }else{
    for (var addedTextName in sceneHandler.getClickableAddedTexts()){
      var addedText = addedTexts[addedTextName];
      if (addedText.needsUpdate() && !addedText.is2D){
        addedText.handleBoundingBox();
        rayCaster.updateObject(addedText);
      }
    }
  }
}

function updateCrosshair(){
  if (selectedCrosshair && (selectedCrosshair.angularSpeed != 0 || selectedCrosshair.expand || selectedCrosshair.shrink)){
    selectedCrosshair.update();
  }
}

function particleSystemsUpdateFunction(particleSystem, psName){
  if (particleSystem && !particleSystem.destroyed){
    particleSystem.update();
  }
}

function updateParticleSystems(){
  particleSystems.forEach(particleSystemsUpdateFunction);
  for (var mergedParticleSystemName in mergedParticleSystems){
    mergedParticleSystems[mergedParticleSystemName].update();
  }
}

function muzzleFlashesUpdateFunction(muzzleFlash, muzzleFlashName){
  muzzleFlash.update();
}

function handleActiveMuzzleFlashes(){
  activeMuzzleFlashes.forEach(muzzleFlashesUpdateFunction);
}

function lightningUpdateFunction(lightning, lightningName){
  lightning.update();
}

function handleActiveLightnings(){
  activeLightnings.forEach(lightningUpdateFunction);
}

function objectTrailsUpdateFunction(objectTrail, objName){
  if (objectTrail && !objectTrail.destroyed){
    objectTrail.update();
  }
}

function updateObjectTrails(){
  activeObjectTrails.forEach(objectTrailsUpdateFunction);
}

function scriptRunFunction(script, scriptName){
  script.execute();
}

function runScripts(){
  if(!rayCaster.ready || !physicsWorld.ready){
    return;
  }
  if (isDeployment){
    deploymentScripts();
    return;
  }
  scriptsToRun.forEach(scriptRunFunction);
}

function updateTrackingObjects(){
  for (var objName in sceneHandler.getTrackingObjects()){
    var obj = addedObjects[objName];
    var isObjectGroup = false;
    if (!obj){
      obj = objectGroups[objName];
      isObjectGroup = true;
    }
    if (typeof obj.trackedObject.dx == UNDEFINED){
      continue;
    }
    obj.prevPositionVector.copy(obj.mesh.position);
    obj.mesh.position.set(
      obj.mesh.position.x + obj.trackedObject.dx,
      obj.mesh.position.y + obj.trackedObject.dy,
      obj.mesh.position.z + obj.trackedObject.dz
    );
    obj.physicsBody.position.copy(obj.mesh.position);
    if (isObjectGroup){
      obj.graphicsGroup.position.copy(obj.mesh.position);
      obj.graphicsGroup.quaternion.copy(obj.mesh.quaternion);
    }
    if (obj.mesh.visible){
      rayCaster.updateObject(obj);
    }
    if (obj.autoInstancedParent){
      obj.autoInstancedParent.updateObject(obj);
    }
    obj.onPositionChange(obj.prevPositionVector, obj.mesh.position);
  }
}

function dynamicObjectUpdateFunction(object, objectName){
  var physicsBody = object.physicsBody;
  object.prevPositionVector.copy(object.mesh.position);
  if (object.isTracked){
    object.dx = physicsBody.position.x - object.oldPX;
    object.dy = physicsBody.position.y - object.oldPY;
    object.dz = physicsBody.position.z - object.oldPZ;
    object.oldPX = physicsBody.position.x;
    object.oldPY = physicsBody.position.y;
    object.oldPZ = physicsBody.position.z;
  }
  object.mesh.position.copy(physicsBody.position);
  if (object.isAddedObject){
    var gridSystemAxis = object.metaData.gridSystemAxis;
    var axis = object.metaData.axis;
    var type = object.type;
    setTHREEQuaternionFromCANNON(object.mesh, physicsBody, axis, type, gridSystemAxis);
  }else{
    object.mesh.quaternion.copy(physicsBody.quaternion);
  }
  if (!(object.isHidden || (!object.isIntersectable) || !object.boundingBoxesNeedUpdate())){
    rayCaster.updateObject(object);
  }
  if (object.autoInstancedParent){
    object.autoInstancedParent.updateObject(object);
  }
  object.onPositionChange(object.prevPositionVector, physicsBody.position);
}

function updateDynamicObjects(){
  sceneHandler.getDynamicObjects().forEach(dynamicObjectUpdateFunction);
  sceneHandler.getDynamicObjectGroups().forEach(dynamicObjectUpdateFunction);
}

function setTHREEQuaternionFromCANNON(mesh, physicsBody, axis, type, gridSystemAxis){
  mesh.quaternion.copy(physicsBody.quaternion);
  if (type == "ramp" || type == "surface"){
    if (gridSystemAxis == "XZ" || gridSystemAxis == "XY" || gridSystemAxis == "YZ"){
      if (!(type == "surface" && (gridSystemAxis == "XY" || gridSystemAxis == "YZ"))){
        mesh.rotateX(Math.PI / 2);
      }else{
        if (type == "surface" && gridSystemAxis == "YZ"){
          mesh.rotateY(Math.PI / 2);
        }
      }
    }
  }else if (type == "cylinder"){
    if (gridSystemAxis == "YZ"){
      mesh.rotateZ(Math.PI / 2);
    }else if (gridSystemAxis == "XY"){
      mesh.rotateX(Math.PI / 2);
    }
  }
}

function handleSkybox(){
  skyboxHandler.update();
}

function deploymentScripts(){
  //@DEPLOYMENT_SCRIPTS
}
