var LightHandler = function(){

  this.dynamicLightTypes = {
    AMBIENT_COLOR: 0,
    AMBIENT_STRENGTH: 1,
    DIFFUSE_DIR: 2,
    DIFFUSE_COLOR: 3,
    DIFFUSE_STRENGTH: 4,
    POINT_POSITION: 5,
    POINT_COLOR: 6,
    POINT_STRENGTH: 7,
    DIFFUSE_DIR_COLOR: 8,
    DIFFUSE_DIR_STRENGTH: 9,
    DIFFUSE_COLOR_STRENGTH: 10,
    POINT_POSITION_COLOR: 11,
    POINT_POSITION_STRENGTH: 12,
    POINT_COLOR_STRENGTH: 13,
    DIFFUSE_DIR_COLOR_STRENGTH: 14,
    POINT_POSITION_COLOR_STRENGTH: 15,
    AMBIENT_COLOR_STRENGTH: 16
  };

  this.dynamicLightsMatrix = new THREE.Matrix4();
  this.dynamicLightsMatrixUniform = new THREE.Uniform(this.dynamicLightsMatrix);
  this.reset();
}

LightHandler.prototype.getUniform = function(){
  return this.dynamicLightsMatrixUniform;
}

LightHandler.prototype.lightObjectAttachmentUpdateFunc = function(object, lightName){
  var light = lightHandler.dynamicLights[lightName];
  light.dynamicInfo.positionX = object.mesh.position.x;
  light.dynamicInfo.positionY = object.mesh.position.y;
  light.dynamicInfo.positionZ = object.mesh.position.z;
  lightHandler.updateDynamicLight(light);
}

LightHandler.prototype.update = function(){
  this.lightObjectAttachments.forEach(this.lightObjectAttachmentUpdateFunc);
}

LightHandler.prototype.attachLightToObject = function(light, object){
  this.lightObjectAttachments.set(light.name, object);
}

LightHandler.prototype.getDynamicLightMacros = function(light, index){
  var macros = [];
  macros.push("DYNAMIC_LIGHT_" + index + "_TYPE " + this.dynamicLightTypes[light.typeKey]);

  for (var key in light.staticInfo){
    macros.push("DYNAMIC_LIGHT_" + index + "_STATIC_" + key + " " + light.staticInfo[key]);
  }
  return macros;
}

LightHandler.prototype.removeDynamicLightFromObject = function(object, light){
  var index = this.dynamicLightsIndicesByLightName[light.name];
  var macros = this.getDynamicLightMacros(light, index);
  for (var i = 0; i < macros.length; i ++){
    macroHandler.removeMacro(macros[i], object.mesh.material, true, false);
  }
}

LightHandler.prototype.addDynamicLightToObject = function(object, light){
  var index = this.dynamicLightsIndicesByLightName[light.name];
  var macros = this.getDynamicLightMacros(light, index);
  for (var i = 0; i < macros.length; i ++){
    macroHandler.injectMacro(macros[i], object.mesh.material, true, false);
  }
}

LightHandler.prototype.updateDynamicLight = function(dynamicLight, index){
  if (typeof index == UNDEFINED){
    index = this.dynamicLightsMatrixIndicesByLightName[dynamicLight.name];
  }
  if (!(typeof dynamicLight.dynamicInfo.colorR == UNDEFINED)){
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.colorR;
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.colorG;
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.colorB;
  }
  if (!(typeof dynamicLight.dynamicInfo.dirX == UNDEFINED)){
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.dirX;
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.dirY;
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.dirZ;
  }
  if (!(typeof dynamicLight.dynamicInfo.positionX == UNDEFINED)){
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.positionX;
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.positionY;
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.positionZ;
  }
  if (!(typeof dynamicLight.dynamicInfo.strength == UNDEFINED)){
    this.dynamicLightsMatrix.elements[index ++] = dynamicLight.dynamicInfo.strength;
  }

  this.dynamicLights[dynamicLight.name] = dynamicLight;

  sceneHandler.onLightsUpdated();

  return index;
}

