var AddedText = function(name, font, text, position, color, alpha, characterSize, strlenParameter){
  this.isAddedText = true;
  this.twoDimensionalSize = new THREE.Vector2();
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
      worldMatrix: new THREE.Uniform(new THREE.Matrix4()),
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      cameraQuaternion: GLOBAL_CAMERA_QUATERNION_UNIFORM,
      cameraPosition: GLOBAL_CAMERA_POSITION_UNIFORM,
      charSize: new THREE.Uniform(characterSize),
      color: new THREE.Uniform(color),
      alpha: new THREE.Uniform(alpha),
      backgroundColor: new THREE.Uniform(new THREE.Color("white")),
      backgroundAlpha: new THREE.Uniform(0.0),
      hasBackgroundColorFlag: new THREE.Uniform(-500.0),
      uvRanges: new THREE.Uniform(uvsArray),
      glyphTexture: this.getGlyphUniform(),
      xOffsets: new THREE.Uniform(xOffsetsArray),
      yOffsets: new THREE.Uniform(yOffsetsArray),
      affectedByFogFlag: new THREE.Uniform(-50.0),
      fogInfo: GLOBAL_FOG_UNIFORM,
      cubeTexture: GLOBAL_CUBE_TEXTURE_UNIFORM,
      isTwoDimensionalInfo: new THREE.Uniform(new THREE.Vector3(-500, 0, 0)),
      currentViewport: GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM
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
  this.material.uniforms.worldMatrix.value = this.mesh.matrixWorld;

  this.tmpObj = {};
  this.destroyedGrids = new Object();
  this.isClickable = false;

  this.lastUpdateQuaternion = new THREE.Quaternion().copy(camera.quaternion);
  this.lastUpdatePosition = new THREE.Vector3().copy(this.position);

  this.reusableVector = new THREE.Vector3();
  this.makeFirstUpdate = true;
  this.isAffectedByFog = false;
  this.marginMode = MARGIN_MODE_2D_TEXT_TOP_LEFT;
  this.marginPercentWidth = 50;
  this.marginPercentHeight = 50;
}

AddedText.prototype.destroy = function(){
  if (selectedAddedText && selectedAddedText.name == this.name){
    if (this.bbHelper){
      scene.remove(this.bbHelper);
    }
    selectedAddedText = 0;
    afterObjectSelection();
  }
  for (var gridName in this.destroyedGrids){
    if (this.destroyedGrids[gridName].createdAddedTextName == this.name){
      delete this.destroyedGrids[gridName].createdAddedTextName;
    }
  }
  scene.remove(this.mesh);
  this.material.dispose();
  this.geometry.dispose();
  if (this.bbHelper){
    this.bbHelper.material.dispose();
    this.bbHelper.geometry.dispose();
  }
  rayCaster.refresh();
  delete addedTexts[this.name];
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
  while (i2 < this.text.length && i<this.strlen){
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

  this.twoDimensionalSize.x = (xMax);
  this.twoDimensionalSize.y = (yMin);
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
  exportObj.gsName = this.gsName;
  exportObj.isClickable = this.isClickable;
  exportObj.isAffectedByFog = this.isAffectedByFog;
  exportObj.is2D = this.is2D;
  exportObj.is2DInfoX = this.mesh.material.uniforms.isTwoDimensionalInfo.value.x;
  exportObj.is2DInfoY = this.mesh.material.uniforms.isTwoDimensionalInfo.value.y;
  exportObj.is2DInfoZ = this.mesh.material.uniforms.isTwoDimensionalInfo.value.z;
  exportObj.marginMode = this.marginMode;
  exportObj.marginPercentWidth = this.marginPercentWidth;
  exportObj.marginPercentHeight = this.marginPercentHeight;
  var exportDestroyedGrids = new Object();
  for (var gridName in this.destroyedGrids){
    exportDestroyedGrids[gridName] = this.destroyedGrids[gridName].export();
  }
  exportObj["destroyedGrids"] = exportDestroyedGrids;
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
    if (i2 >= this.strlen){
      break;
    }
  }
  for (var i = i2; i<this.strlen; i++){
    uvRangesArray[i].set(-500, -500, -500, -500);
  }
}

