var AutoInstancingHandler = function(){
  this.maxBatchObjectSize = parseInt((MAX_VERTEX_UNIFORM_VECTORS - 50) / 3);
}

AutoInstancingHandler.prototype.handleSelectiveBloom = function(){
  for (var autoInstancedObjectName in autoInstancedObjects){
    var autoInstancedObject = autoInstancedObjects[autoInstancedObjectName];
    autoInstancedObject.setSelectiveBloom();
    var bloomConfs = sceneHandler.scenes[autoInstancedObject.getRegisteredSceneName()].postProcessing.bloom;
    var shouldInject = bloomConfs.isOn && bloomConfs.isSelective;
    if (shouldInject){
      bloom.makeObjectSelective(autoInstancedObject);
    }
  }
}

AutoInstancingHandler.prototype.getObjectKey = function(obj){
  var geomKey = obj.mesh.geometry.uuid;
  var blendingKey = obj.blendingMode;
  if (!blendingKey){
    blendingKey = "NORMAL_BLENDING";
  }
  var shaderPrecisionKey = shaderPrecisionHandler.precisions[shaderPrecisionHandler.types.BASIC_MATERIAL];
  if (obj.hasCustomPrecision){
    shaderPrecisionKey = obj.customPrecision;
  }

  var selectiveBloomKey = obj.hasSelectiveBloom? "HAS_SELECTIVE_BLOOM": "HAS_NOT_SELECTIVE_BLOOM";

  return geomKey + PIPE + obj.registeredSceneName + PIPE + blendingKey + PIPE + shaderPrecisionKey + PIPE + selectiveBloomKey;
}

AutoInstancingHandler.prototype.handle = function(){
  if (!INSTANCING_SUPPORTED){
    return;
  }
  autoInstancedObjects = new Object();
  var objectsByGeometryID = new Object();
  var countersByObjectKey = new Object();
  for (var objName in addedObjects){
    var obj = addedObjects[objName];
    if (!obj.isFPSWeapon && (obj.isChangeable || (!obj.noMass && obj.physicsBody.mass > 0))){
      var objKey = this.getObjectKey(obj);
      if (typeof countersByObjectKey[objKey] == UNDEFINED){
        countersByObjectKey[objKey] = 0;
      }
      var key = objKey + PIPE + countersByObjectKey[objKey];
      if (!objectsByGeometryID[key]){
        objectsByGeometryID[key] = [];
      }else if (objectsByGeometryID[key].length > this.maxBatchObjectSize){
        countersByObjectKey[objKey] ++;
        key = objKey + PIPE + (countersByObjectKey[objKey]);
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
      var hasPhong = false;
      for (var i = 0; i<ary.length; i++){
        pseudoGroup[ary[i].name] = ary[i];
        scene.remove(ary[i].mesh);
        if (ary[i].affectedByLight && ary[i].lightingType == lightHandler.lightTypes.PHONG){
          hasPhong = true;
        }
      }
      var autoInstancedObject = new AutoInstancedObject("autoInstancedObject_"+(ctr++), pseudoGroup);
      autoInstancedObject.init();
      scene.add(autoInstancedObject.mesh);
      autoInstancedObject.mesh.visible = false;
      autoInstancedObjects[autoInstancedObject.name] = autoInstancedObject;
      sceneHandler.onAutoInstancedObjectCreation(autoInstancedObject);
      if (hasPhong){
        autoInstancedObject.setPhongLight();
      }
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
