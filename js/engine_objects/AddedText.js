var AddedText = function(name, font, text, position, color, alpha, characterSize, strlenParameter){
  this.isAddedText = true;
  this.name = name;
  this.font = font;
  this.text = text;
  this.position = position;
  this.color = color;
  this.alpha = alpha;
  this.characterSize = characterSize;
  this.geometry = new THREE.BufferGeometry();
  var strlen = strlenParameter;
  if (typeof strlen == UNDEFINED){
    strlen = text.length;
  }
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
      backgroundColor: new THREE.Uniform(new THREE.Color("white")),
      backgroundAlpha: new THREE.Uniform(0.0),
      hasBackgroundColorFlag: new THREE.Uniform(-500.0),
      uvRanges: new THREE.Uniform(uvsArray),
      glyphTexture: this.getGlyphUniform(),
      xOffsets: new THREE.Uniform(xOffsetsArray),
      yOffsets: new THREE.Uniform(yOffsetsArray)
    }
  });
  this.topLeft = new THREE.Vector3(0, 0, 0);
  this.bottomRight = new THREE.Vector3();
  this.bottomLeft = new THREE.Vector3();
  this.topRight = new THREE.Vector3();
  this.constructText();
  this.handleUVUniform();
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.position.copy(position);
  this.mesh.frustumCulled = false;
  scene.add(this.mesh);
  this.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;

  this.tmpObj = {};
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
  var xMax = 0;
  var yMin = 0;
  var i = 0;
  var i2 = 0;
  while (i2 < this.text.length){
    if (this.text.charAt(i2) == "\n"){
      yOffset-= this.offsetBetweenLines;
      xOffset = 0;
    }else{
      xOffsets[i] = xOffset;
      yOffsets[i] = yOffset;
      if (xOffset > xMax){
        xMax = xOffset;
      }
      if (yOffset < yMin){
        yMin = yOffset;
      }
      xOffset += this.offsetBetweenChars;
      i ++;
    }
    i2 ++;
  }
  this.bottomRight.x = xMax;
  this.bottomRight.y = yMin;
  this.bottomRight.z = -1;
  this.bottomLeft.x = 0;
  this.bottomLeft.y = yMin;
  this.topRight.x = xMax;
  this.topRight.y = 0;
}

AddedText.prototype.export = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.fontName = this.font.name;
  exportObj.text = this.text;
  exportObj.positionX = this.position.x;
  exportObj.positionY = this.position.y;
  exportObj.positionZ = this.position.z;
  exportObj.colorR = this.color.r;
  exportObj.colorG = this.color.g;
  exportObj.colorB = this.color.b;
  exportObj.alpha = this.alpha;
  exportObj.charSize = this.characterSize;
  exportObj.strlen = this.strlen;
  exportObj.offsetBetweenChars = this.offsetBetweenChars;
  exportObj.offsetBetweenLines = this.offsetBetweenLines;
  exportObj.refCharSize = this.refCharSize;
  exportObj.refInnerHeight = this.refInnerHeight;
  exportObj.hasBackground = (this.material.uniforms.hasBackgroundColorFlag.value > 0);
  exportObj.backgroundColorR = this.material.uniforms.backgroundColor.value.r;
  exportObj.backgroundColorG = this.material.uniforms.backgroundColor.value.g;
  exportObj.backgroundColorB = this.material.uniforms.backgroundColor.value.b;
  exportObj.backgroundAlpha = this.material.uniforms.backgroundAlpha.value;
  return exportObj;
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
  var i2 = 0;
  for (var i = 0; i<this.text.length; i++){
    var curChar = this.text.charAt(i);
    if (curChar != "\n"){
      var curRange = this.font.textureMerger.ranges[curChar];
      if (curRange){
        uvRangesArray[i2++].set(
          curRange.startU, curRange.endU, curRange.startV, curRange.endV
        );
      }else{
        uvRangesArray[i2++].set(-500, -500, -500, -500);
      }
    }
  }
  for (var i = i2; i<this.strlen; i++){
    uvRangesArray[i].set(-500, -500, -500, -500);
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
  this.text = newText;
  this.constructText();
  this.handleUVUniform();
  this.handleBoundingBox();
}

AddedText.prototype.setColor = function(colorString){
  this.material.uniforms.color.value.set(colorString);
  this.color.set(
    this.material.uniforms.color.value.r,
    this.material.uniforms.color.valug.g,
    this.material.uniforms.color.value.b
  );
}

AddedText.prototype.setAlpha = function(alpha){
  if (alpha > 1){
    alpha = 1;
  }else if (alpha < 0){
    alpha = 0;
  }
  this.material.uniforms.alpha.value = alpha;
  this.alpha = alpha;
}

AddedText.prototype.setBackground = function(backgroundColorString, backgroundAlpha){
  this.material.uniforms.backgroundColor.value.set(backgroundColorString);
  this.material.uniforms.backgroundAlpha.value = backgroundAlpha;
  this.material.uniforms.hasBackgroundColorFlag.value = 500;
}

AddedText.prototype.removeBackground = function(){
  this.material.uniforms.hasBackgroundColorFlag.value = -500;
}

AddedText.prototype.setCharSize = function(value){
  this.material.uniforms.charSize.value = value;
  this.characterSize = value;
}

AddedText.prototype.handleResize = function(){
  this.setCharSize(this.refCharSize * ((renderer.getCurrentViewport().w / screenResolution)/this.refInnerHeight));
  this.handleBoundingBox();
}

