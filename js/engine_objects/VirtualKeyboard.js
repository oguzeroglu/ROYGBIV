// parameters:
//  name
//  maxLength
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
//  keyInteractionColor
//  keyCharSize
//  refCharSize
//  refCharInnerHeight
var VirtualKeyboard = function(parameters){
  this.isVirtualKeyboard = true;
  this.name = parameters.name;
  this.parameters = parameters;

  this.keyPressThreshold = 5;
  if (isMobile){
    this.keyPressThreshold = 250;
  }
  this.keyAddThrehsold = 200;

  this.maxLength = parameters.maxLength;
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
  this.keyInteractionColor = parameters.keyInteractionColor;
  this.keyCharSize = parameters.keyCharSize;
  this.refCharSize = parameters.refCharSize;
  this.refCharInnerHeight = parameters.refCharInnerHeight;

  this.font = fonts[this.fontName];

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
      {key: "?123", weight: 1.5}, {key: ",", weight: 1}, {key: "space", weight: 4.5},
      {key: ".", weight: 1}, {key: "ok", weight: 1.5}
    ]
  ];

  this.keypressTestKeysNonNumeric = [
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
    "A", "S", "D", "F", "G", "H", "J", "K", "L",
    "Z", "X", "C", "V", "B", "N", "M",
    ",", "."
  ];
  this.keypressTestKeysNumeric = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "+", "=", ";", "-", "_", "|", "<", ">", "(", ")", "!", "#",
    ":", "{", "?", "}"
  ];

  this.keyContainers = [];
  this.textsByKey = new Object();
  this.isCapslockOn = false;
  this.isNumeric = false;

  this.keysByContainerName = new Object();
  this.containersByKey = new Object();
  this.childContainersByContainerName = new Object();

  this.numbersByKey = {
    "q": "0", "w": "1", "e": "2", "r": "3", "t": "4", "y": "5", "u": "6",
    "i": "7", "o": "8", "p": "9",
    "a": "+", "s": "=", "d": ";", "f": "-", "g": "_", "h": "|", "j": "<", "k": ">", "l": "(",
    "z": ")", "x": "!", "c": "#", "v": ":", "b": "{", "n": "?", "m": "}"
  }

  if (!IS_WORKER_CONTEXT){
    this.initialize();
  }

  this.text = "";
}

VirtualKeyboard.prototype.resetColors = function(){
  for (var i = 0; i<this.keyContainers.length; i++){
    var container = this.keyContainers[i];
    container.addedText.setColor(this.keyColor);
    if (this.keyHasBorder){
      container.setBorder(this.keyBorderColor, this.keyBorderThickness);
    }
  }
}

VirtualKeyboard.prototype.deactivate = function(){
  if (activeVirtualKeyboard != this){
    return;
  }
  this.hideVisually();
  activeVirtualKeyboard = 0;
  this.text = "";
}

VirtualKeyboard.prototype.activate = function(){
  if (activeVirtualKeyboard == this){
    return;
  }
  for (var virtualKeyboardName in sceneHandler.getVirtualKeyboards()){
    var vk = virtualKeyboards[virtualKeyboardName];
    vk.resetColors();
    vk.hideVisually();
  }
  this.showVisually();
  activeVirtualKeyboard = this;
  this.text = "";
}

VirtualKeyboard.prototype.onFlush = function(flushedText){
  if (mode == 1 && activeVirtualKeyboard == this && this.onFlushCallback){
    this.onFlushCallback(flushedText);
  }
}

VirtualKeyboard.prototype.onTextChange = function(text){
  if (mode == 1 && activeVirtualKeyboard == this && this.onTextChangeCallback){
    this.onTextChangeCallback(text);
  }
}

VirtualKeyboard.prototype.hasTexturePackUsed = function(tpName){
  return ((tpName == this.parameters.backgroundTextureName) || (tpName == this.parameters.keyBackgroundTextureName));
}

