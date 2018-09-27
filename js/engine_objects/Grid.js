/*
  CONSTRUCTOR PARAMETERS
    name -> name of this grid.
    parentName -> name of the GridSystem to which this Grid belongs
    startX -> upper left corner X coordinate
    startY -> upper left corner Y coordinate
    startZ -> upper left corner Z coordinate
    size -> size of this grid
    outlineColor -> X11 color name
    colNumber -> column number inside the grid system
    rowNumber -> row number inside the grid system
*/
var Grid = function(name, parentName, startX, startY, startZ, size,
                              outlineColor, colNumber, rowNumber, axis){
  this.name = name;
  this.parentName = parentName;
  this.startX = startX;
  this.startY = startY;
  this.startZ = startZ;
  this.size = size;
  this.outlineColor = outlineColor;
  this.selected = false;

  this.colNumber = colNumber;
  this.rowNumber = rowNumber;

  this.axis = axis;

  this.status = "ACTIVE";

  this.parentDestroyed = false;

  this.frustum = new THREE.Frustum();

  if (this.axis == "XZ"){

    this.centerX = startX + (size / 2);
    this.centerY = startY;
    this.centerZ = startZ - (size / 2);

  }else if (this.axis == "XY"){

    this.centerX = startX + (size / 2);
    this.centerY = startY - (size / 2);
    this.centerZ = startZ;

  }else if (this.axis == "YZ"){
    this.centerX = startX;
    this.centerY = startY - (size / 2);
    this.centerZ = startZ + (size / 2);
  }

  if (this.outlineColor != "red"){
    this.dotColor = "red";
  }else{
    this.dotColor = "white";
  }

}

Grid.prototype.makeMesh = function(size, startX, startY, startZ){
  this.material = new THREE.MeshBasicMaterial({color: this.outlineColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity:0.8
  });
  var geomKey = (
    "PlaneGeometry" + PIPE +
    size + PIPE + size + PIPE +
    "undefined" + PIPE + "undefined"
  );
  this.geometry = geometryCache[geomKey];
  if (!this.geometry){
    this.geometry = new THREE.PlaneGeometry(size, size);
    geometryCache[geomKey] = this.geometry;
  }
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.gridSystemName = this.parentName;
  if (this.axis == "XZ"){

    this.mesh.position.x = startX + (size / 2);
    this.mesh.position.y = startY;
    this.mesh.position.z = startZ - (size / 2);

  }else if (this.axis == "XY"){

    this.mesh.position.x = startX + (size / 2);
    this.mesh.position.y = startY - (size / 2);
    this.mesh.position.z = startZ;

  }else if (this.axis == "YZ"){

    this.mesh.position.x = startX;
    this.mesh.position.y = startY - (size / 2);
    this.mesh.position.z = startZ + (size / 2);

  }

  if (this.axis == "XZ"){
    this.mesh.rotation.x = Math.PI / 2;
  }else if (this.axis == "XY"){

  }else if (this.axis == "YZ"){
    this.mesh.rotation.y = Math.PI / 2;
  }

  this.centerDotGeometry = new THREE.Geometry();
  this.centerDotGeometry.vertices.push(new THREE.Vector3(this.centerX, this.centerY, this.centerZ));
  this.centerDotMaterial = new THREE.PointsMaterial( { color: this.dotColor, size: 4, sizeAttenuation: false } );
  this.dot = new THREE.Points( this.centerDotGeometry, this.centerDotMaterial);
  this.dot.gridSystemName = this.parentName;

  this.vertices = [];
  this.mesh.updateMatrixWorld();
  for (var i = 0; i<this.mesh.geometry.vertices.length; i++){
    var vertex = this.mesh.geometry.vertices[i].clone();
    vertex.applyMatrix4(this.mesh.matrixWorld);
    this.vertices.push(vertex);
  }
}

Grid.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.parentName = this.parentName;
  exportObject.startX = this.startX;
  exportObject.startY = this.startY;
  exportObject.startZ = this.startZ;
  exportObject.size = this.size;
  exportObject.outlineColor = this.outlineColor;
  exportObject.colNumber = this.colNumber;
  exportObject.rowNumber = this.rowNumber;
  exportObject.axis = this.axis;
  exportObject.status = this.status;
  exportObject.selected = this.selected;
  if (this.sliced){
    exportObject.sliced = true;
    exportObject.slicedGridSystemName = this.slicedGridSystemName;
  }else{
    exportObject.sliced = false;
  }

  return exportObject;
}

