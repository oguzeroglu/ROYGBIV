var ObjectGroup = function(name, group){
  this.isObjectGroup = true;
  this.name = name;
  this.group = group;
  objectSelectedByCommand = false;

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.gridSystemNames = [];

  this.childObjectsByName = new Object();

  this.totalVertexCount = 0;
  this.skippedVertexCount = 0;

  this.isTransparent = false;
  for (var objName in this.group){
    var obj = this.group[objName];
    var isObjTransparent = (obj.mesh.material.uniforms.alpha.value < 1);
    if (isObjTransparent){
      this.isTransparent = true;
      break;
    }
  }

}

ObjectGroup.prototype.forceColor = function(r, g, b, a){
  if (a < 0){
    a = 0;
  }
  if (a > 1){
    a = 1;
  }
  this.mesh.material.uniforms.forcedColor.value.set(a, r, g, b);
  if (a < 1){
    this.mesh.material.transparent = true;
  }
}

ObjectGroup.prototype.resetColor = function(){
  this.mesh.material.uniforms.forcedColor.value.set(-50, 0, 0, 0);
  this.mesh.material.transparent = this.isTransparent;
}

ObjectGroup.prototype.applyAreaConfiguration = function(areaName){
  if (this.areaVisibilityConfigurations){
    var configurations = this.areaVisibilityConfigurations[areaName];
    if (!(typeof configurations == UNDEFINED)){
      this.mesh.visible = configurations;
    }else{
      this.mesh.visible = true;
    }
  }
  if (this.areaSideConfigurations){
    var configurations = this.areaSideConfigurations[areaName];
    if (!(typeof configurations == UNDEFINED)){
      if (configurations == SIDE_BOTH){
        this.mesh.material.side = THREE.DoubleSide;
      }else if (configurations == SIDE_FRONT){
        this.mesh.material.side = THREE.FrontSide;
      }else if (configurations == SIDE_BACK){
        this.mesh.material.side = THREE.BackSide;
      }
    }else{
      if (this.defaultSide){
        if (this.defaultSide == SIDE_BOTH){
          this.mesh.material.side = THREE.DoubleSide;
        }else if (this.defaultSide == SIDE_FRONT){
          this.mesh.material.side = THREE.FrontSide;
        }else if (this.defaultSide == SIDE_BACK){
          this.mesh.material.side = THREE.BackSide;
        }
      }else{
        this.mesh.material.side = THREE.DoubleSide;
      }
    }
  }
}

ObjectGroup.prototype.getSideInArea = function(areaName){
  if (this.areaSideConfigurations){
    if (!(typeof this.areaSideConfigurations[areaName] == UNDEFINED)){
      return this.areaSideConfigurations[areaName];
    }
  }
  if (this.defaultSide){
    return this.defaultSide;
  }
  return SIDE_BOTH;
}

ObjectGroup.prototype.setSideInArea = function(areaName, side){
  if (!this.areaSideConfigurations){
    this.areaSideConfigurations = new Object();
  }
  this.areaSideConfigurations[areaName] = side;
}

ObjectGroup.prototype.getVisibilityInArea = function(areaName){
  if (this.areaVisibilityConfigurations){
    if (!(typeof this.areaVisibilityConfigurations[areaName] == UNDEFINED)){
      return this.areaVisibilityConfigurations[areaName];
    }
  }
  return true;
}

ObjectGroup.prototype.setVisibilityInArea = function(areaName, isVisible){
  if (!this.areaVisibilityConfigurations){
    this.areaVisibilityConfigurations = new Object();
  }
  this.areaVisibilityConfigurations[areaName] = isVisible;
}

ObjectGroup.prototype.loadState = function(){
  this.physicsBody.position.set(
    this.state.physicsPX, this.state.physicsPY, this.state.physicsPZ
  );
  this.physicsBody.quaternion.set(
    this.state.physicsQX, this.state.physicsQY, this.state.physicsQZ, this.state.physicsQW
  );
  this.physicsBody.angularVelocity.set(
    this.state.physicsAVX, this.state.physicsAVY, this.state.physicsAVZ
  );
  this.physicsBody.velocity.set(
    this.state.physicsVX, this.state.physicsVY, this.state.physicsVZ
  );
  this.mesh.position.set(
    this.state.positionX, this.state.positionY, this.state.positionZ
  );
  this.mesh.quaternion.set(
    this.state.quaternionX, this.state.quaternionY, this.state.quaternionZ, this.state.quaternionW
  );
  if (this.pivotObject){
    delete this.pivotObject;
    delete this.pivotOffsetX;
    delete this.pivotOffsetY;
    delete this.pivotOffsetZ;
  }
  if (this.originalPivotObject){
    this.pivotObject = this.originalPivotObject;
    this.pivotOffsetX = this.originalPivotOffsetX;
    this.pivotOffsetY = this.originalPivotOffsetY;
    this.pivotOffsetZ = this.originalPivotOffsetZ;
  }
}

ObjectGroup.prototype.saveState = function(){
  this.state = new Object();
  this.state.physicsPX = this.physicsBody.position.x;
  this.state.physicsPY = this.physicsBody.position.y;
  this.state.physicsPZ = this.physicsBody.position.z;
  this.state.physicsQX = this.physicsBody.quaternion.x;
  this.state.physicsQY = this.physicsBody.quaternion.y;
  this.state.physicsQZ = this.physicsBody.quaternion.z;
  this.state.physicsQW = this.physicsBody.quaternion.w;
  this.state.physicsAVX = this.physicsBody.angularVelocity.x;
  this.state.physicsAVY = this.physicsBody.angularVelocity.y;
  this.state.physicsAVZ = this.physicsBody.angularVelocity.z;
  this.state.physicsVX = this.physicsBody.velocity.x;
  this.state.physicsVY = this.physicsBody.velocity.y;
  this.state.physicsVZ = this.physicsBody.velocity.z;
  this.state.positionX = this.mesh.position.x;
  this.state.positionY = this.mesh.position.y;
  this.state.positionZ = this.mesh.position.z;
  this.state.quaternionX = this.mesh.quaternion.x;
  this.state.quaternionY = this.mesh.quaternion.y;
  this.state.quaternionZ = this.mesh.quaternion.z;
  this.state.quaternionW = this.mesh.quaternion.w;
  if (this.pivotObject){
    this.originalPivotObject = this.pivotObject;
    this.originalPivotOffsetX = this.pivotOffsetX;
    this.originalPivotOffsetY = this.pivotOffsetY;
    this.originalPivotOffsetZ = this.pivotOffsetZ;
  }
}

ObjectGroup.prototype.areGeometriesIdentical = function(){
  var uuid = 0;
  for (var objName in this.group){
    var obj = this.group[objName];
    if (!uuid){
      uuid = this.group[objName].mesh.geometry.uuid;
    }else{
      if (uuid != this.group[objName].mesh.geometry.uuid){
        return false;
      }
    }
  }
  return true;
}

ObjectGroup.prototype.handleRenderSide = function(val){
  this.renderSide = val;
  if (val == 0){
    this.mesh.material.side = THREE.DoubleSide;
    this.defaultSide = SIDE_BOTH;
  }else if (val == 1){
    this.mesh.material.side = THREE.FrontSide;
    this.defaultSide = SIDE_FRONT;
  }else if (val == 2){
    this.mesh.material.side = THREE.BackSide;
    this.defaultSide = SIDE_BACK;
  }
}

ObjectGroup.prototype.textureCompare = function(txt1, txt2){
  if (txt1.roygbivTextureName != txt2.roygbivTextureName){
    return false;
  }
  if (txt1.roygbivTexturePackName != txt2.roygbivTexturePackName){
    return false;
  }
  if (txt1.offset.x != txt2.offset.x || txt1.offset.y != txt2.offset.y){
    return false;
  }
  if (txt1.repeat.x != txt2.repeat.x || txt1.repeat.y != txt2.repeat.y){
    return false;
  }
  if (txt1.flipX != txt2.flipX || txt1.flipY != txt2.flipY){
    return false;
  }
  if (txt1.wrapS != txt2.wrapS || txt1.wrapT != txt2.wrapT){
    return false;
  }
  return true;
}

