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

SkyboxCreatorGUIHandler.prototype.init = function(skyboxName){
  this.configurations = {
    "Skybox": "",
    "Cancel": function(){
      if (skyboxCreatorGUIHandler.isLoading){
        return;
      }
      skyboxCreatorGUIHandler.close(Text.OPERATION_CANCELLED);
    },
    "Done": function(){
      if (skyboxCreatorGUIHandler.isLoading){
        return;
      }
      terminal.disable();
      terminal.clear();
      terminal.printInfo(Text.LOADING);
      guiHandler.disableController(skyboxCreatorGUIHandler.skyboxController);
      skyboxCreatorGUIHandler.isLoading = true;
      skyBoxes[skyboxName] = skyboxCreatorGUIHandler.skybox.clone();
      skyBoxes[skyboxName].loadTextures(function(){
        terminal.enable();
        terminal.clear();
        guiHandler.enableController(skyboxCreatorGUIHandler.skyboxController);
        skyboxCreatorGUIHandler.isLoading = false;
        skyboxCreatorGUIHandler.close(Text.SKYBOX_CREATED);
      });
    }
  };
}

SkyboxCreatorGUIHandler.prototype.close = function(message){
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }
  if (this.testMesh){
    scene.remove(this.testMesh);
  }
  this.dispose();
  terminal.clear();
  terminal.enable();
  terminal.printInfo(message);
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
}

SkyboxCreatorGUIHandler.prototype.dispose = function(){
  if (this.testMesh){
    this.testMesh.geometry.dispose();
    this.testMesh.material.dispose();
    this.testMesh = 0;
  }
  if (this.skybox){
    this.skybox.dispose();
    this.skybox = 0;
  }
}

SkyboxCreatorGUIHandler.prototype.loadSkybox = function(skyboxName, dirName){
  terminal.clear();
  terminal.disable();
  terminal.printInfo(Text.LOADING);
  guiHandler.disableController(this.skyboxController);
  this.isLoading = true;
  if (this.testMesh){
    scene.remove(this.testMesh);
  }
  this.dispose();
  this.skybox = new SkyBox(skyboxName, dirName, "#ffffff");
  this.skybox.loadTextures(function(){
    this.testMesh = this.generateSkyboxMesh(this.skybox);
    scene.add(this.testMesh);
    terminal.clear();
    terminal.enable();
    terminal.printInfo(Text.AFTER_SKYBOX_CREATION);
    guiHandler.enableController(this.skyboxController);
    this.isLoading = false;
  }.bind(this));
}

SkyboxCreatorGUIHandler.prototype.show = function(skyboxName, folders){
  this.init(skyboxName);
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
    skyboxCreatorGUIHandler.loadSkybox(skyboxName, val);
  }).listen();
  this.cancelController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Cancel");
  this.doneController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Done");
  this.configurations["Skybox"] = folders[0];
  this.loadSkybox(skyboxName, folders[0]);
}
