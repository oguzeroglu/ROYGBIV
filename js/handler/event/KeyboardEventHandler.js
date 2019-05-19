var KeyboardEventHandler = function(){
  if (isMobile){
    return;
  }
  if (!isDeployment){
    scriptCreatorTextArea.onkeydown = this.onScriptCreatorTextAreaKeyDown;
  }
  window.addEventListener('keydown', this.onKeyDown);
  window.addEventListener('keyup', this.onKeyUp);
}

KeyboardEventHandler.prototype.onKeyUp = function(event){
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
  activeControl.onKeyUp(event);
  if (mode == 0){
    if (guiHandler.datGuiMuzzleFlashCreator || guiHandler.datGuiPSCreator || guiHandler.datGuiFPSWeaponAlignment){
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
      if (mode == 0 && !fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject){
        for (var objName in addedObjects){
          addedObjects[objName].mesh.visible = true;
        }
        for (var objName in objectGroups){
          objectGroups[objName].mesh.visible = true;
        }
        for (var textName in addedTexts){
          addedTexts[textName].show();
        }
        raycasterFactory.onShiftPress(false);
      }
    break;
  }
}

KeyboardEventHandler.prototype.onKeyDown = function(event){
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
  activeControl.onKeyDown(event);
  if (mode == 0){
    if (guiHandler.datGuiMuzzleFlashCreator || guiHandler.datGuiPSCreator || guiHandler.datGuiFPSWeaponAlignment){
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
      if (mode == 0 && !isDeployment && !fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject){
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
        raycasterFactory.onShiftPress(true);
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
      if (currentSelection.isAddedObject || currentSelection.isObjectGroup){
        parseCommand("destroyObject "+currentSelection.name);
      }else if (currentSelection.isAddedText){
        terminal.clear();
        parseCommand("destroyText "+currentSelection.name);
      }
      guiHandler.afterObjectSelection();
    break;
  }
}

KeyboardEventHandler.prototype.onScriptCreatorTextAreaKeyDown = function(event){
  if(event.keyCode==9 || event.which==9){
    event.preventDefault();
    var s = this.selectionStart;
    this.value = this.value.substring(0,this.selectionStart) + "    " + this.value.substring(this.selectionEnd);
    this.selectionEnd = s+1;
  }
}
