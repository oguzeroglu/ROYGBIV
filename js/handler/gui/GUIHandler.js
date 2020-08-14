var GUIHandler = function(){
  this.objectManipulationParameters = {
    "Object": "objectName",
    "Rotate x": "0",
    "Rotate y": "0",
    "Rotate z": "0",
    "Rotation mode": rotationModes.WORLD,
    "Mass": 0.0,
    "Phy. simpl.": false,
    "Slippery": false,
    "Changeable": false,
    "Intersectable": false,
    "Colorizable": false,
    "Affected by light": false,
    "Has mass": true,
    "Shader precision": "default",
    "FPS Weapon": false,
    "Side": "Both",
    "Hide half": "None",
    "Blending": "None",
    "Texture offset x": 0.0,
    "Texture offset y": 0.0,
    "Texture repeat x": 1,
    "Texture repeat y": 1,
    "Has custom disp. matrix": false,
    "Disp. texture offset x": 0.0,
    "Disp. texture offset y": 0.0,
    "Disp. texture repeat x": 1,
    "Disp. texture repeat y": 1,
    "Opacity": 1.0,
    "AO intensity": 0.0,
    "Emissive int.": 0.0,
    "Emissive col.": "#ffffff",
    "Disp. scale": 0.0,
    "Disp. bias": 0.0,
    "Motion blur": false,
    "mb alpha": 1.0,
    "mb time": OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT,
    "AI entity": false,
    "Steerable": false,
    "Steering mode": "Track position",
    "Max acceleration": "100",
    "Max speed": "100",
    "Jump speed": "500",
    "Look speed": 0.1
  };
  this.textManipulationParameters = {
    "Text": "textName",
    "Content": "",
    "Text color": "#ffffff",
    "Alpha": 0.0,
    "Has bg": false,
    "Bg color": "#ffffff",
    "Bg alpha": 0.0,
    "Char size": 0.0,
    "Char margin": 0.0,
    "Line margin": 0.0,
    "Clickable": false,
    "Shader precision": "default",
    "Aff. by fog": false,
    "is 2D": false,
    "Margin mode": "Top/Left",
    "Margin X": 50.0,
    "Margin Y": 50.0,
    "Max width%": 100,
    "Max height%": 100
  };
  this.spriteManipulationParameters = {
    "Sprite": "spriteName",
    "Color": "#ffffff",
    "Alpha": 1.0,
    "Margin mode": "Center",
    "Margin X": 50.0,
    "Margin Y": 50.0,
    "Has texture": false,
    "Texture": "",
    "Scale X": 1.0,
    "Scale Y": 1.0,
    "Width fixed": false,
    "Height fixed": false,
    "Width %": 50,
    "Height %": 50,
    "Rotation": 0.0,
    "Clickable": false,
    "Draggable": false,
    "Crop X": 0.01,
    "Crop Y": 0.01
  };
  this.containerManipulationParameters = {
    "Container": "containerName",
    "Center X": 50,
    "Center Y": 50,
    "Width": 10,
    "Height": 10,
    "Padding X": 0,
    "Padding Y": 0,
    "Square": false,
    "Clickable": false,
    "Has border": false,
    "Border color": "#ffffff",
    "Border thickness": 0.005,
    "Has background": false,
    "BG color": "#ffffff",
    "BG alpha": 1,
    "Has BG texture": false,
    "BG texture": ""
  };
  this.bloomParameters = {
    "Threshold": 0.0,
    "Active": false,
    "Strength": 0.0,
    "Exposure": 0.0,
    "Gamma": 0.0,
    "BlurStepAmount": 0,
    "BlurPass1": {"Factor": 0.0, "Color": "#ffffff", "Quality": "high"},
    "BlurPass2": {"Factor": 0.0, "Color": "#ffffff", "Quality": "high"},
    "BlurPass3": {"Factor": 0.0, "Color": "#ffffff", "Quality": "high"},
    "BlurPass4": {"Factor": 0.0, "Color": "#ffffff", "Quality": "high"},
    "BlurPass5": {"Factor": 0.0, "Color": "#ffffff", "Quality": "high"},
    "Done": function(){
      terminal.clear();
      parseCommand("postProcessing bloom hide");
    }
  };
  this.shaderPrecisionParameters = {
    "Crosshair": "low",
    "Basic material": "low",
    "Instanced basic material": "low",
    "Merged basic material": "low",
    "Object trail": "low",
    "Particle": "low",
    "Skybox": "low",
    "Text": "low",
    "Lightning": "low",
    "Sprite": "low",
    "Done": function(){
      guiHandler.hide(guiHandler.guiTypes.SHADER_PRECISION);
      terminal.clear();
      terminal.printInfo(Text.DONE);
      terminal.enable();
    }
  };
  this.workerStatusParameters = {
    "Raycaster": "ON",
    "Physics": "ON",
    "Lightning": "ON",
    "Done": function(){
      terminal.clear();
      parseCommand("workerConfigurations hide");
    }
  }
  this.guiTypes = {
    TEXT: 0, OBJECT: 1, BLOOM: 2, FPS_WEAPON_ALIGNMENT: 3, SHADER_PRECISION: 4, PARTICLE_SYSTEM: 5,
    WORKER_STATUS: 6, MUZZLE_FLASH: 7, TEXTURE_PACK: 8, SKYBOX_CREATION: 9, FOG: 10, FONT: 11,
    CROSSHAIR_CREATION: 12, SCRIPTS: 13, ANIMATION_CREATION: 14, AREA: 15, LIGHTNING: 16, SPRITE: 17,
    CONTAINER: 18, VIRTUAL_KEYBOARD_CREATION: 19, LIGHTS: 20, GRAPH_CREATOR: 21, STEERING_BEHAVIOR_CREATION: 22,
    JUMP_DESCRIPTOR_CREATION: 23
  };
  this.blockingGUITypes = [
    this.guiTypes.FPS_WEAPON_ALIGNMENT, this.guiTypes.PARTICLE_SYSTEM, this.guiTypes.MUZZLE_FLASH,
    this.guiTypes.TEXTURE_PACK, this.guiTypes.SKYBOX_CREATION, this.guiTypes.FOG, this.guiTypes.FONT,
    this.guiTypes.CROSSHAIR_CREATION, this.guiTypes.SCRIPTS, this.guiTypes.ANIMATION_CREATION,
    this.guiTypes.LIGHTNING, this.guiTypes.VIRTUAL_KEYBOARD_CREATION, this.guiTypes.GRAPH_CREATOR,
    this.guiTypes.STEERING_BEHAVIOR_CREATION, this.guiTypes.JUMP_DESCRIPTOR_CREATION
  ];
}

GUIHandler.prototype.isOneOfBlockingGUIActive = function(){
  for (var i = 0; i<this.blockingGUITypes.length; i++){
    switch (this.blockingGUITypes[i]){
      case this.guiTypes.FPS_WEAPON_ALIGNMENT:
        if (this.datGuiFPSWeaponAlignment){
          return true;
        }
      break;
      case this.guiTypes.PARTICLE_SYSTEM:
        if (this.datGuiPSCreator){
          return true;
        }
      break;
      case this.guiTypes.MUZZLE_FLASH:
        if (this.datGuiMuzzleFlashCreator){
          return true;
        }
      break;
      case this.guiTypes.TEXTURE_PACK:
        if (this.datGuiTexturePack){
          return true;
        }
      break;
      case this.guiTypes.SKYBOX_CREATION:
        if (this.datGuiSkyboxCreation){
          return true;
        }
      break;
      case this.guiTypes.FOG:
        if (this.datGuiFog){
          return true;
        }
      break;
      case this.guiTypes.FONT:
        if (this.datGuiFontCreation){
          return true;
        }
      break;
      case this.guiTypes.CROSSHAIR_CREATION:
        if (this.datGuiCrosshairCreation){
          return true;
        }
      break;
      case this.guiTypes.SCRIPTS:
        if (this.datGuiScripts){
          return true;
        }
      break;
      case this.guiTypes.ANIMATION_CREATION:
        if (this.datGuiAnimationCreation){
          return true;
        }
      break;
      case this.guiTypes.LIGHTNING:
        if (this.datGuiLightningCreation){
          return true;
        }
      break;
      case this.guiTypes.VIRTUAL_KEYBOARD_CREATION:
        if (this.datGuiVirtualKeyboardCreation){
          return true;
        }
      break;
      case this.guiTypes.GRAPH_CREATOR:
        if (this.datGuiGraphCreation){
          return true;
        }
      break;
      case this.guiTypes.STEERING_BEHAVIOR_CREATION:
        if (this.datGuiSteeringBehaviorCreation){
          return true;
        }
      break;
      case this.guiTypes.JUMP_DESCRIPTOR_CREATION:
        if (this.datGuiJumpDescriptorCreation){
          return true;
        }
      break;
      default:
        throw new Error("Not implemented.")
      break;
    }
  }
  return false;
}

GUIHandler.prototype.afterContainerSelection = function(){
  if (mode != 0){
    return;
  }
  var curSelection = selectionHandler.getSelectedObject();
  if (curSelection && curSelection.isContainer){
    guiHandler.show(guiHandler.guiTypes.CONTAINER);
    guiHandler.enableAllCMControllers();
    guiHandler.containerManipulationParameters["Container"] = curSelection.name;
    guiHandler.containerManipulationParameters["Center X"] = curSelection.centerXPercent;
    guiHandler.containerManipulationParameters["Center Y"] = curSelection.centerYPercent;
    guiHandler.containerManipulationParameters["Width"] = curSelection.widthPercent * curSelection.scaleWidth;
    guiHandler.containerManipulationParameters["Height"] = curSelection.heightPercent * curSelection.scaleHeight;
    guiHandler.containerManipulationParameters["Square"] = !!curSelection.isSquare;
    guiHandler.containerManipulationParameters["Padding X"] = curSelection.paddingXContainerSpace;
    guiHandler.containerManipulationParameters["Padding Y"] = curSelection.paddingYContainerSpace;
    guiHandler.containerManipulationParameters["Clickable"] = !!curSelection.isClickable;
    guiHandler.containerManipulationParameters["Has border"] = !!curSelection.hasBorder;
    guiHandler.containerManipulationParameters["Border color"] = curSelection.borderColor? curSelection.borderColor: "#ffffff";
    guiHandler.containerManipulationParameters["Border thickness"] = curSelection.borderThickness? curSelection.borderThickness: 0.005;
    guiHandler.containerManipulationParameters["Has background"] = !!curSelection.hasBackground;
    guiHandler.containerManipulationParameters["BG color"] = curSelection.hasBackground? curSelection.backgroundColor: "#ffffff";
    guiHandler.containerManipulationParameters["BG alpha"] = curSelection.hasBackground? curSelection.backgroundAlpha: 1,
    guiHandler.containerManipulationParameters["Has BG texture"] = !!curSelection.backgroundTextureName;
    guiHandler.containerManipulationParameters["BG texture"] = curSelection.hasBackground? curSelection.backgroundTextureName: "";
    if (curSelection.alignedParent){
      var alignedLeft = curSelection.alignedParent.isChildAlignedWithType(curSelection, CONTAINER_ALIGNMENT_TYPE_LEFT);
      var alignedRight = curSelection.alignedParent.isChildAlignedWithType(curSelection, CONTAINER_ALIGNMENT_TYPE_RIGHT);
      var alignedBottom = curSelection.alignedParent.isChildAlignedWithType(curSelection, CONTAINER_ALIGNMENT_TYPE_BOTTOM);
      var alignedTop = curSelection.alignedParent.isChildAlignedWithType(curSelection, CONTAINER_ALIGNMENT_TYPE_TOP);
      if (alignedLeft || alignedRight){
        guiHandler.disableController(guiHandler.containerManipulationCenterXController);
      }
      if (alignedTop || alignedBottom){
        guiHandler.disableController(guiHandler.containerManipulationCenterYController);
      }
    }
    if (!curSelection.hasBorder){
      guiHandler.disableController(guiHandler.containerManipulationBorderColorController);
      guiHandler.disableController(guiHandler.containerManipulationBorderThicknessController);
    }
    if (!curSelection.hasBackground){
      guiHandler.disableController(guiHandler.containerManipulationBackgroundColorController);
      guiHandler.disableController(guiHandler.containerManipulationBackgroundAlphaController);
      guiHandler.disableController(guiHandler.containerManipulationBackgroundTextureController);
      guiHandler.disableController(guiHandler.containerManipulationHasBackgroundTextureController);
    }
    if (!curSelection.backgroundTextureName){
      guiHandler.disableController(guiHandler.containerManipulationBackgroundTextureController);
    }
    if (Object.keys(texturePacks).length == 0){
      guiHandler.disableController(guiHandler.containerManipulationHasBackgroundTextureController);
      guiHandler.disableController(guiHandler.containerManipulationBackgroundTextureController);
    }
  }else{
    guiHandler.hide(guiHandler.guiTypes.CONTAINER);
  }
}

GUIHandler.prototype.afterSpriteSelection = function(){
  if (mode != 0){
    return;
  }
  var curSelection = selectionHandler.getSelectedObject();
  if (curSelection && curSelection.isSprite){
    guiHandler.show(guiHandler.guiTypes.SPRITE);
    guiHandler.enableAllSMControllers();
    guiHandler.spriteManipulationParameters["Sprite"] = curSelection.name;
    guiHandler.spriteManipulationParameters["Color"] = "#" + curSelection.mesh.material.uniforms.color.value.getHexString();
    guiHandler.spriteManipulationParameters["Alpha"] = curSelection.mesh.material.uniforms.alpha.value;
    guiHandler.spriteManipulationParameters["Margin mode"] = (curSelection.marginMode == MARGIN_MODE_2D_CENTER) ? "Center" : (curSelection.marginMode == MARGIN_MODE_2D_TOP_LEFT ? "Top/Left" : "Bottom/Right");
    guiHandler.spriteManipulationParameters["Margin X"] = curSelection.marginPercentX;
    guiHandler.spriteManipulationParameters["Margin Y"] = curSelection.marginPercentY;
    guiHandler.spriteManipulationParameters["Has texture"] = !!curSelection.isTextured;
    guiHandler.spriteManipulationParameters["Texture"] = (curSelection.mappedTexturePackName ? curSelection.mappedTexturePackName : "");
    guiHandler.spriteManipulationParameters["Scale X"] = curSelection.mesh.material.uniforms.scale.value.x;
    guiHandler.spriteManipulationParameters["Scale Y"] = curSelection.mesh.material.uniforms.scale.value.y;
    guiHandler.spriteManipulationParameters["Rotation"] = curSelection.mesh.material.uniforms.rotationAngle.value;
    guiHandler.spriteManipulationParameters["Clickable"] = !!curSelection.isClickable;
    guiHandler.spriteManipulationParameters["Draggable"] = !!curSelection.isDraggable;
    guiHandler.spriteManipulationParameters["Crop X"] = (curSelection.cropCoefficientX ? curSelection.cropCoefficientX : 1.0);
    guiHandler.spriteManipulationParameters["Crop Y"] = (curSelection.cropCoefficientY ? curSelection.cropCoefficientY : 1.0);
    guiHandler.spriteManipulationParameters["Width fixed"] = !(typeof curSelection.fixedWidth == UNDEFINED);
    guiHandler.spriteManipulationParameters["Width %"] = (!(typeof curSelection.fixedWidth == UNDEFINED)) ? (curSelection.fixedWidth) : 50;
    guiHandler.spriteManipulationParameters["Height %"] = (!(typeof curSelection.fixedHeight == UNDEFINED)) ? (curSelection.fixedHeight) : 50;
    guiHandler.spriteManipulationParameters["Height fixed"] = !(typeof curSelection.fixedHeight == UNDEFINED);
    if (!curSelection.isTextured){
      guiHandler.disableController(guiHandler.spriteManipulationTextureController);
    }
    if (Object.keys(texturePacks).length == 0){
      guiHandler.disableController(guiHandler.spriteManipulationHasTextureController);
    }
    if (!curSelection.isClickable){
      guiHandler.disableController(guiHandler.spriteManipulationDraggableController);
    }
    if (!(typeof curSelection.fixedWidth == UNDEFINED)){
      guiHandler.disableController(guiHandler.spriteManipulationScaleXController);
    }else{
      guiHandler.disableController(guiHandler.spriteManipulationFixedWidthController);
    }
    if (!(typeof curSelection.fixedHeight == UNDEFINED)){
      guiHandler.disableController(guiHandler.spriteManipulationScaleYController);
    }else{
      guiHandler.disableController(guiHandler.spriteManipulationFixedHeightController);
    }
    if (curSelection.containerParent){
      guiHandler.disableController(guiHandler.spriteManipulationMarginModeController);
      guiHandler.disableController(guiHandler.spriteManipulationMarginXController);
      guiHandler.disableController(guiHandler.spriteManipulationMarginYController);
      guiHandler.disableController(guiHandler.spriteManipulationScaleXController);
      guiHandler.disableController(guiHandler.spriteManipulationScaleYController);
      guiHandler.disableController(guiHandler.spriteManipulationHasFixedWidthController);
      guiHandler.disableController(guiHandler.spriteManipulationHasFixedHeightController);
      guiHandler.disableController(guiHandler.spriteManipulationFixedWidthController);
      guiHandler.disableController(guiHandler.spriteManipulationFixedHeightController);
      guiHandler.disableController(guiHandler.spriteManipulationRotationController);
    }
  }else{
    guiHandler.hide(guiHandler.guiTypes.SPRITE);
  }
  guiHandler.afterContainerSelection();
}

