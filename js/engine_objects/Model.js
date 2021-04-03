var Model = function(modelInfo, texturesObj, positions, normals, uvs, colors, diffuseUVs, normalUVs, specularUVs, alphaUVs, roughnessUVs, metalnessUVs, aoUVs, emissiveUVs, materialIndices, indices, indexedMaterialIndices){
  this.name = modelInfo.name;
  this.geometry = new THREE.BufferGeometry();

  this.indexedMaterialIndices = indexedMaterialIndices || [];

  this.indicesByChildName = {};
  for (var i = 0; i < modelInfo.childInfos.length; i ++){
    this.indicesByChildName[modelInfo.childInfos[i].name] = i;
  }

  var hasNormalMap = modelInfo.hasNormalMap;
  var hasSpecularMap = modelInfo.hasSpecularMap;
  var hasAlphaMap = modelInfo.hasAlphaMap;
  var hasRoughnessMap = modelInfo.hasRoughnessMap;
  var hasMetalnessMap = modelInfo.hasMetalnessMap;
  var hasEmissiveMap = modelInfo.hasEmissiveMap;
  var hasAOMap = modelInfo.hasAOMap;

  if (!indices){
    var indexInfos = {};
    var indexInfosInverse = {};
    var curIndex = 0;
    var i2 = 0;
    var i3 = 0;
    var i4 = 0;
    var indexHitCount = 0;
    var indices = [];
    for (var i = 0; i < positions.length; i += 3){
      var curPosX = positions[i];
      var curPosY = positions[i + 1];
      var curPosZ = positions[i + 2];
      var curNormalX = normals[i];
      var curNormalY = normals[i + 1];
      var curNormalZ = normals[i + 2];
      var curColorR = colors[i];
      var curColorG = colors[i + 1];
      var curColorB = colors[i + 2];
      var curUVX = uvs[i2];
      var curUVY = uvs[i2 + 1];
      var curDiffuseUVX = diffuseUVs[i4];
      var curDiffuseUVY = diffuseUVs[i4 + 1];
      var curDiffuseUVZ = diffuseUVs[i4 + 2];
      var curDiffuseUVW = diffuseUVs[i4 + 3];
      var curNormalUVX = hasNormalMap? normalUVs[i4]: 0;
      var curNormalUVY = hasNormalMap? normalUVs[i4 + 1]: 0;
      var curNormalUVZ = hasNormalMap? normalUVs[i4 + 2]: 0;
      var curNormalUVW = hasNormalMap? normalUVs[i4 + 3]: 0;
      var curSpecularUVX = hasSpecularMap? specularUVs[i4]: 0;
      var curSpecularUVY = hasSpecularMap? specularUVs[i4 + 1]: 0;
      var curSpecularUVZ = hasSpecularMap? specularUVs[i4 + 2]: 0;
      var curSpecularUVW = hasSpecularMap? specularUVs[i4 + 3]: 0;
      var curAlphaUVX = hasAlphaMap? alphaUVs[i4]: 0;
      var curAlphaUVY = hasAlphaMap? alphaUVs[i4 + 1]: 0;
      var curAlphaUVZ = hasAlphaMap? alphaUVs[i4 + 2]: 0;
      var curAlphaUVW = hasAlphaMap? alphaUVs[i4 + 3]: 0;
      var curRoughnessUVX = hasRoughnessMap? roughnessUVs[i4]: 0;
      var curRoughnessUVY = hasRoughnessMap? roughnessUVs[i4 + 1]: 0;
      var curRoughnessUVZ = hasRoughnessMap? roughnessUVs[i4 + 2]: 0;
      var curRoughnessUVW = hasRoughnessMap? roughnessUVs[i4 + 3]: 0;
      var curMetalnessUVX = hasMetalnessMap? metalnessUVs[i4]: 0;
      var curMetalnessUVY = hasMetalnessMap? metalnessUVs[i4 + 1]: 0;
      var curMetalnessUVZ = hasMetalnessMap? metalnessUVs[i4 + 2]: 0;
      var curMetalnessUVW = hasMetalnessMap? metalnessUVs[i4 + 3]: 0;
      var curEmissiveUVX = hasEmissiveMap? emissiveUVs[i4]: 0;
      var curEmissiveUVY = hasEmissiveMap? emissiveUVs[i4 + 1]: 0;
      var curEmissiveUVZ = hasEmissiveMap? emissiveUVs[i4 + 2]: 0;
      var curEmissiveUVW = hasEmissiveMap? emissiveUVs[i4 + 3]: 0;
      var curAOUVX = hasAOMap? aoUVs[i4]: 0;
      var curAOUVY = hasAOMap? aoUVs[i4 + 1]: 0;
      var curAOUVZ = hasAOMap? aoUVs[i4 + 2]: 0;
      var curAOUVW = hasAOMap? aoUVs[i4 + 3]: 0;
      var curMaterialIndex = materialIndices[i3];
      var key = curPosX + PIPE + curPosY + PIPE + curPosZ;
      key += PIPE + curNormalX + PIPE + curNormalY + PIPE + curNormalZ;
      key += PIPE + curUVX + PIPE + curUVY;
      key += PIPE + curDiffuseUVX + PIPE + curDiffuseUVY + PIPE + curDiffuseUVZ + PIPE + curDiffuseUVW;
      key += PIPE + curColorR + PIPE + curColorG + PIPE + curColorB;
      key += PIPE + curNormalUVX + PIPE + curNormalUVY + PIPE + curNormalUVZ + PIPE + curNormalUVW;
      key += PIPE + curSpecularUVX + PIPE + curSpecularUVY + PIPE + curSpecularUVZ + PIPE + curSpecularUVW;
      key += PIPE + curAlphaUVX + PIPE + curAlphaUVY + PIPE + curAlphaUVZ + PIPE + curAlphaUVW;
      key += PIPE + curRoughnessUVX + PIPE + curRoughnessUVY + PIPE + curRoughnessUVZ + PIPE + curRoughnessUVW;
      key += PIPE + curMetalnessUVX + PIPE + curMetalnessUVY + PIPE + curMetalnessUVZ + PIPE + curMetalnessUVW;
      key += PIPE + curEmissiveUVX + PIPE + curEmissiveUVY + PIPE + curEmissiveUVZ + PIPE + curEmissiveUVW;
      key += PIPE + curAOUVX + PIPE + curAOUVY + PIPE + curAOUVZ + PIPE + curAOUVW;
      if (!(typeof indexInfos[key] == UNDEFINED)){
        indexHitCount ++;
        indices.push(indexInfos[key]);
      }else{
        indexInfos[key] = curIndex;
        indexInfosInverse[curIndex] = key;
        indices.push(curIndex);
        curIndex ++;
        this.indexedMaterialIndices.push(curMaterialIndex);
      }
      i2 += 2;
      i3 ++;
      i4 += 4;
    }

    this.indexInfos = indexInfos;
    this.indexInfosInverse = indexInfosInverse;
    this.indices = indices;
    this.curIndex = curIndex;

    this.indexHitCount = indexHitCount;
    var allPositions = new Float32Array(curIndex * 3);
    var allNormals = new Float32Array(curIndex * 3);
    var allUVs = new Float32Array(curIndex * 2);
    var allDiffuseUVs = new Float32Array(curIndex * 4);
    var allColors = new Float32Array(curIndex * 3);

    var allNormalUVs = hasNormalMap? new Float32Array(curIndex * 4): null;
    var allSpecularUVs = hasSpecularMap? new Float32Array(curIndex * 4): null;
    var allAlphaUVs = hasAlphaMap? new Float32Array(curIndex * 4): null;
    var allRoughnessUVs = hasRoughnessMap? new Float32Array(curIndex * 4): null;
    var allMetalnessUVs = hasMetalnessMap? new Float32Array(curIndex * 4): null;
    var allEmissiveUVs = hasEmissiveMap? new Float32Array(curIndex * 4): null;
    var allAOUVs = hasAOMap? new Float32Array(curIndex * 4): null;

    var x = 0, y = 0, z = 0, w = 0, t = 0, s = 0, a = 0, b = 0, c = 0, d = 0, e = 0, f = 0;
    for (var i = 0; i < curIndex; i ++){
      var key = indexInfosInverse[i];
      var splitted = key.split(PIPE);
      var curPosX = parseFloat(splitted[0]);
      var curPosY = parseFloat(splitted[1]);
      var curPosZ = parseFloat(splitted[2]);
      var curNormalX = parseFloat(splitted[3]);
      var curNormalY = parseFloat(splitted[4]);
      var curNormalZ = parseFloat(splitted[5]);
      var curUVX = parseFloat(splitted[6]);
      var curUVY = parseFloat(splitted[7]);
      var curDiffuseUVX = parseFloat(splitted[8]);
      var curDiffuseUVY = parseFloat(splitted[9]);
      var curDiffuseUVZ = parseFloat(splitted[10]);
      var curDiffuseUVW = parseFloat(splitted[11]);
      var curColorR = parseFloat(splitted[12]);
      var curColorG = parseFloat(splitted[13]);
      var curColorB = parseFloat(splitted[14]);
      var curNormalUVX = parseFloat(splitted[15]);
      var curNormalUVY = parseFloat(splitted[16]);
      var curNormalUVZ = parseFloat(splitted[17]);
      var curNormalUVW = parseFloat(splitted[18]);
      var curSpecularUVX = parseFloat(splitted[19]);
      var surSpecularUVY = parseFloat(splitted[20]);
      var curSpecularUVZ = parseFloat(splitted[21]);
      var curSpecularUVW = parseFloat(splitted[22]);
      var curAlphaUVX = parseFloat(splitted[23]);
      var curAlphaUVY = parseFloat(splitted[24]);
      var curAlphaUVZ = parseFloat(splitted[25]);
      var curAlphaUVW = parseFloat(splitted[26]);
      var curRoughnessUVX = parseFloat(splitted[27]);
      var curRoughnessUVY = parseFloat(splitted[28]);
      var curRoughnessUVZ = parseFloat(splitted[29]);
      var curRoughnessUVW = parseFloat(splitted[30]);
      var curMetalnessUVX = parseFloat(splitted[31]);
      var curMetalnessUVY = parseFloat(splitted[32]);
      var curMetalnessUVZ = parseFloat(splitted[33]);
      var curMetalnessUVW = parseFloat(splitted[34]);
      var curEmissiveUVX = parseFloat(splitted[35]);
      var curEmissiveUVY = parseFloat(splitted[36]);
      var curEmissiveUVZ = parseFloat(splitted[37]);
      var curEmissiveUVW = parseFloat(splitted[38]);
      var curAOUVX = parseFloat(splitted[39]);
      var curAOUVY = parseFloat(splitted[40]);
      var curAOUVZ = parseFloat(splitted[41]);
      var curAOUVW = parseFloat(splitted[42]);

      allPositions[x ++] = curPosX;
      allPositions[x ++] = curPosY;
      allPositions[x ++] = curPosZ;
      allNormals[y ++] = curNormalX;
      allNormals[y ++] = curNormalY;
      allNormals[y ++] = curNormalZ;
      allUVs[z ++] = curUVX;
      allUVs[z ++] = curUVY;
      allDiffuseUVs[w ++] = curDiffuseUVX;
      allDiffuseUVs[w ++] = curDiffuseUVY;
      allDiffuseUVs[w ++] = curDiffuseUVZ;
      allDiffuseUVs[w ++] = curDiffuseUVW;
      allColors[t ++] = curColorR;
      allColors[t ++] = curColorG;
      allColors[t ++] = curColorB;

      if (hasNormalMap){
        allNormalUVs[s ++] = curNormalUVX;
        allNormalUVs[s ++] = curNormalUVY;
        allNormalUVs[s ++] = curNormalUVZ;
        allNormalUVs[s ++] = curNormalUVW;
      }

      if (hasSpecularMap){
        allSpecularUVs[a ++] = curSpecularUVX;
        allSpecularUVs[a ++] = curSpecularUVY;
        allSpecularUVs[a ++] = curSpecularUVZ;
        allSpecularUVs[a ++] = curSpecularUVW;
      }

      if (hasAlphaMap){
        allAlphaUVs[b ++] = curAlphaUVX;
        allAlphaUVs[b ++] = curAlphaUVY;
        allAlphaUVs[b ++] = curAlphaUVZ;
        allAlphaUVs[b ++] = curAlphaUVW;
      }

      if (hasRoughnessMap){
        allRoughnessUVs[c ++] = curRoughnessUVX;
        allRoughnessUVs[c ++] = curRoughnessUVY;
        allRoughnessUVs[c ++] = curRoughnessUVZ;
        allRoughnessUVs[c ++] = curRoughnessUVW;
      }

      if (hasMetalnessMap){
        allMetalnessUVs[d ++] = curMetalnessUVX;
        allMetalnessUVs[d ++] = curMetalnessUVY;
        allMetalnessUVs[d ++] = curMetalnessUVZ;
        allMetalnessUVs[d ++] = curMetalnessUVW;
      }

      if (hasEmissiveMap){
        allEmissiveUVs[e ++] = curEmissiveUVX;
        allEmissiveUVs[e ++] = curEmissiveUVY;
        allEmissiveUVs[e ++] = curEmissiveUVZ;
        allEmissiveUVs[e ++] = curEmissiveUVW;
      }

      if (hasAOMap){
        allAOUVs[f ++] = curAOUVX;
        allAOUVs[f ++] = curAOUVY;
        allAOUVs[f ++] = curAOUVZ;
        allAOUVs[f ++] = curAOUVW;
      }
    }

    var positionsBufferAttribute = new THREE.BufferAttribute(allPositions, 3);
    var colorsBufferAttribute = new THREE.BufferAttribute(allColors, 3);
    var normalsBufferAttribute = new THREE.BufferAttribute(allNormals, 3);
    var uvsBufferAttribute = new THREE.BufferAttribute(allUVs, 2);
    var diffuseUVsBufferAttribute = new THREE.BufferAttribute(allDiffuseUVs, 4);

    this.geometry.setIndex(indices);

    positionsBufferAttribute.setDynamic(false);
    colorsBufferAttribute.setDynamic(false);
    normalsBufferAttribute.setDynamic(false);
    uvsBufferAttribute.setDynamic(false);
    diffuseUVsBufferAttribute.setDynamic(false);

    this.geometry.addAttribute("position", positionsBufferAttribute);
    this.geometry.addAttribute("color", colorsBufferAttribute);
    this.geometry.addAttribute("normal", normalsBufferAttribute);
    this.geometry.addAttribute("uv", uvsBufferAttribute);
    this.geometry.addAttribute("diffuseUV", diffuseUVsBufferAttribute);

    if (hasNormalMap){
      var normalUVsBufferAttribute = new THREE.BufferAttribute(allNormalUVs, 4);
      normalUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("normalUV", normalUVsBufferAttribute);
    }

    if (hasSpecularMap){
      var specularUVsBufferAttribute = new THREE.BufferAttribute(allSpecularUVs, 4);
      specularUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("specularUV", specularUVsBufferAttribute);
    }

    if (hasAlphaMap){
      var alphaUVsBufferAttribute = new THREE.BufferAttribute(allAlphaUVs, 4);
      alphaUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("alphaUV", alphaUVsBufferAttribute);
    }

    if (hasRoughnessMap){
      var roughnessUVsBufferAttribute = new THREE.BufferAttribute(allRoughnessUVs, 4);
      roughnessUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("roughnessUV", roughnessUVsBufferAttribute);
    }

    if (hasMetalnessMap){
      var metalnessUVsBufferAttribute = new THREE.BufferAttribute(allMetalnessUVs, 4);
      metalnessUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("metalnessUV", metalnessUVsBufferAttribute);
    }

    if (hasEmissiveMap){
      var emissiveUVsBufferAttribute = new THREE.BufferAttribute(allEmissiveUVs, 4);
      emissiveUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("emissiveUV", emissiveUVsBufferAttribute);
    }

    if (hasAOMap){
      var aoUVsBufferAttribute = new THREE.BufferAttribute(allAOUVs, 4);
      aoUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("aoUV", aoUVsBufferAttribute);
    }
  }else{
    var positionsBufferAttribute = new THREE.BufferAttribute(positions, 3);
    var colorsBufferAttribute = new THREE.BufferAttribute(colors, 3);
    var normalsBufferAttribute = new THREE.BufferAttribute(normals, 3);
    var uvsBufferAttribute = new THREE.BufferAttribute(uvs, 2);
    var diffuseUVsBufferAttribute = new THREE.BufferAttribute(diffuseUVs, 4);

    this.geometry.setIndex(indices);

    positionsBufferAttribute.setDynamic(false);
    colorsBufferAttribute.setDynamic(false);
    normalsBufferAttribute.setDynamic(false);
    uvsBufferAttribute.setDynamic(false);
    diffuseUVsBufferAttribute.setDynamic(false);

    this.geometry.addAttribute("position", positionsBufferAttribute);
    this.geometry.addAttribute("color", colorsBufferAttribute);
    this.geometry.addAttribute("normal", normalsBufferAttribute);
    this.geometry.addAttribute("uv", uvsBufferAttribute);
    this.geometry.addAttribute("diffuseUV", diffuseUVsBufferAttribute);

    if (hasNormalMap){
      var normalUVsBufferAttribute = new THREE.BufferAttribute(normalUVs, 4);
      normalUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("normalUV", normalUVsBufferAttribute);
    }

    if (hasSpecularMap){
      var specularUVsBufferAttribute = new THREE.BufferAttribute(specularUVs, 4);
      specularUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("specularUV", specularUVsBufferAttribute);
    }

    if (hasAlphaMap){
      var alphaUVsBufferAttribute = new THREE.BufferAttribute(alphaUVs, 4);
      alphaUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("alphaUV", alphaUVsBufferAttribute);
    }

    if (hasRoughnessMap){
      var roughnessUVsBufferAttribute = new THREE.BufferAttribute(roughnessUVs, 4);
      roughnessUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("roughnessUV", roughnessUVsBufferAttribute);
    }

    if (hasMetalnessMap){
      var metalnessUVsBufferAttribute = new THREE.BufferAttribute(metalnessUVs, 4);
      metalnessUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("metalnessUV", metalnessUVsBufferAttribute);
    }

    if (hasEmissiveMap){
      var emissiveUVsBufferAttribute = new THREE.BufferAttribute(emissiveUVs, 4);
      emissiveUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("emissiveUV", emissiveUVsBufferAttribute);
    }

    if (hasAOMap){
      var aoUVsBufferAttribute = new THREE.BufferAttribute(aoUVs, 4);
      aoUVsBufferAttribute.setDynamic(false);
      this.geometry.addAttribute("aoUV", aoUVsBufferAttribute);
    }
  }

  if (modelInfo.centerGeometry){
    this.geometry.center();
  }

  this.info = modelInfo;
  this.texturesObj = texturesObj;

  this.group = new THREE.Group();
  for (var i = 0; i < modelInfo.childInfos.length; i ++){
    this.group.add(new THREE.Object3D());
  }

  var hiddenFlagsArray;

  if (!isDeployment){
    hiddenFlagsArray = new Float32Array(this.indexedMaterialIndices.length);
  }

  var metalnessRoughnessArray = new Float32Array(this.indexedMaterialIndices.length * 2);
  var i2 = 0;
  var i3 = 0;
  for (var i = 0; i < this.indexedMaterialIndices.length; i ++){
    var childIndex = this.indexedMaterialIndices[i];
    var childInfo = this.info.childInfos[childIndex];
    metalnessRoughnessArray[i2 ++] = childInfo.metalness;
    metalnessRoughnessArray[i2 ++] = childInfo.roughness;

    if (!isDeployment){
      hiddenFlagsArray[i3 ++] = -100.0;
    }
  }

  this.geometry.addAttribute("metalnessRoughness", new THREE.BufferAttribute(metalnessRoughnessArray, 2));

  if (!isDeployment){
    this.geometry.addAttribute("hiddenFlag", new THREE.BufferAttribute(hiddenFlagsArray, 1));
  }

  var materialIndexBufferAttribute = new THREE.BufferAttribute(new Float32Array(this.indexedMaterialIndices), 1);
  materialIndexBufferAttribute.setDynamic(false);
  this.geometry.addAttribute("materialIndex", materialIndexBufferAttribute);
}

