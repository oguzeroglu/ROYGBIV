var AreaConfigurationsHandler = function(){
  this.sideAry = ["Both", "Front", "Back"];
  this.areaDefault = "default";
  this.updateNeeded = false;
}

AreaConfigurationsHandler.prototype.onCurrentAreaChange = function(enteredAreaName, exitedAreaName){
  if (mode == 0){
    return;
  }
  var enterCallbackFunc = areaEnterCallbacks[enteredAreaName];
  var exitCallbackFunc = areaExitCallbacks[exitedAreaName];
  if (enteredAreaName != this.areaDefault){
    if (enterCallbackFunc && areas[enteredAreaName].registeredSceneName == sceneHandler.getActiveSceneName()){
      enterCallbackFunc(exitedAreaName);
    }
  }else{
    if (enterCallbackFunc){
      enterCallbackFunc(exitedAreaName);
    }
  }
  if (exitedAreaName != this.areaDefault){
    if (exitCallbackFunc && areas[exitedAreaName].registeredSceneName == sceneHandler.getActiveSceneName()){
      exitCallbackFunc(enteredAreaName);
    }
  }else{
    if (exitCallbackFunc){
      exitCallbackFunc(enteredAreaName);
    }
  }
}

AreaConfigurationsHandler.prototype.onAfterSceneChange = function(){
  var result = sceneHandler.getAreaBinHandler().queryArea(camera.position);
  if (result){
    for (var objName in sceneHandler.getAddedObjects()){
      addedObjects[objName].applyAreaConfiguration(result);
    }
    for (var objName in sceneHandler.getObjectGroups()){
      objectGroups[objName].applyAreaConfiguration(result);
    }
    for (var textName in sceneHandler.getAddedTexts()){
      addedTexts[textName].applyAreaConfiguration(result);
    }
  }else{
    for (var objName in sceneHandler.getAddedObjects()){
      addedObjects[objName].applyAreaConfiguration("default");
    }
    for (var objName in sceneHandler.getObjectGroups()){
      objectGroups[objName].applyAreaConfiguration("default");
    }
    for (var textName in sceneHandler.getAddedTexts()){
      addedTexts[textName].applyAreaConfiguration("default");
    }
  }
}

AreaConfigurationsHandler.prototype.handle = function(){
  if (mode == 0 && !isDeployment){
    if (guiHandler.isOneOfBlockingGUIActive()){
      return;
    }
  }
  var result = sceneHandler.getAreaBinHandler().queryArea(camera.position);
  if (result){
    if (result != this.currentArea){
      this.onCurrentAreaChange(result, this.currentArea);
      this.currentArea = result;
      this.updateNeeded = true;
    }else{
      this.updateNeeded = false;
    }
  }else if (this.currentArea != this.areaDefault){
    this.onCurrentAreaChange(this.areaDefault, this.currentArea);
    this.currentArea = this.areaDefault;
    this.updateNeeded = true;
  }else{
    this.updateNeeded = false;
  }
}

AreaConfigurationsHandler.prototype.generateConfigurations = function(){
  this.visibilityConfigurations = new Object();
  this.sideConfigurations = new Object();

  for (var areaName in sceneHandler.getAreas()){
    this.visibilityConfigurations[areaName] = new Object();
    this.sideConfigurations[areaName] = new Object();
    for (var objName in sceneHandler.getAddedObjects()){
      var obj = addedObjects[objName];
      this.visibilityConfigurations[areaName][objName] = {
        "Visible": obj.getVisibilityInArea(areaName)
      };
      this.sideConfigurations[areaName][objName] = {
        "Side": obj.getSideInArea(areaName)
      };
    }
    for (var objName in sceneHandler.getObjectGroups()){
      var obj = objectGroups[objName];
      this.visibilityConfigurations[areaName][objName] = {
        "Visible": obj.getVisibilityInArea(areaName)
      };
      this.sideConfigurations[areaName][objName] = {
        "Side": obj.getSideInArea(areaName)
      };
    }
    for (var textName in sceneHandler.getAddedTexts()){
      var addedText = addedTexts[textName];
      if (addedText.is2D){
        continue;
      }
      this.visibilityConfigurations[areaName][textName] = {
        "Visible": addedText.getVisibilityInArea(areaName)
      }
    }
  }

  this.visibilityConfigurations["default"] = new Object();
  this.sideConfigurations["default"] = new Object();
  for (var objName in sceneHandler.getAddedObjects()){
    var obj = addedObjects[objName];
    this.visibilityConfigurations["default"][objName] = {
      "Visible": obj.getVisibilityInArea("default")
    };
    this.sideConfigurations["default"][objName] = {
      "Side": obj.getSideInArea("default")
    };
  }
  for (var objName in sceneHandler.getObjectGroups()){
    var obj = objectGroups[objName];
    this.visibilityConfigurations["default"][objName] = {
      "Visible": obj.getVisibilityInArea("default")
    };
    this.sideConfigurations["default"][objName] = {
      "Side": obj.getSideInArea("default")
    };
  }
  for (var textName in sceneHandler.getAddedTexts()){
    var addedText = addedTexts[textName];
    if (addedText.is2D){
      continue;
    }
    this.visibilityConfigurations["default"][textName] = {
      "Visible": addedText.getVisibilityInArea("default")
    }
  }
}

