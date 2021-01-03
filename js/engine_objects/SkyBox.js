var SkyBox = function(name, directoryName, color){
  this.name = name;
  this.directoryName = directoryName;
  this.color = color;
  this.hasBack = false;
  this.hasDown = false;
  this.hasFront = false;
  this.hasLeft = false;
  this.hasRight = false;
  this.hasUp = false;

  this.uniformCache = null;
}

SkyBox.prototype.getUniform = function(){
  if (!this.uniformCache){
    this.uniformCache = new THREE.Uniform(this.cubeTexture);
  }

  return this.uniformCache;
}

SkyBox.prototype.clone = function(){
  return new SkyBox(this.name, this.directoryName, this.color);
}

SkyBox.prototype.dispose = function(){
  this.backTexture.dispose();
  this.downTexture.dispose();
  this.frontTexture.dispose();
  this.leftTexture.dispose();
  this.rightTexture.dispose();
  this.upTexture.dispose();
  this.cubeTexture.dispose();
}

SkyBox.prototype.export = function(isBuildingForDeploymentMode){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.directoryName = this.directoryName;
  exportObject.color = this.color;

  if (isBuildingForDeploymentMode){
    for (var instanceName in modelInstances){
      var modelInstance = modelInstances[instanceName];
      if (modelInstance.environmentMapInfo && modelInstance.environmentMapInfo.skyboxName == this.name){
        exportObject.noCompress = true;
        break;
      }
    }
  }

  return exportObject;
}

SkyBox.prototype.loadTexture = function(textureName, textureObjectName, textureAvailibilityObjectName, callback){
  var loader = (isDeployment && this.noCompress)? textureLoaderFactory.getDefault(): textureLoaderFactory.get();
  var postfix = (isDeployment && this.noCompress)? textureLoaderFactory.getDefaultFilePostfix(): textureLoaderFactory.getFilePostfix();
  var path = skyBoxRootDirectory + this.directoryName + "/" +textureName + postfix;
  var that = this;
  loader.load(path, function(textureData){
    that[textureObjectName] = textureData;
    that[textureAvailibilityObjectName] = true;
    that.callbackCheck(callback);
  }, function(xhr){

  }, function(xhr){
    that[textureAvailibilityObjectName] = false;
    that.callbackCheck(callback);
  });
}

SkyBox.prototype.loadTextures = function(callback){
  var textureInfos = [
    ["back", "backTexture", "hasBack"],
    ["down", "downTexture", "hasDown"],
    ["front", "frontTexture", "hasFront"],
    ["left", "leftTexture", "hasLeft"],
    ["right", "rightTexture", "hasRight"],
    ["up", "upTexture", "hasUp"]
  ];
  for (var i = 0; i<textureInfos.length; i++){
    this.loadTexture(textureInfos[i][0], textureInfos[i][1], textureInfos[i][2], callback);
  }
}

SkyBox.prototype.isUsable = function(){
  return (
    this.hasBack &&
    this.hasDown &&
    this.hasFront &&
    this.hasLeft &&
    this.hasRight &&
    this.hasUp
  );
}

SkyBox.prototype.handleCompressedCubemap = function(cubemap){
  cubemap.format = cubemap.images[0].format;
  cubemap.generateMipmaps = false;
  cubemap.minFilter = THREE.LinearFilter;
  cubemap.needsUpdate = true;
}

SkyBox.prototype.callbackCheck = function(callback){
  if (this.isUsable()){
    if (textureLoaderFactory.isCompressionSupported() && !(isDeployment && this.noCompress)){
      this.cubeTexture = new THREE.CubeTexture([
        this.rightTexture, this.leftTexture,
        this.upTexture, this.downTexture,
        this.frontTexture, this.backTexture
      ]);
      this.handleCompressedCubemap(this.cubeTexture);
    }else{
      this.cubeTexture = new THREE.CubeTexture([
        this.rightTexture.image, this.leftTexture.image,
        this.upTexture.image, this.downTexture.image,
        this.frontTexture.image, this.backTexture.image
      ]);
    }
    this.cubeTexture.needsUpdate = true;
    if (callback){
      callback();
    }
  }
}
