var AddedText = function(name, font, text, position, color, alpha, characterSize, strlenParameter){
  this.isAddedText = true;
  if (IS_WORKER_CONTEXT){
    return this;
  }
  this.twoDimensionalParameters = new THREE.Vector2();
  this.twoDimensionalSize = new THREE.Vector4();
  this.webglSpaceSize = new THREE.Vector2();
  this.shaderMargin = new THREE.Vector2();
  this.name = name;
  this.font = font;
  this.text = text;
  this.position = position;
  this.color = color;
  this.alpha = alpha;
  this.characterSize = characterSize;
  this.geometry = new THREE.BufferGeometry();
  this.hasBackground = false;
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
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      modelViewMatrix: new THREE.Uniform(new THREE.Matrix4()),
      projectionMatrix: GLOBAL_PROJECTION_UNIFORM,
      cameraQuaternion: GLOBAL_CAMERA_QUATERNION_UNIFORM,
      color: new THREE.Uniform(color),
      alpha: new THREE.Uniform(alpha),
      uvRanges: new THREE.Uniform(uvsArray),
      glyphTexture: this.getGlyphUniform(),
      xOffsets: new THREE.Uniform(xOffsetsArray),
      yOffsets: new THREE.Uniform(yOffsetsArray),
      charSize: new THREE.Uniform(this.characterSize),
      screenResolution: GLOBAL_SCREEN_RESOLUTION_UNIFORM
    }
  });
  this.topLeft = new THREE.Vector3(0, 0, 0);
  this.bottomRight = new THREE.Vector3();
  this.bottomLeft = new THREE.Vector3();
  this.topRight = new THREE.Vector3();
  this.constructText();
  this.handleUVUniform();
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.renderOrder = renderOrders.TEXT_3D;
  this.mesh.position.copy(position);
  this.mesh.frustumCulled = false;
  scene.add(this.mesh);
  this.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;

  this.tmpObj = {};
  this.destroyedGrids = new Object();
  this.isClickable = false;

  this.lastUpdateQuaternion = new THREE.Quaternion().copy(camera.quaternion);
  this.lastUpdatePosition = new THREE.Vector3().copy(this.position);
  this.lastUpdateCameraPosition = new THREE.Vector3().copy(camera.position);

  this.reusableVector = new THREE.Vector3();
  this.makeFirstUpdate = true;
  this.isAffectedByFog = false;
  this.marginMode = MARGIN_MODE_2D_TOP_LEFT;
  this.marginPercentWidth = 50;
  this.marginPercentHeight = 50;
  this.maxWidthPercent = 100;
  this.maxHeightPercent = 100;

  this.animations = new Object();

  webglCallbackHandler.registerEngineObject(this);
}

AddedText.prototype.isAnimationSuitable = function(animation){
  var action = animation.description.action;

  if (action == animationHandler.actionTypes.TEXT.POSITION_Z){
    return !this.is2D;
  }
  return true;
}

AddedText.prototype.copyAnimationsFromObject = function(text){
  this.animations = new Object();

  for (var animName in text.animations){
    if (this.isAnimationSuitable(text.animations[animName])){
      this.addAnimation(text.animations[animName].copyWithAnotherObject(this));
    }
  }
}

AddedText.prototype.handleInputAnimation = function(){
  var now = performance.now();
  if (now - this.lastInputLineUpdateTime >= 500){
    if (this.isInputLineVisible){
      this.skipInputAdjustment = true;
      this.setText(this.text.substring(0, this.text.length -1), true);
      this.skipInputAdjustment = false;
      this.mesh.material.uniforms.inputLineInfo.value.x = -500;
    }else{
      this.skipInputAdjustment = true;
      this.setText(this.text + "a", true);
      this.skipInputAdjustment = false;
      this.mesh.material.uniforms.inputLineInfo.value.x = this.text.length -1;
    }
    this.isInputLineVisible = !this.isInputLineVisible;
    this.lastInputLineUpdateTime = now;
  }
}

AddedText.prototype.deactivateInputMode = function(){
  if (!this.is2D || mode == 0){
    return;
  }
  if (mode == 1 && inputText != this){
    return;
  }
  this.isInput = false;
  this.mesh.material.uniforms.inputLineInfo.value.x = -500;
  if (this.isInputLineVisible){
    this.setText(this.text.substring(0, this.text.length - 1), true);
  }
  inputText = 0;
}

