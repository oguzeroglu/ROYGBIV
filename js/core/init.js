window.onload = function() {
  // TERMINAL
  if (!isDeployment){
    terminal = new Terminal();
  }
  // FACTORIES
  raycasterFactory = new RaycasterFactory();
  physicsFactory = new PhysicsFactory();
  textureLoaderFactory = new TextureLoaderFactory();
  // FPS HANDLER
  fpsHandler = new FPSHandler();
  // REUSABLE COLLISION INFO
  reusableCollisionInfo = new CollisionInfo();
  GLOBAL_VIEWPORT_UNIFORM = new THREE.Uniform(new THREE.Vector4(0, 0, window.innerWidth, window.innerHeight));
  isOrientationLandscape = (window.innerWidth > window.innerHeight);
  // MACRO HANDLER
  macroHandler = new MacroHandler();
  // TEXTURE ATLAS HANDLER
  textureAtlasHandler = new TextureAtlasHandler();
  // SKYBOX HANDLER
  skyboxHandler = new SkyboxHandler();
  // FOG HANDLER
  fogHandler = new FogHandler();
  // SCRIPTS HANDLER
  scriptsHandler = new ScriptsHandler();
  // ANIMATION HANDLER
  animationHandler = new AnimationHandler();
  // LIGHT HANDLER
  lightHandler = new LightHandler();
  // DELAYED EXECUTION HANDLER
  delayedExecutionHandler = new DelayedExecutionHandler();
  // SCENE HANDLER
  sceneHandler = new SceneHandler();
  // LIGHTNING HANDLER
  lightningHandler = new LightningHandler();
  // STEERING HANDLER
  steeringHandler = new SteeringHandler();
  // TEXT POOL
  Text = (!isDeployment)? new Text(): 0;
  // DRAGABLE CLI
  var cliDiv = document.getElementById("cliDiv");
  cliDivheader = document.getElementById("cliDivheader");
  var terminalDiv = document.getElementById("terminalDiv");

  // CONTROLS TEST
  if (!isDeployment){
    var controlClasses = [FreeControls, FPSControls, OrbitControls, CustomControls];
    var mandatoryControlMethods = [
      "update", "onMouseWheel", "onMouseMove", "onMouseDown", "onMouseUp",
      "onPinch", "onSwipe", "onTap", "onClick", "onActivated", "onDeactivated",
      "onTouchStart", "onTouchMove", "onTouchEnd", "onKeyDown", "onKeyUp", "onResize",
      "onFullScreenChange", "onDrag"
    ];
    for (var i = 0; i<controlClasses.length; i++){
      for (var i2 = 0; i2<mandatoryControlMethods.length; i2++){
        if (!controlClasses[i].prototype[mandatoryControlMethods[i2]]){
          console.error("[!] Control class #"+(i)+" does not implement "+mandatoryControlMethods[i2]);
        }
      }
    }
  }

  // DEFAULT CONTROL
  activeControl = new FreeControls({});

  // CROSSHAIR HANDLER
  crosshairHandler = new CrosshairHandler();

  if (!isDeployment){
    objectExportImportHandler = new ObjectExportImportHandler();
    selectionHandler = new SelectionHandler();
    particleSystemCreatorGUIHandler = new ParticleSystemCreatorGUIHandler();
    muzzleFlashCreatorGUIHandler = new MuzzleFlashCreatorGUIHandler();
    fpsWeaponGUIHandler = new FPSWeaponGUIHandler();
    texturePackCreatorGUIHandler = new TexturePackCreatorGUIHandler();
    skyboxCreatorGUIHandler = new SkyboxCreatorGUIHandler();
    fogCreatorGUIHandler = new FogCreatorGUIHandler();
    fontCreatorGUIHandler = new FontCreatorGUIHandler();
    crosshairCreatorGUIHandler = new CrosshairCreatorGUIHandler();
    scriptsGUIHandler = new ScriptsGUIHandler();
    animationCreatorGUIHandler = new AnimationCreatorGUIHandler();
    lightningCreatorGUIHandler = new LightningCreatorGUIHandler();
    virtualKeyboardCreatorGUIHandler = new VirtualKeyboardCreatorGUIHandler();
    lightsGUIHandler = new LightsGUIHandler();
    graphCreatorGUIHandler = new GraphCreatorGUIHandler();
    steeringBehaviorCreatorGUIHandler = new SteeringBehaviorCreatorGUIHandler();
    jumpDescriptorCreatorGUIHandler = new JumpDescriptorCreatorGUIHandler();
  }

  // PHYSICS BODY GENERATOR
  physicsBodyGenerator = new PhysicsBodyGenerator();

  // CPU OPERATIONS HANDLER
  cpuOperationsHandler = new CPUOperationsHandler();

  // SHADER PRECISION HANDLER
  shaderPrecisionHandler = new ShaderPrecisionHandler();

  // PARTICLE SYSTEM GENERATOR
  particleSystemGenerator = new ParticleSystemGenerator();

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
      ROYGBIV[ROYGBIV.functionNames[i]].roygbivFuncName = ROYGBIV.functionNames[i];
    }
  }

  // DEFAULT FONT
  document.fonts.forEach(function(font){
    if (font.family == "hack"){
      defaultFont = new Font(null, null, font);
    }
  });

  // COMMAND DESCRIPTOR
  if (!isDeployment){
    commandDescriptor = new CommandDescriptor();
    commandDescriptor.test();
  }

  // COLOR NAMES
  ColorNames = new ColorNames();

  // AREA CONFIGURATIONS HANDLER
  areaConfigurationsHandler = new AreaConfigurationsHandler();

  // RAYCASTER AND PHYSICS WORLD
  rayCaster = raycasterFactory.get();
  physicsWorld = physicsFactory.get();

  if (!isDeployment){
    raycasterFactory.test();
  }

  // OBJECT PICKER 2D
  objectPicker2D = new ObjectPicker2D();

  // PRECONDITIONS
  if (!isDeployment){
    preConditions = new Preconditions();
  }

  // MODE SWITCHER
  modeSwitcher = new ModeSwitcher();

  // THREEJS RENDER MONITORING HANDLER
  threejsRenderMonitoringHandler = new THREEJSRenderMonitoringHandler();

  if (!isDeployment){
    // GUI HANDLER
    guiHandler = new GUIHandler();
  }

  // LOAD
  loadInput = document.getElementById("loadInput");
  // 3D CANVAS
  canvas = document.getElementById("rendererCanvas");
  onCanvasInitiated();

  // INITIALIZE THREE.JS SCENE AND RENDERER
  scene = new THREE.Scene();
  debugRenderer = new THREE.CannonDebugRenderer(scene, physicsWorld);
  scene.background = new THREE.Color(sceneBackgroundColor);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  camera.rotation.order = 'YXZ';
  camera.aspect = (window.innerWidth / window.innerHeight);
  GLOBAL_PROJECTION_UNIFORM.value = camera.projectionMatrix;
  GLOBAL_VIEW_UNIFORM.value = camera.matrixWorldInverse;
  renderer = new Renderer();
  webglCallbackHandler = new WebGLCallbackHandler();
  if (window.devicePixelRatio > 1){
    screenResolution = 1;
    renderer.setPixelRatio(1);
  }else{
    renderer.setPixelRatio(window.devicePixelRatio);
    screenResolution = window.devicePixelRatio;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  boundingClientRect = renderer.getBoundingClientRect();
  render();
  windowLoaded = true;
  MAX_VERTEX_UNIFORM_VECTORS = renderer.getMaxVertexUniformVectors();
  MAX_VERTEX_ATTRIBS = renderer.getMaxVertexAttribs();
  VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED = renderer.isVertexShaderTextureFetchSupported();
  ASTC_SUPPORTED = renderer.isASTCSupported();
  S3TC_SUPPORTED = renderer.isS3TCSupported();
  PVRTC_SUPPORTED = renderer.isPVRTCSupported();
  INSTANCING_SUPPORTED = renderer.isInstancingSupported();
  HIGH_PRECISION_SUPPORTED = renderer.isHighPrecisionSupported();
  if (!isDeployment){
    terminal.init();
  }
  // AUTO INSTANCING HANDLER
  autoInstancingHandler = new AutoInstancingHandler();
  // SHADER CONTENT
  ShaderContent = new ShaderContent();
  if (isDeployment){
    cliDiv.value = "";
    appendtoDeploymentConsole("Loading shaders.");
    console.log(
      "%c"+BANNERL1+"\n"+BANNERL2+"\n"+BANNERL3+"\n"+
      BANNERL4+"\n"+BANNERL5 +"\n"+"                                         "
      + "\nby Oguz Eroglu - github.com/oguzeroglu   ",
      "background: #40318d; color: white"
    );
  }
};