GUIHandler.prototype.afterTextSelection = function(){
  if (mode != 0){
    return;
  }
  var curSelection = selectionHandler.getSelectedObject();
  if (curSelection && curSelection.isAddedText){
    guiHandler.show(guiHandler.guiTypes.TEXT);
    guiHandler.enableAllTMControllers();
    guiHandler.textManipulationParameters["Text"] = curSelection.name;
    guiHandler.textManipulationParameters["Content"] = curSelection.text;
    guiHandler.textManipulationParameters["Text color"] = "#" + curSelection.getColor().getHexString();
    guiHandler.textManipulationParameters["Alpha"] = curSelection.getAlpha();
    guiHandler.textManipulationParameters["Has bg"] = (curSelection.hasBackground);
    if (curSelection.hasBackground){
      guiHandler.textManipulationParameters["Bg color"] = "#" + curSelection.getBackgroundColor().getHexString();
      guiHandler.textManipulationParameters["Bg alpha"] = curSelection.getBackgroundAlpha();
    }else{
      guiHandler.textManipulationParameters["Bg color"] = "#000000"
      guiHandler.textManipulationParameters["Bg alpha"] = 1;
    }
    guiHandler.textManipulationParameters["Char margin"] = curSelection.getMarginBetweenChars();
    guiHandler.textManipulationParameters["Line margin"] = curSelection.getMarginBetweenLines();
    guiHandler.textManipulationParameters["Aff. by fog"] = curSelection.isAffectedByFog;
    guiHandler.textManipulationParameters["is 2D"] = curSelection.is2D;
    if (typeof guiHandler.textManipulationParameters["is 2D"] == UNDEFINED){
      guiHandler.textManipulationParameters["is 2D"] = false;
    }
    if (!guiHandler.textManipulationParameters["Has bg"]){
      guiHandler.disableController(guiHandler.textManipulationBackgroundColorController);
      guiHandler.disableController(guiHandler.textManipulationBackgroundAlphaController);
    }
    guiHandler.textManipulationParameters["Char size"] = curSelection.getCharSize();
    guiHandler.textManipulationParameters["Clickable"] = curSelection.isClickable;
    if (typeof guiHandler.textManipulationParameters["Clickable"] == UNDEFINED){
      guiHandler.textManipulationParameters["Clickable"] = false;
    }
    guiHandler.textManipulationParameters["Margin X"] = curSelection.marginPercentWidth;
    guiHandler.textManipulationParameters["Margin Y"] = curSelection.marginPercentHeight;
    guiHandler.textManipulationParameters["Max width%"] = curSelection.maxWidthPercent;
    guiHandler.textManipulationParameters["Max height%"] = curSelection.maxHeightPercent;
    if (typeof guiHandler.textManipulationParameters["Max width%"] == UNDEFINED){
      guiHandler.textManipulationParameters["Max width%"] = 0;
    }
    if (typeof guiHandler.textManipulationParameters["Max height%"] == UNDEFINED){
      guiHandler.textManipulationParameters["Max height%"] = 0;
    }
    if (curSelection.marginMode == MARGIN_MODE_2D_TOP_LEFT){
      guiHandler.textManipulationParameters["Margin mode"] = "Top/Left";
    }else if (curSelection.marginMode == MARGIN_MODE_2D_BOTTOM_RIGHT){
      guiHandler.textManipulationParameters["Margin mode"] = "Bottom/Right";
    }else{
      guiHandler.textManipulationParameters["Margin mode"] = "Center";
    }
    if (!curSelection.is2D){
      guiHandler.disableController(guiHandler.textManipulationMarginModeController);
      guiHandler.disableController(guiHandler.textManipulationMarginXController);
      guiHandler.disableController(guiHandler.textManipulationMarginYController);
      guiHandler.disableController(guiHandler.textManipulationMaxWidthPercentController);
      guiHandler.disableController(guiHandler.textManipulationMaxHeightPercentController);
    }else{
      guiHandler.disableController(guiHandler.textManipulationAffectedByFogController);
      if (curSelection.containerParent){
        guiHandler.disableController(guiHandler.textManipulationMaxWidthPercentController);
        guiHandler.disableController(guiHandler.textManipulationMaxHeightPercentController);
        guiHandler.disableController(guiHandler.textManipulationMarginXController);
        guiHandler.disableController(guiHandler.textManipulationMarginYController);
      }
    }
    if (curSelection.hasCustomPrecision){
      switch(curSelection.customPrecision){
        case shaderPrecisionHandler.precisionTypes.LOW:
          guiHandler.textManipulationParameters["Shader precision"] = "low";
        break;
        case shaderPrecisionHandler.precisionTypes.MEDIUM:
          guiHandler.textManipulationParameters["Shader precision"] = "medium";
        break;
        case shaderPrecisionHandler.precisionTypes.HIGH:
          guiHandler.textManipulationParameters["Shader precision"] = "high";
        break;
      }
    }else{
      guiHandler.textManipulationParameters["Shader precision"] = "default";
    }
  }else{
    guiHandler.hide(guiHandler.guiTypes.TEXT);
  }
  guiHandler.afterSpriteSelection();
}

