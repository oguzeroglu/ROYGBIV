function render(){

  requestID = requestAnimationFrame(render);

  processKeyboardBuffer();

  handleSkybox();

  if (mode == 1){
    if (!isPhysicsWorkerEnabled()){
      physicsWorld.step(physicsStepAmount);
      updateDynamicObjectPositions();
      updatePhysicsTestObjectPositions();
    }
    runScripts();
    if (worldBinHandler){
      updateWorldBinHandler();
    }
    updateParticleSystems();
    updateObjectTrails();
    shaderTime += 0.1;
    if (shaderTime > 10){
      shaderTime = 0;
    }
    if (badTvOn){
      badTVPass.uniforms[ 'time' ].value =  shaderTime;
    }
    if (scanlineOn){
      filmPass.uniforms[ 'time' ].value =  shaderTime;
    }
    if (staticOn){
      staticPass.uniforms[ 'time' ].value =  shaderTime;
    }
    if (physicsDebugMode){
      debugRenderer.update();
    }

    handleWorkerMessages();
  }else{
    cameraOperationsDone = false;
    updateMarkedPointLabels();
    updateGridCornerHelpers();
  }
  composer.render(0.1);
  if (mode == 1){
    previewSceneRendered = true;
  }
  frameCounter ++;
}

function handleWorkerMessages(){
  if (isPSCollisionWorkerEnabled()){
    if (workerHandler.psTickArray && workerHandler.psTickArray.canPSSet){
      workerHandler.psTickArray.canPSSet = false;
      workerHandler.psTickFunction();
    }
    if (workerHandler.sendBinHandlerMessage_PS){
      workerHandler.sendBinHandlerMessage_PS = false;
      workerHandler.psBinHandlerLoopFunction();
    }
  }
  if (isCollisionWorkerEnabled()){
    if (workerHandler.particleSystemsArray && workerHandler.particleSystemsArray.canParticleSet){
      if (workerHandler.msgCtr == 0){
        workerHandler.particleSystemsArray.canParticleSet = false;
        workerHandler.psArrayFunction();
      }
    }
    if (workerHandler.sendBinHandlerMessage){
      if (workerHandler.msgCtr == 1){
        workerHandler.sendBinHandlerMessage = false;
        workerHandler.binHandlerLoopFunction();
      }
    }
  }
  if (workerHandler){
    workerHandler.msgCtr ++;
    if (workerHandler.msgCtr == 2){
      workerHandler.msgCtr = 0;
    }
  }
}

function updateWorldBinHandler(){
  worldBinHandler.update();
}

function updateParticleSystems(){
  for (var particleSystemName in particleSystems){
    var particleSystem = particleSystems[particleSystemName];
    if (particleSystem && !particleSystem.destroyed){
      particleSystem.update();
    }
  }
  for (var mergedParticleSystemName in mergedParticleSystems){
    mergedParticleSystems[mergedParticleSystemName].update();
  }
}

function updateObjectTrails(){
  for (var objectName in objectTrails){
    var objectTrail = objectTrails[objectName];
    if (objectTrail && !objectTrail.destroyed){
      objectTrail.update();
    }
  }
}

function runScripts(){
  for (var scriptName in scriptsToRun){
    scripts[scriptName].execute();
  }
}

function updateMarkedPointLabels(){
  for (var markedPointName in markedPoints){
    if (!cameraOperationsDone){
      camera.updateMatrix();
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);
      cameraOperationsDone = true;
    }
    var markedPoint = markedPoints[markedPointName];
    if (!markedPoint.isHidden){
      markedPoint.update();
    }
  }
}

function updateGridCornerHelpers(){
  if (!keyboardBuffer["period"]){
    return;
  }
  for (var gridName in gridSelections){
    if (!cameraOperationsDone){
      camera.updateMatrix();
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);
      cameraOperationsDone = true;
    }
    var grid = gridSelections[gridName];
    grid.updateCornerHelpers();
  }
}

function updateDynamicObjectPositions(){
  for (var objectName in dynamicObjects){
    var object = addedObjects[objectName];
    var previewMesh = object.previewMesh;
    var physicsBody = object.physicsBody;
    var axis = object.metaData.axis;
    var gridSystemAxis = object.metaData.gridSystemAxis;
    var type = object.type;
    previewMesh.position.copy(physicsBody.position);
    setTHREEQuaternionFromCANNON(previewMesh, physicsBody, axis, type, gridSystemAxis);
  }
  for (var grouppedObjectName in dynamicObjectGroups){
    var grouppedObject = objectGroups[grouppedObjectName];
    var previewMesh = grouppedObject.previewGraphicsGroup;
    var physicsBody = grouppedObject.physicsBody;
    previewMesh.position.copy(physicsBody.position);
    previewMesh.quaternion.copy(physicsBody.quaternion);
  }
}

function setTHREEQuaternionFromCANNON(previewMesh, physicsBody, axis, type, gridSystemAxis){
  previewMesh.quaternion.copy(physicsBody.quaternion);
  if (type == "ramp" || type == "surface"){
    if (gridSystemAxis == "XZ" || gridSystemAxis == "XY" || gridSystemAxis == "YZ"){
      if (!(type == "surface" && (gridSystemAxis == "XY" || gridSystemAxis == "YZ"))){
        previewMesh.rotateX(Math.PI / 2);
      }else{
        if (type == "surface" && gridSystemAxis == "YZ"){
          previewMesh.rotateY(Math.PI / 2);
        }
      }
    }
  }
}

function calculateFps (){
  if (LOG_FRAME_DROP_ON){
    if (frameCounter < 60){
      FRAME_DROP_COUNT += 60 - frameCounter;
    }
    LOG_FRAME_DROP_CTR ++;
    if (LOG_FRAME_DROP_CTR == 60){
      LOG_FRAME_DROP_ON = false;
      console.log("[*] Frame-drops: "+FRAME_DROP_COUNT);
    }
  }
  fps = frameCounter;
  frameCounter = 0;
  if (!scriptEditorShowing && (fps != lastFPS)){
    if (mode == 0){
      $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode) - "+fps+" FPS");
    }else if (mode == 1){
      $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Preview mode) - "+fps+" FPS");
    }
  }
  lastFPS = fps;
}

function updatePhysicsTestObjectPositions(){
  for (var key in physicsTests){
    var test = physicsTests[key];
    if (test.status == "RUNNING"){
      var mesh = test.mesh;
      var physicsBody = test.physicsBody;
      mesh.position.copy(physicsBody.position);
      mesh.quaternion.copy(physicsBody.quaternion);
    }
  }
}

function refreshMaterials(){
  for (var objectName in addedObjects){
    var addedObject = addedObjects[objectName];
    addedObject.mesh.material.needsUpdate = true;
    addedObject.previewMesh.material.needsUpdate = true;
  }
  for (var objectName in objectGroups){
    var objectGroup = objectGroups[objectName];
    for (var i = 0; i<objectGroup.graphicsGroup.children.length; i++){
      objectGroup.graphicsGroup.children[i].material.needsUpdate = true;
      objectGroup.previewGraphicsGroup.children[i].material.needsUpdate = true;
    }
  }
}

function handleSkybox(){
  if (skyboxMesh && skyboxPreviewMesh){
    skyboxMesh.position.x = camera.position.x;
    skyboxMesh.position.y = camera.position.y;
    skyboxMesh.position.z = camera.position.z;
    skyboxPreviewMesh.position.x = camera.position.x;
    skyboxPreviewMesh.position.y = camera.position.y;
    skyboxPreviewMesh.position.z = camera.position.z;
  }
}
