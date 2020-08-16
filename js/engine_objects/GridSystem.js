/*
  note from the future:
  this is the first engine obj class of the engine so I was motivated about
  writing comments and stuff like below.

  CONSTRUCTOR PARAMETERS
    name -> name of this grid system, must be unique.
    sizeX -> size along the x axis
    sizeZ -> size along the z axis
    centerX -> x coordinate of the center point
    centerY -> y coordinate of the center point
    centerZ -> z coordinate of the center point
    color -> color of this grid system (lowercase X11 color name)
    outlineColor -> color of the outline of each grid (lowercase X11 color name)
    cellSize -> size of each grid of this grid system
    axis -> axis (XZ / XY / YZ)

*/
var GridSystem = function(name, sizeX, sizeZ, centerX, centerY, centerZ, outlineColor, cellSize, axis){

  this.isGridSystem = true;
  if (IS_WORKER_CONTEXT){
    return this;
  }

  var totalGridCount = (sizeX * sizeZ) / (cellSize * cellSize);
  this.totalGridCount = totalGridCount;
  this.name = name;
  this.sizeX = sizeX;
  this.sizeZ = sizeZ;
  this.centerX = centerX;
  this.centerY = centerY;
  this.centerZ = centerZ;
  this.outlineColor = outlineColor;
  this.cellSize = cellSize;
  this.cellCount = 0;
  this.axis = axis;

  this.grids = new Object();
  this.gridsByColRow = new Object();
  this.slicedGrids = new Object();

  if (this.axis == "XZ"){

    var initX = centerX - (sizeX / 2);
    var finalX = centerX + (sizeX / 2);
    var initZ = centerZ + (sizeZ / 2);
    var finalZ = centerZ - (sizeZ / 2);

    this.initX = initX;
    this.finalX = finalX;
    this.initZ = initZ;
    this.finalZ = finalZ;

    var gridNumber = 1;

    for (var x = initX; x < finalX; x+=cellSize){
      for (var z = initZ; z > finalZ; z-= cellSize){
        var grid = new Grid(name+"_grid_"+gridNumber, name, x,
                  centerY, z, cellSize, this.outlineColor,
                                  x/cellSize, z/cellSize, this.axis);
        grid.gridNumber = gridNumber;
        this.grids[gridNumber] = grid;
        this.gridsByColRow[grid.colNumber+"_"+grid.rowNumber] = grid;
        this.cellCount++;
        gridNumber ++;
      }
    }

  }else if (this.axis == "XY"){

    var initX = centerX - (sizeX / 2);
    var finalX = centerX + (sizeX / 2);
    var initY = centerY + (sizeZ / 2);
    var finalY = centerY - (sizeZ / 2);

    this.initX = initX;
    this.finalX = finalX;
    this.initY= initY;
    this.finalY = finalY;

    var gridNumber = 1;

    for (var x = initX; x<finalX; x+=cellSize){
      for (var y = initY; y>finalY; y-=cellSize){
        var grid = new Grid(name+"_grid_"+gridNumber, name, x, y,
                          centerZ, cellSize, this.outlineColor,
                                      x/cellSize, y/cellSize, this.axis);
        grid.gridNumber = gridNumber;
        this.grids[gridNumber] = grid;
        this.gridsByColRow[grid.colNumber+"_"+grid.rowNumber] = grid;
        this.cellCount++;
        gridNumber++;
      }
    }

  }else if (this.axis = "YZ"){

    var initY = centerY + (sizeX / 2);
    var finalY = centerY - (sizeX / 2);
    var initZ = centerZ - (sizeZ / 2);
    var finalZ = centerZ + (sizeZ / 2);

    this.initY = initY;
    this.finalY = finalY;
    this.initZ = initZ;
    this.finalZ = finalZ;

    var gridNumber = 1;

    for (var z = initZ; z<finalZ; z+= cellSize){
      for (var y = initY; y>finalY; y-= cellSize){
        var grid = new Grid(name+"_grid_"+gridNumber, name, centerX, y, z,
                                  cellSize, this.outlineColor,
                                      z/cellSize, y/cellSize, this.axis);
        grid.gridNumber = gridNumber;
        this.grids[gridNumber] = grid;
        this.gridsByColRow[grid.colNumber+"_"+grid.rowNumber] = grid;
        this.cellCount++;
        gridNumber++;
      }
    }

  }

  this.draw();

  this.boundingBox = new THREE.Box3().setFromObject(this.boundingPlane);
  if (!LIMIT_BOUNDING_BOX.containsBox(this.boundingBox)){
    this.destroy();
    if (!isDeployment){
      terminal.printError(Text.GRID_SYSTEM_IS_OUT_OF);
    }
    return;
  }
  gridSystems[name] = this;
  gridCounter = gridCounter + totalGridCount;
}

GridSystem.prototype.hide = function(){
  this.gridSystemRepresentation.visible = false;
  this.boundingPlane.visible = false;
}

GridSystem.prototype.show = function(){
  this.gridSystemRepresentation.visible = true;
  this.boundingPlane.visible = true;
}

