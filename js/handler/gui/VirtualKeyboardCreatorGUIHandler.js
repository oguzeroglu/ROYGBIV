var VirtualKeyboardCreatorGUIHandler = function(){

}

VirtualKeyboardCreatorGUIHandler.prototype.update = function(){
  if (this.virtualKeyboard){
    this.virtualKeyboard.update();
  }
}

VirtualKeyboardCreatorGUIHandler.prototype.onMouseMove = function(clientX, clientY){
  if (!this.virtualKeyboard){
    return;
  }
  this.objectPicker2D.find(clientX, clientY);
  if (intersectionPoint){
    this.virtualKeyboard.onMouseMoveIntersection(intersectionObject);
  }else{
    this.virtualKeyboard.onMouseMoveIntersection(null);
  }
}

VirtualKeyboardCreatorGUIHandler.prototype.onClick = function(clientX, clientY){
  if (!this.virtualKeyboard){
    return;
  }
  this.objectPicker2D.find(clientX, clientY);
  if (intersectionPoint){
    this.virtualKeyboard.onMouseDownIntersection(intersectionObject);
  }
}

VirtualKeyboardCreatorGUIHandler.prototype.showGUI = function(){
  guiHandler.datGuiVirtualKeyboardCreation = new dat.GUI({hideable: false});
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "name").listen();
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "maxLength").min(1).max(100).step(1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "positionXPercent").min(0).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "positionYPercent").min(0).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "fontName", this.fontNames).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "totalWidthPercent").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "totalHeightPercent").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  var backgroundFolder = guiHandler.datGuiVirtualKeyboardCreation.addFolder("background");
  backgroundFolder.add(this.configurations, "hasBackground").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  backgroundFolder.add(this.configurations, "backgroundColor").onFinishChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  backgroundFolder.add(this.configurations, "backgroundAlpha").min(0).max(1).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  backgroundFolder.add(this.configurations, "backgroundTextureName", this.textureNames).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  var borderFolder = guiHandler.datGuiVirtualKeyboardCreation.addFolder("border");
  borderFolder.add(this.configurations, "hasBorder").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  borderFolder.add(this.configurations, "borderThickness").min(0).max(0.05).step(0.0001).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  borderFolder.add(this.configurations, "borderColor").onFinishChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  var keyFolder = guiHandler.datGuiVirtualKeyboardCreation.addFolder("key");
  keyFolder.add(this.configurations, "keyWidthPercent").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyHeightPercent").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyHasBorder").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBorderColor").onFinishChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBorderThickness").min(0).max(0.05).step(0.0001).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyHasBackground").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBackgroundColor").onFinishChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBackgroundAlpha").min(0).max(1).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBackgroundTextureName", this.textureNames).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyColor").onFinishChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyInteractionColor").onFinishChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyCharMargin").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyCharSize").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  guiHandler.datGuiVirtualKeyboardCreation.add({
    "Done": function(){
      var name = virtualKeyboardCreatorGUIHandler.virtualKeyboard.name;
      var params = virtualKeyboardCreatorGUIHandler.virtualKeyboard.parameters;
      var isCreation = !virtualKeyboards[name];
      var text = isCreation? Text.VIRTUAL_KEYBOARD_CREATED: Text.VIRTUAL_KEYBOARD_EDITED;
      virtualKeyboardCreatorGUIHandler.onClose(text);
      if (virtualKeyboards[name]){
        virtualKeyboards[name].destroy();
      }
      virtualKeyboards[name] = new VirtualKeyboard(params);
      sceneHandler.onVirtualKeyboardCreation(virtualKeyboards[name]);
    }
  }, "Done").listen();
  guiHandler.datGuiVirtualKeyboardCreation.add({
    "Cancel": function(){
      virtualKeyboardCreatorGUIHandler.onClose(Text.OPERATION_CANCELLED);
    }
  }, "Cancel").listen();
}

VirtualKeyboardCreatorGUIHandler.prototype.init = function(name){
  this.fontNames = Object.keys(fonts);
  this.textureNames = Object.keys(texturePacks);
  this.textureNames.push("");

  if (virtualKeyboards[name]){
    this.configurations = JSON.parse(JSON.stringify(virtualKeyboards[name].parameters));
    this.configurations.refCharInnerHeight = window.innerHeight;
  }else{
    this.configurations = {
      name: name,
      maxLength: 10,
      positionXPercent: 50,
      positionYPercent: 50,
      fontName: this.fontNames[0],
      totalWidthPercent: 30,
      totalHeightPercent: 40,
      hasBackground: false,
      backgroundColor: "#000000",
      backgroundAlpha: 1,
      backgroundTextureName: "",
      hasBorder: true,
      borderThickness: 0.01,
      borderColor: "#bfff00",
      keyWidthPercent: 7,
      keyHeightPercent: 17,
      keyHasBorder: true,
      keyBorderColor: "#bfff00",
      keyBorderThickness: 0.003,
      keyHasBackground: false,
      keyBackgroundColor: "#000000",
      keyBackgroundAlpha: 1,
      keyBackgroundTextureName: "",
      keyColor: "#bfff00",
      keyInteractionColor: "#ff0000",
      keyCharMargin: 30,
      keyCharSize: 30,
      refCharSize: 30,
      refCharInnerHeight: window.innerHeight
    };
  }
  this.handleVirtualKeyboardInstance();
}

VirtualKeyboardCreatorGUIHandler.prototype.commonStartFunctions = function(){
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
  activeControl = new CustomControls({});
  activeControl.onActivated();
}

VirtualKeyboardCreatorGUIHandler.prototype.handleVirtualKeyboardInstance = function(){
  if (this.virtualKeyboard){
    this.virtualKeyboard.destroy();
  }
  this.configurations.refCharSize = this.configurations.keyCharSize;
  this.configurations.refCharInnerHeight = window.innerHeight;
  this.virtualKeyboard = new VirtualKeyboard(this.configurations);
  this.objectPicker2D = new ObjectPicker2D();
  this.objectPicker2D.binHandler.insertVirtualKeyboard(this.virtualKeyboard);
}

VirtualKeyboardCreatorGUIHandler.prototype.onClose = function(text){
  terminal.enable();
  terminal.clear();
  terminal.printInfo(text);
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  if (this.virtualKeyboard){
    this.virtualKeyboard.destroy();
    delete this.virtualKeyboard;
  }
}

VirtualKeyboardCreatorGUIHandler.prototype.show = function(vkName){
  this.commonStartFunctions();
  this.init(vkName);
  this.showGUI(vkName);
  terminal.disable();
  terminal.printInfo(Text.AFTER_VIRTUAL_KEYBOARD_CREATION);
}