GUIHandler.prototype.afterObjectSelection = function(){
  if (mode != 0 || isDeployment){
    return;
  }
  var curSelection = selectionHandler.getSelectedObject();
  if (curSelection && (curSelection.isAddedObject || curSelection.isObjectGroup)){
    guiHandler.show(guiHandler.guiTypes.OBJECT);
    guiHandler.enableAllOMControllers();
    var obj = curSelection;
    obj.visualiseBoundingBoxes();
    guiHandler.objectManipulationParameters["Object"] = obj.name;
    if (obj.isAddedObject){
      guiHandler.objectManipulationParameters["Rotate x"] = "0";
      guiHandler.objectManipulationParameters["Rotate y"] = "0";
      guiHandler.objectManipulationParameters["Rotate z"] = "0";
      guiHandler.objectManipulationParameters["Opacity"] = obj.getOpacity();
      if (obj.metaData.isSlippery){
        guiHandler.objectManipulationParameters["Slippery"] = true;
      }else{
        guiHandler.objectManipulationParameters["Slippery"] = false;
      }
      if (obj.isChangeable){
        guiHandler.objectManipulationParameters["Changeable"] = true;
      }else{
        guiHandler.objectManipulationParameters["Changeable"] = false;
      }
      if (obj.isIntersectable){
        guiHandler.objectManipulationParameters["Intersectable"] = true;
      }else{
        guiHandler.objectManipulationParameters["Intersectable"] = false;
      }
      if (obj.isColorizable){
        guiHandler.objectManipulationParameters["Colorizable"] = true;
      }else{
        guiHandler.objectManipulationParameters["Colorizable"] = false;
      }
      if (obj.hasDisplacementMap()){
        guiHandler.objectManipulationParameters["Disp. scale"] = obj.getDisplacementScale();
        guiHandler.objectManipulationParameters["Disp. bias"] = obj.getDisplacementBias();
      }else{
        guiHandler.disableController(guiHandler.omDisplacementScaleController);
        guiHandler.disableController(guiHandler.omDisplacementBiasController);
      }
      if (!obj.hasTexture()){
        guiHandler.disableController(guiHandler.omTextureOffsetXController);
        guiHandler.disableController(guiHandler.omTextureOffsetYController);
        guiHandler.disableController(guiHandler.omTextureRepeatXController);
        guiHandler.disableController(guiHandler.omTextureRepeatYController);
      }else{
        guiHandler.objectManipulationParameters["Texture offset x"] = obj.getTextureOffsetX();
        guiHandler.objectManipulationParameters["Texture offset y"] = obj.getTextureOffsetY();
        guiHandler.objectManipulationParameters["Texture repeat x"] = obj.getTextureRepeatX();
        guiHandler.objectManipulationParameters["Texture repeat y"] = obj.getTextureRepeatY();
      }
      if (!obj.hasDisplacementMap()){
        guiHandler.objectManipulationParameters["Has custom disp. matrix"] = false;
        guiHandler.disableController(guiHandler.omHasCustomDisplacementMatrixController);
      }else{
        guiHandler.objectManipulationParameters["Has custom disp. matrix"] = !!obj.customDisplacementTextureMatrixInfo;
      }
      if (!obj.customDisplacementTextureMatrixInfo || !obj.hasTexture() || !obj.hasDisplacementMap()){
        guiHandler.disableController(guiHandler.omDisplacementTextureOffsetXController);
        guiHandler.disableController(guiHandler.omDisplacementTextureOffsetYController);
        guiHandler.disableController(guiHandler.omDisplacementTextureRepeatXController);
        guiHandler.disableController(guiHandler.omDisplacementTextureRepeatYController);
      }else{
        guiHandler.objectManipulationParameters["Disp. texture offset x"] = obj.customDisplacementTextureMatrixInfo.offsetX;
        guiHandler.objectManipulationParameters["Disp. texture offset y"] = obj.customDisplacementTextureMatrixInfo.offsetY;
        guiHandler.objectManipulationParameters["Disp. texture repeat x"] = obj.customDisplacementTextureMatrixInfo.repeatU;
        guiHandler.objectManipulationParameters["Disp. texture repeat y"] = obj.customDisplacementTextureMatrixInfo.repeatV;
      }
      if (!obj.hasAOMap()){
        guiHandler.disableController(guiHandler.omAOIntensityController);
      }else{
        guiHandler.objectManipulationParameters["AO intensity"] = obj.getAOIntensity();
      }
      if (!obj.hasEmissiveMap()){
        guiHandler.disableController(guiHandler.omEmissiveIntensityController);
        guiHandler.disableController(guiHandler.omEmissiveColorController);
      }else{
        guiHandler.objectManipulationParameters["Emissive int."] = obj.getEmissiveIntensity();
        guiHandler.objectManipulationParameters["Emissive col."] = "#"+obj.getEmissiveColor().getHexString();
      }
      if (!obj.isSlicable()){
        guiHandler.objectManipulationParameters["Hide half"] = "None";
        guiHandler.disableController(guiHandler.omHideHalfController);
      }else{
        if (!(typeof obj.metaData.slicedType == UNDEFINED)){
          guiHandler.objectManipulationParameters["Hide half"] = "Part "+(obj.metaData.slicedType + 1)
        }else{
          guiHandler.objectManipulationParameters["Hide half"] = "None";
        }
      }
      guiHandler.objectManipulationParameters["Side"] = "Both";
      if (obj.metaData.renderSide){
        if (obj.metaData.renderSide == 1){
          guiHandler.objectManipulationParameters["Side"] = "Front";
        }else if (obj.metaData.renderSide == 2){
          guiHandler.objectManipulationParameters["Side"] = "Back";
        }
      }
      if (obj.mesh.material.blending == NO_BLENDING){
        guiHandler.disableController(guiHandler.omOpacityController);
      }
      guiHandler.objectManipulationParameters["Phy. simpl."] = false;
      guiHandler.disableController(guiHandler.omPhysicsSimplifiedController);
      obj.mesh.add(axesHelper);
    }else if (obj.isObjectGroup){
      guiHandler.objectManipulationParameters["Rotate x"] = "0";
      guiHandler.objectManipulationParameters["Rotate y"] = "0";
      guiHandler.objectManipulationParameters["Rotate z"] = "0";
      if (obj.isSlippery){
        guiHandler.objectManipulationParameters["Slippery"] = true;
      }else{
        guiHandler.objectManipulationParameters["Slippery"] = false;
      }
      if (obj.isChangeable){
        guiHandler.objectManipulationParameters["Changeable"] = true;
      }else{
        guiHandler.objectManipulationParameters["Changeable"] = false;
      }
      if (obj.isIntersectable){
        guiHandler.objectManipulationParameters["Intersectable"] = true;
      }else{
        guiHandler.objectManipulationParameters["Intersectable"] = false;
      }
      if (obj.isColorizable){
        guiHandler.objectManipulationParameters["Colorizable"] = true;
      }else{
        guiHandler.objectManipulationParameters["Colorizable"] = false;
      }
      if (obj.isPhysicsSimplified){
        guiHandler.disableController(guiHandler.omMassController);
      }
      guiHandler.objectManipulationParameters["Opacity"] = obj.getOpacity();
      var hasAOMap = false;
      var hasEmissiveMap = false;
      var hasDisplacementMap = false;
      for (var childObjName in obj.group){
        if (obj.group[childObjName].hasAOMap()){
          hasAOMap = true;
        }
        if (obj.group[childObjName].hasEmissiveMap()){
          hasEmissiveMap = true;
        }
        if (obj.group[childObjName].hasDisplacementMap()){
          hasDisplacementMap = true;
        }
      }
      if (!hasAOMap){
        guiHandler.disableController(guiHandler.omAOIntensityController);
      }else{
        guiHandler.objectManipulationParameters["AO intensity"] = obj.getAOIntensity();
      }
      if (!hasEmissiveMap){
        guiHandler.disableController(guiHandler.omEmissiveIntensityController);
        guiHandler.disableController(guiHandler.omEmissiveColorController);
      }else{
        guiHandler.objectManipulationParameters["Emissive int."] = obj.getEmissiveIntensity();
        guiHandler.objectManipulationParameters["Emissive col."] = "#"+obj.getEmissiveColor().getHexString();
      }
      if (!hasDisplacementMap){
        guiHandler.disableController(guiHandler.omDisplacementScaleController);
        guiHandler.disableController(guiHandler.omDisplacementBiasController);
      }else{
        guiHandler.objectManipulationParameters["Disp. scale"] = obj.getDisplacementScale();
        guiHandler.objectManipulationParameters["Disp. bias"] = obj.getDisplacementBias();
      }
      if (!obj.hasTexture){
        guiHandler.disableController(guiHandler.omTextureOffsetXController);
        guiHandler.disableController(guiHandler.omTextureOffsetYController);
      }else{
        guiHandler.objectManipulationParameters["Texture offset x"] = obj.getTextureOffsetX();
        guiHandler.objectManipulationParameters["Texture offset y"] = obj.getTextureOffsetY();
      }
      guiHandler.disableController(guiHandler.omHideHalfController);
      if (obj.cannotSetMass){
        guiHandler.disableController(guiHandler.omHasMassController);
      }

      guiHandler.objectManipulationParameters["Texture repeat x"] = 1;
      guiHandler.objectManipulationParameters["Texture repeat y"] = 1;
      guiHandler.disableController(guiHandler.omTextureRepeatXController);
      guiHandler.disableController(guiHandler.omTextureRepeatYController);

      guiHandler.objectManipulationParameters["Side"] = "Both";
      if (obj.renderSide){
        if (obj.renderSide == 1){
          guiHandler.objectManipulationParameters["Side"] = "Front";
        }else if (obj.renderSide == 2){
          guiHandler.objectManipulationParameters["Side"] = "Back";
        }
      }
      if (obj.isPhysicsSimplified){
        guiHandler.objectManipulationParameters["Phy. simpl."] = true;
      }else{
        guiHandler.objectManipulationParameters["Phy. simpl."] = false;
      }
      if (obj.noMass || obj.physicsBody.mass > 0){
        guiHandler.disableController(guiHandler.omPhysicsSimplifiedController);
      }

      guiHandler.disableController(guiHandler.omHasCustomDisplacementMatrixController);
      guiHandler.disableController(guiHandler.omDisplacementTextureOffsetXController);
      guiHandler.disableController(guiHandler.omDisplacementTextureOffsetYController);
      guiHandler.disableController(guiHandler.omDisplacementTextureRepeatXController);
      guiHandler.disableController(guiHandler.omDisplacementTextureRepeatYController);

      obj.mesh.add(axesHelper);
    }

    var rotationMode = obj.rotationMode;
    guiHandler.objectManipulationParameters["Rotation mode"] = rotationMode == rotationModes.LOCAL? "LOCAL": "WORLD";

    guiHandler.objectManipulationParameters["AI entity"] = obj.usedAsAIEntity || false;

    if (!obj.isChangeable){
      guiHandler.disableController(guiHandler.omSteerableController);
    }

    if (obj.steerableInfo){
      guiHandler.objectManipulationParameters["Steerable"] = true;
      guiHandler.objectManipulationParameters["Steering mode"] = obj.steerableInfo.mode;
      guiHandler.objectManipulationParameters["Max acceleration"] = "" + obj.steerableInfo.maxAcceleration;
      guiHandler.objectManipulationParameters["Max speed"] = "" + obj.steerableInfo.maxSpeed;
      guiHandler.objectManipulationParameters["Jump speed"] = "" + obj.steerableInfo.jumpSpeed;
      guiHandler.objectManipulationParameters["Look speed"] = obj.steerableInfo.lookSpeed;

      guiHandler.objectManipulationParameters["AI entity"] = true;
      guiHandler.disableController(guiHandler.omAIEntityController);
      guiHandler.disableController(guiHandler.omFPSWeaponController);
      guiHandler.disableController(guiHandler.omChangeableController);
    }else{
      guiHandler.objectManipulationParameters["Steerable"] = false;
      guiHandler.objectManipulationParameters["Steering mode"] = "Track position";
      guiHandler.objectManipulationParameters["Max acceleration"] = "100";
      guiHandler.objectManipulationParameters["Max speed"] = "100";
      guiHandler.objectManipulationParameters["Jump speed"] = "500";
      guiHandler.objectManipulationParameters["Look speed"] = 0.1;

      guiHandler.disableController(guiHandler.omSteeringModeController);
      guiHandler.disableController(guiHandler.omMaxAccelerationController);
      guiHandler.disableController(guiHandler.omMaxSpeedController);
      guiHandler.disableController(guiHandler.omJumpSpeedController);
      guiHandler.disableController(guiHandler.omLookSpeedController);
    }

    if (obj.isFPSWeapon){
      guiHandler.disableController(guiHandler.omSteerableController);
      guiHandler.disableController(guiHandler.omSteeringModeController);
      guiHandler.disableController(guiHandler.omMaxAccelerationController);
      guiHandler.disableController(guiHandler.omMaxSpeedController);
      guiHandler.disableController(guiHandler.omJumpSpeedController);
      guiHandler.disableController(guiHandler.omLookSpeedController);
    }

    if (obj.usedAsAIEntity){
      guiHandler.disableController(guiHandler.omFPSWeaponController);
    }

    if (obj.isFPSWeapon){
      guiHandler.disableController(guiHandler.omAIEntityController);
    }

    guiHandler.objectManipulationParameters["Motion blur"] = !(typeof obj.objectTrailConfigurations == UNDEFINED);
    if (obj.objectTrailConfigurations){
      guiHandler.objectManipulationParameters["mb alpha"] = obj.objectTrailConfigurations.alpha;
      guiHandler.objectManipulationParameters["mb time"] = obj.objectTrailConfigurations.time;
    }else{
      guiHandler.objectManipulationParameters["mb alpha"] = 1.0;
      guiHandler.objectManipulationParameters["mb time"] = OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT;
      guiHandler.disableController(guiHandler.omObjectTrailAlphaController);
      guiHandler.disableController(guiHandler.omObjectTrailTimeController);
    }
    guiHandler.objectManipulationParameters["Mass"] = obj.physicsBody.mass;
    if (obj.noMass){
      guiHandler.disableController(guiHandler.omMassController);
    }
    guiHandler.objectManipulationParameters["Has mass"] = !obj.noMass;
    guiHandler.objectManipulationParameters["Blending"] = obj.getBlendingText();
    if (obj.mesh.material.blending == NO_BLENDING){
      guiHandler.disableController(guiHandler.omOpacityController);
    }
    guiHandler.omMassController.updateDisplay();
    if (obj.isFPSWeapon){
      guiHandler.objectManipulationParameters["FPS Weapon"] = true;
      guiHandler.disableController(guiHandler.omHasMassController);
      guiHandler.disableController(guiHandler.omIntersectableController);
      guiHandler.disableController(guiHandler.omChangeableController);
    }else{
      guiHandler.objectManipulationParameters["FPS Weapon"] = false;
    }
    guiHandler.objectManipulationParameters["Affected by light"] = false;
    if (obj.affectedByLight){
      guiHandler.objectManipulationParameters["Affected by light"] = true;
    }
    if (obj.hasCustomPrecision){
      switch(obj.customPrecision){
        case shaderPrecisionHandler.precisionTypes.LOW:
          guiHandler.objectManipulationParameters["Shader precision"] = "low";
        break;
        case shaderPrecisionHandler.precisionTypes.MEDIUM:
          guiHandler.objectManipulationParameters["Shader precision"] = "medium";
        break;
        case shaderPrecisionHandler.precisionTypes.HIGH:
          guiHandler.objectManipulationParameters["Shader precision"] = "high";
        break;
      }
    }else{
      guiHandler.objectManipulationParameters["Shader precision"] = "default";
    }
  }else{
    guiHandler.hide(guiHandler.guiTypes.OBJECT);
  }
  guiHandler.afterTextSelection();
}

GUIHandler.prototype.omGUIRotateEvent = function(axis, val){
  var obj = selectionHandler.getSelectedObject();
  terminal.clear();
  parseCommand("rotateObject "+obj.name+" "+axis+" "+val);
  if (axis == "x"){
    guiHandler.objectManipulationParameters["Rotate x"] = "0";
    guiHandler.omRotationXController.updateDisplay();
  }else if (axis == "y"){
    guiHandler.objectManipulationParameters["Rotate y"] = "0";
    guiHandler.omRotationYController.updateDisplay();
  }else if (axis == "z"){
    guiHandler.objectManipulationParameters["Rotate z"] = "0";
    guiHandler.omRotationZController.updateDisplay();
  }
}

GUIHandler.prototype.disableController = function(controller, noOpacityAdjustment){
  controller.domElement.style.pointerEvents = "none";
  if (!noOpacityAdjustment){
    controller.domElement.style.opacity = .5;
  }
}

GUIHandler.prototype.enableController = function(controller){
  controller.domElement.style.pointerEvents = "";
  controller.domElement.style.opacity = 1;
}

GUIHandler.prototype.enableAllCMControllers = function(){
  guiHandler.enableController(guiHandler.containerManipulationNameController);
  guiHandler.enableController(guiHandler.containerManipulationCenterXController);
  guiHandler.enableController(guiHandler.containerManipulationCenterYController);
  guiHandler.enableController(guiHandler.containerManipulationWidthController);
  guiHandler.enableController(guiHandler.containerManipulationHeightController);
  guiHandler.enableController(guiHandler.containerManipulationSquareController);
  guiHandler.enableController(guiHandler.containerManipulationPaddingXController);
  guiHandler.enableController(guiHandler.containerManipulationPaddingYController);
  guiHandler.enableController(guiHandler.containerManipulationClickableController);
  guiHandler.enableController(guiHandler.containerManipulationHasBorderController);
  guiHandler.enableController(guiHandler.containerManipulationBorderColorController);
  guiHandler.enableController(guiHandler.containerManipulationBorderThicknessController);
  guiHandler.enableController(guiHandler.containerManipulationHasBackgroundController);
  guiHandler.enableController(guiHandler.containerManipulationBackgroundColorController);
  guiHandler.enableController(guiHandler.containerManipulationBackgroundAlphaController);
  guiHandler.enableController(guiHandler.containerManipulationHasBackgroundTextureController);
  guiHandler.enableController(guiHandler.containerManipulationBackgroundTextureController);
}

GUIHandler.prototype.enableAllTMControllers = function(){
  guiHandler.enableController(guiHandler.textManipulationTextNameController);
  guiHandler.enableController(guiHandler.textManipulationContentController);
  guiHandler.enableController(guiHandler.textManipulationTextColorController);
  guiHandler.enableController(guiHandler.textManipulationAlphaController);
  guiHandler.enableController(guiHandler.textManipulationHasBackgroundController);
  guiHandler.enableController(guiHandler.textManipulationBackgroundColorController);
  guiHandler.enableController(guiHandler.textManipulationBackgroundAlphaController);
  guiHandler.enableController(guiHandler.textManipulationCharacterSizeController);
  guiHandler.enableController(guiHandler.textManipulationCharacterMarginController);
  guiHandler.enableController(guiHandler.textManipulationLineMarginController);
  guiHandler.enableController(guiHandler.textManipulationClickableController);
  guiHandler.enableController(guiHandler.textManipulationAffectedByFogController);
  guiHandler.enableController(guiHandler.textManipulationIs2DController);
  guiHandler.enableController(guiHandler.textManipulationMarginModeController);
  guiHandler.enableController(guiHandler.textManipulationMarginXController);
  guiHandler.enableController(guiHandler.textManipulationMarginYController);
  guiHandler.enableController(guiHandler.textManipulationMaxWidthPercentController);
  guiHandler.enableController(guiHandler.textManipulationMaxHeightPercentController);
  guiHandler.enableController(guiHandler.textManipulationShaderPrecisionController);
}

GUIHandler.prototype.enableAllSMControllers = function(){
  guiHandler.enableController(guiHandler.spriteManipulationSpriteNameController);
  guiHandler.enableController(guiHandler.spriteManipulationColorController);
  guiHandler.enableController(guiHandler.spriteManipulationAlphaController);
  guiHandler.enableController(guiHandler.spriteManipulationMarginModeController);
  guiHandler.enableController(guiHandler.spriteManipulationMarginXController);
  guiHandler.enableController(guiHandler.spriteManipulationMarginYController);
  guiHandler.enableController(guiHandler.spriteManipulationHasTextureController);
  guiHandler.enableController(guiHandler.spriteManipulationTextureController);
  guiHandler.enableController(guiHandler.spriteManipulationScaleXController);
  guiHandler.enableController(guiHandler.spriteManipulationScaleYController);
  guiHandler.enableController(guiHandler.spriteManipulationRotationController);
  guiHandler.enableController(guiHandler.spriteManipulationClickableController);
  guiHandler.enableController(guiHandler.spriteManipulationDraggableController);
  guiHandler.enableController(guiHandler.spriteManipulationCropCoefficientXController);
  guiHandler.enableController(guiHandler.spriteManipulationCropCoefficientYController);
  guiHandler.enableController(guiHandler.spriteManipulationFixedWidthController);
  guiHandler.enableController(guiHandler.spriteManipulationFixedHeightController);
  guiHandler.enableController(guiHandler.spriteManipulationHasFixedWidthController);
  guiHandler.enableController(guiHandler.spriteManipulationHasFixedHeightController);
}

GUIHandler.prototype.enableAllOMControllers = function(){
  guiHandler.enableController(guiHandler.omRotationXController);
  guiHandler.enableController(guiHandler.omRotationYController);
  guiHandler.enableController(guiHandler.omRotationZController);
  guiHandler.enableController(guiHandler.omMassController);
  guiHandler.enableController(guiHandler.omPhysicsSimplifiedController);
  guiHandler.enableController(guiHandler.omSlipperyController);
  guiHandler.enableController(guiHandler.omChangeableController);
  guiHandler.enableController(guiHandler.omIntersectableController);
  guiHandler.enableController(guiHandler.omColorizableController);
  guiHandler.enableController(guiHandler.omAffectedByLightController);
  guiHandler.enableController(guiHandler.omHasMassController);
  guiHandler.enableController(guiHandler.omTextureOffsetXController);
  guiHandler.enableController(guiHandler.omTextureOffsetYController);
  guiHandler.enableController(guiHandler.omTextureRepeatXController);
  guiHandler.enableController(guiHandler.omTextureRepeatYController);
  guiHandler.enableController(guiHandler.omHasCustomDisplacementMatrixController);
  guiHandler.enableController(guiHandler.omDisplacementTextureOffsetXController);
  guiHandler.enableController(guiHandler.omDisplacementTextureOffsetYController);
  guiHandler.enableController(guiHandler.omDisplacementTextureRepeatXController);
  guiHandler.enableController(guiHandler.omDisplacementTextureRepeatYController);
  guiHandler.enableController(guiHandler.omOpacityController);
  guiHandler.enableController(guiHandler.omEmissiveIntensityController);
  guiHandler.enableController(guiHandler.omEmissiveColorController);
  guiHandler.enableController(guiHandler.omDisplacementScaleController);
  guiHandler.enableController(guiHandler.omDisplacementBiasController);
  guiHandler.enableController(guiHandler.omAOIntensityController);
  guiHandler.enableController(guiHandler.omHideHalfController);
  guiHandler.enableController(guiHandler.omBlendingController);
  guiHandler.enableController(guiHandler.omSideController);
  guiHandler.enableController(guiHandler.omFPSWeaponController);
  guiHandler.enableController(guiHandler.omShaderPrecisionController);
  guiHandler.enableController(guiHandler.omHasObjectTrailController);
  guiHandler.enableController(guiHandler.omObjectTrailAlphaController);
  guiHandler.enableController(guiHandler.omObjectTrailTimeController);
  guiHandler.enableController(guiHandler.omAIEntityController);
  guiHandler.enableController(guiHandler.omSteerableController);
  guiHandler.enableController(guiHandler.omSteeringModeController);
  guiHandler.enableController(guiHandler.omMaxAccelerationController);
  guiHandler.enableController(guiHandler.omMaxSpeedController);
  guiHandler.enableController(guiHandler.omJumpSpeedController);
  guiHandler.enableController(guiHandler.omLookSpeedController);
  guiHandler.enableController(guiHandler.omRotationModeController);
}

