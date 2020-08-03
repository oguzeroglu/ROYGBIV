var Sprite = function(name){
  this.isSprite = true;
  this.name = name;
  this.triangle1 = new THREE.Triangle();
  this.triangle2 = new THREE.Triangle();
  this.reusableVector1 = new THREE.Vector3();
  this.reusableVector2 = new THREE.Vector3();
  this.reusableVector3 = new THREE.Vector3();
  this.reusableVector4 = new THREE.Vector3();
  this.reusableVector5 = new THREE.Vector3();
  if (IS_WORKER_CONTEXT){
    return;
  }
  this.geometry = geometryCache["SPRITE_GEOMETRY"];
  if (!this.geometry){
    this.geometry = new THREE.PlaneBufferGeometry(100, 100);
    geometryCache["SPRITE_GEOMETRY"] = this.geometry;
  }
  this.mesh = new MeshGenerator().generateSprite(this);
  this.marginMode = MARGIN_MODE_2D_CENTER;
  this.handleRectangle();
  this.set2DCoordinates(50, 50);
  scene.add(this.mesh);
  this.mesh.visible = true;
  this.animations = new Object();
  webglCallbackHandler.registerEngineObject(this);
}

Sprite.prototype.onTextureAtlasRefreshed = function(){
  if (!this.isTextured){
    return;
  }

  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
  var newRanges = textureAtlasHandler.getRangesForTexturePack(texturePacks[this.mappedTexturePackName], "diffuse");
  this.mesh.material.uniforms.uvRanges.value.set(newRanges.startU, newRanges.startV, newRanges.endU, newRanges.endV);
}

Sprite.prototype.copyAnimationsFromObject = function(sprite){
  this.animations = new Object();

  for (var animName in sprite.animations){
    this.addAnimation(sprite.animations[animName].copyWithAnotherObject(this));
  }
}

Sprite.prototype.setHeightPercent = function(heightPercent){
  this.setScale(this.mesh.material.uniforms.scale.value.x ,this.mesh.material.uniforms.scale.value.y * heightPercent / this.calculateHeightPercent());
  this.handleRectangle();
  if (mode == 0 || this.isClickable){
    rayCaster.updateObject(this);
  }
}

Sprite.prototype.setWidthPercent = function(widthPercent){
  this.setScale(this.mesh.material.uniforms.scale.value.x * widthPercent / this.calculateWidthPercent(), this.mesh.material.uniforms.scale.value.y);
  this.handleRectangle();
  if (mode == 0 || this.isClickable){
    rayCaster.updateObject(this);
  }
}

Sprite.prototype.calculateHeightPercent = function(){
  return this.rectangle.height * 100 / 2;
}

Sprite.prototype.calculateWidthPercent = function(){
  return this.rectangle.width * 100 / 2;
}

Sprite.prototype.show = function(){
  if (this.mesh.visible){
    return;
  }
  this.mesh.visible = true;
  this.isHidden = false;
  if (this.isClickable){
    rayCaster.show(this);
  }
}

Sprite.prototype.hide = function(){
  if (!this.mesh.visible){
    return;
  }
  this.mesh.visible = false;
  this.isHidden = true;
  if (this.isClickable){
    rayCaster.hide(this);
  }
}

Sprite.prototype.cross2 = function(points, triangle) {
  var pa = points.a;
  var pb = points.b;
  var pc = points.c;
  var p0 = triangle.a;
  var p1 = triangle.b;
  var p2 = triangle.c;
  var dXa = pa.x - p2.x;
  var dYa = pa.y - p2.y;
  var dXb = pb.x - p2.x;
  var dYb = pb.y - p2.y;
  var dXc = pc.x - p2.x;
  var dYc = pc.y - p2.y;
  var dX21 = p2.x - p1.x;
  var dY12 = p1.y - p2.y;
  var D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
  var sa = dY12 * dXa + dX21 * dYa;
  var sb = dY12 * dXb + dX21 * dYb;
  var sc = dY12 * dXc + dX21 * dYc;
  var ta = (p2.y - p0.y) * dXa + (p0.x - p2.x) * dYa;
  var tb = (p2.y - p0.y) * dXb + (p0.x - p2.x) * dYb;
  var tc = (p2.y - p0.y) * dXc + (p0.x - p2.x) * dYc;
  if (D < 0){
    return ((sa >= 0 && sb >= 0 && sc >= 0) ||
            (ta >= 0 && tb >= 0 && tc >= 0) ||
            (sa+ta <= D && sb+tb <= D && sc+tc <= D));
  }
  return ((sa <= 0 && sb <= 0 && sc <= 0) ||
          (ta <= 0 && tb <= 0 && tc <= 0) ||
          (sa+ta >= D && sb+tb >= D && sc+tc >= D));
}

