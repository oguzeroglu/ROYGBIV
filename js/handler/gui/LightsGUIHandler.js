var LightsGUIHandler = function(){
  this.dynamicLightKeys = [];
  for (var key in lightHandler.dynamicLightTypes){
    this.dynamicLightKeys.push(key);
  }
}

LightsGUIHandler.prototype.getVector = function(str){
  var splitted = str.split(",");
  if (splitted.length != 3){
    return false;
  }
  var v1 = parseFloat(splitted[0]);
  var v2 = parseFloat(splitted[1]);
  var v3 = parseFloat(splitted[2]);
  if (isNaN(v1) || isNaN(v2) || isNaN(v3)){
    return false;
  }
  return new THREE.Vector3(v1, v2, v3);
}

LightsGUIHandler.prototype.getStaticPointConfigurations = function(slotID){
  if (!lightHandler.hasStaticPointLight(slotID)){
    return {
      "Color": "#ffffff",
      "Position": "0,0,0",
      "Strength": 1,
      "Active": false
    };
  }
  var color = lightHandler.getStaticPointColor(slotID);
  var position = lightHandler.getStaticPointPosition(slotID);
  var strength = lightHandler.getStaticPointStrength(slotID);

  return {
    "Color": "#" + color.getHexString(),
    "Position": position.x + "," + position.y + "," + position.z,
    "Strength": strength,
    "Active": true
  };
}

LightsGUIHandler.prototype.getStaticDiffuseConfigurations = function(slotID){
  if (!lightHandler.hasStaticDiffuseLight(slotID)){
    return {
      "Color": "#ffffff",
      "Direction": "0,1,0",
      "Strength": 1,
      "Active": false
    };
  }
  var color = lightHandler.getStaticDiffuseColor(slotID);
  var direction = lightHandler.getStaticDiffuseDirection(slotID);
  var strength = lightHandler.getStaticDiffuseStrength(slotID);

  return {
    "Color": "#" + color.getHexString(),
    "Direction": direction.x + "," + direction.y + "," + direction.z,
    "Strength": strength,
    "Active": true
  };
}

LightsGUIHandler.prototype.getStaticAmbientConfigurations = function(){
  if (!lightHandler.hasStaticAmbientLight()){
    return {
      "Color": "#ffffff",
      "Strength": 1,
      "Active": false
    };
  }
  return {
    "Color": "#" + lightHandler.getStaticAmbientColor().getHexString(),
    "Strength": lightHandler.getStaticAmbientStrength(),
    "Active": true
  };
}

LightsGUIHandler.prototype.addDynamicLightFolder = function(dynLight, folder){

  var staticInfo = dynLight.staticInfo;
  var dynInfo = dynLight.dynamicInfo;
  var name = dynLight.name;

  var dynLightFolder = folder.addFolder(name);

  var staticFieldsFolder = dynLightFolder.addFolder("Static fields");
  var dynamicFieldsFolder = dynLightFolder.addFolder("Dynamic fields");

  var deleteConf = {
    "Delete": function(){
      lightHandler.removeDynamicLight(dynLight);
      folder.removeFolder(dynLightFolder);
      terminal.clear();
      terminal.printInfo(Text.LIGHT_REMOVED);
    }
  }

  dynLightFolder.add(deleteConf, "Delete");

  for (var key in staticInfo){
    var step = key.startsWith("POS") ? 1 : 0.01;
    var min = key.startsWith("POS") ? -5000 : 0;
    var max = key.startsWith("POS") ? 5000 : 1;
    if (key.startsWith("DIR")){
      min = -1;
    }
    staticFieldsFolder.add(staticInfo, key).step(step).min(min).max(max).onFinishChange(function(val){
      lightHandler.removeDynamicLight(JSON.parse(JSON.stringify(dynLight)));
      lightHandler.addDynamicLight(JSON.parse(JSON.stringify(dynLight)));
    }).listen();
  }

  for (var key in dynInfo){
    var step = key.startsWith("pos") ? 1 : 0.01;
    var min = key.startsWith("pos") ? -5000 : 0;
    var max = key.startsWith("pos") ? 5000 : 1;
    if (key.startsWith("dir")){
      min = -1;
    }
    dynamicFieldsFolder.add(dynInfo, key).step(step).min(min).max(max).onChange(function(val){
      lightHandler.updateDynamicLight(JSON.parse(JSON.stringify(dynLight)));
    }).listen();
  }
}

