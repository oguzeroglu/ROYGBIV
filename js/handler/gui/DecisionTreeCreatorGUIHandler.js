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

  var knowledgesInScene = decisionHandler.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var knowledgeNames = Object.keys(knowledgesInScene);

  var params = {
    "Knowledge": knowledgeNames[0] || "",
    "Tree name": "",
    "Create": function(){
      terminal.clear();

      var knowledgeName = this["Knowledge"];
      var treeName = this["Tree name"];

      if (!knowledgeName){
        terminal.printError(Text.KNOWLEDGE_IS_REQUIRED_TO_CREATE_A_DECISION_TREE);
        return;
      }

      if (!treeName){
        terminal.printError(Text.DECISION_TREE_NAME_CANNOT_BE_EMPTY);
        return;
      }

      if (!decisionHandler.createDecisionTree(treeName, knowledgeName, sceneHandler.getActiveSceneName())){
        terminal.printError(Text.DECISION_TREE_NAME_MUST_BE_UNIQUE);
        return;
      }

      decisionTreeCreatorGUIHandler.addDecisionTreeFolder(treeName, knowledgeName);
      terminal.printInfo(Text.DECISION_TREE_CREATED);
    },
    "Done": function(){
      decisionTreeCreatorGUIHandler.hide();
    }
  };

  guiHandler.datGuiDecisionTreeCreation.add(params, "Knowledge", knowledgeNames);
  guiHandler.datGuiDecisionTreeCreation.add(params, "Tree name");
  guiHandler.datGuiDecisionTreeCreation.add(params, "Create");
  guiHandler.datGuiDecisionTreeCreation.add(params, "Done");
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
  return true;
}

DecisionTreeCreatorGUIHandler.prototype.addDecisionTreeFolder = function(decisionTreeName, knowledgeName){
  var preconfiguredDecisionTree = decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()][decisionTreeName];
  var decisionTreeFolder = guiHandler.datGuiDecisionTreeCreation.addFolder(decisionTreeName);

  var decisionsInScene = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()] || {};
  var decisionNames = [];

  for (var decisionName in decisionsInScene){
    var decision = decisionsInScene[decisionName];
    if (decision.knowledgeName == knowledgeName){
      decisionNames.push(decisionName);
    }
  }

  var params = {
    "Decision": decisionNames[0] || "",
    "Add as root": function(){

    },
    "Destroy": function(){
      terminal.clear();
      decisionHandler.destroyDecisionTree(decisionTreeName);
      guiHandler.datGuiDecisionTreeCreation.removeFolder(decisionTreeFolder);
      terminal.printInfo(Text.DECISION_TREE_DESTROYED);
    }
  };

  decisionTreeFolder.add(params, "Decision", decisionNames);
  decisionTreeFolder.add(params, "Add as root");
  decisionTreeFolder.add(params, "Destroy");
}