ObjectGroup.prototype.handleTextures = function(){
  this.diffuseTexture = 0;
  this.emissiveTexture = 0;
  this.alphaTexture = 0;
  this.aoTexture = 0;
  this.textureMatrix = 0;
  var totalTextureCount = 0;
  for (var objName in this.group){
    var obj = this.group[objName];
    if (obj.hasDiffuseMap()){
      var txt = obj.mesh.material.uniforms.diffuseMap.value;
      if (!this.diffuseTexture){
        this.diffuseTexture = txt;
        this.textureMatrix = txt.matrix;
      }else{
        if (!this.textureCompare(this.diffuseTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
    if (obj.hasEmissiveMap()){
      var txt = obj.mesh.material.uniforms.emissiveMap.value;
      if (!this.emissiveTexture){
        this.emissiveTexture = txt;
        if (!this.textureMatrix){
          this.textureMatrix = txt.matrix;
        }
      }else{
        if (!this.textureCompare(this.emissiveTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
    if (obj.hasAlphaMap()){
      var txt = obj.mesh.material.uniforms.alphaMap.value;
      if (!this.alphaTexture){
        this.alphaTexture = txt;
        if (!this.textureMatrix){
          this.textureMatrix = txt.matrix;
        }
      }else{
        if (!this.textureCompare(this.alphaTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
    if (obj.hasAOMap()){
      var txt = obj.mesh.material.uniforms.aoMap.value;
      if (!this.aoTexture){
        this.aoTexture = txt;
        if (!this.textureMatrix){
          this.textureMatrix = txt.matrix;
        }
      }else{
        if (!this.textureCompare(this.aoTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
    if (obj.hasDisplacementMap()){
      var txt = obj.mesh.material.uniforms.displacementMap.value;
      if (!this.displacementTexture){
        this.displacementTexture = txt;
        if (!this.textureMatrix){
          this.textureMatrix = txt.matrix;
        }
      }else{
        if (!this.textureCompare(this.displacementTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
  }
}

ObjectGroup.prototype.push = function(array, value, index, isIndexed){
  if (!isIndexed){
    array.push(value);
  }else{
    array[index] = value;
  }
}

ObjectGroup.prototype.mergeInstanced = function(){
  this.isInstanced = true;
  var refGeometry;
  for (var objName in this.group){
    refGeometry = this.group[objName].mesh.geometry;
    break;
  }
  this.geometry = new THREE.InstancedBufferGeometry();

  this.geometry.setIndex(refGeometry.index);

  var positionOffsets = [], quaternions = [], alphas = [], colors = [], textureInfos = [],
      emissiveIntensities = [], emissiveColors = [], aoIntensities = [], displacementInfos = [];
  var count = 0;
  for (var objName in this.group){
    var obj = this.group[objName];
    positionOffsets.push(obj.mesh.position.x);
    positionOffsets.push(obj.mesh.position.y);
    positionOffsets.push(obj.mesh.position.z);
    quaternions.push(obj.mesh.quaternion.x);
    quaternions.push(obj.mesh.quaternion.y);
    quaternions.push(obj.mesh.quaternion.z);
    quaternions.push(obj.mesh.quaternion.w);
    alphas.push(obj.mesh.material.uniforms.alpha.value);
    colors.push(obj.material.color.r);
    colors.push(obj.material.color.g);
    colors.push(obj.material.color.b);
    emissiveIntensities.push(obj.mesh.material.uniforms.emissiveIntensity.value);
    emissiveColors.push(obj.mesh.material.uniforms.emissiveColor.value.r);
    emissiveColors.push(obj.mesh.material.uniforms.emissiveColor.value.g);
    emissiveColors.push(obj.mesh.material.uniforms.emissiveColor.value.b);
    aoIntensities.push(obj.mesh.material.uniforms.aoIntensity.value);
    if (obj.hasDiffuseMap()){
      textureInfos.push(10);
    }else{
      textureInfos.push(-10);
    }
    if (obj.hasEmissiveMap()){
      textureInfos.push(10);
    }else{
      textureInfos.push(-10);
    }
    if (obj.hasAlphaMap()){
      textureInfos.push(10);
    }else{
      textureInfos.push(-10);
    }
    if (obj.hasAOMap()){
      textureInfos.push(10);
    }else{
      textureInfos.push(-10);
    }
    if (obj.hasDisplacementMap()){
      displacementInfos.push(obj.mesh.material.uniforms.displacementInfo.value.x);
      displacementInfos.push(obj.mesh.material.uniforms.displacementInfo.value.y);
    }else{
      displacementInfos.push(-100);
      displacementInfos.push(-100);
    }
    count ++;
  }

  this.geometry.maxInstancedCount = count;

  var positionOffsetBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(positionOffsets), 3
  );
  var quaternionsBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(quaternions), 4
  );
  var alphaBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(alphas), 1
  );
  var colorBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(colors) , 3
  );
  var textureInfoBufferAttribute = new THREE.InstancedBufferAttribute(
    new Int16Array(textureInfos), 4
  );
  var emissiveIntensityBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(emissiveIntensities), 1
  );
  var emissiveColorBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(emissiveColors), 3
  );
  var aoIntensityBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(aoIntensities), 1
  );
  var displacementInfoBufferAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(displacementInfos), 2
  );

  positionOffsetBufferAttribute.setDynamic(false);
  quaternionsBufferAttribute.setDynamic(false);
  alphaBufferAttribute.setDynamic(false);
  colorBufferAttribute.setDynamic(false);
  textureInfoBufferAttribute.setDynamic(false);
  emissiveIntensityBufferAttribute.setDynamic(false);
  emissiveColorBufferAttribute.setDynamic(false);
  aoIntensityBufferAttribute.setDynamic(false);
  displacementInfoBufferAttribute.setDynamic(false);

  this.geometry.addAttribute("positionOffset", positionOffsetBufferAttribute);
  this.geometry.addAttribute("quaternion", quaternionsBufferAttribute);
  this.geometry.addAttribute("alpha", alphaBufferAttribute);
  this.geometry.addAttribute("color", colorBufferAttribute);
  this.geometry.addAttribute("textureInfo", textureInfoBufferAttribute);
  this.geometry.addAttribute("emissiveIntensity", emissiveIntensityBufferAttribute);
  this.geometry.addAttribute("emissiveColor", emissiveColorBufferAttribute);
  this.geometry.addAttribute("aoIntensity", aoIntensityBufferAttribute);
  this.geometry.addAttribute("displacementInfo", displacementInfoBufferAttribute);
  this.geometry.addAttribute("position", refGeometry.attributes.position);
  this.geometry.addAttribute("normal", refGeometry.attributes.normal);
  this.geometry.addAttribute("uv", refGeometry.attributes.uv);

}

ObjectGroup.prototype.merge = function(){

  this.handleTextures();

  if (this.areGeometriesIdentical()){
    this.mergeInstanced();
    return;
  }

  this.geometry = new THREE.BufferGeometry();
  var pseudoGeometry = new THREE.Geometry();

  var isIndexed = true;

  var miMap = new Object();
  var mi = 0;
  for (var childName in this.group){
    var childObj = this.group[childName];
    if (childObj.type == "box" || childObj.type == "sphere" || childObj.type == "cylinder"){
      isIndexed = false;
    }
    var childGeom = childObj.getNormalGeometry();
    miMap[mi] = childObj.name;
    for (var i = 0; i<childGeom.faces.length; i++){
      childGeom.faces[i].materialIndex = mi;
    }
    mi++;
    childObj.mesh.updateMatrix();
    pseudoGeometry.merge(childGeom, childObj.mesh.matrix);
  }

  this.isIndexed = isIndexed;

  var max = 0;
  var indexCache;
  var faces = pseudoGeometry.faces;
  var indexCache;
  if (isIndexed){
    indexCache = new Object();
    for (var i = 0; i<faces.length; i++){
      var face = faces[i];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      if (a > max){
        max = a;
      }
      if (b > max){
        max = b;
      }
      if (c > max){
        max = c;
      }
    }
  }

  var indices = [];
  var vertices = pseudoGeometry.vertices;
  var faceVertexUVs = pseudoGeometry.faceVertexUvs[0];
  var positions, normals, colors, uvs, alphas, emissiveIntensities, emissiveColors, aoIntensities,
            displacementInfos, textureInfos;
  if (max > 0){
    positions = new Array((max + 1) * 3);
    normals = new Array((max + 1) * 3);
    colors = new Array((max + 1) * 3);
    uvs = new Array((max + 1) * 2);
    alphas = new Array(max + 1);
    emissiveIntensities = new Array(max + 1);
    emissiveColors = new Array((max + 1) * 3);
    aoIntensities = new Array(max + 1);
    displacementInfos = new Array((max + 1) * 2);
    textureInfos = new Array((max + 1) * 4);
  }else{
    positions = [];
    normals = [];
    colors = [];
    uvs = [];
    alphas = [];
    emissiveIntensities = [];
    emissiveColors = [];
    aoIntensities = [];
    displacementInfos = [];
    textureInfos = [];
  }
  for (var i = 0; i<faces.length; i++){
    var face = faces[i];
    var addedObject = addedObjects[miMap[face.materialIndex]];
    var a = face.a;
    var b = face.b;
    var c = face.c;

    var aSkipped = false;
    var bSkipped = false;
    var cSkipped = false;
    if (isIndexed){
      indices.push(a);
      indices.push(b);
      indices.push(c);
      if (indexCache[a]){
        aSkipped = true;
        this.skippedVertexCount ++;
      }else{
        indexCache[a] = true;
      }
      if (indexCache[b]){
        bSkipped = true;
        this.skippedVertexCount ++;
      }else{
        indexCache[b] = true;
      }
      if (indexCache[c]){
        cSkipped = true;
        this.skippedVertexCount ++;
      }else{
        indexCache[c] = true;
      }
    }

    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];
    var vertexNormals = face.vertexNormals;
    var vertexNormal1 = vertexNormals[0];
    var vertexNormal2 = vertexNormals[1];
    var vertexNormal3 = vertexNormals[2];
    var color = addedObject.material.color;
    var uv1 = faceVertexUVs[i][0];
    var uv2 = faceVertexUVs[i][1];
    var uv3 = faceVertexUVs[i][2];
    // POSITIONS
    if (!aSkipped){
      this.push(positions, vertex1.x, (3*a), isIndexed);
      this.push(positions, vertex1.y, ((3*a) + 1), isIndexed);
      this.push(positions, vertex1.z, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(positions, vertex2.x, (3*b), isIndexed);
      this.push(positions, vertex2.y, ((3*b) + 1), isIndexed);
      this.push(positions, vertex2.z, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(positions, vertex3.x, (3*c), isIndexed);
      this.push(positions, vertex3.y, ((3*c) + 1), isIndexed);
      this.push(positions, vertex3.z, ((3*c) + 2), isIndexed);
    }
    if (!aSkipped){
      this.push(normals, vertexNormal1.x, (3*a), isIndexed);
      this.push(normals, vertexNormal1.y, ((3*a) + 1), isIndexed);
      this.push(normals, vertexNormal1.z, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(normals, vertexNormal2.x, (3*b), isIndexed);
      this.push(normals, vertexNormal2.y, ((3*b) + 1), isIndexed);
      this.push(normals, vertexNormal2.z, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(normals, vertexNormal3.x, (3*c), isIndexed);
      this.push(normals, vertexNormal3.y, ((3*c) + 1), isIndexed);
      this.push(normals, vertexNormal3.z, ((3*c) + 2), isIndexed);
    }
    // COLORS
    if (!aSkipped){
      this.push(colors, color.r, (3*a), isIndexed);
      this.push(colors, color.g, ((3*a) + 1), isIndexed);
      this.push(colors, color.b, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(colors, color.r, (3*b), isIndexed);
      this.push(colors, color.g, ((3*b) + 1), isIndexed);
      this.push(colors, color.b, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(colors, color.r, (3*c), isIndexed);
      this.push(colors, color.g, ((3*c) + 1), isIndexed);
      this.push(colors, color.b, ((3*c) + 2), isIndexed);
    }
    // UV
    if (!aSkipped){
      this.push(uvs, uv1.x, (2*a), isIndexed);
      this.push(uvs, uv1.y, ((2*a) + 1), isIndexed);
    }
    if (!bSkipped){
      this.push(uvs, uv2.x, (2*b), isIndexed);
      this.push(uvs, uv2.y, ((2*b) + 1), isIndexed);
    }
    if (!cSkipped){
      this.push(uvs, uv3.x, (2*c), isIndexed);
      this.push(uvs, uv3.y, ((2*c) + 1), isIndexed);
    }
    // DISPLACEMENT INFOS
    if (!aSkipped){
      if (addedObject.hasDisplacementMap()){
        this.push(
          displacementInfos,
          addedObject.mesh.material.uniforms.displacementInfo.value.x,
          (2*a),
          isIndexed
        );
        this.push(
          displacementInfos,
          addedObject.mesh.material.uniforms.displacementInfo.value.y,
          ((2*a) + 1),
          isIndexed
        );
      }else{
        this.push(displacementInfos, -100, (2*a), isIndexed);
        this.push(displacementInfos, -100, ((2*a) + 1), isIndexed);
      }
    }
    if (!bSkipped){
      if (addedObject.hasDisplacementMap()){
        this.push(
          displacementInfos,
          addedObject.mesh.material.uniforms.displacementInfo.value.x,
          (2*b),
          isIndexed
        );
        this.push(
          displacementInfos,
          addedObject.mesh.material.uniforms.displacementInfo.value.y,
          ((2*b) + 1),
          isIndexed
        );
      }else{
        this.push(displacementInfos, -100, (2*b), isIndexed);
        this.push(displacementInfos, -100, ((2*b) + 1), isIndexed);
      }
    }
    if (!cSkipped){
      if (addedObject.hasDisplacementMap()){
        this.push(
          displacementInfos,
          addedObject.mesh.material.uniforms.displacementInfo.value.x,
          (2*c),
          isIndexed
        );
        this.push(
          displacementInfos,
          addedObject.mesh.material.uniforms.displacementInfo.value.y,
          ((2*c) + 1),
          isIndexed
        );
      }else{
        this.push(displacementInfos, -100, (2*c), isIndexed);
        this.push(displacementInfos, -100, ((2*c) + 1), isIndexed);
      }
    }
    // ALPHA
    var alpha = addedObject.mesh.material.uniforms.alpha.value;
    if (!aSkipped){
      this.push(alphas, alpha, a, isIndexed);
    }
    if (!bSkipped){
      this.push(alphas, alpha, b, isIndexed);
    }
    if (!cSkipped){
      this.push(alphas, alpha, c, isIndexed);
    }
    // EMISSIVE INTENSITY
    var emissiveIntensity = addedObject.mesh.material.uniforms.emissiveIntensity.value;
    if (!aSkipped){
      this.push(emissiveIntensities, emissiveIntensity, a, isIndexed);
    }
    if (!bSkipped){
      this.push(emissiveIntensities, emissiveIntensity, b, isIndexed);
    }
    if (!cSkipped){
      this.push(emissiveIntensities, emissiveIntensity, c, isIndexed);
    }
    // EMISSIVE COLOR
    var emissiveColor = addedObject.mesh.material.uniforms.emissiveColor.value;
    if (!aSkipped){
      this.push(emissiveColors, emissiveColor.r, (3*a), isIndexed);
      this.push(emissiveColors, emissiveColor.g, ((3*a) + 1), isIndexed);
      this.push(emissiveColors, emissiveColor.b, ((3*a) + 2), isIndexed);
    }
    if (!bSkipped){
      this.push(emissiveColors, emissiveColor.r, (3*b), isIndexed);
      this.push(emissiveColors, emissiveColor.g, ((3*b) + 1), isIndexed);
      this.push(emissiveColors, emissiveColor.b, ((3*b) + 2), isIndexed);
    }
    if (!cSkipped){
      this.push(emissiveColors, emissiveColor.r, (3*c), isIndexed);
      this.push(emissiveColors, emissiveColor.g, ((3*c) + 1), isIndexed);
      this.push(emissiveColors, emissiveColor.b, ((3*c) + 2), isIndexed);
    }
    // AO INTENSITY
    var aoIntensity = addedObject.mesh.material.uniforms.aoIntensity.value;
    if (!aSkipped){
      this.push(aoIntensities, aoIntensity, a, isIndexed);
    }
    if (!bSkipped){
      this.push(aoIntensities, aoIntensity, b, isIndexed);
    }
    if (!cSkipped){
      this.push(aoIntensities, aoIntensity, c, isIndexed);
    }
    // TEXTURE INFOS
    if (!aSkipped){
      if (addedObject.hasDiffuseMap()){
        this.push(textureInfos, 10, (4*a), isIndexed);
      }else{
        this.push(textureInfos, -10, (4*a), isIndexed);
      }
      if (addedObject.hasEmissiveMap()){
        this.push(textureInfos, 10, ((4*a) + 1), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*a) + 1), isIndexed);
      }
      if (addedObject.hasAlphaMap()){
        this.push(textureInfos, 10, ((4*a) + 2), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*a) + 2), isIndexed);
      }
      if (addedObject.hasAOMap()){
        this.push(textureInfos, 10, ((4*a) + 3), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*a) + 3), isIndexed);
      }
    }
    if (!bSkipped){
      if (addedObject.hasDiffuseMap()){
        this.push(textureInfos, 10, (4*b), isIndexed);
      }else{
        this.push(textureInfos, -10, (4*b), isIndexed);
      }
      if (addedObject.hasEmissiveMap()){
        this.push(textureInfos, 10, ((4*b) + 1), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*b) + 1), isIndexed);
      }
      if (addedObject.hasAlphaMap()){
        this.push(textureInfos, 10, ((4*b) + 2), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*b) + 2), isIndexed);
      }
      if (addedObject.hasAOMap()){
        this.push(textureInfos, 10, ((4*b) + 3), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*b) + 3), isIndexed);
      }
    }
    if (!cSkipped){
      if (addedObject.hasDiffuseMap()){
        this.push(textureInfos, 10, (4*c), isIndexed);
      }else{
        this.push(textureInfos, -10, (4*c), isIndexed);
      }
      if (addedObject.hasEmissiveMap()){
        this.push(textureInfos, 10, ((4*c) + 1), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*c) + 1), isIndexed);
      }
      if (addedObject.hasAlphaMap()){
        this.push(textureInfos, 10, ((4*c) + 2), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*c) + 2), isIndexed);
      }
      if (addedObject.hasAOMap()){
        this.push(textureInfos, 10, ((4*c) + 3), isIndexed);
      }else{
        this.push(textureInfos, -10, ((4*c) + 3), isIndexed);
      }
    }
  }

  var positionsTypedArray = new Float32Array(positions);
  var normalsTypedArray = new Float32Array(normals);
  var colorsTypedArray = new Float32Array(colors);
  var uvsTypedArray = new Float32Array(uvs);
  var displacementInfosTypedArray = new Float32Array(displacementInfos);
  var alphasTypedArray = new Float32Array(alphas);
  var emissiveIntensitiesTypedArray = new Float32Array(emissiveIntensities);
  var emissiveColorsTypedArray = new Float32Array(emissiveColors);
  var aoIntensitiesTypedArray = new Float32Array(aoIntensities);
  var textureInfosTypedArray = new Int8Array(textureInfos);

  var positionsBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
  var normalsBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
  var colorsBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
  var uvsBufferAttribute = new THREE.BufferAttribute(uvsTypedArray, 2);
  var displacementInfosBufferAttribute = new THREE.BufferAttribute(displacementInfosTypedArray, 2);
  var alphasBufferAttribute = new THREE.BufferAttribute(alphasTypedArray, 1);
  var emissiveIntensitiesBufferAttribute = new THREE.BufferAttribute(emissiveIntensitiesTypedArray, 1);
  var emissiveColorsBufferAttribute = new THREE.BufferAttribute(emissiveColorsTypedArray, 3);
  var aoIntensitiesBufferAttribute = new THREE.BufferAttribute(aoIntensitiesTypedArray, 1);
  var textureInfosBufferAttribute = new THREE.BufferAttribute(textureInfosTypedArray, 4);

  positionsBufferAttribute.setDynamic(false);
  normalsBufferAttribute.setDynamic(false);
  colorsBufferAttribute.setDynamic(false);
  uvsBufferAttribute.setDynamic(false);
  displacementInfosBufferAttribute.setDynamic(false);
  alphasBufferAttribute.setDynamic(false);
  emissiveIntensitiesBufferAttribute.setDynamic(false);
  emissiveColorsBufferAttribute.setDynamic(false);
  aoIntensitiesBufferAttribute.setDynamic(false);
  textureInfosBufferAttribute.setDynamic(false);

  if (isIndexed){
    var indicesTypedArray = new Uint16Array(indices);
    var indicesBufferAttribute = new THREE.BufferAttribute(indicesTypedArray, 1);
    indicesBufferAttribute.setDynamic(false);
    this.geometry.setIndex(indicesBufferAttribute);
  }

  this.geometry.addAttribute('position', positionsBufferAttribute);
  this.geometry.addAttribute('normal', normalsBufferAttribute);
  this.geometry.addAttribute('color', colorsBufferAttribute);
  this.geometry.addAttribute('uv', uvsBufferAttribute);
  this.geometry.addAttribute('displacementInfo', displacementInfosBufferAttribute);
  this.geometry.addAttribute('alpha', alphasBufferAttribute);
  this.geometry.addAttribute('emissiveIntensity', emissiveIntensitiesBufferAttribute);
  this.geometry.addAttribute('emissiveColor', emissiveColorsBufferAttribute);
  this.geometry.addAttribute('aoIntensity', aoIntensitiesBufferAttribute);
  this.geometry.addAttribute('textureInfo', textureInfosBufferAttribute);

  pseudoGeometry = null;

}

ObjectGroup.prototype.glue = function(){
  var group = this.group;
  var physicsMaterial = new CANNON.Material();
  var physicsBody = new CANNON.Body({mass: 0, material: physicsMaterial});
  var centerPosition = this.getInitialCenter();
  var graphicsGroup = new THREE.Group();
  var centerX = centerPosition.x;
  var centerY = centerPosition.y;
  var centerZ = centerPosition.z;
  var referenceVector = new CANNON.Vec3(
    centerX, centerY, centerZ
  );
  var referenceVectorTHREE = new THREE.Vector3(
    centerX, centerY, centerZ
  );

  physicsBody.position = referenceVector;
  graphicsGroup.position.copy(physicsBody.position);

  var gridSystemNamesMap = new Object();

  var hasAnyPhysicsShape = false;
  for (var objectName in group){
    var addedObject = group[objectName];
    if (selectedAddedObject && selectedAddedObject.name == objectName){
      selectedAddedObject = 0;
    }
    addedObject.setAttachedProperties();

    this.totalVertexCount += addedObject.mesh.geometry.attributes.position.count;
    // GLUE PHYSICS ************************************************
    if (!addedObject.noMass){
      var shape = addedObject.physicsBody.shapes[0];
      physicsBody.addShape(shape, addedObject.physicsBody.position.vsub(referenceVector), addedObject.physicsBody.quaternion);
      hasAnyPhysicsShape = true;
    }
    // GLUE GRAPHICS ***********************************************
    addedObject.mesh.position.sub(referenceVectorTHREE);
    graphicsGroup.add(addedObject.mesh);
    // PREPARE GRAPHICS FOR CLICK EVENTS ***************************
    addedObject.mesh.addedObject = 0;
    addedObject.mesh.objectGroupName = this.name;
    // TO MANAGE CLICK EVENTS
    if (addedObject.destroyedGrids){
      for (var gridName in addedObject.destroyedGrids){
        addedObject.destroyedGrids[gridName].destroyedObjectGroup = this.name;
      }
    }
    // THESE ARE USEFUL FOR SCRIPTING
    addedObject.parentObjectName = this.name;
    this.childObjectsByName[addedObject.name] = addedObject;
    // THESE ARE NECESSARY FOR BVHANDLER
    gridSystemNamesMap[addedObject.metaData.gridSystemName] = true;
    addedObjectsInsideGroups[addedObject.name] = addedObject;
    addedObject.indexInParent = graphicsGroup.children.length - 1;

  }

  this.gridSystemNames = Object.keys(gridSystemNamesMap);

  physicsBody.addedObject = this;

  this.merge();
  this.destroyParts();
  var meshGenerator = new MeshGenerator(this.geometry);
  if (!this.isInstanced){
    this.mesh = meshGenerator.generateMergedMesh(graphicsGroup, this);
  }else{
    this.mesh = meshGenerator.generateInstancedMesh(graphicsGroup, this);
    this.mesh.frustumCulled = false;
  }

  this.mesh.objectGroupName = this.name;
  scene.add(this.mesh);
  if (hasAnyPhysicsShape){
    physicsWorld.addBody(physicsBody);
  }else{
    this.noMass = true;
    this.cannotSetMass = true;
  }

  this.graphicsGroup = graphicsGroup;

  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrix();

  this.physicsBody = physicsBody;
  this.initQuaternion = this.graphicsGroup.quaternion.clone();

  this.collisionCallbackFunction = function(collisionEvent){
    if (!collisionEvent.body.addedObject || (!this.isVisibleOnThePreviewScene() && !this.physicsKeptWhenHidden)){
      return;
    }
    if (isPhysicsWorkerEnabled()){
      // WE WILL HANDLE PHYSICS CALCULATIONS INSIDE THE WORKER
      return;
    }
    var targetObjectName = collisionEvent.target.addedObject.name;
    var contact = collisionEvent.contact;
    var collisionPosition = new Object();
    var collisionImpact = contact.getImpactVelocityAlongNormal();
    collisionPosition.x = contact.bi.position.x + contact.ri.x;
    collisionPosition.y = contact.bi.position.y + contact.ri.y;
    collisionPosition.z = contact.bi.position.z + contact.ri.z;
    var quatX = this.mesh.quaternion.x;
    var quatY = this.mesh.quaternion.y;
    var quatZ = this.mesh.quaternion.z;
    var quatW = this.mesh.quaternion.w;
    var collisionInfo = reusableCollisionInfo.set(
      targetObjectName,
      collisionPosition.x,
      collisionPosition.y,
      collisionPosition.z,
      collisionImpact,
      quatX,
      quatY,
      quatZ,
      quatW
    );
    var curCollisionCallbackRequest = collisionCallbackRequests[this.name];
    if (curCollisionCallbackRequest){
      curCollisionCallbackRequest(collisionInfo);
    }
  };

  this.physicsBody.addEventListener(
    "collide",
    this.collisionCallbackFunction.bind(this)
  );

  this.gridSystemName = this.group[Object.keys(this.group)[0]].metaData.gridSystemName;
}

ObjectGroup.prototype.destroyParts = function(){
  for (var objName in this.group){
    var addedObject = addedObjects[objName];
    if (addedObject){
      addedObject.destroy();
      delete addedObjects[objName];
      disabledObjectNames[objName] = 1;
    }
  }
}

ObjectGroup.prototype.detach = function(){
  if (selectedObjectGroup && selectedObjectGroup.name == this.name){
    selectedObjectGroup = 0;
  }
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  var worldQuaternions = new Object();
  var worldPositions = new Object();
  var previewSceneWorldPositions = new Object();
  var previewSceneWorldQuaternions = new Object();
  var physicsQuaternions = new Object();
  for (var objectName in this.group){
    if (mode == 0){
      worldQuaternions[objectName] = this.group[objectName].mesh.getWorldQuaternion(REUSABLE_QUATERNION);
      worldQuaternions[objectName] = REUSABLE_QUATERNION.clone();
      this.group[objectName].mesh.getWorldPosition(REUSABLE_VECTOR);
      worldPositions[objectName] = REUSABLE_VECTOR.clone();
    }else if (mode == 1){
      this.group[objectName].mesh.getWorldQuaternion(REUSABLE_QUATERNION);
      worldQuaternions[objectName] = REUSABLE_QUATERNION.clone();
      this.group[objectName].mesh.getWorldPosition(REUSABLE_VECTOR);
      worldPositions[objectName] = REUSABLE_VECTOR.clone();
    }
    if (this.physicsBody.initQuaternion instanceof THREE.Quaternion){
      this.physicsBody.initQuaternion = new CANNON.Quaternion().copy(this.physicsBody.initQuaternion);
    }
    if (this.physicsBody.initQuaternion.x == 0 && this.physicsBody.initQuaternion.y == 0 &&
              this.physicsBody.initQuaternion.z == 0 && this.physicsBody.initQuaternion.w == 1){
        if (this.group[objectName].type != "ramp"){
          physicsQuaternions[objectName] = this.group[objectName].physicsBody.initQuaternion;
        }else{
          physicsQuaternions[objectName] = this.physicsBody.initQuaternion;
        }
    }else{
      if (this.group[objectName].type != "ramp"){
        var cloneQuaternion = new CANNON.Quaternion().copy(this.physicsBody.initQuaternion);
        physicsQuaternions[objectName] = cloneQuaternion.mult(this.group[objectName].physicsBody.initQuaternion);
      }else{
        physicsQuaternions[objectName] = this.physicsBody.initQuaternion;
      }
    }
  }
  for (var i = this.graphicsGroup.children.length -1; i>=0; i--){
    this.graphicsGroup.remove(this.graphicsGroup.children[i]);
  }

  this.destroy(true);
  for (var objectName in this.group){
    var addedObject = this.group[objectName];

    if (!addedObject.noMass){
      physicsWorld.add(addedObject.physicsBody);
    }
    scene.add(addedObject.mesh);

    addedObject.mesh.objectGroupName = 0;
    addedObject.mesh.addedObject = addedObject;

    addedObjects[objectName] = addedObject;

    if (addedObject.destroyedGrids){
      for (var gridName in addedObject.destroyedGrids){
        addedObject.destroyedGrids[gridName].destroyedAddedObject = addedObject.name;
      }
    }
    delete addedObject.parentObjectName;
    delete addedObjectsInsideGroups[addedObject.name];
    delete addedObject.indexInParent;

    addedObject.mesh.position.set(
      addedObject.positionXWhenAttached,
      addedObject.positionYWhenAttached,
      addedObject.positionZWhenAttached
    );
    addedObject.physicsBody.position.set(
      addedObject.positionXWhenAttached,
      addedObject.positionYWhenAttached,
      addedObject.positionZWhenAttached
    );
    addedObject.physicsBody.initPosition.copy(addedObject.physicsBody.position);
    addedObject.mesh.quaternion.set(
      addedObject.qxWhenAttached,
      addedObject.qyWhenAttached,
      addedObject.qzWhenAttached,
      addedObject.qwWhenAttached
    );
    addedObject.physicsBody.quaternion.set(
      addedObject.pqxWhenAttached,
      addedObject.pqyWhenAttached,
      addedObject.pqzWhenAttached,
      addedObject.pqwWhenAttached
    );
    addedObject.physicsBody.initQuaternion.copy(addedObject.physicsBody.quaternion);

    delete addedObject.positionXWhenAttached;
    delete addedObject.positionYWhenAttached;
    delete addedObject.positionZWhenAttached;
    delete addedObject.qxWhenAttached;
    delete addedObject.qyWhenAttached;
    delete addedObjects.qzWhenAttached;
    delete addedObject.qwWhenAttached;
    delete addedObject.pqxWhenAttached;
    delete addedObject.pqyWhenAttached;
    delete addedObject.pqzWhenAttached;
    delete addedObject.pqwWhenAttached;

  }

  rayCaster.refresh();

}

ObjectGroup.prototype.setQuaternion = function(axis, val){
  if (axis == "x"){
    this.graphicsGroup.quaternion.x = val;
    this.physicsBody.quaternion.x = val;
    this.initQuaternion.x = val;
    this.physicsBody.initQuaternion.x = val;
    this.mesh.quaternion.x = val;
  }else if (axis == "y"){
    this.graphicsGroup.quaternion.y = val;

    this.physicsBody.quaternion.y = val;
    this.initQuaternion.y = val;
    this.physicsBody.initQuaternion.y = val;
    this.mesh.quaternion.y = val;
  }else if (axis == "z"){
    this.graphicsGroup.quaternion.z = val;
    this.physicsBody.quaternion.z = val;
    this.initQuaternion.z = val;
    this.physicsBody.initQuaternion.z = val;
    this.mesh.quaternion.z = val;
  }else if (axis == "w"){
    this.graphicsGroup.quaternion.w = val;
    this.physicsBody.quaternion.w = val;
    this.initQuaternion.w = val;
    this.physicsBody.initQuaternion.w = val;
    this.mesh.quaternion.w = val;
  }
}

ObjectGroup.prototype.rotate = function(axis, radian, fromScript){
  if (axis == "x"){
    this.mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_X,
      radian
    );
  }else if (axis == "y"){
    this.mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Y,
      radian
    );
  }else if (axis == "z"){
    this.mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Z,
      radian
    );
  }

  this.physicsBody.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);

  if (!fromScript){
    this.initQuaternion = this.mesh.quaternion.clone();
    this.physicsBody.initQuaternion.copy(
      this.physicsBody.quaternion
    );
    if (axis == "x"){
      this.rotationX += radian;
    }else if (axis == "y"){
      this.rotationY += radian;
    }else if (axis == "z"){
      this.rotationZ += radian;
    }
  }

  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }

}

