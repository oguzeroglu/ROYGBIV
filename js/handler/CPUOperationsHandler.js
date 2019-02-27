var CPUOperationsHandler = function(){
  this.record = false;
  this.performanceLogs = {
    handleSkybox: 0,
    handleAreaConfigurations: 0,
    physicsStep: 0,
    updateDynamicObjects: 0,
    updateTrackingObjects: 0,
    processCameraRotationBuffer: 0,
    runScripts: 0,
    updateRaycaster: 0,
    updateParticleSystems: 0,
    updateObjectTrails: 0,
    updateCrosshair: 0,
    renderScene: 0,
    updateAddedTexts: 0
  }
}

CPUOperationsHandler.prototype.dumpPerformanceLogs = function(){
  var sum = 0;
  var pseudoAry = [];
  for (var key in this.performanceLogs){
    sum += this.performanceLogs[key];
    pseudoAry.push({
      name: key,
      value: this.performanceLogs[key]
    })
  }
  pseudoAry.sort(function(obj1, obj2){
    return obj2.value - obj1.value
  });
  console.log("Total time: "+sum+" ms.")
  for (var i = 0; i<pseudoAry.length; i++){
    console.log("["+pseudoAry[i].name+"] -> "+pseudoAry[i].value+" ms.");
  }
}

CPUOperationsHandler.prototype.updateAddedTexts = function(){
  if (this.record){
    var s = performance.now();
    updateAddedTexts();
    this.performanceLogs.updateAddedTexts = performance.now() - s;
  }else{
    updateAddedTexts();
  }
}

CPUOperationsHandler.prototype.renderScene = function(){
  if (this.record){
    var s = performance.now();
    renderScene();
    this.performanceLogs.renderScene = performance.now() - s;
  }else{
    renderScene();
  }
}

CPUOperationsHandler.prototype.updateCrosshair = function(){
  if (this.record){
    var s = performance.now();
    updateCrosshair();
    this.performanceLogs.updateCrosshair = performance.now() - s;
  }else{
    updateCrosshair();
  }
}

CPUOperationsHandler.prototype.updateObjectTrails = function(){
  if (this.record){
    var s = performance.now();
    updateObjectTrails();
    this.performanceLogs.updateObjectTrails = performance.now() - s;
  }else{
    updateObjectTrails();
  }
}

CPUOperationsHandler.prototype.updateParticleSystems = function(){
  if (this.record){
    var s = performance.now();
    updateParticleSystems();
    this.performanceLogs.updateParticleSystems = performance.now() - s;
  }else{
    updateParticleSystems();
  }
}

CPUOperationsHandler.prototype.updateRaycaster = function(){
  if (this.record){
    var s = performance.now();
    updateRaycaster();
    this.performanceLogs.updateRaycaster = performance.now() - s;
  }else{
    updateRaycaster();
  }
}

CPUOperationsHandler.prototype.runScripts = function(){
  if (this.record){
    var s = performance.now();
    runScripts();
    this.performanceLogs.runScripts = performance.now() - s;
  }else{
    runScripts();
  }
}

CPUOperationsHandler.prototype.processCameraRotationBuffer = function(){
  if (this.record){
    var s = performance.now();
    processCameraRotationBuffer();
    this.performanceLogs.processCameraRotationBuffer = performance.now() - s;
  }else{
    processCameraRotationBuffer();
  }
}

CPUOperationsHandler.prototype.updateTrackingObjects = function(){
  if (this.record){
    var s = performance.now();
    updateTrackingObjects();
    this.performanceLogs.updateTrackingObjects = performance.now() - s;
  }else{
    updateTrackingObjects();
  }
}

CPUOperationsHandler.prototype.updateDynamicObjects = function(){
  if (this.record){
    var s = performance.now();
    updateDynamicObjects();
    this.performanceLogs.updateDynamicObjects = performance.now() - s;
  }else{
    updateDynamicObjects();
  }
}

CPUOperationsHandler.prototype.stepPhysics = function(){
  if (this.record){
    var s = performance.now();
    physicsWorld.step(physicsStepAmount);
    this.performanceLogs.physicsStep = performance.now() - s;
  }else{
    physicsWorld.step(physicsStepAmount);
  }
}

CPUOperationsHandler.prototype.handleAreaConfigurations = function(){
  if (this.record){
    var s = performance.now();
    areaConfigurationsHandler.handle();
    this.performanceLogs.handleAreaConfigurations = performance.now() - s;
  }else{
    areaConfigurationsHandler.handle();
  }
}

CPUOperationsHandler.prototype.handleSkybox = function(){
  if (this.record){
    var s = performance.now();
    handleSkybox();
    this.performanceLogs.handleSkybox = performance.now() - s;
  }else{
    handleSkybox();
  }
}
