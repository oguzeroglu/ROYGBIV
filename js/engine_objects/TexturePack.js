var TexturePack = function(name, directoryName, fileExtension, mapCallback, isPreLoaded){
  this.directoryName = directoryName;
  this.name = name;
  if (!DDS_SUPPORTED){
    if (fileExtension.toUpperCase() == "DDS"){
      fileExtension = compressedTextureFallbackFormat.replace(".", "");
    }
  }
  this.fileExtension = fileExtension;
  this.maxAttemptCount = 5;
  this.totalLoadedCount = 0;
  this.hasDiffuse = false;
  this.hasAlpha = false;
  this.hasAO = false;
  this.hasEmissive = false;
  this.hasHeight = false;
  if (isPreLoaded){
    this.isPreLoaded = isPreLoaded;
  }
  this.diffuseFilePath = texturePackRootDirectory+directoryName+"/"+"diffuse."+fileExtension.toLowerCase();
  this.alphaFilePath = texturePackRootDirectory+directoryName+"/"+"alpha."+fileExtension.toLowerCase();
  this.aoFilePath = texturePackRootDirectory+directoryName+"/"+"ao."+fileExtension.toLowerCase();
  this.emissiveFilePath = texturePackRootDirectory+directoryName+"/"+"emissive."+fileExtension.toLowerCase();
  this.heightFilePath = texturePackRootDirectory+directoryName+"/"+"height."+fileExtension.toLowerCase();
  if (fileExtension.toUpperCase() == "DDS"){
    this.loader = ddsLoader;
  }else if (fileExtension.toUpperCase() == "TGA"){
    this.loader = tgaLoader;
  }else{
    this.loader = textureLoader;
  }
  this.diffuseCanMapFlag = false;
  this.alphaCanMapFlag = false;
  this.aoCanMapFlag = false;
  this.emissiveCanMapFlag = false;
  this.heightCanMapFlag = false;
  if (mapCallback){
    this.mapCallback = mapCallback;
  }
  this.loadTextures();
}

TexturePack.prototype.export = function(){
  var exportObject = new Object();
  exportObject.directoryName = this.directoryName;
  exportObject.name = this.name;
  exportObject.fileExtension = this.fileExtension;
  exportObject.hasDiffuse = this.hasDiffuse;
  exportObject.hasAlpha = this.hasAlpha;
  exportObject.hasAO = this.hasAO;
  exportObject.hasEmissive = this.hasEmissive;
  exportObject.hasHeight = this.hasHeight;
  exportObject.diffuseFilePath = this.diffuseFilePath;
  exportObject.alphaFilePath = this.alphaFilePath;
  exportObject.aoFilePath = this.aoFilePath;
  exportObject.emissiveFilePath = this.emissiveFilePath;
  exportObject.heightFilePath = this.heightFilePath;
  return exportObject;
}

