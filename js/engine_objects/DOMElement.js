var DOMElement = function(type, properties){
  this.isDOMElement = true;
  this.type = type;

  var width = properties.width || 50;
  var height = properties.height || 50;
  var backgroundColor= properties.backgroundColor || "white";
  var centerXPercent = properties.centerXPercent || 0;
  var centerYPercent = properties.centerYPercent || 0;
  var borderRadiusPercent = properties.borderRadiusPercent;
  var opacity = properties.opacity || 1;

  var element = document.createElement(type);

  element.style.width = width + "px";
  element.style.height = height + "px";
  element.style.backgroundColor = backgroundColor;
  element.style.position = "absolute";
  element.style.left = centerXPercent + "%";
  element.style.top = centerYPercent + "%";
  element.style.transform = "translate(-50%, -50%)";
  element.style.opacity = opacity;

  if (borderRadiusPercent){
    element.style.borderRadius = borderRadiusPercent + "%";
  }

  element.zIndex = 1000;
  this.element = element;

  document.body.appendChild(element);
  domElements[generateUUID()] = this;
}

DOMElement.prototype.setPosition = function(centerXPercent, centerYPercent){
  this.element.style.left = centerXPercent + "%";
  this.element.style.top = centerYPercent + "%";
}

DOMElement.prototype.setBackgroundColor = function(bgColor){
  this.element.style.backgroundColor = bgColor;
}

DOMElement.prototype.setOpacity = function(opacity){
  this.element.style.opacity = opacity;
}

DOMElement.prototype.setSize = function(width, height){
  this.element.style.width = width + "px";
  this.element.style.height = height + "px";
}

DOMElement.prototype.onModeSwitch = function(){
  document.body.removeChild(this.element);
}
