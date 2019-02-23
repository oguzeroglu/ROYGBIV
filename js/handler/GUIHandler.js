var GUIHandler = function(){

}

GUIHandler.prototype.init = function(){
  this.initializeFogGUI();
  this.initializeSkyboxGUI();
  this.initializeTextManipulationGUI();
  this.initializeObjectManioulationGUI();
  this.initializePostProcessingGUI();

  this.hideAll();

  datGuiObjectManipulation.domElement.addEventListener("mousedown", function(e){
    omGUIFocused = true;
  });
  datGuiTextManipulation.domElement.addEventListener("mousedown", function(e){
    tmGUIFocused = true;
  });
}

GUIHandler.prototype.afterTextSelection = function(){
  if (mode != 0){
    return;
  }
  var curSelection = selectionHandler.getSelectedObject();
  if (curSelection && curSelection.isAddedText){
    guiHandler.enableAllTMControllers();
    guiHandler.show(datGuiTextManipulation);
    textManipulationParameters["Text"] = curSelection.name;
    textManipulationParameters["Content"] = curSelection.text;
    textManipulationParameters["Text color"] = "#" + curSelection.material.uniforms.color.value.getHexString();
    textManipulationParameters["Alpha"] = curSelection.material.uniforms.alpha.value;
    textManipulationParameters["Has bg"] = (curSelection.hasBackground);
    if (curSelection.hasBackground){
      textManipulationParameters["Bg color"] = "#" + curSelection.material.uniforms.backgroundColor.value.getHexString();
      textManipulationParameters["Bg alpha"] = curSelection.material.uniforms.backgroundAlpha.value;
    }else{
      textManipulationParameters["Bg color"] = "#000000"
      textManipulationParameters["Bg alpha"] = 1;
    }
    textManipulationParameters["Char margin"] = curSelection.offsetBetweenChars;
    textManipulationParameters["Line margin"] = curSelection.offsetBetweenLines;
    textManipulationParameters["Aff. by fog"] = curSelection.isAffectedByFog;
    textManipulationParameters["is 2D"] = curSelection.is2D;
    if (!textManipulationParameters["Has bg"]){
      guiHandler.disableController(textManipulationBackgroundColorController);
      guiHandler.disableController(textManipulationBackgroundAlphaController);
    }
    textManipulationParameters["Char size"] = curSelection.characterSize;
    textManipulationParameters["Clickable"] = curSelection.isClickable;
    textManipulationParameters["Margin X"] = curSelection.marginPercentWidth;
    textManipulationParameters["Margin Y"] = curSelection.marginPercentHeight;
    textManipulationParameters["Max width%"] = curSelection.maxWidthPercent;
    textManipulationParameters["Max height%"] = curSelection.maxHeightPercent;
    if (curSelection.marginMode == MARGIN_MODE_2D_TEXT_TOP_LEFT){
      textManipulationParameters["Margin mode"] = "Top/Left";
    }else{
      textManipulationParameters["Margin mode"] = "Bottom/Right";
    }
    if (!curSelection.is2D){
      guiHandler.disableController(textManipulationMarginModeController);
      guiHandler.disableController(textManipulationMarginXController);
      guiHandler.disableController(textManipulationMarginYController);
      guiHandler.disableController(textManipulationMaxWidthPercentController);
      guiHandler.disableController(textManipulationMaxHeightPercentController);
    }else{
      guiHandler.disableController(textManipulationAffectedByFogController);
    }
  }else{
    guiHandler.hide(datGuiTextManipulation);
  }
}

