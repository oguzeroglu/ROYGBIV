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

  particleVertexShaderRequest.open('GET', "/shader/particle/vertexShader.shader");
  particleFragmentShaderRequest.open('GET', "/shader/particle/fragmentShader.shader");
  objectTrailVertexShaderRequest.open('GET', "/shader/object_trail/vertexShader.shader");
  objectTrailFragmentShaderRequest.open('GET', "/shader/object_trail/fragmentShader.shader");
  crossHairVertexShaderRequest.open('GET', "/shader/crosshair/vertexShader.shader");
  crossHairFragmentShaderRequest.open('GET', "/shader/crosshair/fragmentShader.shader");
  basicMaterialVertexShaderRequest.open('GET', "/shader/materials/basic_material/vertexShader.shader");
  basicMaterialFragmentShaderRequest.open('GET', "/shader/materials/basic_material/fragmentShader.shader");
  mergedBasicMaterialVertexShaderRequest.open('GET', "/shader/materials/merged_basic_material/vertexShader.shader");
  mergedBasicMaterialFragmentShaderRequest.open('GET', "/shader/materials/merged_basic_material/fragmentShader.shader");
  instancedBasicMaterialVertexShaderRequest.open('GET', "/shader/materials/instanced_basic_material/vertexShader.shader");
  instancedBasicMaterialFragmentShaderRequest.open('GET', "/shader/materials/instanced_basic_material/fragmentShader.shader");

  var that = this;
  particleVertexShaderRequest.addEventListener("load", function(){
    that.particleVertexShader = particleVertexShaderRequest.responseText;
  });
  particleFragmentShaderRequest.addEventListener("load", function(){
    that.particleFragmentShader = particleFragmentShaderRequest.responseText;
  });
  objectTrailVertexShaderRequest.addEventListener("load", function(){
    that.objectTrailVertexShader= objectTrailVertexShaderRequest.responseText;
  });
  objectTrailFragmentShaderRequest.addEventListener("load", function(){
    that.objectTrailFragmentShader = objectTrailFragmentShaderRequest.responseText;
  });
  crossHairVertexShaderRequest.addEventListener("load", function(){
    that.crossHairVertexShader = crossHairVertexShaderRequest.responseText;
  });
  crossHairFragmentShaderRequest.addEventListener("load", function(){
    that.crossHairFragmentShader = crossHairFragmentShaderRequest.responseText;
  });
  basicMaterialVertexShaderRequest.addEventListener("load", function(){
    that.basicMaterialVertexShader = basicMaterialVertexShaderRequest.responseText;
  });
  basicMaterialFragmentShaderRequest.addEventListener("load", function(){
    that.basicMaterialFragmentShader = basicMaterialFragmentShaderRequest.responseText;
  });
  mergedBasicMaterialVertexShaderRequest.addEventListener("load", function(){
    that.mergedBasicMaterialVertexShader = mergedBasicMaterialVertexShaderRequest.responseText;
  });
  mergedBasicMaterialFragmentShaderRequest.addEventListener("load", function(){
    that.mergedBasicMaterialFragmentShader = mergedBasicMaterialFragmentShaderRequest.responseText;
  });
  instancedBasicMaterialVertexShaderRequest.addEventListener("load", function(){
    that.instancedBasicMaterialVertexShader = instancedBasicMaterialVertexShaderRequest.responseText;
  });
  instancedBasicMaterialFragmentShaderRequest.addEventListener("load", function(){
    that.instancedBasicMaterialFragmentShader = instancedBasicMaterialFragmentShaderRequest.responseText;
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

}
