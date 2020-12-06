var ModelInstance = function(name, model, mesh, physicsBody, destroyedGrids, gsName){
  this.isModelInstance = true;
  this.name = name;

  if (IS_WORKER_CONTEXT){
    return;
  }

  this.mesh = mesh;
  this.model = model;
  this.physicsBody = physicsBody;
  this.gsName = gsName;
  this.destroyedGrids = destroyedGrids;

  for (var gridName in this.destroyedGrids){
    this.destroyedGrids[gridName].destroyedModelInstance = this.name;
  }

  this.scale = this.mesh.scale.x;
}

ModelInstance.prototype.onTextureAtlasRefreshed = function(){
  if (this.model.getUsedTextures().length == 0){
    return;
  }

  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
}

ModelInstance.prototype.export = function(){
  var exportObj = {
    modelName: this.model.name,
    gsName: this.gsName,
    position: {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z
    },
    quaternion: {
      x: this.mesh.quaternion.x,
      y: this.mesh.quaternion.y,
      z: this.mesh.quaternion.z,
      w: this.mesh.quaternion.w
    },
    scale: this.mesh.scale.x
  };

  var destroyedGridsExport = {};
  for (var gridName in this.destroyedGrids){
    destroyedGridsExport[gridName] = this.destroyedGrids[gridName].export();
  }

  exportObj.destroyedGrids = destroyedGridsExport;

  return exportObj;
}

ModelInstance.prototype.exportLightweight = function(){
  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }

  this.mesh.updateMatrixWorld();
  var exportObject = new Object();

  exportObject.vertices = [];
  exportObject.triangles = [];
  exportObject.pseudoFaces = [];

  for (var i = 0; i<this.vertices.length; i++){
    exportObject.vertices.push({x: this.vertices[i].x, y: this.vertices[i].y, z: this.vertices[i].z})
  }
  for (var i = 0; i<this.triangles.length; i++){
    exportObject.triangles.push({a: this.triangles[i].a, b: this.triangles[i].b, c: this.triangles[i].c})
  }
  for (var i = 0; i<this.pseudoFaces.length; i++){
    exportObject.pseudoFaces.push(this.pseudoFaces[i]);
  }

  return exportObject;
}

ModelInstance.prototype.generateBoundingBoxes = function(){
  var originalBB = this.model.info.originalBoundingBox.clone();
  var width = (originalBB.max.x - originalBB.min.x);
  var height = (originalBB.max.y - originalBB.min.y);
  var depth = (originalBB.max.z - originalBB.min.z);

  var pseudoGeometry = new THREE.BoxGeometry(width, height, depth);

  this.vertices = pseudoGeometry.vertices;
  var bb = new THREE.Box3();
  bb.roygbivObjectName = this.name;
  this.boundingBoxes = [bb];
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

ModelInstance.prototype.visualiseBoundingBoxes = function(){
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
    var bbHelper = new THREE.Box3Helper(this.boundingBoxes[i], LIME_COLOR);
    scene.add(bbHelper);
    this.bbHelpers.push(bbHelper);
  }
}

ModelInstance.prototype.removeBoundingBoxesFromScene = function(){
  if (this.bbHelpers){
    for (var i = 0; i<this.bbHelpers.length; i++){
      scene.remove(this.bbHelpers[i]);
    }
  }
  this.bbHelpers = [];
}

ModelInstance.prototype.intersectsLine = function(line){
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
