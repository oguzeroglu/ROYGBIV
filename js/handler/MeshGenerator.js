var MeshGenerator = function(geometry, material){
  this.geometry = geometry;
  this.material = material;
}

MeshGenerator.prototype.getTextureUniform = function(texture){
  if (textureUniformCache[texture.uuid]){
    return textureUniformCache[texture.uuid];
  }
  var uniform = new THREE.Uniform(texture);
  textureUniformCache[texture.uuid] = uniform;
  return uniform;
}

MeshGenerator.prototype.generateMesh = function(){
  if (this.material instanceof BasicMaterial){
    return this.generateBasicMesh();
  }
}

MeshGenerator.prototype.generateObjectTrail = function(
  trail, objectCoordinateSize, objectQuaternionSize, posit, quat, objectCoordinates, objectQuaternions){
  var vertexShaderCode = ShaderContent.objectTrailVertexShader.replace(
    "#define OBJECT_COORDINATE_SIZE 1", "#define OBJECT_COORDINATE_SIZE "+objectCoordinateSize
  ).replace(
    "#define OBJECT_QUATERNION_SIZE 1", "#define OBJECT_QUATERNION_SIZE "+objectQuaternionSize
  );
  var material = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderCode,
    fragmentShader: ShaderContent.objectTrailFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      viewMatrix: GLOBAL_VIEW_UNIFORM,
      objectCoordinates: new THREE.Uniform(objectCoordinates),
      objectQuaternions: new THREE.Uniform(objectQuaternions),
      currentPosition: new THREE.Uniform(posit),
      currentQuaternion: new THREE.Uniform(quat),
      alpha: new THREE.Uniform(trail.alpha)
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = 100;
  if (fogBlendWithSkybox){
    material.uniforms.worldMatrix = new THREE.Uniform(mesh.matrixWorld);
    material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    trail.injectMacro(material, "HAS_SKYBOX_FOG", true, true);
  }
  if (fogActive){
    material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    trail.injectMacro(material, "HAS_FOG", false, true);
  }
  if (trail.diffuseTexture){
    material.uniforms.diffuseMap = this.getTextureUniform(trail.diffuseTexture);
    trail.injectMacro(material, "HAS_DIFFUSE", false, true);
  }
  if (trail.emissiveTexture){
    material.uniforms.emissiveMap = this.getTextureUniform(trail.emissiveTexture);
    trail.injectMacro(material, "HAS_EMISSIVE", true, true);
  }
  if (trail.displacementTexture && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    material.uniforms.displacementMap = this.getTextureUniform(trail.displacementTexture);
    trail.injectMacro(material, "HAS_DISPLACEMENT", true, false);
  }
  if (trail.alphaTexture){
    material.uniforms.alphaMap = this.getTextureUniform(trail.alphaTexture);
    trail.injectMacro(material, "HAS_ALPHA", false, true);
  }
  if (trail.hasTexture){
    trail.injectMacro(material, "HAS_TEXTURE", true, true);
  }
  return mesh;
}

MeshGenerator.prototype.generateInstancedMesh = function(graphicsGroup, objectGroup){
  var diffuseTexture = objectGroup.diffuseTexture;
  var emissiveTexture = objectGroup.emissiveTexture;
  var alphaTexture = objectGroup.alphaTexture;
  var aoTexture = objectGroup.aoTexture;
  var displacementTexture = objectGroup.displacementTexture;
  var vertexShader = ShaderContent.instancedBasicMaterialVertexShader;
  var uniforms = {
    projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
    modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
    totalAlpha: new THREE.Uniform(1)
  };
  if (aoTexture){
    uniforms.aoMap = this.getTextureUniform(aoTexture);
    uniforms.totalAOIntensity = new THREE.Uniform(1);
  }
  if (emissiveTexture){
    uniforms.emissiveMap = this.getTextureUniform(emissiveTexture);
    uniforms.totalEmissiveColor = new THREE.Uniform(new THREE.Color("white"));
    uniforms.totalEmissiveIntensity = new THREE.Uniform(1);
  }
  if (diffuseTexture){
    uniforms.diffuseMap = this.getTextureUniform(diffuseTexture);
  }
  if (alphaTexture){
    uniforms.alphaMap = this.getTextureUniform(alphaTexture);
  }
  if (displacementTexture && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    uniforms.displacementMap = this.getTextureUniform(displacementTexture);
  }
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.instancedBasicMaterialVertexShader,
    fragmentShader: ShaderContent.instancedBasicMaterialFragmentShader,
    transparent: objectGroup.isTransparent,
    side: THREE.DoubleSide,
    uniforms: uniforms
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = 10;
  mesh.position.copy(graphicsGroup.position);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}

MeshGenerator.prototype.generateMergedMesh = function(graphicsGroup, objectGroup){
  var diffuseTexture = objectGroup.diffuseTexture;
  var emissiveTexture = objectGroup.emissiveTexture;
  var alphaTexture = objectGroup.alphaTexture;
  var aoTexture = objectGroup.aoTexture;
  var displacementTexture = objectGroup.displacementTexture;

  var uniforms = {
    projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
    modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
    totalAlpha: new THREE.Uniform(1)
  }
  if (aoTexture){
    uniforms.aoMap = this.getTextureUniform(aoTexture);
    uniforms.totalAOIntensity = new THREE.Uniform(1);
  }
  if (emissiveTexture){
    uniforms.emissiveMap = this.getTextureUniform(emissiveTexture);
    uniforms.totalEmissiveIntensity = new THREE.Uniform(1);
    uniforms.totalEmissiveColor = new THREE.Uniform(new THREE.Color("white"));
  }
  if (diffuseTexture){
    uniforms.diffuseMap = this.getTextureUniform(diffuseTexture);
  }
  if (alphaTexture){
    uniforms.alphaMap = this.getTextureUniform(alphaTexture);
  }
  if (displacementTexture){
    uniforms.displacementMap = this.getTextureUniform(displacementTexture);
  }

  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.mergedBasicMaterialVertexShader,
    fragmentShader: ShaderContent.mergedBasicMaterialFragmentShader,
    transparent: objectGroup.isTransparent,
    side: THREE.DoubleSide,
    uniforms: uniforms
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = 10;
  mesh.position.copy(graphicsGroup.position);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}

MeshGenerator.prototype.generateBasicMesh = function(){
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.basicMaterialVertexShader,
    fragmentShader: ShaderContent.basicMaterialFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms:{
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      color: new THREE.Uniform(this.material.color),
      alpha: new THREE.Uniform(this.material.alpha)
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = 10;
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}

MeshGenerator.prototype.generateSkybox = function(skybox){
  GLOBAL_CUBE_TEXTURE_UNIFORM.value = skybox.cubeTexture;
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.skyboxVertexShader,
    fragmentShader: ShaderContent.skyboxFragmentShader,
    transparent: true,
    side: THREE.BackSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      cubeTexture: GLOBAL_CUBE_TEXTURE_UNIFORM,
      color: new THREE.Uniform(new THREE.Color(skybox.color))
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}
