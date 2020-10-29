var DecisionHandler = function(){

  this.informationTypes = {
    "BOOLEAN": "BOOLEAN",
    "NUMERICAL": "NUMERICAL",
    "VECTOR": "VECTOR"
  };

  this.decisionMethods = {
    "IS_FALSE": "IS_FALSE",
    "IS_IN_RANGE": "IS_IN_RANGE",
    "IS_TRUE": "IS_TRUE"
  };

  this.reset();
}

DecisionHandler.prototype.reset = function(){
  this.knowledgesBySceneName = {};
  this.decisionsBySceneName = {};
  this.decisionTreesBySceneName = {};
  this.informationTypesByKnowledgeName = {};
  this.statesBySceneName = {};
  this.transitionsBySceneName = {};
  this.stateMachinesBySceneName = {};
  this.stateParentsBySceneName = {};
  this.clonedDecisionTreesBySceneName = {};
  this.clonedStateMachinesBySceneName = {};
}

DecisionHandler.prototype.onSwitchFromDesignToPreview = function(){
  this.constructedDecisionTrees = {};
  this.constructedStateMachines = {};
  this.initialKnowledgeData = {};
  this.stateEntryCallbacks = {};
  this.activeStateMachineMap = new Map();

  for (var sceneName in this.decisionTreesBySceneName){
    this.constructedDecisionTrees[sceneName] = {};
    var decisionTreesInScene = this.decisionTreesBySceneName[sceneName];
    for (var dtName in decisionTreesInScene){
      this.constructedDecisionTrees[sceneName][dtName] = decisionTreesInScene[dtName].get();
    }
  }

  for (var sceneName in this.clonedDecisionTreesBySceneName){
    var clonedDecisionTreesInScene = this.clonedDecisionTreesBySceneName[sceneName];
    for (var dtName in clonedDecisionTreesInScene){
      var cloneInfo = clonedDecisionTreesInScene[dtName];
      var refDT = this.constructedDecisionTrees[sceneName][cloneInfo.refName];
      var cloneDT = refDT.clone();
      cloneDT.knowledgeName = cloneInfo.knowledgeName;
      cloneDT.resultCache = null;
      cloneDT.registeredSceneName = sceneName;
      this.constructedDecisionTrees[sceneName][dtName] = cloneDT;
    }
  }

  for (var sceneName in this.knowledgesBySceneName){
    this.initialKnowledgeData[sceneName] = {};
    var knowledgesInScene = this.knowledgesBySceneName[sceneName];
    for (var knowledgeName in knowledgesInScene){
      var knowledge = knowledgesInScene[knowledgeName];
      this.initialKnowledgeData[sceneName][knowledgeName] = {
        boolean: JSON.parse(JSON.stringify(knowledge._booleanMap)),
        numerical: JSON.parse(JSON.stringify(knowledge._numericalMap)),
        vector: JSON.parse(JSON.stringify(knowledge._vectorMap))
      }

      knowledge.isDirty = true;
    }
  }

  for (var sceneName in this.stateMachinesBySceneName){
    this.constructedStateMachines[sceneName] = {};
    this.stateEntryCallbacks[sceneName] = {};
    var stateMachinesInScene = this.stateMachinesBySceneName[sceneName];
    for (var smName in stateMachinesInScene){
      var preconfiguredStateMachine = stateMachinesInScene[smName];
      var stateMachine = new Ego.StateMachine(preconfiguredStateMachine.name, this.knowledgesBySceneName[preconfiguredStateMachine.sceneName][preconfiguredStateMachine.knowledgeName]);
      stateMachine.registeredSceneName = sceneName;
      stateMachine.isDirty = false;
      this.constructedStateMachines[sceneName][smName] = stateMachine;
      this.stateEntryCallbacks[sceneName][stateMachine.getID()] = {};
      stateMachine.onStateChanged(function(newState){
        var callback = decisionHandler.stateEntryCallbacks[this.registeredSceneName][this.getID()][newState.getName()];
        if (callback){
          callback();
        }
      });
    }
  }

  for (var sceneName in this.stateMachinesBySceneName){
    var stateMachinesInScene = this.stateMachinesBySceneName[sceneName];
    var statesInScene = this.statesBySceneName[sceneName] || {};
    var constructedStateMachinesInScene = this.constructedStateMachines[sceneName];
    for (var smName in stateMachinesInScene){
      var preconfiguredStateMachine = stateMachinesInScene[smName];
      var stateMachine = constructedStateMachinesInScene[smName];
      for (var i = 0; i < preconfiguredStateMachine.states.length; i ++){
        var curStateName = preconfiguredStateMachine.states[i];
        var curState = statesInScene[curStateName] || constructedStateMachinesInScene[curStateName];
        stateMachine.addState(curState);
      }
    }
  }

  var constructedTransitions = {};

  for (var sceneName in this.transitionsBySceneName){
    constructedTransitions[sceneName] = {};
    var transitionsInScene = this.transitionsBySceneName[sceneName];
    var constructedStateMachinesInScene = this.constructedStateMachines[sceneName] || {};
    var statesInScene = this.statesBySceneName[sceneName] || {};
    for (var transitionName in transitionsInScene){
      var preconfiguredTransition = transitionsInScene[transitionName];
      var source = constructedStateMachinesInScene[preconfiguredTransition.sourceStateName] || statesInScene[preconfiguredTransition.sourceStateName];
      var target = constructedStateMachinesInScene[preconfiguredTransition.targetStateName] || statesInScene[preconfiguredTransition.targetStateName];
      var decision = new PreconfiguredDecision(preconfiguredTransition.decisionName, preconfiguredTransition.sceneName).get();
      constructedTransitions[sceneName][transitionName] = new Ego.Transition(source, target, decision._informationName, decision._informationType, decision._decisionMethod);
    }
  }

  for (var sceneName in this.stateMachinesBySceneName){
    var stateMachinesInScene = this.stateMachinesBySceneName[sceneName];
    var constructedStateMachinesInScene = this.constructedStateMachines[sceneName];
    var statesInScene = this.statesBySceneName[sceneName] || {};
    for (var smName in stateMachinesInScene){
      var preconfiguredStateMachine = stateMachinesInScene[smName];
      var stateMachine = constructedStateMachinesInScene[smName];
      stateMachine.setEntryState(constructedStateMachinesInScene[preconfiguredStateMachine.entryStateName] || statesInScene[preconfiguredStateMachine.entryStateName]);
      for (var i = 0; i < preconfiguredStateMachine.transitions.length; i ++){
        var transition = constructedTransitions[sceneName][preconfiguredStateMachine.transitions[i]];
        stateMachine.addTransition(transition);
      }
    }
  }

  for (var sceneName in this.clonedStateMachinesBySceneName){
    var clonedStateMachinesInScene = this.clonedStateMachinesBySceneName[sceneName];
    for (var smName in clonedStateMachinesInScene){
      var cloneInfo = clonedStateMachinesInScene[smName];
      var stateMachine = this.constructedStateMachines[sceneName][cloneInfo.refName].clone(decisionHandler.knowledgesBySceneName[sceneName][cloneInfo.knowledgeName]);
      stateMachine.registeredSceneName = sceneName;
      stateMachine.isDirty = false;
      stateMachine._name = smName;
      this.constructedStateMachines[sceneName][smName] = stateMachine;
      this.stateEntryCallbacks[sceneName][stateMachine.getID()] = {};
      stateMachine.onStateChanged(function(newState){
        var callback = decisionHandler.stateEntryCallbacks[this.registeredSceneName][this.getID()][newState.getName()];
        if (callback){
          callback();
        }
      });

      this.prepareClonedSMChildren(stateMachine, sceneName);
    }
  }
}

