var LightHandler = function(){
  this.staticDiffuseLightCount = 0;

  this.staticDiffuseLightsBySlotId = new Object();
}

LightHandler.prototype.removeStaticDiffuseLight = function(slotID){

  var addedObjectsInScene = sceneHandler.getAddedObjects();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticDiffuseLightMacros(obj,slotID);
  }

  this.staticDiffuseLightCount --;

  delete this.staticDiffuseLightsBySlotId[slotID];
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

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticDiffuseLightMacros(foundSlotID, obj, direction, color, strength);
  }

  this.staticDiffuseLightsBySlotId[foundSlotID] = {
    direction: direction.clone(),
    color: color.clone(),
    strength: strength
  };

  this.staticDiffuseLightCount ++;
  return foundSlotID;
}

LightHandler.prototype.removeStaticAmbientLight = function(){
  var addedObjectsInScene = sceneHandler.getAddedObjects();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticAmbientLightMacros(obj);
  }

  delete this.staticAmbientColor;
  delete this.staticAmbientStrength;
}

LightHandler.prototype.setStaticAmbientLight = function(color, strength){
  var addedObjectsInScene = sceneHandler.getAddedObjects();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticAmbientLightMacros(obj, color, strength);
  }

  this.staticAmbientColor = color.clone();
  this.staticAmbientStrength = strength;
}

LightHandler.prototype.removeStaticDiffuseLightMacros = function(obj, slotID){
  var info = this.staticDiffuseLightsBySlotId[slotID];
  if (info){
    macroHandler.removeMacro("HAS_STATIC_DIFFUSE_LIGHT_" + slotID, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_X " + info.direction.x, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_Y " + info.direction.y, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_DIR_Z " + info.direction.z, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_R " + info.color.r, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_G " + info.color.g, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_DIFFUSE_LIGHT_"+ slotID +"_B " + info.color.b, obj.mesh.material, true, false);
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