GUIHandler.prototype.show = function(guiType){
  switch(guiType){
    case this.guiTypes.OBJECT:
      if (!this.datGuiObjectManipulation){
        this.initializeObjectManipulationGUI();
      }
    return;
    case this.guiTypes.TEXT:
      if (!this.datGuiTextManipulation){
        this.initializeTextManipulationGUI();
      }
    return;
    case this.guiTypes.SPRITE:
      if (!this.datGuiSpriteManipulation){
        this.initializeSpriteManipulationGUI();
      }
    return;
    case this.guiTypes.CONTAINER:
      if (!this.datGuiContainerManipulation){
        this.initializeContainerManipulationGUI();
      }
    return;
    case this.guiTypes.BLOOM:
      if (!this.datGuiBloom){
        this.initializeBloomGUI();
        postProcessiongConfigurationsVisibility.bloom = true;
      }
    return;
    case this.guiTypes.SHADER_PRECISION:
      if (!this.datGuiShaderPrecision){
        this.initializeShaderPrecisionGUI();
      }
    return;
    case this.guiTypes.WORKER_STATUS:
      if (!this.datGuiWorkerStatus){
        this.initializeWorkerStatusGUI();
      }
    return;
  }
  throw new Error("Unknown guiType.");
}

GUIHandler.prototype.unbindSubFolderEvents = function(gui){
  var folders = gui.__folders;
  for (var folderName in folders){
    dat.dom.dom.unbind(window, "resize", folders[folderName].__resizeHandler);
    var len = folders[folderName].__controllers.length;
    for (var i = 0; i<len; i++){
      folders[folderName].remove(folders[folderName].__controllers[0]);
    }
    gui.removeFolder(folders[folderName]);
  }
}

GUIHandler.prototype.removeControllers = function(gui){
  var len = gui.__controllers.length;
  for (var i = 0; i<len; i++){
    gui.remove(gui.__controllers[0]);
  }
}

GUIHandler.prototype.destroyGUI = function(gui){
  this.removeControllers(gui);
  this.unbindSubFolderEvents(gui);
  gui.destroy();
}

GUIHandler.prototype.hide = function(guiType){
  switch(guiType){
    case this.guiTypes.OBJECT:
      if (this.datGuiObjectManipulation){
        this.destroyGUI(this.datGuiObjectManipulation);
        this.datGuiObjectManipulation = 0;
      }
    return;
    case this.guiTypes.TEXT:
      if (this.datGuiTextManipulation){
        this.destroyGUI(this.datGuiTextManipulation);
        this.datGuiTextManipulation = 0;
      }
    return;
    case this.guiTypes.SPRITE:
      if (this.datGuiSpriteManipulation){
        this.destroyGUI(this.datGuiSpriteManipulation);
        this.datGuiSpriteManipulation = 0;
      }
    return;
    case this.guiTypes.CONTAINER:
      if (this.datGuiContainerManipulation){
        this.destroyGUI(this.datGuiContainerManipulation);
        this.datGuiContainerManipulation = 0;
      }
    return;
    case this.guiTypes.BLOOM:
      if (this.datGuiBloom){
        this.destroyGUI(this.datGuiBloom);
        postProcessiongConfigurationsVisibility.bloom = false;
        this.datGuiBloom = 0;
      }
    return;
    case this.guiTypes.AREA:
      if (this.datGuiAreaConfigurations){
        this.destroyGUI(this.datGuiAreaConfigurations);
        this.datGuiAreaConfigurations = 0;
        areaConfigurationsVisible = false;
      }
    return;
    case this.guiTypes.FPS_WEAPON_ALIGNMENT:
      if (this.datGuiFPSWeaponAlignment){
        this.destroyGUI(this.datGuiFPSWeaponAlignment);
        this.datGuiFPSWeaponAlignment = 0;
      }
      fpsWeaponGUIHandler.onHidden();
    return;
    case this.guiTypes.SHADER_PRECISION:
      if (this.datGuiShaderPrecision){
        this.destroyGUI(this.datGuiShaderPrecision);
        this.datGuiShaderPrecision = 0;
      }
    return;
    case this.guiTypes.PARTICLE_SYSTEM:
      if (this.datGuiPSCreator){
        this.destroyGUI(this.datGuiPSCreator);
        this.datGuiPSCreator = 0;
      }
    return;
    case this.guiTypes.WORKER_STATUS:
      if (this.datGuiWorkerStatus){
        this.destroyGUI(this.datGuiWorkerStatus);
        this.datGuiWorkerStatus = 0;
      }
    return;
    case this.guiTypes.MUZZLE_FLASH:
      if (this.datGuiMuzzleFlashCreator){
        this.destroyGUI(this.datGuiMuzzleFlashCreator);
        this.datGuiMuzzleFlashCreator = 0;
      }
    return;
    case this.guiTypes.TEXTURE_PACK:
      if (this.datGuiTexturePack){
        this.destroyGUI(this.datGuiTexturePack);
        this.datGuiTexturePack = 0;
      }
    return;
    case this.guiTypes.SKYBOX_CREATION:
      if (this.datGuiSkyboxCreation){
        this.destroyGUI(this.datGuiSkyboxCreation);
        this.datGuiSkyboxCreation = 0;
      }
    return;
    case this.guiTypes.FOG:
      if (this.datGuiFog){
        this.destroyGUI(this.datGuiFog);
        this.datGuiFog = 0;
      }
    return;
    case this.guiTypes.FONT:
      if (this.datGuiFontCreation){
        this.destroyGUI(this.datGuiFontCreation);
        this.datGuiFontCreation = 0;
      }
    return;
    case this.guiTypes.CROSSHAIR_CREATION:
      if (this.datGuiCrosshairCreation){
        this.destroyGUI(this.datGuiCrosshairCreation);
        this.datGuiCrosshairCreation = 0;
      }
    return;
    case this.guiTypes.SCRIPTS:
      if (this.datGuiScripts){
        this.destroyGUI(this.datGuiScripts);
        this.datGuiScripts = 0;
      }
    return;
    case this.guiTypes.ANIMATION_CREATION:
      if (this.datGuiAnimationCreation){
        this.destroyGUI(this.datGuiAnimationCreation);
        this.datGuiAnimationCreation = 0;
      }
    return;
    case this.guiTypes.LIGHTNING:
      if (this.datGuiLightningCreation){
        this.destroyGUI(this.datGuiLightningCreation);
        this.datGuiLightningCreation = 0;
      }
    return;
    case this.guiTypes.VIRTUAL_KEYBOARD_CREATION:
      if (this.datGuiVirtualKeyboardCreation){
        this.destroyGUI(this.datGuiVirtualKeyboardCreation);
        this.datGuiVirtualKeyboardCreation = 0;
      }
    return;
    case this.guiTypes.LIGHTS:
      if (this.datGuiLights){
        this.destroyGUI(this.datGuiLights);
        this.datGuiLights = 0;
      }
    return;
    case this.guiTypes.GRAPH_CREATOR:
      if (this.datGuiGraphCreation){
        this.destroyGUI(this.datGuiGraphCreation);
        this.datGuiGraphCreation = 0;
      }
    return;
    case this.guiTypes.STEERING_BEHAVIOR_CREATION:
      if (this.datGuiSteeringBehaviorCreation){
        this.destroyGUI(this.datGuiSteeringBehaviorCreation);
        this.datGuiSteeringBehaviorCreation = 0;
      }
    return;
    case this.guiTypes.JUMP_DESCRIPTOR_CREATION:
      if (this.datGuiJumpDescriptorCreation){
        this.destroyGUI(this.datGuiJumpDescriptorCreation);
        this.datGuiJumpDescriptorCreation = 0;
      }
    return;
  }
  throw new Error("Unknown guiType.");
}

GUIHandler.prototype.hideAll = function(){
  for (var key in this.guiTypes){
    this.hide(this.guiTypes[key]);
  }
}

GUIHandler.prototype.getPrecisionType = function(key){
  if (key == "low"){
    return shaderPrecisionHandler.precisionTypes.LOW;
  }
  if (key == "medium"){
    return shaderPrecisionHandler.precisionTypes.MEDIUM;
  }
  if (key == "high"){
    return shaderPrecisionHandler.precisionTypes.HIGH;
  }
  throw new Error("Unknown type.");
}

GUIHandler.prototype.initializeWorkerStatusGUI = function(){
  if (!guiHandler.onOff){
    guiHandler.onOff = ["ON", "OFF"];
  }
  guiHandler.workerStatusParameters["Raycaster"] = (RAYCASTER_WORKER_ON)? "ON": "OFF";
  guiHandler.workerStatusParameters["Physics"] = (PHYSICS_WORKER_ON)? "ON": "OFF";
  guiHandler.workerStatusParameters["Lightning"] = (LIGHTNING_WORKER_ON)? "ON": "OFF";
  guiHandler.datGuiWorkerStatus = new dat.GUI({hideable: false, width: 420});
  guiHandler.datGuiWorkerStatus.add(guiHandler.workerStatusParameters, "Raycaster", guiHandler.onOff).onChange(function(val){
    RAYCASTER_WORKER_ON = (val == "ON");
    raycasterFactory.refresh();
    rayCaster = raycasterFactory.get();
  }).listen();
  guiHandler.datGuiWorkerStatus.add(guiHandler.workerStatusParameters, "Physics", guiHandler.onOff).onChange(function(val){
    PHYSICS_WORKER_ON = (val == "ON");
    physicsFactory.refresh();
    physicsWorld = physicsFactory.get();
  }).listen();
  guiHandler.datGuiWorkerStatus.add(guiHandler.workerStatusParameters, "Lightning", guiHandler.onOff).onChange(function(val){
    LIGHTNING_WORKER_ON = (val == "ON");
    for (var lightningName in lightnings){
      lightnings[lightningName].init(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0));
    }
    if (LIGHTNING_WORKER_ON){
      lightningHandler.reset();
      for (var lightningName in lightnings){
        lightningHandler.onLightningCreation(lightnings[lightningName]);
        if (lightnings[lightningName].isCorrected){
          lightningHandler.onSetCorrectionProperties(lightnings[lightningName]);
        }
      }
    }
  }).listen();
  guiHandler.datGuiWorkerStatus.add(guiHandler.workerStatusParameters, "Done");
}

