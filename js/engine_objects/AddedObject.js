var AddedObject = function(name, type, metaData, material, mesh, physicsBody, destroyedGrids){
  this.isAddedObject = true;
  if (IS_WORKER_CONTEXT){
    return this;
  }
  this.name = name;
  this.type = type;
  this.metaData = metaData;
  this.material = material;
  this.mesh = mesh;
  this.physicsBody = physicsBody;
  this.destroyedGrids = destroyedGrids;

  this.physicsBody.addedObject = this;

  if (material.isBasicMaterial){
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
  }else if (type == "cylinder"){
    this.metaData["widthSegments"] = 8;
  }

  this.metaData["textureRepeatU"] = 1;
  this.metaData["textureRepeatV"] = 1;

  this.associatedTexturePack = 0;

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.initQuaternion = this.mesh.quaternion.clone();

  this.boundCallbackFunction = this.collisionCallback.bind(this);

  this.reusableVec3 = new THREE.Vector3();
  this.reusableVec3_2 = new THREE.Vector3();
  this.reusableVec3_3 = new THREE.Vector3();

  this.prevPositionVector = new THREE.Vector3();
  this.isIntersectable = true;

  this.lastUpdatePosition = new THREE.Vector3();
  this.lastUpdateQuaternion = new THREE.Quaternion();

  webglCallbackHandler.registerEngineObject(this);

}

AddedObject.prototype.handleRotation = function(axis, radians){
  if (this.pivotObject){
    this.prevPositionVector.copy(this.mesh.position);
    this.rotateAroundPivotObject(axis, radians);
    physicsWorld.updateObject(this, false, true);
    if (this.autoInstancedParent){
      this.autoInstancedParent.updateObject(this);
    }
    this.onPositionChange(this.prevPositionVector, this.mesh.position);
    return;
  }
  this.rotate(axis, radians, true);
  physicsWorld.updateObject(this, false, true);
  if (this.autoInstancedParent){
    this.autoInstancedParent.updateObject(this);
  }
}

AddedObject.prototype.setVelocity = function(velocityVector){
  this.physicsBody.velocity.set(velocityVector.x, velocityVector.y, velocityVector.z);
  physicsWorld.setObjectVelocity(this, velocityVector);
}

AddedObject.prototype.setVelocityX = function(velocityX){
  this.physicsBody.velocity.x = velocityX;
  physicsWorld.setObjectVelocityX(this, velocityX);
}

AddedObject.prototype.setVelocityY = function(velocityY){
  this.physicsBody.velocity.y = velocityY;
  physicsWorld.setObjectVelocityY(this, velocityY);
}

AddedObject.prototype.setVelocityZ = function(velocityZ){
  this.physicsBody.velocity.z = velocityZ;
  physicsWorld.setObjectVelocityZ(this, velocityZ);
}

AddedObject.prototype.resetVelocity = function(){
  this.physicsBody.velocity.set(0, 0, 0);
  this.physicsBody.angularVelocity.set(0, 0, 0);
  physicsWorld.resetObjectVelocity(this);
}

AddedObject.prototype.show = function(){
  if (!this.isVisibleOnThePreviewScene()){
    this.mesh.visible = true;
    if (this.autoInstancedParent){
      this.autoInstancedParent.showObject(this);
    }
    if (!this.physicsKeptWhenHidden){
      if (!this.noMass){
        setTimeout(function(){
          physicsWorld.addBody(this.physicsBody);
        });
        physicsWorld.show(this);
        if (physicsDebugMode){
          debugRenderer.show(this);
        }
      }
    }
    this.isHidden = false;
    rayCaster.show(this);
  }
}

