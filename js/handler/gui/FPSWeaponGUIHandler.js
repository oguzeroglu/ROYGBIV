var FPSWeaponGUIHandler = function(){
}

FPSWeaponGUIHandler.prototype.onHidden = function(){
  if (this.fpsWeaponAlignmentConfigurationObject){
    this.fpsWeaponAlignmentConfigurationObject.revertPositionAfterFPSWeaponConfigurations();
    this.fpsWeaponAlignmentConfigurationObject = 0;
  }
}

FPSWeaponGUIHandler.prototype.init = function(){
  this.fpsWeaponAlignmentParameters = {
    "x": 0.0,
    "y": 0.0,
    "z": 0.0,
    "scale": 1.0,
    "Rotate x": "",
    "Rotate y": "",
    "Rotate z": "",
    "Translate x": "",
    "Translate y": "",
    "Translate z": "",
    "Load from": "",
    "Reset pos.": function(){
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.x = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.y = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.z = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
      fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.x = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.y = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.z = 0;
      guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
    },
    "Reset rot.": function(){
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qx = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qy = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qz = 0;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qw = 1;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
    },
    "Reset scale": function(){
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.scale = 1;
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
      fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.scale = 1;
      guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
    },
    "Done": function(){
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.revertPositionAfterFPSWeaponConfigurations();
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject = 0;
      guiHandler.hide(guiHandler.guiTypes.FPS_WEAPON_ALIGNMENT);
      terminal.clear();
      terminal.printInfo(Text.DONE);
      terminal.enable();
      activeControl = new FreeControls({});
      for (var i = 0; i<fpsWeaponGUIHandler.hiddenObjectsDueToFPSWeaponAlignmentConfiguration.length; i++){
        fpsWeaponGUIHandler.hiddenObjectsDueToFPSWeaponAlignmentConfiguration[i].visible = true;
      }
      delete fpsWeaponGUIHandler.hiddenObjectsDueToFPSWeaponAlignmentConfiguration;
    }
  };
}

FPSWeaponGUIHandler.prototype.show = function(obj){
  this.init();
  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();
  if (this.fpsWeaponAlignmentConfigurationObject){
    this.fpsWeaponAlignmentConfigurationObject.revertPositionAfterFPSWeaponConfigurations();
  }
  obj.quaternionBeforeFPSWeaponConfigurationPanelOpened = obj.mesh.quaternion.clone();
  camera.quaternion.set(0, 0, 0, 1);
  this.fpsWeaponAlignmentConfigurationObject = obj;
  obj.onFPSWeaponAlignmentUpdate();
  this.fpsWeaponAlignmentParameters.x = obj.fpsWeaponAlignment.x;
  this.fpsWeaponAlignmentParameters.y = obj.fpsWeaponAlignment.y;
  this.fpsWeaponAlignmentParameters.z = obj.fpsWeaponAlignment.z;
  this.fpsWeaponAlignmentParameters.scale = obj.fpsWeaponAlignment.scale;
  this.fpsWeaponAlignmentParameters["Rotate x"] = "0";
  this.fpsWeaponAlignmentParameters["Rotate y"] = "0";
  this.fpsWeaponAlignmentParameters["Rotate z"] = "0";
  this.fpsWeaponAlignmentParameters["Translate x"] = "0";
  this.fpsWeaponAlignmentParameters["Translate y"] = "0";
  this.fpsWeaponAlignmentParameters["Translate z"] = "0";
  this.fpsWeaponAlignmentParameters["Load from"] = "";
  this.prepareGUI();
  terminal.printInfo(Text.PRESS_DONE_BUTTON_TO);
  terminal.disable();
  activeControl = new CustomControls({});
  activeControl.onActivated();
  this.hiddenObjectsDueToFPSWeaponAlignmentConfiguration = [];
  for (var i = 0; i<scene.children.length; i++){
    var child = scene.children[i];
    if (child.id != obj.mesh.id && child.visible){
      child.visible = false;
      this.hiddenObjectsDueToFPSWeaponAlignmentConfiguration.push(child);
    }
  }
}