GridSystem.prototype.draw = function(){
  var geometry = new THREE.Geometry();
  var color = this.outlineColor;
  var material = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    linewidth: 4,
    opacity: 0.5,
    depthWrite: false
  });

  for (var i = 0; i<= this.sizeX; i+= this.cellSize){
    geometry.vertices.push(
      new THREE.Vector3(i, 0, 0),
      new THREE.Vector3(i, 0, this.sizeZ)
    );
  }
  for (var i = 0; i<= this.sizeZ; i+= this.cellSize){
    geometry.vertices.push(
      new THREE.Vector3(0, 0, i),
      new THREE.Vector3(this.sizeX, 0, i)
    );
  }

  var boundingPlaneGeometry;
  if (this.axis == "XZ" || this.axis == "XY"){
    var geomKey = (
      "PlaneBufferGeometry" + PIPE +
      this.sizeX + PIPE + this.sizeZ + PIPE +
      "1" + PIPE + "1"
    );
    boundingPlaneGeometry = geometryCache[geomKey];
    if (!boundingPlaneGeometry){
      boundingPlaneGeometry = new THREE.PlaneBufferGeometry(
        this.sizeX, this.sizeZ
      );
      geometryCache[geomKey] = boundingPlaneGeometry;
    }
  }else if (this.axis == "YZ"){
    var geomKey = (
      "PlaneBufferGeometry" + PIPE +
      this.sizeZ + PIPE + this.sizeX + PIPE +
      "1" + PIPE + "1"
    );
    boundingPlaneGeometry = geometryCache[geomKey];
    if (!boundingPlaneGeometry){
      boundingPlaneGeometry = new THREE.PlaneBufferGeometry(
        this.sizeZ, this.sizeX
      );
      geometryCache[geomKey] = boundingPlaneGeometry;
    }
  }

  var boundingPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 'black',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1.0,
    polygonOffsetUnits: 4.0
  });
  var boundingPlane = new THREE.Mesh(
    boundingPlaneGeometry, boundingPlaneMaterial
  );
  boundingPlane.renderOrder = renderOrders.GRID_SYSTEM_BOUNDING_PLANE;

  geometry.center();
  var gridSystemRepresentation = new THREE.LineSegments(
    geometry, material
  );
  gridSystemRepresentation.renderOrder = renderOrders.GRID_SYSTEM_REPRESENTATION;

  gridSystemRepresentation.position.set(
    this.centerX,
    this.centerY,
    this.centerZ
  );

  boundingPlane.position.set(
    this.centerX,
    this.centerY,
    this.centerZ
  );

  if (this.axis == "XZ"){
    boundingPlane.rotateX(Math.PI/2);
  }
  if (this.axis == "XY"){
    gridSystemRepresentation.rotateX(Math.PI / 2);
  }
  if (this.axis == "YZ"){
    gridSystemRepresentation.rotateZ(Math.PI / 2);
    boundingPlane.rotateY(Math.PI/2);
  }

  this.gridSystemRepresentation = gridSystemRepresentation;
  this.boundingPlane = boundingPlane;
  this.boundingPlane.gridSystemName = this.name;
  this.gridSystemRepresentation.gridSystemName = this.name;

  this.boundingBox = new THREE.Box3().setFromObject(this.boundingPlane);
  this.trianglePlanes = [];
  this.triangles = [];
  var pseudoGeom = new THREE.Geometry().fromBufferGeometry(boundingPlaneGeometry);
  var transformedVertices = [];
  for (var i = 0; i<pseudoGeom.vertices.length; i++){
    var vertex = pseudoGeom.vertices[i].clone();
    vertex.applyMatrix4(this.boundingPlane.matrixWorld);
    transformedVertices.push(vertex);
  }
  for (var i = 0; i<pseudoGeom.faces.length; i++){
    var face = pseudoGeom.faces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var triangle = new THREE.Triangle(
      transformedVertices[a], transformedVertices[b], transformedVertices[c]
    );
    this.triangles.push(triangle);
    var plane = new THREE.Plane();
    triangle.getPlane(plane);
    this.trianglePlanes.push(plane);
  }

  scene.add(this.gridSystemRepresentation);
  scene.add(this.boundingPlane);

}

GridSystem.prototype.intersectsLine = function(line){
  for (var i = 0; i< this.trianglePlanes.length; i+=2){
    var plane = this.trianglePlanes[i];
    if (plane.intersectLine(line, REUSABLE_VECTOR)){
      var triangle1 = this.triangles[i];
      var triangle2 = this.triangles[i+1];
      if (triangle1.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }else if (triangle2.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }
    }
  }
  return false;
}

GridSystem.prototype.getDistanceBetweenPointAndGrid = function(grid, point){
  var xDif = grid.centerX - point.x;
  var yDif = grid.centerY - point.y;
  var zDif = grid.centerZ - point.z;
  return Math.sqrt(
    (xDif * xDif) +
    (yDif * yDif) +
    (zDif * zDif)
  );
}

GridSystem.prototype.getGridFromPoint = function(point){
    if (this.axis == "XZ"){
      var xSegment, zSegment;
      var xStart = this.centerX  - (this.sizeX / 2);
      var xEnd = this.centerX + (this.sizeX / 2);
      var zStart = this.centerZ + (this.sizeZ / 2);
      var zEnd = this.centerZ - (this.sizeZ / 2);
      if (point.x >= xStart && point.x <= xEnd){
        var xDiff = point.x - xStart;
        var xSegment = Math.floor(xDiff / this.cellSize) + 1;
        if (point.z <= zStart && point.z >= zEnd){
          var zDiff = zStart - point.z;
          var zSegment = Math.floor(zDiff / this.cellSize) +1;
        }
      }
      if (xSegment && zSegment){
        var count = (xSegment - 1)*(this.sizeZ / this.cellSize);
        count += zSegment;
        return this.grids[count];
      }
    }else if (this.axis == "YZ"){
      var ySegment, zSegment;
      var yStart = this.centerY + (this.sizeX / 2);
      var yEnd = this.centerY - (this.sizeX / 2);
      var zStart = this.centerZ - (this.sizeZ / 2);
      var zEnd = this.centerZ + (this.sizeZ / 2);
      if (point.y <= yStart && point.y >= yEnd){
        var yDiff = yStart - point.y;
        var ySegment = Math.floor(yDiff / this.cellSize) + 1;
        if (point.z >= zStart && point.z <= zEnd){
          var zDiff = point.z - zStart;
          var zSegment = Math.floor(zDiff / this.cellSize) +1;
        }
      }
      if (ySegment && zSegment){
        var count = (zSegment - 1)*(this.sizeX / this.cellSize);
        count += ySegment;
        return this.grids[count];
      }
    }else if (this.axis == "XY"){
      var xSegment, ySegment;
      var xStart = this.centerX  - (this.sizeX / 2);
      var xEnd = this.centerX + (this.sizeX / 2);
      var yStart = this.centerY + (this.sizeZ / 2);
      var yEnd = this.centerY - (this.sizeZ / 2);
      if (point.x >= xStart && point.x <= xEnd){
        var xDiff = point.x - xStart;
        var xSegment = Math.floor(xDiff / this.cellSize) + 1;
        if (point.y <= yStart && point.y >= yEnd){
          var yDiff = yStart - point.y;
          var ySegment = Math.floor(yDiff / this.cellSize) +1;
        }
      }
      if (xSegment && ySegment){
        var count = (xSegment - 1)*(this.sizeZ / this.cellSize);
        count += ySegment;
        return this.grids[count];
      }
    }
}

GridSystem.prototype.exportLightweight = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.bbMin = this.boundingBox.min;
  exportObject.bbMax = this.boundingBox.max;
  exportObject.triangles = [];
  for (var i = 0; i<this.triangles.length; i++){
    exportObject.triangles.push({
      a: this.triangles[i].a, b: this.triangles[i].b, c: this.triangles[i].c
    })
  }
  return exportObject;
}

GridSystem.prototype.export = function(){
  var exportObject = new Object();
  exportObject.name = this.name;
  exportObject.sizeX = this.sizeX;
  exportObject.sizeZ = this.sizeZ;
  exportObject.centerX = this.centerX;
  exportObject.centerY = this.centerY;
  exportObject.centerZ = this.centerZ;
  exportObject.outlineColor = this.outlineColor;
  exportObject.cellSize = this.cellSize;
  exportObject.axis = this.axis;
  var selectedGridsExport = [];
  var slicedGridsExport = [];
  var slicedGridSystemNamesExport = [];
  for (var selectedGridName in gridSelections){
    var grid = gridSelections[selectedGridName];
    if (grid.parentName == this.name){
      selectedGridsExport.push(grid.gridNumber);
    }
  }
  for (var gridName in this.slicedGrids){
    var grid = this.slicedGrids[gridName];
    slicedGridsExport.push(grid.gridNumber);
    slicedGridSystemNamesExport.push(grid.slicedGridSystemName);
  }
  exportObject.selectedGridsExport = selectedGridsExport;
  exportObject.slicedGridsExport = slicedGridsExport;
  exportObject.slicedGridSystemNamesExport = slicedGridSystemNamesExport;
  if (this.markedPointNames){
    exportObject.markedPointNames = [];
    for (var i = 0; i<this.markedPointNames.length; i++){
      exportObject.markedPointNames.push(this.markedPointNames[i]);
    }
  }
  return exportObject;
}