ObjectGroup.prototype.translate = function(axis, amount, fromScript){
  var physicsBody = this.physicsBody;
  if (axis == "x"){
    this.mesh.translateX(amount);
  }else if (axis == "y"){
    this.mesh.translateY(amount);
  }else if (axis == "z"){
    this.mesh.translateZ(amount);
  }
  physicsBody.position.copy(this.mesh.position);
  this.graphicsGroup.position.copy(this.mesh.position);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

ObjectGroup.prototype.destroy = function(isUndo){
  if (selectedObjectGroup && selectedObjectGroup.name == this.name){
    selectedObjectGroup = 0;
  }
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  for (var name in this.group){
    var childObj= this.group[name];
    if (childObj.destroyedGrids){
      for (var gridName in childObj.destroyedGrids){
        if (!isUndo){
          delete childObj.destroyedGrids[gridName].destroyedAddedObject;
        }else{
          childObj.destroyedGrids[gridName].destroyedAddedObject = childObj.name;
        }
        delete childObj.destroyedGrids[gridName].destroyedObjectGroup;
      }
    }
    this.group[name].dispose();
    delete disabledObjectNames[name];
  }
  objectSelectedByCommand = false;
  this.mesh.material.dispose();
  this.mesh.geometry.dispose();

  rayCaster.refresh();

}

ObjectGroup.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.group = new Object();
  for (var objectName in this.group){
    exportObj.group[objectName] = this.group[objectName].export();
  }
  exportObj.mass = this.mass;
  if (!this.mass){
    exportObj.mass = 0;
  }

  if (this.isDynamicObject){
    exportObj.isDynamicObject = this.isDynamicObject;
  }

  if (this.isSlippery){
    exportObj.isSlippery = true;
  }else{
    exportObj.isSlippery = false;
  }

  if (this.isChangeable){
    exportObj.isChangeable = true;
  }else{
    exportObj.isChangeable = false;
  }

  if (this.noMass){
    exportObj.noMass = true;
  }else{
    exportObj.noMass = false;
  }

  exportObj.quaternionX = this.initQuaternion.x;
  exportObj.quaternionY = this.initQuaternion.y;
  exportObj.quaternionZ = this.initQuaternion.z;
  exportObj.quaternionW = this.initQuaternion.w;

  exportObj.isBasicMaterial = this.isBasicMaterial;
  exportObj.isPhongMaterial = this.isPhongMaterial;

  var blendingModeInt = this.mesh.material.blending;
  if (blendingModeInt == NO_BLENDING){
    exportObj.blendingMode = "NO_BLENDING";
  }else if (blendingModeInt == NORMAL_BLENDING){
    exportObj.blendingMode = "NORMAL_BLENDING";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    exportObj.blendingMode = "ADDITIVE_BLENDING";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    exportObj.blendingMode = "SUBTRACTIVE_BLENDING";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    exportObj.blendingMode = "MULTIPLY_BLENDING";
  }

  if (this.renderSide){
    exportObj.renderSide = this.renderSide;
  }

  if (this.areaVisibilityConfigurations){
    exportObj.areaVisibilityConfigurations = this.areaVisibilityConfigurations;
  }
  if (this.areaSideConfigurations){
    exportObj.areaSideConfigurations = this.areaSideConfigurations;
  }

  if (this.pivotObject){
    exportObj.hasPivot = true;
    exportObj.pivotOffsetX = this.pivotOffsetX;
    exportObj.pivotOffsetY = this.pivotOffsetY;
    exportObj.pivotOffsetZ = this.pivotOffsetZ;
    exportObj.positionX = this.mesh.position.x;
    exportObj.positionY = this.mesh.position.y;
    exportObj.positionZ = this.mesh.position.z;
    exportObj.quaternionX = this.mesh.quaternion.x;
    exportObj.quaternionY = this.mesh.quaternion.y;
    exportObj.quaternionZ = this.mesh.quaternion.z;
    exportObj.quaternionW = this.mesh.quaternion.w;
    exportObj.pivotQX = this.pivotObject.quaternion.x;
    exportObj.pivotQY = this.pivotObject.quaternion.y;
    exportObj.pivotQZ = this.pivotObject.quaternion.z;
    exportObj.pivotQW = this.pivotObject.quaternion.w;
    exportObj.insidePivotQX = this.pivotObject.children[0].quaternion.x;
    exportObj.insidePivotQY = this.pivotObject.children[0].quaternion.y;
    exportObj.insidePivotQZ = this.pivotObject.children[0].quaternion.z;
    exportObj.insidePivotQW = this.pivotObject.children[0].quaternion.w;
  }else if (this.pivotRemoved){
    exportObj.pivotRemoved = true;
    exportObj.positionX = this.mesh.position.x;
    exportObj.positionY = this.mesh.position.y;
    exportObj.positionZ = this.mesh.position.z;
    exportObj.quaternionX = this.mesh.quaternion.x;
    exportObj.quaternionY = this.mesh.quaternion.y;
    exportObj.quaternionZ = this.mesh.quaternion.z;
    exportObj.quaternionW = this.mesh.quaternion.w;
  }

  if (this.softCopyParentName){
    exportObj.softCopyParentName = this.softCopyParentName;
  }

  exportObj.totalAlpha = this.mesh.material.uniforms.totalAlpha.value;
  exportObj.totalAOIntensity = this.mesh.material.uniforms.totalAOIntensity.value;
  exportObj.totalEmissiveIntensity = this.mesh.material.uniforms.totalEmissiveIntensity.value;
  exportObj.totalEmissiveColor = "#"+this.mesh.material.uniforms.totalEmissiveColor.value.getHexString();

  return exportObj;
}

