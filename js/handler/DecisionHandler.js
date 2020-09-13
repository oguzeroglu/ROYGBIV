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
}

DecisionHandler.prototype.onSwitchFromDesignToPreview = function(){
  this.constructedDecisionTrees = {};

  for (var sceneName in this.decisionTreesBySceneName){
    this.constructedDecisionTrees[sceneName] = {};
    var decisionTreesInScene = this.decisionTreesBySceneName[sceneName];
    for (var dtName in decisionTreesInScene){
      this.constructedDecisionTrees[sceneName][dtName] = decisionTreesInScene[dtName].get();
    }
  }
}

DecisionHandler.prototype.onSwitchFromPreviewToDesign = function(){
  delete this.constructedDecisionTrees;
}

DecisionHandler.prototype.import = function(exportObj){
  var knowledgesBySceneName = exportObj.knowledgesBySceneName;
  var decisionsBySceneName = exportObj.decisionsBySceneName;
  var decisionTreesBySceneName = exportObj.decisionTreesBySceneName;

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
}

DecisionHandler.prototype.export = function(){
  var exportObj = {
    knowledgesBySceneName: {},
    decisionsBySceneName: {},
    decisionTreesBySceneName: {}
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

  return exportObj;
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
