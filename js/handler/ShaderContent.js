var ShaderContent = function(){
  this.shaders = [
    {name: "particleVertexShader", isVertexShader: true, dir: "particle"},
    {name: "particleFragmentShader", isVertexShader: false, dir: "particle"},
    {name: "objectTrailVertexShader", isVertexShader: true, dir: "object_trail"},
    {name: "objectTrailFragmentShader", isVertexShader: false, dir: "object_trail"},
    {name: "crossHairVertexShader", isVertexShader: true, dir: "crosshair"},
    {name: "crossHairFragmentShader", isVertexShader: false, dir: "crosshair"},
    {name: "basicMaterialVertexShader", isVertexShader: true, dir: "materials/basic_material"},
    {name: "basicMaterialFragmentShader", isVertexShader: false, dir: "materials/basic_material"},
    {name: "mergedBasicMaterialVertexShader", isVertexShader: true, dir: "materials/merged_basic_material"},
    {name: "mergedBasicMaterialFragmentShader", isVertexShader: false, dir: "materials/merged_basic_material"},
    {name: "instancedBasicMaterialVertexShader", isVertexShader: true, dir: "materials/instanced_basic_material"},
    {name: "instancedBasicMaterialFragmentShader", isVertexShader: false, dir: "materials/instanced_basic_material"},
    {name: "skyboxVertexShader", isVertexShader: true, dir: "skybox"},
    {name: "skyboxFragmentShader", isVertexShader: false, dir: "skybox"},
    {name: "textVertexShader", isVertexShader: true, dir: "text"},
    {name: "textFragmentShader", isVertexShader: false, dir: "text"},
    {name: "rectangleVertexShader", isVertexShader: true, dir: "rectangle"},
    {name: "rectangleFragmentShader", isVertexShader: false, dir: "rectangle"},
    {name: "bloomBrightPassVertexShader", isVertexShader: true, dir: "post_processing/bloom/bright_pass"},
    {name: "bloomBrightPassFragmentShader", isVertexShader: false, dir: "post_processing/bloom/bright_pass"},
    {name: "bloomBlurPassVertexShader", isVertexShader: true, dir: "post_processing/bloom/blur_pass"},
    {name: "bloomBlurPassFragmentShader", isVertexShader: false, dir: "post_processing/bloom/blur_pass"},
    {name: "bloomCombinerVertexShader", isVertexShader: true, dir: "post_processing/bloom/combiner"},
    {name: "bloomCombinerFragmentShader", isVertexShader: false, dir: "post_processing/bloom/combiner"},
    {name: "lightningVertexShader", isVertexShader: true, dir: "lightning"},
    {name: "lightningFragmentShader", isVertexShader: false, dir: "lightning"},
    {name: "spriteVertexShader", isVertexShader: true, dir: "sprite"},
    {name: "spriteFragmentShader", isVertexShader: false, dir: "sprite"},
    {name: "basicModelMaterialVertexShader", isVertexShader: true, dir: "materials/basic_model_material"},
    {name: "basicModelMaterialFragmentShader", isVertexShader: false, dir: "materials/basic_model_material"},
    {name: "pbrModelMaterialVertexShader", isVertexShader: true, dir: "materials/pbr_model_material"},
    {name: "pbrModelMaterialFragmentShader", isVertexShader: false, dir: "materials/pbr_model_material"}
  ];
  this.currentLoadCount = 0;
  this.allShadersReadyCallback = function(){
    renderer.initEffects();
    if (!isDeployment){
      canvas.style.visibility = "";
      terminal.enable();
      terminal.clear();
      terminal.print("Type help for list of commands.");
    }else{
      appendtoDeploymentConsole("Shaders loaded.");
      appendtoDeploymentConsole("");
      startDeployment();
    }
  }

  var totalLen = this.shaders.length;

  this.aShaderLoadedCallback = function(){
    this.currentLoadCount ++;
    if (this.currentLoadCount == totalLen){
      this.allShadersReadyCallback();
    }
  }

  if (isDeployment){
    if (DISABLE_PARTICLE_SHADERS){
      this.shaders[0].disabled = true;
      this.shaders[1].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_OBJECT_TRAIL_SHADERS){
      this.shaders[2].disabled = true;
      this.shaders[3].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_CROSSHAIR_SHADERS){
      this.shaders[4].disabled = true;
      this.shaders[5].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_OBJECT_SHADERS){
      this.shaders[6].disabled = true;
      this.shaders[7].disabled = true;
      this.shaders[8].disabled = true;
      this.shaders[9].disabled = true;
      this.shaders[10].disabled = true;
      this.shaders[11].disabled = true;
      totalLen -= 6;
    }
    if (DISABLE_SKYBOX_SHADERS){
      this.shaders[12].disabled = true;
      this.shaders[13].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_TEXT_SHADERS){
      this.shaders[14].disabled = true;
      this.shaders[15].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_RECTANGLE_SHADERS){
      this.shaders[16].disabled = true;
      this.shaders[17].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_BLOOM_SHADERS){
      this.shaders[18].disabled = true;
      this.shaders[19].disabled = true;
      this.shaders[20].disabled = true;
      this.shaders[21].disabled = true;
      this.shaders[22].disabled = true;
      this.shaders[23].disabled = true;
      totalLen -= 6;
    }
    if (DISABLE_LIGHTNING_SHADERS){
      this.shaders[24].disabled = true;
      this.shaders[25].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_SPRITE_SHADERS){
      this.shaders[26].disabled = true;
      this.shaders[27].disabled = true;
      totalLen -= 2;
    }
    if (DISABLE_MODEL_SHADERS){
      this.shaders[28].disabled = true;
      this.shaders[29].disabled = true;
      this.shaders[30].disabled = true;
      this.shaders[31].disabled = true;
      totalLen -= 2;
    }
  }

  var count = isDeployment? this.loadRSF(): this.load(this.aShaderLoadedCallback);
  if (!count){
    renderer.initEffects();
    if (!isDeployment){
      canvas.style.visibility = "";
      terminal.enable();
      terminal.clear();
      terminal.print("Type help for list of commands.");
    }else{
      appendtoDeploymentConsole("Shaders loaded.");
      appendtoDeploymentConsole("");
      startDeployment();
    }
  }
}

