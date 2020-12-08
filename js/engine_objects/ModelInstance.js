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

  this.matrixCache = new THREE.Matrix4();

  webglCallbackHandler.registerEngineObject(this);
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
    scale: this.mesh.scale.x,
    affectedByLight: !!this.affectedByLight
  };

  var destroyedGridsExport = {};
  for (var gridName in this.destroyedGrids){
    destroyedGridsExport[gridName] = this.destroyedGrids[gridName].export();
  }

  exportObj.destroyedGrids = destroyedGridsExport;
  exportObj.hiddenInDesignMode = !!this.hiddenInDesignMode;
  exportObj.noMass = !!this.noMass;
  exportObj.isIntersectable = !!this.isIntersectable;

  if (this.affectedByLight){
    exportObj.lightingType = this.lightingType;
  }

  return exportObj;
}

ModelInstance.prototype.exportLightweight = function(){
  this.mesh.updateMatrixWorld();

  if (!this.boundingBoxes){
    this.generateBoundingBoxes();
  }

  var exportObject = new Object();

  exportObject.vertices = [];
  exportObject.transformedVertices = [];
  exportObject.triangles = [];
  exportObject.pseudoFaces = [];

  for (var i = 0; i<this.vertices.length; i++){
    exportObject.vertices.push({x: this.vertices[i].x, y: this.vertices[i].y, z: this.vertices[i].z})
  }
  for (var i = 0; i<this.transformedVertices.length; i++){
    exportObject.transformedVertices.push({x: this.transformedVertices[i].x, y: this.transformedVertices[i].y, z: this.transformedVertices[i].z})
  }
  for (var i = 0; i<this.triangles.length; i++){
    exportObject.triangles.push({a: this.triangles[i].a, b: this.triangles[i].b, c: this.triangles[i].c})
  }
  for (var i = 0; i<this.pseudoFaces.length; i++){
    exportObject.pseudoFaces.push(this.pseudoFaces[i]);
  }

  if (this.hiddenInDesignMode){
    exportObject.hiddenInDesignMode = true;
  }

  var physicsXParam = (this.model.info.originalBoundingBox.max.x - this.model.info.originalBoundingBox.min.x) * this.scale;
  var physicsYParam = (this.model.info.originalBoundingBox.max.y - this.model.info.originalBoundingBox.min.y) * this.scale;
  var physicsZParam = (this.model.info.originalBoundingBox.max.z - this.model.info.originalBoundingBox.min.z) * this.scale;
  exportObject.physicsShapeParameters = {x: physicsXParam/2, y: physicsYParam/2, z: physicsZParam/2};
  exportObject.physicsPosition = {
    x: this.physicsBody.position.x,
    y: this.physicsBody.position.y,
    z: this.physicsBody.position.z
  };
  exportObject.physicsQuaternion = {
    x: this.physicsBody.quaternion.x,
    y: this.physicsBody.quaternion.y,
    z: this.physicsBody.quaternion.z,
    w: this.physicsBody.quaternion.w
  };

  exportObject.noMass = !!this.noMass;
  exportObject.isIntersectable = this.isIntersectable;

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

ModelInstance.prototype.hideVisually = function(){
  this.mesh.visible = false;
}

ModelInstance.prototype.showVisually = function(){
  this.mesh.visible = true;
}

ModelInstance.prototype.hideInDesignMode = function(skipRaycasterRefresh){
  if (isDeployment){
    return;
  }
  this.hideVisually();
  this.hiddenInDesignMode = true;

  if (!skipRaycasterRefresh){
    refreshRaycaster(Text.OBJECT_HIDDEN);
  }
}

ModelInstance.prototype.showInDesignMode = function(){
  if (isDeployment){
    return;
  }
  this.showVisually();
  this.hiddenInDesignMode = false;
  refreshRaycaster(Text.OBJECT_SHOWN);
}

ModelInstance.prototype.setNoMass = function(val){
  if (!val){
    physicsWorld.addBody(this.physicsBody);
  }else{
    physicsWorld.remove(this.physicsBody);
  }
  this.noMass = val;
}

ModelInstance.prototype.setIntersectableStatus = function(val){
  this.isIntersectable = val;
}

ModelInstance.prototype.destroy = function(){
  scene.remove(this.mesh);
  physicsWorld.remove(this.physicsBody);
  this.mesh.material.dispose();
  for (var gridName in this.destroyedGrids){
    this.destroyedGrids[gridName].destroyedModelInstance = 0;
  }
}

ModelInstance.prototype.updateWorldInverseTranspose = function(overrideMatrix){
  if (!projectLoaded){
    return;
  }
  var val = overrideMatrix? overrideMatrix: this.mesh.material.uniforms.worldInverseTranspose.value;
  val.getInverse(this.mesh.matrixWorld).transpose();
  this.matrixCache.copy(this.mesh.matrixWorld);
}

ModelInstance.prototype.setAffectedByLight = function(isAffectedByLight){

  macroHandler.removeMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

  delete this.mesh.material.uniforms.worldInverseTranspose;
  delete this.mesh.material.uniforms.dynamicLightsMatrix;
  delete this.mesh.material.uniforms.worldMatrix;

  if (isAffectedByLight){
    macroHandler.injectMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

    this.mesh.material.uniforms.worldInverseTranspose = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
    this.mesh.material.uniforms.dynamicLightsMatrix = lightHandler.getUniform();
    this.updateWorldInverseTranspose();

    lightHandler.addLightToObject(this);
  }else{
    lightHandler.removeLightFromObject(this);
    if (this.lightingType == lightHandler.lightTypes.PHONG){
      macroHandler.removeMacro("HAS_PHONG_LIGHTING", this.mesh.material, true, true);
    }
    delete this.lightingType;
  }

  this.mesh.material.needsUpdate = true;

  this.affectedByLight = isAffectedByLight;
}

ModelInstance.prototype.setPhongLight = function(){
  macroHandler.injectMacro("HAS_PHONG_LIGHTING", this.mesh.material, true, true);
  this.lightingType = lightHandler.lightTypes.PHONG;
}

ModelInstance.prototype.unsetPhongLight = function(){
  macroHandler.removeMacro("HAS_PHONG_LIGHTING", this.mesh.material, true, true);
  this.lightingType = lightHandler.lightTypes.GOURAUD;
}

ModelInstance.prototype.onBeforeRender = function(){
  if (!this.affectedByLight){
    return;
  }
  if (!this.matrixCache.equals(this.mesh.matrixWorld)){
    this.updateWorldInverseTranspose();
  }
}

ModelInstance.prototype.visualiseNormals = function(){
  this.vertexNormalsHelper = new THREE.VertexNormalsHelper(this.mesh, 10, "lime", 1);
  scene.add(this.vertexNormalsHelper);
}

ModelInstance.prototype.unvisialiseNormals = function(){
  scene.remove(this.vertexNormalsHelper);
  delete this.vertexNormalsHelper;
}
