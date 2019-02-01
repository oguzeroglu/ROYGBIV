var Font = function(name, path, onLoaded, onError){
  this.name = name;
  this.path = path;
  this.onLoaded = onLoaded;
  this.onError = onError;
  this.fontFace = new FontFace(name, "url("+path+")");
}

Font.prototype.load = function(){
  var that = this;
  this.fontFace.load().then(function(loadedFace) {
  	document.fonts.add(loadedFace);
    that.generateFontTexture();
    that.onLoaded(that);
  }).catch(function(error) {
    that.onError(that.name);
  });
}

Font.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.path = this.path;
  return exportObject;
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
    ctx.textBaseline = "bottom";
    ctx.font = fontSize + "px "+this.name;
    var textWidth = ctx.measureText(supportedFontAtlasChars[i]).width;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(supportedFontAtlasChars[i] , (tmpCanvas.width/2) - (textWidth/2), canvasSize);
    var canvasTexture = new THREE.CanvasTexture(tmpCanvas);
    textureObjects[supportedFontAtlasChars[i]] = canvasTexture;
  }
  this.textureMerger = new TextureMerger(textureObjects);
}
