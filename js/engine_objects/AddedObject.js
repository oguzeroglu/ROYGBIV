var AddedObject = function(name, type, metaData, material, mesh, physicsBody, destroyedGrids){
  this.name = name;
  this.type = type;
  this.metaData = metaData;
  this.material = material;
  this.mesh = mesh;
  this.physicsBody = physicsBody;
  this.destroyedGrids = destroyedGrids;

  this.physicsBody.addedObject = this;

  if (mesh instanceof BasicMaterial){
    this.hasBasicMaterial = true;
  }

  if (this.destroyedGrids){
    for (var gridName in this.destroyedGrids){
      this.destroyedGrids[gridName].destroyedAddedObject = this.name;
    }
  }

  var baseGridSystemName = this.metaData["gridSystemName"];
  var baseGridSystem = gridSystems[baseGridSystemName];
  if (baseGridSystem && !(this.metaData["baseGridSystemAxis"])){
    this.metaData["baseGridSystemAxis"] = baseGridSystem.axis.toUpperCase();
  }

  this.metaData["widthSegments"] = 1;
  this.metaData["heightSegments"] = 1;
  if (type == "box"){
    this.metaData["depthSegments"] = 1;
  }else if (type == "sphere"){
    this.metaData["widthSegments"] = 8;
    this.metaData["heightSegments"] = 6;
  }

  this.metaData["textureRepeatU"] = 1;
  this.metaData["textureRepeatV"] = 1;

  this.associatedTexturePack = 0;

  objectSelectedByCommand = false;

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.initQuaternion = this.mesh.quaternion.clone();

  this.collisionCallbackFunction = function(collisionEvent){
    if (!collisionEvent.body.addedObject || !this.isVisibleOnThePreviewScene()){
      return;
    }
    if (isPhysicsWorkerEnabled()){
      // WE WILL HANDLE PHYSICS CALCULATIONS INSIDE THE WORKER
      return;
    }
    var targetObjectName = collisionEvent.body.addedObject.name;
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

  this.reusableVec3 = new THREE.Vector3();
  this.reusableVec3_2 = new THREE.Vector3();
  this.reusableVec3_3 = new THREE.Vector3();
}

AddedObject.prototype.export = function(){

  if (this.texturePackSetWithScript){
    this.texturePackSetWithScript = false;
    this.resetTexturePackAfterAnimation();
  }

  var exportObject = new Object();
  exportObject["type"] = this.type;
  exportObject["roygbivMaterialName"] = this.material.roygbivMaterialName;
  var exportDestroyedGrids = new Object();
  for (var gridName in this.destroyedGrids){
    exportDestroyedGrids[gridName] = this.destroyedGrids[gridName].export();
  }
  exportObject["destroyedGrids"] = exportDestroyedGrids;
  exportObject["metaData"] = Object.assign({}, this.metaData);
  exportObject["associatedTexturePack"] = this.associatedTexturePack;

  if (this.mass){
    exportObject["mass"] = this.mass;
  }
  if (this.isDynamicObject){
    exportObject["isDynamicObject"] = this.isDynamicObject;
  }

  exportObject["opacity"] = this.mesh.material.uniforms.alpha.value;
  exportObject["aoMapIntensity"] = this.mesh.material.uniforms.aoIntensity.value;
  exportObject["emissiveIntensity"] = this.mesh.material.uniforms.emissiveIntensity.value;
  if (this.material.isMeshPhongMaterial){
    exportObject["shininess"] = this.material.shininess;
  }

  var diffuseMap = this.mesh.material.uniforms.diffuseMap.value;
  var alphaMap = this.mesh.material.uniforms.alphaMap.value;
  var aoMap = this.mesh.material.uniforms.aoMap.value;
  var emissiveMap = this.mesh.material.uniforms.emissiveMap.value;
  var normalMap = this.material.normalMap;
  var specularMap = this.material.specularMap;
  var displacementMap = this.mesh.material.uniforms.displacementMap.value;

  if (this.hasDiffuseMap()){
    exportObject["diffuseRoygbivTexturePackName"] = diffuseMap.roygbivTexturePackName;
    exportObject["diffuseRoygbivTextureName"] =  diffuseMap.roygbivTextureName;
    exportObject["textureOffsetX"] = diffuseMap.offset.x;
    exportObject["textureOffsetY"] = diffuseMap.offset.y;
    exportObject["textureRepeatU"] = diffuseMap.repeat.x;
    exportObject["textureRepeatV"] = diffuseMap.repeat.y;
  }
  if (this.hasAlphaMap()){
    exportObject["alphaRoygbivTexturePackName"] = alphaMap.roygbivTexturePackName;
    exportObject["alphaRoygbivTextureName"] = alphaMap.roygbivTextureName;
  }
  if (this.hasAOMap()){
    exportObject["aoRoygbivTexturePackName"] = aoMap.roygbivTexturePackName;
    exportObject["aoRoygbivTextureName"] = aoMap.roygbivTextureName;
  }
  if (this.hasEmissiveMap()){
    exportObject["emissiveRoygbivTexturePackName"] = emissiveMap.roygbivTexturePackName;
    exportObject["emissiveRoygbivTextureName"] = emissiveMap.roygbivTextureName;
  }
  if (normalMap){
    exportObject["normalRoygbivTexturePackName"] = this.material.normalMap.roygbivTexturePackName;
    exportObject["normalRoygbivTextureName"] = this.material.normalMap.roygbivTextureName;
  }
  if (specularMap){
    exportObject["specularRoygbivTexturePackName"] = this.material.specularMap.roygbivTexturePackName;
    exportObject["specularRoygbivTextureName"] = this.material.specularMap.roygbivTextureName;
  }
  if (this.hasDisplacementMap()){
    exportObject["displacementRoygbivTexturePackName"] = displacementMap.roygbivTexturePackName;
    exportObject["displacementRoygbivTextureName"] = displacementMap.roygbivTextureName;
    exportObject["displacementScale"] = this.mesh.material.uniforms.displacementInfo.value.x;
    exportObject["displacementBias"] = this.mesh.material.uniforms.displacementInfo.value.y;
  }

  exportObject.rotationX = this.rotationX;
  exportObject.rotationY = this.rotationY;
  exportObject.rotationZ = this.rotationZ;

  if (!this.parentObjectName){
    exportObject.quaternionX = this.mesh.quaternion.x;
    exportObject.quaternionY = this.mesh.quaternion.y;
    exportObject.quaternionZ = this.mesh.quaternion.z;
    exportObject.quaternionW = this.mesh.quaternion.w;
    exportObject.pQuaternionX = this.physicsBody.quaternion.x;
    exportObject.pQuaternionY = this.physicsBody.quaternion.y;
    exportObject.pQuaternionZ = this.physicsBody.quaternion.z;
    exportObject.pQuaternionW = this.physicsBody.quaternion.w;
  }else{
    exportObject.quaternionX = this.qxWhenAttached;
    exportObject.quaternionY = this.qyWhenAttached;
    exportObject.quaternionZ = this.qzWhenAttached;
    exportObject.quaternionW = this.qwWhenAttached;
    exportObject.pQuaternionX = this.pqxWhenAttached;
    exportObject.pQuaternionY = this.pqyWhenAttached;
    exportObject.pQuaternionZ = this.pqzWhenAttached;
    exportObject.pQuaternionW = this.pqwWhenAttached;
    exportObject.positionXWhenAttached = this.positionXWhenAttached;
    exportObject.positionYWhenAttached = this.positionYWhenAttached;
    exportObject.positionZWhenAttached = this.positionZWhenAttached;
  }

  if (!(typeof this.blendingMode == "undefined")){
    exportObject.blendingMode = this.blendingMode;
  }else{
    exportObject.blendingMode = "NORMAL_BLENDING";
  }

  var manualDisplacementMap = this.metaData["manualDisplacementMap"];
  var manualDisplacementScale = this.metaData["manualDisplacementScale"];
  var manualDisplacementBias = this.metaData["manualDisplacementBias"];
  if (!(typeof manualDisplacementMap == UNDEFINED) && !(typeof manualDisplacementScale == UNDEFINED)
          && !(typeof manualDisplacementBias == UNDEFINED)){
      exportObject.manualDisplacementInfo = manualDisplacementMap+
                      PIPE+manualDisplacementScale+PIPE+manualDisplacementBias;
  }

  if (this.metaData.isSlippery){
    exportObject.isSlippery = true;
  }else{
    exportObject.isSlippery = false;
  }

  if (this.areaVisibilityConfigurations){
    exportObject.areaVisibilityConfigurations = this.areaVisibilityConfigurations;
  }
  if (this.areaSideConfigurations){
    exportObject.areaSideConfigurations = this.areaSideConfigurations;
  }

  return exportObject;
}

AddedObject.prototype.forceColor = function(r, g, b, a){
  if (a < 0){
    a = 0;
  }
  if (a > 1){
    a = 1;
  }
  this.mesh.material.uniforms.forcedColor.value.set(a, r, g, b);
}

AddedObject.prototype.resetColor = function(){
  this.mesh.material.uniforms.forcedColor.value.set(-50, 0, 0, 0);
}

AddedObject.prototype.applyAreaConfiguration = function(areaName){
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

AddedObject.prototype.getSideInArea = function(areaName){
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

AddedObject.prototype.setSideInArea = function(areaName, side){
  if (!this.areaSideConfigurations){
    this.areaSideConfigurations = new Object();
  }
  this.areaSideConfigurations[areaName] = side;
}

AddedObject.prototype.getVisibilityInArea = function(areaName){
  if (this.areaVisibilityConfigurations){
    if (!(typeof this.areaVisibilityConfigurations[areaName] == UNDEFINED)){
      return this.areaVisibilityConfigurations[areaName];
    }
  }
  return true;
}

AddedObject.prototype.setVisibilityInArea = function(areaName, isVisible){
  if (!this.areaVisibilityConfigurations){
    this.areaVisibilityConfigurations = new Object();
  }
  this.areaVisibilityConfigurations[areaName] = isVisible;
}

AddedObject.prototype.loadState = function(){
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
}

AddedObject.prototype.saveState = function(){
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
}

AddedObject.prototype.handleRenderSide = function(val){
  this.metaData["renderSide"] = val;
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

AddedObject.prototype.isSlicable = function(){
  if (this.type != "surface"){
    return false;
  }
  if (this.metaData.widthSegments == 1 && this.metaData.heightSegments == 1){
    return true;
  }
  return false;
}

AddedObject.prototype.sliceSurfaceInHalf = function(type){
  var geomKey = (
    "PlaneBufferGeometry" + PIPE +
    this.metaData.width + PIPE + this.metaData.height + PIPE +
    this.metaData.widthSegments + PIPE + this.metaData.heightSegments
  );
  var originalGeometry = geometryCache[geomKey];
  var normals = [], positions = [], uvs = [0, 0, 1, 1, 0, 1];
  var subIndices;
  var indices = originalGeometry.index.array;
  if (type == 0){
    subIndices = [indices[0], indices[1], indices[2]];
  }else if (type == 1){
    subIndices = [indices[3], indices[4], indices[5]];
  }else if (type == 2){
    subIndices = [indices[1], indices[4], indices[0]];
  }else if (type == 3){
    subIndices = [indices[2], indices[4], indices[0]]
  }

  var newGeometry;

  if (type == 0 || type == 1 || type == 2 || type == 3){
    this.metaData.slicedType = type;
    for (var i = 0; i<subIndices.length; i++){
      for (var i2 = 0; i2<3; i2++){
        positions.push(originalGeometry.attributes.position.array[
          (3 * subIndices[i]) + i2
        ]);
        normals.push(originalGeometry.attributes.normal.array[
          (3 * subIndices[i]) + i2
        ]);
      }
    }

    var newGeometryKey = (
      "SlicedPlaneBufferGeometry" + PIPE +
      this.metaData.width + PIPE + this.metaData.height + PIPE + type
    );
    newGeometry = geometryCache[newGeometryKey];
    if (!newGeometry){
      newGeometry = new THREE.BufferGeometry();
      newGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
      newGeometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
      newGeometry.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
      geometryCache[newGeometryKey] = newGeometry;
    }
  }else{
    delete this.metaData.slicedType;
    newGeometry = originalGeometry;
  }
  scene.remove(this.mesh);
  var newMesh = new THREE.Mesh(newGeometry, this.mesh.material);
  newMesh.position.copy(this.mesh.position);
  newMesh.quaternion.copy(this.mesh.quaternion);
  newMesh.addedObject = this;
  this.mesh = newMesh;
  scene.add(this.mesh);
}

AddedObject.prototype.syncProperties = function(refObject){
  // TEXTURE OFFSETS
  if (refObject.hasDiffuseMap() && this.hasDiffuseMap()){
    var refTexture = refObject.mesh.material.uniforms.diffuseMap.value;
    var srcTexture = this.mesh.material.uniforms.diffuseMap.value;
    srcTexture.offset.x = refTexture.offset.x;
    srcTexture.offset.y = refTexture.offset.y;
    srcTexture.initOffsetXSet = false;
    srcTexture.updateMatrix();
  }
  // OPACITY
  var refOpacity = refObject.mesh.material.uniforms.alpha.value;
  this.updateOpacity(refOpacity);
  this.initOpacitySet = false;
  // AO INTENSITY
  var refAOIntensity = refObject.mesh.material.uniforms.aoIntensity.value;
  this.mesh.material.uniforms.aoIntensity.value = refAOIntensity
  // EMISSIVE INTENSITY
  var refMaterial = refObject.mesh.material;
  var refEmissiveIntensity = refMaterial.uniforms.emissiveIntensity.value;
  this.mesh.material.uniforms.emissiveIntensity.value = refEmissiveIntensity;
  this.initEmissiveIntensitySet = false;
  this.initEmissiveIntensity = refEmissiveIntensity;
  // DISPLACEMENT
  var refDispX = refObject.mesh.material.uniforms.displacementInfo.value.x;
  var refDispY = refObject.mesh.material.uniforms.displacementInfo.value.y;
  this.mesh.material.uniforms.displacementInfo.value.x = refDispX;
  this.mesh.material.uniforms.displacementInfo.value.y = refDispY;
  this.initDisplacementScaleSet = false;
  this.initDisplacementBiasSet = false;
}

AddedObject.prototype.setAttachedProperties = function(){
  this.qxWhenAttached = this.mesh.quaternion.x;
  this.qyWhenAttached = this.mesh.quaternion.y;
  this.qzWhenAttached = this.mesh.quaternion.z;
  this.qwWhenAttached = this.mesh.quaternion.w;
  this.pqxWhenAttached = this.physicsBody.quaternion.x;
  this.pqyWhenAttached = this.physicsBody.quaternion.y;
  this.pqzWhenAttached = this.physicsBody.quaternion.z;
  this.pqwWhenAttached = this.physicsBody.quaternion.w;
  this.positionXWhenAttached = this.mesh.position.x;
  this.positionYWhenAttached = this.mesh.position.y;
  this.positionZWhenAttached = this.mesh.position.z;
}

AddedObject.prototype.getTextureUniform = function(texture){
  if (textureUniformCache[texture.uuid]){
    return textureUniformCache[texture.uuid];
  }
  var uniform = new THREE.Uniform(texture);
  textureUniformCache[texture.uuid] = uniform;
  return uniform;
}

AddedObject.prototype.hasEmissiveMap = function(){
  return (this.mesh.material.uniforms.textureFlags2.value.x > 0);
}

AddedObject.prototype.unMapEmissive = function(){
  this.mesh.material.uniforms.emissiveMap = this.getTextureUniform(nullTexture);
  this.mesh.material.uniforms.textureFlags2.value.x = -10;
}

AddedObject.prototype.mapEmissive = function(emissiveMap){
  this.mesh.material.uniforms.emissiveMap = this.getTextureUniform(emissiveMap);
  this.mesh.material.uniforms.textureFlags2.value.x = 10;
}

AddedObject.prototype.hasDisplacementMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.w > 0);
}

AddedObject.prototype.unMapDisplacement = function(){
  this.mesh.material.uniforms.displacementMap = this.getTextureUniform(nullTexture);
  this.mesh.material.uniforms.textureFlags.value.w = -10;
}

AddedObject.prototype.mapDisplacement = function(displacementTexture){
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    console.error("Displacement mapping is not supported for this device. Use applyDisplacementMap command instead.");
    return;
  }
  this.mesh.material.uniforms.displacementMap = this.getTextureUniform(displacementTexture);
  this.mesh.material.uniforms.textureFlags.value.w = 10;
}

AddedObject.prototype.hasAOMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.z > 0);
}