AddedText.prototype.activateInputMode = function(inputLineCharSizePercent){
  if (!this.is2D || mode == 0){
    return;
  }
  if (mode == 1 && inputText == this){
    return;
  }
  if (!inputLineCharSizePercent){
    inputLineCharSizePercent = 100;
  }
  if (inputText){
    inputText.deactivateInputMode();
  }
  this.isInput = true;
  this.setText(this.text + "a", true);
  this.mesh.material.uniforms.inputLineInfo.value.x = this.text.length -1;
  this.mesh.material.uniforms.inputLineInfo.value.y = inputLineCharSizePercent;
  inputText = this;
  this.isInputLineVisible = true;
  this.lastInputLineUpdateTime = performance.now();
}

AddedText.prototype.syncProperties = function(sourceText){
  this.setColor("#" + sourceText.getColor().getHexString());
  this.setAlpha(sourceText.getAlpha());
  if (sourceText.hasBackground){
    this.setBackground("#"+sourceText.getBackgroundColor().getHexString(), sourceText.getBackgroundAlpha());
  }else{
    this.removeBackground();
  }
  this.setCharSize(sourceText.getCharSize());
  this.setMarginBetweenChars(sourceText.getMarginBetweenChars());
  this.setMarginBetweenLines(sourceText.getMarginBetweenLines());
  this.refCharSize = sourceText.refCharSize;
  this.refInnerHeight = sourceText.refInnerHeight;
  this.handleResize();
}

AddedText.prototype.addAnimation = function(animation){
  this.animations[animation.name] = animation;
}

AddedText.prototype.removeAnimation = function(animation){
  delete this.animations[animation.name];
}

AddedText.prototype.getPositionZ = function(){
  if (this.is2D){
    return 0;
  }else{
    return this.mesh.position.z;
  }
}

AddedText.prototype.getPositionY = function(){
  if (this.is2D){
    return this.marginPercentHeight;
  }else{
    return this.mesh.position.y;
  }
}

AddedText.prototype.getPositionX = function(){
  if (this.is2D){
    return this.marginPercentWidth;
  }else{
    return this.mesh.position.x;
  }
}

AddedText.prototype.setPositionX = function(val){
  if (this.is2D){
    this.set2DCoordinates(val, this.getPositionY());
  }else{
    this.mesh.position.x = val;
  }
}

AddedText.prototype.setPositionY = function(val){
  if (this.is2D){
    this.set2DCoordinates(this.getPositionX(), val);
  }else{
    this.mesh.position.y = val;
  }
}

AddedText.prototype.setPositionZ = function(val){
  if (this.is2D){
    return;
  }else{
    this.mesh.position.z = val;
  }
}

AddedText.prototype.setPosition = function(x, y, z){
  if (this.is2D){
    this.set2DCoordinates(x, y);
  }else{
    this.mesh.position.set(x, y, z);
  }
}

AddedText.prototype.useDefaultPrecision = function(){
  shaderPrecisionHandler.setDefaultPrecisionForObject(this);
  this.hasCustomPrecision = false;
  delete this.customPrecision;
}

AddedText.prototype.useCustomShaderPrecision = function(precision){
  shaderPrecisionHandler.setCustomPrecisionForObject(this, precision);
  this.hasCustomPrecision = true;
  this.customPrecision = precision;
}

AddedText.prototype.destroy = function(skipRaycasterRefresh){
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
  if (this.rectangle){
    scene.remove(this.rectangle.mesh);
    this.rectangle.material.dispose();
    this.rectangle.geometry.dispose();
  }
  if (!skipRaycasterRefresh && this.name){
    rayCaster.refresh();
  }
  delete addedTexts[this.name];
  if (this.is2D){
    delete addedTexts2D[this.name];
  }
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

  this.xMax = xMax;
  this.yMin = yMin;

  this.twoDimensionalParameters.x = (xMax / screenResolution);
  this.twoDimensionalParameters.y = (yMin / screenResolution);
}