FPSWeaponGUIHandler.prototype.prepareGUI = function(){
  guiHandler.datGuiFPSWeaponAlignment = new dat.GUI({hideable: false});
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "x").min(-2).max(2).step(0.01).onChange(function(val){
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.x = val;
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
  }).listen();
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "y").min(-2).max(2).step(0.01).onChange(function(val){
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.y = val;
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
  }).listen();
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "z").min(-2).max(2).step(0.01).onChange(function(val){
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.z = val;
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
  }).listen();
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "scale").min(0.001).max(1).step(0.001).onChange(function(val){
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.scale = val;
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
  }).listen();
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Rotate x").onFinishChange(function(val){
    var rotVal;
    try{
      rotVal = parseFloat(eval(val));
      if (!(typeof rotVal == UNDEFINED) && !isNaN(rotVal)){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.rotateX(rotVal);
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qx = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.x;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qy = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.y;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qz = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.z;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qw = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.w;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
        fpsWeaponGUIHandler.fpsWeaponAlignmentParameters["Rotate x"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Rotate y").onFinishChange(function(val){
    var rotVal;
    try{
      rotVal = parseFloat(eval(val));
      if (!(typeof rotVal == UNDEFINED) && !isNaN(rotVal)){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.rotateY(rotVal);
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qx = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.x;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qy = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.y;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qz = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.z;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qw = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.w;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
        fpsWeaponGUIHandler.fpsWeaponAlignmentParameters["Rotate y"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Rotate z").onFinishChange(function(val){
    var rotVal;
    try{
      rotVal = parseFloat(eval(val));
      if (!(typeof rotVal == UNDEFINED) && !isNaN(rotVal)){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.rotateZ(rotVal);
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qx = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.x;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qy = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.y;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qz = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.z;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.qw = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.quaternion.w;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
        fpsWeaponGUIHandler.fpsWeaponAlignmentParameters["Rotate z"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Translate x").onFinishChange(function(val){
    var translateVal;
    try{
      translateVal = parseFloat(eval(val));
      if (!(typeof translateVal == UNDEFINED) && !isNaN(translateVal)){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.translateX(translateVal);
        REUSABLE_VECTOR.copy(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.position);
        REUSABLE_VECTOR.project(camera);
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.x = REUSABLE_VECTOR.x;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.y = REUSABLE_VECTOR.y;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.z = REUSABLE_VECTOR.z;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
        fpsWeaponGUIHandler.fpsWeaponAlignmentParameters["Translate x"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Translate y").onFinishChange(function(val){
    var translateVal;
    try{
      translateVal = parseFloat(eval(val));
      if (!(typeof translateVal == UNDEFINED) && !isNaN(translateVal)){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.translateY(translateVal);
        REUSABLE_VECTOR.copy(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.position);
        REUSABLE_VECTOR.project(camera);
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.x = REUSABLE_VECTOR.x;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.y = REUSABLE_VECTOR.y;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.z = REUSABLE_VECTOR.z;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
        fpsWeaponGUIHandler.fpsWeaponAlignmentParameters["Translate y"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Translate z").onFinishChange(function(val){
    var translateVal;
    try{
      translateVal = parseFloat(eval(val));
      if (!(typeof translateVal == UNDEFINED) && !isNaN(translateVal)){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.translateZ(translateVal);
        REUSABLE_VECTOR.copy(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.mesh.position);
        REUSABLE_VECTOR.project(camera);
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.x = REUSABLE_VECTOR.x;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.y = REUSABLE_VECTOR.y;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment.z = REUSABLE_VECTOR.z;
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
        fpsWeaponGUIHandler.fpsWeaponAlignmentParameters["Translate z"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  var otherWeaponsArray = [];
  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (objName != fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.name && obj.isFPSWeapon){
      otherWeaponsArray.push(objName);
    }
  }
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (objName != fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.name && obj.isFPSWeapon){
      otherWeaponsArray.push(objName);
    }
  }
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Load from", otherWeaponsArray).onChange(function(val){
    var obj = addedObjects[val] || objectGroups[val];
    for (var key in obj.fpsWeaponAlignment){
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.fpsWeaponAlignment[key] = obj.fpsWeaponAlignment[key];
    }
    fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.onFPSWeaponAlignmentUpdate();
    fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.x = obj.fpsWeaponAlignment.x;
    fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.y = obj.fpsWeaponAlignment.y;
    fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.z = obj.fpsWeaponAlignment.z;
    fpsWeaponGUIHandler.fpsWeaponAlignmentParameters.scale = obj.fpsWeaponAlignment.scale;
    guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
  }).listen();
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Reset pos.");
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Reset rot.");
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Reset scale");
  guiHandler.datGuiFPSWeaponAlignment.add(this.fpsWeaponAlignmentParameters, "Done");
}

FPSWeaponGUIHandler.prototype.update = function(){

}