AddedObject.prototype.unMapAO = function(){
  this.mesh.material.uniforms.aoMap = this.getTextureUniform(nullTexture);
  this.mesh.material.uniforms.textureFlags.value.z = -10;
}

AddedObject.prototype.mapAO = function(aoTexture){
  this.mesh.material.uniforms.aoMap = this.getTextureUniform(aoTexture);
  this.mesh.material.uniforms.textureFlags.value.z = 10;
}

AddedObject.prototype.hasAlphaMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.y > 0);
}

AddedObject.prototype.unMapAlpha = function(){
  this.mesh.material.uniforms.alphaMap = this.getTextureUniform(nullTexture);
  this.mesh.material.uniforms.textureFlags.value.y = -10;
}

AddedObject.prototype.mapAlpha = function(alphaTexture){
  this.mesh.material.uniforms.alphaMap = this.getTextureUniform(alphaTexture);
  this.mesh.material.uniforms.textureFlags.value.y = 10;
}

AddedObject.prototype.hasDiffuseMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.x > 0);
}

AddedObject.prototype.unMapDiffuse = function(){
  this.mesh.material.uniforms.diffuseMap = this.getTextureUniform(nullTexture);
  this.mesh.material.uniforms.textureFlags.value.x = -10;
}

AddedObject.prototype.mapDiffuse = function(diffuseTexture){
  this.mesh.material.uniforms.diffuseMap = this.getTextureUniform(diffuseTexture);
  this.mesh.material.uniforms.textureFlags.value.x = 10;
  diffuseTexture.updateMatrix();
  this.mesh.material.uniforms.textureMatrix.value = diffuseTexture.matrix;
}

