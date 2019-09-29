var Lightning = function(name, detailThreshold, maxDisplacement, count){
  this.name = name;
  this.detailThreshold = detailThreshold;
  this.maxDisplacement = maxDisplacement;
  this.count = count;
  this.tree = new Object();
  this.renderMap = new Object();
  this.idCounter = 0;
  this.STATE_INIT = 0;
  this.STATE_UPDATE = 1;
}

Lightning.prototype.init = function(startPoint, endPoint){
  this.state = this.STATE_INIT;
  for (var i = 0; i<this.count; i++){
    this.generateTree(this.tree, startPoint, endPoint, this.maxDisplacement);
  }
  this.startPoint = startPoint;
  this.endPoint = endPoint;
}

Lightning.prototype.update = function(){
  this.state = this.STATE_UPDATE;
  this.idCounter = 0;
  for (var i = 0; i<this.count; i++){
    this.generateTree(this.tree, this.startPoint, this.endPoint, this.maxDisplacement);
  }
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
  }
}

Lightning.prototype.debug = function(){
  if (this.debugMesh){
    scene.remove(this.debugMesh);
  }
  var material = new THREE.LineBasicMaterial( { color: "lime" } );
  var geom = new THREE.Geometry();
  for (var id in this.renderMap){
    var node = this.renderMap[id];
    geom.vertices.push(node.startPoint);
    geom.vertices.push(node.endPoint);
  }
  this.debugMesh = new THREE.LineSegments(geom, material);
  scene.add(this.debugMesh);
}
