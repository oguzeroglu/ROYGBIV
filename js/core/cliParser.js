function parseCommand(userInput){
  var result = parse(userInput);
  if (!result){
    terminal.printError(Text.COMMAND_NOT_FOUND);
  }
  afterObjectSelection();
}

function parse(input){

    try{
      var splitted = input.trim().split(" ");
      var commandIndex;
      var found = false;
      for (var i=0; i<commands.length; i++){
        if (commands[i].toLowerCase() == splitted[0].toLowerCase()){
          found = true;
          commandIndex = i;
        }
      }
      if (!found){
        return false;
      }

      // COMMAND FOUND

      //CHECK IF DEPRECATED
      for (var i = 0; i<deprecatedCommandIndices.length; i++){
        if (deprecatedCommandIndices[i] == commandIndex){
          terminal.printError(Text.COMMAND_DEPRECATED);
          return true;
        }
      }

      if (splitted.length -1 != commandArgumentsExpectedCount[commandIndex]){
        terminal.printFunctionArguments(commandIndex);
        return true;
      }

      switch (commandIndex){
        case 0: //help
          var commandInfos = [];
          var commandsSorted = [];
          for (var i=0; i<commandInfo.length; i++){
            var found = false;
            var i2 = 0;
            while (i2 < deprecatedCommandIndices.length && !found){
              if (deprecatedCommandIndices[i2] == i){
                found = true;
              }
              i2++;
            }
            if (!found){
              commandInfos.push(commandInfo[i]);
              commandsSorted.push(commands[i]);
            }
          }
          commandInfos.sort();
          commandsSorted.sort();
          terminal.help(commandInfos, commandsSorted);
          return true;
        break;
        case 1: //newGridSystem
          var name = splitted[1];
          var sizeX = splitted[2];
          var sizeZ = splitted[3];
          var centerX = splitted[4];
          var centerY = splitted[5];
          var centerZ = splitted[6];
          var color = splitted[7];
          var cellSize = splitted[8];
          var axis = splitted[9];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          name = name.replace(/_/g, "-");

          var result =  processNewGridSystemCommand(name, sizeX, sizeZ, centerX, centerY, centerZ, color, cellSize, axis, false, false);
          if (gridSystems[name]){
            undoRedoHandler.push();
          }
          return result;
        break;
        case 2: //printCameraPosition
          var x = camera.position.x;
          var y = camera.position.y;
          var z= camera.position.z;
          terminal.printInfo(Text.CAMERA_POSITION.replace(
            Text.PARAM1, x
          ).replace(
            Text.PARAM2, y
          ).replace(
            Text.PARAM3, z
          ));
        break;
        case 3: //printCameraDirection
          var vector = new THREE.Vector3();
          camera.getWorldDirection(vector);
          var x = vector.x;
          var y = vector.y;
          var z = vector.z;
          terminal.printInfo(Text.CAMERA_DIRECTION.replace(
            Text.PARAM1, x
          ).replace(
            Text.PARAM2, y
          ).replace(
            Text.PARAM3, z
          ));
        break;
        case 4: //printGridSystems
          var count = 0;
          var keysLength = Object.keys(gridSystems).length;
          terminal.printHeader(Text.GRIDSYSTEMS);
          for (var gs in gridSystems){
            count ++;
            if (count == keysLength){
              terminal.printInfo(Text.TREE.replace(
                Text.PARAM1, gs));
            }else{
              terminal.printInfo(Text.TREE.replace(
                Text.PARAM1, gs), true);
            }
          }
          if (count == 0){
            terminal.printError(Text.NO_GRIDSYSTEMS);
          }
        break;
        case 5: //printGridSystemInfo
          var name = splitted[1];
          if (!gridSystems[name]){
            terminal.printError(Text.NO_SUCH_GRID_SYSTEM);
          }else{
            gridSystems[name].printInfo();
          }
        break;
        case 6: //destroyGridSystem
          var name = splitted[1];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!gridSystems[name]){
            terminal.printError(Text.NO_SUCH_GRID_SYSTEM);
          }else{
            gridSystems[name].destroy();
            terminal.printInfo(Text.GRID_SYSTEM_DESTROYED);
            undoRedoHandler.push();
          }
        break;
        case 7: //printKeyboardInfo
          terminal.printHeader(Text.CONTROLS);
          for (var i=0; i<keyboardInfo.length; i++){
            if (i != keyboardInfo.length -1){
              terminal.printInfo(
                Text.TREE.replace(Text.PARAM1, keyboardInfo[i]),
                true
              );
            }else{
              terminal.printInfo(
                Text.TREE.replace(Text.PARAM1, keyboardInfo[i])
              );
            }
          }
        break;
        case 8: //printSelectedGrids
          terminal.printHeader(Text.SELECTED_GRIDS);
          var count = 0;
          var length = Object.keys(gridSelections).length;
          for (var gridName in gridSelections){
            count++;
            if (count == length){
              terminal.printInfo(Text.TREE.replace(Text.PARAM1, gridName));
            }else{
              terminal.printInfo(Text.TREE.replace(Text.PARAM1, gridName), true);
            }
          }
          if (count == 0){
            terminal.printError(Text.NONE_OF_THE_GRIDS_ARE_SELECTED);
          }
        break;
        case 9: //resetSelectedGrids
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var count = 0;
          for (var gridName in gridSelections){
            gridSelections[gridName].toggleSelect(false, false, false, true);
            count ++;
          }
          terminal.printInfo(Text.GRIDS_RESET.replace(Text.PARAM1, count));
          if (count > 0){
            undoRedoHandler.push();
          }
        break;
        case 10: //selectAllGrids
          // DEPRECATED
        break;
        case 11: //cropGridSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var gridSelectionSize = Object.keys(gridSelections).length;
          if (gridSelectionSize != 2){
            terminal.printError(Text.MUST_HAVE_TWO_GRIDS_SELECTED);
            return true;
          }
          var selectedGrid1 = gridSelections[Object.keys(gridSelections)[0]];
          var selectedGrid2 = gridSelections[Object.keys(gridSelections)[1]];
          if (selectedGrid1.parentName != selectedGrid2.parentName){
            terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
            return true;
          }
          var selectedGridSystemName = selectedGrid1.parentName;
          gridSystems[selectedGridSystemName].crop(selectedGrid1, selectedGrid2);
          undoRedoHandler.push();
        break;
        case 12: //pasteCroppedGridSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!croppedGridSystemBuffer){
            terminal.printError(Text.CROPPED_GS_BUFFER_IS_EMPTY);
            return true;
          }
          var name = splitted[1];
          var xTranslation = splitted[2];
          var yTranslation = splitted[3];
          var zTranslation = splitted[4];
          var outlineColor = splitted[5];
          var cellSize = splitted[6];
          xTranslation = parseInt(xTranslation);
          if (isNaN(xTranslation)){
            terminal.printError(Text.XTRANSLATION_MUST_BE_A_NUMBER);
            return true;
          }
          yTranslation = parseInt(yTranslation);
          if (isNaN(yTranslation)){
            terminal.printError(Text.YTRANSLATION_MUST_BE_A_NUMBER);
            return true;
          }
          zTranslation = parseInt(zTranslation);
          if (isNaN(zTranslation)){
            terminal.printError(Text.ZTRANSLATION_MUST_BE_A_NUMBER);
            return true;
          }
          var croppedGridSystem = croppedGridSystemBuffer.clone();
          croppedGridSystem.centerX += parseInt(xTranslation);
          croppedGridSystem.centerY += parseInt(yTranslation);
          croppedGridSystem.centerZ += parseInt(zTranslation);

          name = name.replace(/_/g, "-");

          var result = processNewGridSystemCommand(name, croppedGridSystem.sizeX, croppedGridSystem.sizeZ, croppedGridSystem.centerX, croppedGridSystem.centerY, croppedGridSystem.centerZ, outlineColor, cellSize, croppedGridSystem.axis, false, false);
          if (gridSystems[name]){
            undoRedoHandler.push();
          }
          return result;
        break;
        case 13: //switchView
          lastFPS = 0;
          if (mode == 0){
            TOTAL_OBJECT_COLLISION_LISTENER_COUNT = 0;
            TOTAL_PARTICLE_SYSTEM_COUNT = 0;
            TOTAL_PARTICLE_COLLISION_LISTEN_COUNT = 0;
            TOTAL_PARTICLE_SYSTEM_COLLISION_LISTEN_COUNT = 0;
            TOTAL_PARTICLE_SYSTEMS_WITH_PARTICLE_COLLISIONS = 0;
            scriptsToRun = new Object();
            for (var gridName in gridSelections){
              var grid = gridSelections[gridName];
              if (grid.divs){
                for (var i = 0; i<grid.divs.length; i++){
                  grid.divs[i].style.visibility = "hidden";
                }
              }
            }
            for (var markedPointName in markedPoints){
              markedPoints[markedPointName].hide(true);
            }
            for (var scriptName in scripts){
              var script = scripts[scriptName];
              if (script.runAutomatically){
                var script2 = new Script(scriptName, script.script);
                script2.localFilePath = script.localFilePath;
                if (!script2.localFilePath){
                  script2.start();
                }else{
                  script2.reloadAndStart();
                }
                scripts[scriptName] = script2;
                script2.runAutomatically = true;
              }
            }
            dynamicObjects = new Object();
            dynamicObjectGroups = new Object();
            for (var objectName in objectGroups){
              var object = objectGroups[objectName];
              if (object.binInfo){
                object.binInfo = new Object();
              }
              if (object.isDynamicObject){
                dynamicObjectGroups[objectName] = object;
              }
              object.physicsBody.position.copy(
                object.physicsBody.initPosition
              );
              object.physicsBody.quaternion.copy(
                object.physicsBody.initQuaternion
              );
              object.physicsBody.velocity.copy(
                object.physicsBody.initVelocity
              );
              object.physicsBody.angularVelocity.copy(
                object.physicsBody.initAngularVelocity
              );
              object.previewGraphicsGroup.quaternion.copy(
                object.initQuaternion
              );
              object.resetPosition();
              for (var childObjectName in object.group){
                var childObject = object.group[childObjectName];
                if (childObject.material.map){
                  if (childObject.material.map.initOffsetXSet){
                    childObject.material.map.offset.x = childObject.material.map.initOffsetX;
                    childObject.material.needsUpdate = true;
                    childObject.material.map.initOffsetXSet = false;
                  }
                  if (childObject.material.displacementMap){
                    if (childObject.initDisplacementScaleSet){
                      childObject.material.displacementScale = childObject.initDisplacementScale;
                      childObject.material.needsUpdate = true;
                      childObject.initDisplacementScaleSet = false;
                    }
                    if (childObject.initDisplacementBiasSet){
                      childObject.material.displacementBias = childObject.initDisplacementBias;
                      childObject.material.needsUpdate = true;
                      childObject.initDisplacementBiasSet = false;
                    }
                  }
                  if (childObject.material.map.initOffsetYSet){
                    childObject.material.map.offset.y = childObject.material.map.initOffsetY;
                    childObject.material.needsUpdate = true;
                    childObject.material.map.initOffsetYSet = false;
                  }
                }
                if (childObject.initOpacitySet){
                  childObject.material.transparent = true;
                  childObject.material.opacity = childObject.initOpacity;
                  childObject.material.needsUpdate = true;
                  childObject.initOpacitySet = false;
                }
                if (childObject.material.isMeshPhongMaterial){
                  if (childObject.initShininessSet){
                    childObject.material.shininess = childObject.initShininess;
                    childObject.material.needsUpdate = true;
                    childObject.initShininessSet = false;
                  }
                  if (childObject.initEmissiveIntensitySet){
                    childObject.material.emissiveIntensity = childObject.initEmissiveIntensity;
                    childObject.material.needsUpdate = true;
                    childObject.initEmissiveIntensitySet = false;
                  }
                }
              }

              if (!object.isVisibleOnThePreviewScene()){
                object.previewGraphicsGroup.visible = true;
                physicsWorld.addBody(object.physicsBody);
              }

              delete object.isHidden;

            }
            for (var objectName in addedObjects){
              var object = addedObjects[objectName];
              if (object.binInfo){
                object.binInfo = new Object();
              }
              if (object.isDynamicObject){
                dynamicObjects[objectName] = object;
              }
              object.physicsBody.position.copy(
                object.physicsBody.initPosition
              );
              object.physicsBody.quaternion.copy(
                object.physicsBody.initQuaternion
              );
              object.physicsBody.velocity.copy(
                object.physicsBody.initVelocity
              );
              object.physicsBody.angularVelocity.copy(
                object.physicsBody.initAngularVelocity
              );
              object.previewMesh.quaternion.copy(
                object.initQuaternion
              );
              object.resetPosition();
              if (object.material.map){
                if (object.material.map.initOffsetXSet){
                  object.material.map.offset.x = object.material.map.initOffsetX;
                  object.material.needsUpdate = true;
                  object.material.map.initOffsetXSet = false;
                }
                if (object.material.map.initOffsetYSet){
                  object.material.map.offset.y = object.material.map.initOffsetY;
                  object.material.needsUpdate = true;
                  object.material.map.initOffsetYSet = false;
                }
              }
              if (object.material.displacementMap){
                if (object.initDisplacementScaleSet){
                  object.material.displacementScale = object.initDisplacementScale;
                  object.material.needsUpdate = true;
                  object.initDisplacementScaleSet = false;
                }
                if (object.initDisplacementBiasSet){
                  object.material.displacementBias = object.initDisplacementBias;
                  object.material.needsUpdate = true;
                  object.initDisplacementBiasSet = false;
                }
              }
              if (object.initOpacitySet){
                object.material.transparent = true;
                object.material.opacity = object.initOpacity;
                object.material.needsUpdate = true;
                object.initOpacitySet = false;
              }
              if (object.material.isMeshPhongMaterial){
                if (object.initShininessSet){
                  object.material.shininess = object.initShininess;
                  object.material.needsUpdate = true;
                  object.initShininessSet = false;
                }
                if (object.initEmissiveIntensitySet){
                  object.material.emissiveIntensity = object.initEmissiveIntensity;
                  object.material.needsUpdate = true;
                  object.initEmissiveIntensitySet = false;
                }
              }

              if (!object.isVisibleOnThePreviewScene()){
                object.previewMesh.visible = true;
                physicsWorld.addBody(object.physicsBody);
              }

              delete object.isHidden;

            }
            for (var lightName in light_previewScene){
              light_previewScene[lightName].intensity = lights[lightName].intensity;
              light_previewScene[lightName].position.copy(
                lights[lightName].position
              );
            }

            if (isPhysicsWorkerEnabled() || isCollisionWorkerEnabled() || isPSCollisionWorkerEnabled()){
              workerHandler = new WorkerHandler();
              if (isPhysicsWorkerEnabled()){
                workerHandler.startPhysicsWorkerIteration();
              }
            }

            if (!isCollisionWorkerEnabled() || !isPSCollisionWorkerEnabled()){
              worldBinHandler = new WorldBinHandler();
            }else{
              worldBinHandler = 0;
            }

            ROYGBIV.globals = new Object();
            $(datGuiObjectManipulation.domElement).attr("hidden", true);
            terminal.printInfo(Text.SWITCHED_TO_PREVIEW_MODE);
            $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Preview mode)");
            mode = 1;
          }else if (mode == 1){
            mode = 0;
            $(datGui.domElement).attr("hidden", true);
            $(datGuiObjectManipulation.domElement).attr("hidden", true);
            terminal.printInfo(Text.SWITCHED_TO_DESIGN_MODE);
            $("#cliDivheader").text("ROYGBIV 3D Engine - CLI (Design mode)");
            if (LOG_FRAME_DROP_ON){
              console.log("[*] Frame-drop recording process stopped.");
              LOG_FRAME_DROP_ON = false;
            }
            collisionCallbackRequests = new Object();
            particleCollisionCallbackRequests = new Object();
            particleSystemCollisionCallbackRequests = new Object();

            for (var particleSystemName in particleSystemPool){
              particleSystemPool[particleSystemName].destroy();
            }
            for (var objectName in objectTrails){
              objectTrails[objectName].destroy();
            }
            for (var mergedParticleSystemName in mergedParticleSystems){
              mergedParticleSystems[mergedParticleSystemName].destroy();
            }

            for (var crosshairName in crosshairs){
              crosshairs[crosshairName].destroy();
            }

            for (var markedPointName in markedPoints){
              if (markedPoints[markedPointName].showAgainOnTheNextModeSwitch){
                markedPoints[markedPointName].show();
                markedPoints[markedPointName].showAgainOnTheNextModeSwitch = false;
              }
            }

            particleSystems = new Object();
            particleSystemPool = new Object();
            particleSystemPools = new Object();
            objectTrails = new Object();
            mergedParticleSystems = new Object();
            crosshairs = new Object();
            selectedCrosshair = 0;

            for (var objectName in objectGroups){
              var object = objectGroups[objectName];
              object.graphicsGroup.quaternion.copy(
                object.initQuaternion
              );
              object.resetPosition();

              if (!(typeof object.originalMass == "undefined")){
                object.setMass(object.originalMass);
                if (object.originalMass == 0){
                  delete dynamicObjectGroups[object.name];
                }
                delete object.originalMass;
              }

              for (var childObjectName in object.group){
                var childObject = object.group[childObjectName];
                if (childObject.material.map){
                  if (childObject.material.map.initOffsetXSet){
                    childObject.material.map.offset.x = childObject.material.map.initOffsetX;
                    childObject.material.needsUpdate = true;
                    childObject.material.map.initOffsetXSet = false;
                  }
                  if (childObject.material.map.initOffsetYSet){
                    childObject.material.map.offset.y = childObject.material.map.initOffsetY;
                    childObject.material.needsUpdate = true;
                    childObject.material.map.initOffsetYSet = false;
                  }
                }
                if (childObject.material.displacementMap){
                  if (childObject.initDisplacementScaleSet){
                    childObject.material.displacementScale = childObject.initDisplacementScale;
                    childObject.material.needsUpdate = true;
                    childObject.initDisplacementScaleSet = false;
                  }
                  if (childObject.initDisplacementBiasSet){
                    childObject.material.displacementBias = childObject.initDisplacementBias;
                    childObject.material.needsUpdate = true;
                    childObject.initDisplacementBiasSet = false;
                  }
                }
                if (childObject.initOpacitySet){
                  childObject.material.transparent = true;
                  childObject.material.opacity = childObject.initOpacity;
                  childObject.material.needsUpdate = true;
                  childObject.initOpacitySet = false;
                }
                if (childObject.material.isMeshPhongMaterial){
                  if (childObject.initShininessSet){
                    childObject.material.shininess = childObject.initShininess;
                    childObject.material.needsUpdate = true;
                    childObject.initShininessSet = false;
                  }
                  if (childObject.initEmissiveIntensitySet){
                    childObject.material.emissiveIntensity = childObject.initEmissiveIntensity;
                    childObject.material.needsUpdate = true;
                    childObject.initEmissiveIntensitySet = false;
                  }
                }
              }
            }
            for (var objectName in addedObjects){
              var object = addedObjects[objectName];

              object.mesh.quaternion.copy(
                object.initQuaternion
              );
              object.physicsBody.position.copy(
                object.physicsBody.initPosition
              );
              object.physicsBody.quaternion.copy(
                object.physicsBody.initQuaternion
              );
              object.physicsBody.velocity.copy(
                object.physicsBody.initVelocity
              );
              object.physicsBody.angularVelocity.copy(
                object.physicsBody.initAngularVelocity
              );
              object.previewMesh.quaternion.copy(
                object.initQuaternion
              );
              object.resetPosition();

              if (object.texturePackSetWithScript){
                object.texturePackSetWithScript = false;
                object.resetTexturePackAfterAnimation();
              }

              if (object.material.map){
                if (object.material.map.initOffsetXSet){
                  object.material.map.offset.x = object.material.map.initOffsetX;
                  object.material.needsUpdate = true;
                  object.material.map.initOffsetXSet = false;
                }
                if (object.material.map.initOffsetYSet){
                  object.material.map.offset.y = object.material.map.initOffsetY;
                  object.material.needsUpdate = true;
                  object.material.map.initOffsetYSet = false;
                }
              }
              if (object.material.displacementMap){
                if (object.initDisplacementScaleSet){
                  object.material.displacementScale = object.initDisplacementScale;
                  object.material.needsUpdate = true;
                  object.initDisplacementScaleSet = false;
                }
                if (object.initDisplacementBiasSet){
                  object.material.displacementBias = object.initDisplacementBias;
                  object.material.needsUpdate = true;
                  object.initDisplacementBiasSet = false;
                }
              }
              if (object.initOpacitySet){
                object.material.transparent = true;
                object.material.opacity = object.initOpacity;
                object.material.needsUpdate = true;
                object.initOpacitySet = false;
              }
              if (object.material.isMeshPhongMaterial){
                if (object.initShininessSet){
                  object.material.shininess = object.initShininess;
                  object.material.needsUpdate = true;
                  object.initShininessSet = false;
                }
                if (object.initEmissiveIntensitySet){
                  object.material.emissiveIntensity = object.initEmissiveIntensity;
                  object.material.needsUpdate = true;
                  object.initEmissiveIntensitySet = false;
                }
              }

              if (!(typeof object.originalMass == "undefined")){
                object.setMass(object.originalMass);
                if (object.originalMass == 0){
                  delete dynamicObjects[object.name];
                }
                delete object.originalMass;
              }

            }
            var newScripts = new Object();
            for (var scriptName in scripts){
              newScripts[scriptName] = new Script(
                scriptName,
                scripts[scriptName].script
              );
              newScripts[scriptName].runAutomatically = scripts[scriptName].runAutomatically;
              newScripts[scriptName].localFilePath = scripts[scriptName].localFilePath;
            }
            for (var scriptName in newScripts){
              scripts[scriptName] =  newScripts[scriptName];
              scripts[scriptName].runAutomatically = newScripts[scriptName].runAutomatically;
            }
            newScripts = undefined;
            if (isPhysicsWorkerEnabled()){
              workerHandler.stopPhysicsWorkerIteration();
            }
            if (isCollisionWorkerEnabled()){
              workerHandler.stopBinHandlerLoop();
            }
            if (isPSCollisionWorkerEnabled()){
              workerHandler.stopBinHandlerLoop(true);
            }

          }
          initBadTV();
          return true;
        break;
        case 14: //newBasicMaterial
          var name = splitted[1];
          var color = splitted[2];
          var isWireFramed = splitted[3];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (name == "NULL_BASIC" || name == "NULL_PHONG"){
            terminal.printError(Text.NAME_RESERVED);
            return true;
          }

          if (materials[name]){
            terminal.printError(Text.MATERIAL_NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isWireFramed != "true" && isWireFramed != "false"){
            terminal.printError(Text.ISWIREFRAMED_MUST_BE_TRUE_OR_FALSE);
            return true;
          }
          var isWireFrameBool = false;
          if (isWireFramed == "true"){
            isWireFrameBool = true;
          }
          var basicMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: isWireFrameBool
          });
          basicMaterial.textColor = color;
          basicMaterial.roygbivMaterialName = name;
          materials[name] = basicMaterial;
          terminal.printInfo(Text.MATERIAL_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 15: //printMaterials
          var counter = 0;
          var length = Object.keys(materials).length;
          terminal.printHeader(Text.MATERIALS);
          for (var name in materials){
            counter ++;
            var options = false;
            if (counter != length){
              options = true;
            }else{
              options = false;
            }
            var material = materials[name];
            if (material.isMeshBasicMaterial){
              var wireFramedStr = "(is not wireframed)";
              if (material.wireframe){
                wireFramedStr = "(is wireframed)";
              }
              terminal.printInfo(Text.BASIC_MATERIAL_INFO_TREE.replace(
                Text.PARAM1, name
              ).replace(
                Text.PARAM2, material.textColor
              ).replace(
                Text.PARAM3, wireFramedStr
              ), options);
            }else if (material.isMeshPhongMaterial){
              terminal.printInfo(Text.PHONG_MATERIAL_INFO_TREE.replace(
                Text.PARAM1, name
              ).replace(
                Text.PARAM2, material.textColor
              ), options);
            }
          }
          if (counter == 0){
            terminal.printError(Text.NO_CREATED_MATERIALS);
          }
        break;
        case 16: //destroyMaterial
          var name = splitted[1];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!materials[name]){
            terminal.printError(Text.NO_SUCH_MATERIAL);
            return true;
          }
          for (var objectName in addedObjects){
            var addedObject = addedObjects[objectName];
            if (addedObject.material.roygbivMaterialName == name){
              terminal.printError(Text.MATERIAL_USED_IN_AN_OBJECT.replace(Text.PARAM1, objectName));
              return true;
            }
          }
          for (var objectGroupName in objectGroups){
            var group = objectGroups[objectGroupName].group;
            for (var objectName in group){
              var object = group[objectName];
              if (object.material.roygbivMaterialName == name){
                terminal.printError(Text.MATERIAL_USED_IN_AN_OBJECT.replace(Text.PARAM1, objectGroupName + "->" +objectName));
                return true;
              }
            }
          }
          delete materials[name];
          terminal.printInfo(Text.MATERIAL_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 17: //newSurface
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return;
          }
          var gridSelectionSize = Object.keys(gridSelections).length;
          if (gridSelectionSize != 2 && gridSelectionSize != 1){
            terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
            return true;
          }
          var selectedGrid1 = gridSelections[Object.keys(gridSelections)[0]];
          var selectedGrid2 = undefined;
          if (gridSelectionSize == 2){
            selectedGrid2 = gridSelections[Object.keys(gridSelections)[1]];
          }
          if (gridSelectionSize == 2){
            if (selectedGrid1.parentName != selectedGrid2.parentName){
              terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
              return true;
            }
          }

          var selectedGridSystemName = selectedGrid1.parentName;
          var materialName = splitted[2];
          var selectedMaterial = materials[materialName];
          if (materialName.toUpperCase() != "NULL"){
            if (!selectedMaterial){
              terminal.printError(Text.NO_SUCH_MATERIAL);
              return true;
            }
          }else{
            if (defaultMaterialType == "BASIC"){
              selectedMaterial = new THREE.MeshBasicMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              selectedMaterial.roygbivMaterialName = "NULL_BASIC";
            }else if (defaultMaterialType == "PHONG"){
              selectedMaterial = new THREE.MeshPhongMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              selectedMaterial.roygbivMaterialName = "NULL_PHONG";
            }
          }
          var objectName = splitted[1];
          if (objectName.toUpperCase() == "NULL"){
            objectName = generateUniqueObjectName();
          }
          if (addedObjects[objectName] || objectGroups[objectName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (disabledObjectNames[objectName]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
            return true;
          }
          if (objectName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
          gridSystems[selectedGridSystemName].newSurface(objectName, selectedGrid1, selectedGrid2, selectedMaterial);
          terminal.printInfo(Text.OBJECT_ADDED);
          undoRedoHandler.push();
          return true;
        break;
        case 18: //printObjects
          var objectCount = 0;
          var totalLength = Object.keys(addedObjects).length +
                            Object.keys(objectGroups).length;
          terminal.printHeader(Text.OBJECTS);
          for (var objectName in addedObjects){
            objectCount ++;
            var options = true;
            if (objectCount == totalLength){
              options = false;
            }
            var addedObject = addedObjects[objectName];
            terminal.printInfo(Text.OBJECT_INFO_TREE.replace(
              Text.PARAM1, addedObject.type
            ).replace(
              Text.PARAM2, objectName
            ), options);
          }
          for (var objectName in objectGroups){
            objectCount++;
            var options = true;
            if (objectCount == totalLength){
              options = false;
            }
            var grouppedObject = objectGroups[objectName];
            var childStr = "";
            for (var childName in grouppedObject.group){
              childStr += childName+"+";
            }
            childStr = childStr.substring(0, childStr.length - 1);
            terminal.printInfo(Text.OBJECT_GROUP_INFO_TREE.replace(
              Text.PARAM1, objectName
            ).replace(
              Text.PARAM2, childStr
            ), options);
          }
          if (objectCount == 0){
            terminal.printError(Text.NO_OBJECT_ADDED_TO_THE_SCENE);
            return true;
          }
        break;
        case 19: //printMetaData
          var objectName = splitted[1];
          var object = addedObjects[objectName];
          var objectGroup = objectGroups[objectName];
          if (!object && !objectGroup){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (objectGroup){
            terminal.printError(Text.NO_META_DATA_TO_SHOW);
            return true;
          }
          var metaData = object.metaData;
          terminal.printHeader(Text.METADATA_OF.replace(
            Text.PARAM1, objectName
          ));
          for (var metaDataKey in metaData){
            terminal.printInfo(Text.TREE2.replace(
              Text.PARAM1, metaDataKey
            ).replace(
              Text.PARAM2, metaData[metaDataKey]
            ), true);
          }
          var texturePackText;
          if (object.associatedTexturePack){
            texturePackText = object.associatedTexturePack;
          }else{
            texturePackText = " - ";
          }
          var materialText;
          if (object.material.isMeshPhongMaterial){
            materialText = "PHONG";
          }else if (object.material.isMeshBasicMaterial){
            materialText = "BASIC";
          }
          terminal.printInfo(Text.TREE2.replace(
            Text.PARAM1, Text.TEXTURE_PACK
          ).replace(
            Text.PARAM2, texturePackText
          ), true);
          terminal.printInfo(Text.TREE2.replace(
            Text.PARAM1, Text.MATERIAL_TYPE
          ).replace(
            Text.PARAM2, materialText
          ), false);
          return true;
        break;
        case 20: //destroyObject
          var objectName = splitted[1];
          var object = addedObjects[objectName];
          var objectGroup = objectGroups[objectName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!object && !objectGroup){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (object){
            if (selectedAddedObject && selectedAddedObject.name == objectName){
              selectedAddedObject = 0;
            }
            object.destroy();
            delete addedObjects[objectName];
          }else if (objectGroup){
            if (selectedObjectGroup && selectedObjectGroup.name == objectName){
              selectedObjectGroup = 0;
            }
            objectGroup.destroy();
            delete objectGroups[objectName];
          }
          terminal.printInfo(Text.OBJECT_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 21: //newTexture
          var textureName = splitted[1];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (textures[textureName]){
            terminal.printError(Text.TEXTURE_NAME_MUST_BE_UNIQUE);
            return true;
          }
          var repeatU = parseInt(splitted[3]);
          var repeatV = parseInt(splitted[4]);
          if (isNaN(splitted[3])){
            terminal.printError(Text.REPEATU_MUST_BE_A_NUMBER);
            return true;
          }
          if (isNaN(splitted[4])){
            terminal.printError(Text.REPEATV_MUST_BE_A_NUMBER);
            return true;
          }
          if (textureName.indexOf(PIPE) != -1){
            terminal.printError(Text.TEXTURE_NAME_NOT_VALID);
            return true;
          }

          var fileName = splitted[2];

          if (uploadedImages[fileName]){
            var imageDom = uploadedImages[fileName];
            var texture = new THREE.Texture(imageDom);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatU, repeatV);
            texture.needsUpdate = true;
            textures[textureName] = texture;
            textureURLs[textureName] = fileName;
            textureCache[textureName] = texture.clone();
            texture.isLoaded = true;
            texture.fromUploadedImage = true;
            terminal.printInfo(Text.TEXTURE_CREATED);
            undoRedoHandler.push();
            return true;
          }

          var textureUrl = "/textures/"+fileName;
          var texture;
          var found = false;
          for (var textureNameX in textureURLs){
            if (textureURLs[textureNameX] == textureUrl){
              if (textures[textureNameX] && textures[textureNameX].isLoaded){
                found = true;
                texture = textures[textureNameX].clone();
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( repeatU, repeatV );
                texture.needsUpdate = true;
                textures[textureName] = texture;
                textureCache[textureName] = texture.clone();
                texture.isLoaded = true;
              }
            }
          }
          textureURLs[textureName] = textureUrl;
          if (!found){
            var loader;
            if (textureUrl.toUpperCase().endsWith("TGA")){
              loader = new THREE.TGALoader();
            }else{
              loader = new THREE.TextureLoader();
            }
            loader.load(textureUrl,
              function (textureData){
                texture = textureData;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( repeatU, repeatV );
                texture.isLoaded = true;
                textures[textureName] = texture;
                textureCache[textureName] = texture.clone();
                undoRedoHandler.push();
              },
              function (xhr){
                textures[textureName] = 2;
                textureCache[textureName] = 2;
              },
              function (xhr){
                textures[textureName] =  3;
                textureCache[textureName] = 3;
                undoRedoHandler.push();
              }
            );
            textures[textureName] = 1;
            textureCache[textureName] = 1;
          }else{
            terminal.printInfo(Text.TEXTURE_CLONED);
            undoRedoHandler.push();
          }
          terminal.printInfo(Text.TEXTURE_CREATED);
        break;
        case 22: //printTextures
          var count = 0;
          var length = Object.keys(textures).length;
          terminal.printHeader(Text.TEXTURES);
          for (var textureName in textures){
            count ++;
            var texture = textures[textureName];
            var status;
            var sizeText = "";
            if (texture == 1){
              status = Text.STATUS_PENDING;
            }else if (texture == 2){
              status = Text.STATUS_DOWNLOADING;
            }else if (texture == 3){
              status = Text.STATUS_ERROR;
            }else if (texture && texture.isLoaded){
              status = Text.STATUS_LOADED;
            }

            if (!(typeof texture == "undefined") && texture instanceof THREE.Texture){
              sizeText = " [" + texture.image.width + "x" + texture.image.height + "]";
            }
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE_TEXTURE.replace(
              Text.PARAM1, textureName
            ).replace(
              Text.PARAM2, status
            ).replace(
              Text.PARAM3, textureURLs[textureName] + sizeText
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.THERE_ARE_NO_TEXTURES);
          }
          return true;
        break;
        case 23: //destroyTexture
          var textureName = splitted[1];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          for (var addedObjectName in addedObjects){
            var addedObject = addedObjects[addedObjectName];
            if (addedObject.isTextureUsed(textureName)){
              terminal.printError(Text.TEXTURE_USED_IN_AN_OBJECT.replace(Text.PARAM1, addedObjectName));
              return true;
            }
          }
          for (var objectGroupName in objectGroups){
            var objectGroup = objectGroups[objectGroupName];
            var group = objectGroup.group;
            for (var objectName in group){
              var childObject = group[objectName];
              if (childObject.isTextureUsed(textureName)){
                terminal.printError(Text.TEXTURE_USED_IN_AN_OBJECT.replace(Text.PARAM1, objectGroupName + "->" + objectName));
                return true;
              }
            }
          }
          delete textures[textureName];
          delete textureURLs[textureName];
          delete modifiedTextures[textureName];
          terminal.printInfo(Text.TEXTURE_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 24: //mapTexture
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (objectGroups[objectName]){
            terminal.printError(Text.CANNOT_MAP_TEXTURE_TO_A_GLUED_OBJECT);
            return true;
          }
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.map = cloneTexture;
          addedObject.previewMesh.material.map = cloneTexture;

          cloneTexture.needsUpdate = true;

          addedObject.metaData["textureRepeatU"] = cloneTexture.repeat.x;
          addedObject.metaData["textureRepeatV"] = cloneTexture.repeat.y;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          terminal.printInfo(Text.TEXTURE_MAPPED);
          undoRedoHandler.push();
        break;
        case 25: //adjustTextureRepeat
          var objectName = splitted[1];
          var repeatU = splitted[2];
          var repeatV = splitted[3];
          var object = addedObjects[objectName];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }

          if (!object){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          repeatU = parseInt(repeatU);
          repeatV = parseInt(repeatV);
          if (isNaN(repeatU)){
            terminal.printError(Text.REPEATU_MUST_BE_A_NUMBER);
            return true;
          }
          if (isNaN(repeatV)){
            terminal.printError(Text.REPEATV_MUST_BE_A_NUMBER);
            return true;
          }
          if (repeatU <= 0){
            terminal.printError(Text.TEXTURE_REPEAT_U_MUST_BE_A_POSITIVE_NUMBER);
            return true;
          }
          if (repeatV <= 0){
            terminal.printError(Text.TEXTURE_REPEAT_V_MUST_BE_A_POSITIVE_NUMBER);
            return true;
          }
          if (object.isTextured()){
            object.adjustTextureRepeat(repeatU, repeatV);
          }else{
            terminal.printError(Text.NO_TEXTURE_MAPPED_TO_OBJECT);
            return true;
          }

          terminal.printError(Text.REPEAT_AMOUNT_MODIFIED);
          undoRedoHandler.push();
          return true;
        break;
        case 26: //newPhysicsBoxTest
          // DEPRECATED
          return true;
        break;
        case 27: //newPhysicsSphereTest
          // DEPRECATED
          return true;
        break;
        case 28: //printPhysicsTests
          // DEPRECATED
          return true;
        break;
        case 29: //switchPhysicsDebugMode
          physicsDebugMode = !physicsDebugMode;
          if (physicsDebugMode){
            debugRenderer = new THREE.CannonDebugRenderer(previewScene, physicsWorld);
            terminal.printInfo(Text.PHYSICS_DEBUG_MODE_ON);
          }else{
            var objectsToRemove = [];
            var children = previewScene.children;
            for (var i = 0; i<children.length; i++){
              var child = children[i];
              if (child.forDebugPurposes){
                objectsToRemove.push(child);
              }
            }
            for (var i = 0; i<objectsToRemove.length; i++){
              previewScene.remove(objectsToRemove[i]);
            }
            terminal.printInfo(Text.PHYSICS_DEBUG_MODE_OFF);
          }
        break;
        case 30: //newRamp

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var name = splitted[1];
          if (name.toUpperCase() == "NULL"){
            name = generateUniqueObjectName();
          }
          var materialName = splitted[2];
          var axis = splitted[3].toLowerCase();
          var height = splitted[4];
          var material = materials[materialName];

          if (name.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }

          if (addedObjects[name] || objectGroups[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (disabledObjectNames[name]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
            return true;
          }
          if (materialName.toUpperCase() != "NULL"){
            if (!material){
              terminal.printError(Text.NO_SUCH_MATERIAL);
              return true;
            }
          }else{
            if (defaultMaterialType == "BASIC"){
              material = new THREE.MeshBasicMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              material.roygbivMaterialName = "NULL_BASIC";
            }else if (defaultMaterialType == "PHONG"){
              material = new THREE.MeshPhongMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              material.roygbivMaterialName = "NULL_PHONG";
            }
          }
          if (axis != "x" && axis != "z" && axis != "y"){
            terminal.printError(Text.AXIS_MUST_BE_ONE_OF_X_Y_Z);
            return true;
          }
          height = parseInt(height);
          if (isNaN(height)){
            terminal.printError(Text.HEIGHT_MUST_BE_A_NUMBER);
            return true;
          }
          if (Object.keys(gridSelections).length != 2){
            terminal.printError(Text.MUST_HAVE_TWO_GRIDS_SELECTED);
            return true;
          }
          if (!anchorGrid){
            terminal.printError(Text.NO_ANCHOR_GRIDS_SELECTED);
            return true;
          }
          var gridNames = [];
          for (var gridName in gridSelections){
            gridNames.push(gridName);
          }
          var grid1 = gridSelections[gridNames[0]];
          var grid2 = gridSelections[gridNames[1]];
          if (grid1.parentName != grid2.parentName){
            terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
            return true;
          }
          if(anchorGrid.name != grid1.name && anchorGrid.name != grid2.name){
            terminal.printError(Text.ONE_OF_THE_GRID_SELECTIONS_MUST_BE_THE_ANCHOR_GRID);
            return true;
          }
          var otherGrid = grid1;
          if (anchorGrid.name == grid1.name){
            otherGrid = grid2;
          }
          var gridSystem = gridSystems[grid1.parentName];
          if (gridSystem.axis == "XZ" && axis == "y"){
            terminal.printError(Text.AXIS_MUST_BE_X_OR_Z);
            return true;
          }else if (gridSystem.axis == "XY" && axis == "z"){
            terminal.printError(Text.AXIS_MUST_BE_X_OR_Y);
            return true;
          }else if (gridSystem.axis == "YZ" && axis == "x"){
            terminal.printError(Text.AXIS_MUST_BE_Y_OR_Z);
            return true;
          }

          gridSystem.newRamp(anchorGrid, otherGrid, axis, parseInt(height), material, name);
          anchorGrid = 0;
          undoRedoHandler.push();
        break;
        case 31: //setAnchor

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return;
          }

          if (Object.keys(gridSelections).length != 1){
            terminal.printError(Text.MUST_HAVE_ONE_GRID_SELECTED);
            return true;
          }
          for (var gridName in gridSelections){
            anchorGrid = gridSelections[gridName];
            terminal.printInfo(Text.ANCHOR_SET.replace(
              Text.PARAM1, gridName
            ));
            undoRedoHandler.push();
          }
          return true;
        break;
        case 32: //restartPhysicsTest
          // DEPRECATED
          return true;
        break;
        case 33: //mirror
          var objectName = splitted[1];
          var property = splitted[2];
          var axis = splitted[3];
          var addedObject = addedObjects[objectName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (axis.toUpperCase() == "S"){
            axis = "S";
          }else if (axis.toUpperCase() == "T"){
            axis = "T";
          }else if (axis.toUpperCase() == "ST"){
            axis = "ST";
          }else{
            terminal.printError(Text.AXIS_MUST_BE_ONE_OF_S_T);
            return true;
          }

          if (property.toUpperCase() != "ON" && property.toUpperCase() != "OFF"){
            terminal.printError(Text.MIRROR_STATE_MUST_BE_ON_OR_OFF);
            return true;
          }

          addedObject.handleMirror(axis, property);

          terminal.printInfo(Text.MIRRORED_REPEAT_SET.replace(
            Text.PARAM1, property
          ).replace(
            Text.PARAM2, axis
          ));
          undoRedoHandler.push();
          return true;
        break;
        case 34: //newBox
          var name = splitted[1];
          if (name.toUpperCase() == "NULL"){
            name = generateUniqueObjectName();
          }
          var materialName = splitted[2];
          var height = splitted[3];

          if (name.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (addedObjects[name] || objectGroups[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (disabledObjectNames[name]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
            return true;
          }

          var material = materials[materialName];
          if (materialName.toUpperCase() != "NULL"){
            if (!material){
              terminal.printError(Text.NO_SUCH_MATERIAL);
              return true;
            }
          }else{
            if (defaultMaterialType == "BASIC"){
              material = new THREE.MeshBasicMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              material.roygbivMaterialName = "NULL_BASIC";
            }else if (defaultMaterialType == "PHONG"){
              material = new THREE.MeshPhongMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              material.roygbivMaterialName = "NULL_PHONG";
            }
          }

          var gridSelectionSize = Object.keys(gridSelections).length;
          if (gridSelectionSize != 1 && gridSelectionSize != 2){
            terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
            return true;
          }

          height = parseInt(height);
          if (isNaN(height)){
            terminal.printError(Text.HEIGHT_MUST_BE_A_NUMBER);
            return true;
          }

          var selections = [];
          for (var gridName in gridSelections){
            selections.push(gridSelections[gridName]);
          }

          if (selections.length == 2){
            var grid1 = selections[0];
            var grid2 = selections[1];
            if (grid1.parentName != grid2.parentName){
              terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
              return true;
            }
          }

          var gridSystemName = selections[0].parentName;
          var gridSystem = gridSystems[gridSystemName];

          gridSystem.newBox(selections, height, material, name);
          terminal.printInfo(Text.BOX_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 35: //newWallCollection
          var name = splitted[1];
          var height = splitted[2];
          var outlineColor = splitted[3];

          height = parseInt(height);

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (wallCollections[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }

          var gridSelectionSize = Object.keys(gridSelections).length;
          if (gridSelectionSize != 2 && gridSelectionSize != 1){
            terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
            return true;
          }
          var grid1 = gridSelections[Object.keys(gridSelections)[0]];

          var sideNames = [];
          if (grid1.axis == "XZ"){
            sideName = [
              name + "_"+"YZ_1",
              name + "_"+"YZ_2",
              name + "_"+"XY_1",
              name + "_"+"XY_2",
              name + "_"+"XZ_ROOF"
            ];
          }else if (grid1.axis == "XY"){
            sideName = [
              name + "_"+"XZ_1",
              name + "_"+"XZ_2",
              name + "_"+"YZ_1",
              name + "_"+"YZ_2",
              name + "_"+"XY_ROOF"
            ];
          }else if (grid1.axis == "YZ"){
            sideName = [
              name + "_"+"XZ_1",
              name + "_"+"XZ_2",
              name + "_"+"XY_1",
              name + "_"+"XY_2",
              name + "_"+"YZ_ROOF"
            ];
          }

          for (var i = 0; i<sideNames.length; i++){
            if (gridSystems[sideNames[i]]){
              terminal.printInfo(Text.AN_ERROR_HAPPENED_CHOOSE_ANOTHER_NAME);
              return true;
            }
          }

          if (isNaN(height)){
            terminal.printError(Text.HEIGHT_MUST_BE_A_NUMBER);
            return true;
          }

          if (height == 0){
            terminal.printError(Text.HEIGHT_CANNOT_BE_0);
            return true;
          }

          var grid2 = undefined;
          if (gridSelectionSize == 2){
            grid2 = gridSelections[Object.keys(gridSelections)[1]];
          }

          if (gridSelectionSize == 2){
            if (grid1.parentName != grid2.parentName){
              terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
              return true;
            }
          }

          var isSuperPosed = false;
          var baseGridSystem = gridSystems[grid1.parentName];
          if (baseGridSystem.isSuperposed){
            isSuperPosed = true;
          }

          new WallCollection(name, height, outlineColor,
                                                  grid1, grid2, isSuperPosed);
          for (var gridName in gridSelections){
            gridSelections[gridName].toggleSelect(false, false, false, true);
          }
          terminal.printInfo(Text.WALL_COLLECTION_CREATED);
          undoRedoHandler.push();
        break;
        case 36: //printWallCollections
          var count = 0;
          var length = Object.keys(wallCollections).length;
          terminal.printHeader(Text.WALL_COLLECTIONS);
          for (var wallCollectionName in wallCollections){
            count ++;
            var options = true;
            if (length == count){
              options = false;
            }
            var wallCollection = wallCollections[wallCollectionName];
            terminal.printInfo(Text.TREE_WALL_COLLECTIONS.replace(
              Text.PARAM1, wallCollectionName
            ).replace(
              Text.PARAM2, wallCollection.outlineColor
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.THERE_ARE_NO_CREATED_WALL_COLLECTIONS);
          }
          return true;
        break;
        case 37: //destroyWallCollection
          var name = splitted[1];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var wallCollection = wallCollections[name];
          if (wallCollection){
            wallCollection.destroy();
            terminal.printInfo(Text.WALL_COLLECTION_DESTROYED);
            undoRedoHandler.push();
          }else{
            terminal.printError(Text.NO_SUCH_WALL_COLLECTION);
          }
          return true;
        break;
        case 38: //destroySelectedGrids
          // DEPRECATED
          return true;
        break;
        case 39: //remakeGridSystem
          // DEPRECATED
          return true;
        break;
        case 40: //resetCamera
          camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
          camera.rotation.order = 'YXZ';
          camera.rotation.set(0, 0, 0);
          terminal.printInfo(Text.CAMERA_RESET);
        break;
        case 41: //uploadImage
          var name = splitted[1];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!FileReader){
            terminal.printError(Text.THIS_FUNCTION_IS_NOT_SUPPORTED_IN_YOUR_BROWSER);
            return true;
          }
          if (uploadedImages[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (name.trim() == ""){
            terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
            return true;
          }
          document.getElementById("imageUploaderInput").onclick = function(){
            this.value = "";
            document.getElementById("imageUploaderInput").onchange = function(event){
              terminal.clear();
              terminal.printInfo(Text.LOADING_IMAGE);
              var target = event.target || window.event.srcElement;
              var files = target.files;
              if (files && files.length){
                var fileReader = new FileReader();
                fileReader.onload = function(e){
                  var url = e.target.result;
                  var imageDom = document.createElement("img");
                  imageDom.src = url;
                  uploadedImages[name] = imageDom;
                  terminal.clear();
                  terminal.printInfo(Text.IMAGE_CREATED.replace(
                    Text.PARAM1, name
                  ));
                  undoRedoHandler.push();
                };
                fileReader.readAsDataURL(files[0]);
              }else{
                terminal.printError(Text.NO_FILE_SELECTED_OPERATION_CANCELLED);
              }
              return true;
            };
          }
          imageUploaderInput.click();
          terminal.printInfo(Text.DIALOG_OPENED_CHOOSE_AN_IMAGE);
        break;
        case 42: //printImages
          var count = 0;
          var length = Object.keys(uploadedImages).length;
          terminal.printHeader(Text.IMAGES);
          for (var imageName in uploadedImages){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(
              Text.PARAM1, imageName
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_UPLOADED_IMAGES);
          }
          return true;
        break;
        case 43: //mapSpecular
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.specularMap = cloneTexture;
          addedObject.previewMesh.material.specularMap = cloneTexture;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          terminal.printInfo(Text.SPECULAR_TEXTURE_MAPPED);
          undoRedoHandler.push();
        break;
        case 44: //mapEnvironment
          // DEPRECATED
        break;
        case 45: //mapAmbientOcculsion
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.aoMap = cloneTexture;
          addedObject.previewMesh.material.aoMap = cloneTexture;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          terminal.printInfo(Text.AMBIENT_OCCULSION_TEXTURE_MAPPED);
          undoRedoHandler.push();
        break;
        case 46: //mapAlpha
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.alpaMap = cloneTexture;
          addedObject.previewMesh.material.alphaMap = cloneTexture;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.mesh.material.transparent = false;
          addedObject.previewMesh.material.transparent = false;
          addedObject.mesh.material.alphaTest = 0.5;
          addedObject.previewMesh.material.alphaTest = 0.5;
          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          terminal.printInfo(Text.ALPHA_TEXTURE_MAPPED);
          undoRedoHandler.push();
        break;
        case 47: //setDefaultMaterial
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var materialType = splitted[1].toUpperCase();
          if (materialType != "BASIC" && materialType != "PHONG"){
            terminal.printError(Text.DEFAULT_MATERIAL_TYPE_MUST_BE);
            return true;
          }
          defaultMaterialType = materialType;
          terminal.printInfo(Text.DEFAULT_MATERIAL_TYPE_SET_TO.replace(
            Text.PARAM1, defaultMaterialType
          ));
          undoRedoHandler.push();
          return true;
        break;
        case 48: //newAmbientLight
          var name = splitted[1];
          var lightColor = splitted[2];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (lights[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          var light = new THREE.AmbientLight(lightColor);
          var previewSceneLight = light.clone();
          scene.add(light);
          previewScene.add(previewSceneLight);
          lights[name] = light;
          light_previewScene[name] = previewSceneLight;
          light.colorTextVal = lightColor;
          previewSceneLight.colorTextVal = lightColor;
          for (var objectName in addedObjects){
            var addedObject = addedObjects[objectName];
            addedObject.mesh.material.needsUpdate = true;
            addedObject.previewMesh.material.needsUpdate = true;
          }
          terminal.printInfo(Text.AMBIENT_LIGHT_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 49: //printLights
          var count = 0;
          var length = Object.keys(lights).length;
          terminal.printHeader(Text.LIGHTS);
          for (var lightName in lights){
            var light = lights[lightName];
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            var type = "[AMBIENT - "+light.colorTextVal+"]";
            if (light.isPointLight){
              type = "[POINT - "+light.colorTextVal+"]";
            }else if (light.isDirectionalLight){
              type = "[DIRECTIONAL - "+light.colorTextVal+"]";
            }else if (light.isSpotLight){
              type = "[SPOT - "+light.colorTextVal+"]";
            }
            terminal.printInfo(Text.TREE_LIGHTS.replace(
              Text.PARAM1, type
            ).replace(
              Text.PARAM2, lightName
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_LIGHTS_CREATED);
          }
          return true;
        break;
        case 50: //selectLight
          var lightName = splitted[1];
          if (!lights[lightName]){
            terminal.printError(Text.NO_SUCH_LIGHT);
            return true;
          }
          selectedLightName = lightName;
          terminal.printInfo(Text.SELECTED_LIGHT.replace(
            Text.PARAM1, lightName
          ));
          selectedAddedObject = 0;
          selectedObjectGroup = 0;
          afterObjectSelection();
          return true;
        break;
        case 51: //destroyLight
          var lightName = splitted[1];
          var light = lights[lightName];
          var light_preview = light_previewScene[lightName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!light){
            terminal.printError(Text.NO_SUCH_LIGHT);
            return true;
          }
          scene.remove(light);
          previewScene.remove(light_preview);
          for (var objectName in addedObjects){
            var addedObject = addedObjects[objectName];
            addedObject.mesh.material.needsUpdate = true;
            addedObject.previewMesh.material.needsUpdate = true;
          }

          if (light.isPointLight){
            scene.remove(pointLightRepresentations[lightName]);
            delete pointLightRepresentations[lightName];
          }
          delete lights[lightName];
          delete light_previewScene[lightName];
          selectedLightName = 0;
          terminal.printError(Text.LIGHT_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 52: //newPhongMaterial
          var name = splitted[1];
          var materialColor = splitted[2];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (name == "NULL_BASIC" || name == "NULL_PHONG"){
            terminal.printError(Text.NAME_RESERVED);
            return true;
          }

          if (materials[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }

          var phongMaterial = new THREE.MeshPhongMaterial({
            color: materialColor,
            side: THREE.DoubleSide,
            wireframe: false
          });
          phongMaterial.textColor = materialColor;
          phongMaterial.roygbivMaterialName = name;
          materials[name] = phongMaterial;
          terminal.printInfo(Text.MATERIAL_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 53: //mapNormal
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (addedObject.mesh.material.isMeshBasicMaterial){
            terminal.printError(Text.NORMAL_MAPS_ARE_NOT_SUPPROTED);
            return true;
          }

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.normalMap = cloneTexture;
          addedObject.previewMesh.material.normalMap = cloneTexture;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          undoRedoHandler.push();
          terminal.printInfo(Text.NORMAL_TEXTURE_MAPPED);
        break;
        case 54: //mapEmissive
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (addedObject.mesh.material.isMeshBasicMaterial){
            terminal.printError(Text.EMISSIVE_MAPS_ARE_NOT_SUPPORTED);
            return true;
          }

          addedObject.mesh.material.emissive = new THREE.Color( 0xffffff );
          addedObject.previewMesh.material.emissive = new THREE.Color( 0xffffff );

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.emissiveMap = cloneTexture;
          addedObject.previewMesh.material.emissiveMap = cloneTexture;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          terminal.printInfo(Text.EMISSIVE_TEXTURE_MAPPED);
          undoRedoHandler.push();
        break;
        case 55: //newLambertMaterial
          //DEPRECATED
        break;
        case 56: //newTexturePack
          var name = splitted[1];
          var directoryName = splitted[2];
          var fileExtension = splitted[3];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (texturePacks[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }

          if (directoryName.trim() == ""){
            terminal.printError(Text.DIRECTORY_NAME_CANNOT_BE_EMPTY);
            return true;
          }

          if (fileExtension.trim() == ""){
            terminal.printError(Text.FILE_EXTENSION_CANNOT_BE_EMPTY);
            return true;
          }

          var texturePack = new TexturePack(
            name,
            directoryName,
            fileExtension
          );
          texturePacks[name] = texturePack;
          terminal.printInfo(Text.TEXTURE_PACK_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 57: //printTexturePacks
          var count = 0;
          var length = Object.keys(texturePacks).length;
          terminal.printHeader(Text.TEXTURE_PACKS);
          for (var texturePackName in texturePacks){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(
              Text.TREE.replace(Text.PARAM1, texturePackName),
              options
            );
          }
          if (count == 0){
            terminal.printError(Text.NO_TEXTURE_PACKS_CREATED);
          }
          return true;
        break;
        case 58: //printTexturePackInfo
          var name = splitted[1];
          var texturePack = texturePacks[name];
          if (!texturePack){
            terminal.printError(Text.NO_SUCH_TEXTURE_PACK);
            return true;
          }
          texturePack.printInfo();
          return true;
        break;
        case 59: //mapTexturePack
          var texturePackName = splitted[1];
          var objectName = splitted[2];

          var texturePack = texturePacks[texturePackName];
          var addedObject = addedObjects[objectName];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }

          if (!texturePack){
            terminal.printError(Text.NO_SUCH_TEXTURE_PACK);
            return true;
          }

          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (!texturePack.isUsable()){
            terminal.printError(Text.TEXTURE_PACK_NOT_USABLE);
            return true;
          }

          addedObject.mapTexturePack(texturePack);
          terminal.printInfo(Text.TEXTURE_PACK_MAPPED);
          undoRedoHandler.push();
          return true;
        break;
        case 60: //destroyTexturePack
          var name = splitted[1];
          var texturePack = texturePacks[name];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!texturePack){
            terminal.printError(Text.NO_SUCH_TEXTURE_PACK);
            return true;
          }
          for (var addedObjectName in addedObjects){
            var addedObject = addedObjects[addedObjectName];
            if (addedObject.isTexturePackUsed(name)){
              terminal.printError(Text.TEXTURE_PACK_USED_IN_AN_OBJECT.replace(Text.PARAM1, addedObjectName));
              return true;
            }
          }
          for (var objectGroupName in objectGroups){
            var objectGroup = objectGroups[objectGroupName];
            var group = objectGroup.group;
            for (var objectName in group){
              var childObject = group[objectName];
              if (childObject.isTexturePackUsed(name)){
                terminal.printError(Text.TEXTURE_PACK_USED_IN_AN_OBJECT.replace(Text.PARAM1, objectGroupName + "->" + objectName));
                return true;
              }
            }
          }
          texturePack.destroy();
          terminal.printInfo(Text.TEXTURE_PACK_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 61: //refreshTexturePack
          var name = splitted[1];
          var texturePack = texturePacks[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!texturePack){
            terminal.printError(Text.NO_SUCH_TEXTURE_PACK);
            return true;
          }
          texturePack.refresh();
          terminal.printInfo(Text.TEXTURE_PACK_REFRESHED);
          return true;
        break;
        case 62: //mapHeight
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!texture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!texture || !texture.isLoaded){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          var addedObject = addedObjects[objectName];
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (!addedObject.mesh.material.isMeshPhongMaterial){
            terminal.printError(Text.HEIGHT_MAPS_ARE_SUPPORTED_ONLY_BY);
            return true;
          }

          if (addedObject.metaData["widthSegments"] == 1){
            addedObject.segmentGeometry(false, undefined);
          }

          var cloneTexture = texture.clone();
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mesh.material.displacementMap = cloneTexture;
          addedObject.previewMesh.material.displacementMap = cloneTexture;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.mesh.material.needsUpdate = true;
          addedObject.previewMesh.material.needsUpdate = true;
          addedObject.resetAssociatedTexturePack();
          terminal.printInfo(Text.HEIGHT_TEXTURE_MAPPED);
          undoRedoHandler.push();
        break;
        case 63: //resetMaps
          var name = splitted[1];
          var addedObject = addedObjects[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[name]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          addedObject.resetMaps(true);
          if (addedObject.material.isMeshPhongMaterial){
            if (addedObject.metaData["widthSegments"] != 1){
              addedObject.deSegmentGeometry();
            }
          }
          terminal.printInfo(Text.MAPS_RESET);
          undoRedoHandler.push();
          return true;
        break;
        case 64: //segmentObject
          var name = splitted[1];
          var count = parseInt(splitted[2]);
          var addedObject = addedObjects[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[name]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }
          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (isNaN(count)){
            terminal.printError(Text.COUNT_MUST_BE_A_NUMBER);
            return true;
          }
          if (count < 1){
            terminal.printError(Text.COUNT_MUST_BE_GREATER_THAN_1);
            return true;
          }
          if (count > MAX_OBJECT_SEGMENT_COUNT){
            terminal.printError(Text.MAX_NUMBER_OF_SEGMENTS_ALLOWED.replace(
              Text.PARAM1, MAX_OBJECT_SEGMENT_COUNT
            ));
            return true;
          }
          if (addedObject.type == "sphere" && count < 8){
            terminal.printError(Text.SPHERE_CAN_HAVE_MINIMUM_8_SEGMENTS);
            return true;
          }
          addedObject.segmentGeometry(true, count);
          terminal.printError(Text.OBJECT_SEGMENTED);
          undoRedoHandler.push();
          return true;
        break;
        case 65: //superposeGridSystem
          var gridSystemName = splitted[1];
          var outlineColor = splitted[2];
          var cellSize = parseInt(splitted[3]);
          var objectName = splitted[4];

          var object = addedObjects[objectName];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (objectGroups[objectName]){
            terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }

          if (!object){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (gridSystems[gridSystemName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (object.type == "ramp"){
            terminal.printError(Text.RAMPS_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }else if (object.type == "sphere"){
            terminal.printError(Text.SPHERES_DO_NOT_SUPPORT_THIS_FUNCTION);
            return true;
          }

          var baseGridSystemName = object.metaData["gridSystemName"];
          var baseGridSystem = gridSystems[baseGridSystemName];
          if (baseGridSystem.axis != "XZ"){
            if (object.type == "surface"){
              terminal.printError(Text.SURFACES_DO_NOT_SUPPORT_THIS_FUNCTION_UNLESS);
              return true;
            }
          }

          var sizeX, sizeZ;
          var centerX, centerY, centerZ;

          if (object.type == "surface"){
            sizeX = object.metaData["width"];
            sizeZ = object.metaData["height"];
            centerX = object.mesh.position.x;
            centerY = object.mesh.position.y;
            centerZ = object.mesh.position.z;
          }else if (object.type == "box"){
            sizeX = object.metaData["boxSizeX"];
            sizeZ = object.metaData["boxSizeZ"];
            centerX = object.mesh.position.x;
            centerY = object.mesh.position.y + (object.metaData["boxSizeY"] / 2);
            centerZ = object.mesh.position.z;
          }

          centerY = centerY + superposeYOffset;

          gridSystemName = gridSystemName.replace(/_/g, "-");

          processNewGridSystemCommand(gridSystemName, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, "XZ", true, false);
          if (gridSystems[gridSystemName]){
            undoRedoHandler.push();
          }
        break;
        case 66: //postProcessing
          if (mode != 1){
            terminal.printError(Text.WORKS_ONLY_IN_PREVIEW_MODE);
            return true;
          }
          var status = splitted[1];
          if (status.toLowerCase() != "show" && status.toLowerCase() != "hide"){
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
          }

          var visibility = $(datGui.domElement).is(":visible");

          if (status == "hide"){
            if (!visibility){
              terminal.printError(Text.GUI_IS_ALREADY_HIDDEN);
              return true;
            }
            $(datGui.domElement).attr("hidden", true);
            terminal.printInfo(Text.GUI_CLOSED);
          }else{
            if (visibility){
              terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
              return true;
            }
            $(datGui.domElement).attr("hidden", false);
            terminal.printInfo(Text.GUI_OPENED);
          }
          return true;
        break;
        case 67: //sliceGrid
          var name = splitted[1];
          var cellSize = parseInt(splitted[2]);
          var outlineColor = splitted[3];
          var gridSelectionSize = Object.keys(gridSelections).length;
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (gridSelectionSize != 1){
            terminal.printError(Text.MUST_HAVE_ONE_GRID_SELECTED);
            return true;
          }
          if (isNaN(cellSize)){
            terminal.printError(Text.CELLSIZE_MUST_BE_A_NUMBER);
            return true;
          }
          if (gridSystems[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          var selectedGrid = gridSelections[Object.keys(gridSelections)[0]];
          var parentGridSystem = gridSystems[selectedGrid.parentName];
          if (parentGridSystem){
            parentGridSystem.slicedGrids[selectedGrid.name] = selectedGrid;
          }

          name = name.replace(/_/g, "-");

          processNewGridSystemCommand(
            name,
            selectedGrid.size,
            selectedGrid.size,
            selectedGrid.centerX,
            selectedGrid.centerY,
            selectedGrid.centerZ,
            outlineColor,
            cellSize,
            selectedGrid.axis,
            false,
            selectedGrid
          );
          if (gridSystems[name]){
            undoRedoHandler.push();
          }else{
            delete parentGridSystem.slicedGrids[selectedGrid.name];
            delete selectedGrid.sliced;
            delete selectedGrid.slicedGridSystemName;
          }
        break;
        case 68: //newPointLight
          var name = splitted[1];
          var color = splitted[2];
          var offsetX = parseInt(splitted[3]);
          var offsetY = parseInt(splitted[4]);
          var offsetZ = parseInt(splitted[5]);

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (lights[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }

          if (isNaN(offsetX)){
            terminal.printError(Text.OFFSETX_MUST_BE_A_NUMBER);
            return true;
          }

          if (isNaN(offsetY)){
            terminal.printError(Text.OFFSETY_MUST_BE_A_NUMBER);
            return true;
          }

          if (isNaN(offsetZ)){
            terminal.printError(Text.OFFSETZ_MUST_BE_A_NUMBER);
            return true;
          }

          if (Object.keys(gridSelections).length != 1){
            terminal.printError(Text.MUST_HAVE_ONE_GRID_SELECTED);
            return true;
          }

          var selectedGrid = gridSelections[Object.keys(gridSelections)[0]];

          selectedGrid.toggleSelect(false, false, false, true);
          delete gridSelections[Object.keys(gridSelections)[0]];

          var lightPositionX = selectedGrid.centerX + offsetX;
          var lightPositionY = selectedGrid.centerY + offsetY;
          var lightPositionZ = selectedGrid.centerZ + offsetZ;

          var pointLight = new THREE.PointLight(color);
          var pointLightClone = pointLight.clone();

          pointLight.colorTextVal = color;
          pointLightClone.colorTextVal = color;

          pointLight.position.x = lightPositionX;
          pointLight.position.y = lightPositionY;
          pointLight.position.z = lightPositionZ;

          pointLightClone.position.x = lightPositionX;
          pointLightClone.position.y = lightPositionY;
          pointLightClone.position.z = lightPositionZ;

          lights[name] = pointLight;
          light_previewScene[name] = pointLightClone;

          pointLight.initialPositionX = pointLight.position.x;
          pointLight.initialPositionY = pointLight.position.y;
          pointLight.initialPositionZ = pointLight.position.z;
          pointLightClone.initialPositionX = pointLightClone.position.x;
          pointLightClone.initialPositionY = pointLightClone.position.y;
          pointLightClone.initialPositionZ = pointLightClone.position.z;

          scene.add(pointLight);
          previewScene.add(pointLightClone);

          var pointLightRepresentation = new THREE.Mesh(
            new THREE.SphereGeometry(5),
            new THREE.MeshBasicMaterial({color: color})
          );

          pointLightRepresentation.position.x = lightPositionX;
          pointLightRepresentation.position.y = lightPositionY;
          pointLightRepresentation.position.z = lightPositionZ;

          scene.add(pointLightRepresentation);
          pointLightRepresentations[name] = pointLightRepresentation;

          pointLightRepresentation.lightName = name;
          pointLightRepresentation.isPointLightRepresentation = true;

          terminal.printError(Text.LIGHT_ADDED);
          undoRedoHandler.push();
          return true;
        break;
        case 69: //newSkybox
          var name = splitted[1];
          var directoryName = splitted[2];
          var fileExtension = splitted[3];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (skyBoxes[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }

          if (directoryName.trim() == ""){
            terminal.printError(Text.DIRECTORY_NAME_CANNOT_BE_EMPTY);
            return true;
          }

          if (fileExtension.trim() == ""){
            terminal.printError(Text.FILE_EXTENSION_CANNOT_BE_EMPTY);
            return true;
          }

          var skyBox = new SkyBox(
            name,
            directoryName,
            fileExtension
          );
          skyBoxes[name] = skyBox;
          terminal.printInfo(Text.SKYBOX_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 70: //printSkyboxes
          var count = 0;
          var length = Object.keys(skyBoxes).length;
          terminal.printHeader(Text.SKYBOXES);
          for (var skyboxName in skyBoxes){
            count++;
            var options = true;
            if (length == count){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(
              Text.PARAM1, skyboxName
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_SKYBOXES_CREATED);
          }
          return true;
        break;
        case 71: //printSkyboxInfo
          var name = splitted[1];
          var skybox = skyBoxes[name];
          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          skybox.printInfo();
          return true;
        break;
        case 72: //mapSkybox
          var name = splitted[1];
          var skybox = skyBoxes[name];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          if (skyboxCache[name]){
            skybox = skyboxCache[name];
          }
          if (!skybox.isUsable()){
            terminal.printError(Text.SKYBOX_NOT_USABLE);
            return true;
          }
          var materialArray = [];
          var skyboxTextures = [
            skybox.leftTexture,
            skybox.rightTexture,
            skybox.upTexture,
            skybox.downTexture,
            skybox.frontTexture,
            skybox.backTexture
          ];
          for (var i = 0; i<skyboxTextures.length; i++){
            materialArray.push(new THREE.MeshBasicMaterial(
              {
                map: skyboxTextures[i],
                side: THREE.BackSide
              }
            ));
          }

          if (skyboxMesh){
            scene.remove(skyboxMesh);
          }
          if (skyboxPreviewMesh){
            previewScene.remove(skyboxPreviewMesh);
          }

          var skyGeometry = new THREE.CubeGeometry(
            skyboxDistance, skyboxDistance, skyboxDistance
          );
          skyboxMesh = new THREE.Mesh( skyGeometry, materialArray );
          skyboxPreviewMesh = skyboxMesh.clone();
          scene.add(skyboxMesh);
          previewScene.add(skyboxPreviewMesh);
          skyboxVisible = true;
          mappedSkyboxName = name;
          terminal.printInfo(Text.SKYBOX_MAPPED);
          undoRedoHandler.push();
        break;
        case 73: //destroySkybox
          var name = splitted[1];
          var skybox = skyBoxes[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          delete skyBoxes[name];
          terminal.printInfo(Text.SKYBOX_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 74: //skybox
          var param = splitted[1].toUpperCase();
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!skyboxMesh){
            terminal.printError(Text.NO_SKYBOX_MAPPED);
            return true;
          }
          if (param != "HIDE" && param != "SHOW"){
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
          }
          if (param == "HIDE"){
            if (!skyboxVisible){
              terminal.printError(Text.SKYBOX_NOT_VISIBLE);
              return true;
            }
            scene.remove(skyboxMesh);
            previewScene.remove(skyboxPreviewMesh);
            skyboxVisible = false;
            terminal.printInfo(Text.SKYBOX_HIDDEN);
          }else{
            if (skyboxVisible){
              terminal.printError(Text.SKYBOX_ALREADY_VISIBLE);
              return true;
            }
            scene.add(skyboxMesh);
            previewScene.add(skyboxPreviewMesh);
            skyboxVisible = true;
            terminal.printInfo(Text.SKYBOX_SHOWN);
          }
          undoRedoHandler.push();
          return true;
        break;
        case 75: //scaleSkybox
          var amount = parseFloat(splitted[1]);
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!skyboxMesh || !skyboxPreviewMesh){
            terminal.printError(Text.SKYBOX_NOT_DEFINED);
            return true;
          }
          if (!skyboxVisible){
            terminal.printError(Text.SKYBOX_NOT_VISIBLE);
            return true;
          }
          if (isNaN(amount)){
            terminal.printError(Text.AMOUNT_MUST_HAVE_A_NUMERICAL_VALUE);
            return true;
          }
          skyboxMesh.scale.x = amount;
          skyboxMesh.scale.y = amount;
          skyboxMesh.scale.z = amount;
          skyboxPreviewMesh.scale.x = amount;
          skyboxPreviewMesh.scale.y = amount;
          skyboxPreviewMesh.scale.z = amount;
          terminal.printInfo(Text.SKYBOX_SCALE_ADJUSTED);
          undoRedoHandler.push();
          return true;
        break;
        case 76: //save
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var state = new State();
          var json = JSON.stringify(state);
          var blob = new Blob([json], {type: "application/json"});
          var url  = URL.createObjectURL(blob);
          var anchor = document.createElement('a');
          anchor.download = "ROYGBIV_SAVE_"+new Date()+".json";
          anchor.href = url;
          if (typeof InstallTrigger !== 'undefined') {
            // F I R E F O X
            anchor.dispatchEvent(new MouseEvent(`click`, {
              bubbles: true, cancelable: true, view: window
            }));
          }else{
            anchor.click();
          }
          terminal.printInfo(Text.DOWNLOAD_PROCESS_INITIATED);
          return true;
        break;
        case 77: //load

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!FileReader){
            terminal.printError(Text.THIS_FUNCTION_IS_NOT_SUPPORTED_IN_YOUR_BROWSER);
            return true;
          }
          document.getElementById("loadInput").onclick = function(){
            this.value = "";
            document.getElementById("loadInput").onchange = function(event){
              terminal.clear();
              terminal.printInfo(Text.LOADING_FILE);
              var target = event.target || window.event.srcElement;
              var files = target.files;
              if (files && files.length){
                var fileReader = new FileReader();
                fileReader.onload = function(e){
                  var data = e.target.result;
                  var loadedState = JSON.parse(data);
                  var stateLoader = new StateLoader(loadedState);
                  var result = stateLoader.load();
                  terminal.clear();
                  if (result){
                    terminal.printInfo(Text.PROJECT_LOADED);
                  }else{
                    terminal.printError(Text.PROJECT_FAILED_TO_LOAD.replace(
                      Text.PARAM1, stateLoader.reason
                    ));
                  }
                };
                fileReader.readAsText(files[0]);
              }else{
                terminal.printError(Text.NO_FILE_SELECTED_OPERATION_CANCELLED);
              }
              return true;
            };
          }
          loadInput.click();
          terminal.printInfo(Text.CHOOSE_A_FILE_TO_UPLOAD);
        break;
        case 78: //undo
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var result = undoRedoHandler.undo();
          terminal.clear();
          if (!result){
            terminal.printError(Text.NOTHING_TO_UNDO);
          }else{
            terminal.printInfo(Text.OK);
          }
          return true;
        break;
        case 79: //redo
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var result = undoRedoHandler.redo();
          terminal.clear();
          if (!result){
            terminal.printError(Text.NOTHING_TO_REDO);
          }else{
            terminal.printInfo(Text.OK);
          }
          return true;
        break;
        case 80: //selectObject
          var name = splitted[1];
          var objSelection = addedObjects[name];
          var objGroupSelection = objectGroups[name];
          if (!objSelection && !objGroupSelection){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (objSelection){
            selectedAddedObject = objSelection;
            selectedObjectGroup = 0;
            camera.lookAt(objSelection.mesh.position);
          }else if (objGroupSelection){
            selectedObjectGroup = objGroupSelection;
            selectedAddedObject = 0;
            camera.lookAt(objGroupSelection.graphicsGroup.position);
          }
          objectSelectedByCommand = true;
          terminal.printInfo(Text.OBJECT_SELECTED.replace(
              Text.PARAM1, name
          ));
          return true;
        break;
        case 81: //setMass
          var name = splitted[1];
          var mass = parseInt(splitted[2]);
          var addedObject = addedObjects[name];
          var grouppedObject = objectGroups[name];

          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!addedObject && !grouppedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (isNaN(mass)){
            terminal.printError(Text.MASS_MUST_BE_A_NUMBER);
            return true;
          }
          if (mass < 0){
            terminal.printError(Text.MASS_MUST_BE_A_POSITIVE_NUMBER);
            return true;
          }
          if (addedObject){
            addedObject.setMass(mass);
            if (mode == 1 && mass > 0){
              dynamicObjects[addedObject.name] = addedObject;
            }
            if (selectedAddedObject && selectedAddedObject.name == addedObject.name){
              objectManipulationParameters["Mass"] = addedObject.physicsBody.mass;
              omMassController.updateDisplay();
            }
          }else if (grouppedObject){
            grouppedObject.setMass(mass);
            if (mode == 1 && mass > 0){
              dynamicObjectGroups[grouppedObject.name] = grouppedObject;
            }
            if (selectedObjectGroup && selectedObjectGroup.name == grouppedObject.name){
              objectManipulationParameters["Mass"] = grouppedObject.physicsBody.mass;
              omMassController.updateDisplay();
            }
          }
          terminal.printInfo(Text.MASS_SET);
          undoRedoHandler.push();
          return true;
        break;
        case 82: //rotateObject
          var name = splitted[1];
          var axis = splitted[2].toLowerCase();
          var radian;
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          try{
            var evaluationResult = eval(splitted[3]);
            radian = parseFloat(evaluationResult);
          }catch (err){
            terminal.printError(Text.INVALID_EXPRESSION);
            return true;
          }
          var addedObject = addedObjects[name];
          var objectGroup = objectGroups[name];
          if (!addedObject && !objectGroup){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (axis != "x" && axis != "y" && axis != "z" ){
            terminal.printError(Text.AXIS_MUST_BE_ONE_OF_X_Y_Z);
            return true;
          }
          if (isNaN(radian)){
            terminal.printError(Text.RADIAN_MUST_BE_A_NUMBER);
            return true;
          }
          if (addedObject){
            addedObject.rotate(axis, radian);
          }else if (objectGroup){
            objectGroup.rotate(axis, radian);
          }
          terminal.printInfo(Text.OBJECT_ROTATED);
          undoRedoHandler.push();
          return true;
        break;
        case 83: //newScript
          var name = splitted[1];
          if (scripts[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          cliInnerDiv.style.display = "none";
          scriptCreatorDiv.style.display = "block";
          scriptEditorShowing = true;
          $("#cliDivheader").text("Script Editor - "+name);
          scriptCreatorCancelButton.addEventListener("click", function(e){
            scriptEditorShowing = false;
            scriptCreatorDiv.style.display = "none";
            cliInnerDiv.style.display = "block";
            terminal.clear();
            terminal.printError(Text.OPERATION_CANCELLED);
            scriptCreatorTextArea.value = "";
          });
          scriptCreatorSaveButton.onclick = function(){
            scriptEditorShowing = false;
            scriptCreatorDiv.style.display = "none";
            cliInnerDiv.style.display = "block";
            var script = scriptCreatorTextArea.value;
            var scriptObject;
            try{
              scriptObject = new Script(this.name, script);
            }catch (err){
              terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, err.message));
              return true;
            }
            scripts[this.name] = scriptObject;
            terminal.clear();
            terminal.printError(Text.SCRIPT_CREATED);
            scriptCreatorTextArea.value = "";
            undoRedoHandler.push();
          }.bind({name: name});
          scriptCreatorTextArea.focus();
          return true;
        break;
        case 84: //runScript
          var name = splitted[1];
          if (mode == 0){
            terminal.printError(Text.WORKS_ONLY_IN_PREVIEW_MODE);
            return true;
          }
          var script = scripts[name];
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          if (script.isRunning()){
            terminal.printError(Text.SCRIPT_ALREADY_RUNNING);
            return true;
          }
          var script2 = new Script(name, script.script);
          if (script.runAutomatically){
            script2.runAutomatically = script.runAutomatically;
          }else{
            script2.runAutomatically = false;
          }
          if (script.localFilePath){
            script2.localFilePath = script.localFilePath;
            script2.reloadAndStart();
          }else{
            script2.start();
          }
          terminal.printInfo(Text.SCRIPT_STARTED_RUNNING);
          scripts[name] = script2;
          return true;
        break;
        case 85: //stopScript
          var name = splitted[1];
          if (mode == 0){
            terminal.printError(Text.WORKS_ONLY_IN_PREVIEW_MODE);
            return true;
          }
          var script = scripts[name];
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          if (!script.isRunning()){
            terminal.printError(Text.SCRIPT_IS_NOT_RUNNING);
            return true;
          }
          script.stop();
          terminal.printInfo(Text.SCRIPT_STOPPED);
        break;
        case 86: //printScripts
          var count = 0;
          var length = Object.keys(scripts).length;
          terminal.printHeader(Text.SCRIPTS);
          for (var scriptName in scripts){
            var curScript = scripts[scriptName];
            count ++;
            var statusText = "";
            if (curScript.status == SCRIPT_STATUS_ERROR){
              statusText = "ERROR";
            }else if (curScript.status == SCRIPT_STATUS_STOPPED){
              statusText = "STOPPED";
            }else if (curScript.status == SCRIPT_STATUS_STARTED){
              statusText = "STARTED";
            }
            var options = true;
            if (length == count){
              options = false;
            }
            terminal.printInfo(Text.TREE_SCRIPTS.replace(
              Text.PARAM1, curScript.name
            ).replace(
              Text.PARAM2, statusText
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_SCRIPTS_CREATED);
          }
          return true;
        break;
        case 87: //editScript
          var name = splitted[1];
          var script = scripts[name];
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          var localFilePath = script.localFilePath;
          if (localFilePath){
            terminal.printError(Text.THIS_SCRIPT_IS_UPLOADED);
            return true;
          }
          var runAutomatically = script.runAutomatically;
          scriptCreatorTextArea.value = script.script;
          cliInnerDiv.style.display = "none";
          scriptCreatorDiv.style.display = "block";
          scriptEditorShowing = true;
          $("#cliDivheader").text("Script Editor - "+name);
          scriptCreatorCancelButton.addEventListener("click", function(e){
            scriptEditorShowing = false;
            scriptCreatorDiv.style.display = "none";
            cliInnerDiv.style.display = "block";
            terminal.clear();
            terminal.printError(Text.OPERATION_CANCELLED);
            scriptCreatorTextArea.value = "";
          });
          scriptCreatorSaveButton.onclick = function(){
            scriptEditorShowing = false;
            scriptCreatorDiv.style.display = "none";
            cliInnerDiv.style.display = "block";
            var script = scriptCreatorTextArea.value;
            var scriptObject;
            try{
              scriptObject = new Script(this.name, script);
            }catch (err){
              terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, err.message));
              return true;
            }
            scripts[this.name] = scriptObject;
            scripts[this.name].runAutomatically = this.runAutomatically;
            if (this.localFilePath){
              scripts[this.name].localFilePath = this.localFilePath;
            }
            terminal.clear();
            terminal.printInfo(Text.SCRIPT_MODIFIED);
            scriptCreatorTextArea.value = "";
            undoRedoHandler.push();
          }.bind({name: name, runAutomatically: runAutomatically, localFilePath: localFilePath});
          scriptCreatorTextArea.focus();
          return true;
        break;
        case 88: //destroyScript
          var name = splitted[1];
          if (!scripts[name]){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          delete scripts[name];
          terminal.printInfo(Text.SCRIPT_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 89: //translateObject
          // DEPRECATED
        break;
        case 90: //setFog
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var fogColorStr = splitted[1];
          var fogDensityVal = parseFloat(splitted[2]);
          if (isNaN(fogDensityVal)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "fogDensity"));
            return true;
          }
          if (fogDensityVal <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(
              Text.PARAM1, "fogDensity").replace(Text.PARAM2, "0"
            ));
            return true;
          }
          fogDensity = fogDensityVal / 100;
          fogColor = fogColorStr;
          fogActive = true;
          fogColorRGB = new THREE.Color(fogColor);
          terminal.printInfo(Text.FOG_SET);
          undoRedoHandler.push();
          return true;
        break;
        case 91: //removeFog
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          fogActive = false;
          terminal.printInfo(Text.FOG_REMOVED);
          undoRedoHandler.push();
          return true;
        break;
        case 92: //glue
          var groupName = splitted[1];
          if (groupName.toUpperCase() == "NULL"){
            groupName = generateUniqueObjectName();
          }
          var objects = splitted[2];

          if (groupName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }

          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (addedObjects[groupName] || objectGroups[groupName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          try{
            var objectNamesArray = objects.split(",");
            var group = new Object();
            if (objectNamesArray.length == 1){
              terminal.printError(Text.MUST_GLUE_AT_LEAST_2_OBJECTS);
              return true;
            }
            var detachedObjectGroups = new Object();
            for (var i = 0; i<objectNamesArray.length; i++){
              var object = addedObjects[objectNamesArray[i]];
              if (!object){
                var gluedObject = objectGroups[objectNamesArray[i]];
                if (gluedObject){
                  detachedObjectGroups[gluedObject.name] = gluedObject;
                  gluedObject.detach();
                  delete objectGroups[gluedObject.name];
                  for (var gluedObjectName in gluedObject.group){
                    group[gluedObjectName] = gluedObject.group[gluedObjectName];
                  }
                  continue;
                }else{
                  terminal.printError(Text.OBJECT_NR_DOES_NOT_EXIST.replace(
                    Text.PARAM1, (i+1)
                  ));
                  return true;
                }
              }else{
                if (object.physicsBody.velocity.x != 0 || object.physicsBody.velocity.y != 0 ||
                    object.physicsBody.velocity.z != 0){

                  terminal.printError(Text.OBJECT_IN_MOTION.replace(
                    Text.PARAM1, (i+1)
                  ));
                  return true;
                }
              }
              group[objectNamesArray[i]] = object;
            }

            var objectGroup = new ObjectGroup(
              groupName,
              group
            );
            objectGroup.glue();
            objectGroups[groupName] = objectGroup;
            terminal.printInfo(Text.OBJECTS_GLUED_TOGETHER);
            $(datGuiObjectManipulation.domElement).attr("hidden", true);
            selectedAddedObject = 0;
            selectedObjectGroup = 0;
            undoRedoHandler.push();
            return true;
          }catch(err){
            terminal.printError(Text.INVALID_SYNTAX);
            console.error(err);
            return true;
          }
        break;
        case 93: //detach
          var name = splitted[1];
          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objectGroup = objectGroups[name];
          if (!objectGroup){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          objectGroup.detach();
          delete objectGroups[name];
          terminal.printInfo(Text.OBJECT_DETACHED);
          undoRedoHandler.push();
          selectedObjectGroup = 0;
          selectedAddedObject = 0;
          return true;
        break;
        case 94: //mark
          var name = splitted[1];
          var offsetX = parseInt(splitted[2]);
          var offsetY = parseInt(splitted[3]);
          var offsetZ = parseInt(splitted[4]);
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (markedPoints[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNaN(offsetX)){
            terminal.printError(Text.OFFSETX_MUST_BE_A_NUMBER);
            return true;
          }
          if (isNaN(offsetY)){
            terminal.printError(Text.OFFSETY_MUST_BE_A_NUMBER);
            return true;
          }
          if (isNaN(offsetZ)){
            terminal.printError(Text.OFFSETZ_MUST_BE_A_NUMBER);
            return true;
          }
          if (name.length == 0){
            terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
            return true;
          }
          var gridSelectionSize = Object.keys(gridSelections).length;
          if (gridSelectionSize != 1){
            terminal.printError(Text.MUST_HAVE_ONE_GRID_SELECTED);
            return true;
          }
          var selectedGrid = gridSelections[Object.keys(gridSelections)[0]];
          var centerX = selectedGrid.centerX + offsetX;
          var centerY = selectedGrid.centerY + offsetY;
          var centerZ = selectedGrid.centerZ + offsetZ;
          var markedPoint = new MarkedPoint(
            name, centerX, centerY, centerZ
          );
          markedPoint.renderToScreen();
          markedPoints[name] = markedPoint;
          terminal.printInfo(Text.POINT_MARKED);
          selectedGrid.toggleSelect(false, false, false, true);
          undoRedoHandler.push();
        break;
        case 95: //unmark
          var name = splitted[1];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var markedPoint = markedPoints[name];
          if (!markedPoint){
            terminal.printError(Text.NO_SUCH_POINT);
            return true;
          }
          markedPoint.destroy();
          delete markedPoints[name];
          terminal.printError(Text.POINT_UNMARKED);
          undoRedoHandler.push();
          return true;
        break;
        case 96: //printMarkedPoints
          var count = 0;
          var length = Object.keys(markedPoints).length;
          terminal.printHeader(Text.MARKED_POINTS);
          for (var markedPointName in markedPoints){
            count++;
            var curPoint = markedPoints[markedPointName];
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE_POINT.replace(
              Text.PARAM1, curPoint.name
            ).replace(
              Text.PARAM2, curPoint.x
            ).replace(
              Text.PARAM3, curPoint.y
            ).replace(
              Text.PARAM4, curPoint.z
            ), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_MARKED_POINTS);
            return true;
          }
        break;
        case 97: //toggleMarkedPoints
          var count = 0;
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          for (var markedPointName in markedPoints){
            count++;
            if (markedPoints[markedPointName].isHidden){
              markedPoints[markedPointName].show();
            }else{
              markedPoints[markedPointName].hide();
            }
          }
          if (count == 0){
            terminal.printError(Text.NO_MARKED_POINTS);
            return true;
          }
          terminal.printInfo(Text.MARKED_POINTS_TOGGLED);
          undoRedoHandler.push();
          return true;
        break;
        case 98: //runAutomatically
          var scriptName = splitted[1];
          var script = scripts[scriptName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          script.runAutomatically = true;
          terminal.printInfo(Text.OK);
          undoRedoHandler.push();
          return true;
        break;
        case 99: //uploadScript
          var scriptName = splitted[1];
          var filePath = "scripts/"+splitted[2];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (scripts[scriptName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          $.ajax({
            url: filePath,
            converters: {
              'text script': function (text){
                return text;
              }
            },
            success: function(data){
              try{
                var script = new Script(scriptName, data);
              }catch (err){
                terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, err.message));
                return true;
              }
              script.localFilePath = filePath;
              scripts[scriptName] = script;
              terminal.printInfo(Text.SCRIPT_UPLOADED);
            }
          }).fail(function(){
            terminal.printError(Text.FAILED_TO_LOAD_SCRIPT.replace(
              Text.PARAM1, scriptName
            ).replace(
              Text.PARAM2, filePath
            ))
          });
        break;
        case 100: //runManually
          var scriptName = splitted[1];
          var script = scripts[scriptName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          script.runAutomatically = false;
          terminal.printInfo(Text.OK);
          undoRedoHandler.push();
          return true;
        break;
        case 101: //physicsWorkerMode
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var state = splitted[1].toUpperCase();
          if (state != "ON" && state != "OFF"){
            terminal.printError(Text.PHYSICS_WORKER_MODE_MUST_BE_ON_OR_OFF);
            return true;
          }
          if (state == "ON"){
            if (!WORKERS_SUPPORTED){
              terminal.printError(Text.WORKERS_ARE_NOT_SUPPORTED);
              return true;
            }
            if (PHYSICS_WORKER_ENABLED){
              terminal.printError(Text.PHYSICS_WORKER_MODE_IS_ALREADY_ENABLED);
              return true;
            }
            PHYSICS_WORKER_ENABLED = true;
            terminal.printInfo(Text.PHYSICS_WORKER_MODE.replace(
              Text.PARAM1, Text.ENABLED
            ));
          }else if (state == "OFF"){
            if (!PHYSICS_WORKER_ENABLED){
              terminal.printError(Text.PHYSICS_WORKER_MODE_IS_ALREADY_DISABLED);
              return true;
            }
            PHYSICS_WORKER_ENABLED = false;
            terminal.printInfo(Text.PHYSICS_WORKER_MODE.replace(
              Text.PARAM1, Text.DISABLED
            ));
          }
          undoRedoHandler.push();
          return true;
        break;
        case 102: //printPhysicsWorkerMode
          var modeText = "";
          if (PHYSICS_WORKER_ENABLED){
            modeText = Text.ENABLED;
          }else{
            modeText = Text.DISABLED;
          }
          terminal.printInfo(Text.PHYSICS_WORKER_MODE.replace(
            Text.PARAM1, modeText
          ));
          return true;
        break;
        case 103: //explain
          var functionName = splitted[1].toUpperCase();
          var functionExplanation = Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+functionName];
          if (functionExplanation){
            var normalCase = "";
            for (var i = 0; i<ROYGBIV.functionNames.length; i++){
              if (functionName == ROYGBIV.functionNames[i].toUpperCase()){
                normalCase = ROYGBIV.functionNames[i];
              }
            }
            terminal.printHeader(Text.PARAM_WITH_DOTS.replace(Text.PARAM1, normalCase));
            terminal.printInfo(Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+functionName]);
          }else{
            terminal.printError(Text.NO_SUCH_FUNCTION);
            return true;
          }
        break;
        case 104: //printScriptingFunctions
          terminal.printHeader(Text.FUNCTIONS_LIST);
          for (var i = 0; i<ROYGBIV.functionNames.length; i++){
            terminal.printInfo(
              Text.TREE.replace(
                Text.PARAM1, ROYGBIV.functionNames[i]
              ), (i != ROYGBIV.functionNames.length - 1)
            );
          }
          return true;
        break;
        case 105: //printPerformance
          // DEPRECATED
        break;
        case 106: //search
          var textToSearch = splitted[1].toLowerCase();
          var possibleMatches = new Object();
          var possibleAPIMathces = new Object();
          var possibleMatchCount = 0;
          for (var i = 0; i<commands.length; i++){
            var i2 = 0;
            var found = false;
            while (i2 < deprecatedCommandIndices.length && !found){
              if (deprecatedCommandIndices[i2] == i){
                found = true;
              }
              i2++;
            }
            var command = commands[i];
            if (command.toLowerCase().indexOf(textToSearch) !== -1 && !found){
              possibleMatches[command] = i;
              possibleMatchCount ++;
            }else if (commandInfo[i].toLowerCase().indexOf(textToSearch) !== -1 && !found){
              possibleMatches[command] = i;
              possibleMatchCount ++;
            }
          }
          for (var i = 0; i<ROYGBIV.functionNames.length; i++){
            var functionName = ROYGBIV.functionNames[i];
            if (functionName.toLowerCase().indexOf(textToSearch.toLowerCase()) !== -1){
              possibleAPIMathces[functionName] = true;
              possibleMatchCount ++;
            }else {
              var functionInfo = Text[Text.ROYGBIV_SCRIPTING_API_PREFIX+functionName.toUpperCase()];
              if (functionInfo && functionInfo.toLowerCase().indexOf(textToSearch.toLowerCase()) !== -1){
                possibleAPIMathces[functionName] = true;
                possibleMatchCount ++;
              }
            }
          }
          if (possibleMatchCount == 0){
            terminal.printError(Text.NO_COMMAND_FOUND);
          }else{
            var commandInfosSorted = [];
            var commandNamesSorted = [];
            var apiMatchesSorted = [];
            for(var commandName in possibleMatches){
              commandNamesSorted.push(commandName);
              commandInfosSorted.push(commandInfo[possibleMatches[commandName]]);
            }
            for (var functionName in possibleAPIMathces){
              apiMatchesSorted.push(functionName);
            }
            commandNamesSorted.sort();
            commandInfosSorted.sort();
            apiMatchesSorted.sort();
            terminal.help(commandInfosSorted, commandNamesSorted, apiMatchesSorted);
          }
          return true;
        break;
        case 107: //rescaleTexture
          var textureName = splitted[1];
          var scale = splitted[2];
          var newTextureName = splitted[3];
          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (newTextureName.indexOf(PIPE) != -1){
            terminal.printError(Text.TEXTURE_NAME_NOT_VALID);
            return true;
          }
          var texture = textures[textureName];
          if (typeof texture == "undefined"){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }else{
            if (!(texture instanceof THREE.Texture)){
              terminal.printError(Text.TEXTURE_NOT_READY);
              return true;
            }
          }
          if (!(typeof textures[newTextureName] == "undefined")){
            terminal.printError(Text.TEXTURE_NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNaN(scale)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "scale parameter"));
            return true;
          }
          if (texture.image.width * scale < 1 || texture.image.height * scale < 1){
            terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
            return true;
          }
          var stdCanvas = document.createElement("canvas");
          stdCanvas.width = texture.image.width;
          stdCanvas.height = texture.image.height;
          var stdContext = stdCanvas.getContext("2d");
          stdContext.drawImage(texture.image, 0, 0, stdCanvas.width, stdCanvas.height);
          var resizedCanvas = new TextureMerger().rescale(stdCanvas, scale);
          var resizedTexture = new THREE.CanvasTexture(resizedCanvas);
          resizedTexture.wrapS = texture.wrapS;
          resizedTexture.wrapT = texture.wrapT;
          resizedTexture.repeat.set(texture.repeat.x, texture.repeat.y);
          resizedTexture.isLoaded = texture.isLoaded;
          resizedTexture.fromUploadedImage = texture.fromUploadedImage;
          textures[newTextureName] = resizedTexture;
          textureCache[newTextureName] = resizedTexture.clone();
          textureURLs[newTextureName] = textureURLs[textureName];
          modifiedTextures[newTextureName] = resizedTexture.image.toDataURL();
          terminal.printInfo(Text.TEXTURE_RESCALED);
          undoRedoHandler.push();
          return true;
        break;
        case 108: //rescaleTexturePack
          var texturePackName = splitted[1];
          var scale = splitted[2];
          var newTexturePackName = splitted[3];
          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!texturePacks[texturePackName]){
            terminal.printError(Text.NO_SUCH_TEXTURE_PACK);
            return true;
          }
          if (isNaN(scale)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "scale parameter"));
            return true;
          }
          if (texturePacks[newTexturePackName]){
            terminal.printError(Text.TEXTURE_PACK_NAME_MUST_BE_UNIQUE);
            return true;
          }
          var refTexturePack = texturePacks[texturePackName];
          if (refTexturePack.hasDiffuse){
            var wDiffuse = refTexturePack.diffuseTexture.image.width;
            var hDiffuse = refTexturePack.diffuseTexture.image.height;
            if (wDiffuse * scale < 1 || hDiffuse * scale < 1){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          if (refTexturePack.hasAlpha){
            var wAlpha = refTexturePack.alphaTexture.image.width;
            var hAlpha = refTexturePack.alphaTexture.image.height;
            if (wAlpha * scale < 1 || hAlpha * scale < 1){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          if (refTexturePack.hasAO){
            var wAO = refTexturePack.aoTexture.image.width;
            var hAO = refTexturePack.aoTexture.image.height;
            if (wAO * scale < 1 || hAO * scale < 1){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          if (refTexturePack.hasEmissive){
            var wEmissive = refTexturePack.emissiveTexture.image.width;
            var hEmissive = refTexturePack.emissiveTexture.image.height;
            if (wEmissive * scale < 1 || hEmissive * scale < 1){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          if (refTexturePack.hasNormal){
            var wNormal = refTexturePack.normalTexture.image.width;
            var hNormal = refTexturePack.normalTexture.image.height;
            if (wNormal * scale < 1 || hNormal * scale < 1 ){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          if (refTexturePack.hasSpecular){
            var wSpecular = refTexturePack.specularTexture.image.width;
            var hSpecular = refTexturePack.specularTexture.image.height;
            if (wSpecular * scale < 1 || hSpecular * scale < 1){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          if (refTexturePack.hasHeight){
            var wHeight = refTexturePack.heightTexture.image.width;
            var hHeight = refTexturePack.heightTexture.image.height;
            if (wHeight * scale < 1 || hHeight * scale < 1){
              terminal.printError(Text.TEXTURE_SIZE_TOO_SMALL);
              return true;
            }
          }
          var rescaledTexturePack = new TexturePack(
            newTexturePackName,
            refTexturePack.directoryName,
            refTexturePack.fileExtension,
            null, null, refTexturePack
          );
          rescaledTexturePack.rescale(scale);
          texturePacks[newTexturePackName] = rescaledTexturePack;
          rescaledTexturePack.refTexturePackName = refTexturePack.name;
          terminal.printInfo(Text.TEXTURE_PACK_RESCALED);
          undoRedoHandler.push();
          return true;
        break;
        case 109: //destroyImage
          var imgName = splitted[1];
          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!uploadedImages[imgName]){
            terminal.printError(Text.NO_SUCH_IMAGE);
            return true;
          }
          for (var textureName in textureURLs){
            if (textureURLs[textureName] == imgName){
              terminal.printError(Text.IMAGE_USED_IN_TEXTURE.replace(Text.PARAM1, textureName));
              return true;
            }
          }
          delete uploadedImages[imgName];
          terminal.printInfo(Text.IMAGE_DESTROYED);
          undoRedoHandler.push();
          return true;
        break;
        case 110: //setBlending
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objectName = splitted[1];
          var blendingMode = splitted[2].toUpperCase();
          var obj = addedObjects[objectName];
          if (!obj){
            obj = objectGroups[objectName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          var blendingModeInt = 0;
          if (blendingMode == "NO_BLENDING"){
            blendingModeInt = NO_BLENDING;
          }else if (blendingMode == "NORMAL_BLENDING"){
            blendingModeInt = NORMAL_BLENDING;
          }else if (blendingMode == "ADDITIVE_BLENDING"){
            blendingModeInt = ADDITIVE_BLENDING;
          }else if (blendingMode == "SUBTRACTIVE_BLENDING"){
            blendingModeInt = SUBTRACTIVE_BLENDING;
          }else if (blendingMode == "MULTIPLY_BLENDING"){
            blendingModeInt = MULTIPLY_BLENDING;
          }else{
            terminal.printError(Text.BLENDING_MODE_MUST_BE_ONE_OF);
            return true;
          }
          if (obj instanceof AddedObject || obj instanceof ObjectGroup){
            obj.setBlending(blendingModeInt);
          }
          terminal.printInfo(Text.BLENDING_MODE_SET_TO.replace(Text.PARAM1, blendingMode));
          undoRedoHandler.push();
          return true;
        break;
        case 111: //about
          terminal.handleAboutCommand();
          return true;
        break;
        case 112: //resetKeyboardBuffer
          keyboardBuffer = new Object();
          terminal.printInfo(Text.KEYBOARD_BUFFER_RESET);
          return true;
        break;
        case 113: //setWorldLimits
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var minX = parseInt(splitted[1]);
          var minY = parseInt(splitted[2]);
          var minZ = parseInt(splitted[3]);
          var maxX = parseInt(splitted[4]);
          var maxY = parseInt(splitted[5]);
          var maxZ = parseInt(splitted[6]);
          if (isNaN(minX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "minX"));
            return true;
          }
          if (isNaN(minY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "minY"));
            return true;
          }
          if (isNaN(minZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "minZ"));
            return true;
          }
          if (isNaN(maxX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxX"));
            return true;
          }
          if (isNaN(maxY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxY"));
            return true;
          }
          if (isNaN(maxZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxZ"));
            return true;
          }
          if (maxX <= minX){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxX").replace(
              Text.PARAM2, "minX"
            ));
            return true;
          }
          if (maxY <= minY){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxY").replace(
              Text.PARAM2, "minY"
            ));
            return true;
          }
          if (maxZ <= minZ){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxZ").replace(
              Text.PARAM2, "minZ"
            ));
            return true;
          }
          if ((minX % BIN_SIZE) || (minY % BIN_SIZE) || (minZ % BIN_SIZE) || (maxX % BIN_SIZE) || (maxY % BIN_SIZE) || (maxZ % BIN_SIZE)){
            terminal.printError(Text.PARAMETERS_MUST_BE_DIVISABLE_BY.replace(Text.PARAM1, BIN_SIZE));
            return true;
          }
          var lowerBound = new THREE.Vector3(minX, minY, minZ);
          var upperBound = new THREE.Vector3(maxX, maxY, maxZ);
          LIMIT_BOUNDING_BOX = new THREE.Box3(lowerBound, upperBound);
          terminal.printInfo(Text.OCTREE_LIMIT_SET);
          undoRedoHandler.push();
          return true;
        break;
        case 114: //setBinSize
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var binSize = parseInt(splitted[1]);
          if (isNaN(binSize)){
            terminal.printError(Text.BIN_SIZE_MUST_BE_A_NUMBER);
            return true;
          }
          if (binSize <= 1){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(
              Text.PARAM1, "Bin size"
            ).replace(
              Text.PARAM2, "1"
            ));
            return true;
          }
          var minX = LIMIT_BOUNDING_BOX.min.x;
          var minY = LIMIT_BOUNDING_BOX.min.y;
          var minZ = LIMIT_BOUNDING_BOX.min.z;
          var maxX = LIMIT_BOUNDING_BOX.max.x;
          var maxY = LIMIT_BOUNDING_BOX.max.y;
          var maxZ = LIMIT_BOUNDING_BOX.max.z;
          if ((minX % binSize) || (minY % binSize) || (minZ % binSize) || (maxX % binSize) || (maxY % binSize) || (maxZ % binSize)){
            terminal.printError(Text.WORLD_LIMITS_MUST_BE_DIVISABLE_BY_BIN_SIZE);
            return true;
          }
          BIN_SIZE = binSize;
          terminal.printInfo(Text.BIN_SIZE_SET);
          undoRedoHandler.push();
          return true;
        break;
        case 115: //printWorldLimits
          terminal.printHeader(Text.WORLD_LIMITS);
          terminal.printInfo(Text.COORD_TREE.replace(
            Text.PARAM1, Text.MIN
          ).replace(
            Text.PARAM2, LIMIT_BOUNDING_BOX.min.x
          ).replace(
            Text.PARAM3, LIMIT_BOUNDING_BOX.min.y
          ).replace(
            Text.PARAM4, LIMIT_BOUNDING_BOX.min.z
          ), true);
          terminal.printInfo(Text.COORD_TREE.replace(
            Text.PARAM1, Text.MAX
          ).replace(
            Text.PARAM2, LIMIT_BOUNDING_BOX.max.x
          ).replace(
            Text.PARAM3, LIMIT_BOUNDING_BOX.max.y
          ).replace(
            Text.PARAM4, LIMIT_BOUNDING_BOX.max.z
          ));
          return true;
        break;
        case 116: //printBinSize
          terminal.printHeader(Text.BIN_SIZE);
          terminal.printInfo(Text.TREE.replace(Text.PARAM1, BIN_SIZE));
          return true;
        break;
        case 117: //particleCollisionWorkerMode
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var selection = splitted[1].toUpperCase();
          var modeText = "";
          if (selection != "ON" && selection != "OFF"){
            terminal.printError(Text.PARTICLE_COLLISION_WORKER_MODE_MUST_BE_ON_OR_OFF);
            return true;
          }
          if (selection == "ON"){
            if (!WORKERS_SUPPORTED){
              terminal.printError(Text.WORKERS_ARE_NOT_SUPPORTED);
              return true;
            }
            if (COLLISION_WORKER_ENABLED){
              terminal.printError(Text.PARTICLE_COLLISION_ALREADY_ENABLED);
              return true;
            }
            COLLISION_WORKER_ENABLED = true;
            modeText = Text.ENABLED;
          }else if (selection == "OFF"){
            if (!COLLISION_WORKER_ENABLED){
              terminal.printError(Text.PARTICLE_COLLISION_ALREADY_DISABLED);
              return true;
            }
            COLLISION_WORKER_ENABLED = false;
            modeText = Text.DISABLED;
          }
          terminal.printInfo(Text.PARTICLE_COLLISION_WORKER_MODE.replace(Text.PARAM1, modeText));
          undoRedoHandler.push();
          return true;
        break;
        case 118: //printParticleCollisionWorkerMode
          var modeText = "";
          if (COLLISION_WORKER_ENABLED){
            modeText = Text.ENABLED;
          }else{
            modeText = Text.DISABLED;
          }
          terminal.printInfo(Text.PARTICLE_COLLISION_WORKER_MODE.replace(
            Text.PARAM1, modeText
          ));
          return true;
        break;
        case 119: //particleSystemCollisionWorkerMode
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var selection = splitted[1].toUpperCase();
          if (selection != "ON" && selection != "OFF"){
            terminal.printError(Text.PARTICLE_SYSTEM_COLLISION_WORKER_MODE_MUST_BE_ON_OR_OFF);
            return true;
          }
          var modeText = "";
          if (selection == "ON"){
            if (!WORKERS_SUPPORTED){
              terminal.printError(Text.WORKERS_ARE_NOT_SUPPORTED);
              return true;
            }
            if (PS_COLLISION_WORKER_ENABLED){
              terminal.printError(Text.PARTICLE_SYSTEM_COLLISION_ALREADY_ENABLED);
              return true;
            }
            PS_COLLISION_WORKER_ENABLED = true;
            modeText = Text.ENABLED;
          }else if (selection == "OFF"){
            if (!PS_COLLISION_WORKER_ENABLED){
              terminal.printError(Text.PARTICLE_SYSTEM_COLLISION_ALREADY_DISABLED);
              return true;
            }
            PS_COLLISION_WORKER_ENABLED = false;
            modeText = Text.DISABLED;
          }
          terminal.printInfo(Text.PARTICLE_SYSTEM_COLLISION_WORKER_MODE.replace(Text.PARAM1, modeText));
          undoRedoHandler.push();
          return true;
        break;
        case 120: //printParticleSystemCollisionWorkerMode
          var modeText = "";
          if (PS_COLLISION_WORKER_ENABLED){
            modeText = Text.ENABLED;
          }else{
            modeText = Text.DISABLED;
          }
          terminal.printInfo(Text.PARTICLE_SYSTEM_COLLISION_WORKER_MODE.replace(Text.PARAM1, modeText));
          return true;
        break;
        case 121: //logFrameDrops
          if (mode == 0){
            terminal.printError(Text.WORKS_ONLY_IN_PREVIEW_MODE);
            return true;
          }
          if (LOG_FRAME_DROP_ON){
            terminal.printError(Text.FRAME_DROP_ALREADY);
            return true;
          }
          LOG_FRAME_DROP_ON = true;
          LOG_FRAME_DROP_CTR = 0;
          FRAME_DROP_COUNT = 0;
          terminal.printInfo(Text.FRAME_DROP_STARTED);
          console.log("[*] Frame rates are being recorded. Results will be printed after a minute.");
          return true;
        break;
        case 122: //addPaddingToTexture
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var textureName = splitted[1];
          var padding = parseFloat(splitted[2]);
          var newTextureName = splitted[3];
          var srcTexture = textures[textureName];
          if (!srcTexture){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (textures[newTextureName]){
            terminal.printError(Text.TEXTURE_NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNaN(padding)){
            terminal.printError(Text.PADDING_MUST_BE_A_NUMBER);
            return true;
          }
          if (padding <= 0){
            terminal.printError(Text.PADDING_MUST_BE_POSITIVE);
            return true;
          }
          var srcWidth = srcTexture.image.width;
          var srcHeight = srcTexture.image.height;
          var newWidth = srcWidth + (2 * padding);
          var newHeight = srcHeight + (2 * padding);
          var tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = newWidth;
          tmpCanvas.height = newHeight;
          tmpCanvas.getContext("2d").drawImage(
            srcTexture.image, 0, 0, srcWidth, srcHeight, padding, padding, srcWidth, srcHeight
          );
          var newTexture = new THREE.CanvasTexture(tmpCanvas);
          newTexture.isLoaded = srcTexture.isLoaded;
          newTexture.fromUploadedImage = srcTexture.fromUploadedImage;
          textures[newTextureName] = newTexture;
          textureCache[newTextureName] = newTexture.clone();
          textureURLs[newTextureName] = textureURLs[textureName];
          newTexture.paddingInfo = padding+","+srcWidth+","+srcHeight;
          newTexture.hasPadding = true;
          modifiedTextures[newTextureName] = tmpCanvas.toDataURL();
          terminal.printInfo(Text.PADDING_ADDED_TO_TEXTURE);
          undoRedoHandler.push();
          return true;
        break;
        case 123: //newSphere
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sphereName = splitted[1];
          var materialName = splitted[2];
          var radius = parseFloat(splitted[3]);

          if (sphereName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
          if (sphereName.toUpperCase() == "NULL"){
            sphereName = generateUniqueObjectName();
          }
          if (addedObjects[sphereName] || objectGroups[sphereName]){
              terminal.printError(Text.NAME_MUST_BE_UNIQUE);
              return true;
          }
          if (disabledObjectNames[sphereName]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
            return true;
          }
          var material = materials[materialName];
          if (materialName.toUpperCase() != "NULL"){
            if (!material){
              terminal.printError(Text.NO_SUCH_MATERIAL);
              return true;
            }
          }else{
            if (defaultMaterialType == "BASIC"){
              material = new THREE.MeshBasicMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              material.roygbivMaterialName = "NULL_BASIC";
            }else if (defaultMaterialType == "PHONG"){
              material = new THREE.MeshPhongMaterial({
                color: "white",
                side: THREE.DoubleSide,
                wireframe: false
              });
              material.roygbivMaterialName = "NULL_PHONG";
            }
          }
          if (isNaN(radius)){
            terminal.printError(Text.RADIUS_MUST_BE_A_NUMBER);
            return true;
          }
          if (radius == 0){
            terminal.printError(Text.RADIUS_MUST_BE_DIFFERENT_THAN_ZERO);
            return true;
          }

          var gridSelectionSize = Object.keys(gridSelections).length;
          if (gridSelectionSize != 1 && gridSelectionSize != 2){
            terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
            return true;
          }

          var selections = [];
          for (var gridName in gridSelections){
            selections.push(gridSelections[gridName]);
          }

          if (selections.length == 2){
            var grid1 = selections[0];
            var grid2 = selections[1];
            if (grid1.parentName != grid2.parentName){
              terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
              return true;
            }
          }

          var gridSystemName = selections[0].parentName;
          var gridSystem = gridSystems[gridSystemName];

          gridSystem.newSphere(sphereName, material, radius, selections);
          terminal.printInfo(Text.SPHERE_CREATED);
          undoRedoHandler.push();
          return true;
        break;
        case 124: //printFogInfo
          if (fogActive){
            terminal.printHeader(Text.FOG_INFO);
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, "Fog color").replace(Text.PARAM2, fogColor), true);
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, "Fog density").replace(Text.PARAM2, fogDensity * 100));
          }else{
            terminal.printInfo(Text.FOG_IS_NOT_SET);
          }
          return true;
        break;
        case 125: //applyDisplacementMap
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          var txtName = splitted[2];
          var scale = parseFloat(splitted[3]);
          var bias = parseFloat(splitted[4]);
          var obj = addedObjects[objName];
          if (!obj){
            if (objectGroups[objName]){
              terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
              return true;
            }
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          var dispTexture = textures[txtName];
          if (typeof dispTexture == UNDEFINED){
            terminal.printError(Text.NO_SUCH_TEXTURE);
            return true;
          }
          if (!(dispTexture instanceof THREE.Texture)){
            terminal.printError(Text.TEXTURE_NOT_READY);
            return true;
          }
          if (isNaN(scale)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "scale"));
            return true;
          }
          if (isNaN(bias)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "bias"));
            return true;
          }
          obj.applyDisplacementMap(dispTexture, txtName, scale, bias);
          terminal.printInfo(Text.DISPLACEMENT_MAP_APPLIED);
          undoRedoHandler.push();
          return true;
        break;
        case 126: //setSlipperiness
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          var onOff = splitted[2].toUpperCase();
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          if (onOff != "ON" && onOff != "OFF"){
            terminal.printError(Text.SLIPPERINESS_STATE_MUST_BE_ON_OR_OFF);
            return true;
          }
          var slipperinessState = true;
          if (onOff == "OFF"){
            slipperinessState = false;
          }
          if (obj instanceof AddedObject){
            if (slipperinessState){
              if (obj.metaData.isSlippery){
                terminal.printError(Text.OBJECT_IS_ALREADY_SLIPPERY);
                return true;
              }
            }else{
              if (!obj.metaData.isSlippery){
                terminal.printError(Text.OBJECT_IS_ALREADY_NOT_SLIPPERY);
                return true;
              }
            }
          }else if (obj instanceof ObjectGroup){
            if (slipperinessState){
              if (obj.isSlippery){
                terminal.printError(Text.OBJECT_IS_ALREADY_SLIPPERY);
                return true;
              }
            }else{
              if (!obj.isSlippery){
                terminal.printError(Text.OBJECT_IS_ALREADY_NOT_SLIPPERY);
                return true;
              }
            }
          }
          obj.setSlippery(slipperinessState);
          terminal.printError(Text.SLIPPERINESS_ADJUSTED);
          undoRedoHandler.push();
          return true;
        break;
      }
      return true;
    }catch(err){
      terminal.printError(err);
      console.error(err);
      return true;
    }

}

function generateUniqueObjectName(){
  var generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
  var nameFound = true;
  while (nameFound){
    var nameInAddedObjects = !(typeof addedObjects[generatedName] == "undefined");
    var nameInGluedObjects = !(typeof objectGroups[generatedName] == "undefined");
    var nameInChildObjects = false;
    for (var gluedObjectName in objectGroups){
      var group = objectGroups[gluedObjectName].group;
      if (!(typeof group[generatedName] == "undefined")){
        nameInChildObjects = true;
      }
    }
    nameFound = (nameInAddedObjects || nameInGluedObjects || nameInChildObjects);
    if (nameFound){
      console.error("[*] Object name generation collision happened: "+generatedName);
      generatedName = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    }
  }
  return generatedName;
}

function processNewGridSystemCommand(name, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, axis, isSuperposed, slicedGrid){
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

  return true;
}
