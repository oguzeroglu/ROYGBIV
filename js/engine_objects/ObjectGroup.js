var ObjectGroup = function(name, group){
  this.isObjectGroup = true;
  if (IS_WORKER_CONTEXT){
    return this;
  }

  this.name = name;
  this.group = group;

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.gridSystemNames = [];

  this.childObjectsByName = new Object();

  this.prevPositionVector = new THREE.Vector3();

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
  this.isIntersectable = true;
  this.lastUpdatePosition = new THREE.Vector3();
  this.lastUpdateQuaternion = new THREE.Quaternion();
}

ObjectGroup.prototype.hide = function(keepPhysics){
  if (this.isVisibleOnThePreviewScene()){
    this.mesh.visible = false;
    if (!keepPhysics){
      if (!this.noMass){
        setTimeout(function(){
          physicsWorld.remove(this.physicsBody);
          this.physicsKeptWhenHidden = false;
        });
        physicsWorld.hide(this);
        if (physicsDebugMode){
          debugRenderer.hide(this);
        }
      }
    }else{
      this.physicsKeptWhenHidden = true;
    }
    this.isHidden = true;
    rayCaster.hide(this);
  }
}

ObjectGroup.prototype.onPositionChange = function(from, to){
  if (mode == 0){
    return;
  }
  if (this.positionThresholdExceededListenerInfo && this.positionThresholdExceededListenerInfo.isActive){
    var axis = this.positionThresholdExceededListenerInfo.axis;
    var oldPos = from[axis];
    var newPos = to[axis];
    var threshold = this.positionThresholdExceededListenerInfo.threshold;
    if (this.positionThresholdExceededListenerInfo.controlMode == 1){
      if (oldPos <= threshold && newPos > threshold){
        this.positionThresholdExceededListenerInfo.callbackFunction();
      }
    }else{
      if (oldPos >= threshold && newPos < threshold){
        this.positionThresholdExceededListenerInfo.callbackFunction();
      }
    }
  }
}

ObjectGroup.prototype.forceColor = function(r, g, b, a){
  if (!this.isColorizable){
    return;
  }
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
  if (!this.isColorizable){
    return;
  }
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
  this.displacementTexture = 0;
  var totalTextureCount = 0;
  for (var objName in this.group){
    var obj = this.group[objName];
    if (obj.hasDiffuseMap()){
      var txt = obj.mesh.material.uniforms.diffuseMap.value;
      if (!this.diffuseTexture){
        this.diffuseTexture = txt;
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
      }else{
        if (!this.textureCompare(this.aoTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
    if (obj.hasDisplacementMap() && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
      var txt = obj.mesh.material.uniforms.displacementMap.value;
      if (!this.displacementTexture){
        this.displacementTexture = txt;
      }else{
        if (!this.textureCompare(this.displacementTexture, txt)){
          throw new Error("Cannot merge objects with different texture properties.");
          return;
        }
      }
    }
  }
  this.hasTexture = (this.diffuseTexture != 0) ||
                    (this.emissiveTexture != 0)  ||
                    (this.alphaTexture != 0) ||
                    (this.aoTexture != 0) ||
                    (this.displacementTexture != 0);
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
      emissiveIntensities = [], emissiveColors = [], aoIntensities = [], displacementInfos = [],
      textureMatrixInfos = [];
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
    if (this.emissiveTexture){
      if (obj.hasEmissiveMap()){
        emissiveIntensities.push(obj.mesh.material.uniforms.emissiveIntensity.value);
        emissiveColors.push(obj.mesh.material.uniforms.emissiveColor.value.r);
        emissiveColors.push(obj.mesh.material.uniforms.emissiveColor.value.g);
        emissiveColors.push(obj.mesh.material.uniforms.emissiveColor.value.b);
      }else{
        emissiveIntensities.push(1);
        emissiveColors.push(1);
        emissiveColors.push(1);
        emissiveColors.push(1);
      }
    }
    if (this.aoTexture){
      if (obj.hasAOMap()){
        aoIntensities.push(obj.mesh.material.uniforms.aoIntensity.value);
      }else{
        aoIntensities.push(1);
      }
    }
    if (this.hasTexture){
      if (obj.hasTexture()){
        textureMatrixInfos.push(obj.getTextureOffsetX());
        textureMatrixInfos.push(obj.getTextureOffsetY());
        textureMatrixInfos.push(obj.getTextureRepeatX());
        textureMatrixInfos.push(obj.getTextureRepeatY());
      }else{
        textureMatrixInfos.push(0);
        textureMatrixInfos.push(0);
        textureMatrixInfos.push(0);
        textureMatrixInfos.push(0);
      }
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
  var textureInfoBufferAttribute;
  var textureMatrixInfosBufferAttribute;
  var emissiveIntensityBufferAttribute;
  var emissiveColorBufferAttribute;
  var aoIntensityBufferAttribute;
  var displacementInfoBufferAttribute;
  if (this.hasTexture){
    textureInfoBufferAttribute = new THREE.InstancedBufferAttribute(
      new Int16Array(textureInfos), 4
    );
    textureMatrixInfosBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(textureMatrixInfos), 4
    );
    textureInfoBufferAttribute.setDynamic(false);
    textureMatrixInfosBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("textureInfo", textureInfoBufferAttribute);
    this.geometry.addAttribute("textureMatrixInfo", textureMatrixInfosBufferAttribute);
    this.geometry.addAttribute("uv", refGeometry.attributes.uv);
  }
  if (this.emissiveTexture){
    emissiveIntensityBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(emissiveIntensities), 1
    );
    emissiveColorBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(emissiveColors), 3
    );
    emissiveIntensityBufferAttribute.setDynamic(false);
    emissiveColorBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("emissiveIntensity", emissiveIntensityBufferAttribute);
    this.geometry.addAttribute("emissiveColor", emissiveColorBufferAttribute);
  }
  if (this.aoTexture){
    aoIntensityBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(aoIntensities), 1
    );
    aoIntensityBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("aoIntensity", aoIntensityBufferAttribute);
  }
  if (this.displacementTexture){
    displacementInfoBufferAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(displacementInfos), 2
    );
    displacementInfoBufferAttribute.setDynamic(false);
    this.geometry.addAttribute("displacementInfo", displacementInfoBufferAttribute);
    this.geometry.addAttribute("normal", refGeometry.attributes.normal);
  }

  positionOffsetBufferAttribute.setDynamic(false);
  quaternionsBufferAttribute.setDynamic(false);
  alphaBufferAttribute.setDynamic(false);
  colorBufferAttribute.setDynamic(false);

  this.geometry.addAttribute("positionOffset", positionOffsetBufferAttribute);
  this.geometry.addAttribute("quaternion", quaternionsBufferAttribute);
  this.geometry.addAttribute("alpha", alphaBufferAttribute);
  this.geometry.addAttribute("color", colorBufferAttribute);
  this.geometry.addAttribute("position", refGeometry.attributes.position);

}