VirtualKeyboard.prototype.onShiftPress = function(isPressed){
  if (mode == 1){
    return;
  }
  var stat = true;
  if (isPressed){
    stat = false;
  }
  if (this.hasBorder){
    this.backgroundContainer.rectangle.mesh.visible = stat;
  }
  if (this.backgroundContainer.hasBackground){
    this.backgroundContainer.backgroundSprite.mesh.visible = stat;
  }
  for (var i = 0; i<this.keyContainers.length; i++){
    if (this.keyContainers[i].hasBorder){
      this.keyContainers[i].rectangle.mesh.visible = stat;
    }
    if (this.keyContainers[i].hasBackground){
      this.keyContainers[i].backgroundSprite.mesh.visible = stat;
    }
  }
  for (var key in this.textsByKey){
    this.textsByKey[key].mesh.visible = stat;
  }
}

VirtualKeyboard.prototype.destroy = function(){
  if (this.hasBorder){
    this.backgroundContainer.destroy();
  }
  if (this.hasBackground){
    this.backgroundContainer.destroy();
  }
  for (var i = 0; i<this.keyContainers.length; i++){
    this.keyContainers[i].destroy();
  }
  for (var key in this.textsByKey){
    this.textsByKey[key].destroy();
  }
}

VirtualKeyboard.prototype.hideVisually = function(){
  if (this.hasBorder){
    this.backgroundContainer.makeInvisible();
  }
  if (this.backgroundContainer.hasBackground){
    this.backgroundContainer.backgroundSprite.hideVisually();
  }
  for (var i = 0; i<this.keyContainers.length; i++){
    if (this.keyContainers[i].hasBorder){
      this.keyContainers[i].makeInvisible();
    }
    if (this.keyContainers[i].hasBackground){
      this.keyContainers[i].backgroundSprite.hideVisually();
    }
  }
  for (var key in this.textsByKey){
    this.textsByKey[key].hideVisually();
  }
  this.isHidden = true;
}

VirtualKeyboard.prototype.showVisually = function(){
  if (this.hasBorder){
    this.backgroundContainer.makeVisible();
  }
  if (this.backgroundContainer.hasBackground){
    this.backgroundContainer.backgroundSprite.showVisually();
  }
  for (var i = 0; i<this.keyContainers.length; i++){
    if (this.keyContainers[i].hasBorder){
      this.keyContainers[i].makeVisible();
    }
    if (this.keyContainers[i].hasBackground){
      this.keyContainers[i].backgroundSprite.showVisually();
    }
  }
  for (var key in this.textsByKey){
    this.textsByKey[key].showVisually();
  }
  this.isHidden = false;
}

VirtualKeyboard.prototype.export = function(){
  return this.parameters;
}

VirtualKeyboard.prototype.exportLightweight = function(){
  var exportObj = new Object();
  exportObj.parameters = this.parameters;
  exportObj.keyContainers = new Object();
  for (var childContainerName in this.childContainersByContainerName){
    exportObj.keyContainers[childContainerName] = this.childContainersByContainerName[childContainerName].exportLightweight();
  }
  return exportObj;
}

VirtualKeyboard.prototype.onMouseDownIntersection = function(childContainerName){
  if (mode == 1 && activeVirtualKeyboard != this){
    return;
  }
  this.onMouseClickIntersection(childContainerName);
}

VirtualKeyboard.prototype.onDelPress = function(){
  if (this.text == ""){
    return;
  }
  this.text = this.text.substring(0, this.text.length - 1);
  this.onTextChange(this.text);
}

VirtualKeyboard.prototype.onSpacePress = function(){
  if (this.text.length >= this.maxLength){
    return;
  }
  this.text += " ";
  this.onTextChange(this.text);
}

VirtualKeyboard.prototype.onOKPress = function(){
  if (this.text == ""){
    return;
  }
  this.onFlush(this.text);
  this.text = "";
}