Sprite.prototype.intersectionTest = function(sprite){
  return (!(this.cross2(this.triangle1, sprite.triangle1) || this.cross2(sprite.triangle1, this.triangle1))) ||
         (!(this.cross2(this.triangle1, sprite.triangle2) || this.cross2(sprite.triangle2, this.triangle1))) ||
         (!(this.cross2(this.triangle2, sprite.triangle1) || this.cross2(sprite.triangle1, this.triangle2))) ||
         (!(this.cross2(this.triangle2, sprite.triangle2) || this.cross2(sprite.triangle2, this.triangle2)));
}

Sprite.prototype.onDragStarted = function(diffX, diffY){
  if (this.draggingDisabled){
    return;
  }
  draggingSprite = this;
  if (this.dragStartCallback){
    this.dragStartCallback(diffX, diffY);
  }
}

Sprite.prototype.onDragStopped = function(){
  if (this.draggingDisabled){
    return;
  }
  draggingSprite = false;
  if (this.dragStopCallback){
    this.dragStopCallback();
  }
}

Sprite.prototype.onDrag = function(diffX, diffY){
  if (this.draggingDisabled){
    return;
  }
  var delim = isMobile? 1: screenResolution;
  var width = renderer.getCurrentViewport().z / delim;
  var height = renderer.getCurrentViewport().w / delim;
  var diffXPercent = (((diffX) * (100)) / (width));
  var diffYPercent = (((diffY) * (100)) / (height));
  if (this.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    diffXPercent = -1 * diffXPercent;
  }else if (this.marginMode == MARGIN_MODE_2D_BOTTOM_RIGHT){
    diffYPercent = -1 * diffYPercent;
  }
  this.set2DCoordinates(this.marginPercentX - diffXPercent, this.marginPercentY + diffYPercent);
  if (this.draggingCallback){
    this.draggingCallback();
  }
}

Sprite.prototype.addAnimation = function(animation){
  this.animations[animation.name] = animation;
}

Sprite.prototype.removeAnimation = function(animation){
  delete this.animations[animation.name];
}

Sprite.prototype.setCropCoefficient = function(coefX, coefY){
  this.cropCoefficientX = coefX;
  this.cropCoefficientY = coefY;
  this.handleRectangle();
  rayCaster.updateObject(this);
}

Sprite.prototype.handleResize = function(){
  var newHeight = (renderer.getCurrentViewport().w / screenResolution);
  this.mesh.material.uniforms.scaleCoef.value = newHeight / this.refHeight;
  this.handleRectangle();
  if (!(typeof this.fixedWidth == UNDEFINED)){
    this.setWidthPercent(this.fixedWidth);
  }
  if (!(typeof this.fixedHeight == UNDEFINED)){
    this.setHeightPercent(this.fixedHeight);
  }
  if (this.rectangle && !(typeof this.rectangle.thicknessOffset == UNDEFINED)){
    this.rectangle.updateMesh(this.rectangle.thicknessOffset);
  }
  if (mode == 1){
    this.originalSizeInfo.x = this.mesh.material.uniforms.scale.value.x;
    this.originalSizeInfo.y = this.mesh.material.uniforms.scale.value.y;
  }
}

Sprite.prototype.setRefHeight = function(){
  this.refHeight = (renderer.getCurrentViewport().w / screenResolution);
}

Sprite.prototype.getColor = function(){
  REUSABLE_COLOR.copy(this.mesh.material.uniforms.color.value);
  return REUSABLE_COLOR;
}

