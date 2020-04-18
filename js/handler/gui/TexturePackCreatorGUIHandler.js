var TexturePackCreatorGUIHandler = function(){
  this.testTypes = ["BOX", "SPHERE", "SURFACE", "CYLINDER"];
  this.mockMaterial = new BasicMaterial({name: "test", color: "#ffffff", alpha: 1});
  this.mockAddedObject = new AddedObject(null, "MOCK");
  this.mockAddedObject.material = this.mockMaterial;
}

TexturePackCreatorGUIHandler.prototype.mockTextureAtlasHandler = function(){
  if (!this.originalBackedUp){
    this.originalTextureMerger = textureAtlasHandler.textureMerger;
    this.originalAtlas = textureAtlasHandler.atlas;
    this.originalBackedUp = true;
  }

  var tpObj = new Object();
  if (this.texturePack.hasDiffuse){
    tpObj[this.texturePack.name + "#diffuse"] = this.texturePack.diffuseTexture;
  }
  if (this.texturePack.hasAlpha){
    tpObj[this.texturePack.name + "#alpha"] = this.texturePack.alphaTexture;
  }
  if (this.texturePack.hasAO){
    tpObj[this.texturePack.name + "#ao"] = this.texturePack.aoTexture;
  }
  if (this.texturePack.hasEmissive){
    tpObj[this.texturePack.name + "#emissive"] = this.texturePack.emissiveTexture;
  }
  if (this.texturePack.hasHeight){
    tpObj[this.texturePack.name + "#height"] = this.texturePack.heightTexture;
  }

  textureAtlasHandler.textureMerger = new TextureMerger(tpObj);
  textureAtlasHandler.atlas = { diffuseTexture: textureAtlasHandler.textureMerger.mergedTexture };
  delete textureAtlasHandler.textureUniformCache;
}

TexturePackCreatorGUIHandler.prototype.init = function(isEdit){
  this.configurations = {
    "Texture pack": "",
    "Test type": "BOX",
    "Done": function(){
      if (texturePackCreatorGUIHandler.isLoading){
        return;
      }
      var tp = texturePackCreatorGUIHandler.texturePack.clone();
      texturePackCreatorGUIHandler.close(Text.TEXTURE_PACK_CREATED, false);
      terminal.disable();
      terminal.clear();
      terminal.printInfo(Text.LOADING);
      texturePacks[tp.name] = tp;
      tp.loadTextures(true, function(){
        terminal.clear();
        terminal.printInfo(Text.GENERATING_TEXTURE_ATLAS);
        textureAtlasHandler.onTexturePackChange(function(){
          terminal.clear();
          terminal.enable();
          if (!isEdit){
            terminal.printInfo(Text.TEXTURE_PACK_CREATED);
          }else{
            terminal.printInfo(Text.TEXTURE_PACK_EDITED);
          }
        }, function(isSizeErr){
          terminal.clear();
          terminal.enable()
          delete texturePacks[tp.name];
          if (!isSizeErr){
            terminal.printError(Text.ERROR_HAPPENED_COMPRESSING_TEXTURE_ATLAS);
          }else{
            terminal.printError(Text.TEXTURE_ATLAS_MAX_ALLOWED_SIZE_EXCEEDED);
          }
        }, true);
      });
    },
    "Cancel": function(){
      if (texturePackCreatorGUIHandler.isLoading){
        return;
      }
      texturePackCreatorGUIHandler.close(Text.OPERATION_CANCELLED, false);
    }
  }
}

