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
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    vertexShaderCode = vertexShaderCode.replace(
      "vec3 objNormal = normalize(normal);", ""
    ).replace(
      "transformedPosition += objNormal * (texture2D(displacementMap, vFaceVertexUV).r * displacementInfo.x + displacementInfo.y);", ""
    );
  }
  var material = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderCode,
    fragmentShader: ShaderContent.objectTrailFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      viewMatrix: GLOBAL_VIEW_UNIFORM,
      worldMatrix: new THREE.Uniform(new THREE.Matrix4()),
      cameraPosition: GLOBAL_CAMERA_POSITION_UNIFORM,
      objectCoordinates: new THREE.Uniform(objectCoordinates),
      objectQuaternions: new THREE.Uniform(objectQuaternions),
      currentPosition: new THREE.Uniform(posit),
      currentQuaternion: new THREE.Uniform(quat),
      alpha: new THREE.Uniform(trail.alpha),
      diffuseMap: this.getTextureUniform(trail.diffuseTexture),
      emissiveMap: this.getTextureUniform(trail.emissiveTexture),
      alphaMap: this.getTextureUniform(trail.alphaTexture),
      displacementMap: this.getTextureUniform(trail.displacementTexture),
      textureMatrix: new THREE.Uniform(trail.textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM,
      cubeTexture: GLOBAL_CUBE_TEXTURE_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  material.uniforms.worldMatrix.value = mesh.matrixWorld;
  return mesh;
}

MeshGenerator.prototype.generateInstancedMesh = function(graphicsGroup, objectGroup){
  var diffuseTexture = objectGroup.diffuseTexture;
  var emissiveTexture = objectGroup.emissiveTexture;
  var alphaTexture = objectGroup.alphaTexture;
  var aoTexture = objectGroup.aoTexture;
  var displacementTexture = objectGroup.displacementTexture;
  var textureMatrix = objectGroup.textureMatrix;
  if (!diffuseTexture){
    diffuseTexture = nullTexture;
  }
  if (!emissiveTexture){
    emissiveTexture = nullTexture;
  }
  if (!alphaTexture){
    alphaTexture = nullTexture;
  }
  if (!aoTexture){
    aoTexture = nullTexture;
  }
  if (!displacementTexture){
    displacementTexture = nullTexture;
  }
  if (!textureMatrix){
    textureMatrix = new THREE.Matrix3();
  }
  var vertexShader = ShaderContent.instancedBasicMaterialVertexShader;
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    vertexShader = vertexShader.replace(
      "vec3 objNormal = normalize(normal);", ""
    ).replace(
      "transformedPosition += objNormal * (texture2D(displacementMap, vUV).r * displacementInfo.x + displacementInfo.y);", ""
    );
  }
  var material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: ShaderContent.instancedBasicMaterialFragmentShader,
    transparent: objectGroup.isTransparent,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      worldMatrix: new THREE.Uniform(new THREE.Matrix4()),
      cameraPosition: GLOBAL_CAMERA_POSITION_UNIFORM,
      totalAlpha: new THREE.Uniform(1),
      totalAOIntensity: new THREE.Uniform(1),
      totalEmissiveIntensity: new THREE.Uniform(1),
      totalEmissiveColor: new THREE.Uniform(new THREE.Color("white")),
      diffuseMap: this.getTextureUniform(diffuseTexture),
      emissiveMap: this.getTextureUniform(emissiveTexture),
      alphaMap: this.getTextureUniform(alphaTexture),
      aoMap: this.getTextureUniform(aoTexture),
      displacementMap: this.getTextureUniform(displacementTexture),
      textureMatrix: new THREE.Uniform(textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM,
      forcedColor: new THREE.Uniform(new THREE.Vector4(-50, 0, 0, 0)),
      cubeTexture: GLOBAL_CUBE_TEXTURE_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = 10;
  mesh.position.copy(graphicsGroup.position);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  material.uniforms.worldMatrix.value = mesh.matrixWorld;
  return mesh;
}

MeshGenerator.prototype.generateMergedMesh = function(graphicsGroup, objectGroup){
  var diffuseTexture = objectGroup.diffuseTexture;
  var emissiveTexture = objectGroup.emissiveTexture;
  var alphaTexture = objectGroup.alphaTexture;
  var aoTexture = objectGroup.aoTexture;
  var displacementTexture = objectGroup.displacementTexture;
  var textureMatrix = objectGroup.textureMatrix;
  if (!diffuseTexture){
    diffuseTexture = nullTexture;
  }
  if (!emissiveTexture){
    emissiveTexture = nullTexture;
  }
  if (!alphaTexture){
    alphaTexture = nullTexture;
  }
  if (!aoTexture){
    aoTexture = nullTexture;
  }
  if (!displacementTexture){
    displacementTexture = nullTexture;
  }
  if (!textureMatrix){
    textureMatrix = new THREE.Matrix3();
  }

  var vertexShader = ShaderContent.mergedBasicMaterialVertexShader;
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    vertexShader = vertexShader.replace(
      "vec3 objNormal = normalize(normal);", ""
    ).replace(
      "transformedPosition += objNormal * (texture2D(displacementMap, vUV).r * displacementInfo.x + displacementInfo.y);", ""
    );
  }

  var material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: ShaderContent.mergedBasicMaterialFragmentShader,
    transparent: objectGroup.isTransparent,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      worldMatrix: new THREE.Uniform(new THREE.Matrix4()),
      cameraPosition: GLOBAL_CAMERA_POSITION_UNIFORM,
      totalAlpha: new THREE.Uniform(1),
      totalAOIntensity: new THREE.Uniform(1),
      totalEmissiveIntensity: new THREE.Uniform(1),
      totalEmissiveColor: new THREE.Uniform(new THREE.Color("white")),
      diffuseMap: this.getTextureUniform(diffuseTexture),
      emissiveMap: this.getTextureUniform(emissiveTexture),
      alphaMap: this.getTextureUniform(alphaTexture),
      aoMap: this.getTextureUniform(aoTexture),
      displacementMap: this.getTextureUniform(displacementTexture),
      textureMatrix: new THREE.Uniform(textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM,
      forcedColor: new THREE.Uniform(new THREE.Vector4(-50, 0, 0, 0)),
      cubeTexture: GLOBAL_CUBE_TEXTURE_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.renderOrder = 10;
  mesh.position.copy(graphicsGroup.position);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  material.uniforms.worldMatrix.value = mesh.matrixWorld;
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
      color: new THREE.Uniform(new THREE.Color(skybox.color)),
      alpha: GLOBAL_SKYBOX_ALPHA_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}
