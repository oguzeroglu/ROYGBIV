var DynamicTextureLoader = function(){
  this.totalLoadedCount = 0;
}

DynamicTextureLoader.prototype.loadDynamicTextures = function(folderName, textureNames, onComplete){
  this.targetCount = textureNames.length;
  this.results = [];
  this.onComplete = onComplete;
  var loader = textureLoaderFactory.get();
  for (var i = 0; i<textureNames.length; i++){
    this.results.push(false)
    var path = "./dynamic_textures/"+folderName+"/"+textureNames[i] + textureLoaderFactory.getFilePostfix();
    if (dynamicallyLoadedTextures[path]){
      this.results[i] = dynamicallyLoadedTextures[path];
      this.onTextureLoaded();
    }else{
      loader.load(path, function(textureData){
        var texturePack = this.context.createTexturePack(textureData);
        this.context.results[this.index] = texturePack;
        dynamicallyLoadedTextures[this.path] = texturePack;
        this.context.onTextureLoaded();
      }.bind({index: i, context: this, path: path}),
      noop,
      function(){
        this.context.onTextureLoaded();
      }.bind({context: this}));
    }
  }
}

DynamicTextureLoader.prototype.createTexturePack = function(textureData){
  var texturePack = new TexturePack();
  texturePack.diffuseTexture = textureData;
  textureData.hasDiffuse = true;
  textureData.wrapS = THREE.RepeatWrapping;
  textureData.wrapT = THREE.RepeatWrapping;
  textureData.needsUpdate = true;
  return texturePack;
}

DynamicTextureLoader.prototype.onTextureLoaded = function(){
  this.totalLoadedCount ++;
  if (this.totalLoadedCount == this.targetCount){
    this.onComplete(this.results);
  }
};
