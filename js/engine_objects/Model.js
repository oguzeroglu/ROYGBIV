var Model = function(modelInfo, texturesObj, positions, normals, uvs, colors, diffuseUVs, materialIndices){
  this.name = modelInfo.name;

  var geomKey = "MODEL" + PIPE + modelInfo.folderName
  if (geometryCache[geomKey]){
    this.geometry = geometryCache[geomKey]
  }else{
    this.geometry = new THREE.BufferGeometry();
    geometryCache[geomKey] = this.geometry;

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
      var curMaterialIndex = materialIndices[i3];
      var key = curPosX + PIPE + curPosY + PIPE + curPosZ;
      key += PIPE + curNormalX + PIPE + curNormalY + PIPE + curNormalZ;
      key += PIPE + curUVX + PIPE + curUVY;
      key += PIPE + curDiffuseUVX + PIPE + curDiffuseUVY + PIPE + curDiffuseUVZ + PIPE + curDiffuseUVW;
      key += PIPE + curColorR + PIPE + curColorG + PIPE + curColorB;
      if (indexInfos[key]){
        indexHitCount ++;
        indices.push(indexInfos[key]);
      }else{
        indexInfos[key] = curIndex;
        indexInfosInverse[curIndex] = key;
        indices.push(curIndex);
        curIndex ++;
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

    var x = 0, y = 0, z = 0, w = 0, t = 0;
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

    this.geometry.center();
  }

  this.info = modelInfo;
  this.texturesObj = texturesObj;
  this.materialIndices = materialIndices;
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
  var childInfos = this.info.childInfos;
  var usedTextures = [];

  var obj = isDeployment? this.info.texturesObj: this.texturesObj;

  for (var textureURL in obj){
    var textureID = null;
    for (var i = 0; i < this.info.childInfos.length; i ++){
      if (this.info.childInfos[i].diffuseTextureURL == textureURL){
        textureID = this.info.childInfos[i].diffuseTextureID;
      }
    }
    usedTextures.push({
      id: textureID,
      texture: obj[textureURL]
    });
  }

  return usedTextures;
}

Model.prototype.onTextureAtlasRefreshed = function(){
  var diffuseUVAry = this.geometry.attributes.diffuseUV.array;
  var diffuseUVIndex = 0;
  var ranges = textureAtlasHandler.textureMerger.ranges;
  for (var i = 0; i < this.materialIndices.length; i ++){
    var materialIndex = this.materialIndices[i];
    var childInfo = this.info.childInfos[materialIndex];
    if (childInfo.diffuseTextureID){
      var range = ranges[childInfo.diffuseTextureID];
      diffuseUVAry[diffuseUVIndex ++] = range.startU;
      diffuseUVAry[diffuseUVIndex ++] = range.startV;
      diffuseUVAry[diffuseUVIndex ++] = range.endU;
      diffuseUVAry[diffuseUVIndex ++] = range.endV;
      diffuseUVAry[diffuseUVIndex ++] = range.startU;
      diffuseUVAry[diffuseUVIndex ++] = range.startV;
      diffuseUVAry[diffuseUVIndex ++] = range.endU;
      diffuseUVAry[diffuseUVIndex ++] = range.endV;
      diffuseUVAry[diffuseUVIndex ++] = range.startU;
      diffuseUVAry[diffuseUVIndex ++] = range.startV;
      diffuseUVAry[diffuseUVIndex ++] = range.endU;
      diffuseUVAry[diffuseUVIndex ++] = range.endV;
    }else{
      diffuseUVIndex += 12;
    }
  }

  this.geometry.attributes.diffuseUV.updateRange.set(0, diffuseUVAry.length);
  this.geometry.attributes.diffuseUV.needsUpdate = true;
}

Model.prototype.loadTextures = function(callback){
  var texturesToLoad = {};
  var texturesObj = {};
  for (var i = 0; i < this.info.childInfos.length; i ++){
    var diffuseTextureURL = this.info.childInfos[i].diffuseTextureURL;
    var diffuseTextureID = this.info.childInfos[i].diffuseTextureID;
    if (diffuseTextureURL){
      texturesToLoad[diffuseTextureURL] = diffuseTextureID;
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
