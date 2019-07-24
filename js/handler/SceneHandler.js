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
    for (var gridName in gridSelections){
      gridSelections[gridName].toggleSelect();
    }
    gridSelections = new Object();
  }
  this.activeSceneName = sceneName;
}

SceneHandler.prototype.createScene = function(sceneName){
  this.scenes[sceneName] = new Scene(sceneName);
}

SceneHandler.prototype.onGridSystemCreation = function(gridSystem){
  this.scenes[this.activeSceneName].registerGridSystem(gridSystem);
}

SceneHandler.prototype.getActiveSceneName = function(){
  return this.activeSceneName;
}

SceneHandler.prototype.getGridSystems = function(){
  return this.scenes[this.activeSceneName].gridSystems;
}