LightHandler.prototype.removeDynamicLight = function(dynamicLight){
  var omited = new Object();
  for (var name in this.dynamicLights){
    if (name != dynamicLight.name){
      omited[name] = JSON.parse(JSON.stringify(this.dynamicLights[name]));
    }
  }

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var lightName in this.dynamicLights){
    for (var objName in addedObjectsInScene){
      var obj = addedObjectsInScene[objName];
      if (obj.affectedByLight){
        this.removeDynamicLightFromObject(obj, this.dynamicLights[lightName]);
      }
    }
    for (var objName in objectGroupsInScene){
      var obj = objectGroupsInScene[objName];
      if (obj.affectedByLight){
        this.removeDynamicLightFromObject(obj, this.dynamicLights[lightName]);
      }
    }
  }

  this.resetDynamicLights();

  for (var lightName in omited){
    this.addDynamicLight(omited[lightName]);
  }

  sceneHandler.onLightsUpdated();
}

// dynamicLight:
//    typeKey
//    name
//    staticInfo -> COLOR_R, COLOR_G, COLOR_B, DIR_X, DIR_Y, DIR_Z, POS_X, POS_Y, POS_Z, STRENGTH
//    dynamicInfo -> colorR, colorG, colorB, dirX, dirY, dirZ, positionX, positionY, positionZ, strength
LightHandler.prototype.addDynamicLight = function(dynamicLight){
  var weight = this.calculateDynamicTypeWeight(dynamicLight.typeKey);

  if (weight + this.dynamicLightsMatrixIndex > this.dynamicLightsMatrix.elements.length){
    return false;
  }

  var index = Object.keys(this.dynamicLights).length + 1;
  this.dynamicLightsIndicesByLightName[dynamicLight.name] = index;

  var addedObjectsInScene = sceneHandler.getAddedObjects();
  var objectGroupsInScene = sceneHandler.getObjectGroups();

  for (var objName in addedObjectsInScene){
    var obj = addedObjectsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }
    this.addDynamicLightToObject(obj, dynamicLight);
  }

  for (var objName in objectGroupsInScene){
    var obj = objectGroupsInScene[objName];
    if (!obj.affectedByLight){
      continue;
    }
    this.addDynamicLightToObject(obj, dynamicLight);
  }

  this.dynamicLightsMatrixIndicesByLightName[dynamicLight.name] = this.dynamicLightsMatrixIndex;
  this.dynamicLightsMatrixIndex = this.updateDynamicLight(dynamicLight, this.dynamicLightsMatrixIndex);
  this.dynamicLights[dynamicLight.name] = JSON.parse(JSON.stringify(dynamicLight));

  sceneHandler.onLightsUpdated();
  return true;
}

LightHandler.prototype.calculateDynamicTypeWeight = function(typeKey){
  var splitted = typeKey.split("_");
  var weight = 0;
  for (var i = 0; i < splitted.length; i ++){
    if (splitted[i] == "COLOR"){
      weight += 3;
    }else if (splitted[i] == "DIR"){
      weight += 3;
    }else if (splitted[i] == "POSITION"){
      weight += 3;
    }else if (splitted[i] == "STRENGTH"){
      weight ++;
    }
  }
  return weight;
}

LightHandler.prototype.onSwitchFromPreviewToDesign = function(){

  this.unbakeLights();

  for (var sceneName in sceneHandler.scenes){
    sceneHandler.scenes[sceneName].lightInfo = JSON.parse(JSON.stringify(this.originalLightInfos[sceneName]));
  }

  delete this.originalLightInfos;

  this.import(sceneHandler.scenes[sceneHandler.getActiveSceneName()].lightInfo);
}

LightHandler.prototype.onSwitchFromDesignToPreview = function(){

  this.originalLightInfos = new Object();

  for (var sceneName in sceneHandler.scenes){
    this.originalLightInfos[sceneName] = JSON.parse(JSON.stringify(sceneHandler.scenes[sceneName].lightInfo));
  }

  this.lightObjectAttachments = new Map();
}

