var Lightning = function(name, detailThreshold, maxDisplacement, count, colorName){
  this.name = name;
  this.isLightning = true;
  this.detailThreshold = detailThreshold;
  this.maxDisplacement = maxDisplacement;
  this.count = count;
  this.colorName = colorName;
  this.tree = new Object();
  this.renderMap = new Object();
  this.idCounter = 0;
  this.vertexCount = 0;
  this.STATE_INIT = 0;
  this.STATE_UPDATE = 1;
}

Lightning.prototype.destroy = function(){
  scene.remove(this.mesh);
  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
}

Lightning.prototype.start = function(startPoint, endPoint){
  if (startPoint && endPoint){
    this.startPoint.copy(startPoint);
    this.endPoint.copy(endPoint);
  }
  if (mode == 1){
    activeLightnings.set(this.name, this);
  }
  this.mesh.visible = true;
}

Lightning.prototype.stop = function(){
  if (mode == 1){
    activeLightnings.delete(this.name);
  }
  this.mesh.visible = false;
}

Lightning.prototype.init = function(startPoint, endPoint){
  this.state = this.STATE_INIT;
  for (var i = 0; i<this.count; i++){
    this.generateTree(this.tree, startPoint, endPoint, this.maxDisplacement);
  }
  this.startPoint = startPoint;
  this.endPoint = endPoint;
  this.geometry = new THREE.BufferGeometry();
  this.positionAttributeIndexByIds = new Object();
  var positions = new Float32Array(this.vertexCount * 3);
  var ctr = 0;
  for (var id in this.renderMap){
    var sp = this.renderMap[id].startPoint;
    var ep = this.renderMap[id].endPoint;
    positions[ctr++] = sp.x;
    positions[ctr++] = sp.y;
    positions[ctr++] = sp.z;
    positions[ctr++] = ep.x;
    positions[ctr++] = ep.y;
    positions[ctr++] = ep.z;
    this.positionAttributeIndexByIds[id] = ctr - 6;
  }
  this.positionBufferAttribute = new THREE.BufferAttribute(positions, 3);
  this.positionBufferAttribute.setDynamic(true);
  this.geometry.addAttribute("position", this.positionBufferAttribute);
  this.geometry.setDrawRange(0, this.vertexCount);
  this.mesh = new MeshGenerator().generateLightning(this);
  scene.add(this.mesh);
  webglCallbackHandler.registerEngineObject(this);
}

Lightning.prototype.update = function(){
  this.state = this.STATE_UPDATE;
  this.idCounter = 0;
  for (var i = 0; i<this.count; i++){
    this.generateTree(this.tree, this.startPoint, this.endPoint, this.maxDisplacement);
  }
  this.positionBufferAttribute.updateRange.set(0, this.vertexCount * 3);
}

Lightning.prototype.addSegment = function(node, startPoint, endPoint){
  var obj = (this.state == this.STATE_INIT)? {}: node[this.idCounter];
  if (this.state == this.STATE_INIT){
    obj.id = this.idCounter;
    obj.startPoint = new THREE.Vector3().copy(startPoint);
    obj.endPoint = new THREE.Vector3().copy(endPoint);
    obj.children = new Object();
    obj.reusableVector = new THREE.Vector3();
    node[this.idCounter] = obj;
  }else{
    obj.startPoint.copy(startPoint);
    obj.endPoint.copy(endPoint);
  }
  this.idCounter ++;
  return obj;
}

Lightning.prototype.updateNodePositionInShader = function(node){
  var bufferAttributeIndex = this.positionAttributeIndexByIds[node.id];
  this.positionBufferAttribute.array[bufferAttributeIndex] = node.startPoint.x;
  this.positionBufferAttribute.array[bufferAttributeIndex + 1] = node.startPoint.y;
  this.positionBufferAttribute.array[bufferAttributeIndex + 2] = node.startPoint.z;
  this.positionBufferAttribute.array[bufferAttributeIndex + 3] = node.endPoint.x;
  this.positionBufferAttribute.array[bufferAttributeIndex + 4] = node.endPoint.y;
  this.positionBufferAttribute.array[bufferAttributeIndex + 5] = node.endPoint.z;
  this.positionBufferAttribute.needsUpdate = true;
}

Lightning.prototype.generateTree = function(node, startPoint, endPoint, displacement){
  var addedNode = this.addSegment(node, startPoint, endPoint, displacement);
  var children = addedNode.children;
  if (displacement > this.detailThreshold){
    displacement = displacement / 2;
    var middlePoint;
    if (this.state == this.STATE_INIT){
      middlePoint = new THREE.Vector3(
        ((startPoint.x + endPoint.x) / 2) + displacement * (Math.random() - 0.5),
        ((startPoint.y + endPoint.y) / 2) + displacement * (Math.random() - 0.5),
        ((startPoint.z + endPoint.z) / 2) + displacement * (Math.random() - 0.5)
      );
    }else{
      middlePoint = addedNode.reusableVector.set(
        ((startPoint.x + endPoint.x) / 2) + displacement * (Math.random() - 0.5),
        ((startPoint.y + endPoint.y) / 2) + displacement * (Math.random() - 0.5),
        ((startPoint.z + endPoint.z) / 2) + displacement * (Math.random() - 0.5)
      );
    }
    this.generateTree(children, startPoint, middlePoint, displacement);
    this.generateTree(children, middlePoint, endPoint, displacement);
  }else{
    this.renderMap[addedNode.id] = addedNode;
    if (this.state == this.STATE_UPDATE){
      this.updateNodePositionInShader(addedNode);
    }else{
      this.vertexCount += 2;
    }
  }
}
