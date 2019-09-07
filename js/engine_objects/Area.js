var Area = function(name, boundingBox, color, gridSize){
  this.name = name;
  this.boundingBox = boundingBox;
  this.color = color;
  this.center = new THREE.Vector3();
  this.boundingBox.getCenter(this.center);
  this.gridSize = gridSize;
}

Area.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.bbMinX = this.boundingBox.min.x;
  exportObject.bbMinY = this.boundingBox.min.y;
  exportObject.bbMinZ = this.boundingBox.min.z;
  exportObject.bbMaxX = this.boundingBox.max.x;
  exportObject.bbMaxY = this.boundingBox.max.y;
  exportObject.bbMaxZ = this.boundingBox.max.z;
  exportObject.color = this.color;
  exportObject.gridSize = this.gridSize;
  return exportObject;
}

Area.prototype.destroy = function(){
  if (this.helper){
    if (areasVisible){
      scene.remove(this.helper);
    }
    this.helper.geometry.dispose();
    this.helper.material.dispose();
  }
  if (this.text){
    if (areasVisible){
      scene.remove(this.text.mesh);
    }
    this.text.mesh.geometry.dispose();
    this.text.mesh.material.dispose();
  }
  sceneHandler.getAreaBinHandler().deleteObjectFromBin(this.binInfo, this.name);
  for (var objName in addedObjects){
    if (addedObjects[objName].areaVisibilityConfigurations){
      if (!(typeof addedObjects[objName].areaVisibilityConfigurations[this.name] == UNDEFINED)){
        delete addedObjects[objName].areaVisibilityConfigurations[this.name];
      }
      if (addedObjects[objName].areaSideConfigurations){
        if (!(typeof addedObjects[objName].areaSideConfigurations[this.name] == UNDEFINED)){
          delete addedObjects[objName].areaSideConfigurations[this.name];
        }
      }
    }
  }
  for (var objName in objectGroups){
    if (objectGroups[objName].areaVisibilityConfigurations){
      if (!(typeof objectGroups[objName].areaVisibilityConfigurations[this.name] == UNDEFINED)){
        delete objectGroups[objName].areaVisibilityConfigurations[this.name];
      }
    }
    if (objectGroups[objName].areaSideConfigurations){
      if (!(typeof objectGroups[objName].areaSideConfigurations[this.name] == UNDEFINED)){
        delete objectGroups[objName].areaSideConfigurations[this.name];
      }
    }
  }
}

Area.prototype.renderToScreen = function(){
  if (isDeployment){
    return;
  }
  if (!this.helper){
    var color = new THREE.Color(this.color);
    this.helper = new THREE.Box3Helper(this.boundingBox, color);
  }
  if(!this.text){
    this.text = new AddedText(null, defaultFont, this.name, this.center, color, 1, 15);
    this.text.isEditorHelper = true;
    this.text.setMarginBetweenChars(7);
    this.text.refInnerHeight = 569;
    this.text.refCharSize = 15;
    this.text.handleResize();
  }else{
    scene.add(this.text.mesh);
  }
  scene.add(this.helper);
}

Area.prototype.hide = function(){
  if (this.helper){
    scene.remove(this.helper);
  }
  if (this.text){
    scene.remove(this.text.mesh);
  }
}
