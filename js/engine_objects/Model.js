var Model = function(modelInfo, texturesObj){
  this.name = modelInfo.name;

  var geomKey = "MODEL" + PIPE + modelInfo.folderName
  if (geometryCache[geomKey]){
    this.geometry = geometryCache[geomKey]
  }else{
    this.geometry = new THREE.BufferGeometry();
    geometryCache[geomKey] = this.geometry;

    var positionsTypedArray = new Float32Array(modelInfo.positionsAry);
    var colorsTypedArray = new Float32Array(modelInfo.colorsAry);
    var normalsTypedArray = new Float32Array(modelInfo.normalsAry);
    var uvsTypedArray = new Float32Array(modelInfo.uvsAry);
    var diffuseUVsTypedArray = new Float32Array(modelInfo.diffuseUVsAry);

    var positionsBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
    var colorsBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
    var normalsBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
    var uvsBufferAttribute = new THREE.BufferAttribute(uvsTypedArray, 2);
    var diffuseUVsBufferAttribute = new THREE.BufferAttribute(diffuseUVsTypedArray, 4);

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
  }

  this.info = modelInfo;
  this.texturesObj = texturesObj;
}

Model.prototype.getUsedTextures = function(){
  var childInfos = this.info.childInfos;
  var usedTextures = [];

  for (var textureURL in this.texturesObj){
    var textureID = null;
    for (var i = 0; i < this.info.childInfos.length; i ++){
      if (this.info.childInfos[i].diffuseTextureURL == textureURL){
        textureID = this.info.childInfos[i].diffuseTextureID;
      }
    }
    usedTextures.push({
      id: textureID,
      texture: this.texturesObj[textureURL]
    });
  }

  return usedTextures;
}

Model.prototype.onTextureAtlasRefreshed = function(){
  var diffuseUVAry = this.geometry.attributes.diffuseUV.array;
  var diffuseUVIndex = 0;
  var ranges = textureAtlasHandler.textureMerger.ranges;
  for (var i = 0; i < this.info.materialIndices.length; i ++){
    var materialIndex = this.info.materialIndices[i];
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