AddedText.prototype.setMarginBetweenChars = function(value){
  this.offsetBetweenChars = value;
  this.constructText();
  if (this.is2D){
    this.refCharOffset = value;
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
  }else{
    this.handleBoundingBox();
  }
}

AddedText.prototype.setMarginBetweenLines = function(value){
  this.offsetBetweenLines = value;
  this.constructText();
  if (this.is2D){
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
  }else{
    this.handleBoundingBox();
  }
}

AddedText.prototype.setText = function(newText, fromScript){
  if (fromScript && (typeof this.oldText == UNDEFINED)){
    this.oldText = this.text;
  }
  this.text = newText;
  this.constructText();
  this.handleUVUniform();
  if (this.is2D){
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
  }else{
    this.handleBoundingBox();
  }
}

AddedText.prototype.setColor = function(colorString, fromScript){
  if (fromScript && (typeof this.oldColorR == UNDEFINED)){
    this.oldColorR = this.material.uniforms.color.value.r;
    this.oldColorG = this.material.uniforms.color.value.g;
    this.oldColorB = this.material.uniforms.color.value.b;
  }
  this.material.uniforms.color.value.set(colorString);
}

AddedText.prototype.setAlpha = function(alpha, fromScript){
  if (fromScript && (typeof this.oldAlpha == UNDEFINED)){
    this.oldAlpha = this.alpha;
  }
  if (alpha > 1){
    alpha = 1;
  }else if (alpha < 0){
    alpha = 0;
  }
  this.material.uniforms.alpha.value = alpha;
  this.alpha = alpha;
}

AddedText.prototype.setBackground = function(backgroundColorString, backgroundAlpha, fromScript){
  if (backgroundAlpha > 1){
    backgroundAlpha = 1;
  }else if (backgroundAlpha < 0){
    backgroundAlpha = 0;
  }
  if (fromScript && (typeof this.oldBackgroundR == UNDEFINED)){
    this.oldBackgroundR = this.material.uniforms.backgroundColor.value.r;
    this.oldBackgroundG = this.material.uniforms.backgroundColor.value.g;
    this.oldBackgroundB = this.material.uniforms.backgroundColor.value.b;
    this.oldBackgroundAlpha = this.material.uniforms.backgroundAlpha.value;
  }
  if (fromScript && (typeof this.oldBackgroundStatus == UNDEFINED)){
    this.oldBackgroundStatus = this.material.uniforms.hasBackgroundColorFlag.value;
  }
  this.material.uniforms.backgroundColor.value.set(backgroundColorString);
  this.material.uniforms.backgroundAlpha.value = backgroundAlpha;
  this.material.uniforms.hasBackgroundColorFlag.value = 500;
}

AddedText.prototype.removeBackground = function(fromScript){
  if (fromScript && (typeof this.oldBackgroundStatus == UNDEFINED)){
    this.oldBackgroundStatus = this.material.uniforms.hasBackgroundColorFlag.value;
  }
  this.material.uniforms.hasBackgroundColorFlag.value = -500;
}

AddedText.prototype.setCharSize = function(value){
  this.material.uniforms.charSize.value = value;
  this.characterSize = value;
  if (this.is2D){
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
  }else{
    this.handleBoundingBox();
  }
}

