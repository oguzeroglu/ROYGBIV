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
  mesh.renderOrder = renderOrders.OBJECT_TRAIL;
  if (fogBlendWithSkybox){
    material.uniforms.worldMatrix = new THREE.Uniform(mesh.matrixWorld);
    material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    macroHandler.injectMacro("HAS_SKYBOX_FOG", material, true, true);
  }
  if (fogActive){
    material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    macroHandler.injectMacro("HAS_FOG", material, false, true);
  }
  if (trail.diffuseTexture){
    material.uniforms.diffuseMap = this.getTextureUniform(trail.diffuseTexture);
    macroHandler.injectMacro("HAS_DIFFUSE", material, false, true);
  }
  if (trail.emissiveTexture){
    material.uniforms.emissiveMap = this.getTextureUniform(trail.emissiveTexture);
    macroHandler.injectMacro("HAS_EMISSIVE", material, true, true);
  }
  if (trail.displacementTexture && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    material.uniforms.displacementMap = this.getTextureUniform(trail.displacementTexture);
    macroHandler.injectMacro("HAS_DISPLACEMENT", material, true, false);
  }
  if (trail.alphaTexture){
    material.uniforms.alphaMap = this.getTextureUniform(trail.alphaTexture);
    macroHandler.injectMacro("HAS_ALPHA", material, false, true);
  }
  if (trail.hasTexture){
    macroHandler.injectMacro("HAS_TEXTURE", material, true, true);
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
  mesh.renderOrder = renderOrders.OBJECT;
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
  mesh.renderOrder = renderOrders.OBJECT;
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
  mesh.renderOrder = renderOrders.OBJECT;
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}

MeshGenerator.prototype.generateSkybox = function(skybox, isMock){
  var cubeTextureUniform;
  if (!isMock){
    GLOBAL_CUBE_TEXTURE_UNIFORM.value = skybox.cubeTexture;
    cubeTextureUniform = GLOBAL_CUBE_TEXTURE_UNIFORM;
  }else{
    cubeTextureUniform = new THREE.Uniform(skybox.cubeTexture);
  }
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.skyboxVertexShader,
    fragmentShader: ShaderContent.skyboxFragmentShader,
    transparent: true,
    side: THREE.BackSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      cubeTexture: cubeTextureUniform,
      color: new THREE.Uniform(new THREE.Color(skybox.color))
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = renderOrders.SKYBOX;
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  mesh.onBeforeRender = function(){
    webglCallbackHandler.onBeforeRender(skybox);
  }
  return mesh;
}

MeshGenerator.prototype.generateParticleSystemMesh = function(ps, texture, noTargetColor){
  if (!ps.copyPS){
    ps.material = new THREE.RawShaderMaterial({
      vertexShader: ShaderContent.particleVertexShader,
      fragmentShader: ShaderContent.particleFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms:{
        modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
        projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
        worldMatrix: new THREE.Uniform(new THREE.Matrix4()),
        viewMatrix: GLOBAL_VIEW_UNIFORM,
        time: new THREE.Uniform(0.0),
        dissapearCoef: new THREE.Uniform(0.0),
        stopInfo: new THREE.Uniform(new THREE.Vector3(-10, -10, -10)),
        parentMotionMatrix: new THREE.Uniform(new THREE.Matrix3().fromArray([ps.x, ps.y, ps.z, ps.vx, ps.vy, ps.vz, ps.ax, ps.ay, ps.az]))
      }
    });
  }else{
    ps.material = ps.copyPS.material.clone();
    ps.material.uniforms.projectionMatrix = GLOBAL_PROJECTION_UNIFORM;
    ps.material.uniforms.viewMatrix = GLOBAL_VIEW_UNIFORM;
  }
  if (fogBlendWithSkybox && mode != 0){
    ps.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    ps.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    macroHandler.injectMacro("HAS_SKYBOX_FOG", ps.material, true, true);
  }
  if (fogActive && mode != 0){
    ps.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    macroHandler.injectMacro("HAS_FOG", ps.material, false, true);
  }
  if (texture){
    ps.material.uniforms.texture = new THREE.Uniform(texture);
    macroHandler.injectMacro("HAS_TEXTURE", ps.material, true, true);
  }
  if (!noTargetColor){
    macroHandler.injectMacro("HAS_TARGET_COLOR", ps.material, true, false);
  }
  if (particleSystemRefHeight){
    macroHandler.injectMacro("HAS_REF_HEIGHT", ps.material, true, false);
    ps.material.uniforms.refHeightCoef = GLOBAL_PS_REF_HEIGHT_UNIFORM;
  }
  var mesh = new THREE.Points(ps.geometry, ps.material);
  mesh.renderOrder = renderOrders.PARTICLE_SYSTEM;
  mesh.position.set(ps.x, ps.y, ps.z);
  mesh.frustumCulled = false;
  mesh.visible = false;
  return mesh;
}
