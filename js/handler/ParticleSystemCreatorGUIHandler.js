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
  this.collidableParam = {"Collidable": false};
  this.maxPSTimeParam = {"Max time": DEFAULT_MAX_PS_TIME};
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
      if (particleSystemCreatorGUIHandler.isEdit){
        terminal.printInfo(Text.PARTICLE_SYSTEM_EDITED);
      }else{
        terminal.printInfo(Text.PARTICLE_SYSTEM_CREATED);
      }
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
      for (var poolName in preConfiguredParticleSystemPools){
        if (preConfiguredParticleSystemPools[poolName].refParticleSystemName == preConfiguredParticleSystem.name){
          preConfiguredParticleSystem.preConfiguredParticleSystemPoolName = poolName;
        }
      }
    }
  };
}

ParticleSystemCreatorGUIHandler.prototype.onAfterShown = function(){
  if (particleSystemCreatorGUIHandler.preConfiguredParticleSystem){
    if (particleSystemCreatorGUIHandler.preConfiguredParticleSystem.isCollidable){
      particleSystemCreatorGUIHandler.collidableParam["Collidable"] = true;
    }else{
      particleSystemCreatorGUIHandler.collidableParam["Collidable"] = false;
    }
    if (particleSystemCreatorGUIHandler.preConfiguredParticleSystem.maxPSTime){
      particleSystemCreatorGUIHandler.maxPSTimeParam["Max time"] = particleSystemCreatorGUIHandler.preConfiguredParticleSystem.maxPSTime;
    }else{
      particleSystemCreatorGUIHandler.maxPSTimeParam["Max time"] = DEFAULT_MAX_PS_TIME;
    }
  }else{
    particleSystemCreatorGUIHandler.collidableParam["Collidable"] = false;
    particleSystemCreatorGUIHandler.maxPSTimeParam["Max time"] = DEFAULT_MAX_PS_TIME;
  }
}

ParticleSystemCreatorGUIHandler.prototype.update = function(){
  if (!this.particleSystem){
    return;
  }
  this.particleSystem.update();
}

ParticleSystemCreatorGUIHandler.prototype.addCommonControllers = function(){
  this.maxPSTimeController = guiHandler.datGuiPSCreator.add(this.maxPSTimeParam, "Max time").min(0.001).max(DEFAULT_MAX_PS_TIME).step(0.01).onChange(function(val){
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem.setMaxPSTime(val);
  }).listen();
  this.collidableController = guiHandler.datGuiPSCreator.add(this.collidableParam, "Collidable").onChange(function(val){
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem.setCollidableStatus(val);
  }).listen();
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
    activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
    activeControl.onActivated();
    particleSystemCreatorGUIHandler.actionsByTypes[val]();
  }).listen();
}

