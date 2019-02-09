var JobHandler = function(splitted){
  this.splitted = splitted;
}

JobHandler.prototype.handle = function(previewModeCommand){
  if (mode == 1 && !previewModeCommand){
    terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
    return;
  }
  jobHandlerWorking = true;
  jobHandlerInternalCounter = 0;
  jobHandlerInternalMaxExecutionCount = 0;
  this.splitted[0] = this.splitted[0].toLowerCase();
  try{
    if (this.splitted[0] == "newSurface".toLowerCase()){
      this.handleNewSurfaceCommand();
    }else if (this.splitted[0] == "newBox".toLowerCase()){
      this.handleNewBoxCommand();
    }else if (this.splitted[0] == "newSphere".toLowerCase()){
      this.handleNewSphereCommand();
    }else if (this.splitted[0] == "mapTexturePack".toLowerCase()){
      this.handleMapTexturePackCommand();
    }else if (this.splitted[0] == "destroyGridSystem".toLowerCase()){
      this.handleDestroyGridSystemCommand();
    }else if (this.splitted[0] == "destroyMaterial".toLowerCase()){
      this.handleDestroyMaterialCommand();
    }else if (this.splitted[0] == "destroyObject".toLowerCase()){
      this.handleDestroyObjectCommand();
    }else if (this.splitted[0] == "destroyTexture".toLowerCase()){
      this.handleDestroyTextureCommand();
    }else if (this.splitted[0] == "mapTexture".toLowerCase()){
      this.handleMapTextureCommand();
    }else if (this.splitted[0] == "adjustTextureRepeat".toLowerCase()){
      this.handleAdjustTextureRepeatCommand();
    }else if (this.splitted[0] == "mirror".toLowerCase()){
      this.handleMirrorCommand();
    }else if (this.splitted[0] == "destroyWallCollection".toLowerCase()){
      this.handleDestroyWallCollectionCommand();
    }else if (this.splitted[0] == "mapSpecular".toLowerCase()){
      this.handleMapSpecularCommand();
    }else if (this.splitted[0] == "mapAmbientOcculsion".toLowerCase()){
      this.handleMapAmbientOcculsionCommand();
    }else if (this.splitted[0] == "mapAlpha".toLowerCase()){
      this.handleMapAlphaCommand();
    }else if (this.splitted[0] == "destroyLight".toLowerCase()){
      this.handleDestroyLightCommand();
    }else if (this.splitted[0] == "mapNormal".toLowerCase()){
      this.handleMapNormalCommand();
    }else if (this.splitted[0] == "mapEmissive".toLowerCase()){
      this.handleMapEmissiveCommand();
    }else if (this.splitted[0] == "destroyTexturePack".toLowerCase()){
      this.handleDestroyTexturePackCommand();
    }else if (this.splitted[0] == "refreshTexturePack".toLowerCase()){
      this.handleRefreshTexturePackCommand();
    }else if (this.splitted[0] == "mapHeight".toLowerCase()){
      this.handleMapHeightCommand();
    }else if (this.splitted[0] == "resetMaps".toLowerCase()){
      this.handleResetMapsCommand();
    }else if (this.splitted[0] == "segmentObject".toLowerCase()){
      this.handleSegmentObjectCommand();
    }else if (this.splitted[0] == "newPointLight".toLowerCase()){
      this.handleNewPointLightCommnand();
    }else if (this.splitted[0] == "destroySkybox".toLowerCase()){
      this.handleDestroySkyboxCommand();
    }else if (this.splitted[0] == "setMass".toLowerCase()){
      this.handleSetMassCommand();
    }else if (this.splitted[0] == "rotateObject".toLowerCase()){
      this.handleRotateObjectCommand();
    }else if (this.splitted[0] == "runScript".toLowerCase()){
      this.handleRunScriptCommand();
    }else if (this.splitted[0] == "stopScript".toLowerCase()){
      this.handleStopScriptCommand();
    }else if (this.splitted[0] == "destroyScript".toLowerCase()){
      this.handleDestroyScriptCommand();
    }else if (this.splitted[0] == "detach".toLowerCase()){
      this.handleDetachCommand();
    }else if (this.splitted[0] == "mark".toLowerCase()){
      this.handleMarkCommand();
    }else if (this.splitted[0] == "unmark".toLowerCase()){
      this.handleUnmarkCommand();
    }else if (this.splitted[0] == "runAutomatically".toLowerCase()){
      this.handleRunAutomaticallyCommand();
    }else if (this.splitted[0] == "runManually".toLowerCase()){
      this.handleRunManuallyCommand();
    }else if (this.splitted[0] == "destroyImage".toLowerCase()){
      this.handleDestroyImageCommand();
    }else if (this.splitted[0] == "setBlending".toLowerCase()){
      this.handleSetBlendingCommand();
    }else if (this.splitted[0] == "applyDisplacementMap".toLowerCase()){
      this.handleApplyDisplacementMapCommand();
    }else if (this.splitted[0] == "setSlipperiness".toLowerCase()){
      this.handleSetSlipperinessCommand();
    }else if (this.splitted[0] == "sync".toLowerCase()){
      this.handleSyncCommand();
    }else if (this.splitted[0] == "selectAllGrids".toLowerCase()){
      this.handleSelectAllGridsCommand();
    }else if (this.splitted[0] == "newAreaConfiguration".toLowerCase()){
      this.handleNewAreaConfigurationCommand();
    }else if (this.splitted[0] == "autoConfigureArea".toLowerCase()){
      this.handleAutoConfigureAreaCommand();
    }else if (this.splitted[0] == "newCylinder".toLowerCase()){
      this.handleNewCylinderCommand();
    }else if (this.splitted[0] == "setRotationPivot".toLowerCase()){
      this.handleSetRotationPivotCommand();
    }else if (this.splitted[0] == "unsetRotationPivot".toLowerCase()){
      this.handleUnsetRotationPivotCommand();
    }else if (this.splitted[0] == "copyObject".toLowerCase()){
      this.handleCopyObjectCommand();
    }else if (this.splitted[0] == "newText".toLowerCase()){
      this.handleNewTextCommand();
    }else if (this.splitted[0] == "destroyText".toLowerCase()){
      this.handleDestroyTextCommand();
    }else if (this.splitted[0] == "destroyFont".toLowerCase()){
      this.handleDestroyFontCommand();
    }
  }catch (err){
    console.error(err);
  }
  // because async
  if (this.splitted[0] != "autoConfigureArea".toLowerCase()){
    jobHandlerWorking = false;
  }
}

