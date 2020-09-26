var StateMachineCreatorGUIHandler = function(){

}

StateMachineCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_STATE_MACHINE);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  this.createMermaidContainer();

  this.paramsByStateMachineName = {};
  this.statesFoldersByStateMachineName = {};

  guiHandler.datGuiStateMachineCreation = new dat.GUI({hideable: false});

  var knowledgesInScene = decisionHandler.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var knowledgeNames = Object.keys(knowledgesInScene);

  var statesInScene = decisionHandler.statesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};

  var stateNames = Object.keys(statesInScene);
  var stateMachineNames = Object.keys(stateMachinesInScene);
  for (var i = 0; i < stateMachineNames.length; i ++){
    stateNames.push(stateMachineNames[i]);
  }

  var entryStateController;
  var params;

  var onStateMachineDestroyed = function(stateMachineName){
    stateNames.splice(stateNames.indexOf(stateMachineName), 1);
    entryStateController.options(stateNames);
    entryStateController = guiHandler.datGuiStateMachineCreation.__controllers[4];
    params["Entry state"] = stateNames[0] || "";
    entryStateController.listen();
  };

  params = {
    "Name": "",
    "Knowledge": knowledgeNames[0] || "",
    "Entry state": stateNames[0] || "",
    "Create": function(){
      terminal.clear();

      var stateMachineName = this["Name"];
      var knowledgeName = this["Knowledge"];
      var entryStateName = this["Entry state"];

      if (!stateMachineName){
        terminal.printError(Text.STATE_MACHINE_NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!knowledgeName){
        terminal.printError(Text.KNOWLEDGE_IS_REQUIRED_TO_CREATE_A_STATE_MACHINE);
        return;
      }

      if (!entryStateName){
        terminal.printError(Text.ENTRY_STATE_IS_REQUIRED_TO_CREATE_A_STATE_MACHINE);
        return;
      }

      var result = decisionHandler.createStateMachine(stateMachineName, knowledgeName, entryStateName, null);

      if (result == -1){
        var anotherParentName = decisionHandler.stateParentsBySceneName[sceneHandler.getActiveSceneName()][entryStateName];
        terminal.printError(Text.ENTRY_STATE_HAS_ANOTHER_PARENT.replace(Text.PARAM1, anotherParentName));
        return;
      }

      if (result == -2 || result == -3){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      stateMachineCreatorGUIHandler.addStateMachineFolder(stateMachineName, onStateMachineDestroyed);

      stateNames.push(stateMachineName);
      entryStateController.options(stateNames);
      entryStateController = guiHandler.datGuiStateMachineCreation.__controllers[4];
      entryStateController.listen();

      for (var smName in stateMachineCreatorGUIHandler.statesFoldersByStateMachineName){
        var curStatesFolder = stateMachineCreatorGUIHandler.statesFoldersByStateMachineName[smName];
        var curStateController = stateMachineCreatorGUIHandler.getStateControlerFromFolder(curStatesFolder);
        curStateController.options(stateMachineCreatorGUIHandler.getStateNamesArrayForStateMachine(smName));
        curStateController.listen();
      }

      terminal.printInfo(Text.STATE_MACHINE_CREATED);
    },
    "Done": function(){
      stateMachineCreatorGUIHandler.hide();
    }
  };

  guiHandler.datGuiStateMachineCreation.add(params, "Name");
  guiHandler.datGuiStateMachineCreation.add(params, "Knowledge", knowledgeNames);
  entryStateController = guiHandler.datGuiStateMachineCreation.add(params, "Entry state", stateNames).listen();
  guiHandler.datGuiStateMachineCreation.add(params, "Create");
  guiHandler.datGuiStateMachineCreation.add(params, "Done");

  for (var smName in stateMachinesInScene){
    this.addStateMachineFolder(smName, onStateMachineDestroyed);
  }

  var clonedStateMachinesInScene = decisionHandler.clonedStateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};
  for (var smName in clonedStateMachinesInScene){
    this.addClonedStateMachineFolder(smName);
  }
}

