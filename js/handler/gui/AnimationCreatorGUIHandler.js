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
  for (var key in object.animations){
    if (!(typeof object.animations[key].initialValue == UNDEFINED)){
      animationHandler.resetAnimation(object.animations[key]);
    }
  }
  for (var key in animationCreatorGUIHandler.folderConfigurationsByID){
    var animation = object.animations[animationCreatorGUIHandler.folderConfigurationsByID[key]["Name"]];
    animationHandler.assignInitialValue(animation);
    animationHandler.resetAnimation(animation);
    if (animationCreatorGUIHandler.folderConfigurationsByID[key]["Play"]){
      animationHandler.startAnimation(animation);
    }else{
      animationHandler.forceFinish(animation);
    }
  }
}

AnimationCreatorGUIHandler.prototype.addAnimationFolder = function(animation, object){
  var targetColorVal = "#ffffff";
  if (animation.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.TEXT_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR){
    targetColorVal = "#" + animation.params.targetColor.getHexString();
  }
  var folderID = this.folderIDCounter ++;
  this.animationsByFolderID[folderID] = animation;
  var folderConfigurations = {
    "Name": animation.name,
    "Type": animation.type,
    "Action": animation.description.action,
    "Seconds": animation.description.totalTimeInSeconds.toString(),
    "Total delta": animation.description.changeInValue.toString(),
    "Target color": targetColorVal,
    "Rewind": animation.rewind,
    "Repeat": animation.repeat,
    "Play": true,
    "Delete": function(){
      var anim = animationCreatorGUIHandler.animationsByFolderID[this.folderID];
      animationHandler.purgeAnimation(anim);
      this.object.removeAnimation(anim);
      guiHandler.datGuiAnimationCreation.removeFolder(animationCreatorGUIHandler.foldersByID[this.folderID]);
      delete animationCreatorGUIHandler.foldersByID[this.folderID];
      delete animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
      delete animationCreatorGUIHandler.animationsByFolderID[this.folderID];
      delete animationCreatorGUIHandler.deltaControllersByFolderID[this.folderID];
      delete animationCreatorGUIHandler.colorControllersByFolderID[this.folderID];
      animationCreatorGUIHandler.refreshAnimations(this.object);
    }.bind({object: object, folderID: folderID})
  }
  var folder = guiHandler.datGuiAnimationCreation.addFolder(animation.name);
  folder.add(folderConfigurations, "Type", this.animationTypesAry).onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], val, confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Action", this.objectAnimationActionsAry).onChange(function(val){
    var colorController = animationCreatorGUIHandler.colorControllersByFolderID[this.folderID];
    var deltaController = animationCreatorGUIHandler.deltaControllersByFolderID[this.folderID];
    if (val == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || val == animationHandler.actionTypes.TEXT.TEXT_COLOR || val == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR){
      guiHandler.disableController(deltaController);
      guiHandler.enableController(colorController);
    }else{
      if (val == animationHandler.actionTypes.TEXT.TYPING){
        guiHandler.disableController(deltaController);
      }else{
        guiHandler.enableController(deltaController);
      }
      guiHandler.disableController(colorController);
    }
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], val, confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Seconds").onFinishChange(function(val){
    if (isNaN(val) || (!isNaN(val) && val <= 0)){
      animationCreatorGUIHandler.handleTerminal(Text.INVALID_PARAMETER.replace(Text.PARAM1, "Seconds"), null, object);
      return;
    }
    val = parseFloat(val);
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], val, confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  var deltaController = folder.add(folderConfigurations, "Total delta").onFinishChange(function(val){
    if (isNaN(val)){
      animationCreatorGUIHandler.handleTerminal(Text.INVALID_PARAMETER.replace(Text.PARAM1, "Total delta"), null, object);
      return;
    }
    val = parseFloat(val);
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], val, confs["Rewind"], confs["Target color"], confs["Repeat"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  this.deltaControllersByFolderID[folderID] = deltaController;
  var colorController = folder.addColor(folderConfigurations, "Target color").onFinishChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], val, confs["Repeat"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  this.colorControllersByFolderID[folderID] = colorController;
  folder.add(folderConfigurations, "Repeat").onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], val);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Rewind").onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], val, confs["Target color"], confs["Repeat"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Play").onChange(function(val){
    animationCreatorGUIHandler.refreshAnimations(this.object);
  }.bind({object: object})).listen();
  folder.add(folderConfigurations, "Delete");
  this.folderConfigurationsByID[folderID] = folderConfigurations;
  this.foldersByID[folderID] = folder;
  if (animation.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.TEXT_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR){
    guiHandler.disableController(deltaController);
    guiHandler.enableController(colorController);
  }else{
    if (animation.description.action == animationHandler.actionTypes.TEXT.TYPING){
      guiHandler.disableController(deltaController);
    }else{
      guiHandler.enableController(deltaController);
    }
    guiHandler.disableController(colorController);
  }
}