Model.prototype.export = function(isBuildingForDeploymentMode){
  if (!isBuildingForDeploymentMode){
    return this.info;
  }

  this.info.texturesObj = {};
  for (var textureURL in this.texturesObj){
    this.info.texturesObj[textureURL] = true;
  }

  return this.info;
}

Model.prototype.getUsedTextures = function(){
  if (this.usedTexturesCache){
    return this.usedTexturesCache;
  }

  var childInfos = this.info.childInfos;
  var usedTextures = [];

  var obj = isDeployment? this.info.texturesObj: this.texturesObj;

  for (var textureURL in obj){
    var textureID;
    for (var i = 0; i < this.info.childInfos.length; i ++){
      if (this.info.childInfos[i].diffuseTextureURL == textureURL){
        textureID = this.info.childInfos[i].diffuseTextureID;
      }
      if (this.info.childInfos[i].normalTextureURL == textureURL){
        textureID = this.info.childInfos[i].normalTextureID;
      }
      if (this.info.childInfos[i].specularTextureURL == textureURL){
        textureID = this.info.childInfos[i].specularTextureID;
      }
      if (this.info.childInfos[i].alphaTextureURL == textureURL){
        textureID = this.info.childInfos[i].alphaTextureID;
      }
      if (this.info.childInfos[i].roughnessTextureURL == textureURL){
        textureID = this.info.childInfos[i].roughnessTextureID;
      }
      if (this.info.childInfos[i].metalnessTextureURL == textureURL){
        textureID = this.info.childInfos[i].metalnessTextureID;
      }
      if (this.info.childInfos[i].emissiveTextureURL == textureURL){
        textureID = this.info.childInfos[i].emissiveTextureID;
      }
      if (this.info.childInfos[i].aoTextureURL == textureURL){
        textureID = this.info.childInfos[i].aoTextureID;
      }
    }
    usedTextures.push({
      id: textureID,
      texture: obj[textureURL],
      url: textureURL
    });
  }

  this.usedTexturesCache = usedTextures;
  return usedTextures;
}

