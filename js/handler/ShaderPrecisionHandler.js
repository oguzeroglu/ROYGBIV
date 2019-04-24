var ShaderPrecisionHandler = function(){
  this.precisionTypes = {
    LOW: 0, MEDIUM: 1, HIGH: 2
  };
  this.types = {
    CROSSHAIR: 0,
    BASIC_MATERIAL: 1,
    INSTANCED_BASIC_MATERIAL: 2,
    MERGED_BASIC_MATERIAL: 3,
    OBJECT_TRAIL: 4,
    PARTICLE: 5,
    SKYBOX: 6,
    TEXT: 7
  }
  this.precisions = {};
  for (var key in this.types){
    this.precisions[this.types[key]] = this.precisionTypes.LOW;
  }
}

ShaderPrecisionHandler.prototype.getCurrentPrecisionForType = function(type){
  switch (this.precisions[type]){
    case this.precisionTypes.LOW:
    return {
      int: "precision lowp int;",
      float: "precision lowp float;"
    };
    case this.precisionTypes.MEDIUM:
    return {
      int: "precision mediump int;",
      float: "precision mediump float;"
    };
    case this.precisionTypes.HIGH:
    return {
      int: "precision highp int;",
      float: "precision highp float;"
    };
  }
  throw new Error("Unknown type.");
}

ShaderPrecisionHandler.prototype.setShaderPrecisionForType = function(type, precision){
  var currentPrecisionForType = this.getCurrentPrecisionForType(type);
  var newPrecisionForType = {};
  switch (precision){
    case this.precisionTypes.LOW:
      newPrecisionForType = {
        int: "precision lowp int;",
        float: "precision lowp float;"
      };
    break;
    case this.precisionTypes.MEDIUM:
      newPrecisionForType = {
        int: "precision mediump int;",
        float: "precision mediump float;"
      };
    break;
    case this.precisionTypes.HIGH:
      if (HIGH_PRECISION_SUPPORTED){
        newPrecisionForType = {
          int: "precision highp int;",
          float: "precision highp float;"
        };
      }else {
        newPrecisionForType = {
          int: "precision mediump int;",
          float: "precision mediump float;"
        };
      }
    break;
  }
  var vertexShader, fragmentShader, vertexShaderName, fragmentShaderName;
  switch (type){
    case this.types.CROSSHAIR:
      vertexShader = ShaderContent.crossHairVertexShader;
      fragmentShader = ShaderContent.crossHairFragmentShader;
      vertexShaderName = "crossHairVertexShader";
      fragmentShaderName = "crossHairFragmentShader";
    break;
    case this.types.BASIC_MATERIAL:
      vertexShader = ShaderContent.basicMaterialVertexShader;
      fragmentShader = ShaderContent.basicMaterialFragmentShader;
      vertexShaderName = "basicMaterialVertexShader";
      fragmentShaderName = "basicMaterialFragmentShader";
    break;
    case this.types.INSTANCED_BASIC_MATERIAL:
      vertexShader = ShaderContent.instancedBasicMaterialVertexShader;
      fragmentShader = ShaderContent.instancedBasicMaterialFragmentShader;
      vertexShaderName = "instancedBasicMaterialVertexShader";
      fragmentShaderName = "instancedBasicMaterialFragmentShader";
    break;
    case this.types.MERGED_BASIC_MATERIAL:
      vertexShader = ShaderContent.mergedBasicMaterialVertexShader;
      fragmentShader = ShaderContent.mergedBasicMaterialFragmentShader;
      vertexShaderName = "mergedBasicMaterialVertexShader";
      fragmentShaderName = "mergedBasicMaterialFragmentShader";
    break;
    case this.types.OBJECT_TRAIL:
      vertexShader = ShaderContent.objectTrailVertexShader;
      fragmentShader = ShaderContent.objectTrailFragmentShader;
      vertexShaderName = "objectTrailVertexShader";
      fragmentShaderName = "objectTrailFragmentShader";
    break;
    case this.types.PARTICLE:
      vertexShader = ShaderContent.particleVertexShader;
      fragmentShader = ShaderContent.particleFragmentShader;
      vertexShaderName = "particleVertexShader";
      fragmentShaderName = "particleFragmentShader";
    break;
    case this.types.SKYBOX:
      vertexShader = ShaderContent.skyboxVertexShader;
      fragmentShader = ShaderContent.skyboxFragmentShader;
      vertexShaderName = "skyboxVertexShader";
      fragmentShaderName = "skyboxFragmentShader";
    break;
    case this.types.TEXT:
      vertexShader = ShaderContent.textVertexShader;
      fragmentShader = ShaderContent.textFragmentShader;
      vertexShaderName = "textVertexShader";
      fragmentShaderName = "textFragmentShader";
    break;
  }
  if (!vertexShader){
    throw new Error("Unknown type.");
  }
  for (var key in currentPrecisionForType){
    vertexShader = vertexShader.replace(currentPrecisionForType[key], newPrecisionForType[key]);
    fragmentShader = fragmentShader.replace(currentPrecisionForType[key], newPrecisionForType[key]);
  }
  ShaderContent[vertexShaderName] = vertexShader;
  ShaderContent[fragmentShaderName] = fragmentShader;
  this.precisions[type] = precision;
}
