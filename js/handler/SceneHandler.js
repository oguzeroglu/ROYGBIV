var SceneHandler = function(){
  this.activeSceneName = "scene1";
  this.scenes = new Object();
  this.scenes[this.activeSceneName] = new Scene("scene1");
}

SceneHandler.prototype.changeScene = function(sceneName){
  var curActiveScene = this.scenes[this.activeSceneName];
  if (mode == 0){
    for (var gsName in curActiveScene.gridSystems){
      var gs = curActiveScene.gridSystems[gsName];
      gs.hide();
    }
    for (var objName in curActiveScene.addedObjects){
      var obj = curActiveScene.addedObjects[objName];
      obj.hideOnDesignMode();
    }
    for (var gridName in gridSelections){
      gridSelections[gridName].toggleSelect();
    }
    if (markedPointsVisible){
      for (var markedPointName in curActiveScene.markedPoints){
        var markedPoint = curActiveScene.markedPoints[markedPointName];
        if (!markedPoint.isHidden){
          markedPoint.hide();
        }
      }
    }
    if (areasVisible){
      for (var areaName in curActiveScene.areas){
        curActiveScene.areas[areaName].hide();
      }
    }
    gridSelections = new Object();
    for (var gsName in this.scenes[sceneName].gridSystems){
      var gs = this.scenes[sceneName].gridSystems[gsName];
      gs.show();
    }
    for (var objName in this.scenes[sceneName].addedObjects){
      var obj = this.scenes[sceneName].addedObjects[objName];
      obj.showOnDesignMode();
    }
    if (markedPointsVisible){
      for (var markedPointName in this.scenes[sceneName].markedPoints){
        var markedPoint = this.scenes[sceneName].markedPoints[markedPointName];
        if (markedPoint.isHidden){
          markedPoint.show();
        }
      }
    }
    if (areasVisible){
      for (var areaName in this.scenes[sceneName].areas){
        this.scenes[sceneName].areas[areaName].renderToScreen();
      }
    }
  }
  this.activeSceneName = sceneName;
  if (mode == 0){
    $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode - "+sceneHandler.getActiveSceneName()+")");
  }
}

SceneHandler.prototype.createScene = function(sceneName){
  this.scenes[sceneName] = new Scene(sceneName);
}

SceneHandler.prototype.onAddedObjectCreation = function(addedObject){
  this.scenes[this.activeSceneName].registerAddedObject(addedObject);
}

SceneHandler.prototype.onAddedObjectDeletion = function(addedObject){
  this.scenes[addedObject.registeredSceneName].unregisterAddedObject(addedObject);
}

SceneHandler.prototype.onAreaCreation = function(area){
  this.scenes[this.activeSceneName].registerArea(area);
}

SceneHandler.prototype.onAreaDeletion = function(area){
  this.scenes[area.registeredSceneName].unregisterArea(area);
}

SceneHandler.prototype.onGridSystemCreation = function(gridSystem){
  this.scenes[this.activeSceneName].registerGridSystem(gridSystem);
}

SceneHandler.prototype.onGridSystemDeletion = function(gridSystem){
  this.scenes[gridSystem.registeredSceneName].unregisterGridSystem(gridSystem);
}

SceneHandler.prototype.onWallCollectionCreation = function(wallCollection){
  this.scenes[this.activeSceneName].registerWallCollection(wallCollection);
}

SceneHandler.prototype.onWallCollectionDeletion = function(wallCollection){
  this.scenes[wallCollection.registeredSceneName].unregisterWallCollection(wallCollection);
}

SceneHandler.prototype.onMarkedPointCreation = function(markedPoint){
  this.scenes[this.activeSceneName].registerMarkedPoint(markedPoint);
}

SceneHandler.prototype.onMarkedPointDeletion = function(markedPoint){
  this.scenes[markedPoint.registeredSceneName].unregisterMarkedPoint(markedPoint);
}

SceneHandler.prototype.getActiveSceneName = function(){
  return this.activeSceneName;
}

SceneHandler.prototype.getGridSystems = function(){
  return this.scenes[this.activeSceneName].gridSystems;
}

SceneHandler.prototype.getMarkedPoints = function(){
  return this.scenes[this.activeSceneName].markedPoints;
}

SceneHandler.prototype.getAreaBinHandler = function(){
  return this.scenes[this.activeSceneName].areaBinHandler;
}

SceneHandler.prototype.getAreas = function(){
  return this.scenes[this.activeSceneName].areas;
}

SceneHandler.prototype.getAddedObjects = function(){
  return this.scenes[this.activeSceneName].addedObjects;
}

SceneHandler.prototype.getObjectGroups = function(){
  return this.scenes[this.activeSceneName].objectGroups;
}