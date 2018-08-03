var Crosshair = function(configurations){
  var name = configurations.name;
  var texture = configurations.texture;
  var colorR = configurations.colorR;
  var colorB = configurations.colorB;
  var colorG = configurations.colorG;
  var alpha = configurations.alpha;
  var size = configurations.size;

  this.colors = new Float32Array(4);
  this.size = new Float32Array(1);
  this.colors[0] = colorR;
  this.colors[1] = colorG;
  this.colors[2] = colorB;
  this.colors[3] = alpha;
  this.size[0] = size;


  this.colorsBufferAttribute = new THREE.BufferAttribute(this.colors, 4);
  this.sizeBufferAttribute = new THREE.BufferAttribute(this.size, 1);
  this.colorsBufferAttribute.setDynamic(false);
  this.sizeBufferAttributes.setDynamic(false);

  this.geometry = new THREE.BufferGeometry();
  this.geometry.addAttribute("color", this.colorsBufferAttribute);
  this.geometry.addAttribute("size", this.sizeBufferAttribute);

  this.material = new THREE.RawShaderMaterial({
    vertexShader: ShaderContent.crossHairVertexShader,
    fragmentShader: ShaderContent.crossHairFragmentShader,
    vertexColors: THREE.VertexColors,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      time: 0.0
    }
  });
  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.position.set(0, 0, 0);
  this.mesh.frustumCulled = false;
  this.mesh.visible = false;

  previewScene.add(this.mesh);
}