GridSystem.prototype.getNeighbourGridsOfGrid = function(grid){
  var rowNumber = grid.rowNumber;
  var colNumber = grid.colNumber;

  var neighbours = [];

  var g1 = this.getGridByColRow(colNumber - 1, rowNumber - 1);
  var g2 = this.getGridByColRow(colNumber, rowNumber -1);
  var g3 = this.getGridByColRow(colNumber + 1, rowNumber - 1);
  var g4 = this.getGridByColRow(colNumber - 1, rowNumber);
  var g5 = this.getGridByColRow(colNumber + 1, rowNumber);
  var g6 = this.getGridByColRow(colNumber - 1, rowNumber + 1);
  var g7 = this.getGridByColRow(colNumber, rowNumber + 1);
  var g8 = this.getGridByColRow(colNumber + 1, rowNumber + 1);

  if (g1){ neighbours.push(g1); }
  if (g2){ neighbours.push(g2); }
  if (g3){ neighbours.push(g3); }
  if (g4){ neighbours.push(g4); }
  if (g5){ neighbours.push(g5); }
  if (g6){ neighbours.push(g6); }
  if (g7){ neighbours.push(g7); }
  if (g8){ neighbours.push(g8); }

  return neighbours;
}

GridSystem.prototype.getGridByColRow = function(col, row){
  return this.gridsByColRow[col+"_"+row];
}

GridSystem.prototype.printInfo = function(){
  terminal.printHeader(this.name + " ["+this.registeredSceneName+"]");
  terminal.printInfo(
    Text.TREE_NAME.replace(Text.PARAM1, this.name),
    true
  );
  terminal.printInfo(
    Text.TREE_SIZEX.replace(Text.PARAM1, this.sizeX),
    true
  );
  terminal.printInfo(
    Text.TREE_SIZEZ.replace(Text.PARAM1, this.sizeZ),
    true
  );
  terminal.printInfo(
    Text.TREE_CENTERX.replace(Text.PARAM1, this.centerX),
    true
  );
  terminal.printInfo(
    Text.TREE_CENTERY.replace(Text.PARAM1, this.centerY),
    true
  );
  terminal.printInfo(
    Text.TREE_CENTERZ.replace(Text.PARAM1, this.centerZ),
    true
  );
  terminal.printInfo(
    Text.TREE_COLOR.replace(Text.PARAM1, this.outlineColor),
    true
  );
  terminal.printInfo(
    Text.TREE_CELL_SIZE.replace(Text.PARAM1, this.cellSize),
    true
  );
  terminal.printInfo(
    Text.TREE_CELL_COUNT.replace(Text.PARAM1, this.cellCount),
    true
  );
  terminal.printInfo(
    Text.TREE_AXIS.replace(Text.PARAM1, this.axis)
  );
}

GridSystem.prototype.destroy = function(){

  if (this.slicedGrid){
    this.slicedGrid.sliced = false;
    this.slicedGrid.slicedGridSystemName = 0;
  }

  scene.remove(this.gridSystemRepresentation);
  scene.remove(this.boundingPlane);

  this.gridSystemRepresentation.geometry.dispose();
  this.gridSystemRepresentation.material.dispose();
  this.boundingPlane.geometry.dispose();
  this.boundingPlane.material.dispose();

  for (var i in this.grids){
    this.grids[i].parentDestroyed = true;
    if (this.grids[i].selected){
      this.grids[i].toggleSelect();
    }
  }
  delete gridSystems[this.name];
  gridCounter = gridCounter - this.totalGridCount;

  if (this.markedPointNames){
    for (var i = 0; i<this.markedPointNames.length; i++){
      var markedPoint = markedPoints[this.markedPointNames[i]];
      if (markedPoint){
        markedPoint.gridDestroyed = true;
        scene.remove(markedPoint.line);
        delete markedPoint.line;
      }
    }
  }

  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (obj.metaData.gridSystemName == this.name){
      obj.destroyedGrids = new Object();
    }
  }
  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    for (var childName in obj.group){
      if (obj.group[childName].metaData.gridSystemName == this.name){
        obj.group[childName].destroyedGrids = new Object();
      }
    }
  }
  for (var textName in addedTexts){
    var obj = addedTexts[textName];
    if (obj.gsName == this.name){
      obj.destroyedGrids = new Object();
    }
  }
}

GridSystem.prototype.selectAllGrids = function(){
  for (var i in this.grids){
    if (!this.grids[i].selected){
      this.grids[i].toggleSelect();
    }
  }
}

GridSystem.prototype.crop = function(grid1, grid2){
  var centerX = (grid1.centerX + grid2.centerX)/2;
  var centerY = (grid1.centerY + grid2.centerY)/2;
  var centerZ = (grid1.centerZ + grid2.centerZ)/2;

  if (this.axis =="XZ"){

    var croppedSizeX = this.cellSize * (Math.abs(grid1.colNumber - grid2.colNumber) + 1);
    var croppedSizeZ = this.cellSize * (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1);

    croppedGridSystemBuffer = new CroppedGridSystem(croppedSizeX, croppedSizeZ, centerX, centerY, centerZ, this.axis);

  } else if (this.axis == "XY"){

    var croppedSizeX = this.cellSize * (Math.abs(grid1.colNumber - grid2.colNumber) + 1);
    var croppedSizeZ = this.cellSize * (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1);

    croppedGridSystemBuffer = new CroppedGridSystem(croppedSizeX, croppedSizeZ, centerX, centerY, centerZ, this.axis);

  }else if (this.axis == "YZ"){

    var croppedSizeX = this.cellSize * (Math.abs(grid1.colNumber - grid2.colNumber) + 1);
    var croppedSizeZ = this.cellSize * (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1);

    croppedGridSystemBuffer = new CroppedGridSystem(croppedSizeZ, croppedSizeX, centerX, centerY, centerZ, this.axis);

  }

  if (!isDeployment){
    terminal.printInfo(Text.GS_CROPPED);
  }
}

