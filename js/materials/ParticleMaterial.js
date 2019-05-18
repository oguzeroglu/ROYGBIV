var ParticleMaterial = function(configurations){
  this.isParticleMaterial = true;
  this.color = configurations.color;
  this.targetColor = configurations.targetColor;
  this.texture = configurations.textureName;
  this.size = configurations.size;
  this.alpha = configurations.alpha;
  this.rgbFilter = configurations.rgbFilter;
  this.colorStep = configurations.colorStep;
  this.noTargetColor = false;
  if (!this.targetColor){
    this.noTargetColor = true;
    this.targetColor = this.color;
  }
  if (!(typeof this.colorStep == UNDEFINED)){
    this.colorStep *= 4;
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
