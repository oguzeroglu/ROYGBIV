var Area = function(name, boundingBox, color){
  this.name = name;
  this.boundingBox = boundingBox;
  this.color = color;
  this.center = new THREE.Vector3();
  this.boundingBox.getCenter(this.center);
  this.object3D = new THREE.Object3D();
  this.object3D.position.copy(this.center);
  this.vector2D = this.get2DVector();
}

Area.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.bbMinX = this.boundingBox.min.x;
  exportObject.bbMinY = this.boundingBox.min.y;
  exportObject.bbMinZ = this.boundingBox.min.z;
  exportObject.bbMaxX = this.boundingBox.max.x;
  exportObject.bbMaxY = this.boundingBox.max.y;
  exportObject.bbMaxZ = this.boundingBox.max.z;
  exportObject.color = this.color;
  return exportObject;
}

Area.prototype.destroy = function(){
  if (this.helper){
    if (areasVisible){
      scene.remove(this.helper);
    }
    this.helper.geometry.dispose();
    this.helper.material.dispose();
  }
  if (this.div){
    if (areasVisible){
      document.getElementsByTagName("body")[0].removeChild(this.div);
    }
  }
  areaBinHandler.deleteObjectFromBin(this.binInfo, this.name);
  for (var objName in addedObjects){
    if (addedObjects[objName].areaVisibilityConfigurations){
      if (!(typeof addedObjects[objName].areaVisibilityConfigurations[this.name] == UNDEFINED)){
        delete addedObjects[objName].areaVisibilityConfigurations[this.name];
      }
      if (addedObjects[objName].areaSideConfigurations){
        if (!(typeof addedObjects[objName].areaSideConfigurations[this.name] == UNDEFINED)){
          delete addedObjects[objName].areaSideConfigurations[this.name];
        }
      }
    }
  }
  for (var objName in objectGroups){
    if (objectGroups[objName].areaVisibilityConfigurations){
      if (!(typeof objectGroups[objName].areaVisibilityConfigurations[this.name] == UNDEFINED)){
        delete objectGroups[objName].areaVisibilityConfigurations[this.name];
      }
    }
    if (objectGroups[objName].areaSideConfigurations){
      if (!(typeof objectGroups[objName].areaSideConfigurations[this.name] == UNDEFINED)){
        delete objectGroups[objName].areaSideConfigurations[this.name];
      }
    }
  }
}

Area.prototype.renderToScreen = function(){
  if (!this.helper){
    var color = new THREE.Color(this.color);
    this.helper = new THREE.Box3Helper(this.boundingBox, color);
  }
  scene.add(this.helper);
  this.renderDivToScreen();
}

Area.prototype.renderDivToScreen = function(){
  if (!this.div){
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
  }else{
    document.getElementsByTagName("body")[0].appendChild(this.div);
  }
}

Area.prototype.get2DVector = function(){
  var vector = REUSABLE_VECTOR;
  var widthHalf = 0.5 * renderer.context.canvas.width;
  var heightHalf = 0.5 * renderer.context.canvas.height;
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

Area.prototype.update = function(){
  if (this.isObjectInFrustum()){
    this.div.style.visibility = "visible";
    this.vector2D = this.get2DVector();
    this.div.style.left = this.vector2D.x + 'px';
    this.div.style.top = this.vector2D.y + 'px';
  }else{
    this.div.style.visibility = "hidden";
  }
}

Area.prototype.hide = function(){
  document.getElementsByTagName("body")[0].removeChild(this.div);
  scene.remove(this.helper);
}

Area.prototype.isObjectInFrustum = function(){
  frustum.setFromMatrix(REUSABLE_MATRIX_4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  return frustum.containsPoint(this.object3D.position);
}
