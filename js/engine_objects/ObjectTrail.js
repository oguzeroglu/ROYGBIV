var ObjectTrail = function(configurations){
  this.object = configurations.object;
  this.alpha = configurations.alpha;

  var OBJECT_TRAIL_MAX_TIME_IN_SECS = OBJECT_TRAIL_MAX_TIME_IN_SECS_DEFAULT;
  if (!(typeof configurations.maxTimeInSeconds == UNDEFINED)){
    OBJECT_TRAIL_MAX_TIME_IN_SECS = configurations.maxTimeInSeconds;
  }
  this.OBJECT_TRAIL_MAX_TIME_IN_SECS = OBJECT_TRAIL_MAX_TIME_IN_SECS;

  var geometry;
  if (this.object.isAddedObject){
    geometry = this.object.getNormalGeometry();
    var color = this.object.material.color;
    for (var i = 0; i<geometry.faces.length; i++){
      geometry.faces[i].roygbivObjectName = this.object.name;
      if (this.object.hasEmissiveMap()){
        geometry.faces[i].faceEmissiveIntensity = this.object.getEmissiveIntensity();
        geometry.faces[i].faceEmissiveColor = this.object.getEmissiveColor().clone();
      }else{
        geometry.faces[i].faceEmissiveIntensity = 0;
        geometry.faces[i].faceEmissiveColor = WHITE_COLOR;
      }
    }
    this.isAddedObject = true;
  }else if (this.object.isObjectGroup){
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
        geometry.faces[i].faceEmissiveIntensity = childObj.getEmissiveIntensity() * this.object.getEmissiveIntensity();
        geometry.faces[i].faceEmissiveColor = childObj.getEmissiveColor().clone();
      }else{
        geometry.faces[i].faceEmissiveIntensity = 0;
        geometry.faces[i].faceEmissiveColor = WHITE_COLOR;
      }
    }
  }

  var texturesObject = new Object();
  var faces = geometry.faces;
  var vertices = geometry.vertices;
  var faceVertexUVs = geometry.faceVertexUvs;

  var geometry = new THREE.BufferGeometry();
  var positionsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var colorsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var coordIndicesTypedArray = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var quatIndicesTypedArray = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var normalsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  var emissiveIntensitiesTypedArray;
  var emissiveColorsTypedArray;
  var displacementInfosTypedArray;
  var faceVertexUVsTypedArray;
  var textureFlagsTypedArray;
  var objPositions = [];
  var objColors = [];
  var objNormals = [];
  var objUVs;
  var objDiffuseUVs, objEmissiveUVs, objAlphaUVs, objDisplacementUVs;
  var diffuseUVsTypedArray, emissiveUVsTypedArray, alphaUVsTypedArray, displacementUVsTypedArray;
  var customDisplacementTextureInfosTypedArray;
  var customDisplacementTextureInfos;
  var objEmissiveIntensities;
  var objEmissiveColors;
  var objTextureFlags;
  var objDisplacementInfos;
  if (this.object.hasEmissiveMap()){
    objEmissiveIntensities = [];
    objEmissiveColors = [];
    objEmissiveUVs = [];
    emissiveIntensitiesTypedArray = new Float32Array(faces.length * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
    emissiveColorsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
    emissiveUVsTypedArray = new Float32Array(faces.length * 3 * 4 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  }
  if (this.object.hasDisplacementMap()){
    objDisplacementInfos = [];
    objDisplacementUVs = [];
    customDisplacementTextureInfos = [];
    displacementInfosTypedArray = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
    displacementUVsTypedArray = new Float32Array(faces.length * 3 * 4 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
    customDisplacementTextureInfosTypedArray = new Float32Array(faces.length * 3 * 4 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  }
  if (this.object.hasAlphaMap()){
    objAlphaUVs = [];
    alphaUVsTypedArray = new Float32Array(faces.length * 3 * 4 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  }
  if (this.object.hasDiffuseMap()){
    objDiffuseUVs = [];
    diffuseUVsTypedArray = new Float32Array(faces.length * 3 * 4 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  }
  if (this.hasTexture()){
    objUVs = [];
    objTextureFlags = [];
    objTextureMatrixInfos = [];
    faceVertexUVsTypedArray = new Float32Array(faces.length * 3 * 2 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
    textureFlagsTypedArray = new Float32Array(faces.length * 3 * 3 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
    textureMatrixInfosTypedArray = new Float32Array(faces.length * 3 * 4 * 60 * OBJECT_TRAIL_MAX_TIME_IN_SECS);
  }

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

    objNormals.push(face.normal);
    objNormals.push(face.normal);
    objNormals.push(face.normal);

    var curFaceVertexUV = faceVertexUVs[0][i];
    var vUVary;
    if (this.hasTexture()){
      vUVary = [];
      for (var ix = 0; ix<3; ix++){
        var vuv = curFaceVertexUV[ix];
        vUVary.push(new THREE.Vector2(vuv.x, vuv.y));
      }
      objUVs.push(vUVary[0]);
      objUVs.push(vUVary[1]);
      objUVs.push(vUVary[2]);
    }


    var objName = face.roygbivObjectName;
    var obj;
    if (this.isAddedObject){
      obj = addedObjects[objName];
    }else{
      obj = this.object.group[objName];
    }

    if (this.hasTexture()){
      objTextureMatrixInfos.push(new THREE.Vector4(
        obj.getTextureOffsetX(), obj.getTextureOffsetY(), obj.getTextureRepeatX(), obj.getTextureRepeatY()
      ));
    }

    if (this.object.hasDisplacementMap()){
      var displacementInfo = new THREE.Vector2(-100, -100);
      var displacementRange = new THREE.Vector4(0, 0, 0, 0);
      if (obj.hasDisplacementMap()){
        displacementInfo.x = obj.getDisplacementScale();
        displacementInfo.y = obj.getDisplacementBias();
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.height.texturePack, "height");
        displacementRange.set(ranges.startU, ranges.startV, ranges.endU, ranges.endV);
        if (!(typeof obj.parentObjectName == UNDEFINED)){
          var parentObject = objectGroups[obj.parentObjectName];
          displacementInfo.x *= parentObject.getDisplacementScale();
          displacementInfo.y *= parentObject.getDisplacementBias();
        }
      }
      objDisplacementInfos.push(displacementInfo);
      objDisplacementInfos.push(displacementInfo);
      objDisplacementInfos.push(displacementInfo);
      objDisplacementUVs.push(displacementRange);
      objDisplacementUVs.push(displacementRange);
      objDisplacementUVs.push(displacementRange);

      if (obj.customDisplacementTextureMatrixInfo){
        var info = obj.customDisplacementTextureMatrixInfo;
        customDisplacementTextureInfos.push(new THREE.Vector4(info.offsetX, info.offsetY, info.repeatU, info.repeatV));
        customDisplacementTextureInfos.push(new THREE.Vector4(info.offsetX, info.offsetY, info.repeatU, info.repeatV));
        customDisplacementTextureInfos.push(new THREE.Vector4(info.offsetX, info.offsetY, info.repeatU, info.repeatV));
      }else{
        customDisplacementTextureInfos.push(new THREE.Vector4(-100, -100, -100, -100));
        customDisplacementTextureInfos.push(new THREE.Vector4(-100, -100, -100, -100));
        customDisplacementTextureInfos.push(new THREE.Vector4(-100, -100, -100, -100));
      }
    }

    objColors.push(obj.material.color);
    objColors.push(obj.material.color);
    objColors.push(obj.material.color);

    if (this.object.hasEmissiveMap()){
      if (obj.hasEmissiveMap()){
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.emissive.texturePack, "emissive");
        objEmissiveUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
        objEmissiveUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
        objEmissiveUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
      }else{
        objEmissiveUVs.push(new THREE.Vector4(0, 0, 0, 0));
        objEmissiveUVs.push(new THREE.Vector4(0, 0, 0, 0));
        objEmissiveUVs.push(new THREE.Vector4(0, 0, 0, 0));
      }
      objEmissiveIntensities.push(face.faceEmissiveIntensity);
      objEmissiveIntensities.push(face.faceEmissiveIntensity);
      objEmissiveIntensities.push(face.faceEmissiveIntensity);
      objEmissiveColors.push(face.faceEmissiveColor);
      objEmissiveColors.push(face.faceEmissiveColor);
      objEmissiveColors.push(face.faceEmissiveColor);
    }

    if (this.object.hasDiffuseMap()){
      if (obj.hasDiffuseMap()){
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.diffuse.texturePack, "diffuse");
        objDiffuseUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
        objDiffuseUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
        objDiffuseUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
      }else{
        objDiffuseUVs.push(new THREE.Vector4(0, 0, 0, 0));
        objDiffuseUVs.push(new THREE.Vector4(0, 0, 0, 0));
        objDiffuseUVs.push(new THREE.Vector4(0, 0, 0, 0));
      }
    }

    if (this.object.hasAlphaMap()){
      if (obj.hasAlphaMap()){
        var ranges = textureAtlasHandler.getRangesForTexturePack(obj.tpInfo.alpha.texturePack, "alpha");
        objAlphaUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
        objAlphaUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
        objAlphaUVs.push(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
      }else{
        objAlphaUVs.push(new THREE.Vector4(0, 0, 0, 0));
        objAlphaUVs.push(new THREE.Vector4(0, 0, 0, 0));
        objAlphaUVs.push(new THREE.Vector4(0, 0, 0, 0));
      }
    }

    if (this.hasTexture()){
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
  var i17 = 0;
  var i18 = 0;
  var i19 = 0;
  var i20 = 0;
  var i21 = 0;
  for (var i = 0; i<faces.length * OBJECT_TRAIL_MAX_TIME_IN_SECS * 3 * 60; i++){
    positionsTypedArray[i2++] = objPositions[i3].x;
    positionsTypedArray[i2++] = objPositions[i3].y;
    positionsTypedArray[i2++] = objPositions[i3].z;
    normalsTypedArray[i10++] = objNormals[i3].x;
    normalsTypedArray[i10++] = objNormals[i3].y;
    normalsTypedArray[i10++] = objNormals[i3].z;
    colorsTypedArray[i9++] = objColors[i3].r;
    colorsTypedArray[i9++] = objColors[i3].g;
    colorsTypedArray[i9++] = objColors[i3].b;
    coordIndicesTypedArray[i] = i4;
    quatIndicesTypedArray[i] = i6;
    if (this.object.hasDisplacementMap()){
      displacementInfosTypedArray[i13++] = objDisplacementInfos[i8].x;
      displacementInfosTypedArray[i13++] = objDisplacementInfos[i8].y;
      displacementUVsTypedArray[i17++] = objDisplacementUVs[i8].x;
      displacementUVsTypedArray[i17++] = objDisplacementUVs[i8].y;
      displacementUVsTypedArray[i17++] = objDisplacementUVs[i8].z;
      displacementUVsTypedArray[i17++] = objDisplacementUVs[i8].w;
      customDisplacementTextureInfosTypedArray[i21++] = customDisplacementTextureInfos[i8].x;
      customDisplacementTextureInfosTypedArray[i21++] = customDisplacementTextureInfos[i8].y;
      customDisplacementTextureInfosTypedArray[i21++] = customDisplacementTextureInfos[i8].z;
      customDisplacementTextureInfosTypedArray[i21++] = customDisplacementTextureInfos[i8].w;
    }
    if (this.hasTexture()){
      faceVertexUVsTypedArray[i7++] = objUVs[i8].x;
      faceVertexUVsTypedArray[i7++] = objUVs[i8].y;
      textureFlagsTypedArray[i12++] = objTextureFlags[i3].x;
      textureFlagsTypedArray[i12++] = objTextureFlags[i3].y;
      textureFlagsTypedArray[i12++] = objTextureFlags[i3].z;
      textureMatrixInfosTypedArray[i15++] = objTextureMatrixInfos[i16].x;
      textureMatrixInfosTypedArray[i15++] = objTextureMatrixInfos[i16].y;
      textureMatrixInfosTypedArray[i15++] = objTextureMatrixInfos[i16].z;
      textureMatrixInfosTypedArray[i15++] = objTextureMatrixInfos[i16].w;
    }
    if (this.object.hasEmissiveMap()){
      emissiveIntensitiesTypedArray[i] = objEmissiveIntensities[i11];
      emissiveColorsTypedArray[i14++] = objEmissiveColors[i3].r;
      emissiveColorsTypedArray[i14++] = objEmissiveColors[i3].g;
      emissiveColorsTypedArray[i14++] = objEmissiveColors[i3].b;
      emissiveUVsTypedArray[i18++] = objEmissiveUVs[i3].x;
      emissiveUVsTypedArray[i18++] = objEmissiveUVs[i3].y;
      emissiveUVsTypedArray[i18++] = objEmissiveUVs[i3].z;
      emissiveUVsTypedArray[i18++] = objEmissiveUVs[i3].w;
    }
    if (this.object.hasDiffuseMap()){
      diffuseUVsTypedArray[i19++] = objDiffuseUVs[i3].x;
      diffuseUVsTypedArray[i19++] = objDiffuseUVs[i3].y;
      diffuseUVsTypedArray[i19++] = objDiffuseUVs[i3].z;
      diffuseUVsTypedArray[i19++] = objDiffuseUVs[i3].w;
    }
    if (this.object.hasAlphaMap()){
      alphaUVsTypedArray[i20++] = objAlphaUVs[i3].x;
      alphaUVsTypedArray[i20++] = objAlphaUVs[i3].y;
      alphaUVsTypedArray[i20++] = objAlphaUVs[i3].z;
      alphaUVsTypedArray[i20++] = objAlphaUVs[i3].w;
    }
    i3++;
    if (i3 >= objPositions.length){
      i3 = 0;
    }
    if (this.hasTexture()){
      i8++;
      if (i8 >= objUVs.length){
        i8 = 0;
      }
    }
    if (this.object.hasEmissiveMap()){
      i11++;
      if (i11 >= objEmissiveIntensities.length){
        i11 = 0;
      }
    }
    if (this.hasTexture()){
      i16++;
      if (i16 >= objTextureMatrixInfos.length){
        i16 = 0;
      }
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
  var normalBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
  var colorBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
  var coordIndicesBufferAttribute = new THREE.BufferAttribute(coordIndicesTypedArray, 1);
  var quatIndicesBufferAttribute = new THREE.BufferAttribute(quatIndicesTypedArray, 1);
  var emissiveIntensityBufferAttribute;
  var emissiveColorsBufferAttribute;
  var faceVertexUVsBufferAttribute;
  var textureFlagsBufferAttribute;
  var displacementInfosBufferAttribute;
  var textureMatrixInfosBufferAttribute;
  var diffuseUVsBufferAttribute, emissiveUVsBufferAttribute, alphaUVsBufferAttribute, displacementUVsBufferAttribute;
  var customDisplacementInfosBufferAttribute;

  if (this.object.hasEmissiveMap()){
    emissiveIntensityBufferAttribute = new THREE.BufferAttribute(emissiveIntensitiesTypedArray, 1);
    emissiveColorsBufferAttribute = new THREE.BufferAttribute(emissiveColorsTypedArray, 3);
    emissiveUVsBufferAttribute = new THREE.BufferAttribute(emissiveUVsTypedArray, 4);
    emissiveIntensityBufferAttribute.setDynamic(false);
    emissiveColorsBufferAttribute.setDynamic(false);
    emissiveUVsBufferAttribute.setDynamic(false);
    geometry.addAttribute('emissiveIntensity', emissiveIntensityBufferAttribute);
    geometry.addAttribute('emissiveColor', emissiveColorsBufferAttribute);
    geometry.addAttribute("emissiveUVs", emissiveUVsBufferAttribute);
  }
  if (this.object.hasDisplacementMap()){
    displacementInfosBufferAttribute = new THREE.BufferAttribute(displacementInfosTypedArray, 2);
    displacementUVsBufferAttribute = new THREE.BufferAttribute(displacementUVsTypedArray, 4);
    customDisplacementInfosBufferAttribute = new THREE.BufferAttribute(customDisplacementTextureInfosTypedArray, 4);
    displacementInfosBufferAttribute.setDynamic(false);
    displacementUVsBufferAttribute.setDynamic(false);
    customDisplacementInfosBufferAttribute.setDynamic(false);
    geometry.addAttribute('displacementInfo', displacementInfosBufferAttribute);
    geometry.addAttribute("displacementUVs", displacementUVsBufferAttribute);
    geometry.addAttribute('customDisplacementInfo', customDisplacementInfosBufferAttribute);
  }
  if (this.hasTexture()){
    faceVertexUVsBufferAttribute = new THREE.BufferAttribute(faceVertexUVsTypedArray, 2);
    textureFlagsBufferAttribute = new THREE.BufferAttribute(textureFlagsTypedArray, 3);
    textureMatrixInfosBufferAttribute = new THREE.BufferAttribute(textureMatrixInfosTypedArray, 4);
    faceVertexUVsBufferAttribute.setDynamic(false);
    textureFlagsBufferAttribute.setDynamic(false);
    textureMatrixInfosBufferAttribute.setDynamic(false);
    geometry.addAttribute('faceVertexUV', faceVertexUVsBufferAttribute);
    geometry.addAttribute('textureFlags', textureFlagsBufferAttribute);
    geometry.addAttribute('textureMatrixInfo', textureMatrixInfosBufferAttribute);
  }
  if (this.object.hasDiffuseMap()){
    diffuseUVsBufferAttribute = new THREE.BufferAttribute(diffuseUVsTypedArray, 4);
    diffuseUVsBufferAttribute.setDynamic(false);
    geometry.addAttribute("diffuseUVs", diffuseUVsBufferAttribute);
  }
  if (this.object.hasAlphaMap()){
    alphaUVsBufferAttribute = new THREE.BufferAttribute(alphaUVsTypedArray, 4);
    alphaUVsBufferAttribute.setDynamic(false);
    geometry.addAttribute("alphaUVs", alphaUVsBufferAttribute);
  }

  positionBufferAttribute.setDynamic(false);
  normalBufferAttribute.setDynamic(false);
  colorBufferAttribute.setDynamic(false);
  coordIndicesBufferAttribute.setDynamic(false);
  quatIndicesBufferAttribute.setDynamic(false);

  geometry.addAttribute('position', positionBufferAttribute);
  geometry.addAttribute('normal', normalBufferAttribute);
  geometry.addAttribute('color', colorBufferAttribute);
  geometry.addAttribute('coordIndex', coordIndicesBufferAttribute);
  geometry.addAttribute('quatIndex', quatIndicesBufferAttribute);

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

  this.compressGeometry();

  if (this.hasTexture()){
    macroHandler.injectMacro("TEXTURE_SIZE " + ACCEPTED_TEXTURE_SIZE, this.mesh.material, true, true);
  }

  if (this.hasTexture() && this.object.isAddedObject){
    if (this.object.hasDiffuseMap()){
      var ranges = textureAtlasHandler.getRangesForTexturePack(this.object.tpInfo.diffuse.texturePack, "diffuse");
      macroHandler.injectMacro("DIFFUSE_START_U " + ranges.startU, this.mesh.material, true, false);
      macroHandler.injectMacro("DIFFUSE_END_U " + ranges.endU, this.mesh.material, true, false);
      macroHandler.injectMacro("DIFFUSE_START_V " + ranges.startV, this.mesh.material, true, false);
      macroHandler.injectMacro("DIFFUSE_END_V " + ranges.endV, this.mesh.material, true, false);
    }
    if (this.object.hasEmissiveMap()){
      var ranges = textureAtlasHandler.getRangesForTexturePack(this.object.tpInfo.emissive.texturePack, "emissive");
      macroHandler.injectMacro("EMISSIVE_START_U " + ranges.startU, this.mesh.material, true, false);
      macroHandler.injectMacro("EMISSIVE_END_U " + ranges.endU, this.mesh.material, true, false);
      macroHandler.injectMacro("EMISSIVE_START_V " + ranges.startV, this.mesh.material, true, false);
      macroHandler.injectMacro("EMISSIVE_END_V " + ranges.endV, this.mesh.material, true, false);
    }
    if (this.object.hasAlphaMap()){
      var ranges = textureAtlasHandler.getRangesForTexturePack(this.object.tpInfo.alpha.texturePack, "alpha");
      macroHandler.injectMacro("ALPHA_START_U " + ranges.startU, this.mesh.material, true, false);
      macroHandler.injectMacro("ALPHA_END_U " + ranges.endU, this.mesh.material, true, false);
      macroHandler.injectMacro("ALPHA_START_V " + ranges.startV, this.mesh.material, true, false);
      macroHandler.injectMacro("ALPHA_END_V " + ranges.endV, this.mesh.material, true, false);
    }
    if (this.object.hasDisplacementMap()){
       var ranges = textureAtlasHandler.getRangesForTexturePack(this.object.tpInfo.height.texturePack, "height");
       macroHandler.injectMacro("DISPLACEMENT_START_U " + ranges.startU, this.mesh.material, true, false);
       macroHandler.injectMacro("DISPLACEMENT_END_U " + ranges.endU, this.mesh.material, true, false);
       macroHandler.injectMacro("DISPLACEMENT_START_V " + ranges.startV, this.mesh.material, true, false);
       macroHandler.injectMacro("DISPLACEMENT_END_V " + ranges.endV, this.mesh.material, true, false);
    }
  }

  this.handleLighting();

  this.mesh.frustumCulled = false;
  this.mesh.visible = false;
  scene.add(this.mesh);
  objectTrails[this.object.name] = this;

  this.objectCoordinateCounter = 0;
  this.objectQuaternionCounter = 0;

  webglCallbackHandler.registerEngineObject(this);
}

ObjectTrail.prototype.hasTexture = function(){
  if (this.object.isAddedObject){
    return this.object.hasTexture();
  }
  return this.object.hasTexture;
}

ObjectTrail.prototype.handleLighting = function(){
  if (this.object.affectedByLight){
    lightHandler.addLightToObject(this);
    macroHandler.injectMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);
    this.mesh.material.uniforms.dynamicLightsMatrix = lightHandler.getUniform();
    this.mesh.material.needsUpdate = true;
  }
}

ObjectTrail.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.worldMatrix;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}

ObjectTrail.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
      this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

ObjectTrail.prototype.stop = function(){
  this.mesh.visible = false;
  activeObjectTrails.delete(this.object.name);
}

ObjectTrail.prototype.start = function(){
  this.mesh.visible = true;
  activeObjectTrails.set(this.object.name, this);
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

ObjectTrail.prototype.compressGeometry = function(){
  var compressableAttributes = [
    "emissiveIntensity", "emissiveColor", "emissiveUVs",
    "color", "displacementInfo", "displacementUVs",
    "diffuseUVs", "emissiveUVs", "alphaUVs", "textureFlags",
    "textureMatrixInfo", "customDisplacementInfo"
  ];

  macroHandler.compressAttributes(this.mesh, compressableAttributes);
}
