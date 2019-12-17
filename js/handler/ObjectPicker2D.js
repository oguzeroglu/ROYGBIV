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
  if (mode == 1 && obj.isSprite && !obj.isClickable){
    return;
  }
  if (mode == 1 && obj.isContainer && !obj.isClickable){
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
  var allTexts = this.getTexts();
  var allSprites = this.getSprites();
  var allContainers = this.getContainers();
  var allVirtualKeyboards = this.getVirtualKeyboards();
  for (var textName in allTexts){
    this.binHandler.insert(allTexts[textName]);
  }
  for (var spriteName in allSprites){
    this.binHandler.insert(allSprites[spriteName]);
  }
  for (var containerName in allContainers){
    this.binHandler.insert(allContainers[containerName]);
  }
  for (var virtualKeyboardName in allVirtualKeyboards){
    this.binHandler.insert(allVirtualKeyboards[virtualKeyboardName]);
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
    var obj = addedTexts2D[name];
    if (!obj){
      obj = sprites[name];
    }
    if (!obj){
      obj = containers[name];
    }
    if (!obj){
      var vk = childContainers[name];
      if (vk){
        obj = vk.childContainersByContainerName[name];
      }
    }
    if (obj.mesh && !obj.mesh.visible){
      continue;
    }
    if (obj.isAddedText && !obj.twoDimensionalSize){
      obj.handleResize();
    }
    if (obj.isAddedText){
      if (webglSpaceX >= obj.twoDimensionalSize.x && webglSpaceX <= obj.twoDimensionalSize.z){
        if (webglSpaceY >= obj.twoDimensionalSize.w && webglSpaceY <= obj.twoDimensionalSize.y){
          intersectionPoint = 1;
          intersectionObject = name;
          return;
        }
      }
    }else if (obj.isSprite){
      REUSABLE_VECTOR.set(webglSpaceX, webglSpaceY, 0);
      if (obj.triangle1.containsPoint(REUSABLE_VECTOR) || obj.triangle2.containsPoint(REUSABLE_VECTOR)){
        intersectionPoint = 1;
        intersectionObject = name;
        return;
      }
    }else if (obj.isContainer){
      if (webglSpaceX >= obj.rectangle.x && webglSpaceX <= obj.rectangle.finalX){
        if (webglSpaceY <= obj.rectangle.y && webglSpaceY >= obj.rectangle.finalY){
          intersectionPoint = 1;
          intersectionObject = name;
          return;
        }
      }
    }
  }
}

ObjectPicker2D.prototype.getSprites = function(){
  if (!IS_WORKER_CONTEXT){
    if (mode == 0){
      return sceneHandler.getSprites();
    }else{
      return sceneHandler.getClickableSprites();
    }
  }else{
    if (mode == 0){
      return sprites;
    }else{
      return clickableSprites;
    }
  }
}

ObjectPicker2D.prototype.getVirtualKeyboards = function(){
  if (!IS_WORKER_CONTEXT){
    if (mode == 0){
      return {};
    }
    return sceneHandler.getVirtualKeyboards();
  }else{
    if (mode == 0){
      return {};
    }
    return virtualKeyboards;
  }
}

ObjectPicker2D.prototype.getContainers = function(){
  if (!IS_WORKER_CONTEXT){
    if (mode == 0){
      return sceneHandler.getContainers();
    }else{
      return sceneHandler.getClickableContainers();
    }
  }else{
    if (mode == 0){
      return containers;
    }else{
      return clickableContainers;
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
