var Scene = function(name){
  this.name = name;
  this.reset();
}

Scene.prototype.reset = function(){
  this.backgroundColor = "#000000";
  this.addedObjects = new Object();
  this.objectGroups = new Object();
  this.addedTexts = new Object();
  this.addedTexts2D = new Object();
  this.gridSystems = new Object();
  this.wallCollections = new Object();
  this.markedPoints = new Object();
  this.areas = new Object();
  this.particleSystems = new Object();
  this.particleSystemPools = new Object();
  this.muzzleFlashes = new Object();
  this.crosshairs = new Object();
  this.lightnings = new Object();
  this.autoInstancedObjects = new Object();
  this.areaBinHandler = new WorldBinHandler(true);
  this.dynamicObjects = new Map();
  this.dynamicObjectGroups = new Map();
  this.clickableAddedTexts = new Object();
  this.clickableAddedTexts2D = new Object();
  this.clickableSprites = new Object();
  this.clickableContainers = new Object();
  this.trackingObjects = new Object();
  this.sprites = new Object();
  this.containers = new Object();
  this.virtualKeyboards = new Object();
  this.masses = new Object();
  this.areaBinHandler.isAreaBinHandler = true;
  this.isSkyboxMapped = false;
  this.lightInfo = {};
}

Scene.prototype.onBeforeExit = function(){
  if (this.beforeExitCallback){
    this.beforeExitCallback();
  }
}

Scene.prototype.loadLights = function(){
  lightHandler.import(this.lightInfo);
}

Scene.prototype.saveLights = function(){
  this.lightInfo = lightHandler.export();
}

Scene.prototype.destroy = function(){
  for (var objName in this.addedObjects){
    parseCommand("destroyObject "+objName);
  }
  for (var objName in this.objectGroups){
    parseCommand("destroyObject "+objName);
  }
  for (var textName in this.addedTexts){
    parseCommand("destroyText "+textName);
  }
  for (var gsName in this.gridSystems){
    parseCommand("destroyGridSystem "+gsName);
  }
  for (var wcName in this.wallCollections){
    parseCommand("destroyWallCollection "+wcName);
  }
  for (var mpName in this.markedPoints){
    parseCommand("unmark "+mpName);
  }
  for (var areaName in this.areas){
    parseCommand("destroyArea "+areaName);
  }
  for (var psPoolName in this.particleSystemPools){
    parseCommand("destroyParticleSystemPool "+psPoolName);
  }
  for (var muzzleFlashName in this.muzzleFlashes){
    parseCommand("destroyMuzzleFlash "+muzzleFlashName);
  }
  for (var lightningName in this.lightnings){
    parseCommand("destroyLightning "+lightningName);
  }
  for (var psName in this.particleSystems){
    parseCommand("destroyParticleSystem "+psName);
  }
  for (var chName in this.crosshairs){
    parseCommand("destroyCrosshair "+chName);
  }
  for (var spriteName in this.sprites){
    parseCommand("destroySprite "+spriteName);
  }
  for (var containerName in this.containers){
    parseCommand("destroyContainer "+containerName);
  }
  for (var virtualKeyboardName in this.virtualKeyboards){
    parseCommand("destroyVirtualKeyboard "+virtualKeyboardName);
  }
  for (var massName in this.masses){
    parseCommand("destroyMass " + massName);
  }
  this.reset();

  steeringHandler.onSceneDeletion(this.name);
}

Scene.prototype.resetTrackingObjects = function(){
  this.trackingObjects = new Object();
}

Scene.prototype.resetClickableTexts = function(){
  this.clickableAddedTexts = new Object();
  this.clickableAddedTexts2D = new Object();
}

Scene.prototype.resetClickableSprites = function(){
  this.clickableSprites = new Object();
}

Scene.prototype.resetClickableContainers = function(){
  this.clickableContainers = new Object();
}

Scene.prototype.loadPostProcessing = function(){
  if (this.postProcessing){
    for (var effecName in this.postProcessing){
      renderer.effects[effecName].load(this.postProcessing[effecName]);
    }
  }else{
    for (var effecName in renderer.effects){
      renderer.effects[effecName].reset();
    }
  }
}

Scene.prototype.savePostProcessing = function(){
  if (!projectLoaded){
    return;
  }
  this.postProcessing = new Object();
  for (var effectName in renderer.effects){
    this.postProcessing[effectName] = JSON.parse(JSON.stringify(renderer.effects[effectName].export()));
  }
}