AddedObject.prototype.incrementOpacity = function(val){
  this.mesh.material.uniforms.alpha.value += val;
}

AddedObject.prototype.updateOpacity = function(val){
  this.mesh.material.uniforms.alpha = new THREE.Uniform(val);
}

AddedObject.prototype.updateMVMatrix = function(){
  this.mesh.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;
}

AddedObject.prototype.handleMirror = function(axis, property){
  var texturesStack = this.getTextureStack();
  if (axis == "T"){
    this.metaData["mirrorT"] = property.toUpperCase();
  }
  if (axis == "S"){
    this.metaData["mirrorS"] = property.toUpperCase();
  }
  if (axis == "ST"){
    this.metaData["mirrorT"] = property.toUpperCase();
    this.metaData["mirrorS"] = property.toUpperCase();
  }
  for (var i = 0; i < texturesStack.length; i++){
    var texture = texturesStack[i];
    if (property.toUpperCase() == "ON"){
      if (axis == "T"){
        texture.wrapT = THREE.MirroredRepeatWrapping;
      }else if (axis == "S"){
        texture.wrapS = THREE.MirroredRepeatWrapping;
      }else if (axis == "ST"){
        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;
      }
    }else if (property.toUpperCase() == "OFF"){
      if (axis == "T"){
        texture.wrapT = THREE.RepeatWrapping;
      }else if (axis == "S"){
        texture.wrapS = THREE.RepeatWrapping;
      }else if (axis == "ST"){
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
      }
    }
    texture.needsUpdate = true;
  }
}

AddedObject.prototype.getTextureStack = function(){
  var texturesStack = [];
  if (this.hasDiffuseMap()){
    texturesStack.push(this.mesh.material.uniforms.diffuseMap.value);
  }
  if (this.hasAlphaMap()){
    texturesStack.push(this.mesh.material.uniforms.alphaMap.value);
  }
  if (this.hasAOMap()){
    texturesStack.push(this.mesh.material.uniforms.aoMap.value);
  }
  if (this.hasEmissiveMap()){
    texturesStack.push(this.mesh.material.uniforms.emissiveMap.value);
  }
  if (this.material.normalMap){
    texturesStack.push(this.material.normalMap);
  }
  if (this.material.specularMap){
    texturesStack.push(this.material.specularMap);
  }
  if (this.hasDisplacementMap()){
    texturesStack.push(this.mesh.material.uniforms.displacementMap.value);
  }
  return texturesStack;
}

AddedObject.prototype.getPositionAtAxis = function(axis){
  if (axis.toLowerCase() == "x"){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere"){
      return parseInt(this.metaData["centerX"]);
    }else if (this.type == "surface"){
      return parseInt(this.metaData["positionX"]);
    }
  }else if (axis.toLowerCase() == "y"){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere"){
      return parseInt(this.metaData["centerY"]);
    }else if (this.type == "surface"){
      return parseInt(this.metaData["positionY"]);
    }
  }else if (axis.toLowerCase() == "z"){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere"){
      return parseInt(this.metaData["centerZ"]);
    }else if (this.type == "surface"){
      return parseInt(this.metaData["positionZ"]);
    }
  }
}

AddedObject.prototype.resetPosition = function(){
  var mesh = this.mesh;
  var physicsBody = this.physicsBody;
  if (this.type == "box" || this.type == "ramp" || this.type == "sphere"){
    mesh.position.x = this.metaData["centerX"];
    mesh.position.y = this.metaData["centerY"];
    mesh.position.z = this.metaData["centerZ"];
  }else if (this.type == "surface"){
    mesh.position.x = this.metaData["positionX"];
    mesh.position.y = this.metaData["positionY"];
    mesh.position.z = this.metaData["positionZ"];
  }

  physicsBody.position.copy(mesh.position);
}

AddedObject.prototype.translate = function(axis, amount, fromScript){
  var physicsBody = this.physicsBody;
  var x = this.mesh.position.x;
  var y = this.mesh.position.y;
  var z = this.mesh.position.z;
  if (axis == "x"){
    this.mesh.position.set(
      x + amount,
      y,
      z
    );
  }else if (axis == "y"){
    this.mesh.position.set(
      x,
      y + amount,
      z
    );
  }else if (axis == "z"){
    this.mesh.position.set(
      x,
      y,
      z + amount
    );
  }

  physicsBody.position.copy(this.mesh.position);

  if (!fromScript){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere"){
      this.metaData["centerX"] = this.mesh.position.x;
      this.metaData["centerY"] = this.mesh.position.y;
      this.metaData["centerZ"] = this.mesh.position.z;
    }else if (this.type == "surface"){
      this.metaData["positionX"] = this.mesh.position.x;
      this.metaData["positionY"] = this.mesh.position.y;
      this.metaData["positionZ"] = this.mesh.position.z;
    }
  }

  rayCaster.updateObject(this);

}

