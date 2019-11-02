var ObjectPicker2D = function(){
  this.binHandlerPrecision = 1;
  this.binHandler = new WorldBinHandler2D(this.binHandlerPrecision);
}

ObjectPicker2D.prototype.refresh = function(){
  this.binHandler = new WorldBinHandler2D(this.binHandlerPrecision);
  if (mode == 0){
    var texts = sceneHandler.getAddedTexts2D();
    for (var textName in texts){
      this.binHandler.insert(texts[textName]);
    }
  }
}

ObjectPicker2D.prototype.find = function(screenSpaceX, screenSpaceY){
  var vPort = renderer.getCurrentViewport();
  var rectX = vPort.x / screenResolution;
  var rectY = vPort.y / screenResolution;
  var rectZ = vPort.z / screenResolution;
  var rectW = vPort.w / screenResolution;
  var webglSpaceX = ((screenSpaceX - rectX) / rectZ) * 2 - 1;
  var webglSpaceY = - ((screenSpaceY - rectY) / rectW) * 2 + 1;
  intersectionPoint = 0, intersectionObject = 0;
  var results = this.binHandler.query(webglSpaceX, webglSpaceY);
  if (!results){
    return;
  }
  for (var name in results){
    var textObject = addedTexts2D[name];
    if (!textObject.mesh.visible){
      continue;
    }
    if (!textObject.twoDimensionalSize){
      textObject.handleResize();
    }
    if (webglSpaceX >= textObject.twoDimensionalSize.x && webglSpaceX <= textObject.twoDimensionalSize.z){
      if (webglSpaceY >= textObject.twoDimensionalSize.w && webglSpaceY <= textObject.twoDimensionalSize.y){
        intersectionPoint = 1;
        intersectionObject = name;
      }
    }
  }
}
