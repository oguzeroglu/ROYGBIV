var GUIHandler = function(){
  this.objectManipulationParameters = {
    "Object": "objectName",
    "Rotate x": 0.0,
    "Rotate y": 0.0,
    "Rotate z": 0.0,
    "Mass": 0.0,
    "Phy. simpl.": false,
    "Slippery": false,
    "Changeable": false,
    "Intersectable": false,
    "Colorizable": false,
    "Has mass": true,
    "Shader precision": "default",
    "FPS Weapon": false,
    "Side": "Both",
    "Hide half": "None",
    "Blending": "None",
    "Texture offset x": 0.0,
    "Texture offset y": 0.0,
    "Opacity": 1.0,
    "AO intensity": 0.0,
    "Emissive int.": 0.0,
    "Emissive col.": "#ffffff",
    "Disp. scale": 0.0,
    "Disp. bias": 0.0,
    "Motion blur": false,
    "mb alpha": 1.0,
    "mb time": OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT
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
    "Done": function(){
      terminal.clear();
      parseCommand("workerConfigurations hide");
    }
  }
  // GUI TYPES DEFINITION
  this.guiTypes = {
    TEXT: 0, OBJECT: 1, BLOOM: 2, FPS_WEAPON_ALIGNMENT: 3, SHADER_PRECISION: 4, PARTICLE_SYSTEM: 5, WORKER_STATUS: 6, MUZZLE_FLASH: 7, TEXTURE_PACK: 8, SKYBOX_CREATION: 9, FOG: 10
  };
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
    guiHandler.textManipulationParameters["Text color"] = "#" + curSelection.material.uniforms.color.value.getHexString();
    guiHandler.textManipulationParameters["Alpha"] = curSelection.material.uniforms.alpha.value;
    guiHandler.textManipulationParameters["Has bg"] = (curSelection.hasBackground);
    if (curSelection.hasBackground){
      guiHandler.textManipulationParameters["Bg color"] = "#" + curSelection.material.uniforms.backgroundColor.value.getHexString();
      guiHandler.textManipulationParameters["Bg alpha"] = curSelection.material.uniforms.backgroundAlpha.value;
    }else{
      guiHandler.textManipulationParameters["Bg color"] = "#000000"
      guiHandler.textManipulationParameters["Bg alpha"] = 1;
    }
    guiHandler.textManipulationParameters["Char margin"] = curSelection.offsetBetweenChars;
    guiHandler.textManipulationParameters["Line margin"] = curSelection.offsetBetweenLines;
    guiHandler.textManipulationParameters["Aff. by fog"] = curSelection.isAffectedByFog;
    guiHandler.textManipulationParameters["is 2D"] = curSelection.is2D;
    if (typeof guiHandler.textManipulationParameters["is 2D"] == UNDEFINED){
      guiHandler.textManipulationParameters["is 2D"] = false;
    }
    if (!guiHandler.textManipulationParameters["Has bg"]){
      guiHandler.disableController(guiHandler.textManipulationBackgroundColorController);
      guiHandler.disableController(guiHandler.textManipulationBackgroundAlphaController);
    }
    guiHandler.textManipulationParameters["Char size"] = curSelection.characterSize;
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
    if (curSelection.marginMode == MARGIN_MODE_2D_TEXT_TOP_LEFT){
      guiHandler.textManipulationParameters["Margin mode"] = "Top/Left";
    }else{
      guiHandler.textManipulationParameters["Margin mode"] = "Bottom/Right";
    }
    if (!curSelection.is2D){
      guiHandler.disableController(guiHandler.textManipulationMarginModeController);
      guiHandler.disableController(guiHandler.textManipulationMarginXController);
      guiHandler.disableController(guiHandler.textManipulationMarginYController);
      guiHandler.disableController(guiHandler.textManipulationMaxWidthPercentController);
      guiHandler.disableController(guiHandler.textManipulationMaxHeightPercentController);
    }else{
      guiHandler.disableController(guiHandler.textManipulationAffectedByFogController);
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
      guiHandler.objectManipulationParameters["Rotate x"] = 0;
      guiHandler.objectManipulationParameters["Rotate y"] = 0;
      guiHandler.objectManipulationParameters["Rotate z"] = 0;
      guiHandler.objectManipulationParameters["Opacity"] = obj.mesh.material.uniforms.alpha.value;
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
        guiHandler.objectManipulationParameters["Disp. scale"] = obj.mesh.material.uniforms.displacementInfo.value.x;
        guiHandler.objectManipulationParameters["Disp. bias"] = obj.mesh.material.uniforms.displacementInfo.value.y;
      }else{
        guiHandler.disableController(guiHandler.omDisplacementScaleController);
        guiHandler.disableController(guiHandler.omDisplacementBiasController);
      }
      if (!obj.hasTexture()){
        guiHandler.disableController(guiHandler.omTextureOffsetXController);
        guiHandler.disableController(guiHandler.omTextureOffsetYController);
      }else{
        guiHandler.objectManipulationParameters["Texture offset x"] = obj.getTextureOffsetX();
        guiHandler.objectManipulationParameters["Texture offset y"] = obj.getTextureOffsetY();
      }
      if (!obj.hasAOMap()){
        guiHandler.disableController(guiHandler.omAOIntensityController);
      }else{
        guiHandler.objectManipulationParameters["AO intensity"] = obj.mesh.material.uniforms.aoIntensity.value;
      }
      if (!obj.hasEmissiveMap()){
        guiHandler.disableController(guiHandler.omEmissiveIntensityController);
        guiHandler.disableController(guiHandler.omEmissiveColorController);
      }else{
        guiHandler.objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.emissiveIntensity.value;
        guiHandler.objectManipulationParameters["Emissive col."] = "#"+obj.mesh.material.uniforms.emissiveColor.value.getHexString();
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
      guiHandler.objectManipulationParameters["Rotate x"] = 0;
      guiHandler.objectManipulationParameters["Rotate y"] = 0;
      guiHandler.objectManipulationParameters["Rotate z"] = 0;
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
      guiHandler.objectManipulationParameters["Opacity"] = obj.mesh.material.uniforms.totalAlpha.value;
      var hasAOMap = false;
      var hasEmissiveMap = false;
      for (var childObjName in obj.group){
        if (obj.group[childObjName].hasAOMap()){
          hasAOMap = true;
        }
        if (obj.group[childObjName].hasEmissiveMap()){
          hasEmissiveMap = true;
        }
      }
      if (!hasAOMap){
        guiHandler.disableController(guiHandler.omAOIntensityController);
      }else{
        guiHandler.objectManipulationParameters["AO intensity"] = obj.mesh.material.uniforms.totalAOIntensity.value;
      }
      if (!hasEmissiveMap){
        guiHandler.disableController(guiHandler.omEmissiveIntensityController);
        guiHandler.disableController(guiHandler.omEmissiveColorController);
      }else{
        guiHandler.objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.totalEmissiveIntensity.value;
        guiHandler.objectManipulationParameters["Emissive col."] = "#"+obj.mesh.material.uniforms.totalEmissiveColor.value.getHexString();
      }
      guiHandler.disableController(guiHandler.omTextureOffsetXController);
      guiHandler.disableController(guiHandler.omTextureOffsetYController);
      guiHandler.disableController(guiHandler.omDisplacementScaleController);
      guiHandler.disableController(guiHandler.omDisplacementBiasController);
      guiHandler.disableController(guiHandler.omHideHalfController);
      if (obj.cannotSetMass){
        guiHandler.disableController(guiHandler.omHasMassController);
      }

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
      obj.mesh.add(axesHelper);
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
    guiHandler.objectManipulationParameters["Rotate x"] = 0;
    guiHandler.omRotationXController.updateDisplay();
  }else if (axis == "y"){
    guiHandler.objectManipulationParameters["Rotate y"] = 0;
    guiHandler.omRotationYController.updateDisplay();
  }else if (axis == "z"){
    guiHandler.objectManipulationParameters["Rotate z"] = 0;
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
  guiHandler.enableController(guiHandler.omHasMassController);
  guiHandler.enableController(guiHandler.omTextureOffsetXController);
  guiHandler.enableController(guiHandler.omTextureOffsetYController);
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
    case this.guiTypes.BLOOM:
      if (this.datGuiBloom){
        this.destroyGUI(this.datGuiBloom);
        postProcessiongConfigurationsVisibility.bloom = false;
        this.datGuiBloom = 0;
      }
    return;
    case this.guiTypes.AREA:
      this.destroyGUI(this.datGuiAreaConfigurations);
      this.datGuiAreaConfigurations = 0;
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
  guiHandler.datGuiWorkerStatus = new dat.GUI({hideable: false});
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
  guiHandler.datGuiWorkerStatus.add(guiHandler.workerStatusParameters, "Done");
}

GUIHandler.prototype.initializeShaderPrecisionGUI = function(){
  guiHandler.datGuiShaderPrecision = new dat.GUI({hideable: false});
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
  guiHandler.datGuiShaderPrecision.add(guiHandler.shaderPrecisionParameters, "Done");
}

GUIHandler.prototype.initializeObjectManipulationGUI = function(){
  guiHandler.datGuiObjectManipulation = new dat.GUI({hideable: false});
  guiHandler.datGuiObjectManipulation.domElement.addEventListener("mousedown", function(e){
    omGUIFocused = true;
  });
  guiHandler.omObjController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Object").listen();
  guiHandler.disableController(guiHandler.omObjController, true);
  guiHandler.omRotationXController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Rotate x").onChange(function(val){
    guiHandler.omGUIRotateEvent("x", val);
  });
  guiHandler.omRotationYController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Rotate y").onChange(function(val){
    guiHandler.omGUIRotateEvent("y", val);
  });
  guiHandler.omRotationZController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Rotate z").onChange(function(val){
    guiHandler.omGUIRotateEvent("z", val);
  });
  guiHandler.omMassController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Mass").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    parseCommand("setMass "+obj.name+" "+val);
    if (!isNaN(val) && parseFloat(val) > 0){
      guiHandler.disableController(guiHandler.omPhysicsSimplifiedController);
    }else{
      guiHandler.enableController(guiHandler.omPhysicsSimplifiedController);
    }
  });
  guiHandler.omPhysicsSimplifiedController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Phy. simpl.").onChange(function(val){
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
      parseCommand("simplifyPhysics "+obj.name+" "+sizeVec.x+" "+sizeVec.y+" "+sizeVec.z);
    }else{
      parseCommand("unsimplifyPhysics "+obj.name);
    }
  }).listen();
  guiHandler.omSlipperyController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Slippery").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    if (val){
      parseCommand("setSlipperiness "+obj.name+" on");
    }else{
      parseCommand("setSlipperiness "+obj.name+" off");
    }
  }).listen();
  guiHandler.omChangeableController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Changeable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isFPSWeapon){
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
  }).listen();
  guiHandler.omIntersectableController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Intersectable").onChange(function(val){
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
  guiHandler.omColorizableController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Colorizable").onChange(function(val){
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
  guiHandler.omHasMassController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Has mass").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isObjectGroup && obj.cannotSetMass){
      guiHandler.objectManipulationParameters["Has mass"] = false;
      return;
    }
    if (obj.isFPSWeapon){
      guiHandler.objectManipulationParameters["Has mass"] = false;
      return;
    }
    terminal.clear();
    obj.setNoMass(!val);
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
  guiHandler.omShaderPrecisionController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Shader precision", ["default", "low", "medium", "high"]).onChange(function(val){
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
  guiHandler.omFPSWeaponController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "FPS Weapon").onChange(function(val){
    if (val){
      selectionHandler.getSelectedObject().useAsFPSWeapon();
      guiHandler.disableController(guiHandler.omHasMassController);
      guiHandler.disableController(guiHandler.omChangeableController);
      guiHandler.disableController(guiHandler.omIntersectableController);
      guiHandler.disableController(guiHandler.omMassController);
      guiHandler.objectManipulationParameters["Has mass"] = false;
      guiHandler.objectManipulationParameters["Changeable"] = true;
      guiHandler.objectManipulationParameters["Intersectable"] = false;
    }else{
      selectionHandler.getSelectedObject().resetFPSWeaponProperties();
      guiHandler.enableController(guiHandler.omHasMassController);
      guiHandler.enableController(guiHandler.omChangeableController);
      guiHandler.enableController(guiHandler.omIntersectableController);
      if (!selectionHandler.getSelectedObject().noMass){
        guiHandler.enableController(guiHandler.omMassController);
      }
      guiHandler.objectManipulationParameters["Has mass"] = true;
      guiHandler.objectManipulationParameters["Changeable"] = false;
      guiHandler.objectManipulationParameters["Intersectable"] = true;
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
  guiHandler.omSideController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Side", [
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
  guiHandler.omHideHalfController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Hide half", [
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
  guiHandler.omBlendingController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Blending", [
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
  guiHandler.omEmissiveColorController = guiHandler.datGuiObjectManipulation.addColor(guiHandler.objectManipulationParameters, "Emissive col.").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject){
      var material = obj.mesh.material;
      material.uniforms.emissiveColor.value.set(val);
    }else if (obj.isObjectGroup){
      var material = obj.mesh.material;
      material.uniforms.totalEmissiveColor.value.set(val);
      for (var objName in obj.group){
        if (!(typeof obj.group[objName].emissiveColorWhenAttached == UNDEFINED)){
          REUSABLE_COLOR.set(obj.group[objName].emissiveColorWhenAttached);
          REUSABLE_COLOR.multiply(material.uniforms.totalEmissiveColor.value);
          obj.group[objName].mesh.material.uniforms.emissiveColor.value.copy(REUSABLE_COLOR);
        }
      }
    }
  }).listen();
  guiHandler.omTextureOffsetXController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Texture offset x").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setTextureOffsetX(val);
  }).listen();
  guiHandler.omTextureOffsetYController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Texture offset y").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setTextureOffsetY(val);
  }).listen();
  guiHandler.omOpacityController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Opacity").min(0).max(1).step(0.01).onChange(function(val){
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
  guiHandler.omAOIntensityController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "AO intensity").min(0).max(10).step(0.1).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject){
      obj.mesh.material.uniforms.aoIntensity.value = val;
    }else if (obj.isObjectGroup){
      obj.mesh.material.uniforms.totalAOIntensity.value = val;
      for (var objName in obj.group){
        if (!(typeof obj.group[objName].aoIntensityWhenAttached == UNDEFINED)){
          obj.group[objName].mesh.material.uniforms.aoIntensity.value = obj.group[objName].aoIntensityWhenAttached * val;
        }
      }
    }
  }).listen();
  guiHandler.omEmissiveIntensityController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Emissive int.").min(0).max(100).step(0.01).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject){
      var material = obj.mesh.material;
      material.uniforms.emissiveIntensity.value = val;
    }else if (obj.isObjectGroup){
      var material = obj.mesh.material;
      material.uniforms.totalEmissiveIntensity.value = val;
      for (var objName in obj.group){
        if (!(typeof obj.group[objName].emissiveIntensityWhenAttached == UNDEFINED)){
          obj.group[objName].mesh.material.uniforms.emissiveIntensity.value = obj.group[objName].emissiveIntensityWhenAttached * val;
        }
      }
    }
  }).listen();
  guiHandler.omDisplacementScaleController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Disp. scale").min(-50).max(50).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().mesh.material.uniforms.displacementInfo.value.x = val;
  }).listen();
  guiHandler.omDisplacementBiasController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Disp. bias").min(-50).max(50).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().mesh.material.uniforms.displacementInfo.value.y = val;
  }).listen();
  guiHandler.omHasObjectTrailController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "Motion blur").onChange(function(val){
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
  guiHandler.omObjectTrailAlphaController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "mb alpha").min(0.01).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().objectTrailConfigurations.alpha = val;
  }).listen();
  guiHandler.omObjectTrailTimeController = guiHandler.datGuiObjectManipulation.add(guiHandler.objectManipulationParameters, "mb time").min(1/15).max(OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT).step(1/60).onChange(function(val){
    selectionHandler.getSelectedObject().objectTrailConfigurations.time = val;
  }).listen();
}

