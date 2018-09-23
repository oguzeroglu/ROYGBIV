var JobHandler = function(splitted){
  this.splitted = splitted;
  this.undoRedoPush = true;
}

JobHandler.prototype.handle = function(previewModeCommand){
  if (mode == 1 && !previewModeCommand){
    terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
    return;
  }
  jobHandlerWorking = true;
  try{
    if (this.splitted[0] == "newSurface"){
      this.handleNewSurfaceCommand();
    }else if (this.splitted[0] == "newBox"){
      this.handleNewBoxCommand();
    }else if (this.splitted[0] == "newSphere"){
      this.handleNewSphereCommand();
    }else if (this.splitted[0] == "mapTexturePack"){
      this.handleMapTexturePackCommand();
    }else if (this.splitted[0] == "destroyGridSystem"){
      this.handleDestroyGridSystemCommand();
    }else if (this.splitted[0] == "destroyMaterial"){
      this.handleDestroyMaterialCommand();
    }else if (this.splitted[0] == "destroyObject"){
      this.handleDestroyObjectCommand();
    }else if (this.splitted[0] == "destroyTexture"){
      this.handleDestroyTextureCommand();
    }else if (this.splitted[0] == "mapTexture"){
      this.handleMapTextureCommand();
    }else if (this.splitted[0] == "adjustTextureRepeat"){
      this.handleAdjustTextureRepeatCommand();
    }else if (this.splitted[0] == "mirror"){
      this.handleMirrorCommand();
    }else if (this.splitted[0] == "destroyWallCollection"){
      this.handleDestroyWallCollectionCommand();
    }else if (this.splitted[0] == "mapSpecular"){
      this.handleMapSpecularCommand();
    }else if (this.splitted[0] == "mapAmbientOcculsion"){
      this.handleMapAmbientOcculsionCommand();
    }else if (this.splitted[0] == "mapAlpha"){
      this.handleMapAlphaCommand();
    }else if (this.splitted[0] == "destroyLight"){
      this.handleDestroyLightCommand();
    }else if (this.splitted[0] == "mapNormal"){
      this.handleMapNormalCommand();
    }else if (this.splitted[0] == "mapEmissive"){
      this.handleMapEmissiveCommand();
    }else if (this.splitted[0] == "destroyTexturePack"){
      this.handleDestroyTexturePackCommand();
    }else if (this.splitted[0] == "refreshTexturePack"){
      this.handleRefreshTexturePackCommand();
    }else if (this.splitted[0] == "mapHeight"){
      this.handleMapHeightCommand();
    }else if (this.splitted[0] == "resetMaps"){
      this.handleResetMapsCommand();
    }else if (this.splitted[0] == "segmentObject"){
      this.handleSegmentObjectCommand();
    }else if (this.splitted[0] == "newPointLight"){
      this.handleNewPointLightCommnand();
    }else if (this.splitted[0] == "destroySkybox"){
      this.handleDestroySkyboxCommand();
    }else if (this.splitted[0] == "setMass"){
      this.handleSetMassCommand();
    }else if (this.splitted[0] == "rotateObject"){
      this.handleRotateObjectCommand();
    }else if (this.splitted[0] == "runScript"){
      this.handleRunScriptCommand();
    }else if (this.splitted[0] == "stopScript"){
      this.handleStopScriptCommand();
    }else if (this.splitted[0] == "destroyScript"){
      this.handleDestroyScriptCommand();
    }else if (this.splitted[0] == "detach"){
      this.handleDetachCommand();
    }else if (this.splitted[0] == "mark"){
      this.handleMarkCommand();
    }else if (this.splitted[0] == "unmark"){
      this.handleUnmarkCommand();
    }else if (this.splitted[0] == "runAutomatically"){
      this.handleRunAutomaticallyCommand();
    }else if (this.splitted[0] == "runManually"){
      this.handleRunManuallyCommand();
    }else if (this.splitted[0] == "destroyImage"){
      this.handleDestroyImageCommand();
    }else if (this.splitted[0] == "setBlending"){
      this.handleSetBlendingCommand();
    }else if (this.splitted[0] == "applyDisplacementMap"){
      this.handleApplyDisplacementMapCommand();
    }else if (this.splitted[0] == "setSlipperiness"){
      this.handleSetSlipperinessCommand();
    }
    if (this.undoRedoPush){
      undoRedoHandler.push();
    }
  }catch (err){
    console.error(err);
  }
  jobHandlerWorking = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_SCRIPTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleStopScriptCommand = function(){
  this.undoRedoPush = false;
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
  this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
    terminal.printError(Text.NO_OBJECT_FOUND);
  }else{
    terminal.printInfo(Text.COMMAND_EXECUTED_FOR_X_OBJECTS.replace(Text.PARAM1, ctr));
  }
}

JobHandler.prototype.handleRefreshTexturePackCommand = function(){
  this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
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
    this.undoRedoPush = false;
  }
}
