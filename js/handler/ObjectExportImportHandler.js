var ObjectExportImportHandler = function(){

}

ObjectExportImportHandler.prototype.exportParticleSystem = function(obj){
  var context = {
    isROYGBIVParticleSystemExport: true,
    isParticleSystem: true,
    export: obj.export()
  };
  if (obj.getUsedTextureName() != null){
    context.particleSystemTexturePack = texturePacks[obj.getUsedTextureName()].export();
  }
  return context;
}

ObjectExportImportHandler.prototype.exportObjectGroup = function(obj){
  var objExport = obj.export();
  var context = {
    isObjectGroup: true,
    export: objExport,
    children: []
  };
  for (var childName in obj.group){
    context.children.push(this.exportAddedObject(obj.group[childName]));
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
  }else if (obj.isObjectGroup){
    context = this.exportObjectGroup(obj);
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
    if (objectGroups[objName]){
      for (var childName in objectGroups[objName].group){
        lightningExport.fpsWeaponConfigurations.childObjName = childName;
        break;
      }
    }
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
    var obj = addedObjects[objName] || objectGroups[objName];
    obj.muzzleFlashParameters.muzzleFlashName = mfName;
    if (obj.isObjectGroup){
      for (var childObjName in obj.group){
        obj.muzzleFlashParameters.childObj = childObjName;
        break;
      }
    }
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

ObjectExportImportHandler.prototype.onChildrenReady = function(readyContext){
  var ctr = 0;
  var newGroup = new Object();
  for (var cn in readyContext.context.export.group){
    newGroup[readyContext.childNames[ctr]] = addedObjects[readyContext.childNames[ctr]].export();
    ctr ++;
  }
  readyContext.context.export.group = newGroup;
  var importHandler = new ImportHandler();
  var pseudo = new Object();
  pseudo.objectGroups = new Object();
  pseudo.objectGroups[readyContext.objName] = readyContext.context.export;
  importHandler.importObjectGroups(pseudo);
  sceneHandler.onObjectGroupCreation(objectGroups[readyContext.objName]);
  for (var childName in objectGroups[readyContext.objName].group){
    sceneHandler.onAddedObjectDeletion(objectGroups[readyContext.objName].group[childName]);
  }
  this.importObjectMuzzleFlash(readyContext.objName, readyContext.context, readyContext.onReady);
}

ObjectExportImportHandler.prototype.objectGroupImportFunc = function(children, readyContext){
  if (readyContext.count == readyContext.total){
    this.onChildrenReady(readyContext);
  }else{
    var childName = generateUniqueObjectName();
    readyContext.childNames.push(childName);
    this.importObject(childName, {
      isAddedObject: true,
      context: children[readyContext.count],
      objGroupContext: true
    }, function(){
      readyContext.count ++;
      this.objectGroupImportFunc(children, readyContext);
    }.bind(this));
  }
}

ObjectExportImportHandler.prototype.importObjectGroup = function(objName, context, onReady){
  var children = context.children;
  var readyContext = {childNames: [], total: children.length, count: 0, objName: objName, context: context, onReady: onReady};
  this.objectGroupImportFunc(children, readyContext);
}

ObjectExportImportHandler.prototype.importAddedObject = function(objName, context, onReady, objGroupContext){
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
    this.handleTexturePack(texturePackExport, function(generatedTPName){
      this.importAddedObjectBody(objName, context, onReady, {tpName: generatedTPName, materialName: generatedMaterialName});
    }.bind(this));
  }else {
    this.importAddedObjectBody(objName, context, onReady, {
      materialName: generatedMaterialName
    });
  }
}

ObjectExportImportHandler.prototype.importFunc = function(objName, json, onReady){
  var context = json.context;
  if (context.isAddedObject) {
    this.importAddedObject(objName, context, onReady, json.objGroupContext);
  }
  if (context.isObjectGroup){
    this.importObjectGroup(objName, context, onReady);
  }
}

ObjectExportImportHandler.prototype.importObject = function(objName, json, onReady){
  var context = json.context;
  if (context.particleSystemTexturePack){
    this.handleTexturePack(context.particleSystemTexturePack, function(generatedTPName){
      context.particleSystemTexturePack.name = generatedTPName;
      this.importFunc(objName, json, onReady);
    }.bind(this));
    return;
  }

  this.importFunc(objName, json, onReady);
}

ObjectExportImportHandler.prototype.importPSFunction = function(psName, json, onReady){
  var psExport = json.export;
  if (json.particleSystemTexturePack){
    if (psExport.type == "CUSTOM"){
      psExport.params.material.textureName = json.particleSystemTexturePack.name;
    }else{
      psExport.params.textureName = json.particleSystemTexturePack.name;
    }
  }
  var pseudo = new Object();
  pseudo.preConfiguredParticleSystems = new Object();
  pseudo.preConfiguredParticleSystems[psName] = psExport;
  var importHandler = new ImportHandler();
  importHandler.importParticleSystems(pseudo);
  preConfiguredParticleSystems[psName].name = psName;
  preConfiguredParticleSystems[psName].params.name = psName;
  sceneHandler.onParticleSystemCreation(preConfiguredParticleSystems[psName]);
  onReady();
}

ObjectExportImportHandler.prototype.importParticleSystem = function(psName, json, onReady){
  var context = json.export;
  if (json.particleSystemTexturePack){
    this.handleTexturePack(json.particleSystemTexturePack, function(generatedTPName){
      json.particleSystemTexturePack.name = generatedTPName;
      this.importPSFunction(psName, json, onReady);
    }.bind(this));
    return;
  }

  this.importPSFunction(psName, json, onReady);
}

ObjectExportImportHandler.prototype.handleTexturePack = function(texurePack, callbackFunction, skipAtlasRefresh){
  var importHandler = new ImportHandler();
  var generatedTexturePackName = generateUniqueTexturePackName();
  var pseudo = new Object();
  pseudo.texturePacks = new Object();
  pseudo.texturePacks[generatedTexturePackName] = texurePack;
  importHandler.importTexturePacks(pseudo, function(){
    if (!skipAtlasRefresh){
      terminal.printInfo(Text.GENERATING_TEXTURE_ATLAS);
      textureAtlasHandler.onTexturePackChange(function(){
        callbackFunction(generatedTexturePackName);
      }, noop, true);
    }else{
      callbackFunction(generatedTexturePackName);
    }
  }, true);
}