DecisionHandler.prototype.onSwitchFromPreviewToDesign = function(){
  delete this.constructedDecisionTrees;
  delete this.constructedStateMachines;
  delete this.activeStateMachineMap;
  delete this.stateEntryCallbacks;

  for (var sceneName in this.knowledgesBySceneName){
    var knowledgesInScene = this.knowledgesBySceneName[sceneName];
    for (var knowledgeName in knowledgesInScene){
      var knowledge = knowledgesInScene[knowledgeName];
      this.resetKnowledge(knowledge);
      delete knowledge.isDirty;
    }
  }

  for (var sceneName in this.statesBySceneName){
    var statesInScene = this.statesBySceneName[sceneName];
    for (var stateName in statesInScene){
      var state = statesInScene[stateName];
      state.removeParent();
    }
  }

  delete this.initialKnowledgeData;
}

DecisionHandler.prototype.onAfterSceneChange = function(){
  if (mode == 0){
    return;
  }

  if (!this.initialKnowledgeData){
    return;
  }

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()];

  if (knowledgesInScene){
    for (var knowledgeName in knowledgesInScene){
      this.resetKnowledge(knowledgesInScene[knowledgeName]);
    }
  }

  var constructedStateMachinesInScene = this.constructedStateMachines[sceneHandler.getActiveSceneName()];

  if (constructedStateMachinesInScene){
    for (var stateMachineName in constructedStateMachinesInScene){
      this.resetStateMachine(constructedStateMachinesInScene[stateMachineName]);
    }
  }

  this.activeStateMachineMap = new Map();
}

DecisionHandler.prototype.resetKnowledge = function(knowledge){
  var initialData = this.initialKnowledgeData[knowledge.registeredSceneName][knowledge.roygbivName];
  knowledge._booleanMap = JSON.parse(JSON.stringify(initialData.boolean));
  knowledge._numericalMap = JSON.parse(JSON.stringify(initialData.numerical));
  knowledge._vectorMap = JSON.parse(JSON.stringify(initialData.vector));

  knowledge.isDirty = true;
}