Model.prototype.onTextureAtlasRefreshed = function(){

  if (!isDeployment){
    for (var miName in modelInstances){
      if (modelInstances[miName].model.name != this.name){
        continue;
      }

      if (modelInstances[miName].isCompressed){
        setTimeout(function(){
          terminal.printError(Text.MODEL_HAS_COMPRESSED_MODEL_INSTANCE_TEXTURE_REFRESH.replace(Text.PARAM1, this.name));
        }.bind({name: this.name}), 0);
        return;
      }
    }
  }

  var diffuseUVAry = this.geometry.attributes.diffuseUV.array;
  var normalUVAry = this.info.hasNormalMap? this.geometry.attributes.normalUV.array: null;
  var specularUVAry = this.info.hasSpecularMap? this.geometry.attributes.specularUV.array: null;
  var alphaUVAry = this.info.hasAlphaMap? this.geometry.attributes.alphaUV.array: null;
  var roughnessUVAry = this.info.hasRoughnessMap? this.geometry.attributes.roughnessUV.array: null;
  var metalnessUVAry = this.info.hasMetalnessMap? this.geometry.attributes.metalnessUV.array: null;
  var emissiveUVAry = this.info.hasEmissiveMap? this.geometry.attributes.emissiveUV.array: null;
  var aoUVAry = this.info.hasAOMap? this.geometry.attributes.aoUV.array: null;
  var diffuseUVIndex = 0, normalUVIndex = 0, specularUVIndex = 0, alphaUVIndex = 0, roughnessUVIndex = 0, metalnessUVIndex = 0, emissiveUVIndex = 0, aoUVIndex = 0;
  var ranges = textureAtlasHandler.textureMerger.ranges;
  for (var i = 0; i < this.indexedMaterialIndices.length; i ++){
    var materialIndex = this.indexedMaterialIndices[i];
    var childInfo = this.info.childInfos[materialIndex];
    if (childInfo.diffuseTextureID){
      var range = ranges[childInfo.diffuseTextureID];
      diffuseUVAry[diffuseUVIndex ++] = range.startU;
      diffuseUVAry[diffuseUVIndex ++] = range.startV;
      diffuseUVAry[diffuseUVIndex ++] = range.endU;
      diffuseUVAry[diffuseUVIndex ++] = range.endV;
    }else{
      diffuseUVIndex += 4;
    }

    if (normalUVAry){
      if (childInfo.normalTextureID){
        var range = ranges[childInfo.normalTextureID];
        normalUVAry[normalUVIndex ++] = range.startU;
        normalUVAry[normalUVIndex ++] = range.startV;
        normalUVAry[normalUVIndex ++] = range.endU;
        normalUVAry[normalUVIndex ++] = range.endV;
      }else{
        normalUVIndex += 4;
      }
    }

    if (specularUVAry){
      if (childInfo.specularTextureID){
        var range = ranges[childInfo.specularTextureID];
        specularUVAry[specularUVIndex ++] = range.startU;
        specularUVAry[specularUVIndex ++] = range.startV;
        specularUVAry[specularUVIndex ++] = range.endU;
        specularUVAry[specularUVIndex ++] = range.endV;
      }else{
        specularUVIndex += 4;
      }
    }

    if (alphaUVAry){
      if (childInfo.alphaTextureID){
        var range = ranges[childInfo.alphaTextureID];
        alphaUVAry[alphaUVIndex ++] = range.startU;
        alphaUVAry[alphaUVIndex ++] = range.startV;
        alphaUVAry[alphaUVIndex ++] = range.endU;
        alphaUVAry[alphaUVIndex ++] = range.endV;
      }else{
        alphaUVIndex += 4;
      }
    }

    if (roughnessUVAry){
      if (childInfo.roughnessTextureID){
        var range = ranges[childInfo.roughnessTextureID];
        roughnessUVAry[roughnessUVIndex ++] = range.startU;
        roughnessUVAry[roughnessUVIndex ++] = range.startV;
        roughnessUVAry[roughnessUVIndex ++] = range.endU;
        roughnessUVAry[roughnessUVIndex ++] = range.endV;
      }else{
        roughnessUVIndex += 4;
      }
    }

    if (metalnessUVAry){
      if (childInfo.metalnessTextureID){
        var range = ranges[childInfo.metalnessTextureID];
        metalnessUVAry[metalnessUVIndex ++] = range.startU;
        metalnessUVAry[metalnessUVIndex ++] = range.startV;
        metalnessUVAry[metalnessUVIndex ++] = range.endU;
        metalnessUVAry[metalnessUVIndex ++] = range.endV;
      }else{
        metalnessUVIndex += 4;
      }
    }

    if (emissiveUVAry){
      if (childInfo.emissiveTextureID){
        var range = ranges[childInfo.emissiveTextureID];
        emissiveUVAry[emissiveUVIndex ++] = range.startU;
        emissiveUVAry[emissiveUVIndex ++] = range.startV;
        emissiveUVAry[emissiveUVIndex ++] = range.endU;
        emissiveUVAry[emissiveUVIndex ++] = range.endV;
      }else{
        emissiveUVIndex += 4;
      }
    }

    if (aoUVAry){
      if (childInfo.aoTextureID){
        var range = ranges[childInfo.aoTextureID];
        aoUVAry[aoUVIndex ++] = range.startU;
        aoUVAry[aoUVIndex ++] = range.startV;
        aoUVAry[aoUVIndex ++] = range.endU;
        aoUVAry[aoUVIndex ++] = range.endV;
      }else{
        aoUVIndex += 4;
      }
    }
  }

  this.geometry.attributes.diffuseUV.updateRange.set(0, diffuseUVAry.length);
  this.geometry.attributes.diffuseUV.needsUpdate = true;

  if (normalUVAry){
    this.geometry.attributes.normalUV.updateRange.set(0, normalUVAry.length);
    this.geometry.attributes.normalUV.needsUpdate = true;
  }

  if (specularUVAry){
    this.geometry.attributes.specularUV.updateRange.set(0, specularUVAry.length);
    this.geometry.attributes.specularUV.needsUpdate = true;
  }

  if (alphaUVAry){
    this.geometry.attributes.alphaUV.updateRange.set(0, alphaUVAry.length);
    this.geometry.attributes.alphaUV.needsUpdate = true;
  }

  if (roughnessUVAry){
    this.geometry.attributes.roughnessUV.updateRange.set(0, roughnessUVAry.length);
    this.geometry.attributes.roughnessUV.needsUpdate = true;
  }

  if (metalnessUVAry){
    this.geometry.attributes.metalnessUV.updateRange.set(0, metalnessUVAry.length);
    this.geometry.attributes.metalnessUV.needsUpdate = true;
  }

  if (emissiveUVAry){
    this.geometry.attributes.emissiveUV.updateRange.set(0, emissiveUVAry.length);
    this.geometry.attributes.emissiveUV.needsUpdate = true;
  }

  if (aoUVAry){
    this.geometry.attributes.aoUV.updateRange.set(0, aoUVAry.length);
    this.geometry.attributes.aoUV.needsUpdate = true;
  }
}

