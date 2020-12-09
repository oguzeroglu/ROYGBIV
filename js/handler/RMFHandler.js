var RMFHandler = function(){

}

RMFHandler.prototype.generate = function(positions, normals, uvs){
  var positionsPart = this.generatePart(positions, 3);
  var normalsPart = this.generatePart(normals, 3);
  var uvsPart = this.generatePart(uvs, 2);

  var total = new Float32Array(positionsPart.length + normalsPart.length + uvsPart.length);
  total.set(positionsPart);
  total.set(normalsPart, positionsPart.length);
  total.set(uvsPart, normalsPart.length + positionsPart.length);

  return total;
}

RMFHandler.prototype.generatePart = function(ary, incr){
  var partMap = {};
  var partMapInverse = {};
  var partIndex = 0;
  var partIndices = [];

  for (var i = 0; i < ary.length; i += incr){
    var curX, curY, curZ, curKey;
    if (incr == 3){
      curX = ary[i];
      curY = ary[i + 1];
      curZ = ary[i + 2];
      curKey = curX + PIPE + curY + PIPE + curZ;
    }else{
      curX = ary[i];
      curY = ary[i + 1];
      curKey = curX + PIPE + curY;
    }
    if (partMap[curKey]){
      partIndices.push(partMap[curKey]);
    }else{
      partIndices.push(partIndex);
      partMapInverse[partIndex] = curKey;
      partMap[curKey] = partIndex ++;
    }
  }

  var allData = [];
  for (var i = 0; i < partIndex; i ++){
    var splitted = partMapInverse[i].split(PIPE);
    allData.push(parseFloat(splitted[0]));
    allData.push(parseFloat(splitted[1]));
    if (incr == 3){
      allData.push(parseFloat(splitted[2]));
    }
  }

  var partData = new Float32Array(1 + allData.length + 1 + partIndices.length);
  var i = 0;
  partData[i ++] = allData.length;
  for (var i2 = 0; i2 < allData.length; i2 ++){
    partData[i ++] = allData[i2];
  }
  partData[i ++] = partIndices.length;
  for (var i2 = 0; i2 < partIndices.length; i2 ++){
    partData[i ++] = partIndices[i2];
  }

  return partData;
}

RMFHandler.prototype.read = function(view, ary, count, startIndex){
  var all = [];

  for (var i = 0; i < view[startIndex]; i += count){
    var x = view[startIndex + 1 + i];
    var y = view[startIndex + 2 + i];
    if (count == 3){
      var z = view[startIndex + 3 + i];
      all.push({x: x, y: y, z: z});
    }else{
      all.push({x: x, y: y});
    }
  }

  var indicesLength = view[startIndex + view[startIndex] + 1];

  for (var i = startIndex + view[startIndex] + 2; i < startIndex + view[startIndex] + 2 + indicesLength; i ++){
    var data = all[view[i]];
    ary.push(data.x);
    ary.push(data.y);
    if (count == 3){
      ary.push(data.z);
    }
  }

  return startIndex + view[startIndex] + 1 + indicesLength + 1;
}

RMFHandler.prototype.load = function(folderName, onReady){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./models/" + folderName + "/model.rmf", true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function (oEvent) {
    var arrayBuffer = xhr.response;
    var view = new Float32Array(arrayBuffer);

    var positions = [], normals = [], uvs = [];

    // Black magic
    rmfHandler.read(view, uvs, 2, rmfHandler.read(view, normals, 3, rmfHandler.read(view, positions, 3, 0)));

    onReady(positions, normals, uvs);
  };

  xhr.send(null);
}