GridSystem.prototype.newAIObstacle = function(selections, obstacleID, height){
  var boxCenterX, boxCenterY, boxCenterZ, boxSizeX, boxSizeY, boxSizeZ;
  if (selections.length == 1){
    var grid = selections[0];
    boxCenterX = grid.centerX;
    boxCenterZ = grid.centerZ;
    boxSizeX = this.cellSize;
    boxSizeZ = this.cellSize;
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    boxCenterX = (grid1.centerX + grid2.centerX) / 2;
    boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    boxSizeX = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * this.cellSize;
    boxSizeZ = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * this.cellSize;
  }

  boxCenterY = this.centerY + (height / 2);
  boxSizeY = Math.abs(height);

  if (this.axis == "XY"){
    var tmp = boxSizeY;
    boxSizeY = boxSizeZ;
    boxSizeZ = tmp;
    boxCenterZ = this.centerZ + (height / 2);
    if (selections.length == 1){
        var grid = selections[0];
        boxCenterY = grid.centerY;
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
    }
  }else if (this.axis == "YZ"){
    var oldX = boxSizeX;
    var oldY = boxSizeY;
    var oldZ = boxSizeZ;
    boxSizeZ = oldX;
    boxSizeX = oldY;
    boxSizeY = oldZ;
    if (selections.length == 1){
      var grid = selections[0];
      boxCenterY = grid.centerY;
      boxCenterZ = grid.centerZ;
      boxCenterX = grid.centerX + (height / 2);
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
      boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
      boxCenterX = grid1.centerX + (height / 2);
    }
  }

  for (var i = 0; i<selections.length; i++){
    selections[i].toggleSelect(false, false, false, true);
  }

  steeringHandler.addObstacle(obstacleID, new Kompute.Vector3D(boxCenterX, boxCenterY, boxCenterZ), new Kompute.Vector3D(boxSizeX, boxSizeY, boxSizeZ));
}

GridSystem.prototype.newArea = function(name, height, selections){
  var boxCenterX, boxCenterY, boxCenterZ, boxSizeX, boxSizeY, boxSizeZ;
  if (selections.length == 1){
    var grid = selections[0];
    boxCenterX = grid.centerX;
    boxCenterZ = grid.centerZ;
    boxSizeX = this.cellSize;
    boxSizeZ = this.cellSize;
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    boxCenterX = (grid1.centerX + grid2.centerX) / 2;
    boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    boxSizeX = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * this.cellSize;
    boxSizeZ = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * this.cellSize;
  }

  boxCenterY = this.centerY + (height / 2);
  boxSizeY = Math.abs(height);

  if (this.axis == "XY"){
    var tmp = boxSizeY;
    boxSizeY = boxSizeZ;
    boxSizeZ = tmp;
    boxCenterZ = this.centerZ + (height / 2);
    if (selections.length == 1){
        var grid = selections[0];
        boxCenterY = grid.centerY;
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
    }
  }else if (this.axis == "YZ"){
    var oldX = boxSizeX;
    var oldY = boxSizeY;
    var oldZ = boxSizeZ;
    boxSizeZ = oldX;
    boxSizeX = oldY;
    boxSizeY = oldZ;
    if (selections.length == 1){
      var grid = selections[0];
      boxCenterY = grid.centerY;
      boxCenterZ = grid.centerZ;
      boxCenterX = grid.centerX + (height / 2);
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
      boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
      boxCenterX = grid1.centerX + (height / 2);
    }
  }
  var boundingBox = new THREE.Box3().setFromCenterAndSize(
    new THREE.Vector3(boxCenterX, boxCenterY, boxCenterZ),
    new THREE.Vector3(boxSizeX, boxSizeY, boxSizeZ)
  );
  areas[name] = new Area(name, boundingBox, this.outlineColor, selections[0].size);
  if (areasVisible){
    areas[name].renderToScreen();
  }
  for (var i = 0; i<selections.length; i++){
    selections[i].toggleSelect(false, false, false, true);
  }
  sceneHandler.getAreaBinHandler().insert(boundingBox, name);
  return areas[name];
}

GridSystem.prototype.newSurface = function(name, grid1, grid2, material){
  if (!grid2){
    grid2 = grid1;
  }
  var height = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * this.cellSize;
  var width = (Math.abs(grid1.colNumber - grid2.colNumber ) + 1) * this.cellSize;
  var geomKey = (
    "PlaneBufferGeometry" + PIPE +
    width + PIPE + height + PIPE +
    "1" + PIPE + "1"
  );
  var geometry;
  if (geometryCache[geomKey]){
    geometry = geometryCache[geomKey];
  }else{
    geometry = new THREE.PlaneBufferGeometry(width, height);
    geometryCache[geomKey] = geometry;
  }
  var surface = new MeshGenerator(geometry, material).generateMesh();
  if (this.axis == "XZ"){

    surface.position.x = (grid1.centerX + grid2.centerX) / 2;
    surface.position.y = this.centerY;
    surface.position.z = (grid1.centerZ + grid2.centerZ) / 2;
    surface.rotation.x = Math.PI / 2;

  } else if (this.axis == "XY"){

    surface.position.x = (grid1.centerX + grid2.centerX) / 2;
    surface.position.y = (grid1.centerY + grid2.centerY) / 2;
    surface.position.z = this.centerZ;

  }else if (this.axis == "YZ"){

    surface.position.x = this.centerX;
    surface.position.y = (grid1.centerY + grid2.centerY) / 2;
    surface.position.z = (grid1.centerZ + grid2.centerZ) / 2;
    surface.rotation.y = Math.PI / 2;

  }

  grid1.toggleSelect(false, false, false, true);
  if (grid1.name != grid2.name){
    grid2.toggleSelect(false, false, false, true);
  }

  delete gridSelections[grid1.name];
  delete gridSelections[grid2.name];

  var startRow, finalRow, startCol, finalCol;

  var destroyedGrids = new Object();

  startRow = grid1.rowNumber;
  if (grid2.rowNumber < grid1.rowNumber){
    startRow = grid2.rowNumber;
  }
  startCol = grid1.colNumber;
  if (grid2.colNumber < grid1.colNumber){
    startCol = grid2.colNumber;
  }
  finalRow = grid1.rowNumber;
  if (grid2.rowNumber > grid1.rowNumber){
    finalRow = grid2.rowNumber;
  }
  finalCol = grid1.colNumber;
  if (grid2.colNumber > grid1.colNumber){
    finalCol = grid2.colNumber;
  }
  for (var row = startRow; row <= finalRow; row++){
    for (var col = startCol; col <= finalCol; col++ ){
      var grid = this.getGridByColRow(col, row);
      if (grid){
        destroyedGrids[grid.name] = grid;
      }
    }
  }

  scene.add(surface);

  var physicsShapeParameters = new Object();
  if (this.axis == "XZ"){
    physicsShapeParameters["x"] = width/2;
    physicsShapeParameters["y"] = surfacePhysicalThickness;
    physicsShapeParameters["z"] = height/2;
  }else if (this.axis == "XY"){
    physicsShapeParameters["x"] = width/2;
    physicsShapeParameters["z"] = surfacePhysicalThickness;
    physicsShapeParameters["y"] = height/2;
  }else if (this.axis == "YZ"){
    physicsShapeParameters["z"] = width/2;
    physicsShapeParameters["x"] = surfacePhysicalThickness;
    physicsShapeParameters["y"] = height/2;
  }
  var surfacePhysicsBody = physicsBodyGenerator.generateBoxBody(physicsShapeParameters);
  surfacePhysicsBody.position.set(
    surface.position.x,
    surface.position.y,
    surface.position.z
  );
  physicsWorld.addBody(surfacePhysicsBody);

  var metaData = new Object();
  metaData["grid1Name"] = grid1.name;
  metaData["grid2Name"] = grid2.name;
  metaData["height"] = height;
  metaData["width"] = width;
  metaData["gridSystemName"] = this.name;
  metaData["gridSystemAxis"] = this.axis;
  metaData["positionX"] = surface.position.x;
  metaData["positionY"] = surface.position.y;
  metaData["positionZ"] = surface.position.z;
  metaData["quaternionX"] = surface.quaternion.x;
  metaData["quaternionY"] = surface.quaternion.y;
  metaData["quaternionZ"] = surface.quaternion.z;
  metaData["quaternionW"] = surface.quaternion.w;
  metaData["physicsShapeParameterX"] = physicsShapeParameters["x"];
  metaData["physicsShapeParameterY"] = physicsShapeParameters["y"];
  metaData["physicsShapeParameterZ"] = physicsShapeParameters["z"];

  var addedObjectInstance = new AddedObject(name, "surface", metaData, material,
                                    surface, surfacePhysicsBody, destroyedGrids);
  addedObjects[name] = addedObjectInstance;

  surface.addedObject = addedObjectInstance;
  addedObjectInstance.updateMVMatrix();
  sceneHandler.onAddedObjectCreation(addedObjectInstance);
}

