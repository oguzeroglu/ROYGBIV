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

ObjectGroup.prototype.handleTextures = function(){
  var texturesObj = new Object();
  var hasTexture = false;
  for (var objName in this.group){
    var addedObject = this.group[objName];
    if (addedObject.hasDiffuseMap()){
      hasTexture = true;
      var tName = addedObject.name + ",diffuse";
      texturesObj[tName] = this.handleAtlasSize(addedObject.mesh.material.uniforms.diffuseMap.value);
    }
    if (addedObject.hasAlphaMap()){
      hasTexture = true;
      var tName = addedObject.name + ",alpha";
      if (addedObject.hasDiffuseMap()){
        addedObject.mesh.material.uniforms.alphaMap.value.offset.copy(
          addedObject.mesh.material.uniforms.diffuseMap.value.offset
        );
        addedObject.mesh.material.uniforms.alphaMap.value.updateMatrix();
      }
      texturesObj[tName] = this.handleAtlasSize(addedObject.mesh.material.uniforms.alphaMap.value);
    }
    if (addedObject.hasAOMap()){
      hasTexture = true;
      var tName = addedObject.name + ",ao";
      if (addedObject.hasDiffuseMap()){
        addedObject.mesh.material.uniforms.aoMap.value.offset.copy(
          addedObject.mesh.material.uniforms.diffuseMap.value.offset
        );
        addedObject.mesh.material.uniforms.aoMap.value.updateMatrix();
      }
      texturesObj[tName] = this.handleAtlasSize(addedObject.mesh.material.uniforms.aoMap.value);
    }
    if (addedObject.hasEmissiveMap()){
      hasTexture = true;
      var tName = addedObject.name + ",emissive";
      if (addedObject.hasDiffuseMap()){
        addedObject.mesh.material.uniforms.emissiveMap.value.offset.copy(
          addedObject.mesh.material.uniforms.diffuseMap.value.offset
        );
        addedObject.mesh.material.uniforms.emissiveMap.value.updateMatrix();
      }
      texturesObj[tName] = this.handleAtlasSize(addedObject.mesh.material.uniforms.emissiveMap.value);
    }
  }
  if (hasTexture){
    this.textureMerger = new TextureMerger(texturesObj);
  }
}

