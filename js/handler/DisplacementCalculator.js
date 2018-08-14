var DisplacementCalculator = function(obj, worldMatrix){
  var tmpCanvas = document.createElement("canvas");
  var tmpContext = tmpCanvas.getContext("2d");
  var displacementBias = obj.material.displacementBias;
  var displacementScale = obj.material.displacementScale;
  var heightMapWidth = obj.material.displacementMap.image.width;
  var heightMapHeight = obj.material.displacementMap.image.height;
  tmpCanvas.width = heightMapWidth;
  tmpCanvas.height = heightMapHeight;
  //tmpContext.save();
  tmpContext.scale(1, -1);
  tmpContext.translate(0, -1 * heightMapHeight);
  tmpContext.drawImage(obj.material.displacementMap.image, 0, 0);
  //tmpContext.restore();
  var displacementBuffer = tmpContext.getImageData(0, 0, heightMapWidth, heightMapHeight).data;

  var normalMatrix = 0;
  if (worldMatrix){
    normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix);
  }

  var faces = obj.previewMesh.geometry.faces;
  var vertices = obj.previewMesh.geometry.vertices;
  var faceVertexUVs = obj.previewMesh.geometry.faceVertexUvs;
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

  var displacedPositions = [];
  for (var i = 0; i<objPositions.length; i++){
    var position = objPositions[i];
    var normal = objNormals[i];
    var uv = objUVs[i];
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

  this.displacedPositions = displacedPositions;
}