AddedObject.prototype.rotate = function(axis, radians, fromScript){

  if (this.type == "surface"){
    this.rotateSurface(axis, radians, fromScript);
  }else if (this.type == "box"){
    this.rotateBox(axis, radians, fromScript);
  }else if (this.type == "ramp"){
    this.rotateRamp(axis, radians, fromScript);
  }else if (this.type == "sphere"){
    this.rotateSphere(axis, radians, fromScript);
  }

  if (!fromScript){
    if (axis == "x"){
      this.rotationX += radians;
    }else if (axis == "y"){
      this.rotationY += radians;
    }else if (axis == "z"){
      this.rotationZ += radians;
    }
    this.initQuaternion.copy(this.mesh.quaternion);
  }

  rayCaster.updateObject(this);

}

AddedObject.prototype.setPhysicsAfterRotationAroundPoint = function(axis, radians){
  if (this.type == "surface"){
    this.setSurfacePhysicsAfterRotationAroundPoint(axis, radians);
  }else if (this.type == "box"){
    this.setBoxPhysicsAfterRotationAroundPoint(axis, radians);
  }else if (this.type == "ramp"){
    this.setRampPhysicsAfterRotationAroundPoint(axis, radians);
  }else if (this.type == "sphere"){
    this.setSpherePhysicsAfterRotationAroundPoint(axis, radians);
  }
  this.physicsBody.position.copy(this.mesh.position);
}

AddedObject.prototype.setSurfacePhysicsAfterRotationAroundPoint = function(axis, radians){
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;
  if (gridSystemAxis == "XY"){
    physicsBody.quaternion.copy(this.mesh.quaternion);
  }else if (gridSystemAxis == "XZ"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_Y, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }
}

AddedObject.prototype.setSpherePhysicsAfterRotationAroundPoint = function(axis, radians){
  var physicsBody = this.physicsBody;
  physicsBody.quaternion.copy(this.mesh.quaternion);
}

AddedObject.prototype.setBoxPhysicsAfterRotationAroundPoint = function(axis, radians){
  var physicsBody = this.physicsBody;
  physicsBody.quaternion.copy(this.mesh.quaternion);
}

AddedObject.prototype.setRampPhysicsAfterRotationAroundPoint = function(axis, radians){
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;
  if (gridSystemAxis == "XY"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "XZ"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }
}

AddedObject.prototype.rotateSphere = function(axis, radians, fromScript){
  var mesh = this.mesh;
  var physicsBody = this.physicsBody;
  if (axis == "x"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_X,
      radians
    );
  }else if (axis == "y"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Y,
      radians
    );
  }else if (axis == "z"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Z,
      radians
    );
  }
  physicsBody.quaternion.copy(mesh.quaternion);
  if (!fromScript){
    physicsBody.initQuaternion.copy(
      physicsBody.quaternion
    );
  }
}

AddedObject.prototype.rotateRamp = function(axis, radians, fromScript){
  var mesh = this.mesh;
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;
  if (axis == "x"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_X,
      radians
    );
  }else if (axis == "y"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Y,
      radians
    );
  }else if (axis == "z"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Z,
      radians
    );
  }
  if (gridSystemAxis == "XY"){
    REUSABLE_QUATERNION.copy(mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "XZ"){
    REUSABLE_QUATERNION.copy(mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }
  if (!fromScript){
    physicsBody.initQuaternion.copy(
      physicsBody.quaternion
    );
    this.initQuaternion.copy(this.mesh.quaternion);
  }
}

AddedObject.prototype.rotateSurface = function(axis, radians, fromScript){
  var mesh = this.mesh;
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;

  if (axis == "x"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_X,
      radians
    );
  }else if (axis == "y"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Y,
      radians
    );
  }else if (axis == "z"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Z,
      radians
    );
  }
  if (gridSystemAxis == "XY"){
    physicsBody.quaternion.copy(mesh.quaternion);
  }else if (gridSystemAxis == "XZ"){
    REUSABLE_QUATERNION.copy(mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_Y, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }
  if (!fromScript){
    physicsBody.initQuaternion.copy(
      physicsBody.quaternion
    );
    this.initQuaternion.copy(this.mesh.quaternion);
  }
}

AddedObject.prototype.rotateBox = function(axis, radians, fromScript){
  var mesh = this.mesh;
  var physicsBody = this.physicsBody;
  if (axis == "x"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_X,
      radians
    );
  }else if (axis == "y"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Y,
      radians
    );
  }else if (axis == "z"){
    mesh.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Z,
      radians
    );
  }
  physicsBody.quaternion.copy(mesh.quaternion);
  if (!fromScript){
    physicsBody.initQuaternion.copy(
      physicsBody.quaternion
    );
  }
}

AddedObject.prototype.setCannonQuaternionFromTHREE = function(){
  this.physicsBody.quaternion.copy(this.mesh.quaternion);
  if (this.type == "ramp" || this.type == "surface"){
    if (this.gridSystemAxis == "XZ" || this.gridSystemAxis == "XY" || this.gridSystemAxis == "YZ"){
      if (!(this.type == "surface" && (this.gridSystemAxis == "XY" || this.gridSystemAxis == "YZ"))){
        this.physicsBody.rotation.y += (Math.PI / 2);
      }else{
        if (this.type == "surface" && this.gridSystemAxis == "YZ"){
          this.mesh.rotation.y -= (Math.PI / 2);
        }
      }
    }
  }
}

