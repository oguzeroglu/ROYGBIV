var ParticleSystemCreatorGUIHandler = function(){
  this.actionsByTypes = {
    "CUSTOM": this.showCustom,
    "SMOKE": this.showSmoke,
    "TRAIL": this.showTrail,
    "PLASMA": this.showPlasma,
    "FIRE_EXPLOSION": this.showFireExplosion,
    "MAGIC_CIRCLE": this.showMagicCircle,
    "CIRC_EXPLOSION": this.showCircularExplosion,
    "DYNAMIC_TRAIL": this.showDynamicTrail,
    "LASER": this.showLaser,
    "WATERFALL": this.showWaterfall,
    "SNOW": this.showSnow,
    "CONFETTI": this.showConfetti
  }
  this.typesAry = [];
  for (var key in this.actionsByTypes){
    this.typesAry.push(key);
  }
  this.typeParam = {"Type": "CUSTOM"};
  this.buttonsParam = {
    "Cancel": function(){
      activeControl = new FreeControls({});
      guiHandler.hideAll();
      terminal.enable();
      terminal.clear();
      terminal.printInfo(Text.OPERATION_CANCELLED);
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      if (particleSystemCreatorGUIHandler.hiddenEngineObjects){
        for (var i = 0; i<particleSystemCreatorGUIHandler.hiddenEngineObjects.length; i++){
          particleSystemCreatorGUIHandler.hiddenEngineObjects[i].visible = true;
        }
        particleSystemCreatorGUIHandler.hiddenEngineObjects = [];
      }
      camera.quaternion.set(0, 0, 0, 1);
      camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
    },
    "Done": function(){
      activeControl = new FreeControls({});
      guiHandler.hideAll();
      terminal.enable();
      terminal.clear();
      terminal.printInfo(Text.PARTICLE_SYSTEM_CREATED);
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      if (particleSystemCreatorGUIHandler.hiddenEngineObjects){
        for (var i = 0; i<particleSystemCreatorGUIHandler.hiddenEngineObjects.length; i++){
          particleSystemCreatorGUIHandler.hiddenEngineObjects[i].visible = true;
        }
        particleSystemCreatorGUIHandler.hiddenEngineObjects = [];
      }
      camera.quaternion.set(0, 0, 0, 1);
      camera.position.set(initialCameraX, initialCameraY, initialCameraZ);
      var preConfiguredParticleSystem = particleSystemCreatorGUIHandler.preConfiguredParticleSystem;
      preConfiguredParticleSystems[preConfiguredParticleSystem.name] = preConfiguredParticleSystem;
    }
  };
}

ParticleSystemCreatorGUIHandler.prototype.update = function(){
  if (!this.particleSystem){
    return;
  }
  this.particleSystem.update();
}

ParticleSystemCreatorGUIHandler.prototype.addButtonsController = function(){
  this.cancelController = guiHandler.datGuiPSCreator.add(this.buttonsParam, "Cancel");
  this.doneController = guiHandler.datGuiPSCreator.add(this.buttonsParam, "Done");
}

ParticleSystemCreatorGUIHandler.prototype.addTypeController = function(type){
  this.typeParam["Type"] = type;
  this.typeController = guiHandler.datGuiPSCreator.add(this.typeParam, "Type", this.typesAry).onChange(function(val){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    guiHandler.hideAll();
    activeControl = new OrbitControls({});
    activeControl.onActivated();
    particleSystemCreatorGUIHandler.actionsByTypes[val]();
  }).listen();
}

