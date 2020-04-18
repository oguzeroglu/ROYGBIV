var TextureAtlasHandler = function(){
  this.currentTextureCount = 0;
}

TextureAtlasHandler.prototype.getRangesForTexturePack = function(tp, type){
  return this.textureMerger.ranges[tp.name + "#" + type];
}

TextureAtlasHandler.prototype.getTextureUniform = function(){
  if (this.textureUniformCache){
    return this.textureUniformCache;
  }

  this.textureUniformCache = new THREE.Uniform(this.atlas.diffuseTexture);
  return this.textureUniformCache;
}

TextureAtlasHandler.prototype.dispose = function(){
  if (this.atlas){
    this.atlas.destroy();
    this.atlas = 0;
    delete this.textureUniformCache;
  }
}

TextureAtlasHandler.prototype.refreshUniforms = function(){
  for (var objName in addedObjects){
    addedObjects[objName].onTextureAtlasRefreshed();
  }
  for (var objName in objectGroups){
    objectGroups[objName].onTextureAtlasRefreshed();
  }
  for (var spriteName in sprites){
    sprites[spriteName].onTextureAtlasRefreshed();
  }
  for (var chName in crosshairs){
    crosshairs[chName].onTextureAtlasRefreshed();
  }
}

TextureAtlasHandler.prototype.compressTexture = function(base64Data, readyCallback, errorCallback, textureCount){
  var refreshUniforms = this.refreshUniforms;
  var postRequest = new XMLHttpRequest();
  var data = JSON.stringify({image: base64Data});
  postRequest.open("POST", "/compressTextureAtlas", true);
  postRequest.setRequestHeader('Content-Type', 'application/json');
  postRequest.onreadystatechange = function(err){
    if (postRequest.readyState == 4 && postRequest.status == 200){
      var resp = JSON.parse(postRequest.responseText);
      if (resp.error){
        errorCallback();
      }else{
        textureAtlasHandler.atlas = new TexturePack(null, null, {isAtlas: true});
        textureAtlasHandler.atlas.loadTextures(false, function(){
          textureAtlasHandler.currentTextureCount = textureCount;
          refreshUniforms();
          readyCallback();
        });
      }
    }
  }
  postRequest.onerror = function(){
    errorCallback();
  }
  postRequest.send(data);
}

TextureAtlasHandler.prototype.onTexturePackChange = function(readyCallback, errorCallback, force){
  var textureCount = 0;
  var texturesObj = new Object();
  for (var texturePackName in texturePacks){
    var tp = texturePacks[texturePackName];
    textureCount ++;
    texturesObj[texturePackName + "#diffuse"] = tp.diffuseTexture;
    if (tp.hasAlpha){
      texturesObj[texturePackName + "#alpha"] = tp.alphaTexture;
    }
    if (tp.hasAO){
      texturesObj[texturePackName + "#ao"] = tp.aoTexture;
    }
    if (tp.hasEmissive){
      texturesObj[texturePackName + "#emissive"] = tp.emissiveTexture;
    }
    if (tp.hasHeight){
      texturesObj[texturePackName + "#height"] = tp.heightTexture;
    }
  }
  if (force || this.currentTextureCount != textureCount){
    if (textureCount == 0){
      this.dispose();
      this.currentTextureCount = 0;
      readyCallback();
      return;
    }
    var textureMerger;
    try{
      textureMerger = new TextureMerger(texturesObj);
      this.dispose();
      this.textureMerger = textureMerger;
    }catch (err){
      console.error(err);
      errorCallback(true);
      return;
    }
    this.compressTexture(textureMerger.mergedTexture.image.toDataURL(), readyCallback, errorCallback, textureCount);
  }
}

TextureAtlasHandler.prototype.export = function(){
  var exportObject = new Object();
  if (this.atlas){
    exportObject.hasTextureAtlas = true;
    exportObject.ranges = this.textureMerger.ranges;
  }else{
    exportObject.hasTextureAtlas = false;
  }
  return exportObject;
}

TextureAtlasHandler.prototype.import = function(exportObject, readyCallback){
  if (isDeployment){
    this.textureMerger = new TextureMerger();
    this.textureMerger.ranges = JSON.parse(JSON.stringify(exportObject.ranges));
    textureAtlasHandler.atlas = new TexturePack(null, null, {isAtlas: true});
    textureAtlasHandler.atlas.loadTextures(false, function(){
      readyCallback();
    });
  }else{
    this.onTexturePackChange(readyCallback, readyCallback);
  }
}
