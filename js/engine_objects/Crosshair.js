var Crosshair = function(configurations){

  var name = configurations.name;
  var texture = configurations.texture;
  var colorR = configurations.colorR;
  var colorB = configurations.colorB;
  var colorG = configurations.colorG;
  var alpha = configurations.alpha;
  var size = configurations.size;

  this.name = name;

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
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      time: 0.0,
      texture: new THREE.Uniform(texture),
      color: new THREE.Uniform(new THREE.Vector4(colorR, colorG, colorB, alpha))
    }
  });
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.position.set(0, 0, 0);
  this.mesh.frustumCulled = false;
  this.mesh.visible = false;

  previewScene.add(this.mesh);

  crosshairs[this.name] = this;

}

Crosshair.prototype.destroy = function(){
  this.mesh.visible = false;
  this.mesh.geometry.dispose();
  this.mesh.material.dispose();
  this.mesh = 0;
}
