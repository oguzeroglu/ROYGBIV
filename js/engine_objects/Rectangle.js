var Rectangle = function(x, y, width, height){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.finalX = x + width;
  this.finalY = y + height;
}
Rectangle.prototype.set = function(x, y, x2, y2, width, height){
  this.x = x;
  this.y = y;
  this.finalX = x2;
  this.finalY = y2;
  this.width = width,
  this.height = height;
  return this;
}
Rectangle.prototype.handlePositionUniform = function(thicknessOffset){
  var positions = this.material.uniforms.positions.value;
  var tox, toy;
  var curvp = renderer.getCurrentViewport();
  if (curvp.z > curvp.w){
    tox = thicknessOffset;
    toy = thicknessOffset * camera.aspect;
  }else{
    tox = thicknessOffset * camera.aspect;
    toy = thicknessOffset;
  }
  // UP
  positions[0].x = this.x - tox;
  positions[0].y = this.y;
  positions[1].x = this.finalX + tox;
  positions[1].y = this.y;
  positions[2].x = this.finalX + tox;
  positions[2].y = this.y + toy;
  positions[3].x = this.finalX + tox;
  positions[3].y = this.y + toy;
  positions[4].x = this.x - tox;
  positions[4].y = this.y + toy;
  positions[5].x = this.x - tox;
  positions[5].y = this.y;
  // RIGHT
  positions[6].x = this.finalX;
  positions[6].y = this.y;
  positions[7].x = this.finalX;
  positions[7].y = this.finalY;
  positions[8].x = this.finalX + tox;
  positions[8].y = this.finalY;
  positions[9].x = this.finalX + tox;
  positions[9].y = this.finalY;
  positions[10].x = this.finalX + tox;
  positions[10].y = this.y;
  positions[11].x = this.finalX;
  positions[11].y = this.y;
  // DOWN
  positions[12].x = this.x - tox;
  positions[12].y = this.finalY;
  positions[13].x = this.finalX + tox;
  positions[13].y = this.finalY;
  positions[14].x = this.finalX + tox;
  positions[14].y = this.finalY - toy;
  positions[15].x = this.finalX + tox;
  positions[15].y = this.finalY - toy;
  positions[16].x = this.x - tox;
  positions[16].y = this.finalY - toy;
  positions[17].x = this.x - tox;
  positions[17].y = this.finalY;
  // LEFT
  positions[18].x = this.x - tox;
  positions[18].y = this.y;
  positions[19].x = this.x - tox;
  positions[19].y = this.finalY;
  positions[20].x = this.x;
  positions[20].y = this.finalY;
  positions[21].x = this.x;
  positions[21].y = this.finalY;
  positions[22].x = this.x;
  positions[22].y = this.y;
  positions[23].x = this.x - tox;
  positions[23].y = this.y;
}

Rectangle.prototype.getGeometry = function(){
  var geom = geometryCache["RECTANGLE_GEOMETRY"];
  if (geom){
    return geom;
  }
  geom = new THREE.BufferGeometry();
  var rectangleIndices = new Float32Array(24);
  for (var i = 0; i<24; i++){
    rectangleIndices[i] = i;
  }
  var indicesBufferAttribute = new THREE.BufferAttribute(rectangleIndices, 1);
  indicesBufferAttribute.setDynamic(false);
  geom.addAttribute('rectangleIndex', indicesBufferAttribute);
  geom.setDrawRange(0, 24);
  geometryCache["RECTANGLE_GEOMETRY"] = geom;
  return geom;
}

Rectangle.prototype.updateMesh = function(thicknessOffset, force){
  if (isDeployment && !force){
    return;
  }
  if (!this.mesh){
    this.geometry = this.getGeometry();
    var positions = [];
    for (var i = 0; i<24; i++){
      positions.push(new THREE.Vector2());
    }
    this.material = new THREE.RawShaderMaterial({
      vertexShader: ShaderContent.rectangleVertexShader,
      fragmentShader: ShaderContent.rectangleFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        color: new THREE.Uniform(new THREE.Color("yellow")),
        alpha: new THREE.Uniform(1.0),
        positions: new THREE.Uniform(positions)
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = renderOrders.RECTANGLE;
  }
  this.handlePositionUniform(thicknessOffset);
  this.thicknessOffset = thicknessOffset;
}
Rectangle.prototype.fits = function(texture){
  var tw = texture.image.width;
  var th = texture.image.height;
  if (tw <= this.width && th <= this.height){
    return true;
  }
  return false;
}
Rectangle.prototype.fitsPerfectly = function(texture){
  var tw = texture.image.width;
  var th = texture.image.height;
  return (tw == this.width) && (th == this.height);
}
Rectangle.prototype.overlaps = function(rect){
  return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y;
}
