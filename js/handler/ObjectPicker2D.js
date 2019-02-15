var ObjectPicker2D = function(){

}

ObjectPicker2D.prototype.find = function(screenSpaceX, screenSpaceY){
  intersectionPoint = 0, intersectionObject = 0;
  var webglSpaceX = (((screenSpaceX) * (2)) / (window.innerWidth)) -1;
  var webglSpaceY = (((screenSpaceY) * (2)) / (window.innerHeight)) -1;
  var totalObj = addedTexts2D;
  if (mode == 1){
    totalObj = clickableAddedTexts2D;
  }
  for (var textName in totalObj){
    var textObject = addedTexts2D[textName];
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
