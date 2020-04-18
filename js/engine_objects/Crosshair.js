var Crosshair = function(configurations){
  this.isCrosshair = true;
  this.configurations = JSON.parse(JSON.stringify(configurations));
  var name = configurations.name;
  var texturePack = texturePacks[configurations.texture];

  var size = this.configurations.size;

  this.maxWidthPercent = configurations.maxWidthPercent;
  this.maxHeightPercent = configurations.maxHeightPercent;

  this.texture = new THREE.Texture();
  this.texturePack = texturePack;
  this.name = name;
  this.sizeAmount = size;

  this.size = new Float32Array(1);
  this.size[0] = size;

  this.sizeBufferAttribute = new THREE.BufferAttribute(this.size, 1);
  this.sizeBufferAttribute.setDynamic(false);

  this.geometry = new THREE.BufferGeometry();
  this.geometry.addAttribute("size", this.sizeBufferAttribute);
  this.geometry.setDrawRange(0, 1);

  var ranges = textureAtlasHandler.getRangesForTexturePack(this.texturePack, "diffuse");

  this.mesh = new MeshGenerator().generateCrosshair(this, ranges);

  this.material = this.mesh.material;

  this.texture.center.set(0.5, 0.5);
  this.angularSpeed = 0;
  this.rotationTime = 0;
  this.expandTick = 0;
  this.shrinkTick = 0;
  this.curSize = this.sizeAmount;
  this.shrinkStartSize = this.sizeAmount;
  this.handleResize();
  webglCallbackHandler.registerEngineObject(this);
}

Crosshair.prototype.onTextureAtlasRefreshed = function(){
  this.mesh.material.uniforms.texture = textureAtlasHandler.getTextureUniform();
  var newRanges = textureAtlasHandler.getRangesForTexturePack(texturePacks[this.configurations.texture], "diffuse");
  this.mesh.material.uniforms.uvRanges.value.set(newRanges.startU, newRanges.startV, newRanges.endU, newRanges.endV);
}

Crosshair.prototype.export = function(){
  return this.configurations;
}

Crosshair.prototype.clone = function(){
  return new Crosshair(this.configurations);
}

Crosshair.prototype.update = function(){
  this.rotationTime += (STEP);
  this.expandTick ++;
  this.shrinkTick ++;
  if (this.rotationTime > DEFAULT_MAX_PS_TIME){
    this.rotationTime = 0;
  }
  if (this.expandTick > DEFAULT_MAX_PS_TIME){
    this.expandTick = 0;
  }
  if (this.shrinkTick > DEFAULT_MAX_PS_TIME){
    this.shrinkTick = 0;
  }

  if(this.angularSpeed != 0){
    this.texture.rotation = (this.rotationTime * this.angularSpeed);
    this.texture.updateMatrix();
    this.mesh.material.uniforms.uvTransform.value.copy(this.texture.matrix);
  }
  if (this.expand){
    this.mesh.material.uniforms.expandInfo.value.set(10, this.expandTargetSize, this.expandTick, this.expandDelta);
    this.curSize = this.sizeAmount + (this.expandDelta * this.expandTick);
    if (this.curSize > this.expandTargetSize){
      this.curSize = this.expandTargetSize;
    }
  }else if (this.shrink){
    this.mesh.material.uniforms.expandInfo.value.set(-10, 0, this.shrinkTick, this.expandDelta);
    this.curSize = this.shrinkStartSize - (this.expandDelta * this.shrinkTick);
    if (this.curSize < this.sizeAmount){
      this.curSize = this.sizeAmount;
    }
  }
}

Crosshair.prototype.resetRotation = function(){
  this.texture.rotation = 0;
  this.texture.updateMatrix();
  this.mesh.material.uniforms.uvTransform.value.copy(this.texture.matrix);
}

Crosshair.prototype.destroy = function(destroyMesh){
  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
  this.texture.dispose();
  if (destroyMesh){
    this.mesh = 0;
    scene.remove(this.mesh);
  }else{
    this.mesh.visible = false;
  }
}

Crosshair.prototype.debugCornerPoints = function(representativeCharacter, cornerIndex){
  var cSizeX = (this.sizeAmount * 5 / (renderer.getCurrentViewport().z / screenResolution));
  var cSizeY = (this.sizeAmount * 5) / (renderer.getCurrentViewport().w / screenResolution);
  if (cornerIndex == 0){
    representativeCharacter.setShaderMargin(true, -cSizeX);
    representativeCharacter.setShaderMargin(false, cSizeY);
  }else{
    representativeCharacter.setShaderMargin(true, cSizeX);
    representativeCharacter.setShaderMargin(false, -cSizeY);
  }
}

Crosshair.prototype.handleResize = function(){
  if (this.mesh.material.uniforms.sizeScale){
    this.mesh.material.uniforms.sizeScale.value = 1;
  }
  var cSizeX = (this.sizeAmount * 5 / (renderer.getCurrentViewport().z / screenResolution));
  var cSizeY = (this.sizeAmount * 5) / (renderer.getCurrentViewport().w / screenResolution);
  if (!(typeof this.maxWidthPercent == UNDEFINED)){
    var widthPercent = 100 * cSizeX / 2;
    if (widthPercent > this.maxWidthPercent){
      this.mesh.material.uniforms.sizeScale.value = ((2 * this.maxWidthPercent / 100) * ((renderer.getCurrentViewport().z / screenResolution)) / 5) / this.sizeAmount;
    }
  }
  if (!(typeof this.maxHeightPercent == UNDEFINED)){
    var heightPercent = 100 * cSizeY / 2;
    if (heightPercent > this.maxHeightPercent){
      this.mesh.material.uniforms.sizeScale.value = ((2 * this.maxHeightPercent / 100) * ((renderer.getCurrentViewport().w / screenResolution)) / 5) / this.sizeAmount;
    }
  }
}
