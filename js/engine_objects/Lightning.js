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

Lightning.prototype.detachFromFPSWeapon = function(){
  this.attachedToFPSWeapon = false;
}

Lightning.prototype.attachToFPSWeapon = function(weaponObj, childObjName, endpoint){
  this.fpsWeaponConfigurations = {weaponObj: weaponObj, childObjName: childObjName, endpoint: endpoint};
  this.attachedToFPSWeapon = true;
}

Lightning.prototype.handleFPSWeaponEndPoint = function(distance){
  var otherEndPoint = this.getObjEndPoint(endpointInverses[this.fpsWeaponConfigurations.endpoint]);
  var oepX = otherEndPoint.x, oepY = otherEndPoint.y, oepZ = otherEndPoint.z;
  var endPoint = this.getObjEndPoint(this.fpsWeaponConfigurations.endPoint);
  var epX = endPoint.x, epY = endPoint.y, epZ = endPoint.z;
  REUSABLE_VECTOR.set(epX - oepX, epY - oepY, epZ - oepZ);
  REUSABLE_VECTOR.normalize();
  REUSABLE_VECTOR.multiplyScalar(distance);
  this.endPoint.set(REUSABLE_VECTOR.x + epX, REUSABLE_VECTOR.y + epY, REUSABLE_VECTOR.z + epZ);
}

Lightning.prototype.getObjEndPoint = function(endPoint){
  var position
  if (this.fpsWeaponConfigurations.weaponObj.isAddedObject){
    position = this.fpsWeaponConfigurations.weaponObj.getEndPoint(endPoint);
  }else{
    position = this.fpsWeaponConfigurations.weaponObj.group[this.fpsWeaponConfigurations.childObjName].getEndPoint(endPoint);
  }
  return position;
}

Lightning.prototype.handleFPSWeaponStartPosition = function(){
  this.startPoint.copy(this.getObjEndPoint(this.fpsWeaponConfigurations.endpoint));
}

Lightning.prototype.disableCorrection = function(){
  this.isCorrected = false;
}

Lightning.prototype.setCorrectionProperties = function(radiusCorrectionRefDistance, displacementCorrectionRefLength){
  this.isCorrected = true;
  this.correctionRefDistance = radiusCorrectionRefDistance;
  this.correctionRefLength = displacementCorrectionRefLength;
}

Lightning.prototype.generateNoisePropertiesForNode = function(node){
  node.noiseAlphaX = 0;
  node.noiseAlphaY = 0;
  node.noiseAlphaZ = 0;
  node.noiseRadiusX = 2 * (Math.random() - 0.5);
  node.noiseRadiusY = 2 * (Math.random() - 0.5);
  node.noiseRadiusZ = 2 * (Math.random() - 0.5);
  node.noiseFuncX = (Math.random() * 50) > 25 ? Math.sin : Math.cos;
  node.noiseFuncY = (Math.random() * 50) > 25 ? Math.sin : Math.cos;
  node.noiseFuncZ = (Math.random() * 50) > 25 ? Math.sin : Math.cos;
}

Lightning.prototype.getNoiseForNode = function(node){
  REUSABLE_VECTOR.set(
    node.noiseRadiusX * node.noiseFuncX(node.noiseAlphaX),
    node.noiseRadiusY * node.noiseFuncY(node.noiseAlphaY),
    node.noiseRadiusZ * node.noiseFuncZ(node.noiseAlphaZ)
  );
  node.noiseAlphaX += Math.random() * this.roughness;
  node.noiseAlphaY += Math.random() * this.roughness;
  node.noiseAlphaZ += Math.random() * this.roughness;
  return REUSABLE_VECTOR;
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
    roughness: this.roughness,
    correctionProperties: {
      isCorrected: this.isCorrected,
      correctionRefDistance: this.correctionRefDistance,
      correctionRefLength: this.correctionRefLength
    },
    fpsWeaponConfigurations: {
      attachedToFPSWeapon: this.attachedToFPSWeapon,
      weaponObjName: this.attachedToFPSWeapon? this.fpsWeaponConfigurations.weaponObj.name: null,
      childObjName: this.attachedToFPSWeapon? this.fpsWeaponConfigurations.childObjName: null,
      endPoint: this.attachedToFPSWeapon? this.fpsWeaponConfigurations.endpoint: null
    }
  };
}

