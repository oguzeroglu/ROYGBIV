var Scene = function(name){
  this.name = name;
  this.addedObjects = new Object();
  this.objectGroups = new Object();
  this.addedTexts = new Object();
  this.gridSystems = new Object();
  this.markedPoints = new Object();
  this.areas = new Object();
  this.areaBinHandler = new WorldBinHandler(true);
  this.areaBinHandler.isAreaBinHandler = true;
  this.isSkyboxMapped = false;
}

Scene.prototype.mapSkybox = function(skybox){
  this.isSkyboxMapped = true;
  this.mappedSkyboxName = skybox.name;
}

Scene.prototype.unmapSkybox = function(){
  this.isSkyboxMapped = false;
  delete this.mappedSkyboxName;
}

Scene.prototype.registerAddedText = function(addedText){
  this.addedTexts[addedText.name] = addedText;
  addedText.registeredSceneName = this.name;
}

Scene.prototype.unregisterAddedText = function(addedText){
  delete this.addedTexts[addedText.name];
  delete addedText.registeredSceneName;
}

Scene.prototype.registerObjectGroup = function(objectGroup){
  this.objectGroups[objectGroup.name] = objectGroup;
  objectGroup.registeredSceneName = this.name;
}

Scene.prototype.unregisterObjectGroup = function(objectGroup){
  delete this.objectGroups[objectGroup.name];
  delete objectGroup.registeredSceneName;
}

Scene.prototype.registerAddedObject = function(addedObject){
  this.addedObjects[addedObject.name] = addedObject;
  addedObject.registeredSceneName = this.name;
}

Scene.prototype.unregisterAddedObject = function(addedObject){
  delete this.addedObjects[addedObject.name];
  delete addedObject.registeredSceneName;
}

Scene.prototype.registerArea = function(area){
  this.areas[area.name] = area;
  area.registeredSceneName = this.name;
}

Scene.prototype.unregisterArea = function(area){
  delete this.areas[area.name];
  delete area.registeredSceneName;
}

Scene.prototype.registerGridSystem = function(gridSystem){
  this.gridSystems[gridSystem.name] = gridSystem;
  gridSystem.registeredSceneName = this.name;
}

Scene.prototype.unregisterGridSystem = function(gridSystem){
  delete this.gridSystems[gridSystem.name];
  delete gridSystem.registeredSceneName;
}

Scene.prototype.registerWallCollection = function(wallCollection){
  for (var i = 0; i<wallCollection.gridSystemNames.length; i++){
    this.registerGridSystem(gridSystems[wallCollection.gridSystemNames[i]]);
  }
  wallCollection.registeredSceneName = this.name;
}

Scene.prototype.unregisterWallCollection = function(wallCollection){
  for (var i = 0; i<wallCollection.gridSystemNames.length; i++){
    this.unregisterGridSystem(gridSystems[wallCollection.gridSystemNames[i]]);
  }
  delete wallCollection.registeredSceneName;
}

Scene.prototype.registerMarkedPoint = function(markedPoint){
  this.markedPoints[markedPoint.name] = markedPoint;
  markedPoint.registeredSceneName = this.name;
}

Scene.prototype.unregisterMarkedPoint = function(markedPoint){
  delete this.markedPoints[markedPoint.name];
  delete markedPoint.registeredSceneName;
}