AddedText.prototype.exportLightweight = function(){
  var exportObj = new Object();
  exportObj.name = this.name;
  exportObj.charSize = this.characterSize;
  exportObj.topLeft = this.topLeft;
  exportObj.topRight = this.topRight;
  exportObj.bottomLeft = this.bottomLeft;
  exportObj.bottomRight = this.bottomRight;
  exportObj.position = this.mesh.position;
  exportObj.initPosition = this.position;
  exportObj.isClickable = this.isClickable;
  if (this.is2D){
    if (!this.twoDimensionalSize){
      this.handleResize();
    }
    exportObj.twoDimensionalSize = {x: this.twoDimensionalSize.x, y: this.twoDimensionalSize.y, z: this.twoDimensionalSize.z, w: this.twoDimensionalSize.w};
  }
  return exportObj;
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
  exportObj.hasBackground = this.hasBackground;
  exportObj.refCharOffset = this.refCharOffset;
  exportObj.refLineOffset = this.refLineOffset;
  if (this.hasBackground){
    exportObj.backgroundColorR = this.material.uniforms.backgroundColor.value.r;
    exportObj.backgroundColorG = this.material.uniforms.backgroundColor.value.g;
    exportObj.backgroundColorB = this.material.uniforms.backgroundColor.value.b;
    exportObj.backgroundAlpha = this.material.uniforms.backgroundAlpha.value;
  }
  exportObj.gsName = this.gsName;
  exportObj.isClickable = this.isClickable;
  exportObj.isAffectedByFog = this.isAffectedByFog;
  exportObj.is2D = this.is2D;
  exportObj.shaderMarginX = this.shaderMargin.x;
  exportObj.shaderMarginY = this.shaderMargin.y;
  exportObj.marginMode = this.marginMode;
  exportObj.marginPercentWidth = this.marginPercentWidth;
  exportObj.marginPercentHeight = this.marginPercentHeight;
  exportObj.maxWidthPercent = this.maxWidthPercent;
  exportObj.maxHeightPercent = this.maxHeightPercent;
  var exportDestroyedGrids = new Object();
  for (var gridName in this.destroyedGrids){
    exportDestroyedGrids[gridName] = this.destroyedGrids[gridName].export();
  }
  exportObj["destroyedGrids"] = exportDestroyedGrids;
  if (this.hasCustomPrecision){
    exportObj.hasCustomPrecision = true;
    exportObj.customPrecision = this.customPrecision;
  }
  exportObj.animations = new Object();
  for (var animationName in this.animations){
    exportObj.animations[animationName] = this.animations[animationName].export();
  }
  return exportObj;
}

