var SkyBox = function(name, directoryName, color, callback){
  this.name = name;
  this.directoryName = directoryName;
  this.color = color;
  this.hasBack = false;
  this.hasDown = false;
  this.hasFront = false;
  this.hasLeft = false;
  this.hasRight = false;
  this.hasUp = false;
  if (callback){
    this.callback = callback;
  }
}

SkyBox.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.directoryName = this.directoryName;
  exportObject.color = this.color;
  return exportObject;
}

SkyBox.prototype.loadTexture = function(textureName, textureObjectName, textureAvailibilityObjectName){
  var loader = textureLoaderFactory.get();
  var path = skyBoxRootDirectory + "/" + this.directoryName + "/" +textureName + textureLoaderFactory.getFilePostfix();
  var that = this;
  loader.load(path, function(textureData){
    that[textureObjectName] = textureData;
    that[textureAvailibilityObjectName] = true;
    that.callbackCheck();
  }, function(xhr){

  }, function(xhr){
    that[textureAvailibilityObjectName] = false;
    that.callbackCheck();
  });
}

SkyBox.prototype.loadTextures = function(){
  var textureInfos = [
    ["back", "backTexture", "hasBack"],
    ["down", "downTexture", "hasDown"],
    ["front", "frontTexture", "hasFront"],
    ["left", "leftTexture", "hasLeft"],
    ["right", "rightTexture", "hasRight"],
    ["up", "upTexture", "hasUp"]
  ];
  for (var i = 0; i<textureInfos.length; i++){
    this.loadTexture(textureInfos[i][0], textureInfos[i][1], textureInfos[i][2]);
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

SkyBox.prototype.callbackCheck = function(){
  if (this.isUsable()){
    this.cubeTexture = new THREE.CubeTexture([
      this.rightTexture.image, this.leftTexture.image,
      this.upTexture.image, this.downTexture.image,
      this.frontTexture.image, this.backTexture.image
    ]);
    this.cubeTexture.needsUpdate = true;
    if (this.callback){
      this.callback();
    }
  }
}