Sprite.prototype.export = function(){
  var animations = new Object();
  for (var animationName in this.animations){
    animations[animationName] = this.animations[animationName].export();
  }
  return {
    name: this.name,
    color: "#" + this.mesh.material.uniforms.color.value.getHexString(),
    alpha: this.mesh.material.uniforms.alpha.value,
    marginMode: this.marginMode,
    marginPercentX: this.marginPercentX,
    marginPercentY: this.marginPercentY,
    isTextured: this.isTextured,
    mappedTexturePackName: this.mappedTexturePackName,
    scaleX: this.mesh.material.uniforms.scale.value.x,
    scaleY: this.mesh.material.uniforms.scale.value.y,
    rotation: this.mesh.material.uniforms.rotationAngle.value,
    isClickable: this.isClickable,
    isDraggable: this.isDraggable,
    refHeight: this.refHeight,
    cropCoefficientX: this.cropCoefficientX,
    cropCoefficientY: this.cropCoefficientY,
    animations: animations,
    fixedWidth: this.fixedWidth,
    fixedHeight: this.fixedHeight,
    originalWidth: this.originalWidth,
    originalHeight: this.originalHeight,
    originalWidthReference: this.originalWidthReference,
    originalHeightReference: this.originalHeightReference,
    originalScreenResolution: this.originalScreenResolution
  };
}

Sprite.prototype.showVisually = function(){
  this.mesh.visible = true;
  this.isHidden = false;
}


Sprite.prototype.hideVisually = function(){
  this.mesh.visible = false;
  this.isHidden = true;
}

Sprite.prototype.exportLightweight = function(){
  this.handleRectangle();
  return {
    x: this.rectangle.x,
    y: this.rectangle.y,
    finalX: this.rectangle.finalX,
    finalY: this.rectangle.finalY,
    width: this.rectangle.width,
    height: this.rectangle.height,
    triangle1: {
      a: this.triangle1.a,
      b: this.triangle1.b,
      c: this.triangle1.c
    },
    triangle2: {
      a: this.triangle2.a,
      b: this.triangle2.b,
      c: this.triangle2.c
    },
    clickable: this.isClickable
  };
}

Sprite.prototype.destroy = function(){
  scene.remove(this.mesh);
  this.mesh.material.dispose();
  this.mesh.geometry.dispose();
  if (this.rectangle){
    scene.remove(this.rectangle.mesh);
    this.rectangle.material.dispose();
    this.rectangle.geometry.dispose();
  }
  if (!this.isBackgroundObject){
    delete sprites[this.name];
  }
}

Sprite.prototype.setColor = function(color){
  this.mesh.material.uniforms.color.value.set(color);
}

Sprite.prototype.setAlpha = function(alpha){
  if (alpha > 1){
    alpha = 1;
  }
  if (alpha < 0){
    alpha = 0;
  }
  if (alpha != 1){
    this.mesh.material.transparent = true;
  }else{
    this.mesh.material.transparent = false;
  }
  this.mesh.material.uniforms.alpha.value = alpha;
  if (this.containerParent){
    this.mesh.renderOrder = renderOrders.ELEMENT_IN_CONTAINER;
    this.mesh.material.transparent = true;
  }
}

Sprite.prototype.getMarginXPercent = function(){
  var marginX = this.marginPercentX;
  if (this.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    marginX -= (this.calculateWidthPercent() / 2);
  }else if (this.marginMode == MARGIN_MODE_2D_BOTTOM_RIGHT){
    marginX += (this.calculateWidthPercent() / 2);
  }
  return marginX;
}

Sprite.prototype.getMarginYPercent = function(){
  var marginY = this.marginPercentY;
  if (this.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    marginY += (this.calculateHeightPercent() / 2);
  }else if (this.marginMode == MARGIN_MODE_2D_BOTTOM_RIGHT){
    marginY -= (this.calculateHeightPercent() / 2);
  }
  return marginY;
}