DecisionHandler.prototype.activateStateMachine = function(stateMachine){
  this.activeStateMachineMap.set(stateMachine.getName(), stateMachine);
  stateMachine.isDirty = true;
}

DecisionHandler.prototype.deactivateStateMachine = function(stateMachine){
  this.activeStateMachineMap.delete(stateMachine.getName());
}

DecisionHandler.prototype.import = function(exportObj){
  var knowledgesBySceneName = exportObj.knowledgesBySceneName;
  var decisionsBySceneName = exportObj.decisionsBySceneName;
  var decisionTreesBySceneName = exportObj.decisionTreesBySceneName;
  var statesBySceneName = exportObj.statesBySceneName;
  var transitionsBySceneName = exportObj.transitionsBySceneName;
  var stateMachinesBySceneName = exportObj.stateMachinesBySceneName;
  var stateParentsBySceneName = exportObj.stateParentsBySceneName;
  var clonedDecisionTreesBySceneName = exportObj.clonedDecisionTreesBySceneName;
  var clonedStateMachinesBySceneName = exportObj.clonedStateMachinesBySceneName;

  for (var sceneName in knowledgesBySceneName){
    this.knowledgesBySceneName[sceneName] = {};
    for (var knowledgeName in knowledgesBySceneName[sceneName]){

      this.createKnowledge(knowledgeName, sceneName);

      var knowledgeExport = knowledgesBySceneName[sceneName][knowledgeName];
      for (var infoName in knowledgeExport.boolean){
        var info = knowledgeExport.boolean[infoName];
        this.addInformationToKnowledge(knowledgeName, infoName, this.informationTypes.BOOLEAN, info, sceneName);
      }
      for (var infoName in knowledgeExport.numerical){
        var info = knowledgeExport.numerical[infoName];
        this.addInformationToKnowledge(knowledgeName, infoName, this.informationTypes.NUMERICAL, info, sceneName);
      }
      for (var infoName in knowledgeExport.vector){
        var info = knowledgeExport.vector[infoName];
        this.addInformationToKnowledge(knowledgeName, infoName, this.informationTypes.VECTOR, info, sceneName);
      }
    }
  }

  for (var sceneName in decisionsBySceneName){
    this.decisionsBySceneName[sceneName] = {};

    for (var decisionName in decisionsBySceneName[sceneName]){
      var decisionExport = decisionsBySceneName[sceneName][decisionName];
      var range = null;
      if (decisionExport.range){

        var lowerBound = decisionExport.range.lowerBound;
        var upperBound = decisionExport.range.upperBound;

        if (decisionExport.isLowerBoundInfinity){
          lowerBound = Infinity;
        }else if (decisionExport.isLowerBoundMinusInfinity){
          lowerBound = -Infinity;
        }

        if (decisionExport.isUpperBoundInfinity){
          upperBound = Infinity;
        }else if (decisionExport.isUpperBoundMinusInfinity){
          upperBound = -Infinity;
        }

        range = new Ego.Range(lowerBound, upperBound);
        if (decisionExport.range.isLowerBoundInclusive){
          range.makeLowerBoundInclusive();
        }else{
          range.makeLowerBoundExclusive();
        }
        if (decisionExport.range.isUpperBoundInclusive){
          range.makeUpperBoundInclusive();
        }else{
          range.makeUpperBoundExclusive();
        }
      }
      this.createDecision(decisionName, decisionExport.knowledgeName, decisionExport.informationName, decisionExport.method, range, sceneName);
    }
  }

  for (var sceneName in decisionTreesBySceneName){
    this.decisionTreesBySceneName[sceneName] = {};
    for (var decisionTreeName in decisionTreesBySceneName[sceneName]){
      var curDecisionTreeExport = decisionTreesBySceneName[sceneName][decisionTreeName];
      var decisionTree = new PreconfiguredDecisionTree().import(curDecisionTreeExport);
      this.decisionTreesBySceneName[sceneName][decisionTreeName] = decisionTree;
    }
  }

  for (var sceneName in statesBySceneName){
    this.statesBySceneName[sceneName] = {};
    for (var stateName in statesBySceneName[sceneName]){
      this.createState(stateName, sceneName);
    }
  }

  for (var sceneName in transitionsBySceneName){
    this.transitionsBySceneName[sceneName] = {};
    for (var transitionName in transitionsBySceneName[sceneName]){
      var exportObj = transitionsBySceneName[sceneName][transitionName];
      this.createTransition(transitionName, exportObj.sourceStateName, exportObj.targetStateName, exportObj.decisionName, sceneName);
    }
  }

  for (var sceneName in stateMachinesBySceneName){
    this.stateMachinesBySceneName[sceneName] = {};
    for (var stateMachineName in stateMachinesBySceneName[sceneName]){
      var exportObj = stateMachinesBySceneName[sceneName][stateMachineName];
      this.createStateMachine(stateMachineName, exportObj.knowledgeName, exportObj.entryStateName, sceneName);
      this.stateMachinesBySceneName[sceneName][stateMachineName].transitions = JSON.parse(JSON.stringify(exportObj.transitions));
      this.stateMachinesBySceneName[sceneName][stateMachineName].states = JSON.parse(JSON.stringify(exportObj.states));
    }
  }

  this.stateParentsBySceneName = JSON.parse(JSON.stringify(stateParentsBySceneName));
  this.clonedDecisionTreesBySceneName = JSON.parse(JSON.stringify(clonedDecisionTreesBySceneName));
  this.clonedStateMachinesBySceneName = JSON.parse(JSON.stringify(clonedStateMachinesBySceneName));
}