Scene.prototype.import = function(exportObj){
  this.backgroundColor = exportObj.backgroundColor;
  for (var i = 0; i<exportObj.addedObjectNames.length; i++){
    this.registerAddedObject(addedObjects[exportObj.addedObjectNames[i]]);
  }
  for (var i = 0; i<exportObj.objectGroupNames.length; i++){
    this.registerObjectGroup(objectGroups[exportObj.objectGroupNames[i]]);
  }
  for (var i = 0; i<exportObj.addedTextNames.length; i++){
    this.registerAddedText(addedTexts[exportObj.addedTextNames[i]]);
  }
  for (var i = 0; i<exportObj.gridSystemNames.length; i++){
    this.registerGridSystem(gridSystems[exportObj.gridSystemNames[i]]);
  }
  for (var i = 0; i<exportObj.wallCollectionNames.length; i++){
    this.registerWallCollection(wallCollections[exportObj.wallCollectionNames[i]]);
  }
  for (var i = 0; i<exportObj.markedPointNames.length; i++){
    this.registerMarkedPoint(markedPoints[exportObj.markedPointNames[i]]);
  }
  for (var i = 0; i<exportObj.areaNames.length; i++){
    this.registerArea(areas[exportObj.areaNames[i]]);
    this.areaBinHandler.insert(areas[exportObj.areaNames[i]].boundingBox, exportObj.areaNames[i]);
  }
  for (var i = 0; i<exportObj.particleSystemNames.length; i++){
    this.registerParticleSystem(preConfiguredParticleSystems[exportObj.particleSystemNames[i]]);
  }
  for (var i = 0; i<exportObj.particleSystemPoolNames.length; i++){
    this.registerParticleSystemPool(preConfiguredParticleSystemPools[exportObj.particleSystemPoolNames[i]]);
  }
  for (var i = 0; i<exportObj.muzzleFlashNames.length; i++){
    this.registerMuzzleFlash(muzzleFlashes[exportObj.muzzleFlashNames[i]]);
  }
  for (var i = 0; i<exportObj.crosshairNames.length; i++){
    this.registerCrosshair(crosshairs[exportObj.crosshairNames[i]]);
  }
  for (var i = 0; i<exportObj.lightningNames.length; i++){
    this.registerLightning(lightnings[exportObj.lightningNames[i]]);
  }
  for (var i = 0; i<exportObj.spriteNames.length; i++){
    this.registerSprite(sprites[exportObj.spriteNames[i]]);
  }
  for (var i = 0; i<exportObj.containerNames.length; i++){
    this.registerContainer(containers[exportObj.containerNames[i]]);
  }
  for (var i = 0; i<exportObj.virtualKeyboardNames.length; i++){
    this.registerVirtualKeyboard(virtualKeyboards[exportObj.virtualKeyboardNames[i]]);
  }
  this.isSkyboxMapped = exportObj.isSkyboxMapped;
  if (this.isSkyboxMapped){
    this.mappedSkyboxName = exportObj.mappedSkyboxName;
  }
  if (exportObj.fogConfigurations){
    this.fogConfigurations = exportObj.fogConfigurations;
  }
  this.postProcessing = exportObj.postProcessing;
  this.lightInfo = exportObj.lightInfo;

  for (var massName in exportObj.masses){
    var mass = new Mass(massName, new THREE.Vector3(), new THREE.Vector3());
    mass.import(exportObj.masses[massName]);
    this.registerMass(mass);
    masses[massName] = mass;
  }
}

Scene.prototype.export = function(){
  var exportObj = new Object();
  exportObj.backgroundColor = this.backgroundColor;
  exportObj.addedObjectNames = Object.keys(this.addedObjects);
  exportObj.objectGroupNames = Object.keys(this.objectGroups);
  exportObj.addedTextNames = Object.keys(this.addedTexts);
  exportObj.gridSystemNames = Object.keys(this.gridSystems);
  exportObj.wallCollectionNames = Object.keys(this.wallCollections);
  exportObj.markedPointNames = Object.keys(this.markedPoints);
  exportObj.areaNames = Object.keys(this.areas);
  exportObj.particleSystemNames = Object.keys(this.particleSystems);
  exportObj.particleSystemPoolNames = Object.keys(this.particleSystemPools);
  exportObj.muzzleFlashNames = Object.keys(this.muzzleFlashes);
  exportObj.lightningNames = Object.keys(this.lightnings);
  exportObj.crosshairNames = Object.keys(this.crosshairs);
  exportObj.spriteNames = Object.keys(this.sprites);
  exportObj.containerNames = Object.keys(this.containers);
  exportObj.virtualKeyboardNames = Object.keys(this.virtualKeyboards);
  exportObj.isSkyboxMapped = this.isSkyboxMapped;
  exportObj.postProcessing = this.postProcessing;

  exportObj.lightInfo = this.lightInfo;
  if (this.isSkyboxMapped){
    exportObj.mappedSkyboxName = this.mappedSkyboxName;
  }
  if (this.fogConfigurations){
    exportObj.fogConfigurations = this.fogConfigurations;
  }

  exportObj.masses = {};
  for (var massName in this.masses){
    exportObj.masses[massName] = this.masses[massName].export();
  }

  return exportObj;
}