Sprite.prototype.set2DCoordinates = function(marginPercentX, marginPercentY){
  GLOBAL_VIEWPORT_UNIFORM.value.set(0, 0, window.innerWidth * screenResolution, window.innerHeight * screenResolution);
  this.marginPercentX = marginPercentX;
  this.marginPercentY = marginPercentY;
  var isFromLeft = false, isFromTop = false, isFromCenter = false;
  if (this.marginMode == MARGIN_MODE_2D_TOP_LEFT){
    isFromLeft = true;
    isFromTop = true;
  }else if (this.marginMode == MARGIN_MODE_2D_CENTER){
    isFromCenter = true;
  }
  var curViewport = REUSABLE_QUATERNION.set(0, 0, window.innerWidth, window.innerHeight);
  if (isFromLeft){
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + (this.rectangle.width / screenResolution);
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentX) * (2)) / (100)) -1;
    marginX += this.rectangle.width / 2;
    this.mesh.material.uniforms.margin.value.x = marginX;
  }else if (!isFromCenter){
    marginPercentX = marginPercentX + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + (this.rectangle.width / screenResolution);
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentX) * (2)) / (100)) -1;
    marginX = 2 - marginX - (this.rectangle.width / 2);
    this.mesh.material.uniforms.margin.value.x = marginX;
  }else{
    marginPercentX = marginPercentX + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x + (this.rectangle.width / screenResolution);
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentX) * (2)) / (100)) -1;
    marginX += (widthX / 2);
    marginX = 2 - marginX;
    this.mesh.material.uniforms.margin.value.x = marginX;
  }
  if (isFromTop){
    marginPercentY = 100 - marginPercentY;
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + (this.rectangle.height / screenResolution);
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentY) * (2)) / (100)) -1;
    marginY -= this.rectangle.height / 2;
    this.mesh.material.uniforms.margin.value.y = marginY;
  }else if (!isFromCenter){
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + (this.rectangle.height / screenResolution);
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentY) * (2)) / (100)) -1;
    marginY += this.rectangle.height / 2;
    this.mesh.material.uniforms.margin.value.y = marginY;
  }else{
    marginPercentY = 100 - marginPercentY;
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y + (this.rectangle.height / screenResolution);
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentY) * (2)) / (100)) -1;
    marginY -= heightY / 2;
    this.mesh.material.uniforms.margin.value.y = marginY;
  }
  this.handleRectangle();
  if (mode == 0 || (mode == 1 && this.isClickable)){
    rayCaster.updateObject(this);
  }
}

Sprite.prototype.getCornerPoint = function(point){
  // CONVERTED FROM GLSL SHADER CODE
  var scaledX = screenResolution * this.mesh.material.uniforms.scale.value.x * this.mesh.material.uniforms.scaleCoef.value * point.x;
  var scaledY = screenResolution * this.mesh.material.uniforms.scale.value.y * this.mesh.material.uniforms.scaleCoef.value * point.y;
  if (!(typeof this.cropCoefficientX == UNDEFINED)){
    scaledX *= this.cropCoefficientX;
  }
  if (!(typeof this.cropCoefficientY == UNDEFINED)){
    scaledY *= this.cropCoefficientY;
  }
  var rotationAngle = this.mesh.material.uniforms.rotationAngle.value;
  rotationAngle = 360 - rotationAngle;
  var rotationInRadians = rotationAngle * Math.PI / 180;
  this.reusableVector5.set(scaledX * Math.cos(rotationInRadians) + scaledY * Math.sin(rotationInRadians), scaledY * Math.cos(rotationInRadians) - scaledX * Math.sin(rotationInRadians));
  var rotated = this.reusableVector5;
  var currentViewport = this.mesh.material.uniforms.currentViewport.value;
  var oldPosX = ((currentViewport.z - currentViewport.x) / 2.0) + currentViewport.x + rotated.x;
  var oldPosY = ((currentViewport.w - currentViewport.y) / 2.0) + currentViewport.y + rotated.y;
  var x = (((oldPosX - currentViewport.x) * 2.0) / currentViewport.z) - 1.0;
  var y = (((oldPosY - currentViewport.y) * 2.0) / currentViewport.w) - 1.0;
  point.x = x + this.mesh.material.uniforms.margin.value.x;
  point.y = y + this.mesh.material.uniforms.margin.value.y;
}

