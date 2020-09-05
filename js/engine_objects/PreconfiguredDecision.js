var PreconfiguredDecision = function(decisionName, sceneName){
  this.decisionName = decisionName;
  this.sceneName = sceneName;

  this.yesNode = null;
  this.noNode = null;
}

PreconfiguredDecision.prototype.export = function(){
  var exportObj = {
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
}

PreconfiguredDecision.prototype.setYesNode = function(yesNode){
  this.yesNode = yesNode;
}

PreconfiguredDecision.prototype.setNoNode = function(noNode){
  this.noNode = noNode;
}