StateMachineCreatorGUIHandler.prototype.createMermaidContainer = function(){
  canvas.style.visibility = "hidden";

  var mermaidContainer = document.createElement("div");
  mermaidContainer.style.display = "block";
  mermaidContainer.style.position = "absolute";
  mermaidContainer.style.top = "0";
  mermaidContainer.style.left = "0";
  mermaidContainer.style.width = "100%";
  mermaidContainer.style.height = "100%";
  mermaidContainer.style.backgroundColor = "#d3d3d3";
  mermaidContainer.style.overflowX = "scroll";
  mermaidContainer.style.overflowY = "scroll";
  mermaidContainer.className = "mermaid";

  document.body.prepend(mermaidContainer);

  this.mermaidContainer = mermaidContainer;
}

StateMachineCreatorGUIHandler.prototype.hide = function(){
  document.body.removeChild(this.mermaidContainer);
  delete this.mermaidContainer;
  delete this.paramsByStateMachineName;
  delete this.statesFoldersByStateMachineName;
  delete this.visualisingStateMachineName;

  canvas.style.visibility = "";

  terminal.clear();
  terminal.enable();
  guiHandler.hide(guiHandler.guiTypes.STATE_MACHINE_CREATION);
  terminal.printInfo(Text.GUI_CLOSED);
}

StateMachineCreatorGUIHandler.prototype.getStateDeclarationText = function(stateName){
  return stateName + "\n";
}

StateMachineCreatorGUIHandler.prototype.getStateMachineDeclaration = function(preconfiguredStateMachine){
  var text = "state " + preconfiguredStateMachine.name + " {\n";
  text += this.visualiseStateMachine(preconfiguredStateMachine, true);
  text += "}\n";
  return text;
}

StateMachineCreatorGUIHandler.prototype.visualiseStateMachine = function(preconfiguredStateMachine, skipHeader){
  var statesInScene = decisionHandler.statesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};

  var mermaidText = !skipHeader? "stateDiagram-v2\n": "";

  var entryStateName = preconfiguredStateMachine.entryStateName;

  var declaredMap = {};
  for (var i = 0; i < preconfiguredStateMachine.states.length; i ++){
    var curStateName = preconfiguredStateMachine.states[i];
    if (statesInScene[curStateName]){
      mermaidText += this.getStateDeclarationText(curStateName);
    }else{
      mermaidText += this.getStateMachineDeclaration(stateMachinesInScene[curStateName]);
    }
    declaredMap[entryStateName] = true;
  }

  var transitions = [];
  for (var i = 0; i < preconfiguredStateMachine.transitions.length; i ++){
    var transition = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()][preconfiguredStateMachine.transitions[i]];
    transitions.push(transition);
    var sourceStateName = transition.sourceStateName;
    var targetStateName = transition.targetStateName;

    if (!declaredMap[targetStateName]){
      if (statesInScene[targetStateName]){
        mermaidText += this.getStateDeclarationText(targetStateName);
      }else{
        mermaidText += this.getStateMachineDeclaration(stateMachinesInScene[targetStateName]);
      }
      declaredMap[targetStateName] = true;
    }
  }

  for (var i = 0; i < transitions.length; i ++){
    var transition = transitions[i];
    var sourceStateName = transition.sourceStateName;
    var targetStateName = transition.targetStateName;
    var transitionName = transition.name;
    mermaidText += sourceStateName + " --> " + targetStateName + ": " + transitionName + "\n";
  }

  if (!skipHeader){
    this.mermaidContainer.innerHTML = mermaidText;
    this.mermaidContainer.removeAttribute("data-processed");

    mermaid.init();
  }

  return mermaidText;
}

StateMachineCreatorGUIHandler.prototype.unVisualise = function(){
  this.mermaidContainer.innerHTML = "";
}