Sprite.prototype.handleRectangle = function(){
  GLOBAL_VIEWPORT_UNIFORM.value.set(0, 0, window.innerWidth * screenResolution, window.innerHeight * screenResolution);
  if (!this.rectangle){
    this.rectangle = new Rectangle(0, 0, 0, 0);
  }
  var points = this.mesh.geometry.attributes.position.array;
  this.reusableVector1.set(points[0], points[1], 0);
  this.reusableVector2.set(points[3], points[4], 0);
  this.reusableVector3.set(points[6], points[7], 0);
  this.reusableVector4.set(points[9], points[10], 0);
  this.getCornerPoint(this.reusableVector1);
  this.getCornerPoint(this.reusableVector2);
  this.getCornerPoint(this.reusableVector3);
  this.getCornerPoint(this.reusableVector4);
  this.triangle1.set(this.reusableVector1, this.reusableVector3, this.reusableVector2);
  this.triangle2.set(this.reusableVector3, this.reusableVector4, this.reusableVector2);
  var minX = Math.min(this.reusableVector1.x, this.reusableVector2.x, this.reusableVector3.x, this.reusableVector4.x);
  var minY = Math.min(this.reusableVector1.y, this.reusableVector2.y, this.reusableVector3.y, this.reusableVector4.y);
  var maxX = Math.max(this.reusableVector1.x, this.reusableVector2.x, this.reusableVector3.x, this.reusableVector4.x);
  var maxY = Math.max(this.reusableVector1.y, this.reusableVector2.y, this.reusableVector3.y, this.reusableVector4.y);
  this.rectangle = this.rectangle.set(minX, minY, maxX, maxY, maxX - minX, maxY - minY);
  this.rectangle.updateMesh(0.005);
}

Sprite.prototype.onBeforeContainerInsertion = function(){
  this.savedScaleX = this.mesh.material.uniforms.scale.value.x;
  this.savedScaleY = this.mesh.material.uniforms.scale.value.y;
}

Sprite.prototype.setScale = function(scaleX, scaleY){
  this.mesh.material.uniforms.scale.value.set(scaleX, scaleY);
  this.handleRectangle();
  this.set2DCoordinates(this.marginPercentX, this.marginPercentY);
  rayCaster.updateObject(this);
}

Sprite.prototype.setRotation = function(angleInDegrees){
  this.mesh.material.uniforms.rotationAngle.value = angleInDegrees;
  this.handleRectangle();
  if (mode == 0 || (mode == 1 && this.isClickable)){
    rayCaster.updateObject(this);
  }
}

Sprite.prototype.getTextureUniform = function(texture){
  if (textureUniformCache[texture.uuid]){
    return textureUniformCache[texture.uuid];
  }
  var uniform = new THREE.Uniform(texture);
  textureUniformCache[texture.uuid] = uniform;
  return uniform;
}

Sprite.prototype.mapTexture = function(texturePack){
  if (!this.isTextured){
    macroHandler.injectMacro("HAS_TEXTURE", this.mesh.material, true, true);
    macroHandler.injectMacro("TEXTURE_SIZE " + ACCEPTED_TEXTURE_SIZE, this.mesh.material, false, true);
    this.mesh.material.needsUpdate = true;
  }
  var ranges;
  if (!texturePack.isDynamic){
    ranges = textureAtlasHandler.getRangesForTexturePack(texturePack, "diffuse");
    this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
  }else{
    ranges = DEFAULT_UV_RANGE;
    this.mesh.material.uniforms.texture = this.getTextureUniform(texturePack.diffuseTexture);
  }
  if (this.mesh.material.uniforms.uvRanges){
    this.mesh.material.uniforms.uvRanges.value.set(ranges.startU, ranges.startV, ranges.endU, ranges.endV);
  }else{
    this.mesh.material.uniforms.uvRanges = new THREE.Uniform(new THREE.Vector4(ranges.startU, ranges.startV, ranges.endU, ranges.endV));
  }
  this.isTextured = true;
  this.mappedTexturePackName = texturePack.name;
}

Sprite.prototype.removeTexture = function(){
  if (!this.isTextured){
    return;
  }
  macroHandler.removeMacro("HAS_TEXTURE", this.mesh.material, true, true);
  delete this.mesh.material.uniforms.texture;
  delete this.mesh.material.uniforms.uvRanges;
  this.mesh.material.needsUpdate = true;
  this.isTextured = false;
  delete this.mappedTexturePackName;
}