GUIHandler.prototype.afterObjectSelection = function(){
  if (mode != 0 || isDeployment){
    return;
  }
  var curSelection = selectionHandler.getSelectedObject();
  if (curSelection && (curSelection.isAddedObject || curSelection.isObjectGroup)){
    guiHandler.show(datGuiObjectManipulation);
    guiHandler.enableAllOMControllers();
    var obj = curSelection;
    omGUIlastObjectName = obj.name;
    obj.visualiseBoundingBoxes();
    objectManipulationParameters["Object"] = obj.name;
    if (obj.isAddedObject){
      objectManipulationParameters["Rotate x"] = 0;
      objectManipulationParameters["Rotate y"] = 0;
      objectManipulationParameters["Rotate z"] = 0;
      objectManipulationParameters["Opacity"] = obj.mesh.material.uniforms.alpha.value;
      if (obj.metaData.isSlippery){
        objectManipulationParameters["Slippery"] = true;
      }else{
        objectManipulationParameters["Slippery"] = false;
      }
      if (obj.isChangeable){
        objectManipulationParameters["Changeable"] = true;
      }else{
        objectManipulationParameters["Changeable"] = false;
      }
      if (obj.isColorizable){
        objectManipulationParameters["Colorizable"] = true;
      }else{
        objectManipulationParameters["Colorizable"] = false;
      }
      if (obj.hasDisplacementMap()){
        objectManipulationParameters["Disp. scale"] = obj.mesh.material.uniforms.displacementInfo.value.x;
        objectManipulationParameters["Disp. bias"] = obj.mesh.material.uniforms.displacementInfo.value.y;
      }else{
        guiHandler.disableController(omDisplacementScaleController);
        guiHandler.disableController(omDisplacementBiasController);
      }
      if (!obj.hasTexture()){
        guiHandler.disableController(omTextureOffsetXController);
        guiHandler.disableController(omTextureOffsetYController);
      }else{
        objectManipulationParameters["Texture offset x"] = obj.getTextureOffsetX();
        objectManipulationParameters["Texture offset y"] = obj.getTextureOffsetY();
      }
      if (!obj.hasAOMap()){
        guiHandler.disableController(omAOIntensityController);
      }else{
        objectManipulationParameters["AO intensity"] = obj.mesh.material.uniforms.aoIntensity.value;
      }
      if (!obj.hasEmissiveMap()){
        guiHandler.disableController(omEmissiveIntensityController);
        guiHandler.disableController(omEmissiveColorController);
      }else{
        objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.emissiveIntensity.value;
        objectManipulationParameters["Emissive col."] = "#"+obj.mesh.material.uniforms.emissiveColor.value.getHexString();
      }
      if (!obj.isSlicable()){
        objectManipulationParameters["Hide half"] = "None";
        guiHandler.disableController(omHideHalfController);
      }else{
        if (!(typeof obj.metaData.slicedType == UNDEFINED)){
          objectManipulationParameters["Hide half"] = "Part "+(obj.metaData.slicedType + 1)
        }else{
          objectManipulationParameters["Hide half"] = "None";
        }
      }
      objectManipulationParameters["Side"] = "Both";
      if (obj.metaData.renderSide){
        if (obj.metaData.renderSide == 1){
          objectManipulationParameters["Side"] = "Front";
        }else if (obj.metaData.renderSide == 2){
          objectManipulationParameters["Side"] = "Back";
        }
      }
      if (obj.mesh.material.blending == NO_BLENDING){
        guiHandler.disableController(omOpacityController);
      }
      obj.mesh.add(axesHelper);
    }else if (obj.isObjectGroup){
      objectManipulationParameters["Rotate x"] = 0;
      objectManipulationParameters["Rotate y"] = 0;
      objectManipulationParameters["Rotate z"] = 0;
      if (obj.isSlippery){
        objectManipulationParameters["Slippery"] = true;
      }else{
        objectManipulationParameters["Slippery"] = false;
      }
      if (obj.isChangeable){
        objectManipulationParameters["Changeable"] = true;
      }else{
        objectManipulationParameters["Changeable"] = false;
      }
      if (obj.isColorizable){
        objectManipulationParameters["Colorizable"] = true;
      }else{
        objectManipulationParameters["Colorizable"] = false;
      }
      objectManipulationParameters["Opacity"] = obj.mesh.material.uniforms.totalAlpha.value;
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
        guiHandler.disableController(omAOIntensityController);
      }else{
        objectManipulationParameters["AO intensity"] = obj.mesh.material.uniforms.totalAOIntensity.value;
      }
      if (!hasEmissiveMap){
        guiHandler.disableController(omEmissiveIntensityController);
        guiHandler.disableController(omEmissiveColorController);
      }else{
        objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.totalEmissiveIntensity.value;
        objectManipulationParameters["Emissive col."] = "#"+obj.mesh.material.uniforms.totalEmissiveColor.value.getHexString();
      }
      guiHandler.disableController(omTextureOffsetXController);
      guiHandler.disableController(omTextureOffsetYController);
      guiHandler.disableController(omDisplacementScaleController);
      guiHandler.disableController(omDisplacementBiasController);
      guiHandler.disableController(omHideHalfController);
      if (obj.cannotSetMass){
        guiHandler.disableController(omHasMassController);
      }

      objectManipulationParameters["Side"] = "Both";
      if (obj.renderSide){
        if (obj.renderSide == 1){
          objectManipulationParameters["Side"] = "Front";
        }else if (obj.renderSide == 2){
          objectManipulationParameters["Side"] = "Back";
        }
      }
      obj.mesh.add(axesHelper);
    }
    objectManipulationParameters["Mass"] = obj.physicsBody.mass;
    if (obj.noMass){
      guiHandler.disableController(omMassController);
    }
    objectManipulationParameters["Has mass"] = !obj.noMass;
    objectManipulationParameters["Blending"] = obj.getBlendingText();
    if (obj.mesh.material.blending == NO_BLENDING){
      guiHandler.disableController(omOpacityController);
    }
    omMassController.updateDisplay();
  }else{
    guiHandler.hide(datGuiObjectManipulation);
  }
  guiHandler.afterTextSelection();
}

