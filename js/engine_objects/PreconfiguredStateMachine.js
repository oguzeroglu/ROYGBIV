var PreconfiguredStateMachine = function(name, knowledgeName, entryStateName, sceneName){
  this.name = name;
  this.knowledgeName = knowledgeName;
  this.entryStateName = entryStateName;
  this.sceneName = sceneName;

  this.transitions = [];
}

PreconfiguredStateMachine.prototype.export = function(){
  return {
    knowledgeName: this.knowledgeName,
    entryStateName: this.entryStateName,
    transitions: JSON.parse(JSON.stringify(this.transitions))
  };
}

PreconfiguredStateMachine.prototype.addTransition = function(transition){
  this.transitions.push(transition.name);
}

PreconfiguredStateMachine.prototype.removeTransition = function(transitionName){
  this.transitions.splice(this.transitions.indexOf(transitionName), 1);
}

PreconfiguredStateMachine.prototype.get = function(){

}
