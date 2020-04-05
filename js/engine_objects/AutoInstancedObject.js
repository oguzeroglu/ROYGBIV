var AutoInstancedObject = function(name, objects){
  this.isAutoInstancedObject = true;
  this.name = name;
  this.objects = objects;
  this.pseudoObjectGroup = new ObjectGroup(null, objects);
}

AutoInstancedObject.prototype.setAffectedByLight = function(isAffectedByLight){

  macroHandler.removeMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);

  delete this.mesh.material.uniforms.worldInverseTranspose;
  delete this.mesh.material.uniforms.dynamicLightsMatrix;

  if (isAffectedByLight){
    macroHandler.injectMacro("AFFECTED_BY_LIGHT", this.mesh.material, true, false);
    this.mesh.material.uniforms.dynamicLightsMatrix = new THREE.Uniform(lightHandler.dynamicLightsMatrix);
    lightHandler.addLightToObject(this);
  }else{
    lightHandler.removeLightFromObject(this);
  }

  this.mesh.material.needsUpdate = true;

  this.affectedByLight = isAffectedByLight;
}

AutoInstancedObject.prototype.hideVisually = function(){
  this.mesh.visible = false;
}

AutoInstancedObject.prototype.showVisually = function(){
  this.mesh.visible = true;
}

AutoInstancedObject.prototype.useCustomShaderPrecision = function(precision){
  shaderPrecisionHandler.setCustomPrecisionForObject(this, precision);
}

AutoInstancedObject.prototype.updateObject = function(object){
  var index = this.orientationIndicesByObjectName.get(object.name);
  var alphaIndex = this.alphaIndicesByObjectName.get(object.name);
  var scaleIndex = this.scaleIndicesByObjectName.get(object.name);
  var orientationAry = this.mesh.material.uniforms.autoInstanceOrientationArray.value;
  var alphaAry = this.mesh.material.uniforms.autoInstanceAlphaArray.value;
  var scaleAry = this.mesh.material.uniforms.autoInstanceScaleArray.value;
  var position = object.mesh.position;
  var quaternion = object.mesh.quaternion;
  var alpha = object.getOpacity();
  orientationAry[index].set(orientationAry[index].x, position.x, position.y, position.z);
  orientationAry[index+1].set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  alphaAry[alphaIndex] = alpha;
  scaleAry[scaleIndex].set(object.mesh.scale.x, object.mesh.scale.y, object.mesh.scale.z);
  if (alpha != 1){
    this.mesh.material.transparent = true;
  }
  if (object.hasEmissiveMap()){
    this.mesh.material.uniforms.autoInstanceEmissiveIntensityArray.value[alphaIndex] = object.getEmissiveIntensity();
    var emissiveColor = object.getEmissiveColor();
    this.mesh.material.uniforms.autoInstanceEmissiveColorArray.value[alphaIndex].set(emissiveColor.r, emissiveColor.g, emissiveColor.b);
  }
  if (object.hasDisplacementMap()){
    this.mesh.material.uniforms.autoInstanceDisplacementInfoArray.value[alphaIndex].x = object.getDisplacementScale();
    this.mesh.material.uniforms.autoInstanceDisplacementInfoArray.value[alphaIndex].y = object.getDisplacementBias();
  }
  if (object.hasTexture()){
    this.mesh.material.uniforms.autoInstanceTextureOffsetInfoArray.value[alphaIndex].x = object.getTextureOffsetX();
    this.mesh.material.uniforms.autoInstanceTextureOffsetInfoArray.value[alphaIndex].y = object.getTextureOffsetY();
  }
  if (object.hasAOMap()){
    this.mesh.material.uniforms.autoInstanceAOIntensityArray.value[alphaIndex] = object.getAOIntensity();
  }
}

AutoInstancedObject.prototype.hideObject = function(object){
  var index = this.orientationIndicesByObjectName.get(object.name);
  var orientationAry = this.mesh.material.uniforms.autoInstanceOrientationArray.value;
  orientationAry[index].x = -10;
}

AutoInstancedObject.prototype.showObject = function(object){
  var index = this.orientationIndicesByObjectName.get(object.name);
  var orientationAry = this.mesh.material.uniforms.autoInstanceOrientationArray.value;
  orientationAry[index].x = 10;
}

AutoInstancedObject.prototype.forceColor = function(object, r, g, b, a){
  var index = this.forcedColorIndicesByObjectName.get(object.name);
  var forcedColorAry = this.mesh.material.uniforms.autoInstanceForcedColorArray.value;
  forcedColorAry[index].set(a, r, g, b);
  if (a < 0){
    a = 0;
  }
  if (a > 1){
    a = 1;
  }
  if (a != 1 && !this.mesh.material.transparent){
    this.mesh.material.transparent = true;
  }
}