Grid.prototype.getCoordInfo = function(){
  if (this.axis == "XZ"){
    return "X: "+this.centerX + " , " + "Z: "+this.centerZ;
  }
  if (this.axis == "XY"){
    return "X: "+this.centerX + " , " + "Y: "+this.centerY;
  }
  if (this.axis == "YZ"){
    return "Y: "+this.centerY + " , " + "Z: "+this.centerZ;
  }
}

Grid.prototype.toggleSelect = function(sliced, printInfo, fromStateLoader, allAtOnce){
  if (this.status == "DESTROYED"){
    return;
  }
  if (this.selected){
    scene.remove(this.mesh);
    scene.remove(this.dot);
    delete gridSelections[this.name];
    for (var i = 0; i<this.divs.length; i++){
      this.divs[i].style.visibility = "hidden";
    }
  }else{
    if (!this.mesh){
      this.makeMesh(this.size, this.startX, this.startY, this.startZ);
    }
    scene.add(this.mesh);
    scene.add(this.dot);
    gridSelections[this.name] = this;
    if (!this.divs){
      this.showCornerPoints();
    }
  }
  this.selected = ! this.selected;
  if (sliced){
    this.sliced = true;
  }
  if (printInfo){
    terminal.clear();
    var info;
    if (this.selected){
      info = this.name+" selected ("+this.getCoordInfo()+")";
    }else{
      info = this.name+" released ("+this.getCoordInfo()+")";
    }
    terminal.printInfo(info);
  }
  if (!fromStateLoader && !allAtOnce){
    undoRedoHandler.push();
  }
}

Grid.prototype.showCornerPoints = function(){
  for (var i = 0; i < this.vertices.length; i++){
    var vertex = this.vertices[i];
    var vector3D = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
    var object3D = new THREE.Object3D();
    object3D.position.copy(vector3D);
    var coords2D = this.get2DVector(object3D);
    this.renderCornerHelper(coords2D, vector3D);
    this.object3D = object3D;
  }
}

Grid.prototype.get2DVector = function(object3D){
  var vector = REUSABLE_VECTOR;
  var widthHalf = 0.5 * renderer.context.canvas.width;
  var heightHalf = 0.5 * renderer.context.canvas.height;
  object3D.updateMatrixWorld();
  vector.setFromMatrixPosition(object3D.matrixWorld);
  vector.project(camera);
  vector.x = ( vector.x * widthHalf ) + widthHalf;
  vector.y = - ( vector.y * heightHalf ) + heightHalf;
  var object2D = new Object();
  object2D.x = vector.x;
  object2D.y = vector.y;
  return object2D;
}

Grid.prototype.renderCornerHelper = function(vector2D, vector3D){
  var div = document.createElement("div");
  div.className = "cornerHelper noselect";
  div.style.left = vector2D.x + "px";
  div.style.top = vector2D.y + "px";
  div.style.visibility = "hidden";
  document.getElementsByTagName("body")[0].appendChild(div);
  var innerDiv = document.createElement("div");
  var markerSpan = document.createElement("span");
  markerSpan.style.color = "#ffa500";
  markerSpan.style.opacity = 0.8;
  if (this.axis == "XZ"){
    markerSpan.innerHTML = "("+vector3D.x+","+this.centerY+","+vector3D.z+")";
  }else if (this.axis == "XY"){
    markerSpan.innerHTML = "("+vector3D.x+","+vector3D.y+","+this.centerZ+")";
  }else if (this.axis == "YZ"){
    markerSpan.innerHTML = "("+this.centerX+","+vector3D.y+","+vector3D.z+")";
  }
  innerDiv.appendChild(markerSpan);
  div.appendChild(innerDiv);
  if (!this.divs){
    this.divs = [];
    this.vector3Ds = [];
  }
  this.divs.push(div);
  this.vector3Ds.push(vector3D);
}

Grid.prototype.updateCornerHelpers = function(){
  for (var i = 0; i<this.divs.length; i++){
    var div = this.divs[i];
    var vector3D = this.vector3Ds[i];
    var object3D = this.object3D;
    if (!object3D){
      object3D = new THREE.Object3D();
    }
    object3D.position.copy(vector3D);
    if (this.isObjectInFrustum(object3D)){
      var vector2D = this.get2DVector(object3D);
      div.style.left = vector2D.x + 'px';
      div.style.top = vector2D.y + 'px';
      div.style.visibility = "visible";
    }else{
      div.style.visibility = "hidden";
    }
  }
}

Grid.prototype.isObjectInFrustum = function(object3D){
  this.frustum.setFromMatrix(REUSABLE_MATRIX_4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  return this.frustum.containsPoint(object3D.position);
}
