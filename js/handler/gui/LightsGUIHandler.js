var LightsGUIHandler = function(){

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

LightsGUIHandler.prototype.addStaticLights = function(staticFolder){
  var ambientFolder = staticFolder.addFolder("Ambient");
  var diffuseFolder = staticFolder.addFolder("Diffuse");
  var pointFolder = staticFolder.addFolder("Point");

  var staticAmbientConfigurations = this.getStaticAmbientConfigurations();
  ambientFolder.add(staticAmbientConfigurations, "Color").onChange(function(val){
    lightHandler.setStaticAmbientLight(new THREE.Color(staticAmbientConfigurations["Color"]), staticAmbientConfigurations["Strength"]);
  }).listen();
  ambientFolder.add(staticAmbientConfigurations, "Strength").min(0).max(5).step(0.1).onChange(function(val){
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
    subFolder.add(config, "Color").onChange(function(val){
      var vect = lightsGUIHandler.getVector(this.config["Direction"]);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticDiffuseLight(this.slotID)){
        lightHandler.editStaticDiffuseLight(this.slotID, vect, new THREE.Color(val), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Direction").onChange(function(val){
      var vect = lightsGUIHandler.getVector(val);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticDiffuseLight(this.slotID)){
        lightHandler.editStaticDiffuseLight(this.slotID, vect, new THREE.Color(this.config["Color"]), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Strength").min(0).max(5).step(0.1).onChange(function(val){
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
    subFolder.add(config, "Color").onChange(function(val){
      var vect = lightsGUIHandler.getVector(this.config["Position"]);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticPointLight(this.slotID)){
        lightHandler.editStaticPointLight(this.slotID, vect, new THREE.Color(val), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Position").onChange(function(val){
      var vect = lightsGUIHandler.getVector(val);
      if (!vect){
        return;
      }
      if (lightHandler.hasStaticPointLight(this.slotID)){
        lightHandler.editStaticPointLight(this.slotID, vect, new THREE.Color(this.config["Color"]), this.config["Strength"]);
      }
    }.bind({slotID: i, config: config})).listen();
    subFolder.add(config, "Strength").min(0).max(5).step(0.1).onChange(function(val){
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
}
