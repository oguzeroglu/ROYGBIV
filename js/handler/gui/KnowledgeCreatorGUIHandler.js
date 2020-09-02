var KnowledgeCreatorGUIHandler = function(){

}

KnowledgeCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_KNOWLEDGE);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiKnowledgeCreation = new dat.GUI({hideable: false});
}
