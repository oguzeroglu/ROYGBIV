var AreaConfigurationsHandler = function(){
  this.sideAry = ["Both", "Front", "Back"];
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
  for (var objName in addedObjects){
    var objFolder = folder.addFolder(objName);
    var visibilityController = objFolder.add(this.visibilityConfigurations[areaName][objName], "Visible");
    var sideController = objFolder.add(this.sideConfigurations[areaName][objName], "Side", this.sideAry);
    visibilityController.onChange(function(val){
      this.object.setVisibilityInArea(this.areaName, val);
    }.bind({object: addedObjects[objName], areaName: areaName}));
    sideController.onChange(function(val){
      this.object.setSideInArea(this.areaName, val);
    }.bind({object: addedObjects[objName], areaName: areaName}));
  }
  for (var objName in objectGroups){
    var objFolder = folder.addFolder(objName);
    var visibilityController = objFolder.add(this.visibilityConfigurations[areaName][objName], "Visible");
    var sideController = objFolder.add(this.sideConfigurations[areaName][objName], "Side", this.sideAry);
    visibilityController.onChange(function(val){
      this.object.setVisibilityInArea(this.areaName, val);
    }.bind({object: objectGroups[objName], areaName: areaName}));
    sideController.onChange(function(val){
      this.object.setSideInArea(this.areaName, val);
    }.bind({object: objectGroups[objName], areaName: areaName}));
  }
}