Lightning.prototype.destroy = function(){
  scene.remove(this.mesh);
  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
}

Lightning.prototype.start = function(startPoint, endPoint){
  if (!(mode == 1 && this.attachedToFPSWeapon) && startPoint && endPoint){
    this.startPoint.copy(startPoint);
    this.endPoint.copy(endPoint);
  }else if (mode == 1 && this.attachedToFPSWeapon){
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
  var pos = isStart ? node.startPoint : node.endPoint;
  var radius = this.radius;
  if (this.isCorrected){
    var distanceFromCamera = pos.distanceTo(camera.position);
    if (distanceFromCamera < this.correctionRefDistance){
      var coef = distanceFromCamera / this.correctionRefDistance;
      radius *= coef;
    }
  }
  this.forwardsFill.subVectors(node.endPoint, node.startPoint).normalize();
  this.up.set(Math.random(), Math.random(), 0);
  this.up.z = -(this.up.x * this.forwardsFill.x + this.up.y * this.forwardsFill.y) / this.forwardsFill.z;
  this.up.normalize();
  this.side.crossVectors(this.up, this.forwardsFill).multiplyScalar(radius * COS30DEG);
  this.down.copy(this.up).multiplyScalar(-radius * SIN30DEG);
  var p = this.vPos;
  var v = this.positionBufferAttribute.array;
  p.copy(pos).sub(this.side).add(this.down);
  v[i++] = p.x;
  v[i++] = p.y;
  v[i++] = p.z;
  p.copy(pos).add(this.side).add(this.down);
  v[i++] = p.x;
  v[i++] = p.y;
  v[i++] = p.z;
  p.copy(this.up).multiplyScalar(radius).add(pos);
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
    this.generateTree(this.tree, startPoint, endPoint, this.maxDisplacement, this.maxDisplacement);
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
  if (mode == 1 && this.attachedToFPSWeapon){
    this.handleFPSWeaponStartPosition();
  }
  this.state = this.STATE_UPDATE;
  this.idCounter = 0;
  var displacement = this.maxDisplacement;
  if (this.isCorrected){
    var len = this.endPoint.distanceTo(this.startPoint);
    if (len < this.correctionRefLength){
      var coef = len / this.correctionRefLength;
      displacement *= coef;
    }
  }
  for (var i = 0; i<this.count; i++){
    this.generateTree(this.tree, this.startPoint, this.endPoint, displacement, this.maxDisplacement);
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
    this.generateNoisePropertiesForNode(obj);
    node[this.idCounter] = obj;
  }else{
    obj.startPoint.copy(startPoint);
    obj.endPoint.copy(endPoint);
  }
  this.idCounter ++;
  return obj;
}

Lightning.prototype.generateTree = function(node, startPoint, endPoint, displacement, realDisplacement){
  var addedNode = this.addSegment(node, startPoint, endPoint, displacement);
  var children = addedNode.children;
  if (realDisplacement > this.detailThreshold){
    displacement = displacement / 2;
    realDisplacement = realDisplacement / 2;
    var middlePoint;
    if (this.state == this.STATE_INIT){
      middlePoint = new THREE.Vector3(
        ((startPoint.x + endPoint.x) / 2) + displacement * (Math.random() - 0.5),
        ((startPoint.y + endPoint.y) / 2) + displacement * (Math.random() - 0.5),
        ((startPoint.z + endPoint.z) / 2) + displacement * (Math.random() - 0.5)
      );
    }else{
      var nodeNoise = this.getNoiseForNode(addedNode);
      middlePoint = addedNode.reusableVector.set(
        ((startPoint.x + endPoint.x) / 2) + displacement * nodeNoise.x,
        ((startPoint.y + endPoint.y) / 2) + displacement * nodeNoise.y,
        ((startPoint.z + endPoint.z) / 2) + displacement * nodeNoise.z
      );
    }
    this.generateTree(children, startPoint, middlePoint, displacement, realDisplacement);
    this.generateTree(children, middlePoint, endPoint, displacement, realDisplacement);
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
