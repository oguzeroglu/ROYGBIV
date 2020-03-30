var LightHandler = function(){
  this.reset();
}

LightHandler.prototype.reset = function(){

  delete this.staticAmbientColor;
  delete this.staticAmbientStrength;

  this.staticDiffuseLightCount = 0;
  this.staticPointLightCount = 0;

  this.staticDiffuseLightsBySlotId = new Object();
  this.staticPointLightsBySlotId = new Object();
}

LightHandler.prototype.onAfterSceneChange = function(){
  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();
  var autoInstancedObjectsInScene = sceneHandler.getAutoInstancedObjects();

  for (var objName in addedObjectsInScene){
    var addedObject = addedObjectsInScene[objName];
    if (addedObject.affectedByLight){
      this.addLightToObject(addedObject);
    }
  }

  for (var objName in objectGroupsInScene){
    var objectGroup = objectGroupsInScene[objName];
    if (objectGroup.affectedByLight){
      this.addLightToObject(objectGroup);
    }
  }

  for (var objName in autoInstancedObjectsInScene){
    var autoInstancedObject = autoInstancedObjectsInScene[objName];
    if (autoInstancedObject.affectedByLight){
      this.addLightToObject(autoInstancedObject);
    }
  }
}

LightHandler.prototype.onBeforeSceneChange = function(){
  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();
  var autoInstancedObjectsInScene = sceneHandler.getAutoInstancedObjects();

  for (var objName in addedObjectsInScene){
    var addedObject = addedObjectsInScene[objName];
    if (addedObject.affectedByLight){
      this.removeLightFromObject(addedObject);
    }
  }

  for (var objName in objectGroupsInScene){
    var objectGroup = objectGroupsInScene[objName];
    if (objectGroup.affectedByLight){
      this.removeLightFromObject(objectGroup);
    }
  }

  for (var objName in autoInstancedObjectsInScene){
    var autoInstancedObject = autoInstancedObjectsInScene[objName];
    if (autoInstancedObject.affectedByLight){
      this.removeLightFromObject(autoInstancedObject);
    }
  }
}

LightHandler.prototype.import = function(obj){
  this.staticDiffuseLightCount = obj.staticDiffuseLightCount || 0;
  this.staticPointLightCount = obj.staticPointLightCount || 0;
  this.staticDiffuseLightsBySlotId = obj.staticDiffuseLightsBySlotId? JSON.parse(JSON.stringify(obj.staticDiffuseLightsBySlotId)): {};
  this.staticPointLightsBySlotId = obj.staticPointLightsBySlotId? JSON.parse(JSON.stringify(obj.staticPointLightsBySlotId)): {};
  if (obj.staticAmbientInfo){
    this.staticAmbientColor = new THREE.Color(parseFloat(obj.staticAmbientInfo.r), parseFloat(obj.staticAmbientInfo.g), parseFloat(obj.staticAmbientInfo.b));
    this.staticAmbientStrength = parseFloat(obj.staticAmbientInfo.strength);
  }else{
    delete this.staticAmbientColor;
    delete this.staticAmbientStrength;
  }
}

LightHandler.prototype.export = function(){
  var exportObj = {
    staticDiffuseLightCount: this.staticDiffuseLightCount,
    staticPointLightCount: this.staticPointLightCount,
    staticDiffuseLightsBySlotId: JSON.parse(JSON.stringify(this.staticDiffuseLightsBySlotId)),
    staticPointLightsBySlotId: JSON.parse(JSON.stringify(this.staticPointLightsBySlotId))
  };

  if (this.staticAmbientColor){
    exportObj.staticAmbientInfo = {
      r: this.staticAmbientColor.r, g: this.staticAmbientColor.g, b: this.staticAmbientColor.b,
      strength: this.staticAmbientStrength
    };
  }

  return exportObj;
}