GUIHandler.prototype.initializeShaderPrecisionGUI = function(){
  guiHandler.datGuiShaderPrecision = new dat.GUI({hideable: false, width: 420});
  guiHandler.shaderPrecisionParameters["Crosshair"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.CROSSHAIR);
  guiHandler.shaderPrecisionParameters["Basic material"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.BASIC_MATERIAL);
  guiHandler.shaderPrecisionParameters["Instanced basic material"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.INSTANCED_BASIC_MATERIAL);
  guiHandler.shaderPrecisionParameters["Merged basic material"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.MERGED_BASIC_MATERIAL);
  guiHandler.shaderPrecisionParameters["Object trail"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.OBJECT_TRAIL);
  guiHandler.shaderPrecisionParameters["Particle"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.PARTICLE);
  guiHandler.shaderPrecisionParameters["Skybox"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.SKYBOX);
  guiHandler.shaderPrecisionParameters["Text"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.TEXT);
  guiHandler.shaderPrecisionParameters["Lightning"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.LIGHTNING);
  guiHandler.shaderPrecisionParameters["Sprite"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.SPRITE);
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Crosshair", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.CROSSHAIR, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Basic material", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.BASIC_MATERIAL, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Instanced basic material", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.INSTANCED_BASIC_MATERIAL, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Merged basic material", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.MERGED_BASIC_MATERIAL, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Object trail", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.OBJECT_TRAIL, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Particle", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.PARTICLE, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Skybox", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.SKYBOX, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Text", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.TEXT, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Lightning", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.LIGHTNING, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Sprite", ["low", "medium", "high"]).onChange(function(val){
    shaderPrecisionHandler.setShaderPrecisionForType(shaderPrecisionHandler.types.SPRITE, guiHandler.getPrecisionType(val));
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Done");
}

GUIHandler.prototype.getNumericValue = function(expression){
  try{
    var evaluationResult = eval(expression);
    var radian = parseFloat(evaluationResult);
    if (isNaN(radian)){
      return null;
    }
    return radian;
  }catch (err){
    return null;
  }
}

GUIHandler.prototype.initializeObjectManipulationGUI = function(){
  guiHandler.datGuiObjectManipulation = new dat.GUI({hideable: false, width: 420});
  guiHandler.datGuiObjectManipulation.domElement.addEventListener("mousedown", function(e){
    omGUIFocused = true;
  });

  guiHandler.omObjController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Object").listen();
  guiHandler.disableController(guiHandler.omObjController, true);

  var rotationFolder = guiHandler.datGuiObjectManipulation.addFolder("Rotation");
  var physicsFolder = guiHandler.datGuiObjectManipulation.addFolder("Physics");
  var generalFolder = guiHandler.datGuiObjectManipulation.addFolder("General");
  var graphicsFolder = guiHandler.datGuiObjectManipulation.addFolder("Graphics");
  var textureFolder = guiHandler.datGuiObjectManipulation.addFolder("Texture");
  var aiFolder = guiHandler.datGuiObjectManipulation.addFolder("AI");
  var motionBlurFolder = guiHandler.datGuiObjectManipulation.addFolder("Motion Blur");

  // ROTATION
  guiHandler.omRotationXController = rotationFolder.add(guiHandler.objectManipulationParameters, "Rotate x").onFinishChange(function(val){
    var parsed = guiHandler.getNumericValue(val);
    if (parsed === null){
      terminal.clear();
      terminal.printError(Text.INVALID_EXPRESSION);
      return;
    }
    guiHandler.omGUIRotateEvent("x", parsed);
  });
  guiHandler.omRotationYController = rotationFolder.add(guiHandler.objectManipulationParameters, "Rotate y").onFinishChange(function(val){
    var parsed = guiHandler.getNumericValue(val);
    if (parsed === null){
      terminal.clear();
      terminal.printError(Text.INVALID_EXPRESSION);
      return;
    }
    guiHandler.omGUIRotateEvent("y", parsed);
  });
  guiHandler.omRotationZController = rotationFolder.add(guiHandler.objectManipulationParameters, "Rotate z").onFinishChange(function(val){
    var parsed = guiHandler.getNumericValue(val);
    if (parsed === null){
      terminal.clear();
      terminal.printError(Text.INVALID_EXPRESSION);
      return;
    }
    guiHandler.omGUIRotateEvent("z", parsed);
  });
  guiHandler.omRotationModeController = rotationFolder.add(guiHandler.objectManipulationParameters, "Rotation mode", Object.keys(rotationModes)).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();

    if (obj.pivotObject){
      terminal.clear();
      terminal.printError(Text.OBJECT_HAS_A_ROTATION_PIVOT_NO_LOCAL);
      selectionHandler.resetCurrentSelection();
      return;
    }

    obj.setRotationMode(rotationModes[val]);
  }).listen();

  // PHYSICS
  guiHandler.omMassController = physicsFolder.add(guiHandler.objectManipulationParameters, "Mass").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    parseCommand("setMass "+obj.name+" "+val);
    if (!isNaN(val) && parseFloat(val) > 0){
      guiHandler.disableController(guiHandler.omPhysicsSimplifiedController);
    }else{
      guiHandler.enableController(guiHandler.omPhysicsSimplifiedController);
      if (obj.steerableInfo && obj.steerableInfo.mode == steeringHandler.steeringModes.TRACK_VELOCITY){
        obj.steerableInfo.mode = steeringHandler.steeringModes.TRACK_POSITION;
        terminal.printInfo(Text.SWITCHED_TO_TRACK_POSITION);
        selectionHandler.resetCurrentSelection();
      }
    }
  });
  guiHandler.omPhysicsSimplifiedController = physicsFolder.add(guiHandler.objectManipulationParameters, "Phy. simpl.").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject || obj.noMass || obj.physicsBody.mass > 0){
      guiHandler.objectManipulationParameters["Phy. simpl."] = false;
      return;
    }
    terminal.clear();
    if (val){
      if (!obj.boundingBoxes){
        obj.generateBoundingBoxes();
      }
      var box3 = new THREE.Box3();
      for (var i = 0; i<obj.boundingBoxes.length; i++){
        box3.expandByPoint(obj.boundingBoxes[i].min);
        box3.expandByPoint(obj.boundingBoxes[i].max);
      }
      var sizeVec = new THREE.Vector3();
      box3.getSize(sizeVec);
      var xSize = (sizeVec.x <= 0)? surfacePhysicalThickness: sizeVec.x;
      var ySize = (sizeVec.y <= 0)? surfacePhysicalThickness: sizeVec.y;
      var zSize = (sizeVec.z <= 0)? surfacePhysicalThickness: sizeVec.z;
      parseCommand("simplifyPhysics "+obj.name+" "+xSize+" "+ySize+" "+zSize);
    }else{
      parseCommand("unsimplifyPhysics "+obj.name);
    }
    if (physicsDebugMode){
      terminal.skip = true;
      parseCommand("switchPhysicsDebugMode");
      parseCommand("switchPhysicsDebugMode");
      terminal.skip = false;
    }
  }).listen();
  guiHandler.omSlipperyController = physicsFolder.add(guiHandler.objectManipulationParameters, "Slippery").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    if (val){
      parseCommand("setSlipperiness "+obj.name+" on");
    }else{
      parseCommand("setSlipperiness "+obj.name+" off");
    }
  }).listen();
  guiHandler.omHasMassController = physicsFolder.add(guiHandler.objectManipulationParameters, "Has mass").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isObjectGroup && obj.cannotSetMass){
      guiHandler.objectManipulationParameters["Has mass"] = false;
      return;
    }
    if (obj.isFPSWeapon){
      guiHandler.objectManipulationParameters["Has mass"] = false;
      return;
    }
    if (obj.steerableInfo && obj.steerableInfo.mode == steeringHandler.steeringModes.TRACK_VELOCITY){
      guiHandler.objectManipulationParameters["Has mass"] = true;
      return;
    }
    terminal.clear();
    obj.setNoMass(!val);
    if (val){
      for (var animName in obj.animations){
        if (obj.animations[animName].isObjectScaleAnimation()){
          obj.removeAnimation(obj.animations[animName]);
        }
      }
    }
    if (val){
      guiHandler.enableController(guiHandler.omMassController);
      guiHandler.enableController(guiHandler.omPhysicsSimplifiedController);
      terminal.printInfo(Text.PHYSICS_ENABLED);
    }else{
      guiHandler.disableController(guiHandler.omMassController);
      guiHandler.disableController(guiHandler.omPhysicsSimplifiedController);
      terminal.printInfo(Text.PHYSICS_DISABLED);
    }
    if (physicsDebugMode){
      debugRenderer.refresh();
    }
    guiHandler.omMassController.updateDisplay();
  }).listen();

  // GENERAL
  guiHandler.omChangeableController = generalFolder.add(guiHandler.objectManipulationParameters, "Changeable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isFPSWeapon || !!obj.steerableInfo){
      guiHandler.objectManipulationParameters["Changeable"] = true;
      return;
    }
    terminal.clear();
    obj.setChangeableStatus(val);
    if (obj.isChangeable){
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "changeable"));
    }else{
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "unchangeable"));
    }

    if (val){
      guiHandler.enableController(guiHandler.omSteerableController);
    }else{
      guiHandler.disableController(guiHandler.omSteerableController);
    }
  }).listen();
  guiHandler.omIntersectableController = generalFolder.add(guiHandler.objectManipulationParameters, "Intersectable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isFPSWeapon){
      guiHandler.objectManipulationParameters["Intersectable"] = false;
      return;
    }
    terminal.clear();
    obj.setIntersectableStatus(val);
    if (obj.isIntersectable){
      terminal.printInfo(Text.OBJECT_INTERSECTABLE);
    }else{
      terminal.printInfo(Text.OBJECT_UNINTERSECTABLE);
    }
  }).listen();
  guiHandler.omColorizableController = generalFolder.add(guiHandler.objectManipulationParameters, "Colorizable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    obj.isColorizable = val;
    if (obj.isColorizable){
      macroHandler.injectMacro("HAS_FORCED_COLOR", obj.mesh.material, false, true);
      obj.mesh.material.uniforms.forcedColor = new THREE.Uniform(new THREE.Vector4(-50, 0, 0, 0));
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "colorizable"));
    }else{
      delete obj.mesh.material.uniforms.forcedColor;
      macroHandler.removeMacro("HAS_FORCED_COLOR", obj.mesh.material, false, true);
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "uncolorizable"));
    }
    obj.mesh.material.needsUpdate = true;
  }).listen();
  guiHandler.omAffectedByLightController = generalFolder.add(guiHandler.objectManipulationParameters, "Affected by light").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    obj.setAffectedByLight(val);
    if (val){
      terminal.printInfo(Text.OBJECT_WILL_BE_AFFECTED_BY_LIGHTS);
    }else{
      terminal.printInfo(Text.OBJECT_WONT_BE_AFFECTED_BY_LIGHTS);
    }
  }).listen();
  guiHandler.omFPSWeaponController = generalFolder.add(guiHandler.objectManipulationParameters, "FPS Weapon").onChange(function(val){
    if (!!selectionHandler.getSelectedObject().steerableInfo || selectionHandler.getSelectedObject().usedAsAIEntity){
      guiHandler.objectManipulationParameters["FPS Weapon"] = false;
      return;
    }
    if (val){
      selectionHandler.getSelectedObject().useAsFPSWeapon();
      guiHandler.disableController(guiHandler.omHasMassController);
      guiHandler.disableController(guiHandler.omChangeableController);
      guiHandler.disableController(guiHandler.omIntersectableController);
      guiHandler.disableController(guiHandler.omMassController);
      guiHandler.disableController(guiHandler.omSteerableController);
      guiHandler.disableController(guiHandler.omAIEntityController);
      guiHandler.objectManipulationParameters["Has mass"] = false;
      guiHandler.objectManipulationParameters["Changeable"] = true;
      guiHandler.objectManipulationParameters["Intersectable"] = false;
    }else{
      selectionHandler.getSelectedObject().resetFPSWeaponProperties();
      guiHandler.enableController(guiHandler.omHasMassController);
      guiHandler.enableController(guiHandler.omChangeableController);
      guiHandler.enableController(guiHandler.omIntersectableController);
      guiHandler.enableController(guiHandler.omAIEntityController);
      if (selectionHandler.getSelectedObject().isChangeable){
        guiHandler.enableController(guiHandler.omSteerableController);
      }
      if (!selectionHandler.getSelectedObject().noMass){
        guiHandler.enableController(guiHandler.omMassController);
      }
      guiHandler.objectManipulationParameters["Has mass"] = true;
      guiHandler.objectManipulationParameters["Changeable"] = false;
      guiHandler.objectManipulationParameters["Intersectable"] = true;
      for (var lightningName in lightnings){
        if (lightnings[lightningName].attachToFPSWeapon && lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name == selectionHandler.getSelectedObject().name){
          lightnings[lightningName].detachFromFPSWeapon();
        }
      }
    }
    if (physicsDebugMode){
      debugRenderer.refresh();
    }
    guiHandler.omMassController.updateDisplay();
    if (val){
      terminal.clear();
      terminal.printInfo(Text.OBJECT_WILL_BE_USED_AS_FPS_WEAPON);
    }else{
      terminal.clear();
      terminal.printInfo(Text.OK);
    }
  }).listen();

  // GRAPHICS
  guiHandler.omOpacityController = graphicsFolder.add(guiHandler.objectManipulationParameters, "Opacity").min(0).max(1).step(0.01).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    obj.updateOpacity(val);
    obj.initOpacitySet = false;
    obj.initOpacity = obj.opacity;
    if (obj.isObjectGroup){
      for (var objName in obj.group){
        obj.group[objName].updateOpacity(val * obj.group[objName].opacityWhenAttached);
      }
    }
  }).listen();
  guiHandler.omShaderPrecisionController = graphicsFolder.add(guiHandler.objectManipulationParameters, "Shader precision", ["default", "low", "medium", "high"]).onChange(function(val){
    switch (val){
      case "default":
        selectionHandler.getSelectedObject().useDefaultPrecision();
      break;
      case "low":
        selectionHandler.getSelectedObject().useCustomShaderPrecision(shaderPrecisionHandler.precisionTypes.LOW);
      break;
      case "medium":
        selectionHandler.getSelectedObject().useCustomShaderPrecision(shaderPrecisionHandler.precisionTypes.MEDIUM);
      break;
      case "high":
        selectionHandler.getSelectedObject().useCustomShaderPrecision(shaderPrecisionHandler.precisionTypes.HIGH);
      break;
    }
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();
  guiHandler.omSideController = graphicsFolder.add(guiHandler.objectManipulationParameters, "Side", [
    "Both", "Front", "Back"
  ]).onChange(function(val){
    var pseudoVal = 0;
    if (val == "Front"){
      pseudoVal = 1;
    }else if (val == "Back"){
      pseudoVal = 2;
    }
    selectionHandler.getSelectedObject().handleRenderSide(pseudoVal);
  }).listen();
  guiHandler.omHideHalfController = graphicsFolder.add(guiHandler.objectManipulationParameters, "Hide half", [
    "None", "Part 1", "Part 2", "Part 3", "Part 4"
  ]).onChange(function(val){
    if (val == "None"){
      selectionHandler.getSelectedObject().sliceInHalf(4);
    }else if (val == "Part 1"){
      selectionHandler.getSelectedObject().sliceInHalf(0);
    }else if (val == "Part 2"){
      selectionHandler.getSelectedObject().sliceInHalf(1);
    }else if (val == "Part 3"){
      selectionHandler.getSelectedObject().sliceInHalf(2);
    }else if (val == "Part 4"){
      selectionHandler.getSelectedObject().sliceInHalf(3);
    }
    rayCaster.updateObject(selectionHandler.getSelectedObject());
  }).listen();
  guiHandler.omBlendingController = graphicsFolder.add(guiHandler.objectManipulationParameters, "Blending", [
    "None", "Normal", "Additive", "Subtractive", "Multiply"
  ]).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject || obj.isObjectGroup){
      guiHandler.enableController(guiHandler.omOpacityController);
    }
    if (val == "None"){
      obj.setBlending(NO_BLENDING);
      if (obj.isAddedObject || obj.isObjectGroup){
        guiHandler.disableController(guiHandler.omOpacityController);
      }
    }else if (val == "Normal"){
      obj.setBlending(NORMAL_BLENDING);
    }else if (val == "Additive"){
      obj.setBlending(ADDITIVE_BLENDING);
    }else if (val == "Subtractive"){
      obj.setBlending(SUBTRACTIVE_BLENDING);
    }else if (val == "Multiply"){
      obj.setBlending(MULTIPLY_BLENDING);
    }
  }).listen();

  // TEXTURE
  guiHandler.omEmissiveColorController = textureFolder.add(guiHandler.objectManipulationParameters, "Emissive col.").onFinishChange(function(val){
    REUSABLE_COLOR.set(val);
    selectionHandler.getSelectedObject().setEmissiveColor(REUSABLE_COLOR);
  }).listen();
  guiHandler.omTextureOffsetXController = textureFolder.add(guiHandler.objectManipulationParameters, "Texture offset x").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setTextureOffsetX(val);
  }).listen();
  guiHandler.omTextureOffsetYController = textureFolder.add(guiHandler.objectManipulationParameters, "Texture offset y").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setTextureOffsetY(val);
  }).listen();
  guiHandler.omTextureRepeatXController = textureFolder.add(guiHandler.objectManipulationParameters, "Texture repeat x").min(1).max(100).step(1).onChange(function(val){
    selectionHandler.getSelectedObject().adjustTextureRepeat(val, null);
  }).listen();
  guiHandler.omTextureRepeatYController = textureFolder.add(guiHandler.objectManipulationParameters, "Texture repeat y").min(1).max(100).step(1).onChange(function(val){
    selectionHandler.getSelectedObject().adjustTextureRepeat(null, val);
  }).listen();
  guiHandler.omHasCustomDisplacementMatrixController = textureFolder.add(guiHandler.objectManipulationParameters, "Has custom disp. matrix").onChange(function(val){
    if (!selectionHandler.getSelectedObject().hasDisplacementMap() || selectionHandler.getSelectedObject().isObjectGroup){
      guiHandler.objectManipulationParameters["Has custom disp. matrix"] = false;
      return;
    }
    if (val){
      selectionHandler.getSelectedObject().setCustomDisplacementTextureMatrix();
      guiHandler.enableController(guiHandler.omDisplacementTextureOffsetXController);
      guiHandler.enableController(guiHandler.omDisplacementTextureOffsetYController);
      guiHandler.enableController(guiHandler.omDisplacementTextureRepeatXController);
      guiHandler.enableController(guiHandler.omDisplacementTextureRepeatYController);
    }else{
      selectionHandler.getSelectedObject().removeCustomDisplacementTextureMatrix();
      guiHandler.disableController(guiHandler.omDisplacementTextureOffsetXController);
      guiHandler.disableController(guiHandler.omDisplacementTextureOffsetYController);
      guiHandler.disableController(guiHandler.omDisplacementTextureRepeatXController);
      guiHandler.disableController(guiHandler.omDisplacementTextureRepeatYController);
    }
  }).listen();
  guiHandler.omDisplacementTextureOffsetXController = textureFolder.add(guiHandler.objectManipulationParameters, "Disp. texture offset x").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setCustomDisplacementTextureOffset(val, null);
  }).listen();
  guiHandler.omDisplacementTextureOffsetYController = textureFolder.add(guiHandler.objectManipulationParameters, "Disp. texture offset y").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setCustomDisplacementTextureOffset(null, val);
  }).listen();
  guiHandler.omDisplacementTextureRepeatXController = textureFolder.add(guiHandler.objectManipulationParameters, "Disp. texture repeat x").min(1).max(100).step(1).onChange(function(val){
    selectionHandler.getSelectedObject().setCustomDisplacementTextureRepeat(val, null);
  }).listen();
  guiHandler.omDisplacementTextureRepeatYController = textureFolder.add(guiHandler.objectManipulationParameters, "Disp. texture repeat y").min(1).max(100).step(1).onChange(function(val){
    selectionHandler.getSelectedObject().setCustomDisplacementTextureRepeat(null, val);
  }).listen();
  guiHandler.omAOIntensityController = textureFolder.add(guiHandler.objectManipulationParameters, "AO intensity").min(0).max(10).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setAOIntensity(val);
  }).listen();
  guiHandler.omEmissiveIntensityController = textureFolder.add(guiHandler.objectManipulationParameters, "Emissive int.").min(0).max(100).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setEmissiveIntensity(val);
  }).listen();
  guiHandler.omDisplacementScaleController = textureFolder.add(guiHandler.objectManipulationParameters, "Disp. scale").min(-50).max(50).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setDisplacementScale(val);
  }).listen();
  guiHandler.omDisplacementBiasController = textureFolder.add(guiHandler.objectManipulationParameters, "Disp. bias").min(-50).max(50).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setDisplacementBias(val);
  }).listen();

  // AI
  guiHandler.omAIEntityController = aiFolder.add(guiHandler.objectManipulationParameters, "AI entity").onChange(function(val){
    if (!!selectionHandler.getSelectedObject().steerableInfo){
      guiHandler.objectManipulationParameters["AI entity"] = true;
      return;
    }
    if (selectionHandler.getSelectedObject().isFPSWeapon){
      guiHandler.objectManipulationParameters["AI entity"] = false;
      return;
    }
    terminal.clear();
    if (val){
      var result = selectionHandler.getSelectedObject().useAsAIEntity();
      if (!result){
        terminal.printError(Text.AI_ENTITY_WITH_SAME_NAME_EXISTS);
        guiHandler.objectManipulationParameters["AI entity"] = false;
        return;
      }

      guiHandler.disableController(guiHandler.omFPSWeaponController);

      terminal.printInfo(Text.OBJECT_WILL_BE_USED_AS_AI_ENTITY);
    }else{

      guiHandler.enableController(guiHandler.omFPSWeaponController);
      selectionHandler.getSelectedObject().unUseAsAIEntity();
      terminal.printInfo(Text.OBJECT_WONT_BE_USED_AS_AI_ENTITY);
    }
  }).listen();
  guiHandler.omSteerableController = aiFolder.add(guiHandler.objectManipulationParameters, "Steerable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (!obj.isChangeable || obj.isFPSWeapon){
      guiHandler.objectManipulationParameters["Steerable"] = false;
      return;
    }

    terminal.clear();

    if (val && steeringHandler.usedEntityIDs[obj.name] && !obj.usedAsAIEntity){
      terminal.printError(Text.AI_ENTITY_WITH_SAME_NAME_EXISTS);
      guiHandler.objectManipulationParameters["Steerable"] = false;
      return;
    }

    var steeringMode = guiHandler.objectManipulationParameters["Steering mode"];

    if (val){

      if (steeringMode == steeringHandler.steeringModes.TRACK_VELOCITY && !obj.isDynamicObject){
        terminal.printError(Text.VELOCITY_TRACKING_STEERING_MODE_DYNAMIC);
        guiHandler.objectManipulationParameters["Steerable"] = false;
        return;
      }

      var maxSpeed = parseFloat(guiHandler.objectManipulationParameters["Max speed"]);
      var maxAcceleration = parseFloat(guiHandler.objectManipulationParameters["Max acceleration"]);
      var jumpSpeed = parseFloat(guiHandler.objectManipulationParameters["Jump speed"]);
      var lookSpeed = guiHandler.objectManipulationParameters["Look speed"];

      if (isNaN(maxSpeed)){
        terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "Max speed"));
        guiHandler.objectManipulationParameters["Steerable"] = false;
        return;
      }

      if (isNaN(maxAcceleration)){
        terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "Max acceleration"));
        guiHandler.objectManipulationParameters["Steerable"] = false;
        return;
      }

      if (isNaN(jumpSpeed)){
        terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "Jump speed"));
        guiHandler.objectManipulationParameters["Steerable"] = false;
        return;
      }

      if (obj.usedAsAIEntity){
        obj.unUseAsAIEntity();
      }

      obj.makeSteerable(steeringMode, maxSpeed, maxAcceleration, jumpSpeed, lookSpeed);

      guiHandler.objectManipulationParameters["AI entity"] = true;
      guiHandler.disableController(guiHandler.omAIEntityController);
      guiHandler.enableController(guiHandler.omSteeringModeController);
      guiHandler.enableController(guiHandler.omMaxAccelerationController);
      guiHandler.enableController(guiHandler.omMaxSpeedController);
      guiHandler.enableController(guiHandler.omJumpSpeedController);
      guiHandler.enableController(guiHandler.omLookSpeedController);
      guiHandler.disableController(guiHandler.omChangeableController);
      guiHandler.disableController(guiHandler.omFPSWeaponController);

      if (steeringMode == steeringHandler.steeringModes.TRACK_VELOCITY){
        guiHandler.disableController(guiHandler.omHasMassController);
      }

      terminal.printInfo(Text.OBJECT_IS_SET_AS_A_STEERABLE);
    }else{

      guiHandler.objectManipulationParameters["AI entity"] = false;
      guiHandler.enableController(guiHandler.omAIEntityController);
      guiHandler.disableController(guiHandler.omSteeringModeController);
      guiHandler.disableController(guiHandler.omMaxAccelerationController);
      guiHandler.disableController(guiHandler.omMaxSpeedController);
      guiHandler.disableController(guiHandler.omJumpSpeedController);
      guiHandler.disableController(guiHandler.omLookSpeedController);
      guiHandler.enableController(guiHandler.omChangeableController);
      guiHandler.enableController(guiHandler.omFPSWeaponController);

      obj.unmakeSteerable();

      if (steeringMode == steeringHandler.steeringModes.TRACK_VELOCITY){
        guiHandler.enableController(guiHandler.omHasMassController);
      }

      terminal.printInfo(Text.OBJECT_WONT_BE_USED_AS_STEERABLE);
    }
  }).listen();
  guiHandler.omSteeringModeController = aiFolder.add(guiHandler.objectManipulationParameters, "Steering mode", [steeringHandler.steeringModes.TRACK_POSITION, steeringHandler.steeringModes.TRACK_VELOCITY]).onChange(function(val){
    if (val == steeringHandler.steeringModes.TRACK_VELOCITY && !selectionHandler.getSelectedObject().isDynamicObject){
      guiHandler.objectManipulationParameters["Steering mode"] = steeringHandler.steeringModes.TRACK_POSITION;
      terminal.clear();
      terminal.printError(Text.VELOCITY_TRACKING_STEERING_MODE_DYNAMIC);
      selectionHandler.resetCurrentSelection();
      return;
    }
    selectionHandler.getSelectedObject().steerableInfo.mode = val;
    if (val == steeringHandler.steeringModes.TRACK_VELOCITY){
      guiHandler.disableController(guiHandler.omHasMassController);
    }else{
      guiHandler.enableController(guiHandler.omHasMassController);
    }
  }).listen();
  guiHandler.omMaxAccelerationController = aiFolder.add(guiHandler.objectManipulationParameters, "Max acceleration").onFinishChange(function(val){
    terminal.clear();
    var parsedVal = parseFloat(val);
    if (isNaN(parsedVal)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "Max acceleration"));
      return;
    }
    selectionHandler.getSelectedObject().steerableInfo.maxAcceleration = parsedVal;
    selectionHandler.getSelectedObject().steerable.maxAcceleration = parsedVal;
    terminal.printInfo(Text.IS_SET.replace(Text.PARAM1, "Max acceleration"));
  }).listen();
  guiHandler.omMaxSpeedController = aiFolder.add(guiHandler.objectManipulationParameters, "Max speed").onFinishChange(function(val){
    terminal.clear();
    var parsedVal = parseFloat(val);
    if (isNaN(parsedVal)){
      terminal.clear();
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "Max speed"));
      return;
    }
    selectionHandler.getSelectedObject().steerableInfo.maxSpeed = parsedVal;
    selectionHandler.getSelectedObject().steerable.maxSpeed = parsedVal;
    terminal.printInfo(Text.IS_SET.replace(Text.PARAM1, "Max speed"));
  }).listen();
  guiHandler.omJumpSpeedController = aiFolder.add(guiHandler.objectManipulationParameters, "Jump speed").onFinishChange(function(val){
    terminal.clear();
    var parsedVal = parseFloat(val);
    if (isNaN(parsedVal)){
      terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "Jump speed"));
      return;
    }
    selectionHandler.getSelectedObject().steerableInfo.jumpSpeed = parsedVal;
    selectionHandler.getSelectedObject().steerable.jumpSpeed = parsedVal;
    terminal.printInfo(Text.IS_SET.replace(Text.PARAM1, "Jump speed"));
  }).listen();
  guiHandler.omLookSpeedController = aiFolder.add(guiHandler.objectManipulationParameters, "Look speed").min(0.01).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().steerableInfo.lookSpeed = val;
    selectionHandler.getSelectedObject().steerable.lookSpeed = val;
  }).listen();

  if (!!selectionHandler.getSelectedObject().steerableInfo){
    var behaviorCount = Object.keys(selectionHandler.getSelectedObject().steerableInfo.behaviorsByID).length;
    if (behaviorCount > 0){
      var behaviorsFolder = aiFolder.addFolder("Behaviors");
      for (var behaviorName in selectionHandler.getSelectedObject().steerableInfo.behaviorsByID){
        var behavior = selectionHandler.getSelectedObject().steerableInfo.behaviorsByID[behaviorName];
        var behaviorFolder = behaviorsFolder.addFolder(behavior.parameters.name);
        behaviorFolder.add({"Unassign": function(){
          terminal.clear();
          parseCommand("unassignSteeringBehavior " + selectionHandler.getSelectedObject().name + " " + this.name);
        }.bind({name: behavior.parameters.name})}, "Unassign");
      }
    }
  }

  // MOTION BLUR
  guiHandler.omHasObjectTrailController = motionBlurFolder.add(guiHandler.objectManipulationParameters, "Motion blur").onChange(function(val){
    if (val){
      selectionHandler.getSelectedObject().objectTrailConfigurations = {alpha: guiHandler.objectManipulationParameters["mb alpha"], time: guiHandler.objectManipulationParameters["mb time"]};
      guiHandler.enableController(guiHandler.omObjectTrailAlphaController);
      guiHandler.enableController(guiHandler.omObjectTrailTimeController);
    }else{
      delete selectionHandler.getSelectedObject().objectTrailConfigurations;
      guiHandler.disableController(guiHandler.omObjectTrailAlphaController);
      guiHandler.disableController(guiHandler.omObjectTrailTimeController);
    }
  }).listen();
  guiHandler.omObjectTrailAlphaController = motionBlurFolder.add(guiHandler.objectManipulationParameters, "mb alpha").min(0.01).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().objectTrailConfigurations.alpha = val;
  }).listen();
  guiHandler.omObjectTrailTimeController = motionBlurFolder.add(guiHandler.objectManipulationParameters, "mb time").min(1/15).max(OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT).step(1/60).onChange(function(val){
    selectionHandler.getSelectedObject().objectTrailConfigurations.time = val;
  }).listen();
}