AddedObject.prototype.setMass = function(mass){
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

AddedObject.prototype.destroy = function(){
  if (selectedAddedObject && selectedAddedObject.name == this.name){
    selectedAddedObject = 0;
  }
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  if (this.destroyedGrids){
    for (var gridName in this.destroyedGrids){
      this.destroyedGrids[gridName].destroyedAddedObject = 0;
    }
  }
  objectSelectedByCommand = false;

  this.dispose();

  rayCaster.refresh();

}

AddedObject.prototype.dispose = function(){

  if (this.mesh.material.uniforms.diffuseMap.value){
    this.mesh.material.uniforms.diffuseMap.value.dispose();
  }
  if (this.mesh.material.uniforms.alphaMap.value){
    this.mesh.material.uniforms.alphaMap.value.dispose();
  }
  if (this.mesh.material.uniforms.aoMap.value){
    this.mesh.material.uniforms.aoMap.value.dispose();
  }
  if (this.mesh.material.uniforms.displacementMap.value){
    this.mesh.material.uniforms.displacementMap.value.dispose();
  }
  if (this.mesh.material.uniforms.emissiveMap.value){
    this.mesh.material.uniforms.emissiveMap.value.dispose();
  }

  if (this.material.normalMap){
    this.material.normalMap.dispose();
  }
  if (this.material.specularMap){
    this.material.specularMap.dispose();
  }

  this.mesh.material.dispose();
}

AddedObject.prototype.mapTexturePack = function(texturePack, fromScript){

  if (fromScript && !this.texturePackSetWithScript){
    this.texturePackSetWithScript = true;
    if (this.hasDiffuseMap() && this.mesh.material.uniforms.diffuseMap.value.roygbivTextureName){
      this.oldMap = this.mesh.material.uniforms.diffuseMap.value;
      this.oldMapName = this.mesh.material.uniforms.diffuseMap.value.roygbivTextureName;
    }
    if (this.hasAlphaMap() && this.mesh.material.uniforms.alphaMap.value.roygbivTextureName){
      this.oldAlphaMap = this.mesh.material.uniforms.alphaMap.value;
      this.oldAlphaMapName = this.mesh.material.uniforms.alphaMap.value.roygbivTextureName;
    }
    if (this.hasAOMap() && this.mesh.material.uniforms.aoMap.value.roygbivTextureName){
      this.oldAoMap = this.mesh.material.uniforms.aoMap.value;
      this.oldAoMapName = this.mesh.material.uniforms.aoMap.value.roygbivTextureName;
    }
    if (this.hasEmissiveMap() && this.mesh.material.uniforms.emissiveMap.value.roygbivTextureName){
      this.oldEmissiveMap = this.mesh.material.uniforms.emissiveMap.value;
      this.oldEmissiveMapName = this.mesh.material.uniforms.emissiveMap.value.roygbivTextureName;
    }
    if (this.material.normalMap && this.material.normalMap.roygbivTextureName){
      this.oldNormalMap = this.material.normalMap.clone();
      this.oldNormalMapName = this.material.normalMap.roygbivTextureName;
    }
    if (this.material.specularMap && this.material.specularMap.roygbivTextureName){
      this.oldSpecularMap = this.material.specularMap.clone();
      this.oldSpecularMapName = this.material.specularMap.roygbivTextureName;
    }
    if (this.hasDisplacementMap() && this.mesh.material.uniforms.displacementMap.value.roygbivTextureName){
      this.oldDisplacementMap = this.mesh.material.uniforms.displacementMap.value;
      this.oldDisplacementMapName = this.mesh.material.uniforms.displacementMap.value.roygbivTextureName;
    }

    this.oldWidthSegments = this.metaData["widthSegments"];
    this.oldHeightSegments = this.metaData["heightSegments"];
    if (this.type == "box"){
      this.oldDepthSegments = this.metaData["depthSegments"];
    }

  }

  this.resetMaps();

  if (texturePack.hasDiffuse){
    this.mapDiffuse(texturePack.diffuseTexture);
    if  (!fromScript){
      this.mesh.material.uniforms.diffuseMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.diffuseMap.value.roygbivTextureName = 0;
    }
    if (this.adjustTextureOffsetXOnTexturePackMap){
      this.mesh.material.uniforms.diffuseMap.value.offset.x = this.adjustTextureOffsetXOnTexturePackMap;
      this.mesh.material.uniforms.diffuseMap.value.updateMatrix();
    }
    if (this.adjustTextureOffsetYOnTexturePackMap){
      this.mesh.material.uniforms.diffuseMap.value.offset.y = this.adjustTextureOffsetYOnTexturePackMap;
      this.mesh.material.uniforms.diffuseMap.value.updateMatrix();
    }
    this.mesh.material.uniforms.diffuseMap.value.needsUpdate = true;
  }
  if (texturePack.hasAlpha){
    this.mapAlpha(texturePack.alphaTexture);
    if (!fromScript){
      this.mesh.material.uniforms.alphaMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.alphaMap.value.roygbivTextureName = 0;
    }
    this.mesh.material.uniforms.alphaMap.value.needsUpdate = true;
  }
  if (texturePack.hasAO){
    this.mapAO(texturePack.aoTexture);
    if (!fromScript){
      this.mesh.material.uniforms.aoMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.aoMap.value.roygbivTextureName = 0;
    }
    this.mesh.material.uniforms.aoMap.value.needsUpdate = true;
  }
  if (texturePack.hasEmissive){
    this.mapEmissive(texturePack.emissiveTexture);
    if (!fromScript){
      this.mesh.material.uniforms.emissiveMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.emissiveMap.value.roygbivTextureName = 0;
    }
    this.mesh.material.uniforms.emissiveMap.value.needsUpdate = true;
  }
  if (texturePack.hasNormal){
    if (!this.hasBasicMaterial){
      this.material.normalMap = texturePack.normalTexture.clone();
      if (!fromScript){
        this.material.normalMap.roygbivTexturePackName = texturePack.name;
        this.material.normalMap.roygbivTextureName = 0;
      }
      this.material.normalMap.needsUpdate = true;
    }
  }
  if (texturePack.hasSpecular){
    if (this.material.isMeshPhongMaterial){
      this.material.specularMap = texturePack.specularTexture.clone();
      if (!fromScript){
        this.material.specularMap.roygbivTexturePackName = texturePack.name;
        this.material.specularMap.roygbivTextureName = 0;
      }
      this.material.specularMap.needsUpdate = true;
    }
  }
  if (texturePack.hasHeight && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    this.mapDisplacement(texturePack.heightTexture);
    if (!fromScript){
      this.mesh.material.uniforms.displacementMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.displacementMap.value.roygbivTextureName = 0;
    }
    this.mesh.material.uniforms.displacementMap.value.needsUpdate = true;
  }

  if (this.textureRepeatUOnTexturePackMap && this.textureRepeatVOnTexturePackMap){
    this.adjustTextureRepeat(
      this.textureRepeatUOnTexturePackMap,
      this.textureRepeatVOnTexturePackMap
    );
  }

  if (!fromScript){
    this.associatedTexturePack = texturePack.name;
  }
}

AddedObject.prototype.resetTexturePackAfterAnimation = function(){
  this.resetMaps();
  if (this.associatedTexturePack){
    this.mapTexturePack(
      texturePacks[this.associatedTexturePack]
    );
  }
  if (this.oldMap){
    var cloneMap = this.oldMap;
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldMapName;
    this.oldMap = 0;
    this.mapDiffuse(cloneMap);
  }
  if (this.oldAoMap){
    var cloneMap = this.oldAoMap;
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldAoMapName;
    this.oldAoMap = 0;
    this.mapAO(cloneMap);
  }
  if (this.oldAlphaMap){
    var cloneMap = this.oldAlphaMap;
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldAlphaMapName;
    this.oldAlphaMap = 0;
    this.mapAlpha(cloneMap);
  }
  if (this.oldNormalMap){
    this.material.normalMap = this.oldNormalMap;
    this.material.normalMap.needsUpdate = true;
    this.material.normalMap.roygbivTextureName = this.oldNormalMapName;
  }
  if (this.oldSpecularMap){
    this.material.specularMap = this.oldSpecularMap;
    this.material.specularMap.needsUpdate = true;
    this.material.specularMap.roygbivTextureName = this.oldSpecularMapName;
  }
  if (this.oldEmissiveMap){
    var cloneMap = this.oldEmissiveMap;
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldEmissiveMapName;
    this.oldEmissiveMap = 0;
    this.mapEmissive(cloneMap);
  }
  if (this.oldDisplacementMap){
    var cloneMap = this.oldDisplacementMap;
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldDisplacementMapName;
    this.oldDisplacementMap = 0;
    this.mapDisplacement(cloneMap);
  }

  if (this.metaData["widthSegments"] && this.oldWidthSegments){
    if (this.metaData["widthSegments"] != this.oldWidthSegments){
      this.segmentGeometry(true, this.oldWidthSegments);
      this.oldWidthSegments = 0;
    }
  }
}

AddedObject.prototype.resetAssociatedTexturePack = function(){
  this.associatedTexturePack = 0;
}

AddedObject.prototype.segmentGeometry = function(isCustom, count, returnGeometry){
  var newGometry;
  if (this.type == "surface"){
    var width = this.metaData["width"];
    var height = this.metaData["height"];
    if (!isCustom){
      var geomKey = (
        "PlaneBufferGeometry" + PIPE +
        width + PIPE + height + PIPE +
        planeWidthSegments + PIPE + planeHeightSegments
      );
      newGeometry = geometryCache[geomKey];
      if (!newGeometry){
        newGeometry = new THREE.PlaneBufferGeometry(width, height, planeWidthSegments, planeHeightSegments);
        geometryCache[geomKey] = newGeometry;
      }
    }else{
      if (!isNaN(count)){
        if (returnGeometry){
          var geomKey = (
            "PlaneGeometry" + PIPE +
            width + PIPE + height + PIPE +
            count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneGeometry(width, height, count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "PlaneBufferGeometry" + PIPE +
            width + PIPE + height + PIPE +
            count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneBufferGeometry(width, height, count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }else{
        if (returnGeometry){
          var geomKey = (
            "PlaneGeometry" + PIPE +
            width + PIPE + height + PIPE +
            count.width + PIPE + count.height
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneGeometry(width, height, count.width, count.height);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "PlaneBufferGeometry" + PIPE +
            width + PIPE + height + PIPE +
            count.width + PIPE + count.height
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneBufferGeometry(width, height, count.width, count.height);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }
    }
  }else if (this.type == "ramp"){
    var rampWidth = this.metaData["rampWidth"];
    var rampHeight = this.metaData["rampHeight"];
    if (!isCustom){
      var geomKey = (
        "PlaneBufferGeometry" + PIPE +
        rampWidth + PIPE + rampHeight + PIPE +
        planeWidthSegments + PIPE + planeHeightSegments
      );
      newGeometry = geometryCache[geomKey];
      if (!newGeometry){
        newGeometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, planeWidthSegments, planeHeightSegments);
        geometryCache[geomKey] = newGeometry;
      }
    }else{
      if (!isNaN(count)){
        if (returnGeometry){
          var geomKey = (
            "PlaneGeometry" + PIPE +
            rampWidth + PIPE + rampHeight + PIPE +
            count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "PlaneBufferGeometry" + PIPE +
            rampWidth + PIPE + rampHeight + PIPE +
            count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }else{
        if (returnGeometry){
          var geomKey = (
            "PlaneGeometry" + PIPE +
            rampWidth + PIPE + rampHeight + PIPE +
            count.width + PIPE + count.height
          );
          newGeometry = geometryCache[geomKey]
          if (!newGeometry){
            newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, count.width, count.height);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "PlaneBufferGeometry" + PIPE +
            rampWidth + PIPE + rampHeight + PIPE +
            count.width + PIPE + count.height
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, count.width, count.height);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }
    }
  }else if (this.type == "box"){
    var boxSizeX = this.metaData["boxSizeX"];
    var boxSizeY = this.metaData["boxSizeY"];
    var boxSizeZ = this.metaData["boxSizeZ"];
    if (!isCustom){
      var geomKey = (
        "BoxBufferGeometry" + PIPE +
        boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
        boxWidthSegments + PIPE + boxHeightSegments + PIPE +boxDepthSegments
      );
      newGeometry = geometryCache[geomKey];
      if (!newGeometry){
        newGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ, boxWidthSegments, boxHeightSegments, boxDepthSegments);
        geometryCache[geomKey] = newGeometry;
      }
    }else{
      if (!isNaN(count)){
        if (returnGeometry){
          var geomKey = (
            "BoxGeometry" + PIPE +
            boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
            count + PIPE + count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, count, count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "BoxBufferGeometry" + PIPE +
            boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
            count + PIPE + count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ, count, count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }else{
        if (returnGeometry){
          var geomKey = (
            "BoxGeometry" + PIPE +
            boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
            count.width + PIPE + count.height + PIPE + count.depth
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, count.width, count.height, count.depth);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "BoxBufferGeometry" + PIPE +
            boxSizeX + PIPE + boxSizeY + PIPE + boxSizeZ + PIPE +
            count.width + PIPE + count.height + PIPE + count.depth
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ, count.width, count.height, count.depth);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }
    }
  }else if (this.type == "sphere"){
    var radius = this.metaData["radius"];
    if (!isCustom){
      var geomKey = (
        "SphereBufferGeometry" + PIPE +
        Math.abs(radius) + PIPE +
        sphereWidthSegments + PIPE + sphereHeightSegments
      );
      newGeometry = geometryCache[geomKey];
      if (!newGeometry){
        newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius), sphereWidthSegments, sphereHeightSegments);
        geometryCache[geomKey] = newGeometry;
      }
    }else{
      if (!isNaN(count)){
        if (count < 8){
          count = 8;
        }
        if (returnGeometry){
          var geomKey = (
            "SphereGeometry" + PIPE +
            Math.abs(radius) + PIPE +
            count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.SphereGeometry(Math.abs(radius), count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "SphereBufferGeometry" + PIPE +
            Math.abs(radius) + PIPE +
            count + PIPE + count
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius), count, count);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }else{
        if (count.width < 8){
          count.width = 8;
        }
        if (count.height < 6){
          count.height = 6;
        }
        if (returnGeometry){
          var geomKey = (
            "SphereGeometry" + PIPE +
            Math.abs(radius) + PIPE +
            count.width + PIPE + count.height
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.SphereGeometry(Math.abs(radius), count.width, count.height);
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "SphereBufferGeometry" + PIPE +
            Math.abs(radius) + PIPE +
            count.width + PIPE + count.height
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius), count.width, count.height);
            geometryCache[geomKey] = newGeometry;
          }
        }
      }
    }
  }

  if (returnGeometry){
    return newGeometry;
  }

  var newMesh = new THREE.Mesh(newGeometry, this.mesh.material);
  newMesh.position.x = this.mesh.position.x;
  newMesh.position.y = this.mesh.position.y;
  newMesh.position.z = this.mesh.position.z;
  newMesh.rotation.x = this.mesh.rotation.x;
  newMesh.rotation.y = this.mesh.rotation.y;
  newMesh.rotation.z = this.mesh.rotation.z;

  scene.remove(this.mesh);
  this.mesh = newMesh;
  this.mesh.addedObject = this;
  scene.add(this.mesh);

  if (this.type == "surface" || this.type == "ramp"){
    if (!isCustom){
      this.metaData["widthSegments"] = planeWidthSegments;
      this.metaData["heightSegments"] = planeHeightSegments;
    }else{
      if (isNaN(count)){
        this.metaData["widthSegments"] = count.width;
        this.metaData["heightSegments"] = count.height;
      }else{
        this.metaData["widthSegments"] = count;
        this.metaData["heightSegments"] = count;
      }
    }
  }else if(this.type == "box"){
    if (!isCustom){
      this.metaData["widthSegments"] = boxWidthSegments;
      this.metaData["heightSegments"] = boxHeightSegments;
      this.metaData["depthSegments"] = boxDepthSegments;
    }else{
      if (isNaN(count)){
        this.metaData["widthSegments"] = count.width;
        this.metaData["heightSegments"] = count.height;
        this.metaData["depthSegments"] = count.depth;
      }else{
        this.metaData["widthSegments"] = count;
        this.metaData["heightSegments"] = count;
        this.metaData["depthSegments"] = count;
      }
    }
  }else if (this.type == "sphere"){
    if (!isCustom){
      this.metaData["widthSegments"] = sphereWidthSegments;
      this.metaData["heightSegments"] = sphereHeightSegments;
    }else{
      if (isNaN(count)){
        this.metaData["widthSegments"] = count.width;
        this.metaData["heightSegments"] = count.height;
      }else{
        this.metaData["widthSegments"] = count;
        this.metaData["heightSegments"] = count;
      }
    }
  }

  var manualDisplacementMap = this.metaData["manualDisplacementMap"];
  var manualDisplacementScale = this.metaData["manualDisplacementScale"];
  var manualDisplacementBias = this.metaData["manualDisplacementBias"];
  if (!(typeof manualDisplacementMap == UNDEFINED) && !(typeof manualDisplacementScale == UNDEFINED) && !(typeof manualDisplacementBias == UNDEFINED)){
    var dispTexture = textures[manualDisplacementMap];
    if (dispTexture && (dispTexture instanceof THREE.Texture)){
      this.applyDisplacementMap(dispTexture, manualDisplacementMap, manualDisplacementScale, manualDisplacementBias);
    }
  }

}

AddedObject.prototype.resetMaps = function(resetAssociatedTexturePack){
  this.unMapDiffuse();
  this.unMapAlpha();
  this.unMapAO();
  this.unMapDisplacement();
  this.unMapEmissive();
  this.material.normalMap = undefined;
  this.material.specularMap = undefined;
  if (resetAssociatedTexturePack){
    this.associatedTexturePack = 0;
  }
}

AddedObject.prototype.isTextured = function(){
  return (
    this.hasDiffuseMap() ||
    this.hasAlphaMap() ||
    this.hasAOMap() ||
    this.hasEmissiveMap() ||
    this.material.normalMap ||
    this.material.specularMap ||
    this.hasDisplacementMap()
  );
}

AddedObject.prototype.refreshTextueMatrix = function(){
  if (this.hasDiffuseMap()){
    this.mesh.material.uniforms.diffuseMap.value.updateMatrix();
  }
  if (this.hasAlphaMap()){
    this.mesh.material.uniforms.alphaMap.value.updateMatrix();
  }
  if (this.hasAOMap()){
    this.mesh.material.uniforms.aoMap.value.updateMatrix();
  }
  if (this.hasEmissiveMap()){
    this.mesh.material.uniforms.emissiveMap.value.updateMatrix();
  }
  if (this.material.normalMap){

  }
  if (this.material.specularMap){

  }
  if (this.hasDisplacementMap()){
    this.mesh.material.uniforms.displacementMap.value.updateMatrix();
  }
}

AddedObject.prototype.adjustTextureRepeat = function(repeatU, repeatV){
  if (repeatU){
    this.metaData["textureRepeatU"] = repeatU;
  }else{
    repeatU = this.metaData["textureRepeatU"];
  }
  if (repeatV){
    this.metaData["textureRepeatV"] = repeatV;
  }else{
    repeatV = this.metaData["textureRepeatV"];
  }
  if (this.hasDiffuseMap()){
    this.mesh.material.uniforms.diffuseMap.value.repeat.set(repeatU, repeatV);
    this.mesh.material.uniforms.diffuseMap.value.updateMatrix();
  }
  if (this.hasAlphaMap()){
    this.mesh.material.uniforms.alphaMap.value.repeat.set(repeatU, repeatV);
    this.mesh.material.uniforms.alphaMap.value.updateMatrix();
  }
  if (this.hasAOMap()){
    this.mesh.material.uniforms.aoMap.value.repeat.set(repeatU, repeatV);
    this.mesh.material.uniforms.aoMap.value.updateMatrix();
  }
  if (this.hasEmissiveMap()){
    this.mesh.material.uniforms.emissiveMap.value.repeat.set(repeatU, repeatV);
    this.mesh.material.uniforms.emissiveMap.value.updateMatrix();
  }
  if (this.material.normalMap){
    this.material.normalMap.repeat.set(repeatU, repeatV);
  }
  if (this.material.specularMap){
    this.material.specularMap.repeat.set(repeatU, repeatV);
  }
  if (this.hasDisplacementMap()){
    this.mesh.material.uniforms.displacementMap.value.repeat.set(repeatU, repeatV);
    this.mesh.material.uniforms.displacementMap.value.updateMatrix();
  }

}

AddedObject.prototype.isVisibleOnThePreviewScene = function(parentName){
  if (typeof parentName == "undefined"){
    return !(this.isHidden);
  }else{
    return objectGroups[parentName].isVisibleOnThePreviewScene();
  }
}

AddedObject.prototype.preparePhysicsInfo = function(){
  var type = 0;
  if (this.type == "surface"){
    type = 1;
  }else if (this.type == "ramp"){
    type = 2;
  }else if (this.type == "box"){
    type = 3;
  }else if (this.type == "sphere"){
    type = 4;
  }
  var positionX = this.physicsBody.position.x;
  var positionY = this.physicsBody.position.y;
  var positionZ = this.physicsBody.position.z;
  var quaternionX = this.physicsBody.quaternion.x;
  var quaternionY = this.physicsBody.quaternion.y;
  var quaternionZ = this.physicsBody.quaternion.z;
  var quaternionW = this.physicsBody.quaternion.w;
  var physicsInfo = type + "," +positionX + "," + positionY + "," + positionZ + ","
                               + quaternionX + "," + quaternionY + ","
                               + quaternionZ + "," + quaternionW;
  if (this.type == "surface"){
    var physicsShapeParameterX = this.metaData.physicsShapeParameterX;
    var physicsShapeParameterY = this.metaData.physicsShapeParameterY;
    var physicsShapeParameterZ = this.metaData.physicsShapeParameterZ;
    physicsInfo += "," + physicsShapeParameterX + "," + physicsShapeParameterY
                       + "," + physicsShapeParameterZ;
  }else if (this.type == "box"){
    var boxSizeX = this.metaData.boxSizeX;
    var boxSizeY = this.metaData.boxSizeY;
    var boxSizeZ = this.metaData.boxSizeZ;
    physicsInfo += "," + boxSizeX + "," + boxSizeY + "," + boxSizeZ;
  }else if (this.type == "ramp"){
    var rampWidth = this.metaData.rampWidth;
    var rampHeight = this.metaData.rampHeight;
    var fromEulerX = this.metaData.fromEulerX;
    var fromEulerY = this.metaData.fromEulerY;
    var fromEulerZ = this.metaData.fromEulerZ;
    physicsInfo += "," + rampWidth + "," +rampHeight + "," + fromEulerX
                       + "," + fromEulerY + "," + fromEulerZ;
  }else if (this.type == "sphere"){
    var sphereRadius = Math.abs(this.metaData.radius);
    physicsInfo += "," + sphereRadius;
  }
  physicsInfo += "," + this.physicsBody.mass;
  physicsInfo += "," + this.physicsBody.id;
  return physicsInfo;
}

AddedObject.prototype.getFaceNormals = function(ary){

}

AddedObject.prototype.getFaceInfos = function(obj){

}

AddedObject.prototype.getFaceNameFromNormal = function(normal){
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

AddedObject.prototype.isTextureUsed = function(textureName){
  var textureStack = this.getTextureStack();
  for (var i = 0; i<textureStack.length; i++){
    if (!(textureStack[i].roygbivTextureName == "undefined")){
      if (textureStack[i].roygbivTextureName == textureName){
        return true;
      }
    }
  }
}

AddedObject.prototype.isTexturePackUsed = function(texturePackName){
  var textureStack = this.getTextureStack();
  for (var i = 0; i<textureStack.length; i++){
    if (!(textureStack[i].roygbivTexturePackName == "undefined")){
      if (textureStack[i].roygbivTexturePackName == texturePackName){
        return true;
      }
    }
  }
}

AddedObject.prototype.setBlending = function(blendingModeInt){
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

AddedObject.prototype.intersectsBox = function(box){
  for (var i = 0; i< this.trianglePlanes.length; i+=2){
    var plane = this.trianglePlanes[i];
    if (plane.intersectLine(line, REUSABLE_VECTOR)){
      var triangle1 = this.triangles[i];
      var triangle2 = this.triangles[i+1];
      if (triangle1.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }else if (triangle2.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }
    }
  }
  return false;
}

AddedObject.prototype.intersectsLine = function(line){
  for (var i = 0; i< this.trianglePlanes.length; i+=2){
    var plane = this.trianglePlanes[i];
    if (plane.intersectLine(line, REUSABLE_VECTOR)){
      var triangle1 = this.triangles[i];
      var triangle2 = this.triangles[i+1];
      if (triangle1.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }else if (triangle2.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }
    }
  }
  return false;
}

AddedObject.prototype.correctBoundingBox = function(bb){
  if (bb.min.x >= bb.max.x){
    bb.max.x += 0.5;
    bb.min.x -= 0.5;
  }
  if (bb.min.y >= bb.max.y){
    bb.max.y += 0.5;
    bb.min.y -= 0.5;
  }
  if (bb.min.z >= bb.max.z){
    bb.max.z += 0.5;
    bb.min.z -= 0.5;
  }
}

AddedObject.prototype.updateBoundingBoxes = function(parentAry){
  var startTime = performance.now();
  var bb = this.boundingBoxes[0];
  bb.makeEmpty();
  for (var i = 0; i<this.vertices.length; i++){
    var vertex = this.vertices[i];
    this.reusableVec3.set(vertex.x, vertex.y, vertex.z);
    this.reusableVec3.applyMatrix4(this.mesh.matrixWorld);
    bb.expandByPoint(this.reusableVec3);
    this.transformedVertices[i].set(
      this.reusableVec3.x, this.reusableVec3.y, this.reusableVec3.z
    );
  }
  for (var i = 0; i<this.pseudoFaces.length; i++){
    var face = this.pseudoFaces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var triangle = this.triangles[i];
    triangle.set(
      this.transformedVertices[a], this.transformedVertices[b], this.transformedVertices[c]
    );
    var plane = this.trianglePlanes[i];
    triangle.getPlane(plane);
  }
  if (parentAry){
    parentAry[this.parentBoundingBoxIndex] = bb;
  }
  this.boundingBoxUpdatePerformance = performance.now() - startTime;
}

AddedObject.prototype.generateBoundingBoxes = function(parentAry){
  var pseudoGeometry = this.segmentGeometry(true, 1, true);
  this.vertices = pseudoGeometry.vertices;
  var bb = new THREE.Box3();
  bb.roygbivObjectName = this.name;
  this.boundingBoxes = [bb];
  if (parentAry){
    parentAry.push(bb);
    this.parentBoundingBoxIndex = (parentAry.length - 1);
  }
  this.mesh.updateMatrixWorld();
  this.transformedVertices = [];
  for (var i = 0; i<this.vertices.length; i++){
    var vertex = this.vertices[i].clone();
    vertex.applyMatrix4(this.mesh.matrixWorld);
    bb.expandByPoint(vertex);
    this.transformedVertices.push(vertex);
  }
  this.triangles = [];
  this.trianglePlanes = [];
  for (var i = 0; i<pseudoGeometry.faces.length; i++){
    var face = pseudoGeometry.faces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var triangle = new THREE.Triangle(
      this.transformedVertices[a], this.transformedVertices[b], this.transformedVertices[c]
    );
    this.triangles.push(triangle);
    var plane = new THREE.Plane();
    triangle.getPlane(plane);
    this.trianglePlanes.push(plane);
  }
  this.pseudoFaces = pseudoGeometry.faces;
}

AddedObject.prototype.updateCollisionWorkerInfo = function (typedArray){
  var index = this.collisionWorkerIndex;
  for (var i = 0; i<this.mesh.matrixWorld.elements.length; i++){
    typedArray[index + 4 + i] = this.mesh.matrixWorld.elements[i];
  }
}

AddedObject.prototype.generateCollisionWorkerInfo = function(index, typedArray){
  // info[0] -> object type -> (0: surface, 1: ramp, 2: box, 3: sphere),
  // info[1, 2, 3] -> object size info for pseudo geometry generation
  // info[4 - 19] -> object preview mesh matrix world elements
  this.collisionWorkerIndex = index;
  if (this.type == "surface"){
    typedArray[index] = 0;
    typedArray[index + 1] = this.metaData["width"];
    typedArray[index + 2] = this.metaData["height"];
    typedArray[index + 3] = 0;
  }else if (this.type == "ramp"){
    typedArray[index] = 1;
    typedArray[index + 1] = this.metaData["rampWidth"];
    typedArray[index + 2] = this.metaData["rampHeight"];
    typedArray[index + 3] = 0;
  }else if (this.type == "box"){
    typedArray[index] = 2;
    typedArray[index + 1] = this.metaData["boxSizeX"];
    typedArray[index + 2] = this.metaData["boxSizeY"];
    typedArray[index + 3] = this.metaData["boxSizeZ"];
  }else if (this.type == "sphere"){
    typedArray[index] = 3;
    typedArray[index + 1] = this.metaData["radius"];
    typedArray[index + 2] = 0;
    typedArray[index + 3] = 0;
  }
  this.mesh.updateMatrixWorld();
  for (var i = 0; i<this.mesh.matrixWorld.elements.length; i++){
    typedArray[index + 4 + i] = this.mesh.matrixWorld.elements[i];
  }
}

AddedObject.prototype.visualiseBoudingBoxes = function(selectedScene){
  for (var i = 0; i<this.boundingBoxes.length; i++){
    this.correctBoundingBox(this.boundingBoxes[i]);
    var color = new THREE.Color(ColorNames.generateRandomColor());
    selectedScene.add(new THREE.Box3Helper(this.boundingBoxes[i], color));
  }
}

AddedObject.prototype.getNormalGeometry = function(){
  if (!(typeof this.metaData.slicedType == UNDEFINED)){
    var geomKey = "SLICED_NORMAL_GEOMETRY_"+this.metaData.slicedType;
    if (geometryCache[geomKey]){
      return geometryCache[geomKey];
    }
    var geom = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry);
    geometryCache[geomKey] = geom;
    return geom;
  }
  var count = new Object();
  if (this.type == "surface" || this.type == "ramp" || this.type == "sphere"){
    count.width = this.metaData["widthSegments"];
    count.height = this.metaData["heightSegments"];
  }else if (this.type == "box"){
    count.width = this.metaData["widthSegments"];
    count.height = this.metaData["heightSegments"];
    count.depth = this.metaData["depthSegments"];
  }
  return this.segmentGeometry(true, count, true);
}

AddedObject.prototype.applyDisplacementMap = function(map, mapName, scale, bias){
  if (typeof scale == UNDEFINED){
    scale = this.metaData["manualDisplacementScale"];
  }
  if (typeof bias == UNDEFINED){
    bias = this.metaData["manualDisplacementBias"];
  }
  this.undoDisplacement();
  new DisplacementCalculator().applyDisplacementMap(this, map, scale, bias);
  this.metaData["manualDisplacementMap"] = mapName;
  this.metaData["manualDisplacementScale"] = scale;
  this.metaData["manualDisplacementBias"] = bias;
}

AddedObject.prototype.undoDisplacement = function(){
  delete this.metaData["manualDisplacementMap"];
  delete this.metaData["manualDisplacementScale"];
  delete this.metaData["manualDisplacementBias"];
  var segmentObj = new Object();
  segmentObj.width = this.metaData["widthSegments"];
  segmentObj.height = this.metaData["heightSegments"];
  if (this.tpye == "box"){
    segmentObj.depth = this.metaData["depthSegments"];
  }
  this.segmentGeometry(true, segmentObj);
}

AddedObject.prototype.setSlippery = function(isSlippery){
  if (isSlippery){
    if (!isPhysicsWorkerEnabled()){
      this.setFriction(0);
    }
    this.metaData["isSlippery"] = true;
  }else{
    if (!isPhysicsWorkerEnabled()){
      this.setFriction(friction);
    }
    this.metaData["isSlippery"] = false;
  }
}

AddedObject.prototype.setFriction = function(val){
  var physicsMaterial = this.physicsBody.material;
  for (var objName in addedObjects){
    if (objName == this.name){
      continue;
    }
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
