var AddedObject = function(name, type, metaData, material, mesh,
                              previewMesh, physicsBody, destroyedGrids){
  this.name = name;
  this.type = type;
  this.metaData = metaData;
  this.material = material;
  this.mesh = mesh;
  this.previewMesh = previewMesh;
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

  this.previewMesh.addedObject = this;

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

  if (this.mesh.material.uniforms.diffuseMap.value){
    exportObject["textureOffsetX"] = this.mesh.material.uniforms.diffuseMap.value.offset.x;
    exportObject["textureOffsetY"] = this.mesh.material.uniforms.diffuseMap.value.offset.y;
    exportObject["textureRepeatU"] = this.mesh.material.uniforms.diffuseMap.value.repeat.x;
    exportObject["textureRepeatV"] = this.mesh.material.uniforms.diffuseMap.value.repeat.y;
  }

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

  exportObject.quaternionX = this.previewMesh.quaternion.x;
  exportObject.quaternionY = this.previewMesh.quaternion.y;
  exportObject.quaternionZ = this.previewMesh.quaternion.z;
  exportObject.quaternionW = this.previewMesh.quaternion.w;
  exportObject.pQuaternionX = this.physicsBody.quaternion.x;
  exportObject.pQuaternionY = this.physicsBody.quaternion.y;
  exportObject.pQuaternionZ = this.physicsBody.quaternion.z;
  exportObject.pQuaternionW = this.physicsBody.quaternion.w;

  if (this.recentlyDetached){
    exportObject.recentlyDetached = true;
    exportObject.worldQuaternionX = this.worldQuaternionX;
    exportObject.worldQuaternionY = this.worldQuaternionY;
    exportObject.worldQuaternionZ = this.worldQuaternionZ;
    exportObject.worldQuaternionW = this.worldQuaternionW;
    exportObject.physicsQuaternionX = this.physicsQuaternionX;
    exportObject.physicsQuaternionY = this.physicsQuaternionY;
    exportObject.physicsQuaternionZ = this.physicsQuaternionZ;
    exportObject.physicsQuaternionW = this.physicsQuaternionW;
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

  return exportObject;
}

AddedObject.prototype.hasEmissiveMap = function(){
  return (this.mesh.material.uniforms.textureFlags2.value.x > 0);
}

AddedObject.prototype.unMapEmissive = function(){
  this.mesh.material.uniforms.emissiveMap.value = null;
  this.mesh.material.uniforms.textureFlags2.value.x = -10;
}

AddedObject.prototype.mapEmissive = function(emissiveMap){
  this.mesh.material.uniforms.emissiveMap.value = emissiveMap;
  this.mesh.material.uniforms.textureFlags2.value.x = 10;
}

AddedObject.prototype.hasDisplacementMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.w > 0);
}

AddedObject.prototype.unMapDisplacement = function(){
  this.mesh.material.uniforms.displacementMap.value = null;
  this.mesh.material.uniforms.textureFlags.value.w = -10;
}

AddedObject.prototype.mapDisplacement = function(displacementTexture){
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    console.error("Displacement mapping is not supported for this device. Use applyDisplacementMap command instead.");
    return;
  }
  this.mesh.material.uniforms.displacementMap.value = displacementTexture;
  this.mesh.material.uniforms.textureFlags.value.w = 10;
}

AddedObject.prototype.hasAOMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.z > 0);
}

AddedObject.prototype.unMapAO = function(){
  this.mesh.material.uniforms.aoMap.value = null;
  this.mesh.material.uniforms.textureFlags.value.z = -10;
}

AddedObject.prototype.mapAO = function(aoTexture){
  this.mesh.material.uniforms.aoMap.value = aoTexture;
  this.mesh.material.uniforms.textureFlags.value.z = 10;
}

AddedObject.prototype.hasAlphaMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.y > 0);
}

AddedObject.prototype.unMapAlpha = function(){
  this.mesh.material.uniforms.alphaMap.value = null;
  this.mesh.material.uniforms.textureFlags.value.y = -10;
}