GUIHandler.prototype.initializeContainerManipulationGUI = function(){
  guiHandler.datGuiContainerManipulation = new dat.GUI({hideable: false, width: 420});
  guiHandler.datGuiContainerManipulation.domElement.addEventListener("mousedown", function(e){
    cmGUIFocused = true;
  });
  guiHandler.containerManipulationNameController = guiHandler.datGuiContainerManipulation.add(guiHandler.containerManipulationParameters, "Container").listen();

  var positionFolder = guiHandler.datGuiContainerManipulation.addFolder("Position");
  var sizeFolder = guiHandler.datGuiContainerManipulation.addFolder("Size");
  var paddingFolder = guiHandler.datGuiContainerManipulation.addFolder("Padding");
  var generalFolder = guiHandler.datGuiContainerManipulation.addFolder("General");
  var borderFolder = guiHandler.datGuiContainerManipulation.addFolder("Border");
  var backgroundFolder = guiHandler.datGuiContainerManipulation.addFolder("Background");

  // POSITION
  guiHandler.containerManipulationCenterXController = positionFolder.add(guiHandler.containerManipulationParameters, "Center X").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setCenter(val, selectionHandler.getSelectedObject().centerYPercent);
  }).listen();
  guiHandler.containerManipulationCenterYController = positionFolder.add(guiHandler.containerManipulationParameters, "Center Y").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setCenter(selectionHandler.getSelectedObject().centerXPercent, val);
  }).listen();

  // SIZE
  guiHandler.containerManipulationWidthController = sizeFolder.add(guiHandler.containerManipulationParameters, "Width").min(0.1).max(150).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setWidth(val);
    if (selectionHandler.getSelectedObject().alignedParent){
      var ary = selectionHandler.getSelectedObject().alignedParent.alignedContainerInfos[selectionHandler.getSelectedObject().name];
      for (var i = 0; i<ary.length; i++){
        selectionHandler.getSelectedObject().alignedParent.handleAlignment(ary[i]);
      }
    }
  }).listen();
  guiHandler.containerManipulationHeightController = sizeFolder.add(guiHandler.containerManipulationParameters, "Height").min(0.1).max(150).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setHeight(val);
    if (selectionHandler.getSelectedObject().alignedParent){
      var ary = selectionHandler.getSelectedObject().alignedParent.alignedContainerInfos[selectionHandler.getSelectedObject().name];
      for (var i = 0; i<ary.length; i++){
        selectionHandler.getSelectedObject().alignedParent.handleAlignment(ary[i]);
      }
    }
  }).listen();

  // PADDING
  guiHandler.containerManipulationPaddingXController = paddingFolder.add(guiHandler.containerManipulationParameters, "Padding X").min(0).max(99.9).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setPaddingX(val);
  }).listen();
  guiHandler.containerManipulationPaddingYController = paddingFolder.add(guiHandler.containerManipulationParameters, "Padding Y").min(0).max(99.9).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setPaddingY(val);
  }).listen();

  // GENERAL
  guiHandler.containerManipulationSquareController = generalFolder.add(guiHandler.containerManipulationParameters, "Square").onChange(function(val){
    selectionHandler.getSelectedObject().isSquare = val;
    if (val){
      selectionHandler.getSelectedObject().makeSquare();
    }else{
      selectionHandler.getSelectedObject().setWidth(selectionHandler.getSelectedObject().widthPercent * selectionHandler.getSelectedObject().scaleWidth);
      selectionHandler.getSelectedObject().setHeight(selectionHandler.getSelectedObject().heightPercent * selectionHandler.getSelectedObject().scaleHeight);
      selectionHandler.getSelectedObject().scaleWidth = 1;
      selectionHandler.getSelectedObject().scaleHeight = 1;
    }
  }).listen();
  guiHandler.containerManipulationClickableController = generalFolder.add(guiHandler.containerManipulationParameters, "Clickable").onChange(function(val){
    selectionHandler.getSelectedObject().isClickable = val;
  }).listen();

  // BORDER
  guiHandler.containerManipulationHasBorderController = borderFolder.add(guiHandler.containerManipulationParameters, "Has border").onChange(function(val){
    if (val){
      selectionHandler.getSelectedObject().setBorder(guiHandler.containerManipulationParameters["Border color"], guiHandler.containerManipulationParameters["Border thickness"]);
      guiHandler.enableController(guiHandler.containerManipulationBorderColorController);
      guiHandler.enableController(guiHandler.containerManipulationBorderThicknessController);
    }else{
      selectionHandler.getSelectedObject().removeBorder();
      guiHandler.disableController(guiHandler.containerManipulationBorderColorController);
      guiHandler.disableController(guiHandler.containerManipulationBorderThicknessController);
    }
  }).listen();
  guiHandler.containerManipulationBorderColorController = borderFolder.add(guiHandler.containerManipulationParameters, "Border color").onFinishChange(function(val){
    selectionHandler.getSelectedObject().setBorder(guiHandler.containerManipulationParameters["Border color"], guiHandler.containerManipulationParameters["Border thickness"]);
  }).listen();
  guiHandler.containerManipulationBorderThicknessController = borderFolder.add(guiHandler.containerManipulationParameters, "Border thickness").min(0.001).max(0.1).step(0.0001).onChange(function(val){
    selectionHandler.getSelectedObject().setBorder(guiHandler.containerManipulationParameters["Border color"], guiHandler.containerManipulationParameters["Border thickness"]);
  }).listen();

  // BACKGROUND
  guiHandler.containerManipulationHasBackgroundController = backgroundFolder.add(guiHandler.containerManipulationParameters, "Has background").onChange(function(val){
    var allTexturePackNames = Object.keys(texturePacks);
    if (val){
      guiHandler.enableController(guiHandler.containerManipulationBackgroundColorController);
      guiHandler.enableController(guiHandler.containerManipulationBackgroundAlphaController);
      if (allTexturePackNames.length > 0){
        guiHandler.enableController(guiHandler.containerManipulationHasBackgroundTextureController);
        guiHandler.enableController(guiHandler.containerManipulationBackgroundTextureController);
      }
      var bgColor = guiHandler.containerManipulationParameters["BG color"];
      var bgAlpha = guiHandler.containerManipulationParameters["BG alpha"];
      var bgTextureName = (guiHandler.containerManipulationParameters["Has BG texture"] && guiHandler.containerManipulationParameters["BG texture"])? guiHandler.containerManipulationParameters["BG texture"]: null;
      selectionHandler.getSelectedObject().setBackground(bgColor, bgAlpha, bgTextureName);
    }else{
      guiHandler.disableController(guiHandler.containerManipulationBackgroundColorController);
      guiHandler.disableController(guiHandler.containerManipulationBackgroundAlphaController);
      guiHandler.disableController(guiHandler.containerManipulationHasBackgroundTextureController);
      guiHandler.disableController(guiHandler.containerManipulationBackgroundTextureController);
      selectionHandler.getSelectedObject().removeBackground();
    }
  }).listen();
  guiHandler.containerManipulationBackgroundColorController = backgroundFolder.add(guiHandler.containerManipulationParameters, "BG color").onFinishChange(function(val){
    var bgColor = val;
    var bgAlpha = guiHandler.containerManipulationParameters["BG alpha"];
    var bgTextureName = (guiHandler.containerManipulationParameters["Has BG texture"] && guiHandler.containerManipulationParameters["BG texture"])? guiHandler.containerManipulationParameters["BG texture"]: null;
    selectionHandler.getSelectedObject().setBackground(bgColor, bgAlpha, bgTextureName);
  }).listen();
  guiHandler.containerManipulationBackgroundAlphaController = backgroundFolder.add(guiHandler.containerManipulationParameters, "BG alpha").min(0).max(1).step(0.01).onChange(function(val){
    var bgColor = guiHandler.containerManipulationParameters["BG color"];
    var bgAlpha = val;
    var bgTextureName = (guiHandler.containerManipulationParameters["Has BG texture"] && guiHandler.containerManipulationParameters["BG texture"])? guiHandler.containerManipulationParameters["BG texture"]: null;
    selectionHandler.getSelectedObject().setBackground(bgColor, bgAlpha, bgTextureName);
  }).listen();
  guiHandler.containerManipulationHasBackgroundTextureController = backgroundFolder.add(guiHandler.containerManipulationParameters, "Has BG texture").onChange(function(val){
     var hasBG = guiHandler.containerManipulationParameters["Has background"];
     var allTexturePackNames = Object.keys(texturePacks);
     if (!hasBG || allTexturePackNames.length == 0){
       guiHandler.containerManipulationParameters["Has BG texture"] = false;
       return;
     }
     var bgColor = guiHandler.containerManipulationParameters["BG color"];
     var bgAlpha = guiHandler.containerManipulationParameters["BG alpha"];
     if (val){
       if (!texturePacks[guiHandler.containerManipulationParameters["BG texture"]]){
         guiHandler.containerManipulationParameters["BG texture"] = allTexturePackNames[0];
       }
       guiHandler.enableController(guiHandler.containerManipulationBackgroundTextureController);
       selectionHandler.getSelectedObject().setBackground(bgColor, bgAlpha, guiHandler.containerManipulationParameters["BG texture"]);
     }else{
       guiHandler.disableController(guiHandler.containerManipulationBackgroundTextureController);
       selectionHandler.getSelectedObject().setBackground(bgColor, bgAlpha, null);
     }
  }).listen();
  guiHandler.containerManipulationBackgroundTextureController = backgroundFolder.add(guiHandler.containerManipulationParameters, "BG texture", Object.keys(texturePacks)).onChange(function(val){
    var bgColor = guiHandler.containerManipulationParameters["BG color"];
    var bgAlpha = guiHandler.containerManipulationParameters["BG alpha"];
    selectionHandler.getSelectedObject().setBackground(bgColor, bgAlpha, val);
  }).listen();
}

