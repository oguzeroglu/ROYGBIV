// parameters:
//  name
//  positionXPercent
//  positionYPercent
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
//  keyColor
//  keyCharMargin
//  keyCharSize
//  refCharSize
//  refCharInnerHeight
var VirtualKeyboard = function(parameters){
  this.isVirtualKeyboard = true;
  this.name = parameters.name;
  this.positionXPercent = parameters.positionXPercent;
  this.positionYPercent = parameters.positionYPercent;
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
  this.keyColor = parameters.keyColor;
  this.keyCharMargin = parameters.keyCharMargin;
  this.keyCharSize = parameters.keyCharSize;
  this.refCharSize = parameters.refCharSize;
  this.refCharInnerHeight = parameters.refCharInnerHeight;

  this.font = fonts[this.fontName];

  this.reusableColor = new THREE.Color(parameters.keyColor);

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
      {key: "caps", weight: 1.5}, {key: "z", weight: 1}, {key: "x", weight: 1}, {key: "c", weight: 1}, {key: "v", weight: 1},
      {key: "b", weight: 1}, {key: "n", weight: 1}, {key: "m", weight: 1}, {key: "del", weight: 1.5}
    ],
    [
      {key: "123", weight: 1.5}, {key: ",", weight: 1}, {key: "space", weight: 4.5},
      {key: ".", weight: 1}, {key: "ok", weight: 1.5}
    ]
  ];

  this.keyContainers = [];
  this.textsByKey = new Object();
  this.isCapslockOn = false;
  this.isNumeric = false;

  this.keysByContainerName = new Object();
  this.childContainersByContainerName = new Object();

  this.numbersByKey = {
    "q": "0", "w": "1", "e": "2", "r": "3", "t": "4", "y": "5", "u": "6",
    "i": "7", "o": "8", "p": "9"
  }

  this.initialize();
}

VirtualKeyboard.prototype.onDelPress = function(){

}

VirtualKeyboard.prototype.onSpacePress = function(){

}

VirtualKeyboard.prototype.onOKPress = function(){

}

VirtualKeyboard.prototype.onKeyPress = function(key){

}

VirtualKeyboard.prototype.onMouseClickIntersection = function(childContainerName){
  var key = this.keysByContainerName[childContainerName];
  if (key.length == 1){
    if (this.isNumeric){
      var number = this.numbersByKey[key];
      if (number){
        this.onKeyPress(number);
        return;
      }
    }
    if (this.isCapslockOn){
      this.onKeyPress(key.toUpperCase());
    }else{
      this.onKeyPress(key);
    }
  }
  if (key == "del"){
    this.onDelPress();
  }else if (key == "space"){
    this.onSpacePress();
  }else if (key == "ok"){
    this.onOKPress();
  }else if (key == "123"){
    this.onModeChange();
  }else if (key == "caps" && !this.isNumeric){
    this.onCapsLock();
  }
}

VirtualKeyboard.prototype.onModeChange = function(){
  this.isNumeric = !this.isNumeric;
  if (this.isNumeric){
    this.textsByKey["123"].setText("ABC");
    this.textsByKey["caps"].setText("");
    for (var key in this.textsByKey){
      if (key.length == 1 && key != "." && key != ","){
        this.textsByKey[key].setText("");
      }
    }
    this.textsByKey["q"].setText("0");
    this.textsByKey["w"].setText("1");
    this.textsByKey["e"].setText("2");
    this.textsByKey["r"].setText("3");
    this.textsByKey["t"].setText("4");
    this.textsByKey["y"].setText("5");
    this.textsByKey["u"].setText("6");
    this.textsByKey["i"].setText("7");
    this.textsByKey["o"].setText("8");
    this.textsByKey["p"].setText("9");
  }else{
    this.textsByKey["123"].setText("123");
    this.textsByKey["caps"].setText("CAPS");
    for (var key in this.textsByKey){
      if (key.length == 1){
        if (this.isCapslockOn){
          this.textsByKey[key].setText(key.toUpperCase());
        }else{
          this.textsByKey[key].setText(key);
        }
      }
    }
  }
}

VirtualKeyboard.prototype.onCapsLock = function(){
  this.isCapslockOn = !this.isCapslockOn;
  if (this.isCapslockOn){
    for (var key in this.textsByKey){
      if (key.length == 1){
        this.textsByKey[key].setText(key.toUpperCase());
      }
    }
  }else{
    for (var key in this.textsByKey){
      if (key.length == 1){
        this.textsByKey[key].setText(key.toLowerCase());
      }
    }
  }
}

VirtualKeyboard.prototype.handleResize = function(){
  this.backgroundContainer.handleResize();
  for (var i = 0; i<this.keyContainers.length; i++){
    this.keyContainers[i].handleResize();
  }
}

VirtualKeyboard.prototype.initializeKey = function(x, y, width, height, key){
  var container = new Container2D(generateUUID(), x, y, width, height, this);
  container.assignedKey = key;
  container.isClickable = true;
  if (this.keyHasBorder){
    container.setBorder(this.keyBorderColor, this.keyBorderThickness);
    container.makeVisible();
  }
  if (this.keyHasBackground){
    container.setBackground(this.keyBackgroundColor, this.keyBackgroundAlpha, this.keyBackgroundTextureName);
  }
  var text = new AddedText(null, this.font, key, REUSABLE_VECTOR, this.reusableColor, 1, this.keyCharSize, key.length);
  text.marginMode = MARGIN_MODE_2D_CENTER;
  text.setMarginBetweenChars(this.keyCharMargin);
  text.refCharSize = this.refCharSize;
  text.refInnerHeight = this.refCharInnerHeight;
  text.handleBoundingBox();
  text.set2DStatus(true);
  text.mesh.visible = true;
  container.insertAddedText(text);
  this.keyContainers.push(container);
  this.textsByKey[key] = text;
  this.keysByContainerName[container.name] = key;
  this.childContainersByContainerName[container.name] = container;
  childContainers[container.name] = this;
  container.handleRectangle();
}

VirtualKeyboard.prototype.initialize = function(){
  this.backgroundContainer = new Container2D(null, this.positionXPercent, this.positionYPercent, this.totalWidthPercent, this.totalHeightPercent, this);
  if (this.hasBackground){
    this.backgroundContainer.setBackground(this.backgroundColor, this.backgroundAlpha, this.backgroundTextureName);
  }
  if (this.hasBorder){
    this.backgroundContainer.setBorder(this.borderColor, this.borderThickness);
    this.backgroundContainer.makeVisible();
  }

  var realKeyWidth = this.totalWidthPercent * (this.keyWidthPercent) / 100;
  var realKeyHeight = this.totalHeightPercent * (this.keyHeightPercent) / 100;

  var topY = this.positionYPercent + (this.totalHeightPercent / 2);
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
    var curX = this.positionXPercent - (this.totalWidthPercent / 2) + padX + offs;
    curY = curY - (realKeyHeight / 2);
    for (var i2 = 0; i2<curRow.length; i2++){
      curX += (realKeyWidth * curRow[i2].weight / 2);
      this.initializeKey(curX, curY, realKeyWidth * curRow[i2].weight, realKeyHeight, curRow[i2].key);
      curX += padX + (realKeyWidth * curRow[i2].weight / 2);
    }
    curY = curY - padY - (realKeyHeight / 2);
  }
}