GUIHandler.prototype.omGUIRotateEvent = function(axis, val){
  var obj = selectionHandler.getSelectedObject();
  terminal.clear();
  parseCommand("rotateObject "+obj.name+" "+axis+" "+val);
  if (axis == "x"){
    objectManipulationParameters["Rotate x"] = 0;
    omRotationXController.updateDisplay();
  }else if (axis == "y"){
    objectManipulationParameters["Rotate y"] = 0;
    omRotationYController.updateDisplay();
  }else if (axis == "z"){
    objectManipulationParameters["Rotate z"] = 0;
    omRotationZController.updateDisplay();
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
  guiHandler.enableController(textManipulationTextNameController);
  guiHandler.enableController(textManipulationContentController);
  guiHandler.enableController(textManipulationTextColorController);
  guiHandler.enableController(textManipulationAlphaController);
  guiHandler.enableController(textManipulationHasBackgroundController);
  guiHandler.enableController(textManipulationBackgroundColorController);
  guiHandler.enableController(textManipulationBackgroundAlphaController);
  guiHandler.enableController(textManipulationCharacterSizeController);
  guiHandler.enableController(textManipulationCharacterMarginController);
  guiHandler.enableController(textManipulationLineMarginController);
  guiHandler.enableController(textManipulationClickableController);
  guiHandler.enableController(textManipulationAffectedByFogController);
  guiHandler.enableController(textManipulationIs2DController);
  guiHandler.enableController(textManipulationMarginModeController);
  guiHandler.enableController(textManipulationMarginXController);
  guiHandler.enableController(textManipulationMarginYController);
  guiHandler.enableController(textManipulationMaxWidthPercentController);
  guiHandler.enableController(textManipulationMaxHeightPercentController);
}

GUIHandler.prototype.enableAllOMControllers = function(){
  guiHandler.enableController(omRotationXController);
  guiHandler.enableController(omRotationYController);
  guiHandler.enableController(omRotationZController);
  guiHandler.enableController(omMassController);
  guiHandler.enableController(omSlipperyController);
  guiHandler.enableController(omChangeableController);
  guiHandler.enableController(omColorizableController);
  guiHandler.enableController(omHasMassController);
  guiHandler.enableController(omTextureOffsetXController);
  guiHandler.enableController(omTextureOffsetYController);
  guiHandler.enableController(omOpacityController);
  guiHandler.enableController(omEmissiveIntensityController);
  guiHandler.enableController(omEmissiveColorController);
  guiHandler.enableController(omDisplacementScaleController);
  guiHandler.enableController(omDisplacementBiasController);
  guiHandler.enableController(omAOIntensityController);
  guiHandler.enableController(omHideHalfController);
  guiHandler.enableController(omBlendingController);
  guiHandler.enableController(omSideController);
}

GUIHandler.prototype.isVisible = function(guiObject){
  return $(guiObject.domElement).is(":visible");
}

GUIHandler.prototype.show = function(guiObject){
  $(guiObject.domElement).attr("hidden", false);
}

GUIHandler.prototype.hide = function(guiObject){
  $(guiObject.domElement).attr("hidden", true);
}

GUIHandler.prototype.hideAll = function(){
  $(datGui.domElement).attr("hidden", true);
  $(datGuiObjectManipulation.domElement).attr("hidden", true);
  $(datGuiTextManipulation.domElement).attr("hidden", true);
  $(datGuiSkybox.domElement).attr("hidden", true);
  $(datGuiFog.domElement).attr("hidden", true);
  skyboxConfigurationsVisible = false;
}

GUIHandler.prototype.initializePostProcessingGUI = function(){
  datGui = new dat.GUI();
  datGui.add(postprocessingParameters, "Bloom_strength").min(0.0).max(3.0).step(0.01).onChange(function(val){
    adjustPostProcessing(1, val);
    originalBloomConfigurations.bloomStrength = val;
  }).listen();
  datGui.add(postprocessingParameters, "Bloom_radius").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(2, val);
    originalBloomConfigurations.bloomRadius = val;
  }).listen();
  datGui.add(postprocessingParameters, "Bloom_threshhold").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(3, val);
    originalBloomConfigurations.bloomThreshold = val;
  }).listen();
  datGui.add(postprocessingParameters, "Bloom_resolution_scale").min(0.1).max(1.0).step(0.001).onChange(function(val){
    adjustPostProcessing(4, val);
    originalBloomConfigurations.bloomResolutionScale = val;
  }).listen();
  datGui.add(postprocessingParameters, "Bloom").onChange(function(val){
    adjustPostProcessing(5, val);
    originalBloomConfigurations.bloomOn = val;
  }).listen();
}

