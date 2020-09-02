var DecisionHandler = function(){

  this.informationTypes = {
    "BOOLEAN": "BOOLEAN",
    "NUMERICAL": "NUMERICAL",
    "VECTOR": "VECTOR",
    "CAN_SEE": "CAN_SEE",
    "DISTANCE_TO": "DISTANCE_TO"
  };

  this.reset();
}

DecisionHandler.prototype.reset = function(){
  this.knowledgesBySceneName = {};
  this.informationTypesByKnowledgeName = {};
}

DecisionHandler.prototype.import = function(exportObj){

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

DecisionHandler.prototype.addInformationToKnowledge = function(knowledgeName, informationName, informationType, initialValue){

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
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
    case this.informationTypes.CAN_SEE: returnVal = knowledge.addBooleanInformation(informationName, false); break;
    case this.informationTypes.DISTANCE_TO: returnVal = knowledge.addNumericalInformation(informationName, 0); break;
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
    case this.informationTypes.CAN_SEE: return knowledge.deleteBooleanInformation(informationName);
    case this.informationTypes.DISTANCE_TO: return knowledge.deleteNumericalInformation(informationName);
  }

  return false;
}

DecisionHandler.prototype.createKnowledge = function(knowledgeName){

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (knowledgesInScene[knowledgeName]){
    return false;
  }

  if (this.informationTypesByKnowledgeName[knowledgeName]){
    return false;
  }

  knowledgesInScene[knowledgeName] = new Ego.Knowledge();
  this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] = knowledgesInScene;
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
