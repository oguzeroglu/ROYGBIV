var AutoInstancedObject = function(name, objects){
  this.isAutoInstancedObject = true;
  this.name = name;
  this.objects = objects;
  this.pseudoObjectGroup = new ObjectGroup(null, objects);
}

AutoInstancedObject.prototype.updateObject = function(object){
  var index = this.orientationIndicesByObjectName.get(object.name);
  var orientationAry = this.mesh.material.uniforms.autoInstanceOrientationArray.value;
  var position = object.mesh.position;
  var quaternion = object.mesh.quaternion;
  orientationAry[index].set(orientationAry[index].x, position.x, position.y, position.z);
  orientationAry[index+1].set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
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
  this.forcedColorIndicesByObjectName = new Map();
  var orientationIndices = [];
  var orientationAry = [];
  var forcedColorAry = [];
  var forcedColorIndices = [];
  var hasColorizableMember = false;
  for (var objName in this.objects){
    var obj = this.objects[objName];
    this.orientationIndicesByObjectName.set(objName, curIndex);
    orientationIndices.push(curIndex);
    curIndex += 2;
    objCount ++;
    orientationAry.push(new THREE.Vector4(10, obj.mesh.position.x, obj.mesh.position.y, obj.mesh.position.z));
    orientationAry.push(new THREE.Vector4(obj.mesh.quaternion.x, obj.mesh.quaternion.y, obj.mesh.quaternion.z, obj.mesh.quaternion.w));
    obj.autoInstancedParent = this;
    if (obj.isColorizable){
      hasColorizableMember = true;
    }
    forcedColorAry.push(new THREE.Vector4(-100, -100, -100, -100));
    forcedColorIndices.push(forcedColorIndex);
    this.forcedColorIndicesByObjectName.set(objName, forcedColorIndex);
    forcedColorIndex ++;
  }
  var orientationIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(orientationIndices), 1);
  orientationIndicesBufferAttribute.setDynamic(false);
  this.mesh.geometry.addAttribute("orientationIndex", orientationIndicesBufferAttribute);
  macroHandler.injectMacro("AUTO_INSTANCE_ORIENTATION_ARRAY_SIZE "+(objCount * 2), this.mesh.material, true, false);
  this.mesh.material.uniforms.autoInstanceOrientationArray = new THREE.Uniform(orientationAry);
  if (hasColorizableMember){
    macroHandler.injectMacro("AUTO_INSTANCE_FORCED_COLOR_ARRAY_SIZE "+(objCount), this.mesh.material, true, false);
    macroHandler.injectMacro("AUTO_INSTANCE_HAS_COLORIZABLE_MEMBER", this.mesh.material, true, true);
    var forcedColorIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(forcedColorIndices), 1);
    forcedColorIndicesBufferAttribute.setDynamic(false);
    this.mesh.geometry.addAttribute("forcedColorIndex", forcedColorIndicesBufferAttribute);
    this.mesh.material.uniforms.autoInstanceForcedColorArray = new THREE.Uniform(forcedColorAry);
  }
  this.mesh.material.needsUpdate = true;
}

AutoInstancedObject.prototype.setFog = function(){
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.mesh.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogBlendWithSkybox){
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
