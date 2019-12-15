var VirtualKeyboardCreatorGUIHandler = function(){

}

VirtualKeyboardCreatorGUIHandler.prototype.showGUI = function(){
  guiHandler.datGuiVirtualKeyboardCreation = new dat.GUI({hideable: false});
  guiHandler.datGuiVirtualKeyboardCreation.add(this.configurations, "name").listen();
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
  backgroundFolder.addColor(this.configurations, "backgroundColor").onChange(function(val){
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
  borderFolder.addColor(this.configurations, "borderColor").onChange(function(val){
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
  keyFolder.addColor(this.configurations, "keyBorderColor").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBorderThickness").min(0).max(0.05).step(0.0001).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyHasBackground").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.addColor(this.configurations, "keyBackgroundColor").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBackgroundAlpha").min(0).max(1).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyBackgroundTextureName", this.textureNames).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.addColor(this.configurations, "keyColor").onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyCharMargin").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
  keyFolder.add(this.configurations, "keyCharSize").min(0.1).max(100).step(0.1).onChange(function(val){
    virtualKeyboardCreatorGUIHandler.handleVirtualKeyboardInstance();
  }).listen();
}

VirtualKeyboardCreatorGUIHandler.prototype.init = function(name){
  this.fontNames = Object.keys(fonts);
  this.textureNames = Object.keys(texturePacks);
  this.textureNames.push("");

  this.configurations = {
    name: name,
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
    keyCharMargin: 30,
    keyCharSize: 30,
    refCharSize: 30,
    refCharInnerHeight: window.innerHeight
  };

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
}

VirtualKeyboardCreatorGUIHandler.prototype.show = function(vkName){
  this.commonStartFunctions();
  this.init(vkName);
  this.showGUI(vkName);
}
