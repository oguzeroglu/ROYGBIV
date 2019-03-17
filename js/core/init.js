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

  // SELECTION HANDLER
  if (!isDeployment){
    selectionHandler = new SelectionHandler();
  }

  // PHYSICS BODY GENERATOR
  physicsBodyGenerator = new PhysicsBodyGenerator();

  // CPU OPERATIONS HANDLER
  cpuOperationsHandler = new CPUOperationsHandler();

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
  areaBinHandler = new WorldBinHandler();
  areaBinHandler.isAreaBinHandler = true;

  // AREA CONFIGURATIONS HANDLER
  areaConfigurationsHandler = new AreaConfigurationsHandler();

  // RAYCASTER
  if (!WORKERS_SUPPORTED){
    rayCaster = new RayCaster();
    physicsWorld = new CANNON.World();
    physicsWorld.refresh = function(){}
    physicsWorld.updateObject = function(){}
    physicsWorld.resetObjectVelocity = function(){}
    physicsWorld.setObjectVelocity = function(){}
    physicsWorld.setObjectVelocityX = function(){}
    physicsWorld.setObjectVelocityY = function(){}
    physicsWorld.setObjectVelocityZ = function(){}
    physicsWorld.applyImpulse = function(){}
    physicsWorld.show = function(){}
    physicsWorld.hide = function(){}
    physicsWorld.setMass = function(){}
    physicsWorld.ready = true;
  }else{
    rayCaster = new RaycasterWorkerBridge();
    physicsWorld = new PhysicsWorkerBridge();
  }
  if (!isDeployment){
    var raycasterMethodCount = (Object.keys(RayCaster.prototype).length);
    var raycasterWorkerBridgeMethodCount = (Object.keys(RaycasterWorkerBridge.prototype).length);
    if (raycasterMethodCount != raycasterWorkerBridgeMethodCount){
      console.error("[!] Method count mismatch between RayCaster and RaycasterWorkerBridge.");
    }
    for (var api in RayCaster.prototype){
      if (!RaycasterWorkerBridge.prototype[api]){
        console.error("[!] API: "+api+" is missing in RaycasterWorkerBridge.");
      }
    }
    for (var api in RaycasterWorkerBridge.prototype){
      if (!RayCaster.prototype[api]){
        console.error("[!] API: "+api+" is missing in RayCaster.");
      }
    }
  }

  // OBJECT PICKER 2D
  objectPicker2D = new ObjectPicker2D();

  // PRECONDITIONS
  if (!isDeployment){
    preConditions = new Preconditions();
  }

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
  onCanvasInitiated();

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
  webglCallbackHandler = new WebGLCallbackHandler();
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
  initPostProcessing();
  render();
  windowLoaded = true;
  MAX_VERTEX_UNIFORM_VECTORS = renderer.context.getParameter(renderer.context.MAX_VERTEX_UNIFORM_VECTORS);
  VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED = (renderer.context.getParameter(renderer.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0);
  DDS_SUPPORTED = (!(renderer.context.getExtension("WEBGL_compressed_texture_s3tc") == null));
  INSTANCING_SUPPORTED = (!(renderer.context.getExtension("ANGLE_instanced_arrays") == null));
  HIGH_PRECISION_SUPPORTED = !(
    renderer.context.getShaderPrecisionFormat(renderer.context.VERTEX_SHADER, renderer.context.HIGH_FLOAT).precision <= 0 ||
    renderer.context.getShaderPrecisionFormat(renderer.context.FRAGMENT_SHADER, renderer.context.HIGH_FLOAT).precision <= 0
  );
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


function initPostProcessing(){
 renderPass = new THREE.RenderPass(scene, camera);
 if (mode == 1){
  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(
      renderer.getCurrentViewport().z * bloomResolutionScale,
      renderer.getCurrentViewport().w * bloomResolutionScale
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
 if (physicsWorld.init){
   physicsWorld.init();
   return;
 }
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
        renderer.getCurrentViewport().z * bloomResolutionScale,
        renderer.getCurrentViewport().w * bloomResolutionScale
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
      guiHandler.postprocessingParameters["Bloom_strength"] = bloomStrength;
      guiHandler.postprocessingParameters["Bloom_radius"] = bloomRadius;
      guiHandler.postprocessingParameters["Bloom_threshhold"] = bloomThreshold;
      guiHandler.postprocessingParameters["Bloom_resolution_scale"] = bloomResolutionScale;
      guiHandler.postprocessingParameters["Bloom"] = bloomOn;
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

function onCanvasInitiated(){
  mouseEventHandler = new MouseEventHandler();
  touchEventHandler = new TouchEventHandler();
  pointerLockEventHandler = new PointerLockEventHandler();
  fullScreenEventHandler = new FullScreenEventHandler();
  visibilityChangeEventHandler = new VisibilityChangeEventHandler();
  resizeEventHandler = new ResizeEventHandler();
  orientationChangeEventHandler = new OrientationChangeEventHandler();
  keyboardEventHandler = new KeyboardEventHandler();
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
  document.getElementById("cliDiv").value += val + "\n";
}

function removeCLIDom(){
  if (webglCallbackHandler.shaderCompilationError){
    return;
  }
  if (!(typeof cliDiv == UNDEFINED)){
    document.body.removeChild(cliDiv);
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
       if (selectedGrid.sliced && selectedGrid.slicedGridSystemName){
         var sgs = gridSystems[selectedGrid.slicedGridSystemName];
         if (sgs){
           selectedGrid = sgs.getGridFromPoint(point);
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
