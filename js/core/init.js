window.onload = function() {
  // DRAGABLE CLI
  var cliDiv = document.getElementById("cliDiv");
  var cliDivheader = document.getElementById("cliDivheader");
  var terminalDiv = document.getElementById("terminalDiv");
  scriptCreatorDiv = document.getElementById("scriptCreatorDiv");
  scriptCreatorCancelButton = document.getElementById("scriptCreatorCancelButton");
  scriptCreatorSaveButton = document.getElementById("scriptCreatorSaveButton");
  scriptCreatorTextArea = document.getElementById("scriptCreatorTextArea");
  if (!isDeployment){
    scriptCreatorTextArea.onkeydown = function(e){
      if(e.keyCode==9 || e.which==9){
        e.preventDefault();
        var s = this.selectionStart;
        this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
        this.selectionEnd = s+1;
      }
    }
  }
  cliDiv.addEventListener("click", function(){
    cliFocused = true;
    omGUIFocused = false;
    tmGUIFocused = false;
    inactiveCounter = 0;
    if (keyboardBuffer["Shift"] && mode == 0){
      keyboardBuffer["Shift"] = false;
      for (var objName in addedObjects){
        addedObjects[objName].mesh.visible = true;
      }
      for (var objName in objectGroups){
        objectGroups[objName].mesh.visible = true;
      }
      for (var textName in addedTexts){
        addedTexts[textName].show();
        if (selectedAddedText && selectedAddedText.name == textName){
          if (!addedTexts[textName].is2D){
            scene.add(addedTexts[textName].bbHelper);
          }else{
            scene.add(addedTexts[textName].rectangle.mesh);
          }
        }
      }
    }
  });
  cliDiv.addEventListener("mousemove", function(event){
    inactiveCounter = 0;
  });
  terminalDiv.addEventListener("mousewheel", function(e){
    e.preventDefault();
    e.stopPropagation();
  });
  if (typeof InstallTrigger !== 'undefined') {
    // M O Z I L L A
    terminalDiv.addEventListener("wheel", function(e){
      e.preventDefault();
      e.stopPropagation();
    });
  }
  dragElement(cliDiv);

  // SCRIPTING UTILITY FUNCTIONS
  ROYGBIV = new Roygbiv();
  if (!isDeployment){
    var roygbivScriptingAPIMethodCount = (Object.keys(Roygbiv.prototype).length);
    if (roygbivScriptingAPIMethodCount != ROYGBIV.functionNames.length){
      console.error("[*] Scripting API error: Some methods are missing in functionNames list.");
    }
    for (var i = 0; i<ROYGBIV.functionNames.length; i++){
      if (!Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+ROYGBIV.functionNames[i].toUpperCase()]){
        console.error("[*] Scripting API error: "+ROYGBIV.functionNames[i]+" explanation is not present.");
      }
    }
  }

  pointerLockSupported = 'pointerLockElement' in document ||
                         'mozPointerLockElement' in document ||
                         'webkitPointerLockElement' in document;

  // DEFAULT FONT
  document.fonts.forEach(function(font){
    if (font.family == "hack"){
      defaultFont = new Font(null, null, null, null, font);
    }
  });


  // COMMAND DESCRIPTOR
  if (!isDeployment){
    commandDescriptor = new CommandDescriptor();
    commandDescriptor.test();
  }

  // COLOR NAMES
  ColorNames = new ColorNames();

  // AREA BIN HANDLER
  areaBinHandler = new WorldBinHandler(true);
  areaBinHandler.isAreaBinHandler = true;

  // AREA CONFIGURATIONS HANDLER
  areaConfigurationsHandler = new AreaConfigurationsHandler();

  // RAYCASTER
  rayCaster = new RayCaster();

  // OBJECT PICKER 2D
  objectPicker2D = new ObjectPicker2D();

  // MODE SWITCHER
  modeSwitcher = new ModeSwitcher();

  if (!isDeployment){
    // DAT GUI FOG
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
        disableController(fogColorController);
      }else{
        fogBlendWithSkybox = false;
        GLOBAL_FOG_UNIFORM.value.set(fogDensity, fogColorRGB.r, fogColorRGB.g, fogColorRGB.b);
        enableController(fogColorController);
      }
    }).listen();
    // DAT GUI SKYBOX
    datGuiSkybox = new dat.GUI();
    skyboxNameController = datGuiSkybox.add(skyboxParameters, "Name").listen();
    disableController(skyboxNameController, true);
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
    // DAT GUI TEXT MANIPULATION
    datGuiTextManipulation = new dat.GUI();
    textManipulationTextNameController = datGuiTextManipulation.add(textManipulationParameters, "Text").listen();
    textManipulationContentController = datGuiTextManipulation.add(textManipulationParameters, "Content").onChange(function(val){
      var addedText = selectedAddedText;
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
      selectedAddedText.setColor(val);
    }).listen();
    textManipulationAlphaController = datGuiTextManipulation.add(textManipulationParameters, "Alpha").min(0).max(1).step(0.01).onChange(function(val){
      selectedAddedText.setAlpha(val);
    }).listen();
    textManipulationHasBackgroundController = datGuiTextManipulation.add(textManipulationParameters, "Has bg").onChange(function(val){
      if (val){
        selectedAddedText.setBackground(
          "#" + selectedAddedText.material.uniforms.backgroundColor.value.getHexString(),
          selectedAddedText.material.uniforms.backgroundAlpha.value
        );
        enableController(textManipulationBackgroundColorController);
        enableController(textManipulationBackgroundAlphaController);
      }else{
        selectedAddedText.removeBackground();
        disableController(textManipulationBackgroundColorController);
        disableController(textManipulationBackgroundAlphaController);
      }
    }).listen();
    textManipulationBackgroundColorController = datGuiTextManipulation.addColor(textManipulationParameters, "Bg color").onChange(function(val){
      selectedAddedText.setBackground(val, selectedAddedText.material.uniforms.backgroundAlpha.value);
    }).listen();
    textManipulationBackgroundAlphaController = datGuiTextManipulation.add(textManipulationParameters, "Bg alpha").min(0).max(1).step(0.01).onChange(function(val){
      selectedAddedText.setBackground(
        "#" + selectedAddedText.material.uniforms.backgroundColor.value.getHexString(),
        val
      );
    }).listen();
    textManipulationCharacterSizeController = datGuiTextManipulation.add(textManipulationParameters, "Char size").min(0.5).max(200).step(0.5).onChange(function(val){
      selectedAddedText.setCharSize(val);
      selectedAddedText.refCharSize = val;
      selectedAddedText.refInnerHeight = window.innerHeight;
    }).listen();
    textManipulationCharacterMarginController = datGuiTextManipulation.add(textManipulationParameters, "Char margin").min(0.5).max(100).step(0.5).onChange(function(val){
      selectedAddedText.setMarginBetweenChars(val);
    }).listen();
    textManipulationLineMarginController = datGuiTextManipulation.add(textManipulationParameters, "Line margin").min(0.5).max(100).step(0.5).onChange(function(val){
      selectedAddedText.setMarginBetweenLines(val);
    }).listen();
    textManipulationClickableController = datGuiTextManipulation.add(textManipulationParameters, "Clickable").onChange(function(val){
      selectedAddedText.isClickable = val;
    }).listen();
    textManipulationAffectedByFogController = datGuiTextManipulation.add(textManipulationParameters, "Aff. by fog").onChange(function(val){
      selectedAddedText.setAffectedByFog(val);
    }).listen();
    textManipulationIs2DController = datGuiTextManipulation.add(textManipulationParameters, "is 2D").onChange(function(val){
      selectedAddedText.set2DStatus(val);
      if (val){
        enableController(textManipulationMarginModeController);
        enableController(textManipulationMarginXController);
        enableController(textManipulationMarginYController);
        disableController(textManipulationAffectedByFogController);
        selectedAddedText.set2DCoordinates(
          selectedAddedText.marginPercentWidth, selectedAddedText.marginPercentHeight
        );
        selectedAddedText.setAffectedByFog(false);
        textManipulationParameters["Aff. by fog"] = false;
      }else{
        disableController(textManipulationMarginModeController);
        disableController(textManipulationMarginXController);
        disableController(textManipulationMarginYController);
        enableController(textManipulationAffectedByFogController);
      }
    }).listen();
    textManipulationMarginModeController = datGuiTextManipulation.add(textManipulationParameters, "Margin mode", ["Top/Left", "Bottom/Right"]).onChange(function(val){
      if (val == "Top/Left"){
        selectedAddedText.marginMode = MARGIN_MODE_2D_TEXT_TOP_LEFT;
      }else{
        selectedAddedText.marginMode = MARGIN_MODE_2D_TEXT_BOTTOM_RIGHT;
      }
      selectedAddedText.set2DCoordinates(
        selectedAddedText.marginPercentWidth, selectedAddedText.marginPercentHeight
      );
    }).listen();
    textManipulationMarginXController = datGuiTextManipulation.add(textManipulationParameters, "Margin X").min(0).max(100).step(0.1).onChange(function(val){
      selectedAddedText.set2DCoordinates(
        val, selectedAddedText.marginPercentHeight
      );
    }).listen();
    textManipulationMarginYController = datGuiTextManipulation.add(textManipulationParameters, "Margin Y").min(0).max(100).step(0.1).onChange(function(val){
      selectedAddedText.set2DCoordinates(
        selectedAddedText.marginPercentWidth, val
      );
    }).listen();
    // DAT GUI OBJECT MANIPULATION
    datGuiObjectManipulation = new dat.GUI();
    omObjController = datGuiObjectManipulation.add(objectManipulationParameters, "Object").listen();
    disableController(omObjController, true);
    omRotationXController = datGuiObjectManipulation.add(objectManipulationParameters, "Rotate x").onChange(function(val){
      omGUIRotateEvent("x", val);
    });
    omRotationYController = datGuiObjectManipulation.add(objectManipulationParameters, "Rotate y").onChange(function(val){
      omGUIRotateEvent("y", val);
    });
    omRotationZController = datGuiObjectManipulation.add(objectManipulationParameters, "Rotate z").onChange(function(val){
      omGUIRotateEvent("z", val);
    });
    omMassController = datGuiObjectManipulation.add(objectManipulationParameters, "Mass").onChange(function(val){
      var obj = selectedAddedObject;
      if (!obj){
        obj = selectedObjectGroup;
      }
      terminal.clear();
      parseCommand("setMass "+obj.name+" "+val);
    });
    omSlipperyController = datGuiObjectManipulation.add(objectManipulationParameters, "Slippery").onChange(function(val){
      var obj = selectedAddedObject;
      if (!obj){
        obj = selectedObjectGroup;
      }
      terminal.clear();
      if (val){
        parseCommand("setSlipperiness "+obj.name+" on");
      }else{
        parseCommand("setSlipperiness "+obj.name+" off");
      }
    }).listen();
    omChangeableController = datGuiObjectManipulation.add(objectManipulationParameters, "Changeable").onChange(function(val){
      var obj = selectedAddedObject;
      if (!obj){
        obj = selectedObjectGroup;
      }
      terminal.clear();
      obj.isChangeable = val;
      if (obj.isChangeable){
        terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "changeable"));
      }else{
        terminal.printInfo(Text.OBJECT_MARKED_AS.replace(Text.PARAM1, "unchangeable"));
      }
    }).listen();
    omHasMassController = datGuiObjectManipulation.add(objectManipulationParameters, "Has mass").onChange(function(val){
      var obj = selectedAddedObject;
      if (!obj){
        obj = selectedObjectGroup;
        if (obj.cannotSetMass){
          objectManipulationParameters["Has mass"] = false;
          return;
        }
      }
      terminal.clear();
      obj.noMass = !val;
      if (val){
        physicsWorld.add(obj.physicsBody);
        enableController(omMassController);
        terminal.printInfo(Text.PHYSICS_ENABLED);
      }else{
        physicsWorld.remove(obj.physicsBody);
        disableController(omMassController);
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
      if (selectedAddedObject){
        selectedAddedObject.handleRenderSide(pseudoVal);
      }else if (selectedObjectGroup){
        selectedObjectGroup.handleRenderSide(pseudoVal);
      }
    }).listen();
    omHideHalfController = datGuiObjectManipulation.add(objectManipulationParameters, "Hide half", [
      "None", "Part 1", "Part 2", "Part 3", "Part 4"
    ]).onChange(function(val){
      if (val == "None"){
        selectedAddedObject.sliceInHalf(4);
      }else if (val == "Part 1"){
        selectedAddedObject.sliceInHalf(0);
      }else if (val == "Part 2"){
        selectedAddedObject.sliceInHalf(1);
      }else if (val == "Part 3"){
        selectedAddedObject.sliceInHalf(2);
      }else if (val == "Part 4"){
        selectedAddedObject.sliceInHalf(3);
      }
      rayCaster.updateObject(selectedAddedObject);
    }).listen();
    omBlendingController = datGuiObjectManipulation.add(objectManipulationParameters, "Blending", [
      "None", "Normal", "Additive", "Subtractive", "Multiply"
    ]).onChange(function(val){
      var obj = selectedAddedObject;
      if (!obj){
        obj = selectedObjectGroup;
      }
      if (obj instanceof AddedObject || obj instanceof ObjectGroup){
        enableController(omOpacityController);
      }
      if (val == "None"){
        obj.setBlending(NO_BLENDING);
        if (obj instanceof AddedObject || obj instanceof ObjectGroup){
          disableController(omOpacityController);
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
      if (selectedAddedObject && !selectedObjectGroup){
        var material = selectedAddedObject.mesh.material;
        material.uniforms.emissiveColor.value.set(val);
        selectedAddedObject.initEmissiveColorSet = false;
        selectedAddedObject.initEmissiveColor = val;
      }else if (selectedObjectGroup && !selectedAddedObject){
        var material = selectedObjectGroup.mesh.material;
        material.uniforms.totalEmissiveColor.value.set(val);
        selectedObjectGroup.initEmissiveColorSet = false;
        selectedObjectGroup.initEmissiveColor = val;
      }

    }).onFinishChange(function(value){

    }).listen();
    omTextureOffsetXController = datGuiObjectManipulation.add(objectManipulationParameters, "Texture offset x").min(-2).max(2).step(0.001).onChange(function(val){
      var texture = selectedAddedObject.mesh.material.uniforms.diffuseMap.value;
      texture.offset.x = val;
      texture.initOffsetXSet = false;
      texture.updateMatrix();
    }).onFinishChange(function(value){

    }).listen();
    omTextureOffsetYController = datGuiObjectManipulation.add(objectManipulationParameters, "Texture offset y").min(-2).max(2).step(0.001).onChange(function(val){
      var texture = selectedAddedObject.mesh.material.uniforms.diffuseMap.value;
      texture.offset.y = val;
      texture.initOffsetYSet = false;
      texture.updateMatrix();
    }).onFinishChange(function(value){

    }).listen();
    omOpacityController = datGuiObjectManipulation.add(objectManipulationParameters, "Opacity").min(0).max(1).step(0.01).onChange(function(val){
      if (selectedObjectGroup && !selectedAddedObject){
        selectedObjectGroup.updateOpacity(val);
        selectedObjectGroup.initOpacitySet = false;
        selectedObjectGroup.initOpacity = selectedObjectGroup.opacity;
      }else if (selectedAddedObject){
        selectedAddedObject.updateOpacity(val);
        selectedAddedObject.initOpacitySet = false;
        selectedAddedObject.initOpacity = selectedAddedObject.opacity;
      }
    }).onFinishChange(function(value){

    }).listen();
    omAOIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "AO intensity").min(0).max(10).step(0.1).onChange(function(val){
      if (selectedAddedObject && !selectedObjectGroup){
        selectedAddedObject.mesh.material.uniforms.aoIntensity.value = val;
        selectedAddedObject.initAOIntensitySet = false;
        selectedAddedObject.initAOIntensity = val;
      }else if (selectedObjectGroup && !selectedAddedObject){
        selectedObjectGroup.mesh.material.uniforms.totalAOIntensity.value = val;
        selectedObjectGroup.initAOIntensitySet = false;
        selectedObjectGroup.initAOIntensity = val;
      }
    }).onFinishChange(function(value){

    }).listen();
    omEmissiveIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "Emissive int.").min(0).max(100).step(0.01).onChange(function(val){
      if (selectedAddedObject && !selectedObjectGroup){
        var material = selectedAddedObject.mesh.material;
        material.uniforms.emissiveIntensity.value = val;
        selectedAddedObject.initEmissiveIntensitySet = false;
        selectedAddedObject.initEmissiveIntensity = val;
      }else if (selectedObjectGroup && !selectedAddedObject){
        var material = selectedObjectGroup.mesh.material;
        material.uniforms.totalEmissiveIntensity.value = val;
        selectedObjectGroup.initEmissiveIntensitySet = false;
        selectedObjectGroup.initEmissiveIntensity = val;
      }
    }).onFinishChange(function(value){

    }).listen();
    omDisplacementScaleController = datGuiObjectManipulation.add(objectManipulationParameters, "Disp. scale").min(-50).max(50).step(0.1).onChange(function(val){
      selectedAddedObject.mesh.material.uniforms.displacementInfo.value.x = val;
      selectedAddedObject.initDisplacementScaleSet = false;
    }).onFinishChange(function(value){

    }).listen();
    omDisplacementBiasController = datGuiObjectManipulation.add(objectManipulationParameters, "Disp. bias").min(-50).max(50).step(0.1).onChange(function(val){
      selectedAddedObject.mesh.material.uniforms.displacementInfo.value.y = val;
      selectedAddedObject.initDisplacementBiasSet = false;
    }).onFinishChange(function(value){

    }).listen();

    datGuiObjectManipulation.domElement.addEventListener("mousedown", function(e){
      omGUIFocused = true;
    });
    datGuiTextManipulation.domElement.addEventListener("mousedown", function(e){
      tmGUIFocused = true;
    });

    // DAT GUI
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

    $(datGui.domElement).attr("hidden", true);
    $(datGuiObjectManipulation.domElement).attr("hidden", true);
    $(datGuiTextManipulation.domElement).attr("hidden", true);
    $(datGuiSkybox.domElement).attr("hidden", true);
    $(datGuiFog.domElement).attr("hidden", true);
  }

  // IMAGE UPLOADER
  imageUploaderInput = $("#imageUploaderInput");
  // LOAD
  loadInput = $("#loadInput");
  // 3D CANVAS
  canvas = document.getElementById("rendererCanvas");
  canvas.requestPointerLock = canvas.requestPointerLock ||
                              canvas.mozRequestPointerLock ||
                              canvas.webkitRequestPointerLock;
  var pointerLockChangeFunction = 0;
  if ("onpointerlockchange" in document){
    pointerLockChangeFunction = "pointerlockchange";
  }else if ("onmozpointerlockchange" in document){
    pointerLockChangeFunction = "mozpointerlockchange";
  }else if ("onwebkitpointerlockchange" in document){
    pointerLockChangeFunction = "webkitpointerlockchange";
  }
  if (pointerLockChangeFunction){
    document.addEventListener(pointerLockChangeFunction, function(event){
      if (mode == 1 && screenPointerLockChangedCallbackFunction){
        if (document.pointerLockElement == canvas ||
              document.mozPointerLockElement == canvas ||
                document.webkitPointerLockElement == canvas){
          screenPointerLockChangedCallbackFunction(true);
        }else{
          screenPointerLockChangedCallbackFunction(false);
        }
      }
    });
  }
  canvas.onfullscreenchange = function(event){
    if (document.fullscreenElement == canvas){
      onFullScreen = true;
      if (mode == 1 && screenFullScreenChangeCallbackFunction){
        screenFullScreenChangeCallbackFunction(true);
      }
    }else{
      onFullScreen = false;
      if (mode == 1 && screenFullScreenChangeCallbackFunction){
        screenFullScreenChangeCallbackFunction(false);
      }
    }
  }
  var hiddenText, visibilityChange;
  if (!(typeof document.hidden == UNDEFINED)){
    hiddenText = "hidden";
    visibilityChange = "visibilitychange";
  }else if (!(typeof document.mozHidden == UNDEFINED)){
    hiddenText = "mozHidden";
    visibilityChange = "mozvisibilitychange";
  }else if (!(typeof document.msHidden == UNDEFINED)){
    hiddenText = "msHidden";
    visibilityChange = "msvisibilitychange";
  }else if (!(typeof document.webkitHidden == UNDEFINED)){
    hiddenText = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  document.addEventListener(visibilityChange, function(){
    isScreenVisible = !(document[hiddenText]);
  }, false);
  canvas.addEventListener("click", function(event){
    inactiveCounter = 0;
    cliFocused = false;
    omGUIFocused = false;
    tmGUIFocused = false;
    if (windowLoaded){
      var rect = renderer.getCurrentViewport();
      var rectX = rect.x, rectY = rect.y, rectZ = rect.z, rectW = rect.w;
      if (screenResolution != 1){
        rectX = rectX / screenResolution;
        rectY = rectY / screenResolution;
        rectZ = rectZ / screenResolution;
        rectW = rectW / screenResolution;
      }
      var coordX = ((event.clientX - rectX) / rectZ) * 2 - 1;
      var coordY = - ((event.clientY - rectY) / rectW) * 2 + 1;
      if (mode == 1 && screenClickCallbackFunction){
        screenClickCallbackFunction(coordX, coordY);
      }
      if (mode == 1 && pointerLockSupported && pointerLockRequested){
        canvas.requestPointerLock();
        pointerLockRequested = false;
      }
      if (mode == 1 && fullScreenRequested){
        if (canvas.requestFullscreen){
          canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen){
          canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen){
          canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen){
          canvas.msRequestFullscreen();
        }
        fullScreenRequested = false;
      }
      if (mode == 1 && isPaused){
        return;
      }
      if (event.clientX < rectX || event.clientX > rectX + rectZ || event.clientY < rectY || event.clientY > rectY + rectW){
        return;
      }
      // TRY TO PICK 2D OBJECTS FIRST
      objectPicker2D.find(event.clientX, event.clientY);
      if (!intersectionPoint){
        REUSABLE_VECTOR.setFromMatrixPosition(camera.matrixWorld);
        REUSABLE_VECTOR_2.set(coordX, coordY, 0.5).unproject(camera).sub(REUSABLE_VECTOR).normalize();
        rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, (mode == 0));
      }
      if (intersectionPoint){
         var object = addedObjects[intersectionObject];
         if (!object){
           object = objectGroups[intersectionObject];
         }
         if (!object){
           object = gridSystems[intersectionObject];
         }
         if (!object){
           object = addedTexts[intersectionObject];
         }
         if (object.isAddedObject || object.isObjectGroup){
           if (!defaultCameraControlsDisabled && !isDeployment){
             terminal.clear();
           }
           var point = intersectionPoint;
           var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
           if (object.isAddedObject){
             if (!defaultCameraControlsDisabled && !isDeployment){
               terminal.printInfo(Text.CLICKED_ON.replace(
                 Text.PARAM1, object.name + coordStr
               ));
             }
             if (mode == 0){
               if (selectedAddedObject){
                 selectedAddedObject.mesh.remove(axesHelper);
               }
               if (selectedObjectGroup){
                 selectedObjectGroup.mesh.remove(axesHelper);
               }
               if (selectedAddedText && selectedAddedText.bbHelper){
                 scene.remove(selectedAddedText.bbHelper);
               }
               if (selectedAddedText && selectedAddedText.rectangle){
                 scene.remove(selectedAddedText.rectangle.mesh);
               }
             }
             selectedAddedObject = object;
             objectSelectedByCommand = false;
             selectedObjectGroup = 0;
             selectedAddedText = 0;
             afterObjectSelection();
             if (object.clickCallbackFunction){
               object.clickCallbackFunction(point.x, point.y, point.z);
             }
           }else if (object.isObjectGroup){
             if (!defaultCameraControlsDisabled && !isDeployment){
               terminal.printInfo(Text.CLICKED_ON.replace(
                 Text.PARAM1, object.name+coordStr
               ));
             }
             if (mode == 0){
               if (selectedAddedObject){
                 selectedAddedObject.mesh.remove(axesHelper);
               }
               if (selectedObjectGroup){
                 selectedObjectGroup.mesh.remove(axesHelper);
               }
               if (selectedAddedText && selectedAddedText.bbHelper){
                 scene.remove(selectedAddedText.bbHelper);
               }
               if (selectedAddedText && selectedAddedText.rectangle){
                 scene.remove(selectedAddedText.rectangle.mesh);
               }
             }
             selectedObjectGroup = object;
             objectSelectedByCommand = false;
             selectedAddedObject = 0;
             selectedAddedText = 0;
             afterObjectSelection();
             if (object.clickCallbackFunction){
               object.clickCallbackFunction(point.x, point.y, point.z);
             }
           }
         }else if (object.isGridSystem){
           var gridSystem = object;
           var point = intersectionPoint;
           var selectedGrid = gridSystem.getGridFromPoint(point);
           if (selectedGrid.sliced && !selectedGrid.slicedGridSystemName){
             selectedGrid.sliced = false;
           }
           if (selectedGrid){
             if (!selectedGrid.sliced){
               if (selectedGrid.destroyedAddedObject && !(keyboardBuffer["Shift"])){
                 var addedObject = addedObjects[selectedGrid.destroyedAddedObject];
                 terminal.clear();
                 var point = intersectionPoint;
                 var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                 terminal.printInfo(Text.CLICKED_ON.replace(
                   Text.PARAM1, addedObject.name+coordStr
                 ));
                 if (mode == 0){
                   if (selectedAddedObject){
                     selectedAddedObject.mesh.remove(axesHelper);
                   }
                   if (selectedObjectGroup){
                     selectedObjectGroup.mesh.remove(axesHelper);
                   }
                   if (selectedAddedText && selectedAddedText.bbHelper){
                     scene.remove(selectedAddedText.bbHelper);
                   }
                   if (selectedAddedText && selectedAddedText.rectangle){
                     scene.remove(selectedAddedText.rectangle.mesh);
                   }
                 }
                 selectedAddedObject = addedObject;
                 selectedObjectGroup = 0;
                 selectedAddedText = 0;
                 objectSelectedByCommand = false;
                 afterObjectSelection();
                 if (addedObject.clickCallbackFunction){
                   addedObject.clickCallbackFunction(point.x, point.y, point.z);
                 }
               }else if (selectedGrid.destroyedObjectGroup && !(keyboardBuffer["Shift"])){
                 var objectGroup = objectGroups[selectedGrid.destroyedObjectGroup];
                 terminal.clear();
                 var point = intersectionPoint;
                 var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                 terminal.printInfo(Text.CLICKED_ON.replace(
                   Text.PARAM1, objectGroup.name+coordStr
                 ));
                 if (mode == 0){
                   if (selectedAddedObject){
                     selectedAddedObject.mesh.remove(axesHelper);
                   }
                   if (selectedObjectGroup){
                     selectedObjectGroup.mesh.remove(axesHelper);
                   }
                   if (selectedAddedText && selectedAddedText.bbHelper){
                     scene.remove(selectedAddedText.bbHelper);
                   }
                   if (selectedAddedText && selectedAddedText.rectangle){
                     scene.remove(selectedAddedText.rectangle.mesh);
                   }
                 }
                 selectedAddedObject = 0;
                 selectedAddedText = 0;
                 selectedObjectGroup = objectGroup;
                 afterObjectSelection();
                 if (objectGroup.clickCallbackFunction){
                   objectGroup.clickCallbackFunction(point.x, point.y, point.z);
                 }
               }else if (selectedGrid.createdAddedTextName && !(keyboardBuffer["Shift"])){
                  var addedText = addedTexts[selectedGrid.createdAddedTextName];
                  if (!defaultCameraControlsDisabled && !isDeployment){
                    terminal.clear();
                    terminal.printInfo(Text.SELECTED.replace(Text.PARAM1, addedText.name));
                  }
                  if (mode == 0){
                    if (selectedAddedObject){
                      selectedAddedObject.mesh.remove(axesHelper);
                    }
                    if (selectedObjectGroup){
                      selectedObjectGroup.mesh.remove(axesHelper);
                    }
                    if (selectedAddedText && selectedAddedText.bbHelper){
                      scene.remove(selectedAddedText.bbHelper);
                    }
                    if (selectedAddedText && selectedAddedText.rectangle){
                      scene.remove(selectedAddedText.rectangle.mesh);
                    }
                  }
                  selectedAddedObject = 0;
                  selectedObjectGroup = 0;
                  selectedAddedText = addedText;
                  if (!selectedAddedText.bbHelper){
                    if (!selectedAddedText.is2D){
                      selectedAddedText.handleBoundingBox();
                    }
                  }
                  if (mode == 0){
                    if (!selectedAddedText.is2D){
                      scene.add(selectedAddedText.bbHelper);
                    }else{
                      scene.add(selectedAddedText.rectangle.mesh);
                    }
                  }else if (addedText.clickCallbackFunction){
                    addedText.clickCallbackFunction(addedText.name);
                  }
                  afterObjectSelection();
               }else{
                 selectedGrid.toggleSelect(false, true);
              }
            }
           }
         }else if (object.isAddedText){
           if (mode == 0){
             if (selectedAddedObject){
               selectedAddedObject.mesh.remove(axesHelper);
             }
             if (selectedObjectGroup){
               selectedObjectGroup.mesh.remove(axesHelper);
             }
             if (selectedAddedText && selectedAddedText.name != object.name){
               if (selectedAddedText.bbHelper){
                 scene.remove(selectedAddedText.bbHelper);
               }
               if (selectedAddedText.rectangle){
                 scene.remove(selectedAddedText.rectangle.mesh);
               }
             }
           }
           if (!defaultCameraControlsDisabled && !isDeployment){
             terminal.clear();
             terminal.printInfo(Text.SELECTED.replace(Text.PARAM1, object.name));
           }
           selectedAddedObject = 0;
           selectedObjectGroup = 0;
           selectedAddedText = object;
           if (!selectedAddedText.bbHelper){
             selectedAddedText.handleBoundingBox();
           }
           if (mode == 0){
             if (!selectedAddedText.is2D){
               scene.add(selectedAddedText.bbHelper);
             }else{
               scene.add(selectedAddedText.rectangle.mesh);
             }
          }else if (object.clickCallbackFunction){
            object.clickCallbackFunction(object.name);
          }
           afterObjectSelection();
         }
      }else{
         if (!objectSelectedByCommand){
           if (selectedAddedText && selectedAddedText.bbHelper && mode == 0){
             scene.remove(selectedAddedText.bbHelper);
           }
           if (selectedAddedText && selectedAddedText.rectangle && mode == 0){
             scene.remove(selectedAddedText.rectangle.mesh);
           }
           selectedAddedObject = 0;
           selectedObjectGroup = 0;
           selectedAddedText = 0;
           afterObjectSelection();
         }
      }
    }
  });

  canvas.addEventListener("mousedown", function(event){
    inactiveCounter = 0;
    if (mode == 1 && screenMouseDownCallbackFunction){
      var rect = boundingClientRect;
      var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      screenMouseDownCallbackFunction(coordX, coordY);
    }
    isMouseDown = true;
  });
  canvas.addEventListener("mouseup", function(event){
    inactiveCounter = 0;
    if (mode == 1 && screenMouseUpCallbackFunction){
      var rect = boundingClientRect;
      var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      screenMouseUpCallbackFunction(coordX, coordY);
    }
    isMouseDown = false;
  });
  canvas.addEventListener("mousemove", function(event){
    inactiveCounter = 0;
    if (mode == 1 && screenMouseMoveCallbackFunction){
      var rect = boundingClientRect;
      var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      var movementX = event.movementX || event.mozMovementX ||
                      event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY ||
                      event.webkitMovementY || 0;
      screenMouseMoveCallbackFunction(coordX, coordY, movementX, movementY);
    }
  });

  // INITIALIZE THREE.JS SCENE AND RENDERER
  scene = new THREE.Scene();
  debugRenderer = new THREE.CannonDebugRenderer(scene, physicsWorld);
  scene.background = new THREE.Color(sceneBackgroundColor);
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  camera.rotation.order = 'YXZ';
  camera.aspect = (window.innerWidth / window.innerHeight);
  GLOBAL_PROJECTION_UNIFORM.value = camera.projectionMatrix;
  GLOBAL_VIEW_UNIFORM.value = camera.matrixWorldInverse;
  renderer = new THREE.WebGLRenderer({canvas: canvas});
  if (window.devicePixelRatio > 1){
    screenResolution = 1;
    renderer.setPixelRatio(1);
  }else{
    renderer.setPixelRatio(window.devicePixelRatio);
    screenResolution = window.devicePixelRatio;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  boundingClientRect = renderer.domElement.getBoundingClientRect();
  initPhysics();
  initBadTV();
  render();
  fpsCounterIntervalID = setInterval(calculateFps, 1000);
  windowLoaded = true;
  MAX_VERTEX_UNIFORM_VECTORS = renderer.context.getParameter(renderer.context.MAX_VERTEX_UNIFORM_VECTORS);
  VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED = (renderer.context.getParameter(renderer.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0);
  DDS_SUPPORTED = (!(renderer.context.getExtension("WEBGL_compressed_texture_s3tc") == null));
  nullTexture.isNullTexture = true;

  terminal.init();
  ShaderContent = new ShaderContent();
  if (isDeployment){
    console.log(
      "%c "+BANNERL1+"\n"+BANNERL2+"\n"+BANNERL3+"\n"+
      BANNERL4+"\n"+BANNERL5 +"\n"+"by Oğuz Eroğlu - github.com/oguzeroglu",
      "background: black; color: lime"
    );
  }
};

window.addEventListener('mousewheel', mouseWheelEvent, false);
if (typeof InstallTrigger !== 'undefined') {
  // M O Z I L L A
  window.addEventListener('wheel', mouseWheelEvent, false);
}
window.addEventListener('resize', resizeFunction);
window.addEventListener('keydown', function(event){
  inactiveCounter = 0;

  if (!windowLoaded){
    return;
  }

  if (cliFocused || omGUIFocused || tmGUIFocused){
    return;
  }

  if (keyCodeToChar[event.keyCode]){
    if (keyboardBuffer[keyCodeToChar[event.keyCode]]){
      return;
    }
    keyboardBuffer[keyCodeToChar[event.keyCode]] = true;
    if (mode == 1 && screenKeydownCallbackFunction && !isPaused){
      screenKeydownCallbackFunction(keyCodeToChar[event.keyCode]);
    }
  }

  if (mode == 0 && keyboardBuffer["."]){
    for (var gridName in gridSelections){
      gridSelections[gridName].renderCornerHelpers();
    }
  }

  if (mode == 1 && !isDeployment && keyboardBuffer["E"] && keyboardBuffer["T"] && (terminalDiv.style.display == "none" || terminal.isDisabled)){
    terminal.enable();
    terminalDiv.style.display = "";
    if (!isDeployment){
      cliDivheader.style.display = "";
    }
  }
  if (mode == 1 && isPaused){
    return;
  }
  switch(event.keyCode){
    case 16: //SHIFT
      if (mode == 0){
        for (var objName in addedObjects){
          addedObjects[objName].mesh.visible = false;
        }
        for (var objName in objectGroups){
          objectGroups[objName].mesh.visible = false;
        }
        for (var textName in addedTexts){
          addedTexts[textName].hide();
        }
      }
    break;
    case 8: //BACKSPACE
      //FIREFOX GO BACK FIX
      if (selectedAddedObject && !cliFocused){
        event.preventDefault();
      }
      if (mode == 1){
        return;
      }
      if (selectedAddedObject){
        delete addedObjects[selectedAddedObject.name];
        selectedAddedObject.destroy();
        terminal.clear();
        terminal.printInfo(Text.OBJECT_DESTROYED);
        selectedAddedObject = 0;
        if (areaConfigurationsVisible){
          $(datGuiAreaConfigurations.domElement).attr("hidden", true);
          areaConfigurationsVisible = false;
        }
      }else if (selectedObjectGroup){
        delete objectGroups[selectedObjectGroup.name];
        selectedObjectGroup.destroy();
        selectedObjectGroup = 0;
        terminal.clear();
        terminal.printInfo(Text.OBJECT_DESTROYED);
        if (areaConfigurationsVisible){
          $(datGuiAreaConfigurations.domElement).attr("hidden", true);
          areaConfigurationsVisible = false;
        }
      }else if (selectedAddedText){
        terminal.clear();
        parseCommand("destroyText "+selectedAddedText.name);
      }
      afterObjectSelection();
    break;
  }

});
window.addEventListener('keyup', function(event){
  inactiveCounter = 0;

  if (!windowLoaded){
    return;
  }
  if (cliFocused || omGUIFocused || tmGUIFocused){
    return;
  }
  if (keyCodeToChar[event.keyCode]){
    keyboardBuffer[keyCodeToChar[event.keyCode]] = false;
    if (mode == 0 && keyCodeToChar[event.keyCode] == "."){
      for (var gridName in gridSelections){
        gridSelections[gridName].removeCornerHelpers();
      }
    }
    if (mode == 1 && !isPaused && screenKeyupCallbackFunction){
      screenKeyupCallbackFunction(keyCodeToChar[event.keyCode]);
    }
  }
  if (mode == 1 && isPaused){
    return;
  }
  switch(event.keyCode){
    case 190: //PERIOD
      for (var gridName in gridSelections){
        var grid = gridSelections[gridName];
        if (grid.divs){
          for (var i = 0; i<grid.divs.length; i++){
            grid.divs[i].style.visibility = "hidden";
          }
        }
      }
    break;
    case 16: //SHIFT
      if (mode == 0){
        for (var objName in addedObjects){
          addedObjects[objName].mesh.visible = true;
        }
        for (var objName in objectGroups){
          objectGroups[objName].mesh.visible = true;
        }
        for (var textName in addedTexts){
          addedTexts[textName].show();
          if (selectedAddedText && selectedAddedText.name == textName){
            if (!addedTexts[textName].is2D){
              scene.add(addedTexts[textName].bbHelper);
            }else{
              scene.add(addedTexts[textName].rectangle.mesh);
            }
          }
        }
      }
    break;
  }

});

 function initBadTV(){
   renderPass = new THREE.RenderPass(scene, camera);
   if (mode == 1){
    bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(
        window.innerWidth * bloomResolutionScale,
        window.innerHeight * bloomResolutionScale
      ),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
   }
   copyPass = new THREE.ShaderPass( THREE.CopyShader );
   setPostProcessingParams();
   composer = new THREE.EffectComposer(renderer);
   composer.setSize(renderer.getCurrentViewport().z / screenResolution, renderer.getCurrentViewport().w / screenResolution);
   composer.addPass( renderPass );
   if (mode == 1){
    if (bloomOn){
      composer.addPass( bloomPass );
      bloomPass.renderToScreen = true;
    }
   }
   if (!(mode == 1 && bloomOn)){
	    composer.addPass( copyPass );
	    copyPass.renderToScreen = true;
   }
   setPostProcessingParams();
 }

 function setPostProcessingParams(){
   if (mode == 1){
    if (bloomOn){
      bloomPass.strength = bloomStrength;
      bloomPass.radius = bloomRadius;
      bloomPass.threshold = bloomThreshold;
      bloomPass.resolution = new THREE.Vector2(
        window.innerWidth * bloomResolutionScale,
        window.innerHeight * bloomResolutionScale
      );
    }
   }
 }

 function initPhysics(){
   physicsWorld.quatNormalizeSkip = quatNormalizeSkip;
   physicsWorld.quatNormalizeFast = quatNormalizeFast;
   physicsWorld.defaultContactMaterial.contactEquationStiffness = contactEquationStiffness;
   physicsWorld.defaultContactMaterial.contactEquationRelaxation = contactEquationRelaxation;
   physicsWorld.defaultContactMaterial.friction = friction;
   physicsSolver.iterations = physicsIterations;
   physicsSolver.tolerance = physicsTolerance;
   physicsWorld.solver = physicsSolver;
   physicsWorld.gravity.set(0, gravityY, 0);
   physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
 }

 function adjustPostProcessing(variableIndex, val){
   switch(variableIndex){
     case 1: //bloomStrength
      bloomStrength = val;
     break;
     case 2: //Bloom_radius
      bloomRadius = val;
     break;
     case 3: //Bloom_threshhold
      bloomThreshold = val;
     break;
     case 4: //Bloom_resolution_scale
      bloomResolutionScale = val;
      bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(
          window.innerWidth * bloomResolutionScale,
          window.innerHeight * bloomResolutionScale
        ),
        bloomStrength,
        bloomRadius,
        bloomThreshold
      );
     break;
     case 5: //Bloom
      bloomOn = val;
     break;
     case -1: //from script
      if(!isDeployment){
        postprocessingParameters["Bloom_strength"] = bloomStrength;
        postprocessingParameters["Bloom_radius"] = bloomRadius;
        postprocessingParameters["Bloom_threshhold"] = bloomThreshold;
        postprocessingParameters["Bloom_resolution_scale"] = bloomResolutionScale;
        postprocessingParameters["Bloom"] = bloomOn;
      }
     break;
   }
   composer = new THREE.EffectComposer(renderer);
   composer.setSize(renderer.getCurrentViewport().z / screenResolution, renderer.getCurrentViewport().w / screenResolution);
   composer.addPass(renderPass);
   if (bloomOn){
     composer.addPass(bloomPass);
     bloomPass.renderToScreen = true;
   }
   if (!(mode == 1 && bloomOn)){
	    composer.addPass(copyPass);
	    copyPass.renderToScreen = true;
   }
   setPostProcessingParams();
 }

 function omGUIRotateEvent(axis, val){
   var obj = selectedAddedObject;
   if (!obj){
     obj = selectedObjectGroup;
   }
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

 function disableController(controller, noOpacityAdjustment){
   controller.domElement.style.pointerEvents = "none";
   if (!noOpacityAdjustment){
     controller.domElement.style.opacity = .5;
   }
 }

 function enableController(controller){
   controller.domElement.style.pointerEvents = "";
   controller.domElement.style.opacity = 1;
 }

 function enableAllOMControllers(){
   enableController(omRotationXController);
   enableController(omRotationYController);
   enableController(omRotationZController);
   enableController(omMassController);
   enableController(omSlipperyController);
   enableController(omChangeableController);
   enableController(omHasMassController);
   enableController(omTextureOffsetXController);
   enableController(omTextureOffsetYController);
   enableController(omOpacityController);
   enableController(omEmissiveIntensityController);
   enableController(omEmissiveColorController);
   enableController(omDisplacementScaleController);
   enableController(omDisplacementBiasController);
   enableController(omAOIntensityController);
   enableController(omHideHalfController);
   enableController(omBlendingController);
   enableController(omSideController);
 }

 function enableAllTMControllers(){
   enableController(textManipulationTextNameController);
   enableController(textManipulationContentController);
   enableController(textManipulationTextColorController);
   enableController(textManipulationAlphaController);
   enableController(textManipulationHasBackgroundController);
   enableController(textManipulationBackgroundColorController);
   enableController(textManipulationBackgroundAlphaController);
   enableController(textManipulationCharacterSizeController);
   enableController(textManipulationCharacterMarginController);
   enableController(textManipulationLineMarginController);
   enableController(textManipulationClickableController);
   enableController(textManipulationAffectedByFogController);
   enableController(textManipulationIs2DController);
   enableController(textManipulationMarginModeController);
   enableController(textManipulationMarginXController);
   enableController(textManipulationMarginYController);
 }

function isPhysicsWorkerEnabled(){
  return false;
  //return (WORKERS_SUPPORTED && PHYSICS_WORKER_ENABLED);
}

function isCollisionWorkerEnabled(){
  return false;
  //return (WORKERS_SUPPORTED && COLLISION_WORKER_ENABLED);
}

function isPSCollisionWorkerEnabled(){
  return false;
  //return (WORKERS_SUPPORTED && PS_COLLISION_WORKER_ENABLED);
}

function afterObjectSelection(){
  if (mode != 0){
    return;
  }
  if (selectedAddedObject || selectedObjectGroup){
    selectedAddedText = 0;
    $(datGuiObjectManipulation.domElement).attr("hidden", false);
    enableAllOMControllers();
    var obj = selectedAddedObject;
    if (!obj){
      obj = selectedObjectGroup;
    }
    omGUIlastObjectName = obj.name;
    objectManipulationParameters["Object"] = obj.name;
    if (obj instanceof AddedObject){
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
      if (obj.hasDisplacementMap()){
        objectManipulationParameters["Disp. scale"] = obj.mesh.material.uniforms.displacementInfo.value.x;
        objectManipulationParameters["Disp. bias"] = obj.mesh.material.uniforms.displacementInfo.value.y;
      }else{
        disableController(omDisplacementScaleController);
        disableController(omDisplacementBiasController);
      }
      if (!obj.hasDiffuseMap()){
        disableController(omTextureOffsetXController);
        disableController(omTextureOffsetYController);
      }else{
        objectManipulationParameters["Texture offset x"] = obj.mesh.material.uniforms.diffuseMap.value.offset.x;
        objectManipulationParameters["Texture offset y"] = obj.mesh.material.uniforms.diffuseMap.value.offset.y;
      }
      if (!obj.hasAOMap()){
        disableController(omAOIntensityController);
      }else{
        objectManipulationParameters["AO intensity"] = obj.mesh.material.uniforms.aoIntensity.value;
      }
      if (!obj.hasEmissiveMap()){
        disableController(omEmissiveIntensityController);
        disableController(omEmissiveColorController);
      }else{
        objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.emissiveIntensity.value;
        objectManipulationParameters["Emissive col."] = "#"+obj.mesh.material.uniforms.emissiveColor.value.getHexString();
      }
      if (!obj.isSlicable()){
        objectManipulationParameters["Hide half"] = "None";
        disableController(omHideHalfController);
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
        disableController(omOpacityController);
      }
      obj.mesh.add(axesHelper);
    }else if (obj instanceof ObjectGroup){
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
        disableController(omAOIntensityController);
      }else{
        objectManipulationParameters["AO intensity"] = obj.mesh.material.uniforms.totalAOIntensity.value;
      }
      if (!hasEmissiveMap){
        disableController(omEmissiveIntensityController);
        disableController(omEmissiveColorController);
      }else{
        objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.totalEmissiveIntensity.value;
        objectManipulationParameters["Emissive col."] = "#"+obj.mesh.material.uniforms.totalEmissiveColor.value.getHexString();
      }
      disableController(omTextureOffsetXController);
      disableController(omTextureOffsetYController);
      disableController(omDisplacementScaleController);
      disableController(omDisplacementBiasController);
      disableController(omHideHalfController);
      if (obj.cannotSetMass){
        disableController(omHasMassController);
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
      disableController(omMassController);
    }
    objectManipulationParameters["Has mass"] = !obj.noMass;
    objectManipulationParameters["Blending"] = obj.getBlendingText();
    if (obj.mesh.material.blending == NO_BLENDING){
      disableController(omOpacityController);
    }
    omMassController.updateDisplay();
  }else{
    $(datGuiObjectManipulation.domElement).attr("hidden", true);
    for (objName in addedObjects){
      addedObjects[objName].mesh.remove(axesHelper);
    }
    for (objName in objectGroups){
      objectGroups[objName].mesh.remove(axesHelper);
    }
  }
  afterTextSelection();
}

function afterTextSelection(){
  if (mode != 0){
    return;
  }
  if (selectedAddedText){
    enableAllTMControllers();
    $(datGuiTextManipulation.domElement).attr("hidden", false);
    if (!selectedAddedText.is2D){
      scene.add(selectedAddedText.bbHelper);
    }else{
      scene.add(selectedAddedText.rectangle.mesh);
    }
    textManipulationParameters["Text"] = selectedAddedText.name;
    textManipulationParameters["Content"] = selectedAddedText.text;
    textManipulationParameters["Text color"] = "#" + selectedAddedText.material.uniforms.color.value.getHexString();
    textManipulationParameters["Alpha"] = selectedAddedText.material.uniforms.alpha.value;
    textManipulationParameters["Has bg"] = (selectedAddedText.material.uniforms.hasBackgroundColorFlag.value > 0);
    textManipulationParameters["Bg color"] = "#" + selectedAddedText.material.uniforms.backgroundColor.value.getHexString();
    textManipulationParameters["Bg alpha"] = selectedAddedText.material.uniforms.backgroundAlpha.value;
    textManipulationParameters["Char margin"] = selectedAddedText.offsetBetweenChars;
    textManipulationParameters["Line margin"] = selectedAddedText.offsetBetweenLines;
    textManipulationParameters["Aff. by fog"] = selectedAddedText.isAffectedByFog;
    textManipulationParameters["is 2D"] = selectedAddedText.is2D;
    if (!textManipulationParameters["Has bg"]){
      disableController(textManipulationBackgroundColorController);
      disableController(textManipulationBackgroundAlphaController);
    }
    textManipulationParameters["Char size"] = selectedAddedText.characterSize;
    textManipulationParameters["Clickable"] = selectedAddedText.isClickable;
    textManipulationParameters["Margin X"] = selectedAddedText.marginPercentWidth;
    textManipulationParameters["Margin Y"] = selectedAddedText.marginPercentHeight;
    if (selectedAddedText.marginMode == MARGIN_MODE_2D_TEXT_TOP_LEFT){
      textManipulationParameters["Margin mode"] = "Top/Left";
    }else{
      textManipulationParameters["Margin mode"] = "Bottom/Right";
    }
    if (!selectedAddedText.is2D){
      disableController(textManipulationMarginModeController);
      disableController(textManipulationMarginXController);
      disableController(textManipulationMarginYController);
    }else{
      disableController(textManipulationAffectedByFogController);
    }
  }else{
    $(datGuiTextManipulation.domElement).attr("hidden", true);
  }
}

function resizeFunction(){
  if (renderer && composer){
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.oldAspect = camera.aspect;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    boundingClientRect = renderer.domElement.getBoundingClientRect();
    if (isDeployment){
      canvas.oldWidth = (canvas.width / screenResolution) + 'px';
      if (terminal.isMadeVisible){
        ROYGBIV.terminal(false);
        ROYGBIV.terminal(true);
        if (!terminal.terminalPromptEnabled){
          ROYGBIV.terminalPrompt(false);
        }
      }
    }
    if (mode == 1){
      handleViewport();
    }
    if (mode == 0){
      for (var areaName in areas){
        if (areas[areaName].text){
          areas[areaName].text.handleResize();
        }
      }
      for (var pointName in markedPoints){
        if (markedPoints[pointName].text){
          markedPoints[pointName].text.handleResize();
        }
      }
      for (var gridName in gridSelections){
        if (gridSelections[gridName].texts){
          for (var i = 0; i<gridSelections[gridName].texts.length; i++){
            gridSelections[gridName].texts[i].handleResize();
          }
        }
      }
    }
    for (var textName in addedTexts){
      addedTexts[textName].handleResize();
    }
  }
}

function processKeyboardBuffer(){
  if (keyboardBuffer["Left"]){
    camera.rotation.y += rotationYDelta;
  }
  if (keyboardBuffer["Right"]){
    camera.rotation.y -= rotationYDelta;
  }
  if (keyboardBuffer["Up"]){
    camera.rotation.x += rotationXDelta;
  }
  if (keyboardBuffer["Down"]){
    camera.rotation.x -= rotationXDelta;
  }
  if (keyboardBuffer["W"]){
    camera.translateZ(-1 * translateZAmount * defaultAspect / camera.aspect);
  }
  if (keyboardBuffer["S"]){
    camera.translateZ(translateZAmount * defaultAspect / camera.aspect);
  }
  if (keyboardBuffer["D"]){
    camera.translateX(translateXAmount * defaultAspect / camera.aspect);
  }
  if (keyboardBuffer["A"]){
    camera.translateX(-1 * translateXAmount * defaultAspect / camera.aspect);
  }
  if (keyboardBuffer["E"]){
    camera.translateY(-1 * translateYAmount * defaultAspect / camera.aspect);
  }
  if (keyboardBuffer["Q"]){
    camera.translateY(translateYAmount * defaultAspect / camera.aspect);
  }
  if (keyboardBuffer["Z"]){
    camera.rotation.z += rotationZDelta;
  }
  if (keyboardBuffer["C"]){
    camera.rotation.z -= rotationZDelta;
  }
}

function processCameraRotationBuffer(){
  camera.rotation.x += cameraRotationBuffer.x;
  camera.rotation.y += cameraRotationBuffer.y;
  camera.rotation.z += cameraRotationBuffer.z;
  cameraRotationBuffer.x = 0;
  cameraRotationBuffer.y = 0;
  cameraRotationBuffer.z = 0;
}

function mouseWheelEvent(e) {
  if (mode == 1 && isPaused){
    return;
  }
  e.preventDefault();
  if (mode == 1 && defaultCameraControlsDisabled){
    return;
  }
  if (!windowLoaded){
    return;
  }
  var deltaX = e.deltaX;
  var deltaY = e.deltaY;
  if((typeof deltaX == "undefined") || (typeof deltaY == "undefined")){
    return;
  }
  if (Math.abs(deltaX) < Math.abs(deltaY)){
    camera.translateZ(deltaY * defaultAspect / camera.aspect);
  }else{
    camera.translateX(deltaX * defaultAspect / camera.aspect);
  }
}

function rescale(canvas, scale){
  var resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = canvas.width * scale;
  resizedCanvas.height = canvas.height * scale;
  var resizedContext = resizedCanvas.getContext("2d");
  resizedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, resizedCanvas.width, resizedCanvas.height);
  return resizedCanvas;
}

