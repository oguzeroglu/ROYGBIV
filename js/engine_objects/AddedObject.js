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

  if (this.destroyedGrids){
    for (var gridName in this.destroyedGrids){
      this.destroyedGrids[gridName].destroyedAddedObject = this.name;
    }
  }

  var faces = this.mesh.geometry.faces;
  var previewFaces = this.previewMesh.geometry.faces;
  for (var i = 0; i<faces.length; i++){
    faces[i].roygbivObjectName = name;
    previewFaces[i].roygbivObjectName = name;
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

  if (this.material.map){
    exportObject["textureOffsetX"] = this.material.map.offset.x;
    exportObject["textureOffsetY"] = this.material.map.offset.y;
    exportObject["textureRepeatU"] = this.material.map.repeat.x;
    exportObject["textureRepeatV"] = this.material.map.repeat.y;
  }

  if (this.mass){
    exportObject["mass"] = this.mass;
  }
  if (this.isDynamicObject){
    exportObject["isDynamicObject"] = this.isDynamicObject;
  }

  exportObject["opacity"] = this.material.opacity;
  exportObject["aoMapIntensity"] = this.material.aoMapIntensity;
  if (this.material.isMeshPhongMaterial){
    exportObject["shininess"] = this.material.shininess;
    exportObject["emissiveIntensity"] = this.material.emissiveIntensity;
  }

  var diffuseMap = this.material.map;
  var alphaMap = this.material.alphaMap;
  var aoMap = this.material.aoMap;
  var emissiveMap = this.material.emissiveMap;
  var normalMap = this.material.normalMap;
  var specularMap = this.material.specularMap;
  var displacementMap = this.material.displacementMap;

  if (diffuseMap){
    exportObject["diffuseRoygbivTexturePackName"] = this.material.map.roygbivTexturePackName;
    exportObject["diffuseRoygbivTextureName"] =  this.material.map.roygbivTextureName;
    exportObject["textureOffsetX"] = this.material.map.offset.x;
    exportObject["textureOffsetY"] = this.material.map.offset.y;
  }
  if (alphaMap){
    exportObject["alphaRoygbivTexturePackName"] = this.material.alphaMap.roygbivTexturePackName;
    exportObject["alphaRoygbivTextureName"] = this.material.alphaMap.roygbivTextureName;
  }
  if (aoMap){
    exportObject["aoRoygbivTexturePackName"] = this.material.aoMap.roygbivTexturePackName;
    exportObject["aoRoygbivTextureName"] = this.material.aoMap.roygbivTextureName;
  }
  if (emissiveMap){
    exportObject["emissiveRoygbivTexturePackName"] = this.material.emissiveMap.roygbivTexturePackName;
    exportObject["emissiveRoygbivTextureName"] = this.material.emissiveMap.roygbivTextureName;
  }
  if (normalMap){
    exportObject["normalRoygbivTexturePackName"] = this.material.normalMap.roygbivTexturePackName;
    exportObject["normalRoygbivTextureName"] = this.material.normalMap.roygbivTextureName;
  }
  if (specularMap){
    exportObject["specularRoygbivTexturePackName"] = this.material.specularMap.roygbivTexturePackName;
    exportObject["specularRoygbivTextureName"] = this.material.specularMap.roygbivTextureName;
  }
  if (displacementMap){
    exportObject["displacementRoygbivTexturePackName"] = this.material.displacementMap.roygbivTexturePackName;
    exportObject["displacementRoygbivTextureName"] = this.material.displacementMap.roygbivTextureName;
    exportObject["displacementScale"] = this.material.displacementScale;
    exportObject["displacementBias"] = this.material.displacementBias;
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

  return exportObject;
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
  if (this.material.map){
    texturesStack.push(this.material.map);
  }
  if (this.material.alphaMap){
    texturesStack.push(this.material.alphaMap);
  }
  if (this.material.aoMap){
    texturesStack.push(this.material.aoMap);
  }
  if (this.material.emissiveMap){
    texturesStack.push(this.material.emissiveMap);
  }
  if (this.material.normalMap){
    texturesStack.push(this.material.normalMap);
  }
  if (this.material.specularMap){
    texturesStack.push(this.material.specularMap);
  }
  if (this.material.displacementMap){
    texturesStack.push(this.material.displacementMap);
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
  if (this.material.map){
    this.material.map.dispose();
  }
  if (this.material.alphaMap){
    this.material.alphaMap.dispose();
  }
  if (this.material.aoMap){
    this.material.aoMap.dispose();
  }
  if (this.material.emissiveMap){
    this.material.emissiveMap.dispose();
  }
  if (this.material.normalMap){
    this.material.normalMap.dispose();
  }
  if (this.material.specularMap){
    this.material.specularMap.dispose();
  }
  if (this.material.displacementMap){
    this.material.displacementMap.dispose();
  }
  this.material.dispose();
  this.mesh.geometry.dispose();
  this.previewMesh.geometry.dispose();
}

AddedObject.prototype.mapTexturePack = function(texturePack, fromScript){

  if (fromScript && !this.texturePackSetWithScript){
    this.texturePackSetWithScript = true;
    if (this.material.map && this.material.map.roygbivTextureName){
      this.oldMap = this.material.map.clone();
      this.oldMapName = this.material.map.roygbivTextureName;
    }
    if (this.material.alphaMap && this.material.alphaMap.roygbivTextureName){
      this.oldAlphaMap = this.material.alphaMap.clone();
      this.oldAlphaMapName = this.material.alphaMap.roygbivTextureName;
    }
    if (this.material.aoMap && this.material.aoMap.roygbivTextureName){
      this.oldAoMap = this.material.aoMap.clone();
      this.oldAoMapName = this.material.aoMap.roygbivTextureName;
    }
    if (this.material.emissiveMap && this.material.emissiveMap.roygbivTextureName){
      this.oldEmissiveMap = this.material.emissiveMap.clone();
      this.oldEmissiveMapName = this.material.emissiveMap.roygbivTextureName;
    }
    if (this.material.normalMap && this.material.normalMap.roygbivTextureName){
      this.oldNormalMap = this.material.normalMap.clone();
      this.oldNormalMapName = this.material.normalMap.roygbivTextureName;
    }
    if (this.material.specularMap && this.material.specularMap.roygbivTextureName){
      this.oldSpecularMap = this.material.specularMap.clone();
      this.oldSpecularMapName = this.material.specularMap.roygbivTextureName;
    }
    if (this.material.displacementMap && this.material.displacementMap.roygbivTextureName){
      this.oldDisplacementMap = this.material.displacementMap.clone();
      this.oldDisplacementMapName = this.material.displacementMap.roygbivTextureName;
    }

    this.oldWidthSegments = this.metaData["widthSegments"];
    this.oldHeightSegments = this.metaData["heightSegments"];
    if (this.type == "box"){
      this.oldDepthSegments = this.metaData["depthSegments"];
    }

  }

  this.resetMaps();

  /* OPTIMIZATION FOR HEIGHT MAPS AND GEOMETRY SEGMENTS */
  if (texturePack.hasHeight){
    if (this.material.isMeshPhongMaterial){
      if (!this.mesh.geometry.parameters.widthSegments || !this.mesh.geometry.parameters.heightSegments){
        this.segmentGeometry(false, undefined);
      }
    }
  }

  if (this.mesh.geometry.parameters.widthSegments || this.mesh.geometry.parameters.heightSegments || this.mesh.geometry.parameters.depthSegments){
    if (!texturePack.hasHeight || !this.material.isMeshPhongMaterial){
      this.deSegmentGeometry();
    }
  }

  for (var addedObjectName in addedObjects){
    var addedObject = addedObjects[addedObjectName];
    if (addedObject.material.uuid == this.material.uuid && addedObject.name != this.name){
      if (addedObject.material.isMeshPhongMaterial && texturePack.hasHeight){
        if (!addedObject.mesh.geometry.parameters.widthSegments || !addedObject.mesh.geometry.parameters.heightSegments){
          addedObject.segmentGeometry(false, undefined);
        }
      }
      if (addedObject.mesh.geometry.parameters.widthSegments || addedObject.mesh.geometry.parameters.heightSegments || addedObject.mesh.geometry.parameters.depthSegments){
        if (!texturePack.hasHeight || !this.material.isMeshPhongMaterial){
          addedObject.deSegmentGeometry();
        }
      }
    }
  }

  if (texturePack.hasDiffuse){
    this.material.map = texturePack.diffuseTexture.clone();
    if  (!fromScript){
      this.material.map.roygbivTexturePackName = texturePack.name;
      this.material.map.roygbivTextureName = 0;
    }
    if (this.adjustTextureOffsetXOnTexturePackMap){
      this.material.map.offset.x = this.adjustTextureOffsetXOnTexturePackMap;
    }
    if (this.adjustTextureOffsetYOnTexturePackMap){
      this.material.map.offset.y = this.adjustTextureOffsetYOnTexturePackMap;
    }
    this.material.map.needsUpdate = true;
  }
  if (texturePack.hasAlpha){
    this.material.alphaMap = texturePack.alphaTexture.clone();
    if (!fromScript){
      this.material.alphaMap.roygbivTexturePackName = texturePack.name;
      this.material.alphaMap.roygbivTextureName = 0;
    }
    this.material.transparent = false;
    this.material.alphaTest = 0.5;
    this.material.alphaMap.needsUpdate = true;
  }
  if (texturePack.hasAO){
    this.material.aoMap = texturePack.aoTexture.clone();
    if (!fromScript){
      this.material.aoMap.roygbivTexturePackName = texturePack.name;
      this.material.aoMap.roygbivTextureName = 0;
    }
    this.material.aoMap.needsUpdate = true;
  }
  if (texturePack.hasEmissive){
    if (!this.material.isMeshBasicMaterial){
      this.material.emissive = new THREE.Color(0xffffff);
      this.material.emissiveMap = texturePack.emissiveTexture.clone();
      if (!fromScript){
        this.material.emissiveMap.roygbivTexturePackName = texturePack.name;
        this.material.emissiveMap.roygbivTextureName = 0;
      }
      this.material.emissiveMap.needsUpdate = true;
    }
  }
  if (texturePack.hasNormal){
    if (!this.material.isMeshBasicMaterial){
      this.material.normalMap = texturePack.normalTexture.clone();
      if (!fromScript){
        this.material.normalMap.roygbivTexturePackName = texturePack.name;
        this.material.normalMap.roygbivTextureName = 0;
      }
      this.material.normalMap.needsUpdate = true;
    }
  }
  if (texturePack.hasSpecular){
    this.material.specularMap = texturePack.specularTexture.clone();
    if (!fromScript){
      this.material.specularMap.roygbivTexturePackName = texturePack.name;
      this.material.specularMap.roygbivTextureName = 0;
    }
    this.material.specularMap.needsUpdate = true;
  }
  if (texturePack.hasHeight){
    if (this.material.isMeshPhongMaterial){
      this.material.displacementMap = texturePack.heightTexture.clone();
      if (!fromScript){
        this.material.displacementMap.roygbivTexturePackName = texturePack.name;
        this.material.displacementMap.roygbivTextureName = 0;
      }
      this.material.displacementMap.needsUpdate = true;
    }
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
  this.material.needsUpdate = true;

}

AddedObject.prototype.resetTexturePackAfterAnimation = function(){
  this.resetMaps();
  if (this.associatedTexturePack){
    this.mapTexturePack(
      texturePacks[this.associatedTexturePack]
    );
  }
  if (this.oldMap){
    this.material.map = this.oldMap.clone();
    this.material.map.needsUpdate = true;
    this.material.map.roygbivTextureName = this.oldMapName;
    this.oldMap = 0;
  }
  if (this.oldAoMap){
    this.material.aoMap = this.oldAoMap.clone();
    this.material.aoMap.needsUpdate = true;
    this.material.aoMap.roygbivTextureName = this.oldAoMapName;
    this.oldAoMap = 0;
  }
  if (this.oldAlphaMap){
    this.material.alphaMap = this.oldAlphaMap.clone();
    this.material.alphaMap.needsUpdate = true;
    this.material.alphaMap.roygbivTextureName = this.oldAlphaMapName;
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
    this.material.emissive = new THREE.Color( 0xffffff );
    this.material.emissiveMap = this.oldEmissiveMap.clone();
    this.material.emissiveMap.needsUpdate = true;
    this.material.emissiveMap.roygbivTextureName = this.oldEmissiveMapName;
  }
  if (this.oldDisplacementMap){
    this.material.displacementMap = this.oldDisplacementMap.clone();
    this.material.displacementMap.needsUpdate = true;
    this.material.displacementMap.roygbivTextureName = this.oldDisplacementMapName;
  }
  this.material.needsUpdate = true;
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
      newGeometry = new THREE.PlaneGeometry(width, height, planeWidthSegments, planeHeightSegments);
    }else{
      if (!isNaN(count)){
        newGeometry = new THREE.PlaneGeometry(width, height, count, count);
      }else{
        newGeometry = new THREE.PlaneGeometry(width, height, count.width, count.height);
      }
    }
  }else if (this.type == "ramp"){
    var rampWidth = this.metaData["rampWidth"];
    var rampHeight = this.metaData["rampHeight"];
    if (!isCustom){
      newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, planeWidthSegments, planeHeightSegments);
    }else{
      if (!isNaN(count)){
        newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, count, count);
      }else{
        newGeometry = new THREE.PlaneGeometry(rampWidth, rampHeight, count.width, count.height);
      }
    }
  }else if (this.type == "box"){
    var boxSizeX = this.metaData["boxSizeX"];
    var boxSizeY = this.metaData["boxSizeY"];
    var boxSizeZ = this.metaData["boxSizeZ"];
    if (!isCustom){
      newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, boxWidthSegments, boxHeightSegments, boxDepthSegments);
    }else{
      if (!isNaN(count)){
        newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, count, count, count);
      }else{
        newGeometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ, count.width, count.height, count.depth);
      }
    }
  }else if (this.type == "sphere"){
    var radius = this.metaData["radius"];
    if (!isCustom){
      newGeometry = new THREE.SphereGeometry(Math.abs(radius), sphereWidthSegments, sphereHeightSegments);
    }else{
      if (!isNaN(count)){
        if (count < 8){
          count = 8;
        }
        newGeometry = new THREE.SphereGeometry(Math.abs(radius), count, count);
      }else{
        if (count.width < 8){
          count.width = 8;
        }
        if (count.height < 6){
          count.height = 6;
        }
        newGeometry = new THREE.SphereGeometry(Math.abs(radius), count.width, count.height);
      }
    }
  }

  if (returnGeometry){
    return newGeometry;
  }

  var newMesh = new THREE.Mesh(newGeometry, this.material);
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

  var faces = this.mesh.geometry.faces;
  var previewFaces = this.previewMesh.geometry.faces;
  for (var i = 0; i<faces.length; i++){
    faces[i].roygbivObjectName = this.name;
    previewFaces[i].roygbivObjectName = this.name;
  }

  if (!isCustom){
    console.log("[*]Segmented for optimization.");
  }

}

