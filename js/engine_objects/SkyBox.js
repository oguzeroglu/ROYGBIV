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

SkyBox.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.directoryName = this.directoryName;
  exportObject.color = this.color;
  return exportObject;
}

SkyBox.prototype.loadTexture = function(textureName, textureObjectName, textureAvailibilityObjectName, callback){
  var loader = textureLoaderFactory.get()
  var path = skyBoxRootDirectory + "/" + this.directoryName + "/" +textureName + textureLoaderFactory.getFilePostfix();
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
    if (textureLoaderFactory.isCompressionSupported()){
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