AddedObject.prototype.hide = function(keepPhysics){
  if (this.isVisibleOnThePreviewScene()){
    this.mesh.visible = false;
    if (this.autoInstancedParent){
      this.autoInstancedParent.hideObject(this);
    }
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

AddedObject.prototype.onPositionChange = function(from, to){
  if(mode == 0){
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

AddedObject.prototype.collisionCallback = function(collisionEvent){
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

AddedObject.prototype.exportLightweight = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  this.mesh.updateMatrixWorld();
  var exportObject = new Object();
  exportObject.type = this.type;
  exportObject.isChangeable = this.isChangeable;
  exportObject.isSlippery = this.metaData["isSlippery"];
  exportObject.isIntersectable = this.isIntersectable;
  if (!this.parentObjectName){
    exportObject.position = this.mesh.position.clone();
    exportObject.quaternion = this.mesh.quaternion.clone();
  }else{
    exportObject.position = new THREE.Vector3(this.positionXWhenAttached, this.positionYWhenAttached, this.positionZWhenAttached);
    exportObject.quaternion = new THREE.Quaternion(this.qxWhenAttached, this.qyWhenAttached, this.qzWhenAttached, this.qwWhenAttached);
    exportObject.positionWhenAttached = exportObject.position.clone();
    exportObject.quaternionWhenAttached = exportObject.quaternion.clone();
  }
  exportObject.vertices = [];
  exportObject.triangles = [];
  exportObject.pseudoFaces = [];
  exportObject.parentBoundingBoxIndex = this.parentBoundingBoxIndex;
  exportObject.matrixWorld = this.mesh.matrixWorld.elements;
  for (var i = 0; i<this.vertices.length; i++){
    exportObject.vertices.push({x: this.vertices[i].x, y: this.vertices[i].y, z: this.vertices[i].z})
  }
  for (var i = 0; i<this.triangles.length; i++){
    exportObject.triangles.push({a: this.triangles[i].a, b: this.triangles[i].b, c: this.triangles[i].c})
  }
  for (var i = 0; i<this.pseudoFaces.length; i++){
    exportObject.pseudoFaces.push(this.pseudoFaces[i]);
  }
  exportObject.metaData = this.metaData;
  exportObject.mass = this.physicsBody.mass;
  exportObject.noMass = this.noMass;
  if (!this.parentObjectName){
    exportObject.physicsPosition = {x: this.physicsBody.position.x, y: this.physicsBody.position.y, z: this.physicsBody.position.z};
    exportObject.physicsQuaternion = {x: this.physicsBody.quaternion.x, y: this.physicsBody.quaternion.y, z: this.physicsBody.quaternion.z, w: this.physicsBody.quaternion.w};
  }else{
    exportObject.hasParent = true;
    exportObject.physicsPosition = this.physicsPositionWhenAttached;
    exportObject.physicsQuaternion = this.physicsQuaternionWhenAttached;
  }
  return exportObject;
}

AddedObject.prototype.export = function(){
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

  exportObject["isIntersectable"] = this.isIntersectable;

  if (!this.parentObjectName){
    exportObject["opacity"] = this.mesh.material.uniforms.alpha.value;
  }else{
    exportObject["opacity"] = this.opacityWhenAttached;
  }
  if (this.hasAOMap()){
    if (!this.parentObjectName){
      exportObject["aoMapIntensity"] = this.mesh.material.uniforms.aoIntensity.value;
    }else{
      exportObject["aoMapIntensity"] = this.aoIntensityWhenAttached;
    }
  }else{
    exportObject["aoMapIntensity"] = this.material.aoMapIntensity;
  }
  if (this.hasEmissiveMap()){
    if (!this.parentObjectName){
      exportObject["emissiveIntensity"] = this.mesh.material.uniforms.emissiveIntensity.value;
      exportObject["emissiveColor"] = "#"+this.mesh.material.uniforms.emissiveColor.value.getHexString();
    }else{
      exportObject["emissiveIntensity"] = this.emissiveIntensityWhenAttached;
      exportObject["emissiveColor"] = "#"+this.emissiveColorWhenAttached.getHexString();
    }
  }else{
    exportObject["emissiveIntensity"] = this.material.emissiveIntensity;
    exportObject["emissiveColor"] = this.material.emissiveColor;
  }

  exportObject["textureOffsetX"] = this.getTextureOffsetX();
  exportObject["textureOffsetY"] = this.getTextureOffsetY();
  exportObject["textureRepeatU"] = this.getTextureRepeatX();
  exportObject["textureRepeatV"] = this.getTextureRepeatY();

  if (this.hasDiffuseMap()){
    var diffuseMap = this.mesh.material.uniforms.diffuseMap.value;
    exportObject["diffuseRoygbivTexturePackName"] = diffuseMap.roygbivTexturePackName;
    exportObject["diffuseRoygbivTextureName"] =  diffuseMap.roygbivTextureName;
  }
  if (this.hasAlphaMap()){
    var alphaMap = this.mesh.material.uniforms.alphaMap.value;
    exportObject["alphaRoygbivTexturePackName"] = alphaMap.roygbivTexturePackName;
    exportObject["alphaRoygbivTextureName"] = alphaMap.roygbivTextureName;
  }
  if (this.hasAOMap()){
    var aoMap = this.mesh.material.uniforms.aoMap.value;
    exportObject["aoRoygbivTexturePackName"] = aoMap.roygbivTexturePackName;
    exportObject["aoRoygbivTextureName"] = aoMap.roygbivTextureName;
  }
  if (this.hasEmissiveMap()){
    var emissiveMap = this.mesh.material.uniforms.emissiveMap.value;
    exportObject["emissiveRoygbivTexturePackName"] = emissiveMap.roygbivTexturePackName;
    exportObject["emissiveRoygbivTextureName"] = emissiveMap.roygbivTextureName;
  }
  if (this.hasDisplacementMap()){
    var displacementMap = this.mesh.material.uniforms.displacementMap.value;
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
  }

  var blendingModeInt = this.mesh.material.blending;
  if (blendingModeInt == NO_BLENDING){
    exportObject.blendingMode = "NO_BLENDING";
  }else if (blendingModeInt == NORMAL_BLENDING){
    exportObject.blendingMode = "NORMAL_BLENDING";
  }else if (blendingModeInt == ADDITIVE_BLENDING){
    exportObject.blendingMode = "ADDITIVE_BLENDING";
  }else if (blendingModeInt == SUBTRACTIVE_BLENDING){
    exportObject.blendingMode = "SUBTRACTIVE_BLENDING";
  }else if (blendingModeInt == MULTIPLY_BLENDING){
    exportObject.blendingMode = "MULTIPLY_BLENDING";
  }

  if (this.metaData.isSlippery){
    exportObject.isSlippery = true;
  }else{
    exportObject.isSlippery = false;
  }

  if (this.isChangeable){
    exportObject.isChangeable = true;
  }else{
    exportObject.isChangeable = false;
  }
  if (this.isColorizable){
    exportObject.isColorizable = true;
  }else{
    exportObject.isColorizable = false;
  }

  if (this.noMass){
    exportObject.noMass = true;
  }else{
    exportObject.noMass = false;
  }

  if (this.areaVisibilityConfigurations){
    exportObject.areaVisibilityConfigurations = this.areaVisibilityConfigurations;
  }
  if (this.areaSideConfigurations){
    exportObject.areaSideConfigurations = this.areaSideConfigurations;
  }

  if (this.pivotObject){
    exportObject.hasPivot = true;
    exportObject.pivotOffsetX = this.pivotOffsetX;
    exportObject.pivotOffsetY = this.pivotOffsetY;
    exportObject.pivotOffsetZ = this.pivotOffsetZ;
    exportObject.positionX = this.mesh.position.x;
    exportObject.positionY = this.mesh.position.y;
    exportObject.positionZ = this.mesh.position.z;
    exportObject.pivotQX = this.pivotObject.quaternion.x;
    exportObject.pivotQY = this.pivotObject.quaternion.y;
    exportObject.pivotQZ = this.pivotObject.quaternion.z;
    exportObject.pivotQW = this.pivotObject.quaternion.w;
    exportObject.insidePivotQX = this.pivotObject.children[0].quaternion.x;
    exportObject.insidePivotQY = this.pivotObject.children[0].quaternion.y;
    exportObject.insidePivotQZ = this.pivotObject.children[0].quaternion.z;
    exportObject.insidePivotQW = this.pivotObject.children[0].quaternion.w;
    if (this.parentObjectName){
      var objGroup = objectGroups[this.parentObjectName];
      if (objGroup){
        exportObject.positionX = this.physicsBody.position.x;
        exportObject.positionY = this.physicsBody.position.y;
        exportObject.positionZ = this.physicsBody.position.z;
      }
    }
  }else if (this.pivotRemoved){
    exportObject.pivotRemoved = true;
    exportObject.positionX = this.mesh.position.x;
    exportObject.positionY = this.mesh.position.y;
    exportObject.positionZ = this.mesh.position.z;
    if (this.parentObjectName){
      var objGroup = objectGroups[this.parentObjectName];
      if (objGroup){
        exportObject.positionX = this.physicsBody.position.x;
        exportObject.positionY = this.physicsBody.position.y;
        exportObject.positionZ = this.physicsBody.position.z;
      }
    }
  }

  if (this.softCopyParentName){
    exportObject.softCopyParentName = this.softCopyParentName;
  }

  if (this.hasTexture()){
    exportObject.txtMatrix = this.mesh.material.uniforms.textureMatrix.value.elements;
  }
  exportObject.isRotationDirty = this.isRotationDirty;
  return exportObject;
}

AddedObject.prototype.forceColor = function(r, g, b, a){
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
  this.mesh.material.needsUpdate = true;
}

AddedObject.prototype.resetColor = function(){
  if (!this.isColorizable){
    return;
  }
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
  if (this.pivotObject){
    this.originalPivotObject = this.pivotObject;
    this.originalPivotOffsetX = this.pivotOffsetX;
    this.originalPivotOffsetY = this.pivotOffsetY;
    this.originalPivotOffsetZ = this.pivotOffsetZ;
  }
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
  if (this.type == "sphere"){
    return true;
  }
  if (this.type != "surface"){
    return false;
  }
  if (this.metaData.widthSegments == 1 && this.metaData.heightSegments == 1){
    return true;
  }
  return false;
}

AddedObject.prototype.sliceInHalf = function(type){
  if (!this.isSlicable()){
    return;
  }
  var newGeometry;
  if (this.type == "sphere"){
    if (type == 0 || type == 1 || type == 2 || type == 3){
      var geomKey = (
        "SphereBufferGeometry" + PIPE +
        Math.abs(this.metaData.radius) + PIPE +
        this.metaData.widthSegments + PIPE + this.metaData.heightSegments + PIPE +
        "SLICED" + PIPE + type
      );
      var cachedGeom = geometryCache[geomKey];
      this.metaData.slicedType = type;
      if (!cachedGeom){
        if (type == 0){
          newGeometry = new THREE.SphereBufferGeometry(
            this.metaData.radius, this.metaData.widthSegments,
            this.metaData.heightSegments, 0, 2 * Math.PI, 0, 0.5 * Math.PI);
        }else if (type == 1){
          newGeometry = new THREE.SphereBufferGeometry(
            this.metaData.radius, this.metaData.widthSegments,
            this.metaData.heightSegments, 0, Math.PI, 0, Math.PI);
        }else if (type == 2){
          newGeometry = new THREE.SphereBufferGeometry(
            this.metaData.radius, this.metaData.widthSegments,
            this.metaData.heightSegments, 0, 2 * Math.PI, Math.PI / 2, 0.5 * Math.PI);
        }else if (type == 3){
          newGeometry = new THREE.SphereBufferGeometry(
            this.metaData.radius, this.metaData.widthSegments,
            this.metaData.heightSegments, Math.PI, Math.PI, 0, Math.PI);
        }
        geometryCache[geomKey] = newGeometry;
      }else{
        newGeometry = cachedGeom;
      }
    }else{
      var originalGeomKey = (
        "SphereBufferGeometry" + PIPE +
        Math.abs(this.metaData.radius) + PIPE +
        this.metaData.widthSegments + PIPE + this.metaData.heightSegments
      );
      newGeometry = geometryCache[originalGeomKey];
      delete this.metaData.slicedType;
    }
  }else if (this.type == "surface"){
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
  }

  scene.remove(this.mesh);
  var newMesh = new THREE.Mesh(newGeometry, this.mesh.material);
  newMesh.position.copy(this.mesh.position);
  newMesh.quaternion.copy(this.mesh.quaternion);
  newMesh.addedObject = this;
  this.mesh = newMesh;
  webglCallbackHandler.registerEngineObject(this);
  scene.add(this.mesh);
  this.generateBoundingBoxes();
}

AddedObject.prototype.syncProperties = function(refObject){
  // TEXTURE OFFSETS
  if (refObject.hasTexture() && this.hasTexture()){
    var m1 = this.mesh.material.uniforms.textureMatrix.value.elements;
    var m2 = refObject.mesh.material.uniforms.textureMatrix.value.elements;
    for (var i = 0; i<m2.length; i++){
      m1[i] = m2[i];
    }
  }
  // OPACITY
  var refOpacity = refObject.mesh.material.uniforms.alpha.value;
  this.updateOpacity(refOpacity);
  this.initOpacitySet = false;
  // AO INTENSITY
  if (refObject.hasAOMap() && this.hasAOMap()){
    var refAOIntensity = refObject.mesh.material.uniforms.aoIntensity.value;
    this.mesh.material.uniforms.aoIntensity.value = refAOIntensity
  }
  // EMISSIVE INTENSITY
  if (refObject.hasEmissiveMap() && this.hasEmissiveMap()){
    var refMaterial = refObject.mesh.material;
    var refEmissiveIntensity = refMaterial.uniforms.emissiveIntensity.value;
    this.mesh.material.uniforms.emissiveIntensity.value = refEmissiveIntensity;
    // EMISSIVE COLOR
    var refEmissiveColor = refMaterial.uniforms.emissiveColor.value;
    this.mesh.material.uniforms.emissiveColor.value.copy(refEmissiveColor);
  }
  // DISPLACEMENT
    if (refObject.hasDisplacementMap() && this.hasDisplacementMap()){
    var refDispX = refObject.mesh.material.uniforms.displacementInfo.value.x;
    var refDispY = refObject.mesh.material.uniforms.displacementInfo.value.y;
    this.mesh.material.uniforms.displacementInfo.value.x = refDispX;
    this.mesh.material.uniforms.displacementInfo.value.y = refDispY;
  }
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
  this.physicsPositionWhenAttached = {x: this.physicsBody.position.x, y: this.physicsBody.position.y, z: this.physicsBody.position.z};
  this.physicsQuaternionWhenAttached = {x: this.physicsBody.quaternion.x, y: this.physicsBody.quaternion.y, z: this.physicsBody.quaternion.z, w: this.physicsBody.quaternion.w};
  this.opacityWhenAttached = this.mesh.material.uniforms.alpha.value;
  if (this.hasAOMap()){
    this.aoIntensityWhenAttached = this.mesh.material.uniforms.aoIntensity.value;
  }
  if (this.hasEmissiveMap()){
    this.emissiveIntensityWhenAttached = this.mesh.material.uniforms.emissiveIntensity.value;
    this.emissiveColorWhenAttached = this.mesh.material.uniforms.emissiveColor.value.clone();
  }
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
  return !(typeof this.mesh.material.uniforms.emissiveMap == UNDEFINED);
}

AddedObject.prototype.unMapEmissive = function(){
  if (this.hasEmissiveMap()){
    delete this.mesh.material.uniforms.emissiveMap;
    delete this.mesh.material.uniforms.emissiveIntensity;
    delete this.mesh.material.uniforms.emissiveColor;
    macroHandler.removeMacro("HAS_EMISSIVE", this.mesh.material, false, true);
    if (!this.hasTexture()){
      delete this.mesh.material.uniforms.textureMatrix;
      macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
    }
  }
}

AddedObject.prototype.mapEmissive = function(emissiveMap){
  if (!this.hasTexture()){
    var tMatrix = new THREE.Matrix3();
    tMatrix.setUvTransform(0, 0, 1, 1, 0, 0, 0);
    this.mesh.material.uniforms.textureMatrix = new THREE.Uniform(tMatrix);
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  if (this.hasEmissiveMap()){
    this.mesh.material.uniforms.emissiveMap.value = emissiveMap;
  }else{
    this.mesh.material.uniforms.emissiveMap = this.getTextureUniform(emissiveMap);
    this.mesh.material.uniforms.emissiveIntensity = new THREE.Uniform(this.material.emissiveIntensity);
    this.mesh.material.uniforms.emissiveColor = new THREE.Uniform(new THREE.Color(this.material.emissiveColor));
    macroHandler.injectMacro("HAS_EMISSIVE", this.mesh.material, false, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  emissiveMap.updateMatrix();
}

AddedObject.prototype.hasDisplacementMap = function(){
  return !(typeof this.mesh.material.uniforms.displacementMap == UNDEFINED);
}

AddedObject.prototype.unMapDisplacement = function(){
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    console.error("Displacement mapping is not supported for this device.");
    return;
  }
  if (this.hasDisplacementMap()){
    delete this.mesh.material.uniforms.displacementMap;
    delete this.mesh.material.uniforms.displacementInfo;
    macroHandler.removeMacro("HAS_DISPLACEMENT", this.mesh.material, true, false);
    if (!this.hasTexture()){
      delete this.mesh.material.uniforms.textureMatrix;
      macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
    }
  }
}

AddedObject.prototype.mapDisplacement = function(displacementTexture){
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    console.error("Displacement mapping is not supported for this device.");
    return;
  }
  if (!this.hasTexture()){
    var tMatrix = new THREE.Matrix3();
    tMatrix.setUvTransform(0, 0, 1, 1, 0, 0, 0);
    this.mesh.material.uniforms.textureMatrix = new THREE.Uniform(tMatrix);
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  if (this.hasDisplacementMap()){
    this.mesh.material.uniforms.displacementMap.value = displacementTexture;
  }else{
    this.mesh.material.uniforms.displacementMap = this.getTextureUniform(displacementTexture);
    this.mesh.material.uniforms.displacementInfo = new THREE.Uniform(new THREE.Vector2());
    macroHandler.injectMacro("HAS_DISPLACEMENT", this.mesh.material, true, false);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  displacementTexture.updateMatrix();
}

AddedObject.prototype.hasAOMap = function(){
  return !(typeof this.mesh.material.uniforms.aoMap == UNDEFINED);
}

AddedObject.prototype.unMapAO = function(){
  if (this.hasAOMap()){
    delete this.mesh.material.uniforms.aoMap;
    delete this.mesh.material.uniforms.aoIntensity;
    macroHandler.removeMacro("HAS_AO", this.mesh.material, false, true);
    if (!this.hasTexture()){
      delete this.mesh.material.uniforms.textureMatrix;
      macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
    }
  }
}

AddedObject.prototype.mapAO = function(aoTexture){
  if (!this.hasTexture()){
    var tMatrix = new THREE.Matrix3();
    tMatrix.setUvTransform(0, 0, 1, 1, 0, 0, 0);
    this.mesh.material.uniforms.textureMatrix = new THREE.Uniform(tMatrix);
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  if (this.hasAOMap()){
    this.mesh.material.uniforms.aoMap.value = aoTexture;
  }else{
    this.mesh.material.uniforms.aoMap = this.getTextureUniform(aoTexture);
    this.mesh.material.uniforms.aoIntensity = new THREE.Uniform(this.material.aoMapIntensity);
    macroHandler.injectMacro("HAS_AO", this.mesh.material, false, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  aoTexture.updateMatrix();
}

AddedObject.prototype.hasAlphaMap = function(){
  return !(typeof this.mesh.material.uniforms.alphaMap == UNDEFINED);
}

AddedObject.prototype.unMapAlpha = function(){
  if (this.hasAlphaMap()){
    delete this.mesh.material.uniforms.alphaMap;
    macroHandler.removeMacro("HAS_ALPHA", this.mesh.material, false, true);
    if (!this.hasTexture()){
      delete this.mesh.material.uniforms.textureMatrix;
      macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
    }
  }
}

AddedObject.prototype.mapAlpha = function(alphaTexture){
  if (!this.hasTexture()){
    var tMatrix = new THREE.Matrix3();
    tMatrix.setUvTransform(0, 0, 1, 1, 0, 0, 0);
    this.mesh.material.uniforms.textureMatrix = new THREE.Uniform(tMatrix);
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  if (this.hasAlphaMap()){
    this.mesh.material.uniforms.alphaMap.value = alphaTexture;
  }else{
    this.mesh.material.uniforms.alphaMap = this.getTextureUniform(alphaTexture);
    macroHandler.injectMacro("HAS_ALPHA", this.mesh.material, false, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  alphaTexture.updateMatrix();
}

AddedObject.prototype.hasDiffuseMap = function(){
  return !(typeof this.mesh.material.uniforms.diffuseMap == UNDEFINED);
}

AddedObject.prototype.unMapDiffuse = function(){
  if (this.hasDiffuseMap()){
    delete this.mesh.material.uniforms.diffuseMap;
    macroHandler.removeMacro("HAS_DIFFUSE", this.mesh.material, false, true);
    if (!this.hasTexture()){
      delete this.mesh.material.uniforms.textureMatrix;
      macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
    }
  }
}

AddedObject.prototype.mapDiffuse = function(diffuseTexture){
  if (!this.hasTexture()){
    var tMatrix = new THREE.Matrix3();
    tMatrix.setUvTransform(0, 0, 1, 1, 0, 0, 0);
    this.mesh.material.uniforms.textureMatrix = new THREE.Uniform(tMatrix);
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  if (this.hasDiffuseMap()){
    this.mesh.material.uniforms.diffuseMap.value = diffuseTexture
  }else{
    this.mesh.material.uniforms.diffuseMap = this.getTextureUniform(diffuseTexture);
    macroHandler.injectMacro("HAS_DIFFUSE", this.mesh.material, false, true);
    this.mesh.material.uniformsNeedUpdate = true;
  }
  diffuseTexture.updateMatrix();
}

AddedObject.prototype.incrementOpacity = function(val){
  this.mesh.material.uniforms.alpha.value += val;
}

AddedObject.prototype.updateOpacity = function(val){
  this.mesh.material.uniforms.alpha.value = val;
}

AddedObject.prototype.multiplyOpacity = function(val){
  this.mesh.material.uniforms.alpha.value *= val;
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
  if (this.hasDisplacementMap()){
    texturesStack.push(this.mesh.material.uniforms.displacementMap.value);
  }
  return texturesStack;
}

AddedObject.prototype.getPositionAtAxis = function(axis){
  if (axis.toLowerCase() == "x"){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere" || this.type == "cylinder"){
      return parseInt(this.metaData["centerX"]);
    }else if (this.type == "surface"){
      return parseInt(this.metaData["positionX"]);
    }
  }else if (axis.toLowerCase() == "y"){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere" || this.type == "cylinder"){
      return parseInt(this.metaData["centerY"]);
    }else if (this.type == "surface"){
      return parseInt(this.metaData["positionY"]);
    }
  }else if (axis.toLowerCase() == "z"){
    if (this.type == "box" || this.type == "ramp" || this.type == "sphere" || this.type == "cylinder"){
      return parseInt(this.metaData["centerZ"]);
    }else if (this.type == "surface"){
      return parseInt(this.metaData["positionZ"]);
    }
  }
}

AddedObject.prototype.untrackObjectPosition = function(){
  delete this.trackedObject;
  delete trackingObjects[this.name];
}

AddedObject.prototype.trackObjectPosition = function(targetObject){
  this.trackedObject = targetObject;
  targetObject.isTracked = true;
  trackingObjects[this.name] = this;
  targetObject.oldPX = targetObject.physicsBody.position.x;
  targetObject.oldPY = targetObject.physicsBody.position.y;
  targetObject.oldPZ = targetObject.physicsBody.position.z;
}

AddedObject.prototype.setPosition = function(x, y, z){
  this.prevPositionVector.copy(this.mesh.position);
  this.mesh.position.set(x, y, z);
  this.physicsBody.position.set(x, y, z);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
  physicsWorld.updateObject(this, true, false);
  if (this.autoInstancedParent){
    this.autoInstancedParent.updateObject(this);
  }
  this.onPositionChange(this.prevPositionVector, this.mesh.position);
}

AddedObject.prototype.resetPosition = function(){
  var mesh = this.mesh;
  var physicsBody = this.physicsBody;
  if (this.type == "box" || this.type == "ramp" || this.type == "sphere" || this.type == "cylinder"){
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
  if (axis == "x"){
    this.mesh.translateX(amount);
  }else if (axis == "y"){
    this.mesh.translateY(amount);
  }else if (axis == "z"){
    this.mesh.translateZ(amount);
  }
  physicsBody.position.copy(this.mesh.position);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

AddedObject.prototype.rotatePivotAroundXYZ = function(x, y, z, axis, axisVector, radians){
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
  this.setPhysicsAfterRotationAroundPoint(axis, radians);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

AddedObject.prototype.rotateAroundXYZ = function(x, y, z, axis, axisVector, radians){
  if (this.pivotObject){
    this.rotatePivotAroundXYZ(x, y, z, axis, axisVector, radians);
    return;
  }
  var point = REUSABLE_VECTOR.set(x, y, z);
  if (this.mesh.parent){
    this.mesh.parent.localToWorld(this.mesh.position);
  }
  this.mesh.position.sub(point);
  this.mesh.position.applyAxisAngle(axisVector, radians);
  this.mesh.position.add(point);
  if (this.mesh.parent){
    this.mesh.parent.worldToLocal(this.mesh.position);
  }
  this.mesh.rotateOnAxis(axisVector, radians);
  this.setPhysicsAfterRotationAroundPoint(axis, radians);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
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
  }else if (this.type == "cylinder"){
    this.rotateCylinder(axis, radians, fromScript);
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

  if (this.mesh.visible){
    rayCaster.updateObject(this);
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
  }else if (this.type == "cylinder"){
    this.setCylinderPhysicsAfterRotationAroundPoint(axis, radians);
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

AddedObject.prototype.setCylinderPhysicsAfterRotationAroundPoint = function(axis, radians){
  var physicsBody = this.physicsBody;
  var gridSystemAxis = this.metaData.gridSystemAxis;
  if (gridSystemAxis == "XZ"){
    physicsBody.quaternion.copy(this.mesh.quaternion);
  }else if (gridSystemAxis == "XY"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_X, -Math.PI/2);
    REUSABLE_QUATERNION.multiply(REUSABLE_QUATERNION2);
    physicsBody.quaternion.copy(REUSABLE_QUATERNION);
  }else if (gridSystemAxis == "YZ"){
    REUSABLE_QUATERNION.copy(this.mesh.quaternion);
    REUSABLE_QUATERNION2.setFromAxisAngle(THREE_AXIS_VECTOR_Z, Math.PI/2);
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

AddedObject.prototype.rotateCylinder = function(axis, radians, fromScript){
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
  this.rotatePhysicsBody(axis, radians);
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

AddedObject.prototype.rotatePhysicsBody = function(axis, radians){
  if (axis.toLowerCase() == "x"){
    REUSABLE_CANNON_QUATERNION.setFromAxisAngle(CANNON_AXIS_VECTOR_X, radians);
  }else if (axis.toLowerCase() == "y"){
    REUSABLE_CANNON_QUATERNION.setFromAxisAngle(CANNON_AXIS_VECTOR_Y, radians);
  }else if (axis.toLowerCase() == "z"){
    REUSABLE_CANNON_QUATERNION.setFromAxisAngle(CANNON_AXIS_VECTOR_Z, radians);
  }
  REUSABLE_CANNON_QUATERNION.mult(this.physicsBody.quaternion, REUSABLE_CANNON_QUATERNION_2);
  this.physicsBody.quaternion.copy(REUSABLE_CANNON_QUATERNION_2);
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

AddedObject.prototype.destroy = function(skipRaycasterRefresh){
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  if (this.destroyedGrids){
    for (var gridName in this.destroyedGrids){
      this.destroyedGrids[gridName].destroyedAddedObject = 0;
    }
  }
  this.dispose();
  if (!skipRaycasterRefresh){
    rayCaster.refresh();
  }
}

AddedObject.prototype.dispose = function(){

  if (this.hasDiffuseMap()){
    this.mesh.material.uniforms.diffuseMap.value.dispose();
  }
  if (this.hasAlphaMap()){
    this.mesh.material.uniforms.alphaMap.value.dispose();
  }
  if (this.hasAOMap()){
    this.mesh.material.uniforms.aoMap.value.dispose();
  }
  if (this.hasDisplacementMap()){
    this.mesh.material.uniforms.displacementMap.value.dispose();
  }
  if (this.hasEmissiveMap()){
    this.mesh.material.uniforms.emissiveMap.value.dispose();
  }

  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
}

AddedObject.prototype.mapTexturePack = function(texturePack){
  this.resetMaps();
  if (texturePack.hasDiffuse){
    this.mapDiffuse(texturePack.diffuseTexture);
    this.mesh.material.uniforms.diffuseMap.value.roygbivTexturePackName = texturePack.name;
    this.mesh.material.uniforms.diffuseMap.value.roygbivTextureName = 0;
    this.mesh.material.uniforms.diffuseMap.value.needsUpdate = true;
  }
  if (texturePack.hasAlpha){
    this.mapAlpha(texturePack.alphaTexture);
    this.mesh.material.uniforms.alphaMap.value.roygbivTexturePackName = texturePack.name;
    this.mesh.material.uniforms.alphaMap.value.roygbivTextureName = 0;
    this.mesh.material.uniforms.alphaMap.value.needsUpdate = true;
  }
  if (texturePack.hasAO){
    this.mapAO(texturePack.aoTexture);
    this.mesh.material.uniforms.aoMap.value.roygbivTexturePackName = texturePack.name;
    this.mesh.material.uniforms.aoMap.value.roygbivTextureName = 0;
    this.mesh.material.uniforms.aoMap.value.needsUpdate = true;
  }
  if (texturePack.hasEmissive){
    this.mapEmissive(texturePack.emissiveTexture);
    this.mesh.material.uniforms.emissiveMap.value.roygbivTexturePackName = texturePack.name;
    this.mesh.material.uniforms.emissiveMap.value.roygbivTextureName = 0;
    this.mesh.material.uniforms.emissiveMap.value.needsUpdate = true;
  }
  if (texturePack.hasHeight && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    this.mapDisplacement(texturePack.heightTexture);
    this.mesh.material.uniforms.displacementMap.value.roygbivTexturePackName = texturePack.name;
    this.mesh.material.uniforms.displacementMap.value.roygbivTextureName = 0;
    this.mesh.material.uniforms.displacementMap.value.needsUpdate = true;
  }
  this.associatedTexturePack = texturePack.name;
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
  }else if (this.type == "cylinder"){
    var height = this.metaData["height"];
    var topRadius = this.metaData["topRadius"];
    var bottomRadius = this.metaData["bottomRadius"];
    var isOpenEnded = this.metaData["isOpenEnded"];
    if (!isCustom){
      var geomKey = (
        "CylinderBufferGeometry" + PIPE + height + PIPE + topRadius + PIPE + bottomRadius + PIPE +
        cylinderWidthSegments + PIPE + cylinderHeightSegments + PIPE + isOpenEnded
      );
      newGeometry = geometryCache[geomKey];
      if (!newGeometry){
        newGeometry = new THREE.CylinderBufferGeometry(
          topRadius, bottomRadius, height, cylinderWidthSegments, cylinderHeightSegments, isOpenEnded
        );
        geometryCache[geomKey] = newGeometry;
      }
      this.modifyCylinderPhysicsAfterSegmentChange(cylinderWidthSegments);
    }else{
      if (!isNaN(count)){
        if (count < 8){
          count = 8;
        }
        if (returnGeometry){
          var geomKey = (
            "CylinderGeometry" + PIPE + height + PIPE + topRadius + PIPE + bottomRadius + PIPE +
            count + PIPE + count + PIPE + isOpenEnded
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.CylinderGeometry(
              topRadius, bottomRadius, height, count, count, isOpenEnded
            );
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "CylinderBufferGeometry" + PIPE + height + PIPE + topRadius + PIPE + bottomRadius + PIPE +
            count + PIPE + count + PIPE + isOpenEnded
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.CylinderBufferGeometry(
              topRadius, bottomRadius, height, count, count, isOpenEnded
            );
            geometryCache[geomKey] = newGeometry;
          }
          this.modifyCylinderPhysicsAfterSegmentChange(count);
        }
      }else{
        if (count.width < 8){
          count.width = 8;
        }
        if (count.height < 1){
          count.height = 1;
        }
        if (returnGeometry){
          var geomKey = (
            "CylinderGeometry" + PIPE + height + PIPE + topRadius + PIPE + bottomRadius + PIPE +
            count.width + PIPE + count.height + PIPE + isOpenEnded
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.CylinderGeometry(
              topRadius, bottomRadius, height, count.width, count.height, isOpenEnded
            );
            geometryCache[geomKey] = newGeometry;
          }
        }else{
          var geomKey = (
            "CylinderBufferGeometry" + PIPE + height + PIPE + topRadius + PIPE + bottomRadius + PIPE +
            count.width + PIPE + count.height + PIPE + isOpenEnded
          );
          newGeometry = geometryCache[geomKey];
          if (!newGeometry){
            newGeometry = new THREE.CylinderBufferGeometry(
              topRadius, bottomRadius, height, count.width, count.height, isOpenEnded
            );
            geometryCache[geomKey] = newGeometry;
          }
          this.modifyCylinderPhysicsAfterSegmentChange(count.width);
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
  webglCallbackHandler.registerEngineObject(this);
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
  }else if (this.type == "cylinder"){
    if (!isCustom){
      this.metaData["widthSegments"] = cylinderWidthSegments;
      this.metaData["heightSegments"] = cylinderHeightSegments;
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
}

AddedObject.prototype.modifyCylinderPhysicsAfterSegmentChange = function(radialSegments){
  var topRadius = this.metaData.topRadius;
  var bottomRadius = this.metaData.bottomRadius;
  var height = this.metaData.height;
  var oldPosition = this.physicsBody.position.clone();
  var oldQuaternion = this.physicsBody.quaternion.clone();
  if (!this.noMass){
    physicsWorld.remove(this.physicsBody);
  }
  this.metaData["physicsShapeParameterRadialSegments"] = radialSegments;
  this.physicsBody = physicsBodyGenerator.generateCylinderBody({
    topRadius: topRadius, bottomRadius: bottomRadius, height: height,
    radialSegments: radialSegments, axis: this.metaData.gridSystemAxis,
    material: this.physicsBody.material, mass: this.physicsBody.mass
  });
  this.physicsBody.position.copy(oldPosition);
  this.physicsBody.quaternion.copy(oldQuaternion);
  if (!this.noMass){
    physicsWorld.addBody(this.physicsBody);
  }
}

AddedObject.prototype.resetMaps = function(resetAssociatedTexturePack){
  this.unMapDiffuse();
  this.unMapAlpha();
  this.unMapAO();
  this.unMapDisplacement();
  this.unMapEmissive();
  if (resetAssociatedTexturePack){
    this.associatedTexturePack = 0;
  }
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
  if (this.hasTexture()){
    this.mesh.material.uniforms.textureMatrix.value.elements[0] = repeatU;
    this.mesh.material.uniforms.textureMatrix.value.elements[4] = repeatV;
  }
}

AddedObject.prototype.isVisibleOnThePreviewScene = function(parentName){
  if (typeof parentName == UNDEFINED){
    return !(this.isHidden);
  }else{
    return objectGroups[parentName].isVisibleOnThePreviewScene();
  }
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

AddedObject.prototype.getBlendingText = function(){
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
      if (triangle1 && triangle1.containsPoint(REUSABLE_VECTOR)){
        INTERSECTION_NORMAL.set(plane.normal.x, plane.normal.y, plane.normal.z);
        return REUSABLE_VECTOR;
      }else if (triangle2 && triangle2.containsPoint(REUSABLE_VECTOR)){
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
  this.lastUpdatePosition.copy(this.mesh.position);
  this.lastUpdateQuaternion.copy(this.mesh.quaternion);
}

AddedObject.prototype.boundingBoxesNeedUpdate = function(){
  return !(Math.abs(this.lastUpdatePosition.x - this.mesh.position.x) < 0.1 &&
            Math.abs(this.lastUpdatePosition.y - this.mesh.position.y) < 0.1 &&
              Math.abs(this.lastUpdatePosition.z - this.mesh.position.z) < 0.1 &&
                Math.abs(this.lastUpdateQuaternion.x - this.mesh.quaternion.x) < 0.0001 &&
                  Math.abs(this.lastUpdateQuaternion.y - this.mesh.quaternion.y) < 0.0001 &&
                    Math.abs(this.lastUpdateQuaternion.z - this.mesh.quaternion.z) < 0.0001 &&
                      Math.abs(this.lastUpdateQuaternion.w - this.mesh.quaternion.w) < 0.0001);
}

AddedObject.prototype.generateBoundingBoxes = function(parentAry){
  var pseudoGeometry;
  if (typeof this.metaData.slicedType == UNDEFINED){
    pseudoGeometry = this.segmentGeometry(true, 1, true);
  }else{
    pseudoGeometry = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry);
  }
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

AddedObject.prototype.visualiseBoundingBoxes = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }
  if (this.bbHelpers){
    for (var i = 0; i<this.bbHelpers.length; i++){
      scene.remove(this.bbHelpers[i]);
    }
  }
  this.bbHelpers = [];
  for (var i = 0; i<this.boundingBoxes.length; i++){
    this.correctBoundingBox(this.boundingBoxes[i]);
    var bbHelper = new THREE.Box3Helper(this.boundingBoxes[i], LIME_COLOR);
    scene.add(bbHelper);
    this.bbHelpers.push(bbHelper);
  }
}

AddedObject.prototype.removeBoundingBoxesFromScene = function(){
  if (this.bbHelpers){
    for (var i = 0; i<this.bbHelpers.length; i++){
      scene.remove(this.bbHelpers[i]);
    }
  }
  this.bbHelpers = [];
}

AddedObject.prototype.getNormalGeometry = function(){
  if (!(typeof this.metaData.slicedType == UNDEFINED)){
    var geomKey = "SLICED_NORMAL_GEOMETRY_"+this.type+"_"+this.metaData.slicedType;
    if (geometryCache[geomKey]){
      return geometryCache[geomKey];
    }
    var geom = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry);
    geometryCache[geomKey] = geom;
    return geom;
  }
  var count = new Object();
  if (this.type == "surface" || this.type == "ramp" || this.type == "sphere" || this.type == "cylinder"){
    count.width = this.metaData["widthSegments"];
    count.height = this.metaData["heightSegments"];
  }else if (this.type == "box"){
    count.width = this.metaData["widthSegments"];
    count.height = this.metaData["heightSegments"];
    count.depth = this.metaData["depthSegments"];
  }
  return this.segmentGeometry(true, count, true);
}

AddedObject.prototype.setSlippery = function(isSlippery){
  if (isSlippery){
    this.setFriction(0);
    this.metaData["isSlippery"] = true;
  }else{
    this.setFriction(friction);
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
      physicsWorld.addContactMaterial(contact);
    }
  }
}

AddedObject.prototype.unsetRotationPivot = function(){
  delete this.pivotObject;
  delete this.pivotOffsetX;
  delete this.pivotOffsetY;
  delete this.pivotOffsetZ;
}

AddedObject.prototype.setRotationPivot = function(rotationPivot){
  if (this.pivotObject){
    rotationPivot.position.copy(this.pivotObject.position);
    rotationPivot.quaternion.copy(this.pivotObject.quaternion);
    rotationPivot.rotation.copy(this.pivotObject.rotation);
  }
  this.pivotObject = rotationPivot;
  this.pivotOffsetX = rotationPivot.offsetX;
  this.pivotOffsetY = rotationPivot.offsetY;
  this.pivotOffsetZ = rotationPivot.offsetZ;
}

AddedObject.prototype.makePivot = function(offsetX, offsetY, offsetZ){
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

AddedObject.prototype.rotateAroundPivotObject = function(axis, radians){
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
  this.setPhysicsAfterRotationAroundPoint(axis, radians);
  if (this.mesh.visible){
    rayCaster.updateObject(this);
  }
}

AddedObject.prototype.updatePivot = function(){
  if (!this.pivotObject){
    return;
  }
  this.pivotObject.position.copy(this.mesh.position);
  this.pivotObject.translateX(this.pivotOffsetX);
  this.pivotObject.translateY(this.pivotOffsetY);
  this.pivotObject.translateZ(this.pivotOffsetZ);
}

AddedObject.prototype.getEndPoint = function(axis){
  var translationAmount = 0;
  if (axis == "+x"){
    REUSABLE_VECTOR_6.set(1, 0, 0);
    if (this.type == "surface"){
      translationAmount = this.metaData.width / 2;
    }else if (this.type == "ramp"){
      translationAmount = this.metaData.rampWidth / 2;
    }else if (this.type == "box"){
      translationAmount = this.metaData.boxSizeX / 2;
    }else if (this.type == "sphere"){
      translationAmount = this.metaData.radius;
    }else if (this.type == "cylinder"){
      translationAmount = (this.metaData.topRadius + this.metaData.bottomRadius) / 2;
    }
  }else if (axis == "-x"){
    REUSABLE_VECTOR_6.set(-1, 0, 0);
    if (this.type == "surface"){
      translationAmount = this.metaData.width / 2;
    }else if (this.type == "ramp"){
      translationAmount = this.metaData.rampWidth / 2;
    }else if (this.type == "box"){
      translationAmount = this.metaData.boxSizeX / 2;
    }else if (this.type == "sphere"){
      translationAmount = this.metaData.radius;
    }else if (this.type == "cylinder"){
      translationAmount = (this.metaData.topRadius + this.metaData.bottomRadius) / 2;
    }
  }else if (axis == "+y"){
    REUSABLE_VECTOR_6.set(0, 1, 0);
    if (this.type == "surface"){
      translationAmount = this.metaData.height / 2;
    }else if (this.type == "ramp"){
      translationAmount = this.metaData.rampHeight / 2;
    }else if (this.type == "box"){
      translationAmount = this.metaData.boxSizeY / 2;
    }else if (this.type == "sphere"){
      translationAmount = this.metaData.radius;
    }else if (this.type == "cylinder"){
      translationAmount = this.metaData.height / 2;
    }
  }else if (axis == "-y"){
    REUSABLE_VECTOR_6.set(0, -1, 0);
    if (this.type == "surface"){
      translationAmount = this.metaData.height / 2;
    }else if (this.type == "ramp"){
      translationAmount = this.metaData.rampHeight / 2;
    }else if (this.type == "box"){
      translationAmount = this.metaData.boxSizeY / 2;
    }else if (this.type == "sphere"){
      translationAmount = this.metaData.radius;
    }else if (this.type == "cylinder"){
      translationAmount = this.metaData.height / 2;
    }
  }else if (axis == "+z"){
    REUSABLE_VECTOR_6.set(0, 0, 1);
    if (this.type == "surface"){
      translationAmount = 0;
    }else if (this.type == "ramp"){
      translationAmount = 0;
    }else if (this.type == "box"){
      translationAmount = this.metaData.boxSizeZ / 2;
    }else if (this.type == "sphere"){
      translationAmount = this.metaData.radius;
    }else if (this.type == "cylinder"){
      translationAmount = (this.metaData.topRadius + this.metaData.bottomRadius) / 2;
    }
  }else if (axis == "-z"){
    REUSABLE_VECTOR_6.set(0, 0, -1);
    if (this.type == "surface"){
      translationAmount = 0;
    }else if (this.type == "ramp"){
      translationAmount = 0;
    }else if (this.type == "box"){
      translationAmount = this.metaData.boxSizeZ / 2;
    }else if (this.type == "sphere"){
      translationAmount = this.metaData.radius;
    }else if (this.type == "cylinder"){
      translationAmount = (this.metaData.topRadius + this.metaData.bottomRadius) / 2;
    }
  }
  var quaternion, position;
  if (this.parentObjectName){
    var parentObject = objectGroups[this.parentObjectName];
    parentObject.graphicsGroup.position.copy(parentObject.mesh.position);
    parentObject.graphicsGroup.quaternion.copy(parentObject.mesh.quaternion);
    parentObject.graphicsGroup.updateMatrix();
    parentObject.graphicsGroup.updateMatrixWorld();
    var child = parentObject.graphicsGroup.children[this.indexInParent];
    child.getWorldPosition(REUSABLE_VECTOR_7);
    child.getWorldQuaternion(REUSABLE_QUATERNION);
    position = REUSABLE_VECTOR_7;
    quaternion = REUSABLE_QUATERNION;
  }else{
    quaternion = this.mesh.quaternion;
    position = REUSABLE_VECTOR_7.copy(this.mesh.position);
  }
  REUSABLE_VECTOR_6.applyQuaternion(quaternion);
  position.add(REUSABLE_VECTOR_6.multiplyScalar(translationAmount));
  return position;
}

AddedObject.prototype.copy = function(name, isHardCopy, copyPosition, gridSystem, fromScript){
  var copyMesh;
  if (isHardCopy){
    copyMesh = new MeshGenerator(this.mesh.geometry, this.material).generateMesh();
  }else{
    copyMesh = new THREE.Mesh(this.mesh.geometry, this.mesh.material);
  }
  var copyPhysicsbody = physicsBodyGenerator.generateBodyFromSameShape(this.physicsBody);
  copyMesh.position.copy(copyPosition);
  copyPhysicsbody.position.copy(copyPosition);
  copyMesh.quaternion.copy(this.mesh.quaternion);
  copyPhysicsbody.quaternion.copy(this.physicsBody.quaternion);
  var copyMetaData = Object.assign({}, this.metaData);

  var destroyedGrids = new Object();
  if (!fromScript && !jobHandlerWorking){
    var startRow, finalRow, startCol, finalCol;
    var grid1 = 0, grid2 = 0;
    for (var gridName in gridSelections){
      if (!grid1){
        grid1 = gridSelections[gridName];
      }else{
        grid2 = gridSelections[gridName];
      }
    }
    if (!grid2){
      grid2 = grid1;
    }
    if (!this.skipToggleGrid){
      grid1.toggleSelect(false, false, false, true);
      if (grid1.name != grid2.name){
        grid2.toggleSelect(false, false, false, true);
      }
      delete gridSelections[grid1.name];
      delete gridSelections[grid2.name];
    }
    startRow = grid1.rowNumber;
    if (grid2.rowNumber < grid1.rowNumber){
      startRow = grid2.rowNumber;
    }
    startCol = grid1.colNumber;
    if (grid2.colNumber < grid1.colNumber){
      startCol = grid2.colNumber;
    }
    finalRow = grid1.rowNumber;
    if (grid2.rowNumber > grid1.rowNumber){
      finalRow = grid2.rowNumber;
    }
    finalCol = grid1.colNumber;
    if (grid2.colNumber > grid1.colNumber){
      finalCol = grid2.colNumber;
    }
    for (var row = startRow; row <= finalRow; row++){
      for (var col = startCol; col <= finalCol; col++ ){
        var grid = gridSystem.getGridByColRow(col, row);
        if (grid){
          destroyedGrids[grid.name] = grid;
        }
      }
    }
  }
  if (jobHandlerWorking){
    destroyedGrids[jobHandlerSelectedGrid.name] = jobHandlerSelectedGrid;
  }
  var copyInstance = new AddedObject(
    name, this.type, copyMetaData, this.material, copyMesh, copyPhysicsbody, destroyedGrids
  );
  copyMesh.addedObject = copyInstance;
  copyInstance.updateMVMatrix();
  copyInstance.isCopied = true;
  copyInstance.copiedWithScript = fromScript;
  if (!fromScript && !jobHandlerWorking){
    copyInstance.metaData["grid1Name"] = grid1.name;
    copyInstance.metaData["grid2Name"] = grid2.name;
  }
  if (jobHandlerWorking){
    copyInstance.metaData["grid1Name"] = jobHandlerSelectedGrid.name;
    copyInstance.metaData["grid2Name"] = jobHandlerSelectedGrid.name;
  }
  copyInstance.metaData["positionX"] = copyMesh.position.x;
  copyInstance.metaData["positionY"] = copyMesh.position.y;
  copyInstance.metaData["positionZ"] = copyMesh.position.z;
  copyInstance.metaData["centerX"] = copyMesh.position.x;
  copyInstance.metaData["centerY"] = copyMesh.position.y;
  copyInstance.metaData["centerZ"] = copyMesh.position.z;
  copyInstance.metaData["quaternionX"] = copyMesh.quaternion.x;
  copyInstance.metaData["quaternionY"] = copyMesh.quaternion.y;
  copyInstance.metaData["quaternionZ"] = copyMesh.quaternion.z;
  copyInstance.metaData["quaternionW"] = copyMesh.quaternion.w;
  copyInstance.metaData["widthSegments"] = this.metaData["widthSegments"];
  copyInstance.metaData["heightSegments"] = this.metaData["heightSegments"];
  copyInstance.metaData["depthSegments"] = this.metaData["depthSegments"];

  copyInstance.rotationX = this.rotationX;
  copyInstance.rotationY = this.rotationY;
  copyInstance.rotationZ = this.rotationZ;
  if (this.physicsBody.mass != 0){
    copyInstance.setMass(this.physicsBody.mass);
  }
  copyInstance.noMass = this.noMass;
  copyInstance.isChangeable = this.isChangeable;
  copyInstance.isIntersectable = this.isIntersectable;
  copyInstance.isColorizable = this.isColorizable;
  if (this.metaData["isSlippery"]){
    copyInstance.setSlippery(true);
  }
  if (!(typeof this.metaData["renderSide"] == UNDEFINED)){
    copyInstance.handleRenderSide(this.metaData["renderSide"]);
  }
  if (!(typeof this.metaData.slicedType == UNDEFINED)){
    copyInstance.sliceInHalf(this.metaData.slicedType);
  }

  if (isHardCopy){
    if (this.material instanceof BasicMaterial){
      if (this.hasDiffuseMap()){
        copyInstance.mapDiffuse(this.mesh.material.uniforms.diffuseMap.value);
      }
      if (this.hasAlphaMap()){
        copyInstance.mapAlpha(this.mesh.material.uniforms.alphaMap.value);
      }
      if (this.hasAOMap()){
        copyInstance.mapAO(this.mesh.material.uniforms.aoMap.value);
        copyInstance.mesh.material.uniforms.aoIntensity.value = this.mesh.material.uniforms.aoIntensity.value;
      }
      if (this.hasDisplacementMap()){
        copyInstance.mapDisplacement(this.mesh.material.uniforms.displacementMap.value);
        copyInstance.mesh.material.uniforms.displacementInfo.value.x = this.mesh.material.uniforms.displacementInfo.value.x;
        copyInstance.mesh.material.uniforms.displacementInfo.value.y = this.mesh.material.uniforms.displacementInfo.value.y;
      }
      if (this.hasEmissiveMap()){
        copyInstance.mapEmissive(this.mesh.material.uniforms.emissiveMap.value);
        copyInstance.mesh.material.uniforms.emissiveIntensity.value = this.mesh.material.uniforms.emissiveIntensity.value;
        copyInstance.mesh.material.uniforms.emissiveColor.value = new THREE.Color().copy(this.mesh.material.uniforms.emissiveColor.value);
      }
    }
    copyInstance.updateOpacity(this.mesh.material.uniforms.alpha.value);
    if (this.hasTexture()){
      for (var ix = 0; ix<this.mesh.material.uniforms.textureMatrix.value.elements.length; ix++){
        copyInstance.mesh.material.uniforms.textureMatrix.value.elements[ix] = this.mesh.material.uniforms.textureMatrix.value.elements[ix];
      }
    }
  }

  if (this.pivotObject){
    var pivot = copyInstance.makePivot(this.pivotOffsetX, this.pivotOffsetY, this.pivotOffsetZ);
    copyInstance.pivotObject = pivot;
    copyInstance.pivotOffsetX = this.pivotOffsetX;
    copyInstance.pivotOffsetY = this.pivotOffsetY;
    copyInstance.pivotOffsetZ = this.pivotOffsetZ;
    copyInstance.pivotRemoved = false;
  }

  copyInstance.setBlending(this.mesh.material.blending);

  if (!isHardCopy){
    copyInstance.softCopyParentName = this.name;
  }

  copyInstance.createdWithScript = fromScript;

  return copyInstance;
}

AddedObject.prototype.hasTexture = function(){
  return (
    this.hasDiffuseMap() || this.hasAOMap() || this.hasAlphaMap() || this.hasEmissiveMap() || this.hasDisplacementMap()
  );
}

AddedObject.prototype.getTextureOffsetX = function(){
  if (this.hasTexture()){
    return this.mesh.material.uniforms.textureMatrix.value.elements[6];
  }
  return 0;
}

AddedObject.prototype.getTextureOffsetY = function(){
  if (this.hasTexture()){
    return this.mesh.material.uniforms.textureMatrix.value.elements[7];
  }
  return 0;
}

AddedObject.prototype.setTextureOffsetX = function(val){
  if (this.hasTexture()){
    this.mesh.material.uniforms.textureMatrix.value.elements[6] = val;
  }
}

AddedObject.prototype.setTextureOffsetY = function(val){
  if (this.hasTexture()){
    this.mesh.material.uniforms.textureMatrix.value.elements[7] = val;
  }
}

AddedObject.prototype.getTextureRepeatX = function(){
  if (this.hasTexture()){
    return this.mesh.material.uniforms.textureMatrix.value.elements[0];
  }
  return 1;
}

AddedObject.prototype.getTextureRepeatY = function(){
  if (this.hasTexture()){
    return this.mesh.material.uniforms.textureMatrix.value.elements[4];
  }
  return 1;
}

AddedObject.prototype.setFog = function(){
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

AddedObject.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.worldMatrix;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}