AddedText.prototype.calculateCharSize = function(){
  var currentViewport = renderer.getCurrentViewport();
  REUSABLE_VECTOR.copy(this.mesh.position);
  REUSABLE_VECTOR.applyQuaternion(this.mesh.quaternion);
  REUSABLE_VECTOR.applyMatrix4(this.mesh.modelViewMatrix);
  var pointSizePixels =  500 * this.characterSize / REUSABLE_VECTOR.length();
  var verticalFOV = THREE.Math.degToRad(camera.fov);
  var height = 2 * Math.tan(verticalFOV / 2) * this.position.distanceTo(camera.position);
  var width = height * camera.aspect;
  var w = width * pointSizePixels /currentViewport.z;
  var h = height * pointSizePixels / currentViewport.w;
  this.tmpObj.width = w;
  this.tmpObj.height = h;
  return this.tmpObj;
}

AddedText.prototype.intersectsLine = function(line){
  if (this.plane.intersectLine(line, REUSABLE_VECTOR)){
    if (this.triangles[0].containsPoint(REUSABLE_VECTOR) || this.triangles[1].containsPoint(REUSABLE_VECTOR)){
      return REUSABLE_VECTOR;
    }
  }
  return false;
}

AddedText.prototype.handleBoundingBox = function(){
  if (!this.boundingBox){
    this.boundingBox = new THREE.Box3();
    this.bbHelper = new THREE.Box3Helper(this.boundingBox);
    this.plane = new THREE.Plane();
    this.triangles = [new THREE.Triangle(), new THREE.Triangle()];
  }else{
    this.boundingBox.makeEmpty();
  }
  var cSize = this.calculateCharSize();
  REUSABLE_VECTOR.copy(this.topLeft)
  REUSABLE_VECTOR_2.copy(this.bottomRight);
  REUSABLE_VECTOR_3.copy(this.topRight);
  REUSABLE_VECTOR_4.copy(this.bottomLeft);
  REUSABLE_VECTOR.x -= cSize.width / 2;
  REUSABLE_VECTOR.y += cSize.height / 2;
  REUSABLE_VECTOR_2.x += cSize.width / 2;
  REUSABLE_VECTOR_2.y -= cSize.height / 2;
  REUSABLE_VECTOR_3.x += cSize.width / 2;
  REUSABLE_VECTOR_3.y += cSize.height / 2;
  REUSABLE_VECTOR_4.x -= cSize.width / 2;
  REUSABLE_VECTOR_4.y -= cSize.height / 2;

  REUSABLE_VECTOR.applyQuaternion(camera.quaternion);
  REUSABLE_VECTOR_2.applyQuaternion(camera.quaternion);
  REUSABLE_VECTOR_3.applyQuaternion(camera.quaternion);
  REUSABLE_VECTOR_4.applyQuaternion(camera.quaternion);

  REUSABLE_VECTOR.add(this.position);
  REUSABLE_VECTOR_2.add(this.position);
  REUSABLE_VECTOR_3.add(this.position);
  REUSABLE_VECTOR_4.add(this.position);

  this.boundingBox.expandByPoint(REUSABLE_VECTOR);
  this.boundingBox.expandByPoint(REUSABLE_VECTOR_2);
  this.boundingBox.expandByPoint(REUSABLE_VECTOR_3);
  this.boundingBox.expandByPoint(REUSABLE_VECTOR_4);

  REUSABLE_VECTOR.copy(this.topLeft)
  REUSABLE_VECTOR_2.copy(this.bottomRight);
  REUSABLE_VECTOR_3.copy(this.topRight);
  REUSABLE_VECTOR_4.copy(this.bottomLeft);
  REUSABLE_VECTOR.z = 0, REUSABLE_VECTOR_2.z = 0, REUSABLE_VECTOR_3.z = 0, REUSABLE_VECTOR_4.z = 0;
  REUSABLE_VECTOR.x -= cSize.width / 2;
  REUSABLE_VECTOR.y += cSize.height / 2;
  REUSABLE_VECTOR_2.x += cSize.width / 2;
  REUSABLE_VECTOR_2.y -= cSize.height / 2;
  REUSABLE_VECTOR_3.x += cSize.width / 2;
  REUSABLE_VECTOR_3.y += cSize.height / 2;
  REUSABLE_VECTOR_4.x -= cSize.width / 2;
  REUSABLE_VECTOR_4.y -= cSize.height / 2;

  REUSABLE_VECTOR.applyQuaternion(camera.quaternion);
  REUSABLE_VECTOR_2.applyQuaternion(camera.quaternion);
  REUSABLE_VECTOR_3.applyQuaternion(camera.quaternion);
  REUSABLE_VECTOR_4.applyQuaternion(camera.quaternion);

  REUSABLE_VECTOR.add(this.position);
  REUSABLE_VECTOR_2.add(this.position);
  REUSABLE_VECTOR_3.add(this.position);
  REUSABLE_VECTOR_4.add(this.position);

  this.plane.setFromCoplanarPoints(REUSABLE_VECTOR, REUSABLE_VECTOR_2, REUSABLE_VECTOR_3);
  this.triangles[0].set(REUSABLE_VECTOR, REUSABLE_VECTOR_2, REUSABLE_VECTOR_3);
  this.triangles[1].set(REUSABLE_VECTOR, REUSABLE_VECTOR_2, REUSABLE_VECTOR_4);
}

AddedText.prototype.debugTriangles = function(triangleIndex){
  this.handleBoundingBox();
  var s1 = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: "red"}));
  var s2 = s1.clone(), s3 = s1.clone();
  var triangle = this.triangles[triangleIndex];
  scene.add(s1);
  scene.add(s2);
  scene.add(s3);
  s1.position.copy(triangle.a);
  s2.position.copy(triangle.b);
  s3.position.copy(triangle.c);
}

AddedText.prototype.hide = function(){
  this.mesh.visible = false;
  if (mode == 0 && this.bbHelper){
    scene.remove(this.bbHelper);
  }
}

AddedText.prototype.show = function(){
  this.mesh.visible = true;
}