DecisionHandler.prototype.export = function(){
  var exportObj = {
    knowledgesBySceneName: {},
    decisionsBySceneName: {},
    decisionTreesBySceneName: {},
    statesBySceneName: {},
    transitionsBySceneName: {},
    stateMachinesBySceneName: {},
    stateParentsBySceneName: JSON.parse(JSON.stringify(this.stateParentsBySceneName)),
    clonedDecisionTreesBySceneName: JSON.parse(JSON.stringify(this.clonedDecisionTreesBySceneName)),
    clonedStateMachinesBySceneName: JSON.parse(JSON.stringify(this.clonedStateMachinesBySceneName))
  };

  for (var sceneName in this.knowledgesBySceneName){
    exportObj.knowledgesBySceneName[sceneName] = {};
    for (var knowledgeName in this.knowledgesBySceneName[sceneName]){
      var curExport = {boolean: {}, numerical: {}, vector: {}};
      var knowledge = this.knowledgesBySceneName[sceneName][knowledgeName];

      for (var infoName in knowledge._booleanMap){
        curExport.boolean[infoName] = knowledge.getBooleanInformation(infoName);
      }

      for (var infoName in knowledge._numericalMap){
        curExport.numerical[infoName] = knowledge.getNumericalInformation(infoName);
      }

      for (var infoName in knowledge._vectorMap){
        curExport.vector[infoName] = knowledge.getVectorInformation(infoName);
      }

      exportObj.knowledgesBySceneName[sceneName][knowledgeName] = curExport;
    }
  }

  for (var sceneName in this.decisionsBySceneName){
    exportObj.decisionsBySceneName[sceneName] = {};
    for (var decisionName in this.decisionsBySceneName[sceneName]){
      var decision = this.decisionsBySceneName[sceneName][decisionName];
      var curExport = JSON.parse(JSON.stringify(decision));
      if (decision.range){
        if (decision.range.lowerBound == Infinity){
          curExport.isLowerBoundInfinity = true;
        }else if (decision.range.lowerBound == -Infinity){
          curExport.isLowerBoundMinusInfinity = true;
        }
        if (decision.range.upperBound == Infinity){
          curExport.isUpperBoundInfinity = true;
        }else if (decision.range.upperBound == -Infinity){
          curExport.isUpperBoundMinusInfinity = true;
        }
      }
      exportObj.decisionsBySceneName[sceneName][decisionName] = curExport;
    }
  }

  for (var sceneName in this.decisionTreesBySceneName){
    exportObj.decisionTreesBySceneName[sceneName] = {};
    for (var decisionTreeName in this.decisionTreesBySceneName[sceneName]){
      exportObj.decisionTreesBySceneName[sceneName][decisionTreeName] = this.decisionTreesBySceneName[sceneName][decisionTreeName].export();
    }
  }

  for (var sceneName in this.statesBySceneName){
    exportObj.statesBySceneName[sceneName] = {};
    for (var stateName in this.statesBySceneName[sceneName]){
      exportObj.statesBySceneName[sceneName][stateName] = {};
    }
  }

  for (var sceneName in this.transitionsBySceneName){
    exportObj.transitionsBySceneName[sceneName] = {};
    for (var transitionName in this.transitionsBySceneName[sceneName]){
      exportObj.transitionsBySceneName[sceneName][transitionName] = this.transitionsBySceneName[sceneName][transitionName].export();
    }
  }

  for (var sceneName in this.stateMachinesBySceneName){
    exportObj.stateMachinesBySceneName[sceneName] = {};
    for (var stateMachineName in this.stateMachinesBySceneName[sceneName]){
      exportObj.stateMachinesBySceneName[sceneName][stateMachineName] = this.stateMachinesBySceneName[sceneName][stateMachineName].export();
    }
  }

  return exportObj;
}

