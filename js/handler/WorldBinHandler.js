var WorldBinHandler = function(fromWorker){
  this.bin = new Object();
  if (!fromWorker){
    for (var objName in addedObjects){
      var object = addedObjects[objName];
      object.generateBoundingBoxes();
      for (var i = 0; i<object.boundingBoxes.length; i++){
        this.insert(object.boundingBoxes[i], objName);
      }
    }
    for (var objName in objectGroups){
      var object = objectGroups[objName];
      object.generateBoundingBoxes();
      for (var i = 0; i<object.boundingBoxes.length; i++){
        this.insert(object.boundingBoxes[i], object.boundingBoxes[i].roygbivObjectName, objName);
      }
    }
  }
}

WorldBinHandler.prototype.deleteObjectFromBin = function(binInfo, objName){
  for (var x in binInfo){
    for (var y in binInfo[x]){
      for (var z in binInfo[x][y]){
        delete this.bin[x][y][z][objName];
        delete binInfo[x][y][z];
        if (Object.keys(this.bin[x][y][z]).length == 0){
          delete this.bin[x][y][z];
          delete binInfo[x][y][z];
          if (Object.keys(this.bin[x][y]).length == 0){
            delete this.bin[x][y];
            delete binInfo[x][y];
            if (Object.keys(this.bin[x]).length == 0){
              delete this.bin[x];
              delete binInfo[x];
            }
          }
        }
      }
    }
  }
}

WorldBinHandler.prototype.updateObject = function(obj){
  if (obj instanceof AddedObject){
    for (var x in obj.binInfo){
      for (var y in obj.binInfo[x]){
        for (var z in obj.binInfo[x][y]){
          delete this.bin[x][y][z][obj.name];
          delete obj.binInfo[x][y][z];
          if (Object.keys(this.bin[x][y][z]).length == 0){
            delete this.bin[x][y][z];
            delete obj.binInfo[x][y][z];
            if (Object.keys(this.bin[x][y]).length == 0){
              delete this.bin[x][y];
              delete obj.binInfo[x][y];
              if (Object.keys(this.bin[x]).length == 0){
                delete this.bin[x];
                delete obj.binInfo[x];
              }
            }
          }
        }
      }
    }
    obj.previewMesh.updateMatrixWorld();
    obj.updateBoundingBoxes();
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.name);
    }
  }else if (obj instanceof ObjectGroup){
    for (var x in obj.binInfo){
      for (var y in obj.binInfo[x]){
        for (var z in obj.binInfo[x][y]){
          delete this.bin[x][y][z][obj.name];
          delete obj.binInfo[x][y][z];
          if (Object.keys(this.bin[x][y][z]).length == 0){
            delete this.bin[x][y][z];
            delete obj.binInfo[x][y][z];
            if (Object.keys(this.bin[x][y]).length == 0){
              delete this.bin[x][y];
              delete obj.binInfo[x][y];
              if (Object.keys(this.bin[x]).length == 0){
                delete this.bin[x];
                delete obj.binInfo[x];
              }
            }
          }
        }
      }
    }
    obj.previewGraphicsGroup.updateMatrixWorld();
    obj.updateBoundingBoxes();
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.boundingBoxes[i].roygbivObjectName, obj.name);
    }
  }
}

WorldBinHandler.prototype.show = function(obj){
  if (obj instanceof AddedObject){
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.name);
    }
  }else if (obj instanceof ObjectGroup){
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.boundingBoxes[i].roygbivObjectName, obj.name);
    }
  }
}

WorldBinHandler.prototype.hide = function(obj){
  if (obj instanceof AddedObject){
    for (var x in obj.binInfo){
      for (var y in obj.binInfo[x]){
        for (var z in obj.binInfo[x][y]){
          delete this.bin[x][y][z][obj.name];
          if (Object.keys(this.bin[x][y][z]).length == 0){
            delete this.bin[x][y][z];
            if (Object.keys(this.bin[x][y]).length == 0){
              delete this.bin[x][y];
              if (Object.keys(this.bin[x]).length == 0){
                delete this.bin[x];
              }
            }
          }
        }
      }
    }
    obj.binInfo = new Object();
  }else if (obj instanceof ObjectGroup){
    for (var x in obj.binInfo){
      for (var y in obj.binInfo[x]){
        for (var z in obj.binInfo[x][y]){
          delete this.bin[x][y][z][obj.name];
          delete obj.binInfo[x][y][z];
          if (Object.keys(this.bin[x][y][z]).length == 0){
            delete this.bin[x][y][z];
            if (Object.keys(this.bin[x][y]).length == 0){
              delete this.bin[x][y];
              if (Object.keys(this.bin[x]).length == 0){
                delete this.bin[x];
              }
            }
          }
          if (Object.keys(obj.binInfo[x][y]).length == 0){
            delete obj.binInfo[x][y];
            if (Object.keys(obj.binInfo[x]).length == 0){
              delete obj.binInfo[x];
            }
          }
        }
      }
    }
  }
}