ObjectGroup.prototype.merge = function(){

  this.handleTextures();

  if (this.areGeometriesIdentical() && INSTANCING_SUPPORTED){
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
            displacementInfos, textureInfos, textureMatrixInfos;
  if (max > 0){
    positions = new Array((max + 1) * 3);
    colors = new Array((max + 1) * 3);
    alphas = new Array(max + 1);
    if (this.displacementTexture){
      normals = new Array((max + 1) * 3);
      displacementInfos = new Array((max + 1) * 2);
    }
    if (this.hasTexture){
      uvs = new Array((max + 1) * 2);
      textureInfos = new Array((max + 1) * 4);
      textureMatrixInfos = new Array((max + 1) * 4);
    }
    if (this.emissiveTexture){
      emissiveIntensities = new Array(max + 1);
      emissiveColors = new Array((max + 1) * 3);
    }
    if (this.aoTexture){
      aoIntensities = new Array(max + 1);
    }
  }else{
    positions = [];
    colors = [];
    alphas = [];
    if (this.displacementTexture){
      normals = [];
      displacementInfos = [];
    }
    if (this.hasTexture){
      uvs = [];
      textureInfos = [];
      textureMatrixInfos = [];
    }
    if (this.emissiveTexture){
      emissiveIntensities = [];
      emissiveColors = [];
    }
    if (this.aoTexture){
      aoIntensities = [];
    }
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
    if (this.displacementTexture){
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
    if (this.hasTexture){
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
    }
    // DISPLACEMENT INFOS
    if (this.displacementTexture){
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
    // EMISSIVE INTENSITY AND EMISSIVE COLOR
    if (this.emissiveTexture){
      var emissiveIntensity;
      if (addedObject.hasEmissiveMap()){
        emissiveIntensity = addedObject.mesh.material.uniforms.emissiveIntensity.value;
      }else{
        emissiveIntensity = 0;
      }
      if (!aSkipped){
        this.push(emissiveIntensities, emissiveIntensity, a, isIndexed);
      }
      if (!bSkipped){
        this.push(emissiveIntensities, emissiveIntensity, b, isIndexed);
      }
      if (!cSkipped){
        this.push(emissiveIntensities, emissiveIntensity, c, isIndexed);
      }
      var emissiveColor;
      if (addedObject.hasEmissiveMap()){
        emissiveColor = addedObject.mesh.material.uniforms.emissiveColor.value;
      }else{
        emissiveColor = WHITE_COLOR;
      }
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
    }
    // AO INTENSITY
    if (this.aoTexture){
      var aoIntensity;
      if (addedObject.hasAOMap()){
        aoIntensity = addedObject.mesh.material.uniforms.aoIntensity.value;
      }else{
        aoIntensity = 0;
      }
      if (!aSkipped){
        this.push(aoIntensities, aoIntensity, a, isIndexed);
      }
      if (!bSkipped){
        this.push(aoIntensities, aoIntensity, b, isIndexed);
      }
      if (!cSkipped){
        this.push(aoIntensities, aoIntensity, c, isIndexed);
      }
    }
    // TEXTURE INFOS AND TEXTURE MATRIX INFOS
    if (this.hasTexture){
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
      if (!aSkipped){
        if (addedObject.hasTexture()){
          this.push(textureMatrixInfos, addedObject.getTextureOffsetX(), (4*a), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureOffsetY(), ((4*a) + 1), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatX(), ((4*a) + 2), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatY(), ((4*a) + 3), isIndexed);
        }else{
          this.push(textureMatrixInfos, 0, (4*a), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*a) + 1), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*a) + 2), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*a) + 3), isIndexed);
        }
      }
      if (!bSkipped){
        if (addedObject.hasTexture()){
          this.push(textureMatrixInfos, addedObject.getTextureOffsetX(), (4*b), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureOffsetY(), ((4*b) + 1), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatX(), ((4*b) + 2), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatY(), ((4*b) + 3), isIndexed);
        }else{
          this.push(textureMatrixInfos, 0, (4*b), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*b) + 1), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*b) + 2), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*b) + 3), isIndexed);
        }
      }
      if (!cSkipped){
        if (addedObject.hasTexture()){
          this.push(textureMatrixInfos, addedObject.getTextureOffsetX(), (4*c), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureOffsetY(), ((4*c) + 1), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatX(), ((4*c) + 2), isIndexed);
          this.push(textureMatrixInfos, addedObject.getTextureRepeatY(), ((4*c) + 3), isIndexed);
        }else{
          this.push(textureMatrixInfos, 0, (4*c), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*c) + 1), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*c) + 2), isIndexed);
          this.push(textureMatrixInfos, 0, ((4*c) + 3), isIndexed);
        }
      }
    }
  }

  var positionsTypedArray = new Float32Array(positions);
  var colorsTypedArray = new Float32Array(colors);
  var alphasTypedArray = new Float32Array(alphas);

  if (this.displacementTexture){
    var normalsTypedArray = new Float32Array(normals);
    var displacementInfosTypedArray = new Float32Array(displacementInfos);
    var normalsBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
    var displacementInfosBufferAttribute = new THREE.BufferAttribute(displacementInfosTypedArray, 2);
    normalsBufferAttribute.setDynamic(false);
    displacementInfosBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('normal', normalsBufferAttribute);
    this.geometry.addAttribute('displacementInfo', displacementInfosBufferAttribute);
  }
  if (this.hasTexture){
    var uvsTypedArray = new Float32Array(uvs);
    var textureInfosTypedArray = new Int8Array(textureInfos);
    var textureMatrixInfosTypedArray = new Float32Array(textureMatrixInfos);
    var uvsBufferAttribute = new THREE.BufferAttribute(uvsTypedArray, 2);
    var textureInfosBufferAttribute = new THREE.BufferAttribute(textureInfosTypedArray, 4);
    var textureMatrixInfosBufferAttribute = new THREE.BufferAttribute(textureMatrixInfosTypedArray, 4);
    uvsBufferAttribute.setDynamic(false);
    textureInfosBufferAttribute.setDynamic(false);
    textureMatrixInfosBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('uv', uvsBufferAttribute);
    this.geometry.addAttribute('textureInfo', textureInfosBufferAttribute);
    this.geometry.addAttribute('textureMatrixInfo', textureMatrixInfosBufferAttribute);
  }
  if (this.emissiveTexture){
    var emissiveIntensitiesTypedArray = new Float32Array(emissiveIntensities);
    var emissiveColorsTypedArray = new Float32Array(emissiveColors);
    var emissiveIntensitiesBufferAttribute = new THREE.BufferAttribute(emissiveIntensitiesTypedArray, 1);
    var emissiveColorsBufferAttribute = new THREE.BufferAttribute(emissiveColorsTypedArray, 3);
    emissiveIntensitiesBufferAttribute.setDynamic(false);
    emissiveColorsBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('emissiveIntensity', emissiveIntensitiesBufferAttribute);
    this.geometry.addAttribute('emissiveColor', emissiveColorsBufferAttribute);
  }
  if (this.aoTexture){
    var aoIntensitiesTypedArray = new Float32Array(aoIntensities);
    var aoIntensitiesBufferAttribute = new THREE.BufferAttribute(aoIntensitiesTypedArray, 1);
    aoIntensitiesBufferAttribute.setDynamic(false);
    this.geometry.addAttribute('aoIntensity', aoIntensitiesBufferAttribute);
  }

  var positionsBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
  var colorsBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
  var alphasBufferAttribute = new THREE.BufferAttribute(alphasTypedArray, 1);

  positionsBufferAttribute.setDynamic(false);
  colorsBufferAttribute.setDynamic(false);
  alphasBufferAttribute.setDynamic(false);

  if (isIndexed){
    var indicesTypedArray = new Uint16Array(indices);
    var indicesBufferAttribute = new THREE.BufferAttribute(indicesTypedArray, 1);
    indicesBufferAttribute.setDynamic(false);
    this.geometry.setIndex(indicesBufferAttribute);
  }

  this.geometry.addAttribute('position', positionsBufferAttribute);
  this.geometry.addAttribute('color', colorsBufferAttribute);
  this.geometry.addAttribute('alpha', alphasBufferAttribute);

  pseudoGeometry = null;
}

