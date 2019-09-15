var Font = function(name, path, customFontFace){
  this.name = name;
  this.path = path;
  if (!customFontFace){
    this.fontFace = new FontFace(name, "url(./"+path+")");
  }else{
    this.fontFace = customFontFace
    this.generateFontTexture();
    this.texture = this.textureMerger.mergedTexture;
  }
}

Font.prototype.compress = function(onLoaded, onError){
  var postRequest = new XMLHttpRequest();
  var data = JSON.stringify({name: this.name, image: this.textureMerger.mergedTexture.image.toDataURL()});
  postRequest.open("POST", "/compressFont", true);
  postRequest.setRequestHeader('Content-Type', 'application/json');
  var that = this;
  postRequest.onreadystatechange = function(err){
    if (postRequest.readyState == 4 && postRequest.status == 200){
      var resp = JSON.parse(postRequest.responseText);
      if (resp.error){
        onError(that.name);
      }else{
        that.loadCompressedTexture(onLoaded);
      }
    }
  };
  postRequest.onerror = function(){
    onError(that.name);
  };
  postRequest.send(data);
}

Font.prototype.loadCompressedTexture = function(onLoaded){
  var textureLoader = textureLoaderFactory.get();
  var texturePostfix = textureLoaderFactory.getFilePostfix();
  var that = this;
  textureLoader.load("./texture_atlas/fonts/"+that.name+"/pack"+texturePostfix, function(textureData){
    that.texture = textureData;
    that.texture.wrapS = THREE.RepeatWrapping;
    that.texture.wrapT = THREE.RepeatWrapping;
    that.texture.needsUpdate = true;
    onLoaded(that);
  });
}

Font.prototype.load = function(onLoaded, onError){
  var that = this;
  this.fontFace.load().then(function(loadedFace) {
  	document.fonts.add(loadedFace);
    that.generateFontTexture();
    if (!isDeployment){
      that.compress(onLoaded, onError);
    }else{
      that.loadCompressedTexture(onLoaded);
    }
  }).catch(function(error) {
    console.error(error);
    onError(that.name);
  });
}

Font.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.path = this.path;
  return exportObject;
}

Font.prototype.destroy = function(){
  if (this.textureMerger){
    this.textureMerger.mergedTexture.dispose();
  }
  this.textureMerger = null;
  delete fonts[this.name];
}

Font.prototype.generateFontTexture = function(){
  var canvasSize = 64;
  var textureObjects = new Object();
  var tmpCanvas = document.createElement("canvas");
  var ctx = tmpCanvas.getContext("2d");
  var fontSize = 60;
  for (var i = 0; i<supportedFontAtlasChars.length; i++){
    ctx.textBaseline = "bottom";
    ctx.font = fontSize + "px "+this.name;
    var textWidth = ctx.measureText(supportedFontAtlasChars[i]).width;
    while (textWidth > canvasSize){
      fontSize-=15;
      ctx.font = fontSize + "px "+this.name;
      textWidth = ctx.measureText(supportedFontAtlasChars[i]).width;
    }
  }
  for (var i = 0; i<supportedFontAtlasChars.length; i++){
    tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = canvasSize;
    tmpCanvas.height = canvasSize;
    ctx = tmpCanvas.getContext("2d");
    ctx.textBaseline = "middle";
    ctx.textAlign='center';
    ctx.font = fontSize + "px "+this.name;
    var textWidth = ctx.measureText(supportedFontAtlasChars[i]).width;
    ctx.fillStyle = "#ffffff";
    ctx.translate(canvasSize/2, canvasSize/2);
    ctx.rotate(Math.PI);
    ctx.scale(-1, 1);
    ctx.fillText(supportedFontAtlasChars[i] , 0, 0);
    var canvasTexture = new THREE.CanvasTexture(tmpCanvas);
    textureObjects[supportedFontAtlasChars[i]] = canvasTexture;
  }
  this.textureMerger = new TextureMerger(textureObjects);
}
