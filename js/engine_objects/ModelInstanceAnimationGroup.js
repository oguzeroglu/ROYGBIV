var ModelInstanceAnimationGroup = function(modelInstance, childrenIndices){
  this.modelInstance = modelInstance;
  this.childrenIndices = childrenIndices;

  this.center = this.getInitialCenter();
  this.group = new THREE.Group();
  var refVector = this.center.clone();
  this.group.position.copy(refVector);
  for (var i = 0; i < childrenIndices.length; i ++){
    var index = childrenIndices[i];
    var bb = modelInstance.boundingBoxes[index];
    var childCenter = bb.getCenter(REUSABLE_VECTOR);
    var childSize = bb.getSize(REUSABLE_VECTOR_2);
    var pseudoGeom = new THREE.BoxGeometry(childSize.x, childSize.y, childSize.z);
    var pseudoMesh = new THREE.Mesh(pseudoGeom, DUMMY_MATERIAL);
    pseudoMesh.position.copy(childCenter);
    pseudoMesh.position.sub(refVector);
    this.group.add(pseudoMesh);
  }

  this.group.scale.copy(modelInstance.mesh.scale);
  this.group.position.copy(modelInstance.mesh.position);
  this.group.quaternion.copy(modelInstance.mesh.quaternion);
}

ModelInstanceAnimationGroup.prototype.getWorldMatrix = function(){
  this.group.updateMatrixWorld(true);
  return this.group.matrixWorld;
}

ModelInstanceAnimationGroup.prototype.getInitialCenter = function(){
  var centerX = 0;
  var centerY = 0;
  var centerZ = 0;
  var count = 0;
  var bbs = this.modelInstance.boundingBoxes;
  for (var i = 0; i < this.childrenIndices.length; i ++){
    var index = this.childrenIndices[i];
    var bb = bbs[index];
    var pos = bb.getCenter(REUSABLE_VECTOR);
    count ++;
    centerX += pos.x;
    centerY += pos.y;
    centerZ += pos.z;
  }

  centerX = centerX / count;
  centerY = centerY / count;
  centerZ = centerZ / count;

  return new THREE.Vector3(centerX, centerY, centerZ);
}

ModelInstanceAnimationGroup.prototype.debugCenter = function(){
  var mesh = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({color: "red"}));
  mesh.position.copy(this.center);
  scene.add(mesh);
}
