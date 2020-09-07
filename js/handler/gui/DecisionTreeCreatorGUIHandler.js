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
  mermaidContainer.style.overflowX = "scroll";
  mermaidContainer.style.overflowY = "scroll";
  mermaidContainer.className = "mermaid";

  document.body.prepend(mermaidContainer);

  this.mermaidContainer = mermaidContainer;
}

DecisionTreeCreatorGUIHandler.prototype.getDecisionMermaidText = function(preconfiguredDecision, id){
  var decisionName = preconfiguredDecision.decisionName;
  var uuid = id || generateUUID();
  var nameText = uuid + "{" + decisionName + "}";

  var text = nameText + "\n";

  if (preconfiguredDecision.yesNode != null){
    var yesNodeID = generateUUID();
    if (preconfiguredDecision.yesNode instanceof PreconfiguredDecision){
      var yesNodeText = yesNodeID + "{" + preconfiguredDecision.yesNode.decisionName + "}";
      text += nameText + " -->|Yes| " + yesNodeText + "\n";
      text += this.getDecisionMermaidText(preconfiguredDecision.yesNode, yesNodeID);
    }else{
      var yesNodeText = yesNodeID + "{" + preconfiguredDecision.yesNode + "}";
      text += nameText + " -->|Yes| " + yesNodeText + "\n";
    }
  }

  if (preconfiguredDecision.noNode != null){
    var noNodeID = generateUUID();
    if (preconfiguredDecision.noNode instanceof PreconfiguredDecision){
      var noNodeText = noNodeID + "{" + preconfiguredDecision.noNode.decisionName + "}";
      text += nameText + " -->|No| " + noNodeText + "\n";
      text += this.getDecisionMermaidText(preconfiguredDecision.noNode, noNodeID);
    }else{
      var noNodeText = noNodeID + "{" + preconfiguredDecision.noNode + "}";
      text += nameText + " -->|No| " + noNodeText + "\n";
    }
  }

  return text;
}

DecisionTreeCreatorGUIHandler.prototype.visualiseDecisionTree = function(preconfiguredDecisionTree){
  if (!preconfiguredDecisionTree.rootDecision){
    return false;
  }

  var mermaidText = "graph TD\n";

  mermaidText += this.getDecisionMermaidText(preconfiguredDecisionTree.rootDecision);

  this.mermaidContainer.innerHTML = mermaidText;
  this.mermaidContainer.removeAttribute("data-processed");

  mermaid.init();
}