AddedText.prototype.getGlyphUniform = function(){
  var uuid = this.font.texture.uuid;
  if (textureUniformCache[uuid]){
    return textureUniformCache[uuid];
  }
  var glyphUniform = new THREE.Uniform(this.font.texture);
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

AddedText.prototype.getMarginBetweenChars = function(){
  return this.offsetBetweenChars;
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

AddedText.prototype.getMarginBetweenLines = function(){
  return this.offsetBetweenLines;
}

AddedText.prototype.setMarginBetweenLines = function(value){
  this.offsetBetweenLines = value;
  this.constructText();
  if (this.is2D){
    this.refLineOffset = value;
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
  if (mode == 1 && this.isInput && this.is2D && inputText == this && !this.skipInputAdjustment){
    if (this.isInputLineVisible){
      this.text += "a";
      this.mesh.material.uniforms.inputLineInfo.value.x = this.text.length -1;
    }
  }
  this.constructText();
  this.handleUVUniform();
  if (this.is2D){
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
    this.handleResize();
  }else{
    this.handleBoundingBox();
    if (this.name){
      rayCaster.onAddedTextResize(this);
    }
  }
}

AddedText.prototype.getColor = function(){
  REUSABLE_COLOR.copy(this.material.uniforms.color.value);
  return REUSABLE_COLOR;
}

AddedText.prototype.setColor = function(colorString, fromScript){
  if (fromScript && (typeof this.oldColorR == UNDEFINED)){
    this.oldColorR = this.material.uniforms.color.value.r;
    this.oldColorG = this.material.uniforms.color.value.g;
    this.oldColorB = this.material.uniforms.color.value.b;
  }
  this.material.uniforms.color.value.set(colorString);
}

AddedText.prototype.getAlpha = function(){
  return this.alpha;
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
  if (this.containerParent){
    this.mesh.renderOrder = renderOrders.ELEMENT_IN_CONTAINER;
    this.mesh.material.transparent = true;
  }
}

AddedText.prototype.getBackgroundColor = function(){
  REUSABLE_COLOR.copy(this.material.uniforms.backgroundColor.value);
  return REUSABLE_COLOR;
}

AddedText.prototype.getBackgroundAlpha = function(){
  return this.material.uniforms.backgroundAlpha.value;
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
    this.oldBackgroundStatus = this.hasBackground ? this.hasBackground: false;
  }
  if (!this.hasBackground){
    macroHandler.injectMacro("HAS_BACKGROUND", this.material, false, true);
    this.material.uniforms.backgroundColor = new THREE.Uniform(new THREE.Color(backgroundColorString));
    this.material.uniforms.backgroundAlpha = new THREE.Uniform(backgroundAlpha);
  }else{
    this.material.uniforms.backgroundColor.value.set(backgroundColorString);
    this.material.uniforms.backgroundAlpha.value = backgroundAlpha;
  }
  if (fromScript && this.isBGRemoved){
    macroHandler.injectMacro("HAS_BACKGROUND", this.material, false, true);
    this.isBGRemoved = false;
  }
  if (!fromScript){
    this.hasBackground = true;
  }
}

AddedText.prototype.removeBackground = function(fromScript){
  if (fromScript && (typeof this.oldBackgroundStatus == UNDEFINED)){
    this.oldBackgroundStatus = this.hasBackground ? this.hasBackground: false;
    if (this.oldBackgroundStatus){
      this.oldBackgroundR = this.material.uniforms.backgroundColor.value.r;
      this.oldBackgroundG = this.material.uniforms.backgroundColor.value.g;
      this.oldBackgroundB = this.material.uniforms.backgroundColor.value.b;
      this.oldBackgroundAlpha = this.material.uniforms.backgroundAlpha.value;
    }
  }
  if (this.hasBackground){
    macroHandler.removeMacro("HAS_BACKGROUND", this.material, false, true);
    if (fromScript){
      this.isBGRemoved = true;
    }
  }
  if (!fromScript){
    this.hasBackground = false;
  }
}

AddedText.prototype.getCharSize = function(value){
  return this.characterSize;
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
    if (typeof this.refLineOffset == UNDEFINED){
      this.refLineOffset = this.offsetBetweenLines;
    }
    this.offsetBetweenChars = this.refCharOffset * ((renderer.getCurrentViewport().w)/this.refInnerHeight);
    this.offsetBetweenLines = this.refLineOffset * ((renderer.getCurrentViewport().w)/this.refInnerHeight);
    if (renderer.getCurrentViewport().z / screenResolution < window.innerWidth){
       this.offsetBetweenChars = this.offsetBetweenChars * (window.innerWidth / (renderer.getCurrentViewport().z / screenResolution));
    }
    if (renderer.getCurrentViewport().w / screenResolution < window.innerHeight){
       this.offsetBetweenLines = this.offsetBetweenLines * (window.innerHeight / (renderer.getCurrentViewport().w / screenResolution));
    }
    this.constructText();
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
    if (!(typeof this.maxWidthPercent == UNDEFINED)){
      var iteration = 1;
      while (this.getWidthPercent() > this.maxWidthPercent){
        var a = this.characterSize;
        this.setCharSize((this.characterSize - 0.5));
        this.offsetBetweenChars = this.offsetBetweenChars * (this.characterSize / a);
        this.constructText();
        this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
        iteration ++;
        if (!isDeployment && guiHandler.textManipulationParameters){
          guiHandler.textManipulationParameters["Char size"] = this.characterSize;
          guiHandler.textManipulationParameters["Char margin"] = this.offsetBetweenChars;
        }
      }
    }
    if (!(typeof this.maxHeightPercent == UNDEFINED)){
      var iteration = 1;
      while (this.getHeightPercent() > this.maxHeightPercent){
        var a = this.characterSize;
        this.setCharSize((this.characterSize - 0.5));
        this.offsetBetweenLines = this.offsetBetweenLines * (this.characterSize / a);
        this.constructText();
        this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
        iteration ++;
        if (!isDeployment && guiHandler.textManipulationParameters){
          guiHandler.textManipulationParameters["Char size"] = this.characterSize;
          guiHandler.textManipulationParameters["Line margin"] = this.offsetBetweenLines;
        }
      }
    }
    if (this.rectangle && !(typeof this.rectangle.thicknessOffset == UNDEFINED)){
      this.rectangle.updateMesh(this.rectangle.thicknessOffset);
    }
  }
  if (this.name){
    rayCaster.onAddedTextResize(this);
  }
}

AddedText.prototype.getWidthPercent = function(){
  return (((this.webglSpaceSize.x) * (100)) / (2));
}

AddedText.prototype.getHeightPercent = function(){
  return (((this.webglSpaceSize.y) * (100)) / (2));
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
  var w = width * pointSizePixels /(currentViewport.z / screenResolution);
  var h = height * pointSizePixels / (currentViewport.w / screenResolution);
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
  if (mode == 1 && !IS_WORKER_CONTEXT && rayCaster.isRaycasterWorkerBridge){
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
  this.lastUpdateCameraPosition.copy(camera.position);
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
    this.lastUpdatePosition.z == this.mesh.position.z &&
    this.lastUpdateCameraPosition.x == camera.position.x &&
    this.lastUpdateCameraPosition.y == camera.position.y &&
    this.lastUpdateCameraPosition.z == camera.position.z
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

AddedText.prototype.hideVisually = function(){
  this.mesh.visible = false;
}

AddedText.prototype.showVisually = function(){
  this.mesh.visible = true;
}

AddedText.prototype.hide = function(){
  this.mesh.visible = false;
  this.isHidden = true;
  if (mode == 0 && this.bbHelper){
    scene.remove(this.bbHelper);
  }
  if (mode == 0 && this.rectangle){
    scene.remove(this.rectangle.mesh);
  }
  if (mode == 1 && this.isClickable && this.name){
    rayCaster.hide(this);
  }
}

AddedText.prototype.show = function(){
  this.mesh.visible = true;
  this.isHidden = false;
  if (mode == 1 && this.isClickable){
    if (!this.boundingBox){
      this.handleBoundingBox();
    }
    if (this.name){
      rayCaster.show(this);
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
    this.hasBackground = this.oldBackgroundStatus;
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
    if (this.isBGRemoved){
      macroHandler.injectMacro("HAS_BACKGROUND", this.material, false, true);
      this.isBGRemoved = false;
    }
  }
  if (!this.is2D){
    this.setPosition(this.position.x, this.position.y, this.position.z);
  }else{
    this.setPosition(this.originalMarginX, this.originalMarginY);
    delete this.originalMarginX;
    delete this.originalMarginY;
  }
}

AddedText.prototype.firstNChars = function(originalText, n){
  n = parseInt(n);
  this.setText(originalText.substring(0, n), false);
}

AddedText.prototype.setAffectedByFog = function(val){
  this.isAffectedByFog = val;
}

AddedText.prototype.set2DStatus = function(is2D){
  if (is2D == this.is2D){
    return;
  }
  this.is2D = is2D;
  if (is2D){
    macroHandler.injectMacro("IS_TWO_DIMENSIONAL", this.material, true, true);
    this.set2DCoordinates(this.marginPercentWidth, this.marginPercentHeight);
    if (typeof this.oldIsClickable == UNDEFINED){
      this.oldIsClickable = this.isClickable;
    }
    this.isClickable = false;
    if (!!this.name){
      addedTexts2D[this.name] = this;
    }
    delete this.mesh.material.uniforms.cameraQuaternion;
    delete this.mesh.material.uniforms.modelViewMatrix;
    delete this.mesh.material.uniforms.projectionMatrix;
    this.mesh.material.uniforms.inputLineInfo = new THREE.Uniform(new THREE.Vector2(-500, -500));
    this.mesh.material.uniforms.currentViewport = GLOBAL_VIEWPORT_UNIFORM;
    this.mesh.renderOrder = renderOrders.TEXT_2D;
  }else{
    macroHandler.removeMacro("IS_TWO_DIMENSIONAL", this.material, true, true);
    this.mesh.material.uniforms.cameraQuaternion = GLOBAL_CAMERA_QUATERNION_UNIFORM;
    this.mesh.material.uniforms.projectionMatrix = GLOBAL_PROJECTION_UNIFORM;
    this.mesh.material.uniforms.modelViewMatrix = new THREE.Uniform(new THREE.Matrix4());
    this.mesh.material.uniforms.modelViewMatrix.value = this.mesh.modelViewMatrix;
    delete this.mesh.material.uniforms.margin2D;
    delete this.mesh.material.uniforms.inputLineInfo;
    delete this.mesh.material.uniforms.currentViewport;
    this.isClickable = this.oldIsClickable;
    delete this.oldIsClickable;
    if (!(typeof this.refCharOffset == UNDEFINED)){
      this.setMarginBetweenChars(this.refCharOffset);
      delete this.refCharOffset;
    }
    if (!(typeof this.refLineOffset == UNDEFINED)){
      this.setMarginBetweenLines(this.refLineOffset);
      delete this.refLineOffset;
    }
    if (!!this.name){
      delete addedTexts2D[this.name];
    }
    this.mesh.renderOrder = renderOrders.TEXT_3D;
  }
  if (is2D){
    if (this.bbHelper){
      scene.remove(this.bbHelper);
    }
  }
}

AddedText.prototype.set2DCoordinates = function(marginPercentWidth, marginPercentHeight){
  GLOBAL_VIEWPORT_UNIFORM.value.set(0, 0, window.innerWidth * screenResolution, window.innerHeight * screenResolution);
  this.marginPercentWidth = marginPercentWidth;
  this.marginPercentHeight = marginPercentHeight;
  var isFromLeft = false, isFromTop = false, isFromCenter = false;
  if (this.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    isFromLeft = true;
    isFromTop = true;
  }else if (this.marginMode == MARGIN_MODE_2D_CENTER){
    isFromCenter = true;
  }
  var curViewport = REUSABLE_QUATERNION.set(0, 0, window.innerWidth, window.innerHeight);
  if (isFromLeft){
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + this.twoDimensionalParameters.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.characterSize / (renderer.getCurrentViewport().z / screenResolution));
    this.cSizeX = cSizeX;
    marginX += cSizeX;
    if (marginX + widthX > 1){
      marginX = 1 - widthX - cSizeX;
    }
    this.setShaderMargin(true, marginX);
  }else if (!isFromCenter){
    marginPercentWidth = marginPercentWidth + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + this.twoDimensionalParameters.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.characterSize / (renderer.getCurrentViewport().z / screenResolution));
    this.cSizeX = cSizeX;
    marginX += cSizeX + widthX;
    marginX = 2 - marginX;
    if (marginX < -1){
      marginX = -1 + cSizeX;
    }
    this.setShaderMargin(true, marginX);
  }else{
    marginPercentWidth = marginPercentWidth + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + this.twoDimensionalParameters.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.characterSize / (renderer.getCurrentViewport().z / screenResolution));
    this.cSizeX = cSizeX;
    marginX += (widthX / 2);
    marginX = 2 - marginX;
    if (marginX < -1){
      marginX = -1 + cSizeX;
    }
    this.setShaderMargin(true, marginX);
  }
  if (isFromTop){
    marginPercentHeight = 100 - marginPercentHeight;
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + this.twoDimensionalParameters.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.characterSize / (renderer.getCurrentViewport().w / screenResolution));
    this.cSizeY = cSizeY;
    marginY -= cSizeY;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.setShaderMargin(false, marginY);
  }else if (!isFromCenter){
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + this.twoDimensionalParameters.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.characterSize / (renderer.getCurrentViewport().w / screenResolution));
    this.cSizeY = cSizeY;
    marginY -= cSizeY;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.setShaderMargin(false, marginY);
  }else{
    marginPercentHeight = 100 - marginPercentHeight;
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + this.twoDimensionalParameters.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.characterSize / (renderer.getCurrentViewport().w / screenResolution));
    this.cSizeY = cSizeY;
    marginY -= heightY / 2;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.setShaderMargin(false, marginY);
  }

  // CONVERTED FROM TEXT VERTEX SHADER CODE
  var oldPosX = ((GLOBAL_VIEWPORT_UNIFORM.value.z - GLOBAL_VIEWPORT_UNIFORM.value.x) / 2.0) + GLOBAL_VIEWPORT_UNIFORM.value.x + this.xMax;
  var oldPosY = ((GLOBAL_VIEWPORT_UNIFORM.value.w - GLOBAL_VIEWPORT_UNIFORM.value.y) / 2.0) + GLOBAL_VIEWPORT_UNIFORM.value.y + this.yMin;
  var x = (((oldPosX - GLOBAL_VIEWPORT_UNIFORM.value.x) * 2.0) / GLOBAL_VIEWPORT_UNIFORM.value.z) - 1.0;
  var y = (((oldPosY - GLOBAL_VIEWPORT_UNIFORM.value.y) * 2.0) / GLOBAL_VIEWPORT_UNIFORM.value.w) - 1.0;
  this.twoDimensionalSize.z = x + this.shaderMargin.x + this.cSizeX;
  this.twoDimensionalSize.w = y + this.shaderMargin.y - this.cSizeY;
  oldPosX = ((GLOBAL_VIEWPORT_UNIFORM.value.z - GLOBAL_VIEWPORT_UNIFORM.value.x) / 2.0) + GLOBAL_VIEWPORT_UNIFORM.value.x;
  oldPosY = ((GLOBAL_VIEWPORT_UNIFORM.value.w - GLOBAL_VIEWPORT_UNIFORM.value.y) / 2.0) + GLOBAL_VIEWPORT_UNIFORM.value.y;
  x = (((oldPosX - GLOBAL_VIEWPORT_UNIFORM.value.x) * 2.0) / GLOBAL_VIEWPORT_UNIFORM.value.z) - 1.0;
  y = (((oldPosY - GLOBAL_VIEWPORT_UNIFORM.value.y) * 2.0) / GLOBAL_VIEWPORT_UNIFORM.value.w) - 1.0;
  this.twoDimensionalSize.x = x + this.shaderMargin.x - this.cSizeX;
  this.twoDimensionalSize.y = y + this.shaderMargin.y + this.cSizeY;
  this.webglSpaceSize.set(
    this.twoDimensionalSize.z - this.twoDimensionalSize.x,
    this.twoDimensionalSize.y - this.twoDimensionalSize.w
  );
  if (!this.rectangle){
    this.rectangle = new Rectangle(0, 0, 0, 0);
  }
  this.rectangle = this.rectangle.set(
    this.twoDimensionalSize.x, this.twoDimensionalSize.y,
    this.twoDimensionalSize.z, this.twoDimensionalSize.w,
    this.webglSpaceSize.x, this.webglSpaceSize.y
  );
  this.rectangle.updateMesh(0.005);
  if (this.name){
    rayCaster.updateObject(this);
  }
}

