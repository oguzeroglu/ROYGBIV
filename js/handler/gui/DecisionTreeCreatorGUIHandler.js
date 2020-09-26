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

  this.decisionTreeParamsByDecisionTreeName = {};
  this.visualisingDecisionTreeName = null;

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

      var dtParams = decisionTreeCreatorGUIHandler.addDecisionTreeFolder(treeName, knowledgeName);
      decisionTreeCreatorGUIHandler.decisionTreeParamsByDecisionTreeName[treeName] = dtParams;
      terminal.printInfo(Text.DECISION_TREE_CREATED);
    },
    "Done": function(){
      terminal.clear();

      var dts = decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var dtName in dts){
        if (dts[dtName].rootDecision == null){
          terminal.printError(Text.DECISION_TREE_DOES_NOT_HAVE_A_ROOT.replace(Text.PARAM1, dtName));
          return;
        }
      }

      decisionTreeCreatorGUIHandler.hide();
    }
  };

  guiHandler.datGuiDecisionTreeCreation.add(params, "Knowledge", knowledgeNames);
  guiHandler.datGuiDecisionTreeCreation.add(params, "Tree name");
  guiHandler.datGuiDecisionTreeCreation.add(params, "Create");
  guiHandler.datGuiDecisionTreeCreation.add(params, "Done");

  var decisionTreesInScene = decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};
  for (var dtName in decisionTreesInScene){
    var pcdt = decisionTreesInScene[dtName];
    var dtParams = this.addDecisionTreeFolder(dtName, pcdt.knowledgeName);
    this.decisionTreeParamsByDecisionTreeName[dtName] = dtParams;
  }

  var clonedDecisionTreesInScene = decisionHandler.clonedDecisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};
  for (var dtName in clonedDecisionTreesInScene){
    this.addClonedDecisionTreeFolder(dtName);
  }
}

DecisionTreeCreatorGUIHandler.prototype.hide = function(){

  delete this.decisionTreeParamsByDecisionTreeName;
  delete this.visualisingDecisionTreeName;

  document.body.removeChild(this.mermaidContainer);
  delete this.mermaidContainer;

  canvas.style.visibility = "";

  terminal.clear();
  terminal.enable();
  guiHandler.hide(guiHandler.guiTypes.DECISION_TREE_CREATION);
  terminal.printInfo(Text.GUI_CLOSED);
}

DecisionTreeCreatorGUIHandler.prototype.onVisualisedDecitionTreeChanged = function(newDTName, isVisualising){
  if (!isVisualising){
    if (this.visualisingDecisionTreeName){
      var params = this.decisionTreeParamsByDecisionTreeName[this.visualisingDecisionTreeName];
      params["Visualise"] = false;
    }
    this.visualisingDecisionTreeName = null;
    this.unVisualise();
    return;
  }

  for (var dtName in this.decisionTreeParamsByDecisionTreeName){
    var params = this.decisionTreeParamsByDecisionTreeName[dtName];
    params["Visualise"] = (dtName == newDTName);
  }

  this.visualiseDecisionTree(decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()][newDTName]);
  this.visualisingDecisionTreeName = newDTName;
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
      var yesNodeText = yesNodeID + "[" + preconfiguredDecision.yesNode + "]";
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
      var noNodeText = noNodeID + "[" + preconfiguredDecision.noNode + "]";
      text += nameText + " -->|No| " + noNodeText + "\n";
    }
  }

  return text;
}

