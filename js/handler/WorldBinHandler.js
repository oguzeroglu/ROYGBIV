var WorldBinHandler = function(){
  this.bin = new Map();
  this.cache = new Map();
  this.applyCaching = true;
  this.cacheHitCount = 0;
}

WorldBinHandler.prototype.deleteObjectFromBin = function(binInfo, objName){
  if (!binInfo){
    return;
  }
  for (var x of binInfo.keys()){
    for (var y of binInfo.get(x).keys()){
      for (var z of binInfo.get(x).get(y).keys()){
        if (this.bin.has(x) && this.bin.get(x).has(y) && this.bin.get(x).get(y).has(z)){
          this.bin.get(x).get(y).get(z).delete(objName);
          if (this.bin.get(x).get(y).get(z).size == 0){
            this.bin.get(x).get(y).delete(z);
          }
          if (this.bin.get(x).get(y).size == 0){
            this.bin.get(x).delete(y);
          }
          if (this.bin.get(x).size == 0){
            this.bin.delete(x);
          }
        }
      }
    }
  }
  for (var x of binInfo.keys()){
    binInfo.delete(x);
  }
}

WorldBinHandler.prototype.updateObject = function(obj){
  if (obj.isAddedObject){
    this.deleteObjectFromBin(obj.binInfo, obj.name);
    obj.mesh.updateMatrixWorld();
    obj.updateBoundingBoxes();
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.name);
    }
  }else if (obj.isObjectGroup){
    this.deleteObjectFromBin(obj.binInfo, obj.name);
    if (!obj.boundingBoxes){
      obj.generateBoundingBoxes();
    }
    obj.graphicsGroup.updateMatrixWorld();
    obj.updateBoundingBoxes();
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.boundingBoxes[i].roygbivObjectName, obj.name);
    }
  }else if (obj.isAddedText){
    this.deleteObjectFromBin(obj.binInfo, obj.name);
    if (!obj.boundingBox){
      obj.handleBoundingBox();
    }
    this.insert(obj.boundingBox, obj.name);
  }
  if (this.applyCaching && this.cache.size > 0){
    this.cache.clear();
    this.cacheHitCount = 0;
  }
}

WorldBinHandler.prototype.show = function(obj){
  if (obj.isAddedObject){
    if (mode == 1 && !obj.isIntersectable){
      return;
    }
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.name);
    }
  }else if (obj.isObjectGroup){
    if (mode == 1 && !obj.isIntersectable){
      return;
    }
    for (var i = 0; i<obj.boundingBoxes.length; i++){
      this.insert(obj.boundingBoxes[i], obj.boundingBoxes[i].roygbivObjectName, obj.name);
    }
  }else if (obj.isAddedText){
    this.insert(obj.boundingBox, obj.name);
  }
  if (this.applyCaching && this.cache.size > 0){
    this.cache.clear();
    this.cacheHitCount = 0;
  }
}

WorldBinHandler.prototype.hide = function(obj){
  if (mode == 1 && (obj.isAddedObject || obj.isObjectGroup) && !obj.isIntersectable){
    return;
  }
  this.deleteObjectFromBin(obj.binInfo, obj.name);
  if (this.applyCaching && this.cache.size > 0){
    this.cache.clear();
    this.cacheHitCount = 0;
  }
}

WorldBinHandler.prototype.visualize = function(selectedScene, customBin){
  if (customBin){
    this.bin = customBin;
  }
  for (var minX of this.bin.keys()){
    for (var minY of this.bin.get(minX).keys()){
      for (var minZ of this.bin.get(minX).get(minY).keys()){
        for (var objName of this.bin.get(minX).get(minY).get(minZ)){
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

WorldBinHandler.prototype.queryArea = function(point){
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
  if (this.bin.has(minX) && this.bin.get(minX).has(minY)){
    var res = this.bin.get(minX).get(minY).get(minZ);
    if (res){
      for (var areaName of res.keys()){
        var area = areas[areaName];
        if (area.boundingBox.containsPoint(point)){
          return areaName;
        }
      }
    }
  }
}

WorldBinHandler.prototype.query = function(point){
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

  var cacheKey;
  if (this.applyCaching){
    cacheKey = minX + PIPE + minY + PIPE + minZ;
    var cached = this.cache.get(cacheKey);
    if (cached){
      this.cacheHitCount ++;
      if (this.cacheHitCount > 10000){
        this.cacheHitCount = 0;
      }
      return cached;
    }
  }
  var results = new Object();

  for (var xDiff = -BIN_SIZE; xDiff <= BIN_SIZE; xDiff += BIN_SIZE){
    for (var yDiff = -BIN_SIZE; yDiff <= BIN_SIZE; yDiff += BIN_SIZE){
      for (var zDiff = -BIN_SIZE; zDiff <= BIN_SIZE; zDiff += BIN_SIZE){
        var keyX = (minX + xDiff);
        var keyY = (minY + yDiff);
        var keyZ = (minZ + zDiff);
        if (this.bin.has(keyX) && this.bin.get(keyX).has(keyY)){
          var res = this.bin.get(keyX).get(keyY).get(keyZ);
          if (res){
            for (var objName of res.keys()){
              if (addedObjects[objName]){
                results[objName] = 5;
              }else if (objectGroups[objName]){
                if (!results[objName]){
                  results[objName] = new Object();
                }
                for (var childObjName of res.get(objName).keys()){
                  results[objName][childObjName] = 5;
                }
              }else if (gridSystems[objName]){
                results[objName] = 10;
              }else if (addedTexts[objName]){
                results[objName] = 20;
              }
            }
          }
        }
      }
    }
  }
  if (this.applyCaching){
    this.cache.set(cacheKey, results);
  }
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
        if (!this.bin.has(x)){
          this.bin.set(x, new Map());
        }
        if (!this.bin.get(x).has(y)){
          this.bin.get(x).set(y, new Map());
        }
        if (!this.bin.get(x).get(y).has(z)){
          this.bin.get(x).get(y).set(z, new Map());
        }
        if (!parentName){
          this.bin.get(x).get(y).get(z).set(objName, true);
        }else{
          if (this.bin.get(x).get(y).get(z).has(parentName)){
            continue;
          }
          var newMap = new Map();
          newMap.set(objName, true);
          this.bin.get(x).get(y).get(z).set(parentName, newMap);
        }
        var obj;
        if (!this.isAreaBinHandler){
          obj = addedObjects[objName];
          if (!obj){
            obj = objectGroups[parentName];
          }
          if (!obj){
            obj = addedTexts[objName];
          }
        }else{
          obj = areas[objName];
        }
        if (obj){
          if (!obj.binInfo){
            obj.binInfo = new Map();
          }
          if (!obj.binInfo.has(x)){
            obj.binInfo.set(x, new Map());
          }
          if (!obj.binInfo.get(x).has(y)){
            obj.binInfo.get(x).set(y, new Map());
          }
          obj.binInfo.get(x).get(y).set(z, true);
        }
      }
    }
  }

}