AutoInstancedObject.prototype.resetColor = function(object){
  var index = this.forcedColorIndicesByObjectName.get(object.name);
  var forcedColorAry = this.mesh.material.uniforms.autoInstanceForcedColorArray.value;
  forcedColorAry[index].set(-100, -100, -100, -100);
}

AutoInstancedObject.prototype.init = function(){
  this.pseudoObjectGroup.handleTextures();
  this.pseudoObjectGroup.mergeInstanced();
  var meshGenerator = new MeshGenerator(this.pseudoObjectGroup.geometry);
  var pseudoGraphicsGroup = new THREE.Object3D();
  pseudoGraphicsGroup.position.set(0, 0, 0);
  this.mesh = meshGenerator.generateInstancedMesh(pseudoGraphicsGroup, this.pseudoObjectGroup);
  this.mesh.geometry.removeAttribute("positionOffset");
  this.mesh.geometry.removeAttribute("quaternion");
  this.mesh.geometry.removeAttribute("alpha");
  this.mesh.frustumCulled = false;
  webglCallbackHandler.registerEngineObject(this);
  if (this.pseudoObjectGroup.aoTexture){
    macroHandler.injectMacro("HAS_AO", this.mesh.material, true, true);
  }
  if (this.pseudoObjectGroup.emissiveTexture){
    macroHandler.injectMacro("HAS_EMISSIVE", this.mesh.material, true, true);
  }
  if (this.pseudoObjectGroup.diffuseTexture){
    macroHandler.injectMacro("HAS_DIFFUSE", this.mesh.material, true, true);
  }
  if (this.pseudoObjectGroup.alphaTexture){
    macroHandler.injectMacro("HAS_ALPHA", this.mesh.material, true, true);
  }
  if (this.pseudoObjectGroup.displacementTexture && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    macroHandler.injectMacro("HAS_DISPLACEMENT", this.mesh.material, true, false);
  }
  if (this.pseudoObjectGroup.hasTexture){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
  }
  macroHandler.injectMacro("IS_AUTO_INSTANCED", this.mesh.material, true, true);
  var objCount = 0;
  var curIndex = 0;
  var forcedColorIndex = 0;
  this.orientationIndicesByObjectName = new Map();
  this.alphaIndicesByObjectName = new Map();
  this.forcedColorIndicesByObjectName = new Map();
  this.scaleIndicesByObjectName = new Map();
  var orientationIndices = [];
  var alphaIndices = [];
  var scaleIndices = [];
  var scaleAry = [];
  var orientationAry = [];
  var alphaAry = [];
  var forcedColorAry = [];
  var forcedColorIndices = [];
  var emissiveIntensityAry = [];
  var emissiveColorAry = [];
  var displacementInfoAry = [];
  var aoIntensityAry = [];
  var textureOffsetInfoAry = [];
  var affectedByLightAry = [];
  var hasColorizableMember = false;
  for (var objName in this.objects){
    var obj = this.objects[objName];
    if (obj.affectedByLight){
      this.affectedByLight = true;
    }
    this.orientationIndicesByObjectName.set(objName, curIndex);
    this.alphaIndicesByObjectName.set(objName, objCount);
    this.scaleIndicesByObjectName.set(objName, objCount);
    orientationIndices.push(curIndex);
    alphaIndices.push(objCount);
    scaleIndices.push(objCount);
    affectedByLightAry.push(obj.affectedByLight? 10: -10);
    curIndex += 2;
    objCount ++;
    orientationAry.push(new THREE.Vector4(10, obj.mesh.position.x, obj.mesh.position.y, obj.mesh.position.z));
    orientationAry.push(new THREE.Vector4(obj.mesh.quaternion.x, obj.mesh.quaternion.y, obj.mesh.quaternion.z, obj.mesh.quaternion.w));
    alphaAry.push(obj.getOpacity());
    scaleAry.push(obj.mesh.scale.clone());
    obj.autoInstancedParent = this;
    if (obj.isColorizable){
      hasColorizableMember = true;
    }
    forcedColorAry.push(new THREE.Vector4(-100, -100, -100, -100));
    forcedColorIndices.push(forcedColorIndex);
    this.forcedColorIndicesByObjectName.set(objName, forcedColorIndex);
    forcedColorIndex ++;
    if (obj.hasEmissiveMap()){
      emissiveIntensityAry.push(obj.getEmissiveIntensity());
      emissiveColorAry.push(new THREE.Vector3(obj.getEmissiveColor().r, obj.getEmissiveColor().g, obj.getEmissiveColor().b));
    }else{
      emissiveIntensityAry.push(0);
      emissiveColorAry.push(new THREE.Vector3(WHITE_COLOR.r, WHITE_COLOR.g, WHITE_COLOR.b));
    }
    if (obj.hasDisplacementMap()){
      displacementInfoAry.push(new THREE.Vector2(obj.getDisplacementScale(), obj.getDisplacementBias()));
    }else{
      displacementInfoAry.push(new THREE.Vector2(0, 0));
    }
    if (obj.hasTexture()){
      textureOffsetInfoAry.push(new THREE.Vector2(obj.getTextureOffsetX(), obj.getTextureOffsetY()));
    }else{
      textureOffsetInfoAry.push(new THREE.Vector2(0, 0));
    }
    if (obj.hasAOMap()){
      aoIntensityAry.push(obj.getAOIntensity());
    }else{
      aoIntensityAry.push(0);
    }
  }
  var orientationIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(orientationIndices), 1);
  var alphaIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(alphaIndices), 1);
  var scaleIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(scaleIndices), 1);
  var affectedByLightBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(affectedByLightAry), 1);
  orientationIndicesBufferAttribute.setDynamic(false);
  alphaIndicesBufferAttribute.setDynamic(false);
  scaleIndicesBufferAttribute.setDynamic(false);
  affectedByLightBufferAttribute.setDynamic(false);
  this.mesh.geometry.addAttribute("orientationIndex", orientationIndicesBufferAttribute);
  this.mesh.geometry.addAttribute("alphaIndex", alphaIndicesBufferAttribute);
  this.mesh.geometry.addAttribute("scaleIndex", scaleIndicesBufferAttribute);
  this.mesh.geometry.addAttribute("affectedByLight", affectedByLightBufferAttribute);
  macroHandler.injectMacro("AUTO_INSTANCE_ORIENTATION_ARRAY_SIZE "+(objCount * 2), this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_ALPHA_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_SCALE_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_EMISSIVE_INTENSITY_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_EMISSIVE_COLOR_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_DISPLACEMENT_INFO_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_TEXTURE_OFFSET_INFO_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  macroHandler.injectMacro("AUTO_INSTANCE_AO_INTENSITY_ARRAY_SIZE "+objCount, this.mesh.material, true, false);
  if (this.affectedByLight){
    this.setAffectedByLight(true);
  }
  this.mesh.material.uniforms.autoInstanceOrientationArray = new THREE.Uniform(orientationAry);
  this.mesh.material.uniforms.autoInstanceAlphaArray = new THREE.Uniform(alphaAry);
  this.mesh.material.uniforms.autoInstanceScaleArray = new THREE.Uniform(scaleAry);
  this.mesh.material.uniforms.autoInstanceEmissiveIntensityArray = new THREE.Uniform(emissiveIntensityAry);
  this.mesh.material.uniforms.autoInstanceEmissiveColorArray = new THREE.Uniform(emissiveColorAry);
  this.mesh.material.uniforms.autoInstanceDisplacementInfoArray = new THREE.Uniform(displacementInfoAry);
  this.mesh.material.uniforms.autoInstanceTextureOffsetInfoArray = new THREE.Uniform(textureOffsetInfoAry);
  this.mesh.material.uniforms.autoInstanceAOIntensityArray = new THREE.Uniform(aoIntensityAry);
  if (hasColorizableMember){
    macroHandler.injectMacro("AUTO_INSTANCE_FORCED_COLOR_ARRAY_SIZE "+(objCount), this.mesh.material, true, false);
    macroHandler.injectMacro("AUTO_INSTANCE_HAS_COLORIZABLE_MEMBER", this.mesh.material, true, true);
    var forcedColorIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(forcedColorIndices), 1);
    forcedColorIndicesBufferAttribute.setDynamic(false);
    this.mesh.geometry.addAttribute("forcedColorIndex", forcedColorIndicesBufferAttribute);
    this.mesh.material.uniforms.autoInstanceForcedColorArray = new THREE.Uniform(forcedColorAry);
  }
  for (var objName in this.objects){
    var obj = this.objects[objName];
    if (obj.hasCustomPrecision){
      this.useCustomShaderPrecision(obj.customPrecision);
    }else{
      this.useCustomShaderPrecision(shaderPrecisionHandler.precisions[shaderPrecisionHandler.types.BASIC_MATERIAL]);
    }
    break;
  }
}

AutoInstancedObject.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
      this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

AutoInstancedObject.prototype.removeFog = function(){
  macroHandler.removeMacro("HAS_FOG", this.mesh.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.worldMatrix;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}

AutoInstancedObject.prototype.getRegisteredSceneName = function(){
  for (var objName in this.objects){
    return this.objects[objName].registeredSceneName;
  }
}
