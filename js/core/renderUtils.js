function render(){

  requestID = requestAnimationFrame(render);

  processKeyboardBuffer();
  handleSkybox();
  if (!stopAreaConfigurationsHandler){
    areaConfigurationsHandler.handle();
  }

  if (physicsDebugMode){
    debugRenderer.update();
  }

  if (mode == 1){
    if (!isPhysicsWorkerEnabled()){
      physicsWorld.step(physicsStepAmount);
      updateDynamicObjects();
    }
    runScripts();
    updateRaycaster();
    updateParticleSystems();
    updateObjectTrails();
    updateCrosshair();
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
    handleWorkerMessages();
  }else{
    cameraOperationsDone = false;
    if (areasVisible){
      updateAreaLabels();
    }
    if (markedPointsVisible){
      updateMarkedPointLabels();
    }
    updateGridCornerHelpers();
  }
  composer.render(0.1);
  if (mode == 1){
    previewSceneRendered = true;
  }
  frameCounter ++;
}


function updateCrosshair(){
  if (selectedCrosshair && (selectedCrosshair.angularSpeed != 0 || selectedCrosshair.expand || selectedCrosshair.shrink)){
    selectedCrosshair.update();
  }
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
        workerHandler.particleSystemsArray.canParticleSet = false;
        workerHandler.psArrayFunction();
    }
    if (workerHandler.sendBinHandlerMessage){
      workerHandler.sendBinHandlerMessage = false;
      workerHandler.binHandlerLoopFunction();
    }
  }
}

function updateRaycaster(){
  rayCaster.binHandler.update();
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
  for (var objectName in activeObjectTrails){
    var objectTrail = activeObjectTrails[objectName];
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

function updateAreaLabels(){
  for (var areaName in areas){
    if (!cameraOperationsDone){
      camera.updateMatrix();
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);
      cameraOperationsDone = true;
    }
    var area = areas[areaName];
    area.update();
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

function updateDynamicObjects(){
  for (var objectName in dynamicObjects){
    var object = addedObjects[objectName];
    var physicsBody = object.physicsBody;
    var axis = object.metaData.axis;
    var gridSystemAxis = object.metaData.gridSystemAxis;
    var type = object.type;
    object.mesh.position.copy(physicsBody.position);
    setTHREEQuaternionFromCANNON(object.mesh, physicsBody, axis, type, gridSystemAxis);
  }
  for (var grouppedObjectName in dynamicObjectGroups){
    var grouppedObject = objectGroups[grouppedObjectName];
    var physicsBody = grouppedObject.physicsBody;
    grouppedObject.mesh.position.copy(physicsBody.position);
    grouppedObject.mesh.quaternion.copy(physicsBody.quaternion);
  }
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

function handleSkybox(){
  if (skyboxMesh){
    skyboxMesh.position.copy(camera.position);
  }
}
