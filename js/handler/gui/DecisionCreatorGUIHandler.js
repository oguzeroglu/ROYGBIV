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

      if (decisionName.split(" ").length > 1){
        terminal.printError(Text.DECISION_NAME_SHOULD_NOT_CONTAIN_SPACES);
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

  var decisionsInScene = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()] || {};
  for (var decisionName in decisionsInScene){
    this.createDecisionFolder(decisionName);
  }
}

DecisionCreatorGUIHandler.prototype.generateRangeText = function(range){
  var text = range._isLowerBoundInclusive? "[": "]";
  text += range._lowerBound + "," + range._upperBound;
  text += range._isUpperBoundInclusive? "]": "[";
  return text;
}

DecisionCreatorGUIHandler.prototype.parseRange = function(rangeText){
  var firstChar = rangeText.charAt(0);
  var lastChar = rangeText.charAt(rangeText.length - 1);

  var isLowerBoundInclusive = false;
  var isUpperBoundInclusive = false;
  var lowerBound = null;
  var upperBound = null;

  if (firstChar == "["){
    isLowerBoundInclusive = true;
  }else if (firstChar != "]"){
    return false;
  }

  if (lastChar == "]"){
    isUpperBoundInclusive = true;
  }else if (lastChar != "["){
    return false;
  }

  rangeText = rangeText.substring(1, rangeText.length - 1);

  var splitted = rangeText.split(",");

  if (splitted.length != 2){
    return false;
  }

  var lowerBound = parseFloat(splitted[0]);
  var upperBound = parseFloat(splitted[1]);

  if (isNaN(lowerBound) || isNaN(upperBound)){
    return false;
  }

  var range = new Ego.Range(lowerBound, upperBound);
  if (isLowerBoundInclusive){
    range.makeLowerBoundInclusive();
  }else{
    range.makeLowerBoundExclusive();
  }

  if (isUpperBoundInclusive){
    range.makeUpperBoundInclusive();
  }else{
    range.makeUpperBoundExclusive();
  }

  return range;
}

DecisionCreatorGUIHandler.prototype.createDecisionFolder = function(decisionName){
  var decision = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()][decisionName];
  var decisionFolder = guiHandler.datGuiDecisionCreation.addFolder(decisionName);

  var allInformations = decisionHandler.getAllInformationsOfKnowledge(decision.knowledgeName);
  var allInformationNames = [];
  for (var i = 0 ; i < allInformations.length; i ++){
    allInformationNames.push(allInformations[i].name);
  }

  var rangeText = "";
  if (decision.range){
    var range = new Ego.Range(decision.range.lowerBound, decision.range.upperBound);
    if (decision.range.isUpperBoundInclusive){
      range.makeUpperBoundInclusive();
    }else{
      range.makeUpperBoundExclusive();
    }
    if(decision.range.isLowerBoundInclusive){
      range.makeLowerBoundInclusive();
    }else{
      range.makeLowerBoundExclusive();
    }

    rangeText = this.generateRangeText(range);
  }

  var params = {
    "Information": decision.informationName,
    "Decision method": decision.method,
    "Range": rangeText,
    "Destroy": function(){
      terminal.clear();

      var decisionTreesInScene = decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var dtName in decisionTreesInScene){
        if (decisionTreesInScene[dtName].isDecisionUsed(decisionName)){
          terminal.printError(Text.DECISION_USED_IN_DECISION_TREE.replace(Text.PARAM1, dtName));
          return;
        }
      }

      var transitionsInScene = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var transitionName in transitionsInScene){
        if (transitionsInScene[transitionName].decisionName == decisionName){
          terminal.printError(Text.DECISION_USED_IN_TRANSITION.replace(Text.PARAM1, transitionName));
          return;
        }
      }

      decisionHandler.destroyDecision(decisionName);
      guiHandler.datGuiDecisionCreation.removeFolder(decisionFolder);
      terminal.printInfo(Text.DECISION_DESTROYED);
    }
  };

  var rangeController;

  decisionFolder.add(params, "Information", allInformationNames).onChange(function(val){
    terminal.clear();
    decisionHandler.destroyDecision(decisionName);
    decisionHandler.createDecision(decisionName, decision.knowledgeName, val, decision.method, decision.range || null);
    decision = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()][decisionName];
    terminal.printInfo(Text.DECISION_UPDATED);
  });
  decisionFolder.add(params, "Decision method", Object.keys(decisionHandler.decisionMethods)).onChange(function(val){
    terminal.clear();
    decisionHandler.destroyDecision(decisionName);

    var range = null
    if (val == decisionHandler.decisionMethods.IS_IN_RANGE){
      guiHandler.enableController(rangeController);
      range = new Ego.Range(0, 100);
      params["Range"] = decisionCreatorGUIHandler.generateRangeText(range);
    }else{
      guiHandler.disableController(rangeController);
    }

    decisionHandler.createDecision(decisionName, decision.knowledgeName, decision.informationName, val, range);
    decision = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()][decisionName];
    terminal.printInfo(Text.DECISION_UPDATED);
  });
  rangeController = decisionFolder.add(params, "Range").onFinishChange(function(val){

    terminal.clear();

    var range = decisionCreatorGUIHandler.parseRange(val);

    if (!range){
      terminal.printError(Text.INVALID_RANGE);
      return;
    }

    decisionHandler.destroyDecision(decisionName);
    decisionHandler.createDecision(decisionName, decision.knowledgeName, decision.informationName, decision.method, range);
    decision = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()][decisionName];
    terminal.printInfo(Text.DECISION_UPDATED);
  }).listen();

  decisionFolder.add(params, "Destroy");

  if (!decision.range){
    guiHandler.disableController(rangeController);
  }
}
