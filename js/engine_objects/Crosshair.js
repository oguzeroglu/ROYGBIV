var Crosshair = function(configurations){

  var name = configurations.name;
  var texture = configurations.texture;
  var colorR = configurations.colorR;
  var colorB = configurations.colorB;
  var colorG = configurations.colorG;
  var alpha = configurations.alpha;
  var size = configurations.size;

  this.texture = texture;
  this.name = name;
  this.sizeAmount = size;

  this.size = new Float32Array(1);
  this.size[0] = size;


  this.sizeBufferAttribute = new THREE.BufferAttribute(this.size, 1);
  this.sizeBufferAttribute.setDynamic(false);

  this.geometry = new THREE.BufferGeometry();
  this.geometry.addAttribute("size", this.sizeBufferAttribute);
  this.geometry.setDrawRange(0, 1);

  this.material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.crossHairVertexShader,
    fragmentShader: ShaderContent.crossHairFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      texture: new THREE.Uniform(texture),
      color: new THREE.Uniform(new THREE.Vector4(colorR, colorG, colorB, alpha)),
      uvTransform: new THREE.Uniform(new THREE.Matrix3()),
      expandInfo: new THREE.Uniform(new THREE.Vector4(0, 0, 0, 0)),
      shrinkStartSize: new THREE.Uniform(size)
    }
  });
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.position.set(0, 0, 0);
  this.mesh.frustumCulled = false;
  this.mesh.visible = false;

  scene.add(this.mesh);

  crosshairs[this.name] = this;

  this.texture.center.set(0.5, 0.5);
  this.angularSpeed = 0;
  this.rotationTime = 0;
  this.expandTick = 0;
  this.shrinkTick = 0;
  this.curSize = this.sizeAmount;
  this.shrinkStartSize = this.sizeAmount;
}

Crosshair.prototype.update = function(){
  this.rotationTime += (1/60);
  this.expandTick ++;
  this.shrinkTick ++;
  if (this.rotationTime > MAX_PS_TIME){
    this.rotationTime = 0;
  }
  if (this.expandTick > MAX_PS_TIME){
    this.expandTick = 0;
  }
  if (this.shrinkTick > MAX_PS_TIME){
    this.shrinkTick = 0;
  }

  if(this.angularSpeed != 0){
    this.texture.rotation = (this.rotationTime * this.angularSpeed);
    this.texture.updateMatrix();
    this.material.uniforms.uvTransform.value.copy(this.texture.matrix);
  }
  if (this.expand){
    this.material.uniforms.expandInfo.value.set(10, this.expandTargetSize, this.expandTick, this.expandDelta);
    this.curSize = this.sizeAmount + (this.expandDelta * this.expandTick);
    if (this.curSize > this.expandTargetSize){
      this.curSize = this.expandTargetSize;
    }
  }else if (this.shrink){
    this.material.uniforms.expandInfo.value.set(-10, 0, this.shrinkTick, this.expandDelta);
    this.curSize = this.shrinkStartSize - (this.expandDelta * this.shrinkTick);
    if (this.curSize < this.sizeAmount){
      this.curSize = this.sizeAmount;
    }
  }
}

Crosshair.prototype.resetRotation = function(){
  this.texture.rotation = 0;
  this.texture.updateMatrix();
  this.material.uniforms.uvTransform.value.copy(this.texture.matrix);
}

Crosshair.prototype.destroy = function(){
  this.mesh.visible = false;
  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
  this.mesh = 0;
}
