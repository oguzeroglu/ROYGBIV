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
    TEXT: 7,
    LIGHTNING: 8,
    SPRITE: 9
  }
  this.reset();
}

ShaderPrecisionHandler.prototype.setDefaultPrecisionForObject = function(obj, precision){
  var currentPrecisionForObj, newPrecisionForObj;
  var type;
  if (obj.isAddedObject){
    type = this.types.BASIC_MATERIAL;
  }else if (obj.isObjectGroup){
    if (obj.isInstanced){
      type = this.types.INSTANCED_BASIC_MATERIAL;
    }else{
      type = this.types.MERGED_BASIC_MATERIAL;
    }
  }else if (obj.isAddedText){
    type = this.types.TEXT;
  }
  if (obj.hasCustomPrecision){
    switch (obj.customPrecision){
      case this.precisionTypes.LOW:
        currentPrecisionForObj = {int: "precision lowp int;", float: "precision lowp float;"};
      break;
      case this.precisionTypes.MEDIUM:
        currentPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
      break;
      case this.precisionTypes.HIGH:
        if (HIGH_PRECISION_SUPPORTED){
          currentPrecisionForObj = {int: "precision highp int;", float: "precision highp float;"};
        }else{
          currentPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
        }
      break;
    }
  }else{
    currentPrecisionForObj = this.getCurrentPrecisionForType(type);
  }
  switch (this.precisions[type]){
    case this.precisionTypes.LOW:
      newPrecisionForObj = {int: "precision lowp int;", float: "precision lowp float;"};
    break;
    case this.precisionTypes.MEDIUM:
      newPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
    break;
    case this.precisionTypes.HIGH:
      if (HIGH_PRECISION_SUPPORTED){
        newPrecisionForObj = {int: "precision highp int;", float: "precision highp float;"};
      }else{
        newPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
      }
    break;
  }
  obj.mesh.material.vertexShader = this.replace(obj.mesh.material.vertexShader, currentPrecisionForObj, newPrecisionForObj);
  obj.mesh.material.fragmentShader = this.replace(obj.mesh.material.fragmentShader, currentPrecisionForObj, newPrecisionForObj);
  obj.mesh.material.needsUpdate = true;
}

ShaderPrecisionHandler.prototype.setCustomPrecisionForObject = function(obj, precision){
  var currentPrecisionForObj, newPrecisionForObj;
  var type;
  if (obj.isAddedObject){
    type = this.types.BASIC_MATERIAL;
  }else if (obj.isObjectGroup){
    if (obj.isInstanced){
      type = this.types.INSTANCED_BASIC_MATERIAL;
    }else{
      type = this.types.MERGED_BASIC_MATERIAL;
    }
  }else if (obj.isAddedText){
    type = this.types.TEXT;
  }else if (obj.isAutoInstancedObject){
    type = this.types.INSTANCED_BASIC_MATERIAL;
  }
  if (obj.hasCustomPrecision){
    switch (obj.customPrecision){
      case this.precisionTypes.LOW:
        currentPrecisionForObj = {int: "precision lowp int;", float: "precision lowp float;"};
      break;
      case this.precisionTypes.MEDIUM:
        currentPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
      break;
      case this.precisionTypes.HIGH:
        if (HIGH_PRECISION_SUPPORTED){
          currentPrecisionForObj = {int: "precision highp int;", float: "precision highp float;"};
        }else{
          currentPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
        }
      break;
    }
  }else{
    currentPrecisionForObj = this.getCurrentPrecisionForType(type);
  }
  if (!currentPrecisionForObj){
    throw new Error("Unknown type.");
  }
  switch (precision){
    case this.precisionTypes.LOW:
      newPrecisionForObj = {int: "precision lowp int;", float: "precision lowp float;"};
    break;
    case this.precisionTypes.MEDIUM:
      newPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
    break;
    case this.precisionTypes.HIGH:
      if (HIGH_PRECISION_SUPPORTED){
        newPrecisionForObj = {int: "precision highp int;", float: "precision highp float;"};
      }else{
        newPrecisionForObj = {int: "precision mediump int;", float: "precision mediump float;"};
      }
    break;
  }
  if (!newPrecisionForObj){
    throw new Error("Unknown precision.");
  }
  obj.mesh.material.vertexShader = this.replace(obj.mesh.material.vertexShader, currentPrecisionForObj, newPrecisionForObj);
  obj.mesh.material.fragmentShader = this.replace(obj.mesh.material.fragmentShader, currentPrecisionForObj, newPrecisionForObj);
  obj.mesh.material.needsUpdate = true;
}

