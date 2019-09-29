var Lightning = function(){
  this.DETAIL_THRESHOLD = 2;
  this.tree = new Object();
  this.renderMap = new Object();
  this.idCounter = 0;
}

Lightning.prototype.addSegment = function(node, startPoint, endPoint){
  node[this.idCounter ++] = {
    id: this.idCounter -1,
    startPoint: startPoint,
    endPoint: endPoint,
    children: new Object()
  };
  return node[this.idCounter - 1];
}

Lightning.prototype.test = function(node, startPoint, endPoint, displacement){
  var addedNode = this.addSegment(node, startPoint, endPoint, displacement);
  var children = addedNode.children;
  if (displacement > this.DETAIL_THRESHOLD){
    displacement = displacement / 2;
    var middlePoint = new THREE.Vector3(
      ((startPoint.x + endPoint.x) / 2) + displacement * (Math.random() - 0.5),
      ((startPoint.y + endPoint.y) / 2) + displacement * (Math.random() - 0.5),
      ((startPoint.z + endPoint.z) / 2) + displacement * (Math.random() - 0.5)
    );
    this.test(children, startPoint, middlePoint, displacement);
    this.test(children, middlePoint, endPoint, displacement);
  }else{
    this.renderMap[addedNode.id] = addedNode;
  }
}

Lightning.prototype.debug = function(){
  // DEBUG
  var material = new THREE.LineBasicMaterial( { color: "lime" } );
  var geom = new THREE.Geometry();
  for (var id in this.renderMap){
    var node = this.renderMap[id];
    geom.vertices.push(node.startPoint);
    geom.vertices.push(node.endPoint);
  }
  scene.add(new THREE.LineSegments(geom, material));
}