LightHandler.prototype.removeLightFromObject = function(obj){
  if (this.staticAmbientColor){
    this.removeStaticAmbientLightMacros(obj);
  }

  for (var slotID in this.staticDiffuseLightsBySlotId){
    this.removeStaticDiffuseLightMacros(obj, slotID);
  }

  for (var slotID in this.staticPointLightsBySlotId){
    this.removeStaticPointLightMacros(obj, slotID);
  }
}

LightHandler.prototype.addLightToObject = function(obj){
  if (this.staticAmbientColor){
    this.handleStaticAmbientLightMacros(obj, this.staticAmbientColor, this.staticAmbientStrength);
  }

  for (var slotID in this.staticDiffuseLightsBySlotId){
    var staticDiffuseLight = this.staticDiffuseLightsBySlotId[slotID];
    this.handleStaticDiffuseLightMacros(slotID, obj, new THREE.Vector3(staticDiffuseLight.directionX, staticDiffuseLight.directionY, staticDiffuseLight.directionZ), new THREE.Color(staticDiffuseLight.colorR, staticDiffuseLight.colorG, staticDiffuseLight.colorB), staticDiffuseLight.strength);
  }

  for (var slotID in this.staticPointLightsBySlotId){
    var staticPointLight = this.staticPointLightsBySlotId[slotID];
    this.handleStaticPointLightMacros(slotID, obj, new THREE.Vector3(staticPointLight.positionX, staticPointLight.positionY, staticPointLight.positionZ), new THREE.Color(staticPointLight.colorR, staticPointLight.colorG, staticPointLight.colorB), staticPointLight.strength);
  }
}

LightHandler.prototype.removeStaticPointLight = function(slotID){

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticPointLightMacros(obj, slotID);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticPointLightMacros(obj, slotID);
  }

  this.staticPointLightCount --;

  delete this.staticPointLightsBySlotId[slotID];

  sceneHandler.onLightsUpdated();
}

LightHandler.prototype.addStaticPointLight = function(position, color, strength){
  if (this.staticPointLightCount == MAX_STATIC_POINT_LIGHT_COUNT){
    return;
  }

  var foundSlotID = 1;
  for (var i = 0; i < MAX_STATIC_POINT_LIGHT_COUNT; i ++){
    if (!this.staticPointLightsBySlotId[i + 1]){
      foundSlotID = i + 1;
      break;
    }
  }

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticPointLightMacros(foundSlotID, obj, position, color, strength);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticPointLightMacros(foundSlotID, obj, position, color, strength);
  }

  this.staticPointLightsBySlotId[foundSlotID] = {
    positionX: position.x, positionY: position.y, positionZ: position.z,
    colorR: color.r, colorG: color.g, colorB: color.b,
    strength: strength
  };

  this.staticPointLightCount ++;

  sceneHandler.onLightsUpdated();

  return foundSlotID;
}

LightHandler.prototype.removeStaticDiffuseLight = function(slotID){

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticDiffuseLightMacros(obj,slotID);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticDiffuseLightMacros(obj,slotID);
  }

  this.staticDiffuseLightCount --;

  delete this.staticDiffuseLightsBySlotId[slotID];

  sceneHandler.onLightsUpdated();
}

LightHandler.prototype.addStaticDiffuseLight = function(direction, color, strength){
  if (this.staticDiffuseLightCount == MAX_STATIC_DIFFUSE_LIGHT_COUNT){
    return;
  }

  var foundSlotID = 1;
  for (var i = 0; i < MAX_STATIC_DIFFUSE_LIGHT_COUNT; i ++){
    if (!this.staticDiffuseLightsBySlotId[i + 1]){
      foundSlotID = i + 1;
      break;
    }
  }

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticDiffuseLightMacros(foundSlotID, obj, direction, color, strength);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticDiffuseLightMacros(foundSlotID, obj, direction, color, strength);
  }

  this.staticDiffuseLightsBySlotId[foundSlotID] = {
    directionX: direction.x, directionY: direction.y, directionZ: direction.z,
    colorR: color.r, colorG: color.g, colorB: color.b,
    strength: strength
  };

  this.staticDiffuseLightCount ++;

  sceneHandler.onLightsUpdated();

  return foundSlotID;
}

