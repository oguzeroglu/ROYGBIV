var ObjectGroup = function(name, group){
  this.name = name;
  this.group = group;
  objectSelectedByCommand = false;

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.gridSystemNames = [];

  this.childObjectsByName = new Object();

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
    // DESTROY PARTS ***********************************************
    addedObject.destroy();
    delete addedObjects[objectName];
    disabledObjectNames[objectName] = 1;
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

  scene.add(graphicsGroup);
  previewScene.add(previewGraphicsGroup);
  physicsWorld.addBody(physicsBody);

  this.physicsBody = physicsBody;
  this.graphicsGroup = graphicsGroup;
  this.previewGraphicsGroup = previewGraphicsGroup;
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
    var quatX = this.previewGraphicsGroup.quaternion.x;
    var quatY = this.previewGraphicsGroup.quaternion.y;
    var quatZ = this.previewGraphicsGroup.quaternion.z;
    var quatW = this.previewGraphicsGroup.quaternion.w;
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

ObjectGroup.prototype.detach = function(){
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
    physicsQuaternions[objectName] = this.physicsBody.initQuaternion;
  }
  for (var i = this.graphicsGroup.children.length -1; i>=0; i--){
    this.graphicsGroup.remove(this.graphicsGroup.children[i]);
  }
  for (var i = this.previewGraphicsGroup.children.length -1; i>=0; i--){
    this.previewGraphicsGroup.remove(this.previewGraphicsGroup.children[i]);
  }
  this.destroy();
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
    addedObject.mesh.position.copy(worldPositions[objectName]);
    addedObject.previewMesh.position.copy(worldPositions[objectName]);
    addedObject.mesh.quaternion.copy(worldQuaternions[objectName]);
    addedObject.previewMesh.quaternion.copy(worldQuaternions[objectName]);
    addedObject.initQuaternion = worldQuaternions[objectName].clone();
    addedObject.physicsBody.position.copy(worldPositions[objectName]);
    addedObject.physicsBody.quaternion.copy(physicsQuaternions[objectName]);
    addedObject.physicsBody.initPosition = new CANNON.Vec3(
      worldPositions[objectName].x,
      worldPositions[objectName].y,
      worldPositions[objectName].z
    );
    addedObject.physicsBody.initQuaternion = new CANNON.Quaternion(
      physicsQuaternions[objectName].x,
      physicsQuaternions[objectName].y,
      physicsQuaternions[objectName].z,
      physicsQuaternions[objectName].w
    );
    if (addedObject.type == "box" || addedObject.type == "ramp" || addedObject.type == "sphere"){
      addedObject.metaData["centerX"] = worldPositions[objectName].x;
      addedObject.metaData["centerY"] = worldPositions[objectName].y;
      addedObject.metaData["centerZ"] = worldPositions[objectName].z;
    }else if (addedObject.type == "surface"){
      addedObject.metaData["positionX"] = worldPositions[objectName].x;
      addedObject.metaData["positionY"] = worldPositions[objectName].y;
      addedObject.metaData["positionZ"] = worldPositions[objectName].z;
    }

    addedObject.recentlyDetached = true;
    addedObject.worldQuaternionX = worldQuaternions[objectName].x;
    addedObject.worldQuaternionY = worldQuaternions[objectName].y;
    addedObject.worldQuaternionZ = worldQuaternions[objectName].z;
    addedObject.worldQuaternionW = worldQuaternions[objectName].w;
    addedObject.physicsQuaternionX = physicsQuaternions[objectName].x;
    addedObject.physicsQuaternionY = physicsQuaternions[objectName].y;
    addedObject.physicsQuaternionZ = physicsQuaternions[objectName].z;
    addedObject.physicsQuaternionW = physicsQuaternions[objectName].w;


    if (addedObject.type == "ramp"){
      var rotation = new CANNON.Quaternion(
        addedObject.physicsBody.quaternion.x,
        addedObject.physicsBody.quaternion.y,
        addedObject.physicsBody.quaternion.z,
        addedObject.physicsBody.quaternion.w
      );
      var rotation2 = new CANNON.Quaternion();
      rotation2.setFromEuler(
        addedObject.metaData.fromEulerX,
        addedObject.metaData.fromEulerY,
        addedObject.metaData.fromEulerZ
      );
      addedObject.physicsBody.quaternion = rotation.mult(rotation2);
      addedObject.physicsBody.initQuaternion.copy(addedObject.physicsBody.quaternion);
      addedObject.physicsQuaternionX = addedObject.physicsBody.quaternion.x;
      addedObject.physicsQuaternionY = addedObject.physicsBody.quaternion.y;
      addedObject.physicsQuaternionZ = addedObject.physicsBody.quaternion.z;
      addedObject.physicsQuaternionW = addedObject.physicsBody.quaternion.w;
    }

    if (addedObject.destroyedGrids){
      for (var gridName in addedObject.destroyedGrids){
        addedObject.destroyedGrids[gridName].destroyedAddedObject = addedObject.name;
      }
    }

    delete addedObject.parentObjectName;
    delete addedObjectsInsideGroups[addedObject.name];
    delete addedObject.indexInParent;

  }
  worldQuaternions = 0;
  worldPositions = 0;

}

ObjectGroup.prototype.setQuaternion = function(axis, val){
  if (axis == "x"){
    this.graphicsGroup.quaternion.x = val;
    this.previewGraphicsGroup.quaternion.x = val;
    this.physicsBody.quaternion.x = val;
    this.initQuaternion.x = val;
    this.physicsBody.initQuaternion.x = val;
  }else if (axis == "y"){
    this.graphicsGroup.quaternion.y = val;
    this.previewGraphicsGroup.quaternion.y = val;
    this.physicsBody.quaternion.y = val;
    this.initQuaternion.y = val;
    this.physicsBody.initQuaternion.y = val;
  }else if (axis == "z"){
    this.graphicsGroup.quaternion.z = val;
    this.previewGraphicsGroup.quaternion.z = val;
    this.physicsBody.quaternion.z = val;
    this.initQuaternion.z = val;
    this.physicsBody.initQuaternion.z = val;
  }else if (axis == "w"){
    this.graphicsGroup.quaternion.w = val;
    this.previewGraphicsGroup.quaternion.w = val;
    this.physicsBody.quaternion.w = val;
    this.initQuaternion.w = val;
    this.physicsBody.initQuaternion.w = val;
  }
}

ObjectGroup.prototype.rotate = function(axis, radian, fromScript){
  if (axis == "x"){
    this.graphicsGroup.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_X,
      radian
    );
  }else if (axis == "y"){
    this.graphicsGroup.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Y,
      radian
    );
  }else if (axis == "z"){
    this.graphicsGroup.rotateOnWorldAxis(
      THREE_AXIS_VECTOR_Z,
      radian
    );
  }

  this.previewGraphicsGroup.quaternion.copy(this.graphicsGroup.quaternion);
  this.physicsBody.quaternion.copy(this.graphicsGroup.quaternion);

  if (!fromScript){
    this.initQuaternion = this.graphicsGroup.quaternion.clone();
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
  var previewMesh = this.previewGraphicsGroup;
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

}

ObjectGroup.prototype.resetPosition = function(){
  this.previewGraphicsGroup.position.copy(this.graphicsGroup.position);
}

ObjectGroup.prototype.destroy = function(){
  scene.remove(this.graphicsGroup);
  previewScene.remove(this.previewGraphicsGroup);
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
  objectSelectedByCommand = false;
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
