var AnimationCreatorGUIHandler = function(){
  this.animationTypesAry = [];
  this.objectAnimationActionsAry = [];
  for (var key in animationHandler.animationTypes){
    this.animationTypesAry.push(animationHandler.animationTypes[key]);
  }
  for (var key in animationHandler.actionTypes.OBJECT){
    this.objectAnimationActionsAry.push(animationHandler.actionTypes.OBJECT[key]);
  }
}

AnimationCreatorGUIHandler.prototype.addAnimationFolder = function(animation){
  var folderConfigurations = {
    "Name": animation.name,
    "Type": animation.type,
    "Action": animation.description.action,
    "Rewind": animation.rewind,
    "Delete": function(){

    }
  }
  var folder = guiHandler.datGuiAnimationCreation.addFolder(animation.name);
  folder.add(folderConfigurations, "Type", this.animationTypesAry);
  folder.add(folderConfigurations, "Action", this.objectAnimationActionsAry);
  folder.add(folderConfigurations, "Rewind");
  this.folderConfigurationsByID[this.folderIDCounter ++] = folderConfigurations;
}

AnimationCreatorGUIHandler.prototype.init = function(object){
  this.folderIDCounter = 0;
  this.folderConfigurationsByID = new Object();
  this.buttonConfigurations = {
    "Done": function(){

    }
  };
  this.newAnimationConfigurations = {
    "Name": "",
    "Add": function(){
      var name = animationCreatorGUIHandler.newAnimationConfigurations["Name"];
      if (!name){
        animationCreatorGUIHandler.handleTerminal(Text.ANIMATION_NAME_MUST_BE_A_NON_EMPTY_STRING);
        return;
      }
      for (var key in animationCreatorGUIHandler.folderConfigurationsByID){
        if (animationCreatorGUIHandler.folderConfigurationsByID[key]["Name"] == name){
          animationCreatorGUIHandler.handleTerminal(Text.ANIMATION_NAME_MUST_BE_UNIQUE);
          return;
        }
      }
      var animation = new Animation(animationCreatorGUIHandler.newAnimationConfigurations["Name"], animationHandler.animationTypes.LINEAR, object, {
        action: animationHandler.actionTypes.OBJECT.TRANSPARENCY
      }, false);
      animationCreatorGUIHandler.addAnimationFolder(animation);
    }
  }
}

AnimationCreatorGUIHandler.prototype.commonStartFunctions = function(){
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

AnimationCreatorGUIHandler.prototype.createGUI = function(object){
  guiHandler.datGuiAnimationCreation = new dat.GUI({hideable: false});
  for (var animationName in object.animations){
    this.addAnimationFolder(object.animations[animationName]);
  }
  var newAnimationFolder = guiHandler.datGuiAnimationCreation.addFolder("Create animation");
  newAnimationFolder.add(this.newAnimationConfigurations, "Name").listen();
  newAnimationFolder.add(this.newAnimationConfigurations, "Add");
  guiHandler.datGuiAnimationCreation.add(this.buttonConfigurations, "Done");
}

AnimationCreatorGUIHandler.prototype.handleTerminal = function(errorMsg, infoMsg){
  terminal.clear();
  terminal.disable();
  if (errorMsg != null){
    terminal.printError(errorMsg);
  }
  if (infoMsg != null){
    terminal.printInfo(infoMsg);
  }
  terminal.printInfo(Text.AFTER_ANIMATION_CREATION);
}

AnimationCreatorGUIHandler.prototype.show = function(object){
  this.init(object);
  this.commonStartFunctions();
  this.createGUI(object);
  this.handleTerminal(null, null);
}
