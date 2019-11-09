var Sprite = function(name){
  this.isSprite = true;
  this.name = name;
  this.size = 100;
  this.shaderMargin = new THREE.Vector2();
  this.twoDimensionalSize = new THREE.Vector4();
  this.webglSpaceSize = new THREE.Vector2();
  this.marginMode = MARGIN_MODE_2D_TEXT_CENTER;
  this.makeMesh();
  this.set2DCoordinates(50, 50);
}

Sprite.prototype.makeMesh = function(){
  this.geometry = new THREE.BufferGeometry();
  this.geometry.addAttribute("pseudo", new THREE.BufferAttribute(new Float32Array(1), 1));
  this.geometry.setDrawRange(0, 1);
  this.mesh = new MeshGenerator().generateSprite(this);
  scene.add(this.mesh);
}

Sprite.prototype.setShaderMargin = function(isMarginX, value){
  if (isMarginX){
    this.shaderMargin.x = value;
    this.mesh.material.uniforms.margin2D.value.x = value;
  }else{
    this.shaderMargin.y = value;
    this.mesh.material.uniforms.margin2D.value.y = value;
  }
}

Sprite.prototype.set2DCoordinates = function(marginPercentWidth, marginPercentHeight){
  GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.set(0, 0, window.innerWidth * screenResolution, window.innerHeight * screenResolution);
  this.marginPercentWidth = marginPercentWidth;
  this.marginPercentHeight = marginPercentHeight;
  var isFromLeft = false, isFromTop = false, isFromCenter = false;
  if (this.marginMode == MARGIN_MODE_2D_TEXT_TOP_LEFT){
    isFromLeft = true;
    isFromTop = true;
  }else if (this.marginMode == MARGIN_MODE_2D_TEXT_CENTER){
    isFromCenter = true;
  }
  var curViewport = REUSABLE_QUATERNION.set(0, 0, window.innerWidth, window.innerHeight);
  if (isFromLeft){
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.size / (renderer.getCurrentViewport().z / screenResolution));
    this.cSizeX = cSizeX;
    marginX += cSizeX;
    if (marginX + widthX > 1){
      marginX = 1 - widthX - cSizeX;
    }
    this.setShaderMargin(true, marginX);
  }else if (!isFromCenter){
    marginPercentWidth = marginPercentWidth + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.size / (renderer.getCurrentViewport().z / screenResolution));
    this.cSizeX = cSizeX;
    marginX += cSizeX + widthX;
    marginX = 2 - marginX;
    if (marginX < -1){
      marginX = -1 + cSizeX;
    }
    this.setShaderMargin(true, marginX);
  }else{
    marginPercentWidth = marginPercentWidth + 100;
    var tmpX = ((curViewport.z - curViewport.x) / 2.0) + curViewport.x;
    var widthX = (((tmpX - curViewport.x) * 2.0) / curViewport.z) - 1.0;
    var marginX = (((marginPercentWidth) * (2)) / (100)) -1;
    var cSizeX = (this.size / (renderer.getCurrentViewport().z / screenResolution));
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
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.size / (renderer.getCurrentViewport().w / screenResolution));
    this.cSizeY = cSizeY;
    marginY -= cSizeY;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.setShaderMargin(false, marginY);
  }else if (!isFromCenter){
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.size / (renderer.getCurrentViewport().w / screenResolution));
    this.cSizeY = cSizeY;
    marginY -= cSizeY;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.setShaderMargin(false, marginY);
  }else{
    marginPercentHeight = 100 - marginPercentHeight;
    var tmpY = ((curViewport.w - curViewport.y) / 2.0) + curViewport.y;
    var heightY = (((tmpY - curViewport.y) * 2.0) / curViewport.w) - 1.0;
    var marginY = (((marginPercentHeight) * (2)) / (100)) -1;
    var cSizeY = (this.size / (renderer.getCurrentViewport().w / screenResolution));
    this.cSizeY = cSizeY;
    marginY -= heightY / 2;
    if (marginY + heightY < -1){
      marginY = -1 - heightY + cSizeY;
    }
    this.setShaderMargin(false, marginY);
  }

  // CONVERTED FROM TEXT VERTEX SHADER CODE
  var oldPosX = ((GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.z - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.x) / 2.0) + GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.x;
  var oldPosY = ((GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.w - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.y) / 2.0) + GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.y;
  var x = (((oldPosX - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.x) * 2.0) / GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.z) - 1.0;
  var y = (((oldPosY - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.y) * 2.0) / GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.w) - 1.0;
  this.twoDimensionalSize.z = x + this.shaderMargin.x + this.cSizeX;
  this.twoDimensionalSize.w = y + this.shaderMargin.y - this.cSizeY;
  oldPosX = ((GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.z - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.x) / 2.0) + GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.x;
  oldPosY = ((GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.w - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.y) / 2.0) + GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.y;
  x = (((oldPosX - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.x) * 2.0) / GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.z) - 1.0;
  y = (((oldPosY - GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.y) * 2.0) / GLOBAL_ADDEDTEXT_VIEWPORT_UNIFORM.value.w) - 1.0;
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
}