ObjectGroup.prototype.glue = function(){
  var group = this.group;
  var physicsBody = physicsBodyGenerator.generateEmptyBody();
  this.originalPhysicsBody = physicsBody;
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
  this.initialPhysicsPositionWhenGlued = {x: referenceVector.x, y: referenceVector.y, z: referenceVector.z};
  physicsBody.position = referenceVector;
  graphicsGroup.position.copy(physicsBody.position);

  var gridSystemNamesMap = new Object();

  var hasAnyPhysicsShape = false;
  for (var objectName in group){
    var addedObject = group[objectName];
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
  webglCallbackHandler.registerEngineObject(this);
  if (this.aoTexture){
    macroHandler.injectMacro("HAS_AO", this.mesh.material, true, true);
  }
  if (this.emissiveTexture){
    macroHandler.injectMacro("HAS_EMISSIVE", this.mesh.material, true, true);
  }
  if (this.diffuseTexture){
    macroHandler.injectMacro("HAS_DIFFUSE", this.mesh.material, true, true);
  }
  if (this.alphaTexture){
    macroHandler.injectMacro("HAS_ALPHA", this.mesh.material, true, true);
  }
  if (this.displacementTexture && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    macroHandler.injectMacro("HAS_DISPLACEMENT", this.mesh.material, true, false);
  }
  if (this.hasTexture){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
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

  this.boundCallbackFunction = this.collisionCallback.bind(this);

  this.gridSystemName = this.group[Object.keys(this.group)[0]].metaData.gridSystemName;
}

ObjectGroup.prototype.collisionCallback = function(collisionEvent){
  if (!collisionEvent.body.addedObject || (!this.isVisibleOnThePreviewScene() && !this.physicsKeptWhenHidden)){
    return;
  }
  var targetObjectName = collisionEvent.body.addedObject.name;
  var contact = collisionEvent.contact;
  var collisionInfo = reusableCollisionInfo.set(
    targetObjectName, contact.bi.position.x + contact.ri.x, contact.bi.position.y + contact.ri.y,
    contact.bi.position.z + contact.ri.z, contact.getImpactVelocityAlongNormal(), this.physicsBody.quaternion.x,
    this.physicsBody.quaternion.y, this.physicsBody.quaternion.z, this.physicsBody.quaternion.w
  );
  var curCollisionCallbackRequest = collisionCallbackRequests.get(this.name);
  if (curCollisionCallbackRequest){
    curCollisionCallbackRequest(collisionInfo);
  }
}

ObjectGroup.prototype.destroyParts = function(){
  for (var objName in this.group){
    var addedObject = addedObjects[objName];
    if (addedObject){
      addedObject.destroy(true);
      delete addedObjects[objName];
      disabledObjectNames[objName] = 1;
    }
  }
}

ObjectGroup.prototype.detach = function(){
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
      physicsWorld.addBody(addedObject.physicsBody);
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
    delete addedObject.qzWhenAttached;
    delete addedObject.qwWhenAttached;
    delete addedObject.pqxWhenAttached;
    delete addedObject.pqyWhenAttached;
    delete addedObject.pqzWhenAttached;
    delete addedObject.pqwWhenAttached;
    delete addedObject.opacityWhenAttached;
    delete addedObject.emissiveIntensityWhenAttached;
    delete addedObject.emissiveColorWhenAttached;
    delete addedObject.aoIntensityWhenAttached;
  }
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

ObjectGroup.prototype.rotatePivotAroundXYZ = function(x, y, z, axis, axisVector, radians){
  this.updatePivot();
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  var point = REUSABLE_VECTOR.set(x, y, z);
  this.pivotObject.position.sub(point);
  this.pivotObject.position.applyAxisAngle(axisVector, radians);
  this.pivotObject.position.add(point);
  this.pivotObject.rotateOnAxis(axisVector, radians);
  this.pivotObject.updateMatrix();
  this.pivotObject.updateMatrixWorld();
  this.pivotObject.pseudoMesh.updateMatrix();
  this.pivotObject.pseudoMesh.updateMatrixWorld();
  this.pivotObject.pseudoMesh.matrixWorld.decompose(REUSABLE_VECTOR, REUSABLE_QUATERNION, REUSABLE_VECTOR_2);
  this.mesh.position.copy(REUSABLE_VECTOR);
  this.mesh.quaternion.copy(REUSABLE_QUATERNION);
  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.physicsBody.position.copy(this.mesh.position);
  }else{
    this.updateSimplifiedPhysicsBody();
  }
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

ObjectGroup.prototype.rotateAroundXYZ = function(x, y, z, axis, axisVector, radians){
  REUSABLE_QUATERNION2.copy(this.mesh.quaternion);
  if (this.pivotObject){
    this.rotatePivotAroundXYZ(x, y, z, axis, axisVector, radians);
    return;
  }
  var point = REUSABLE_VECTOR.set(x, y, z);
  this.mesh.parent.localToWorld(this.mesh.position);
  this.mesh.position.sub(point);
  this.mesh.position.applyAxisAngle(axisVector, radians);
  this.mesh.position.add(point);
  this.mesh.parent.worldToLocal(this.mesh.position);
  this.mesh.rotateOnAxis(axisVector, radians);
  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.physicsBody.position.copy(this.mesh.position);
  }else{
    this.updateSimplifiedPhysicsBody();
  }
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

ObjectGroup.prototype.rotate = function(axis, radian, fromScript){
  REUSABLE_QUATERNION.copy(this.mesh.quaternion);
  var axisVector
  if (axis == "x"){
    axisVector = THREE_AXIS_VECTOR_X;
  }else if (axis == "y"){
    axisVector = THREE_AXIS_VECTOR_Y;
  }else if (axis == "z"){
    axisVector = THREE_AXIS_VECTOR_Z;
  }
  this.mesh.rotateOnWorldAxis(axisVector, radian);

  if (!this.isPhysicsSimplified){
    this.physicsBody.quaternion.copy(this.mesh.quaternion);
    this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  }else{
    this.updateSimplifiedPhysicsBody();
  }

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

ObjectGroup.prototype.updateSimplifiedPhysicsBody = function(){
  if (this.pivotObject){
    this.updatePivot();
    this.pivotObject.updateMatrixWorld();
    this.pivotObject.updateMatrix();
    this.pivotObject.pseudoMesh.updateMatrixWorld();
    this.pivotObject.pseudoMesh.updateMatrix();
  }else{
    this.physicsSimplificationObject3DContainer.position.copy(this.mesh.position);
    this.physicsSimplificationObject3DContainer.quaternion.copy(this.mesh.quaternion);
    this.physicsSimplificationObject3DContainer.updateMatrixWorld();
    this.physicsSimplificationObject3DContainer.updateMatrix();
  }
  this.physicsSimplificationObject3D.getWorldPosition(REUSABLE_VECTOR);
  this.physicsSimplificationObject3D.getWorldQuaternion(REUSABLE_QUATERNION);
  this.physicsBody.position.copy(REUSABLE_VECTOR);
  this.physicsBody.quaternion.copy(REUSABLE_QUATERNION);
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
  if (!this.isPhysicsSimplified){
    physicsBody.position.copy(this.mesh.position);
  }else{
    this.updateSimplifiedPhysicsBody();
  }
  this.graphicsGroup.position.copy(this.mesh.position);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

ObjectGroup.prototype.destroy = function(skipRaycasterRefresh){
  this.removeBoundingBoxesFromScene();
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  for (var name in this.group){
    var childObj= this.group[name];
    if (childObj.destroyedGrids){
      for (var gridName in childObj.destroyedGrids){
        delete childObj.destroyedGrids[gridName].destroyedAddedObject;
        delete childObj.destroyedGrids[gridName].destroyedObjectGroup;
      }
    }
    this.group[name].dispose();
    delete disabledObjectNames[name];
  }
  this.mesh.material.dispose();
  this.mesh.geometry.dispose();

  if (!skipRaycasterRefresh){
    rayCaster.refresh();
  }

}

ObjectGroup.prototype.exportLightweight = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  this.updateBoundingBoxes();
  var exportObj = new Object();
  exportObj.isChangeable = this.isChangeable;
  exportObj.isSlippery = this.isSlippery;
  exportObj.isIntersectable = this.isIntersectable;
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  exportObj.matrixWorld = this.graphicsGroup.matrixWorld.elements;
  exportObj.position = this.graphicsGroup.position;
  exportObj.quaternion = new THREE.Quaternion().copy(this.graphicsGroup.quaternion);
  exportObj.childNames = [];
  exportObj.childWorkerIndices = [];
  exportObj.center = this.getInitialCenter();
  exportObj.boundingBoxes = [];
  this.childWorkerIdsByChildNames = new Object();
  var childWorkerIndexCtr = 0;
  for (var objName in this.group){
    exportObj.childNames.push(objName);
    exportObj.childWorkerIndices.push(childWorkerIndexCtr);
    this.childWorkerIdsByChildNames[objName] = childWorkerIndexCtr ++;
  }
  for (var i = 0; i<this.boundingBoxes.length; i++){
    exportObj.boundingBoxes.push({
      roygbivObjectName: this.boundingBoxes[i].roygbivObjectName,
      boundingBox: this.boundingBoxes[i]
    });
  }
  exportObj.mass = this.physicsBody.mass;
  exportObj.noMass = this.noMass;
  exportObj.cannotSetMass = this.cannotSetMass;
  exportObj.physicsPosition = {x: this.physicsBody.position.x, y: this.physicsBody.position.y, z: this.physicsBody.position.z};
  exportObj.physicsQuaternion = {x: this.physicsBody.quaternion.x, y: this.physicsBody.quaternion.y, z: this.physicsBody.quaternion.z, w: this.physicsBody.quaternion.w};
  exportObj.initialPhysicsPositionWhenGlued = this.initialPhysicsPositionWhenGlued;
  if (this.isPhysicsSimplified){
    exportObj.physicsSimplificationParameters = this.physicsSimplificationParameters;
    exportObj.isPhysicsSimplified = true;
  }
  return exportObj;
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
  if (this.isIntersectable){
    exportObj.isIntersectable = true;
  }else{
    exportObj.isIntersectable = false;
  }
  if (this.isColorizable){
    exportObj.isColorizable = true;
  }else{
    exportObj.isColorizable = false;
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
  if (this.mesh.material.uniforms.totalAOIntensity){
    exportObj.totalAOIntensity = this.mesh.material.uniforms.totalAOIntensity.value;
  }
  if (this.mesh.material.uniforms.totalEmissiveIntensity){
    exportObj.totalEmissiveIntensity = this.mesh.material.uniforms.totalEmissiveIntensity.value;
  }
  if (this.mesh.material.uniforms.totalEmissiveColor){
    exportObj.totalEmissiveColor = "#"+this.mesh.material.uniforms.totalEmissiveColor.value.getHexString();
  }
  exportObj.isRotationDirty = this.isRotationDirty;
  if (this.isPhysicsSimplified){
    exportObj.isPhysicsSimplified = true;
    this.physicsSimplificationParameters = {
      sizeX: this.physicsSimplificationParameters.sizeX,
      sizeY: this.physicsSimplificationParameters.sizeY,
      sizeZ: this.physicsSimplificationParameters.sizeZ,
      pbodyPosition: this.physicsBody.position, pbodyQuaternion: this.physicsBody.quaternion,
      physicsSimplificationObject3DPosition: this.physicsSimplificationObject3D.position,
      physicsSimplificationObject3DQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3D.quaternion),
      physicsSimplificationObject3DContainerPosition: this.physicsSimplificationObject3DContainer.position,
      physicsSimplificationObject3DContainerQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3DContainer.quaternion)
    };
    exportObj.physicsSimplificationParameters = this.physicsSimplificationParameters;
  }
  return exportObj;
}

ObjectGroup.prototype.getInitialCenter = function(){
  if (this.copiedInitialCenter){
    return this.copiedInitialCenter;
  }
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
  this.lastUpdatePosition.copy(this.mesh.position);
  this.lastUpdateQuaternion.copy(this.mesh.quaternion);
}

ObjectGroup.prototype.boundingBoxesNeedUpdate = function(){
  return !(Math.abs(this.lastUpdatePosition.x - this.mesh.position.x) < 0.1 &&
            Math.abs(this.lastUpdatePosition.y - this.mesh.position.y) < 0.1 &&
              Math.abs(this.lastUpdatePosition.z - this.mesh.position.z) < 0.1 &&
                Math.abs(this.lastUpdateQuaternion.x - this.mesh.quaternion.x) < 0.0001 &&
                  Math.abs(this.lastUpdateQuaternion.y - this.mesh.quaternion.y) < 0.0001 &&
                    Math.abs(this.lastUpdateQuaternion.z - this.mesh.quaternion.z) < 0.0001 &&
                      Math.abs(this.lastUpdateQuaternion.w - this.mesh.quaternion.w) < 0.0001);
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

ObjectGroup.prototype.visualiseBoundingBoxes = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  if (this.bbHelper){
    scene.remove(this.bbHelper);
  }
  var box3 = new THREE.Box3();
  for (var objName in this.group){
    var boundingBoxes = this.group[objName].boundingBoxes;
    for (var i = 0; i < boundingBoxes.length; i++){
      box3.expandByPoint(boundingBoxes[i].min);
      box3.expandByPoint(boundingBoxes[i].max);
    }
  }
  if (box3.min.x == box3.max.x){
    box3.max.x += 1;
    box3.min.x -= 1;
  }
  if (box3.min.y == box3.max.y){
    box3.max.y += 1;
    box3.min.y -= 1;
  }
  if (box3.min.z == box3.max.z){
    box3.max.z += 1;
    box3.min.z -= 1;
  }
  this.bbHelper = new THREE.Box3Helper(box3, LIME_COLOR);
  scene.add(this.bbHelper);
}

ObjectGroup.prototype.removeBoundingBoxesFromScene = function(){
  if (this.bbHelper){
    scene.remove(this.bbHelper);
  }
}

ObjectGroup.prototype.setSlippery = function(isSlippery){
  if (isSlippery){
    this.setFriction(0);
    this.isSlippery = true;
  }else{
    this.setFriction(friction);
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
  if (this.isPhysicsSimplified){
    if (this.pivotObject){
      obj.pivotObject.pseudoMesh.remove(obj.physicsSimplificationObject3DContainer);
      obj.physicsSimplificationObject3DContainer.position.copy(obj.mesh.position);
      obj.physicsSimplificationObject3DContainer.quaternion.copy(obj.mesh.quaternion);
      obj.physicsSimplificationObject3DContainer.updateMatrixWorld();
      obj.physicsSimplificationObject3DContainer.updateMatrix();
    }
    pseudoMesh.updateMatrix();
    pseudoMesh.updateMatrixWorld();
    this.updateSimplifiedPhysicsBody();
    this.physicsSimplificationObject3DContainer.quaternion.set(0, 0, 0, 1);
    this.physicsSimplificationObject3DContainer.position.sub(pseudoMesh.position);
    pseudoMesh.add(this.physicsSimplificationObject3DContainer);
  }
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
  var axisVector;
  if (axis == "x"){
    axisVector = THREE_AXIS_VECTOR_X;
    this.pivotObject.rotation.x += radians;
  }else if (axis == "y"){
    axisVector = THREE_AXIS_VECTOR_Y;
    this.pivotObject.rotation.y += radians;
  }else if (axis == "z"){
    axisVector = THREE_AXIS_VECTOR_Z;
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
  if (this.isPhysicsSimplified){
    this.physicsSimplificationObject3D.updateMatrix();
    this.physicsSimplificationObject3D.updateMatrixWorld();
    this.physicsSimplificationObject3D.matrixWorld.decompose(REUSABLE_VECTOR, REUSABLE_QUATERNION, REUSABLE_VECTOR_2);
    this.physicsBody.position.copy(REUSABLE_VECTOR);
    this.physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }

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
  var isIntersectable = this.isIntersectable;
  var isColorizable = this.isColorizable;
  var renderSide = this.renderSide;
  var blending = this.mesh.material.blending;
  var totalAlphaBeforeDetached = this.mesh.material.uniforms.totalAlpha.value;
  var totalAOIntensityBeforeDetached;
  var totalEmissiveIntensityBeforeDetached;
  var totalEmissiveColorBeforeDetached;
  var oldMaterial = this.mesh.material;
  var phsimplObj3DPos;
  var phsimplObj3DQuat;
  var phsimplContPos;
  var phsimplContQuat;
  if (this.isPhysicsSimplified){
    phsimplObj3DPos = this.physicsSimplificationObject3D.position.clone();
    phsimplObj3DQuat = this.physicsSimplificationObject3D.quaternion.clone();
    phsimplContPos = this.physicsSimplificationObject3DContainer.position.clone();
    phsimplContQuat = this.physicsSimplificationObject3DContainer.quaternion.clone();
  }
  if (this.mesh.material.uniforms.totalAOIntensity){
    totalAOIntensityBeforeDetached = this.mesh.material.uniforms.totalAOIntensity.value;
  }
  if (this.mesh.material.uniforms.totalEmissiveIntensity){
    totalEmissiveIntensityBeforeDetached = this.mesh.material.uniforms.totalEmissiveIntensity.value;
  }
  if (this.mesh.material.uniforms.totalEmissiveColor){
    totalEmissiveColorBeforeDetached = this.mesh.material.uniforms.totalEmissiveColor.value;
  }
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
  if (this.isPhysicsSimplified){
    newObjGroup.simplifyPhysics(this.physicsSimplificationParameters.sizeX, this.physicsSimplificationParameters.sizeY, this.physicsSimplificationParameters.sizeZ);
    newObjGroup.updateSimplifiedPhysicsBody();
  }
  newObjGroup.mesh.position.copy(copyPosition);
  newObjGroup.physicsBody.position.copy(copyPosition);
  newObjGroup.mesh.quaternion.copy(quaternionBeforeDetached);
  newObjGroup.physicsBody.quaternion.copy(physicsQuaternionBeforeDetached);
  newObjGroup.graphicsGroup.position.copy(newObjGroup.mesh.position);
  newObjGroup.graphicsGroup.quaternion.copy(newObjGroup.mesh.quaternion);
  this.glue();
  newObjGroup.isBasicMaterial = this.isBasicMaterial;
  if (this.isPhysicsSimplified){
    this.simplifyPhysics(this.physicsSimplificationParameters.sizeX, this.physicsSimplificationParameters.sizeY, this.physicsSimplificationParameters.sizeZ);
    this.physicsSimplificationObject3D.position.copy(phsimplObj3DPos);
    this.physicsSimplificationObject3D.quaternion.copy(phsimplObj3DQuat);
    this.physicsSimplificationObject3DContainer.position.copy(phsimplContPos);
    this.physicsSimplificationObject3DContainer.quaternion.copy(phsimplContQuat);
  }
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
  this.isIntersectable = isIntersectable;
  this.isColorizable = isColorizable;
  newObjGroup.isChangeable = isChangeable;
  newObjGroup.isIntersectable = isIntersectable;
  newObjGroup.isColorizable = isColorizable;
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
  if (this.mesh.material.uniforms.totalAOIntensity){
    this.mesh.material.uniforms.totalAOIntensity.value = totalAOIntensityBeforeDetached;
  }
  if (this.mesh.material.uniforms.totalEmissiveIntensity){
    this.mesh.material.uniforms.totalEmissiveIntensity.value = totalEmissiveIntensityBeforeDetached;
  }
  if (this.mesh.material.uniforms.totalEmissiveColor){
    this.mesh.material.uniforms.totalEmissiveColor.value = totalEmissiveColorBeforeDetached;
  }

  this.mesh.material = oldMaterial;

  if (!isHardCopy){
    newObjGroup.mesh.material = this.mesh.material;
    newObjGroup.softCopyParentName = this.name;
  }else{
    newObjGroup.mesh.material.uniforms.totalAlpha.value = this.mesh.material.uniforms.totalAlpha.value;
    if (newObjGroup.mesh.material.uniforms.totalAOIntensity){
      newObjGroup.mesh.material.uniforms.totalAOIntensity.value = this.mesh.material.uniforms.totalAOIntensity.value;
    }
    if (newObjGroup.mesh.material.uniforms.totalEmissiveIntensity){
      newObjGroup.mesh.material.uniforms.totalEmissiveIntensity.value = this.mesh.material.uniforms.totalEmissiveIntensity.value;
    }
    if (newObjGroup.mesh.material.uniforms.totalEmissiveColor){
      newObjGroup.mesh.material.uniforms.totalEmissiveColor.value = new THREE.Color().copy(this.mesh.material.uniforms.totalEmissiveColor.value);
    }
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
  newObjGroup.copiedInitialCenter = {x: newObjGroup.mesh.position.x, y: newObjGroup.mesh.position.y, z: newObjGroup.mesh.position.z};
  if (newObjGroup.isPhysicsSimplified){
    newObjGroup.updateSimplifiedPhysicsBody();
  }
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

ObjectGroup.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogBlendWithSkybox){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
      this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

ObjectGroup.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.worldMatrix;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}

ObjectGroup.prototype.unsimplifyPhysics = function(){
  physicsWorld.remove(this.physicsBody);
  this.physicsBody = this.originalPhysicsBody;
  physicsWorld.addBody(this.physicsBody);
  this.isPhysicsSimplified = false;
  delete this.physicsSimplificationObject3D;
  delete this.physicsSimplificationObject3DContainer;
  delete this.physicsSimplificationParameters;
  this.physicsBody.position.copy(this.mesh.position);
  this.physicsBody.quaternion.copy(this.mesh.quaternion);
}

ObjectGroup.prototype.simplifyPhysics = function(sizeX, sizeY, sizeZ){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  physicsWorld.remove(this.physicsBody);
  var box3 = new THREE.Box3();
  for (var i = 0; i<this.boundingBoxes.length; i++){
    box3.expandByPoint(this.boundingBoxes[i].min);
    box3.expandByPoint(this.boundingBoxes[i].max);
  }
  box3.getCenter(REUSABLE_VECTOR);
  var newPhysicsBody = physicsBodyGenerator.generateBoxBody({x: sizeX, y: sizeY, z: sizeZ, mass: this.physicsBody.mass, material: this.physicsBody.material});
  newPhysicsBody.position.copy(REUSABLE_VECTOR);
  newPhysicsBody.quaternion.copy(this.physicsBody.quaternion);
  this.physicsBody = newPhysicsBody;
  physicsWorld.addBody(this.physicsBody);
  this.isPhysicsSimplified = true;
  this.physicsSimplificationObject3D = new THREE.Object3D();
  this.physicsSimplificationObject3D.rotation.order = 'YXZ';
  this.physicsSimplificationObject3D.position.copy(this.physicsBody.position);
  this.physicsSimplificationObject3D.quaternion.copy(this.physicsBody.quaternion);
  this.physicsSimplificationObject3D.position.sub(this.mesh.position);
  this.physicsSimplificationObject3DContainer = new THREE.Object3D();
  this.physicsSimplificationObject3DContainer.position.copy(this.mesh.position);
  this.physicsSimplificationObject3DContainer.quaternion.copy(this.mesh.quaternion);
  this.physicsSimplificationObject3DContainer.add(this.physicsSimplificationObject3D);
  if (this.pivotObject){
    this.pivotObject.pseudoMesh.updateMatrix();
    this.pivotObject.pseudoMesh.updateMatrixWorld();
    this.updateSimplifiedPhysicsBody();
    this.pivotObject.pseudoMesh.getWorldPosition(REUSABLE_VECTOR);
    this.physicsSimplificationObject3DContainer.position.sub(REUSABLE_VECTOR);
    this.pivotObject.pseudoMesh.add(this.physicsSimplificationObject3DContainer);
    this.updateSimplifiedPhysicsBody();
  }
  this.physicsSimplificationParameters = {
    sizeX: sizeX, sizeY: sizeY, sizeZ: sizeZ,
    pbodyPosition: this.physicsBody.position, pbodyQuaternion: this.physicsBody.quaternion,
    physicsSimplificationObject3DPosition: this.physicsSimplificationObject3D.position,
    physicsSimplificationObject3DQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3D.quaternion),
    physicsSimplificationObject3DContainerPosition: this.physicsSimplificationObject3DContainer.position,
    physicsSimplificationObject3DContainerQuaternion: new CANNON.Quaternion().copy(this.physicsSimplificationObject3DContainer.quaternion)
  };
}
