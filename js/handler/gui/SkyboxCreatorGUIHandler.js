var SkyboxCreatorGUIHandler = function(){

}

SkyboxCreatorGUIHandler.prototype.generateSkyboxMesh = function(skybox){
  var geomKey = ("BoxBufferGeometry" + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE + "1" + PIPE + "1" + PIPE + "1");
  var skyboxBufferGeometry = geometryCache[geomKey];
  if (!skyboxBufferGeometry){
    skyboxBufferGeometry = new THREE.BoxBufferGeometry(skyboxDistance, skyboxDistance, skyboxDistance);
    geometryCache[geomKey] = skyboxBufferGeometry;
  }
  return new MeshGenerator(skyboxBufferGeometry, null).generateSkybox(skybox, true);
}

SkyboxCreatorGUIHandler.prototype.init = function(skyboxName, isEdit){
  this.configurations = {
    "Skybox": "",
    "Color": "#ffffff",
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
      guiHandler.disableController(skyboxCreatorGUIHandler.colorController);
      skyboxCreatorGUIHandler.isLoading = true;
      skyBoxes[skyboxName] = skyboxCreatorGUIHandler.skybox.clone();
      skyBoxes[skyboxName].loadTextures(function(){
        terminal.enable();
        terminal.clear();
        guiHandler.enableController(skyboxCreatorGUIHandler.skyboxController);
        guiHandler.enableController(skyboxCreatorGUIHandler.colorController);
        skyboxCreatorGUIHandler.isLoading = false;
        if (!isEdit){
          skyboxCreatorGUIHandler.close(Text.SKYBOX_CREATED);
        }else{
          skyboxCreatorGUIHandler.close(Text.SKYBOX_EDITED);
          if (skyboxHandler.isVisible() && skyboxHandler.getMappedSkyboxName() == skyboxName){
            skyboxHandler.map(skyBoxes[skyboxName]);
          }
        }
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
  guiHandler.disableController(this.colorController);
  this.isLoading = true;
  if (this.testMesh){
    scene.remove(this.testMesh);
  }
  this.dispose();
  this.skybox = new SkyBox(skyboxName, dirName, this.configurations["Color"]);
  this.skybox.loadTextures(function(){
    this.testMesh = this.generateSkyboxMesh(this.skybox);
    scene.add(this.testMesh);
    terminal.clear();
    terminal.enable();
    terminal.printInfo(Text.AFTER_SKYBOX_CREATION);
    guiHandler.enableController(this.skyboxController);
    guiHandler.enableController(this.colorController);
    this.isLoading = false;
  }.bind(this));
}

SkyboxCreatorGUIHandler.prototype.commonStartFunctions = function(skyboxName, isEdit){
  this.init(skyboxName, isEdit);
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
}

SkyboxCreatorGUIHandler.prototype.createGUI = function(skyboxName, folders){
  guiHandler.datGuiSkyboxCreation = new dat.GUI({hideable: false});
  this.skyboxController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Skybox", folders).onChange(function(val){
    skyboxCreatorGUIHandler.loadSkybox(skyboxName, val);
  }).listen();
  this.colorController = guiHandler.datGuiSkyboxCreation.addColor(this.configurations, "Color").onChange(function(val){
    skyboxCreatorGUIHandler.testMesh.material.uniforms.color.value.set(val);
    skyboxCreatorGUIHandler.skybox.color = val;
  }).listen();
  this.cancelController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Cancel");
  this.doneController = guiHandler.datGuiSkyboxCreation.add(this.configurations, "Done");
}

SkyboxCreatorGUIHandler.prototype.show = function(skyboxName, folders){
  this.commonStartFunctions(skyboxName, false);
  this.createGUI(skyboxName, folders);
  this.configurations["Skybox"] = folders[0];
  this.loadSkybox(skyboxName, folders[0]);
}

SkyboxCreatorGUIHandler.prototype.edit = function(skybox, folders){
  this.commonStartFunctions(skybox.name, true);
  this.createGUI(skybox.name, folders);
  this.configurations["Skybox"] = skybox.directoryName;
  this.configurations["Color"] = skybox.color;
  this.loadSkybox(skybox.name, skybox.directoryName);
}
