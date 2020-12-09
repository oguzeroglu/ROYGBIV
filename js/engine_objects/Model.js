var Model = function(modelInfo, texturesObj, positions, normals, uvs, colors, diffuseUVs, materialIndices){
  this.name = modelInfo.name;

  var geomKey = "MODEL" + PIPE + modelInfo.folderName
  if (geometryCache[geomKey]){
    this.geometry = geometryCache[geomKey]
  }else{
    this.geometry = new THREE.BufferGeometry();
    geometryCache[geomKey] = this.geometry;

    var positionsTypedArray = new Float32Array(positions);
    var colorsTypedArray = new Float32Array(colors);
    var normalsTypedArray = new Float32Array(normals);
    var uvsTypedArray = new Float32Array(uvs);
    var diffuseUVsTypedArray = new Float32Array(diffuseUVs);

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

    this.geometry.center();
  }

  this.info = modelInfo;
  this.texturesObj = texturesObj;
  this.materialIndices = materialIndices;
}

Model.prototype.export = function(){
  return this.info;
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
