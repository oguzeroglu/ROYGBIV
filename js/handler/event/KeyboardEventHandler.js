var KeyboardEventHandler = function(){
  if (isMobile){
    return;
  }
  window.addEventListener('keydown', this.onKeyDown);
  window.addEventListener('keyup', this.onKeyUp);

  this.CAPSLOCK = "CapsLock";
  this.SHIFT = "Shift";
}

KeyboardEventHandler.prototype.onKeyUp = function(event){
  inactiveCounter = 0;
  if (!windowLoaded){
    return;
  }
  keyboardEventHandler.isCapsOn = event.getModifierState && event.getModifierState(keyboardEventHandler.CAPSLOCK);
  if (cliFocused || omGUIFocused || tmGUIFocused || smGUIFocused || cmGUIFocused || acGUIFocused || lGUIFocused || vkGUIFocused || mmGUIFocused || mimGUIFocused){
    return;
  }
  if (keyCodeToChar[event.keyCode] == keyboardEventHandler.SHIFT){
    for (var key in shiftCombinationKeys){
      keyboardBuffer[shiftCombinationKeys[key]] = false;
    }
  }
  if (keyCodeToChar[event.keyCode]){
    keyboardBuffer[keyCodeToChar[event.keyCode]] = false;
    if (mode == 0 && keyCodeToChar[event.keyCode] == "."){
      for (var gridName in gridSelections){
        gridSelections[gridName].removeCornerHelpers();
      }
    }
    if (shiftCombinationKeys[event.keyCode]){
      keyboardBuffer[shiftCombinationKeys[event.keyCode]] = false;
    }
    if (mode == 1 && !isPaused && screenKeyupCallbackFunction){
      screenKeyupCallbackFunction(keyCodeToChar[event.keyCode]);
    }
  }
  activeControl.onKeyUp(event);
  if (mode == 0 && !isDeployment){
    if (guiHandler.isOneOfBlockingGUIActive()){
      return;
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
      if (mode == 0 && !isDeployment){
        keyboardEventHandler.deactivateGridSelectionMode();
      }
    break;
    case 18: // ALT
      if (mode == 0 && !isDeployment){
        keyboardEventHandler.deactivateObjectSelectionMode();
      }
    break;
  }
}

KeyboardEventHandler.prototype.onKeyDown = function(event){
  inactiveCounter = 0;
  if (!windowLoaded){
    return;
  }
  keyboardEventHandler.isCapsOn = event.getModifierState && event.getModifierState(keyboardEventHandler.CAPSLOCK);
  if (cliFocused || omGUIFocused || tmGUIFocused || smGUIFocused || cmGUIFocused || acGUIFocused || lGUIFocused || vkGUIFocused || mmGUIFocused || mimGUIFocused){
    return;
  }
  var foundKey;
  if (keyboardBuffer[keyboardEventHandler.SHIFT]){
    foundKey = shiftCombinationKeys[event.keyCode];
    if (foundKey){
      keyboardBuffer[foundKey] = true;
      found = true;
    }
  }
  if (keyCodeToChar[event.keyCode] && !foundKey){
    if (keyboardBuffer[keyCodeToChar[event.keyCode]]){
      return;
    }
    foundKey = keyCodeToChar[event.keyCode];
    keyboardBuffer[foundKey] = true;
  }
  if (mode == 1 && screenKeydownCallbackFunction && !isPaused && foundKey){
    screenKeydownCallbackFunction(foundKey);
  }
  activeControl.onKeyDown(event);
  if (mode == 0 && isDeployment){
    if (guiHandler.isOneOfBlockingGUIActive()){
      return;
    }
  }
  if (mode == 0 && keyboardBuffer["."]){
    for (var gridName in gridSelections){
      gridSelections[gridName].renderCornerHelpers();
    }
  }
  if (mode == 1 && isPaused){
    return;
  }
  switch(event.keyCode){
    case 16: //SHIFT
      if (mode == 0 && !isDeployment){
        keyboardEventHandler.activateGridSelectionMode();
      }
    break;
    case 18: // ALT
      if (mode == 0 && !isDeployment){
        keyboardEventHandler.activateObjectSelectionMode();
      }
    break;
    case 8: //BACKSPACE
      if (mode == 1 || isDeployment){
        return;
      }
      //FIREFOX GO BACK FIX
      if (selectionHandler.getSelectedObject() && !cliFocused){
        event.preventDefault();
      }
      var currentSelection = selectionHandler.getSelectedObject();
      if (currentSelection.isAddedObject || currentSelection.isObjectGroup){
        terminal.clear();
        parseCommand("destroyObject " + currentSelection.name);
      }else if (currentSelection.isAddedText){
        terminal.clear();
        parseCommand("destroyText " + currentSelection.name);
      }else if (currentSelection.isSprite){
        terminal.clear();
        parseCommand("destroySprite " + currentSelection.name);
      }else if (currentSelection.isContainer){
        parseCommand("destroyContainer " + currentSelection.name);
      }else if (currentSelection.isModelInstance){
        parseCommand("destroyModelInstance " + currentSelection.name);
      }
      guiHandler.afterObjectSelection();
    break;
    case 27: //ESC
    if (mode == 0 && !isDeployment){
      selectionHandler.resetCurrentSelection();
      terminal.clear();
      terminal.printInfo(Text.SELECTION_RESET);
    }
    break;
  }
}

KeyboardEventHandler.prototype.activateGridSelectionMode = function(){
  selectionHandler.resetCurrentSelection();
  for (var objName in sceneHandler.getAddedObjects()){
    if (addedObjects[objName].hiddenInDesignMode){
      continue;
    }
    addedObjects[objName].mesh.visible = false;
  }
  for (var objName in sceneHandler.getObjectGroups()){
    if (objectGroups[objName].hiddenInDesignMode){
      continue;
    }
    objectGroups[objName].mesh.visible = false;
  }
  for (var instanceName in sceneHandler.getModelInstances()){
    if (modelInstances[instanceName].hiddenInDesignMode){
      continue;
    }
    modelInstances[instanceName].mesh.visible = false;
  }
  for (var textName in sceneHandler.getAddedTexts()){
    if (addedTexts[textName].hiddenInDesignMode){
      continue;
    }
    addedTexts[textName].hide();
  }
  for (var spriteName in sceneHandler.getSprites()){
    if (sprites[spriteName].hiddenInDesignMode){
      continue;
    }
    sprites[spriteName].mesh.visible = false;
  }
  for (var containerName in sceneHandler.getContainers()){
    if (containers[containerName].hiddenInDesignMode){
      continue;
    }
    containers[containerName].hideVisually();
  }
  for (var virtualKeyboardName in sceneHandler.getVirtualKeyboards()){
    if (virtualKeyboards[virtualKeyboardName].hiddenInDesignMode){
      continue;
    }
    virtualKeyboards[virtualKeyboardName].onShiftPress(true);
  }
  raycasterFactory.onShiftPress(true);
}

KeyboardEventHandler.prototype.deactivateGridSelectionMode = function(){
  for (var objName in sceneHandler.getAddedObjects()){
    if (addedObjects[objName].hiddenInDesignMode){
      continue;
    }
    addedObjects[objName].mesh.visible = true;
  }
  for (var objName in sceneHandler.getObjectGroups()){
    if (objectGroups[objName].hiddenInDesignMode){
      continue;
    }
    objectGroups[objName].mesh.visible = true;
  }
  for (var instanceName in sceneHandler.getModelInstances()){
    if (modelInstances[instanceName].hiddenInDesignMode){
      continue;
    }
    modelInstances[instanceName].mesh.visible = true;
  }
  for (var textName in sceneHandler.getAddedTexts()){
    if (addedTexts[textName].hiddenInDesignMode){
      continue;
    }
    addedTexts[textName].show();
  }
  for (var spriteName in sceneHandler.getSprites()){
    if (sprites[spriteName].hiddenInDesignMode){
      continue;
    }
    sprites[spriteName].mesh.visible = true;
  }
  for (var containerName in sceneHandler.getContainers()){
    if (containers[containerName].hiddenInDesignMode){
      continue;
    }
    containers[containerName].showVisually();
  }
  for (var virtualKeyboardName in sceneHandler.getVirtualKeyboards()){
    if (virtualKeyboards[virtualKeyboardName].hiddenInDesignMode){
      continue;
    }
    virtualKeyboards[virtualKeyboardName].onShiftPress(false);
  }
  raycasterFactory.onShiftPress(false);
}

KeyboardEventHandler.prototype.activateObjectSelectionMode = function(){
  for (var gsName in sceneHandler.getGridSystems()){
    gridSystems[gsName].hide();
  }
  for (var gridName in gridSelections){
    gridSelections[gridName].hide();
  }
  raycasterFactory.onAltPress(true);
}

KeyboardEventHandler.prototype.deactivateObjectSelectionMode = function(){
  for (var gsName in sceneHandler.getGridSystems()){
    gridSystems[gsName].show();
  }
  for (var gridName in gridSelections){
    gridSelections[gridName].show();
  }
  raycasterFactory.onAltPress(false);
}
