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
