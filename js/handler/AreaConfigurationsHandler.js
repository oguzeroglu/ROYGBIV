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
  if (enterCallbackFunc && areas[enteredAreaName].registeredSceneName == sceneHandler.getActiveSceneName()){
    enterCallbackFunc(exitedAreaName);
  }
  if (exitCallbackFunc && areas[exitedAreaName].registeredSceneName == sceneHandler.getActiveSceneName()){
    exitCallbackFunc(enteredAreaName);
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
  }else{
    for (var objName in sceneHandler.getAddedObjects()){
      addedObjects[objName].applyAreaConfiguration("default");
    }
    for (var objName in sceneHandler.getObjectGroups()){
      objectGroups[objName].applyAreaConfiguration("default");
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

AreaConfigurationsHandler.prototype.generateConfigurations = function(singleAreaName){
  this.visibilityConfigurations = new Object();
  this.sideConfigurations = new Object();
  var pseudoAreas = areas;
  if (singleAreaName){
    pseudoAreas = new Object();
    if (singleAreaName.toLowerCase() != "default"){
      pseudoAreas[singleAreaName] = areas[singleAreaName];
    }
  }
  for (var areaName in pseudoAreas){
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
  }

  if (!singleAreaName || (singleAreaName && singleAreaName.toLowerCase() == "default")){
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
  }
}

AreaConfigurationsHandler.prototype.show = function(singleAreaName){
  this.generateConfigurations(singleAreaName);
  guiHandler.datGuiAreaConfigurations = new dat.GUI({hideable: false});
  areaConfigurationsVisible = true;
  var pseudoAreas = sceneHandler.getAreas();
  if (singleAreaName){
    pseudoAreas = new Object();
    if (singleAreaName.toLowerCase() != "default"){
      pseudoAreas[singleAreaName] = areas[singleAreaName];
    }
  }
  for (var areaName in pseudoAreas){
    var areaFolder = guiHandler.datGuiAreaConfigurations.addFolder(areaName);
    this.addSubFolder(areaName, areaFolder);
  }
  if (!singleAreaName || (singleAreaName && singleAreaName.toLowerCase() == "default")){
    var defaultFolder = guiHandler.datGuiAreaConfigurations.addFolder("default");
    this.addSubFolder("default", defaultFolder);
  }
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
}

AreaConfigurationsHandler.prototype.sphericalDistribution = function(radius){
  REUSABLE_VECTOR.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
  REUSABLE_VECTOR.normalize();
  REUSABLE_VECTOR.multiplyScalar(radius);
  return REUSABLE_VECTOR;
}

AreaConfigurationsHandler.prototype.getRandomPointInsideArea = function(area){
  var x = Math.random() * (area.boundingBox.max.x - area.boundingBox.min.x) + area.boundingBox.min.x;
  var y = Math.random() * (area.boundingBox.max.y - area.boundingBox.min.y) + area.boundingBox.min.y;
  var z = Math.random() * (area.boundingBox.max.z - area.boundingBox.min.z) + area.boundingBox.min.z;
  REUSABLE_VECTOR.set(x, y, z);
  return REUSABLE_VECTOR;
}

AreaConfigurationsHandler.prototype.autoConfigureArea = function(areaName){
  var pseudoRaycaster = raycasterFactory.getNonWorker();
  var area = areas[areaName];
  for (var objName in sceneHandler.getAddedObjects()){
    addedObjects[objName].setVisibilityInArea(areaName, false);
    if (!addedObjects[objName].defaultSide){
      addedObjects[objName].setSideInArea(areaName, SIDE_BOTH);
    }else{
      addedObjects[objName].setSideInArea(areaName, addedObjects[objName].defaultSide);
    }
  }
  for (var objName in sceneHandler.getObjectGroups()){
    objectGroups[objName].setVisibilityInArea(areaName, false);
    if (!objectGroups[objName].defaultSide){
      objectGroups[objName].setSideInArea(areaName, SIDE_BOTH);
    }else{
      objectGroups[objName].setSideInArea(areaName, objectGroups[objName].defaultSide);
    }
  }
  var visibleObjects = new Object();
  for (var i2 = 0; i2<200; i2++){
    var pointInsideArea = this.getRandomPointInsideArea(area);
    REUSABLE_VECTOR_5.set(pointInsideArea.x, pointInsideArea.y, pointInsideArea.z);
    for (var i = 0; i<200; i++){
      var vec = this.sphericalDistribution(1);
      REUSABLE_VECTOR_4.set(vec.x , vec.y, vec.z);
      pseudoRaycaster.findIntersections(REUSABLE_VECTOR_5, REUSABLE_VECTOR_4, false, noop, null, null);
      if (intersectionPoint){
        visibleObjects[intersectionObject] = true;
      }
    }
  }
  delete this.currentArea;
  for (var objName in visibleObjects){
    var obj = addedObjects[objName];
    if (!obj){
      obj = objectGroups[objName];
    }
    if (obj){
      obj.setVisibilityInArea(areaName, true);
    }
  }
}
