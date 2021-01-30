var MacroHandler = function(){
  this.isMacroHandler = true;
}

MacroHandler.prototype.injectMacro = function(macro, material, insertVertexShader, insertFragmentShader){
  var macroText = "#define "+macro;
  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.injectFloat = function(variableName, value, material, insertVertexShader, insertFragmentShader){
  var macroText = "float " + variableName + " = " + "float(" + value + ");";
  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.injectVec3 = function(variableName, vec, material, insertVertexShader, insertFragmentShader){
  var macroText = "vec3 " + variableName + " = " + "vec3(@@1, @@2, @@3);";
  macroText = macroText.replace("@@1", "float(" + vec.x + ")");
  macroText = macroText.replace("@@2", "float(" + vec.y + ")");
  macroText = macroText.replace("@@3", "float(" + vec.z + ")");

  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.injectVec2 = function(variableName, vec, material, insertVertexShader, insertFragmentShader){
  var macroText = "vec2 " + variableName + " = " + "vec2(@@1, @@2);";
  macroText = macroText.replace("@@1", "float(" + vec.x + ")");
  macroText = macroText.replace("@@2", "float(" + vec.y + ")");

  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.injectMat4 = function(variableName, mat4, material, insertVertexShader, insertFragmentShader){
  var macroText = "mat4 " + variableName + " = " + "mat4(@@1);";

  var str = "";
  for (var i = 0; i < mat4.elements.length; i ++){
    if (i != mat4.elements.length - 1){
      str += "float(" + mat4.elements[i] + "),";
    }else{
      str += "float(" + mat4.elements[i] + ")";
    }
  }

  macroText = macroText.replace("@@1", str);

  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace("#define INSERTION", "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.replaceVec3 = function(variableName, oldVec3, newVec3, material, insertVertexShader, insertFragmentShader){
  if (oldVec3.x == newVec3.x && oldVec3.y == newVec3.y && oldVec3.z == newVec3.z){
    return;
  }
  var macroText = "vec3 " + variableName + " = vec3(float(@@1), float(@@2), float(@@3));";
  var oldMacroText = "vec3 " + variableName + " = vec3(float(@@1), float(@@2), float(@@3));";

  macroText = macroText.replace("@@1", newVec3.x).replace("@@2", newVec3.y).replace("@@3", newVec3.z);
  oldMacroText = oldMacroText.replace("@@1", oldVec3.x).replace("@@2", oldVec3.y).replace("@@3", oldVec3.z);

  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace(oldMacroText, "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace(oldMacroText, "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.replaceMat4 = function(variableName, oldMat4, mat4, material, insertVertexShader, insertFragmentShader){
  var macroText = "mat4 " + variableName + " = " + "mat4(@@1);";
  var oldMacroText = "mat4 " + variableName + " = " + "mat4(@@1);";

  var str = "";
  var str2 = "";
  for (var i = 0; i < mat4.elements.length; i ++){
    if (i != mat4.elements.length - 1){
      str += "float(" + mat4.elements[i] + "),";
    }else{
      str += "float(" + mat4.elements[i] + ")";
    }
  }
  for (var i = 0; i < oldMat4.elements.length; i ++){
    if (i != oldMat4.elements.length - 1){
      str2 += "float(" + oldMat4.elements[i] + "),";
    }else{
      str2 += "float(" + oldMat4.elements[i] + ")";
    }
  }

  macroText = macroText.replace("@@1", str);
  oldMacroText = oldMacroText.replace("@@1", str2);

  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace("\n"+macroText, "");
    material.vertexShader = material.vertexShader.replace(oldMacroText, "#define INSERTION\n"+macroText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n"+macroText, "");
    material.fragmentShader = material.fragmentShader.replace(oldMacroText, "#define INSERTION\n"+macroText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.removeMacro = function(macro, material, removeVertexShader, removeFragmentShader){
  if (removeVertexShader){
    material.vertexShader = material.vertexShader.replace("\n#define "+macro, "");
  }
  if (removeFragmentShader){
    material.fragmentShader = material.fragmentShader.replace("\n#define "+macro, "");
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.getMacroValue = function(macro, material, fromVertexShader){
  var shaderCode = fromVertexShader? material.vertexShader: material.fragmentShader;
  var splitted = shaderCode.split("\n");
  for (var i = 0; i < splitted.length; i ++){
    if (splitted[i].startsWith("#define " + macro)){
      var lineSplitted = splitted[i].split(" ");
      return lineSplitted[lineSplitted.length - 1];
    }
  }
  return null;
}

MacroHandler.prototype.isAttributeRepeating = function(attribute){
  var itemSize = attribute.itemSize;
  var firstItem;
  if (itemSize == 1){
    firstItem = attribute.array[0];
  }
  if (itemSize == 2){
    firstItem = new THREE.Vector2(attribute.array[0], attribute.array[1]);
  }
  if (itemSize == 3){
    firstItem = new THREE.Vector3(attribute.array[0], attribute.array[1], attribute.array[2]);
  }
  if (itemSize == 4){
    firstItem = new THREE.Vector4(attribute.array[0], attribute.array[1], attribute.array[2], attribute.array[3]);
  }

  for (var i = itemSize; i < attribute.array.length; i += itemSize){
    if (itemSize == 1){
      if (attribute.array[i] != firstItem){
        return false;
      }
    }
    if (itemSize == 2){
      if (attribute.array[i] != firstItem.x || attribute.array[i + 1] != firstItem.y){
        return false;
      }
    }
    if (itemSize == 3){
      if (attribute.array[i] != firstItem.x || attribute.array[i + 1] != firstItem.y || attribute.array[i + 2] != firstItem.z){
        return false;
      }
    }
    if (itemSize == 4){
      if (attribute.array[i] != firstItem.x || attribute.array[i + 1] != firstItem.y || attribute.array[i + 2] != firstItem.z || attribute.array[i + 3] != firstItem.w){
        return false;
      }
    }
  }

  return true;
}

MacroHandler.prototype.compressAttributes = function(mesh, compressableAttributes){
  var compressionAttributes = [];

  var attributes = mesh.geometry.attributes;

  for (var i = 0; i < compressableAttributes.length; i ++){
    var attrKey = compressableAttributes[i];
    if (attributes[attrKey] && this.isAttributeRepeating(attributes[attrKey])){
      var attr = attributes[attrKey];
      var info = {name: attrKey, elements: []};
      for (var i2 = 0; i2 < attr.itemSize; i2 ++){
        info.elements.push(attr.array[i2]);
      }
      compressionAttributes.push(info);
      mesh.geometry.removeAttribute(attrKey);
    }
  }

  var result = [];
  for (var i = 0; i < compressionAttributes.length; i ++){
    this.compressAttribute(mesh.material, compressionAttributes[i]);
    result.push(compressionAttributes[i].name);
  }

  return result;
}

MacroHandler.prototype.compressAttribute = function(material, compressionInfo){
  var elemLen = compressionInfo.elements.length;
  var attrTypeString = elemLen == 1? "float": "vec"+elemLen;

  var newValueString = "";
  if (elemLen == 1){
    newValueString = "float(" + compressionInfo.elements[0] + ")";
  }else{
    newValueString = attrTypeString + "(@@1)";
    var innerStr = "";
    for (var i = 0; i < elemLen; i ++){
      innerStr += "float(" + compressionInfo.elements[i] + ")";
      if (i != elemLen - 1){
        innerStr += ",";
      }
    }
    newValueString = newValueString.replace("@@1", innerStr);
  }

  material.vertexShader = material.vertexShader.replace("attribute " + attrTypeString + " " + compressionInfo.name + ";", attrTypeString + " " + compressionInfo.name + " = " + newValueString + ";");
  material.needsUpdate = true;
}

MacroHandler.prototype.replaceCompressedVec4 = function(material, varName, data1, data2, data3, data4){
  var splitted = material.vertexShader.split("\n");
  for (var i = 0; i < splitted.length; i ++){
    if (splitted[i].trim().startsWith("vec4 " + varName + " = vec4(")){
      splitted[i] = "vec4 " + varName + " = vec4(float(" + data1 + "), float(" + data2 + "), float(" + data3 + "), float(" + data4 + "));";
      break;
    }
  }
  material.vertexShader = splitted.join("\n");

  splitted = material.fragmentShader.split("\n");
  for (var i = 0; i < splitted.length; i ++){
    if (splitted[i].trim().startsWith("vec4 " + varName + " = vec4(")){
      splitted[i] = "vec4 " + varName + " = vec4(float(" + data1 + "), float(" + data2 + "), float(" + data3 + "), float(" + data4 + "));";
      break;
    }
  }
  material.fragmentShader = splitted.join("\n");

  material.needsUpdate = true;
}

MacroHandler.prototype.removeUniform = function(material, uniformName){
  var splittedVertexShader = material.vertexShader.split("\n");
  var splittedFragmentShader = material.fragmentShader.split("\n");

  var newVertexShaderLines = [];
  var newFragmentShaderLines = [];

  for (var i = 0; i < splittedVertexShader.length; i ++){
    var line = splittedVertexShader[i];
    if (!(line.includes("uniform") && line.includes(uniformName))){
      newVertexShaderLines.push(line);
    }
  }

  for (var i = 0; i < splittedFragmentShader.length; i ++){
    var line = splittedFragmentShader[i];
    if (!(line.includes("uniform") && line.includes(uniformName))){
       newFragmentShaderLines.push(line);
    }
  }

  material.vertexShader = newVertexShaderLines.join("\n");
  material.fragmentShader = newFragmentShaderLines.join("\n");
  material.needsUpdate = true;
}

MacroHandler.prototype.replaceText = function(oldText, newText, material, insertVertexShader, insertFragmentShader){
  if (insertVertexShader){
    material.vertexShader = material.vertexShader.replace(oldText, newText);
  }
  if (insertFragmentShader){
    material.fragmentShader = material.fragmentShader.replace(oldText, newText);
  }
  material.needsUpdate = true;
}

MacroHandler.prototype.compressVaryingVec3 = function(material, varyingName, vecX, vecY, vecZ){
  var newValueString = "vec3 " + varyingName + " = vec3(@@1);";
  var innerStr = "";
  innerStr += "float(" + vecX + "),";
  innerStr += "float(" + vecY + "),";
  innerStr += "float(" + vecZ + ")";
  newValueString = newValueString.replace("@@1", innerStr);

  material.vertexShader = material.vertexShader.replace("varying vec3 " + varyingName + ";", newValueString);
  material.fragmentShader = material.fragmentShader.replace("varying vec3 " + varyingName + ";", newValueString);

  material.needsUpdate = true;
}

MacroHandler.prototype.compressVaryingVec4 = function(material, varyingName, vecX, vecY, vecZ, vecW){
  var newValueString = "vec4 " + varyingName + " = vec4(@@1);";
  var innerStr = "";
  innerStr += "float(" + vecX + "),";
  innerStr += "float(" + vecY + "),";
  innerStr += "float(" + vecZ + "),";
  innerStr += "float(" + vecW + ")";
  newValueString = newValueString.replace("@@1", innerStr);

  material.vertexShader = material.vertexShader.replace("varying vec4 " + varyingName + ";", newValueString);
  material.fragmentShader = material.fragmentShader.replace("varying vec4 " + varyingName + ";", newValueString);

  material.needsUpdate = true;
}

MacroHandler.prototype.compressVaryingFloat = function(material, varyingName, val){
  var newValueString = "float " + varyingName + " = float(@@1);".replace("@@1", val);

  material.vertexShader = material.vertexShader.replace("varying float " + varyingName + ";", newValueString);
  material.fragmentShader = material.fragmentShader.replace("varying float " + varyingName + ";", newValueString);

  material.needsUpdate = true;
}
