var FPSWeaponGUIHandler = function(){
  this.endPoints = ["+x", "+y", "+z", "-x", "-y", "-z"];
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
      if (fpsWeaponGUIHandler.muzzleFlashParameters["Has muz. flash"] && fpsWeaponGUIHandler.muzzleFlashParameters["Muzzle flash"] != ""){
        fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.muzzleFlashParameters = {
          muzzleFlashName: fpsWeaponGUIHandler.muzzleFlashParameters["Muzzle flash"],
          scale: fpsWeaponGUIHandler.muzzleFlashParameters["Scale"],
          childObj: fpsWeaponGUIHandler.muzzleFlashParameters["Child obj"],
          endpoint: fpsWeaponGUIHandler.muzzleFlashParameters["Endpoint"],
          rotationX: fpsWeaponGUIHandler.muzzleFlash.getRotationX(),
          rotationY: fpsWeaponGUIHandler.muzzleFlash.getRotationY(),
          rotationZ: fpsWeaponGUIHandler.muzzleFlash.getRotationZ()
        }
      }else{
        delete fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.muzzleFlashParameters;
      }
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.revertPositionAfterFPSWeaponConfigurations();
      fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject = 0;
      if (fpsWeaponGUIHandler.muzzleFlash){
        fpsWeaponGUIHandler.muzzleFlash.hide();
        fpsWeaponGUIHandler.muzzleFlash = 0;
        particleSystems = new Map();
      }
      if (fpsWeaponGUIHandler.lightning){
        fpsWeaponGUIHandler.lightning.mesh.visible = false;
        delete fpsWeaponGUIHandler.lightning;
      }
      guiHandler.hide(guiHandler.guiTypes.FPS_WEAPON_ALIGNMENT);
      terminal.clear();
      terminal.printInfo(Text.DONE);
      terminal.enable();
      activeControl = new FreeControls({});
      for (var i = 0; i<fpsWeaponGUIHandler.hiddenObjectsDueToFPSWeaponAlignmentConfiguration.length; i++){
        fpsWeaponGUIHandler.hiddenObjectsDueToFPSWeaponAlignmentConfiguration[i].visible = true;
      }
      delete fpsWeaponGUIHandler.hiddenObjectsDueToFPSWeaponAlignmentConfiguration;
      lightningHandler.onEditorClose();
    }
  };
  this.muzzleFlashParameters = {
    "Muzzle flash": "",
    "Has muz. flash": false,
    "Scale": 1.0,
    "Child obj": "",
    "Endpoint": "+x",
    "RotateX": "",
    "RotateY": "",
    "RotateZ": ""
  }
  this.lightningParameters = {
    "Lightning": "",
    "Has lightning": false,
    "Child obj": "",
    "Endpoint": "+x",
    "Ref distance": 40,
    "Ref length": 200,
    "Test length": 100
  }
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
  if (obj.muzzleFlashParameters){
    this.muzzleFlashParameters = {
      "Muzzle flash": obj.muzzleFlashParameters.muzzleFlashName,
      "Has muz. flash": true,
      "Scale": obj.muzzleFlashParameters.scale,
      "Child obj": obj.muzzleFlashParameters.childObj,
      "Endpoint": obj.muzzleFlashParameters.endpoint,
      "RotateX": "0",
      "RotateY": "0",
      "RotateZ": "0"
    }
    var muzzleFlash = muzzleFlashes[obj.muzzleFlashParameters.muzzleFlashName];
    if (muzzleFlash){
      var childObjParam = null;
      if (obj.muzzleFlashParameters.childObj != ""){
        childObjParam = obj.muzzleFlashParameters.childObj;
      }
      muzzleFlash.init();
      muzzleFlash.attachToFPSWeapon(obj, childObjParam, obj.muzzleFlashParameters.endpoint);
      muzzleFlash.setRotation(obj.muzzleFlashParameters.rotationX, obj.muzzleFlashParameters.rotationY, obj.muzzleFlashParameters.rotationZ);
      muzzleFlash.setScale(obj.muzzleFlashParameters.scale);
      this.muzzleFlash = muzzleFlash;
    }
  }else{
    this.muzzleFlashParameters = {
      "Muzzle flash": "",
      "Has muz. flash": false,
      "Scale": 1.0,
      "Child obj": "",
      "Endpoint": "+x",
      "RotateX": "0",
      "RotateY": "0",
      "RotateZ": "0"
    }
  }
  this.prepareGUI();
  terminal.printInfo(Text.PRESS_DONE_BUTTON_TO);
  terminal.disable();
  activeControl = new CustomControls({});
  activeControl.onActivated();
  this.hiddenObjectsDueToFPSWeaponAlignmentConfiguration = [];
  for (var i = 0; i<scene.children.length; i++){
    var child = scene.children[i];
    var skip = (this.lightning && child == this.lightning.mesh);
    if (!skip && child.id != obj.mesh.id && child.visible){
      child.visible = false;
      this.hiddenObjectsDueToFPSWeaponAlignmentConfiguration.push(child);
    }
  }
  lightningHandler.onFPSWeaponGUIOpened();
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
  var muzzleFlashAry = [];
  for (var muzzleFlashName in sceneHandler.getMuzzleFlashes()){
    var muzzleFlashUsed = false;
    for (var objName in addedObjects){
      if (objName != fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.name){
        var obj = addedObjects[objName];
        if (obj.isFPSWeapon && obj.muzzleFlashParameters && obj.muzzleFlashParameters.muzzleFlashName){
          if (obj.muzzleFlashParameters.muzzleFlashName == muzzleFlashName){
            muzzleFlashUsed = true;
          }
        }
      }
    }
    for (var objName in objectGroups){
      if (objName != fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.name){
        var obj = objectGroups[objName];
        if (obj.isFPSWeapon && obj.muzzleFlashParameters && obj.muzzleFlashParameters.muzzleFlashName){
          if (obj.muzzleFlashParameters.muzzleFlashName == muzzleFlashName){
            muzzleFlashUsed = true;
          }
        }
      }
    }
    if (!muzzleFlashUsed){
      muzzleFlashAry.push(muzzleFlashName);
    }
  }
  var lightningAry = [];
  for (var lightningName in sceneHandler.getLightnings()){
    var isUsed = (lightnings[lightningName].attachedToFPSWeapon && lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name != fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject.name);
    if (!isUsed){
      lightningAry.push(lightningName);
    }
  }
  var muzzleFlashFolder = guiHandler.datGuiFPSWeaponAlignment.addFolder("Muzzle flash");
  var hasMuzzleFlashController = muzzleFlashFolder.add(this.muzzleFlashParameters, "Has muz. flash").onChange(function(val){
    if (muzzleFlashAry.length == 0){
      fpsWeaponGUIHandler.muzzleFlashParameters["Has muz. flash"] = false;
      return;
    }
    if (val){
      guiHandler.enableController(muzzleFlashNameController);
      guiHandler.enableController(muzzleFlashScaleController);
      guiHandler.enableController(muzzleFlashEndPointController);
      guiHandler.enableController(muzzleFlashRotateXController);
      guiHandler.enableController(muzzleFlashRotateYController);
      guiHandler.enableController(muzzleFlashRotateZController);
      if (muzzleFlashChildObjectController){
        guiHandler.enableController(muzzleFlashChildObjectController);
      }
      if (fpsWeaponGUIHandler.muzzleFlashParameters["Muzzle flash"] != ""){
        var childObjParam = null;
        if (fpsWeaponGUIHandler.muzzleFlashParameters["Child obj"] != ""){
          childObjParam = fpsWeaponGUIHandler.muzzleFlashParameters["Child obj"];
        }
        var muzzleFlash = muzzleFlashes[fpsWeaponGUIHandler.muzzleFlashParameters["Muzzle flash"]];
        muzzleFlash.init();
        muzzleFlash.attachToFPSWeapon(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject, childObjParam, fpsWeaponGUIHandler.muzzleFlashParameters["Endpoint"]);
        muzzleFlash.setScale(fpsWeaponGUIHandler.muzzleFlashParameters["Scale"]);
        fpsWeaponGUIHandler.muzzleFlash = muzzleFlash;
      }
    }else{
      if (fpsWeaponGUIHandler.muzzleFlash){
        fpsWeaponGUIHandler.muzzleFlash.hide();
        fpsWeaponGUIHandler.muzzleFlash = 0;
      }
      guiHandler.disableController(muzzleFlashNameController);
      guiHandler.disableController(muzzleFlashScaleController);
      guiHandler.disableController(muzzleFlashEndPointController);
      guiHandler.disableController(muzzleFlashRotateXController);
      guiHandler.disableController(muzzleFlashRotateYController);
      guiHandler.disableController(muzzleFlashRotateZController);
      if (muzzleFlashChildObjectController){
        guiHandler.disableController(muzzleFlashChildObjectController);
      }
    }
  }).listen();
  var muzzleFlashNameController = muzzleFlashFolder.add(this.muzzleFlashParameters, "Muzzle flash", muzzleFlashAry).onChange(function(val){
    if (fpsWeaponGUIHandler.muzzleFlash){
      fpsWeaponGUIHandler.muzzleFlash.hide();
      fpsWeaponGUIHandler.muzzleFlash = 0;
    }
    fpsWeaponGUIHandler.muzzleFlash = muzzleFlashes[val];
    fpsWeaponGUIHandler.muzzleFlash.init();
    fpsWeaponGUIHandler.muzzleFlash.attachToFPSWeapon(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject, fpsWeaponGUIHandler.muzzleFlashParameters["Child obj"], fpsWeaponGUIHandler.muzzleFlashParameters["Endpoint"]);
    fpsWeaponGUIHandler.muzzleFlashParameters["Scale"] = fpsWeaponGUIHandler.muzzleFlash.getScale();
  }).listen();
  var muzzleFlashScaleController = muzzleFlashFolder.add(this.muzzleFlashParameters, "Scale").min(0.001).max(1).step(0.001).onChange(function(val){
    fpsWeaponGUIHandler.muzzleFlash.setScale(val);
  }).listen();
  var muzzleFlashChildObjectController;
  if (this.fpsWeaponAlignmentConfigurationObject.isObjectGroup){
    var childObjNames = [];
    for (var objName in this.fpsWeaponAlignmentConfigurationObject.group){
      childObjNames.push(objName);
      if (this.muzzleFlashParameters["Child obj"] == ""){
        this.muzzleFlashParameters["Child obj"] = objName;
      }
    }
    muzzleFlashChildObjectController = muzzleFlashFolder.add(this.muzzleFlashParameters, "Child obj", childObjNames).onChange(function(val){
      fpsWeaponGUIHandler.muzzleFlash.attachToFPSWeapon(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject, val, fpsWeaponGUIHandler.muzzleFlashParameters["Endpoint"]);
    }).listen();
  }
  var muzzleFlashEndPointController = muzzleFlashFolder.add(this.muzzleFlashParameters, "Endpoint", this.endPoints).onChange(function(val){
    fpsWeaponGUIHandler.muzzleFlash.attachToFPSWeapon(fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject, fpsWeaponGUIHandler.muzzleFlashParameters["Child obj"], val);
  }).listen();
  var muzzleFlashRotateXController = muzzleFlashFolder.add(this.muzzleFlashParameters, "RotateX").onFinishChange(function(val){
    var rotVal;
    try{
      rotVal = parseFloat(eval(val));
      if (!(typeof rotVal == UNDEFINED) && !isNaN(rotVal)){
        fpsWeaponGUIHandler.muzzleFlash.rotateX(rotVal);
        fpsWeaponGUIHandler.muzzleFlashParameters["RotateX"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  var muzzleFlashRotateYController = muzzleFlashFolder.add(this.muzzleFlashParameters, "RotateY").onFinishChange(function(val){
    var rotVal;
    try{
      rotVal = parseFloat(eval(val));
      if (!(typeof rotVal == UNDEFINED) && !isNaN(rotVal)){
        fpsWeaponGUIHandler.muzzleFlash.rotateY(rotVal);
        fpsWeaponGUIHandler.muzzleFlashParameters["RotateY"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  var muzzleFlashRotateZController = muzzleFlashFolder.add(this.muzzleFlashParameters, "RotateZ").onFinishChange(function(val){
    var rotVal;
    try{
      rotVal = parseFloat(eval(val));
      if (!(typeof rotVal == UNDEFINED) && !isNaN(rotVal)){
        fpsWeaponGUIHandler.muzzleFlash.rotateZ(rotVal);
        fpsWeaponGUIHandler.muzzleFlashParameters["RotateZ"] = "0";
        guiHandler.datGuiFPSWeaponAlignment.updateDisplay();
      }
    }catch (err){
    }
  });
  if (muzzleFlashAry.length == 0){
    guiHandler.disableController(hasMuzzleFlashController);
    guiHandler.disableController(muzzleFlashNameController);
    guiHandler.disableController(muzzleFlashScaleController);
    guiHandler.disableController(muzzleFlashEndPointController);
    guiHandler.disableController(muzzleFlashRotateXController);
    guiHandler.disableController(muzzleFlashRotateYController);
    guiHandler.disableController(muzzleFlashRotateZController);
    if (muzzleFlashChildObjectController){
      guiHandler.disableController(muzzleFlashChildObjectController);
    }
  }
  if (!this.muzzleFlashParameters["Has muz. flash"]){
    guiHandler.disableController(muzzleFlashNameController);
    guiHandler.disableController(muzzleFlashScaleController);
    guiHandler.disableController(muzzleFlashEndPointController);
    guiHandler.disableController(muzzleFlashRotateXController);
    guiHandler.disableController(muzzleFlashRotateYController);
    guiHandler.disableController(muzzleFlashRotateZController);
    if (muzzleFlashChildObjectController){
      guiHandler.disableController(muzzleFlashChildObjectController);
    }
  }
  var lightningFolder = guiHandler.datGuiFPSWeaponAlignment.addFolder("Lightning");
  var handleLightning = function(){
    var obj = fpsWeaponGUIHandler.fpsWeaponAlignmentConfigurationObject;
    var childObjName = null;
    if (obj.isObjectGroup){
      childObjName = fpsWeaponGUIHandler.lightningParameters["Child obj"];
    }
    var lightning = lightnings[fpsWeaponGUIHandler.lightningParameters["Lightning"]];
    lightning.setCorrectionProperties(fpsWeaponGUIHandler.lightningParameters["Ref distance"], fpsWeaponGUIHandler.lightningParameters["Ref length"]);
    lightning.attachToFPSWeapon(obj, childObjName, fpsWeaponGUIHandler.lightningParameters["Endpoint"]);
    lightning.handleFPSWeaponStartPosition();
    lightning.handleFPSWeaponEndPoint(fpsWeaponGUIHandler.lightningParameters["Test length"]);
    lightningHandler.onSetCorrectionProperties(lightning);
    lightning.mesh.visible = true;
    fpsWeaponGUIHandler.lightning = lightning;
  }
  var hasLightningController = lightningFolder.add(this.lightningParameters, "Has lightning").onChange(function(val){
    if (lightningAry.length == 0){
      fpsWeaponGUIHandler.lightningParameters["Has lightning"] = false;
      return;
    }
    if (val){
      handleLightning();
    }else{
      fpsWeaponGUIHandler.lightning.mesh.visible = false;
      fpsWeaponGUIHandler.lightning.detachFromFPSWeapon();
      lightningHandler.onDisableCorrection(fpsWeaponGUIHandler.lightning);
      delete fpsWeaponGUIHandler.lightning;
    }
  }).listen();
  var lightningNameController = lightningFolder.add(this.lightningParameters, "Lightning", lightningAry).onChange(function(val){
    if (fpsWeaponGUIHandler.lightning){
      fpsWeaponGUIHandler.lightning.mesh.visible = false;
      fpsWeaponGUIHandler.lightning.detachFromFPSWeapon();
      lightningHandler.onDisableCorrection(fpsWeaponGUIHandler.lightning);
    }
    handleLightning();
  }).listen();
  var lightningChildObjController;
  if (this.fpsWeaponAlignmentConfigurationObject.isObjectGroup){
    var childObjNames = [];
    for (var objName in this.fpsWeaponAlignmentConfigurationObject.group){
      childObjNames.push(objName);
      if (this.lightningParameters["Child obj"] == ""){
        this.lightningParameters["Child obj"] = objName;
      }
    }
    lightningChildObjController = lightningFolder.add(this.lightningParameters, "Child obj", childObjNames).onChange(function(val){
      fpsWeaponGUIHandler.lightning.fpsWeaponConfigurations.childObjName = val;
      fpsWeaponGUIHandler.lightning.handleFPSWeaponStartPosition();
      fpsWeaponGUIHandler.lightning.handleFPSWeaponEndPoint(fpsWeaponGUIHandler.lightningParameters["Test length"]);
    }).listen();
  }
  var lightningEndPointController = lightningFolder.add(this.lightningParameters, "Endpoint", this.endPoints).onChange(function(val){
    if (fpsWeaponGUIHandler.lightning){
      fpsWeaponGUIHandler.lightning.fpsWeaponConfigurations.endpoint = val;
      fpsWeaponGUIHandler.lightning.handleFPSWeaponStartPosition();
      fpsWeaponGUIHandler.lightning.handleFPSWeaponEndPoint(fpsWeaponGUIHandler.lightningParameters["Test length"]);
    }
  }).listen();
  var lightningRefDistanceController = lightningFolder.add(this.lightningParameters, "Ref distance").min(0).max(500).step(0.1).onChange(function(val){
    if (fpsWeaponGUIHandler.lightning){
      fpsWeaponGUIHandler.lightning.setCorrectionProperties(val, fpsWeaponGUIHandler.lightningParameters["Ref length"]);
      lightningHandler.onSetCorrectionProperties(fpsWeaponGUIHandler.lightning);
    }
  }).listen();
  var lightningRefLengthController = lightningFolder.add(this.lightningParameters, "Ref length").min(0).max(1000).step(0.1).onChange(function(val){
    if (fpsWeaponGUIHandler.lightning){
      fpsWeaponGUIHandler.lightning.setCorrectionProperties(fpsWeaponGUIHandler.lightningParameters["Ref distance"], val);
      lightningHandler.onSetCorrectionProperties(fpsWeaponGUIHandler.lightning);
    }
  }).listen();
  var lightningTestLengthController = lightningFolder.add(this.lightningParameters, "Test length").min(1).max(1000).step(1).onChange(function(val){
    if (fpsWeaponGUIHandler.lightning){
      fpsWeaponGUIHandler.lightning.handleFPSWeaponEndPoint(val);
    }
  }).listen();
  if (lightningAry.length == 0){
    guiHandler.disableController(hasLightningController);
    guiHandler.disableController(lightningEndPointController);
    guiHandler.disableController(lightningRefDistanceController);
    guiHandler.disableController(lightningRefLengthController);
    guiHandler.disableController(lightningTestLengthController);
    if (lightningChildObjController){
      guiHandler.disableController(lightningChildObjController);
    }
  }else{
    this.lightningParameters["Lightning"] = lightningAry[0];
  }
  for (var lightningName in lightnings){
    var lightning = lightnings[lightningName];
    if (lightning.attachedToFPSWeapon && lightning.fpsWeaponConfigurations.weaponObj.name == this.fpsWeaponAlignmentConfigurationObject.name){
      this.lightningParameters["Has lightning"] = true;
      this.lightningParameters["Lightning"] = lightning.name;
      this.lightningParameters["Child obj"] = lightning.fpsWeaponConfigurations.childObjName;
      this.lightningParameters["Endpoint"] = lightning.fpsWeaponConfigurations.endpoint;
      this.lightningParameters["Ref distance"] = lightning.correctionRefDistance;
      this.lightningParameters["Ref length"] = lightning.correctionRefLength;
      handleLightning();
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
  if (this.muzzleFlash){
    this.muzzleFlash.update();
  }
  if (this.lightning){
    lightningHandler.handleActiveLightnings(this.lightning);
  }
}