ShaderPrecisionHandler.prototype.reset = function(){
  this.precisions = {};
  for (var key in this.types){
    this.precisions[this.types[key]] = this.precisionTypes.LOW;
  }
}

ShaderPrecisionHandler.prototype.load = function(precisions){
  for (var key in precisions){
    this.setShaderPrecisionForType(parseInt(key), precisions[key]);
  }
}

ShaderPrecisionHandler.prototype.export = function(){
  return this.precisions;
}

ShaderPrecisionHandler.prototype.getShaderPrecisionTextForType = function(type){
  var precision = this.precisions[type];
  switch (precision){
    case this.precisionTypes.LOW:
    return "low";
    case this.precisionTypes.MEDIUM:
    return "medium";
    case this.precisionTypes.HIGH:
    return "high";
  }
  throw new Error("Unknown type.");
}

ShaderPrecisionHandler.prototype.getCurrentPrecisionForType = function(type){
  switch (this.precisions[type]){
    case this.precisionTypes.LOW:
    return {int: "precision lowp int;", float: "precision lowp float;"};
    case this.precisionTypes.MEDIUM:
    return {int: "precision mediump int;", float: "precision mediump float;"};
    case this.precisionTypes.HIGH:
    if (HIGH_PRECISION_SUPPORTED){
      return{int: "precision highp int;", float: "precision highp float;"};
    }
    return {int: "precision mediump int;", float: "precision mediump float;"};
  }
  throw new Error("Unknown type.");
}

ShaderPrecisionHandler.prototype.replace = function(shader, currentPrecision, newPrecision){
  for (var key in currentPrecision){
    shader = shader.replace(currentPrecision[key], newPrecision[key]);
  }
  return shader;
}

