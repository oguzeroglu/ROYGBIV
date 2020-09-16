var PreconfiguredStateMachine = function(name, knowledgeName, entryStateName, sceneName){
  this.name = name;
  this.knowledgeName = knowledgeName;
  this.entryStateName = entryStateName;
  this.sceneName = sceneName;

  var knowledge = decisionHandler.knowledgesBySceneName[sceneName][knowledgeName];
  var entryState = decisionHandler.statesBySceneName[sceneName][entryStateName];

  this.stateMachine = new Ego.StateMachine(name, knowledge);
  this.stateMachine.addState(entryState);
  this.stateMachine.setEntryState(entryState);
}

PreconfiguredStateMachine.prototype.export = function(){
  return {
    knowledgeName: this.knowledgeName,
    entryStateName: this.entryStateName
  };
}
