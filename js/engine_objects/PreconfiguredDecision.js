var PreconfiguredDecision = function(decisionName, sceneName){
  this.decisionName = decisionName;
  this.sceneName = sceneName;

  this.yesNode = null;
  this.noNode = null;
}

PreconfiguredDecision.prototype.get = function(){
  var decisionObj = decisionHandler.decisionsBySceneName[this.sceneName][this.decisionName];

  var informationName = decisionObj.informationName;
  var informationType = decisionObj.informationType;
  var decisionMethod = null;

  if (decisionObj.method == decisionHandler.decisionMethods.IS_FALSE){
    decisionMethod = new Ego.IsFalse();
  }else if (decisionObj.method == decisionHandler.decisionMethods.IS_TRUE){
    decisionMethod = new Ego.IsTrue();
  }else{
    var range = new Ego.Range(decisionObj.range.lowerBound, decisionObj.range.upperBound);
    if (decisionObj.range.isLowerBoundInclusive){
      range.makeLowerBoundInclusive();
    }else{
      range.makeLowerBoundExclusive();
    }
    if (decisionObj.range.isUpperBoundInclusive){
      range.makeUpperBoundInclusive();
    }else{
      range.makeUpperBoundExclusive();
    }
    decisionMethod = new Ego.IsInRange(range);
  }

  var decision = new Ego.Decision(informationName, informationType, decisionMethod);

  if (this.yesNode != null){
    if (this.yesNode instanceof PreconfiguredDecision){
      decision.setYesNode(this.yesNode.get());
    }else{
      decision.setYesNode(this.yesNode);
    }
  }
  if (this.noNode != null){
    if (this.noNode instanceof PreconfiguredDecision){
      decision.setNoNode(this.noNode.get());
    }else{
      decision.setNoNode(this.noNode);
    }
  }

  return decision;
}

PreconfiguredDecision.prototype.export = function(){
  var exportObj = {
    isPreconfiguredDecision: true,
    decisionName: this.decisionName,
    sceneName: this.sceneName
  };

  if (this.yesNode instanceof PreconfiguredDecision){
    exportObj.yesNode = this.yesNode.export();
  }else{
    exportObj.yesNode = this.yesNode;
  }

  if (this.noNode instanceof PreconfiguredDecision){
    exportObj.noNode = this.noNode.export();
  }else{
    exportObj.noNode = this.noNode;
  }

  return exportObj;
}

PreconfiguredDecision.prototype.import = function(exportObj){
  this.decisionName = exportObj.decisionName;
  this.sceneName = exportObj.sceneName;

  if (exportObj.yesNode){
    if (exportObj.yesNode.isPreconfiguredDecision){
      this.setYesNode(new PreconfiguredDecision(null, null).import(exportObj.yesNode));
    }else{
      this.setYesNode(exportObj.yesNode);
    }
  }

  if (exportObj.noNode){
    if (exportObj.noNode.isPreconfiguredDecision){
      this.setNoNode(new PreconfiguredDecision(null, null).import(exportObj.noNode));
    }else{
      this.setNoNode(exportObj.noNode);
    }
  }

  return this;
}

PreconfiguredDecision.prototype.setYesNode = function(yesNode){
  this.yesNode = yesNode;
}

PreconfiguredDecision.prototype.setNoNode = function(noNode){
  this.noNode = noNode;
}

PreconfiguredDecision.prototype.unsetYesNode = function(){
  this.yesNode = null;
}

PreconfiguredDecision.prototype.unsetNoNode = function(){
  this.noNode = null;
}

PreconfiguredDecision.prototype.hasChildDecision = function(decisionName){
  if (this.yesNode && this.yesNode instanceof PreconfiguredDecision){
    if (this.yesNode.decisionName == decisionName){
      return true;
    }
  }

  if (this.noNode && this.noNode instanceof PreconfiguredDecision){
    if (this.noNode.decisionName == decisionName){
      return true;
    }
  }

  var yesResult = false;
  var noResult = false;

  if (this.yesNode && this.yesNode instanceof PreconfiguredDecision){
    yesResult = this.yesNode.hasChildDecision(decisionName);
  }

  if (this.noNode && this.noNode instanceof PreconfiguredDecision){
    noResult = this.noNode.hasChildDecision(decisionName);
  }

  return yesResult || noResult;
}
