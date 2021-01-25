var RMFHandler = function(){

}

RMFHandler.prototype.generate = function(model){
  var indexInfos = model.indexInfos;
  var indexInfosInverse = model.indexInfosInverse;
  var curIndex = model.curIndex;
  var indices = model.indices;
  var indexedMaterialIndices = model.indexedMaterialIndices;

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

  var intAry = [];

  for (var i = 0; i < indices.length; i ++){
    var base127 = this.convertBase127(indices[i]);
    intAry.push(255 - base127[0]);
    for (var i2 = 1; i2 < base127.length; i2 ++){
      intAry.push(base127[i2]);
    }
  }

  var int8Ary = new Uint8Array(intAry);

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

  return {
    rmf: new Float32Array(info),
    rmif: int8Ary
  };
}

RMFHandler.prototype.load = function(folderName, onReady){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./models/" + folderName + "/model.rmf", true);
  xhr.responseType = "arraybuffer";

  var xhr2 = new XMLHttpRequest();
  xhr2.open("GET", "./models/" + folderName + "/model.rmif", true);
  xhr2.responseType = "arraybuffer";

  var rmfLoaded = false;
  var rmifLoaded = false;
  var loadedInfo = {};
  var positions = null;
  var normals = null;
  var uvs = null;
  var indices = null;
  var indexedMaterialIndices = null;

  var allLoaded = function(){
    if (!(rmfLoaded && rmifLoaded)){
      return;
    }

    onReady(positions, normals, uvs, indices, indexedMaterialIndices);
  }

  xhr.onload = function () {
    var arrayBuffer = xhr.response;
    var view = new Float32Array(arrayBuffer);

    var indicesLength = view[0];

    positions = new Float32Array(indicesLength * 3);
    normals = new Float32Array(indicesLength * 3);
    uvs = new Float32Array(indicesLength * 2);

    var totalRead = 0;
    var i = 1;

    var x = 0, y = 0; z = 0;
    while (totalRead != indicesLength){
      var curPosX = view[i ++];
      var curPosY = view[i ++];
      var curPosZ = view[i ++];
      var curNormalX = view[i ++];
      var curNormalY = view[i ++];
      var curNormalZ = view[i ++];
      var curUVX = view[i ++];
      var curUVY = view[i ++];

      positions[x ++] = curPosX;
      positions[x ++] = curPosY;
      positions[x ++] = curPosZ;
      normals[y ++] = curNormalX;
      normals[y ++] = curNormalY;
      normals[y ++] = curNormalZ;
      uvs[z ++] = curUVX;
      uvs[z ++] = curUVY;

      totalRead ++;
    }

    var i2 = 0;

    var len = view[1 + (indicesLength * 8)];
    var start = 2 + (indicesLength * 8);
    indexedMaterialIndices = [];
    var stuff = 0;
    for (var x = start; x < view.length; x += 2){
      var index = view[x];
      var count = view[x + 1];
      for (var y = 0; y < count; y ++){
        indexedMaterialIndices.push(index);
      }
    }
    rmfLoaded = true;
    allLoaded();
  };

  xhr2.onload = function() {
    var view = new Uint8Array(xhr2.response);

    indices = [];
    var i = 0;
    while (i < view.length){
      var firstVal = 255 - view[i++];
      var ary = [firstVal];
      while (view[i] < 127){
        ary.push(view[i ++]);
      }
      indices.push(rmfHandler.convertFromBase127(ary));
    }

    rmifLoaded = true;
    allLoaded();
  }

  xhr.send(null);
  xhr2.send(null);
}

RMFHandler.prototype.convertBase127 = function(index){
  var ary = [];
  var iterate = true;
  var val = index;
  while (val >= 127){
    ary.push(val % 127);
    val = Math.floor(val / 127);
  }

  ary.push(val);
  return ary;
}

RMFHandler.prototype.convertFromBase127 = function(ary){
  var val = 0;
  for (var i = 0; i < ary.length; i ++){
    val += Math.pow(127, i) * ary[i];
  }
  return val;
}
