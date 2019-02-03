var MarkedPoint = function(name, x, y, z){
  this.name = name;
  this.x = x;
  this.y = y;
  this.z = z;
  var txt = "@@1 (@@2, @@3, @@4)".replace("@@1", name).replace("@@2", x).replace("@@3", y).replace("@@4", z);
  this.text = new AddedText(defaultFont, txt, new THREE.Vector3(x, y, z), LIME_COLOR, 1, 15);
  this.text.setMarginBetweenChars(7);
  this.text.refInnerWidth = 1440;
  this.text.refInnerHeight = 569;
  this.text.refCharSize = 15;
  this.text.refOffsetBetweenChars = 7;
  this.text.handleResize();
  this.isHidden = false;
}

MarkedPoint.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.x = this.x;
  exportObj.y = this.y;
  exportObj.z = this.z;
  exportObj.isHidden = this.isHidden;
  if (this.showAgainOnTheNextModeSwitch){
    exportObj.isHidden = false;
    exportObj.showAgainOnTheNextModeSwitch = true;
  }else if (this.showAgainOnTheNextModeSwitch != false){
    exportObj.showAgainOnTheNextModeSwitch = true;
  }
  return exportObj;
}

MarkedPoint.prototype.destroy = function(){
  if (!this.isHidden){
    this.text.destroy();
  }
}

MarkedPoint.prototype.hide = function(showAgainOnTheNextModeSwitch){
  if (this.isHidden){
    return;
  }
  this.text.mesh.visible = false;
  this.isHidden = true;
  if (showAgainOnTheNextModeSwitch){
    this.showAgainOnTheNextModeSwitch = true;
  }
}

MarkedPoint.prototype.show = function(){
  if (!this.isHidden){
    return;
  }
  this.text.mesh.visible = true;
  this.isHidden = false;
}
