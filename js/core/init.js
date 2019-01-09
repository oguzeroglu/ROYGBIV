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
    lightsGUIFocused = false;
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
  var roygbivScriptingAPIMethodCount = (Object.keys(Roygbiv.prototype).length);
  if (roygbivScriptingAPIMethodCount != ROYGBIV.functionNames.length){
    console.error("[*] Scripting API error: Some methods are missing in functionNames list.");
  }
  for (var i = 0; i<ROYGBIV.functionNames.length; i++){
    if (!Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+ROYGBIV.functionNames[i].toUpperCase()]){
      console.error("[*] Scripting API error: "+ROYGBIV.functionNames[i]+" explanation is not present.");
    }
  }

  pointerLockSupported = 'pointerLockElement' in document ||
                         'mozPointerLockElement' in document ||
                         'webkitPointerLockElement' in document;

  // COMMAND DESCRIPTOR
  commandDescriptor = new CommandDescriptor();
  commandDescriptor.test();

  // COLOR NAMES
  ColorNames = new ColorNames();

  // AREA BIN HANDLER
  areaBinHandler = new WorldBinHandler(true);
  areaBinHandler.isAreaBinHandler = true;

  // AREA CONFIGURATIONS HANDLER
  areaConfigurationsHandler = new AreaConfigurationsHandler();

  // RAYCASTER
  rayCaster = new RayCaster();

  // MODE SWITCHER
  modeSwitcher = new ModeSwitcher();

  // DAT GUI SKYBOX
  datGuiSkybox = new dat.GUI();
  skyboxNameController = datGuiSkybox.add(skyboxParameters, "Name").listen();
  disableController(skyboxNameController, true);
  skyboxAlphaController = datGuiSkybox.add(skyboxParameters, "Alpha").min(0).max(1).step(0.01).onChange(function(val){
    skyboxMesh.material.uniforms.alpha.value = val;
    skyBoxes[mappedSkyboxName].alpha = val;
  }).listen();
  skyboxColorController = datGuiSkybox.addColor(skyboxParameters, "Color").onChange(function(val){
    skyboxMesh.material.uniforms.color.value.set(val);
    skyBoxes[mappedSkyboxName].color = val;
  }).listen();


  // DAT GUI LIGHTS
  datGuiLights = new dat.GUI();
  lightNameController = datGuiLights.add(lightsParameters, "Light").listen();
  disableController(lightNameController, true);
  lightsOffsetXController = datGuiLights.add(lightsParameters, "Offset x").min(-50).max(50).step(0.1).onChange(function(val){
    var pl = lights[selectedLightName];
    var plRep = pointLightRepresentations[selectedLightName];
    pl.position.x = pl.initialPositionX + val;
    plRep.position.x = pl.position.x;
  }).onFinishChange(function(val){

  }).listen();
  lightsOffsetYController = datGuiLights.add(lightsParameters, "Offset y").min(-50).max(50).step(0.1).onChange(function(val){
    var pl = lights[selectedLightName];
    var plRep = pointLightRepresentations[selectedLightName];
    pl.position.y = pl.initialPositionY + val;
    plRep.position.y = pl.position.y;
  }).onFinishChange(function(val){

  }).listen();
  lightsOffsetZController = datGuiLights.add(lightsParameters, "Offset z").min(-50).max(50).step(0.1).onChange(function(val){
    var pl = lights[selectedLightName];
    var plRep = pointLightRepresentations[selectedLightName];
    pl.position.z = pl.initialPositionZ + val;
    plRep.position.z = pl.position.z;
  }).onFinishChange(function(val){

  }).listen();
  lightsIntensityController = datGuiLights.add(lightsParameters, "Intensity").min(0.0).max(1.0).step(0.01).onChange(function(val){
    var light = lights[selectedLightName];
    light.intensity = val;
  }).onFinishChange(function(val){

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
  }).listen();
  omBlendingController = datGuiObjectManipulation.add(objectManipulationParameters, "Blending", [
    "None", "Normal", "Additive", "Subtractive", "Multiply"
  ]).onChange(function(val){
    var obj = selectedAddedObject;
    if (!obj){
      obj = selectedObjectGroup;
    }
    if (obj instanceof AddedObject){
      enableController(omOpacityController);
    }
    if (val == "None"){
      obj.setBlending(NO_BLENDING);
      if (obj instanceof AddedObject){
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
      for (var childObjName in selectedObjectGroup.group){
        var childObj = selectedObjectGroup.group[childObjName];
        childObj.material.transparent = true;
        childObj.material.opacity = val;
        childObj.initOpacitySet = false;
        childObj.initOpacity = childObj.opacity;
      }
      return;
    }else if (selectedAddedObject){
      selectedAddedObject.updateOpacity(val);
      selectedAddedObject.initOpacitySet = false;
      selectedAddedObject.initOpacity = selectedAddedObject.opacity;
    }
  }).onFinishChange(function(value){

  }).listen();
  omAOIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "AO intensity").min(0).max(10).step(0.1).onChange(function(val){
    selectedAddedObject.mesh.material.uniforms.aoIntensity = new THREE.Uniform(val);
  }).onFinishChange(function(value){

  }).listen();
  omShininessController = datGuiObjectManipulation.add(objectManipulationParameters, "Shininess").min(0).max(100).step(0.01).onChange(function(val){
    var material = selectedAddedObject.material;
    if (material.isMeshPhongMaterial){
      material.shininess = val;
      material.needsUpdate = true;
      selectedAddedObject.initShininessSet = false;
    }
  }).onFinishChange(function(value){

  }).listen();
  omEmissiveIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "Emissive int.").min(0).max(100).step(0.01).onChange(function(val){
    var material = selectedAddedObject.mesh.material;
    material.uniforms.emissiveIntensity.value = val;
    selectedAddedObject.initEmissiveIntensitySet = false;
    selectedAddedObject.initEmissiveIntensity = val;
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

  datGuiObjectManipulation.domElement.addEventListener("mousedown", function(e){
    omGUIFocused = true;
    lightsGUIFocused = false;
  });

  datGuiLights.domElement.addEventListener("mousedown", function(e){
    lightsGUIFocused = true;
    omGUIFocused = false;
  });

  // DAT GUI
  datGui = new dat.GUI();
  datGui.add(postprocessingParameters, "Scanlines_count").min(0).max(1000).step(1).onChange(function(val){
    adjustPostProcessing(0, val);
  });
  datGui.add(postprocessingParameters, "Scanlines_sIntensity").min(0.0).max(2.0).step(0.1).onChange(function(val){
    adjustPostProcessing(1, val);
  });
  datGui.add(postprocessingParameters, "Scanlines_nIntensity").min(0.0).max(2.0).step(0.1).onChange(function(val){
    adjustPostProcessing(2, val);
  });
  datGui.add(postprocessingParameters, "Static_amount").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(3, val);
  });
  datGui.add(postprocessingParameters, "Static_size").min(0.0).max(100.0).step(1.0).onChange(function(val){
    adjustPostProcessing(4, val);
  });
  datGui.add(postprocessingParameters, "RGBShift_amount").min(0.0).max(0.1).step(0.01).onChange(function(val){
    adjustPostProcessing(5, val);
  });
  datGui.add(postprocessingParameters, "RGBShift_angle").min(0.0).max(2.0).step(0.1).onChange(function(val){
    adjustPostProcessing(6, val);
  });
  datGui.add(postprocessingParameters, "BadTV_thickDistort").min(0.1).max(20).step(0.1).onChange(function(val){
    adjustPostProcessing(7, val);
  });
  datGui.add(postprocessingParameters, "BadTV_fineDistort").min(0.1).max(20).step(0.1).onChange(function(val){
    adjustPostProcessing(8, val);
  });
  datGui.add(postprocessingParameters, "BadTV_distortSpeed").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(9, val);
  });
  datGui.add(postprocessingParameters, "BadTV_rollSpeed").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(10, val);
  });
  datGui.add(postprocessingParameters, "Bloom_strength").min(0.0).max(3.0).step(0.01).onChange(function(val){
    adjustPostProcessing(11, val);
  });
  datGui.add(postprocessingParameters, "Bloom_radius").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(12, val);
  });
  datGui.add(postprocessingParameters, "Bloom_threshhold").min(0.0).max(1.0).step(0.01).onChange(function(val){
    adjustPostProcessing(13, val);
  });
  datGui.add(postprocessingParameters, "Bloom_resolution_scale").min(0.1).max(1.0).step(0.001).onChange(function(val){
    adjustPostProcessing(19, val);
  });
  datGui.add(postprocessingParameters, "Scanlines").onChange(function(val){
    adjustPostProcessing(14, val);
  });
  datGui.add(postprocessingParameters, "RGB").onChange(function(val){
    adjustPostProcessing(15, val);
  });
  datGui.add(postprocessingParameters, "Bad TV").onChange(function(val){
    adjustPostProcessing(16, val);
  });
  datGui.add(postprocessingParameters, "Bloom").onChange(function(val){
    adjustPostProcessing(17, val);
  });
  datGui.add(postprocessingParameters, "Static").onChange(function(val){
    adjustPostProcessing(18, val);
  });

  $(datGui.domElement).attr("hidden", true);
  $(datGuiObjectManipulation.domElement).attr("hidden", true);
  $(datGuiLights.domElement).attr("hidden", true);
  $(datGuiSkybox.domElement).attr("hidden", true);

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
  canvas.addEventListener("click", function(event){
    cliFocused = false;
    omGUIFocused = false;
    lightsGUIFocused = false;
    if (windowLoaded){
      var rect = boundingClientRect;
      var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
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
      if (mode == 1 && defaultCameraControlsDisabled){
        return;
      }
      REUSABLE_VECTOR.setFromMatrixPosition(camera.matrixWorld);
      REUSABLE_VECTOR_2.set(coordX, coordY, 0.5).unproject(camera).sub(REUSABLE_VECTOR).normalize();
       rayCaster.findIntersections(REUSABLE_VECTOR, REUSABLE_VECTOR_2, (mode == 0));
       if (intersectionPoint){
         var object = addedObjects[intersectionObject];
         if (!object){
           object = objectGroups[intersectionObject];
         }
         if (!object){
           object = gridSystems[intersectionObject];
         }
         if (object instanceof AddedObject || object instanceof ObjectGroup){
           terminal.clear();
           var point = intersectionPoint;
           var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
           if (object instanceof AddedObject){
             terminal.printInfo(Text.CLICKED_ON.replace(
               Text.PARAM1, object.name + coordStr
             ));
             if (mode == 0){
               if (selectedAddedObject){
                 selectedAddedObject.mesh.remove(axesHelper);
               }
               if (selectedObjectGroup){
                 selectedObjectGroup.mesh.remove(axesHelper);
               }
             }
             selectedAddedObject = object;
             objectSelectedByCommand = false;
             selectedObjectGroup = 0;
             afterObjectSelection();
             if (object.clickCallbackFunction){
               object.clickCallbackFunction(point.x, point.y, point.z);
             }
           }else if (object instanceof ObjectGroup){
             terminal.printInfo(Text.CLICKED_ON.replace(
               Text.PARAM1, object.name+coordStr
             ));
             if (mode == 0){
               if (selectedAddedObject){
                 selectedAddedObject.mesh.remove(axesHelper);
               }
               if (selectedObjectGroup){
                 selectedObjectGroup.mesh.remove(axesHelper);
               }
             }
             selectedObjectGroup = object;
             objectSelectedByCommand = false;
             selectedAddedObject = 0;
             afterObjectSelection();
             if (object.clickCallbackFunction){
               object.clickCallbackFunction(point.x, point.y, point.z);
             }
           }
         } else if (object instanceof GridSystem){
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
                 }
                 selectedAddedObject = addedObject;
                 selectedObjectGroup = 0;
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
                 }
                 selectedAddedObject = 0;
                 selectedObjectGroup = objectGroup;
                 afterObjectSelection();
                 if (objectGroup.clickCallbackFunction){
                   objectGroup.clickCallbackFunction(point.x, point.y, point.z);
                 }
               }else{
                 selectedGrid.toggleSelect(false, true);
              }
            }
           }
         }
       }else{
         if (!objectSelectedByCommand){
           selectedAddedObject = 0;
           selectedObjectGroup = 0;
           selectedLightName = 0;
           afterObjectSelection();
         }
       }
    }
  });

  canvas.addEventListener("mousedown", function(event){
    if (mode == 1 && screenMouseDownCallbackFunction){
      var rect = boundingClientRect;
      var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      screenMouseDownCallbackFunction(coordX, coordY);
    }
    isMouseDown = true;
  });
  canvas.addEventListener("mouseup", function(event){
    if (mode == 1 && screenMouseUpCallbackFunction){
      var rect = boundingClientRect;
      var coordX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var coordY = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      screenMouseUpCallbackFunction(coordX, coordY);
    }
    isMouseDown = false;
  });
  canvas.addEventListener("mousemove", function(event){
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
      "%c "+Text.BANNERL1+"\n"+Text.BANNERL2+"\n"+Text.BANNERL3+"\n"+
      Text.BANNERL4+"\n"+Text.BANNERL5 +"\n"+"by Oğuz Eroğlu - github.com/oguzeroglu",
      "background: black; color: lime"
    );
  }
};