GridSystem.prototype.newRamp = function(anchorGrid, otherGrid, axis, height, material, name){

  var rampWidth, rampHeight;
  var centerX, centerY, centerZ;
  var colDif, rowDif;

  if (this.axis == "XZ"){
    centerX = (anchorGrid.centerX + otherGrid.centerX) / 2;
    centerZ = (anchorGrid.centerZ + otherGrid.centerZ) / 2;
    centerY = (anchorGrid.centerY + (otherGrid.centerY + height)) / 2;
  }else if (this.axis == "XY"){
    centerX = (anchorGrid.centerX + otherGrid.centerX) / 2;
    centerY = (anchorGrid.centerY + otherGrid.centerY) / 2;
    centerZ = (anchorGrid.centerZ + (otherGrid.centerZ + height)) / 2;
  }else if (this.axis == "YZ"){
    centerX = (anchorGrid.centerX + (otherGrid.centerX + height)) / 2;
    centerY = (anchorGrid.centerY + otherGrid.centerY) / 2;
    centerZ = (anchorGrid.centerZ + otherGrid.centerZ) / 2;
  }

  if (axis == "x"){
    rampHeight = (Math.abs(anchorGrid.rowNumber - otherGrid.rowNumber) + 1) * this.cellSize;
    colDif = (Math.abs(anchorGrid.colNumber - otherGrid.colNumber) + 1) * this.cellSize;
    rampWidth = Math.sqrt((colDif * colDif) + (height * height));
  }else if (axis == "z") {
    if (this.axis == "YZ"){
      rampHeight = (Math.abs(anchorGrid.rowNumber - otherGrid.rowNumber) + 1) * this.cellSize;
      colDif = (Math.abs(anchorGrid.colNumber - otherGrid.colNumber) + 1) * this.cellSize;
      rampWidth = Math.sqrt((colDif * colDif) + (height * height));
    }else{
      rampWidth = (Math.abs(anchorGrid.colNumber - otherGrid.colNumber) + 1) * this.cellSize;
      rowDif = (Math.abs(anchorGrid.rowNumber - otherGrid.rowNumber) + 1) * this.cellSize;
      rampHeight = Math.sqrt((rowDif * rowDif) + (height * height));
    }
  }else if (axis == "y"){
    rampWidth = (Math.abs(anchorGrid.colNumber - otherGrid.colNumber) + 1) * this.cellSize;
    rowDif = (Math.abs(anchorGrid.rowNumber - otherGrid.rowNumber) + 1) * this.cellSize;
    rampHeight = Math.sqrt((rowDif * rowDif) + (height * height));
  }
  var geometry;
  var geomKey = (
    "PlaneBufferGeometry" + PIPE +
    rampWidth + PIPE + rampHeight + PIPE +
    "1" + PIPE + "1"
  );
  geometry = geometryCache[geomKey];
  if (!geometry){
    geometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight);
    geometryCache[geomKey] = geometry;
  }
  var ramp = new MeshGenerator(geometry, material).generateMesh();

  ramp.position.x = centerX;
  ramp.position.y = centerY;
  ramp.position.z = centerZ;
  if (this.axis == "XZ"){
    ramp.rotation.x = Math.PI / 2;
  }
  if (this.axis == "YZ"){
    if (axis == "z"){
      ramp.rotation.y = Math.PI / 2;
    }else{
      ramp.rotation.y = Math.PI / 2;
    }
  }

  if (axis == "x"){
    var coef = 1;
    if (this.axis == "XY"){
      coef = -1;
    }
    var alpha = Math.acos(colDif / rampWidth);
    if (anchorGrid.centerX > otherGrid.centerX){
      if (height >= 0 ){
        ramp.rotateY(-1 * alpha * coef);
      }else {
        ramp.rotateY(alpha * coef);
      }
    }else{
      if (height >= 0){
        ramp.rotateY(alpha * coef);
      }else{
        ramp.rotateY(-1 * alpha * coef);
      }
    }
  }else if (axis == "z"){
    var alpha = Math.acos(rowDif / rampHeight);
    if (this.axis == "YZ"){
      alpha = Math.asin(height / rampWidth);
      if (anchorGrid.centerZ > otherGrid.centerZ){
        ramp.rotateY(-1 * alpha);
      }else{
        ramp.rotateY(alpha);
      }
    }else{
      if (anchorGrid.centerZ > otherGrid.centerZ){
        if (height >= 0){
          ramp.rotateX(alpha);
        }else{
          ramp.rotateX(-1 * alpha);
        }
      }else{
        if (height >= 0){
          ramp.rotateX(-1 * alpha);
        }else{
          ramp.rotateX(alpha);
        }
      }
    }
  }else if (axis == "y"){
    var alpha = Math.acos(rowDif / rampHeight);
    if (anchorGrid.centerY < otherGrid.centerY){
      if (height >= 0){
        ramp.rotateX(alpha);
      }else{
        ramp.rotateX(-1 * alpha);
      }
    }else{
      if (height >= 0){
        ramp.rotateX(-1 * alpha);
      }else{
        ramp.rotateX(alpha);
      }
    }
  }

  scene.add(ramp);

  var physicsShapeParameters = {
    x: rampWidth/2, y: surfacePhysicalThickness, z: rampHeight/2
  }
  var rampPhysicsBody = physicsBodyGenerator.generateBoxBody(physicsShapeParameters);
  rampPhysicsBody.position.set(
    ramp.position.x,
    ramp.position.y,
    ramp.position.z
  );
  var fromEuler = new Object();
  fromEuler["x"] = 0;
  fromEuler["y"] = 0;
  fromEuler["z"] = 0;
  if (axis == "x"){
    if (this.axis == "XZ"){
      fromEuler["x"] = 0;
      fromEuler["y"] = 0;
      fromEuler["z"] = ramp.rotation.y;
    }else if (this.axis == "XY"){
      fromEuler["x"] = Math.PI / 2;
      fromEuler["y"] = 0;
      fromEuler["z"] = -1 * ramp.rotation.y;
    }
  }else if (axis == "z"){
    if (this.axis == "YZ"){
      var coef = 1;
      if (otherGrid.centerZ > anchorGrid.centerZ){
        coef = -1;
      }
      if (height < 0){
          coef = coef * -1;
      }
      fromEuler["x"] = Math.PI / 2 ;
      fromEuler["y"] = 0;
      fromEuler["z"] = (-1 * ramp.rotation.y * coef);
    }else{
      fromEuler["x"] = ramp.rotation.x - (Math.PI / 2);
      fromEuler["y"] = 0;
      fromEuler["z"] = 0;
    }
  }else if (axis == "y"){
    if (this.axis == "YZ"){
      fromEuler["x"] = ramp.rotation.x;
      fromEuler["y"] = ramp.rotation.y + (Math.PI / 2);
      fromEuler["z"] = Math.PI / 2;
    }else{
      fromEuler["x"] = (Math.PI / 2) + ramp.rotation.x;
      fromEuler["y"] = 0;
      fromEuler["z"] = 0;
    }
  }
  rampPhysicsBody.quaternion.setFromEuler(
    fromEuler["x"],
    fromEuler["y"],
    fromEuler["z"]
  );
  physicsWorld.addBody(rampPhysicsBody);

  var metaData = new Object();
  metaData["anchorGridName"] = anchorGrid.name;
  metaData["otherGridName"] = otherGrid.name;
  metaData["rampHeight"] = rampHeight;
  metaData["rampWidth"] = rampWidth;
  metaData["gridSystemName"] = this.name;
  metaData["axis"] = axis;
  metaData["gridSystemAxis"] = this.axis;
  metaData["height"] = height;
  metaData["quaternionX"] = ramp.quaternion.x;
  metaData["quaternionY"] = ramp.quaternion.y;
  metaData["quaternionZ"] = ramp.quaternion.z;
  metaData["quaternionW"] = ramp.quaternion.w;
  metaData["centerX"] = ramp.position.x;
  metaData["centerY"] = ramp.position.y;
  metaData["centerZ"] = ramp.position.z;
  metaData["fromEulerX"] = fromEuler["x"];
  metaData["fromEulerY"] = fromEuler["y"];
  metaData["fromEulerZ"] = fromEuler["z"];
  metaData["physicsShapeParameterX"] = physicsShapeParameters["x"];
  metaData["physicsShapeParameterY"] = physicsShapeParameters["y"];
  metaData["physicsShapeParameterZ"] = physicsShapeParameters["z"];


  var addedObjectInstance = new AddedObject(name, "ramp", metaData, material,
                                    ramp, rampPhysicsBody, new Object());
  addedObjects[name] = addedObjectInstance;

  ramp.addedObject = addedObjectInstance;
  addedObjectInstance.updateMVMatrix();
  anchorGrid.toggleSelect(false, false, false, true);
  if (otherGrid.selected){
    otherGrid.toggleSelect(false, false, false, true);
  }
  delete gridSelections[anchorGrid.name];
  delete gridSelections[otherGrid.name];
  sceneHandler.onAddedObjectCreation(addedObjectInstance);
}