LightHandler.prototype.bakeObjectLight = function(obj){
  var result = [];

  var normalAttrAry = obj.mesh.geometry.attributes.normal.array;
  var positionAttrAry = obj.mesh.geometry.attributes.position.array;

  var color;
  if (obj.isAddedObject){
    color = new THREE.Vector3(obj.mesh.material.uniforms.color.value.r, obj.mesh.material.uniforms.color.value.g, obj.mesh.material.uniforms.color.value.b);
  }

  var mat = new THREE.Matrix4();
  obj.updateWorldInverseTranspose(mat);
  var mat3 = new THREE.Matrix3().setFromMatrix4(mat);

  obj.mesh.updateMatrixWorld(true);

  for (var i = 0; i < normalAttrAry.length; i = i + 3){
    var normal = new THREE.Vector3(normalAttrAry[i], normalAttrAry[i + 1], normalAttrAry[i + 2]);
    var pos = new THREE.Vector3(positionAttrAry[i], positionAttrAry[i + 1], positionAttrAry[i + 2]);

    if (obj.isObjectGroup){
      var colorAry = obj.mesh.geometry.attributes.color.array;
      color = new THREE.Vector3(colorAry[i], colorAry[i + 1], colorAry[i + 2]);
    }

    normal.applyMatrix3(mat3).normalize();
    pos.applyMatrix4(obj.mesh.matrixWorld);

    var ambient = new THREE.Vector3(0, 0, 0);
    var diffuse = new THREE.Vector3(0, 0, 0);

    if (this.hasStaticAmbientLight()){
      ambient.set(this.staticAmbientColor.r * this.staticAmbientStrength, this.staticAmbientColor.g * this.staticAmbientStrength, this.staticAmbientColor.b * this.staticAmbientStrength);
    }

    for (var slotID in this.staticDiffuseLightsBySlotId){
      var info = this.staticDiffuseLightsBySlotId[slotID];
      var lightDirNegative = new THREE.Vector3(-info.directionX, -info.directionY, -info.directionZ).normalize();
      var diffuseFactor = normal.dot(lightDirNegative);
      if (diffuseFactor > 0){
        diffuse.x += info.strength * diffuseFactor * info.colorR;
        diffuse.y += info.strength * diffuseFactor * info.colorG;
        diffuse.z += info.strength * diffuseFactor * info.colorB;
      }
    }

    for (var slotID in this.staticPointLightsBySlotId){
      var info = this.staticPointLightsBySlotId[slotID];
      var toLight = new THREE.Vector3(info.positionX - pos.x, info.positionY - pos.y, info.positionZ - pos.z).normalize();
      var diffuseFactor = normal.dot(toLight);
      if (diffuseFactor > 0){
        diffuse.x += info.strength * diffuseFactor * info.colorR;
        diffuse.y += info.strength * diffuseFactor * info.colorG;
        diffuse.z += info.strength * diffuseFactor * info.colorB;
      }
    }

    result.push(color.x * (ambient.x + diffuse.x));
    result.push(color.y * (ambient.y + diffuse.y));
    result.push(color.z * (ambient.z + diffuse.z));
  }

  macroHandler.injectMacro("IS_LIGHT_BAKED", obj.mesh.material, true, false);
  obj.mesh.material.needsUpdate = true;
  obj.mesh.geometry.addAttribute("bakedColor", new THREE.BufferAttribute(new Float32Array(result), 3));
  obj.mesh.geometry.attributes.bakedColor.needsUpdate = true;
}

LightHandler.prototype.unbakeLights = function(){
  var objects = this.findBakeableObjects();
  for (var i = 0; i < objects.length; i ++){
    var object = objects[i];
    macroHandler.removeMacro("IS_LIGHT_BAKED", object.mesh.material, true, false);
    object.mesh.material.needsUpdate = true;
    object.mesh.geometry.removeAttribute("bakedColor");
  }
}

