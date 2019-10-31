var ObjectPicker2D = function(){

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
  var totalObj = sceneHandler.getAddedTexts2D();
  if (mode == 1){
    totalObj = sceneHandler.getClickableAddedTexts2D();
  }
  for (var textName in totalObj){
    var textObject = addedTexts2D[textName];
    if (!textObject.mesh.visible){
      continue;
    }
    if (!textObject.twoDimensionalSize){
      textObject.handleResize();
    }
    if (webglSpaceX >= textObject.twoDimensionalSize.x && webglSpaceX <= textObject.twoDimensionalSize.z){
      if (webglSpaceY >= textObject.twoDimensionalSize.w && webglSpaceY <= textObject.twoDimensionalSize.y){
        intersectionPoint = 1;
        intersectionObject = textName;
      }
    }
  }
}
