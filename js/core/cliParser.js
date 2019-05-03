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

          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }

          if (!gridSystems[name]){
            terminal.printError(Text.NO_SUCH_GRID_SYSTEM);
          }else{
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
          if (addedObjects[objectName] || objectGroups[objectName] || gridSystems[objectName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNameUsedAsSoftCopyParentName(objectName)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
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
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
            areaConfigurationsVisible = false;
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
              Text.PARAM2, objectName
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
              Text.PARAM1, objectName
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
            delete addedObjects[objectName];
          }else if (objectGroup){
            objectGroup.destroy(true);
            delete objectGroups[objectName];
          }
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
            areaConfigurationsVisible = false;
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.OBJECT_DESTROYED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
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
            texture.needsUpdate = true;
            textures[textureName] = texture;
            textureURLs[textureName] = fileName;
            texture.isLoaded = true;
            texture.fromUploadedImage = true;
            terminal.printInfo(Text.TEXTURE_CREATED);
            return true;
          }

          var textureUrl = "textures/"+fileName;
          var texture;
          var found = false;
          var compressionSupportIssue = false;
          for (var textureNameX in textureURLs){
            if (textureURLs[textureNameX] == textureUrl){
              if (textures[textureNameX] && textures[textureNameX].isLoaded){
                found = true;
                texture = textures[textureNameX];
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.needsUpdate = true;
                textures[textureName] = texture;
                texture.isLoaded = true;
              }
            }
          }
          textureURLs[textureName] = textureUrl;
          if (!found){
            var loader;
            if (textureUrl.toUpperCase().endsWith("DDS")){
              if (!DDS_SUPPORTED){
                textureUrl = textureUrl.replace(
                  ".dds", compressedTextureFallbackFormat
                ).replace(
                  ".DDS", compressedTextureFallbackFormat
                );
                loader = textureLoader;
                compressionSupportIssue = true;
              }else{
                loader = ddsLoader;
              }
            }else if (textureUrl.toUpperCase().endsWith("TGA")){
              loader = tgaLoader;
            }else{
              loader = textureLoader;
            }
            loader.load(textureUrl,
              function (textureData){
                texture = textureData;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.isLoaded = true;
                textures[textureName] = texture;
              },
              function (xhr){
                textures[textureName] = 2;
              },
              function (xhr){
                textures[textureName] =  3;
              }
            );
            textures[textureName] = 1;
          }else{
            terminal.printInfo(Text.TEXTURE_CLONED);
          }
          if (!compressionSupportIssue){
            terminal.printInfo(Text.TEXTURE_CREATED);
          }else {
            terminal.printInfo(Text.TEXTURE_CREATED_DDS_SUPPORT_ISSUE);
          }
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
          if (!(textureName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          for (var psName in preConfiguredParticleSystems){
            var params = preConfiguredParticleSystems[psName].params;
            if (!(typeof params.textureName == UNDEFINED)){
              if (params.textureName == textureName){
                terminal.printError(Text.TEXTURE_USED_IN_A_PARTICLE_SYSTEM.replace(Text.PARAM1, psName));
                return true;
              }
            }
            if (!(typeof params.texture == UNDEFINED)){
              if (params.texture == textureName){
                terminal.printError(Text.TEXTURE_USED_IN_A_PARTICLE_SYSTEM.replace(Text.PARAM1, psName));
                return true;
              }
            }
          }
          if (textures[textureName] instanceof THREE.Texture){
            textures[textureName].dispose();
          }
          delete textures[textureName];
          delete textureURLs[textureName];
          delete modifiedTextures[textureName];
          if (!jobHandlerWorking){
            terminal.printInfo(Text.TEXTURE_DESTROYED);
          }
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
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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

          var cloneTexture = texture;
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mapDiffuse(cloneTexture);

          cloneTexture.needsUpdate = true;

          addedObject.metaData["textureRepeatU"] = cloneTexture.repeat.x;
          addedObject.metaData["textureRepeatV"] = cloneTexture.repeat.y;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          addedObject.resetAssociatedTexturePack();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.TEXTURE_MAPPED);
          }
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

          if (addedObjects[name] || objectGroups[name] || gridSystems[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNameUsedAsSoftCopyParentName(name)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
            return true;
          }
          if (disabledObjectNames[name]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
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
            areaConfigurationsVisible = false;
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

          if (addedObjects[name] || objectGroups[name] || gridSystems[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNameUsedAsSoftCopyParentName(name)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
            return true;
          }
          if (disabledObjectNames[name]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
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

          height = parseInt(height);
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
            areaConfigurationsVisible = false;
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

          if (wallCollections[name]){
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

          var baseGridSystem = gridSystems[grid1.parentName];

          new WallCollection(name, height, outlineColor, grid1, grid2);
          for (var gridName in gridSelections){
            gridSelections[gridName].toggleSelect(false, false, false, true);
          }
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          var wallCollection = wallCollections[name];
          if (wallCollection){
            wallCollection.destroy();
            if (!jobHandlerWorking){
              terminal.printInfo(Text.WALL_COLLECTION_DESTROYED);
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
          // DEPRECATED
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
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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

          var cloneTexture = texture;
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          addedObject.mapAO(cloneTexture);

          cloneTexture.needsUpdate = true;

          addedObject.resetAssociatedTexturePack();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.AMBIENT_OCCULSION_TEXTURE_MAPPED);
          }
        break;
        case 46: //mapAlpha
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
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

          var cloneTexture = texture;
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          addedObject.mapAlpha(cloneTexture);

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          cloneTexture.needsUpdate = true;

          addedObject.resetAssociatedTexturePack();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.ALPHA_TEXTURE_MAPPED);
          }
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
          var textureName = splitted[1];
          var objectName = splitted[2];
          var texture = textures[textureName];
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

          var cloneTexture = texture;
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          addedObject.mapEmissive(cloneTexture);

          cloneTexture.needsUpdate = true;

          addedObject.resetAssociatedTexturePack();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.EMISSIVE_TEXTURE_MAPPED);
          }
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
          if (!DDS_SUPPORTED && fileExtension.toUpperCase() == "DDS"){
            terminal.printInfo(Text.TEXTURE_CREATED_DDS_SUPPORT_ISSUE);
          }else{
            terminal.printInfo(Text.TEXTURE_PACK_CREATED);
          }
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

          if (!addedObject){
            terminal.printError(Text.NO_SUCH_OBJECT);
            return true;
          }

          if (!texturePack.isUsable()){
            terminal.printError(Text.TEXTURE_PACK_NOT_USABLE);
            return true;
          }

          addedObject.mapTexturePack(texturePack);
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
          texturePack.destroy();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.TEXTURE_PACK_DESTROYED);
          }
          return true;
        break;
        case 61: //refreshTexturePack
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
          texturePack.refresh();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.TEXTURE_PACK_REFRESHED);
          }
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
          if (!(objectName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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

          if (addedObject.metaData["widthSegments"] == 1){
            addedObject.segmentGeometry(false, undefined);
          }

          var cloneTexture = texture;
          cloneTexture.fromUploadedImage = texture.fromUploadedImage;

          cloneTexture.roygbivTextureName = textureName;
          cloneTexture.roygbivTexturePackName = 0;

          cloneTexture.wrapS = THREE.RepeatWrapping;
          cloneTexture.wrapT = THREE.RepeatWrapping;

          addedObject.mapDisplacement(cloneTexture);
          cloneTexture.needsUpdate = true;

          addedObject.resetAssociatedTexturePack();
          if (!jobHandlerWorking){
            terminal.printInfo(Text.HEIGHT_TEXTURE_MAPPED);
          }
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
          addedObject.resetMaps(true);
          if (!jobHandlerWorking){
            terminal.printInfo(Text.MAPS_RESET);
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

          var skyBox = new SkyBox(name, directoryName, fileExtension, "#ffffff");
          skyBoxes[name] = skyBox;
          if (!DDS_SUPPORTED && fileExtension.toUpperCase() == "DDS"){
            terminal.printInfo(Text.TEXTURE_CREATED_DDS_SUPPORT_ISSUE);
          }else{
            terminal.printInfo(Text.SKYBOX_CREATED);
          }
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
          if (!skybox.isUsable()){
            terminal.printError(Text.SKYBOX_NOT_USABLE);
            return true;
          }
          if (!skyboxMesh){
            var geomKey = (
              "BoxBufferGeometry" + PIPE +
              skyboxDistance + PIPE + skyboxDistance + PIPE + skyboxDistance + PIPE +
              "1" + PIPE + "1" + PIPE + "1"
            );
            var skyboxBufferGeometry = geometryCache[geomKey];
            if (!skyboxBufferGeometry){
              skyboxBufferGeometry = new THREE.BoxBufferGeometry(skyboxDistance, skyboxDistance, skyboxDistance);
              geometryCache[geomKey] = skyboxBufferGeometry;
            }
            skyboxMesh = new MeshGenerator(skyboxBufferGeometry, null).generateSkybox(skybox);
          }else{
            skyboxMesh.material.uniforms.cubeTexture.value = skybox.cubeTexture;
            skyboxMesh.material.uniforms.color.value.set(skybox.color);
          }
          scene.add(skyboxMesh);
          skyboxVisible = true;
          mappedSkyboxName = name;
          if (guiHandler.skyboxParameters){
            guiHandler.skyboxParameters["Name"] = mappedSkyboxName;
            guiHandler.skyboxParameters["Color"] = "#" + skyboxMesh.material.uniforms.color.value.getHexString();
          }
          skyboxMesh.renderOrder = renderOrders.SKYBOX;
          if (bloom){
            bloom.onSkyboxVisibilityChange();
          }
          terminal.printError(Text.SKYBOX_MAPPED);
          return true;
        break;
        case 73: //destroySkybox
          var name = splitted[1];
          var skybox = skyBoxes[name];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!skybox){
            terminal.printError(Text.NO_SUCH_SKYBOX);
            return true;
          }
          if (name == mappedSkyboxName){
            scene.remove(skyboxMesh);
            skyboxVisible = false;
            fogBlendWithSkybox = false;
            skyboxMesh.material.dispose();
            skyboxMesh.geometry.dispose();
            skyboxMesh.material.uniforms.cubeTexture.value.dispose();
          }
          delete skyBoxes[name];
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SKYBOX_DESTROYED);
          }
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
            skyboxVisible = false;
            fogBlendWithSkybox = false;
            terminal.printInfo(Text.SKYBOX_HIDDEN);
          }else{
            if (skyboxVisible){
              terminal.printError(Text.SKYBOX_ALREADY_VISIBLE);
              return true;
            }
            scene.add(skyboxMesh);
            skyboxVisible = true;
            terminal.printInfo(Text.SKYBOX_SHOWN);
          }
          if (bloom){
            bloom.onSkyboxVisibilityChange();
          }
          return true;
        break;
        case 75: //scaleSkybox
          var amount = parseFloat(splitted[1]);
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!skyboxMesh){
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
          terminal.printInfo(Text.SKYBOX_SCALE_ADJUSTED);
          return true;
        break;
        case 76: //save
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          var state = new State();
          var json = JSON.stringify(state);
          var blob = new Blob([json], {type: "application/json"});
          var url  = URL.createObjectURL(blob);
          var anchor = document.createElement('a');
          anchor.download = "ROYGBIV_SAVE_"+new Date()+".json";
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
                    if (stateLoader.hasTextures || stateLoader.hasTexturePacks || stateLoader.hasSkyboxes || stateLoader.hasFonts){
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
            selectionHandler.select(objSelection);
            camera.lookAt(objSelection.mesh.position);
          }else if (objGroupSelection){
            selectionHandler.select(objGroupSelection);
            camera.lookAt(objGroupSelection.graphicsGroup.position);
          }
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
            if (addedObject.noMass){
              terminal.printError(Text.OBJECT_HAS_NO_MASS);
              return true;
            }
            addedObject.setMass(mass);
            if (mode == 1 && mass > 0){
              dynamicObjects.set(addedObject.name, addedObject);
            }
            if (selectionHandler.getSelectedObject() &&
                  selectionHandler.getSelectedObject().isAddedObject &&
                        selectionHandler.getSelectedObject().name == addedObject.name){
              guiHandler.objectManipulationParameters["Mass"] = addedObject.physicsBody.mass;
              guiHandler.omMassController.updateDisplay();
            }
          }else if (grouppedObject){
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
            if (addedObject.pivotObject){
              addedObject.rotateAroundPivotObject(axis, radian);
            }else{
              addedObject.rotate(axis, radian);
            }
            addedObject.mesh.updateMatrixWorld();
            addedObject.updateBoundingBoxes();
            addedObject.isRotationDirty = true;
          }else if (objectGroup){
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
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle(true);
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
            script2.start();
          }else{
            script2.start();
          }
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SCRIPT_STARTED_RUNNING);
          }
          scripts[name] = script2;
          return true;
        break;
        case 85: //stopScript
          var name = splitted[1];
          if (mode == 0){
            terminal.printError(Text.WORKS_ONLY_IN_PREVIEW_MODE);
            return true;
          }
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle(true);
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
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SCRIPT_STOPPED);
          }
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
          }.bind({name: name, runAutomatically: runAutomatically, localFilePath: localFilePath});
          scriptCreatorTextArea.focus();
          return true;
        break;
        case 88: //destroyScript
          var name = splitted[1];
          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(name.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!scripts[name]){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          if (scripts[name].localFilePath){
            modeSwitcher.totalScriptsToLoad --;
          }
          delete scripts[name];
          if (!jobHandlerWorking){
            terminal.printInfo(Text.SCRIPT_DESTROYED);
          }
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
          return true;
        break;
        case 91: //removeFog
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          fogActive = false;
          fogBlendWithSkybox = false;
          terminal.printInfo(Text.FOG_REMOVED);
          guiHandler.afterObjectSelection();
          return true;
        break;
        case 92: //glue
          var groupName = splitted[1];
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
          if (addedObjects[groupName] || objectGroups[groupName] || gridSystems[name]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNameUsedAsSoftCopyParentName(groupName)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
            return true;
          }
          try{
            var objectNamesArray = objects.split(",");
            for (var i = 0; i<objectNamesArray.length; i++){
              if (!(objectNamesArray[i].indexOf("*") == -1)){
                var tmpPrefix = objectNamesArray[i].split("*")[0];
                for (var addedObjName in addedObjects){
                  if (addedObjName.startsWith(tmpPrefix)){
                    objectNamesArray.push(addedObjName);
                  }
                }
                for (var objGroupName in objectGroups){
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
                  terminal.printError(Text.OBJECT_NR_DOES_NOT_EXIST.replace(
                    Text.PARAM1, (i+1)
                  ));
                  return true;
                }
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

            for (var objGroupName in detachedObjectGroups){
              var gluedObject = detachedObjectGroups[objGroupName];
              gluedObject.detach();
              delete objectGroups[gluedObject.name];
            }

            if (materialUsed == 1){
              objectGroup.isBasicMaterial = true;
            }
            objectGroup.glue();
            objectGroups[groupName] = objectGroup;
            guiHandler.hide(guiHandler.guiTypes.OBJECT);
            if (areaConfigurationsVisible){
              guiHandler.hide(guiHandler.guiTypes.AREA);
              areaConfigurationsVisible = false;
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
          objectGroup.detach();
          delete objectGroups[name];
          selectionHandler.resetCurrentSelection();
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
            areaConfigurationsVisible = false;
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
          markedPointsVisible = !markedPointsVisible;
          terminal.printInfo(Text.MARKED_POINTS_TOGGLED);
          return true;
        break;
        case 98: //runAutomatically
          var scriptName = splitted[1];
          var script = scripts[scriptName];
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(scriptName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          script.runAutomatically = true;
          if (!jobHandlerWorking){
            terminal.printInfo(Text.OK);
          }
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
                terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, err.message).replace(Text.PARAM2, scriptName));
                return true;
              }
              script.localFilePath = filePath;
              scripts[scriptName] = script;
              modeSwitcher.totalScriptsToLoad ++;
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
          if (!(scriptName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
            return true;
          }
          if (!script){
            terminal.printError(Text.NO_SUCH_SCRIPT);
            return true;
          }
          script.runAutomatically = false;
          if (!jobHandlerWorking){
            terminal.printInfo(Text.OK);
          }
          return true;
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
          if (texture instanceof THREE.CompressedTexture){
            terminal.printError(Text.COMPRESSED_TEXTURES_DO_NOT_SUPPORT);
            return true;
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
          var resizedCanvas = rescale(stdCanvas, scale);
          var resizedTexture = new THREE.CanvasTexture(resizedCanvas);
          resizedTexture.wrapS = texture.wrapS;
          resizedTexture.wrapT = texture.wrapT;
          resizedTexture.repeat.set(texture.repeat.x, texture.repeat.y);
          resizedTexture.isLoaded = texture.isLoaded;
          resizedTexture.fromUploadedImage = texture.fromUploadedImage;
          textures[newTextureName] = resizedTexture;
          textureURLs[newTextureName] = textureURLs[textureName];
          modifiedTextures[newTextureName] = resizedTexture.image.toDataURL();
          terminal.printInfo(Text.TEXTURE_RESCALED);
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
          if (refTexturePack.fileExtension.toUpperCase() == "DDS"){
            terminal.printError(Text.COMPRESSED_TEXTURES_DO_NOT_SUPPORT);
            return true;
          }
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
          return true;
        break;
        case 109: //destroyImage
          var imgName = splitted[1];
          if (mode == 1){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          if (!(imgName.indexOf("*") == -1)){
            new JobHandler(splitted).handle();
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
          if (!jobHandlerWorking){
            terminal.printInfo(Text.IMAGE_DESTROYED);
          }
          return true;
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
          areaBinHandler = new WorldBinHandler(true);
          areaBinHandler.isAreaBinHandler = true;
          for (var areaName in areas){
            areaBinHandler.insert(areas[areaName].boundingBox, areaName);
          }
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
          if (srcTexture instanceof THREE.CompressedTexture){
            terminal.printError(Text.COMPRESSED_TEXTURES_DO_NOT_SUPPORT);
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
          textureURLs[newTextureName] = textureURLs[textureName];
          newTexture.paddingInfo = padding+","+srcWidth+","+srcHeight;
          newTexture.hasPadding = true;
          modifiedTextures[newTextureName] = tmpCanvas.toDataURL();
          terminal.printInfo(Text.PADDING_ADDED_TO_TEXTURE);
          return true;
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
          if (addedObjects[sphereName] || objectGroups[sphereName] || gridSystems[sphereName]){
              terminal.printError(Text.NAME_MUST_BE_UNIQUE);
              return true;
          }
          if (isNameUsedAsSoftCopyParentName(sphereName)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
            return true;
          }
          if (disabledObjectNames[sphereName]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
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
            areaConfigurationsVisible = false;
          }
          if (!jobHandlerWorking){
            refreshRaycaster(Text.SPHERE_CREATED);
          }else{
            jobHandlerRaycasterRefresh = true;
          }
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
            areaConfigurationsVisible = false;
          }
          return true;
        break;
        case 131: //toggleAreas
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          areasVisible = !areasVisible;
          if (areasVisible){
            for (var areaName in areas){
              areas[areaName].renderToScreen();
            }
            terminal.printInfo(Text.AREAS_ARE_VISIBLE);
          }else{
            for (var areaName in areas){
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
          area.destroy();
          delete areas[area.name];
          terminal.printInfo(Text.AREA_DESTROYED);
          if (areaConfigurationsVisible){
            guiHandler.hide(guiHandler.guiTypes.AREA);
            areaConfigurationsVisible = false;
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
          for (var areaName in areas){
            count ++;
            break;
          }
          if (count == 0){
            terminal.printError(Text.NO_AREAS_CREATED);
            return true;
          }
          count = 0;
          for (var objName in addedObjects){
            count ++;
            break;
          }
          for (var objName in objectGroups){
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
          areaConfigurationsVisible = ! areaConfigurationsVisible;
          terminal.printInfo(Text.OK);
        break;
        case 134: //setResolution
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var resolutionParam = parseFloat(splitted[1]);
          if (isNaN(resolutionParam)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "resolution"));
            return true;
          }
          if (resolutionParam <= 0 || resolutionParam > 1){
            terminal.printError(Text.RESOLUTION_MUST_BE_BETWEEN);
            return true;
          }
          screenResolution = resolutionParam;
          renderer.setPixelRatio(screenResolution);
          for (var textName in addedTexts){
            addedTexts[textName].handleResize();
          }
          terminal.printInfo(Text.RESOLUTION_SET);
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
          var count = 0;
          for (var objName in addedObjects){
            count ++;
            break;
          }
          for (var objName in objectGroups){
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
          areaConfigurationsVisible = true;
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
          var obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[objName];
            if (!obj){
              terminal.printError(Text.NO_SUCH_OBJECT);
              return true;
            }
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
          if (addedObjects[cylinderName] || objectGroups[cylinderName] || gridSystems[cylinderName]){
              terminal.printError(Text.NAME_MUST_BE_UNIQUE);
              return true;
          }
          if (isNameUsedAsSoftCopyParentName(cylinderName)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
            return true;
          }
          if (disabledObjectNames[cylinderName]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
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
            areaConfigurationsVisible = false;
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
          if (addedObjects[targetName] || objectGroups[targetName] || gridSystems[targetName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (isNameUsedAsSoftCopyParentName(targetName)){
            terminal.printError(Text.NAME_USED_AS_A_REFERENCE);
            return true;
          }
          if (disabledObjectNames[targetName]){
            terminal.printError(Text.NAME_USED_IN_AN_OBJECT_GROUP);
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
          var copiedObj = sourceObj.copy(targetName, isHardCopyBoolean, copyPosition, gs, false);
          scene.add(copiedObj.mesh);
          if (!copiedObj.noMass && (copiedObj instanceof AddedObject)){
            physicsWorld.addBody(copiedObj.physicsBody);
          }
          if (sourceObj instanceof AddedObject){
            addedObjects[targetName] = copiedObj;
          }else{
            objectGroups[targetName] = copiedObj;
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
          if (modeSwitcher.totalScriptsToLoad > 0){
            loadedScriptsCounter = 0;
            terminal.clear();
            terminal.printInfo(Text.LOADING_SCRIPTS);
            canvas.style.visibility = "hidden";
            terminal.disable();
            for (var scriptName in scripts){
              var script = scripts[scriptName];
              if (script.localFilePath){
                script.reload(
                  function(scriptName){
                    loadedScriptsCounter ++;
                    if (loadedScriptsCounter == modeSwitcher.totalScriptsToLoad){
                      build(projectName, author);
                    }
                  },
                  function(scriptName, filePath){
                    modeSwitcher.enableTerminal();
                    terminal.printError(Text.FAILED_TO_LOAD_SCRIPT.replace(
                      Text.PARAM1, scriptName
                    ).replace(
                      Text.PARAM2, filePath
                    ));
                  },
                  function(scriptName, errorMessage){
                    modeSwitcher.enableTerminal();
                    terminal.printError(Text.INVALID_SCRIPT.replace(Text.PARAM1, errorMessage).replace(Text.PARAM2, scriptName));
                  }
                );
              }
            }
          }else{
            build(projectName, author);
          }
          var hasParticleSystems = false;
          for (var key in preConfiguredParticleSystems){
            hasParticleSystems = true;
            break;
          }
          if (hasParticleSystems && !particleSystemRefHeight){
            console.warn("[!] Consider using makeParticleSystemsResponsive CLI command.")
          }
          return true;
        break;
        case 146: //skyboxConfigurations
          var parameter = splitted[1].toLowerCase();
          if (!mappedSkyboxName){
            terminal.printError(Text.NO_SKYBOX_MAPPED);
            return true;
          }
          if (!skyboxVisible){
            terminal.printError(Text.SKYBOX_NOT_VISIBLE);
            return true;
          }
          if (parameter == "show"){
            if (skyboxConfigurationsVisible){
              terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
              return true;
            }
            guiHandler.show(guiHandler.guiTypes.SKYBOX);
            skyboxConfigurationsVisible = true;
            guiHandler.skyboxParameters["Name"] = mappedSkyboxName;
            guiHandler.skyboxParameters["Color"] = "#" + skyboxMesh.material.uniforms.color.value.getHexString();
            terminal.printInfo(Text.GUI_OPENED);
          }else if (parameter == "hide"){
            if (!skyboxConfigurationsVisible){
              terminal.printError(Text.GUI_IS_ALREADY_HIDDEN);
              return true;
            }
            guiHandler.hide(guiHandler.guiTypes.SKYBOX);
            skyboxConfigurationsVisible = false;
            terminal.printInfo(Text.GUI_CLOSED);
          }else{
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
          }
          return true;
        break;
        case 147: //fogConfigurations
          if (mode != 1){
            terminal.printError(Text.WORKS_ONLY_IN_PREVIEW_MODE);
            return true;
          }
          if (!fogActive){
            terminal.printError(Text.NO_FOG_SET);
            return true;
          }
          var fogConfigurationMode = splitted[1].toLowerCase();
          if (fogConfigurationMode == "show"){
            if (fogConfigurationsVisible){
              terminal.printError(Text.GUI_IS_ALREADY_VISIBLE);
              return true;
            }
            guiHandler.show(guiHandler.guiTypes.FOG);
            guiHandler.fogParameters["Color"] = "#"+fogColorRGB.getHexString();
            guiHandler.fogParameters["Density"] = fogDensity * 100;
            guiHandler.fogParameters["Blend skybox"] = fogBlendWithSkybox;
            if (!skyboxVisible){
              guiHandler.enableController(guiHandler.fogColorController);
              guiHandler.disableController(guiHandler.fogBlendWithSkyboxController);
            }else{
              if (fogBlendWithSkybox){
                guiHandler.disableController(guiHandler.fogColorController);
              }else{
                guiHandler.enableController(guiHandler.fogColorController);
              }
              guiHandler.enableController(guiHandler.fogBlendWithSkyboxController);
            }
            fogConfigurationsVisible = true;
            terminal.printInfo(Text.GUI_OPENED);
          }else if (fogConfigurationMode == "hide"){
            if (!fogConfigurationsVisible){
              terminal.printError(Text.GUI_IS_ALREADY_HIDDEN);
              return true;
            }
            guiHandler.hide(guiHandler.guiTypes.FOG);
            fogConfigurationsVisible = false;
            terminal.printInfo(Text.GUI_CLOSED);
          }else{
            terminal.printError(Text.STATUS_MUST_BE_ONE_OF);
            return true;
          }
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
          var fontPath = "fonts/"+splitted[2];
          if (fonts[fontName]){
            terminal.printError(Text.FONT_NAME_MUST_BE_UNIQUE);
            return true;
          }
          var fontObject = new Font(fontName, fontPath, function(){
            canvas.style.visibility = "";
            terminal.enable();
            terminal.clear();
            terminal.printInfo(Text.FONT_CREATED);
            fonts[fontName] = fontObject;
          }, function(){
            canvas.style.visibility = "";
            terminal.enable();
            terminal.clear();
            terminal.printInfo(Text.ERROR_CREATING_FONT.replace(Text.PARAM1, fontPath));
          });
          fontObject.load();
          terminal.printInfo(Text.LOADING_FONT);
          canvas.style.visibility = "hidden";
          terminal.disable();
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
          if (addedTexts[textName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          if (addedObjects[textName] || objectGroups[textName] || gridSystems[textName]){
            terminal.printError(Text.NAME_MUST_BE_UNIQUE);
            return true;
          }
          for (var objName in objectGroups){
            for (var childName in objectGroups[objName].group){
              if (childName == textName){
                terminal.printError(Text.NAME_MUST_BE_UNIQUE);
              }
            }
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
          textToDestroy.destroy(true);
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
              Text.PARAM1, textName
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
          if (!obj.isFPSWeapon){
            terminal.printError(Text.OBJECT_IS_NOT_MARKED_AS_FPS_WEAPON);
            return true;
          }
          selectionHandler.resetCurrentSelection();
          guiHandler.hideAll();
          if (fpsWeaponAlignmentConfigurationObject){
            if (fpsWeaponAlignmentConfigurationObject.name == objName){
              terminal.printError(Text.GUI_IS_ALREADY_OPEN_FOR_THIS_OBJECT);
              return true;
            }
            fpsWeaponAlignmentConfigurationObject.revertPositionAfterFPSWeaponConfigurations();
          }
          obj.quaternionBeforeFPSWeaponConfigurationPanelOpened = obj.mesh.quaternion.clone();
          camera.quaternion.set(0, 0, 0, 1);
          fpsWeaponAlignmentConfigurationObject = obj;
          obj.onFPSWeaponAlignmentUpdate();
          guiHandler.fpsWeaponAlignmentParameters.x = obj.fpsWeaponAlignment.x;
          guiHandler.fpsWeaponAlignmentParameters.y = obj.fpsWeaponAlignment.y;
          guiHandler.fpsWeaponAlignmentParameters.z = obj.fpsWeaponAlignment.z;
          guiHandler.fpsWeaponAlignmentParameters.scale = obj.fpsWeaponAlignment.scale;
          guiHandler.fpsWeaponAlignmentParameters["Rotate x"] = "0";
          guiHandler.fpsWeaponAlignmentParameters["Rotate y"] = "0";
          guiHandler.fpsWeaponAlignmentParameters["Rotate z"] = "0";
          guiHandler.fpsWeaponAlignmentParameters["Translate x"] = "0";
          guiHandler.fpsWeaponAlignmentParameters["Translate y"] = "0";
          guiHandler.fpsWeaponAlignmentParameters["Translate z"] = "0";
          guiHandler.fpsWeaponAlignmentParameters["Load from"] = "";
          guiHandler.show(guiHandler.guiTypes.FPS_WEAPON_ALIGNMENT);
          terminal.printInfo(Text.PRESS_DONE_BUTTON_TO);
          terminal.disable();
          activeControl = new CustomControls({});
          window.hiddenObjectsDueToFPSWeaponAlignmentConfiguration = [];
          for (var i = 0; i<scene.children.length; i++){
            var child = scene.children[i];
            if (child.id != obj.mesh.id && child.visible){
              child.visible = false;
              window.hiddenObjectsDueToFPSWeaponAlignmentConfiguration.push(child);
            }
          }
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
            guiHandler.shaderPrecisionParameters["Crosshair"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.CROSSHAIR);
            guiHandler.shaderPrecisionParameters["Basic material"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.BASIC_MATERIAL);
            guiHandler.shaderPrecisionParameters["Instanced basic material"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.INSTANCED_BASIC_MATERIAL);
            guiHandler.shaderPrecisionParameters["Merged basic material"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.MERGED_BASIC_MATERIAL);
            guiHandler.shaderPrecisionParameters["Object trail"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.OBJECT_TRAIL);
            guiHandler.shaderPrecisionParameters["Particle"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.PARTICLE);
            guiHandler.shaderPrecisionParameters["Skybox"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.SKYBOX);
            guiHandler.shaderPrecisionParameters["Text"] = shaderPrecisionHandler.getShaderPrecisionTextForType(shaderPrecisionHandler.types.TEXT);
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
        case 167: //setMaxCollidableParticleCount
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var maxCollidableParticleCount = parseInt(splitted[1]);
          if (isNaN(maxCollidableParticleCount)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxCollidableParticleCount"));
            return true;
          }
          if (maxCollidableParticleCount < 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxCollidableParticleCount").replace(Text.PARAM2, "0"));
            return true;
          }
          MAX_COLLIDABLE_PARTICLE_COUNT = maxCollidableParticleCount;
          terminal.printInfo(Text.MAX_COLLIDABLE_PARTICLE_COUNT_SET.replace(Text.PARAM1, MAX_COLLIDABLE_PARTICLE_COUNT));
          return true;
        break;
        case 168: //printMaxCollidableParticleCount
          terminal.printHeader(Text.MAX_COLLIDABLE_PARTICLE_COUNT);
          terminal.printInfo(Text.TREE.replace(Text.PARAM1, MAX_COLLIDABLE_PARTICLE_COUNT));
          return true;
        break;
        case 169: //setMaxParticleSystemCount
          if (mode != 0){
            terminal.printError(Text.WORKS_ONLY_IN_DESIGN_MODE);
            return true;
          }
          var maxParticleSystemCount = parseInt(splitted[1]);
          if (isNaN(maxParticleSystemCount)){
            terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxParticleSystemCount"));
            return true;
          }
          if (maxParticleSystemCount < 0){
            terminal.printError(Text.MUST_BE_GREATER_THAN.replace(Text.PARAM1, "maxParticleSystemCount").replace(Text.PARAM2, "0"));
            return true;
          }
          MAX_PARTICLE_SYSTEM_COUNT = maxParticleSystemCount;
          terminal.printInfo(Text.MAX_PARTICLE_SYSTEM_COUNT_SET.replace(Text.PARAM1, MAX_PARTICLE_SYSTEM_COUNT));
          return true;
        break;
        case 170: //printMaxParticleSystemCount
          terminal.printHeader(Text.MAX_PARTICLE_SYSTEM_COUNT);
          terminal.printInfo(Text.TREE.replace(Text.PARAM1, MAX_PARTICLE_SYSTEM_COUNT));
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
    }
  }
  rayCaster.refresh();
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