ParticleSystemCreatorGUIHandler.prototype.showConfetti = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CONFETTI");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showSnow = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("SNOW");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showWaterfall = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("WATERFALL");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showLaser = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("LASER");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showDynamicTrail = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("DYNAMIC_TRAIL");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showCircularExplosion = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CIRC_EXPLOSION");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showMagicCircle = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("MAGIC_CIRCLE");
  var magicCircleParameters = {particleCount: 100, expireTime: 0, speed: 10, acceleration: 0, radius: 10, circleDistortionCoefficient: 0, lifetime: 0, angleStep: 0, particleSize: 5, colorName: "#ffffff", hasTargetColor: false, alpha: 1, hasAlphaVariation: false, hasTexture: false};
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "speed").min(0.1).max(5000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "acceleration").min(0).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "radius").min(0.1).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "circleDistortionCoefficient").min(0).max(1000).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "lifetime").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "angleStep").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "particleSize").min(0.1).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(magicCircleParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "hasTargetColor").onChange(function(val){

  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "hasAlphaVariation").onChange(function(val){

  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "hasTexture").onChange(function(val){

  }).listen();
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addButtonsController();
  particleSystemCreatorGUIHandler.magicCircleGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.magicCircleParameters){
      params[key] = particleSystemCreatorGUIHandler.magicCircleParameters[key];
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateMagicCircle(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "MAGIC_CIRCLE", params);
  }
  particleSystemCreatorGUIHandler.magicCircleParameters = magicCircleParameters;
  particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
}

ParticleSystemCreatorGUIHandler.prototype.showFireExplosion = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("FIRE_EXPLOSION");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showPlasma = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("PLASMA");
  var plasmaParameters = {expireTime: 0, radius: 10, avgParticleSpeed: 20, particleCount: 100, particleSize: 1, alpha: 1, color: "#ffffff", alphaVariation: 0, hasTexture: false, textureName: "", rgbFilter: "r,g,b"};
  guiHandler.datGuiPSCreator.add(plasmaParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(plasmaParameters, "radius").min(1).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(plasmaParameters, "avgParticleSpeed").min(0.1).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(plasmaParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(plasmaParameters, "particleSize").min(0.1).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(plasmaParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(plasmaParameters, "alphaVariation").min(-100).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(plasmaParameters, "color").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.plasmaHasTextureController = guiHandler.datGuiPSCreator.add(plasmaParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.plasmaParameters["hasTexture"] = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.plasmaTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.plasmaRGBThresholdController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaRGBThresholdController);
    }
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.plasmaTextureNameController = guiHandler.datGuiPSCreator.add(plasmaParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.plasmaRGBThresholdController = guiHandler.datGuiPSCreator.add(plasmaParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[0])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaTextureNameController);
  guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaRGBThresholdController);
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(guiHandler.plasmaHasTextureController);
  }
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addButtonsController();
  particleSystemCreatorGUIHandler.plasmaParameters = plasmaParameters;
  particleSystemCreatorGUIHandler.plasmaGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(0, 0, 0), acceleration: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.plasmaParameters){
      if (key == "color"){
        params["colorName"] = particleSystemCreatorGUIHandler.plasmaParameters[key];
      }else if (key == "rgbFilter"){
        var splitted = particleSystemCreatorGUIHandler.plasmaParameters["rgbFilter"].split(",");
        params["rgbFilter"] = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
      }else{
        params[key] = particleSystemCreatorGUIHandler.plasmaParameters[key];
      }
    }
    if (!particleSystemCreatorGUIHandler.plasmaParameters.hasTexture || particleSystemCreatorGUIHandler.plasmaParameters.textureName == ""){
      delete params.textureName;
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generatePlasma(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "PLASMA", params);
  };
  particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
}

ParticleSystemCreatorGUIHandler.prototype.showTrail = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("TRAIL");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showSmoke = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("SMOKE");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.showCustom = function(){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CUSTOM");
  particleSystemCreatorGUIHandler.addButtonsController();
}

ParticleSystemCreatorGUIHandler.prototype.show = function(psName){
  this.hiddenEngineObjects = [];
  this.usableTextureNames = [];
  for (var textureName in textures){
    var txt = textures[textureName];
    if (txt instanceof THREE.Texture && !(txt instanceof THREE.CompressedTexture)){
      this.usableTextureNames.push(textureName);
    }
  }
  for (var i = 0; i<scene.children.length; i++){
    if (scene.children[i].visible){
      scene.children[i].visible = false;
      this.hiddenEngineObjects.push(scene.children[i]);
    }
  }
  this.psName = psName;
  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();
  activeControl = new OrbitControls({});
  activeControl.onActivated();
  this.showCustom();
}
