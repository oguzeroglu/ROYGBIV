var PreconfiguredStateMachine = function(name, knowledgeName, entryStateName, sceneName){
  this.name = name;
  this.knowledgeName = knowledgeName;
  this.entryStateName = entryStateName;
  this.sceneName = sceneName;
}

PreconfiguredStateMachine.prototype.export = function(){
  return {
    knowledgeName: this.knowledgeName,
    entryStateName: this.entryStateName
  };
}

PreconfiguredStateMachine.prototype.get = function(){

}
