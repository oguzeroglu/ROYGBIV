var ObjectExportImportHandler = function(){

}

ObjectExportImportHandler.prototype.exportAddedObject = function(obj){
  var objExport = obj.export();
  objExport.destroyedGrids = new Object();
  delete objExport.areaVisibilityConfigurations;
  delete objExport.areaSideConfigurations;
  var context = {
    isAddedObject: true,
    export: objExport,
  };
  if (materials[obj.material.roygbivMaterialName]){
    context.material = materials[obj.material.roygbivMaterialName].export();
  }
  if (texturePacks[obj.associatedTexturePack]){
    context.texturePack = texturePacks[obj.associatedTexturePack].export();
  }
  if (obj.muzzleFlashParameters){
    var muzzleFlash = muzzleFlashes[obj.muzzleFlashParameters.muzzleFlashName];
    context.muzzleFlash = muzzleFlash.export();
    context.particleSystem = muzzleFlash.refPreconfiguredPS.export();
  }
  for (var lightningName in lightnings){
    if (lightnings[lightningName].fpsWeaponConfigurations.weaponObj.name == obj.name){
      context.lightning = lightnings[lightningName].export();
      break;
    }
  }
  return context;
}

ObjectExportImportHandler.prototype.exportObject = function(obj){
  var context;
  if (obj.isAddedObject){
    context = this.exportAddedObject(obj);
  }
  return {
    isROYGBIVObjectExport: true,
    context: context
  };
}