StateMachineCreatorGUIHandler.prototype.onVisualisedStateMachineChanged = function(newSMName, isVisualising){
  if (!isVisualising){
    if (this.visualisingStateMachineName){
      var params = this.paramsByStateMachineName[this.visualisingStateMachineName];
      params["Visualise"] = false;
    }
    this.visualisingStateMachineName = null;
    this.unVisualise();
    return;
  }

  for (var smName in this.paramsByStateMachineName){
    var params = this.paramsByStateMachineName[smName];
    params["Visualise"] = (smName == newSMName);
  }

  this.visualiseStateMachine(decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][newSMName]);
  this.visualisingStateMachineName = newSMName;
}

StateMachineCreatorGUIHandler.prototype.addTransitionFolder = function(transitionName, parentFolder, stateMachineName){
  var folder = parentFolder.addFolder(transitionName);

  var params = {
    "Remove": function(){
      terminal.clear();
      decisionHandler.removeTransitionFromStateMachine(stateMachineName, transitionName);
      parentFolder.removeFolder(folder);
      stateMachineCreatorGUIHandler.onStateMachineUpdated(stateMachineName);
      terminal.printInfo(Text.TRANSITION_REMOVED_FROM_SM);
    }
  };

  folder.add(params, "Remove");
}

StateMachineCreatorGUIHandler.prototype.addStateFolder = function(stateName, parentFolder, stateMachineName){
  var folder = parentFolder.addFolder(stateName);

  var preconfiguredStateMachine = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName];

  var params = {
    "Remove": function(){
      terminal.clear();

      if (preconfiguredStateMachine.entryStateName == stateName){
        terminal.printError(Text.CANNOT_REMOVE_ENTRY_STATE);
        return;
      }

      for (var i = 0; i < preconfiguredStateMachine.transitions.length; i ++){
        var transitionName = preconfiguredStateMachine.transitions[i];
        var transition = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()][transitionName];
        if (transition.sourceStateName == stateName){
          terminal.printError(Text.TRANSITION_EXISTS_WITH_SOURCE_STATE.replace(Text.PARAM1, transitionName));
          return;
        }
      }

      decisionHandler.removeStateFromStateMachine(stateMachineName, stateName);
      parentFolder.removeFolder(folder);
      stateMachineCreatorGUIHandler.onStateMachineUpdated(stateMachineName);
      terminal.printInfo(Text.STATE_REMOVED_FROM_SM);
    }
  };

  folder.add(params, "Remove");
}

StateMachineCreatorGUIHandler.prototype.getStateControlerFromFolder = function(folder){
  for (var i = 0; i < folder.__controllers.length; i ++){
    var controller = folder.__controllers[i];
    if (controller.property == "State"){
      return controller;
    }
  }
}

StateMachineCreatorGUIHandler.prototype.getStateNamesArrayForStateMachine = function(stateMachineName){
  var preconfiguredStateMachine = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName];
  var statesInScene = decisionHandler.statesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var stateMachinesInScene = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var stateNames = Object.keys(statesInScene);
  var stateMachineNames = Object.keys(stateMachinesInScene);

  for (var i = 0; i < stateMachineNames.length; i ++){
    var curStateMachineName = stateMachineNames[i];
    if (curStateMachineName != stateMachineName){
      stateNames.push(curStateMachineName);
    }
  }

  stateNames.splice(stateNames.indexOf(preconfiguredStateMachine.entryStateName), 1);

  return stateNames;
}

StateMachineCreatorGUIHandler.prototype.onStateMachineUpdated = function(stateMachineName){
  if (stateMachineCreatorGUIHandler.visualisingStateMachineName != stateMachineName){
    return;
  }

  this.visualiseStateMachine(decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName]);
}