TexturePackCreatorGUIHandler.prototype.close = function(message, isError){

  textureAtlasHandler.textureMerger = this.originalTextureMerger;
  textureAtlasHandler.atlas = this.originalAtlas;

  delete this.originalTextureMerger;
  delete this.originalAtlas;
  this.originalBackedUp = false;

  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }
  if (this.testMesh){
    scene.remove(this.testMesh);
    this.disposeTestMesh();
    this.testMesh = 0;
  }
  if (this.texturePack){
    this.texturePack.destroy(true);
    this.texturePack = 0;
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

TexturePackCreatorGUIHandler.prototype.mapTexturePack = function(){
  if (!this.testMesh || !this.texturePack){
    return;
  }
  this.mockAddedObject.mesh = this.testMesh;
  this.mockAddedObject.mapTexturePack(this.texturePack);
}

TexturePackCreatorGUIHandler.prototype.loadTexturePack = function(texturePackName, dirName){
  this.isLoading = true;
  terminal.clear();
  terminal.printInfo(Text.LOADING);
  if (this.testMesh){
    this.testMesh.visible = false;
  }
  guiHandler.disableController(this.texturePackController);
  guiHandler.disableController(this.testTypeController);
  guiHandler.disableController(this.cancelController);
  guiHandler.disableController(this.doneController);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/getTexturePackInfo", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function (){
    if (xhr.readyState == 4 && xhr.status == 200){
      var resp = JSON.parse(xhr.responseText);
      if (texturePackCreatorGUIHandler.texturePack){
        texturePackCreatorGUIHandler.texturePack.destroy();
      }
      texturePackCreatorGUIHandler.texturePack = new TexturePack(texturePackName, dirName, resp);
      texturePackCreatorGUIHandler.texturePack.loadTextures(true, function(){
        texturePackCreatorGUIHandler.mockTextureAtlasHandler();
        terminal.clear();
        terminal.printInfo(Text.AFTER_TEXTURE_PACK_CREATION);
        guiHandler.enableController(texturePackCreatorGUIHandler.texturePackController);
        guiHandler.enableController(texturePackCreatorGUIHandler.testTypeController);
        guiHandler.enableController(texturePackCreatorGUIHandler.cancelController);
        guiHandler.enableController(texturePackCreatorGUIHandler.doneController);
        if (texturePackCreatorGUIHandler.testMesh){
          texturePackCreatorGUIHandler.testMesh.visible = true;
        }
        texturePackCreatorGUIHandler.mapTexturePack();
        texturePackCreatorGUIHandler.isLoading = false;
      });
    }
  }
  xhr.send(JSON.stringify({texturePackName: texturePackCreatorGUIHandler.configurations["Texture pack"]}));
}

TexturePackCreatorGUIHandler.prototype.disposeTestMesh = function(){
  this.testMesh.geometry.dispose();
  if (!(typeof this.testMesh.material.uniforms.diffuseMap == UNDEFINED)){
    this.testMesh.material.uniforms.diffuseMap.value.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.alphaMap == UNDEFINED)){
    this.testMesh.material.uniforms.alphaMap.value.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.aoMap == UNDEFINED)){
    this.testMesh.material.uniforms.aoMap.value.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.emissiveMap == UNDEFINED)){
    this.testMesh.material.uniforms.emissiveMap.value.dispose();
  }
  if (!(typeof this.testMesh.material.uniforms.displacementMap == UNDEFINED)){
    this.testMesh.material.uniforms.displacementMap.value.dispose();
  }
  this.testMesh.material.dispose();
}

TexturePackCreatorGUIHandler.prototype.handleTestMesh = function(){
  if (this.testMesh){
    scene.remove(this.testMesh);
    this.disposeTestMesh();
    this.testMesh = 0;
  }
  var geometry;
  switch(this.configurations["Test type"]){
    case "BOX": geometry = new THREE.BoxBufferGeometry(50, 50, 50); break;
    case "SPHERE": geometry = new THREE.SphereBufferGeometry(25); break;
    case "SURFACE": geometry = new THREE.PlaneBufferGeometry(50, 50); break;
    case "CYLINDER": geometry = new THREE.CylinderBufferGeometry(25, 25, 20); break;
    default: throw new Error("Type not supported."); break;
  }
  this.testMesh = new MeshGenerator(geometry, this.mockMaterial).generateMesh();
  scene.add(this.testMesh);
  if (this.texturePack){
    this.mapTexturePack();
  }
}

TexturePackCreatorGUIHandler.prototype.commonStartFunctions = function(){
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

TexturePackCreatorGUIHandler.prototype.createGUI = function(texturePackName, folders){
  guiHandler.datGuiTexturePack = new dat.GUI({hideable: false});
  this.texturePackController = guiHandler.datGuiTexturePack.add(this.configurations, "Texture pack", folders).onChange(function(val){
    texturePackCreatorGUIHandler.loadTexturePack(texturePackName, val);
  }).listen();
  this.testTypeController = guiHandler.datGuiTexturePack.add(this.configurations, "Test type", this.testTypes).onChange(function(val){
    texturePackCreatorGUIHandler.handleTestMesh();
  }).listen();
  this.cancelController = guiHandler.datGuiTexturePack.add(this.configurations, "Cancel");
  this.doneController = guiHandler.datGuiTexturePack.add(this.configurations, "Done");
}

TexturePackCreatorGUIHandler.prototype.show = function(texturePackName, folders){
  this.init(false);
  this.commonStartFunctions();
  this.createGUI(texturePackName, folders);
  this.configurations["Texture pack"] = folders[0];
  this.handleTestMesh();
  this.loadTexturePack(texturePackName, folders[0]);
}

TexturePackCreatorGUIHandler.prototype.edit = function(texturePack, folders){
  this.init(true);
  this.commonStartFunctions();
  this.createGUI(texturePack.name, folders);
  this.configurations["Texture pack"] = texturePack.directoryName;
  this.handleTestMesh();
  this.loadTexturePack(texturePack.name, texturePack.directoryName);
  this.originalDirectoryName = this.configurations["Texture pack"];
}
