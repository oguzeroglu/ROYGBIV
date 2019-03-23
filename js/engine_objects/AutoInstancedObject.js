var AutoInstancedObject = function(name, objects){
  this.isAutoInstancedObject = true;
  this.name = name;
  this.objects = objects;
  this.pseudoObjectGroup = new ObjectGroup(null, objects);
}

AutoInstancedObject.prototype.updateObjectOrientation = function(object, position, quaternion){
  var index = this.orientationIndicesByObjectName.get(object.name);
  var orientationAry = this.mesh.material.uniforms.autoInstanceOrientationArray.value;
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
    this.injectMacro("HAS_AO", true, true);
  }
  if (this.pseudoObjectGroup.emissiveTexture){
    this.injectMacro("HAS_EMISSIVE", true, true);
  }
  if (this.pseudoObjectGroup.diffuseTexture){
    this.injectMacro("HAS_DIFFUSE", true, true);
  }
  if (this.pseudoObjectGroup.alphaTexture){
    this.injectMacro("HAS_ALPHA", true, true);
  }
  if (this.pseudoObjectGroup.displacementTexture && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    this.injectMacro("HAS_DISPLACEMENT", true, false);
  }
  if (this.pseudoObjectGroup.hasTexture){
    this.injectMacro("HAS_TEXTURE", true, true);
  }
  this.injectMacro("IS_AUTO_INSTANCED", true, true);
  var objCount = 0;
  var curIndex = 0;
  this.orientationIndicesByObjectName = new Map();
  var orientationIndices = [];
  var orientationAry = [];
  for (var objName in this.objects){
    var obj = this.objects[objName];
    this.orientationIndicesByObjectName.set(objName, curIndex);
    orientationIndices.push(curIndex);
    curIndex += 2;
    objCount ++;
    orientationAry.push(new THREE.Vector4(10, obj.mesh.position.x, obj.mesh.position.y, obj.mesh.position.z));
    orientationAry.push(new THREE.Vector4(obj.mesh.quaternion.x, obj.mesh.quaternion.y, obj.mesh.quaternion.z, obj.mesh.quaternion.w));
    obj.autoInstancedParent = this;
  }
  var orientationIndicesBufferAttribute = new THREE.InstancedBufferAttribute(new Float32Array(orientationIndices), 1);
  orientationIndicesBufferAttribute.setDynamic(false);
  this.mesh.geometry.addAttribute("orientationIndex", orientationIndicesBufferAttribute);
  this.injectMacro("AUTO_INSTANCE_ORIENTATION_ARRAY_SIZE "+(objCount * 2), true, false);
  this.mesh.material.uniforms.autoInstanceOrientationArray = new THREE.Uniform(orientationAry);
}

AutoInstancedObject.prototype.injectMacro = function(macro, insertVertexShader, insertFragmentShader){
  if (insertVertexShader){
    this.mesh.material.vertexShader = this.mesh.material.vertexShader.replace(
      "#define INSERTION", "#define INSERTION\n#define "+macro
    )
  };
  if (insertFragmentShader){
    this.mesh.material.fragmentShader = this.mesh.material.fragmentShader.replace(
      "#define INSERTION", "#define INSERTION\n#define "+macro
    )
  };
  this.mesh.material.needsUpdate = true;
}