DecisionHandler.prototype.onStateEntry = function(stateMachine, stateName, callbackFunction){
  this.stateEntryCallbacks[stateMachine.registeredSceneName][stateMachine.getID()][stateName] = callbackFunction;
}

DecisionHandler.prototype.removeStateEntryListener = function(stateMachine, stateName){
  this.stateEntryCallbacks[stateMachine.registeredSceneName][stateMachine.getID()][stateName] = noop;
}

DecisionHandler.prototype.resetStateMachine = function(stateMachine){
  stateMachine.reset();
  stateMachine.isDirty = true;
}

DecisionHandler.prototype.addStateToStateMachine = function(stateMachineName, stateName){

  var stateParents = this.stateParentsBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (stateParents[stateName] && stateParents[stateName] != stateMachineName){
    return -1;
  }

  var result = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName].addState(stateName);

  if (result == true){
    stateParents[stateName] = stateMachineName;
    this.stateParentsBySceneName[sceneHandler.getActiveSceneName()] = stateParents;
  }

  return result;
}

DecisionHandler.prototype.removeStateFromStateMachine = function(stateMachineName, stateName){
  var result = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName].removeState(stateName);

  if (!result){
    return false;
  }

  delete this.stateParentsBySceneName[sceneHandler.getActiveSceneName()][stateName];
  return true;
}

DecisionHandler.prototype.removeTransitionFromStateMachine = function(stateMachineName, transitionName){
  var stateMachine = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName];
  stateMachine.removeTransition(transitionName);
}

DecisionHandler.prototype.addTransitionToStateMachine = function(stateMachineName, transitionName){
  var transition = this.transitionsBySceneName[sceneHandler.getActiveSceneName()][transitionName];
  var stateParents = this.stateParentsBySceneName[sceneHandler.getActiveSceneName()] || {};

  var sourceStateName = transition.sourceStateName;
  var targetStateName = transition.targetStateName;

  if (stateParents[sourceStateName] != stateMachineName){
    return -1;
  }

  var stateMachine = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName];
  for (var i = 0; i < stateMachine.transitions.length; i ++){
    var curTransitionName = stateMachine.transitions[i];
    var curTransition = this.transitionsBySceneName[sceneHandler.getActiveSceneName()][curTransitionName];
    if (curTransition.sourceStateName == sourceStateName && curTransition.targetStateName == targetStateName){
      return 0;
    }
  }

  stateMachine.addTransition(transition);
  return true;
}

DecisionHandler.prototype.getStateMachine = function(stateMachineName){

  var stateMachinesInScene = this.constructedStateMachines[sceneHandler.getActiveSceneName()];

  if (!stateMachinesInScene){
    return false;
  }

  return stateMachinesInScene[stateMachineName] || false;
}

DecisionHandler.prototype.destroyStateMachine = function(stateMachineName){
  var stateParentsInScene = this.stateParentsBySceneName[sceneHandler.getActiveSceneName()] || {};
  var stateMachinesInScene = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()];

  if (stateParentsInScene[stateMachineName]){
    var parentStateMachine = stateMachinesInScene[stateParentsInScene[stateMachineName]];
    if (parentStateMachine.entryStateName == stateMachineName){
      return false;
    }
  }

  delete stateMachinesInScene[stateMachineName];

  if (Object.keys(stateMachinesInScene).length == 0){
    delete this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()];
  }

  for (var stateName in stateParentsInScene){
    if (stateParentsInScene[stateName] == stateMachineName){
      delete stateParentsInScene[stateName];
    }
  }

  delete stateParentsInScene[stateMachineName];
  return true;
}

DecisionHandler.prototype.cloneStateMachine = function(cloneName, refName, knowledgeName){
  var stateMachinesInScene = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var clonedStateMachinesInScene = this.clonedStateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (stateMachinesInScene[cloneName] || clonedStateMachinesInScene[cloneName]){
    return false;
  }

  clonedStateMachinesInScene[cloneName] = {refName: refName, knowledgeName: knowledgeName};
  this.clonedStateMachinesBySceneName[sceneHandler.getActiveSceneName()] = clonedStateMachinesInScene;
  return true;
}

DecisionHandler.prototype.destroyClonedStateMachine = function(cloneName){
  delete this.clonedStateMachinesBySceneName[sceneHandler.getActiveSceneName()][cloneName];
}

