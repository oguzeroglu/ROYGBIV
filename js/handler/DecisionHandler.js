var DecisionHandler = function(){

  this.informationTypes = {
    "BOOLEAN": "BOOLEAN",
    "NUMERICAL": "NUMERICAL",
    "VECTOR": "VECTOR"
  };

  this.reset();
}

DecisionHandler.prototype.reset = function(){
  this.knowledgesBySceneName = {};
  this.informationTypesByKnowledgeName = {};
}

DecisionHandler.prototype.import = function(exportObj){
  var knowledgesBySceneName = exportObj.knowledgesBySceneName;

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
}

DecisionHandler.prototype.export = function(){
  var exportObj = {
    knowledgesBySceneName: {}
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

  return exportObj;
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

DecisionHandler.prototype.getInformationFromKnowledge = function(knowledgeName, informationName){
  var knowledge = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()][knowledgeName];

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
