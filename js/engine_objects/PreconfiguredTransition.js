var PreconfiguredTransition = function(name, sourceStateName, targetStateName, decisionName, sceneName){
  this.name = name;
  this.sourceStateName = sourceStateName;
  this.targetStateName = targetStateName;
  this.decisionName = decisionName;
  this.sceneName = sceneName;
}

PreconfiguredTransition.prototype.export = function(){
  return {
    sourceStateName: this.sourceStateName,
    targetStateName: this.targetStateName,
    decisionName: this.decisionName
  };
}