Model.prototype.loadTextures = function(callback){
  var texturesToLoad = {};
  var texturesObj = {};
  for (var i = 0; i < this.info.childInfos.length; i ++){
    var diffuseTextureURL = this.info.childInfos[i].diffuseTextureURL;
    var normalTextureURL = this.info.childInfos[i].normalTextureURL;
    var specularTextureURL = this.info.childInfos[i].specularTextureURL;
    var alphaTextureURL = this.info.childInfos[i].alphaTextureURL;
    var roughnessTextureURL = this.info.childInfos[i].roughnessTextureURL;
    var metalnessTextureURL = this.info.childInfos[i].metalnessTextureURL;
    var emissiveTextureURL = this.info.childInfos[i].emissiveTextureURL;
    var aoTextureURL = this.info.childInfos[i].aoTextureURL;
    var diffuseTextureID = this.info.childInfos[i].diffuseTextureID;
    var normalTextureID = this.info.childInfos[i].normalTextureID;
    var specularTextureID = this.info.childInfos[i].specularTextureID;
    var alphaTextureID = this.info.childInfos[i].alphaTextureID;
    var roughnessTextureID = this.info.childInfos[i].roughnessTextureID;
    var metalnessTextureID = this.info.childInfos[i].metalnessTextureID;
    var emissiveTextureID = this.info.childInfos[i].emissiveTextureID;
    var aoTextureID = this.info.childInfos[i].aoTextureID;
    if (diffuseTextureURL){
      texturesToLoad[diffuseTextureURL] = diffuseTextureID;
    }
    if (normalTextureURL){
      texturesToLoad[normalTextureURL] = normalTextureID;
    }
    if (specularTextureURL){
      texturesToLoad[specularTextureURL] = specularTextureID;
    }
    if (alphaTextureURL){
      texturesToLoad[alphaTextureURL] = alphaTextureID;
    }
    if (roughnessTextureURL){
      texturesToLoad[roughnessTextureURL] = roughnessTextureID;
    }
    if (metalnessTextureURL){
      texturesToLoad[metalnessTextureURL] = metalnessTextureID;
    }
    if (emissiveTextureURL){
      texturesToLoad[emissiveTextureURL] = emissiveTextureID;
    }
    if (aoTextureURL){
      texturesToLoad[aoTextureURL] = aoTextureID;
    }
  }

  if (Object.keys(texturesToLoad).length == 0){
    callback();
    return;
  }

  var loadedCount = 0;
  for (var textureURL in texturesToLoad){
    var textureID = texturesToLoad[textureURL];
    var tmpCanvas = document.createElement("canvas");
    var tmpContext = tmpCanvas.getContext("2d");
    tmpCanvas.width = ACCEPTED_TEXTURE_SIZE;
    tmpCanvas.height = ACCEPTED_TEXTURE_SIZE;
    var tmpImg = new Image();
    var that = this;
    tmpImg.onload = function() {
      this.context.drawImage(this.img, 0, 0);
      texturesObj[this.src] = new THREE.CanvasTexture(this.canvas);
      loadedCount ++;
      if (loadedCount == Object.keys(texturesToLoad).length){
        that.texturesObj = texturesObj;
        callback();
      }
    }.bind({context: tmpContext, img: tmpImg, textureID: textureID, canvas: tmpCanvas, src: textureURL});
    tmpImg.src = textureURL;
  }
}

