var Model = function(modelInfo, texturesObj, positions, normals, uvs, colors, diffuseUVs, normalUVs, materialIndices, indices, indexedMaterialIndices){
  this.name = modelInfo.name;

  this.geometry = new THREE.BufferGeometry();

  this.indexedMaterialIndices = indexedMaterialIndices || [];

  var hasNormalMap = modelInfo.hasNormalMap;

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
      var curMaterialIndex = materialIndices[i3];
      var key = curPosX + PIPE + curPosY + PIPE + curPosZ;
      key += PIPE + curNormalX + PIPE + curNormalY + PIPE + curNormalZ;
      key += PIPE + curUVX + PIPE + curUVY;
      key += PIPE + curDiffuseUVX + PIPE + curDiffuseUVY + PIPE + curDiffuseUVZ + PIPE + curDiffuseUVW;
      key += PIPE + curColorR + PIPE + curColorG + PIPE + curColorB;
      key += PIPE + curNormalUVX + PIPE + curNormalUVY + PIPE + curNormalUVZ + PIPE + curNormalUVW;
      if (indexInfos[key]){
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

    this.indexHitCount = indexHitCount;
    var allPositions = new Float32Array(curIndex * 3);
    var allNormals = new Float32Array(curIndex * 3);
    var allUVs = new Float32Array(curIndex * 2);
    var allDiffuseUVs = new Float32Array(curIndex * 4);
    var allColors = new Float32Array(curIndex * 3);

    var allNormalUVs = hasNormalMap? new Float32Array(curIndex * 4): null;

    var x = 0, y = 0, z = 0, w = 0, t = 0, s = 0;
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
  }

  this.geometry.center();

  this.info = modelInfo;
  this.texturesObj = texturesObj;

  if (hasNormalMap){
    THREE.BufferGeometryUtils.computeTangents(this.geometry);
  }

  this.group = new THREE.Group();
  for (var i = 0; i < modelInfo.childInfos.length; i ++){
    this.group.add(new THREE.Object3D());
  }

  var metalnessRoughnessArray = new Float32Array(this.indexedMaterialIndices.length * 2);
  var i2 = 0;
  for (var i = 0; i < this.indexedMaterialIndices.length; i ++){
    var childIndex = this.indexedMaterialIndices[i];
    var childInfo = this.info.childInfos[childIndex];
    metalnessRoughnessArray[i2 ++] = childInfo.metalness;
    metalnessRoughnessArray[i2 ++] = childInfo.roughness;
  }

  this.geometry.addAttribute("metalnessRoughness", new THREE.BufferAttribute(metalnessRoughnessArray, 2));
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
  var diffuseUVAry = this.geometry.attributes.diffuseUV.array;
  var normalUVAry = this.info.hasNormalMap? this.geometry.attributes.normalUV.array: null;
  var diffuseUVIndex = 0, normalUVIndex = 0;
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
  }

  this.geometry.attributes.diffuseUV.updateRange.set(0, diffuseUVAry.length);
  this.geometry.attributes.diffuseUV.needsUpdate = true;

  if (normalUVAry){
    this.geometry.attributes.normalUV.updateRange.set(0, normalUVAry.length);
    this.geometry.attributes.normalUV.needsUpdate = true;
  }
}

Model.prototype.loadTextures = function(callback){
  var texturesToLoad = {};
  var texturesObj = {};
  for (var i = 0; i < this.info.childInfos.length; i ++){
    var diffuseTextureURL = this.info.childInfos[i].diffuseTextureURL;
    var normalTextureURL = this.info.childInfos[i].normalTextureURL;
    var diffuseTextureID = this.info.childInfos[i].diffuseTextureID;
    var normalTextureID = this.info.childInfos[i].normalTextureID;
    if (diffuseTextureURL){
      texturesToLoad[diffuseTextureURL] = diffuseTextureID;
    }
    if (normalTextureURL){
      texturesToLoad[normalTextureURL] = normalTextureID;
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

  return !(usedTextures.length == 0 || usedTextures.length > 5);
}

Model.prototype.enableCustomTextures = function(){
  var diffuseTextureIndexByTextureID = {};
  var normalTextureIndexByTextureID = {};
  var curTextureIndex = 0;

  var diffuseTextureIndices = new Float32Array(this.indexedMaterialIndices.length);
  var normalTextureIndices = this.info.hasNormalMap? new Float32Array(this.indexedMaterialIndices.length): null

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
  }

  var diffuseTextureIndexBufferAttribute = new THREE.BufferAttribute(diffuseTextureIndices, 1);
  diffuseTextureIndexBufferAttribute.setDynamic(false);
  this.geometry.addAttribute("diffuseTextureIndex", diffuseTextureIndexBufferAttribute);

  this.info.customTexturesEnabled = true;
  this.diffuseTextureIndexByTextureID = diffuseTextureIndexByTextureID;
  this.normalTextureIndexByTextureID = normalTextureIndexByTextureID;

  if (this.info.hasNormalMap){
    var normalTextureIndexBufferAttribute = new THREE.BufferAttribute(normalTextureIndices, 1);
    normalTextureIndexBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("normalTextureIndex", normalTextureIndexBufferAttribute);
  }
}

Model.prototype.disableCustomTextures = function(){
  delete this.diffuseTextureIndexByTextureID;
  delete this.normalTextureIndexByTextureID;

  this.geometry.removeAttribute("diffuseTextureIndex");
  this.info.customTexturesEnabled = false;

  if (this.info.hasNormalMap){
    this.geometry.removeAttribute("normalTextureIndex");
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
