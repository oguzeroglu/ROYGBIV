var Scene = function(name){
  this.name = name;
  this.addedObjects = new Object();
  this.objectGroups = new Object();
  this.addedTexts = new Object();
  this.gridSystems = new Object();
  this.wallCollections = new Object();
  this.markedPoints = new Object();
  this.areas = new Object();
  this.areaBinHandler = new WorldBinHandler(true);
  this.areaBinHandler.isAreaBinHandler = true;
  this.isSkyboxMapped = false;
}

Scene.prototype.import = function(exportObj){
  for (var i = 0; i<exportObj.addedObjectNames.length; i++){
    this.registerAddedObject(addedObjects[exportObj.addedObjectNames[i]]);
  }
  for (var i = 0; i<exportObj.objectGroupNames.length; i++){
    this.registerObjectGroup(objectGroups[exportObj.objectGroupNames[i]]);
  }
  for (var i = 0; i<exportObj.addedTextNames.length; i++){
    this.registerAddedText(addedTexts[exportObj.addedTextNames[i]]);
  }
  for (var i = 0; i<exportObj.gridSystemNames.length; i++){
    this.registerGridSystem(gridSystems[exportObj.gridSystemNames[i]]);
  }
  for (var i = 0; i<exportObj.wallCollectionNames.length; i++){
    this.registerWallCollection(wallCollections[exportObj.wallCollectionNames[i]]);
  }
  for (var i = 0; i<exportObj.markedPointNames.length; i++){
    this.registerMarkedPoint(markedPoints[exportObj.markedPointNames[i]]);
  }
  for (var i = 0; i<exportObj.areaNames.length; i++){
    this.registerArea(areas[exportObj.areaNames[i]]);
    this.areaBinHandler.insert(areas[exportObj.areaNames[i]].boundingBox, exportObj.areaNames[i]);
  }
  this.isSkyboxMapped = exportObj.isSkyboxMapped;
  if (this.isSkyboxMapped){
    this.mappedSkyboxName = exportObj.mappedSkyboxName;
  }
  if (exportObj.fogConfigurations){
    this.fogConfigurations = exportObj.fogConfigurations;
  }
}

Scene.prototype.export = function(){
  var exportObj = new Object();
  exportObj.addedObjectNames = Object.keys(this.addedObjects);
  exportObj.objectGroupNames = Object.keys(this.objectGroups);
  exportObj.addedTextNames = Object.keys(this.addedTexts);
  exportObj.gridSystemNames = Object.keys(this.gridSystems);
  exportObj.wallCollectionNames = Object.keys(this.wallCollections);
  exportObj.markedPointNames = Object.keys(this.markedPoints);
  exportObj.areaNames = Object.keys(this.areas);
  exportObj.isSkyboxMapped = this.isSkyboxMapped;
  if (this.isSkyboxMapped){
    exportObj.mappedSkyboxName = this.mappedSkyboxName;
  }
  if (this.fogConfigurations){
    exportObj.fogConfigurations = this.fogConfigurations;
  }
  return exportObj;
}

Scene.prototype.refreshAreaBinHandler = function(){
  this.areaBinHandler = new WorldBinHandler(true);
  this.areaBinHandler.isAreaBinHandler = true;
  for (var areaName in this.areas){
    this.areaBinHandler.insert(areas[areaName].boundingBox, areaName);
  }
}

Scene.prototype.registerFog = function(fogConfigurations){
  this.fogConfigurations = fogConfigurations;
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
  this.wallCollections[wallCollection.name] = wallCollection;
  wallCollection.registeredSceneName = this.name;
}

Scene.prototype.unregisterWallCollection = function(wallCollection){
  for (var i = 0; i<wallCollection.gridSystemNames.length; i++){
    this.unregisterGridSystem(gridSystems[wallCollection.gridSystemNames[i]]);
  }
  delete this.wallCollection[wallCollection.name];
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