LightsGUIHandler.prototype.createDynamicLightFromConfiguration = function(confs, folder){
  var name = confs.Name;
  var type = confs.Type;

  var hasDynamicStrength = false, hasDynamicColor = false, hasDynamicPosition = false, hasDynamicDir = false;
  var splitted = type.split("_");
  for (var i = 1; i < splitted.length; i ++){
    if (splitted[i] == "COLOR"){
      hasDynamicColor = true;
    }else if (splitted[i] == "STRENGTH"){
      hasDynamicStrength = true;
    }else if (splitted[i] == "DIR"){
      hasDynamicDir = true;
    }else if (splitted[i] == "POSITION"){
      hasDynamicPosition = true;
    }
  }

  var dynInfo = {};
  var staticInfo = {};
  if (hasDynamicStrength){
    dynInfo.strength = 1;
  }else{
    staticInfo.STRENGTH = 1;
  }
  if (hasDynamicDir){
    dynInfo.dirX = 0;
    dynInfo.dirY = 1;
    dynInfo.dirZ = 0;
  }else if (splitted[0] == "DIFFUSE"){
    staticInfo.DIR_X = 0;
    staticInfo.DIR_Y = 1;
    staticInfo.DIR_Z = 0;
  }
  if (hasDynamicColor){
    dynInfo.colorR = 0;
    dynInfo.colorG = 1;
    dynInfo.colorB = 0;
  }else{
    staticInfo.COLOR_R = 0;
    staticInfo.COLOR_G = 1;
    staticInfo.COLOR_B = 0;
  }
  if (hasDynamicPosition){
    dynInfo.positionX = 0;
    dynInfo.positionY = 0;
    dynInfo.positionZ = 0;
  }else if (splitted[0] == "POINT"){
    staticInfo.POS_X = 0;
    staticInfo.POS_Y = 0;
    staticInfo.POS_Z = 0;
  }

  var dynLight = { name: name, typeKey: type, staticInfo: staticInfo, dynamicInfo: dynInfo };

  if (!lightHandler.addDynamicLight(dynLight)){
    terminal.clear();
    terminal.printError(Text.NO_AVAILABLE_SLOT_FOR_THIS_LIGHT);
    return;
  }

  this.addDynamicLightFolder(dynLight, folder);
  confs.Name = "";
  terminal.clear();
  terminal.printInfo(Text.LIGHT_ADDED);
}

LightsGUIHandler.prototype.addDynamicLights = function(dynamicFolder){
  var dynamicLightKeys = this.dynamicLightKeys;
  var newLightConfigurations = {
    Name: "",
    Type: dynamicLightKeys[0],
    Add: function(){
      if (this.Name == ""){
        terminal.clear();
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }
      if (lightHandler.dynamicLights[this.Name]){
        terminal.clear();
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }
      if (this.Type.startsWith("AMBIENT")){
        if (lightHandler.staticAmbientColor){
          terminal.clear();
          terminal.printError(Text.SCENE_ALREADY_HAS_A_STATIC_AMBIENT_LIGHT);
          return;
        }
        for (var name in lightHandler.dynamicLights){
          if (lightHandler.dynamicLights[name].typeKey.startsWith("AMBIENT")){
            terminal.clear();
            terminal.printError(Text.SCENE_ALREADY_HAS_A_DYNAMIC_AMBIENT_LIGHT);
            return;
          }
        }
      }
      lightsGUIHandler.createDynamicLightFromConfiguration(this, dynamicFolder);
    }
  };

  dynamicFolder.add(newLightConfigurations, "Name").listen();
  dynamicFolder.add(newLightConfigurations, "Type", dynamicLightKeys).listen();
  dynamicFolder.add(newLightConfigurations, "Add").listen();

  for (var lightName in lightHandler.dynamicLights){
    this.addDynamicLightFolder(JSON.parse(JSON.stringify(lightHandler.dynamicLights[lightName])), dynamicFolder);
  }
}

