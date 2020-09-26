var PreconfiguredDecisionTree = function(name, knowledgeName, sceneName){
  this.name = name;
  this.knowledgeName = knowledgeName;
  this.sceneName = sceneName;

  this.rootDecision = null;
}

PreconfiguredDecisionTree.prototype.get = function(){
  var decisionTree = new Ego.DecisionTree(this.rootDecision.get());
  decisionTree.knowledgeName = this.knowledgeName;
  decisionTree.resultCache = null;
  decisionTree.registeredSceneName = this.sceneName;
  return decisionTree;
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

PreconfiguredDecisionTree.prototype.import = function(exportObj){
  this.name = exportObj.name;
  this.knowledgeName = exportObj.knowledgeName;
  this.sceneName = exportObj.sceneName;

  if (exportObj.rootDecision){
    this.setRootDecision(new PreconfiguredDecision().import(exportObj.rootDecision));
  }

  return this;
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

PreconfiguredDecisionTree.prototype.isDecisionUsed = function(decisionName){
  if (!this.rootDecision){
    return false;
  }

  if (this.rootDecision){
    if (this.rootDecision.decisionName == decisionName){
      return true;
    }
  }

  return this.rootDecision.hasChildDecision(decisionName);
}
