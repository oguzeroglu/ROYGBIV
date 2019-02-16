var ShaderContent = function(){

    this.particleVertexShader = 0;
    this.particleFragmentShader = 0;
    this.objectTrailVertexShader = 0;
    this.objectTrailFragmentShader = 0;
    this.crossHairVertexShader = 0;
    this.crossHairFragmentShader = 0;
    this.basicMaterialVertexShader = 0;
    this.basicMaterialFragmentShader = 0;
    this.mergedBasicMaterialVertexShader = 0;
    this.mergedBasicMaterialFragmentShader = 0;
    this.instancedBasicMaterialVertexShader = 0;
    this.instancedBasicMaterialFragmentShader = 0;
    this.skyboxVertexShader = 0;
    this.skyboxFragmentShader = 0;
    this.textVertexShader = 0;
    this.textFragmentShader = 0;
    this.rectangleVertexShader = 0;
    this.rectangleFragmentShader = 0;

    this.totalLoadCount = 18;
    this.currentLoadCount = 0;

    this.allShadersReadyCallback = function(){
      if (!isDeployment){
        canvas.style.visibility = "";
        terminal.enable();
        terminal.clear();
        terminal.print("Type help for list of commands.");
      }else{
        terminal.printInfo("Shaders loaded.");
        startDeployment();
      }
    }
    this.aShaderLoadedCallback = function(){
      this.currentLoadCount ++;
      if (this.currentLoadCount == this.totalLoadCount){
        this.allShadersReadyCallback();
      }
    }
    this.load();
}

