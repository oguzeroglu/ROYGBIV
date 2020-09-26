var TransitionCreatorGUIHandler = function(){

}

TransitionCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_TRANSITION);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiTransitionCreation = new dat.GUI({hideable: false});

  var statesInScene = decisionHandler.statesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var decisionInScene = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()] || {};

  var stateNames = Object.keys(statesInScene);
  var stateMachineNames = Object.keys(stateMachinesInScene);
  var decisionNames = Object.keys(decisionInScene);

  for (var i = 0; i < stateMachineNames.length; i ++){
    stateNames.push(stateMachineNames[i]);
  }

  var params = {
    "Transition name": "",
    "Source state": stateNames[0] || "",
    "Target state": stateNames[0] || "",
    "Decision": decisionNames[0] || "",
    "Create": function(){
      terminal.clear();

      var transitionName = this["Transition name"];
      var sourceStateName = this["Source state"];
      var targetStateName = this["Target state"];
      var decisionName = this["Decision"];

      if (!transitionName){
        terminal.printError(Text.TRANSITION_NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!sourceStateName){
        terminal.printError(Text.SOURCE_STATE_NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!targetStateName){
        terminal.printError(Text.TARGET_STATE_NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (sourceStateName == targetStateName){
        terminal.printError(Text.SOURCE_STATE_AND_TARGET_STATE_CANNOT_BE_THE_SAME);
        return;
      }

      if (!decisionName){
        terminal.printError(Text.DECISION_NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!decisionHandler.createTransition(transitionName, sourceStateName, targetStateName, decisionName)){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      transitionCreatorGUIHandler.addTransitionFolder(transitionName);
      terminal.printInfo(Text.TRANSITION_CREATED);
    },
    "Done": function(){
      terminal.clear();
      terminal.enable();
      guiHandler.hide(guiHandler.guiTypes.TRANSITION_CREATION);
      terminal.printInfo(Text.GUI_CLOSED);
    }
  };

  guiHandler.datGuiTransitionCreation.add(params, "Transition name");
  guiHandler.datGuiTransitionCreation.add(params, "Source state", stateNames);
  guiHandler.datGuiTransitionCreation.add(params, "Target state", stateNames);
  guiHandler.datGuiTransitionCreation.add(params, "Decision", decisionNames);
  guiHandler.datGuiTransitionCreation.add(params, "Create");
  guiHandler.datGuiTransitionCreation.add(params, "Done");

  var transitionsInScene = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()] || {};
  for (var transitionName in transitionsInScene){
    this.addTransitionFolder(transitionName);
  }
}

TransitionCreatorGUIHandler.prototype.addTransitionFolder = function(transitionName){
  var preconfiguredTransition = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()][transitionName];
  var folderText = transitionName + " [" + preconfiguredTransition.sourceStateName + " --" + preconfiguredTransition.decisionName + "--> " + preconfiguredTransition.targetStateName + "]";
  var transitionFolder = guiHandler.datGuiTransitionCreation.addFolder(folderText);

  transitionFolder.add({
    "Destroy": function(){
      terminal.clear();

      var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var smName in stateMachinesInScene){
        if (stateMachinesInScene[smName].hasTransition(transitionName)){
          terminal.printError(Text.TRANSITION_USED_IN_STATE_MACHINE_CANNOT_DESTROY.replace(Text.PARAM1, smName));
          return;
        }
      }

      decisionHandler.destroyTransition(transitionName);
      guiHandler.datGuiTransitionCreation.removeFolder(transitionFolder);
      terminal.printInfo(Text.TRANSITION_DESTROYED);
    }
  }, "Destroy");
}