Model.prototype.destroy = function(){
  this.geometry.dispose();
  var geomKey = "MODEL" + PIPE + this.info.folderName
  delete geometryCache[geomKey];

  for (var key in this.texturesObj){
    this.texturesObj[key].dispose();
  }
}

Model.prototype.supportsCustomTextures = function(){
  var usedTextures = this.getUsedTextures();

  return !(usedTextures.length == 0 || usedTextures.length > 6);
}

Model.prototype.enableCustomTextures = function(){
  var diffuseTextureIndexByTextureID = {};
  var normalTextureIndexByTextureID = {};
  var specularTextureIndexByTextureID = {};
  var alphaTextureIndexByTextureID = {};
  var roughnessTextureIndexByTextureID = {};
  var metalnessTextureIndexByTextureID = {};
  var emissiveTextureIndexByTextureID = {};
  var aoTextureIndexByTextureID = {};
  var curTextureIndex = 0;

  var diffuseTextureIndices = new Float32Array(this.indexedMaterialIndices.length);
  var normalTextureIndices = this.info.hasNormalMap? new Float32Array(this.indexedMaterialIndices.length): null;
  var specularTextureIndices = this.info.hasSpecularMap? new Float32Array(this.indexedMaterialIndices.length): null;
  var alphaTextureIndices = this.info.hasAlphaMap? new Float32Array(this.indexedMaterialIndices.length): null;
  var roughnessTextureIndices = this.info.hasRoughnessMap? new Float32Array(this.indexedMaterialIndices.length): null;
  var metalnessTextureIndices = this.info.hasMetalnessMap? new Float32Array(this.indexedMaterialIndices.length): null;
  var emissiveTextureIndices = this.info.hasEmissiveMap? new Float32Array(this.indexedMaterialIndices.length): null;
  var aoTextureIndices = this.info.hasAOMap? new Float32Array(this.indexedMaterialIndices.length): null;

  for (var i = 0; i < this.indexedMaterialIndices.length; i ++){
    var materialIndex = this.indexedMaterialIndices[i];
    var material = this.info.childInfos[materialIndex];
    if (material.diffuseTextureID){
      if (typeof diffuseTextureIndexByTextureID[material.diffuseTextureID] == UNDEFINED){
        diffuseTextureIndexByTextureID[material.diffuseTextureID] = curTextureIndex ++;
      }

      diffuseTextureIndices[i] = diffuseTextureIndexByTextureID[material.diffuseTextureID];
    }else{
      diffuseTextureIndices[i] = -100;
    }

    if (this.info.hasNormalMap){
      if (material.normalTextureID){
        if (typeof normalTextureIndexByTextureID[material.normalTextureID] == UNDEFINED){
          normalTextureIndexByTextureID[material.normalTextureID] = curTextureIndex ++;
        }

        normalTextureIndices[i] = normalTextureIndexByTextureID[material.normalTextureID];
      }else{
        normalTextureIndices[i] = -100;
      }
    }

    if (this.info.hasSpecularMap){
      if (material.specularTextureID){
        if (typeof specularTextureIndexByTextureID[material.specularTextureID] == UNDEFINED){
          specularTextureIndexByTextureID[material.specularTextureID] = curTextureIndex ++;
        }

        specularTextureIndices[i] = specularTextureIndexByTextureID[material.specularTextureID];
      }else{
        specularTextureIndices[i] = -100;
      }
    }

    if (this.info.hasAlphaMap){
      if (material.alphaTextureID){
        if (typeof alphaTextureIndexByTextureID[material.alphaTextureID] == UNDEFINED){
          alphaTextureIndexByTextureID[material.alphaTextureID] = curTextureIndex ++;
        }

        alphaTextureIndices[i] = alphaTextureIndexByTextureID[material.alphaTextureID];
      }else{
        alphaTextureIndices[i] = -100;
      }
    }

    if (this.info.hasRoughnessMap){
      if (material.roughnessTextureID){
        if (typeof roughnessTextureIndexByTextureID[material.roughnessTextureID] == UNDEFINED){
          roughnessTextureIndexByTextureID[material.roughnessTextureID] = curTextureIndex ++;
        }

        roughnessTextureIndices[i] = roughnessTextureIndexByTextureID[material.roughnessTextureID];
      }else{
        roughnessTextureIndices[i] = -100;
      }
    }

    if (this.info.hasMetalnessMap){
      if (material.metalnessTextureID){
        if (typeof metalnessTextureIndexByTextureID[material.metalnessTextureID] == UNDEFINED){
          metalnessTextureIndexByTextureID[material.metalnessTextureID] = curTextureIndex ++;
        }

        metalnessTextureIndices[i] = metalnessTextureIndexByTextureID[material.metalnessTextureID];
      }else{
        metalnessTextureIndices[i] = -100;
      }
    }

    if (this.info.hasAOMap){
      if (material.aoTextureID){
        if (typeof aoTextureIndexByTextureID[material.aoTextureID] == UNDEFINED){
          aoTextureIndexByTextureID[material.aoTextureID] = curTextureIndex ++;
        }

        aoTextureIndices[i] = aoTextureIndexByTextureID[material.aoTextureID];
      }else{
        aoTextureIndices[i] = -100;
      }
    }

    if (this.info.hasEmissiveMap){
      if (material.emissiveTextureID){
        if (typeof emissiveTextureIndexByTextureID[material.emissiveTextureID] == UNDEFINED){
          emissiveTextureIndexByTextureID[material.emissiveTextureID] = curTextureIndex ++;
        }

        emissiveTextureIndices[i] = emissiveTextureIndexByTextureID[material.emissiveTextureID];
      }else{
        emissiveTextureIndices[i] = -100;
      }
    }
  }

  var diffuseTextureIndexBufferAttribute = new THREE.BufferAttribute(diffuseTextureIndices, 1);
  diffuseTextureIndexBufferAttribute.setDynamic(false);
  this.geometry.addAttribute("diffuseTextureIndex", diffuseTextureIndexBufferAttribute);

  this.info.customTexturesEnabled = true;
  this.diffuseTextureIndexByTextureID = diffuseTextureIndexByTextureID;
  this.normalTextureIndexByTextureID = normalTextureIndexByTextureID;
  this.specularTextureIndexByTextureID = specularTextureIndexByTextureID;
  this.alphaTextureIndexByTextureID = alphaTextureIndexByTextureID;
  this.roughnessTextureIndexByTextureID = roughnessTextureIndexByTextureID;
  this.metalnessTextureIndexByTextureID = metalnessTextureIndexByTextureID;
  this.emissiveTextureIndexByTextureID = emissiveTextureIndexByTextureID;
  this.aoTextureIndexByTextureID = aoTextureIndexByTextureID;

  if (this.info.hasNormalMap){
    var normalTextureIndexBufferAttribute = new THREE.BufferAttribute(normalTextureIndices, 1);
    normalTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("normalTextureIndex", normalTextureIndexBufferAttribute);
  }

  if (this.info.hasSpecularMap){
    var specularTextureIndexBufferAttribute = new THREE.BufferAttribute(specularTextureIndices, 1);
    specularTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("specularTextureIndex", specularTextureIndexBufferAttribute);
  }

  if (this.info.hasAlphaMap){
    var alphaTextureIndexBufferAttribute = new THREE.BufferAttribute(alphaTextureIndices, 1);
    alphaTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("alphaTextureIndex", alphaTextureIndexBufferAttribute);
  }

  if (this.info.hasRoughnessMap){
    var roughnessTextureIndexBufferAttribute = new THREE.BufferAttribute(roughnessTextureIndices, 1);
    roughnessTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("roughnessTextureIndex", roughnessTextureIndexBufferAttribute);
  }

  if (this.info.hasMetalnessMap){
    var metalnessTextureIndexBufferAttribute = new THREE.BufferAttribute(metalnessTextureIndices, 1);
    metalnessTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("metalnessTextureIndex", metalnessTextureIndexBufferAttribute);
  }

  if (this.info.hasEmissiveMap){
    var emissiveTextureIndexBufferAttribute = new THREE.BufferAttribute(emissiveTextureIndices, 1);
    emissiveTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("emissiveTextureIndex", emissiveTextureIndexBufferAttribute);
  }

  if (this.info.hasAOMap){
    var aoTextureIndexBufferAttribute = new THREE.BufferAttribute(aoTextureIndices, 1);
    aoTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("aoTextureIndex", aoTextureIndexBufferAttribute);
  }
}

