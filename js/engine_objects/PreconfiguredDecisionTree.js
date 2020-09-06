var PreconfiguredDecisionTree = function(name, knowledgeName, sceneName){
  this.name = name;
  this.knowledgeName = knowledgeName;
  this.sceneName = sceneName;

  this.rootDecision = null;
}

PreconfiguredDecisionTree.prototype.export = function(){
  var exportObj = {
    name: this.name,
    knowledgeName: this.knowledgeName,
    sceneName: this.sceneName
  };

  if (this.rootDecision){
    exportObj.rootDecision = this.rootDecision.export();
  }

  return exportObj;
}

PreconfiguredDecisionTree.prototype.setRootDecision = function(preconfiguredDecision){
  this.rootDecision = preconfiguredDecision;
}

PreconfiguredDecisionTree.prototype.unsetRootDecision = function(){
  this.rootDecision = null;
}

PreconfiguredDecisionTree.prototype.hasRootDecision = function(){
  return this.rootDecision != null;
}