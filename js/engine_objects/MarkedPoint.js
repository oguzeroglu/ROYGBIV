var MarkedPoint = function(name, x, y, z){
  this.name = name;
  this.x = x;
  this.y = y;
  this.z = z;
  this.vector3D = new THREE.Vector3(x, y, z);
  this.object3D = new THREE.Object3D();
  this.object3D.position.copy(this.vector3D);
  this.vector2D = this.get2DVector();
  this.isHidden = false;
}

MarkedPoint.prototype.renderToScreen = function(){
  this.div = document.createElement("div");
  this.div.className = "markedPoint noselect";
  this.div.style.left = this.vector2D.x + "px";
  this.div.style.top = this.vector2D.y + "px";
  this.div.style.visibility = "visible";
  document.getElementsByTagName("body")[0].appendChild(this.div);
  this.innerDiv = document.createElement("div");
  this.markerSpan = document.createElement("span");
  this.markerSpan.style.color = "#20C20E";
  this.markerIcon = document.createElement("i");
  this.markerIcon.className="fa fa-map-marker";
  this.markerSpan.innerHTML = " "+this.name+" ";
  this.markerSpan.appendChild(this.markerIcon);
  this.innerDiv.appendChild(this.markerSpan);
  this.div.appendChild(this.innerDiv);
}

MarkedPoint.prototype.update = function(){
  if (this.isObjectInFrustum()){
    this.div.style.visibility = "visible";
    this.vector2D = this.get2DVector();
    this.div.style.left = this.vector2D.x + 'px';
    this.div.style.top = this.vector2D.y + 'px';
  }else{
    this.div.style.visibility = "hidden";
  }
}

MarkedPoint.prototype.isObjectInFrustum = function(){
  frustum.setFromMatrix(REUSABLE_MATRIX_4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  return frustum.containsPoint(this.object3D.position);
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
    document.getElementsByTagName("body")[0].removeChild(this.div);
  }
}

MarkedPoint.prototype.hide = function(showAgainOnTheNextModeSwitch){
  if (this.isHidden){
    return;
  }
  document.getElementsByTagName("body")[0].removeChild(this.div);
  this.isHidden = true;
  if (showAgainOnTheNextModeSwitch){
    this.showAgainOnTheNextModeSwitch = true;
  }
}

MarkedPoint.prototype.show = function(){
  if (!this.isHidden){
    return;
  }
  this.renderToScreen();
  this.isHidden = false;
}

MarkedPoint.prototype.get2DVector = function(){
  var vector = REUSABLE_VECTOR;
  var widthHalf = 0.5 * renderer.context.canvas.width / renderer.getPixelRatio();
  var heightHalf = 0.5 * renderer.context.canvas.height / renderer.getPixelRatio();
  this.object3D.updateMatrixWorld();
  vector.setFromMatrixPosition(this.object3D.matrixWorld);
  vector.project(camera);
  vector.x = ( vector.x * widthHalf ) + widthHalf;
  vector.y = - ( vector.y * heightHalf ) + heightHalf;
  var object2D = new Object();
  object2D.x = vector.x;
  object2D.y = vector.y;
  return object2D;
}
