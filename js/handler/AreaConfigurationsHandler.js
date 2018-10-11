var AreaConfigurationsHandler = function(){
  this.sideAry = ["Both", "Front", "Back"];
  this.areaDefault = "default";
}

AreaConfigurationsHandler.prototype.handle = function(){
  var result = areaBinHandler.queryArea(camera.position);
  if (result){
    if (result != this.currentArea){
      this.currentArea = result;
      this.applyConfigurations();
    }
  }else if (this.currentArea != this.areaDefault){
    this.currentArea = this.areaDefault;
    this.applyConfigurations();
  }
}

AreaConfigurationsHandler.prototype.applyConfigurations = function(){
  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (obj.areaVisibilityConfigurations){
      var configurations = obj.areaVisibilityConfigurations[this.currentArea];
      if (!(typeof configurations == UNDEFINED)){
        obj.mesh.visible = configurations;
      }else{
        obj.mesh.visible = true;
      }
    }
    if (obj.areaSideConfigurations){
      var configurations = obj.areaSideConfigurations[this.currentArea];
      if (!(typeof configurations == UNDEFINED)){
        if (configurations == SIDE_BOTH){
          obj.mesh.material.side = THREE.DoubleSide;
        }else if (configurations == SIDE_FRONT){
          obj.mesh.material.side = THREE.FrontSide;
        }else if (configurations == SIDE_BACK){
          obj.mesh.material.side = THREE.BackSide;
        }
      }else{
        if (obj.defaultSide){
          if (obj.defaultSide == SIDE_BOTH){
            obj.mesh.material.side = THREE.DoubleSide;
          }else if (obj.defaultSide == SIDE_FRONT){
            obj.mesh.material.side = THREE.FrontSide;
          }else if (obj.defaultSide == SIDE_BACK){
            obj.mesh.material.side = THREE.BackSide;
          }
        }else{
          obj.mesh.material.side = THREE.DoubleSide;
        }
      }
    }
  }
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (obj.areaVisibilityConfigurations){
      var configurations = obj.areaVisibilityConfigurations[this.currentArea];
      if (!(typeof configurations == UNDEFINED)){
        obj.mesh.visible = configurations;
      }else{
        obj.mesh.visible = true;
      }
    }
    if (obj.areaSideConfigurations){
      var configurations = obj.areaSideConfigurations[this.currentArea];
      if (!(typeof configurations == UNDEFINED)){
        if (configurations == SIDE_BOTH){
          obj.mesh.material.side = THREE.DoubleSide;
        }else if (configurations == SIDE_FRONT){
          obj.mesh.material.side = THREE.FrontSide;
        }else if (configurations == SIDE_BACK){
          obj.mesh.material.side = THREE.BackSide;
        }
      }else{
        if (obj.defaultSide){
          if (obj.defaultSide == SIDE_BOTH){
            obj.mesh.material.side = THREE.DoubleSide;
          }else if (obj.defaultSide == SIDE_FRONT){
            obj.mesh.material.side = THREE.FrontSide;
          }else if (obj.defaultSide == SIDE_BACK){
            obj.mesh.material.side = THREE.BackSide;
          }
        }else{
          obj.mesh.material.side = THREE.DoubleSide;
        }
      }
    }
  }
}

AreaConfigurationsHandler.prototype.generateConfigurations = function(){
  this.visibilityConfigurations = new Object();
  this.sideConfigurations = new Object();
  for (var areaName in areas){
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

AreaConfigurationsHandler.prototype.show = function(){
  this.generateConfigurations();
  datGuiAreaConfigurations = new dat.GUI();
  for (var areaName in areas){
    var areaFolder = datGuiAreaConfigurations.addFolder(areaName);
    this.addSubFolder(areaName, areaFolder);
  }
  var defaultFolder = datGuiAreaConfigurations.addFolder("default");
  this.addSubFolder("default", defaultFolder);
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
