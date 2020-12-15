var RMFHandler = function(){

}

RMFHandler.prototype.generate = function(positions, normals, uvs, indexedMaterialIndices){
  var indexInfos = {};
  var indexInfosInverse = {};
  var curIndex = 0;

  var i2 = 0;
  var indices = [];
  for (var i = 0; i < positions.length; i += 3){
    var curPosX = positions[i];
    var curPosY = positions[i + 1];
    var curPosZ = positions[i + 2];
    var curNormalX = normals[i];
    var curNormalY = normals[i + 1];
    var curNormalZ = normals[i + 2];
    var curUVX = uvs[i2];
    var curUVY = uvs[i2 + 1];
    var key = curPosX + PIPE + curPosY + PIPE + curPosZ;
    key += PIPE + curNormalX + PIPE + curNormalY + PIPE + curNormalZ;
    key += PIPE + curUVX + PIPE + curUVY;
    if (indexInfos[key]){
      indices.push(indexInfos[key]);
    }else{
      indexInfos[key] = curIndex;
      indexInfosInverse[curIndex] = key;
      indices.push(curIndex);
      curIndex ++;
    }
    i2 += 2;
  }

  var info = [curIndex];

  for (var i = 0; i < curIndex; i ++){
    var key = indexInfosInverse[i];
    var splitted = key.split(PIPE);
    info.push(parseFloat(splitted[0]));
    info.push(parseFloat(splitted[1]));
    info.push(parseFloat(splitted[2]));
    info.push(parseFloat(splitted[3]));
    info.push(parseFloat(splitted[4]));
    info.push(parseFloat(splitted[5]));
    info.push(parseFloat(splitted[6]));
    info.push(parseFloat(splitted[7]));
  }

  info.push(indices.length);

  for (var i = 0; i < indices.length; i ++){
    info.push(indices[i]);
  }

  var indexedMaterilIndicesInfo = [
    {index: indexedMaterialIndices[0], count: 1}
  ];

  for (var i = 1; i < indexedMaterialIndices.length; i ++){
    var curInfo = indexedMaterilIndicesInfo[indexedMaterilIndicesInfo.length - 1];
    if (curInfo.index == indexedMaterialIndices[i]){
      curInfo.count ++;
    }else{
      indexedMaterilIndicesInfo.push({
        index: indexedMaterialIndices[i],
        count: 1
      });
    }
  }

  for (var i = 0; i < indexedMaterilIndicesInfo.length; i ++){
    info.push(indexedMaterilIndicesInfo[i].index);
    info.push(indexedMaterilIndicesInfo[i].count);
  }

  return new Float32Array(info);
}

RMFHandler.prototype.load = function(folderName, onReady){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./models/" + folderName + "/model.rmf", true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function (oEvent) {
    var arrayBuffer = xhr.response;
    var view = new Float32Array(arrayBuffer);

    var indicesLength = view[0];

    var positions = [];
    var normals = [];
    var uvs = [];

    var totalRead = 0;
    var i = 1;
    while (totalRead != indicesLength){
      var curPosX = view[i ++];
      var curPosY = view[i ++];
      var curPosZ = view[i ++];
      var curNormalX = view[i ++];
      var curNormalY = view[i ++];
      var curNormalZ = view[i ++];
      var curUVX = view[i ++];
      var curUVY = view[i ++];

      positions.push(curPosX);
      positions.push(curPosY);
      positions.push(curPosZ);
      normals.push(curNormalX);
      normals.push(curNormalY);
      normals.push(curNormalZ);
      uvs.push(curUVX);
      uvs.push(curUVY);

      totalRead ++;
    }

    var indices = new Array(indicesLength);

    var i2 = 0;

    var len = view[1 + (indicesLength * 8)];
    var start = 2 + (indicesLength * 8)
    for (var i = start; i < start + len; i ++){
      var curIndex = view[i];
      indices[i2 ++] = curIndex;
    }

    var indexedMaterialIndices = [];
    for (var x = i; x < view.length; x += 2){
      var index = view[x];
      var count = view[x + 1];
      for (var y = 0; y < count; y ++){
        indexedMaterialIndices.push(index);
      }
    }

    onReady(positions, normals, uvs, indices, indexedMaterialIndices);
  };

  xhr.send(null);
}
