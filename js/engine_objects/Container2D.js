var Container2D = function(name, centerXPercent, centerYPercent, widthPercent, heightPercent){
  this.isContainer = true;
  this.name = name;
  this.centerXPercent = centerXPercent;
  this.centerYPercent = centerYPercent;
  this.widthPercent = widthPercent;
  this.heightPercent = heightPercent;
  this.handleRectangle();
  this.rectangle.mesh.material.uniforms.color.value.set("lime");
}

Container2D.prototype.export = function(){
  var exportObj = {
    centerXPercent: this.centerXPercent,
    centerYPercent: this.centerYPercent,
    widthPercent: this.widthPercent,
    heightPercent: this.heightPercent
  };
  if (this.sprite){
    exportObj.spriteName = this.sprite.name
  }
  if (this.addedText){
    exportObj.addedTextName = this.addedText.name;
  }
  return exportObj;
}

Container2D.prototype.makeInvisible = function(){
  scene.remove(this.rectangle.mesh);
}

Container2D.prototype.makeVisible = function(){
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
}

Container2D.prototype.setWidth = function(widthPercent){
  this.widthPercent = widthPercent;
  this.handleRectangle();
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.setHeight = function(heightPercent){
  this.heightPercent = heightPercent;
  this.handleRectangle();
  if (this.sprite){
    this.insertSprite(this.sprite);
  }
  if (this.addedText){
    this.insertAddedText(this.addedText);
  }
}

Container2D.prototype.handleRectangle = function(){
  if (!this.rectangle){
    this.rectangle = new Rectangle();
  }

  var centerXWebGL = ((this.centerXPercent * 2) / 100) -1;
  var centerYWebGL = ((this.centerYPercent * 2) / 100) -1;
  var widthWebGL = ((this.widthPercent * 2) / 100);
  var heightWebGL = ((this.heightPercent * 2) / 100);

  var x = centerXWebGL - (widthWebGL / 2);
  var x2 = centerXWebGL + (widthWebGL / 2);
  var y = centerYWebGL + (heightWebGL / 2);
  var y2 = centerYWebGL - (heightWebGL / 2);
  this.rectangle.set(x, y, x2, y2, widthWebGL, heightWebGL);
  this.rectangle.updateMesh(0.005);
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
  addedText.maxWidthPercent = this.widthPercent;
  addedText.maxHeightPercent = this.heightPercent;
  addedText.handleResize();
  var selectedCoordXPercent, selectedCoordYPercent;
  if (addedText.marginMode == MARGIN_MODE_2D_CENTER){
    selectedCoordXPercent = 100 - this.centerXPercent;
    selectedCoordYPercent = 100 - this.centerYPercent;
  }else if (addedText.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    selectedCoordXPercent = this.centerXPercent - (this.widthPercent / 2);
    selectedCoordYPercent = 100 - this.centerYPercent - (this.heightPercent / 2);
  }else{
    selectedCoordXPercent = 100 - this.centerXPercent - (this.widthPercent / 2);
    selectedCoordYPercent = this.centerYPercent + (this.heightPercent / 2);
  }
  addedText.set2DCoordinates(selectedCoordXPercent, selectedCoordYPercent);
  addedText.containerParent = this;
  this.addedText = addedText;
}

Container2D.prototype.insertSprite = function(sprite){
  sprite.setRotation(0);
  var maxWidth = this.widthPercent;
  var maxHeight = this.heightPercent;
  var sourceWidth = sprite.originalWidth;
  var sourceHeight = sprite.originalHeight;
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
    selectedCoordXPercent = this.centerXPercent - (this.widthPercent / 2);
    selectedCoordYPercent = 100 - this.centerYPercent - (this.heightPercent / 2);
  }else{
    selectedCoordXPercent = 100 - this.centerXPercent - (this.widthPercent / 2);
    selectedCoordYPercent = this.centerYPercent - (this.heightPercent / 2);
  }
  sprite.set2DCoordinates(selectedCoordXPercent, selectedCoordYPercent);
  sprite.containerParent = this;
  this.sprite = sprite;
}