WorldBinHandler.prototype.update = function(){
  for (var objName in dynamicObjects){
    var obj = dynamicObjects[objName];
    if (obj.isHidden){
      continue;
    }
    for (var x in obj.binInfo){
      for (var y in obj.binInfo[x]){
        for (var z in obj.binInfo[x][y]){
          delete this.bin[x][y][z][objName];
          if (Object.keys(this.bin[x][y][z]).length == 0){
            delete this.bin[x][y][z];
            if (Object.keys(this.bin[x][y]).length == 0){
              delete this.bin[x][y];
              if (Object.keys(this.bin[x]).length == 0){
                delete this.bin[x];
              }
            }
          }
          delete obj.binInfo[x][y][z];
          if (Object.keys(obj.binInfo[x][y]).length == 0){
            delete obj.binInfo[x][y];
            if (Object.keys(obj.binInfo[x]).length == 0){
              delete obj.binInfo[x];
            }
          }
        }
      }
    }
    obj.updateBoundingBoxes();
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], objName);
    }
  }
  for (var objName in dynamicObjectGroups){
    var obj = dynamicObjectGroups[objName];
    if (obj.isHidden){
      continue;
    }
    for (var x in obj.binInfo){
      for (var y in obj.binInfo[x]){
        for (var z in obj.binInfo[x][y]){
          delete this.bin[x][y][z][objName];
          delete obj.binInfo[x][y][z];
          if (Object.keys(this.bin[x][y][z]).length == 0){
            delete this.bin[x][y][z];
            if (Object.keys(this.bin[x][y]).length == 0){
              delete this.bin[x][y];
              if (Object.keys(this.bin[x]).length == 0){
                delete this.bin[x];
              }
            }
          }
          if (Object.keys(obj.binInfo[x][y]).length == 0){
            delete obj.binInfo[x][y];
            if (Object.keys(obj.binInfo[x]).length == 0){
              delete obj.binInfo[x];
            }
          }
        }
      }
    }
    obj.updateBoundingBoxes();
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.boundingBoxes[i].roygbivObjectName, objName);
    }
  }
}

WorldBinHandler.prototype.visualize = function(selectedScene, customBin){
  if (customBin){
    this.bin = customBin;
  }
  for (var minX in this.bin){
    for (var minY in this.bin[minX]){
      for (var minZ in this.bin[minX][minY]){
        for (var objName in this.bin[minX][minY][minZ]){
          var minX = parseInt(minX);
          var minY = parseInt(minY);
          var minZ = parseInt(minZ);
          var bb = new THREE.Box3(
            new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(minX+BIN_SIZE, minY+BIN_SIZE, minZ+BIN_SIZE)
          );
          if (!this.visualObjects){
            this.visualObjects = [];
          }
          var b3h = new THREE.Box3Helper(bb, new THREE.Color("lime"));
          selectedScene.add(b3h);
          this.visualObjects.push(b3h);
        }
      }
    }
  }
}

WorldBinHandler.prototype.devisualize = function(selectedScene){
  if (this.visualObjects){
    for (var i = 0; i<this.visualObjects.length; i++){
      selectedScene.remove(this.visualObjects[i]);
    }
  }
  this.visualObjects = [];
}

WorldBinHandler.prototype.query = function(point){
  var performance1 = performance.now();
  var x = point.x;
  var y = point.y;
  var z = point.z;
  var rX = Math.round(x / BIN_SIZE) * BIN_SIZE;
  var rY = Math.round(y / BIN_SIZE) * BIN_SIZE;
  var rZ = Math.round(z / BIN_SIZE) * BIN_SIZE;

  var minX, maxX;
  if (rX <= x){
    minX = rX;
    maxX = rX + BIN_SIZE;
  }else{
    maxX = rX;
    minX = rX - BIN_SIZE;
  }
  var minY, maxY;
  if (rY <= y){
    minY = rY;
    maxY = rY + BIN_SIZE;
  }else{
    maxY = rY;
    minY = rY - BIN_SIZE;
  }
  var minZ, maxZ;
  if (rZ <= z){
    minZ = rZ;
    maxZ = rZ + BIN_SIZE;
  }else{
    maxZ = rZ;
    minZ = rZ - BIN_SIZE;
  }

  var results = new Object();

  for (var xDiff = -BIN_SIZE; xDiff <= BIN_SIZE; xDiff += BIN_SIZE){
    for (var yDiff = -BIN_SIZE; yDiff <= BIN_SIZE; yDiff += BIN_SIZE){
      for (var zDiff = -BIN_SIZE; zDiff <= BIN_SIZE; zDiff += BIN_SIZE){
        var keyX = (minX + xDiff);
        var keyY = (minY + yDiff);
        var keyZ = (minZ + zDiff);
        if (this.bin[keyX] && this.bin[keyX][keyY]){
          var res = this.bin[keyX][keyY][keyZ];
          if (res){
            for (var objName in res){
              if (addedObjects[objName]){
                results[objName] = 5;
              }else if (objectGroups[objName]){
                if (!results[objName]){
                  results[objName] = new Object();
                }
                for (var childObjName in res[objName]){
                  results[objName][childObjName] = 5;
                }
              }
            }
          }
        }
      }
    }
  }
  var performance2 = performance.now();
  this.lastQueryPerformance = performance2 - performance1;
  return results;
}