function handleViewport(){
  var curViewport = renderer.getCurrentViewport();
  var cvx = curViewport.x;
  var cvy = curViewport.y;
  var cvz = curViewport.z;
  var cvw = curViewport.w;
  if (screenResolution != 1){
    cvz = cvz / screenResolution;
    cvw = cvw / screenResolution;
  }
  if (mode == 1 && fixedAspect > 0){
    var result = getMaxWidthHeightGivenAspect(canvas.width / screenResolution, canvas.height / screenResolution, fixedAspect);
    var newViewportX = ((canvas.width / screenResolution) - result.width) / 2;
    var newViewportY = ((canvas.height / screenResolution) - result.height) / 2;
    var newViewportZ = result.width;
    var newViewportW = result.height;
    renderer.setViewport(newViewportX, newViewportY, newViewportZ, newViewportW);
    composer.setSize(newViewportZ, newViewportW);
    currentViewport.startX = newViewportX;
    currentViewport.startY = newViewportY;
    currentViewport.width = newViewportZ;
    currentViewport.height = newViewportW;
    camera.oldAspect = camera.aspect;
    camera.aspect = fixedAspect;
    camera.updateProjectionMatrix();
    return;
  }
  var newViewportX = 0;
  var newViewportY = 0;
  var newViewportZ = canvas.width / screenResolution;
  var newViewportW = canvas.height / screenResolution;
  if (viewportMaxWidth > 0){
    if (cvz > viewportMaxWidth){
      var diff = cvz - viewportMaxWidth;
      newViewportX = diff/2;
      newViewportZ = viewportMaxWidth;
    }
  }
  if (viewportMaxHeight > 0){
    if (cvw > viewportMaxHeight){
      var diff = cvw - viewportMaxHeight;
      newViewportY = diff/2;
      newViewportW = viewportMaxHeight;
    }
  }
  renderer.setViewport(newViewportX, newViewportY, newViewportZ, newViewportW);
  composer.setSize(newViewportZ, newViewportW);
  currentViewport.startX = newViewportX;
  currentViewport.startY = newViewportY;
  currentViewport.width = newViewportZ;
  currentViewport.height = newViewportW;

  camera.oldAspect = camera.aspect;
  camera.aspect = currentViewport.width / currentViewport.height;
  camera.updateProjectionMatrix();

}

