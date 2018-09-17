var ObjectTrail = function(configurations){
  this.object = configurations.object;
  this.alpha = configurations.alpha;

  var OBJECT_TRAIL_MAX_TIME_IN_SECS = OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT;
  if (!(typeof configurations.maxTimeInSeconds == UNDEFINED)){
    OBJECT_TRAIL_MAX_TIME_IN_SECS = configurations.maxTimeInSeconds;
  }
  this.OBJECT_TRAIL_MAX_TIME_IN_SECS = OBJECT_TRAIL_MAX_TIME_IN_SECS;

  var hasDisplacement = false;

  var geometry;
  if (this.object instanceof AddedObject){
    geometry = this.object.getNormalGeometry();
    var color = this.object.material.color;
    for (var i = 0; i<geometry.faces.length; i++){
      geometry.faces[i].roygbivObjectName = this.object.name;
      geometry.faces[i].vertexColors.push(color, color, color);
      if (this.object.hasEmissiveMap()){
        geometry.faces[i].faceEmissiveIntensity = this.object.mesh.material.uniforms.emissiveIntensity.value;
      }else{
        geometry.faces[i].faceEmissiveIntensity = 0;
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
        childGeom.faces[i].vertexColors.push(color, color, color);
        childGeom.faces[i].materialIndex = mi;
      }
      mi++;
      childObj.previewMesh.updateMatrix();
      geometry.merge(childGeom, childObj.previewMesh.matrix);
    }
    for (var i = 0; i<geometry.faces.length; i++){
      var mi = geometry.faces[i].materialIndex;
      var objName = miMap[mi];
      geometry.faces[i].roygbivObjectName = objName;
      var childObj = this.object.group[objName];
      if (childObj.hasEmissiveMap()){
        geometry.faces[i].faceEmissiveIntensity = childObj.mesh.material.uniforms.emissiveIntensity.value;
      }else{
        geometry.faces[i].faceEmissiveIntensity = 0;
      }
    }
  }

  var texture = new THREE.Texture();
  var tmpObjectsHolder = new Object();
  if (this.isAddedObject){
    tmpObjectsHolder[this.object.name] = this.object;
  }else{
    for (var objName in this.object.group){
      tmpObjectsHolder[objName] = this.object.group[objName];
    }
  }
  var textureCount = 0;
  var texturesObject = new Object();
  for (var objName in tmpObjectsHolder){
    var tmpObj = tmpObjectsHolder[objName];
    if (tmpObj.hasDiffuseMap()){
      textureCount ++;
      texturesObject[objName+",diffuse"] = tmpObj.mesh.material.uniforms.diffuseMap.value;
    }
    if (tmpObj.hasEmissiveMap()){
      textureCount ++;
      if (tmpObj.hasDiffuseMap()){
        tmpObj.mesh.material.uniforms.emissiveMap.value.offset.copy(
          tmpObj.mesh.material.uniforms.diffuseMap.value.offset
        );
        tmpObj.mesh.material.uniforms.emissiveMap.value.updateMatrix();
      }
      texturesObject[objName+",emissive"] = tmpObj.mesh.material.uniforms.emissiveMap.value;
    }
    if (tmpObj.hasDisplacementMap()){
      hasDisplacement = true;
    }
    if (tmpObj.hasAlphaMap()){
      textureCount ++;
      if (tmpObj.hasDiffuseMap()){
        tmpObj.mesh.material.uniforms.alphaMap.value.offset.copy(
          tmpObj.mesh.material.uniforms.diffuseMap.value.offset
        );
        tmpObj.mesh.material.uniforms.alphaMap.value.updateMatrix();
      }
      texturesObject[objName+",alpha"] = tmpObj.mesh.material.uniforms.alphaMap.value;
    }
  }
  if (textureCount > 0){
    this.textureMerger = new TextureMerger(texturesObject);
    texture = this.textureMerger.mergedTexture;
  }

  var faces = geometry.faces;
  var vertices = geometry.vertices;
  var faceVertexUVs = geometry.faceVertexUvs;

  if (hasDisplacement){
    if (this.isAddedObject){
      this.displacedPositions = new DisplacementCalculator().getDisplacedPositions(this.object);
    }else{
        this.displacedPositions = new Object();
        this.displacedPositionCounters = new Object();
        for (var objName in this.object.group){
          var child = this.object.group[objName];
          if (!child.hasDisplacementMap()){
            continue;
          }
          child.previewMesh.updateMatrix();
          this.displacedPositions[objName] = new DisplacementCalculator().getDisplacedPositions(
            child, child.previewMesh.matrix
          );
          this.displacedPositionCounters[objName] = 0;
        }
    }
  }

  this.geometry = new THREE.BufferGeometry();
  this.positions = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.colors = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.emissiveIntensities = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.normals = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.coordIndices = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.quatIndices = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.faceVertexUVs = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.faceVertexUVsEmissive = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.faceVertexUVsAlpha = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  this.textureFlags = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);

  var objPositions = [];
  var objNormals = [];
  var objUVs = [];
  var objUVsEmissive = [];
  var objUVsAlpha = [];
  var objColors = [];
  var objEmissiveIntensities = [];
  var objTextureFlags = [];

  var iDisplaced = 0;

  for (var i = 0; i < faces.length; i++){
    var face = faces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];
    if (!hasDisplacement){
      objPositions.push(vertex1);
      objPositions.push(vertex2);
      objPositions.push(vertex3);
    }else{
      if (this.isAddedObject){
        objPositions.push(this.displacedPositions[iDisplaced ++]);
        objPositions.push(this.displacedPositions[iDisplaced ++]);
        objPositions.push(this.displacedPositions[iDisplaced ++]);
      }else{
        var childName = face.roygbivObjectName;
        var childObj = this.object.group[childName];
        if (childObj.hasDisplacementMap()){
          var displacedChldPositions = this.displacedPositions[childName];
          var iDisplacedCtr = this.displacedPositionCounters[childName];
          objPositions.push(displacedChldPositions[iDisplacedCtr ++]);
          objPositions.push(displacedChldPositions[iDisplacedCtr ++]);
          objPositions.push(displacedChldPositions[iDisplacedCtr ++]);
          this.displacedPositionCounters[childName] = iDisplacedCtr;
        }else{
          objPositions.push(vertex1);
          objPositions.push(vertex2);
          objPositions.push(vertex3);
        }
      }
    }
    var curFaceVertexUV = faceVertexUVs[0][i];
    var vUVary = [];
    var vUVary2 = [];
    var vUVary3 = [];
    var vUVary4 = [];
    var isTextured = false;
    if (this.textureMerger && !this.isAddedObject){
      var rangeDiffuse = this.textureMerger.ranges[face.roygbivObjectName+",diffuse"];
      var rangeEmissive = this.textureMerger.ranges[face.roygbivObjectName+",emissive"];
      var rangeAlpha = this.textureMerger.ranges[face.roygbivObjectName+",alpha"];
      for (var ix = 0; ix<3; ix++){
        var vuv = curFaceVertexUV[ix];
        vUVary.push(new THREE.Vector2(vuv.x, vuv.y));
        vUVary2.push(new THREE.Vector2(-20, -20));
        vUVary3.push(new THREE.Vector2(-20, -20));
        vUVary4.push(new THREE.Vector2(-20, -20));
        if (rangeDiffuse){
          isTextured = true;
          vUVary[ix].x = (vuv.x) / (1) * (rangeDiffuse.endU - rangeDiffuse.startU) + rangeDiffuse.startU;
          vUVary[ix].y = (vuv.y) / (1) * (rangeDiffuse.startV - rangeDiffuse.endV) + rangeDiffuse.endV;
        }
        if (rangeEmissive){
          isTextured = true;
          vUVary2[ix].x = (vuv.x) / (1) * (rangeEmissive.endU - rangeEmissive.startU) + rangeEmissive.startU;
          vUVary2[ix].y = (vuv.y) / (1) * (rangeEmissive.startV - rangeEmissive.endV) + rangeEmissive.endV;
        }
        if (rangeAlpha){
          isTextured = true;
          vUVary4[ix].x = (vuv.x) / (1) * (rangeAlpha.endU - rangeAlpha.startU) + rangeAlpha.startU;
          vUVary4[ix].y = (vuv.y) / (1) * (rangeAlpha.startV - rangeAlpha.endV) + rangeAlpha.endV;
        }
      }
    }else if (this.textureMerger && this.isAddedObject){
      var rangeDiffuse = this.textureMerger.ranges[face.roygbivObjectName+",diffuse"];
      var rangeEmissive = this.textureMerger.ranges[face.roygbivObjectName+",emissive"];
      var rangeAlpha = this.textureMerger.ranges[face.roygbivObjectName+",alpha"];
      for (var ix = 0; ix<3; ix++){
        var vuv = curFaceVertexUV[ix];
        vUVary.push(new THREE.Vector2(vuv.x, vuv.y));
        vUVary2.push(new THREE.Vector2(-20, -20));
        vUVary3.push(new THREE.Vector2(-20, -20));
        vUVary4.push(new THREE.Vector2(-20, -20));
        if (rangeDiffuse){
          isTextured = true;
          vUVary[ix].x = (vuv.x) / (1) * (rangeDiffuse.endU - rangeDiffuse.startU) + rangeDiffuse.startU;
          vUVary[ix].y = (vuv.y) / (1) * (rangeDiffuse.startV - rangeDiffuse.endV) + rangeDiffuse.endV;
        }
        if (rangeEmissive){
          isTextured = true;
          vUVary2[ix].x = (vuv.x) / (1) * (rangeEmissive.endU - rangeEmissive.startU) + rangeEmissive.startU;
          vUVary2[ix].y = (vuv.y) / (1) * (rangeEmissive.startV - rangeEmissive.endV) + rangeEmissive.endV;
        }
        if (rangeAlpha){
          isTextured = true;
          vUVary4[ix].x = (vuv.x) / (1) * (rangeAlpha.endU - rangeAlpha.startU) + rangeAlpha.startU;
          vUVary4[ix].y = (vuv.y) / (1) * (rangeAlpha.startV - rangeAlpha.endV) + rangeAlpha.endV;
        }
      }
    }else{
      for (var ix = 0; ix<3; ix++){
        var vuv = curFaceVertexUV[ix];
        vUVary.push(new THREE.Vector2(vuv.x, vuv.y));
        vUVary2.push(new THREE.Vector2(-20, -20));
        vUVary3.push(new THREE.Vector2(-20, -20));
        vUVary4.push(new THREE.Vector2(-20, -20));
      }
      if (this.isAddedObject){
        if (this.object.hasDiffuseMap()){
          isTextured = true;
        }else{
          if (this.object.hasEmissiveMap()){
            isTextured = true;
          }
        }
      }else{
        var obj = this.object.group[face.roygbivObjectName];
        if (obj.material.map){
          isTextured = true;
        }else{
          if (!(obj.hasBasicMaterial)){
            if (obj.material.emissiveMap){
              isTextured = true;
            }
          }
        }
      }
    }
    objUVs.push(vUVary[0]);
    objUVs.push(vUVary[1]);
    objUVs.push(vUVary[2]);
    objUVsEmissive.push(vUVary2[0]);
    objUVsEmissive.push(vUVary2[1]);
    objUVsEmissive.push(vUVary2[2]);
    objUVsAlpha.push(vUVary4[0]);
    objUVsAlpha.push(vUVary4[1]);
    objUVsAlpha.push(vUVary4[2]);
    objNormals.push(face.normal);
    objNormals.push(face.normal);
    objNormals.push(face.normal);

    var curVertexColors = face.vertexColors;
    objColors.push(curVertexColors[0]);
    objColors.push(curVertexColors[1]);
    objColors.push(curVertexColors[2]);

    objEmissiveIntensities.push(face.faceEmissiveIntensity);
    objEmissiveIntensities.push(face.faceEmissiveIntensity);
    objEmissiveIntensities.push(face.faceEmissiveIntensity);

    if (isTextured){
      objTextureFlags.push(20.0);
      objTextureFlags.push(20.0);
      objTextureFlags.push(20.0);
    }else{
      objTextureFlags.push(-20.0);
      objTextureFlags.push(-20.0);
      objTextureFlags.push(-20.0);
    }
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
  var i15 = 0;
  var i16 = 0;
  for (var i = 0; i<faces.length * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3 * 60; i++){
    this.positions[i2++] = objPositions[i3].x;
    this.positions[i2++] = objPositions[i3].y;
    this.positions[i2++] = objPositions[i3].z;
    this.colors[i9++] = objColors[i3].r;
    this.colors[i9++] = objColors[i3].g;
    this.colors[i9++] = objColors[i3].b;
    this.normals[i14++] = objNormals[i3].x;
    this.normals[i14++] = objNormals[i3].y;
    this.normals[i14++] = objNormals[i3].z;
    this.faceVertexUVs[i7++] = objUVs[i8].x;
    this.faceVertexUVs[i7++] = objUVs[i8].y;
    this.faceVertexUVsEmissive[i11++] = objUVsEmissive[i8].x;
    this.faceVertexUVsEmissive[i11++] = objUVsEmissive[i8].y;
    this.faceVertexUVsAlpha[i15++] = objUVsAlpha[i8].x;
    this.faceVertexUVsAlpha[i15++] = objUVsAlpha[i8].y;
    this.coordIndices[i] = i4;
    this.quatIndices[i] = i6;
    this.textureFlags[i] = objTextureFlags[i10];
    this.emissiveIntensities[i] = objEmissiveIntensities[i16];
    i3++;
    if (i3 >= objPositions.length){
      i3 = 0;
    }
    i8++;
    if (i8 >= objUVs.length){
      i8 = 0;
    }
    i10++;
    if (i10 >= objTextureFlags.length){
      i10 = 0;
    }
    i16++;
    if (i16 >= objEmissiveIntensities.length){
      i16 = 0;
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
      i5  = 0;
    }
  }

  this.positionBufferAttribute = new THREE.BufferAttribute(this.positions, 3);
  this.colorBufferAttribute = new THREE.BufferAttribute(this.colors, 3);
  this.emissiveIntensityBufferAttribute = new THREE.BufferAttribute(this.emissiveIntensities, 1);
  this.normalBufferAttribute = new THREE.BufferAttribute(this.normals, 3);
  this.coordIndicesBufferAttribute = new THREE.BufferAttribute(this.coordIndices, 1);
  this.quatIndicesBufferAttribute = new THREE.BufferAttribute(this.quatIndices, 1);
  this.faceVertexUVsBufferAttribute = new THREE.BufferAttribute(this.faceVertexUVs, 2);
  this.faceVertexUVsEmissiveBufferAttribute = new THREE.BufferAttribute(this.faceVertexUVsEmissive, 2);
  this.faceVertexUVsAlphaBufferAttribute = new THREE.BufferAttribute(this.faceVertexUVsAlpha, 2);
  this.textureFlagsBufferAttribute = new THREE.BufferAttribute(this.textureFlags, 1);

  this.positionBufferAttribute.setDynamic(false);
  this.colorBufferAttribute.setDynamic(false);
  this.emissiveIntensityBufferAttribute.setDynamic(false);
  this.normalBufferAttribute.setDynamic(false);
  this.coordIndicesBufferAttribute.setDynamic(false);
  this.quatIndicesBufferAttribute.setDynamic(false);
  this.faceVertexUVsBufferAttribute.setDynamic(false);
  this.faceVertexUVsEmissiveBufferAttribute.setDynamic(false);
  this.faceVertexUVsAlphaBufferAttribute.setDynamic(false);
  this.textureFlagsBufferAttribute.setDynamic(false);

  this.geometry.addAttribute('position', this.positionBufferAttribute);
  this.geometry.addAttribute('color', this.colorBufferAttribute);
  this.geometry.addAttribute('emissiveIntensity', this.emissiveIntensityBufferAttribute);
  this.geometry.addAttribute('normal', this.normalBufferAttribute);
  this.geometry.addAttribute('coordIndex', this.coordIndicesBufferAttribute);
  this.geometry.addAttribute('quatIndex', this.quatIndicesBufferAttribute);
  this.geometry.addAttribute('faceVertexUV', this.faceVertexUVsBufferAttribute);
  this.geometry.addAttribute('faceVertexUVEmissive', this.faceVertexUVsEmissiveBufferAttribute);
  this.geometry.addAttribute('faceVertexUVAlpha', this.faceVertexUVsAlphaBufferAttribute);
  this.geometry.addAttribute('textureFlag', this.textureFlagsBufferAttribute);

  var objectCoordinateSize = parseInt(60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3);
  var objectQuaternionSize = parseInt(60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 4);

  var objectCoordinates = new Array(objectCoordinateSize);
  var objectQuaternions = new Array(objectQuaternionSize);
  var i2 = 0;
  var i3 = 0;

  var posit, quat;
  if (this.isAddedObject){
    posit = this.object.previewMesh.position;
    quat = this.object.previewMesh.quaternion;
  }else{
    posit = this.object.previewGraphicsGroup.position;
    quat = this.object.previewGraphicsGroup.quaternion;
  }

  var r = 1, g = 1, b = 1;
  if (this.isAddedObject){
    r = this.object.material.color.r;
    g = this.object.material.color.g;
    b = this.object.material.color.b;
  }

  var fogInfo;
  if (fogActive){
    fogInfo = new THREE.Vector4(fogDensity, fogColorRGB.r, fogColorRGB.g, fogColorRGB.b);
  }else{
    fogInfo = new THREE.Vector4(-100.0, 0, 0, 0);
  }

  var vertexShaderCode = ShaderContent.objectTrailVertexShader.replace(
    "#define OBJECT_COORDINATE_SIZE 1", "#define OBJECT_COORDINATE_SIZE "+objectCoordinateSize
  ).replace(
    "#define OBJECT_QUATERNION_SIZE 1", "#define OBJECT_QUATERNION_SIZE "+objectQuaternionSize
  );

  this.material = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderCode,
    fragmentShader: ShaderContent.objectTrailFragmentShader,
    transparent: true,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: new THREE.Uniform(new THREE.Matrix4()),
      viewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      objectCoordinates: new THREE.Uniform(objectCoordinates),
      objectQuaternions: new THREE.Uniform(objectQuaternions),
      currentPosition: new THREE.Uniform(posit),
      currentQuaternion: new THREE.Uniform(quat),
      alpha: new THREE.Uniform(this.alpha),
      texture: new THREE.Uniform(texture),
      fogInfo: new THREE.Uniform(fogInfo)
    }
  });

  if (this.object.hasWireframeMaterial){
    this.mesh = new THREE.Line(this.geometry, this.material);
  }else{
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  this.mesh.frustumCulled = false;
  this.mesh.visible = false;
  previewScene.add(this.mesh);
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
  this.material.uniforms.viewMatrix.value = camera.matrixWorldInverse;
  this.material.uniforms.projectionMatrix.value = camera.projectionMatrix;
  var posit, quat;
  if (this.isAddedObject){
    posit = this.object.previewMesh.position;
    quat = this.object.previewMesh.quaternion;
  }else{
    posit = this.object.previewMesh.position;
    quat = this.object.previewMesh.quaternion;
  }
  this.material.uniforms.objectCoordinates.value[this.objectCoordinateCounter++] = posit.x;
  this.material.uniforms.objectCoordinates.value[this.objectCoordinateCounter++] = posit.y;
  this.material.uniforms.objectCoordinates.value[this.objectCoordinateCounter++] = posit.z;
  this.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.x;
  this.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.y;
  this.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.z;
  this.material.uniforms.objectQuaternions.value[this.objectQuaternionCounter++] = quat.w;
  this.material.uniforms.currentPosition.value = posit;
  this.material.uniforms.currentQuaternion.value = quat;
  if (this.objectCoordinateCounter >= 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3){
    this.objectCoordinateCounter = 0;
  }
  if (this.objectQuaternionCounter >= 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS * 4){
    this.objectQuaternionCounter = 0;
  }
}

ObjectTrail.prototype.destroy = function(){
  if (this.mesh){
    previewScene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh = 0;
    this.destroyed = true;
  }
}
