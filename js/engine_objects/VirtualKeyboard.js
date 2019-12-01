// parameters:
//  name
//  fontName
//  totalWidthPercent
//  totalHeightPercent
//  hasBackground
//  backgroundColor
//  backgroundAlpha
//  backgroundTextureName
//  hasBorder
//  borderThickness
//  borderColor
//  keyWidthPercent
//  keyHeightPercent
//  keyHasBorder
//  keyBorderColor
//  keyBorderThickness
//  keyHasBackground
//  keyBackgroundColor
//  keyBackgroundAlpha
//  keyBackgroundTextureName
var VirtualKeyboard = function(parameters){
  this.name = parameters.name;
  this.fontName = parameters.fontName;
  this.totalWidthPercent = parameters.totalWidthPercent;
  this.totalHeightPercent = parameters.totalHeightPercent;
  this.hasBackground = parameters.hasBackground;
  this.backgroundColor = parameters.backgroundColor;
  this.backgroundAlpha = parameters.backgroundAlpha;
  this.backgroundTextureName = parameters.backgroundTextureName;
  this.hasBorder = parameters.hasBorder;
  this.borderThickness = parameters.borderThickness;
  this.borderColor = parameters.borderColor;
  this.keyWidthPercent = parameters.keyWidthPercent;
  this.keyHeightPercent = parameters.keyHeightPercent;
  this.keyHasBorder = parameters.keyHasBorder;
  this.keyBorderColor = parameters.keyBorderColor;
  this.keyBorderThickness = parameters.keyBorderThickness;
  this.keyHasBackground = parameters.keyHasBackground;
  this.keyBackgroundColor = parameters.keyBackgroundColor;
  this.keyBackgroundAlpha = parameters.keyBackgroundAlpha;
  this.keyBackgroundTextureName = parameters.keyBackgroundTextureName;

  this.keys = [
    [
      {key: "q", weight: 1}, {key: "w", weight: 1}, {key: "e", weight: 1}, {key: "r", weight: 1}, {key: "t", weight: 1},
      {key: "y", weight: 1}, {key: "u", weight: 1}, {key: "i", weight: 1}, {key: "o", weight: 1}, {key: "p", weight: 1}
    ],
    [
      {key: "a", weight: 1}, {key: "s", weight: 1}, {key: "d", weight: 1}, {key: "f", weight: 1}, {key: "g", weight: 1},
      {key: "h", weight: 1}, {key: "j", weight: 1}, {key: "k", weight: 1}, {key: "l", weight: 1}
    ],
    [
      {key: "CAPS", weight: 1.5}, {key: "z", weight: 1}, {key: "x", weight: 1}, {key: "c", weight: 1}, {key: "v", weight: 1},
      {key: "b", weight: 1}, {key: "n", weight: 1}, {key: "m", weight: 1}, {key: "DEL", weight: 1.5}
    ],
    [
      {key: "MODE", weight: 1.5}, {key: ",", weight: 1}, {key: "SPACE", weight: 4.5},
      {key: ".", weight: 1}, {key: "OK", weight: 1.5}
    ]
  ];

  this.initialize();
}

VirtualKeyboard.prototype.initializeKey = function(x, y, width, height){
  var container = new Container2D(null, x, y, width, height);
  if (this.keyHasBorder){
    container.setBorder(this.keyBorderColor, this.keyBorderThickness);
    container.makeVisible();
  }
  if (this.keyHasBackground){
    container.setBackground(this.keyBackgroundColor, this.keyBackgroundAlpha, this.keyBackgroundTextureName);
  }
}

VirtualKeyboard.prototype.initialize = function(){
  this.backgroundContainer = new Container2D(null, 50, (this.totalHeightPercent / 2), this.totalWidthPercent, this.totalHeightPercent);
  if (this.hasBackground){
    this.backgroundContainer.setBackground(this.backgroundColor, this.backgroundAlpha, this.backgroundTextureName);
  }
  if (this.hasBorder){
    this.backgroundContainer.setBorder(this.borderColor, this.borderThickness);
    this.backgroundContainer.makeVisible();
  }

  var realKeyWidth = this.totalWidthPercent * (this.keyWidthPercent) / 100;
  var realKeyHeight = this.totalHeightPercent * (this.keyHeightPercent) / 100;

  var topY = this.totalHeightPercent;
  var padY = (this.totalHeightPercent - (4 * realKeyHeight)) / 5;

  var curY = topY - padY;
  for (var i = 0; i<this.keys.length; i++){
    var curRow = this.keys[i];
    var totalRowWidth = 0;
    for (var i2= 0; i2<curRow.length; i2++){
      totalRowWidth += realKeyWidth * (curRow[i2].weight);
    }
    var offs = 0;
    //if (i == 1){
    //  offs = 2;
    //}else if (i == 3){
    //  offs = 8;
    //}
    var padX = (this.totalWidthPercent - (2 * offs) - totalRowWidth) / (curRow.length + 1);
    var curX = 50 - (this.totalWidthPercent / 2) + padX + offs;
    curY = curY - (realKeyHeight / 2);
    for (var i2 = 0; i2<curRow.length; i2++){
      curX += (realKeyWidth * curRow[i2].weight / 2);
      this.initializeKey(curX, curY, realKeyWidth * curRow[i2].weight, realKeyHeight);
      curX += padX + (realKeyWidth * curRow[i2].weight / 2);
    }
    curY = curY - padY - (realKeyHeight / 2);
  }
}