window.addEventListener('mousewheel', mouseWheelEvent, false);
if (typeof InstallTrigger !== 'undefined') {
  // M O Z I L L A
  window.addEventListener('wheel', mouseWheelEvent, false);
}
window.addEventListener('resize', function() {
  if (renderer && composer){
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.oldAspect = camera.aspect;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    boundingClientRect = renderer.domElement.getBoundingClientRect();
  }
});
window.addEventListener('keydown', function(event){
  if (!windowLoaded){
    return;
  }

  if (cliFocused || omGUIFocused || lightsGUIFocused){
    return;
  }

  if (keyCodeToChar[event.keyCode]){
    keyboardBuffer[keyCodeToChar[event.keyCode]] = true;
  }

  if (mode == 1 && !isDeployment && keyboardBuffer["E"] && keyboardBuffer["T"] && (terminalDiv.style.display == "none" || terminal.isDisabled)){
    terminal.enable();
    terminalDiv.style.display = "";
    if (!isDeployment){
      cliDivheader.style.display = "";
    }
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
      }
      afterObjectSelection();
    break;
  }

});
window.addEventListener('keyup', function(event){
  if (!windowLoaded){
    return;
  }
  if (cliFocused || omGUIFocused || lightsGUIFocused){
    return;
  }
  if (keyCodeToChar[event.keyCode]){
    keyboardBuffer[keyCodeToChar[event.keyCode]] = false;
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
      }
    break;
  }

});

 function initBadTV(){
   renderPass = new THREE.RenderPass(scene, camera);
   if (mode == 1){
    badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
    rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
    filmPass = new THREE.ShaderPass( THREE.FilmShader );
    staticPass = new THREE.ShaderPass( THREE.StaticShader );
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
   if (mode == 1){
     filmPass.uniforms.grayscale.value = 0;
   }
   setBadTVParams();
   composer = new THREE.EffectComposer(renderer);
   composer.addPass( renderPass );
   if (mode == 1){
    if (scanlineOn){
      composer.addPass( filmPass );
    }
    if (badTvOn){
      composer.addPass( badTVPass );
    }
    if (rgbOn){
      composer.addPass( rgbPass );
    }
    if (staticOn){
      composer.addPass( staticPass );
    }
    if (bloomOn){
      composer.addPass( bloomPass );
      bloomPass.renderToScreen = true;
    }
   }
   if (!(mode == 1 && bloomOn)){
	    composer.addPass( copyPass );
	    copyPass.renderToScreen = true;
   }
   setBadTVParams();
 }

 function setBadTVParams(){
   if (mode == 1){
    if (badTvOn){
      badTVPass.uniforms[ 'distortion' ].value = badtvThick;
      badTVPass.uniforms[ 'distortion2' ].value = badtvFine;
      badTVPass.uniforms[ 'speed' ].value = badtvDistortSpeed
      badTVPass.uniforms[ 'rollSpeed' ].value = badtvRollSpeed;
    }
    if (staticOn){
      staticPass.uniforms[ 'amount' ].value = staticAmount;
      staticPass.uniforms[ 'size' ].value = staticSize;
    }
    if (rgbOn){
      rgbPass.uniforms[ 'angle' ].value = rgbAngle * Math.PI;
      rgbPass.uniforms[ 'amount' ].value = rgbAmount;
    }
    if (scanlineOn){
      filmPass.uniforms[ 'sCount' ].value = scanlineCount;
      filmPass.uniforms[ 'sIntensity' ].value = scanlineSIntensity;
      filmPass.uniforms[ 'nIntensity' ].value = scanlineNIntensity;
    }
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
     case 0: //Scanlines_count
      scanlineCount = val;
     break;
     case 1: //Scanlines_sIntensity
      scanlineSIntensity = val;
     break;
     case 2: //Scanlines_nIntensity
      scanlineNIntensity = val;
     break;
     case 3: //Static_amount
      staticAmount = val;
     break;
     case 4: //Static_size
      staticSize = val;
     break;
     case 5: //RGBShift_amount
      rgbAmount = val;
     break;
     case 6: //RGBShift_angle
      rgbAngle = val;
     break;
     case 7: //BadTV_thickDistort
      badtvThick = val;
     break;
     case 8: //BadTV_fineDistort
      badtvFine = val;
     break;
     case 9: //BadTV_distortSpeed
      badtvDistortSpeed = val;
     break;
     case 10: //BadTV_rollSpeed
      badtvRollSpeed = val;
     break;
     case 11: //bloomStrength
      bloomStrength = val;
     break;
     case 12: //Bloom_radius
      bloomRadius = val;
     break;
     case 13: //Bloom_threshhold
      bloomThreshold = val;
     break;
     case 14: //Scanlines
      scanlineOn = val;
     break;
     case 15: //RGB
      rgbOn = val;
     break;
     case 16: //Bad TV
      badTvOn = val;
     break;
     case 17: //Bloom
      bloomOn = val;
     break;
     case 18: //Static
      staticOn = val;
     break;
     case 19: //Bloom_resolution_scale
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
   }
   composer = new THREE.EffectComposer( renderer );
   composer.addPass( renderPass );
   if (scanlineOn){
     composer.addPass( filmPass );
   }
   if (badTvOn){
     composer.addPass( badTVPass );
   }
   if (rgbOn){
     composer.addPass( rgbPass );
   }
   if (staticOn){
     composer.addPass( staticPass );
   }
   if (bloomOn){
   composer.addPass( bloomPass );
   }
   composer.addPass( copyPass );
	 copyPass.renderToScreen = true;
   setBadTVParams();
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

function enableAllLightsControllers(){
  enableController(lightsOffsetXController);
  enableController(lightsOffsetYController);
  enableController(lightsOffsetZController);
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
  enableController(omShininessController);
  enableController(omEmissiveIntensityController);
  enableController(omDisplacementScaleController);
  enableController(omDisplacementBiasController);
  enableController(omAOIntensityController);
  enableController(omHideHalfController);
  enableController(omBlendingController);
  enableController(omSideController);
}

function afterLightSelection(){
  if (mode != 0){
    return;
  }
  if (selectedLightName){
    enableAllLightsControllers();
    $(datGuiLights.domElement).attr("hidden", false);
    var light = lights[selectedLightName];
    lightsParameters["Light"] = selectedLightName;
    lightsParameters["Intensity"] = light.intensity;
    if (light.isPointLight){
      lightsParameters["Offset x"] = light.position.x - light.initialPositionX;
      lightsParameters["Offset y"] = light.position.y - light.initialPositionY;
      lightsParameters["Offset z"] = light.position.z - light.initialPositionZ;
    }else{
      disableController(lightsOffsetXController);
      disableController(lightsOffsetYController);
      disableController(lightsOffsetZController);
    }
  }else{
    $(datGuiLights.domElement).attr("hidden", true);
  }
}

function afterObjectSelection(){
  if (mode != 0){
    return;
  }
  if (selectedAddedObject || selectedObjectGroup){
    selectedLightName = 0;
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
      }else{
        objectManipulationParameters["Emissive int."] = obj.mesh.material.uniforms.emissiveIntensity.value;
      }
      if (!obj.material.isMeshPhongMaterial){
        disableController(omShininessController);
      }else{
        objectManipulationParameters["Shininess"] = obj.material.shininess;
        objectManipulationParameters["Emissive int."] = obj.material.emissiveIntensity;
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
      disableController(omTextureOffsetXController);
      disableController(omTextureOffsetYController);
      disableController(omShininessController);
      disableController(omEmissiveIntensityController);
      disableController(omDisplacementScaleController);
      disableController(omDisplacementBiasController);
      disableController(omAOIntensityController);
      disableController(omOpacityController);
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
  afterLightSelection();
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

// DEPLOYMENT
function startDeployment(){
  terminal.clear();
  terminal.handleAboutCommand();
  $.getJSON("js/application.json").done(function(data){
    terminal.printInfo("Initializing.");
    var stateLoader = new StateLoader(data);
    var result = stateLoader.load();
    if (result){
      if (stateLoader.hasTextures || stateLoader.hasTexturePacks || stateLoader.hasSkyboxes){
        terminal.printInfo("Loading textures.");
      }else{
        terminal.disable();
        terminalDiv.style.display = "none";
      }
    }else{
      terminal.printError(Text.PROJECT_FAILED_TO_LOAD.replace(
        Text.PARAM1, stateLoader.reason
      ));
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
