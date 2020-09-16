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
}

DecisionHandler.prototype.onSwitchFromDesignToPreview = function(){
  this.constructedDecisionTrees = {};
  this.initialKnowledgeData = {};

  for (var sceneName in this.decisionTreesBySceneName){
    this.constructedDecisionTrees[sceneName] = {};
    var decisionTreesInScene = this.decisionTreesBySceneName[sceneName];
    for (var dtName in decisionTreesInScene){
      this.constructedDecisionTrees[sceneName][dtName] = decisionTreesInScene[dtName].get();
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
}

DecisionHandler.prototype.onSwitchFromPreviewToDesign = function(){
  delete this.constructedDecisionTrees;

  for (var sceneName in this.knowledgesBySceneName){
    var knowledgesInScene = this.knowledgesBySceneName[sceneName];
    for (var knowledgeName in knowledgesInScene){
      var knowledge = knowledgesInScene[knowledgeName];
      var initialData = this.initialKnowledgeData[sceneName][knowledgeName];
      knowledge._booleanMap = JSON.parse(JSON.stringify(initialData.boolean));
      knowledge._numericalMap = JSON.parse(JSON.stringify(initialData.numerical));
      knowledge._vectorMap = JSON.parse(JSON.stringify(initialData.vector));

      delete knowledge.isDirty;
    }
  }

  delete this.initialKnowledgeData;
}

DecisionHandler.prototype.import = function(exportObj){
  var knowledgesBySceneName = exportObj.knowledgesBySceneName;
  var decisionsBySceneName = exportObj.decisionsBySceneName;
  var decisionTreesBySceneName = exportObj.decisionTreesBySceneName;
  var statesBySceneName = exportObj.statesBySceneName;
  var transitionsBySceneName = exportObj.transitionsBySceneName;
  var stateMachinesBySceneName = exportObj.stateMachinesBySceneName;

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
    }
  }
}

DecisionHandler.prototype.export = function(){
  var exportObj = {
    knowledgesBySceneName: {},
    decisionsBySceneName: {},
    decisionTreesBySceneName: {},
    statesBySceneName: {},
    transitionsBySceneName: {},
    stateMachinesBySceneName: {}
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

DecisionHandler.prototype.destroyStateMachine = function(stateMachineName){
  var stateMachinesInScene = this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()];
  delete stateMachinesInScene[stateMachineName];

  if (Object.keys(stateMachinesInScene).length == 0){
    delete this.stateMachinesBySceneName[sceneHandler.getActiveSceneName()];
  }
}

DecisionHandler.prototype.createStateMachine = function(stateMachineName, knowledgeName, entryStateName, overrideSceneName){
  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var stateMachinesInScene = this.stateMachinesBySceneName[sceneName] || {};

  if (stateMachinesInScene[stateMachineName]){
    return false;
  }

  var statesInScene = this.statesBySceneName[sceneName] || {};

  if (statesInScene[stateMachineName]){
    return false;
  }

  var preconfiguredStateMachine = new PreconfiguredStateMachine(stateMachineName, knowledgeName, entryStateName, sceneName);
  stateMachinesInScene[stateMachineName] = preconfiguredStateMachine;

  this.stateMachinesBySceneName[sceneName] = stateMachinesInScene;

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
  var statesInScene = this.statesBySceneName[sceneHandler.getActiveSceneName()];
  delete statesInScene[stateName];

  if (Object.keys(statesInScene).length == 0){
    delete this.statesBySceneName[sceneHandler.getActiveSceneName()];
  }
}

DecisionHandler.prototype.createState = function(stateName, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var statesInScene = this.statesBySceneName[sceneName] || {};

  if (statesInScene[stateName]){
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

DecisionHandler.prototype.createDecisionTree = function(decisionTreeName, knowledgeName, overrideSceneName){

  var sceneName = overrideSceneName || sceneHandler.getActiveSceneName();

  var decisionTreesInScene = this.decisionTreesBySceneName[sceneName] || {};

  if (decisionTreesInScene[decisionTreeName]){
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

DecisionHandler.prototype.makeDecisions = function(){
  var decisionTreesInScene = this.constructedDecisionTrees[sceneHandler.getActiveSceneName()];

  if (!decisionTreesInScene){
    return;
  }

  for (var dtName in decisionTreesInScene){
    var decisionTree = decisionTreesInScene[dtName];
    var knowledgeName = decisionTree.roygbivDecisionTree.knowledgeName;
    var knowledge = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()][knowledgeName];

    if (!knowledge.isDirty){
      break;
    }

    var result = decisionTree.makeDecision(knowledge);
    decisionTree.resultCache = result;
  }

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()];

  if (!knowledgesInScene){
    return;
  }

  for (var knowledgeName in knowledgesInScene){
    knowledgesInScene[knowledgeName].isDirty = false;
  }
}
