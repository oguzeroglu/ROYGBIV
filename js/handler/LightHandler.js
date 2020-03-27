var LightHandler = function(){
  this.ambientLightCount = 0;
}

LightHandler.prototype.addStaticAmbientLight = function(color){
  if (this.ambientLightCount == MAX_AMBIENT_LIGHT_COUNT){
    return;
  }

  this.ambientLightCount ++;

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var ambientLightMacroNames = this.getStaticAmbientLightMacroNames();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      return;
    }

    macroHandler.injectMacro("AFFECTED_BY_LIGHT", obj.mesh.material, true, false);
    macroHandler.injectMacro(ambientLightMacroNames.r + " " + color.r, obj.mesh.material, true, false);
    macroHandler.injectMacro(ambientLightMacroNames.g + " " + color.g, obj.mesh.material, true, false);
    macroHandler.injectMacro(ambientLightMacroNames.b + " " + color.b, obj.mesh.material, true, false);
    macroHandler.injectMacro(ambientLightMacroNames.strength + " 1.0", obj.mesh.material, true, false);
    macroHandler.injectMacro(ambientLightMacroNames.availibility, obj.mesh.material, true, false);
  }

  return this.ambientLightCount;
}

LightHandler.prototype.getStaticAmbientLightMacroNames = function(){
  var rMacroName = "STATIC_AMBIENT_LIGHT_"+ this.ambientLightCount +"_R";
  var gMacroName = "STATIC_AMBIENT_LIGHT_"+ this.ambientLightCount +"_G";
  var bMacroName = "STATIC_AMBIENT_LIGHT_"+ this.ambientLightCount +"_B";
  var strengthMacroName = "STATIC_AMBIENT_LIGHT_"+ this.ambientLightCount +"_STRENGTH";
  var availibilityName = "HAS_STATIC_AMBIENT_LIGHT_" + this.ambientLightCount;

  return {
    availibility: availibilityName,
    r: rMacroName,
    g: gMacroName,
    b: bMacroName,
    strength: strengthMacroName
  };
}