AnimationCreatorGUIHandler.prototype.init = function(object){
  this.objectAnimationActionsAry = [];
  if (object.isAddedObject || object.isObjectGroup){
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
  }else if (object.isAddedText){
    for (var key in animationHandler.actionTypes.TEXT){
      if (!object.hasBackground && key == "BACKGROUND_COLOR"){
        continue;
      }
      this.objectAnimationActionsAry.push(animationHandler.actionTypes.TEXT[key]);
    }
  }else{
    throw new Error("Not implemented.");
  }
  this.folderIDCounter = 0;
  this.folderConfigurationsByID = new Object();
  this.foldersByID = new Object();
  this.animationsByFolderID = new Object();
  this.deltaControllersByFolderID = new Object();
  this.colorControllersByFolderID = new Object();
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
        animationCreatorGUIHandler.handleTerminal(Text.ANIMATION_NAME_MUST_BE_A_NON_EMPTY_STRING, null, object);
        return;
      }
      for (var key in animationCreatorGUIHandler.folderConfigurationsByID){
        if (animationCreatorGUIHandler.folderConfigurationsByID[key]["Name"] == name){
          animationCreatorGUIHandler.handleTerminal(Text.ANIMATION_NAME_MUST_BE_UNIQUE, null, object);
          return;
        }
      }
      var name = animationCreatorGUIHandler.newAnimationConfigurations["Name"];
      var animation;
      if (object.isAddedObject || object.isObjectGroup){
        animation = animationCreatorGUIHandler.createAnimation(object, name, animationHandler.animationTypes.LINEAR, animationHandler.actionTypes.OBJECT.TRANSPARENCY, 3, -1, false, "#ffffff", false);
      }else{
        animation = animationCreatorGUIHandler.createAnimation(object, name, animationHandler.animationTypes.LINEAR, animationHandler.actionTypes.TEXT.TRANSPARENCY, 3, -1, false, "#ffffff", false);
      }
      animationCreatorGUIHandler.addAnimationFolder(animation, object);
      animationCreatorGUIHandler.refreshAnimations(object);
      animationCreatorGUIHandler.newAnimationConfigurations["Name"] = "";
    }
  }
}

AnimationCreatorGUIHandler.prototype.createAnimation = function(object, name, updateType, actionType, totalTimeInSeconds, changeInValue, rewind, targetColor, repeat){
  if (object.animations[name]){
    animationHandler.purgeAnimation(object.animations[name]);
  }
  var animation = new Animation(name, updateType, object, {
    action: actionType,
    totalTimeInSeconds: totalTimeInSeconds,
    changeInValue: changeInValue,
    targetColor: targetColor
  }, rewind, repeat);
  object.addAnimation(animation);
  return animation;
}

AnimationCreatorGUIHandler.prototype.commonStartFunctions = function(object){
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
  if (!object.isFPSWeapon){
    activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  }else{
    activeControl = new CustomControls({});
  }
  activeControl.onActivated();
}

AnimationCreatorGUIHandler.prototype.createGUI = function(object){
  guiHandler.datGuiAnimationCreation = new dat.GUI({hideable: false});
  guiHandler.datGuiAnimationCreation.domElement.addEventListener("mousedown", function(e){
    acGUIFocused = true;
  });
  for (var animationName in object.animations){
    this.addAnimationFolder(object.animations[animationName], object);
  }
  var newAnimationFolder = guiHandler.datGuiAnimationCreation.addFolder("Create animation");
  newAnimationFolder.add(this.newAnimationConfigurations, "Name").listen();
  newAnimationFolder.add(this.newAnimationConfigurations, "Add");
  guiHandler.datGuiAnimationCreation.add(this.buttonConfigurations, "Done");
}

AnimationCreatorGUIHandler.prototype.handleTerminal = function(errorMsg, infoMsg, object){
  terminal.clear();
  terminal.disable();
  if (errorMsg != null){
    terminal.printError(errorMsg);
  }
  if (infoMsg != null){
    terminal.printInfo(infoMsg);
  }
  if (!object.isFPSWeapon){
    terminal.printInfo(Text.AFTER_ANIMATION_CREATION);
  }else{
    terminal.printInfo(Text.AFTER_ANIMATION_CREATION_FPS_WEAPON);
  }
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
  if (!object.isFPSWeapon){
    object.mesh.position.copy(object.beforeAnimationCreatorGUIHandlerPosition);
    delete object.beforeAnimationCreatorGUIHandlerPosition;
  }else{
    object.revertPositionAfterFPSWeaponConfigurations();
  }
  terminal.clear();
  terminal.enable();
  terminal.printInfo(Text.OK);
  activeControl = new FreeControls({});
  activeControl.onActivated();
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
}

AnimationCreatorGUIHandler.prototype.show = function(object){
  if (object.isFPSWeapon){
    object.quaternionBeforeFPSWeaponConfigurationPanelOpened = object.mesh.quaternion.clone();
    object.onFPSWeaponAlignmentUpdate();
  }
  for (var animationName in object.animations){
    animationHandler.assignInitialValue(object.animations[animationName]);
  }
  this.init(object);
  this.commonStartFunctions(object);
  this.createGUI(object);
  this.handleTerminal(null, null, object);
  object.mesh.visible = true;
  if (!object.isFPSWeapon){
    object.beforeAnimationCreatorGUIHandlerPosition = object.mesh.position.clone();
    object.mesh.position.set(0, 0, 0);
  }else{
    camera.quaternion.set(0, 0, 0, 1);
  }
  this.refreshAnimations(object);
}
