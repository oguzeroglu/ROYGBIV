var DecisionTreeCreatorGUIHandler = function(){

}

DecisionTreeCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_DECISION_TREE);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  this.createMermaidContainer();

  guiHandler.datGuiDecisionTreeCreation = new dat.GUI({hideable: false});
}

DecisionTreeCreatorGUIHandler.prototype.hide = function(){
  document.body.removeChild(this.mermaidContainer);
  delete this.mermaidContainer;

  canvas.style.visibility = "";

  terminal.clear();
  terminal.enable();
  guiHandler.hide(guiHandler.guiTypes.DECISION_TREE_CREATION);
  terminal.printInfo(Text.GUI_CLOSED);
}

DecisionTreeCreatorGUIHandler.prototype.createMermaidContainer = function(){
  canvas.style.visibility = "hidden";

  var mermaidContainer = document.createElement("div");
  mermaidContainer.style.display = "block";
  mermaidContainer.style.position = "absolute";
  mermaidContainer.style.top = "0";
  mermaidContainer.style.left = "0";
  mermaidContainer.style.width = "100%";
  mermaidContainer.style.height = "100%";
  mermaidContainer.style.backgroundColor = "#d3d3d3";
  mermaidContainer.className = "mermaid";

  document.body.prepend(mermaidContainer);

  this.mermaidContainer = mermaidContainer;
}
