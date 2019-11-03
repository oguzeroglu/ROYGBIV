var ObjectPicker2D = function(){
  this.binHandlerPrecision = 1;
  this.binHandler = new WorldBinHandler2D(this.binHandlerPrecision);
  this.updateBuffer = new Map();
}

ObjectPicker2D.prototype.issueUpdate = function(obj, objName){
  objectPicker2D.binHandler.update(obj);
}

ObjectPicker2D.prototype.flush = function(){
  this.updateBuffer.forEach(this.issueUpdate);
  if (this.updateBuffer.size > 0){
    this.updateBuffer.clear();
  }
}

ObjectPicker2D.prototype.update = function(obj, forceUpdate){
  if (obj.isAddedText && !obj.is2D){
    return;
  }
  if (mode == 1 && obj.isAddedText && !obj.isClickable){
    return;
  }
  if (forceUpdate){
    this.issueUpdate(obj, obj.name);
    return;
  }
  this.updateBuffer.set(obj.name, obj);
}

ObjectPicker2D.prototype.hide = function(obj){
  this.binHandler.delete(obj);
}

ObjectPicker2D.prototype.show = function(obj){
  this.binHandler.insert(obj);
}

ObjectPicker2D.prototype.refresh = function(){
  this.binHandler = new WorldBinHandler2D(this.binHandlerPrecision);
  var texts = this.getTexts();
  for (var textName in texts){
    this.binHandler.insert(texts[textName]);
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

ObjectPicker2D.prototype.getTexts = function(){
  if (!IS_WORKER_CONTEXT){
    if (mode == 0){
      return sceneHandler.getAddedTexts2D();
    }else{
      return sceneHandler.getClickableAddedTexts2D();
    }
  }else{
    if (mode == 0){
      return addedTexts2D;
    }else{
      return clickableAddedTexts2D;
    }
  }
}
