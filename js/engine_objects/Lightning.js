var Lightning = function(name, detailThreshold, maxDisplacement, count, colorName, radius, roughness){
  this.name = name;
  this.isLightning = true;
  this.detailThreshold = detailThreshold;
  this.maxDisplacement = maxDisplacement;
  this.radius = radius;
  this.count = count;
  this.colorName = colorName;
  this.roughness = roughness;
  this.tree = new Object();
  this.renderMap = new Object();
  this.idCounter = 0;
  this.vertexCount = 0;
  this.STATE_INIT = 0;
  this.STATE_UPDATE = 1;
  this.forwardsFill = new THREE.Vector3();
  this.side = new THREE.Vector3();
  this.down = new THREE.Vector3();
  this.vPos = new THREE.Vector3();
  this.up = new THREE.Vector3(0, 0, 1);
}

Lightning.prototype.generateNoisesForNode = function(node){
  var noises = {
    x: [], y: [], z: []
  }
  var func = (Math.random() * 50) > 25 ? Math.sin : Math.cos;
  var noiseKeys = ["x", "y", "z"];
  var selectedAmount = 500 + (1000 * Math.random());
  for (var i2 = 0; i2<3; i2++){
    var alpha = 0;
    var radius = 2 * (Math.random() - 0.5);
    for (var i = 0; i<selectedAmount; i++){
      noises[noiseKeys[i2]].push(radius * func(alpha));
      alpha += Math.random() * this.roughness;
    }
  }
  node.noises = noises;
  node.noiseIndex = 0;
  node.increaseNoiseIndex = true;
}

Lightning.prototype.clone = function(){
  var clone = new Lightning(this.name, this.detailThreshold, this.maxDisplacement, this.count, this.colorName, this.radius, this.roughness);
  clone.init(this.startPoint, this.endPoint);
  return clone;
}