DecisionTreeCreatorGUIHandler.prototype.unVisualise = function(){
  this.mermaidContainer.innerHTML = "";
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

DecisionTreeCreatorGUIHandler.prototype.addDecisionNodeControllers = function(decisionTreeName, preconfiguredDecision, folder, isYes, parentDecision){
  var decisionTree = decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()][decisionTreeName];

  var nodeTypes = ["DECISION", "STRING"];
  var decisionsInScene = decisionHandler.decisionsBySceneName[sceneHandler.getActiveSceneName()] || {};
  var decisionNames = [];
  for (var decisionName in decisionsInScene){
    if (decisionName != preconfiguredDecision.decisionName){
      decisionNames.push(decisionName);
    }
  }

  var decisionController, valueController;

  var addedFolder = null;

  var params = {
    "Type": "STRING",
    "Decision": decisionNames[0] || "",
    "Value": "val",
    "Add": function(){
      terminal.clear();

      var node = isYes? "yesNode": "noNode";

      if (preconfiguredDecision[node] != null){
        terminal.printError(isYes? Text.DECISION_ALREADY_HAS_A_YES_NODE: Text.DECISION_ALREADY_HAS_A_NO_NODE);
        return;
      }

      var type = this["Type"];

      if (type == "STRING"){
        var val = this["Value"];
        if (!val){
          terminal.printError(Text.NODE_VALUE_CANNOT_BE_EMPTY);
          return;
        }
        if (isYes){
          preconfiguredDecision.setYesNode(val);
        }else{
          preconfiguredDecision.setNoNode(val);
        }
      }else{
        var dec = this["Decision"];
        if (!dec){
          terminal.printError(Text.DECISION_NAME_CANNOT_BE_EMPTY);
          return;
        }

        if (decisionTree.isDecisionUsed(dec)){
          terminal.printError(Text.DECISION_ALREADY_USED);
          return;
        }

        var newDecision = new PreconfiguredDecision(dec, sceneHandler.getActiveSceneName());

        if (isYes){
          preconfiguredDecision.setYesNode(newDecision);
        }else{
          preconfiguredDecision.setNoNode(newDecision);
        }

        addedFolder = decisionTreeCreatorGUIHandler.addDecisionFolder(decisionTreeName, folder, newDecision, preconfiguredDecision);
      }


      if (decisionTreeCreatorGUIHandler.visualisingDecisionTreeName == decisionTreeName){
        decisionTreeCreatorGUIHandler.visualiseDecisionTree(decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()][decisionTreeName]);
      }

      terminal.printInfo(isYes? Text.YES_NODE_SET: Text.NO_NODE_SET);
    },
    "Destroy": function(){
      terminal.clear();
      var node = isYes? "yesNode": "noNode";
      if (preconfiguredDecision[node] == null){
        terminal.printError(isYes? Text.DECISION_DOES_NOT_HAVE_A_YES_NODE_SET: Text.DECISION_DOES_NOT_HAVE_A_NO_NODE_SET);
        return;
      }

      if (isYes){
        preconfiguredDecision.unsetYesNode();
      }else{
        preconfiguredDecision.unsetNoNode();
      }

      if (addedFolder){
        folder.removeFolder(addedFolder);
        addedFolder = null;
      }

      if (decisionTreeCreatorGUIHandler.visualisingDecisionTreeName == decisionTreeName){
        decisionTreeCreatorGUIHandler.visualiseDecisionTree(decisionTree);
      }
      terminal.printInfo(isYes? Text.YES_NODE_UNSET: Text.NO_NODE_UNSET);
    }
  };

  folder.add(params, "Type", nodeTypes).onChange(function(val){
    if (val == "DECISION"){
      guiHandler.enableController(decisionController);
      guiHandler.disableController(valueController);
    }else{
      guiHandler.disableController(decisionController);
      guiHandler.enableController(valueController);
    }
  }).listen();
  decisionController = folder.add(params, "Decision", decisionNames).listen();
  valueController = folder.add(params, "Value").listen();
  folder.add(params, "Add");
  folder.add(params, "Destroy");

  guiHandler.disableController(decisionController);

  var node = isYes? "yesNode": "noNode";

  if (preconfiguredDecision[node] != null){
    if (preconfiguredDecision[node] instanceof PreconfiguredDecision){
      params["Type"] = "DECISION";
      params["Decision"] = preconfiguredDecision[node].decisionName;
      params["Value"] = "";
      guiHandler.enableController(decisionController);
      guiHandler.disableController(valueController);
      addedFolder = this.addDecisionFolder(decisionTreeName, folder, preconfiguredDecision[node], preconfiguredDecision);
    }else{
      params["Type"] = "STRING";
      params["Value"] = preconfiguredDecision[node];
      guiHandler.disableController(decisionController);
      guiHandler.enableController(valueController);
    }
  }
}

