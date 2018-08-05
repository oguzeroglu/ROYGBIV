var UndoRedoHandler = function(){
  // *****************************************
  // *                                       *
  // * stateLinkedListObj |-- state          *
  // *                    |__ nextState      *
  // *                    |__ previousState  *
  // *                    |__ id             *
  // *                                       *
  //  ****************************************
  this.currentState = new Object();
  this.idCounter = 0;
}

UndoRedoHandler.prototype.push = function(){
  if (!this.currentState.state){
    this.currentState.state = new State();
    this.currentState.previous = 0;
  }else{
    var oldState = Object.assign({}, this.currentState);
    this.currentState = new Object();
    this.currentState.state = new State();
    this.currentState.previousState = oldState;
    oldState.nextState = this.currentState;
  }
  this.currentState.stateID = this.idCounter;
  this.idCounter ++;
}

UndoRedoHandler.prototype.undo = function(){
  if (!this.currentState.previousState){
    return false;
  }else{
    var difference = DeepDiff.diff(
      this.currentState.state,
      this.currentState.previousState.state
    );
    this.currentState = this.currentState.previousState;
    var copy = Object.assign({}, this.currentState);
    this.handleDiff(difference);
    this.currentState = copy;
    if (this.currentState.previousState){
      this.currentState.previousState.nextState = this.currentState;
    }
    return true;
  }
}
UndoRedoHandler.prototype.redo = function(){
  if (!this.currentState.nextState){
    return false;
  }else{
    var difference = DeepDiff.diff(
      this.currentState.state,
      this.currentState.nextState.state
    );
    this.currentState = this.currentState.nextState;
    var copy = Object.assign({}, this.currentState);
    this.handleDiff(difference);
    this.currentState = copy;
    return true;
  }
}

UndoRedoHandler.prototype.handleDiff = function(diff){
  for (var i = 0; i<diff.length; i++){
    var curDiff = diff[i];
    var path = curDiff.path;
    if (path[0] == "gridSystems"){
      new StateLoader(curDiff).handleGridSystemDiff();
    }else if (path[0] == "croppedGridSystemBuffer"){
      new StateLoader(curDiff).handleCroppedGridSystemBufferDiff();
    }else if (path[0] == "materials"){
      new StateLoader(curDiff).handleMaterialDiff();
    }else if (path[0] == "addedObjects"){
      new StateLoader(curDiff).handleAddedObjectDiff();
    }else if (path[0] == "textureURLs"){
      new StateLoader(curDiff).handleTextureURLsDiff();
    }else if (path[0] == "textures"){
      new StateLoader(curDiff).handleTexturesDiff();
    }else if (path[0] == "anchorGrid"){
      new StateLoader(curDiff).handleAnchorGridDiff();
    }else if (path[0] == "wallCollections"){
      new StateLoader(curDiff).handleWallCollectionsDiff();
    }else if (path[0] == "uploadedImages"){
      new StateLoader(curDiff).handleUploadedImages();
    }else if (path[0] == "defaultMaterialType"){
      new StateLoader(curDiff).handleDefaultMaterialType();
    }else if (path[0] == "lights"){
      new StateLoader(curDiff).handleLightsDiff();
    }else if (path[0] == "light_previewScene"){
      new StateLoader(curDiff).handleLightPreviewSceneDiff();
    }else if (path[0] == "pointLightRepresentations"){
      new StateLoader(curDiff).handlePointLightRepresentationsDiff();
    }else if (path[0] == "texturePacks"){
      new StateLoader(curDiff).handleTexturePacksDiff();
    }else if (path[0] == "skyBoxes"){
      new StateLoader(curDiff).handleSkyboxesDiff();
    }else if (path[0] == "mappedSkyboxName"){
      new StateLoader(curDiff).handleMappedSkyboxNames();
    }else if (path[0] == "skyboxVisible"){
      new StateLoader(curDiff).handleSkyboxVisible();
    }else if (path[0] == "skyBoxScale"){
      new StateLoader(curDiff).handleSkyBoxScales();
    }else if (path[0] == "objectGroups"){
      new StateLoader(curDiff).handleObjectGroupsDiff();
    }else if (path[0] == "scripts"){
      new StateLoader(curDiff).handleScriptsDiff();
    }else if (path[0] == "fogNear"){
      new StateLoader(curDiff).handleFogNearDiff();
    }else if (path[0] == "fogFar"){
      new StateLoader(curDiff).handleFogFarDiff();
    }else if (path[0] == "fogHexColor"){
      new StateLoader(curDiff).handleFogHexColorDiff();
    }else if (path[0] == "markedPointsExport"){
      new StateLoader(curDiff).handleMarkedPointsExport();
    }else if (path[0] == "physicsWorkerMode"){
      new StateLoader(curDiff).handlePhysicsWorkerModeDiff();
    }else if (path[0] == "octreeLimit"){
      new StateLoader(curDiff).handleOctreeLimitDiffs();
    }else if (path[0] == "binSize"){
      new StateLoader(curDiff).handleBinSizeDiff();
    }else if (path[0] == "particleCollisionWorkerMode"){
      new StateLoader(curDiff).handleParticleCollisionWorkerModeDiff();
    }else if (path[0] == "particleSystemCollisionWorkerMode"){
      new StateLoader(curDiff).handleParticleSystemCollisionWorkerModeDiff();
    }else if (path[0] == "modifiedTextures"){
      new StateLoader(curDiff).handleModifiedTexturesDiff();
    }
  }
}
