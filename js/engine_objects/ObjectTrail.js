var ObjectTrail = function(configurations){
  this.object = configurations.object;
  this.alpha = configurations.alpha;

  var OBJECT_TRAIL_MAX_TIME_IN_SECS = OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT;
  if (!(typeof configurations.maxTimeInSeconds == UNDEFINED)){
    OBJECT_TRAIL_MAX_TIME_IN_SECS = configurations.maxTimeInSeconds;
  }
  this.OBJECT_TRAIL_MAX_TIME_IN_SECS = OBJECT_TRAIL_MAX_TIME_IN_SECS;

  var geometry;
  if (this.object instanceof AddedObject){
    geometry = this.object.getNormalGeometry();
    var color = this.object.material.color;
    for (var i = 0; i<geometry.faces.length; i++){
      geometry.faces[i].roygbivObjectName = this.object.name;
      if (this.object.hasEmissiveMap()){
        geometry.faces[i].faceEmissiveIntensity = this.object.mesh.material.uniforms.emissiveIntensity.value;
        geometry.faces[i].faceEmissiveColor = this.object.mesh.material.uniforms.emissiveColor.value;
      }else{
        geometry.faces[i].faceEmissiveIntensity = 0;
        geometry.faces[i].faceEmissiveColor = WHITE_COLOR;
      }
    }
    this.isAddedObject = true;
  }else if (this.object instanceof ObjectGroup){
    this.isAddedObject = false;
    geometry = new THREE.Geometry();
    var miMap = new Object();
    var mi = 0;
    for (var objectName in this.object.group){
      var childObj = this.object.group[objectName];
      miMap[mi] = childObj.name;
      var childGeom = childObj.getNormalGeometry();
      for (var i = 0; i<childGeom.faces.length; i++){
        var color = childObj.material.color;
        childGeom.faces[i].materialIndex = mi;
      }
      mi++;
      childObj.mesh.updateMatrix();
      geometry.merge(childGeom, childObj.mesh.matrix);
    }
    for (var i = 0; i<geometry.faces.length; i++){
      var mi = geometry.faces[i].materialIndex;
      var objName = miMap[mi];
      geometry.faces[i].roygbivObjectName = objName;
      var childObj = this.object.group[objName];
      if (childObj.hasEmissiveMap()){
        geometry.faces[i].faceEmissiveIntensity = childObj.mesh.material.uniforms.emissiveIntensity.value * this.object.mesh.material.uniforms.totalEmissiveIntensity.value;
        geometry.faces[i].faceEmissiveColor = childObj.mesh.material.uniforms.emissiveColor.value;
      }else{
        geometry.faces[i].faceEmissiveIntensity = 0;
        geometry.faces[i].faceEmissiveColor = WHITE_COLOR;
      }
    }
  }

  var texturesObject = new Object();
  this.diffuseTexture = this.object.mesh.material.uniforms.diffuseMap.value;
  this.displacementTexture = this.object.mesh.material.uniforms.displacementMap.value;
  this.alphaTexture = this.object.mesh.material.uniforms.alphaMap.value;
  this.emissiveTexture = this.object.mesh.material.uniforms.emissiveMap.value;
  this.diffuseTexture.updateMatrix();
  this.textureMatrix = this.diffuseTexture.matrix;

  var faces = geometry.faces;
  var vertices = geometry.vertices;
  var faceVertexUVs = geometry.faceVertexUvs;

  var geometry = new THREE.BufferGeometry();
  var positionsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var colorsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var emissiveIntensitiesTypedArray = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var emissiveColorsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var normalsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var coordIndicesTypedArray = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var quatIndicesTypedArray = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var faceVertexUVsTypedArray = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var textureFlagsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var displacementInfosTypedArray = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);

  var objPositions = [];
  var objNormals = [];
  var objUVs = [];
  var objColors = [];
  var objEmissiveIntensities = [];
  var objEmissiveColors = [];
  var objTextureFlags = [];
  var objDisplacementInfos = [];

  for (var i = 0; i < faces.length; i++){
    var face = faces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];

    objPositions.push(vertex1);
    objPositions.push(vertex2);
    objPositions.push(vertex3);

    var curFaceVertexUV = faceVertexUVs[0][i];
    var vUVary = [];

    for (var ix = 0; ix<3; ix++){
      var vuv = curFaceVertexUV[ix];
      vUVary.push(new THREE.Vector2(vuv.x, vuv.y));
    }

    objUVs.push(vUVary[0]);
    objUVs.push(vUVary[1]);
    objUVs.push(vUVary[2]);
    objNormals.push(face.normal);
    objNormals.push(face.normal);
    objNormals.push(face.normal);

    var objName = face.roygbivObjectName;
    var obj;
    if (this.isAddedObject){
      obj = addedObjects[objName];
    }else{
      obj = this.object.group[objName];
    }

    var displacementInfo = new THREE.Vector2(-100, -100);
    if (obj.hasDisplacementMap()){
      displacementInfo.x = obj.mesh.material.uniforms.displacementInfo.value.x;
      displacementInfo.y = obj.mesh.material.uniforms.displacementInfo.value.y;
    }
    objDisplacementInfos.push(displacementInfo);
    objDisplacementInfos.push(displacementInfo);
    objDisplacementInfos.push(displacementInfo);

    objColors.push(obj.material.color);
    objColors.push(obj.material.color);
    objColors.push(obj.material.color);

    objEmissiveIntensities.push(face.faceEmissiveIntensity);
    objEmissiveIntensities.push(face.faceEmissiveIntensity);
    objEmissiveIntensities.push(face.faceEmissiveIntensity);

    objEmissiveColors.push(face.faceEmissiveColor);
    objEmissiveColors.push(face.faceEmissiveColor);
    objEmissiveColors.push(face.faceEmissiveColor);

    var textureFlagsVec = new THREE.Vector3();
    if (obj.hasDiffuseMap()){
      textureFlagsVec.x = 20;
    }else{
      textureFlagsVec.x = -20;
    }
    if (obj.hasEmissiveMap()){
      textureFlagsVec.y = 20;
    }else{
      textureFlagsVec.y = -20;
    }
    if (obj.hasAlphaMap()){
      textureFlagsVec.z = 20;
    }else{
      textureFlagsVec.z = -20;
    }
    objTextureFlags.push(textureFlagsVec);
    objTextureFlags.push(textureFlagsVec);
    objTextureFlags.push(textureFlagsVec);

  }

  var i2 = 0;
  var i3 = 0;
  var i4 = 0;
  var i5 = 0;
  var i6 = 0;
  var i7 = 0;
  var i8 = 0;
  var i9 = 0;
  var i10 = 0;
  var i11 = 0;
  var i12 = 0;
  var i13 = 0;
  var i14 = 0;
  for (var i = 0; i<faces.length * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3 * 60; i++){
    positionsTypedArray[i2++] = objPositions[i3].x;
    positionsTypedArray[i2++] = objPositions[i3].y;
    positionsTypedArray[i2++] = objPositions[i3].z;
    colorsTypedArray[i9++] = objColors[i3].r;
    colorsTypedArray[i9++] = objColors[i3].g;
    colorsTypedArray[i9++] = objColors[i3].b;
    normalsTypedArray[i10++] = objNormals[i3].x;
    normalsTypedArray[i10++] = objNormals[i3].y;
    normalsTypedArray[i10++] = objNormals[i3].z;
    faceVertexUVsTypedArray[i7++] = objUVs[i8].x;
    faceVertexUVsTypedArray[i7++] = objUVs[i8].y;
    displacementInfosTypedArray[i13++] = objDisplacementInfos[i8].x;
    displacementInfosTypedArray[i13++] = objDisplacementInfos[i8].y;
    coordIndicesTypedArray[i] = i4;
    quatIndicesTypedArray[i] = i6;
    textureFlagsTypedArray[i12++] = objTextureFlags[i3].x;
    textureFlagsTypedArray[i12++] = objTextureFlags[i3].y;
    textureFlagsTypedArray[i12++] = objTextureFlags[i3].z;
    emissiveIntensitiesTypedArray[i] = objEmissiveIntensities[i11];
    emissiveColorsTypedArray[i14++] = objEmissiveColors[i3].r;
    emissiveColorsTypedArray[i14++] = objEmissiveColors[i3].g;
    emissiveColorsTypedArray[i14++] = objEmissiveColors[i3].b;
    i3++;
    if (i3 >= objPositions.length){
      i3 = 0;
    }
    i8++;
    if (i8 >= objUVs.length){
      i8 = 0;
    }
    i11++;
    if (i11 >= objEmissiveIntensities.length){
      i11 = 0;
    }
    i5 ++;
    if (i5 == objPositions.length){
      i4 += 3;
      i6 += 4;
      if (i4 >= 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3){
        i4 = 0;
      }
      if (i6 >= 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 4){
        i6 = 0;
      }
      i5 = 0;
    }
  }

  var positionBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
  var colorBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
  var emissiveIntensityBufferAttribute = new THREE.BufferAttribute(emissiveIntensitiesTypedArray, 1);
  var emissiveColorsBufferAttribute = new THREE.BufferAttribute(emissiveColorsTypedArray, 3);
  var normalBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
  var coordIndicesBufferAttribute = new THREE.BufferAttribute(coordIndicesTypedArray, 1);
  var quatIndicesBufferAttribute = new THREE.BufferAttribute(quatIndicesTypedArray, 1);
  var faceVertexUVsBufferAttribute = new THREE.BufferAttribute(faceVertexUVsTypedArray, 2);
  var textureFlagsBufferAttribute = new THREE.BufferAttribute(textureFlagsTypedArray, 3);
  var displacementInfosBufferAttribute = new THREE.BufferAttribute(displacementInfosTypedArray, 2);

  positionBufferAttribute.setDynamic(false);
  colorBufferAttribute.setDynamic(false);
  emissiveIntensityBufferAttribute.setDynamic(false);
  emissiveColorsBufferAttribute.setDynamic(false);
  normalBufferAttribute.setDynamic(false);
  coordIndicesBufferAttribute.setDynamic(false);
  quatIndicesBufferAttribute.setDynamic(false);
  faceVertexUVsBufferAttribute.setDynamic(false);
  textureFlagsBufferAttribute.setDynamic(false);
  displacementInfosBufferAttribute.setDynamic(false);

  geometry.addAttribute('position', positionBufferAttribute);
  geometry.addAttribute('color', colorBufferAttribute);
  geometry.addAttribute('emissiveIntensity', emissiveIntensityBufferAttribute);
  geometry.addAttribute('emissiveColor', emissiveColorsBufferAttribute);
  geometry.addAttribute('normal', normalBufferAttribute);
  geometry.addAttribute('coordIndex', coordIndicesBufferAttribute);
  geometry.addAttribute('quatIndex', quatIndicesBufferAttribute);
  geometry.addAttribute('faceVertexUV', faceVertexUVsBufferAttribute);
  geometry.addAttribute('textureFlags', textureFlagsBufferAttribute);
  geometry.addAttribute('displacementInfo', displacementInfosBufferAttribute);

  var objectCoordinateSize = parseInt(60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3);
  var objectQuaternionSize = parseInt(60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 4);

  var objectCoordinates = new Array(objectCoordinateSize);
  var objectQuaternions = new Array(objectQuaternionSize);
  var i2 = 0;
  var i3 = 0;

  var posit, quat;
  if (this.isAddedObject){
    posit = this.object.mesh.position;
    quat = this.object.mesh.quaternion;
  }else{
    posit = this.object.graphicsGroup.position;
    quat = this.object.graphicsGroup.quaternion;
  }

  this.mesh = new MeshGenerator(geometry).generateObjectTrail(
    this, objectCoordinateSize, objectQuaternionSize,
    posit, quat, objectCoordinates, objectQuaternions
  );

  this.mesh.frustumCulled = false;
  this.mesh.visible = false;
  scene.add(this.mesh);
  objectTrails[this.object.name] = this;

  this.objectCoordinateCounter = 0;
  this.objectQuaternionCounter = 0;

}