ObjectGroup.prototype.getInitialCenter = function(){
  var group = this.group;
  var centerX = 0;
  var centerY = 0;
  var centerZ = 0;
  var count = 0;
  for (var objectName in group){
    var bodyPosition = group[objectName].physicsBody.position;
    count ++;
    centerX += bodyPosition.x;
    centerY += bodyPosition.y;
    centerZ += bodyPosition.z;
  }
  centerX = centerX / count;
  centerY = centerY / count;
  centerZ = centerZ / count;
  var obj = new Object();
  obj.x = centerX;
  obj.y = centerY;
  obj.z = centerZ;
  return obj;
}

ObjectGroup.prototype.setMass = function(mass){
  if (mass != 0){
    this.isDynamicObject = true;
    this.physicsBody.type = CANNON.Body.DYNAMIC;
  }else{
    this.isDynamicObject = false;
    this.physicsBody.type = CANNON.Body.STATIC;
  }
  this.physicsBody.mass = mass;
  this.physicsBody.updateMassProperties();
  this.physicsBody.aabbNeedsUpdate = true;
  this.mass = mass;
}

ObjectGroup.prototype.isVisibleOnThePreviewScene = function(){
  return !(this.isHidden);
}

ObjectGroup.prototype.setBlending = function(blendingModeInt){
  this.mesh.material.blending = blendingModeInt;
  if (blendingModeInt == NO_BLENDING){
    this.blendingMode = "NO_BLENDING";
  }else if (blendingModeInt == NORMAL_BLENDING){
    this.blendingMode = "NORMAL_BLENDING";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    this.blendingMode = "ADDITIVE_BLENDING";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    this.blendingMode = "SUBTRACTIVE_BLENDING";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    this.blendingMode = "MULTIPLY_BLENDING";
  }
}