AddedObject.prototype.mapAlpha = function(alphaTexture){
  this.mesh.material.uniforms.alphaMap.value = alphaTexture;
  this.mesh.material.uniforms.textureFlags.value.y = 10;
}

AddedObject.prototype.hasDiffuseMap = function(){
  return (this.mesh.material.uniforms.textureFlags.value.x > 0);
}

AddedObject.prototype.unMapDiffuse = function(){
  this.mesh.material.uniforms.diffuseMap.value = null;
  this.mesh.material.uniforms.textureFlags.value.x = -10;
}

AddedObject.prototype.mapDiffuse = function(diffuseTexture){
  this.mesh.material.uniforms.diffuseMap.value = diffuseTexture;
  this.mesh.material.uniforms.textureFlags.value.x = 10;
  diffuseTexture.updateMatrix();
  this.mesh.material.uniforms.textureMatrix.value = diffuseTexture.matrix;
}

AddedObject.prototype.incrementOpacity = function(val){
  this.mesh.material.uniforms.alpha.value += val;
}

AddedObject.prototype.updateOpacity = function(val){
  this.mesh.material.uniforms.alpha.value = val;
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
  if (this.hasEmissive()){
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
  var previewMesh = this.previewMesh;
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

  previewMesh.position.copy(mesh.position);
  physicsBody.position.copy(mesh.position);
}

AddedObject.prototype.translate = function(axis, amount, fromScript){
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

  if (!fromScript){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere"){
      this.metaData["centerX"] = previewMesh.position.x;
      this.metaData["centerY"] = previewMesh.position.y;
      this.metaData["centerZ"] = previewMesh.position.z;
    }else if (this.type == "surface"){
      this.metaData["positionX"] = previewMesh.position.x;
      this.metaData["positionY"] = previewMesh.position.y;
      this.metaData["positionZ"] = previewMesh.position.z;
    }
  }

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
  this.physicsBody.position.copy(this.previewMesh.position);
}