StateMachineCreatorGUIHandler.prototype.addStateMachineFolder = function(stateMachineName, onStateMachineDestroyed){
  var preconfiguredStateMachine = decisionHandler.stateMachinesBySceneName[sceneHandler.getActiveSceneName()][stateMachineName];

  var folderText = stateMachineName + " [Entry: " + preconfiguredStateMachine.entryStateName + "]";

  var stateMachineFolder = guiHandler.datGuiStateMachineCreation.addFolder(folderText);

  var transitionsInScene = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()] || {};
  var transitionNames = Object.keys(transitionsInScene);

  var stateNames = this.getStateNamesArrayForStateMachine(stateMachineName);

  var transitionsFolder;
  var statesFolder;

  var params = {
    "Transition": transitionNames[0] || "",
    "State": stateNames[0] || "",
    "Add transition": function(){
      terminal.clear();
      var transitionName = this["Transition"];

      if (!transitionName){
        terminal.printError(Text.TRANSITION_NAME_CANNOT_BE_EMPTY);
        return;
      }

      var transition = decisionHandler.transitionsBySceneName[sceneHandler.getActiveSceneName()][transitionName];
      var result = decisionHandler.addTransitionToStateMachine(stateMachineName, transitionName);
      if (result == -1){
        terminal.printError(Text.THE_SOURCE_STATE_OF_TRANSITION_DIFFERENT_PARENT);
        return;
      }
      if (result == 0){
        terminal.printError(Text.TRANSITION_WITH_SAME_SOURCE_TARGET_EXISTS);
        return;
      }

      stateMachineCreatorGUIHandler.addTransitionFolder(transitionName, transitionsFolder, stateMachineName);
      stateMachineCreatorGUIHandler.onStateMachineUpdated(stateMachineName);
      terminal.printInfo(Text.TRANSITION_ADDED);
    },
    "Add state": function(){
      terminal.clear();

      var stateName = this["State"];

      if (!stateName){
        terminal.printError(Text.STATE_NAME_CANNOT_BE_EMPTY);
        return;
      }

      var result = decisionHandler.addStateToStateMachine(stateMachineName, stateName);
      if (result == -1){
        terminal.printError(Text.STATE_HAS_ANOTHER_PARENT);
        return;
      }

      if (result == -2){
        terminal.printError(Text.STATE_CONTAINS_PARENT_STATE_MACHINE);
        return;
      }

      if (!result){
        terminal.printError(Text.STATE_MACHINE_ALREADY_HAS_THIS_STATE);
        return;
      }

      stateMachineCreatorGUIHandler.addStateFolder(stateName, statesFolder, stateMachineName);
      stateMachineCreatorGUIHandler.onStateMachineUpdated(stateMachineName);
      terminal.printInfo(Text.STATE_ADDED);
    },
    "Destroy": function(){
      terminal.clear();

      var clonedStateMachinesInScene = decisionHandler.clonedStateMachinesBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var clonedSMName in clonedStateMachinesInScene){
        if (clonedStateMachinesInScene[clonedSMName].refName == stateMachineName){
          terminal.printError(Text.STATE_MACHINE_HAS_A_CLONE_CANNOT_DESTROY.replace(Text.PARAM1, clonedSMName));
          return;
        }
      }

      if (!decisionHandler.destroyStateMachine(stateMachineName)){
        terminal.printError(Text.STATE_MACHINE_IS_ENTRY_STATE_CANNOT_DESTROY.replace(Text.PARAM1, decisionHandler.stateParentsBySceneName[sceneHandler.getActiveSceneName()][stateMachineName]))
        return;
      }
      guiHandler.datGuiStateMachineCreation.removeFolder(stateMachineFolder);
      if (stateMachineCreatorGUIHandler.visualisingStateMachineName == stateMachineName){
        stateMachineCreatorGUIHandler.onVisualisedStateMachineChanged(stateMachineName, false);
      }
      delete stateMachineCreatorGUIHandler.paramsByStateMachineName[stateMachineName];
      delete stateMachineCreatorGUIHandler.statesFoldersByStateMachineName[stateMachineName];
      onStateMachineDestroyed(stateMachineName);

      for (var smName in stateMachineCreatorGUIHandler.statesFoldersByStateMachineName){
        var curStatesFolder = stateMachineCreatorGUIHandler.statesFoldersByStateMachineName[smName];
        var curStateController = stateMachineCreatorGUIHandler.getStateControlerFromFolder(curStatesFolder);
        var curStateNames = stateMachineCreatorGUIHandler.getStateNamesArrayForStateMachine(smName);
        curStateController.object["State"] = curStateNames[0] || "";
        curStateController.options(curStateNames);
        curStateController.listen();
      }

      terminal.printInfo(Text.STATE_MACHINE_DESTROYED);
    },
    "Visualise": false
  };

  stateMachineFolder.add(params, "Destroy");
  stateMachineFolder.add(params, "Visualise").onChange(function(val){
    terminal.clear();
    stateMachineCreatorGUIHandler.onVisualisedStateMachineChanged(stateMachineName, val);
    if (val){
      terminal.printInfo(Text.VISUALISING.replace(Text.PARAM1, stateMachineName));
    }else{
      terminal.printInfo(Text.NOT_VISUALISING.replace(Text.PARAM1, stateMachineName));
    }
  }).listen();

  var knowledgeNames = Object.keys(decisionHandler.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {});
  var cloneFolder = stateMachineFolder.addFolder("Clone");
  var cloneParams = {
    "Name": "",
    "Knowledge": knowledgeNames[0] || "",
    "Create a clone": function(){
      terminal.clear();
      var cloneName = this["Name"];
      var knowledgeName = this["Knowledge"];

      if (!cloneName){
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!knowledgeName){
        terminal.printError(Text.KNOWLEDGE_IS_REQUIRED_TO_CREATE_A_STATE_MACHINE);
        return;
      }

      if (!decisionHandler.cloneStateMachine(cloneName, stateMachineName, knowledgeName)){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      stateMachineCreatorGUIHandler.addClonedStateMachineFolder(cloneName);
      terminal.printInfo(Text.STATE_MACHINE_CLONED);
    }
  };
  cloneFolder.add(cloneParams, "Name");
  cloneFolder.add(cloneParams, "Knowledge", knowledgeNames);
  cloneFolder.add(cloneParams, "Create a clone");

  transitionsFolder = stateMachineFolder.addFolder("Transitions");
  transitionsFolder.add(params, "Transition", transitionNames);
  transitionsFolder.add(params, "Add transition");

  for (var i = 0; i < preconfiguredStateMachine.transitions.length; i ++){
    this.addTransitionFolder(preconfiguredStateMachine.transitions[i], transitionsFolder, stateMachineName);
  }

  statesFolder = stateMachineFolder.addFolder("States");
  statesFolder.add(params, "State", stateNames).listen();
  statesFolder.add(params, "Add state");

  for (var i = 0; i < preconfiguredStateMachine.states.length; i ++){
    this.addStateFolder(preconfiguredStateMachine.states[i], statesFolder, stateMachineName);
  }

  this.paramsByStateMachineName[stateMachineName] = params;
  this.statesFoldersByStateMachineName[stateMachineName] = statesFolder;
}

StateMachineCreatorGUIHandler.prototype.addClonedStateMachineFolder = function(cloneName){
  var clone = decisionHandler.clonedStateMachinesBySceneName[sceneHandler.getActiveSceneName()][cloneName];
  var folderText = cloneName + " (Clone of [" + clone.refName + "] having knowledge [" + clone.knowledgeName + "])";
  var cloneFolder = guiHandler.datGuiStateMachineCreation.addFolder(folderText);
  cloneFolder.add({
    "Destroy": function(){
      terminal.clear();
      decisionHandler.destroyClonedStateMachine(cloneName);
      guiHandler.datGuiStateMachineCreation.removeFolder(cloneFolder);
      terminal.printInfo(Text.STATE_MACHINE_DESTROYED);
    }
  }, "Destroy");
}