VirtualKeyboard.prototype.onKeyPress = function(key){
  if (this.text.length >= this.maxLength){
    return;
  }
  this.text += key;
  this.onTextChange(this.text);
}

VirtualKeyboard.prototype.onMouseMoveIntersection = function(childContainerName){
  if (mode == 1 && activeVirtualKeyboard != this){
    return;
  }
  if (!childContainerName){
    if (this.lastColoredTextInstance){
      this.lastColoredTextInstance.setColor(this.keyColor);
      this.lastColoredTextInstance = 0;
      if (this.keyHasBorder){
        this.lastColoredContainerInstance.setBorder(this.keyBorderColor, this.keyBorderThickness);
        this.lastColoredContainerInstance = 0;
      }
    }
    return;
  }
  var container = this.childContainersByContainerName[childContainerName];
  if (this.lastColoredTextInstance){
    this.lastColoredTextInstance.setColor(this.keyColor);
    this.lastColoredTextInstance = 0;
    if (this.keyHasBorder){
      this.lastColoredContainerInstance.setBorder(this.keyBorderColor, this.keyBorderThickness);
      this.lastColoredContainerInstance = 0;
    }
  }
  var textInstance = container.addedText;
  textInstance.setColor(this.keyInteractionColor);
  this.lastColoredTextInstance = textInstance;
  if (this.keyHasBorder){
    container.setBorder(this.keyInteractionColor, this.keyBorderThickness);
    this.lastColoredContainerInstance = container;
  }
}

VirtualKeyboard.prototype.onMouseClickIntersection = function(childContainerName){
  if (mode == 1 && activeVirtualKeyboard != this){
    return;
  }
  if (isMobile){
    this.onKeyInteractionWithKeyboard(this.childContainersByContainerName[childContainerName]);
  }
  var key = this.keysByContainerName[childContainerName];
  var now = performance.now();
  if (this.lastKey && this.lastKey == key && this.lastKeySelectionTime && (now - this.lastKeySelectionTime <= this.keyAddThrehsold)){
    return;
  }
  this.lastKeySelectionTime = now;
  this.lastKey = key;
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
  }else if (key == "?123"){
    this.onModeChange();
  }else if (key == "caps" && !this.isNumeric){
    this.onCapsLock();
  }
}