AddedObject.prototype.setSurfacePhysicsAfterRotationAroundPoint = function(axis, radians){
  var previewMesh = this.previewMesh;
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;
  if (gridSystemAxis == "XY"){
    physicsBody.quaternion.copy(previewMesh.quaternion);
  }else if (gridSystemAxis == "XZ"){
    REUSABLE_QUATERNION.copy(previewMesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(previewMesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_Y, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }
}

AddedObject.prototype.setSpherePhysicsAfterRotationAroundPoint = function(axis, radians){
  var previewMesh = this.previewMesh;
  var physicsBody = this.physicsBody;
  physicsBody.quaternion.copy(previewMesh.quaternion);
}

AddedObject.prototype.setBoxPhysicsAfterRotationAroundPoint = function(axis, radians){
  var previewMesh = this.previewMesh;
  var physicsBody = this.physicsBody;
  physicsBody.quaternion.copy(previewMesh.quaternion);
}

AddedObject.prototype.setRampPhysicsAfterRotationAroundPoint = function(axis, radians){
  var previewMesh = this.previewMesh;
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;
  if (gridSystemAxis == "XY"){
    REUSABLE_QUATERNION.copy(previewMesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "XZ"){
    REUSABLE_QUATERNION.copy(previewMesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(previewMesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, Math.PI / 2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }
}

AddedObject.prototype.rotateSphere = function(axis, radians, fromScript){
  var mesh = this.mesh;
  var previewMesh = this.previewMesh;
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
  previewMesh.quaternion.copy(mesh.quaternion);
  if (!fromScript){
    physicsBody.initQuaternion.copy(
      physicsBody.quaternion
    );
  }
}

AddedObject.prototype.rotateRamp = function(axis, radians, fromScript){
  var mesh = this.mesh;
  var previewMesh = this.previewMesh;
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
  previewMesh.quaternion.copy(mesh.quaternion);
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
  var previewMesh = this.previewMesh;
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
  previewMesh.quaternion.copy(mesh.quaternion);
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
  var previewMesh = this.previewMesh;
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
  previewMesh.quaternion.copy(mesh.quaternion);
  if (!fromScript){
    physicsBody.initQuaternion.copy(
      physicsBody.quaternion
    );
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
  previewScene.remove(this.previewMesh);
  physicsWorld.remove(this.physicsBody);
  if (this.destroyedGrids){
    for (var gridName in this.destroyedGrids){
      this.destroyedGrids[gridName].destroyedAddedObject = 0;
    }
  }
  objectSelectedByCommand = false;

  this.dispose();

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
  this.mesh.geometry.dispose();
  this.previewMesh.geometry.dispose();
}

AddedObject.prototype.mapTexturePack = function(texturePack, fromScript){

  if (fromScript && !this.texturePackSetWithScript){
    this.texturePackSetWithScript = true;
    if (this.hasDiffuseMap() && this.mesh.material.uniforms.diffuseMap.value.roygbivTextureName){
      this.oldMap = this.mesh.material.uniforms.diffuseMap.value.clone();
      this.oldMapName = this.mesh.material.uniforms.diffuseMap.value.roygbivTextureName;
    }
    if (this.hasAlphaMap() && this.mesh.material.uniforms.alphaMap.value.roygbivTextureName){
      this.oldAlphaMap = this.mesh.material.uniforms.alphaMap.value.clone();
      this.oldAlphaMapName = this.mesh.material.uniforms.alphaMap.value.roygbivTextureName;
    }
    if (this.hasAOMap() && this.mesh.material.uniforms.aoMap.value.roygbivTextureName){
      this.oldAoMap = this.mesh.material.uniforms.aoMap.value.clone();
      this.oldAoMapName = this.mesh.material.uniforms.aoMap.value.roygbivTextureName;
    }
    if (this.hasEmissiveMap() && this.mesh.material.uniforms.emissiveMap.value.roygbivTextureName){
      this.oldEmissiveMap = this.mesh.material.uniforms.emissiveMap.value.clone();
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
      this.oldDisplacementMap = this.mesh.material.uniforms.displacementMap.value.clone();
      this.oldDisplacementMapName = this.mesh.material.uniforms.displacementMap.value.roygbivTextureName;
    }

    this.oldWidthSegments = this.metaData["widthSegments"];
    this.oldHeightSegments = this.metaData["heightSegments"];
    if (this.type == "box"){
      this.oldDepthSegments = this.metaData["depthSegments"];
    }

  }

  this.resetMaps();

  if (texturePack.hasHeight){
    if (!this.mesh.geometry.parameters.widthSegments || !this.mesh.geometry.parameters.heightSegments){
      this.segmentGeometry(false, undefined);
    }
  }

  if (this.mesh.geometry.parameters.widthSegments || this.mesh.geometry.parameters.heightSegments || this.mesh.geometry.parameters.depthSegments){
    if (!texturePack.hasHeight){
      this.deSegmentGeometry();
    }
  }

  for (var addedObjectName in addedObjects){
    var addedObject = addedObjects[addedObjectName];
    if (addedObject.mesh.material.uuid == this.mesh.material.uuid && addedObject.name != this.name){
      if (texturePack.hasHeight){
        if (!addedObject.mesh.geometry.parameters.widthSegments || !addedObject.mesh.geometry.parameters.heightSegments){
          addedObject.segmentGeometry(false, undefined);
        }
      }
      if (addedObject.mesh.geometry.parameters.widthSegments || addedObject.mesh.geometry.parameters.heightSegments || addedObject.mesh.geometry.parameters.depthSegments){
        if (!texturePack.hasHeight){
          addedObject.deSegmentGeometry();
        }
      }
    }
  }

  if (texturePack.hasDiffuse){
    this.mapDiffuse(texturePack.diffuseTexture.clone());
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
    this.mapAlpha(texturePack.alphaTexture.clone());
    if (!fromScript){
      this.mesh.material.uniforms.alphaMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.alphaMap.value.roygbivTextureName = 0;
    }
    this.mesh.material.uniforms.alphaMap.value.needsUpdate = true;
  }
  if (texturePack.hasAO){
    this.mapAO(texturePack.aoTexture.clone());
    if (!fromScript){
      this.mesh.material.uniforms.aoMap.value.roygbivTexturePackName = texturePack.name;
      this.mesh.material.uniforms.aoMap.value.roygbivTextureName = 0;
    }
    this.mesh.material.uniforms.aoMap.value.needsUpdate = true;
  }
  if (texturePack.hasEmissive){
    this.mapEmissive(texturePack.emissiveTexture.clone());
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
  if (texturePack.hasHeight){
    this.mapDisplacement(texturePack.heightTexture.clone());
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
    var cloneMap = this.oldMap.clone();
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldMapName;
    this.oldMap = 0;
    this.mapDiffuse(cloneMap);
  }
  if (this.oldAoMap){
    var cloneMap = this.oldAoMap.clone();
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldAoMapName;
    this.oldAoMap = 0;
    this.mapAO(cloneMap);
  }
  if (this.oldAlphaMap){
    var cloneMap = this.oldAlphaMap.clone();
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldAlphaMapName;
    this.oldAlphaMap = 0;
    this.mapAlpha(cloneMap);
  }
  if (this.oldNormalMap){
    this.material.normalMap = this.oldNormalMap.clone();
    this.material.normalMap.needsUpdate = true;
    this.material.normalMap.roygbivTextureName = this.oldNormalMapName;
  }
  if (this.oldSpecularMap){
    this.material.specularMap = this.oldSpecularMap.clone();
    this.material.specularMap.needsUpdate = true;
    this.material.specularMap.roygbivTextureName = this.oldSpecularMapName;
  }
  if (this.oldEmissiveMap){
    var cloneMap = this.oldEmissiveMap.clone();
    cloneMap.needsUpdate = true;
    cloneMap.roygbivTextureName = this.oldEmissiveMapName;
    this.oldEmissiveMap = 0;
    this.mapEmissive(cloneMap);
  }
  if (this.oldDisplacementMap){
    var cloneMap = this.oldDisplacementMap.clone();
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
      newGeometry = new THREE.PlaneBufferGeometry(width, height, planeWidthSegments, planeHeightSegments);
    }else{
      if (!isNaN(count)){
        if (returnGeometry){
          newGeometry = new THREE.PlaneGeometry(width, height, count, count);
        }else{
          newGeometry = new THREE.PlaneBufferGeometry(width, height, count, count);
        }
      }else{
        if (returnGeometry){
          newGeometry = new THREE.PlaneGeometry(width, height, count.width, count.height);
        }else{
          newGeometry = new THREE.PlaneBufferGeometry(width, height, count.width, count.height);
        }
      }
    }
  }else if (this.type == "ramp"){
    var rampWidth = this.metaData["rampWidth"];
    var rampHeight = this.metaData["rampHeight"];
    if (!isCustom){
      newGeometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, planeWidthSegments, planeHeightSegments);
    }else{
      if (!isNaN(count)){
        if (returnGeometry){
          newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, count, count);
        }else{
          newGeometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, count, count);
        }
      }else{
        if (returnGeometry){
          newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, count.width, count.height);
        }else{
          newGeometry = new THREE.PlaneBufferGeometry(rampWidth, rampHeight, count.width, count.height);
        }
      }
    }
  }else if (this.type == "box"){
    var boxSizeX = this.metaData["boxSizeX"];
    var boxSizeY = this.metaData["boxSizeY"];
    var boxSizeZ = this.metaData["boxSizeZ"];
    if (!isCustom){
      newGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ, boxWidthSegments, boxHeightSegments, boxDepthSegments);
    }else{
      if (!isNaN(count)){
        if (returnGeometry){
          newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, count, count, count);
        }else{
          newGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ, count, count, count);
        }
      }else{
        if (returnGeometry){
          newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, count.width, count.height, count.depth);
        }else{
          newGeometry = new THREE.BoxBufferGeometry(boxSizeX, boxSizeY, boxSizeZ, count.width, count.height, count.depth);
        }
      }
    }
  }else if (this.type == "sphere"){
    var radius = this.metaData["radius"];
    if (!isCustom){
      newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius), sphereWidthSegments, sphereHeightSegments);
    }else{
      if (!isNaN(count)){
        if (count < 8){
          count = 8;
        }
        if (returnGeometry){
          newGeometry = new THREE.SphereGeometry(Math.abs(radius), count, count);
        }else{
          newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius), count, count);
        }
      }else{
        if (count.width < 8){
          count.width = 8;
        }
        if (count.height < 6){
          count.height = 6;
        }
        if (returnGeometry){
          newGeometry = new THREE.SphereGeometry(Math.abs(radius), count.width, count.height);
        }else{
          newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius), count.width, count.height);
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
  previewScene.remove(this.previewMesh);

  this.mesh = newMesh;
  this.previewMesh = newMesh.clone();

  this.mesh.addedObject = this;
  this.previewMesh.addedObject = this;

  scene.add(this.mesh);
  previewScene.add(this.previewMesh);

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