GridSystem.prototype.newMass = function(selections, height, id){
  var boxCenterX, boxCenterY, boxCenterZ;
  var boxSizeX, boxSizeY, boxSizeZ;

  if (selections.length == 1){
    var grid = selections[0];
    boxCenterX = grid.centerX;
    boxCenterZ = grid.centerZ;
    boxSizeX = this.cellSize;
    boxSizeZ = this.cellSize;
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    boxCenterX = (grid1.centerX + grid2.centerX) / 2;
    boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    boxSizeX = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * this.cellSize;
    boxSizeZ = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * this.cellSize;
  }

  boxCenterY = this.centerY + (height / 2);
  boxSizeY = Math.abs(height);

  if (this.axis == "XY"){
    var tmp = boxSizeY;
    boxSizeY = boxSizeZ;
    boxSizeZ = tmp;
    boxCenterZ = this.centerZ + (height / 2);
    if (selections.length == 1){
        var grid = selections[0];
        boxCenterY = grid.centerY;
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
    }
  }else if (this.axis == "YZ"){
    var oldX = boxSizeX;
    var oldY = boxSizeY;
    var oldZ = boxSizeZ;
    boxSizeZ = oldX;
    boxSizeX = oldY;
    boxSizeY = oldZ;
    if (selections.length == 1){
      var grid = selections[0];
      boxCenterY = grid.centerY;
      boxCenterZ = grid.centerZ;
      boxCenterX = grid.centerX + (height / 2);
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
      boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
      boxCenterX = grid1.centerX + (height / 2);
    }
  }

  for (var i = 0; i < selections.length; i ++){
    selections[i].toggleSelect(false, false, false, true);
  }

  var mass = new Mass(id, new THREE.Vector3(boxCenterX, boxCenterY, boxCenterZ), new THREE.Vector3(boxSizeX, boxSizeY, boxSizeZ));

  sceneHandler.onMassCreation(mass);
  masses[id] = mass;
}