Lightning.prototype.export = function(){
  return {
    name: this.name,
    detailThreshold: this.detailThreshold,
    maxDisplacement: this.maxDisplacement,
    count: this.count,
    colorName: this.colorName,
    radius: this.radius,
    roughness: this.roughness
  };
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

Lightning.prototype.updateNodePositionInShader = function(node, isStart){
  var i = this.positionAttributeIndexByIds[node.id];
  if (!isStart){
    i += 9;
  }
  this.forwardsFill.subVectors(node.endPoint, node.startPoint).normalize();
  this.side.crossVectors(this.up, this.forwardsFill).multiplyScalar(this.radius * COS30DEG);
  this.down.copy(this.up).multiplyScalar(-this.radius * SIN30DEG);
  var p = this.vPos;
  var v = this.positionBufferAttribute.array;
  var pos = isStart ? node.startPoint : node.endPoint;
  p.copy(pos).sub(this.side).add(this.down);
  v[i++] = p.x;
  v[i++] = p.y;
  v[i++] = p.z;
  p.copy(pos).add(this.side).add(this.down);
  v[i++] = p.x;
  v[i++] = p.y;
  v[i++] = p.z;
  p.copy(this.up).multiplyScalar(this.radius).add(pos);
  v[i++] = p.x;
  v[i++] = p.y;
  v[i++] = p.z;
  this.positionBufferAttribute.needsUpdate = true;
}

Lightning.prototype.createIndices = function(vertex, indicesAry){
  indicesAry.push(vertex + 1);
  indicesAry.push(vertex + 2);
  indicesAry.push(vertex + 5);
  indicesAry.push(vertex + 1);
  indicesAry.push(vertex + 5);
  indicesAry.push(vertex + 4);
  indicesAry.push(vertex + 0);
  indicesAry.push(vertex + 1);
  indicesAry.push(vertex + 4);
  indicesAry.push(vertex + 0);
  indicesAry.push(vertex + 4);
  indicesAry.push(vertex + 3);
  indicesAry.push(vertex + 2);
  indicesAry.push(vertex + 0);
  indicesAry.push(vertex + 3);
  indicesAry.push(vertex + 2);
  indicesAry.push(vertex + 3);
  indicesAry.push(vertex + 5);
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
  this.positionsLen = Object.keys(this.renderMap).length * 18;
  var positions = new Float32Array(this.positionsLen);
  var ctr = 0;
  this.currentIndex = 0;
  var currentVertex = 0;
  var indicesAry = [];
  for (var id in this.renderMap){
    this.positionAttributeIndexByIds[id] = ctr;
    ctr += 18;
    this.createIndices(currentVertex, indicesAry);
    currentVertex += 6;
  }
  var indices = new Uint32Array(indicesAry.length);
  for (var i = 0; i<indicesAry.length; i++){
    indices[i] = indicesAry[i];
  }
  this.drawLen = indicesAry.length;
  this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  this.positionBufferAttribute = new THREE.BufferAttribute(positions, 3);
  this.positionBufferAttribute.setDynamic(true);
  this.geometry.addAttribute("position", this.positionBufferAttribute);
  this.geometry.setDrawRange(0, this.drawLen);
  this.mesh = new MeshGenerator().generateLightning(this);
  scene.add(this.mesh);
  webglCallbackHandler.registerEngineObject(this);
  for (var id in this.renderMap){
    this.updateNodePositionInShader(this.renderMap[id], true);
    this.updateNodePositionInShader(this.renderMap[id], false);
  }
}

Lightning.prototype.update = function(){
  this.state = this.STATE_UPDATE;
  this.idCounter = 0;
  for (var i = 0; i<this.count; i++){
    this.generateTree(this.tree, this.startPoint, this.endPoint, this.maxDisplacement);
  }
  this.positionBufferAttribute.updateRange.set(0, this.positionsLen);
}

Lightning.prototype.addSegment = function(node, startPoint, endPoint){
  var obj = (this.state == this.STATE_INIT)? {}: node[this.idCounter];
  if (this.state == this.STATE_INIT){
    obj.id = this.idCounter;
    obj.startPoint = new THREE.Vector3().copy(startPoint);
    obj.endPoint = new THREE.Vector3().copy(endPoint);
    obj.children = new Object();
    obj.reusableVector = new THREE.Vector3();
    this.generateNoisesForNode(obj);
    node[this.idCounter] = obj;
  }else{
    obj.startPoint.copy(startPoint);
    obj.endPoint.copy(endPoint);
  }
  this.idCounter ++;
  return obj;
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
      var noiseX = addedNode.noises.x[addedNode.noiseIndex];
      var noiseY = addedNode.noises.y[addedNode.noiseIndex];
      var noiseZ = addedNode.noises.z[addedNode.noiseIndex];
      middlePoint = addedNode.reusableVector.set(
        ((startPoint.x + endPoint.x) / 2) + displacement * noiseX,
        ((startPoint.y + endPoint.y) / 2) + displacement * noiseY,
        ((startPoint.z + endPoint.z) / 2) + displacement * noiseZ
      );
      if (addedNode.increaseNoiseIndex){
        addedNode.noiseIndex ++;
        if (addedNode.noiseIndex == addedNode.noises.x.length){
          addedNode.increaseNoiseIndex = false;
          addedNode.noiseIndex = addedNode.noises.x.length - 2;
        }
      }else{
        addedNode.noiseIndex --;
        if (addedNode.noiseIndex < 0){
          addedNode.increaseNoiseIndex = true;
          addedNode.noiseIndex = 1;
        }
      }
    }
    this.generateTree(children, startPoint, middlePoint, displacement);
    this.generateTree(children, middlePoint, endPoint, displacement);
  }else{
    this.renderMap[addedNode.id] = addedNode;
    if (this.state == this.STATE_UPDATE){
      this.updateNodePositionInShader(addedNode, true);
      this.updateNodePositionInShader(addedNode, false);
    }else{
      this.vertexCount += 6;
    }
  }
}
