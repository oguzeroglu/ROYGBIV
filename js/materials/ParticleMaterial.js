var ParticleMaterial = function(configurations){
  this.color = configurations.color;
  this.targetColor = configurations.targetColor;
  this.texture = configurations.textureName;
  this.size = configurations.size;
  this.alpha = configurations.alpha;
  this.rgbFilter = configurations.rgbFilter;
  this.colorStep = configurations.colorStep;

  if (!this.targetColor){
    this.targetColor = this.color;
  }

  this.color = this.color.toLowerCase();
  var threeColor = REUSABLE_COLOR.set(this.color);
  this.red = threeColor.r;
  this.green = threeColor.g;
  this.blue = threeColor.b;
  this.targetColor = this.targetColor.toLowerCase();
  threeColor = REUSABLE_COLOR.set(this.targetColor);
  this.targetRed = threeColor.r;
  this.targetGreen = threeColor.g;
  this.targetBlue = threeColor.b;
}