ObjectGroup.prototype.getBlendingText = function(){
  var blendingModeInt = this.mesh.material.blending;
  if (blendingModeInt == NO_BLENDING){
    return "None";
  }else if (blendingModeInt == NORMAL_BLENDING){
    return "Normal";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    return "Additive";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    return "Subtractive";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    return "Multiply";
  }
}

ObjectGroup.prototype.updateBoundingBoxes = function(){
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  for (var objName in this.group){
    this.group[objName].updateBoundingBoxes(this.boundingBoxes);
  }
}

ObjectGroup.prototype.generateBoundingBoxes = function(){
  if (!this.mesh){
    return;
  }
  this.boundingBoxes = [];
  this.mesh.updateMatrixWorld();
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  for (var objName in this.group){
    this.group[objName].generateBoundingBoxes(this.boundingBoxes);
  }
}

ObjectGroup.prototype.visualiseBoudingBoxes = function(selectedScene){
  for (var objName in this.group){
    this.group[objName].visualiseBoudingBoxes(selectedScene);
  }
}

ObjectGroup.prototype.setSlippery = function(isSlippery){
  if (isSlippery){
    if (!isPhysicsWorkerEnabled()){
      this.setFriction(0);
    }
    this.isSlippery = true;
  }else{
    if (!isPhysicsWorkerEnabled()){
      this.setFriction(friction);
    }
    this.isSlippery = false;
  }
}