AddedText.prototype.debugCornerPoints = function(representativeCharacter, cornerIndex){
  this.handleResize();
  if (cornerIndex == 0){
    representativeCharacter.setShaderMargin(true, this.twoDimensionalSize.x);
    representativeCharacter.setShaderMargin(false, this.twoDimensionalSize.y);
  }else{
    representativeCharacter.setShaderMargin(true, this.twoDimensionalSize.z);
    representativeCharacter.setShaderMargin(false, this.twoDimensionalSize.w);
  }
}

AddedText.prototype.setShaderMargin = function(isMarginX, value){
  if (!this.mesh.material.uniforms.margin2D){
    this.mesh.material.uniforms.margin2D = new THREE.Uniform(new THREE.Vector2());
    this.mesh.material.needsUpdate = true;
  }
  if (isMarginX){
    this.shaderMargin.x = value;
    this.mesh.material.uniforms.margin2D.value.x = value;
  }else{
    this.shaderMargin.y = value;
    this.mesh.material.uniforms.margin2D.value.y = value;
  }
}

AddedText.prototype.setFog = function(){
  if (this.is2D || !this.isAffectedByFog){
    return;
  }
  if (!this.mesh.material.uniforms.fogInfo){
    macroHandler.injectMacro("HAS_FOG", this.material, false, true);
    this.mesh.material.uniforms.fogInfo = GLOBAL_FOG_UNIFORM;
  }
  if (fogHandler.isFogBlendingWithSkybox()){
    if (!this.mesh.material.uniforms.cubeTexture){
      macroHandler.injectMacro("HAS_SKYBOX_FOG", this.material, true, true);
      this.mesh.material.uniforms.worldMatrix = new THREE.Uniform(this.mesh.matrixWorld);
      this.mesh.material.uniforms.cubeTexture = GLOBAL_CUBE_TEXTURE_UNIFORM;
      this.mesh.material.uniforms.cameraPosition = GLOBAL_CAMERA_POSITION_UNIFORM;
    }
  }
  this.mesh.material.needsUpdate = true;
}

AddedText.prototype.removeFog = function(){
  if (this.is2D || !this.isAffectedByFog){
    return;
  }
  macroHandler.removeMacro("HAS_FOG", this.material, false, true);
  macroHandler.removeMacro("HAS_SKYBOX_FOG", this.material, true, true);
  delete this.mesh.material.uniforms.fogInfo;
  delete this.mesh.material.uniforms.cubeTexture;
  delete this.mesh.material.uniforms.worldMatrix;
  delete this.mesh.material.uniforms.cameraPosition;
  this.mesh.material.needsUpdate = true;
}
