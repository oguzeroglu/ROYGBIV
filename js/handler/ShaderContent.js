var ShaderContent = function(){

    this.particleVertexShader = 0;
    this.particleFragmentShader = 0;
    this.objectTrailVertexShader = 0;
    this.objectTrailFragmentShader = 0;

    this.load();

}

ShaderContent.prototype.load = function(){
  var particleVertexShaderRequest = new XMLHttpRequest();
  var particleFragmentShaderRequest = new XMLHttpRequest();
  var objectTrailVertexShaderRequest = new XMLHttpRequest();
  var objectTrailFragmentShaderRequest = new XMLHttpRequest();

  particleVertexShaderRequest.open('GET', "/js/shader/particle/vertexShader.shader");
  particleFragmentShaderRequest.open('GET', "/js/shader/particle/fragmentShader.shader");
  objectTrailVertexShaderRequest.open('GET', "/js/shader/object_trail/vertexShader.shader");
  objectTrailFragmentShaderRequest.open('GET', "/js/shader/object_trail/fragmentShader.shader");

  var that = this;
  particleVertexShaderRequest.addEventListener("load", function(){
    that.particleVertexShader = particleVertexShaderRequest.responseText;
    console.log("[*] Particle vertex shader loaded.");
  });
  particleFragmentShaderRequest.addEventListener("load", function(){
    that.particleFragmentShader = particleFragmentShaderRequest.responseText;
    console.log("[*] Particle fragment shader loaded.");
  });
  objectTrailVertexShaderRequest.addEventListener("load", function(){
    that.objectTrailVertexShader= objectTrailVertexShaderRequest.responseText;
    console.log("[*] Object trail vertex shader loaded.");
  });
  objectTrailFragmentShaderRequest.addEventListener("load", function(){
    that.objectTrailFragmentShader = objectTrailFragmentShaderRequest.responseText;
    console.log("[*] Object trail fragment shader loaded.");
  });

  particleVertexShaderRequest.send();
  particleFragmentShaderRequest.send();
  objectTrailVertexShaderRequest.send();
  objectTrailFragmentShaderRequest.send();
}
