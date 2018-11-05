var AreaConfigurationsHandler = function(){
  this.sideAry = ["Both", "Front", "Back"];
  this.areaDefault = "default";
  this.updateNeeded = false;
}

AreaConfigurationsHandler.prototype.handle = function(){
  var result = areaBinHandler.queryArea(camera.position);
  if (result){
    if (result != this.currentArea){
      this.currentArea = result;
      this.updateNeeded = true;
    }
  }else if (this.currentArea != this.areaDefault){
    this.currentArea = this.areaDefault;
    this.updateNeeded = true;
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
    for (var objName in addedObjects){
      var obj = addedObjects[objName];
      this.visibilityConfigurations[areaName][objName] = {
        "Visible": obj.getVisibilityInArea(areaName)
      };
      this.sideConfigurations[areaName][objName] = {
        "Side": obj.getSideInArea(areaName)
      };
    }
    for (var objName in objectGroups){
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
    for (var objName in addedObjects){
      var obj = addedObjects[objName];
      this.visibilityConfigurations["default"][objName] = {
        "Visible": obj.getVisibilityInArea("default")
      };
      this.sideConfigurations["default"][objName] = {
        "Side": obj.getSideInArea("default")
      };
    }
    for (var objName in objectGroups){
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
  datGuiAreaConfigurations = new dat.GUI();
  var pseudoAreas = areas;
  if (singleAreaName){
    pseudoAreas = new Object();
    if (singleAreaName.toLowerCase() != "default"){
      pseudoAreas[singleAreaName] = areas[singleAreaName];
    }
  }
  for (var areaName in pseudoAreas){
    var areaFolder = datGuiAreaConfigurations.addFolder(areaName);
    this.addSubFolder(areaName, areaFolder);
  }
  if (!singleAreaName || (singleAreaName && singleAreaName.toLowerCase() == "default")){
    var defaultFolder = datGuiAreaConfigurations.addFolder("default");
    this.addSubFolder("default", defaultFolder);
  }
}

AreaConfigurationsHandler.prototype.addSubFolder = function(areaName, folder){
  var areaConfigurationsHandlerContext = this;
  for (var objName in addedObjects){
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
  for (var objName in objectGroups){
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