AddedObject.prototype.deSegmentGeometry = function(){
  var newGometry;
  if (this.type == "surface"){
    var width = this.metaData["width"];
    var height = this.metaData["height"];
    newGeometry = new THREE.PlaneGeometry(Math.abs(width), Math.abs(height));
  }else if (this.type == "ramp"){
    var rampWidth = this.metaData["rampWidth"];
    var rampHeight = this.metaData["rampHeight"];
    newGeometry = new THREE.PlaneGeometry(Math.abs(rampWidth), Math.abs(rampHeight));
  }else if (this.type == "box"){
    var boxSizeX = this.metaData["boxSizeX"];
    var boxSizeY = this.metaData["boxSizeY"];
    var boxSizeZ = this.metaData["boxSizeZ"];
    newGeometry = new THREE.BoxGeometry(Math.abs(boxSizeX), Math.abs(boxSizeY), Math.abs(boxSizeZ));
  }else if (this.type == "sphere"){
    var radius = this.metaData["radius"];
    newGeometry = new THREE.SphereGeometry(Math.abs(radius));
  }

  var newMesh = new THREE.Mesh(newGeometry, this.material);
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

  var faces = this.mesh.geometry.faces;
  var previewFaces = this.previewMesh.geometry.faces;
  for (var i = 0; i<faces.length; i++){
    faces[i].roygbivObjectName = this.name;
    previewFaces[i].roygbivObjectName = this.name;
  }

  console.log("[*]Desegmented for optimization.");

}

