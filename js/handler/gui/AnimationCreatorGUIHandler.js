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
  if (animation.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.TEXT_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR || animation.description.action == animationHandler.actionTypes.SPRITE.COLOR){
    targetColorVal = "#" + animation.params.targetColor.getHexString();
  }
  var targetValue = "0";
  if (animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_POSITION_X || animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_POSITION_Y){
    targetValue = ""+animation.params.targetPosition;
  }else if (animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_ROTATION){
    targetValue = ""+animation.params.targetRotation;
  }else if (animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_SCALE_X || animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_SCALE_Y){
    targetValue = ""+animation.params.targetScale
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
    "Target value": targetValue,
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
      delete animationCreatorGUIHandler.targetValueControllersByFolderID[this.folderID];
      animationCreatorGUIHandler.refreshAnimations(this.object);
    }.bind({object: object, folderID: folderID})
  }
  var folder = guiHandler.datGuiAnimationCreation.addFolder(animation.name);
  folder.add(folderConfigurations, "Type", this.animationTypesAry).onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], val, confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"], confs["Target value"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Action", this.objectAnimationActionsAry).onChange(function(val){
    var colorController = animationCreatorGUIHandler.colorControllersByFolderID[this.folderID];
    var deltaController = animationCreatorGUIHandler.deltaControllersByFolderID[this.folderID];
    var targetValueController = animationCreatorGUIHandler.targetValueControllersByFolderID[this.folderID];
    guiHandler.disableController(targetValueController);
    if (val == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || val == animationHandler.actionTypes.TEXT.TEXT_COLOR || val == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR || val == animationHandler.actionTypes.SPRITE.COLOR){
      guiHandler.disableController(deltaController);
      guiHandler.enableController(colorController);
    }else if (val == animationHandler.actionTypes.SPRITE.TARGET_POSITION_X || val == animationHandler.actionTypes.SPRITE.TARGET_POSITION_Y || val == animationHandler.actionTypes.SPRITE.TARGET_ROTATION || val == animationHandler.actionTypes.SPRITE.TARGET_SCALE_X || val == animationHandler.actionTypes.SPRITE.TARGET_SCALE_Y){
      guiHandler.disableController(deltaController);
      guiHandler.enableController(targetValueController);
    }else{
      if (val == animationHandler.actionTypes.TEXT.TYPING){
        guiHandler.disableController(deltaController);
      }else{
        guiHandler.enableController(deltaController);
      }
      guiHandler.disableController(colorController);
    }
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], val, confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"], confs["Target value"]);
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
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], val, confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"], confs["Target value"]);
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
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], val, confs["Rewind"], confs["Target color"], confs["Repeat"], confs["Target value"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  this.deltaControllersByFolderID[folderID] = deltaController;
  var targetValueController = folder.add(folderConfigurations, "Target value").onFinishChange(function(val){
    if (isNaN(val)){
      animationCreatorGUIHandler.handleTerminal(Text.INVALID_PARAMETER.replace(Text.PARAM1, "Target value"), null, object);
      return;
    }
    val = parseFloat(val);
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], confs["Repeat"], val);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  this.targetValueControllersByFolderID[folderID] = targetValueController;
  var colorController = folder.add(folderConfigurations, "Target color").onFinishChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], val, confs["Repeat"], confs["Target value"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  this.colorControllersByFolderID[folderID] = colorController;
  folder.add(folderConfigurations, "Repeat").onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], confs["Rewind"], confs["Target color"], val, confs["Target value"]);
    animationCreatorGUIHandler.animationsByFolderID[this.folderID] = animation;
    animationCreatorGUIHandler.refreshAnimations(this.object);
    animationCreatorGUIHandler.handleTerminal(null, Text.ANIMATION_UPDATED, object);
  }.bind({folderID: folderID, object: object})).listen();
  folder.add(folderConfigurations, "Rewind").onChange(function(val){
    var confs = animationCreatorGUIHandler.folderConfigurationsByID[this.folderID];
    var animation = animationCreatorGUIHandler.createAnimation(object, confs["Name"], confs["Type"], confs["Action"], confs["Seconds"], confs["Total delta"], val, confs["Target color"], confs["Repeat"], confs["Target value"]);
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
  guiHandler.disableController(targetValueController);
  if (animation.description.action == animationHandler.actionTypes.OBJECT.EMISSIVE_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.TEXT_COLOR || animation.description.action == animationHandler.actionTypes.TEXT.BACKGROUND_COLOR || animation.description.action == animationHandler.actionTypes.SPRITE.COLOR){
    guiHandler.disableController(deltaController);
    guiHandler.enableController(colorController);
  }else if (animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_POSITION_X || animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_POSITION_Y || animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_ROTATION || animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_SCALE_X || animation.description.action == animationHandler.actionTypes.SPRITE.TARGET_SCALE_Y){
    guiHandler.disableController(deltaController);
    guiHandler.enableController(targetValueController);
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
      if (key == "DISP_TEXTURE_OFFSET_X" || key == "DISP_TEXTURE_OFFSET_Y"){
        if (!object.isAddedObject || !object.hasDisplacementMap() || !object.customDisplacementTextureMatrixInfo){
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
      if (key == "AO_INTENSITY"){
        if (!object.hasAOMap()){
          continue;
        }
      }
      if (key == "SCALE_X" || key == "SCALE_Y" || key == "SCALE_Z"){
        if (!object.noMass){
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
      if (object.is2D && key == "POSITION_Z"){
        continue;
      }
      this.objectAnimationActionsAry.push(animationHandler.actionTypes.TEXT[key]);
    }
  }else if (object.isSprite){
    for (var key in animationHandler.actionTypes.SPRITE){
      this.objectAnimationActionsAry.push(animationHandler.actionTypes.SPRITE[key]);
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
  this.targetValueControllersByFolderID = new Object();
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
        animation = animationCreatorGUIHandler.createAnimation(object, name, animationHandler.animationTypes.LINEAR, animationHandler.actionTypes.OBJECT.TRANSPARENCY, 3, -1, false, "#ffffff", false, 0);
      }else if (object.isAddedText){
        animation = animationCreatorGUIHandler.createAnimation(object, name, animationHandler.animationTypes.LINEAR, animationHandler.actionTypes.TEXT.TRANSPARENCY, 3, -1, false, "#ffffff", false, 0);
      } else if (object.isSprite){
        animation = animationCreatorGUIHandler.createAnimation(object, name, animationHandler.animationTypes.LINEAR, animationHandler.actionTypes.SPRITE.TRANSPARENCY, 3, -1, false, "#ffffff", false, 0);
      } else {
        throw new Error("Not implemented.");
      }
      animationCreatorGUIHandler.addAnimationFolder(animation, object);
      animationCreatorGUIHandler.refreshAnimations(object);
      animationCreatorGUIHandler.newAnimationConfigurations["Name"] = "";
    }
  }
}

AnimationCreatorGUIHandler.prototype.createAnimation = function(object, name, updateType, actionType, totalTimeInSeconds, changeInValue, rewind, targetColor, repeat, targetValue){
  if (object.animations[name]){
    animationHandler.purgeAnimation(object.animations[name]);
  }
  var animation = new Animation(name, updateType, object, {
    action: actionType,
    totalTimeInSeconds: totalTimeInSeconds,
    changeInValue: changeInValue,
    targetColor: targetColor,
    targetPosition: targetValue,
    targetRotation: targetValue,
    targetScale: targetValue
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