Model.prototype.disableCustomTextures = function(){
  delete this.diffuseTextureIndexByTextureID;
  delete this.normalTextureIndexByTextureID;
  delete this.specularTextureIndexByTextureID;
  delete this.alphaTextureIndexByTextureID;
  delete this.roughnessTextureIndexByTextureID;
  delete this.metalnessTextureIndexByTextureID;
  delete this.emissiveTextureIndexByTextureID;
  delete this.aoTextureIndexByTextureID;

  this.geometry.removeAttribute("diffuseTextureIndex");
  this.info.customTexturesEnabled = false;

  if (this.info.hasNormalMap){
    this.geometry.removeAttribute("normalTextureIndex");
  }

  if (this.info.hasSpecularMap){
    this.geometry.removeAttribute("specularTextureIndex");
  }

  if (this.info.hasAlphaMap){
    this.geometry.removeAttribute("alphaTextureIndex");
  }

  if (this.info.hasRoughnessMap){
    this.geometry.removeAttribute("roughnessTextureIndex");
  }

  if (this.info.hasMetalnessMap){
    this.geometry.removeAttribute("metalnessTextureIndex");
  }

  if (this.info.hasEmissiveMap){
    this.geometry.removeAttribute("emissiveTextureIndex");
  }

  if (this.info.hasAOMap){
    this.geometry.removeAttribute("aoTextureIndex");
  }
}

Model.prototype.setARModelNames = function(arModelNames){
  this.info.arModelNames = {};
  for (var i = 0; i < arModelNames.length; i ++){
    this.info.arModelNames[arModelNames[i]] = true;
  }
}

Model.prototype.hasARModel = function(modelName){
  return !!this.info.arModelNames[modelName];
}

Model.prototype.setMetalnessRoughness = function(isMetalness, val, childIndex){
  var ary = this.indexedMaterialIndices;
  var metalnessRoughnessArray = this.geometry.attributes.metalnessRoughness.array;

  var i2 = 0;
  for (var i = 0; i < ary.length; i ++){
    var index = ary[i];
    if (index == childIndex){
      if (isMetalness){
        metalnessRoughnessArray[i2] = val;
      }else{
        metalnessRoughnessArray[i2 + 1] = val;
      }
    }

    i2 += 2;
  }

  this.geometry.attributes.metalnessRoughness.updateRange.set(0, metalnessRoughnessArray.length);
  this.geometry.attributes.metalnessRoughness.needsUpdate = true;

  if (isMetalness){
    this.info.childInfos[childIndex].metalness = val;
  }else{
    this.info.childInfos[childIndex].roughness = val;
  }
}