DecisionTreeCreatorGUIHandler.prototype.addDecisionFolder = function(decisionTreeName, parentFolder, preconfiguredDecision, parentDecision){
  var preconfiguredDecisionTree = decisionHandler.decisionTreesBySceneName[sceneHandler.getActiveSceneName()][decisionTreeName];

  var decisionName = preconfiguredDecision.decisionName;
  var decisionFolderText = preconfiguredDecisionTree.rootDecision == preconfiguredDecision? "Root: " + decisionName: decisionName;
  var decisionFolder = parentFolder.addFolder(decisionFolderText);
  var yesFolder = decisionFolder.addFolder("Yes");
  var noFolder = decisionFolder.addFolder("No");

  this.addDecisionNodeControllers(decisionTreeName, preconfiguredDecision, yesFolder, true, parentDecision);
  this.addDecisionNodeControllers(decisionTreeName, preconfiguredDecision, noFolder, false, parentDecision);

  decisionFolder.add({
    "Destroy": function(){
      terminal.clear();
      if (!parentDecision){
        preconfiguredDecisionTree.unsetRootDecision();
        terminal.printInfo(Text.ROOT_DECISION_UNSET);

        if (decisionTreeCreatorGUIHandler.visualisingDecisionTreeName == decisionTreeName){
          decisionTreeCreatorGUIHandler.onVisualisedDecitionTreeChanged(decisionTreeName, false);
        }
      }else{
        if (parentDecision.yesNode == preconfiguredDecision){
          parentDecision.unsetYesNode();
          terminal.printInfo(Text.YES_NODE_UNSET);
        }else{
          parentDecision.unsetNoNode();
          terminal.printInfo(Text.NO_NODE_UNSET);
        }

        if (decisionTreeCreatorGUIHandler.visualisingDecisionTreeName == decisionTreeName){
          decisionTreeCreatorGUIHandler.visualiseDecisionTree(preconfiguredDecisionTree);
        }
      }

      parentFolder.removeFolder(decisionFolder);
    }
  }, "Destroy");

  return decisionFolder;
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
      terminal.clear();
      var decisionName = this["Decision"];
      if (!decisionName){
        terminal.printError(Text.DECISION_NAME_CANNOT_BE_EMPTY);
        return;
      }
      if (preconfiguredDecisionTree.hasRootDecision()){
        terminal.printError(Text.DECISION_TREE_ALREADY_HAS_A_ROOT_DECISION);
        return;
      }

      var preconfiguredDecision = new PreconfiguredDecision(decisionName, sceneHandler.getActiveSceneName());
      preconfiguredDecisionTree.setRootDecision(preconfiguredDecision);
      decisionTreeCreatorGUIHandler.addDecisionFolder(decisionTreeName, decisionTreeFolder, preconfiguredDecision);
      terminal.printInfo(Text.ROOT_DECISION_SET);
    },
    "Visualise": false,
    "Destroy": function(){
      terminal.clear();

      var clonedDecisionTreesInScene = decisionHandler.clonedDecisionTreesBySceneName[sceneHandler.getActiveSceneName()] || {};
      for (var cdtName in clonedDecisionTreesInScene){
        if (clonedDecisionTreesInScene[cdtName].refName == decisionTreeName){
          terminal.printError(Text.DECISION_TREE_HAS_A_CLONE_CANNOT_DESTROY.replace(Text.PARAM1, cdtName));
          return;
        }
      }

      decisionHandler.destroyDecisionTree(decisionTreeName);
      guiHandler.datGuiDecisionTreeCreation.removeFolder(decisionTreeFolder);
      delete decisionTreeCreatorGUIHandler.decisionTreeParamsByDecisionTreeName[decisionTreeName];
      if (decisionTreeCreatorGUIHandler.visualisingDecisionTreeName == decisionTreeName){
        decisionTreeCreatorGUIHandler.onVisualisedDecitionTreeChanged(decisionTreeName, false);
      }
      terminal.printInfo(Text.DECISION_TREE_DESTROYED);
    }
  };

  decisionTreeFolder.add(params, "Decision", decisionNames);
  decisionTreeFolder.add(params, "Add as root");
  decisionTreeFolder.add(params, "Visualise").onChange(function(val){
    terminal.clear();

    if (val && !preconfiguredDecisionTree.hasRootDecision()){
      params["Visualise"] = false;
      terminal.printError(Text.CANNOT_VISUALISE_DECISION_TREE_WO_ROOT_DECISION);
      return;
    }

    decisionTreeCreatorGUIHandler.onVisualisedDecitionTreeChanged(decisionTreeName, val);
    if (val){
      terminal.printInfo(Text.VISUALISING.replace(Text.PARAM1, decisionTreeName));
    }else{
      terminal.printInfo(Text.NOT_VISUALISING.replace(Text.PARAM1, decisionTreeName));
    }
  }).listen();
  decisionTreeFolder.add(params, "Destroy");

  var knowledgesInScene = decisionHandler.knowledgesBySceneName[sceneHandler.getActiveSceneName()] || {};
  var knowledgeNames = Object.keys(knowledgesInScene);
  var cloneFolder = decisionTreeFolder.addFolder("Clone");
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
        terminal.printError(Text.KNOWLEDGE_IS_REQUIRED_TO_CREATE_A_DECISION_TREE);
        return;
      }

      if (!decisionHandler.cloneDecisionTree(cloneName, decisionTreeName, knowledgeName)){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      decisionTreeCreatorGUIHandler.addClonedDecisionTreeFolder(cloneName);
      terminal.printInfo(Text.DECISION_TREE_CLONED);
    }
  };
  cloneFolder.add(cloneParams, "Name");
  cloneFolder.add(cloneParams, "Knowledge", knowledgeNames);
  cloneFolder.add(cloneParams, "Create a clone");

  if (preconfiguredDecisionTree.hasRootDecision()){
    this.addDecisionFolder(decisionTreeName, decisionTreeFolder, preconfiguredDecisionTree.rootDecision);
  }

  return params;
}

DecisionTreeCreatorGUIHandler.prototype.addClonedDecisionTreeFolder = function(cloneName){
  var clone = decisionHandler.clonedDecisionTreesBySceneName[sceneHandler.getActiveSceneName()][cloneName];
  var folderText = cloneName + " (Clone of [" + clone.refName + "] having knowledge [" + clone.knowledgeName + "])";
  var folder = guiHandler.datGuiDecisionTreeCreation.addFolder(folderText);
  folder.add({
    "Destroy": function(){
      terminal.clear();
      decisionHandler.destroyClonedDecisionTree(cloneName);
      guiHandler.datGuiDecisionTreeCreation.removeFolder(folder);
      terminal.printInfo(Text.DECISION_TREE_DESTROYED);
    }
  }, "Destroy");
}