LightHandler.prototype.bakeLights = function(){
  var objects = this.findBakeableObjects();
  for (var i = 0; i < objects.length; i ++){
    var object = objects[i];
    this.bakeObjectLight(object);
  }
}

LightHandler.prototype.findBakeableObjects = function(){
  var bakeableObjects = [];
  for (var objName in addedObjects){
    var obj1 = addedObjects[objName];
    if (obj1.isChangeable || obj1.isDynamicObject || !obj1.affectedByLight){
      continue;
    }
    var isBakeable = true;
    for (var objName2 in addedObjects){
      if (objName != objName2){
        var obj2 = addedObjects[objName2];
        if (obj1.mesh.geometry == obj2.mesh.geometry){
          isBakeable = false;
          break;
        }
      }
    }
    if (isBakeable){
      bakeableObjects.push(obj1);
    }
  }

  for (var objName in objectGroups){
    var obj = objectGroups[objName];
    if (!obj.isChangeable && !obj.isDynamicObject && obj.affectedByLight && !obj.isInstanced){
      bakeableObjects.push(obj);
    }
  }
  return bakeableObjects;
}

LightHandler.prototype.resetDynamicLights = function(){
  this.dynamicLights = new Object();
  this.dynamicLightsMatrixIndicesByLightName = new Object();
  this.dynamicLightsIndicesByLightName = new Object();
  this.dynamicLightsMatrixIndex = 0;
}

LightHandler.prototype.reset = function(){

  delete this.staticAmbientColor;
  delete this.staticAmbientStrength;

  this.staticDiffuseLightCount = 0;
  this.staticPointLightCount = 0;

  this.staticDiffuseLightsBySlotId = new Object();
  this.staticPointLightsBySlotId = new Object();

  this.resetDynamicLights();
}

LightHandler.prototype.getStaticPointStrength = function(slotID){
  var info = this.staticPointLightsBySlotId[slotID];
  return info.strength;
}

LightHandler.prototype.getStaticPointPosition = function(slotID){
  var info = this.staticPointLightsBySlotId[slotID];
  return new THREE.Vector3(info.positionX, info.positionY, info.positionZ);
}

LightHandler.prototype.getStaticPointColor = function(slotID){
  var info = this.staticPointLightsBySlotId[slotID];
  return new THREE.Color(info.colorR, info.colorG, info.colorB);
}

LightHandler.prototype.hasStaticPointLight = function(slotID){
  return !!this.staticPointLightsBySlotId[slotID];
}

LightHandler.prototype.getStaticDiffuseStrength = function(slotID){
  var info = this.staticDiffuseLightsBySlotId[slotID];
  return info.strength;
}

LightHandler.prototype.getStaticDiffuseDirection = function(slotID){
  var info = this.staticDiffuseLightsBySlotId[slotID];
  return new THREE.Vector3(info.directionX, info.directionY, info.directionZ);
}

LightHandler.prototype.getStaticDiffuseColor = function(slotID){
  var info = this.staticDiffuseLightsBySlotId[slotID];
  return new THREE.Color(info.colorR, info.colorG, info.colorB);
}

LightHandler.prototype.hasStaticDiffuseLight = function(slotID){
  return !!this.staticDiffuseLightsBySlotId[slotID];
}

LightHandler.prototype.getStaticAmbientStrength = function(){
  return this.staticAmbientStrength;
}

LightHandler.prototype.getStaticAmbientColor = function(){
  return this.staticAmbientColor.clone();
}

LightHandler.prototype.hasStaticAmbientLight = function(){
  return !!this.staticAmbientColor;
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

  if (mode == 1){
    this.bakeLights();
  }
}

