var SkyboxCreatorGUIHandler = function(){

}

SkyboxCreatorGUIHandler.prototype.generateSkyboxMesh = function(skybox){
  var geomKey = (
    "BoxBufferGeometry" + PIPE +
    skyboxDistance + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE +
    "1" + PIPE + "1" + PIPE + "1"
  );
  var skyboxBufferGeometry = geometryCache[geomKey];
  if (!skyboxBufferGeometry){
    skyboxBufferGeometry = new THREE.BoxBufferGeometry(skyboxDistance, skyboxDistance, skyboxDistance);
    geometryCache[geomKey] = skyboxBufferGeometry;
  }
  return new MeshGenerator(skyboxBufferGeometry, null).generateSkybox(skybox);
}

SkyboxCreatorGUIHandler.prototype.init = function(){
  this.configurations = {
    "Skybox": "",
    "Cancel": function(){

    },
    "Done": function(){

    }
  };
}

SkyboxCreatorGUIHandler.prototype.show = function(skyboxName, folders){
  this.init();
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
  guiHandler.datGuiSkyboxCreation = new dat.GUI({hideable: false});
  this.skyboxController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Skybox", folders).onChange(function(val){

  }).listen();
  this.cancelController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Cancel");
  this.doneController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Done");
  this.configurations["Skybox"] = folders[0];
}