DecisionHandler.prototype.createStateMachine = function(stateMachineName, knowledgeName, entryStateName, overrideSceneName){
  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var stateMachinesInScene = this.stateMachinesBySceneName[sceneName] || {};
  var clonedStateMachinesInScene = this.clonedStateMachinesBySceneName[sceneName] || {};

  var stateParents = this.stateParentsBySceneName[sceneName] || {};

  if (stateParents[entryStateName]){
    return -1;
  }

  if (stateMachinesInScene[stateMachineName] || clonedStateMachinesInScene[stateMachineName]){
    return -2;
  }

  var statesInScene = this.statesBySceneName[sceneName] || {};

  if (statesInScene[stateMachineName]){
    return -3;
  }

  var preconfiguredStateMachine = new PreconfiguredStateMachine(stateMachineName, knowledgeName, entryStateName, sceneName);
  stateMachinesInScene[stateMachineName] = preconfiguredStateMachine;

  this.stateMachinesBySceneName[sceneName] = stateMachinesInScene;

  stateParents[entryStateName] = stateMachineName;
  this.stateParentsBySceneName[sceneName] = stateParents;

  return true;
}

DecisionHandler.prototype.destroyTransition = function(transitionName){
  var transitionsInScene = this.transitionsBySceneName[sceneHandler.getActiveSceneName()];
  delete transitionsInScene[transitionName];

  if (Object.keys(transitionsInScene).length == 0){
    delete this.transitionsBySceneName[sceneHandler.getActiveSceneName()];
  }
}

DecisionHandler.prototype.createTransition = function(transitionName, sourceStateName, targetStateName, decisionName, overrideSceneName){
  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var transitionsInScene = this.transitionsBySceneName[sceneName] || {};

  if (transitionsInScene[transitionName]){
    return false;
  }

  var preconfiguredTransition = new PreconfiguredTransition(transitionName, sourceStateName, targetStateName, decisionName, sceneName);

  transitionsInScene[transitionName] = preconfiguredTransition;
  this.transitionsBySceneName[sceneName] = transitionsInScene;

  return true;
}

DecisionHandler.prototype.destroyState = function(stateName){

  var stateParentsInScene = this.stateParentsBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (stateParentsInScene[stateName]){
    var stateMachine = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateParentsInScene[stateName]];
    if (stateMachine.entryStateName == stateName){
      return false;
    }
  }

  var statesInScene = this.statesBySceneName[sceneHandler.getActiveSceneName()];
  delete statesInScene[stateName];

  if (Object.keys(statesInScene).length == 0){
    delete this.statesBySceneName[sceneHandler.getActiveSceneName()];
  }
  delete stateParentsInScene[stateName];
  return true;
}

DecisionHandler.prototype.createState = function(stateName, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var statesInScene = this.statesBySceneName[sceneName] || {};
  var stateMachinesInScene = this.stateMachinesBySceneName[sceneName] || {};

  if (statesInScene[stateName] || stateMachinesInScene[stateName]){
    return false;
  }

  var state = new Ego.State(stateName);

  statesInScene[stateName] = state;
  this.statesBySceneName[sceneName] = statesInScene;

  return true;
}

DecisionHandler.prototype.setRootDecisionOfDecisionTree = function(decisionTreeName, preconfiguredDecision){
  this.decisionTreesBySceneName[sceneHandler.getActiveSceneName()][decisionTreeName].setRootDecision(preconfiguredDecision);
}

DecisionHandler.prototype.destroyDecisionTree = function(decisionTreeName){
  var decisionTreesInScene = this.decisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (decisionTreesInScene[decisionTreeName]){
    delete decisionTreesInScene[decisionTreeName];
    return true;
  }

  return false;
}

DecisionHandler.prototype.cloneDecisionTree = function(cloneName, refName, knowledgeName){
  var decisionTreesInScene = this.decisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var clonedDecisionTreesInScene = this.clonedDecisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (decisionTreesInScene[cloneName] || clonedDecisionTreesInScene[cloneName]){
    return false;
  }

  clonedDecisionTreesInScene[cloneName] = {refName: refName, knowledgeName: knowledgeName};

  this.clonedDecisionTreesBySceneName[sceneHandler.getActiveSceneName()] = clonedDecisionTreesInScene;
  return true;
}

DecisionHandler.prototype.destroyClonedDecisionTree = function(cloneName){
  delete this.clonedDecisionTreesBySceneName[sceneHandler.getActiveSceneName()][cloneName];
}

DecisionHandler.prototype.createDecisionTree = function(decisionTreeName, knowledgeName, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var decisionTreesInScene = this.decisionTreesBySceneName[sceneName] || {};
  var clonedDecisionTreesInScene = this.clonedDecisionTreesBySceneName[sceneName] || {};

  if (decisionTreesInScene[decisionTreeName] || clonedDecisionTreesInScene[decisionTreeName]){
    return false;
  }

  var preconfiguredDecisionTree = new PreconfiguredDecisionTree(decisionTreeName, knowledgeName, sceneName);

  decisionTreesInScene[decisionTreeName] = preconfiguredDecisionTree;
  this.decisionTreesBySceneName[sceneName] = decisionTreesInScene;

  return true;
}