LightsGUIHandler.prototype.addStaticLights = function(staticFolder){
  var ambientFolder = staticFolder.addFolder("Ambient");
  var diffuseFolder = staticFolder.addFolder("Diffuse");
  var pointFolder = staticFolder.addFolder("Point");

  var staticAmbientConfigurations = this.getStaticAmbientConfigurations();
  ambientFolder.add(staticAmbientConfigurations, "Color").onFinishChange(function(val){
    if (!staticAmbientConfigurations["Active"]){
      return;
    }
    lightHandler.setStaticAmbientLight(new THREE.Color(staticAmbientConfigurations["Color"]), staticAmbientConfigurations["Strength"]);
  }).listen();
  ambientFolder.add(staticAmbientConfigurations, "Strength").min(0).max(5).step(0.1).onFinishChange(function(val){
    if (!staticAmbientConfigurations["Active"]){
      return;
    }
    lightHandler.setStaticAmbientLight(new THREE.Color(staticAmbientConfigurations["Color"]), staticAmbientConfigurations["Strength"]);
  }).listen();
  ambientFolder.add(staticAmbientConfigurations, "Active").onChange(function(val){
    if (val){
      lightHandler.setStaticAmbientLight(new THREE.Color(staticAmbientConfigurations["Color"]), staticAmbientConfigurations["Strength"]);
      terminal.clear();
      terminal.printInfo(Text.LIGHT_ADDED);
    }else{
      lightHandler.removeStaticAmbientLight();
      terminal.clear();
      terminal.printInfo(Text.LIGHT_REMOVED);
    }
  }).listen();

  for (var i = 1; i <= MAX_STATIC_DIFFUSE_LIGHT_COUNT; i ++){
    var subFolder = diffuseFolder.addFolder("Diffuse " + i);
    var config = this.getStaticDiffuseConfigurations(i);
    subFolder.add(config, "Color").onFinishChange(function(val){
      if (!this.config["Active"]){
        return;
      }
      var vect = lightsGUIHandler.getVector(this.config["Direction"]);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticDiffuseLight(this.slotID)){
        lightHandler.editStaticDiffuseLight(this.slotID, vect, new THREE.Color(val), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Direction").onFinishChange(function(val){
      if (!this.config["Active"]){
        return;
      }
      var vect = lightsGUIHandler.getVector(val);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticDiffuseLight(this.slotID)){
        lightHandler.editStaticDiffuseLight(this.slotID, vect, new THREE.Color(this.config["Color"]), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Strength").min(0).max(5).step(0.1).onFinishChange(function(val){
      if (!this.config["Active"]){
        return;
      }
      var vect = lightsGUIHandler.getVector(this.config["Direction"]);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticDiffuseLight(this.slotID)){
        lightHandler.editStaticDiffuseLight(this.slotID, vect, new THREE.Color(this.config["Color"]), val);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Active").onChange(function(val){
      if (!val){
        lightHandler.removeStaticDiffuseLight(this.slotID);
        terminal.clear();
        terminal.printInfo(Text.LIGHT_REMOVED);
      }else{
        var vect = lightsGUIHandler.getVector(this.config["Direction"]);
        if (!vect){
          terminal.clear();
          terminal.printError(Text.INVALID_DIRECTION);
          this.config["Active"] = false;
          return;
        }
        lightHandler.addStaticDiffuseLight(vect, new THREE.Color(this.config["Color"]), this.config["Strength"], this.slotID);
        terminal.clear();
        terminal.printInfo(Text.LIGHT_ADDED);
      }
    }.bind({slotID: i, config: config})).listen();
  }

  for (var i = 1; i <= MAX_STATIC_DIFFUSE_LIGHT_COUNT; i ++){
    var subFolder = pointFolder.addFolder("Point " + i);
    var config = this.getStaticPointConfigurations(i);
    subFolder.add(config, "Color").onFinishChange(function(val){
      if (!this.config["Active"]){
        return;
      }
      var vect = lightsGUIHandler.getVector(this.config["Position"]);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticPointLight(this.slotID)){
        lightHandler.editStaticPointLight(this.slotID, vect, new THREE.Color(val), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Position").onFinishChange(function(val){
      if (!this.config["Active"]){
        return;
      }
      var vect = lightsGUIHandler.getVector(val);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticPointLight(this.slotID)){
        lightHandler.editStaticPointLight(this.slotID, vect, new THREE.Color(this.config["Color"]), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Strength").min(0).max(5).step(0.1).onFinishChange(function(val){
      if (!this.config["Active"]){
        return;
      }
      var vect = lightsGUIHandler.getVector(this.config["Position"]);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticPointLight(this.slotID)){
        lightHandler.editStaticPointLight(this.slotID, vect, new THREE.Color(this.config["Color"]), val);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Active").onChange(function(val){
      if (!val){
        lightHandler.removeStaticPointLight(this.slotID);
        terminal.clear();
        terminal.printInfo(Text.LIGHT_REMOVED);
      }else{
        var vect = lightsGUIHandler.getVector(this.config["Position"]);
        if (!vect){
          terminal.clear();
          terminal.printError(Text.INVALID_POSITION);
          this.config["Active"] = false;
          return;
        }
        lightHandler.addStaticPointLight(vect, new THREE.Color(this.config["Color"]), this.config["Strength"], this.slotID);
        terminal.clear();
        terminal.printInfo(Text.LIGHT_ADDED);
      }
    }.bind({slotID: i, config: config})).listen();
  }
}

LightsGUIHandler.prototype.hide = function(){
  lGUIFocused = false;
  guiHandler.hide(guiHandler.guiTypes.LIGHTS);
  terminal.clear();
  terminal.printInfo(Text.OK);
}

LightsGUIHandler.prototype.show = function(){
  guiHandler.datGuiLights = new dat.GUI({hideable: false});
  guiHandler.datGuiLights.domElement.addEventListener("mousedown", function(e){
    lGUIFocused = true;
  });
  var staticFolder = guiHandler.datGuiLights.addFolder("Static");
  var dynamicFolder = guiHandler.datGuiLights.addFolder("Dynamic");

  guiHandler.datGuiLights.add({
    "Done": function(){
      lightsGUIHandler.hide();
    }
  }, "Done").listen();
  this.addStaticLights(staticFolder);
  this.addDynamicLights(dynamicFolder);
}
