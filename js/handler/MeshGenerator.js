var MeshGenerator = function(geometry, material){
  this.geometry = geometry;
  this.material = material;
}

MeshGenerator.prototype.generateMesh = function(){
  if (this.material instanceof BasicMaterial){
    return this.generateBasicMesh();
  }
}

MeshGenerator.prototype.generateMergedMesh = function(graphicsGroup, textureMerger){
  var textureUniform
  if (textureMerger){
    textureUniform = new THREE.Uniform(textureMerger.mergedTexture);
  }else{
    textureUniform = new THREE.Uniform(new THREE.Texture());
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
      texture: textureUniform,
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
