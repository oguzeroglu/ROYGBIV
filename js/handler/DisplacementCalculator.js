var DisplacementCalculator = function(){

}

DisplacementCalculator.prototype.getDisplacementBuffer = function(texture){
  var tmpCanvas = document.createElement("canvas");
  var tmpContext = tmpCanvas.getContext("2d");
  var heightMapWidth = texture.image.width;
  var heightMapHeight = texture.image.height;
  tmpCanvas.width = heightMapWidth;
  tmpCanvas.height = heightMapHeight;
  tmpContext.drawImage(texture.image, 0, 0);
  return tmpContext.getImageData(0, 0, heightMapWidth, heightMapHeight).data;
}

DisplacementCalculator.prototype.applyDisplacementMap = function(object, texture, scale, bias){
  texture.updateMatrix();
  var heightMapWidth = texture.image.width;
  var heightMapHeight = texture.image.height;
  var displacementBuffer = this.getDisplacementBuffer(texture);
  var geometry = object.mesh.geometry;
  var positions = geometry.attributes.position.array;
  var normals = geometry.attributes.normal.array;
  var uvs = geometry.attributes.uv.array;
  var iterate = true;
  var i = 0, i2 = 0;
  while (iterate){
    var normalX = normals[i];
    var normalY = normals[i+1];
    var normalZ = normals[i+2];
    var uvX = uvs[i2];
    var uvY = uvs[i2+1];
    texture.transformUv(REUSABLE_2_VECTOR.set(uvX, uvY));
    uvX = REUSABLE_2_VECTOR.x;
    uvY = REUSABLE_2_VECTOR.y;
    var u = ((Math.abs(uvX) * heightMapWidth) % heightMapWidth) | 0;
    var v = ((Math.abs(uvY) * heightMapHeight) % heightMapHeight) | 0;
    var pos = (u + v * heightMapWidth) * 4;
    var r = displacementBuffer[pos] / 255.0;
    var normalizedNormal = REUSABLE_VECTOR.set(normalX, normalY, normalZ).normalize();
    positions[i] += normalizedNormal.x * (r * scale + bias);
    positions[i+1] += normalizedNormal.y * (r * scale + bias);
    positions[i+2] += normalizedNormal.z * (r * scale + bias);
    i += 3;
    i2 += 2;
    if (i >= positions.length){
      iterate = false;
    }
  }
  geometry.attributes.position.needsUpdate = true;
}

DisplacementCalculator.prototype.getDisplacedPositions = function(obj, worldMatrix){
  var displacementBias = obj.material.displacementBias;
  var displacementScale = obj.material.displacementScale;
  var heightMapWidth = obj.material.displacementMap.image.width;
  var heightMapHeight = obj.material.displacementMap.image.height;
  var displacementBuffer = this.getDisplacementBuffer(obj.material.displacementMap)

  var normalMatrix = 0;
  if (worldMatrix){
    normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix);
  }

  var geom = obj.getNormalGeometry();

  var faces = geom.faces;
  var vertices = geom.vertices;
  var faceVertexUVs = geom.faceVertexUvs;
  var objPositions = [];
  var objUVs = [];
  var objNormals = [];
  for (var i = 0; i<faces.length ; i++){
    var face = faces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];
    if (!worldMatrix){
      objPositions.push(vertex1);
      objPositions.push(vertex2);
      objPositions.push(vertex3);
    }else{
      var vertex1Clone = vertex1.clone();
      var vertex2Clone = vertex2.clone();
      var vertex3Clone = vertex3.clone();
      vertex1Clone.applyMatrix4(worldMatrix);
      vertex2Clone.applyMatrix4(worldMatrix);
      vertex3Clone.applyMatrix4(worldMatrix);
      objPositions.push(vertex1Clone);
      objPositions.push(vertex2Clone);
      objPositions.push(vertex3Clone);
    }
    if (!normalMatrix){
      objNormals.push(face.normal.clone());
      objNormals.push(face.normal.clone());
      objNormals.push(face.normal.clone());
    }else{
      var normal1 = face.normal.clone();
      var normal2 = face.normal.clone();
      var normal3 = face.normal.clone();
      normal1.applyMatrix3(normalMatrix);
      normal2.applyMatrix3(normalMatrix);
      normal3.applyMatrix3(normalMatrix);
      objNormals.push(normal1);
      objNormals.push(normal2);
      objNormals.push(normal3);
    }
    var curFaceVertexUV = faceVertexUVs[0][i];
    for (var ix = 0; ix<3; ix++){
      var vuv = curFaceVertexUV[ix];
      objUVs.push(new THREE.Vector2(vuv.x, vuv.y));
    }
  }

  if (obj.material.map){
    var offsetX = obj.material.map.offset.x;
    var offsetY = obj.material.map.offset.y;
    while (offsetX < 0){
      offsetX += 100;
    }
    while (offsetY < 0){
      offsetY += 100;
    }
    offsetX = offsetX - Math.floor(offsetX);
    offsetY = offsetY - Math.floor(offsetY);
    obj.material.displacementMap.offset.set(offsetX, offsetY);
  }

  obj.material.displacementMap.updateMatrix();

  var displacedPositions = [];
  for (var i = 0; i<objPositions.length; i++){
    var position = objPositions[i];
    var normal = objNormals[i];
    var uv = objUVs[i];
    obj.material.displacementMap.transformUv(uv);
    var u = ((Math.abs(uv.x) * heightMapWidth) % heightMapWidth) | 0;
    var v = ((Math.abs(uv.y) * heightMapHeight) % heightMapHeight) | 0;
    var pos = (u + v * heightMapWidth) * 4;
    var r = displacementBuffer[pos] / 255.0;
    var normalizedNormal = normal.normalize();
    var newPosition = new THREE.Vector3(position.x, position.y, position.z);
    newPosition.x += normalizedNormal.x * (r * displacementScale + displacementBias);
    newPosition.y += normalizedNormal.y * (r * displacementScale + displacementBias);
    newPosition.z += normalizedNormal.z * (r * displacementScale + displacementBias);
    displacedPositions.push(newPosition);
  }

  return displacedPositions;
}