AddedText.prototype.handleResize = function(){
  this.setCharSize(this.refCharSize * ((renderer.getCurrentViewport().w / screenResolution)/this.refInnerHeight));
  if (this.is2D){
    if (typeof this.refCharOffset == UNDEFINED){
      this.refCharOffset = this.offsetBetweenChars;
    }
    this.offsetBetweenChars = this.refCharOffset * ((renderer.getCurrentViewport().w)/this.refInnerHeight);
    this.constructText();
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
  }
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

AddedText.prototype.getCenterCoordinates = function(){
  this.handleBoundingBox();
  this.boundingBox.getCenter(this.reusableVector);
  return this.reusableVector;
}

AddedText.prototype.handleBoundingBox = function(){
  if (this.is2D){
    return;
  }
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

  REUSABLE_VECTOR.add(this.mesh.position);
  REUSABLE_VECTOR_2.add(this.mesh.position);
  REUSABLE_VECTOR_3.add(this.mesh.position);
  REUSABLE_VECTOR_4.add(this.mesh.position);

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

  REUSABLE_VECTOR.add(this.mesh.position);
  REUSABLE_VECTOR_2.add(this.mesh.position);
  REUSABLE_VECTOR_3.add(this.mesh.position);
  REUSABLE_VECTOR_4.add(this.mesh.position);

  this.plane.setFromCoplanarPoints(REUSABLE_VECTOR, REUSABLE_VECTOR_2, REUSABLE_VECTOR_3);
  this.triangles[0].set(REUSABLE_VECTOR, REUSABLE_VECTOR_2, REUSABLE_VECTOR_3);
  this.triangles[1].set(REUSABLE_VECTOR, REUSABLE_VECTOR_2, REUSABLE_VECTOR_4);

  this.lastUpdateQuaternion.copy(camera.quaternion);
  this.lastUpdatePosition.copy(this.mesh.position);
}

AddedText.prototype.needsUpdate = function(){
  if (this.makeFirstUpdate){
    this.makeFirstUpdate = false;
    return true;
  }
  return !(
    this.lastUpdateQuaternion.x == camera.quaternion.x &&
    this.lastUpdateQuaternion.y == camera.quaternion.y &&
    this.lastUpdateQuaternion.z == camera.quaternion.z &&
    this.lastUpdateQuaternion.w == camera.quaternion.w &&
    this.lastUpdatePosition.x == this.mesh.position.x &&
    this.lastUpdatePosition.y == this.mesh.position.y &&
    this.lastUpdatePosition.z == this.mesh.position.z
  )
}

AddedText.prototype.debugTriangles = function(triangleIndex){
  this.handleBoundingBox();
  var s1 = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: "red"}));
  var s2 = s1.clone(), s3 = s1.clone();
  var sCenter = new THREE.Mesh(new THREE.SphereGeometry(20), new THREE.MeshBasicMaterial({color: "lime"}));
  var triangle = this.triangles[triangleIndex];
  scene.add(s1);
  scene.add(s2);
  scene.add(s3);
  scene.add(sCenter);
  s1.position.copy(triangle.a);
  s2.position.copy(triangle.b);
  s3.position.copy(triangle.c);
  sCenter.position.copy(this.getCenterCoordinates());
}

AddedText.prototype.hide = function(){
  this.mesh.visible = false;
  if (mode == 0 && this.bbHelper){
    scene.remove(this.bbHelper);
  }
  if (mode == 1 && this.isClickable){
    rayCaster.binHandler.deleteObjectFromBin(this.binInfo, this.name);
  }
}

AddedText.prototype.show = function(){
  this.mesh.visible = true;
  if (mode == 1 && this.isClickable){
    if (!this.boundingBox){
      this.handleBoundingBox();
    }
    if (!this.is2D){
      rayCaster.binHandler.insert(this.boundingBox, this.name);
    }
  }
}

AddedText.prototype.restore = function(){
  if (!(typeof this.oldText == UNDEFINED)){
    this.setText(this.oldText);
    delete this.oldText;
  }
  if (!(typeof this.oldColorR == UNDEFINED)){
    this.material.uniforms.color.value.setRGB(
      this.oldColorR, this.oldColorG, this.oldColorB
    );
    delete this.oldColorR;
    delete this.oldColorG;
    delete this.oldColorB;
  }
  if (!(typeof this.oldAlpha == UNDEFINED)){
    this.setAlpha(this.oldAlpha);
    delete this.oldAlpha;
  }
  if (!(typeof this.oldBackgroundStatus == UNDEFINED)){
    this.material.uniforms.hasBackgroundColorFlag.value = this.oldBackgroundStatus;
    delete this.oldBackgroundStatus;
  }
  if (!(typeof this.oldBackgroundR == UNDEFINED)){
    this.material.uniforms.backgroundColor.value.setRGB(
      this.oldBackgroundR, this.oldBackgroundG, this.oldBackgroundB
    );
    this.material.uniforms.backgroundAlpha.value = this.oldBackgroundAlpha;
    delete this.oldBackgroundR;
    delete this.oldBackgroundG;
    delete this.oldBackgroundB;
    delete this.oldBackgroundAlpha;
  }
  this.mesh.position.copy(this.position);
}

