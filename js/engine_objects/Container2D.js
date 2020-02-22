var Container2D = function(name, centerXPercent, centerYPercent, widthPercent, heightPercent, virtualKeyboardParent){
  this.isContainer = true;
  this.name = name;
  this.centerXPercent = centerXPercent;
  this.centerYPercent = centerYPercent;
  this.widthPercent = widthPercent;
  this.heightPercent = heightPercent;
  this.scaleWidth = 1;
  this.scaleHeight = 1;
  this.paddingXContainerSpace = 0;
  this.paddingYContainerSpace = 0;
  this.alignedContainerInfos = {};
  if (!IS_WORKER_CONTEXT){
    this.handleRectangle();
    if (!isDeployment){
      this.rectangle.mesh.material.uniforms.color.value.set("lime");
    }
  }
  this.virtualKeyboardParent = virtualKeyboardParent;
}

Container2D.prototype.removeBackground = function(){
  if (!this.hasBackground){
    return;
  }
  this.backgroundSprite.destroy();
  this.hasBackground = false;
  delete this.backgroundColor;
  delete this.backgroundAlpha;
  delete this.backgroundTextureName;
  delete this.backgroundSprite;
}

Container2D.prototype.setBackground = function(backgroundColor, backgroundAlpha, backgroundTextureName){
  if (!this.backgroundSprite){
    var bgSprite = new Sprite();
    bgSprite.mesh.renderOrder = renderOrders.CONTAINER_BACKGROUND;
    bgSprite.isBackgroundObject = true;
    this.backgroundSprite = bgSprite;
  }
  this.backgroundSprite.setWidthPercent(this.scaleWidth * this.widthPercent);
  this.backgroundSprite.setHeightPercent(this.scaleHeight * this.heightPercent);
  this.backgroundSprite.set2DCoordinates(100 - this.centerXPercent, 100 - this.centerYPercent);
  this.backgroundSprite.setColor(backgroundColor);
  this.backgroundSprite.setAlpha(backgroundAlpha);
  this.backgroundSprite.mesh.material.transparent = true;
  this.backgroundSprite.mesh.renderOrder = renderOrders.CONTAINER_BACKGROUND;
  if (!!backgroundTextureName){
    this.backgroundSprite.mapTexture(texturePacks[backgroundTextureName]);
  } else if (this.backgroundSprite.isTextured){
    this.backgroundSprite.removeTexture();
  }
  this.backgroundColor = backgroundColor;
  this.backgroundAlpha = backgroundAlpha;
  this.backgroundTextureName = backgroundTextureName;
  this.hasBackground = true;
}

Container2D.prototype.removeBorder = function(){
  this.hasBorder = false;
  delete this.borderColor;
  delete this.borderThickness;
  this.rectangle.updateMesh(0.005);
  var color = selectionHandler.getSelectedObject() == this? "yellow": "lime";
  this.rectangle.mesh.material.uniforms.color.value.set(color);
}

Container2D.prototype.setBorder = function(borderColor, thickness){
  this.hasBorder = true;
  this.borderColor = borderColor;
  this.borderThickness = thickness;
  this.rectangle.updateMesh(thickness, true);
  this.rectangle.mesh.material.uniforms.color.value.set(borderColor);
}

Container2D.prototype.exportLightweight = function(){
  return {
    x: this.rectangle.x,
    y: this.rectangle.y,
    x2: this.rectangle.finalX,
    y2: this.rectangle.finalY,
    width: this.rectangle.width,
    height: this.rectangle.height,
    isClickable: !!this.isClickable
  };
}

Container2D.prototype.isChildAlignedWithType = function(childContainer, alignmentType){
  var alignmentInfos = this.alignedContainerInfos[childContainer.name];
  if (!alignmentInfos){
    return false;
  }
  for (var i = 0; i<alignmentInfos.length; i++){
    if (alignmentInfos[i].alignmentType == alignmentType){
      return true;
    }
  }
  return false;
}