AddedObject.prototype.deSegmentGeometry = function(){
  var newGometry;
  if (this.type == "surface"){
    var width = this.metaData["width"];
    var height = this.metaData["height"];
    newGeometry = new THREE.PlaneBufferGeometry(Math.abs(width), Math.abs(height));
  }else if (this.type == "ramp"){
    var rampWidth = this.metaData["rampWidth"];
    var rampHeight = this.metaData["rampHeight"];
    newGeometry = new THREE.PlaneBufferGeometry(Math.abs(rampWidth), Math.abs(rampHeight));
  }else if (this.type == "box"){
    var boxSizeX = this.metaData["boxSizeX"];
    var boxSizeY = this.metaData["boxSizeY"];
    var boxSizeZ = this.metaData["boxSizeZ"];
    newGeometry = new THREE.BoxBufferGeometry(Math.abs(boxSizeX), Math.abs(boxSizeY), Math.abs(boxSizeZ));
  }else if (this.type == "sphere"){
    var radius = this.metaData["radius"];
    newGeometry = new THREE.SphereBufferGeometry(Math.abs(radius));
  }

  var newMesh = new THREE.Mesh(newGeometry, this.mesh.material);
  newMesh.position.x = this.mesh.position.x;
  newMesh.position.y = this.mesh.position.y;
  newMesh.position.z = this.mesh.position.z;
  newMesh.rotation.x = this.mesh.rotation.x;
  newMesh.rotation.y = this.mesh.rotation.y;
  newMesh.rotation.z = this.mesh.rotation.z;

  scene.remove(this.mesh);
  previewScene.remove(this.previewMesh);

  this.mesh = newMesh;
  this.previewMesh = newMesh.clone();

  this.mesh.addedObject = this;
  this.previewMesh.addedObject = this;

  scene.add(this.mesh);
  previewScene.add(this.previewMesh);

  this.metaData["widthSegments"] = 1;
  this.metaData["heightSegments"] = 1;
  if (this.type == "box"){
    this.metaData["depthSegments"] = 1;
  }else if (this.type == "sphere"){
    this.metaData["widthSegments"] = 8;
    this.metaData["heightSegments"] = 6;
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

AddedObject.prototype.adjustTextureRepeat = function(repeatU, repeatV){
  this.metaData["textureRepeatU"] = repeatU;
  this.metaData["textureRepeatV"] = repeatV;
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
  this.material.blending = blendingModeInt;
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
    this.reusableVec3.applyMatrix4(this.previewMesh.matrixWorld);
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
  this.previewMesh.updateMatrixWorld();
  this.transformedVertices = [];
  for (var i = 0; i<this.vertices.length; i++){
    var vertex = this.vertices[i].clone();
    vertex.applyMatrix4(this.previewMesh.matrixWorld);
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
  for (var i = 0; i<this.previewMesh.matrixWorld.elements.length; i++){
    typedArray[index + 4 + i] = this.previewMesh.matrixWorld.elements[i];
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
  this.previewMesh.updateMatrixWorld();
  for (var i = 0; i<this.previewMesh.matrixWorld.elements.length; i++){
    typedArray[index + 4 + i] = this.previewMesh.matrixWorld.elements[i];
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
