var ModelInstanceAnimationGroup = function(name, modelInstance, childrenIndices){
  this.name = name;
  this.childrenIndices = childrenIndices;

  this.center = this.getInitialCenter(modelInstance);
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

  this.rotationPivot = modelInstance.mesh.position.clone();
}

ModelInstanceAnimationGroup.prototype.export = function(){
  return {
    name: this.name,
    childrenIndices: this.childrenIndices,
    rotationPivot: {
      x: this.rotationPivot.x,
      y: this.rotationPivot.y,
      z: this.rotationPivot.z
    }
  };
}

ModelInstanceAnimationGroup.prototype.getWorldMatrix = function(){
  this.group.updateMatrixWorld(true);
  return this.group.matrixWorld;
}

ModelInstanceAnimationGroup.prototype.rotateAroundXYZ = function(x, y, z, axisVector, radians){
  var point = REUSABLE_VECTOR.set(x, y, z);
  this.group.position.sub(point);
  this.group.position.applyAxisAngle(axisVector, radians);
  this.group.position.add(point);
  this.group.rotateOnAxis(axisVector, radians);
}

ModelInstanceAnimationGroup.prototype.getInitialCenter = function(modelInstance){
  var centerX = 0;
  var centerY = 0;
  var centerZ = 0;
  var count = 0;
  var bbs = modelInstance.boundingBoxes;
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