function getMaxWidthHeightGivenAspect(currentWidth, currentHeight, givenAspect){
  if ((currentWidth/givenAspect) <= currentHeight){
    return {width: currentWidth, height: currentWidth/givenAspect}
  }
  var step = 0.1;
  for (var width = currentWidth; width>0; width-=0.1){
     if (width/givenAspect <= currentHeight){
       return {width: width, height: width/givenAspect};
     }
  }
  return {width: currentWidth, height: currentHeight};
}

function build(projectName, author){
  terminal.clear();
  terminal.printInfo(Text.BUILDING_PROJECT);
  canvas.style.visibility = "hidden";
  terminal.disable();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/build", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200){
      terminal.clear();
      var json = JSON.parse(xhr.responseText);
      if (json.error){
        terminal.printError(json.error);
      }else{
        terminal.printInfo(Text.PROJECT_BUILDED.replace(Text.PARAM1, json.path));
        window.open("http://localhost:8085/deploy/"+projectName+"/application.html", '_blank');
      }
      canvas.style.visibility = "";
      terminal.enable();
    }
  }
  var data = JSON.stringify(new State(projectName, author));
  xhr.send(data);
}

function generateUniqueObjectName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while (nameFound){
    var nameInAddedObjects = !(typeof addedObjects[generatedName] == UNDEFINED);
    var nameInGluedObjects = !(typeof objectGroups[generatedName] == UNDEFINED);
    var nameInChildObjects = false;
    for (var gluedObjectName in objectGroups){
      var group = objectGroups[gluedObjectName].group;
      if (!(typeof group[generatedName] == "undefined")){
        nameInChildObjects = true;
      }
    }
    var nameInAddedTexts = !(typeof addedTexts[generatedName] == UNDEFINED);
    var nameInGridSystems = !(typeof gridSystems[generatedName] == UNDEFINED);
    nameFound = (nameInAddedObjects || nameInGluedObjects || nameInChildObjects || nameInAddedTexts || nameInGridSystems);
    if (nameFound){
      console.error("[*] Object name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

function isNameUsedAsSoftCopyParentName(name){
  for (var objName in addedObjects){
    if (addedObjects[objName].softCopyParentName && addedObjects[objName].softCopyParentName == name){
      return true;
    }
  }
  for (var objName in objectGroups){
    if (objectGroups[objName].softCopyParentName && objectGroups[objName].softCopyParentName == name){
      return true;
    }
  }
  return false;
}

function processNewGridSystemCommand(name, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, axis, isSuperposed, slicedGrid){
  if (addedObjects[name] || objectGroups[name]){
    terminal.printError(Text.NAME_MUST_BE_UNIQUE);
    return true;
  }
  for (var objName in objectGroups){
    for (var childName in objectGroups[objName].group){
      if (childName == name){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
      }
    }
  }
  sizeX = parseInt(sizeX);
  if (isNaN(sizeX)){
    terminal.printError(Text.SIZEX_MUST_BE_A_NUMBER);
    return true;
  }
  sizeZ = parseInt(sizeZ);
  if (isNaN(sizeZ)){
    terminal.printError(Text.SIZEZ_MUST_BE_A_NUMBER);
    return true;
  }
  centerX = parseInt(centerX);
  if (isNaN(centerX)){
    terminal.printError(Text.CENTERX_MUST_BE_A_NUMBER);
    return true;
  }
  centerY = parseInt(centerY);
  if (isNaN(centerY)){
    terminal.printError(Text.CENTERY_MUST_BE_A_NUMBER);
    return true;
  }
  centerZ = parseInt(centerZ);
  if (isNaN(centerZ)){
    terminal.printError(Text.CENTERZ_MUST_BE_A_NUMBER);
    return true;
  }
  cellSize = parseInt(cellSize);
  if (isNaN(cellSize)){
    terminal.printError(Text.CELLSIZE_MUST_BE_A_NUMBER);
    return true;
  }
  if (!axis){
    terminal.printError(Text.AXIS_MUST_BE_ONE_OF_XY_YZ_XZ);
    return true;
  }
  if (axis.toUpperCase() != "XZ" && axis.toUpperCase() != "XY" && axis.toUpperCase() != "YZ"){
    terminal.printError(Text.AXIS_MUST_BE_ONE_OF_XY_YZ_XZ);
    return true;
  }
  var gsObject = new GridSystem(name, parseInt(sizeX), parseInt(sizeZ),
          parseInt(centerX), parseInt(centerY), parseInt(centerZ),
                            outlineColor, parseInt(cellSize), axis.toUpperCase());

  gsObject.isSuperposed = isSuperposed;

  if (slicedGrid){
    gsObject.slicedGrid = slicedGrid;
    slicedGrid.toggleSelect(true, false, false, true);
    slicedGrid.slicedGridSystemName = name;
  }

  rayCaster.refresh();

  return true;
}

// DEPLOYMENT
function startDeployment(){
  if (NO_MOBILE && isMobile){
    terminal.clear();
    terminal.handleAboutCommand();
    terminal.printError("[!] This application does not support mobile devices. Please run this with a non mobile device.");
    return;
  }
  terminal.clear();
  terminal.handleAboutCommand();
  $.getJSON("js/application.json").done(function(data){
    terminal.printInfo("Initializing.");
    var stateLoader = new StateLoader(data);
    var result = stateLoader.load();
    if (result){
      if (stateLoader.hasTextures || stateLoader.hasTexturePacks || stateLoader.hasSkyboxes || stateLoader.hasFonts){
        terminal.printInfo("Loading assets.");
      }else{
        terminal.disable();
        terminalDiv.style.display = "none";
      }
    }else{
      terminal.printError("Project failed to load: "+stateLoader.reason);
    }
  }).fail(function(jqxhr, textStatus, error){
    terminal.printError("Application cannot be loaded.");
  });
  terminal.printInfo("Loading application.");
}

//******************************************************************
// WARNING: FOR TEST PURPOSES
function generateRandomBoxes(gridSystemName){
  var gridSystem = gridSystems[gridSystemName];
  for (var gridNumber in gridSystem.grids){
    var grid = gridSystem.grids[gridNumber];
    grid.toggleSelect(false, false, false, false);
    var height = Math.random() * 100;
    var name = "randomGeneratedBox_"+gridSystemName+"_"+gridNumber;
    var color = ColorNames.generateRandomColor();
    var material = new BasicMaterial({
      color: color,
      name: "null"
    });
    gridSystem.newBox([grid], height, material, name);
  }
}

// WARNING: FOR TEST PURPOSES
function mergeAllAddedObjects(){
  var objNames = "";
  for (var addedObjectName in addedObjects){
    objNames += addedObjectName + ",";
  }
  objNames = objNames.substring(0, objNames.length - 1);
  parseCommand("glue glue_test_1 "+objNames);
}

// WARNING: FOR TEST PURPOSES
function printParticleSystemPerformances(){
  for (var particleSystemName in particleSystems){
    var particleSystem = particleSystems[particleSystemName];
    var particles = particleSystem.particles;
    var lastParticle = particles[particles.length-1];
    console.log(particleSystemName+": "+lastParticle.performance/1000+" secs.");
  }
}

// WARNING: FOR TEST PURPOSES - WORKS ONLY FOR CANVAS TEXTURES
function debugTexture(textureName){
  var texture = textures[textureName];
  if (!texture){
    texture = textureName;
  }
  var context = texture.image.getContext("2d");
  var newTab = window.open();
  var img = new Image(texture.image.width, texture.image.height);
  img.src = texture.image.toDataURL();
  newTab.document.body.appendChild(img);
}

// WARNING: FOR TEST PURPOSES
function debugCanvas(dbgCanvas){
  var context = dbgCanvas.getContext("2d");
  var newTab = window.open();
  var img = new Image(dbgCanvas.width, dbgCanvas.height);
  img.src = dbgCanvas.toDataURL();
  newTab.document.body.appendChild(img);
}

// WARNING: FOR TEST PURPOSES
function clearChildrenMesh(objectGroup){
  for (var childName in objectGroup.group){
    var child = objectGroup.group[childName];
    child.mesh.geometry.dispose();
    delete child.mesh.geometry;
  }
}
