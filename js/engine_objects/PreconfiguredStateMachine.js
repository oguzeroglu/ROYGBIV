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

PreconfiguredStateMachine.prototype.hasTransition = function(transitionName){
  var result = this.transitions.indexOf(transitionName) >= 0;

  if (!result){
    var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[this.sceneName] || {};
    for (var i = 0; i < this.states.length; i ++){
      var curStateName = this.states[i];
      var curSM = stateMachinesInScene[curStateName];
      if (curSM && curSM.hasTransition(transitionName)){
        return true;
      }
    }
  }

  return result;
}

PreconfiguredStateMachine.prototype.hasState = function(stateName){
  var result = this.states.indexOf(stateName) >= 0;

  if (!result){
    var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[this.sceneName] || {};
    for (var i = 0; i < this.states.length; i ++){
      var curStateName = this.states[i];
      var curSM = stateMachinesInScene[curStateName];
      if (curSM && curSM.hasState(stateName)){
        return true;
      }
    }
  }

  return result;
}

PreconfiguredStateMachine.prototype.addState = function(stateName){

  var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[this.sceneName] || {};
  var sm = stateMachinesInScene[stateName];
  if (sm && sm.hasState(this.name)){
    return -2;
  }

  if (this.hasState(stateName)){
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
