var ObjectPicker2D = function(){

}

ObjectPicker2D.prototype.find = function(screenSpaceX, screenSpaceY){
  var webglSpaceX = (((screenSpaceX) * (2)) / (window.innerWidth)) -1;
  var webglSpaceY = (((screenSpaceY) * (2)) / (window.innerHeight)) -1;
  if (mode == 0){
    for (var textName in addedTexts2D){
      var textObject = addedTexts2D[textName];
      if (!textObject.twoDimensionalSize){
        textObject.handleResize();
      }
      if (webglSpaceX >= textObject.twoDimensionalSize.x && webglSpaceX <= textObject.twoDimensionalSize.z){
        if (webglSpaceY >= textObject.twoDimensionalSize.w && webglSpaceY <= textObject.twoDimensionalSize.y){

        }
      }
    }
  }else{

  }
}
