var StateLoaderLightweight = function(state){
  this.state = state;
}

StateLoaderLightweight.prototype.loadCamera = function(){
  camera = new THREE.PerspectiveCamera( this.state.camera.fov, this.state.camera.aspect, 1, 10000 );
  camera.position.set(this.state.camera.position.x, this.state.camera.position.y, this.state.camera.position.z);
  camera.quaternion.set(this.state.camera.quaternion.x, this.state.camera.quaternion.y, this.state.camera.quaternion.z, this.state.camera.quaternion.w);
}

StateLoaderLightweight.prototype.loadRenderer = function(){
  renderer = {
    viewport: new THREE.Vector4(this.state.viewport.x, this.state.viewport.y, this.state.viewport.z, this.state.viewport.w),
    getCurrentViewport: function(){
      return this.viewport;
    }
  }
  screenResolution = this.state.screenResolution;
}

StateLoaderLightweight.prototype.loadWorldLimits = function(){
  var octreeLimit = this.state.octreeLimit;
  LIMIT_BOUNDING_BOX.min.set(octreeLimit.minX, octreeLimit.minY, octreeLimit.minZ);
  LIMIT_BOUNDING_BOX.max.set(octreeLimit.maxX, octreeLimit.maxY, octreeLimit.maxZ);
  BIN_SIZE = this.state.binSize;
  RAYCASTER_STEP_AMOUNT = this.state.raycasterStepAmount;
}

