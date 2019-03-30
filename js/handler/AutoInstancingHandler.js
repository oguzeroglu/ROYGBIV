var AutoInstancingHandler = function(){
  this.maxBatchObjectSize = parseInt((MAX_VERTEX_UNIFORM_VECTORS - 50) / 3);
}

AutoInstancingHandler.prototype.handle = function(){
  if (!INSTANCING_SUPPORTED){
    return;
  }
  autoInstancedObjects = new Object();
  var objectsByGeometryID = new Object();
  var countersByGeometryID = new Object();
  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0)){
      var geom = obj.mesh.geometry;
      if (typeof countersByGeometryID[geom.uuid] == UNDEFINED){
        countersByGeometryID[geom.uuid] = 0;
      }
      var key = geom.uuid + PIPE + countersByGeometryID[geom.uuid];
      if (!objectsByGeometryID[key]){
        objectsByGeometryID[key] = [];
      }else if (objectsByGeometryID[key].length > this.maxBatchObjectSize){
        countersByGeometryID[geom.uuid] ++;
        key = geom.uuid + PIPE + (countersByGeometryID[geom.uuid]);
        objectsByGeometryID[key] = [];
      }
      objectsByGeometryID[key].push(obj);
    }
  }
  var ctr = 0;
  for (var key in objectsByGeometryID){
    var ary = objectsByGeometryID[key];
    if (ary.length > 1){
      var pseudoGroup = new Object();
      for (var i = 0; i<ary.length; i++){
        pseudoGroup[ary[i].name] = ary[i];
        scene.remove(ary[i].mesh);
      }
      var autoInstancedObject = new AutoInstancedObject("autoInstancedObject_"+(ctr++), pseudoGroup);
      autoInstancedObject.init();
      scene.add(autoInstancedObject.mesh);
      autoInstancedObjects[autoInstancedObject.name] = autoInstancedObject;
    }
  }
}

AutoInstancingHandler.prototype.reset = function(){
  if (!INSTANCING_SUPPORTED){
    return;
  }
  for (var autoInstancedObjectName in autoInstancedObjects){
    var autoInstancedObject = autoInstancedObjects[autoInstancedObjectName];
    scene.remove(autoInstancedObject.mesh);
    for (var objName in autoInstancedObject.objects){
      scene.add(autoInstancedObject.objects[objName].mesh);
      delete autoInstancedObject.objects[objName].autoInstancedParent;
    }
  }
  autoInstancedObjects = new Object();
}