ObjectGroup.prototype.setFriction = function(val){
  var physicsMaterial = this.physicsBody.material;
  for (var objName in addedObjects){
    var otherMaterial = addedObjects[objName].physicsBody.material;
    var contact = physicsWorld.getContactMaterial(physicsMaterial, otherMaterial);
    if (contact){
      contact.friction = val;
    }else{
      contact = new CANNON.ContactMaterial(physicsMaterial,otherMaterial, {
        friction: val,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      });
      physicsWorld.addContactMaterial(contact);
    }
  }
  for (var objName in objectGroups){
    if (objName == this.name){
      continue;
    }
    var otherMaterial = objectGroups[objName].physicsBody.material;
    var contact = physicsWorld.getContactMaterial(physicsMaterial, otherMaterial);
    if (contact){
      contact.friction = val;
    }else{
      contact = new CANNON.ContactMaterial(physicsMaterial, otherMaterial, {
        friction: val,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      });
      physicsWorld.addContactMaterial(contact);
    }
  }
}

ObjectGroup.prototype.makePivot = function(offsetX, offsetY, offsetZ){
  var obj = this;
  var pseudoMesh = new THREE.Mesh(obj.mesh.geometry, obj.mesh.material);
  pseudoMesh.position.copy(obj.mesh.position);
  pseudoMesh.quaternion.copy(obj.mesh.quaternion);
  var pivot = new THREE.Object3D();
  pivot.add(pseudoMesh);
  pivot.position.set(
    pseudoMesh.position.x + offsetX,
    pseudoMesh.position.y + offsetY,
    pseudoMesh.position.z + offsetZ
  );
  pseudoMesh.position.x = -offsetX;
  pseudoMesh.position.y = -offsetY;
  pseudoMesh.position.z = -offsetZ;
  pivot.pseudoMesh = pseudoMesh;
  pivot.offsetX = offsetX;
  pivot.offsetY = offsetY;
  pivot.offsetZ = offsetZ;
  pivot.rotation.order = 'YXZ';
  pivot.sourceObject = this;
  return pivot;
}

