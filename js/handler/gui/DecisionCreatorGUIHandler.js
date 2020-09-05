var DecisionCreatorGUIHandler = function(){

}

DecisionCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_DECISION);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiDecisionCreation = new dat.GUI({hideable: false});
}