Scene.prototype.refreshAreaBinHandler = function(){
  this.areaBinHandler = new WorldBinHandler(true);
  this.areaBinHandler.isAreaBinHandler = true;
  for (var areaName in this.areas){
    this.areaBinHandler.insert(areas[areaName].boundingBox, areaName);
  }
}

Scene.prototype.resetAutoInstancedObjects = function(){
  this.autoInstancedObjects = new Object();
}

Scene.prototype.unregisterVirtualKeyboard = function(virtualKeyboard){
  delete this.virtualKeyboards[virtualKeyboard.name];
  delete virtualKeyboard.registeredSceneName;
}

Scene.prototype.registerVirtualKeyboard = function(virtualKeyboard){
  this.virtualKeyboards[virtualKeyboard.name] = virtualKeyboard;
  virtualKeyboard.registeredSceneName = this.name;
}

Scene.prototype.unregisterContainer = function(container){
  delete this.containers[container.name];
  delete container.registeredSceneName;
}

Scene.prototype.registerContainer = function(container){
  this.containers[container.name] = container;
  container.registeredSceneName = this.name;
}

Scene.prototype.unregisterSprite = function(sprite){
  delete this.sprites[sprite.name];
  delete sprite.registeredSceneName;
}

Scene.prototype.registerSprite = function(sprite){
  this.sprites[sprite.name] = sprite;
  sprite.registeredSceneName = this.name;
}

Scene.prototype.registerTrackingObject = function(obj){
  this.trackingObjects[obj.name] = obj;
}

Scene.prototype.unregisterTrackingObject = function(obj){
  delete this.trackingObjects[obj.name];
}

Scene.prototype.registerClickableText = function(addedText){
  this.clickableAddedTexts[addedText.name] = addedText;
}

Scene.prototype.registerClickableText2D = function(addedText){
  this.clickableAddedTexts2D[addedText.name] = addedText;
}

Scene.prototype.registerClickableSprite = function(sprite){
  this.clickableSprites[sprite.name] = sprite;
}

Scene.prototype.registerClickableContainer = function(container){
  this.clickableContainers[container.name] = container;
}

Scene.prototype.registerDynamicObject = function(obj){
  if (obj.isAddedObject){
    this.dynamicObjects.set(obj.name, obj);
  }else{
    this.dynamicObjectGroups.set(obj.name, obj);
  }
}

Scene.prototype.unregisterDynamicObject = function(obj){
  if (obj.isAddedObject){
    this.dynamicObjects.delete(obj.name);
  }else{
    this.dynamicObjectGroups.delete(obj.name);
  }
}

Scene.prototype.resetDynamicObjects = function(){
  this.dynamicObjects.clear();
  this.dynamicObjectGroups.clear();
}

Scene.prototype.registerAutoInstancedObject = function(autoInstancedObject){
  this.autoInstancedObjects[autoInstancedObject.name] = autoInstancedObject;
}

Scene.prototype.registerLightning = function(lightning){
  this.lightnings[lightning.name] = lightning;
  lightning.registeredSceneName = this.name;
}

Scene.prototype.unregisterLightning = function(lightning){
  delete this.lightnings[lightning.name];
  delete lightning.registeredSceneName;
}

Scene.prototype.registerCrosshair = function(crosshair){
  this.crosshairs[crosshair.name] = crosshair;
  crosshair.registeredSceneName = this.name;
}

Scene.prototype.unregisterCrosshair = function(crosshair){
  delete this.crosshairs[crosshair.name];
  delete crosshair.registeredSceneName;
}

Scene.prototype.registerMuzzleFlash = function(muzzleFlash){
  this.muzzleFlashes[muzzleFlash.name] = muzzleFlash;
  muzzleFlash.registeredSceneName = this.name;
}

Scene.prototype.unregisterMuzzleFlash = function(muzzleFlash){
  delete this.muzzleFlashes[muzzleFlash.name];
  delete muzzleFlash.registeredSceneName;
}