ObjectTrail.prototype.stop = function(){
  this.mesh.visible = false;
  delete activeObjectTrails[this.object.name];
}

ObjectTrail.prototype.start = function(){
  this.mesh.visible = true;
  activeObjectTrails[this.object.name] = this;
}

ObjectTrail.prototype.update = function(){
  var OBJECT_TRAIL_MAX_TIME_IN_SECS = this.OBJECT_TRAIL_MAX_TIME_IN_SECS;
  var posit, quat;
  if (this.isAddedObject){
    posit = this.object.mesh.position;
    quat = this.object.mesh.quaternion;
  }else{
    posit = this.object.mesh.position;
    quat = this.object.mesh.quaternion;
  }
  this.mesh.material.uniforms.objectCoordinates.value[this.objectCoordinateCounter++] = posit.x;
  this.mesh.material.uniforms.objectCoordinates.value[this.objectCoordinateCounter++] = posit.y;
  this.mesh.material.uniforms.objectCoordinates.value[this.objectCoordinateCounter++] = posit.z;
  this.mesh.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.x;
  this.mesh.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.y;
  this.mesh.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.z;
  this.mesh.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.w;
  this.mesh.material.uniforms.currentPosition.value = posit;
  this.mesh.material.uniforms.currentQuaternion.value = quat;
  if (this.objectCoordinateCounter >= 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3){
    this.objectCoordinateCounter = 0;
  }
  if (this.objectQuaternionCounter >= 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 4){
    this.objectQuaternionCounter = 0;
  }
}

ObjectTrail.prototype.destroy = function(){
  if (this.mesh){
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh = 0;
    this.destroyed = true;
  }
}