JobHandler.prototype.handleDestroyFontCommand = function(){
  var fontNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var fontName in fonts){
    if (fontName.startsWith(fontNamePrefix)){
      parseCommand(
        "destroyFont "+fontName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_FONTS_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_FONTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyTextCommand = function(){
  var textNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var textName in addedTexts){
    if (textName.startsWith(textNamePrefix)){
      parseCommand(
        "destroyText "+textName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_TEXT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_TEXTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleNewTextCommand = function(){
  var textNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newText " +textNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]+" "+
          this.splitted[4] + " " + this.splitted[5] + " " + this.splitted[6]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_TEXTS.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);
  }
  for (var gridName in gridSelections){
    gridSelections[gridName].toggleSelect(false, false, false, true);
  }
  gridSelections = new Object();
}

JobHandler.prototype.handleCopyObjectCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "copyObject "+this.splitted[1]+" "+objNamePrefix+"_"+ctr+" "+this.splitted[3]+" "+
                          this.splitted[4]+" "+this.splitted[5]+" "+this.splitted[6]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.CREATED_X_COPIES.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);
  }
  for (var gridName in gridSelections){
    gridSelections[gridName].toggleSelect(false, false, false, true);
  }
  gridSelections = new Object();
}

JobHandler.prototype.handleUnsetRotationPivotCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand("unsetRotationPivot "+objName);
      ctr ++;
    }
  }
  for (var objName in objectGroups){
    if (objName.startsWith(objNamePrefix)){
      parseCommand("unsetRotationPivot "+objName);
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleSetRotationPivotCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand("setRotationPivot "+objName+" "+this.splitted[2]+" "+this.splitted[3]+" "+this.splitted[4]);
      ctr ++;
    }
  }
  for (var objName in objectGroups){
    if (objName.startsWith(objNamePrefix)){
      parseCommand("setRotationPivot "+objName+" "+this.splitted[2]+" "+this.splitted[3]+" "+this.splitted[4]);
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleNewCylinderCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newCylinder "+objNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]+" "+
                      this.splitted[4]+" "+this.splitted[5]+" "+this.splitted[6]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.CREATED_X_CYLINDERS.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);
  }
}

