var DecisionHandler = function(){

  this.informationTypes = {
    "BOOLEAN": "BOOLEAN",
    "NUMERICAL": "NUMERICAL",
    "VECTOR": "VECTOR",
    "CAN_SEE": "CAN_SEE",
    "DISTANCE_TO": "DISTANCE_TO"
  };

  this.knowledgesBySceneName = {};
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
