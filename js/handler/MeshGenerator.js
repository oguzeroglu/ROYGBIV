var MeshGenerator = function(geometry, material){
  this.geometry = geometry;
  this.material = material;
}

MeshGenerator.prototype.generateMesh = function(){
  if (this.material instanceof BasicMaterial){
    return this.generateBasicMesh();
  }
}

MeshGenerator.prototype.generateCrosshair = function(chObject, ranges){
  var colorR = chObject.configurations.colorR;
  var colorB = chObject.configurations.colorB;
  var colorG = chObject.configurations.colorG;
  var alpha = chObject.configurations.alpha;
  var size = chObject.configurations.size;

  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.crossHairVertexShader,
    fragmentShader: ShaderContent.crossHairFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      texture: textureAtlasHandler.getTextureUniform(),
      color: new THREE.Uniform(new THREE.Vector4(colorR, colorG, colorB, alpha)),
      uvTransform: new THREE.Uniform(new THREE.Matrix3()),
      expandInfo: new THREE.Uniform(new THREE.Vector4(0, 0, 0, 0)),
      uvRanges: new THREE.Uniform(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV)),
      shrinkStartSize: new THREE.Uniform(size),
      screenResolution: GLOBAL_SCREEN_RESOLUTION_UNIFORM
    }
  });

  var mesh = new THREE.Points(chObject.geometry, material);

  if (!(typeof chObject.maxWidthPercent == UNDEFINED) || !(typeof chObject.maxHeightPercent == UNDEFINED)){
    mesh.material.uniforms.sizeScale = new THREE.Uniform(1);
    macroHandler.injectMacro("HAS_SIZE_SCALE", material, true, false);
  }

  macroHandler.injectMacro("TEXTURE_SIZE " + ACCEPTED_TEXTURE_SIZE, material, false, true);

  scene.add(mesh);
  mesh.renderOrder = renderOrders.CROSSHAIR;
  mesh.position.set(0, 0, 0);
  mesh.frustumCulled = false;
  mesh.visible = false;

  return mesh;
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
  if (fogHandler.isFogBlendingWithSkybox()){
    material.uniforms.worldMatrix = new THREE.Uniform(mesh.matrixWorld);
    material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    macroHandler.injectMacro("HAS_SKYBOX_FOG", material, true, true);
  }
  if (fogHandler.isFogActive()){
    material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    macroHandler.injectMacro("HAS_FOG", material, false, true);
  }
  if (trail.object.hasDiffuseMap()){
    macroHandler.injectMacro("HAS_DIFFUSE", material, true, true);
  }
  if (trail.object.hasEmissiveMap()){
    macroHandler.injectMacro("HAS_EMISSIVE", material, true, true);
  }
  if (trail.object.hasDisplacementMap() && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    macroHandler.injectMacro("HAS_DISPLACEMENT", material, true, false);
  }
  if (trail.object.hasAlphaMap()){
    macroHandler.injectMacro("HAS_ALPHA", material, true, true);
  }
  if (trail.hasTexture()){
    material.uniforms.texture = textureAtlasHandler.getTextureUniform();
    macroHandler.injectMacro("HAS_TEXTURE", material, true, true);
  }
  return mesh;
}