GUIHandler.prototype.initializeSpriteManipulationGUI = function(){
  guiHandler.datGuiSpriteManipulation = new dat.GUI({hideable: false, width: 420});
  guiHandler.datGuiSpriteManipulation.domElement.addEventListener("mousedown", function(e){
    smGUIFocused = true;
  });
  guiHandler.spriteManipulationSpriteNameController = guiHandler.datGuiSpriteManipulation.add(guiHandler.spriteManipulationParameters, "Sprite").listen();

  var graphicsFolder = guiHandler.datGuiSpriteManipulation.addFolder("Graphics");
  var marginFolder = guiHandler.datGuiSpriteManipulation.addFolder("Margin");
  var textureFolder = guiHandler.datGuiSpriteManipulation.addFolder("Texture");
  var scaleFolder = guiHandler.datGuiSpriteManipulation.addFolder("Scale");
  var sizeFolder = guiHandler.datGuiSpriteManipulation.addFolder("Size");
  var generalFolder = guiHandler.datGuiSpriteManipulation.addFolder("General");

  // GRAPHICS
  guiHandler.spriteManipulationColorController = graphicsFolder.add(guiHandler.spriteManipulationParameters, "Color").onFinishChange(function(val){
    selectionHandler.getSelectedObject().setColor(val);
  }).listen();
  guiHandler.spriteManipulationAlphaController = graphicsFolder.add(guiHandler.spriteManipulationParameters, "Alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setAlpha(val);
  }).listen();

  // MARGIN
  guiHandler.spriteManipulationMarginModeController = marginFolder.add(guiHandler.spriteManipulationParameters, "Margin mode", ["Top/Left", "Bottom/Right", "Center"]).onChange(function(val){
    var marginMode = MARGIN_MODE_2D_CENTER;
    if (val == "Top/Left"){
      marginMode = MARGIN_MODE_2D_TOP_LEFT;
    }else if (val == "Bottom/Right"){
      marginMode = MARGIN_MODE_2D_BOTTOM_RIGHT;
    }
    selectionHandler.getSelectedObject().marginMode = marginMode;
    selectionHandler.getSelectedObject().set2DCoordinates(selectionHandler.getSelectedObject().marginPercentX, selectionHandler.getSelectedObject().marginPercentY);
  }).listen();
  guiHandler.spriteManipulationMarginXController = marginFolder.add(guiHandler.spriteManipulationParameters, "Margin X").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(val, selectionHandler.getSelectedObject().marginPercentY);
  }).listen();
  guiHandler.spriteManipulationMarginYController = marginFolder.add(guiHandler.spriteManipulationParameters, "Margin Y").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(selectionHandler.getSelectedObject().marginPercentX, val);
  }).listen();

  // TEXTURE
  guiHandler.spriteManipulationHasTextureController = textureFolder.add(guiHandler.spriteManipulationParameters, "Has texture").onChange(function(val){
    if (Object.keys(texturePacks).length == 0){
      guiHandler.spriteManipulationParameters["Has texture"] = false;
      return;
    }
    if (val){
      guiHandler.enableController(guiHandler.spriteManipulationTextureController);
      var textureName = guiHandler.spriteManipulationParameters["Texture"];
      if (texturePacks[textureName]){
        selectionHandler.getSelectedObject().mapTexture(texturePacks[textureName]);
      }
    }else{
      guiHandler.disableController(guiHandler.spriteManipulationTextureController);
      selectionHandler.getSelectedObject().removeTexture();
    }
  }).listen();
  guiHandler.spriteManipulationTextureController = textureFolder.add(guiHandler.spriteManipulationParameters, "Texture", Object.keys(texturePacks)).onChange(function(val){
    selectionHandler.getSelectedObject().mapTexture(texturePacks[val]);
  }).listen();

  // SCALE
  guiHandler.spriteManipulationScaleXController = scaleFolder.add(guiHandler.spriteManipulationParameters, "Scale X").min(0.1).max(20).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setScale(val, selectionHandler.getSelectedObject().mesh.material.uniforms.scale.value.y);
    selectionHandler.getSelectedObject().originalWidth = selectionHandler.getSelectedObject().calculateWidthPercent();
    selectionHandler.getSelectedObject().originalWidthReference = renderer.getCurrentViewport().z;
    selectionHandler.getSelectedObject().originalScreenResolution = screenResolution;
  }).listen();
  guiHandler.spriteManipulationScaleYController = scaleFolder.add(guiHandler.spriteManipulationParameters, "Scale Y").min(0.1).max(20).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setScale(selectionHandler.getSelectedObject().mesh.material.uniforms.scale.value.x, val);
    selectionHandler.getSelectedObject().originalHeight = selectionHandler.getSelectedObject().calculateHeightPercent();
    selectionHandler.getSelectedObject().originalHeightReference = renderer.getCurrentViewport().w;
    selectionHandler.getSelectedObject().originalScreenResolution = screenResolution;
  }).listen();

  // SIZE
  guiHandler.spriteManipulationHasFixedWidthController = sizeFolder.add(guiHandler.spriteManipulationParameters, "Width fixed").onChange(function(val){
    if (selectionHandler.getSelectedObject().containerParent){
      guiHandler.spriteManipulationParameters["Width fixed"] = true;
      return;
    }
    if (val){
      selectionHandler.getSelectedObject().fixedWidth = guiHandler.spriteManipulationParameters["Width %"];
      selectionHandler.getSelectedObject().setWidthPercent(selectionHandler.getSelectedObject().fixedWidth);
      guiHandler.disableController(guiHandler.spriteManipulationScaleXController);
      guiHandler.enableController(guiHandler.spriteManipulationFixedWidthController);
    }else {
      delete selectionHandler.getSelectedObject().fixedWidth;
      guiHandler.spriteManipulationParameters["Scale X"] = 1;
      selectionHandler.getSelectedObject().setScale(1, selectionHandler.getSelectedObject().mesh.material.uniforms.scale.value.y);
      guiHandler.disableController(guiHandler.spriteManipulationFixedWidthController);
      guiHandler.enableController(guiHandler.spriteManipulationScaleXController);
    }
    selectionHandler.getSelectedObject().originalWidth = selectionHandler.getSelectedObject().calculateWidthPercent();
    selectionHandler.getSelectedObject().originalWidthReference = renderer.getCurrentViewport().z;
    selectionHandler.getSelectedObject().originalScreenResolution = screenResolution;
  }).listen();
  guiHandler.spriteManipulationFixedWidthController = sizeFolder.add(guiHandler.spriteManipulationParameters, "Width %").min(0.1).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setWidthPercent(val);
    selectionHandler.getSelectedObject().fixedWidth = val;
    selectionHandler.getSelectedObject().originalWidth = selectionHandler.getSelectedObject().calculateWidthPercent();
    selectionHandler.getSelectedObject().originalWidthReference = renderer.getCurrentViewport().z;
    selectionHandler.getSelectedObject().originalScreenResolution = screenResolution;
  }).listen();
  guiHandler.spriteManipulationHasFixedHeightController = sizeFolder.add(guiHandler.spriteManipulationParameters, "Height fixed").onChange(function(val){
    if (selectionHandler.getSelectedObject().containerParent){
      guiHandler.spriteManipulationParameters["Height fixed"] = true;
      return;
    }
    if (val){
      selectionHandler.getSelectedObject().fixedHeight = guiHandler.spriteManipulationParameters["Height %"];
      selectionHandler.getSelectedObject().setHeightPercent(selectionHandler.getSelectedObject().fixedHeight);
      guiHandler.disableController(guiHandler.spriteManipulationScaleYController);
      guiHandler.enableController(guiHandler.spriteManipulationFixedHeightController);
    }else {
      delete selectionHandler.getSelectedObject().fixedHeight;
      guiHandler.spriteManipulationParameters["Scale Y"] = 1;
      selectionHandler.getSelectedObject().setScale(selectionHandler.getSelectedObject().mesh.material.uniforms.scale.value.x, 1);
      guiHandler.disableController(guiHandler.spriteManipulationFixedHeightController);
      guiHandler.enableController(guiHandler.spriteManipulationScaleYController);
    }
    selectionHandler.getSelectedObject().originalHeight = selectionHandler.getSelectedObject().calculateHeightPercent();
    selectionHandler.getSelectedObject().originalHeightReference = renderer.getCurrentViewport().w;
    selectionHandler.getSelectedObject().originalScreenResolution = screenResolution;
  }).listen();
  guiHandler.spriteManipulationFixedHeightController = sizeFolder.add(guiHandler.spriteManipulationParameters, "Height %").min(0.1).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().setHeightPercent(val);
    selectionHandler.getSelectedObject().fixedHeight = val;
    selectionHandler.getSelectedObject().originalHeight = selectionHandler.getSelectedObject().calculateHeightPercent();
    selectionHandler.getSelectedObject().originalHeightReference = renderer.getCurrentViewport().w;
    selectionHandler.getSelectedObject().originalScreenResolution = screenResolution;
  }).listen();
  guiHandler.spriteManipulationCropCoefficientXController = sizeFolder.add(guiHandler.spriteManipulationParameters, "Crop X").min(0.01).max(1).step(0.01).onChange(function(val) {
    var sprite = selectionHandler.getSelectedObject();
    var coefY = sprite.cropCoefficientY ? sprite.cropCoefficientY : 1.0;
    sprite.setCropCoefficient(val, coefY);
  }).listen();
  guiHandler.spriteManipulationCropCoefficientYController = sizeFolder.add(guiHandler.spriteManipulationParameters, "Crop Y").min(0.01).max(1).step(0.01).onChange(function(val) {
    var sprite = selectionHandler.getSelectedObject();
    var coefX = sprite.cropCoefficientX ? sprite.cropCoefficientX : 1.0;
    sprite.setCropCoefficient(coefX, val);
  }).listen();

  // ROTATION
  guiHandler.spriteManipulationRotationController = guiHandler.datGuiSpriteManipulation.add(guiHandler.spriteManipulationParameters, "Rotation").min(0).max(360).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setRotation(val);
  }).listen();

  // GENERAL
  guiHandler.spriteManipulationClickableController = generalFolder.add(guiHandler.spriteManipulationParameters, "Clickable").onChange(function(val){
    selectionHandler.getSelectedObject().isClickable = val;
    if (!val){
       selectionHandler.getSelectedObject().isDraggable = false;
       guiHandler.spriteManipulationParameters["Draggable"] = false;
       guiHandler.disableController(guiHandler.spriteManipulationDraggableController);
    } else{
      guiHandler.enableController(guiHandler.spriteManipulationDraggableController);
    }
  }).listen();
  guiHandler.spriteManipulationDraggableController = generalFolder.add(guiHandler.spriteManipulationParameters, "Draggable").onChange(function(val){
    if (!selectionHandler.getSelectedObject().isClickable){
      guiHandler.spriteManipulationParameters["Draggable"] = false;
      return;
    }
    selectionHandler.getSelectedObject().isDraggable = val;
  }).listen();
}

