var DecisionCreatorGUIHandler = function(){

}

DecisionCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_DECISION);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiDecisionCreation = new dat.GUI({hideable: false});

  var knowledgesInScene = decisionHandler.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var knowledgeNames = Object.keys(knowledgesInScene);

  var creationParams = {
    "Knowledge": knowledgeNames[0] || "",
    "Decision name": "",
    "Create": function(){
      terminal.clear();

      var knowledgeName = this["Knowledge"];
      if (!knowledgeName){
        terminal.printError(Text.KNOWLEDGE_IS_REQUIRED_TO_CREATE_A_DECISION);
        return;
      }

      var decisionName = this["Decision name"];
      if (!decisionName){
        terminal.printError(Text.DECISION_NAME_CANNOT_BE_EMPTY);
        return;
      }

      var allInformations = decisionHandler.getAllInformationsOfKnowledge(knowledgeName);
      if (allInformations.length == 0){
        terminal.printError(Text.KNOWLEDGE_HAS_NO_INFORMATION);
        return;
      }

      if (!decisionHandler.createDecision(decisionName, knowledgeName, allInformations[0].name, decisionHandler.decisionMethods.IS_TRUE, null, null)){
        terminal.printError(Text.DECISION_NAME_MUST_BE_UNIQUE);
        return;
      }

      decisionCreatorGUIHandler.createDecisionFolder(decisionName);
      terminal.printInfo(Text.DECISION_CREATED);
    },
    "Done": function(){
      terminal.clear();
      terminal.enable();
      guiHandler.hide(guiHandler.guiTypes.DECISION_CREATION);
      terminal.printInfo(Text.GUI_CLOSED);
    }
  };

  guiHandler.datGuiDecisionCreation.add(creationParams, "Knowledge", knowledgeNames);
  guiHandler.datGuiDecisionCreation.add(creationParams, "Decision name");
  guiHandler.datGuiDecisionCreation.add(creationParams, "Create");
  guiHandler.datGuiDecisionCreation.add(creationParams, "Done");
}

DecisionCreatorGUIHandler.prototype.generateRangeText = function(range){
  return "";
}

DecisionCreatorGUIHandler.prototype.createDecisionFolder = function(decisionName){
  var decision = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()][decisionName];
  var decisionFolder = guiHandler.datGuiDecisionCreation.addFolder(decisionName);

  var allInformations = decisionHandler.getAllInformationsOfKnowledge(decision.knowledgeName);
  var allInformationNames = [];
  for (var i = 0 ; i < allInformations.length; i ++){
    allInformationNames.push(allInformations[i].name);
  }

  var params = {
    "Information": decision.informationName,
    "Decision method": decision.method,
    "Range": decision.range? this.generateRangeText(decision.range): "",
    "Destroy": function(){
      terminal.clear();
      decisionHandler.destroyDecision(decisionName);
      guiHandler.datGuiDecisionCreation.removeFolder(decisionFolder);
      terminal.printInfo(Text.DECISION_DESTROYED);
    }
  };

  var rangeController;

  decisionFolder.add(params, "Information", allInformationNames).onChange(function(val){

  });
  decisionFolder.add(params, "Decision method", Object.keys(decisionHandler.decisionMethods)).onChange(function(val){

  });
  rangeController = decisionFolder.add(params, "Range").onFinishChange(function(val){

  });

  decisionFolder.add(params, "Destroy");

  if (!decision.range){
    guiHandler.disableController(rangeController);
  }
}
