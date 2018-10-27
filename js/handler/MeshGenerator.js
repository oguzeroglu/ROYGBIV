var MeshGenerator = function(geometry, material){
  this.geometry = geometry;
  this.material = material;
}

MeshGenerator.prototype.getAOIntensityUniform = function(intensity){
  if (aoIntensityUniformCache[intensity]){
    return aoIntensityUniformCache[intensity];
  }
  var uniform = new THREE.Uniform(intensity);
  aoIntensityUniformCache[intensity] = uniform;
  return uniform;
}

MeshGenerator.prototype.getAlphaUniform = function(alpha){
  if (alphaUniformCache[alpha]){
    return alphaUniformCache[alpha];
  }
  var uniform = new THREE.Uniform(alpha);
  alphaUniformCache[alpha] = uniform;
  return uniform;
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
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      viewMatrix: GLOBAL_VIEW_UNIFORM,
      objectCoordinates: new THREE.Uniform(objectCoordinates),
      objectQuaternions: new THREE.Uniform(objectQuaternions),
      currentPosition: new THREE.Uniform(posit),
      currentQuaternion: new THREE.Uniform(quat),
      alpha: this.getAlphaUniform(trail.alpha),
      diffuseMap: this.getTextureUniform(trail.diffuseTexture),
      emissiveMap: this.getTextureUniform(trail.emissiveTexture),
      alphaMap: this.getTextureUniform(trail.alphaTexture),
      displacementMap: this.getTextureUniform(trail.displacementTexture),
      textureMatrix: new THREE.Uniform(trail.textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
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
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      diffuseMap: this.getTextureUniform(diffuseTexture),
      emissiveMap: this.getTextureUniform(emissiveTexture),
      alphaMap: this.getTextureUniform(alphaTexture),
      aoMap: this.getTextureUniform(aoTexture),
      displacementMap: this.getTextureUniform(displacementTexture),
      textureMatrix: new THREE.Uniform(textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
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
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      diffuseMap: this.getTextureUniform(diffuseTexture),
      emissiveMap: this.getTextureUniform(emissiveTexture),
      alphaMap: this.getTextureUniform(alphaTexture),
      aoMap: this.getTextureUniform(aoTexture),
      displacementMap: this.getTextureUniform(displacementTexture),
      textureMatrix: new THREE.Uniform(textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.position.copy(graphicsGroup.position);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}

MeshGenerator.prototype.generateBasicMesh = function(){
  // diffuse - alpha - ao - displacement
  var textureFlags = new THREE.Vector4(-10, -10, -10, -10);
  // emissive - XX - XX - XX
  var textureFlags2 = new THREE.Vector4(-10, -10, -10, -10);
  var vertexShader = ShaderContent.basicMaterialVertexShader;
  if (!VERTEX_SHADER_TEXTURE_FETCH_SUPPORTED){
    vertexShader = vertexShader.replace(
      "vec3 objNormal = normalize(normal);", ""
    ).replace(
      "transformedPosition += objNormal * (texture2D(displacementMap, vUV).r * displacementInfo.x + displacementInfo.y);", ""
    );
  }
  var material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: ShaderContent.basicMaterialFragmentShader,
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms:{
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      color: new THREE.Uniform(this.material.color),
      alpha: this.getAlphaUniform(this.material.alpha),
      fogInfo: GLOBAL_FOG_UNIFORM,
      aoIntensity: this.getAOIntensityUniform(this.material.aoMapIntensity),
      emissiveIntensity: new THREE.Uniform(this.material.emissiveIntensity),
      displacementInfo: new THREE.Uniform(new THREE.Vector2()),
      textureFlags: new THREE.Uniform(textureFlags),
      textureFlags2: new THREE.Uniform(textureFlags2),
      diffuseMap: this.getTextureUniform(nullTexture),
      alphaMap: this.getTextureUniform(nullTexture),
      aoMap: this.getTextureUniform(nullTexture),
      displacementMap: this.getTextureUniform(nullTexture),
      emissiveMap: this.getTextureUniform(nullTexture),
      textureMatrix: new THREE.Uniform(new THREE.Matrix3())
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  return mesh;
}
