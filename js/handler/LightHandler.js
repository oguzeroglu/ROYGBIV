var LightHandler = function(){

}

LightHandler.prototype.removeAmbientLight = function(){
  var addedObjectsInScene = sceneHandler.getAddedObjects();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.removeStaticAmbientLightMacros(obj);
  }

  delete this.ambientColor;
  delete this.ambientStrength;
}

LightHandler.prototype.setAmbientLight = function(color, strength){
  var addedObjectsInScene = sceneHandler.getAddedObjects();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }

    this.handleStaticAmbientLightMacros(obj, color, strength);
  }

  this.ambientColor = color.clone();
  this.ambientStrength = strength;

  return this.ambientLightCount;
}

LightHandler.prototype.removeStaticAmbientLightMacros = function(obj){
  if (this.ambientColor){
    macroHandler.removeMacro("AFFECTED_BY_LIGHT", obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_R " + this.ambientColor.r, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_G " + this.ambientColor.g, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_B " + this.ambientColor.b, obj.mesh.material, true, false);
    macroHandler.removeMacro("STATIC_AMBIENT_LIGHT_STRENGTH " + this.ambientStrength, obj.mesh.material, true, false);
    macroHandler.removeMacro("HAS_STATIC_AMBIENT_LIGHT", obj.mesh.material, true, false);
  }
}

LightHandler.prototype.handleStaticAmbientLightMacros = function(obj, color, strength){

  this.removeStaticAmbientLightMacros(obj);

  macroHandler.injectMacro("AFFECTED_BY_LIGHT", obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_R " + color.r, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_G " + color.g, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_B " + color.b, obj.mesh.material, true, false);
  macroHandler.injectMacro("STATIC_AMBIENT_LIGHT_STRENGTH " + strength, obj.mesh.material, true, false);
  macroHandler.injectMacro("HAS_STATIC_AMBIENT_LIGHT", obj.mesh.material, true, false);
}
