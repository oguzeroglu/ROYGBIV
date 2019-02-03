var AddedText = function(font, text, position, color, alpha, characterSize){
  this.font = font;
  this.text = text;
  this.position = position;
  this.color = color;
  this.alpha = alpha;
  this.characterSize = characterSize;
  this.geometry = new THREE.BufferGeometry();
  var strlen = text.length;
  this.strlen = strlen;

  var charIndices = new Float32Array(strlen);
  for (var i = 0; i<strlen; i++){
    charIndices[i] = i;
  }
  this.charIndices = charIndices;
  this.offsetBetweenLines = DEFAULT_OFFSET_BETWEEN_LINES;
  this.offsetBetweenChars = DEFAULT_OFFSET_BETWEEN_CHARS;

  var charIndicesBufferAttribute = new THREE.BufferAttribute(charIndices, 1);
  charIndicesBufferAttribute.setDynamic(false);
  this.geometry.addAttribute('charIndex', charIndicesBufferAttribute);
  this.geometry.setDrawRange(0, strlen);

  var xOffsetsArray = [];
  var yOffsetsArray = [];
  var uvsArray = [];
  for (var i = 0; i<strlen; i++){
    xOffsetsArray.push(0);
    yOffsetsArray.push(0);
    uvsArray.push(new THREE.Vector4());
  }

  this.material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.textVertexShader.replace("#define STR_LEN 1", "#define STR_LEN "+strlen),
    fragmentShader: ShaderContent.textFragmentShader,
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      cameraQuaternion: GLOBAL_CAMERA_QUATERNION_UNIFORM,
      charSize: new THREE.Uniform(characterSize),
      color: new THREE.Uniform(color),
      alpha: new THREE.Uniform(alpha),
      backgroundColor: new THREE.Uniform(WHITE_COLOR),
      backgroundAlpha: new THREE.Uniform(0.0),
      uvRanges: new THREE.Uniform(uvsArray),
      glyphTexture: this.getGlyphUniform(),
      xOffsets: new THREE.Uniform(xOffsetsArray),
      yOffsets: new THREE.Uniform(yOffsetsArray)
    }
  });
  this.constructText();
  this.handleUVUniform();
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.position.copy(position);
  this.mesh.frustumCulled = false;
  scene.add(this.mesh);
  this.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;
}

AddedText.prototype.destroy = function(){
  scene.remove(this.mesh);
  this.material.dispose();
  this.geometry.dispose();
}

AddedText.prototype.constructText = function(){
  var xOffset = 0;
  var yOffset = 0;
  var xOffsets = this.material.uniforms.xOffsets.value;
  var yOffsets = this.material.uniforms.yOffsets.value;
  for (var i = 0; i<this.strlen; i++){
    xOffsets[i] = xOffset;
    yOffsets[i] = yOffset;
    if (this.text.charAt(i) == "\n"){
      yOffset -= this.offsetBetweenLines;
      xOffset = 0;
    }else{
      xOffset += this.offsetBetweenChars;
    }
  }
}

AddedText.prototype.getGlyphUniform = function(){
  var uuid = this.font.textureMerger.mergedTexture.uuid;
  if (textureUniformCache[uuid]){
    return textureUniformCache[uuid];
  }
  var glyphUniform = new THREE.Uniform(this.font.textureMerger.mergedTexture);
  textureUniformCache[uuid] = glyphUniform;
  return glyphUniform;
}

AddedText.prototype.handleUVUniform = function(){
  var uvRangesArray = this.material.uniforms.uvRanges.value;
  for (var i = 0; i<this.strlen; i++){
    var curChar = this.text.charAt(i);
    var curRange = this.font.textureMerger.ranges[curChar];
    if (curRange){
      uvRangesArray[i].set(
        curRange.startU, curRange.endU, curRange.startV, curRange.endV
      );
    }else{
      uvRangesArray[i].set(-500, -500, -500, -500);
    }
  }
}

AddedText.prototype.setMarginBetweenChars = function(value){
  this.offsetBetweenChars = value;
  this.constructText();
}

AddedText.prototype.setMarginBetweenLines = function(value){
  this.offsetBetweenLines = value;
  this.constructText();
}

AddedText.prototype.setText = function(newText){
  if (newText.length > this.strlen){
    throw new Error("The length of the next text exceeds the length of the old text.");
    return;
  }
  this.text = newText;
  this.constructText();
  this.handleUVUniform();
}

AddedText.prototype.setColor = function(colorString){
  this.material.uniforms.color.value.set(colorString);
}

AddedText.prototype.setAlpha = function(alpha){
  if (alpha > 1){
    alpha = 1;
  }else if (alpha < 0){
    alpha = 0;
  }
  this.material.uniforms.alpha.value = alpha;
}

AddedText.prototype.setBackground = function(backgroundColorString, backgroundAlpha){
  this.material.uniforms.backgroundColor.value.set(backgroundColorString);
  this.material.uniforms.backgroundAlpha.value = backgroundAlpha;
}

AddedText.prototype.setCharSize = function(value){
  this.material.uniforms.charSize.value = value;
}