VirtualKeyboard.prototype.onModeChange = function(){
  this.isNumeric = !this.isNumeric;
  if (this.isNumeric){
    this.textsByKey["?123"].setText("ABC");
    this.textsByKey["caps"].setText("");
    for (var key in this.textsByKey){
      if (key.length == 1 && key != "." && key != ","){
        this.textsByKey[key].setText("");
      }
    }
    for (var key in this.numbersByKey){
      this.textsByKey[key].setText(this.numbersByKey[key]);
    }
  }else{
    this.textsByKey["?123"].setText("?123");
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
  var text = new AddedText(null, this.font, key, REUSABLE_VECTOR, new THREE.Color(this.parameters.keyColor), 1, this.keyCharSize, key.length);
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
  this.containersByKey[key.toUpperCase()] = container;
  if (this.numbersByKey[key]){
    this.containersByKey[this.numbersByKey[key]] = container;
  }
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

VirtualKeyboard.prototype.onKeyInteractionWithKeyboard = function(container){
  if (mode == 1 && activeVirtualKeyboard != this){
    return;
  }
  var lastKeyInteractionWithKeyboardTime = this.lastKeyInteractionWithKeyboardTime? this.lastKeyInteractionWithKeyboardTime: 0;
  var now = performance.now();
  if (now - lastKeyInteractionWithKeyboardTime <= this.keyPressThreshold){
    return;
  }
  var textInstance = container.addedText;
  textInstance.setColor(this.keyInteractionColor);
  this.lastColoredTextInstanceWithKeyboard = textInstance;
  if (this.keyHasBorder){
    container.setBorder(this.keyInteractionColor, this.keyBorderThickness);
    this.lastColoredContainerInstanceWithKeyboard = container;
  }
  this.lastKeyInteractionWithKeyboardTime = now;
  this.lastColoredContainerInstanceWithKeyboard = container;
  this.lastColoredTextInstanceWithKeyboard = textInstance;
}

VirtualKeyboard.prototype.update = function(){
  if (mode == 1 && this.lastColoredContainerInstance && isMouseDown){
    this.onMouseDownIntersection(this.lastColoredContainerInstance.name);
  }
  if (this.lastKeyInteractionWithKeyboardTime){
    var now = performance.now();
    if (now - this.lastKeyInteractionWithKeyboardTime >= this.keyPressThreshold/2){
      this.lastColoredTextInstanceWithKeyboard.setColor(this.keyColor);
      if (this.keyHasBorder){
        this.lastColoredContainerInstanceWithKeyboard.setBorder(this.keyBorderColor, this.keyBorderThickness);
      }
    }
  }
  if (this.isCapslockOn){
    var capsContainer = this.containersByKey["CAPS"];
    var capsText = capsContainer.addedText;
    capsText.setColor(this.keyInteractionColor);
    if (this.keyHasBorder){
      capsContainer.setBorder(this.keyInteractionColor, this.keyBorderThickness);
    }
  }else if (!this.isCapsOn){
    var capsContainer = this.containersByKey["CAPS"];
    var capsText = capsContainer.addedText;
    capsText.setColor(this.keyColor);
    if (this.keyHasBorder){
      capsContainer.setBorder(this.keyBorderColor, this.keyBorderThickness);
    }
  }
  var pressed = false;
  if (!isMobile){
    if (this.isCapslockOn && !keyboardEventHandler.isCapsOn){
      this.onMouseClickIntersection(this.containersByKey["CAPS"].name);
      this.onKeyInteractionWithKeyboard(this.containersByKey["CAPS"]);
      pressed = true;
    }else if (!this.isCapslockOn && keyboardEventHandler.isCapsOn){
      this.onMouseClickIntersection(this.containersByKey["CAPS"].name);
      this.onKeyInteractionWithKeyboard(this.containersByKey["CAPS"]);
      pressed = true;
    }
    if (!pressed){
      for (var i = 0; i < this.keypressTestKeysNonNumeric.length; i++){
        if (keyboardBuffer[this.keypressTestKeysNonNumeric[i]]){
          if (this.isNumeric){
            this.onModeChange();
          }
          this.onMouseClickIntersection(this.containersByKey[this.keypressTestKeysNonNumeric[i]].name);
          this.onKeyInteractionWithKeyboard(this.containersByKey[this.keypressTestKeysNonNumeric[i]]);
          pressed = true;
          break;
        }
      }
      if (!pressed){
        for (var i = 0; i < this.keypressTestKeysNumeric.length; i++){
          if (keyboardBuffer[this.keypressTestKeysNumeric[i]]){
            if (!this.isNumeric){
              this.onModeChange();
            }
            this.onMouseClickIntersection(this.containersByKey[this.keypressTestKeysNumeric[i]].name);
            this.onKeyInteractionWithKeyboard(this.containersByKey[this.keypressTestKeysNumeric[i]]);
            pressed = true;
            break;
          }
        }
      }
      if (!pressed){
        if (keyboardBuffer["Backspace"]){
          this.onMouseClickIntersection(this.containersByKey["DEL"].name);
          this.onKeyInteractionWithKeyboard(this.containersByKey["DEL"]);
        }else if (keyboardBuffer["Space"]){
          this.onMouseClickIntersection(this.containersByKey["SPACE"].name);
          this.onKeyInteractionWithKeyboard(this.containersByKey["SPACE"]);
        }else if (keyboardBuffer["Enter"]){
          this.onMouseClickIntersection(this.containersByKey["OK"].name);
          this.onKeyInteractionWithKeyboard(this.containersByKey["OK"]);
        }
      }
    }
  }
}