ShaderContent.prototype.load = function(){
  var particleVertexShaderRequest = new XMLHttpRequest();
  var particleFragmentShaderRequest = new XMLHttpRequest();
  var objectTrailVertexShaderRequest = new XMLHttpRequest();
  var objectTrailFragmentShaderRequest = new XMLHttpRequest();
  var crossHairVertexShaderRequest = new XMLHttpRequest();
  var crossHairFragmentShaderRequest = new XMLHttpRequest();
  var basicMaterialVertexShaderRequest = new XMLHttpRequest();
  var basicMaterialFragmentShaderRequest = new XMLHttpRequest();
  var mergedBasicMaterialVertexShaderRequest = new XMLHttpRequest();
  var mergedBasicMaterialFragmentShaderRequest = new XMLHttpRequest();
  var instancedBasicMaterialVertexShaderRequest = new XMLHttpRequest();
  var instancedBasicMaterialFragmentShaderRequest = new XMLHttpRequest();
  var skyboxVertexShaderRequest = new XMLHttpRequest();
  var skyboxFragmentShaderRequest = new XMLHttpRequest();
  var textVertexShaderRequest = new XMLHttpRequest();
  var textFragmentShaderRequest = new XMLHttpRequest();
  var rectangleVertexShaderRequest = new XMLHttpRequest();
  var rectangleFragmentShaderRequest = new XMLHttpRequest();

  particleVertexShaderRequest.open('GET', "./shader/particle/vertexShader.shader");
  particleFragmentShaderRequest.open('GET', "./shader/particle/fragmentShader.shader");
  objectTrailVertexShaderRequest.open('GET', "./shader/object_trail/vertexShader.shader");
  objectTrailFragmentShaderRequest.open('GET', "./shader/object_trail/fragmentShader.shader");
  crossHairVertexShaderRequest.open('GET', "./shader/crosshair/vertexShader.shader");
  crossHairFragmentShaderRequest.open('GET', "./shader/crosshair/fragmentShader.shader");
  basicMaterialVertexShaderRequest.open('GET', "./shader/materials/basic_material/vertexShader.shader");
  basicMaterialFragmentShaderRequest.open('GET', "./shader/materials/basic_material/fragmentShader.shader");
  mergedBasicMaterialVertexShaderRequest.open('GET', "./shader/materials/merged_basic_material/vertexShader.shader");
  mergedBasicMaterialFragmentShaderRequest.open('GET', "./shader/materials/merged_basic_material/fragmentShader.shader");
  instancedBasicMaterialVertexShaderRequest.open('GET', "./shader/materials/instanced_basic_material/vertexShader.shader");
  instancedBasicMaterialFragmentShaderRequest.open('GET', "./shader/materials/instanced_basic_material/fragmentShader.shader");
  skyboxVertexShaderRequest.open('GET', "./shader/skybox/vertexShader.shader");
  skyboxFragmentShaderRequest.open('GET', "./shader/skybox/fragmentShader.shader");
  textVertexShaderRequest.open('GET', "./shader/text/vertexShader.shader");
  textFragmentShaderRequest.open('GET', "./shader/text/fragmentShader.shader");
  rectangleVertexShaderRequest.open('GET', "./shader/rectangle/vertexShader.shader");
  rectangleFragmentShaderRequest.open('GET', "./shader/rectangle/fragmentShader.shader");

  var that = this;
  particleVertexShaderRequest.addEventListener("load", function(){
    that.particleVertexShader = particleVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  particleFragmentShaderRequest.addEventListener("load", function(){
    that.particleFragmentShader = particleFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  objectTrailVertexShaderRequest.addEventListener("load", function(){
    that.objectTrailVertexShader= objectTrailVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  objectTrailFragmentShaderRequest.addEventListener("load", function(){
    that.objectTrailFragmentShader = objectTrailFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  crossHairVertexShaderRequest.addEventListener("load", function(){
    that.crossHairVertexShader = crossHairVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  crossHairFragmentShaderRequest.addEventListener("load", function(){
    that.crossHairFragmentShader = crossHairFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  basicMaterialVertexShaderRequest.addEventListener("load", function(){
    that.basicMaterialVertexShader = basicMaterialVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  basicMaterialFragmentShaderRequest.addEventListener("load", function(){
    that.basicMaterialFragmentShader = basicMaterialFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  mergedBasicMaterialVertexShaderRequest.addEventListener("load", function(){
    that.mergedBasicMaterialVertexShader = mergedBasicMaterialVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  mergedBasicMaterialFragmentShaderRequest.addEventListener("load", function(){
    that.mergedBasicMaterialFragmentShader = mergedBasicMaterialFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  instancedBasicMaterialVertexShaderRequest.addEventListener("load", function(){
    that.instancedBasicMaterialVertexShader = instancedBasicMaterialVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  instancedBasicMaterialFragmentShaderRequest.addEventListener("load", function(){
    that.instancedBasicMaterialFragmentShader = instancedBasicMaterialFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  skyboxVertexShaderRequest.addEventListener("load", function(){
    that.skyboxVertexShader = skyboxVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  skyboxFragmentShaderRequest.addEventListener("load", function(){
    that.skyboxFragmentShader = skyboxFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  textVertexShaderRequest.addEventListener("load", function(){
    that.textVertexShader = textVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  textFragmentShaderRequest.addEventListener("load", function(){
    that.textFragmentShader = textFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  rectangleVertexShaderRequest.addEventListener("load", function(){
    that.rectangleVertexShader = rectangleVertexShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });
  rectangleFragmentShaderRequest.addEventListener("load", function(){
    that.rectangleFragmentShader = rectangleFragmentShaderRequest.responseText;
    that.aShaderLoadedCallback();
  });

  particleVertexShaderRequest.send();
  particleFragmentShaderRequest.send();
  objectTrailVertexShaderRequest.send();
  objectTrailFragmentShaderRequest.send();
  crossHairVertexShaderRequest.send();
  crossHairFragmentShaderRequest.send();
  basicMaterialVertexShaderRequest.send();
  basicMaterialFragmentShaderRequest.send();
  mergedBasicMaterialVertexShaderRequest.send();
  mergedBasicMaterialFragmentShaderRequest.send();
  instancedBasicMaterialVertexShaderRequest.send();
  instancedBasicMaterialFragmentShaderRequest.send();
  skyboxVertexShaderRequest.send();
  skyboxFragmentShaderRequest.send();
  textVertexShaderRequest.send();
  textFragmentShaderRequest.send();
  rectangleVertexShaderRequest.send();
  rectangleFragmentShaderRequest.send();

}