GUIHandler.prototype.initializeObjectManioulationGUI = function(){
  datGuiObjectManipulation = new dat.GUI();
  omObjController = datGuiObjectManipulation.add(objectManipulationParameters, "Object").listen();
  guiHandler.disableController(omObjController, true);
  omRotationXController = datGuiObjectManipulation.add(objectManipulationParameters, "Rotate x").onChange(function(val){
    guiHandler.omGUIRotateEvent("x", val);
  });
  omRotationYController = datGuiObjectManipulation.add(objectManipulationParameters, "Rotate y").onChange(function(val){
    guiHandler.omGUIRotateEvent("y", val);
  });
  omRotationZController = datGuiObjectManipulation.add(objectManipulationParameters, "Rotate z").onChange(function(val){
    guiHandler.omGUIRotateEvent("z", val);
  });
  omMassController = datGuiObjectManipulation.add(objectManipulationParameters, "Mass").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    parseCommand("setMass "+obj.name+" "+val);
  });
  omSlipperyController = datGuiObjectManipulation.add(objectManipulationParameters, "Slippery").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    if (val){
      parseCommand("setSlipperiness "+obj.name+" on");
    }else{
      parseCommand("setSlipperiness "+obj.name+" off");
    }
  }).listen();
  omChangeableController = datGuiObjectManipulation.add(objectManipulationParameters, "Changeable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    obj.isChangeable = val;
    if (obj.isChangeable){
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "changeable"));
    }else{
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "unchangeable"));
    }
  }).listen();
  omColorizableController = datGuiObjectManipulation.add(objectManipulationParameters, "Colorizable").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    terminal.clear();
    obj.isColorizable = val;
    if (obj.isColorizable){
      obj.injectMacro("HAS_FORCED_COLOR", false, true);
      obj.mesh.material.uniforms.forcedColor = new THREE.Uniform(new THREE.Vector4(-50, 0, 0, 0));
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "colorizable"));
    }else{
      delete obj.mesh.material.uniforms.forcedColor;
      obj.removeMacro("HAS_FORCED_COLOR", false, true);
      terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "uncolorizable"));
    }
    obj.mesh.material.needsUpdate = true;
  }).listen();
  omHasMassController = datGuiObjectManipulation.add(objectManipulationParameters, "Has mass").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isObjectGroup && obj.cannotSetMass){
      objectManipulationParameters["Has mass"] = false;
      return;
    }
    terminal.clear();
    obj.noMass = !val;
    if (val){
      physicsWorld.add(obj.physicsBody);
      guiHandler.enableController(omMassController);
      terminal.printInfo(Text.PHYSICS_ENABLED);
    }else{
      physicsWorld.remove(obj.physicsBody);
      guiHandler.disableController(omMassController);
      terminal.printInfo(Text.PHYSICS_DISABLED);
    }
    omMassController.updateDisplay();
  }).listen();
  omSideController = datGuiObjectManipulation.add(objectManipulationParameters, "Side", [
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
  omHideHalfController = datGuiObjectManipulation.add(objectManipulationParameters, "Hide half", [
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
  omBlendingController = datGuiObjectManipulation.add(objectManipulationParameters, "Blending", [
    "None", "Normal", "Additive", "Subtractive", "Multiply"
  ]).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject || obj.isObjectGroup){
      guiHandler.enableController(omOpacityController);
    }
    if (val == "None"){
      obj.setBlending(NO_BLENDING);
      if (obj.isAddedObject || obj.isObjectGroup){
        guiHandler.disableController(omOpacityController);
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
  omEmissiveColorController = datGuiObjectManipulation.addColor(objectManipulationParameters, "Emissive col.").onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject){
      var material = obj.mesh.material;
      material.uniforms.emissiveColor.value.set(val);
    }else if (obj.isObjectGroup){
      var material = obj.mesh.material;
      material.uniforms.totalEmissiveColor.value.set(val);
    }
  }).listen();
  omTextureOffsetXController = datGuiObjectManipulation.add(objectManipulationParameters, "Texture offset x").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setTextureOffsetX(val);
  }).listen();
  omTextureOffsetYController = datGuiObjectManipulation.add(objectManipulationParameters, "Texture offset y").min(-2).max(2).step(0.001).onChange(function(val){
    selectionHandler.getSelectedObject().setTextureOffsetY(val);
  }).listen();
  omOpacityController = datGuiObjectManipulation.add(objectManipulationParameters, "Opacity").min(0).max(1).step(0.01).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    obj.updateOpacity(val);
    obj.initOpacitySet = false;
    obj.initOpacity = obj.opacity;
  }).listen();
  omAOIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "AO intensity").min(0).max(10).step(0.1).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject){
      obj.mesh.material.uniforms.aoIntensity.value = val;
    }else if (obj.isObjectGroup){
      obj.mesh.material.uniforms.totalAOIntensity.value = val;
    }
  }).listen();
  omEmissiveIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "Emissive int.").min(0).max(100).step(0.01).onChange(function(val){
    var obj = selectionHandler.getSelectedObject();
    if (obj.isAddedObject){
      var material = obj.mesh.material;
      material.uniforms.emissiveIntensity.value = val;
    }else if (obj.isObjectGroup){
      var material = obj.mesh.material;
      material.uniforms.totalEmissiveIntensity.value = val;
    }
  }).listen();
  omDisplacementScaleController = datGuiObjectManipulation.add(objectManipulationParameters, "Disp. scale").min(-50).max(50).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().mesh.material.uniforms.displacementInfo.value.x = val;
  }).listen();
  omDisplacementBiasController = datGuiObjectManipulation.add(objectManipulationParameters, "Disp. bias").min(-50).max(50).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().mesh.material.uniforms.displacementInfo.value.y = val;
  }).listen();
}

