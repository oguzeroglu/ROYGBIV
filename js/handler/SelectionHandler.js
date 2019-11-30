var SelectionHandler = function(){
  this.currentSelection = 0;
}

SelectionHandler.prototype.select = function(object){
  if (mode != 0){
    return;
  }
  this.resetCurrentSelection();
  if (object.isAddedObject){
    selectedAddedObject = object;
    object.visualiseBoundingBoxes();
    object.mesh.add(axesHelper);
  }
  if (object.isObjectGroup){
    selectedObjectGroup = object;
    object.visualiseBoundingBoxes();
    object.mesh.add(axesHelper);
  }
  if (object.isAddedText){
    selectedAddedText = object;
    if (selectedAddedText.is2D){
      scene.add(selectedAddedText.rectangle.mesh);
    }else{
      scene.add(selectedAddedText.bbHelper);
    }
  }
  if (object.isSprite){
    selectedSprite = object;
    scene.add(object.rectangle.mesh);
  }
  if (object.isContainer){
    selectedContainer = object;
    if (!object.hasBorder){
      object.rectangle.mesh.material.uniforms.color.value.set("yellow");
    }
  }
  this.currentSelection = object;
}

SelectionHandler.prototype.getSelectedObject = function(){
  if (selectedAddedObject){
    return selectedAddedObject;
  }
  if (selectedObjectGroup){
    return selectedObjectGroup;
  }
  if (selectedAddedText){
    return selectedAddedText;
  }
  if (selectedSprite){
    return selectedSprite;
  }
  if (selectedContainer){
    return selectedContainer;
  }
  return 0;
}

SelectionHandler.prototype.resetCurrentSelection = function(){
  if (!this.currentSelection){
    return;
  }
  if (this.currentSelection.isAddedObject){
    this.currentSelection.mesh.remove(axesHelper);
    this.currentSelection.removeBoundingBoxesFromScene();
    selectedAddedObject = 0;
  }else if (this.currentSelection.isObjectGroup){
    this.currentSelection.mesh.remove(axesHelper);
    this.currentSelection.removeBoundingBoxesFromScene();
    selectedObjectGroup = 0;
  }else if (this.currentSelection.isAddedText){
    if (this.currentSelection.bbHelper){
      scene.remove(this.currentSelection.bbHelper);
    }
    if (this.currentSelection.rectangle){
      scene.remove(this.currentSelection.rectangle.mesh);
    }
    selectedAddedText = 0;
  }else if (this.currentSelection.isSprite){
    scene.remove(this.currentSelection.rectangle.mesh);
    selectedSprite = 0;
  }else if (this.currentSelection.isContainer){
    selectedContainer = 0;
    if (!this.currentSelection.hasBorder){
      this.currentSelection.rectangle.mesh.material.uniforms.color.value.set("lime");
    }
  }
  this.currentSelection = 0;
  if (!isDeployment){
    guiHandler.afterObjectSelection();
  }
}