function processCameraRotationBuffer(){
  camera.rotation.x += cameraRotationBuffer.x;
  camera.rotation.y += cameraRotationBuffer.y;
  camera.rotation.z += cameraRotationBuffer.z;
  cameraRotationBuffer.x = 0;
  cameraRotationBuffer.y = 0;
  cameraRotationBuffer.z = 0;
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
    renderer.setSize(newViewportZ, newViewportW);
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
  terminal.printInfo(Text.BUILDING_PROJECT);
  canvas.style.visibility = "hidden";
  terminal.disable();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/build", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200){
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

function generateUniqueLightningName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while(nameFound){
    nameFound = lightnings[generatedName];
    if (nameFound){
      console.error("[!] Lightning name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}


function generateUniqueMuzzleFlashName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while(nameFound){
    nameFound = muzzleFlashes[generatedName];
    if (nameFound){
      console.error("[!] MuzzleFlash name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

function generateUniqueParticleSystemName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while(nameFound){
    nameFound = preConfiguredParticleSystems[generatedName];
    if (nameFound){
      console.error("[!] ParticleSystem name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

function generateUniqueTexturePackName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while(nameFound){
    nameFound = texturePacks[generatedName];
    if (nameFound){
      console.error("[!] TexturePack name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

function generateUniqueMaterialName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while(nameFound){
    nameFound = materials[generatedName];
    if (nameFound){
      console.error("[!] Material name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
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
      console.error("[!] Object name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

function onCanvasInitiated(){
  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
  mouseEventHandler = new MouseEventHandler();
  touchEventHandler = new TouchEventHandler();
  pointerLockEventHandler = new PointerLockEventHandler();
  fullScreenEventHandler = new FullScreenEventHandler();
  visibilityChangeEventHandler = new VisibilityChangeEventHandler();
  resizeEventHandler = new ResizeEventHandler();
  keyboardEventHandler = new KeyboardEventHandler();
  hashChangeEventHandler = new HashChangeEventHandler();
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

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", "js/application.json", true);
  xobj.onreadystatechange = function(){
    if (!(xobj.readyState === 4 && xobj.status === 200)){
      return;
    }

    var data = JSON.parse(xobj.responseText);

    appendtoDeploymentConsole("Initializing.");
    var stateLoader = new StateLoader(data);
    var result = stateLoader.load();
    if (result){
      if (stateLoader.hasTexturePacks || stateLoader.hasSkyboxes || stateLoader.hasFonts || stateLoader.hasTextureAtlas){
        appendtoDeploymentConsole("Loading assets.");
      }
    }else{
      appendtoDeploymentConsole("[!] Project failed to load: "+stateLoader.reason);
    }
  };

  appendtoDeploymentConsole("Loading application.");
  xobj.send(null);
}

function clearDeploymentConsole(){
  document.getElementById("cliDiv").value = "";
}

function appendtoDeploymentConsole(val){
  document.getElementById("cliDiv").value += val + "\n";
}

function removeCLIDom(){
  if (webglCallbackHandler.shaderCompilationError){
    return;
  }
  if (!(typeof cliDiv == UNDEFINED)){
    document.getElementById("cliDiv").style.display = "none";
  }
  resizeEventHandler.onResize();
}

function addCLIDom(){
  if (!(typeof cliDiv == UNDEFINED)){
    document.getElementById("cliDiv").style.display = "";
  }
}

function onRaycasterMouseDownIntersection(){
  if (intersectionPoint){
    var sprite = sprites[intersectionObject];
    if (sprite && sprite.isDraggable && mode == 1){
      dragCandidate = sprite;
    }
  }
}

function onRaycasterMouseMoveIntersection(){
  if (intersectionPoint){
    var object = addedObjects[intersectionObject];
    if (!object){
      object = objectGroups[intersectionObject];
    }
    if (!object){
      object = addedTexts[intersectionObject];
    }
    if (!object){
      object = sprites[intersectionObject];
    }
    if (!object){
      object = containers[intersectionObject];
    }
    if (!object){
      object = childContainers[intersectionObject];
      if (object == activeVirtualKeyboard){
        object.onMouseMoveIntersection(intersectionObject);
      }
    }

    if (object && object.mouseMoveCallbackFunction){
      object.mouseMoveCallbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
    }

    var isDifferent = currentMouseOverObjectName != object.name;
    if (object.mouseOverCallbackFunction && isDifferent){
      if (object.registeredSceneName == sceneHandler.getActiveSceneName()){
        object.mouseOverCallbackFunction(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
      }
    }
    if (currentMouseOverObjectName && isDifferent){
      var curObj = addedObjects[currentMouseOverObjectName];
      if (!curObj){
        curObj = objectGroups[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = addedTexts[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = sprites[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = containers[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = childContainers[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = virtualKeyboards[currentMouseOverObjectName];
        if (curObj == activeVirtualKeyboard){
          curObj.onMouseMoveIntersection(null);
        }
      }
      if (curObj && curObj.mouseOutCallbackFunction){
        if (curObj.registeredSceneName == sceneHandler.getActiveSceneName()){
          curObj.mouseOutCallbackFunction();
        }
      }
    }
    currentMouseOverObjectName = intersectionObject;
    if (object.isVirtualKeyboard){
      currentMouseOverObjectName = object.name;
    }
  }else{
    if (currentMouseOverObjectName){
      var curObj = addedObjects[currentMouseOverObjectName];
      if (!curObj){
        curObj = objectGroups[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = addedTexts[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = sprites[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = containers[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = childContainers[currentMouseOverObjectName];
      }
      if (!curObj){
        curObj = virtualKeyboards[currentMouseOverObjectName];
        if (curObj == activeVirtualKeyboard){
          curObj.onMouseMoveIntersection(null);
        }
      }
      if (curObj && curObj.mouseOutCallbackFunction){
        if (curObj.registeredSceneName == sceneHandler.getActiveSceneName()){
          curObj.mouseOutCallbackFunction();
        }
      }
    }
    currentMouseOverObjectName = 0;
  }
}

function onRaycasterIntersection(){
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
     if (!object){
       object = sprites[intersectionObject];
     }
     if (!object){
       object = containers[intersectionObject];
     }
     if (!object){
       object = childContainers[intersectionObject];
     }
     if (object.isAddedObject || object.isObjectGroup){
       if (!isDeployment && mode == 0){
         terminal.clear();
       }
       var point = intersectionPoint;
       var coordStr;
       if (!isDeployment && mode == 0){
         coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
       }
       if (object.isAddedObject){
         if (!isDeployment && mode == 0){
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
         if (!isDeployment && mode == 0){
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
       if (selectedGrid.sliced && selectedGrid.slicedGridSystemName){
         var sgs = gridSystems[selectedGrid.slicedGridSystemName];
         if (sgs){
           selectedGrid = sgs.getGridFromPoint(point);
           while (sgs && selectedGrid && selectedGrid.sliced && selectedGrid.slicedGridSystemName){
             var sgs = gridSystems[selectedGrid.slicedGridSystemName];
             if (sgs){
               selectedGrid = sgs.getGridFromPoint(point);
             }
           }
           if (selectedGrid){
             object = sgs;
             intersectionObject = sgs.name;
           }
         }
       }
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
              if (!isDeployment && mode == 0){
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
       if (!isDeployment && mode == 0){
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
     }else if (object.isSprite || object.isContainer){
       if (mode == 0){
         selectionHandler.resetCurrentSelection();
       }
       if (!isDeployment && mode == 0){
         terminal.clear();
         terminal.printInfo(Text.SELECTED.replace(Text.PARAM1, object.name));
       }
       if (!isDeployment){
         selectionHandler.select(object);
         guiHandler.afterObjectSelection();
       }
       if (mode == 1 && object.onClickCallback){
         object.onClickCallback();
       }
     }else if (object.isVirtualKeyboard){
       object.onMouseClickIntersection(intersectionObject);
     }
  }else{
    if (!isDeployment){
      selectionHandler.resetCurrentSelection();
      guiHandler.afterObjectSelection();
    }
  }
}

function startPerformanceAnalysis(){
  if (mode == 0){
    console.error("[!] startPerformanceAnalysis runs only on preview mode.");
    return;
  }
  cpuOperationsHandler.startRecording();
  webglCallbackHandler.startRecording();
  threejsRenderMonitoringHandler.startRecording();
  raycasterFactory.startRecording();
  physicsFactory.startRecording();
  lightningHandler.startRecording();
}

function dumpPerformance(){
  if (mode == 0){
    console.error("[!] dumpPerformance runs only on preview mode.");
    return;
  }
  console.log("%c                    CPU OPERATIONS                    ", "background: black; color: lime");
  cpuOperationsHandler.dumpPerformanceLogs();
  console.log("%c                    WEBGL OPERATIONS                  ", "background: black; color: lime");
  webglCallbackHandler.dumpPerformanceLogs();
  console.log("%c                    THREEJS RENDER                    ", "background: black; color: lime");
  threejsRenderMonitoringHandler.dumpPerformanceLogs();
  raycasterFactory.dumpPerformance();
  physicsFactory.dumpPerformance();
  lightningHandler.dumpPerformance();
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// best formula of the universe.
function affineTransformation(oldValue, oldMax, oldMin, newMax, newMin){
  return (((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
}

// iPhones are shitty devices for WebGL.
function checkForTextureBleedingInIOS(){
  for (var objName in addedObjects){
    var obj = addedObjects[objName];

    if (obj.customDisplacementTextureMatrixInfo){
      return true;
    }

    if (obj.getTextureOffsetX() > 0){
      return true;
    }

    if (obj.getTextureOffsetY() > 0){
      return true;
    }

    if (obj.getTextureRepeatX() > 1){
      return true;
    }

    if (obj.getTextureRepeatY() > 1){
      return true;
    }

    for (var animName in obj.animations){
      var action = obj.animations[animName].description.action;
      if (action == animationHandler.actionTypes.OBJECT.TEXTURE_OFFSET_X){
        return true;
      }

      if (action == animationHandler.actionTypes.OBJECT.TEXTURE_OFFSET_Y){
        return true;
      }

      if (action == animationHandler.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_X){
        return true;
      }

      if (action == animationHandler.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_Y){
        return true;
      }
    }
  }

  for (var objName in objectGroups){
    var obj = objectGroups[objName];

    for (var childName in obj.group){
      var child = obj.group[childName];

      if (child.customDisplacementTextureMatrixInfo){
        return true;
      }

      if (child.getTextureOffsetX() > 0){
        return true;
      }

      if (child.getTextureOffsetY() > 0){
        return true;
      }

      if (child.getTextureRepeatX() > 1){
        return true;
      }

      if (child.getTextureRepeatY() > 1){
        return true;
      }
    }

    if (obj.hasTexture && obj.getTextureOffsetX() > 0){
      return true;
    }

    if (obj.hasTexture && obj.getTextureOffsetY() > 0){
      return true;
    }

    for (var animName in obj.animations){
      var action = obj.animations[animName].description.action;
      if (action == animationHandler.actionTypes.OBJECT.TEXTURE_OFFSET_X){
        return true;
      }

      if (action == animationHandler.actionTypes.OBJECT.TEXTURE_OFFSET_Y){
        return true;
      }

      if (action == animationHandler.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_X){
        return true;
      }

      if (action == animationHandler.actionTypes.OBJECT.DISP_TEXTURE_OFFSET_Y){
        return true;
      }
    }
  }

  return false;
}

//******************************************************************
// WARNING: FOR TEST PURPOSES
function debugTexture(texture){
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

// WARNING: FOR TEST PURPOSES
function debugPoint(point){
  var dotGeometry = new THREE.Geometry();
  dotGeometry.vertices.push(point);
  var dotMaterial = new THREE.PointsMaterial({size: 5, sizeAttenuation: false});
  var dot = new THREE.Points(dotGeometry, dotMaterial);
  scene.add(dot);
}

// WARNING: FOR TEST PURPOSES
// THIS FUNCTION HAS TO BE USED ON PREVIEW MODE
function dumpPhysicsWorkerShapeCount(){
  if (PHYSICS_WORKER_ON && WORKERS_SUPPORTED){
    physicsFactory.get().worker.postMessage({dumpShapeCount: true});
  }else{
    console.error("Physics worker not active.");
  }
}
