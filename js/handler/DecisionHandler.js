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

  switch(informationType){
    case this.informationTypes.BOOLEAN: return knowledge.addBooleanInformation(informationName, initialValue);
    case this.informationTypes.NUMERICAL: return knowledge.addNumericalInformation(informationName, initialValue);
    case this.informationTypes.VECTOR: return knowledge.addVectorInformation(informationName, initialValue.x, initialValue.y, initialValue.z);
    case this.informationTypes.CAN_SEE: return knowledge.addBooleanInformation(informationName, false);
    case this.informationTypes.DISTANCE_TO: return knowledge.addNumericalInformation(informationName, 0);
  }

  return false;
}

DecisionHandler.prototype.removeInformationFromKnowledge = function(knowledgeName, informationName, informationType){

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var knowledge = knowledgesInScene[knowledgeName];

  if (!knowledge){
    return false;
  }

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

  knowledgesInScene[knowledgeName] = new Ego.Knowledge();
  this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] = knowledgesInScene;

  return true;
}

DecisionHandler.prototype.destroyKnowledge = function(knowledgeName){

  var knowledgesInScene = this.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};

  if (!knowledgesInScene[knowledgeName]){
    return false;
  }

  delete knowledgesInScene[knowledgeName];

  return true;
}