ParticleSystemCreatorGUIHandler.prototype.showConfetti = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CONFETTI");
  var confettiParameters = {
    expireTime: 0, lifetime: 0, verticalSpeed: 100, horizontalSpeed: 50, verticalAcceleration: -80,
    particleCount: 100, particleSize: 5, colorName: "#ffffff", alpha: 1, hasParticleCollision: false,
    hasTargetColor: false, hasAlphaVariation: false, hasTexture: false, collisionMethod: "none",
    collisionTimeOffset: 0, startDelay: 3, targetColorName: "#ffffff", colorStep: 0, alphaVariation: 0, textureName: "",
    rgbFilter: "r,g,b"
  };
  if (prevParams){
    for (var key in prevParams){
      confettiParameters[key] = prevParams[key];
      if (key == "collisionMethod"){
        confettiParameters[key] = "none";
        switch(prevParams[key]){
          case PARTICLE_REWIND_ON_COLLIDED:
            confettiParameters[key] = "rewind";
          break;
          case PARTICLE_DISSAPEAR_ON_COLLIDED:
            confettiParameters[key] = "dissapear";
          break;
        }
      }else if (key == "rgbFilter"){
        confettiParameters[key] = prevParams[key].x+","+prevParams[key].y+","+prevParams[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(confettiParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "lifetime").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "verticalSpeed").min(0.1).max(5000).step(0.5).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "horizontalSpeed").min(0.1).max(5000).step(0.5).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "verticalAcceleration").min(-5000).max(-0.1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(confettiParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "hasParticleCollision").onChange(function(val){
    if(val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiCollisionMethodController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiCollisionTimeOffsetController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiCollisionMethodController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiCollisionTimeOffsetController);
    }
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiCollisionMethodController = guiHandler.datGuiPSCreator.add(confettiParameters, "collisionMethod", ["none", "rewind", "dissapear"]).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiCollisionTimeOffsetController = guiHandler.datGuiPSCreator.add(confettiParameters, "collisionTimeOffset").min(0).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "startDelay").min(0).max(10).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiTargetColorController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiColorStepController);
    }
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiTargetColorController = guiHandler.datGuiPSCreator.addColor(confettiParameters, "targetColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiColorStepController = guiHandler.datGuiPSCreator.add(confettiParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(confettiParameters, "hasAlphaVariation").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiAlphaVariationController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiAlphaVariationController);
    }
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiAlphaVariationController = guiHandler.datGuiPSCreator.add(confettiParameters, "alphaVariation").min(-10).max(0).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiHasTextureController = guiHandler.datGuiPSCreator.add(confettiParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.confettiParameters.hasTexture = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.confettiRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.confettiRGBFilterController);
    }
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiTextureNameController = guiHandler.datGuiPSCreator.add(confettiParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.confettiRGBFilterController = guiHandler.datGuiPSCreator.add(confettiParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.confettiParameters){
      params[key] = particleSystemCreatorGUIHandler.confettiParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.confettiParameters.hasTexture || particleSystemCreatorGUIHandler.confettiParameters.textureName == ""){
      delete params.textureName;
      delete params.rgbFilter;
    }else{
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!particleSystemCreatorGUIHandler.confettiParameters.hasParticleCollision || particleSystemCreatorGUIHandler.confettiParameters.collisionMethod == "none"){
      delete params.collisionMethod;
    }else if (particleSystemCreatorGUIHandler.confettiParameters.hasParticleCollision){
      if (particleSystemCreatorGUIHandler.confettiParameters.collisionMethod == "rewind"){
        params.collisionMethod = PARTICLE_REWIND_ON_COLLIDED;
      }else if (particleSystemCreatorGUIHandler.confettiParameters.collisionMethod == "dissapear"){
        params.collisionMethod = PARTICLE_DISSAPEAR_ON_COLLIDED;
      }
    }
    if (!particleSystemCreatorGUIHandler.confettiParameters.hasAlphaVariation){
      delete params.alphaVariation;
    }
    if (!particleSystemCreatorGUIHandler.confettiParameters.hasTargetColor){
      delete params.targetColorName;
      delete params.colorStep;
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateConfettiExplosion(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "CONFETTI", params);
  }
  if (!confettiParameters.hasParticleCollision){
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiCollisionMethodController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiCollisionTimeOffsetController);
  }
  if (!confettiParameters.hasAlphaVariation){
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiAlphaVariationController);
  }
  if (!confettiParameters.hasTargetColor){
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiTargetColorController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiColorStepController);
  }
  if (!confettiParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiRGBFilterController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.confettiHasTextureController);
  }
  particleSystemCreatorGUIHandler.confettiParameters = confettiParameters;
  particleSystemCreatorGUIHandler.confettiExplosionGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showSnow = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("SNOW");
  var snowParameters = {
    particleCount: 100, sizeX: 50, sizeZ: 50, particleSize: 5, particleExpireTime: 10,
    speed: 200, acceleration: 10, avgStartDelay: 3, colorName: "#ffffff", alpha: 1,
    hasTexture: false, textureName: "", rgbFilter: "r,g,b", rewindOnCollided: false,
    collisionTimeOffset: 0, randomness: 5, alphaVariation: 0, hasTargetColor: false,
    targetColorName: "#ffffff", colorStep: 0
  };
  if (prevParams){
    for (var key in prevParams){
      snowParameters[key] = prevParams[key];
      if (key == "rgbFilter"){
        snowParameters[key] = snowParameters[key].x+","+snowParameters[key].y+","+snowParameters[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(snowParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "sizeX").min(1).max(5000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "sizeZ").min(1).max(5000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "particleExpireTime").min(0).max(200).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "speed").min(0.1).max(5000).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "acceleration").min(0).max(5000).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "avgStartDelay").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(snowParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.snowHasTextureController = guiHandler.datGuiPSCreator.add(snowParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.snowParameters.hasTexture = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.snowTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.snowRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.snowTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.snowRGBFilterController);
    }
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.snowTextureNameController = guiHandler.datGuiPSCreator.add(snowParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.snowRGBFilterController = guiHandler.datGuiPSCreator.add(snowParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "rewindOnCollided").onChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "collisionTimeOffset").min(0).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "randomness").min(0).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "alphaVariation").min(-1).max(0).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(snowParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.snowTargetColorController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.snowColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.snowTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.snowColorStepController);
    }
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.snowTargetColorController = guiHandler.datGuiPSCreator.addColor(snowParameters, "targetColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.snowColorStepController = guiHandler.datGuiPSCreator.add(snowParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.snowGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.addCommonControllers();
  if (!snowParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.snowTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.snowRGBFilterController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.snowHasTextureController);
  }
  if (!snowParameters.hasTargetColor){
    guiHandler.disableController(particleSystemCreatorGUIHandler.snowTargetColorController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.snowColorStepController);
  }
  particleSystemCreatorGUIHandler.snowGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.snowParameters){
      params[key] = particleSystemCreatorGUIHandler.snowParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.snowParameters.hasTexture){
      delete params.textureName;
      delete params.rgbFilter;
    }else{
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!particleSystemCreatorGUIHandler.snowParameters.hasTargetColor){
      delete params.targetColorName;
      delete params.colorStep;
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateSnow(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "SNOW", params);
  }
  particleSystemCreatorGUIHandler.snowParameters = snowParameters;
  particleSystemCreatorGUIHandler.snowGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showWaterfall = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("WATERFALL");
  var waterfallParameters = {
    particleCount: 100, size: 50, particleSize: 5, particleExpireTime: 10, speed: 200,
    acceleration: 10, avgStartDelay: 1, colorName: "#ffffff", alpha: 1, hasTexture: false,
    textureName: "", rewindOnCollided: false, randomness: 5, alphaVariation: 0, hasTargetColor: false,
    targetColorName: "#ffffff", colorStep: 0, rgbFilter: "r,g,b", collisionTimeOffset: 0
  };
  if (prevParams){
    for (var key in prevParams){
      waterfallParameters[key] = prevParams[key];
      if (key == "rgbFilter"){
        waterfallParameters[key] = waterfallParameters[key].x+","+waterfallParameters[key].y+","+waterfallParameters[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(waterfallParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "size").min(1).max(5000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "particleExpireTime").min(0).max(200).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "speed").min(0.1).max(5000).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "acceleration").min(0).max(5000).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "avgStartDelay").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(waterfallParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.waterfallHasTextureController = guiHandler.datGuiPSCreator.add(waterfallParameters, "hasTexture").onFinishChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.waterfallParameters.hasTexture = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.waterfallTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.waterfallRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallRGBFilterController);
    }
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.waterfallTextureNameController = guiHandler.datGuiPSCreator.add(waterfallParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.waterfallRGBFilterController = guiHandler.datGuiPSCreator.add(waterfallParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "rewindOnCollided").onChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "collisionTimeOffset").min(0).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "randomness").min(0).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "alphaVariation").min(-1).max(0).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(waterfallParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.waterfallTargetColorController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.waterfallColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallColorStepController);
    }
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.waterfallTargetColorController = guiHandler.datGuiPSCreator.addColor(waterfallParameters, "targetColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.waterfallColorStepController = guiHandler.datGuiPSCreator.add(waterfallParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
  if (!waterfallParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallRGBFilterController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallHasTextureController);
  }
  if (!waterfallParameters.hasTargetColor){
    guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallTargetColorController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.waterfallColorStepController);
  }
  particleSystemCreatorGUIHandler.waterfallGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.waterfallParameters){
      params[key] = particleSystemCreatorGUIHandler.waterfallParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.waterfallParameters.hasTexture){
      delete params.textureName;
      delete params.rgbFilter;
    }else{
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!particleSystemCreatorGUIHandler.waterfallParameters.hasTargetColor){
      delete params.targetColorName;
      delete params.colorStep;
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateWaterfall(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "WATERFALL", params);
  }
  particleSystemCreatorGUIHandler.waterfallParameters = waterfallParameters;
  particleSystemCreatorGUIHandler.waterfallGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showLaser = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("LASER");
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showDynamicTrail = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("DYNAMIC_TRAIL");
  var dynamicTrailParameters = {expireTime: 0, particleCount: 100, size: 20, particleSize: 5, startDelay: 3, lifetime: 2, velocity: "0,100,0", acceleration: "0,0,0", randomness: 10, alphaVariation: 0, colorName: "#ffffff", hasTargetColor: false, targetColorName: "#ffffff", colorStep: 0, hasTexture: false, textureName: "", rgbFilter: "r,g,b" };
  if (prevParams){
    for (var key in prevParams){
      dynamicTrailParameters[key] = prevParams[key];
      if (key == "rgbFilter" || key == "velocity" || key == "acceleration"){
        dynamicTrailParameters[key] = dynamicTrailParameters[key].x+","+dynamicTrailParameters[key].y+","+dynamicTrailParameters[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "size").min(0.1).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "startDelay").min(0).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "lifetime").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "velocity").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "acceleration").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "randomness").min(0).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "alphaVariation").min(-1).max(0).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(dynamicTrailParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.dynamicTrailTargetColorController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.dynamicTrailColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailColorStepController);
    }
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.dynamicTrailTargetColorController = guiHandler.datGuiPSCreator.addColor(dynamicTrailParameters, "targetColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.dynamicTrailColorStepController = guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.dynamicTrailHasTextureController = guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "hasTexture").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.dynamicTrailTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.dynamicTrailRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailRGBFilterController);
    }
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.dynamicTrailTextureNameController = guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.dynamicTrailRGBFilterController = guiHandler.datGuiPSCreator.add(dynamicTrailParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }).listen();
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailHasTextureController);
  }
  if (!dynamicTrailParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailRGBFilterController);
  }
  if (!dynamicTrailParameters.hasTargetColor){
    guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailTargetColorController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.dynamicTrailColorStepController);
  }
  particleSystemCreatorGUIHandler.dynamicTrailParameters = dynamicTrailParameters;
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.dynamicTrailParameters){
      params[key] = particleSystemCreatorGUIHandler.dynamicTrailParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.dynamicTrailParameters.hasTexture || particleSystemCreatorGUIHandler.dynamicTrailParameters.textureName == ""){
      delete params.textureName;
      delete params.rgbFilter;
    }else{
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!particleSystemCreatorGUIHandler.dynamicTrailParameters.hasTargetColor){
      delete params.targetColorName;
      delete params.colorStep;
    }
    var velocitySplitted = params.velocity.split(",");
    var accelerationSplitted = params.acceleration.split(",");
    params.velocity = new THREE.Vector3(parseFloat(velocitySplitted[0]), parseFloat(velocitySplitted[1]), parseFloat(velocitySplitted[2]));
    params.acceleration = new THREE.Vector3(parseFloat(accelerationSplitted[0]), parseFloat(accelerationSplitted[1]), parseFloat(accelerationSplitted[2]));
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateDynamicTrail(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "DYNAMIC_TRAIL", params);
  }
  particleSystemCreatorGUIHandler.dynamicTrailGeneratorFunc();
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showCircularExplosion = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CIRC_EXPLOSION");
  var circularExplosionParameters = {particleCount: 100, radius: 10, colorName: "#ffffff", hasTargetColor: false, targetColorName: "#ffffff", colorStep: 0, particleSize: 5, alpha: 1, hasTexture: false, textureName: "", rgbFilter: "r,g,b", alphaVariation: 0, speed: 100, expireTime: 0};
  if (prevParams){
    for (var key in prevParams){
      circularExplosionParameters[key] = prevParams[key];
      if (key == "rgbFilter"){
        circularExplosionParameters[key] = circularExplosionParameters[key].x+","+circularExplosionParameters[key].y+","+circularExplosionParameters[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "radius").min(0.1).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(circularExplosionParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.circularExplosionTargetColorNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.circularExplosionColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionTargetColorNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionColorStepController);
    }
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.circularExplosionTargetColorNameController = guiHandler.datGuiPSCreator.addColor(circularExplosionParameters, "targetColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.circularExplosionColorStepController = guiHandler.datGuiPSCreator.add(circularExplosionParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.circularExplosionHasTextureController = guiHandler.datGuiPSCreator.add(circularExplosionParameters, "hasTexture").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.circularExplosionTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.circularExplosionRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionRGBFilterController);
    }
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.circularExplosionTextureNameController = guiHandler.datGuiPSCreator.add(circularExplosionParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.circularExplosionRGBFilterController = guiHandler.datGuiPSCreator.add(circularExplosionParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "alphaVariation").min(-1).max(0).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "speed").min(0.1).max(5000).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(circularExplosionParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.circularExplosionParameters = circularExplosionParameters;
  if (!circularExplosionParameters.hasTargetColor){
    guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionTargetColorNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionColorStepController);
  }
  if (!circularExplosionParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionRGBFilterController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.circularExplosionHasTextureController);
  }
  particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.circularExplosionParameters){
      params[key] = particleSystemCreatorGUIHandler.circularExplosionParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.circularExplosionParameters.hasTexture || particleSystemCreatorGUIHandler.circularExplosionParameters.textureName == ""){
      delete params.textureName;
      delete params.rgbFilter;
    }else{
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!particleSystemCreatorGUIHandler.circularExplosionParameters.hasTargetColor){
      delete params.targetColorName;
      delete params.colorStep;
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateCircularExplosion(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "CIRC_EXPLOSION", params);
  }
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.circularExplosionParameters = circularExplosionParameters;
  particleSystemCreatorGUIHandler.circularExplosionGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showMagicCircle = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("MAGIC_CIRCLE");
  var magicCircleParameters = {
    particleCount: 100, expireTime: 0, speed: 10, acceleration: 0, radius: 10,
    circleDistortionCoefficient: 0, lifetime: 0, angleStep: 0, particleSize: 5,
    colorName: "#ffffff", hasTargetColor: false, alpha: 1, hasAlphaVariation: false,
    hasTexture: false, targetColorName: "#ffffff", colorStep: 0.5, alphaVariation: 0.5,
    alphaVariationMode: "NORMAL", textureName: "", rgbThreshold: "r,g,b"
  };
  if (prevParams){
    for (var key in prevParams){
      magicCircleParameters[key] = prevParams[key];
      if (key == "rgbFilter"){
        magicCircleParameters[key] = magicCircleParameters[key].x+","+magicCircleParameters[key].y+","+magicCircleParameters[key].z;
      }else if (key == "alphaVariationMode"){
        switch(magicCircleParameters[key]){
          case ALPHA_VARIATION_MODE_NORMAL:
            magicCircleParameters[key] = "NORMAL";
          break;
          case ALPHA_VARIATION_MODE_SIN:
            magicCircleParameters[key] = "SIN";
          break;
          case ALPHA_VARIATION_MODE_COS:
            magicCircleParameters[key] = "COS";
          break;
        }
      }
    }
  }
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
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "circleDistortionCoefficient").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "lifetime").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "angleStep").min(0).max(100).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(magicCircleParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "alpha").min(0).max(1).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.magicCircleTargetColorController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.magicCircleColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleColorStepController);
    }
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleTargetColorController = guiHandler.datGuiPSCreator.addColor(magicCircleParameters, "targetColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleColorStepController = guiHandler.datGuiPSCreator.add(magicCircleParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(magicCircleParameters, "hasAlphaVariation").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.magicCircleAlphaVariationController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.magicCircleAlphaVariationModeController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleAlphaVariationController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleAlphaVariationModeController);
    }
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleAlphaVariationController = guiHandler.datGuiPSCreator.add(magicCircleParameters, "alphaVariation").min(-10).max(10).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleAlphaVariationModeController = guiHandler.datGuiPSCreator.add(magicCircleParameters, "alphaVariationMode", ["NORMAL", "SIN", "COS"]).onChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleHasTextureController = guiHandler.datGuiPSCreator.add(magicCircleParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.magicCircleParameters.hasTexture = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.magicCircleTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.magicCircleRGBThresholdController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleRGBThresholdController);
    }
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleTextureNameController = guiHandler.datGuiPSCreator.add(magicCircleParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.magicCircleRGBThresholdController = guiHandler.datGuiPSCreator.add(magicCircleParameters, "rgbThreshold").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
  if (!magicCircleParameters.hasTargetColor){
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleTargetColorController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleColorStepController);
  }
  if (!magicCircleParameters.hasAlphaVariation){
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleAlphaVariationController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleAlphaVariationModeController);
  }
  if (!magicCircleParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleRGBThresholdController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.magicCircleHasTextureController);
  }
  particleSystemCreatorGUIHandler.magicCircleGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.magicCircleParameters){
      params[key] = particleSystemCreatorGUIHandler.magicCircleParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.magicCircleParameters.hasTexture || particleSystemCreatorGUIHandler.magicCircleParameters.textureName == ""){
      delete params.textureName;
      delete params.rgbThreshold;
    }else{
      var splitted = params.rgbThreshold.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!particleSystemCreatorGUIHandler.magicCircleParameters.hasTargetColor){
      delete params.targetColorName;
      delete params.colorStep;
    }
    if (!particleSystemCreatorGUIHandler.magicCircleParameters.hasAlphaVariation){
      delete params.alphaVariation;
      delete params.alphaVariationMode;
    }else{
      switch (params.alphaVariationMode){
        case "NORMAL":
          params.alphaVariationMode = ALPHA_VARIATION_MODE_NORMAL;
        break;
        case "SIN":
          params.alphaVariationMode = ALPHA_VARIATION_MODE_SIN;
        break;
        case "COS":
          params.alphaVariationMode = ALPHA_VARIATION_MODE_COS;
        break;
      }
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateMagicCircle(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "MAGIC_CIRCLE", params);
  }
  particleSystemCreatorGUIHandler.magicCircleParameters = magicCircleParameters;
  particleSystemCreatorGUIHandler.magicCircleGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showFireExplosion = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("FIRE_EXPLOSION");
  var fireExplosionParameters = {expireTime: 0, radius: 10, particleSize: 5, particleCount: 100, fireColorName: "#ffffff", smokeColorName: "#000000", colorStep: 0.5, alphaVariationCoef: 0.5, explosionSpeed: 20, lifetime: 3, accelerationDirection: "0,1,0", hasTexture: false, textureName: "", rgbFilter: "r,g,b"};
  if (prevParams){
    for (var key in prevParams){
      fireExplosionParameters[key] = prevParams[key];
      if (key == "rgbFilter" || key == "accelerationDirection"){
        fireExplosionParameters[key] = fireExplosionParameters[key].x+","+fireExplosionParameters[key].y+","+fireExplosionParameters[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "radius").min(0.1).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(fireExplosionParameters, "fireColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(fireExplosionParameters, "smokeColorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "colorStep").min(0).max(1).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "alphaVariationCoef").min(-1000).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "explosionSpeed").min(0.1).max(1000).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "lifetime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(fireExplosionParameters, "accelerationDirection").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.fireExplosionHasTextureController = guiHandler.datGuiPSCreator.add(fireExplosionParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.plasmaParameters["hasTexture"] = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.fireExplosionTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.fireExplosionRGBThresholdController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.fireExplosionTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.fireExplosionRGBThresholdController);
    }
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.fireExplosionTextureNameController = guiHandler.datGuiPSCreator.add(fireExplosionParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.fireExplosionRGBThresholdController = guiHandler.datGuiPSCreator.add(fireExplosionParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }).listen();
  if (!fireExplosionParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.fireExplosionTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.fireExplosionRGBThresholdController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.fireExplosionHasTextureController);
  }
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.fireExplosionParameters = fireExplosionParameters;
  particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.fireExplosionParameters){
      if (key == "rgbFilter" || key == "accelerationDirection"){
        var splitted = particleSystemCreatorGUIHandler.fireExplosionParameters[key].split(",");
        params[key] = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
      }else{
        params[key] = particleSystemCreatorGUIHandler.fireExplosionParameters[key];
      }
    }
    if (!particleSystemCreatorGUIHandler.fireExplosionParameters.hasTexture || particleSystemCreatorGUIHandler.fireExplosionParameters.textureName == ""){
      delete params.textureName;
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateFireExplosion(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "FIRE_EXPLOSION", params);
  };
  particleSystemCreatorGUIHandler.fireExplosionGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showPlasma = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("PLASMA");
  var plasmaParameters = {expireTime: 0, radius: 10, avgParticleSpeed: 20, particleCount: 100, particleSize: 1, alpha: 1, color: "#ffffff", alphaVariation: 0, hasTexture: false, textureName: "", rgbFilter: "r,g,b"};
  if (prevParams){
    for (var key in prevParams){
      plasmaParameters[key] = prevParams[key];
      if (key == "rgbFilter"){
        plasmaParameters[key] = plasmaParameters[key].x+","+plasmaParameters[key].y+","+plasmaParameters[key].z;
      }
    }
  }
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
  guiHandler.datGuiPSCreator.add(plasmaParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
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
  particleSystemCreatorGUIHandler.plasmaHasTextureController = guiHandler.datGuiPSCreator.add(plasmaParameters, "hasTexture").onChange(function(val){
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
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }).listen();
  if (!plasmaParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaRGBThresholdController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.plasmaHasTextureController);
  }
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.plasmaGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
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
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showTrail = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("TRAIL");
  var trailParameters = {expireTime: 0, particleCount: 100, velocity: "0,100,0", acceleration: "0,0,0", lifetime: 3, alphaVariation: -0.5, startDelay: 2, colorName: "#ffffff", particleSize: 5, size: 10, hasTexture: false, textureName: "", rgbFilter: "r,g,b", hasTargetColor: false, targetColor: "#ffffff", colorStep: 0};
  if (prevParams){
    for (var key in prevParams){
      trailParameters[key] = prevParams[key];
      if (key == "rgbFilter" || key == "velocity" || key == "acceleration"){
        trailParameters[key] = trailParameters[key].x+","+trailParameters[key].y+","+trailParameters[key].z;
      }
    }
  }
  guiHandler.datGuiPSCreator.add(trailParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "velocity").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "acceleration").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "lifetime").min(0).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "alphaVariation").min(-1).max(0).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "startDelay").min(0).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(trailParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "size").min(0.1).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.trailHasTextureController = guiHandler.datGuiPSCreator.add(trailParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.trailParameters["hasTexture"] = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.trailTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.trailRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailRGBFilterController);
    }
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.trailTextureNameController = guiHandler.datGuiPSCreator.add(trailParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.trailRGBFilterController = guiHandler.datGuiPSCreator.add(trailParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(trailParameters, "hasTargetColor").onChange(function(val){
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.trailTargetColorController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.trailColorStepController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailColorStepController);
    }
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.trailTargetColorController = guiHandler.datGuiPSCreator.addColor(trailParameters, "targetColor").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.trailColorStepController = guiHandler.datGuiPSCreator.add(trailParameters, "colorStep").min(0).max(1).step(0.001).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.trailParameters = trailParameters;
  particleSystemCreatorGUIHandler.trailGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.trailParameters){
      params[key] = particleSystemCreatorGUIHandler.trailParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.trailParameters.hasTexture || particleSystemCreatorGUIHandler.trailParameters.textureName == ""){
      delete params.textureName;
    }
    if (!particleSystemCreatorGUIHandler.trailParameters.hasTargetColor){
      delete params.targetColor;
      delete params.colorStep;
    }
    if (params.rgbFilter){
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (params.velocity){
      var splitted = params.velocity.split(",");
      params.velocity = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (params.acceleration){
      var splitted = params.acceleration.split(",");
      params.acceleration = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    if (!trailParameters.hasTexture){
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailRGBFilterController);
    }
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailHasTextureController);
    }
    if (!trailParameters.hasTargetColor){
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailTargetColorController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.trailColorStepController);
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateTrail(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "TRAIL", params);
  }
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.trailGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.trailGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showSmoke = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  var smokeParameters = {expireTime: 0, smokeSize: 10, particleSize: 5, particleCount: 100, colorName: "#ffffff", velocity: 10, acceleration: 0, randomness: 5, lifetime: 3, alphaVariation: -0.5, startDelay: 1.5, hasTexture: false, textureName: "", rgbFilter: "r,g,b"};
  if (prevParams){
    for (var key in prevParams){
      smokeParameters[key] = prevParams[key];
      if (key == "rgbFilter"){
        smokeParameters[key] = smokeParameters[key].x+","+smokeParameters[key].y+","+smokeParameters[key].z;
      }
    }
  }
  particleSystemCreatorGUIHandler.addTypeController("SMOKE");
  guiHandler.datGuiPSCreator.add(smokeParameters, "expireTime").min(0).max(50).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "smokeSize").min(1).max(200).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "particleSize").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "particleCount").min(1).max(5000).step(1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.addColor(smokeParameters, "colorName").onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "velocity").min(0.1).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "acceleration").min(0).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "randomness").min(0).max(500).step(0.1).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "lifetime").min(0.1).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "alphaVariation").min(-1).max(0).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  guiHandler.datGuiPSCreator.add(smokeParameters, "startDelay").min(0).max(20).step(0.01).onFinishChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.smokeHasTextureController = guiHandler.datGuiPSCreator.add(smokeParameters, "hasTexture").onChange(function(val){
    if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
      particleSystemCreatorGUIHandler.smokeParameters.hasTexture = false;
      return;
    }
    if (val){
      guiHandler.enableController(particleSystemCreatorGUIHandler.smokeTextureNameController);
      guiHandler.enableController(particleSystemCreatorGUIHandler.smokeRGBFilterController);
    }else{
      guiHandler.disableController(particleSystemCreatorGUIHandler.smokeTextureNameController);
      guiHandler.disableController(particleSystemCreatorGUIHandler.smokeRGBFilterController);
    }
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.smokeTextureNameController = guiHandler.datGuiPSCreator.add(smokeParameters, "textureName", particleSystemCreatorGUIHandler.usableTextureNames).onChange(function(val){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  particleSystemCreatorGUIHandler.smokeRGBFilterController = guiHandler.datGuiPSCreator.add(smokeParameters, "rgbFilter").onFinishChange(function(val){
    var splitted = val.split(",");
    if (splitted.length == 3){
      for (var i = 0; i<3; i++){
        if (isNaN(splitted[i])){
          return;
        }
      }
    }
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }).listen();
  if (!smokeParameters.hasTexture){
    guiHandler.disableController(particleSystemCreatorGUIHandler.smokeTextureNameController);
    guiHandler.disableController(particleSystemCreatorGUIHandler.smokeRGBFilterController);
  }
  if (particleSystemCreatorGUIHandler.usableTextureNames.length == 0){
    guiHandler.disableController(particleSystemCreatorGUIHandler.smokeHasTextureController);
  }
  particleSystemCreatorGUIHandler.smokeParameters = smokeParameters;
  particleSystemCreatorGUIHandler.smokeGeneratorFunc = function(){
    if (particleSystemCreatorGUIHandler.particleSystem){
      scene.remove(particleSystemCreatorGUIHandler.particleSystem.mesh);
      particleSystemCreatorGUIHandler.particleSystem = 0;
    }
    var params = {name: particleSystemCreatorGUIHandler.psName, position: new THREE.Vector3(0, 0, 0)};
    for (var key in particleSystemCreatorGUIHandler.smokeParameters){
      params[key] = particleSystemCreatorGUIHandler.smokeParameters[key];
    }
    if (!particleSystemCreatorGUIHandler.smokeParameters.hasTexture || particleSystemCreatorGUIHandler.smokeParameters.textureName == ""){
      delete params.textureName;
    }
    if (params.rgbFilter){
      var splitted = params.rgbFilter.split(",");
      params.rgbFilter = new THREE.Vector3(parseFloat(splitted[0]), parseFloat(splitted[1]), parseFloat(splitted[2]));
    }
    particleSystemCreatorGUIHandler.particleSystem = particleSystemGenerator.generateSmoke(params);
    particleSystemCreatorGUIHandler.particleSystem.mesh.visible = true;
    scene.add(particleSystemCreatorGUIHandler.particleSystem.mesh);
    particleSystemCreatorGUIHandler.preConfiguredParticleSystem = new PreconfiguredParticleSystem(particleSystemCreatorGUIHandler.psName, "SMOKE", params);
  }
  guiHandler.datGuiPSCreator.add({"Restart": function(){
    particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  }}, "Restart");
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.smokeGeneratorFunc();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.showCustom = function(prevParams){
  guiHandler.datGuiPSCreator = new dat.GUI({hideable: false});
  particleSystemCreatorGUIHandler.addTypeController("CUSTOM");
  particleSystemCreatorGUIHandler.addCommonControllers();
  particleSystemCreatorGUIHandler.onAfterShown();
}

ParticleSystemCreatorGUIHandler.prototype.commonStartFunctions = function(psName){
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
  activeControl = new OrbitControls({maxRadius: 500, zoomDelta: 5});
  activeControl.onActivated();
}

ParticleSystemCreatorGUIHandler.prototype.edit = function(psName){
  var preConfiguredParticleSystem = preConfiguredParticleSystems[psName];
  this.commonStartFunctions(psName);
  var action = this.actionsByTypes[preConfiguredParticleSystem.type];
  action(preConfiguredParticleSystem.params);
  particleSystemCreatorGUIHandler.preConfiguredParticleSystem.setCollidableStatus(preConfiguredParticleSystem.isCollidable);
  particleSystemCreatorGUIHandler.onAfterShown();
  this.isEdit = true;
}

ParticleSystemCreatorGUIHandler.prototype.show = function(psName){
  this.commonStartFunctions(psName);
  this.showCustom();
  this.isEdit = false;
}
