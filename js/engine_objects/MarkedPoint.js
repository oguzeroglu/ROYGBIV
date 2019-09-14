var MarkedPoint = function(name, x, y, z, fromX, fromY, fromZ, gridDestroyed){
  this.name = name;
  this.x = x;
  this.y = y;
  this.z = z;
  this.fromX = fromX;
  this.fromY = fromY;
  this.fromZ = fromZ;
  this.gridDestroyed = gridDestroyed;
  if (!isDeployment){
    var txt = "@@1 (@@2, @@3, @@4)".replace("@@1", name).replace("@@2", x).replace("@@3", y).replace("@@4", z);
    this.text = new AddedText(null, defaultFont, txt, new THREE.Vector3(x, y, z), new THREE.Color("yellow"), 1, 15);
    this.text.isEditorHelper = true;
    this.text.setBackground("magenta", 1);
    this.text.setMarginBetweenChars(7);
    this.text.refInnerHeight = 569;
    this.text.refCharSize = 15;
    this.text.mesh.renderOrder = renderOrders.MARKED_POINT;
    this.text.handleResize();
    if (!gridDestroyed){
      var lineMaterial = new THREE.LineBasicMaterial({
    	 color: "lime"
      });
      var lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push(new THREE.Vector3(fromX, fromY, fromZ));
      lineGeometry.vertices.push(new THREE.Vector3((fromX + x) / 2, (fromY + y) / 2, (fromZ + z) / 2));
      lineGeometry.vertices.push(new THREE.Vector3(x, y, z));
      this.line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(this.line);
    }
  }
  this.isHidden = false;
}

MarkedPoint.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.x = this.x;
  exportObj.y = this.y;
  exportObj.z = this.z;
  exportObj.fromX = this.fromX;
  exportObj.fromY = this.fromY;
  exportObj.fromZ = this.fromZ;
  exportObj.gridDestroyed = this.gridDestroyed;
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
    this.text.destroy(true);
    if (this.line && this.line.geometry){
      this.line.geometry.dispose();
      this.line.material.dispose();
      scene.remove(this.line);
    }
  }
}

MarkedPoint.prototype.hide = function(showAgainOnTheNextModeSwitch){
  if (this.isHidden){
    return;
  }
  if (this.text){
    this.text.mesh.visible = false;
  }
  if (this.line){
    this.line.visible = false;
  }
  this.isHidden = true;
  if (showAgainOnTheNextModeSwitch){
    this.showAgainOnTheNextModeSwitch = true;
  }
}

MarkedPoint.prototype.show = function(){
  if (!this.isHidden){
    return;
  }
  if (this.text){
    this.text.mesh.visible = true;
  }
  if (this.line){
    this.line.visible = true;
  }
  this.isHidden = false;
}