AddedText.prototype.setAffectedByFog = function(val){
  this.isAffectedByFog = val;
  if (val){
    this.material.uniforms.affectedByFogFlag.value = 50.0;
  }else{
    this.material.uniforms.affectedByFogFlag.value = -50.0;
  }
}

AddedText.prototype.set2DStatus = function(is2D){
  if (is2D == this.is2D){
    return;
  }
  this.is2D = is2D;
  if (is2D){
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
    if (typeof this.oldIsClickable == UNDEFINED){
      this.oldIsClickable = this.isClickable;
    }
    this.isClickable = false;
  }else{
    this.isClickable = this.oldIsClickable;
    delete this.oldIsClickable;
    if (!(typeof this.refCharOffset == UNDEFINED)){
      this.setMarginBetweenChars(this.refCharOffset);
      delete this.refCharOffset;
    }
  }
  if (is2D){
    selectedAddedText.material.uniforms.isTwoDimensionalInfo.value.x = 500;
    rayCaster.binHandler.deleteObjectFromBin(this.binInfo, this.name);
    if (this.bbHelper){
      scene.remove(this.bbHelper);
    }
  }else{
    selectedAddedText.material.uniforms.isTwoDimensionalInfo.value.x = -500;
    rayCaster.binHandler.insert(this.boundingBox, this.name);
    if (this.bbHelper && selectedAddedText && selectedAddedText.name == this.name){
      scene.add(this.bbHelper);
    }
  }
}

AddedText.prototype.set2DCoordinates = function(marginPercentWidth, marginPercentHeight){
  this.marginPercentWidth = marginPercentWidth;
  this.marginPercentHeight = marginPercentHeight;
  var isFromLeft = false, isFromTop = false;
  if (this.marginMode == MARGIN_MODE_2D_TEXT_TOP_LEFT){
    isFromLeft = true;
    isFromTop = true;
  }
  var curViewport = REUSABLE_QUATERNION.copy(GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value);
  curViewport.x = curViewport.x / screenResolution;
  curViewport.y = curViewport.y / screenResolution;
  curViewport.z = curViewport.z / screenResolution;
  curViewport.w = curViewport.w / screenResolution;
  if (isFromLeft){
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + this.twoDimensionalSize.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.characterSize / (curViewport.z - curViewport.x));
    marginX += cSizeX;
    if (marginX + widthX > 1){
      marginX = 1 - widthX - cSizeX;
    }
    this.material.uniforms.isTwoDimensionalInfo.value.y = marginX;
  }else{
    marginPercentWidth = marginPercentWidth + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + this.twoDimensionalSize.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.characterSize / (curViewport.z - curViewport.x));
    marginX += cSizeX + widthX;
    marginX = 2 - marginX;
    if (marginX < -1){
      marginX = -1 + cSizeX;
    }
    this.material.uniforms.isTwoDimensionalInfo.value.y = marginX;
  }
  if (isFromTop){
    marginPercentHeight = 100 - marginPercentHeight;
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + this.twoDimensionalSize.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.characterSize / (curViewport.w - curViewport.y));
    marginY -= cSizeY;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.material.uniforms.isTwoDimensionalInfo.value.z = marginY;
  }else{
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + this.twoDimensionalSize.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.characterSize / (curViewport.w - curViewport.y));
    marginY -= cSizeY;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.material.uniforms.isTwoDimensionalInfo.value.z = marginY;
  }
}