LightHandler.prototype.removeStaticAmbientLight = function(){
  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticAmbientLightMacros(obj);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticAmbientLightMacros(obj);
  }

  delete this.staticAmbientColor;
  delete this.staticAmbientStrength;

  sceneHandler.onLightsUpdated();
}

LightHandler.prototype.setStaticAmbientLight = function(color, strength){
  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticAmbientLightMacros(obj, color, strength);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticAmbientLightMacros(obj, color, strength);
  }

  this.staticAmbientColor = color.clone();
  this.staticAmbientStrength = strength;

  sceneHandler.onLightsUpdated();
}

LightHandler.prototype.removeStaticPointLightMacros = function(obj, slotID){
  var info = this.staticPointLightsBySlotId[slotID];
  if (info){
    macroHandler.removeMacro("HAS_STATIC_POINT_LIGHT_" + slotID, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_X " + info.positionX, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_Y " + info.positionY, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_Z " + info.positionZ, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_R " + info.colorR, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_G " + info.colorG, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_B " + info.colorB, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_POINT_LIGHT_"+ slotID +"_STRENGTH " + info.strength, obj.mesh.material, true, false);
  }
}

LightHandler.prototype.handleStaticPointLightMacros = function(slotID, obj, position, color, strength){

  this.removeStaticPointLightMacros(obj, slotID);

  macroHandler.injectMacro("HAS_STATIC_POINT_LIGHT_" + slotID, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_X " + position.x, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_Y " + position.y, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_Z " + position.z, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_R " + color.r, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_G " + color.g, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_B " + color.b, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_POINT_LIGHT_"+ slotID +"_STRENGTH " + strength, obj.mesh.material, true, false);
}

LightHandler.prototype.removeStaticDiffuseLightMacros = function(obj, slotID){
  var info = this.staticDiffuseLightsBySlotId[slotID];
  if (info){
    macroHandler.removeMacro("HAS_STATIC_DIFFUSE_LIGHT_" + slotID, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_X " + info.directionX, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_Y " + info.directionY, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_Z " + info.directionZ, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_R " + info.colorR, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_G " + info.colorG, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_B " + info.colorB, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_STRENGTH " + info.strength, obj.mesh.material, true, false);
  }
}

LightHandler.prototype.handleStaticDiffuseLightMacros = function(slotID, obj, direction, color, strength){

  this.removeStaticDiffuseLightMacros(obj, slotID);

  macroHandler.injectMacro("HAS_STATIC_DIFFUSE_LIGHT_" + slotID, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_X " + direction.x, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_Y " + direction.y, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_Z " + direction.z, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_R " + color.r, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_G " + color.g, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_B " + color.b, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_STRENGTH " + strength, obj.mesh.material, true, false);
}

LightHandler.prototype.removeStaticAmbientLightMacros = function(obj){
  if (this.staticAmbientColor){
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_R " + this.staticAmbientColor.r, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_G " + this.staticAmbientColor.g, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_B " + this.staticAmbientColor.b, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_STRENGTH " + this.staticAmbientStrength, obj.mesh.material, true, false);
    macroHandler.removeMacro("HAS_STATIC_AMBIENT_LIGHT", obj.mesh.material, true, false);
  }
}

LightHandler.prototype.handleStaticAmbientLightMacros = function(obj, color, strength){

  this.removeStaticAmbientLightMacros(obj);

  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_R " + color.r, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_G " + color.g, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_B " + color.b, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_STRENGTH " + strength, obj.mesh.material, true, false);
  macroHandler.injectMacro("HAS_STATIC_AMBIENT_LIGHT", obj.mesh.material, true, false);
}
