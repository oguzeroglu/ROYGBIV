var Mass = function(name, center, size){
  this.isMass = true;
  this.name = name;
  this.center = center.clone();
  this.size= size.clone();

  if (!(this.size.x == 0 && this.size.y == 0 && this.size.z == 0)){
    this.constructPhysicsBody();
  }
}

Mass.prototype.visualise = function(){
  if (!this.bbHelper){
    var bbHelper = new THREE.Box3Helper(this.getBoundingBox(), LIME_COLOR);
    this.bbHelper = bbHelper;
  }

  scene.add(this.bbHelper);
}

Mass.prototype.unVisualise = function(){
  if (!this.bbHelper){
    return;
  }
  scene.remove(this.bbHelper);
}

Mass.prototype.intersectsLine = function(line){
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

Mass.prototype.getBoundingBox = function(){
  if (this.boundingBox){
    return this.boundingBox;
  }
  this.boundingBox = new THREE.Box3().setFromCenterAndSize(this.center, this.size);

  var pseudoMesh = new THREE.Mesh(new THREE.Geometry().fromBufferGeometry(new THREE.BoxBufferGeometry(this.size.x, this.size.y, this.size.z)), null);
  pseudoMesh.position.copy(this.center);
  pseudoMesh.updateMatrixWorld();
  pseudoMesh.updateMatrix();

  var transformedVertices = [];
  var vertices = pseudoMesh.geometry.vertices;
  for (var i = 0; i<vertices.length; i++){
    var vertex = vertices[i].clone();
    vertex.applyMatrix4(pseudoMesh.matrixWorld);
    transformedVertices.push(vertex);
  }

  this.triangles = [];
  this.trianglePlanes = [];
  for (var i = 0; i<pseudoMesh.geometry.faces.length; i++){
    var face = pseudoMesh.geometry.faces[i];
    var a = face.a;
    var b = face.b;
    var c = face.c;
    var triangle = new THREE.Triangle(
      transformedVertices[a], transformedVertices[b], transformedVertices[c]
    );
    this.triangles.push(triangle);
    var plane = new THREE.Plane();
    triangle.getPlane(plane);
    this.trianglePlanes.push(plane);
  }

  return this.boundingBox;
}

Mass.prototype.setIntersectable = function(isIntersectable){
  this.isIntersectable = isIntersectable;
}

Mass.prototype.export = function(){
  return {
    name: this.name,
    centerX: this.center.x,
    centerY: this.center.y,
    centerZ: this.center.z,
    sizeX: this.size.x,
    sizeY: this.size.y,
    sizeZ: this.size.z,
    isIntersectable: !!this.isIntersectable
  };
}

Mass.prototype.import = function(exportObj, skipPhysics){
  this.center.set(exportObj.centerX, exportObj.centerY, exportObj.centerZ);
  this.size.set(exportObj.sizeX, exportObj.sizeY, exportObj.sizeZ);

  this.setIntersectable(!!exportObj.isIntersectable);

  if (!skipPhysics){
    this.constructPhysicsBody();
  }
}

Mass.prototype.constructPhysicsBody = function(){
  this.physicsBody = physicsBodyGenerator.generateBoxBody({
    x: this.size.x / 2,
    y: this.size.y / 2,
    z: this.size.z / 2
  });

  this.physicsBody.position.set(this.center.x, this.center.y, this.center.z);
  this.physicsBody.roygbivMassID = this.name;
}
