var TexturePack = function(name, directoryName, textureDescription){
  this.totalLoadedCount = 0
  this.textureDescription = textureDescription;
  if (this.textureDescription.isAtlas){
    this.maxAttemptCount = 1;
    return this;
  }
  this.directoryName = directoryName;
  this.name = name;
  this.maxAttemptCount = 0;
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
}

TexturePack.prototype.clone = function(){
  var tp = new TexturePack(this.name, this.directoryName, this.textureDescription);
  tp.isParticleTexture = this.isParticleTexture;
  return tp;
}

TexturePack.prototype.export = function(){
  var exportObject = new Object();
  exportObject.directoryName = this.directoryName;
  exportObject.name = this.name;
  exportObject.textureDescription = this.textureDescription;
  exportObject.isParticleTexture = (!(typeof this.isParticleTexture == UNDEFINED))? this.isParticleTexture: false;
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
  if (!this.textureDescription.isAtlas){
    delete texturePacks[this.name];
  }
}

TexturePack.prototype.onTextureLoaded = function(onLoaded){
  this.totalLoadedCount ++;
  if (this.maxAttemptCount == this.totalLoadedCount && onLoaded){
    onLoaded();
  }
}

TexturePack.prototype.loadTexture = function(filePath, textureAttrName, textureAvailibilityAttrName, onLoaded){
  var loader = (this.isParticleTexture)? textureLoaderFactory.getDefault(): textureLoaderFactory.get();
  loader.load(filePath, function(textureData){
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

TexturePack.prototype.loadAtlas = function(onLoaded){
  var postfix = textureLoaderFactory.getFilePostfix();
  var atlasPath = atlasRootDirectory + "textureAtlas" + postfix;
  this.loadTexture(atlasPath, "diffuseTexture", "hasDiffuse", onLoaded);
}

TexturePack.prototype.loadTextures = function(onLoaded){
  if (this.textureDescription.isAtlas){
    this.loadAtlas(onLoaded);
    return;
  }
  this.totalLoadedCount = 0;
  var postfix = this.isParticleTexture? ".png": textureLoaderFactory.getFilePostfix();
  var diffuseFilePath = texturePackRootDirectory+this.directoryName+"/diffuse"+postfix;
  var alphaFilePath = texturePackRootDirectory+this.directoryName+"/alpha"+postfix;
  var aoFilePath = texturePackRootDirectory+this.directoryName+"/ao"+postfix;
  var emissiveFilePath = texturePackRootDirectory+this.directoryName+"/emissive"+postfix;
  var heightFilePath = texturePackRootDirectory+this.directoryName+"/height"+postfix;
  if (this.hasDiffuse){
    this.loadTexture(diffuseFilePath, "diffuseTexture", "hasDiffuse", onLoaded);
  }
  if (this.isParticleTexture){
    this.hasAlpha = false;
    this.hasAO = false;
    this.hasEmissive = false;
    this.hasHeight = false;
    this.maxAttemptCount = 1;
    return;
  }
  if (this.hasAlpha){
    this.loadTexture(alphaFilePath, "alphaTexture", "hasAlpha", onLoaded);
  }
  if (this.hasAO){
    this.loadTexture(aoFilePath, "aoTexture", "hasAO", onLoaded);
  }
  if (this.hasEmissive){
    this.loadTexture(emissiveFilePath, "emissiveTexture", "hasEmissive", onLoaded);
  }
  if (this.hasHeight){
    this.loadTexture(heightFilePath, "heightTexture", "hasHeight", onLoaded);
  }
}

TexturePack.prototype.setParticleTextureStatus = function(val){
  if (typeof val == UNDEFINED){
    val = false;
  }
  this.isParticleTexture = val;
}

TexturePack.prototype.isUsed = function(){
  for (var objName in addedObjects){
    if (addedObjects[objName].associatedTexturePack == this.name){
      return true;
    }
  }
  for (var objName in objectGroups){
    for (var childObjName in objectGroups[objName].group){
      if (objectGroups[objName].group[childObjName].associatedTexturePack == this.name){
        return true;
      }
    }
  }
  return false;
}