ObjectGroup.prototype.rotateAroundPivotObject = function(axis, radians){
  if (!this.pivotObject){
    return;
  }
  this.updatePivot();
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  if (axis == "x"){
    this.pivotObject.rotation.x += radians;
  }else if (axis == "y"){
    this.pivotObject.rotation.y += radians;
  }else if (axis == "z"){
    this.pivotObject.rotation.z += radians;
  }
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  this.pivotObject.pseudoMesh.updateMatrix();
  this.pivotObject.pseudoMesh.updateMatrixWorld();
  this.pivotObject.pseudoMesh.matrixWorld.decompose(REUSABLE_VECTOR, REUSABLE_QUATERNION, REUSABLE_VECTOR_2);
  this.mesh.position.copy(REUSABLE_VECTOR);
  this.mesh.quaternion.copy(REUSABLE_QUATERNION);
  this.physicsBody.quaternion.copy(this.mesh.quaternion);
  this.physicsBody.position.copy(this.mesh.position);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

ObjectGroup.prototype.updatePivot = function(){
  if (!this.pivotObject){
    return;
  }
  this.pivotObject.position.copy(this.mesh.position);
  this.pivotObject.translateX(this.pivotOffsetX);
  this.pivotObject.translateY(this.pivotOffsetY);
  this.pivotObject.translateZ(this.pivotOffsetZ);
}

ObjectGroup.prototype.copy = function(name, isHardCopy, copyPosition, gridSystem, fromScript){
  var positionBeforeDetached = this.mesh.position.clone();
  var quaternionBeforeDetached = this.mesh.quaternion.clone();
  var physicsPositionBeforeDetached = this.physicsBody.position.clone();
  var physicsQuaternionBeforeDetached = this.physicsBody.quaternion.clone();
  var initQuaternionBeforeDetached = this.initQuaternion.clone();
  var massWhenDetached = this.physicsBody.mass;
  var noMass = this.noMass;
  var slippery = this.isSlippery;
  var isChangeable = this.isChangeable;
  var renderSide = this.renderSide;
  var blending = this.mesh.material.blending;
  var totalAlphaBeforeDetached = this.mesh.material.uniforms.totalAlpha.value;
  var totalAOIntensityBeforeDetached = this.mesh.material.uniforms.totalAOIntensity.value;
  var totalEmissiveIntensityBeforeDetached = this.mesh.material.uniforms.totalEmissiveIntensity.value;
  var totalEmissiveColorBeforeDetached = this.mesh.material.uniforms.totalEmissiveColor.value;
  var isTransparentBeforeDetached = this.mesh.material.transparent;
  this.detach();
  var newGroup = new Object();
  for (var objName in this.group){
    this.group[objName].skipToggleGrid = true;
    var copiedChild = this.group[objName].copy(
      generateUniqueObjectName(), isHardCopy, REUSABLE_VECTOR.set(0, 0, 0), gridSystem, fromScript
    );
    copiedChild.mesh.position.copy(this.group[objName].mesh.position);
    copiedChild.mesh.quaternion.copy(this.group[objName].mesh.quaternion);
    copiedChild.physicsBody.position.copy(this.group[objName].physicsBody.position);
    copiedChild.physicsBody.quaternion.copy(this.group[objName].physicsBody.quaternion);
    copiedChild.metaData["positionX"] = copiedChild.mesh.position.x;
    copiedChild.metaData["positionY"] = copiedChild.mesh.position.y;
    copiedChild.metaData["positionZ"] = copiedChild.mesh.position.z;
    copiedChild.metaData["centerX"] = copiedChild.mesh.position.x;
    copiedChild.metaData["centerY"] = copiedChild.mesh.position.y;
    copiedChild.metaData["centerZ"] = copiedChild.mesh.position.z;
    newGroup[copiedChild.name] = copiedChild;
    addedObjects[copiedChild.name] = copiedChild;
    this.group[objName].skipToggleGrid = false;
  }
  var newObjGroup = new ObjectGroup(name, newGroup);
  newObjGroup.handleTextures();
  newObjGroup.glue();
  newObjGroup.mesh.position.copy(copyPosition);
  newObjGroup.physicsBody.position.copy(copyPosition);
  newObjGroup.mesh.quaternion.copy(quaternionBeforeDetached);
  newObjGroup.physicsBody.quaternion.copy(physicsQuaternionBeforeDetached);
  newObjGroup.graphicsGroup.position.copy(newObjGroup.mesh.position);
  newObjGroup.graphicsGroup.quaternion.copy(newObjGroup.mesh.quaternion);
  this.glue();
  newObjGroup.isBasicMaterial = this.isBasicMaterial;
  newObjGroup.isPhongMaterial = this.isPhongMaterial;
  this.physicsBody.position.copy(physicsPositionBeforeDetached);
  this.physicsBody.quaternion.copy(physicsQuaternionBeforeDetached);
  this.mesh.position.copy(positionBeforeDetached);
  this.mesh.quaternion.copy(quaternionBeforeDetached);
  var dx = newObjGroup.mesh.position.x - this.mesh.position.x;
  var dy = newObjGroup.mesh.position.y - this.mesh.position.y;
  var dz = newObjGroup.mesh.position.z - this.mesh.position.z;
  for (var objName in newObjGroup.group){
    newObjGroup.group[objName].positionXWhenAttached += dx;
    newObjGroup.group[objName].positionYWhenAttached += dy;
    newObjGroup.group[objName].positionZWhenAttached += dz;
    newObjGroup.group[objName].metaData["positionX"] += dx;
    newObjGroup.group[objName].metaData["positionY"] += dy;
    newObjGroup.group[objName].metaData["positionZ"] += dz;
    newObjGroup.group[objName].metaData["centerX"] += dx;
    newObjGroup.group[objName].metaData["centerY"] += dy;
    newObjGroup.group[objName].metaData["centerZ"] += dz;
  }
  this.isChangeable = isChangeable;
  newObjGroup.isChangeable = isChangeable;
  if (slippery){
    this.setSlippery(slippery);
    newObjGroup.setSlippery(slippery);
  }
  this.noMass = noMass;
  newObjGroup.noMass = noMass;
  if (noMass){
    physicsWorld.remove(this.physicsBody);
    physicsWorld.remove(newObjGroup.physicsBody);
  }
  newObjGroup.graphicsGroup.position.copy(newObjGroup.mesh.position);
  newObjGroup.graphicsGroup.quaternion.copy(newObjGroup.mesh.quaternion);
  this.initQuaternion.copy(initQuaternionBeforeDetached);
  newObjGroup.initQuaternion.copy(initQuaternionBeforeDetached);
  this.setMass(massWhenDetached);
  newObjGroup.cannotSetMass = this.cannotSetMass;
  if (this.physicsBody.mass != 0){
    newObjGroup.setMass(this.physicsBody.mass);
  }
  if (!(typeof renderSide == UNDEFINED)){
    this.handleRenderSide(renderSide);
    newObjGroup.handleRenderSide(renderSide);
  }

  this.setBlending(blending);
  newObjGroup.setBlending(this.mesh.material.blending);

  this.mesh.material.transparent = isTransparentBeforeDetached;
  newObjGroup.mesh.material.transparent = isTransparentBeforeDetached;
  this.mesh.material.uniforms.totalAlpha.value = totalAlphaBeforeDetached;
  this.mesh.material.uniforms.totalAOIntensity.value = totalAOIntensityBeforeDetached;
  this.mesh.material.uniforms.totalEmissiveIntensity.value = totalEmissiveIntensityBeforeDetached;
  this.mesh.material.uniforms.totalEmissiveColor.value = totalEmissiveColorBeforeDetached;

  if (!isHardCopy){
    newObjGroup.mesh.material = this.mesh.material;
    newObjGroup.softCopyParentName = this.name;
  }else{
    newObjGroup.mesh.material.uniforms.totalAlpha.value = this.mesh.material.uniforms.totalAlpha.value;
    newObjGroup.mesh.material.uniforms.totalAOIntensity.value = this.mesh.material.uniforms.totalAOIntensity.value;
    newObjGroup.mesh.material.uniforms.totalEmissiveIntensity.value = this.mesh.material.uniforms.totalEmissiveIntensity.value;
    newObjGroup.mesh.material.uniforms.totalEmissiveColor.value = new THREE.Color().copy(this.mesh.material.uniforms.totalEmissiveColor.value);
  }

  if (this.pivotObject){
    var pivot = newObjGroup.makePivot(this.pivotOffsetX, this.pivotOffsetY, this.pivotOffsetZ);
    newObjGroup.pivotObject = pivot;
    newObjGroup.pivotOffsetX = this.pivotOffsetX;
    newObjGroup.pivotOffsetY = this.pivotOffsetY;
    newObjGroup.pivotOffsetZ = this.pivotOffsetZ;
    newObjGroup.pivotRemoved = false;
  }

  newObjGroup.createdWithScript = fromScript;

  return newObjGroup;
}

ObjectGroup.prototype.updateOpacity = function(val){
  this.mesh.material.uniforms.totalAlpha.value = val;
  if (val != 1){
    this.mesh.material.transparent = true;
  }else{
    this.mesh.material.transparent = this.isTransparent;
  }
}
ObjectGroup.prototype.incrementOpacity = function(val){
  this.mesh.material.uniforms.totalAlpha.value += val;
  if (this.mesh.material.uniforms.totalAlpha.value != 1){
    this.mesh.material.transparent = true;
  }else{
    this.mesh.material.transparent = this.isTransparent;
  }
}
