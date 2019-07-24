var Scene = function(name){
  this.name = name;
  this.gridSystems = new Object();
}

Scene.prototype.registerGridSystem = function(gridSystem){
  this.gridSystems[gridSystem.name] = gridSystem;
}