DecisionHandler.prototype.getDecisionTree = function(decisionTreeName){

  var decisionTreesInScene = this.constructedDecisionTrees[sceneHandler.getActiveSceneName()];

  if (!decisionTreesInScene){
    return false;
  }

  return decisionTreesInScene[decisionTreeName] || false;
}

DecisionHandler.prototype.destroyDecision = function(decisionName){
  var decisionsInScene = this.decisionsBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (decisionsInScene[decisionName]){
    delete decisionsInScene[decisionName];
    return true;
  }

  return false;
}

DecisionHandler.prototype.createDecision = function(decisionName, knowledgeName, informationName, method, range, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var decisionsInScene = this.decisionsBySceneName[sceneName] || {};

  if (decisionsInScene[decisionName]){
    return false;
  }

  var knowledge = this.knowledgesBySceneName[sceneName];
  var information = this.getInformationFromKnowledge(knowledgeName, informationName, overrideSceneName);

  var informationType;
  if (information.type == this.informationTypes.BOOLEAN){
    informationType = Ego.InformationTypes.TYPE_BOOLEAN;
  }else if (information.type == this.informationTypes.NUMERICAL){
    informationType = Ego.InformationTypes.TYPE_NUMERICAL;
  }else if (information.type == this.informationTypes.VECTOR){
    informationType = Ego.InformationTypes.TYPE_VECTOR;
  }

  var decisionObj = {
    name: decisionName,
    knowledgeName: knowledgeName,
    informationName: informationName,
    informationType: informationType,
    method: method
  };

  decisionsInScene[decisionName] = decisionObj;

  if (range){
    decisionObj.range = {
      lowerBound: range._lowerBound,
      upperBound: range._upperBound,
      isLowerBoundInclusive: range._isLowerBoundInclusive,
      isUpperBoundInclusive: range._isUpperBoundInclusive
    };
  }

  this.decisionsBySceneName[sceneName] = decisionsInScene;

  return true;
}

DecisionHandler.prototype.addInformationToKnowledge = function(knowledgeName, informationName, informationType, initialValue, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var knowledgesInScene = this.knowledgesBySceneName[sceneName] || {};
  var knowledge = knowledgesInScene[knowledgeName];

  if (!knowledge){
    return false;
  }

  if (this.informationTypesByKnowledgeName[knowledgeName][informationName]){
    return false;
  }

  var returnVal = false;

  switch(informationType){
    case this.informationTypes.BOOLEAN: returnVal = knowledge.addBooleanInformation(informationName, initialValue); break;
    case this.informationTypes.NUMERICAL: returnVal = knowledge.addNumericalInformation(informationName, initialValue); break;
    case this.informationTypes.VECTOR: returnVal = knowledge.addVectorInformation(informationName, initialValue.x, initialValue.y, initialValue.z); break;
  }

  if (returnVal){
    this.informationTypesByKnowledgeName[knowledgeName][informationName] = informationType;
  }

  return returnVal;
}

DecisionHandler.prototype.removeInformationFromKnowledge = function(knowledgeName, informationName){

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var knowledge = knowledgesInScene[knowledgeName];

  if (!knowledge){
    return false;
  }

  var informationType = this.informationTypesByKnowledgeName[knowledgeName][informationName];

  if (!informationType){
    return false;
  }

  delete this.informationTypesByKnowledgeName[knowledgeName][informationName];

  switch(informationType){
    case this.informationTypes.BOOLEAN: return knowledge.deleteBooleanInformation(informationName);
    case this.informationTypes.NUMERICAL: return knowledge.deleteNumericalInformation(informationName);
    case this.informationTypes.VECTOR: return knowledge.deleteVectorInformation(informationName);
  }

  return false;
}

DecisionHandler.prototype.getAllInformationsOfKnowledge = function(knowledgeName){
  var knowledge = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()][knowledgeName];

  var ary = [];

  for (var infName in knowledge._booleanMap){
    ary.push(this.getInformationFromKnowledge(knowledgeName, infName));
  }

  for (var infName in knowledge._numericalMap){
    ary.push(this.getInformationFromKnowledge(knowledgeName, infName));
  }

  for (var infName in knowledge._vectorMap){
    ary.push(this.getInformationFromKnowledge(knowledgeName, infName));
  }

  return ary;
}

DecisionHandler.prototype.getInformationFromKnowledge = function(knowledgeName, informationName, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var knowledge = this.knowledgesBySceneName[sceneName][knowledgeName];

  var booleanVal = knowledge.getBooleanInformation(informationName);
  var numericalVal = knowledge.getNumericalInformation(informationName);
  var vectorVal = knowledge.getVectorInformation(informationName);

  if (booleanVal != null){
    return {name: informationName, type: this.informationTypes.BOOLEAN, value: booleanVal};
  }else if (numericalVal != null){
    return {name: informationName, type: this.informationTypes.NUMERICAL, value: numericalVal};
  }else if (vectorVal != null){
    return {name: informationName, type: this.informationTypes.VECTOR, value: vectorVal};
  }

}

