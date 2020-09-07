var DecisionTreeCreatorGUIHandler = function(){

}

DecisionTreeCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_DECISION_TREE);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiDecisionCreation = new dat.GUI({hideable: false});
}