Container2D.prototype.handleAlignment = function(curInfo){
  var wp = this.widthPercent * this.scaleWidth;
  var hp = this.heightPercent * this.scaleHeight;
  var curContainer = curInfo.container;
  var curWidthPercent = curContainer.widthPercent * curContainer.scaleWidth;
  var curHeightPercent = curContainer.heightPercent * curContainer.scaleHeight;
  if (curInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_RIGHT){
    curContainer.setCenter(this.centerXPercent + (wp / 2) + curInfo.value + (curWidthPercent / 2), curContainer.centerYPercent);
  }else if (curInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_LEFT){
    curContainer.setCenter(this.centerXPercent - (wp / 2) - curInfo.value - (curWidthPercent / 2), curContainer.centerYPercent);
  }else if (curInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_TOP){
    curContainer.setCenter(curContainer.centerXPercent, this.centerYPercent + (hp / 2) + curInfo.value + (curHeightPercent / 2));
  }else if (curInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_BOTTOM){
    curContainer.setCenter(curContainer.centerXPercent, this.centerYPercent - (hp / 2) - curInfo.value - (curHeightPercent / 2));
  }
}

Container2D.prototype.handleAlignments = function(){
  for (var key in this.alignedContainerInfos){
    var curAlignedContainerInfos = this.alignedContainerInfos[key];
    for (var i = 0; i<curAlignedContainerInfos.length; i++){
      var curInfo = curAlignedContainerInfos[i];
      this.handleAlignment(curInfo);
    }
  }
}

Container2D.prototype.unalign = function(container){
  delete container.alignedParent;
  delete this.alignedContainerInfos[container.name];
}

Container2D.prototype.addAlignedContainer = function(alignmentInfo){
  if (!this.alignedContainerInfos[alignmentInfo.container.name]){
    this.alignedContainerInfos[alignmentInfo.container.name] = [];
  }
  var found = false;
  if (this.alignedContainerInfos[alignmentInfo.container.name]){
    var alternativeType;
    if (alignmentInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_TOP){
      alternativeType = CONTAINER_ALIGNMENT_TYPE_BOTTOM;
    }else if (alignmentInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_BOTTOM){
      alternativeType = CONTAINER_ALIGNMENT_TYPE_TOP;
    }else if (alignmentInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_LEFT){
      alternativeType = CONTAINER_ALIGNMENT_TYPE_RIGHT;
    }else if (alignmentInfo.alignmentType == CONTAINER_ALIGNMENT_TYPE_RIGHT){
      alternativeType = CONTAINER_ALIGNMENT_TYPE_LEFT;
    }
    for (var i = 0; i<this.alignedContainerInfos[alignmentInfo.container.name].length; i++){
      var alignmentType = this.alignedContainerInfos[alignmentInfo.container.name][i].alignmentType;
      if (alignmentType == alignmentInfo.alignmentType || alignmentType == alternativeType){
        this.alignedContainerInfos[alignmentInfo.container.name][i] = alignmentInfo;
        found = true;
        break;
      }
    }
  }
  if (!found){
    this.alignedContainerInfos[alignmentInfo.container.name].push(alignmentInfo);
  }
  this.handleAlignments();
}

Container2D.prototype.makeEmpty = function(){
  if (this.sprite){
    delete this.sprite.savedScaleX;
    delete this.sprite.savedScaleY;
    this.removeSprite();
  }
  if (this.addedText){
    this.removeAddedText();
  }
}