ShaderPrecisionHandler.prototype.setShaderPrecisionForType = function(type, precision){
  var currentPrecisionForType = this.getCurrentPrecisionForType(type);
  var newPrecisionForType = {};
  switch (precision){
    case this.precisionTypes.LOW:
      newPrecisionForType = {int: "precision lowp int;", float: "precision lowp float;"};
    break;
    case this.precisionTypes.MEDIUM:
      newPrecisionForType = {int: "precision mediump int;", float: "precision mediump float;"};
    break;
    case this.precisionTypes.HIGH:
      if (HIGH_PRECISION_SUPPORTED){
        newPrecisionForType = {int: "precision highp int;", float: "precision highp float;"};
      }else {
        newPrecisionForType = {int: "precision mediump int;", float: "precision mediump float;"};
      }
    break;
  }
  var vertexShader, fragmentShader, vertexShaderName, fragmentShaderName;
  switch (type){
    case this.types.LIGHTNING:
      vertexShader = ShaderContent.lightningVertexShader;
      fragmentShader = ShaderContent.lightningFragmentShader;
      vertexShaderName = "lightningVertexShader";
      fragmentShaderName = "lightningFragmentShader";
      for (var lightningName in lightnings){
        var lightning = lightnings[lightningName];
        lightning.mesh.material.vertexShader = this.replace(lightning.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        lightning.mesh.material.fragmentShader = this.replace(lightning.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        lightning.mesh.material.needsUpdate = true;
      }
    break;
    case this.types.CROSSHAIR:
      vertexShader = ShaderContent.crossHairVertexShader;
      fragmentShader = ShaderContent.crossHairFragmentShader;
      vertexShaderName = "crossHairVertexShader";
      fragmentShaderName = "crossHairFragmentShader";
      for (var chName in crosshairs){
        var crosshair = crosshairs[chName];
        crosshair.mesh.material.vertexShader = this.replace(crosshair.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        crosshair.mesh.material.fragmentShader = this.replace(crosshair.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        crosshair.mesh.material.needsUpdate = true;
      }
    break;
    case this.types.BASIC_MATERIAL:
      vertexShader = ShaderContent.basicMaterialVertexShader;
      fragmentShader = ShaderContent.basicMaterialFragmentShader;
      vertexShaderName = "basicMaterialVertexShader";
      fragmentShaderName = "basicMaterialFragmentShader";
      for (var objName in addedObjects){
        var obj = addedObjects[objName];
        if (obj.hasCustomPrecision){
          continue;
        }
        obj.mesh.material.vertexShader = this.replace(obj.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        obj.mesh.material.fragmentShader = this.replace(obj.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        obj.mesh.material.needsUpdate = true;
      }
    break;
    case this.types.INSTANCED_BASIC_MATERIAL:
      vertexShader = ShaderContent.instancedBasicMaterialVertexShader;
      fragmentShader = ShaderContent.instancedBasicMaterialFragmentShader;
      vertexShaderName = "instancedBasicMaterialVertexShader";
      fragmentShaderName = "instancedBasicMaterialFragmentShader";
      for (var objName in objectGroups){
        var obj = objectGroups[objName];
        if (!obj.isInstanced || obj.hasCustomPrecision){
          continue;
        }
        obj.mesh.material.vertexShader = this.replace(obj.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        obj.mesh.material.fragmentShader = this.replace(obj.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        obj.mesh.material.needsUpdate = true;
      }
    break;
    case this.types.MERGED_BASIC_MATERIAL:
      vertexShader = ShaderContent.mergedBasicMaterialVertexShader;
      fragmentShader = ShaderContent.mergedBasicMaterialFragmentShader;
      vertexShaderName = "mergedBasicMaterialVertexShader";
      fragmentShaderName = "mergedBasicMaterialFragmentShader";
      for (var objName in objectGroups){
        var obj = objectGroups[objName];
        if (obj.isInstanced || obj.hasCustomPrecision){
          continue;
        }
        obj.mesh.material.vertexShader = this.replace(obj.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        obj.mesh.material.fragmentShader = this.replace(obj.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        obj.mesh.material.needsUpdate = true;
      }
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
      if (skyboxHandler.isVisible()){
        skyboxHandler.getMesh().material.vertexShader = this.replace(skyboxHandler.getMesh().material.vertexShader, currentPrecisionForType, newPrecisionForType);
        skyboxHandler.getMesh().material.fragmentShader = this.replace(skyboxHandler.getMesh().material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        skyboxHandler.getMesh().material.needsUpdate = true;
      }
    break;
    case this.types.TEXT:
      vertexShader = ShaderContent.textVertexShader;
      fragmentShader = ShaderContent.textFragmentShader;
      vertexShaderName = "textVertexShader";
      fragmentShaderName = "textFragmentShader";
      for (var textName in addedTexts){
        var text = addedTexts[textName];
        if (text.hasCustomPrecision){
          continue;
        }
        text.mesh.material.vertexShader = this.replace(text.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        text.mesh.material.fragmentShader = this.replace(text.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        text.mesh.material.needsUpdate = true;
      }
    break;
    case this.types.SPRITE:
      vertexShader = ShaderContent.spriteVertexShader;
      fragmentShader = ShaderContent.spriteFragmentShader;
      vertexShaderName = "spriteVertexShader";
      fragmentShaderName = "spriteFragmentShader";
      for (var spriteName in sprites){
        var sprite = sprites[spriteName];
        sprite.mesh.material.vertexShader = this.replace(sprite.mesh.material.vertexShader, currentPrecisionForType, newPrecisionForType);
        sprite.mesh.material.fragmentShader = this.replace(sprite.mesh.material.fragmentShader, currentPrecisionForType, newPrecisionForType);
        sprite.mesh.material.needsUpdate = true;
      }
    break;
  }
  if (!vertexShader){
    throw new Error("Unknown type.");
  }
  vertexShader = this.replace(vertexShader, currentPrecisionForType, newPrecisionForType);
  fragmentShader = this.replace(fragmentShader, currentPrecisionForType, newPrecisionForType);
  ShaderContent[vertexShaderName] = vertexShader;
  ShaderContent[fragmentShaderName] = fragmentShader;
  this.precisions[type] = precision;
}