DecisionHandler.prototype.updateInformation = function(knowledge, informationName, newValue){
  var informationType = this.informationTypesByKnowledgeName[knowledge.roygbivName][informationName];

  if (informationType == decisionHandler.informationTypes.BOOLEAN){
    knowledge.updateBooleanInformation(informationName, newValue);
  }else if (informationType == decisionHandler.informationTypes.NUMERICAL){
    knowledge.updateNumericalInformation(informationName, newValue);
  }else{
    knowledge.updateVectorInformation(informationName, newValue.x, newValue.y, newValue.z);
  }

  knowledge.isDirty = true;
}

DecisionHandler.prototype.cloneKnowledge = function(cloneName, refName){
  if (this.informationTypesByKnowledgeName[cloneName]){
    return false;
  }

  var knowledge = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()][refName];
  var clone = knowledge.clone();

  this.knowledgesBySceneName[sceneHandler.getActiveSceneName()][cloneName] = clone;
  this.informationTypesByKnowledgeName[cloneName] = JSON.parse(JSON.stringify(this.informationTypesByKnowledgeName[refName]));

  clone.roygbivName = cloneName;
  clone.registeredSceneName = sceneHandler.getActiveSceneName();
  return true;
}

DecisionHandler.prototype.createKnowledge = function(knowledgeName, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var knowledgesInScene = this.knowledgesBySceneName[sceneName] || {};

  if (knowledgesInScene[knowledgeName]){
    return false;
  }

  if (this.informationTypesByKnowledgeName[knowledgeName]){
    return false;
  }

  knowledgesInScene[knowledgeName] = new Ego.Knowledge();
  this.knowledgesBySceneName[sceneName] = knowledgesInScene;
  this.informationTypesByKnowledgeName[knowledgeName] = {};

  knowledgesInScene[knowledgeName].roygbivName = knowledgeName;
  knowledgesInScene[knowledgeName].registeredSceneName = sceneName;

  return true;
}

DecisionHandler.prototype.destroyKnowledge = function(knowledgeName){

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (!knowledgesInScene[knowledgeName]){
    return false;
  }

  delete knowledgesInScene[knowledgeName];
  delete this.informationTypesByKnowledgeName[knowledgeName];

  return true;
}

DecisionHandler.prototype.getKnowledge = function(knowledgeName){
  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()];

  if (!knowledgesInScene){
    return false;
  }

  return knowledgesInScene[knowledgeName] || false;
}

DecisionHandler.prototype.issueStateMachineUpdate = function(stateMachine){
  var knowledge = stateMachine._knowledge;

  if (!knowledge.isDirty && !stateMachine.isDirty){
    return;
  }

  stateMachine.update();
  stateMachine.isDirty = false;
}

DecisionHandler.prototype.tick = function(){
  var activeSceneName = sceneHandler.getActiveSceneName();

  var decisionTreesInScene = this.constructedDecisionTrees[activeSceneName];

  if (decisionTreesInScene){
    for (var dtName in decisionTreesInScene){
      var decisionTree = decisionTreesInScene[dtName];
      var knowledgeName = decisionTree.knowledgeName;
      var knowledge = this.knowledgesBySceneName[activeSceneName][knowledgeName];

      if (!knowledge.isDirty){
        break;
      }

      var result = decisionTree.makeDecision(knowledge);
      decisionTree.resultCache = result;
    }
  }

  this.activeStateMachineMap.forEach(this.issueStateMachineUpdate);

  var knowledgesInScene = this.knowledgesBySceneName[activeSceneName];

  if (knowledgesInScene){
    for (var knowledgeName in knowledgesInScene){
      knowledgesInScene[knowledgeName].isDirty = false;
    }
  }
}

DecisionHandler.prototype.getChildStateMachine = function(stateMachine, childName){
  for (var stateID in stateMachine._statesByID){
    var state = stateMachine._statesByID[stateID];
    if (state instanceof Ego.StateMachine && state.getName() == childName){
      return state;
    }
  }
  return null;
}

DecisionHandler.prototype.prepareClonedSMChildren = function(stateMachine, sceneName){
  for (var stateID in stateMachine._statesByID){
    var state = stateMachine._statesByID[stateID];
    if (state instanceof Ego.StateMachine){
      state.registeredSceneName = sceneName;
      state.isDirty = false;
      this.stateEntryCallbacks[sceneName][state.getID()] = {};
      state.onStateChanged(function(newState){
        var callback = decisionHandler.stateEntryCallbacks[this.registeredSceneName][this.getID()][newState.getName()];
        if (callback){
          callback();
        }
      });

      this.prepareClonedSMChildren(state, sceneName);
    }
  }
}
