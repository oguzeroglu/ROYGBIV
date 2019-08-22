var WallCollection = function(name, height, outlineColor, grid1, grid2, isLoaded, exportObj){
  this.name = name;
  this.height = height;
  this.outlineColor = outlineColor;
  if (isLoaded){
    this.createPreloadedWallCollection(exportObj);
    return;
  }
  if (!grid2){
    grid2 = grid1;
  }
  if (grid1.axis == "XZ"){
    this.sizeX = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * grid1.size;
    this.sizeZ = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * grid1.size;
  }else if (grid1.axis == "XY"){
    this.sizeX = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * grid1.size;
    this.sizeY = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * grid1.size;
  }else if (grid1.axis == "YZ"){
    this.sizeZ = (Math.abs(grid1.colNumber - grid2.colNumber) + 1) * grid1.size;
    this.sizeY = (Math.abs(grid1.rowNumber - grid2.rowNumber) + 1) * grid1.size;
  }
  var centerX, centerY, centerZ;
  if (grid1.axis == "XZ"){
    centerX = (grid1.centerX + grid2.centerX) / 2;
    centerY = grid1.centerY + (this.height / 2);
    centerZ = (grid1.centerZ + grid2.centerZ) / 2;
  }else if (grid1.axis == "XY"){
    centerX = (grid1.centerX + grid2.centerX) / 2;
    centerY = (grid1.centerY + grid2.centerY) / 2;
    centerZ = (grid1.centerZ) + (this.height / 2);
  }else if (grid1.axis == "YZ"){
    centerX = grid1.centerX + (this.height / 2);
    centerY = (grid1.centerY + grid2.centerY) / 2;
    centerZ = (grid1.centerZ + grid2.centerZ) / 2;
  }
  var gridSystem1Name, gridSystem2Name, gridSystem3Name, gridSystem4Name, gridSystemRoofName;
  if (grid1.axis == "XZ"){
    gridSystem1Name = this.name + "_"+"YZ_1";
    gridSystem2Name = this.name + "_"+"YZ_2";
    gridSystem3Name = this.name + "_"+"XY_1";
    gridSystem4Name = this.name + "_"+"XY_2";
    gridSystemRoofName = this.name + "_"+"XZ_ROOF";
  }else if (grid1.axis == "XY"){
    gridSystem1Name = this.name + "_"+"XZ_1",
    gridSystem2Name = this.name + "_"+"XZ_2",
    gridSystem3Name = this.name + "_"+"YZ_1",
    gridSystem4Name = this.name + "_"+"YZ_2",
    gridSystemRoofName = this.name + "_"+"XY_ROOF"
  }else if (grid1.axis == "YZ"){
    gridSystem1Name = this.name + "_"+"XZ_1",
    gridSystem2Name = this.name + "_"+"XZ_2",
    gridSystem3Name = this.name + "_"+"XY_1",
    gridSystem4Name = this.name + "_"+"XY_2",
    gridSystemRoofName = this.name+ "_"+"YZ_ROOF"
  }
  this.gridSystemNames = [
    gridSystem1Name,
    gridSystem2Name,
    gridSystem3Name,
    gridSystem4Name,
    gridSystemRoofName
  ]
  var gridSystem1CenterCoordinates, gridSystem2CenterCoordinates,
      gridSystem3CenterCoordinates, gridSystem4CenterCoordinates,
      gridSystemRoofCenterCoordinates;

  if (grid1.axis == "XZ"){
    gridSystem1CenterCoordinates = [
      centerX - (this.sizeX / 2),
      centerY,
      centerZ
    ];
    gridSystem2CenterCoordinates = [
      centerX + (this.sizeX / 2),
      centerY,
      centerZ
    ];
    gridSystem3CenterCoordinates = [
      centerX,
      centerY,
      centerZ - (this.sizeZ / 2)
    ];
    gridSystem4CenterCoordinates = [
      centerX,
      centerY,
      centerZ + (this.sizeZ / 2)
    ];
    gridSystemRoofCenterCoordinates = [
      centerX,
      centerY + (this.height / 2),
      centerZ
    ];
  } else if (grid1.axis == "XY"){
    gridSystem1CenterCoordinates = [
      centerX,
      centerY + (this.sizeY / 2),
      centerZ
    ];
    gridSystem2CenterCoordinates = [
      centerX,
      centerY - (this.sizeY / 2),
      centerZ
    ];
    gridSystem3CenterCoordinates = [
      centerX - (this.sizeX / 2),
      centerY,
      centerZ
    ];
    gridSystem4CenterCoordinates = [
      centerX + (this.sizeX / 2),
      centerY,
      centerZ
    ];
    gridSystemRoofCenterCoordinates = [
      centerX,
      centerY,
      centerZ + (this.height / 2)
    ];
  } else if (grid1.axis == "YZ"){
    gridSystem1CenterCoordinates = [
      centerX,
      centerY + (this.sizeY / 2),
      centerZ
    ];
    gridSystem2CenterCoordinates = [
      centerX,
      centerY - (this.sizeY / 2),
      centerZ
    ];
    gridSystem3CenterCoordinates = [
      centerX,
      centerY,
      centerZ + (this.sizeZ / 2)
    ];
    gridSystem4CenterCoordinates = [
      centerX,
      centerY,
      centerZ - (this.sizeZ / 2)
    ];
    gridSystemRoofCenterCoordinates = [
      centerX + (this.height / 2),
      centerY,
      centerZ
    ];
  }

  height = Math.abs(height);

  if (grid1.axis == "XZ"){
    new GridSystem(gridSystem1Name, height, this.sizeZ, gridSystem1CenterCoordinates[0], gridSystem1CenterCoordinates[1], gridSystem1CenterCoordinates[2], outlineColor, grid1.size, "YZ");
    new GridSystem(gridSystem2Name, height, this.sizeZ, gridSystem2CenterCoordinates[0], gridSystem2CenterCoordinates[1], gridSystem2CenterCoordinates[2], outlineColor, grid1.size, "YZ");
    new GridSystem(gridSystem3Name, this.sizeX, height, gridSystem3CenterCoordinates[0], gridSystem3CenterCoordinates[1], gridSystem3CenterCoordinates[2], outlineColor, grid1.size, "XY");
    new GridSystem(gridSystem4Name, this.sizeX, height, gridSystem4CenterCoordinates[0], gridSystem4CenterCoordinates[1], gridSystem4CenterCoordinates[2], outlineColor, grid1.size, "XY");
    new GridSystem(gridSystemRoofName, this.sizeX, this.sizeZ, gridSystemRoofCenterCoordinates[0], gridSystemRoofCenterCoordinates[1], gridSystemRoofCenterCoordinates[2], outlineColor, grid1.size, "XZ");
  }else if (grid1.axis == "XY"){
    new GridSystem(gridSystem1Name, this.sizeX, height, gridSystem1CenterCoordinates[0], gridSystem1CenterCoordinates[1], gridSystem1CenterCoordinates[2], outlineColor, grid1.size, "XZ");
    new GridSystem(gridSystem2Name, this.sizeX, height, gridSystem2CenterCoordinates[0], gridSystem2CenterCoordinates[1], gridSystem2CenterCoordinates[2], outlineColor, grid1.size, "XZ");
    new GridSystem(gridSystem3Name, this.sizeY, height, gridSystem3CenterCoordinates[0], gridSystem3CenterCoordinates[1], gridSystem3CenterCoordinates[2], outlineColor, grid1.size, "YZ");
    new GridSystem(gridSystem4Name, this.sizeY, height, gridSystem4CenterCoordinates[0], gridSystem4CenterCoordinates[1], gridSystem4CenterCoordinates[2], outlineColor, grid1.size, "YZ");
    new GridSystem(gridSystemRoofName, this.sizeX, this.sizeY, gridSystemRoofCenterCoordinates[0], gridSystemRoofCenterCoordinates[1], gridSystemRoofCenterCoordinates[2], outlineColor, grid1.size, "XY");
  }else if (grid1.axis == "YZ"){
    new GridSystem(gridSystem1Name, height, this.sizeZ, gridSystem1CenterCoordinates[0], gridSystem1CenterCoordinates[1], gridSystem1CenterCoordinates[2], outlineColor, grid1.size, "XZ");
    new GridSystem(gridSystem2Name, height, this.sizeZ, gridSystem2CenterCoordinates[0], gridSystem2CenterCoordinates[1], gridSystem2CenterCoordinates[2], outlineColor, grid1.size, "XZ");
    new GridSystem(gridSystem3Name, height, this.sizeY, gridSystem3CenterCoordinates[0], gridSystem3CenterCoordinates[1], gridSystem3CenterCoordinates[2], outlineColor, grid1.size, "XY");
    new GridSystem(gridSystem4Name, height, this.sizeY, gridSystem4CenterCoordinates[0], gridSystem4CenterCoordinates[1], gridSystem4CenterCoordinates[2], outlineColor, grid1.size, "XY");
    new GridSystem(gridSystemRoofName, this.sizeY, this.sizeZ, gridSystemRoofCenterCoordinates[0], gridSystemRoofCenterCoordinates[1], gridSystemRoofCenterCoordinates[2], outlineColor, grid1.size, "YZ");
  }
  wallCollections[this.name] = this;
};

WallCollection.prototype.createPreloadedWallCollection = function(exportObj){
  this.sizeX = exportObj.sizeX;
  this.sizeZ = exportObj.sizeZ;
  this.gridSystemNames = exportObj.gridSystemNames;
  wallCollections[this.name] = this;
}

WallCollection.prototype.export = function(){
  var exportObject = new Object();
  exportObject["name"] = this.name;
  exportObject["height"] = this.height;
  exportObject["outlineColor"] = this.outlineColor;
  exportObject["sizeX"] = this.sizeX;
  exportObject["sizeZ"] = this.sizeZ;
  exportObject["gridSystemNames"] = this.gridSystemNames;
  return exportObject;
}

WallCollection.prototype.destroy = function(){
  for (var i=0; i<this.gridSystemNames.length; i++){
    var gridSystemName = this.gridSystemNames[i];
    if (gridSystems[gridSystemName]){
      gridSystems[gridSystemName].destroy();
    }
  }
  delete wallCollections[this.name];
}
