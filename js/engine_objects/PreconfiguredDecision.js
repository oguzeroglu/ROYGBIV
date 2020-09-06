var PreconfiguredDecision = function(decisionName, sceneName){
  this.decisionName = decisionName;
  this.sceneName = sceneName;

  this.yesNode = null;
  this.noNode = null;
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
