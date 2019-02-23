window.onload = function() {
  // STATS
  fpsHandler = new FPSHandler();
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  // DRAGABLE CLI
  var cliDiv = document.getElementById("cliDiv");
  cliDivheader = document.getElementById("cliDivheader");
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
  }

  // SELECTION HANDLER
  if (!isDeployment){
    selectionHandler = new SelectionHandler();
  }

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
    // GUI HANDLER
    guiHandler = new GUIHandler();
    guiHandler.init();
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
               selectionHandler.resetCurrentSelection();
             }
             if (!isDeployment){
               selectionHandler.select(object);
               guiHandler.afterObjectSelection();
             }
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
               selectionHandler.resetCurrentSelection();
             }
             if (!isDeployment){
               selectionHandler.select(object);
               guiHandler.afterObjectSelection();
             }
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
                   selectionHandler.resetCurrentSelection();
                 }
                 if (!isDeployment){
                   selectionHandler.select(addedObject);
                   guiHandler.afterObjectSelection();
                 }
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
                   selectionHandler.resetCurrentSelection();
                 }
                 if (!isDeployment){
                   selectionHandler.select(objectGroup);
                   guiHandler.afterObjectSelection();
                 }
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
                    selectionHandler.resetCurrentSelection();
                  }
                  if (!isDeployment){
                    selectionHandler.select(addedText);
                  }
                  if (mode != 0 && addedText.clickCallbackFunction){
                    addedText.clickCallbackFunction(addedText.name);
                  }
                  if (!isDeployment){
                    guiHandler.afterObjectSelection();
                  }
               }else{
                 selectedGrid.toggleSelect(false, true);
              }
            }
           }
         }else if (object.isAddedText){
           if (mode == 0){
             selectionHandler.resetCurrentSelection();
           }
           if (!defaultCameraControlsDisabled && !isDeployment){
             terminal.clear();
             terminal.printInfo(Text.SELECTED.replace(Text.PARAM1, object.name));
           }
           if (!isDeployment){
             selectionHandler.select(object);
           }
           if (mode != 0 && object.clickCallbackFunction){
             object.clickCallbackFunction(object.name);
           }
           if (!isDeployment){
             guiHandler.afterObjectSelection();
           }
         }
      }else{
        if (!isDeployment){
          selectionHandler.resetCurrentSelection();
          guiHandler.afterObjectSelection();
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
  windowLoaded = true;
  MAX_VERTEX_UNIFORM_VECTORS = renderer.context.getParameter(renderer.context.MAX_VERTEX_UNIFORM_VECTORS);
  VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED = (renderer.context.getParameter(renderer.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0);
  DDS_SUPPORTED = (!(renderer.context.getExtension("WEBGL_compressed_texture_s3tc") == null));
  INSTANCING_SUPPORTED = (!(renderer.context.getExtension("ANGLE_instanced_arrays") == null));

  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = 1;
  tmpCanvas.height = 1;
  var tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.fillStyle = "rgba("+255+","+255+","+255+","+(0)+")";
  tmpCtx.fillRect(0, 0, 1, 1);
  nullTexture = new THREE.CanvasTexture(tmpCanvas);
  nullTexture.wrapS = THREE.ClampToEdgeWrapping;
  nullTexture.wrapT = THREE.ClampToEdgeWrapping;
  nullTexture.minFilter = THREE.NearestFilter;
  nullTexture.magFilter = THREE.NearestFilter;
  nullTexture.needsUpdate = true;
  nullCubeTexture = new THREE.CubeTexture([
    nullTexture.image, nullTexture.image, nullTexture.image,
    nullTexture.image, nullTexture.image, nullTexture.image
  ]);
  GLOBAL_CUBE_TEXTURE_UNIFORM = new THREE.Uniform(nullCubeTexture);
  GLOBAL_CUBE_TEXTURE_UNIFORM.value.wrapS = THREE.ClampToEdgeWrapping;
  GLOBAL_CUBE_TEXTURE_UNIFORM.value.wrapT = THREE.ClampToEdgeWrapping;
  GLOBAL_CUBE_TEXTURE_UNIFORM.value.minFilter = THREE.NearestFilter;
  GLOBAL_CUBE_TEXTURE_UNIFORM.value.magFilter = THREE.NearestFilter;
  GLOBAL_CUBE_TEXTURE_UNIFORM.value.needsUpdate = true;
  nullTexture.isNullTexture = true;

  if (!isDeployment){
    terminal.init();
  }
  ShaderContent = new ShaderContent();
  if (isDeployment){
    cliDiv.value = "";
    appendtoDeploymentConsole("Loading shaders.");
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
if (isMobile){
  window.addEventListener('orientationchange', resizeFunction);
}
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
      if (mode == 0 && !isDeployment){
        selectionHandler.resetCurrentSelection();
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
      if (selectionHandler.getSelectedObject() && !cliFocused){
        event.preventDefault();
      }
      if (mode == 1 || isDeployment){
        return;
      }
      var currentSelection = selectionHandler.getSelectedObject();
      if (currentSelection.isAddedObject){
        delete addedObjects[currentSelection.name];
        currentSelection.destroy();
        terminal.clear();
        terminal.printInfo(Text.OBJECT_DESTROYED);
        selectionHandler.resetCurrentSelection();
        if (areaConfigurationsVisible){
          guiHandler.hide(datGuiAreaConfigurations);
          areaConfigurationsVisible = false;
        }
      }else if (currentSelection.isObjectGroup){
        delete objectGroups[currentSelection.name];
        currentSelection.destroy();
        selectionHandler.resetCurrentSelection();
        terminal.clear();
        terminal.printInfo(Text.OBJECT_DESTROYED);
        if (areaConfigurationsVisible){
          guiHandler.hide(datGuiAreaConfigurations);
          areaConfigurationsVisible = false;
        }
      }else if (currentSelection.isAddedText){
        terminal.clear();
        parseCommand("destroyText "+currentSelection.name);
      }
      guiHandler.afterObjectSelection();
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
      if (!isDeployment && terminal.isMadeVisible){
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
  appendtoDeploymentConsole("Project name: "+projectName);
  appendtoDeploymentConsole("Author: "+author);
  appendtoDeploymentConsole("");
  appendtoDeploymentConsole("Powered by");
  appendtoDeploymentConsole(BANNERL1);
  appendtoDeploymentConsole(BANNERL2);
  appendtoDeploymentConsole(BANNERL3);
  appendtoDeploymentConsole(BANNERL4);
  appendtoDeploymentConsole(BANNERL5);
  appendtoDeploymentConsole("");
  appendtoDeploymentConsole("by Oğuz Eroğlu - github.com/oguzeroglu");
  appendtoDeploymentConsole("");
  appendtoDeploymentConsole("");
  if (NO_MOBILE && isMobile){
    appendtoDeploymentConsole("[!] This application does not support mobile devices. Please run this with a non mobile device.");
    return;
  }
  $.getJSON("js/application.json").done(function(data){
    appendtoDeploymentConsole("Initializing.");
    var stateLoader = new StateLoader(data);
    var result = stateLoader.load();
    if (result){
      if (stateLoader.hasTextures || stateLoader.hasTexturePacks || stateLoader.hasSkyboxes || stateLoader.hasFonts){
        appendtoDeploymentConsole("Loading assets.");
      }else{
        removeCLIDom();
      }
    }else{
      appendtoDeploymentConsole("[!] Project failed to load: "+stateLoader.reason);
    }
  }).fail(function(jqxhr, textStatus, error){
    appendtoDeploymentConsole("[!] Application cannot be loaded.");
  });
  appendtoDeploymentConsole("Loading application.");
}

function appendtoDeploymentConsole(val){
  cliDiv.value += val + "\n";
}

function removeCLIDom(){
  if (!(typeof cliDiv == UNDEFINED)){
    document.body.removeChild(cliDiv);
  }
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

// WARNING: FOR TEST PURPOSES
function drawGridToScreen(widthParts, heightParts){
  var totalParts = (widthParts+1) * (heightParts+1);
  var gridGeom = new THREE.BufferGeometry();
  var positions = [];
  var gridIndices = new Float32Array(totalParts);
  var curX = 1;
  var curY = -1;
  var curIndex = 0;
  for (var i = 0; i<=widthParts; i++){
    for (var i2 = 0; i2<=heightParts; i2++){
      gridIndices[curIndex] = curIndex;
      curIndex ++;
      positions.push(new THREE.Vector2(curX, curY));
      curY += (2 / heightParts);
    }
    curX -= (2 / widthParts);
    curY = -1;
  }
  var indicesBufferAttribute = new THREE.BufferAttribute(gridIndices, 1);
  indicesBufferAttribute.setDynamic(false);
  gridGeom.addAttribute('rectangleIndex', indicesBufferAttribute);
  gridGeom.setDrawRange(0, totalParts);
  var gridMaterial = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.rectangleVertexShader.replace(
      "uniform vec2 positions[24];", "uniform vec2 positions["+totalParts+"];"
    ).replace(
      "gl_Position = vec4(curPosition.x, curPosition.y, 0.0, 1.0);",
      "gl_Position = vec4(curPosition.x, curPosition.y, 0.0, 1.0); gl_PointSize = 5.0;"
    ),
    fragmentShader: ShaderContent.rectangleFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      color: new THREE.Uniform(new THREE.Color("lime")),
      alpha: new THREE.Uniform(1.0),
      positions: new THREE.Uniform(positions)
    }
  });
  var gridMesh = new THREE.Points(gridGeom, gridMaterial);
  gridMesh.frustumCulled = false;
  scene.add(gridMesh);
}