AddedObject.prototype.resetMaps = function(resetAssociatedTexturePack){
  this.material.map = undefined;
  this.material.alphaMap = undefined;
  this.material.aoMap = undefined;
  this.material.emissiveMap = undefined;
  this.material.normalMap = undefined;
  this.material.specularMap = undefined;
  this.material.displacementMap = undefined;
  this.material.needsUpdate = true;
  if (!this.material.isMeshBasicMaterial){
    this.material.emissive = new THREE.Color("black");
  }
  if (resetAssociatedTexturePack){
    this.associatedTexturePack = 0;
  }
}

AddedObject.prototype.isTextured = function(){
  return (
    this.material.map ||
    this.material.alphaMap ||
    this.material.aoMap ||
    this.material.emissiveMap ||
    this.material.normalMap ||
    this.material.specularMap ||
    this.material.displacementMap
  );
}

AddedObject.prototype.adjustTextureRepeat = function(repeatU, repeatV){
  this.metaData["textureRepeatU"] = repeatU;
  this.metaData["textureRepeatV"] = repeatV;
  if (this.material.map){
    this.material.map.repeat.set(repeatU, repeatV);
  }
  if (this.material.alphaMap){
    this.material.alphaMap.repeat.set(repeatU, repeatV);
  }
  if (this.material.aoMap){
    this.material.aoMap.repeat.set(repeatU, repeatV);
  }
  if (this.material.emissiveMap){
    this.material.emissiveMap.repeat.set(repeatU, repeatV);
  }
  if (this.material.normalMap){
    this.material.normalMap.repeat.set(repeatU, repeatV);
  }
  if (this.material.specularMap){
    this.material.specularMap.repeat.set(repeatU, repeatV);
  }
  if (this.material.displacementMap){
    this.material.displacementMap.repeat.set(repeatU, repeatV);
  }

  this.material.needsUpdate = true;

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