TexturePack.prototype.destroy = function(){
  for (var addedObjectName in addedObjects){
    var addedObject = addedObjects[addedObjectName];
    if (addedObject.associatedTexturePack == name){
      addedObject.resetAssociatedTexturePack();
    }
  }
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

TexturePack.prototype.readyCallback = function(){
  this.totalLoadedCount ++;
  if (this.maxAttemptCount == this.totalLoadedCount && this.mapCallback){
    this.mapCallback();
  }
}

TexturePack.prototype.mapDiffuse = function (that, textureData){
  that.diffuseTexture = textureData;
  that.diffuseTexture.wrapS = THREE.RepeatWrapping;
  that.diffuseTexture.wrapT = THREE.RepeatWrapping;
  that.hasDiffuse = true;
  that.diffuseCanMapFlag = true;
  that.refreshMap();
}

TexturePack.prototype.mapHeight = function (that, textureData){
  that.heightTexture = textureData;
  that.heightTexture.wrapS = THREE.RepeatWrapping;
  that.heightTexture.wrapT = THREE.RepeatWrapping;
  that.hasHeight = true;
  that.heightCanMapFlag = true;
  that.refreshMap();
}

TexturePack.prototype.mapAmbientOcculsion = function(that, textureData){
  that.aoTexture = textureData;
  that.aoTexture.wrapS = THREE.RepeatWrapping;
  that.aoTexture.wrapT = THREE.RepeatWrapping;
  that.hasAO = true;
  that.aoCanMapFlag = true;
  that.refreshMap();
}

TexturePack.prototype.mapAlpha = function(that, textureData){
  that.alphaTexture = textureData;
  that.alphaTexture.wrapS = THREE.RepeatWrapping;
  that.alphaTexture.wrapT = THREE.RepeatWrapping;
  that.hasAlpha = true;
  that.alphaCanMapFlag = true;
  that.refreshMap();
}

TexturePack.prototype.mapEmissive = function(that, textureData){
  that.emissiveTexture = textureData;
  that.emissiveTexture.wrapS = THREE.RepeatWrapping;
  that.emissiveTexture.wrapT = THREE.RepeatWrapping;
  that.hasEmissive = true;
  that.emissiveCanMapFlag = true;
  that.refreshMap();
}

TexturePack.prototype.loadTextures = function(){

  var that = this;

  //DIFFUSE
  this.loader.load(this.diffuseFilePath,
    function(textureData){
      that.mapDiffuse(that, textureData);
    },
    function(xhr){

    },
    function(xhr){
      that.hasDiffuse = false;
      that.diffuseCanMapFlag = true;
      that.refreshMap();
    }
  );
  //ALPHA
  this.loader.load(this.alphaFilePath,
    function(textureData){
      that.mapAlpha(that, textureData);
    },
    function(xhr){

    },
    function(xhr){
      that.hasAlpha = false;
      that.alphaCanMapFlag = true;
      that.refreshMap();
    }
  );
  //AO
  this.loader.load(this.aoFilePath,
    function(textureData){
      that.mapAmbientOcculsion(that, textureData);
    },
    function(xhr){

    },
    function(xhr){
      that.hasAo = false;
      that.aoCanMapFlag = true;
      that.refreshMap();
    }
  );
  //EMISSIVE
  this.loader.load(this.emissiveFilePath,
    function(textureData){
      that.mapEmissive(that, textureData);
    },
    function(xhr){

    },
    function(xhr){
      that.hasEmissive = false;
      that.emissiveCanMapFlag = true;
      that.refreshMap();
    }
  );
  //HEIGHT
  this.loader.load(this.heightFilePath,
    function(textureData){
      that.mapHeight(that, textureData);
    },
    function(xhr){

    },
    function(xhr){
      that.hasHeight = false;
      that.heightCanMapFlag = true;
      that.refreshMap();
    }
  );
}

TexturePack.prototype.printInfo = function(){
  var diffuseSizeText = "";
  var alphaSizeText = "";
  var ambientOcculsionSizeText = "";
  var emissiveSizeText = "";
  var heightSizeText = "";
  if (this.hasDiffuse){
    var img = this.diffuseTexture.image;
    diffuseSizeText = " ["+img.width+"x"+img.height+"]";
  }
  if (this.hasAlpha){
    var img = this.alphaTexture.image;
    alphaSizeText = " ["+img.width+"x"+img.height+"]";  }
  if (this.hasAO){
    var img = this.aoTexture.image;
    ambientOcculsionSizeText = " ["+img.width+"x"+img.height+"]";
  }
  if (this.hasEmissive){
    var img = this.emissiveTexture.image;
    emissiveSizeText = " ["+img.width+"x"+img.height+"]";
  }
  if (this.hasHeight){
    var img = this.heightTexture.image;
    heightSizeText = " ["+img.width+"x"+img.height+"]";
  }
  terminal.printHeader(Text.TEXTUREPACK_INFO_HEADER, true);
  terminal.printInfo(Text.TEXTUREPACK_NAME.replace(
    Text.PARAM1, this.name
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_DIRNAME.replace(
    Text.PARAM1, this.directoryName
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_FILEEXTENSION.replace(
    Text.PARAM1, this.fileExtension
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_FILEPATHS, true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_DIFFUSE.replace(
    Text.PARAM1, this.diffuseFilePath
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_ALPHA.replace(
    Text.PARAM1, this.alphaFilePath
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_AO.replace(
    Text.PARAM1, this.aoFilePath
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_EMISSIVE.replace(
    Text.PARAM1, this.emissiveFilePath
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_HEIGHT.replace(
    Text.PARAM1, this.heightFilePath
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_TEXTURES, true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_DIFFUSE.replace(
    Text.PARAM1, this.hasDiffuse + diffuseSizeText
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_ALPHA.replace(
    Text.PARAM1, this.hasAlpha + alphaSizeText
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_AO.replace(
    Text.PARAM1, this.hasAO + ambientOcculsionSizeText
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_EMISSIVE.replace(
    Text.PARAM1, this.hasEmissive + emissiveSizeText
  ), true);
  terminal.printInfo(Text.TEXTUREPACK_INFO_TREE_HEIGHT.replace(
    Text.PARAM1, this.hasHeight + heightSizeText
  ), false);
}

TexturePack.prototype.isUsable = function(){
  return (
    this.hasDiffuse ||
    this.hasAlpha ||
    this.hasAO ||
    this.hasEmissive ||
    this.hasHeight
  );
}

TexturePack.prototype.refresh = function(){
  this.loadTextures();
}

TexturePack.prototype.refreshMap = function(){
  if (!this.isPreLoaded){
    for (var addedObjectName in addedObjects){
      var addedObject = addedObjects[addedObjectName];
      if (addedObject.associatedTexturePack == this.name){
        addedObject.mapTexturePack(this);
      }
    }
  }
  this.readyCallback();
}
