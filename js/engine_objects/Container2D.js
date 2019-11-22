var Container2D = function(name, centerXPercent, centerYPercent, widthPercent, heightPercent){
  this.name = name;
  this.centerXPercent = centerXPercent;
  this.centerYPercent = centerYPercent;
  this.widthPercent = widthPercent;
  this.heightPercent = heightPercent;
  this.handleRectangle();
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
}

Container2D.prototype.insertSprite = function(sprite){
  sprite.setWidthPercent(this.widthPercent);
  sprite.setHeightPercent(this.heightPercent);
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
}
