var KnowledgeCreatorGUIHandler = function(){

}

KnowledgeCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_KNOWLEDGE);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiKnowledgeCreation = new dat.GUI({hideable: false});

  var defaultControls = {
    "Name": "",
    "Create": function(){

      terminal.clear();

      var knowledgeName = this["Name"];

      if (!knowledgeName){
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!decisionHandler.createKnowledge(knowledgeName)){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }else{
        knowledgeCreatorGUIHandler.addKnowledgeFolder(knowledgeName);
        terminal.printInfo(Text.KNOWLEDGE_CREATED);
        return;
      }
    },
    "Done": function(){
      terminal.clear();
      terminal.enable();
      guiHandler.hide(guiHandler.guiTypes.KNOWLEDGE_CREATION);
      terminal.printInfo(Text.GUI_CLOSED);
    }
  };

  guiHandler.datGuiKnowledgeCreation.add(defaultControls, "Name");
  guiHandler.datGuiKnowledgeCreation.add(defaultControls, "Create");
  guiHandler.datGuiKnowledgeCreation.add(defaultControls, "Done");

  var knowledgesInScene = decisionHandler.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  for (var knowledgeName in knowledgesInScene){
    this.addKnowledgeFolder(knowledgeName);
  }
}

KnowledgeCreatorGUIHandler.prototype.addKnowledgeFolder = function(knowledgeName){
  var knowledgeFolder = guiHandler.datGuiKnowledgeCreation.addFolder(knowledgeName);

  var informationCreationParams = {
    "Information Name": "",
    "Create Information": function(){
      terminal.clear();

      var informationName = this["Information Name"];

      if (!informationName){
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!decisionHandler.addInformationToKnowledge(knowledgeName, informationName, decisionHandler.informationTypes.BOOLEAN, false)){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      knowledgeCreatorGUIHandler.addInformationFolder(informationName, knowledgeName, knowledgeFolder);

      terminal.printInfo(Text.INFORMATION_CREATED);
    }
  };

  knowledgeFolder.add(informationCreationParams, "Information Name");
  knowledgeFolder.add(informationCreationParams, "Create Information");

  knowledgeFolder.add({
    "Destroy": function(){
      terminal.clear();

      var decisionsInScene = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var decisionName in decisionsInScene){
        if (decisionsInScene[decisionName].knowledgeName == knowledgeName){
          terminal.printError(Text.KNOWLEDGE_USED_IN_DECISION_CANNOT_DESTROY.replace(Text.PARAM1, decisionName));
          return;
        }
      }

      decisionHandler.destroyKnowledge(knowledgeName);
      guiHandler.datGuiKnowledgeCreation.removeFolder(knowledgeFolder);
      terminal.printInfo(Text.KNOWLEDGE_DESTROYED);
    }
  }, "Destroy");

  var existingInformations = decisionHandler.getAllInformationsOfKnowledge(knowledgeName);
  for (var i = 0; i < existingInformations.length; i ++){
    knowledgeCreatorGUIHandler.addInformationFolder(existingInformations[i].name, knowledgeName, knowledgeFolder);
  }
}

KnowledgeCreatorGUIHandler.prototype.addInformationFolder = function(informationName, knowledgeName, knowledgeFolder){
  var informationFolder = knowledgeFolder.addFolder(informationName);

  var information = decisionHandler.getInformationFromKnowledge(knowledgeName, informationName);

  var params = {
    "Type": information.type,
    "Destroy": function(){
      terminal.clear();
      decisionHandler.removeInformationFromKnowledge(knowledgeName, informationName);
      knowledgeFolder.removeFolder(informationFolder);
      terminal.printInfo(Text.INFORMATION_REMOVED);
    }
  };

  var valueController;

  informationFolder.add(params, "Type", Object.keys(decisionHandler.informationTypes)).onChange(function(val){
    informationFolder.remove(valueController);
    decisionHandler.removeInformationFromKnowledge(knowledgeName, informationName);

    var initialValue;

    if (val == decisionHandler.informationTypes.BOOLEAN){
      initialValue = false;
    }else if (val == decisionHandler.informationTypes.NUMERICAL){
      initialValue = 0;
    }else if (val == decisionHandler.informationTypes.VECTOR){
      initialValue = {x: 0, y: 0, z: 0};
    }

    decisionHandler.addInformationToKnowledge(knowledgeName, informationName, val, initialValue);
    information = decisionHandler.getInformationFromKnowledge(knowledgeName, informationName);

    valueController = knowledgeCreatorGUIHandler.addInformationValueController(information, informationFolder, knowledgeName, function(newInformation){
      informaiton = newInformation;
    });
  });

  informationFolder.add(params, "Destroy");

  valueController = this.addInformationValueController(information, informationFolder, knowledgeName, function(newInformation){
    information = newInformation;
  });
}

KnowledgeCreatorGUIHandler.prototype.addInformationValueController = function(information, informationFolder, knowledgeName, onInformationUpdated){

  var controller;

  var informationName = information.name;

  if (information.type == decisionHandler.informationTypes.BOOLEAN){
    controller = informationFolder.add({
      "Value": information.value? "true": "false"
    }, "Value", ["true", "false"]).onChange(function(val){
      terminal.clear();

      decisionHandler.removeInformationFromKnowledge(knowledgeName, informationName);
      decisionHandler.addInformationToKnowledge(knowledgeName, informationName, decisionHandler.informationTypes.BOOLEAN, val == "true");
      onInformationUpdated(decisionHandler.getInformationFromKnowledge(knowledgeName, informationName));

      terminal.printInfo(Text.INFORMATION_UPDATED);
    });
  }else if (information.type == decisionHandler.informationTypes.NUMERICAL){
    controller = informationFolder.add({
      "Value": "" + information.value
    }, "Value").onFinishChange(function(val){
      terminal.clear();

      var parsed = parseFloat(val);

      if (isNaN(parsed)){
        terminal.printError(Text.INVALID_NUMERICAL_VALUE);
        return;
      }

      decisionHandler.removeInformationFromKnowledge(knowledgeName, informationName);
      decisionHandler.addInformationToKnowledge(knowledgeName, informationName, decisionHandler.informationTypes.NUMERICAL, parsed);
      onInformationUpdated(decisionHandler.getInformationFromKnowledge(knowledgeName, informationName));

      terminal.printInfo(Text.INFORMATION_UPDATED);
    });
  }else if (information.type == decisionHandler.informationTypes.VECTOR){
    controller = informationFolder.add({
      "Value": information.value.x + "," + information.value.y + "," + information.value.z
    }, "Value").onFinishChange(function(val){
      terminal.clear();

      var splitted = val.split(",");
      var parsedX = parseFloat(splitted[0]);
      var parsedY = parseFloat(splitted[1]);
      var parsedZ = parseFloat(splitted[2]);

      if (isNaN(parsedX) || isNaN(parsedY) || isNaN(parsedZ)){
        terminal.printError(Text.INVALID_VECTOR_VALUE);
        return;
      }

      decisionHandler.removeInformationFromKnowledge(knowledgeName, informationName);
      decisionHandler.addInformationToKnowledge(knowledgeName, informationName, decisionHandler.informationTypes.VECTOR, {x: parsedX, y: parsedY, z: parsedZ});
      onInformationUpdated(decisionHandler.getInformationFromKnowledge(knowledgeName, informationName));

      terminal.printInfo(Text.INFORMATION_UPDATED);
    });
  }

  return controller;
}