GUIHandler.prototype.initializeTextManipulationGUI = function(){
  guiHandler.datGuiTextManipulation = new dat.GUI({hideable: false, width: 420});
  guiHandler.datGuiTextManipulation.domElement.addEventListener("mousedown", function(e){
    tmGUIFocused = true;
  });
  guiHandler.textManipulationTextNameController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Text").listen();
  guiHandler.textManipulationContentController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Content").onChange(function(val){
    var addedText = selectionHandler.getSelectedObject();
    val = val.split("\\n").join("\n");
    var val2 = val.split("\n").join("");
    if (val2.length > addedText.strlen){
      terminal.clear();
      terminal.printError(Text.THIS_TEXT_IS_ALLOCATED_FOR.replace(Text.PARAM1, addedText.strlen));
      guiHandler.textManipulationParameters["Content"] = addedText.text;
      return;
    }
    addedText.setText(val);
    if (addedText.containerParent){
      addedText.containerParent.insertAddedText(addedText);
    }
  }).listen();

  var graphicsFolder = guiHandler.datGuiTextManipulation.addFolder("Graphics");
  var backgroundFolder = guiHandler.datGuiTextManipulation.addFolder("Background");
  var spacingFolder = guiHandler.datGuiTextManipulation.addFolder("Spacing");
  var generalFolder = guiHandler.datGuiTextManipulation.addFolder("General");
  var folder2D = guiHandler.datGuiTextManipulation.addFolder("2D");

  // GRAPHICS
  guiHandler.textManipulationTextColorController = graphicsFolder.add(guiHandler.textManipulationParameters, "Text color").onFinishChange(function(val){
    selectionHandler.getSelectedObject().setColor(val);
  }).listen();
  guiHandler.textManipulationAlphaController = graphicsFolder.add(guiHandler.textManipulationParameters, "Alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setAlpha(val);
  }).listen();
  guiHandler.textManipulationShaderPrecisionController = graphicsFolder.add(guiHandler.textManipulationParameters, "Shader precision", ["default", "low", "medium", "high"]).onChange(function(val){
    switch(val){
      case "default":
        selectionHandler.getSelectedObject().useDefaultPrecision();
      break;
      case "low":
        selectionHandler.getSelectedObject().useCustomShaderPrecision(shaderPrecisionHandler.precisionTypes.LOW);
      break;
      case "medium":
        selectionHandler.getSelectedObject().useCustomShaderPrecision(shaderPrecisionHandler.precisionTypes.MEDIUM);
      break;
      case "high":
        selectionHandler.getSelectedObject().useCustomShaderPrecision(shaderPrecisionHandler.precisionTypes.HIGH);
      break;
    }
    terminal.clear();
    terminal.printInfo(Text.SHADER_PRECISION_ADJUSTED);
  }).listen();

  // BACKGROUND
  guiHandler.textManipulationHasBackgroundController = backgroundFolder.add(guiHandler.textManipulationParameters, "Has bg").onChange(function(val){
    if (val){
      selectionHandler.getSelectedObject().setBackground("#000000", 1);
      guiHandler.enableController(guiHandler.textManipulationBackgroundColorController);
      guiHandler.enableController(guiHandler.textManipulationBackgroundAlphaController);
    }else{
      selectionHandler.getSelectedObject().removeBackground();
      guiHandler.disableController(guiHandler.textManipulationBackgroundColorController);
      guiHandler.disableController(guiHandler.textManipulationBackgroundAlphaController);
    }
    guiHandler.textManipulationParameters["Bg color"] = "#000000";
    guiHandler.textManipulationParameters["Alpha"] = 1;
  }).listen();
  guiHandler.textManipulationBackgroundColorController = backgroundFolder.add(guiHandler.textManipulationParameters, "Bg color").onFinishChange(function(val){
    selectionHandler.getSelectedObject().setBackground(val, selectionHandler.getSelectedObject().getBackgroundAlpha());
  }).listen();
  guiHandler.textManipulationBackgroundAlphaController = backgroundFolder.add(guiHandler.textManipulationParameters, "Bg alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setBackground(
      "#" + selectionHandler.getSelectedObject().getBackgroundColor().getHexString(),
      val
    );
  }).listen();

  // SPACING
  guiHandler.textManipulationCharacterSizeController = spacingFolder.add(guiHandler.textManipulationParameters, "Char size").min(0.5).max(200).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setCharSize(val);
    selectionHandler.getSelectedObject().refCharSize= val;
    selectionHandler.getSelectedObject().refInnerHeight = window.innerHeight;
    selectionHandler.getSelectedObject().handleResize();
    if (selectionHandler.getSelectedObject().containerParent){
      selectionHandler.getSelectedObject().containerParent.insertAddedText(selectionHandler.getSelectedObject());
    }
  }).listen();
  guiHandler.textManipulationCharacterMarginController = spacingFolder.add(guiHandler.textManipulationParameters, "Char margin").min(0.5).max(100).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setMarginBetweenChars(val);
    selectionHandler.getSelectedObject().handleResize();
    if (selectionHandler.getSelectedObject().containerParent){
      selectionHandler.getSelectedObject().containerParent.insertAddedText(selectionHandler.getSelectedObject());
    }
  }).listen();
  guiHandler.textManipulationLineMarginController = spacingFolder.add(guiHandler.textManipulationParameters, "Line margin").min(0.5).max(100).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setMarginBetweenLines(val);
    selectionHandler.getSelectedObject().handleResize();
    if (selectionHandler.getSelectedObject().containerParent){
      selectionHandler.getSelectedObject().containerParent.insertAddedText(selectionHandler.getSelectedObject());
    }
  }).listen();

  // GENERAL
  guiHandler.textManipulationClickableController = generalFolder.add(guiHandler.textManipulationParameters, "Clickable").onChange(function(val){
    selectionHandler.getSelectedObject().isClickable = val;
  }).listen();
  guiHandler.textManipulationAffectedByFogController = generalFolder.add(guiHandler.textManipulationParameters, "Aff. by fog").onChange(function(val){
    selectionHandler.getSelectedObject().setAffectedByFog(val);
  }).listen();

  // 2D
  guiHandler.textManipulationIs2DController = folder2D.add(guiHandler.textManipulationParameters, "is 2D").onChange(function(val){
    sceneHandler.onAddedTextDeletion(selectionHandler.getSelectedObject());
    selectionHandler.getSelectedObject().set2DStatus(val);
    if (val){
      for (var animName in selectionHandler.getSelectedObject().animations){
        var anim = selectionHandler.getSelectedObject().animations[animName];
        if (anim.description.action == animationHandler.actionTypes.TEXT.POSITION_Z){
          selectionHandler.getSelectedObject().removeAnimation(anim);
        }
      }
    }
    sceneHandler.onAddedTextCreation(selectionHandler.getSelectedObject());
    refreshRaycaster("Ok")
    if (val){
      guiHandler.enableController(guiHandler.textManipulationMarginModeController);
      guiHandler.enableController(guiHandler.textManipulationMarginXController);
      guiHandler.enableController(guiHandler.textManipulationMarginYController);
      guiHandler.enableController(guiHandler.textManipulationMaxWidthPercentController);
      guiHandler.enableController(guiHandler.textManipulationMaxHeightPercentController);
      guiHandler.disableController(guiHandler.textManipulationAffectedByFogController);
      selectionHandler.getSelectedObject().set2DCoordinates(
        selectionHandler.getSelectedObject().marginPercentWidth, selectionHandler.getSelectedObject().marginPercentHeight
      );
      selectionHandler.getSelectedObject().setAffectedByFog(false);
      guiHandler.textManipulationParameters["Aff. by fog"] = false;
    }else{
      guiHandler.disableController(guiHandler.textManipulationMarginModeController);
      guiHandler.disableController(guiHandler.textManipulationMarginXController);
      guiHandler.disableController(guiHandler.textManipulationMarginYController);
      guiHandler.disableController(guiHandler.textManipulationMaxWidthPercentController);
      guiHandler.disableController(guiHandler.textManipulationMaxHeightPercentController);
      guiHandler.enableController(guiHandler.textManipulationAffectedByFogController);
      if (selectionHandler.getSelectedObject().containerParent){
        selectionHandler.getSelectedObject().containerParent.removeAddedText();
      }
    }
    selectionHandler.getSelectedObject().handleResize();
    var obj = selectionHandler.getSelectedObject();
    selectionHandler.resetCurrentSelection();
    selectionHandler.select(obj);
  }).listen();
  guiHandler.textManipulationMarginModeController = folder2D.add(guiHandler.textManipulationParameters, "Margin mode", ["Top/Left", "Bottom/Right", "Center"]).onChange(function(val){
    if (val == "Top/Left"){
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_TOP_LEFT;
    }else if (val == "Bottom/Right"){
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_BOTTOM_RIGHT;
    }else{
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_CENTER;
    }
    selectionHandler.getSelectedObject().set2DCoordinates(selectionHandler.getSelectedObject().marginPercentWidth, selectionHandler.getSelectedObject().marginPercentHeight);
    if (selectionHandler.getSelectedObject().containerParent){
      selectionHandler.getSelectedObject().containerParent.insertAddedText(selectionHandler.getSelectedObject());
    }
  }).listen();
  guiHandler.textManipulationMarginXController = folder2D.add(guiHandler.textManipulationParameters, "Margin X").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(
      val, selectionHandler.getSelectedObject().marginPercentHeight
    );
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationMarginYController = folder2D.add(guiHandler.textManipulationParameters, "Margin Y").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(
      selectionHandler.getSelectedObject().marginPercentWidth, val
    );
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationMaxWidthPercentController = folder2D.add(guiHandler.textManipulationParameters, "Max width%").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().maxWidthPercent = val;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationMaxHeightPercentController = folder2D.add(guiHandler.textManipulationParameters, "Max height%").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().maxHeightPercent = val;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
}

GUIHandler.prototype.initializeBloomGUI = function(){
  guiHandler.datGuiBloom = new dat.GUI({hideable: false, width: 420});
  guiHandler.bloomThresholdController = guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Threshold").min(0).max(1).step(0.01).onChange(function(val){
    bloom.setThreshold(val);
  }).listen();
  guiHandler.bloomActiveController = guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Strength").min(0).max(100).step(0.1).onChange(function(val){
    bloom.setBloomStrength(val);
  }).listen();
  guiHandler.bloomExposureController = guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Exposure").min(0).max(100).step(0.01).onChange(function(val){
    bloom.setExposure(val);
  }).listen();
  guiHandler.bloomGammaController = guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Gamma").min(0).max(100).step(0.01).onChange(function(val){
    bloom.setGamma(val);
  }).listen();
  guiHandler.bloomBlurStepAmountController = guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "BlurStepAmount").min(1).max(5).step(1).onChange(function(val){
    bloom.setBlurStepCount(val);
    for (var i = 0; i < 5; i++){
      guiHandler.enableController(guiHandler["blurPassFactorController"+(i+1)]);
      guiHandler.enableController(guiHandler["blurPassTintColorController"+(i+1)]);
      guiHandler.enableController(guiHandler["blurPassTapController"+(i+1)]);
    }
    for (var i = val; i < 5; i++){
      guiHandler.disableController(guiHandler["blurPassFactorController"+(i+1)]);
      guiHandler.disableController(guiHandler["blurPassTintColorController"+(i+1)]);
      guiHandler.disableController(guiHandler["blurPassTapController"+(i+1)]);
    }
  }).listen();
  guiHandler.bloomActiveController = guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Active").onChange(function(val){
    renderer.bloomOn = val;
  }).listen();
  for (var i = 0; i<5; i++){
    var blurPassFolder = guiHandler.datGuiBloom.addFolder("BlurPass"+(i+1));
    guiHandler["blurPassFactorController"+(i+1)] = blurPassFolder.add(guiHandler.bloomParameters["BlurPass"+(i+1)], "Factor").min(0).max(1).step(0.01).onChange(function(val){
      bloom.setBloomFactor(this.index, val);
    }.bind({index: i})).listen();
    guiHandler["blurPassTapController"+(i+1)] = blurPassFolder.add(guiHandler.bloomParameters["BlurPass"+(i+1)], "Quality", ["high", "medium", "low"]).onChange(function(val){
      var tapAmount;
      if (val == "high"){
        tapAmount = 13;
      }else if (val == "medium"){
        tapAmount = 9;
      }else if (val == "low"){
        tapAmount = 5;
      }else{
        throw new Error("Unknown tap type.");
      }
      bloom.setTapForLevel(this.index, tapAmount);
    }.bind({index: i})).listen();
    guiHandler["blurPassTintColorController"+(i+1)] = blurPassFolder.add(guiHandler.bloomParameters["BlurPass"+(i+1)], "Color").onFinishChange(function(val){
      REUSABLE_COLOR.set(val);
      bloom.setBloomTintColor(this.index, REUSABLE_COLOR.r, REUSABLE_COLOR.g, REUSABLE_COLOR.b);
    }.bind({index: i})).listen();
  }
  guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Done");
}
