var AnimationCreatorGUIHandler = function(){
  this.animationTypesAry = [];
  this.objectAnimationActionsAry = [];
  for (var key in animationHandler.animationTypes){
    this.animationTypesAry.push(animationHandler.animationTypes[key]);
  }
}

AnimationCreatorGUIHandler.prototype.update = function(){
  if (!guiHandler.datGuiAnimationCreation){
    return;
  }
  animationHandler.update();
}

AnimationCreatorGUIHandler.prototype.refreshAnimations = function(object){
  for (var key in animationCreatorGUIHandler.folderConfigurationsByID){
    var animation = object.animations[animationCreatorGUIHandler.folderConfigurationsByID[key]["Name"]];
    if (!(typeof animation.initialValue == UNDEFINED)){
      animationHandler.resetAnimation(animation);
    }
    if (animationCreatorGUIHandler.folderConfigurationsByID[key]["Play"]){
      animationHandler.startAnimation(animation);
    }else if (!(typeof animation.initialValue == UNDEFINED)){
      animationHandler.forceFinish(animation);
    }
  }
}

AnimationCreatorGUIHandler.prototype.addAnimationFolder = function(animation, object){
  var folderID = this.folderIDCounter ++;
  var folderConfigurations = {
    "Name": animation.name,
    "Type": animation.type,
    "Action": animation.description.action,
    "Seconds": animation.description.totalTimeInSeconds.toString(),
    "Total delta": animation.description.changeInValue.toString(),
    "Rewind": animation.rewind,
    "Play": true,
    "Delete": function(){
      this.object.removeAnimation(this.animation);
      guiHandler.datGuiAnimationCreation.removeFolder(animationCreatorGUIHandler.foldersByID[this.folderID]);
      delete animationCreatorGUIHandler.foldersByID[this.folderID];
      delete animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
      animationCreatorGUIHandler.refreshAnimations(this.object);
    }.bind({animation: animation, object: object, folderID: folderID})
  }
  var folder = guiHandler.datGuiAnimationCreation.addFolder(animation.name);
  folder.add(folderConfigurations, "Type", this.animationTypesAry).onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], val, confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"]);
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Action", this.objectAnimationActionsAry).onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], val, confs["Seconds"], confs["Total delta"], confs["Rewind"]);
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Seconds").onFinishChange(function(val){
    if (isNaN(val) || (!isNaN(val) && val <= 0)){
      animationCreatorGUIHandler.handleTerminal(Text.INVALID_PARAMETER.replace(Text.PARAM1, "Seconds"), null);
      return;
    }
    val = parseFloat(val);
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], val, confs["Total delta"], confs["Rewind"]);
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Total delta").onFinishChange(function(val){
    if (isNaN(val)){
      animationCreatorGUIHandler.handleTerminal(Text.INVALID_PARAMETER.replace(Text.PARAM1, "Total delta"), null);
      return;
    }
    val = parseFloat(val);
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], val, confs["Rewind"]);
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Rewind").onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], val);
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Play").onChange(function(val){
    animationCreatorGUIHandler.refreshAnimations(this.object);
  }.bind({object: object})).listen();
  folder.add(folderConfigurations, "Delete");
  this.folderConfigurationsByID[folderID] = folderConfigurations;
  this.foldersByID[folderID] = folder;
}

AnimationCreatorGUIHandler.prototype.init = function(object){
  this.objectAnimationActionsAry = [];
  for (var key in animationHandler.actionTypes.OBJECT){
    if (key == "TEXTURE_OFFSET_X" || key == "TEXTURE_OFFSET_Y"){
      if (object.isAddedObject && !object.hasTexture()){
        continue;
      }
      if (object.isObjectGroup && !object.hasTexture){
        continue;
      }
    }
    if (key == "EMISSIVE_INTENSITY" || key == "EMISSIVE_COLOR"){
      if (!object.hasEmissiveMap()){
        continue;
      }
    }
    if (key == "DISPLACEMENT_SCALE" || key == "DISPLACEMENT_BIAS"){
      if (!object.hasDisplacementMap()){
        continue;
      }
    }
    this.objectAnimationActionsAry.push(animationHandler.actionTypes.OBJECT[key]);
  }
  this.folderIDCounter = 0;
  this.folderConfigurationsByID = new Object();
  this.foldersByID = new Object();
  this.buttonConfigurations = {
    "Done": function(){
      animationCreatorGUIHandler.close(object);
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
      var name = animationCreatorGUIHandler.newAnimationConfigurations["Name"];
      var animation = animationCreatorGUIHandler.createAnimation(object, name, animationHandler.animationTypes.LINEAR, animationHandler.actionTypes.OBJECT.TRANSPARENCY, 3, -1, false);
      animationCreatorGUIHandler.addAnimationFolder(animation, object);
      animationCreatorGUIHandler.refreshAnimations(object);
      animationCreatorGUIHandler.newAnimationConfigurations["Name"] = "";
    }
  }
}

AnimationCreatorGUIHandler.prototype.createAnimation = function(object, name, updateType, actionType, totalTimeInSeconds, changeInValue, rewind){
  var animation = new Animation(name, updateType, object, {
    action: actionType,
    totalTimeInSeconds: totalTimeInSeconds,
    changeInValue: changeInValue
  }, rewind);
  if (object.animations[name]){
    animationHandler.purgeAnimation(object.animations[name]);
  }
  object.addAnimation(animation);
  return animation;
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
    this.addAnimationFolder(object.animations[animationName], object);
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

AnimationCreatorGUIHandler.prototype.close = function(object){
  for (var key in animationCreatorGUIHandler.folderConfigurationsByID){
    var animation = object.animations[animationCreatorGUIHandler.folderConfigurationsByID[key]["Name"]];
    if (animationCreatorGUIHandler.folderConfigurationsByID[key]["Play"]){
      animationHandler.forceFinish(animation);
    }
  }
  guiHandler.hideAll();
  if (this.hiddenEngineObjects){
    for (var i = 0; i<this.hiddenEngineObjects.length; i++){
      this.hiddenEngineObjects[i].visible = true;
    }
  }
  object.mesh.position.copy(object.beforeAnimationCreatorGUIHandlerPosition);
  delete object.beforeAnimationCreatorGUIHandlerPosition;
  terminal.clear();
  terminal.enable();
  terminal.printInfo(Text.OK);
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
}

AnimationCreatorGUIHandler.prototype.show = function(object){
  this.init(object);
  this.commonStartFunctions();
  this.createGUI(object);
  this.handleTerminal(null, null);
  object.mesh.visible = true;
  object.beforeAnimationCreatorGUIHandlerPosition = object.mesh.position.clone();
  object.mesh.position.set(0, 0, 0);
  this.refreshAnimations(object);
}
