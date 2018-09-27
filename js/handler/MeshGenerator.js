var MeshGenerator = function(geometry, material){
  this.geometry = geometry;
  this.material = material;
}

MeshGenerator.prototype.generateMesh = function(){
  if (this.material instanceof BasicMaterial){
    return this.generateBasicMesh();
  }
}

MeshGenerator.prototype.generateMergedMesh = function(graphicsGroup, objectGroup){
  var diffuseTexture = objectGroup.diffuseTexture;
  var emissiveTexture = objectGroup.emissiveTexture;
  var alphaTexture = objectGroup.alphaTexture;
  var aoTexture = objectGroup.aoTexture;
  var textureMatrix = objectGroup.textureMatrix;
  if (!diffuseTexture){
    diffuseTexture = new THREE.Texture();
  }
  if (!emissiveTexture){
    emissiveTexture = new THREE.Texture();
  }
  if (!alphaTexture){
    alphaTexture = new THREE.Texture();
  }
  if (!aoTexture){
    aoTexture = new THREE.Texture();
  }
  if (!textureMatrix){
    textureMatrix = new THREE.Matrix3();
  }
  var material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.mergedBasicMaterialVertexShader,
    fragmentShader: ShaderContent.mergedBasicMaterialFragmentShader,
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      projectionMatrix: new THREE.Uniform(new THREE.Matrix4()),
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      diffuseMap: new THREE.Uniform(diffuseTexture),
      emissiveMap: new THREE.Uniform(emissiveTexture),
      alphaMap: new THREE.Uniform(alphaTexture),
      aoMap: new THREE.Uniform(aoTexture),
      textureMatrix: new THREE.Uniform(textureMatrix),
      fogInfo: GLOBAL_FOG_UNIFORM
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  mesh.position.copy(graphicsGroup.position);
  material.uniforms.projectionMatrix.value = camera.projectionMatrix;
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
      projectionMatrix: new THREE.Uniform(new THREE.Matrix4()),
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      color: new THREE.Uniform(this.material.color),
      alpha: new THREE.Uniform(this.material.alpha),
      fogInfo: GLOBAL_FOG_UNIFORM,
      aoIntensity: new THREE.Uniform(this.material.aoMapIntensity),
      emissiveIntensity: new THREE.Uniform(this.material.emissiveIntensity),
      displacementInfo: new THREE.Uniform(new THREE.Vector2()),
      textureFlags: new THREE.Uniform(textureFlags),
      textureFlags2: new THREE.Uniform(textureFlags2),
      diffuseMap: new THREE.Uniform(new THREE.Texture()),
      alphaMap: new THREE.Uniform(new THREE.Texture()),
      aoMap: new THREE.Uniform(new THREE.Texture()),
      displacementMap: new THREE.Uniform(new THREE.Texture()),
      emissiveMap: new THREE.Uniform(new THREE.Texture()),
      textureMatrix: new THREE.Uniform(new THREE.Matrix3())
    }
  });
  var mesh = new THREE.Mesh(this.geometry, material);
  material.uniforms.modelViewMatrix.value = mesh.modelViewMatrix;
  material.uniforms.projectionMatrix.value = camera.projectionMatrix;
  return mesh;
}