GridSystem.prototype.newBox = function(selections, height, material, name){
  var boxCenterX, boxCenterY, boxCenterZ;
  var boxSizeX, boxSizeY, boxSizeZ;

  if (selections.length == 1){
    var grid = selections[0];
    boxCenterX = grid.centerX;
    boxCenterZ = grid.centerZ;
    boxSizeX = this.cellSize;
    boxSizeZ = this.cellSize;
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    boxCenterX = (grid1.centerX + grid2.centerX) / 2;
    boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    boxSizeX = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * this.cellSize;
    boxSizeZ = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * this.cellSize;
  }

  boxCenterY = this.centerY + (height / 2);
  boxSizeY = Math.abs(height);

  if (this.axis == "XY"){
    var tmp = boxSizeY;
    boxSizeY = boxSizeZ;
    boxSizeZ = tmp;
    boxCenterZ = this.centerZ + (height / 2);
    if (selections.length == 1){
        var grid = selections[0];
        boxCenterY = grid.centerY;
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
    }
  }else if (this.axis == "YZ"){
    var oldX = boxSizeX;
    var oldY = boxSizeY;
    var oldZ = boxSizeZ;
    boxSizeZ = oldX;
    boxSizeX = oldY;
    boxSizeY = oldZ;
    if (selections.length == 1){
      var grid = selections[0];
      boxCenterY = grid.centerY;
      boxCenterZ = grid.centerZ;
      boxCenterX = grid.centerX + (height / 2);
    }else{
      var grid1 = selections[0];
      var grid2 = selections[1];
      boxCenterY = (grid1.centerY + grid2.centerY) / 2;
      boxCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
      boxCenterX = grid1.centerX + (height / 2);
    }
  }

  var geomKey = (
    "BoxBufferGeometry" + PIPE +
    boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
    "1" + PIPE + "1" + PIPE + "1"
  );
  var boxGeometry = geometryCache[geomKey];
  if (!boxGeometry){
    boxGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ);
    geometryCache[geomKey] = boxGeometry;
  }
  var boxMesh = new MeshGenerator(boxGeometry, material).generateMesh();

  boxMesh.position.x = boxCenterX;
  boxMesh.position.y = boxCenterY;
  boxMesh.position.z = boxCenterZ;

  scene.add(boxMesh);

  var physicsShapeParameters = {x: boxSizeX/2, y: boxSizeY/2, z: boxSizeZ/2};
  var boxPhysicsBody = physicsBodyGenerator.generateBoxBody(physicsShapeParameters);
  boxPhysicsBody.position.set(
    boxMesh.position.x,
    boxMesh.position.y,
    boxMesh.position.z
  );
  physicsWorld.addBody(boxPhysicsBody);
  for (var i = 0; i<selections.length; i++){
    selections[i].toggleSelect(false, false, false, true);
    delete gridSelections[selections[i].name];
  }
  var destroyedGrids = new Object();
  if(selections.length == 1){
    destroyedGrids[selections[0].name] = selections[0];
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    startRow = grid1.rowNumber;
    if (grid2.rowNumber < grid1.rowNumber){
      startRow = grid2.rowNumber;
    }
    startCol = grid1.colNumber;
    if (grid2.colNumber < grid1.colNumber){
      startCol = grid2.colNumber;
    }
    finalRow = grid1.rowNumber;
    if (grid2.rowNumber > grid1.rowNumber){
      finalRow = grid2.rowNumber;
    }
    finalCol = grid1.colNumber;
    if (grid2.colNumber > grid1.colNumber){
      finalCol = grid2.colNumber;
    }
    for (var row = startRow; row <= finalRow; row++){
      for (var col = startCol; col <= finalCol; col++ ){
        var grid = this.getGridByColRow(col, row);
        if (grid){
          destroyedGrids[grid.name] = grid;
        }
      }
    }
  }

  var metaData = new Object();
  metaData["height"] = height;
  metaData["gridCount"] = selections.length;
  metaData["grid1Name"] = selections[0].name;
  if (selections.length == 2){
    metaData["grid2Name"] = selections[1].name;
  }
  metaData["gridSystemName"] = this.name;
  metaData["boxSizeX"] = boxSizeX;
  metaData["boxSizeY"] = boxSizeY;
  metaData["boxSizeZ"] = boxSizeZ;
  metaData["centerX"] = boxCenterX;
  metaData["centerY"] = boxCenterY;
  metaData["centerZ"] = boxCenterZ;
  metaData["gridSystemAxis"] = this.axis;
  metaData["physicsShapeParameterX"] = physicsShapeParameters["x"];
  metaData["physicsShapeParameterY"] = physicsShapeParameters["y"];
  metaData["physicsShapeParameterZ"] = physicsShapeParameters["z"];

  var addedObjectInstance = new AddedObject(name, "box", metaData, material,
                                    boxMesh, boxPhysicsBody, destroyedGrids);
  addedObjects[name] = addedObjectInstance;

  boxMesh.addedObject = addedObjectInstance;
  addedObjectInstance.updateMVMatrix();
  sceneHandler.onAddedObjectCreation(addedObjectInstance);
}

GridSystem.prototype.newSphere = function(sphereName, material, radius, selections){

  var sphereCenterX, sphereCenterY, sphereCenterZ;

  if (this.axis == "XZ"){
    if (selections.length == 1){
      var grid = selections[0];
      sphereCenterX = grid.centerX;
      sphereCenterY = grid.centerY + radius;
      sphereCenterZ = grid.centerZ;
    }else if (selections.length == 2){
      var grid1 = selections[0];
      var grid2 = selections[1];
      sphereCenterX = (grid1.centerX + grid2.centerX) / 2;
      sphereCenterY = ((grid1.centerY + grid2.centerY) / 2) + radius;
      sphereCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    }
  }else if (this.axis == "XY"){
    if (selections.length == 1){
      var grid = selections[0];
      sphereCenterX = grid.centerX;
      sphereCenterY = grid.centerY;
      sphereCenterZ = grid.centerZ + radius;
    }else if (selections.length == 2){
      var grid1 = selections[0];
      var grid2 = selections[1];
      sphereCenterX = (grid1.centerX + grid2.centerX) / 2;
      sphereCenterY = (grid1.centerY + grid2.centerY) / 2;
      sphereCenterZ = ((grid1.centerZ + grid2.centerZ) / 2) + radius;
    }
  }else if (this.axis == "YZ"){
    if (selections.length == 1){
      var grid = selections[0];
      sphereCenterX = grid.centerX + radius;
      sphereCenterY = grid.centerY;
      sphereCenterZ = grid.centerZ;
    }else if (selections.length == 2){
      var grid1 = selections[0];
      var grid2 = selections[1];
      sphereCenterX = ((grid1.centerX + grid2.centerX) / 2) + radius;
      sphereCenterY = (grid1.centerY + grid2.centerY) / 2;
      sphereCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    }
  }

  var geomKey = (
    "SphereBufferGeometry" + PIPE +
    Math.abs(radius)+ PIPE +
    "8" + PIPE + "6"
  );
  var sphereGeometry = geometryCache[geomKey];
  if (!sphereGeometry){
    sphereGeometry = new THREE.SphereBufferGeometry(Math.abs(radius));
    geometryCache[geomKey] = sphereGeometry;
  }
  var sphereMesh = new MeshGenerator(sphereGeometry, material).generateMesh();
  sphereMesh.position.set(sphereCenterX, sphereCenterY, sphereCenterZ);
  scene.add(sphereMesh);

  var physicsShapeParameters = {radius: radius};
  var spherePhysicsBody = physicsBodyGenerator.generateSphereBody(physicsShapeParameters);
  spherePhysicsBody.position.set(
    sphereMesh.position.x,
    sphereMesh.position.y,
    sphereMesh.position.z
  );
  physicsWorld.addBody(spherePhysicsBody);
  for (var i = 0; i<selections.length; i++){
    selections[i].toggleSelect(false, false, false, true);
    delete gridSelections[selections[i].name];
  }
  var destroyedGrids = new Object();
  if(selections.length == 1){
    destroyedGrids[selections[0].name] = selections[0];
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    startRow = grid1.rowNumber;
    if (grid2.rowNumber < grid1.rowNumber){
      startRow = grid2.rowNumber;
    }
    startCol = grid1.colNumber;
    if (grid2.colNumber < grid1.colNumber){
      startCol = grid2.colNumber;
    }
    finalRow = grid1.rowNumber;
    if (grid2.rowNumber > grid1.rowNumber){
      finalRow = grid2.rowNumber;
    }
    finalCol = grid1.colNumber;
    if (grid2.colNumber > grid1.colNumber){
      finalCol = grid2.colNumber;
    }
    for (var row = startRow; row <= finalRow; row++){
      for (var col = startCol; col <= finalCol; col++ ){
        var grid = this.getGridByColRow(col, row);
        if (grid){
          destroyedGrids[grid.name] = grid;
        }
      }
    }
  }
  var metaData = new Object();
  metaData["radius"] = radius;
  metaData["gridCount"] = selections.length;
  metaData["grid1Name"] = selections[0].name;
  if (selections.length == 2){
    metaData["grid2Name"] = selections[1].name;
  }
  metaData["gridSystemName"] = this.name;
  metaData["centerX"] = sphereMesh.position.x;
  metaData["centerY"] = sphereMesh.position.y;
  metaData["centerZ"] = sphereMesh.position.z;
  metaData["gridSystemAxis"] = this.axis;
  metaData["physicsShapeParameterRadius"] = physicsShapeParameters.radius;
  var addedObjectInstance = new AddedObject(sphereName, "sphere", metaData, material, sphereMesh, spherePhysicsBody, destroyedGrids);
  addedObjects[sphereName] = addedObjectInstance;
  sphereMesh.addedObject = addedObjectInstance;
  addedObjectInstance.updateMVMatrix();
  sceneHandler.onAddedObjectCreation(addedObjectInstance);
}

