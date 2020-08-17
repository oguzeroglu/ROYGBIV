function parseCommand(userInput){
  var result = parse(userInput);
  if (!result){
    terminal.printError(Text.COMMAND_NOT_FOUND);
  }
  guiHandler.afterObjectSelection();
}

function parse(input){
    try{
      var splitted = input.trim().split(" ");
      var commandIndex;
      var found = false;
      for (var i=0; i<commandDescriptor.commands.length; i++){
        if (commandDescriptor.commands[i].toLowerCase() == splitted[0].toLowerCase()){
          found = true;
          commandIndex = i;
        }
      }
      if (!found){
        return false;
      }
      for (var i = 0; i<commandDescriptor.deprecatedCommandIndices.length; i++){
        if (commandDescriptor.deprecatedCommandIndices[i] == commandIndex){
          terminal.printError(Text.COMMAND_DEPRECATED);
          return true;
        }
      }
      if (splitted.length -1 != commandDescriptor.commandArgumentsExpectedCount[commandIndex]){
        terminal.printFunctionArguments(commandIndex);
        return true;
      }
      switch (commandIndex){
        case 0: //help
          var commandInfos = [];
          var commandsSorted = [];
          for (var i=0; i<commandDescriptor.commandInfo.length; i++){
            var found = false;
            var i2 = 0;
            while (i2 < commandDescriptor.deprecatedCommandIndices.length && !found){
              if (commandDescriptor.deprecatedCommandIndices[i2] == i){
                found = true;
              }
              i2++;
            }
            if (!found){
              commandInfos.push(commandDescriptor.commandInfo[i]);
              commandsSorted.push(commandDescriptor.commands[i]);
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

          var result =  processNewGridSystemCommand(name, sizeX, sizeZ, centerX, centerY, centerZ, color, cellSize, axis, false);
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
                Text.PARAM1, gs + " ["+gridSystems[gs].registeredSceneName+"]"));
            }else{
              terminal.printInfo(Text.TREE.replace(
                Text.PARAM1, gs + " ["+gridSystems[gs].registeredSceneName+"]"), true);
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!gridSystems[name]){
            terminal.printError(Text.NO_SUCH_GRID_SYSTEM);
          }else{
            for (var wcName in wallCollections){
              var gsNames = wallCollections[wcName].gridSystemNames;
              for (var i = 0; i<gsNames.length; i++){
                if (gsNames[i] == name){
                  terminal.printError(Text.GS_ATTACHED_TO_A_WC);
                  return true;
                }
              }
            }
            sceneHandler.onGridSystemDeletion(gridSystems[name]);
            gridSystems[name].destroy();
            if (!jobHandlerWorking){
              refreshRaycaster(Text.GRID_SYSTEM_DESTROYED);
            }else{
              jobHandlerRaycasterRefresh = true;
            }
          }
        break;
        case 7: //printKeyboardInfo
          terminal.printHeader(Text.CONTROLS);
          for (var i=0; i<commandDescriptor.keyboardInfo.length; i++){
            if (i != commandDescriptor.keyboardInfo.length -1){
              terminal.printInfo(
                Text.TREE.replace(Text.PARAM1, commandDescriptor.keyboardInfo[i]),
                true
              );
            }else{
              terminal.printInfo(
                Text.TREE.replace(Text.PARAM1, commandDescriptor.keyboardInfo[i])
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
        break;
        case 10: //selectAllGrids
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var gsName = splitted[1];
          if (!(gsName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var gs = gridSystems[gsName];
          if (!gs){
            terminal.printError(Text.NO_SUCH_GRID_SYSTEM);
            return true;
          }
          if (gs.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.GRID_SYSTEM_NOT_IN_SCENE);
            return true;
          }
          if (Object.keys(gs.grids).length > 100){
            terminal.printError(Text.TOO_MANY_GRIDS);
            return true;
          }
          var ctr = 0;
          for (var gridNum in gs.grids){
            var grid = gs.grids[gridNum];
            if (!grid.selected){
              ctr ++;
              grid.toggleSelect(false, false, false, true);
            }
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.X_GRIDS_SELECTED.replace(Text.PARAM1, ctr));
          }
          return true;
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

          var result = processNewGridSystemCommand(name, croppedGridSystem.sizeX, croppedGridSystem.sizeZ, croppedGridSystem.centerX, croppedGridSystem.centerY, croppedGridSystem.centerZ, outlineColor, cellSize, croppedGridSystem.axis, false);
          return result;
        break;
        case 13: //switchView
          modeSwitcher.switchMode();
          return true;
        break;
        case 14: //newBasicMaterial
          var name = splitted[1];
          var color = splitted[2];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (name.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (name == "NULL_BASIC"){
            terminal.printError(Text.NAME_RESERVED);
            return true;
          }

          if (materials[name]){
            terminal.printError(Text.MATERIAL_NAME_MUST_BE_UNIQUE);
            return true;
          }
          var basicMaterial = new BasicMaterial({
            name: name,
            color: color,
            alpha: 1
          })
          materials[name] = basicMaterial;
          terminal.printInfo(Text.MATERIAL_CREATED);
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
            if (material instanceof BasicMaterial){
              terminal.printInfo(Text.BASIC_MATERIAL_INFO_TREE.replace(
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (!jobHandlerWorking){
            terminal.printInfo(Text.MATERIAL_DESTROYED);
          }
          return true;
        break;
        case 17: //newSurface
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var selectedGrid1, selectedGrid2;
          if (!jobHandlerSelectedGrid){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 2 && gridSelectionSize != 1){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
            selectedGrid1 = gridSelections[Object.keys(gridSelections)[0]];
            selectedGrid2 = undefined;
            if (gridSelectionSize == 2){
              selectedGrid2 = gridSelections[Object.keys(gridSelections)[1]];
            }
            if (gridSelectionSize == 2){
              if (selectedGrid1.parentName != selectedGrid2.parentName){
                terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
                return true;
              }
            }
          }else{
            selectedGrid1 = jobHandlerSelectedGrid;
          }
          var selectedGridSystemName = selectedGrid1.parentName;
          var materialName = splitted[2];
          var selectedMaterial = materials[materialName];
          if (materialName == "*"){
            selectedMaterial = pickRandomMaterial();
          }else{
            if (materialName.toUpperCase() != "NULL"){
              if (!selectedMaterial){
                terminal.printError(Text.NO_SUCH_MATERIAL);
                return true;
              }
            }else{
              if (defaultMaterialType == "BASIC"){
                selectedMaterial = new BasicMaterial({
                  name: "NULL_BASIC",
                  color: "white",
                  alpha: 1
                });
              }
            }
          }
          var objectName = splitted[1];
          if (objectName.toUpperCase() == "NULL"){
            objectName = generateUniqueObjectName();
          }
          if (!checkIfNameUnique(objectName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          if (objectName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
          gridSystems[selectedGridSystemName].newSurface(objectName, selectedGrid1, selectedGrid2, selectedMaterial);
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.OBJECT_ADDED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
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
              Text.PARAM2, objectName + " ["+addedObject.registeredSceneName+"]"
            ).replace(
              Text.PARAM3, addedObject.mesh.position.x
            ).replace(
              Text.PARAM4, addedObject.mesh.position.y
            ).replace(
              Text.PARAM5, addedObject.mesh.position.z
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
              Text.PARAM1, objectName + " ["+grouppedObject.registeredSceneName+"]"
            ).replace(
              Text.PARAM2, childStr
            ).replace(
              Text.PARAM3, grouppedObject.mesh.position.x
            ).replace(
              Text.PARAM4, grouppedObject.mesh.position.y
            ).replace(
              Text.PARAM5, grouppedObject.mesh.position.z
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
            Text.PARAM1, objectName + " ["+object.registeredSceneName+"]"
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
          if (object.material instanceof BasicMaterial){
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
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!object && !objectGroup){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          if (object){
            object.destroy(true);
            sceneHandler.onAddedObjectDeletion(object);
            delete addedObjects[objectName];
          }else if (objectGroup){
            objectGroup.destroy(true);
            sceneHandler.onObjectGroupDeletion(objectGroup);
            delete objectGroups[objectName];
          }
          for (var lightningName in lightnings){
            if (lightnings[lightningName].attachedToFPSWeapon && lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name == objectName){
              lightnings[lightningName].detachFromFPSWeapon();
            }
          }
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.OBJECT_DESTROYED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          return true;
        break;
        case 21: //newTexture
          // DEPRECATED
        break;
        case 22: //printTextures
          // DEPRECATED
        break;
        case 23: //destroyTexture
          // DEPRECATED
        break;
        case 24: //mapTexture
          // DEPRECATED
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
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (sceneHandler.getActiveSceneName() != object.registeredSceneName){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
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
          if (object.hasTexture()){
            object.adjustTextureRepeat(repeatU, repeatV);
          }else{
            terminal.printError(Text.NO_TEXTURE_MAPPED_TO_OBJECT);
            return true;
          }
          if (!jobHandlerWorking){
            terminal.printError(Text.REPEAT_AMOUNT_MODIFIED);
          }
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
            debugRenderer = new THREE.CannonDebugRenderer(scene, physicsWorld);
            terminal.printInfo(Text.PHYSICS_DEBUG_MODE_ON);
          }else{
            var objectsToRemove = [];
            var children = scene.children;
            for (var i = 0; i<children.length; i++){
              var child = children[i];
              if (child.forDebugPurposes){
                objectsToRemove.push(child);
              }
            }
            for (var i = 0; i<objectsToRemove.length; i++){
              scene.remove(objectsToRemove[i]);
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
          if (!checkIfNameUnique(name, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          if (materialName == "*"){
            material = pickRandomMaterial();
          }else{
            if (materialName.toUpperCase() != "NULL"){
              if (!material){
                terminal.printError(Text.NO_SUCH_MATERIAL);
                return true;
              }
            }else{
              if (defaultMaterialType == "BASIC"){
                material = new BasicMaterial({
                  name: "NULL_BASIC",
                  color: "white",
                  alpha: 1
                });
              }
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
          var selectedGridCount = Object.keys(gridSelections).length;
          if (selectedGridCount != 1 && selectedGridCount != 2){
            terminal.printError(Text.MUST_HAVE_ONETWO_GRIDS_SELECTED);
            return true;
          }
          if (!anchorGrid){
            terminal.printError(Text.NO_ANCHOR_GRIDS_SELECTED);
            return true;
          }
          var gridNames = [];
          for (var gridName in gridSelections){
            gridNames.push(gridName);
            if (selectedGridCount == 1){
              gridNames.push(gridName);
            }
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
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          refreshRaycaster(Text.RAMP_CREATED);
          return true;
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
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (addedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
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

          if (!jobHandlerWorking){
            terminal.printInfo(Text.MIRRORED_REPEAT_SET.replace(
              Text.PARAM1, property
            ).replace(
              Text.PARAM2, axis
            ));
          }
          return true;
        break;
        case 34: //newBox
          var name = splitted[1];
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
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
          if (!checkIfNameUnique(name, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          var material = materials[materialName];
          if (materialName == "*"){
            material = pickRandomMaterial();
          }else{
            if (materialName.toUpperCase() != "NULL"){
              if (!material){
                terminal.printError(Text.NO_SUCH_MATERIAL);
                return true;
              }
            }else{
              if (defaultMaterialType == "BASIC"){
                material = new BasicMaterial({
                  name: "NULL_BASIC",
                  color: "white",
                  alpha: 1
                });
              }
            }
          }

          if (!jobHandlerWorking){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1 && gridSelectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
          }

          height = parseFloat(height);
          if (isNaN(height)){
            terminal.printError(Text.HEIGHT_MUST_BE_A_NUMBER);
            return true;
          }
          if (height == 0){
            terminal.printError(Text.HEIGHT_CANNOT_BE_0);
            return true;
          }
          var selections = [];
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              selections.push(gridSelections[gridName]);
            }
          }else{
            selections.push(jobHandlerSelectedGrid);
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
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.BOX_CREATED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
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
          if (name.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (!checkIfNameUnique(name, Text.NAME_MUST_BE_UNIQUE)){
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
            if (gridSystems[sideNames[i]] || addedObjects[sideNames[i]] || objectGroups[sideNames[i]]){
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
          if (height % grid1.size != 0){
            terminal.printError(Text.HEIGHT_MUST_BE_DIVISIBLE);
            return true;
          }
          var baseGridSystem = gridSystems[grid1.parentName];
          var wcObject = new WallCollection(name, height, outlineColor, grid1, grid2);
          for (var gridName in gridSelections){
            gridSelections[gridName].toggleSelect(false, false, false, true);
          }
          sceneHandler.onWallCollectionCreation(wcObject);
          refreshRaycaster(Text.WALL_COLLECTION_CREATED);
          return true;
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
              Text.PARAM1, wallCollectionName + " ["+wallCollections[wallCollectionName].registeredSceneName+"]"
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var wallCollection = wallCollections[name];
          if (wallCollection){
            sceneHandler.onWallCollectionDeletion(wallCollection);
            wallCollection.destroy();
            if (!jobHandlerWorking){
              refreshRaycaster(Text.WALL_COLLECTION_DESTROYED);
            }else{
              jobHandlerRaycasterRefresh = true;
            }
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
          // DEPRECATED
        break;
        case 42: //printImages
          // DEPRECATED
        break;
        case 43: //mapSpecular
          // DEPRECATED
        break;
        case 44: //mapEnvironment
          // DEPRECATED
        break;
        case 45: //mapAmbientOcculsion
          // DEPRECATED
        break;
        case 46: //mapAlpha
          // DEPRECATED
        break;
        case 47: //setDefaultMaterial
          // DEPRECATED
        break;
        case 48: //newAmbientLight
          // DEPRECATED
        break;
        case 49: //printLights
          // DEPRECATED
        break;
        case 50: //selectLight
          // DEPRECATED
        break;
        case 51: //destroyLight
          // DEPRECATED
        break;
        case 52: //newPhongMaterial
          // DEPRECATED
        break;
        case 53: //mapNormal
          // DEPRECATED
        break;
        case 54: //mapEmissive
          // DEPRECATED
        break;
        case 55: //newLambertMaterial
          //DEPRECATED
        break;
        case 56: //newTexturePack
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var texturePackName = splitted[1];
          if (texturePackName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (texturePacks[texturePackName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/getTexturePackFolders", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function (){
            if (xhr.readyState == 4 && xhr.status == 200){
              var folders = JSON.parse(xhr.responseText);
              canvas.style.visibility = "";
              terminal.clear();
              if (folders.length == 0){
                terminal.enable();
                terminal.printError(Text.NO_VALID_TEXTURE_PACK_FOLDER);
              }else{
                terminal.disable();
                terminal.printInfo(Text.AFTER_TEXTURE_PACK_CREATION);
                texturePackCreatorGUIHandler.show(texturePackName, folders);
              }
            }
          }
          xhr.send(JSON.stringify({acceptedTextureSize: ACCEPTED_TEXTURE_SIZE}));
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
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, texturePackName).replace(Text.PARAM2, texturePacks[texturePackName].directoryName), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_TEXTURE_PACKS_CREATED);
          }
          return true;
        break;
        case 58: //printTexturePackInfo
          // DEPRECATED
        break;
        case 59: //mapTexturePack
          var texturePackName = splitted[1];
          var objectName = splitted[2];
          var texturePack = texturePacks[texturePackName];
          var addedObject = addedObjects[objectName];
          var sprite = sprites[objectName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (!addedObject && !sprite){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (addedObject){
            if (addedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            addedObject.mapTexturePack(texturePack);

            for (var animName in addedObject.animations){
              var anim = addedObject.animations[animName];
              if (anim.isEmissiveAnimation() && !texturePack.hasEmissive){
                addedObject.removeAnimation(anim);
              }
              if (anim.isDisplacementAnimation() && !texturePack.hasHeight){
                addedObject.removeAnimation(anim);
              }
            }
          }else{
            if (sprite.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.SPRITE_NOT_IN_ACTIVE_SCENE);
              return true;
            }
            sprite.mapTexture(texturePack);
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.TEXTURE_PACK_MAPPED);
          }
          return true;
        break;
        case 60: //destroyTexturePack
          var name = splitted[1];
          var texturePack = texturePacks[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          for (var spriteName in sprites){
            if (sprites[spriteName].mappedTexturePackName == name){
              terminal.printError(Text.TEXTURE_PACK_USED_IN_A_SPRITE.replace(Text.PARAM1, spriteName));
              return true;
            }
          }
          for (var containerName in containers){
            if (containers[containerName].backgroundTextureName == name){
              terminal.printError(Text.TEXTURE_PACK_USED_AS_A_BACKGROUND_TEXTURE.replace(Text.PARAM1, containerName));
              return true;
            }
          }
          for (var vkName in virtualKeyboards){
            if (virtualKeyboards[vkName].hasTexturePackUsed(name)){
              terminal.printError(Text.TEXTURE_PACK_USED_IN_VIRTUAL_KEYBOARD.replace(Text.PARAM1, vkName));
              return true;
            }
          }
          for (var psName in preConfiguredParticleSystems){
            var usedTextureName = preConfiguredParticleSystems[psName].getUsedTextureName();
            if (usedTextureName != null && usedTextureName == texturePack.name){
              terminal.printError(Text.TEXTURE_PACK_USED_IN_A_PARTICLE_SYSTEM.replace(Text.PARAM1, psName));
              return true;
            }
          }
          for (var crosshairName in crosshairs){
            if (crosshairs[crosshairName].configurations.texture == texturePack.name){
              terminal.printError(Text.TEXTURE_PACK_USED_IN_A_CROSSHAIR.replace(Text.PARAM1, crosshairName));
              return true;
            }
          }
          texturePack.destroy();
          if (!jobHandlerWorking){
            terminal.clear();
            terminal.disable();
            terminal.printInfo(Text.GENERATING_TEXTURE_ATLAS);
            textureAtlasHandler.onTexturePackChange(function(){
              terminal.clear();
              terminal.enable();
              terminal.print(Text.TEXTURE_PACK_DESTROYED);
            }, function(){
              terminal.clear();
              terminal.printError(Text.ERROR_HAPPENED_COMPRESSING_TEXTURE_ATLAS);
              terminal.enable();
            }, false);
          }
          return true;
        break;
        case 61: //refreshTexturePack
          // DEPRECATED
        break;
        case 62: //mapHeight
          // DEPRECATED
        break;
        case 63: //resetMaps
          var name = splitted[1];
          var addedObject = addedObjects[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (addedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          addedObject.resetMaps(true);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.MAPS_RESET);
          }
          for (var animName in addedObject.animations){
            var anim = addedObject.animations[animName];
            if (anim.isTextureAnimation()){
              addedObject.removeAnimation(anim);
            }
          }
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (addedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
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
          if(addedObject.type == "cylinder" && physicsDebugMode){
            parseCommand("switchPhysicsDebugMode");
            parseCommand("switchPhysicsDebugMode");
            terminal.clear();
          }
          if (!jobHandlerWorking){
            terminal.printError(Text.OBJECT_SEGMENTED);
          }
          return true;
        break;
        case 65: //superposeGridSystem
          // DEPRECATED
        break;
        case 66: //postProcessing
          var effectName = splitted[1].toLowerCase();
          var guiVisibilityAction = splitted[2].toLowerCase();
          if (!renderer.effects[effectName]){
            terminal.printError(Text.NO_SUCH_EFFECT);
            return true;
          }
          if (guiVisibilityAction == "show"){
            if (postProcessiongConfigurationsVisibility[effectName]){
              terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
              return true;
            }
            renderer.effects[effectName].showConfigurations();
            postProcessiongConfigurationsVisibility[effectName] = true;
            terminal.printInfo(Text.GUI_OPENED);
            return true;
          }else if (guiVisibilityAction == "hide"){
            if (!postProcessiongConfigurationsVisibility[effectName]){
              terminal.printError(Text.GUI_IS_ALREADY_HIDDEN);
              return true;
            }
            renderer.effects[effectName].hideConfigurations();
            postProcessiongConfigurationsVisibility[effectName] = false;
            terminal.printInfo(Text.GUI_CLOSED);
            return true;
          }else{
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
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
            selectedGrid
          );
          if (!gridSystems[name]){
            delete parentGridSystem.slicedGrids[selectedGrid.name];
            delete selectedGrid.sliced;
            delete selectedGrid.slicedGridSystemName;
          }
        break;
        case 68: //newPointLight
          // DEPRECATED
        break;
        case 69: //newSkybox
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var skyboxName = splitted[1];
          if(skyboxName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (skyBoxes[skyboxName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/getSkyboxFolders", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function (){
            if (xhr.readyState == 4 && xhr.status == 200){
              var folders = JSON.parse(xhr.responseText);
              canvas.style.visibility = "";
              terminal.clear();
              if (folders.length == 0){
                terminal.enable();
                terminal.printError(Text.NO_VALID_SKYBOX_FOLDER);
              }else{
                terminal.disable();
                terminal.printInfo(Text.AFTER_SKYBOX_CREATION);
                skyboxCreatorGUIHandler.show(skyboxName, folders);
              }
            }
          }
          xhr.send();
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
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, skyboxName).replace(Text.PARAM2, skyBoxes[skyboxName].directoryName), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_SKYBOXES_CREATED);
          }
          return true;
        break;
        case 71: //printSkyboxInfo
          // DEPRECATED
        break;
        case 72: //mapSkybox
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var name = splitted[1];
          var skybox = skyBoxes[name];
          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          sceneHandler.onMapSkybox(skybox);
          skyboxHandler.map(skybox);
          terminal.printError(Text.SKYBOX_MAPPED);
          return true;
        break;
        case 73: //destroySkybox
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var name = splitted[1];
          var skybox = skyBoxes[name];
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          sceneHandler.onSkyboxDeletion(skybox);
          skyboxHandler.destroySkybox(skybox);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SKYBOX_DESTROYED);
          }
          return true;
        break;
        case 74: //skybox
          // DEPRECATED
        break;
        case 75: //scaleSkybox
          // DEPRECATED
        break;
        case 76: //save
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          sceneHandler.onBeforeSave();
          save();
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
                  if (result){
                    if (stateLoader.hasTexturePacks || stateLoader.hasSkyboxes || stateLoader.hasFonts){
                      terminal.printInfo(Text.LOADING_PROJECT);
                      canvas.style.visibility = "hidden";
                      terminal.disable();
                    }
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
          // DEPRECATED
        break;
        case 79: //redo
          // DEPRECATED
        break;
        case 80: //selectObject
          var name = splitted[1];
          var objSelection = addedObjects[name];
          var objGroupSelection = objectGroups[name];
          if (!objSelection && !objGroupSelection){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          if (objSelection){
            if (objSelection.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            selectionHandler.select(objSelection);
            camera.lookAt(objSelection.mesh.position);
          }else if (objGroupSelection){
            if (objGroupSelection.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            selectionHandler.select(objGroupSelection);
            camera.lookAt(objGroupSelection.graphicsGroup.position);
          }
          terminal.printInfo(Text.OBJECT_SELECTED.replace(Text.PARAM1, name));
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
            if (addedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            if (addedObject.noMass){
              terminal.printError(Text.OBJECT_HAS_NO_MASS);
              return true;
            }
            addedObject.setMass(mass);
            if (mode == 1 && mass > 0){
              dynamicObjects.set(addedObject.name, addedObject);
              sceneHandler.onDynamicObjectAddition(addedObject);
            }
            if (selectionHandler.getSelectedObject() &&
                  selectionHandler.getSelectedObject().isAddedObject &&
                        selectionHandler.getSelectedObject().name == addedObject.name){
              guiHandler.objectManipulationParameters["Mass"] = addedObject.physicsBody.mass;
              guiHandler.omMassController.updateDisplay();
            }
          }else if (grouppedObject){
            if (grouppedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            if (grouppedObject.noMass){
              terminal.printError(Text.OBJECT_HAS_NO_MASS);
              return true;
            }
            if (grouppedObject.isPhysicsSimplified){
              terminal.printError(Text.CANNOT_SET_MASS_FOR_SIMPLIFIED_OBJECTS);
              return true;
            }
            grouppedObject.setMass(mass);
            if (mode == 1 && mass > 0){
              dynamicObjectGroups.set(grouppedObject.name, grouppedObject);
              sceneHandler.onDynamicObjectAddition(grouppedObject);
            }
            if (selectionHandler.getSelectedObject() &&
                  selectionHandler.getSelectedObject().isObjectGroup &&
                        selectionHandler.getSelectedObject().name == grouppedObject.name){
              guiHandler.objectManipulationParameters["Mass"] = grouppedObject.physicsBody.mass;
              guiHandler.omMassController.updateDisplay();
            }
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.MASS_SET);
          }
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
            if (addedObject.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            if (addedObject.pivotObject){
              addedObject.rotateAroundPivotObject(axis, radian);
            }else{
              addedObject.rotate(axis, radian);
            }
            addedObject.mesh.updateMatrixWorld();
            addedObject.updateBoundingBoxes();
            addedObject.isRotationDirty = true;
          }else if (objectGroup){
            if (objectGroup.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            if (objectGroup.pivotObject){
              objectGroup.rotateAroundPivotObject(axis, radian);
            }else{
              objectGroup.rotate(axis, radian);
            }
            objectGroup.updateBoundingBoxes();
            objectGroup.isRotationDirty = true;
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.OBJECT_ROTATED);
          }
          return true;
        break;
        case 83: //newScript
          // DEPRECATED
        break;
        case 84: //runScript
          // DEPRECATED
        break;
        case 85: //stopScript
          // DEPRECATED
        break;
        case 86: //printScripts
          // DEPRECATED
        break;
        case 87: //editScript
          // DEPRECATED
        break;
        case 88: //destroyScript
          // DEPRECATED
        break;
        case 89: //translateObject
          // DEPRECATED
        break;
        case 90: //setFog
          // DEPRECATED
        break;
        case 91: //removeFog
          // DEPRECATED
        break;
        case 92: //glue
          var groupName = splitted[1];
          if (groupName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (!groupName){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
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
          if (!checkIfNameUnique(groupName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          try{
            var objectNamesArray = objects.split(",");
            for (var i = 0; i<objectNamesArray.length; i++){
              if (!(objectNamesArray[i].indexOf("*") == -1)){
                var tmpPrefix = objectNamesArray[i].split("*")[0];
                for (var addedObjName in sceneHandler.getAddedObjects()){
                  if (addedObjName.startsWith(tmpPrefix)){
                    objectNamesArray.push(addedObjName);
                  }
                }
                for (var objGroupName in sceneHandler.getObjectGroups()){
                  if (objGroupName.startsWith(tmpPrefix)){
                    objectNamesArray.push(objGroupName);
                  }
                }
              }
            }
            objectNamesArray = objectNamesArray.filter(function(item, pos) {
              return (objectNamesArray.indexOf(item) == pos && (item.indexOf("*") == -1));
            });
            var group = new Object();
            if (objectNamesArray.length < 2){
              terminal.printError(Text.MUST_GLUE_AT_LEAST_2_OBJECTS);
              return true;
            }
            for (var i = 0; i<objectNamesArray.length; i++){
              var object = addedObjects[objectNamesArray[i]];
              if (!object){
                object = objectGroups[objectNamesArray[i]];
                if (!object){
                  terminal.printError(Text.OBJECT_NR_DOES_NOT_EXIST.replace(Text.PARAM1, (i+1)));
                  return true;
                }
              }
              if (object.registeredSceneName != sceneHandler.getActiveSceneName()){
                terminal.printError(Text.OBJECT_NR_X_NOT_IN_SCENE.replace(Text.PARAM1, (i+1)));
                return true;
              }
            }
            var detachedObjectGroups = new Object();
            for (var i = 0; i<objectNamesArray.length; i++){
              var object = addedObjects[objectNamesArray[i]];
              if (!object){
                var gluedObject = objectGroups[objectNamesArray[i]];
                detachedObjectGroups[gluedObject.name] = gluedObject;
                for (var gluedObjectName in gluedObject.group){
                  group[gluedObjectName] = gluedObject.group[gluedObjectName];
                }
              }else{
                group[objectNamesArray[i]] = object;
              }
            }
            var materialUsed = 0;
            for (var objName in group){
              if (!materialUsed){
                if (group[objName].hasBasicMaterial){
                  materialUsed = 1;
                }else{
                  throw new Error("Not implemented")
                }
              }else{
                // check if the same kind of material is used (for now only BASIC materials exist.)
              }
            }
            selectionHandler.resetCurrentSelection();
            var objectGroup = new ObjectGroup(groupName, group);
            if (!objectGroup.areGeometriesIdentical()){
              var ctr = 0;
              for (var objName in group){
                ctr += group[objName].mesh.geometry.attributes.position.array.length;
                if (ctr >= 50000 * 3){
                  terminal.printError(Text.OBJECTS_HAVE_TOO_MANY_FACES);
                  return true;
                }
              }
            }
            try{
              objectGroup.handleTextures();
            }catch (textureMergerErr){
              terminal.printError(textureMergerErr.message);
              return true;
            }
            var simplifiedChildrenPhysicsBodies = [];
            var simplifiedChildrenPhysicsBodyDescriptions = [];
            for (var objGroupName in detachedObjectGroups){
              var gluedObject = detachedObjectGroups[objGroupName];
              sceneHandler.onObjectGroupDeletion(gluedObject);
              if (gluedObject.isPhysicsSimplified){
                simplifiedChildrenPhysicsBodies.push(gluedObject.physicsBody);
                simplifiedChildrenPhysicsBodyDescriptions.push(gluedObject.physicsSimplificationParameters);
              }else if (gluedObject.simplifiedChildrenPhysicsBodies){
                for (var i = 0; i<gluedObject.simplifiedChildrenPhysicsBodies.length; i++){
                  simplifiedChildrenPhysicsBodies.push(gluedObject.simplifiedChildrenPhysicsBodies[i]);
                  simplifiedChildrenPhysicsBodyDescriptions.push(gluedObject.simplifiedChildrenPhysicsBodyDescriptions[i]);
                }
              }
              gluedObject.detach(!!gluedObject.isPhysicsSimplified);
              delete objectGroups[gluedObject.name];
              for (var lightningName in lightnings){
                if (lightnings[lightningName].attachedToFPSWeapon && lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name == gluedObject.name){
                  lightnings[lightningName].detachFromFPSWeapon();
                }
              }
            }
            if (materialUsed == 1){
              objectGroup.isBasicMaterial = true;
            }
            objectGroup.glue(simplifiedChildrenPhysicsBodies);
            objectGroup.simplifiedChildrenPhysicsBodyDescriptions = simplifiedChildrenPhysicsBodyDescriptions;
            sceneHandler.onObjectGroupCreation(objectGroup);
            objectGroups[groupName] = objectGroup;
            for (var childObjName in objectGroup.group){
              if (objectGroup.group[childObjName].usedAsAIEntity){
                objectGroup.group[childObjName].unUseAsAIEntity();
              }
              sceneHandler.onAddedObjectDeletion(objectGroup.group[childObjName]);
              for (var lightningName in lightnings){
                if (lightnings[lightningName].attachedToFPSWeapon && lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name == childObjName){
                  lightnings[lightningName].detachFromFPSWeapon();
                }
              }
            }
            guiHandler.hide(guiHandler.guiTypes.OBJECT);
            if (areaConfigurationsVisible){
              guiHandler.hide(guiHandler.guiTypes.AREA);
            }
            if (physicsDebugMode){
              parseCommand("switchPhysicsDebugMode");
              parseCommand("switchPhysicsDebugMode");
            }
            refreshRaycaster(Text.OBJECTS_GLUED_TOGETHER);
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var objectGroup = objectGroups[name];
          if (!objectGroup){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (objectGroup.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          for (var childObjName in objectGroup.group){
            sceneHandler.onAddedObjectCreation(objectGroup.group[childObjName]);
          }
          objectGroup.detach();
          sceneHandler.onObjectGroupDeletion(objectGroup);
          delete objectGroups[name];
          selectionHandler.resetCurrentSelection();
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          for (var lightningName in lightnings){
            if (lightnings[lightningName].attachedToFPSWeapon && lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name == name){
              lightnings[lightningName].detachFromFPSWeapon();
            }
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.OBJECT_DETACHED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if(name.indexOf(",") >= 0){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
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
          if (!jobHandlerWorking){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1){
              terminal.printError(Text.MUST_HAVE_ONE_GRID_SELECTED);
              return true;
            }
          }
          var selectedGrid;
          if (!jobHandlerWorking){
            selectedGrid = gridSelections[Object.keys(gridSelections)[0]];
          }else{
            selectedGrid = jobHandlerSelectedGrid;
          }
          var centerX = selectedGrid.centerX + offsetX;
          var centerY = selectedGrid.centerY + offsetY;
          var centerZ = selectedGrid.centerZ + offsetZ;
          var txt = "@@1 (@@2, @@3, @@4)".replace("@@1", name).replace("@@2", centerX).replace("@@3", centerY).replace("@@4", centerZ);
          var diff = txt.length - name.length;
          if (txt.length > MAX_TEXT_CHAR_COUNT){
            terminal.printError(Text.NAME_CANNOT_EXCEED_X_CHARS.replace(Text.PARAM1, MAX_TEXT_CHAR_COUNT - diff));
            return true;
          }
          var lenDif = txt.length - name.length;
          var markedPoint = new MarkedPoint(
            name, centerX, centerY, centerZ,
            selectedGrid.centerX, selectedGrid.centerY, selectedGrid.centerZ, false
          );
          markedPoints[name] = markedPoint;
          var gs = gridSystems[selectedGrid.parentName];
          if (gs){
            if (!gs.markedPointNames){
              gs.markedPointNames = [];
            }
            gs.markedPointNames.push(name);
          }
          if (!markedPointsVisible){
            markedPoint.hide();
          }
          selectedGrid.toggleSelect(false, false, false, true);
          sceneHandler.onMarkedPointCreation(markedPoint);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.POINT_MARKED);
          }
        break;
        case 95: //unmark
          var name = splitted[1];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var markedPoint = markedPoints[name];
          if (!markedPoint){
            terminal.printError(Text.NO_SUCH_POINT);
            return true;
          }
          sceneHandler.onMarkedPointDeletion(markedPoint);
          markedPoint.destroy();
          delete markedPoints[name];
          if (!jobHandlerWorking){
            terminal.printError(Text.POINT_UNMARKED);
          }
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
              Text.PARAM1, curPoint.name + " ["+curPoint.registeredSceneName+"]"
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
          for (var markedPointName in sceneHandler.getMarkedPoints()){
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
          markedPointsVisible = !markedPointsVisible;
          terminal.printInfo(Text.MARKED_POINTS_TOGGLED);
          return true;
        break;
        case 98: //runAutomatically
          // DEPRECATED
        break;
        case 99: //uploadScript
          // DEPRECATED
        break;
        case 100: //runManually
          // DEPRECATED
        break;
        case 101: //physicsWorkerMode
          // DEPRECATED
        break;
        case 102: //printPhysicsWorkerMode
          // DEPRECATED
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
          for (var i = 0; i<commandDescriptor.commands.length; i++){
            var i2 = 0;
            var found = false;
            while (i2 < commandDescriptor.deprecatedCommandIndices.length && !found){
              if (commandDescriptor.deprecatedCommandIndices[i2] == i){
                found = true;
              }
              i2++;
            }
            var command = commandDescriptor.commands[i];
            if (command.toLowerCase().indexOf(textToSearch) !== -1 && !found){
              possibleMatches[command] = i;
              possibleMatchCount ++;
            }else if (commandDescriptor.commandInfo[i].toLowerCase().indexOf(textToSearch) !== -1 && !found){
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
              commandInfosSorted.push(commandDescriptor.commandInfo[possibleMatches[commandName]]);
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
          // DEPRECATED
        break;
        case 108: //rescaleTexturePack
          // DEPRECATED
        break;
        case 109: //destroyImage
          // DEPRECATED
        break;
        case 110: //setBlending
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objectName = splitted[1];
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
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
            if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
              return true;
            }
            obj.setBlending(blendingModeInt);
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.BLENDING_MODE_SET_TO.replace(Text.PARAM1, blendingMode));
          }
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
          sceneHandler.onWorldLimitsChange();
          steeringHandler.resetWorld();
          refreshRaycaster(Text.OCTREE_LIMIT_SET);
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
          sceneHandler.onBinSizeChange();
          steeringHandler.resetWorld();
          refreshRaycaster(Text.BIN_SIZE_SET);
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
          // DEPRECATED
        break;
        case 118: //printParticleCollisionWorkerMode
          // DEPRECATED
        break;
        case 119: //particleSystemCollisionWorkerMode
          // DEPRECATED
        break;
        case 120: //printParticleSystemCollisionWorkerMode
          // DEPRECATED
        break;
        case 121: //logFrameDrops
          // DEPRECATED
        break;
        case 122: //addPaddingToTexture
          // DEPRECATED;
        break;
        case 123: //newSphere
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sphereName = splitted[1];
          if (!(sphereName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var materialName = splitted[2];
          var radius = parseFloat(splitted[3]);

          if (sphereName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
          if (sphereName.toUpperCase() == "NULL"){
            sphereName = generateUniqueObjectName();
          }
          if (!checkIfNameUnique(sphereName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          var material = materials[materialName];
          if (materialName == "*"){
            material = pickRandomMaterial();
          }else{
            if (materialName.toUpperCase() != "NULL"){
              if (!material){
                terminal.printError(Text.NO_SUCH_MATERIAL);
                return true;
              }
            }else{
              if (defaultMaterialType == "BASIC"){
                material = new BasicMaterial({
                  name: "NULL_BASIC",
                  color: "white",
                  alpha: 1
                });
              }
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

          if (!jobHandlerWorking){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1 && gridSelectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
          }

          var selections = [];
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              selections.push(gridSelections[gridName]);
            }
          }else{
            selections.push(jobHandlerSelectedGrid);
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
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.SPHERE_CREATED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          return true;
        break;
        case 124: //printFogInfo
          // DEPRECATED
        break;
        case 125: //applyDisplacementMap
          // DEPRECATED
        break;
        case 126: //setSlipperiness
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          if (!(objName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var onOff = splitted[2].toUpperCase();
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
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
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SLIPPERINESS_ADJUSTED);
          }
          return true;
        break;
        case 127: //setAtlasTextureSize
          // DEPRECATED
        break;
        case 128: // printAtlasTextureSize
          // DEPRECATED
        break;
        case 129: // sync
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sourceObjectName = splitted[1];
          var targetObjectName = splitted[2];
          var sourceObject = addedObjects[sourceObjectName];
          var targetObject = addedObjects[targetObjectName];
          if (!(targetObjectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!sourceObject){
            if (objectGroups[sourceObjectName]){
              terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
              return true;
            }
            terminal.printError(Text.SOURCE_OBJECT_NOT_DEFINED);
            return true;
          }
          if (!targetObject){
            if (objectGroups[targetObjectName]){
              terminal.printError(Text.GLUED_OBJECTS_DO_NOT_SUPPORT_THIS_FUNCTION);
              return true;
            }
            terminal.printError(Text.TARGET_OBJECT_NOT_DEFINED);
            return true;
          }
          if (sourceObject.name == targetObject.name){
            terminal.printError(Text.SOURCE_AND_TARGET_OBJECTS_ARE_THE_SAME);
            return true;
          }
          if (sourceObject.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.SOURCE_OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (targetObject.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.TARGET_OBJECT_NOT_IN_SCENE);
            return true;
          }
          targetObject.syncProperties(sourceObject);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.OBJECTS_SYNCED);
          }
          return true;
        break;
        case 130: //newArea
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var areaName = splitted[1];
          var height = parseFloat(splitted[2]);
          if (areas[areaName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (areaName.toLowerCase() == "default"){
            terminal.printError(Text.NAME_RESERVED);
            return true;
          }
          if (areaName.length > MAX_TEXT_CHAR_COUNT){
            terminal.printError(Text.NAME_CANNOT_EXCEED_X_CHARS.replace(Text.PARAM1, MAX_TEXT_CHAR_COUNT));
            return true;
          }
          if (isNaN(height)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "height"));
            return true;
          }
          var selections = [];
          var gs;
          var gridSize;
          for (var gridName in gridSelections){
            if (typeof gs == UNDEFINED){
              gs = gridSelections[gridName].parentName;
            }else{
              if (gs != gridSelections[gridName].parentName){
                terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
                return true;
              }
            }
            selections.push(gridSelections[gridName]);
            gridSize = gridSelections[gridName].size;
          }
          if (selections.length == 0 || selections.length > 2){
            terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
            return true;
          }
          var result = gridSystems[gs].newArea(areaName, height, selections);
          terminal.printInfo(Text.AREA_CREATED);
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          sceneHandler.onAreaCreation(result);
          return true;
        break;
        case 131: //toggleAreas
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          areasVisible = !areasVisible;
          if (areasVisible){
            for (var areaName in sceneHandler.getAreas()){
              areas[areaName].renderToScreen();
            }
            terminal.printInfo(Text.AREAS_ARE_VISIBLE);
          }else{
            for (var areaName in sceneHandler.getAreas()){
              areas[areaName].hide();
            }
            terminal.printInfo(Text.AREAS_ARE_INVISIBLE);
          }
          return true;
        break;
        case 132: //destroyArea
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var name = splitted[1];
          var area = areas[name];
          if (!area){
            terminal.printError(Text.NO_SUCH_AREA);
            return true;
          }
          sceneHandler.onAreaDeletion(area);
          area.destroy();
          delete areas[area.name];
          terminal.printInfo(Text.AREA_DESTROYED);
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          return true;
        break;
        case 133: //areaConfigurations
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var acMode = splitted[1].toLowerCase();
          if (acMode != "show" && acMode != "hide"){
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
          }
          var count = 0;
          for (var objName in sceneHandler.getAddedObjects()){
            count ++;
            break;
          }
          for (var objName in sceneHandler.getObjectGroups()){
            count ++;
            break;
          }
          if (count == 0){
            terminal.printError(Text.NO_OBJECT_ADDED_TO_THE_SCENE);
            return true;
          }
          if (acMode == "show"){
            if (areaConfigurationsVisible){
              terminal.printError(Text.AREA_CONFIGURATION_WINDOW_IS_ALREADY_VISIBLE);
              return true;
            }
            areaConfigurationsHandler.show();
          }else if (acMode == "hide"){
            if (!areaConfigurationsVisible){
              terminal.printError(Text.AREA_CONFIGURATION_WINDOW_IS_ALREADY_HIDDEN);
              return true;
            }
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          terminal.printInfo(Text.OK);
        break;
        case 134: //setResolution
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var resolutionParam = parseFloat(splitted[1]);
          if (splitted[1] == "ORIGINAL_RESOLUTION"){
            resolutionParam = window.devicePixelRatio;
            useOriginalResolution = true;
          }else{
            useOriginalResolution = false;
          }
          if (isNaN(resolutionParam)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "resolution"));
            return true;
          }
          if ((resolutionParam <= 0 || resolutionParam > 1) && !(splitted[1] == "ORIGINAL_RESOLUTION")){
            terminal.printError(Text.RESOLUTION_MUST_BE_BETWEEN);
            return true;
          }
          screenResolution = resolutionParam;
          renderer.setPixelRatio(screenResolution);
          resizeEventHandler.onResize();
          refreshRaycaster(Text.RESOLUTION_SET);
          return true;
        break;
        case 135: //configureArea
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var areaName = splitted[1];
          if (!areas[areaName] && areaName.toLowerCase() != "default"){
            terminal.printError(Text.NO_SUCH_AREA);
            return true;
          }
          if (areaName.toLowerCase() != "default" && areas[areaName].registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.AREA_NOT_IN_SCENE);
            return true;
          }
          var count = 0;
          for (var objName in sceneHandler.getAddedObjects()){
            count ++;
            break;
          }
          for (var objName in sceneHandler.getObjectGroups()){
            count ++;
            break;
          }
          if (count == 0){
            terminal.printError(Text.NO_OBJECT_ADDED_TO_THE_SCENE);
            return true;
          }
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          areaConfigurationsHandler.show(areaName);
          terminal.printInfo(Text.OK);
          return true;
        break;
        case 136: //newAreaConfiguration
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var areaName = splitted[1];
          var objName = splitted[2];
          var isVisible = splitted[3].toLowerCase();
          var sides = splitted[4].toLowerCase();
          if (areaName.indexOf("*") != -1 || objName.indexOf("*") != -1){
            new JobHandler(splitted).handle();
            return true;
          }
          var area = areas[areaName];
          if (!area && areaName != "default"){
            terminal.printError(Text.NO_SUCH_AREA);
            return true;
          }
          if (areaName != "default" && area.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.AREA_NOT_IN_SCENE);
            return true;
          }
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (isVisible != "true" && isVisible != "false"){
            terminal.printError(Text.ISVISIBLE_MUST_BE_TRUE_OR_FALSE);
            return true;
          }
          if (sides != "both" && sides != "front" && sides != "back"){
            terminal.printError(Text.SIDES_MUST_BE_BOTH_FRONT_OR_BACK);
            return true;
          }
          obj.setVisibilityInArea(areaName, (isVisible == "true"));
          if (SIDE_BOTH.toLowerCase() == sides){
            obj.setSideInArea(areaName, SIDE_BOTH);
          }else if (SIDE_BACK.toLowerCase() == sides){
            obj.setSideInArea(areaName, SIDE_BACK);
          }else if (SIDE_FRONT.toLowerCase() == sides){
            obj.setSideInArea(areaName, SIDE_FRONT);
          }
          delete areaConfigurationsHandler.currentArea;
          if (!jobHandlerWorking){
            terminal.printInfo(Text.CONFIGURATION_CREATED);
          }
          return true;
        break;
        case 137: //autoConfigureArea
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var areaName = splitted[1];
          if (areaName.indexOf("*") != -1){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!areas[areaName]){
            terminal.printError(Text.NO_SUCH_AREA);
            return true;
          }
          if (areas[areaName].registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.AREA_NOT_IN_SCENE);
            return true;
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.CONFIGURING_AREA);
            canvas.style.visibility = "hidden";
            terminal.disable();
          }
          setTimeout(function(){
            areaConfigurationsHandler.autoConfigureArea(areaName);
            if (!jobHandlerWorking){
              canvas.style.visibility = "";
              terminal.enable();
              terminal.clear();
              terminal.printInfo(Text.AREA_CONFIGURED);
            }else{
              jobHandlerInternalCounter ++;
              if (jobHandlerInternalCounter == jobHandlerInternalMaxExecutionCount){
                canvas.style.visibility = "";
                terminal.enable();
                terminal.clear();
                terminal.printInfo(Text.AREAS_CONFIGURED);
                jobHandlerWorking = false;
              }
            }
          })
          return true;
        break;
        case 138: //stopAreaConfigurations
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (stopAreaConfigurationsHandler){
            terminal.printError(Text.AREA_CONFIGURATIONS_ARE_ALREADY_STOPPED);
          }else{
            stopAreaConfigurationsHandler = true;
            terminal.printInfo(Text.AREA_CONFIGURATIONS_ARE_STOPPED);
          }
          return true;
        break;
        case 139: //startAreaConfigurations
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (stopAreaConfigurationsHandler){
            stopAreaConfigurationsHandler = false;
            terminal.printInfo(Text.AREA_CONFIGURATIONS_ARE_STARTED);
          }else{
            terminal.printError(Text.AREA_CONFIGURATIONS_ARE_ALREADY_STARTED);
          }
          return true;
        break;
        case 140: //newCylinder
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var cylinderName = splitted[1];
          if (!(cylinderName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var materialName = splitted[2];
          var topRadius = parseFloat(splitted[3]);
          var bottomRadius = parseFloat(splitted[4]);
          var cylinderHeight = parseFloat(splitted[5]);
          var isOpenEnded = splitted[6].toLowerCase();
          if (cylinderName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
          if (cylinderName.toUpperCase() == "NULL"){
            cylinderName = generateUniqueObjectName();
          }
          if (!checkIfNameUnique(cylinderName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          var material = materials[materialName];
          if (materialName == "*"){
            material = pickRandomMaterial();
          }else{
            if (materialName.toUpperCase() != "NULL"){
              if (!material){
                terminal.printError(Text.NO_SUCH_MATERIAL);
                return true;
              }
            }else{
              if (defaultMaterialType == "BASIC"){
                material = new BasicMaterial({
                  name: "NULL_BASIC",
                  color: "white",
                  alpha: 1
                });
              }
            }
          }
          if (isNaN(topRadius)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "topRadius"));
            return true;
          }
          if (isNaN(bottomRadius)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "bottomRadius"));
            return true;
          }
          if (isNaN(cylinderHeight)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "height"));
            return true;
          }
          if (topRadius == 0 && bottomRadius == 0){
            terminal.printError(Text.BOTH_BOTTOM_RADIUS_AND_TOP_RADIUS);
            return true;
          }
          if (cylinderHeight == 0){
            terminal.printError(Text.HEIGHT_CANNOT_BE_0);
            return true;
          }
          if (isOpenEnded != "true" && isOpenEnded != "false"){
            terminal.printError(Text.ISOPENENDED_MUST_BE_TRUE_OR_FALSE);
            return true;
          }
          isOpenEnded = (isOpenEnded == "true");
          if (!jobHandlerWorking){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1 && gridSelectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
          }
          var selections = [];
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              selections.push(gridSelections[gridName]);
            }
          }else{
            selections.push(jobHandlerSelectedGrid);
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
          gridSystem.newCylinder(
            cylinderName, material, topRadius, bottomRadius,
            cylinderHeight, isOpenEnded, selections
          );
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.CYLINDER_CREATED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          return true;
        break;
        case 141: // setRotationPivot
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          if (!(objName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var offsetX = parseFloat(splitted[2]);
          var offsetY = parseFloat(splitted[3]);
          var offsetZ = parseFloat(splitted[4]);
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (isNaN(offsetX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetX"));
            return true;
          }
          if (isNaN(offsetY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetY"));
            return true;
          }
          if (isNaN(offsetZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetZ"));
            return true;
          }
          if (obj.rotationMode == rotationModes.LOCAL){
            terminal.printError(Text.OBJECT_HAS_LOCAL_ROTATION_CANNOT_SET_PIVOT);
            return true;
          }
          var pivot = obj.makePivot(offsetX, offsetY, offsetZ);
          obj.pivotObject = pivot;
          obj.pivotOffsetX = offsetX;
          obj.pivotOffsetY = offsetY;
          obj.pivotOffsetZ = offsetZ;
          obj.pivotRemoved = false;
          if (!jobHandlerWorking){
            terminal.printInfo(Text.PIVOT_SET);
          }
          return true;
        break;
        case 142: //printChildPosition
          var objName = splitted[1];
          var childObjName = splitted[2];
          var objGroup = objectGroups[objName];
          if (!objGroup){
            terminal.printError(Text.NO_SUCH_OBJECT_GROUP);
            return true;
          }
          if (objGroup.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          var childObj = objGroup.group[childObjName];
          if (!childObj){
            terminal.printError(Text.NO_SUCH_CHILD_OBJECT_IN_THE_GROUP);
            return true;
          }
          objGroup.graphicsGroup.position.copy(objGroup.mesh.position);
          objGroup.graphicsGroup.quaternion.copy(objGroup.mesh.quaternion);
          objGroup.graphicsGroup.updateMatrix();
          objGroup.graphicsGroup.updateMatrixWorld();
          var child = objGroup.graphicsGroup.children[childObj.indexInParent];
          child.getWorldPosition(REUSABLE_VECTOR);
          terminal.printHeader(Text.CHILD_OBJECT_POSITION.replace(Text.PARAM1, objGroup.name));
          terminal.printInfo(Text.TREE2.replace(Text.PARAM1, "x").replace(Text.PARAM2, REUSABLE_VECTOR.x), true);
          terminal.printInfo(Text.TREE2.replace(Text.PARAM1, "y").replace(Text.PARAM2, REUSABLE_VECTOR.y), true);
          terminal.printInfo(Text.TREE2.replace(Text.PARAM1, "z").replace(Text.PARAM2, REUSABLE_VECTOR.z));
          return true;
        break;
        case 143: //unsetRotationPivot
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          if (!(objName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (!obj.pivotObject){
            terminal.printError(Text.OBJECT_DOES_NOT_HAVE_A_PIVOT);
            return true;
          }
          if (obj.isObjectGroup && obj.isPhysicsSimplified){
            obj.pivotObject.pseudoMesh.remove(obj.physicsSimplificationObject3DContainer);
            obj.physicsSimplificationObject3DContainer.position.copy(obj.mesh.position);
            obj.physicsSimplificationObject3DContainer.quaternion.copy(obj.mesh.quaternion);
            obj.physicsSimplificationObject3DContainer.updateMatrixWorld();
            obj.physicsSimplificationObject3DContainer.updateMatrix();
          }
          delete obj.pivotObject;
          delete obj.pivotOffsetX;
          delete obj.pivotOffsetY;
          delete obj.pivotOffsetZ;
          obj.pivotRemoved = true;
          if (obj.isObjectGroup && obj.isPhysicsSimplified){
            obj.updateSimplifiedPhysicsBody();
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.PIVOT_UNSET);
          }
          return true;
        break;
        case 144: //copyObject
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sourceName = splitted[1];
          var targetName = splitted[2];
          if (!(targetName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var offsetX = parseFloat(splitted[3]);
          var offsetY = parseFloat(splitted[4]);
          var offsetZ = parseFloat(splitted[5]);
          var isHardCopy = splitted[6].toLowerCase();
          if (targetName.toUpperCase() == "NULL"){
            targetName = generateUniqueObjectName();
          }
          if (targetName.indexOf(Text.COMMA) != -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_OBJECT_NAME);
            return true;
          }
          if (!checkIfNameUnique(targetName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          if (!(addedObjects[sourceName] || objectGroups[sourceName])){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (isNaN(offsetX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetX"));
            return true;
          }
          if (isNaN(offsetY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetY"));
            return true;
          }
          if (isNaN(offsetZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetZ"));
            return true;
          }
          var isHardCopyBoolean;
          if (isHardCopy == "true"){
            isHardCopyBoolean = true;
          }else if (isHardCopy == "false"){
            isHardCopyBoolean = false;
          }else{
            terminal.printError(Text.ISHARDCOPY_MUST_BE_TRUE_OR_FALSE);
            return true;
          }
          var copyPosition = new THREE.Vector3(0, 0, 0);
          var gridSelectionSize;
          if (!jobHandlerWorking){
            gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1 && gridSelectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
          }else{
            gridSelectionSize = 1;
          }
          var ct = 0;
          var gsName = false;
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              if (!gsName){
                gsName = gridSelections[gridName].parentName;
              }else{
                if (gsName != gridSelections[gridName].parentName){
                  terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
                  return true;
                }
              }
              ct ++;
              copyPosition.x += gridSelections[gridName].centerX;
              copyPosition.y += gridSelections[gridName].centerY;
              copyPosition.z += gridSelections[gridName].centerZ;
            }
          }else{
            gsName = jobHandlerSelectedGrid.parentName;
            ct = 1;
            copyPosition.x += jobHandlerSelectedGrid.centerX;
            copyPosition.y += jobHandlerSelectedGrid.centerY;
            copyPosition.z += jobHandlerSelectedGrid.centerZ;
          }
          var gs = gridSystems[gsName];
          copyPosition.x = (copyPosition.x / ct) + offsetX;
          copyPosition.y = (copyPosition.y / ct) + offsetY;
          copyPosition.z = (copyPosition.z / ct) + offsetZ;
          var sourceObj = addedObjects[sourceName];
          if (!sourceObj){
            sourceObj = objectGroups[sourceName];
          }
          if (sourceObj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          var copiedObj = sourceObj.copy(targetName, isHardCopyBoolean, copyPosition, gs, false);
          scene.add(copiedObj.mesh);
          if (!copiedObj.noMass && (copiedObj instanceof AddedObject)){
            physicsWorld.addBody(copiedObj.physicsBody);
          }
          if (sourceObj instanceof AddedObject){
            addedObjects[targetName] = copiedObj;
            sceneHandler.onAddedObjectCreation(copiedObj);
          }else{
            objectGroups[targetName] = copiedObj;
            sceneHandler.onObjectGroupCreation(copiedObj);
            if (!jobHandlerWorking){
              for (var gridName in gridSelections){
                gridSelections[gridName].toggleSelect(false, false, false, true);
              }
              gridSelections = new Object();
            }
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.OBJECT_COPIED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          return true;
        break;
        case 145: //build
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var projectName = splitted[1];
          var author = splitted[2];
          while (projectName.includes("/")){
            projectName = projectName.replace("/", " ");
          }
          while (author.includes("/")){
            author = author.replace("/", " ");
          }
          var totalScriptsToLoad = scriptsHandler.getTotalScriptsToLoadCount();
          if (totalScriptsToLoad > 0){
            loadedScriptsCounter = 0;
            terminal.clear();
            terminal.printInfo(Text.LOADING_SCRIPTS);
            canvas.style.visibility = "hidden";
            terminal.disable();
            scriptsHandler.loadScripts(function(scriptName){
              loadedScriptsCounter ++;
              if (loadedScriptsCounter == totalScriptsToLoad){
                build(projectName, author);
              }
            }, function(scriptName, filePath){
              modeSwitcher.enableTerminal();
              terminal.printError(Text.FAILED_TO_LOAD_SCRIPT.replace(Text.PARAM1, scriptName).replace(Text.PARAM2, filePath));
            }, function(scriptName, errorMessage){
              modeSwitcher.enableTerminal();
              terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, errorMessage).replace(Text.PARAM2, scriptName));
            });
          }else{
            build(projectName, author);
          }
          var hasParticleSystems = false;
          for (var key in preConfiguredParticleSystems){
            hasParticleSystems = true;
            break;
          }
          if (hasParticleSystems && !particleSystemRefHeight){
            terminal.printError("[!] Consider using makeParticleSystemsResponsive CLI command.")
          }
          if (checkForTextureBleedingInIOS()){
            terminal.printError("[!] Some of the objects contain custom texture offset, repeat properties or a texture offset animation.\nThis may cause rendering problems in iOS devices.");
          }
          return true;
        break;
        case 146: //skyboxConfigurations
          // DEPRECATED
        break;
        case 147: //fogConfigurations
          // DEPRECATED
        break;
        case 148: //noMobile
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var param = splitted[1].toLowerCase();
          if (param == "on"){
            if (NO_MOBILE){
              terminal.printError(Text.ALREADY_FOR_MOBILE.replace(Text.PARAM1, "disabled"));
              return true;
            }
            NO_MOBILE = true;
            terminal.printInfo(Text.FOR_MOBILE.replace(Text.PARAM1, "disabled"));
            return true;
          }else if(param == "off"){
            if (!NO_MOBILE){
              terminal.printError(Text.ALREADY_FOR_MOBILE.replace(Text.PARAM1, "enabled"));
              return true;
            }
            NO_MOBILE = false;
            terminal.printInfo(Text.FOR_MOBILE.replace(Text.PARAM1, "enabled"));
            return true;
          }
          terminal.printError(Text.PARAMETER_MUST_BE_ON_OFF);
          return true;
        break;
        case 149: //setMaxViewport
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var width = parseFloat(splitted[1]);
          var height = parseFloat(splitted[2]);
          if (isNaN(width)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "width"));
            return true;
          }
          if (isNaN(height)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "height"));
            return true;
          }
          if (width <= 0){
            viewportMaxWidth = 0;
          }else{
            viewportMaxWidth = width;
          }
          if (height <= 0){
            viewportMaxHeight = 0;
          }else{
            viewportMaxHeight = height;
          }
          terminal.printInfo(Text.MAX_VIEWPORT_SET);
          return true;
        break;
        case 150: //keepAspect
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var aspectFixed = parseFloat(splitted[1]);
          if (isNaN(aspectFixed)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "ratio"));
            return true;
          }
          if (aspectFixed <= 0){
            fixedAspect = 0;
            terminal.printInfo(Text.ASPECT_UNFIXED);
            return true;
          }
          fixedAspect = aspectFixed;
          terminal.printInfo(Text.ASPECT_FIXED.replace(Text.PARAM1, fixedAspect));
          return true;
        break;
        case 151: //newFont
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var fontName = splitted[1];
          if (fontName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (fonts[fontName]){
            terminal.printError(Text.FONT_NAME_MUST_BE_UNIQUE);
            return true;
          }
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/getFonts", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function (){
            if (xhr.readyState == 4 && xhr.status == 200){
              var typefaces = JSON.parse(xhr.responseText);
              canvas.style.visibility = "";
              terminal.clear();
              if (typefaces.length == 0){
                terminal.enable();
                terminal.printError(Text.NO_VALID_FONTS);
              }else{
                terminal.disable();
                terminal.printInfo(Text.AFTER_FONT_CREATION);
                fontCreatorGUIHandler.show(fontName, typefaces);
              }
            }
          }
          xhr.send();
          return true;
        break;
        case 152: //destroyFont
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var fontName = splitted[1];
          if (!(fontName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var fontToRemove = fonts[fontName];
          if (!fontToRemove){
            terminal.printError(Text.NO_SUCH_FONT);
            return true;
          }
          for (var textName in addedTexts){
            if (addedTexts[textName].font.name == fontName){
              terminal.printError(Text.FONT_USED_IN.replace(Text.PARAM1, textName));
              return true;
            }
          }
          fontToRemove.destroy();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.FONT_DESTROYED);
          }
          return true;
        break;
        case 153: //printFonts
          var totalCount = Object.keys(fonts).length;
          var curCount = 0;
          terminal.printHeader(Text.FONTS);
          for (var fontName in fonts){
            curCount ++;
            var opt = !(curCount == totalCount);
            var curFont = fonts[fontName];
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, fontName).replace(Text.PARAM2, curFont.path), opt);
          }
          if (curCount == 0){
            terminal.printError(Text.NO_FONTS);
          }
          return true;
        break;
        case 154: //newText
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var textName = splitted[1];
          if (!(textName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var fontName = splitted[2];
          var maxCharacterLength = parseInt(splitted[3]);
          var offsetX = parseFloat(splitted[4]);
          var offsetY = parseFloat(splitted[5]);
          var offsetZ = parseFloat(splitted[6]);
          if (!checkIfNameUnique(textName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          var selectedFont = fonts[fontName];
          if (!selectedFont){
            terminal.printError(Text.NO_SUCH_FONT);
            return true;
          }
          if (isNaN(maxCharacterLength)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxCharacterLength"));
            return true;
          }
          if (maxCharacterLength <= 0 || maxCharacterLength > MAX_TEXT_CHAR_COUNT){
            terminal.printError(Text.MAX_CHAR_SIZE_MUST_BE_BETWEEN.replace(Text.PARAM1, MAX_TEXT_CHAR_COUNT));
            return true;
          }
          if (isNaN(offsetX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetX"));
            return true;
          }
          if (isNaN(offsetY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetY"));
            return true;
          }
          if (isNaN(offsetZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetZ"));
            return true;
          }
          var txt = "";
          for (var i = 0; i<maxCharacterLength; i++){
            txt += "x";
          }
          var selectionSize = 1;
          if (!jobHandlerWorking){
            selectionSize = Object.keys(gridSelections).length;
            if (selectionSize != 1 && selectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
            if (selectionSize == 2){
              var parentGs = 0;
              for (var gridName in gridSelections){
                if (!parentGs){
                  parentGs = gridSelections[gridName].parentName;
                }else if (parentGs != gridSelections[gridName].parentName){
                  terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
                  return true;
                }
              }
            }
          }
          var textCoord = new THREE.Vector3(0, 0, 0);
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              var sgrid = gridSelections[gridName];
              textCoord.x += sgrid.centerX;
              textCoord.y += sgrid.centerY;
              textCoord.z += sgrid.centerZ;
            }
          }else{
            textCoord.x += jobHandlerSelectedGrid.centerX;
            textCoord.y += jobHandlerSelectedGrid.centerY;
            textCoord.z += jobHandlerSelectedGrid.centerZ;
          }
          textCoord.x += offsetX;
          textCoord.y += offsetY;
          textCoord.z += offsetZ;
          textCoord.x = textCoord.x / selectionSize;
          textCoord.y = textCoord.y / selectionSize;
          textCoord.z = textCoord.z / selectionSize;
          var addedText = new AddedText(
            textName, selectedFont, txt, textCoord, new THREE.Color("white"), 1, 20
          );
          sceneHandler.onAddedTextCreation(addedText);
          addedTexts[textName] = addedText;
          addedText.refCharSize = 20;
          addedText.refInnerHeight = window.innerHeight;
          addedText.handleBoundingBox();
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              addedText.destroyedGrids[gridName] = gridSelections[gridName];
              addedText.gsName = gridSelections[gridName].parentName;
              gridSelections[gridName].createdAddedTextName = addedText.name;
              gridSelections[gridName].toggleSelect(false, false, false, true);
            }
          }else{
            addedText.destroyedGrids[jobHandlerSelectedGrid.name] = jobHandlerSelectedGrid;
            addedText.gsName = jobHandlerSelectedGrid.parentName;
            jobHandlerSelectedGrid.createdAddedTextName = addedText.name;
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.TEXT_ALLOCATED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          return true;
        break;
        case 155: //selectText
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var textName = splitted[1];
          var textSelection = addedTexts[textName];
          if (!textSelection){
            terminal.printError(Text.NO_SUCH_TEXT);
            return true;
          }
          if (textSelection.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.TEXT_NOT_IN_SCENE);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          selectionHandler.select(textSelection);
          guiHandler.afterObjectSelection();
          terminal.printInfo(Text.SELECTED.replace(Text.PARAM1, textSelection.name));
          camera.lookAt(textSelection.mesh.position);
          return true;
        break;
        case 156: //destroyText
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var textName = splitted[1];
          if (!(textName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var textToDestroy = addedTexts[textName];
          if (!textToDestroy){
            terminal.printError(Text.NO_SUCH_TEXT);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          sceneHandler.onAddedTextDeletion(textToDestroy);
          textToDestroy.destroy(true);
          if (textToDestroy.containerParent){
            textToDestroy.containerParent.removeAddedText();
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.TEXT_DESTROYED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          return true;
        break;
        case 157: //printTexts
          terminal.printHeader(Text.TEXTS);
          var totalTextCount = Object.keys(addedTexts).length;
          var ctr = 0;
          for (var textName in addedTexts){
            ctr ++;
            var options = true;
            if (ctr == totalTextCount){
              options = false;
            }
            terminal.printInfo(Text.TREE2.replace(
              Text.PARAM1, textName + " ["+addedTexts[textName].registeredSceneName+"]"
            ).replace(
              Text.PARAM2, addedTexts[textName].text
            ), options);
          }
          if (totalTextCount == 0){
            terminal.printError(Text.NO_TEXTS_CREATED);
          }
          return true;
        break;
        case 158: //setRayStep
          if  (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
          }
          var stepAmount = parseFloat(splitted[1]);
          if (isNaN(stepAmount)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "stepAmount"));
            return true;
          }
          if (stepAmount <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "stepAmount").replace(Text.PARAM2, "0"));
            return true;
          }
          RAYCASTER_STEP_AMOUNT = stepAmount;
          refreshRaycaster(Text.RAYCASTER_STEP_AMOUNT_SET_TO.replace(Text.PARAM1, RAYCASTER_STEP_AMOUNT));
          return true;
        break;
        case 159: //printRayStep
          terminal.printHeader(Text.RAYCASTER_STEP_AMOUNT);
          terminal.printInfo(Text.TREE.replace(Text.PARAM1, RAYCASTER_STEP_AMOUNT));
          return true;
        break;
        case 160: //simplifyPhysics
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          if (!(objName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var sizeX = parseFloat(splitted[2]);
          var sizeY = parseFloat(splitted[3]);
          var sizeZ = parseFloat(splitted[4]);
          var obj = objectGroups[objName];
          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT_GROUP);
            return true;
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (obj.noMass){
            terminal.printError(Text.OBJECT_HAS_NO_MASS);
            return true;
          }
          if (obj.physicsBody.mass > 0){
            terminal.printError(Text.CANNOT_SIMPLIFY_PHYISCS_DYNAMIC_OBJECTS);
            return true;
          }
          if (obj.cannotSetMass){
            terminal.printError(Text.OBJECT_CANNOT_SET_MASS);
            return true;
          }
          if (isNaN(sizeX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "sizeX"));
            return true;
          }
          if (isNaN(sizeY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "sizeY"));
            return true;
          }
          if (isNaN(sizeZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "sizeZ"));
            return true;
          }
          if (sizeX <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "sizeX").replace(Text.PARAM2, "0"));
            return true;
          }
          if (sizeY <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "sizeY").replace(Text.PARAM2, "0"));
            return true;
          }
          if (sizeZ <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "sizeZ").replace(Text.PARAM2, "0"));
            return true;
          }
          if (obj.isRotationDirty){
            terminal.printError(Text.OBJECT_HAS_ROTATION_SET);
            return true;
          }else{
            for (var objName in obj.group){
              if (obj.group[objName].isRotationDirty){
                terminal.printError(Text.OBJECT_HAS_CHILD_ROTATION_SET);
                return true;
              }
            }
          }
          obj.simplifyPhysics(sizeX/2, sizeY/2, sizeZ/2);
          if (physicsDebugMode){
            debugRenderer.refresh();
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.PHYSICS_SIMPLIFIED);
          }
          return true;
        break;
        case 161: //unsimplifyPhysics
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          if (!(objName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var obj = objectGroups[objName];
          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT_GROUP);
            return true;
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (obj.noMass){
            terminal.printError(Text.OBJECT_HAS_NO_MASS);
            return true;
          }
          if (!obj.isPhysicsSimplified){
            terminal.printError(Text.PHYSICS_IS_NOT_SIMPLIFIED);
            return true;
          }
          obj.unsimplifyPhysics();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.PHYSICS_UNSIMPLIFIED);
          }
          return true;
        break;
        case 162: //fpsWeaponAlignment
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (!obj.isFPSWeapon){
            terminal.printError(Text.OBJECT_IS_NOT_MARKED_AS_FPS_WEAPON);
            return true;
          }
          fpsWeaponGUIHandler.show(obj);
          return true;
        break;
        case 163: //shaderPrecision
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var param = splitted[1].toLowerCase();
          if (param != "show" && param != "hide"){
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
          }
          if (param == "show"){
            if (guiHandler.datGuiShaderPrecision){
              terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
              return true;
            }
            guiHandler.show(guiHandler.guiTypes.SHADER_PRECISION);
            terminal.printInfo(Text.GUI_OPENED);
          }else{
            if (!guiHandler.datGuiShaderPrecision){
              terminal.printError(Text.GUI_IS_ALREADY_HIDDEN);
              return true;
            }
            guiHandler.hide(guiHandler.guiTypes.SHADER_PRECISION);
            terminal.printInfo(Text.GUI_CLOSED);
          }
          return true;
        break;
        case 164: //newParticleSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var psName = splitted[1];
          if (psName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (preConfiguredParticleSystems[psName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          particleSystemCreatorGUIHandler.show(psName);
          terminal.clear();
          terminal.disable();
          terminal.printInfo(Text.AFTER_PS_CREATION);
          return true;
        break;
        case 165: //editParticleSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var psName = splitted[1];
          if (!preConfiguredParticleSystems[psName]){
            terminal.printError(Text.NO_SUCH_PARTICLE_SYSTEM);
            return true;
          }
          if (preConfiguredParticleSystems[psName].registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.PS_NOT_IN_SCENE);
            return true;
          }
          particleSystemCreatorGUIHandler.edit(psName);
          terminal.clear();
          terminal.disable();
          terminal.printInfo(Text.AFTER_PS_CREATION);
          return true;
        break;
        case 166: //makeParticleSystemsResponsive
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          particleSystemRefHeight = renderer.getCurrentViewport().w / screenResolution;
          GLOBAL_PS_REF_HEIGHT_UNIFORM.value = 1;
          terminal.printInfo(Text.OK);
          return true;
        break;
        case 167: //newParticleSystemPool
          if (mode != 0){
            terminal.printInfo(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var poolName = splitted[1];
          var psName = splitted[2];
          var poolSize = parseInt(splitted[3]);
          if (poolName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (preConfiguredParticleSystemPools[poolName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          var ps = preConfiguredParticleSystems[psName];
          if (!ps){
            terminal.printError(Text.NO_SUCH_PARTICLE_SYSTEM);
            return true;
          }
          if (ps.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.PS_NOT_IN_SCENE);
            return true;
          }
          if (!(typeof ps.preConfiguredParticleSystemPoolName == UNDEFINED)){
            terminal.printError(Text.PARTICLE_SYSTEM_BELONGS_TO_ANOTHER_POOL);
            return true;
          }
          if (isNaN(poolSize)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "poolSize"));
            return true;
          }
          if (poolSize <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "poolSize").replace(Text.PARAM2, "0"));
            return true;
          }
          var preConfiguredParticleSystemPool = new PreconfiguredParticleSystemPool(psName, poolName, poolSize);
          sceneHandler.onParticleSystemPoolCreation(preConfiguredParticleSystemPool);
          preConfiguredParticleSystemPools[poolName] = preConfiguredParticleSystemPool;
          ps.preConfiguredParticleSystemPoolName = poolName;
          terminal.printInfo(Text.PARTICLE_SYSTEM_POOL_CREATED);
          return true;
        break;
        case 168: //destroyParticleSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var preConfiguredParticleSystem = preConfiguredParticleSystems[splitted[1]];
          if (!preConfiguredParticleSystem){
            terminal.printError(Text.NO_SUCH_PARTICLE_SYSTEM);
            return true;
          }
          if (!(typeof preConfiguredParticleSystem.preConfiguredParticleSystemPoolName == UNDEFINED)){
            terminal.printError(Text.PARTICLE_SYSTEM_USED_IN_A_POOL);
            return true;
          }
          for (var muzzleFlashName in muzzleFlashes){
            if (muzzleFlashes[muzzleFlashName].refPreconfiguredPS.name == preConfiguredParticleSystem.name){
              terminal.printError(Text.PARTICLE_SYSTEM_USED_IN_A_MUZZLEFLASH);
              return true;
            }
          }
          sceneHandler.onParticleSystemDeletion(preConfiguredParticleSystem);
          preConfiguredParticleSystem.destroy();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.PARTICLE_SYSTEM_DESTROYED);
          }
          return true;
        break;
        case 169: //destroyParticleSystemPool
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var preConfiguredParticleSystemPool = preConfiguredParticleSystemPools[splitted[1]];
          if (!preConfiguredParticleSystemPool){
            terminal.printError(Text.NO_SUCH_PARTICLE_SYSTEM_POOL);
            return true;
          }
          sceneHandler.onParticleSystemPoolDeletion(preConfiguredParticleSystemPool);
          preConfiguredParticleSystemPool.destroy();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.PARTICLE_SYSTEM_POOL_DESTROYED);
          }
          return true;
        break;
        case 170: //printParticleSystems
          var len = Object.keys(preConfiguredParticleSystems).length;
          terminal.printHeader(Text.PARTICLE_SYSTEMS);
          var ctr = 1;
          for (var psName in preConfiguredParticleSystems){
            var opts = true;
            if (ctr == len){
              opts = false;
            }
            ctr ++;
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, psName + " ["+preConfiguredParticleSystems[psName].registeredSceneName+"]").replace(Text.PARAM2, preConfiguredParticleSystems[psName].type), opts);
          }
          if (len == 0){
            terminal.printError(Text.NO_PARTICLE_SYSTEMS_CREATED);
          }
          return true;
        break;
        case 171: //printParticleSystemPools
          var len = Object.keys(preConfiguredParticleSystemPools).length;
          terminal.printHeader(Text.PARTICLE_SYSTEM_POOLS);
          var ctr = 1;
          for (var poolName in preConfiguredParticleSystemPools){
            var opts = true;
            if (ctr == len){
              opts = false;
            }
            ctr ++;
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, poolName + " ["+preConfiguredParticleSystemPools[poolName].registeredSceneName+"]").replace(Text.PARAM2, preConfiguredParticleSystemPools[poolName].refParticleSystemName+" x "+preConfiguredParticleSystemPools[poolName].poolSize), opts);
          }
          if (len == 0){
            terminal.printError(Text.NO_PARTICLE_SYSTEM_POOLS_CREATED);
          }
          return true;
        break;
        case 172: //workerConfigurations
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var workerConfigurationsStatus = splitted[1].toLowerCase();
          if (workerConfigurationsStatus != "show" && workerConfigurationsStatus != "hide"){
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
          }
          if (workerConfigurationsStatus == "show"){
            if (guiHandler.datGuiWorkerStatus){
              terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
              return true;
            }
            guiHandler.show(guiHandler.guiTypes.WORKER_STATUS);
            terminal.printInfo(Text.GUI_OPENED);
          }else{
            if (!guiHandler.datGuiWorkerStatus){
              terminal.printError(Text.GUI_IS_ALREADY_HIDDEN);
              return true;
            }
            guiHandler.hide(guiHandler.guiTypes.WORKER_STATUS);
            terminal.printInfo(Text.GUI_CLOSED);
          }
          return true;
        break;
        case 173: //newMuzzleFlash
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var muzzleFlashName = splitted[1];
          var refPSName = splitted[2];
          if (muzzleFlashName.indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (muzzleFlashes[muzzleFlashName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          var ps = preConfiguredParticleSystems[refPSName];
          if (!ps){
            terminal.printError(Text.NO_SUCH_PARTICLE_SYSTEM);
            return true;
          }
          if (ps.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.PS_NOT_IN_SCENE);
            return true;
          }
          if (ps.isCollidable){
            terminal.printError(Text.CANNOT_CREATE_MUZZLEFLASH_COLLIDABLE_PS);
            return true;
          }
          if (ps.hasParticleCollision){
            terminal.printError(Text.CANNOT_CREATE_MUZZLEFLASH_COLLIDABLE_PARTICLES);
            return true;
          }
          muzzleFlashCreatorGUIHandler.show(muzzleFlashName, ps);
          terminal.clear();
          terminal.disable();
          terminal.printInfo(Text.AFTER_MUZZLE_FLASH_CREATION);
          return true;
        break;
        case 174: //editMuzzleFlash
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var muzzleFlashName = splitted[1];
          var muzzleFlash = muzzleFlashes[muzzleFlashName];
          if (!muzzleFlash){
            terminal.printError(Text.NO_SUCH_MUZZLE_FLASH);
            return true;
          }
          if (muzzleFlash.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.MUZZLE_FLASH_NOT_IN_SCENE);
            return true;
          }
          muzzleFlashCreatorGUIHandler.edit(muzzleFlash);
          terminal.clear();
          terminal.disable();
          terminal.printInfo(Text.AFTER_MUZZLE_FLASH_CREATION);
          return true;
        break;
        case 175: //destroyMuzzleFlash
          if (mode != 0){
            terminal.printInfo(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var muzzleFlashName = splitted[1];
          if (!(muzzleFlashName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var muzzleFlash = muzzleFlashes[muzzleFlashName];
          if (!muzzleFlash){
            terminal.printError(Text.NO_SUCH_MUZZLE_FLASH);
            return true;
          }
          if (muzzleFlash.getUsingWeaponName() != null){
            terminal.printError(Text.MUZZLE_FLASH_USED_IN.replace(Text.PARAM1, muzzleFlash.getUsingWeaponName()));
            return true;
          }
          sceneHandler.onMuzzleFlashDeletion(muzzleFlash);
          muzzleFlash.destroy();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.MUZZLE_FLASH_DESTROYED);
          }
          return true;
        break;
        case 176: //printMuzzleFlashes
          var len = Object.keys(muzzleFlashes).length;
          terminal.printHeader(Text.MUZZLE_FLASHES);
          var ctr = 1;
          for (var muzzleFlashName in muzzleFlashes){
            var opts = true;
            if (ctr == len){
              opts = false;
            }
            ctr ++;
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, muzzleFlashName + " ["+muzzleFlashes[muzzleFlashName].registeredSceneName+"]").replace(Text.PARAM2, muzzleFlashes[muzzleFlashName].refPreconfiguredPS.name), opts);
          }
          if (len == 0){
            terminal.printError(Text.NO_MUZZLE_FLASHES_CREATED);
          }
          return true;
        break;
        case 177: //unmapSkybox
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!skyboxHandler.isVisible()){
            terminal.printError(Text.NO_SKYBOX_MAPPED);
            return true;
          }
          sceneHandler.onUnmapSkybox();
          skyboxHandler.unmap();
          fogHandler.setBlendWithSkyboxStatus(false);
          terminal.printInfo(Text.SKYBOX_HIDDEN);
          return true;
        break;
        case 178: //editSkybox
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var skybox = skyBoxes[splitted[1]];
          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/getSkyboxFolders", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function (){
            if (xhr.readyState == 4 && xhr.status == 200){
              var folders = JSON.parse(xhr.responseText);
              canvas.style.visibility = "";
              terminal.clear();
              if (folders.length == 0){
                terminal.enable();
                terminal.printError(Text.NO_VALID_SKYBOX_FOLDER);
              }else{
                terminal.disable();
                terminal.printInfo(Text.AFTER_SKYBOX_CREATION);
                skyboxCreatorGUIHandler.edit(skybox, folders);
              }
            }
          }
          xhr.send();
          return true;
        break;
        case 179: //editTexturePack
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var texturePack = texturePacks[splitted[1]];
          if (!texturePack){
            terminal.printError(Text.NO_SUCH_TEXTURE_PACK);
            return true;
          }
          if (texturePack.isUsed()){
            terminal.printError(Text.TEXTURE_PACK_ALREADY_USED);
            return true;
          }
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/getTexturePackFolders", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function (){
            if (xhr.readyState == 4 && xhr.status == 200){
              var folders = JSON.parse(xhr.responseText);
              canvas.style.visibility = "";
              terminal.clear();
              if (folders.length == 0){
                terminal.enable();
                terminal.printError(Text.NO_VALID_TEXTURE_PACK_FOLDER);
              }else{
                terminal.disable();
                terminal.printInfo(Text.AFTER_TEXTURE_PACK_CREATION);
                texturePackCreatorGUIHandler.edit(texturePack, folders);
              }
            }
          }
          xhr.send(JSON.stringify({acceptedTextureSize: ACCEPTED_TEXTURE_SIZE}));
          return true;
        break;
        case 180: //fog
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          terminal.clear();
          terminal.disable();
          terminal.printInfo(Text.AFTER_FOG_CREATION);
          fogCreatorGUIHandler.show();
          return true;
        break;
        case 181: //newCrosshair
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (splitted[1].indexOf("*") > -1){
            terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
            return true;
          }
          if (crosshairs[splitted[1]]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          var texturePackNames = [];
          for (var texturePackName in texturePacks){
            texturePackNames.push(texturePackName);
          }
          if (texturePackNames.length == 0){
            terminal.printError(Text.NO_TEXTURE_PACKS_CREATED);
            return true;
          }
          crosshairCreatorGUIHandler.show(splitted[1], texturePackNames);
          terminal.disable();
          terminal.clear();
          terminal.printInfo(Text.AFTER_CROSSHAIR_CREATION);
          return true;
        break;
        case 182: //editCrosshair
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var crosshair = crosshairs[splitted[1]];
          if (!crosshair){
            terminal.printError(Text.NO_SUCH_CROSSHAIR);
            return true;
          }
          var texturePackNames = [];
          for (var texturePackName in texturePacks){
            texturePackNames.push(texturePackName);
          }
          crosshairCreatorGUIHandler.edit(crosshair, texturePackNames);
          terminal.disable();
          terminal.clear();
          terminal.printInfo(Text.AFTER_CROSSHAIR_CREATION);
          return true;
        break;
        case 183: //destroyCrosshair
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var crosshair = crosshairs[splitted[1]];
          if (!crosshair){
            terminal.printError(Text.NO_SUCH_CROSSHAIR);
            return true;
          }
          sceneHandler.onCrosshairDeletion(crosshair);
          crosshair.destroy(true);
          delete crosshairs[crosshair.name];
          if (!jobHandlerWorking){
            terminal.printInfo(Text.CROSSHAIR_DESTROYED);
          }
          return true;
        break;
        case 184: //printCrosshairs
          var count = 0;
          var length = Object.keys(crosshairs).length;
          terminal.printHeader(Text.CROSSHAIRS);
          for (var crosshairName in crosshairs){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, crosshairName + " ["+crosshairs[crosshairName].registeredSceneName+"]").replace(Text.PARAM2, crosshairs[crosshairName].configurations.texture), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_CROSSHAIRS_CREATED);
          }
          return true;
        break;
        case 185: //scripts
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          terminal.disable();
          terminal.clear();
          terminal.printInfo(Text.LOADING);
          scriptsHandler.getFiles(function(scriptDescriptions){
            terminal.clear();
            scriptsGUIHandler.show(scriptDescriptions);
          });
          return true;
        break;
        case 186: //animations
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              obj = addedTexts[objName];
              if (!obj){
                obj = sprites[objName];
                if (!obj){
                  terminal.printError(Text.NO_SUCH_OBJECT);
                  return true;
                }
              }
            }
          }
          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            if (obj.isAddedObject || obj.isObjectGroup){
              terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            }else if (obj.isAddedText){
              terminal.printError(Text.TEXT_NOT_IN_SCENE);
            }else{
              terminal.printError(Text.SPRITE_NOT_IN_ACTIVE_SCENE);
            }
            return true;
          }
          animationCreatorGUIHandler.show(obj);
          return true;
        break;
        case 187: //createScene
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sceneName = splitted[1];
          if (sceneHandler.scenes[sceneName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          sceneHandler.createScene(sceneName);
          terminal.printInfo(Text.SCENE_CREATED);
          return true;
        break;
        case 188: //switchScene
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sceneName = splitted[1];
          if (!sceneHandler.scenes[sceneName]){
            terminal.printError(Text.NO_SUCH_SCENE);
            return true;
          }
          if (sceneName == sceneHandler.activeSceneName){
            terminal.printError(Text.SCENE_IS_ALREADY_ACTIVE);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          guiHandler.hideAll();
          sceneHandler.changeScene(sceneName);
          if (physicsDebugMode){
            parseCommand("switchPhysicsDebugMode");
            parseCommand("switchPhysicsDebugMode");
          }
          refreshRaycaster(Text.SCENE_SWITCHED);
          return true;
        break;
        case 189: //printScenes
          var count = 0;
          var length = Object.keys(sceneHandler.scenes).length;
          terminal.printHeader(Text.SCENES);
          for (var sceneName in sceneHandler.scenes){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, sceneName), options);
          }
          return true;
        break;
        case 190: //setEntryScene
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sceneName = splitted[1];
          if (!sceneHandler.scenes[sceneName]){
            terminal.printError(Text.NO_SUCH_SCENE);
            return true;
          }
          sceneHandler.entrySceneName = sceneName;
          terminal.printInfo(Text.ENTRY_SCENE_SET.replace(Text.PARAM1, sceneName));
          return true;
        break;
        case 191: //destroyScene
          if (mode != 0){
            terminal.printError(Tetx.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sceneName = splitted[1];
          if (!(sceneName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!sceneHandler.scenes[sceneName]){
            terminal.printError(Text.NO_SUCH_SCENE);
            return true;
          }
          if (sceneHandler.getActiveSceneName() == sceneName){
            terminal.printError(Text.SCENE_IS_ACTIVE_CANNOT_DELETE);
            return true;
          }
          if (sceneHandler.entrySceneName == sceneName){
            terminal.printError(Text.CANNOT_DELETE_ENTRY_SCENE);
            return true;
          }
          sceneHandler.destroyScene(sceneName);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SCENE_DESTROYED);
          }
          return true;
        break;
        case 192: //syncTextProperties
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sourceText = addedTexts[splitted[1]];
          var targetText = addedTexts[splitted[2]];
          if (!sourceText){
            terminal.printError(Text.SOURCE_TEXT_IS_NOT_DEFINED);
            return true;
          }
          if (!targetText){
            terminal.printError(Text.TARGET_TEXT_IS_NOT_DEFINED);
            return true;
          }
          if (sourceText.name == targetText.name){
            terminal.printError(Text.TEXTS_ARE_THE_SAME);
            return true;
          }
          if (sourceText.is2D != targetText.is2D){
            terminal.printError(Text.TEXTS_HAVE_DIFFERENT_DIMENSIONS);
            return true;
          }
          targetText.syncProperties(sourceText);
          refreshRaycaster(Text.TEXT_PROPERTIES_SYNCED);
          return true;
        break;
        case 193: //newLightning
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var lightningName = splitted[1];
          if (lightnings[lightningName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          lightningCreatorGUIHandler.show(lightningName, false);
          terminal.disable();
          terminal.clear();
          terminal.printInfo(Text.AFTER_LIGHTNING_CREATION);
          return true;
        break;
        case 194: //editLightning
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var lightningName = splitted[1];
          if (!lightnings[lightningName]){
            terminal.printError(Text.NO_SUCH_LIGHTNING);
            return true;
          }
          lightningCreatorGUIHandler.show(lightningName, true);
          terminal.disable();
          terminal.clear();
          terminal.printInfo(Text.AFTER_LIGHTNING_CREATION);
          return true;
        break;
        case 195: //destroyLightning
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var lightning = lightnings[splitted[1]];
          if (!lightning){
            terminal.printError(Text.NO_SUCH_LIGHTNING);
            return true;
          }
          lightning.destroy();
          delete lightnings[lightning.name];
          lightningHandler.onLightningDeletion(lightning);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.LIGHTNING_DESTROYED);
          }
          sceneHandler.onLightningDeletion(lightning);
          return true;
        break;
        case 196: //printLightnings
          var count = 0;
          var length = Object.keys(lightnings).length;
          terminal.printHeader(Text.LIGHTNINGS);
          for (var lightningName in lightnings){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, lightningName + " ["+lightnings[lightningName].registeredSceneName+"]").replace(Text.PARAM2, lightnings[lightningName].colorName), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_LIGHTNINGS_CREATED);
          }
          return true;
        break;
        case 197: //printTotalPhysicsShapeCount
          var count = 0;
          var addedObjectsInScene = sceneHandler.getAddedObjects();
          var objectGroupsInScene = sceneHandler.getObjectGroups();
          for (var objName in addedObjectsInScene){
            var addedObject = addedObjectsInScene[objName];
            if (!addedObject.noMass){
              count += addedObject.physicsBody.shapes.length;
            }
          }
          for (var objName in objectGroupsInScene){
            var objectGroup = objectGroupsInScene[objName];
            if (!objectGroup.noMass){
              count += objectGroup.physicsBody.shapes.length;
            }
          }
          terminal.printHeader(Text.SHAPES);
          terminal.printInfo(Text.TREE.replace(Text.PARAM1, count));
          return true;
        break;
        case 198: //newSprite
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var spriteName = splitted[1];
          if (!checkIfNameUnique(spriteName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          sprites[spriteName] = new Sprite(spriteName);
          sprites[spriteName].setRefHeight();
          sprites[spriteName].originalWidth = sprites[spriteName].calculateWidthPercent();
          sprites[spriteName].originalHeight = sprites[spriteName].calculateHeightPercent();
          sprites[spriteName].originalWidthReference = renderer.getCurrentViewport().z;
          sprites[spriteName].originalHeightReference = renderer.getCurrentViewport().w;
          sprites[spriteName].originalScreenResolution = screenResolution;
          sceneHandler.onSpriteCreation(sprites[spriteName]);
          selectionHandler.select(sprites[spriteName]);
          refreshRaycaster(Text.SPRITE_CREATED);
          return true;
        break;
        case 199: //destroySprite
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var spriteName = splitted[1];
          var sprite = sprites[spriteName];
          if (!sprite){
            terminal.printError(Text.NO_SUCH_SPRITE);
            return true;
          }
          sprite.destroy();
          if (sprite.containerParent){
            sprite.containerParent.removeSprite();
          }
          sceneHandler.onSpriteDeletion(sprite);
          selectionHandler.resetCurrentSelection();
          refreshRaycaster(Text.SPRITE_DESTROYED);
          return true;
        break;
        case 200: //selectSprite
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var spriteName = splitted[1];
          var sprite = sprites[spriteName];
          if (!sprite){
            terminal.printError(Text.NO_SUCH_SPRITE);
            return true;
          }
          selectionHandler.select(sprite);
          terminal.printInfo(Text.SPRITE_SELECTED);
          return true;
        break;
        case 201: //printSprites
          var count = 0;
          var length = Object.keys(sprites).length;
          terminal.printHeader(Text.SPRITES);
          for (var spriteName in sprites){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, spriteName + " ["+sprites[spriteName].registeredSceneName+"]"), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_SPRITES_CREATED);
          }
          return true;
        break;
        case 202: //setBackgroundColor
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          sceneHandler.setBackgroundColor(splitted[1]);
          terminal.printInfo(Text.BACKGROUND_COLOR_SET);
          return true;
        break;
        case 203: //newContainer
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var containerName = splitted[1];
          if (!checkIfNameUnique(containerName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          var container = new Container2D(containerName, 50, 50, 10, 10);
          container.makeVisible();
          containers[containerName] = container;
          selectionHandler.select(container);
          guiHandler.afterObjectSelection();
          sceneHandler.onContainerCreation(container);
          refreshRaycaster(Text.CONTAINER_CREATED);
          return true;
        break;
        case 204: //selectContainer
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var containerName = splitted[1];
          if (!containers[containerName]){
            terminal.printError(Text.NO_SUCH_CONTAINER);
            return true;
          }
          if (containers[containerName].registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.CONTAINER_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          selectionHandler.select(containers[containerName]);
          guiHandler.afterObjectSelection();
          terminal.printInfo(Text.CONTAINER_SELECTED);
          return true;
        break;
        case 205: //addToContainer
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var container = containers[splitted[1]];
          var objName = splitted[2];
          if (!container){
            terminal.printError(Text.NO_SUCH_CONTAINER);
            return true;
          }
          if (container.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.CONTAINER_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          var obj = addedTexts[objName];
          if (!obj){
            obj = sprites[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }else{
              if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
                terminal.printError(Text.SPRITE_NOT_IN_ACTIVE_SCENE);
                return true;
              }
            }
          }else{
            if (!obj.is2D){
              terminal.printError(Text.WORKS_ONLY_FOR_2D_TEXTS);
              return true;
            }
            if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
              terminal.printError(Text.TEXT_NOT_IN_SCENE);
              return true;
            }
          }
          if (container.addedText || container.sprite){
            terminal.printError(Text.CONTAINER_ALREADY_FULL);
            return true;
          }
          if (obj.containerParent){
            terminal.printError(Text.OBJECT_ALREADY_INSIDE_CONTAINER.replace(Text.PARAM1, obj.containerParent.name));
            return true;
          }
          if (obj.isAddedText){
            container.insertAddedText(obj);
          }else{
            container.insertSprite(obj);
          }
          terminal.printInfo(Text.OBJECT_ADDED_TO_CONTAINER);
          return true;
        break;
        case 206: //emptyContainer
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var container = containers[splitted[1]];
          if (!container){
            terminal.printError(Text.NO_SUCH_CONTAINER);
            return true;
          }
          if (container.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.CONTAINER_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          if (!container.addedText && !container.sprite){
            terminal.printError(Text.CONTAINER_IS_EMPTY);
            return true;
          }
          container.makeEmpty();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.CONTAINER_EMPTIED);
          }
          return true;
        break;
        case 207: //alignContainers
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var parentContainer = containers[splitted[1]];
          var childContainer = containers[splitted[2]];
          var alignmentType = splitted[3].toUpperCase();
          var margin = parseFloat(splitted[4]);
          if (!parentContainer){
            terminal.printError(Text.PARENT_CONTAINER_DOES_NOT_EXIST);
            return true;
          }
          if (!childContainer){
            terminal.printError(Text.CHILD_CONTAINER_DOES_NOT_EXIST);
            return true;
          }
          if (splitted[1] == splitted[2]){
            terminal.printError(Text.CANNOT_ALIGN_SAME_CONTAINER);
          }
          if (parentContainer.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.PARENT_CONTAINER_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          if (childContainer.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.CHILD_CONTAINER_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          if (alignmentType != "CONTAINER_ALIGNMENT_TYPE_TOP" && alignmentType != "CONTAINER_ALIGNMENT_TYPE_BOTTOM" && alignmentType != "CONTAINER_ALIGNMENT_TYPE_LEFT" && alignmentType != "CONTAINER_ALIGNMENT_TYPE_RIGHT"){
            terminal.printError(Text.INVALID_ALIGNMENT_TYPE);
            return true;
          }
          if (isNaN(margin)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "margin"));
            return true;
          }
          if (childContainer.alignedParent && childContainer.alignedParent.name != parentContainer.name){
            terminal.printError(Text.CHILD_CONTAINER_IS_ALREADY_ALIGNED);
            return true;
          }
          parentContainer.addAlignedContainer({container: childContainer, alignmentType: alignmentType, value: margin});
          childContainer.alignedParent = parentContainer;
          terminal.printInfo(Text.CONTAINER_ALIGNED);
          return true;
        break;
        case 208: //unalignContainer
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var container = containers[splitted[1]];
          if (!container){
            terminal.printError(Text.NO_SUCH_CONTAINER);
            return true;
          }
          if (container.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.CONTAINER_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          if (!container.alignedParent){
            terminal.printError(Text.CONTAINER_IS_NOT_ALIGNED);
            return true;
          }
          container.alignedParent.unalign(container);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.CONTAINER_UNALIGNED);
          }
          return true;
        break;
        case 209: //destroyContainer
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var container = containers[splitted[1]];
          if (!container){
            terminal.printError(Text.NO_SUCH_CONTAINER);
            return true;
          }
          sceneHandler.onContainerDeletion(container);
          container.destroy();
          if (!jobHandlerWorking){
            refreshRaycaster(Text.CONTAINER_DESTROYED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
          selectionHandler.resetCurrentSelection();
          return true;
        break;
        case 210: //printContainers
          var count = 0;
          var length = Object.keys(containers).length;
          terminal.printHeader(Text.CONTAINERS);
          for (var containerName in containers){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, containerName + " ["+containers[containerName].registeredSceneName+"]"), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_CONTAINERS_CREATED);
          }
          return true;
        break;
        case 211: //newVirtualKeyboard
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var vkName = splitted[1];
          if (!checkIfNameUnique(vkName, Text.NAME_MUST_BE_UNIQUE)){
            return true;
          }
          if (Object.keys(fonts).length == 0){
            terminal.printError(Text.NO_FONTS_CREATED);
            return true;
          }
          virtualKeyboardCreatorGUIHandler.show(vkName);
          return true;
        break;
        case 212: //editVirtualKeyboard
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var vkName = splitted[1];
          if (!virtualKeyboards[vkName]){
            terminal.printError(Text.NO_SUCH_VIRTUAL_KEYBOARD);
            return true;
          }
          if (sceneHandler.getActiveSceneName() != virtualKeyboards[vkName].registeredSceneName){
            terminal.printError(Text.VIRTUAL_KEYBOARD_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          virtualKeyboardCreatorGUIHandler.show(vkName);
          return true;
        break;
        case 213: //destroyVirtualKeyboard
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var vkName = splitted[1];
          if (!virtualKeyboards[vkName]){
            terminal.printError(Text.NO_SUCH_VIRTUAL_KEYBOARD);
            return true;
          }
          virtualKeyboards[vkName].destroy();
          sceneHandler.onVirtualKeyboardDeletion(virtualKeyboards[vkName]);
          delete virtualKeyboards[vkName];
          if (!jobHandlerWorking){
            terminal.printError(Text.VIRTUAL_KEYBOARD_DESTROYED);
          }
          return true;
        break;
        case 214: //printVirtualKeyboards
          var count = 0;
          var length = Object.keys(virtualKeyboards).length;
          terminal.printHeader(Text.VIRTUAL_KEYBOARDS);
          for (var vkName in virtualKeyboards){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, vkName + " ["+virtualKeyboards[vkName].registeredSceneName+"]"), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_VIRTUAL_KEYBOARDS_CREATED);
          }
          return true;
        break;
        case 215: //syncSpriteSize
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sourceSprite = sprites[splitted[1]];
          var targetSprite = sprites[splitted[2]];
          if (!sourceSprite){
            terminal.printError(Text.SOURCESPRITE_DOES_NOT_EXIST);
            return true;
          }
          if (!targetSprite){
            terminal.printError(Text.TARGETSPRITE_DOES_NOT_EXIST);
            return true;
          }
          if (targetSprite.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.TARGETSPRITE_NOT_IN_ACTIVE_SCENE);
            return true;
          }
          targetSprite.refHeight = sourceSprite.refHeight;
          targetSprite.setScale(sourceSprite.mesh.material.uniforms.scale.value.x, sourceSprite.mesh.material.uniforms.scale.value.y);
          targetSprite.setWidthPercent(sourceSprite.calculateWidthPercent());
          targetSprite.setHeightPercent(sourceSprite.calculateHeightPercent());
          terminal.printInfo(Text.SPRITE_SIZE_ADJUSTED);
          return true;
        break;
        case 216: //newDynamicTextureFolder
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var folderName = splitted[1];
          if (dynamicTextureFolders[folderName]){
            terminal.printInfo(Text.DYNAMIC_TEXTURE_FOLDER_WITH_SAME_NAME);
            return true;
          }
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/prepareDynamicTextures", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function(){
            if (xhr.readyState == 4 && xhr.status == 200){
              var resp = JSON.parse(xhr.responseText);
              terminal.clear();
              terminal.enable();
              canvas.style.visibility = "";
              if (resp.folderDoesNotExist){
                terminal.printError(Text.FOLDER_DOES_NOT_EXIST_UNDER_DYNAMIC_TEXTURES);
                return;
              }else if (resp.errorFile){
                terminal.printError(Text.ERROR_HAPPENED_COMPRESSING_TEXTURE.replace(Text.PARAM1, resp.errorFile));
                return;
              }
              dynamicTextureFolders[folderName] = true;
              terminal.printInfo(Text.DYNAMIC_TEXTURE_FOLDER_PREPARED);
            }
          }
          xhr.send(JSON.stringify({folderName: folderName}));
          return true;
        break;
        case 217: //destroyDynamicTextureFolder
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var folderName = splitted[1];
          if (!(folderName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!dynamicTextureFolders[folderName]){
            terminal.printError(Text.NO_SUCH_DYNAMIC_TEXTURE_FOLDER);
            return true;
          }
          delete dynamicTextureFolders[folderName];
          if (!jobHandlerWorking){
            terminal.printInfo(Text.DYNAMIC_TEXTURE_FOLDER_DESTROYED);
          }
          return true;
        break;
        case 218: //printDynamicTextureFolders
          var count = 0;
          var length = Object.keys(dynamicTextureFolders).length;
          terminal.printHeader(Text.DYNAMIC_TEXTURE_FOLDERS);
          for (var folderName in dynamicTextureFolders){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, folderName), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_DYNAMIC_TEXTURE_FOLDERS_CREATED);
          }
          return true;
        break;
        case 219: //setProtocolDefinition
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var fileName = splitted[1];
          terminal.printInfo(Text.LOADING);
          canvas.style.visibility = "hidden";
          terminal.disable();
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/checkProtocolDefinitionFile", true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.onreadystatechange = function(){
            canvas.style.visibility = "";
            if (xhr.readyState == 4 && xhr.status == 200){
              var resp = JSON.parse(xhr.responseText);
              terminal.clear();
              terminal.enable();
              if (resp.error){
                terminal.printError(Text.PROTOCOL_DEFINITION_FILE_DOES_NOT_EXIST.replace(Text.PARAM1, "/protocol_definitions/"+this.fileName));
              }else{
                protocolDefinitionFileName = this.fileName;
                terminal.printInfo(Text.PROTOCOL_DEFINITION_FILE_SET);
              }
            }
          }.bind({fileName: fileName})
          xhr.send(JSON.stringify({fileName: fileName}));
        break;
        case 220: //resetProtocolDefinition
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          protocolDefinitionFileName = 0;
          terminal.printInfo(Text.PROTOCOL_DEFINITION_FILE_RESET);
          return true;
        break;
        case 221: //printProtocolDefinition
          if (!protocolDefinitionFileName){
            terminal.printError(Text.PROTOCOL_DEFINITION_FILE_IS_NOT_SET);
            return true;
          }
          terminal.printInfo(Text.PROTOCOL_DEFINITION_WILL_BE_LOADED_FROM.replace(Text.PARAM1, "/protocol_definitions/"+protocolDefinitionFileName));
          return true;
        break;
        case 222: //setWSServerURL
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          serverWSURL = splitted[1];
          terminal.printInfo(Text.SERVER_WS_URL_SET);
          return true;
        break;
        case 223: //resetWSServerURL
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          serverWSURL = 0;
          terminal.printInfo(Text.SERVER_WS_URL_RESET);
          return true;
        break;
        case 224: //printWSServerURL
          if (serverWSURL){
            terminal.printInfo(Text.SERVER_WS_URL_IS.replace(Text.PARAM1, serverWSURL));
          }else{
            terminal.printError(Text.SERVER_WS_URL_IS_NOT_SET);
          }
          return true;
        break;
        case 225: //exportObject
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          var obj = addedObjects[objName] || objectGroups[objName];
          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          if (obj.softCopyParentName){
            terminal.printError(Text.OBJECT_IS_A_COPY);
            return true;
          }
          if (obj.pivotObject){
            terminal.printError(Text.OBJECT_HAS_PIVOT);
            return true;
          }
          save(objectExportImportHandler.exportObject(obj) ,"object_export_" + obj.name);
          return true;
        break;
        case 226: //importObject
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var objName = splitted[1];
          if (addedObjects[objName] || objectGroups[objName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
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
                  var json = JSON.parse(data);
                  if (!json.isROYGBIVObjectExport){
                    terminal.printError(Text.FILE_NOT_VALID);
                    return;
                  }
                  terminal.clear();
                  terminal.disable();
                  objectExportImportHandler.importObject(objName, json, function(){
                    terminal.clear();
                    refreshRaycaster(Text.OBJECT_IMPORTED);
                  });
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
          return true;
        break;
        case 227: //exportParticleSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var psName = splitted[1];
          var ps = preConfiguredParticleSystems[psName];
          if (!ps){
            terminal.printError(Text.NO_SUCH_PARTICLE_SYSTEM);
            return true;
          }
          save(objectExportImportHandler.exportParticleSystem(ps) ,"particle_system_export_" + ps.name);
          return true;
        break;
        case 228: //importParticleSystem
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var psName = splitted[1];
          if (preConfiguredParticleSystems[psName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
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
                  var json = JSON.parse(data);
                  if (!json.isROYGBIVParticleSystemExport){
                    terminal.printError(Text.FILE_NOT_VALID);
                    return;
                  }
                  terminal.clear();
                  terminal.disable();
                  objectExportImportHandler.importParticleSystem(psName, json, function(){
                    terminal.clear();
                    terminal.enable();
                    terminal.printInfo(Text.PS_IMPORTED);
                  });
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
          return true;
        break;
        case 229: //setObjectPosition
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var obj = addedObjects[splitted[1]] || objectGroups[splitted[1]];
          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }
          var x = parseFloat(splitted[2]);
          var y = parseFloat(splitted[3]);
          var z = parseFloat(splitted[4]);
          if (isNaN(x)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "x"));
            return true;
          }
          if (isNaN(y)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "y"));
            return true;
          }
          if (isNaN(z)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "z"));
            return true;
          }
          obj.setPosition(x, y, z);
          terminal.printInfo(Text.POSITION_SET);
          return true;
        break;
        case 230: //syncAnimations
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var sourceName = splitted[1];
          var targetName = splitted[2];
          if (targetName.indexOf("*") != -1){
            new JobHandler(splitted).handle();
            return true;
          }
          var sourceObj = addedObjects[sourceName] || objectGroups[sourceName] || addedTexts[sourceName] || sprites[sourceName];
          var targetObj = addedObjects[targetName] || objectGroups[targetName] || addedTexts[targetName] || sprites[targetName];
          if (!sourceObj){
            terminal.printError(Text.SOURCE_OBJECT_NOT_DEFINED);
            return true;
          }
          if (!targetObj){
            terminal.printError(Text.TARGET_OBJECT_NOT_DEFINED);
            return true;
          }
          if (sourceObj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.SOURCE_OBJECT_NOT_IN_SCENE);
            return true;
          }
          if (targetObj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.TARGET_OBJECT_NOT_IN_SCENE);
            return true;
          }
          if ((sourceObj.isAddedObject || sourceObj.isObjectGroup) && !(targetObj.isAddedObject || targetObj.isObjectGroup)){
            terminal.printError(Text.OBJECTS_HAVE_DIFFERENT_TYPES);
            return true;
          }
          if (sourceObj.isAddedText && !targetObj.isAddedText){
            terminal.printError(Text.OBJECTS_HAVE_DIFFERENT_TYPES);
            return true;
          }
          if (sourceObj.isSprite && !targetObj.isSprite){
            terminal.printError(Text.OBJECTS_HAVE_DIFFERENT_TYPES);
            return true;
          }
          if (sourceObj.name == targetObj.name){
            terminal.printError(Text.SOURCE_AND_TARGET_OBJECTS_ARE_THE_SAME);
            return true;
          }
          targetObj.copyAnimationsFromObject(sourceObj);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.ANIMATIONS_SYNCED);
          }
          return true;
        break;
        case 231: //lights
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (guiHandler.datGuiLights){
            terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
            return true;
          }
          lightsGUIHandler.show();
          terminal.printInfo(Text.GUI_OPENED);
          return true;
        break;
        case 232: //setAcceptedTextureSize
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (Object.keys(texturePacks).length){
            terminal.printError(Text.CANNOT_SET_TEXTURE_SIZE_AFTER);
            return true;
          }
          var textureSize = parseInt(splitted[1]);
          if (isNaN(textureSize)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "textureSize"));
            return true;
          }
          if (textureSize <= 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "textureSize").replace(Text.PARAM2, "0"));
            return true;
          }
          if ((Math.log(textureSize)/Math.log(2)) % 1 != 0){
            terminal.printError(Text.IS_NOT_POWER_OF_TWO.replace(Text.PARAM1, "textureSize"));
            return true;
          }
          if (textureSize > MAX_TEXTURE_SIZE){
            terminal.printError(Text.MUST_BE_LESS_THAN.replace(Text.PARAM1, "textureSize").replace(Text.PARAM2, MAX_TEXTURE_SIZE));
            return true;
          }
          ACCEPTED_TEXTURE_SIZE = textureSize;
          terminal.printInfo(Text.ACCEPTED_TEXTURE_SIZE_SET);
          return true;
        break;
        case 233: //printAcceptedTextureSize
          terminal.printHeader(Text.ACCEPTED_TEXTURE_SIZE);
          terminal.printInfo(Text.TREE.replace(Text.PARAM1, ACCEPTED_TEXTURE_SIZE));
          return true;
        break;
        case 234: //switchAIDebugMode
          var res = steeringHandler.switchDebugMode();
          if (res){
            terminal.printInfo(Text.AI_DEBUG_MODE_SWITCHED_ON);
          }else {
            terminal.printInfo(Text.AI_DEBUG_MODE_SWITCHED_OFF);
          }
          return true;
        break;
        case 235: //newAIObstacle
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var obstacleID = splitted[1];
          if (!(obstacleID.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          if (!jobHandlerWorking){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1 && gridSelectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
          }

          var selections = [];
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              selections.push(gridSelections[gridName]);
            }
          }else{
            selections.push(jobHandlerSelectedGrid);
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

          var height = parseFloat(splitted[2]);

          if (steeringHandler.usedEntityIDs[obstacleID]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          if (isNaN(height)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "height"));
            return true;
          }

          gridSystem.newAIObstacle(selections, obstacleID, height);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.AI_OBSTACLE_CREATED);
          }
          return true;
        break;
        case 236: //destroyAIObstacle
          if (mode != 0){
            terminal.printInfo(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var id = splitted[1];
          if (!(id.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!steeringHandler.usedEntityIDs[id]){
            terminal.printError(Text.NO_SUCH_OBSTACLE);
            return true;
          }
          var obj = addedObjects[id];
          if (!obj){
            for (var objName in objectGroups){
              for (var childName in objectGroups[objName].group){
                if (childName == id){
                  obj = objectGroups[objName];
                  break;
                }
              }
            }
          }
          if (obj && obj.usedAsAIEntity && obj.registeredSceneName == sceneHandler.getActiveSceneName()){
            obj.unUseAsAIEntity();
            if (!jobHandlerWorking){
              terminal.printInfo(Text.OBSTACLE_DESTROYED);
            }
            selectionHandler.resetCurrentSelection();
            return true;
          }else{
            var obstacles = steeringHandler.obstaclesBySceneName[sceneHandler.getActiveSceneName()] || {};
            for (var key in obstacles){
              if (key == id){
                steeringHandler.removeObstacle(id);
                if (!jobHandlerWorking){
                  terminal.printInfo(Text.OBSTACLE_DESTROYED);
                }
                selectionHandler.resetCurrentSelection();
                return true;
              }
            }
          }
          if (!jobHandlerWorking){
            terminal.printError(Text.OBSTACLE_NOT_IN_ACTIVE_SCENE);
          }
          return true;
        break;
        case 237: //printAIObstacles
          var count = 0;
          var obstacles = steeringHandler.obstaclesBySceneName[sceneHandler.getActiveSceneName()] || {};
          var length = Object.keys(obstacles).length;
          terminal.printHeader(Text.AI_OBSTACLES_IN_THIS_SCENE);
          for (var id in obstacles){
            count ++;
            var options = true;
            if (count == length){
              options = false;
            }
            var entity = obstacles[id];
            var printedID = entity.excludeFromHide? (id + " (excluded from HideBehavior)"): id;
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, printedID), options);
          }
          if (count == 0){
            terminal.printError(Text.NO_AI_OBSTACLES_CREATED);
          }
          return true;
        break;
        case 238: //aiEntity
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var obj = addedObjects[splitted[1]] || objectGroups[splitted[1]];

          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(TEXT.OBJECT_NOT_IN_SCENE);
            return true;
          }

          var parameter = splitted[2].toUpperCase();

          if (parameter != "ON" && parameter != "OFF"){
            terminal.printError(Text.PARAMETER_MUST_BE_ON_OFF);
            return true;
          }

          if (parameter == "ON"){
            if (obj.usedAsAIEntity){
              terminal.printError(Text.OBJECT_IS_ALREADY_USED_AS_AI_ENTITY);
              return true;
            }

            obj.useAsAIEntity();
            if (!jobHandlerWorking){
              terminal.printInfo(Text.OBJECT_WILL_BE_USED_AS_AI_ENTITY);
            }
          }else{
            if (!obj.usedAsAIEntity){
              terminal.printError(Text.OBJECT_IS_ALREADY_NOT_USED_AS_AI_ENTITY);
              return true;
            }

            obj.unUseAsAIEntity();
            if (!jobHandlerWorking){
              terminal.printInfo(Text.OBJECT_WONT_BE_USED_AS_AI_ENTITY);
            }
          }

          selectionHandler.resetCurrentSelection();
          return true;
        break;
        case 239: //newJumpDescriptor
          // DEPRECATED
        break;
        case 240: //destroyJumpDescriptor
          // DEPRECATED
        break;
        case 241: //printJumpDescriptors
          // DEPRECATED
        break;
        case 242: //newPath
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var id = splitted[1];
          var points = splitted[2];
          var loop = splitted[3];
          var rewind = splitted[4];

          if (steeringHandler.usedPathIDs[id] || steeringHandler.usedAStarIDs[id]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          var pointsSplitted = points.split(",");

          var waypoints = [];
          for (var i = 0; i < pointsSplitted.length; i ++){
            var point = pointsSplitted[i];
            var ary = [];
            if (point.indexOf("*") >= 0){
              var nameSplitted = point.split("*");
              for (var ptName in sceneHandler.getMarkedPoints()){
                if (ptName.toLowerCase().startsWith(nameSplitted[0].toLowerCase())){
                  ary.push(markedPoints[ptName]);
                }
              }
            }else{
              if (!markedPoints[point]){
                terminal.printError(Text.POINT_X_DOES_NOT_EXIST.replace(Text.PARAM1, i));
                return true;
              }

              if(!sceneHandler.getMarkedPoints()[point]){
                terminal.printError(Text.POINT_X_NOT_IN_ACTIVE_SCENE.replace(Text.PARAM1, i));
                return true;
              }

              ary.push(markedPoints[point]);
            }

            for (var i2 = 0; i2 < ary.length; i2 ++){
              if (waypoints.indexOf(ary[i2]) < 0){
                waypoints.push(ary[i2]);
              }
            }
          }

          if (waypoints.length < 2){
            terminal.printError(Text.MUST_SPECIFY_AT_LEAST_TWO_POINTS);
            return true;
          }

          loop = loop.toLowerCase();

          if (loop != "true" && loop != "false"){
            terminal.printError(Text.LOOP_MUST_BE_TRUE_OR_FALSE);
            return true;
          }

          rewind = rewind.toLowerCase();

          if (rewind != "true" && rewind != "false"){
            terminal.printError(Text.REWIND_MUST_BE_TRUE_OR_FALSE);
            return true;
          }

          steeringHandler.addPath(id, waypoints, loop === "true", rewind === "true");
          terminal.printInfo(Text.PATH_CREATED);
          return true;
        break;
        case 243: //destroyPath
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var id = splitted[1];

          if (!(id.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          if (!steeringHandler.usedPathIDs[id]){
            terminal.printError(Text.NO_SUCH_PATH);
            return true;
          }

          var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
          if (!paths[id]){
            terminal.printError(Text.PATH_NOT_INSIDE_ACTIVE_SCENE);
            return true;
          }

          steeringHandler.removePath(id);

          if (!jobHandlerWorking){
            terminal.printInfo(Text.PATH_DESTROYED);
          }
          return true;
        break;
        case 244: //printPaths
          var count = 0;
          var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
          terminal.printHeader(Text.PATHS_IN_THIS_SCENE);
          for (var id in paths){
            count ++;
            var path = paths[id];

            terminal.printInfo(Text.TREE.replace(Text.PARAM1, id), true);
            terminal.printInfo(Text.SUBTREE2.replace(Text.PARAM1, "loop").replace(Text.PARAM2, path.loop), true);
            terminal.printInfo(Text.SUBTREE2.replace(Text.PARAM1, "rewind").replace(Text.PARAM2, path.rewind), true);
            terminal.printInfo(Text.SUBTREE.replace(Text.PARAM1, "waypoints"), true);
            for (var i = 0; i < path.waypoints.length; i ++){
              var wp = path.waypoints[i];
              terminal.printInfo(Text.SUBTREE3.replace(Text.PARAM1, "("+ wp.x +", " + wp.y + ", " + wp.z + ")"), true);
            }

            var insertedJDs = {};
            for (var jdID in steeringHandler.pathsByJumpDescriptors){
              for (var pid in steeringHandler.pathsByJumpDescriptors[jdID]){
                if (pid == id){
                  insertedJDs[jdID] = true;
                }
              }
            }

            var insertedJDsCount = Object.keys(insertedJDs).length;
            if (insertedJDsCount > 0){
              terminal.printInfo(Text.SUBTREE.replace(Text.PARAM1, "Inserted jump descriptors"), true);
              var ct = 0;
              for (var jdID in insertedJDs){
                ct ++;
                terminal.printInfo(Text.SUBTREE3.replace(Text.PARAM1, jdID), ct != insertedJDsCount);
              }
            }else{
              terminal.printInfo(Text.SUBTREE2.replace(Text.PARAM1, "Inserted jump descriptors").replace(Text.PARAM2, "none"), false);
            }
          }
          if (count == 0){
            terminal.printError(Text.NO_PATHS_IN_THIS_SCENE);
          }
          return true;
        break;
        case 245: //insertJumpDescriptorToPath
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var jdID = splitted[1];
          var pathID = splitted[2];

          if (!steeringHandler.usedJumpDescriptorIDs[jdID]){
            terminal.printError(Text.NO_SUCH_JUMPDESCRIPTOR);
            return true;
          }

          if (!steeringHandler.usedPathIDs[pathID]){
            terminal.printError(Text.NO_SUCH_PATH);
            return true;
          }

          var jumpDescriptors = steeringHandler.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()] || {};
          var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};

          if (!jumpDescriptors[jdID]){
            terminal.printError(Text.JUMPDESCRIPTOR_NOT_IN_ACTIVE_SCENE);
            return true;
          }

          if (!paths[pathID]){
            terminal.printError(Text.PATH_NOT_INSIDE_ACTIVE_SCENE);
            return true;
          }

          for (var pid in steeringHandler.pathsByJumpDescriptors[jdID]){
            if (pid == pathID){
              terminal.printError(Text.JUMPDESCRIPTOR_ALREADY_INSERTED_TO_THE_PATH);
              return true;
            }
          }

          if (steeringHandler.insertJumpDescriptorToPath(jdID, pathID)){
            terminal.printInfo(Text.JUMPDESCRIPTOR_INSERTED_INTO_THE_PATH);
          }else{
            terminal.printError(Text.JUMPDESCRIPTOR_IS_NOT_ON_THE_PATH);
          }

          return true;
        break;
        case 246: //constructGraph
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var id = splitted[1];
          if (steeringHandler.usedGraphIDs[id]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          var offsetX = parseFloat(splitted[2]);
          var offsetY = parseFloat(splitted[3]);
          var offsetZ = parseFloat(splitted[4]);

          if (isNaN(offsetX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetX"));
            return true;
          }

          if (isNaN(offsetY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetY"));
            return true;
          }

          if (isNaN(offsetZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetZ"));
            return true;
          }

          if (Object.keys(gridSelections).length < 2){
            terminal.printError(Text.MUST_HAVE_AT_LEAST_TWO_GRIDS_SELECTED);
            return true;
          }

          var gsName = null;
          for (var gridID in gridSelections){
            if (gsName == null){
              gsName = gridSelections[gridID].parentName;
            }else if (gsName != gridSelections[gridID].parentName){
              terminal.printError(Text.SELECTED_GRIDS_SAME_GRIDSYSTEM);
              return true;
            }
          }

          steeringHandler.constructGraph(id, gridSelections, offsetX, offsetY, offsetZ);
          for (var gridName in gridSelections){
            gridSelections[gridName].toggleSelect(false, false, false, true);
          }
          terminal.printInfo(Text.GRAPH_CONSTRUCTED);
          return true;
        break;
        case 247: //destroyGraph
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var id = splitted[1];

          if (!(id.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          if (!steeringHandler.usedGraphIDs[id]){
            terminal.printError(Text.NO_SUCH_GRAPH);
            return true;
          }

          var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
          if (!graphs[id]){
            terminal.printError(Text.GRAPH_NOT_INSIDE_ACTIVE_SCENE);
            return true;
          }

          for (var asid in steeringHandler.graphIDsByAStars){
            if (steeringHandler.graphIDsByAStars[asid] == id){
              terminal.printError(Text.GRAPH_USED_IN_ASTAR.replace(Text.PARAM1, asid));
              return true;
            }
          }

          steeringHandler.removeGraph(id);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.GRAPH_DESTROYED);
          }
          return true;
        break;
        case 248: //printGraphs
          var count = 0;
          var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
          terminal.printHeader(Text.GRAPHS_IN_THIS_SCENE);
          for (var id in graphs){
            count ++;
            var graph = graphs[id];

            terminal.printInfo(Text.TREE.replace(Text.PARAM1, id), true);
            terminal.printInfo(Text.SUBTREE.replace(Text.PARAM1, "vertices"), true);
            graph.forEachVertex(function(x, y, z){
              terminal.printInfo(Text.SUBTREE3.replace(Text.PARAM1, "("+ x +", " + y + ", " + z + ")"), true);
            });
            terminal.printInfo(Text.SUBTREE.replace(Text.PARAM1, "edges"), true);
            var totalEdgeCount = 0;
            var edgeCount = 0;
            graph.forEachEdge(function(edge){
              totalEdgeCount ++;
            });
            graph.forEachEdge(function(edge){
              edgeCount ++;
              var edgeTextFrom = "(" + edge.fromVertex.x + ", " + edge.fromVertex.y + ", " + edge.fromVertex.z +")";
              var edgeTextTo = "(" + edge.toVertex.x + ", " + edge.toVertex.y + ", " + edge.toVertex.z +")";
              terminal.printInfo(Text.SUBTREE3.replace(Text.PARAM1, edgeTextFrom + " --> " + edgeTextTo), true);
            });

            var insertedJDs = {};
            for (var jdID in steeringHandler.graphsByJumpDescriptors){
              for (var gid in steeringHandler.graphsByJumpDescriptors[jdID]){
                if (gid == id){
                  insertedJDs[jdID] = true;
                }
              }
            }

            var insertedJDsCount = Object.keys(insertedJDs).length;
            if (insertedJDsCount > 0){
              terminal.printInfo(Text.SUBTREE.replace(Text.PARAM1, "Inserted jump descriptors"), true);
              var ct = 0;
              for (var jdID in insertedJDs){
                ct ++;
                terminal.printInfo(Text.SUBTREE3.replace(Text.PARAM1, jdID), ct != insertedJDsCount);
              }
            }else{
              terminal.printInfo(Text.SUBTREE2.replace(Text.PARAM1, "Inserted jump descriptors").replace(Text.PARAM2, "none"), false);
            }
          }
          if (count == 0){
            terminal.printError(Text.NO_GRAPHS_IN_THIS_SCENE);
          }
          return true;
        break;
        case 249: //newGraph
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var id = splitted[1];

          if (steeringHandler.usedGraphIDs[id]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          var pointNames = splitted[2].split(",");

          var usedPoints = [];
          var vertices = [];

          for (var i = 0; i < pointNames.length; i ++){
            if (pointNames[i].indexOf("*") >= 0){
              var nameSplitted = pointNames[i].split("*");
              for (var ptName in sceneHandler.getMarkedPoints()){
                if (ptName.toLowerCase().startsWith(nameSplitted[0].toLowerCase())){
                  usedPoints.push(markedPoints[ptName]);
                }
              }
            }else{
              var markedPoint = markedPoints[pointNames[i]];

              if (!markedPoint){
                terminal.printError(Text.POINT_X_DOES_NOT_EXIST.replace(Text.PARAM1, i));
                return true;
              }

              if (markedPoint.registeredSceneName != sceneHandler.getActiveSceneName()){
                terminal.printError(Text.POINT_X_NOT_IN_ACTIVE_SCENE.replace(Text.PARAM1, i));
                return true;
              }

              usedPoints.push(markedPoint);
            }

            for (var i2 = 0; i2 < usedPoints.length; i2 ++){
              if (vertices.indexOf(usedPoints[i2]) < 0){
                vertices.push(usedPoints[i2]);
              }
            }
          }

          if (vertices.length < 2){
            terminal.printError(Text.MUST_SPECIFY_AT_LEAST_TWO_POINTS);
            return true;
          }

          graphCreatorGUIHandler.show(id, vertices);
          return true;
        break;
        case 250: //insertJumpDescriptorToGraph
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var jdID = splitted[1];
          var graphID = splitted[2];

          if (!steeringHandler.usedJumpDescriptorIDs[jdID]){
            terminal.printError(Text.NO_SUCH_JUMPDESCRIPTOR);
            return true;
          }

          if (!steeringHandler.usedGraphIDs[graphID]){
            terminal.printError(Text.NO_SUCH_GRAPH);
            return true;
          }

          var jumpDescriptors = steeringHandler.jumpDescriptorsBySceneName[sceneHandler.getActiveSceneName()] || {};
          var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};

          if (!jumpDescriptors[jdID]){
            terminal.printError(Text.JUMPDESCRIPTOR_NOT_IN_ACTIVE_SCENE);
            return true;
          }

          if (!graphs[graphID]){
            terminal.printError(Text.GRAPH_NOT_INSIDE_ACTIVE_SCENE);
            return true;
          }

          for (var gid in steeringHandler.graphsByJumpDescriptors[jdID]){
            if (gid == graphID){
              terminal.printError(Text.JUMPDESCRIPTOR_ALREADY_INSERTED_TO_THE_GRAPH);
              return true;
            }
          }

          if (steeringHandler.insertJumpDescriptorToGraph(jdID, graphID)){
            terminal.printInfo(Text.JUMPDESCRIPTOR_INSERTED_INTO_THE_GRAPH);
          }else{
            terminal.printError(Text.JUMPDESCRIPTOR_IS_NOT_ON_THE_GRAPH);
          }

          if (steeringHandler.debugHelper){
            steeringHandler.switchDebugMode();
            steeringHandler.switchDebugMode();
          }

          return true;
        break;
        case 251: //mergeGraphs
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var graphID = splitted[1];
          if (steeringHandler.usedGraphIDs[graphID]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          var splittedGraphIDs = splitted[2].split(",");
          var ary = [];
          var graphsAry = [];
          for (var i = 0; i < splittedGraphIDs.length; i ++){
            if (splittedGraphIDs[i].indexOf("*") >= 0){
              var idSplitted = splittedGraphIDs[i].split("*");
              for (var gid in steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()]){
                if (gid.toLowerCase().startsWith(idSplitted[0].toLowerCase())){
                  ary.push(gid);
                }
              }
            }else{
              if (!steeringHandler.usedGraphIDs[splittedGraphIDs[i]]){
                terminal.printError(Text.GRAPH_X_DOES_NOT_EXIST.replace(Text.PARAM1, i));
                return true;
              }
              var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
              if (!graphs[splittedGraphIDs[i]]){
                terminal.printError(Text.GRAPH_X_NOT_IN_ACTIVE_SCENE.replace(Text.PARAM1, i));
                return true;
              }

              ary.push(splittedGraphIDs[i]);
            }

            for (var i2 = 0; i2 < ary.length; i2 ++){
              if (graphsAry.indexOf(ary[i2]) < 0){
                graphsAry.push(ary[i2]);
              }
            }
          }

          if (graphsAry.length < 2){
            terminal.printError(Text.MUST_MERGE_AT_LEAST_2_GRAPHS);
            return true;
          }

          steeringHandler.mergeGraphs(graphID, graphsAry);
          terminal.printInfo(Text.GRAPHS_MERGED);
          return true;
        break;
        case 252: //steeringBehaviors
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          steeringBehaviorCreatorGUIHandler.show();
          return true;
        break;
        case 253: //assignSteeringBehavior
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var obj = addedObjects[splitted[1]] || objectGroups[splitted[1]];

          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }

          if (!obj.steerableInfo){
            terminal.printError(Text.OBJECT_IS_NOT_A_STEERABLE);
            return true;
          }

          var allBehaviorsInScene = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
          var behavior = allBehaviorsInScene[splitted[2]];

          if (!behavior){
            terminal.printError(Text.NO_SUCH_BEHAVIOR);
            return true;
          }

          if (obj.steerableInfo.behaviorsByID[splitted[2]]){
            terminal.printError(Text.BEHAVIOR_ALREADY_ASSIGNED_TO_THE_OBJECT);
            return true;
          }

          obj.steerableInfo.behaviorsByID[splitted[2]] = behavior;
          selectionHandler.resetCurrentSelection();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.BEHAVIOR_ASSIGNED_TO_THE_OBJECT);
          }
          return true;
        break;
        case 254: //unassignSteeringBehavior
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var obj = addedObjects[splitted[1]] || objectGroups[splitted[1]];

          if (!obj){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (obj.registeredSceneName != sceneHandler.getActiveSceneName()){
            terminal.printError(Text.OBJECT_NOT_IN_SCENE);
            return true;
          }

          if (!obj.steerableInfo){
            terminal.printError(Text.OBJECT_IS_NOT_A_STEERABLE);
            return true;
          }

          var allBehaviorsInScene = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
          var behavior = allBehaviorsInScene[splitted[2]];

          if (!behavior){
            terminal.printError(Text.NO_SUCH_BEHAVIOR);
            return true;
          }

          if (!obj.steerableInfo.behaviorsByID[splitted[2]]){
            terminal.printError(Text.BEHAVIOR_IS_NOT_ASSIGNED_TO_THIS_OBJECT);
            return true;
          }

          delete obj.steerableInfo.behaviorsByID[splitted[2]];
          selectionHandler.resetCurrentSelection();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.BEHAVIOR_UNASSIGNED);
          }
          return true;
        break;
        case 255: //newAStar
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var aStarID = splitted[1];
          var graphID = splitted[2];

          if (steeringHandler.usedAStarIDs[aStarID] || steeringHandler.usedPathIDs[aStarID]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
          if (!graphs[graphID]){
            terminal.printError(Text.NO_SUCH_GRAPH_IN_CURRENT_SCENE);
            return true;
          }

          steeringHandler.addAStar(aStarID, graphID);
          terminal.printInfo(Text.ASTAR_CREATED);
          return true;
        break;
        case 256: //destroyAStar
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          if (!(splitted[1].indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var astars = steeringHandler.astarsBySceneName[sceneHandler.getActiveSceneName()] || {};
          if (!astars[splitted[1]]){
            terminal.printError(Text.NO_SUCH_ASTAR_IN_CURRENT_SCENE);
            return true;
          }

          var behaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()] || {};
          for (var bid in behaviors){
            var behavior = behaviors[bid];
            if (behavior.parameters.type == steeringHandler.steeringBehaviorTypes.PATH_FOLLOWING){
              if (behavior.parameters.pathID == splitted[1]){
                terminal.printError(Text.ASTAR_USED_IN_BEHAVIOR.replace(Text.PARAM1, bid));
                return true;
              }
            }
          }

          steeringHandler.removeAStar(splitted[1]);

          if (!jobHandlerWorking){
            terminal.printInfo(Text.ASTAR_DESTROYED);
          }
          return true;
        break;
        case 257: //printAStars
          var count = 0;
          var astars = steeringHandler.astarsBySceneName[sceneHandler.getActiveSceneName()] || {};
          var totalCount = Object.keys(astars).length;
          terminal.printHeader(Text.ASTARS_IN_THIS_SCENE);
          for (var id in astars){
            count ++;
            var astar = astars[id];
            var graphID = steeringHandler.graphIDsByAStars[id];
            terminal.printInfo(Text.TREE2.replace(Text.PARAM1, id).replace(Text.PARAM2, graphID), count != totalCount);
          }
          if (count == 0){
            terminal.printError(Text.NO_ASTARS_IN_THIS_SCENE);
          }
          return true;
        break;
        case 258: //jumpDescriptors
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          jumpDescriptorCreatorGUIHandler.show();
          return true;
        break;
        case 259: //removeEdgeFromGraph
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var graphID = splitted[1];
          var offsetX = parseFloat(splitted[2]);
          var offsetY = parseFloat(splitted[3]);
          var offsetZ = parseFloat(splitted[4]);

          var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
          var graph = graphs[graphID];

          if (!graph){
            terminal.printError(Text.NO_SUCH_GRAPH_IN_CURRENT_SCENE);
            return true;
          }

          var selectedGridAry = Object.keys(gridSelections);

          if (selectedGridAry.length != 2){
            terminal.printError(Text.MUST_HAVE_TWO_GRIDS_SELECTED);
            return true;
          }

          if (isNaN(offsetX)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetX"));
            return true;
          }

          if (isNaN(offsetY)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetY"));
            return true;
          }

          if (isNaN(offsetZ)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "offsetZ"));
            return true;
          }

          var grid1 = gridSelections[selectedGridAry[0]];
          var grid2 = gridSelections[selectedGridAry[1]];

          var vertex1 = new Kompute.Vector3D(grid1.centerX + offsetX, grid1.centerY + offsetY, grid1.centerZ + offsetZ);
          var vertex2 = new Kompute.Vector3D(grid2.centerX + offsetX, grid2.centerY + offsetY, grid2.centerZ + offsetZ);

          var result = steeringHandler.removeEdgeFromGraph(graphID, vertex1, vertex2);

          if (!result){
            terminal.printError(Text.NO_EDGES_FOUND_IN_THE_GRAPH);
            return true;
          }

          for (var gridName in gridSelections){
            gridSelections[gridName].toggleSelect(false, false, false, true);
          }

          terminal.printInfo(Text.EDGES_REMOVED.replace(Text.PARAM1, result));
          return true;
        break;
        case 260: //excludeFromHideBehavior
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var obsID = splitted[1];

          if (!(obsID.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var bool = splitted[2].toLowerCase();

          var allObs = steeringHandler.obstaclesBySceneName[sceneHandler.getActiveSceneName()] || {};

          var entity = allObs[obsID];

          if (!entity){
            terminal.printError(Text.NO_SUCH_OBSTACLE_IN_CURRENT_SCENE);
            return true;
          }

          if (bool != "true" && bool != "false"){
            terminal.printError(Text.PROPERTY_MUST_BE_TRUE_OR_FALSE);
            return true;
          }

          entity.excludeFromHide = (bool == "true");

          if (!jobHandlerWorking){
            if (entity.excludeFromHide){
              terminal.printInfo(Text.ENTITY_IS_EXCLUDED_FROM_HIDE_BEHAVIOR);
            }else{
              terminal.printInfo(Text.ENTITY_IS_INCLUDED_IN_HIDE_BEHAVIOR);
            }
          }

          return true;
        break;
        case 261: //newMass
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var massID = splitted[1];

          if (!(massID.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var height = parseFloat(splitted[2]);

          if (masses[massID]){
            terminal.printError(Text.ID_MUST_BE_UNIQUE);
            return true;
          }

          if (isNaN(height)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "height"));
            return true;
          }

          if (height == 0){
            terminal.printError(Text.HEIGHT_CANNOT_BE_0);
            return true;
          }

          if (!jobHandlerWorking){
            var gridSelectionSize = Object.keys(gridSelections).length;
            if (gridSelectionSize != 1 && gridSelectionSize != 2){
              terminal.printError(Text.MUST_HAVE_1_OR_2_GRIDS_SELECTED);
              return true;
            }
          }

          var selections = [];
          if (!jobHandlerWorking){
            for (var gridName in gridSelections){
              selections.push(gridSelections[gridName]);
            }
          }else{
            selections.push(jobHandlerSelectedGrid);
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

          gridSystem.newMass(selections, height, massID);
          if (physicsDebugMode){
            parseCommand("switchPhysicsDebugMode");
            parseCommand("switchPhysicsDebugMode");
          }

          terminal.clear();

          if (!jobHandlerWorking){
            terminal.printInfo(Text.MASS_CREATED);
          }
          return true;
        break;
        case 262: //printMasses
          terminal.printHeader(Text.MASSES_IN_THIS_SCENE);

          var totalCount = Object.keys(sceneHandler.getMasses()).length;
          var count = 0;
          for (var massName in sceneHandler.getMasses()){
            var mass = masses[massName];
            var center = mass.center;
            var size = mass.size;
            count ++;
            terminal.printInfo(Text.TREE.replace(Text.PARAM1, massName), true);
            terminal.printInfo(Text.COORD_TREE_TAB.replace(Text.PARAM1, "center").replace(Text.PARAM2, " " + center.x).replace(Text.PARAM3, " " + center.y).replace(Text.PARAM4, " " + center.z), true);
            terminal.printInfo(Text.COORD_TREE_SIZE_TAB.replace(Text.PARAM1, "size").replace(Text.PARAM2, " " + size.x).replace(Text.PARAM3, " " + size.y).replace(Text.PARAM4, " " + size.z), count != totalCount);
          }

          if (totalCount == 0){
            terminal.printError(Text.NO_MASSES_IN_THE_SCENE);
          }
          return true;
        break;
        case 263: //destroyMass
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }

          var massID = splitted[1];

          if (!(massID.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          var mass = masses[massID];

          if (!mass){
            terminal.printError(Text.NO_SUCH_MASS);
            return true;
          }

          delete masses[massID];
          sceneHandler.onMassDeletion(mass);

          if (physicsDebugMode){
            parseCommand("switchPhysicsDebugMode");
            parseCommand("switchPhysicsDebugMode");
          }

          terminal.clear();

          if (!jobHandlerWorking){
            terminal.printInfo(Text.MASS_DESTROYED);
          }
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

function pickRandomMaterial(){
  var keys = Object.keys(materials);
  if (keys.length == 0){
    return new BasicMaterial({
      name: "NULL_BASIC",
      color: "white",
      alpha: 1
    });
  }
  return materials[keys[keys.length * Math.random() << 0]];
}

function processNewGridSystemCommand(name, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, axis, slicedGrid){
  if (name.indexOf("*") > -1){
    terminal.printError(Text.INVALID_CHARACTER_IN_NAME);
    return true;
  }
  if (!checkIfNameUnique(name, Text.NAME_MUST_BE_UNIQUE)){
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
  if (cellSize <= 0){
    terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "cellSize").replace(Text.PARAM2, "0"));
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
  sizeX = parseFloat(sizeX), sizeZ = parseFloat(sizeZ), cellSize = parseFloat(cellSize);
  centerX = parseFloat(centerX), centerY = parseFloat(centerY), centerZ = parseFloat(centerZ);
  if (sizeX<=0 || sizeZ <=0){
    terminal.printError(Text.GS_CREATION_ERROR_1);
    return true;
  }
  if (sizeX % cellSize != 0){
    terminal.printError(Text.GS_CREATION_ERROR_2);
    return true;
  }
  if (sizeZ % cellSize != 0){
    terminal.printError(Text.GS_CREATION_ERROR_3);
    return true;
  }
  if (gridSystems[name]){
    terminal.printError(Text.GS_CREATION_ERROR_4);
    return true;
  }
  if (cellSize < MIN_CELLSIZE_ALLOWED){
    terminal.printError(Text.GS_CREATION_ERROR_5);
    return true;
  }
  var totalGridCount = (sizeX * sizeZ) / (cellSize * cellSize);
  if (gridCounter + totalGridCount > MAX_GRIDS_ALLOWED){
    terminal.printError(Text.GS_CREATION_ERROR_6);
    return true;
  }
  var gsObject = new GridSystem(name, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, axis.toUpperCase());

  if (slicedGrid){
    gsObject.slicedGrid = slicedGrid;
    slicedGrid.toggleSelect(true, false, false, true);
    slicedGrid.slicedGridSystemName = name;
  }
  sceneHandler.onGridSystemCreation(gsObject);
  refreshRaycaster(Text.GS_CREATED);
  return true;
}

function refreshRaycaster(messageOnFinished, noClear){
  if (!isDeployment){
    if (physicsDebugMode){
      debugRenderer.refresh();
    }
    terminal.printInfo(Text.REFRESHING_RAYCASTER);
    terminal.disable();
    rayCaster.onReadyCallback = function(){
      if (!noClear){
        terminal.clear();
      }
      terminal.printInfo(messageOnFinished);
      terminal.enable();
      if (mode == 0){
        guiHandler.afterObjectSelection();
      }
    }
  }
  raycasterFactory.refresh();
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

function checkIfNameUnique(name, errorMsg){
  if (addedObjects[name] || objectGroups[name] || gridSystems[name] || addedTexts[name] || sprites[name] || wallCollections[name] || containers[name] || virtualKeyboards[name]){
    terminal.printError(errorMsg);
    return false;
  }
  if (isNameUsedAsSoftCopyParentName(name)){
    terminal.printError(errorMsg);
    return false;
  }
  if (disabledObjectNames[name]){
    terminal.printError(errorMsg);
    return false;
  }
  for (var objName in objectGroups){
    for (var childName in objectGroups[objName].group){
      if (childName == name){
        terminal.printError(errorMsg);
        return false;
      }
    }
  }
  return true;
}

function save(customState, customName){
  var state;
  if (!customState){
    state = new State();
  }else{
    state = customState;
  }
  var json = JSON.stringify(state);
  var blob = new Blob([json], {type: "application/json"});
  var url  = URL.createObjectURL(blob);
  var anchor = document.createElement('a');
  anchor.download = customName? (customName+"_"+new Date()+".json"): "ROYGBIV_SAVE_"+new Date()+".json";
  anchor.href = url;
  if (typeof InstallTrigger !== 'undefined') {
    // F I R E F O X
    anchor.dispatchEvent(new MouseEvent("click", {
      bubbles: true, cancelable: true, view: window
    }));
  }else{
    anchor.click();
  }
  terminal.printInfo(Text.DOWNLOAD_PROCESS_INITIATED);
}