JobHandler.prototype.handleAutoConfigureAreaCommand = function(){
  var areaNamePrefix = this.splitted[1].split("*")[0];
  var areaCount = 0;
  terminal.printInfo(Text.CONFIGURING_AREAS);
  canvas.style.visibility = "hidden";
  terminal.disable();
  setTimeout(function(){
    for (var areaName in areas){
      if (areaName.startsWith(areaNamePrefix)){
        areaCount ++;
      }
    }
    jobHandlerInternalMaxExecutionCount = areaCount;
    for (var areaName in areas){
      if (areaName.startsWith(areaNamePrefix)){
        parseCommand(
          "autoConfigureArea "+areaName
        );
      }
    }
    if (areaCount == 0){
      jobHandlerWorking = false;
      terminal.printError(Text.NO_AREAS_FOUND);
    }
  });
}

JobHandler.prototype.handleNewAreaConfigurationCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var areaNamePrefix = this.splitted[1].split("*")[0];
  var areaCount = 0, objCount = 0;
  for (var areaName in areas){
    areaCount ++;
    if (areaName.startsWith(areaNamePrefix)){
      for (var objName in addedObjects){
        if (objName.startsWith(objNamePrefix)){
          parseCommand(
            "newAreaConfiguration "+areaName+" "+objName+" "+this.splitted[3]+" "+this.splitted[4]
          );
          objCount ++;
        }
      }
      for (var objName in objectGroups){
        if (objName.startsWith(objNamePrefix)){
          parseCommand(
            "newAreaConfiguration "+areaName+" "+objName+" "+this.splitted[3]+" "+this.splitted[4]
          );
          objCount ++;
        }
      }
    }
  }
  if ("default".startsWith(areaNamePrefix)){
    areaCount ++;
    for (var objName in addedObjects){
      if (objName.startsWith(objNamePrefix)){
        parseCommand(
          "newAreaConfiguration default"+" "+objName+" "+this.splitted[3]+" "+this.splitted[4]
        );
        objCount ++;
      }
    }
    for (var objName in objectGroups){
      if (objName.startsWith(objNamePrefix)){
        parseCommand(
          "newAreaConfiguration default"+" "+objName+" "+this.splitted[3]+" "+this.splitted[4]
        );
        objCount ++;
      }
    }
  }
  if (areaCount == 0){
    terminal.printError(Text.NO_AREAS_FOUND);
  }else if (objCount == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_AREAS.replace(
      Text.PARAM1, areaCount
    ));
  }
}

