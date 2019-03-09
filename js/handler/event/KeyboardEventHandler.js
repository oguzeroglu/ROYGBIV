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

KeyboardEventHandler.prototype.handleDefaultKeyboardControls = function(){
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
        if (WORKERS_SUPPORTED){
          rayCaster.onShiftPress(false);
        }
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
        if (WORKERS_SUPPORTED){
          rayCaster.onShiftPress(true);
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
}

KeyboardEventHandler.prototype.onScriptCreatorTextAreaKeyDown = function(event){
  if(event.keyCode==9 || event.which==9){
    event.preventDefault();
    var s = this.selectionStart;
    this.value = this.value.substring(0,this.selectionStart) + "    " + this.value.substring(this.selectionEnd);
    this.selectionEnd = s+1;
  }
}