WorldBinHandler.prototype.insert = function(boundingBox, objName, parentName){
  if (!LIMIT_BOUNDING_BOX.containsBox(boundingBox)){
    return;
  }
  var minX = boundingBox.min.x;
  var minY = boundingBox.min.y;
  var minZ = boundingBox.min.z;
  var maxX = boundingBox.max.x;
  var maxY = boundingBox.max.y;
  var maxZ = boundingBox.max.z;

  var round = Math.round(minX / BIN_SIZE) * BIN_SIZE;
  var minXLower, minXUpper;
  if (round <= minX){
    minXLower = round;
    minXUpper = minXLower + BIN_SIZE;
  }else{
    minXUpper = round;
    minXLower = round - BIN_SIZE;
  }

  round = Math.round(maxX / BIN_SIZE) * BIN_SIZE;
  var maxXLower, maxXUpper;
  if (round < maxX){
    maxXLower = round;
    maxXUpper = maxXLower + BIN_SIZE;
  }else{
    maxXUpper = round;
    maxXLower = round - BIN_SIZE;
  }
  if (minXLower > maxXLower){
    maxXLower = minXLower;
  }

  round = Math.round(minY/BIN_SIZE) * BIN_SIZE;
  var minYLower, minYUpper;
  if (round <= minY){
    minYLower = round;
    minYUpper = minYLower + BIN_SIZE;
  }else{
    minYUpper = round;
    minYLower = round - BIN_SIZE;
  }

  round = Math.round(maxY/BIN_SIZE) * BIN_SIZE;
  var maxYLower, maxYUpper;
  if (round < maxY){
    maxYLower = round;
    maxYUpper = maxYLower + BIN_SIZE;
  }else{
    maxYUpper = round;
    maxYLower = round - BIN_SIZE;
  }
  if (minYLower > maxYLower){
    maxYLower = minYLower;
  }

  round = Math.round(minZ/BIN_SIZE) * BIN_SIZE;
  var minZLower, minZUpper;
  if (round <= minZ){
    minZLower = round;
    minZUpper = minZLower + BIN_SIZE;
  }else{
    minZUpper = round;
    minZLower = round - BIN_SIZE;
  }

  round = Math.round(maxZ/BIN_SIZE) * BIN_SIZE;
  var maxZLower, maxZUpper;
  if (round < maxZ){
    maxZLower = round;
    maxZUpper = maxZLower + BIN_SIZE;
  }else{
    maxZUpper = round;
    maxZLower = round - BIN_SIZE;
  }
  if (minZLower > maxZLower){
    maxZLower = minZLower;
  }


  for (var x = minXLower; x<= maxXLower; x+= BIN_SIZE){
    for (var y = minYLower; y<= maxYLower; y+= BIN_SIZE){
      for (var z = minZLower; z <= maxZLower; z+= BIN_SIZE){
        if (!this.bin[x]){
          this.bin[x] = new Object();
        }
        if (!this.bin[x][y]){
          this.bin[x][y] = new Object();
        }
        if (!this.bin[x][y][z]){
          this.bin[x][y][z] = new Object();
        }
        if (!parentName){
          this.bin[x][y][z][objName] = true;
        }else{
          this.bin[x][y][z][parentName] = new Object();
          this.bin[x][y][z][parentName][objName] = true;
        }
        var obj = addedObjects[objName];
        if (!obj){
          obj = objectGroups[parentName];
        }
        if (obj){
          if (!obj.binInfo){
            obj.binInfo = new Object();
          }
          if (!obj.binInfo[x]){
            obj.binInfo[x] = new Object();
          }
          if (!obj.binInfo[x][y]){
            obj.binInfo[x][y] = new Object();
          }
          obj.binInfo[x][y][z] = true;
        }
      }
    }
  }

}
