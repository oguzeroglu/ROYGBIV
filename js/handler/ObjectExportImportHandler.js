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
    if (muzzleFlash.refPreconfiguredPS.getUsedTextureName() != null){
      context.particleSystemTexturePack = texturePacks[muzzleFlash.refPreconfiguredPS.getUsedTextureName()].export();
    }
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

ObjectExportImportHandler.prototype.importObjectLightning = function(objName, context, onReady){
  if (context.lightning){
    var lightningExport = context.lightning;
    var lightningName = generateUniqueLightningName();
    lightningExport.fpsWeaponConfigurations.weaponObjName = objName;
    lightningExport.name = lightningName;
    var importHandler = new ImportHandler();
    var pseudo = new Object();
    pseudo.lightnings = new Object();
    pseudo.lightnings[lightningName] = lightningExport;
    importHandler.importLightnings(pseudo);
    sceneHandler.onLightningCreation(lightnings[lightningName]);
  }
  onReady();
}

ObjectExportImportHandler.prototype.importObjectMuzzleFlash = function(objName, context, onReady){
  if (context.particleSystem){
    var psExport = context.particleSystem;
    if (context.particleSystemTexturePack){
      if (psExport.type == "CUSTOM"){
        psExport.params.material.textureName = context.particleSystemTexturePack.name;
      }else{
        psExport.params.textureName = context.particleSystemTexturePack.name;
      }
    }
    var pseudo = new Object();
    pseudo.preConfiguredParticleSystems = new Object();
    var psName = generateUniqueParticleSystemName();
    var mfName = generateUniqueMuzzleFlashName();
    pseudo.preConfiguredParticleSystems[psName] = context.particleSystem;
    pseudo.muzzleFlashes = new Object();
    context.muzzleFlash.refPreconfiguredPSName = psName;
    pseudo.muzzleFlashes[mfName] = context.muzzleFlash;
    var importHandler = new ImportHandler();
    importHandler.importParticleSystems(pseudo);
    addedObjects[objName].muzzleFlashParameters.muzzleFlashName = mfName;
    preConfiguredParticleSystems[psName].name = psName;
    preConfiguredParticleSystems[psName].params.name = psName;
    sceneHandler.onParticleSystemCreation(preConfiguredParticleSystems[psName]);
    sceneHandler.onMuzzleFlashCreation(muzzleFlashes[mfName]);
  }
  this.importObjectLightning(objName, context, onReady);
}

ObjectExportImportHandler.prototype.importAddedObjectBody = function(objName, context, onReady, meta){
  var importHandler = new ImportHandler();
  var objExport = context.export;
  if (meta.materialName){
    objExport.roygbivMaterialName = meta.materialName;
  }
  var pseudo = new Object();
  pseudo.addedObjects = new Object();
  pseudo.addedObjects[objName] = objExport;
  importHandler.importAddedObjects(pseudo);
  sceneHandler.onAddedObjectCreation(addedObjects[objName]);
  if (meta.tpName){
    addedObjects[objName].mapTexturePack(texturePacks[meta.tpName]);
    var textureRepeatU = (typeof objExport.textureRepeatU == UNDEFINED)? 1: objExport.textureRepeatU;
    var textureRepeatV = (typeof objExport.textureRepeatV == UNDEFINED)? 1: objExport.textureRepeatV;
    addedObjects[objName].adjustTextureRepeat(textureRepeatU, textureRepeatV);
    var mirrorS = "OFF";
    var mirrorT = "OFF";
    if (!(typeof objExport.metaData.mirrorS == UNDEFINED)){
      if (objExport.metaData.mirrorS == "ON"){
        mirrorS = "ON";
      }
    }
    if (!(typeof objExport.metaData.mirrorT == UNDEFINED)){
      if (objExport.metaData.mirrorT == "ON"){
        mirrorT = "ON";
      }
    }
    addedObjects[objName].handleMirror("S", mirrorS);
    addedObjects[objName].handleMirror("T", mirrorT);
    var textureOffsetX, textureOffsetY;
    if (!(typeof objExport.textureOffsetX == UNDEFINED)){
      textureOffsetX = objExport.textureOffsetX;
    }else{
      textureOffsetX = 0;
    }
    if (!(typeof objExport.textureOffsetY == UNDEFINED)){
      textureOffsetY = objExport.textureOffsetY;
    }else{
      textureOffsetY = 0;
    }
    addedObjects[objName].setTextureOffsetX(textureOffsetX);
    addedObjects[objName].setTextureOffsetY(textureOffsetY);
    if (!(typeof objExport.displacementScale == UNDEFINED)){
      addedObjects[objName].setDisplacementScale(objExport.displacementScale);
    }
    if (!(typeof objExport.displacementBias == UNDEFINED)){
      addedObjects[objName].setDisplacementBias(objExport.displacementBias);
    }
  }
  this.importObjectMuzzleFlash(objName, context, onReady);
}

ObjectExportImportHandler.prototype.importAddedObject = function(objName, context, onReady){
  var importHandler = new ImportHandler();
  var materialExport = context.material;
  var texturePackExport = context.texturePack;
  var generatedMaterialName;
  var generatedTexturePackName;
  if (materialExport){
    generatedMaterialName = generateUniqueMaterialName();
    var pseudo = new Object();
    pseudo.materials = new Object();
    pseudo.materials[generatedMaterialName] = materialExport;
    importHandler.importMaterials(pseudo);
    materials[generatedMaterialName].roygbivMaterialName = generatedMaterialName;
  }
  if (texturePackExport){
    generatedTexturePackName = generateUniqueTexturePackName();
    var pseudo = new Object();
    pseudo.texturePacks = new Object();
    pseudo.texturePacks[generatedTexturePackName] = texturePackExport;
    importHandler.importTexturePacks(pseudo, function(){
      this.importAddedObjectBody(objName, context, onReady, {
        tpName: generatedTexturePackName,
        materialName: generatedMaterialName
      });
    }.bind(this), true);
  }else {
    this.importAddedObjectBody(objName, context, onReady, {
      materialName: generatedMaterialName
    });
  }
}

ObjectExportImportHandler.prototype.importObject = function(objName, json, onReady){
  var context = json.context;
  if (context.isAddedObject) {
    if (context.particleSystemTexturePack){
      var importHandler = new ImportHandler();
      var generatedTexturePackName = generateUniqueTexturePackName();
      var pseudo = new Object();
      pseudo.texturePacks = new Object();
      pseudo.texturePacks[generatedTexturePackName] = context.particleSystemTexturePack;
      importHandler.importTexturePacks(pseudo, function(){
        textureAtlasHandler.onTexturePackChange(function(){
          context.particleSystemTexturePack.name = generatedTexturePackName;
          this.importAddedObject(objName, context, onReady);
        }.bind(this), noop, true);
      }.bind(this), true);
    }else{
      this.importAddedObject(objName, context, onReady);
    }
  }
}