// paddingY -> [0, 100[
Container2D.prototype.setPaddingY = function(paddingY){
  this.paddingYContainerSpace = paddingY;
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

// paddingX -> [0, 100[
Container2D.prototype.setPaddingX = function(paddingX){
  this.paddingXContainerSpace = paddingX;
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.makeSquare = function(){
  var actualWidth = renderer.getCurrentViewport().z * this.widthPercent / 100;
  var actualHeight = renderer.getCurrentViewport().w * this.heightPercent / 100;
  if (actualWidth > actualHeight){
    var newWidthPercent = this.heightPercent * renderer.getCurrentViewport().w / renderer.getCurrentViewport().z;
    this.scaleWidth = newWidthPercent / this.widthPercent;
    this.scaleHeight = 1;
  }else if (actualHeight > actualWidth){
    var newHeightPercent = this.widthPercent * renderer.getCurrentViewport().z / renderer.getCurrentViewport().w;
    this.scaleHeight = newHeightPercent / this.heightPercent;
    this.scaleWidth = 1;
  }
  if (!isDeployment){
    if (guiHandler.datGuiContainerManipulation){
      guiHandler.containerManipulationParameters["Width"] = this.widthPercent * this.scaleWidth;
      guiHandler.containerManipulationParameters["Height"] = this.heightPercent * this.scaleHeight;
    }
  }
  this.handleRectangle();
  if (!this.virtualKeyboardParent){
    rayCaster.updateObject(this);
  }
}

Container2D.prototype.handleResize = function(){
  GLOBAL_VIEWPORT_UNIFORM.value.set(0, 0, window.innerWidth * screenResolution, window.innerHeight * screenResolution);
  if (this.isSquare){
    this.makeSquare();
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.hasBorder){
    this.rectangle.updateMesh(this.borderThickness, true);
  }else if (this.rectangle && (!(typeof this.rectangle.thicknessOffset == UNDEFINED))){
    this.rectangle.updateMesh(this.rectangle.thicknessOffset);
  }
  if (this.hasBackground){
    this.backgroundSprite.handleRectangle();
    this.setBackground(this.backgroundColor, this.backgroundAlpha, this.backgroundTextureName);
  }
  if (!this.virtualKeyboardParent){
    rayCaster.updateObject(this);
  }
}

Container2D.prototype.export = function(){
  var exportObj = {
    centerXPercent: this.centerXPercent,
    centerYPercent: this.centerYPercent,
    widthPercent: this.widthPercent,
    heightPercent: this.heightPercent,
    isSquare: !!this.isSquare,
    paddingXContainerSpace: this.paddingXContainerSpace,
    paddingYContainerSpace: this.paddingYContainerSpace,
    isClickable: !!this.isClickable,
    hasBorder: !!this.hasBorder,
    borderColor: this.borderColor,
    borderThickness: this.borderThickness
  };
  if (this.sprite){
    exportObj.spriteName = this.sprite.name
  }
  if (this.addedText){
    exportObj.addedTextName = this.addedText.name;
  }
  exportObj.alignedContainerInfos = new Object();
  for (var key in this.alignedContainerInfos){
    exportObj.alignedContainerInfos[key] = [];
    for (var i = 0; i<this.alignedContainerInfos[key].length; i++){
      exportObj.alignedContainerInfos[key].push({
        containerName: this.alignedContainerInfos[key][i].container.name,
        alignmentType: this.alignedContainerInfos[key][i].alignmentType,
        value: this.alignedContainerInfos[key][i].value
      });
    }
  }
  if (this.hasBackground){
    exportObj.hasBackground = true;
    exportObj.backgroundColor = this.backgroundColor;
    exportObj.backgroundAlpha = this.backgroundAlpha;
    exportObj.backgroundTextureName = this.backgroundTextureName;
  }
  return exportObj;
}

Container2D.prototype.makeInvisible = function(){
  if (isDeployment && !this.hasBorder){
    return;
  }
  scene.remove(this.rectangle.mesh);
}

Container2D.prototype.makeVisible = function(){
  if (isDeployment && !this.hasBorder){
    return;
  }
  scene.add(this.rectangle.mesh);
}

Container2D.prototype.destroy = function(){
  scene.remove(this.rectangle.mesh);
  this.rectangle.material.dispose();
  this.rectangle.geometry.dispose();
  if (this.sprite){
    this.removeSprite();
  }
  if (this.addedText){
    this.removeAddedText();
  }
  delete containers[this.name];
  if (this.alignedParent){
    this.alignedParent.unalign(this);
    delete this.alignedParent;
  }
  for (var containerName in containers){
    if (containers[containerName].alignedParent && containers[containerName].alignedParent.name == this.name){
      this.unalign(containers[containerName]);
    }
  }
  if (this.hasBackground){
    this.backgroundSprite.destroy();
  }
}

Container2D.prototype.setCenter = function(centerXPercent, centerYPercent){
  this.centerXPercent = centerXPercent;
  this.centerYPercent = centerYPercent;
  this.handleRectangle();
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
  if (!this.virtualKeyboardParent){
    rayCaster.updateObject(this);
  }
}

Container2D.prototype.setWidth = function(widthPercent){
  this.widthPercent = widthPercent;
  this.handleRectangle();
  if (this.isSquare){
    this.makeSquare();
  }
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
  if (!this.virtualKeyboardParent){
    rayCaster.updateObject(this);
  }
}

Container2D.prototype.setHeight = function(heightPercent){
  this.heightPercent = heightPercent;
  this.handleRectangle();
  if (this.isSquare){
    this.makeSquare();
  }
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
  if (!this.virtualKeyboardParent){
    rayCaster.updateObject(this);
  }
}


Container2D.prototype.handleRectangle = function(){
  if (!this.rectangle){
    this.rectangle = new Rectangle();
  }

  var centerXWebGL = ((this.centerXPercent * 2) / 100) -1;
  var centerYWebGL = ((this.centerYPercent * 2) / 100) -1;
  var widthWebGL = ((this.widthPercent * this.scaleWidth * 2) / 100);
  var heightWebGL = ((this.heightPercent * this.scaleHeight * 2) / 100);

  var x = centerXWebGL - (widthWebGL / 2);
  var x2 = centerXWebGL + (widthWebGL / 2);
  var y = centerYWebGL + (heightWebGL / 2);
  var y2 = centerYWebGL - (heightWebGL / 2);
  this.rectangle.set(x, y, x2, y2, widthWebGL, heightWebGL);
  var rectangleThickness = this.hasBorder? this.borderThickness: 0.005;
  this.rectangle.updateMesh(rectangleThickness);
  this.handleAlignments();
  if (this.hasBackground){
    this.setBackground(this.backgroundColor, this.backgroundAlpha, this.backgroundTextureName);
  }
}

Container2D.prototype.removeSprite = function(){
  delete this.sprite.containerParent;
  delete this.sprite;
}

Container2D.prototype.removeAddedText = function(){
  delete this.addedText.containerParent;
  delete this.addedText;
}

Container2D.prototype.insertAddedText = function(addedText){
  if (!addedText.is2D){
    return;
  }
  var paddingX = (((this.paddingXContainerSpace) * ((this.widthPercent / 2))) / (100));
  var paddingY = (((this.paddingYContainerSpace) * ((this.heightPercent / 2))) / (100));
  addedText.maxWidthPercent = this.widthPercent - (2 * paddingX);
  addedText.maxHeightPercent = this.heightPercent - (2 * paddingY);
  addedText.handleResize();
  var selectedCoordXPercent, selectedCoordYPercent;
  if (addedText.marginMode == MARGIN_MODE_2D_CENTER){
    selectedCoordXPercent = 100 - this.centerXPercent;
    selectedCoordYPercent = 100 - this.centerYPercent;
  }else if (addedText.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    selectedCoordXPercent = this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = 100 - this.centerYPercent - (this.heightPercent / 2) + paddingY;
  }else{
    selectedCoordXPercent = 100 - this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = this.centerYPercent - (this.heightPercent / 2) + addedText.getHeightPercent() + paddingY;
  }
  addedText.set2DCoordinates(selectedCoordXPercent, selectedCoordYPercent);
  addedText.containerParent = this;
  addedText.mesh.material.transparent = true;
  addedText.mesh.renderOrder = renderOrders.ELEMENT_IN_CONTAINER;
  this.addedText = addedText;
}

Container2D.prototype.insertSprite = function(sprite){
  if (!(typeof sprite.savedScaleX === UNDEFINED)){
    sprite.setScale(sprite.savedScaleX, sprite.savedScaleY);
  }
  sprite.onBeforeContainerInsertion();
  var paddingX = (((this.paddingXContainerSpace) * ((this.widthPercent / 2))) / (100));
  var paddingY = (((this.paddingYContainerSpace) * ((this.heightPercent / 2))) / (100));
  sprite.setRotation(0);
  var maxWidth = this.widthPercent - (2 * paddingX);
  var maxHeight = this.heightPercent - (2 * paddingY);
  var sourceWidth = sprite.calculateWidthPercent();
  var sourceHeight = sprite.calculateHeightPercent();
  sourceWidth *= screenResolution / sprite.originalScreenResolution;
  sourceHeight *= screenResolution / sprite.originalScreenResolution;
  var scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  if (scale > 1){
    scale = 1;
  }
  sprite.setWidthPercent(sourceWidth * scale);
  sprite.setHeightPercent(sourceHeight * scale);
  var selectedCoordXPercent, selectedCoordYPercent;
  if (sprite.marginMode == MARGIN_MODE_2D_CENTER){
    selectedCoordXPercent = 100 - this.centerXPercent;
    selectedCoordYPercent = 100 - this.centerYPercent;
  }else if (sprite.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    selectedCoordXPercent = this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = 100 - this.centerYPercent - (this.heightPercent / 2) + paddingY;
  }else{
    selectedCoordXPercent = 100 - this.centerXPercent - (this.widthPercent / 2) + paddingX;
    selectedCoordYPercent = this.centerYPercent - (this.heightPercent / 2) + paddingY;
  }
  sprite.set2DCoordinates(selectedCoordXPercent, selectedCoordYPercent);
  sprite.mesh.material.transparent = true;
  sprite.mesh.renderOrder = renderOrders.ELEMENT_IN_CONTAINER;
  sprite.containerParent = this;
  this.sprite = sprite;
}