Scene.prototype.registerParticleSystemPool = function(preConfiguredParticleSystemPool){
  this.particleSystemPools[preConfiguredParticleSystemPool.poolName] = preConfiguredParticleSystemPool;
  preConfiguredParticleSystemPool.registeredSceneName = this.name;
}

Scene.prototype.unregisterParticleSystemPool = function(preConfiguredParticleSystemPool){
  delete this.particleSystemPools[preConfiguredParticleSystemPool.poolName];
  delete preConfiguredParticleSystemPool.registeredSceneName;
}

Scene.prototype.registerParticleSystem = function(preConfiguredParticleSystem){
  this.particleSystems[preConfiguredParticleSystem.name] = preConfiguredParticleSystem;
  preConfiguredParticleSystem.registeredSceneName = this.name;
}

Scene.prototype.unregisterParticleSystem = function(preConfiguredParticleSystem){
  delete this.particleSystems[preConfiguredParticleSystem.name];
  delete preConfiguredParticleSystem.registeredSceneName;
}

Scene.prototype.registerFog = function(fogConfigurations){
  this.fogConfigurations = fogConfigurations;
}

Scene.prototype.mapSkybox = function(skybox){
  this.isSkyboxMapped = true;
  this.mappedSkyboxName = skybox.name;
}

Scene.prototype.unmapSkybox = function(){
  this.isSkyboxMapped = false;
  delete this.mappedSkyboxName;
}

Scene.prototype.registerAddedText = function(addedText){
  this.addedTexts[addedText.name] = addedText;
  addedText.registeredSceneName = this.name;
  if (addedText.is2D){
    this.addedTexts2D[addedText.name] = addedText;
  }
}

Scene.prototype.unregisterAddedText = function(addedText){
  delete this.addedTexts[addedText.name];
  delete addedText.registeredSceneName;
  if (addedText.is2D){
    delete this.addedTexts2D[addedText.name];
  }
}

Scene.prototype.registerObjectGroup = function(objectGroup){
  this.objectGroups[objectGroup.name] = objectGroup;
  objectGroup.registeredSceneName = this.name;
}

Scene.prototype.unregisterObjectGroup = function(objectGroup){
  delete this.objectGroups[objectGroup.name];
  delete objectGroup.registeredSceneName;
}

Scene.prototype.registerAddedObject = function(addedObject){
  this.addedObjects[addedObject.name] = addedObject;
  addedObject.registeredSceneName = this.name;
}

Scene.prototype.unregisterAddedObject = function(addedObject){
  delete this.addedObjects[addedObject.name];
  delete addedObject.registeredSceneName;
}

Scene.prototype.registerArea = function(area){
  this.areas[area.name] = area;
  area.registeredSceneName = this.name;
}

Scene.prototype.unregisterArea = function(area){
  delete this.areas[area.name];
  delete area.registeredSceneName;
}

Scene.prototype.registerGridSystem = function(gridSystem){
  this.gridSystems[gridSystem.name] = gridSystem;
  gridSystem.registeredSceneName = this.name;
}

Scene.prototype.unregisterGridSystem = function(gridSystem){
  delete this.gridSystems[gridSystem.name];
  delete gridSystem.registeredSceneName;
}

Scene.prototype.registerWallCollection = function(wallCollection){
  for (var i = 0; i<wallCollection.gridSystemNames.length; i++){
    this.registerGridSystem(gridSystems[wallCollection.gridSystemNames[i]]);
  }
  this.wallCollections[wallCollection.name] = wallCollection;
  wallCollection.registeredSceneName = this.name;
}

Scene.prototype.unregisterWallCollection = function(wallCollection){
  for (var i = 0; i<wallCollection.gridSystemNames.length; i++){
    this.unregisterGridSystem(gridSystems[wallCollection.gridSystemNames[i]]);
  }
  delete this.wallCollections[wallCollection.name];
  delete wallCollection.registeredSceneName;
}

Scene.prototype.registerMarkedPoint = function(markedPoint){
  this.markedPoints[markedPoint.name] = markedPoint;
  markedPoint.registeredSceneName = this.name;
}

Scene.prototype.unregisterMarkedPoint = function(markedPoint){
  delete this.markedPoints[markedPoint.name];
  delete markedPoint.registeredSceneName;
}

Scene.prototype.registerMass = function(mass){
  this.masses[mass.name] = mass;
  mass.registeredSceneName = this.name;
}

Scene.prototype.unregisterMass = function(mass){
  delete this.masses[mass.name];
  delete mass.registeredSceneName;
}
