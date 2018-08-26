window.onload = function() {
  console.log("[*] Window loaded");
  // DRAGABLE CLI
  var cliDiv = document.getElementById("cliDiv");
  var terminalDiv = document.getElementById("terminalDiv");
  scriptCreatorDiv = document.getElementById("scriptCreatorDiv");
  scriptCreatorCancelButton = document.getElementById("scriptCreatorCancelButton");
  scriptCreatorSaveButton = document.getElementById("scriptCreatorSaveButton");
  scriptCreatorTextArea = document.getElementById("scriptCreatorTextArea");
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
  terminal.init();

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

  // COMMAND DESCRIPTOR
  commandDescriptor = new CommandDescriptor();
  commandDescriptor.test();

  // COLOR NAMES
  ColorNames = new ColorNames();

  // DAT GUI LIGHTS
  datGuiLights = new dat.GUI();
  lightNameController = datGuiLights.add(lightsParameters, "Light").listen();
  disableController(lightNameController, true);
  lightsOffsetXController = datGuiLights.add(lightsParameters, "Offset x").min(-50).max(50).step(0.1).onChange(function(val){
    var pl = lights[selectedLightName];
    var plRep = pointLightRepresentations[selectedLightName];
    var plPreviewScene = light_previewScene[selectedLightName];
    pl.position.x = pl.initialPositionX + val;
    plRep.position.x = pl.position.x;
    plPreviewScene.position.copy(pl.position);
  }).onFinishChange(function(val){
    undoRedoHandler.push();
  }).listen();
  lightsOffsetYController = datGuiLights.add(lightsParameters, "Offset y").min(-50).max(50).step(0.1).onChange(function(val){
    var pl = lights[selectedLightName];
    var plRep = pointLightRepresentations[selectedLightName];
    var plPreviewScene = light_previewScene[selectedLightName];
    pl.position.y = pl.initialPositionY + val;
    plRep.position.y = pl.position.y;
    plPreviewScene.position.copy(pl.position);
  }).onFinishChange(function(val){
    undoRedoHandler.push();
  }).listen();
  lightsOffsetZController = datGuiLights.add(lightsParameters, "Offset z").min(-50).max(50).step(0.1).onChange(function(val){
    var pl = lights[selectedLightName];
    var plRep = pointLightRepresentations[selectedLightName];
    var plPreviewScene = light_previewScene[selectedLightName];
    pl.position.z = pl.initialPositionZ + val;
    plRep.position.z = pl.position.z;
    plPreviewScene.position.copy(pl.position);
  }).onFinishChange(function(val){
    undoRedoHandler.push();
  }).listen();
  lightsIntensityController = datGuiLights.add(lightsParameters, "Intensity").min(0.0).max(1.0).step(0.01).onChange(function(val){
    var light = lights[selectedLightName];
    var lightPreviewScene = light_previewScene[selectedLightName];
    light.intensity = val;
    lightPreviewScene.intensity = val;
    refreshMaterials();
  }).onFinishChange(function(val){
    undoRedoHandler.push();
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
  omTextureOffsetXController = datGuiObjectManipulation.add(objectManipulationParameters, "Texture offset x").min(-2).max(2).step(0.001).onChange(function(val){
    var texture = selectedAddedObject.material.map;
    texture.offset.x = val;
    texture.initOffsetXSet = false;
    for (var objectName in addedObjects){
      addedObjects[objectName].mesh.material.needsUpdate = true;
      addedObjects[objectName].previewMesh.material.needsUpdate = true;
    }
  }).onFinishChange(function(value){
    undoRedoHandler.push();
  }).listen();
  omTextureOffsetYController = datGuiObjectManipulation.add(objectManipulationParameters, "Texture offset y").min(-2).max(2).step(0.001).onChange(function(val){
    var texture = selectedAddedObject.material.map;
    texture.offset.y = val;
    texture.initOffsetYSet = false;
    for (var objectName in addedObjects){
      addedObjects[objectName].mesh.material.needsUpdate = true;
      addedObjects[objectName].previewMesh.material.needsUpdate = true;
    }
  }).onFinishChange(function(value){
    undoRedoHandler.push();
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
      var material = selectedAddedObject.material;
      material.transparent = true;
      material.opacity = val;
      selectedAddedObject.initOpacitySet = false;
      selectedAddedObject.initOpacity = selectedAddedObject.opacity;
    }
  }).onFinishChange(function(value){
    undoRedoHandler.push();
  }).listen();
  omAOIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "AO intensity").min(0).max(10).step(0.1).onChange(function(val){
    var material = selectedAddedObject.material;
    material.aoMapIntensity = val;
  }).onFinishChange(function(value){
    undoRedoHandler.push();
  }).listen();
  omShininessController = datGuiObjectManipulation.add(objectManipulationParameters, "Shininess").min(0).max(100).step(0.01).onChange(function(val){
    var material = selectedAddedObject.material;
    if (material.isMeshPhongMaterial){
      material.shininess = val;
      material.needsUpdate = true;
      selectedAddedObject.initShininessSet = false;
    }
  }).onFinishChange(function(value){
    undoRedoHandler.push();
  }).listen();
  omEmissiveIntensityController = datGuiObjectManipulation.add(objectManipulationParameters, "Emissive int.").min(0).max(100).step(0.01).onChange(function(val){
    var material = selectedAddedObject.material;
    if (material.isMeshPhongMaterial){
      material.emissiveIntensity = val;
      material.needsUpdate = true;
      selectedAddedObject.initEmissiveIntensitySet = false;
      selectedAddedObject.initEmissiveIntensity = material.emissiveIntensity;
    }
  }).onFinishChange(function(value){
    undoRedoHandler.push();
  }).listen();
  omDisplacementScaleController = datGuiObjectManipulation.add(objectManipulationParameters, "Disp. scale").min(-50).max(50).step(0.1).onChange(function(val){
    var material = selectedAddedObject.material;
    material.displacementScale = val;
    material.needsUpdate = true;
    selectedAddedObject.initDisplacementScaleSet = false;
  }).onFinishChange(function(value){
    undoRedoHandler.push();
  }).listen();
  omDisplacementBiasController = datGuiObjectManipulation.add(objectManipulationParameters, "Disp. bias").min(-50).max(50).step(0.1).onChange(function(val){
    var material = selectedAddedObject.material;
    material.displacementBias = val;
    material.needsUpdate = true;
    selectedAddedObject.initDisplacementBiasSet = false;
  }).onFinishChange(function(value){
    undoRedoHandler.push();
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

  // IMAGE UPLOADER
  imageUploaderInput = $("#imageUploaderInput");
  // LOAD
  loadInput = $("#loadInput");
  // 3D CANVAS
  canvas = document.getElementById("rendererCanvas");
  canvas.addEventListener("click", function(event){
    cliFocused = false;
    omGUIFocused = false;
    lightsGUIFocused = false;
    if (windowLoaded){
       var mouse = new THREE.Vector2();
       var raycaster = new THREE.Raycaster();
       var rect = renderer.domElement.getBoundingClientRect();
       mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
       mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
       raycaster.setFromCamera( mouse, camera );
       var intersects;
       if (mode == 0){
         intersects = raycaster.intersectObjects( scene.children, true );
       }else{
         intersects = raycaster.intersectObjects( previewScene.children, true );
       }
       if (intersects.length > 0){
         var object = intersects[0].object;
         if (object.addedObject || object.objectGroupName){
           terminal.clear();
           var point = intersects[0].point;
           var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
           if (object.addedObject){
             var faceName = object.addedObject.getFaceNameFromNormal(intersects[0].face.normal);
             //coordStr += " [face: "+faceName+"]";
             terminal.printInfo(Text.CLICKED_ON.replace(
               Text.PARAM1, object.addedObject.name + coordStr
             ));
             selectedAddedObject = object.addedObject;
             objectSelectedByCommand = false;
             selectedObjectGroup = 0;
             afterObjectSelection();
           }else if (object.objectGroupName){
             var faceName = objectGroups[object.objectGroupName].getFaceNameFromNormal(intersects[0].face.normal);
             //coordStr += " [face: "+faceName+"]";
             terminal.printInfo(Text.CLICKED_ON.replace(
               Text.PARAM1, object.objectGroupName+coordStr
             ));
             selectedObjectGroup = objectGroups[object.objectGroupName];
             objectSelectedByCommand = false;
             selectedAddedObject = 0;
             afterObjectSelection();
           }
         }else if (object.isPointLightRepresentation){
           selectedAddedObject = 0;
           selectedObjectGroup = 0;
           var lightName = object.lightName;
           if (lightName){
             selectedLightName = lightName;
             terminal.clear();
             terminal.printInfo(Text.SELECTED_LIGHT.replace(
               Text.PARAM1, lightName
             ));
           }
           afterObjectSelection();
         }else if (object.gridSystemName){
           var gridSystem = gridSystems[object.gridSystemName];
           var point = intersects[0].point;
           var selectedGrid = gridSystem.getGridFromPoint(point);
           if (selectedGrid){
             if (!selectedGrid.sliced){
               if (selectedGrid.destroyedAddedObject){
                 var addedObject = addedObjects[selectedGrid.destroyedAddedObject];
                 terminal.clear();
                 var point = intersects[0].point;
                 var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                 if (intersects[0].face){
                   var faceName = addedObject.getFaceNameFromNormal(intersects[0].face.normal);
                   //coordStr += " [face: "+faceName+"]";
                 }
                 terminal.printInfo(Text.CLICKED_ON.replace(
                   Text.PARAM1, addedObject.name+coordStr
                 ));
                 selectedAddedObject = addedObject;
                 selectedObjectGroup = 0;
                 objectSelectedByCommand = false;
                 afterObjectSelection();
               }else if (selectedGrid.destroyedObjectGroup){
                 var objectGroup = objectGroups[selectedGrid.destroyedObjectGroup];
                 terminal.clear();
                 var point = intersects[0].point;
                 var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                 if (intersects[0].face && intersects[0].face.normal){
                    var faceName = objectGroup.getFaceNameFromNormal(intersects[0].face.normal);
                    //coordStr += " [face: "+faceName+"]";
                 }
                 terminal.printInfo(Text.CLICKED_ON.replace(
                   Text.PARAM1, objectGroup.name+coordStr
                 ));
                 selectedAddedObject = 0;
                 selectedObjectGroup = objectGroup;
                 afterObjectSelection();
               }else{
                 selectedGrid.toggleSelect(false, true);
              }
            }else if (object.forDebugPurposes){
              if (intersects[1]){
                var object2 = intersects[1].object;
                if (object2.addedObject){
                  terminal.clear();
                  var point = intersects[1].point;
                  var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                  var faceName = object2.addedObject.getFaceNameFromNormal(intersects[1].face.normal);
                  //coordStr += " [face: "+faceName+"]";
                  terminal.printInfo(Text.CLICKED_ON.replace(
                    Text.PARAM1, object2.addedObject.name+coordStr
                  ));
                  selectedAddedObject = object2.addedObject;
                  selectedObjectGroup = 0;
                  objectSelectedByCommand = false;
                  afterObjectSelection();
                }
              }
            }else{
               var i = 1;
               var recursiveName = selectedGrid.slicedGridSystemName;
               var found = false;
               while (intersects[i] && !found){
                 gridSystem = gridSystems[recursiveName];
                 point = intersects[i].point;
                 selectedGrid = gridSystem.getGridFromPoint(point);
                 if (selectedGrid){
                   if (!selectedGrid.sliced){
                     if (selectedGrid.destroyedAddedObject){
                       var addedObject = addedObjects[selectedGrid.destroyedAddedObject];
                       terminal.clear();
                       var point = intersects[0].point;
                       var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                       if (intersects[i].face){
                         var faceName = addedObject.getFaceNameFromNormal(intersects[i].face.normal);
                         //coordStr += " [face: "+faceName+"]";
                       }
                       terminal.printInfo(Text.CLICKED_ON.replace(
                         Text.PARAM1, addedObject.name+coordStr
                       ));
                       objectSelectedByCommand = false;
                       selectedAddedObject = addedObject;
                       selectedObjectGroup = 0;
                       afterObjectSelection();
                     }else if (selectedGrid.destroyedObjectGroup){
                       var objectGroup = objectGroups[selectedGrid.destroyedObjectGroup];
                       terminal.clear();
                       var point = intersects[0].point;
                       var coordStr = " ("+point.x.toFixed(2)+", "+point.y.toFixed(2)+", "+point.z.toFixed(2)+")";
                       if (intersects[0].face && intersects[i].face.normal){
                          var faceName = objectGroup.getFaceNameFromNormal(intersects[i].face.normal);
                          //coordStr += " [face: "+faceName+"]";
                       }
                       terminal.printInfo(Text.CLICKED_ON.replace(
                         Text.PARAM1, objectGroup.name+coordStr
                       ));
                       selectedAddedObject = 0;
                       selectedObjectGroup = objectGroup;
                       afterObjectSelection();
                     }else{
                       selectedGrid.toggleSelect(false, true);
                     }
                     found = true;
                   }else{
                     recursiveName = selectedGrid.slicedGridSystemName;
                     i++;
                   }
                 }
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

  // INITIALIZE THREE.JS SCENE AND RENDERER
  scene = new THREE.Scene();
  previewScene = new THREE.Scene();
  debugRenderer = new THREE.CannonDebugRenderer(previewScene, physicsWorld);
  scene.background = new THREE.Color(sceneBackgroundColor);
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
  camera.rotation.order = 'YXZ';
  camera.aspect = (window.innerWidth / window.innerHeight);
  renderer = new THREE.WebGLRenderer({ canvas: canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );
  initPhysics();
  initBadTV();
  render();
  fpsCounterIntervalID = setInterval(calculateFps, 1000);
  windowLoaded = true;
  undoRedoHandler.push();
  MAX_VERTEX_UNIFORM_VECTORS = renderer.context.getParameter(renderer.context.MAX_VERTEX_UNIFORM_VECTORS);
};

window.addEventListener("mousedown", function(e){
  mouseDown ++;
});
window.addEventListener("mouseup", function(e){
  mouseDown --;
});
window.addEventListener('mousemove', function (e) {
  if (cliIsBeingDragged || omGUIFocused || lightsGUIFocused){
    return;
  }
  if (!windowLoaded){
    return;
  }
  if (!mouseDown){
    return;
  }
  var movementX = e.movementX;
  var movementY = e.movementY;
  camera.rotation.y -= movementX / 400;
  camera.rotation.x -= movementY / 400;
});
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
    console.log("[*] Renderer resized");
  }
});
window.addEventListener('keydown', function(event){
  if (!windowLoaded){
    return;
  }

  if (cliFocused || omGUIFocused || lightsGUIFocused){
    return;
  }

  switch(event.keyCode){
        case 190: //PERIOD
          keyboardBuffer["period"] = true;
        break;
        case 65: //A
          keyboardBuffer["a"] = true;
        break;
        case 68: //D
          keyboardBuffer["d"] = true;
        break;
        case 87: //W
          keyboardBuffer["w"] = true;
        break;
        case 83: //S
          keyboardBuffer["s"] = true;
        break;
        case 37: //LEFT ARROW
          keyboardBuffer["left"] = true;
        break;
        case 39: //RIGHT ARROW
          keyboardBuffer["right"] = true;
        break;
        case 38: //UP ARROW
          keyboardBuffer["up"] = true;
        break;
        case 40: //DOWN ARROW
          keyboardBuffer["down"] = true;
        break;
        case 81: //Q
          keyboardBuffer["q"] = true;
        break;
        case 69: //E
          keyboardBuffer["e"] = true;
        break;
        case 90: //Z
          keyboardBuffer["z"] = true;
        break;
        case 67: //C
          keyboardBuffer["c"] = true;
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
            selectedAddedObject.destroy();
            delete addedObjects[selectedAddedObject.name];
            terminal.clear();
            terminal.printInfo(Text.OBJECT_DESTROYED);
            selectedAddedObject = 0;
            undoRedoHandler.push();
          }else if (selectedObjectGroup){
            selectedObjectGroup.destroy();
            delete objectGroups[selectedObjectGroup.name];
            selectedObjectGroup = 0;
            terminal.clear();
            terminal.printInfo(Text.OBJECT_DESTROYED);
            undoRedoHandler.push();
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

  switch(event.keyCode){
        case 190: //PERIOD
          keyboardBuffer["period"] = false;
          for (var gridName in gridSelections){
            var grid = gridSelections[gridName];
            if (grid.divs){
              for (var i = 0; i<grid.divs.length; i++){
                grid.divs[i].style.visibility = "hidden";
              }
            }
          }
        break;
        case 65: //A
          keyboardBuffer["a"] = false;
        break;
        case 68: //D
          keyboardBuffer["d"] = false;
        break;
        case 87: //W
          keyboardBuffer["w"] = false;
        break;
        case 83: //S
          keyboardBuffer["s"] = false;
        break;
        case 37: //LEFT ARROW
          keyboardBuffer["left"] = false;
        break;
        case 39: //RIGHT ARROW
          keyboardBuffer["right"] = false;
        break;
        case 38: //UP ARROW
          keyboardBuffer["up"] = false;
        break;
        case 40: //DOWN ARROW
          keyboardBuffer["down"] = false;
        break;
        case 81: //Q
          keyboardBuffer["q"] = false;
        break;
        case 69: //E
          keyboardBuffer["e"] = false;
        break;
        case 90: //Z
          keyboardBuffer["z"] = false;
        break;
        case 67: //C
          keyboardBuffer["c"] = false;
        break;
  }

});

 function initBadTV(){
   if (mode == 0){
     renderPass = new THREE.RenderPass( scene, camera );
   }else{
     renderPass = new THREE.RenderPass( previewScene, camera );
   }
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
    }
   }
	 composer.addPass( copyPass );
	 copyPass.renderToScreen = true;
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
  return (WORKERS_SUPPORTED && PHYSICS_WORKER_ENABLED);
}

function isCollisionWorkerEnabled(){
  return (WORKERS_SUPPORTED && COLLISION_WORKER_ENABLED);
}

function isPSCollisionWorkerEnabled(){
  return (WORKERS_SUPPORTED && PS_COLLISION_WORKER_ENABLED);
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
  enableController(omTextureOffsetXController);
  enableController(omTextureOffsetYController);
  enableController(omOpacityController);
  enableController(omShininessController);
  enableController(omEmissiveIntensityController);
  enableController(omDisplacementScaleController);
  enableController(omDisplacementBiasController);
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
      objectManipulationParameters["Opacity"] = obj.material.opacity;
      objectManipulationParameters["AO intensity"] = obj.material.aoMapIntensity;
      if (obj.metaData.isSlippery){
        objectManipulationParameters["Slippery"] = true;
      }else{
        objectManipulationParameters["Slippery"] = false;
      }
      if (!obj.material.map){
        disableController(omTextureOffsetXController);
        disableController(omTextureOffsetYController);
      }else{
        objectManipulationParameters["Texture offset x"] = obj.material.map.offset.x;
        objectManipulationParameters["Texture offset y"] = obj.material.map.offset.y;
      }
      if (!obj.material.isMeshPhongMaterial){
        disableController(omShininessController);
        disableController(omEmissiveIntensityController);
        disableController(omDisplacementScaleController);
        disableController(omDisplacementBiasController);
      }else{
        objectManipulationParameters["Shininess"] = obj.material.shininess;
        objectManipulationParameters["Emissive int."] = obj.material.emissiveIntensity;
        if (obj.material.displacementMap){
          objectManipulationParameters["Disp. scale"] = obj.material.displacementScale;
          objectManipulationParameters["Disp. bias"] = obj.material.displacementBias;
        }else{
          disableController(omDisplacementScaleController);
          disableController(omDisplacementBiasController);
        }
      }
    }else if (obj instanceof ObjectGroup){
      var childObj;
      for (var childName in obj.group){
        childObj = obj.group[childName];
        break;
      }
      objectManipulationParameters["Rotate x"] = 0;
      objectManipulationParameters["Rotate y"] = 0;
      objectManipulationParameters["Rotate z"] = 0;
      objectManipulationParameters["Opacity"] = childObj.material.opacity;
      if (obj.isSlippery){
        objectManipulationParameters["Slippery"] = true;
      }else{
        objectManipulationParameters["Slippery"] = false;
      }
      disableController(omTextureOffsetXController);
      disableController(omTextureOffsetYController);
      disableController(omShininessController);
      disableController(omEmissiveIntensityController);
      disableController(omDisplacementScaleController);
      disableController(omDisplacementBiasController);
      disableController(omAOIntensityController);
    }
    objectManipulationParameters["Mass"] = obj.physicsBody.mass;
    omMassController.updateDisplay();
  }else{
    $(datGuiObjectManipulation.domElement).attr("hidden", true);
  }
  afterLightSelection();
}

function processKeyboardBuffer(){
  if (keyboardBuffer["left"]){
    camera.rotation.y += rotationYDelta;
  }
  if (keyboardBuffer["right"]){
    camera.rotation.y -= rotationYDelta;
  }
  if (keyboardBuffer["up"]){
    camera.rotation.x += rotationXDelta;
  }
  if (keyboardBuffer["down"]){
    camera.rotation.x -= rotationXDelta;
  }
  if (keyboardBuffer["w"]){
    camera.translateZ(-1 * translateZAmount);
  }
  if (keyboardBuffer["s"]){
    camera.translateZ(translateZAmount);
  }
  if (keyboardBuffer["d"]){
    camera.translateX(translateXAmount);
  }
  if (keyboardBuffer["a"]){
    camera.translateX(-1 * translateXAmount);
  }
  if (keyboardBuffer["e"]){
    camera.translateY(-1 * translateYAmount);
  }
  if (keyboardBuffer["q"]){
    camera.translateY(translateYAmount);
  }
  if (keyboardBuffer["z"]){
    camera.rotation.z += rotationZDelta;
  }
  if (keyboardBuffer["c"]){
    camera.rotation.z -= rotationZDelta;
  }
}

function mouseWheelEvent(e) {
  e.preventDefault();
  if (!windowLoaded){
    return;
  }
  var deltaX = e.deltaX;
  var deltaY = e.deltaY;
  if((typeof deltaX == "undefined") || (typeof deltaY == "undefined")){
    return;
  }
  if (Math.abs(deltaX) < Math.abs(deltaY)){
    camera.translateZ(deltaY);
  }else{
    camera.translateX(deltaX);
  }
}

//******************************************************************
// WARNING: FOR TEST PURPOSES
function generateRandomBoxes(gridSystemName){
  var gridSystem = gridSystems[gridSystemName];
  for (var gridNumber in gridSystem.grids){
    var grid = gridSystem.grids[gridNumber];
    var height = Math.random() * 100;
    var name = "randomGeneratedBox_"+gridSystemName+"_"+gridNumber;
    var color = ColorNames.generateRandomColor();
    var material = new THREE.MeshBasicMaterial({color: color});
    gridSystem.newBox([grid], height, material, name);
  }
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
