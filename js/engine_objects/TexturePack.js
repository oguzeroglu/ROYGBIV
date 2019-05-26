var TexturePack = function(name, directoryName, textureDescription){
  this.directoryName = directoryName;
  this.name = name;
  this.textureDescription = textureDescription;
  this.maxAttemptCount = 0;
  this.totalLoadedCount = 0;
  this.hasDiffuse = textureDescription.hasDiffuse;
  this.hasAlpha = textureDescription.hasAlpha;
  this.hasAO = textureDescription.hasAO;
  this.hasEmissive = textureDescription.hasEmissive;
  this.hasHeight = textureDescription.hasHeight;
  if (this.hasDiffuse){
    this.maxAttemptCount ++;
  }
  if (this.hasAlpha){
    this.maxAttemptCount ++;
  }
  if (this.hasAO){
    this.maxAttemptCount ++;
  }
  if (this.hasEmissive){
    this.maxAttemptCount ++;
  }
  if (this.hasHeight){
    this.maxAttemptCount ++;
  }
  this.diffuseFilePath = texturePackRootDirectory+directoryName+"/diffuse"+textureLoaderFactory.getFilePostfix();
  this.alphaFilePath = texturePackRootDirectory+directoryName+"/alpha"+textureLoaderFactory.getFilePostfix();
  this.aoFilePath = texturePackRootDirectory+directoryName+"/ao"+textureLoaderFactory.getFilePostfix();
  this.emissiveFilePath = texturePackRootDirectory+directoryName+"/emissive"+textureLoaderFactory.getFilePostfix();
  this.heightFilePath = texturePackRootDirectory+directoryName+"/height"+textureLoaderFactory.getFilePostfix();
  this.loader = textureLoaderFactory.get();
}

TexturePack.prototype.clone = function(){
  return new TexturePack(this.name, this.directoryName, this.textureDescription);
}

TexturePack.prototype.export = function(){
  var exportObject = new Object();
  exportObject.directoryName = this.directoryName;
  exportObject.name = this.name;
  exportObject.textureDescription = this.textureDescription;
  return exportObject;
}

TexturePack.prototype.destroy = function(){
  if (this.hasDiffuse){
    this.diffuseTexture.dispose();
  }
  if (this.hasAlpha){
    this.alphaTexture.dispose();
  }
  if (this.hasAO){
    this.aoTexture.dispose();
  }
  if (this.hasEmissive){
    this.emissiveTexture.dispose();
  }
  if (this.hasHeight){
    this.heightTexture.dispose();
  }
  delete texturePacks[this.name];
}

TexturePack.prototype.onTextureLoaded = function(onLoaded){
  this.totalLoadedCount ++;
  if (this.maxAttemptCount == this.totalLoadedCount && onLoaded){
    onLoaded();
  }
}

TexturePack.prototype.loadTexture = function(filePath, textureAttrName, textureAvailibilityAttrName, onLoaded){
  this.loader.load(filePath, function(textureData){
    this[textureAttrName] = textureData;
    this[textureAttrName].wrapS = THREE.RepeatWrapping;
    this[textureAttrName].wrapT = THREE.RepeatWrapping;
    this[textureAttrName].needsUpdate = true;
    this.onTextureLoaded(onLoaded);
  }.bind(this), function(xhr){

  }, function(xhr){
    this[textureAvailibilityAttrName] = false;
    this.onTextureLoaded(onLoaded);
    console.error("[!] "+textureAttrName+" could not be loaded --> "+this.name);
  }.bind(this));
}

TexturePack.prototype.loadTextures = function(onLoaded){
  if (this.hasDiffuse){
    this.loadTexture(this.diffuseFilePath, "diffuseTexture", "hasDiffuse", onLoaded);
  }
  if (this.hasAlpha){
    this.loadTexture(this.alphaFilePath, "alphaTexture", "hasAlpha", onLoaded);
  }
  if (this.hasAO){
    this.loadTexture(this.aoFilePath, "aoTexture", "hasAO", onLoaded);
  }
  if (this.hasEmissive){
    this.loadTexture(this.emissiveFilePath, "emissiveTexture", "hasEmissive", onLoaded);
  }
  if (this.hasHeight){
    this.loadTexture(this.heightFilePath, "heightTexture", "hasHeight", onLoaded);
  }
}
