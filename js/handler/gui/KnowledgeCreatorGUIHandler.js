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
    }
  };

  guiHandler.datGuiKnowledgeCreation.add(defaultControls, "Name");
  guiHandler.datGuiKnowledgeCreation.add(defaultControls, "Create");
}

KnowledgeCreatorGUIHandler.prototype.addKnowledgeFolder = function(knowledgeName){
  var knowledgeFolder = guiHandler.datGuiKnowledgeCreation.addFolder(knowledgeName);

  var informationCreationParams = {
    "Information Name": "",
    "Information Type": Object.keys(decisionHandler.informationTypes)[0],
    "Create Information": function(){

    }
  };

  knowledgeFolder.add(informationCreationParams, "Information Name");
  knowledgeFolder.add(informationCreationParams, "Information Type", Object.keys(decisionHandler.informationTypes));
  knowledgeFolder.add(informationCreationParams, "Create Information");

  knowledgeFolder.add({
    "Destroy": function(){
      terminal.clear();
      decisionHandler.destroyKnowledge(knowledgeName);
      guiHandler.datGuiKnowledgeCreation.removeFolder(knowledgeFolder);
      terminal.printInfo(Text.KNOWLEDGE_DESTROYED);
    }
  }, "Destroy");
}

KnowledgeCreatorGUIHandler.prototype.addInformationFolder = function(informationName, knowledgeName){

}
