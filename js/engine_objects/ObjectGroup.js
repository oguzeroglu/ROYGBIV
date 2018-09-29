var ObjectGroup = function(name, group){
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

}

ObjectGroup.prototype.handleAtlasSize = function(texture){
  if (!projectAtlasSize.width || ! projectAtlasSize.height){
    return texture;
  }
  var newWidth = projectAtlasSize.width;
  var newHeight = projectAtlasSize.height;
  var sourceWidth = texture.image.width;
  var sourceHeight = texture.image.height;
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = newWidth;
  tmpCanvas.height = newHeight;
  var tmpContext = tmpCanvas.getContext("2d");
  tmpContext.drawImage(
    texture.image, 0, 0, sourceWidth, sourceHeight, 0, 0, newWidth, newHeight
  );
  var txt = new THREE.CanvasTexture(tmpCanvas);
  txt.repeat.copy(texture.repeat);
  txt.offset.copy(texture.offset);
  txt.needsUpdate = true;
  return txt;
}

ObjectGroup.prototype.getChildUV = function(addedObject, textureType, originalUV){
  var range = this.textureMerger.ranges[addedObject.name + "," + textureType];
  return new THREE.Vector2(
    (originalUV.x / (1) * (range.endU - range.startU) + range.startU),
    (originalUV.y / (1) * (range.startV - range.endV) + range.endV)
  );
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

ObjectGroup.prototype.merge = function(){

  if (!this.textureMerger){
    this.handleTextures();
  }

  this.geometry = new THREE.BufferGeometry();
  var pseudoGeometry = new THREE.Geometry();

  var miMap = new Object();
  var mi = 0;
  for (var childName in this.group){
    var childObj = this.group[childName];
    var childGeom = childObj.getNormalGeometry();
    miMap[mi] = childObj.name;
    for (var i = 0; i<childGeom.faces.length; i++){
      childGeom.faces[i].materialIndex = mi;
    }
    mi++;
    childObj.mesh.updateMatrix();
    pseudoGeometry.merge(childGeom, childObj.mesh.matrix);
  }

  var indexCache = new Object();

  var max = 0;
  var faces = pseudoGeometry.faces;
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

  var indices = [];
  var vertices = pseudoGeometry.vertices;
  var faceVertexUVs = pseudoGeometry.faceVertexUvs[0];
  var positions = new Array((max + 1) * 3);
  var normals = new Array((max + 1) * 3);
  var colors = new Array((max + 1) * 3);
  var uvs = new Array((max + 1) * 2);
  var alphas = new Array(max + 1);
  var emissiveIntensities = new Array(max + 1);
  var aoIntensities = new Array(max + 1);
  var displacementInfos = new Array((max + 1) * 2);
  var textureInfos = new Array((max + 1) * 4);
  for (var i = 0; i<faces.length; i++){
    var face = faces[i];
    var addedObject = addedObjects[miMap[face.materialIndex]];
    var a = face.a;
    var b = face.b;
    var c = face.c;

    indices.push(a);
    indices.push(b);
    indices.push(c);

    var aSkipped = false;
    var bSkipped = false;
    var cSkipped = false;
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

    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];
    var normal = face.normal;
    var color = addedObject.material.color;
    var uv1 = faceVertexUVs[i][0];
    var uv2 = faceVertexUVs[i][1];
    var uv3 = faceVertexUVs[i][2];
    // POSITIONS
    if (!aSkipped){
      positions[3 * a] = vertex1.x;
      positions[(3 * a)+1] = vertex1.y;
      positions[(3 * a)+2] = vertex1.z;
    }
    if (!bSkipped){
      positions[3 * b] = vertex2.x;
      positions[(3 * b)+1] = vertex2.y;
      positions[(3 * b)+2] = vertex2.z;
    }
    if (!cSkipped){
      positions[3 * c] = vertex3.x;
      positions[(3 * c)+1] = vertex3.y;
      positions[(3 * c)+2] = vertex3.z;
    }
    if (!aSkipped){
      normals[3 * a] = normal.x;
      normals[(3 * a) + 1] = normal.y;
      normals[(3 * a) + 2] = normal.z;
    }
    if (!bSkipped){
      normals[3 * b] = normal.x;
      normals[(3 * b) + 1] = normal.y;
      normals[(3 * b) + 2] = normal.z;
    }
    if (!cSkipped){
      normals[3 * c] = normal.x;
      normals[(3 * c) + 1] = normal.y;
      normals[(3 * c) + 2] = normal.z;
    }
    // COLORS
    if (!aSkipped){
      colors[3 * a] = color.r;
      colors[(3 * a)+1] = color.g;
      colors[(3 * a)+2] = color.b;
    }
    if (!bSkipped){
      colors[3 * b] = color.r;
      colors[(3 * b)+1] = color.g;
      colors[(3 * b)+2] = color.b;
    }
    if (!cSkipped){
      colors[3 * c] = color.r;
      colors[(3 * c)+1] = color.g;
      colors[(3 * c)+2] = color.b;
    }
    // UV
    if (!aSkipped){
      uvs[2 * a] = uv1.x;
      uvs[(2 * a) + 1] = uv1.y;
    }
    if (!bSkipped){
      uvs[2 * b] = uv2.x;
      uvs[(2 * b) + 1] = uv2.y;
    }
    if (!cSkipped){
      uvs[2 * c] = uv3.x;
      uvs[(2 * c) + 1] = uv3.y;
    }
    // DISPLACEMENT INFOS
    if (!aSkipped){
      if (addedObject.hasDisplacementMap()){
        displacementInfos[2 * a] = addedObject.mesh.material.uniforms.displacementInfo.value.x;
        displacementInfos[(2 * a) + 1] = addedObject.mesh.material.uniforms.displacementInfo.value.y;
      }else{
        displacementInfos[2 * a] = -100;
        displacementInfos[(2 * a) + 1] = -100;
      }
    }
    if (!bSkipped){
      if (addedObject.hasDisplacementMap()){
        displacementInfos[2 * b] = addedObject.mesh.material.uniforms.displacementInfo.value.x;
        displacementInfos[(2 * b) + 1] = addedObject.mesh.material.uniforms.displacementInfo.value.y;
      }else{
        displacementInfos[2 * b] = -100;
        displacementInfos[(2 * b) + 1] = -100;
      }
    }
    if (!cSkipped){
      if (addedObject.hasDisplacementMap()){
        displacementInfos[2 * c] = addedObject.mesh.material.uniforms.displacementInfo.value.x;
        displacementInfos[(2 * c) + 1] = addedObject.mesh.material.uniforms.displacementInfo.value.y;
      }else{
        displacementInfos[2 * c] = -100;
        displacementInfos[(2 * c) + 1] = -100;
      }
    }
    // ALPHA
    var alpha = addedObject.mesh.material.uniforms.alpha.value;
    if (!aSkipped){
      alphas[a] = alpha;
    }
    if (!bSkipped){
      alphas[b] = alpha;
    }
    if (!cSkipped){
      alphas[c] = alpha;
    }
    // EMISSIVE INTENSITY
    var emissiveIntensity = addedObject.mesh.material.uniforms.emissiveIntensity.value;
    if (!aSkipped){
      emissiveIntensities[a] = emissiveIntensity;
    }
    if (!bSkipped){
      emissiveIntensities[b] = emissiveIntensity;
    }
    if (!cSkipped){
      emissiveIntensities[c] = emissiveIntensity;
    }
    // AO INTENSITY
    var aoIntensity = addedObject.mesh.material.uniforms.aoIntensity.value;
    if (!aSkipped){
      aoIntensities[a] = aoIntensity;
    }
    if (!bSkipped){
      aoIntensities[b] = aoIntensity;
    }
    if (!cSkipped){
      aoIntensities[c] = aoIntensity;
    }
    // TEXTURE INFOS
    if (!aSkipped){
      if (addedObject.hasDiffuseMap()){
        textureInfos[(4 * a)] = 10;
      }else{
        textureInfos[(4 * a)] = -10;
      }
      if (addedObject.hasEmissiveMap()){
        textureInfos[(4 * a) + 1] = 10;
      }else{
        textureInfos[(4 * a) + 1] = -10;
      }
      if (addedObject.hasAlphaMap()){
        textureInfos[(4 * a) + 2] = 10;
      }else{
        textureInfos[(4 * a) + 2] = -10;
      }
      if (addedObject.hasAOMap()){
        textureInfos[(4 * a) + 3] = 10;
      }else{
        textureInfos[(4 * a) + 3] = -10;
      }
    }
    if (!bSkipped){
      if (addedObject.hasDiffuseMap()){
        textureInfos[(4 * b)] = 10;
      }else{
        textureInfos[(4 * b)] = -10;
      }
      if (addedObject.hasEmissiveMap()){
        textureInfos[(4 * b) + 1] = 10;
      }else{
        textureInfos[(4 * b) + 1] = -10;
      }
      if (addedObject.hasAlphaMap()){
        textureInfos[(4 * b) + 2] = 10;
      }else{
        textureInfos[(4 * b) + 2] = -10;
      }
      if (addedObject.hasAOMap()){
        textureInfos[(4 * b) + 3] = 10;
      }else{
        textureInfos[(4 * b) + 3] = -10;
      }
    }
    if (!cSkipped){
      if (addedObject.hasDiffuseMap()){
        textureInfos[(4 * c)] = 10;
      }else{
        textureInfos[(4 * c)] = -10;
      }
      if (addedObject.hasEmissiveMap()){
        textureInfos[(4 * c) + 1] = 10;
      }else{
        textureInfos[(4 * c) + 1] = -10;
      }
      if (addedObject.hasAlphaMap()){
        textureInfos[(4 * c) + 2] = 10;
      }else{
        textureInfos[(4 * c) + 2] = -10;
      }
      if (addedObject.hasAOMap()){
        textureInfos[(4 * c) + 3] = 10;
      }else{
        textureInfos[(4 * c) + 3] = -10;
      }
    }
  }

  var indicesTypedArray = new Uint16Array(indices);
  var positionsTypedArray = new Float32Array(positions);
  var normalsTypedArray = new Float32Array(normals);
  var colorsTypedArray = new Float32Array(colors);
  var uvsTypedArray = new Float32Array(uvs);
  var displacementInfosTypedArray = new Float32Array(displacementInfos);
  var alphasTypedArray = new Float32Array(alphas);
  var emissiveIntensitiesTypedArray = new Float32Array(emissiveIntensities);
  var aoIntensitiesTypedArray = new Float32Array(aoIntensities);
  var textureInfosTypedArray = new Int8Array(textureInfos);

  var indicesBufferAttribute = new THREE.BufferAttribute(indicesTypedArray, 1);
  var positionsBufferAttribute = new THREE.BufferAttribute(positionsTypedArray, 3);
  var normalsBufferAttribute = new THREE.BufferAttribute(normalsTypedArray, 3);
  var colorsBufferAttribute = new THREE.BufferAttribute(colorsTypedArray, 3);
  var uvsBufferAttribute = new THREE.BufferAttribute(uvsTypedArray, 2);
  var displacementInfosBufferAttribute = new THREE.BufferAttribute(displacementInfosTypedArray, 2);
  var alphasBufferAttribute = new THREE.BufferAttribute(alphasTypedArray, 1);
  var emissiveIntensitiesBufferAttribute = new THREE.BufferAttribute(emissiveIntensitiesTypedArray, 1);
  var aoIntensitiesBufferAttribute = new THREE.BufferAttribute(aoIntensitiesTypedArray, 1);
  var textureInfosBufferAttribute = new THREE.BufferAttribute(textureInfosTypedArray, 4);
  indicesBufferAttribute.setDynamic(false);
  positionsBufferAttribute.setDynamic(false);
  normalsBufferAttribute.setDynamic(false);
  colorsBufferAttribute.setDynamic(false);
  uvsBufferAttribute.setDynamic(false);
  displacementInfosBufferAttribute.setDynamic(false);
  alphasBufferAttribute.setDynamic(false);
  emissiveIntensitiesBufferAttribute.setDynamic(false);
  aoIntensitiesBufferAttribute.setDynamic(false);
  textureInfosBufferAttribute.setDynamic(false);
  this.geometry.setIndex(indicesBufferAttribute);
  this.geometry.addAttribute('position', positionsBufferAttribute);
  this.geometry.addAttribute('normal', normalsBufferAttribute);
  this.geometry.addAttribute('color', colorsBufferAttribute);
  this.geometry.addAttribute('uv', uvsBufferAttribute);
  this.geometry.addAttribute('displacementInfo', displacementInfosBufferAttribute);
  this.geometry.addAttribute('alpha', alphasBufferAttribute);
  this.geometry.addAttribute('emissiveIntensity', emissiveIntensitiesBufferAttribute);
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
  var previewGraphicsGroup = new THREE.Group();
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
  previewGraphicsGroup.position.copy(physicsBody.position);

  var gridSystemNamesMap = new Object();

  for (var objectName in group){
    var addedObject = group[objectName];
    if (selectedAddedObject && selectedAddedObject.name == objectName){
      selectedAddedObject = 0;
    }
    addedObject.setAttachedProperties();

    this.totalVertexCount += addedObject.mesh.geometry.attributes.position.count;
    // GLUE PHYSICS ************************************************
    var shape = addedObject.physicsBody.shapes[0];
    physicsBody.addShape(shape, addedObject.physicsBody.position.vsub(referenceVector), addedObject.physicsBody.quaternion);
    // GLUE GRAPHICS ***********************************************
    addedObject.mesh.position.sub(referenceVectorTHREE);
    addedObject.previewMesh.position.sub(referenceVectorTHREE);
    graphicsGroup.add(addedObject.mesh);
    previewGraphicsGroup.add(addedObject.previewMesh);
    // PREPARE GRAPHICS FOR CLICK EVENTS ***************************
    addedObject.mesh.addedObject = 0;
    addedObject.previewMesh.addedObject = 0;
    addedObject.mesh.objectGroupName = this.name;
    addedObject.previewMesh.objectGroupName = this.name;
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
    addedObject.indexInParent = previewGraphicsGroup.children.length - 1;
  }

  this.gridSystemNames = Object.keys(gridSystemNamesMap);

  physicsBody.addedObject = this;

  this.merge();
  this.destroyParts();
  this.mesh = new MeshGenerator(this.geometry).generateMergedMesh(graphicsGroup, this);
  this.previewMesh= new THREE.Mesh(this.mesh.geometry, this.mesh.material);
  this.previewMesh.position.copy(this.mesh.position);
  this.previewMesh.quaternion.copy(this.mesh.quaternion);
  this.previewMesh.rotation.copy(this.mesh.rotation);
  this.mesh.objectGroupName = this.name;
  this.previewMesh.objectGroupName = this.name;
  scene.add(this.mesh);
  previewScene.add(this.previewMesh);
  physicsWorld.addBody(physicsBody);

  this.graphicsGroup = graphicsGroup;
  this.previewGraphicsGroup = previewGraphicsGroup;

  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.previewGraphicsGroup.position.copy(this.previewMesh.position);
  this.previewGraphicsGroup.quaternion.copy(this.previewMesh.quaternion);
  this.graphicsGroup.updateMatrix();
  this.previewGraphicsGroup.updateMatrix();

  this.physicsBody = physicsBody;
  this.initQuaternion = this.previewGraphicsGroup.quaternion.clone();

  this.collisionCallbackFunction = function(collisionEvent){
    if (!collisionEvent.body.addedObject || !this.isVisibleOnThePreviewScene()){
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
    var quatX = this.previewMesh.quaternion.x;
    var quatY = this.previewMesh.quaternion.y;
    var quatZ = this.previewMesh.quaternion.z;
    var quatW = this.previewMesh.quaternion.w;
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
    addedObject.destroy();
    delete addedObjects[objName];
    disabledObjectNames[objName] = 1;
  }
}

ObjectGroup.prototype.detach = function(){
  if (selectedObjectGroup && selectedObjectGroup.name == this.name){
    selectedObjectGroup = 0;
  }
  this.graphicsGroup.position.copy(this.mesh.position);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.previewGraphicsGroup.position.copy(this.previewMesh.position);
  this.previewGraphicsGroup.quaternion.copy(this.previewMesh.quaternion);
  this.graphicsGroup.updateMatrixWorld();
  this.previewGraphicsGroup.updateMatrixWorld();
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
      this.group[objectName].previewMesh.getWorldQuaternion(REUSABLE_QUATERNION);
      worldQuaternions[objectName] = REUSABLE_QUATERNION.clone();
      this.group[objectName].previewMesh.getWorldPosition(REUSABLE_VECTOR);
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
  for (var i = this.previewGraphicsGroup.children.length -1; i>=0; i--){
    this.previewGraphicsGroup.remove(this.previewGraphicsGroup.children[i]);
  }
  this.destroy(true);
  for (var objectName in this.group){
    var addedObject = this.group[objectName];

    physicsWorld.add(addedObject.physicsBody);
    scene.add(addedObject.mesh);
    previewScene.add(addedObject.previewMesh);

    addedObject.mesh.objectGroupName = 0;
    addedObject.previewMesh.objectGroupName = 0;
    addedObject.mesh.addedObject = addedObject;
    addedObject.previewMesh.addedObject = addedObject;

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
    addedObject.previewMesh.position.copy(addedObject.mesh.position);
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
    addedObject.previewMesh.quaternion.copy(addedObject.mesh.quaternion);
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

}

ObjectGroup.prototype.setQuaternion = function(axis, val){
  if (axis == "x"){
    this.graphicsGroup.quaternion.x = val;
    this.previewGraphicsGroup.quaternion.x = val;
    this.physicsBody.quaternion.x = val;
    this.initQuaternion.x = val;
    this.physicsBody.initQuaternion.x = val;
    this.mesh.quaternion.x = val;
    this.previewMesh.quaternion.x = val;
  }else if (axis == "y"){
    this.graphicsGroup.quaternion.y = val;
    this.previewGraphicsGroup.quaternion.y = val;
    this.physicsBody.quaternion.y = val;
    this.initQuaternion.y = val;
    this.physicsBody.initQuaternion.y = val;
    this.mesh.quaternion.y = val;
    this.previewMesh.quaternion.y = val;
  }else if (axis == "z"){
    this.graphicsGroup.quaternion.z = val;
    this.previewGraphicsGroup.quaternion.z = val;
    this.physicsBody.quaternion.z = val;
    this.initQuaternion.z = val;
    this.physicsBody.initQuaternion.z = val;
    this.mesh.quaternion.z = val;
    this.previewMesh.quaternion.z = val;
  }else if (axis == "w"){
    this.graphicsGroup.quaternion.w = val;
    this.previewGraphicsGroup.quaternion.w = val;
    this.physicsBody.quaternion.w = val;
    this.initQuaternion.w = val;
    this.physicsBody.initQuaternion.w = val;
    this.mesh.quaternion.w = val;
    this.previewMesh.quaternion.w = val;
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

  this.previewMesh.quaternion.copy(this.mesh.quaternion);
  this.physicsBody.quaternion.copy(this.mesh.quaternion);
  this.graphicsGroup.quaternion.copy(this.mesh.quaternion);
  this.previewGraphicsGroup.quaternion.copy(this.mesh.quaternion);

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

}

ObjectGroup.prototype.translate = function(axis, amount, fromScript){
  var previewMesh = this.previewMesh;
  var physicsBody = this.physicsBody;
  var x = previewMesh.position.x;
  var y = previewMesh.position.y;
  var z = previewMesh.position.z;
  if (axis == "x"){
    previewMesh.position.set(
      x + amount,
      y,
      z
    );
  }else if (axis == "y"){
    previewMesh.position.set(
      x,
      y + amount,
      z
    );
  }else if (axis == "z"){
    previewMesh.position.set(
      x,
      y,
      z + amount
    );
  }
  physicsBody.position.copy(previewMesh.position);
  this.previewGraphicsGroup.position.copy(previewMesh.position);
}

ObjectGroup.prototype.resetPosition = function(){
  this.previewMesh.position.copy(this.mesh.position);
  this.previewGraphicsGroup.position.copy(this.previewMesh);
}

ObjectGroup.prototype.destroy = function(isUndo){
  if (selectedObjectGroup && selectedObjectGroup.name == this.name){
    selectedObjectGroup = 0;
  }
  scene.remove(this.mesh);
  previewScene.remove(this.previewMesh);
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

  exportObj.quaternionX = this.initQuaternion.x;
  exportObj.quaternionY = this.initQuaternion.y;
  exportObj.quaternionZ = this.initQuaternion.z;
  exportObj.quaternionW = this.initQuaternion.w;

  exportObj.isBasicMaterial = this.isBasicMaterial;
  exportObj.isPhongMaterial = this.isPhongMaterial;

  if (!(typeof this.blendingMode == "undefined")){
    exportObj.blendingMode = this.blendingMode;
  }else{
    exportObj.blendingMode = "NORMAL_BLENDING";
  }

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

ObjectGroup.prototype.preparePhysicsInfo = function(){
  var info = "";
  var childrenCount = Object.keys(this.group).length;
  var id = this.physicsBody.id;
  var mass = this.physicsBody.mass;
  var positionX = this.physicsBody.position.x;
  var positionY = this.physicsBody.position.y;
  var positionZ = this.physicsBody.position.z;
  var quaternionX = this.physicsBody.quaternion.x;
  var quaternionY = this.physicsBody.quaternion.y;
  var quaternionZ = this.physicsBody.quaternion.z;
  var quaternionW = this.physicsBody.quaternion.w;
  info = childrenCount + "," + id + "," + mass + "," + positionX + "," + positionY
                       + "," + positionZ + "," + quaternionX
                       + "," + quaternionY + "," + quaternionZ
                       + "," + quaternionW;
  for (var objectName in this.group){
    var object = this.group[objectName];
    info += "," + object.preparePhysicsInfo();
  }
  return info;
}

ObjectGroup.prototype.getFaceNormals = function(){

}

ObjectGroup.prototype.getFaceInfos = function(){

}

ObjectGroup.prototype.getFaceNameFromNormal = function(normal){

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

ObjectGroup.prototype.updateBoundingBoxes = function(){
  for (var objName in this.group){
    this.group[objName].updateBoundingBoxes(this.boundingBoxes);
  }
}

ObjectGroup.prototype.generateBoundingBoxes = function(){
  this.boundingBoxes = [];
  this.previewMesh.updateMatrixWorld();
  this.previewGraphicsGroup.position.copy(this.previewMesh.position);
  this.previewGraphicsGroup.quaternion.copy(this.previewMesh.quaternion);
  this.previewGraphicsGroup.updateMatrixWorld();
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
      physicsBody.addContactMaterial(contact);
    }
  }
}
