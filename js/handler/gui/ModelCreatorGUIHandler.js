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