StateLoaderLightweight.prototype.loadBoundingBoxes = function(){
  var gridSystemExports = this.state.gridSystems;
  var addedObjectExports = this.state.addedObjects;
  var childAddedObjectExports = this.state.childAddedObjects;
  var objectGroupExports = this.state.objectGroups;
  var addedTextExports = this.state.addedTexts3D;
  for (var gsName in gridSystemExports){
    var gridSystem = new GridSystem();
    gridSystem.name = gsName;
    gridSystem.boundingBox = new THREE.Box3(gridSystemExports[gsName].bbMin, gridSystemExports[gsName].bbMax);
    gridSystem.triangles = [];
    gridSystem.trianglePlanes = [];
    for (var i = 0; i<gridSystemExports[gsName].triangles.length; i++){
      var curExp = gridSystemExports[gsName].triangles[i];
      var aVec = new THREE.Vector3(curExp.a.x, curExp.a.y, curExp.a.z);
      var bVec = new THREE.Vector3(curExp.b.x, curExp.b.y, curExp.b.z);
      var cVec = new THREE.Vector3(curExp.c.x, curExp.c.y, curExp.c.z);
      var triangle = new THREE.Triangle(aVec, bVec, cVec);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      gridSystem.triangles.push(triangle);
      gridSystem.trianglePlanes.push(plane);
    }
    gridSystems[gsName] = gridSystem;
  }
  var totalAddedObjectExports = new Object();
  for (var objName in addedObjectExports){
    totalAddedObjectExports[objName] = addedObjectExports[objName];
  }
  for (var objName in childAddedObjectExports){
    totalAddedObjectExports[objName] = childAddedObjectExports[objName];
  }
  for (var objName in totalAddedObjectExports){
    var curExport = totalAddedObjectExports[objName];
    var addedObject = new AddedObject();
    addedObject.isChangeable = curExport.isChangeable;
    addedObject.isIntersectable = curExport.isIntersectable;
    addedObject.parentBoundingBoxIndex = curExport.parentBoundingBoxIndex;
    addedObject.lastUpdatePosition = new THREE.Vector3();
    addedObject.lastUpdateQuaternion = new THREE.Quaternion();
    addedObject.reusableVec3 = new THREE.Vector3();
    addedObject.vertices = [];
    addedObject.transformedVertices = [];
    addedObject.triangles = [];
    addedObject.trianglePlanes = [];
    addedObject.pseudoFaces = [];
    addedObject.mesh = new THREE.Object3D();
    addedObject.mesh.matrixWorld.fromArray(curExport.matrixWorld);
    addedObject.mesh.matrixWorld.decompose(addedObject.mesh.position, addedObject.mesh.quaternion, addedObject.mesh.scale);
    addedObject.mesh.position = new THREE.Vector3(curExport.position.x, curExport.position.y, curExport.position.z);
    addedObject.mesh.quaternion = new THREE.Quaternion(curExport.quaternion.x, curExport.quaternion.y, curExport.quaternion.z, curExport.quaternion.w);
    if (childAddedObjectExports[objName]){
      addedObject.mesh.matrixWorld.decompose(addedObject.mesh.position, addedObject.mesh.quaternion, addedObject.mesh.scale);
    }
    addedObject.name = objName;
    var bb = new THREE.Box3();
    bb.roygbivObjectName = objName;
    addedObject.boundingBoxes = [bb];
    for (var i = 0; i<curExport.vertices.length; i++){
      var curVertex = curExport.vertices[i];
      var vect = new THREE.Vector3(curVertex.x, curVertex.y, curVertex.z)
      addedObject.vertices.push(vect.clone());
      addedObject.transformedVertices.push(vect);
      bb.expandByPoint(vect);
    }
    for (var i = 0; i<curExport.triangles.length; i++){
      var curExp = curExport.triangles[i];
      var aVec = new THREE.Vector3(curExp.a.x, curExp.a.y, curExp.a.z);
      var bVec = new THREE.Vector3(curExp.b.x, curExp.b.y, curExp.b.z);
      var cVec = new THREE.Vector3(curExp.c.x, curExp.c.y, curExp.c.z);
      var triangle = new THREE.Triangle(aVec, bVec, cVec);
      var plane = new THREE.Plane();
      triangle.getPlane(plane);
      addedObject.triangles.push(triangle);
      addedObject.trianglePlanes.push(plane);
    }
    for (var i = 0; i<curExport.pseudoFaces.length; i++){
      var curExp = curExport.pseudoFaces[i];
      var a = curExp.a;
      var b = curExp.b;
      var c = curExp.c;
      var materialIndex = curExp.materialIndex;
      var normal = new THREE.Vector3(curExp.normal.x, curExp.normal.y, curExp.normal.z);
      addedObject.pseudoFaces.push(new THREE.Face3(a, b, c, normal));
    }
    addedObject.updateBoundingBoxes();
    addedObjects[objName] = addedObject;
  }
  for (var objName in objectGroupExports){
    var curExport = objectGroupExports[objName];
    var objectGroup = new ObjectGroup();
    objectGroup.isIntersectable = curExport.isIntersectable;
    objectGroup.isChangeable = curExport.isChangeable;
    objectGroup.lastUpdatePosition = new THREE.Vector3();
    objectGroup.lastUpdateQuaternion = new THREE.Quaternion();
    objectGroup.boundingBoxes = [];
    objectGroup.name = objName;
    objectGroup.mesh = new THREE.Object3D();
    objectGroup.group = new Object();
    objectGroup.mesh.matrixWorld.fromArray(curExport.matrixWorld);
    objectGroup.mesh.position.set(curExport.position.x, curExport.position.y, curExport.position.z);
    objectGroup.mesh.quaternion.set(curExport.quaternion._x, curExport.quaternion._y, curExport.quaternion._z, curExport.quaternion._w);
    objectGroup.center = new THREE.Vector3(curExport.center.x, curExport.center.y, curExport.center.z);
    objectGroup.mesh.updateMatrixWorld();
    objectGroup.graphicsGroup = objectGroup.mesh;
    objectGroup.childsByChildWorkerId = new Object();
    for (var i = 0; i<curExport.childNames.length; i++){
      var childObj = addedObjects[curExport.childNames[i]];
      childObj.mesh.updateMatrixWorld();
      objectGroup.group[childObj.name] = childObj;
      childObj.mesh.position.sub(objectGroup.center);
      objectGroup.graphicsGroup.add(childObj.mesh);
      objectGroup.graphicsGroup.updateMatrixWorld();
      childObj.mesh.updateMatrixWorld();
      delete addedObjects[childObj.name];
      objectGroup.childsByChildWorkerId[curExport.childWorkerIndices[i]] = childObj;
    }
    for (var i = 0; i<curExport.boundingBoxes.length; i++){
      var curBBExport = curExport.boundingBoxes[i].boundingBox;
      var min = new THREE.Vector3(curBBExport.min.x, curBBExport.min.y, curBBExport.min.z);
      var max = new THREE.Vector3(curBBExport.max.x, curBBExport.max.y, curBBExport.max.z);
      var bb = new THREE.Box3(min.clone(), max.clone());
      bb.roygbivObjectName = curBBExport.roygbivObjectName;
      objectGroup.boundingBoxes.push(bb);
    }
    objectGroup.updateBoundingBoxes();
    objectGroups[objName] = objectGroup;
  }
  for (var textName in addedTextExports){
    var curExport = addedTextExports[textName];
    var addedText = new AddedText();
    addedText.name = curExport.name;
    addedText.bottomLeft = new THREE.Vector3(curExport.bottomLeft.x, curExport.bottomLeft.y, curExport.bottomLeft.z);
    addedText.bottomRight = new THREE.Vector3(curExport.bottomRight.x, curExport.bottomRight.y, curExport.bottomRight.z);
    addedText.topLeft = new THREE.Vector3(curExport.topLeft.x, curExport.topLeft.y, curExport.topLeft.z);
    addedText.topRight = new THREE.Vector3(curExport.topRight.x, curExport.topRight.y, curExport.topRight.z);
    addedText.characterSize = curExport.charSize;
    addedText.mesh = new THREE.Object3D();
    addedText.mesh.position.set(curExport.position.x, curExport.position.y, curExport.position.z);
    addedText.position = new THREE.Vector3(curExport.initPosition.x, curExport.initPosition.y, curExport.initPosition.z);
    addedText.tmpObj = new Object();
    addedText.lastUpdateQuaternion = new THREE.Quaternion();
    addedText.lastUpdatePosition = new THREE.Vector3();
    addedText.lastUpdateCameraPosition = new THREE.Vector3();
    addedText.isClickable = curExport.isClickable;
    addedText.handleBoundingBox();
    addedTexts[textName] = addedText;
  }
}

StateLoaderLightweight.prototype.reset = function(){
  addedObjects = new Object();
  objectGroups = new Object();
  gridSystems = new Object();
  addedTexts = new Object();
}