MeshGenerator.prototype.generateInstancedMesh = function(graphicsGroup, objectGroup){
  var vertexShader = ShaderContent.instancedBasicMaterialVertexShader;
  var uniforms = {
    projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
    modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
    totalAlpha: new THREE.Uniform(1)
  };
  if (objectGroup.hasTexture){
    uniforms.totalTextureOffset = new THREE.Uniform(new THREE.Vector2(0, 0));
    uniforms.texture = textureAtlasHandler.getTextureUniform();
  }
  if (objectGroup.hasAOMap()){
    uniforms.totalAOIntensity = new THREE.Uniform(1);
  }
  if (objectGroup.hasEmissiveMap()){
    uniforms.totalEmissiveColor = new THREE.Uniform(new THREE.Color("white"));
    uniforms.totalEmissiveIntensity = new THREE.Uniform(1);
  }
  if (objectGroup.hasDisplacementMap() && VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    uniforms.totalDisplacementInfo = new THREE.Uniform(new THREE.Vector2(1, 1));
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
  var hasTexture = objectGroup.hasTexture;

  var uniforms = {
    projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
    modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
    totalAlpha: new THREE.Uniform(1)
  }
  if (hasTexture){
    uniforms.totalTextureOffset = new THREE.Uniform(new THREE.Vector2(0, 0));
    uniforms.texture = textureAtlasHandler.getTextureUniform();
  }
  if (objectGroup.hasAOMap()){
    uniforms.totalAOIntensity = new THREE.Uniform(1);
  }
  if (objectGroup.hasEmissiveMap()){
    uniforms.totalEmissiveIntensity = new THREE.Uniform(1);
    uniforms.totalEmissiveColor = new THREE.Uniform(new THREE.Color("white"));
  }
  if (objectGroup.hasDisplacementMap()){
    uniforms.totalDisplacementInfo = new THREE.Uniform(new THREE.Vector2(1, 1));
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
    uniforms: {
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
        parentMotionMatrix: new THREE.Uniform(new THREE.Matrix3().fromArray([ps.x, ps.y, ps.z, ps.vx, ps.vy, ps.vz, ps.ax, ps.ay, ps.az])),
        screenResolution: GLOBAL_SCREEN_RESOLUTION_UNIFORM
      }
    });
  }else{
    ps.material = ps.copyPS.material.clone();
    ps.material.uniforms.projectionMatrix = GLOBAL_PROJECTION_UNIFORM;
    ps.material.uniforms.viewMatrix = GLOBAL_VIEW_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox() && mode != 0){
    ps.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    ps.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    macroHandler.injectMacro("HAS_SKYBOX_FOG", ps.material, true, true);
  }
  if (fogHandler.isFogActive() && mode != 0){
    ps.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    macroHandler.injectMacro("HAS_FOG", ps.material, false, true);
  }
  if (texture){
    ps.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
    macroHandler.injectMacro("HAS_TEXTURE", ps.material, true, true);
    macroHandler.injectMacro("TEXTURE_SIZE " + ACCEPTED_TEXTURE_SIZE, ps.material, true, false);
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

MeshGenerator.prototype.generateMergedParticleSystemMesh = function(params){

  var vertexShader = ShaderContent.particleVertexShader.replace(
    "#define OBJECT_SIZE 1", "#define OBJECT_SIZE "+params.size
  );

  var material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: ShaderContent.particleFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms:{
      modelViewMatrixArray: new THREE.Uniform(params.mvMatrixArray),
      worldMatrixArray: new THREE.Uniform(params.worldMatrixArray),
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      viewMatrix: GLOBAL_VIEW_UNIFORM,
      timeArray: new THREE.Uniform(params.timeArray),
      hiddenArray: new THREE.Uniform(params.hiddenArray),
      dissapearCoefArray: new THREE.Uniform(params.dissapearCoefArray),
      stopInfoArray: new THREE.Uniform(params.stopInfoArray),
      parentMotionMatrixArray: new THREE.Uniform(params.motionMatrixArray),
      screenResolution: GLOBAL_SCREEN_RESOLUTION_UNIFORM
    }
  });

  macroHandler.injectMacro("IS_MERGED", material, true, false);
  if (fogHandler.isFogBlendingWithSkybox()){
    material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
    macroHandler.injectMacro("HAS_SKYBOX_FOG", material, true, true);
  }
  if (fogHandler.isFogActive()){
    material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
    macroHandler.injectMacro("HAS_FOG", material, false, true);
  }
  if (params.texture){
    material.uniforms.texture = textureAtlasHandler.getTextureUniform();
    macroHandler.injectMacro("HAS_TEXTURE", material, true, true);
    macroHandler.injectMacro("TEXTURE_SIZE " + ACCEPTED_TEXTURE_SIZE, material, true, false);
  }
  if (!params.noTargetColor){
    macroHandler.injectMacro("HAS_TARGET_COLOR", material, true, false);
  }
  if (particleSystemRefHeight){
    macroHandler.injectMacro("HAS_REF_HEIGHT", material, true, false);
    material.uniforms.refHeightCoef = GLOBAL_PS_REF_HEIGHT_UNIFORM;
  }

  var mesh = new THREE.Points(params.geometry, material);
  mesh.renderOrder = renderOrders.PARTICLE_SYSTEM;
  mesh.frustumCulled = false;
  scene.add(mesh);

  return mesh;
}

MeshGenerator.prototype.generateLightning = function(lightning){
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.lightningVertexShader,
    fragmentShader: ShaderContent.lightningFragmentShader,
    transparent: false,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      color: new THREE.Uniform(new THREE.Color(lightning.colorName)),
      startPoint: new THREE.Uniform(new THREE.Vector3())
    }
  });
  var mesh = new THREE.Mesh(lightning.geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = renderOrders.LIGHTNING;
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  mesh.visible = false;
  return mesh;
}

MeshGenerator.prototype.generateSprite = function(sprite){
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.spriteVertexShader,
    fragmentShader: ShaderContent.spriteFragmentShader,
    transparent: false,
    side: THREE.DoubleSide,
    uniforms: {
      currentViewport: GLOBAL_VIEWPORT_UNIFORM,
      color: new THREE.Uniform(new THREE.Color("#ffffff")),
      alpha: new THREE.Uniform(1),
      margin: new THREE.Uniform(new THREE.Vector2(0, 0)),
      scale: new THREE.Uniform(new THREE.Vector2(1, 1)),
      scaleCoef: new THREE.Uniform(1),
      rotationAngle: new THREE.Uniform(0), // [0, 360]
      screenResolution: GLOBAL_SCREEN_RESOLUTION_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(sprite.geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = renderOrders.SPRITE;
  mesh.visible = false;
  return mesh;
}