LightHandler.prototype.onBeforeSceneChange = function(){

  if (mode == 1){
    this.unbakeLights();
  }

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

  this.dynamicLights = JSON.parse(JSON.stringify(obj.dynamicLights || {}));
  this.dynamicLightsMatrixIndicesByLightName = JSON.parse(JSON.stringify(obj.dynamicLightsMatrixIndicesByLightName || {}));
  this.dynamicLightsIndicesByLightName = JSON.parse(JSON.stringify(obj.dynamicLightsIndicesByLightName|| {}));
  this.dynamicLightsMatrixIndex = obj.dynamicLightsMatrixIndex;
  if (typeof this.dynamicLightsMatrixIndex == UNDEFINED){
    this.dynamicLightsMatrixIndex = 0;
  }

  for (var name in this.dynamicLights){
    this.updateDynamicLight(this.dynamicLights[name], this.dynamicLightsMatrixIndicesByLightName[name]);
  }

  if (obj.staticAmbientInfo){
    this.staticAmbientColor = new THREE.Color(parseFloat(obj.staticAmbientInfo.r), parseFloat(obj.staticAmbientInfo.g), parseFloat(obj.staticAmbientInfo.b));
    this.staticAmbientStrength = parseFloat(obj.staticAmbientInfo.strength);
  }else{
    delete this.staticAmbientColor;
    delete this.staticAmbientStrength;
  }

  this.lightObjectAttachments = new Map();
}

LightHandler.prototype.export = function(){
  var exportObj = {
    staticDiffuseLightCount: this.staticDiffuseLightCount,
    staticPointLightCount: this.staticPointLightCount,
    staticDiffuseLightsBySlotId: JSON.parse(JSON.stringify(this.staticDiffuseLightsBySlotId)),
    staticPointLightsBySlotId: JSON.parse(JSON.stringify(this.staticPointLightsBySlotId)),
    dynamicLights: JSON.parse(JSON.stringify(this.dynamicLights)),
    dynamicLightsMatrixIndicesByLightName: JSON.parse(JSON.stringify(this.dynamicLightsMatrixIndicesByLightName)),
    dynamicLightsIndicesByLightName: JSON.parse(JSON.stringify(this.dynamicLightsIndicesByLightName)),
    dynamicLightsMatrixIndex: this.dynamicLightsMatrixIndex
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

  for (var name in this.dynamicLights){
    this.addDynamicLightToObject(obj, this.dynamicLights[name]);
  }
}

LightHandler.prototype.editStaticPointLight = function(slotID, position, color, strength){
  this.removeStaticPointLight(slotID);
  this.addStaticPointLight(position, color, strength, slotID);
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

LightHandler.prototype.addStaticPointLight = function(position, color, strength, overrideSlotID){
  if (this.staticPointLightCount == MAX_STATIC_POINT_LIGHT_COUNT){
    return;
  }

  var foundSlotID = 1;
  if (!(typeof overrideSlotID == UNDEFINED)){
    foundSlotID = overrideSlotID;
  }else{
    for (var i = 0; i < MAX_STATIC_POINT_LIGHT_COUNT; i ++){
      if (!this.staticPointLightsBySlotId[i + 1]){
        foundSlotID = i + 1;
        break;
      }
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

LightHandler.prototype.editStaticDiffuseLight = function(slotID, direction, color, strength){
  this.removeStaticDiffuseLight(slotID);
  this.addStaticDiffuseLight(direction, color, strength, slotID);
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

LightHandler.prototype.addStaticDiffuseLight = function(direction, color, strength, overrideSlotID){
  if (this.staticDiffuseLightCount == MAX_STATIC_DIFFUSE_LIGHT_COUNT){
    return;
  }

  var foundSlotID = 1;
  if (!(typeof overrideSlotID == UNDEFINED)){
    foundSlotID = overrideSlotID;
  }else{
    for (var i = 0; i < MAX_STATIC_DIFFUSE_LIGHT_COUNT; i ++){
      if (!this.staticDiffuseLightsBySlotId[i + 1]){
        foundSlotID = i + 1;
        break;
      }
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