AreaConfigurationsHandler.prototype.show = function(){
  this.generateConfigurations();
  guiHandler.datGuiAreaConfigurations = new dat.GUI({hideable: false});
  areaConfigurationsVisible = true;

  for (var areaName in sceneHandler.getAreas()){
    var areaFolder = guiHandler.datGuiAreaConfigurations.addFolder(areaName);
    this.addSubFolder(areaName, areaFolder);
  }

  var defaultFolder = guiHandler.datGuiAreaConfigurations.addFolder("default");
  this.addSubFolder("default", defaultFolder);

  guiHandler.datGuiAreaConfigurations.add({
    "Done": function(){
      guiHandler.hide(guiHandler.guiTypes.AREA);
      terminal.clear();
      terminal.printInfo(Text.GUI_CLOSED);
    }
  }, "Done");
}

AreaConfigurationsHandler.prototype.addSubFolder = function(areaName, folder){
  var areaConfigurationsHandlerContext = this;
  for (var objName in sceneHandler.getAddedObjects()){
    var obj = addedObjects[objName];
    if (obj.isChangeable || obj.isDynamicObject){
      continue;
    }
    var objFolder = folder.addFolder(objName);
    var visibilityController = objFolder.add(this.visibilityConfigurations[areaName][objName], "Visible");
    var sideController = objFolder.add(this.sideConfigurations[areaName][objName], "Side", this.sideAry);
    visibilityController.onChange(function(val){
      this.object.setVisibilityInArea(this.areaName, val);
      if (areaConfigurationsHandlerContext.currentArea){
        delete areaConfigurationsHandlerContext.currentArea;
      }
    }.bind({object: addedObjects[objName], areaName: areaName}));
    sideController.onChange(function(val){
      this.object.setSideInArea(this.areaName, val);
      if (areaConfigurationsHandlerContext.currentArea){
        delete areaConfigurationsHandlerContext.currentArea;
      }
    }.bind({object: addedObjects[objName], areaName: areaName}));
  }
  for (var objName in sceneHandler.getObjectGroups()){
    var obj = objectGroups[objName];
    if (obj.isChangeable || obj.isDynamicObject){
      continue;
    }
    var objFolder = folder.addFolder(objName);
    var visibilityController = objFolder.add(this.visibilityConfigurations[areaName][objName], "Visible");
    var sideController = objFolder.add(this.sideConfigurations[areaName][objName], "Side", this.sideAry);
    visibilityController.onChange(function(val){
      this.object.setVisibilityInArea(this.areaName, val);
      if (areaConfigurationsHandlerContext.currentArea){
        delete areaConfigurationsHandlerContext.currentArea;
      }
    }.bind({object: objectGroups[objName], areaName: areaName}));
    sideController.onChange(function(val){
      this.object.setSideInArea(this.areaName, val);
      if (areaConfigurationsHandlerContext.currentArea){
        delete areaConfigurationsHandlerContext.currentArea;
      }
    }.bind({object: objectGroups[objName], areaName: areaName}));
  }
  for (var textName in sceneHandler.getAddedTexts()){
    var addedText = addedTexts[textName];
    if (addedText.is2D){
      continue;
    }
    var textFolder = folder.addFolder(textName);
    var visibilityController = textFolder.add(this.visibilityConfigurations[areaName][textName], "Visible");
    visibilityController.onChange(function(val){
      this.addedText.setVisibilityInArea(this.areaName, val);
      if (areaConfigurationsHandlerContext.currentArea){
        delete areaConfigurationsHandlerContext.currentArea;
      }
    }.bind({addedText: addedText, areaName: areaName}));
  }
}