GUIHandler.prototype.initializeTextManipulationGUI = function(){
  guiHandler.datGuiTextManipulation = new dat.GUI({hideable: false});
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
  }).listen();
  guiHandler.textManipulationTextColorController = guiHandler.datGuiTextManipulation.addColor(guiHandler.textManipulationParameters, "Text color").onChange(function(val){
    selectionHandler.getSelectedObject().setColor(val);
  }).listen();
  guiHandler.textManipulationAlphaController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setAlpha(val);
  }).listen();
  guiHandler.textManipulationHasBackgroundController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Has bg").onChange(function(val){
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
  guiHandler.textManipulationBackgroundColorController = guiHandler.datGuiTextManipulation.addColor(guiHandler.textManipulationParameters, "Bg color").onChange(function(val){
    selectionHandler.getSelectedObject().setBackground(val, selectionHandler.getSelectedObject().material.uniforms.backgroundAlpha.value);
  }).listen();
  guiHandler.textManipulationBackgroundAlphaController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Bg alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setBackground(
      "#" + selectionHandler.getSelectedObject().material.uniforms.backgroundColor.value.getHexString(),
      val
    );
  }).listen();
  guiHandler.textManipulationCharacterSizeController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Char size").min(0.5).max(200).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setCharSize(val);
    selectionHandler.getSelectedObject().refCharSize= val;
    selectionHandler.getSelectedObject().refInnerHeight = window.innerHeight;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationCharacterMarginController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Char margin").min(0.5).max(100).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setMarginBetweenChars(val);
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationLineMarginController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Line margin").min(0.5).max(100).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setMarginBetweenLines(val);
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationClickableController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Clickable").onChange(function(val){
    selectionHandler.getSelectedObject().isClickable = val;
  }).listen();
  guiHandler.textManipulationShaderPrecisionController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Shader precision", ["default", "low", "medium", "high"]).onChange(function(val){
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
  guiHandler.textManipulationAffectedByFogController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Aff. by fog").onChange(function(val){
    selectionHandler.getSelectedObject().setAffectedByFog(val);
  }).listen();
  guiHandler.textManipulationIs2DController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "is 2D").onChange(function(val){
    selectionHandler.getSelectedObject().set2DStatus(val);
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
    }
    selectionHandler.getSelectedObject().handleResize();
    var obj = selectionHandler.getSelectedObject();
    selectionHandler.resetCurrentSelection();
    selectionHandler.select(obj);
  }).listen();
  guiHandler.textManipulationMarginModeController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Margin mode", ["Top/Left", "Bottom/Right"]).onChange(function(val){
    if (val == "Top/Left"){
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_TEXT_TOP_LEFT;
    }else{
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_TEXT_BOTTOM_RIGHT;
    }
    selectionHandler.getSelectedObject().set2DCoordinates(
      selectionHandler.getSelectedObject().marginPercentWidth, selectionHandler.getSelectedObject().marginPercentHeight
    );
  }).listen();
  guiHandler.textManipulationMarginXController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Margin X").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(
      val, selectionHandler.getSelectedObject().marginPercentHeight
    );
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationMarginYController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Margin Y").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(
      selectionHandler.getSelectedObject().marginPercentWidth, val
    );
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationMaxWidthPercentController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Max width%").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().maxWidthPercent = val;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  guiHandler.textManipulationMaxHeightPercentController = guiHandler.datGuiTextManipulation.add(guiHandler.textManipulationParameters, "Max height%").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().maxHeightPercent = val;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
}

GUIHandler.prototype.initializeBloomGUI = function(){
  guiHandler.datGuiBloom = new dat.GUI({hideable: false});
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
    guiHandler["blurPassTintColorController"+(i+1)] = blurPassFolder.addColor(guiHandler.bloomParameters["BlurPass"+(i+1)], "Color").onChange(function(val){
      REUSABLE_COLOR.set(val);
      bloom.setBloomTintColor(this.index, REUSABLE_COLOR.r, REUSABLE_COLOR.g, REUSABLE_COLOR.b);
    }.bind({index: i})).listen();
  }
  guiHandler.datGuiBloom.add(guiHandler.bloomParameters, "Done");
}