GridSystem.prototype.newCylinder = function(cylinderName, material, topRadius, bottomRadius, height, isOpenEnded, selections){
  var cylinderCenterX, cylinderCenterY, cylinderCenterZ;
  if (this.axis == "XZ"){
    if (selections.length == 1){
      var grid = selections[0];
      cylinderCenterX = grid.centerX;
      cylinderCenterY = grid.centerY + (height/2);
      cylinderCenterZ = grid.centerZ;
    }else if (selections.length == 2){
      var grid1 = selections[0];
      var grid2 = selections[1];
      cylinderCenterX = (grid1.centerX + grid2.centerX) / 2;
      cylinderCenterY = ((grid1.centerY + grid2.centerY) / 2) + (height/2);
      cylinderCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    }
  }else if (this.axis == "XY"){
    if (selections.length == 1){
      var grid = selections[0];
      cylinderCenterX = grid.centerX;
      cylinderCenterY = grid.centerY;
      cylinderCenterZ = grid.centerZ + (height/2);
    }else if (selections.length == 2){
      var grid1 = selections[0];
      var grid2 = selections[1];
      cylinderCenterX = (grid1.centerX + grid2.centerX) / 2;
      cylinderCenterY = (grid1.centerY + grid2.centerY) / 2;
      cylinderCenterZ = ((grid1.centerZ + grid2.centerZ) / 2) + (height/2);
    }
  }else if (this.axis == "YZ"){
    if (selections.length == 1){
      var grid = selections[0];
      cylinderCenterX = grid.centerX + (height/2);
      cylinderCenterY = grid.centerY;
      cylinderCenterZ = grid.centerZ;
    }else if (selections.length == 2){
      var grid1 = selections[0];
      var grid2 = selections[1];
      cylinderCenterX = ((grid1.centerX + grid2.centerX) / 2) + (height/2);
      cylinderCenterY = (grid1.centerY + grid2.centerY) / 2;
      cylinderCenterZ = (grid1.centerZ + grid2.centerZ) / 2;
    }
  }
  var geomKey = "CylinderBufferGeometry" + PIPE + height + PIPE + topRadius + PIPE +
                                         bottomRadius + PIPE + 8 + PIPE + 1 + PIPE + isOpenEnded;
  var cylinderGeometry = geometryCache[geomKey];
  if (!cylinderGeometry){
    cylinderGeometry = new THREE.CylinderBufferGeometry(topRadius, bottomRadius, height, 8, 1, isOpenEnded);
    geometryCache[geomKey] = cylinderGeometry;
  }
  var cylinderMesh = new MeshGenerator(cylinderGeometry, material).generateMesh();
  cylinderMesh.position.set(cylinderCenterX, cylinderCenterY, cylinderCenterZ);
  scene.add(cylinderMesh);
  var physicsShapeParameters = {topRadius: topRadius, bottomRadius: bottomRadius, height: height, axis: this.axis, radialSegments: 8};
  if (this.axis == "XY"){
    cylinderMesh.rotateX(Math.PI/2);
  }else if (this.axis == "YZ"){
    cylinderMesh.rotateZ(-Math.PI/2);
  }
  var cylinderPhysicsBody = physicsBodyGenerator.generateCylinderBody(physicsShapeParameters);
  cylinderPhysicsBody.position.set(cylinderMesh.position.x, cylinderMesh.position.y, cylinderMesh.position.z);
  physicsWorld.addBody(cylinderPhysicsBody);
  for (var i = 0; i<selections.length; i++){
    selections[i].toggleSelect(false, false, false, true);
    delete gridSelections[selections[i].name];
  }
  var destroyedGrids = new Object();
  if(selections.length == 1){
    destroyedGrids[selections[0].name] = selections[0];
  }else{
    var grid1 = selections[0];
    var grid2 = selections[1];
    startRow = grid1.rowNumber;
    if (grid2.rowNumber < grid1.rowNumber){
      startRow = grid2.rowNumber;
    }
    startCol = grid1.colNumber;
    if (grid2.colNumber < grid1.colNumber){
      startCol = grid2.colNumber;
    }
    finalRow = grid1.rowNumber;
    if (grid2.rowNumber > grid1.rowNumber){
      finalRow = grid2.rowNumber;
    }
    finalCol = grid1.colNumber;
    if (grid2.colNumber > grid1.colNumber){
      finalCol = grid2.colNumber;
    }
    for (var row = startRow; row <= finalRow; row++){
      for (var col = startCol; col <= finalCol; col++ ){
        var grid = this.getGridByColRow(col, row);
        if (grid){
          destroyedGrids[grid.name] = grid;
        }
      }
    }
  }
  var metaData = new Object();
  metaData["height"] = height;
  metaData["topRadius"] = topRadius;
  metaData["bottomRadius"] = bottomRadius;
  metaData["isOpenEnded"] = isOpenEnded;
  metaData["gridCount"] = selections.length;
  metaData["grid1Name"] = selections[0].name;
  if (selections.length == 2){
    metaData["grid2Name"] = selections[1].name;
  }
  metaData["gridSystemName"] = this.name;
  metaData["centerX"] = cylinderMesh.position.x;
  metaData["centerY"] = cylinderMesh.position.y;
  metaData["centerZ"] = cylinderMesh.position.z;
  metaData["gridSystemAxis"] = this.axis;
  metaData["physicsShapeParameterTopRadius"] = physicsShapeParameters.topRadius;
  metaData["physicsShapeParameterBottomRadius"] = physicsShapeParameters.bottomRadius;
  metaData["physicsShapeParameterHeight"] = physicsShapeParameters.height;
  metaData["physicsShapeParameterAxis"] = physicsShapeParameters.axis;
  metaData["physicsShapeParameterRadialSegments"] = 8;

  var addedObjectInstance = new AddedObject(cylinderName, "cylinder", metaData, material,
                                    cylinderMesh, cylinderPhysicsBody, destroyedGrids);
  addedObjects[cylinderName] = addedObjectInstance;

  cylinderMesh.addedObject = addedObjectInstance;
  addedObjectInstance.updateMVMatrix();
  sceneHandler.onAddedObjectCreation(addedObjectInstance);
}
