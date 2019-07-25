var Scene = function(name){
  this.name = name;
  this.gridSystems = new Object();
  this.markedPoints = new Object();
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
}