GUIHandler.prototype.initializeTextManipulationGUI = function(){
  datGuiTextManipulation = new dat.GUI();
  textManipulationTextNameController = datGuiTextManipulation.add(textManipulationParameters, "Text").listen();
  textManipulationContentController = datGuiTextManipulation.add(textManipulationParameters, "Content").onChange(function(val){
    var addedText = selectionHandler.getSelectedObject();
    val = val.split("\\n").join("\n");
    var val2 = val.split("\n").join("");
    if (val2.length > addedText.strlen){
      terminal.clear();
      terminal.printError(Text.THIS_TEXT_IS_ALLOCATED_FOR.replace(Text.PARAM1, addedText.strlen));
      textManipulationParameters["Content"] = addedText.text;
      return;
    }
    addedText.setText(val);
  }).listen();
  textManipulationTextColorController = datGuiTextManipulation.addColor(textManipulationParameters, "Text color").onChange(function(val){
    selectionHandler.getSelectedObject().setColor(val);
  }).listen();
  textManipulationAlphaController = datGuiTextManipulation.add(textManipulationParameters, "Alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setAlpha(val);
  }).listen();
  textManipulationHasBackgroundController = datGuiTextManipulation.add(textManipulationParameters, "Has bg").onChange(function(val){
    if (val){
      selectionHandler.getSelectedObject().setBackground("#000000", 1);
      guiHandler.enableController(textManipulationBackgroundColorController);
      guiHandler.enableController(textManipulationBackgroundAlphaController);
    }else{
      selectionHandler.getSelectedObject().removeBackground();
      guiHandler.disableController(textManipulationBackgroundColorController);
      guiHandler.disableController(textManipulationBackgroundAlphaController);
    }
    textManipulationParameters["Bg color"] = "#000000";
    textManipulationParameters["Alpha"] = 1;
  }).listen();
  textManipulationBackgroundColorController = datGuiTextManipulation.addColor(textManipulationParameters, "Bg color").onChange(function(val){
    selectionHandler.getSelectedObject().setBackground(val, selectionHandler.getSelectedObject().material.uniforms.backgroundAlpha.value);
  }).listen();
  textManipulationBackgroundAlphaController = datGuiTextManipulation.add(textManipulationParameters, "Bg alpha").min(0).max(1).step(0.01).onChange(function(val){
    selectionHandler.getSelectedObject().setBackground(
      "#" + selectionHandler.getSelectedObject().material.uniforms.backgroundColor.value.getHexString(),
      val
    );
  }).listen();
  textManipulationCharacterSizeController = datGuiTextManipulation.add(textManipulationParameters, "Char size").min(0.5).max(200).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setCharSize(val);
    selectionHandler.getSelectedObject().refCharSize= val;
    selectionHandler.getSelectedObject().refInnerHeight = window.innerHeight;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  textManipulationCharacterMarginController = datGuiTextManipulation.add(textManipulationParameters, "Char margin").min(0.5).max(100).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setMarginBetweenChars(val);
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  textManipulationLineMarginController = datGuiTextManipulation.add(textManipulationParameters, "Line margin").min(0.5).max(100).step(0.5).onChange(function(val){
    selectionHandler.getSelectedObject().setMarginBetweenLines(val);
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  textManipulationClickableController = datGuiTextManipulation.add(textManipulationParameters, "Clickable").onChange(function(val){
    selectionHandler.getSelectedObject().isClickable = val;
  }).listen();
  textManipulationAffectedByFogController = datGuiTextManipulation.add(textManipulationParameters, "Aff. by fog").onChange(function(val){
    selectionHandler.getSelectedObject().setAffectedByFog(val);
  }).listen();
  textManipulationIs2DController = datGuiTextManipulation.add(textManipulationParameters, "is 2D").onChange(function(val){
    selectionHandler.getSelectedObject().set2DStatus(val);
    if (val){
      guiHandler.enableController(textManipulationMarginModeController);
      guiHandler.enableController(textManipulationMarginXController);
      guiHandler.enableController(textManipulationMarginYController);
      guiHandler.enableController(textManipulationMaxWidthPercentController);
      guiHandler.enableController(textManipulationMaxHeightPercentController);
      guiHandler.disableController(textManipulationAffectedByFogController);
      selectionHandler.getSelectedObject().set2DCoordinates(
        selectionHandler.getSelectedObject().marginPercentWidth, selectionHandler.getSelectedObject().marginPercentHeight
      );
      selectionHandler.getSelectedObject().setAffectedByFog(false);
      textManipulationParameters["Aff. by fog"] = false;
    }else{
      guiHandler.disableController(textManipulationMarginModeController);
      guiHandler.disableController(textManipulationMarginXController);
      guiHandler.disableController(textManipulationMarginYController);
      guiHandler.disableController(textManipulationMaxWidthPercentController);
      guiHandler.disableController(textManipulationMaxHeightPercentController);
      guiHandler.enableController(textManipulationAffectedByFogController);
    }
    selectionHandler.getSelectedObject().handleResize();
    var obj = selectionHandler.getSelectedObject();
    selectionHandler.resetCurrentSelection();
    selectionHandler.select(obj);
  }).listen();
  textManipulationMarginModeController = datGuiTextManipulation.add(textManipulationParameters, "Margin mode", ["Top/Left", "Bottom/Right"]).onChange(function(val){
    if (val == "Top/Left"){
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_TEXT_TOP_LEFT;
    }else{
      selectionHandler.getSelectedObject().marginMode = MARGIN_MODE_2D_TEXT_BOTTOM_RIGHT;
    }
    selectionHandler.getSelectedObject().set2DCoordinates(
      selectionHandler.getSelectedObject().marginPercentWidth, selectionHandler.getSelectedObject().marginPercentHeight
    );
  }).listen();
  textManipulationMarginXController = datGuiTextManipulation.add(textManipulationParameters, "Margin X").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(
      val, selectionHandler.getSelectedObject().marginPercentHeight
    );
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  textManipulationMarginYController = datGuiTextManipulation.add(textManipulationParameters, "Margin Y").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().set2DCoordinates(
      selectionHandler.getSelectedObject().marginPercentWidth, val
    );
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  textManipulationMaxWidthPercentController = datGuiTextManipulation.add(textManipulationParameters, "Max width%").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().maxWidthPercent = val;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
  textManipulationMaxHeightPercentController = datGuiTextManipulation.add(textManipulationParameters, "Max height%").min(0).max(100).step(0.1).onChange(function(val){
    selectionHandler.getSelectedObject().maxHeightPercent = val;
    selectionHandler.getSelectedObject().handleResize();
  }).listen();
}

GUIHandler.prototype.initializeSkyboxGUI = function(){
  datGuiSkybox = new dat.GUI();
  skyboxNameController = datGuiSkybox.add(skyboxParameters, "Name").listen();
  guiHandler.disableController(skyboxNameController, true);
  skyboxColorController = datGuiSkybox.addColor(skyboxParameters, "Color").onChange(function(val){
    skyboxMesh.material.uniforms.color.value.set(val);
    skyBoxes[mappedSkyboxName].color = val;
    if (fogBlendWithSkybox){
      GLOBAL_FOG_UNIFORM.value.set(
        -fogDensity,
        skyboxMesh.material.uniforms.color.value.r,
        skyboxMesh.material.uniforms.color.value.g,
        skyboxMesh.material.uniforms.color.value.b
      );
    }
  }).listen();
}

GUIHandler.prototype.initializeFogGUI = function(){
  datGuiFog = new dat.GUI();
  fogDensityController = datGuiFog.add(fogParameters, "Density").min(0).max(1).step(0.01).onChange(function(val){
    fogDensity = val / 100;
    if (!fogBlendWithSkybox){
      GLOBAL_FOG_UNIFORM.value.set(fogDensity, fogColorRGB.r, fogColorRGB.g, fogColorRGB.b);
    }else{
      GLOBAL_FOG_UNIFORM.value.set(
        -fogDensity,
        skyboxMesh.material.uniforms.color.value.r,
        skyboxMesh.material.uniforms.color.value.g,
        skyboxMesh.material.uniforms.color.value.b
      );
    }
  }).listen();
  fogColorController = datGuiFog.addColor(fogParameters, "Color").onChange(function(val){
    fogColorRGB.set(val);
    GLOBAL_FOG_UNIFORM.value.set(fogDensity, fogColorRGB.r, fogColorRGB.g, fogColorRGB.b);
  }).listen();
  fogBlendWithSkyboxController = datGuiFog.add(fogParameters, "Blend skybox").onChange(function(val){
    if (!skyboxVisible){
      fogParameters["Blend skybox"] = false;
      return;
    }
    if (val){
      fogBlendWithSkybox = true;
      GLOBAL_FOG_UNIFORM.value.set(
        -fogDensity,
        skyboxMesh.material.uniforms.color.value.r,
        skyboxMesh.material.uniforms.color.value.g,
        skyboxMesh.material.uniforms.color.value.b
      );
      guiHandler.disableController(fogColorController);
    }else{
      fogBlendWithSkybox = false;
      GLOBAL_FOG_UNIFORM.value.set(fogDensity, fogColorRGB.r, fogColorRGB.g, fogColorRGB.b);
      guiHandler.enableController(fogColorController);
    }
    for (var objName in addedObjects){
      addedObjects[objName].removeFog();
      addedObjects[objName].setFog();
    }
    for (var objName in objectGroups){
      objectGroups[objName].removeFog();
      objectGroups[objName].setFog();
    }
    for (var textName in addedTexts){
      addedTexts[textName].removeFog();
      addedTexts[textName].setFog();
    }
  }).listen();
}
