var ModelCreatorGUIHandler = function(){

}

ModelCreatorGUIHandler.prototype.show = function(){
  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();
  this.hiddenEngineObjects = [];
  for (var i = 0; i<scene.children.length; i++){
    var child = scene.children[i];
    if (child.visible){
      child.visible = false;
      this.hiddenEngineObjects.push(child);
    }
  }
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  activeControl.onActivated();

  terminal.clear();
  terminal.disable();
  terminal.printInfo(Text.LOADING_MODELS);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/getModels", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function(){
    if (xhr.readyState == 4 && xhr.status == 200){
      var resp = JSON.parse(xhr.responseText);

      if (resp.length == 0){
        modelCreatorGUIHandler.close(Text.NO_VALID_MODELS_UNDER_MODELS_FOLDER, true);
        return;
      }

      modelCreatorGUIHandler.renderControls(resp, 0);
    }
  }
  xhr.send();
}

ModelCreatorGUIHandler.prototype.close = function(message, isError){
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }

  terminal.clear();
  terminal.enable();
  if (!isError){
    terminal.printInfo(message);
  }else{
    terminal.printError(message);
  }
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
}

ModelCreatorGUIHandler.prototype.renderControls = function(allModels, index){
  terminal.clear();
  terminal.printInfo(Text.LOADING_MODEL);

  var modelToLoad = allModels[index];
  modelLoader.loadModel(modelToLoad.folder, modelToLoad.obj, modelToLoad.mtl, function(model){
    terminal.clear();
    terminal.printInfo(Text.MODEL_LOADED);

    if (guiHandler.datGuiModelCreation){
      guiHandler.removeControllers(guiHandler.datGuiModelCreation);
    }else{
      guiHandler.datGuiModelCreation = new dat.GUI({hideable: false});
    }

    var allFolders = [];
    for (var i = 0; i < allModels.length; i ++){
      allFolders.push(allModels[i].folder);
    }

    var childrenNames = [];
    for (var i = 0; i < model.children.length; i ++){
      var child = model.children[i];
      childrenNames.push(child.name || "Child" + i);
    }

    var params = {
      "Folder": allFolders[index],
      "Child": childrenNames[0],
      "Done": function(){

      },
      "Cancel": function(){
        modelCreatorGUIHandler.close(Text.OPERATION_CANCELLED, false);
      }
    };

    var folderController, childController;

    folderController = guiHandler.datGuiModelCreation.add(params, "Folder", allFolders).onChange(function(val){
      guiHandler.disableController(folderController);
      guiHandler.disableController(childController);
      modelCreatorGUIHandler.renderControls(allModels, allFolders.indexOf(val));
    });
    childController = guiHandler.datGuiModelCreation.add(params, "Child", childrenNames);
    guiHandler.datGuiModelCreation.add(params, "Done");
    guiHandler.datGuiModelCreation.add(params, "Cancel");
  }, function(){
    modelCreatorGUIHandler.close(Text.ERROR_HAPPENED_LOADING_MODEL_FROM_FOLDER.replace(Text.PARAM1, modelToLoad.folder), true);
  });
}