ObjectGroup.prototype.handleDisplacement = function(normalGeometry, childObj){
  if (!childObj.hasDisplacementMap()){
    return;
  }
  var displacementTexture = childObj.mesh.material.uniforms.displacementMap.value;
  var scale = childObj.mesh.material.uniforms.displacementInfo.value.x;
  var bias = childObj.mesh.material.uniforms.displacementInfo.value.y;
  if (childObj.hasDiffuseMap()){
    var offsetX = childObj.mesh.material.uniforms.diffuseMap.value.offset.x;
    var offsetY = childObj.mesh.material.uniforms.diffuseMap.value.offset.y;
    while (offsetX < 0){
      offsetX += 100;
    }
    while (offsetY < 0){
      offsetY += 100;
    }
    offsetX = offsetX - Math.floor(offsetX);
    offsetY = offsetY - Math.floor(offsetY);
    displacementTexture.offset.set(offsetX, offsetY);
  }
  displacementTexture.updateMatrix();
  new DisplacementCalculator().applyDisplacementMapToNormalGeometry(
    normalGeometry, displacementTexture, scale, bias
  );
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
    this.handleDisplacement(childGeom, childObj);
    miMap[mi] = childObj.name;
    for (var i = 0; i<childGeom.faces.length; i++){
      var color = childObj.mesh.material.uniforms.color.value;
      childGeom.faces[i].vertexColors.push(color, color, color);
      childGeom.faces[i].materialIndex = mi;
    }
    mi++;
    childObj.mesh.updateMatrix();
    pseudoGeometry.merge(childGeom, childObj.mesh.matrix);
  }

  var faces = pseudoGeometry.faces;
  var vertices = pseudoGeometry.vertices;
  var faceVertexUVs = pseudoGeometry.faceVertexUvs[0];
  var positions = new Float32Array(faces.length * 3 * 3);
  var colors = new Float32Array(faces.length * 3 * 3);
  var alphas = new Float32Array(faces.length * 3);
  var emissiveIntensities = new Float32Array(faces.length * 3);
  var aoIntensities = new Float32Array(faces.length * 3);
  var diffuseUVs = new Float32Array(faces.length * 3 * 2);
  var emissiveUVs = new Float32Array(faces.length * 3 * 2);
  var alphaUVs = new Float32Array(faces.length * 3 * 2);
  var aoUVs = new Float32Array(faces.length * 3 * 2);
  var positionsIndex = 0;
  var colorIndex = 0;
  var alphaIndex = 0;
  var emissiveIntensityIndex = 0;
  var aoIntensityIndex = 0;
  var diffuseUVIndex = 0;
  var emissiveUVIndex = 0;
  var alphaUVIndex = 0;
  var aoUVIndex = 0;
  for (var i = 0; i<faces.length; i++){
    var face = faces[i];
    var addedObject = addedObjects[miMap[face.materialIndex]];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var vertex1 = vertices[a];
    var vertex2 = vertices[b];
    var vertex3 = vertices[c];
    var color1 = face.vertexColors[0];
    var color2 = face.vertexColors[1];
    var color3 = face.vertexColors[2];
    // POSITIONS
    positions[positionsIndex ++] = vertex1.x;
    positions[positionsIndex ++] = vertex1.y;
    positions[positionsIndex ++] = vertex1.z;
    positions[positionsIndex ++] = vertex2.x;
    positions[positionsIndex ++] = vertex2.y;
    positions[positionsIndex ++] = vertex2.z;
    positions[positionsIndex ++] = vertex3.x;
    positions[positionsIndex ++] = vertex3.y;
    positions[positionsIndex ++] = vertex3.z;
    // COLORS
    colors[colorIndex ++] = color1.r;
    colors[colorIndex ++] = color1.g;
    colors[colorIndex ++] = color1.b;
    colors[colorIndex ++] = color2.r;
    colors[colorIndex ++] = color2.g;
    colors[colorIndex ++] = color2.b;
    colors[colorIndex ++] = color3.r;
    colors[colorIndex ++] = color3.g;
    colors[colorIndex ++] = color3.b;
    // ALPHA
    var alpha = addedObject.mesh.material.uniforms.alpha.value;
    alphas[alphaIndex ++] = alpha;
    alphas[alphaIndex ++] = alpha;
    alphas[alphaIndex ++] = alpha;
    // EMISSIVE INTENSITY
    var emissiveIntensity = addedObject.mesh.material.uniforms.emissiveIntensity.value;
    emissiveIntensities[emissiveIntensityIndex ++] = emissiveIntensity;
    emissiveIntensities[emissiveIntensityIndex ++] = emissiveIntensity;
    emissiveIntensities[emissiveIntensityIndex ++] = emissiveIntensity;
    // AO INTENSITY
    var aoIntensity = addedObject.mesh.material.uniforms.aoIntensity.value;
    aoIntensities[aoIntensityIndex ++] = aoIntensity;
    aoIntensities[aoIntensityIndex ++] = aoIntensity;
    aoIntensities[aoIntensityIndex ++] = aoIntensity;
    // DIFFUSE UVS
    if (addedObject.hasDiffuseMap()){
      var uv1 = this.getChildUV(addedObject, "diffuse", faceVertexUVs[i][0]);
      var uv2 = this.getChildUV(addedObject, "diffuse", faceVertexUVs[i][1]);
      var uv3 = this.getChildUV(addedObject, "diffuse", faceVertexUVs[i][2]);
      diffuseUVs[diffuseUVIndex ++] = uv1.x;
      diffuseUVs[diffuseUVIndex ++] = uv1.y;
      diffuseUVs[diffuseUVIndex ++] = uv2.x;
      diffuseUVs[diffuseUVIndex ++] = uv2.y;
      diffuseUVs[diffuseUVIndex ++] = uv3.x;
      diffuseUVs[diffuseUVIndex ++] = uv3.y;
    }else{
      diffuseUVs[diffuseUVIndex ++] = -100;
      diffuseUVs[diffuseUVIndex ++] = -100;
      diffuseUVs[diffuseUVIndex ++] = -100;
      diffuseUVs[diffuseUVIndex ++] = -100;
      diffuseUVs[diffuseUVIndex ++] = -100;
      diffuseUVs[diffuseUVIndex ++] = -100;
    }
    // EMISSIVE UVS
    if (addedObject.hasEmissiveMap()){
      var uv1 = this.getChildUV(addedObject, "emissive", faceVertexUVs[i][0]);
      var uv2 = this.getChildUV(addedObject, "emissive", faceVertexUVs[i][1]);
      var uv3 = this.getChildUV(addedObject, "emissive", faceVertexUVs[i][2]);
      emissiveUVs[emissiveUVIndex ++] = uv1.x;
      emissiveUVs[emissiveUVIndex ++] = uv1.y;
      emissiveUVs[emissiveUVIndex ++] = uv2.x;
      emissiveUVs[emissiveUVIndex ++] = uv2.y;
      emissiveUVs[emissiveUVIndex ++] = uv3.x;
      emissiveUVs[emissiveUVIndex ++] = uv3.y;
    }else{
      emissiveUVs[emissiveUVIndex ++] = -100;
      emissiveUVs[emissiveUVIndex ++] = -100;
      emissiveUVs[emissiveUVIndex ++] = -100;
      emissiveUVs[emissiveUVIndex ++] = -100;
      emissiveUVs[emissiveUVIndex ++] = -100;
      emissiveUVs[emissiveUVIndex ++] = -100;
    }
    // ALPHA UVS
    if (addedObject.hasAlphaMap()){
      var uv1 = this.getChildUV(addedObject, "alpha", faceVertexUVs[i][0]);
      var uv2 = this.getChildUV(addedObject, "alpha", faceVertexUVs[i][1]);
      var uv3 = this.getChildUV(addedObject, "alpha", faceVertexUVs[i][2]);
      alphaUVs[alphaUVIndex ++] = uv1.x;
      alphaUVs[alphaUVIndex ++] = uv1.y;
      alphaUVs[alphaUVIndex ++] = uv2.x;
      alphaUVs[alphaUVIndex ++] = uv2.y;
      alphaUVs[alphaUVIndex ++] = uv3.x;
      alphaUVs[alphaUVIndex ++] = uv3.y;
    }else{
      alphaUVs[alphaUVIndex ++] = -100;
      alphaUVs[alphaUVIndex ++] = -100;
      alphaUVs[alphaUVIndex ++] = -100;
      alphaUVs[alphaUVIndex ++] = -100;
      alphaUVs[alphaUVIndex ++] = -100;
      alphaUVs[alphaUVIndex ++] = -100;
    }
    // AO UVS
    if (addedObject.hasAOMap()){
      var uv1 = this.getChildUV(addedObject, "ao", faceVertexUVs[i][0]);
      var uv2 = this.getChildUV(addedObject, "ao", faceVertexUVs[i][1]);
      var uv3 = this.getChildUV(addedObject, "ao", faceVertexUVs[i][2]);
      aoUVs[aoUVIndex ++] = uv1.x;
      aoUVs[aoUVIndex ++] = uv1.y;
      aoUVs[aoUVIndex ++] = uv2.x;
      aoUVs[aoUVIndex ++] = uv2.y;
      aoUVs[aoUVIndex ++] = uv3.x;
      aoUVs[aoUVIndex ++] = uv3.y;
    }else{
      aoUVs[aoUVIndex ++] = -100;
      aoUVs[aoUVIndex ++] = -100;
      aoUVs[aoUVIndex ++] = -100;
      aoUVs[aoUVIndex ++] = -100;
      aoUVs[aoUVIndex ++] = -100;
      aoUVs[aoUVIndex ++] = -100;
    }

  }

  var positionsBufferAttribute = new THREE.BufferAttribute(positions, 3);
  var colorsBufferAttribute = new THREE.BufferAttribute(colors, 3);
  var alphasBufferAttribute = new THREE.BufferAttribute(alphas, 1);
  var emissiveIntensitiesBufferAttribute = new THREE.BufferAttribute(emissiveIntensities, 1);
  var aoIntensitiesBufferAttribute = new THREE.BufferAttribute(aoIntensities, 1);
  var diffuseUVsBufferAttribute = new THREE.BufferAttribute(diffuseUVs, 2);
  var emissiveUVsBufferAttribute = new THREE.BufferAttribute(emissiveUVs, 2);
  var alphaUVsBufferAttribute = new THREE.BufferAttribute(alphaUVs, 2);
  var aoUVsBufferAttribute = new THREE.BufferAttribute(aoUVs, 2);
  positionsBufferAttribute.setDynamic(false);
  colorsBufferAttribute.setDynamic(false);
  alphasBufferAttribute.setDynamic(false);
  emissiveIntensitiesBufferAttribute.setDynamic(false);
  aoIntensitiesBufferAttribute.setDynamic(false);
  diffuseUVsBufferAttribute.setDynamic(false);
  emissiveUVsBufferAttribute.setDynamic(false);
  alphaUVsBufferAttribute.setDynamic(false);
  aoUVsBufferAttribute.setDynamic(false);
  this.geometry.addAttribute('position', positionsBufferAttribute);
  this.geometry.addAttribute('color', colorsBufferAttribute);
  this.geometry.addAttribute('alpha', alphasBufferAttribute);
  this.geometry.addAttribute('emissiveIntensity', emissiveIntensitiesBufferAttribute);
  this.geometry.addAttribute('aoIntensity', aoIntensitiesBufferAttribute);
  this.geometry.addAttribute('diffuseUV', diffuseUVsBufferAttribute);
  this.geometry.addAttribute('emissiveUV', emissiveUVsBufferAttribute);
  this.geometry.addAttribute('alphaUV', alphaUVsBufferAttribute);
  this.geometry.addAttribute('aoUV', aoUVsBufferAttribute);

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
  this.mesh = new MeshGenerator(this.geometry).generateMergedMesh(graphicsGroup, this.textureMerger);
  this.previewMesh= this.mesh.clone();
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
  var axisText = "";
  if (normal.x == 0 && normal.y == 0 && normal.z == 1){
    axisText = "+Z";
  }
  if (normal.x == 0 && normal.y == 0 && normal.z == -1){
    axisText = "-Z";
  }
  if (normal.x == 0 && normal.y == 1 && normal.z == 0){
    axisText = "+Y";
  }
  if (normal.x == 0 && normal.y == -1 && normal.z == 0){
    axisText = "-Y";
  }
  if (normal.x == 1 && normal.y == 0 && normal.z == 0){
    axisText = "+X";
  }
  if (normal.x == -1 && normal.y == 0 && normal.z == 0){
    axisText = "-X";
  }
  var key = axisText;
  return key;
}

ObjectGroup.prototype.setBlending = function(blendingMode){
  for (var objName in this.group){
    this.group[objName].setBlending(blendingMode);
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
