var PreconfiguredStateMachine = function(name, knowledgeName, entryStateName, sceneName){
  this.name = name;
  this.knowledgeName = knowledgeName;
  this.entryStateName = entryStateName;
  this.sceneName = sceneName;

  this.transitions = [];
  this.states = [entryStateName];
}

PreconfiguredStateMachine.prototype.export = function(){
  return {
    knowledgeName: this.knowledgeName,
    entryStateName: this.entryStateName,
    transitions: JSON.parse(JSON.stringify(this.transitions)),
    states: JSON.parse(JSON.stringify(this.states))
  };
}

PreconfiguredStateMachine.prototype.addTransition = function(transition){
  this.transitions.push(transition.name);
}

PreconfiguredStateMachine.prototype.removeTransition = function(transitionName){
  this.transitions.splice(this.transitions.indexOf(transitionName), 1);
}

PreconfiguredStateMachine.prototype.addState = function(stateName){
  if (this.states.indexOf(stateName) >= 0){
    return false;
  }

  this.states.push(stateName);
  return true;
}

PreconfiguredStateMachine.prototype.removeState = function(stateName){
  if (this.entryStateName == stateName){
    return false;
  }

  this.states.splice(this.states.indexOf(stateName), 1);
  return true;
}

PreconfiguredStateMachine.prototype.get = function(){

}
