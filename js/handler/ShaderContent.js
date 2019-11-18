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
    {name: "spriteFragmentShader", isVertexShader: false, dir: "sprite"}
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
  this.aShaderLoadedCallback = function(){
    this.currentLoadCount ++;
    if (this.currentLoadCount == this.shaders.length){
      this.allShadersReadyCallback();
    }
  }
  this.load();
}

ShaderContent.prototype.load = function(){
  for (var i = 0; i<this.shaders.length; i++){
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
}
