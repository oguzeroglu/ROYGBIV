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
  this.mesh.renderOrder = 10;
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
  this.dot.renderOrder = 10;
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
  }else{
    if (!this.mesh){
      this.makeMesh(this.size, this.startX, this.startY, this.startZ);
    }
    scene.add(this.mesh);
    scene.add(this.dot);
    gridSelections[this.name] = this;
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
}

Grid.prototype.renderCornerHelpers = function(){
  if (this.texts){
    return;
  }
  this.texts = [];
  for (var i = 0; i<this.vertices.length; i++){
    var vertex = this.vertices[i];
    var x = vertex.x, y = vertex.y, z = vertex.z;
    if (this.axis == "XZ"){
      y = 0;
    }else if (this.axis == "YZ"){
      x = 0;
    }else if (this.axis == "XY"){
      z = 0;
    }
    var text = "(@@1, @@2, @@3)".replace("@@1", x).replace("@@2", y).replace("@@3", z);
    var addedText = new AddedText(
      null, defaultFont, text, new THREE.Vector3().copy(vertex), ORANGE_COLOR, 1, 6
    );
    addedText.setMarginBetweenChars(2.5);
    addedText.refInnerHeight = 569;
    addedText.refCharSize = 6;
    addedText.handleResize();
    this.texts.push(addedText);
  }
}

Grid.prototype.removeCornerHelpers = function(){
  if (!this.texts){
    return;
  }
  for (var i = 0; i<this.texts.length; i++){
    this.texts[i].destroy();
  }
  this.texts = 0;
}