JobHandler.prototype.handleSelectAllGridsCommand = function(){
  var gsNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gsName in gridSystems){
    if (gsName.startsWith(gsNamePrefix)){
      parseCommand(
        "selectAllGrids "+gsName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_GRID_SYSTEM_FOUND);

  }else{
    terminal.printInfo(Text.DESTROYED_X_GRID_SYTEMS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleSyncCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "sync "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleSetSlipperinessCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "setSlipperiness "+objName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  for (var objName in objectGroups){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "setSlipperiness "+objName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleApplyDisplacementMapCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "applyDisplacementMap "+objName+" "+this.splitted[2]+" "+this.splitted[3]+" "+this.splitted[4]
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleSetBlendingCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "setBlending "+objName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  for (var objName in objectGroups){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "setBlending "+objName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyImageCommand = function(){
  var imgNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var imageName in uploadedImages){
    if (imageName.startsWith(imgNamePrefix)){
      parseCommand(
        "destroyImage "+imageName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_IMAGES_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_IMAGES.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleRunManuallyCommand = function(){
  var scriptPrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var scriptName in scripts){
    if (scriptName.startsWith(scriptPrefix)){
      parseCommand(
        "runManually "+scriptName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_SCRIPTS_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SCRIPTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleRunAutomaticallyCommand = function(){
  var scriptPrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var scriptName in scripts){
    if (scriptName.startsWith(scriptPrefix)){
      parseCommand(
        "runAutomatically "+scriptName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_SCRIPTS_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SCRIPTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleUnmarkCommand = function(){
  var ptPrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var ptName in markedPoints){
    if (ptName.startsWith(ptPrefix)){
      parseCommand(
        "unmark "+ptName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_MARKED_POINTS_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_MARKED_POINTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMarkCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "mark "+objNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]+" "+this.splitted[4]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.MARKED_X_POINTS.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_ONE_GRID_SELECTED);

  }
}

JobHandler.prototype.handleDetachCommand = function(){
  var objGroupPrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objGroupName in objectGroups){
    if (objGroupName.startsWith(objGroupPrefix)){
      parseCommand(
        "detach "+objGroupName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printError(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyScriptCommand = function(){
  var scriptNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var scriptName in scripts){
    if (scriptName.startsWith(scriptNamePrefix)){
      parseCommand(
        "destroyScript "+scriptName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_SCRIPTS_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SCRIPTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleStopScriptCommand = function(){

  var scriptNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var scriptName in scripts){
    if (scriptName.startsWith(scriptNamePrefix)){
      parseCommand(
        "stopScript "+scriptName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_SCRIPTS_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SCRIPTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleRunScriptCommand = function(){

  var scriptNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var scriptName in scripts){
    if (scriptName.startsWith(scriptNamePrefix)){
      parseCommand(
        "runScript "+scriptName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_SCRIPTS_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SCRIPTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleRotateObjectCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "rotateObject "+objName+" "+this.splitted[2]+" "+this.splitted[3]
      );
      ctr ++;
    }
  }
  for (var objGroupName in objectGroups){
    if (objGroupName.startsWith(objNamePrefix)){
      parseCommand(
        "rotateObject "+objGroupName+" "+this.splitted[2]+" "+this.splitted[3]
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleSetMassCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "setMass "+objName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  for (var objGroupName in objectGroups){
    if (objGroupName.startsWith(objNamePrefix)){
      parseCommand(
        "setMass "+objGroupName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroySkyboxCommand = function(){
  var skyboxNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var skyboxName in skyBoxes){
    if (skyboxName.startsWith(skyboxNamePrefix)){
      parseCommand(
        "destroySkybox "+skyboxName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_SKYBOX_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SKYBOXES.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleNewPointLightCommnand = function(){
  var plNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newPointLight "+plNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]+" "
                            +this.splitted[4]+" "+this.splitted[5]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.CREATED_X_POINT_LIGHTS.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);

  }
}

JobHandler.prototype.handleSegmentObjectCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "segmentObject "+objName+" "+this.splitted[2]
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleResetMapsCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "resetMaps "+ objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapHeightCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapHeight "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleRefreshTexturePackCommand = function(){

  var texturePackNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var texturePackName in texturePacks){
    if (texturePackName.startsWith(texturePackNamePrefix)){
      parseCommand(
        "refreshTexturePack "+texturePackName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_TEXTURE_PACK_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_TEXTURE_PACKS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyTexturePackCommand = function(){
  var texturePackNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var texturePackName in texturePacks){
    if (texturePackName.startsWith(texturePackNamePrefix)){
      parseCommand(
        "destroyTexturePack "+texturePackName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_TEXTURE_PACK_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_TEXTURE_PACKS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapEmissiveCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapEmissive "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapNormalCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapNormal "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyLightCommand = function(){
  var lightNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var lightName in lights){
    if (lightName.startsWith(lightNamePrefix)){
      parseCommand(
        "destroyLight "+lightName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_LIGHT_FOUND);

  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_LIGHTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapAlphaCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapAlpha "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapAmbientOcculsionCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapAmbientOcculsion "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapSpecularCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapSpecular "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyWallCollectionCommand = function(){
  var wallCollectionNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var wallCollectionName in wallCollections){
    if (wallCollectionName.startsWith(wallCollectionNamePrefix)){
      parseCommand(
        "destroyWallCollection "+wallCollectionName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_WALL_COLLECTION_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_WALL_COLLECTIONS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMirrorCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mirror "+objName+" "+this.splitted[2]+" "+this.splitted[3]
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleAdjustTextureRepeatCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "adjustTextureRepeat "+objName+" "+this.splitted[2]+" "+this.splitted[3]
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleMapTextureCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapTexture "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyTextureCommand = function(){
  var txtNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var textureName in textures){
    if (textureName.startsWith(txtNamePrefix)){
      parseCommand(
        "destroyTexture "+textureName
      );
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_TEXTURE_FOUND);
  }else{
    terminal.printInfo(Text.DESTROYED_X_TEXTURES.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyObjectCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "destroyObject "+objName
      )
      ctr ++;
    }
  }
  for (var gluedObjectName in objectGroups){
    if (gluedObjectName.startsWith(objNamePrefix)){
      parseCommand(
        "destroyObject "+gluedObjectName
      )
      ctr ++;
    }
  }
  if (ctr == 0){

    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyMaterialCommand = function(){
  var materialNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var materialName in materials){
    if (materialName.startsWith(materialNamePrefix)){
      parseCommand(
        "destroyMaterial "+materialName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_MATERIAL_FOUND);

  }else{
    terminal.printInfo(Text.DESTROYED_X_MATERIALS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleDestroyGridSystemCommand = function(){
  var gridSystemPrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridSystemName in gridSystems){
    if (gridSystemName.startsWith(gridSystemPrefix)){
      parseCommand(
        "destroyGridSystem "+gridSystemName
      )
      ctr ++;
    }
  }

  if (ctr == 0){
    terminal.printError(Text.NO_GRID_SYSTEM_FOUND);

  }else{
    terminal.printInfo(Text.DESTROYED_X_GRID_SYTEMS.replace(Text.PARAM1, ctr));
  }

}

JobHandler.prototype.handleMapTexturePackCommand = function(){
  var objNamePrefix = this.splitted[2].split("*")[0];
  var ctr = 0;
  for (var objName in addedObjects){
    if (objName.startsWith(objNamePrefix)){
      parseCommand(
        "mapTexturePack "+this.splitted[1]+" "+objName
      );
      ctr ++;
    }
  }
  if (ctr == 0){
    terminal.printError(Text.NO_OBJECT_FOUND);

  }else{
    terminal.printInfo(Text.TEXTURE_PACK_MAPPED_TO_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleNewSphereCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newSphere "+objNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.CREATED_X_SPHERES.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);

  }
}

JobHandler.prototype.handleNewBoxCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newBox "+objNamePrefix+"_"+ctr+" "+this.splitted[2]+" "+this.splitted[3]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.CREATED_X_BOXES.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);

  }
}

JobHandler.prototype.handleNewSurfaceCommand = function(){
  var objNamePrefix = this.splitted[1].split("*")[0];
  var ctr = 0;
  for (var gridName in gridSelections){
    jobHandlerSelectedGrid = gridSelections[gridName];
    parseCommand(
      "newSurface "+objNamePrefix+"_"+ctr+" "+this.splitted[2]
    );
    ctr ++;
  }
  jobHandlerSelectedGrid = 0;
  if (ctr != 0){
    terminal.printInfo(Text.CREATED_X_SURFACES.replace(Text.PARAM1, ctr));
  }else{
    terminal.printError(Text.MUST_HAVE_AT_LEAST_ONE_GRID_SELECTED);

  }
}
