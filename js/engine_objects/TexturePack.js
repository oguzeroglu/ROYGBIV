var TexturePack = function(name, directoryName, textureDescription, onLoaded){
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
  if (onLoaded){
    this.onLoaded = onLoaded;
  }
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

TexturePack.prototype.onTextureLoaded = function(){
  this.totalLoadedCount ++;
  if (this.maxAttemptCount == this.totalLoadedCount && this.onLoaded){
    this.onLoaded();
  }
}

TexturePack.prototype.loadTextures = function(){
  var that = this;
  //DIFFUSE
  this.loader.load(this.diffuseFilePath,
    function(textureData){
      that.diffuseTexture = textureData;
      that.diffuseTexture.wrapS = THREE.RepeatWrapping;
      that.diffuseTexture.wrapT = THREE.RepeatWrapping;
      that.diffuseTexture.needsUpdate = true;
      that.hasDiffuse = true;
      that.onTextureLoaded();
    },
    function(xhr){

    },
    function(xhr){
      that.hasDiffuse = false;
      that.onTextureLoaded();
    }
  );
  //ALPHA
  this.loader.load(this.alphaFilePath,
    function(textureData){
      that.alphaTexture = textureData;
      that.alphaTexture.wrapS = THREE.RepeatWrapping;
      that.alphaTexture.wrapT = THREE.RepeatWrapping;
      that.hasAlpha = true;
      that.alphaTexture.needsUpdate = true;
      that.onTextureLoaded();
    },
    function(xhr){

    },
    function(xhr){
      that.hasAlpha = false;
      that.onTextureLoaded();
    }
  );
  //AO
  this.loader.load(this.aoFilePath,
    function(textureData){
      that.aoTexture = textureData;
      that.aoTexture.wrapS = THREE.RepeatWrapping;
      that.aoTexture.wrapT = THREE.RepeatWrapping;
      that.hasAO = true;
      that.aoTexture.needsUpdate = true;
      that.onTextureLoaded();
    },
    function(xhr){

    },
    function(xhr){
      that.hasAo = false;
      that.onTextureLoaded();
    }
  );
  //EMISSIVE
  this.loader.load(this.emissiveFilePath,
    function(textureData){
      that.emissiveTexture = textureData;
      that.emissiveTexture.wrapS = THREE.RepeatWrapping;
      that.emissiveTexture.wrapT = THREE.RepeatWrapping;
      that.hasEmissive = true;
      that.emissiveTexture.needsUpdate = true;
      that.onTextureLoaded();
    },
    function(xhr){

    },
    function(xhr){
      that.hasEmissive = false;
      that.onTextureLoaded();
    }
  );
  //HEIGHT
  this.loader.load(this.heightFilePath,
    function(textureData){
      that.heightTexture = textureData;
      that.heightTexture.wrapS = THREE.RepeatWrapping;
      that.heightTexture.wrapT = THREE.RepeatWrapping;
      that.hasHeight = true;
      that.heightTexture.needsUpdate = true;
      that.onTextureLoaded();
    },
    function(xhr){

    },
    function(xhr){
      that.hasHeight = false;
      that.onTextureLoaded();
    }
  );
}