ShaderContent.prototype.loadRSF = function(){
  var count = 0;
  for (var i = 0; i<this.shaders.length; i++){
    if (this.shaders[i].disabled){
      this[this.shaders[i].name] = "DISABLED";
      continue
    }
    count ++;
  }

  if (count == 0){
    return count;
  }

  var constructedShaders = {};

  var req = new XMLHttpRequest();
  req.open("GET", "./shader/shader.rsf");
  req.addEventListener("load", function(){
    var splitted = req.responseText.split("\n");
    var curFolderName = null;
    var curType = null;
    for (var i = 0; i < splitted.length; i ++){
      var curLine = splitted[i];
      if (curLine.startsWith("#RSF")){
        var lineSplitted = curLine.split(" ");
        curFolderName = lineSplitted[1];
        curType = lineSplitted[2];
        if (curType == "v"){
          constructedShaders[curFolderName] = {v: "", f: ""};
        }
      }else{
        constructedShaders[curFolderName][curType] += curLine + "\n";
      }
    }

    for (var i = 0; i < ShaderContent.shaders.length; i ++){
      var shader = ShaderContent.shaders[i];
      if (shader.disabled){
        continue;
      }
      if (shader.isVertexShader){
        ShaderContent[shader.name] = constructedShaders[shader.dir].v;
      }else{
        ShaderContent[shader.name] = constructedShaders[shader.dir].f;
      }
    }

    ShaderContent.allShadersReadyCallback();
  });
  req.send();

  return count;
}

ShaderContent.prototype.load = function(callback){
  var count = 0;
  for (var i = 0; i<this.shaders.length; i++){

    if (this.shaders[i].disabled){
      this[this.shaders[i].name] = "DISABLED";
      continue
    }

    count ++;

    var req = new XMLHttpRequest();
    var postfix = "vertexShader.shader";
    if (!this.shaders[i].isVertexShader){
      postfix = "fragmentShader.shader";
    }
    req.open("GET", "./shader/"+this.shaders[i].dir+"/"+postfix);
    req.addEventListener("load", function(){
      var shader = ShaderContent.shaders[this.index];
      ShaderContent[shader.name] = this.request.responseText;
      ShaderContent.aShaderLoadedCallback();
    }.bind({index: i, request: req}));
    req.send();
  }

  return count;
}

ShaderContent.prototype.getDisableInfo = function(){
  var obj = {
    DISABLE_PARTICLE_SHADERS: Object.keys(preConfiguredParticleSystems).length == 0,
    DISABLE_CROSSHAIR_SHADERS: Object.keys(crosshairs).length == 0,
    DISABLE_OBJECT_SHADERS: (Object.keys(addedObjects).length + Object.keys(objectGroups).length) == 0,
    DISABLE_SKYBOX_SHADERS: Object.keys(skyBoxes).length == 0,
    DISABLE_TEXT_SHADERS: (Object.keys(addedTexts).length + Object.keys(virtualKeyboards).length) == 0,
    DISABLE_RECTANGLE_SHADERS: (Object.keys(sprites).length + Object.keys(virtualKeyboards).length) == 0,
    DISABLE_LIGHTNING_SHADERS: Object.keys(lightnings).length == 0,
    DISABLE_SPRITE_SHADERS: (Object.keys(sprites).length + Object.keys(virtualKeyboards).length) == 0,
    DISABLE_MODEL_SHADERS: Object.keys(modelInstances).length == 0
  };

  var hasObjectTrail;
  for (var objName in addedObjects){
    if (addedObjects[objName].objectTrailConfigurations){
      hasObjectTrail = true;
    }
  }

  for (var objName in objectGroups){
    if (objectGroups[objName].objectTrailConfigurations){
      hasObjectTrail = true;
    }
  }

  var hasBloom = false;
  sceneHandler.scenes[sceneHandler.getActiveSceneName()].savePostProcessing();
  for (var sceneName in sceneHandler.scenes){
    var scene = sceneHandler.scenes[sceneName];
    if (scene.postProcessing && scene.postProcessing.bloom && scene.postProcessing.bloom.isOn){
      hasBloom = true;
      break;
    }
  }

  obj.DISABLE_BLOOM_SHADERS = !hasBloom;
  obj.DISABLE_OBJECT_TRAIL_SHADERS = !hasObjectTrail;

  return obj;
}
